import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUIZ_QUESTIONS = [
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

function OptionButton({ option, index, selected, submitted, correct, onClick }) {
  let style = 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30';
  if (selected && !submitted) style = 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-300';
  if (submitted && correct) style = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300';
  if (submitted && selected && !correct) style = 'border-red-400 bg-red-50 text-red-800 ring-2 ring-red-300';
  if (submitted && !selected && !correct) style = 'border-slate-100 bg-white/60 text-slate-400 opacity-60';

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <motion.button
      whileHover={!submitted ? { scale: 1.01 } : {}}
      whileTap={!submitted ? { scale: 0.99 } : {}}
      disabled={submitted}
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer disabled:cursor-default ${style}`}
    >
      <span className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
        selected && !submitted ? 'bg-indigo-600 text-white' :
        submitted && correct ? 'bg-emerald-600 text-white' :
        submitted && selected && !correct ? 'bg-red-500 text-white' :
        'bg-slate-100 text-slate-500'
      }`}>{labels[index]}</span>
      <span className="text-sm leading-relaxed">{option}</span>
    </motion.button>
  );
}

export { QUIZ_QUESTIONS };

export default function QuizSection({ onNext, onScoreUpdate }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = QUIZ_QUESTIONS[current];
  const selected = answers[q.id];
  const isCorrect = selected === q.answer;

  const handleSelect = (idx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [q.id]: idx }));
  };

  const handleSubmitAnswer = () => setSubmitted(true);

  const handleNext = () => {
    setSubmitted(false);
    if (current < QUIZ_QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
    } else {
      const score = QUIZ_QUESTIONS.filter(qq => answers[qq.id] === qq.answer).length;
      onScoreUpdate(score, QUIZ_QUESTIONS.length, answers);
      setFinished(true);
      if (score >= 7) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 }, colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'] });
      }
    }
  };

  const handleReset = () => {
    setCurrent(0);
    setAnswers({});
    setSubmitted(false);
    setFinished(false);
    onScoreUpdate(null, QUIZ_QUESTIONS.length, {});
  };

  if (finished) {
    const score = QUIZ_QUESTIONS.filter(qq => answers[qq.id] === qq.answer).length;
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
            className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl ${
              pct >= 70 ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'
            }`}
          >
            {pct >= 70 ? '🏆' : '📚'}
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900">{pct >= 70 ? 'Well Done!' : 'Keep Practising!'}</h2>
          <p className="text-slate-500 text-sm">
            You scored <span className="font-bold text-slate-800">{score}/{QUIZ_QUESTIONS.length}</span> ({pct}%)
          </p>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-full ${pct >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
            />
          </div>
        </motion.div>

        {/* Answer review */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Answer Review</p>
          {QUIZ_QUESTIONS.map((qq, i) => {
            const sel = answers[qq.id];
            const correct = sel === qq.answer;
            return (
              <div key={qq.id} className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
                correct ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {correct ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                <span className="font-medium shrink-0">Q{i + 1}:</span>
                <span className="truncate">{qq.question.substring(0, 60)}…</span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-semibold cursor-pointer hover:border-slate-300"
          >
            <RotateCcw className="w-4 h-4" /> Retake Quiz
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200 cursor-pointer"
          >
            <Award className="w-4 h-4" /> View Certificate & Report
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          Section 3 — Quiz
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Knowledge Assessment</h2>
        <p className="text-slate-500 text-sm">Inverted Index Construction — Conceptual Mastery Check</p>
      </motion.div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Question {current + 1} of {QUIZ_QUESTIONS.length}</span>
          <span>{Object.keys(answers).length} answered</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <motion.div
            animate={{ width: `${((current + (submitted ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          />
        </div>
        <div className="flex gap-1">
          {QUIZ_QUESTIONS.map((qq, i) => {
            const sel = answers[qq.id];
            const done = sel !== undefined;
            const correct = sel === qq.answer;
            return (
              <div key={qq.id} className={`flex-1 h-1.5 rounded-full transition-colors ${
                i === current ? 'bg-indigo-500' :
                done && correct ? 'bg-emerald-400' :
                done ? 'bg-red-400' :
                'bg-slate-200'
              }`} />
            );
          })}
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-md space-y-4"
        >
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
              {current + 1}
            </span>
            <p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">{q.question}</p>
          </div>

          <div className="space-y-2">
            {q.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isAnswer = q.answer === idx;
              return (
                <OptionButton
                  key={idx}
                  option={opt}
                  index={idx}
                  selected={isSelected}
                  submitted={submitted}
                  correct={submitted && isAnswer}
                  onClick={() => handleSelect(idx)}
                />
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-xl p-3.5 border text-xs leading-relaxed ${
                  isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-semibold">
                  {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {isCorrect ? 'Correct!' : `Incorrect — Correct answer: ${['A', 'B', 'C', 'D'][q.answer]}`}
                </div>
                <p>{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">
              {submitted
                ? (isCorrect ? '✓ +1 point' : '✗ 0 points')
                : (selected !== undefined ? 'Option selected — submit when ready' : 'Select an option')}
            </span>
            {!submitted ? (
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                disabled={selected === undefined}
                onClick={handleSubmitAnswer}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-md shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Submit Answer
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 text-white font-semibold text-sm shadow-md cursor-pointer"
              >
                {current < QUIZ_QUESTIONS.length - 1 ? (
                  <><ChevronRight className="w-4 h-4" /> Next Question</>
                ) : (
                  <><Award className="w-4 h-4" /> Finish Quiz</>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
