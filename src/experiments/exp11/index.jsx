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
import { QUIZ_QUESTIONS } from './schemaDesignEngine';

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

export default function Experiment11({ onBack, onOpenProfile }) {
  const { user, recordQuizScore, recordExpCompleted, recordCertificate, recordReport } = useAuth();
  const [activeTab, setActiveTab] = useState('theory');
  const [trials, setTrials] = useState([]);
  const [quizScore, setQuizScore] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: user?.displayName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '') || 'Student Scholar',
    studentId: user?.studentId || user?.username || user?.email || 'KG-LAB-11',
    institution: user?.institution || 'VESIT – Dept. of Computer Engineering',
    instructor: 'Dr. Sharmila Sengupta / Mrs. Abha Tewari / Mrs. Sunita Suralkar',
  });

  // Sync student info when user state hydrates from Firebase
  useEffect(() => {
    if (user) {
      setStudentInfo((prev) => ({
        ...prev,
        name: prev.name && prev.name !== 'Student Scholar' ? prev.name : (user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student Scholar'),
        studentId: prev.studentId || user.studentId || user.username || user.email || 'KG-LAB-11',
        institution: user.institution || prev.institution || 'VESIT – Dept. of Computer Engineering',
      }));
    }
  }, [user]);

  const handleInfoChange = (key, value) => {
    setStudentInfo((prev) => ({ ...prev, [key]: value }));
  };

  const handleScoreUpdate = (score, total) => {
    setQuizScore(score);
    const totalQ = total || QUIZ_QUESTIONS?.length || 15;

    // Persist score & completion status to Cloud Firestore
    if (user) {
      if (recordQuizScore) {
        recordQuizScore(11, score, totalQ);
      }
      if (recordExpCompleted && (score / totalQ) >= 0.6) {
        recordExpCompleted(11, {
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
      recordCertificate(11, {
        studentName: studentInfo.name,
        studentId: studentInfo.studentId,
        score: quizScore ?? 0,
        total: QUIZ_QUESTIONS.length,
        issuedAt: new Date().toISOString()
      });
    }
  };

  const handleReportGenerated = () => {
    if (user && recordReport) {
      recordReport(11, {
        studentName: studentInfo.name,
        trialsCount: trials.length,
        generatedAt: new Date().toISOString()
      });
    }
  };

  const goTo = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <ExperimentNavbar
        title="Exp 11: Design a Knowledge Graph Schema and Import Data"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={goTo}
        onBack={onBack}
        quizScore={quizScore}
        totalQuestions={QUIZ_QUESTIONS?.length || 15}
        tabActiveStyles={TAB_ACTIVE}
        onOpenProfile={onOpenProfile}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'theory' && (
            <motion.div
              key="theory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <TheorySection onGoToLab={() => goTo('lab')} />
            </motion.div>
          )}

          {activeTab === 'lab' && (
            <motion.div
              key="lab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <LabSection
                onRecordTrial={(trial) => setTrials((prev) => [trial, ...prev])}
                trials={trials}
                onGoToQuiz={() => goTo('quiz')}
              />
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <QuizSection
                quizScore={quizScore}
                onScoreUpdate={handleScoreUpdate}
                onGoToCertificate={() => goTo('certificate')}
              />
            </motion.div>
          )}

          {activeTab === 'certificate' && (
            <motion.div
              key="certificate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <CertificateSection
                quizScore={quizScore}
                totalQuestions={QUIZ_QUESTIONS.length}
                studentInfo={studentInfo}
                onInfoChange={handleInfoChange}
                onCertificateObtained={handleCertificateObtained}
                onNext={() => goTo('report')}
              />
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
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
    </div>
  );
}
