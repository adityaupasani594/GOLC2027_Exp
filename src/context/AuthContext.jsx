import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { progressService } from '../services/progressService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  // Initialize active session on mount
  useEffect(() => {
    try {
      const activeUser = authService.getCurrentUser();
      if (activeUser) {
        setUser(activeUser);
        setProgress(progressService.getUserProgress(activeUser.uid));
      }
    } catch (err) {
      console.error('Error initializing auth session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  const login = async (emailOrUsername, password) => {
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await authService.loginWithEmail(emailOrUsername, password);
      setUser(loggedUser);
      setProgress(progressService.getUserProgress(loggedUser.uid));
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
      setProgress(progressService.getUserProgress(newUser.uid));
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
      setProgress(progressService.getUserProgress(googleUser.uid));
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
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const recordQuizScore = (expNumber, score, total) => {
    if (!user) return;
    const updated = progressService.saveQuizScore(user.uid, expNumber, score, total);
    setProgress(updated);
  };

  const recordExpCompleted = (expNumber, details) => {
    if (!user) return;
    const updated = progressService.saveExperimentProgress(user.uid, expNumber, details);
    setProgress(updated);
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
    recordQuizScore,
    recordExpCompleted,
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
