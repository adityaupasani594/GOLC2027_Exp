import os

base_dir = r"c:\Users\vedan\Downloads\GOLC2027_Exp\src\experiments\exp13"
comp_dir = os.path.join(base_dir, "components")
os.makedirs(comp_dir, exist_ok=True)

# 2. QuizSection.jsx
quiz_jsx = """import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle, Award, ChevronRight } from 'lucide-react';

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    q: 'In Cypher, what does the pattern `MATCH path = (p1:Paper)-[:CITES*2..4]->(p2:Paper)` evaluate?',
    opts: [
      'Any citation path originating at p1 and terminating at p2 having between 2 and 4 relationship hops inclusive',
      'All paths between p1 and p2 where exactly 2 to 4 papers exist in the entire graph database',
      'A single random path that contains at least 4 relationships',
      'A citation path where each paper must have between 2 and 4 citations'
    ],
    ans: 0,
    exp: 'The asterisk syntax *min..max denotes variable-length path matching. *2..4 matches paths consisting of between 2 and 4 consecutive relationship hops.'
  },
  {
    id: 2,
    q: 'What is the primary role of the `WITH` clause in a multi-stage Cypher query?',
    opts: [
      'To create temporary physical indexes on disk during query runtime',
      'To pipeline and divide query execution into stages, enabling intermediate aggregations, projections, and filtering',
      'To terminate query execution immediately if a null property is encountered',
      'To import external CSV data files into the active graph session'
    ],
    ans: 1,
    exp: 'The WITH clause acts as a boundary pipeline that isolates query parts, allowing aggregation (e.g., count, sum), variable aliasing, and post-aggregation WHERE filtering.'
  },
  {
    id: 3,
    q: 'When grouping papers by author using `WITH a, collect(p.title) AS titles`, what does `collect()` produce for each author `a`?',
    opts: [
      'A single concatenated string with paper titles separated by commas',
      'A Python dictionary mapping author IDs to citations',
      'An ordered list/array containing the titles of all matched papers for that author',
      'The total numeric count of authored papers'
    ],
    ans: 2,
    exp: 'In Cypher, collect() is an aggregator that gathers individual record expressions across grouped rows into a single list/array.'
  },
  {
    id: 4,
    q: 'How does Cypher define a triadic closure (open triangle) for discovering hidden collaborators?',
    opts: [
      'Two authors who have co-authored 3 or more papers together',
      'Two authors connected to a mutual collaborator who do not currently share a direct collaboration edge',
      'A paper that has been cited by exactly three distinct research institutions',
      'A relationship with a weight equal to 3.0'
    ],
    ans: 1,
    exp: 'Triadic closure identifies two nodes (A1, A2) that both link to a common bridge node B, but lack a direct edge between (A1, A2), predicting a high propensity for future collaboration.'
  },
  {
    id: 5,
    q: 'In a graph with average branching factor b, what is the theoretical computational complexity of an unconstrained multi-hop path search of depth k?',
    opts: [
      'O(k · log b)',
      'O(b + k)',
      'O(b^k) exponential growth',
      'O(1) constant time'
    ],
    ans: 2,
    exp: 'At each depth step, the frontier multiplies by the branching factor b. Across k hops, path exploration complexity scales exponentially as O(b^k).'
  },
  {
    id: 6,
    q: 'What is the operational difference between Cypher\\'s `shortestPath()` and `allShortestPaths()` functions?',
    opts: [
      'shortestPath() finds unweighted paths, while allShortestPaths() requires edge weights',
      'shortestPath() returns a single minimal-hop path, whereas allShortestPaths() returns every path tied for the minimal length',
      'shortestPath() only works on directed trees, while allShortestPaths() works on cyclic graphs',
      'There is no difference; they are aliases for the same underlying algorithm'
    ],
    ans: 1,
    exp: 'shortestPath() terminates upon finding the first valid shortest path, while allShortestPaths() exhausts the frontier to return all paths of identical minimal hop count.'
  },
  {
    id: 7,
    q: 'Why does index-free adjacency provide significant performance advantages over relational SQL joins for deep traversals?',
    opts: [
      'It compresses all graph nodes into a single JSON column',
      'Each node maintains direct in-memory pointers to its connected neighbors, ensuring O(1) time traversal per relationship hop',
      'It completely removes the need for computer RAM during graph execution',
      'It converts all queries into SQL UNION ALL statements'
    ],
    ans: 1,
    exp: 'With index-free adjacency, traversing an edge does not require looking up a foreign key in a global B-Tree index (O(log N)); instead, it directly follows in-memory pointers in O(1) time.'
  },
  {
    id: 8,
    q: 'Which Cypher clause is used to filter graph patterns based on property conditions and boolean logic?',
    opts: [
      'FILTER BY',
      'HAVING',
      'WHERE',
      'RESTRICT'
    ],
    ans: 2,
    exp: 'In Cypher, WHERE immediately follows a MATCH, OPTIONAL MATCH, or WITH clause to filter pattern matches based on property values and predicates.'
  },
  {
    id: 9,
    q: 'In a professional network, how can an indirect connection between Alice and Eve (Alice → Bob → Eve) be retrieved using Cypher?',
    opts: [
      'MATCH (a:Person {name: \\'Alice\\'})-[:DIRECT]->(e:Person {name: \\'Eve\\'})',
      'MATCH path = (a:Person {name: \\'Alice\\'})-[*2]->(e:Person {name: \\'Eve\\'}) WHERE NOT (a)-[:KNOWS|WORKS_WITH]->(e)',
      'DELETE (a:Person {name: \\'Alice\\'})',
      'DROP GRAPH professional_network'
    ],
    ans: 1,
    exp: 'The multi-hop pattern [*2] traverses 2 relationship hops from Alice to Eve, while WHERE NOT confirms there is no direct 1-hop edge.'
  },
  {
    id: 10,
    q: 'What is the purpose of matching a cyclic pattern such as `MATCH path = (p:Paper)-[:CITES*2..4]->(p)`?',
    opts: [
      'To find papers with zero citations',
      'To detect circular citation loops or feedback rings where a paper eventually cites itself through an intermediate chain',
      'To permanently delete disconnected nodes',
      'To sort papers alphabetically by venue'
    ],
    ans: 1,
    exp: 'Matching a path originating and terminating at the same node p via variable-length traversal detects closed topological loops and citation rings.'
  }
];

export default function QuizSection({ onNext, onScoreUpdate }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const questions = useMemo(() => QUIZ_QUESTIONS, []);
  const score = submitted ? questions.filter(q => answers[q.id] === q.ans).length : 0;

  const handleAnswer = (qId, optIdx) => {
    if (!submitted) setAnswers(p => ({ ...p, [qId]: optIdx }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const s = questions.filter(q => answers[q.id] === q.ans).length;
    onScoreUpdate && onScoreUpdate(s);
  };

  const q = questions[currentQ];
  const answered = answers[q.id] !== undefined;
  const isCorrect = submitted && answers[q.id] === q.ans;
  const isWrong = submitted && answered && answers[q.id] !== q.ans;
  const allAnswered = questions.every(qq => answers[qq.id] !== undefined);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
          <HelpCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Assessment Quiz — Advanced Cypher Queries</h1>
          <p className="text-xs text-slate-500">Multi-Hop Traversals, Aggregation, and Graph Motifs ({questions.length} Questions)</p>
        </div>
        {submitted && (
          <div className="ml-auto px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-lg">
            {score}/{questions.length}
          </div>
        )}
      </div>

      {/* Progress Track */}
      <div className="flex gap-1">
        {questions.map((qq, i) => (
          <button
            key={qq.id}
            onClick={() => setCurrentQ(i)}
            className={`flex-1 h-2 rounded-full transition-all ${
              i === currentQ
                ? 'bg-rose-500'
                : submitted
                ? answers[qq.id] === qq.ans
                  ? 'bg-emerald-500'
                  : 'bg-red-400'
                : answers[qq.id] !== undefined
                ? 'bg-indigo-400'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 text-sm font-black flex items-center justify-center shrink-0">
              {currentQ + 1}
            </span>
            <span className="text-sm font-bold text-slate-800 leading-snug">{q.q}</span>
          </div>

          <div className="space-y-2 pt-1">
            {q.opts.map((opt, i) => {
              const sel = answers[q.id] === i;
              const correct = submitted && i === q.ans;
              const wrong = submitted && sel && i !== q.ans;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(q.id, i)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                    correct
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-2xs'
                      : wrong
                      ? 'bg-red-50 border-red-400 text-red-900 shadow-2xs'
                      : sel
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/50'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-black ${
                      correct
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : wrong
                        ? 'bg-red-400 border-red-400 text-white'
                        : sel
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'border-slate-300 text-slate-600'
                    }`}
                  >
                    {correct ? '✓' : wrong ? '✗' : String.fromCharCode(65 + i)}
                  </span>
                  <span className="leading-relaxed text-xs sm:text-sm">{opt}</span>
                </button>
              );
            })}
          </div>

          {submitted && (
            <div
              className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                isCorrect
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1">
                {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
              </div>
              <p>{q.exp}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between">
        <button
          disabled={currentQ === 0}
          onClick={() => setCurrentQ(p => p - 1)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-all"
        >
          Previous
        </button>
        <span className="text-xs text-slate-400 font-medium">
          Question {currentQ + 1} of {questions.length}
        </span>
        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(p => p + 1)}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : !submitted ? (
          <button
            disabled={!allAnswered}
            onClick={handleSubmit}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold shadow-md hover:bg-rose-600 disabled:opacity-40 transition-all"
          >
            Submit Quiz
          </button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Award className="w-4 h-4" />
            Get Certificate
          </motion.button>
        )}
      </div>
    </div>
  );
}
"""

