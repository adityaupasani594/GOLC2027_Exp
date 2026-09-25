import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Printer, ShieldCheck, User, Building2, Calendar, Star, ChevronRight, CheckCircle2 } from 'lucide-react';

const EXP_INFO = {
  title: 'TF-IDF Based Document Retrieval',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems',
  code: 'IR-VSM-04',
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
  totalQuestions = 10,
  studentInfo = {},
  onInfoChange,
  onNext,
  onCertificateObtained,
}) {
  const score = quizScore ?? 8;
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          Section 4 — Certificate of Laboratory Completion
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Certificate of Completion</h2>
        <p className="text-slate-500 text-sm">Enter your student credentials below, then print or export your verified laboratory credential.</p>
      </motion.div>

      {/* Student details form — hidden on print */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 no-print shadow-sm"
      >
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Candidate Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                {label}
              </label>
              <input
                type="text"
                value={studentInfo[key] || ''}
                onChange={(e) => onInfoChange && onInfoChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Printable Certificate Frame */}
      <div className="relative bg-gradient-to-br from-amber-50/60 via-white to-blue-50/40 rounded-3xl border-4 border-double border-amber-300 p-8 sm:p-12 shadow-xl print:shadow-none print:border-amber-400 print:p-8 space-y-8 overflow-hidden">
        {/* Background watermark badge */}
        <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
          <Award className="w-72 h-72 text-blue-900" />
        </div>

        {/* Certificate Top Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-3">
            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-amber-400" />
            <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
              Virtual Laboratory Credential • IIT Kharagpur Guidelines
            </span>
            <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
            Certificate of Accomplishment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 italic">
            This is to certify that the scholar named below has successfully satisfied the requirements for
          </p>
        </div>

        {/* Candidate Presentation */}
        <div className="text-center space-y-1 relative z-10">
          <div className="text-xl sm:text-3xl font-extrabold text-blue-950 font-serif border-b-2 border-slate-300 pb-2 inline-block min-w-[280px]">
            {studentInfo.name || 'Student Scholar'}
          </div>
          <div className="text-xs text-slate-500 pt-1 font-mono">
            Candidate ID: {studentInfo.studentId || 'IR-LAB-04'}
          </div>
          <div className="text-xs text-slate-600 font-medium">
            {studentInfo.institution || 'VESIT – Department of Computer Engineering'}
          </div>
        </div>

        {/* Experiment Title */}
        <div className="text-center space-y-1 relative z-10 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Laboratory Practical Execution
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {EXP_INFO.title}
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            {EXP_INFO.subtitle} • Code: {EXP_INFO.code}
          </p>
        </div>

        {/* Metrics & Signatures Footer */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 relative z-10 text-center text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Assessment</span>
            <div className="font-extrabold text-base text-blue-600 font-mono">
              {score}/{totalQuestions} ({pct}%)
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono">Grade: {grade.label}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Date Verified</span>
            <div className="font-semibold text-slate-800 text-xs mt-1">
              {today}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">System Timestamp</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Laboratory Instructor</span>
            <div className="font-semibold text-slate-800 text-xs mt-1 truncate">
              {studentInfo.instructor || 'Dr. Sharmila Sengupta'}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Faculty Evaluation</span>
          </div>
        </div>
      </div>

      {/* Certificate Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print pt-2">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </button>

        {onNext && (
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            Proceed to Formal Lab Report
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
