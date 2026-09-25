import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Play, RotateCcw, CheckCircle2, Sliders,
  FileText, Image as ImageIcon, Music, Video, Table,
  Download, Trash2, ArrowRight, Eye, Sparkles, ChevronDown,
  ChevronUp, BarChart2, Info, UploadCloud, Volume2
} from 'lucide-react';
import {
  processDocument,
  generateSyntheticImageCanvas,
  extractImagePatches,
  generateSyntheticAudioWaveform,
  segmentAudioFrames,
  generateSyntheticVideoFrames,
  sampleVideoKeyframes,
} from '../tokenizationEngine';
import TextTokenizationAnimation from './animations/TextTokenizationAnimation';
import ImageTokenizationAnimation from './animations/ImageTokenizationAnimation';
import AudioTokenizationAnimation from './animations/AudioTokenizationAnimation';
import VideoTokenizationAnimation from './animations/VideoTokenizationAnimation';

export default function LabSection({ onRecordTrial, onGoToQuiz }) {
  const [activeModality, setActiveModality] = useState('text');

  // ───────────────────────────────────────────────────────────────────────────
  // 1. Text Pipeline State
  // ───────────────────────────────────────────────────────────────────────────
  const [rawText, setRawText] = useState(
    'Information Retrieval is the process of finding relevant information from a large collection ' +
    'of documents. Search engines, digital libraries, and enterprise knowledge bases are common applications ' +
    'of IR systems. Preprocessing is essential before documents can be indexed and retrieved efficiently.'
  );

  const [textOptions, setTextOptions] = useState({
    doLowercase: true,
    doRemovePunct: true,
    doRemoveNumbers: true,
    doTokenize: true,
    doRemoveStopwords: true,
    doStem: true,
  });

  const [textResult, setTextResult] = useState(() => processDocument(rawText, textOptions));
  const [expandedTextStep, setExpandedTextStep] = useState(4); // default open tokenization

  const handleRunTextPipeline = () => {
    const res = processDocument(rawText, textOptions);
    setTextResult(res);
  };

  const handleTextFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      if (typeof content === 'string') {
        setRawText(content);
        const res = processDocument(content, textOptions);
        setTextResult(res);
      }
    };
    reader.readAsText(file);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Image Pipeline State
  // ───────────────────────────────────────────────────────────────────────────
  const [imagePatchSize, setImagePatchSize] = useState(16);
  const [imageSourceMode, setImageSourceMode] = useState('synthetic'); // 'synthetic' | 'upload'
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [selectedPatchToken, setSelectedPatchToken] = useState(null);

  const processImageCanvas = (canvas, pSize) => {
    const res = extractImagePatches(canvas, pSize);
    setImageResult(res);
    setSelectedPatchToken(res.patches[0] || null);
  };

  // Initial synthetic image processing
  useEffect(() => {
    if (imageSourceMode === 'synthetic') {
      const synthCanvas = generateSyntheticImageCanvas(128);
      processImageCanvas(synthCanvas, imagePatchSize);
    } else if (uploadedImageSrc) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        processImageCanvas(canvas, imagePatchSize);
      };
      img.src = uploadedImageSrc;
    }
  }, [imagePatchSize, imageSourceMode, uploadedImageSrc]);

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setUploadedImageSrc(evt.target.result);
      setImageSourceMode('upload');
    };
    reader.readAsDataURL(file);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Audio Pipeline State
  // ───────────────────────────────────────────────────────────────────────────
  const [audioFrameMs, setAudioFrameMs] = useState(20);
  const [audioSourceMode, setAudioSourceMode] = useState('synthetic');
  const [audioResult, setAudioResult] = useState(() => {
    const wave = generateSyntheticAudioWaveform(1.0, 16000);
    return segmentAudioFrames(wave.samples, wave.sampleRate, 20);
  });
  const [isPlayingTone, setIsPlayingTone] = useState(false);

  useEffect(() => {
    const wave = generateSyntheticAudioWaveform(1.0, 16000);
    const res = segmentAudioFrames(wave.samples, wave.sampleRate, audioFrameMs);
    setAudioResult(res);
  }, [audioFrameMs]);

  const playSynthesizedTone = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.0);
      setIsPlayingTone(true);
      setTimeout(() => setIsPlayingTone(false), 1000);
    } catch {
      // AudioContext not allowed or not supported
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Video Pipeline State
  // ───────────────────────────────────────────────────────────────────────────
  const [videoInterval, setVideoInterval] = useState(3);
  const [videoFrames] = useState(() => generateSyntheticVideoFrames(12));
  const [videoResult, setVideoResult] = useState(() => sampleVideoKeyframes(videoFrames, 3));

  useEffect(() => {
    setVideoResult(sampleVideoKeyframes(videoFrames, videoInterval));
  }, [videoInterval, videoFrames]);

  // ───────────────────────────────────────────────────────────────────────────
  // Trial Recording Helper
  // ───────────────────────────────────────────────────────────────────────────
  const [sessionTrials, setSessionTrials] = useState([]);
  const [trialToast, setTrialToast] = useState(null);

  const handleRecordTrial = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString();

    let trialRecord = null;

    if (activeModality === 'text') {
      const s = textResult.stats;
      const enabledSteps = Object.entries(textOptions)
        .filter(([, v]) => v)
        .map(([k]) => k.replace(/^do/, ''))
        .join(', ');

      trialRecord = {
        trialId: sessionTrials.length + 1,
        date: dateStr,
        time: timeStr,
        modality: 'Text',
        source: 'Manual Text / Document',
        tokenCount: s.finalTokenCount,
        uniqueTokens: s.uniqueStemsAfterStemming,
        detail: `Words: ${s.originalWordCount} → Tokens: ${s.tokenCount} → Stems: ${s.finalTokenCount} (${s.percentageReduction}% red.)`,
        config: enabledSteps || 'None',
        tokensList: textResult.stemmed.slice(0, 15).join(', '),
      };
    } else if (activeModality === 'image') {
      trialRecord = {
        trialId: sessionTrials.length + 1,
        date: dateStr,
        time: timeStr,
        modality: 'Image',
        source: imageSourceMode === 'synthetic' ? '128x128 Synthetic Scene' : 'Uploaded Image',
        tokenCount: imageResult.totalPatches,
        uniqueTokens: imageResult.totalPatches,
        detail: `Patch Size: ${imagePatchSize}x${imagePatchSize} px, Grid: ${imageResult.rows}x${imageResult.cols}`,
        config: `Patch: ${imagePatchSize}px`,
        tokensList: `${imageResult.totalPatches} visual patch tokens generated`,
      };
    } else if (activeModality === 'audio') {
      trialRecord = {
        trialId: sessionTrials.length + 1,
        date: dateStr,
        time: timeStr,
        modality: 'Audio',
        source: '1.0s Harmonic Signal (16 kHz)',
        tokenCount: audioResult.completeFrameCount,
        uniqueTokens: audioResult.completeFrameCount,
        detail: `Frame Window: ${audioFrameMs}ms, Duration: ${audioResult.duration.toFixed(2)}s`,
        config: `Window: ${audioFrameMs}ms`,
        tokensList: `${audioResult.completeFrameCount} temporal acoustic frame tokens`,
      };
    } else if (activeModality === 'video') {
      trialRecord = {
        trialId: sessionTrials.length + 1,
        date: dateStr,
        time: timeStr,
        modality: 'Video',
        source: '12-frame Spatiotemporal Stream',
        tokenCount: videoResult.sampledTokensCount,
        uniqueTokens: videoResult.sampledTokensCount,
        detail: `Sampled every ${videoInterval}th frame (${videoResult.reductionRatio}% redundancy reduction)`,
        config: `Interval: N=${videoInterval}`,
        tokensList: `Keyframe tokens: ${videoResult.sampledTokens.map(t => `#${t.tokenId} (F#${t.sourceFrameIndex})`).join(', ')}`,
      };
    }

    if (trialRecord) {
      setSessionTrials((prev) => [trialRecord, ...prev]);
      if (onRecordTrial) onRecordTrial(trialRecord);
      setTrialToast(`Trial #${trialRecord.trialId} (${trialRecord.modality}) recorded successfully!`);
      setTimeout(() => setTrialToast(null), 3000);
    }
  };

  const handleExportCSV = () => {
    if (sessionTrials.length === 0) return;
    const headers = ['Trial #', 'Date', 'Time', 'Modality', 'Source', 'Token Count', 'Unique Tokens', 'Config', 'Summary'];
    const rows = sessionTrials.map(t => [
      t.trialId,
      t.date,
      t.time,
      t.modality,
      `"${t.source}"`,
      t.tokenCount,
      t.uniqueTokens,
      `"${t.config}"`,
      `"${t.detail}"`
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {trialToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-teal-600 text-white font-medium text-sm shadow-xl flex items-center gap-2 border border-teal-400"
          >
            <CheckCircle2 className="w-4 h-4" />
            {trialToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Interactive Simulation Workbench
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Multimodal Tokenization Laboratory
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Configure parameters, execute modality pipelines, inspect discrete representations, and record trials.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRecordTrial}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-200 cursor-pointer transition active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            Record Current Trial
          </button>
        </div>
      </div>

      {/* ── Modality Selector Tabs ── */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        {[
          { id: 'text', label: 'Text Modality (IR Pipeline)', icon: FileText, color: 'text-blue-600', badge: `${textResult.stats.finalTokenCount} Stems` },
          { id: 'image', label: 'Image Modality (ViT Patches)', icon: ImageIcon, color: 'text-purple-600', badge: `${imageResult?.totalPatches || 64} Patches` },
          { id: 'audio', label: 'Audio Modality (Time Frames)', icon: Music, color: 'text-teal-600', badge: `${audioResult?.completeFrameCount || 50} Frames` },
          { id: 'video', label: 'Video Modality (Keyframes)', icon: Video, color: 'text-amber-600', badge: `${videoResult?.sampledTokensCount || 4} Keyframes` },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModality === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveModality(tab.id)}
              className={`flex-1 min-w-[200px] flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${tab.color}`} />
                {tab.label}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Main Modality Workbenches ── */}
      <AnimatePresence mode="wait">

        {/* ═══════════════════════════════════════════════════════════════════
            1. TEXT MODALITY WORKBENCH (FULL DOCUMENT PREPROCESSING PIPELINE)
            ═══════════════════════════════════════════════════════════════════ */}
        {activeModality === 'text' && (
          <motion.div
            key="text-workbench"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Input & Pipeline Configuration */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Document Input */}
              <div className="lg:col-span-2 rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    1. Input Document (Manual Text or File Upload)
                  </div>
                  <label className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload File (.txt, .md)
                    <input type="file" accept=".txt,.md,.text" onChange={handleTextFileUpload} className="hidden" />
                  </label>
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={5}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                  placeholder="Enter or paste text here..."
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Characters: {rawText.length} &bull; Words: {rawText.trim().split(/\s+/).filter(Boolean).length}</span>
                  <button
                    onClick={handleRunTextPipeline}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Process Document
                  </button>
                </div>
              </div>

              {/* Pipeline Configuration Controls */}
              <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                  <span>2. Pipeline Stages</span>
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={textOptions.doLowercase}
                      onChange={(e) => setTextOptions({ ...textOptions, doLowercase: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Convert to Lowercase (Normalization)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={textOptions.doRemovePunct}
                      onChange={(e) => setTextOptions({ ...textOptions, doRemovePunct: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Remove Punctuation Marks</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={textOptions.doRemoveNumbers}
                      onChange={(e) => setTextOptions({ ...textOptions, doRemoveNumbers: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Remove Numbers (Digits)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={textOptions.doTokenize}
                      onChange={(e) => setTextOptions({ ...textOptions, doTokenize: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Tokenize Text (Regex &bull; \S+)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={textOptions.doRemoveStopwords}
                      onChange={(e) => setTextOptions({ ...textOptions, doRemoveStopwords: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Remove Stop Words (~318 standard)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={textOptions.doStem}
                      onChange={(e) => setTextOptions({ ...textOptions, doStem: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Apply Stemming (Porter Stemmer)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Statistics Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Original Words</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{textResult.stats.originalWordCount}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Raw space-delimited count</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Stop Words Removed</div>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">{textResult.stats.stopwordsRemoved}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Low-information tokens</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Final Token Count</div>
                <div className="text-2xl font-extrabold text-indigo-600 mt-1">{textResult.stats.finalTokenCount}</div>
                <div className="text-[10px] text-teal-600 mt-0.5">Stemming preserves count</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Vocabulary Reduction</div>
                <div className="text-2xl font-extrabold text-teal-600 mt-1">{textResult.stats.percentageReduction}%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{textResult.stats.vocabularyReductionByStemming} types merged by stemmer</div>
              </div>
            </div>

            {/* Live Animated Process: Words to Tokens */}
            <TextTokenizationAnimation rawText={rawText} />

            {/* Step-by-Step Pipeline Inspector */}
            <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                3. Step-by-Step Pipeline Transformation Output
              </div>

              <div className="space-y-2">
                {[
                  { step: 1, title: 'Original / Raw Document', content: textResult.raw },
                  { step: 2, title: 'After Cleaning (Punctuation & Number Stripping)', content: textResult.cleaned },
                  { step: 3, title: 'After Lowercasing (Normalization)', content: textResult.normalized },
                  {
                    step: 4,
                    title: `After Tokenization (${textResult.tokens.length} Tokens)`,
                    isTokenList: true,
                    tokens: textResult.tokens,
                  },
                  {
                    step: 5,
                    title: `After Stop-word Removal (${textResult.tokensNoSw.length} Tokens)`,
                    isTokenList: true,
                    tokens: textResult.tokensNoSw,
                  },
                  {
                    step: 6,
                    title: `After Porter Stemming (${textResult.stemmed.length} Stemmed Tokens)`,
                    isTokenList: true,
                    tokens: textResult.stemmed,
                  },
                  { step: 7, title: 'Final Processed Document (Joined Stems)', content: textResult.finalText },
                ].map((item) => {
                  const isOpen = expandedTextStep === item.step;
                  return (
                    <div key={item.step} className="rounded-xl border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedTextStep(isOpen ? null : item.step)}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 text-left text-xs font-bold text-slate-800 transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                            {item.step}
                          </span>
                          {item.title}
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>

                      {isOpen && (
                        <div className="p-4 bg-white border-t border-slate-200 text-xs">
                          {item.isTokenList ? (
                            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                              {item.tokens.map((tok, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 font-mono text-[11px] text-indigo-900"
                                >
                                  <span className="text-[9px] text-indigo-400">#{idx + 1}</span>
                                  {tok}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="font-mono text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-wrap">
                              {item.content || '—'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            2. IMAGE MODALITY WORKBENCH (ViT PATCHES)
            ═══════════════════════════════════════════════════════════════════ */}
        {activeModality === 'image' && imageResult && (
          <motion.div
            key="image-workbench"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Image Source:</span>
                <button
                  onClick={() => setImageSourceMode('synthetic')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    imageSourceMode === 'synthetic'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Synthetic Scene (128&times;128)
                </button>
                <label className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload Image
                  <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Patch Size:</span>
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
                    {sz}&times;{sz} px
                  </button>
                ))}
              </div>
            </div>

            {/* Live Animated Process: 2D Image to 1D ViT Patches */}
            <ImageTokenizationAnimation imageResult={imageResult} patchSize={imagePatchSize} />

            {/* Visual Tokenizer Grid & Statistics */}
            <div className="grid md:grid-cols-3 gap-6 items-start">
              {/* Image & Grid View */}
              <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  1. Image & Spatial Grid Partitions
                </div>
                <div className="relative w-56 h-56 mx-auto rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-slate-900">
                  {imageSourceMode === 'synthetic' ? (
                    <div
                      className="w-full h-full relative"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, rgba(168, 85, 247, 0.5) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(168, 85, 247, 0.5) 1px, transparent 1px),
                          linear-gradient(135deg, #1e3a8a 0%, #059669 60%, #0f172a 100%)
                        `,
                        backgroundSize: `${imagePatchSize * (224 / 128)}px ${imagePatchSize * (224 / 128)}px, ${imagePatchSize * (224 / 128)}px ${imagePatchSize * (224 / 128)}px, 100% 100%`,
                      }}
                    >
                      <div className="absolute top-6 left-20 w-10 h-10 rounded-full bg-amber-400 border border-amber-200 shadow-md" />
                      <div className="absolute bottom-4 left-6 w-14 h-14 rounded-full bg-pink-500 opacity-90" />
                    </div>
                  ) : (
                    <img src={uploadedImageSrc} alt="Uploaded preview" className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Dimensions:</span>
                    <strong className="text-slate-900 font-mono">{imageResult.originalWidth} &times; {imageResult.originalHeight} px</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Grid Geometry:</span>
                    <strong className="text-slate-900 font-mono">{imageResult.rows} rows &times; {imageResult.cols} cols</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Visual Tokens:</span>
                    <strong className="text-purple-600 font-mono text-sm">{imageResult.totalPatches} Tokens</strong>
                  </div>
                </div>
              </div>

              {/* Flattened Token Stream */}
              <div className="md:col-span-2 rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    2. Flattened 1D Visual Token Sequence (Click to inspect)
                  </div>
                  <span className="text-[11px] font-mono text-purple-600 font-bold">
                    N = {imageResult.totalPatches} Tokens
                  </span>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-64 overflow-y-auto">
                  {imageResult.patches.map((p) => {
                    const isSelected = selectedPatchToken?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPatchToken(p)}
                        className={`p-1 rounded-lg border transition text-center cursor-pointer ${
                          isSelected
                            ? 'bg-purple-100 border-purple-500 ring-2 ring-purple-300'
                            : 'bg-white border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        <img src={p.dataUrl} alt={`Patch ${p.id}`} className="w-10 h-10 object-cover rounded mx-auto" />
                        <span className="text-[9px] font-mono font-bold text-slate-600 block mt-0.5">T{p.id}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedPatchToken && (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={selectedPatchToken.dataUrl}
                      alt="Selected patch"
                      className="w-16 h-16 rounded-xl border-2 border-purple-400 shadow-md object-cover"
                    />
                    <div className="space-y-1 text-xs text-purple-950 flex-1">
                      <div className="font-bold text-sm text-purple-900">
                        Visual Token #{selectedPatchToken.id}
                      </div>
                      <div className="text-slate-600">
                        Grid Position: Row {selectedPatchToken.row}, Col {selectedPatchToken.col} (Pixel X: {selectedPatchToken.x}, Y: {selectedPatchToken.y})
                      </div>
                      <div className="font-mono text-xs flex gap-3 text-purple-800 font-semibold">
                        <span>Mean RGB: ({selectedPatchToken.meanR}, {selectedPatchToken.meanG}, {selectedPatchToken.meanB})</span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full inline-block border border-slate-300" style={{ background: selectedPatchToken.rgbHex }} />
                          {selectedPatchToken.rgbHex}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            3. AUDIO MODALITY WORKBENCH (ACOUSTIC FRAMES)
            ═══════════════════════════════════════════════════════════════════ */}
        {activeModality === 'audio' && (
          <motion.div
            key="audio-workbench"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Audio Controls */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Audio Signal:</span>
                <span className="text-xs text-slate-500 font-mono">1.0s Synthesized Multi-Harmonic Signal (16 kHz)</span>
                <button
                  onClick={playSynthesizedTone}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {isPlayingTone ? 'Playing...' : 'Play Waveform'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Frame Window (&Delta;t):</span>
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

            {/* Live Animated Process: Continuous Audio Waveform to Temporal Frame Tokens */}
            <AudioTokenizationAnimation audioResult={audioResult} frameDurationMs={audioFrameMs} />

            {/* Waveform & Frame Boundary Viewer */}
            <div className="grid md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 rounded-2xl p-5 bg-slate-900 text-white shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-400 uppercase tracking-wide">
                    Waveform & Frame Segmentation Boundaries ({audioFrameMs}ms)
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    {audioResult.completeFrameCount} Complete Tokens
                  </span>
                </div>

                <div className="w-full h-44 relative bg-slate-950 rounded-xl p-3 overflow-hidden border border-slate-800">
                  <svg viewBox="0 0 500 100" className="w-full h-full" preserveAspectRatio="none">
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#334155" strokeWidth="1" />
                    {Array.from({ length: Math.min(30, audioResult.completeFrameCount) }).map((_, i) => {
                      const x = (i / Math.min(30, audioResult.completeFrameCount)) * 500;
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
                        />
                      );
                    })}
                    <path
                      d={`M 0 50 ` + Array.from({ length: 120 }).map((_, i) => {
                        const x = (i / 120) * 500;
                        const t = i / 120;
                        const y = 50 - 40 * Math.sin(2 * Math.PI * 6 * t) * Math.exp(-1.4 * t);
                        return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#2dd4bf"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>0.000 s</span>
                  <span className="text-teal-300">Sample Rate: 16,000 Hz &bull; Window: {audioResult.samplesPerFrame} samples/frame</span>
                  <span>1.000 s</span>
                </div>
              </div>

              {/* Tokens Table */}
              <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Temporal Frame Token Ledger
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {audioResult.tokens.slice(0, 10).map((tok) => (
                    <div
                      key={tok.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono flex items-center justify-between"
                    >
                      <span className="font-bold text-teal-700">Token #{tok.id}</span>
                      <span className="text-slate-500 text-[11px]">[{tok.startSec}s &ndash; {tok.endSec}s]</span>
                      <span className="text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                        RMS: {tok.rms}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            4. VIDEO MODALITY WORKBENCH (KEYFRAME SAMPLING)
            ═══════════════════════════════════════════════════════════════════ */}
        {activeModality === 'video' && (
          <motion.div
            key="video-workbench"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Sampling Granularity:</span>
                <p className="text-xs text-slate-500">Select every Nth frame to convert spatiotemporal stream into keyframes.</p>
              </div>

              <div className="flex items-center gap-2">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setVideoInterval(n)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      videoInterval === n
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Every {n} Frames
                  </button>
                ))}
              </div>
            </div>

            {/* Live Animated Process: Spatiotemporal Video Keyframe Sampling */}
            <VideoTokenizationAnimation videoFrames={videoFrames} videoInterval={videoInterval} />

            {/* Video Continuous Ribbon */}
            <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  1. Continuous Frame Sequence (Highlighted = Selected Keyframe Tokens)
                </div>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {videoResult.sampledTokensCount} Tokens &bull; {videoResult.reductionRatio}% Redundancy Eliminated
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800">
                {videoFrames.map((frm, idx) => {
                  const isSampled = (idx + 1) % videoInterval === 0;
                  return (
                    <div
                      key={frm.frameIndex}
                      className={`relative rounded-lg overflow-hidden border-2 transition ${
                        isSampled ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-800 opacity-40'
                      }`}
                    >
                      <img src={frm.dataUrl} alt={`Frame ${frm.frameIndex}`} className="w-full h-14 object-cover" />
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

            {/* Extracted Keyframe Tokens */}
            <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                2. Resulting Space-Time Keyframe Tokens
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {videoResult.sampledTokens.map((tok) => (
                  <div
                    key={tok.tokenId}
                    className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center gap-3 shadow-2xs"
                  >
                    <img
                      src={tok.dataUrl}
                      alt={`Token ${tok.tokenId}`}
                      className="w-14 h-14 object-cover rounded-lg border border-amber-300"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-amber-900">Keyframe Token #{tok.tokenId}</div>
                      <div className="text-slate-600 text-[11px]">Source Frame #{tok.sourceFrameIndex}</div>
                      <div className="text-slate-500 text-[10px] font-mono mt-0.5">Timestamp: {tok.timestampSec}s</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Experimental Trial Log Book ── */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Experimental Data Log Book ({sessionTrials.length} Recorded)
            </div>
            <p className="text-xs text-slate-500">
              Each recorded trial stores processing statistics and token outputs for your verified laboratory report.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {sessionTrials.length > 0 && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
                <button
                  onClick={() => setSessionTrials([])}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Log
                </button>
              </>
            )}
          </div>
        </div>

        {sessionTrials.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-sm">
            No trials recorded in this session yet. Adjust parameters above and click{' '}
            <strong className="text-slate-700">&ldquo;Record Current Trial&rdquo;</strong> to build your dataset.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3">#</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Modality</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Token Count</th>
                  <th className="p-3">Config / Granularity</th>
                  <th className="p-3">Observed Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessionTrials.map((t) => (
                  <tr key={t.trialId} className="hover:bg-slate-50 font-mono">
                    <td className="p-3 font-bold text-indigo-600">{t.trialId}</td>
                    <td className="p-3 text-slate-500">{t.time}</td>
                    <td className="p-3 font-sans font-bold">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px]">
                        {t.modality}
                      </span>
                    </td>
                    <td className="p-3 font-sans truncate max-w-[160px]">{t.source}</td>
                    <td className="p-3 font-bold text-slate-900">{t.tokenCount}</td>
                    <td className="p-3 font-sans text-slate-600">{t.config}</td>
                    <td className="p-3 font-sans text-slate-500 text-[11px] max-w-[240px] truncate">{t.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Footer Navigation ── */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onGoToQuiz}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition cursor-pointer"
        >
          Proceed to Assessment Quiz &rarr;
        </button>
      </div>

    </div>
  );
}
