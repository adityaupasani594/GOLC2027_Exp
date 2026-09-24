import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award, Printer, ShieldCheck, User, Building2, Calendar, Star,
  FileText, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { progressService } from '../../../services/progressService';

const EXP_META = {
  title: 'Create and Manage a Graph Database',
  subtitle: 'Database Management Systems & Knowledge Graphs',
  code: 'CS-KG-10',
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
  quizScore = 12,
  totalQuestions = 12,
  studentInfo = {},
  onInfoChange,
  onNext
}) {
  const { user, recordCertificate } = useAuth();
  const score = quizScore ?? 12;
  const pct = Math.round((score / totalQuestions) * 100);
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const certId = `CERT-KG10-${(studentInfo.studentId || '2026').replace(/\W/g, '')}-${score}`;

  const fields = [
    { key: 'name',        label: 'Full Name',               icon: User,        placeholder: 'e.g. Student Scholar' },
    { key: 'studentId',   label: 'Roll / Registration No',  icon: ShieldCheck, placeholder: 'e.g. 2026-CS-042' },
    { key: 'institution', label: 'Institution / Department', icon: Building2,   placeholder: 'e.g. VESIT – Dept. of Computer Engineering' },
    { key: 'instructor',  label: 'Faculty Instructor',       icon: Star,        placeholder: 'e.g. Course Instructor' },
  ];

  // Auto-save certificate to Firebase when qualified (pct >= 70)
  useEffect(() => {
    if (pct >= 70 && user) {
      const certPayload = {
        expNumber: 10,
        title: EXP_META.title,
        courseCode: EXP_META.code,
        grade: grade.label,
        score,
        total: totalQuestions,
        percentage: pct,
        certId,
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
  }, [pct, user, score, totalQuestions, studentInfo, grade.label, recordCertificate, certId]);

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
          Section 4 — Certificate of Completion
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          Achievement Certificate
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm">
          Verify your student credentials below, print your certificate, or advance to the official lab report.
        </p>
      </motion.div>

      {/* Student Details Form — hidden on print */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm no-print space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Student &amp; Institutional Credentials
          </p>
          <span className="text-[11px] text-teal-600 font-semibold">
            ✓ Synchronized with Cloud Firestore
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Bar — hidden on print */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print / Download Certificate
        </button>

        <button
          onClick={onNext}
          className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          Proceed to Lab Report
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Official Certificate Visual Document */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="relative bg-white rounded-3xl p-8 sm:p-12 border-8 border-double border-slate-300 shadow-xl overflow-hidden print:shadow-none print:border-4 print:p-8"
      >
        <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
        <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

        <div className="text-center space-y-6 max-w-2xl mx-auto relative z-10">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Department of Computer Engineering · Virtual Laboratory
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {studentInfo.institution || 'VESIT – Dept. of Computer Engineering'}
            </h1>
            <p className="text-[11px] text-slate-500 font-mono">
              Database Management Systems &amp; Knowledge Graphs
            </p>
          </div>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />

          <div className="space-y-1">
            <p className="text-xs font-serif italic text-slate-500">
              This is to certify that
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 border-b-2 border-slate-200 pb-2 inline-block px-8">
              {studentInfo.name || 'Student Participant'}
            </h2>
            <p className="text-xs font-mono text-slate-500 pt-1">
              Roll / Registration No: {studentInfo.studentId || '2026-CS-042'}
            </p>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed px-4">
            <p>
              has successfully conducted the practical laboratory session, completed the required graph modeling and Cypher query execution tasks, and demonstrated competence in the foundational practical experiment:
            </p>
            <p className="font-bold text-base sm:text-lg text-teal-900 font-serif">
              "{EXP_META.title}"
            </p>
            <p className="text-xs text-slate-500">
              demonstrating comprehensive competence in Labeled Property Graph (LPG) design, Index-Free Adjacency (IFA), Cypher CRUD operations (MATCH, CREATE, SET, DETACH DELETE), and multi-hop relationship traversals.
            </p>
          </div>

          {/* Performance Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Assessment Evaluation</span>
              <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${grade.bg} ${grade.color}`}>
                Grade: {grade.label} ({score}/{totalQuestions} · {pct}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, delay: 0.3 }}
                className={`h-full rounded-full bg-gradient-to-r ${grade.gradient}`}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Credential Verification ID: {certId}
            </p>
          </div>

          {/* Signatures & Seal */}
          <div className="grid grid-cols-3 items-end pt-8 border-t border-slate-100">
            <div className="text-center">
              <div className="h-8 border-b border-slate-300 w-28 sm:w-36 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-slate-700 uppercase">Course Coordinator</p>
              <p className="text-[9px] text-slate-400 font-mono">Virtual Labs Network</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mx-auto mb-1 shadow-md shadow-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-wider text-amber-700">
                Verified Academic Lab
              </p>
            </div>

            <div className="text-center">
              <div className="h-8 border-b border-slate-300 w-28 sm:w-36 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-slate-700 uppercase">Faculty Evaluator</p>
              <p className="text-[9px] text-slate-400 font-mono">
                {studentInfo.instructor?.split('/')[0]?.trim() || 'Dept. Faculty'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
