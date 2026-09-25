import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'What is tokenization in the context of Information Retrieval?',
    options: [
      'Splitting text or media into smaller atomic units such as words, visual patches, or time frames',
      'Encrypting a document to secure its contents from unauthorized access',
      'Removing images and binary data from a document',
      'Ranking documents by relevance to a query',
    ],
    answer: 0,
    explanation:
      'Tokenization divides raw text or media into an ordered list of smaller atomic units called tokens (words, visual patches, or time frames). These tokens become the atomic keys in the inverted index used by IR systems.',
  },
  {
    id: 2,
    question: 'Why are stop words removed during document preprocessing?',
    options: [
      'They are grammatically incorrect and should be fixed',
      'They are highly frequent, carry minimal discriminative weight, and bloat the index size',
      'They are too long and slow down tokenization',
      'They are always misspelled in real documents',
    ],
    answer: 1,
    explanation:
      'Stop words (e.g., "the", "is", "at") appear in virtually every document. Removing them reduces index size and noise without significant loss of semantic content, improving both retrieval efficiency and precision.',
  },
  {
    id: 3,
    question: 'In the Vision Transformer (ViT) approach, how are 2D images tokenized?',
    options: [
      'By converting the entire image into a single string of ASCII characters',
      'By partitioning the 2D pixel array into non-overlapping P × P pixel patches and flattening them into a 1D sequence',
      'By deleting all color channels except black and white',
      'By running optical character recognition (OCR) on all pixels',
    ],
    answer: 1,
    explanation:
      'Vision Transformers tokenize images by dividing the 2D grid into fixed-size P × P patches (e.g. 16×16 px). Each patch is flattened into a 1D vector acting as a visual token, enabling sequence-based retrieval.',
  },
  {
    id: 4,
    question: 'What is the primary trade-off when selecting the temporal frame window (Δt) for audio tokenization?',
    options: [
      'Smaller windows yield finer temporal resolution but produce a much larger number of tokens',
      'Larger windows delete audio frequencies permanently',
      'Window size only affects text and has no effect on audio',
      'Smaller windows always crash search engine indexes',
    ],
    answer: 0,
    explanation:
      'Smaller frame windows (e.g. 10ms vs 40ms) provide high temporal granularity for capturing fast acoustic transitions, but dramatically increase the total token count and index storage requirements.',
  },
  {
    id: 5,
    question: 'Which of the following is the standard order of the text preprocessing pipeline?',
    options: [
      'Cleaning → Lowercasing → Tokenization → Stop-word Removal → Stemming',
      'Lowercasing → Cleaning → Tokenization → Stop-word Removal → Stemming',
      'Tokenization → Stop-word Removal → Cleaning → Lowercasing → Stemming',
      'Stop-word Removal → Stemming → Tokenization → Cleaning → Lowercasing',
    ],
    answer: 0,
    explanation:
      'The canonical pipeline runs: Cleaning (strip punctuation/digits), then Lowercasing (case normalization), then Tokenization (split into tokens), Stop-word Removal, and finally Stemming (reducing word variants to root stems).',
  },
  {
    id: 6,
    question: 'What is an inverted index in Information Retrieval?',
    options: [
      'A list of all documents sorted in reverse chronological order',
      'A data structure mapping each unique token (term) to the list of documents containing it',
      'A compressed video stream containing only audio',
      'A lookup table that stores user search histories',
    ],
    answer: 1,
    explanation:
      'An inverted index maps each unique token to a postings list containing document IDs, term frequencies, and positions where that token appears, enabling sub-millisecond keyword and multimodal search.',
  },
  {
    id: 7,
    question: 'How does video keyframe tokenization address video stream data in search systems?',
    options: [
      'By converting video into a single audio podcast',
      'By sampling representative frames along the time axis to eliminate temporal redundancy between adjacent frames',
      'By deleting every frame that contains people',
      'By slowing down the playback speed by 50%',
    ],
    answer: 1,
    explanation:
      'Adjacent video frames are nearly identical. Keyframe sampling extracts frames at periodic intervals (or scene boundaries) to represent the spatiotemporal progression without indexing redundant identical pixels.',
  },
  {
    id: 8,
    question: 'What is the primary difference between stemming and lemmatization?',
    options: [
      'Stemming uses heuristic suffix-stripping rules and may produce non-words; lemmatization uses vocabulary and morphological analysis to return valid base forms',
      'Stemming is only applied to images; lemmatization is only applied to text',
      'Lemmatization removes punctuation; stemming does not',
      'Stemming requires internet access; lemmatization works offline',
    ],
    answer: 0,
    explanation:
      'Stemming uses algorithmic suffix stripping (e.g. Porter stemmer: "retrieval" → "retriev") which is fast but can produce non-dictionary stems. Lemmatization uses grammatical rules and lexicons to yield true root words (lemmas).',
  },
  {
    id: 9,
    question: 'After applying stop-word removal followed by Porter stemming, what happens to the total token count and vocabulary size?',
    options: [
      'Token count doubles; vocabulary size quadruples',
      'Token count decreases during stop-word removal and remains constant during stemming, while vocabulary size decreases during stemming',
      'Both token count and vocabulary size drop to zero',
      'Stemming removes token occurrences so token count drops again',
    ],
    answer: 1,
    explanation:
      'Stop-word removal removes low-information tokens, shrinking the token count. Stemming transforms the remaining words into stems without deleting occurrences, which merges variants (e.g. "runs", "running" → "run") and shrinks the unique vocabulary size.',
  },
  {
    id: 10,
    question: 'Why is lowercasing (case normalization) applied before inverted indexing?',
    options: [
      'To compress ASCII text into binary unicode',
      'To ensure terms like "Information", "information", and "INFORMATION" all map to the identical token entry',
      'To comply with HTML5 specifications',
      'To convert uppercase characters into image pixels',
    ],
    answer: 1,
    explanation:
      'Case normalization ensures that queries and documents match reliably regardless of capitalization in headings, beginning of sentences, or titles.',
  },
];

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={1}
      expTitle="Multi-Modal Tokenization & Preprocessing"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
