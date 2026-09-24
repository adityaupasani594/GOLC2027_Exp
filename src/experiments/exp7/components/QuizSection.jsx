import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, CheckCircle2, XCircle, Award, ChevronRight,
  RotateCcw, Sparkles, Check, AlertCircle, ArrowRight
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../relationshipExtractionEngine';

export { QUIZ_QUESTIONS };

export default function QuizSection({ onNext, onScoreUpdate, onQuizComplete }) {
  const [examMode, setExamMode] = useState('full'); // 'full' (10 Qs) | 'quick' (5 Qs)
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  // Filter or sample questions based on mode
  const questions = useMemo(() => {
    if (examMode === 'quick') {
      return QUIZ_QUESTIONS.slice(0, 5);
    }
    return QUIZ_QUESTIONS;
  }, [examMode]);

  const score = useMemo(() => {
    if (!submitted) return 0;
    return questions.filter((q) => answers[q.id] === q.answer_index).length;
  }, [submitted, questions, answers]);

  const pct = Math.round((score / questions.length) * 100);
  const passed = pct >= 70;

  const handleSelectOption = (qId, optIdx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const finalScore = questions.filter((q) => answers[q.id] === q.answer_index).length;
    const finalPct = Math.round((finalScore / questions.length) * 100);

    onScoreUpdate && onScoreUpdate(finalScore, questions.length);
    onQuizComplete && onQuizComplete(finalPct);
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentQ(0);
  };

  const q = questions[currentQ] || questions[0];
  const allAnswered = questions.every((item) => answers[item.id] !== undefined);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Concept Assessment Quiz
            </h1>
            <p className="text-xs text-slate-500">
              Experiment 7 · Relationship Extraction from Text ({questions.length} Questions)
            </p>
          </div>
        </div>

        {/* Mode Switcher (if not submitted) */}
        {!submitted && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => {
                setExamMode('full');
                setAnswers({});
                setCurrentQ(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                examMode === 'full' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Full (10 Qs)
            </button>
            <button
              onClick={() => {
                setExamMode('quick');
                setAnswers({});
                setCurrentQ(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                examMode === 'quick' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Quick (5 Qs)
            </button>
          </div>
        )}

        {submitted && (
          <div
            className={`px-4 py-2 rounded-2xl border font-black text-sm flex items-center gap-2 ${
              passed
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            <span>Score: {score} / {questions.length} ({pct}%)</span>
            {passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
          </div>
        )}
      </div>

      {/* Question Progress Dots */}
      <div className="flex gap-1.5">
        {questions.map((item, idx) => {
          const isAnswered = answers[item.id] !== undefined;
          const isCurrent = idx === currentQ;
          const isCorrect = submitted && answers[item.id] === item.answer_index;
          const isWrong = submitted && isAnswered && answers[item.id] !== item.answer_index;

          let bgClass = 'bg-slate-200 text-slate-600';
          if (isCurrent) bgClass = 'bg-rose-500 text-white ring-2 ring-rose-300';
          else if (submitted) {
            bgClass = isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-400 text-white';
          } else if (isAnswered) {
            bgClass = 'bg-indigo-500 text-white';
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentQ(idx)}
              className={`flex-1 h-3 rounded-full transition-all cursor-pointer ${bgClass}`}
              title={`Question ${idx + 1}`}
            />
          );
        })}
      </div>

      {/* Main Question Card */}
      <motion.div
        key={q.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="uppercase tracking-wider">
            Question {currentQ + 1} of {questions.length}
          </span>
          <span className="font-mono">ID: #{q.id}</span>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {q.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((opt, optIdx) => {
            const isSelected = answers[q.id] === optIdx;
            const isCorrect = optIdx === q.answer_index;
            const showCorrect = submitted && isCorrect;
            const showWrong = submitted && isSelected && !isCorrect;

            let cardStyle = 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/60 text-slate-800';

            if (isSelected && !submitted) {
              cardStyle = 'border-rose-500 bg-rose-50/70 text-rose-950 ring-2 ring-rose-400/20';
            } else if (showCorrect) {
              cardStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-2 ring-emerald-400/20';
            } else if (showWrong) {
              cardStyle = 'border-red-400 bg-red-50/80 text-red-950 line-through';
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(q.id, optIdx)}
                disabled={submitted}
                className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${cardStyle}`}
              >
                <span
                  className={`w-6 h-6 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isSelected && !submitted
                      ? 'bg-rose-500 text-white'
                      : showCorrect
                      ? 'bg-emerald-600 text-white'
                      : showWrong
                      ? 'bg-red-500 text-white'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="flex-1 leading-relaxed">
                  {opt.replace(/^[A-D]\)\s*/, '')}
                </span>
                {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                {showWrong && <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Explanation Box (Visible After Submission) */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs sm:text-sm text-indigo-950 space-y-1.5"
          >
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Linguistic &amp; Conceptual Explanation:
            </div>
            <p className="text-slate-700 leading-relaxed">
              {q.explanation}
            </p>
          </motion.div>
        )}

        {/* Question Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <button
            onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
            disabled={currentQ === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Previous Question
          </button>

          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              Next Question
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            !submitted && (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                Submit Assessment
                <Check className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      </motion.div>

      {/* Post-Submission Result Card */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-4 ${
            passed
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-emerald-300'
              : 'bg-gradient-to-r from-rose-50 via-orange-50 to-slate-50 border-rose-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {passed ? '🎉 Congratulations! Assessment Cleared' : 'Needs Review — Retake Assessment'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {passed
                  ? `You achieved ${pct}% (${score}/${questions.length}), exceeding the 70% threshold required for certification.`
                  : `You scored ${pct}% (${score}/${questions.length}). A minimum of 70% is required to issue your verified completion certificate.`}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </button>

              {passed && (
                <button
                  onClick={onNext}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  View Certificate
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
