import React, { useMemo } from 'react';
import { UnifiedReportSection } from '../../../components/common';
import { EXPERIMENT, getComparisonTable } from '../data/labData';
export { GRADE } from './CertificateSection';

const PIPELINE_STAGES = [
  { stage: 'Stage 1', name: 'Keyword Search Baseline', desc: 'BM25 probabilistic lexical retrieval scoring term frequencies and document lengths.', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { stage: 'Stage 2', name: 'Dense Semantic Vector Search', desc: 'Sentence-transformer embeddings capturing latent conceptual and syntactic similarity.', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { stage: 'Stage 3', name: 'Hybrid Linear / RRF Fusion', desc: 'Convex combination and rank reciprocal fusion balancing lexical precision and semantic recall.', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { stage: 'Stage 4', name: 'Graph-Augmented Re-ranking', desc: 'Knowledge Graph topological propagation boosting multi-hop relationship coherence.', color: 'bg-purple-50 border-purple-200 text-purple-700' },
];

const DEFAULT_OBSERVATIONS =
  '1. Comprehensive IR Benchmark: Evaluating all 4 paradigms revealed that Knowledge Graph Augmented Search achieved the highest MRR (0.833) and top-1 precision, successfully resolving complex multi-hop queries.\n\n' +
  '2. Hybrid vs. Pure Baselines: Hybrid Search consistently outranked both pure Keyword (BM25) and pure Dense Semantic search across all standard metrics (Precision@8: 0.750, Recall@8: 0.600, F1: 0.667).\n\n' +
  '3. Trade-off Analysis: While pure BM25 provided the lowest latency (3.2 ms), Graph-Augmented Search delivered superior semantic relevance and verified factual grounding at 18.4 ms latency.\n\n' +
  '4. Architectural Conclusion: Real-world enterprise IR systems achieve optimal performance through a multi-stage funnel: fast BM25/Vector retrieval followed by Graph-aware neural re-ranking.';

export default function ReportSection({
  quizScore = 0,
  totalQuestions = 10,
  studentInfo = {},
  trials = [],
  onInfoChange,
  onReportGenerated,
}) {
  const table = useMemo(() => getComparisonTable(), []);

  return (
    <UnifiedReportSection
      expNumber={15}
      expTitle={EXPERIMENT.title}
      expSubtitle={EXPERIMENT.subtitle}
      expCode={EXPERIMENT.code}
      expVersion={EXPERIMENT.version}
      aim={EXPERIMENT.aim}
      objectives={EXPERIMENT.objectives}
      pipelineStages={PIPELINE_STAGES}
      trials={trials}
      renderTrials={() => (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Comparative Architecture Benchmark Matrix
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Retrieval Architecture</th>
                  <th className="py-2.5 px-3 text-right">Precision@8</th>
                  <th className="py-2.5 px-3 text-right">Recall@8</th>
                  <th className="py-2.5 px-3 text-right">F1 Score</th>
                  <th className="py-2.5 px-3 text-right">MRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {table.map((row) => (
                  <tr key={row.system} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                      {row.label}
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-700">
                      {row.precision.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700">
                      {row.recall.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-indigo-700">
                      {row.f1.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-purple-700">
                      {row.mrr.toFixed(3)}
                    </td>
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
