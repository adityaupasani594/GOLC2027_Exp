import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, CheckCircle2, XCircle, RotateCcw, Award,
  Sparkles, ArrowRight, BookOpen, ChevronRight, Check,
  Bot, Send, AlertCircle, RefreshCw,
  FileText, ShieldCheck, CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getAnalyticalQuestionForExp } from '../../data/analyticalQuestionsData';
import {
  evaluateAnalyticalAnswer,
  hasGeminiApiKey
} from '../../services/geminiJudgeService';

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
  expNumber = 1,
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
  // Normalize pool of questions and take strictly up to 9 MCQs
  const normalizedPool = useMemo(() => {
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) return [];
    return rawQuestions.map((q, idx) => normalizeQuestion(q, idx)).filter(Boolean);
  }, [rawQuestions]);

  // Synchronously select 9 MCQs
  const [questions, setQuestions] = useState(() => {
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) return [];
    const pool = rawQuestions.map((q, idx) => normalizeQuestion(q, idx)).filter(Boolean);
    const count = Math.min(9, pool.length);
    return pool.slice(0, count);
  });

  // Current Analytical Question for this experiment
  const analyticalQuestion = useMemo(() => {
    return getAnalyticalQuestionForExp(expNumber);
  }, [expNumber]);

  // Quiz state
  // Indices 0..8: 9 MCQs
  // Index 9: Analytical Question (Question 10 of 10)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);

  // Analytical Question state
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null); // { score: 0-6, feedback, strengths, improvements }
  const [evalError, setEvalError] = useState(null);

  const totalSteps = questions.length + 1; // 9 MCQs + 1 Analytical = 10 questions
  const isAnalyticalStep = currentIndex === questions.length;
  const currentQ = questions[currentIndex];
  const isMcqAnswered = currentQ ? selectedAnswers[currentQ.id] !== undefined : false;

  const bestScore = quizScore ?? previousScore ?? null;

  const initQuiz = () => {
    if (normalizedPool.length > 0) {
      const count = Math.min(9, normalizedPool.length);
      setQuestions(normalizedPool.slice(0, count));
    }
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setMcqScore(0);
    setStudentAnswer('');
    setEvalResult(null);
    setEvalError(null);
    setIsEvaluating(false);
  };

  const handleSelectOption = (qId, optionIdx) => {
    if (selectedAnswers[qId] !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  // Evaluate the analytical question with Gemini AI
  const handleEvaluateAnalytical = async () => {
    if (!studentAnswer.trim()) {
      setEvalError('Please type your analytical response before submitting for AI grading.');
      return;
    }

    if (!hasGeminiApiKey()) {
      setEvalError('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY in your .env file.');
      return;
    }

    setIsEvaluating(true);
    setEvalError(null);

    try {
      const result = await evaluateAnalyticalAnswer({
        expNumber,
        question: analyticalQuestion.question,
        context: analyticalQuestion.context,
        rubric: analyticalQuestion.rubric,
        studentAnswer
      });

      if (!result.success) {
        setEvalError(result.feedback);
      } else {
        setEvalResult(result);
      }
    } catch (err) {
      setEvalError(`Grading failed: ${err.message || 'Network error communicating with Gemini API.'}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Move from Question to Question, or finish assessment
  const handleNext = () => {
    if (currentIndex < questions.length) {
      // Moving from an MCQ to next MCQ or to Analytical Question
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completing the entire assessment!
      // 1. Calculate MCQ score (max 9)
      let correct = 0;
      questions.forEach(q => {
        if (selectedAnswers[q.id] === q.answerIndex) {
          correct++;
        }
      });
      setMcqScore(correct);

      // 2. Analytical score (max 6)
      const aScore = evalResult?.score ?? 0;

      // 3. Total score = MCQ (0-9) + Analytical (0-6) = Total out of 15
      const totalMarks = 15;
      const combinedScore = correct + aScore;
      const pct = Math.round((combinedScore / totalMarks) * 100);

      setSubmitted(true);

      // Invoke all supported parent callbacks
      if (onScoreUpdate) onScoreUpdate(combinedScore, totalMarks);
      if (onComplete) onComplete(combinedScore, totalMarks);
      if (onQuizComplete) onQuizComplete(pct);

      if (pct >= 70) {
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }
    }
  };

  const handleProceed = () => {
    if (onGoToCertificate) onGoToCertificate();
    else if (onNext) onNext();
  };

  // Word count for student answer
  const answerWordCount = useMemo(() => {
    const text = studentAnswer.trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  }, [studentAnswer]);

  // Combined score for final view
  const finalTotalScore = mcqScore + (evalResult?.score ?? 0);
  const finalPercentage = Math.round((finalTotalScore / 15) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-slate-800 font-sans">
      {/* ── 1. Unified Gradient Header ── */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-rose-100 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-rose-200" />
              <span>{expNumber ? `Experiment ${expNumber}` : 'Virtual Laboratory'} • Concept & Analytical Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {expTitle} Assessment
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm leading-relaxed">
              Total Score: <strong>15 Marks</strong> (9 Multiple Choice Questions + 6 Marks Analytical Synthesis judged by Gemini AI).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {bestScore !== null && (
              <div className="text-xs font-mono font-bold px-3 py-2 rounded-xl bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-xs">
                Best Score: {bestScore}/15
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
          {/* ── 2. Progress & Step Counter Card ── */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>
                  Question {currentIndex + 1} of {totalSteps}
                  {isAnalyticalStep ? ' • Part B: Analytical Inquiry (6 Marks)' : ' • Part A: Concept MCQs (1 Mark each)'}
                </span>
                <span className="font-mono text-rose-600 font-bold">
                  {Math.round(((currentIndex + (isMcqAnswered || evalResult ? 1 : 0)) / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <motion.div
                  className="bg-gradient-to-r from-rose-500 to-indigo-600 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + (isMcqAnswered || evalResult ? 1 : 0)) / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <div className="shrink-0 font-mono text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
              {isAnalyticalStep ? 'Q10 (Analytical)' : `Q${currentIndex + 1}`}
            </div>
          </div>

          {/* ── 3. Step Content (MCQ vs Analytical Question) ── */}
          {!isAnalyticalStep ? (
            /* ── A. MULTIPLE CHOICE QUESTION (Q1 - Q9) ── */
            <motion.div
              key={currentQ?.id || currentIndex}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
            >
              <div>
                <span className="text-[11px] font-mono font-bold text-rose-600 uppercase tracking-wider block mb-2">
                  Part A: Concept Inquiry • Single Choice (1 Mark)
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQ?.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ?.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  const isCorrect = optIdx === currentQ.answerIndex;
                  const showResult = isMcqAnswered;

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
                      disabled={isMcqAnswered}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer shadow-xs ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
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

              {/* Pedagogical Explanation Box */}
              <AnimatePresence>
                {isMcqAnswered && (
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
                      {currentQ?.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button */}
              <div className="pt-2 flex justify-end">
                <button
                  disabled={!isMcqAnswered}
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 text-white text-xs sm:text-sm font-bold hover:bg-rose-700 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-rose-200 cursor-pointer"
                >
                  <span>
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'Proceed to Analytical Question (6 Marks)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* ── B. ANALYTICAL QUESTION (QUESTION 10 OF 10 • 6 MARKS) ── */
            <motion.div
              key="analytical-step"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-mono font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                    Part B: Analytical Synthesis • LLM Evaluation
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Question 10: {analyticalQuestion.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>Weight: 6 Marks</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                  {analyticalQuestion.question}
                </p>
              </div>

              {/* Student Response Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="student-answer-textarea" className="font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Your Analytical Answer:</span>
                  </label>
                  <span className={`font-mono text-[11px] ${answerWordCount >= 30 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    {answerWordCount} words ({studentAnswer.length} characters)
                  </span>
                </div>

                <textarea
                  id="student-answer-textarea"
                  rows={7}
                  disabled={isEvaluating}
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Type your comprehensive technical analysis here... Discuss theoretical principles, algorithmic mechanisms, and empirical trade-offs."
                  className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 bg-slate-50/50 leading-relaxed font-sans transition-all resize-y"
                />
              </div>

              {/* Error Callout */}
              {evalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{evalError}</p>
                </div>
              )}

              {/* AI Evaluation Result Card */}
              {evalResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 border border-indigo-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">AI Judge Assessment</h4>
                        <p className="text-[11px] text-slate-500">Evaluated against academic rubric</p>
                      </div>
                    </div>
                    <div className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-mono font-bold text-sm shadow-sm flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>Score: {evalResult.score} / 6 Marks</span>
                    </div>
                  </div>

                  {/* Feedback paragraph */}
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong className="block font-semibold text-slate-900 mb-1">Evaluator Critique:</strong>
                    <p className="bg-white/80 p-3 rounded-xl border border-indigo-100/80">
                      {evalResult.feedback}
                    </p>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {evalResult.strengths?.length > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-emerald-800 text-[11px] uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Demonstrated Strengths</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-900">
                          {evalResult.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {evalResult.improvements?.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-800 text-[11px] uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Areas for Improvement</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900">
                          {evalResult.improvements.map((imp, i) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentIndex(questions.length - 1)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ← Back to MCQs
                </button>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    disabled={isEvaluating}
                    onClick={handleEvaluateAnalytical}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-indigo-200 cursor-pointer"
                  >
                    {isEvaluating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{evalResult ? 'Re-Submit' : 'Submit'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={!evalResult || isEvaluating}
                    onClick={handleNext}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-rose-200 cursor-pointer"
                  >
                    <span>Complete Assessment</span>
                    <Award className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        /* ── 4. Unified Results & Certification Screen (Out of 15) ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-lg text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-rose-200">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Assessment Completed!
            </h2>
            <p className="text-sm text-slate-500">
              You scored <span className="font-mono font-bold text-rose-600 text-xl">{finalTotalScore}</span> out of <span className="font-bold text-xl">15</span> ({finalPercentage}%)
            </p>
          </div>

          {/* Breakdown Scoreboard */}
          <div className="max-w-md mx-auto p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-3 text-left">
            <div className="flex justify-between items-center">
              <span>Part A: Multiple Choice Questions (9 MCQs):</span>
              <span className="font-mono font-bold text-indigo-700 text-sm">{mcqScore} / 9</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Part B: AI-Judged Analytical Response:</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                {evalResult?.score ?? 0} / 6
              </span>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 font-bold text-slate-900">
              <span>Total Experiment Score:</span>
              <span className="font-mono font-bold text-rose-600 text-base">
                {finalTotalScore} / 15 ({finalPercentage}%)
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-slate-900">
              <span>Certificate Accreditation:</span>
              <span className={finalPercentage >= 70 ? 'text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200' : 'text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200'}>
                {finalPercentage >= 70 ? 'Accredited (>= 70%)' : 'Needs Practice (< 70%)'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={initQuiz}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Assessment</span>
            </button>
            {(onGoToCertificate || onNext) && finalPercentage >= 60 && (
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
