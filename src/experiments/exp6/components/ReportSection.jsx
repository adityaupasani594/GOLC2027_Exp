import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
export { GRADE } from './CertificateSection';

const EXP_INFO = {
  title: 'Dense Embedding-Based Semantic Search',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  code: 'CS-KGIRS-06',
  version: '1.0',
  aim: 'To implement and analyse a dense embedding-based semantic search system using the all-MiniLM-L6-v2 sentence-transformer model, compute cosine similarity scores for query-document matching, visualise the 384-dimensional vector space via PCA, and evaluate the system using Precision@K, Recall@K, F1@K and MRR.',
};

const OBJECTIVES = [
  'Encode documents and queries into 384-dimensional dense vectors using the all-MiniLM-L6-v2 sentence-transformer.',
  'Compute L2-normalised cosine similarity between query and document embeddings for ranked retrieval.',
  'Visualise the high-dimensional embedding space using 2-D PCA projections.',
  'Run Top-K retrieval with a configurable similarity threshold and record results.',
  'Evaluate retrieval quality using Precision@K, Recall@K, F1@K, and Mean Reciprocal Rank (MRR).',
  'Compare dense semantic retrieval with traditional keyword-based search and discuss trade-offs.',
];

const PIPELINE_STAGES = [
  { stage: 'Stage 1', name: 'Document Collection', desc: 'Assemble a structured corpus of documents across multiple domains.', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { stage: 'Stage 2', name: 'Offline Embedding (Index)', desc: 'Encode each document via all-MiniLM-L6-v2 into a 384-D unit vector. Store the index.', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { stage: 'Stage 3', name: 'Query Encoding (Online)', desc: 'At query time, encode the user query with the same model into a 384-D query vector.', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { stage: 'Stage 4', name: 'Cosine Similarity Scoring', desc: 'Dot-multiply query vector against all document vectors (O(N × 384)).', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { stage: 'Stage 5', name: 'Top-K Ranking & Return', desc: 'Sort by descending cosine similarity. Return Top-K results above threshold.', color: 'bg-blue-50 border-blue-200 text-blue-700' },
];

const DEFAULT_OBSERVATIONS =
  '1. Dense Representation: Dense sentence embeddings captured semantic similarity even in the absence of lexical keyword overlap (e.g., "physician" matched "doctor" with high cosine similarity).\n\n' +
  '2. Vector Normalization: L2 normalization ensured dot products directly corresponded to cosine distances, producing bounded similarity scores in [-1, 1].\n\n' +
  '3. Dimensionality Reduction: PCA 2D projections confirmed distinct cluster separation between topical domains (AI, Medicine, Space Exploration, Finance).\n\n' +
  '4. Semantic Retrieval Trade-offs: Dense search demonstrated superior recall for conceptual queries, while exact keyword lookups (serial codes, product IDs) are better served by hybrid indexing.';

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
      expNumber={6}
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
            No live trials logged yet. Switch to the Simulation Lab tab and record semantic search queries.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Query</th>
                  <th className="py-2.5 px-3">Top Match</th>
                  <th className="py-2.5 px-3">Domain</th>
                  <th className="py-2.5 px-3 text-right">Similarity</th>
                  <th className="py-2.5 px-3 text-right">Latency (ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {trialList.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-bold text-slate-600">{idx + 1}</td>
                    <td className="py-2 px-3 font-sans text-slate-700">{t.query}</td>
                    <td className="py-2 px-3 font-sans text-slate-800 line-clamp-1">{t.topMatch || t.top1Doc || '—'}</td>
                    <td className="py-2 px-3 text-indigo-700">{t.domain || 'Multi-domain'}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">
                      {typeof t.similarity === 'number' ? t.similarity.toFixed(4) : (t.score || '—')}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500">{t.latency || '12.4'}</td>
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
