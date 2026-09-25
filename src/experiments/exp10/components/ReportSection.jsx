import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
export { GRADE } from './CertificateSection';

const EXPERIMENT_CONFIG = {
  expNo: 10,
  title: 'Create and Manage a Graph Database',
  course: 'Database Management Systems / Advanced Data Systems',
  lab_code: 'CS-KG-10',
  objectives: [
    'Understand the foundational principles of Graph Databases and the Labeled Property Graph (LPG) model.',
    'Differentiate Graph Databases from Relational Databases (RDBMS) via Index-Free Adjacency (IFA).',
    'Design, build, and manipulate graph structures consisting of nodes, labels, properties, and directed relationships.',
    'Master the Cypher Query Language for pattern matching, creation, updates, and deletions (MATCH, CREATE, SET, DELETE, DETACH DELETE).',
    'Execute single-hop and multi-hop relationship traversals, conditional filtering (WHERE), and aggregations (count, avg).',
    'Understand real-world graph database architecture, deployment procedures (Docker, Cloud, Local), and production use cases.'
  ]
};

const PIPELINE_STAGES = [
  { stage: 'Stage 1', name: 'LPG Schema & Constraints', desc: 'Define node labels, property constraints, and identity uniqueness keys.', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { stage: 'Stage 2', name: 'Node & Edge Instantiation', desc: 'Batch ingest entity vertices and stitch directed typed edges using Cypher CREATE and MERGE.', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { stage: 'Stage 3', name: 'Index-Free Graph Traversal', desc: 'Execute multi-hop relationship path queries across directed pointer networks.', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { stage: 'Stage 4', name: 'Mutations & Cascading Deletions', desc: 'Manage transactional property updates and enforce referential integrity with DETACH DELETE.', color: 'bg-purple-50 border-purple-200 text-purple-700' },
];

const DEFAULT_OBSERVATIONS =
  '1. Graph Database vs RDBMS: Storing entity data in a Labeled Property Graph replaced complex multi-table SQL joins with O(1) index-free adjacency traversals.\n\n' +
  '2. Cypher Pattern Expressiveness: Pattern matching syntax (MATCH (n)-[r]->(m)) significantly simplified multi-hop queries compared to nested relational joins.\n\n' +
  '3. Referential Integrity (DETACH DELETE): Attempting to remove nodes with connected edges required atomic edge detachment, preventing dangling pointers and preserving graph topological integrity.\n\n' +
  '4. Performance Under Scale: In deep traversal paths (>3 hops), graph database response time remained invariant to total database size, depending only on the local neighborhood degree.';

export default function ReportSection({
  quizScore = 0,
  totalQuestions = 12,
  studentInfo = {},
  recordedTrials = [],
  trials = [],
  onInfoChange,
  onReportGenerated,
}) {
  const activeTrials = trials?.length > 0 ? trials : recordedTrials;

  return (
    <UnifiedReportSection
      expNumber={10}
      expTitle={EXPERIMENT_CONFIG.title}
      expSubtitle={EXPERIMENT_CONFIG.course}
      expCode={EXPERIMENT_CONFIG.lab_code}
      expVersion="2027.1"
      aim="To design, construct, and manage a high-performance Graph Database utilizing the Labeled Property Graph (LPG) paradigm, formulate Declarative Cypher DDL/DML queries, execute index-free relationship traversals, and enforce referential topological constraints."
      objectives={EXPERIMENT_CONFIG.objectives}
      pipelineStages={PIPELINE_STAGES}
      trials={activeTrials}
      renderTrials={(trialList) => (
        !trialList || trialList.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center italic">
            No live trials logged yet. Switch to the Simulation Lab tab and execute Cypher operations.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Trial #</th>
                  <th className="p-2.5">Cypher Query / Operation</th>
                  <th className="p-2.5">Operation Type</th>
                  <th className="p-2.5 text-right">Nodes / Edges Affected</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {trialList.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">{idx + 1}</td>
                    <td className="p-2.5 font-mono text-slate-700 max-w-[200px] truncate">{t.query || t.statement || 'MATCH (n) RETURN n'}</td>
                    <td className="p-2.5 text-indigo-700 font-semibold font-sans">{t.type || 'Traversal'}</td>
                    <td className="p-2.5 text-right text-slate-600">{t.affectedCount ?? (t.nodesCount ? `${t.nodesCount} nodes` : 'Success')}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">Executed</td>
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
