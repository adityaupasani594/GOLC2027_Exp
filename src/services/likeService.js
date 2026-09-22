/**
 * Experiment Like Service
 * 
 * Synchronizes experiment likes to Cloud Firestore (`experiment_likes/{expId}`,
 * `experiment_likes/{expId}/user_likes/{userId}`, and `users/{userId}/likes/{expId}`)
 * with instant optimistic updates and local storage fallback.
 */

import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const LIKES_CACHE_KEY = 'ir_lab_experiment_likes';
const USER_LIKES_PREFIX = 'ir_lab_user_likes_';

const isLive = () => isFirebaseConfigured() && Boolean(db);

// Helper to normalize expId key (e.g. 1 -> "exp-1", "exp-1" -> "exp-1")
export const normalizeExpKey = (id) => {
  if (!id) return 'exp-1';
  return String(id).startsWith('exp-') ? String(id) : `exp-${id}`;
};

// Initial baseline likes so experiments have realistic community appreciation
const BASELINE_LIKES = {
  'exp-1': 14,
  'exp-2': 18,
  'exp-3': 27,
  'exp-4': 22,
  'exp-5': 31,
  'exp-6': 29,
  'exp-7': 35,
  'exp-8': 19,
  'exp-9': 24,
  'exp-10': 16,
  'exp-11': 21,
  'exp-12': 26,
  'exp-13': 33,
  'exp-14': 38,
  'exp-15': 52,
};

// Read cached global counts
const getCachedCounts = () => {
  try {
    const raw = localStorage.getItem(LIKES_CACHE_KEY);
    return raw ? { ...BASELINE_LIKES, ...JSON.parse(raw) } : { ...BASELINE_LIKES };
  } catch {
    return { ...BASELINE_LIKES };
  }
};

// Save cached global counts
const saveCachedCounts = (counts) => {
  try {
    localStorage.setItem(LIKES_CACHE_KEY, JSON.stringify(counts));
  } catch (e) {
    console.warn('Could not cache like counts:', e);
  }
};

// Read user's liked set
const getUserLikedSet = (uid) => {
  if (!uid) return new Set();
  try {
    const raw = localStorage.getItem(`${USER_LIKES_PREFIX}${uid}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

// Save user's liked set
const saveUserLikedSet = (uid, likedSet) => {
  if (!uid) return;
  try {
    localStorage.setItem(
      `${USER_LIKES_PREFIX}${uid}`,
      JSON.stringify(Array.from(likedSet))
    );
  } catch (e) {
    console.warn('Could not cache user likes:', e);
  }
};

// Global rate-limiter & debounced write queue to prevent quota exhaustion
const pendingLikeTimers = {};
let writeCountThisMinute = 0;
let minuteResetTimer = null;

const checkRateLimit = () => {
  if (!minuteResetTimer) {
    minuteResetTimer = setTimeout(() => {
      writeCountThisMinute = 0;
      minuteResetTimer = null;
    }, 60000);
  }
  if (writeCountThisMinute >= 20) {
    console.warn('[Firebase RateLimiter] Firestore write cap reached for this minute (max 20). Keeping state in local cache.');
    return false;
  }
  writeCountThisMinute++;
  return true;
};

export const likeService = {
  /**
   * Get all like counts and user-liked states for all experiments
   */
  getAllLikes: async (uid) => {
    const localCounts = getCachedCounts();
    const userLikedSet = getUserLikedSet(uid);

    if (isLive()) {
      try {
        // Fetch all docs from experiment_likes collection in Firebase
        const colRef = collection(db, 'experiment_likes');
        const snap = await getDocs(colRef);
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && typeof data.count === 'number') {
            localCounts[docSnap.id] = data.count;
          }
        });
        saveCachedCounts(localCounts);

        // If user logged in, fetch user's personal likes from Firestore subcollection
        if (uid) {
          try {
            const userLikesCol = collection(db, 'users', uid, 'likes');
            const userLikesSnap = await getDocs(userLikesCol);
            userLikesSnap.forEach((d) => {
              userLikedSet.add(d.id);
            });
            saveUserLikedSet(uid, userLikedSet);
          } catch (userLikeErr) {
            console.warn('[Firebase] Could not fetch user likes subcollection:', userLikeErr);
          }
        }
      } catch (err) {
        console.warn('[Firebase] Could not fetch experiment_likes collection:', err);
      }
    }

    return { counts: localCounts, userLiked: userLikedSet };
  },

  /**
   * Get synchronously for snappy first render
   */
  getInitialLikesState: (uid) => {
    return {
      counts: getCachedCounts(),
      userLiked: getUserLikedSet(uid)
    };
  },

  /**
   * Toggle like state for a specific experiment
   * @param {string|number} expId - Experiment number or string id
   * @param {object} user - Current authenticated user
   */
  toggleLike: async (expId, user) => {
    const key = normalizeExpKey(expId);
    const uid = user?.uid || user?.id || 'guest';
    const counts = getCachedCounts();
    const userLikedSet = getUserLikedSet(uid);

    const isCurrentlyLiked = userLikedSet.has(key);
    const newIsLiked = !isCurrentlyLiked;
    const delta = newIsLiked ? 1 : -1;

    // Optimistic local update
    const currentCount = counts[key] !== undefined ? counts[key] : (BASELINE_LIKES[key] || 0);
    const updatedCount = Math.max(0, currentCount + delta);
    counts[key] = updatedCount;

    if (newIsLiked) {
      userLikedSet.add(key);
    } else {
      userLikedSet.delete(key);
    }

    saveCachedCounts(counts);
    saveUserLikedSet(uid, userLikedSet);

    // Broadcast change to all listening components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ir-lab-likes-updated', {
          detail: { expKey: key, count: updatedCount, isLiked: newIsLiked, uid }
        })
      );
    }

    // Debounced & Rate-Limited Live Firebase Firestore persistence
    if (isLive()) {
      if (pendingLikeTimers[key]) {
        clearTimeout(pendingLikeTimers[key]);
      }

      pendingLikeTimers[key] = setTimeout(async () => {
        delete pendingLikeTimers[key];
        if (!checkRateLimit()) return;

        try {
          const expDocRef = doc(db, 'experiment_likes', key);

          // 1. Update the aggregated counter in experiment_likes collection
          await setDoc(
            expDocRef,
            {
              experimentKey: key,
              count: increment(delta),
              lastUpdated: serverTimestamp()
            },
            { merge: true }
          );

          // 2. If authenticated, update user_likes subcollection and user's likes subcollection
          if (uid && uid !== 'guest') {
            const userLikeInExpRef = doc(db, 'experiment_likes', key, 'user_likes', uid);
            const userLikeInUserRef = doc(db, 'users', uid, 'likes', key);

            if (newIsLiked) {
              const likePayload = {
                uid,
                experimentKey: key,
                displayName: user.displayName || user.firstName || 'Student',
                email: user.email || '',
                likedAt: serverTimestamp()
              };
              await Promise.allSettled([
                setDoc(userLikeInExpRef, likePayload, { merge: true }),
                setDoc(userLikeInUserRef, likePayload, { merge: true })
              ]);
            } else {
              await Promise.allSettled([
                deleteDoc(userLikeInExpRef),
                deleteDoc(userLikeInUserRef)
              ]);
            }
          }
          console.info(`[Firebase RateLimiter] Experiment ${key} like status synced to Firestore.`);
        } catch (err) {
          console.warn('[Firebase] Failed to persist like to Firestore, kept in local cache:', err);
        }
      }, 600); // 600ms debounce
    }

    return { isLiked: newIsLiked, count: updatedCount };
  }
};
