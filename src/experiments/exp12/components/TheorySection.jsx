import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronDown, ChevronUp, FlaskConical,
  Brain, Target, Layers, GitMerge, Search, Cpu, Zap,
  CheckCircle2, ArrowRight, Sparkles, Network, Database,
  ArrowRightLeft, Route, Share2, Compass, HelpCircle
} from 'lucide-react';
import { EXPERIMENT_CONFIG, THEORY_CONTENT } from '../graphQueryEngine';

const CONCEPT_MODULES = [
  {
    step: 1,
    title: 'The Property Graph Model',
    short: 'Graph Architecture',
    desc: 'Information is represented as entities (nodes) connected by typed, directed relationships, both carrying rich key-value properties.',
    icon: Network,
    badge: 'Core Model',
    color: 'from-blue-500 to-indigo-600',
    details: [
      { term: 'Nodes (Vertices)', desc: 'Entities representing people, films, studios, cities. Enclosed in parentheses in queries: (n:Person).' },
      { term: 'Labels', desc: 'Type categories grouping nodes (:Person, :Movie, :Organization, :City). A node can have multiple labels.' },
      { term: 'Relationships (Edges)', desc: 'Directed, typed semantic assertions connecting a source to target: -[:ACTED_IN]->.' },
      { term: 'Properties', desc: 'Key-value maps stored directly on nodes (born: 1964) or edges (role: "Neo").' }
    ]
  },
  {
    step: 2,
    title: 'Relational Tables vs. Knowledge Graphs',
    short: 'The JOIN Bottleneck',
    desc: 'Connecting items in RDBMS requires multiple foreign-key JOINs. In a Knowledge Graph, relationships are first-class citizens traversed in O(1) index-free time.',
    icon: Database,
    badge: 'Architecture',
    color: 'from-emerald-500 to-teal-600',
    details: [
      { term: 'The Problem', desc: 'Streaming recommendations like "Films connected to The Matrix through actors and studios" require 4+ relational JOIN tables.' },
      { term: 'The Solution', desc: 'A declarative graph pattern walks the entire multi-hop chain in one clean traversal query without joining large tables.' }
    ]
  },
  {
    step: 3,
    title: 'Declarative Pattern Matching',
    short: 'ASCII-Art Syntax',
    desc: 'Instead of procedural traversal instructions, describe the visual pattern or shape of the subgraph you want the engine to find.',
    icon: Route,
    badge: 'Query Grammar',
    color: 'from-purple-500 to-pink-600',
    details: [
      { term: 'MATCH', desc: 'Specifies the structural graph pattern (e.g. (p:Person)-[:DIRECTED]->(m:Movie)).' },
      { term: 'WHERE', desc: 'Applies boolean filters on node or edge properties (e.g. WHERE p.born > 1970).' },
      { term: 'RETURN', desc: 'Projects specific entity names, attributes, or aggregates (e.g. RETURN p.name, count(r)).' },
      { term: 'ORDER BY & LIMIT', desc: 'Sorts results and caps returned rows to prevent unbounded traversals.' }
    ]
  },
  {
    step: 4,
    title: 'Multi-Hop & Path Traversals',
    short: 'Multi-Hop Paths',
    desc: 'Navigate chains of connections across arbitrary distance to uncover hidden or indirect relationships in the graph.',
    icon: Share2,
    badge: 'Advanced Querying',
    color: 'from-amber-500 to-orange-600',
    details: [
      { term: '1-Hop Traversal', desc: 'Inspects direct neighbors: outgoing (->), incoming (<-), or undirected (-).' },
      { term: 'Variable-Length Paths', desc: 'Uses syntax -[*1..3]- to traverse paths of variable hop counts between entities.' },
      { term: 'Cycle Prevention', desc: 'Pattern matching guarantees no relationship edge is traversed twice in the same path.' }
    ]
  }
];

