import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { tokenizeText, cleanText, normalizeText, stemToken, ENGLISH_STOP_WORDS } from '../../tokenizationEngine';

export default function TextTokenizationAnimation({ rawText }) {
  const words = rawText.trim().split(/\s+/).slice(0, 16); // Take first 16 words for smooth animation
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.5, 1, 2
  const [emittedTokens, setEmittedTokens] = useState([]);

  const activeWord = words[currentWordIdx] || '';
  const cleanedWord = cleanText(activeWord, true, true);
  const normalizedWord = normalizeText(cleanedWord);
  const isStopword = ENGLISH_STOP_WORDS.has(normalizedWord);
  const stemmedWord = stemToken(normalizedWord);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      const delay = 1200 / speed;
      timer = setTimeout(() => {
        if (currentWordIdx < words.length) {
          // Emit current word
          const tokenEntry = {
            id: currentWordIdx + 1,
            original: activeWord,
            cleaned: cleanedWord,
            normalized: normalizedWord,
            isStopword,
            stem: stemmedWord,
          };
          setEmittedTokens(prev => [...prev, tokenEntry]);
          setCurrentWordIdx(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentWordIdx, words.length, speed, activeWord, cleanedWord, normalizedWord, isStopword, stemmedWord]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentWordIdx(0);
    setEmittedTokens([]);
  };

  const handleStep = () => {
    if (currentWordIdx < words.length) {
      const tokenEntry = {
        id: currentWordIdx + 1,
        original: activeWord,
        cleaned: cleanedWord,
        normalized: normalizedWord,
        isStopword,
        stem: stemmedWord,
      };
      setEmittedTokens(prev => [...prev, tokenEntry]);
      setCurrentWordIdx(prev => prev + 1);
    }
  };

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-900/60 shadow-lg text-white space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/40 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Dynamic Process Visualizer
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            Raw Sentence &rarr; Word Extraction &rarr; Discrete Token Stream
          </h3>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            {isPlaying ? 'Pause' : currentWordIdx >= words.length ? 'Replay' : 'Play Animation'}
          </button>
          <button
            onClick={handleStep}
            disabled={isPlaying || currentWordIdx >= words.length}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition cursor-pointer"
            title="Step Forward"
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

          {/* Speed selector */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[11px] font-mono">
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  speed === s ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Animation Stage: 3-column transformation */}
      <div className="grid lg:grid-cols-12 gap-4 items-center">
        
        {/* Stage 1: Raw Sentence Buffer with Active Word Highlighter */}
        <div className="lg:col-span-5 rounded-xl p-4 bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wide flex justify-between">
            <span>1. Raw Text Buffer</span>
            <span className="font-mono text-slate-400">{Math.min(currentWordIdx, words.length)} / {words.length} Words</span>
          </div>

          <div className="flex flex-wrap gap-1.5 leading-relaxed text-sm font-medium">
            {words.map((w, idx) => {
              const isCurrent = idx === currentWordIdx && isPlaying;
              const isPast = idx < currentWordIdx;
              return (
                <span
                  key={idx}
                  className={`px-1.5 py-0.5 rounded transition-all duration-300 ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950 font-bold scale-110 shadow-md ring-2 ring-amber-300'
                      : isPast
                      ? 'text-slate-500 bg-slate-900 line-through opacity-60'
                      : 'text-slate-200'
                  }`}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </div>

        {/* Transition Arrow & Transformation Pod */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-2 text-center space-y-1">
          <div className="text-[10px] text-teal-300 font-bold tracking-widest uppercase">LIFT &amp; TOKENIZE</div>
          <div className="text-xl text-teal-400 font-bold">&darr; &rarr;</div>
          <AnimatePresence mode="wait">
            {activeWord && currentWordIdx < words.length && (
              <motion.div
                key={`trans-${currentWordIdx}`}
                initial={{ opacity: 0, scale: 0.8, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 8 }}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-900/80 border border-indigo-400 text-indigo-200 text-xs font-mono shadow-md"
              >
                <div>&ldquo;{activeWord}&rdquo;</div>
                <div className="text-[10px] text-teal-300 mt-0.5">
                  {isStopword ? '[STOPWORD]' : `&rarr; "${stemmedWord}"`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stage 2: Emitted Token Sequence */}
        <div className="lg:col-span-5 rounded-xl p-4 bg-slate-950/80 border border-slate-800 space-y-2 min-h-[140px]">
          <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wide flex justify-between">
            <span>2. Inverted Index Token Stream</span>
            <span className="font-mono text-teal-300">{emittedTokens.length} Tokens Emitted</span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
            <AnimatePresence>
              {emittedTokens.map((tok) => (
                <motion.div
                  key={tok.id}
                  initial={{ opacity: 0, scale: 0.5, y: -12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono shadow-sm border ${
                    tok.isStopword
                      ? 'bg-rose-950/60 border-rose-800 text-rose-300 line-through opacity-70'
                      : 'bg-indigo-900/60 border-indigo-400 text-indigo-200 ring-1 ring-indigo-500/30'
                  }`}
                >
                  <span className="text-[9px] text-indigo-400 font-bold">#{tok.id}</span>
                  <strong>{tok.stem || tok.normalized || tok.original}</strong>
                  {tok.isStopword && <span className="text-[8px] text-rose-400">(stop)</span>}
                </motion.div>
              ))}
            </AnimatePresence>
            {emittedTokens.length === 0 && (
              <div className="text-xs text-slate-500 italic p-2">
                Click &ldquo;Play Animation&rdquo; to watch text words lift off and populate the token index...
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
