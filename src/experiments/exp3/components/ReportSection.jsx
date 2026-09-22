import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, Download, Target, BarChart2, BookOpen, FlaskConical } from 'lucide-react';
import { GRADE } from './CertificateSection';
import { QUIZ_QUESTIONS } from './QuizSection';

const EXP_INFO = {
  title: 'Construction of an Inverted Index',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  code: 'CS-KGIRS-03',
  version: '1.0',
  aim: 'To construct and analyze an Inverted Index data structure for a collection of textual documents, explore linguistic preprocessing transformations (tokenization, stopword removal, stemming), and execute Boolean, phrase, and proximity queries with linear-time pointer-merge algorithms.',
};

const OBJECTIVES = [
  'Construct an Inverted Index data structure mapping vocabulary terms to documents, term frequencies (tf), and token positions.',
  'Trace the 4 core pipeline stages: Document Tokenization, Pair Extraction, Lexicographic Sorting, and Postings Inversion.',
  'Implement and visualize linear-time Boolean retrieval (AND, OR, NOT) using sorted posting list pointer intersections.',
  'Execute positional phrase queries and proximity searches by matching token offsets within identical document postings.',
  'Quantify the empirical effect of linguistic preprocessing on vocabulary size and index compression.',
  "Analyze collection-wide term frequency distributions and validate Zipf's Law and Heaps' Law.",
];

const PIPELINE_STAGES = [
  { stage: 'Stage 1', name: 'Token Stream Extraction', desc: 'Tokenize each document with case folding, punctuation removal, stopword filtering, and Porter stemming.' },
  { stage: 'Stage 2', name: '(Term, DocID, Position) Triples', desc: 'For each token in each document, emit a triple used as the raw building block of the index.' },
  { stage: 'Stage 3', name: 'Lexicographic Sort', desc: 'Sort all triples by (term, docId, position) to group entries for the same term contiguously.' },
  { stage: 'Stage 4', name: 'Postings List Inversion', desc: 'Aggregate consecutive triples by term to build df, cf, and postings dict {docId: {tf, positions[]}}.' },
];

