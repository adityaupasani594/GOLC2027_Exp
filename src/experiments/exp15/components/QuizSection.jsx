import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'A system retrieves 8 documents. 5 are relevant and there are 10 relevant documents in the corpus. What is Precision@8?',
    options: ['0.500', '0.625', '0.750', '0.800'],
    answer: 1,
    explanation: 'Precision@8 = relevant retrieved / k = 5/8 = 0.625. Recall@8 = 5/10 = 0.500.',
  },
  {
    id: 2,
    question: 'Which metric specifically measures how many of all relevant documents were found?',
    options: ['Precision@k', 'F1-Score', 'Recall@k', 'MRR'],
    answer: 2,
    explanation: 'Recall = (relevant retrieved) / (total relevant). It quantifies coverage of the relevant set.',
  },
  {
    id: 3,
    question: 'If Precision = 0.6 and Recall = 0.4, what is the F1-Score?',
    options: ['0.480', '0.500', '0.600', '0.400'],
    answer: 0,
    explanation: 'F1 = 2·P·R / (P+R) = 2·0.6·0.4 / (0.6+0.4) = 0.48/1.0 = 0.480.',
  },
  {
    id: 4,
    question: 'Across 3 queries, the first relevant document appears at ranks 1, 2, and 4 respectively. What is MRR?',
    options: ['0.583', '0.500', '0.417', '0.750'],
    answer: 0,
    explanation: 'MRR = (1/3)·(1/1 + 1/2 + 1/4) = (1/3)·1.75 ≈ 0.583.',
  },
  {
    id: 5,
    question: 'Which retrieval system uses Reciprocal Rank Fusion to combine multiple ranked lists?',
    options: ['Keyword (BM25)', 'Semantic (Dense)', 'Hybrid', 'Graph (GraphRAG)'],
    answer: 2,
    explanation: 'Hybrid retrieval applies RRF to merge BM25 and dense vector ranked lists into a single unified ranking.',
  },
  {
    id: 6,
    question: 'BM25 uses two key parameters k₁ and b. What does the parameter b control?',
    options: ['Term frequency saturation', 'Document length normalisation', 'Query expansion weight', 'IDF smoothing'],
    answer: 1,
    explanation: 'The parameter b (0 ≤ b ≤ 1) controls document-length normalisation. b=1 is full normalisation; b=0 disables it.',
  },
  {
    id: 7,
    question: 'A system has Perfect Precision (P=1.0) but very low Recall (R=0.1). Its F1-Score is approximately:',
    options: ['0.182', '0.550', '1.000', '0.100'],
    answer: 0,
    explanation: 'F1 = 2·1.0·0.1 / (1.0+0.1) = 0.2/1.1 ≈ 0.182. The harmonic mean heavily penalises extreme imbalance.',
  },
  {
    id: 8,
    question: 'For which type of query does GraphRAG typically outperform flat retrieval systems?',
    options: ['Simple keyword lookup', 'Multi-hop relational queries', 'Single-sentence factoid questions', 'Exact-phrase search'],
    answer: 1,
    explanation: 'GraphRAG traverses knowledge-graph edges to answer multi-hop questions requiring synthesis of related facts.',
  },
  {
    id: 9,
    question: 'If a system returns 0 relevant documents at any rank, what is MRR?',
    options: ['1.0', 'undefined (∞)', '0.0', '0.5'],
    answer: 2,
    explanation: 'If no relevant document is found, the reciprocal rank = 1/∞ → 0. So MRR = 0.0 for that query.',
  }
];

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={15}
      expTitle="Evaluation of Retrieval Systems"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
