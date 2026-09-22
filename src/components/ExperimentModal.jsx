import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Layers, 
  FolderKanban, 
  CheckCircle2, 
  Cpu, 
  BookOpen, 
  Target,
  Sparkles,
  ArrowRight,
  GitFork,
  ArrowLeftRight
} from 'lucide-react';
import { EXPERIMENTS_LIST } from '../data/experimentsData';
import { ExperimentLikeButton } from './common';

export default function ExperimentModal({ experiment, isOpen, onClose, onLaunchExperiment, onLaunchExp15, onSelectOtherExp }) {
  if (!isOpen || !experiment) return null;

  const isExp15 = experiment.number === 15;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8"
        >
          {/* Header Banner */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/90">
                    {experiment.trackLabel}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                  {experiment.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ExperimentLikeButton expId={experiment.number} variant="modal" />
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5 max-h-[calc(85vh-160px)] overflow-y-auto">
            {/* Meta Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Curriculum Module</p>
                  <p className="text-sm font-bold text-slate-900">Virtual Laboratory</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Laboratory Track</p>
                  <p className="text-sm font-bold text-slate-900">{experiment.trackLabel}</p>
                </div>
              </div>
            </div>

            {/* Graph Dependencies Callout: Prerequisites & Dependents */}
            <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-1">
                  <GitFork className="w-3.5 h-3.5 text-indigo-600 rotate-180" />
                  <span>Incoming Prerequisites (A → This):</span>
                </div>
                {experiment.prerequisites && experiment.prerequisites.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {experiment.prerequisites.map(p => {
                      const found = EXPERIMENTS_LIST.find(e => e.number === p);
                      return (
                        <span key={p} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white text-indigo-700 border border-indigo-200 shadow-xs">
                          {found ? (found.shortTitle || found.title) : 'Prerequisite'}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic mt-1">None (Foundational Entry Point)</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                  <GitFork className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Outgoing Dependents (This → B):</span>
                </div>
                {experiment.dependents && experiment.dependents.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {experiment.dependents.map(d => {
                      const found = EXPERIMENTS_LIST.find(e => e.number === d);
                      return (
                        <span key={d} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white text-emerald-700 border border-emerald-200 shadow-xs">
                          {found ? (found.shortTitle || found.title) : 'Dependent'}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic mt-1">None (Terminal Evaluation Module)</p>
                )}
              </div>
            </div>

            {/* Brief Explanation */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Brief Explanation</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
                {experiment.explanation}
              </p>
            </div>

            {/* Expected Outcome */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Expected Learning Outcome</h4>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">
                  {experiment.expectedOutcome}
                </p>
              </div>
            </div>

            {/* Detailed Objectives */}
            {experiment.detailedObjectives && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Core Objectives</h4>
                </div>
                <ul className="space-y-2">
                  {experiment.detailedObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Tech Stack */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Tools & Technologies</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {experiment.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                if (onLaunchExperiment) {
                  onLaunchExperiment(experiment.number);
                } else if (onLaunchExp15) {
                  onLaunchExp15();
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Launch Module Lab</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
