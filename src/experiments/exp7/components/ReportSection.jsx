import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
export { GRADE } from './CertificateSection';

const EXP_META = {
  title: 'Hybrid Keyword and Semantic Retrieval',
  subtitle: 'BM25 Lexical & Dense SentenceTransformer Vector Ensemble',
  code: 'CS-KGIRS-07',
  version: '1.0',
  aim: 'To integrate lexical BM25 keyword matching with dense neural embedding retrieval using linear score interpolation and Reciprocal Rank Fusion (RRF), eliminating keyword vocabulary mismatch while retaining exact-match precision.',
};

const OBJECTIVES = [
  'Understand the vocabulary mismatch problem in lexical IR and the semantic drift problem in dense neural embeddings.',
  'Implement min-max score normalization to project BM25 and Cosine Similarity into a unified [0, 1] range.',
  'Formulate linear score interpolation: Score_hybrid = α · S_bm25 + (1 - α) · S_dense and analyze parameter sweeps.',
  'Implement rank-based Reciprocal Rank Fusion (RRF): RRF(d) = Σ [1 / (k + r_i(d))] with standard smoothing k = 60.',
  'Empirically evaluate Hybrid Retrieval across benchmark queries using Precision@K, Recall@K, MAP, and NDCG.',
];

const PIPELINE_STAGES = [
  { stage: 'Stage 1', name: 'Dual Retrieval Dispatch', desc: 'Parallel query dispatch to lexical inverted index (BM25) and dense vector store (all-MiniLM-L6-v2).', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { stage: 'Stage 2', name: 'Score Normalization', desc: 'Min-max scaling to transform heterogeneous score distributions into calibrated probability margins.', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { stage: 'Stage 3', name: 'Ensemble Fusion (Linear / RRF)', desc: 'Combine scores via weighted convex combination (α) or parameter-free reciprocal rank positions.', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { stage: 'Stage 4', name: 'Final Re-ranking & Deduplication', desc: 'Produce unified top-K result list maximizing semantic relevance while ensuring exact-match coverage.', color: 'bg-teal-50 border-teal-200 text-teal-700' },
];

const SYSTEM_COMPARISONS = [
  { system: '1. Pure BM25 Lexical (α=1.0)', precision: 0.60, recall: 0.50, f1: 0.545, mrr: 0.667, latency: 8.2 },
  { system: '2. Pure Dense Semantic (α=0.0)', precision: 0.80, recall: 0.75, f1: 0.774, mrr: 0.833, latency: 18.5 },
  { system: '3. Hybrid Balanced Fusion (α=0.5)', precision: 1.00, recall: 1.00, f1: 1.000, mrr: 1.000, latency: 12.4 },
  { system: '4. Reciprocal Rank Fusion (RRF)', precision: 0.80, recall: 0.85, f1: 0.824, mrr: 1.000, latency: 14.1 },
];

const DEFAULT_OBSERVATIONS =
  '1. Vocabulary Mismatch Resolution: The hybrid model successfully retrieved relevant documents when queries used conceptual synonyms (e.g. "coronary occlusion" matching "heart attack"), which pure BM25 completely missed.\n\n' +
  '2. Exact Match Retention: When queries contained specific jargon, acronyms, or proper nouns, BM25 preserved critical exact matches where dense semantic models exhibited semantic drift.\n\n' +
  '3. Fusion Calibration: Setting α = 0.5 provided the optimal trade-off across evaluation queries, achieving a perfect 1.000 F1 score and outperforming both individual constituent retrievers.\n\n' +
  '4. Reciprocal Rank Fusion: RRF demonstrated exceptional stability without requiring score calibration or threshold tuning, making it robust against divergent score distributions.';

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
      expNumber={7}
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
            Retrieval Architecture Comparative Benchmark
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">System Pipeline</th>
                  <th className="py-2.5 px-3 text-right">Precision</th>
                  <th className="py-2.5 px-3 text-right">Recall</th>
                  <th className="py-2.5 px-3 text-right">F1 Score</th>
                  <th className="py-2.5 px-3 text-right">MRR</th>
                  <th className="py-2.5 px-3 text-right">Latency (ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {SYSTEM_COMPARISONS.map((sys, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{sys.system}</td>
                    <td className="py-2.5 px-3 text-right text-blue-700">{sys.precision.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700">{sys.recall.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-indigo-700">{sys.f1.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-right text-purple-700">{sys.mrr.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{sys.latency} ms</td>
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
