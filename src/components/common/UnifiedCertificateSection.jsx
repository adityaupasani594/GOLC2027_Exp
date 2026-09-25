import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Award, ShieldCheck, User, Building2, Calendar, Star,
  ChevronRight, CheckCircle2, FileText, ArrowRight, Download, Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { progressService } from '../../services/progressService';

export const GRADE = (pct) => {
  if (pct >= 90) return { label: 'A+', color: 'text-emerald-600', colorHex: '#059669', bg: 'bg-emerald-50 border-emerald-300', gradient: 'from-emerald-500 to-teal-500' };
  if (pct >= 80) return { label: 'A',  color: 'text-emerald-600', colorHex: '#059669', bg: 'bg-emerald-50 border-emerald-200', gradient: 'from-emerald-500 to-teal-500' };
  if (pct >= 70) return { label: 'B',  color: 'text-blue-600',    colorHex: '#2563eb', bg: 'bg-blue-50 border-blue-200',       gradient: 'from-blue-500 to-indigo-500' };
  if (pct >= 60) return { label: 'C',  color: 'text-amber-600',   colorHex: '#d97706', bg: 'bg-amber-50 border-amber-200',     gradient: 'from-amber-500 to-orange-400' };
  return            { label: 'F',  color: 'text-rose-600',    colorHex: '#e11d48', bg: 'bg-rose-50 border-rose-200',       gradient: 'from-rose-500 to-red-500' };
};

function roundRectHelper(ctx, x, y, width, height, radius = 8) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    const r = typeof radius === 'number' ? Math.min(radius, width / 2, height / 2) : 8;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Pure 2D Canvas Renderer for Direct Certificate Download
 * Generates an ultra-crisp, high-definition 1600x1120 PNG certificate instantly.
 */
