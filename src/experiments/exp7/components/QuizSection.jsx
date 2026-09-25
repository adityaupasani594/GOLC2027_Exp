import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is Okapi BM25 in Information Retrieval?",
    options: [
      "A probabilistic lexical retrieval model that evaluates term frequency saturation and document length normalization",
      "A dense neural network encoder generating 384-dimensional vector embeddings",
      "A database query language used exclusively for graph databases",
      "An image compression algorithm for scientific figures"
    ],
    answer: 0,
    explanation: "Okapi BM25 is a non-linear probabilistic lexical search function that scores documents based on matched query terms, term saturation (k1), and length penalty (b)."
  },
  {
    id: 2,
    question: "In the BM25 formula, what is the primary role of hyperparameter k1?",
    options: [
      "It controls term frequency saturation, capping the marginal score gain as term repetitions increase",
      "It sets the exact dimension of the dense vector space",
      "It completely disables document length normalization",
      "It converts negative numbers into positive percentages"
    ],
    answer: 0,
    explanation: "k1 governs term frequency saturation. As f(t,d) increases, score contribution approaches a finite ceiling rather than growing linearly indefinitely."
  },
  {
    id: 3,
    question: "How does hyperparameter b influence document length normalization in BM25 scoring?",
    options: [
      "b = 1.0 applies full length normalization penalty to verbose documents; b = 0.0 disables length normalization completely",
      "b = 0.0 penalizes short documents and rewards long documents",
      "b multiplies all BM25 scores by 100%",
      "b is only used when evaluating image search results"
    ],
    answer: 0,
    explanation: "b controls document length normalization penalty. When b > 0, longer documents are scaled down so that verbose texts do not rank highly merely by accumulating words."
  },
  {
    id: 4,
    question: "Why must raw BM25 scores and Dense Semantic scores be normalized (e.g. Min-Max scaling) prior to hybrid score fusion?",
    options: [
      "Because raw BM25 scores (0 to 30+) and dense cosine similarity (-1 to 1) have unequal scale distributions, causing unnormalized BM25 to dominate unfairly",
      "Because dense vectors cannot be added to scalar numbers",
      "Score normalization is mathematically unnecessary for hybrid search",
      "To convert document IDs into alphabetical order"
    ],
    answer: 0,
    explanation: "Raw BM25 and dense similarity scores have unequal scale bounds. Min-Max normalization rescales both to [0, 1] so that parameter α fairly weights their relative contributions."
  },
  {
    id: 5,
    question: "In the hybrid score equation Hybrid Score = α × S_BM25 + (1-α) × S_sem, what occurs when α = 0.0?",
    options: [
      "The system performs 100% Dense Semantic vector retrieval using Sentence Transformers",
      "The system performs 100% Lexical BM25 retrieval",
      "All document scores evaluate to zero",
      "The system randomly shuffles document rankings"
    ],
    answer: 0,
    explanation: "When α = 0.0, the BM25 contribution becomes zero, resulting in pure dense semantic vector retrieval."
  },
  {
    id: 6,
    question: "Which retrieval paradigm handles the 'Vocabulary Mismatch Problem' (synonyms/paraphrasing) most effectively?",
    options: [
      "Dense Semantic retrieval using SentenceTransformers",
      "Exact string keyword matching",
      "BM25 lexical search",
      "Sorting documents by publication date"
    ],
    answer: 0,
    explanation: "Dense semantic encoders map queries and documents into a shared continuous vector space, capturing conceptual meaning even when exact terms differ."
  },
  {
    id: 7,
    question: "In what search scenario does Lexical BM25 typically outperform Dense Semantic retrieval?",
    options: [
      "Searching for rare medical model codes, exact gene acronyms (e.g. MGMT), or specific technical jargon",
      "Searching for broad abstract concepts like 'feeling tired'",
      "Processing foreign language translations",
      "Summarizing long textbook chapters"
    ],
    answer: 0,
    explanation: "Lexical BM25 excels at exact token matching for precise jargon, model codes, and rare proper nouns that neural encoders might smooth out."
  },
  {
    id: 8,
    question: "What does Precision@K measure in an Information Retrieval evaluation?",
    options: [
      "The proportion of top-K retrieved documents that match ground-truth relevance annotations",
      "The proportion of all relevant corpus documents retrieved in top-K",
      "The total time in milliseconds taken to execute a query",
      "The average word count of top-K abstracts"
    ],
    answer: 0,
    explanation: "Precision@K evaluates the precision purity of the top-K returned documents: |Retrieved_K ∩ Relevant| / K."
  },
  {
    id: 9,
    question: "How does Reciprocal Rank Fusion (RRF) calculate score fusion without needing score normalization?",
    options: [
      "It sums reciprocal rank positions across systems: Σ 1 / (k + rank_m(d))",
      "It multiplies raw score vectors directly",
      "It converts all text tokens into binary 0s and 1s",
      "It calculates the average word length of the query"
    ],
    answer: 0,
    explanation: "RRF relies purely on ordinal rank positions rather than arbitrary raw scores, making it immune to heterogeneous score calibrations."
  },
  {
    id: 10,
    question: "What is Mean Reciprocal Rank (MRR@K)?",
    options: [
      "The reciprocal rank of the first relevant document retrieved: 1 / rank_first_relevant",
      "The mean character count across all returned titles",
      "The total number of unranked documents in the corpus",
      "The ratio of Precision to Recall"
    ],
    answer: 0,
    explanation: "MRR measures how quickly a user finds their first relevant result: 1 / rank of the first relevant document."
  }
];

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={7}
      expTitle="IR Evaluation Metrics (MAP, MRR, NDCG)"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
