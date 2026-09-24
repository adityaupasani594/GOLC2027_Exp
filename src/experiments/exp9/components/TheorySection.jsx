import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronDown, ChevronUp, FlaskConical,
  Brain, Target, Layers, GitMerge, Search, Cpu, Zap, Sliders,
  CheckCircle2, ArrowRight, ShieldAlert, Sparkles, Network, Database
} from 'lucide-react';
import { EXPERIMENT_CONFIG, THEORY_CONTENT } from '../relationshipExtractionEngine';

const PIPELINE_STAGES = [
  {
    step: 1,
    title: 'Text Preprocessing',
    desc: 'Sentence boundary detection, tokenization, and hyphenated verb normalization (e.g., co-founded → co_founded).',
    icon: Sparkles,
    badge: 'Stage 1',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    step: 2,
    title: 'Named Entity Recognition (NER)',
    desc: 'Identify entity spans and classify them into categories: PERSON, ORG, GPE, LOC, PRODUCT, and CONCEPT.',
    icon: Brain,
    badge: 'Stage 2',
    color: 'from-purple-500 to-pink-600'
  },
  {
    step: 3,
    title: 'Dependency Parsing',
    desc: 'Grammatical parse tree traversal analyzing subject noun phrases (nsubj), verbal predicates, and objects (obj/prep).',
    icon: GitMerge,
    badge: 'Stage 3',
    color: 'from-teal-500 to-emerald-600'
  },
  {
    step: 4,
    title: 'Semantic Triple Generation',
    desc: 'Transform identified relations into formal (Subject, Relationship, Object) triples with canonical predicate names.',
    icon: Database,
    badge: 'Stage 4',
    color: 'from-amber-500 to-orange-600'
  },
  {
    step: 5,
    title: 'Knowledge Graph Ingestion',
    desc: 'Render directed multi-graph nodes (entities) and labeled directed edges (semantic relationships) in graph stores.',
    icon: Network,
    badge: 'Stage 5',
    color: 'from-rose-500 to-red-600'
  }
];

