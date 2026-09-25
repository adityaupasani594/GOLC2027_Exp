import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, Download, Target, BarChart2, BookOpen, FlaskConical, CheckCircle2 } from 'lucide-react';
import { GRADE } from './CertificateSection';
import { QUIZ_QUESTIONS } from './QuizSection';
import { CROSS_MODALITY_COMPARISON } from '../tokenizationEngine';

const EXP_INFO = {
  title: 'Multimodal Tokenization for Information Retrieval',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  code: 'CS-KGIRS-01',
  version: '2027.1',
  aim: 'To design, implement, and analyze a multimodal tokenization pipeline capable of transforming continuous and unstructured multi-sensory signals (natural text, 2D images, 1D acoustic waveforms, and temporal video streams) into discrete token representations optimized for indexing and retrieval in Information Retrieval systems.',
};

const OBJECTIVES = [
  'Understand Information Retrieval as a unified process for indexing and retrieving knowledge across diverse modalities.',
  'Analyze linguistic preprocessing transformations on textual documents: case folding, regex tokenization, stop-word elimination, and Porter stemming.',
  'Formulate 2D image discretization into non-overlapping spatial patches (P × P) flattened into 1D vectors x_p ∈ R^(P²·C) following the Vision Transformer (ViT) paradigm.',
  'Implement continuous acoustic waveform discretization via fixed-duration temporal framing (Δt ms) with Hamming windowing and root-mean-square (RMS) energy extraction.',
  'Evaluate video stream tokenization through uniform temporal sampling and keyframe extraction, quantifying temporal redundancy reduction (>66%).',
  'Compare token sequence lengths, memory footprints, and indexing trade-offs across all 4 modalities in a unified cross-modality matrix.',
];

