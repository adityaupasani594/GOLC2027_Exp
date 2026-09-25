import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
export { GRADE } from './CertificateSection';

const EXP_META = {
  title: 'Advanced Cypher Queries and Graph Pattern Matching',
  subtitle: 'Multi-Hop Lineage, Triadic Closures, Shortest Paths & Aggregations',
  code: 'CS-KG-13',
  version: '1.0',
  aim: 'To formulate advanced graph pattern matching queries using declarative Cypher syntax, analyze variable-length path expansions, detect triadic topological closures, compute bidirectional shortest paths, and perform multi-stage pipelined aggregations using WITH and COLLECT().',
};

const OBJECTIVES = [
  'Formulate variable-length path queries (e.g. [:PREREQUISITE*1..3]) and measure traversal pruning efficiency.',
  'Detect triadic closures and structural balance across academic and social citation networks.',
  'Execute shortestPath() algorithms for multi-hop graph connectivity analysis.',
  'Utilize WITH clauses for intermediate projection, filtering, and grouped list aggregations using COLLECT().',
  'Quantify graph query latency, node traversal footprints, and traversal pruning ratios across benchmark datasets.',
];

const PIPELINE_STAGES = [
  { stage: 'Stage 1', name: 'Schema Formulation', desc: 'Define multi-relational property graph topologies with directional integrity constraints.', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { stage: 'Stage 2', name: 'Variable-Length Traversal', desc: 'Evaluate recursive transitive closures over hierarchical DAGs with depth boundaries (*1..k).', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { stage: 'Stage 3', name: 'Shortest Path Routing', desc: 'Run bidirectional breadth-first search to extract minimal cost connecting paths between disparate nodes.', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { stage: 'Stage 4', name: 'Pipelined Aggregation', desc: 'Pass intermediate query subgraphs through WITH pipes to compute cardinality and list aggregations.', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
];

const CYPHER_BENCHMARKS = [
  { label: '1. Variable-Length Lineage (*1..3)', latency: 1.42, nodesTraversed: 7, pathsMatched: 6, pruningRatio: 0.92 },
  { label: '2. Triadic Closure Discovery', latency: 0.98, nodesTraversed: 8, pathsMatched: 4, pruningRatio: 0.88 },
  { label: '3. Aggregation with WITH & COLLECT()', latency: 1.15, nodesTraversed: 14, pathsMatched: 6, pruningRatio: 0.85 },
  { label: '4. Shortest Path Bridge Discovery', latency: 0.74, nodesTraversed: 6, pathsMatched: 1, pruningRatio: 0.96 },
];

const DEFAULT_OBSERVATIONS =
  '1. Variable-Length Path Pruning: Bounding traversal depth with *1..3 prevented exponential path explosion while successfully discovering all indirect prerequisites.\n\n' +
  '2. Triadic Closure Detection: Pattern matching for unclosed triangles (A-B, B-C, no A-C) enabled automated recommendation of collaboration and citation links.\n\n' +
  '3. Shortest Path Efficiency: Bidirectional BFS inside shortestPath() identified topological bridges in under 1 ms, outperforming unidirectional relational table scans.\n\n' +
  '4. WITH Clause Pipeline Modularity: Intermediate filtering with WITH decoupled query execution stages, reducing cardinality before expensive aggregations.';

export default function ReportSection({
  quizScore = 0,
  totalQuestions = 10,
  studentInfo = {},
  trials = [],
  onInfoChange,
  onReportGenerated,
}) {
  return (
    <UnifiedReportSection
      expNumber={13}
      expTitle={EXP_META.title}
      expSubtitle={EXP_META.subtitle}
      expCode={EXP_META.code}
      expVersion={EXP_META.version}
      aim={EXP_META.aim}
      objectives={OBJECTIVES}
      pipelineStages={PIPELINE_STAGES}
      trials={trials}
      renderTrials={() => (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Cypher Query Execution Benchmark & Pruning Metrics
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Query Pattern Benchmark</th>
                  <th className="py-2.5 px-3 text-right">Nodes Traversed</th>
                  <th className="py-2.5 px-3 text-right">Paths Matched</th>
                  <th className="py-2.5 px-3 text-right">Pruning Ratio</th>
                  <th className="py-2.5 px-3 text-right">Latency (ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {CYPHER_BENCHMARKS.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{b.label}</td>
                    <td className="py-2.5 px-3 text-right text-indigo-700">{b.nodesTraversed}</td>
                    <td className="py-2.5 px-3 text-right text-blue-700">{b.pathsMatched}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700">{(b.pruningRatio * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-bold">{b.latency} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      quizScore={quizScore}
      totalQuestions={totalQuestions}
      studentInfo={studentInfo}
      onInfoChange={onInfoChange}
      initialObservations={DEFAULT_OBSERVATIONS}
      onReportGenerated={onReportGenerated}
    />
  );
}
