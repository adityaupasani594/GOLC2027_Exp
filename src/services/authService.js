/**
 * Authentication Service
 * 
 * Supports:
 * 1. Live Firebase Authentication (Email/Password & Google Sign-In with Firestore Profile Sync)
 * 2. Fallback local persistence when running offline
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from './firebase';

const USERS_STORAGE_KEY = 'ir_lab_registered_users';
const CURRENT_USER_STORAGE_KEY = 'ir_lab_current_user';

// ── LocalStorage Helpers ─────────────────────────────────────────────────────
const getRegisteredUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRegisteredUsers = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users to localStorage', err);
  }
};

// ── Auth Service Implementation ──────────────────────────────────────────────
export const authService = {
  /**
   * Returns true if live Firebase credentials are active
   */
  isUsingFirebase: () => isFirebaseConfigured() && Boolean(auth),

  /**
   * Listen to Firebase auth state changes
   */
  subscribeToAuthChanges: (callback) => {
    if (authService.isUsingFirebase()) {
      return onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          // Fetch enriched user profile from Firestore
          let profile = null;
          try {
            if (db) {
              const userDocRef = doc(db, 'users', fbUser.uid);
              const snap = await getDoc(userDocRef);
              if (snap.exists()) {
                profile = snap.data();
              }
            }
          } catch (err) {
            console.warn('[Firebase] Could not fetch Firestore user profile, using Auth claims:', err);
          }

          const sessionUser = {
            uid: fbUser.uid,
            displayName: fbUser.displayName || profile?.displayName || 'Student Scholar',
            firstName: profile?.firstName || fbUser.displayName?.split(' ')[0] || 'Student',
            lastName: profile?.lastName || fbUser.displayName?.split(' ').slice(1).join(' ') || '',
            email: fbUser.email,
            username: profile?.username || fbUser.email?.split('@')[0] || 'student',
            studentId: profile?.studentId || profile?.username || fbUser.email?.split('@')[0] || '',
            institution: profile?.institution || '',
            avatarUrl: fbUser.photoURL || profile?.avatarUrl || null,
            provider: fbUser.providerData?.[0]?.providerId || 'password',
            createdAt: profile?.createdAt || new Date().toISOString()
          };

          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(sessionUser));
          callback(sessionUser);
        } else {
          // Cleared session
          localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
          callback(null);
        }
      });
    }

    // Fallback: immediate trigger with cached local user
    const localUser = authService.getCurrentUser();
    callback(localUser);
    return () => {};
  },

  /**
   * Get the active logged-in session
   */
  getCurrentUser: () => {
    try {
      const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Sign In with Username/Email and Password
   */
  loginWithEmail: async (emailOrUsername, password) => {
    const identifier = emailOrUsername.trim().toLowerCase();

    // ── LIVE FIREBASE FLOW ──
    if (authService.isUsingFirebase()) {
      let resolvedEmail = identifier;

      // If user passed a username instead of an email
      if (!identifier.includes('@')) {
        if (db) {
          try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', identifier));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
              resolvedEmail = querySnap.docs[0].data().email;
            } else {
              throw new Error(`No account found with username "${identifier}". Please check or use your email.`);
            }
          } catch (lookupErr) {
            console.warn('[Firebase] Username lookup failed, trying as email:', lookupErr);
          }
        }
      }

      const cred = await signInWithEmailAndPassword(auth, resolvedEmail, password);
      const fbUser = cred.user;

      let profileData = {};
      if (db) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            profileData = snap.data();
          }
        } catch (e) {
          console.warn('[Firebase] Could not fetch profile on login:', e);
        }
      }

      const sessionUser = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || profileData.displayName || 'Student Scholar',
        firstName: profileData.firstName || fbUser.displayName?.split(' ')[0] || 'Student',
        lastName: profileData.lastName || fbUser.displayName?.split(' ').slice(1).join(' ') || '',
        email: fbUser.email,
        username: profileData.username || fbUser.email?.split('@')[0] || 'student',
        studentId: profileData.studentId || profileData.username || fbUser.email?.split('@')[0] || '',
        institution: profileData.institution || '',
        avatarUrl: fbUser.photoURL || profileData.avatarUrl || null,
        provider: 'password',
        createdAt: profileData.createdAt || new Date().toISOString()
      };

      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(sessionUser));
      return sessionUser;
    }

    // ── LOCAL FALLBACK FLOW ──
    await new Promise((resolve) => setTimeout(resolve, 500));
    const users = getRegisteredUsers();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === identifier ||
        u.username.toLowerCase() === identifier
    );

    if (!user) {
      throw new Error('No account found with this email or username. Please check your credentials or create an account.');
    }

    if (user.password !== password) {
      throw new Error('Incorrect password. Please verify and try again.');
    }

    const sessionUser = {
      uid: user.uid,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: `${user.firstName} ${user.lastName}`.trim(),
      username: user.username,
      email: user.email,
      studentId: user.studentId || user.username,
      institution: user.institution || '',
      avatarUrl: user.avatarUrl || null,
      provider: 'credentials',
      createdAt: user.createdAt || new Date().toISOString()
    };

    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  /**
   * Register a new Student Account
   */
  registerUser: async ({ firstName, lastName, username, email, password, studentId, institution }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const fullDisplayName = `${cleanFirstName} ${cleanLastName}`.trim();
    const finalInstitution = institution?.trim() || "";
    const finalStudentId = studentId?.trim() || cleanUsername;

    // ── LIVE FIREBASE FLOW ──
    if (authService.isUsingFirebase()) {
      // Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = cred.user;

      // Update Auth Profile display name
      try {
        await updateProfile(fbUser, { displayName: fullDisplayName });
      } catch (err) {
        console.warn('[Firebase] Could not update profile display name:', err);
      }

      // Persist student profile to Firestore
      const userDoc = {
        uid: fbUser.uid,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        displayName: fullDisplayName,
        username: cleanUsername,
        studentId: finalStudentId,
        email: cleanEmail,
        institution: finalInstitution,
        createdAt: new Date().toISOString(),
        provider: 'password',
        avatarUrl: null
      };

      if (db) {
        try {
          await setDoc(doc(db, 'users', fbUser.uid), userDoc, { merge: true });
        } catch (dbErr) {
          console.error('[Firebase] Firestore profile write failed:', dbErr);
        }
      }

      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userDoc));
      return userDoc;
    }

    // ── LOCAL FALLBACK FLOW ──
    await new Promise((resolve) => setTimeout(resolve, 600));
    const users = getRegisteredUsers();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      throw new Error('This username is already taken. Please choose another username.');
    }

    const newUser = {
      uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      displayName: fullDisplayName,
      username: cleanUsername,
      studentId: finalStudentId,
      email: cleanEmail,
      password: password,
      institution: finalInstitution,
      createdAt: new Date().toISOString(),
      avatarUrl: null,
      provider: 'credentials'
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  /**
   * Sign In / Sign Up with Google
   */
  signInWithGoogle: async () => {
    // ── LIVE FIREBASE FLOW ──
    if (authService.isUsingFirebase() && googleProvider) {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;

      let userProfile = null;
      if (db) {
        try {
          const docRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            userProfile = snap.data();
          } else {
            // First time Google sign-in: create Firestore record
            const nameParts = (fbUser.displayName || 'Student Scholar').split(' ');
            userProfile = {
              uid: fbUser.uid,
              firstName: nameParts[0] || 'Student',
              lastName: nameParts.slice(1).join(' ') || '',
              displayName: fbUser.displayName || 'Student Scholar',
              username: fbUser.email?.split('@')[0] || `scholar_${fbUser.uid.slice(0, 5)}`,
              studentId: fbUser.email?.split('@')[0] || '',
              email: fbUser.email,
              institution: '',
              avatarUrl: fbUser.photoURL || null,
              createdAt: new Date().toISOString(),
              provider: 'google.com'
            };
            await setDoc(docRef, userProfile);
          }
        } catch (dbErr) {
          console.warn('[Firebase] Firestore sync error during Google sign-in:', dbErr);
        }
      }

      if (!userProfile) {
        const nameParts = (fbUser.displayName || 'Student Scholar').split(' ');
        userProfile = {
          uid: fbUser.uid,
          firstName: nameParts[0] || 'Student',
          lastName: nameParts.slice(1).join(' ') || '',
          displayName: fbUser.displayName || 'Student Scholar',
          username: fbUser.email?.split('@')[0] || 'scholar',
          studentId: fbUser.email?.split('@')[0] || '',
          email: fbUser.email,
          institution: '',
          avatarUrl: fbUser.photoURL || null,
          createdAt: new Date().toISOString(),
          provider: 'google.com'
        };
      }

      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userProfile));
      return userProfile;
    }

    // ── LOCAL FALLBACK FLOW ──
    await new Promise((resolve) => setTimeout(resolve, 700));
    const googleUser = {
      uid: `google_${Date.now()}`,
      firstName: 'Student',
      lastName: 'Scholar',
      displayName: 'Student Scholar',
      username: 'student_scholar',
      studentId: '',
      email: 'student.scholar@example.edu',
      institution: '',
      avatarUrl: null,
      provider: 'google.com',
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(googleUser));
    return googleUser;
  },

  /**
   * Sign Out
   */
  logout: async () => {
    if (authService.isUsingFirebase()) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('[Firebase] Sign out error:', err);
      }
    }
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    return true;
  },

  /**
   * Update Profile Details
   */
  updateUserProfile: async (updates) => {
    const current = authService.getCurrentUser();
    if (!current) throw new Error('No authenticated user session.');

    const updated = { ...current, ...updates };

    if (authService.isUsingFirebase() && db) {
      try {
        const userRef = doc(db, 'users', current.uid);
        await updateDoc(userRef, updates);
      } catch (err) {
        console.error('[Firebase] Could not update profile in Firestore:', err);
      }
    }

    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updated));

    // Also update in registered users database if in fallback mode
    const users = getRegisteredUsers();
    const index = users.findIndex((u) => u.uid === current.uid);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      saveRegisteredUsers(users);
    }

    return updated;
  }
};
