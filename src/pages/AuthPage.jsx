import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthHeroBanner from '../components/auth/AuthHeroBanner';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import { AmbientBackground } from '../components/common';
import collegeLogo from '../image.png';

export default function AuthPage({ initialMode = 'login', onBack, onSuccess, canGoBack = false }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [feedback, setFeedback] = useState(null); // { type: 'error' | 'success', message: '' }
  const { login, register, loginWithGoogle, loading, user } = useAuth();

  // Sync mode if hash changes or initialMode changes
  useEffect(() => {
    if (initialMode === 'register' || initialMode === 'login') {
      setMode(initialMode);
    }
  }, [initialMode]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setFeedback(null);
    if (typeof window !== 'undefined') {
      window.location.hash = newMode;
    }
  };

  const handleLogin = async ({ identifier, password }) => {
    setFeedback(null);
    try {
      const loggedIn = await login(identifier, password);
      setFeedback({
        type: 'success',
        message: `Welcome back, ${loggedIn.displayName || loggedIn.firstName}! Accessing lab environment...`,
      });
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 900);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to sign in. Please verify your credentials.',
      });
    }
  };

  const handleRegister = async (formData) => {
    setFeedback(null);
    try {
      const newUser = await register(formData);
      setFeedback({
        type: 'success',
        message: `Account created successfully for ${newUser.displayName}! Setting up your lab workspace...`,
      });
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 900);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to register account.',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setFeedback(null);
    try {
      const googleUser = await loginWithGoogle();
      setFeedback({
        type: 'success',
        message: `Signed in with Google as ${googleUser.displayName}! Loading your lab profile...`,
      });
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 900);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Google authentication encountered an issue.',
      });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <AmbientBackground />

      {/* Top Header / Back Navigation Bar */}
      <div className="max-w-6xl w-full mx-auto mb-4 sm:mb-6 flex items-center justify-between z-20">
        {canGoBack ? (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 hover:text-indigo-600 border border-slate-200/90 text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all cursor-pointer group backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Laboratory Portal</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 border border-indigo-100/90 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Restricted Academic Lab • Student Authentication Required</span>
          </div>
        )}

        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center gap-2">
          <img src={collegeLogo} alt="VESIT Logo" className="h-7 w-auto object-contain" />
        </div>
      </div>

      {/* Main Container Card (Dual Column Layout on Desktop) */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch z-10">
        {/* Left Column: Academic Laboratory Showcase */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-5 h-full">
          <AuthHeroBanner />
        </div>

        {/* Right Column: Auth Card */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center">
          <div className="p-6 sm:p-9 lg:p-10 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-xl shadow-slate-200/60">
            {/* Form Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  Student & Researcher Access
                </span>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Secure 256-bit Lab Session</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                {mode === 'login' ? 'Welcome Back to the Lab' : 'Create Student Lab Account'}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                {mode === 'login'
                  ? 'Sign in to review evaluation reports, resume experiments, and verify certificates.'
                  : 'Register with your college or Email to access all 15 experiments and simulators.'}
              </p>
            </div>

            {/* Mode Toggle Tabs (Pill Switch) */}
            <div className="relative p-1 bg-slate-100/90 rounded-2xl flex items-center mb-6 border border-slate-200/70">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`relative flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer ${mode === 'login' ? 'text-indigo-950' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {mode === 'login' && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/70"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`relative flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer ${mode === 'register' ? 'text-indigo-950' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {mode === 'register' && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/70"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Create Account</span>
              </button>
            </div>

            {/* Google Sign In Button (Prominent Firebase Social Auth) */}
            <div className="mb-5">
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                loading={loading}
                text={mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
              />
            </div>

            {/* Visual Divider */}
            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white/90 px-3 text-[11px] font-medium text-slate-400 shrink-0 uppercase tracking-wider">
                or continue with student credentials
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* Feedback Toast / Alert Banner */}
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className={`p-3 rounded-xl mb-4 text-xs font-medium flex items-start gap-2.5 ${feedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">{feedback.message}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dynamic Form Area */}
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.div
                  key="login-form-pane"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <LoginForm
                    onSubmit={handleLogin}
                    loading={loading}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register-form-pane"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <RegisterForm
                    onSubmit={handleRegister}
                    loading={loading}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card Footer Note */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                {mode === 'login' ? (
                  <>
                    Don't have an academic account yet?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      Register here
                    </button>
                  </>
                ) : (
                  <>
                    Already have a student account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
