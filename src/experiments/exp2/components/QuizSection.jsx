import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Why are high-frequency stop-words removed during preprocessing?',
    options: [
      'They occur at extremely low frequencies and cause sparse matrix errors',
      'They occupy top frequency ranks but carry low semantic discrimination power',
      'They cannot be converted into numerical vectors in downstream NLP models',
      'They break the regular expression tokenizer parser',
    ],
    answer: 1,
    explanation:
      'Stop-words (like "is", "the", "at", "which") carry minimal domain-specific semantic value despite appearing frequently. Removing them compresses index size without discarding discriminative signal.',
  },
  {
    id: 2,
    question: "What is the phenomenon of 'Over-stemming' in heuristic suffix truncation?",
    options: [
      'When two words with distinctly different meanings are inappropriately chopped to identical stems',
      'When a stemmer fails to reduce words of the same root to a common base',
      'When text is accidentally converted to lowercase twice in the pipeline',
      'When lemmatization assigns incorrect Part-of-Speech (POS) tags to tokens',
    ],
    answer: 0,
    explanation:
      'Over-stemming occurs when distinct words with different meanings are conflated into the exact same stem (e.g., "universe", "university", and "universal" all reducing to "univers").',
  },
  {
    id: 3,
    question: 'How does Case Folding impact the unique vocabulary size of a corpus?',
    options: [
      'Increases unique vocabulary size by distinguishing capitalized proper nouns',
      'Decreases unique vocabulary size by merging capitalized and lowercase variants',
      'Keeps vocabulary size strictly unchanged',
      'Doubles the memory footprint across term-document matrices',
    ],
    answer: 1,
    explanation:
      'Standardizing casing merges identical token representations (e.g., "Apple", "apple", and "APPLE" all normalize to "apple"), directly reducing unique vocabulary count.',
  },
  {
    id: 4,
    question: 'What component is strictly required by a Lemmatizer for accurate root extraction?',
    options: [
      'Regular Expression pattern matching rules only',
      'A lexical dictionary (e.g., WordNet) and contextual Part-of-Speech (POS) tags',
      'A dedicated high-memory GPU cluster',
      'Byte-Pair Encoding (BPE) subword token splitters',
    ],
    answer: 1,
    explanation:
      'Lemmatizers require both an underlying morphological vocabulary lexicon (such as WordNet) and syntactic POS tags to accurately map inflected words to valid dictionary base lemmas.',
  },
  {
    id: 5,
    question: 'In which NLP task should Stop-Word Removal generally be avoided or minimized?',
    options: [
      'Document Clustering and Unsupervised Topic Modeling',
      'Large-scale Inverted Index Web Search Indexing',
      'Sentiment Analysis (e.g., distinguishing "happy" from "not happy")',
      'Author Profiling and Broad Genre Classification',
    ],
    answer: 2,
    explanation:
      'In sentiment analysis and negation detection, stop-words like "not", "no", or "never" drastically invert the entire semantic polarity of a statement. Removing them degrades sentiment classification.',
  },
  {
    id: 6,
    question: 'What is the primary drawback of the Porter Stemmer compared to Lemmatization?',
    options: [
      'It is computationally too slow for real-time web search engines',
      'It relies heavily on massive external linguistic dictionary downloads',
      'It uses rule-based heuristics that frequently produce non-dictionary truncated stems',
      'It requires deep neural network hardware acceleration',
    ],
    answer: 2,
    explanation:
      'The Porter Stemmer relies purely on sequential cascaded heuristic suffix stripping rules, which often yields truncated forms that are not valid English words (e.g., "studies" → "studi", "running" → "run").',
  },
  {
    id: 7,
    question: "According to Zipf's Law, what is the mathematical relationship between word frequency and frequency rank?",
    options: [
      'Word frequency is directly proportional to its frequency rank (f ∝ r)',
      'Word frequency is inversely proportional to its frequency rank (f ∝ 1/r)',
      'Word frequency increases exponentially with rank (f ∝ eʳ)',
      'Word frequency is statistically independent of its corpus rank',
    ],
    answer: 1,
    explanation:
      "Zipf's Law states that the frequency f of any word in a natural language corpus is inversely proportional to its rank r in the frequency table (f ∝ 1/r), explaining why a small set of stop-words dominates raw token counts.",
  },
  {
    id: 8,
    question: "What happens if you pass the verb 'meeting' into a WordNet Lemmatizer without specifying POS='v'?",
    options: [
      'It throws a Python syntax error due to an unhandled POS flag',
      "It defaults to Noun (POS='n') and keeps 'meeting' instead of reducing it to the verb lemma 'meet'",
      "It converts 'meeting' into an empty string",
      "It converts 'meeting' into the past-tense form 'met'",
    ],
    answer: 1,
    explanation:
      "WordNet Lemmatizers default to Noun (POS='n'). As a noun, 'meeting' is already a valid canonical base form (e.g., an assembly). Without POS='v', it will not be reduced to the verb lemma 'meet'.",
  },
  {
    id: 9,
    question: "What is 'Under-stemming' in heuristic suffix truncation?",
    options: [
      'When two words that share a common conceptual root are stemmed into different stems',
      'When all stop-words are ignored during dictionary lookups',
      'When numbers and symbols are converted into textual word forms',
      'When words are incorrectly converted to uppercase during case folding',
    ],
    answer: 0,
    explanation:
      'Under-stemming occurs when words from the same conceptual root family are not stemmed into the same base (e.g., "knavish" and "knave", or "adhesion" and "adhesive" failing to resolve to a unified root).',
  },
  {
    id: 10,
    question: 'Which Regular Expression pattern matches and strips all non-alphabetic characters and digits from a string?',
    options: [
      '/[0-9]+/',
      '/[^a-zA-Z\\s]/g',
      '/\\b\\w+\\b/g',
      '/[a-z]+/g',
    ],
    answer: 1,
    explanation:
      'The regex pattern [^a-zA-Z\\s] matches any character that is NOT an uppercase/lowercase Latin letter or whitespace, enabling noise and digit stripping.',
  },
];

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={2}
      expTitle="Text Preprocessing & Normalization"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
