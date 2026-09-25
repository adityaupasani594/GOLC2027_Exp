import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Sparkles, Check, ArrowRight, GitMerge, Cpu } from 'lucide-react';

export default function TwoPointerMergeAnimation({
  term1 = 'information',
  term2 = 'retrieval',
  list1 = [1, 2, 4, 5, 8],
  list2 = [2, 3, 4, 6, 8]
}) {
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [history, setHistory] = useState([]);
  const [matchedDocs, setMatchedDocs] = useState([]);

  const isComplete = p1 >= list1.length || p2 >= list2.length;
  const currentD1 = list1[p1];
  const currentD2 = list2[p2];

  // Perform one step
  const stepForward = () => {
    if (p1 >= list1.length || p2 >= list2.length) {
      setIsPlaying(false);
      return;
    }

    const d1 = list1[p1];
    const d2 = list2[p2];

    if (d1 === d2) {
      setMatchedDocs(prev => [...new Set([...prev, d1])]);
      setHistory(prev => [
        ...prev,
        {
          step: prev.length + 1,
          type: 'match',
          desc: `Doc ${d1} == Doc ${d2} → MATCH! Added Doc ${d1} to intersected results. Both pointers advanced.`
        }
      ]);
      setP1(prev => prev + 1);
      setP2(prev => prev + 1);
    } else if (d1 < d2) {
      setHistory(prev => [
        ...prev,
        {
          step: prev.length + 1,
          type: 'p1',
          desc: `Doc ${d1} < Doc ${d2} → Pointer p₁ advances.`
        }
      ]);
      setP1(prev => prev + 1);
    } else {
      setHistory(prev => [
        ...prev,
        {
          step: prev.length + 1,
          type: 'p2',
          desc: `Doc ${d1} > Doc ${d2} → Pointer p₂ advances.`
        }
      ]);
      setP2(prev => prev + 1);
    }
  };

  useEffect(() => {
    let timer;
    if (isPlaying && !isComplete) {
      const delay = 1000 / speed;
      timer = setTimeout(() => {
        stepForward();
      }, delay);
    } else if (isComplete) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, isComplete, p1, p2, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setP1(0);
    setP2(0);
    setHistory([]);
    setMatchedDocs([]);
  };

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-900/60 shadow-xl text-white space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/50 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
            <Cpu className="w-3 h-3 text-emerald-400" />
            Two-Pointer Linear Intersection Duel
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white mt-1">
            Conjunctive Boolean Query: &lsquo;{term1}&rsquo; AND &lsquo;{term2}&rsquo; ($O(L_1 + L_2)$)
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            {isPlaying ? 'Pause' : isComplete ? 'Replay' : 'Play Duel'}
          </button>

          <button
            onClick={stepForward}
            disabled={isPlaying || isComplete}
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

      {/* Duel Visualization Track */}
      <div className="space-y-4">
        {/* List 1 with Pointer 1 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">
              Pointer <strong className="text-indigo-400 font-bold">p₁</strong> &rarr; Postings for &lsquo;{term1}&rsquo; (Index {p1})
            </span>
            <span className="text-[11px] text-slate-500">{list1.length} docs</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 min-h-[58px]">
            {list1.map((docId, idx) => {
              const isActive = idx === p1;
              const isPast = idx < p1;
              const isMatched = matchedDocs.includes(docId);

              return (
                <div key={docId} className="flex flex-col items-center">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -2 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/60 shadow-lg'
                        : isMatched
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700'
                        : isPast
                        ? 'bg-slate-900/60 text-slate-500 border-slate-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Doc {docId}
                  </motion.div>
                  {isActive && (
                    <motion.span
                      layoutId="p1-arrow"
                      className="text-[10px] text-indigo-400 font-bold mt-1"
                    >
                      ▲ p₁
                    </motion.span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* List 2 with Pointer 2 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">
              Pointer <strong className="text-violet-400 font-bold">p₂</strong> &rarr; Postings for &lsquo;{term2}&rsquo; (Index {p2})
            </span>
            <span className="text-[11px] text-slate-500">{list2.length} docs</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 min-h-[58px]">
            {list2.map((docId, idx) => {
              const isActive = idx === p2;
              const isPast = idx < p2;
              const isMatched = matchedDocs.includes(docId);

              return (
                <div key={docId} className="flex flex-col items-center">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -2 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition ${
                      isActive
                        ? 'bg-violet-600 text-white border-violet-400 ring-2 ring-violet-400/60 shadow-lg'
                        : isMatched
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700'
                        : isPast
                        ? 'bg-slate-900/60 text-slate-500 border-slate-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Doc {docId}
                  </motion.div>
                  {isActive && (
                    <motion.span
                      layoutId="p2-arrow"
                      className="text-[10px] text-violet-400 font-bold mt-1"
                    >
                      ▲ p₂
                    </motion.span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Accumulator & Step Log */}
      <div className="grid md:grid-cols-2 gap-3 text-xs">
        {/* Results Accumulator */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Intersected Result Accumulator</span>
            <span className="text-emerald-400 font-mono">{matchedDocs.length} matches</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap min-h-[44px]">
            <AnimatePresence>
              {matchedDocs.map(d => (
                <motion.div
                  key={d}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Doc {d}
                </motion.div>
              ))}
            </AnimatePresence>
            {matchedDocs.length === 0 && (
              <span className="text-slate-600 italic">No matches accumulated yet</span>
            )}
          </div>
        </div>

        {/* Live Comparison Trace */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Traversal Duel Trace Log</span>
            <span className="text-indigo-400 font-mono">{history.length} steps</span>
          </div>

          <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[11px] pr-1">
            {history.slice(-3).map((h, i) => (
              <div
                key={i}
                className={`p-1 rounded ${
                  h.type === 'match' ? 'text-emerald-400 bg-emerald-950/30' : 'text-slate-400'
                }`}
              >
                &gt; {h.desc}
              </div>
            ))}
            {history.length === 0 && (
              <span className="text-slate-600 italic">Click Play to start the duel</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
