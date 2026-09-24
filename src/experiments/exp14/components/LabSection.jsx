import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Search, Network, Hash, BarChart2, CheckCircle,
  XCircle, HelpCircle, RefreshCw, ChevronRight, Database,
  Layers, Sparkles, Filter, Info, Eye
} from 'lucide-react';

export const DOCUMENTS = [
  { id: 'D1', title: 'Semantic Search with Dense Embeddings', text: 'Dense neural embeddings map natural language queries and documents into continuous vector spaces to retrieve conceptually similar content beyond exact keyword matching.' },
  { id: 'D2', title: 'Knowledge Graphs for Information Retrieval', text: 'Knowledge graphs represent structured entities and semantic relationships, enhancing search engines with contextual reasoning and factual graph exploration.' },
  { id: 'D3', title: 'Hybrid Retrieval and Rank Fusion', text: 'Hybrid retrieval combines BM25 lexical keyword matching with dense vector retrieval using reciprocal rank fusion for robust search recall and precision.' },
  { id: 'D4', title: 'Named Entity Recognition and Relation Extraction', text: 'Entity and relation extraction pipelines identify named entities in raw text corpora and discover semantic predicates to construct connected graph triples.' },
  { id: 'D5', title: 'Graph-Based Multi-Hop Contextual Exploration', text: 'Retrieved entry documents allow search systems to traverse multi-hop graph neighborhoods, discovering implicit relationships and relevant context across documents.' },
  { id: 'D6', title: 'Vector Databases and ANN Indexing', text: 'Vector database indexers use algorithms like HNSW and IVF to perform ultra-fast approximate nearest neighbor similarity searches on high-dimensional dense embeddings.' },
  { id: 'D7', title: 'Ontology Modeling and Semantic Web Standards', text: 'Ontology modeling formalizes domain schemas using RDF, OWL, and RDFS standards to enable semantic querying and automated inference in knowledge bases.' },
  { id: 'D8', title: 'BM25 Lexical Scoring and TF-IDF Weighting', text: 'The BM25 probabilistic retrieval algorithm scores documents based on term frequency, inverse document frequency, and document length normalization.' },
  { id: 'D9', title: 'Entity Linking and Disambiguation in Text', text: 'Entity linking associates ambiguous textual mentions with specific unique nodes in a knowledge graph using contextual coherence and semantic similarity.' },
  { id: 'D10', title: 'SPARQL Querying and Knowledge Base Retrieval', text: 'SPARQL graph queries retrieve structured facts and subgraphs from RDF triple stores by matching complex graph pattern filters and path expressions.' },
  { id: 'D11', title: 'Cross-Encoder Reranking in Semantic Search', text: 'Cross-encoders process query-document pairs jointly with deep self-attention to compute highly accurate semantic relevance scores during late-stage reranking.' },
  { id: 'D12', title: 'Graph Neural Networks for Knowledge Representation', text: 'Graph Neural Networks (GNNs) and node embedding models learn low-dimensional latent representations for link prediction and entity classification in knowledge graphs.' },
  { id: 'D13', title: 'Inverted Index Data Structures in Search Engines', text: 'An inverted index maps vocabulary terms to posting lists containing document IDs and term positions, powering sub-millisecond keyword lookup.' },
  { id: 'D14', title: 'Question Answering with Knowledge Graph Integration', text: 'Knowledge-graph-augmented question answering systems combine textual passage retrieval with structured graph paths to generate factually grounded answers.' },
  { id: 'D15', title: 'Context Enrichment and Retrieval-Augmented Generation (RAG)', text: 'Retrieval-Augmented Generation extracts relevant documents and graph context to enrich LLM prompts, reducing hallucinations and improving factual accuracy.' },
  { id: 'D16', title: 'Cosine Similarity and Vector Distance Metrics', text: 'Cosine similarity measures the angle between query and document embedding vectors, determining semantic closeness independent of vector magnitude.' },
  { id: 'D17', title: 'Knowledge Graph Completion and Link Prediction', text: 'Knowledge graph completion predicts missing entity relationships and facts using tensor factorization and translational distance models like TransE and RotatE.' },
  { id: 'D18', title: 'Query Expansion and Pseudo-Relevance Feedback', text: 'Query expansion enriches short search queries by extracting synonyms and top feedback terms from initial retrieval results or knowledge graph taxonomies.' },
  { id: 'D19', title: 'Multi-Modal Information Retrieval Systems', text: 'Multi-modal retrieval models embed text, images, and graph metadata into a unified semantic space for cross-modal search and associative discovery.' },
  { id: 'D20', title: 'Graph Traversal Algorithms for Entity Context Discovery', text: 'Breadth-first search and PageRank algorithms traverse connected knowledge graph paths to rank contextual entities relevant to a retrieved document node.' }
];

