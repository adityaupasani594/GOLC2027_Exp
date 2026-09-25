import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Sparkles, Grid, Eye } from 'lucide-react';

export default function ImageTokenizationAnimation({ imageResult, patchSize }) {
  const patches = imageResult?.patches || [];
  const rows = imageResult?.rows || 8;
  const cols = imageResult?.cols || 8;
  const totalPatches = patches.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const activePatch = patches[currentStep] || patches[0];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      const delay = 600 / speed;
      timer = setTimeout(() => {
        if (currentStep < totalPatches - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalPatches, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleStep = () => {
    if (currentStep < totalPatches - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  if (!activePatch) return null;

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-purple-950/60 to-slate-900 border border-purple-900/60 shadow-lg text-white space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            2D Spatial Slicing &amp; Flattening Engine
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            2D Pixel Array &rarr; Vision Transformer (ViT) Patch Partitioning &rarr; 1D Token Sequence
          </h3>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            {isPlaying ? 'Pause' : currentStep >= totalPatches - 1 ? 'Replay' : 'Auto-Scan Grid'}
          </button>
          <button
            onClick={handleStep}
            disabled={isPlaying || currentStep >= totalPatches - 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition cursor-pointer"
            title="Next Patch"
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
                  speed === s ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Stage Procedural Visualization */}
      <div className="grid md:grid-cols-4 gap-4 items-center">
        
        {/* Stage 1: 2D Spatial Grid & Active Crop Box */}
        <div className="rounded-xl p-4 bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wide flex justify-between">
            <span>1. Raw Image Grid</span>
            <span className="font-mono text-slate-400">({activePatch.row}, {activePatch.col})</span>
          </div>

          <div className="relative w-36 h-36 mx-auto rounded-lg overflow-hidden border border-purple-500/40 bg-slate-900">
            {/* Background synthetic preview */}
            <div
              className="w-full h-full relative"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(168, 85, 247, 0.4) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(168, 85, 247, 0.4) 1px, transparent 1px),
                  linear-gradient(135deg, #1e3a8a 0%, #059669 60%, #0f172a 100%)
                `,
                backgroundSize: `${100 / cols}% ${100 / rows}%, ${100 / cols}% ${100 / rows}%, 100% 100%`,
              }}
            >
              {/* Active Scanner Box */}
              <motion.div
                className="absolute border-2 border-amber-400 bg-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                animate={{
                  left: `${(activePatch.col / cols) * 100}%`,
                  top: `${(activePatch.row / rows) * 100}%`,
                  width: `${100 / cols}%`,
                  height: `${100 / rows}%`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              />
            </div>
          </div>

          <div className="text-[10px] text-center text-slate-400 font-mono">
            Box: [{activePatch.x}:{activePatch.x + patchSize}, {activePatch.y}:{activePatch.y + patchSize}] px
          </div>
        </div>

        {/* Stage 2: Cropped Patch Lift & Pop */}
        <div className="rounded-xl p-4 bg-slate-950/80 border border-slate-800 text-center space-y-2">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
            2. Cropped Patch #{activePatch.id}
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <motion.div
              key={activePatch.id}
              initial={{ scale: 0.6, rotate: -8 }}
              animate={{ scale: 1.15, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="p-1 rounded-xl bg-purple-900/60 border-2 border-amber-400 shadow-lg"
            >
              <img src={activePatch.dataUrl} alt={`Patch ${activePatch.id}`} className="w-16 h-16 rounded object-cover" />
            </motion.div>
            <span className="text-[10px] font-mono text-slate-400 mt-2">
              Size: {patchSize} &times; {patchSize} px
            </span>
          </div>
        </div>

        {/* Stage 3: Matrix Flattening & 1D Vector Projection */}
        <div className="rounded-xl p-4 bg-purple-950/40 border border-purple-800/80 space-y-2">
          <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wide">
            3. Matrix Flattening &amp; Vector
          </div>

          <div className="font-mono text-[11px] text-purple-200 space-y-1 bg-purple-950/70 p-2.5 rounded-lg border border-purple-800/60">
            <div className="text-[10px] text-purple-400 font-bold">FLATTENED 1D VECTOR:</div>
            <div className="text-amber-300 truncate">[{activePatch.meanR}, {activePatch.meanG}, {activePatch.meanB}, ...]</div>
            <div className="text-[9px] text-slate-400 pt-1">
              Dim: {patchSize * patchSize * 3} values &bull; Hex: {activePatch.rgbHex}
            </div>
            <div className="text-[9px] text-teal-300 pt-0.5">
              Projection: E = W&middot;x<sub>p</sub> + E<sub>pos</sub>
            </div>
          </div>
        </div>

        {/* Stage 4: Token Sequence Slot */}
        <div className="rounded-xl p-4 bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wide flex justify-between">
            <span>4. Visual Token #{activePatch.id}</span>
            <span className="font-mono text-teal-300">T{activePatch.id} / T{totalPatches}</span>
          </div>

          <div className="p-3 rounded-lg bg-teal-950/40 border border-teal-800/60 text-center space-y-1.5">
            <div className="text-xs font-bold text-teal-200 font-mono">
              Token ID: T{activePatch.id}
            </div>
            <div className="text-[10px] text-slate-300">
              Ready for Visual Inverted Index &amp; Multimodal Dense Retrieval
            </div>
          </div>
        </div>

      </div>

      {/* Ribbon of all emitted patches */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex justify-between">
          <span>Flattened Visual Token Sequence (Progress: {currentStep + 1} / {totalPatches})</span>
          <span className="font-mono text-purple-400 font-bold">N = (H&times;W) / P&sup2; = {totalPatches}</span>
        </div>

        <div className="flex gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          {patches.slice(0, 36).map((p, idx) => {
            const isProcessed = idx <= currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div
                key={p.id}
                onClick={() => { setCurrentStep(idx); setIsPlaying(false); }}
                className={`w-7 h-7 shrink-0 rounded flex items-center justify-center font-mono text-[9px] font-bold border transition cursor-pointer ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-400 text-slate-950 scale-110 shadow-md ring-2 ring-amber-400/40 z-10'
                    : isProcessed
                    ? 'border-purple-500/80 bg-purple-900/60 text-purple-200'
                    : 'border-slate-800 bg-slate-900/50 text-slate-600'
                }`}
              >
                {p.id}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
