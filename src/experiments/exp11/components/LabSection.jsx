import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Play, RefreshCw, Terminal, Share2, Database,
  Plus, Trash2, CheckCircle2, AlertCircle, AlertTriangle, Sparkles,
  ChevronRight, ZoomIn, ZoomOut, RotateCcw, Copy, Check, Download,
  Layers, ShieldAlert, ShieldCheck, Activity, BarChart2, Eye, FileCode
} from 'lucide-react';
import {
  DOMAINS,
  ERRORS_DATASET,
  validateKnowledgeGraph,
  generateCypherImportScript,
  executePatternQuery,
  getDomainGraphData
} from '../schemaDesignEngine';

// Node label color mapping
const LABEL_COLORS = {
  Student: '#4f46e5',      // indigo
  Course: '#059669',       // emerald
  Faculty: '#d97706',      // amber
  Department: '#0284c7',   // sky
  Project: '#7c3aed',      // violet
  User: '#4f46e5',
  Product: '#059669',
  Category: '#0284c7',
  Order: '#d97706',
  Patient: '#4f46e5',
  Doctor: '#d97706',
  Condition: '#dc2626',    // red
  Medication: '#059669',
  Movie: '#7c3aed',
  Person: '#4f46e5',
  Genre: '#0284c7',
  Book: '#059669',
  Author: '#d97706',
  Member: '#4f46e5',
  Loan: '#dc2626'
};

const getLabelColor = (label) => LABEL_COLORS[label] || '#64748b';

