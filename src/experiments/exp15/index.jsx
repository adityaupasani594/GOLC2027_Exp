import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  FlaskConical,
  HelpCircle,
  Award,
  FileText
} from 'lucide-react';
import { ExperimentNavbar } from '../../components/common';
import TheorySection from './components/TheorySection';
import LabSection from './components/LabSection';
import QuizSection from './components/QuizSection';
import CertificateSection from './components/CertificateSection';
import ReportSection from './components/ReportSection';
import { EXPERIMENT, QUIZ_QUESTIONS } from './data/labData';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { id: 'theory', label: 'Theory', short: 'Theory', icon: BookOpen, color: 'indigo' },
  { id: 'lab', label: 'Visual Lab', short: 'Lab', icon: FlaskConical, color: 'violet' },
  { id: 'quiz', label: 'Quiz', short: 'Quiz', icon: HelpCircle, color: 'rose' },
  { id: 'certificate', label: 'Certificate', short: 'Cert.', icon: Award, color: 'amber' },
  { id: 'report', label: 'Report', short: 'Report', icon: FileText, color: 'teal' },
];

const TAB_ACTIVE = {
  indigo: 'bg-indigo-600 text-white shadow-indigo-200',
  violet: 'bg-violet-600 text-white shadow-violet-200',
  rose: 'bg-rose-500 text-white shadow-rose-200',
  amber: 'bg-amber-500 text-white shadow-amber-200',
  teal: 'bg-teal-600 text-white shadow-teal-200',
};

export default function Experiment15({ onBack }) {
  const { user, recordQuizScore, recordExpCompleted } = useAuth();
  const [activeTab, setActiveTab] = useState('theory');
  const [quizScore, setQuizScore] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: user?.displayName || (user ? `${user.firstName} ${user.lastName}`.trim() : ''),
    studentId: user?.username || user?.email || '',
    institution: user?.institution || 'VESIT - Dept. of Computer Engineering',
    instructor: 'Dr. Sharmila Sengupta / Mrs. Abha Tewari / Mrs. Sunita Suralkar',
  });

  // Update studentInfo if user logs in during the session
  React.useEffect(() => {
    if (user) {
      setStudentInfo(prev => ({
        ...prev,
        name: prev.name || user.displayName || `${user.firstName} ${user.lastName}`.trim(),
        studentId: prev.studentId || user.username || user.email || '',
        institution: user.institution || prev.institution,
      }));
    }
  }, [user]);

  const handleInfoChange = (key, value) =>
    setStudentInfo(prev => ({ ...prev, [key]: value }));

  const handleScoreUpdate = (score) => {
    setQuizScore(score);
    if (recordQuizScore) {
      recordQuizScore(15, score, QUIZ_QUESTIONS?.length || 5);
    }
    if (recordExpCompleted) {
      recordExpCompleted(15, { score });
    }
  };

  const goTo = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* ── Sticky Navbar for Experiment 15 ── */}
      <ExperimentNavbar
        title="Exp 15: Evaluation of Retrieval Systems"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={goTo}
        onBack={onBack}
        quizScore={quizScore}
        totalQuestions={QUIZ_QUESTIONS.length}
        tabActiveStyles={TAB_ACTIVE}
      />

      {/* ── Main content for Experiment 15 ── */}
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

      {/* Exp 15 Footer */}
      <footer className="glass border-t border-white/60 py-4 text-center text-xs text-slate-400 no-print flex flex-col sm:flex-row items-center justify-center gap-2">
        <div>
          <span className="font-semibold text-slate-600">{EXPERIMENT.title}</span>
          <span className="mx-2">·</span>
          <span className="font-mono">{EXPERIMENT.code} v{EXPERIMENT.version}</span>
        </div>
        <span className="hidden sm:inline">·</span>
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline underline-offset-2"
        >
          ← Return to 15 Experiments Portal
        </button>
      </footer>
    </div>
  );
}