with open(os.path.join(comp_dir, "QuizSection.jsx"), "w", encoding="utf-8") as f:
    f.write(quiz_jsx)
print("Wrote QuizSection.jsx")

# 3. CertificateSection.jsx
cert_jsx = """import React from 'react';
import { motion } from 'framer-motion';
import { Award, Printer, ShieldCheck, User, Building2, Calendar, Star, ChevronRight, Share2 } from 'lucide-react';

const EXP_INFO = {
  title: 'Advanced Cypher Queries and Graph Pattern Matching',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  code: 'CS-KGIRS-13',
  version: '2027.1',
};

export const GRADE = (pct) => {
  if (pct >= 90) return { label: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-300', gradient: 'from-emerald-500 to-teal-500' };
  if (pct >= 80) return { label: 'A',  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', gradient: 'from-emerald-500 to-teal-500' };
  if (pct >= 70) return { label: 'B',  color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200',       gradient: 'from-blue-500 to-indigo-500' };
  if (pct >= 60) return { label: 'C',  color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',     gradient: 'from-amber-500 to-orange-400' };
  return           { label: 'F',  color: 'text-red-600',      bg: 'bg-red-50 border-red-200',         gradient: 'from-red-500 to-rose-500' };
};

export default function CertificateSection({ quizScore, totalQuestions, studentInfo, onInfoChange, onNext }) {
  const score = quizScore ?? 0;
  const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const fields = [
    { key: 'name',        label: 'Full Name',               icon: User,        placeholder: 'e.g. Student Scholar' },
    { key: 'studentId',   label: 'Roll / Student ID',       icon: ShieldCheck, placeholder: 'e.g. 2026-CS-042' },
    { key: 'institution', label: 'Institution / Department', icon: Building2,   placeholder: 'e.g. Dept. of Computer Engineering' },
    { key: 'instructor',  label: 'Faculty Instructor',       icon: Star,        placeholder: 'e.g. Course Instructor' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 no-print">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          Section 4 — Certificate
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Achievement Certificate</h2>
        <p className="text-slate-500 text-sm">Enter your details below, then print or proceed to the laboratory report.</p>
      </motion.div>

      {/* Student details form */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="glass rounded-2xl p-6 border border-slate-200 bg-white shadow-sm no-print space-y-4"
      >
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Information</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                <f.icon className="w-3 h-3" />{f.label}
              </label>
              <input
                type="text"
                value={studentInfo[f.key] || ''}
                onChange={e => onInfoChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-cyan-200 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Certificate
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold shadow cursor-pointer"
          >
            View Lab Report <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Printable Certificate Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.4 }}
        className="bg-white rounded-3xl border-2 border-cyan-100 shadow-xl overflow-hidden cert-card"
      >
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 px-8 py-8 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200 mb-2">Certificate of Completion</p>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight mb-1">{EXP_INFO.title}</h1>
              <p className="text-cyan-100 text-xs leading-relaxed">{EXP_INFO.subtitle}</p>
            </div>
            <div className="shrink-0 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/15 border-2 border-white/30 flex flex-col items-center justify-center backdrop-blur-sm">
                <span className="text-3xl font-black leading-none text-white">{grade.label}</span>
                <span className="text-[10px] text-white/70 font-semibold mt-0.5">{pct}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Certifies that */}
          <div className="text-center py-2">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">This certifies that</p>
            <p className="text-2xl font-bold text-slate-900 border-b-2 border-dashed border-cyan-200 pb-2 inline-block min-w-[200px]">
              {studentInfo.name || '________________________________'}
            </p>
            <p className="text-sm text-slate-500 mt-2">has successfully completed the virtual laboratory experiment on</p>
            <p className="text-sm font-semibold text-cyan-800 mt-0.5">Advanced Cypher Queries, Multi-Hop Traversals &amp; Graph Pattern Matching</p>
          </div>

          {/* Student meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100">
            {[
              { label: 'Student ID',  value: studentInfo.studentId   || '—', icon: ShieldCheck },
              { label: 'Institution', value: studentInfo.institution || '—', icon: Building2 },
              { label: 'Instructor',  value: studentInfo.instructor  || '—', icon: Star },
              { label: 'Date Issued', value: today,                          icon: Calendar },
            ].map(f => (
              <div key={f.label}>
                <div className="flex items-center gap-1 mb-0.5">
                  <f.icon className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{f.label}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Score bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Assessment Score</span>
              <span className={`font-bold font-mono ${grade.color}`}>{score}/{totalQuestions} · {pct}% · Grade {grade.label}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                className={`h-full rounded-full bg-gradient-to-r ${grade.gradient}`}
              />
            </div>
            <p className="text-xs text-slate-400 text-center">
              {pct >= 70
                ? '✓ Demonstrated mastery of multi-hop Cypher patterns, intermediate aggregation with WITH, and hidden motif discovery.'
                : 'Review theory to reinforce Cypher variable-length paths, triadic closures, and query complexity.'}
            </p>
          </div>

          {/* Experiment code */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              {EXP_INFO.code} · v{EXP_INFO.version}
            </span>
          </div>

          {/* Signatures */}
          <div className="flex items-end justify-between pt-2">
            <div>
              <div className="h-10 border-b-2 border-slate-300 w-36" />
              <p className="text-[10px] text-slate-400 mt-1">Student Signature</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-1 shadow-lg shadow-cyan-200">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Verified</p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b-2 border-slate-300 w-36" />
              <p className="text-[10px] text-slate-400 mt-1">Faculty Verification</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
"""