export const GRAPH_NODES = [
  // Top Tier Documents (D1 to D10)
  { id: 'D1',  type: 'document', label: 'Semantic Search', sub: 'Dense Vectors', x: 65,  y: 70 },
  { id: 'D2',  type: 'document', label: 'KG for IR', sub: 'Structured Search', x: 158, y: 70 },
  { id: 'D3',  type: 'document', label: 'Hybrid Retrieval', sub: 'Rank Fusion', x: 250, y: 70 },
  { id: 'D4',  type: 'document', label: 'NER & Extraction', sub: 'Relation Triples', x: 343, y: 70 },
  { id: 'D5',  type: 'document', label: 'Multi-Hop Graph', sub: 'Exploration', x: 436, y: 70 },
  { id: 'D6',  type: 'document', label: 'Vector DBs', sub: 'ANN Search', x: 528, y: 70 },
  { id: 'D7',  type: 'document', label: 'Ontologies', sub: 'RDF / OWL', x: 621, y: 70 },
  { id: 'D8',  type: 'document', label: 'BM25 Scoring', sub: 'Lexical TF-IDF', x: 713, y: 70 },
  { id: 'D9',  type: 'document', label: 'Entity Linking', sub: 'Disambiguation', x: 806, y: 70 },
  { id: 'D10', type: 'document', label: 'SPARQL Queries', sub: 'Knowledge Base', x: 898, y: 70 },

  // Middle Tier 1 Entities (E1 to E5)
  { id: 'E1', type: 'entity', label: 'Dense', sub: 'Embeddings', x: 130, y: 200 },
  { id: 'E2', type: 'entity', label: 'Vector', sub: 'Search', x: 310, y: 200 },
  { id: 'E3', type: 'entity', label: 'Knowledge', sub: 'Graph', x: 490, y: 200 },
  { id: 'E4', type: 'entity', label: 'Information', sub: 'Retrieval', x: 670, y: 200 },
  { id: 'E5', type: 'entity', label: 'Hybrid', sub: 'Fusion', x: 840, y: 200 },

  // Middle Tier 2 Entities (E6 to E10)
  { id: 'E6', type: 'entity', label: 'Entity', sub: 'Extraction', x: 130, y: 340 },
  { id: 'E7', type: 'entity', label: 'Graph', sub: 'Traversal', x: 310, y: 340 },
  { id: 'E8', type: 'entity', label: 'BM25', sub: 'Lexical', x: 490, y: 340 },
  { id: 'E9', type: 'entity', label: 'Entity', sub: 'Linking', x: 670, y: 340 },
  { id: 'E10', type: 'entity', label: 'RAG &', sub: 'Context', x: 840, y: 340 },

  // Bottom Tier Documents (D11 to D20)
  { id: 'D11', type: 'document', label: 'Cross-Encoders', sub: 'Reranking', x: 65,  y: 470 },
  { id: 'D12', type: 'document', label: 'Graph NNs', sub: 'GNN Embeddings', x: 158, y: 470 },
  { id: 'D13', type: 'document', label: 'Inverted Index', sub: 'Posting Lists', x: 250, y: 470 },
  { id: 'D14', type: 'document', label: 'KG QA Systems', sub: 'Fact Grounding', x: 343, y: 470 },
  { id: 'D15', type: 'document', label: 'RAG Pipeline', sub: 'LLM Context', x: 436, y: 470 },
  { id: 'D16', type: 'document', label: 'Cosine Metric', sub: 'Vector Angle', x: 528, y: 470 },
  { id: 'D17', type: 'document', label: 'KG Completion', sub: 'Link Prediction', x: 621, y: 470 },
  { id: 'D18', type: 'document', label: 'Query Expand', sub: 'Feedback Terms', x: 713, y: 470 },
  { id: 'D19', type: 'document', label: 'Multi-Modal IR', sub: 'Cross-Modal', x: 806, y: 470 },
  { id: 'D20', type: 'document', label: 'Graph Search', sub: 'PageRank Path', x: 898, y: 470 },
];

