import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Sliders, Play, RotateCcw, Plus, Trash2,
  FileText, CheckCircle, AlertTriangle, Layers, BarChart3,
  Compass, Eye, ArrowRight, Download, Save, Award, Info,
  Sparkles, Check, ChevronRight, Globe, ShieldAlert, Copy,
  Briefcase, Headphones, ShoppingCart
} from 'lucide-react';
import {
  APPLICATIONS,
  TF_SCHEMES,
  IDF_SCHEMES,
  PIPELINE_STAGES,
  runRetrieval,
  tokenize
} from '../tfidfEngine';

export default function LabSection({ trials = [], onAddTrial }) {
  // Scenario Selection (Default: Web Search)
  const [selectedAppId, setSelectedAppId] = useState('web_search');
  const activeApp = APPLICATIONS.find(a => a.id === selectedAppId) || APPLICATIONS[0];

  // Pipeline Configuration State
  const [corpus, setCorpus] = useState([...activeApp.corpus]);
  const [query, setQuery] = useState(activeApp.query);
  const [tfScheme, setTfScheme] = useState('raw');
  const [idfScheme, setIdfScheme] = useState('standard');
  const [useCosine, setUseCosine] = useState(true);
  const [cutoffK, setCutoffK] = useState(3);
  const [relevantIndices, setRelevantIndices] = useState([...(activeApp.relevantIndices || [0])]);

  // Active View Tab in Lab
  const [labTab, setLabTab] = useState('results'); // 'results', 'matrix', 'space', 'pipeline'
  const [matrixView, setMatrixView] = useState('tfidf'); // 'tfidf', 'tf', 'idf'
  const [selectedCell, setSelectedCell] = useState(null);
  const [pipelineStep, setPipelineStep] = useState(1);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Switch scenario preset
  const handleSelectApp = (appId) => {
    setSelectedAppId(appId);
    const app = APPLICATIONS.find(a => a.id === appId);
    if (app) {
      setCorpus([...app.corpus]);
      setQuery(app.query);
      setRelevantIndices([...(app.relevantIndices || [0])]);
      setSelectedCell(null);
    }
  };

  // Run retrieval pipeline reactively
  const results = useMemo(() => {
    return runRetrieval(
      corpus,
      query,
      tfScheme,
      idfScheme,
      useCosine,
      relevantIndices
    );
  }, [corpus, query, tfScheme, idfScheme, useCosine, relevantIndices]);

  // Modify Corpus
  const handleDocChange = (index, newText) => {
    const next = [...corpus];
    next[index] = newText;
    setCorpus(next);
  };

  const handleAddDoc = () => {
    setCorpus([...corpus, 'New document text for indexing and retrieval.']);
  };

  const handleRemoveDoc = (index) => {
    if (corpus.length <= 2) return; // Keep at least 2 docs
    const next = corpus.filter((_, i) => i !== index);
    setCorpus(next);
    setRelevantIndices(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const toggleRelevant = (docIdx) => {
    setRelevantIndices(prev =>
      prev.includes(docIdx) ? prev.filter(i => i !== docIdx) : [...prev, docIdx]
    );
  };

  // Save Trial
  const handleSaveTrial = () => {
    const topDocIdx = results.ranking[0];
    const topScore = results.scores[topDocIdx] || 0;
    const topDocText = corpus[topDocIdx] || '';

    const newTrial = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      scenario: activeApp.name,
      query,
      tfScheme,
      idfScheme,
      useCosine,
      cutoffK,
      topDoc: `D${topDocIdx + 1}: ${topDocText.slice(0, 60)}...`,
      topScore: Number(topScore.toFixed(4)),
      precisionAtK: Number((results.metrics.precisionAtK || 0).toFixed(3)),
      ndcgAtK: Number((results.metrics.ndcgAtK || 0).toFixed(3)),
      map: Number((results.metrics.averagePrecision || 0).toFixed(3))
    };

    if (onAddTrial) {
      onAddTrial(newTrial);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  // Highlight query words in document text
  const renderHighlightedDoc = (text = '', queryTokens = []) => {
    if (!text) return null;
    const qSet = new Set(queryTokens.map(t => t.toLowerCase()));
    const words = text.split(/(\s+|[.,;!?()]+)/);

    return words.map((w, idx) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isMatch = qSet.has(clean);
      if (isMatch) {
        return (
          <span key={idx} className="bg-amber-200 text-amber-900 font-semibold px-1 py-0.5 rounded">
            {w}
          </span>
        );
      }
      return <span key={idx}>{w}</span>;
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800">
      {/* Scenario / Domain Presets Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Real-World Application Scenarios
            </div>
            <h2 className="text-lg font-bold text-slate-900">Choose an Information Retrieval Benchmark</h2>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Loaded: <span className="text-slate-900 font-bold">{activeApp.name}</span>
          </div>
        </div>

        {/* Preset Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {APPLICATIONS.map((app) => {
            const isSelected = app.id === selectedAppId;
            return (
              <button
                key={app.id}
                onClick={() => handleSelectApp(app.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold leading-tight mb-1 truncate">
                    {app.name.split(' ')[0]}
                  </div>
                  <div className={`text-[10px] line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {app.badge}
                  </div>
                </div>
                <div className={`text-[9px] mt-2 font-mono ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                  {app.targetMetric}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Application Description Banner */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex flex-col md:flex-row gap-3 items-start md:items-center justify-between text-xs text-blue-900">
          <div className="space-y-0.5">
            <span className="font-bold text-blue-950 block">Domain Context: {activeApp.name}</span>
            <p className="text-blue-800 leading-relaxed">{activeApp.why}</p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="bg-white/80 border border-blue-200 text-blue-700 font-semibold px-2 py-1 rounded text-[11px]">
              Target: {activeApp.targetMetric}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Controls & Corpus Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Query & Scheme Configurator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                Query Input
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {results.queryTokens.length} in-vocab / {results.oovTerms.length} OOV
              </span>
            </div>

            {/* Query Input Box */}
            <div className="space-y-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter search query..."
                className="w-full px-3.5 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
              />

              {/* Tokens Chip Preview */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {results.queryTokens.map((t, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-semibold">
                    {t}
                    <span className="text-[9px] opacity-75">
                      idf:{(results.idf[t] || 0).toFixed(2)}
                    </span>
                  </span>
                ))}
                {results.oovTerms.map((t, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-mono bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md line-through" title="Out of Vocabulary: Not present in corpus">
                    {t} (OOV)
                  </span>
                ))}
              </div>
            </div>

            {/* Scheme Weighting Controls */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Weighting Parameters
              </h4>

              {/* TF Scheme */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Term Frequency (TF) Variant
                </label>
                <select
                  value={tfScheme}
                  onChange={(e) => setTfScheme(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="raw">Raw Count (f_t,d)</option>
                  <option value="norm">Length-Normalized (f_t,d / |d|)</option>
                  <option value="log">Log-Normalized (1 + log10(f_t,d))</option>
                  <option value="binary">Binary (1 if count &gt; 0 else 0)</option>
                </select>
              </div>

              {/* IDF Scheme */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Inverse Document Frequency (IDF)
                </label>
                <select
                  value={idfScheme}
                  onChange={(e) => setIdfScheme(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard">Standard: log10(N / df)</option>
                  <option value="smoothed">Smoothed: log10(1 + N / df)</option>
                  <option value="sklearn">Scikit-Learn: ln((1+N)/(1+df)) + 1</option>
                </select>
              </div>

              {/* Vector Normalization Switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">Vector Scoring Metric</div>
                  <div className="text-[11px] text-slate-500">
                    {useCosine ? 'Cosine Similarity (Angle / Length Invariant)' : 'Dot Product (Magnitude Sensitive)'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUseCosine(!useCosine)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    useCosine
                      ? 'bg-blue-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {useCosine ? 'Cosine' : 'Dot Product'}
                </button>
              </div>

              {/* Cutoff K Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Evaluation Cutoff (k)</span>
                  <span className="font-mono font-bold text-blue-600">k = {cutoffK}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={Math.min(5, corpus.length)}
                  value={cutoffK}
                  onChange={(e) => setCutoffK(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleSaveTrial}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      Recorded in Trial Log!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-blue-400" />
                      Record Current Trial
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    const app = APPLICATIONS.find(a => a.id === selectedAppId);
                    if (app) {
                      setCorpus([...app.corpus]);
                      setQuery(app.query);
                      setTfScheme('raw');
                      setIdfScheme('standard');
                      setUseCosine(true);
                      setCutoffK(3);
                    }
                  }}
                  className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Reset to Scenario Default"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Corpus Documents Editor (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Corpus Collection ({corpus.length} Documents)
                </h3>
                <p className="text-xs text-slate-500">
                  Click the checkbox on any document to designate it as ground-truth relevant for P@k & Recall@k evaluation.
                </p>
              </div>
              <button
                onClick={handleAddDoc}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Doc
              </button>
            </div>

            {/* Documents List */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {corpus.map((docText, idx) => {
                const isRel = relevantIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all text-xs space-y-1.5 ${
                      isRel
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-slate-700">D{idx + 1}</span>
                        <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isRel}
                            onChange={() => toggleRelevant(idx)}
                            className="rounded accent-emerald-600 cursor-pointer"
                          />
                          <span className={isRel ? 'text-emerald-700 font-bold' : ''}>
                            {isRel ? 'Ground-Truth Relevant' : 'Mark Relevant'}
                          </span>
                        </label>
                      </div>
                      {corpus.length > 2 && (
                        <button
                          onClick={() => handleRemoveDoc(idx)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={docText}
                      onChange={(e) => handleDocChange(idx, e.target.value)}
                      className="w-full p-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 text-xs font-sans resize-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Vocabulary Size |V|: {results.vocab.length} terms</span>
            <span>Total Corpus Tokens: {results.docTokensList.flat().length}</span>
          </div>
        </div>
      </div>

      {/* Interactive Workbench Tabs (Ranked Results, Matrix Heatmap, 2D Space, Pipeline) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'results', label: '1. Ranked Results & Metrics', icon: BarChart3 },
              { id: 'matrix', label: '2. Term Weight Matrices', icon: Layers },
              { id: 'space', label: '3. Vector Space 2D View', icon: Compass },
              { id: 'pipeline', label: '4. Pipeline Stepper', icon: ArrowRight },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = labTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setLabTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Ranking Mode: <span className="font-semibold text-slate-800">{useCosine ? 'Cosine Similarity' : 'Raw Dot Product'}</span>
          </div>
        </div>

        {/* Tab 1: Ranked Results & IR Metrics */}
        {labTab === 'results' && (
          <div className="space-y-6">
            {/* Live Evaluation Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: `Precision@${cutoffK}`, value: results.metrics.precisionAtK.toFixed(3), desc: 'Relevant in top-k / k', color: 'blue' },
                { label: `Recall@${cutoffK}`, value: results.metrics.recallAtK.toFixed(3), desc: 'Found / total relevant', color: 'indigo' },
                { label: `F1@${cutoffK}`, value: results.metrics.f1AtK.toFixed(3), desc: 'Harmonic mean', color: 'purple' },
                { label: 'Avg Precision', value: results.metrics.averagePrecision.toFixed(3), desc: 'Rank-weighted (AP)', color: 'emerald' },
                { label: `nDCG@${cutoffK}`, value: results.metrics.ndcgAtK.toFixed(3), desc: 'Discounted gain (0-1)', color: 'amber' },
                { label: 'Reciprocal Rank', value: results.metrics.reciprocalRank.toFixed(3), desc: '1 / rank of first match', color: 'teal' },
              ].map((m, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">{m.label}</div>
                  <div className="text-xl font-bold font-mono text-slate-900 my-1">{m.value}</div>
                  <div className="text-[10px] text-slate-400 truncate">{m.desc}</div>
                </div>
              ))}
            </div>

            {/* Ranked Document Cards List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ranked Document Order (Descending Score)
              </h4>
              {results.ranking.map((docIdx, rankZero) => {
                const rank = rankZero + 1;
                const score = results.scores[docIdx] || 0;
                const isRel = relevantIndices.includes(docIdx);
                const matches = results.termMatches[docIdx] || [];
                const docText = corpus[docIdx] || '';
                const pct = Math.min(100, Math.max(0, score * 100));

                return (
                  <motion.div
                    key={docIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rankZero * 0.04 }}
                    className={`p-4 rounded-xl border transition-all ${
                      rank === 1
                        ? 'bg-blue-50/40 border-blue-300 shadow-sm'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center font-mono ${
                          rank === 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          #{rank}
                        </span>
                        <span className="font-bold text-sm text-slate-900 font-mono">
                          Document D{docIdx + 1}
                        </span>
                        {isRel ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" /> Relevant
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            Non-Relevant
                          </span>
                        )}
                      </div>

                      {/* Score Value & Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all ${
                              rank === 1 ? 'bg-blue-600' : 'bg-slate-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-800 w-14 text-right">
                          {score.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {/* Document Text with Highlighted Query Terms */}
                    <div className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 mb-2">
                      {renderHighlightedDoc(docText, results.queryTokens)}
                    </div>

                    {/* Overlapping Query Terms Breakdown */}
                    {matches.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Term Hits:</span>
                        {matches.map((m, mIdx) => (
                          <span key={mIdx} className="inline-flex items-center gap-1 text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                            <strong className="text-blue-600">{m.term}</strong>
                            <span className="text-slate-400">TF:{m.docTf}</span>
                            <span className="text-indigo-600">IDF:{m.idf.toFixed(2)}</span>
                            <span className="text-emerald-700 font-semibold font-mono">wt:{(m.docWeight).toFixed(3)}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        Zero vocabulary overlap with query. Cosine similarity = 0.000.
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Term Weight Matrices Heatmap */}
        {labTab === 'matrix' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Term Weight Matrix Viewer</h4>
                <p className="text-xs text-slate-500">
                  Inspect the mathematical values across all documents. Click any matrix cell to view its full derivation.
                </p>
              </div>

              {/* View toggle */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                {[
                  { id: 'tfidf', label: 'TF-IDF Weight (w_td)' },
                  { id: 'tf', label: 'Term Frequency (TF)' },
                  { id: 'idf', label: 'Corpus IDF' },
                ].map(view => (
                  <button
                    key={view.id}
                    onClick={() => {
                      setMatrixView(view.id);
                      setSelectedCell(null);
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      matrixView === view.id
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-mono sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5 border-b border-r border-slate-200 bg-slate-100">Document</th>
                    {results.vocab.map(term => {
                      const isQueryTerm = results.queryTokens.includes(term);
                      return (
                        <th
                          key={term}
                          className={`p-2.5 border-b border-slate-200 whitespace-nowrap text-center ${
                            isQueryTerm ? 'bg-blue-100 text-blue-900 font-bold' : ''
                          }`}
                        >
                          {term}
                          {isQueryTerm && <span className="block text-[9px] text-blue-600">[Q]</span>}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {/* Query Vector Row */}
                  <tr className="bg-blue-50/60 font-semibold">
                    <td className="p-2.5 border-r border-slate-200 text-blue-900 font-bold whitespace-nowrap">
                      Query Vector (q)
                    </td>
                    {results.vocab.map(term => {
                      const val = matrixView === 'tfidf'
                        ? results.queryTfidf[term] || 0
                        : matrixView === 'tf'
                        ? results.queryTf[term] || 0
                        : results.idf[term] || 0;
                      return (
                        <td
                          key={term}
                          className={`p-2 text-center text-[11px] ${
                            val > 0 ? 'text-blue-700 font-bold bg-blue-100/50' : 'text-slate-300'
                          }`}
                        >
                          {val > 0 ? val.toFixed(2) : '-'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Document Rows */}
                  {corpus.map((_, docIdx) => (
                    <tr key={docIdx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 border-r border-slate-200 font-bold text-slate-800 whitespace-nowrap bg-slate-50/80">
                        Doc D{docIdx + 1}
                      </td>
                      {results.vocab.map(term => {
                        const tfVal = results.tfMatrix[docIdx][term] || 0;
                        const idfVal = results.idf[term] || 0;
                        const tfidfVal = results.tfidfMatrix[docIdx][term] || 0;

                        const displayVal = matrixView === 'tfidf'
                          ? tfidfVal
                          : matrixView === 'tf'
                          ? tfVal
                          : idfVal;

                        const isMatch = results.queryTokens.includes(term) && tfVal > 0;

                        return (
                          <td
                            key={term}
                            onClick={() => setSelectedCell({ docIdx, term, tfVal, idfVal, tfidfVal })}
                            className={`p-2 text-center text-[11px] cursor-pointer transition-colors ${
                              isMatch
                                ? 'bg-amber-100/80 font-bold text-amber-900'
                                : displayVal > 0
                                ? 'text-slate-800 bg-slate-50'
                                : 'text-slate-300'
                            } hover:ring-2 hover:ring-blue-400`}
                          >
                            {displayVal > 0 ? displayVal.toFixed(2) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Clicked Cell Inspector Modal / Card */}
            {selectedCell && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-blue-900 text-sm mb-1">
                    Term Weight Breakdown: <span className="font-mono text-indigo-700 font-extrabold">"{selectedCell.term}"</span> in Document D{selectedCell.docIdx + 1}
                  </div>
                  <div className="text-blue-800 space-y-1">
                    <p>
                      <strong>Local TF ({tfScheme}):</strong> {selectedCell.tfVal.toFixed(4)} &nbsp;|&nbsp;
                      <strong>Corpus df:</strong> {results.df[selectedCell.term] || 0} of {corpus.length} docs &nbsp;|&nbsp;
                      <strong>Global IDF ({idfScheme}):</strong> {selectedCell.idfVal.toFixed(4)}
                    </p>
                    <p className="font-mono font-bold text-blue-950 pt-0.5">
                      TF-IDF Weight = {selectedCell.tfVal.toFixed(4)} × {selectedCell.idfVal.toFixed(4)} = {selectedCell.tfidfVal.toFixed(4)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 font-semibold"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Tab 3: Vector Space 2D View */}
        {labTab === 'space' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Vector Space 2D Projection</h4>
              <p className="text-xs text-slate-500">
                Visualizing Query Vector q and Document Vectors d in a 2D plane using the top two dominant query terms.
              </p>
            </div>

            {/* SVG 2D Vector Plane */}
            <div className="bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center text-white relative shadow-inner">
              {(() => {
                const qTerms = results.queryTokens;
                const t1 = qTerms[0] || (results.vocab[0] || 'term_1');
                const t2 = qTerms[1] || (results.vocab[1] || 'term_2');

                const ox = 70;
                const oy = 260;
                const maxDim = 200;

                // Scale factor
                let maxVal = Math.max(
                  results.queryTfidf[t1] || 0.1,
                  results.queryTfidf[t2] || 0.1,
                  ...corpus.map((_, i) => Math.max(results.tfidfMatrix[i][t1] || 0, results.tfidfMatrix[i][t2] || 0))
                );
                if (maxVal === 0) maxVal = 1;

                const qX = ox + ((results.queryTfidf[t1] || 0) / maxVal) * maxDim;
                const qY = oy - ((results.queryTfidf[t2] || 0) / maxVal) * maxDim;

                return (
                  <svg viewBox="0 0 420 300" className="w-full max-w-md h-72">
                    {/* Axes */}
                    <line x1={ox} y1={oy} x2={380} y2={oy} stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
                    <line x1={ox} y1={oy} x2={ox} y2={30} stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
                    <text x={375} y={oy + 18} fill="#94a3b8" fontSize="10" textAnchor="end">
                      Dimension 1: "{t1}"
                    </text>
                    <text x={ox - 8} y={35} fill="#94a3b8" fontSize="10" textAnchor="end">
                      Dimension 2: "{t2}"
                    </text>

                    {/* Document Vectors */}
                    {corpus.map((_, idx) => {
                      const dX = ox + ((results.tfidfMatrix[idx][t1] || 0) / maxVal) * maxDim;
                      const dY = oy - ((results.tfidfMatrix[idx][t2] || 0) / maxVal) * maxDim;
                      const score = results.scores[idx] || 0;
                      const isTop = results.ranking[0] === idx;

                      return (
                        <g key={idx}>
                          <line
                            x1={ox}
                            y1={oy}
                            x2={dX}
                            y2={dY}
                            stroke={isTop ? '#10b981' : '#64748b'}
                            strokeWidth={isTop ? 2.5 : 1.5}
                            strokeDasharray={score > 0 ? '' : '2 2'}
                          />
                          <circle
                            cx={dX}
                            cy={dY}
                            r={isTop ? 6 : 4}
                            fill={isTop ? '#10b981' : '#94a3b8'}
                          />
                          <text
                            x={dX + 6}
                            y={dY - 4}
                            fill={isTop ? '#34d399' : '#cbd5e1'}
                            fontSize="10"
                            fontWeight={isTop ? 'bold' : 'normal'}
                          >
                            D{idx + 1} ({score.toFixed(2)})
                          </text>
                        </g>
                      );
                    })}

                    {/* Query Vector q */}
                    <line x1={ox} y1={oy} x2={qX} y2={qY} stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                    <circle cx={qX} cy={qY} r={6} fill="#38bdf8" />
                    <text x={qX + 8} y={qY - 4} fill="#38bdf8" fontSize="12" fontWeight="bold">
                      q (Query)
                    </text>
                  </svg>
                );
              })()}
              <div className="text-xs text-slate-400 mt-2 text-center max-w-sm">
                Document vectors aligned closely with the blue Query Vector q produce smaller angles θ and higher Cosine Similarity scores.
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Step-by-Step Pipeline Stepper */}
        {labTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Information Retrieval Pipeline Execution</h4>
                <p className="text-xs text-slate-500">
                  Step through each internal phase to see how text transforms from raw input to final ranked results.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={pipelineStep === 1}
                  onClick={() => setPipelineStep(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold disabled:opacity-40 hover:bg-slate-100"
                >
                  Previous
                </button>
                <span className="text-xs font-bold font-mono text-blue-600 px-2">
                  Step {pipelineStep} of 6
                </span>
                <button
                  disabled={pipelineStep === 6}
                  onClick={() => setPipelineStep(p => Math.min(6, p + 1))}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold disabled:opacity-40 hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Stage Indicator Bar */}
            <div className="grid grid-cols-6 gap-1">
              {PIPELINE_STAGES.map(s => (
                <div
                  key={s.step}
                  onClick={() => setPipelineStep(s.step)}
                  className={`h-2 rounded-full cursor-pointer transition-all ${
                    s.step === pipelineStep
                      ? 'bg-blue-600 ring-2 ring-blue-300'
                      : s.step < pipelineStep
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`}
                  title={s.name}
                />
              ))}
            </div>

            {/* Stepper Content */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  {pipelineStep}
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {PIPELINE_STAGES[pipelineStep - 1]?.name}
                </h3>
              </div>
              <p className="text-sm text-slate-600">
                {PIPELINE_STAGES[pipelineStep - 1]?.desc}
              </p>

              {/* Dynamic Step Details */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs font-mono space-y-2">
                {pipelineStep === 1 && (
                  <div>
                    <span className="text-slate-400 block mb-1 font-sans font-semibold">Active Corpus Documents:</span>
                    {corpus.map((d, i) => (
                      <div key={i} className="text-slate-700 py-0.5 truncate">
                        <strong>D{i + 1}:</strong> {d}
                      </div>
                    ))}
                  </div>
                )}
                {pipelineStep === 2 && (
                  <div>
                    <span className="text-slate-400 block mb-1 font-sans font-semibold">Vocabulary V ({results.vocab.length} unique terms extracted):</span>
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {results.vocab.map(t => (
                        <span key={t} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {pipelineStep === 3 && (
                  <div>
                    <span className="text-slate-400 block mb-1 font-sans font-semibold">Sample Inverse Document Frequencies (IDF):</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {results.vocab.slice(0, 8).map(t => (
                        <div key={t} className="bg-indigo-50 p-2 rounded border border-indigo-100">
                          <span className="font-bold text-indigo-900 block">{t}</span>
                          <span className="text-indigo-600">df={results.df[t]}, idf={results.idf[t].toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pipelineStep === 4 && (
                  <div>
                    <span className="text-slate-400 block mb-1 font-sans font-semibold">Synthesized Query Vector Weights (q):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {results.queryTokens.map(t => (
                        <span key={t} className="bg-blue-100 text-blue-900 px-2 py-1 rounded font-bold">
                          {t}: {results.queryTfidf[t].toFixed(3)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {pipelineStep === 5 && (
                  <div>
                    <span className="text-slate-400 block mb-1 font-sans font-semibold">Computed Cosine Scores:</span>
                    <div className="space-y-1">
                      {results.ranking.map(idx => (
                        <div key={idx} className="flex justify-between text-slate-800 py-0.5 border-b border-slate-100">
                          <span>Doc D{idx + 1}</span>
                          <span className="font-bold text-blue-600">{results.scores[idx].toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pipelineStep === 6 && (
                  <div>
                    <span className="text-slate-400 block mb-1 font-sans font-semibold">Final Retrieval Benchmark Metrics:</span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-blue-50 p-2 rounded">Precision@k: {results.metrics.precisionAtK.toFixed(3)}</div>
                      <div className="bg-indigo-50 p-2 rounded">Recall@k: {results.metrics.recallAtK.toFixed(3)}</div>
                      <div className="bg-emerald-50 p-2 rounded">nDCG@k: {results.metrics.ndcgAtK.toFixed(3)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trial History Logger */}
      {trials && trials.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recorded Laboratory Trials ({trials.length})</h3>
              <p className="text-xs text-slate-500">
                Trials logged during this session will be integrated into your official lab report.
              </p>
            </div>
            <button
              onClick={() => {
                const headers = 'ID,Timestamp,Scenario,Query,TF Scheme,IDF Scheme,Top Doc,Score,P@k,nDCG@k\n';
                const rows = trials.map(t =>
                  `"${t.id}","${t.timestamp}","${t.scenario}","${t.query}","${t.tfScheme}","${t.idfScheme}","${t.topDoc.replace(/"/g, '""')}","${t.topScore}","${t.precisionAtK}","${t.ndcgAtK}"`
                ).join('\n');
                const blob = new Blob([headers + rows], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tfidf_retrieval_trials.csv';
                a.click();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Scenario</th>
                  <th className="p-2.5">Query</th>
                  <th className="p-2.5">TF / IDF Scheme</th>
                  <th className="p-2.5">Top-1 Result</th>
                  <th className="p-2.5 text-right">Score</th>
                  <th className="p-2.5 text-right">P@k</th>
                  <th className="p-2.5 text-right">nDCG@k</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trials.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 font-mono text-[11px]">
                    <td className="p-2.5 text-slate-500 whitespace-nowrap">{t.timestamp}</td>
                    <td className="p-2.5 font-sans font-medium text-slate-900">{t.scenario}</td>
                    <td className="p-2.5 text-blue-700 truncate max-w-[140px] font-sans">"{t.query}"</td>
                    <td className="p-2.5 text-slate-600 font-sans">{t.tfScheme} / {t.idfScheme}</td>
                    <td className="p-2.5 text-slate-700 truncate max-w-[160px] font-sans">{t.topDoc}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{t.topScore}</td>
                    <td className="p-2.5 text-right text-emerald-600 font-bold">{t.precisionAtK}</td>
                    <td className="p-2.5 text-right text-indigo-600 font-bold">{t.ndcgAtK}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
