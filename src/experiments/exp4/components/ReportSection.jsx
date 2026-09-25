import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
export { GRADE } from './CertificateSection';

const EXP_INFO = {
  title: 'TF-IDF Based Document Retrieval',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems',
  code: 'IR-VSM-04',
  version: '2027.1',
  aim: 'To represent a document collection and search queries as TF-IDF weighted vectors in Salton\'s vector space model, rank documents using L2-normalized cosine similarity, and systematically evaluate the impact of term frequency scaling and inverse document frequency dampening across retrieval evaluation benchmarks (Precision@k, Recall@k, MAP, and nDCG).',
};

const OBJECTIVES = [
  'Construct a corpus vocabulary through lower-casing, regex cleaning, and stop-word filtering.',
  'Formulate local Term Frequency (TF) using raw, length-normalized, and log-scaled schemes.',
  'Compute global Document Frequency (df) and Sparck Jones Inverse Document Frequency (IDF).',
  'Calculate L2-normalized Cosine Similarity to neutralize document length bias.',
  'Evaluate retrieval performance using Precision@k, Recall@k, MAP, and rank-discounted nDCG@k.'
];

const PIPELINE_STAGES = [
  {
    stage: 'Stage 1',
    name: 'Corpus Collection & Ingestion',
    desc: 'Load unstructured multi-document text collections, split into clean document records, and establish document identifiers (D1..Dn).',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    stage: 'Stage 2',
    name: 'Tokenization & Stop-Word Removal',
    desc: 'Lower-case strings, strip non-alphanumeric punctuation, drop English stop-words, and extract shared collection vocabulary V.',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  {
    stage: 'Stage 3',
    name: 'TF & IDF Statistical Weighting',
    desc: 'Compute local term frequency tf(t, d) and collection-wide inverse document frequency idf(t) = log10(N / df_t).',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
  },
  {
    stage: 'Stage 4',
    name: 'Vector Space Projection & Scoring',
    desc: 'Synthesize sparse TF-IDF vectors w(t, d) = tf * idf and evaluate directional cosine alignment cos(q, d) = (q . d) / (||q|| * ||d||).',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
];

const DEFAULT_OBSERVATIONS =
  '1. Length Normalization vs. Raw Term Frequency:\n' +
  'Under raw term count TF, longer documents accumulated artificially inflated scores solely due to higher total word volume. Switching to Length-Normalized TF (count / |d|) successfully eliminated this distortion, allowing concise, highly-focused documents to outrank bloated ones.\n\n' +
  '2. Logarithmic Term Frequency Scaling:\n' +
  'Evaluating 1 + log10(tf) demonstrated diminishing returns for repetitive terms. An article mentioning a query term 10 times was properly valued as moderately more relevant than one mentioning it twice, without completely overpowering documents containing all other query terms.\n\n' +
  '3. Rarity as Information (IDF Behavior):\n' +
  'In the Web Search and Spam Filtering benchmarks, generic terms appearing across almost all documents had their weights dampened to zero (log10(N/N) = 0). Rare diagnostic keywords (e.g., "reset", "urgent", "suspended") received maximum IDF weight and accurately drove the top-1 ranked document.\n\n' +
  '4. Cosine Normalization vs. Dot Product:\n' +
  'Without cosine normalization, the raw dot product re-introduced severe document length bias. Dividing by the Euclidean norms ||q||2 · ||d||2 proved essential for achieving length-invariant semantic retrieval in high-dimensional vector spaces.';

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
      expNumber={4}
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
                  <th className="p-2.5">Corpus</th>
                  <th className="p-2.5">TF Scheme</th>
                  <th className="p-2.5">Top Result</th>
                  <th className="p-2.5 text-right">Cosine Sim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trialList.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 text-slate-400">{t.timestamp || `T-${idx + 1}`}</td>
                    <td className="p-2.5 font-bold text-slate-800 font-sans">{t.query}</td>
                    <td className="p-2.5 text-slate-600 font-sans">{t.corpusName}</td>
                    <td className="p-2.5 text-purple-700 font-sans">{t.tfScheme}</td>
                    <td className="p-2.5 text-slate-800 font-sans">{t.topDocTitle || t.top1Doc || '—'}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">
                      {typeof t.topDocScore === 'number' ? t.topDocScore.toFixed(4) : (t.score || '—')}
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
