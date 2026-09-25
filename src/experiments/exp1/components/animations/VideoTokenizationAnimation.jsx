import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Sparkles, Video, Film } from 'lucide-react';

export default function VideoTokenizationAnimation({ videoFrames, videoInterval }) {
  const totalFrames = videoFrames?.length || 12;
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [sampledTokensList, setSampledTokensList] = useState([]);

  const activeFrame = videoFrames[currentFrameIdx] || videoFrames[0];
  const isKeyframe = (currentFrameIdx + 1) % videoInterval === 0;

  useEffect(() => {
    let timer;
    if (isPlaying) {
      const delay = 800 / speed;
      timer = setTimeout(() => {
        if (currentFrameIdx < totalFrames - 1) {
          if ((currentFrameIdx + 1) % videoInterval === 0) {
            setSampledTokensList(prev => {
              if (!prev.find(t => t.frameIndex === currentFrameIdx + 1)) {
                return [...prev, {
                  tokenId: prev.length + 1,
                  frameIndex: currentFrameIdx + 1,
                  timestampSec: activeFrame.timestampSec,
                  dataUrl: activeFrame.dataUrl,
                }];
              }
              return prev;
            });
          }
          setCurrentFrameIdx(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentFrameIdx, totalFrames, videoInterval, speed, activeFrame]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrameIdx(0);
    setSampledTokensList([]);
  };

  const handleStep = () => {
    if (currentFrameIdx < totalFrames - 1) {
      if ((currentFrameIdx + 1) % videoInterval === 0) {
        setSampledTokensList(prev => {
          if (!prev.find(t => t.frameIndex === currentFrameIdx + 1)) {
            return [...prev, {
              tokenId: prev.length + 1,
              frameIndex: currentFrameIdx + 1,
              timestampSec: activeFrame.timestampSec,
              dataUrl: activeFrame.dataUrl,
            }];
          }
          return prev;
        });
      }
      setCurrentFrameIdx(prev => prev + 1);
    }
  };

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-amber-950/50 to-slate-900 border border-amber-900/60 shadow-lg text-white space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/40 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Spatiotemporal Keyframe Extraction Engine
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            Continuous Video Stream &rarr; Redundancy Filter &rarr; Keyframe Token Register
          </h3>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            {isPlaying ? 'Pause' : currentFrameIdx >= totalFrames - 1 ? 'Replay' : 'Run Film Projector'}
          </button>
          <button
            onClick={handleStep}
            disabled={isPlaying || currentFrameIdx >= totalFrames - 1}
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
                  speed === s ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3-Stage Visual Pipeline */}
      <div className="grid md:grid-cols-12 gap-4 items-center">
        
        {/* Stage 1: Film Projector Reel */}
        <div className="md:col-span-6 rounded-xl p-4 bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex justify-between">
            <span>1. Continuous Film Reel (Interval: Every {videoInterval}th Frame)</span>
            <span className="font-mono text-slate-400">Scanner on Frame #{currentFrameIdx + 1}</span>
          </div>

          <div className="flex gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">
            {videoFrames.map((frm, idx) => {
              const isCurrent = idx === currentFrameIdx;
              const isSampleTarget = (idx + 1) % videoInterval === 0;

              return (
                <div
                  key={frm.frameIndex}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all duration-300 w-16 shrink-0 ${
                    isCurrent
                      ? isSampleTarget
                        ? 'border-amber-400 ring-2 ring-amber-400/60 scale-105 z-10'
                        : 'border-rose-500/80 opacity-60 scale-95'
                      : isSampleTarget
                      ? 'border-amber-500/50'
                      : 'border-slate-800 opacity-40'
                  }`}
                >
                  <img src={frm.dataUrl} alt={`Frame ${frm.frameIndex}`} className="w-full h-12 object-cover" />
                  <div
                    className={`text-[8px] font-mono text-center py-0.5 ${
                      isCurrent
                        ? isSampleTarget
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-rose-900 text-rose-200'
                        : 'bg-slate-950 text-slate-500'
                    }`}
                  >
                    F#{frm.frameIndex}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span>Frame #{currentFrameIdx + 1}: {isKeyframe ? 'KEYFRAME IDENTIFIED' : 'DROPPED (REDUNDANT)'}</span>
            <span className={isKeyframe ? 'text-amber-400 font-bold' : 'text-slate-500'}>
              {isKeyframe ? 'Emitting Token' : 'Skipped'}
            </span>
          </div>
        </div>

        {/* Transition Arrow */}
        <div className="md:col-span-2 flex flex-col items-center justify-center p-2 text-center space-y-1">
          <div className="text-[10px] text-amber-300 font-bold tracking-widest uppercase">
            {isKeyframe ? 'SAMPLED & POPPED' : 'REDUNDANT'}
          </div>
          <div className="text-xl text-amber-400 font-bold">&darr; &rarr;</div>
          <div className={`px-2 py-1 rounded text-[10px] font-mono ${
            isKeyframe ? 'bg-amber-950 border border-amber-400 text-amber-200 font-bold' : 'bg-slate-900 text-slate-500'
          }`}>
            {isKeyframe ? `Keyframe #${sampledTokensList.length + (isKeyframe ? 1 : 0)}` : 'Frame Dropped'}
          </div>
        </div>

        {/* Stage 2: Emitted Keyframe Tokens */}
        <div className="md:col-span-4 rounded-xl p-4 bg-amber-950/40 border border-amber-800/80 space-y-2 min-h-[140px]">
          <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wide flex justify-between">
            <span>2. Keyframe Token Register</span>
            <span className="font-mono text-amber-300">{sampledTokensList.length} Tokens</span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
            <AnimatePresence>
              {sampledTokensList.map((tok) => (
                <motion.div
                  key={tok.frameIndex}
                  initial={{ opacity: 0, scale: 0.6, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 border border-amber-400/80 shadow-md"
                >
                  <img src={tok.dataUrl} alt={`Token ${tok.tokenId}`} className="w-8 h-8 rounded object-cover" />
                  <div className="text-[10px] font-mono leading-tight">
                    <div className="text-amber-300 font-bold">Token #{tok.tokenId}</div>
                    <div className="text-slate-400">Frame #{tok.frameIndex}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {sampledTokensList.length === 0 && (
              <div className="text-xs text-slate-500 italic p-2">
                Click &ldquo;Run Film Projector&rdquo; to watch frames be sampled into discrete keyframe tokens...
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
