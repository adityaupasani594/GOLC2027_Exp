import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import { EXPERIMENT_COMPONENTS } from './experiments';

export default function App() {
  const getInitialExperiment = () => {
    if (typeof window !== 'undefined') {
      const match = window.location.hash.match(/exp-?(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= 1 && num <= 15) return num;
      }
    }
    return null;
  };

  const [activeExpNumber, setActiveExpNumber] = useState(getInitialExperiment);

  // Keep hash synced for easy bookmarking / reload
  useEffect(() => {
    const handleHashChange = () => {
      const match = window.location.hash.match(/exp-?(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= 1 && num <= 15) {
          setActiveExpNumber(num);
          return;
        }
      }
      setActiveExpNumber(null);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const launchExperiment = (num) => {
    const expNum = typeof num === 'number' ? num : 15;
    setActiveExpNumber(expNum);
    window.location.hash = `exp${expNum}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const returnToLanding = () => {
    setActiveExpNumber(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ActiveExperiment = activeExpNumber ? EXPERIMENT_COMPONENTS[activeExpNumber] : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg,#f0f0ff 0%,#faf5ff 45%,#f0fafa 100%)' }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] rounded-full bg-violet-200/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[380px] h-[380px] rounded-full bg-cyan-200/18 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {!activeExpNumber || !ActiveExperiment ? (
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
            />
          </motion.div>
        ) : (
          <motion.div
            key={`experiment-view-${activeExpNumber}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <ActiveExperiment onBack={returnToLanding} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
