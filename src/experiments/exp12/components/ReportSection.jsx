import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
import { EXPERIMENT_CONFIG } from '../graphQueryEngine';
export { GRADE } from './CertificateSection';

const PIPELINE_STAGES = [
  { stage: 'Stage 1', name: 'Graph Schema & Domain Knowledge', desc: 'Identify node labels (Person, Movie, City), properties, and typed relationship signatures.', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { stage: 'Stage 2', name: '1-Hop Pattern Matching', desc: 'Formulate direct single-hop pattern queries (MATCH (a:Person)-[:ACTED_IN]->(m:Movie)).', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { stage: 'Stage 3', name: 'Multi-Hop Path Traversal', desc: 'Execute multi-step traversals across shared entities (co-actor networks, director collaborations).', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { stage: 'Stage 4', name: 'Filtering & Aggregation', desc: 'Apply conditional WHERE constraints, ordering, and aggregation metrics (count, avg).', color: 'bg-purple-50 border-purple-200 text-purple-700' },
];

const DEFAULT_OBSERVATIONS =
  '1. Declarative Querying: Declarative pattern-based graph queries enabled intuitive traversal of the movie knowledge graph without nested joins. Direct 1-hop lookups traversed typed relationships like ACTED_IN and DIRECTED efficiently.\n\n' +
  '2. Multi-hop Traversal: Multi-hop traversals successfully linked actors across 2 degrees of separation to shared filming cities and production studios with linear time complexity relative to path depth.\n\n' +
  '3. Aggregation & Projection: Pattern match filtering combined with aggregation functions allowed instantaneous summarization of graph topology metrics (e.g. film count per director, co-actor degree centrality).\n\n' +
  '4. Semantic Rigor: Graph pattern queries enforced type constraints, ensuring queries returned valid entity subgraphs matching target ontological contracts.';

export default function ReportSection({
  quizScore = 0,
  totalQuestions = 10,
  studentInfo = {},
  recordedTrials = [],
  trials = [],
  onInfoChange,
  onReportGenerated,
}) {
  const activeTrials = trials?.length > 0 ? trials : recordedTrials;

  return (
    <UnifiedReportSection
      expNumber={12}
      expTitle={EXPERIMENT_CONFIG.title}
      expSubtitle={EXPERIMENT_CONFIG.course}
      expCode={EXPERIMENT_CONFIG.courseCode}
      expVersion="2027.1"
      aim="To write and execute pattern-based declarative graph queries, perform 1-hop and multi-hop relationship traversals across entity networks, and evaluate retrieval performance over structured knowledge graphs."
      objectives={EXPERIMENT_CONFIG.objectives}
      pipelineStages={PIPELINE_STAGES}
      trials={activeTrials}
      renderTrials={(trialList) => (
        !trialList || trialList.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center italic">
            No live queries logged yet. Switch to the Simulation Lab tab and execute pattern queries.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Trial #</th>
                  <th className="p-2.5">Query Pattern</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-right">Result Count</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {trialList.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">{idx + 1}</td>
                    <td className="p-2.5 font-mono text-slate-700 max-w-[200px] truncate">{t.pattern || t.query || 'MATCH (p)-[:ACTED_IN]->(m)'}</td>
                    <td className="p-2.5 text-indigo-700 font-sans font-semibold">{t.category || t.type || '1-Hop Match'}</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">{t.resultCount ?? (t.results?.length ?? '—')}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">Completed</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
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
