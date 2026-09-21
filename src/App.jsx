import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import AuthPage from './pages/AuthPage';
import { EXPERIMENT_COMPONENTS } from './experiments';
import { AmbientBackground } from './components/common';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();

  // Helper to inspect hash
  const parseHash = () => {
    if (typeof window === 'undefined') return { view: 'landing', authMode: 'login', expNum: null };
    const hash = window.location.hash.toLowerCase();

    if (hash === '#register' || hash === '#signup') {
      return { view: 'auth', authMode: 'register', expNum: null };
    }
    if (hash === '#login' || hash === '#signin' || hash === '#auth') {
      return { view: 'auth', authMode: 'login', expNum: null };
    }
    const match = hash.match(/exp-?(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 15) {
        return { view: 'experiment', authMode: 'login', expNum: num };
      }
    }
    return { view: 'landing', authMode: 'login', expNum: null };
  };

  const [routeState, setRouteState] = useState(parseHash);
  // Remember any experiment requested before authentication
  const [pendingExpNum, setPendingExpNum] = useState(() => {
    const initial = parseHash();
    return initial.expNum;
  });

  // Keep routeState synced with hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHash();
      setRouteState(parsed);
      if (parsed.expNum) {
        setPendingExpNum(parsed.expNum);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const launchExperiment = (num) => {
    const expNum = typeof num === 'number' ? num : 15;
    setRouteState({ view: 'experiment', authMode: 'login', expNum });
    window.location.hash = `exp${expNum}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAuth = (mode = 'login') => {
    setRouteState({ view: 'auth', authMode: mode, expNum: null });
    window.location.hash = mode;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const returnToLanding = () => {
    setRouteState({ view: 'landing', authMode: 'login', expNum: null });
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = () => {
    if (pendingExpNum) {
      launchExperiment(pendingExpNum);
      setPendingExpNum(null);
    } else {
      returnToLanding();
    }
  };

  // 1. Loading state while checking authentication session
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-slate-700"
        style={{ background: 'linear-gradient(135deg,#f0f0ff 0%,#faf5ff 45%,#f0fafa 100%)' }}
      >
        <AmbientBackground />
        <div className="relative z-10 flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-white/80 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-md">
            IR
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Initializing Virtual Laboratory...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Strict Authentication Guard:
  // If user is NOT logged in, they CANNOT access landing page or experiments.
  if (!user) {
    const activeAuthMode =
      routeState.view === 'auth' && routeState.authMode === 'register'
        ? 'register'
        : 'login';

    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: 'linear-gradient(135deg,#f0f0ff 0%,#faf5ff 45%,#f0fafa 100%)' }}
      >
        <AmbientBackground />
        <AnimatePresence mode="wait">
          <motion.div
            key={`unauthenticated-auth-${activeAuthMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col justify-center"
          >
            <AuthPage
              initialMode={activeAuthMode}
              canGoBack={false}
              onSuccess={handleAuthSuccess}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // 3. Authenticated Views: Landing, Experiments, or deliberate Auth switch
  const ActiveExperiment = routeState.expNum ? EXPERIMENT_COMPONENTS[routeState.expNum] : null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg,#f0f0ff 0%,#faf5ff 45%,#f0fafa 100%)' }}
    >
      <AmbientBackground />

      <AnimatePresence mode="wait">
        {routeState.view === 'auth' ? (
          <motion.div
            key={`auth-view-${routeState.authMode}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col justify-center"
          >
            <AuthPage
              initialMode={routeState.authMode}
              canGoBack={true}
              onBack={returnToLanding}
              onSuccess={handleAuthSuccess}
            />
          </motion.div>
        ) : routeState.view === 'experiment' && ActiveExperiment ? (
          <motion.div
            key={`experiment-view-${routeState.expNum}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <ActiveExperiment onBack={returnToLanding} />
          </motion.div>
        ) : (
          <motion.div
            key="landing-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <LandingPage
              onLaunchExperiment={launchExperiment}
              onLaunchExp15={() => launchExperiment(15)}
              onNavigateToAuth={navigateToAuth}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
