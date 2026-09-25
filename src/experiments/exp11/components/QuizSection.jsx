import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, ChevronRight, CheckCircle2, XCircle, Award,
  RotateCcw, ArrowRight, Target, BrainCircuit
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '../schemaDesignEngine';

function OptionButton({ option, index, selected, submitted, correct, onClick }) {
  let style = 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30';
  if (selected && !submitted) style = 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-300 font-medium';
  if (submitted && correct) style = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300 font-semibold';
  if (submitted && selected && !correct) style = 'border-rose-400 bg-rose-50 text-rose-800 ring-2 ring-rose-300';
  if (submitted && !selected && !correct) style = 'border-slate-100 bg-white/60 text-slate-400 opacity-60';

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <motion.button
      whileHover={!submitted ? { scale: 1.006 } : {}}
      whileTap={!submitted ? { scale: 0.994 } : {}}
      disabled={submitted}
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer disabled:cursor-default ${style}`}
    >
      <span
        className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
          selected && !submitted
            ? 'bg-emerald-600 text-white'
            : submitted && correct
            ? 'bg-emerald-600 text-white'
            : submitted && selected && !correct
            ? 'bg-rose-500 text-white'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        {labels[index]}
      </span>
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
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
  };

  const handleSubmitAnswer = () => {
    setSubmitted(true);
  };

  const handleNext = () => {
    setSubmitted(false);
    if (current < QUIZ_QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      const score = QUIZ_QUESTIONS.filter((qq) => answers[qq.id] === qq.answer).length;
      if (onScoreUpdate) onScoreUpdate(score);
      setFinished(true);
      if (score >= 10) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#059669', '#10b981', '#34d399', '#0284c7']
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

  const totalScore = QUIZ_QUESTIONS.filter((qq) => answers[qq.id] === qq.answer).length;
  const pct = Math.round((totalScore / QUIZ_QUESTIONS.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <BrainCircuit className="w-3.5 h-3.5" />
          Experiment 11 Assessment &bull; Knowledge Graph Engineering
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Conceptual Assessment Quiz</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Test your mastery of Labeled Property Graph modeling, identity constraints, referential integrity checking, and multi-hop graph traversals.
        </p>
      </motion.div>

      {finished ? (
        /* Result Summary Card */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-emerald-100 text-emerald-600">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-800">Quiz Completed!</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              You scored <span className="font-bold text-emerald-600 text-base">{totalScore}</span> out of{' '}
              <span className="font-bold">{QUIZ_QUESTIONS.length}</span> ({pct}%)
            </p>
          </div>

          {/* Score Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1 text-left">
            <p className="font-bold text-slate-800">Examiner Evaluation:</p>
            <p>
              {pct >= 80
                ? 'Outstanding! You have mastered Labeled Property Graph modeling, integrity constraints, and Cypher ingestion protocols.'
                : pct >= 60
                ? 'Good effort! Review the diagnostic trace and integrity rules in the Simulation Lab to reinforce your knowledge.'
                : 'Further study recommended. Please review the Theory section on index-free adjacency and referential integrity before reattempting.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Retake Quiz
            </button>
            <button
              onClick={onGoToCertificate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs sm:text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 transition shadow-md shadow-emerald-200 cursor-pointer"
            >
              Claim Certificate <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ) : (
        /* Question Card */
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md space-y-6"
        >
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span className="font-semibold text-emerald-700 uppercase tracking-wide">
              Question {current + 1} of {QUIZ_QUESTIONS.length} &bull; Level: {q.level}
            </span>
            <span className="font-mono bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-bold">
              {q.topic}
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
            {q.question}
          </h3>

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

          {/* Explanation Box on Submit */}
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-1 ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct!
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-500" /> Incorrect
                  </>
                )}
              </div>
              <p className="leading-relaxed text-slate-700">{q.explanation}</p>
            </motion.div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              {selected === undefined ? 'Select an answer above' : submitted ? 'Review explanation' : 'Ready to check'}
            </span>

            {!submitted ? (
              <button
                disabled={selected === undefined}
                onClick={handleSubmitAnswer}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm shadow-md transition cursor-pointer disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-200 transition cursor-pointer"
              >
                {current < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'View Final Score'}{' '}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
