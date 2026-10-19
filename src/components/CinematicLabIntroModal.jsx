import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Database,
  Network,
  Cpu,
  BarChart3,
  Layers,
  CheckCircle2,
  Play,
  Pause,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  GitFork,
  FlaskConical,
  Flame,
  Globe
} from 'lucide-react';
import collegeLogo from '../image.png';
import kiraLogo from '../logo.jpeg';

const CHAPTERS = [
  {
    id: 'ir-foundations',
    tag: 'Chapter 01 / The Data Deluge',
    title: 'Why Information Retrieval?',
    subtitle: 'Extracting Truth from Quintillions of Unstructured Documents',
    icon: Search,
    accent: 'indigo',
    gradient: 'from-indigo-600 via-indigo-500 to-blue-500',
    description:
      'Over 80% of world enterprise data exists as raw, unstructured text. Traditional keyword matching fails because humans communicate with synonyms, context, and nuance. Information Retrieval builds the probabilistic indexes, term saturations (BM25), and dense vector representations that allow machines to locate the exact needles in global data haystacks.',
    takeaways: [
      'Inverted indexing enables O(1) keyword and posting lookups across millions of pages',
      'Probabilistic BM25 penalizes term spam and normalizes document lengths',
      'Dense neural vector embeddings map semantic intent beyond literal keywords',
    ],
    badgeText: 'Information Retrieval',
  },
  {
    id: 'kg-reasoning',
    tag: 'Chapter 02 / The Structured Truth',
    title: 'Why Knowledge Graphs?',
    subtitle: 'Giving Machines Grounded Relational Reasoning Without Hallucinations',
    icon: Network,
    accent: 'violet',
    gradient: 'from-violet-600 via-purple-500 to-fuchsia-500',
    description:
      'While vector search captures approximate similarity, it has zero concept of factual constraints or multi-hop relationship logic. A pure vector search cannot deterministically verify who founded a company or which protein targets a receptor. Knowledge Graphs structure human reality into formal (Subject, Predicate, Object) semantic triples for verifiable, multi-hop symbolic reasoning.',
    takeaways: [
      'Entities and relationships form explicit mathematical graph ontologies',
      'SPARQL graph traversals solve complex multi-hop queries deterministically',
      'Zero hallucination: every relationship is grounded in an auditable knowledge triple',
    ],
    badgeText: 'Knowledge Graphs',
  },
  {
    id: 'the-convergence',
    tag: 'Chapter 03 / The Power of Synergy',
    title: 'Why Combine IR & Knowledge Graphs?',
    subtitle: 'The Birth of Neuro-Symbolic Intelligence & Modern GraphRAG',
    icon: Cpu,
    accent: 'cyan',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    description:
      'Unstructured text offers rich expressive nuance; structured knowledge graphs offer absolute factual precision. When combined, they form the foundation of GraphRAG and Cognitive AI — where dense semantic retrieval is guided and verified by explicit knowledge subgraphs. This synergy powers state-of-the-art enterprise search, intelligence analysis, and scientific discovery.',
    takeaways: [
      'Hybrid Retrieval: Reciprocal Rank Fusion (RRF) merges dense and sparse results',
      'Graph-Augmented Generation (GraphRAG) injects factual subgraphs into AI queries',
      'Explainable AI: Every generated answer has an exact ontological citation path',
    ],
    badgeText: 'The KIRA Synergy',
  },
  {
    id: 'your-laboratory',
    tag: 'Chapter 04 / Your Mission',
    title: 'Welcome to KIRA Virtual Lab',
    subtitle: '15 Interactive Experiments Arranged in a Directed Prerequisite Graph',
    icon: FlaskConical,
    accent: 'emerald',
    gradient: 'from-emerald-500 via-teal-600 to-indigo-600',
    description:
      'The Department of Computer Engineering at VESIT designed this curriculum as an interconnected learning journey. You will code, simulate, visualize, and empirically evaluate every algorithm — from tokenization and inverted indexing, to dense bi-encoders, RDF knowledge stores, and quantitative ranking benchmarks (MAP, MRR, nDCG).',
    takeaways: [
      '4 Progressive Tracks: IR Foundations, Semantic Search, Knowledge Graphs & Evaluation',
      'Interactive sandbox simulations with real-time algorithm visualizers',
      'Empirical metrics and automated PDF laboratory reports for academic coursework',
    ],
    badgeText: 'Academic Year 2026–27',
  },
];

