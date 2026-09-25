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
import { QUIZ_QUESTIONS } from './bm25Engine';

const TABS = [
  { id: 'theory',      label: 'Theory',         short: 'Theory', icon: BookOpen,     color: 'blue'    },
  { id: 'lab',         label: 'Simulation Lab', short: 'Lab',    icon: FlaskConical, color: 'sky'     },
  { id: 'quiz',        label: 'Quiz',           short: 'Quiz',   icon: HelpCircle,   color: 'rose'    },
  { id: 'certificate', label: 'Certificate',    short: 'Cert.',  icon: Award,        color: 'amber'   },
  { id: 'report',      label: 'Report',         short: 'Report', icon: FileText,     color: 'indigo'  },
];

const TAB_ACTIVE = {
  blue:   'bg-blue-600 text-white shadow-blue-200',
  sky:    'bg-sky-600 text-white shadow-sky-200',
  rose:   'bg-rose-500 text-white shadow-rose-200',
  amber:  'bg-amber-500 text-white shadow-amber-200',
  indigo: 'bg-indigo-600 text-white shadow-indigo-200',
};

export default function Experiment5({ onBack, onOpenProfile }) {
  const { user, recordQuizScore, recordExpCompleted, recordCertificate, recordReport } = useAuth();
  const [activeTab, setActiveTab] = useState('theory');
  const [trials, setTrials] = useState([]);
  const [quizScore, setQuizScore] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: user?.displayName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '') || 'Student Scholar',
    studentId: user?.studentId || user?.username || user?.email || 'IR-LAB-05',
    institution: user?.institution || 'VESIT – Dept. of Computer Engineering',
    instructor: 'Dr. Sharmila Sengupta / Mrs. Abha Tewari / Mrs. Sunita Suralkar',
  });

  // Sync student info when user state hydrates from Firebase
  useEffect(() => {
    if (user) {
      setStudentInfo((prev) => ({
        ...prev,
        name: prev.name && prev.name !== 'Student Scholar' ? prev.name : (user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student Scholar'),
        studentId: prev.studentId || user.studentId || user.username || user.email || 'IR-LAB-05',
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
    const totalQ = total || 10;

    // Persist score & completion status to Cloud Firestore
    if (user) {
      if (recordQuizScore) {
        recordQuizScore(5, score, totalQ);
      }
      if (recordExpCompleted && (score / totalQ) >= 0.6) {
        recordExpCompleted(5, {
          score,
          total: totalQ,
          trialsCount: trials.length,
          completedAt: new Date().toISOString()
        });
      }
    }
  };

  const handleCertificateObtained = () => {
    if (user && recordCertificate) {
      recordCertificate(5, {
        studentName: studentInfo.name,
        studentId: studentInfo.studentId,
        score: quizScore ?? 0,
        total: 10,
        issuedAt: new Date().toISOString()
      });
    }
  };

  const handleReportGenerated = () => {
    if (user && recordReport) {
      recordReport(5, {
        studentName: studentInfo.name,
        trialsCount: trials.length,
        generatedAt: new Date().toISOString()
      });
    }
  };

  const goTo = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      {/* ── Fixed Navbar ── */}
      <ExperimentNavbar
        title="Exp 5: BM25 Based Document Ranking"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={goTo}
        onBack={onBack}
        quizScore={quizScore}
        totalQuestions={10}
        tabActiveStyles={TAB_ACTIVE}
        onOpenProfile={onOpenProfile}
      />

      {/* ── Main Tab Content ── */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'theory' && (
            <motion.div
              key="theory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TheorySection onGoToLab={() => setActiveTab('lab')} />
            </motion.div>
          )}

          {activeTab === 'lab' && (
            <motion.div
              key="lab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <LabSection onAddTrial={handleAddTrial} trialsCount={trials.length} />
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <QuizSection
                onComplete={handleScoreUpdate}
                previousScore={quizScore}
              />
            </motion.div>
          )}

          {activeTab === 'certificate' && (
            <motion.div
              key="certificate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CertificateSection
                quizScore={quizScore}
                totalQuestions={10}
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
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ReportSection
                studentInfo={studentInfo}
                onInfoChange={handleInfoChange}
                trials={trials}
                quizScore={quizScore}
                totalQuestions={10}
                onReportGenerated={handleReportGenerated}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
