import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, ArrowRight,
  Layers, Sliders, ExternalLink, HelpCircle
} from 'lucide-react';
import { CROSS_MODALITY_COMPARISON } from '../tokenizationEngine';

export default function TheorySection({ onGoToLab }) {
  const objectives = [
    'Understand why continuous analog signals (pixels, audio waveforms, video frames) cannot be directly searched without discrete tokenization.',
    'Formulate lexical text tokenization pipelines, punctuation stripping, and stop-word filtering using inverted index mappings.',
    'Analyze 2D spatial grid partitioning in Vision Transformers (ViT) to extract fixed-size visual patch tokens (P × P).',
    'Compare temporal window segmentation in audio signals (STFT frames) and stride-based keyframe downsampling in video streams.'
  ];

  const procedureSteps = [
    'Step 1: Review the theoretical rationale for discrete tokenization across text, image, audio, and video modalities.',
    'Step 2: Navigate to the Simulation Lab tab in the experiment navigation bar.',
    'Step 3: Select a media modality tab (Text, Image, Audio, or Video) and configure resolution and windowing parameters.',
    'Step 4: Execute real-time token extraction and inspect token counts, compression ratios, and visual bounding boxes.',
    'Step 5: Compare cross-modality tokenization metrics and analyze trade-offs between vocabulary size and perceptual loss.',
    'Step 6: Log experimental parameter trials into your session laboratory notebook.',
    'Step 7: Complete the concept assessment Quiz, review detailed pedagogical feedback, and generate your verified certificate and lab report.'
  ];

  const keyTerms = [
    { term: 'Multimodal IR', def: 'Information Retrieval systems capable of indexing, searching, and cross-matching across heterogeneous data types (text, images, audio, video) in a unified representation space.' },
    { term: 'Token', def: 'The fundamental discrete atomic unit produced by partitioning continuous raw data streams for lexicon indexing and vectorization.' },
    { term: 'Visual Patch Token', def: 'A square 2D sub-region of an image (e.g. 16×16 px) flattened and linearly projected into a vector token in Vision Transformer (ViT) architectures.' },
    { term: 'Temporal Acoustic Frame', def: 'A short, uniform time slice (e.g., 20ms window) of an audio pressure waveform used to compute spectral frequency coefficients.' },
    { term: 'Keyframe Sampling', def: 'The systematic extraction of salient or periodic video frames across the time axis, eliminating temporal redundancy.' },
    { term: 'Vocabulary (V)', def: 'The finite set of all distinct token signatures indexed within a retrieval collection.' },
    { term: 'Loss Tolerance', def: 'The degree to which subtle fidelity reductions in high-frequency signals (e.g. image pixel noise) can be discarded without harming semantic matching.' }
  ];

  const references = [
    {
      authors: 'Dosovitskiy, A., Beyer, L., Kolesnikov, A., et al. (2020)',
      title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale',
      details: 'ICLR 2021. Introduced visual patch tokenization for Vision Transformers (ViT).',
      url: 'https://arxiv.org/abs/2010.11929'
    },
    {
      authors: 'Manning, C. D., Raghavan, P., & Schütze, H. (2008)',
      title: 'Introduction to Information Retrieval',
      details: 'Cambridge University Press. Chapter 2: The term vocabulary and postings lists.',
      url: 'https://nlp.stanford.edu/IR-book/'
    },
    {
      authors: 'Rabiner, L. R., & Schafer, R. W. (2010)',
      title: 'Theory and Applications of Digital Speech Processing',
      details: 'Pearson. Foundations of short-time acoustic framing and windowing functions.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800">
      {/* ── 1. Hero Banner ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm relative overflow-hidden space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 text-xs font-bold tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
          Experiment 1 &bull; Foundations of Information Retrieval
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Multimodal Tokenization for Information Retrieval
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          Computers cannot directly search continuous sensory media. To index text, photos, audio clips, and videos within a unified search engine, raw signals must first be partitioned into discrete, atomic units called <strong className="text-teal-700 font-semibold">Tokens</strong>.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToLab}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-200 cursor-pointer transition active:scale-95"
          >
            Launch Simulation Lab <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. Learning Objectives ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Learning Objectives
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {objectives.map((obj, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{obj}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Foundational Theoretical Framework ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Foundational Theoretical Framework
        </h2>

        {/* Problem vs Solution Split */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">The Problem</span>
            <h3 className="text-base font-bold text-slate-900">Why Can't We Match Raw Files Directly?</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A single altered pixel in an image, background microphone noise in audio, or minor typo in text completely alters raw digital hash digests. Without tokenization, search engines cannot perform partial matches, keyword lookups, or localized semantic retrieval.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 shadow-2xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">The Solution</span>
            <h3 className="text-base font-bold text-slate-900">The Universal Token Abstraction</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tokenization partitions continuous signals into structured sequences. Once converted, text words, visual image patches, audio frames, and video keyframes share the exact same inverted index and vector search infrastructure.
            </p>
          </div>
        </div>

        {/* 5 Modality Pipeline Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tokenization Across Continuous Media Modalities
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                title: 'Text Modality',
                badge: '1D Discrete',
                desc: 'Whitespace and regex boundary detection partition strings into words or subword tokens (Byte-Pair Encoding). Stop words are removed to prune index size.',
                color: 'text-blue-700 bg-blue-50 border-blue-200'
              },
              {
                title: 'Image Modality',
                badge: '2D Spatial Grid',
                desc: 'Vision Transformers (ViT) partition 2D images into fixed non-overlapping patches (e.g. 16×16 pixels). Each patch is flattened into a visual token vector.',
                color: 'text-purple-700 bg-purple-50 border-purple-200'
              },
              {
                title: 'Audio Modality',
                badge: '1D Continuous Time',
                desc: 'Continuous pressure waveforms are segmented into uniform short-time acoustic windows (e.g. 20ms frames) to compute localized frequency coefficients.',
                color: 'text-teal-700 bg-teal-50 border-teal-200'
              },
              {
                title: 'Video Modality',
                badge: '3D Spatiotemporal',
                desc: 'High temporal correlation between consecutive video frames allows stride-based keyframe sampling, dropping redundant frames while preserving narrative events.',
                color: 'text-amber-700 bg-amber-50 border-amber-200'
              },
            ].map((m, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">{m.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.color}`}>
                    {m.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Technical Comparison Matrix ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Cross-Modality Technical Comparison Matrix
        </h2>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Modality</th>
                <th className="p-2.5">Raw Signal Type</th>
                <th className="p-2.5">Discrete Token Unit</th>
                <th className="p-2.5">Control Parameter</th>
                <th className="p-2.5">Search Index Structure</th>
                <th className="p-2.5">Concrete Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {CROSS_MODALITY_COMPARISON.map(r => (
                <tr key={r.modality} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{r.icon}</span>
                    <span>{r.modality}</span>
                  </td>
                  <td className="p-2.5 text-slate-700">{r.rawSignal}</td>
                  <td className="p-2.5 font-semibold text-teal-800 bg-teal-50/40">{r.tokenUnit}</td>
                  <td className="p-2.5 text-slate-600">{r.controlParam}</td>
                  <td className="p-2.5 font-mono text-[11px] text-indigo-700">{r.indexRepresentation}</td>
                  <td className="p-2.5 text-slate-500 text-[11px]">{r.granularityExample}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Laboratory Procedure ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Laboratory Procedure
        </h2>
        <div className="space-y-2.5 pt-1">
          {procedureSteps.map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Key Terminology & Definitions ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Key Terminology &amp; Definitions
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {keyTerms.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-teal-900">{item.term}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.def}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. References & Further Reading ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          References &amp; Further Reading
        </h2>
        <div className="space-y-3 pt-1">
          {references.map((ref, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <div className="text-xs sm:text-sm font-semibold text-slate-800">
                {ref.authors} &mdash; <span className="font-bold text-teal-700">{ref.title}</span>
              </div>
              <div className="text-xs text-slate-500 italic">{ref.details}</div>
              {ref.url && (
                <div className="text-[11px] text-blue-600 font-mono pt-0.5">
                  <a href={ref.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                    {ref.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
