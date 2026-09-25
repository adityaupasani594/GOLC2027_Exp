import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Sparkles, ArrowRight, CheckCircle2, Layers } from 'lucide-react';
import { purePorterStem, DEFAULT_STOPWORDS } from '../../invertedIndexEngine';

export default function IndexConstructionAnimation({ docText = 'Information retrieval systems index documents for fast searching.' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 to N
  const [speed, setSpeed] = useState(1); // 0.5x, 1x, 2x
  const [activeStage, setActiveStage] = useState('all'); // 'tokens' | 'triples' | 'sorted' | 'postings'

  // Parse words from docText (up to 8 words for a clean, snappy animation)
  const rawWords = (docText.match(/\b[a-zA-Z0-9_-]+\b/g) || []).slice(0, 8);

  const steps = rawWords.map((word, idx) => {
    const lower = word.toLowerCase();
    const isStop = DEFAULT_STOPWORDS.has(lower);
    const stem = isStop ? null : purePorterStem(lower);
    return {
      id: idx,
      pos: idx,
      raw: word,
      lower,
      isStop,
      stem,
      triple: isStop ? null : { term: stem, docId: 1, pos: idx }
    };
  });

  // Emitted items up to currentStep
  const processedItems = steps.slice(0, currentStep);
  const validTriples = processedItems.filter(s => !s.isStop && s.triple);
  const sortedTriples = [...validTriples].sort((a, b) => a.stem.localeCompare(b.stem) || a.pos - b.pos);

  // Grouped into postings
  const postingsMap = {};
  sortedTriples.forEach(item => {
    if (!postingsMap[item.stem]) postingsMap[item.stem] = [];
    postingsMap[item.stem].push(item.pos);
  });

  useEffect(() => {
    let timer;
    if (isPlaying) {
      const delay = 1200 / speed;
      timer = setTimeout(() => {
        if (currentStep < steps.length) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-900/60 shadow-xl text-white space-y-5">
      {/* Header & Playback Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/50 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Dynamic Indexing Visualizer
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white mt-1">
            Raw Text &rarr; Token Filtering &rarr; Sorted Triples &rarr; Inverted Postings Assembly
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed control */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-xs">
            {[0.5, 1, 2].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                  speed === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            {isPlaying ? 'Pause' : currentStep >= steps.length ? 'Replay' : 'Play'}
          </button>

          <button
            onClick={handleStep}
            disabled={isPlaying || currentStep >= steps.length}
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
        </div>
      </div>

      {/* Source Document Word Stream Animation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Active Document Stream (Doc 1):</span>
          <span>{currentStep} / {steps.length} words ingested</span>
        </div>

        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 min-h-[50px] items-center">
          {steps.map((item, idx) => {
            const isProcessed = idx < currentStep;
            const isCurrent = idx === currentStep - 1 && isPlaying;
            return (
              <motion.div
                key={item.id}
                animate={{
                  scale: isCurrent ? 1.08 : 1,
                  opacity: isProcessed ? 1 : 0.45
                }}
                transition={{ duration: 0.25 }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition ${
                  isCurrent
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-400/50'
                    : isProcessed
                    ? item.isStop
                      ? 'bg-rose-950/40 text-rose-400 border-rose-900/60 line-through'
                      : 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                <span>{item.raw}</span>
                <span className="text-[10px] ml-1.5 opacity-60">@{item.pos}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Transformation Grid */}
      <div className="grid md:grid-cols-3 gap-3 text-xs">
        {/* Stage 1: Linguistic Extraction */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>1. Normalized Tokens</span>
            <span className="text-indigo-400 font-mono">{validTriples.length}</span>
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            <AnimatePresence>
              {processedItems.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center justify-between p-1.5 rounded-lg font-mono text-[11px] ${
                    item.isStop
                      ? 'bg-rose-950/30 text-rose-400 border border-rose-900/40'
                      : 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/50'
                  }`}
                >
                  <span className="truncate">{item.raw} &rarr; <strong>{item.stem || '[STOPWORD]'}</strong></span>
                  <span className="text-[10px] text-slate-500">pos:{item.pos}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {processedItems.length === 0 && (
              <p className="text-slate-600 italic py-2 text-center text-[11px]">Click Play to start stream</p>
            )}
          </div>
        </div>

        {/* Stage 2: Lexicographically Sorted Triples */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>2. Sorted Triples (term, doc, pos)</span>
            <span className="text-violet-400 font-mono">{sortedTriples.length}</span>
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            <AnimatePresence>
              {sortedTriples.map((item, idx) => (
                <motion.div
                  key={`${item.stem}-${item.pos}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="p-1.5 rounded-lg bg-violet-950/40 border border-violet-900/50 font-mono text-[11px] text-violet-300 flex items-center justify-between"
                >
                  <span className="truncate">({item.stem}, D1, {item.pos})</span>
                  <span className="text-[10px] text-violet-500">#{idx + 1}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {sortedTriples.length === 0 && (
              <p className="text-slate-600 italic py-2 text-center text-[11px]">Waiting for tokens...</p>
            )}
          </div>
        </div>

        {/* Stage 3: Inverted Postings Assembly */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>3. Inverted Postings Assembly</span>
            <span className="text-emerald-400 font-mono">{Object.keys(postingsMap).length} terms</span>
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            <AnimatePresence>
              {Object.entries(postingsMap).map(([term, positions]) => (
                <motion.div
                  key={term}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-[11px] font-mono text-emerald-300 flex items-center justify-between"
                >
                  <span className="font-bold">{term}</span>
                  <span className="text-[10px] text-emerald-500">Doc 1 &rarr; [{positions.join(', ')}]</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {Object.keys(postingsMap).length === 0 && (
              <p className="text-slate-600 italic py-2 text-center text-[11px]">Index dictionary empty</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
