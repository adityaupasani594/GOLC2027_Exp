import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Play, RotateCcw, Network, Search, Sliders,
  BarChart2, Tag, Layers, Database, ArrowRight, CheckCircle2,
  FileCheck, HelpCircle, Eye, Info
} from 'lucide-react';
import {
  SAMPLE_PRESETS,
  KNOWN_GAZETTEER,
  ENTITY_COLORS,
  DATA_CORPORA,
  extractEntities,
  buildGraphFromEntities,
  rankDocuments,
  computeMetrics
} from '../entityGraphEngine';

export default function LabSection({ onAddTrial, trials = [] }) {
  // ── State: Module Sub-Tabs ──
  const [subTab, setSubTab] = useState('ner'); // 'ner' | 'graph' | 'retrieval' | 'metrics'

  // ── State: Section 1 & 2 (NER & Graph) ──
  const [selectedPreset, setSelectedPreset] = useState("Tech Leaders (Sundar Pichai / Google)");
  const [inputText, setInputText] = useState(SAMPLE_PRESETS["Tech Leaders (Sundar Pichai / Google)"].text);
  const [extractedEntities, setExtractedEntities] = useState(() =>
    extractEntities(SAMPLE_PRESETS["Tech Leaders (Sundar Pichai / Google)"].text)
  );

  // ── State: Section 3 (Probabilistic Retrieval) ──
  const [selectedCorpusKey, setSelectedCorpusKey] = useState("AI & Deep Learning Pioneers (Domain 1)");
  const [searchQuery, setSearchQuery] = useState("Elena Voss Deep Learning Toronto");
  const [k1, setK1] = useState(1.5);
  const [b, setB] = useState(0.75);
  const [entityBoostWeight, setEntityBoostWeight] = useState(1.8);
  const [topK, setTopK] = useState(3);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  // Handle Preset Selection
  const handleSelectPreset = (key) => {
    setSelectedPreset(key);
    const text = SAMPLE_PRESETS[key].text;
    setInputText(text);
    const entities = extractEntities(text);
    setExtractedEntities(entities);
  };

  // Run extraction on custom text
  const handleRunNER = () => {
    const entities = extractEntities(inputText);
    setExtractedEntities(entities);
  };

  // Build Graph Topology
  const graph = useMemo(() => {
    return buildGraphFromEntities(inputText, extractedEntities);
  }, [inputText, extractedEntities]);

  // Retrieval Rankings
  const corpus = DATA_CORPORA[selectedCorpusKey]?.documents || [];
  const rankedResults = useMemo(() => {
    return rankDocuments(corpus, searchQuery, { k1, b, entityBoostWeight });
  }, [corpus, searchQuery, k1, b, entityBoostWeight]);

  // Comparative Metrics
  const metrics = useMemo(() => {
    return computeMetrics(rankedResults, topK);
  }, [rankedResults, topK]);

  // Baseline Metrics (Pure BM25 with entity boost = 0)
  const baselineMetrics = useMemo(() => {
    const baseRanked = rankDocuments(corpus, searchQuery, { k1, b, entityBoostWeight: 0 });
    return computeMetrics(baseRanked, topK);
  }, [corpus, searchQuery, k1, b, topK]);

  // Log trial to student report
  const handleLogTrial = () => {
    const trialRecord = {
      id: `TRIAL-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      query: searchQuery,
      corpus: selectedCorpusKey,
      k1,
      b,
      entityBoostWeight,
      top1Doc: rankedResults[0]?.title || 'None',
      top1Score: rankedResults[0]?.finalScore || 0,
      precisionAtK: metrics.precisionAtK,
      recallAtK: metrics.recallAtK,
      map: metrics.map,
      ndcgAtK: metrics.ndcgAtK
    };
    if (onAddTrial) {
      onAddTrial(trialRecord);
      setSavedSuccessMsg(true);
      setTimeout(() => setSavedSuccessMsg(false), 2500);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans max-w-5xl mx-auto">
      {/* ── Sub-navigation Control Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'ner', label: '1. Entity Extraction (NER)', icon: Tag },
            { id: 'graph', label: '2. Knowledge Graph Explorer', icon: Network },
            { id: 'retrieval', label: '3. Probabilistic Retrieval', icon: Search },
            { id: 'metrics', label: '4. Evaluation Benchmark', icon: BarChart2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-slate-400 px-2">
          GOLC 2027 • Lab 08
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SUB-VIEW 1: ENTITY EXTRACTION & NER
         ══════════════════════════════════════════════════════════ */}
      {subTab === 'ner' && (
        <motion.div
          key="ner"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Preset Buttons */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Curated Entity Extraction Corpus Preset
              </span>
              <span className="text-[11px] text-slate-400">4 Scenarios Available</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {Object.entries(SAMPLE_PRESETS).map(([key, data]) => {
                const isSelected = selectedPreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectPreset(key)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-200'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                      {data.category}
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5">
                      {key.split(' (')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Input & Extraction Engine */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Natural Language Passage for Entity Parsing
              </label>
              <button
                onClick={handleRunNER}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-200 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Parse Entities</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all leading-relaxed"
              placeholder="Enter custom sentence or passage..."
            />

            {/* Extracted Entity Tags in Text */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Annotated Entity Spans ({extractedEntities.length} identified)
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {extractedEntities.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No entities detected. Try selecting a preset or adding proper nouns.</span>
                ) : (
                  extractedEntities.map((ent, idx) => {
                    const meta = ENTITY_COLORS[ent.type] || ENTITY_COLORS.CONCEPT;
                    return (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${meta.bg} ${meta.border} ${meta.text}`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.dot }} />
                        <span>{ent.name}</span>
                        <span className="text-[9px] font-mono opacity-70 px-1 py-0.2 rounded bg-white/70">
                          {ent.type}
                        </span>
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Extraction Table Details */}
            {extractedEntities.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Entity Span</th>
                      <th className="p-3">Canonical ID</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Character Span</th>
                      <th className="p-3">Extraction Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {extractedEntities.map((e, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">{e.name}</td>
                        <td className="p-3 font-mono text-slate-600">{e.canonical}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${ENTITY_COLORS[e.type]?.bg} ${ENTITY_COLORS[e.type]?.border} ${ENTITY_COLORS[e.type]?.text}`}>
                            {e.type}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-500">[{e.start}, {e.end}]</td>
                        <td className="p-3 text-slate-500">{e.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SUB-VIEW 2: KNOWLEDGE GRAPH EXPLORER
         ══════════════════════════════════════════════════════════ */}
      {subTab === 'graph' && (
        <motion.div
          key="graph"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Synthesized Knowledge Graph Topology
                </h3>
                <p className="text-xs text-slate-500">
                  {graph.nodes.length} entity nodes • {graph.edges.length} directional relational assertions
                </p>
              </div>
              <button
                onClick={() => setSubTab('ner')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                Modify Source Text &rarr;
              </button>
            </div>

            {/* Interactive SVG Network Canvas */}
            <div className="relative w-full h-80 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 600 300">
                {/* Draw Edges */}
                {graph.edges.map((edge, i) => {
                  const nodeCount = graph.nodes.length || 1;
                  const uIdx = graph.nodes.findIndex(n => n.id === edge.source);
                  const vIdx = graph.nodes.findIndex(n => n.id === edge.target);

                  const x1 = 300 + 190 * Math.cos((2 * Math.PI * uIdx) / nodeCount);
                  const y1 = 150 + 95 * Math.sin((2 * Math.PI * uIdx) / nodeCount);
                  const x2 = 300 + 190 * Math.cos((2 * Math.PI * vIdx) / nodeCount);
                  const y2 = 150 + 95 * Math.sin((2 * Math.PI * vIdx) / nodeCount);
                  const mx = (x1 + x2) / 2;
                  const my = (y1 + y2) / 2;

                  return (
                    <g key={edge.id || i}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#334155"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                      <rect
                        x={mx - 32}
                        y={my - 8}
                        width="64"
                        height="16"
                        rx="4"
                        fill="#0f172a"
                        stroke="#1e293b"
                      />
                      <text
                        x={mx}
                        y={my + 3}
                        fill="#94a3b8"
                        fontSize="8"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {edge.label}
                      </text>
                    </g>
                  );
                })}

                {/* Draw Nodes */}
                {graph.nodes.map((node, i) => {
                  const count = graph.nodes.length || 1;
                  const cx = 300 + 190 * Math.cos((2 * Math.PI * i) / count);
                  const cy = 150 + 95 * Math.sin((2 * Math.PI * i) / count);

                  return (
                    <g key={node.id} className="cursor-pointer">
                      <circle
                        cx={cx}
                        cy={cy}
                        r="24"
                        fill={node.color}
                        opacity="0.9"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text
                        x={cx}
                        y={cy + 34}
                        fill="#f8fafc"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {node.label}
                      </text>
                      <text
                        x={cx}
                        y={cy + 3}
                        fill="#ffffff"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {node.type.slice(0, 4)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Relational Triples Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Relational Triples Catalog
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {graph.edges.map((e, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-mono">
                    <span className="font-bold text-slate-800">{e.source}</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-sans font-semibold">
                      {e.label}
                    </span>
                    <span className="font-bold text-slate-800">{e.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SUB-VIEW 3: PROBABILISTIC RETRIEVAL & BENCHMARKING
         ══════════════════════════════════════════════════════════ */}
      {subTab === 'retrieval' && (
        <motion.div
          key="retrieval"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Query & Parameter Configuration Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Probabilistic Search Engine Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  Tune Okapi BM25 hyperparameters and entity-aware boost weight
                </p>
              </div>

              {/* Corpus Selector */}
              <select
                value={selectedCorpusKey}
                onChange={(e) => setSelectedCorpusKey(e.target.value)}
                className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {Object.keys(DATA_CORPORA).map(cKey => (
                  <option key={cKey} value={cKey}>{cKey}</option>
                ))}
              </select>
            </div>

            {/* Query Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Search Query
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter query terms..."
                  />
                </div>
              </div>

              {/* Quick Query Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400">Quick Test Queries:</span>
                {[
                  "Elena Voss Deep Learning",
                  "Marcus Lindqvist Computer Vision",
                  "Satya Nadella Microsoft OpenAI",
                  "Kavi Rajan Cortex Labs London"
                ].map(q => (
                  <button
                    key={q}
                    onClick={() => setSearchQuery(q)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: k1, b, Entity Boost */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>k₁ (TF Saturation)</span>
                  <span className="font-mono text-emerald-600">{k1.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={k1}
                  onChange={(e) => setK1(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <span className="text-[10px] text-slate-400 block">Default: 1.50</span>
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>b (Length Penalty)</span>
                  <span className="font-mono text-emerald-600">{b.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={b}
                  onChange={(e) => setB(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <span className="text-[10px] text-slate-400 block">Default: 0.75</span>
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Entity Boost (λ)</span>
                  <span className="font-mono text-emerald-600">{entityBoostWeight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.2"
                  value={entityBoostWeight}
                  onChange={(e) => setEntityBoostWeight(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <span className="text-[10px] text-slate-400 block">0 = Pure BM25</span>
              </div>
            </div>
          </div>

          {/* Ranked Documents Output */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ranked Retrieval Results ({rankedResults.length} Documents)
                </h3>
                <p className="text-xs text-slate-500">
                  Ordered by composite score = BM25 + (λ · Entity Matches)
                </p>
              </div>

              <button
                onClick={handleLogTrial}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-200 transition cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Log to Report</span>
              </button>
            </div>

            {savedSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Benchmark trial successfully logged to Laboratory Report!</span>
              </div>
            )}

            <div className="space-y-3">
              {rankedResults.map((doc, rank) => (
                <div
                  key={doc.doc_id}
                  className={`p-4 rounded-2xl border transition-all ${
                    rank === 0
                      ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                        #{rank + 1}
                      </span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {doc.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                        {doc.doc_id}
                      </span>
                      {doc.isGroundTruthRelevant && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Relevant Target
                        </span>
                      )}
                    </div>

                    {/* Scores Breakdown */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-500">BM25: {doc.bm25Score}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-600 font-semibold">+Boost: {doc.entityBoost}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        Total: {doc.finalScore}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {doc.text}
                  </p>

                  {/* Document Entities */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-center mr-1">
                      Entities:
                    </span>
                    {doc.entities.map((ent, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold"
                      >
                        {ent.name} ({ent.type})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SUB-VIEW 4: COMPARATIVE EVALUATION METRICS
         ══════════════════════════════════════════════════════════ */}
      {subTab === 'metrics' && (
        <motion.div
          key="metrics"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Information Retrieval Evaluation Metrics Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Benchmarking Pure BM25 (Baseline) vs Entity-Boosted Probabilistic Retrieval (Hybrid)
              </p>
            </div>

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: `Precision@${topK}`, key: 'precisionAtK', desc: 'Ratio of relevant in top K' },
                { label: `Recall@${topK}`, key: 'recallAtK', desc: 'Coverage of total relevant' },
                { label: 'MAP Score', key: 'map', desc: 'Mean Average Precision' },
                { label: `NDCG@${topK}`, key: 'ndcgAtK', desc: 'Discounted Cumulative Gain' }
              ].map(m => {
                const baseVal = baselineMetrics[m.key];
                const hybridVal = metrics[m.key];
                const delta = hybridVal - baseVal;
                return (
                  <div key={m.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{m.label}</div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {hybridVal}%
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200">
                      <span>Base: {baseVal}%</span>
                      {delta >= 0 ? (
                        <span className="text-emerald-600 font-bold">+{delta.toFixed(1)}%</span>
                      ) : (
                        <span className="text-rose-600 font-bold">{delta.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visual Comparison Bar Chart */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Metric Performance Comparison
              </div>

              {[
                { label: `Precision@${topK}`, base: baselineMetrics.precisionAtK, hybrid: metrics.precisionAtK },
                { label: `Recall@${topK}`, base: baselineMetrics.recallAtK, hybrid: metrics.recallAtK },
                { label: 'Mean Average Precision (MAP)', base: baselineMetrics.map, hybrid: metrics.map },
                { label: `Normalized DCG@${topK}`, base: baselineMetrics.ndcgAtK, hybrid: metrics.ndcgAtK }
              ].map((row, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{row.label}</span>
                    <span className="font-mono text-emerald-700 font-bold">{row.hybrid}% vs {row.base}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
                    <div
                      className="bg-emerald-600 h-full rounded-l-full transition-all duration-500"
                      style={{ width: `${row.hybrid}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  Hybrid Entity-Boosted BM25
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