export default function LabSection({ onRecordTrial, trials = [], onGoToQuiz }) {
  // Domain & Dataset selection
  const [selectedDomainKey, setSelectedDomainKey] = useState('University');
  const [useErrorDataset, setUseErrorDataset] = useState(false);
  const [activeTab, setActiveTab] = useState('modeler'); // 'modeler' | 'ingestion' | 'visualizer' | 'cypher'

  // Custom schema extension state
  const [customNodeLabel, setCustomNodeLabel] = useState('');
  const [customNodeKey, setCustomNodeKey] = useState('');
  const [customNodeProps, setCustomNodeProps] = useState('');
  const [schemaCustomNodes, setSchemaCustomNodes] = useState([]);

  // Copied toast state
  const [copiedCode, setCopiedCode] = useState(false);

  // SVG Graph Visualization State
  const svgRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterLabel, setFilterLabel] = useState('ALL');

  // Query Playground State
  const [queryInput, setQueryInput] = useState('MATCH (s:Student)-[:ENROLLED_IN]->(c:Course) RETURN s, c');
  const [queryResult, setQueryResult] = useState(null);

  // Current domain schema and dataset
  const activeDomain = DOMAINS[selectedDomainKey] || DOMAINS.University;

  const currentSchema = useMemo(() => {
    return {
      nodes: [...activeDomain.nodes, ...schemaCustomNodes],
      relationships: [...activeDomain.relationships]
    };
  }, [activeDomain, schemaCustomNodes]);

  const currentDataset = useMemo(() => {
    if (useErrorDataset && selectedDomainKey === 'University') {
      return ERRORS_DATASET;
    }
    return {
      data: activeDomain.data,
      nodes: activeDomain.data,
      edges: activeDomain.edges
    };
  }, [useErrorDataset, selectedDomainKey, activeDomain]);

  // Validation report
  const validationReport = useMemo(() => {
    return validateKnowledgeGraph(currentSchema, currentDataset);
  }, [currentSchema, currentDataset]);

  // Generated Cypher script
  const generatedCypher = useMemo(() => {
    return generateCypherImportScript(currentSchema, selectedDomainKey);
  }, [currentSchema, selectedDomainKey]);

  // Graph data for visualizer and querying
  const graphData = useMemo(() => {
    return getDomainGraphData(selectedDomainKey, useErrorDataset);
  }, [selectedDomainKey, useErrorDataset]);

  // Node positions calculated using generously spaced multi-label layout
  const [nodePositions, setNodePositions] = useState([]);

  useEffect(() => {
    const rawNodes = graphData?.nodes || [];
    const count = rawNodes.length;
    if (count === 0) {
      setNodePositions([]);
      setSelectedNode(null);
      return;
    }

    const centerX = 530;
    const centerY = 320;

    // Group nodes by label for dedicated spatial sectors
    const labelGroups = new Map();
    rawNodes.forEach((n) => {
      if (!labelGroups.has(n.label)) labelGroups.set(n.label, []);
      labelGroups.get(n.label).push(n);
    });

    const labelsList = Array.from(labelGroups.keys());
    const labelCount = labelsList.length;

    const initialPositions = [];
    labelsList.forEach((lbl, lIdx) => {
      const groupNodes = labelGroups.get(lbl);
      const sectorAngle = (lIdx * 2 * Math.PI) / labelCount;
      const ringRadius = 260 + (lIdx % 2 === 0 ? 30 : -30);

      groupNodes.forEach((node, nIdx) => {
        const span = groupNodes.length > 1 ? (nIdx - (groupNodes.length - 1) / 2) * 0.44 : 0;
        const subAngle = sectorAngle + span;
        initialPositions.push({
          ...node,
          x: centerX + Math.cos(subAngle) * ringRadius,
          y: centerY + Math.sin(subAngle) * ringRadius
        });
      });
    });

    const nodes = initialPositions.map((n) => ({ ...n }));
    const nodeIndex = new Map(nodes.map((n, i) => [String(n.id), i]));

    // 45 iterations of safe, normalized, spaced-out relaxation
    for (let it = 0; it < 45; it++) {
      // Repulsion between all node pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 260) {
            const force = Math.min(((260 - dist) / dist) * 2.0, 7);
            const moveX = (dx / dist) * force;
            const moveY = (dy / dist) * force;
            nodes[i].x -= moveX;
            nodes[i].y -= moveY;
            nodes[j].x += moveX;
            nodes[j].y += moveY;
          }
        }
      }

      // Spring attraction along relationships
      (graphData?.edges || []).forEach((edge) => {
        const sIdx = nodeIndex.get(String(edge.source));
        const tIdx = nodeIndex.get(String(edge.target));
        if (sIdx !== undefined && tIdx !== undefined) {
          const dx = nodes[tIdx].x - nodes[sIdx].x;
          const dy = nodes[tIdx].y - nodes[sIdx].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 200;
          const force = Math.min(Math.max((dist - targetDist) * 0.04, -5), 5);
          const moveX = (dx / dist) * force;
          const moveY = (dy / dist) * force;
          nodes[sIdx].x += moveX;
          nodes[sIdx].y += moveY;
          nodes[tIdx].x -= moveX;
          nodes[tIdx].y -= moveY;
        }
      });

      // Gentle center pull & strict boundaries
      nodes.forEach((n) => {
        n.x += (centerX - n.x) * 0.02;
        n.y += (centerY - n.y) * 0.02;

        if (isNaN(n.x)) n.x = centerX;
        if (isNaN(n.y)) n.y = centerY;
        n.x = Math.max(90, Math.min(970, n.x));
        n.y = Math.max(70, Math.min(570, n.y));
      });
    }

    setNodePositions(nodes);
    setSelectedNode(nodes[0] || null);
  }, [graphData]);

  // Execute initial query when domain changes
  useEffect(() => {
    let q = 'MATCH (n) RETURN n';
    if (selectedDomainKey === 'University') {
      q = 'MATCH (s:Student)-[:ENROLLED_IN]->(c:Course) RETURN s, c';
    } else if (selectedDomainKey === 'Ecommerce') {
      q = 'MATCH (u:User)-[:PLACED]->(o:Order) RETURN u, o';
    } else if (selectedDomainKey === 'Healthcare') {
      q = 'MATCH (p:Patient)-[:DIAGNOSED_WITH]->(c:Condition) RETURN p, c';
    } else if (selectedDomainKey === 'Movies') {
      q = 'MATCH (p:Person)-[:ACTED_IN]->(m:Movie) RETURN p, m';
    } else if (selectedDomainKey === 'Library') {
      q = 'MATCH (b:Book)-[:WRITTEN_BY]->(a:Author) RETURN b, a';
    }
    setQueryInput(q);
    const res = executePatternQuery(graphData, q);
    setQueryResult(res);
  }, [selectedDomainKey, graphData]);

  const handleRunQuery = () => {
    const res = executePatternQuery(graphData, queryInput);
    setQueryResult(res);
  };

  const handleCopyCypher = () => {
    navigator.clipboard.writeText(generatedCypher);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadCypher = () => {
    const blob = new Blob([generatedCypher], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDomainKey.toLowerCase()}_import.cql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddCustomNode = (e) => {
    e.preventDefault();
    if (!customNodeLabel.trim() || !customNodeKey.trim()) return;

    const props = customNodeProps
      ? customNodeProps.split(',').map((p) => p.trim()).filter(Boolean)
      : [customNodeKey.trim()];

    const newNode = {
      label: customNodeLabel.trim(),
      key: customNodeKey.trim(),
      properties: Array.from(new Set([customNodeKey.trim(), ...props]))
    };

    setSchemaCustomNodes((prev) => [...prev, newNode]);
    setCustomNodeLabel('');
    setCustomNodeKey('');
    setCustomNodeProps('');
  };

  const handleRecordTrial = () => {
    const trialData = {
      domain: selectedDomainKey,
      isCorruptedTest: useErrorDataset,
      valid: validationReport?.valid ?? true,
      errorCount: validationReport?.errors?.length ?? 0,
      nodeCount: graphData?.nodes?.length ?? 0,
      edgeCount: graphData?.edges?.length ?? 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    if (onRecordTrial) {
      onRecordTrial(trialData);
    }
  };

  // Node position map for edge rendering
  const posMap = useMemo(() => {
    const m = new Map();
    (nodePositions || []).forEach((n) => m.set(String(n.id), n));
    return m;
  }, [nodePositions]);

  // Labels in current graph
  const availableLabels = useMemo(() => {
    const s = new Set();
    (graphData?.nodes || []).forEach((n) => s.add(n.label));
    return ['ALL', ...Array.from(s)];
  }, [graphData]);

  // Filtered nodes
  const displayNodes = useMemo(() => {
    if (filterLabel === 'ALL') return nodePositions;
    return nodePositions.filter((n) => n.label === filterLabel);
  }, [nodePositions, filterLabel]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* ── Header Controls ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold tracking-wide uppercase mb-2">
            <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
            Interactive Simulation Laboratory
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Knowledge Graph Schema Modeler &amp; Ingestion Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose an enterprise domain, validate referential integrity, preview schema relationships, and execute Cypher pattern queries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRecordTrial}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            Log Current Trial
          </button>
          <button
            onClick={onGoToQuiz}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs sm:text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer shadow-md shadow-emerald-200"
          >
            Concept Quiz <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Domain Preset Selector Bar ── */}
      <div className="glass rounded-2xl p-4 border border-white/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Database className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Domain:</span>
          <select
            value={selectedDomainKey}
            onChange={(e) => {
              setSelectedDomainKey(e.target.value);
              setUseErrorDataset(false);
              setSchemaCustomNodes([]);
            }}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {Object.keys(DOMAINS).map((dKey) => (
              <option key={dKey} value={dKey}>
                {DOMAINS[dKey].name} ({DOMAINS[dKey].nodes.length} Entity Types)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={useErrorDataset}
              onChange={(e) => {
                setUseErrorDataset(e.target.checked);
                if (e.target.checked) setSelectedDomainKey('University');
              }}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className={useErrorDataset ? 'text-red-700 font-bold' : ''}>
              Inject Referential Integrity Errors (Corrupted Test)
            </span>
          </label>
        </div>
      </div>

      {/* ── Workbench Navigation Tabs ── */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto pb-1">
        {[
          { id: 'modeler', label: '1. Domain Schema Modeler', icon: Layers },
          { id: 'ingestion', label: '2. Ingestion & Integrity', icon: ShieldCheck, badge: validationReport.valid ? 'Valid' : `${validationReport.errors.length} Errors` },
          { id: 'visualizer', label: '3. Interactive Graph Visualizer', icon: Share2 },
          { id: 'cypher', label: '4. Cypher DDL & Query Console', icon: Terminal }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer border-b-2 ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              {tab.label}
              {tab.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    validationReport.valid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 animate-pulse'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: SCHEMA MODELER ── */}
      {activeTab === 'modeler' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Entity Types (Nodes) */}
            <div className="glass rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Entity Types (Node Labels) &amp; Keys
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {currentSchema.nodes.length} Defined
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Each node carries a unique identity key used in Cypher <code>MERGE</code> statements to guarantee idempotent ingestion.
              </p>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {currentSchema.nodes.map((node, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getLabelColor(node.label) }}
                        />
                        <span className="text-xs font-bold text-slate-900">:{node.label}</span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                        Primary Key: {node.key}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {node.properties.map((prop, pIdx) => (
                        <span key={pIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                          {prop}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Entity Type Form */}
              <form onSubmit={handleAddCustomNode} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-600" /> Extend Schema with New Entity Label:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Label (e.g. Lab)"
                    value={customNodeLabel}
                    onChange={(e) => setCustomNodeLabel(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Key (e.g. lab_id)"
                    value={customNodeKey}
                    onChange={(e) => setCustomNodeKey(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Extra Properties (comma separated)"
                  value={customNodeProps}
                  onChange={(e) => setCustomNodeProps(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer"
                >
                  Register Entity Label
                </button>
              </form>
            </div>

            {/* Relationship Signatures */}
            <div className="glass rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  Relationship Types &amp; Signatures
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {currentSchema.relationships.length} Signatures
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Relationships connect a source entity to a target entity and can hold edge attributes like grades or roles.
              </p>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {currentSchema.relationships.map((rel, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono">
                          (:{rel.source})
                        </span>
                        <span className="text-slate-400 font-mono">&mdash;[</span>
                        <span className="text-emerald-700 font-mono font-bold">:{rel.type}</span>
                        <span className="text-slate-400 font-mono">]&rarr;</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono">
                          (:{rel.target})
                        </span>
                      </div>
                    </div>
                    {rel.properties && rel.properties.length > 0 ? (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span>Edge Properties:</span>
                        {rel.properties.map((p, pIdx) => (
                          <span key={pIdx} className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 italic">No edge properties</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: INGESTION & INTEGRITY CHECKER ── */}
      {activeTab === 'ingestion' && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div
            className={`p-5 rounded-3xl border flex items-start gap-4 ${
              validationReport.valid
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-red-50/80 border-red-200 text-red-900'
            }`}
          >
            {validationReport.valid ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h3 className="text-sm font-bold">
                {validationReport.valid
                  ? 'Schema Conformance Passed: 100% Referential Integrity Verified'
                  : `Referential Integrity Violations Detected (${validationReport.errors.length} Issues)`}
              </h3>
              <p className="text-xs text-slate-600">
                {validationReport.valid
                  ? 'All node records have registered primary keys. All relationship records reference existing source and target keys matching the formal schema definition.'
                  : 'Automated graph linting detected invalid records. Ingesting these without remediation would result in dangling edges and broken traversals.'}
              </p>
            </div>
          </div>

          {/* Validation Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-2xl border border-white/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Entity Records</span>
              <p className="text-xl font-extrabold text-slate-800 mt-1">{validationReport?.nodeCount ?? 0}</p>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Relationship Records</span>
              <p className="text-xl font-extrabold text-slate-800 mt-1">{validationReport?.edgeCount ?? 0}</p>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Missing Node Keys</span>
              <p className={`text-xl font-extrabold mt-1 ${(validationReport?.summary?.missingNodeKey || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {validationReport?.summary?.missingNodeKey || 0}
              </p>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Dangling Edges</span>
              <p className={`text-xl font-extrabold mt-1 ${((validationReport?.summary?.danglingSourceId || 0) + (validationReport?.summary?.danglingTargetId || 0)) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {(validationReport?.summary?.danglingSourceId || 0) + (validationReport?.summary?.danglingTargetId || 0)}
              </p>
            </div>
          </div>

          {/* Error Diagnostics Table if any */}
          {(validationReport?.errors?.length || 0) > 0 && (
            <div className="glass rounded-3xl p-6 border border-white/80 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Detailed Diagnostic Trace &amp; Remediation Instructions
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-red-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-red-100/70 text-red-900 font-semibold border-b border-red-200">
                    <tr>
                      <th className="p-3">Violation Category</th>
                      <th className="p-3">Record Details</th>
                      <th className="p-3">Problem Description</th>
                      <th className="p-3">Recommended Fix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100 text-slate-700 bg-white">
                    {(validationReport?.errors || []).map((err, idx) => (
                      <tr key={idx} className="hover:bg-red-50/40">
                        <td className="p-3 font-bold text-red-700">{err.type}</td>
                        <td className="p-3 font-mono text-[11px]">{JSON.stringify(err.record || {})}</td>
                        <td className="p-3">{err.message}</td>
                        <td className="p-3 text-slate-600 font-medium">
                          {err.type === 'DANGLING_SOURCE_ID' && 'Ensure source entity is imported in Pass 1 before edge creation.'}
                          {err.type === 'DANGLING_TARGET_ID' && 'Ensure target entity exists in graph prior to relationship stitching.'}
                          {err.type === 'UNREGISTERED_EDGE_TYPE' && 'Declare this relationship type in schema before importing.'}
                          {err.type === 'MISSING_NODE_KEY' && 'Add non-null primary key identifier to entity payload.'}
                          {err.type === 'UNREGISTERED_LABEL' && 'Register label in domain model schema.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw Dataset Preview */}
          <div className="glass rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              Tabular Dataset Preview (Simulated Source Tables)
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">Sample Ingested Entities (Pass 1)</span>
                <div className="p-3 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono max-h-60 overflow-y-auto">
                  <pre>{JSON.stringify(currentDataset.nodes, null, 2)}</pre>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">Sample Ingested Relationships (Pass 2)</span>
                <div className="p-3 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono max-h-60 overflow-y-auto">
                  <pre>{JSON.stringify(currentDataset.edges, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: INTERACTIVE GRAPH VISUALIZER ── */}
      {activeTab === 'visualizer' && (
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
            {/* Visualizer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Filter by Label:</span>
                <select
                  value={filterLabel}
                  onChange={(e) => setFilterLabel(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-800"
                >
                  {availableLabels.map((lbl) => (
                    <option key={lbl} value={lbl}>
                      {lbl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zoom & Pan Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.0))}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.5))}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  title="Reset View"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SVG Graph Canvas */}
            <div
              className="relative w-full h-[600px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 cursor-grab active:cursor-grabbing select-none"
              onMouseDown={(e) => {
                if (e.target.tagName === 'svg' || e.target.tagName === 'rect') {
                  setIsDraggingCanvas(true);
                  setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
                }
              }}
              onMouseMove={(e) => {
                if (draggedNodeId && svgRef.current) {
                  const rect = svgRef.current.getBoundingClientRect();
                  const scaleX = 1060 / (rect.width || 1);
                  const scaleY = 640 / (rect.height || 1);
                  const mouseX = (e.clientX - rect.left) * scaleX - panOffset.x;
                  const mouseY = (e.clientY - rect.top) * scaleY - panOffset.y;
                  setNodePositions((prev) =>
                    prev.map((n) =>
                      n.id === draggedNodeId
                        ? { ...n, x: mouseX / zoomLevel, y: mouseY / zoomLevel }
                        : n
                    )
                  );
                } else if (isDraggingCanvas) {
                  setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
                }
              }}
              onMouseUp={() => {
                setIsDraggingCanvas(false);
                setDraggedNodeId(null);
              }}
              onMouseLeave={() => {
                setIsDraggingCanvas(false);
                setDraggedNodeId(null);
              }}
            >
              <svg
                ref={svgRef}
                className="w-full h-full"
                viewBox="0 0 1060 640"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="9"
                    markerHeight="7"
                    refX="28"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 9 3.5, 0 7" fill="#64748b" />
                  </marker>
                  <marker
                    id="arrowhead-active"
                    markerWidth="10"
                    markerHeight="8"
                    refX="30"
                    refY="4"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 4, 0 8" fill="#38bdf8" />
                  </marker>
                </defs>

                <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                  {/* Edges with smooth curves & high-contrast relationship pills */}
                  {graphData.edges.map((e, idx) => {
                    const src = posMap.get(String(e.source));
                    const tgt = posMap.get(String(e.target));
                    if (!src || !tgt) return null;

                    // If filter is active, check if either node is visible
                    const isVisible =
                      filterLabel === 'ALL' ||
                      src.label === filterLabel ||
                      tgt.label === filterLabel;

                    if (!isVisible) return null;

                    const isIncident =
                      selectedNode &&
                      (String(selectedNode.id) === String(src.id) ||
                        String(selectedNode.id) === String(tgt.id));
                    const hasActiveSelection = Boolean(selectedNode);

                    const dx = tgt.x - src.x;
                    const dy = tgt.y - src.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const nx = -dy / dist;
                    const ny = dx / dist;

                    // Gentle curve offset to separate overlapping or reverse edges
                    const curveAmount = (idx % 2 === 0 ? 1 : -1) * (18 + (idx % 3) * 6);
                    const midX = (src.x + tgt.x) / 2 + nx * curveAmount;
                    const midY = (src.y + tgt.y) / 2 + ny * curveAmount;

                    const pathData = `M ${src.x} ${src.y} Q ${midX} ${midY} ${tgt.x} ${tgt.y}`;
                    const strokeColor = isIncident
                      ? '#38bdf8'
                      : hasActiveSelection
                      ? '#334155'
                      : '#64748b';
                    const strokeWidth = isIncident ? 2.5 : 1.6;
                    const markerUrl = isIncident ? 'url(#arrowhead-active)' : 'url(#arrowhead)';
                    const textWidth = Math.max(68, e.type.length * 7.5);

                    return (
                      <g key={idx} className="transition-opacity duration-200">
                        {/* Curved Relationship Line */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          strokeOpacity={isIncident ? 1 : hasActiveSelection ? 0.35 : 0.75}
                          markerEnd={markerUrl}
                        />

                        {/* High-Contrast Floating Pill Badge for Relationship Type */}
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x={-textWidth / 2}
                            y="-10"
                            width={textWidth}
                            height="20"
                            rx="5"
                            fill="#090d16"
                            stroke={isIncident ? '#38bdf8' : '#334155'}
                            strokeWidth={isIncident ? 1.5 : 1}
                            strokeOpacity={isIncident ? 1 : 0.85}
                            className="transition-colors shadow-sm"
                          />
                          <text
                            y="3.5"
                            fill={isIncident ? '#38bdf8' : hasActiveSelection ? '#64748b' : '#94a3b8'}
                            fontSize="10"
                            fontWeight={isIncident ? '700' : '600'}
                            fontFamily="monospace"
                            textAnchor="middle"
                            className="pointer-events-none select-none"
                          >
                            {e.type}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* Nodes with Drag Support */}
                  {displayNodes.map((n) => {
                    const isSelected = selectedNode && selectedNode.id === n.id;
                    const isMatched = queryResult?.matchedNodeIds?.has(String(n.id));
                    const nodeColor = getLabelColor(n.label);

                    return (
                      <g
                        key={n.id}
                        transform={`translate(${n.x}, ${n.y})`}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setSelectedNode(n);
                          setDraggedNodeId(n.id);
                        }}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        {/* Match or Selection Glow Ring */}
                        {(isSelected || isMatched) && (
                          <circle
                            r="28"
                            fill="none"
                            stroke={isSelected ? '#38bdf8' : '#34d399'}
                            strokeWidth="3"
                            strokeDasharray={isMatched && !isSelected ? '4 3' : 'none'}
                            className="animate-pulse"
                          />
                        )}

                        {/* Node Outer Border */}
                        <circle
                          r="20"
                          fill={nodeColor}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          className="shadow-md"
                        />

                        {/* Label Badge Initials inside Node */}
                        <text
                          y="4"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="pointer-events-none select-none font-sans"
                        >
                          {n.label.substring(0, 2).toUpperCase()}
                        </text>

                        {/* Node Title / Name Label Underneath */}
                        <g transform="translate(0, 32)">
                          <rect
                            x={-Math.max(40, ((n.name || n.title || n.id).length * 6) / 2 + 6)}
                            y="-9"
                            width={Math.max(40, ((n.name || n.title || n.id).length * 6) + 12)}
                            height="18"
                            rx="4"
                            fill="#090d16"
                            fillOpacity="0.85"
                            stroke="#1e293b"
                            strokeWidth="0.8"
                          />
                          <text
                            y="3.5"
                            fill="#f8fafc"
                            fontSize="10"
                            fontWeight="600"
                            textAnchor="middle"
                            className="pointer-events-none select-none font-sans"
                          >
                            {n.name || n.title || n.id}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Color Legend Overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 flex flex-wrap gap-3 text-xs">
                {availableLabels
                  .filter((lbl) => lbl !== 'ALL')
                  .map((lbl) => (
                    <div key={lbl} className="flex items-center gap-1.5 text-slate-300">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getLabelColor(lbl) }}
                      />
                      <span>:{lbl}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Selected Node Details Card */}
            {selectedNode && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getLabelColor(selectedNode.label) }}
                    />
                    <span className="text-sm font-bold text-slate-900">
                      {selectedNode.name || selectedNode.title || selectedNode.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                      :{selectedNode.label}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">ID: {selectedNode.id}</span>
                </div>

                <div className="grid sm:grid-cols-3 gap-2 pt-1 text-xs">
                  {Object.entries(selectedNode)
                    .filter(([k]) => !['x', 'y', 'vx', 'vy'].includes(k))
                    .map(([k, v]) => (
                      <div key={k} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400">{k}</span>
                        <p className="font-semibold text-slate-800 truncate">{String(v)}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: CYPHER DDL & QUERY CONSOLE ── */}
      {activeTab === 'cypher' && (
        <div className="space-y-6">
          {/* Cypher Query Runner */}
          <div className="glass rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600" />
                Declarative Cypher Pattern Query Console
              </h3>
              <span className="text-xs text-slate-500">In-Memory Graph Query Execution</span>
            </div>

            {/* Preset Query Pickers */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Sample Cypher Patterns:</span>
              {[
                { label: 'All Nodes', q: 'MATCH (n) RETURN n' },
                { label: 'Filter Label', q: `MATCH (n:${currentSchema.nodes[0]?.label || 'Student'}) RETURN n` },
                {
                  label: 'Traverse Edges',
                  q: currentSchema.relationships[0]
                    ? `MATCH (a)-[:${currentSchema.relationships[0].type}]->(b) RETURN a, b`
                    : 'MATCH (n) RETURN n'
                }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQueryInput(preset.q);
                    const res = executePatternQuery(graphData, preset.q);
                    setQueryResult(res);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
                placeholder="MATCH (s:Student)-[:ENROLLED_IN]->(c:Course) RETURN s, c"
                className="flex-1 bg-slate-900 text-emerald-400 font-mono text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleRunQuery}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer transition"
              >
                <Play className="w-3.5 h-3.5" /> Execute
              </button>
            </div>

            {/* Results Table */}
            {queryResult && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span>Query Output ({queryResult.rows?.length || 0} Records Returned)</span>
                  {queryResult.matchedNodeIds && (
                    <span className="text-emerald-700">
                      {queryResult.matchedNodeIds.size} Graph Nodes Highlighted
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        {queryResult.headers.map((h, hIdx) => (
                          <th key={hIdx} className="p-3">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {queryResult.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 truncate max-w-xs">
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Generated Cypher Ingestion Script (DDL) */}
          <div className="glass rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-600" />
                Production Cypher Ingestion Script (LOAD CSV / MERGE DDL)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCypher}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied!' : 'Copy Script'}
                </button>
                <button
                  onClick={handleDownloadCypher}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download .cql
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Run this script directly in the Neo4j Browser or Cypher Shell to provision uniqueness constraints and batch-merge data.
            </p>

            <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
              <pre>{generatedCypher}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ── Experimental Trials Session Log ── */}
      <div className="glass rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            Session Trial Log Book ({trials.length} Recorded)
          </h3>
          <span className="text-xs text-slate-400">Captured in Local Browser Session</span>
        </div>

        {trials.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50/60 border border-slate-200/60 text-slate-400 text-xs">
            No experimental trials logged yet. Click &quot;Log Current Trial&quot; in the header above to record schema models and integrity checks.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Domain</th>
                  <th className="p-3">Dataset Mode</th>
                  <th className="p-3">Nodes</th>
                  <th className="p-3">Edges</th>
                  <th className="p-3">Validation Status</th>
                  <th className="p-3">Errors Caught</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {trials.map((tr, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold">{idx + 1}</td>
                    <td className="p-3">{tr.timestamp}</td>
                    <td className="p-3 font-semibold">{tr.domain}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tr.isCorruptedTest ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                        {tr.isCorruptedTest ? 'Corrupted Injected' : 'Standard Conforming'}
                      </span>
                    </td>
                    <td className="p-3">{tr.nodeCount}</td>
                    <td className="p-3">{tr.edgeCount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tr.valid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {tr.valid ? 'PASSED' : 'VIOLATIONS'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-red-600">{tr.errorCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
