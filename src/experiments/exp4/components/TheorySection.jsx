import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, ArrowRight,
  Layers, Scale, Binary, Filter, Compass, Target,
  Sliders, ExternalLink, HelpCircle, Calculator, Info
} from 'lucide-react';
import {
  THEORY_KEY_TERMS,
  REFERENCES,
  TF_SCHEMES,
  IDF_SCHEMES
} from '../tfidfEngine';
import { useMathJax, MathJaxDiv, MathJaxSpan } from '../../../components/common/useMathJax';

export default function TheorySection({ onGoToLab }) {
  const [demoAngle, setDemoAngle] = useState(35); // Degrees for interactive vector diagram
  useMathJax([demoAngle]);

  // Interactive Cosine Vector Calculation
  const rad = (demoAngle * Math.PI) / 180;
  const cosVal = Math.cos(rad);
  const ox = 70;
  const oy = 210;
  const len = 150;
  const d1X = ox + len;
  const d1Y = oy;
  const qX = ox + len * Math.cos(rad);
  const qY = oy - len * Math.sin(rad);

  const objectives = [
    'Construct a corpus vocabulary through lower-casing, regex cleaning, and stop-word filtering.',
    'Formulate local Term Frequency (TF) using raw, length-normalized, and log-scaled schemes.',
    'Compute global Document Frequency (df) and Sparck Jones Inverse Document Frequency (IDF).',
    'Calculate L2-normalized Cosine Similarity to completely neutralize document length bias.'
  ];

  const procedureSteps = [
    'Step 1: Review the theoretical background, vector space model formulations, and weighting schemes comparison matrix.',
    'Step 2: Navigate to the Simulation Lab tab in the experiment navigation bar.',
    'Step 3: Select from 7 real-world benchmark application scenarios (Web Search, Spam Filtering, Plagiarism, E-Commerce, etc.) or author custom documents and queries.',
    'Step 4: Configure Term Frequency (TF) and Inverse Document Frequency (IDF) weighting parameters and toggle Cosine vs Dot Product scoring.',
    'Step 5: Inspect live Ranked Results, term overlap contribution chips, and evaluation metrics (Precision@k, Recall@k, MAP, nDCG@k).',
    'Step 6: Explore the Term Weight Matrix heatmap, 2D Vector Space Projection, and 6-Stage Pipeline Stepper.',
    'Step 7: Record experimental trials in the session log book, complete the concept assessment Quiz, and generate your verified certificate and lab report.'
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800">
      {/* ── 1. Hero Banner ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm relative overflow-hidden space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          Experiment 4 &bull; Vector Space Information Retrieval
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          TF-IDF Based Document Retrieval &amp; Vector Space Model
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          Construct an end-to-end vector space information retrieval engine. Transform unstructured natural language text corpora into multi-dimensional geometric vector representations, calibrate Term Frequency (TF) and Inverse Document Frequency (IDF) weighting schemes, and perform ranked relevance ranking via normalized Cosine Similarity.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToLab}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-200 cursor-pointer transition active:scale-95"
          >
            Launch Simulation Lab <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. Learning Objectives ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-blue-600 rounded-full" />
          Learning Objectives
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {objectives.map((obj, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
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
          <span className="w-2 h-5 bg-blue-600 rounded-full" />
          Foundational Theoretical Framework
        </h2>

        {/* Interactive Vector Space Concept Demonstrator */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Interactive Geometric Model</span>
              <h3 className="text-base font-bold text-slate-900">Vector Space Model &amp; Cosine Angle &theta;</h3>
            </div>
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shrink-0">
              <Sliders className="w-4 h-4 text-slate-400" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Angle &theta;</span>
                <span className="text-sm font-bold text-blue-600">{demoAngle}&deg;</span>
              </div>
              <div className="text-right pl-3 border-l border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">cos(&theta;)</span>
                <span className="text-sm font-bold text-emerald-600">{cosVal.toFixed(3)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center text-white relative shadow-inner">
              <svg viewBox="0 0 320 250" className="w-full max-w-sm h-56">
                <line x1={ox} y1={oy} x2={290} y2={oy} stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
                <line x1={ox} y1={oy} x2={ox} y2={30} stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
                <text x={285} y={oy + 18} fill="#94a3b8" fontSize="10" textAnchor="end">Term 1 (e.g. "search")</text>
                <text x={ox - 8} y={35} fill="#94a3b8" fontSize="10" textAnchor="end">Term 2 (e.g. "vector")</text>

                <path
                  d={`M ${ox + 40} ${oy} A 40 40 0 0 0 ${ox + 40 * Math.cos(rad)} ${oy - 40 * Math.sin(rad)}`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <text x={ox + 50} y={oy - 10} fill="#38bdf8" fontSize="11" fontWeight="bold">&theta; = {demoAngle}&deg;</text>

                <line x1={ox} y1={oy} x2={d1X} y2={d1Y} stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                <circle cx={d1X} cy={d1Y} r="4" fill="#10b981" />
                <text x={d1X + 8} y={d1Y + 4} fill="#10b981" fontSize="11" fontWeight="bold">d (Document)</text>

                <line x1={ox} y1={oy} x2={qX} y2={qY} stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                <circle cx={qX} cy={qY} r="4" fill="#3b82f6" />
                <text x={qX + 8} y={qY - 4} fill="#38bdf8" fontSize="11" fontWeight="bold">q (Query)</text>

                <circle cx={ox} cy={oy} r="3" fill="#cbd5e1" />
              </svg>

              <div className="w-full max-w-xs mt-2 flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">0&deg;</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={demoAngle}
                  onChange={(e) => setDemoAngle(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-400 font-mono">90&deg;</span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">Cosine Normalization Formula:</div>
                <MathJaxDiv className="font-mono font-bold text-blue-700 text-sm">
                  {'$$\\cos(\\mathbf{q}, \\mathbf{d}) = \\frac{\\mathbf{q} \\cdot \\mathbf{d}}{\\|\\mathbf{q}\\| \\cdot \\|\\mathbf{d}\\|}$$'}
                </MathJaxDiv>
              </div>
              <p>
                <strong>Angle vs. Magnitude:</strong> Unlike raw Euclidean distance or dot products that penalize or favor document length, cosine similarity evaluates the directional angle &theta;.
              </p>
              <p>
                <strong>Collinear Vectors (&theta; = 0&deg;):</strong> Maximum score <span className="font-mono text-emerald-600 font-bold">1.0</span>. Even if Document B repeats Document A three times, their direction remains identical.
              </p>
            </div>
          </div>
        </div>

        {/* 6 Unified Theoretical Cards with Clean JSX and MathJax */}
        <div className="space-y-4">
          {/* Card 1: The Problem: A Set Is Not an Answer */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">1</span>
              The Problem: A Set Is Not an Answer
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              From Boolean matching to graded continuous relevance
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                Every information retrieval system starts from an awkward reality: the document collection is vastly larger than anyone is willing to read.
              </p>
              <p>
                A traditional <strong>Boolean search</strong> (e.g., documents containing <em>tax</em> <span className="font-semibold text-blue-700">AND</span> <em>invoice</em>) evaluates a binary yes/no condition. On any sizable repository, it returns an unordered set of hundreds of hits. A set of 400 documents is scarcely more actionable than the raw bookshelf.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800 mb-0.5">Boolean Retrieval (Binary)</div>
                  <p className="text-slate-600">Relevance is strict: <code className="bg-slate-200/70 px-1 rounded text-[11px]">Score &isin; &#123;0, 1&#125;</code>. Zero ordering among matched documents.</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs">
                  <div className="font-bold text-blue-900 mb-0.5">Ranked Retrieval (Continuous)</div>
                  <p className="text-blue-800">Relevance is graded: <code className="bg-blue-100 px-1 rounded text-[11px]">Score &isin; [0, 1]</code>. Documents are sorted in descending order of statistical relevance.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Why Term Weighting Is Essential */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">2</span>
              Why Term Weighting Is Essential
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Distinguishing incidental mentions from central themes
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                A simple inverted index records that a term occurs in a document, providing document IDs for fast lookup. That allows <em>finding</em>, but is fundamentally insufficient for <em>ranking</em>.
              </p>
              <p>
                To an unweighted index, two documents containing the word <em>retrieval</em> appear identical—even when one is a 40-page survey paper on retrieval algorithms and the other merely cites the word once in a bibliographic footnote.
              </p>
              <p>
                <strong>Term weighting</strong> introduces quantitative discrimination. It assigns every (term, document) pair a scalar reflecting how strongly that term characterizes that document relative to the rest of the corpus. TF-IDF harmonizes two opposing statistical forces: <strong>local concentration</strong> within this document versus <strong>global distribution</strong> across the entire collection.
              </p>
            </div>
          </div>

          {/* Card 3: From Text to Terms: Tokenization & TF */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">3</span>
              From Text to Terms: Tokenization &amp; Term Frequency (TF)
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Extracting tokens and sublinear term frequency scaling
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                Before term weights can be calculated, raw unstructured text must be tokenized: lower-cased, stripped of non-alphanumeric punctuation, and pruned of high-frequency <strong>stop words</strong> (e.g., <em>the</em>, <em>of</em>, <em>and</em>) that occur everywhere and provide zero discriminative power.
              </p>
              <p>
                The resulting set of unique corpus tokens forms the <strong>Vocabulary</strong> <MathJaxSpan className="font-mono font-bold">{'$V$'}</MathJaxSpan>. The vocabulary is derived exclusively from documents, never from the query.
              </p>
              <p>
                <strong>Term Frequency (TF)</strong> formalizes the first intuition: terms repeated frequently within a document signify core subject matter. However, raw frequency count <MathJaxSpan className="font-mono font-bold">{'$f_{t,d}$'}</MathJaxSpan> suffers from two pitfalls:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">1. Length Normalization</div>
                  <MathJaxDiv className="text-xs font-mono text-blue-700">
                    {'$$\\text{tf}_{\\text{norm}}(t,d) = \\frac{f_{t,d}}{|d|}$$'}
                  </MathJaxDiv>
                  <p className="text-[11px] text-slate-600">Corrects for document verbosity so longer documents do not accumulate inflated raw counts.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">2. Sublinear Log-Scaling</div>
                  <MathJaxDiv className="text-xs font-mono text-blue-700">
                    {'$$\\text{tf}_{\\text{log}}(t,d) = 1 + \\log_{10}(f_{t,d}) \\quad (\\text{if } f_{t,d} > 0)$$'}
                  </MathJaxDiv>
                  <p className="text-[11px] text-slate-600">Dampens excessive repetition: a document repeating <em>search</em> 20 times is not 20 times more relevant than one repeating it twice.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Inverse Document Frequency: Rarity Is Information */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">4</span>
              Inverse Document Frequency: Rarity Is Information
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sparck Jones formulation and logarithmic dampening
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                Term frequency alone is easily corrupted by frequent non-discriminative words. In a corpus of cardiology clinical notes, the word <em>heart</em> appears in every single patient record; counting it provides zero diagnostic distinction.
              </p>
              <p>
                In 1972, <strong>Karen Sp&auml;rck Jones</strong> formulated the mathematical resolution: a term's discriminative utility decreases as its document frequency <MathJaxSpan className="font-mono font-bold">{'$\\text{df}_t$'}</MathJaxSpan> increases across the collection of <MathJaxSpan className="font-mono font-bold">{'$N$'}</MathJaxSpan> documents:
              </p>

              <div className="my-2 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-center">
                <MathJaxDiv className="text-sm sm:text-base font-mono font-bold text-blue-900">
                  {'$$\\text{idf}_t = \\log_{10}\\left(\\frac{N}{\\text{df}_t}\\right)$$'}
                </MathJaxDiv>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-800 text-xs">
                  Worked Numerical Walkthrough for a Corpus of <MathJaxSpan className="font-mono">{'$N = 100$'}</MathJaxSpan> Documents:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Term in <strong>1 document</strong>:</span>
                    <MathJaxSpan className="font-mono font-bold text-emerald-700">{'$\\log_{10}(100/1) = 2.00$'}</MathJaxSpan>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Term in <strong>10 documents</strong>:</span>
                    <MathJaxSpan className="font-mono font-bold text-blue-700">{'$\\log_{10}(100/10) = 1.00$'}</MathJaxSpan>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Term in <strong>50 documents</strong>:</span>
                    <MathJaxSpan className="font-mono font-bold text-amber-700">{'$\\log_{10}(100/50) \\approx 0.30$'}</MathJaxSpan>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Term in <strong>all 100 documents</strong>:</span>
                    <MathJaxSpan className="font-mono font-bold text-slate-500">{'$\\log_{10}(100/100) = 0.00$'}</MathJaxSpan>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                The logarithm is crucial: without it, a singleton term would outweigh common terms by a factor of 100. Smoothed IDF <MathJaxSpan className="font-mono">{'$\\log_{10}(1 + N/\\text{df})$'}</MathJaxSpan> maintains strictly positive weights.
              </p>
            </div>
          </div>

          {/* Card 5: TF-IDF & The Vector Space Model (VSM) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">5</span>
              TF-IDF &amp; The Vector Space Model (VSM)
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Salton geometric representation and cosine normalization
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                Multiplying both components yields the composite term weight:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <MathJaxDiv className="text-sm font-mono font-bold text-blue-900">
                  {'$$w_{t,d} = \\text{tf}_{t,d} \\times \\text{idf}_t$$'}
                </MathJaxDiv>
              </div>
              <p>
                The weight is large if and only if <strong>both</strong> conditions hold: the term occurs frequently in document <MathJaxSpan className="font-mono">{'$d$'}</MathJaxSpan> (high TF) and is rare across the collection (high IDF).
              </p>
              <p>
                Gerard Salton's <strong>Vector Space Model</strong> maps every document and the user query into a shared <MathJaxSpan className="font-mono">{'$|V|$'}</MathJaxSpan>-dimensional Euclidean vector space. Similarity between query vector <MathJaxSpan className="font-mono">{'$\\vec{q}$'}</MathJaxSpan> and document vector <MathJaxSpan className="font-mono">{'$\\vec{d}$'}</MathJaxSpan> is measured by the <strong>Cosine Similarity</strong>:
              </p>
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-center overflow-x-auto">
                <MathJaxDiv className="text-xs sm:text-sm font-mono font-bold text-blue-900">
                  {'$$\\cos(\\vec{q}, \\vec{d}) = \\frac{\\vec{q} \\cdot \\vec{d}}{\\lVert\\vec{q}\\rVert_2 \\,\\lVert\\vec{d}\\rVert_2} = \\frac{\\sum_{t \\in V} w_{t,q} w_{t,d}}{\\sqrt{\\sum_{t \\in V} w_{t,q}^2} \\cdot \\sqrt{\\sum_{t \\in V} w_{t,d}^2}}$$'}
                </MathJaxDiv>
              </div>
              <p>
                Unlike the raw dot product (which severely biases towards bloated documents), cosine similarity normalizes by vector magnitude, measuring exclusively the angle <MathJaxSpan className="font-mono">{'$\\theta$'}</MathJaxSpan> between vectors.
              </p>
            </div>
          </div>

          {/* Card 6: Retrieval Evaluation & Benchmarking */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">6</span>
              Retrieval Evaluation &amp; Benchmarking
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Precision, Recall, MAP, and Rank-Sensitive nDCG
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                A retrieval engine cannot be verified in isolation; its ranked output is evaluated against human ground-truth <strong>Relevance Judgments</strong> at cut-off rank <MathJaxSpan className="font-mono">{'$k$'}</MathJaxSpan>:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800 text-xs">Precision@k</div>
                  <MathJaxDiv className="text-xs font-mono text-blue-700">{'$$P@k = \\frac{|\\mathcal{R} \\cap \\mathcal{L}_k|}{k}$$'}</MathJaxDiv>
                  <p className="text-[11px] text-slate-600">Fraction of top-k retrieved documents that are relevant. Penalizes returning noise.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800 text-xs">Recall@k</div>
                  <MathJaxDiv className="text-xs font-mono text-blue-700">{'$$R@k = \\frac{|\\mathcal{R} \\cap \\mathcal{L}_k|}{|\\mathcal{R}|}$$'}</MathJaxDiv>
                  <p className="text-[11px] text-slate-600">Fraction of all relevant documents successfully retrieved. Penalizes omissions.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800 text-xs">Harmonic F1-Score</div>
                  <MathJaxDiv className="text-xs font-mono text-blue-700">{'$$F_1 = 2 \\cdot \\frac{P@k \\cdot R@k}{P@k + R@k}$$'}</MathJaxDiv>
                  <p className="text-[11px] text-slate-600">Harmonic mean penalizing extreme imbalance between precision and recall.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800 text-xs">Rank-Discounted nDCG@k</div>
                  <MathJaxDiv className="text-xs font-mono text-blue-700">{'$$\\text{DCG}@k = \\sum_{i=1}^k \\frac{\\text{rel}_i}{\\log_2(i+1)}$$'}</MathJaxDiv>
                  <p className="text-[11px] text-slate-600">Normalized by ideal gain; heavily discounts relevant items placed lower in rank.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Technical Comparison Matrix ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-blue-600 rounded-full" />
          Technical Comparison Matrix
        </h2>

        {/* TF Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Term Frequency (TF) Schemes Comparison
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Scheme</th>
                  <th className="p-2.5">Formula</th>
                  <th className="p-2.5">Length Bias Defense</th>
                  <th className="p-2.5">Properties &amp; Optimal Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {TF_SCHEMES.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900">{s.name}</td>
                    <td className="p-2.5 font-mono text-blue-700 bg-blue-50/50 font-semibold">{s.formula}</td>
                    <td className="p-2.5">{s.lengthBias}</td>
                    <td className="p-2.5 text-slate-500">{s.properties}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* IDF Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Inverse Document Frequency (IDF) Schemes Comparison
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Scheme</th>
                  <th className="p-2.5">Formula</th>
                  <th className="p-2.5">Zero/Negative Defense</th>
                  <th className="p-2.5">Properties &amp; Optimal Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {IDF_SCHEMES.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900">{s.name}</td>
                    <td className="p-2.5 font-mono text-blue-700 bg-blue-50/50 font-semibold">{s.formula}</td>
                    <td className="p-2.5">{s.zeroDefense}</td>
                    <td className="p-2.5 text-slate-500">{s.properties}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 5. Laboratory Procedure ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-blue-600 rounded-full" />
          Laboratory Procedure
        </h2>
        <div className="space-y-3 pt-1">
          {procedureSteps.map((stepText, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{stepText}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Key Terminology & Definitions ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-blue-600 rounded-full" />
          Key Terminology &amp; Definitions
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {THEORY_KEY_TERMS.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 mb-1">{item.term}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.definition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. References & Further Reading ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-5 bg-blue-600 rounded-full" />
            References &amp; Further Reading
          </h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full w-fit">
            <BookOpen className="w-3.5 h-3.5" />
            13 Curated Academic Sources &bull; Crossref Verified
          </span>
        </div>

        <div className="space-y-6">
          {REFERENCES.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  {group.category}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
                  {group.badge}
                </span>
              </div>

              <div className="space-y-2.5">
                {group.items.map((item, iIdx) => {
                  const link = item.url || (item.doi ? `https://doi.org/${item.doi}` : null);
                  return (
                    <div
                      key={iIdx}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start justify-between gap-3 hover:border-blue-200 hover:shadow-xs transition-all"
                    >
                      <div className="space-y-1 pr-2">
                        <p className="text-xs font-semibold text-slate-900 leading-relaxed font-sans">
                          {item.cite}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {item.note}
                        </p>
                        {item.doi && (
                          <span className="inline-block text-[10px] font-mono text-blue-600/90 bg-blue-50/70 border border-blue-100 px-1.5 py-0.5 rounded mt-0.5">
                            doi:{item.doi}
                          </span>
                        )}
                      </div>
                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200/60 transition-all shrink-0 cursor-pointer mt-0.5"
                          title="Open Publication Link"
                        >
                          <span>{item.doi ? 'DOI' : 'Read'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
