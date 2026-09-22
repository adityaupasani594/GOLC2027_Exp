import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Award, Home, LogIn } from 'lucide-react';
import collegeLogo from '../../image.png';
import { useAuth } from '../../context/AuthContext';
import UserDropdown from './UserDropdown';
import ExperimentLikeButton from './ExperimentLikeButton';

const DEFAULT_TAB_ACTIVE = {
  indigo: 'bg-indigo-600 text-white shadow-indigo-200',
  violet: 'bg-violet-600 text-white shadow-violet-200',
  rose: 'bg-rose-500 text-white shadow-rose-200',
  amber: 'bg-amber-500 text-white shadow-amber-200',
  teal: 'bg-teal-600 text-white shadow-teal-200',
};

export default function ExperimentNavbar({
  title,
  expId = null,
  tabs = [],
  activeTab,
  onTabChange,
  onBack,
  quizScore = null,
  totalQuestions = null,
  tabActiveStyles = DEFAULT_TAB_ACTIVE,
  onOpenProfile,
}) {
  const { user } = useAuth();
  const activeExpId = expId || (title && String(title).match(/Exp(?:eriment)?\s*(\d+)/i)?.[1]);
  const cleanTitle = (title || '').replace(/^(Exp|Experiment)\s*\d+[\s:–-]+/i, '');
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/60 shadow-sm no-print">
      {/* ── Top Bar: Logo (Left) | Tabs (Center) | Home (Right) ── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-4">
          {/* Left: VESIT Logo */}
          <div className="flex items-center shrink-0">
            <button
              onClick={onBack}
              className="flex items-center cursor-pointer hover:opacity-85 transition-opacity"
              title="Back to All Experiments Portal"
            >
              <img
                src={collegeLogo}
                alt="VESIT College Logo"
                className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-xs"
              />
            </button>
          </div>

          {/* Center: Module Tab Nav */}
          {tabs.length > 0 && (
            <nav className="flex items-center gap-0.5 bg-white/70 backdrop-blur-md rounded-full p-1 border border-white/80 shadow-inner overflow-x-auto mx-1 sm:mx-auto">
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

          {/* Right: Quiz Score, User & Home Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {quizScore !== null && totalQuestions && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>{quizScore}/{totalQuestions}</span>
              </div>
            )}

            {user ? (
              <UserDropdown onOpenProfile={onOpenProfile} />
            ) : (
              <a
                href="#login"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/80 hover:bg-white text-indigo-600 border border-indigo-200/80 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </a>
            )}

            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-indigo-600 border border-slate-200/80 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Portal Home"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Sub-bar: Experiment Title & Like Action ── */}
      <div className="bg-slate-50/80 backdrop-blur-md border-t border-slate-200/60 py-2 sm:py-2.5 px-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-2.5 text-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <FlaskConical className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              {cleanTitle}
            </h1>
          </div>
          {activeExpId && (
            <div className="shrink-0">
              <ExperimentLikeButton expId={activeExpId} variant="navbar" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
