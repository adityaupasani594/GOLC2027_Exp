import { ExperimentContributors } from '../../../components/common';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, ArrowRight,
  Layers, Scale, Sliders, Filter, Target,
  ExternalLink, Calculator, Info, TrendingUp, Cpu
} from 'lucide-react';
import {
  THEORY_KEY_TERMS,
  REFERENCES
} from '../bm25Engine';
import { useMathJax, MathJaxDiv, MathJaxSpan } from '../../../components/common/useMathJax';

export default function TheorySection({ onGoToLab }) {
  const [demoK1, setDemoK1] = useState(1.5);
  const [demoB, setDemoB] = useState(0.75);

  useMathJax([demoK1, demoB]);

  const objectives = [
    'Formulate the non-linear probabilistic Okapi BM25 scoring equation and Robertson smoothed IDF.',
    'Analyze the asymptotic behavior of Term Frequency (TF) saturation controlled by parameter k₁.',
    'Examine document length normalization parameterized by b relative to average document length (avgdl).',
    'Benchmark Okapi BM25 ranking performance against baseline TF-IDF using standard IR evaluation metrics (P@K, R@K, MRR, nDCG, Kendall τ).'
  ];

  const procedureSteps = [
    'Step 1: Study the mathematical foundation of Okapi BM25, term frequency saturation curves, and length penalization principles.',
    'Step 2: Proceed to the Simulation Lab tab in the experiment navigation bar.',
    'Step 3: Select the document collection source (Default 15-Document IR Corpus, Purpose-Built Scenarios, Upload File, or Custom Text).',
    'Step 4: Configure the query via Preset Query with ground-truth relevance judgements, Scenario Query, or Custom Query.',
    'Step 5: Adjust hyperparameters k₁ (0.0 to 3.0) and b (0.0 to 1.0), and toggle stop-word removal and suffix stemming.',
    'Step 6: Inspect the Step-by-Step Diagnostic Trace: Tokenization, Robertson IDF computation table, Per-Document TF breakdown, and Rank Comparison table.',
    'Step 7: Compare side-by-side BM25 vs TF-IDF rankings, score distributions, saturation curves, and quantitative IR metrics (P@K, R@K, F1, MRR, nDCG, Kendall τ).',
    'Step 8: Record experimental trials, complete the 10-question concept assessment Quiz, and export your accredited Certificate and Lab Report.'
  ];

  // Generate dynamic TF curve points for demo
  const tfPoints = [1, 2, 3, 5, 8, 12, 18, 25];
  const maxTf = 25;
  const curvePoints = tfPoints.map(tf => {
    const bm25Val = (tf * (demoK1 + 1)) / (tf + demoK1);
    const logVal = 1 + Math.log(tf);
    const linearVal = 0.25 * tf;
    return { tf, bm25Val, logVal, linearVal };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800">
      {/* ── 1. Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-700 via-indigo-700 to-sky-700 p-8 text-white shadow-xl"
      >
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-sky-100 tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>Experiment 05 • IR Foundations Track</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              BM25 Based Document Ranking
            </h1>
            <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
              Explore the probabilistic relevance framework behind Okapi BM25. Discover how non-linear term frequency saturation and adaptive document length normalization overcome the fundamental limitations of classical TF-IDF.
            </p>
          </div>
          <button
            onClick={onGoToLab}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 hover:bg-sky-50 font-bold text-sm shadow-lg hover:shadow-xl transition-all shrink-0 cursor-pointer group"
          >
            <span>Launch Simulation</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </motion.div>

      {/* ── 2. Card 1: Aim & Objectives ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">1. Aim & Learning Objectives</h2>
            <p className="text-xs text-slate-500">Core pedagogical outcomes of this laboratory experiment</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed">
            <strong className="text-slate-900">Aim: </strong>
            To implement the Okapi BM25 probabilistic retrieval function, investigate the mathematical mechanisms of term frequency saturation (<MathJaxSpan>{'$k_1$'}</MathJaxSpan>) and document length normalization (<MathJaxSpan>{'$b$'}</MathJaxSpan>), and empirically benchmark ranking effectiveness against the Vector Space Model (TF-IDF) across controlled IR test scenarios.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/70 hover:border-blue-200 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">{obj}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Card 2: Theoretical Concepts & Mathematical Formulation ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">2. Theoretical Concepts & Mathematical Formulations</h2>
            <p className="text-xs text-slate-500">From the Binary Independence Model (BIM) to Okapi BM25</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>
            Traditional Boolean retrieval suffers from returning unranked sets, while classical TF-IDF vector space models assume that term frequency scales relevance either linearly or logarithmically without upper-bound saturation. Under TF-IDF, a keyword-stuffed document repeating a search query 50 times will heavily dominate over a focused document containing 2 precise occurrences.
          </p>

          {/* Master Equation Block */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">The Okapi BM25 Scoring Equation</span>
              <span className="text-xs font-mono bg-white px-2 py-0.5 rounded text-indigo-600 border border-indigo-200">Robertson et al.</span>
            </div>
            <MathJaxDiv>
              {'$$\\text{Score}(D, Q) = \\sum_{i=1}^{|Q|} \\text{IDF}(q_i) \\cdot \\frac{f(q_i, D) \\cdot (k_1 + 1)}{f(q_i, D) + k_1 \\cdot \\left(1 - b + b \\cdot \\frac{|D|}{\\text{avgdl}}\\right)}$$'}
            </MathJaxDiv>
            <p className="text-xs text-indigo-800 leading-relaxed">
              Every query term <MathJaxSpan>{'$q_i$'}</MathJaxSpan> contributes an additive component weighted by its global informativeness (<MathJaxSpan>{'$\\text{IDF}(q_i)$'}</MathJaxSpan>) multiplied by a bounded, length-penalized term frequency saturation factor.
            </p>
          </div>

          {/* Equation Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Robertson / Lucene Smoothed IDF
              </h3>
              <MathJaxDiv>
                {'$$\\text{IDF}(q_i) = \\ln\\left(1 + \\frac{N - n(q_i) + 0.5}{n(q_i) + 0.5}\\right)$$'}
              </MathJaxDiv>
              <p className="text-xs text-slate-600">
                Where <MathJaxSpan>{'$N$'}</MathJaxSpan> is total corpus size and <MathJaxSpan>{'$n(q_i)$'}</MathJaxSpan> is document frequency. The <MathJaxSpan>{'$+1$'}</MathJaxSpan> guarantees positive output even when a term appears in over 50% of the collection.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                Document Length Normalization Factor
              </h3>
              <MathJaxDiv>
                {'$$B = 1 - b + b \\cdot \\frac{|D|}{\\text{avgdl}}$$'}
              </MathJaxDiv>
              <p className="text-xs text-slate-600">
                When document length <MathJaxSpan>{'$|D| = \\text{avgdl}$'}</MathJaxSpan>, the factor simplifies to exactly <MathJaxSpan>{'$1.0$'}</MathJaxSpan>. For longer documents (<MathJaxSpan>{'$|D| > \\text{avgdl}$'}</MathJaxSpan>), the denominator increases, penalizing verbosity.
              </p>
            </div>
          </div>

          {/* Interactive Asymptote Demonstration */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  Interactive Term Frequency Saturation Preview
                </h4>
                <p className="text-xs text-slate-400">
                  Observe how <MathJaxSpan>{'$k_1$'}</MathJaxSpan> controls the asymptote: <MathJaxSpan>{'$\\lim_{f \\to \\infty} \\text{TF-Factor} = k_1 + 1$'}</MathJaxSpan>
                </p>
              </div>
              <div className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-300 font-mono">k₁ = {demoK1.toFixed(2)}</span>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={demoK1}
                  onChange={(e) => setDemoK1(parseFloat(e.target.value))}
                  className="w-28 accent-sky-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {curvePoints.slice(0, 4).map((pt, idx) => (
                <div key={idx} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                  <span className="text-xs text-slate-400 block">TF = {pt.tf}</span>
                  <span className="text-base font-bold text-sky-300 font-mono">{pt.bm25Val.toFixed(3)}</span>
                  <span className="text-[10px] text-slate-500 block">Cap: {(demoK1 + 1).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="text-xs text-slate-400 border-t border-slate-800 pt-3 flex items-center justify-between">
              <span>Asymptotic Maximum Factor: <strong className="text-white font-mono">{(demoK1 + 1).toFixed(2)}</strong></span>
              <span className="text-sky-300">Default benchmark value: k₁ = 1.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Card 3: Parameter Architecture & Derivation ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">3. Hyperparameter Architecture & Theoretical Limits</h2>
            <p className="text-xs text-slate-500">Mathematical behaviors at boundary conditions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hyperparameter k₁</span>
              <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">0.0 ≤ k₁ ≤ 3.0</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Term Frequency Saturation Rate</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dictates how quickly the scoring function reaches saturation as within-document term occurrences increase.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li><strong className="text-slate-800">k₁ = 0:</strong> Complete saturation. Term frequency is ignored; BM25 degenerates to binary presence times Robertson IDF.</li>
              <li><strong className="text-slate-800">Large k₁ (e.g. 3.0):</strong> Term frequency behaves almost linearly, approaching unnormalized raw TF.</li>
              <li><strong className="text-slate-800">Optimal (1.2 – 2.0):</strong> S-shaped saturation curve balancing topic focus against keyword spamming.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hyperparameter b</span>
              <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">0.0 ≤ b ≤ 1.0</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Document Length Penalization</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Controls the degree to which longer documents are penalized for containing higher raw token counts.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li><strong className="text-slate-800">b = 0:</strong> No length normalization. All documents are evaluated as if <MathJaxSpan>{'$|D| = \\text{avgdl}$'}</MathJaxSpan>.</li>
              <li><strong className="text-slate-800">b = 1:</strong> Full length normalization. Scores are penalized in exact inverse proportion to relative document length.</li>
              <li><strong className="text-slate-800">Optimal (b = 0.75):</strong> Balances verbosity penalty against informative document expansion.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── 5. Card 4: Step-by-Step Procedure ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">4. Step-by-Step Practical Procedure</h2>
            <p className="text-xs text-slate-500">Methodology for conducting experiments and gathering evidence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {procedureSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
              <div className="w-6 h-6 rounded-lg bg-sky-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Card 5: Industrial & Real-World Applications ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">5. Industrial & Real-World Applications</h2>
            <p className="text-xs text-slate-500">How Okapi BM25 powers modern search engines and RAG pipelines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <h4 className="text-sm font-bold text-slate-900">Lucene & Elasticsearch</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              BM25 has been the default ranking similarity in Apache Lucene and Elasticsearch since version 6.0, replacing vector space TF-IDF across thousands of enterprise search clusters.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <h4 className="text-sm font-bold text-slate-900">Hybrid Search in Vector DBs</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Modern neural search engines (e.g. Pinecone, Qdrant, Weaviate) fuse BM25 lexical sparse scores with dense bi-encoder embeddings via Reciprocal Rank Fusion (RRF) for robust out-of-domain recall.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <h4 className="text-sm font-bold text-slate-900">First-Stage RAG Candidate Filtering</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              In Retrieval-Augmented Generation (RAG), BM25 serves as an ultra-fast sub-millisecond first-stage filter over millions of documentation chunks prior to costly LLM cross-encoder re-ranking.
            </p>
          </div>
        </div>
      </div>

      {/* ── 7. Card 6: Comprehensive Terminology Glossary ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">6. Terminology & Mathematical Symbol Glossary</h2>
            <p className="text-xs text-slate-500">Definitions of symbols, parameters, and evaluation metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {THEORY_KEY_TERMS.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.term}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.definition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 8. Card 7: Authoritative References & Bibliography ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">7. Authoritative References & Academic Bibliography</h2>
            <p className="text-xs text-slate-500">Curated citations from leading information retrieval literature</p>
          </div>
        </div>

        <div className="space-y-6">
          {REFERENCES.map((section, sIdx) => (
            <div key={sIdx} className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{section.type}</h4>
              <div className="space-y-2">
                {section.items.map((ref, rIdx) => (
                  <div key={rIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors space-y-1">
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">{ref.citation}</p>
                    <p className="text-[11px] text-slate-500">{ref.note}</p>
                    {(ref.doi || ref.url) && (
                      <a
                        href={ref.doi || ref.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-semibold pt-1"
                      >
                        <span>Access Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    
      {/* ── Experiment Contributors ── */}
      <ExperimentContributors expNumber={5} />
    </div>
  );
}