export default function TheorySection({ onGoToLab }) {
  const [activeStage, setActiveStage] = useState(1);
  const [expandedSection, setExpandedSection] = useState('pipeline');

  const toggleSection = (id) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-teal-950 p-6 sm:p-8 text-white shadow-xl border border-indigo-800/40"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Experiment 9 · Knowledge Graph &amp; Information Retrieval Systems
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Relationship Extraction from Text
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Extract semantic connections between recognized entity mentions in natural language text and represent them as structured (Subject, Relationship, Object) triples for Knowledge Graph construction.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Named Entity Recognition (NER)', 'Syntactic Dependency Parsing', 'Passive Voice Inversion', 'Negation Filtering', 'Knowledge Graph Triples'].map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium border border-white/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={onGoToLab}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              Launch Simulation Lab
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-xs text-slate-400 text-center font-mono">
              VESIT Dept. of Computer Engineering
            </div>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
      </motion.div>

      {/* 5-Stage Interactive Pipeline Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              The 5-Stage Relationship Extraction Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Click through the sequential pipeline stages that transform raw natural language sentences into structured Knowledge Graph assertions.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200 self-start sm:self-auto">
            Stage {activeStage} of 5
          </span>
        </div>

        {/* Pipeline Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {PIPELINE_STAGES.map((s) => {
            const Icon = s.icon;
            const isActive = activeStage === s.step;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStage(s.step)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isActive
                    ? 'bg-indigo-50/80 border-indigo-400 shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${s.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-700' : 'text-slate-400'}`}>
                    {s.badge}
                  </span>
                </div>
                <div className={`text-xs font-bold ${isActive ? 'text-indigo-950' : 'text-slate-700'} leading-tight`}>
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200 text-sm text-slate-700 leading-relaxed space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              {activeStage}
            </span>
            <span className="font-bold text-slate-900 text-base">
              {PIPELINE_STAGES[activeStage - 1].title}
            </span>
          </div>
          <p className="text-slate-600">
            {PIPELINE_STAGES[activeStage - 1].desc}
          </p>
          {activeStage === 1 && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-800">
              Input: <span className="text-indigo-600">"Steve Wozniak co-founded Apple."</span> → Normalized: <span className="text-emerald-700">"Steve Wozniak co_founded Apple."</span>
            </div>
          )}
          {activeStage === 2 && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-800 flex flex-wrap gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">[PERSON] Steve Wozniak</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">[ORG] Apple</span>
            </div>
          )}
          {activeStage === 3 && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-800">
              Dependency Tree: <span className="font-bold text-purple-700">[nsubj: Steve Wozniak]</span> ← <span className="font-bold text-amber-700">[ROOT_VERB: co_founded]</span> → <span className="font-bold text-blue-700">[dobj: Apple]</span>
            </div>
          )}
          {activeStage === 4 && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-800">
              Triple: <span className="text-purple-700 font-bold">Steve Wozniak</span> | <span className="text-teal-700 font-bold">co-founded</span> | <span className="text-blue-700 font-bold">Apple</span>
            </div>
          )}
          {activeStage === 5 && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-800">
              Graph Edge: (Node: "Steve Wozniak" [PERSON]) —[directed_edge: "co-founded"]→ (Node: "Apple" [ORG])
            </div>
          )}
        </div>
      </motion.div>

      {/* Accordion Theory Sections */}
      <div className="space-y-4">
        {/* Section 1: Core Concepts & Syntactic Handling */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('syntax')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Syntactic &amp; Linguistic Handling Strategies
                </h3>
                <p className="text-xs text-slate-500">
                  Active voice, passive voice inversion, role attachments, and negation filtering
                </p>
              </div>
            </div>
            {expandedSection === 'syntax' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          <AnimatePresence>
            {expandedSection === 'syntax' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 leading-relaxed space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                    <div className="font-bold text-purple-950 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                      Active Voice Extraction
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Traces direct nominal subjects (<code>nsubj</code>) and direct objects (<code>dobj</code>/<code>obj</code>) linked by a transitive root verb.
                    </p>
                    <div className="p-2.5 bg-white rounded-xl border border-purple-200/60 font-mono text-[11px] text-slate-800">
                      "Steve Jobs founded Apple" → <strong>(Steve Jobs, founded, Apple)</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                    <div className="font-bold text-teal-950 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-600" />
                      Passive Voice Inversion
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Identifies passive nominal subjects (<code>nsubjpass</code>) and agent prepositional phrases (<code>prep "by"</code>) to invert the agent as the true semantic subject.
                    </p>
                    <div className="p-2.5 bg-white rounded-xl border border-teal-200/60 font-mono text-[11px] text-slate-800">
                      "Apple was founded by Steve Jobs" → <strong>(Steve Jobs, founded, Apple)</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <div className="font-bold text-amber-950 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                      Role &amp; Attribution Structures
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Extracts role affiliations such as <em>"as CEO of &lt;Org&gt;"</em> and succession links into structured knowledge pairs.
                    </p>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-200/60 font-mono text-[11px] text-slate-800">
                      "Tim Cook succeeded Steve Jobs as CEO of Apple" → <strong>(Tim Cook, succeeded, Steve Jobs)</strong> &amp; <strong>(Tim Cook, CEO_of, Apple)</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                    <div className="font-bold text-rose-950 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Negation Filtering
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Detects syntactic negation dependencies (<code>neg</code>) and negative determiners (<em>"no company"</em>, <em>"never"</em>) to prevent hallucinated assertions.
                    </p>
                    <div className="p-2.5 bg-white rounded-xl border border-rose-200/60 font-mono text-[11px] text-rose-900">
                      "Google was acquired by no company" → <strong>[Filtered: 0 triples generated]</strong>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section 2: Learning Objectives */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('objectives')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Learning Objectives
                </h3>
                <p className="text-xs text-slate-500">
                  Competencies and technical milestones of Experiment 9
                </p>
              </div>
            </div>
            {expandedSection === 'objectives' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          <AnimatePresence>
            {expandedSection === 'objectives' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 leading-relaxed space-y-3"
              >
                <div className="space-y-2.5 pt-2">
                  {EXPERIMENT_CONFIG.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-slate-800">
                        <span className="font-bold text-slate-900">Goal {i + 1}:</span> {obj}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section 3: Experimental Procedure */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('procedure')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Step-by-Step Experimental Procedure
                </h3>
                <p className="text-xs text-slate-500">
                  Standard virtual laboratory protocol from raw text to signed PDF report
                </p>
              </div>
            </div>
            {expandedSection === 'procedure' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          <AnimatePresence>
            {expandedSection === 'procedure' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 leading-relaxed space-y-3"
              >
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {THEORY_CONTENT.procedure.map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700 font-medium">
                        {step.replace(/^Step \d+:\s*/, '')}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section 4: Key Terminology Table */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('terms')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Key Terminology &amp; Concept Reference
                </h3>
                <p className="text-xs text-slate-500">
                  Definitions of NER, SPO triples, dependency tags, and graph schemas
                </p>
              </div>
            </div>
            {expandedSection === 'terms' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          <AnimatePresence>
            {expandedSection === 'terms' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 leading-relaxed"
              >
                <div className="overflow-x-auto rounded-xl border border-slate-200 mt-2">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Term / Concept</th>
                        <th className="px-4 py-3">Definition &amp; Operational Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(THEORY_CONTENT.key_terms).map(([term, def], i) => (
                        <tr key={term} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="px-4 py-3 font-bold text-indigo-900 whitespace-nowrap align-top">
                            {term}
                          </td>
                          <td className="px-4 py-3 text-slate-600 leading-relaxed">
                            {def}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CTA Bottom Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-50 via-indigo-50 to-purple-50 border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-base">
            Ready to test Relationship Extraction?
          </h4>
          <p className="text-xs text-slate-600">
            Open the interactive simulation lab, test pre-loaded benchmark sentences or custom text, and view the generated knowledge graph.
          </p>
        </div>
        <button
          onClick={onGoToLab}
          className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <FlaskConical className="w-4 h-4" />
          Proceed to Lab Section
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