export default function TheorySection({ onGoToLab }) {
  const [activeStep, setActiveStep] = useState(1);
  const [expandedSection, setExpandedSection] = useState('pipeline');
  const [glossaryFilter, setGlossaryFilter] = useState('');

  const currentModule = CONCEPT_MODULES.find(m => m.step === activeStep) || CONCEPT_MODULES[0];

  const filteredKeyTerms = Object.entries(THEORY_CONTENT.key_terms).filter(([term, def]) => {
    const q = glossaryFilter.toLowerCase();
    return term.toLowerCase().includes(q) || def.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl border border-indigo-800/40"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Experiment 12 · Knowledge Graphs &amp; IR
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Query Knowledge Graphs with Pattern-Based Queries
            </h1>
            <p className="text-indigo-200/80 text-xs sm:text-sm max-w-2xl">
              Master the property graph model, declarative structural pattern matching, multi-hop traversals, and aggregation queries over interconnected entities.
            </p>
          </div>

          <button
            onClick={onGoToLab}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            Launch Simulation Lab
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Interactive Concept Stepper */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              Foundational Concepts Stepper
            </h2>
            <p className="text-xs text-slate-500">
              Select a stage to explore the architectural principles of graph databases and pattern queries.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 self-start sm:self-auto">
            Module {activeStep} of {CONCEPT_MODULES.length}
          </span>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CONCEPT_MODULES.map((m) => {
            const isActive = m.step === activeStep;
            const Icon = m.icon;
            return (
              <button
                key={m.step}
                onClick={() => setActiveStep(m.step)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50/50 border-indigo-300 shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/60 border-slate-200/70 hover:bg-slate-100/80 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                    isActive ? 'bg-indigo-600 shadow-sm' : 'bg-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}>
                    Stage {m.step}
                  </span>
                </div>
                <div className={`text-xs font-bold ${isActive ? 'text-indigo-950 font-black' : 'text-slate-700'}`}>
                  {m.short}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentModule.step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-4 shadow-md border border-indigo-900/60"
          >
            <div className="flex items-center justify-between border-b border-indigo-800/50 pb-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider border border-indigo-400/30">
                  {currentModule.badge}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {currentModule.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentModule.desc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentModule.details.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-800/80 border border-indigo-500/20 space-y-1"
                >
                  <div className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    {item.term}
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Case Study Illustration: StreamPick */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Case Study: The "What Should I Watch Next?" Problem
            </h2>
            <p className="text-xs text-slate-500">
              How streaming recommendation engines leverage graph pattern queries over isolated SQL tables.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-rose-200/60 text-rose-800 font-bold text-[10px] uppercase">
              Relational Approach (Tables &amp; Foreign Keys)
            </span>
            <p className="text-slate-700 leading-relaxed">
              In a relational database, movie data is fragmented across separate tables: <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200">people</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200">movies</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200">studios</code>, and <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200">castings</code>. Finding indirect recommendations requires cascading SQL <code className="font-bold text-rose-700">JOIN</code> statements that degrade rapidly in query performance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-teal-200/60 text-teal-800 font-bold text-[10px] uppercase">
              Knowledge Graph Approach (Index-Free Adjacency)
            </span>
            <p className="text-slate-700 leading-relaxed">
              In the knowledge graph, relationships are native pointers in memory. A single pattern query like <code className="bg-white px-1.5 py-0.5 rounded border border-teal-200 text-teal-900 font-mono">(a:Person)-[:ACTED_IN]-&gt;(m)-[:DISTRIBUTED]&lt;-(s)</code> walks the entire recommendation chain in milliseconds without table scans.
            </p>
          </div>
        </div>
      </div>

      {/* Objectives & 8-Step Procedure Collapsible Accordions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Objectives Card */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Educational Objectives
            </h3>
          </div>
          <div className="space-y-2.5">
            {EXPERIMENT_CONFIG.objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 8-Step Procedure Card */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Layers className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Experiment Execution Procedure
            </h3>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {THEORY_CONTENT.procedure.map((step, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step.replace(/^Step \d+:\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Glossary Table */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Key Terminology &amp; Graph Semantics
              </h3>
              <p className="text-xs text-slate-500">
                Essential vocabulary for property graphs, traversal patterns, and declarative query clauses.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={glossaryFilter}
              onChange={(e) => setGlossaryFilter(e.target.value)}
              placeholder="Search terminology..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredKeyTerms.map(([term, definition]) => (
            <div
              key={term}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-1.5"
            >
              <div className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                {term}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {definition}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-2">
        <button
          onClick={onGoToLab}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          Proceed to Simulation Lab
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
