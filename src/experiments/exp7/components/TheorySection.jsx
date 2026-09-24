import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronDown, ChevronUp, FlaskConical,
  Brain, Target, Layers, GitMerge, Search, Cpu, Zap, Sliders, BarChart2
} from 'lucide-react';

const THEORY_SECTIONS = [
  {
    id: 'overview',
    icon: Search,
    color: 'indigo',
    title: '1. Overview of Hybrid Information Retrieval',
    content: (
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          Information Retrieval (IR) systems retrieve relevant documents from vast unstructured text corpora. Modern state-of-the-art search engines combine two complementary paradigms into a single hybrid retrieval pipeline:
        </p>
        <div className="grid sm:grid-cols-2 gap-3.5 text-xs">
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center text-xs">1</span>
              <span className="font-bold text-amber-950 text-sm">Lexical BM25 (Okapi BM25)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Probabilistic keyword matching relying on exact term frequencies, document length penalties, and inverse document frequency. Excels at exact terminology, domain jargon, product IDs, acronyms, and rare entities.
            </p>
            <div className="pt-1 flex flex-wrap gap-1">
              <span className="px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-800 font-semibold text-[10px]">Exact Match</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-800 font-semibold text-[10px]">Zero Training</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-800 font-semibold text-[10px]">Low Latency</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs">2</span>
              <span className="font-bold text-purple-950 text-sm">Dense Semantic (Sentence Transformers)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Maps queries and documents into a continuous 384-dimensional latent embedding space. Overcomes the <em>vocabulary mismatch problem</em> by matching underlying conceptual meaning and semantic synonyms.
            </p>
            <div className="pt-1 flex flex-wrap gap-1">
              <span className="px-2 py-0.5 rounded-md bg-purple-100/70 text-purple-800 font-semibold text-[10px]">Synonymy Aware</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-100/70 text-purple-800 font-semibold text-[10px]">Contextual</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-100/70 text-purple-800 font-semibold text-[10px]">Cosine Similarity</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'bm25_formulation',
    icon: Cpu,
    color: 'amber',
    title: '2. Okapi BM25 Lexical Formulation & Hyperparameters',
    content: (
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          Okapi BM25 computes the relevance score of document <span className="font-serif italic font-bold">d</span> for query <span className="font-serif italic font-bold">q</span> across constituent query terms <span className="font-serif italic font-bold">t</span>:
        </p>

        {/* Clean Formatted Mathematical Card */}
        <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-md space-y-3">
          <div className="text-amber-400 font-bold text-xs uppercase tracking-wider">Okapi BM25 Scoring Function</div>
          
          <div className="py-2 text-center overflow-x-auto">
            <div className="inline-flex items-center gap-3 text-base sm:text-lg font-serif">
              <span className="font-bold text-amber-300">BM25(q, d)</span>
              <span>=</span>
              <span className="text-xl font-sans font-bold">∑</span>
              <span className="text-xs text-slate-400 -ml-2 self-end mb-1">t ∈ q</span>
              <span className="font-bold text-teal-300">IDF(t)</span>
              <span>·</span>
              <div className="inline-flex flex-col items-center">
                <span className="border-b border-slate-400 px-2 pb-0.5">
                  f(t, d) · (k<sub>1</sub> + 1)
                </span>
                <span className="pt-0.5 text-xs sm:text-sm text-slate-300">
                  f(t, d) + k<sub>1</sub> · (1 - b + b · <span className="text-amber-300">|d| / avgdl</span>)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-teal-400 font-semibold font-serif">IDF(t)</span> = ln( (N - DF(t) + 0.5) / (DF(t) + 0.5) + 1 )
            </div>
            <div>
              <span className="text-slate-300">N: Total Documents</span> | <span className="text-slate-300">DF(t): Document Frequency</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">⚡ Term Frequency Saturation (k<sub>1</sub> = 1.5)</span>
            <p className="text-slate-600 leading-relaxed">
              Controls non-linear term frequency scaling. As <span className="font-serif italic font-medium">f(t, d)</span> increases, the marginal score gain diminishes asymptotically, preventing repetitive keyword spam from inflating rankings.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">📏 Document Length Normalization (b = 0.75)</span>
            <p className="text-slate-600 leading-relaxed">
              Calibrates document length penalty relative to the average collection length (<span className="font-mono text-[11px]">avgdl</span>). When <span className="font-serif italic font-medium">b = 1.0</span>, full length normalization is applied.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'fusion_methods',
    icon: GitMerge,
    color: 'teal',
    title: '3. Score Normalization & Fusion Strategies',
    content: (
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          Because raw BM25 scores (<span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">0 to 35+</span>) and dense cosine similarity scores (<span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">-1.0 to 1.0</span>) occupy completely disparate numerical scales, calibration is essential:
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-sm space-y-2.5">
            <div className="text-teal-400 font-bold text-xs uppercase tracking-wider">Method A: Min-Max Convex Fusion</div>
            <div className="text-xs space-y-1.5 font-mono text-slate-300">
              <div className="text-slate-400">// Min-Max Normalization</div>
              <div className="text-amber-300">S<sub>norm</sub> = (S - S<sub>min</sub>) / (S<sub>max</sub> - S<sub>min</sub> + ε)</div>
              <div className="text-slate-400 pt-1">// Convex Combination (α ∈ [0, 1])</div>
              <div className="text-teal-300 font-bold">
                S<sub>hybrid</sub> = α · S<sub>BM25</sub> + (1 - α) · S<sub>dense</sub>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Allows smooth interpolative control between keyword fidelity (α = 1.0) and latent semantic concepts (α = 0.0).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-sm space-y-2.5">
            <div className="text-purple-400 font-bold text-xs uppercase tracking-wider">Method B: Reciprocal Rank Fusion (RRF)</div>
            <div className="text-xs space-y-1.5 font-mono text-slate-300">
              <div className="text-slate-400">// RRF Formulation (k = 60)</div>
              <div className="text-purple-300 font-bold">
                RRF(d) = ∑<sub>m ∈ &#123;BM25, Dense&#125;</sub> 1 / (60 + r<sub>m</sub>(d))
              </div>
              <div className="text-slate-400 pt-1">// Rank position invariance</div>
              <div className="text-emerald-300">r<sub>m</sub>(d): Rank of d in modality m</div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Robust scale-invariant fusion that relies strictly on ordinal rank positions rather than noisy raw score distributions.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'metrics',
    icon: BarChart2,
    color: 'violet',
    title: '4. Evaluation Metrics (Precision@K, Recall@K, F1@K, MRR@K)',
    content: (
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          Information retrieval systems are benchmarked against ground-truth relevance judgements using standard ranking metrics:
        </p>

        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-violet-50/80 border border-violet-200/80 space-y-1">
            <strong className="text-violet-950 font-bold text-sm block">Precision@K &amp; Recall@K</strong>
            <p className="text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800">Precision@K</span> = (|Retrieved relevant in Top-K| / K). Measures result purity.<br />
              <span className="font-semibold text-slate-800">Recall@K</span> = (|Retrieved relevant in Top-K| / |Total relevant|). Measures coverage.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
            <strong className="text-emerald-950 font-bold text-sm block">Mean Reciprocal Rank (MRR@K)</strong>
            <p className="text-slate-600 leading-relaxed">
              <span className="font-serif italic font-semibold text-slate-800">MRR</span> = (1 / rank<sub>first</sub>), where rank<sub>first</sub> is the index of the very first relevant document retrieved in the top-K list.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

const COLOR_MAP = {
  indigo: { bg: 'bg-indigo-600', light: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', btn: 'hover:bg-indigo-50' },
  teal:   { bg: 'bg-teal-600',   light: 'bg-teal-50 border-teal-200',   text: 'text-teal-700',   btn: 'hover:bg-teal-50' },
  violet: { bg: 'bg-violet-600', light: 'bg-violet-50 border-violet-200', text: 'text-violet-700', btn: 'hover:bg-violet-50' },
  amber:  { bg: 'bg-amber-500',  light: 'bg-amber-50 border-amber-200',  text: 'text-amber-700',  btn: 'hover:bg-amber-50' },
};

function AccordionSection({ section }) {
  const [open, setOpen] = useState(true);
  const Icon = section.icon;
  const colors = COLOR_MAP[section.color] || COLOR_MAP.indigo;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:border-slate-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-white hover:bg-slate-50/70 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${colors.light} border flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <span className="font-bold text-slate-800 text-sm sm:text-base">{section.title}</span>
        </div>
        <div className="text-slate-400">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 bg-slate-50/30">
              {section.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TheorySection({ onGoToLab }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-teal-50 border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-700 text-xs font-extrabold uppercase tracking-wider mb-2">
          <Brain className="w-4 h-4" />
          Semantic &amp; Hybrid Search Track · Experiment 7
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Hybrid Keyword and Semantic Retrieval
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
          Combine probabilistic keyword matching (Okapi BM25) with dense neural representation learning (SentenceTransformers) using score normalization, convex weighting α, and Reciprocal Rank Fusion.
        </p>
      </div>

      {/* Learning Objectives */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-600" />
          Learning Objectives
        </h2>
        <ul className="space-y-2">
          {[
            'Understand the mathematical formulations and trade-offs between Lexical BM25 and Dense Semantic Vector retrieval.',
            'Tune BM25 hyperparameters: term frequency saturation (k₁ = 1.5) and document length normalization (b = 0.75).',
            'Implement score normalization (Min-Max Scaling) and weighted convex fusion: S_hybrid = α · S_BM25 + (1 - α) · S_dense.',
            'Analyze rank transitions, document rank shifts, and Retrieval X-Ray score decompositions.',
            'Benchmark IR performance across Knowledge Graph and Information Retrieval documents using Precision@K, Recall@K, F1@K, MRR@K, and α sensitivity curves.',
          ].map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-600" />
          Core Foundations &amp; Formulations
        </h2>
        {THEORY_SECTIONS.map(s => <AccordionSection key={s.id} section={s} />)}
      </div>

      <div className="flex justify-center pt-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoToLab}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          <FlaskConical className="w-4 h-4" />
          Launch Interactive Retrieval Simulation
        </motion.button>
      </div>
    </div>
  );
}
