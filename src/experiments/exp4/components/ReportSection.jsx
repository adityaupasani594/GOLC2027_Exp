import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, Target, BarChart2, BookOpen, FlaskConical, CheckCircle2 } from 'lucide-react';
import { GRADE } from './CertificateSection';

const EXP_INFO = {
  title: 'TF-IDF Based Document Retrieval',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems',
  code: 'IR-VSM-04',
  version: '2027.1',
  aim: 'To represent a document collection and search queries as TF-IDF weighted vectors in Salton\'s vector space model, rank documents using L2-normalized cosine similarity, and systematically evaluate the impact of term frequency scaling and inverse document frequency dampening across retrieval evaluation benchmarks (Precision@k, Recall@k, MAP, and nDCG).',
};

const OBJECTIVES = [
  'Construct a corpus vocabulary through lower-casing, regex cleaning, and stop-word filtering.',
  'Formulate local Term Frequency (TF) using raw, length-normalized, and log-scaled schemes.',
  'Compute global Document Frequency (df) and Sparck Jones Inverse Document Frequency (IDF).',
  'Calculate L2-normalized Cosine Similarity to neutralize document length bias.',
  'Evaluate retrieval performance using Precision@k, Recall@k, MAP, and rank-discounted nDCG@k.'
];

const PIPELINE_STAGES = [
  {
    stage: 'Stage 1',
    name: 'Corpus Collection & Ingestion',
    desc: 'Load unstructured multi-document text collections, split into clean document records, and establish document identifiers (D1..Dn).',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    stage: 'Stage 2',
    name: 'Tokenization & Stop-Word Removal',
    desc: 'Lower-case strings, strip non-alphanumeric punctuation, drop English stop-words, and extract shared collection vocabulary V.',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  {
    stage: 'Stage 3',
    name: 'TF & IDF Statistical Weighting',
    desc: 'Compute local term frequency tf(t, d) and collection-wide inverse document frequency idf(t) = log10(N / df_t).',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
  },
  {
    stage: 'Stage 4',
    name: 'Vector Space Projection & Scoring',
    desc: 'Synthesize sparse TF-IDF vectors w(t, d) = tf * idf and evaluate directional cosine alignment cos(q, d) = (q . d) / (||q|| * ||d||).',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
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
    '1. Length Normalization vs. Raw Term Frequency:\n' +
    'Under raw term count TF, longer documents accumulated artificially inflated scores solely due to higher total word volume. Switching to Length-Normalized TF (count / |d|) successfully eliminated this distortion, allowing concise, highly-focused documents to outrank bloated ones.\n\n' +
    '2. Logarithmic Term Frequency Scaling:\n' +
    'Evaluating 1 + log10(tf) demonstrated diminishing returns for repetitive terms. An article mentioning a query term 10 times was properly valued as moderately more relevant than one mentioning it twice, without completely overpowering documents containing all other query terms.\n\n' +
    '3. Rarity as Information (IDF Behavior):\n' +
    'In the Web Search and Spam Filtering benchmarks, generic terms appearing across almost all documents had their weights dampened to zero (log10(N/N) = 0). Rare diagnostic keywords (e.g., "reset", "urgent", "suspended") received maximum IDF weight and accurately drove the top-1 ranked document.\n\n' +
    '4. Cosine Normalization vs. Dot Product:\n' +
    'Without cosine normalization, the raw dot product re-introduced severe document length bias. Dividing by the Euclidean norms ||q||2 · ||d||2 proved essential for achieving length-invariant semantic retrieval in high-dimensional vector spaces.'
  );

  const score = quizScore ?? 10;
  const pct = Math.round((score / totalQuestions) * 100);
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (onReportGenerated) {
      onReportGenerated();
    }
  }, [onReportGenerated]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-slate-800">
      {/* Header — hidden on print */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            Section 5 — Academic Laboratory Report
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Laboratory Practical Report</h2>
          <p className="text-xs sm:text-sm text-slate-500">Official graded documentation of experimental methodology, recorded trials, and analytical observations.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm shrink-0"
        >
          <Printer className="w-4 h-4" />
          Print / Export PDF
        </button>
      </motion.div>

      {/* Formal Printable Document Sheet */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Institutional Title Block */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 font-mono">
            Department of Computer Engineering • Virtual Laboratory System
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Experiment 04: {EXP_INFO.title}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Course: {EXP_INFO.subtitle} • Code: {EXP_INFO.code} • Date: {today}
          </p>
        </div>

        {/* Student Credential & Evaluation Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Scholar Name</span>
            <span className="font-bold text-slate-900 text-sm">{studentInfo.name || 'Student Scholar'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Roll / ID</span>
            <span className="font-mono font-bold text-slate-800">{studentInfo.studentId || 'IR-LAB-04'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Assessment Score</span>
            <span className="font-mono font-extrabold text-blue-600 text-sm">
              {score}/{totalQuestions} ({pct}%)
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Performance Grade</span>
            <span className={`font-mono font-bold text-sm ${grade.color}`}>Grade {grade.label}</span>
          </div>
        </div>

        {/* Experiment Aim & Objectives */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              1. Laboratory Aim
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {EXP_INFO.aim}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              2. Core Methodological Objectives
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {OBJECTIVES.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mathematical Formulas Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
            3. Core Mathematical Formulations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-400 font-sans block mb-1">Term Frequency (Log-Scaled)</span>
              <div className="font-bold text-blue-800">tf = 1 + log10(count)</div>
              <span className="text-[10px] text-slate-500 font-sans block mt-1">Dampens repetition bias</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-400 font-sans block mb-1">Inverse Document Frequency</span>
              <div className="font-bold text-indigo-800">idf = log10(N / df)</div>
              <span className="text-[10px] text-slate-500 font-sans block mt-1">Sparck Jones specificity</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-400 font-sans block mb-1">Cosine Similarity</span>
              <div className="font-bold text-emerald-800">cos(q, d) = (q · d) / (||q|| · ||d||)</div>
              <span className="text-[10px] text-slate-500 font-sans block mt-1">Length-invariant angle</span>
            </div>
          </div>
        </div>

        {/* Pipeline Architecture Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-purple-600" />
            4. Retrieval Execution Stages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {PIPELINE_STAGES.map((s, idx) => (
              <div key={idx} className={`p-3 rounded-xl border ${s.color}`}>
                <div className="font-bold mb-1">{s.stage}: {s.name}</div>
                <div className="text-[11px] leading-relaxed opacity-90">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Experimental Trials Log */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              5. Empirical Trial Results ({trials.length} Recorded)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Logged in simulation</span>
          </div>

          {trials.length > 0 ? (
            <div className="overflow-x-auto border border-slate-200 rounded-xl text-xs">
              <table className="w-full text-left border-collapse font-mono text-[11px]">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Time</th>
                    <th className="p-2">Scenario</th>
                    <th className="p-2">Query</th>
                    <th className="p-2">TF / IDF Scheme</th>
                    <th className="p-2">Top-1 Result</th>
                    <th className="p-2 text-right">Score</th>
                    <th className="p-2 text-right">P@k</th>
                    <th className="p-2 text-right">nDCG@k</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trials.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2 text-slate-500 whitespace-nowrap">{t.timestamp}</td>
                      <td className="p-2 font-sans font-medium text-slate-900">{t.scenario}</td>
                      <td className="p-2 text-blue-700 truncate max-w-[130px] font-sans">"{t.query}"</td>
                      <td className="p-2 text-slate-600 font-sans">{t.tfScheme} / {t.idfScheme}</td>
                      <td className="p-2 text-slate-700 truncate max-w-[150px] font-sans">{t.topDoc}</td>
                      <td className="p-2 text-right font-bold text-slate-900">{t.topScore}</td>
                      <td className="p-2 text-right text-emerald-600 font-bold">{t.precisionAtK}</td>
                      <td className="p-2 text-right text-indigo-600 font-bold">{t.ndcgAtK}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 text-center">
              No live trials logged during this session. Run experiments in the Simulation tab and click "Record Current Trial" to populate empirical benchmarking data.
            </div>
          )}
        </div>

        {/* Observations & Analytical Conclusions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            6. Scientific Observations & Comparative Analysis
          </h3>
          <textarea
            rows={8}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full text-xs sm:text-sm font-sans text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y"
          />
        </div>

        {/* Signatures Footer */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
          <div>
            <div className="border-b border-slate-300 pb-8 mb-2">
              <span className="font-serif italic text-slate-400">Student Signature</span>
            </div>
            <div className="font-bold text-slate-900">{studentInfo.name || 'Student Scholar'}</div>
            <div className="text-slate-500 text-[11px]">Date: {today}</div>
          </div>

          <div>
            <div className="border-b border-slate-300 pb-8 mb-2">
              <span className="font-serif italic text-slate-400">Faculty In-Charge Signature</span>
            </div>
            <div className="font-bold text-slate-900">{studentInfo.instructor || 'Dr. Sharmila Sengupta'}</div>
            <div className="text-slate-500 text-[11px]">Evaluation & Grade Endorsement</div>
          </div>
        </div>
      </div>
    </div>
  );
}
