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
  { id: 'theory',      label: 'Theory',        short: 'Theory', icon: BookOpen,     color: 'indigo' },
  { id: 'lab',         label: 'Simulation Lab', short: 'Lab',    icon: FlaskConical, color: 'violet' },
  { id: 'quiz',        label: 'Quiz',           short: 'Quiz',   icon: HelpCircle,   color: 'rose'   },
  { id: 'certificate', label: 'Certificate',    short: 'Cert.',  icon: Award,        color: 'amber'  },
  { id: 'report',      label: 'Report',         short: 'Report', icon: FileText,     color: 'teal'   },
];

const TAB_ACTIVE = {
  indigo: 'bg-indigo-600 text-white shadow-indigo-200',
  violet: 'bg-violet-600 text-white shadow-violet-200',
  rose:   'bg-rose-500 text-white shadow-rose-200',
  amber:  'bg-amber-500 text-white shadow-amber-200',
  teal:   'bg-teal-600 text-white shadow-teal-200',
};

const EXP_CONFIG = {
  expNo: 12,
  title: 'Dense Embedding-Based Semantic Search',
  subject: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  courseCode: 'CS-KGIRS-12',
  version: '1.0',
  targetRolls: 'Roll Numbers 11 – 15 (Division C)',
  aim: 'To implement and analyse a dense embedding-based semantic search system using the all-MiniLM-L6-v2 sentence-transformer model, compute cosine similarity scores for query-document matching, visualise the 384-dimensional vector space via PCA, and evaluate the system using Precision@K, Recall@K, F1@K and MRR.',
  objectives: [
    'Encode documents and queries into 384-dimensional dense vectors using the all-MiniLM-L6-v2 sentence-transformer.',
    'Compute L2-normalised cosine similarity between query and document embeddings for ranked retrieval.',
    'Visualise the high-dimensional embedding space using 2-D PCA projections.',
    'Run Top-K retrieval with a configurable similarity threshold and record results.',
    'Evaluate retrieval quality using Precision@K, Recall@K, F1@K, and Mean Reciprocal Rank (MRR).',
    'Compare dense semantic retrieval with traditional keyword-based search and discuss trade-offs.',
  ],
};

export default function Experiment12({ onBack, onOpenProfile }) {
  const [activeTab, setActiveTab]     = useState('theory');
  const [trials,    setTrials]        = useState([]);
  const [quizScore, setQuizScore]     = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    studentId: '',
    institution: 'VESIT – Dept. of Computer Engineering',
    instructor: 'Dr. Sharmila Sengupta / Mrs. Abha Tewari / Mrs. Sunita Suralkar',
  });

  const handleInfoChange = (key, value) =>
    setStudentInfo(prev => ({ ...prev, [key]: value }));

  const handleScoreUpdate = (score) => setQuizScore(score);

  const goTo = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <ExperimentNavbar
        title="Exp 12: Dense Embedding-Based Semantic Search"
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
            <motion.div key="theory" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration: 0.22 }}>
              <TheorySection onGoToLab={() => goTo('lab')} />
            </motion.div>
          )}
          {activeTab === 'lab' && (
            <motion.div key="lab" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration: 0.22 }}>
              <LabSection
                onRecordTrial={(t) => setTrials(prev => [...prev, t])}
                trials={trials}
                onGoToQuiz={() => goTo('quiz')}
              />
            </motion.div>
          )}
          {activeTab === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration: 0.22 }}>
              <QuizSection onNext={() => goTo('certificate')} onScoreUpdate={handleScoreUpdate} />
            </motion.div>
          )}
          {activeTab === 'certificate' && (
            <motion.div key="certificate" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration: 0.22 }}>
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
            <motion.div key="report" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration: 0.22 }}>
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
          <span className="font-semibold text-slate-600">Dense Embedding-Based Semantic Search</span>
          <span className="mx-2">·</span>
          <span className="font-mono">CS-KGIRS-12 · Lab Module 12</span>
        </div>
        <span className="hidden sm:inline">·</span>
        <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline underline-offset-2">
          ← Return to 15 Experiments Portal
        </button>
      </footer>
    </div>
  );
}
