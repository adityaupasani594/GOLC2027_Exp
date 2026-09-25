import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Play, RotateCcw, CheckCircle2, Sliders,
  FileText, Database, Layers, GitMerge, Search,
  Download, Trash2, ArrowRight, Eye, Sparkles, ChevronDown,
  ChevronUp, BarChart2, Info, Plus, Check, Filter, X,
  Terminal, ShieldCheck, Cpu, Activity, Clock
} from 'lucide-react';
import {
  buildInvertedIndex, executeKeywordQuery, booleanAndWithTrace,
  booleanOrWithTrace, executePhraseQuery, executeProximityQuery,
  purePorterStem, DEFAULT_STOPWORDS
} from '../invertedIndexEngine';
import IndexConstructionAnimation from './animations/IndexConstructionAnimation';
import TwoPointerMergeAnimation from './animations/TwoPointerMergeAnimation';

const BENCHMARK_CORPORA = {
  'Corpus 1: Information Retrieval & Search Engines': {
    1: 'Information retrieval systems index documents for fast keyword search and query processing.',
    2: 'Search engines construct an inverted index with dictionary terms and sorted postings lists.',
    3: 'Boolean retrieval evaluates AND, OR, and NOT queries using posting list intersection algorithms.',
    4: 'Positional postings store word positions within documents to enable exact phrase queries and proximity search.',
    5: 'Modern search engines combine inverted index lexical matching with dense embedding retrieval.'
  },
  'Corpus 2: Knowledge Graphs & Graph Databases (KGIRS)': {
    1: 'A knowledge graph organizes entities and relationships into an interconnected semantic network.',
    2: 'Graph databases like Neo4j store nodes and edges for efficient graph traversal and query execution.',
    3: 'Cypher queries retrieve multi-hop relationships and pattern matches across knowledge graphs.',
    4: 'Information extraction pipelines identify named entities and semantic relations from unstructured text.',
    5: 'Hybrid systems integrate knowledge graphs with information retrieval for contextual search and question answering.'
  },
  'Corpus 3: Natural Language Processing & Text Engineering': {
    1: 'Text preprocessing involves tokenization, case folding, stopword removal, and word stemming.',
    2: 'Stemming algorithms like the Porter stemmer reduce morphological variants of words to a common base.',
    3: 'Term frequency and document frequency determine keyword importance according to Zipf\'s law.',
    4: 'Linguistic normalization reduces vocabulary size and improves information retrieval recall.',
    5: 'Token position indices allow search engines to distinguish between adjacent phrases and scattered words.'
  }
};

