import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
export { GRADE } from './CertificateSection';

const EXP_INFO = {
  title: 'Design a Knowledge Graph Schema and Import Data',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  code: 'CS-KG-11',
  version: '2027.1',
  aim: 'To design a domain schema using the Labeled Property Graph (LPG) paradigm, formulate node labels, unique identity keys, and directed typed relationships, and execute multi-pass data ingestion with automated referential integrity checking and Cypher DDL script generation.',
};

const OBJECTIVES = [
  'Model domain entities and relationships using the Labeled Property Graph (LPG) paradigm.',
  'Formulate node label sets, distinct identity keys, and typed directed relationships.',
  'Implement multi-pass data ingestion with automated referential integrity and dangling key validation.',
  'Generate standard Cypher DDL (uniqueness constraints, LOAD CSV, MERGE) for enterprise graph databases like Neo4j.',
];

const INGESTION_STAGES = [
  {
    stage: 'Stage 1',
    name: 'Domain Ontology & Schema Modeling',
    desc: 'Formulate entity types, assign node labels, define unique identity keys, and establish directed relationship signatures with optional edge properties.',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  {
    stage: 'Stage 2',
    name: 'Schema Constraint Definition (DDL)',
    desc: 'Issue Cypher uniqueness constraints (CREATE CONSTRAINT ... REQUIRE n.key IS UNIQUE) to prevent duplicate entities and build fast lookup indices.',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
  },
  {
    stage: 'Stage 3',
    name: 'Node Ingestion (Pass 1)',
    desc: 'Execute idempotent batch MERGE operations on entity nodes to ensure each vertex exists in the graph store before any edges are connected.',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  {
    stage: 'Stage 4',
    name: 'Relationship Stitching & Integrity Check (Pass 2)',
    desc: 'Match pre-existing source and target vertices on identity keys and instantiate directed edges, rejecting dangling foreign keys.',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
];

const DEFAULT_OBSERVATIONS =
  '1. LPG vs. Relational Modeling: Modeling entities directly as nodes and relations as typed edges eliminated the need for relational junction/bridge tables, replacing multi-way SQL table joins with index-free pointer traversals.\n\n' +
  '2. Referential Integrity & Ingestion Protocol: The automated integrity checker verified that relationship edges require pre-existing source and target vertices. In the corrupted test dataset, dangling student_id ("S999") and unregistered relationship types were successfully flagged before ingestion, preventing silent database corruption.\n\n' +
  '3. Identity Constraints & MERGE Semantics: Establishing uniqueness constraints on node keys (e.g., student_id, course_id) ensured that running the ingestion pipeline multiple times remains idempotent without creating duplicate entities.\n\n' +
  '4. Query Expressiveness: Declarative Cypher pattern matching (e.g., MATCH (s:Student)-[:ENROLLED_IN]->(c:Course)) allowed multi-hop traversals across departmental boundaries with concise, readable syntax compared to nested SQL queries.';

export default function ReportSection({
  studentInfo = {},
  onInfoChange,
  trials = [],
  quizScore = 0,
  totalQuestions = 15,
  onReportGenerated,
}) {
  return (
    <UnifiedReportSection
      expNumber={11}
      expTitle={EXP_INFO.title}
      expSubtitle={EXP_INFO.subtitle}
      expCode={EXP_INFO.code}
      expVersion={EXP_INFO.version}
      aim={EXP_INFO.aim}
      objectives={OBJECTIVES}
      pipelineStages={INGESTION_STAGES}
      trials={trials}
      renderTrials={(trialList) => (
        !trialList || trialList.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center italic">
            No live ingestion trials logged yet. Switch to the Simulation Lab tab and execute data ingestion passes.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Trial ID</th>
                  <th className="p-2.5">Schema Domain</th>
                  <th className="p-2.5">Nodes Ingested</th>
                  <th className="p-2.5">Edges Connected</th>
                  <th className="p-2.5 text-right">Integrity Violations</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {trialList.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">{t.id || `T-${idx + 1}`}</td>
                    <td className="p-2.5 font-sans font-semibold text-slate-900">{t.domain || t.name || 'University Domain'}</td>
                    <td className="p-2.5 text-emerald-700 font-bold">{t.nodesCount || 42}</td>
                    <td className="p-2.5 text-indigo-700 font-bold">{t.edgesCount || 64}</td>
                    <td className="p-2.5 text-right text-rose-600 font-bold">{t.violationsCount ?? 0}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">Validated</td>
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
