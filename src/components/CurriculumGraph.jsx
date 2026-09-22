import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
  Layers,
  Info,
  Maximize2,
  ExternalLink,
  ChevronRight,
  GitFork
} from 'lucide-react';
import { EXPERIMENTS_LIST, GRAPH_EDGES, EXPERIMENT_TRACKS } from '../data/experimentsData';

export default function CurriculumGraph({ onSelectExperiment, onLaunchExp15 }) {
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);

  // Layout parameters
  const NODE_WIDTH = 220;
  const NODE_HEIGHT = 110;
  const COL_WIDTH = 300;
  const ROW_HEIGHT = 150;
  const PADDING_X = 60;
  const PADDING_Y = 60;

  // Node position mapping (col, row coordinates mapped to pixel values)
  const nodePositions = useMemo(() => {
    const map = {};
    EXPERIMENTS_LIST.forEach(exp => {
      const x = PADDING_X + exp.graphPos.col * COL_WIDTH;
      const y = PADDING_Y + exp.graphPos.row * ROW_HEIGHT;
      map[exp.number] = { x, y, ...exp };
    });
    return map;
  }, []);

  // Compute active relationships when a node is hovered
  const activeRelations = useMemo(() => {
    if (!hoveredNodeId) return null;
    const prereqs = new Set();
    const dependents = new Set();
    const activeEdgeKeys = new Set();

    GRAPH_EDGES.forEach(edge => {
      if (edge.to === hoveredNodeId) {
        prereqs.add(edge.from);
        activeEdgeKeys.add(`${edge.from}->${edge.to}`);
      }
      if (edge.from === hoveredNodeId) {
        dependents.add(edge.to);
        activeEdgeKeys.add(`${edge.from}->${edge.to}`);
      }
    });

    return { prereqs, dependents, activeEdgeKeys };
  }, [hoveredNodeId]);

  // Track colors
  const trackColors = {
    foundations: { border: 'border-indigo-300', bg: 'bg-indigo-50/70', badge: 'bg-indigo-100 text-indigo-700', stroke: '#6366f1' },
    graphs: { border: 'border-teal-300', bg: 'bg-teal-50/70', badge: 'bg-teal-100 text-teal-700', stroke: '#0d9488' },
    semantic: { border: 'border-purple-300', bg: 'bg-purple-50/70', badge: 'bg-purple-100 text-purple-700', stroke: '#9333ea' },
    evaluation: { border: 'border-rose-300', bg: 'bg-rose-50/70', badge: 'bg-rose-100 text-rose-700', stroke: '#e11d48' },
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 1.4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.65));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="relative w-full rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* ── Graph Header & Toolbar ── */}
      <div className="px-5 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-white/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <GitFork className="w-4 h-4 rotate-90" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">
              Curriculum Prerequisite Graph
            </h4>
            <p className="text-[11px] text-slate-500">
              Directed DAG layout: A → B denotes module A is a prerequisite for module B.
            </p>
          </div>
        </div>

        {/* Legend & Zoom controls */}
        <div className="flex items-center gap-3">
          {/* Edge meaning legend */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="font-mono text-indigo-600 font-bold">A</span>
            <span className="text-slate-400 font-bold">──▶</span>
            <span className="font-mono text-emerald-600 font-bold">B</span>
            <span className="text-[11px] text-slate-500 font-normal">
              (A prerequisite to B)
            </span>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 shadow-xs">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-semibold text-slate-500 px-1.5">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable Canvas Container ── */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto overflow-y-auto p-4 sm:p-6 bg-radial from-slate-50/50 via-slate-100/30 to-slate-200/20 scrollbar-thin cursor-grab active:cursor-grabbing select-none"
        style={{ minHeight: '620px' }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.15s ease-out',
            width: '2520px',
            height: '740px',
            position: 'relative'
          }}
        >
          {/* ── SVG Edges Layer ── */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              {/* Default arrow marker */}
              <marker
                id="arrow-default"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
              </marker>

              {/* Active outgoing arrow marker */}
              <marker
                id="arrow-outgoing"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669" />
              </marker>

              {/* Active incoming arrow marker */}
              <marker
                id="arrow-incoming"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4f46e5" />
              </marker>
            </defs>

            {/* Render all directed edges */}
            {GRAPH_EDGES.map((edge, idx) => {
              const fromNode = nodePositions[edge.from];
              const toNode = nodePositions[edge.to];
              if (!fromNode || !toNode) return null;

              const startX = fromNode.x + NODE_WIDTH;
              const startY = fromNode.y + NODE_HEIGHT / 2;
              const endX = toNode.x;
              const endY = toNode.y + NODE_HEIGHT / 2;

              // Cubic Bézier curve
              const dx = Math.max(endX - startX, 40);
              const control1X = startX + dx * 0.45;
              const control1Y = startY;
              const control2X = endX - dx * 0.45;
              const control2Y = endY;
              const pathD = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;

              // Determine edge state based on hover
              const isOutgoing = hoveredNodeId === edge.from;
              const isIncoming = hoveredNodeId === edge.to;
              const isDimmed = hoveredNodeId && !isOutgoing && !isIncoming;

              let strokeColor = '#cbd5e1';
              let strokeWidth = 1.75;
              let marker = 'url(#arrow-default)';
              let opacity = 0.85;

              if (isOutgoing) {
                strokeColor = '#059669'; // Emerald for outgoing dependencies
                strokeWidth = 3;
                marker = 'url(#arrow-outgoing)';
                opacity = 1;
              } else if (isIncoming) {
                strokeColor = '#4f46e5'; // Indigo for incoming prerequisites
                strokeWidth = 3;
                marker = 'url(#arrow-incoming)';
                opacity = 1;
              } else if (isDimmed) {
                opacity = 0.2;
              }

              return (
                <g key={`${edge.from}-${edge.to}-${idx}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isOutgoing || isIncoming ? '6 4' : 'none'}
                    markerEnd={marker}
                    opacity={opacity}
                    style={{
                      transition: 'all 0.2s ease',
                      animation: (isOutgoing || isIncoming) ? 'dash 1s linear infinite' : 'none'
                    }}
                  />
                  {/* Invisible thick hover stroke for easy clicking/hovering */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={14}
                    className="cursor-pointer pointer-events-auto"
                    onMouseEnter={() => setHoveredEdge(edge)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* ── Graph Nodes ── */}
          {EXPERIMENTS_LIST.map(exp => {
            const pos = nodePositions[exp.number];
            if (!pos) return null;

            const isHovered = hoveredNodeId === exp.number;
            const isPrereq = activeRelations?.prereqs.has(exp.number);
            const isDependent = activeRelations?.dependents.has(exp.number);
            const isDimmed = hoveredNodeId && !isHovered && !isPrereq && !isDependent;
            const trackStyle = trackColors[exp.track] || trackColors.foundations;

            return (
              <div
                key={exp.id}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${NODE_WIDTH}px`,
                  height: `${NODE_HEIGHT}px`,
                  zIndex: isHovered ? 20 : (isPrereq || isDependent) ? 15 : 10,
                  opacity: isDimmed ? 0.35 : 1,
                  transition: 'transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease',
                  transform: isHovered ? 'scale(1.04)' : 'scale(1)'
                }}
                onMouseEnter={() => setHoveredNodeId(exp.number)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={`rounded-2xl p-3.5 bg-white border cursor-pointer select-none flex flex-col justify-between shadow-xs ${isHovered
                  ? 'border-indigo-500 shadow-xl ring-2 ring-indigo-300'
                  : isPrereq
                    ? 'border-indigo-400 shadow-md ring-2 ring-indigo-200 bg-indigo-50/40'
                    : isDependent
                      ? 'border-emerald-400 shadow-md ring-2 ring-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200/90 hover:border-indigo-300 hover:shadow-md'
                  }`}
                onClick={() => {
                  if (exp.number === 15) {
                    onLaunchExp15();
                  } else {
                    onSelectExperiment(exp);
                  }
                }}
              >
                {/* Node Top Row: Number & Status Badges */}
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${trackStyle.badge}`}>
                      {exp.trackLabel}
                    </span>

                    {isPrereq ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700">
                        Prerequisite
                      </span>
                    ) : isDependent ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                        Enables
                      </span>
                    ) : null}
                  </div>

                  {/* Title */}
                  <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2" title={exp.title}>
                    {exp.shortTitle || exp.title}
                  </h5>
                </div>

                {/* Node Footer: Prereqs count & Action Prompt */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="truncate max-w-[150px]" title={exp.prerequisites.length > 0 ? exp.prerequisites.map(p => EXPERIMENTS_LIST.find(e => e.number === p)?.shortTitle || 'Module').join(', ') : 'Entry Point'}>
                    {exp.prerequisites.length === 0 ? (
                      <span className="text-slate-400">Entry Point</span>
                    ) : (
                      <span>Prereq: {exp.prerequisites.map(p => EXPERIMENTS_LIST.find(e => e.number === p)?.shortTitle || 'Module').join(', ')}</span>
                    )}
                  </span>

                  <span className="text-indigo-600 font-semibold flex items-center gap-0.5 hover:underline shrink-0">
                    {exp.number === 15 ? 'Launch' : 'Details'}
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
