import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Sparkles, Filter, CheckCircle2, Sliders, ArrowRight } from 'lucide-react';
import { porterStem, wordNetLemmatize, inferWordNetPos, NLTK_ENGLISH_STOPWORDS } from '../../preprocessingEngine';

export default function TextPipelineFlowAnimation({ rawText = 'The quick brown foxes were jumping over 100 lazy dogs while studying NLP algorithms!' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [speed, setSpeed] = useState(1); // 0.5, 1, 2
  const [tokensHistory, setTokensHistory] = useState([]);

  // Extract raw words up to 10 for clean animation
  const rawWords = (rawText.trim().split(/\s+/).filter(Boolean)).slice(0, 10);

  const steps = rawWords.map((rawWord, idx) => {
    // 1. Lowercase & clean
    const cleaned = rawWord.toLowerCase().replace(/[^a-zA-Z\s]/g, '');
    const isNumberOrPunct = !cleaned;
    const isStop = !isNumberOrPunct && NLTK_ENGLISH_STOPWORDS.has(cleaned);
    const pos = isStop || isNumberOrPunct ? 'n' : inferWordNetPos(cleaned);
    const stem = isStop || isNumberOrPunct ? '' : porterStem(cleaned);
    const lemma = isStop || isNumberOrPunct ? '' : wordNetLemmatize(cleaned, pos);

    return {
      id: idx,
      raw: rawWord,
      cleaned,
      isNumberOrPunct,
      isStop,
      pos,
      stem,
      lemma
    };
  });

  useEffect(() => {
    let timer;
    if (isPlaying) {
      const delay = 1100 / speed;
      timer = setTimeout(() => {
        if (currentIdx < steps.length) {
          setTokensHistory(prev => [...prev, steps[currentIdx]]);
          setCurrentIdx(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentIdx, steps.length, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIdx(0);
    setTokensHistory([]);
  };

  const handleStep = () => {
    if (currentIdx < steps.length) {
      setTokensHistory(prev => [...prev, steps[currentIdx]]);
      setCurrentIdx(prev => prev + 1);
    }
  };

  const currentItem = steps[currentIdx - 1];

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-900/60 shadow-xl text-white space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/40 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Dynamic Pipeline Visualizer
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white mt-1">
            Raw Sentence &rarr; Noise Stripping &rarr; Stopword Filter &rarr; Lemmatization
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed Controls */}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            {isPlaying ? 'Pause' : currentIdx >= steps.length ? 'Replay' : 'Play Flow'}
          </button>

          <button
            onClick={handleStep}
            disabled={isPlaying || currentIdx >= steps.length}
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

      {/* Stream of Words Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Active Sentence Word Stream:</span>
          <span>{currentIdx} / {steps.length} words ingested</span>
        </div>

        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 min-h-[50px] items-center">
          {steps.map((item, idx) => {
            const isProcessed = idx < currentIdx;
            const isCurrent = idx === currentIdx - 1 && isPlaying;
            return (
              <motion.div
                key={item.id}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  opacity: isProcessed ? 1 : 0.4
                }}
                transition={{ duration: 0.2 }}
                className={`px-3 py-1 rounded-xl text-xs font-mono border transition ${
                  isCurrent
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-400/50'
                    : isProcessed
                    ? item.isStop
                      ? 'bg-rose-950/50 text-rose-400 border-rose-900/60 line-through'
                      : 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {item.raw}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4-Stage Live Transformation Cards */}
      <div className="grid sm:grid-cols-4 gap-3 text-xs">
        {/* Stage 1: Case Folded & Cleaned */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>1. Noise Strip &amp; Fold</span>
            <span className="text-indigo-400 font-mono">Regex</span>
          </div>
          <div className="min-h-[36px] flex items-center">
            {currentItem ? (
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/60 px-2 py-1 rounded-lg border border-indigo-800/60"
              >
                {currentItem.cleaned || '[STRIPPED]'}
              </motion.div>
            ) : (
              <span className="text-slate-600 italic">Waiting for token</span>
            )}
          </div>
        </div>

        {/* Stage 2: Stopword Filter */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>2. Stopword Filter</span>
            <span className="text-violet-400 font-mono">179 Words</span>
          </div>
          <div className="min-h-[36px] flex items-center">
            {currentItem ? (
              currentItem.isStop ? (
                <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/50 px-2 py-1 rounded-lg border border-rose-900/60 line-through">
                  {currentItem.cleaned} (Removed)
                </span>
              ) : currentItem.isNumberOrPunct ? (
                <span className="font-mono text-xs text-slate-500 italic">Non-alpha filtered</span>
              ) : (
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-900/60">
                  {currentItem.cleaned} &check; Kept
                </span>
              )
            ) : (
              <span className="text-slate-600 italic">Waiting for token</span>
            )}
          </div>
        </div>

        {/* Stage 3: Porter Stemmer */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>3. Porter Stem</span>
            <span className="text-amber-400 font-mono">Heuristic</span>
          </div>
          <div className="min-h-[36px] flex items-center">
            {currentItem && !currentItem.isStop && !currentItem.isNumberOrPunct ? (
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-mono text-xs font-bold text-amber-300 bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-900/60"
              >
                {currentItem.stem}
              </motion.div>
            ) : (
              <span className="text-slate-600 italic">-</span>
            )}
          </div>
        </div>

        {/* Stage 4: WordNet Lemmatizer */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>4. WordNet Lemma</span>
            <span className="text-emerald-400 font-mono">POS Lookup</span>
          </div>
          <div className="min-h-[36px] flex items-center">
            {currentItem && !currentItem.isStop && !currentItem.isNumberOrPunct ? (
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-mono text-xs font-bold text-emerald-300 bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-900/60"
              >
                {currentItem.lemma} <span className="text-[9px] text-emerald-500 font-normal">({currentItem.pos})</span>
              </motion.div>
            ) : (
              <span className="text-slate-600 italic">-</span>
            )}
          </div>
        </div>
      </div>

      {/* Emitted Tokens History Line */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
          Normalized Stream:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {tokensHistory
            .filter(t => !t.isStop && !t.isNumberOrPunct)
            .map((item, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold"
              >
                {item.lemma}
              </motion.span>
            ))}
          {tokensHistory.filter(t => !t.isStop && !t.isNumberOrPunct).length === 0 && (
            <span className="text-xs text-slate-600 italic">No normalized tokens emitted yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
