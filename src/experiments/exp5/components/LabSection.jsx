import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sliders, Database, Layers, ArrowUpDown,
  BarChart3, CheckCircle2, XCircle, AlertCircle, Plus,
  FileText, Upload, RefreshCw, ChevronDown, ChevronUp,
  BookmarkPlus, Sparkles, TrendingUp, Cpu, Gauge,
  Activity, Play, Scale, Zap, Info, ArrowRight, ShieldCheck,
  Check, Copy, Terminal
} from 'lucide-react';
import {
  DEFAULT_CORPUS,
  PRESET_QUERIES,
  READY_MADE_SCENARIOS,
  STOP_WORDS,
  BM25Engine,
  TFIDFEngine,
  computeAllMetrics,
  preprocess
} from '../bm25Engine';

const LAB_VIEWS = [
  { id: 'arena',      label: 'Live Retrieval Arena',      icon: Zap,        desc: 'Side-by-side ranking with live score physics & rank deltas' },
  { id: 'physics',    label: 'Saturation & Length Lab',   icon: Scale,      desc: 'Interactive term spamming & length penalty balance simulator' },
  { id: 'diagnostics',label: 'Deep Diagnostic Stepper',   icon: Layers,     desc: '4-stage mathematical trace from tokenization to scoring' },
  { id: 'benchmark',  label: 'Multi-Metric Benchmarks',   icon: BarChart3,  desc: 'P@K, Recall@K, MRR, MAP, nDCG, and Kendall τ correlation' },
];