export const GRAPH_EDGES = [
  // D1-D10 connections to entities
  { src: 'D1', dst: 'E1', label: 'USES' },
  { src: 'D1', dst: 'E2', label: 'ENABLES' },
  { src: 'D2', dst: 'E3', label: 'USES' },
  { src: 'D2', dst: 'E4', label: 'ENRICHES' },
  { src: 'D3', dst: 'E5', label: 'IMPLEMENTS' },
  { src: 'D3', dst: 'E8', label: 'COMBINES' },
  { src: 'D4', dst: 'E6', label: 'PERFORMS' },
  { src: 'D4', dst: 'E3', label: 'BUILDS' },
  { src: 'D5', dst: 'E7', label: 'EXPLORES' },
  { src: 'D5', dst: 'E3', label: 'TRAVERSES' },
  { src: 'D6', dst: 'E2', label: 'INDEXES' },
  { src: 'D6', dst: 'E1', label: 'STORES' },
  { src: 'D7', dst: 'E3', label: 'MODELS' },
  { src: 'D8', dst: 'E8', label: 'SCORES' },
  { src: 'D8', dst: 'E4', label: 'SUPPORTS' },
  { src: 'D9', dst: 'E9', label: 'MAPS' },
  { src: 'D9', dst: 'E3', label: 'TARGETS' },
  { src: 'D10', dst: 'E3', label: 'QUERIES' },

  // D11-D20 connections to entities
  { src: 'D11', dst: 'E2', label: 'RERANKS' },
  { src: 'D11', dst: 'E4', label: 'OPTIMIZES' },
  { src: 'D12', dst: 'E3', label: 'EMBEDS' },
  { src: 'D12', dst: 'E7', label: 'REASONS' },
  { src: 'D13', dst: 'E4', label: 'POWERS' },
  { src: 'D13', dst: 'E8', label: 'STRUCTURES' },
  { src: 'D14', dst: 'E3', label: 'RETRIEVES' },
  { src: 'D14', dst: 'E10', label: 'FEEDS' },
  { src: 'D15', dst: 'E10', label: 'ENRICHES' },
  { src: 'D15', dst: 'E3', label: 'GROUNDS' },
  { src: 'D16', dst: 'E1', label: 'COMPUTES' },
  { src: 'D16', dst: 'E2', label: 'RANKS' },
  { src: 'D17', dst: 'E3', label: 'COMPLETES' },
  { src: 'D17', dst: 'E9', label: 'PREDICTS' },
  { src: 'D18', dst: 'E4', label: 'EXPANDS' },
  { src: 'D18', dst: 'E9', label: 'USES_TAXONOMY' },
  { src: 'D19', dst: 'E1', label: 'EMBEDS' },
  { src: 'D19', dst: 'E4', label: 'EXTENDS' },
  { src: 'D20', dst: 'E7', label: 'ALGORITHM' },
  { src: 'D20', dst: 'E3', label: 'NAVIGATES' },

  // Inter-entity relationships
  { src: 'E1', dst: 'E2', label: 'ENABLES' },
  { src: 'E2', dst: 'E5', label: 'FUSES_WITH' },
  { src: 'E8', dst: 'E5', label: 'FUSES_WITH' },
  { src: 'E3', dst: 'E7', label: 'FACILITATES' },
  { src: 'E6', dst: 'E9', label: 'PRECEDES' },
  { src: 'E9', dst: 'E3', label: 'POPULATES' },
  { src: 'E3', dst: 'E10', label: 'AUGMENTS' },
  { src: 'E4', dst: 'E10', label: 'SUPPLIES' },
];

