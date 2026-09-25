import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
export { GRADE } from './CertificateSection';

const EXP_INFO = {
  title: 'Text Preprocessing & Token Normalization',
  subtitle: 'Natural Language Processing & Information Retrieval (NLP & IR)',
  code: 'CS-NLP-02',
  version: '2027.1',
  aim: 'To clean, tokenize, filter, stem, and lemmatize unstructured text using NLP techniques to transform raw data into a standardized format for indexing, Bag-of-Words (BoW) matrices, TF-IDF feature extraction, and neural embeddings.',
};

const OBJECTIVES = [
  'Understand the sequential pipeline of textual normalization from raw string to indexed tokens.',
  'Analyze boundary detection algorithms in tokenization and regex noise/number stripping.',
  "Evaluate stop-word filtering based on term-frequency distributions (Zipf's Law / Pareto Distribution).",
  'Contrast rule-based suffix truncation (Porter Stemmer) with morphological lexicon lookup (WordNet Lemmatizer).',
];

const PIPELINE_STAGES = [
  {
    stage: 'Stage 1',
    name: 'Case Folding & Noise Stripping',
    desc: 'Lowercases characters to eliminate case variants and applies regex pattern [^a-zA-Z\\s] to strip numerical digits, special punctuation, and noise.',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  {
    stage: 'Stage 2',
    name: 'Boundary Tokenization',
    desc: 'Decomposes the sanitized text stream into discrete atomic word units (tokens) based on whitespace and linguistic word boundary delimiters.',
    color: 'bg-violet-50 border-violet-200 text-violet-700',
  },
  {
    stage: 'Stage 3',
    name: "Stop-Word Removal (Zipf's Law)",
    desc: 'Filters out high-frequency functional syntax (179 standard English stopwords) carrying low discriminative entropy, reducing inverted index volume.',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    stage: 'Stage 4',
    name: 'Stemming vs. Lemmatization',
    desc: 'Applies Porter suffix truncation heuristics for speed alongside POS-guided WordNet morphological lookup for valid dictionary canonical forms.',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
  },
];

const DEFAULT_OBSERVATIONS =
  '1. Noise Removal & Normalization: Applying regex noise stripping and case folding eliminated punctuation tokens and merged orthographic variants (e.g., "Apple" and "apple" mapped to the identical term), stabilizing the vocabulary space.\n\n' +
  '2. Stop-word Filtering: Removing the 179 standard NLTK stopwords eliminated ~40-55% of the total token count without degrading informational value, reflecting Zipfian power-law term distributions.\n\n' +
  '3. Porter Stemmer vs. WordNet Lemmatizer: The Porter Stemmer aggressively truncated suffixes via fast rule heuristics, producing non-words like "studi" for "studies". In contrast, WordNet Lemmatization with POS tagging correctly extracted the base lemma "study" and mapped irregular forms like "mice" -> "mouse" and "better" -> "good".\n\n' +
  '4. Retrieval Trade-off: While Stemming executes in O(1) per word with minimal memory footprint, Lemmatization preserves strict grammatical integrity required for semantic and knowledge-graph queries.';

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
      expNumber={2}
      expTitle={EXP_INFO.title}
      expSubtitle={EXP_INFO.subtitle}
      expCode={EXP_INFO.code}
      expVersion={EXP_INFO.version}
      aim={EXP_INFO.aim}
      objectives={OBJECTIVES}
      pipelineStages={PIPELINE_STAGES}
      trials={trials}
      renderTrials={(trialList) => (
        <div className="space-y-4">
          {/* Comparative analysis table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Empirical Comparison: Porter Stemmer vs. WordNet Lemmatizer
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <th className="py-2 px-3">Evaluation Dimension</th>
                    <th className="py-2 px-3">Porter Stemmer (Rule Heuristics)</th>
                    <th className="py-2 px-3">WordNet Lemmatizer (Lexicon + POS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-800">Output Validity</td>
                    <td className="py-2 px-3 text-amber-700">Can produce non-words ('studi', 'oper')</td>
                    <td className="py-2 px-3 text-emerald-700">Always valid English dictionary words</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-800">Computational Speed</td>
                    <td className="py-2 px-3">Extremely Fast (~1.8 µs/token)</td>
                    <td className="py-2 px-3">Moderate (~14.2 µs/token due to POS lookup)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-800">Irregular Forms ('mice', 'better')</td>
                    <td className="py-2 px-3 text-rose-600">Fails ('mice' → 'mice', 'better' → 'better')</td>
                    <td className="py-2 px-3 text-emerald-600">Resolved ('mice' → 'mouse', 'better' → 'good')</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Trials table */}
          {!trialList || trialList.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center italic">
              No live trials logged yet. Switch to the Simulation Lab tab and click "Record Current Trial" to record benchmark runs.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Sample Snippet</th>
                    <th className="py-2 px-3">Raw Tokens</th>
                    <th className="py-2 px-3">Filtered Tokens</th>
                    <th className="py-2 px-3">Tokens Removed</th>
                    <th className="py-2 px-3">Stopwords Stripped</th>
                    <th className="py-2 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                  {trialList.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold">{t['Trial #'] || idx + 1}</td>
                      <td className="py-2 px-3 font-sans truncate max-w-[140px]">{t['Sample Input']}</td>
                      <td className="py-2 px-3">{t['Raw Tokens']}</td>
                      <td className="py-2 px-3 text-emerald-600 font-semibold">{t['Filtered Tokens']}</td>
                      <td className="py-2 px-3 text-rose-600">-{t['Removed Tokens']}</td>
                      <td className="py-2 px-3">{t['Stopwords Removed']}</td>
                      <td className="py-2 px-3 text-slate-400">{t['Timestamp']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