export default function LabSection({ onAddTrial, trialsCount }) {
  // Active Workbench Sub-View
  const [activeView, setActiveView] = useState('arena');

  // Collection State
  const [collectionSource, setCollectionSource] = useState('default'); // 'default' | 'scenario' | 'upload' | 'custom'
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('Term-saturation');
  const [customDocs, setCustomDocs] = useState([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocText, setNewDocText] = useState('');

  // Query State
  const [queryMode, setQueryMode] = useState('preset'); // 'preset' | 'scenario' | 'custom'
  const [selectedPresetKey, setSelectedPresetKey] = useState('BM25 parameter tuning and document scoring');
  const [customQueryText, setCustomQueryText] = useState('information retrieval indexing ranking');

  // Hyperparameters
  const [k1, setK1] = useState(1.5);
  const [b, setB] = useState(0.75);
  const [removeStopwords, setRemoveStopwords] = useState(true);
  const [applyStemming, setApplyStemming] = useState(true);
  const [kCutoff, setKCutoff] = useState(5);

  // Interactive Physics Simulator State
  const [simulatedRepetitions, setSimulatedRepetitions] = useState(8);
  const [simulatedLengthRatio, setSimulatedLengthRatio] = useState(1.4);

  // Trial Logging
  const [trialNote, setTrialNote] = useState('');
  const [trialSuccessMsg, setTrialSuccessMsg] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState(null);

  // Active corpus selection
  const corpus = useMemo(() => {
    if (collectionSource === 'scenario') {
      return READY_MADE_SCENARIOS[selectedScenarioKey]?.docs || DEFAULT_CORPUS;
    }
    if (collectionSource === 'custom' || collectionSource === 'upload') {
      return customDocs.length > 0 ? customDocs : DEFAULT_CORPUS;
    }
    return DEFAULT_CORPUS;
  }, [collectionSource, selectedScenarioKey, customDocs]);

  // Active query text and ground truth
  const { queryText, relevantSet, hasQrels } = useMemo(() => {
    if (collectionSource === 'scenario' && queryMode === 'scenario') {
      const scen = READY_MADE_SCENARIOS[selectedScenarioKey];
      return {
        queryText: scen.query,
        relevantSet: new Set(scen.relevant || []),
        hasQrels: true
      };
    }
    if (queryMode === 'preset') {
      const p = PRESET_QUERIES[selectedPresetKey];
      const isDefault = collectionSource === 'default';
      return {
        queryText: p.text,
        relevantSet: new Set(p.relevant),
        hasQrels: isDefault
      };
    }
    return {
      queryText: customQueryText,
      relevantSet: new Set(),
      hasQrels: false
    };
  }, [collectionSource, selectedScenarioKey, queryMode, selectedPresetKey, customQueryText]);

  // Build engines and compute rankings
  const { bm25Engine, tfidfEngine, bm25Ranked, tfidfRanked, queryTokens } = useMemo(() => {
    const bm25 = new BM25Engine(corpus, k1, b, removeStopwords, applyStemming);
    const tfidf = new TFIDFEngine(bm25);
    const { ranked: bRanked, queryTokens: qTokens } = bm25.rank(queryText);
    const tRanked = tfidf.rank(qTokens);
    return {
      bm25Engine: bm25,
      tfidfEngine: tfidf,
      bm25Ranked: bRanked,
      tfidfRanked: tRanked,
      queryTokens: qTokens
    };
  }, [corpus, k1, b, removeStopwords, applyStemming, queryText]);

  // Ranked document IDs
  const bm25RankedIds = useMemo(() => bm25Ranked.map(r => corpus[r.docIdx].id), [bm25Ranked, corpus]);
  const tfidfRankedIds = useMemo(() => tfidfRanked.map(r => corpus[r.docIdx].id), [tfidfRanked, corpus]);

  // Compute evaluation metrics
  const metrics = useMemo(() => {
    if (!hasQrels || relevantSet.size === 0) return null;
    return computeAllMetrics(bm25RankedIds, tfidfRankedIds, relevantSet, kCutoff);
  }, [hasQrels, relevantSet, bm25RankedIds, tfidfRankedIds, kCutoff]);

  // Max score for relative score bar visualization
  const maxScore = Math.max(
    ...bm25Ranked.slice(0, 10).map(r => r.score),
    ...tfidfRanked.slice(0, 10).map(r => r.score),
    1.0
  );

  // Quick lookup for TF-IDF rank
  const tfidfRankMap = useMemo(() => {
    const map = {};
    tfidfRanked.forEach((r, idx) => {
      map[corpus[r.docIdx].id] = idx + 1;
    });
    return map;
  }, [tfidfRanked, corpus]);

  // Handle adding custom document
  const handleAddCustomDoc = (e) => {
    e.preventDefault();
    if (!newDocText.trim()) return;
    const docId = `C${(customDocs.length + 1).toString().padStart(2, '0')}`;
    const newDoc = {
      id: docId,
      title: newDocTitle.trim() || `Custom Document ${docId}`,
      text: newDocText.trim()
    };
    setCustomDocs(prev => [...prev, newDoc]);
    setNewDocTitle('');
    setNewDocText('');
  };

  // Record trial
  const handleRecordTrial = () => {
    const trialData = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      query: queryText,
      corpusSource: collectionSource,
      k1,
      b,
      removeStopwords,
      applyStemming,
      kCutoff,
      topBM25Doc: corpus[bm25Ranked[0]?.docIdx]?.id || 'N/A',
      topBM25Score: bm25Ranked[0]?.score?.toFixed(4) || '0.0000',
      topTFIDFDoc: corpus[tfidfRanked[0]?.docIdx]?.id || 'N/A',
      metrics: metrics || {},
      note: trialNote || 'BM25 vs TF-IDF comparative evaluation'
    };
    if (onAddTrial) {
      onAddTrial(trialData);
    }
    setTrialSuccessMsg(true);
    setTimeout(() => setTrialSuccessMsg(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-slate-800">
      {/* ── 1. Animated Header Control Panel ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        {/* Top: Scenario Selector Chips */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Benchmark Scenario or Custom Corpus:</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-bold">
                N = {corpus.length} Docs
              </span>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                avgdl = {bm25Engine.avgdl.toFixed(1)} tokens
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'default', title: 'Default 15-Doc IR', desc: 'Comprehensive IR syllabus corpus' },
              { id: 'Term-saturation', title: 'Term Saturation', desc: 'Keyword stuffing vs focused Doc1' },
              { id: 'Length-normalization', title: 'Length Penalty', desc: 'Concise match vs padded Doc2' },
              { id: 'Benchmark-evaluation', title: 'Gold Standard', desc: 'Judged collection with Qrels' },
            ].map(scen => {
              const isSelected = (collectionSource === 'default' && scen.id === 'default') ||
                                 (collectionSource === 'scenario' && selectedScenarioKey === scen.id);
              return (
                <button
                  key={scen.id}
                  onClick={() => {
                    if (scen.id === 'default') {
                      setCollectionSource('default');
                      setQueryMode('preset');
                    } else {
                      setCollectionSource('scenario');
                      setSelectedScenarioKey(scen.id);
                      setQueryMode('scenario');
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-linear-to-br from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <p className="font-bold text-xs truncate">{scen.title}</p>
                  <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {scen.desc}
                  </p>
                  {isSelected && (
                    <motion.div
                      layoutId="activeScenBadge"
                      className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle: Query Bar with Live Token Stream */}
        <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={queryText}
                onChange={(e) => {
                  setCustomQueryText(e.target.value);
                  setQueryMode('custom');
                }}
                placeholder="Type query to see real-time BM25 scoring..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {collectionSource === 'default' && (
                <select
                  value={selectedPresetKey}
                  onChange={(e) => {
                    setSelectedPresetKey(e.target.value);
                    setQueryMode('preset');
                  }}
                  className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                >
                  {Object.keys(PRESET_QUERIES).map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Active Preprocessed Token Chips */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Query Tokens:
            </span>
            {queryTokens.length > 0 ? (
              queryTokens.map((tok, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-bold text-xs border border-blue-200"
                >
                  {tok}
                </motion.span>
              ))
            ) : (
              <span className="text-slate-400 italic text-[11px]">No active tokens</span>
            )}
          </div>
        </div>

        {/* Bottom: Hyperparameter Sliders with Dynamic Glow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* k1 slider */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                k₁ (TF Saturation)
              </span>
              <span className="font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200">
                {k1.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="3.0"
              step="0.05"
              value={k1}
              onChange={(e) => setK1(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0.0 (Binary)</span>
              <span>1.5 (Default)</span>
              <span>3.0 (Linear-like)</span>
            </div>
          </div>

          {/* b slider */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                b (Length Penalty)
              </span>
              <span className="font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200">
                {b.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={b}
              onChange={(e) => setB(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0.0 (No Penalty)</span>
              <span>0.75 (Default)</span>
              <span>1.0 (Full Inverse)</span>
            </div>
          </div>

          {/* Preprocessing Toggles */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-xs">
            <span className="text-xs font-bold text-slate-700 block mb-2">Preprocessing Toggles</span>
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeStopwords}
                  onChange={(e) => setRemoveStopwords(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600"
                />
                <span>Stopwords</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyStemming}
                  onChange={(e) => setApplyStemming(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600"
                />
                <span>Stemming</span>
              </label>
            </div>
          </div>

          {/* Cutoff K & Record Trial */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Top-K Cutoff</span>
              <select
                value={kCutoff}
                onChange={(e) => setKCutoff(parseInt(e.target.value))}
                className="text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded px-2 py-0.5"
              >
                {[3, 5, 8, 10].map(val => (
                  <option key={val} value={val}>K = {val}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRecordTrial}
              className="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-blue-400" />
              <span>Log Trial ({trialsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {trialSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center shadow-xs"
        >
          ✅ Trial logged successfully into experimental session record!
        </motion.div>
      )}

      {/* ── 2. Interactive Navigation Sub-Tabs ── */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto">
        {LAB_VIEWS.map(v => {
          const Icon = v.icon;
          const isActive = activeView === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white text-blue-700 shadow-md border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3. Tab Content View 1: Live Retrieval Arena ── */}
      {activeView === 'arena' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* BM25 Live Ranking Column */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                  <h3 className="font-bold text-slate-900 text-sm">Okapi BM25 Ranking</h3>
                </div>
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200">
                  k₁={k1.toFixed(2)}, b={b.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2.5">
                {bm25Ranked.slice(0, 8).map((r, idx) => {
                  const doc = corpus[r.docIdx];
                  const isRel = hasQrels ? relevantSet.has(doc.id) : null;
                  const isExpanded = expandedDocId === doc.id;
                  const tRank = tfidfRankMap[doc.id] || corpus.length;
                  const delta = tRank - (idx + 1);

                  return (
                    <motion.div
                      key={doc.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isRel
                          ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                          : 'bg-white border-slate-200/90 hover:bg-slate-50/80 hover:border-slate-300 shadow-2xs'
                      }`}
                      onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Left Content */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-slate-200/80">
                            #{idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-700 text-xs shrink-0">{doc.id}</span>
                              <span className="font-bold text-slate-900 text-xs truncate">{doc.title}</span>
                              {delta !== 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                  delta > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {delta > 0 ? `+${delta}` : delta}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{doc.text}</p>
                          </div>
                        </div>

                        {/* Right Content */}
                        <div className="flex items-center gap-2 shrink-0 pl-2">
                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-slate-900 block leading-tight">
                              {r.score.toFixed(4)}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400 block">BM25</span>
                          </div>
                          {hasQrels && (
                            isRel ? (
                              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0" title="Ground Truth Relevant">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center shrink-0" title="Non-relevant">
                                <XCircle className="w-3.5 h-3.5" />
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Expandable Per-Term Breakdown */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-3 mt-3 border-t border-slate-200/80 space-y-1.5"
                          >
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Term Contributions Breakdown:
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                              {bm25Engine.termDiagnostics(queryTokens, r.docIdx).map((d, dIdx) => (
                                <div key={dIdx} className="bg-white p-2 rounded-xl border border-slate-200 flex justify-between">
                                  <span className="text-slate-600 font-sans">{d.term} (tf={d.f}):</span>
                                  <span className="font-bold text-blue-700">+{d.subScore.toFixed(4)}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Baseline TF-IDF Live Ranking Column */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Baseline TF-IDF (ltc Cosine)</h3>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg border border-amber-200">
                  Cosine Similarity
                </span>
              </div>

              <div className="space-y-2.5">
                {tfidfRanked.slice(0, 8).map((r, idx) => {
                  const doc = corpus[r.docIdx];
                  const isRel = hasQrels ? relevantSet.has(doc.id) : null;

                  return (
                    <motion.div
                      key={doc.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isRel
                          ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                          : 'bg-white border-slate-200/90 hover:bg-slate-50/80 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Left Content */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-slate-200/80">
                            #{idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-700 text-xs shrink-0">{doc.id}</span>
                              <span className="font-bold text-slate-900 text-xs truncate">{doc.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{doc.text}</p>
                          </div>
                        </div>

                        {/* Right Content */}
                        <div className="flex items-center gap-2 shrink-0 pl-2">
                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-slate-900 block leading-tight">
                              {r.score.toFixed(4)}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400 block">Cosine</span>
                          </div>
                          {hasQrels && (
                            isRel ? (
                              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0" title="Ground Truth Relevant">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center shrink-0" title="Non-relevant">
                                <XCircle className="w-3.5 h-3.5" />
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Score Distribution Visual Comparison */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Relative Top-8 Score Spectrum: BM25 (Blue) vs TF-IDF (Amber)
            </h4>
            <div className="space-y-2 text-xs">
              {bm25Ranked.slice(0, 8).map((r, idx) => {
                const doc = corpus[r.docIdx];
                const bScore = r.score;
                const tfidfObj = tfidfRanked.find(t => t.docIdx === r.docIdx);
                const tScore = tfidfObj ? tfidfObj.score : 0;
                const bPercent = (bScore / maxScore) * 100;
                const tPercent = (tScore / maxScore) * 100;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-800 font-bold">{doc.id} • {doc.title.slice(0, 36)}...</span>
                      <span>BM25: <strong>{bScore.toFixed(3)}</strong> | TF-IDF: <strong>{tScore.toFixed(3)}</strong></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3.5 flex overflow-hidden p-0.5 border border-slate-200">
                      <motion.div
                        style={{ width: `${bPercent}%` }}
                        className="bg-linear-to-r from-blue-600 to-indigo-600 h-full rounded-l-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${bPercent}%` }}
                        transition={{ duration: 0.4 }}
                      />
                      <motion.div
                        style={{ width: `${tPercent}%` }}
                        className="bg-linear-to-r from-amber-400 to-amber-500 h-full rounded-r-full opacity-80"
                        initial={{ width: 0 }}
                        animate={{ width: `${tPercent}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Tab Content View 2: Saturation & Length Physics Lab ── */}
      {activeView === 'physics' && (
        <div className="space-y-6">
          {/* Term Frequency Saturation Interactive Simulator */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Term Frequency Saturation Simulator (k₁ Asymptote)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Simulate repeating a keyword multiple times to witness the diminishing returns of BM25 vs unconstrained linear TF.
                </p>
              </div>

              {/* Repetition Buttons */}
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setSimulatedRepetitions(Math.max(1, simulatedRepetitions - 1))}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  -1 Repetition
                </button>
                <span className="font-mono text-xs font-black px-2 text-blue-700">
                  TF = {simulatedRepetitions}
                </span>
                <button
                  onClick={() => setSimulatedRepetitions(simulatedRepetitions + 1)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  +1 Repetition
                </button>
              </div>
            </div>

            {/* Live Formula Visualization */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-1">
                <span className="text-xs text-blue-700 font-bold uppercase block">BM25 TF Factor</span>
                <span className="text-2xl font-black font-mono text-blue-900">
                  {((simulatedRepetitions * (k1 + 1)) / (simulatedRepetitions + k1)).toFixed(3)}
                </span>
                <span className="text-[10px] text-blue-600 block">Approaches ceiling {(k1 + 1).toFixed(2)}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="text-xs text-slate-600 font-bold uppercase block">Logarithmic TF: 1 + ln(f)</span>
                <span className="text-2xl font-black font-mono text-slate-800">
                  {(1 + Math.log(simulatedRepetitions)).toFixed(3)}
                </span>
                <span className="text-[10px] text-slate-500 block">Unbounded slow growth</span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-1">
                <span className="text-xs text-rose-700 font-bold uppercase block">Raw Linear TF (Spam Risk)</span>
                <span className="text-2xl font-black font-mono text-rose-900">
                  {simulatedRepetitions}
                </span>
                <span className="text-[10px] text-rose-600 block">Keyword stuffing exploit!</span>
              </div>
            </div>

            {/* Asymptotic SVG Curve Canvas */}
            <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Saturation Curve for k₁ = {k1.toFixed(2)}</span>
                <span className="text-sky-400 font-mono font-bold">Asymptote Ceiling: {(k1 + 1).toFixed(2)}</span>
              </div>

              {/* Progress bar visualizer */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700 p-0.5">
                  <motion.div
                    className="bg-linear-to-r from-sky-400 to-blue-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (((simulatedRepetitions * (k1 + 1)) / (simulatedRepetitions + k1)) / (k1 + 1)) * 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>TF=1 ({((1 * (k1 + 1)) / (1 + k1)).toFixed(2)})</span>
                  <span>Current: {((simulatedRepetitions * (k1 + 1)) / (simulatedRepetitions + k1)).toFixed(3)} / {(k1 + 1).toFixed(2)}</span>
                  <span>Saturated Limit (100%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Length Penalty Balance Simulator */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  <span>Document Length Balance Scale Simulator (b Parameter)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  See how document size relative to collection average (avgdl) shifts the length penalty factor.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600 font-bold">Relative Length |D| / avgdl:</span>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={simulatedLengthRatio}
                  onChange={(e) => setSimulatedLengthRatio(parseFloat(e.target.value))}
                  className="w-32 accent-emerald-600 cursor-pointer"
                />
                <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                  {simulatedLengthRatio.toFixed(1)}×
                </span>
              </div>
            </div>

            {/* Calculated Penalty */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-900 block">Length Penalty Denominator Factor:</span>
                <p className="text-xs text-emerald-700 font-mono mt-0.5">
                  1 - b + b · (|D| / avgdl) = 1 - {b.toFixed(2)} + {b.toFixed(2)} · {simulatedLengthRatio.toFixed(1)} = <strong className="text-sm">{(1 - b + b * simulatedLengthRatio).toFixed(3)}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 uppercase block">Verdict</span>
                <span className={`text-sm font-bold ${
                  simulatedLengthRatio > 1.0 ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {simulatedLengthRatio > 1.0 ? 'Penalized for padding' : 'Rewarded for conciseness'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Tab Content View 3: Deep Diagnostic Stepper ── */}
      {activeView === 'diagnostics' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Step-by-Step Mathematical Diagnostic Inspector
            </h3>
          </div>

          {/* Stepper Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-blue-600">Stage 1: Tokenization</span>
              <p className="text-xs text-slate-600">
                Punctuation stripped, lowercase folded, stop-words removed, suffix-stemmed.
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {queryTokens.map((t, idx) => (
                  <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[10px] font-bold text-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-emerald-600">Stage 2: Robertson IDF</span>
              <p className="text-xs text-slate-600">
                Calculates term rarity: ln(1 + (N - n(q) + 0.5) / (n(q) + 0.5)).
              </p>
              <div className="space-y-1 font-mono text-[11px] pt-1">
                {Array.from(new Set(queryTokens)).map((t, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-200/50 py-0.5">
                    <span>{t}:</span>
                    <strong className="text-emerald-700">{bm25Engine.idf(t).toFixed(4)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-purple-600">Stage 3: Corpus Statistics</span>
              <p className="text-xs text-slate-600">
                Collection pivots used for dynamic denominator length scaling.
              </p>
              <div className="space-y-1 font-mono text-[11px] pt-1">
                <div className="flex justify-between border-b border-slate-200/50 py-0.5">
                  <span>N (Total Docs):</span>
                  <strong>{bm25Engine.N}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 py-0.5">
                  <span>avgdl (Tokens):</span>
                  <strong>{bm25Engine.avgdl.toFixed(1)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Full Robertson IDF Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Query Term</th>
                  <th className="py-2.5 px-3 text-center">Doc Frequency (n_q)</th>
                  <th className="py-2.5 px-3 text-center">Corpus Size (N)</th>
                  <th className="py-2.5 px-3">Formula</th>
                  <th className="py-2.5 px-3 text-right">Computed Robertson IDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {Array.from(new Set(queryTokens)).map((term, i) => {
                  const nt = bm25Engine.df[term] || 0;
                  const idfVal = bm25Engine.idf(term);
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-blue-700">{term}</td>
                      <td className="py-2 px-3 text-center">{nt}</td>
                      <td className="py-2 px-3 text-center">{bm25Engine.N}</td>
                      <td className="py-2 px-3 text-slate-500 font-sans text-[10px]">
                        ln(1 + ({bm25Engine.N} - {nt} + 0.5) / ({nt} + 0.5))
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{idfVal.toFixed(4)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 6. Tab Content View 4: Multi-Metric Benchmarks ── */}
      {activeView === 'benchmark' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Multi-Metric Evaluation Suite (Ground-Truth Qrels)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Cutoff: Top-{kCutoff}</span>
          </div>

          {metrics ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(metrics).map(([name, val]) => (
                <div key={name} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{name}</span>
                  <span className="text-xl font-bold font-mono text-blue-700 block">{val}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center space-y-2">
              <AlertCircle className="w-6 h-6 mx-auto text-amber-600" />
              <p className="font-bold">Evaluation Metrics require preset ground-truth judgements.</p>
              <p>Switch to "Default 15-Doc IR" or "Gold Standard Scenario" with preset queries to enable full evaluation.</p>
            </div>
          )}

          {/* Metric Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Precision@K & Recall@K</span>
              <p className="text-[11px] text-slate-500">
                Fraction of retrieved documents that are relevant (Precision) vs fraction of all known relevant documents found (Recall).
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">MRR & MAP</span>
              <p className="text-[11px] text-slate-500">
                Mean Reciprocal Rank focuses on first relevant hit rank (1/r), while Average Precision scores the whole ranked trajectory.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Kendall\'s Tau (τ)</span>
              <p className="text-[11px] text-slate-500">
                Non-parametric pairwise correlation between BM25 and TF-IDF rankings (-1 to +1). Measures rank concordance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
