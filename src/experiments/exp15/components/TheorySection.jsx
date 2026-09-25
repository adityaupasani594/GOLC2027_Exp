import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, ArrowRight, Brain, Search, GitMerge,
  Network, Layers, ExternalLink, Sparkles
} from 'lucide-react';
import { MathJaxDiv, useMathJax } from './useMathJax';

export default function TheorySection({ onGoToLab, onNext }) {
  const handleLaunch = onGoToLab || onNext;
  useMathJax([]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800">
      {/* ── 1. HERO BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm relative overflow-hidden space-y-4"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Experiment 15 • IR Metrics & System Evaluation
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Information Retrieval Metrics and Evaluation Systems
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Master the mathematical and statistical foundations of Information Retrieval evaluation. 
              Quantify relevance, precision, recall, harmonic balance, and ranking efficacy across lexical, 
              semantic dense vector, and reciprocal rank fusion architectures.
            </p>
          </div>

          {handleLaunch && (
            <button
              onClick={handleLaunch}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all shrink-0 cursor-pointer self-start md:self-auto"
            >
              Launch Simulation Lab
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── 2. LEARNING OBJECTIVES ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Learning Objectives
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {[
            {
              num: '01',
              title: 'Set-Based Retrieval Metrics',
              desc: 'Formulate, compute, and interpret Precision@k, Recall@k, and the Harmonic F1-Score across variable rank cutoffs.',
            },
            {
              num: '02',
              title: 'Ranked Positional Metrics',
              desc: 'Calculate Mean Reciprocal Rank (MRR) and understand how rank position penalty impacts user satisfaction in QA and web search.',
            },
            {
              num: '03',
              title: 'Architectural Paradigm Comparison',
              desc: 'Contrast exact lexical matching (BM25), bi-encoder neural dense retrieval (Cosine Similarity), and multi-ranker Reciprocal Rank Fusion (RRF).',
            },
            {
              num: '04',
              title: 'Empirical Evaluation Benchmarking',
              desc: 'Analyze trade-offs between precision and recall across differing query types, vocabulary mismatches, and multi-system rank fusions.',
            },
          ].map((obj, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 flex items-start gap-3.5">
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                {obj.num}
              </span>
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-0.5">{obj.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{obj.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. FOUNDATIONAL THEORETICAL FRAMEWORK ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Foundational Theoretical Framework
        </h2>

        {/* Section 1: The Core IR Evaluation Problem */}
        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/90 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <Search className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">1. The Information Retrieval Evaluation Problem</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            In Information Retrieval (IR), a system returns a ranked subset of documents <MathJaxDiv className="inline font-mono">{'\\mathcal{L}_k'}</MathJaxDiv> from an indexed corpus <MathJaxDiv className="inline font-mono">{'\\mathcal{D}'}</MathJaxDiv> in response to an information need query <MathJaxDiv className="inline font-mono">{'q'}</MathJaxDiv>.
            Relevance is evaluated against a ground-truth set of known relevant documents <MathJaxDiv className="inline font-mono">{'\\mathcal{R}'}</MathJaxDiv>.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-800 block mb-0.5">True Positives (TP)</span>
              Retrieved documents that are genuinely relevant: <MathJaxDiv className="inline font-mono">{'|\\mathcal{R} \\cap \\mathcal{L}_k|'}</MathJaxDiv>.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-800 block mb-0.5">False Positives (FP)</span>
              Retrieved documents that are irrelevant: <MathJaxDiv className="inline font-mono">{'|\\mathcal{L}_k \\setminus \\mathcal{R}|'}</MathJaxDiv>.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-800 block mb-0.5">False Negatives (FN)</span>
              Relevant documents missed by the system: <MathJaxDiv className="inline font-mono">{'|\\mathcal{R} \\setminus \\mathcal{L}_k|'}</MathJaxDiv>.
            </div>
          </div>
        </div>

        {/* Section 2: Precision@k and Recall@k */}
        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/90 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">2. Precision@k and Recall@k Formulations</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Because web search users rarely examine beyond the first few results, evaluation is measured at fixed cutoff rank <MathJaxDiv className="inline font-mono">{'k'}</MathJaxDiv>:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/60 space-y-1.5">
              <div className="text-xs font-bold text-blue-800 uppercase tracking-wide">Precision at rank k (P@k)</div>
              <MathJaxDiv className="text-sm font-mono text-slate-900">
                {'$$P@k = \\frac{|\\mathcal{R} \\cap \\mathcal{L}_k|}{k}$$'}
              </MathJaxDiv>
              <p className="text-xs text-slate-600">
                Measures accuracy: &ldquo;Of all the top-k results presented to the user, what proportion was relevant?&rdquo;
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 space-y-1.5">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Recall at rank k (R@k)</div>
              <MathJaxDiv className="text-sm font-mono text-slate-900">
                {'$$R@k = \\frac{|\\mathcal{R} \\cap \\mathcal{L}_k|}{|\\mathcal{R}|}$$'}
              </MathJaxDiv>
              <p className="text-xs text-slate-600">
                Measures coverage: &ldquo;Of all relevant documents existing in the entire corpus, what fraction did the system retrieve?&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: F1 and Positional MRR */}
        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/90 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold text-xs">
              <Brain className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">3. F1-Score &amp; Mean Reciprocal Rank (MRR)</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-violet-50/60 border border-violet-200/60 space-y-1.5">
              <div className="text-xs font-bold text-violet-800 uppercase tracking-wide">Harmonic F1-Score</div>
              <MathJaxDiv className="text-sm font-mono text-slate-900">
                {'$$F_1 = 2 \\cdot \\frac{P@k \\cdot R@k}{P@k + R@k}$$'}
              </MathJaxDiv>
              <p className="text-xs text-slate-600">
                The harmonic mean heavily penalizes extreme imbalances (e.g., retrieving everything to artificially inflate recall at the cost of precision).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/60 space-y-1.5">
              <div className="text-xs font-bold text-rose-800 uppercase tracking-wide">Mean Reciprocal Rank (MRR)</div>
              <MathJaxDiv className="text-sm font-mono text-slate-900">
                {'$$\\text{MRR} = \\frac{1}{|Q|}\\sum_{i=1}^{|Q|} \\frac{1}{\\text{rank}_i}$$'}
              </MathJaxDiv>
              <p className="text-xs text-slate-600">
                Evaluates positional rank of the <em>first</em> relevant hit. A top-1 hit yields 1.0; top-2 yields 0.5; top-5 yields 0.2. Crucial for question answering.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Retrieval Architectures */}
        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/90 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
              <GitMerge className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">4. Retrieval System Scoring Functions Compared</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Modern search infrastructures deploy complementary retrieval architectures to balance speed and semantic generalization:
          </p>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900">BM25 (Best Match 25 Lexical Ranking):</div>
              <MathJaxDiv className="overflow-x-auto text-xs py-1">
                {'$$\\text{BM25}(d, q) = \\sum_{t \\in q} \\text{IDF}(t) \\cdot \\frac{f(t,d) \\cdot (k_1+1)}{f(t,d) + k_1 \\cdot (1 - b + b \\cdot \\frac{|d|}{\\text{avgdl}})}$$'}
              </MathJaxDiv>
              <p className="text-slate-600">Incorporate term frequency saturation (<MathJaxDiv className="inline">k_1 \approx 1.2</MathJaxDiv>) and document length normalization (<MathJaxDiv className="inline">b \approx 0.75</MathJaxDiv>).</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900">Dense Neural Retrieval (Cosine Similarity):</div>
              <MathJaxDiv className="overflow-x-auto text-xs py-1">
                {'$$\\text{Sim}_{\\text{dense}}(\\mathbf{q}, \\mathbf{d}) = \\frac{\\mathbf{q} \\cdot \\mathbf{d}}{\\|\\mathbf{q}\\| \\cdot \\|\\mathbf{d}\\|}$$'}
              </MathJaxDiv>
              <p className="text-slate-600">Encodes queries and passages into continuous embedding vectors to match semantic meaning despite vocabulary mismatches.</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900">Reciprocal Rank Fusion (RRF Multi-Ranker Hybrid):</div>
              <MathJaxDiv className="overflow-x-auto text-xs py-1">
                {'$$\\text{RRF}(d) = \\sum_{m \\in M} \\frac{1}{k_0 + r_m(d)}, \\quad k_0 = 60$$'}
              </MathJaxDiv>
              <p className="text-slate-600">Merges disparate ranking models without needing uncalibrated score normalization by summing inverted positional ranks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. TECHNICAL COMPARISON MATRIX ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Technical Comparison Matrix
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                <th className="p-3 sm:p-3.5">Architecture</th>
                <th className="p-3 sm:p-3.5">Matching Principle</th>
                <th className="p-3 sm:p-3.5">Vocab Mismatch Robustness</th>
                <th className="p-3 sm:p-3.5">Latency &amp; Index Size</th>
                <th className="p-3 sm:p-3.5">Tuning Overhead</th>
                <th className="p-3 sm:p-3.5">Best Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 sm:p-3.5 font-bold text-slate-800">Lexical BM25</td>
                <td className="p-3 sm:p-3.5">Exact term inverted index</td>
                <td className="p-3 sm:p-3.5 text-rose-600 font-semibold">Low (synonym failure)</td>
                <td className="p-3 sm:p-3.5 text-emerald-600 font-semibold">Ultra-fast (&lt;5ms), compact</td>
                <td className="p-3 sm:p-3.5">Minimal (k1=1.2, b=0.75)</td>
                <td className="p-3 sm:p-3.5">Product codes, names, exact terms</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 sm:p-3.5 font-bold text-slate-800">Cosine TF-IDF</td>
                <td className="p-3 sm:p-3.5">Sparse vector dot-product</td>
                <td className="p-3 sm:p-3.5 text-rose-600 font-semibold">Low (exact orthogonal vocab)</td>
                <td className="p-3 sm:p-3.5 text-emerald-600 font-semibold">Fast (&lt;10ms), sparse CSR</td>
                <td className="p-3 sm:p-3.5">None</td>
                <td className="p-3 sm:p-3.5">Lightweight keyword baselines</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 sm:p-3.5 font-bold text-slate-800">Dense Bi-Encoder</td>
                <td className="p-3 sm:p-3.5">768-d latent dot-product (HNSW)</td>
                <td className="p-3 sm:p-3.5 text-emerald-600 font-semibold">High (semantic paraphrase)</td>
                <td className="p-3 sm:p-3.5 text-amber-600 font-semibold">Moderate (&lt;25ms), RAM heavy</td>
                <td className="p-3 sm:p-3.5">High (fine-tuning embeddings)</td>
                <td className="p-3 sm:p-3.5">Conceptual QA, conversational search</td>
              </tr>
              <tr className="hover:bg-slate-50/50 bg-indigo-50/30">
                <td className="p-3 sm:p-3.5 font-bold text-indigo-900">RRF Hybrid</td>
                <td className="p-3 sm:p-3.5 font-semibold text-slate-800">Positional reciprocal rank fusion</td>
                <td className="p-3 sm:p-3.5 text-emerald-600 font-semibold">Maximum (combines both)</td>
                <td className="p-3 sm:p-3.5 text-indigo-700 font-semibold">Moderate (&lt;30ms), dual index</td>
                <td className="p-3 sm:p-3.5 text-emerald-700 font-semibold">Zero-tuning robust (k=60)</td>
                <td className="p-3 sm:p-3.5 font-semibold text-indigo-900">Production web search &amp; RAG</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. LABORATORY PROCEDURE ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Laboratory Procedure
        </h2>
        <div className="space-y-3 pt-1">
          {[
            {
              step: 'Step 1: Select Information Need Query',
              detail: 'Choose from standardized evaluation queries (e.g., Information Retrieval, Deep Learning, Cloud Computing, Database Systems) or input a custom search query.',
            },
            {
              step: 'Step 2: Calibrate Cutoff Rank (k)',
              detail: 'Select the evaluation rank cutoff (k = 3, 5, or 10) to simulate different real-world search interface constraints (e.g., mobile viewport vs full page).',
            },
            {
              step: 'Step 3: Execute Multi-System Retrieval',
              detail: 'Run the indexed corpus against all 4 retrieval engines simultaneously: BM25, Cosine TF-IDF, Dense Bi-Encoder, and Reciprocal Rank Fusion.',
            },
            {
              step: 'Step 4: Audit Retrieved Documents Against Ground Truth',
              detail: 'Inspect the resulting ranked document lists. Green tags indicate True Positives (ground-truth relevant), while gray tags denote False Positives.',
            },
            {
              step: 'Step 5: Compute Evaluation Metrics',
              detail: 'Observe the mathematical computation of Precision@k, Recall@k, F1-Score, and Reciprocal Rank (RR) for each individual system.',
            },
            {
              step: 'Step 6: Comparative Radar and Metric Analysis',
              detail: 'Compare the metric radar plots across all 4 systems to identify which engine achieved superior recall coverage without sacrificing precision.',
            },
            {
              step: 'Step 7: Log Trials & Complete Verification Quiz',
              detail: 'Record your evaluation findings into the trial logger, proceed to the assessment quiz to test your mastery, and print your verified completion certificate.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-0.5">{item.step}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. KEY TERMINOLOGY & DEFINITIONS ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Key Terminology &amp; Definitions
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {[
            {
              term: 'Precision@k',
              def: 'The fraction of the top-k retrieved documents that are relevant to the user query. Measures system purity and precision.',
            },
            {
              term: 'Recall@k',
              def: 'The fraction of all relevant documents in the corpus that successfully appear within the top-k retrieved results. Measures system coverage.',
            },
            {
              term: 'F1-Score',
              def: 'The harmonic mean of precision and recall. Punishes severe imbalance between high precision and low recall (or vice-versa).',
            },
            {
              term: 'Mean Reciprocal Rank (MRR)',
              def: 'The average of reciprocal ranks (1/rank) of the first relevant document returned across a benchmark test set of queries.',
            },
            {
              term: 'BM25 (Best Match 25)',
              def: 'A non-linear probabilistic term-frequency ranking function incorporating term frequency saturation and document length normalization.',
            },
            {
              term: 'Dense Bi-Encoder Retrieval',
              def: 'A neural retrieval paradigm where queries and documents are independently embedded into dense semantic vectors and matched via cosine similarity.',
            },
            {
              term: 'Reciprocal Rank Fusion (RRF)',
              def: 'An unsupervised rank aggregation method that combines multiple sorted ranking lists by summing reciprocal ranks with a smoothing constant k=60.',
            },
            {
              term: 'Ground Truth Relevance (R)',
              def: 'The verified set of documents in a collection judged by human assessors or domain annotations to satisfy a given information query.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/70 border border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-900 mb-1">{item.term}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.def}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. REFERENCES & FURTHER READING ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          References &amp; Further Reading
        </h2>
        <div className="space-y-3 pt-1">
          {[
            {
              title: 'The Probabilistic Relevance Framework: BM25 and Beyond',
              authors: 'Robertson, S., & Zaragoza, H.',
              publication: 'Foundations and Trends in Information Retrieval, 3(4), 333-389, 2009.',
              link: 'https://www.nowpublishers.com/article/Details/INR-019',
            },
            {
              title: 'Reciprocal Rank Fusion Outperforms Condorcet and Individual Machine Learning Methods for Web Search',
              authors: 'Cormack, G. V., Clarke, C. L., & Buettcher, S.',
              publication: 'Proceedings of the 32nd International ACM SIGIR Conference, 2009.',
              link: 'https://dl.acm.org/doi/10.1145/1571941.1572114',
            },
            {
              title: 'Dense Passage Retrieval for Open-Domain Question Answering',
              authors: 'Karpukhin, V., Oğuz, B., Min, S., Lewis, P., et al.',
              publication: 'Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP), 2020.',
              link: 'https://aclanthology.org/2020.emnlp-main.550/',
            },
            {
              title: 'Introduction to Information Retrieval',
              authors: 'Manning, C. D., Raghavan, P., & Schütze, H.',
              publication: 'Cambridge University Press, 2008.',
              link: 'https://nlp.stanford.edu/IR-book/',
            },
          ].map((ref, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900">{ref.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{ref.authors} &bull; <span className="italic">{ref.publication}</span></p>
              </div>
              <a
                href={ref.link}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-700 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors shrink-0"
                title="View Source"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
