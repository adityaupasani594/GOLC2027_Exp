import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, ArrowRight,
  Brain, Network, Layers, GitMerge, ExternalLink, HelpCircle
} from 'lucide-react';
import { EXPERIMENT_CONFIG, THEORY_CONTENT } from '../relationshipExtractionEngine';

export default function TheorySection({ onGoToLab }) {
  const comparison = [
    {
      paradigm: 'Rule-Based Dependency Parsing',
      mechanism: 'Deterministic syntactic pattern matching over dependency parse trees',
      precision: 'High precision on grammatical sentences',
      compute: 'Very fast CPU execution (O(N) parse tree traversal)',
      bestFor: 'Structured technical documents, formal corpora, strict audit trails'
    },
    {
      paradigm: 'Supervised Neural Classifiers',
      mechanism: 'Fine-tuned BERT/RoBERTa cross-encoders over entity mention pairs',
      precision: 'High precision with strong generalization',
      compute: 'Moderate GPU inference latency',
      bestFor: 'Domain-specific enterprise extraction with annotated datasets'
    },
    {
      paradigm: 'Open Information Extraction (OpenIE)',
      mechanism: 'Unsupervised verb-mediated relation extraction without predefined schema',
      precision: 'Lower precision with variable relation phrasings',
      compute: 'Fast heuristic string extraction',
      bestFor: 'Broad open-domain web text indexing'
    },
    {
      paradigm: 'Large Language Models (LLMs)',
      mechanism: 'Few-shot in-context extraction and structured JSON schema generation',
      precision: 'Very high semantic flexibility',
      compute: 'Highest latency and monetary cost per token',
      bestFor: 'Complex conversational or multi-hop discourse relations'
    }
  ];

  const references = [
    {
      authors: 'Jurafsky, D., & Martin, J. H. (2023)',
      title: 'Speech and Language Processing (3rd ed. draft)',
      details: 'Chapter 18: Information Extraction, Relation Extraction, and Knowledge Graphs.',
      url: 'https://web.stanford.edu/~jurafsky/slp3/'
    },
    {
      authors: 'Mintz, M., Bills, S., Snow, R., & Jurafsky, D. (2009)',
      title: 'Distant supervision for relation extraction without labeled data',
      details: 'ACL-IJCNLP 2009. Seminal framework for bootstrapping relation extraction with KGs.',
      url: 'https://aclanthology.org/P09-1113/'
    },
    {
      authors: 'Hogan, A., Blomqvist, E., Cochez, M., et al. (2021)',
      title: 'Knowledge Graphs',
      details: 'ACM Computing Surveys (CSUR), 54(4), 1-37. Comprehensive foundational survey.',
      url: 'https://arxiv.org/abs/2003.02320'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800">
      {/* ── 1. Hero Banner ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm relative overflow-hidden space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 text-xs font-bold tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
          Experiment 9 &bull; Knowledge Graph Engineering
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Relationship Extraction from Text
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          Transform unstructured natural language sentences into structured semantic facts. Use Named Entity Recognition (NER) and syntactic dependency parsing to extract formal (Subject, Relationship, Object) triples, handle active and passive voice inversions, and assemble an interactive Knowledge Graph.
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
          {EXPERIMENT_CONFIG.objectives.slice(0, 4).map((obj, i) => (
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

        {/* 5-Stage Architecture Flow */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 font-mono text-xs border border-slate-800 shadow-inner">
          <div className="text-teal-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-sans">
            <Layers className="w-3.5 h-3.5" /> 5-Stage Information Extraction Pipeline
          </div>
          <div className="text-slate-300 font-sans text-xs leading-relaxed">
            Raw Text &rarr; Tokenization &rarr; Named Entity Recognition (NER) &rarr; Dependency Tree Parsing &rarr; Semantic Triple (S, R, O) &rarr; Knowledge Graph
          </div>
        </div>

        {/* Linguistic Handling Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Syntactic &amp; Grammatical Transformation Protocols
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <h4 className="font-bold text-xs text-slate-900">Active vs. Passive Voice Inversion</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                In active sentences (<em>"Steve Jobs founded Apple"</em>), the nominal subject is the agent. In passive clauses (<em>"Apple was founded by Steve Jobs"</em>), dependency parsing resolves the passive subject to object position and maps the prepositional agent (<em>by</em>) to semantic subject.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <h4 className="font-bold text-xs text-slate-900">Role &amp; Attribute Structures</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Extracts nested title and role affiliations (<em>"Tim Cook succeeded Steve Jobs as CEO of Apple"</em>) by decoupling the succession event from the concurrent administrative tenure assertion (<code>Tim Cook | CEO_of | Apple</code>).
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <h4 className="font-bold text-xs text-slate-900">Prepositional &amp; Comitative Attachments</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Correctly associates location and temporal modifiers while distinguishing accompaniment (<em>"with"</em>) from direct object targets to prevent spurious triple generation.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <h4 className="font-bold text-xs text-slate-900">Negation &amp; Falsehood Filtering</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Detects negative polarities (<em>"acquired by no company"</em>, <em>"never joined"</em>) to suppress asserting false facts into the Knowledge Graph database.
              </p>
            </div>
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
                <th className="p-2.5">Paradigm</th>
                <th className="p-2.5">Extraction Mechanism</th>
                <th className="p-2.5">Precision / Generalization</th>
                <th className="p-2.5">Computational Footprint</th>
                <th className="p-2.5">Optimal Production Fit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {comparison.map(r => (
                <tr key={r.paradigm} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-900">{r.paradigm}</td>
                  <td className="p-2.5">{r.mechanism}</td>
                  <td className="p-2.5 font-semibold text-teal-800 bg-teal-50/40">{r.precision}</td>
                  <td className="p-2.5 font-mono text-[11px]">{r.compute}</td>
                  <td className="p-2.5 text-slate-700">{r.bestFor}</td>
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
          {THEORY_CONTENT.procedure.map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                {step.replace(/^Step \d+:\s*/, '')}
              </p>
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
          {Object.entries(THEORY_CONTENT.key_terms).map(([term, def], idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-teal-900">{term}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{def}</p>
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
