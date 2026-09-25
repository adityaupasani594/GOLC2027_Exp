import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Printer, ShieldCheck, User, Building2, Calendar, Star, ChevronRight, CheckCircle2 } from 'lucide-react';

const EXP_INFO = {
  title: 'Design a Knowledge Graph Schema and Import Data',
  subtitle: 'Knowledge Graphs & Graph Databases (KGIRS)',
  code: 'CS-KG-11',
  version: '2027.1',
};

export const GRADE = (pct) => {
  if (pct >= 90) return { label: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-300', gradient: 'from-emerald-500 to-teal-500' };
  if (pct >= 80) return { label: 'A',  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', gradient: 'from-emerald-500 to-teal-500' };
  if (pct >= 70) return { label: 'B',  color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200',       gradient: 'from-blue-500 to-indigo-500' };
  if (pct >= 60) return { label: 'C',  color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',     gradient: 'from-amber-500 to-orange-400' };
  return            { label: 'F',  color: 'text-red-600',      bg: 'bg-red-50 border-red-200',         gradient: 'from-red-500 to-rose-500' };
};

export default function CertificateSection({
  quizScore,
  totalQuestions = 15,
  studentInfo = {},
  onInfoChange,
  onNext,
  onCertificateObtained,
}) {
  const score = quizScore ?? 0;
  const pct   = Math.round((score / totalQuestions) * 100);
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (onCertificateObtained) {
      onCertificateObtained();
    }
  }, [onCertificateObtained]);

  const fields = [
    { key: 'name',        label: 'Full Name',               icon: User,        placeholder: 'e.g. Student Scholar' },
    { key: 'studentId',   label: 'Roll / Student ID',       icon: ShieldCheck, placeholder: 'e.g. 2026-CS-042' },
    { key: 'institution', label: 'Institution / Department', icon: Building2,  placeholder: 'e.g. Dept. of Computer Engineering, VESIT' },
    { key: 'instructor',  label: 'Faculty Instructor',       icon: Star,        placeholder: 'e.g. Dr. Sharmila Sengupta / Mrs. Abha Tewari' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Header — hidden on print */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 no-print">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          Section 4 — Certificate
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Achievement Certificate</h2>
        <p className="text-slate-500 text-sm">Enter your details below, then print or proceed to the full lab report.</p>
      </motion.div>

      {/* Student details form — hidden on print */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
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
                onChange={e => onInfoChange && onInfoChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Certificate Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        id="certificate-print-area"
        className="relative bg-white rounded-3xl p-8 sm:p-12 border-4 border-double border-emerald-300 shadow-xl overflow-hidden print:border-2 print:shadow-none print:p-8"
      >
        {/* Background watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <Award className="w-96 h-96 text-emerald-900" />
        </div>

        {/* Corner Accents */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-500" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-500" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-500" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-500" />

        <div className="relative text-center space-y-6">

          {/* Institution Header */}
          <div className="space-y-1">
            <p className="text-xs font-bold tracking-[0.25em] text-emerald-700 uppercase">
              {studentInfo.institution || 'Department of Computer Engineering'}
            </p>
            <p className="text-[11px] text-slate-400 tracking-wider uppercase font-medium">Virtual Laboratory &bull; {EXP_INFO.subtitle}</p>
          </div>

          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto" />

          {/* Certificate Title */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 tracking-wide">
              Certificate of Completion
            </h1>
            <p className="text-xs text-slate-500 italic">This is to certify that</p>
          </div>

          {/* Student Name */}
          <div className="py-2 border-b-2 border-dashed border-slate-300 max-w-sm mx-auto">
            <p className="text-xl sm:text-2xl font-serif font-bold text-slate-800 tracking-wider">
              {studentInfo.name || 'Student Scholar'}
            </p>
            {studentInfo.studentId && (
              <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {studentInfo.studentId}</p>
            )}
          </div>

          {/* Achievement Description */}
          <div className="max-w-lg mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed">
            has successfully designed a domain schema using the Labeled Property Graph (LPG) paradigm, executed multi-pass data ingestion with referential integrity validation, and demonstrated mastery of Cypher pattern queries in
            <p className="font-semibold text-slate-900 mt-1">
              &ldquo;{EXP_INFO.title}&rdquo; ({EXP_INFO.code})
            </p>
          </div>

          {/* Score & Grade Display */}
          <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Score</p>
              <p className="text-lg font-bold text-slate-800 font-mono">{score} / {totalQuestions}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Percentage</p>
              <p className="text-lg font-bold text-emerald-600 font-mono">{pct}%</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Grade</p>
              <p className={`text-lg font-bold font-mono ${grade.color}`}>{grade.label}</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-8 max-w-md mx-auto text-center">
            <div className="space-y-1">
              <div className="w-32 h-0.5 bg-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">{studentInfo.instructor || 'Faculty In-Charge'}</p>
              <p className="text-[10px] text-slate-400">Course Instructor</p>
            </div>
            <div className="space-y-1">
              <div className="w-32 h-0.5 bg-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">{today}</p>
              <p className="text-[10px] text-slate-400">Date of Verification</p>
            </div>
          </div>

          {/* Verification Hash */}
          <p className="text-[9px] font-mono text-slate-400 pt-2">
            Verification ID: KG11-{Date.now().toString(36).toUpperCase()}-LPG &bull; System Verified &bull; ISO/IEC 25010
          </p>
        </div>
      </motion.div>

      {/* Action Buttons — hidden on print */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition cursor-pointer shadow-2xs"
        >
          <Printer className="w-4 h-4 text-emerald-600" /> Print Certificate
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-md shadow-emerald-200"
        >
          Proceed to Lab Report <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
