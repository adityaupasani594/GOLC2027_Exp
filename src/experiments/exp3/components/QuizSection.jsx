import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Why is an Inverted Index preferred over a Term-Document Incidence Matrix for large document collections?',
    options: [
      'Incidence matrices cannot store numbers or punctuation.',
      'Incidence matrices are extremely sparse (>99% zeroes), wasting immense memory, whereas inverted indexes store only non-zero occurrences.',
      'Inverted indexes eliminate the need for computing term frequencies.',
      'Incidence matrices cannot be stored in binary format.',
    ],
    answer: 1,
    explanation: 'Natural language text exhibits extreme sparsity. A full incidence matrix of |V|×N allocates space for billions of zeroes, whereas an inverted index only allocates space for documents where terms actually occur.',
  },
  {
    id: 2,
    question: 'What is the worst-case time complexity of merging two sorted postings lists of lengths x and y using the two-pointer intersection algorithm?',
    options: ['O(x · y)', 'O(x + y)', 'O(log(x + y))', 'O(x² + y²)'],
    answer: 1,
    explanation: 'Because postings lists are maintained in sorted order of Document ID, a linear two-pointer scan evaluates each element at most once, yielding optimal O(x + y) running time.',
  },
  {
    id: 3,
    question: 'In processing a conjunctive Boolean query (A AND B AND C) where df(A)=1500, df(B)=30, df(C)=400, which evaluation sequence minimizes intermediate processing?',
    options: [
      'Evaluate (A AND B) first, then intersect with C.',
      'Evaluate (A AND C) first, then intersect with B.',
      'Evaluate (B AND C) first, then intersect with A — increasing order of df.',
      'The evaluation order has no measurable effect on computational cost.',
    ],
    answer: 2,
    explanation: 'Standard query optimization sorts terms in increasing order of document frequency. Intersecting B (df=30) and C (df=400) creates at most 30 candidates, making the final intersection with A rapid.',
  },
  {
    id: 4,
    question: 'What primary capability does a Positional Inverted Index provide over a standard inverted index?',
    options: [
      'It allows searching documents by their creation timestamp.',
      'It enables exact phrase queries and proximity searches (word A within k words of word B).',
      'It automatically translates queries into foreign languages.',
      'It reduces the physical disk space required by the index.',
    ],
    answer: 1,
    explanation: 'By storing exact token offsets within each document posting, the query engine can verify whether adjacent terms appear sequentially (pos₂ = pos₁ + 1) or within a window k.',
  },
  {
    id: 5,
    question: 'What is the theoretically optimal skip pointer interval for a postings list of length L?',
    options: [
      'Every 2 postings.',
      'Approximately √L evenly spaced postings.',
      'Exactly L/2 postings.',
      'Skip pointers must only be placed at powers of two.',
    ],
    answer: 1,
    explanation: 'Placing skip pointers at intervals of √L balances the number of skips with the maximum steps between skip pointers, reducing traversal comparisons to O(√L).',
  },
  {
    id: 6,
    question: 'How does aggressive stopword removal and Porter stemming affect vocabulary size |V|?',
    options: [
      'It significantly decreases |V| and compresses postings lists by merging morphological variants.',
      'It increases vocabulary size exponentially by creating new root words.',
      'It leaves vocabulary size unchanged because documents retain the same character count.',
      'It corrupts the index and prevents keyword search.',
    ],
    answer: 0,
    explanation: "Stopword removal eliminates high-frequency terms while stemming collapses multiple inflectional forms (e.g., 'retrieval', 'retrieving', 'retrieved' → 'retriev') into a single vocabulary entry, substantially compressing |V|.",
  },
  {
    id: 7,
    question: "Zipf's Law states collection frequency f is inversely proportional to rank r (f · r ≈ C). What does this imply about natural language corpora?",
    options: [
      'Every word in the language appears with identical frequency.',
      'A small set of frequent words accounts for a huge portion of all tokens, while most words appear very rarely (long tail).',
      'Longer words always appear more frequently than shorter words.',
      'Term frequencies increase exponentially as rank increases.',
    ],
    answer: 1,
    explanation: "Zipf's law describes a heavy-tailed power-law distribution: the top 50–100 words (stopwords) make up ~50% of any collection, while thousands of rare terms occur only once or twice.",
  },
  {
    id: 8,
    question: 'What is the precise conceptual difference between Term Frequency (tf) and Document Frequency (df)?',
    options: [
      'tf is the length of the document, while df is the length of the vocabulary.',
      'tf is the number of times a term appears in a specific document; df is the total number of documents containing the term.',
      'tf and df are identical metrics used interchangeably.',
      'df counts characters, while tf counts words.',
    ],
    answer: 1,
    explanation: 'Term frequency tf_{t,d} measures local term occurrence within a single document d, while document frequency df_t measures global dispersion across the entire collection.',
  },
  {
    id: 9,
    question: "When evaluating a phrase query 'term1 term2', what condition must be met across their positional postings lists?",
    options: [
      'term1 and term2 must have identical document frequencies.',
      'There must exist a document d containing term1 at position p and term2 at position p + 1.',
      'Both terms must appear anywhere in the document regardless of order.',
      'term1 must appear in Doc 1 and term2 must appear in Doc 2.',
    ],
    answer: 1,
    explanation: 'Phrase queries require adjacency: within the same document d, the token position of the second term must be exactly one greater than the first term (pos₂ = pos₁ + 1).',
  },
  {
    id: 10,
    question: 'What is the primary advantage of Single-Pass In-Memory Indexing (SPIMI) over Block Sort-Based Indexing (BSBI)?',
    options: [
      'SPIMI eliminates the need for sorting postings lists.',
      'SPIMI builds dynamic postings lists directly in memory without sorting intermediate (term, docID) pairs on disk.',
      'SPIMI does not require any RAM memory.',
      'SPIMI is only applicable to binary data, not text.',
    ],
    answer: 1,
    explanation: 'BSBI writes unsorted (termID, docID) pairs to disk causing I/O bottlenecks. SPIMI allocates dynamic postings arrays in memory as documents are parsed, writing pre-sorted block indexes.',
  },
];

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={3}
      expTitle="Inverted Index Construction & Compression"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
