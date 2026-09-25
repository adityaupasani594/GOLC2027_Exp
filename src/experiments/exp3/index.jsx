import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FlaskConical, HelpCircle, Award, FileText } from 'lucide-react';
import { ExperimentNavbar } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import TheorySection from './components/TheorySection';
import LabSection from './components/LabSection';
import QuizSection, { QUIZ_QUESTIONS } from './components/QuizSection';
import CertificateSection from './components/CertificateSection';
import ReportSection from './components/ReportSection';

const EXP_CONFIG = {
  expNo: 3,
  title: 'Construction of an Inverted Index',
  subject: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  courseCode: 'CS-KGIRS-03',
  targetRolls: 'Roll Numbers 11 – 15 (Division C)',
  aim: 'To construct and analyze an Inverted Index data structure for a collection of textual documents, explore linguistic preprocessing transformations (tokenization, stopword removal, stemming), and execute Boolean, phrase, and proximity queries with linear-time pointer-merge algorithms.',
};

export default function Experiment3({ onBack, onOpenProfile }) {
  const { user, recordQuizScore, recordExpCompleted, recordCertificate, recordReport } = useAuth();
  const [activeTab, setActiveTab] = useState('theory');
  const [trials, setTrials] = useState([]);
  const [quizScore, setQuizScore] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: user?.displayName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '') || 'Student Scholar',
    studentId: user?.studentId || user?.username || user?.email || 'EXP3-11',
    institution: user?.institution || 'Dept. of Computer Engineering / AI & DS',
    instructor: 'Dr. Sharmila Sengupta / Mrs. Abha Tewari / Mrs. Sunita Suralkar',
  });

  // Sync studentInfo when user auth state updates
  useEffect(() => {
    if (user) {
      setStudentInfo(prev => ({
        ...prev,
        name: prev.name && prev.name !== 'Student Scholar'
          ? prev.name
          : (user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student Scholar'),
        studentId: prev.studentId || user.studentId || user.username || user.email || 'EXP3-11',
        institution: user.institution || prev.institution || 'Dept. of Computer Engineering / AI & DS',
      }));
    }
  }, [user]);

  const persistCertAndReport = useCallback((currentScore, currentInfo, currentTrials) => {
    const totalQ = QUIZ_QUESTIONS?.length || 10;
    const scoreVal = (currentScore !== null && currentScore !== undefined) ? currentScore : null;
    const safeScore = scoreVal !== null ? scoreVal : 0;
    const pct = Math.round((safeScore / totalQ) * 100);
    const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'F';

    if (scoreVal !== null && recordQuizScore) {
      recordQuizScore(3, scoreVal, totalQ);
    }

    if (recordExpCompleted) {
      recordExpCompleted(3, {
        score: safeScore,
        trialsCount: (currentTrials || []).length,
        completedAt: new Date().toISOString()
      });
    }

    if (recordCertificate) {
      recordCertificate({
        expNumber: 3,
        title: EXP_CONFIG.title,
        grade,
        score: safeScore,
        total: totalQ,
        pct,
        certificateId: `IR-2027-03-${(user?.uid || 'STU').slice(-4).toUpperCase()}`,
        studentName: currentInfo?.name || user?.displayName || 'Student Scholar',
        institution: currentInfo?.institution || user?.institution || ''
      });
    }

    if (recordReport) {
      recordReport({
        expNumber: 3,
        title: `${EXP_CONFIG.title} (Inverted Index & Postings Analysis)`,
        summary: {
          mrr: '1.000',
          avgPrecision: '0.960',
          avgRecall: '0.940',
          avgF1: '0.950'
        },
        trialsCount: (currentTrials || []).length,
        studentName: currentInfo?.name || user?.displayName || 'Student Scholar',
        institution: currentInfo?.institution || user?.institution || ''
      });
    }
  }, [user, recordQuizScore, recordExpCompleted, recordCertificate, recordReport]);

  const handleInfoChange = (key, value) => {
    setStudentInfo(prev => {
      const next = { ...prev, [key]: value };
      persistCertAndReport(quizScore, next, trials);
      return next;
    });
  };

  const handleScoreUpdate = (score) => {
    setQuizScore(score);
    persistCertAndReport(score, studentInfo, trials);
  };

  const handleRecordTrial = (t) => {
    setTrials(prev => {
      const next = [t, ...prev];
      if (recordExpCompleted) {
        recordExpCompleted(3, { trialsCount: next.length, lastTrial: t });
      }
      return next;
    });
  };

  const goTo = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'certificate' || tab === 'report') {
      persistCertAndReport(quizScore, studentInfo, trials);
    }
  };

  const tabs = [
    { id: 'theory', label: 'Theory', short: 'Theory', icon: BookOpen, color: 'indigo' },
    { id: 'lab', label: 'Simulation Lab', short: 'Lab', icon: FlaskConical, color: 'blue' },
    { id: 'quiz', label: 'Quiz', short: 'Quiz', icon: HelpCircle, color: 'rose' },
    { id: 'certificate', label: 'Certificate', short: 'Cert.', icon: Award, color: 'amber' },
    { id: 'report', label: 'Report', short: 'Report', icon: FileText, color: 'teal' },
  ];

  const TAB_ACTIVE = {
    indigo: 'bg-indigo-600 text-white shadow-indigo-200',
    blue: 'bg-blue-600 text-white shadow-blue-200',
    rose: 'bg-rose-500 text-white shadow-rose-200',
    amber: 'bg-amber-500 text-white shadow-amber-200',
    teal: 'bg-teal-600 text-white shadow-teal-200',
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <ExperimentNavbar
        title="Exp 3: Construction of an Inverted Index"
        expId={3}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={goTo}
        onBack={onBack}
        quizScore={quizScore}
        totalQuestions={QUIZ_QUESTIONS.length}
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
              className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
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
              className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
            >
              <LabSection
                onRecordTrial={handleRecordTrial}
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
                onNext={() => goTo('certificate')}
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
                onNext={() => goTo('report')}
                onCertificateObtained={() => persistCertAndReport(quizScore, studentInfo, trials)}
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
                quizScore={quizScore}
                totalQuestions={QUIZ_QUESTIONS.length}
                studentInfo={studentInfo}
                trials={trials}
                onReportGenerated={() => persistCertAndReport(quizScore, studentInfo, trials)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="glass border-t border-slate-200/60 py-4 text-center text-xs text-slate-500 no-print flex flex-col sm:flex-row items-center justify-center gap-2">
        <div>
          <span className="font-semibold text-slate-700">Construction of an Inverted Index</span>
          <span className="mx-2">&bull;</span>
          <span className="font-mono">Virtual Laboratory (KGIRS)</span>
        </div>
        <span className="hidden sm:inline">&bull;</span>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline underline-offset-2"
        >
          &larr; Return to Laboratory Portal
        </button>
      </footer>
    </div>
  );
}
