/**
 * Student Progress & Certification Service
 * 
 * Synchronizes laboratory progress, quiz scores, certificates, and lab reports
 * to Cloud Firestore (`users/{uid}/progress/current`, `users/{uid}/certificates`, `users/{uid}/reports`)
 * with instant LocalStorage offline fallback.
 */

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const PROGRESS_STORAGE_PREFIX = 'ir_lab_progress_';
const CERTIFICATES_STORAGE_PREFIX = 'ir_lab_certificates_';
const REPORTS_STORAGE_PREFIX = 'ir_lab_reports_';

const isLive = () => isFirebaseConfigured() && Boolean(db);

/**
 * Safely strips undefined values so Firestore does not throw Unsupported Field Value errors
 */
const sanitizeForFirestore = (val) => {
  if (val === undefined) return null;
  if (val === null || typeof val !== 'object') return val;
  if (Array.isArray(val)) return val.map(sanitizeForFirestore);
  const result = {};
  for (const [k, v] of Object.entries(val)) {
    if (v !== undefined) {
      result[k] = sanitizeForFirestore(v);
    }
  }
  return result;
};

export const progressService = {
  /**
   * Get all recorded progress for a specific user ID
   */
  getUserProgress: async (uid) => {
    if (!uid) return {};

    // 1. Check local cache first for snappy UI
    let localData = null;
    try {
      const raw = localStorage.getItem(`${PROGRESS_STORAGE_PREFIX}${uid}`);
      if (raw) localData = JSON.parse(raw);
    } catch (e) {
      console.warn('Could not read local progress cache:', e);
    }

    // 2. If live Firebase Firestore is active, fetch latest from Firestore
    if (isLive()) {
      try {
        const progressDocRef = doc(db, 'users', uid, 'progress', 'current');
        const snap = await getDoc(progressDocRef);
        if (snap.exists()) {
          const remoteData = snap.data();
          // Merge and update local cache
          const merged = { ...localData, ...remoteData };
          localStorage.setItem(`${PROGRESS_STORAGE_PREFIX}${uid}`, JSON.stringify(merged));
          return merged;
        }
      } catch (err) {
        console.warn('[Firebase] Failed to fetch Firestore progress:', err);
      }
    }

    // 3. Fallback or initial clean progress for new user
    return (
      localData || {
        completedExperiments: [],
        quizScores: {},
        certificates: {},
        lastActiveExp: 1,
        updatedAt: new Date().toISOString()
      }
    );
  },

  /**
   * Synchronous quick accessor for initial render
   */
  getUserProgressSync: (uid) => {
    if (!uid) return {};
    try {
      const raw = localStorage.getItem(`${PROGRESS_STORAGE_PREFIX}${uid}`);
      return raw ? JSON.parse(raw) : {
        completedExperiments: [],
        quizScores: {},
        certificates: {},
        lastActiveExp: 1,
        updatedAt: new Date().toISOString()
      };
    } catch {
      return {};
    }
  },

  /**
   * Record completion or state of an experiment
   */
  saveExperimentProgress: async (uid, expNumber, details = {}) => {
    if (!uid) return null;
    const current = progressService.getUserProgressSync(uid);
    const completedSet = new Set(current.completedExperiments || []);
    completedSet.add(expNumber);

    const updated = {
      ...current,
      completedExperiments: Array.from(completedSet),
      lastActiveExp: expNumber,
      updatedAt: new Date().toISOString(),
      details: {
        ...(current.details || {}),
        [expNumber]: {
          ...(current.details?.[expNumber] || {}),
          ...details,
          timestamp: new Date().toISOString()
        }
      }
    };

    localStorage.setItem(`${PROGRESS_STORAGE_PREFIX}${uid}`, JSON.stringify(updated));

    if (isLive()) {
      try {
        const progressDocRef = doc(db, 'users', uid, 'progress', 'current');
        await setDoc(progressDocRef, sanitizeForFirestore(updated), { merge: true });
        console.info(`[Firebase] Successfully synced Experiment ${expNumber} progress to Firestore.`);
      } catch (err) {
        console.error('[Firebase] Could not sync experiment completion to Firestore:', err);
      }
    }

    return updated;
  },

  /**
   * Save Quiz Score for an experiment
   */
  saveQuizScore: async (uid, expNumber, score, total) => {
    if (!uid) return null;
    const current = progressService.getUserProgressSync(uid);
    const pct = total > 0 ? Math.round((score / total) * 100) : 100;

    const updated = {
      ...current,
      quizScores: {
        ...(current.quizScores || {}),
        [expNumber]: { score, total, pct, date: new Date().toISOString() }
      },
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`${PROGRESS_STORAGE_PREFIX}${uid}`, JSON.stringify(updated));

    if (isLive()) {
      try {
        const progressDocRef = doc(db, 'users', uid, 'progress', 'current');
        await setDoc(progressDocRef, sanitizeForFirestore(updated), { merge: true });
        console.info(`[Firebase] Successfully synced Exp ${expNumber} quiz score (${score}/${total}) to Firestore.`);
      } catch (err) {
        console.error('[Firebase] Could not sync quiz score to Firestore:', err);
      }
    }

    return updated;
  },

  /**
   * Save an issued certificate
   */
  saveCertificate: async (uid, certData) => {
    if (!uid || !certData) return null;
    const expNum = certData.expNumber || 15;
    const certKey = `exp_${expNum}`;

    let localCerts = {};
    try {
      const raw = localStorage.getItem(`${CERTIFICATES_STORAGE_PREFIX}${uid}`);
      if (raw) localCerts = JSON.parse(raw);
    } catch {}

    const updatedCerts = {
      ...localCerts,
      [certKey]: {
        ...certData,
        expNumber: expNum,
        issuedAt: certData.issuedAt || new Date().toISOString()
      }
    };

    localStorage.setItem(`${CERTIFICATES_STORAGE_PREFIX}${uid}`, JSON.stringify(updatedCerts));

    if (isLive()) {
      try {
        const certDocRef = doc(db, 'users', uid, 'certificates', certKey);
        await setDoc(certDocRef, sanitizeForFirestore(updatedCerts[certKey]), { merge: true });
        console.info(`[Firebase] Successfully synced Exp ${expNum} certificate to Firestore.`);
      } catch (err) {
        console.error('[Firebase] Could not sync certificate to Firestore:', err);
      }
    }

    return updatedCerts;
  },

  /**
   * Get all certificates issued for user
   */
  getUserCertificates: async (uid) => {
    if (!uid) return {};
    let localCerts = {};
    try {
      const raw = localStorage.getItem(`${CERTIFICATES_STORAGE_PREFIX}${uid}`);
      if (raw) localCerts = JSON.parse(raw);
    } catch {}

    if (isLive()) {
      try {
        const certsColRef = collection(db, 'users', uid, 'certificates');
        const querySnap = await getDocs(certsColRef);
        const remoteCerts = {};
        querySnap.forEach((d) => {
          remoteCerts[d.id] = d.data();
        });

        const merged = { ...localCerts, ...remoteCerts };
        localStorage.setItem(`${CERTIFICATES_STORAGE_PREFIX}${uid}`, JSON.stringify(merged));
        return merged;
      } catch (err) {
        console.warn('[Firebase] Failed to fetch certificates collection:', err);
      }
    }

    return localCerts;
  },

  /**
   * Save a generated/submitted lab report
   */
  saveReport: async (uid, reportData) => {
    if (!uid || !reportData) return null;
    const expNum = reportData.expNumber || 15;
    const reportKey = `exp_${expNum}`;

    let localReports = {};
    try {
      const raw = localStorage.getItem(`${REPORTS_STORAGE_PREFIX}${uid}`);
      if (raw) localReports = JSON.parse(raw);
    } catch {}

    const updatedReports = {
      ...localReports,
      [reportKey]: {
        ...reportData,
        expNumber: expNum,
        submittedAt: reportData.submittedAt || new Date().toISOString()
      }
    };

    localStorage.setItem(`${REPORTS_STORAGE_PREFIX}${uid}`, JSON.stringify(updatedReports));

    if (isLive()) {
      try {
        const reportDocRef = doc(db, 'users', uid, 'reports', reportKey);
        await setDoc(reportDocRef, sanitizeForFirestore(updatedReports[reportKey]), { merge: true });
        console.info(`[Firebase] Successfully synced Exp ${expNum} lab report to Firestore.`);
      } catch (err) {
        console.error('[Firebase] Could not sync lab report to Firestore:', err);
      }
    }

    return updatedReports;
  },

  /**
   * Get all lab reports for user
   */
  getUserReports: async (uid) => {
    if (!uid) return {};
    let localReports = {};
    try {
      const raw = localStorage.getItem(`${REPORTS_STORAGE_PREFIX}${uid}`);
      if (raw) localReports = JSON.parse(raw);
    } catch {}

    if (isLive()) {
      try {
        const reportsColRef = collection(db, 'users', uid, 'reports');
        const querySnap = await getDocs(reportsColRef);
        const remoteReports = {};
        querySnap.forEach((d) => {
          remoteReports[d.id] = d.data();
        });

        const merged = { ...localReports, ...remoteReports };
        localStorage.setItem(`${REPORTS_STORAGE_PREFIX}${uid}`, JSON.stringify(merged));
        return merged;
      } catch (err) {
        console.warn('[Firebase] Failed to fetch lab reports collection:', err);
      }
    }

    return localReports;
  },

  /**
   * Get number of completed experiments
   */
  getCompletedCount: (uid) => {
    const progress = progressService.getUserProgressSync(uid);
    return (progress.completedExperiments || []).length;
  }
};
