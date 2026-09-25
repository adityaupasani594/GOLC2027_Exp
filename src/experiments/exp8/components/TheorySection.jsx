import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, ArrowRight,
  Layers, Scale, Sliders, Filter, Target,
  ExternalLink, Calculator, Info, TrendingUp, Cpu,
  Network, Search, ShieldCheck
} from 'lucide-react';
import { useMathJax, MathJaxDiv, MathJaxSpan } from '../../../components/common/useMathJax';
import { ENTITY_COLORS } from '../entityGraphEngine';

export const THEORY_KEY_TERMS = [
  {
    term: 'Named Entity Recognition (NER)',
    definition: 'An Information Extraction technique that locates and classifies named entities in unstructured text into predefined semantic categories such as Person, Organization, Location, and Concept.',
    icon: Target
  },
  {
    term: 'Knowledge Graph (KG)',
    definition: 'A graph-structured knowledge base representing factual relationships between real-world entities through nodes (entities) and directed labeled edges (relational predicates).',
    icon: Network
  },
  {
    term: 'Relational Triple',
    definition: 'The fundamental atomic assertion in Knowledge Graphs expressed as (Subject, Predicate, Object), e.g., (Elena Voss, affiliated_with, Lakeside University).',
    icon: Layers
  },
  {
    term: 'Okapi BM25',
    definition: 'A non-linear probabilistic retrieval function derived from the 2-Poisson indexing model, ranking documents based on query term frequency with asymptotic saturation and document length normalization.',
    icon: Calculator
  },
  {
    term: 'Term Frequency Saturation (k₁)',
    definition: 'The hyperparameter in BM25 calibrating how rapidly the score contribution of repeated query terms plateaus, effectively bounding keyword-stuffing impact at (k₁ + 1).',
    icon: Sliders
  },
  {
    term: 'Length Normalization (b)',
    definition: 'Hyperparameter scaling document length penalties relative to average collection length. b = 1 applies full penalty; b = 0 disables length penalization entirely.',
    icon: Scale
  },
  {
    term: 'Entity-Aware Ranking',
    definition: 'A hybrid retrieval approach augmenting lexical token scores with structured graph entity matches, rewarding documents that mention the conceptual entities present in the query.',
    icon: Cpu
  },
  {
    term: 'Mean Average Precision (MAP)',
    definition: 'The arithmetic mean of Average Precision across multiple queries, evaluating the quality of ranked lists by heavily penalizing relevant documents ranked in lower positions.',
    icon: TrendingUp
  }
];

export const REFERENCES = [
  {
    id: 1,
    title: 'The Probabilistic Relevance Framework: BM25 and Beyond',
    authors: 'Stephen Robertson, Hugo Zaragoza',
    venue: 'Foundations and Trends in Information Retrieval, Vol. 3, No. 4, pp. 333–389',
    year: '2009',
    doi: '10.1561/1500000019',
    type: 'Foundational Review'
  },
  {
    id: 2,
    title: 'Okapi at TREC-3',
    authors: 'Stephen E. Robertson, Steve Walker, Susan Jones, Micheline Hancock-Beaulieu, Mike Gatford',
    venue: 'NIST Special Publication 500-225: The Third Text REtrieval Conference (TREC-3), pp. 109–126',
    year: '1994',
    doi: '10.1.1.47.6698',
    type: 'Conference Paper'
  },
  {
    id: 3,
    title: 'Knowledge Graphs: Methodology, Tools and Selected Use Cases',
    authors: 'Dieter Fensel, Umutcan Şimşek, Kevin Angele, Elwin Huaman, Elias Kärle, et al.',
    venue: 'Springer Nature Computer Science Textbook',
    year: '2020',
    doi: '10.1007/978-3-030-37439-6',
    type: 'Standard Textbook'
  },
  {
    id: 4,
    title: 'A Survey on Knowledge Graphs: Representation, Acquisition, and Applications',
    authors: 'Shaoxiong Ji, Shirui Pan, Erik Cambria, Pekka Marttinen, Philip S. Yu',
    venue: 'IEEE Transactions on Neural Networks and Learning Systems, 33(2), pp. 494–514',
    year: '2021',
    doi: '10.1109/TNNLS.2021.3070843',
    type: 'IEEE Journal Survey'
  }
];

