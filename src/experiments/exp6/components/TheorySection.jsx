import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, ArrowRight,
  Brain, Target, Zap, Layers, ExternalLink, HelpCircle
} from 'lucide-react';

export default function TheorySection({ onGoToLab }) {
  const objectives = [
    'Encode documents and queries into 384-dimensional dense vectors using the all-MiniLM-L6-v2 sentence-transformer.',
    'Compute L2-normalized cosine similarity to rank documents without exact keyword match requirements.',
    'Visualize high-dimensional embedding spaces using 2D Principal Component Analysis (PCA) projections.',
    'Evaluate retrieval effectiveness using Precision@K, Recall@K, F1@K, and Mean Reciprocal Rank (MRR).'
  ];

  const comparison = [
    {
      feature: 'Representation',
      lexical: 'High-dimensional sparse bag-of-words (|V| ≈ 50,000)',
      dense: 'Dense fixed-length vectors (d = 384 dimensions)'
    },
    {
      feature: 'Vocabulary Mismatch',
      lexical: 'Vulnerable (e.g. misses "footwear" when query is "shoes")',
      dense: 'Robust (encodes semantic synonymy and paraphrasing)'
    },
    {
      feature: 'Exact Keyword Matching',
      lexical: 'Superior for rare IDs, codes, and exact technical entities',
      dense: 'May dilute exact keyword signals under dense projection'
    },
    {
      feature: 'Computational Footprint',
      lexical: 'Extremely fast CPU inverted index pointer traversal',
      dense: 'Requires neural inference or ANN vector indices (HNSW, FAISS)'
    },
    {
      feature: 'Similarity Metric',
      lexical: 'BM25 probabilistic saturation score',
      dense: 'Normalized Cosine Similarity cos(q, d) ∈ [-1, 1]'
    }
  ];

  const procedureSteps = [
    'Step 1: Review the theoretical distinction between sparse lexical matching and dense neural vector representations.',
    'Step 2: Navigate to the Simulation Lab tab in the experiment navigation bar.',
    'Step 3: Select an educational domain corpus (Computer Science, AI, Database Systems) or author custom test documents.',
    'Step 4: Execute sentence-transformer encoding to generate 384-dimensional embedding unit vectors for the corpus.',
    'Step 5: Enter user queries to calculate runtime cosine similarity rankings and observe semantic vs exact match behavior.',
    'Step 6: Inspect 2D PCA vector projections, adjust Top-K and similarity score thresholds, and record trial parameters.',
    'Step 7: Complete the concept assessment Quiz, review feedback, and generate your verified certificate and lab report.'
  ];

  const keyTerms = [
    { term: 'Dense Embedding', def: 'A low-dimensional, continuous floating-point vector (e.g. 384-D) where geometric proximity correlates directly with semantic meaning.' },
    { term: 'Sentence-Transformers', def: 'Neural transformer architectures (like all-MiniLM-L6-v2) fine-tuned via siamese networks to produce semantically meaningful sentence embeddings.' },
    { term: 'Vocabulary Mismatch', def: 'The failure of keyword search systems when a query and relevant document use synonymous words without literal string overlap.' },
    { term: 'Cosine Similarity', def: 'The inner dot product of two L2-normalized vectors evaluating their directional angle θ, bounded between -1.0 and +1.0.' },
    { term: 'Top-K Retrieval', def: 'Returning the K documents with highest cosine similarity scores, independent of vector dimensionality.' },
    { term: 'Principal Component Analysis (PCA)', def: 'Linear dimensionality reduction projecting 384-D vector manifolds down to 2D coordinates while preserving maximal variance.' },
    { term: 'Mean Reciprocal Rank (MRR)', def: 'The average of reciprocal ranks (1/rank) of the first relevant document across a benchmark query set.' }
  ];

  const references = [
    {
      authors: 'Reimers, N., & Gurevych, I. (2019)',
      title: 'Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks',
      details: 'EMNLP 2019. Seminal paper establishing dense sentence embeddings for semantic search.',
      url: 'https://arxiv.org/abs/1908.10084'
    },
    {
      authors: 'Wang, W., Wei, F., Dong, L., et al. (2020)',
      title: 'MiniLM: Deep Self-Attention Distillation for Task-Agnostic Compression',
      details: 'NeurIPS 2020. Introduced distilled 6-layer MiniLM architectures.',
      url: 'https://arxiv.org/abs/2002.10957'
    },
    {
      authors: 'Manning, C. D., Raghavan, P., & Schütze, H. (2008)',
      title: 'Introduction to Information Retrieval',
      details: 'Cambridge University Press. Vector space scoring and evaluation metrics.',
      url: 'https://nlp.stanford.edu/IR-book/'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800">
      {/* ── 1. Hero Banner ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm relative overflow-hidden space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200/60 text-violet-700 text-xs font-bold tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5 text-violet-600" />
          Experiment 6 &bull; Neural Information Retrieval
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Dense Embedding-Based Semantic Search
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          Convert natural language text into 384-dimensional dense vectors using the <code className="bg-violet-100 text-violet-900 px-1.5 py-0.5 rounded font-mono text-xs">all-MiniLM-L6-v2</code> sentence transformer. Perform nearest-neighbor vector search via cosine similarity to solve the vocabulary mismatch problem and retrieve semantically synonymous documents without exact keyword overlap.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToLab}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-200 cursor-pointer transition active:scale-95"
          >
            Launch Simulation Lab <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. Learning Objectives ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-violet-600 rounded-full" />
          Learning Objectives
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {objectives.map((obj, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-violet-50 text-violet-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
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
          <span className="w-2 h-5 bg-violet-600 rounded-full" />
          Foundational Theoretical Framework
        </h2>

        {/* Semantic Search vs Lexical Search */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-1.5">
            <h3 className="font-bold text-orange-950 text-xs sm:text-sm">Lexical Keyword Search (BM25)</h3>
            <p className="text-xs text-orange-900/80 leading-relaxed">
              Matches exact word tokens. A query for <em>"comfortable shoes for running"</em> misses a relevant document describing <em>"lightweight athletic footwear for jogging"</em> due to vocabulary mismatch.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-violet-200 bg-violet-50/70 space-y-1.5">
            <h3 className="font-bold text-violet-950 text-xs sm:text-sm">Dense Semantic Search (Embeddings)</h3>
            <p className="text-xs text-violet-900/80 leading-relaxed">
              Encodes text into continuous dense vectors where synonyms map to proximal coordinates, successfully retrieving paraphrased content with zero verbatim word overlap.
            </p>
          </div>
        </div>

        {/* Model Specs Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
            <Zap className="w-4 h-4" />
            Dense Embeddings &amp; all-MiniLM-L6-v2 Architecture
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">all-MiniLM-L6-v2</code> sentence transformer is a distilled 6-layer BERT architecture trained on over 1 billion sentence pairs using contrastive loss. It maps variable-length natural language passages to <strong>384-dimensional</strong> unit vectors:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Dimensions</span>
              <strong className="text-violet-700">384</strong>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Layers</span>
              <strong className="text-slate-900">6 Attention</strong>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Similarity</span>
              <strong className="text-emerald-700">Cosine cos(θ)</strong>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Max Tokens</span>
              <strong className="text-indigo-700">256</strong>
            </div>
          </div>
        </div>

        {/* Cosine Similarity Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
            <Target className="w-4 h-4" />
            Cosine Similarity &amp; Top-K Retrieval
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Because embedding vectors are normalized to unit Euclidean length (||A|| = ||B|| = 1), cosine similarity equals the inner dot product:
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-center text-violet-900 font-bold">
            cos(θ) = (A · B) / (||A|| · ||B||) = A · B ∈ [-1.0, +1.0]
          </div>
        </div>
      </div>

      {/* ── 4. Technical Comparison Matrix ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-violet-600 rounded-full" />
          Technical Comparison Matrix
        </h2>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Feature</th>
                <th className="p-2.5">Lexical Search (BM25)</th>
                <th className="p-2.5">Dense Semantic Search</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {comparison.map(r => (
                <tr key={r.feature} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-900">{r.feature}</td>
                  <td className="p-2.5">{r.lexical}</td>
                  <td className="p-2.5 font-semibold text-violet-800 bg-violet-50/40">{r.dense}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Laboratory Procedure ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-violet-600 rounded-full" />
          Laboratory Procedure
        </h2>
        <div className="space-y-2.5 pt-1">
          {procedureSteps.map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-violet-50 text-violet-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
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
          <span className="w-2 h-5 bg-violet-600 rounded-full" />
          Key Terminology &amp; Definitions
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {keyTerms.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-violet-900">{item.term}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.def}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. References & Further Reading ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-violet-600 rounded-full" />
          References &amp; Further Reading
        </h2>
        <div className="space-y-3 pt-1">
          {references.map((ref, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <div className="text-xs sm:text-sm font-semibold text-slate-800">
                {ref.authors} &mdash; <span className="font-bold text-violet-700">{ref.title}</span>
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
