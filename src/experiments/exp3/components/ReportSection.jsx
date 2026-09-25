import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
export { GRADE } from './CertificateSection';

const EXP_INFO = {
  title: 'Construction of an Inverted Index',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  code: 'CS-KGIRS-03',
  version: '1.0',
  aim: 'To construct and analyze an Inverted Index data structure for a collection of textual documents, explore linguistic preprocessing transformations (tokenization, stopword removal, stemming), and execute Boolean, phrase, and proximity queries with linear-time pointer-merge algorithms.',
};

const OBJECTIVES = [
  'Construct an Inverted Index data structure mapping vocabulary terms to documents, term frequencies (tf), and token positions.',
  'Trace the 4 core pipeline stages: Document Tokenization, Pair Extraction, Lexicographic Sorting, and Postings Inversion.',
  'Implement and visualize linear-time Boolean retrieval (AND, OR, NOT) using sorted posting list pointer intersections.',
  'Execute positional phrase queries and proximity searches by matching token offsets within identical document postings.',
  'Quantify the empirical effect of linguistic preprocessing on vocabulary size and index compression.',
  "Analyze collection-wide term frequency distributions and validate Zipf's Law and Heaps' Law.",
];

const PIPELINE_STAGES = [
  { stage: 'Stage 1', name: 'Token Stream Extraction', desc: 'Tokenize each document with case folding, punctuation removal, stopword filtering, and Porter stemming.', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { stage: 'Stage 2', name: '(Term, DocID, Position) Triples', desc: 'For each token in each document, emit a triple used as the raw building block of the index.', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { stage: 'Stage 3', name: 'Lexicographic Sort', desc: 'Sort all triples by (term, docId, position) to group entries for the same term contiguously.', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { stage: 'Stage 4', name: 'Postings List Inversion', desc: 'Aggregate consecutive triples by term to build df, cf, and postings dict {docId: {tf, positions[]}}.', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
];

const DEFAULT_OBSERVATIONS =
  '1. Inverted Index Construction: The 4-stage inverted index construction pipeline (Tokenization → Triple Extraction → Lexicographic Sort → Postings Inversion) produced an efficient positional index supporting multiple retrieval modes at sub-millisecond latencies.\n\n' +
  '2. Conjunctive Boolean Retrieval: Conjunctive Boolean queries (AND) executed via the two-pointer intersection algorithm in O(L₁ + L₂) time without backtracking, demonstrating the core advantage of sorted postings lists. Sort-order-based query optimization (processing terms in increasing df order) minimizes intermediate candidate set sizes substantially.\n\n' +
  '3. Positional and Proximity Search: Positional postings extended the index to support exact phrase verification (pos₂ = pos₁ + 1) and proximity search (|pos₁ − pos₂| ≤ k) with zero false positives beyond candidate filtering. Linguistic preprocessing (stopword removal + Porter stemming) compressed the vocabulary consistent with Heaps\' Law predictions, reducing redundant terms while improving recall.\n\n' +
  '4. Zipfian Distribution: Term frequency distributions observed across all corpora conformed to the heavy-tailed power law described by Zipf\'s Law, with the top 10 terms accounting for a disproportionate fraction of total tokens.';

export default function ReportSection({
  quizScore = 0,
  totalQuestions = 10,
  studentInfo = {},
  trials = [],
  onInfoChange,
  onReportGenerated
}) {
  return (
    <UnifiedReportSection
      expNumber={3}
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
            No live trials logged yet. Switch to the Simulation Lab tab and record index runs.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Corpus</th>
                  <th className="py-2.5 px-3 text-center">Stopwords</th>
                  <th className="py-2.5 px-3 text-center">Stemming</th>
                  <th className="py-2.5 px-3 text-center">Vocab |V|</th>
                  <th className="py-2.5 px-3">Query</th>
                  <th className="py-2.5 px-3 text-center">Hits</th>
                  <th className="py-2.5 px-3 text-center">Latency (µs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {trialList.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-bold text-slate-600">{i + 1}</td>
                    <td className="py-2 px-3 font-sans text-slate-700">{t.corpus}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.stopwords === 'Yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{t.stopwords}</span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.stemming === 'Yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{t.stemming}</span>
                    </td>
                    <td className="py-2 px-3 text-center text-slate-700">{t.vocabSize}</td>
                    <td className="py-2 px-3 font-sans text-slate-600 max-w-[120px] truncate">{t.query}</td>
                    <td className="py-2 px-3 font-bold text-center text-slate-700">{t.hits}</td>
                    <td className="py-2 px-3 text-center text-slate-500">{t.timeUs}</td>
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
