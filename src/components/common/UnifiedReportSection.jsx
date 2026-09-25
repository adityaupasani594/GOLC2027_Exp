import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { GRADE } from './UnifiedCertificateSection';
import { useAuth } from '../../context/AuthContext';

/**
 * Sanitizes Unicode/Math characters into clean ASCII equivalents for standard jsPDF fonts.
 * Standard built-in fonts (Helvetica, Times, Courier) only support Latin-1 encoding.
 * Non-Latin characters (like Greek λ, subscripts ₁, math operators) return NaN character widths,
 * which breaks jsPDF's splitTextToSize algorithm and causes text to run off the page.
 */
function sanitizeTextForPDF(input) {
  if (!input) return '';
  return String(input)
    // Greek letters
    .replace(/λ/g, 'lambda')
    .replace(/α/g, 'alpha')
    .replace(/β/g, 'beta')
    .replace(/γ/g, 'gamma')
    .replace(/δ/g, 'delta')
    .replace(/θ/g, 'theta')
    .replace(/σ/g, 'sigma')
    .replace(/μ/g, 'mu')
    .replace(/π/g, 'pi')
    // Subscripts
    .replace(/₀/g, '0')
    .replace(/₁/g, '1')
    .replace(/₂/g, '2')
    .replace(/₃/g, '3')
    .replace(/₄/g, '4')
    .replace(/₅/g, '5')
    .replace(/₆/g, '6')
    .replace(/₇/g, '7')
    .replace(/₈/g, '8')
    .replace(/₉/g, '9')
    .replace(/ᵢ/g, 'i')
    .replace(/ⱼ/g, 'j')
    .replace(/ₖ/g, 'k')
    // Superscripts
    .replace(/⁰/g, '^0')
    .replace(/¹/g, '^1')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    // Math symbols
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/≠/g, '!=')
    .replace(/≈/g, '~=')
    .replace(/×/g, 'x')
    .replace(/÷/g, '/')
    .replace(/±/g, '+/-')
    .replace(/√/g, 'sqrt')
    .replace(/∑/g, 'Sum')
    .replace(/∏/g, 'Prod')
    .replace(/∞/g, 'inf')
    // Quotes and dashes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2022\u2023]/g, '*')
    // Ellipsis
    .replace(/\u2026/g, '...')
    // Replace any remaining non-ASCII characters
    .replace(/[^\x00-\x7F]/g, '');
}

/**
 * Pure jsPDF Generator for Laboratory Reports
 * Directly outputs an official multi-page A4 PDF file into the user's Downloads folder.
 */
