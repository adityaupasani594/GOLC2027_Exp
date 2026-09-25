import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Play, RotateCcw, CheckCircle2, Sliders,
  FileText, Database, Layers, GitMerge, Search,
  Download, Trash2, ArrowRight, Eye, Sparkles, ChevronDown,
  ChevronUp, BarChart2, Info, Plus, Check, Filter, X,
  Terminal, ShieldCheck, Activity, Clock, UploadCloud, Split
} from 'lucide-react';
import { processTextPipeline } from '../preprocessingEngine';
import TextPipelineFlowAnimation from './animations/TextPipelineFlowAnimation';
import StemVsLemmaDuelAnimation from './animations/StemVsLemmaDuelAnimation';

const PRESET_DATASETS = {
  'Sample 1 (General)': 'The quick brown foxes were jumping over 100 lazy dogs while studying NLP algorithms!',
  'Sample 2 (Technical)': 'Text preprocessing cleans, standardizes, and normalizes raw textual datasets efficiently prior to vectorization.',
  'Sample 3 (Irregular Forms)': 'The mice were running better than the cats, having studied various computational experiments.'
};

export default function LabSection({ onRecordTrial, trials = [], onGoToQuiz }) {
  // Input Selection
  const [selectedSample, setSelectedSample] = useState('Sample 1 (General)');
  const [rawText, setRawText] = useState(PRESET_DATASETS['Sample 1 (General)']);
  const [customText, setCustomText] = useState('Preprocessing raw text data is essential for building accurate machine learning models.');

  // Pipeline Configuration Flags
  const [optLower, setOptLower] = useState(true);
  const [optPunct, setOptPunct] = useState(true);
  const [optStop, setOptStop] = useState(true);
  const [optPos, setOptPos] = useState(true);

  // Active View Tab for Sandbox
  const [activeSandboxTab, setActiveSandboxTab] = useState('workbench'); // 'workbench' | 'animations' | 'comparison' | 'logbook'
  const [tableSearch, setTableSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Handle Preset Change
  const handleSampleChange = (sampleKey) => {
    setSelectedSample(sampleKey);
    if (sampleKey === 'Custom Entry') {
      setRawText(customText);
    } else {
      setRawText(PRESET_DATASETS[sampleKey]);
    }
  };

  // Pipeline Execution (Fast Pure Client-Side Computation)
  const pipelineResult = useMemo(() => {
    return processTextPipeline(rawText, {
      lowercase: optLower,
      removePunctNoise: optPunct,
      removeStopwords: optStop,
      posLemmatization: optPos
    });
  }, [rawText, optLower, optPunct, optStop, optPos]);

  // Log Trial
  const handleLogTrial = () => {
    const trialRecord = {
      trialId: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      sampleChoice: selectedSample,
      sampleInput: rawText.length > 30 ? rawText.slice(0, 30) + '...' : rawText,
      rawTokens: pipelineResult.metrics.origTokenCount,
      filteredTokens: pipelineResult.metrics.filteredTokenCount,
      removedTokens: pipelineResult.metrics.tokensRemoved,
      reductionPct: pipelineResult.metrics.reductionPct,
      stopwordsRemoved: optStop ? 'Yes' : 'No',
      posLemmatized: optPos ? 'Yes' : 'No',
      finalOutput: pipelineResult.finalCorpusString
    };

    if (onRecordTrial) {
      onRecordTrial(trialRecord);
    }
    setToastMessage(`Trial #${trials.length + 1} recorded successfully!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Download CSV
  const handleExportCSV = () => {
    if (!trials.length) return;
    const headers = ['Trial #', 'Timestamp', 'Sample', 'Raw Tokens', 'Filtered Tokens', 'Removed Tokens', 'Reduction %', 'Stopwords Removed', 'POS Lemmatized'];
    const rows = trials.map((t, idx) => [
      idx + 1,
      `"${t.timestamp}"`,
      `"${t.sampleChoice}"`,
      t.rawTokens,
      t.filteredTokens,
      t.removedTokens,
      `"${t.reductionPct}%"`,
      `"${t.stopwordsRemoved}"`,
      `"${t.posLemmatized}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Exp2_NLP_Preprocessing_Trials_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Comparison Table
  const filteredTable = useMemo(() => {
    if (!pipelineResult?.tokenComparisonTable) return [];
    if (!tableSearch.trim()) return pipelineResult.tokenComparisonTable;
    const q = tableSearch.toLowerCase().trim();
    return pipelineResult.tokenComparisonTable.filter(
      item => item.token.toLowerCase().includes(q) || item.stem.toLowerCase().includes(q) || item.lemma.toLowerCase().includes(q)
    );
  }, [pipelineResult, tableSearch]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* ── Workbench Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold tracking-wide uppercase">
            <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
            Interactive Simulation Workbench
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Text Preprocessing &amp; Normalization Laboratory
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Configure raw text datasets, toggle transformation controls, and trace the multi-stage conversion into cleaned, filtered, and lemmatized token distributions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleLogTrial}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 cursor-pointer transition active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            Record Current Trial
          </button>
          {onGoToQuiz && (
            <button
              onClick={onGoToQuiz}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs sm:text-sm border border-indigo-200/70 cursor-pointer transition"
            >
              Quiz <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Sleek Segmented Navigation Bar ── */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/60 shadow-inner overflow-x-auto">
        {[
          { id: 'workbench', label: '1. Pipeline Workbench', icon: Sliders, count: `${pipelineResult.metrics.filteredTokenCount} Tokens` },
          { id: 'animations', label: '2. Process Animations', icon: Sparkles, count: 'Flow & Duel' },
          { id: 'comparison', label: '3. Stem vs Lemma Matrix', icon: Split, count: `${pipelineResult.tokenComparisonTable.length} Pairs` },
          { id: 'logbook', label: '4. Experimental Trials Log', icon: Clock, count: `${trials.length} Recorded` }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSandboxTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSandboxTab(tab.id)}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                isActive ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60' : 'bg-slate-300/60 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Active Tab Panes ── */}
      <AnimatePresence mode="wait">

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 1: PIPELINE WORKBENCH
            ═══════════════════════════════════════════════════════════════════ */}
        {activeSandboxTab === 'workbench' && (
          <motion.div
            key="workbench-pane"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Top configuration grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* 1. Input Corpus Card */}
              <div className="glass rounded-2xl sm:rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    1. Input Corpus Selection
                  </h3>
                  <select
                    value={selectedSample}
                    onChange={e => handleSampleChange(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                  >
                    <option>Sample 1 (General)</option>
                    <option>Sample 2 (Technical)</option>
                    <option>Sample 3 (Irregular Forms)</option>
                    <option>Custom Entry</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={e => {
                      setRawText(e.target.value);
                      if (selectedSample === 'Custom Entry') setCustomText(e.target.value);
                    }}
                    placeholder="Enter or paste unstructured textual dataset..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-sans leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Characters: {rawText.length} &bull; Words: {rawText.trim().split(/\s+/).filter(Boolean).length}</span>
                    <button
                      onClick={() => handleSampleChange(selectedSample)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      Reset to Sample
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Pipeline Controls Card */}
              <div className="glass rounded-2xl sm:rounded-3xl p-6 border border-white/80 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-violet-600" />
                    2. Pipeline Transformation Controls
                  </h3>
                  <p className="text-xs text-slate-500">
                    Toggle individual stages to inspect their real-time impact on vocabulary size and token reduction.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
                      <div className="flex flex-col">
                        <span>Lowercase Text</span>
                        <span className="text-[10px] text-slate-400 font-normal">Case folding</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={optLower}
                        onChange={e => setOptLower(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
                      <div className="flex flex-col">
                        <span>Remove Noise &amp; Digits</span>
                        <span className="text-[10px] text-slate-400 font-normal">Regex [^a-zA-Z\s]</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={optPunct}
                        onChange={e => setOptPunct(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
                      <div className="flex flex-col">
                        <span>Remove Stop-Words</span>
                        <span className="text-[10px] text-slate-400 font-normal">NLTK 179 Words</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={optStop}
                        onChange={e => setOptStop(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
                      <div className="flex flex-col">
                        <span>POS Lemmatization</span>
                        <span className="text-[10px] text-slate-400 font-normal">WordNet Contextual</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={optPos}
                        onChange={e => setOptPos(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between font-mono">
                  <span>Reduction Ratio:</span>
                  <span className="font-extrabold text-indigo-700">{pipelineResult.metrics.reductionPct}% removed</span>
                </div>
              </div>
            </div>

            {/* 4 Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-100/80 shadow-2xs space-y-1.5">
                <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Original Characters</span>
                <p className="text-2xl font-black text-indigo-950 font-mono tracking-tight">{pipelineResult.metrics.origCharCount}</p>
                <p className="text-[11px] text-slate-500">Raw string length</p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-white border border-blue-100/80 shadow-2xs space-y-1.5">
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Raw Token Count</span>
                <p className="text-2xl font-black text-blue-950 font-mono tracking-tight">{pipelineResult.metrics.origTokenCount}</p>
                <p className="text-[11px] text-slate-500">Whitespace-delimited words</p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100/80 shadow-2xs space-y-1.5">
                <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Filtered Tokens</span>
                <p className="text-2xl font-black text-emerald-950 font-mono tracking-tight">{pipelineResult.metrics.filteredTokenCount}</p>
                <p className="text-[11px] text-slate-500">Standardized token output</p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/80 to-white border border-rose-100/80 shadow-2xs space-y-1.5">
                <span className="text-xs text-rose-600 font-bold uppercase tracking-wider">Tokens Removed</span>
                <p className="text-2xl font-black text-rose-950 font-mono tracking-tight">{pipelineResult.metrics.tokensRemoved}</p>
                <p className="text-[11px] text-slate-500">Noise &amp; stop-words pruned</p>
              </div>
            </div>

            {/* Graphical Reduction Bar Chart */}
            <div className="p-6 rounded-2xl sm:rounded-3xl glass border border-white/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  Corpus Volume Reduction &amp; Token Breakdown
                </h3>
                <span className="text-slate-400 font-mono">
                  {pipelineResult.metrics.tokensRemoved} of {pipelineResult.metrics.origTokenCount} tokens stripped ({pipelineResult.metrics.reductionPct}%)
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { label: 'Raw Tokens', count: pipelineResult.metrics.origTokenCount, color: 'bg-indigo-600', text: 'text-indigo-700' },
                  { label: 'Filtered Tokens', count: pipelineResult.metrics.filteredTokenCount, color: 'bg-emerald-600', text: 'text-emerald-700' },
                  { label: 'Tokens Removed', count: pipelineResult.metrics.tokensRemoved, color: 'bg-rose-500', text: 'text-rose-700' }
                ].map(item => {
                  const maxCount = Math.max(pipelineResult.metrics.origTokenCount, 1);
                  const pct = Math.max(6, Math.round((item.count / maxCount) * 100));

                  return (
                    <div key={item.label} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-slate-800">{item.label}</span>
                        <span className={`font-extrabold ${item.text}`}>{item.count}</span>
                      </div>
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.4 }}
                          className={`h-full ${item.color} rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sequential Transformations View */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl sm:rounded-3xl glass border border-white/80 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Sequential Transformations
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">1. Original Text</span>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-sans leading-relaxed">
                      &ldquo;{rawText}&rdquo;
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">2. Cleaned / Noise-Stripped Text</span>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono text-[11px] leading-relaxed">
                      {pipelineResult.cleanedText}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">3. Filtered Token List ({pipelineResult.finalTokens.length})</span>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {pipelineResult.finalTokens.map((tok, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-xs font-semibold">
                          {tok}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Processed Corpus (Lemmatized Output) */}
              <div className="p-6 rounded-2xl sm:rounded-3xl glass border border-white/80 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Final Processed Corpus (Lemmatized Tokens)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Standardized, noise-free token sequence ready for search engine inverted index construction or TF-IDF matrix vectorization.
                  </p>

                  <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed space-y-2 border border-slate-800 shadow-inner">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Terminal Output:</span>
                    <div className="text-emerald-400 font-bold">
                      {pipelineResult.finalCorpusString || '[Empty Token Stream]'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveSandboxTab('comparison')}
                  className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/80 transition cursor-pointer mt-2"
                >
                  <span>Inspect Stemming vs. Lemmatization Matrix &rarr;</span>
                  <Split className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 2: PROCESS ANIMATIONS
            ═══════════════════════════════════════════════════════════════════ */}
        {activeSandboxTab === 'animations' && (
          <motion.div
            key="animations-pane"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Dynamic Flow Animation */}
            <TextPipelineFlowAnimation rawText={rawText} />

            {/* Stem vs Lemma Duel Animation */}
            <StemVsLemmaDuelAnimation />
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 3: STEM VS LEMMA COMPARISON MATRIX
            ═══════════════════════════════════════════════════════════════════ */}
        {activeSandboxTab === 'comparison' && (
          <motion.div
            key="comparison-pane"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl sm:rounded-3xl glass border border-white/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Split className="w-5 h-5 text-indigo-600" />
                    Stemming vs. Lemmatization Output Matrix
                  </h3>
                  <p className="text-xs text-slate-500">
                    Compare the rule-based Porter stemmer against the lexical WordNet lemmatizer for each extracted token in the active text.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={e => setTableSearch(e.target.value)}
                    placeholder="Search token or lemma..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  {tableSearch && (
                    <button onClick={() => setTableSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">#</th>
                      <th className="p-3.5">Cleaned Token</th>
                      <th className="p-3.5 text-amber-700">Porter Stemmer</th>
                      <th className="p-3.5 text-emerald-700">WordNet Lemmatizer</th>
                      <th className="p-3.5">POS Tag</th>
                      <th className="p-3.5">Morphological Shift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTable.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 text-slate-400">{row.id}</td>
                        <td className="p-3.5 font-bold text-slate-900">{row.token}</td>
                        <td className="p-3.5 text-amber-700 font-bold">{row.stem}</td>
                        <td className="p-3.5 text-emerald-700 font-bold">{row.lemma}</td>
                        <td className="p-3.5 text-slate-500 font-sans uppercase text-[10px]">{row.posTag}</td>
                        <td className="p-3.5">
                          {row.isDifferent ? (
                            <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-sans font-semibold text-[10px]">
                              Stem &ne; Lemma
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-sans text-[10px]">
                              Identical
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredTable.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 font-sans">
                          No matching tokens found in the active corpus.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 4: EXPERIMENTAL DATA LOG BOOK
            ═══════════════════════════════════════════════════════════════════ */}
        {activeSandboxTab === 'logbook' && (
          <motion.div
            key="logbook-pane"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl sm:rounded-3xl glass border border-white/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Session Experimental Trials Log ({trials.length} Recorded)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recorded trials automatically sync with your verified lab report and completion certificate.
                  </p>
                </div>

                {trials.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Trials CSV
                  </button>
                )}
              </div>

              {trials.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">#</th>
                        <th className="p-3.5">Time</th>
                        <th className="p-3.5">Sample Input</th>
                        <th className="p-3.5">Raw Tokens</th>
                        <th className="p-3.5">Filtered Tokens</th>
                        <th className="p-3.5">Removed</th>
                        <th className="p-3.5">Stopwords Removed</th>
                        <th className="p-3.5">POS Lemmatized</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {trials.map((t, idx) => (
                        <tr key={t.trialId || idx} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5 text-slate-400">{idx + 1}</td>
                          <td className="p-3.5 text-slate-500">{t.timestamp}</td>
                          <td className="p-3.5 text-slate-800 font-sans max-w-[200px] truncate">{t.sampleInput}</td>
                          <td className="p-3.5 text-slate-700">{t.rawTokens}</td>
                          <td className="p-3.5 font-bold text-emerald-700">{t.filteredTokens}</td>
                          <td className="p-3.5 font-bold text-rose-600">{t.removedTokens} ({t.reductionPct}%)</td>
                          <td className="p-3.5 text-slate-600 font-sans">{t.stopwordsRemoved}</td>
                          <td className="p-3.5 text-slate-600 font-sans">{t.posLemmatized}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-700">No trials recorded in this session yet.</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Configure your pipeline options in the Workbench and click <strong className="text-slate-600">&ldquo;Record Current Trial&rdquo;</strong> to save experimental data.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
