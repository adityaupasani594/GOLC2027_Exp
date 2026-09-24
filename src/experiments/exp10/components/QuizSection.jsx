import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle, CheckCircle2, XCircle, Award, ChevronRight,
  RotateCcw, Sparkles, Check, ArrowRight
} from 'lucide-react';

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What core architectural feature enables graph databases to achieve constant-time O(1) traversal per hop, unlike RDBMS multi-table joins?",
    options: [
      "A) Distributed B-Tree indexes on foreign keys",
      "B) Index-Free Adjacency (IFA) using direct physical memory pointers",
      "C) Precomputed materialized relational views",
      "D) Columnar compressed storage files"
    ],
    answer_index: 1,
    explanation: "Index-Free Adjacency (IFA) means every node stores direct physical memory pointers to its adjacent relationships, allowing traversal in O(1) time without index searches."
  },
  {
    id: 2,
    question: "In the Labeled Property Graph (LPG) model, which of the following statements regarding relationships is FALSE?",
    options: [
      "A) Every relationship must have a start node and an end node",
      "B) Every relationship must have a specific type (e.g., [:ENROLLED_IN])",
      "C) Relationships can hold key-value properties just like nodes",
      "D) Relationships can exist as dangling pointers without a target node"
    ],
    answer_index: 3,
    explanation: "Relationships in a Property Graph are strictly first-class directed connections. They can never exist as dangling pointers without both a valid source and target node."
  },
  {
    id: 3,
    question: "Which Cypher pattern correctly matches a Student named 'Alice' who is enrolled in any Course?",
    options: [
      "A) SELECT Student WHERE name='Alice' JOIN Course",
      "B) MATCH (s:Student {name: 'Alice'})-[:ENROLLED_IN]->(c:Course) RETURN s, c",
      "C) FIND (s:Student)-[ENROLLED_IN]->(c:Course) FILTER s.name = 'Alice'",
      "D) MATCH {s:Student} --> {c:Course} WHERE name = 'Alice'"
    ],
    answer_index: 1,
    explanation: "Cypher uses ASCII-art syntax: nodes are enclosed in parentheses '(s:Student)' and directed relationships in bracketed arrows '-[:ENROLLED_IN]->'."
  },
  {
    id: 4,
    question: "What happens if you execute 'MATCH (n:Student {id: 'S01'}) DELETE n' when node 'S01' currently has 3 active relationships?",
    options: [
      "A) The node and its 3 relationships are automatically deleted without error",
      "B) The 3 relationships are preserved as dangling pointers with null sources",
      "C) The graph DBMS engine prevents deletion to preserve referential integrity",
      "D) The node is deleted and the target nodes are also recursively deleted"
    ],
    answer_index: 2,
    explanation: "To preserve graph referential integrity, plain DELETE fails if relationships are attached. 'DETACH DELETE' must be explicitly used to remove attached relationships first."
  },
  {
    id: 5,
    question: "What is the primary operational role of 'Labels' attached to nodes in a Property Graph?",
    options: [
      "A) To store arbitrary floating-point numeric measurements",
      "B) To categorize nodes into domain groups and act as entry-point indexes for fast query lookup",
      "C) To define foreign key cascade rules between tables",
      "D) Labels are purely cosmetic and have no execution impact"
    ],
    answer_index: 1,
    explanation: "Labels group nodes into semantic roles (e.g., :Student, :Faculty) and allow graph engines to index and rapidly locate starting nodes for graph traversals."
  },
  {
    id: 6,
    question: "Which Cypher statement correctly updates the GPA of student 'Alice' to 9.50 and adds an 'honors' property?",
    options: [
      "A) UPDATE (s:Student {name: 'Alice'}) SET gpa = 9.50, honors = true",
      "B) MATCH (s:Student {name: 'Alice'}) SET s.gpa = 9.50, s.honors = true RETURN s",
      "C) MODIFY Student Alice (gpa: 9.50, honors: true)",
      "D) ALTER NODE (s:Student) WHERE name='Alice' ADD gpa=9.50"
    ],
    answer_index: 1,
    explanation: "In Cypher, property updates are performed using the 'SET' clause following a 'MATCH' pattern: 'MATCH (s) SET s.prop = val'."
  },
  {
    id: 7,
    question: "In Cypher, what is the behavior of the aggregation function 'count(s)' in 'MATCH (c:Course)<-[:ENROLLED_IN]-(s:Student) RETURN c.name, count(s)'?",
    options: [
      "A) It throws a syntax error because Cypher requires an explicit 'GROUP BY' clause",
      "B) It automatically groups by non-aggregated fields (c.name) and counts students per course",
      "C) It counts all students in the database regardless of course",
      "D) It only counts courses, ignoring students completely"
    ],
    answer_index: 1,
    explanation: "Unlike SQL, Cypher has implicit grouping: any non-aggregated expressions in the RETURN clause (such as c.name) automatically serve as grouping keys."
  },
  {
    id: 8,
    question: "What does the variable-length Cypher relationship pattern '-[:PREREQUISITE_OF*1..3]->' express?",
    options: [
      "A) A relationship whose weight is between 1.0 and 3.0",
      "B) A path of between 1 and 3 sequential PREREQUISITE_OF hops between entities",
      "C) A relationship that must be traversed exactly 3 times in a loop",
      "D) An array of 3 distinct relationship property keys"
    ],
    answer_index: 1,
    explanation: "Syntax '*minHops..maxHops' specifies variable-length path traversal. '*1..3' searches for paths having from 1 up to 3 consecutive relationship hops."
  },
  {
    id: 9,
    question: "In which scenario would a Relational Database (RDBMS) typically outperform a Graph Database?",
    options: [
      "A) Finding mutual friends across 6 degrees of separation in a social network",
      "B) Detecting circular money laundering rings across transaction accounts",
      "C) Sequential bulk aggregations across millions of independent, flat accounting records",
      "D) Finding shortest paths through an international airline flight network"
    ],
    answer_index: 2,
    explanation: "Relational databases and columnar engines excel at bulk, linear scans and aggregations across flat tables with minimal inter-record joins, whereas graph databases excel at complex, multi-hop relationship traversals."
  },
  {
    id: 10,
    question: "Why is the query 'MATCH (s:Student), (c:Course) RETURN s, c' generally discouraged unless explicitly intended?",
    options: [
      "A) Because it causes a syntax error in Cypher",
      "B) Because it produces an unconstrained Cartesian product matching every student with every course",
      "C) Because it automatically deletes all students and courses",
      "D) Because it forces the database to convert into an RDBMS table"
    ],
    answer_index: 1,
    explanation: "Matching disconnected entities without relationship patterns calculates a full Cartesian product (O(|V1| * |V2|)), which can consume massive memory on large graphs."
  },
  {
    id: 11,
    question: "Which of the following describes the default network port used for Bolt binary protocol driver communication in standard graph DBMS servers?",
    options: [
      "A) Port 7474 (HTTP Browser interface)",
      "B) Port 7687 (Bolt binary protocol)",
      "C) Port 3306 (MySQL default port)",
      "D) Port 5432 (PostgreSQL default port)"
    ],
    answer_index: 1,
    explanation: "Graph DBMS servers typically use port 7474 for HTTP web console access, and port 7687 for high-performance Bolt binary protocol connections utilized by official drivers."
  },
  {
    id: 12,
    question: "According to Cypher naming conventions and syntax standards, how should relationship types and node labels be cased?",
    options: [
      "A) Labels in UPPER_CASE and Relationships in lower_case",
      "B) Labels in UpperCamelCase (e.g., :Student) and Relationships in UPPER_SNAKE_CASE (e.g., [:ENROLLED_IN])",
      "C) Both labels and relationships must always be lowercase",
      "D) Cypher forbids the use of underscores in relationship types"
    ],
    answer_index: 1,
    explanation: "Cypher naming conventions dictate UpperCamelCase for Node Labels (e.g. :Student, :Course) and UPPER_SNAKE_CASE for Relationship Types (e.g. [:ENROLLED_IN], [:TEACHES])."
  }
];

