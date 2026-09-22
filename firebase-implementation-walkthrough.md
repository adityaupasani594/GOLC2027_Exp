# Walkthrough: Firebase Authentication, Lab Progress & Student Profile Integration

We have integrated live Firebase Authentication, Firestore database persistence for student progress, certificates, and reports, and built a comprehensive **Student Profile Modal** accessible directly above the "Sign Out" option in the user menu.

---

## 1. What Was Built & Modified

### 📦 Dependencies Installed
- Added `firebase` (`^11.x`) to [package.json](file:///c:/Users/Yash/Documents/GitHub/GOLC2027_Exp/package.json).

### ⚙️ Core Configuration & Services
1. **[src/services/firebase.js](file:///c:/Users/Yash/Documents/GitHub/GOLC2027_Exp/src/services/firebase.js)**:
   - Initialized Firebase App, Firebase Auth, Cloud Firestore (`db`), and `GoogleAuthProvider`.
   - Included zero-crash fallback detection (`isFirebaseConfigured()`) so local development functions smoothly with local storage until Firebase keys are pasted into `.env`.
2. **[src/services/authService.js](file:///c:/Users/Yash/Documents/GitHub/GOLC2027_Exp/src/services/authService.js)**:
   - Integrated live `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signInWithPopup(auth, googleProvider)`, `signOut`, and `onAuthStateChanged`.
   - Synchronizes student academic profile documents (`users/{uid}`) in Cloud Firestore on registration and Google OAuth sign-in.
   - Preserves localStorage fallback when keys are absent.
3. **[src/services/progressService.js](file:///c:/Users/Yash/Documents/GitHub/GOLC2027_Exp/src/services/progressService.js)**:
   - Implemented real-time synchronization to Firestore:
     - `users/{uid}/progress/current`: tracks completed experiments list, active experiment, and quiz scores.
     - `users/{uid}/certificates/exp_{num}`: stores issued certificate credentials, grade, verification IDs, and dates.
     - `users/{uid}/reports/exp_{num}`: stores laboratory evaluation reports and benchmarks (MRR, MAP, F1, Precision, Recall).
4. **[src/context/AuthContext.jsx](file:///c:/Users/Yash/Documents/GitHub/GOLC2027_Exp/src/context/AuthContext.jsx)**:
   - Wired live `onAuthStateChanged` listener.
   - Exposes `certificates`, `reports`, `recordCertificate()`, `recordReport()`, `updateUserProfile()`, and `reloadUserData()`.

### 🎓 UI & Components
1. **[src/components/profile/StudentProfileModal.jsx](file:///c:/Users/Yash/Documents/GitHub/GOLC2027_Exp/src/components/profile/StudentProfileModal.jsx) (NEW)**:
   - **Student Identity Header**: Initials/Avatar, full name, Student ID / Roll Number, Email, Department, and verified account badge.
   - **Overview & Progress Tab**:
     - Key statistics: Completed Labs (X / 15), Curriculum Rate %, Total Certificates, Total Reports.
     - 4-Track Mastery Matrix: IR Foundations (Exp 1–5), Semantic & Hybrid (Exp 6–7), Knowledge Graphs (Exp 8–13), Evaluation & Benchmarking (Exp 14–15).
     - Direct "Launch Experiment 15" action button.
   - **Certificates Issued Tab**:
     - Displays all earned certificates with Grade badge (A+, A, B), score %, verification ID, and issue date.
     - **Print Certificate** action: Opens a clean, formatted academic certificate ready for printing or saving as PDF.
   - **Lab Reports Tab**:
     - Displays generated evaluation reports with retrieval system benchmark metrics (MRR, Precision, Recall, F1).
     - Link to view full experiment report.
   - **Academic Details Tab**:
     - Allows students to update their Roll Number and Institution Name.
2. **[src/components/common/UserDropdown.jsx](file:///c:/Users/Yash/Documents/GitHub/GOLC2027_Exp/src/components/common/UserDropdown.jsx)**:
   - Added **"View Student Profile"** button placed directly **above the "Sign Out of Lab"** option.
   - Includes user icon, certificate counter badge, and click action.
3. **[src/App.jsx](file:///c:/Users/Yash/Documents/GitHub/GOLC2027_Exp/src/App.jsx)**:
   - Added state for `isProfileOpen` and synchronized with URL hash (`#profile`).
   - Renders `<StudentProfileModal />` globally so it can be opened from both the Landing Page and inside any active experiment.
4. **[src/experiments/exp15/index.jsx](file:///c:/Users/Yash/Documents/GitHub/GOLC2027_Exp/src/experiments/exp15/index.jsx)**:
   - Automatically synchronizes certificate and report records to Firestore / AuthContext when a student finishes the assessment quiz.
5. **[firestore.rules](file:///c:/Users/Yash/Documents/GitHub/GOLC2027_Exp/firestore.rules) & [.env.example](file:///c:/Users/Yash/Documents/GitHub/GOLC2027_Exp/.env.example) (NEW)**:
   - Provided production-ready Firestore security rules (ensuring students can only read/write their own document tree).
   - Provided `.env.example` template with the exact variable names needed.

---

## 2. Verification Results

- **Production Build**: Executed `npm run build` — completed in 5.44s with **0 errors**.
- **Development Server**: Running on `http://localhost:5173/`.

---

## 3. Instructions to Connect Your Firebase Project

To switch from mock mode to your live Firebase project:

1. In [Firebase Console](https://console.firebase.google.com/):
   - **Authentication**: Enable **Email/Password** and **Google** sign-in providers under *Build > Authentication > Sign-in method*.
   - **Firestore Database**: Create a database in *Build > Firestore Database* (e.g. location `asia-south1` or `us-central1`).
   - **Rules**: In the *Rules* tab of Firestore, paste the rules from [firestore.rules](file:///c:/Users/Yash/Documents/GitHub/GOLC2027_Exp/firestore.rules).
   - **Web App**: Go to *Project Settings (⚙️)* > *Your apps* > click `</>` to register a web app and copy the credentials.
2. In your local project root (`c:\Users\Yash\Documents\GitHub\GOLC2027_Exp\.env`), create a `.env` file:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-app-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-app-id
   VITE_FIREBASE_STORAGE_BUCKET=your-app-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```
3. Restart your dev server (`npm run dev`). The console will log:
   ```
   [Firebase] Connected to live Firebase project: your-project-id
   ```
