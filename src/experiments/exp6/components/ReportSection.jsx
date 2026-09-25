import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, Download, Target, BarChart2, BookOpen, FlaskConical } from 'lucide-react';
import { GRADE } from './CertificateSection';
import { QUIZ_QUESTIONS } from './QuizSection';

const EXP_INFO = {
  title: 'Dense Embedding-Based Semantic Search',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  code: 'CS-KGIRS-12',
  version: '1.0',
  aim: 'To implement and analyse a dense embedding-based semantic search system using the all-MiniLM-L6-v2 sentence-transformer model, compute cosine similarity scores for query-document matching, visualise the 384-dimensional vector space via PCA, and evaluate the system using Precision@K, Recall@K, F1@K and MRR.',
};

const OBJECTIVES = [
  'Encode documents and queries into 384-dimensional dense vectors using the all-MiniLM-L6-v2 sentence-transformer.',
  'Compute L2-normalised cosine similarity between query and document embeddings for ranked retrieval.',
  'Visualise the high-dimensional embedding space using 2-D PCA projections.',
  'Run Top-K retrieval with a configurable similarity threshold and record results.',
  'Evaluate retrieval quality using Precision@K, Recall@K, F1@K, and Mean Reciprocal Rank (MRR).',
  'Compare dense semantic retrieval with traditional keyword-based search and discuss trade-offs.',
];

const PIPELINE_STAGES = [
  { stage: 'Stage 1', name: 'Document Collection',        desc: 'Assemble a structured corpus of documents across multiple domains.' },
  { stage: 'Stage 2', name: 'Offline Embedding (Index)',  desc: 'Encode each document via all-MiniLM-L6-v2 into a 384-D unit vector. Store the index.' },
  { stage: 'Stage 3', name: 'Query Encoding (Online)',    desc: 'At query time, encode the user query with the same model into a 384-D query vector.' },
  { stage: 'Stage 4', name: 'Cosine Similarity Scoring', desc: 'Dot-multiply query vector against all document vectors (O(N × 384)).' },
  { stage: 'Stage 5', name: 'Top-K Ranking & Return',    desc: 'Sort by descending cosine similarity. Return Top-K results above threshold.' },
];