export default function LabSection({ onRecordTrial, trials = [], onGoToQuiz }) {
  // Workbench Active View
  const [activeTab, setActiveTab] = useState('corpus'); // 'corpus' | 'pipeline' | 'postings' | 'query' | 'analytics'

  // Corpus State
  const [selectedCorpusName, setSelectedCorpusName] = useState(Object.keys(BENCHMARK_CORPORA)[0]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customDocs, setCustomDocs] = useState({
    1: 'Information retrieval systems index documents for fast searching.',
    2: 'A knowledge graph organizes entities and relations into a connected graph.',
    3: 'Search engines construct an inverted index for efficient information retrieval.',
    4: 'Graph databases query relationships using Cypher in Neo4j systems.',
    5: 'Fast keyword retrieval relies on an inverted index and postings lists.'
  });

  // Linguistic Preprocessing Controls
  const [optLower, setOptLower] = useState(true);
  const [optPunct, setOptPunct] = useState(true);
  const [optStop, setOptStop] = useState(true);
  const [optStem, setOptStem] = useState(true);

  // Pipeline Inspector Stage
  const [pipelineStage, setPipelineStage] = useState(1); // 1, 2, 3, 4
  const [stageDocFilter, setStageDocFilter] = useState('all');

  // Postings Explorer Filter & Inspector
  const [vocabSearch, setVocabSearch] = useState('');
  const [inspectedTerm, setInspectedTerm] = useState(null);

  // Query Execution State
  const [queryInput, setQueryInput] = useState('information AND retrieval');
  const [queryMode, setQueryMode] = useState('AND'); // 'AND' | 'OR' | 'NOT' | 'PHRASE' | 'PROXIMITY' | 'KEYWORD'
  const [proximityK, setProximityK] = useState(3);
  const [toastMessage, setToastMessage] = useState('');

  // Resolve Active Corpus
  const activeCorpus = useMemo(() => {
    if (isCustomMode) {
      const filtered = {};
      Object.entries(customDocs).forEach(([k, v]) => {
        if (v && v.trim()) filtered[Number(k)] = v.trim();
      });
      return Object.keys(filtered).length > 0 ? filtered : { 1: 'Empty document' };
    }
    return BENCHMARK_CORPORA[selectedCorpusName] || BENCHMARK_CORPORA[Object.keys(BENCHMARK_CORPORA)[0]];
  }, [isCustomMode, customDocs, selectedCorpusName]);

  // Build Inverted Index (Fast Pure Client-Side Computation)
  const indexData = useMemo(() => {
    return buildInvertedIndex(activeCorpus, {
      lowercase: optLower,
      removePunct: optPunct,
      removeStopwords: optStop,
      useStemming: optStem
    });
  }, [activeCorpus, optLower, optPunct, optStop, optStem]);

  // Execute Current Query
  const queryResult = useMemo(() => {
    const raw = queryInput.trim();
    if (!raw || !indexData) {
      return {
        matchedDocIds: [],
        trace: ['Please enter a search query.'],
        comparisons: 0,
        latencyUs: 0,
        list1: [],
        list2: [],
        term1: '',
        term2: ''
      };
    }

    const t0 = performance.now();
    const idx = indexData.index;

    try {
      if (queryMode === 'AND') {
        const parts = raw.split(/\s+AND\s+/i);
        const t1 = parts[0]?.trim() || '';
        const t2 = parts[1]?.trim() || '';
        const stem1 = optStem ? purePorterStem(t1.toLowerCase()) : t1.toLowerCase();
        const stem2 = optStem ? purePorterStem(t2.toLowerCase()) : t2.toLowerCase();
        const l1 = idx[stem1] ? Object.keys(idx[stem1].postings).map(Number).sort((a, b) => a - b) : [];
        const l2 = idx[stem2] ? Object.keys(idx[stem2].postings).map(Number).sort((a, b) => a - b) : [];
        const res = booleanAndWithTrace(l1, l2, stem1, stem2);
        return {
          matchedDocIds: res.result,
          trace: res.trace,
          comparisons: res.comparisons,
          latencyUs: Math.round((performance.now() - t0) * 1000),
          list1: l1,
          list2: l2,
          term1: stem1,
          term2: stem2
        };
      } else if (queryMode === 'OR') {
        const parts = raw.split(/\s+OR\s+/i);
        const t1 = parts[0]?.trim() || '';
        const t2 = parts[1]?.trim() || '';
        const stem1 = optStem ? purePorterStem(t1.toLowerCase()) : t1.toLowerCase();
        const stem2 = optStem ? purePorterStem(t2.toLowerCase()) : t2.toLowerCase();
        const l1 = idx[stem1] ? Object.keys(idx[stem1].postings).map(Number).sort((a, b) => a - b) : [];
        const l2 = idx[stem2] ? Object.keys(idx[stem2].postings).map(Number).sort((a, b) => a - b) : [];
        const res = booleanOrWithTrace(l1, l2, stem1, stem2);
        return {
          matchedDocIds: res.result,
          trace: res.trace,
          comparisons: res.comparisons,
          latencyUs: Math.round((performance.now() - t0) * 1000),
          list1: l1,
          list2: l2,
          term1: stem1,
          term2: stem2
        };
      } else if (queryMode === 'NOT') {
        const parts = raw.split(/\s+NOT\s+/i);
        const t1 = parts[0]?.trim() || '';
        const t2 = parts[1]?.trim() || '';
        const stem1 = optStem ? purePorterStem(t1.toLowerCase()) : t1.toLowerCase();
        const stem2 = optStem ? purePorterStem(t2.toLowerCase()) : t2.toLowerCase();
        const l1 = idx[stem1] ? Object.keys(idx[stem1].postings).map(Number).sort((a, b) => a - b) : [];
        const l2 = idx[stem2] ? Object.keys(idx[stem2].postings).map(Number).sort((a, b) => a - b) : [];
        const s2 = new Set(l2);
        const matched = l1.filter(d => !s2.has(d));
        return {
          matchedDocIds: matched,
          trace: [
            `Negation Query: '${stem1}' (L1: [${l1.join(', ')}]) AND NOT '${stem2}' (L2: [${l2.join(', ')}])`,
            `Filtered out documents present in L2.`,
            `Resulting matched DocIDs: [${matched.join(', ')}]`
          ],
          comparisons: l1.length,
          latencyUs: Math.round((performance.now() - t0) * 1000),
          list1: l1,
          list2: l2,
          term1: stem1,
          term2: stem2
        };
      } else if (queryMode === 'PHRASE') {
        const cleanPhrase = raw.replace(/^["']|["']$/g, '');
        const res = executePhraseQuery(cleanPhrase, idx, optStem);
        return {
          matchedDocIds: res.docs,
          trace: res.trace,
          comparisons: res.docs.length * 2,
          latencyUs: res.latencyUs,
          list1: [],
          list2: [],
          term1: cleanPhrase,
          term2: ''
        };
      } else if (queryMode === 'PROXIMITY') {
        const match = raw.match(/(\w+)\s+(?:NEAR\/?(\d+)?|\/(\d+))\s+(\w+)/i);
        let t1 = raw.split(/\s+/)[0] || '';
        let t2 = raw.split(/\s+/)[1] || '';
        let kVal = proximityK;
        if (match) {
          t1 = match[1];
          kVal = parseInt(match[2] || match[3] || proximityK, 10);
          t2 = match[4];
        }
        const res = executeProximityQuery(t1, t2, kVal, idx, optStem);
        return {
          matchedDocIds: res.docs,
          trace: res.trace,
          comparisons: res.docs.length * 3,
          latencyUs: res.latencyUs,
          list1: [],
          list2: [],
          term1: t1,
          term2: t2
        };
      } else {
        // Single keyword
        const res = executeKeywordQuery(raw, idx, optStem);
        return {
          matchedDocIds: res.docs,
          trace: res.trace,
          comparisons: 1,
          latencyUs: res.latencyUs,
          list1: res.docs,
          list2: [],
          term1: res.term,
          term2: ''
        };
      }
    } catch {
      return {
        matchedDocIds: [],
        trace: ['Error parsing query syntax. Try standard syntax like: term1 AND term2'],
        comparisons: 0,
        latencyUs: 0,
        list1: [],
        list2: [],
        term1: '',
        term2: ''
      };
    }
  }, [queryInput, queryMode, proximityK, indexData, optStem]);

  // Log current trial
  const handleRecordTrial = () => {
    const trialRecord = {
      trialId: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      corpusName: isCustomMode ? 'Custom Document Collection' : selectedCorpusName.split(':')[0],
      query: queryInput,
      mode: queryMode,
      vocabSize: indexData.vocabSize,
      totalTokens: indexData.totalTokens,
      totalPostings: indexData.totalPostings,
      sparsityPct: indexData.sparsityPct,
      matchedDocsCount: queryResult.matchedDocIds.length,
      matchedDocIds: queryResult.matchedDocIds,
      latencyUs: queryResult.latencyUs,
      comparisons: queryResult.comparisons,
      preprocessing: {
        lower: optLower,
        punct: optPunct,
        stopwords: optStop,
        stem: optStem
      }
    };

    if (onRecordTrial) {
      onRecordTrial(trialRecord);
    }
    setToastMessage(`Trial recorded successfully! (${trials.length + 1} total)`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Export trials to CSV
  const handleExportCSV = () => {
    if (!trials.length) return;
    const headers = ['Trial ID', 'Timestamp', 'Corpus', 'Query', 'Mode', 'Vocab Size', 'Total Postings', 'Matched Docs', 'Latency (us)', 'Comparisons'];
    const rows = trials.map(t => [
      t.trialId,
      `"${t.timestamp}"`,
      `"${t.corpusName}"`,
      `"${t.query}"`,
      `"${t.mode}"`,
      t.vocabSize,
      t.totalPostings,
      `"${t.matchedDocIds?.join(';') || ''}"`,
      t.latencyUs,
      t.comparisons
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Exp3_InvertedIndex_Trials_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered vocabulary list
  const filteredVocab = useMemo(() => {
    if (!indexData?.index) return [];
    const entries = Object.entries(indexData.index);
    if (!vocabSearch.trim()) return entries;
    const q = vocabSearch.toLowerCase().trim();
    return entries.filter(([term]) => term.toLowerCase().includes(q));
  }, [indexData, vocabSearch]);

  // Top terms sorted by df for chart
  const topDfTerms = useMemo(() => {
    if (!indexData?.index) return [];
    return Object.entries(indexData.index)
      .map(([term, data]) => ({ term, df: data.df, cf: data.cf }))
      .sort((a, b) => b.cf - a.cf)
      .slice(0, 10);
  }, [indexData]);

  // Highlight words in document snippet
  const highlightSnippet = (text, queryWords) => {
    const words = queryWords
      .toLowerCase()
      .split(/[^a-zA-Z0-9]+/)
      .filter(w => w.length > 1 && !DEFAULT_STOPWORDS.has(w));
    if (!words.length) return text;

    const regex = new RegExp(`\\b(${words.join('|')})\\b`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200/90 text-amber-900 font-semibold px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Workbench Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold tracking-wide uppercase">
            <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
            Inverted Index Simulation Lab
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inverted Index &amp; Query Processing Workbench
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Construct positional inverted indices from document collections, inspect 4-stage internal transformations,
            and execute Boolean, phrase, and proximity queries with linear-time two-pointer merge algorithms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRecordTrial}
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

      {/* ── Sleek Workbench Segmented Navigation Bar ── */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/60 shadow-inner overflow-x-auto">
        {[
          { id: 'corpus', label: '1. Document Corpus', icon: FileText, count: `${Object.keys(activeCorpus).length} Docs` },
          { id: 'pipeline', label: '2. 4-Stage Pipeline', icon: Layers, count: 'Interactive' },
          { id: 'postings', label: '3. Dictionary & Postings', icon: Database, count: `${indexData.vocabSize} Terms` },
          { id: 'query', label: '4. Query & Pointer Duel', icon: GitMerge, count: `${queryResult.matchedDocIds.length} Hits` },
          { id: 'analytics', label: '5. Zipf\'s Law & Analytics', icon: BarChart2, count: `${indexData.sparsityPct}%` }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      {/* ── Tab Content Panes ── */}
      <AnimatePresence mode="wait">

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 1: CORPUS & LINGUISTIC PREPROCESSING
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'corpus' && (
          <motion.div
            key="corpus-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Top controls grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Corpus Selector */}
              <div className="lg:col-span-2 glass rounded-2xl sm:rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    Select Document Collection
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCustomMode(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        !isCustomMode
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Benchmarks
                    </button>
                    <button
                      onClick={() => setIsCustomMode(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isCustomMode
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Custom Editor
                    </button>
                  </div>
                </div>

                {!isCustomMode ? (
                  <div className="grid sm:grid-cols-3 gap-3">
                    {Object.keys(BENCHMARK_CORPORA).map((cName) => (
                      <div
                        key={cName}
                        onClick={() => setSelectedCorpusName(cName)}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${
                          selectedCorpusName === cName
                            ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-200/70 text-indigo-950 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-extrabold">{cName.split(':')[0]}</p>
                          <p className="text-[11px] text-slate-500 font-normal leading-snug line-clamp-2">
                            {cName.split(':')[1]?.trim()}
                          </p>
                        </div>
                        <span className="text-[10px] text-indigo-600 font-mono mt-3 inline-block">
                          5 Documents &bull; Pre-curated
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Author custom documents below. The inverted index will re-index automatically with sub-millisecond latency.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[1, 2, 3, 4, 5].map(id => (
                        <div key={id} className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Doc {id}:</label>
                          <textarea
                            rows={2}
                            value={customDocs[id] || ''}
                            onChange={e => setCustomDocs(prev => ({ ...prev, [id]: e.target.value }))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-sans"
                            placeholder={`Type text for Document ${id}...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Linguistic Normalization Controls */}
              <div className="glass rounded-2xl sm:rounded-3xl p-6 border border-white/80 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-violet-600" />
                    Linguistic Normalization
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Toggle linguistic transformation stages to observe their impact on vocabulary size and retrieval recall.
                  </p>

                  <div className="space-y-2.5 pt-1">
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
                      <div className="flex flex-col">
                        <span>Case Folding</span>
                        <span className="text-[10px] text-slate-400 font-normal">Lowercase all tokens</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={optLower}
                        onChange={e => setOptLower(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
                      <div className="flex flex-col">
                        <span>Punctuation Stripping</span>
                        <span className="text-[10px] text-slate-400 font-normal">Strip commas, periods, quotes</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={optPunct}
                        onChange={e => setOptPunct(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
                      <div className="flex flex-col">
                        <span>Stopword Removal</span>
                        <span className="text-[10px] text-slate-400 font-normal">Filter 128 high-frequency terms</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={optStop}
                        onChange={e => setOptStop(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-100/70 transition">
                      <div className="flex flex-col">
                        <span>Porter Stemming</span>
                        <span className="text-[10px] text-slate-400 font-normal">Reduce suffixes to base root</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={optStem}
                        onChange={e => setOptStem(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-800 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Index Size:</span>
                    <span>{indexData.vocabSize} distinct terms</span>
                  </div>
                  <div className="flex justify-between text-indigo-600">
                    <span>Build Latency:</span>
                    <span>{indexData.indexingTimeMs} ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Collection Cards */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Active Collection Documents ({Object.keys(activeCorpus).length})
                </h3>
                <span className="text-xs text-slate-500">
                  Total Words: {Object.values(activeCorpus).reduce((acc, t) => acc + t.split(/\s+/).length, 0)} &bull; Index Tokens: {indexData.totalTokens}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(activeCorpus).map(([docId, text]) => {
                  const wordsCount = text.split(/\s+/).length;
                  const docTokens = indexData.stage1Tokens[docId] || [];
                  return (
                    <div
                      key={docId}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-indigo-300 transition"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold font-mono">
                          DocID: {docId}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {wordsCount} words &bull; {docTokens.length} tokens
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans line-clamp-3">
                        &ldquo;{text}&rdquo;
                      </p>
                      <div className="pt-2 flex flex-wrap gap-1">
                        {docTokens.slice(0, 5).map((tok, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            {tok.term}
                          </span>
                        ))}
                        {docTokens.length > 5 && (
                          <span className="text-[10px] text-slate-400 font-mono self-center">
                            +{docTokens.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-200 transition cursor-pointer"
                >
                  Inspect 4-Stage Index Pipeline <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 2: 4-STAGE INDEXING PIPELINE
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pipeline' && (
          <motion.div
            key="pipeline-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Interactive Dynamic Animation Visualizer */}
            <IndexConstructionAnimation docText={activeCorpus[1] || Object.values(activeCorpus)[0] || 'Information retrieval systems index documents for fast searching.'} />

            {/* Stepper Selection */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 border border-white/80 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    4-Stage Inverted Index Construction Process
                  </h3>
                  <p className="text-xs text-slate-500">
                    Step through the transformation from raw document text into sorted postings lists.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold">Filter Doc:</span>
                  <select
                    value={stageDocFilter}
                    onChange={e => setStageDocFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Documents</option>
                    {Object.keys(activeCorpus).map(id => (
                      <option key={id} value={id}>Doc {id}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stage tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { stage: 1, name: 'Stage 1: Tokenization', desc: 'Raw text → Tokens & Positions' },
                  { stage: 2, name: 'Stage 2: Triples Stream', desc: '(term, docId, pos) tuples' },
                  { stage: 3, name: 'Stage 3: Lexicographic Sort', desc: 'Ordered by term & docId' },
                  { stage: 4, name: 'Stage 4: Postings Inversion', desc: 'Dictionary + Linked lists' }
                ].map(s => (
                  <button
                    key={s.stage}
                    onClick={() => setPipelineStage(s.stage)}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      pipelineStage === s.stage
                        ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 font-bold ring-2 ring-indigo-200/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-xs font-extrabold">{s.name}</span>
                    <span className="text-[10px] text-slate-500 mt-1">{s.desc}</span>
                  </button>
                ))}
              </div>

              {/* Stage 1: Tokenization view */}
              {pipelineStage === 1 && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                    <strong>Stage 1 Operation:</strong> Documents are tokenized into raw terms, normalized according to active linguistic rules (case folding, punctuation stripping, stopword filtering, and Porter stemming), and assigned 0-indexed token offsets.
                  </div>

                  <div className="space-y-3">
                    {Object.entries(indexData.stage1Tokens)
                      .filter(([dId]) => stageDocFilter === 'all' || stageDocFilter === dId)
                      .map(([dId, tokens]) => (
                        <div key={dId} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                            <span className="font-bold text-slate-800">Doc {dId} Token Stream</span>
                            <span className="text-slate-400 font-mono">{tokens.length} tokens extracted</span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {tokens.map((tok, i) => (
                              <div
                                key={i}
                                className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5 text-xs font-mono"
                              >
                                <span className="font-bold text-indigo-700">{tok.term}</span>
                                <span className="text-[10px] text-slate-400">@pos:{tok.pos}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Stage 2: Triples Stream */}
              {pipelineStage === 2 && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                    <strong>Stage 2 Operation:</strong> Token stream is flattened into an unsorted intermediate sequence of triples: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200">(term, docId, position)</code>.
                  </div>

                  <div className="max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">Normalized Term</th>
                          <th className="p-3">DocID</th>
                          <th className="p-3">Position</th>
                          <th className="p-3">Raw Token</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {indexData.stage2Triples
                          .filter(t => stageDocFilter === 'all' || stageDocFilter === String(t.docId))
                          .map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition">
                              <td className="p-3 text-slate-400">{idx + 1}</td>
                              <td className="p-3 font-bold text-indigo-700">{item.term}</td>
                              <td className="p-3 text-slate-700">Doc {item.docId}</td>
                              <td className="p-3 text-slate-500 font-bold">{item.pos}</td>
                              <td className="p-3 text-slate-400 font-sans">{item.raw}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Stage 3: Lexicographically Sorted */}
              {pipelineStage === 3 && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                    <strong>Stage 3 Operation:</strong> Triples are sorted lexicographically by <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200">term ASC</code>, then by <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200">docId ASC</code>, then by <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200">pos ASC</code> ($O(N \log N)$ complexity).
                  </div>

                  <div className="max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">Sorted Term</th>
                          <th className="p-3">DocID</th>
                          <th className="p-3">Position</th>
                          <th className="p-3">Raw Token</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {indexData.stage3Sorted
                          .filter(t => stageDocFilter === 'all' || stageDocFilter === String(t.docId))
                          .map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition">
                              <td className="p-3 text-slate-400">{idx + 1}</td>
                              <td className="p-3 font-bold text-violet-700">{item.term}</td>
                              <td className="p-3 text-slate-700">Doc {item.docId}</td>
                              <td className="p-3 text-slate-500 font-bold">{item.pos}</td>
                              <td className="p-3 text-slate-400 font-sans">{item.raw}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Stage 4: Inverted Postings Assembly */}
              {pipelineStage === 4 && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                    <strong>Stage 4 Operation:</strong> Sorted triples are grouped by term. For each distinct term, document frequency ($df$) and collection frequency ($cf$) are stored in the Dictionary, while individual occurrences are chained into postings lists.
                  </div>

                  <div className="grid gap-3">
                    {Object.entries(indexData.index)
                      .slice(0, 10)
                      .map(([term, data]) => (
                        <div key={term} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-indigo-700 font-mono text-sm">{term}</span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                                df: {data.df}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                                cf: {data.cf}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 overflow-x-auto py-1">
                            <span className="text-[11px] font-bold text-slate-400">Postings:</span>
                            {Object.entries(data.postings).map(([dId, pData]) => (
                              <div
                                key={dId}
                                className="px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-900 text-xs font-mono flex items-center gap-2 shrink-0"
                              >
                                <span className="font-bold">Doc {dId}</span>
                                <span className="text-[10px] text-violet-600">tf:{pData.tf}</span>
                                <span className="text-[10px] text-slate-500">[{pData.positions.join(',')}]</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 3: DICTIONARY & POSTINGS EXPLORER
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'postings' && (
          <motion.div
            key="postings-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-5">
              {/* Header and Search bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" />
                    Inverted Index Lexicon &amp; Postings Chains
                  </h3>
                  <p className="text-xs text-slate-500">
                    Explore vocabulary terms, document frequencies ($df$), collection frequencies ($cf$), and positional postings lists.
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vocabSearch}
                    onChange={e => setVocabSearch(e.target.value)}
                    placeholder="Filter vocabulary terms..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  {vocabSearch && (
                    <button
                      onClick={() => setVocabSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Vocabulary Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                  <span className="text-[11px] text-indigo-600 font-semibold">Total Vocabulary (V)</span>
                  <p className="text-lg font-extrabold text-indigo-950 font-mono">{indexData.vocabSize}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-1">
                  <span className="text-[11px] text-violet-600 font-semibold">Total Postings Entries</span>
                  <p className="text-lg font-extrabold text-violet-950 font-mono">{indexData.totalPostings}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <span className="text-[11px] text-emerald-600 font-semibold">Indexed Tokens (cf sum)</span>
                  <p className="text-lg font-extrabold text-emerald-950 font-mono">{indexData.totalTokens}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
                  <span className="text-[11px] text-amber-600 font-semibold">Matrix Sparsity</span>
                  <p className="text-lg font-extrabold text-amber-950 font-mono">{indexData.sparsityPct}%</p>
                </div>
              </div>

              {/* Postings Lists Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>Showing {filteredVocab.length} of {indexData.vocabSize} terms</span>
                  <span>Click any term to inspect occurrences in source documents</span>
                </div>

                <div className="max-h-[500px] overflow-y-auto space-y-2.5 pr-1">
                  {filteredVocab.map(([term, data]) => {
                    const isSelected = inspectedTerm === term;
                    return (
                      <div
                        key={term}
                        onClick={() => setInspectedTerm(isSelected ? null : term)}
                        className={`p-4 rounded-2xl border transition cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-200/60 shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-indigo-700 font-mono">{term}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-medium">
                              df: {data.df}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-medium">
                              cf: {data.cf}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Postings:</span>
                            {Object.entries(data.postings).map(([docId, pData], i) => (
                              <React.Fragment key={docId}>
                                {i > 0 && <span className="text-slate-300 font-bold text-xs">&rarr;</span>}
                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs flex items-center gap-1.5">
                                  <strong className="text-indigo-600">Doc {docId}</strong>
                                  <span className="text-[10px] text-slate-500">tf:{pData.tf}</span>
                                  <span className="text-[10px] text-slate-400">pos:[{pData.positions.join(',')}]</span>
                                </span>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        {/* Expandable inspector for clicked term */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-indigo-100 space-y-2 text-xs">
                            <p className="font-bold text-indigo-900">
                              Occurrences in Active Corpus for term &ldquo;{term}&rdquo;:
                            </p>
                            <div className="space-y-1.5">
                              {Object.entries(data.postings).map(([docId, pData]) => (
                                <div key={docId} className="p-2.5 rounded-xl bg-white border border-slate-200">
                                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                                    <strong className="text-indigo-600">Document {docId}</strong>
                                    <span>Token positions: {pData.positions.join(', ')}</span>
                                  </div>
                                  <p className="text-slate-700 font-sans">
                                    &ldquo;{highlightSnippet(activeCorpus[docId] || '', term)}&rdquo;
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 4: QUERY PROCESSOR & TWO-POINTER MERGE DUEL
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'query' && (
          <motion.div
            key="query-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Query Input Panel */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-indigo-600" />
                  Query Execution Engine &amp; Two-Pointer Merge Duel
                </h3>
                <p className="text-xs text-slate-500">
                  Execute Boolean queries (AND, OR, NOT), phrase queries, and proximity searches using linear-time posting intersection ($O(L_1 + L_2)$).
                </p>
              </div>

              {/* Query bar and mode selector */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={queryInput}
                    onChange={e => setQueryInput(e.target.value)}
                    placeholder="Enter query terms (e.g. information AND retrieval)..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono shadow-xs"
                  />
                </div>

                <select
                  value={queryMode}
                  onChange={e => setQueryMode(e.target.value)}
                  className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
                >
                  <option value="AND">Conjunctive Boolean (AND)</option>
                  <option value="OR">Disjunctive Boolean (OR)</option>
                  <option value="NOT">Negation Boolean (AND NOT)</option>
                  <option value="PHRASE">Exact Phrase Query</option>
                  <option value="PROXIMITY">Proximity Query (NEAR / k)</option>
                  <option value="KEYWORD">Single Keyword Lookup</option>
                </select>

                {queryMode === 'PROXIMITY' && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-slate-200">
                    <span className="text-xs font-bold text-slate-500">k:</span>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={proximityK}
                      onChange={e => setProximityK(Number(e.target.value))}
                      className="w-12 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Query Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Presets:</span>
                {[
                  { label: 'information AND retrieval', mode: 'AND' },
                  { label: 'graph OR index', mode: 'OR' },
                  { label: 'retrieval NOT graph', mode: 'NOT' },
                  { label: '"information retrieval"', mode: 'PHRASE' },
                  { label: 'inverted NEAR/3 index', mode: 'PROXIMITY' },
                  { label: 'retrieval', mode: 'KEYWORD' }
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setQueryInput(p.label);
                      setQueryMode(p.mode);
                    }}
                    className="px-3 py-1 rounded-xl text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono border border-indigo-200/70 transition cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Execution Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold">Matched Documents</span>
                  <p className="text-lg font-extrabold text-indigo-700 font-mono">
                    {queryResult.matchedDocIds.length} <span className="text-xs text-slate-400 font-normal">/ {Object.keys(activeCorpus).length}</span>
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold">Pointer Comparisons</span>
                  <p className="text-lg font-extrabold text-slate-800 font-mono">
                    {queryResult.comparisons}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold">Execution Latency</span>
                  <p className="text-lg font-extrabold text-emerald-700 font-mono">
                    {queryResult.latencyUs} &mu;s
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold">Time Complexity</span>
                  <p className="text-lg font-extrabold text-violet-700 font-mono">
                    O(L₁ + L₂)
                  </p>
                </div>
              </div>

              {/* Dynamic Interactive Two-Pointer Merge Animation */}
              {(queryMode === 'AND' || queryMode === 'OR') && (
                <TwoPointerMergeAnimation
                  term1={queryResult.term1 || 'information'}
                  term2={queryResult.term2 || 'retrieval'}
                  list1={queryResult.list1 && queryResult.list1.length > 0 ? queryResult.list1 : [1, 2, 4, 5]}
                  list2={queryResult.list2 && queryResult.list2.length > 0 ? queryResult.list2 : [2, 3, 4]}
                />
              )}

              {/* Pointer Trace Log */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Step-by-Step Traversal Trace Log
                </span>
                <div className="p-4 rounded-2xl bg-slate-900 font-mono text-xs text-slate-300 space-y-1 max-h-44 overflow-y-auto border border-slate-800 shadow-inner">
                  {queryResult.trace.map((line, i) => (
                    <div key={i} className="leading-relaxed font-mono">
                      <span className="text-indigo-400">&gt;</span> {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Documents Lab Cards (Virtual Lab Document Cards, NOT Google SERP) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Retrieved Documents ({queryResult.matchedDocIds.length} Hits)
                  </span>
                  <span className="text-xs text-slate-400">
                    Ranked by exact Boolean intersection
                  </span>
                </div>

                {queryResult.matchedDocIds.length > 0 ? (
                  <div className="space-y-3">
                    {queryResult.matchedDocIds.map(docId => {
                      const text = activeCorpus[docId] || '';
                      return (
                        <div
                          key={docId}
                          className="p-5 rounded-2xl bg-white border border-slate-200 border-l-4 border-l-indigo-600 shadow-2xs space-y-2 hover:border-slate-300 transition"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-indigo-700 font-mono">
                              Document ID: {docId}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                              &check; Matched
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                            &ldquo;{highlightSnippet(text, queryInput)}&rdquo;
                          </p>
                          <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                            <span>Words: {text.split(/\s+/).length}</span>
                            <span>&bull;</span>
                            <span>Corpus: {isCustomMode ? 'Custom' : selectedCorpusName.split(':')[0]}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
                    <p className="text-sm font-bold text-slate-700">No documents matched your query condition.</p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Try broader keywords or disjunctive Boolean OR queries.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 5: INDEX ANALYTICS & ZIPF'S LAW
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-indigo-600" />
                  Index Analytics &amp; Zipf&apos;s Law Verification
                </h3>
                <p className="text-xs text-slate-500">
                  Verify the empirical power-law distribution of term frequencies across the document collection: f(r) &prop; C / r &rarr; f &times; r &approx; Constant.
                </p>
              </div>

              {/* 4 Premium Stat Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-100/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-indigo-600 font-bold">
                    <span>Vocabulary Size |V|</span>
                    <Database className="w-4 h-4 opacity-70" />
                  </div>
                  <p className="text-2xl font-black text-indigo-950 font-mono tracking-tight">{indexData.vocabSize}</p>
                  <p className="text-[11px] text-slate-500">Unique normalized terms</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/80 to-white border border-violet-100/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-violet-600 font-bold">
                    <span>Collection Frequency</span>
                    <FileText className="w-4 h-4 opacity-70" />
                  </div>
                  <p className="text-2xl font-black text-violet-950 font-mono tracking-tight">{indexData.totalTokens}</p>
                  <p className="text-[11px] text-slate-500">Total tokens across {Object.keys(activeCorpus).length} docs</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
                    <span>Total Postings</span>
                    <Layers className="w-4 h-4 opacity-70" />
                  </div>
                  <p className="text-2xl font-black text-emerald-950 font-mono tracking-tight">{indexData.totalPostings}</p>
                  <p className="text-[11px] text-slate-500">DocID pointer entries</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white border border-amber-100/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-amber-600 font-bold">
                    <span>Matrix Sparsity</span>
                    <Activity className="w-4 h-4 opacity-70" />
                  </div>
                  <p className="text-2xl font-black text-amber-950 font-mono tracking-tight">{indexData.sparsityPct}%</p>
                  <p className="text-[11px] text-slate-500">RAM savings over dense matrix</p>
                </div>
              </div>

              {/* Interactive SVG Zipf's Law Curve Chart */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Zipf&apos;s Law Power-Law Decay Curve: f(r) vs. Rank (r)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Comparing empirical term frequency vs. theoretical Zipfian curve (C = f₁ &approx; {topDfTerms[0]?.cf || 1})
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-indigo-700">
                      <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" /> Empirical Frequency
                    </span>
                    <span className="flex items-center gap-1.5 text-violet-600">
                      <span className="w-3 h-1 rounded bg-violet-400 inline-block" /> Theoretical C/r
                    </span>
                  </div>
                </div>

                {topDfTerms.length > 0 ? (
                  <div className="space-y-6">
                    {/* SVG Chart */}
                    <div className="w-full h-56 relative bg-slate-50/60 rounded-xl border border-slate-200/80 p-3 flex flex-col justify-end">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <line x1="40" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                        <line x1="40" y1="70" x2="480" y2="70" stroke="#e2e8f0" strokeDasharray="3 3" />
                        <line x1="40" y1="120" x2="480" y2="120" stroke="#e2e8f0" strokeDasharray="3 3" />
                        <line x1="40" y1="140" x2="480" y2="140" stroke="#cbd5e1" strokeWidth="1.5" />
                        <line x1="40" y1="20" x2="40" y2="140" stroke="#cbd5e1" strokeWidth="1.5" />

                        {/* Y-axis label */}
                        <text x="10" y="25" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">cf</text>
                        <text x="15" y="140" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">0</text>

                        {/* Theoretical curve path */}
                        {(() => {
                          const maxVal = Math.max(topDfTerms[0]?.cf || 1, 4);
                          const pts = topDfTerms.map((item, idx) => {
                            const x = 50 + (idx / Math.max(1, topDfTerms.length - 1)) * 420;
                            const rank = idx + 1;
                            const theoVal = maxVal / rank;
                            const y = 140 - (theoVal / maxVal) * 115;
                            return `${x},${y}`;
                          });
                          return (
                            <path
                              d={`M ${pts.join(' L ')}`}
                              fill="none"
                              stroke="#a78bfa"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                            />
                          );
                        })()}

                        {/* Empirical curve line & points */}
                        {(() => {
                          const maxVal = Math.max(topDfTerms[0]?.cf || 1, 4);
                          const pts = topDfTerms.map((item, idx) => {
                            const x = 50 + (idx / Math.max(1, topDfTerms.length - 1)) * 420;
                            const y = 140 - (item.cf / maxVal) * 115;
                            return { x, y, term: item.term, cf: item.cf, rank: idx + 1 };
                          });
                          const linePath = pts.map(p => `${p.x},${p.y}`).join(' L ');
                          return (
                            <>
                              <path
                                d={`M ${linePath}`}
                                fill="none"
                                stroke="#4f46e5"
                                strokeWidth="2.5"
                              />
                              {pts.map((p, i) => (
                                <g key={i}>
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="4.5"
                                    fill="#4f46e5"
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                  />
                                  <text
                                    x={p.x}
                                    y={155}
                                    textAnchor="middle"
                                    fill="#64748b"
                                    fontSize="9"
                                    fontFamily="monospace"
                                  >
                                    #{p.rank}
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>

                    {/* Ranked Frequency Breakdown Table */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Top Vocabulary Terms Ranked by Frequency
                      </span>
                      <div className="grid gap-2">
                        {topDfTerms.map((item, idx) => {
                          const rank = idx + 1;
                          const maxVal = topDfTerms[0]?.cf || 1;
                          const pct = Math.max(6, Math.round((item.cf / maxVal) * 100));

                          return (
                            <div
                              key={item.term}
                              className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-[140px]">
                                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 font-mono font-bold flex items-center justify-center text-[11px]">
                                  #{rank}
                                </span>
                                <span className="font-mono font-bold text-slate-800">
                                  {item.term}
                                </span>
                              </div>

                              <div className="flex-1 h-3 rounded-full bg-slate-200/70 overflow-hidden relative">
                                <div
                                  style={{ width: `${pct}%` }}
                                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-300"
                                />
                              </div>

                              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600 shrink-0">
                                <span>cf: <strong className="text-indigo-700">{item.cf}</strong></span>
                                <span>df: <strong className="text-slate-800">{item.df}</strong></span>
                                <span className="text-slate-400">f &times; r = {item.cf * rank}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-400 py-6">No vocabulary terms in active index.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Recorded Trials History Log ── */}
      <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Session Experimental Trials Log ({trials.length} Recorded)
            </h3>
            <p className="text-xs text-slate-500">
              Recorded trials automatically sync with your verified lab report and certificate generator.
            </p>
          </div>

          {trials.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Trials CSV
            </button>
          )}
        </div>

        {trials.length > 0 ? (
          <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Corpus</th>
                  <th className="p-3">Query</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Hits</th>
                  <th className="p-3">Comparisons</th>
                  <th className="p-3">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trials.map((t, idx) => (
                  <tr key={t.trialId || idx} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 text-slate-400">{idx + 1}</td>
                    <td className="p-3 text-slate-500">{t.timestamp}</td>
                    <td className="p-3 text-slate-700 font-sans">{t.corpusName}</td>
                    <td className="p-3 font-bold text-indigo-700">{t.query}</td>
                    <td className="p-3 text-slate-600 font-sans">{t.mode}</td>
                    <td className="p-3 font-bold text-emerald-700">{t.matchedDocsCount} docs</td>
                    <td className="p-3 text-slate-600">{t.comparisons}</td>
                    <td className="p-3 text-slate-500">{t.latencyUs} &mu;s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No trials recorded in this session yet. Adjust corpus, toggle preprocessing rules, or execute queries, then click <strong className="text-slate-600">&ldquo;Record Current Trial&rdquo;</strong>.
          </div>
        )}
      </div>
    </div>
  );
}
