# Walkthrough: Professional Student Authentication & Registration Portal

We have created an academically professional, engaging, and Firebase-ready Authentication Portal for the **IR & Knowledge Graphs Virtual Laboratory (VESIT / GOLC 2027)**.

---

## 1. Summary of What Was Built

### 🏛️ Visual & Interactive Features
- **Split-Screen Academic Layout**:
  - **Left**: Academic showcase highlighting VESIT branding, GOLC 2027 credentials, curriculum overview (15 experiments, 4 tracks), and verified lab certification guarantees.
  - **Right**: Polished glassmorphism authentication card with animated mode toggle (`Sign In` ↔ `Create Account`), Google sign-in button, and validation feedback.
- **Toggle Between Login and Register**:
  - Smooth Framer Motion sliding pill tab indicator.
  - URL hash synchronized (`#login` / `#register` / `#auth`).
- **Required Fields Implemented**:
  - **Register**: First Name, Last Name, Student Username, College/Email, Create Password, Confirm Password, and Academic Honor Code acknowledgment checkbox.
  - **Login**: Username or Email, Password (with Show/Hide toggle), "Remember me", and "Demo Account" 1-click test fill button.
- **Real-Time Validations & Indicators**:
  - 4-segment dynamic Password Strength meter (Weak, Fair, Good, Strong) with checklist rules (8+ chars, upper/lower, numbers, symbols).
  - Live password confirmation match feedback ("✓ Passwords match" / "✗ Passwords do not match").
  - Form validation with inline error hints and animated alert toasts.
- **Social Auth Button**:
  - Standard, high-polish "Sign in with Google" button with official 4-color SVG logo.
- **Session & Navbar Integration**:
  - When logged in, top navbar displays the student avatar, full name, and interactive `<UserDropdown />` with curriculum progress (e.g. 1/15 experiments completed), quick lab launcher, and "Sign Out" action.
  - In Experiment 15 (`#exp15`), certificates and evaluation reports automatically pre-fill with the logged-in student's full name and student ID.

---

## 2. Clean Architecture & Firebase Integration Readiness

The architecture is strictly decoupled so that **future Firebase Auth & Firestore integration requires zero UI rewrites**:

```
src/
├── context/
│   └── AuthContext.jsx         <-- Global React Auth state (user, progress, login, register, logout)
├── services/
│   ├── firebase.js             <-- Firebase initialization template & environment variable mapping
│   ├── authService.js          <-- Abstracted Auth Layer (mock localStorage fallback + Firebase API ready)
│   └── progressService.js      <-- Student progress store (experiments completed, quiz scores, certificates)
├── pages/
│   └── AuthPage.jsx            <-- Responsive split-screen Auth Page
├── components/
│   ├── auth/
│   │   ├── AuthHeroBanner.jsx  <-- Academic showcase & VESIT branding
│   │   ├── LoginForm.jsx       <-- Sign In form with show/hide password and demo filler
│   │   ├── RegisterForm.jsx    <-- Registration form with first/last name, username, confirm password
│   │   ├── GoogleSignInButton.jsx <-- Official Google sign-in button
│   │   └── PasswordStrengthBar.jsx <-- 4-bar dynamic security meter
│   └── common/
│       ├── UserDropdown.jsx    <-- Student profile dropdown in navbar
│       ├── LandingNavbar.jsx   <-- Updated with Sign In button & UserDropdown
│       └── ExperimentNavbar.jsx<-- Updated with active student session
└── App.jsx                     <-- Hash router supporting #login, #register, #exp15, default
```

### Connecting to Firebase (When You Are Ready)

1. Run:
   ```bash
   npm install firebase
   ```
2. In your `.env` file, add your Firebase keys:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
3. In [src/services/authService.js](file:///c:/Users/Yash/Documents/GitHub/GOLC2027_Exp/src/services/authService.js), simply un-comment the standard Firebase Auth methods (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signInWithPopup(auth, googleProvider)`). The context and all UI components will work automatically!

---

## 3. How to Test

1. Run the dev server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173/` in your browser.
3. Click the **"Student Sign In"** button in the navbar, or navigate directly to `http://localhost:5173/#login`.
4. Click the **"Demo Account"** button to auto-fill test credentials (`aarav_sharma` / `Password@123`), then click **"Sign In to Virtual Lab"**.
5. Observe the navbar updating with student avatar Aarav Sharma and curriculum progress.
6. Switch to `http://localhost:5173/#register` to test the Create Account form with live password strength and confirm password match checks.
