import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, XCircle, Sliders, Check } from 'lucide-react';
import { porterStem, wordNetLemmatize, inferWordNetPos } from '../../preprocessingEngine';

const BENCHMARK_PAIRS = [
  { word: 'studies', pos: 'v', posLabel: 'Verb', stemRule: "Drop 'ies', replace with 'i'", lemmaRule: "Lexicon morphological lookup: 'study'" },
  { word: 'better', pos: 'a', posLabel: 'Adjective', stemRule: 'No suffix match → kept as better', lemmaRule: "Irregular comparative → canonical 'good'" },
  { word: 'running', pos: 'v', posLabel: 'Verb', stemRule: "Drop 'ing', remove double 'n' → run", lemmaRule: "Participle suffix strip → base verb 'run'" },
  { word: 'mice', pos: 'n', posLabel: 'Noun', stemRule: 'No plural rule matches → kept as mice', lemmaRule: "Irregular plural lookup → singular 'mouse'" },
  { word: 'meeting', pos: 'v', posLabel: 'Verb (POS=v)', stemRule: "Drop 'ing' → meet", lemmaRule: "Verb lookup (POS=v) → 'meet'" },
  { word: 'foxes', pos: 'n', posLabel: 'Noun', stemRule: "Drop 'es' → fox", lemmaRule: "Regular plural sibilant strip → 'fox'" }
];

export default function StemVsLemmaDuelAnimation() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeItem = BENCHMARK_PAIRS[selectedIdx];

  const stemResult = porterStem(activeItem.word);
  const lemmaResult = wordNetLemmatize(activeItem.word, activeItem.pos);

  // Is stem a real dictionary word?
  const isStemValid = ['run', 'better', 'meet', 'fox', 'mice'].includes(stemResult);

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-900/60 shadow-xl text-white space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/40 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-violet-400" />
            Morphological Duel Visualizer
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white mt-1">
            Heuristic Suffix Truncation (Stemming) vs. Lexical Morphological Lookup (Lemmatization)
          </h3>
        </div>

        {/* Word Selectors */}
        <div className="flex flex-wrap gap-1.5">
          {BENCHMARK_PAIRS.map((item, idx) => (
            <button
              key={item.word}
              onClick={() => setSelectedIdx(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {item.word}
            </button>
          ))}
        </div>
      </div>

      {/* Central Duel Display */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Porter Stemmer Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              Porter Stemmer (Rule-Based)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              O(1) Heuristic Rules
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Input Token</span>
              <span className="text-base font-bold font-mono text-slate-200">{activeItem.word}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Stemmed Output</span>
              <motion.span
                key={stemResult}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-lg font-black font-mono text-amber-400"
              >
                {stemResult}
              </motion.span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="text-slate-400 flex items-start gap-1.5">
              <span className="font-bold text-amber-400">&bull;</span>
              <span>Rule Executed: <code className="font-mono text-slate-300">{activeItem.stemRule}</code></span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {isStemValid ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid English word
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                  <XCircle className="w-3.5 h-3.5" /> Over-stemmed non-word (e.g. studi)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* WordNet Lemmatizer Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
              WordNet Lemmatizer (Morphological)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Lexicon &amp; POS Guided
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Input + POS ({activeItem.posLabel})</span>
              <span className="text-base font-bold font-mono text-slate-200">{activeItem.word}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-500" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Canonical Lemma</span>
              <motion.span
                key={lemmaResult}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-lg font-black font-mono text-emerald-400"
              >
                {lemmaResult}
              </motion.span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="text-slate-400 flex items-start gap-1.5">
              <span className="font-bold text-emerald-400">&bull;</span>
              <span>Morphological Analysis: <code className="font-mono text-slate-300">{activeItem.lemmaRule}</code></span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Always valid dictionary lemma
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