function drawCertificateOnCanvas({
  expNumber = 1,
  expTitle = 'Laboratory Module',
  expSubtitle = 'Knowledge Graph & Information Retrieval Analytics Laboratory',
  formattedCode = 'KIRA-EXP-01',
  studentName = 'Student Scholar',
  institution = 'VESIT – Dept. of Computer Engineering',
  studentId = '2026-CS-000',
  score = 0,
  totalQuestions = 10,
  pct = 0,
  gradeLabel = 'F',
  gradeColor = '#e11d48',
  today = ''
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1120;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1600, 1120);

  // Outer double border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, 1528, 1048);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, 1512, 1032);

  // Corner Accents (Amber)
  const cornerSize = 48;
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 4;

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(36, 36 + cornerSize);
  ctx.lineTo(36, 36);
  ctx.lineTo(36 + cornerSize, 36);
  ctx.stroke();

  // Top-Right
  ctx.beginPath();
  ctx.moveTo(1564 - cornerSize, 36);
  ctx.lineTo(1564, 36);
  ctx.lineTo(1564, 36 + cornerSize);
  ctx.stroke();

  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(36, 1084 - cornerSize);
  ctx.lineTo(36, 1084);
  ctx.lineTo(36 + cornerSize, 1084);
  ctx.stroke();

  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(1564 - cornerSize, 1084);
  ctx.lineTo(1564, 1084);
  ctx.lineTo(1564, 1084 - cornerSize);
  ctx.stroke();

  // Header Title: KIRA VIRTUAL LAB
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 38px system-ui, -apple-system, sans-serif';
  ctx.fillText('KIRA VIRTUAL LAB', 800, 130);

  // Subtitle
  ctx.fillStyle = '#64748b';
  ctx.font = '500 16px monospace';
  ctx.fillText(expSubtitle || 'Knowledge Graph & Information Retrieval Analytics Laboratory', 800, 168);

  // Module Code
  ctx.fillStyle = '#b45309';
  ctx.font = '700 14px monospace';
  ctx.fillText(`MODULE ${expNumber < 10 ? '0' + expNumber : expNumber} • ${formattedCode}`, 800, 200);

  // Gold Divider Line
  const grad = ctx.createLinearGradient(650, 225, 950, 225);
  grad.addColorStop(0, 'rgba(217, 119, 6, 0)');
  grad.addColorStop(0.5, 'rgba(217, 119, 6, 1)');
  grad.addColorStop(1, 'rgba(217, 119, 6, 0)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(650, 225);
  ctx.lineTo(950, 225);
  ctx.stroke();

  // "This is to formally certify that"
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 300 20px Georgia, serif';
  ctx.fillText('This is to formally certify that', 800, 280);

  // Student Name
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 46px system-ui, -apple-system, sans-serif';
  ctx.fillText(studentName || 'Student Scholar', 800, 345);

  // Underline
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(500, 365);
  ctx.lineTo(1100, 365);
  ctx.stroke();

  // "of [Institution]"
  ctx.fillStyle = '#334155';
  let instFontSize = 24;
  ctx.font = `600 ${instFontSize}px system-ui, -apple-system, sans-serif`;
  let instText = `of ${institution || 'VESIT – Dept. of Computer Engineering'}`;
  let instMetrics = ctx.measureText(instText);
  while (instMetrics.width > 1200 && instFontSize > 16) {
    instFontSize -= 2;
    ctx.font = `600 ${instFontSize}px system-ui, -apple-system, sans-serif`;
    instMetrics = ctx.measureText(instText);
  }
  ctx.fillText(instText, 800, 410);

  // Student Roll / ID
  ctx.fillStyle = '#64748b';
  ctx.font = '500 16px monospace';
  ctx.fillText(`Roll / Student ID: ${studentId || '2026-CS-000'}`, 800, 450);

  // Achievement Text
  ctx.fillStyle = '#475569';
  ctx.font = '400 18px system-ui, -apple-system, sans-serif';
  ctx.fillText('has successfully completed all laboratory components, interactive simulations, and conceptual mastery assessments for', 800, 520);

  // Experiment Title (with font scaling)
  ctx.fillStyle = '#312e81'; // Indigo-900
  let titleFontSize = 28;
  ctx.font = `bold italic ${titleFontSize}px Georgia, serif`;
  let titleText = `"${expTitle || 'Laboratory Module'}"`;
  let titleMetrics = ctx.measureText(titleText);
  while (titleMetrics.width > 1200 && titleFontSize > 16) {
    titleFontSize -= 2;
    ctx.font = `bold italic ${titleFontSize}px Georgia, serif`;
    titleMetrics = ctx.measureText(titleText);
  }
  ctx.fillText(titleText, 800, 565);

  ctx.fillStyle = '#64748b';
  ctx.font = '400 16px system-ui, -apple-system, sans-serif';
  ctx.fillText('demonstrating academic proficiency and rigorous empirical understanding in accordance with curriculum requirements.', 800, 610);

  // Assessment Box
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  roundRectHelper(ctx, 480, 665, 640, 95, 16);
  ctx.fill();
  ctx.stroke();

  // Assessment Evaluation label & grade
  ctx.textAlign = 'left';
  ctx.fillStyle = '#334155';
  ctx.font = '700 16px system-ui, -apple-system, sans-serif';
  ctx.fillText('Assessment Evaluation', 510, 702);

  ctx.textAlign = 'right';
  ctx.fillStyle = gradeColor || '#e11d48';
  ctx.font = '700 16px monospace';
  ctx.fillText(`Grade: ${gradeLabel} (${score}/${totalQuestions} · ${pct}%)`, 1090, 702);

  // Progress Bar Track
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  roundRectHelper(ctx, 510, 722, 580, 14, 7);
  ctx.fill();

  // Progress Bar Fill
  if (pct > 0) {
    ctx.fillStyle = gradeColor || '#10b981';
    ctx.beginPath();
    roundRectHelper(ctx, 510, 722, Math.max(14, (pct / 100) * 580), 14, 7);
    ctx.fill();
  }

  // Footer Dateline
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 980);
  ctx.lineTo(1500, 980);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 15px monospace';
  ctx.fillText(`Date Issued: ${today}`, 100, 1015);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = '700 15px monospace';
  ctx.fillText('KIRA VIRTUAL LABORATORY • GOLC 2027', 1500, 1015);

  return canvas;
}

