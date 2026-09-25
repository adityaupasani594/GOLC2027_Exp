import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Sparkles, Volume2, Activity } from 'lucide-react';

export default function AudioTokenizationAnimation({ audioResult, frameDurationMs }) {
  const tokens = audioResult?.tokens || [];
  const totalTokens = tokens.length;
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const activeToken = tokens[currentStep] || tokens[0];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      const delay = 600 / speed;
      timer = setTimeout(() => {
        if (currentStep < totalTokens - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalTokens, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleStep = () => {
    if (currentStep < totalTokens - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  if (!activeToken) return null;

  const progressPercent = totalTokens > 0 ? (currentStep / (totalTokens - 1)) * 100 : 0;

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-teal-950/60 to-slate-900 border border-teal-900/60 shadow-lg text-white space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-900/40 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            1D Temporal Slicing Engine
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            Continuous Acoustic Waveform &rarr; Temporal Window Framing &rarr; Audio Token Ledger
          </h3>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            {isPlaying ? 'Pause' : currentStep >= totalTokens - 1 ? 'Replay' : 'Auto-Sweep Waveform'}
          </button>
          <button
            onClick={handleStep}
            disabled={isPlaying || currentStep >= totalTokens - 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition cursor-pointer"
            title="Next Frame"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[11px] font-mono">
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  speed === s ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3-Stage Procedural Visualization */}
      <div className="grid md:grid-cols-12 gap-4 items-center">
        
        {/* Stage 1: Sliding Window on Waveform */}
        <div className="md:col-span-6 rounded-xl p-4 bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wide flex justify-between">
            <span>1. Sliding Temporal Window (&Delta;t = {frameDurationMs}ms)</span>
            <span className="font-mono text-slate-400">[{activeToken.startSec}s : {activeToken.endSec}s]</span>
          </div>

          <div className="w-full h-32 relative bg-slate-950 rounded-lg p-2 overflow-hidden border border-slate-800">
            <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
              <line x1="0" y1="40" x2="400" y2="40" stroke="#1e293b" strokeWidth="1" />
              {/* Waveform curve */}
              <path
                d={`M 0 40 ` + Array.from({ length: 80 }).map((_, i) => {
                  const x = (i / 80) * 400;
                  const t = i / 80;
                  const y = 40 - 32 * Math.sin(2 * Math.PI * 6 * t) * Math.exp(-1.4 * t);
                  return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
                }).join(' ')}
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
              />

              {/* Sliding window slice highlight */}
              <motion.rect
                y="0"
                height="80"
                fill="rgba(45, 212, 191, 0.35)"
                stroke="#2dd4bf"
                strokeWidth="2"
                animate={{
                  x: `${progressPercent}%`,
                  width: `${Math.max(4, 100 / totalTokens)}%`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0.000 s</span>
            <span className="text-teal-300">Scanner active at {activeToken.startSec} s</span>
            <span>1.000 s</span>
          </div>
        </div>

        {/* Transition Arrow */}
        <div className="md:col-span-2 flex flex-col items-center justify-center p-2 text-center space-y-1">
          <div className="text-[10px] text-teal-300 font-bold tracking-widest uppercase">WINDOW SLICED</div>
          <div className="text-xl text-teal-400 font-bold">&darr; &rarr;</div>
          <div className="px-2 py-1 rounded bg-teal-950/80 border border-teal-500/40 text-[10px] font-mono text-teal-200">
            Token #{activeToken.id}
          </div>
        </div>

        {/* Stage 2: Generated Token Pod & FFT Vector */}
        <div className="md:col-span-4 rounded-xl p-4 bg-teal-950/40 border border-teal-800/80 space-y-2">
          <div className="text-[11px] font-bold text-teal-300 uppercase tracking-wide flex justify-between">
            <span>2. Extracted Audio Token #{activeToken.id}</span>
            <Activity className="w-3.5 h-3.5 text-teal-400" />
          </div>

          <div className="font-mono text-xs text-teal-200 space-y-1 bg-slate-950/80 p-3 rounded-lg border border-teal-800/60">
            <div className="flex justify-between">
              <span className="text-slate-400">Timestamp:</span>
              <strong className="text-teal-300">[{activeToken.startSec}s &ndash; {activeToken.endSec}s]</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Frame Window:</span>
              <strong>{activeToken.durationMs} ms</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">RMS Power:</span>
              <strong className="text-amber-300">{activeToken.rms}</strong>
            </div>
            <div className="text-[10px] text-teal-400 pt-1 border-t border-slate-800">
              Spectrogram / Filterbank Feature Vector Emitted
            </div>
          </div>
        </div>

      </div>

      {/* Ribbon of all temporal tokens */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex justify-between">
          <span>Temporal Acoustic Token Ribbon (Progress: {currentStep + 1} / {totalTokens})</span>
          <span className="font-mono text-teal-400 font-bold">Total: {totalTokens} Tokens</span>
        </div>

        <div className="flex gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          {tokens.slice(0, 36).map((tok, idx) => {
            const isProcessed = idx <= currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div
                key={tok.id}
                onClick={() => { setCurrentStep(idx); setIsPlaying(false); }}
                className={`w-7 h-7 shrink-0 rounded flex items-center justify-center font-mono text-[9px] font-bold border transition cursor-pointer ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-400 text-slate-950 scale-110 shadow-md ring-2 ring-amber-400/40 z-10'
                    : isProcessed
                    ? 'border-teal-500/80 bg-teal-900/60 text-teal-200'
                    : 'border-slate-800 bg-slate-900/50 text-slate-600'
                }`}
              >
                {tok.id}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
