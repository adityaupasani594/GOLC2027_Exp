import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Sparkles,
  GitFork,
  Award,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers
} from 'lucide-react';
import collegeLogo from '../../image.png';

export default function AuthHeroBanner() {
  const highlights = [
    {
      icon: GitFork,
      title: '15 Sequenced IR & KG Experiments',
      desc: 'Directed prerequisite learning graph from tokenization to Cypher & GraphRAG.'
    },
    {
      icon: Award,
      title: 'Verified Lab Certificates & Reports',
      desc: 'Instant PDF export with quantitative empirical evaluation metrics.'
    },
    {
      icon: Cpu,
      title: 'Interactive Visual Simulators',
      desc: 'Run BM25, TF-IDF, Vector Space, and Knowledge Graph sandboxes live.'
    }
  ];

  return (
    <div className="relative flex flex-col justify-between h-full p-8 lg:p-12 overflow-hidden text-white rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 shadow-2xl border border-indigo-800/40">
      {/* Background Decorative Rings & Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Section: Branding & Badge */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-500/30">
              IR
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-cyan-300 font-semibold">
                Virtual Laboratory Portal
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                IR & Knowledge Graphs
              </h2>
            </div>
          </div>

          <img
            src={collegeLogo}
            alt="VESIT Logo"
            className="h-9 sm:h-11 w-auto object-contain bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/15"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 mb-6">
          <Sparkles className="w-3 h-3 text-cyan-300" />
          <span>GOLC 2027 • Dept. of Computer Engineering • VESIT</span>
        </div>

        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-snug">
          Academic Student Portal &{' '}
          <span className="bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
            Research Sandbox
          </span>
        </h1>
        <p className="mt-3 text-sm text-indigo-200/85 leading-relaxed max-w-md">
          Sign in or create your student credentials to track your laboratory progress, retain quiz benchmarks, and export accredited experiment reports.
        </p>
      </div>

      {/* Center: Curriculum Features Carousel / Cards */}
      <div className="relative z-10 my-8 space-y-3.5">
        {highlights.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + idx * 0.1, duration: 0.4 }}
            className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-indigo-200/70 mt-0.5 leading-normal">
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Section: Security & Academic Honor Note */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-300/80">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Academic Honor Code Compliant</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Firebase Ready v1.0</span>
        </div>
      </div>
    </div>
  );
}
