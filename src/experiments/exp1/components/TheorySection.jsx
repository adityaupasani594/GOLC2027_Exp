import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Sparkles, Layers, Sliders, Play, CheckCircle2,
  FileText, Image as ImageIcon, Music, Video, ArrowRight,
  HelpCircle, ChevronRight, Hash, Eye, Database, Info
} from 'lucide-react';
import {
  tokenizeText,
  generateSyntheticImageCanvas,
  extractImagePatches,
  generateSyntheticAudioWaveform,
  segmentAudioFrames,
  generateSyntheticVideoFrames,
  sampleVideoKeyframes,
  CROSS_MODALITY_COMPARISON,
} from '../tokenizationEngine';

export default function TheorySection({ onGoToLab }) {
  // Playground states
  const [textInput, setTextInput] = useState(
    'Multimodal Information Retrieval indexes Text, Visual Patches, Audio Frames, and Video Clips.'
  );
  const [imagePatchSize, setImagePatchSize] = useState(16);
  const [audioFrameMs, setAudioFrameMs] = useState(20);
  const [videoInterval, setVideoInterval] = useState(3);
  const [activePlaygroundTab, setActivePlaygroundTab] = useState('text');

  // Canvas ref for image playground
  const canvasRef = useRef(null);
  const [patchData, setPatchData] = useState(null);

  // Audio waveform synthesis
  const [audioData, setAudioData] = useState(() => {
    const wave = generateSyntheticAudioWaveform(1.0, 16000);
    const segmented = segmentAudioFrames(wave.samples, wave.sampleRate, 20);
    return { wave, segmented };
  });

  // Video frames synthesis
  const [videoData, setVideoData] = useState(() => {
    const frames = generateSyntheticVideoFrames(12);
    const sampled = sampleVideoKeyframes(frames, 3);
    return { frames, sampled };
  });

  // Re-run image patch extraction when patch size changes
  useEffect(() => {
    const synthCanvas = generateSyntheticImageCanvas(128);
    const extracted = extractImagePatches(synthCanvas, imagePatchSize);
    setPatchData(extracted);
  }, [imagePatchSize]);

  // Re-run audio segmentation when frame duration changes
  useEffect(() => {
    const wave = generateSyntheticAudioWaveform(1.0, 16000);
    const segmented = segmentAudioFrames(wave.samples, wave.sampleRate, audioFrameMs);
    setAudioData({ wave, segmented });
  }, [audioFrameMs]);

  // Re-run video keyframe sampling when interval changes
  useEffect(() => {
    const frames = generateSyntheticVideoFrames(12);
    const sampled = sampleVideoKeyframes(frames, videoInterval);
    setVideoData({ frames, sampled });
  }, [videoInterval]);

  const textTokens = tokenizeText(textInput);
  const uniqueTextTokens = new Set(textTokens.map(t => t.toLowerCase())).size;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      
      {/* ── 1. Hero / Purpose Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Experiment 01 — IR Foundations
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Multimodal Tokenization <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-indigo-200 to-violet-300">
              for Information Retrieval
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
            Computers cannot directly search continuous sensory media. To index text, photos, audio clips,
            and videos within a unified search engine, raw signals must first be partitioned into discrete,
            atomic units called <strong className="text-teal-300">Tokens</strong>.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <button
              onClick={onGoToLab}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Launch Simulation Lab
            </button>
            <div className="text-xs text-slate-400">
              Department of Computer Engineering &bull; VESIT
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2. The Core Problem & Classroom Hook ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600">The Problem</div>
          <h3 className="text-xl font-bold text-slate-900">Why Can't We Match Raw Files Directly?</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            A single pixel change in an image, acoustic background noise in audio, or slight wording changes
            in text completely alters raw digital files. Without tokenization, search engines cannot perform
            partial matches, keyword lookups, or localized semantic retrieval.
          </p>
          <ul className="text-xs text-slate-500 space-y-2 pt-1">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">&times;</span>
              Raw RGB pixels cannot be directly queried by text descriptors.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">&times;</span>
              Continuous waveforms have no natural word boundaries.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">&times;</span>
              Video streams suffer massive temporal redundancy between consecutive frames.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-teal-50 via-indigo-50/30 to-purple-50 border border-teal-200 shadow-sm space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-700">The Solution</div>
          <h3 className="text-xl font-bold text-slate-900">The Universal Token Abstraction</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Tokenization partitions continuous signals into structured sequences. Once converted, text words,
            visual image patches, audio frames, and video keyframes share the exact same inverted index and
            vector search infrastructure.
          </p>
          <ul className="text-xs text-teal-800 space-y-2 pt-1 font-medium">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <strong>Universal Currency:</strong> All modalities become discrete searchable token units.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <strong>Unified Indexing:</strong> Connects to BM25, Inverted Indexes, and Vector Databases.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <strong>Foundations of Modern AI:</strong> Identical concept used by Vision Transformers (ViT) and Whisper.
            </li>
          </ul>
        </div>
      </div>

      {/* ── 3. Cross-Modality Comparison Matrix ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Cross-Modal Synthesis</div>
            <h2 className="text-2xl font-bold text-slate-900">Cross-Modality Tokenization Comparison Matrix</h2>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            4 Heterogeneous Signal Types
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CROSS_MODALITY_COMPARISON.map((m) => (
            <motion.div
              key={m.modality}
              whileHover={{ y: -3 }}
              className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{m.icon}</span>
                  <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {m.modality}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{m.tokenUnit}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{m.dimensions}</p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-700">Raw Signal:</span> {m.rawSignal}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Control:</span> {m.controlParam}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Index Target:</span> {m.indexRepresentation}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-indigo-600 font-medium">
                &bull; {m.granularityExample}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 4. Interactive Live Playground (Synthetic Demos) ── */}
      <div className="space-y-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-teal-600">Hands-on Concept Verification</div>
          <h2 className="text-2xl font-bold text-slate-900">Interactive Modality Tokenizer Playground</h2>
          <p className="text-sm text-slate-500">
            Experiment with granularity parameters across all four modalities in real time right here.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          {[
            { id: 'text', label: '1. Text Tokenization', icon: FileText, color: 'text-blue-600' },
            { id: 'image', label: '2. Image Patches (ViT)', icon: ImageIcon, color: 'text-purple-600' },
            { id: 'audio', label: '3. Audio Frames', icon: Music, color: 'text-teal-600' },
            { id: 'video', label: '4. Video Keyframes', icon: Video, color: 'text-amber-600' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activePlaygroundTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePlaygroundTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Playground Content Cards */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm min-h-[380px]">
          <AnimatePresence mode="wait">

            {/* ─── TAB 1: TEXT PLAYGROUND ─── */}
            {activePlaygroundTab === 'text' && (
              <motion.div
                key="text-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Linguistic Tokenization (1D Sequence)</h3>
                    <p className="text-xs text-slate-500">
                      Splits continuous character strings into individual word tokens for inverted index postings.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <div className="text-xl font-mono font-bold text-indigo-600">{textTokens.length}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">Total Tokens</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-mono font-bold text-teal-600">{uniqueTextTokens}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">Unique Vocabulary</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Input Sentence / Query:
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Extracted Discrete Token Stream:
                  </div>
                  <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200 max-h-48 overflow-y-auto">
                    {textTokens.map((tok, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-mono text-xs font-semibold shadow-xs"
                      >
                        <span className="text-[10px] text-indigo-500">#{i + 1}</span>
                        {tok}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── TAB 2: IMAGE PLAYGROUND ─── */}
            {activePlaygroundTab === 'image' && (
              <motion.div
                key="image-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Vision Transformer (ViT) Visual Patch Tokenization
                    </h3>
                    <p className="text-xs text-slate-500">
                      Divides a 2D continuous pixel array into a spatial grid of non-overlapping P &times; P patches.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Patch Size (P):</span>
                    {[8, 16, 32].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setImagePatchSize(sz)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          imagePatchSize === sz
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {sz} &times; {sz} px
                      </button>
                    ))}
                  </div>
                </div>

                {patchData && (
                  <div className="grid md:grid-cols-3 gap-6 items-start">
                    {/* Raw & Grid view */}
                    <div className="rounded-xl p-4 bg-slate-900 text-white space-y-3">
                      <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                        128 &times; 128 px Synthetic Scene
                      </div>
                      <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden border border-slate-700">
                        {/* We recreate the background image with grid overlay */}
                        <div
                          className="w-full h-full relative"
                          style={{
                            backgroundImage: `
                              linear-gradient(to right, rgba(45, 212, 191, 0.4) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(45, 212, 191, 0.4) 1px, transparent 1px),
                              linear-gradient(135deg, #1e3a8a 0%, #059669 60%, #0f172a 100%)
                            `,
                            backgroundSize: `${imagePatchSize * (192 / 128)}px ${imagePatchSize * (192 / 128)}px, ${imagePatchSize * (192 / 128)}px ${imagePatchSize * (192 / 128)}px, 100% 100%`,
                          }}
                        >
                          <div className="absolute top-4 left-16 w-8 h-8 rounded-full bg-amber-400 border border-amber-200 shadow-md" />
                          <div className="absolute bottom-2 left-4 w-12 h-12 rounded-full bg-pink-500 opacity-90" />
                        </div>
                      </div>
                      <div className="text-center text-xs text-slate-400">
                        Grid: {patchData.rows} rows &times; {patchData.cols} cols ={' '}
                        <strong className="text-teal-300">{patchData.totalPatches} Patches</strong>
                      </div>
                    </div>

                    {/* Patch Stream */}
                    <div className="md:col-span-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                          Flattened 1D Visual Token Stream (First 16 of {patchData.totalPatches})
                        </div>
                        <span className="text-[11px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 font-semibold">
                          N = (H&times;W) / P&sup2; = {patchData.totalPatches}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-56 overflow-y-auto">
                        {patchData.patches.slice(0, 24).map((p) => (
                          <div
                            key={p.id}
                            className="flex flex-col items-center p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-center"
                          >
                            <img src={p.dataUrl} alt={`Patch ${p.id}`} className="w-8 h-8 object-cover rounded" />
                            <span className="text-[10px] font-mono text-slate-500 mt-1 font-semibold">T{p.id}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-900 leading-relaxed">
                        <strong>ViT Mathematical Formulation:</strong> An input image <span className="font-mono">x &isin; &Ropf;<sup>H&times;W&times;C</sup></span> is transformed into a sequence of flattened patches <span className="font-mono">x<sub>p</sub> &isin; &Ropf;<sup>N&times;(P&sup2;&middot;C)</sup></span>, where each patch acts as an atomic token.
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── TAB 3: AUDIO PLAYGROUND ─── */}
            {activePlaygroundTab === 'audio' && (
              <motion.div
                key="audio-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Continuous Acoustic Waveform Temporal Framing
                    </h3>
                    <p className="text-xs text-slate-500">
                      Continuous pressure waves are segmented into short time windows (&Delta;t ms) for spectrogram tokens.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Window (&Delta;t):</span>
                    {[10, 20, 40].map((ms) => (
                      <button
                        key={ms}
                        onClick={() => setAudioFrameMs(ms)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          audioFrameMs === ms
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {ms} ms
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-start">
                  <div className="md:col-span-2 rounded-xl p-4 bg-slate-900 text-white space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-teal-400 uppercase tracking-wider">
                        1.0s Synthesized Waveform (16 kHz) & Frame Windows
                      </span>
                      <span className="text-amber-400 font-mono font-semibold">
                        {audioData.segmented.completeFrameCount} Frame Tokens
                      </span>
                    </div>

                    {/* Interactive SVG waveform representation */}
                    <div className="w-full h-36 relative bg-slate-950 rounded-lg p-2 overflow-hidden border border-slate-800">
                      <svg viewBox="0 0 500 100" className="w-full h-full" preserveAspectRatio="none">
                        {/* Horizontal zero line */}
                        <line x1="0" y1="50" x2="500" y2="50" stroke="#334155" strokeWidth="1" />
                        {/* Frame window boundary vertical lines */}
                        {Array.from({ length: Math.min(25, audioData.segmented.completeFrameCount) }).map((_, i) => {
                          const x = (i / Math.min(25, audioData.segmented.completeFrameCount)) * 500;
                          return (
                            <line
                              key={i}
                              x1={x}
                              y1="0"
                              x2={x}
                              y2="100"
                              stroke="#f59e0b"
                              strokeWidth="0.8"
                              strokeDasharray="2 2"
                              opacity="0.6"
                            />
                          );
                        })}
                        {/* Waveform curve */}
                        <path
                          d={`M 0 50 ` + Array.from({ length: 100 }).map((_, i) => {
                            const x = i * 5;
                            const t = i / 100;
                            const y = 50 - 38 * Math.sin(2 * Math.PI * 5 * t) * Math.exp(-1.5 * t);
                            return `L ${x} ${y.toFixed(1)}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#2dd4bf"
                          strokeWidth="1.8"
                        />
                      </svg>
                    </div>

                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>0.000 s</span>
                      <span className="text-amber-400 font-medium">Dashed lines: {audioFrameMs}ms frame boundaries</span>
                      <span>1.000 s</span>
                    </div>
                  </div>

                  {/* Frame Tokens Table */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Sample Temporal Tokens
                    </div>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto">
                      {audioData.segmented.tokens.slice(0, 6).map((tok) => (
                        <div
                          key={tok.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono"
                        >
                          <span className="font-bold text-teal-600">Token #{tok.id}</span>
                          <span className="text-slate-500">[{tok.startSec}s - {tok.endSec}s]</span>
                          <span className="text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {tok.durationMs}ms
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── TAB 4: VIDEO PLAYGROUND ─── */}
            {activePlaygroundTab === 'video' && (
              <motion.div
                key="video-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Spatiotemporal Video Keyframe Tokenization
                    </h3>
                    <p className="text-xs text-slate-500">
                      Eliminates temporal redundancy by sampling visual keyframes along the video timeline.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Sample Interval (N):</span>
                    {[2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setVideoInterval(n)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          videoInterval === n
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Every {n} frames
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wide">
                      1. Continuous Video Stream (12 Frames) &mdash; Highlighted = Sampled Keyframe Tokens
                    </span>
                    <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold">
                      {videoData.sampled.sampledTokensCount} Tokens ({videoData.sampled.reductionRatio}% Redundancy Reduction)
                    </span>
                  </div>

                  {/* Ribbon of all frames */}
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800">
                    {videoData.frames.map((frm, idx) => {
                      const isSampled = (idx + 1) % videoInterval === 0;
                      return (
                        <div
                          key={frm.frameIndex}
                          className={`relative rounded-lg overflow-hidden border-2 transition ${
                            isSampled ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-800 opacity-40'
                          }`}
                        >
                          <img src={frm.dataUrl} alt={`Frame ${frm.frameIndex}`} className="w-full h-12 object-cover" />
                          <div
                            className={`text-[9px] font-mono text-center py-0.5 ${
                              isSampled ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400'
                            }`}
                          >
                            F#{frm.frameIndex}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    2. Resulting Video Token Sequence
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {videoData.sampled.sampledTokens.map((tok) => (
                      <div
                        key={tok.tokenId}
                        className="rounded-xl p-3 bg-amber-50/50 border border-amber-200 flex items-center gap-3 shadow-2xs"
                      >
                        <img src={tok.dataUrl} alt={`Token ${tok.tokenId}`} className="w-12 h-12 object-cover rounded-lg border border-amber-300" />
                        <div className="text-xs">
                          <div className="font-bold text-amber-900">Token #{tok.tokenId}</div>
                          <div className="text-slate-600 text-[11px]">Frame #{tok.sourceFrameIndex}</div>
                          <div className="text-slate-500 text-[10px] font-mono">{tok.timestampSec}s</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ── 5. Five Pipeline Stages ── */}
      <div className="space-y-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Architectural Flow</div>
          <h2 className="text-2xl font-bold text-slate-900">Multimodal Tokenization Pipeline Architecture</h2>
        </div>

        <div className="grid sm:grid-cols-5 gap-3">
          {[
            { step: '01', title: 'Input Acquisition', desc: 'Accept text string, image bitmap, audio PCM, or video file stream.' },
            { step: '02', title: 'Modality ID', desc: 'Identify format & structural dimensions (1D, 2D spatial, 3D spatiotemporal).' },
            { step: '03', title: 'Unit Partitioning', desc: 'Split words, P×P visual patches, Δt acoustic frames, or keyframes.' },
            { step: '04', title: 'Token Vectorization', desc: 'Assign unique Token IDs, positions, and feature vectors.' },
            { step: '05', title: 'Index Integration', desc: 'Store in inverted index or dense vector index for fast retrieval.' },
          ].map((s, i) => (
            <div
              key={s.step}
              className="rounded-2xl p-4 bg-white border border-slate-200 shadow-2xs space-y-2 relative"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black flex items-center justify-center font-mono">
                {s.step}
              </div>
              <h4 className="text-sm font-bold text-slate-900">{s.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Key Terminology Glossary ── */}
      <div className="space-y-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Conceptual Glossary</div>
          <h2 className="text-2xl font-bold text-slate-900">Key Terminology & Definitions</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              term: 'Multimodal IR',
              tag: 'Core Paradigm',
              desc: 'Information Retrieval across diverse data formats (text, image, audio, video) in a shared index or semantic space.'
            },
            {
              term: 'Token',
              tag: 'Atomic Unit',
              desc: 'The fundamental discrete unit produced by partitioning raw data (words, patches, or frames) for indexing and matching.'
            },
            {
              term: 'Visual Patch Token',
              tag: 'Vision Transformer',
              desc: 'A square 2D sub-region of an image (e.g. 16×16 px) treated as a single token in modern ViT architectures.'
            },
            {
              term: 'Temporal Frame Token',
              tag: 'Acoustic Processing',
              desc: 'A short uniform time slice (e.g. 20ms) of a continuous audio signal representing instantaneous frequency characteristics.'
            },
            {
              term: 'Keyframe Sampling',
              tag: 'Video Analysis',
              desc: 'Extracting periodic or salient video frames to capture event dynamics while shedding temporal redundancies.'
            },
            {
              term: 'Inverted Index',
              tag: 'Data Structure',
              desc: 'A core IR data structure mapping each unique token to its occurrences (postings) across indexed documents and media.'
            },
          ].map((t) => (
            <div key={t.term} className="rounded-2xl p-4 bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{t.term}</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  {t.tag}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. Callout to Simulation ── */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-teal-500 via-indigo-600 to-violet-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-bold">Ready to tokenize real documents & media?</h3>
          <p className="text-sm text-indigo-100">
            Proceed to the Simulation Lab to run text preprocessing pipelines, extract image patches, and record experimental trials.
          </p>
        </div>
        <button
          onClick={onGoToLab}
          className="px-6 py-3 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm shadow-md transition cursor-pointer whitespace-nowrap"
        >
          Enter Simulation Lab &rarr;
        </button>
      </div>

    </div>
  );
}
