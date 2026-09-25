import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

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

function OptionButton({ option, index, selected, submitted, correct, onClick }) {
  let style = 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30';
  if (selected && !submitted) style = 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-300 font-medium';
  if (submitted && correct) style = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300 font-semibold';
  if (submitted && selected && !correct) style = 'border-rose-400 bg-rose-50 text-rose-800 ring-2 ring-rose-300';
  if (submitted && !selected && !correct) style = 'border-slate-100 bg-white/60 text-slate-400 opacity-60';

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <motion.button
      whileHover={!submitted ? { scale: 1.008 } : {}}
      whileTap={!submitted ? { scale: 0.992 } : {}}
      disabled={submitted}
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer disabled:cursor-default ${style}`}
    >
      <span className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
        selected && !submitted ? 'bg-indigo-600 text-white' :
        submitted && correct ? 'bg-emerald-600 text-white' :
        submitted && selected && !correct ? 'bg-rose-500 text-white' :
        'bg-slate-100 text-slate-500'
      }`}>{labels[index]}</span>
      <span className="text-xs sm:text-sm leading-relaxed">{option}</span>
    </motion.button>
  );
}

export default function QuizSection({ quizScore, onScoreUpdate, onGoToCertificate }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [finished, setFinished] = useState(quizScore !== null && quizScore !== undefined);

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
      if (onScoreUpdate) onScoreUpdate(score);
      setFinished(true);
      if (score >= 7) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'],
        });
      }
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrent(0);
    setSubmitted(false);
    setFinished(false);
    if (onScoreUpdate) onScoreUpdate(null);
  };

  const totalScore = QUIZ_QUESTIONS.filter(qq => answers[qq.id] === qq.answer).length;
  const pct = Math.round((totalScore / QUIZ_QUESTIONS.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          Section 3 — Evaluation
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Concept Assessment Quiz</h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Test your mastery of text normalization pipelines, stop-word distributions, Zipf's Law, and stemmer vs. lemmatizer trade-offs.
        </p>
      </motion.div>

      {/* Finished Screen */}
      {finished ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-8 border border-white/80 shadow-xl text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-200">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1">Quiz Completed</p>
            <h3 className="text-3xl font-black text-slate-900">
              {totalScore} / {QUIZ_QUESTIONS.length} Correct
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Score: <span className="font-bold text-slate-700">{pct}%</span>
              {pct >= 80 ? ' — Excellent mastery of NLP preprocessing!' : pct >= 60 ? ' — Good effort, review key edge cases.' : ' — Recommended to review the Theory Section.'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-sm mx-auto bg-slate-100 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
            />
          </div>

          {/* Breakdown pill badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-md mx-auto pt-2">
            {QUIZ_QUESTIONS.map((qq, i) => {
              const ok = answers[qq.id] === qq.answer;
              return (
                <div
                  key={qq.id}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border ${
                    ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span>Q{i + 1}</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-4 h-4" /> Retake Quiz
            </motion.button>
            {onGoToCertificate && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGoToCertificate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold cursor-pointer shadow-lg shadow-indigo-200"
              >
                <span>View Certificate</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>
      ) : (
        /* Question Card */
        <div className="space-y-4">
          {/* Progress tracker */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Question {current + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <span>{Math.round(((current) / QUIZ_QUESTIONS.length) * 100)}% Completed</span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((current) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>

          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md space-y-6"
          >
            {/* Question Text */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" /> Concept Check #{q.id}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">{q.question}</h3>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {q.options.map((opt, idx) => (
                <OptionButton
                  key={idx}
                  option={opt}
                  index={idx}
                  selected={selected === idx}
                  submitted={submitted}
                  correct={idx === q.answer}
                  onClick={() => handleSelect(idx)}
                />
              ))}
            </div>

            {/* Explanation box after submit */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                    isCorrect
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Incorrect — Correct Answer: Option {['A', 'B', 'C', 'D'][q.answer]}</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-slate-700">{q.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-400 font-medium">
                {selected === undefined ? 'Select an option to proceed' : submitted ? 'Review explanation above' : 'Confirm your choice'}
              </div>

              {!submitted ? (
                <motion.button
                  whileHover={selected !== undefined ? { scale: 1.02 } : {}}
                  whileTap={selected !== undefined ? { scale: 0.98 } : {}}
                  disabled={selected === undefined}
                  onClick={handleSubmitAnswer}
                  className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs sm:text-sm font-semibold transition cursor-pointer disabled:cursor-not-allowed shadow-md shadow-indigo-100"
                >
                  Submit Answer
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow"
                >
                  <span>{current < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