export default function TheorySection({ onProceedToLab }) {
  const [demoK1, setDemoK1] = useState(1.5);
  const [demoB, setDemoB] = useState(0.75);
  const [demoLambda, setDemoLambda] = useState(1.8);

  useMathJax([demoK1, demoB, demoLambda]);

  const objectives = [
    'Extract named entities (Persons, Organizations, Locations, Concepts) from raw natural language text using gazetteer lexicons and syntactic patterns.',
    'Assemble structured RDF-style relational triples (Subject, Predicate, Object) and construct directional Knowledge Graph topologies.',
    'Formulate the mathematical foundation of Okapi BM25 probabilistic retrieval with non-linear term saturation and length penalization.',
    'Implement entity-aware hybrid ranking by augmenting lexical BM25 scores with semantic Knowledge Graph entity boosts.',
    'Benchmark comparative IR evaluation metrics: Precision@K, Recall@K, Mean Average Precision (MAP), and NDCG.'
  ];

  const procedureSteps = [
    'Step 1: Review the theoretical derivations of Named Entity Recognition, Knowledge Graph topology synthesis, and Okapi BM25 scoring.',
    'Step 2: Navigate to the Simulation Lab tab using the top navigation bar.',
    'Step 3: In the Entity Extraction (NER) sub-view, select a curated domain preset or enter custom text to extract annotated entity spans.',
    'Step 4: Switch to the Knowledge Graph Explorer sub-view to inspect the interactive SVG network topology and relational triples catalog.',
    'Step 5: Navigate to the Probabilistic Retrieval workbench to select a target corpus, formulate search queries, and calibrate k₁, b, and entity boost λ.',
    'Step 6: Examine live ranked results, inspect document score breakdowns (BM25 score + Entity Boost), and log experimental runs.',
    'Step 7: Analyze the Evaluation Benchmark sub-view to compare Baseline Pure BM25 against Hybrid Entity-Boosted BM25 across standard IR metrics.',
    'Step 8: Complete the 10-question Concept Assessment Quiz, generate your accredited Certificate of Completion, and export your Laboratory Report.'
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800 font-sans">
      {/* ── 1. Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-800 via-teal-800 to-indigo-900 p-8 text-white shadow-xl"
      >
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-emerald-100 tracking-wide uppercase border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Experiment 08 • Knowledge Graphs & Probabilistic IR Track</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Identify Graph Entities & Probabilistic Retrieval Performance
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Bridge unstructured natural language texts and structured semantic networks. Master Named Entity Recognition (NER), relational triple synthesis, the Okapi BM25 probabilistic framework, and entity-boosted document ranking.
            </p>
          </div>
          <button
            onClick={onProceedToLab}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm shadow-lg hover:shadow-xl transition-all shrink-0 cursor-pointer group"
          >
            <span>Launch Simulation</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </motion.div>

      {/* ── 2. Card 1: Aim & Learning Objectives ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">1. Aim & Learning Objectives</h2>
            <p className="text-xs text-slate-500">Core pedagogical outcomes of this laboratory experiment</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed font-serif">
            <strong className="text-slate-900 font-sans">Aim: </strong>
            To extract domain-specific named entities (Persons, Organizations, Locations, Concepts) from unstructured text, assemble directional Knowledge Graph topologies using relational triples, formulate Okapi BM25 probabilistic retrieval with term frequency saturation (<MathJaxSpan>{'$k_1$'}</MathJaxSpan>) and document length normalization (<MathJaxSpan>{'$b$'}</MathJaxSpan>), and empirically benchmark ranking performance gains achieved by entity-aware boosting over baseline keyword search.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/70 hover:border-emerald-200 transition-colors">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                  {i + 1}
                </span>
                <span className="text-xs text-slate-600 leading-relaxed font-medium">{obj}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Card 2: Mathematical Formulation & Foundations ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">2. Mathematical & Theoretical Foundations</h2>
            <p className="text-xs text-slate-500">First-principles derivation of entity recognition, graph triples, and probabilistic BM25</p>
          </div>
        </div>

        {/* Section 2.1: Entity Extraction & Triples */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            2.1 Named Entity Recognition & Relational Knowledge Graph Construction
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In unstructured texts, domain entities represent rigid designators. Named Entity Recognition maps natural language tokens into typed spans <MathJaxSpan>{'$\\mathcal{E} = \\{(s_i, e_i, \\tau_i)\\}$'}</MathJaxSpan> representing start index <MathJaxSpan>{'$s_i$'}</MathJaxSpan>, end index <MathJaxSpan>{'$e_i$'}</MathJaxSpan>, and semantic type <MathJaxSpan>{'$\\tau_i \\in \\{\\text{PERSON}, \\text{ORG}, \\text{LOC}, \\text{CONCEPT}\\}$'}</MathJaxSpan>. Co-occurring entities within sentential syntactic contexts synthesize structured relational triples:
          </p>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
            <MathJaxDiv>
              {'$$\\mathcal{T} = (e_{\\text{subject}}, \\; r_{\\text{predicate}}, \\; e_{\\text{object}}) \\in \\mathcal{E} \\times \\mathcal{R} \\times \\mathcal{E}$$'}
            </MathJaxDiv>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            These triples define the directed edges of the knowledge graph <MathJaxSpan>{'$\\mathcal{G} = (\\mathcal{V}, \\mathcal{E}_{edges})$'}</MathJaxSpan>, establishing semantic connectivity between disparate entities across the entire document collection.
          </p>
        </div>

        {/* Section 2.2: Okapi BM25 Probabilistic Model */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            2.2 The Okapi BM25 Probabilistic Ranking Equation
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Okapi BM25 model estimates the log-odds of relevance <MathJaxSpan>{'$\\log \\frac{P(R=1|D, Q)}{P(R=0|D, Q)}$'}</MathJaxSpan> under the 2-Poisson indexing model. For query <MathJaxSpan>{'$Q = \\{q_1, q_2, \\dots, q_m\\}$'}</MathJaxSpan> and document <MathJaxSpan>{'$D$'}</MathJaxSpan>, the scoring formula is defined as:
          </p>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
            <MathJaxDiv>
              {'$$\\text{Score}_{\\text{BM25}}(D, Q) = \\sum_{i=1}^{m} \\text{IDF}(q_i) \\cdot \\frac{f(q_i, D) \\cdot (k_1 + 1)}{f(q_i, D) + k_1 \\cdot \\left(1 - b + b \\cdot \\frac{|D|}{\\text{avgdl}}\\right)}$$'}
            </MathJaxDiv>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-sans">Robertson Smoothed IDF Factor:</strong>
              <MathJaxDiv>
                {'$$\\text{IDF}(q_i) = \\ln \\left( 1 + \\frac{N - n(q_i) + 0.5}{n(q_i) + 0.5} \\right)$$'}
              </MathJaxDiv>
              <p className="text-[11px] text-slate-500">
                Where <MathJaxSpan>{'$N$'}</MathJaxSpan> is total documents, and <MathJaxSpan>{'$n(q_i)$'}</MathJaxSpan> is document frequency of term <MathJaxSpan>{'$q_i$'}</MathJaxSpan>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-sans">Length Normalization Weight <MathJaxSpan>{'$B$'}</MathJaxSpan>:</strong>
              <MathJaxDiv>
                {'$$B = 1 - b + b \\cdot \\frac{|D|}{\\text{avgdl}}$$'}
              </MathJaxDiv>
              <p className="text-[11px] text-slate-500">
                Penalizes overly verbose documents containing extraneous padding while rewarding concise, information-dense documents.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2.3: Entity-Aware Hybrid Scoring */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            2.3 Hybrid Entity-Aware Document Scoring
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Lexical search alone fails when query tokens are polysemous or distributed across multiple subwords. We augment BM25 with a Knowledge Graph entity-boost factor <MathJaxSpan>{'$\\lambda$'}</MathJaxSpan>:
          </p>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
            <MathJaxDiv>
              {'$$\\text{Score}_{\\text{Hybrid}}(D, Q) = \\text{Score}_{\\text{BM25}}(D, Q) + \\lambda_{\\text{entity}} \\sum_{e_q \\in \\mathcal{E}(Q)} \\mathbb{I}\\big(e_q \\in \\mathcal{E}(D)\\big)$$'}
            </MathJaxDiv>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Where <MathJaxSpan>{'$\\mathbb{I}(\\cdot)$'}</MathJaxSpan> is the indicator function evaluating to 1 if candidate entity <MathJaxSpan>{'$e_q$'}</MathJaxSpan> is confirmed present in document <MathJaxSpan>{'$D$'}</MathJaxSpan>, providing a structured semantic bonus that re-orders documents containing the verified Knowledge Graph entity.
          </p>
        </div>
      </div>

      {/* ── 4. Card 3: Architectural Pipeline ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">3. End-to-End System Architecture</h2>
            <p className="text-xs text-slate-500">Complete pipeline from unstructured text to ranked evaluation results</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: 'Stage 1',
              title: 'NER & Gazetteer Matching',
              desc: 'Raw text is scanned via multi-word gazetteer lookup, regex patterns, and title heuristics to detect PERSON, ORG, LOC, and CONCEPT spans.',
              color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
            },
            {
              step: 'Stage 2',
              title: 'KG Triples & Topology',
              desc: 'Co-occurring entities within sentences are paired to formulate (Subject, Predicate, Object) assertions, constructing a semantic graph.',
              color: 'border-teal-200 bg-teal-50/50 text-teal-800'
            },
            {
              step: 'Stage 3',
              title: 'Okapi BM25 Ranking',
              desc: 'Corpus term frequencies, document lengths, and Robertson IDF scores are combined using configurable k₁ and b parameters.',
              color: 'border-indigo-200 bg-indigo-50/50 text-indigo-800'
            },
            {
              step: 'Stage 4',
              title: 'Entity Boost & Metrics',
              desc: 'Recognized query entities yield additive boost λ. The final ranked list is benchmarked against gold standard relevance (P@K, MAP, NDCG).',
              color: 'border-purple-200 bg-purple-50/50 text-purple-800'
            }
          ].map((stg, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${stg.color} space-y-2`}>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider">{stg.step}</div>
              <div className="font-bold text-xs sm:text-sm">{stg.title}</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{stg.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Card 4: Step-by-Step Procedure ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">4. Step-by-Step Experimental Procedure</h2>
            <p className="text-xs text-slate-500">Standard operating procedure for virtual laboratory execution</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {procedureSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
              <span className="font-mono font-bold text-emerald-600 shrink-0 mt-0.5">
                {String(idx + 1).padStart(2, '0')}.
              </span>
              <span className="leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Card 5: Glossary of Technical Terms ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">5. Glossary of Technical Terms</h2>
            <p className="text-xs text-slate-500">Key definitions and terminologies in Knowledge Graphs & IR</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEORY_KEY_TERMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item.term}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-6">{item.definition}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 7. Card 6: Academic References ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">6. Academic References & Prescribed Standards</h2>
            <p className="text-xs text-slate-500">Foundational literature and textbooks in Knowledge Graphs and Information Retrieval</p>
          </div>
        </div>

        <div className="space-y-3">
          {REFERENCES.map((ref) => (
            <div key={ref.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-serif">[{ref.id}] {ref.title}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                  {ref.type}
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">{ref.authors} ({ref.year}) — <span className="italic">{ref.venue}</span></p>
              <div className="text-[10px] font-mono text-indigo-600">DOI: {ref.doi}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 8. Bottom Action CTA ── */}
      <div className="text-center pt-2">
        <button
          onClick={onProceedToLab}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition-all cursor-pointer"
        >
          <span>Proceed to Simulation Lab</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
