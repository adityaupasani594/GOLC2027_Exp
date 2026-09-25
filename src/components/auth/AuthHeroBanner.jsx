import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Network } from 'lucide-react';
import collegeLogo from '../../image.png';

/**
 * Beautiful, Elegant Knowledge Graph & Information Retrieval Constellation
 * Clean, modern, mesmerizing animation without clutter or telemetry widgets.
 */
function ElegantGraphAnimation() {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Semantic Graph Nodes in balanced geometric harmony
  const nodes = [
    { id: 'query', label: 'Query', x: 50, y: 50, r: 8, color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)', core: '#ffffff', pulse: 2.4 },
    { id: 'doc1', label: 'Document', x: 26, y: 28, r: 6, color: '#818cf8', glow: 'rgba(129, 140, 248, 0.35)', core: '#e0e7ff', pulse: 3.1 },
    { id: 'vector', label: 'Vector Space', x: 74, y: 26, r: 5.5, color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.35)', core: '#cffafe', pulse: 2.8 },
    { id: 'entity', label: 'Entity Node', x: 80, y: 68, r: 6, color: '#c084fc', glow: 'rgba(192, 132, 252, 0.35)', core: '#f3e8ff', pulse: 3.4 },
    { id: 'kg', label: 'Knowledge Graph', x: 20, y: 72, r: 5.5, color: '#ec4899', glow: 'rgba(236, 72, 153, 0.35)', core: '#fce7f3', pulse: 3.0 },
    { id: 'semantic', label: 'Semantic Context', x: 50, y: 84, r: 5, color: '#34d399', glow: 'rgba(52, 211, 153, 0.35)', core: '#d1fae5', pulse: 2.6 },
  ];

  // Smooth connections between nodes
  const edges = [
    { from: 'query', to: 'doc1', color: '#818cf8', duration: 2.6, delay: 0 },
    { from: 'query', to: 'vector', color: '#06b6d4', duration: 2.4, delay: 0.5 },
    { from: 'query', to: 'entity', color: '#c084fc', duration: 3.0, delay: 1.0 },
    { from: 'query', to: 'kg', color: '#ec4899', duration: 2.8, delay: 0.3 },
    { from: 'query', to: 'semantic', color: '#34d399', duration: 2.5, delay: 1.2 },
    { from: 'doc1', to: 'vector', color: '#6366f1', duration: 3.4, delay: 0.8 },
    { from: 'entity', to: 'semantic', color: '#a855f7', duration: 3.1, delay: 0.2 },
    { from: 'kg', to: 'semantic', color: '#10b981', duration: 3.3, delay: 1.4 },
    { from: 'doc1', to: 'kg', color: '#818cf8', duration: 3.6, delay: 0.9, dashed: true },
    { from: 'vector', to: 'entity', color: '#c084fc', duration: 3.5, delay: 0.6, dashed: true },
  ];

  const getNode = (id) => nodes.find(n => n.id === id);

  return (
    <div className="relative w-full rounded-3xl bg-slate-950/60 border border-indigo-500/20 backdrop-blur-xl overflow-hidden p-6 sm:p-8 flex items-center justify-center shadow-2xl shadow-indigo-950/40">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-cyan-500/20 via-indigo-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Canvas with Smooth Breathing Animation */}
      <motion.div
        animate={{ y: [-4, 5, -4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-full max-w-sm h-64 sm:h-72"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full select-none overflow-visible">
          <defs>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Concentric Rotating Orbital Rings */}
          <motion.circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="url(#orbitGrad)"
            strokeWidth="0.8"
            strokeDasharray="4 8"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '50px 50px' }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="24"
            fill="none"
            stroke="#818cf8"
            strokeWidth="0.6"
            strokeDasharray="2 6"
            strokeOpacity="0.3"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '50px 50px' }}
          />

          {/* Central Pulsing Radiant Aura */}
          <motion.circle
            cx="50"
            cy="50"
            r="16"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeOpacity="0.6"
            animate={{ r: [12, 28], opacity: [0.7, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut' }}
          />

          {/* Edge Lines */}
          {edges.map((edge, idx) => {
            const src = getNode(edge.from);
            const dst = getNode(edge.to);
            if (!src || !dst) return null;

            const isHovered = hoveredNode === edge.from || hoveredNode === edge.to;

            return (
              <g key={idx}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke={edge.color}
                  strokeWidth={isHovered ? 1.6 : 0.9}
                  strokeOpacity={isHovered ? 0.85 : 0.35}
                  strokeDasharray={edge.dashed ? '2 3' : 'none'}
                  className="transition-all duration-300"
                />

                {/* Traveling Energy Photon along the edge */}
                <motion.circle
                  r={isHovered ? 1.5 : 1.2}
                  fill="#ffffff"
                  filter="url(#softGlow)"
                  animate={{
                    cx: [src.x, dst.x],
                    cy: [src.y, dst.y],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: edge.duration,
                    repeat: Infinity,
                    delay: edge.delay,
                    ease: 'easeInOut',
                  }}
                />
              </g>
            );
          })}

          {/* Graph Nodes */}
          {nodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            const isCenter = node.id === 'query';

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                {/* Luminous Outer Glow Halo */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r * (isCenter ? 2.2 : 1.9)}
                  fill={node.glow}
                  filter="url(#softGlow)"
                />

                {/* Animated Pulsing Outer Shell */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r}
                  fill={node.color}
                  animate={{
                    scale: isHovered ? 1.3 : [1, 1.1, 1],
                  }}
                  transition={{
                    duration: node.pulse,
                    repeat: isHovered ? 0 : Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                />

                {/* Inner White Radiant Pin */}
                <circle cx={node.x} cy={node.y} r={node.r * 0.35} fill={node.core} />

                {/* Minimalist Node Label */}
                <text
                  x={node.x}
                  y={node.y + (node.y > 50 ? node.r + 4.5 : -node.r - 2)}
                  fill={isHovered ? '#ffffff' : '#cbd5e1'}
                  fontSize={isCenter ? '3.8' : '3.2'}
                  fontWeight={isCenter || isHovered ? 'bold' : '600'}
                  textAnchor="middle"
                  className="select-none pointer-events-none transition-colors duration-200 font-sans tracking-wide"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </motion.div>
    </div>
  );
}

export default function AuthHeroBanner() {
  return (
    <div className="relative flex flex-col justify-between h-full p-7 sm:p-9 lg:p-10 overflow-hidden text-white rounded-3xl bg-gradient-to-br from-[#070b16] via-[#0d1427] to-[#151336] shadow-2xl border border-indigo-500/20">
      {/* Background Subtle Radial Glows */}
      <div className="absolute -top-28 -left-28 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Section */}
      <div className="relative z-10 space-y-4">
        {/* Institutional Branding */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Network className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-cyan-300 font-bold block">
                Knowledge Graph &amp; IR Analytics
              </span>
              <h2 className="text-lg font-black text-white leading-tight tracking-tight">
                KIRA Lab
              </h2>
            </div>
          </div>

          {/* VESIT Logo Capsule */}
          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-md transition-all shrink-0">
            <img
              src={collegeLogo}
              alt="VESIT Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        {/* Academic Course Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/15 border border-indigo-400/30 text-indigo-200">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>GOLC 2027 • Dept. of Computer Engineering • VESIT</span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Academic Student Portal
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed max-w-md">
            Sign in or create your student credentials to track your laboratory progress, retain quiz benchmarks, and export accredited experiment reports.
          </p>
        </div>
      </div>

      {/* Centerpiece: Simple, Attractive & Amazing Knowledge Graph / IR Animation */}
      <div className="relative z-10 my-4 sm:my-6">
        <ElegantGraphAnimation />
      </div>
    </div>
  );
}