with open(os.path.join(comp_dir, "CertificateSection.jsx"), "w", encoding="utf-8") as f:
    f.write(cert_jsx)
print("Wrote CertificateSection.jsx")

# 4. ReportSection.jsx
report_jsx = """import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, CheckCircle2, Share2, Network, BarChart2 } from 'lucide-react';

export default function ReportSection({ quizScore, totalQuestions, studentInfo, trials }) {
  const [notes, setNotes] = useState('');
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => setGenerated(true);

  const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const pct = totalQuestions > 0 ? Math.round((quizScore / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center shadow-md">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Lab Report — Advanced Cypher Queries</h1>
          <p className="text-xs text-slate-500">Knowledge Graph Pattern Matching &amp; Multi-Hop Traversal</p>
        </div>
      </div>

      {/* Observations */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-2">
        <h2 className="text-sm font-bold text-slate-800">Student Observations &amp; Analysis</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Document your experimental observations: Compare multi-hop traversal depths, path explosion scalability, triadic closure predictions, and how the WITH clause pipelines intermediate aggregations.
        </p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g., When increasing traversal depth k from 1 to 3, the number of traversed paths grew exponentially from 4 to 19. The triadic closure query successfully identified Dr. Fei-Fei Li and Dr. Demis Hassabis as future collaborators via bridge author Dr. Andrew Ng..."
          className="w-full p-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-slate-50 font-medium mt-2"
          rows={5}
        />
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Quiz Score', val: quizScore != null ? `${quizScore}/${totalQuestions}` : 'Not taken' },
          { label: 'Mastery %', val: quizScore != null ? `${pct}%` : '—' },
          { label: 'Trials Recorded', val: trials.length },
          { label: 'Report Date', val: date },
        ].map(({ label, val }) => (
          <div key={label} className="p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
            <div className="text-xl font-black text-cyan-700">{val}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-semibold">{label}</div>
          </div>
        ))}
      </div>

      {/* Trials Table */}
      {trials.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-600" />
            <h2 className="text-sm font-bold text-slate-800">Recorded Experimental Trials ({trials.length})</h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-cyan-700 text-white">
                  {['#', 'Query Type', 'Dataset', 'Parameters', 'Matches', 'Latency', 'Cypher Pattern'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {trials.map((t, i) => (
                  <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-3 py-2 font-mono font-bold text-cyan-700">{t.id}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{t.queryName}</td>
                    <td className="px-3 py-2 text-slate-600">{t.dataset}</td>
                    <td className="px-3 py-2 font-mono text-slate-600">{t.params}</td>
                    <td className="px-3 py-2 text-center font-bold text-emerald-600">{t.matches}</td>
                    <td className="px-3 py-2 text-slate-500">{t.latency} ms</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-indigo-700 max-w-xs truncate">{t.cypher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!generated ? (
        <div className="flex justify-center pt-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            <FileText className="w-4 h-4" /> Generate Official Lab Report
          </motion.button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-emerald-900 text-base">Official Laboratory Report Generated</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              CS-KGIRS-13
            </span>
          </div>
          <div className="space-y-2 text-sm text-slate-700 grid sm:grid-cols-2 gap-2">
            <div><span className="font-semibold text-slate-800">Experiment:</span> Advanced Cypher Queries and Graph Pattern Matching</div>
            <div><span className="font-semibold text-slate-800">Subject:</span> Knowledge Graphs and Information Retrieval Systems</div>
            <div><span className="font-semibold text-slate-800">Student Name:</span> {studentInfo?.name || 'Not specified'}</div>
            <div><span className="font-semibold text-slate-800">Roll / ID:</span> {studentInfo?.studentId || 'Not specified'}</div>
            <div><span className="font-semibold text-slate-800">Institution:</span> {studentInfo?.institution || 'VESIT'}</div>
            <div><span className="font-semibold text-slate-800">Date:</span> {date}</div>
            <div><span className="font-semibold text-slate-800">Quiz Score:</span> {quizScore != null ? `${quizScore}/${totalQuestions} (${pct}%)` : 'Not taken'}</div>
            <div><span className="font-semibold text-slate-800">Trials Logged:</span> {trials.length} trials</div>
          </div>
          {notes && (
            <div className="p-3.5 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-emerald-900 block mb-1">Student Synthesis:</span>
              {notes}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
"""

