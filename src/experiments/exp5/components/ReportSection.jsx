import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
export { GRADE } from './CertificateSection';

const EXP_INFO = {
  title: 'BM25 Based Document Ranking',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems',
  code: 'IR-BM25-05',
  version: '2027.1',
  aim: 'To implement the Okapi BM25 probabilistic document ranking function, investigate the mathematical mechanisms of term frequency saturation (k₁) and document length normalization (b), and benchmark retrieval effectiveness against the Vector Space Model (TF-IDF) using standard IR evaluation metrics (P@K, R@K, F1, MRR, nDCG@K, and Kendall τ).',
};

const OBJECTIVES = [
  'Formulate the non-linear probabilistic Okapi BM25 scoring equation and Robertson smoothed IDF.',
  'Analyze the asymptotic behavior of Term Frequency (TF) saturation controlled by parameter k₁.',
  'Examine document length normalization parameterized by b relative to average document length (avgdl).',
  'Benchmark Okapi BM25 ranking performance against baseline TF-IDF using standard IR evaluation metrics.'
];

const PIPELINE_STAGES = [
  {
    stage: 'Stage 1',
    name: 'Corpus Collection & Preprocessing',
    desc: 'Ingest text collection, apply tokenization, case normalization, stop-word elimination, and suffix stemming to construct the clean vocabulary V.',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    stage: 'Stage 2',
    name: 'Collection Statistics & Robertson IDF',
    desc: 'Compute corpus length average (avgdl), per-document token counts |D|, and smoothed Robertson IDF = ln(1 + (N - n(q) + 0.5) / (n(q) + 0.5)).',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  {
    stage: 'Stage 3',
    name: 'Saturated TF with Length Normalization',
    desc: 'Calculate bounded term frequency factor [f · (k₁ + 1)] / [f + k₁ · (1 - b + b · |D| / avgdl)], capping keyword stuffing impact at (k₁ + 1).',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
  },
  {
    stage: 'Stage 4',
    name: 'Multi-Metric IR Evaluation & Benchmarking',
    desc: 'Evaluate top-K document relevance runs against gold-standard judgements using P@K, Recall@K, MRR, MAP, nDCG@K, and Kendall τ correlation.',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
];

const DEFAULT_OBSERVATIONS =
  '1. Term Frequency Saturation (k₁ Parameter Behavior):\n' +
  'Under baseline TF-IDF, spammed documents with extreme keyword repetition dominated rankings. Testing in the Term-Saturation scenario confirmed that BM25 bounds this impact asymptotically at (k₁ + 1). Setting k₁ = 1.5 allowed natural term occurrences to accumulate relevance while preventing keyword stuffing from distorting top-K results.\n\n' +
  '2. Document Length Normalization (b Parameter Behavior):\n' +
  'In the Length-Normalization scenario, setting b = 0.75 appropriately penalized long, verbose documents containing extraneous padding. Sweeping b from 0 to 1 demonstrated that b = 0 ignored document size completely, while b = 1 penalized long documents strictly inversely to length.\n\n' +
  '3. Robertson / Lucene Smoothed IDF:\n' +
  'Computing Robertson smoothed IDF guaranteed strictly positive weights across all query terms. Ubiquitous terms appearing in high document proportions were appropriately down-weighted without producing negative values or undefined division errors.\n\n' +
  '4. Comparative Benchmarking vs. TF-IDF:\n' +
  'Across preset benchmark queries evaluated against gold-standard judgements, BM25 achieved superior Precision@5 and nDCG@5 scores compared to TF-IDF cosine similarity. Kendall\'s Tau rank correlation highlighted non-trivial rank inversions where BM25 promoted concise, topic-focused documents over verbose competitors.';

export default function ReportSection({
  studentInfo = {},
  onInfoChange,
  trials = [],
  quizScore = 0,
  totalQuestions = 10,
  onReportGenerated,
}) {
  return (
    <UnifiedReportSection
      expNumber={5}
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
            No live trials logged yet. Switch to the Simulation Lab tab and record benchmark runs.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl text-xs">
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Query</th>
                  <th className="p-2.5">k₁ / b</th>
                  <th className="p-2.5">Top-1 Ranked Document</th>
                  <th className="p-2.5 text-right">P@5</th>
                  <th className="p-2.5 text-right">nDCG@5</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trialList.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 text-slate-400">{t.timestamp || `T-${idx + 1}`}</td>
                    <td className="p-2.5 font-bold text-slate-800 font-sans">{t.query}</td>
                    <td className="p-2.5 text-slate-600">{t.k1 ?? 1.5} / {t.b ?? 0.75}</td>
                    <td className="p-2.5 text-slate-800 font-sans">{t.topDocTitle || t.top1Doc || '—'}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">
                      {t.pAt5 ? `${(t.pAt5 * 100).toFixed(0)}%` : '—'}
                    </td>
                    <td className="p-2.5 text-right font-bold text-blue-700">
                      {t.ndcgAt5 ? t.ndcgAt5.toFixed(3) : '—'}
                    </td>
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
