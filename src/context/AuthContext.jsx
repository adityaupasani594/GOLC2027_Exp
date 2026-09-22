import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { progressService } from '../services/progressService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [certificates, setCertificates] = useState({});
  const [reports, setReports] = useState({});

  // Helper to load user-associated progress, certificates, and reports
  const syncUserData = async (uid) => {
    if (!uid) {
      setProgress(null);
      setCertificates({});
      setReports({});
      return;
    }

    try {
      const [prog, certs, reps] = await Promise.all([
        progressService.getUserProgress(uid),
        progressService.getUserCertificates(uid),
        progressService.getUserReports(uid)
      ]);
      setProgress(prog);
      setCertificates(certs || {});
      setReports(reps || {});
    } catch (err) {
      console.warn('Error syncing user data from storage:', err);
    }
  };

  // Subscribe to auth changes (Firebase listener or localStorage initial session)
  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges(async (activeUser) => {
      setUser(activeUser);
      if (activeUser) {
        await syncUserData(activeUser.uid);
      } else {
        setProgress(null);
        setCertificates({});
        setReports({});
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const clearError = () => setError(null);

  const login = async (emailOrUsername, password) => {
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await authService.loginWithEmail(emailOrUsername, password);
      setUser(loggedUser);
      await syncUserData(loggedUser.uid);
      return loggedUser;
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await authService.registerUser(userData);
      setUser(newUser);
      await syncUserData(newUser.uid);
      return newUser;
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const googleUser = await authService.signInWithGoogle();
      setUser(googleUser);
      await syncUserData(googleUser.uid);
      return googleUser;
    } catch (err) {
      setError(err.message || 'Google sign-in encountered an issue.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setProgress(null);
      setCertificates({});
      setReports({});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const recordQuizScore = async (expNumber, score, total) => {
    if (!user) return;
    const updated = await progressService.saveQuizScore(user.uid, expNumber, score, total);
    setProgress(updated);
  };

  const recordExpCompleted = async (expNumber, details) => {
    if (!user) return;
    const updated = await progressService.saveExperimentProgress(user.uid, expNumber, details);
    setProgress(updated);
  };

  const recordCertificate = async (certData) => {
    if (!user) return;
    const updatedCerts = await progressService.saveCertificate(user.uid, {
      studentName: user.displayName || `${user.firstName} ${user.lastName}`.trim(),
      institution: user.institution,
      ...certData
    });
    setCertificates(updatedCerts);
  };

  const recordReport = async (reportData) => {
    if (!user) return;
    const updatedReports = await progressService.saveReport(user.uid, {
      studentName: user.displayName || `${user.firstName} ${user.lastName}`.trim(),
      institution: user.institution,
      ...reportData
    });
    setReports(updatedReports);
  };

  const updateUserProfile = async (updates) => {
    if (!user) return;
    const updated = await authService.updateUserProfile(updates);
    setUser(updated);
    return updated;
  };

  const reloadUserData = async () => {
    if (user?.uid) {
      await syncUserData(user.uid);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    error,
    clearError,
    login,
    register,
    loginWithGoogle,
    logout,
    progress,
    certificates,
    reports,
    recordQuizScore,
    recordExpCompleted,
    recordCertificate,
    recordReport,
    updateUserProfile,
    reloadUserData,
    isFirebaseConfigured: authService.isUsingFirebase(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
