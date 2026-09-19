import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  ChevronRight, 
  BarChart3, 
  FlaskConical, 
  Table, 
  Search, 
  Sparkles, 
  Info, 
  X, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  RETRIEVAL_SYSTEMS, 
  METRICS, 
  DOCUMENT_POOL,
  DEFAULT_QUERY,
  EXAMPLE_QUERIES,
  CORPUS_SCOPE,
  computeMetrics, 
  computeMRR, 
  computeCurve, 
  getComparisonTable
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
          ? 'bg-emerald-50/90 border-emerald-300 shadow-sm'
          : 'bg-slate-50/70 border-slate-200/80 opacity-80'
      }`}
    >
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5 ${
        doc.isRelevant ? 'bg-emerald-200 text-emerald-800 ring-2 ring-emerald-300/60' : 'bg-slate-200 text-slate-500'
      }`}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-slate-800 leading-snug">{doc.title}</p>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            doc.isRelevant ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'
          }`}>
            {doc.isRelevant ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-700 inline" />
                Relevant Hit
              </>
            ) : (
              'Non-Relevant'
            )}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{doc.snippet}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{doc.id}</span>
          {doc.topics && doc.topics.slice(0, 3).map((t, idx) => (
            <span key={idx} className="text-[9px] text-indigo-600 bg-indigo-50/70 border border-indigo-100 px-1.5 py-0.2 rounded-full font-medium">
              #{t}
            </span>
          ))}
        </div>
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
      <div className="space-y-2">
        {points.map((pt, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="w-8 font-mono text-slate-400 text-[11px]">k={idx + 1}</span>
            <div className="flex-1 flex gap-1 h-3.5 bg-slate-50 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pt.precision * 100}%` }}
                transition={{ duration: 0.4, delay: idx * 0.02 }}
                className="bg-blue-500 rounded-full h-full"
                title={`P@${idx+1}: ${pt.precision}`}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pt.recall * 100}%` }}
                transition={{ duration: 0.4, delay: idx * 0.02 + 0.1 }}
                className="bg-emerald-500 rounded-full h-full"
                title={`R@${idx+1}: ${pt.recall}`}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pt.f1 * 100}%` }}
                transition={{ duration: 0.4, delay: idx * 0.02 + 0.2 }}
                className="bg-violet-500 rounded-full h-full"
                title={`F1@${idx+1}: ${pt.f1}`}
              />
            </div>
            <span className="font-mono text-[10px] text-slate-500 w-24 text-right">
              P:{pt.precision} R:{pt.recall}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Full comparison bar chart
