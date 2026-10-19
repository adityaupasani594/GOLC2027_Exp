import React from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Network,
  Cpu,
  Search,
  Sparkles,
  BarChart2,
  GitBranch,
  Layers,
  Binary
} from 'lucide-react';

// Peripheral floating chips showcasing real IR/KG lab concepts
const FLOATING_CHIPS = [
  // Left column chips
  {
    id: 'inv-index',
    title: 'Inverted Index',
    sub: 'Vocabulary & Postings',
    metric: 'Lookup O(1)',
    icon: Database,
    color: 'indigo',
    pos: 'top-[18%] left-[2%] xl:left-[4%]',
    delay: 0,
    duration: 7,
    yOffset: 12,
  },
  {
    id: 'kg-triples',
    title: 'Knowledge Graph',
    sub: 'RDF Triple Store (s, p, o)',
    metric: 'Graph Path Query',
    icon: Network,
    color: 'violet',
    pos: 'top-[44%] left-[1%] xl:left-[3%]',
    delay: 1.2,
    duration: 8.5,
    yOffset: 14,
  },
  {
    id: 'dense-retrieval',
    title: 'Neural Bi-Encoder',
    sub: 'Dense 768d Embeddings',
    metric: 'FAISS Index',
    icon: Cpu,
    color: 'cyan',
    pos: 'top-[70%] left-[3%] xl:left-[5%]',
    delay: 0.6,
    duration: 6.8,
    yOffset: 10,
  },

  // Right column chips
  {
    id: 'bm25-rank',
    title: 'BM25 Scoring',
    sub: 'Term Saturation & Length Norm',
    metric: 'k₁=1.5 • b=0.75',
    icon: Search,
    color: 'blue',
    pos: 'top-[20%] right-[2%] xl:right-[4%]',
    delay: 0.4,
    duration: 7.6,
    yOffset: 13,
  },
  {
    id: 'semantic-search',
    title: 'Semantic Retrieval',
    sub: 'Cosine Similarity / RRF',
    metric: 'Hybrid Re-Rank',
    icon: Sparkles,
    color: 'purple',
    pos: 'top-[46%] right-[1%] xl:right-[3%]',
    delay: 1.8,
    duration: 8.2,
    yOffset: 15,
  },
  {
    id: 'evaluation-metrics',
    title: 'Empirical Metrics',
    sub: 'MAP, MRR, nDCG@10',
    metric: 'Stat Sig (p < 0.05)',
    icon: BarChart2,
    color: 'emerald',
    pos: 'top-[72%] right-[3%] xl:right-[5%]',
    delay: 0.9,
    duration: 7.2,
    yOffset: 11,
  },
];

const COLOR_STYLES = {
  indigo: {
    border: 'border-indigo-100 hover:border-indigo-300',
    bg: 'bg-indigo-50/80',
    iconText: 'text-indigo-600',
    metric: 'text-indigo-700 bg-indigo-50/90 border-indigo-200/60',
    glow: 'from-indigo-500/20 to-blue-500/0',
    dot: 'bg-indigo-500',
  },
  violet: {
    border: 'border-violet-100 hover:border-violet-300',
    bg: 'bg-violet-50/80',
    iconText: 'text-violet-600',
    metric: 'text-violet-700 bg-violet-50/90 border-violet-200/60',
    glow: 'from-violet-500/20 to-indigo-500/0',
    dot: 'bg-violet-500',
  },
  cyan: {
    border: 'border-cyan-100 hover:border-cyan-300',
    bg: 'bg-cyan-50/80',
    iconText: 'text-cyan-600',
    metric: 'text-cyan-700 bg-cyan-50/90 border-cyan-200/60',
    glow: 'from-cyan-500/20 to-blue-500/0',
    dot: 'bg-cyan-500',
  },
  blue: {
    border: 'border-blue-100 hover:border-blue-300',
    bg: 'bg-blue-50/80',
    iconText: 'text-blue-600',
    metric: 'text-blue-700 bg-blue-50/90 border-blue-200/60',
    glow: 'from-blue-500/20 to-sky-500/0',
    dot: 'bg-blue-500',
  },
  purple: {
    border: 'border-purple-100 hover:border-purple-300',
    bg: 'bg-purple-50/80',
    iconText: 'text-purple-600',
    metric: 'text-purple-700 bg-purple-50/90 border-purple-200/60',
    glow: 'from-purple-500/20 to-pink-500/0',
    dot: 'bg-purple-500',
  },
  emerald: {
    border: 'border-emerald-100 hover:border-emerald-300',
    bg: 'bg-emerald-50/80',
    iconText: 'text-emerald-600',
    metric: 'text-emerald-700 bg-emerald-50/90 border-emerald-200/60',
    glow: 'from-emerald-500/20 to-teal-500/0',
    dot: 'bg-emerald-500',
  },
};

