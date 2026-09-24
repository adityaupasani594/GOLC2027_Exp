import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FlaskConical, HelpCircle, Award, FileText } from 'lucide-react';
import { ExperimentNavbar } from '../../components/common';
import TheorySection from './components/TheorySection';
import LabSection from './components/LabSection';
import QuizSection, { QUIZ_QUESTIONS } from './components/QuizSection';
import CertificateSection from './components/CertificateSection';
import ReportSection from './components/ReportSection';

const TABS = [
  { id:'theory',      label:'Theory',        short:'Theory', icon:BookOpen,     color:'indigo' },
  { id:'lab',         label:'Simulation Lab', short:'Lab',    icon:FlaskConical, color:'teal'   },
  { id:'quiz',        label:'Quiz',           short:'Quiz',   icon:HelpCircle,   color:'rose'   },
  { id:'certificate', label:'Certificate',    short:'Cert.',  icon:Award,        color:'amber'  },
  { id:'report',      label:'Report',         short:'Report', icon:FileText,     color:'indigo' },
];

const TAB_ACTIVE = {
  indigo: 'bg-indigo-600 text-white shadow-indigo-200',
  teal:   'bg-teal-600 text-white shadow-teal-200',
  rose:   'bg-rose-500 text-white shadow-rose-200',
  amber:  'bg-amber-500 text-white shadow-amber-200',
};

const EXP_CONFIG = {
  expNo: 14,
  title: 'Integration of Information Retrieval with Knowledge Graphs',
  subject: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  courseCode: 'CS-KGIRS-14',
  version: '1.0',
  targetRolls: 'Roll Numbers 66 – 70',
  aim: 'To integrate document retrieval with knowledge-graph-based entity and relationship exploration so that retrieved documents can be examined together with their surrounding contextual information.',
};

export default function Experiment14({ onBack, onOpenProfile }) {
  const [activeTab, setActiveTab] = useState('theory');
  const [trials, setTrials] = useState([]);
  const [quizScore, setQuizScore] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    studentId: '',
    institution: 'VESIT – Dept. of Computer Engineering',
    instructor: 'Dr. Sharmila Sengupta / Mrs. Abha Tewari / Mrs. Sunita Suralkar',
  });

  const handleInfoChange = (key, value) => setStudentInfo(prev => ({ ...prev, [key]: value }));
  const handleScoreUpdate = (score) => setQuizScore(score);

  const goTo = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <ExperimentNavbar
        title="Exp 14: IR + Knowledge Graph Integration"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={goTo}
        onBack={onBack}
        quizScore={quizScore}
        totalQuestions={QUIZ_QUESTIONS.length}
        tabActiveStyles={TAB_ACTIVE}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'theory' && (
            <motion.div key="theory" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.22 }}>
              <TheorySection onGoToLab={() => goTo('lab')} />
            </motion.div>
          )}
          {activeTab === 'lab' && (
            <motion.div key="lab" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.22 }}>
              <LabSection
                onRecordTrial={(t) => setTrials(prev => [...prev, t])}
                trials={trials}
                onGoToQuiz={() => goTo('quiz')}
              />
            </motion.div>
          )}
          {activeTab === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.22 }}>
              <QuizSection onNext={() => goTo('certificate')} onScoreUpdate={handleScoreUpdate} />
            </motion.div>
          )}
          {activeTab === 'certificate' && (
            <motion.div key="certificate" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.22 }}>
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
            <motion.div key="report" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.22 }}>
              <ReportSection
                quizScore={quizScore}
                totalQuestions={QUIZ_QUESTIONS.length}
                studentInfo={studentInfo}
                trials={trials}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="glass border-t border-white/60 py-4 text-center text-xs text-slate-400 no-print flex flex-col sm:flex-row items-center justify-center gap-2">
        <div>
          <span className="font-semibold text-slate-600">IR + Knowledge Graph Integration</span>
          <span className="mx-2">·</span>
          <span className="font-mono">CS-KGIRS-14 · Lab Module 14</span>
        </div>
        <span className="hidden sm:inline">·</span>
        <button onClick={onBack} className="text-teal-600 hover:text-teal-800 font-semibold cursor-pointer underline underline-offset-2">
          Return to 15 Experiments Portal
        </button>
      </footer>
    </div>
  );
}