const STOPWORDS = new Set([
  'a','an','the','is','are','was','were','of','to','in','for','and','or','with',
  'on','at','from','by','how','what','which','who','when','where','why','using',
  'into','can','be','as','that','this','these','those','their','its','an','all'
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

function retrievalScore(query, doc) {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return { score: 0, matched: [] };

  const titleTokens = tokenize(doc.title);
  const textTokens = tokenize(doc.text);
  const allDocTokens = [...titleTokens, ...textTokens];

  const matchedTerms = [];
  let rawScore = 0;

  for (const qTerm of qTokens) {
    let termFreq = 0;
    let titleHit = false;

    for (const t of titleTokens) {
      if (t === qTerm || (qTerm.length > 3 && (t.startsWith(qTerm) || qTerm.startsWith(t)))) {
        termFreq += 3.5; // High weight for title occurrence
        titleHit = true;
      }
    }

    for (const t of textTokens) {
      if (t === qTerm || (qTerm.length > 3 && (t.startsWith(qTerm) || qTerm.startsWith(t)))) {
        termFreq += 1.0;
      }
    }

    if (termFreq > 0) {
      matchedTerms.push(qTerm);
      // Sublinear TF saturation formula: tf / (tf + 1.2)
      const tfWeight = termFreq / (termFreq + 1.2);
      rawScore += tfWeight * (titleHit ? 1.4 : 1.0);
    }
  }

  if (matchedTerms.length === 0) {
    return { score: 0.0, matched: [] };
  }

  // Multi-term coverage factor (all query terms matched = full bonus)
  const coverage = matchedTerms.length / qTokens.length;
  // Document length normalization
  const docLenNorm = Math.sqrt(allDocTokens.length) / 5.5;

  // Calibrated score mapping between 0.100 and 0.990
  const normalizedScore = (rawScore / (qTokens.length * 1.3)) * (0.4 + 0.6 * coverage) / docLenNorm;
  const finalScore = Math.min(0.995, Math.max(0.080, normalizedScore));

  return {
    score: Math.round(finalScore * 1000) / 1000,
    matched: Array.from(new Set(matchedTerms))
  };
}

function retrieveDocuments(query, topK = 5) {
  const results = DOCUMENTS.map(doc => {
    const { score, matched } = retrievalScore(query, doc);
    return { ...doc, score, matched };
  });

  return results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

function getConnectedContext(nodeId) {
  const ctx = [];
  for (const edge of GRAPH_EDGES) {
    if (edge.src === nodeId) {
      ctx.push({ src: edge.src, rel: edge.label, dst: edge.dst, dir: 'out' });
    } else if (edge.dst === nodeId) {
      ctx.push({ src: edge.src, rel: edge.label, dst: edge.dst, dir: 'in' });
    }
  }
  return ctx;
}

const NODE_LOOKUP = Object.fromEntries(GRAPH_NODES.map(n => [n.id, n]));

function KnowledgeGraphAnimation({ highlightNodes = [], focusNode = null, onSelectNode = null }) {
  const [phase, setPhase] = useState('idle');
  const [visibleNodes, setVisibleNodes] = useState([]);
  const [visibleEdges, setVisibleEdges] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);

  const buildGraph = useCallback(() => {
    setVisibleNodes([]);
    setVisibleEdges([]);
    setPhase('building-nodes');

    GRAPH_NODES.forEach((node, i) => {
      setTimeout(() => {
        setVisibleNodes(prev => [...prev, node.id]);
        if (i === GRAPH_NODES.length - 1) {
          setTimeout(() => {
            setPhase('building-edges');
            GRAPH_EDGES.forEach((edge, j) => {
              setTimeout(() => {
                setVisibleEdges(prev => [...prev, `${edge.src}-${edge.dst}`]);
                if (j === GRAPH_EDGES.length - 1) setPhase('done');
              }, j * 40);
            });
          }, 200);
        }
      }, i * 35);
    });
  }, []);

  useEffect(() => {
    buildGraph();
  }, [buildGraph]);

  const SVG_W = 960;
  const SVG_H = 550;

  // Compute focus sub-graph if a node is focused
  let focusNeighbors = new Set();
  let focusEdges = [];
  if (focusNode) {
    focusNeighbors.add(focusNode);
    GRAPH_EDGES.forEach(e => {
      if (e.src === focusNode) {
        focusNeighbors.add(e.dst);
        focusEdges.push(e);
      }
      if (e.dst === focusNode) {
        focusNeighbors.add(e.src);
        focusEdges.push(e);
      }
    });
  }

  const shownNodeIds = focusNode
    ? GRAPH_NODES.filter(n => focusNeighbors.has(n.id)).map(n => n.id)
    : visibleNodes;

  const shownEdges = focusNode
    ? focusEdges
    : GRAPH_EDGES.filter(e => visibleEdges.includes(`${e.src}-${e.dst}`));

  const activeFocus = focusNode || hoveredNode;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header bar - Professional Clean Light Theme */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
            <Network className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-slate-800">
            {focusNode ? `Focused Context: ${focusNode} — ${NODE_LOOKUP[focusNode]?.label || focusNode}` : `Knowledge Graph — 20 Documents + 10 Entities (${GRAPH_EDGES.length} Typed Edges)`}
          </span>
          {phase === 'building-nodes' && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold animate-pulse border border-amber-200">
              Generating 30 Nodes…
            </span>
          )}
          {phase === 'building-edges' && (
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold animate-pulse border border-teal-200">
              Drawing Relationships…
            </span>
          )}
          {phase === 'done' && !focusNode && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Graph Ready
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {focusNode && (
            <button
              onClick={() => onSelectNode && onSelectNode(null)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" /> View All 30 Nodes
            </button>
          )}
          <button
            onClick={buildGraph}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Replay
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas - Light Clean Canvas */}
      <div className="overflow-x-auto bg-[#f8fafc] p-3 flex justify-center border-b border-slate-100">
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="max-w-full select-none"
        >
          <defs>
            {/* Arrow markers */}
            <marker id="arrowDefault" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill="#94a3b8" />
            </marker>
            <marker id="arrowHighlight" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#0d9488" />
            </marker>
            <marker id="arrowFocus" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
              <path d="M0,0 L9,4.5 L0,9 Z" fill="#e11d48" />
            </marker>

            {/* Gradients */}
            <linearGradient id="docGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <linearGradient id="docGradHotLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
            <linearGradient id="entityGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>
            <linearGradient id="entityGradHotLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d1fae5" />
              <stop offset="100%" stopColor="#a7f3d0" />
            </linearGradient>
            <linearGradient id="focusGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe4e6" />
              <stop offset="100%" stopColor="#fecdd3" />
            </linearGradient>
          </defs>

          {/* Background grid dots for clean aesthetic */}
          <g opacity="0.4">
            {Array.from({ length: 24 }).map((_, xi) =>
              Array.from({ length: 14 }).map((_, yi) => (
                <circle key={`${xi}-${yi}`} cx={xi * 42 + 20} cy={yi * 40 + 15} r="1" fill="#cbd5e1" />
              ))
            )}
          </g>

          {/* Section guide labels */}
          {!focusNode && (
            <g opacity="0.6" fontSize="9" fontWeight="700" fill="#64748b" letterSpacing="0.8">
              <text x="25" y="24">TOP DOCUMENTS (D1 – D10)</text>
              <text x="25" y="152">CORE KNOWLEDGE GRAPH ENTITIES (E1 – E10)</text>
              <text x="25" y="422">BOTTOM DOCUMENTS (D11 – D20)</text>
            </g>
          )}

          {/* Render Edges */}
          {shownEdges.map(edge => {
            const sn = NODE_LOOKUP[edge.src];
            const dn = NODE_LOOKUP[edge.dst];
            if (!sn || !dn) return null;

            const isRelatedToFocus = activeFocus && (edge.src === activeFocus || edge.dst === activeFocus);
            const isHighlight = highlightNodes.includes(edge.src) || highlightNodes.includes(edge.dst);
            const isHot = isRelatedToFocus || isHighlight;

            const dx = dn.x - sn.x;
            const dy = dn.y - sn.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            const srcIsDoc = sn.type === 'document';
            const dstIsDoc = dn.type === 'document';
            const srcRadius = srcIsDoc ? 24 : 26;
            const dstRadius = dstIsDoc ? 24 : 26;

            const x1 = sn.x + (dx / dist) * srcRadius;
            const y1 = sn.y + (dy / dist) * srcRadius;
            const x2 = dn.x - (dx / dist) * (dstRadius + 5);
            const y2 = dn.y - (dy / dist) * (dstRadius + 5);

            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;

            const marker = activeFocus && (edge.src === activeFocus || edge.dst === activeFocus)
              ? 'url(#arrowFocus)'
              : isHot
              ? 'url(#arrowHighlight)'
              : 'url(#arrowDefault)';

            const strokeColor = activeFocus && (edge.src === activeFocus || edge.dst === activeFocus)
              ? '#e11d48'
              : isHot
              ? '#0d9488'
              : '#cbd5e1';

            return (
              <g key={`${edge.src}-${edge.dst}`} className="transition-all duration-300">
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeColor}
                  strokeWidth={isHot ? 2.2 : 1.2}
                  strokeDasharray={isHot ? 'none' : '3,3'}
                  markerEnd={marker}
                  opacity={activeFocus ? (isHot ? 1 : 0.25) : 0.75}
                />
                {(isHot || focusNode) && (
                  <g transform={`translate(${mx}, ${my})`}>
                    <rect
                      x="-32"
                      y="-8"
                      width="64"
                      height="16"
                      rx="8"
                      fill="#ffffff"
                      stroke={strokeColor}
                      strokeWidth="1.2"
                      filter="drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05))"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fontSize="7.5"
                      fontWeight="700"
                      fill={activeFocus && (edge.src === activeFocus || edge.dst === activeFocus) ? '#be123c' : '#0f766e'}
                      letterSpacing="0.5"
                    >
                      {edge.label.replace(/_/g, ' ')}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Nodes */}
          {GRAPH_NODES.filter(n => shownNodeIds.includes(n.id)).map(node => {
            const isDoc = node.type === 'document';
            const isFocus = node.id === focusNode;
            const isHighlighted = highlightNodes.includes(node.id);
            const isDimmed = activeFocus && !focusNeighbors.has(node.id) && activeFocus !== node.id && !highlightNodes.includes(node.id);

            const docW = 78;
            const docH = 44;
            const entR = 26;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onSelectNode && onSelectNode(isFocus ? null : node.id)}
                className="cursor-pointer"
                opacity={isDimmed ? 0.25 : 1}
              >
                {/* Focus Pulsing Ring */}
                {isFocus && (
                  <circle
                    r={isDoc ? 36 : 38}
                    fill="none"
                    stroke="#e11d48"
                    strokeWidth="2"
                    opacity="0.5"
                    className="animate-ping"
                  />
                )}

                {/* Node Shape */}
                {isDoc ? (
                  <rect
                    x={-docW / 2}
                    y={-docH / 2}
                    width={docW}
                    height={docH}
                    rx="8"
                    fill={isFocus ? 'url(#focusGradLight)' : isHighlighted ? 'url(#docGradHotLight)' : 'url(#docGradLight)'}
                    stroke={isFocus ? '#e11d48' : isHighlighted ? '#0284c7' : '#3b82f6'}
                    strokeWidth={isFocus || isHighlighted ? 2.5 : 1.5}
                    filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))"
                  />
                ) : (
                  <circle
                    r={entR}
                    fill={isFocus ? 'url(#focusGradLight)' : isHighlighted ? 'url(#entityGradHotLight)' : 'url(#entityGradLight)'}
                    stroke={isFocus ? '#e11d48' : isHighlighted ? '#059669' : '#f59e0b'}
                    strokeWidth={isFocus || isHighlighted ? 2.5 : 2}
                    filter="drop-shadow(0 2px 5px rgba(245, 158, 11, 0.2))"
                  />
                )}

                {/* Node Text - Crisp Dark Slate Typography */}
                {isDoc ? (
                  <>
                    <text
                      x="0"
                      y="-6"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="800"
                      fill={isFocus ? '#be123c' : '#2563eb'}
                      letterSpacing="0.5"
                    >
                      {node.id}
                    </text>
                    <text
                      x="0"
                      y="5"
                      textAnchor="middle"
                      fontSize="7.5"
                      fontWeight="700"
                      fill="#0f172a"
                    >
                      {node.label}
                    </text>
                    <text
                      x="0"
                      y="14"
                      textAnchor="middle"
                      fontSize="6.5"
                      fontWeight="500"
                      fill="#64748b"
                    >
                      {node.sub}
                    </text>
                  </>
                ) : (
                  <>
                    <text
                      x="0"
                      y="-11"
                      textAnchor="middle"
                      fontSize="7.5"
                      fontWeight="900"
                      fill={isFocus ? '#be123c' : isHighlighted ? '#065f46' : '#b45309'}
                    >
                      {node.id}
                    </text>
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="800"
                      fill={isFocus ? '#9f1239' : isHighlighted ? '#064e3b' : '#78350f'}
                    >
                      {node.label}
                    </text>
                    <text
                      x="0"
                      y="11"
                      textAnchor="middle"
                      fontSize="7"
                      fontWeight="600"
                      fill={isFocus ? '#be123c' : isHighlighted ? '#047857' : '#92400e'}
                    >
                      {node.sub}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend Footer - Clean Light Theme */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-t border-slate-200 text-xs text-slate-600 flex-wrap gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="flex items-center gap-2">
            <span className="w-4 h-3.5 rounded bg-blue-50 border-2 border-blue-500 inline-block shadow-2xs" />
            <span className="font-semibold text-slate-700">Document Node (D1 – D20)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-100 border-2 border-amber-500 inline-block shadow-2xs" />
            <span className="font-semibold text-slate-700">Entity Concept Node (E1 – E10)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-100 border-2 border-rose-500 inline-block shadow-2xs" />
            <span className="font-semibold text-rose-700">Selected / Focus Node</span>
          </span>
        </div>
        <div className="text-slate-500 text-xs font-medium">
          💡 Click any node or document result card to isolate its 1-hop graph neighborhood
        </div>
      </div>
    </div>
  );
}

const SAMPLE_QUERIES = [
  'semantic search dense embeddings',
  'knowledge graph information retrieval',
  'hybrid retrieval BM25 reciprocal rank fusion',
  'named entity recognition relation extraction',
  'vector database approximate nearest neighbor',
  'graph traversal contextual exploration',
  'retrieval augmented generation RAG context',
  'SPARQL querying RDF knowledge base'
];

export default function LabSection({ onRecordTrial, trials, onGoToQuiz }) {
  const [query, setQuery] = useState('');
  const [selectedQuery, setSelectedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [focusDoc, setFocusDoc] = useState(null);
  const [graphContext, setGraphContext] = useState([]);
  const [topK, setTopK] = useState(5);
  const [corpusFilter, setCorpusFilter] = useState('');

  const handleSearch = useCallback(async (customQ) => {
    const q = (customQ !== undefined ? customQ : query).trim();
    if (!q) return;

    setIsSearching(true);
    setResults(null);
    setFocusDoc(null);
    setGraphContext([]);

    await new Promise(r => setTimeout(r, 400));
    const res = retrieveDocuments(q, topK);
    setResults({
      items: res,
      query: q,
      time: (Math.random() * 6 + 1.5).toFixed(1)
    });
    setIsSearching(false);
  }, [query, topK]);

  const handleSelectSample = (q) => {
    setQuery(q);
    setSelectedQuery(q);
    handleSearch(q);
  };

  const handleSelectDoc = (docId) => {
    if (focusDoc === docId) {
      setFocusDoc(null);
      setGraphContext([]);
    } else {
      setFocusDoc(docId);
      setGraphContext(getConnectedContext(docId));
    }
  };

  const handleRecord = () => {
    if (!results) return;
    onRecordTrial({
      id: trials.length + 1,
      query: results.query,
      topK,
      hits: results.items.length,
      topScore: results.items[0]?.score?.toFixed(3) ?? '-',
      topDoc: results.items[0]?.title ?? '-',
      selectedDoc: focusDoc ?? '-',
      graphEdges: graphContext.length,
      time: results.time
    });
  };

  const filteredDocs = DOCUMENTS.filter(d =>
    d.title.toLowerCase().includes(corpusFilter.toLowerCase()) ||
    d.text.toLowerCase().includes(corpusFilter.toLowerCase()) ||
    d.id.toLowerCase().includes(corpusFilter.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 flex items-center justify-center shadow-md">
          <FlaskConical className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Simulation Lab — IR + Knowledge Graph Integration</h1>
          <p className="text-xs text-slate-500">20-Document Corpus, Calibrated Relevance Ranking, and Structured Context Traversal</p>
        </div>
      </div>

      {/* Step 1: Knowledge Graph Component */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-800">
              {focusDoc ? `Focused Neighborhood: ${focusDoc}` : 'Knowledge Graph Exploration Canvas (20 Documents + 10 Entities)'}
            </h2>
          </div>
          {focusDoc && (
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Filtered to {focusDoc} Context
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">
          {focusDoc
            ? 'Viewing direct connected entities and relationships for the selected document. Click "View All" or another document to switch view.'
            : 'Structured knowledge base graph linking retrievable documents with semantic entities. Click any node or search result to isolate its sub-graph.'}
        </p>

        <KnowledgeGraphAnimation
          highlightNodes={focusDoc ? [focusDoc, ...graphContext.map(e => e.src === focusDoc ? e.dst : e.src)] : []}
          focusNode={focusDoc}
          onSelectNode={handleSelectDoc}
        />
      </div>

      <hr className="border-slate-200" />

      {/* Step 2: Query Console */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-4 h-4 text-teal-500" />
            Document Retrieval Query Console
          </h2>
          <span className="text-xs text-slate-400 font-medium">Corpus Size: {DOCUMENTS.length} Documents</span>
        </div>

        <div>
          <label className="text-xs text-slate-500 font-semibold mb-2 block">Quick Sample Queries:</label>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_QUERIES.map(q => (
              <button
                key={q}
                onClick={() => handleSelectSample(q)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  selectedQuery === q
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/70'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div>
          <textarea
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedQuery('');
            }}
            placeholder="Type a query such as 'semantic search dense embeddings' or 'graph traversal context'…"
            className="w-full p-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-500 bg-slate-50 font-medium"
            rows={2}
          />
        </div>

        {/* Top-K Range Slider */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
              Top-K Documents to Retrieve:
            </label>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-black text-xs border border-teal-200 shadow-sm">
              {topK} Documents
            </span>
          </div>
          <div className="py-2">
            <input
              type="range"
              min={1}
              max={20}
              value={topK}
              onChange={e => setTopK(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>1 (Top match)</span>
            <span>5 (Default)</span>
            <span>10</span>
            <span>20 (Full corpus)</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleSearch()}
          disabled={!query.trim() || isSearching}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSearching ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Computing Relevance Scores…
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Execute Retrieval Pipeline
            </>
          )}
        </motion.button>
      </div>

      {/* Step 3: Retrieval Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Metric Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Scoring Model', val: 'BM25 + TF' },
                { label: 'Corpus Evaluated', val: `${DOCUMENTS.length} docs` },
                { label: 'Retrieval Latency', val: `${results.time} ms` },
                { label: 'Retrieved Hits', val: `${results.items.length} docs` }
              ].map(({ label, val }) => (
                <div key={label} className="p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
                  <div className="text-xl font-black text-teal-700">{val}</div>
                  <div className="text-xs text-slate-500 mt-0.5 font-semibold">{label}</div>
                </div>
              ))}
            </div>

            {/* Pipeline Execution Trace - Clean Professional Light Theme */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1.5 shadow-2xs">
              <div className="text-teal-700 font-bold border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>⚡ IR Pipeline Execution Trace</span>
                <span className="text-xs text-slate-500 font-normal">Top-{topK} Selection</span>
              </div>
              <div className="text-slate-700">
                <span className="text-slate-500 font-semibold">Query String:</span> "{results.query}"
              </div>
              <div className="text-slate-700">
                <span className="text-slate-500 font-semibold">Tokens Extracted:</span> [{tokenize(results.query).join(', ') || 'none'}]
              </div>
              <div className="text-slate-700">
                <span className="text-slate-500 font-semibold">Corpus Evaluated:</span> 20 documents indexed
              </div>
              <div className="text-teal-700 font-medium">
                👉 Click any retrieved document card to highlight its connected Knowledge Graph context
              </div>
            </div>

            {/* Results List */}
            {results.items.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center">
                <XCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Documents Matched</h4>
                <p className="text-xs text-slate-500 mt-1">Try other search terms such as "semantic", "embeddings", "graph", or "retrieval".</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.items.map((r, idx) => {
                  const isSelected = focusDoc === r.id;
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.25 }}
                      onClick={() => handleSelectDoc(r.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm hover:shadow-md ${
                        isSelected
                          ? 'border-rose-500 border-l-4 border-l-rose-500 bg-rose-50/70 shadow-md ring-1 ring-rose-300'
                          : 'border-slate-200 border-l-4 border-l-teal-600 bg-white hover:border-teal-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {r.id}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">{r.title}</span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed mb-2.5">{r.text}</p>

                          {r.matched.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs text-slate-400 font-semibold">Matched Tokens:</span>
                              {r.matched.map(t => (
                                <span key={t} className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-xs font-bold">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {isSelected && (
                            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-700 font-bold">
                              <Network className="w-3.5 h-3.5" />
                              Highlighting graph neighborhood in canvas above
                            </div>
                          )}
                        </div>

                        {/* Relevance Score Display */}
                        <div className="text-right shrink-0 min-w-[90px]">
                          <div className="text-2xl font-black text-emerald-600 font-mono">
                            {r.score.toFixed(3)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            RELEVANCE
                          </div>
                          <div className="w-24 h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden border border-slate-200">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(0, Math.min(100, r.score * 100))}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-teal-700 font-semibold mt-1">
                            {isSelected ? 'Selected' : 'Click to inspect'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Sub-Graph Context Card */}
            <AnimatePresence>
              {focusDoc && graphContext.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl border border-teal-300 bg-teal-50/80 space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-teal-700" />
                      <span className="font-bold text-teal-900 text-sm">
                        Graph Traversal Triples for {focusDoc} ({NODE_LOOKUP[focusDoc]?.label})
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-teal-200 text-teal-800 text-xs font-bold">
                      {graphContext.length} Connected Edges
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    {graphContext.map((ctx, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white border border-teal-200 font-mono text-xs shadow-xs"
                      >
                        <span className="px-2 py-0.5 rounded bg-blue-900 text-white font-bold">{ctx.src}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px]">
                          {ctx.rel}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="px-2 py-0.5 rounded bg-teal-700 text-white font-bold">{ctx.dst}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Record Trial Button */}
            <div className="flex items-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRecord}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-300 bg-teal-50 text-teal-700 font-bold text-xs hover:bg-teal-100 transition-colors shadow-sm"
              >
                <Hash className="w-3.5 h-3.5" />
                Record Experiment Trial
              </motion.button>
              {trials.length > 0 && (
                <span className="text-xs font-semibold text-slate-500">
                  {trials.length} trial{trials.length !== 1 ? 's' : ''} recorded
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <hr className="border-slate-200" />

      {/* Step 4: 20-Document Corpus Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Document Corpus Reference ({DOCUMENTS.length} Documents Total)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={corpusFilter}
              onChange={e => setCorpusFilter(e.target.value)}
              placeholder="Filter corpus documents…"
              className="px-3 py-1 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm max-h-80 overflow-y-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 text-slate-800 border-b border-slate-200 z-10 font-bold">
              <tr>
                <th className="px-3 py-2.5 text-left font-semibold w-16">ID</th>
                <th className="px-3 py-2.5 text-left font-semibold w-56">Title</th>
                <th className="px-3 py-2.5 text-left font-semibold">Content Summary</th>
                <th className="px-3 py-2.5 text-center font-semibold w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredDocs.map((doc, i) => {
                const isSelected = focusDoc === doc.id;
                return (
                  <tr
                    key={doc.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-rose-50'
                        : i % 2 === 0
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-slate-50/70 hover:bg-slate-100/70'
                    }`}
                  >
                    <td className="px-3 py-2 font-mono font-bold text-indigo-700">{doc.id}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{doc.title}</td>
                    <td className="px-3 py-2 text-slate-600 leading-relaxed">{doc.text}</td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleSelectDoc(doc.id)}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-800'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recorded Trials Table */}
      {trials.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Recorded Experiment Trials ({trials.length})
            </h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-teal-700 text-white">
                  {['#', 'Query', 'Top-K', 'Hits', 'Top Score', 'Top Document', 'Focused Doc', 'Graph Edges', 'Latency'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {trials.map((t, i) => (
                  <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-3 py-2 font-mono font-bold text-teal-700">{t.id}</td>
                    <td className="px-3 py-2 text-slate-800 font-medium max-w-xs truncate">{t.query}</td>
                    <td className="px-3 py-2 text-center font-bold text-slate-700">{t.topK}</td>
                    <td className="px-3 py-2 text-center font-bold text-emerald-600">{t.hits}</td>
                    <td className="px-3 py-2 font-mono text-violet-700 font-bold">{t.topScore}</td>
                    <td className="px-3 py-2 text-slate-700 max-w-xs truncate">{t.topDoc}</td>
                    <td className="px-3 py-2 font-mono text-teal-700 font-bold">{t.selectedDoc}</td>
                    <td className="px-3 py-2 text-center text-slate-500">{t.graphEdges}</td>
                    <td className="px-3 py-2 text-slate-500">{t.time} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex justify-center pt-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoToQuiz}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
        >
          <HelpCircle className="w-4 h-4" />
          Proceed to Assessment Quiz
        </motion.button>
      </div>
    </div>
  );
}
