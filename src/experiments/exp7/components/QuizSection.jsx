import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

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

export default function QuizSection({ onNext, onScoreUpdate, onQuizComplete }) {
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

  const handleSubmitAnswer = () => {
    setSubmitted(true);
  };

  const handleNext = () => {
    setSubmitted(false);
    if (current < QUIZ_QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
    } else {
      const score = QUIZ_QUESTIONS.filter(qq => answers[qq.id] === qq.answer).length;
      const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
      
      if (onScoreUpdate) onScoreUpdate(score, QUIZ_QUESTIONS.length, answers);
      if (onQuizComplete) onQuizComplete(pct);
      
      setFinished(true);
      if (score >= 7) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 }, colors: ['#6366f1','#8b5cf6','#06b6d4','#10b981'] });
      }
    }
  };

  const handleReset = () => {
    setCurrent(0);
    setAnswers({});
    setSubmitted(false);
    setFinished(false);
    if (onScoreUpdate) onScoreUpdate(null, QUIZ_QUESTIONS.length, {});
    if (onQuizComplete) onQuizComplete(null);
  };

  if (finished) {
    const score = QUIZ_QUESTIONS.filter(qq => answers[qq.id] === qq.answer).length;
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type:'spring', stiffness:200, damping:12, delay:0.1 }}
            className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl shadow-md ${
              pct >= 70 ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
            }`}
          >
            {pct >= 70 ? '🏆' : '📚'}
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900">
            {pct >= 70 ? 'Well Done!' : 'Keep Practising!'}
          </h2>
          <p className="text-slate-500 text-sm">
            You scored <span className="font-bold text-slate-800">{score}/{QUIZ_QUESTIONS.length}</span> ({pct}%)
          </p>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width:0 }}
              animate={{ width:`${pct}%` }}
              transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
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
                <span className="font-medium">Q{i+1}:</span>
                <span className="truncate">{qq.question.substring(0, 65)}…</span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-semibold cursor-pointer hover:border-slate-300"
          >
            <RotateCcw className="w-4 h-4" /> Retake Quiz
          </motion.button>
          <motion.button
            whileHover={{ scale:1.02, y:-1 }} whileTap={{ scale:0.98 }}
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200 cursor-pointer"
          >
            <Award className="w-4 h-4" /> View Certificate
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          Section 3 — Quiz
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Knowledge Assessment</h2>
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
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
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
          initial={{ opacity:0, x: 24 }}
          animate={{ opacity:1, x: 0 }}
          exit={{ opacity:0, x: -24 }}
          transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4"
        >
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
              {current + 1}
            </span>
            <div className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">{q.question}</div>
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
                initial={{ opacity:0, height:0 }}
                animate={{ opacity:1, height:'auto' }}
                exit={{ opacity:0, height:0 }}
                className={`rounded-xl p-3.5 border text-xs leading-relaxed ${
                  isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-semibold">
                  {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {isCorrect ? 'Correct!' : `Incorrect — Correct answer: ${['A','B','C','D'][q.answer]}`}
                </div>
                <div>{q.explanation}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">
              {submitted ? (isCorrect ? '✓ +1 point' : '✗ 0 points') : (selected !== undefined ? 'Option selected — submit when ready' : 'Select an option')}
            </span>
            {!submitted ? (
              <motion.button
                whileHover={{ scale: 1.03, y:-1 }}
                whileTap={{ scale: 0.97 }}
                disabled={selected === undefined}
                onClick={handleSubmitAnswer}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-md shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Submit Answer
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03, y:-1 }}
                whileTap={{ scale: 0.97 }}
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