export default function ReportSection({ quizScore, totalQuestions, studentInfo, trials }) {
  const score = quizScore ?? 0;
  const pct   = Math.round((score / totalQuestions) * 100);
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => window.print();

  const handleExportJSON = () => {
    const report = {
      experiment: { code: EXP_INFO.code, title: EXP_INFO.title, version: EXP_INFO.version },
      student: studentInfo,
      date: today,
      quiz: { score, totalQuestions, pct, grade: grade.label },
      trials,
      pipeline: PIPELINE_STAGES,
      objectives: OBJECTIVES,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `Exp12_DenseSemanticSearch_Report_${studentInfo.studentId || 'student'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="no-print">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-3">
          <FileText className="w-3.5 h-3.5" />
          Section 5 — Lab Report
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Laboratory Report</h2>
        <p className="text-slate-500 text-sm">Dense Embedding-Based Semantic Search — Experiment 12</p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print PDF
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
        </div>
      </motion.div>

      {/* ── Report Card ── */}

      {/* 1. Experiment Metadata */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-6 border border-white/80 shadow-sm"
      >
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" /> Experiment Metadata
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <tbody>
              {[
                ['Experiment', '12 — Dense Embedding-Based Semantic Search'],
                ['Course Code', EXP_INFO.code],
                ['Subject', EXP_INFO.subtitle],
                ['Student Name', studentInfo.name || '—'],
                ['Roll / Student ID', studentInfo.studentId || '—'],
                ['Institution', studentInfo.institution || '—'],
                ['Instructor', studentInfo.instructor || '—'],
                ['Embedding Model', 'all-MiniLM-L6-v2 (Sentence Transformers)'],
                ['Vector Dimension', '384-D (L2-normalised)'],
                ['Similarity Metric', 'Cosine Similarity (dot product of unit vectors)'],
                ['Date', today],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-4 font-semibold text-slate-600 whitespace-nowrap">{label}</td>
                  <td className="py-2 text-slate-800">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 2. Aim & Objectives */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 border border-white/80 shadow-sm"
      >
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" /> Aim & Objectives
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed mb-4 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
          <strong>Aim:</strong> {EXP_INFO.aim}
        </p>
        <ul className="space-y-2">
          {OBJECTIVES.map((obj, i) => (
            <li key={i} className="flex gap-2 text-xs text-slate-700">
              <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
              {obj}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* 3. Pipeline Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-6 border border-white/80 shadow-sm"
      >
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-violet-500" /> 5-Stage Semantic Search Pipeline
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-violet-600 text-white">
                <th className="px-3 py-2 text-left font-semibold">Stage</th>
                <th className="px-3 py-2 text-left font-semibold">Name</th>
                <th className="px-3 py-2 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PIPELINE_STAGES.map((s, i) => (
                <tr key={s.stage} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-3 py-2 font-mono font-bold text-violet-700">{s.stage}</td>
                  <td className="px-3 py-2 font-semibold text-slate-800 whitespace-nowrap">{s.name}</td>
                  <td className="px-3 py-2 text-slate-600">{s.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 4. Recorded Trials */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 border border-white/80 shadow-sm"
      >
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-teal-500" /> Recorded Retrieval Trials
        </h3>
        {trials.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No trials recorded yet. Run searches in the Simulation Lab and click "Record Trial."
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-teal-600 text-white">
                  {['#', 'Query', 'Top-K', 'Threshold', 'Hits', 'Top Score', 'Top Result', 'Time (ms)'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trials.map((t, i) => (
                  <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-3 py-2 font-mono font-bold text-teal-700">{t.id}</td>
                    <td className="px-3 py-2 text-slate-700 max-w-xs">{t.query}</td>
                    <td className="px-3 py-2 text-center font-bold">{t.topK}</td>
                    <td className="px-3 py-2 text-center">{t.threshold}</td>
                    <td className="px-3 py-2 text-center font-bold text-emerald-600">{t.hits}</td>
                    <td className="px-3 py-2 font-mono text-violet-700 font-bold">{t.topScore}</td>
                    <td className="px-3 py-2 text-slate-600 max-w-xs">{t.topDoc}</td>
                    <td className="px-3 py-2 text-slate-500">{t.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* 5. Discussion */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="glass rounded-2xl p-6 border border-white/80 shadow-sm"
      >
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" /> Discussion & Observation
        </h3>
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            The experiment demonstrated how dense neural embeddings transform text into 384-dimensional
            unit vectors using the all-MiniLM-L6-v2 sentence-transformer. By applying cosine similarity
            (equivalent to the dot product of L2-normalised vectors), documents were ranked by semantic
            proximity to the query rather than lexical overlap.
          </p>
          <p>
            Key observation: queries using paraphrases or synonyms successfully retrieved semantically
            related documents even when no keyword was shared — validating the core advantage of dense
            retrieval over traditional inverted-index keyword matching (TF-IDF, BM25).
          </p>
          <p>
            The Top-K and similarity threshold parameters control the precision/recall trade-off: a lower
            threshold improves recall (returns more results) but may introduce noise, while a higher threshold
            improves precision at the cost of missing relevant documents.
          </p>
        </div>
      </motion.div>

      {/* 6. Conclusion + Grade */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 border border-white/80 shadow-sm"
      >
        <h3 className="text-sm font-bold text-slate-700 mb-4">Conclusion & Assessment</h3>
        <p className="text-xs text-slate-700 leading-relaxed mb-5">
          Dense embedding-based semantic retrieval using all-MiniLM-L6-v2 and cosine similarity
          successfully retrieves conceptually related documents even when exact keywords are absent.
          The 5-stage pipeline — document encoding, vector indexing, query encoding, cosine scoring, and
          Top-K ranking — demonstrates a practical, scalable architecture for intelligent text search.
          Trade-offs include higher computational cost than lexical approaches and sensitivity to
          domain-specific language not covered by the model's training data.
        </p>

        {/* Grade bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Assessment Score</span>
            <span className={`text-sm font-black ${grade.color}`}>
              {score}/{totalQuestions} · {pct}% · Grade {grade.label}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className={`h-full rounded-full bg-gradient-to-r ${grade.gradient}`}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {pct >= 70
              ? '✓ Demonstrated competency in dense embedding-based semantic retrieval.'
              : 'Review dense embedding theory, cosine similarity, and Top-K retrieval before attempting again.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
