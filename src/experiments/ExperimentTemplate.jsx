import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  FlaskConical,
  HelpCircle,
  FileText,
  CheckCircle2,
  Code2,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Play,
  RotateCcw
} from 'lucide-react';
import { ExperimentNavbar, UnifiedQuizSection } from '../components/common';
import { EXPERIMENTS_LIST } from '../data/experimentsData';
import { useAuth } from '../context/AuthContext';

export default function ExperimentTemplate({ expNumber, onBack, children, onOpenProfile }) {
  const { user, recordExpCompleted, recordReport } = useAuth();
  const [activeTab, setActiveTab] = useState('theory');
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const experiment = EXPERIMENTS_LIST.find(e => e.number === expNumber) || {
    number: expNumber,
    title: 'Laboratory Module',
    shortTitle: 'Lab Module',
    explanation: 'Experiment implementation in progress.',
    expectedOutcome: 'Student will achieve deep conceptual and practical understanding.',
    detailedObjectives: ['Understand theoretical foundations.', 'Implement algorithmic pipelines.', 'Analyze empirical results.'],
    keyTopics: ['Foundational Concepts', 'Algorithm Implementation', 'Benchmarking'],
    techStack: ['Python', 'Data Structures', 'Benchmarking Suite'],
    trackLabel: 'Information Retrieval'
  };

  const tabs = [
    { id: 'theory', label: 'Theory & Objectives', short: 'Theory', icon: BookOpen, color: 'indigo' },
    { id: 'lab', label: 'Simulation & Code', short: 'Lab', icon: FlaskConical, color: 'violet' },
    { id: 'assessment', label: 'Assessment', short: 'Quiz', icon: HelpCircle, color: 'rose' },
    { id: 'report', label: 'Lab Report', short: 'Report', icon: FileText, color: 'teal' },
  ];

  const tabActiveStyles = {
    indigo: 'bg-indigo-600 text-white shadow-indigo-200',
    violet: 'bg-violet-600 text-white shadow-violet-200',
    rose: 'bg-rose-500 text-white shadow-rose-200',
    teal: 'bg-teal-600 text-white shadow-teal-200',
  };

  const runSimulation = () => {
    setIsRunning(true);
    if (recordExpCompleted) {
      recordExpCompleted(expNumber, { completedAt: new Date().toISOString() });
    }
    setConsoleOutput([`[Init] Launching pipeline for "${experiment.shortTitle || experiment.title}"...`]);
    setTimeout(() => {
      setConsoleOutput(prev => [
        ...prev,
        `[Processing] Loading dataset and configuring parameters for "${experiment.shortTitle || experiment.title}"...`,
      ]);
    }, 400);
    setTimeout(() => {
      setConsoleOutput(prev => [
        ...prev,
        `[Success] Pipeline execution complete. Ready for custom experiment implementation.`,
        `[Note] Place your experiment algorithms and UI in src/experiments/exp${expNumber}/`,
      ]);
      setIsRunning(false);
    }, 900);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* ── Sticky Navbar ── */}
      <ExperimentNavbar
        title={experiment.shortTitle || experiment.title}
        expId={expNumber}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
        onBack={onBack}
        tabActiveStyles={tabActiveStyles}
        onOpenProfile={onOpenProfile}
      />

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* If custom children are provided, render them */}
        {children ? (
          children
        ) : (
          <AnimatePresence mode="wait">
            {/* Tab 1: Theory */}
            {activeTab === 'theory' && (
              <motion.div
                key="theory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                {/* Hero Header */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15">
                      Experiment {expNumber < 10 ? `0${expNumber}` : expNumber}
                    </span>
                    <span>•</span>
                    <span>{experiment.trackLabel}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {experiment.title}
                  </h2>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-3xl">
                    {experiment.explanation}
                  </p>
                </div>

                {/* Grid: Objectives & Key Topics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Detailed Objectives */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Learning Objectives</h3>
                    </div>
                    <ul className="space-y-3">
                      {experiment.detailedObjectives?.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                            {i + 1}
                          </span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Expected Outcomes & Tech Stack */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Expected Outcome</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-emerald-900">
                        {experiment.expectedOutcome}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Prescribed Technologies
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {experiment.techStack?.map((tech, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Concepts Tags */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Key Topics & Theoretical Concepts
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {experiment.keyTopics?.map((topic, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50/70 text-indigo-700 border border-indigo-100">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA to start lab */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => setActiveTab('lab')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer"
                  >
                    <FlaskConical className="w-4 h-4" />
                    <span>Proceed to Interactive Simulation</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Simulation / Lab */}
            {activeTab === 'lab' && (
              <motion.div
                key="lab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                {/* Simulation Control Bar */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Simulation Workbench: Experiment {expNumber}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Interactive testbed for {experiment.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConsoleOutput([])}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                    <button
                      onClick={runSimulation}
                      disabled={isRunning}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-60"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isRunning ? 'Executing...' : 'Run Pipeline'}</span>
                    </button>
                  </div>
                </div>

                {/* Developer Implementation Instructions Box */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-indigo-900 font-bold text-sm">
                    <Code2 className="w-4 h-4 text-indigo-600" />
                    <span>Modular Experiment Scaffold Ready</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This experiment is encapsulated in{' '}
                    <code className="px-1.5 py-0.5 rounded bg-white font-mono text-indigo-600 border border-indigo-200">
                      src/experiments/exp{expNumber}/
                    </code>
                    . You can add dedicated visualization components, interactive parameter sliders, algorithms, and benchmark datasets directly inside this folder.
                  </p>
                </div>

                {/* Interactive Console Output */}
                <div className="rounded-2xl bg-slate-950 text-slate-200 p-5 font-mono text-xs shadow-lg border border-slate-800">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Simulation Terminal Output</span>
                    </div>
                    <span>Python 3.11 • Virtual Environment</span>
                  </div>
                  <div className="space-y-1.5 min-h-[140px]">
                    {consoleOutput.length === 0 ? (
                      <p className="text-slate-500 italic">
                        Click "Run Pipeline" above to execute the simulation harness...
                      </p>
                    ) : (
                      consoleOutput.map((line, idx) => (
                        <p key={idx} className="leading-relaxed">
                          <span className="text-emerald-400 font-bold">&gt; </span>
                          {line}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Assessment */}
            {activeTab === 'assessment' && (
              <motion.div
                key="assessment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <UnifiedQuizSection
                  expNumber={expNumber}
                  expTitle={experiment.title}
                  rawQuestions={experiment.quizQuestions || [
                    {
                      id: 1,
                      question: 'What is Named Entity Recognition (NER) primarily used for in Knowledge Graph construction?',
                      options: [
                        'Detecting and classifying mentions of rigid designators (people, places, organizations) in text',
                        'Compressing inverted indexes into bitmap vectors',
                        'Calculating Cosine Similarity between documents',
                        'Tokenizing audio waveforms into acoustic spectrograms'
                      ],
                      answer: 0,
                      explanation: 'NER locates spans of unstructured text and classifies them into predefined semantic categories, serving as candidate entity nodes in a Knowledge Graph.'
                    },
                    {
                      id: 2,
                      question: 'In BIO tagging schemes used for Sequence Tagging, what does the "I" prefix designate?',
                      options: [
                        'Initial token of an entity',
                        'Inside an ongoing entity mention',
                        'Ignored word not part of an entity',
                        'Inverse document frequency'
                      ],
                      answer: 1,
                      explanation: 'In BIO format, B stands for Beginning of an entity, I stands for Inside (continuation) of the entity, and O stands for Outside.'
                    },
                    {
                      id: 3,
                      question: 'Why is Entity Linking (Disambiguation) essential after Entity Recognition?',
                      options: [
                        'To format entities into JSON files',
                        'To map ambiguous textual mentions (e.g. "Apple" the company vs "apple" the fruit) to canonical KG node IDs',
                        'To delete all entities longer than 10 characters',
                        'To perform stem truncation via the Porter stemmer'
                      ],
                      answer: 1,
                      explanation: 'Entity Linking resolves polysemy and homonyms by anchoring surface mentions to unambiguous canonical entries in the knowledge base.'
                    },
                    {
                      id: 4,
                      question: 'Which neural architecture is commonly used for contextual sequence tagging in modern NER pipelines?',
                      options: [
                        'Bidirectional LSTM-CRF or Transformer-based token classifiers (e.g. BERT)',
                        'K-Means Clustering',
                        'Naive Bayes Classifier',
                        'Inverted Block Postings Lists'
                      ],
                      answer: 0,
                      explanation: 'BiLSTM-CRF and Transformer encoders (like BERT) encode bidirectional token context and model tag-to-tag transition probabilities effectively.'
                    },
                    {
                      id: 5,
                      question: 'What is the key evaluation metric for Named Entity Recognition models?',
                      options: [
                        'Micro/Macro-averaged Span-level F1-score (Precision & Recall)',
                        'Mean Reciprocal Rank (MRR)',
                        'Lossless LZW compression ratio',
                        'PageRank eigenvalue'
                      ],
                      answer: 0,
                      explanation: 'NER models are evaluated on strict span-level boundary and type matching using Precision, Recall, and the harmonic mean F1-score.'
                    }
                  ]}
                  onNext={() => setActiveTab('report')}
                  onScoreUpdate={(correct, total) => {
                    if (recordExpCompleted) {
                      recordExpCompleted(expNumber, { quizScore: correct, quizTotal: total });
                    }
                  }}
                />
              </motion.div>
            )}

            {/* Tab 4: Report */}
            {activeTab === 'report' && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Laboratory Report: {experiment.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600">
                  Standardized experimental report generator for submission to department evaluators.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p><span className="font-bold text-slate-700">Course:</span> Information Retrieval & Knowledge Graphs</p>
                  <p><span className="font-bold text-slate-700">Experiment:</span> Lab {expNumber} — {experiment.title}</p>
                  <p><span className="font-bold text-slate-700">Platform:</span> Virtual Laboratory Suite • GOLC 2027</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/60 py-4 text-center text-xs text-slate-400 no-print flex flex-col sm:flex-row items-center justify-center gap-2">
        <div>
          <span className="font-semibold text-slate-600">{experiment.title}</span>
          <span className="mx-2">·</span>
          <span className="font-mono">Virtual Laboratory</span>
        </div>
        <span className="hidden sm:inline">·</span>
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline underline-offset-2"
        >
          ← Return to Laboratory Portal
        </button>
      </footer>
    </div>
  );
}
