import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, TrendingUp, Clock, Target, BarChart2, GitBranch, Database, Cpu } from 'lucide-react';
import { GRADE } from './CertificateSection';

const EXP_META = {
  title: 'Advanced Cypher Queries and Graph Pattern Matching',
  subtitle: 'Multi-Hop Lineage, Triadic Closures, Shortest Paths & Aggregations',
  code: 'CS-KG-13',
  version: '1.0'
};

const CYPHER_BENCHMARKS = [
  {
    id: 'lineage',
    label: '1. Variable-Length Lineage (*1..3)',
    domain: 'Academic',
    latency: 1.42,
    nodesTraversed: 7,
    pathsMatched: 6,
    pruningRatio: 0.92,
    color: 'text-blue-700',
    barColor: 'bg-blue-500'
  },
  {
    id: 'triad',
    label: '2. Triadic Closure Discovery',
    domain: 'Academic',
    latency: 0.98,
    nodesTraversed: 8,
    pathsMatched: 4,
    pruningRatio: 0.88,
    color: 'text-rose-700',
    barColor: 'bg-rose-500'
  },
  {
    id: 'aggregation',
    label: '3. Aggregation with WITH & COLLECT()',
    domain: 'Academic',
    latency: 1.15,
    nodesTraversed: 14,
    pathsMatched: 6,
    pruningRatio: 0.85,
    color: 'text-emerald-700',
    barColor: 'bg-emerald-500'
  },
  {
    id: 'shortestPath',
    label: '4. Shortest Path Bridge Discovery',
    domain: 'Academic',
    latency: 0.74,
    nodesTraversed: 6,
    pathsMatched: 1,
    pruningRatio: 0.96,
    color: 'text-violet-700',
    barColor: 'bg-violet-500'
  },
  {
    id: 'enterprise',
    label: '5. Enterprise Org Skill Traversal',
    domain: 'Enterprise',
    latency: 1.08,
    nodesTraversed: 6,
    pathsMatched: 1,
    pruningRatio: 0.91,
    color: 'text-amber-700',
    barColor: 'bg-amber-500'
  }
];

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
      <span className="font-mono text-xs font-semibold w-10 text-right">{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

export default function ReportSection({ quizScore = 10, totalQuestions = 10, studentInfo = {} }) {
  const score = quizScore ?? 10;
  const pct = Math.round((score / totalQuestions) * 100);
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownload = () => {
    const data = {
      experiment: EXP_META.title,
      code: EXP_META.code,
      version: EXP_META.version,
      date: today,
      student: {
        name: studentInfo.name || 'N/A',
        studentId: studentInfo.studentId || 'N/A',
        institution: studentInfo.institution || 'N/A',
        instructor: studentInfo.instructor || 'N/A',
      },
      quiz: { score, total: totalQuestions, percentage: pct, grade: grade.label },
      benchmarkSummary: CYPHER_BENCHMARKS,
      conclusion: 'Index-Free Adjacency verified O(1) edge traversal. Variable depth path queries and triadic closure mining successfully extracted latent connections.',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Graph_Cypher_Lab_Report_${(studentInfo.name || 'student').replace(/\s+/g, '_')}.json`;
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
        <p className="text-slate-500 text-sm">Full graph traversal benchmarking, query analysis, and empirical conclusions.</p>
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

      {/* Printable Report Content */}
      <div className="space-y-6">
        
        {/* Report metadata card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Laboratory Experiment Report</p>
            <p className="font-bold text-lg">{EXP_META.title}</p>
            <p className="text-slate-400 text-xs mt-0.5">{EXP_META.subtitle}</p>
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
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 text-sm">1. Objectives</h3>
          </div>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li className="flex items-start gap-2"><span className="text-indigo-400 font-bold shrink-0">•</span>Formulate recursive pattern matching queries traversing variable-length paths (<code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">[:CITES*1..3]</code>).</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400 font-bold shrink-0">•</span>Detect topological structural motifs and uncover hidden collaborator connections using triadic closure logic (<code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">WHERE NOT (a)-[:REL]-(c)</code>).</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400 font-bold shrink-0">•</span>Implement modular query pipelines and cardinality reduction with the <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">WITH</code> and <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">COLLECT()</code> clauses.</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400 font-bold shrink-0">•</span>Compute optimal interdisciplinary bridges using bidirectional <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">shortestPath()</code> algorithms.</li>
          </ul>
        </motion.div>

        {/* Section 2 — Traversal Benchmarks Summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-slate-800 text-sm">2. Benchmark Performance Summary</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Min Path Latency', val: '0.74 ms', sub: 'Shortest Path BFS', col: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
              { label: 'Max Traversed Depth', val: '3 Hops', sub: 'Recursive Citation', col: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
              { label: 'Hidden Triads Found', val: '4 Pairs', sub: 'Triadic Closures', col: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
              { label: 'Mean Pruning Ratio', val: '90.4%', sub: 'Search Space Cut', col: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            ].map((card, idx) => (
              <div key={idx} className={`rounded-2xl p-4 border ${card.bg} ${card.border} space-y-1.5`}>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">{card.label}</p>
                <p className={`font-mono text-2xl font-black ${card.col}`}>{card.val}</p>
                <p className="text-[10px] text-slate-400">{card.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 3 — Full Pattern Results Table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-violet-500" />
            <h3 className="font-semibold text-slate-800 text-sm">3. Empirical Cypher Query Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-3 px-5 font-semibold text-slate-500 w-52">Query Scenario</th>
                  <th className="py-3 px-4 font-semibold text-slate-700 text-left">Domain</th>
                  <th className="py-3 px-4 font-semibold text-blue-600 text-left">Latency</th>
                  <th className="py-3 px-4 font-semibold text-emerald-600 text-left">Nodes Expanded</th>
                  <th className="py-3 px-4 font-semibold text-violet-600 text-left">Matches Found</th>
                  <th className="py-3 px-4 font-semibold text-slate-700 text-left w-36">Pruning Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {CYPHER_BENCHMARKS.map((row, i) => (
                  <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-3 px-5 font-semibold text-slate-900">{row.label}</td>
                    <td className="py-3 px-4 text-slate-500">{row.domain}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{row.latency} ms</td>
                    <td className="py-3 px-4 font-mono">{row.nodesTraversed}</td>
                    <td className="py-3 px-4 font-mono font-bold text-violet-700">{row.pathsMatched}</td>
                    <td className="py-3 px-4">
                      <MiniBar value={row.pruningRatio} color={row.barColor} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Section 4 — Discussion & Conclusions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3"
        >
          <h3 className="font-semibold text-slate-800 text-sm">4. Discussion &amp; Key Insights</h3>
          <div className="text-sm text-slate-600 leading-relaxed space-y-2.5">
            <p>
              1. <strong>Index-Free Adjacency (IFA):</strong> The traversal benchmark demonstrated that recursive multi-hop hops maintain constant O(1) latency per relationship dereference, completely circumventing the exponential Cartesian product degradation observed in traditional relational SQL multi-table JOIN operations.
            </p>
            <p>
              2. <strong>Triadic Closure Discovery:</strong> Pattern matching with negative relationship assertion (<code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">WHERE NOT (a)-[:COLLABORATED_WITH]-(c)</code>) identified 4 high-affinity latent collaboration opportunities without requiring exhaustive matrix inversion.
            </p>
            <p>
              3. <strong>Pipelining with WITH:</strong> Intermediate cardinality reduction using <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">WITH</code> reduced downstream traversal overhead by 68%, ensuring optimal memory bounds during multi-stage aggregation.
            </p>
          </div>
        </motion.div>

        {/* Section 5 — Assessment Performance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3"
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
                {pct >= 70 ? '✓ Satisfactory understanding of advanced Cypher query patterns demonstrated.' : 'Review theory sections to reinforce query formulation concepts.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
