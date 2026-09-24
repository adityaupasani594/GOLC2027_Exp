import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, CheckCircle2, XCircle, Award, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the primary function of variable-length relationship patterns such as [:CITES*1..3] in Cypher?",
    options: [
      "To restrict the traversal strictly to relationships created between index positions 1 and 3.",
      "To match paths with relationship depth starting from a minimum of 1 hop up to a maximum of 3 hops.",
      "To multiply the edge weights of the first 3 traversed relationships.",
      "To perform 3 concurrent batch queries simultaneously across separate database shards."
    ],
    answer: 1,
    explanation: "The syntax [:REL_TYPE*min..max] allows Cypher to traverse recursive paths spanning from min hops up to max hops recursively across the graph topology."
  },
  {
    id: 2,
    question: "In graph theory and network analysis, what does a 'triadic closure' represent?",
    options: [
      "A database deadlock caused by 3 concurrent write transactions.",
      "The tendency of two entities that share a mutual connection to become directly connected over time.",
      "A 3-node cycle where relationship traversal is mathematically impossible.",
      "The compression of three adjacent nodes into a single hyper-node."
    ],
    answer: 1,
    explanation: "Triadic closure occurs when two nodes (A and C) connected to a common intermediate node B form a direct edge (A-C), closing the open triad."
  },
  {
    id: 3,
    question: "Why is the 'WITH' clause critical in complex multi-part Cypher queries?",
    options: [
      "It establishes an exclusive database lock on the entire graph.",
      "It acts as a query pipeline boundary that chains query parts, allowing intermediate aggregation, filtering, and variable projection.",
      "It forces the query planner to bypass all index lookups and perform full graph scans.",
      "It automatically converts undirected edges into directional pointers."
    ],
    answer: 1,
    explanation: "WITH pipes intermediate records from one query segment to the next, enabling aggregations (e.g. count, sum, collect) and filtering on aggregated values before continuing."
  },
  {
    id: 4,
    question: "What does the Cypher aggregation function `collect(p.title)` return?",
    options: [
      "A scalar sum of character lengths across all paper titles.",
      "A single aggregated Cypher List containing all matched paper titles for the current grouping key.",
      "A newly created relationship type named COLLECT.",
      "A serialized binary JSON blob stored permanently on disk."
    ],
    answer: 1,
    explanation: "`collect()` gathers individual values into an ordered Cypher list (array) grouped by non-aggregate variables present in the projection."
  },
  {
    id: 5,
    question: "How does the built-in Cypher function `shortestPath()` optimize path finding between two nodes?",
    options: [
      "It runs a full Cartesian product across all graph vertices and sorts by length.",
      "It uses bidirectional Breadth-First Search (BFS) starting simultaneously from source and target until frontiers meet.",
      "It converts the graph into an adjacency matrix and computes its determinant.",
      "It randomly samples 100 paths and returns the one with the smallest ID."
    ],
    answer: 1,
    explanation: "shortestPath() uses bidirectional Breadth-First Search (BFS) starting from both source and target nodes simultaneously until search frontiers intersect."
  },
  {
    id: 6,
    question: "Consider the query: MATCH (a:Author)-[:AUTHORED]->(p:Paper) WHERE p.year >= 2022 RETURN a.name, count(p). What is the grouping key for count(p)?",
    options: [
      "p.year",
      "a.name",
      "p (the paper entity)",
      "The entire graph database instance"
    ],
    answer: 1,
    explanation: "In Cypher, any non-aggregated column in the RETURN/WITH statement (here, `a.name`) implicitly serves as the grouping key for aggregate functions like `count()`."
  },
  {
    id: 7,
    question: "What is the key advantage of an Index-Free Adjacency (IFA) graph database over an RDBMS during a 4-hop traversal?",
    options: [
      "IFA traversals have O(1) step complexity per node pointer dereference regardless of overall graph size, avoiding costly multi-table JOINs.",
      "IFA requires no RAM and processes all queries directly on optical storage.",
      "Relational databases cannot store more than 2 foreign keys per table.",
      "Cypher queries are compiled to hardware microcode while SQL queries are interpreted."
    ],
    answer: 0,
    explanation: "In native graph stores with Index-Free Adjacency, each node directly stores physical memory pointers to its adjacent edges, making traversal cost dependent only on visited subgraph size rather than total dataset size."
  },
  {
    id: 8,
    question: "What is the purpose of the pattern `WHERE NOT (a1)-[:COLLABORATED_WITH]-(a3)` in hidden collaborator discovery queries?",
    options: [
      "To enforce that a1 and a3 must have identical research domains.",
      "To filter out already existing direct collaborations so only novel, unformed relationships (open triads) are reported.",
      "To delete all collaboration records between a1 and a3.",
      "To reverse the direction of citation arrows."
    ],
    answer: 1,
    explanation: "`WHERE NOT (a1)-[:REL]-(a3)` ensures that we only surface open triads where no direct edge exists yet, pinpointing genuine hidden/latent collaboration opportunities."
  },
  {
    id: 9,
    question: "In an enterprise organizational graph, how can you match employees who report to managers who themselves report to the Director (2-hop reporting hierarchy)?",
    options: [
      "MATCH (e:Person)-[:REPORTS_TO*2]->(d:Person {role: 'Director'})",
      "SELECT e FROM Employees WHERE depth = 2",
      "MATCH (e:Person) WHERE e.manager.manager = 'Director'",
      "SEARCH (e) -> (m) -> (d) USING DFS"
    ],
    answer: 0,
    explanation: "The fixed-length path expression `[:REPORTS_TO*2]` specifically matches exactly 2 sequential hops of REPORTS_TO edges."
  },
  {
    id: 10,
    question: "What operator in a Cypher EXPLAIN execution plan represents scanning an index to find the starting node of a traversal?",
    options: [
      "ProduceResults",
      "NodeIndexSeek or NodeByLabelScan",
      "VarLengthExpand(All)",
      "EagerAggregation"
    ],
    answer: 1,
    explanation: "`NodeIndexSeek` uses a schema index to pinpoint starting nodes by property, whereas `NodeByLabelScan` scans all nodes having a specific label."
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
  const [answers, setAnswers] = useState({}); // questionId → selectedOptionIndex
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
      // Quiz finished
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
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200 cursor-pointer"
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
          initial={{ opacity:0, x: 24 }}
          animate={{ opacity:1, x: 0 }}
          exit={{ opacity:0, x: -24 }}
          transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4"
        >
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
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

          {/* Explanation (after submit) */}
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
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-md shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
