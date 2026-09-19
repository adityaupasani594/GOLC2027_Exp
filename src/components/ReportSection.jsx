import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, TrendingUp, Clock, Target, BarChart2 } from 'lucide-react';
import { EXPERIMENT, RETRIEVAL_SYSTEMS, METRICS, getComparisonTable, computeMetrics, computeMRR } from '../data/labData';
import { MathJaxDiv, MathJaxSpan, useMathJax } from './useMathJax';
import { GRADE } from './CertificateSection';

const SYSTEM_COLORS = {
  keyword:  { bar: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  semantic: { bar: 'bg-blue-500',   text: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'  },
  hybrid:   { bar: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200'},
  graph:    { bar: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200'},
};
const METRIC_COLS = {
  precision: 'text-blue-700',
  recall:    'text-emerald-700',
  f1:        'text-violet-700',
  mrr:       'text-rose-700',
};

// Mini horizontal bar inside a cell
function MiniBar({ value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="font-mono text-xs font-semibold w-10 text-right">{value.toFixed(3)}</span>
    </div>
  );
}

export default function ReportSection({ quizScore, totalQuestions, studentInfo }) {
  const table = useMemo(() => getComparisonTable(), []);

  useMathJax([]);

  const score = quizScore ?? 0;
  const pct   = Math.round((score / totalQuestions) * 100);
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
      experiment: EXPERIMENT.title,
      code:       EXPERIMENT.code,
      version:    EXPERIMENT.version,
      date:       today,
      student: {
        name:        studentInfo.name        || 'N/A',
        studentId:   studentInfo.studentId   || 'N/A',
        institution: studentInfo.institution || 'N/A',
        instructor:  studentInfo.instructor  || 'N/A',
      },
      quiz: { score, total: totalQuestions, percentage: pct, grade: grade.label },
      results: table.map(r => ({
        system:    r.label,
        precision: r.precision,
        recall:    r.recall,
        f1:        r.f1,
        mrr:       r.mrr,
        latency:   r.latency,
      })),
      conclusion: 'Hybrid RRF fusion achieved the best F1-Score. GraphRAG leads on MRR. Keyword BM25 is fastest with lowest recall.',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `IR_Lab_Report_${(studentInfo.name || 'student').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Best system per metric
  const best = {
    precision: table.reduce((a, b) => a.precision > b.precision ? a : b),
    recall:    table.reduce((a, b) => a.recall    > b.recall    ? a : b),
    f1:        table.reduce((a, b) => a.f1        > b.f1        ? a : b),
    mrr:       table.reduce((a, b) => a.mrr       > b.mrr       ? a : b),
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
        <p className="text-slate-500 text-sm">Full empirical comparison, metric analysis, and conclusions.</p>
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

      {/* ── All printable report content wrapped in report-content ── */}
      <div className="report-content space-y-6">
      {/* Report metadata card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="glass rounded-2xl border border-white/80 shadow-sm overflow-hidden"
      >
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Laboratory Experiment Report</p>
          <p className="font-bold text-lg">{EXPERIMENT.title}</p>
          <p className="text-slate-400 text-xs mt-0.5">{EXPERIMENT.subtitle}</p>
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

      {/* Section 1 — Objectives */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-3"
      >
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-indigo-500" />
          <h3 className="font-semibold text-slate-800 text-sm">1. Objectives</h3>
        </div>
        <ul className="space-y-1.5 text-sm text-slate-600">
          <li className="flex items-start gap-2"><span className="text-indigo-400 font-bold shrink-0">•</span>Evaluate and compare four information retrieval architectures: BM25, Dense Vector, Hybrid RRF, and GraphRAG.</li>
          <li className="flex items-start gap-2"><span className="text-indigo-400 font-bold shrink-0">•</span>
            <MathJaxDiv className="inline">{"Compute $P@k$, $R@k$, $F_1$, and $\\text{MRR}$ for each system at $k = 10$."}</MathJaxDiv>
          </li>
          <li className="flex items-start gap-2"><span className="text-indigo-400 font-bold shrink-0">•</span>Identify trade-offs between precision, recall, accuracy, and latency across retrieval paradigms.</li>
        </ul>
      </motion.div>

      {/* Section 2 — Best-in-Class Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <h3 className="font-semibold text-slate-800 text-sm">2. Best-in-Class Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { metric: 'precision', label: 'Precision@10', formula: '$P@10$', winner: best.precision, col: 'text-blue-700',   ring: 'ring-blue-300',   bg: 'bg-blue-50'   },
            { metric: 'recall',    label: 'Recall@10',    formula: '$R@10$', winner: best.recall,    col: 'text-emerald-700',ring: 'ring-emerald-300',bg: 'bg-emerald-50'},
            { metric: 'f1',        label: 'F1-Score',     formula: '$F_1$',  winner: best.f1,        col: 'text-violet-700', ring: 'ring-violet-300', bg: 'bg-violet-50' },
            { metric: 'mrr',       label: 'MRR',          formula: '$\\text{MRR}$', winner: best.mrr, col: 'text-rose-700', ring: 'ring-rose-300',   bg: 'bg-rose-50'   },
          ].map(({ metric, label, formula, winner, col, ring, bg }) => {
            const sc = SYSTEM_COLORS[winner.id];
            return (
              <div key={metric} className={`rounded-2xl p-4 border ${bg} ${sc.border} space-y-2`}>
                <MathJaxDiv className={`text-xs font-semibold ${col}`}>{formula}</MathJaxDiv>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{winner.icon}</span>
                  <p className={`text-xs font-bold ${sc.text}`}>{winner.label}</p>
                </div>
                <p className={`font-mono text-xl font-black ${col}`}>{winner[metric].toFixed(3)}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Section 3 — Full Metrics Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
        className="glass rounded-2xl overflow-hidden border border-white/80 shadow-sm"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-violet-500" />
          <h3 className="font-semibold text-slate-800 text-sm">3. Empirical Results at k = 10</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left py-3 px-5 font-semibold text-slate-500 w-40">System</th>
                <th className="py-3 px-4 font-semibold text-blue-600 text-left">
                  <div><MathJaxSpan>{"$P@10$"}</MathJaxSpan></div>
                  <p className="text-[10px] font-normal text-slate-400 mt-0.5">Precision</p>
                </th>
                <th className="py-3 px-4 font-semibold text-emerald-600 text-left">
                  <div><MathJaxSpan>{"$R@10$"}</MathJaxSpan></div>
                  <p className="text-[10px] font-normal text-slate-400 mt-0.5">Recall</p>
                </th>
                <th className="py-3 px-4 font-semibold text-violet-600 text-left">
                  <div><MathJaxSpan>{"$F_1$"}</MathJaxSpan></div>
                  <p className="text-[10px] font-normal text-slate-400 mt-0.5">F1-Score</p>
                </th>
                <th className="py-3 px-4 font-semibold text-rose-600 text-left">
                  <div><MathJaxSpan>{"$\\text{MRR}$"}</MathJaxSpan></div>
                  <p className="text-[10px] font-normal text-slate-400 mt-0.5">MRR</p>
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-left">
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Latency</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.map((row, i) => {
                const sc = SYSTEM_COLORS[row.id];
                return (
                  <tr key={row.id} className={i % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/30'}>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{row.icon}</span>
                        <span className={`font-semibold text-xs ${sc.text}`}>{row.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4"><MiniBar value={row.precision} color="bg-blue-500" /></td>
                    <td className="py-3 px-4"><MiniBar value={row.recall}    color="bg-emerald-500" /></td>
                    <td className="py-3 px-4"><MiniBar value={row.f1}        color="bg-violet-500" /></td>
                    <td className="py-3 px-4"><MiniBar value={row.mrr}       color="bg-rose-400" /></td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-600 font-semibold">{row.latency}ms</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Section 4 — Discussion */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-3"
      >
        <h3 className="font-semibold text-slate-800 text-sm">4. Discussion & Conclusions</h3>
        <MathJaxDiv className="text-sm text-slate-600 leading-relaxed space-y-3">
          <p>{"Quantitative evaluation across four IR architectures reveals clear precision–recall trade-offs. BM25 achieves the lowest latency (8ms) but its dependence on exact token matching causes vocabulary mismatch failures, yielding lower $R@10$."}</p>
          <p>{"Dense Vector Retrieval significantly improves recall by encoding semantic similarity into a continuous embedding space, retrieving relevant documents regardless of surface phrasing ($\\cos(\\mathbf{q},\\mathbf{d}) = \\mathbf{q}\\cdot\\mathbf{d} / |\\mathbf{q}||\\mathbf{d}|$)."}</p>
          <p>{"Hybrid RRF fusion — combining BM25 and dense rankings via $\\text{RRF}(d) = \\sum_r 1/(60 + r(d))$ — achieves the best $F_1$ score, confirming that ensemble methods exploit complementary strengths. GraphRAG leads on $\\text{MRR}$, placing the first relevant result at rank 1 for all simulated queries."}</p>
          <p>{"The harmonic mean formula $F_1 = 2PR/(P+R)$ clearly exposes that systems with high recall but poor precision (or vice-versa) score significantly lower than balanced systems — penalising extreme imbalances more harshly than the arithmetic mean."}</p>
        </MathJaxDiv>
      </motion.div>

      {/* Section 5 — Quiz Performance */}
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
              {pct >= 70 ? '✓ Satisfactory understanding of IR evaluation metrics demonstrated.' : 'Review theory sections to reinforce IR metric comprehension.'}
            </p>
          </div>
        </div>
      </motion.div>
      </div>

    </div>
  );
}