with open(os.path.join(comp_dir, "ReportSection.jsx"), "w", encoding="utf-8") as f:
    f.write(report_jsx)
print("Wrote ReportSection.jsx")

# 5. index.jsx in exp13
index_jsx = """import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FlaskConical, HelpCircle, Award, FileText } from 'lucide-react';
import { ExperimentNavbar } from '../../components/common';
import TheorySection from './components/TheorySection';
import LabSection from './components/LabSection';
import QuizSection, { QUIZ_QUESTIONS } from './components/QuizSection';
import CertificateSection from './components/CertificateSection';
import ReportSection from './components/ReportSection';

const TABS = [
  { id: 'theory',      label: 'Theory',         short: 'Theory', icon: BookOpen,     color: 'indigo' },
  { id: 'lab',         label: 'Simulation Lab', short: 'Lab',    icon: FlaskConical, color: 'teal'   },
  { id: 'quiz',        label: 'Quiz',           short: 'Quiz',   icon: HelpCircle,   color: 'rose'   },
  { id: 'certificate', label: 'Certificate',    short: 'Cert.',  icon: Award,        color: 'amber'  },
  { id: 'report',      label: 'Report',         short: 'Report', icon: FileText,     color: 'indigo' },
];

const TAB_ACTIVE = {
  indigo: 'bg-indigo-600 text-white shadow-indigo-200',
  teal:   'bg-teal-600 text-white shadow-teal-200',
  rose:   'bg-rose-500 text-white shadow-rose-200',
  amber:  'bg-amber-500 text-white shadow-amber-200',
};

export default function Experiment13({ onBack, onOpenProfile }) {
  const [activeTab, setActiveTab] = useState('theory');
  const [trials, setTrials] = useState([]);
  const [quizScore, setQuizScore] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    studentId: '',
    institution: 'VESIT – Dept. of Computer Engineering',
    instructor: 'Dr. Sharmila Sengupta / Mrs. Abha Tewari / Mrs. Sunita Suralkar',
  });

  const handleInfoChange = (key, value) => setStudentInfo(prev => ({ ...prev, [key]: value }));
  const handleScoreUpdate = (score) => setQuizScore(score);

  const goTo = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <ExperimentNavbar
        title="Exp 13: Advanced Cypher & Pattern Matching"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={goTo}
        onBack={onBack}
        quizScore={quizScore}
        totalQuestions={QUIZ_QUESTIONS.length}
        tabActiveStyles={TAB_ACTIVE}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'theory' && (
            <motion.div key="theory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <TheorySection onGoToLab={() => goTo('lab')} />
            </motion.div>
          )}
          {activeTab === 'lab' && (
            <motion.div key="lab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <LabSection
                onRecordTrial={(t) => setTrials(prev => [...prev, t])}
                trials={trials}
                onGoToQuiz={() => goTo('quiz')}
              />
            </motion.div>
          )}
          {activeTab === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <QuizSection onNext={() => goTo('certificate')} onScoreUpdate={handleScoreUpdate} />
            </motion.div>
          )}
          {activeTab === 'certificate' && (
            <motion.div key="certificate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <CertificateSection
                quizScore={quizScore}
                totalQuestions={QUIZ_QUESTIONS.length}
                studentInfo={studentInfo}
                onInfoChange={handleInfoChange}
                onNext={() => goTo('report')}
              />
            </motion.div>
          )}
          {activeTab === 'report' && (
            <motion.div key="report" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <ReportSection
                quizScore={quizScore}
                totalQuestions={QUIZ_QUESTIONS.length}
                studentInfo={studentInfo}
                trials={trials}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="glass border-t border-white/60 py-4 text-center text-xs text-slate-400 no-print flex flex-col sm:flex-row items-center justify-center gap-2">
        <div>
          <span className="font-semibold text-slate-600">Advanced Cypher Queries and Graph Pattern Matching</span>
          <span className="mx-2">·</span>
          <span className="font-mono">CS-KGIRS-13 · Module 13</span>
        </div>
        <span className="hidden sm:inline">·</span>
        <button onClick={onBack} className="text-cyan-600 hover:text-cyan-800 font-semibold cursor-pointer underline underline-offset-2">
          Return to 15 Experiments Portal
        </button>
      </footer>
    </div>
  );
}
"""

with open(os.path.join(base_dir, "index.jsx"), "w", encoding="utf-8") as f:
    f.write(index_jsx)
print("Wrote exp13/index.jsx")

# Also exp11/index.jsx re-exporting or pointing to Experiment13
exp11_dir = r"c:\Users\vedan\Downloads\GOLC2027_Exp\src\experiments\exp11"
with open(os.path.join(exp11_dir, "index.jsx"), "w", encoding="utf-8") as f:
    f.write("""import React from 'react';
import Experiment13 from '../exp13';

/**
 * Experiment 11 (Advanced Cypher Queries & Pattern Matching from EXP11 folder)
 * Maps seamlessly to the full Cypher Graph Pattern Matching simulation.
 */
export default function Experiment11(props) {
  return <Experiment13 {...props} />;
}
""")
print("Wrote exp11/index.jsx")
