import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Play, RefreshCw, Terminal, Network, Database,
  Plus, Trash2, Edit3, CheckCircle2, AlertCircle, Sparkles,
  ChevronRight, ZoomIn, ZoomOut, RotateCcw, Copy, Check,
  Layers, HardDrive, ShieldAlert, ShieldCheck, Activity, BarChart2
} from 'lucide-react';
import {
  PropertyGraph,
  CypherEngine,
  PRESET_SCHEMAS,
  getLabelColor,
  LABEL_COLORS
} from '../graphDatabaseEngine';

export default function LabSection({ onRecordTrial, trials = [], onGoToQuiz }) {
  // Graph & Engine State
  const graphRef = useRef(new PropertyGraph());
  const engineRef = useRef(new CypherEngine(graphRef.current));

  const [presetKey, setPresetKey] = useState('University Academic Knowledge Graph (Default)');
  const [activeTab, setActiveTab] = useState('cypher'); // 'cypher' | 'builder' | 'graph' | 'metrics'

  // Cypher Console State
  const [cypherQuery, setCypherQuery] = useState('MATCH (s:Student)-[:ENROLLED_IN]->(c:Course) RETURN s.name, c.name, s.gpa');
  const [selectedExampleKey, setSelectedExampleKey] = useState('2. Match enrolled students and courses');
  const [queryResult, setQueryResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Visual Builder State (Add Node)
  const [newNodeLabel, setNewNodeLabel] = useState('Student');
  const [newNodeId, setNewNodeId] = useState('s_kiran');
  const [newNodeName, setNewNodeName] = useState('Kiran Patel');
  const [nodePropKey1, setNodePropKey1] = useState('dept');
  const [nodePropVal1, setNodePropVal1] = useState('CSE');
  const [nodePropKey2, setNodePropKey2] = useState('gpa');
  const [nodePropVal2, setNodePropVal2] = useState('8.80');

  // Visual Builder State (Add Rel)
  const [relSourceId, setRelSourceId] = useState('');
  const [relTargetId, setRelTargetId] = useState('');
  const [relType, setRelType] = useState('ENROLLED_IN');
  const [relPropKey, setRelPropKey] = useState('grade');
  const [relPropVal, setRelPropVal] = useState('A');

  // Node Deletion state
  const [deleteTargetId, setDeleteTargetId] = useState('');
  const [isDetachDelete, setIsDetachDelete] = useState(false);
  const [builderMessage, setBuilderMessage] = useState(null);

  // SVG Graph Visualization State
  const [graphVersion, setGraphVersion] = useState(0); // triggers re-render
  const [graphNodes, setGraphNodes] = useState([]);
  const [graphEdges, setGraphEdges] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSimulating, setIsSimulating] = useState(true);

  // Load Initial Preset on Mount
  useEffect(() => {
    graphRef.current.loadUniversityGraph();
    setGraphVersion((v) => v + 1);

    // Run initial query
    const res = engineRef.current.execute('MATCH (s:Student)-[:ENROLLED_IN]->(c:Course) RETURN s.name, c.name, s.gpa');
    setQueryResult(res);
  }, []);

  // Update Graph Nodes & Edges for SVG render
  useEffect(() => {
    const g = graphRef.current;
    const nodes = [];
    const edges = [];

    const nodeArray = Array.from(g.nodes.values());
    const count = nodeArray.length;

    nodeArray.forEach((n, idx) => {
      const angle = (idx * 2 * Math.PI) / (count || 1);
      const radius = 170 + (idx % 2 === 0 ? 30 : -20);
      const primaryLabel = Array.from(n.labels)[0] || 'Entity';

      nodes.push({
        id: n.id,
        label: n.displayName(),
        primaryLabel,
        labels: Array.from(n.labels),
        color: getLabelColor(primaryLabel),
        properties: n.properties,
        x: 350 + Math.cos(angle) * radius,
        y: 220 + Math.sin(angle) * radius,
        degree: (g.outgoing.get(n.id)?.length || 0) + (g.incoming.get(n.id)?.length || 0)
      });
    });

    g.relationships.forEach((r) => {
      edges.push({
        id: r.id,
        source: r.source,
        target: r.target,
        type: r.type,
        properties: r.properties
      });
    });

    setGraphNodes(nodes);
    setGraphEdges(edges);

    if (nodes.length > 0) {
      if (!relSourceId || !g.nodes.has(relSourceId)) setRelSourceId(nodes[0].id);
      if (!relTargetId || !g.nodes.has(relTargetId)) setRelTargetId(nodes[Math.min(1, nodes.length - 1)].id);
      if (!deleteTargetId || !g.nodes.has(deleteTargetId)) setDeleteTargetId(nodes[0].id);
    }
  }, [graphVersion]);

  // Spring Physics Layout for SVG Graph
  useEffect(() => {
    if (!isSimulating || graphNodes.length <= 1) return;

    let animId;
    let iteration = 0;
    const maxIterations = 70;

    const simulate = () => {
      iteration++;
      if (iteration > maxIterations) return;

      setGraphNodes((prevNodes) => {
        const nodes = prevNodes.map((n) => ({ ...n }));
        const nodeIndex = new Map(nodes.map((n, i) => [n.id, i]));
        const centerX = 350;
        const centerY = 220;

        // Repulsion
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 220) {
              const force = (220 - dist) / dist * 1.5;
              nodes[i].x -= dx * force * 0.04;
              nodes[i].y -= dy * force * 0.04;
              nodes[j].x += dx * force * 0.04;
              nodes[j].y += dy * force * 0.04;
            }
          }
        }

        // Spring attraction along edges
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

        // Center pull
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
  }, [graphEdges, isSimulating, graphVersion]);

  // Handle Preset Switch
  const handlePresetChange = (name) => {
    setPresetKey(name);
    const g = graphRef.current;
    if (name.includes('University')) g.loadUniversityGraph();
    else if (name.includes('Social')) g.loadSocialGraph();
    else if (name.includes('Fraud')) g.loadFraudGraph();
    else g.loadBlankGraph();

    setGraphVersion((v) => v + 1);
    setSelectedNode(null);

    // Pick first educational query from schema
    const schema = PRESET_SCHEMAS[name];
    if (schema?.cypher_examples) {
      const firstQKey = Object.keys(schema.cypher_examples)[0];
      const query = schema.cypher_examples[firstQKey];
      setSelectedExampleKey(firstQKey);
      setCypherQuery(query);
      const res = engineRef.current.execute(query);
      setQueryResult(res);
    }
  };

  // Run Cypher Query
  const handleExecuteQuery = () => {
    if (!cypherQuery.trim()) return;
    setIsExecuting(true);

    setTimeout(() => {
      const res = engineRef.current.execute(cypherQuery);
      setQueryResult(res);
      setIsExecuting(false);
      setGraphVersion((v) => v + 1);
    }, 180);
  };

  // Add Node from GUI
  const handleAddNode = () => {
    if (!newNodeId.trim()) return;
    try {
      const props = { name: newNodeName };
      if (nodePropKey1 && nodePropVal1) {
        props[nodePropKey1] = !isNaN(Number(nodePropVal1)) ? Number(nodePropVal1) : nodePropVal1;
      }
      if (nodePropKey2 && nodePropVal2) {
        props[nodePropKey2] = !isNaN(Number(nodePropVal2)) ? Number(nodePropVal2) : nodePropVal2;
      }

      graphRef.current.addNode(newNodeId, [newNodeLabel], props);
      setGraphVersion((v) => v + 1);
      setBuilderMessage({ type: 'success', text: `Node '${newNodeId}' (:${newNodeLabel}) created successfully!` });
    } catch (e) {
      setBuilderMessage({ type: 'error', text: e.message });
    }
  };

  // Add Relationship from GUI
  const handleAddRelationship = () => {
    if (!relSourceId || !relTargetId || !relType) return;
    try {
      const props = {};
      if (relPropKey && relPropVal) {
        props[relPropKey] = !isNaN(Number(relPropVal)) ? Number(relPropVal) : relPropVal;
      }
      graphRef.current.addRelationship(relSourceId, relTargetId, relType, props);
      setGraphVersion((v) => v + 1);
      setBuilderMessage({ type: 'success', text: `Relationship (${relSourceId})-[:${relType}]->(${relTargetId}) created!` });
    } catch (e) {
      setBuilderMessage({ type: 'error', text: e.message });
    }
  };

  // Delete Node from GUI
  const handleDeleteNode = () => {
    if (!deleteTargetId) return;
    const res = graphRef.current.deleteNode(deleteTargetId, isDetachDelete);
    if (res.success) {
      setBuilderMessage({ type: 'success', text: res.message });
      setGraphVersion((v) => v + 1);
      if (selectedNode?.id === deleteTargetId) setSelectedNode(null);
    } else {
      setBuilderMessage({ type: 'error', text: res.message });
    }
  };

  // Record Trial
  const handleRecordTrialAction = () => {
    const metrics = graphRef.current.getMetrics();
    const trialData = {
      id: `TR-${trials.length + 1}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      operation: activeTab === 'cypher' ? 'Cypher Execution' : 'Visual Graph Mutation',
      query: activeTab === 'cypher' ? cypherQuery : `Builder Action on Preset: ${presetKey}`,
      result: queryResult?.success ? queryResult.message : (builderMessage?.text || 'Graph State Logged'),
      status: queryResult?.success !== false ? 'SUCCESS' : 'ERROR',
      nodeCount: metrics.num_nodes,
      relCount: metrics.num_relationships,
      density: metrics.density
    };
    onRecordTrial && onRecordTrial(trialData);
  };

  const schema = PRESET_SCHEMAS[presetKey] || PRESET_SCHEMAS['University Academic Knowledge Graph (Default)'];
  const currentMetrics = graphRef.current.getMetrics();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Control Deck */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <FlaskConical className="w-3.5 h-3.5" />
              Section 2 · Property Graph Workbench
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Interactive Labeled Property Graph (LPG) Sandbox
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Execute Cypher queries, construct nodes &amp; directed relationships, and explore Index-Free Adjacency (IFA) traversals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
                setIsSimulating(true);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset Viewport"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Fit Graph</span>
            </button>
            <button
              onClick={handleRecordTrialAction}
              className="px-4 py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Database className="w-4 h-4" />
              Record Trial ({trials.length})
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Select Domain Preset Knowledge Graph:
          </label>
          <div className="grid sm:grid-cols-4 gap-2">
            {Object.keys(PRESET_SCHEMAS).map((name) => {
              const isSelected = presetKey === name;
              return (
                <button
                  key={name}
                  onClick={() => handlePresetChange(name)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50/80 border-teal-500 text-teal-950 font-bold shadow-sm ring-2 ring-teal-500/20'
                      : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs truncate">{name.replace(/\s*\(.*\)/, '')}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workbench Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {[
            { id: 'cypher', label: 'Cypher Query Console', icon: Terminal },
            { id: 'builder', label: 'Visual Graph Builder (CRUD)', icon: Plus },
            { id: 'graph', label: `Interactive Graph View (${graphNodes.length} nodes)`, icon: Network },
            { id: 'metrics', label: 'Graph Metrics & Schema', icon: BarChart2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Cypher Query Console */}
      {activeTab === 'cypher' && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Educational Cypher Examples:
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                ASCII-Art Syntax: (node)-[rel]-&gt;(node)
              </span>
            </div>

            <select
              value={selectedExampleKey}
              onChange={(e) => {
                const k = e.target.value;
                setSelectedExampleKey(k);
                const q = schema.cypher_examples[k];
                if (q) setCypherQuery(q);
              }}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white font-medium"
            >
              {Object.keys(schema.cypher_examples || {}).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Cypher Query Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider">Cypher Editor:</span>
              <span>Execution Engine: In-Memory IFA Runtime</span>
            </div>
            <textarea
              value={cypherQuery}
              onChange={(e) => setCypherQuery(e.target.value)}
              rows={3}
              placeholder="Type Cypher query (e.g., MATCH (s:Student) WHERE s.gpa >= 8.5 RETURN s.name, s.gpa)"
              className="w-full p-4 rounded-2xl border border-slate-300 bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed"
            />
          </div>

          {/* Run Action Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleExecuteQuery}
              disabled={isExecuting || !cypherQuery.trim()}
              className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing Cypher Pipeline...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Run Cypher Query
                </>
              )}
            </button>

            {queryResult && (
              <span className="text-xs font-mono text-slate-500">
                ⚡ Execution Time: <strong className="text-slate-800">{queryResult.execution_time_ms} ms</strong>
              </span>
            )}
          </div>

          {/* Results Box */}
          {queryResult && (
            <div className="space-y-3 pt-2">
              <div
                className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center gap-2 ${
                  queryResult.success
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-medium'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950 font-medium'
                }`}
              >
                {queryResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{queryResult.message}</span>
              </div>

              {queryResult.data?.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">#</th>
                        {queryResult.columns.map((col) => (
                          <th key={col} className="px-4 py-2.5">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queryResult.data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 font-mono">
                          <td className="px-4 py-2 text-slate-400 font-bold">{idx + 1}</td>
                          {queryResult.columns.map((col) => (
                            <td key={col} className="px-4 py-2 text-slate-800">
                              {String(row[col] !== undefined ? row[col] : '—')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Visual Graph Builder (GUI / No-Code CRUD) */}
      {activeTab === 'builder' && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          {builderMessage && (
            <div
              className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between ${
                builderMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                  : 'bg-rose-50 border-rose-200 text-rose-950 font-medium'
              }`}
            >
              <span>{builderMessage.text}</span>
              <button
                onClick={() => setBuilderMessage(null)}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Node Form */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-600" />
                Create Node (Entity)
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Label:
                    </label>
                    <select
                      value={newNodeLabel}
                      onChange={(e) => setNewNodeLabel(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                    >
                      {schema.node_labels.map((lbl) => (
                        <option key={lbl} value={lbl}>
                          {lbl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Node ID:
                    </label>
                    <input
                      type="text"
                      value={newNodeId}
                      onChange={(e) => setNewNodeId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Display Name:
                  </label>
                  <input
                    type="text"
                    value={newNodeName}
                    onChange={(e) => setNewNodeName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Prop 1:
                    </label>
                    <input
                      type="text"
                      placeholder="key"
                      value={nodePropKey1}
                      onChange={(e) => setNodePropKey1(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white mb-1"
                    />
                    <input
                      type="text"
                      placeholder="value"
                      value={nodePropVal1}
                      onChange={(e) => setNodePropVal1(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Prop 2:
                    </label>
                    <input
                      type="text"
                      placeholder="key"
                      value={nodePropKey2}
                      onChange={(e) => setNodePropKey2(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white mb-1"
                    />
                    <input
                      type="text"
                      placeholder="value"
                      value={nodePropVal2}
                      onChange={(e) => setNodePropVal2(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddNode}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  CREATE (:{newNodeLabel})
                </button>
              </div>
            </div>

            {/* Create Relationship Form */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-600" />
                Create Directed Relationship (Edge)
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Source Node:
                    </label>
                    <select
                      value={relSourceId}
                      onChange={(e) => setRelSourceId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                    >
                      {graphNodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.id} ({n.label})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Target Node:
                    </label>
                    <select
                      value={relTargetId}
                      onChange={(e) => setRelTargetId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                    >
                      {graphNodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.id} ({n.label})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Relationship Type:
                  </label>
                  <select
                    value={relType}
                    onChange={(e) => setRelType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                  >
                    {schema.rel_types.map((t) => (
                      <option key={t} value={t}>
                        [:{t}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Property Key:
                    </label>
                    <input
                      type="text"
                      value={relPropKey}
                      onChange={(e) => setRelPropKey(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Property Value:
                    </label>
                    <input
                      type="text"
                      value={relPropVal}
                      onChange={(e) => setRelPropVal(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddRelationship}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  CREATE (source)-[:{relType}]-&gt;(target)
                </button>
              </div>
            </div>
          </div>

          {/* Delete Node Section with Referential Integrity Alert */}
          <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Referential Integrity &amp; Deletion Guard:
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={deleteTargetId}
                onChange={(e) => setDeleteTargetId(e.target.value)}
                className="w-full sm:w-64 p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
              >
                {graphNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.id} ({n.label})
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDetachDelete}
                  onChange={(e) => setIsDetachDelete(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold">DETACH DELETE (Strip attached relationships)</span>
              </label>

              <button
                onClick={handleDeleteNode}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDetachDelete ? 'DETACH DELETE' : 'DELETE'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Note: Executing plain <code>DELETE</code> on a node with active relationships will deliberately trigger a referential integrity exception to simulate real Neo4j engine behavior!
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive SVG Graph View */}
      {activeTab === 'graph' && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div>
              <strong className="text-slate-900">{graphNodes.length}</strong> Nodes ·{' '}
              <strong className="text-slate-900">{graphEdges.length}</strong> Directed Relationships
            </div>
            <div className="flex items-center gap-1.5">
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
            className="relative w-full h-[480px] rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={(e) => {
              setIsDraggingCanvas(true);
              setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
            }}
            onMouseMove={(e) => {
              if (isDraggingCanvas) {
                setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
              }
            }}
            onMouseUp={() => setIsDraggingCanvas(false)}
            onMouseLeave={() => setIsDraggingCanvas(false)}
          >
            <svg className="w-full h-full" viewBox="0 0 700 440" preserveAspectRatio="xMidYMid meet">
              <defs>
                <marker id="edge-arrow" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M0,-5L10,0L0,5" fill="#94a3b8" />
                </marker>
                <marker id="edge-arrow-active" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0,-5L10,0L0,5" fill="#14b8a6" />
                </marker>
              </defs>

              <g
                transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
                style={{ transformOrigin: '350px 220px' }}
              >
                {/* Edges */}
                {graphEdges.map((edge) => {
                  const s = graphNodes.find((n) => n.id === edge.source);
                  const t = graphNodes.find((n) => n.id === edge.target);
                  if (!s || !t) return null;

                  const isHighlighted =
                    selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);

                  const midX = (s.x + t.x) / 2;
                  const midY = (s.y + t.y) / 2;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={s.x}
                        y1={s.y}
                        x2={t.x}
                        y2={t.y}
                        stroke={isHighlighted ? '#14b8a6' : '#475569'}
                        strokeWidth={isHighlighted ? 2.5 : 1.5}
                        markerEnd={isHighlighted ? 'url(#edge-arrow-active)' : 'url(#edge-arrow)'}
                      />
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x={-((edge.type.length * 5) / 2 + 4)}
                          y="-8"
                          width={edge.type.length * 5 + 8}
                          height="16"
                          rx="4"
                          fill="#1e293b"
                          stroke={isHighlighted ? '#14b8a6' : '#334155'}
                        />
                        <text
                          y="3"
                          textAnchor="middle"
                          fill={isHighlighted ? '#2dd4bf' : '#cbd5e1'}
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {edge.type}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Nodes */}
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
                      className="cursor-pointer"
                      opacity={isFaded ? 0.3 : 1}
                    >
                      {isSelected && (
                        <circle r="26" fill="none" stroke={node.color} strokeWidth="2" className="animate-pulse" />
                      )}
                      <circle
                        r="18"
                        fill={node.color}
                        stroke="#ffffff"
                        strokeWidth="2"
                        filter="drop-shadow(0 2px 5px rgba(0,0,0,0.5))"
                      />
                      <text y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                        {node.primaryLabel.slice(0, 1)}
                      </text>
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
                      <text y="42" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="600">
                        :{node.primaryLabel}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Selected Node Details Drawer */}
            {selectedNode && (
              <div className="absolute top-3 right-3 w-64 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-xs text-white shadow-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedNode.color }} />
                    <span className="font-bold">{selectedNode.label}</span>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white cursor-pointer">
                    ✕
                  </button>
                </div>

                <div className="space-y-1 text-slate-300">
                  <div>
                    ID: <span className="font-mono text-teal-400">{selectedNode.id}</span>
                  </div>
                  <div>
                    Labels: <span className="font-mono">{selectedNode.labels.join(', ')}</span>
                  </div>
                  <div>
                    Degree (IFA pointers): <span className="font-mono">{selectedNode.degree} connections</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Properties:</span>
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    {Object.entries(selectedNode.properties).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500">{k}:</span>
                        <span>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Graph Metrics & Schema Inspector */}
      {activeTab === 'metrics' && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total Nodes (|V|)', val: currentMetrics.num_nodes, color: 'text-indigo-600' },
              { label: 'Total Relationships (|E|)', val: currentMetrics.num_relationships, color: 'text-teal-600' },
              { label: 'Graph Density', val: currentMetrics.density, color: 'text-purple-600' },
              { label: 'Average Degree', val: currentMetrics.avg_degree, color: 'text-blue-600' },
              { label: 'Isolated Nodes', val: currentMetrics.isolated_nodes, color: 'text-amber-600' }
            ].map(({ label, val, color }) => (
              <div key={label} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-center">
                <div className={`text-xl sm:text-2xl font-black ${color}`}>{val}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Node Labels ({currentMetrics.num_labels}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentMetrics.labels.map((lbl) => (
                  <span
                    key={lbl}
                    className="px-3 py-1 rounded-xl text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: getLabelColor(lbl) }}
                  >
                    :{lbl}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Relationship Types ({currentMetrics.num_rel_types}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentMetrics.rel_types.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-white border border-slate-300 text-slate-800 shadow-sm"
                  >
                    [:{type}]
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recorded Trials Table */}
      {trials.length > 0 && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600" />
                Experimental Run History &amp; Trial Log ({trials.length})
              </h3>
              <p className="text-xs text-slate-500">
                Logged trials are automatically compiled into Section 3 of your official examination report.
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
                  <th className="px-4 py-3">Trial #</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Operation</th>
                  <th className="px-4 py-3">Query / Action</th>
                  <th className="px-4 py-3">Execution Result</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trials.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono font-bold text-teal-600">{tr.id}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{tr.timestamp}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{tr.operation}</td>
                    <td className="px-4 py-3 font-mono text-slate-700 max-w-xs truncate">{tr.query}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{tr.result}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600">{tr.status}</td>
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
