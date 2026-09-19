import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, Lightbulb, FlaskConical, Search, Brain, GitMerge, Network } from 'lucide-react';
import { METRICS, RETRIEVAL_SYSTEMS } from '../data/labData';
import { MathJaxDiv, useMathJax } from './useMathJax';

const THEORY_SECTIONS = [
  {
    id: 'intro',
    title: 'What is Information Retrieval?',
    icon: Search,
    color: 'indigo',
    content: `Information Retrieval (IR) is the science of obtaining relevant information from large unstructured collections (documents, web pages, passages) in response to a user's query. A retrieval system must rank candidate documents so that the most relevant appear at the top.

The core challenge is that relevance is subjective — a document is relevant if it satisfies the user's information need, not merely if it contains matching keywords. Modern IR systems must handle vocabulary mismatches, ambiguity, and multi-hop reasoning.`,
    formulas: [],
  },
  {
    id: 'precision',
    title: 'Precision@k',
    icon: Search,
    color: 'blue',
    content: `Precision@k measures the fraction of the top-k retrieved documents that are relevant to the query. It captures the idea: "Of all the results I showed the user, how many were actually useful?"

A high Precision@k means the system is accurate — most of what it returns is on-topic. However, it does not account for how many relevant documents were missed.`,
    formulas: [
      '$$P@k = \\frac{|\\mathcal{R} \\cap \\mathcal{L}_k|}{k}$$',
      'where $\\mathcal{R}$ = set of all relevant documents, $\\mathcal{L}_k$ = top-k retrieved list.',
    ],
  },
  {
    id: 'recall',
    title: 'Recall@k',
    icon: Brain,
    color: 'emerald',
    content: `Recall@k measures the fraction of all relevant documents in the corpus that appear within the top-k results. It answers: "Of everything relevant that exists, how much did the system find?"

High recall is critical in applications like medical literature search or legal discovery, where missing a relevant document can have serious consequences. Recall often trades off against precision: retrieving more documents increases recall but risks polluting the results with irrelevant ones.`,
    formulas: [
      '$$R@k = \\frac{|\\mathcal{R} \\cap \\mathcal{L}_k|}{|\\mathcal{R}|}$$',
    ],
  },
  {
    id: 'f1',
    title: 'F1-Score',
    icon: GitMerge,
    color: 'violet',
    content: `The F1-Score is the harmonic mean of Precision and Recall. Because it is a harmonic mean (not arithmetic), it heavily penalises extreme imbalances — a system with P=1 and R=0 yields F1=0, not 0.5.

F1 provides a single summary number for system comparison when both precision and recall matter equally. The generalised $F_\\beta$ version allows weighting recall $\\beta$ times more than precision.`,
    formulas: [
      '$$F_1 = 2 \\cdot \\frac{P \\cdot R}{P + R} = \\frac{2 \\cdot TP}{2 \\cdot TP + FP + FN}$$',
      '$$F_\\beta = (1+\\beta^2) \\cdot \\frac{P \\cdot R}{\\beta^2 \\cdot P + R}$$',
    ],
  },
  {
    id: 'mrr',
    title: 'Mean Reciprocal Rank (MRR)',
    icon: Network,
    color: 'rose',
    content: `MRR evaluates where in a ranked list the first relevant document appears. For each query, we compute the reciprocal of the rank of the first relevant hit, then average across all queries.

MRR rewards systems that place a relevant result at the very top. If the first relevant document is at rank 1, score = 1. At rank 2, score = 0.5. At rank 5, score = 0.2. MRR is particularly popular for evaluating QA and navigational search tasks.`,
    formulas: [
      '$$\\text{MRR} = \\frac{1}{|Q|}\\sum_{i=1}^{|Q|} \\frac{1}{\\text{rank}_i}$$',
      'where $\\text{rank}_i$ = position of first relevant document for query $i$.',
    ],
  },
  {
    id: 'bm25',
    title: 'BM25 Scoring Function',
    icon: Search,
    color: 'amber',
    content: `BM25 (Best Match 25) is the standard term-frequency-based scoring function. It extends TF-IDF with saturation and document-length normalisation. The parameter k₁ controls TF saturation (typically 1.2–2.0), and b controls length normalisation (typically 0.75).

BM25 is extremely fast and interpretable but cannot handle vocabulary mismatch — querying "automobile" will not match documents about "car".`,
    formulas: [
      '$$\\text{BM25}(d,q) = \\sum_{t \\in q} \\text{IDF}(t) \\cdot \\frac{f(t,d)\\cdot(k_1+1)}{f(t,d)+k_1\\cdot(1-b+b\\cdot\\frac{|d|}{\\text{avgdl}})}$$',
    ],
  },
  {
    id: 'cosine',
    title: 'Cosine Similarity (Dense Retrieval)',
    icon: Brain,
    color: 'cyan',
    content: `Dense retrieval encodes both queries and documents as dense vectors using a bi-encoder neural network. At query time, the nearest document vectors are retrieved via approximate nearest-neighbour (ANN) search.

The similarity score is the cosine similarity between the query vector $\\mathbf{q}$ and document vector $\\mathbf{d}$, which measures the cosine of the angle between them (range: -1 to 1).`,
    formulas: [
      '$$\\cos(\\mathbf{q}, \\mathbf{d}) = \\frac{\\mathbf{q} \\cdot \\mathbf{d}}{\\|\\mathbf{q}\\| \\cdot \\|\\mathbf{d}\\|}$$',
    ],
  },
  {
    id: 'rrf',
    title: 'Reciprocal Rank Fusion (Hybrid)',
    icon: GitMerge,
    color: 'indigo',
    content: `Reciprocal Rank Fusion combines the ranked lists from multiple retrieval systems without needing to normalise scores across systems. For each document, it sums the reciprocal ranks from each system (with a constant k=60 to dampen high-rank sensitivity). Documents appearing in top positions across multiple systems get the highest combined scores.`,
    formulas: [
      '$$\\text{RRF}(d) = \\sum_{r \\in R} \\frac{1}{k + r(d)}$$',
      'where $R$ = set of rankers, $r(d)$ = rank of $d$ in ranker $r$, $k = 60$.',
    ],
  },
];

