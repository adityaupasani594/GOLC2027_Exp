import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
import { CROSS_MODALITY_COMPARISON } from '../tokenizationEngine';
export { GRADE } from './CertificateSection';

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

const DEFAULT_OBSERVATIONS =
  '1. Text Preprocessing: Stop-word removal reduced raw token volume by 42–55%, eliminating non-discriminative syntax while preserving semantic keywords. Porter stemming condensed morphological variants into root tokens, compressing the effective vocabulary size in accordance with Heaps\' Law.\n\n' +
  '2. Visual ViT Patching: Choosing patch size P = 16×16 px on a 128×128 image yielded exactly 64 discrete visual tokens. Reducing patch size to P = 8×8 px increased spatial granularity quadrupling sequence length to 256 tokens, illustrating the direct trade-off between spatial resolution and inverted index posting size.\n\n' +
  '3. Acoustic Framing: Windowing continuous audio with Δt = 20ms produced 50 discrete frames per second of audio. Energy calculations highlighted active speech regions versus background silence.\n\n' +
  '4. Video Keyframe Sampling: Sampling every 3rd or 4th frame eliminated >66% temporal redundancy while preserving key temporal transitions, preventing index bloat.';

export default function ReportSection({
  studentInfo = {},
  onInfoChange,
  trials = [],
  quizScore = 0,
  totalQuestions = 10,
  onReportGenerated,
}) {
  return (
    <UnifiedReportSection
      expNumber={1}
      expTitle={EXP_INFO.title}
      expSubtitle={EXP_INFO.subtitle}
      expCode={EXP_INFO.code}
      expVersion={EXP_INFO.version}
      aim={EXP_INFO.aim}
      objectives={OBJECTIVES}
      pipelineStages={PIPELINE_STAGES}
      trials={trials}
      renderTrials={(trialList) => (
        <div className="space-y-4">
          {/* Cross-Modality Comparison Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Cross-Modality Discretization Summary
            </div>
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
                  {CROSS_MODALITY_COMPARISON.map((m) => (
                    <tr key={m.modality} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {m.modality}
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

          {/* Trials Table */}
          {!trialList || trialList.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center italic">
              No live trials logged yet. Switch to the Simulation Lab tab and record experimental runs.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Time</th>
                    <th className="py-2 px-3">Modality</th>
                    <th className="py-2 px-3">Input Source</th>
                    <th className="py-2 px-3 text-center">Token Count</th>
                    <th className="py-2 px-3">Config Settings</th>
                    <th className="py-2 px-3">Observed Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trialList.map((t, i) => (
                    <tr key={t.trialId || i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-indigo-600">{t.trialId || i + 1}</td>
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{t.time || '—'}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{t.modality}</td>
                      <td className="py-2 px-3 text-slate-600 max-w-[140px] truncate">{t.source}</td>
                      <td className="py-2 px-3 font-bold text-center text-slate-800 font-mono">{t.tokenCount}</td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">{t.config}</td>
                      <td className="py-2 px-3 text-slate-600 max-w-[220px] truncate text-[11px]">{t.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      quizScore={quizScore}
      totalQuestions={totalQuestions}
      studentInfo={studentInfo}
      onInfoChange={onInfoChange}
      initialObservations={DEFAULT_OBSERVATIONS}
      onReportGenerated={onReportGenerated}
    />
  );
}
