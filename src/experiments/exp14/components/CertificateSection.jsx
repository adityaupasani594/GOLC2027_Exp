import React from 'react';
import { motion } from 'framer-motion';
import { Award, Printer, ShieldCheck, User, Building2, Calendar, Star, ChevronRight } from 'lucide-react';

const EXP_INFO = {
  title: 'Integration of Information Retrieval with Knowledge Graphs',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  code: 'CS-KGIRS-14',
  version: '1.0',
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
  const pct   = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const fields = [
    { key: 'name',        label: 'Full Name',               icon: User,        placeholder: 'e.g. Jane Smith' },
    { key: 'studentId',   label: 'Roll / Student ID',       icon: ShieldCheck, placeholder: 'e.g. CS-2027-042' },
    { key: 'institution', label: 'Institution / Department', icon: Building2,   placeholder: 'e.g. Dept. of Computer Science & Engineering' },
    { key: 'instructor',  label: 'Faculty Instructor',       icon: Star,        placeholder: 'e.g. Course Faculty Instructor' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Header — hidden on print */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 no-print">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          Section 4 — Certificate
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Achievement Certificate</h2>
        <p className="text-slate-500 text-sm">Enter your details below, then print or proceed to the full lab report.</p>
      </motion.div>

      {/* Student details form — hidden on print */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="glass rounded-2xl p-6 border border-white/80 shadow-sm no-print space-y-4"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-teal-200 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Certificate
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 text-white text-sm font-semibold shadow cursor-pointer"
          >
            View Lab Report <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* ── Printable Certificate Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.4 }}
        className="bg-white rounded-3xl border-2 border-teal-100 shadow-xl overflow-hidden cert-card"
      >
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 px-8 py-8 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-200 mb-2">Certificate of Completion</p>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight mb-1">{EXP_INFO.title}</h1>
              <p className="text-teal-100 text-xs leading-relaxed">{EXP_INFO.subtitle}</p>
            </div>
            {/* Grade badge */}
            <div className="shrink-0 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/15 border-2 border-white/30 flex flex-col items-center justify-center backdrop-blur-sm">
                <span className="text-3xl font-black leading-none text-white">{grade.label}</span>
                <span className="text-[10px] text-white/70 font-semibold mt-0.5">{pct}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* This certifies that */}
          <div className="text-center py-2">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">This certifies that</p>
            <p className="text-2xl font-bold text-slate-900 border-b-2 border-dashed border-teal-200 pb-2 inline-block min-w-[200px]">
              {studentInfo.name || '________________________________'}
            </p>
            <p className="text-sm text-slate-500 mt-2">has successfully completed the virtual laboratory experiment on</p>
            <p className="text-sm font-semibold text-teal-700 mt-0.5">Integration of Information Retrieval with Knowledge Graphs</p>
          </div>

          {/* Student meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100">
            {[
              { label: 'Student ID',   value: studentInfo.studentId   || '—', icon: ShieldCheck },
              { label: 'Institution',  value: studentInfo.institution || '—', icon: Building2 },
              { label: 'Instructor',   value: studentInfo.instructor  || '—', icon: Star },
              { label: 'Date Issued',  value: today,                          icon: Calendar },
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
                ? '✓ Demonstrated mastery of Information Retrieval + Knowledge Graph entity exploration.'
                : 'Review theory and simulation to reinforce IR scoring and graph traversal concepts.'}
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
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-teal-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-1 shadow-lg shadow-teal-200">
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
