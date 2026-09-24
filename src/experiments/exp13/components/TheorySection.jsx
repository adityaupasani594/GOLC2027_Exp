import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronDown, ChevronUp, FlaskConical,
  Brain, Target, Network, Layers, GitMerge, Share2, Filter, Zap, Database
} from 'lucide-react';

const THEORY_SECTIONS = [
  {
    id: 'lpg',
    icon: Database,
    color: 'indigo',
    title: 'The Labeled Property Graph (LPG) Model & Index-Free Adjacency',
    content: (
      <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <p>
          In a <strong>Labeled Property Graph (LPG)</strong>, information is represented directly as:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li><strong>Nodes (Vertices)</strong>: Entities with zero or more labels (e.g., <code className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">:Author</code>, <code className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">:Paper</code>, <code className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">:Person</code>) and key-value properties.</li>
          <li><strong>Relationships (Edges)</strong>: Directed, typed connections (e.g., <code className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">-[:AUTHORED]-&gt;</code>, <code className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">-[:CITES]-&gt;</code>, <code className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">-[:WORKS_WITH]-&gt;</code>) that also store attributes.</li>
        </ul>
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
          <div className="text-xs font-bold text-indigo-800 mb-1">⚡ Index-Free Adjacency</div>
          <p className="text-xs text-slate-600">
            Unlike relational databases that require expensive <code className="font-mono">JOIN</code> operations scaling with table size, graph nodes maintain direct memory pointers to their neighbors, ensuring constant time <code className="font-mono">O(1)</code> traversal per edge hop.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'cypher_syntax',
    icon: Network,
    color: 'teal',
    title: 'Declarative Cypher Query Language',
    content: (
      <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <p>
          Cypher is Neo4j's declarative, pattern-matching query language using expressive ASCII-art syntax:
        </p>
        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-1">
          <div className="text-teal-400 font-bold">// Basic Pattern Match with Filtering</div>
          <div>{"MATCH (a:Person)-[:WORKS_WITH]->(b:Person)"}</div>
          <div>{"WHERE b.department = 'AI'"}</div>
          <div>{"RETURN a.name, b.name, b.role"}</div>
        </div>
        <div className="grid sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
            <span className="font-bold text-teal-800 block">MATCH</span>
            <span className="text-slate-600">Specifies visual pattern to locate in the graph.</span>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
            <span className="font-bold text-teal-800 block">WHERE</span>
            <span className="text-slate-600">Filters properties and pattern constraints.</span>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
            <span className="font-bold text-teal-800 block">RETURN</span>
            <span className="text-slate-600">Projects matched nodes, relationships, and stats.</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'multi_hop',
    icon: Share2,
    color: 'violet',
    title: 'Multi-Hop Traversals & Variable-Length Paths (*min..max)',
    content: (
      <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <p>
          Cypher enables deep path discovery using variable-length relationship syntax <code className="font-mono bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded">*min..max</code>:
        </p>
        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-1">
          <div className="text-violet-400 font-bold">// Trace Citation Lineage 1 to 3 Hops Deep</div>
          <div>{"MATCH path = (p:Paper {id: 'P16'})-[:CITES*1..3]->(ancestor:Paper)"}</div>
          <div>{"RETURN path, length(path) AS depth, ancestor.title"}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-200 text-xs">
          <span className="font-bold text-violet-800 block mb-1">⚠️ Combinatorial Path Explosion</span>
          <p className="text-slate-600">
            In a graph with average branching factor <code className="font-mono">b</code>, paths of depth <code className="font-mono">k</code> scale as <code className="font-mono">O(b^k)</code>. Selective predicates and depth bounds are critical to avoid performance bottlenecks.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'aggregation',
    icon: Layers,
    color: 'rose',
    title: 'Query Pipelining & Aggregation with WITH and COLLECT()',
    content: (
      <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <p>
          The <code className="font-mono font-bold text-rose-700">WITH</code> clause divides complex Cypher queries into modular execution pipeline stages:
        </p>
        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-1">
          <div className="text-rose-400 font-bold">// Aggregate & Post-Filter</div>
          <div>{"MATCH (a:Author)-[:AUTHORED]->(p:Paper)"}</div>
          <div>{"WITH a, count(p) AS paper_count, sum(p.citations) AS total_cites, collect(p.title) AS titles"}</div>
          <div>{"WHERE paper_count >= 2 AND total_cites >= 1000"}</div>
          <div>{"RETURN a.name, paper_count, total_cites, titles"}</div>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
          <li><strong><code className="font-mono">count()</code> / <code className="font-mono">sum()</code></strong>: Computes scalar aggregate metrics.</li>
          <li><strong><code className="font-mono">collect()</code></strong>: Gathers individual values into an array/list.</li>
          <li><strong><code className="font-mono">WITH</code></strong>: Passes aggregated projections downstream for subsequent filtering or secondary traversal.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'hidden_connections',
    icon: Zap,
    color: 'amber',
    title: 'Discovering Hidden Connections & Structural Motifs',
    content: (
      <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <p>
          Advanced graph queries detect non-obvious topological motifs that cannot be easily queried in relational SQL:
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="font-bold text-amber-800 block mb-1">🔗 Triadic Closure & Hidden Collaborators</span>
            <p className="text-slate-600">
              Finds pairs <code className="font-mono">(A1, A2)</code> that have mutual collaborator <code className="font-mono">Bridge</code> but no direct edge between them.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="font-bold text-amber-800 block mb-1">🌉 Shortest Path & Interdisciplinary Bridges</span>
            <p className="text-slate-600">
              Uses <code className="font-mono">shortestPath()</code> to locate the minimal junction sequence connecting disparate research communities.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

const COLOR_MAP = {
  indigo: { bg: 'bg-indigo-600', light: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', btn: 'hover:bg-indigo-50' },
  teal:   { bg: 'bg-teal-600',   light: 'bg-teal-50 border-teal-200',   text: 'text-teal-700',   btn: 'hover:bg-teal-50' },
  violet: { bg: 'bg-violet-600', light: 'bg-violet-50 border-violet-200', text: 'text-violet-700', btn: 'hover:bg-violet-50' },
  rose:   { bg: 'bg-rose-500',   light: 'bg-rose-50 border-rose-200',   text: 'text-rose-700',   btn: 'hover:bg-rose-50' },
  amber:  { bg: 'bg-amber-500',  light: 'bg-amber-50 border-amber-200',  text: 'text-amber-700',  btn: 'hover:bg-amber-50' },
};

function AccordionSection({ section }) {
  const [open, setOpen] = useState(true);
  const Icon = section.icon;
  const colors = COLOR_MAP[section.color] || COLOR_MAP.indigo;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:border-slate-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-white hover:bg-slate-50/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${colors.light} border flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <span className="font-bold text-slate-800 text-sm sm:text-base">{section.title}</span>
        </div>
        <div className="text-slate-400">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 bg-slate-50/30">
              {section.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TheorySection({ onGoToLab }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-50 via-sky-50 to-teal-50 border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-700 text-xs font-extrabold uppercase tracking-wider mb-2">
          <Brain className="w-4 h-4" />
          Knowledge Graphs Track · Advanced Cypher
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Advanced Cypher Queries &amp; Graph Pattern Matching
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
          Explore multi-hop lineage traversals, variable-length relationship expansions, triadic closure discovery, and query pipeline aggregation using Cypher on Labeled Property Graphs.
        </p>
      </div>

      {/* Learning Objectives */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-600" />
          Learning Objectives
        </h2>
        <ul className="space-y-2">
          {[
            'Master variable-length relationship paths (e.g. [:CITES*1..3]) and understand algorithmic complexity.',
            'Discover non-obvious hidden relationships and triadic closures using topological graph pattern matching.',
            'Chain query execution pipelines and compute grouped aggregations using WITH and COLLECT().',
            'Compute optimal topological connections using bidirectional shortestPath() algorithms.',
            'Analyze Cypher execution plans and index-free adjacency performance advantages.',
          ].map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
              {obj}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-600" />
          Core Concepts &amp; Foundations
        </h2>
        {THEORY_SECTIONS.map(s => <AccordionSection key={s.id} section={s} />)}
      </div>

      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-500" />
          Key Terminology
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ['Property Graph (LPG)', 'Graph model consisting of nodes, directed typed edges, and key-value properties.'],
            ['Index-Free Adjacency', 'Nodes store direct memory references to neighbors, providing O(1) traversal per hop.'],
            ['Variable-Length Path (*min..max)', 'Cypher pattern matching paths traversing a range of relationship hops.'],
            ['Triadic Closure', 'Motif where two unconnected nodes sharing a mutual neighbor have a high propensity to link.'],
            ['WITH Pipelining', 'Divides queries into sequential stages, enabling intermediate aggregations and filtering.'],
            ['COLLECT() Aggregator', 'Aggregates multiple scalar values or subgraphs into a unified ordered list.'],
            ['Shortest Path', 'Minimal-hop sequence connecting two distant entities across the graph topology.'],
            ['Path Explosion O(b^k)', 'Exponential growth in candidate paths as traversal depth k increases with branching factor b.'],
          ].map(([term, def]) => (
            <div key={term} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-800 text-xs">{term}</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">{def}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoToLab}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
        >
          <FlaskConical className="w-4 h-4" />
          Open Simulation Lab
        </motion.button>
      </div>
    </div>
  );
}
