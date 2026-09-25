import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, TrendingUp, Clock, Target, BarChart2, Network, CheckCircle2 } from 'lucide-react';
import { GRADE } from './CertificateSection';

const EXP_INFO = {
  title: 'Integration of Information Retrieval with Knowledge Graphs',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  code: 'CS-KGIRS-14',
  version: '1.0',
};

export default function ReportSection({ quizScore, totalQuestions, studentInfo, trials = [] }) {
  const [notes, setNotes] = useState('');
  const score = quizScore ?? 0;
  const pct   = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrintReport = () => {
    document.body.classList.add('print-report');
    window.onafterprint = () => {
      document.body.classList.remove('print-report');
      window.onafterprint = null;
    };
    window.print();
  };

  const handleDownload = () => {
    const data = {
      experiment: EXP_INFO.title,
      code:       EXP_INFO.code,
      version:    EXP_INFO.version,
      date:       today,
      student: {
        name:        studentInfo?.name        || 'N/A',
        studentId:   studentInfo?.studentId   || 'N/A',
        institution: studentInfo?.institution || 'N/A',
        instructor:  studentInfo?.instructor  || 'N/A',
      },
      quiz: { score, total: totalQuestions, percentage: pct, grade: grade.label },
      trialsCount: trials.length,
      trials: trials.map(t => ({
        id: t.id,
        query: t.query,
        topK: t.topK,
        hits: t.hits,
        topScore: t.topScore,
        topDoc: t.topDoc,
        selectedDoc: t.selectedDoc,
        graphEdges: t.graphEdges,
        latencyMs: t.time,
      })),
      observations: notes || 'N/A',
      conclusion: 'Information Retrieval systems retrieve entry documents, while Knowledge Graph exploration provides critical structured context and multi-hop entity relationships.',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `IR_KG_Report_${(studentInfo?.name || 'student').replace(/\s+/g, '_')}.json`;
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
        <p className="text-slate-500 text-sm">Empirical document retrieval, graph traversal logs, metric analysis, and conclusions.</p>
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

      {/* ── Printable report content ── */}
      <div className="report-content space-y-6">
        {/* Report metadata card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="glass rounded-2xl border border-white/80 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-0.5">Laboratory Experiment Report</p>
            <p className="font-bold text-lg">{EXP_INFO.title}</p>
            <p className="text-slate-400 text-xs mt-0.5">{EXP_INFO.subtitle}</p>
          </div>
          <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {[
              { label: 'Student',     value: studentInfo?.name        || '—' },
              { label: 'Student ID',  value: studentInfo?.studentId   || '—' },
              { label: 'Institution', value: studentInfo?.institution || '—' },
              { label: 'Date',        value: today },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</p>
                <p className="font-semibold text-slate-800">{f.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 1 — Objectives */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-teal-600" />
            <h3 className="font-semibold text-slate-800 text-sm">1. Objectives &amp; System Pipeline</h3>
          </div>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold shrink-0">•</span>
              Understand how Information Retrieval (IR) and Knowledge Graphs (KGs) complement each other for contextual search.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold shrink-0">•</span>
              Evaluate document relevance scoring based on query token overlap, title bonuses, and Top-K ranking across a 20-document corpus.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold shrink-0">•</span>
              Traverse 1-hop and 2-hop entity neighborhoods using retrieved documents as entry anchors into the knowledge graph.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold shrink-0">•</span>
              Record empirical retrieval trials, compare query sensitivities, and inspect contextual graph triples.
            </li>
          </ul>
        </motion.div>

        {/* Section 2 — Summary Performance Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 text-sm">2. Key Performance &amp; Corpus Metrics</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Corpus Size', val: '20 Docs', sub: 'Indexed text units', col: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
              { label: 'Graph Entities', val: '10 Nodes', sub: 'Semantic concepts', col: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
              { label: 'Typed Edges', val: '46 Relations', sub: 'USES / SUPPORTS / ENABLES', col: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
              { label: 'Trials Recorded', val: `${trials.length} Runs`, sub: 'Experimental logs', col: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
            ].map(({ label, val, sub, col, bg }) => (
              <div key={label} className={`rounded-2xl p-4 border ${bg} space-y-1`}>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</p>
                <p className={`font-mono text-xl font-black ${col}`}>{val}</p>
                <p className="text-[10px] text-slate-500">{sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 3 — Recorded Trials Table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="glass rounded-2xl overflow-hidden border border-white/80 shadow-sm"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-600" />
              <h3 className="font-semibold text-slate-800 text-sm">3. Experimental Trials Log ({trials.length})</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{trials.length} Recorded Execution{trials.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            {trials.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-600">
                    <th className="py-2.5 px-4 text-left font-semibold w-12">#</th>
                    <th className="py-2.5 px-4 text-left font-semibold">Query</th>
                    <th className="py-2.5 px-3 text-center font-semibold">Top-K</th>
                    <th className="py-2.5 px-3 text-center font-semibold">Hits</th>
                    <th className="py-2.5 px-3 text-left font-semibold">Top Score</th>
                    <th className="py-2.5 px-4 text-left font-semibold">Top Ranked Document</th>
                    <th className="py-2.5 px-3 text-left font-semibold">Focused Doc</th>
                    <th className="py-2.5 px-3 text-center font-semibold">Edges</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {trials.map((t, i) => (
                    <tr key={t.id} className={i % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/30'}>
                      <td className="py-2.5 px-4 font-mono font-bold text-teal-700">{t.id}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800 max-w-xs truncate">{t.query}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">{t.topK}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{t.hits}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-violet-700">{t.topScore}</td>
                      <td className="py-2.5 px-4 text-slate-700 max-w-xs truncate">{t.topDoc}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-700">{t.selectedDoc}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{t.graphEdges}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">{t.time}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No trials recorded during this session. Run document retrieval in the Simulation Lab and click "Record Experiment Trial".
              </div>
            )}
          </div>
        </motion.div>

        {/* Section 4 — Discussion & Conclusions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-slate-800 text-sm">4. Discussion &amp; Empirical Conclusions</h3>
          </div>
          <div className="text-sm text-slate-600 leading-relaxed space-y-2.5">
            <p>
              Traditional Information Retrieval produces a ranked list of documents matching keyword queries, answering <em>what documents are relevant</em>. However, standard text ranking fails to capture latent domain associations, underlying semantic ontology hierarchies, and entity relationships across different documents.
            </p>
            <p>
              By integrating a Knowledge Graph, retrieved documents act as <strong>entry anchors</strong>. Graph traversal expands outward across typed relationships (<code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded text-xs font-mono">USES</code>, <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded text-xs font-mono">SUPPORTS</code>, <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded text-xs font-mono">ENABLES</code>) to reveal both 1-hop directly connected concepts and 2-hop multi-step neighbors.
            </p>
            <p>
              This combination bridges unstructured natural language text with structured factual knowledge, significantly enhancing contextual exploration and providing factually grounded context for modern Search and Retrieval-Augmented Generation (RAG) architectures.
            </p>
          </div>
        </motion.div>

        {/* Section 5 — Student Observations */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-3"
        >
          <h3 className="font-semibold text-slate-800 text-sm">5. Student Qualitative Observations</h3>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Enter your observations from the simulation. Which queries returned the most relevant documents? How did the graph traversal add context beyond plain text ranking?"
            className="w-full p-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 font-medium"
            rows={4}
          />
        </motion.div>

        {/* Section 6 — Assessment Performance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-3"
        >
          <h3 className="font-semibold text-slate-800 text-sm">6. Assessment Performance</h3>
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
                {pct >= 70
                  ? '✓ Satisfactory understanding of IR + Knowledge Graph integration demonstrated.'
                  : 'Review theory and experiment simulation to reinforce IR scoring and graph traversal concepts.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
