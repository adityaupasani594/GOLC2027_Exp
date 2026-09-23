import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronDown, ChevronUp, FlaskConical,
  Zap, Brain, Target, AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react';

const THEORY_SECTIONS = [
  {
    id: 'what',
    icon: Brain,
    color: 'indigo',
    title: 'What Is Dense Semantic Search?',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed text-sm">
          <strong>Dense semantic search</strong> converts both documents and queries into fixed-length numerical
          vectors (embeddings) using a pretrained neural transformer model. Retrieval then becomes a
          <em> vector similarity problem</em> — the system ranks documents by how closely their vectors
          align with the query vector in a high-dimensional space.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
            <div className="flex items-center gap-2 mb-2 font-bold text-orange-700 text-sm">
              <XCircle className="w-4 h-4" /> Keyword Search (Lexical)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Matches on exact words. Query <em>"comfortable shoes for running"</em> misses
              <em>"lightweight athletic footwear for jogging"</em> — a vocabulary mismatch.
            </p>
            <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Vocabulary Mismatch</div>
          </div>
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <div className="flex items-center gap-2 mb-2 font-bold text-indigo-700 text-sm">
              <CheckCircle2 className="w-4 h-4" /> Dense Semantic Search
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Encodes text into 384-D dense vectors and measures cosine proximity. Successfully retrieves
              synonymous and paraphrased content even without exact keyword overlap.
            </p>
            <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Semantic Alignment</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'embedding',
    icon: Zap,
    color: 'violet',
    title: 'Dense Embeddings & the all-MiniLM-L6-v2 Model',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed text-sm">
          An <strong>embedding</strong> converts text into a fixed-length numerical vector capturing semantic
          meaning. This experiment uses <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">all-MiniLM-L6-v2</code> —
          a distilled transformer with 6 attention layers producing <strong>384-dimensional</strong> unit vectors.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-violet-600 text-white">
                <th className="px-3 py-2 text-left font-semibold">Property</th>
                <th className="px-3 py-2 text-left font-semibold">Value</th>
                <th className="px-3 py-2 text-left font-semibold">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['Architecture', 'MiniLM (Distilled BERT)', '6 Transformer layers'],
                ['Output Dimension', '384', 'Each text → 384 floating-point values'],
                ['Training Data', '1B+ sentence pairs', 'Maximises cosine sim for related pairs'],
                ['Similarity Metric', 'Cosine Similarity', 'Normalised dot product cos(θ)'],
                ['Library', 'sentence-transformers', 'Open-source, state-of-the-art'],
              ].map(([p, v, n], i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-3 py-2 font-medium text-slate-700">{p}</td>
                  <td className="px-3 py-2 font-mono text-violet-700 font-bold">{v}</td>
                  <td className="px-3 py-2 text-slate-500">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-800">
          <strong>Key Concept:</strong> Individual dimensions do not have isolated human-readable labels.
          Semantic meaning emerges from the <em>collective pattern across all 384 dimensions</em>.
        </div>
      </div>
    ),
  },
  {
    id: 'cosine',
    icon: Target,
    color: 'rose',
    title: 'Cosine Similarity & Top-K Retrieval',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed text-sm">
          Cosine similarity measures the <strong>angle</strong> between two vectors:
        </p>
        <div className="bg-slate-900 text-emerald-400 rounded-xl p-4 text-center font-mono text-sm">
          sim(A, B) = (A · B) / (‖A‖ · ‖B‖) = cos(θ)
        </div>
        <p className="text-xs text-slate-600">
          Because embeddings are pre-normalised to unit length (‖A‖ = ‖B‖ = 1), cosine similarity
          simplifies to the <strong>dot product</strong>: sim(A, B) = A · B
        </p>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          {[
            { val: '+1.0', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Identical direction (Max Similarity)' },
            { val: '≈ 0.0', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Orthogonal (No Semantic Correlation)' },
            { val: '−1.0', color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Opposite direction (Negative Corr.)' },
          ].map(({ val, color, bg, label }) => (
            <div key={val} className={`p-3 rounded-xl border ${bg}`}>
              <div className={`text-2xl font-black ${color}`}>{val}</div>
              <div className="mt-1 text-slate-600">{label}</div>
            </div>
          ))}
        </div>
        <p className="text-slate-700 text-sm">
          <strong>Top-K Retrieval</strong> selects the K highest-scoring documents after ranking by
          descending similarity. Note: K is the <em>number of returned results</em>, completely
          independent of the 384 embedding dimensions.
        </p>
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <strong>⚠ Important Distinction:</strong> Top-K = count of retrieved search results (e.g. K=5).
          384 = the size of each embedding vector. They are entirely independent.
        </div>
      </div>
    ),
  },
  {
    id: 'pipeline',
    icon: FlaskConical,
    color: 'teal',
    title: '5-Stage Semantic Search Pipeline',
    content: (
      <div className="space-y-4">
        <div className="space-y-2">
          {[
            { stage: 1, name: 'Document Collection', desc: 'A corpus of documents is assembled from structured domains (CS topics in this lab).', color: 'indigo' },
            { stage: 2, name: 'Offline Embedding (Indexing)', desc: 'Each document is passed through all-MiniLM-L6-v2 once to produce a 384-D unit vector. These are stored as the vector index.', color: 'violet' },
            { stage: 3, name: 'Query Encoding (Online)', desc: 'At query time, the user\'s text is encoded with the same model into a 384-D query vector.', color: 'rose' },
            { stage: 4, name: 'Cosine Similarity Scoring', desc: 'The query vector is dot-multiplied against every document vector simultaneously (O(N·D) where N = documents, D = 384).', color: 'amber' },
            { stage: 5, name: 'Top-K Ranking & Return', desc: 'Documents are sorted by descending similarity score. The top-K above a threshold are returned.', color: 'teal' },
          ].map(({ stage, name, desc, color }) => (
            <div key={stage} className={`flex gap-3 p-3 rounded-xl bg-${color}-50 border border-${color}-100`}>
              <div className={`w-7 h-7 rounded-lg bg-${color}-600 text-white flex items-center justify-center text-xs font-black shrink-0`}>
                {stage}
              </div>
              <div>
                <div className={`text-sm font-bold text-${color}-800`}>{name}</div>
                <div className="text-xs text-slate-600 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'limitations',
    icon: AlertTriangle,
    color: 'red',
    title: 'Limitations & Trade-offs',
    content: (
      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
          <div className="font-bold text-red-700 text-sm mb-2">⚠ Critical Practical Constraints</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              ['Computational Cost', 'Dense embedding for large corpora requires GPU acceleration; far heavier than BM25/TF-IDF.'],
              ['Model Dependence', 'Retrieval quality is strongly tied to the embedding model\'s training data and domain alignment.'],
              ['Semantic Ambiguity', 'Polysemous words or negated phrases can produce spuriously high similarity scores.'],
              ['Domain Limitations', 'General-purpose models underperform on highly specialised technical, medical, or legal text.'],
              ['No Exact-Match Guarantee', 'Semantic search can miss exact codes, part numbers, or rare acronyms that keyword search easily retrieves.'],
              ['Index Rebuild Cost', 'Modifying even one document requires recomputing its entire 384-D embedding vector.'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-white p-3 rounded-lg border border-red-100">
                <div className="text-xs font-bold text-red-700">{title}</div>
                <div className="text-xs text-slate-600 mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

function AccordionItem({ section, isOpen, onToggle }) {
  const Icon = section.icon;
  const colors = {
    indigo: { btn: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-600' },
    violet: { btn: 'bg-violet-100 text-violet-700', dot: 'bg-violet-600' },
    rose:   { btn: 'bg-rose-100 text-rose-700',     dot: 'bg-rose-600' },
    teal:   { btn: 'bg-teal-100 text-teal-700',     dot: 'bg-teal-600' },
    red:    { btn: 'bg-red-100 text-red-700',       dot: 'bg-red-600' },
  };
  const c = colors[section.color] || colors.indigo;

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      <button
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
        onClick={onToggle}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.btn}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="flex-1 font-semibold text-slate-800 text-sm">{section.title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="px-5 pb-5 pt-1 border-t border-slate-100">
              {section.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TheorySection({ onGoToLab }) {
  const [openSection, setOpenSection] = useState('what');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Theory — Dense Embedding-Based Semantic Search</h1>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mt-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
          Dense semantic search revolutionised information retrieval by replacing exact-keyword lookups with
          continuous vector similarity. This experiment implements the full pipeline: document encoding →
          vector indexing → query encoding → cosine ranking → Top-K retrieval, using the
          <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs mx-1 font-mono">all-MiniLM-L6-v2</code>
          sentence-transformer model (384 dimensions).
        </p>
      </div>

      {/* Aim & Objectives */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 shadow-sm">
        <h2 className="text-sm font-bold text-indigo-800 mb-1">🎯 Aim</h2>
        <p className="text-xs text-slate-700 leading-relaxed mb-4">
          To implement and analyse a dense embedding-based semantic search system using the all-MiniLM-L6-v2
          sentence-transformer, compute cosine similarity scores, visualise the 384-D vector space via PCA,
          and evaluate using Precision@K, Recall@K, F1@K and MRR.
        </p>
        <h2 className="text-sm font-bold text-indigo-800 mb-2">📋 Objectives</h2>
        <ul className="space-y-1.5">
          {[
            'Encode documents and queries into 384-D dense vectors using all-MiniLM-L6-v2.',
            'Compute L2-normalised cosine similarity for ranked retrieval.',
            'Visualise the embedding space using 2-D PCA projections.',
            'Run Top-K retrieval with a configurable similarity threshold.',
            'Evaluate with Precision@K, Recall@K, F1@K, and MRR.',
            'Compare dense semantic retrieval vs. traditional keyword-based search.',
          ].map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
              <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
              {obj}
            </li>
          ))}
        </ul>
      </div>

      {/* Accordion */}
      <div className="space-y-3 mb-6">
        {THEORY_SECTIONS.map((sec) => (
          <AccordionItem
            key={sec.id}
            section={sec}
            isOpen={openSection === sec.id}
            onToggle={() => setOpenSection(prev => prev === sec.id ? null : sec.id)}
          />
        ))}
      </div>

      {/* Proceed button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoToLab}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
        >
          <FlaskConical className="w-4 h-4" />
          Proceed to Interactive Simulation Lab
        </motion.button>
      </div>
    </div>
  );
}
