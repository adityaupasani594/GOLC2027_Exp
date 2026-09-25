import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Printer, Download, CheckCircle2, ShieldCheck,
  Building2, Calendar, User, Database, Sparkles, Save, Network, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { progressService } from '../../../services/progressService';
import { EXPERIMENT_CONFIG } from '../graphQueryEngine';

export default function ReportSection({
  quizScore = 10,
  totalQuestions = 10,
  studentInfo = {},
  recordedTrials = []
}) {
  const { user, recordReport } = useAuth();
  const [studentNotes, setStudentNotes] = useState(
    'Declarative pattern-based graph queries enabled intuitive traversal of the movie knowledge graph without nested joins. Direct 1-hop lookups traversed typed relationships like ACTED_IN and DIRECTED efficiently, while multi-hop traversals successfully linked actors across 2 degrees of separation to shared filming cities and production studios.'
  );
  const [isSaved, setIsSaved] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const scoreVal = quizScore ?? 0;
  const pct = totalQuestions > 0 ? Math.round((scoreVal / totalQuestions) * 100) : 100;

  const handleSaveToCloud = async () => {
    if (!user) return;
    const reportData = {
      expNumber: 12,
      title: EXPERIMENT_CONFIG.title,
      courseCode: EXPERIMENT_CONFIG.courseCode,
      score: scoreVal,
      total: totalQuestions,
      pct,
      studentName: studentInfo.name || user.displayName || 'Student Scholar',
      studentId: studentInfo.studentId || user.studentId || user.email || '',
      institution: studentInfo.institution || user.institution || 'VESIT – Dept. of Computer Engineering',
      instructor: studentInfo.instructor || 'Course Instructor',
      observations: studentNotes,
      trialsCount: recordedTrials.length,
      trials: recordedTrials,
      submittedAt: new Date().toISOString()
    };

    if (recordReport) {
      await recordReport(reportData);
    } else {
      await progressService.saveReport(user.uid, reportData);
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDownloadJSON = () => {
    const reportData = {
      title: EXPERIMENT_CONFIG.title,
      courseCode: EXPERIMENT_CONFIG.courseCode,
      student: studentInfo,
      date: today,
      quizScore: { score: scoreVal, total: totalQuestions, percentage: pct },
      observations: studentNotes,
      trials: recordedTrials
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KGIRS_Exp12_Report_${studentInfo.studentId || 'record'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Controls — hidden on print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Laboratory Report Generation
            </h1>
            <p className="text-xs text-slate-500">
              Compile experimental records, evaluation metrics, and observations into an official report.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleDownloadJSON}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            JSON Export
          </button>
          <button
            onClick={handleSaveToCloud}
            className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaved ? 'Synced to Cloud!' : 'Save Report'}
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Observations Input Card — hidden on print */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm no-print space-y-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Student Observations &amp; Scientific Discussion:
        </label>
        <textarea
          value={studentNotes}
          onChange={(e) => setStudentNotes(e.target.value)}
          rows={3}
          placeholder="Enter your interpretation of query results, graph traversal observations, and conclusions..."
          className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium leading-relaxed resize-none"
        />
        <p className="text-[11px] text-slate-400">
          This text will appear in Section 5 (Observations &amp; Experimental Conclusions) of your final signed lab report.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        {[
          { label: 'Quiz Assessment', val: `${scoreVal} / ${totalQuestions} (${pct}%)`, color: 'text-emerald-700' },
          { label: 'Recorded Trials', val: recordedTrials.length, color: 'text-indigo-700' },
          { label: 'Graph Model', val: '16 Nodes / 25 Edges', color: 'text-teal-700' },
          { label: 'Submission Date', val: today, color: 'text-slate-800' }
        ].map(({ label, val, color }) => (
          <div key={label} className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center shadow-sm">
            <div className={`text-base sm:text-lg font-black ${color}`}>{val}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Printable Official Document Sheet */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-8 print:shadow-none print:border-none print:p-0 print:m-0"
      >
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-5 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Virtual Laboratory Examination Report
            </p>
            <span className="font-mono text-xs text-slate-400">
              {EXPERIMENT_CONFIG.courseCode} · Exp #{EXPERIMENT_CONFIG.expNo}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {EXPERIMENT_CONFIG.title}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Course: {EXPERIMENT_CONFIG.course} · {studentInfo.institution || 'VESIT – Dept. of Computer Engineering'}
          </p>
        </div>

        {/* Student Information Box */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 grid sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Student Scholar</span>
            <span className="font-bold text-slate-900 text-sm">{studentInfo.name || 'Student Scholar'}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Student ID / Roll</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{studentInfo.studentId || '2026-CS-042'}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Evaluation Score</span>
            <span className="font-bold text-emerald-700 text-sm">
              {scoreVal} / {totalQuestions} ({pct}%) — {pct >= 70 ? 'Competence Verified' : 'Incomplete'}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Date of Record</span>
            <span className="text-slate-800 text-sm font-medium">{today}</span>
          </div>
        </div>

        {/* Section 1: Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-100 pb-1">
            1. Learning Objectives
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {EXPERIMENT_CONFIG.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-bold text-slate-400">•</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 2: Property Graph Domain Model */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
              2. Graph Database Schema &amp; Entity Ontology
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Property Graph Model
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-indigo-900 block">:Person Nodes</span>
              <span className="text-[11px] text-slate-600">Actors &amp; Directors with born year properties</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-rose-900 block">:Movie Nodes</span>
              <span className="text-[11px] text-slate-600">Titles, release years, and runtime durations</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-emerald-900 block">:Organization Nodes</span>
              <span className="text-[11px] text-slate-600">Production studios and distributor entities</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-amber-900 block">:City Nodes</span>
              <span className="text-[11px] text-slate-600">Filming and headquarters locations</span>
            </div>
          </div>
        </div>

        {/* Section 3: Declarative Graph Query Syntax Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-100 pb-1">
            3. Pattern-Based Query Language Specifications
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Clause</th>
                  <th className="px-4 py-2.5">Execution Semantics</th>
                  <th className="px-4 py-2.5">Standard Pattern Syntax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-white">
                  <td className="px-4 py-2 font-mono font-bold text-indigo-700">MATCH</td>
                  <td className="px-4 py-2 text-slate-700">Declares subgraph structure to traverse</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-slate-600">(a:Person)-[:ACTED_IN]-&gt;(m:Movie)</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="px-4 py-2 font-mono font-bold text-indigo-700">WHERE</td>
                  <td className="px-4 py-2 text-slate-700">Predicates filtering candidate paths</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-slate-600">WHERE m.released &gt;= 2000</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-2 font-mono font-bold text-indigo-700">RETURN</td>
                  <td className="px-4 py-2 text-slate-700">Projects matched nodes, edges, or properties</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-slate-600">RETURN a.name, m.title, count(m)</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="px-4 py-2 font-mono font-bold text-indigo-700">ORDER BY / LIMIT</td>
                  <td className="px-4 py-2 text-slate-700">Sorts results and constrains returned rows</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-slate-600">ORDER BY m.released DESC LIMIT 10</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Recorded Experimental Trials Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
              4. Experimental Query Execution Log
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {recordedTrials.length} Trials Logged
            </span>
          </div>

          {recordedTrials.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Trial ID</th>
                    <th className="px-4 py-2.5">Mode</th>
                    <th className="px-4 py-2.5">Pattern Query Executed</th>
                    <th className="px-4 py-2.5 text-center">Rows</th>
                    <th className="px-4 py-2.5 text-center">Nodes</th>
                    <th className="px-4 py-2.5 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recordedTrials.map((tr) => (
                    <tr key={tr.trialId || tr.id}>
                      <td className="px-4 py-2 font-mono font-bold text-indigo-700">{tr.trialId || tr.id}</td>
                      <td className="px-4 py-2 font-bold text-slate-900">{tr.mode}</td>
                      <td className="px-4 py-2 font-mono text-[11px] text-slate-700 max-w-xs truncate" title={tr.query}>
                        {tr.query}
                      </td>
                      <td className="px-4 py-2 text-center font-bold text-teal-700">{tr.rowCount}</td>
                      <td className="px-4 py-2 text-center font-mono text-slate-600">{tr.matchedNodesCount}</td>
                      <td className="px-4 py-2 text-right font-mono text-slate-500">{tr.executionTimeMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
              0 experimental trials recorded during this session. Execute queries and record trials in the Simulation Lab to display them in this table.
            </div>
          )}
        </div>

        {/* Section 5: Observations & Experimental Conclusions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-100 pb-1">
            5. Observations &amp; Experimental Conclusions
          </h3>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            {studentNotes}
          </p>
        </div>

        {/* Section 6: Signatures Deck */}
        <div className="grid grid-cols-2 pt-12 border-t border-slate-200 gap-8">
          <div>
            <div className="h-10 border-b-2 border-slate-400 w-48 mb-1.5" />
            <p className="text-xs font-bold text-slate-900 uppercase">Student Signature</p>
            <p className="text-[10px] text-slate-500 font-mono">Date: {today}</p>
          </div>

          <div className="text-right">
            <div className="h-10 border-b-2 border-slate-400 w-48 ml-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-900 uppercase">Faculty Evaluator</p>
            <p className="text-[10px] text-slate-500 font-mono">
              VESIT Department of Computer Engineering
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