function ComparisonChart({ table, activeMetric }) {
  const mc = METRIC_COLORS[activeMetric] || METRIC_COLORS.precision;
  return (
    <div className="space-y-3">
      {table.map(sys => {
        const sc = SYSTEM_COLORS[sys.id];
        const val = sys[activeMetric] ?? 0;
        const pct = Math.min(Math.round(val * 100), 100);
        return (
          <div key={sys.id} className="flex items-center gap-3">
            <div className="w-36 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>{sys.icon}</span>
              <span>{sys.label}</span>
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
  const [queryInput, setQueryInput] = useState(DEFAULT_QUERY);
  const [showScopeGuide, setShowScopeGuide] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState('keyword');
  const [selectedMetric, setSelectedMetric] = useState('precision');
  const [k, setK] = useState(5);
  const [view, setView] = useState('sim'); // 'sim' | 'curve' | 'compare'

  // Metric computations dynamic to query and K
  const metrics = useMemo(() => computeMetrics(selectedSystem, k, queryInput), [selectedSystem, k, queryInput]);
  const mrr = useMemo(() => computeMRR(selectedSystem, queryInput), [selectedSystem, queryInput]);
  const curves = useMemo(() => {
    const out = {};
    RETRIEVAL_SYSTEMS.forEach(s => { out[s.id] = computeCurve(s.id, queryInput); });
    return out;
  }, [queryInput]);
  const table = useMemo(() => getComparisonTable(queryInput), [queryInput]);

  useMathJax([selectedSystem, selectedMetric, k, view, queryInput]);

  const activeMetricDef = METRICS.find(m => m.id === selectedMetric);

  const metricVals = {
    precision: { 
      label: 'Precision@k', 
      value: metrics.precision, 
      formula: '$P@k$', 
      color: 'precision', 
      description: `${metrics.relevantRetrieved} relevant in top-${k}` 
    },
    recall: { 
      label: 'Recall@k', 
      value: metrics.recall, 
      formula: '$R@k$', 
      color: 'recall', 
      description: `${metrics.relevantRetrieved} of ${metrics.totalRelevant} relevant found` 
    },
    f1: { 
      label: 'F₁-Score', 
      value: metrics.f1, 
      formula: '$F_1$', 
      color: 'f1', 
      description: 'Harmonic mean of P and R' 
    },
    mrr: { 
      label: 'Reciprocal Rank', 
      value: mrr, 
      formula: queryInput === DEFAULT_QUERY ? '$\\text{MRR}$' : '$\\text{RR}$', 
      color: 'mrr', 
      description: queryInput === DEFAULT_QUERY ? 'Avg reciprocal rank over test queries' : 'Reciprocal rank of first relevant doc' 
    },
  };

  const handleApplyExampleQuery = (eq) => {
    setQueryInput(eq.query);
  };

  const handleResetQuery = () => {
    setQueryInput(DEFAULT_QUERY);
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
            {/* Query Formulation & Scope Card */}
            <div className="glass rounded-2xl p-5 border border-white/80 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      Experimental Search Query
                      <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                        Live Retrieval
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enter any query to evaluate how different IR algorithms score and rank the 14-document corpus.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowScopeGuide(!showScopeGuide)}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    {showScopeGuide ? 'Hide Scope Guidelines' : 'Corpus Scope & Guidelines'}
                  </button>
                  {queryInput !== DEFAULT_QUERY && (
                    <button
                      onClick={handleResetQuery}
                      className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                      title="Reset to default benchmark query"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Enter a search query (e.g., 'Dense passage retrieval with BERT embeddings and FAISS')..."
                  className="w-full pl-10 pr-28 py-2.5 text-xs sm:text-sm font-medium bg-white/90 border border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1.5">
                  {queryInput && (
                    <button
                      onClick={() => setQueryInput('')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
                      title="Clear query"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    metrics.totalRelevant > 0 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {metrics.totalRelevant > 0 ? `${metrics.totalRelevant} Matches` : '0 Matches'}
                  </span>
                </div>
              </div>

              {/* Corpus Scope & Guidance Drawer */}
              <AnimatePresence>
                {showScopeGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl p-3.5 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 border border-indigo-100 text-xs space-y-2 overflow-hidden"
                  >
                    <div className="flex items-start gap-2">
                      <Layers className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-semibold text-indigo-950">
                          Corpus Scope & Query Boundaries
                        </p>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          This virtual lab operates on a curated academic test collection of <strong>14 Computer Science & Information Retrieval documents</strong>. For meaningful precision and recall calculations, queries should revolve around topics covered in the collection:
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {CORPUS_SCOPE.categories.map((cat, idx) => (
                            <span key={idx} className="text-[10px] bg-white text-indigo-700 border border-indigo-200/80 font-medium px-2 py-0.5 rounded-md shadow-2xs">
                              • {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Example Queries Section */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Example Benchmark Queries (Click to Test)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLE_QUERIES.map((eq, idx) => {
                    const isActive = queryInput === eq.query;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleApplyExampleQuery(eq)}
                        className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer text-left ${
                          isActive 
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs' 
                            : 'bg-white hover:bg-indigo-50/60 border-slate-200 text-slate-700 hover:border-indigo-300'
                        }`}
                        title={eq.hint}
                      >
                        <span className="text-xs">{eq.icon}</span>
                        <span>{eq.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${
                          isActive 
                            ? 'bg-indigo-700 text-indigo-100' 
                            : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                        }`}>
                          {eq.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Out-of-Domain Warning Alert */}
              {metrics.isOutOfDomain && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-3 bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2.5 text-xs"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-amber-900">Out-of-Scope Query Detected</p>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      No documents in the 14-paper academic corpus matched your search criteria. Consequently, <strong>Precision@k = 0.000</strong> and <strong>Recall@k = 0.000</strong>. Please try an Information Retrieval topic (e.g. <em>BM25</em>, <em>dense embeddings</em>, <em>vector search</em>, or <em>MRR</em>) or select an example query above.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

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
