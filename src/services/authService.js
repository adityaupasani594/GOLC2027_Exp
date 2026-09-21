/**
 * Authentication Service
 * 
 * Abstracted authentication layer. Currently runs in mock mode backed by
 * localStorage so the entire login, registration, and Google sign-in workflows
 * are fully testable immediately.
 * 
 * When ready to enable live Firebase Auth:
 * - Initialize Firebase Auth in `firebase.js`
 * - Replace mock methods with `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`,
 *   and `signInWithPopup(auth, new GoogleAuthProvider())`.
 */

import { isFirebaseConfigured } from './firebase';

const USERS_STORAGE_KEY = 'ir_lab_registered_users';
const CURRENT_USER_STORAGE_KEY = 'ir_lab_current_user';

// Helper: load mock registered users database from localStorage
const getRegisteredUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Helper: save mock users database
const saveRegisteredUsers = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users to localStorage', err);
  }
};

// Seed a default demo student account if empty
const seedDemoUserIfEmpty = () => {
  const users = getRegisteredUsers();
  if (users.length === 0) {
    const demoUser = {
      uid: 'demo-student-001',
      firstName: 'Aarav',
      lastName: 'Sharma',
      username: 'aarav_sharma',
      email: 'aarav.sharma@ves.ac.in',
      password: 'Password@123',
      institution: "VESIT - Dept. of Computer Engineering",
      createdAt: new Date().toISOString(),
      avatarUrl: null
    };
    saveRegisteredUsers([demoUser]);
  }
};

seedDemoUserIfEmpty();

export const authService = {
  /**
   * Check if Firebase is currently connected
   */
  isUsingFirebase: () => isFirebaseConfigured(),

  /**
   * Get the active logged in session
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
   * Sign In with Username or Email and Password
   */
  loginWithEmail: async (emailOrUsername, password) => {
    // Simulated network latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const identifier = emailOrUsername.trim().toLowerCase();
    const users = getRegisteredUsers();

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === identifier ||
        u.username.toLowerCase() === identifier
    );

    if (!user) {
      throw new Error('No account found with this email or username. Please check your credentials or register.');
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
      institution: user.institution || "VESIT - Dept. of Computer Engineering",
      avatarUrl: user.avatarUrl || null,
      provider: 'credentials'
    };

    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  /**
   * Register a new Student Account
   */
  registerUser: async ({ firstName, lastName, username, email, password }) => {
    await new Promise((resolve) => setTimeout(resolve, 750));

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    const users = getRegisteredUsers();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      throw new Error('This username is already taken. Please choose another username.');
    }

    const newUser = {
      uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: password,
      institution: "VESIT - Dept. of Computer Engineering",
      createdAt: new Date().toISOString(),
      avatarUrl: null
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    const sessionUser = {
      uid: newUser.uid,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      displayName: `${newUser.firstName} ${newUser.lastName}`.trim(),
      username: newUser.username,
      email: newUser.email,
      institution: newUser.institution,
      avatarUrl: null,
      provider: 'credentials'
    };

    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  /**
   * Sign In / Sign Up with Google
   */
  signInWithGoogle: async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulated Google OAuth response
    // When Firebase is integrated, replace with:
    // const provider = new GoogleAuthProvider();
    // const result = await signInWithPopup(auth, provider);
    const googleUser = {
      uid: `google_${Date.now()}`,
      firstName: 'Student',
      lastName: 'Scholar',
      displayName: 'Student Scholar',
      username: 'vesit_scholar',
      email: 'student.scholar@ves.ac.in',
      institution: 'VESIT - Dept. of Computer Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      provider: 'google.com'
    };

    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(googleUser));
    return googleUser;
  },

  /**
   * Sign Out
   */
  logout: async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
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
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updated));

    // Also update in registered users database if exists
    const users = getRegisteredUsers();
    const index = users.findIndex((u) => u.uid === current.uid);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      saveRegisteredUsers(users);
    }

    return updated;
  }
};
