import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
export { GRADE } from './CertificateSection';

const EXP_INFO = {
  title: 'Integration of Information Retrieval with Knowledge Graphs',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  code: 'CS-KGIRS-14',
  version: '1.0',
  aim: 'To integrate statistical Information Retrieval (BM25 / TF-IDF) with Knowledge Graph relationship expansion, utilizing retrieved documents as initial entry points into an entity subgraph and evaluating enhanced precision and contextual relevance through graph traversal.',
};

const OBJECTIVES = [
  'Understand the synergy between statistical document retrieval and structured knowledge graph traversal.',
  'Extract entity anchors from top-ranked IR documents and map them to corresponding knowledge graph nodes.',
  'Execute subgraph expansion around anchor nodes to discover implicit semantic relationships.',
  'Implement entity-aware re-ranking to boost documents covering multi-hop graph neighborhoods.',
  'Evaluate end-to-end retrieval performance and contextual richness over complex informational queries.',
];

const PIPELINE_STAGES = [
  { stage: 'Stage 1', name: 'Lexical Document Retrieval', desc: 'Execute BM25 keyword query over document collection to generate initial candidate rank list.', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { stage: 'Stage 2', name: 'Entity Linking & Anchor Identification', desc: 'Identify recognized entity mentions in top documents and bind them to Knowledge Graph node URIs.', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { stage: 'Stage 3', name: 'Knowledge Graph Traversal', desc: 'Traverse k-hop relational neighborhoods around anchor entities to discover connected facts.', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { stage: 'Stage 4', name: 'Graph-Augmented Re-ranking', desc: 'Re-score and prioritize documents aligned with expanded subgraph topology.', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
];

const DEFAULT_OBSERVATIONS =
  '1. Dual Advantage: Information Retrieval systems retrieve entry documents, while Knowledge Graph exploration provides critical structured context and multi-hop entity relationships.\n\n' +
  '2. Entity Anchoring: Linking top document entities to graph nodes resolved ambiguities (e.g. distinguishing company vs. product names).\n\n' +
  '3. Contextual Enrichment: Subgraph traversal enriched sparse documents with connected facts, elevating documents that contained multi-hop answers.\n\n' +
  '4. Retrieval Precision: Graph-augmented re-ranking promoted highly authoritative domain documents over generic text with superficial keyword overlap.';

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
      expNumber={14}
      expTitle={EXP_INFO.title}
      expSubtitle={EXP_INFO.subtitle}
      expCode={EXP_INFO.code}
      expVersion={EXP_INFO.version}
      aim={EXP_INFO.aim}
      objectives={OBJECTIVES}
      pipelineStages={PIPELINE_STAGES}
      trials={trials}
      renderTrials={(trialList) => (
        !trialList || trialList.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center italic">
            No live trials logged yet. Switch to the Simulation Lab tab and record integrated IR-KG trials.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Query</th>
                  <th className="py-2.5 px-3">Top Document</th>
                  <th className="py-2.5 px-3 text-center">Graph Edges</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-3 text-right">Latency (ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {trialList.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-bold text-slate-600">{idx + 1}</td>
                    <td className="py-2 px-3 font-sans text-slate-700">{t.query}</td>
                    <td className="py-2 px-3 font-sans text-slate-800 line-clamp-1">{t.topDoc || t.selectedDoc || '—'}</td>
                    <td className="py-2 px-3 text-center text-indigo-700 font-bold">{t.graphEdges ?? 4}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">
                      {typeof t.topScore === 'number' ? t.topScore.toFixed(3) : (t.score || '—')}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500">{t.time || '18.2'}</td>
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
