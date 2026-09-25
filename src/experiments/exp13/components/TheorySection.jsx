import { ExperimentContributors } from '../../../components/common';
import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, ArrowRight,
  Database, Network, Share2, Layers, ExternalLink, HelpCircle
} from 'lucide-react';

export default function TheorySection({ onGoToLab }) {
  const objectives = [
    'Analyze the Labeled Property Graph (LPG) paradigm and Index-Free Adjacency O(1) edge traversals.',
    'Formulate multi-hop traversal queries using variable-length relationship syntax (*min..max).',
    'Structure modular multi-stage query pipelines using the Cypher WITH clause and COLLECT() aggregations.',
    'Mitigate combinatorial path explosion during deep traversals through selective index anchoring.'
  ];

  const comparison = [
    {
      queryType: 'Single-Hop Pattern Match',
      cypherSyntax: 'MATCH (a)-[:AUTHORED]->(p)',
      complexity: 'O(degree(a)) pointer lookups',
      bestFor: 'Direct neighbor discovery and attribute inspection'
    },
    {
      queryType: 'Variable-Length Path',
      cypherSyntax: 'MATCH path = (p)-[:CITES*1..3]->(ancestor)',
      complexity: 'O(b^k) bounded by branching factor b and depth k',
      bestFor: 'Lineage tracing, influence cascades, citation trees'
    },
    {
      queryType: 'Pipelined Aggregation (WITH)',
      cypherSyntax: 'MATCH ... WITH a, count(p) as cnt WHERE cnt > 5',
      complexity: 'Modular pipeline execution with intermediate streaming',
      bestFor: 'Subquery filtering, Top-N ranking, and grouping'
    },
    {
      queryType: 'Shortest Path Discovery',
      cypherSyntax: 'MATCH p = shortestPath((a)-[*]-(b))',
      complexity: 'O(V + E) Breadth-First Search (BFS)',
      bestFor: 'Degrees of separation, supply chain routing, network forensics'
    }
  ];

  const procedureSteps = [
    'Step 1: Review the theoretical fundamentals of variable-length paths, pipelined WITH clauses, and graph BFS algorithms.',
    'Step 2: Navigate to the Simulation Lab tab in the experiment navigation bar.',
    'Step 3: Select a benchmark graph dataset (SciFact Citation Graph, Corporate Organization, Enterprise Network).',
    'Step 4: Execute multi-hop path queries and inspect variable-length edge expansions across 1 to 4 degrees of separation.',
    'Step 5: Apply WITH pipelining and COLLECT() aggregations to compute intermediate statistics and post-filters.',
    'Step 6: Trace shortest paths between arbitrary entities and record performance execution metrics.',
    'Step 7: Complete the concept assessment Quiz, review feedback, and generate your verified certificate and lab report.'
  ];

  const keyTerms = [
    { term: 'Index-Free Adjacency (IFA)', def: 'Storage architecture where graph vertices maintain physical memory pointers to neighbor relationships, ensuring O(1) per-hop traversal.' },
    { term: 'Variable-Length Path (*min..max)', def: 'Cypher syntax specifying paths with lower and upper hop bounds, e.g. -[:CITES*1..3]-> evaluates paths of 1, 2, or 3 hops.' },
    { term: 'Combinatorial Path Explosion', def: 'The exponential expansion of reachable graph paths O(b^k) in dense networks with high average branching factor b.' },
    { term: 'WITH Clause', def: 'A Cypher query pipelining operator that divides complex queries into modular stages, passing intermediate variables forward.' },
    { term: 'COLLECT() Aggregator', def: 'An aggregation function grouping matched entities or properties into a dynamic list for subsequent list-comprehension processing.' },
    { term: 'Shortest Path', def: 'The minimal sequence of relationship hops connecting two designated vertices, evaluated via bidirectional BFS.' }
  ];

  const references = [
    {
      authors: 'Robinson, I., Webber, J., & Eifrem, E. (2015)',
      title: 'Graph Databases: New Opportunities for Connected Data (2nd ed.)',
      details: 'O\'Reilly Media. Chapters 3 & 4: Cypher Query Language and Graph Traversal Patterns.',
      url: 'https://neo4j.com/graph-databases-book/'
    },
    {
      authors: 'Needham, M., & Hodler, A. E. (2019)',
      title: 'Graph Algorithms: Practical Examples in Apache Spark and Neo4j',
      details: 'O\'Reilly Media. Chapter 4: Pathfinding and Graph Search Algorithms.',
      url: 'https://neo4j.com/graph-algorithms-book/'
    },
    {
      authors: 'Angles, R., Arenas, M., Barceló, P., et al. (2017)',
      title: 'Foundations of Modern Query Languages for Graph Databases',
      details: 'ACM Computing Surveys (CSUR), 50(5), 1-40.',
      url: 'https://doi.org/10.1145/3104031'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800">
      {/* ── 1. Hero Banner ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm relative overflow-hidden space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          Experiment 13 &bull; Advanced Graph Querying
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Advanced Graph Traversal &amp; Cypher Pipelining
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          Execute expressive multi-hop traversals over interconnected knowledge graphs. Master variable-length path matching (*min..max), multi-stage query pipelining using the Cypher WITH clause, and COLLECT() aggregations to discover hidden relationship chains while avoiding combinatorial path explosion.
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

        {/* Index-Free Adjacency & Traversal Mechanics */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-1.5">
            <h3 className="font-bold text-indigo-950 text-xs sm:text-sm">Index-Free Adjacency (IFA)</h3>
            <p className="text-xs text-indigo-900/80 leading-relaxed">
              Unlike relational databases that execute costly multi-table joins scaling with total row count, each graph node directly points to adjacent relationship records in memory. Traversing an edge requires a constant-time O(1) pointer dereference.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-violet-100 bg-violet-50/40 space-y-1.5">
            <h3 className="font-bold text-violet-950 text-xs sm:text-sm">Variable-Length Paths (*min..max)</h3>
            <p className="text-xs text-violet-900/80 leading-relaxed">
              Cypher enables deep lineage discovery by specifying hop bounds (e.g. <code>-[:CITES*1..3]-&gt;</code>). Bounding depth prevents combinatorial path explosion <span className="font-mono">O(b^k)</span> across densely-connected hubs.
            </p>
          </div>
        </div>

        {/* Query Pipelining Syntax Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <Layers className="w-4 h-4" />
            Query Pipelining with the WITH Clause &amp; COLLECT()
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The <code className="font-mono bg-slate-100 text-indigo-800 px-1 py-0.5 rounded">WITH</code> clause creates modular execution pipelines, aggregating or filtering intermediate records before initiating downstream pattern expansions:
          </p>
          <pre className="p-3 bg-slate-900 text-teal-300 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
{`MATCH (author:Person)-[:AUTHORED]->(p:Paper)
WITH author, count(p) AS paperCount, collect(p.title) AS publications
WHERE paperCount >= 5
MATCH (author)-[:AFFILIATED_WITH]->(inst:Institution)
RETURN author.name, inst.name, paperCount, publications[0..3]
ORDER BY paperCount DESC;`}
          </pre>
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
                <th className="p-2.5">Query Archetype</th>
                <th className="p-2.5">Cypher Syntax Example</th>
                <th className="p-2.5">Algorithmic Complexity</th>
                <th className="p-2.5">Optimal Production Fit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {comparison.map(r => (
                <tr key={r.queryType} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-900">{r.queryType}</td>
                  <td className="p-2.5 font-mono text-indigo-700 bg-indigo-50/40 text-[11px]">{r.cypherSyntax}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-700">{r.complexity}</td>
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
      <ExperimentContributors expNumber={13} />
    </div>
  );
}