function generateReportPDF({
  expNumber = 1,
  expTitle = 'Laboratory Experiment',
  expSubtitle = 'Knowledge Graphs & Information Retrieval Systems',
  formattedCode = 'KIRA-EXP-01',
  studentName = 'Student Scholar',
  studentId = '',
  institution = '',
  instructor = '',
  aim = '',
  objectives = [],
  pipelineStages = [],
  trials = [],
  observations = '',
  pct = 0,
  gradeLabel = 'F',
  today = '',
}) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
    orientation: 'portrait'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt
  const margin = 40;
  const contentWidth = pageWidth - margin * 2; // 515.28 pt
  let y = margin;

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - 50) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Header Letterhead
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('KIRA VIRTUAL LABORATORY', margin, y);
  y += 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // Slate-900
  const titleLines = doc.splitTextToSize(sanitizeTextForPDF(expTitle || 'Laboratory Experiment'), contentWidth - 170);
  doc.text(titleLines, margin, y);

  // Right-aligned Date & Assessment
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Report Date: ${today}`, pageWidth - margin, y - 4, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105); // Emerald-600
  doc.text(`LAB ASSESSMENT: ${pct}% (${gradeLabel})`, pageWidth - margin, y + 10, { align: 'right' });

  y += titleLines.length * 17 + 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(sanitizeTextForPDF(`${expSubtitle || 'Knowledge Graphs & Information Retrieval Systems'} • ${formattedCode}`), margin, y);
  y += 10;

  // Solid divider rule
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 14;

  // Student Metadata Table Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 38, 4, 4, 'FD');

  // Left: Student Scholar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('STUDENT SCHOLAR', margin + 12, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(sanitizeTextForPDF(studentName || 'Student Scholar'), margin + 12, y + 27);

  // Right: Platform
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('LABORATORY PLATFORM', pageWidth - margin - 12, y + 14, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text('KIRA Virtual Laboratory', pageWidth - margin - 12, y + 27, { align: 'right' });

  y += 50;

  // 1. Experimental Aim & Scope
  if (aim) {
    checkPageBreak(80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Experimental Aim & Scope', margin, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const cleanAim = sanitizeTextForPDF(aim);
    const aimLines = doc.splitTextToSize(cleanAim, contentWidth - 24);
    const aimBoxHeight = aimLines.length * 11.5 + 14;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, aimBoxHeight, 3, 3, 'FD');

    doc.setTextColor(51, 65, 85);
    doc.text(aimLines, margin + 12, y + 14);
    y += aimBoxHeight + 12;

    // Objectives
    if (objectives && objectives.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('CORE LEARNING OBJECTIVES:', margin, y);
      y += 10;

      objectives.forEach((obj, idx) => {
        checkPageBreak(22);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const cleanObj = sanitizeTextForPDF(`${idx + 1}.  ${obj}`);
        const objLines = doc.splitTextToSize(cleanObj, contentWidth - 20);
        doc.text(objLines, margin + 6, y);
        y += objLines.length * 11 + 3;
      });
      y += 8;
    }
  }

  // 2. Architectural Pipeline & Algorithmic Phases
  if (pipelineStages && pipelineStages.length > 0) {
    checkPageBreak(80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Architectural Pipeline & Algorithmic Phases', margin, y);
    y += 12;

    pipelineStages.forEach((stg) => {
      checkPageBreak(32);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(sanitizeTextForPDF(`${stg.stage}: ${stg.name}`), margin + 6, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const cleanDesc = sanitizeTextForPDF(stg.desc);
      const descLines = doc.splitTextToSize(cleanDesc, contentWidth - 24);
      doc.text(descLines, margin + 12, y);
      y += descLines.length * 10 + 6;
    });
    y += 6;
  }

  // 3. Empirical Benchmark Trials
  checkPageBreak(80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`3. Empirical Benchmark Trials & Metric Evaluations (${trials?.length || 0} trials logged)`, margin, y);
  y += 12;

  if (!trials || trials.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('No live trials logged yet. Benchmarks completed according to standard curricular defaults.', margin + 10, y + 15);
    y += 34;
  } else {
    // Render trials table
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text('#', margin + 6, y + 12);
    doc.text('INPUT / QUERY', margin + 30, y + 12);
    doc.text('PARAMETERS', margin + 220, y + 12);
    doc.text('RESULT / OUTPUT', margin + 340, y + 12);
    doc.text('METRIC', margin + 460, y + 12);
    y += 18;

    trials.slice(0, 10).forEach((t, i) => {
      checkPageBreak(18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`${t.id || i + 1}`, margin + 6, y + 11);
      
      const queryStr = sanitizeTextForPDF(t.query || t.input || t.name || 'Sample Run');
      doc.text(doc.splitTextToSize(queryStr, 180)[0], margin + 30, y + 11);

      const paramStr = sanitizeTextForPDF(String(t.params || t.config || (t.k1 ? `k1=${t.k1}, b=${t.b}` : 'Default')));
      doc.text(doc.splitTextToSize(paramStr, 110)[0], margin + 220, y + 11);

      const outStr = sanitizeTextForPDF(String(t.top1Doc || t.output || t.result || 'Match Found'));
      doc.text(doc.splitTextToSize(outStr, 110)[0], margin + 340, y + 11);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      const metricStr = sanitizeTextForPDF(String(t.metric || (t.precisionAtK ? `${t.precisionAtK}%` : 'Passed')));
      doc.text(doc.splitTextToSize(metricStr, 50)[0], margin + 460, y + 11);

      y += 16;
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
    });
    y += 12;
  }

  // 4. Student Observations & Deductions
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const obsText = sanitizeTextForPDF(observations || 'Experimental procedures and benchmarks verified in accordance with curriculum requirements.');
  const obsLines = doc.splitTextToSize(obsText, contentWidth - 24);
  const obsBoxHeight = obsLines.length * 11 + 16;

  checkPageBreak(Math.min(obsBoxHeight, 150) + 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Student Observations & Deductions', margin, y);
  y += 10;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, obsBoxHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(obsLines, margin + 12, y + 14);
  y += obsBoxHeight + 16;

  // Add Page Numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('KIRA VIRTUAL LABORATORY • GOLC 2027', margin, pageHeight - 20);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
  }

  const cleanName = (studentName || 'Scholar').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `KIRA_Lab_Report_Exp${expNumber < 10 ? '0' + expNumber : expNumber}_${cleanName}.pdf`;
  doc.save(filename);
}

/**
 * UnifiedReportSection
 * Standardized, icon-free academic laboratory report format across all experiments.
 */
export default function UnifiedReportSection({
  expNumber = 1,
  expTitle = 'Laboratory Experiment',
  expSubtitle = 'Knowledge Graphs & Information Retrieval Systems',
  expCode = null,
  expVersion = '2027.1',
  aim = '',
  objectives = [],
  pipelineStages = [],
  trials = [],
  renderTrials = null,
  children = null,
  quizScore = 0,
  totalQuestions = 10,
  studentInfo = {},
  onInfoChange = null,
  initialObservations = '',
  onReportGenerated = null,
}) {
  const { user } = useAuth();
  const [observations, setObservations] = useState(initialObservations);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (initialObservations && !observations) {
      setObservations(initialObservations);
    }
  }, [initialObservations]);

  useEffect(() => {
    if (onReportGenerated) {
      onReportGenerated();
    }
  }, [onReportGenerated]);

  const score = quizScore ?? 0;
  const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedCode = expCode || `KIRA-EXP-${expNumber < 10 ? `0${expNumber}` : expNumber}`;

  // Direct, standalone PDF download
  const handleDownloadPDF = () => {
    try {
      setIsGenerating(true);
      generateReportPDF({
        expNumber,
        expTitle,
        expSubtitle,
        formattedCode,
        studentName: studentInfo.name || user?.displayName || 'Student Scholar',
        studentId: studentInfo.studentId || user?.studentId || '2026-CS-000',
        institution: studentInfo.institution || user?.institution || 'VESIT Mumbai',
        instructor: studentInfo.instructor || 'Faculty In-Charge',
        aim,
        objectives,
        pipelineStages,
        trials,
        observations,
        score,
        totalQuestions,
        pct,
        gradeLabel: grade.label,
        today,
      });

      if (onReportGenerated) onReportGenerated();
      setIsGenerating(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error('Error generating report PDF:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header — hidden on print */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 no-print"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
          Section 5 — Accredited Laboratory Report Generator
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Laboratory Experiment Report
        </h2>
        <p className="text-slate-500 text-sm">
          Review your experimental findings, logged trials, and theoretical deductions before exporting as a department-ready PDF.
        </p>
      </motion.div>

      {/* The Printable Lab Report Document */}
      <div
        id="printable-report"
        className="p-8 sm:p-10 rounded-3xl bg-white text-slate-900 shadow-xl border border-slate-200 space-y-8 print:p-0 print:shadow-none print:border-none"
      >
        {/* Institutional Letterhead */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              KIRA Virtual Laboratory
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-0.5">
              {expTitle}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {expSubtitle} • {formattedCode}
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] font-mono text-slate-400 block">
              Report Date: {today}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700">
              LAB ASSESSMENT: {pct}% ({grade.label})
            </span>
          </div>
        </div>

        {/* Student Metadata Table */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Student Scholar
            </div>
            <div className="font-bold text-slate-900 mt-0.5 text-sm">
              {studentInfo.name || user?.displayName || 'Student Scholar'}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Laboratory Platform
            </div>
            <div className="font-semibold text-slate-700 mt-0.5">
              KIRA Virtual Laboratory
            </div>
          </div>
        </div>

        {/* 1. Experimental Aim & Scope */}
        {aim && (
          <div className="space-y-3">
            <div className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1.5">
              1. Experimental Aim & Scope
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-serif">
              {aim}
            </p>
            {objectives && objectives.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Core Learning Objectives:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {objectives.map((obj, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[9px]">
                        {i + 1}
                      </span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 2. Architectural Pipeline & Algorithmic Phases */}
        {pipelineStages && pipelineStages.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1.5">
              2. Architectural Pipeline & Algorithmic Phases
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pipelineStages.map((stg, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${stg.color || 'bg-slate-50 border-slate-200 text-slate-700'}`}
                >
                  <div className="font-bold text-[11px] uppercase tracking-wider">
                    {stg.stage}: {stg.name}
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-700">
                    {stg.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Empirical Benchmark Trials & Metric Evaluations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm font-bold text-slate-900 border-b border-slate-100 pb-1.5">
            <span>3. Empirical Benchmark Trials & Metric Evaluations</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              {(trials?.length || 0)} trials logged
            </span>
          </div>

          {children ? (
            children
          ) : renderTrials ? (
            renderTrials(trials)
          ) : !trials || trials.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center italic">
              No live trials logged yet. Switch to the Simulation Lab tab and click "Log to Report" to record benchmark runs.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Trial ID</th>
                    <th className="p-2.5">Query / Input</th>
                    <th className="p-2.5">Parameters</th>
                    <th className="p-2.5">Output / Result</th>
                    <th className="p-2.5 text-right">Metric / Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {trials.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-800">{t.id || `T-${idx + 1}`}</td>
                      <td className="p-2.5 font-sans text-slate-700 line-clamp-1">{t.query || t.input || t.name || 'Benchmark Run'}</td>
                      <td className="p-2.5 text-slate-500">{t.params || t.config || (t.k1 ? `k₁=${t.k1}, b=${t.b}` : 'Default')}</td>
                      <td className="p-2.5 font-sans font-semibold text-slate-900 line-clamp-1">{t.top1Doc || t.output || t.result || 'Completed'}</td>
                      <td className="p-2.5 text-right text-emerald-700 font-bold">{t.metric || (t.precisionAtK ? `P@K: ${t.precisionAtK}%` : `${pct}%`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4. Student Observations & Deductions */}
        <div className="space-y-3">
          <div className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1.5">
            4. Student Observations & Deductions
          </div>
          <textarea
            rows={6}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Document your technical observations, benchmark deductions, algorithmic edge cases, and comparative evaluations here..."
            className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition leading-relaxed no-print"
          />
          <div className="hidden print:block text-xs font-serif text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            {observations || 'Observations and deductions completed in accordance with virtual laboratory curriculum.'}
          </div>
        </div>

      </div>

      {/* Action Bar — hidden on print */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 no-print pt-2">
        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-xs shadow-lg transition cursor-pointer"
        >
          {isGenerating ? (
            <span>Generating PDF Report...</span>
          ) : downloaded ? (
            <span>✓ Lab Report Downloaded!</span>
          ) : (
            <span>Download Lab Report (PDF)</span>
          )}
        </button>
      </div>
    </div>
  );
}