export default function QuizSection({ onNext, onScoreUpdate, onQuizComplete }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const questions = QUIZ_QUESTIONS;

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

  const q = questions[currentQ];
  const allAnswered = questions.every((item) => answers[item.id] !== undefined);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Concept Assessment Quiz
            </h1>
            <p className="text-xs text-slate-500">
              Experiment 10 · Create and Manage a Graph Database ({questions.length} Questions)
            </p>
          </div>
        </div>

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

          let bgClass = 'bg-slate-200 text-slate-600';
          if (isCurrent) bgClass = 'bg-teal-600 text-white ring-2 ring-teal-300';
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
              cardStyle = 'border-teal-500 bg-teal-50/70 text-teal-950 ring-2 ring-teal-400/20';
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
                      ? 'bg-teal-600 text-white'
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

        {/* Explanation Box */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs sm:text-sm text-indigo-950 space-y-1.5"
          >
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Pedagogical Explanation:
            </div>
            <p className="text-slate-700 leading-relaxed">
              {q.explanation}
            </p>
          </motion.div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <button
            onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
            disabled={currentQ === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Previous
          </button>

          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            !submitted && (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
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
                {passed ? '🎉 Assessment Passed!' : 'Needs Review — Retake Assessment'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {passed
                  ? `You achieved ${pct}% (${score}/${questions.length}), successfully qualifying for your verified Graph Database Certificate.`
                  : `You scored ${pct}% (${score}/${questions.length}). A minimum of 70% is required to issue your certificate.`}
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
