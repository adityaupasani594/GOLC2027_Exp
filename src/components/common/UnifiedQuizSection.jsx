import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, CheckCircle2, XCircle, RotateCcw, Award,
  Sparkles, ArrowRight, BookOpen, ChevronRight, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * Universal Question Normalizer
 * Normalizes question object formats from different engines/files:
 * - q.question vs q.q
 * - q.options vs q.opts
 * - q.answerIndex vs q.answer vs q.ans vs q.correct
 * - q.explanation vs q.exp vs q.rationale vs q.why
 */
export function normalizeQuestion(rawQ, index = 0) {
  if (!rawQ) return null;
  const question = rawQ.question || rawQ.q || `Question ${index + 1}`;
  const options = Array.isArray(rawQ.options) ? rawQ.options : (Array.isArray(rawQ.opts) ? rawQ.opts : []);
  
  let answerIndex = 0;
  const rawAns = rawQ.answer_index ?? rawQ.answerIndex ?? rawQ.correct_index ?? rawQ.correctIndex ?? rawQ.answer ?? rawQ.ans ?? rawQ.correct ?? rawQ.correctAnswer;
  if (typeof rawAns === 'number') {
    answerIndex = rawAns;
  } else if (typeof rawAns === 'string') {
    const trimmed = rawAns.trim().toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(trimmed)) {
      answerIndex = ['A', 'B', 'C', 'D'].indexOf(trimmed);
    } else if (!isNaN(Number(trimmed))) {
      answerIndex = Number(trimmed);
    }
  }

  const explanation = rawQ.explanation || rawQ.exp || rawQ.rationale || rawQ.why || 'Review the theoretical principles in Section 1 for a detailed derivation.';
  const id = rawQ.id ?? (index + 1);

  return { id, question, options, answerIndex, explanation };
}

