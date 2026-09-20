import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import { EXPERIMENT_COMPONENTS } from './experiments';
import { AmbientBackground } from './components/common';

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
      {/* Ambient background blobs */}
      <AmbientBackground />

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
