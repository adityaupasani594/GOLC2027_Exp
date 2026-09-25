import { ExperimentContributors } from '../../../components/common';
import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, ArrowRight,
  Network, Route, Database, Layers, ExternalLink, HelpCircle
} from 'lucide-react';

export default function TheorySection({ onGoToLab }) {
  const objectives = [
    'Model domain entities and relationships using the declarative Property Graph paradigm.',
    'Formulate structural ASCII-art pattern matching queries using MATCH, WHERE, and RETURN clauses.',
    'Execute multi-hop path traversals (e.g. (a)-[:REL*1..3]->(b)) to uncover indirect semantic connections.',
    'Compute graph aggregations, grouped statistics, and node degree centrality measures.'
  ];

  const comparison = [
    {
      paradigm: 'Declarative Graph Query (Cypher)',
      dataModel: 'Labeled Property Graph (LPG)',
      multiHop: 'Linear cost with local degree (O(k · d)) via index-free adjacency',
      syntax: 'ASCII-art structural patterns: (a)-[:ACTED_IN]->(m)<-[:DIRECTED]-(d)',
      bestFor: 'Connected data, recommendation engines, fraud rings, knowledge graphs'
    },
    {
      paradigm: 'Relational SQL (RDBMS)',
      dataModel: 'Tables, Rows, Foreign Keys, Junction Tables',
      multiHop: 'Degrades exponentially (O(N^k)) through multi-way table JOINs',
      syntax: 'Complex nested SELECT ... JOIN ... ON clauses with intermediate tables',
      bestFor: 'Tabular transactions, double-entry accounting, normalized inventory'
    },
    {
      paradigm: 'Procedural Graph Traversal (Gremlin)',
      dataModel: 'Property Graph step-by-step vertex pipelines',
      multiHop: 'Linear step traversal cost',
      syntax: 'Imperative method chaining: g.V().hasLabel("Person").out("ACTED_IN")',
      bestFor: 'Custom graph algorithm implementations and low-level step optimization'
    },
    {
      paradigm: 'Semantic Web Query (SPARQL)',
      dataModel: 'W3C RDF Triples (Subject, Predicate, Object URIs)',
      multiHop: 'Property paths: ?person :actedIn / :directed ?director',
      syntax: 'Declarative triple patterns over global URI namespaces',
      bestFor: 'Open-world linked data and cross-institutional ontology federation'
    }
  ];

  const procedureSteps = [
    'Step 1: Review the theoretical fundamentals of declarative graph pattern matching and index-free adjacency.',
    'Step 2: Navigate to the Simulation Lab tab in the experiment navigation bar.',
    'Step 3: Select an educational knowledge graph dataset (Entertainment / Movies, University, Social Network, E-Commerce).',
    'Step 4: Formulate and execute Cypher queries (MATCH, WHERE, RETURN, ORDER BY, LIMIT) in the query editor.',
    'Step 5: Inspect the visual graph canvas, filter nodes by label, and verify multi-hop traversal paths.',
    'Step 6: Compute aggregations (count, average) and record experimental execution metrics into your session log book.',
    'Step 7: Complete the concept assessment Quiz, review feedback, and generate your verified certificate and lab report.'
  ];

  const keyTerms = [
    { term: 'Property Graph Model', def: 'A data model where entities (nodes) and connections (relationships) hold arbitrary typed key-value properties.' },
    { term: 'ASCII-Art Pattern Matching', def: 'The Cypher syntax convention visualizing nodes as parentheses (n) and directed relationships as arrows -[r]->.' },
    { term: 'Variable-Length Path', def: 'A query pattern matching traversals over arbitrary depth: (a)-[:KNOWS*1..3]->(b) searches 1 to 3 degrees of separation.' },
    { term: 'Index-Free Adjacency (IFA)', def: 'Direct pointer linkages between adjacent vertices eliminating secondary index lookups during path traversals.' },
    { term: 'Directed Typed Edge', def: 'A relationship carrying an immutable semantic name (e.g. [:ACTED_IN]) pointing from a source node to a target node.' },
    { term: 'Degree Centrality', def: 'The count of relationships incident upon a node, identifying focal hubs or influential entities in the network.' }
  ];

  const references = [
    {
      authors: 'Robinson, I., Webber, J., & Eifrem, E. (2015)',
      title: 'Graph Databases: New Opportunities for Connected Data (2nd ed.)',
      details: 'O\'Reilly Media. Chapters 3 & 4: Cypher Query Language and Graph Traversal Patterns.',
      url: 'https://neo4j.com/graph-databases-book/'
    },
    {
      authors: 'Francis, N., Green, A., Guagliardo, P., et al. (2018)',
      title: 'Cypher: An Evolving Query Language for Property Graphs',
      details: 'ACM SIGMOD 2018. Formal specification and semantic foundation of openCypher.',
      url: 'https://doi.org/10.1145/3183713.3190657'
    },
    {
      authors: 'Hogan, A., Blomqvist, E., Cochez, M., et al. (2021)',
      title: 'Knowledge Graphs',
      details: 'ACM Computing Surveys (CSUR), 54(4), 1-37. Querying and reasoning over knowledge graphs.',
      url: 'https://arxiv.org/abs/2003.02320'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800">
      {/* ── 1. Hero Banner ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm relative overflow-hidden space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          Experiment 12 &bull; Knowledge Graph Querying
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Query Knowledge Graphs with Pattern-Based Queries
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          Master the Property Graph model and declarative pattern matching. Express complex multi-hop relationship traversals using intuitive ASCII-art Cypher patterns, evaluate structural subgraph matches, and compute graph aggregations without the exponential latency penalties of relational multi-way SQL table joins.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToLab}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 cursor-pointer transition active:scale-95"
          >
            Launch Simulation Lab <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. Learning Objectives ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Learning Objectives
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {objectives.map((obj, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{obj}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Foundational Theoretical Framework ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Foundational Theoretical Framework
        </h2>

        {/* Declarative Query Model */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-1.5">
            <h3 className="font-bold text-indigo-950 text-xs sm:text-sm">The Property Graph Paradigm</h3>
            <p className="text-xs text-indigo-900/80 leading-relaxed">
              Information is represented as discrete entities (nodes) connected by typed, directed relationships, both carrying arbitrary key-value properties. Relationships are stored as direct physical memory pointers (Index-Free Adjacency).
            </p>
          </div>
          <div className="p-4 rounded-xl border border-violet-100 bg-violet-50/40 space-y-1.5">
            <h3 className="font-bold text-violet-950 text-xs sm:text-sm">The Relational JOIN Bottleneck</h3>
            <p className="text-xs text-violet-900/80 leading-relaxed">
              In relational databases, querying multi-hop entity connections requires expensive Cartesian table joins that degrade exponentially with path length. In graph databases, traversal cost depends solely on local node degree (O(k · d)).
            </p>
          </div>
        </div>

        {/* ASCII-Art Cypher Grammar Reference */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Declarative Cypher Clauses &amp; Visual Syntax
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                clause: 'MATCH',
                role: 'Pattern Specification',
                example: '(p:Person)-[:ACTED_IN]->(m:Movie)',
                desc: 'Declares the structural subgraph shape to discover.'
              },
              {
                clause: 'WHERE',
                role: 'Predicate Filtering',
                example: 'WHERE m.released > 2000 AND p.born < 1980',
                desc: 'Applies boolean filters on node and edge attributes.'
              },
              {
                clause: 'RETURN',
                role: 'Result Projection',
                example: 'RETURN p.name, count(m) AS filmCount',
                desc: 'Selects properties, node aliases, or aggregations.'
              },
              {
                clause: 'ORDER BY',
                role: 'Sorting & Pagination',
                example: 'ORDER BY filmCount DESC LIMIT 10',
                desc: 'Sorts ranked records and truncates result sets.'
              }
            ].map((c, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs font-mono text-indigo-700">{c.clause}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{c.role}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 text-teal-300 font-mono text-[10px] truncate">
                  {c.example}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Technical Comparison Matrix ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Technical Comparison Matrix
        </h2>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Query Paradigm</th>
                <th className="p-2.5">Underlying Data Model</th>
                <th className="p-2.5">Multi-Hop Traversal Complexity</th>
                <th className="p-2.5">Query Expression Syntax</th>
                <th className="p-2.5">Optimal Production Fit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {comparison.map(r => (
                <tr key={r.paradigm} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-900">{r.paradigm}</td>
                  <td className="p-2.5">{r.dataModel}</td>
                  <td className="p-2.5 font-semibold text-indigo-800 bg-indigo-50/40">{r.multiHop}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-700">{r.syntax}</td>
                  <td className="p-2.5 text-slate-700">{r.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Laboratory Procedure ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Laboratory Procedure
        </h2>
        <div className="space-y-2.5 pt-1">
          {procedureSteps.map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Key Terminology & Definitions ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Key Terminology &amp; Definitions
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {keyTerms.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-indigo-900">{item.term}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.def}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. References & Further Reading ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          References &amp; Further Reading
        </h2>
        <div className="space-y-3 pt-1">
          {references.map((ref, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <div className="text-xs sm:text-sm font-semibold text-slate-800">
                {ref.authors} &mdash; <span className="font-bold text-indigo-700">{ref.title}</span>
              </div>
              <div className="text-xs text-slate-500 italic">{ref.details}</div>
              {ref.url && (
                <div className="text-[11px] text-blue-600 font-mono pt-0.5">
                  <a href={ref.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                    {ref.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    
      {/* ── Experiment Contributors ── */}
      <ExperimentContributors expNumber={12} />
    </div>
  );
}