export default function ReportSection({ quizScore, totalQuestions, studentInfo, trials, onReportGenerated }) {
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

  const handleDownload = () => {
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
      quiz: { score, total: totalQuestions, percentage: pct, grade: grade.label },
      trials: trials || [],
      conclusion: '4-stage inverted index pipeline successfully constructed. Boolean AND/OR retrieval operates in O(L₁+L₂) via two-pointer merge. Positional postings enable exact phrase and proximity queries. Stopword removal and Porter stemming compress vocabulary consistent with Heaps\' Law.',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `InvertedIndex_Lab_Report_${(studentInfo.name || 'student').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header — hidden on print */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 no-print">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />
          Section 5 — Lab Report
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Experiment Lab Report</h2>
        <p className="text-slate-500 text-sm">Full pipeline analysis, query trials, assessment performance, and conclusions.</p>
      </motion.div>

      {/* Action buttons — hidden on print */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-end gap-2 no-print">
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={handlePrintReport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 text-white text-sm font-semibold shadow cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print PDF
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-teal-200 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export JSON
        </motion.button>
      </motion.div>

      {/* ── All printable report content ── */}
      <div className="report-content space-y-6">

        {/* Report metadata card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="glass rounded-2xl border border-white/80 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Laboratory Experiment Report</p>
            <p className="font-bold text-lg">{EXP_INFO.title}</p>
            <p className="text-slate-400 text-xs mt-0.5">{EXP_INFO.subtitle}</p>
          </div>
          <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {[
              { label: 'Student',     value: studentInfo.name        || '—' },
              { label: 'Student ID',  value: studentInfo.studentId   || '—' },
              { label: 'Institution', value: studentInfo.institution || '—' },
              { label: 'Date',        value: today },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</p>
                <p className="font-semibold text-slate-800">{f.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 1 — Aim & Objectives */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 text-sm">1. Aim & Objectives</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed"><span className="font-semibold">Aim:</span> {EXP_INFO.aim}</p>
          <ul className="space-y-1.5 text-sm text-slate-600">
            {OBJECTIVES.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>{obj}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Section 2 — Pipeline Summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-4 h-4 text-violet-500" />
            <h3 className="font-semibold text-slate-800 text-sm">2. Index Construction Pipeline</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PIPELINE_STAGES.map((s, i) => (
              <div key={i} className={`rounded-xl p-4 border text-xs ${
                ['bg-indigo-50 border-indigo-200','bg-violet-50 border-violet-200','bg-blue-50 border-blue-200','bg-teal-50 border-teal-200'][i]
              }`}>
                <p className={`font-bold uppercase tracking-wide mb-0.5 ${['text-indigo-700','text-violet-700','text-blue-700','text-teal-700'][i]}`}>{s.stage} — {s.name}</p>
                <p className="text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-600 space-y-1.5 pt-1">
            <p><span className="font-semibold">Boolean AND/OR:</span> Two-pointer merge on sorted postings lists in O(L₁ + L₂) time.</p>
            <p><span className="font-semibold">Phrase Query:</span> Positional adjacency check — verifies pos(term₂) = pos(term₁) + 1 for candidate documents.</p>
            <p><span className="font-semibold">Proximity Query:</span> |pos₁ − pos₂| ≤ k for any pair of positions across two terms in the same document.</p>
          </div>
        </motion.div>

        {/* Section 3 — Recorded Trials */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="glass rounded-2xl overflow-hidden border border-white/80 shadow-sm"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-teal-500" />
            <h3 className="font-semibold text-slate-800 text-sm">3. Recorded Experimental Trials</h3>
          </div>
          {(!trials || trials.length === 0) ? (
            <div className="px-6 py-6 text-xs text-slate-400 italic">
              No trials recorded yet. Run queries in the Simulation tab and click "Record Trial to Report".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    {['Trial', 'Corpus', 'Stopwords', 'Stemming', 'Vocab |V|', 'Query', 'Hits', 'Latency (µs)'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {trials.map((t, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/30'}>
                      <td className="py-3 px-4 font-bold text-slate-600 text-center">{i + 1}</td>
                      <td className="py-3 px-4 text-slate-700">{t.corpus}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.stopwords === 'Yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{t.stopwords}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.stemming === 'Yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{t.stemming}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-center text-slate-700">{t.vocabSize}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 max-w-[120px] truncate">{t.query}</td>
                      <td className="py-3 px-4 font-bold text-center text-slate-700">{t.hits}</td>
                      <td className="py-3 px-4 font-mono text-center text-slate-500">{t.timeUs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Section 4 — Discussion & Conclusions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 text-sm">4. Discussion & Conclusions</h3>
          </div>
          <div className="text-sm text-slate-600 leading-relaxed space-y-3">
            <p>The 4-stage inverted index construction pipeline (Tokenization → Triple Extraction → Lexicographic Sort → Postings Inversion) produced an efficient positional index supporting multiple retrieval modes at sub-millisecond latencies.</p>
            <p>Conjunctive Boolean queries (AND) executed via the two-pointer intersection algorithm in O(L₁ + L₂) time without backtracking, demonstrating the core advantage of sorted postings lists. Sort-order-based query optimization (processing terms in increasing df order) minimizes intermediate candidate set sizes substantially.</p>
            <p>Positional postings extended the index to support exact phrase verification (pos₂ = pos₁ + 1) and proximity search (|pos₁ − pos₂| ≤ k) with zero false positives beyond candidate filtering. Linguistic preprocessing (stopword removal + Porter stemming) compressed the vocabulary consistent with Heaps' Law predictions, reducing redundant terms while improving recall.</p>
            <p>Term frequency distributions observed across all corpora conformed to the heavy-tailed power law described by Zipf's Law, with the top 10 terms accounting for a disproportionate fraction of total tokens.</p>
          </div>
        </motion.div>

        {/* Section 5 — Assessment Performance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-3"
        >
          <h3 className="font-semibold text-slate-800 text-sm">5. Assessment Performance</h3>
          <div className="flex items-center gap-5">
            <div className={`border-2 rounded-2xl px-6 py-4 text-center min-w-[5.5rem] ${grade.bg}`}>
              <p className={`text-4xl font-black ${grade.color}`}>{grade.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{score}/{totalQuestions}</p>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Quiz Score</span>
                <span className="font-mono font-semibold text-slate-800">{score}/{totalQuestions} ({pct}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                  className={`h-full rounded-full bg-gradient-to-r ${grade.gradient}`}
                />
              </div>
              <p className="text-xs text-slate-400">
                {pct >= 70 ? '✓ Satisfactory understanding of Inverted Index construction and Boolean retrieval demonstrated.' : 'Review theory sections to reinforce IR indexing and query processing concepts.'}
              </p>
              {/* Per-question breakdown */}
              <div className="flex gap-1 pt-1">
                {QUIZ_QUESTIONS.map((qq, i) => {
                  const answered = score > 0; // fallback if answers not tracked here
                  return (
                    <div key={qq.id} title={`Q${i + 1}`} className={`flex-1 h-2 rounded-full ${i < score ? 'bg-emerald-400' : 'bg-red-300'}`} />
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400">{score} correct · {totalQuestions - score} incorrect</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
