import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
export { GRADE } from './CertificateSection';

const EXP_INFO = {
  title: 'Identify Graph Entities & Probabilistic Retrieval Performance',
  subtitle: 'Knowledge Graph & Information Retrieval System (KGIRS)',
  code: 'KGIRS-EXP-08',
  version: '2027.1',
  aim: 'To extract named entities (Persons, Organizations, Locations, Concepts) from unstructured text, construct directional Knowledge Graph topologies with relational triples, formulate the Okapi BM25 probabilistic retrieval equation, and empirically benchmark comparative retrieval effectiveness (Precision@K, Recall@K, MAP, NDCG) between keyword search and entity-aware ranking.',
};

const OBJECTIVES = [
  'Perform rule-based, regex, and gazetteer-driven Named Entity Recognition on diverse domain texts.',
  'Synthesize structured (Subject, Predicate, Object) relational triples and assemble semantic graph topologies.',
  'Implement and calibrate the Okapi BM25 probabilistic model with tunable term-saturation (k₁) and length normalization (b).',
  'Quantify empirical retrieval improvements achieved by boosting recognized Knowledge Graph entity instances over pure keyword search.'
];

const PIPELINE_STAGES = [
  {
    stage: 'Stage 1',
    name: 'Entity Extraction & Classification',
    desc: 'Parse unstructured passages using multi-word gazetteer matching and syntactic heuristics to identify PERSON, ORG, LOC, and CONCEPT mentions.',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  {
    stage: 'Stage 2',
    name: 'Knowledge Graph Topology Synthesis',
    desc: 'Extract relational triples (Subject, Predicate, Object) from co-occurring entity pairs and construct an interactive network topology.',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
  },
  {
    stage: 'Stage 3',
    name: 'Okapi BM25 Probabilistic Scoring',
    desc: 'Compute Robertson smoothed IDF and non-linear saturated TF factors normalized by document length relative to avgdl.',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  {
    stage: 'Stage 4',
    name: 'Entity-Aware Hybrid Ranking & Benchmark',
    desc: 'Augment BM25 relevance with entity boost weight (λ) and calculate standard IR evaluation metrics: Precision@K, Recall@K, MAP, and NDCG.',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
  },
];

const DEFAULT_OBSERVATIONS = 
  '1. Named Entity Recognition & Knowledge Graph Extraction:\n' +
  'Gazetteer-guided entity extraction achieved high precision for proper nouns and organizations (e.g. "Elena Voss", "Lakeside University", "Deep Learning"). Multi-token entity boundaries were preserved cleanly, avoiding partial split errors. Co-occurrence relational parsing successfully synthesized semantic triples such as (Elena Voss, affiliated_with, Lakeside University).\n\n' +
  '2. BM25 Hyperparameter Sensitivity (k₁ and b):\n' +
  'Setting k₁ = 1.5 bounded term frequency saturation effectively, preventing repeated query terms from dominating the score. Setting b = 0.75 properly balanced length normalization against verbose documents.\n\n' +
  '3. Comparative IR Evaluation (Baseline vs Entity-Boosted BM25):\n' +
  'Incorporating Knowledge Graph entities (λ = 1.8) improved both Precision@3 and Mean Average Precision (MAP) over pure keyword search, as documents explicitly discussing recognized entity instances were correctly prioritized in the top ranks.';

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
      expNumber={8}
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
            No live trials logged yet. Switch to the Simulation Lab tab and click "Log to Report" to record benchmark runs.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Trial ID</th>
                  <th className="p-2.5">Target Query</th>
                  <th className="p-2.5">k₁ / b / λ</th>
                  <th className="p-2.5">Top-1 Ranked Document</th>
                  <th className="p-2.5 text-right">P@3</th>
                  <th className="p-2.5 text-right">MAP</th>
                  <th className="p-2.5 text-right">NDCG@3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {trialList.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800">{t.id}</td>
                    <td className="p-2.5 font-sans text-slate-700 line-clamp-1">{t.query}</td>
                    <td className="p-2.5 text-slate-500">{t.k1} / {t.b} / {t.entityBoostWeight}</td>
                    <td className="p-2.5 font-sans font-semibold text-slate-900 line-clamp-1">{t.top1Doc}</td>
                    <td className="p-2.5 text-right text-emerald-700 font-bold">{t.precisionAtK}%</td>
                    <td className="p-2.5 text-right text-blue-700 font-bold">{t.map}%</td>
                    <td className="p-2.5 text-right text-purple-700 font-bold">{t.ndcgAtK}%</td>
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