const colorMap = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', icon: 'text-indigo-500' },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',   icon: 'text-blue-500'   },
  emerald:{ bg: 'bg-emerald-50',border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700',icon:'text-emerald-500'},
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', icon: 'text-violet-500' },
  rose:   { bg: 'bg-rose-50',   border: 'border-rose-200',   badge: 'bg-rose-100 text-rose-700',   icon: 'text-rose-500'   },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700',  icon: 'text-amber-500'  },
  cyan:   { bg: 'bg-cyan-50',   border: 'border-cyan-200',   badge: 'bg-cyan-100 text-cyan-700',   icon: 'text-cyan-500'   },
};

function AccordionItem({ section, isOpen, onToggle, index }) {
  const colors = colorMap[section.color] || colorMap.indigo;
  useMathJax([isOpen]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16,1,0.3,1] }}
      className={`rounded-2xl border ${colors.border} overflow-hidden shadow-sm`}
    >
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 p-4 sm:p-5 text-left transition-colors hover:bg-white/60 ${isOpen ? 'bg-white/80' : colors.bg}`}
      >
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors.badge} shrink-0`}>
          <section.icon className={`w-4 h-4 ${colors.icon}`} />
        </span>
        <span className="flex-1 font-semibold text-slate-800 text-sm sm:text-base">{section.title}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 bg-white/70 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{section.content}</p>
              {section.formulas.length > 0 && (
                <div className={`rounded-xl p-4 ${colors.bg} border ${colors.border} space-y-2`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Formula</p>
                  {section.formulas.map((f, i) => (
                    <MathJaxDiv key={i} className="text-slate-800 text-sm overflow-x-auto">{f}</MathJaxDiv>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TheorySection({ onNext }) {
  const [openId, setOpenId] = useState('intro');
  useMathJax([openId]);

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          Section 1 — Theory
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          IR Metrics & Retrieval Systems
        </h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Click each topic to expand. All mathematical definitions are rendered with MathJax.
        </p>
      </motion.div>

      {/* Metric Quick Reference Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.3 }}
            className="glass rounded-2xl p-4 text-center border border-white/70 shadow-sm hover:shadow-md transition-shadow cursor-default"
          >
            <MathJaxDiv className={`text-lg font-bold text-${m.color}-600 mb-1`}>{m.inline}</MathJaxDiv>
            <p className="text-xs text-slate-500 font-medium">{m.label}</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">{m.tip}</p>
          </motion.div>
        ))}
      </div>

      {/* Retrieval System Pills */}
      <div className="glass rounded-2xl p-4 border border-white/80 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Retrieval Architectures Compared</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RETRIEVAL_SYSTEMS.map(sys => (
            <div key={sys.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-slate-100">
              <span className="text-lg">{sys.icon}</span>
              <div>
                <p className="text-xs font-semibold text-slate-800">{sys.label}</p>
                <p className="text-[10px] text-slate-400">{sys.latency}ms avg</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accordion Theory Sections */}
      <div className="space-y-3">
        {THEORY_SECTIONS.map((section, i) => (
          <AccordionItem
            key={section.id}
            section={section}
            isOpen={openId === section.id}
            onToggle={() => toggle(section.id)}
            index={i}
          />
        ))}
      </div>

      {/* Insight callout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-3 items-start p-4 rounded-2xl bg-indigo-50 border border-indigo-200"
      >
        <Lightbulb className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-indigo-800 mb-0.5">Key Insight: Precision–Recall Trade-off</p>
          <p className="text-xs text-indigo-700 leading-relaxed">
            Precision and Recall are inversely related. Retrieving more documents increases recall but reduces precision. F1 finds the sweet spot, while MRR focuses specifically on where the <em>first</em> relevant result appears.
          </p>
        </div>
      </motion.div>

      {/* Next CTA */}
      <motion.div className="flex justify-center pt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200 cursor-pointer"
        >
          <FlaskConical className="w-4 h-4" />
          Proceed to Visual Lab
        </motion.button>
      </motion.div>
    </div>
  );
}
