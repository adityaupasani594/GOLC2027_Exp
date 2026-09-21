/**
 * Firebase Configuration & Initialization Stub
 * 
 * To connect your Firebase project:
 * 1. Install firebase: `npm install firebase`
 * 2. Create a `.env` file in the project root with your credentials:
 *    VITE_FIREBASE_API_KEY=your-api-key
 *    VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain.firebaseapp.com
 *    VITE_FIREBASE_PROJECT_ID=your-project-id
 *    VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket.appspot.com
 *    VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
 *    VITE_FIREBASE_APP_ID=your-app-id
 * 
 * The authentication and progress services (`src/services/authService.js` and
 * `src/services/progressService.js`) are decoupled and ready to connect here.
 */

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
    firebaseConfig.apiKey !== ""
  );
};
