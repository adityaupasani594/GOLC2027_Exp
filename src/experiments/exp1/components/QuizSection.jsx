import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, CheckCircle2, XCircle, Award, RotateCcw, BookOpen, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

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

  const handleReset = () => {
    setCurrent(0);
    setAnswers({});
    setSubmitted(false);
    setFinished(false);
    if (onScoreUpdate) onScoreUpdate(null);
  };

  // ── Result / Score Screen ──
  if (finished) {
    const score = QUIZ_QUESTIONS.filter(qq => answers[qq.id] === qq.answer).length;
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);

    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
            className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl shadow-md ${
              pct >= 70
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
            }`}
          >
            {pct >= 70 ? '🏆' : '📚'}
          </motion.div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {pct >= 90 ? 'Outstanding Mastery!' : pct >= 70 ? 'Quiz Completed Successfully!' : 'Quiz Attempt Finished'}
            </h2>
            <p className="text-sm text-slate-500">
              {pct >= 70
                ? 'You have demonstrated strong theoretical understanding of multimodal tokenization.'
                : 'Review the theory section and retry to improve your score.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Score</div>
            <div className="text-4xl font-extrabold text-slate-900 font-mono">
              {score} <span className="text-lg font-normal text-slate-400">/ {QUIZ_QUESTIONS.length}</span>
            </div>
            <div className="text-sm font-semibold text-indigo-600">{pct}% Correct</div>

            {/* Progress breakdown */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Retake Quiz
            </button>
            <button
              onClick={onGoToCertificate}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition cursor-pointer"
            >
              <Award className="w-4 h-4" /> View Certificate <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── One Question at a Time Screen ──
  const progressPct = ((current + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

      {/* Progress & Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span className="flex items-center gap-1.5 uppercase tracking-wide text-indigo-600">
            <HelpCircle className="w-3.5 h-3.5" />
            Question {current + 1} of {QUIZ_QUESTIONS.length}
          </span>
          <span className="font-mono">{Math.round(progressPct)}% Completed</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-indigo-600"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Active Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
        >
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Q{current + 1}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug pt-1">
              {q.question}
            </h3>
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
                correct={q.answer === idx}
                onClick={() => handleSelect(idx)}
              />
            ))}
          </div>

          {/* Explanation Card after submission */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                  isCorrect
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Correct Answer!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Incorrect &mdash; Option {['A', 'B', 'C', 'D'][q.answer]} is correct</span>
                    </>
                  )}
                </div>
                <p className="text-slate-700 pl-5 text-[11px]">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              {selected === undefined ? 'Select an option to proceed' : submitted ? 'Reviewed' : 'Ready to verify'}
            </span>

            {!submitted ? (
              <button
                disabled={selected === undefined}
                onClick={handleSubmitAnswer}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-100 transition cursor-pointer"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-100 transition cursor-pointer"
              >
                {current < QUIZ_QUESTIONS.length - 1 ? (
                  <>
                    Next Question <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Finish Quiz <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
