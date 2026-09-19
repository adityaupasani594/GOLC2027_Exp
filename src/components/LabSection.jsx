import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronRight, BarChart3, FlaskConical, Table } from 'lucide-react';
import {
  RETRIEVAL_SYSTEMS, METRICS, computeMetrics, computeMRR, computeCurve, getComparisonTable
} from '../data/labData';
import { MathJaxDiv, MathJaxSpan, useMathJax } from './useMathJax';

// Color helpers
const SYSTEM_COLORS = {
  keyword: { pill: 'bg-amber-100 text-amber-800 border-amber-200', bar: 'bg-amber-400', text: 'text-amber-700', ring: 'ring-amber-400', dot: 'bg-amber-400' },
  semantic: { pill: 'bg-blue-100 text-blue-800 border-blue-200', bar: 'bg-blue-500', text: 'text-blue-700', ring: 'ring-blue-400', dot: 'bg-blue-500' },
  hybrid:   { pill: 'bg-indigo-100 text-indigo-800 border-indigo-200', bar: 'bg-indigo-500', text: 'text-indigo-700', ring: 'ring-indigo-400', dot: 'bg-indigo-500' },
  graph:    { pill: 'bg-purple-100 text-purple-800 border-purple-200', bar: 'bg-purple-500', text: 'text-purple-700', ring: 'ring-purple-400', dot: 'bg-purple-500' },
};
const METRIC_COLORS = {
  precision: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', bar: 'bg-blue-500' },
  recall:    { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' },
  f1:        { text: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', bar: 'bg-violet-500' },
  mrr:       { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-500' },
};

// Animated metric value card
function MetricCard({ label, value, formula, color, description }) {
  const mc = METRIC_COLORS[color] || METRIC_COLORS.precision;
  useMathJax([value, formula]);
  return (
    <motion.div
      layout
      className={`rounded-2xl p-4 border ${mc.bg} ${mc.border} space-y-1`}
    >
      <div className="flex items-baseline justify-between">
        <MathJaxSpan className={`text-xs font-semibold ${mc.text}`}>{formula}</MathJaxSpan>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl font-bold font-mono ${mc.text}`}
        >
          {value}
        </motion.span>
      </div>
      <p className="text-xs text-slate-500">{description}</p>
    </motion.div>
  );
}

// Document Card with relevance animation
function DocCard({ doc, rank, isNew }) {
  return (
    <motion.div
      layout
      key={doc.id}
      initial={isNew ? { opacity: 0, x: -16 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }}
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
        doc.isRelevant
          ? 'bg-emerald-50 border-emerald-200 glow-relevant'
          : 'bg-red-50/40 border-red-200/60'
      }`}
    >
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5 ${
        doc.isRelevant ? 'bg-emerald-200 text-emerald-800' : 'bg-red-100 text-red-500'
      }`}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-slate-800 leading-snug">{doc.title}</p>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            doc.isRelevant ? 'bg-emerald-200 text-emerald-800' : 'bg-red-100 text-red-600'
          }`}>
            {doc.isRelevant ? '✓ Relevant' : '✗ Not Relevant'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed truncate">{doc.snippet}</p>
        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{doc.id}</p>
      </div>
    </motion.div>
  );
}

// Mini bar chart for metric comparison across K
function CurveViz({ curves, selectedSystem }) {
  const maxK = 10;
  const points = curves[selectedSystem] || [];
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {['precision', 'recall', 'f1'].map(m => {
          const mc = METRIC_COLORS[m];
          return (
            <div key={m} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${mc.bar}`} />
              <span className="text-[11px] text-slate-500 capitalize">{m}</span>
            </div>
          );
        })}
      </div>
      <div className="relative h-40">
        <svg viewBox={`0 0 ${maxK * 40} 100`} className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(v => (
            <line key={v} x1="0" y1={100 - v * 100} x2={maxK * 40} y2={100 - v * 100}
              stroke="#e2e8f0" strokeWidth="1" />
          ))}
          {/* Lines */}
          {['precision', 'recall', 'f1'].map(m => {
            const colors = { precision: '#3b82f6', recall: '#10b981', f1: '#8b5cf6' };
            const vals = points.map(p => p[m]);
            const pathD = vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * 40 + 20} ${100 - v * 100}`).join(' ');
            return (
              <g key={m}>
                <path d={pathD} fill="none" stroke={colors[m]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {vals.map((v, i) => (
                  <circle key={i} cx={i * 40 + 20} cy={100 - v * 100} r="4" fill={colors[m]} />
                ))}
              </g>
            );
          })}
        </svg>
        {/* X axis labels */}
        <div className="flex justify-between mt-1 px-2">
          {Array.from({ length: maxK }, (_, i) => (
            <span key={i} className="text-[10px] text-slate-400 font-mono">k={i+1}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Comparison bar chart across systems
function ComparisonChart({ table, activeMetric }) {
  const mc = METRIC_COLORS[activeMetric] || METRIC_COLORS.precision;
  const maxVal = 1;
  return (
    <div className="space-y-2">
      {table.map(row => {
        const val = activeMetric === 'mrr' ? row.mrr : row[activeMetric];
        const pct = (val / maxVal) * 100;
        const sc = SYSTEM_COLORS[row.id];
        return (
          <div key={row.id} className="flex items-center gap-3">
            <span className="text-sm w-5 text-center">{row.icon}</span>
            <div className="w-28 shrink-0">
              <p className="text-xs font-medium text-slate-700 truncate">{row.label}</p>
              <p className="text-[10px] text-slate-400">{row.latency}ms</p>
            </div>
            <div className="flex-1 bg-slate-100 rounded-full h-3 relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
                className={`h-full rounded-full ${sc.bar}`}
              />
            </div>
            <span className={`w-12 text-right text-sm font-bold font-mono ${sc.text}`}>{val.toFixed(3)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function LabSection({ onNext }) {
  const [selectedSystem, setSelectedSystem] = useState('keyword');
  const [selectedMetric, setSelectedMetric] = useState('precision');
  const [k, setK] = useState(5);
  const [view, setView] = useState('sim'); // 'sim' | 'curve' | 'compare'

  const metrics = useMemo(() => computeMetrics(selectedSystem, k), [selectedSystem, k]);
  const mrr = useMemo(() => computeMRR(selectedSystem), [selectedSystem]);
  const curves = useMemo(() => {
    const out = {};
    RETRIEVAL_SYSTEMS.forEach(s => { out[s.id] = computeCurve(s.id); });
    return out;
  }, []);
  const table = useMemo(() => getComparisonTable(), []);

  useMathJax([selectedSystem, selectedMetric, k, view]);

  const activeMetricDef = METRICS.find(m => m.id === selectedMetric);

  const metricVals = {
    precision: { label: 'Precision@k', value: metrics.precision, formula: '$P@k$', color: 'precision', description: `${metrics.relevantRetrieved} relevant in top-${k}` },
    recall:    { label: 'Recall@k',    value: metrics.recall,    formula: '$R@k$', color: 'recall',    description: `${metrics.relevantRetrieved} of ${metrics.totalRelevant} relevant found` },
    f1:        { label: 'F₁-Score',    value: metrics.f1,        formula: '$F_1$', color: 'f1',        description: 'Harmonic mean of P and R' },
    mrr:       { label: 'MRR',         value: mrr,               formula: '$\\text{MRR}$', color: 'mrr', description: 'Avg reciprocal rank of first relevant doc' },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold uppercase tracking-wider">
          <FlaskConical className="w-3.5 h-3.5" />
          Section 2 — Visual Lab
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Interactive Simulation</h2>
        <p className="text-slate-500 text-sm">Select a retrieval system and metric. See exactly which documents are returned and how the scores are computed.</p>
      </motion.div>

      {/* View switcher */}
      <div className="flex items-center justify-center gap-2">
        {[
          { id: 'sim', label: 'Simulation', icon: Play },
          { id: 'curve', label: 'P/R Curves', icon: BarChart3 },
          { id: 'compare', label: 'Compare All', icon: Table },
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              view === v.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
            }`}
          >
            <v.icon className="w-3.5 h-3.5" />
            {v.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── SIMULATION VIEW ────────────────────────────────────── */}
        {view === 'sim' && (
          <motion.div
            key="sim"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Controls Row */}
            <div className="glass rounded-2xl p-5 border border-white/80 shadow-sm space-y-4">
              {/* System selector */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Retrieval System</p>
                <div className="flex flex-wrap gap-2">
                  {RETRIEVAL_SYSTEMS.map(sys => {
                    const sc = SYSTEM_COLORS[sys.id];
                    const active = selectedSystem === sys.id;
                    return (
                      <motion.button
                        key={sys.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedSystem(sys.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          active ? `${sc.pill} ring-2 ${sc.ring} shadow-sm` : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span>{sys.icon}</span>
                        {sys.label}
                        <span className="text-[10px] font-mono opacity-60">{sys.latency}ms</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Metric selector */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Metric to Study</p>
                <div className="flex flex-wrap gap-2">
                  {METRICS.map(m => {
                    const mc = METRIC_COLORS[m.id];
                    const active = selectedMetric === m.id;
                    return (
                      <motion.button
                        key={m.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedMetric(m.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          active ? `${mc.bg} ${mc.border} ${mc.text} ring-2 ring-offset-0 shadow-sm` : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <MathJaxSpan>{m.inline}</MathJaxSpan>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* K slider */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Cutoff Depth <MathJaxSpan className="text-slate-700">$k$</MathJaxSpan>
                  </label>
                  <motion.span
                    key={k}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200"
                  >
                    k = {k}
                  </motion.span>
                </div>
                <input
                  type="range" min={1} max={10} step={1} value={k}
                  onChange={e => setK(Number(e.target.value))}
                  style={{ background: `linear-gradient(to right,#6366f1 0%,#6366f1 ${(k-1)/9*100}%,#e2e8f0 ${(k-1)/9*100}%,#e2e8f0 100%)` }}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  {Array.from({length:10},(_,i)=><span key={i}>{i+1}</span>)}
                </div>
              </div>
            </div>

            {/* Metric explanation banner */}
            {activeMetricDef && (
              <motion.div
                key={selectedMetric}
                initial={{ opacity:0, y:4 }}
                animate={{ opacity:1, y:0 }}
                className={`rounded-2xl p-4 border ${METRIC_COLORS[selectedMetric].bg} ${METRIC_COLORS[selectedMetric].border}`}
              >
                <MathJaxDiv className={`text-sm font-semibold ${METRIC_COLORS[selectedMetric].text} mb-1`}>
                  {activeMetricDef.formula}
                </MathJaxDiv>
                <p className="text-xs text-slate-600 leading-relaxed">{activeMetricDef.description}</p>
              </motion.div>
            )}

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.values(metricVals).map(mv => (
                <MetricCard key={mv.color} {...mv} />
              ))}
            </div>

            {/* Computation Breakdown */}
            <div className="glass rounded-2xl p-4 border border-white/80 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Live Computation</p>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Relevant Retrieved</p>
                  <MathJaxDiv className="text-slate-700">
                    {`$|\\mathcal{R} \\cap \\mathcal{L}_{${k}}| = ${metrics.relevantRetrieved}$`}
                  </MathJaxDiv>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Total Relevant</p>
                  <MathJaxDiv className="text-slate-700">{`$|\\mathcal{R}| = ${metrics.totalRelevant}$`}</MathJaxDiv>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">System Latency</p>
                  <p className="font-mono font-bold text-slate-800">{RETRIEVAL_SYSTEMS.find(s=>s.id===selectedSystem)?.latency}ms</p>
                </div>
              </div>
            </div>

            {/* Ranked Document List */}
            <div className="glass rounded-2xl p-5 border border-white/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Ranked Result List</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Showing top-{k} documents for <span className="font-medium">{RETRIEVAL_SYSTEMS.find(s=>s.id===selectedSystem)?.label}</span>
                  </p>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Relevant</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-300 inline-block" /> Not Relevant</span>
                </div>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {metrics.results.map((doc, idx) => (
                    <DocCard key={`${doc.id}-${selectedSystem}`} doc={doc} rank={idx + 1} isNew />
                  ))}
                </AnimatePresence>
              </div>
              {/* Running precision bar */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 font-medium">Running Precision across ranks</p>
                  <p className="text-xs font-mono text-blue-700 font-semibold">{metrics.precision} at k={k}</p>
                </div>
                <div className="flex gap-1">
                  {metrics.results.map((doc, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ height: 0 }}
                      animate={{ height: `${doc.isRelevant ? 32 : 8}px` }}
                      transition={{ delay: idx * 0.04 }}
                      className={`flex-1 rounded-sm ${doc.isRelevant ? 'bg-blue-500' : 'bg-slate-200'}`}
                      title={`Rank ${idx+1}: ${doc.title}`}
                    />
                  ))}
                  {Array.from({ length: 10 - k }, (_, i) => (
                    <div key={`empty-${i}`} className="flex-1 h-2 rounded-sm bg-slate-100 opacity-40" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CURVE VIEW ─────────────────────────────────────────── */}
        {view === 'curve' && (
          <motion.div
            key="curve"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
            className="space-y-4"
          >
            <div className="glass rounded-2xl p-5 border border-white/80 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select System to Plot</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {RETRIEVAL_SYSTEMS.map(sys => {
                  const sc = SYSTEM_COLORS[sys.id];
                  return (
                    <button
                      key={sys.id}
                      onClick={() => setSelectedSystem(sys.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        selectedSystem === sys.id ? `${sc.pill} ring-2 ${sc.ring}` : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {sys.icon} {sys.label}
                    </button>
                  );
                })}
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
                <CurveViz curves={curves} selectedSystem={selectedSystem} />
              </div>
            </div>
            <div className="glass rounded-2xl p-4 border border-white/80">
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700">Reading the chart: </span>
                The x-axis shows cutoff depth k (1–10). Blue = Precision@k, Green = Recall@k, Purple = F1@k.
                Note how Recall monotonically increases as k grows, while Precision often falls.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── COMPARE VIEW ───────────────────────────────────────── */}
        {view === 'compare' && (
          <motion.div
            key="compare"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
            className="space-y-4"
          >
            <div className="glass rounded-2xl p-5 border border-white/80 shadow-sm space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Metric to Compare</p>
                <div className="flex flex-wrap gap-2">
                  {METRICS.map(m => {
                    const mc = METRIC_COLORS[m.id];
                    const active = selectedMetric === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMetric(m.id)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                          active ? `${mc.bg} ${mc.border} ${mc.text}` : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <ComparisonChart table={table} activeMetric={selectedMetric} />
            </div>

            {/* Full comparison table */}
            <div className="glass rounded-2xl overflow-hidden border border-white/80 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="text-left py-3 px-4 font-semibold text-slate-500">System</th>
                      <th className="text-center py-3 px-3 font-semibold text-blue-600"><MathJaxSpan>{"$P@10$"}</MathJaxSpan></th>
                      <th className="text-center py-3 px-3 font-semibold text-emerald-600"><MathJaxSpan>{"$R@10$"}</MathJaxSpan></th>
                      <th className="text-center py-3 px-3 font-semibold text-violet-600"><MathJaxSpan>{"$F_1$"}</MathJaxSpan></th>
                      <th className="text-center py-3 px-3 font-semibold text-rose-600"><MathJaxSpan>{"$\\text{MRR}$"}</MathJaxSpan></th>
                      <th className="text-center py-3 px-3 font-semibold text-slate-500">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {table.map((row, i) => {
                      const sc = SYSTEM_COLORS[row.id];
                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors hover:bg-white/60 ${i % 2 === 0 ? 'bg-white/30' : ''}`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span>{row.icon}</span>
                              <span className={`font-semibold ${sc.text}`}>{row.label}</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-3 font-mono font-semibold text-blue-700">{row.precision.toFixed(3)}</td>
                          <td className="text-center py-3 px-3 font-mono font-semibold text-emerald-700">{row.recall.toFixed(3)}</td>
                          <td className="text-center py-3 px-3 font-mono font-semibold text-violet-700">{row.f1.toFixed(3)}</td>
                          <td className="text-center py-3 px-3 font-mono font-semibold text-rose-700">{row.mrr.toFixed(3)}</td>
                          <td className="text-center py-3 px-3 font-mono text-slate-500">{row.latency}ms</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Next CTA */}
      <motion.div className="flex justify-center pt-2" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.03, y:-1 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-violet-200 cursor-pointer"
        >
          Proceed to Quiz
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
