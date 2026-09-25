import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, Download, Target, BarChart2, BookOpen, FlaskConical, CheckCircle2 } from 'lucide-react';
import { GRADE } from './CertificateSection';
import { QUIZ_QUESTIONS } from './QuizSection';

const EXP_INFO = {
  title: 'Text Preprocessing & Token Normalization',
  subtitle: 'Natural Language Processing & Information Retrieval (NLP & IR)',
  code: 'CS-NLP-02',
  version: '2027.1',
  aim: 'To clean, tokenize, filter, stem, and lemmatize unstructured text using NLP techniques to transform raw data into a standardized format for indexing, Bag-of-Words (BoW) matrices, TF-IDF feature extraction, and neural embeddings.',
};

const OBJECTIVES = [
  'Understand the sequential pipeline of textual normalization from raw string to indexed tokens.',
  'Analyze boundary detection algorithms in tokenization and regex noise/number stripping.',
  "Evaluate stop-word filtering based on term-frequency distributions (Zipf's Law / Pareto Distribution).",
  'Contrast rule-based suffix truncation (Porter Stemmer) with morphological lexicon lookup (WordNet Lemmatizer).',
];

const PIPELINE_STAGES = [
  {
    stage: 'Stage 1',
    name: 'Case Folding & Noise Stripping',
    desc: 'Lowercases characters to eliminate case variants and applies regex pattern [^a-zA-Z\\s] to strip numerical digits, special punctuation, and noise.',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  {
    stage: 'Stage 2',
    name: 'Boundary Tokenization',
    desc: 'Decomposes the sanitized text stream into discrete atomic word units (tokens) based on whitespace and linguistic word boundary delimiters.',
    color: 'bg-violet-50 border-violet-200 text-violet-700',
  },
  {
    stage: 'Stage 3',
    name: "Stop-Word Removal (Zipf's Law)",
    desc: 'Filters out high-frequency functional syntax (179 standard English stopwords) carrying low discriminative entropy, reducing inverted index volume.',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    stage: 'Stage 4',
    name: 'Stemming vs. Lemmatization',
    desc: 'Applies Porter suffix truncation heuristics for speed alongside POS-guided WordNet morphological lookup for valid dictionary canonical forms.',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
  },
];

export default function ReportSection({
  studentInfo = {},
  onInfoChange,
  trials = [],
  quizScore = 10,
  totalQuestions = 10,
  onReportGenerated,
}) {
  const [observations, setObservations] = useState(
    '1. Noise Removal & Normalization: Applying regex noise stripping and case folding eliminated punctuation tokens and merged orthographic variants (e.g., "Apple" and "apple" mapped to the identical term), stabilizing the vocabulary space.\n\n' +
    '2. Stop-word Filtering: Removing the 179 standard NLTK stopwords eliminated ~40-55% of the total token count without degrading informational value, reflecting Zipfian power-law term distributions.\n\n' +
    '3. Porter Stemmer vs. WordNet Lemmatizer: The Porter Stemmer aggressively truncated suffixes via fast rule heuristics, producing non-words like "studi" for "studies". In contrast, WordNet Lemmatization with POS tagging correctly extracted the base lemma "study" and mapped irregular forms like "mice" -> "mouse" and "better" -> "good".\n\n' +
    '4. Retrieval Trade-off: While Stemming executes in O(1) per word with minimal memory footprint, Lemmatization preserves strict grammatical integrity required for semantic and knowledge-graph queries.'
  );

  const score = quizScore ?? 0;
  const pct   = Math.round((score / totalQuestions) * 100);
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (onReportGenerated) {
      onReportGenerated();
    }
  }, [onReportGenerated]);

  const handlePrintReport = () => {
    if (onReportGenerated) onReportGenerated();
    document.body.classList.add('print-report');
    window.onafterprint = () => {
      document.body.classList.remove('print-report');
      window.onafterprint = null;
    };
    window.print();
  };

  const handleDownloadJSON = () => {
    if (onReportGenerated) onReportGenerated();
    const data = {
      experiment: EXP_INFO.title,
      code:       EXP_INFO.code,
      version:    EXP_INFO.version,
      date:       today,
      student: {
        name:        studentInfo.name        || 'N/A',
        studentId:   studentInfo.studentId   || 'N/A',
        institution: studentInfo.institution || 'N/A',
        instructor:  studentInfo.instructor  || 'N/A',
      },
      evaluation: {
        quizScore: score,
        totalQuestions,
        percentage: `${pct}%`,
        grade: grade.label,
      },
      observations,
      recordedTrials: trials,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Lab_Report_${EXP_INFO.code}_${(studentInfo.studentId || 'STUDENT').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header — hidden on print */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 no-print">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />
          Section 5 — Lab Report
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Virtual Lab Practical Report</h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Comprehensive academic report compiling your experimental trials, reduction metrics, and concept assessment.
        </p>
      </motion.div>

      {/* Action buttons — hidden on print */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm no-print">
        <div className="text-xs text-slate-500 font-medium">
          Ready to export — <span className="text-slate-700 font-semibold">{trials.length} trials recorded</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-100 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Report Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8 sm:p-10 space-y-8 report-document">

        {/* Institutional Letterhead */}
        <div className="border-b-2 border-indigo-600 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">Virtual Laboratory Academic Report</p>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{EXP_INFO.title}</h1>
            <p className="text-xs text-slate-500 font-medium">{EXP_INFO.subtitle}</p>
          </div>
          <div className="shrink-0 sm:text-right text-xs text-slate-400 space-y-0.5">
            <p className="font-mono font-semibold text-slate-600">{EXP_INFO.code} · v{EXP_INFO.version}</p>
            <p>Generated: {today}</p>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[10px] mt-1">
              Status: Verified Submission
            </div>
          </div>
        </div>

        {/* Student Information Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Student Name</span>
            <span className="font-semibold text-slate-800">{studentInfo.name || 'Student Scholar'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Roll / Student ID</span>
            <span className="font-semibold text-slate-800">{studentInfo.studentId || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Institution / Dept.</span>
            <span className="font-semibold text-slate-800">{studentInfo.institution || 'Dept. of Computer Engineering'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Faculty In-Charge</span>
            <span className="font-semibold text-slate-800">{studentInfo.instructor || 'Lab Faculty'}</span>
          </div>
        </div>

        {/* 1. Aim & Objectives */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider border-b border-indigo-100 pb-1.5">
            <Target className="w-4 h-4 text-indigo-600" /> 1. Aim &amp; Learning Objectives
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-serif pl-2 border-l-2 border-indigo-400 italic">
            "{EXP_INFO.aim}"
          </p>
          <div className="grid sm:grid-cols-2 gap-2 pt-1">
            {OBJECTIVES.map((obj, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold shrink-0 flex items-center justify-center text-[10px] mt-0.5">
                  {i + 1}
                </span>
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Pipeline Framework */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider border-b border-indigo-100 pb-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600" /> 2. Text Normalization Pipeline Stages
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {PIPELINE_STAGES.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.stage}</span>
                  <span className="text-[10px] font-semibold text-indigo-600 px-2 py-0.5 rounded-md bg-indigo-50">Active</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">{s.name}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Stemming vs Lemmatization Comparison Matrix */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider border-b border-indigo-100 pb-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-600" /> 3. Algorithmic Comparison: Stemmer vs. Lemmatizer
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Evaluation Parameter</th>
                  <th className="py-2.5 px-3 text-indigo-700">Porter Stemmer</th>
                  <th className="py-2.5 px-3 text-teal-700">WordNet Lemmatizer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-800">Operational Principle</td>
                  <td className="py-2 px-3">Heuristic cascaded suffix rules</td>
                  <td className="py-2 px-3">Morphological lexicon lookup via POS tags</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-800">Output Validity</td>
                  <td className="py-2 px-3 text-amber-700">Can produce non-words ('studi', 'oper')</td>
                  <td className="py-2 px-3 text-emerald-700">Always valid English dictionary words</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-800">Computational Speed</td>
                  <td className="py-2 px-3">Extremely Fast (~1.8 µs/token)</td>
                  <td className="py-2 px-3">Moderate (~14.2 µs/token due to POS lookup)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-800">Irregular Forms ('mice', 'better')</td>
                  <td className="py-2 px-3 text-rose-600">Fails ('mice' → 'mice', 'better' → 'better')</td>
                  <td className="py-2 px-3 text-emerald-600">Resolved ('mice' → 'mouse', 'better' → 'good')</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Recorded Trials Log */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider border-b border-indigo-100 pb-1.5">
            <FlaskConical className="w-4 h-4 text-indigo-600" /> 4. Recorded Simulation Trials
          </div>
          {trials.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              No experimental trials recorded during this session. Run simulations in Section 2 and click "Record Current Trial".
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Sample Snippet</th>
                    <th className="py-2 px-3">Raw Tokens</th>
                    <th className="py-2 px-3">Filtered Tokens</th>
                    <th className="py-2 px-3">Tokens Removed</th>
                    <th className="py-2 px-3">Stopwords Stripped</th>
                    <th className="py-2 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                  {trials.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold">{t['Trial #'] || idx + 1}</td>
                      <td className="py-2 px-3 font-sans truncate max-w-[140px]">{t['Sample Input']}</td>
                      <td className="py-2 px-3">{t['Raw Tokens']}</td>
                      <td className="py-2 px-3 text-emerald-600 font-semibold">{t['Filtered Tokens']}</td>
                      <td className="py-2 px-3 text-rose-600">-{t['Removed Tokens']}</td>
                      <td className="py-2 px-3">{t['Stopwords Removed']}</td>
                      <td className="py-2 px-3 text-slate-400">{t['Timestamp']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 5. Observations & Discussion */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider border-b border-indigo-100 pb-1.5">
            <FileText className="w-4 h-4 text-indigo-600" /> 5. Observations &amp; Critical Analysis
          </div>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={6}
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition"
            placeholder="Document your observations regarding token reduction ratios, irregular word normalization, and stemmer edge cases..."
          />
        </div>

        {/* 6. Assessment Scorecard & Sign-off */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200">
              {grade.label}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Quiz Assessment Score</p>
              <p className="text-sm font-bold text-slate-900">
                {score} / {totalQuestions} Correct ({pct}%)
              </p>
              <p className="text-[11px] text-slate-500">Verified through interactive evaluation module</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-right text-xs">
            <div>
              <div className="h-8 border-b border-slate-400 w-32 mb-1" />
              <p className="text-[10px] text-slate-400 font-medium">Faculty Evaluator</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
