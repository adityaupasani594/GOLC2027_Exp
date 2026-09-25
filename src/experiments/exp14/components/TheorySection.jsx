import { ExperimentContributors } from '../../../components/common';
import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, ArrowRight, Target, Brain, Network, Search,
  GitMerge, Layers, Table, CheckCircle2, ExternalLink, Sparkles
} from 'lucide-react';

export default function TheorySection({ onGoToLab, onNext }) {
  const handleLaunch = onGoToLab || onNext;

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Experiment 14 • Integrated Search & Knowledge Graphs
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Integrating Information Retrieval with Knowledge Graphs
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Bridge unstructured document text retrieval with structured semantic knowledge networks. 
              Discover how keyword ranking acts as the entry portal for multi-hop entity traversal, 
              contextual disambiguation, and interconnected relational reasoning.
            </p>
          </div>

          {handleLaunch && (
            <button
              onClick={handleLaunch}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-teal-500/20 hover:shadow-lg transition-all shrink-0 cursor-pointer self-start md:self-auto"
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
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Learning Objectives
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {[
            {
              num: '01',
              title: 'Unified Retrieval & Semantics',
              desc: 'Understand how unstructured keyword Information Retrieval (IR) and structured Knowledge Graphs (KG) solve each other\'s complementary weaknesses.',
            },
            {
              num: '02',
              title: 'Document Entry-Point Mapping',
              desc: 'Learn how relevant retrieved documents serve as ground anchors (entry points) into an entity-relationship topology.',
            },
            {
              num: '03',
              title: 'Multi-Hop Graph Traversal',
              desc: 'Execute 1-hop and 2-hop relationship traversals from retrieved documents to uncover hidden semantic context not explicitly stated in query text.',
            },
            {
              num: '04',
              title: 'Context-Enriched Search',
              desc: 'Evaluate how graph-augmented retrieval resolves vocabulary mismatch, expands entity disambiguation, and produces explainable search results.',
            },
          ].map((obj, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 flex items-start gap-3.5">
              <span className="text-xs font-black text-teal-600 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100">
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
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Foundational Theoretical Framework
        </h2>

        {/* Pillar 1: Information Retrieval */}
        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/90 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
              <Search className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">1. Information Retrieval: Matching & Ranking</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Information Retrieval (IR) matches user information needs expressed as free-text queries against unstructured document collections. 
            In classical keyword IR, scoring relies on lexical overlap and term significance:
          </p>
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 font-mono text-xs text-slate-800 space-y-1">
            <div className="font-semibold text-teal-800 mb-1">// Scoring Pipeline</div>
            <div>1. Tokenize query &amp; filter non-informative stopwords: <span className="text-teal-700">Q &rarr; &#123;t_1, t_2, ...&#125;</span></div>
            <div>2. Tokenize documents &amp; calculate intersection overlap: <span className="text-teal-700">Overlap(d, Q) = |Tokens(d) &cap; Q|</span></div>
            <div>3. Apply title weighting bonus &amp; normalisation: <span className="text-teal-700">Score(d, Q) = (Overlap / |Q|) + Bonus(Title)</span></div>
          </div>
          <p className="text-xs text-slate-500">
            Limitation: Keyword IR treats documents as bags of words. It cannot deduce that &ldquo;Dense Embeddings&rdquo; relates to &ldquo;Vector Indexing&rdquo; unless both words co-occur in the same text snippet.
          </p>
        </div>

        {/* Pillar 2: Knowledge Graphs */}
        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/90 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <Network className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">2. Knowledge Graphs: Entities &amp; Semantic Triples</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            A Knowledge Graph represents domain intelligence as a directed labeled multigraph <span className="font-mono text-xs font-semibold">G = (V, E)</span> composed of semantic triples <span className="font-mono text-xs font-semibold">(subject, predicate, object)</span>:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-teal-600 inline-block" />
                Document Nodes (Squares)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Concrete textual documents in the corpus. They act as the initial grounding entry points when matching queries.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                Entity Nodes (Circles)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Abstract domain concepts, algorithms, frameworks, or real-world entities connected via typed predicates like <span className="font-mono font-semibold">USES</span>, <span className="font-mono font-semibold">ENABLES</span>, or <span className="font-mono font-semibold">IMPLEMENTS</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Pillar 3: Integration Synergy */}
        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/90 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
              <GitMerge className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">3. Hybrid Synergy: Why Combine IR and Knowledge Graphs?</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Standalone keyword search answers <em>&ldquo;Which documents match this text?&rdquo;</em> Standalone knowledge graphs answer <em>&ldquo;How are structured entities logically linked?&rdquo;</em>
            Integrating both creates an interconnected retrieval architecture:
          </p>
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-2">
            <div className="text-xs font-bold text-amber-900 mb-1">Two-Stage Hybrid Search Workflow:</div>
            <div className="grid sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-amber-200/50">
                <span className="font-bold text-amber-800 block mb-0.5">Stage 1: Keyword Filtering</span>
                Text query indexes candidates to identify high-probability document entry nodes.
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-amber-200/50">
                <span className="font-bold text-amber-800 block mb-0.5">Stage 2: Entity Grounding</span>
                Retrieved documents link outward to connected domain entities via defined relationship edges.
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-amber-200/50">
                <span className="font-bold text-amber-800 block mb-0.5">Stage 3: Graph Expansion</span>
                Follow 1-hop and 2-hop edges to surface hidden contextual dependencies and complementary topics.
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 4: Multi-Hop Traversal */}
        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/90 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">4. Multi-Hop Graph Traversal and Expansion Horizons</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            When exploring graph neighborhoods from a retrieved document, expanding the traversal radius changes the depth of context:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-1">1-Hop Immediate Neighborhood:</span>
              <p className="text-slate-600 leading-relaxed">
                Directly adjacent entity nodes linked by primary predicates (e.g., <span className="font-mono">D1 &rarr; USES &rarr; Dense Embeddings</span>). High precision, highly specific context.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-1">2-Hop Transitive Neighborhood:</span>
              <p className="text-slate-600 leading-relaxed">
                Neighbors of neighbors (e.g., <span className="font-mono">Dense Embeddings &rarr; ENABLES &rarr; Semantic Similarity</span>). Uncovers serendipitous insights, cross-domain links, and deeper conceptual prerequisites.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. TECHNICAL COMPARISON MATRIX ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Technical Comparison Matrix
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                <th className="p-3 sm:p-3.5">Dimension / Paradigm</th>
                <th className="p-3 sm:p-3.5">Pure Keyword IR (TF-IDF / BM25)</th>
                <th className="p-3 sm:p-3.5">Standalone Knowledge Graph (SPARQL)</th>
                <th className="p-3 sm:p-3.5 bg-teal-50/70 text-teal-900">Integrated IR + KG (This Lab)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 sm:p-3.5 font-bold text-slate-800">Query Input Format</td>
                <td className="p-3 sm:p-3.5">Free-form natural language text</td>
                <td className="p-3 sm:p-3.5">Structured graph query syntax (SPARQL/Cypher)</td>
                <td className="p-3 sm:p-3.5 bg-teal-50/30 text-teal-800 font-semibold">Free-form query mapped to graph nodes</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 sm:p-3.5 font-bold text-slate-800">Entity Disambiguation</td>
                <td className="p-3 sm:p-3.5">Poor (confuses polysemous homonyms)</td>
                <td className="p-3 sm:p-3.5">Exact (grounded by unique URIs/IDs)</td>
                <td className="p-3 sm:p-3.5 bg-teal-50/30 text-teal-800 font-semibold">High (anchored via graph ontology)</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 sm:p-3.5 font-bold text-slate-800">Relational Reasoning</td>
                <td className="p-3 sm:p-3.5">None (documents are isolated bags of words)</td>
                <td className="p-3 sm:p-3.5">Multi-hop graph paths and inference</td>
                <td className="p-3 sm:p-3.5 bg-teal-50/30 text-teal-800 font-semibold">Multi-hop traversal from retrieved docs</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 sm:p-3.5 font-bold text-slate-800">Vocabulary Mismatch</td>
                <td className="p-3 sm:p-3.5">High failure rate on synonyms</td>
                <td className="p-3 sm:p-3.5">Rigid schema mismatch if labels differ</td>
                <td className="p-3 sm:p-3.5 bg-teal-50/30 text-teal-800 font-semibold">Mitigated via entity synonym links</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 sm:p-3.5 font-bold text-slate-800">Interpretability</td>
                <td className="p-3 sm:p-3.5">Moderate (ranked list of scores)</td>
                <td className="p-3 sm:p-3.5">High (explicit subgraph paths)</td>
                <td className="p-3 sm:p-3.5 bg-teal-50/30 text-teal-800 font-semibold">Very High (visual ranked doc + subgraph)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. LABORATORY PROCEDURE ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Laboratory Procedure
        </h2>
        <div className="space-y-3 pt-1">
          {[
            {
              step: 'Step 1: Formulate Search Query',
              detail: 'Select a pre-configured information scenario (e.g., Semantic Search, Knowledge Graphs, Machine Learning) or type a custom natural language query.',
            },
            {
              step: 'Step 2: Inspect Inverted Keyword Retrieval',
              detail: 'Observe the keyword retrieval engine tokenize the query, remove English stopwords, compute term overlap against corpus documents, and compute ranked relevance scores.',
            },
            {
              step: 'Step 3: Ground Top Documents in the Graph',
              detail: 'Identify the top-ranked document nodes (square markers) in the interactive visual workbench and inspect their explicit connection to domain concepts.',
            },
            {
              step: 'Step 4: Execute 1-Hop Neighbor Traversal',
              detail: 'Click any retrieved document node to highlight its directly connected entity nodes (circle markers) and examine the typed semantic predicates (USES, ENABLES).',
            },
            {
              step: 'Step 5: Expand to 2-Hop Transitive Reasoning',
              detail: 'Traverse secondary entity links to reveal indirectly related technologies, architectural components, or prerequisites not mentioned in the query text.',
            },
            {
              step: 'Step 6: Log Experimental Trials',
              detail: 'Record query parameters, top retrieved document ID, and traversed entity counts into the trial history logger for comparative study.',
            },
            {
              step: 'Step 7: Complete Verification Quiz & Export Report',
              detail: 'Proceed to the comprehension quiz to validate your understanding, then generate your academic lab report and verified completion certificate.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
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
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Key Terminology &amp; Definitions
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {[
            {
              term: 'Information Retrieval (IR)',
              def: 'The algorithmic discipline of discovering, indexing, and ranking relevant documents in response to an unstructured user query.',
            },
            {
              term: 'Knowledge Graph (KG)',
              def: 'A structured multi-relational network representing real-world entities as nodes and their semantic relationships as directed labeled edges.',
            },
            {
              term: 'Document Entry Point',
              def: 'A retrieved document node that serves as the gateway anchor linking the unstructured query to the structured entity graph.',
            },
            {
              term: 'Entity Node',
              def: 'A discrete, uniquely identified domain concept, technology, or topic represented as a vertex in the knowledge network.',
            },
            {
              term: 'Semantic Predicate',
              def: 'A typed relationship edge connecting two entities or a document and an entity (e.g., USES, ENABLES, CONTAINS).',
            },
            {
              term: '1-Hop Traversal',
              def: 'Extracting the immediate direct neighbors of a starting node within an edge distance of 1.',
            },
            {
              term: '2-Hop Expansion',
              def: 'Extending traversal through secondary links to discover transitive relationships and broader contextual dependencies.',
            },
            {
              term: 'Context-Enriched Retrieval',
              def: 'An augmented search paradigm where document relevance is enriched with adjacent entity knowledge for greater depth and explainability.',
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
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          References &amp; Further Reading
        </h2>
        <div className="space-y-3 pt-1">
          {[
            {
              title: 'Introducing the Knowledge Graph: things, not strings',
              authors: 'Singhal, A.',
              publication: 'Official Google Blog, 2012.',
              link: 'https://blog.google/products/search/introducing-knowledge-graph-things-not/',
            },
            {
              title: 'TREC Complex Answer Retrieval Overview',
              authors: 'Dietz, L., Verma, M., Radlinski, F., & Craswell, N.',
              publication: 'Proceedings of the 27th Text REtrieval Conference (TREC), 2018.',
              link: 'https://trec-car.cs.unh.edu/',
            },
            {
              title: 'Explicit Semantic Ranking for Academic Search via Knowledge Graph Embedding',
              authors: 'Xiong, C., Power, R., & Callan, J.',
              publication: 'Proceedings of the 26th International Conference on World Wide Web (WWW), 2017.',
              link: 'https://dl.acm.org/doi/10.1145/3038912.3052558',
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
                className="text-teal-600 hover:text-teal-700 p-1.5 rounded-lg hover:bg-teal-50 transition-colors shrink-0"
                title="View Source"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    
      {/* ── Experiment Contributors ── */}
      <ExperimentContributors expNumber={14} />
    </div>
  );
}
