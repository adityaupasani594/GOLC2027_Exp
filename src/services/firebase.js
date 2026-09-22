/**
 * Firebase Configuration & Service Initialization
 * 
 * Supports both Live Firebase (when environment variables are present in .env)
 * and Graceful Mock Fallback (when keys are missing or offline).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || ""
};

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey.trim() !== "" &&
    !firebaseConfig.apiKey.includes("your-api-key")
  );
};

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    console.info('[Firebase] Connected to live Firebase project:', firebaseConfig.projectId);
  } catch (error) {
    console.warn('[Firebase] Initialization error, falling back to local storage:', error);
  }
} else {
  console.info('[Firebase] No VITE_FIREBASE_* credentials detected. Running in Local Storage Fallback mode.');
}

export { app, auth, db, googleProvider };
