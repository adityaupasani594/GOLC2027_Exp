import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award, Printer, ShieldCheck, User, Building2, Calendar, Star,
  ChevronRight, CheckCircle2, FileText, ArrowRight, Sparkles, Network
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { progressService } from '../../../services/progressService';

const EXP_META = {
  title: 'Query Knowledge Graphs with Pattern-Based Queries',
  subtitle: 'Knowledge Graph & Information Retrieval Systems (KGIRS)',
  code: 'CS-KGIRS-12',
  version: '1.0'
};

export const GRADE = (pct) => {
  if (pct >= 90) return { label: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-300', gradient: 'from-emerald-500 to-teal-500' };
  if (pct >= 80) return { label: 'A',  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', gradient: 'from-emerald-500 to-teal-500' };
  if (pct >= 70) return { label: 'B',  color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200',       gradient: 'from-blue-500 to-indigo-500' };
  if (pct >= 60) return { label: 'C',  color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',     gradient: 'from-amber-500 to-orange-400' };
  return            { label: 'F',  color: 'text-red-600',      bg: 'bg-red-50 border-red-200',         gradient: 'from-red-500 to-rose-500' };
};

export default function CertificateSection({
  quizScore = 10,
  totalQuestions = 10,
  studentInfo = {},
  onInfoChange,
  onNext
}) {
  const { user, recordCertificate } = useAuth();
  const score = quizScore ?? 10;
  const pct = Math.round((score / totalQuestions) * 100);
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const fields = [
    { key: 'name',        label: 'Full Name',               icon: User,        placeholder: 'e.g. Student Scholar' },
    { key: 'studentId',   label: 'Roll / Student ID',       icon: ShieldCheck, placeholder: 'e.g. 2026-CS-042' },
    { key: 'institution', label: 'Institution / Department', icon: Building2,   placeholder: 'e.g. VESIT – Dept. of Computer Engineering' },
    { key: 'instructor',  label: 'Faculty Instructor',       icon: Star,        placeholder: 'e.g. Dr. Sharmila Sengupta / Lab Faculty' },
  ];

  // Auto-save certificate to Firebase when qualified (pct >= 70)
  useEffect(() => {
    if (pct >= 70 && user) {
      const certPayload = {
        expNumber: 12,
        title: EXP_META.title,
        courseCode: EXP_META.code,
        grade: grade.label,
        score,
        total: totalQuestions,
        percentage: pct,
        studentName: studentInfo.name || user.displayName || 'Student Scholar',
        studentId: studentInfo.studentId || user.studentId || user.email || '',
        institution: studentInfo.institution || user.institution || 'VESIT – Dept. of Computer Engineering',
        instructor: studentInfo.instructor || 'Course Instructor',
        issuedAt: new Date().toISOString()
      };

      if (recordCertificate) {
        recordCertificate(certPayload);
      } else {
        progressService.saveCertificate(user.uid, certPayload);
      }
    }
  }, [pct, user, score, totalQuestions, studentInfo, grade.label, recordCertificate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header — hidden on print */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 no-print"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          Section 4 — Certificate of Competence
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          Achievement Certificate
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm">
          Enter or verify your student details below, then print or advance to generate your official laboratory report.
        </p>
      </motion.div>

      {/* Student Details Input Form — hidden on print */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm no-print space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Student &amp; Institutional Profile
          </p>
          <span className="text-[11px] text-teal-600 font-semibold">
            ✓ Auto-synced with Cloud Firestore
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                <f.icon className="w-3 h-3 text-slate-400" />
                {f.label}
              </label>
              <input
                type="text"
                value={studentInfo[f.key] || ''}
                onChange={(e) => onInfoChange && onInfoChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium transition-all"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Printable Certificate Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="relative bg-white rounded-3xl p-8 sm:p-12 border-8 border-double border-amber-600/30 shadow-2xl space-y-8 overflow-hidden print:border-8 print:shadow-none print:m-0"
      >
        {/* Background Decorative Crest Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Network className="w-96 h-96 text-slate-900" />
        </div>

        {/* Certificate Top Header */}
        <div className="text-center space-y-3 border-b-2 border-amber-200/80 pb-6 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Virtual Laboratory of Knowledge Graphs &amp; IR
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight">
            Certificate of Competence
          </h1>

          <p className="text-xs sm:text-sm font-serif italic text-slate-600 max-w-xl mx-auto">
            This certifies that the candidate has successfully planned, formulated, and validated declarative pattern queries and multi-hop graph traversals.
          </p>
        </div>

        {/* Candidate Recipient */}
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
            PROUDLY PRESENTED TO
          </p>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-8">
            {studentInfo.name || 'Student Scholar'}
          </div>
          <p className="text-xs font-mono text-slate-500 mt-2">
            ID: {studentInfo.studentId || '2026-CS-042'} · {studentInfo.institution || 'VESIT – Dept. of Computer Engineering'}
          </p>
        </div>

        {/* Experiment Citation */}
        <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200/70 text-center space-y-2">
          <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            For Demonstrated Mastery in Experiment #{EXP_META.code.slice(-2)}:
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-900 font-serif">
            {EXP_META.title}
          </p>
          <p className="text-xs text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Constructing declarative graph pattern queries (<code className="font-mono text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">MATCH ... WHERE ... RETURN</code>), directed edge traversals, multi-hop path filtering, degree aggregations, and visual subgraph analysis.
          </p>
        </div>

        {/* Grade & Verification Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Performance Grade</div>
            <div className={`text-xl sm:text-2xl font-black mt-0.5 ${grade.color}`}>
              {grade.label} ({pct}%)
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score Achieved</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {score} / {totalQuestions}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Validation</div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 mt-2 font-mono">
              {today}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Course Code</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-indigo-700 mt-2">
              {EXP_META.code}
            </div>
          </div>
        </div>

        {/* Official Signatures & Seal */}
        <div className="grid grid-cols-3 items-end pt-8 border-t border-slate-200 gap-4">
          <div className="text-center">
            <div className="h-10 border-b-2 border-slate-400 mx-auto w-32 mb-1" />
            <p className="text-xs font-bold text-slate-900">{studentInfo.instructor || 'Faculty In-Charge'}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Laboratory Evaluator</p>
          </div>

          {/* Golden Seal */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-500 bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 flex flex-col items-center justify-center shadow-lg text-amber-950 p-2 text-center">
              <ShieldCheck className="w-5 h-5 text-amber-900 mb-0.5" />
              <span className="text-[8px] font-black uppercase tracking-tighter leading-none">VERIFIED</span>
              <span className="text-[7px] font-bold leading-none mt-0.5">KGIRS LAB</span>
            </div>
          </div>

          <div className="text-center">
            <div className="h-10 border-b-2 border-slate-400 mx-auto w-32 mb-1" />
            <p className="text-xs font-bold text-slate-900">Dr. Sharmila Sengupta</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Department Head</p>
          </div>
        </div>
      </motion.div>

      {/* Action Footer Buttons — hidden on print */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print pt-2">
        <p className="text-xs text-slate-500">
          Tip: You can print this certificate or save it directly as a high-resolution PDF for portfolio verification.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Certificate
          </button>

          <button
            onClick={onNext}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Generate Lab Report
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
