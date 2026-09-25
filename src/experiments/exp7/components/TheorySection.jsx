import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, ArrowRight,
  GitMerge, Cpu, Brain, Layers, ExternalLink, HelpCircle
} from 'lucide-react';

export default function TheorySection({ onGoToLab }) {
  const objectives = [
    'Implement and analyze Okapi BM25 term weighting with sublinear saturation (k₁) and length normalization (b).',
    'Generate 384-D dense embeddings using all-MiniLM-L6-v2 to evaluate cosine semantic proximity.',
    'Formulate Min-Max calibrated Convex Score Fusion: S_hybrid = α · S_BM25 + (1 - α) · S_dense.',
    'Apply Reciprocal Rank Fusion (RRF) to combine disparate ranking lists without raw score calibration.'
  ];

  const comparison = [
    {
      approach: 'Pure Lexical (BM25)',
      mechanism: 'Term frequency saturation + inverse document frequency',
      scoring: 'Unbounded positive scores (0 to 35+)',
      bestFor: 'Exact keywords, product codes, rare technical terminology'
    },
    {
      approach: 'Pure Dense (Semantic)',
      mechanism: 'Cosine angle over 384-D sentence embeddings',
      scoring: 'Bounded cosine similarity [-1.0, 1.0]',
      bestFor: 'Paraphrasing, conceptual synonymy, semantic discovery'
    },
    {
      approach: 'Convex Score Fusion',
      mechanism: 'Linear interpolation after Min-Max score scaling',
      scoring: 'Calibrated score in [0.0, 1.0]',
      bestFor: 'Fine-grained tuning between keyword and semantic recall'
    },
    {
      approach: 'Reciprocal Rank Fusion (RRF)',
      mechanism: 'Rank-based scoring: ∑ 1 / (60 + rank_i)',
      scoring: 'Scale-invariant sum of reciprocal ranks',
      bestFor: 'Production search engines combining diverse retrieval backends'
    }
  ];

  const procedureSteps = [
    'Step 1: Review the mathematical formulation of Okapi BM25, dense embeddings, Convex Fusion, and Reciprocal Rank Fusion.',
    'Step 2: Navigate to the Simulation Lab tab in the experiment navigation bar.',
    'Step 3: Select an educational document corpus or author custom test records and queries.',
    'Step 4: Execute head-to-head retrieval comparing standalone BM25 and standalone Dense Semantic search.',
    'Step 5: Adjust the hybrid weighting parameter α (from 0.0 dense to 1.0 lexical) and observe ranking transitions.',
    'Step 6: Toggle Reciprocal Rank Fusion (RRF) to evaluate score-independent rank aggregation.',
    'Step 7: Record experimental trials in the session log book, complete the concept assessment Quiz, and generate your verified certificate and lab report.'
  ];

  const keyTerms = [
    { term: 'Hybrid Search', def: 'An IR architecture combining sparse lexical term matching with dense semantic embeddings into a unified ranking pipeline.' },
    { term: 'Okapi BM25', def: 'A probabilistic ranking function incorporating sublinear term frequency saturation (k₁) and document length normalization (b).' },
    { term: 'Convex Combination (α)', def: 'Linear interpolation S_hybrid = α · S_BM25 + (1 - α) · S_dense, where α balances keyword fidelity against semantic abstraction.' },
    { term: 'Reciprocal Rank Fusion (RRF)', def: 'A robust rank-aggregation algorithm summing 1/(k + rank) across multiple rankers, requiring zero score normalization.' },
    { term: 'Min-Max Normalization', def: 'Rescaling raw scores to [0, 1] via (S - S_min) / (S_max - S_min) so disparate score distributions can be blended.' },
    { term: 'Cross-Encoder Re-Ranking', def: 'A secondary neural model taking (query, document) pairs as joint input to produce ultra-high precision final re-rankings.' }
  ];

  const references = [
    {
      authors: 'Cormack, G. V., Clarke, C. L., & Buettcher, S. (2009)',
      title: 'Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods',
      details: 'SIGIR 2009. Introduced Reciprocal Rank Fusion (RRF) for production multi-index retrieval.',
      url: 'https://dl.acm.org/doi/10.1145/1571941.1572114'
    },
    {
      authors: 'Robertson, S., & Zaragoza, H. (2009)',
      title: 'The Probabilistic Relevance Framework: BM25 and Beyond',
      details: 'Foundations and Trends in Information Retrieval, 3(4), 333-389.',
      url: 'https://www.nowpublishers.com/article/Details/INR-019'
    },
    {
      authors: 'Karpukhin, V., Oğuz, B., Min, S., et al. (2020)',
      title: 'Dense Passage Retrieval for Open-Domain Question Answering',
      details: 'EMNLP 2020. Introduced dual-encoder dense retrieval frameworks.',
      url: 'https://arxiv.org/abs/2004.04906'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800">
      {/* ── 1. Hero Banner ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm relative overflow-hidden space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 text-xs font-bold tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
          Experiment 7 &bull; Hybrid Information Retrieval
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Hybrid Search Pipeline: BM25 &amp; Dense Semantic Retrieval
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          Combine the high precision of lexical Okapi BM25 keyword matching with the broad conceptual recall of 384-dimensional dense semantic embeddings. Blend disparate score distributions using Min-Max Convex Fusion and Reciprocal Rank Fusion (RRF) to eliminate vocabulary mismatch without sacrificing technical entity precision.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToLab}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-200 cursor-pointer transition active:scale-95"
          >
            Launch Simulation Lab <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. Learning Objectives ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Learning Objectives
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {objectives.map((obj, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{obj}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Foundational Theoretical Framework ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Foundational Theoretical Framework
        </h2>

        {/* Dual Engine Paradigm */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
            <h3 className="font-bold text-amber-950 text-xs sm:text-sm">1. Lexical BM25 (Okapi BM25)</h3>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Probabilistic keyword matching relying on exact term frequencies, document length penalties, and inverse document frequency. Excels at exact terminology, domain jargon, product IDs, acronyms, and rare entities.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/70 space-y-1.5">
            <h3 className="font-bold text-purple-950 text-xs sm:text-sm">2. Dense Semantic Embeddings</h3>
            <p className="text-xs text-purple-900/80 leading-relaxed">
              Maps queries and documents into a continuous 384-dimensional latent embedding space using transformers. Overcomes vocabulary mismatch by matching conceptual intent and semantic synonyms.
            </p>
          </div>
        </div>

        {/* Mathematical Formulations Card */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-inner">
            <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider block">
              Convex Score Fusion (α-weighted)
            </span>
            <div className="p-2.5 bg-slate-800 rounded-lg font-mono text-xs text-center text-teal-300 font-bold">
              S_hybrid = α · S_BM25 + (1 - α) · S_dense
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Raw scores are first normalized to [0, 1] via Min-Max scaling. Parameter α smoothly interpolates between pure lexical (α = 1.0) and pure semantic (α = 0.0) search.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-inner">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
              Reciprocal Rank Fusion (RRF)
            </span>
            <div className="p-2.5 bg-slate-800 rounded-lg font-mono text-xs text-center text-amber-300 font-bold">
              RRF(d) = ∑ [ 1 / (k + rank_m(d)) ]
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Operates purely on ordinal document ranks across retrieval models, completely bypassing incompatible score distributions and calibration issues (standard constant k = 60).
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. Technical Comparison Matrix ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Technical Comparison Matrix
        </h2>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Approach</th>
                <th className="p-2.5">Underlying Mechanism</th>
                <th className="p-2.5">Score Range &amp; Scale</th>
                <th className="p-2.5">Optimal Production Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {comparison.map(r => (
                <tr key={r.approach} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-900">{r.approach}</td>
                  <td className="p-2.5">{r.mechanism}</td>
                  <td className="p-2.5 font-mono text-teal-800 bg-teal-50/30">{r.scoring}</td>
                  <td className="p-2.5">{r.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Laboratory Procedure ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Laboratory Procedure
        </h2>
        <div className="space-y-2.5 pt-1">
          {procedureSteps.map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Key Terminology & Definitions ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Key Terminology &amp; Definitions
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {keyTerms.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-teal-900">{item.term}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.def}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. References & Further Reading ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          References &amp; Further Reading
        </h2>
        <div className="space-y-3 pt-1">
          {references.map((ref, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <div className="text-xs sm:text-sm font-semibold text-slate-800">
                {ref.authors} &mdash; <span className="font-bold text-teal-700">{ref.title}</span>
              </div>
              <div className="text-xs text-slate-500 italic">{ref.details}</div>
              {ref.url && (
                <div className="text-[11px] text-blue-600 font-mono pt-0.5">
                  <a href={ref.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                    {ref.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
