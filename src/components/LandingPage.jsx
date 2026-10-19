import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  GitFork,
  FlaskConical,
  BookOpenCheck,
  Cpu,
  Network
} from 'lucide-react';
import { LandingNavbar, Footer, AmbientBackground, InteractiveParticleGrid } from './common';
import CinematicLabIntroModal from './CinematicLabIntroModal';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }
});

const STATS = [
  { value: '15', label: 'Lab Experiments', accent: 'indigo' },
  { value: '4', label: 'Curriculum Tracks', accent: 'violet' },
  { value: '∞', label: 'Interactive Simulations', accent: 'cyan' },
  { value: '100%', label: 'Empirical Evaluation', accent: 'emerald' },
];

const TRACK_PILLS = [
  { label: 'IR Foundations', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { label: 'Semantic Search', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { label: 'Knowledge Graphs', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'Evaluation', color: 'bg-rose-100   text-rose-700   border-rose-200' },
];

const ACCENTMAP = {
  indigo: { value: 'text-indigo-600', dot: 'bg-indigo-500' },
  violet: { value: 'text-violet-600', dot: 'bg-violet-500' },
  cyan: { value: 'text-cyan-600', dot: 'bg-cyan-500' },
  emerald: { value: 'text-emerald-600', dot: 'bg-emerald-500' },
};

export default function LandingPage({
  onNavigateToCurriculum,
  onLaunchExperiment,
  onLaunchExp15,
  onNavigateToAuth,
  onOpenProfile
}) {
  const [isIntroOpen, setIsIntroOpen] = useState(false);

  const handleLaunch = (num) => {
    if (onLaunchExperiment) onLaunchExperiment(num);
    else if (onLaunchExp15) onLaunchExp15();
  };

  const handleOpenCurriculum = (section = null) => {
    if (onNavigateToCurriculum) onNavigateToCurriculum(section);
    else window.location.hash = section ? `#${section}` : '#curriculum';
  };

  const handleOpenCurriculumWithIntro = () => {
    setIsIntroOpen(true);
  };

  const handleIntroComplete = () => {
    setIsIntroOpen(false);
    handleOpenCurriculum();
  };

  return (
    <div className="min-h-screen text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* ── Dynamic Cursor-Reactive Antigravity Particle Grid Background ── */}
      <InteractiveParticleGrid
        backgroundColor="transparent"
        nodeColor="#6366f1"
        highlightColor="#8b5cf6"
        gridSpacing={44}
        interactionRadius={140}
        repelStrength={6.2}
        springStiffness={0.065}
        damping={0.84}
        showConnections={false}
      />
      {/* Subtle soft ambient backlighting */}
      <AmbientBackground />

      <div className="relative z-20">
        <LandingNavbar
          currentView="landing"
          onNavigateToCurriculum={handleOpenCurriculum}
          onNavigateToAuth={onNavigateToAuth}
          onNavigateToLab={handleLaunch}
          onOpenProfile={onOpenProfile}
        />
      </div>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col justify-center relative z-10 overflow-hidden">

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 w-full">

          {/* ── Institutional badge ── */}
          <motion.div {...fadeUp(0)} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-slate-200/80 shadow-xs text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Department of Computer Engineering · VESIT · Academic Year 2026–27</span>
            </div>
          </motion.div>

          {/* ── Main headline ── */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.div {...fadeUp(0.08)}>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-slate-900 text-center">
                <span
                  className="inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #0891b2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  KIRA
                </span>
                <span className="text-slate-800"> Lab</span>
              </h1>
            </motion.div>

            <motion.p
              {...fadeUp(0.15)}
              className="mt-4 text-sm sm:text-base font-semibold text-slate-500 uppercase tracking-[0.2em]"
            >
              Knowledge Graph &amp; Information Retrieval Analytics
            </motion.p>

            <motion.p
              {...fadeUp(0.22)}
              className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto"
            >
              A structured virtual laboratory that takes you from text preprocessing and
              inverted indexing through neural semantic search, knowledge graphs, and
              quantitative empirical evaluation — all in one learning graph.
            </motion.p>

            {/* ── Track pills ── */}
            <motion.div
              {...fadeUp(0.3)}
              className="mt-7 flex flex-wrap justify-center gap-2"
            >
              {TRACK_PILLS.map(t => (
                <span
                  key={t.label}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${t.color}`}
                >
                  {t.label}
                </span>
              ))}
            </motion.div>

            {/* ── Primary CTA ── */}
            <motion.div
              {...fadeUp(0.38)}
              className="mt-10 flex flex-col items-center justify-center gap-2.5"
            >
              <button
                type="button"
                onClick={handleOpenCurriculumWithIntro}
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-sm sm:text-base text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
                }}
              >
                <FlaskConical className="w-4.5 h-4.5 opacity-90" />
                <span>Open Curriculum &amp; Lab Modules</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenCurriculum()}
                className="text-[11px] text-slate-400 hover:text-indigo-600 transition-colors font-medium cursor-pointer"
              >
                Skip orientation &amp; jump directly to curriculum →
              </button>
            </motion.div>
          </div>

          {/* ── Stats row ── */}
          <motion.div
            {...fadeUp(0.46)}
            className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200/60 rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm"
          >
            {STATS.map((s) => {
              const a = ACCENTMAP[s.accent];
              return (
                <div
                  key={s.label}
                  className="bg-white/80 backdrop-blur-sm px-6 py-6 flex flex-col items-center text-center group hover:bg-indigo-50/40 transition-colors"
                >
                  <div className={`flex items-center gap-1.5 mb-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${a.dot} opacity-70`} />
                    <p className={`text-2xl sm:text-3xl font-black tabular-nums ${a.value}`}>
                      {s.value}
                    </p>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-0.5 leading-snug">
                    {s.label}
                  </p>
                </div>
              );
            })}
          </motion.div>

          {/* ── Feature highlights ── */}
          <motion.div
            {...fadeUp(0.54)}
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              {
                icon: BookOpenCheck,
                title: 'Structured Syllabus',
                body: 'Prerequisite-ordered DAG ensures you build each concept on a solid foundation.',
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
              },
              {
                icon: Cpu,
                title: 'Live Simulations',
                body: 'Interactive visualizations let you run, tweak, and understand every algorithm in your browser.',
                color: 'text-violet-600',
                bg: 'bg-violet-50',
              },
              {
                icon: Network,
                title: 'Empirical Evaluation',
                body: 'Every experiment generates a reproducible report with precision, recall, F1, and MRR metrics.',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
              },
            ].map(({ icon: Icon, title, body, color, bg }) => (
              <div
                key={title}
                className="p-5 rounded-2xl bg-white/80 border border-slate-200/70 shadow-sm hover:shadow-md hover:border-indigo-200/70 transition-all group"
              >
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </main>

      {/* ── Cinematic Lab Intro Story Modal ── */}
      <CinematicLabIntroModal
        isOpen={isIntroOpen}
        onClose={() => setIsIntroOpen(false)}
        onComplete={handleIntroComplete}
      />

      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
