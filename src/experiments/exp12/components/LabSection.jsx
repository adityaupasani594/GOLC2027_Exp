import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, FastForward, ZoomIn, ZoomOut, Maximize2,
  Database, Search, Filter, Download, Copy, Check, Info, Sparkles,
  ChevronRight, Network, ArrowRight, Layers, HelpCircle, Activity,
  Sliders, Eye, EyeOff, Compass, CheckCircle2, AlertCircle, Code2,
  Plus, Trash2, Edit3, Wand2
} from 'lucide-react';
import {
  DEFAULT_GRAPH_DATA,
  CUSTOM_GRAPH_SEED,
  DEFAULT_NODE_COORDINATES,
  LABEL_STYLES,
  getLabelStyle,
  PRESET_QUERIES,
  executeNodeLookup,
  executeOneHop,
  executeMultiHop,
  executeCustomQuery,
  resultsToCSV,
  resultsToJSON
} from '../graphQueryEngine';
import CustomGraphStudio from './CustomGraphStudio';

export default function LabSection({ onRecordTrial, trials = [], onGoToQuiz }) {
  // Graph Data State
  const [graphSource, setGraphSource] = useState('sample'); // 'sample' | 'custom'
  const [customGraph, setCustomGraph] = useState(CUSTOM_GRAPH_SEED);
  const [activeGraph, setActiveGraph] = useState(DEFAULT_GRAPH_DATA);
  const [leftPanelMode, setLeftPanelMode] = useState('query'); // 'query' | 'studio'
  const [studioSubTab, setStudioSubTab] = useState('nodes'); // 'nodes' | 'edges' | 'presets'

  // New Node Form State
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeLabel, setNewNodeLabel] = useState('Person');
  const [customLabelText, setCustomLabelText] = useState('');
  const [newNodePropKey, setNewNodePropKey] = useState('');
  const [newNodePropVal, setNewNodePropVal] = useState('');

  // New Edge Form State
  const [newEdgeSource, setNewEdgeSource] = useState('');
  const [newEdgeType, setNewEdgeType] = useState('CONNECTED_TO');
  const [newEdgeTarget, setNewEdgeTarget] = useState('');

  // Query Builder State
  const [queryMode, setQueryMode] = useState('node'); // 'node' | '1hop' | 'multihop' | 'custom'
  
  // Node Lookup params
  const [nodeLabel, setNodeLabel] = useState('(any)');
  const [propKey, setPropKey] = useState('(no filter)');
  const [operator, setOperator] = useState('>');
  const [filterValue, setFilterValue] = useState('1970');
  
  // 1-Hop Traversal params
  const [startNodeId, setStartNodeId] = useState('p5'); // Christopher Nolan
  const [relType, setRelType] = useState('DIRECTED');
  const [direction, setDirection] = useState('out'); // 'out' | 'in' | 'both'
  
  // Multi-Hop Traversal params
  const [multiStartNodeId, setMultiStartNodeId] = useState('p1'); // Keanu Reeves
  const [maxHops, setMaxHops] = useState(2);
  const [targetLabel, setTargetLabel] = useState('City');
  
  // Custom Pattern Query params
  const [customQueryText, setCustomQueryText] = useState(PRESET_QUERIES[0].query);
  const [rowLimit, setRowLimit] = useState(50);

  // Execution & Results State
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState(null);
  const [executionTimeMs, setExecutionTimeMs] = useState(12);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [resultsFilter, setResultsFilter] = useState('');

  // Graph Visualizer Canvas State
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [physicsEnabled, setPhysicsEnabled] = useState(false);

  // Animation Controls State
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationStep, setAnimationStep] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1); // 0.5 | 1 | 2
  const [animProgress, setAnimProgress] = useState(0);

  // Initialize graph nodes with fixed layout or circular auto-layout for custom nodes
  useEffect(() => {
    const total = activeGraph.nodes.length || 1;
    const rawNodes = activeGraph.nodes.map((n, idx) => {
      if (DEFAULT_NODE_COORDINATES[n.id]) {
        return {
          ...n,
          x: DEFAULT_NODE_COORDINATES[n.id].x,
          y: DEFAULT_NODE_COORDINATES[n.id].y,
          vx: 0,
          vy: 0
        };
      }
      // Clean circular distribution for custom graph nodes
      const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
      const radiusX = Math.min(360, 160 + total * 20);
      const radiusY = Math.min(220, 110 + total * 15);
      return {
        ...n,
        x: Math.round(520 + radiusX * Math.cos(angle)),
        y: Math.round(270 + radiusY * Math.sin(angle)),
        vx: 0,
        vy: 0
      };
    });
    setNodes(rawNodes);
    setEdges(activeGraph.relationships);
  }, [activeGraph]);

  // Keep dropdown default node IDs valid
  useEffect(() => {
    if (activeGraph.nodes.length > 0) {
      if (!activeGraph.nodes.some(n => n.id === startNodeId)) {
        setStartNodeId(activeGraph.nodes[0].id);
      }
      if (!activeGraph.nodes.some(n => n.id === multiStartNodeId)) {
        setMultiStartNodeId(activeGraph.nodes[0].id);
      }
      if (!newEdgeSource || !activeGraph.nodes.some(n => n.id === newEdgeSource)) {
        setNewEdgeSource(activeGraph.nodes[0].id);
      }
      if (!newEdgeTarget || !activeGraph.nodes.some(n => n.id === newEdgeTarget)) {
        setNewEdgeTarget(activeGraph.nodes[1]?.id || activeGraph.nodes[0].id);
      }
    }
  }, [activeGraph]);

  // Execute initial query on mount / activeGraph change
  useEffect(() => {
    if (activeGraph.nodes.length > 0) {
      handleRunQuery();
    }
  }, [activeGraph]);

  // Available labels & property keys
  const availableLabels = useMemo(() => {
    return ['(any)', ...Array.from(new Set(activeGraph.nodes.map(n => n.label)))];
  }, [activeGraph]);

  const availablePropKeys = useMemo(() => {
    const keys = new Set();
    activeGraph.nodes.forEach(n => {
      Object.keys(n).forEach(k => {
        if (!['id', 'label', 'x', 'y', 'vx', 'vy'].includes(k)) keys.add(k);
      });
    });
    return ['(no filter)', ...Array.from(keys)];
  }, [activeGraph]);

  const availableRelTypes = useMemo(() => {
    return ['(any)', ...Array.from(new Set(activeGraph.relationships.map(r => r.type)))];
  }, [activeGraph]);

  // Live Query Preview String
  const previewQueryString = useMemo(() => {
    if (queryMode === 'node') {
      const isAny = nodeLabel === '(any)';
      if (propKey === '(no filter)') {
        return `MATCH (n${isAny ? '' : `:${nodeLabel}`})\nRETURN n\nORDER BY n.name\nLIMIT ${rowLimit}`;
      }
      return `MATCH (n${isAny ? '' : `:${nodeLabel}`})\nWHERE n.${propKey} ${operator} ${typeof filterValue === 'number' || !isNaN(filterValue) ? filterValue : `"${filterValue}"`}\nRETURN n\nORDER BY n.name\nLIMIT ${rowLimit}`;
    }
    if (queryMode === '1hop') {
      const start = activeGraph.nodes.find(n => n.id === startNodeId);
      const isAnyRel = relType === '(any)';
      const arrow = direction === 'out' ? '-[r]->' : direction === 'in' ? '<-[r]-' : '-[r]-';
      const typedArrow = isAnyRel ? arrow : arrow.replace('r', `r:${relType}`);
      return `MATCH (a:${start ? start.label : 'Node'})${typedArrow}(b)\nWHERE a.name = "${start ? start.name : ''}"\nRETURN a.name AS start, type(r) AS relationship, b.name AS neighbour, labels(b) AS label\nORDER BY neighbour ASC\nLIMIT ${rowLimit}`;
    }
    if (queryMode === 'multihop') {
      const start = activeGraph.nodes.find(n => n.id === multiStartNodeId);
      const isAnyTgt = targetLabel === '(any)';
      return `MATCH path = (a:${start ? start.label : 'Node'})-[*1..${maxHops}]-(b${isAnyTgt ? '' : `:${targetLabel}`})\nWHERE a.name = "${start ? start.name : ''}" AND b <> a\nRETURN length(path) AS hops, b.name AS endNode, path\nORDER BY hops ASC\nLIMIT ${rowLimit}`;
    }
    return customQueryText;
  }, [queryMode, nodeLabel, propKey, operator, filterValue, startNodeId, relType, direction, multiStartNodeId, maxHops, targetLabel, customQueryText, rowLimit, activeGraph]);

  // Query Execution Handler
  const handleRunQuery = () => {
    setIsExecuting(true);
    const startT = performance.now();

    setTimeout(() => {
      try {
        let res = null;
        if (queryMode === 'node') {
          const numericVal = !isNaN(Number(filterValue)) ? Number(filterValue) : filterValue;
          res = executeNodeLookup(activeGraph, nodeLabel, propKey, operator, numericVal, rowLimit);
        } else if (queryMode === '1hop') {
          res = executeOneHop(activeGraph, startNodeId, relType, direction, rowLimit);
        } else if (queryMode === 'multihop') {
          res = executeMultiHop(activeGraph, multiStartNodeId, maxHops, targetLabel, rowLimit);
        } else {
          res = executeCustomQuery(activeGraph, customQueryText);
        }

        const endT = performance.now();
        setExecutionTimeMs(Math.max(4, Math.round(endT - startT)));
        setResults(res);
        setIsExecuting(false);

        // Reset animation sequence for newly executed query
        setAnimationStep(0);
        setIsAnimating(true);
      } catch (err) {
        setResults({
          mode: 'Error',
          query: previewQueryString,
          columns: ['Error Message'],
          rows: [{ 'Error Message': err.message }],
          matchedNodeIds: [],
          matchedEdgeIds: [],
          summary: `Query execution error: ${err.message}`
        });
        setIsExecuting(false);
      }
    }, 150);
  };

  // Traversal Step Animation Timer
  useEffect(() => {
    if (!isAnimating || !results || results.matchedNodeIds?.length === 0) return;

    const intervalMs = Math.round(1400 / animationSpeed);
    const timer = setInterval(() => {
      setAnimationStep(prev => {
        const maxSteps = results.mode === 'Multi-Hop Traversal' ? (maxHops + 1) : 3;
        if (prev >= maxSteps) {
          return 0; // Loop animation smoothly
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isAnimating, results, animationSpeed, maxHops]);

  // Handle Recording Trial for Report
  const handleRecordTrial = () => {
    if (!results) return;
    const trialObj = {
      trialId: `TR-KG-${String(trials.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toLocaleTimeString(),
      mode: results.mode,
      query: results.query,
      rowCount: results.rows.length,
      matchedNodesCount: results.matchedNodeIds.length,
      matchedEdgesCount: results.matchedEdgeIds.length,
      executionTimeMs,
      summary: results.summary
    };
    if (onRecordTrial) {
      onRecordTrial(trialObj);
    }
  };

  // Filtered rows for results table
  const filteredRows = useMemo(() => {
    if (!results || !results.rows) return [];
    if (!resultsFilter.trim()) return results.rows;
    const q = resultsFilter.toLowerCase();
    return results.rows.filter(r =>
      Object.values(r).some(val => String(val).toLowerCase().includes(q))
    );
  }, [results, resultsFilter]);

  // Export handlers
  const handleDownloadCSV = () => {
    if (!results) return;
    const csvStr = resultsToCSV(results.rows, results.columns);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KG_Query_Results_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    if (!results) return;
    const jsonStr = resultsToJSON(results.rows);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KG_Query_Results_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Graph Studio Handlers for Custom Graph Creation
  const handleAddNode = ({ name, label, propKey, propVal }) => {
    if (!name?.trim()) return;
    const newId = `node_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
    const nodeObj = {
      id: newId,
      label: label?.trim() || 'Entity',
      name: name.trim(),
    };
    if (propKey && propVal) {
      const val = !isNaN(Number(propVal)) ? Number(propVal) : propVal;
      nodeObj[propKey.trim()] = val;
    }
    const updated = {
      ...customGraph,
      nodes: [...customGraph.nodes, nodeObj]
    };
    setCustomGraph(updated);
    if (graphSource === 'custom') {
      setActiveGraph(updated);
    }
  };

  const handleDeleteNode = (nodeId) => {
    const updatedNodes = customGraph.nodes.filter(n => n.id !== nodeId);
    const updatedEdges = customGraph.relationships.filter(r => r.source !== nodeId && r.target !== nodeId);
    const updated = {
      nodes: updatedNodes,
      relationships: updatedEdges
    };
    setCustomGraph(updated);
    if (graphSource === 'custom') {
      setActiveGraph(updated);
    }
  };

  const handleAddEdge = ({ source, target, type }) => {
    if (!source || !target || !type?.trim()) return;
    const cleanType = type.trim().toUpperCase().replace(/\s+/g, '_');
    const newId = `edge_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
    const edgeObj = {
      id: newId,
      source,
      target,
      type: cleanType,
      properties: {}
    };
    const updated = {
      ...customGraph,
      relationships: [...customGraph.relationships, edgeObj]
    };
    setCustomGraph(updated);
    if (graphSource === 'custom') {
      setActiveGraph(updated);
    }
  };

  const handleDeleteEdge = (edgeId) => {
    const updatedEdges = customGraph.relationships.filter(r => r.id !== edgeId);
    const updated = {
      ...customGraph,
      relationships: updatedEdges
    };
    setCustomGraph(updated);
    if (graphSource === 'custom') {
      setActiveGraph(updated);
    }
  };

  const handleLoadPreset = (key) => {
    if (key === 'starter') {
      setCustomGraph(CUSTOM_GRAPH_SEED);
      if (graphSource === 'custom') setActiveGraph(CUSTOM_GRAPH_SEED);
    } else if (key === 'pioneers') {
      const pioneers = {
        nodes: [
          { id: 'cs1', label: 'Person', name: 'Ada Lovelace', born: 1815 },
          { id: 'cs2', label: 'Person', name: 'Charles Babbage', born: 1791 },
          { id: 'cs3', label: 'Person', name: 'Alan Turing', born: 1912 },
          { id: 'cs4', label: 'Person', name: 'Tim Berners-Lee', born: 1955 },
          { id: 'cs5', label: 'Machine', name: 'Analytical Engine', year: 1837 },
          { id: 'cs6', label: 'Machine', name: 'Enigma Bombe', year: 1940 },
          { id: 'cs7', label: 'Concept', name: 'World Wide Web', year: 1989 },
          { id: 'cs8', label: 'City', name: 'London', country: 'UK' },
          { id: 'cs9', label: 'City', name: 'Cambridge', country: 'UK' },
        ],
        relationships: [
          { id: 'cr1', source: 'cs1', target: 'cs5', type: 'PROGRAMMED', properties: {} },
          { id: 'cr2', source: 'cs2', target: 'cs5', type: 'DESIGNED', properties: {} },
          { id: 'cr3', source: 'cs1', target: 'cs2', type: 'COLLABORATED_WITH', properties: {} },
          { id: 'cr4', source: 'cs3', target: 'cs6', type: 'INVENTED', properties: {} },
          { id: 'cr5', source: 'cs4', target: 'cs7', type: 'INVENTED', properties: {} },
          { id: 'cr6', source: 'cs1', target: 'cs8', type: 'BORN_IN', properties: {} },
          { id: 'cr7', source: 'cs2', target: 'cs8', type: 'BORN_IN', properties: {} },
          { id: 'cr8', source: 'cs3', target: 'cs9', type: 'STUDIED_AT', properties: {} },
          { id: 'cr9', source: 'cs4', target: 'cs8', type: 'BORN_IN', properties: {} },
        ]
      };
      setCustomGraph(pioneers);
      if (graphSource === 'custom') setActiveGraph(pioneers);
    } else if (key === 'clear') {
      const blank = { nodes: [], relationships: [] };
      setCustomGraph(blank);
      if (graphSource === 'custom') setActiveGraph(blank);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Banner & Dataset Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            Interactive Simulation Workbench
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Knowledge Graph Pattern Exploration
          </h2>
          <p className="text-xs text-slate-500">
            Write declarative graph patterns, traverse multi-hop paths, and inspect subgraphs with real-time traversal animations.
          </p>
        </div>

        {/* Dataset Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => {
              setGraphSource('sample');
              setActiveGraph(DEFAULT_GRAPH_DATA);
              setLeftPanelMode('query');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              graphSource === 'sample'
                ? 'bg-white text-indigo-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Movie Graph (16 Nodes)
          </button>
          <button
            onClick={() => {
              setGraphSource('custom');
              setActiveGraph(customGraph);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              graphSource === 'custom'
                ? 'bg-white text-indigo-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Own Graph ({customGraph.nodes.length} Nodes)
          </button>
        </div>
      </div>

      {/* Main Grid: Query Builder (Left 5 cols) & Animated Graph Visualizer (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Query Builder Controls or Graph Studio */}
        <div className="lg:col-span-5 space-y-4">
          {/* Mode Switcher Banner when in Custom Graph mode */}
          {graphSource === 'custom' && (
            <div className="p-1.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-center gap-1.5 shadow-sm">
              <button
                onClick={() => setLeftPanelMode('query')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  leftPanelMode === 'query'
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'text-indigo-600 hover:text-indigo-900'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Query Pattern Builder
              </button>
              <button
                onClick={() => setLeftPanelMode('studio')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  leftPanelMode === 'studio'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-600 hover:text-indigo-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Graph Studio ({customGraph.nodes.length}N · {customGraph.relationships.length}E)
              </button>
            </div>
          )}

          {graphSource === 'custom' && leftPanelMode === 'studio' ? (
            <CustomGraphStudio
              customGraph={customGraph}
              onAddNode={handleAddNode}
              onDeleteNode={handleDeleteNode}
              onAddEdge={handleAddEdge}
              onDeleteEdge={handleDeleteEdge}
              onLoadPreset={handleLoadPreset}
              onDone={() => {
                setLeftPanelMode('query');
                handleRunQuery();
              }}
            />
          ) : (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Query Pattern Builder
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400 font-mono">
                {activeGraph.nodes.length} Nodes · {activeGraph.relationships.length} Edges
              </span>
            </div>

            {/* Pattern Mode Selector */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'node', label: 'Node Lookup', icon: Search },
                { id: '1hop', label: '1-Hop Traversal', icon: ArrowRight },
                { id: 'multihop', label: 'Multi-Hop Paths', icon: Network },
                { id: 'custom', label: 'Raw Pattern Query', icon: Code2 }
              ].map(mode => {
                const Icon = mode.icon;
                const isActive = queryMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setQueryMode(mode.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mode Specific Controls */}
            <div className="space-y-3 pt-1">
              {queryMode === 'node' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                        Node Label
                      </label>
                      <select
                        value={nodeLabel}
                        onChange={(e) => setNodeLabel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {availableLabels.map(l => (
                          <option key={l} value={l}>{l === '(any)' ? '(any label)' : `:${l}`}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                        Property Filter
                      </label>
                      <select
                        value={propKey}
                        onChange={(e) => setPropKey(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {availablePropKeys.map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {propKey !== '(no filter)' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                          Operator
                        </label>
                        <select
                          value={operator}
                          onChange={(e) => setOperator(e.target.value)}
                          className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none"
                        >
                          {['=', '<>', '>', '>=', '<', '<=', 'CONTAINS', 'STARTS WITH'].map(op => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                          Filter Value
                        </label>
                        <input
                          type="text"
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                          placeholder="e.g. 1970 or Matrix"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {queryMode === '1hop' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                      Origin Node
                    </label>
                    <select
                      value={startNodeId}
                      onChange={(e) => setStartNodeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {activeGraph.nodes.map(n => (
                        <option key={n.id} value={n.id}>{n.name} ({n.label})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                        Relationship Type
                      </label>
                      <select
                        value={relType}
                        onChange={(e) => setRelType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
                      >
                        {availableRelTypes.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                        Edge Direction
                      </label>
                      <select
                        value={direction}
                        onChange={(e) => setDirection(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
                      >
                        <option value="out">Outgoing (a)-[r]-&gt;(b)</option>
                        <option value="in">Incoming (a)&lt;-[r]-(b)</option>
                        <option value="both">Either (a)-[r]-(b)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {queryMode === 'multihop' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                      Start Entity
                    </label>
                    <select
                      value={multiStartNodeId}
                      onChange={(e) => setMultiStartNodeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
                    >
                      {activeGraph.nodes.map(n => (
                        <option key={n.id} value={n.id}>{n.name} ({n.label})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                        Max Traversal Hops
                      </label>
                      <div className="flex gap-2">
                        {[2, 3].map(h => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setMaxHops(h)}
                            className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              maxHops === h
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            {h} Hops
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                        Target Label
                      </label>
                      <select
                        value={targetLabel}
                        onChange={(e) => setTargetLabel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
                      >
                        {availableLabels.map(l => (
                          <option key={l} value={l}>{l === '(any)' ? '(any label)' : `:${l}`}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {queryMode === 'custom' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">
                      Select Benchmark Preset
                    </label>
                  </div>
                  <select
                    onChange={(e) => {
                      const found = PRESET_QUERIES.find(p => p.title === e.target.value);
                      if (found) setCustomQueryText(found.query);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
                  >
                    {PRESET_QUERIES.map(p => (
                      <option key={p.title} value={p.title}>{p.title}</option>
                    ))}
                  </select>

                  <textarea
                    rows={4}
                    value={customQueryText}
                    onChange={(e) => setCustomQueryText(e.target.value)}
                    placeholder="MATCH (n:Person)..."
                    className="w-full p-3 rounded-2xl border border-slate-200 font-mono text-xs bg-slate-900 text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Generated Pattern Query Display */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>COMPILED PATTERN QUERY</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewQueryString);
                    setCopiedQuery(true);
                    setTimeout(() => setCopiedQuery(false), 1800);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-sans"
                >
                  {copiedQuery ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedQuery ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-3.5 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-xs border border-slate-800 overflow-x-auto leading-relaxed shadow-inner">
                {previewQueryString}
              </pre>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleRunQuery}
              disabled={isExecuting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              {isExecuting ? 'Traversing Graph...' : 'Execute Pattern Query'}
            </button>
          </div>
          )}
        </div>

        {/* Right Column: Animated Knowledge Graph Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-slate-950 border border-slate-800 p-5 shadow-xl text-white relative overflow-hidden space-y-4">
            {/* Canvas Header & Animation Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <Network className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    Dynamic Knowledge Graph Canvas
                    {results && (
                      <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-mono border border-teal-500/30">
                        {results.matchedNodeIds.length} Nodes Matched
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Interactive canvas with active step-by-step traversal flow and glowing node pulses.
                  </p>
                </div>
              </div>

              {/* Animation Play/Pause & Speed Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs">
                <button
                  onClick={() => setIsAnimating(!isAnimating)}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    isAnimating ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title={isAnimating ? 'Pause Traversal Animation' : 'Play Traversal Animation'}
                >
                  {isAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>

                <button
                  onClick={() => setAnimationStep(0)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Replay Traversal From Start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-slate-800" />

                <button
                  onClick={() => setAnimationSpeed(s => s === 1 ? 2 : s === 2 ? 0.5 : 1)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-teal-400 hover:bg-slate-800 cursor-pointer font-mono"
                  title="Cycle Animation Speed"
                >
                  {animationSpeed}x Speed
                </button>

                <div className="h-4 w-px bg-slate-800" />

                {/* Canvas Zoom Tools */}
                <button
                  onClick={() => setZoomLevel(z => Math.min(z + 0.2, 2.4))}
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(z => Math.max(z - 0.2, 0.6))}
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Fit
                </button>
              </div>
            </div>

            {/* SVG Graph Viewport */}
            <div
              className="relative w-full h-[470px] rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden border border-slate-800/80 cursor-grab active:cursor-grabbing select-none"
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
              {/* CSS Animation Keyframes for Flowing Dashes */}
              <style>{`
                @keyframes dashTravel {
                  to {
                    stroke-dashoffset: -32;
                  }
                }
                .flowing-dash {
                  animation: dashTravel 1.2s linear infinite;
                }
                @keyframes pulseRing {
                  0% { r: 20px; opacity: 0.9; }
                  100% { r: 42px; opacity: 0; }
                }
                .pulse-halo {
                  animation: pulseRing 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
                }
              `}</style>

              {activeGraph.nodes.length === 0 && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center bg-slate-950/80 backdrop-blur-xs">
                  <div className="max-w-sm p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                      <Plus className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Your Custom Graph is Empty</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Use the Custom Graph Studio on the left to add your first node, or click below to load a ready-made domain.
                    </p>
                    <div className="flex gap-2 justify-center pt-2">
                      <button
                        onClick={() => handleLoadPreset('starter')}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Load Starter Seed
                      </button>
                      <button
                        onClick={() => setLeftPanelMode('studio')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        Add Node Manually
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <svg
                className="w-full h-full"
                viewBox="0 0 1180 580"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Arrow markers */}
                  <marker
                    id="arrow-regular"
                    viewBox="0 -5 10 10"
                    refX="25"
                    refY="0"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M0,-4L8,0L0,4" fill="#475569" opacity="0.7" />
                  </marker>

                  <marker
                    id="arrow-highlighted"
                    viewBox="0 -5 10 10"
                    refX="26"
                    refY="0"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto"
                  >
                    <path d="M0,-4L8,0L0,4" fill="#14b8a6" />
                  </marker>
                </defs>

                <g
                  transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
                  style={{ transformOrigin: '590px 290px' }}
                >
                  {/* Edges */}
                  {edges.map((edge) => {
                    const src = nodes.find(n => n.id === edge.source);
                    const tgt = nodes.find(n => n.id === edge.target);
                    if (!src || !tgt) return null;

                    const isMatched = results?.matchedEdgeIds?.includes(edge.id);
                    const isFocusEdge = results?.focusNodeId && (src.id === results.focusNodeId || tgt.id === results.focusNodeId);

                    const midX = (src.x + tgt.x) / 2;
                    const midY = (src.y + tgt.y) / 2;

                    return (
                      <g key={edge.id} className="transition-all">
                        {/* Background Base Line */}
                        <line
                          x1={src.x}
                          y1={src.y}
                          x2={tgt.x}
                          y2={tgt.y}
                          stroke={isMatched ? '#14b8a6' : '#334155'}
                          strokeWidth={isMatched ? 3 : 1.5}
                          strokeOpacity={isMatched ? 1 : 0.4}
                          markerEnd={isMatched ? 'url(#arrow-highlighted)' : 'url(#arrow-regular)'}
                        />

                        {/* Animated Flowing Dashes along matched edge */}
                        {isMatched && isAnimating && (
                          <line
                            x1={src.x}
                            y1={src.y}
                            x2={tgt.x}
                            y2={tgt.y}
                            stroke="#5eead4"
                            strokeWidth={3.5}
                            strokeDasharray="6 6"
                            className="flowing-dash"
                          />
                        )}

                        {/* Edge Label Badge */}
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x={-((edge.type.length * 5) / 2 + 5)}
                            y="-9"
                            width={edge.type.length * 5 + 10}
                            height="18"
                            rx="5"
                            fill={isMatched ? '#0f766e' : '#0f172a'}
                            stroke={isMatched ? '#2dd4bf' : '#1e293b'}
                            strokeWidth="1"
                          />
                          <text
                            x="0"
                            y="3"
                            textAnchor="middle"
                            fill={isMatched ? '#ffffff' : '#94a3b8'}
                            fontSize="9"
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
                  {nodes.map((node) => {
                    const isMatched = results?.matchedNodeIds?.includes(node.id);
                    const isFocus = results?.focusNodeId === node.id;
                    const isSelected = selectedNode?.id === node.id;
                    const style = getLabelStyle(node.label);

                    const nodeOpacity = results && results.matchedNodeIds.length > 0
                      ? (isMatched ? 1 : 0.25)
                      : 1;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(isSelected ? null : node);
                        }}
                        className="cursor-pointer transition-all duration-300"
                        opacity={nodeOpacity}
                      >
                        {/* Focus / Matched Pulsing Halo */}
                        {isMatched && isAnimating && (
                          <circle
                            r="28"
                            fill="none"
                            stroke={style.color}
                            strokeWidth="2"
                            className="pulse-halo"
                          />
                        )}

                        {/* Selected Outer Ring */}
                        {isSelected && (
                          <circle
                            r="26"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="2.5"
                            className="animate-pulse"
                          />
                        )}

                        {/* Node Circle Shape */}
                        <circle
                          r={isFocus ? 22 : 18}
                          fill={style.color}
                          stroke="#ffffff"
                          strokeWidth={isMatched ? 2.5 : 1.5}
                          filter="drop-shadow(0 2px 8px rgba(0,0,0,0.6))"
                        />

                        {/* Node Type Letter Symbol */}
                        <text
                          y="4"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="black"
                        >
                          {node.label.slice(0, 1)}
                        </text>

                        {/* Node Name Label */}
                        <text
                          y="32"
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="11"
                          fontWeight="bold"
                          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.9))"
                        >
                          {node.name}
                        </text>

                        {/* Node Label underneath */}
                        <text
                          y="43"
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="8"
                          fontWeight="bold"
                        >
                          :{node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Legend Overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-[10px] space-y-1.5 pointer-events-none shadow-lg">
                <div className="font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Entity Types Palette
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {Object.entries(LABEL_STYLES).map(([lbl, st]) => (
                    <div key={lbl} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                      <span className="text-slate-300 font-semibold">{lbl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Node Inspector Drawer */}
              {selectedNode && (
                <div className="absolute top-3 right-3 w-64 bg-slate-950/95 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-xs text-white shadow-2xl space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getLabelStyle(selectedNode.label).color }}
                      />
                      <span className="font-bold text-slate-100">{selectedNode.name}</span>
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
                      Label: <span className="font-bold text-teal-400">:{selectedNode.label}</span>
                    </div>
                    <div>
                      ID: <span className="font-mono text-slate-400">{selectedNode.id}</span>
                    </div>
                    {Object.entries(selectedNode)
                      .filter(([k]) => !['id', 'label', 'name', 'x', 'y', 'vx', 'vy'].includes(k))
                      .map(([k, v]) => (
                        <div key={k}>
                          {k}: <span className="font-mono text-indigo-300 font-bold">{v}</span>
                        </div>
                      ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setQueryMode('1hop');
                        setStartNodeId(selectedNode.id);
                        setSelectedNode(null);
                      }}
                      className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-all cursor-pointer"
                    >
                      Traverse Neighbors from Here
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status / Summary Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
              <div className="flex items-center gap-2 text-slate-300">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>{results?.summary || 'Ready to run graph queries.'}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 self-end sm:self-auto">
                Execution Time: {executionTimeMs}ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table Section */}
      {results && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                {results.rows.length}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Query Results Table ({results.mode})
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredRows.length} of {results.rows.length} matched graph assertions.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {/* Table search filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={resultsFilter}
                  onChange={(e) => setResultsFilter(e.target.value)}
                  placeholder="Filter rows..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <button
                onClick={handleDownloadCSV}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>

              <button
                onClick={handleDownloadJSON}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                JSON
              </button>

              <button
                onClick={handleRecordTrial}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-500/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Record Trial
              </button>
            </div>
          </div>

          {filteredRows.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    {results.columns.map(col => (
                      <th key={col} className="px-4 py-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-400 font-bold">{rIdx + 1}</td>
                      {results.columns.map(col => (
                        <td key={col} className="px-4 py-3 font-medium text-slate-800">
                          {col === 'Label' || col === 'Neighbour Label' || col === 'End Label' ? (
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase"
                              style={{ backgroundColor: getLabelStyle(row[col]).color }}
                            >
                              :{row[col]}
                            </span>
                          ) : col === 'Relationship' ? (
                            <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold text-[11px]">
                              {row[col]}
                            </span>
                          ) : col === 'Traversal Path' ? (
                            <span className="font-mono text-xs text-indigo-950 font-bold">
                              {row[col]}
                            </span>
                          ) : (
                            <span>{row[col]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <AlertCircle className="w-7 h-7 text-amber-500 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No matching subgraphs found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                The specified pattern query matched zero entities or relationships in the active knowledge graph.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recorded Trials Section */}
      {trials.length > 0 && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                Recorded Experimental Trials ({trials.length})
              </h3>
              <p className="text-xs text-slate-500">
                These experimental query runs will automatically compile into Section 5 of your official Lab Report.
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
                  <th className="px-4 py-3">Query Mode</th>
                  <th className="px-4 py-3">Matched Rows</th>
                  <th className="px-4 py-3">Nodes</th>
                  <th className="px-4 py-3">Edges</th>
                  <th className="px-4 py-3">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trials.map((tr, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-700">{tr.trialId}</td>
                    <td className="px-4 py-3 text-slate-500">{tr.timestamp}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{tr.mode}</td>
                    <td className="px-4 py-3 font-mono font-bold text-teal-700">{tr.rowCount}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{tr.matchedNodesCount}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{tr.matchedEdgesCount}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{tr.executionTimeMs}ms</td>
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