export default function UnifiedCertificateSection({
  expNumber = 1,
  expTitle = 'Laboratory Module',
  expSubtitle = 'Knowledge Graph & Information Retrieval Analytics Laboratory',
  expCode = null,
  quizScore = null,
  totalQuestions = 10,
  studentInfo = {},
  onInfoChange = null,
  onNext = null,
  onGoToReport = null,
  onCertificateObtained = null,
}) {
  const { user, recordCertificate } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef(null);

  // If user hasn't given the quiz, quizScore is null/undefined -> score is 0/totalQuestions
  const hasTakenQuiz = quizScore !== null && quizScore !== undefined;
  const score = hasTakenQuiz ? Number(quizScore) : 0;
  const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedCode = expCode || `KIRA-EXP-${expNumber < 10 ? `0${expNumber}` : expNumber}`;

  const fields = [
    { key: 'name', label: 'Full Name', icon: User, placeholder: 'e.g. Student Scholar' },
    { key: 'studentId', label: 'Roll / Student ID', icon: ShieldCheck, placeholder: 'e.g. 2026-CS-042' },
    { key: 'institution', label: 'Institution / College', icon: Building2, placeholder: 'e.g. VESIT – Dept. of Computer Engineering' },
  ];

  // Auto-save certificate to Firebase only when qualified (pct >= 70) and user actually took the quiz
  useEffect(() => {
    if (hasTakenQuiz && pct >= 70 && user) {
      const certPayload = {
        expNumber,
        title: expTitle,
        courseCode: formattedCode,
        grade: grade.label,
        score,
        total: totalQuestions,
        percentage: pct,
        studentName: studentInfo.name || user.displayName || 'Student Scholar',
        studentId: studentInfo.studentId || user.studentId || user.email || '',
        institution: studentInfo.institution || user.institution || 'VESIT',
        issuedAt: new Date().toISOString()
      };

      if (recordCertificate) {
        recordCertificate(certPayload);
      } else {
        progressService.saveCertificate(user.uid, certPayload);
      }
    }
    if (hasTakenQuiz && onCertificateObtained) {
      onCertificateObtained();
    }
  }, [hasTakenQuiz, pct, user, score, totalQuestions, studentInfo, grade.label, recordCertificate, onCertificateObtained, expNumber, expTitle, formattedCode]);

  const [downloaded, setDownloaded] = useState(false);

  // Robust, direct standalone certificate download using HTML5 2D Canvas
  const handleDownload = () => {
    try {
      setIsDownloading(true);
      const canvas = drawCertificateOnCanvas({
        expNumber,
        expTitle,
        expSubtitle,
        formattedCode,
        studentName: studentInfo?.name || user?.displayName || 'Student Scholar',
        institution: studentInfo?.institution || user?.institution || 'VESIT – Dept. of Computer Engineering',
        studentId: studentInfo?.studentId || user?.studentId || user?.email || '2026-CS-000',
        score,
        totalQuestions,
        pct,
        gradeLabel: grade.label,
        gradeColor: grade.colorHex || '#10b981',
        today
      });

      if (!canvas) throw new Error('Canvas initialization failed');

      const cleanName = (studentInfo?.name || user?.displayName || 'Scholar').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `KIRA_Certificate_Exp${expNumber < 10 ? '0' + expNumber : expNumber}_${cleanName}.png`;

      // Primary: synchronous toDataURL download
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = filename;
        a.href = dataUrl;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
        }, 100);
        setIsDownloading(false);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2500);
        return;
      } catch (dataUrlErr) {
        console.warn('toDataURL failed, attempting toBlob fallback:', dataUrlErr);
      }

      // Secondary fallback: toBlob
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Blob export failed');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = filename;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setIsDownloading(false);
          setDownloaded(true);
          setTimeout(() => setDownloaded(false), 2500);
        }, 150);
      }, 'image/png');
    } catch (err) {
      console.error('Error downloading certificate:', err);
      setIsDownloading(false);
    }
  };

  const handleAdvance = () => {
    if (onNext) onNext();
    else if (onGoToReport) onGoToReport();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Strict Print Isolation CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible !important;
          }
          #printable-certificate {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 32px 40px !important;
            border: 6px double #cbd5e1 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Header — hidden on print */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 no-print"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          Certificate of Laboratory Competence
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          Achievement Certificate
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm">
          Enter or verify your student credentials below, then download your standalone certificate or advance to the lab report.
        </p>
      </motion.div>

      {/* Quiz Pending Notice if user hasn't completed the quiz */}
      {!hasTakenQuiz && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 no-print shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Assessment Pending: You have not taken the quiz yet. Current benchmark score is <strong>0/{totalQuestions}</strong>.</span>
          </div>
          <span className="text-[11px] text-amber-800 font-bold bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
            Pass Threshold: 70% (7/{totalQuestions})
          </span>
        </div>
      )}

      {/* Student Details Input Form — hidden on print */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm no-print space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Student Profile Details
          </p>
          <span className="text-[11px] text-teal-600 font-semibold">
            ✓ Auto-synced with Cloud Firestore
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium transition-all"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Bar — hidden on print */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Direct Download Button (Downloads ONLY the Certificate) */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting Certificate...</span>
              </>
            ) : downloaded ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Certificate Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Certificate</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={handleAdvance}
          className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Proceed to Lab Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Official Certificate Visual Document */}
      <motion.div
        ref={certificateRef}
        id="printable-certificate"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="relative bg-white rounded-3xl p-8 sm:p-12 border-8 border-double border-slate-300 shadow-xl overflow-hidden print:shadow-none print:border-4 print:p-8"
      >
        {/* Ornamental Corner Accents */}
        <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
        <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

        {/* Certificate Content */}
        <div className="text-center space-y-6 max-w-2xl mx-auto relative z-10">
          {/* Institution Header: KIRA Virtual Lab */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
              KIRA Virtual Lab
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-wide">
              {expSubtitle}
            </p>
            <p className="text-[11px] text-amber-700 font-semibold font-mono tracking-wider">
              MODULE {expNumber < 10 ? `0${expNumber}` : expNumber} • {formattedCode}
            </p>
          </div>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />

          {/* Certificate Recipient: Name + "of" + Institution */}
          <div className="space-y-1.5">
            <p className="text-xs font-serif italic text-slate-500">
              This is to formally certify that
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 border-b-2 border-slate-200 pb-2 inline-block px-8">
              {studentInfo.name || 'Student Scholar'}
            </h2>
            <p className="text-sm font-semibold text-slate-700 pt-1">
              of <span className="font-bold text-slate-900">{studentInfo.institution || 'VESIT – Dept. of Computer Engineering'}</span>
            </p>
            <p className="text-xs font-mono text-slate-500">
              Roll / Student ID: {studentInfo.studentId || '2026-CS-000'}
            </p>
          </div>

          {/* Achievement Statement */}
          <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed px-4">
            <p>
              has successfully completed all laboratory components, interactive simulations, and conceptual mastery assessments for
            </p>
            <p className="font-bold text-base sm:text-lg text-indigo-900 font-serif">
              "{expTitle}"
            </p>
            <p className="text-xs text-slate-500">
              demonstrating academic proficiency and rigorous empirical understanding in accordance with curriculum requirements.
            </p>
          </div>

          {/* Score & Evaluation Meter */}
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
          </div>

          {/* Clean Certificate Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Date Issued: {today}</span>
            <span className="text-slate-500 font-bold uppercase">KIRA Virtual Laboratory • GOLC 2027</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
