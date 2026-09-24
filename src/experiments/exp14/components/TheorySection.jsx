import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronDown, ChevronUp, FlaskConical,
  Brain, Target, Network, Search, GitMerge, Layers
} from 'lucide-react';

const THEORY_SECTIONS = [
  {
    id: 'ir',
    icon: Search,
    color: 'indigo',
    title: 'Information Retrieval (IR)',
    content: (
      <div className="space-y-3">
        <p className="text-slate-700 leading-relaxed text-sm">
          <strong>Information Retrieval</strong> is the process of finding useful, relevant documents
          from a collection in response to a user query. A retrieval system matches query terms
          against document content and ranks results by relevance score.
        </p>
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
          <div className="text-xs font-bold text-indigo-700 mb-2">Lightweight Keyword Retrieval (used in this experiment)</div>
          <div className="font-mono text-xs text-slate-700 space-y-1">
            <div>1. Tokenize query and remove stopwords</div>
            <div>2. Tokenize each document and compute term overlap</div>
            <div>3. Score = overlap / query_terms + title_bonus</div>
            <div>4. Rank documents descending by score</div>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          This transparent scoring allows learners to trace exactly why each document was retrieved.
        </p>
      </div>
    ),
  },
  {
    id: 'kg',
    icon: Network,
    color: 'teal',
    title: 'Knowledge Graphs',
    content: (
      <div className="space-y-3">
        <p className="text-slate-700 leading-relaxed text-sm">
          A <strong>Knowledge Graph</strong> represents information as <em>entities (nodes)</em> connected
          by typed <em>relationships (edges)</em>. For example:
        </p>
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 font-mono text-xs text-teal-800">
          <div>D1 (Semantic Search) --USES--&gt; E1 (Dense Embeddings)</div>
          <div>D2 (Knowledge Graphs) --USES--&gt; E3 (Knowledge Graph)</div>
          <div>E3 (Knowledge Graph) --ENABLES--&gt; E8 (Graph Traversal)</div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-700 text-xs mb-1">Document Nodes (squares)</div>
            <p className="text-xs text-slate-600">Retrievable text units that serve as entry points into the graph.</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="font-bold text-amber-700 text-xs mb-1">Entity Nodes (circles)</div>
            <p className="text-xs text-slate-600">Meaningful concepts, technologies, or topics linked to documents.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'integration',
    icon: GitMerge,
    color: 'violet',
    title: 'Why Integrate IR and Knowledge Graphs?',
    content: (
      <div className="space-y-3">
        <p className="text-slate-700 leading-relaxed text-sm">
          Traditional IR answers <em>Which documents are relevant?</em> A Knowledge Graph additionally
          answers <em>Which entities are involved, and how are they connected?</em>
        </p>
        <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
          <div className="font-bold text-violet-700 text-xs mb-3">Integrated Workflow</div>
          <div className="flex flex-col gap-1.5">
            {['User Query', 'Document Retrieval', 'Relevant Documents', 'Entity Identification', 'Graph Traversal', 'Contextual Exploration'].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-xs font-semibold text-slate-700">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'traversal',
    icon: Layers,
    color: 'rose',
    title: 'Graph Traversal and Context',
    content: (
      <div className="space-y-3">
        <p className="text-slate-700 leading-relaxed text-sm">
          Retrieved documents act as <strong>entry points</strong> into the graph. Following their
          edges reveals related entities and concepts, often uncovering relevant context not
          explicitly mentioned in the document text.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <div className="font-bold text-rose-700 text-xs mb-1">1-Hop Context</div>
            <p className="text-xs text-slate-600">Nodes directly connected to the selected document.</p>
          </div>
          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
            <div className="font-bold text-orange-700 text-xs mb-1">2-Hop Context</div>
            <p className="text-xs text-slate-600">Neighbors of neighbors - richer multi-step exploration.</p>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          This experiment uses an in-memory graph (no Neo4j required) as specified by the faculty assignment.
        </p>
      </div>
    ),
  },
];

const COLOR_MAP = {
  indigo: { bg: 'bg-indigo-600', light: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', btn: 'hover:bg-indigo-50' },
  teal:   { bg: 'bg-teal-600',   light: 'bg-teal-50 border-teal-200',   text: 'text-teal-700',   btn: 'hover:bg-teal-50' },
  violet: { bg: 'bg-violet-600', light: 'bg-violet-50 border-violet-200', text: 'text-violet-700', btn: 'hover:bg-violet-50' },
  rose:   { bg: 'bg-rose-500',   light: 'bg-rose-50 border-rose-200',   text: 'text-rose-700',   btn: 'hover:bg-rose-50' },
};

function AccordionSection({ section }) {
  const [open, setOpen] = useState(false);
  const c = COLOR_MAP[section.color];
  const Icon = section.icon;

  return (
    <div className={`rounded-2xl border ${c.light} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 p-4 text-left ${c.btn} transition-colors`}
      >
        <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className={`flex-1 font-bold text-sm ${c.text}`}>{section.title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2">{section.content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TheorySection({ onGoToLab }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 flex items-center justify-center shadow-md">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Theory — IR + Knowledge Graph Integration</h1>
          <p className="text-xs text-slate-500">Knowledge Graphs and Information Retrieval Systems</p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-teal-600" />
          <span className="font-bold text-teal-700 text-sm">Aim</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          To integrate document retrieval with knowledge-graph-based entity and relationship exploration
          so that retrieved documents can be examined together with their surrounding contextual information.
        </p>
      </div>

      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-indigo-500" />
          <span className="font-bold text-slate-800 text-sm">Learning Objectives</span>
        </div>
        <ul className="space-y-2">
          {[
            'Understand how Information Retrieval and Knowledge Graphs complement each other.',
            'Retrieve relevant documents for a natural-language query using keyword matching.',
            'Identify entities and relationships connected to retrieved documents.',
            'Explore retrieved results through a small animated graph representation.',
            'Understand how graph context can enrich ordinary document retrieval.',
          ].map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
              {obj}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-500" />
          Core Concepts
        </h2>
        {THEORY_SECTIONS.map(s => <AccordionSection key={s.id} section={s} />)}
      </div>

      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-500" />
          Key Terminology
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ['Information Retrieval (IR)', 'Finding and ranking relevant documents for a user information need.'],
            ['Document', 'A retrievable unit of textual information in the corpus.'],
            ['Entity', 'A meaningful concept, technology, or topic as a graph node.'],
            ['Relationship', 'A typed connection between two graph entities.'],
            ['Knowledge Graph', 'A graph of entities and semantic relationships.'],
            ['Graph Traversal', 'Following edges from one node to its connected neighbors.'],
            ['Graph Context', 'Related entities discovered around a retrieved document.'],
            ['Graph-Enhanced Retrieval', 'Combining document relevance with structured graph context.'],
          ].map(([term, def]) => (
            <div key={term} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-800 text-xs">{term}</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">{def}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoToLab}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
        >
          <FlaskConical className="w-4 h-4" />
          Open Simulation Lab
        </motion.button>
      </div>
    </div>
  );
}