export default function UnifiedQuizSection({
  expNumber = null,
  expTitle = 'Information Retrieval & Knowledge Graphs',
  rawQuestions = [],
  quizScore = null,
  previousScore = null,
  onScoreUpdate = null,
  onComplete = null,
  onQuizComplete = null,
  onNext = null,
  onGoToCertificate = null,
  themeColor = 'rose'
}) {
  // Normalize pool of questions
  const normalizedPool = useMemo(() => {
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) return [];
    return rawQuestions.map((q, idx) => normalizeQuestion(q, idx)).filter(Boolean);
  }, [rawQuestions]);

  // Synchronously select 10 randomized questions on mount
  const [questions, setQuestions] = useState(() => {
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) return [];
    const pool = rawQuestions.map((q, idx) => normalizeQuestion(q, idx)).filter(Boolean);
    const count = Math.min(10, pool.length);
    return [...pool].sort(() => 0.5 - Math.random()).slice(0, count);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const bestScore = quizScore ?? previousScore ?? null;

  const initQuiz = () => {
    if (normalizedPool.length === 0) return;
    const count = Math.min(10, normalizedPool.length);
    const shuffled = [...normalizedPool].sort(() => 0.5 - Math.random()).slice(0, count);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const handleSelectOption = (qId, optionIdx) => {
    if (selectedAnswers[qId] !== undefined) return; // Answered already
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const currentQ = questions[currentIndex] || questions[0];
  const isAnswered = currentQ ? selectedAnswers[currentQ.id] !== undefined : false;

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Calculate final score
      let correct = 0;
      questions.forEach(q => {
        if (selectedAnswers[q.id] === q.answerIndex) {
          correct++;
        }
      });
      setScore(correct);
      setSubmitted(true);

      const total = questions.length;
      const pct = Math.round((correct / total) * 100);

      // Invoke all supported parent callbacks
      if (onScoreUpdate) onScoreUpdate(correct, total);
      if (onComplete) onComplete(correct, total);
      if (onQuizComplete) onQuizComplete(pct);

      if (pct >= 70) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore in restricted environments
        }
      }
    }
  };

  const handleProceed = () => {
    if (onGoToCertificate) onGoToCertificate();
    else if (onNext) onNext();
  };

  // Fallback if no questions are provided
  if (!questions || questions.length === 0 || !currentQ) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <HelpCircle className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800">Assessment Bank Initializing</h3>
        <p className="text-xs text-slate-500">Preparing randomized concept assessment questions...</p>
        <button
          onClick={initQuiz}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
        >
          Load Questions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-slate-800 font-sans">
      {/* ── 1. Unified Gradient Header ── */}
      <div className="bg-linear-to-r from-rose-600 via-pink-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-rose-100 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-rose-200" />
              <span>{expNumber ? `Experiment ${expNumber}` : 'Virtual Laboratory'} • Concept Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {expTitle} Assessment
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm leading-relaxed">
              Demonstrate conceptual mastery across mathematical formulations, algorithmic mechanisms, and empirical evaluation metrics.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {bestScore !== null && (
              <div className="text-xs font-mono font-bold px-3 py-2 rounded-xl bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-xs">
                Score: {bestScore}/{questions.length}
              </div>
            )}
            <button
              onClick={initQuiz}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {!submitted ? (
        <div className="space-y-6">
          {/* ── 2. Progress & Question Counter Card ── */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span className="font-mono text-rose-600 font-bold">
                  {Math.round(((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <motion.div
                  className="bg-linear-to-r from-rose-500 to-pink-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <div className="shrink-0 font-mono text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
              Q{currentQ.id}
            </div>
          </div>

          {/* ── 3. Active Question Card ── */}
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
          >
            <div>
              <span className="text-[11px] font-mono font-bold text-rose-600 uppercase tracking-wider block mb-2">
                Concept Inquiry • Single Choice
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* ── 4. Multiple Choice Options ── */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;
                const isCorrect = optIdx === currentQ.answerIndex;
                const showResult = isAnswered;

                let btnStyle = 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300';
                if (showResult) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold ring-2 ring-emerald-400/40';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-semibold ring-2 ring-rose-400/40';
                  } else {
                    btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer shadow-2xs ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </div>
                    {showResult && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── 5. Pedagogical Explanation Box ── */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/70 text-xs text-blue-900 space-y-1.5"
                >
                  <div className="font-bold flex items-center gap-1.5 text-blue-800">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Pedagogical Analysis & Theoretical Justification:</span>
                  </div>
                  <p className="leading-relaxed text-blue-950 font-normal">
                    {currentQ.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── 6. Next / Finish Button ── */}
            <div className="pt-2 flex justify-end">
              <button
                disabled={!isAnswered}
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 text-white text-xs sm:text-sm font-bold hover:bg-rose-700 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-rose-200 cursor-pointer"
              >
                {currentIndex < questions.length - 1 ? (
                  <>
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Complete Assessment</span>
                    <Award className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        /* ── 7. Unified Results & Certification Screen ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-lg text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-rose-200">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Assessment Completed!
            </h2>
            <p className="text-sm text-slate-500">
              You scored <span className="font-mono font-bold text-rose-600 text-lg">{score}</span> out of <span className="font-bold text-lg">{questions.length}</span> ({Math.round((score / questions.length) * 100)}%)
            </p>
          </div>

          <div className="max-w-md mx-auto p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-3">
            <div className="flex justify-between items-center">
              <span>Correct Concepts Identified:</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">{score}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Incorrect Responses:</span>
              <span className="font-mono font-bold text-rose-500 text-sm">{questions.length - score}</span>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 font-bold text-slate-900">
              <span>Certificate Accreditation:</span>
              <span className={(score / questions.length) >= 0.7 ? 'text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full' : 'text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full'}>
                {(score / questions.length) >= 0.7 ? 'Accredited (>= 70%)' : 'Needs Practice (< 70%)'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={initQuiz}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz (Reshuffle)</span>
            </button>
            {(onGoToCertificate || onNext) && (score / questions.length) >= 0.6 && (
              <button
                onClick={handleProceed}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <span>Proceed to Certificate</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
