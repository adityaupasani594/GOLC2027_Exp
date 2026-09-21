/**
 * Student Progress Service
 * 
 * Manages experiment completion, quiz results, and certification history.
 * Structured to map 1:1 with Firestore collection `users/{uid}/progress` in the future.
 */

const PROGRESS_STORAGE_PREFIX = 'ir_lab_progress_';

export const progressService = {
  /**
   * Get all recorded progress for a specific user ID
   */
  getUserProgress: (uid) => {
    if (!uid) return {};
    try {
      const raw = localStorage.getItem(`${PROGRESS_STORAGE_PREFIX}${uid}`);
      return raw ? JSON.parse(raw) : {
        completedExperiments: [15], // Exp 15 is active in repo
        quizScores: { 15: 5 },
        certificates: { 15: true },
        lastActiveExp: 15,
        updatedAt: new Date().toISOString()
      };
    } catch {
      return {};
    }
  },

  /**
   * Record completion or state of an experiment
   */
  saveExperimentProgress: (uid, expNumber, details = {}) => {
    if (!uid) return;
    const current = progressService.getUserProgress(uid);
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
    return updated;
  },

  /**
   * Save Quiz Score for an experiment
   */
  saveQuizScore: (uid, expNumber, score, total) => {
    if (!uid) return;
    const current = progressService.getUserProgress(uid);
    const updated = {
      ...current,
      quizScores: {
        ...(current.quizScores || {}),
        [expNumber]: { score, total, date: new Date().toISOString() }
      },
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`${PROGRESS_STORAGE_PREFIX}${uid}`, JSON.stringify(updated));
    return updated;
  },

  /**
   * Get number of completed experiments
   */
  getCompletedCount: (uid) => {
    const progress = progressService.getUserProgress(uid);
    return (progress.completedExperiments || []).length;
  }
};
