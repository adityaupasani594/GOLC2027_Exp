import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, CheckCircle2, XCircle, RotateCcw, Award,
  Sparkles, ArrowRight, BookOpen, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '../tfidfEngine';

export default function QuizSection({ onComplete, previousScore }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Initialize 10 randomized questions from bank
  const initQuiz = () => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 10));
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  useEffect(() => {
    initQuiz();
  }, []);

  const handleSelectOption = (qId, optionIdx) => {
    if (selectedAnswers[qId] !== undefined) return; // Answered already
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const currentQ = questions[currentIndex];
  const isAnswered = currentQ && selectedAnswers[currentQ.id] !== undefined;

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

      if (onComplete) {
        onComplete(correct, questions.length);
      }

      if (correct / questions.length >= 0.7) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800">
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-rose-100 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Conceptual Evaluation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            TF-IDF & Vector Space Model Assessment
          </h1>
          <p className="text-rose-100 text-xs sm:text-sm leading-relaxed">
            Test your comprehension of term weighting mechanisms, inverse document frequency behaviors, cosine length normalization, and information retrieval evaluation benchmarks.
          </p>
        </div>
      </div>

      {!submitted ? (
        <div className="space-y-6">
          {/* Progress Bar & Counter */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>{Math.round(((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                />
              </div>
            </div>
            <button
              onClick={initQuiz}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              title="Reshuffle Quiz"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Question Card */}
          {currentQ && (
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
            >
              <div>
                <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider block mb-2">
                  Question ID: #{currentQ.id}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQ.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  const isCorrect = optIdx === currentQ.answerIndex;
                  const showResult = isAnswered;

                  let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                  if (showResult) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold ring-1 ring-emerald-400';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-semibold ring-1 ring-rose-400';
                    } else {
                      btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {showResult && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5"
                >
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Conceptual Explanation
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    {currentQ.explanation}
                  </p>
                </motion.div>
              )}

              {/* Next Button */}
              <div className="pt-2 flex justify-end">
                <button
                  disabled={!isAnswered}
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:pointer-events-none shadow-sm shadow-blue-200"
                >
                  {currentIndex < questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Complete Assessment
                      <Award className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        /* Results Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Assessment Completed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              You scored <span className="font-bold text-rose-600">{score}</span> out of <span className="font-bold">{questions.length}</span> ({Math.round((score / questions.length) * 100)}%)
            </p>
          </div>

          <div className="max-w-sm mx-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex justify-between">
              <span>Correct Answers:</span>
              <span className="font-bold text-emerald-600">{score}</span>
            </div>
            <div className="flex justify-between">
              <span>Incorrect Answers:</span>
              <span className="font-bold text-rose-500">{questions.length - score}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold text-slate-900">
              <span>Certificate Eligibility:</span>
              <span>{(score / questions.length) >= 0.7 ? 'Qualified (>= 70%)' : 'Needs Practice (< 70%)'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={initQuiz}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz (New Questions)
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
