import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FlaskConical, Award, Home } from 'lucide-react';

const DEFAULT_TAB_ACTIVE = {
  indigo: 'bg-indigo-600 text-white shadow-indigo-200',
  violet: 'bg-violet-600 text-white shadow-violet-200',
  rose: 'bg-rose-500 text-white shadow-rose-200',
  amber: 'bg-amber-500 text-white shadow-amber-200',
  teal: 'bg-teal-600 text-white shadow-teal-200',
};

export default function ExperimentNavbar({
  title,
  subtitle,
  tabs = [],
  activeTab,
  onTabChange,
  onBack,
  quizScore = null,
  totalQuestions = null,
  tabActiveStyles = DEFAULT_TAB_ACTIVE,
}) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/60 shadow-sm no-print">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-4">
          {/* Left: Back to Portal & Experiment Label */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Back to All 15 Experiments Portal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All Experiments</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden xs:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-xs text-white">
                <FlaskConical className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[180px] sm:max-w-xs">
                  {title}
                </p>
                {subtitle && (
                  <p className="text-[10px] text-slate-400 font-mono hidden xs:block mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Center: Module Tab Nav */}
          {tabs.length > 0 && (
            <nav className="flex items-center gap-0.5 bg-white/60 rounded-full p-1 border border-white/80 shadow-inner overflow-x-auto">
              {tabs.map(tab => {
                const active = activeTab === tab.id;
                const activeClass = tabActiveStyles[tab.color] || 'bg-indigo-600 text-white shadow-indigo-200';
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    whileTap={{ scale: 0.94 }}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      active ? `${activeClass} shadow-md` : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                    }`}
                  >
                    {tab.icon && <tab.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />}
                    <span className="hidden xs:inline sm:hidden">{tab.short || tab.label}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.id === 'quiz' && quizScore !== null && (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[8px] flex items-center justify-center font-bold">✓</span>
                    )}
                  </motion.button>
                );
              })}
            </nav>
          )}

          {/* Right: Score chip & Portal Link */}
          <div className="flex items-center gap-2 shrink-0">
            {quizScore !== null && totalQuestions && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>{quizScore}/{totalQuestions}</span>
              </div>
            )}

            <button
              onClick={onBack}
              className="p-1.5 rounded-xl hover:bg-white/70 text-slate-500 hover:text-slate-800 transition-colors"
              title="Portal Home"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