export default function CinematicLabIntroModal({ isOpen, onClose, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const CHAPTER_DURATION = 9000; // 9 seconds per slide in auto-play mode

  const activeChapter = CHAPTERS[currentIdx];

  // Reset state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
      setProgress(0);
      setIsPlaying(true);
    }
  }, [isOpen]);

  // Smooth 60 FPS progress loop using requestAnimationFrame
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    let animId;
    let lastTime = performance.now();

    const tick = (now) => {
      const delta = now - lastTime;
      lastTime = now;

      setProgress((prev) => {
        const next = prev + (delta / CHAPTER_DURATION) * 100;
        return next >= 100 ? 100 : next;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPlaying, currentIdx]);

  // Clean sequential chapter advance when progress hits 100%
  useEffect(() => {
    if (progress >= 100) {
      if (currentIdx < CHAPTERS.length - 1) {
        setCurrentIdx((prevIdx) => prevIdx + 1);
        setProgress(0);
      } else {
        setIsPlaying(false);
      }
    }
  }, [progress, currentIdx]);

  // Reset progress when chapter changes manually
  const goToChapter = (idx) => {
    setCurrentIdx(idx);
    setProgress(0);
  };

  const handleNext = () => {
    if (currentIdx < CHAPTERS.length - 1) {
      goToChapter(currentIdx + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      goToChapter(currentIdx - 1);
    }
  };

  const handleFinish = () => {
    if (onComplete) {
      onComplete();
    } else if (onClose) {
      onClose();
    }
  };

  // Keyboard navigation (Arrow keys, Space to pause, Esc to exit)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'Escape') {
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIdx]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/90 backdrop-blur-2xl text-slate-100 select-none">
        {/* ── Background Atmospheric Ambient Orbs ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            key={activeChapter.id + '-orb1'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.35, scale: 1 }}
            transition={{ duration: 1.2 }}
            className={`absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-[120px] bg-gradient-to-tr ${activeChapter.gradient}`}
          />
          <motion.div
            key={activeChapter.id + '-orb2'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.25, scale: 1.1 }}
            transition={{ duration: 1.4 }}
            className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[140px] bg-gradient-to-bl from-cyan-600 via-indigo-700 to-transparent"
          />

          {/* Technical Grid Overlay */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* ── Top Header Controls & Chapter Progress Bar ── */}
        <div className="absolute top-0 inset-x-0 z-20 px-4 sm:px-8 py-5 flex flex-col gap-4 bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent">
          {/* Timeline story progress bars */}
          <div className="grid grid-cols-4 gap-2 w-full max-w-5xl mx-auto">
            {CHAPTERS.map((ch, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              const barFill = isPast ? 100 : isCurrent ? progress : 0;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => goToChapter(idx)}
                  className="group relative h-1.5 sm:h-2 rounded-full bg-white/15 overflow-hidden cursor-pointer"
                  title={ch.title}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full"
                    style={{ width: `${barFill}%` }}
                    transition={{ ease: 'linear', duration: 0.05 }}
                  />
                  <div className="absolute inset-0 group-hover:bg-white/10 transition-colors" />
                </button>
              );
            })}
          </div>

          {/* Top Bar: Brand, Scene Tag & Skip Action */}
          <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3">
              <img
                src={kiraLogo}
                alt="KIRA"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain shadow-xs border border-white/20"
              />
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>KIRA Lab Orientation</span>
                <span className="text-slate-500 font-normal hidden sm:inline">•</span>
                <span className="text-xs font-medium text-slate-400 hidden sm:inline">
                  Interactive Foundations Movie
                </span>
              </span>
            </div>

            {/* Right: Controls & Skip */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5 border border-white/10"
                title={isPlaying ? 'Pause Auto-Play (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline text-[11px] font-medium">
                  {isPlaying ? 'Pause' : 'Play'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border border-indigo-400/30"
              >
                <span>Skip to Curriculum</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Cinematic Stage ── */}
        <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 py-20 flex flex-col justify-center min-h-[580px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter.id}
              initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -25, filter: 'blur(8px)' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              {/* Left Column: Narrative Content */}
              <div className="lg:col-span-7 space-y-5">
                {/* Chapter Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{activeChapter.tag}</span>
                </div>

                {/* Main Chapter Title */}
                <div>
                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
                    {activeChapter.title}
                  </h2>
                  <p className="mt-2 text-sm sm:text-base font-semibold text-indigo-300 leading-snug">
                    {activeChapter.subtitle}
                  </p>
                </div>

                {/* Rich Narrative Explanation */}
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {activeChapter.description}
                </p>

                {/* Core Takeaways */}
                <div className="space-y-2 pt-2">
                  {activeChapter.takeaways.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Column: Dynamic Conceptual Visual Sandbox */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-[380px] p-6 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/15 shadow-2xl relative overflow-hidden group">
                  {/* Glowing corner flare */}
                  <div
                    className={`absolute -top-16 -right-16 w-36 h-36 rounded-full bg-gradient-to-br ${activeChapter.gradient} opacity-25 blur-2xl group-hover:opacity-40 transition duration-500`}
                  />

                  {/* Scene-specific interactive graphic */}
                  {currentIdx === 0 && <SceneOneGraphic />}
                  {currentIdx === 1 && <SceneTwoGraphic />}
                  {currentIdx === 2 && <SceneThreeGraphic />}
                  {currentIdx === 3 && <SceneFourGraphic onLaunch={handleFinish} />}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Bottom Navigation & Timeline Bar ── */}
        <div className="absolute bottom-0 inset-x-0 z-20 px-4 sm:px-8 py-5 flex items-center justify-between bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
          <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-4">
            {/* Prev Button */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentIdx === 0
                  ? 'text-slate-600 cursor-not-allowed opacity-40'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Chapter Indicator Dots */}
            <div className="flex items-center gap-2">
              {CHAPTERS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToChapter(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIdx
                      ? 'bg-indigo-400 w-7'
                      : 'bg-white/25 hover:bg-white/50'
                  }`}
                  aria-label={`Jump to chapter ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next / Launch Button */}
            {currentIdx < CHAPTERS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer border border-indigo-400/30"
              >
                <span>Next Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer border border-emerald-400/40 animate-pulse"
              >
                <span>Enter Curriculum &amp; Modules</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCENE 1 GRAPHIC: The Inverted Index & Vector Space
   ───────────────────────────────────────────────────────────── */
function SceneOneGraphic() {
  const terms = ['neural', 'vector', 'retrieval', 'graph', 'evaluation'];

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white">Inverted Index Dictionary</span>
        </div>
        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">
          Postings O(1)
        </span>
      </div>

      <div className="space-y-2">
        {terms.map((term, i) => (
          <motion.div
            key={term}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 * i }}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-indigo-300 font-semibold">{term}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200">
                d{i + 1}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200">
                d{i + 3}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200">
                tf:{(1.2 + i * 0.4).toFixed(1)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-200 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>BM25 score computed across 15,000+ tokenized documents in 1.4ms</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCENE 2 GRAPHIC: Relational Knowledge Graph Triples
   ───────────────────────────────────────────────────────────── */
function SceneTwoGraphic() {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold text-white">Semantic Knowledge Triples</span>
        </div>
        <span className="text-[10px] font-mono text-violet-300 bg-violet-950/80 px-2 py-0.5 rounded border border-violet-500/30">
          SPARQL
        </span>
      </div>

      {/* Visual node cluster */}
      <div className="h-44 relative bg-violet-950/20 rounded-2xl border border-violet-500/20 p-3 flex items-center justify-center overflow-hidden">
        {/* Animated connecting beams */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line x1="80" y1="50" x2="190" y2="85" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
          <line x1="190" y1="85" x2="300" y2="50" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
          <line x1="190" y1="85" x2="190" y2="145" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
        </svg>

        {/* Node 1: SpaceX */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-6 left-6 px-3 py-1.5 rounded-xl bg-violet-900/80 border border-violet-400/40 text-[11px] font-bold text-white shadow-md shadow-violet-500/20"
        >
          [SpaceX]
        </motion.div>

        {/* Center Node: Founder */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-16 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 border border-white/30 text-xs font-extrabold text-white shadow-lg shadow-violet-600/30"
        >
          foundedBy
        </motion.div>

        {/* Node 2: Elon Musk */}
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-6 right-6 px-3 py-1.5 rounded-xl bg-violet-900/80 border border-violet-400/40 text-[11px] font-bold text-white shadow-md shadow-violet-500/20"
        >
          [Elon Musk]
        </motion.div>

        {/* Node 3: Falcon Heavy */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-4 px-3 py-1.5 rounded-xl bg-indigo-900/80 border border-indigo-400/40 text-[11px] font-bold text-cyan-200"
        >
          [Falcon Heavy] → [Mars Orbit]
        </motion.div>
      </div>

      <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-200 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
        <span>Multi-hop semantic graph paths resolve multi-entity constraints with 100% precision</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCENE 3 GRAPHIC: The Hybrid Fusion (IR + KG = KIRA)
   ───────────────────────────────────────────────────────────── */
function SceneThreeGraphic() {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white">Hybrid Retrieval Engine</span>
        </div>
        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
          GraphRAG Fusion
        </span>
      </div>

      <div className="space-y-2.5">
        {/* Stream 1: Dense Semantic Search */}
        <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="font-semibold text-indigo-200">Neural Semantic Stream</span>
          </div>
          <span className="font-mono text-[10px] text-indigo-300">Bi-Encoder 768d</span>
        </div>

        {/* Stream 2: Symbolic Knowledge Graph */}
        <div className="p-3 rounded-xl bg-violet-950/50 border border-violet-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
            <span className="font-semibold text-violet-200">Structured Graph Stream</span>
          </div>
          <span className="font-mono text-[10px] text-violet-300">RDF Subgraphs</span>
        </div>

        {/* Fusion Core */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 border border-white/30 text-center shadow-lg shadow-indigo-500/25"
        >
          <p className="text-xs font-black text-white tracking-wide uppercase">
            Reciprocal Rank Fusion Core
          </p>
          <p className="text-[10px] text-indigo-100 mt-0.5">
            100% Contextual Relevance + Zero Hallucination
          </p>
        </motion.div>
      </div>

      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>RRF combines lexical BM25, dense embeddings, and knowledge graph paths</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCENE 4 GRAPHIC: The 4 Lab Tracks Sandbox Preview
   ───────────────────────────────────────────────────────────── */
function SceneFourGraphic({ onLaunch }) {
  const tracks = [
    { title: 'Track 1: IR Foundations', exps: 'Exp 1–4', color: 'indigo' },
    { title: 'Track 2: Semantic Search', exps: 'Exp 5–8', color: 'violet' },
    { title: 'Track 3: Knowledge Graphs', exps: 'Exp 9–12', color: 'cyan' },
    { title: 'Track 4: Evaluation & QA', exps: 'Exp 13–15', color: 'emerald' },
  ];

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white">Curriculum Track Blueprint</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
          15 Modules
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tracks.map((t) => (
          <div
            key={t.title}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
          >
            <p className="text-[11px] font-bold text-white truncate">{t.title}</p>
            <p className="text-[10px] font-mono text-slate-400 mt-1">{t.exps}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onLaunch}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
      >
        <span>Open Interactive Syllabus</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
