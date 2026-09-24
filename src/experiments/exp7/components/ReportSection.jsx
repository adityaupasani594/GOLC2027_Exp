import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Printer, Download, CheckCircle2, ShieldCheck,
  Building2, Calendar, User, Database, Sparkles, AlertCircle, Save
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { progressService } from '../../../services/progressService';
import { EXPERIMENT_CONFIG } from '../relationshipExtractionEngine';

export default function ReportSection({
  quizScore = 10,
  totalQuestions = 10,
  studentInfo = {},
  recordedTrials = []
}) {
  const { user, recordReport } = useAuth();
  const [studentNotes, setStudentNotes] = useState(
    'The relationship extraction model successfully recognized named entities and mapped semantic relationships into structured knowledge graph triples, handling active/passive syntax and filtering negative assertions.'
  );
  const [isSaved, setIsSaved] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const scoreVal = quizScore ?? 0;
  const pct = totalQuestions > 0 ? Math.round((scoreVal / totalQuestions) * 100) : 100;

  // Flatten all extracted triples across recorded trials
  const allRecordedTriples = recordedTrials.flatMap((tr) => tr.triples || []);

  const handleSaveToCloud = async () => {
    if (!user) return;
    const reportData = {
      expNumber: 7,
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSaveToCloud}
            className="px-4 py-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaved ? 'Synced to Cloud!' : 'Save Report'}
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
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
          placeholder="Enter your interpretation of results, observations, and conclusions..."
          className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium leading-relaxed resize-none"
        />
        <p className="text-[11px] text-slate-400">
          This text will appear in Section 5 (Observations &amp; Analysis) of your final signed lab report.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        {[
          { label: 'Quiz Assessment', val: `${scoreVal} / ${totalQuestions} (${pct}%)`, color: 'text-emerald-700' },
          { label: 'Recorded Trials', val: recordedTrials.length, color: 'text-indigo-700' },
          { label: 'Extracted Triples', val: allRecordedTriples.length, color: 'text-teal-700' },
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
            <span className="font-mono font-bold text-slate-900 text-sm">{studentInfo.studentId || '2026-CS-000'}</span>
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

        {/* Section 2: Extracted Semantic Triples Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
              2. Extracted Semantic Triples (Subject – Predicate – Object)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {allRecordedTriples.length} Total Assertions
            </span>
          </div>

          {allRecordedTriples.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Subject (e1)</th>
                    <th className="px-4 py-2.5 text-center">Relationship (r)</th>
                    <th className="px-4 py-2.5">Object (e2)</th>
                    <th className="px-4 py-2.5">Syntactic Strategy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allRecordedTriples.map((t, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-4 py-2 font-bold text-slate-900">{t.subject}</td>
                      <td className="px-4 py-2 font-mono font-bold text-teal-700 text-center">{t.relation}</td>
                      <td className="px-4 py-2 font-bold text-slate-900">{t.object}</td>
                      <td className="px-4 py-2 text-slate-500 font-mono text-[11px]">{t.syntaxPattern || 'Active Voice'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
              No individual trial records captured yet. Record trials in the Simulation Lab to display triples in this table.
            </div>
          )}
        </div>

        {/* Section 3: Recorded Experimental Trials Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
              3. Experimental Run History
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
                    <th className="px-4 py-2.5">Sample / Source</th>
                    <th className="px-4 py-2.5 text-center">Entities</th>
                    <th className="px-4 py-2.5 text-center">Triples</th>
                    <th className="px-4 py-2.5">Key Relation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recordedTrials.map((tr) => (
                    <tr key={tr.id}>
                      <td className="px-4 py-2 font-mono font-bold text-indigo-700">{tr.id}</td>
                      <td className="px-4 py-2 text-slate-800 font-medium">{tr.sample}</td>
                      <td className="px-4 py-2 text-center font-bold text-purple-700">{tr.entityCount}</td>
                      <td className="px-4 py-2 text-center font-bold text-teal-700">{tr.tripleCount}</td>
                      <td className="px-4 py-2 font-mono text-slate-600">{tr.topRelation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
              0 experimental trials recorded during this session.
            </div>
          )}
        </div>

        {/* Section 4: Observations & Analysis */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-100 pb-1">
            4. Observations &amp; Experimental Conclusions
          </h3>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            {studentNotes}
          </p>
        </div>

        {/* Section 5: Signatures Deck */}
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
