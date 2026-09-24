import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Play, RefreshCw, Upload, Download, FileText, CheckCircle2,
  AlertCircle, Sparkles, Network, Database, ChevronRight, Copy, Check,
  Search, Filter, ZoomIn, ZoomOut, Maximize2, RotateCcw, Info, Tag, Layers,
  ShieldCheck, ShieldAlert
} from 'lucide-react';
import {
  SAMPLE_TEXTS,
  runExtractionPipeline,
  triplesToCSV,
  triplesToJSON,
  getEntityColor,
  ENTITY_COLORS
} from '../relationshipExtractionEngine';

export default function LabSection({ onRecordTrial, trials = [], onGoToQuiz }) {
  // Input State
  const [inputMode, setInputMode] = useState('sample'); // 'sample' | 'custom' | 'upload'
  const [selectedSampleKey, setSelectedSampleKey] = useState('Example 1: Tech Companies & Partnerships');
  const [inputText, setInputText] = useState(SAMPLE_TEXTS['Example 1: Tech Companies & Partnerships']);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Results State
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('triples'); // 'triples' | 'graph' | 'entities' | 'syntax'
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);

  // Graph Canvas State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [graphNodes, setGraphNodes] = useState([]);
  const [graphEdges, setGraphEdges] = useState([]);
  const [isSimulating, setIsSimulating] = useState(true);

  // Run initial extraction for Example 1 on mount
  useEffect(() => {
    const res = runExtractionPipeline(SAMPLE_TEXTS['Example 1: Tech Companies & Partnerships']);
    setResults(res);
  }, []);

  // Update input text when sample selection changes
  const handleSampleChange = (key) => {
    setSelectedSampleKey(key);
    setInputText(SAMPLE_TEXTS[key]);
  };

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'txt' || ext === 'json' || ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result || '';
        setInputText(String(content));
      };
      reader.readAsText(file);
    } else {
      // For PDF / docx fallback, read as text stream or mock read
      const reader = new FileReader();
      reader.onload = (event) => {
        const raw = String(event.target?.result || '');
        // Basic plain text cleaner from binary / pdf stream
        const cleaned = raw.replace(/[^\x20-\x7E\t\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
        setInputText(cleaned.length > 20 ? cleaned.slice(0, 1500) : `Extracted text from ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  // Execution Handler
  const handleExtract = () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      const res = runExtractionPipeline(inputText);
      setResults(res);
      setIsProcessing(false);
      setSelectedNode(null);
    }, 300);
  };

  // Build Graph Nodes & Edges from Triples
  useEffect(() => {
    if (!results || !results.triples) {
      setGraphNodes([]);
      setGraphEdges([]);
      return;
    }

    const nodeMap = new Map();
    const edges = [];

    results.triples.forEach((t, idx) => {
      if (!nodeMap.has(t.subject)) {
        nodeMap.set(t.subject, {
          id: t.subject,
          label: t.subject,
          type: t.subject_type || 'ENTITY',
          color: getEntityColor(t.subject_type),
          degree: 1,
          x: 200 + Math.cos((idx * 2 * Math.PI) / results.triples.length) * 160 + (Math.random() - 0.5) * 40,
          y: 200 + Math.sin((idx * 2 * Math.PI) / results.triples.length) * 160 + (Math.random() - 0.5) * 40,
          vx: 0,
          vy: 0
        });
      } else {
        nodeMap.get(t.subject).degree += 1;
      }

      if (!nodeMap.has(t.object)) {
        nodeMap.set(t.object, {
          id: t.object,
          label: t.object,
          type: t.object_type || 'ENTITY',
          color: getEntityColor(t.object_type),
          degree: 1,
          x: 200 + Math.cos(((idx + 0.5) * 2 * Math.PI) / results.triples.length) * 160 + (Math.random() - 0.5) * 40,
          y: 200 + Math.sin(((idx + 0.5) * 2 * Math.PI) / results.triples.length) * 160 + (Math.random() - 0.5) * 40,
          vx: 0,
          vy: 0
        });
      } else {
        nodeMap.get(t.object).degree += 1;
      }

      edges.push({
        id: `edge-${idx}`,
        source: t.subject,
        target: t.object,
        label: t.relation,
        sentence: t.sentence
      });
    });

    setGraphNodes(Array.from(nodeMap.values()));
    setGraphEdges(edges);
  }, [results]);

  // Simple Spring Physics Layout for SVG Graph
  useEffect(() => {
    if (!isSimulating || graphNodes.length <= 1) return;

    let animId;
    let iteration = 0;
    const maxIterations = 80;

    const simulate = () => {
      iteration++;
      if (iteration > maxIterations) return;

      setGraphNodes((prevNodes) => {
        const nodes = prevNodes.map((n) => ({ ...n }));
        const nodeIndex = new Map(nodes.map((n, i) => [n.id, i]));
        const centerX = 350;
        const centerY = 220;

        // 1. Repulsion between all nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 260) {
              const force = (260 - dist) / dist * 1.8;
              nodes[i].x -= dx * force * 0.05;
              nodes[i].y -= dy * force * 0.05;
              nodes[j].x += dx * force * 0.05;
              nodes[j].y += dy * force * 0.05;
            }
          }
        }

        // 2. Spring attraction along edges
        graphEdges.forEach((edge) => {
          const sIdx = nodeIndex.get(edge.source);
          const tIdx = nodeIndex.get(edge.target);
          if (sIdx !== undefined && tIdx !== undefined) {
            const dx = nodes[tIdx].x - nodes[sIdx].x;
            const dy = nodes[tIdx].y - nodes[sIdx].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const targetDist = 130;
            const force = (dist - targetDist) * 0.04;
            nodes[sIdx].x += (dx / dist) * force;
            nodes[sIdx].y += (dy / dist) * force;
            nodes[tIdx].x -= (dx / dist) * force;
            nodes[tIdx].y -= (dy / dist) * force;
          }
        });

        // 3. Weak pull to center
        nodes.forEach((n) => {
          n.x += (centerX - n.x) * 0.02;
          n.y += (centerY - n.y) * 0.02;
        });

        return nodes;
      });

      animId = requestAnimationFrame(simulate);
    };

    animId = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animId);
  }, [graphEdges, isSimulating]);

  // Copy Triple Helper
  const handleCopyTriple = (triple, idx) => {
    const text = `(${triple.subject}, ${triple.relation}, ${triple.object})`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  // Download CSV
  const handleDownloadCSV = () => {
    if (!results?.triples?.length) return;
    const csvStr = triplesToCSV(results.triples);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'relationship_triples.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download JSON
  const handleDownloadJSON = () => {
    if (!results?.triples?.length) return;
    const jsonStr = triplesToJSON(results.triples);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'relationship_triples.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Record Trial
  const handleRecordTrial = () => {
    if (!results) return;
    const trialData = {
      id: `TR-${trials.length + 1}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sample: inputMode === 'sample' ? selectedSampleKey : 'Custom / Uploaded Text',
      textSnippet: results.text.slice(0, 75) + (results.text.length > 75 ? '...' : ''),
      entityCount: results.entities.length,
      tripleCount: results.triples.length,
      topRelation: results.triples[0]?.relation || 'None',
      triples: results.triples
    };
    onRecordTrial && onRecordTrial(trialData);
  };

  // Filtered Triples
  const filteredTriples = useMemo(() => {
    if (!results?.triples) return [];
    if (!filterQuery.trim()) return results.triples;
    const q = filterQuery.toLowerCase();
    return results.triples.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.relation.toLowerCase().includes(q) ||
        t.object.toLowerCase().includes(q) ||
        t.subject_type?.toLowerCase().includes(q) ||
        t.object_type?.toLowerCase().includes(q)
    );
  }, [results, filterQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Top Banner & Control Deck */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <FlaskConical className="w-3.5 h-3.5" />
              Section 2 · Interactive Extraction Sandbox
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Relationship Extraction &amp; Knowledge Graph Sandbox
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Test natural language text through spaCy-grade NER, dependency parsing, active/passive voice inversion, and graph projection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
                setIsSimulating(true);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset Viewport"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={handleRecordTrial}
              disabled={!results || results.triples.length === 0}
              className="px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <Database className="w-4 h-4" />
              Record Trial ({trials.length})
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'sample', label: 'Sample Example Benchmark', icon: Layers },
            { id: 'custom', label: 'Custom Text Input', icon: FileText },
            { id: 'upload', label: 'Upload Document (.txt, .pdf, .docx)', icon: Upload }
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = inputMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setInputMode(mode.id);
                  if (mode.id === 'custom') setInputText('');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Input Mode 1: Sample Examples Dropdown */}
        {inputMode === 'sample' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Choose Predefined Benchmark Scenario:
            </label>
            <select
              value={selectedSampleKey}
              onChange={(e) => handleSampleChange(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              {Object.keys(SAMPLE_TEXTS).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Input Mode 3: File Upload Dropzone */}
        {inputMode === 'upload' && (
          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-3 hover:border-teal-500 transition-colors">
            <Upload className="w-8 h-8 text-teal-600 mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-800">
                {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Choose or drag a document here'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports .txt, .pdf, .docx, and raw text files
              </p>
            </div>
            <label className="inline-block px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm cursor-pointer">
              Browse Files
              <input
                type="file"
                accept=".txt,.pdf,.docx,.json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Input Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Input Text for Pipeline:</span>
            <span>{inputText.length} characters · {inputText.split(/\s+/).filter(Boolean).length} words</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            placeholder="Type or paste sentences (e.g., Steve Jobs founded Apple. Elon Musk founded SpaceX...)"
            className="w-full p-3.5 rounded-2xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-medium leading-relaxed"
          />
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <button
            onClick={handleExtract}
            disabled={isProcessing || !inputText.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Parsing &amp; Extracting Triples...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Extract Relationships
              </>
            )}
          </button>

          {/* Quick Stats Badges */}
          {results && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 font-bold">
                {results.entities.length} Entities
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                {results.triples.length} Triples
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-bold">
                {graphNodes.length} Graph Nodes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Results Deck */}
      {results && (
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/60 p-2 sm:p-3 gap-2">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'triples', label: `Triples (${results.triples.length})`, icon: Database },
                { id: 'graph', label: `Knowledge Graph (${graphNodes.length})`, icon: Network },
                { id: 'entities', label: `Entities (${results.entities.length})`, icon: Tag },
                { id: 'syntax', label: 'Linguistic Analysis', icon: Layers }
              ].map((tab) => {
                const Icon = tab.icon;
                const isCurrent = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-white text-teal-900 shadow-sm border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCSV}
                disabled={results.triples.length === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3 h-3" />
                CSV
              </button>
              <button
                onClick={handleDownloadJSON}
                disabled={results.triples.length === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3 h-3" />
                JSON
              </button>
            </div>
          </div>

          {/* Tab 1: Triples Table View */}
          {activeTab === 'triples' && (
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter by subject, relation, or object..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
                <span className="text-xs text-slate-500">
                  Showing {filteredTriples.length} of {results.triples.length} extracted semantic facts
                </span>
              </div>

              {filteredTriples.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Subject (e1)</th>
                        <th className="px-4 py-3 text-center">Relationship (r)</th>
                        <th className="px-4 py-3">Object (e2)</th>
                        <th className="px-4 py-3">Syntactic Pattern</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTriples.map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span>{t.subject}</span>
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                                style={{ backgroundColor: getEntityColor(t.subject_type) }}
                              >
                                {t.subject_type}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold text-xs">
                              {t.relation}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span>{t.object}</span>
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                                style={{ backgroundColor: getEntityColor(t.object_type) }}
                              >
                                {t.object_type}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                              {t.syntaxPattern || 'Syntactic Dependency'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleCopyTriple(t, idx)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Copy triple"
                            >
                              {copiedIndex === idx ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">
                    {results.triples.length === 0 ? 'No relationship triples extracted' : 'No matching triples for this query'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {results.triples.length === 0
                      ? 'The input sentence may be a negative case (e.g. negated assertion) or lacks recognized entity pairs.'
                      : 'Try resetting the filter search box above.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Interactive SVG Knowledge Graph */}
          {activeTab === 'graph' && (
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-500">
                    <span className="font-bold text-slate-900">{graphNodes.length}</span> Nodes · <span className="font-bold text-slate-900">{graphEdges.length}</span> Edges
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>Scroll/pinch to zoom · Drag canvas to pan</span>
                  </div>
                </div>

                {/* Graph Zoom Controls */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.4))}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.5))}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setZoomLevel(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-bold cursor-pointer"
                  >
                    Fit
                  </button>
                </div>
              </div>

              {/* SVG Canvas */}
              <div
                className="relative w-full h-[460px] rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden cursor-grab active:cursor-grabbing select-none"
                onMouseDown={(e) => {
                  setIsDraggingCanvas(true);
                  setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
                }}
                onMouseMove={(e) => {
                  if (isDraggingCanvas) {
                    setPanOffset({
                      x: e.clientX - dragStart.x,
                      y: e.clientY - dragStart.y
                    });
                  }
                }}
                onMouseUp={() => setIsDraggingCanvas(false)}
                onMouseLeave={() => setIsDraggingCanvas(false)}
              >
                {/* SVG Graphic */}
                <svg
                  className="w-full h-full"
                  viewBox="0 0 700 440"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <marker
                      id="arrow-end"
                      viewBox="0 -5 10 10"
                      refX="22"
                      refY="0"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto"
                    >
                      <path d="M0,-5L10,0L0,5" fill="#94a3b8" />
                    </marker>
                    <marker
                      id="arrow-end-active"
                      viewBox="0 -5 10 10"
                      refX="22"
                      refY="0"
                      markerWidth="7"
                      markerHeight="7"
                      orient="auto"
                    >
                      <path d="M0,-5L10,0L0,5" fill="#14b8a6" />
                    </marker>
                  </defs>

                  <g
                    transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
                    style={{ transformOrigin: '350px 220px' }}
                  >
                    {/* Graph Edges */}
                    {graphEdges.map((edge) => {
                      const sourceNode = graphNodes.find((n) => n.id === edge.source);
                      const targetNode = graphNodes.find((n) => n.id === edge.target);
                      if (!sourceNode || !targetNode) return null;

                      const isHighlighted =
                        selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);

                      const midX = (sourceNode.x + targetNode.x) / 2;
                      const midY = (sourceNode.y + targetNode.y) / 2;

                      return (
                        <g key={edge.id} className="transition-opacity">
                          <line
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke={isHighlighted ? '#14b8a6' : '#475569'}
                            strokeWidth={isHighlighted ? 2.5 : 1.5}
                            strokeDasharray={isHighlighted ? 'none' : '4 2'}
                            markerEnd={isHighlighted ? 'url(#arrow-end-active)' : 'url(#arrow-end)'}
                          />
                          {/* Edge Label Badge */}
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect
                              x={-((edge.label.length * 5.5) / 2 + 5)}
                              y="-9"
                              width={edge.label.length * 5.5 + 10}
                              height="18"
                              rx="5"
                              fill="#1e293b"
                              stroke={isHighlighted ? '#14b8a6' : '#334155'}
                              strokeWidth="1"
                            />
                            <text
                              x="0"
                              y="3"
                              textAnchor="middle"
                              fill={isHighlighted ? '#2dd4bf' : '#cbd5e1'}
                              fontSize="9"
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              {edge.label}
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* Graph Nodes */}
                    {graphNodes.map((node) => {
                      const isSelected = selectedNode?.id === node.id;
                      const isConnected =
                        selectedNode &&
                        graphEdges.some(
                          (e) =>
                            (e.source === selectedNode.id && e.target === node.id) ||
                            (e.target === selectedNode.id && e.source === node.id)
                        );
                      const isFaded = selectedNode && !isSelected && !isConnected;

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${node.x}, ${node.y})`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNode(isSelected ? null : node);
                          }}
                          className="cursor-pointer transition-all duration-200"
                          opacity={isFaded ? 0.3 : 1}
                        >
                          {/* Outer pulse circle for selected */}
                          {isSelected && (
                            <circle
                              r="26"
                              fill="none"
                              stroke={node.color}
                              strokeWidth="2"
                              opacity="0.8"
                              className="animate-pulse"
                            />
                          )}

                          {/* Node circle */}
                          <circle
                            r="18"
                            fill={node.color}
                            stroke="#ffffff"
                            strokeWidth="2"
                            filter="drop-shadow(0 2px 6px rgba(0,0,0,0.4))"
                          />

                          {/* Node Type Initial */}
                          <text
                            y="4"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="10"
                            fontWeight="black"
                          >
                            {node.type.slice(0, 1)}
                          </text>

                          {/* Node Label underneath */}
                          <text
                            y="30"
                            textAnchor="middle"
                            fill="#f8fafc"
                            fontSize="11"
                            fontWeight="bold"
                            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.9))"
                          >
                            {node.label}
                          </text>

                          {/* Type tag under label */}
                          <text
                            y="42"
                            textAnchor="middle"
                            fill="#94a3b8"
                            fontSize="8"
                            fontWeight="600"
                          >
                            [{node.type}]
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </svg>

                {/* Graph Legend Overlay */}
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[10px] space-y-1.5 pointer-events-none">
                  <div className="font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Entity Palette
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {Object.entries(ENTITY_COLORS).map(([type, color]) => (
                      <div key={type} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-slate-400 font-semibold">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inspector Drawer Overlay when node is clicked */}
                {selectedNode && (
                  <div className="absolute top-3 right-3 w-64 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-xs text-white shadow-xl space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: selectedNode.color }}
                        />
                        <span className="font-bold text-slate-100">{selectedNode.label}</span>
                      </div>
                      <button
                        onClick={() => setSelectedNode(null)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-1 text-slate-300">
                      <div>
                        Type: <span className="font-bold text-teal-400">{selectedNode.type}</span>
                      </div>
                      <div>
                        Degree: <span className="font-mono">{selectedNode.degree} relationships</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Connected Triples:
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {results.triples
                          .filter(
                            (t) => t.subject === selectedNode.id || t.object === selectedNode.id
                          )
                          .map((t, idx) => (
                            <div
                              key={idx}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px]"
                            >
                              <span className="text-purple-300">{t.subject}</span> →{' '}
                              <span className="text-teal-400 font-bold">{t.relation}</span> →{' '}
                              <span className="text-blue-300">{t.object}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Named Entities Breakdown */}
          {activeTab === 'entities' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(ENTITY_COLORS).map(([type, color]) => {
                  const count = results.entities.filter((e) => e.Type === type).length;
                  return (
                    <div
                      key={type}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-1 text-center"
                    >
                      <span className="w-3 h-3 rounded-full mx-auto block" style={{ backgroundColor: color }} />
                      <div className="text-xl font-black text-slate-900">{count}</div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{type}</div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Extracted Entities Catalog ({results.entities.length}):
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {results.entities.map((e, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getEntityColor(e.Type) }}
                      />
                      <span>{e.Entity}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">[{e.Type}]</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Linguistic & Syntactic Analysis */}
          {activeTab === 'syntax' && (
            <div className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Sentence-Level Parsing &amp; Linguistic Transformations:
              </h3>
              <div className="space-y-3">
                {results.sentences.map((sent, idx) => {
                  const sentTriples = results.triples.filter((t) => t.sentence === sent);
                  const isNegated = sent.toLowerCase().includes('no company') || sent.toLowerCase().includes('never') || sent.toLowerCase().includes('not');

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-900">Sentence {idx + 1}</span>
                        {isNegated ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            Negation Filter Triggered
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Valid Assertion
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium italic">
                        "{sent}"
                      </p>

                      <div className="pt-1">
                        <div className="text-[11px] font-semibold text-slate-500 mb-1">
                          Generated Knowledge Triples:
                        </div>
                        {sentTriples.length > 0 ? (
                          <div className="space-y-1">
                            {sentTriples.map((t, tIdx) => (
                              <div
                                key={tIdx}
                                className="p-2 rounded-xl bg-white border border-slate-200 text-xs flex items-center gap-2 font-mono"
                              >
                                <span className="text-purple-700 font-bold">{t.subject}</span>
                                <span className="text-slate-400">──[</span>
                                <span className="text-teal-700 font-bold">{t.relation}</span>
                                <span className="text-slate-400">]──►</span>
                                <span className="text-blue-700 font-bold">{t.object}</span>
                                <span className="ml-auto text-[10px] text-slate-400 uppercase font-sans">
                                  {t.syntaxPattern}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic">
                            0 triples extracted (Negated or non-relational clause).
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recorded Trials Table */}
      {trials.length > 0 && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                Recorded Experimental Trials ({trials.length})
              </h3>
              <p className="text-xs text-slate-500">
                These trials will automatically compile into Section 5 of your official Lab Report.
              </p>
            </div>
            <button
              onClick={onGoToQuiz}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Take Quiz
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Trial ID</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Sample Source</th>
                  <th className="px-4 py-3 text-center">Entities</th>
                  <th className="px-4 py-3 text-center">Triples</th>
                  <th className="px-4 py-3">Primary Relation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trials.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">{tr.id}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{tr.timestamp}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{tr.sample}</td>
                    <td className="px-4 py-3 text-center font-bold text-purple-700">{tr.entityCount}</td>
                    <td className="px-4 py-3 text-center font-bold text-teal-700">{tr.tripleCount}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{tr.topRelation}</td>
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
