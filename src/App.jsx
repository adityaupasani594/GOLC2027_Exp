import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FlaskConical, HelpCircle, Award, FileText, Search } from 'lucide-react';
import TheorySection from './components/TheorySection';
import LabSection from './components/LabSection';
import QuizSection from './components/QuizSection';
import CertificateSection from './components/CertificateSection';
import ReportSection from './components/ReportSection';
import { EXPERIMENT, QUIZ_QUESTIONS } from './data/labData';

const TABS = [
  { id: 'theory',      label: 'Theory',      short: 'Theory',  icon: BookOpen,    color: 'indigo' },
  { id: 'lab',         label: 'Visual Lab',  short: 'Lab',     icon: FlaskConical, color: 'violet' },
  { id: 'quiz',        label: 'Quiz',        short: 'Quiz',    icon: HelpCircle,  color: 'rose'   },
  { id: 'certificate', label: 'Certificate', short: 'Cert.',   icon: Award,       color: 'amber'  },
  { id: 'report',      label: 'Report',      short: 'Report',  icon: FileText,    color: 'teal'   },
];

const TAB_ACTIVE = {
  indigo: 'bg-indigo-600 text-white shadow-indigo-200',
  violet: 'bg-violet-600 text-white shadow-violet-200',
  rose:   'bg-rose-500   text-white shadow-rose-200',
  amber:  'bg-amber-500  text-white shadow-amber-200',
  teal:   'bg-teal-600   text-white shadow-teal-200',
};

export default function App() {
  const [activeTab, setActiveTab]   = useState('theory');
  const [quizScore, setQuizScore]   = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: '', rollNo: '', institution: '', instructor: '',
  });

  const handleInfoChange = (key, value) =>
    setStudentInfo(prev => ({ ...prev, [key]: value }));

  const handleScoreUpdate = (score) => setQuizScore(score);

  const goTo = (tab) => setActiveTab(tab);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg,#f0f0ff 0%,#faf5ff 45%,#f0fafa 100%)' }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] rounded-full bg-violet-200/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[380px] h-[380px] rounded-full bg-cyan-200/18 blur-3xl" />
      </div>

      {/* ── Sticky Navbar ── */}
      <header className="sticky top-0 z-50 glass border-b border-white/60 shadow-sm no-print">
        <div className="max-w-5xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-3">

            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">IR Metrics Lab</p>
                <p className="text-[10px] text-slate-400 font-mono">{EXPERIMENT.code}</p>
              </div>
            </div>

            {/* Tab nav */}
            <nav className="flex items-center gap-0.5 bg-white/60 rounded-full p-1 border border-white/80 shadow-inner overflow-x-auto">
              {TABS.map(tab => {
                const active = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => goTo(tab.id)}
                    whileTap={{ scale: 0.94 }}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      active ? `${TAB_ACTIVE[tab.color]} shadow-md` : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                    }`}
                  >
                    <tab.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="hidden xs:inline sm:hidden">{tab.short}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.id === 'quiz' && quizScore !== null && (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[8px] flex items-center justify-center font-bold">✓</span>
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Score chip */}
            {quizScore !== null && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shrink-0">
                <Award className="w-3.5 h-3.5" />
                {quizScore}/{QUIZ_QUESTIONS.length}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'theory' && (
            <motion.div key="theory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <TheorySection onNext={() => goTo('lab')} />
            </motion.div>
          )}
          {activeTab === 'lab' && (
            <motion.div key="lab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <LabSection onNext={() => goTo('quiz')} />
            </motion.div>
          )}
          {activeTab === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <QuizSection onNext={() => goTo('certificate')} onScoreUpdate={handleScoreUpdate} />
            </motion.div>
          )}
          {activeTab === 'certificate' && (
            <motion.div key="certificate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <CertificateSection
                quizScore={quizScore}
                totalQuestions={QUIZ_QUESTIONS.length}
                studentInfo={studentInfo}
                onInfoChange={handleInfoChange}
                onNext={() => goTo('report')}
              />
            </motion.div>
          )}
          {activeTab === 'report' && (
            <motion.div key="report" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <ReportSection
                quizScore={quizScore}
                totalQuestions={QUIZ_QUESTIONS.length}
                studentInfo={studentInfo}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/60 py-4 text-center text-xs text-slate-400 no-print">
        <span className="font-medium text-slate-600">{EXPERIMENT.title}</span>
        <span className="mx-2">·</span>
        <span className="font-mono">{EXPERIMENT.code} v{EXPERIMENT.version}</span>
      </footer>
    </div>
  );
}