const PIPELINE_STAGES = [
  {
    stage: 'Stage 1',
    name: 'Text: Linguistic Discretization',
    desc: 'Normalizes raw strings, strips punctuation, eliminates high-frequency functional stop words, and applies suffix stripping via Porter Stemming to map inflectional variants to canonical lexical stems.',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  {
    stage: 'Stage 2',
    name: 'Image: 2D Spatial Patching',
    desc: 'Partitions 2D pixel matrices x ∈ R^(H×W×C) into N = (HW)/P² non-overlapping patches of size P×P, flattening each patch into a 1D vector x_p ∈ R^(P²·C) for discrete inverted visual indexing.',
    color: 'bg-violet-50 border-violet-200 text-violet-700',
  },
  {
    stage: 'Stage 3',
    name: 'Audio: Temporal Window Framing',
    desc: 'Slices continuous 1D acoustic waveforms into discrete time slices of duration Δt (typically 20–25ms) with 50% overlap, computing RMS energy and spectral coefficients per acoustic token.',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    stage: 'Stage 4',
    name: 'Video: Temporal Keyframe Extraction',
    desc: 'Subsamples continuous 30fps video streams by dynamic stride k, discarding inter-frame pixel redundancy while preserving salient chronological events as discrete visual keyframe tokens.',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
  },
];

export default function ReportSection({
  studentInfo = {},
  onInfoChange,
  trials = [],
  quizScore = 10,
  totalQuestions = 10,
  onReportGenerated,
}) {
  const [observations, setObservations] = useState(
    '1. Text Preprocessing: Stop-word removal reduced raw token volume by 42–55%, eliminating non-discriminative syntax while preserving semantic keywords. Porter stemming condensed morphological variants into root tokens, compressing the effective vocabulary size in accordance with Heaps\' Law.\n\n' +
    '2. Visual ViT Patching: Choosing patch size P = 16×16 px on a 128×128 image yielded exactly 64 discrete visual tokens. Reducing patch size to P = 8×8 px increased spatial granularity quadrupling sequence length to 256 tokens, illustrating the direct trade-off between spatial resolution and inverted index posting size.\n\n' +
    '3. Acoustic Framing: Windowing continuous audio with Δt = 20ms produced 50 discrete frames per second of audio. Energy calculations highlighted active speech regions versus background silence.\n\n' +
    '4. Video Keyframe Sampling: Sampling every 3rd or 4th frame eliminated >66% temporal redundancy while preserving key temporal transitions, preventing index bloat.'
  );

  const score = quizScore ?? 0;
  const pct   = Math.round((score / totalQuestions) * 100);
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (onReportGenerated) {
      onReportGenerated();
    }
  }, [onReportGenerated]);

  const handlePrintReport = () => {
    if (onReportGenerated) onReportGenerated();
    document.body.classList.add('print-report');
    window.onafterprint = () => {
      document.body.classList.remove('print-report');
      window.onafterprint = null;
    };
    window.print();
  };

  const handleDownloadJSON = () => {
    if (onReportGenerated) onReportGenerated();
    const data = {
      experiment: EXP_INFO.title,
      code:       EXP_INFO.code,
      version:    EXP_INFO.version,
      date:       today,
      student: {
        name:        studentInfo.name        || 'N/A',
        studentId:   studentInfo.studentId   || 'N/A',
        institution: studentInfo.institution || 'N/A',
        instructor:  studentInfo.instructor  || 'N/A',
      },
      quiz: { score, total: totalQuestions, percentage: pct, grade: grade.label },
      trials: trials || [],
      studentObservations: observations,
      conclusion: 'Multimodal tokenization pipeline successfully discretized text, image, audio, and video inputs into discrete token streams suitable for unified information retrieval and inverted indexing.',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Multimodal_Tokenization_Lab_Report_${(studentInfo.name || 'student').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!trials || trials.length === 0) return;
    const headers = ['Trial #', 'Date', 'Time', 'Modality', 'Source', 'Token Count', 'Config', 'Observed Outcome'];
    const rows = trials.map(t => [
      t.trialId,
      t.date || today,
      t.time || '',
      t.modality,
      `"${(t.source || '').replace(/"/g, '""')}"`,
      t.tokenCount,
      `"${(t.config || '').replace(/"/g, '""')}"`,
      `"${(t.detail || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'multimodal_tokenization_trials.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header — hidden on print */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 no-print">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />
          Section 5 — Lab Report
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Experiment Lab Report</h2>
        <p className="text-slate-500 text-sm">Full pipeline analysis, multimodal trials, assessment performance, and conclusions.</p>
      </motion.div>

      {/* Action buttons — hidden on print */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap justify-end gap-2 no-print">
        {trials.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-sm cursor-pointer transition"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={handlePrintReport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 text-white text-sm font-semibold shadow cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print PDF
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={handleDownloadJSON}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-teal-200 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export JSON
        </motion.button>
      </motion.div>

      {/* ── All printable report content ── */}
      <div className="report-content space-y-6">

        {/* Report metadata card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="glass rounded-2xl border border-white/80 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Laboratory Experiment Report</p>
            <p className="font-bold text-lg">{EXP_INFO.title}</p>
            <p className="text-slate-400 text-xs mt-0.5">{EXP_INFO.subtitle} &bull; {EXP_INFO.code}</p>
          </div>
          <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {[
              { label: 'Student',     value: studentInfo.name        || '—' },
              { label: 'Student ID',  value: studentInfo.studentId   || '—' },
              { label: 'Institution', value: studentInfo.institution || '—' },
              { label: 'Date',        value: today },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</p>
                <p className="font-semibold text-slate-800">{f.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 1 — Aim & Objectives */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 text-sm">1. Aim &amp; Objectives</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed"><span className="font-semibold">Aim:</span> {EXP_INFO.aim}</p>
          <ul className="space-y-1.5 text-sm text-slate-600">
            {OBJECTIVES.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold shrink-0">{i + 1}.</span>{obj}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Section 2 — Multimodal Tokenization Pipeline Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-4 h-4 text-violet-500" />
            <h3 className="font-semibold text-slate-800 text-sm">2. Multimodal Tokenization Pipeline Architecture</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PIPELINE_STAGES.map((s, i) => (
              <div key={i} className={`rounded-xl p-4 border text-xs ${s.color}`}>
                <p className="font-bold uppercase tracking-wide mb-1">{s.stage} — {s.name}</p>
                <p className="text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Cross-Modality Comparison Table */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Cross-Modality Discretization Summary</p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <th className="py-2.5 px-3">Modality</th>
                    <th className="py-2.5 px-3">Raw Signal</th>
                    <th className="py-2.5 px-3">Atomic Token</th>
                    <th className="py-2.5 px-3">Dimension</th>
                    <th className="py-2.5 px-3">Control Param</th>
                    <th className="py-2.5 px-3">Index Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CROSS_MODALITY_COMPARISON.map(m => (
                    <tr key={m.modality} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{m.icon}</span> {m.modality}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{m.rawSignal}</td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-700">{m.tokenUnit}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{m.dimensions}</td>
                      <td className="py-2.5 px-3 text-slate-600">{m.controlParam}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-teal-700">{m.indexRepresentation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Section 3 — Recorded Experimental Trials */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="glass rounded-2xl overflow-hidden border border-white/80 shadow-sm"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-500" />
              <h3 className="font-semibold text-slate-800 text-sm">3. Recorded Experimental Trials</h3>
            </div>
            {trials && trials.length > 0 && (
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                {trials.length} logged
              </span>
            )}
          </div>
          {(!trials || trials.length === 0) ? (
            <div className="px-6 py-6 text-xs text-slate-400 italic">
              No trials recorded yet. Visit the Simulation Lab and click &ldquo;Record Current Trial&rdquo; to add experimental runs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    {['#', 'Time', 'Modality', 'Input Source', 'Token Count', 'Config Settings', 'Observed Outcome'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {trials.map((t, i) => (
                    <tr key={t.trialId || i} className={i % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/30'}>
                      <td className="py-3 px-4 font-bold text-indigo-600 text-center">{t.trialId || i + 1}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{t.time || '—'}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{t.modality}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-[140px] truncate">{t.source}</td>
                      <td className="py-3 px-4 font-bold text-center text-slate-800 font-mono">{t.tokenCount}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{t.config}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-[220px] truncate text-[11px]">{t.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Section 4 — Discussion & Conclusions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 text-sm">4. Discussion &amp; Inferences</h3>
          </div>
          <div className="text-sm text-slate-600 leading-relaxed space-y-3">
            <p>
              Information Retrieval systems cannot directly operate on raw high-dimensional continuous continuous signals (such as 2D pixel grids or 1D audio acoustic waves) without discretization. Tokenization serves as the foundational abstraction layer that maps raw perceptual inputs into finite, discrete vocabularies indexed in inverted posting lists or vector index indices.
            </p>
            <p>
              In text IR, linguistic normalization (lowercasing, punctuation stripping) unifies lexical variants. Stop-word removal filters non-informative grammatical noise, directly reducing posting list lengths by 40–55%. Porter stemming further coalesces inflected wordforms into canonical morphological stems, significantly shrinking unique vocabulary size |V| in adherence to Heaps&apos; Law.
            </p>
            <p>
              For computer vision and audio, continuous signals lack explicit word delimiters. The Vision Transformer (ViT) patch extraction method partitions 2D images into non-overlapping spatial tokens x_p ∈ R^(P²·C). Smaller patch sizes (e.g. 8×8 px) preserve fine visual textures at the expense of a 4× surge in token count and quadratic attention complexity. Similarly, temporal windowing (Δt = 20ms) creates acoustic frames for audio, while keyframe sampling eliminates inter-frame redundancy in video streams by &gt;66%.
            </p>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Student Experimental Observations &amp; Notes
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={5}
              className="w-full p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 no-print"
            />
            <div className="hidden print:block p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {observations}
            </div>
          </div>
        </motion.div>

        {/* Section 5 — Assessment Performance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="glass rounded-2xl p-6 border border-white/80 shadow-sm space-y-3"
        >
          <h3 className="font-semibold text-slate-800 text-sm">5. Assessment Performance</h3>
          <div className="flex items-center gap-5">
            <div className={`border-2 rounded-2xl px-6 py-4 text-center min-w-[5.5rem] ${grade.bg}`}>
              <p className={`text-4xl font-black ${grade.color}`}>{grade.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{score}/{totalQuestions}</p>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Quiz Score</span>
                <span className="font-mono font-semibold text-slate-800">{score}/{totalQuestions} ({pct}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                  className={`h-full rounded-full bg-gradient-to-r ${grade.gradient}`}
                />
              </div>
              <p className="text-xs text-slate-400">
                {pct >= 70
                  ? '✓ Satisfactory understanding of Multimodal Tokenization across text, image patches, audio frames, and video keyframes demonstrated.'
                  : 'Review theory sections and interactive tokenization animations to reinforce multimodal IR concepts.'}
              </p>
              {/* Per-question breakdown */}
              <div className="flex gap-1 pt-1">
                {QUIZ_QUESTIONS.map((qq, i) => (
                  <div
                    key={qq.id}
                    title={`Q${i + 1}`}
                    className={`flex-1 h-2 rounded-full ${i < score ? 'bg-emerald-400' : 'bg-red-300'}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-400">{score} correct · {totalQuestions - score} incorrect</p>
            </div>
          </div>
        </motion.div>

        {/* Signatures & Verification */}
        <div className="pt-6 border-t border-slate-200 grid sm:grid-cols-2 gap-8 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Evaluated By</span>
            <div className="font-bold text-slate-800">{studentInfo.instructor || 'Dr. Sharmila Sengupta / Mrs. Abha Tewari'}</div>
            <div className="text-[11px] text-slate-500">{studentInfo.institution || 'Dept. of Computer Engineering, VESIT'}</div>
          </div>
          <div className="space-y-1 sm:text-right">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Student Signature</span>
            <div className="font-serif italic text-base text-indigo-900">{studentInfo.name || 'Student Scholar'}</div>
            <div className="text-[10px] font-mono text-slate-400">Date: {today} &bull; ID: {studentInfo.studentId || '—'}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