export default function KnowledgeGraphBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-0 overflow-hidden select-none">
      {/* ── 1. Luminous Ambient Gradient Glows (Framer Motion) ── */}
      <motion.div
        animate={{
          x: [0, 45, -30, 0],
          y: [0, -35, 25, 0],
          scale: [1, 1.15, 0.92, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 -left-32 w-[620px] h-[620px] rounded-full bg-gradient-to-tr from-indigo-300/30 via-indigo-200/20 to-transparent blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -40, 25, 0],
          y: [0, 35, -30, 0],
          scale: [1.05, 0.9, 1.1, 1.05],
        }}
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 -right-36 w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-violet-300/25 via-fuchsia-200/18 to-transparent blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, 30, -25, 0],
          y: [0, -20, 35, 0],
          scale: [0.95, 1.1, 0.98, 0.95],
        }}
        transition={{
          duration: 17,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-36 left-1/3 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-cyan-200/20 via-sky-100/25 to-transparent blur-3xl"
      />

      {/* ── 2. Technical Blueprint / Geometric Grid with Radial Mask ── */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.18) 1.2px, transparent 0)
          `,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 85%)',
        }}
      />

      {/* ── 3. Constellation & Neural Graph SVG Vector Lattice ── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-45 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="curveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="curveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Ambient flowing connection beams */}
        <motion.path
          d="M -100 250 C 350 150, 450 450, 900 350 C 1200 280, 1400 480, 1900 400"
          fill="none"
          stroke="url(#curveGrad1)"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          animate={{
            strokeDashoffset: [0, -100],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            strokeDashoffset: { duration: 18, repeat: Infinity, ease: 'linear' },
            opacity: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        <motion.path
          d="M -50 600 C 400 680, 600 380, 1050 520 C 1350 620, 1600 420, 2000 500"
          fill="none"
          stroke="url(#curveGrad2)"
          strokeWidth="1.5"
          strokeDasharray="4 10"
          animate={{
            strokeDashoffset: [100, 0],
            opacity: [0.25, 0.5, 0.25],
          }}
          transition={{
            strokeDashoffset: { duration: 22, repeat: Infinity, ease: 'linear' },
            opacity: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      </svg>

      {/* ── 4. Floating Framer Motion Interactive Knowledge Chips ── */}
      <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none">
        {FLOATING_CHIPS.map((chip) => {
          const style = COLOR_STYLES[chip.color];
          const Icon = chip.icon;

          return (
            <motion.div
              key={chip.id}
              className={`absolute ${chip.pos} hidden lg:block z-10 pointer-events-auto`}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: [0, -chip.yOffset, 0],
                x: [0, 4, 0],
              }}
              transition={{
                opacity: { duration: 0.8, delay: chip.delay },
                y: {
                  duration: chip.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: chip.delay,
                },
                x: {
                  duration: chip.duration * 1.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: chip.delay,
                },
              }}
              whileHover={{ scale: 1.05, y: -4, transition: { duration: 0.2 } }}
            >
              <div
                className={`relative group px-3.5 py-2.5 rounded-2xl bg-white/75 backdrop-blur-md border ${style.border} shadow-sm hover:shadow-md transition-all duration-300 max-w-[210px] cursor-default`}
              >
                {/* Subtle hover gradient bloom */}
                <div
                  className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${style.glow} opacity-0 group-hover:opacity-100 blur-sm transition duration-300 pointer-events-none`}
                />

                <div className="relative flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl ${style.bg} flex items-center justify-center shrink-0 mt-0.5 shadow-xs`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${style.iconText}`} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-800 tracking-tight truncate">
                        {chip.title}
                      </p>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0 animate-pulse`} />
                    </div>

                    <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5 font-medium">
                      {chip.sub}
                    </p>

                    <div className="mt-1.5 flex items-center">
                      <span
                        className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md border ${style.metric}`}
                      >
                        {chip.metric}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
