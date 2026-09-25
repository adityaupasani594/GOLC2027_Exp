import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FlaskConical, HelpCircle, Award, FileText } from 'lucide-react';
import { ExperimentNavbar } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import TheorySection from './components/TheorySection';
import LabSection from './components/LabSection';
import QuizSection from './components/QuizSection';
import CertificateSection from './components/CertificateSection';
import ReportSection from './components/ReportSection';
import { QUIZ_QUESTIONS } from './entityGraphEngine';

const TABS = [
  { id: 'theory',      label: 'Theory',         short: 'Theory', icon: BookOpen,     color: 'emerald' },
  { id: 'lab',         label: 'Simulation Lab', short: 'Lab',    icon: FlaskConical, color: 'teal'    },
  { id: 'quiz',        label: 'Quiz',           short: 'Quiz',   icon: HelpCircle,   color: 'rose'    },
  { id: 'certificate', label: 'Certificate',    short: 'Cert.',  icon: Award,        color: 'amber'   },
  { id: 'report',      label: 'Report',         short: 'Report', icon: FileText,     color: 'indigo'  },
];

const TAB_ACTIVE = {
  emerald: 'bg-emerald-600 text-white shadow-emerald-200',
  teal:    'bg-teal-600 text-white shadow-teal-200',
  rose:    'bg-rose-500 text-white shadow-rose-200',
  amber:   'bg-amber-500 text-white shadow-amber-200',
  indigo:  'bg-indigo-600 text-white shadow-indigo-200',
};

export default function Experiment8({ onBack, onOpenProfile }) {
  const { user, recordQuizScore, recordExpCompleted, recordCertificate, recordReport } = useAuth();
  const [activeTab, setActiveTab] = useState('theory');
  const [trials, setTrials] = useState([]);
  const [quizScore, setQuizScore] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: user?.displayName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '') || 'Student Scholar',
    studentId: user?.studentId || user?.username || user?.email || 'KGIRS-EXP-08',
    institution: user?.institution || 'VESIT – Dept. of Computer Engineering',
    instructor: 'Dr. Sharmila Sengupta / Mrs. Abha Tewari / Mrs. Sunita Suralkar',
  });

  // Sync student info when user state hydrates from Firebase
  useEffect(() => {
    if (user) {
      setStudentInfo((prev) => ({
        ...prev,
        name: prev.name && prev.name !== 'Student Scholar' ? prev.name : (user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student Scholar'),
        studentId: prev.studentId || user.studentId || user.username || user.email || 'KGIRS-EXP-08',
        institution: user.institution || prev.institution || 'VESIT – Dept. of Computer Engineering',
      }));
    }
  }, [user]);

  const handleInfoChange = (key, value) => {
    setStudentInfo((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddTrial = (newTrial) => {
    setTrials((prev) => [newTrial, ...prev]);
  };

  const handleScoreUpdate = (score, total) => {
    setQuizScore(score);
    const totalQ = total || QUIZ_QUESTIONS?.length || 10;

    // Persist Quiz Score & Experiment Completion to Cloud Firestore
    if (recordQuizScore) {
      recordQuizScore(8, score, totalQ);
    }
    if (recordExpCompleted) {
      recordExpCompleted(8, {
        quizScore: score,
        totalQuestions: totalQ,
        completedAt: new Date().toISOString()
      });
    }
  };

  const handleCertificateObtained = () => {
    if (recordCertificate) {
      recordCertificate(8, {
        studentName: studentInfo.name,
        studentId: studentInfo.studentId,
        score: quizScore,
        obtainedAt: new Date().toISOString()
      });
    }
  };

  const handleReportGenerated = () => {
    if (recordReport) {
      recordReport(8, {
        trialsCount: trials.length,
        studentName: studentInfo.name,
        generatedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50">
      {/* ── Sticky Lab Navigation Bar ── */}
      <ExperimentNavbar
        title="Identify Graph Entities & Probabilistic Retrieval"
        expId={8}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
        onBack={onBack}
        tabActiveStyles={TAB_ACTIVE}
        onOpenProfile={onOpenProfile}
      />

      {/* ── Main Tab Content ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'theory' && (
            <motion.div
              key="theory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TheorySection onProceedToLab={() => setActiveTab('lab')} />
            </motion.div>
          )}

          {activeTab === 'lab' && (
            <motion.div
              key="lab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <LabSection onAddTrial={handleAddTrial} trials={trials} />
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <QuizSection
                onComplete={handleScoreUpdate}
                previousScore={quizScore}
                onGoToCertificate={() => setActiveTab('certificate')}
                onNext={() => setActiveTab('certificate')}
              />
            </motion.div>
          )}

          {activeTab === 'certificate' && (
            <motion.div
              key="certificate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CertificateSection
                quizScore={quizScore}
                totalQuestions={QUIZ_QUESTIONS.length}
                studentInfo={studentInfo}
                onInfoChange={handleInfoChange}
                onNext={() => setActiveTab('report')}
                onCertificateObtained={handleCertificateObtained}
              />
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ReportSection
                studentInfo={studentInfo}
                onInfoChange={handleInfoChange}
                trials={trials}
                quizScore={quizScore}
                totalQuestions={QUIZ_QUESTIONS.length}
                onReportGenerated={handleReportGenerated}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-4 text-center text-xs text-slate-400 no-print flex flex-col sm:flex-row items-center justify-center gap-2">
        <div>
          <span className="font-semibold text-slate-600">Experiment 08: Identify Graph Entities & Probabilistic Retrieval</span>
          <span className="mx-2">·</span>
          <span className="font-mono">Virtual Laboratory Suite</span>
        </div>
        <span className="hidden sm:inline">·</span>
        <button
          onClick={onBack}
          className="text-emerald-600 hover:text-emerald-800 font-semibold cursor-pointer underline underline-offset-2"
        >
          ← Return to Laboratory Portal
        </button>
      </footer>
    </div>
  );
}
