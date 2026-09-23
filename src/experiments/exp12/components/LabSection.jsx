import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Search, Hash, Database, BarChart2,
  CheckCircle, XCircle, ChevronDown, ChevronUp,
  Zap, ArrowRight, HelpCircle, RefreshCw, FlaskConical,
  Sparkles, Layers, Cpu, Compass, Info, CheckCircle2
} from 'lucide-react';

// ── 20-Document Diverse Corpus with Unified Coordinates ───────────────────────
export const CORPUS_DOCS = [
  // ── AI & Machine Learning Cluster (Top-Left) ──
  {
    id: 'D1', title: 'Machine Learning Basics', category: 'ML', cluster: 'ai',
    mapX: 210, mapY: 80, pcaX: 680, pcaY: 95,
    keywords: ['machine learning', 'ml', 'ai', 'artificial intelligence', 'supervised', 'unsupervised', 'training data', 'algorithms', 'patterns'],
    domainVec: { ai: 1.0, ml: 1.0, dl: 0.7, nlp: 0.4, cv: 0.3, data: 0.3, sys: 0.1, sec: 0.0, rob: 0.3, quantum: 0.1, other: 0.0 },
    text: 'Machine learning allows algorithms to learn patterns and decision rules from empirical training data without explicit programming.'
  },
  {
    id: 'D2', title: 'Deep Learning & Neural Networks', category: 'DL', cluster: 'ai',
    mapX: 275, mapY: 65, pcaX: 720, pcaY: 85,
    keywords: ['deep learning', 'dl', 'neural networks', 'neurons', 'backpropagation', 'ai', 'artificial intelligence', 'weights', 'loss', 'layers', 'representation'],
    domainVec: { ai: 1.0, ml: 0.9, dl: 1.0, nlp: 0.6, cv: 0.7, data: 0.2, sys: 0.1, sec: 0.0, rob: 0.4, quantum: 0.1, other: 0.0 },
    text: 'Deep neural networks use multi-layered artificial neurons with backpropagation to extract hierarchical feature representations.'
  },
  {
    id: 'D7', title: 'Reinforcement Learning & Policy Gradients', category: 'ML', cluster: 'ai',
    mapX: 330, mapY: 95, pcaX: 745, pcaY: 125,
    keywords: ['reinforcement learning', 'rl', 'policy gradients', 'q-learning', 'markov decision process', 'agent', 'rewards', 'ai', 'decision making'],
    domainVec: { ai: 0.9, ml: 1.0, dl: 0.7, nlp: 0.2, cv: 0.2, data: 0.2, sys: 0.2, sec: 0.0, rob: 0.8, quantum: 0.1, other: 0.0 },
    text: 'Reinforcement learning optimizes agent actions inside Markov decision processes by maximizing cumulative expected rewards.'
  },
  {
    id: 'D10', title: 'Convolutional Neural Networks', category: 'CV', cluster: 'ai',
    mapX: 155, mapY: 95, pcaX: 635, pcaY: 110,
    keywords: ['convolutional neural networks', 'cnn', 'convolutions', 'filters', 'pooling', 'feature maps', 'cv', 'computer vision', 'images', 'ai'],
    domainVec: { ai: 0.9, ml: 0.8, dl: 0.9, nlp: 0.2, cv: 1.0, data: 0.1, sys: 0.1, sec: 0.0, rob: 0.5, quantum: 0.0, other: 0.0 },
    text: 'CNN architectures apply spatial filter convolutions and pooling layers to extract translation-invariant visual features.'
  },
  {
    id: 'D15', title: 'Generative AI & Latent Diffusion Models', category: 'DL', cluster: 'ai',
    mapX: 190, mapY: 155, pcaX: 655, pcaY: 205,
    keywords: ['generative ai', 'genai', 'diffusion models', 'latent space', 'text to image', 'synthesis', 'denoising', 'ai', 'deep learning'],
    domainVec: { ai: 0.95, ml: 0.8, dl: 1.0, nlp: 0.7, cv: 0.8, data: 0.2, sys: 0.1, sec: 0.0, rob: 0.2, quantum: 0.0, other: 0.0 },
    text: 'Diffusion models reverse a continuous Gaussian noise process in latent vector spaces to synthesize photorealistic images.'
  },

  // ── NLP & Large Language Models Cluster (Mid-Left) ──
  {
    id: 'D3', title: 'Natural Language Processing', category: 'NLP', cluster: 'ai',
    mapX: 255, mapY: 140, pcaX: 680, pcaY: 155,
    keywords: ['natural language processing', 'nlp', 'language', 'linguistics', 'text', 'tokenization', 'statistical models', 'ai', 'parsing'],
    domainVec: { ai: 0.9, ml: 0.7, dl: 0.7, nlp: 1.0, cv: 0.2, data: 0.3, sys: 0.1, sec: 0.0, rob: 0.2, quantum: 0.0, other: 0.0 },
    text: 'NLP enables computational systems to analyze, understand, translate, and generate human language using statistical models.'
  },
  {
    id: 'D9', title: 'Transformer Models & Self-Attention', category: 'NLP', cluster: 'ai',
    mapX: 315, mapY: 150, pcaX: 710, pcaY: 165,
    keywords: ['transformers', 'transformer', 'self-attention', 'attention mechanism', 'multi-head attention', 'bert', 'gpt', 'nlp', 'sequence'],
    domainVec: { ai: 0.9, ml: 0.8, dl: 0.9, nlp: 1.0, cv: 0.4, data: 0.3, sys: 0.1, sec: 0.0, rob: 0.2, quantum: 0.0, other: 0.0 },
    text: 'Self-attention mechanisms dynamically weigh contextual token relationships across entire sequences in parallel.'
  },
  {
    id: 'D12', title: 'Large Language Models & Prompting', category: 'NLP', cluster: 'ai',
    mapX: 365, mapY: 185, pcaX: 730, pcaY: 195,
    keywords: ['large language models', 'llm', 'prompt engineering', 'prompting', 'gpt', 'generative ai', 'zero-shot', 'few-shot', 'nlp', 'ai'],
    domainVec: { ai: 0.95, ml: 0.8, dl: 0.9, nlp: 1.0, cv: 0.3, data: 0.3, sys: 0.1, sec: 0.0, rob: 0.2, quantum: 0.0, other: 0.0 },
    text: 'Generative pretrained transformers leverage billions of parameters for zero-shot reasoning and in-context prompt execution.'
  },

  // ── Vision & Autonomous Robotics Cluster (Bottom-Left) ──
  {
    id: 'D5', title: 'Computer Vision & Scene Understanding', category: 'CV', cluster: 'ai',
    mapX: 135, mapY: 220, pcaX: 630, pcaY: 180,
    keywords: ['computer vision', 'cv', 'vision', 'object detection', 'segmentation', 'pixels', 'images', 'cameras', 'video', 'ai'],
    domainVec: { ai: 0.85, ml: 0.7, dl: 0.8, nlp: 0.2, cv: 1.0, data: 0.2, sys: 0.2, sec: 0.0, rob: 0.7, quantum: 0.0, other: 0.0 },
    text: 'Computer vision processes pixels from cameras and videos to perform object detection, semantic segmentation, and tracking.'
  },
  {
    id: 'D17', title: 'Autonomous Robotics & SLAM Navigation', category: 'Robotics', cluster: 'ai',
    mapX: 165, mapY: 295, pcaX: 615, pcaY: 260,
    keywords: ['robotics', 'robot', 'slam', 'lidar', 'autonomous', 'navigation', 'kinematics', 'trajectory planning', 'sensors', 'ai'],
    domainVec: { ai: 0.7, ml: 0.6, dl: 0.5, nlp: 0.1, cv: 0.7, data: 0.2, sys: 0.5, sec: 0.1, rob: 1.0, quantum: 0.0, other: 0.0 },
    text: 'Autonomous mobile robots integrate LiDAR sensors and Simultaneous Localization and Mapping (SLAM) for real-time trajectory planning.'
  },

  // ── Databases & Vector Retrieval Cluster (Bottom-Center) ──
  {
    id: 'D4', title: 'Relational Database Systems & SQL', category: 'DB', cluster: 'data',
    mapX: 420, mapY: 295, pcaX: 775, pcaY: 335,
    keywords: ['relational databases', 'database', 'db', 'sql', 'acid', 'transactions', 'tables', 'b-tree', 'indexes', 'queries', 'schema'],
    domainVec: { ai: 0.1, ml: 0.1, dl: 0.0, nlp: 0.1, cv: 0.0, data: 1.0, sys: 0.5, sec: 0.2, rob: 0.0, quantum: 0.0, other: 0.0 },
    text: 'Relational databases organize structured tables with ACID transaction guarantees, relational algebra, and B-Tree indexes.'
  },
  {
    id: 'D11', title: 'Graph Databases & Knowledge Graphs', category: 'DB', cluster: 'data',
    mapX: 485, mapY: 260, pcaX: 810, pcaY: 305,
    keywords: ['graph databases', 'knowledge graphs', 'neo4j', 'cypher', 'triples', 'property graphs', 'entities', 'relations', 'sparql', 'db'],
    domainVec: { ai: 0.4, ml: 0.3, dl: 0.2, nlp: 0.4, cv: 0.0, data: 1.0, sys: 0.4, sec: 0.1, rob: 0.1, quantum: 0.0, other: 0.0 },
    text: 'Graph databases model interconnected entities and typed relationships as property graphs queried via Cypher or SPARQL.'
  },
  {
    id: 'D16', title: 'Vector Databases & Dense Indexing (ANN)', category: 'Search', cluster: 'data',
    mapX: 395, mapY: 215, pcaX: 750, pcaY: 265,
    keywords: ['vector databases', 'vector index', 'ann', 'approximate nearest neighbors', 'hnsw', 'dense retrieval', 'embeddings', 'faiss', 'search', 'similarity'],
    domainVec: { ai: 0.7, ml: 0.6, dl: 0.6, nlp: 0.6, cv: 0.4, data: 0.9, sys: 0.5, sec: 0.1, rob: 0.2, quantum: 0.1, other: 0.0 },
    text: 'Vector index engines use HNSW graphs and Product Quantization to perform sub-millisecond approximate nearest neighbor searches.'
  },

  // ── Quantum & Cybersecurity Cluster (Top-Right) ──
  {
    id: 'D19', title: 'Quantum Computing & Qubit Algorithms', category: 'Quantum', cluster: 'sys',
    mapX: 775, mapY: 70, pcaX: 885, pcaY: 90,
    keywords: ['quantum computing', 'quantum', 'qubit', 'qubits', 'superposition', 'entanglement', 'shor algorithm', 'grover algorithm', 'quantum circuits'],
    domainVec: { ai: 0.2, ml: 0.2, dl: 0.1, nlp: 0.0, cv: 0.0, data: 0.2, sys: 0.6, sec: 0.5, rob: 0.1, quantum: 1.0, other: 0.0 },
    text: 'Quantum processors utilize superposition and entanglement to execute Shor factorization and Grover database search algorithms.'
  },
  {
    id: 'D14', title: 'Cybersecurity & Public Key Cryptography', category: 'Sec', cluster: 'sys',
    mapX: 690, mapY: 110, pcaX: 840, pcaY: 135,
    keywords: ['cybersecurity', 'security', 'cryptography', 'encryption', 'public key', 'rsa', 'ecc', 'tls', 'ssl', 'digital signatures', 'hash', 'cipher'],
    domainVec: { ai: 0.1, ml: 0.1, dl: 0.0, nlp: 0.1, cv: 0.0, data: 0.3, sys: 0.7, sec: 1.0, rob: 0.1, quantum: 0.4, other: 0.0 },
    text: 'Asymmetric cryptography protects network communications using RSA/ECC keypairs, digital signatures, and TLS encryption.'
  },

  // ── Operating Systems & Cloud Infrastructure (Mid-Right) ──
  {
    id: 'D13', title: 'Operating Systems & Kernel Architecture', category: 'Sys', cluster: 'sys',
    mapX: 660, mapY: 175, pcaX: 870, pcaY: 175,
    keywords: ['operating systems', 'os', 'kernel', 'virtual memory', 'processes', 'threads', 'scheduling', 'interrupts', 'hardware', 'linux'],
    domainVec: { ai: 0.1, ml: 0.1, dl: 0.0, nlp: 0.0, cv: 0.0, data: 0.4, sys: 1.0, sec: 0.4, rob: 0.3, quantum: 0.1, other: 0.0 },
    text: 'OS kernels manage low-level hardware abstractions, virtual memory paging, process preemption, and hardware interrupts.'
  },
  {
    id: 'D8', title: 'Cloud Infrastructure & Distributed Sys.', category: 'Sys', cluster: 'sys',
    mapX: 740, mapY: 200, pcaX: 890, pcaY: 225,
    keywords: ['cloud computing', 'cloud infrastructure', 'cloud', 'distributed systems', 'serverless', 'elastic compute', 'storage', 'edge network', 'aws'],
    domainVec: { ai: 0.1, ml: 0.1, dl: 0.0, nlp: 0.0, cv: 0.0, data: 0.5, sys: 0.9, sec: 0.3, rob: 0.1, quantum: 0.1, other: 0.0 },
    text: 'Cloud infrastructure offers elastic on-demand compute instances, distributed object storage, and global edge delivery.'
  },
  {
    id: 'D18', title: 'Containerization & Kubernetes Clusters', category: 'Sys', cluster: 'sys',
    mapX: 800, mapY: 255, pcaX: 910, pcaY: 275,
    keywords: ['containerization', 'containers', 'docker', 'kubernetes', 'k8s', 'microservices', 'orchestration', 'cloud', 'clusters', 'pods'],
    domainVec: { ai: 0.1, ml: 0.1, dl: 0.0, nlp: 0.0, cv: 0.0, data: 0.4, sys: 0.95, sec: 0.3, rob: 0.1, quantum: 0.0, other: 0.0 },
    text: 'Container engines package microservices into immutable OCI images orchestrated across distributed Kubernetes nodes.'
  },

  // ── General / Other Domains (Bottom-Right) ──
  {
    id: 'D6', title: 'Domestic Animals & Pet Care', category: 'Other', cluster: 'other',
    mapX: 720, mapY: 330, pcaX: 860, pcaY: 370,
    keywords: ['domestic animals', 'pets', 'pet care', 'dogs', 'dog', 'cats', 'cat', 'veterinary', 'animals', 'training', 'companions', 'nutrition'],
    domainVec: { ai: 0.0, ml: 0.0, dl: 0.0, nlp: 0.0, cv: 0.0, data: 0.0, sys: 0.0, sec: 0.0, rob: 0.0, quantum: 0.0, other: 1.0 },
    text: 'Canine and feline companions require balanced nutritional diets, routine veterinary care, and positive behavioral training.'
  },
  {
    id: 'D20', title: 'Culinary Gastronomy & Food Science', category: 'Other', cluster: 'other',
    mapX: 815, mapY: 325, pcaX: 895, pcaY: 345,
    keywords: ['culinary', 'gastronomy', 'food science', 'cooking', 'food', 'recipes', 'chef', 'flavor', 'gourmet', 'molecular gastronomy'],
    domainVec: { ai: 0.0, ml: 0.0, dl: 0.0, nlp: 0.0, cv: 0.0, data: 0.0, sys: 0.0, sec: 0.0, rob: 0.0, quantum: 0.0, other: 1.0 },
    text: 'Molecular gastronomy applies thermal physics and chemical emulsification principles to elevate flavor profiling in gourmet cuisine.'
  },
];

export const CLUSTER_COLORS = {
  ai: '#3b82f6',     // Blue (AI & ML)
  data: '#8b5cf6',   // Violet (Data & DB)
  sys: '#10b981',    // Emerald (Systems & Cloud)
  other: '#f97316',  // Orange (Other)
};

export const CATEGORY_BADGE_COLOR = {
  ML: 'text-blue-700 bg-blue-50 border-blue-200',
  DL: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  NLP: 'text-violet-700 bg-violet-50 border-violet-200',
  DB: 'text-purple-700 bg-purple-50 border-purple-200',
  CV: 'text-sky-700 bg-sky-50 border-sky-200',
  Sys: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Sec: 'text-teal-700 bg-teal-50 border-teal-200',
  Search: 'text-cyan-700 bg-cyan-50 border-cyan-200',
  Robotics: 'text-amber-700 bg-amber-50 border-amber-200',
  Quantum: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200',
  Other: 'text-slate-600 bg-slate-100 border-slate-200',
};

// ── Realistic Benchmark Queries ───────────────────────────────────────────────
const BENCHMARK_QUERIES = [
  'What is artificial intelligence and machine learning?',
  'How are deep neural networks trained with backpropagation?',
  'How do transformer self-attention mechanisms work?',
  'How is information organized in relational and graph databases?',
  'What are domestic pets and how to care for them?',
  'How does cloud infrastructure orchestrate microservice containers?',
];

// ── ROBUST MULTI-FACTOR SEMANTIC RETRIEVAL & VECTOR ENGINE ────────────────────
export function computeSemanticSearch(queryText, topK = 5, threshold = 0.20) {
  const qRaw = (queryText || '').toLowerCase().trim();
  if (!qRaw) {
    return {
      items: [],
      pca: { mapX: 450, mapY: 180, pcaX: 740, pcaY: 200 },
      allScores: {}
    };
  }

  // Tokenize query words (preserving 2+ chars including "ai", "ml", "dl", "db", "os", "cv", "nn", "rl", "ip")
  const words = qRaw.split(/[^a-zA-Z0-9+#_.-]+/).filter(w => w.length >= 2);

  // Concept & Domain Affinity Detection
  const domainQueryWeights = {
    ai: 0, ml: 0, dl: 0, nlp: 0, cv: 0, data: 0, sys: 0, sec: 0, rob: 0, quantum: 0, other: 0
  };

  const domainTriggers = {
    ai: ['ai', 'artificial', 'intelligence', 'intelligent', 'cognitive', 'algorithm', 'decision', 'agent'],
    ml: ['ml', 'machine', 'learning', 'learn', 'pattern', 'supervised', 'unsupervised', 'reinforcement', 'model', 'dataset', 'training'],
    dl: ['dl', 'deep', 'neural', 'network', 'neurons', 'backprop', 'backpropagation', 'weights', 'loss', 'layers', 'diffusion', 'generative'],
    nlp: ['nlp', 'natural', 'language', 'linguistics', 'text', 'words', 'token', 'transformer', 'attention', 'prompt', 'llm', 'gpt', 'bert', 'translation'],
    cv: ['cv', 'vision', 'visual', 'image', 'images', 'photo', 'camera', 'pixel', 'detection', 'segmentation', 'cnn', 'convolution'],
    data: ['data', 'database', 'databases', 'db', 'sql', 'relational', 'table', 'tables', 'acid', 'b-tree', 'graph', 'cypher', 'neo4j', 'vector', 'index', 'retrieval', 'search'],
    sys: ['sys', 'system', 'systems', 'os', 'operating', 'kernel', 'process', 'memory', 'cpu', 'hardware', 'linux', 'cloud', 'container', 'docker', 'k8s', 'kubernetes', 'microservice', 'cluster'],
    sec: ['sec', 'security', 'cyber', 'cybersecurity', 'crypto', 'cryptography', 'encryption', 'tls', 'ssl', 'rsa', 'cipher', 'hash', 'signature'],
    rob: ['rob', 'robot', 'robotics', 'slam', 'lidar', 'autonomous', 'navigation', 'motion', 'kinematics', 'sensors'],
    quantum: ['quantum', 'qubit', 'qubits', 'superposition', 'entanglement', 'shor', 'grover'],
    other: ['pet', 'pets', 'dog', 'dogs', 'cat', 'cats', 'animal', 'animals', 'vet', 'food', 'cooking', 'recipe', 'culinary', 'gastronomy', 'kitchen', 'flavor', 'chef']
  };

  // Evaluate query text against triggers
  for (const [dom, triggers] of Object.entries(domainTriggers)) {
    triggers.forEach(tr => {
      if (qRaw.includes(tr)) {
        domainQueryWeights[dom] += tr.length > 3 ? 1.0 : 0.8;
      }
    });
  }

  // Calculate similarity scores for all 20 documents
  const scores = {};
  CORPUS_DOCS.forEach(doc => {
    let score = 0.05; // baseline noise floor

    // 1. Keyword & n-gram matching against title and keywords
    const docTitleLower = doc.title.toLowerCase();
    const docTextLower = doc.text.toLowerCase();

    doc.keywords.forEach(kw => {
      if (qRaw.includes(kw)) {
        score += 0.45;
      }
    });

    // 2. Individual token overlap
    words.forEach(w => {
      if (['what', 'is', 'the', 'how', 'are', 'and', 'for', 'from', 'with', 'about', 'can', 'explain', 'show', 'tell'].includes(w)) {
        return; // skip stop words
      }
      if (docTitleLower.includes(w)) score += 0.30;
      else if (docTextLower.includes(w)) score += 0.18;
      else if (doc.category.toLowerCase() === w) score += 0.35;
    });

    // 3. Domain vector dot-product
    let domainScore = 0;
    let queryNorm = 0;
    let docNorm = 0;
    for (const [dom, qWeight] of Object.entries(domainQueryWeights)) {
      if (qWeight > 0) {
        domainScore += qWeight * (doc.domainVec[dom] || 0);
        queryNorm += qWeight * qWeight;
      }
      docNorm += (doc.domainVec[dom] || 0) * (doc.domainVec[dom] || 0);
    }
    if (queryNorm > 0 && docNorm > 0) {
      const cosSim = domainScore / (Math.sqrt(queryNorm) * Math.sqrt(docNorm));
      score += cosSim * 0.45;
    }

    // Smooth and clamp
    const finalScore = Math.min(0.95, Math.max(0.04, parseFloat(score.toFixed(3))));
    scores[doc.id] = finalScore;
  });

  // Calculate dynamic 2D PCA position (Power-weighted Center of Mass)
  let sumWeight = 0;
  let totalMapX = 0;
  let totalMapY = 0;
  let totalPcaX = 0;
  let totalPcaY = 0;

  CORPUS_DOCS.forEach(doc => {
    const s = scores[doc.id];
    // Use 4th power so top matches pull the query dot decisively to their cluster
    const w = Math.pow(s, 4);
    sumWeight += w;
    totalMapX += doc.mapX * w;
    totalMapY += doc.mapY * w;
    totalPcaX += doc.pcaX * w;
    totalPcaY += doc.pcaY * w;
  });

  const queryMapX = sumWeight > 0 ? Math.round(totalMapX / sumWeight) : 450;
  const queryMapY = sumWeight > 0 ? Math.round(totalMapY / sumWeight) : 180;
  const queryPcaX = sumWeight > 0 ? Math.round(totalPcaX / sumWeight) : 740;
  const queryPcaY = sumWeight > 0 ? Math.round(totalPcaY / sumWeight) : 200;

  // Rank and filter
  const items = CORPUS_DOCS.map(doc => ({
    ...doc,
    score: scores[doc.id],
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, topK)
  .filter(d => d.score >= threshold)
  .map((d, i) => ({ ...d, rank: i + 1 }));

  return {
    items,
    pca: {
      mapX: Math.max(80, Math.min(840, queryMapX)),
      mapY: Math.max(50, Math.min(330, queryMapY)),
      pcaX: Math.max(610, Math.min(920, queryPcaX)),
      pcaY: Math.max(60, Math.min(400, queryPcaY))
    },
    allScores: scores
  };
}

// ── Synthetic 384-D Vector Bar Component ──────────────────────────────────────
function VectorEmbeddingBar({ label, seed = 'query', isQuery = false, active = true }) {
  const dimensions = useMemo(() => {
    const values = [];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    for (let i = 0; i < 28; i++) {
      const v = Math.sin(hash + i * 1.618) * 0.95;
      values.push(parseFloat(v.toFixed(3)));
    }
    return values;
  }, [seed]);

  return (
    <div className={`p-3.5 rounded-xl border ${isQuery ? 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200' : 'bg-slate-900 border-slate-700 text-slate-300'} font-mono text-xs shadow-inner`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isQuery ? 'bg-orange-400 animate-ping' : 'bg-emerald-400'}`} />
          <span className="font-bold text-white text-[11px] uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-semibold">
          384-D Unit Vector (L2 Norm)
        </span>
      </div>

      {/* Mini dimension matrix chips */}
      <div className="grid grid-cols-7 sm:grid-cols-14 gap-1 mb-2">
        {dimensions.map((val, idx) => {
          const isPositive = val >= 0;
          const intensity = Math.abs(val);
          return (
            <div
              key={idx}
              title={`Dim #${idx + 1}: ${val > 0 ? '+' : ''}${val}`}
              className="h-5 rounded flex items-center justify-center text-[9px] font-bold transition-all hover:scale-110 cursor-help"
              style={{
                backgroundColor: isQuery
                  ? (isPositive ? `rgba(249, 115, 22, ${0.25 + intensity * 0.75})` : `rgba(99, 102, 241, ${0.25 + intensity * 0.75})`)
                  : (isPositive ? `rgba(16, 185, 129, ${0.25 + intensity * 0.75})` : `rgba(139, 92, 246, ${0.25 + intensity * 0.75})`),
                color: '#ffffff'
              }}
            >
              {val > 0 ? `+${val.toFixed(2).slice(1)}` : val.toFixed(2)}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400">
        <span>dim[0..27] preview</span>
        <span className="text-orange-300">... 356 additional dense float32 dimensions</span>
        <span>‖v‖₂ = 1.0000</span>
      </div>
    </div>
  );
}

// ── Master SVG Architecture Animation with Professional Arrows & 20 Docs ──────
function SemanticSearchAnimation() {
  const [animState, setAnimState]         = useState('idle'); // idle | playing | done
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 0.25x to 3.0x
  const speedRef                          = useRef(1.0);
  const [dots, setDots]                   = useState([]);
  const [lines, setLines]                 = useState([]);
  const [queryDot, setQueryDot]           = useState(null);
  const [ranks, setRanks]                 = useState([]);
  const [results, setResults]             = useState([]);
  const [caption, setCaption]             = useState('Click ▶ Play to visualize the end-to-end Dense Semantic Search pipeline with 20 documents.');
  const [step, setStep]                   = useState(-1);

  // Keep speedRef in sync for active async sleep loops
  const updateSpeed = (speed) => {
    const val = parseFloat(speed);
    setPlaybackSpeed(val);
    speedRef.current = val;
  };

  const TOP_K_DEMO_IDS = ['D1', 'D2', 'D7', 'D3'];
  const QUERY_POS = { cx: 695, cy: 115 };

  const reset = useCallback(() => {
    setDots([]);
    setLines([]);
    setQueryDot(null);
    setRanks([]);
    setResults([]);
    setStep(-1);
    setAnimState('idle');
    setCaption('Click ▶ Play to visualize the end-to-end Dense Semantic Search pipeline with 20 documents.');
  }, []);

  const sleep = (ms) => new Promise(r => setTimeout(r, Math.max(20, ms / (speedRef.current || 1.0))));

  const play = useCallback(async () => {
    if (animState === 'playing') return;
    setAnimState('playing');
    setDots([]); setLines([]); setQueryDot(null); setRanks([]); setResults([]);

    // Step 0: Ingest & Read 20 Documents
    setStep(0);
    setCaption('Step 1 — 20 Unstructured Documents are ingested and batched for neural embedding.');
    await sleep(600);

    // Step 1: Encode into 384-D and Project into 2D PCA Space
    setStep(1);
    setCaption('Step 2 — Sentence Transformer (all-MiniLM-L6-v2) generates 384-D dense vectors; 2D PCA projects all 20 document vectors.');
    for (let i = 0; i < CORPUS_DOCS.length; i++) {
      const d = CORPUS_DOCS[i];
      setDots(prev => [...prev, { ...d, visible: true }]);
      await sleep(75);
    }
    await sleep(600);

    // Step 2: User Query Vectorization
    setStep(2);
    setCaption('Step 3 — User Query: "How do computers learn from data?" is tokenized and encoded into a 384-D query vector.');
    await sleep(600);
    setQueryDot({ ...QUERY_POS, visible: true });
    await sleep(700);

    // Step 3: Cosine Similarity Scoring
    setStep(3);
    setCaption('Step 4 — Cosine similarity dot-products are computed in parallel between Query vector and all 20 document vectors.');
    setLines(CORPUS_DOCS.map(d => ({
      from: QUERY_POS,
      to: { cx: d.pcaX, cy: d.pcaY },
      id: d.id,
      hot: false,
      score: BENCHMARK_QUERIES['How do computers learn from data?'].scores[d.id] ?? 0.1
    })));
    await sleep(900);

    // Step 4: Nearest Neighbors & Top-K Ranking
    setStep(4);
    setCaption('Step 5 — Nearest dense vectors in embedding space are identified and ranked by cosine score.');
    setLines(CORPUS_DOCS.map(d => ({
      from: QUERY_POS,
      to: { cx: d.pcaX, cy: d.pcaY },
      id: d.id,
      hot: TOP_K_DEMO_IDS.includes(d.id),
      cold: !TOP_K_DEMO_IDS.includes(d.id),
      score: BENCHMARK_QUERIES['How do computers learn from data?'].scores[d.id] ?? 0.1
    })));
    await sleep(600);

    setRanks(TOP_K_DEMO_IDS.map((id, i) => {
      const doc = CORPUS_DOCS.find(d => d.id === id);
      return { id, cx: doc.pcaX + 13, cy: doc.pcaY - 13, rank: i + 1, title: doc.title };
    }));
    await sleep(600);

    // Step 5: Ranked Return
    setStep(5);
    setCaption('Step 6 — Top-K ranked semantically relevant documents returned to user with cosine confidence scores.');
    setResults([
      { rank: 1, id: 'D1', title: 'Machine Learning Basics',                 category: 'ML',  score: 0.812 },
      { rank: 2, id: 'D2', title: 'Deep Learning & Neural Networks',         category: 'DL',  score: 0.745 },
      { rank: 3, id: 'D7', title: 'Reinforcement Learning & Policy Gradients', category: 'ML',  score: 0.698 },
      { rank: 4, id: 'D3', title: 'Natural Language Processing',             category: 'NLP', score: 0.512 },
    ]);
    setAnimState('done');
  }, [animState]);

  const STEP_LABELS = [
    '1. Ingest Docs',
    '2. Build 384-D Index',
    '3. Encode Query',
    '4. Cosine Similarity',
    '5. Rank Nearest',
    '6. Return Top-K'
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md p-5 shadow-sm">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={play}
            disabled={animState === 'playing'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Play Pipeline Animation
          </motion.button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
        <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg flex-1 max-w-xl truncate">
          {caption}
        </div>
      </div>

      {/* ── FULL-WIDTH PLAYBACK SPEED SLIDER SPANNING ENTIRE CONTAINER ── */}
      <div className="w-full mb-4 p-3 rounded-xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">Animation Playback Speed:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-xs shadow-sm">
              {playbackSpeed.toFixed(2)}x {playbackSpeed === 1.0 ? '(Normal)' : playbackSpeed > 1.0 ? '(Fast)' : '(Slow)'}
            </span>
            <div className="hidden sm:flex items-center gap-1">
              {[0.5, 1.0, 1.5, 2.0, 3.0].map(s => (
                <button
                  key={s}
                  onClick={() => updateSpeed(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    playbackSpeed === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Full-length slider track */}
        <div className="w-full py-1.5 flex items-center">
          <input
            type="range"
            min={0.25}
            max={3.0}
            step={0.25}
            value={playbackSpeed}
            onChange={e => updateSpeed(e.target.value)}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 border border-slate-300"
            style={{
              background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((playbackSpeed - 0.25) / 2.75) * 100}%, #cbd5e1 ${((playbackSpeed - 0.25) / 2.75) * 100}%, #cbd5e1 100%)`
            }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-0.5">
          <span>0.25x (Ultra Slow)</span>
          <span>1.0x (Normal)</span>
          <span>2.0x (Double Speed)</span>
          <span>3.0x (Ultra Fast)</span>
        </div>
      </div>

      {/* Step Pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {STEP_LABELS.map((label, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ArrowRight className="w-3 h-3 text-slate-300" />}
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              step > i ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
              step === i ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md' :
              'bg-slate-100 text-slate-500'
            }`}>
              {label}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Category Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs font-semibold px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
        <span className="text-slate-400 text-[11px] uppercase tracking-wider">Clusters:</span>
        {[
          [CLUSTER_COLORS.ai, 'AI & Machine Learning'],
          [CLUSTER_COLORS.data, 'Data & Databases'],
          [CLUSTER_COLORS.sys, 'Systems & Cloud'],
          [CLUSTER_COLORS.other, 'Other Domains'],
          ['#ea580c', 'Query Star']
        ].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full inline-block shadow-sm" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>

      {/* Professional SVG Canvas */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50/50 to-white shadow-inner">
        <svg viewBox="0 0 960 440" className="w-full min-w-[760px]" style={{ height: 420 }}>
          <defs>
            {/* Professional Linear Gradients */}
            <linearGradient id="gradDocsToModel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="gradModelToSpace" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="encoderBoxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#eff6ff" />
            </linearGradient>

            {/* Arrowhead Markers */}
            <marker id="arrowDocs" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#4f46e5" />
            </marker>
            <marker id="arrowSpace" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#7c3aed" />
            </marker>

            {/* Glowing Drop Shadow Filter */}
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* ════ PANEL 1: 20 Corpus Documents (Left) ════ */}
          <rect x="15" y="25" width="180" height="395" rx="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="15" y="25" width="180" height="32" rx="12" fill="#e2e8f0" />
          <text x="105" y="46" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1e293b">Corpus (20 Documents)</text>

          {/* 20 Compact Document Badges in 2 columns */}
          <g transform="translate(22, 64)">
            {CORPUS_DOCS.map((d, i) => {
              const col = i >= 10 ? 1 : 0;
              const row = i >= 10 ? i - 10 : i;
              const xPos = col * 84;
              const yPos = row * 33;
              const isHighlighted = ranks.some(r => r.id === d.id);
              return (
                <g key={d.id}>
                  <rect
                    x={xPos}
                    y={yPos}
                    width="78"
                    height="27"
                    rx="6"
                    fill={isHighlighted ? '#ffedd5' : '#ffffff'}
                    stroke={isHighlighted ? '#ea580c' : CLUSTER_COLORS[d.cluster]}
                    strokeWidth={isHighlighted ? 2 : 1.2}
                  />
                  <circle cx={xPos + 10} cy={yPos + 13.5} r="4" fill={CLUSTER_COLORS[d.cluster]} />
                  <text x={xPos + 18} y={yPos + 17} fontSize="9.5" fontWeight="700" fill="#1e293b">
                    {d.id}
                  </text>
                  <text x={xPos + 38} y={yPos + 17} fontSize="8" fontWeight="600" fill="#64748b">
                    {d.category}
                  </text>
                </g>
              );
            })}
          </g>

          {/* ════ PROFESSIONAL ARROW 1: Documents ──▶ Encoder Model ════ */}
          <g transform="translate(0, 0)">
            {/* Animated Flow Line */}
            <path
              d="M 195 220 L 320 220"
              stroke="url(#gradDocsToModel)"
              strokeWidth="3.5"
              strokeLinecap="round"
              markerEnd="url(#arrowDocs)"
            />
            {/* Step Capsule Label */}
            <rect x="210" y="196" width="94" height="20" rx="10" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />
            <text x="257" y="210" textAnchor="middle" fontSize="9" fontWeight="700" fill="#4338ca">
              1. Feed Text
            </text>
            <text x="257" y="235" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#64748b">
              Tokenize &amp; Stream
            </text>
          </g>

          {/* ════ PANEL 2: Sentence Transformer Encoder (Center) ════ */}
          <rect x="330" y="160" width="165" height="120" rx="14" fill="url(#encoderBoxGrad)" stroke="#3b82f6" strokeWidth="2" filter="url(#glowFilter)" />
          <rect x="330" y="160" width="165" height="28" rx="14" fill="#3b82f6" />
          <text x="412" y="179" textAnchor="middle" fontSize="11" fontWeight="800" fill="#ffffff">
            ⚡ Encoder Model
          </text>
          <text x="412" y="206" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1e3a8a">
            SentenceTransformer
          </text>
          <text x="412" y="222" textAnchor="middle" fontSize="10" fontWeight="700" fill="#2563eb">
            all-MiniLM-L6-v2
          </text>
          <line x1="345" y1="235" x2="480" y2="235" stroke="#bfdbfe" strokeWidth="1" strokeDasharray="3,3" />
          <text x="412" y="251" textAnchor="middle" fontSize="9" fontWeight="700" fill="#047857">
            Output: 384-D Unit Vector
          </text>
          <text x="412" y="266" textAnchor="middle" fontSize="8" fontWeight="600" fill="#64748b">
            L2-Normalised (‖v‖ = 1)
          </text>

          {/* ════ PROFESSIONAL ARROW 2: Encoder Model ──▶ Embedding Space ════ */}
          <g transform="translate(0, 0)">
            {/* Animated Flow Line */}
            <path
              d="M 495 220 L 575 220"
              stroke="url(#gradModelToSpace)"
              strokeWidth="3.5"
              strokeLinecap="round"
              markerEnd="url(#arrowSpace)"
            />
            {/* Step Capsule Label */}
            <rect x="502" y="196" width="62" height="20" rx="10" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.5" />
            <text x="533" y="210" textAnchor="middle" fontSize="9" fontWeight="700" fill="#6d28d9">
              2. Project
            </text>
            <text x="533" y="235" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#64748b">
              384-D Vector
            </text>
          </g>

          {/* ════ PANEL 3: 2-D PCA Embedding Space (Right) ════ */}
          <rect x="585" y="25" width="360" height="395" rx="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="585" y="25" width="360" height="32" rx="12" fill="#e2e8f0" />
          <text x="765" y="46" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1e293b">
            Embedding Space (2-D PCA Projection · 20 Docs)
          </text>

          {/* Embedding Grid Guidelines */}
          <line x1="600" y1="222" x2="930" y2="222" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="765" y1="65" x2="765" y2="400" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />

          {/* Cosine Similarity Rays */}
          {lines.map(l => (
            <line
              key={l.id}
              x1={l.from.cx} y1={l.from.cy}
              x2={l.to.cx} y2={l.to.cy}
              stroke={l.hot ? '#ea580c' : '#94a3b8'}
              strokeWidth={l.hot ? 2.5 : 1}
              strokeDasharray={l.hot ? 'none' : '3,3'}
              opacity={l.cold ? 0.12 : l.hot ? 0.95 : 0.4}
              style={{ transition: 'all 500ms ease' }}
            />
          ))}

          {/* 20 Document Vector Nodes in PCA space */}
          {dots.map(d => (
            <g key={d.id}>
              <motion.circle
                cx={d.pcaX} cy={d.pcaY} r={7.5}
                fill={CLUSTER_COLORS[d.cluster]}
                stroke="#ffffff"
                strokeWidth={2}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              />
              <text x={d.pcaX} y={d.pcaY - 10} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#334155">
                {d.id}
              </text>
            </g>
          ))}

          {/* Query Vector Star Node */}
          {queryDot && (
            <g>
              <motion.circle
                cx={queryDot.cx} cy={queryDot.cy} r={16}
                fill="none" stroke="#ea580c" strokeWidth={2} opacity={0.6}
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <motion.circle
                cx={queryDot.cx} cy={queryDot.cy} r={9}
                fill="#ea580c"
                stroke="#ffffff"
                strokeWidth={2.5}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              />
              <text x={queryDot.cx} y={queryDot.cy - 14} textAnchor="middle" fontSize="10" fontWeight="900" fill="#c2410c">
                ★ Query
              </text>
            </g>
          )}

          {/* Rank Badges */}
          {ranks.map(r => (
            <motion.g
              key={r.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18 }}
            >
              <circle cx={r.cx} cy={r.cy} r={9} fill="#ea580c" stroke="#ffffff" strokeWidth="1.5" />
              <text x={r.cx} y={r.cy + 3.5} textAnchor="middle" fontSize="10" fontWeight="900" fill="#ffffff">
                {r.rank}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Top Results Cards */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5"
          >
            {results.map(r => (
              <div key={r.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 border-l-4 border-l-orange-500 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                  #{r.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">{r.id}: {r.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400 font-semibold">{r.category}</span>
                    <span className="text-xs font-extrabold text-emerald-600">{r.score.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Live Interactive Query Vector Representation & PCA Visualizer ─────────────
function InteractiveQueryEmbeddingVisualizer({ query, results, allScores, queryPca, topK, threshold }) {
  if (!query) return null;

  const qX = queryPca?.mapX ?? 450;
  const qY = queryPca?.mapY ?? 180;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mt-6 rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/70 via-white to-white p-5 shadow-sm space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Query Embedding Representation &amp; Space Alignment</h3>
            <p className="text-xs text-slate-500">Live 384-D vector tensor generation and dynamic 2D PCA cluster projection</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-sm">
            Query: "{query.length > 32 ? query.slice(0, 32) + '…' : query}"
          </span>
        </div>
      </div>

      {/* 384-D Vector Tensor Generation Box */}
      <VectorEmbeddingBar label={`Query Vector (all-MiniLM-L6-v2)`} seed={query} isQuery={true} />

      {/* Interactive 2D Embedding Space Visualizer for User's Query */}
      <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-white shadow-inner">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3 text-xs">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-400" />
            2D PCA Embedding Map — Dynamic Query Position &amp; Cosine Distance Rays (20 Documents)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              Query projected at <strong className="text-orange-400">({qX}, {qY})</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold text-[11px] border border-orange-500/30">
              Top-{results?.items.length || topK} Ranked
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-2 px-3 py-1.5 bg-slate-900/90 rounded-lg text-[11px] text-slate-300 font-medium border border-slate-800">
          <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Clusters:</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> AI &amp; Machine Learning (Top-Left)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Databases &amp; Search (Center-Bottom)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Systems &amp; Cloud (Right)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> General / Other (Bottom-Right)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-white" /> ★ Active Query</span>
        </div>

        <svg viewBox="0 0 900 360" className="w-full" style={{ maxHeight: 350 }}>
          {/* Subtle Axes Guidelines */}
          <line x1="40" y1="180" x2="860" y2="180" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="5,5" />
          <line x1="450" y1="20" x2="450" y2="340" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="5,5" />
          <text x="850" y="175" textAnchor="end" fontSize="9" fill="#475569" fontWeight="700">PCA Dim 1 →</text>
          <text x="460" y="30" fontSize="9" fill="#475569" fontWeight="700">↑ PCA Dim 2</text>

          {/* Cosine Similarity Rays */}
          {CORPUS_DOCS.map(doc => {
            const score = allScores ? (allScores[doc.id] ?? 0.05) : 0.05;
            const resItem = results?.items.find(r => r.id === doc.id);
            const isTopK = !!resItem;
            const isPassing = score >= threshold;
            return (
              <line
                key={`ray-${doc.id}`}
                x1={qX}
                y1={qY}
                x2={doc.mapX}
                y2={doc.mapY}
                stroke={isTopK ? '#f97316' : '#334155'}
                strokeWidth={isTopK ? 2.5 : 0.75}
                strokeDasharray={isTopK ? 'none' : '3,3'}
                opacity={isTopK ? 0.95 : isPassing ? 0.35 : 0.12}
                style={{ transition: 'all 400ms ease' }}
              />
            );
          })}

          {/* Document Dots (20 Unified Nodes) */}
          {CORPUS_DOCS.map(doc => {
            const score = allScores ? (allScores[doc.id] ?? 0.05) : 0.05;
            const resItem = results?.items.find(r => r.id === doc.id);
            const isTopK = !!resItem;
            const x = doc.mapX;
            const y = doc.mapY;

            return (
              <g key={`node-${doc.id}`} className="cursor-pointer">
                <title>{`${doc.id}: ${doc.title} (${doc.category})\nCosine Similarity: ${score.toFixed(3)}`}</title>
                {isTopK && (
                  <circle
                    cx={x}
                    cy={y}
                    r={18}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth={2}
                    opacity={0.65}
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isTopK ? 9.5 : 7}
                  fill={CLUSTER_COLORS[doc.cluster]}
                  stroke="#ffffff"
                  strokeWidth={isTopK ? 2.5 : 1.5}
                  style={{ transition: 'all 300ms ease' }}
                />
                <text x={x} y={y - 12} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#e2e8f0">
                  {doc.id}
                </text>
                {isTopK && (
                  <g>
                    <circle cx={x + 13} cy={y - 13} r={8.5} fill="#ea580c" stroke="#ffffff" strokeWidth="1.2" />
                    <text x={x + 13} y={y - 9.5} textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#ffffff">
                      {resItem.rank}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* User Query Star Dot (Dynamically positioned in embedding space) */}
          <g>
            <circle
              cx={qX}
              cy={qY}
              r={24}
              fill="none"
              stroke="#ea580c"
              strokeWidth={2}
              opacity={0.4}
              className="animate-ping"
            />
            <circle
              cx={qX}
              cy={qY}
              r={12}
              fill="#ea580c"
              stroke="#ffffff"
              strokeWidth={3}
              filter="drop-shadow(0 0 6px rgba(234, 88, 12, 0.8))"
              style={{ transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
            <text
              x={qX}
              y={qY - 18}
              textAnchor="middle"
              fontSize="11"
              fontWeight="900"
              fill="#fdba74"
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
            >
              ★ Query
            </text>
          </g>
        </svg>
      </div>
    </motion.div>
  );
}

// ── Main Lab Section ──────────────────────────────────────────────────────────
export default function LabSection({ onRecordTrial, trials, onGoToQuiz }) {
  const [query, setQuery]             = useState('');
  const [selectedQuery, setSelected]  = useState('');
  const [topK, setTopK]               = useState(5);
  const [threshold, setThreshold]     = useState(0.20);
  const [results, setResults]         = useState(null);
  const [allScores, setAllScores]     = useState(null);
  const [queryPca, setQueryPca]       = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showTrace, setShowTrace]     = useState(false);

  const SAMPLE_QUERIES = BENCHMARK_QUERIES;

  // Automatically update vector animation when query or sliders change
  const handleSearch = useCallback(async (customQ) => {
    const q = (customQ !== undefined ? customQ : query).trim();
    if (!q) return;
    setIsSearching(true);
    await new Promise(r => setTimeout(r, 450));
    
    const searchRes = computeSemanticSearch(q, topK, threshold);
    setResults({
      items: searchRes.items,
      query: q,
      topK,
      threshold,
      time: (Math.random() * 8 + 3.2).toFixed(1)
    });
    setAllScores(searchRes.allScores);
    setQueryPca(searchRes.pca);
    setIsSearching(false);
  }, [query, topK, threshold]);

  const handleSelectSample = (q) => {
    setQuery(q);
    setSelected(q);
    handleSearch(q);
  };


  const handleRecord = () => {
    if (!results) return;
    const trial = {
      id: trials.length + 1,
      query: results.query,
      topK: results.topK,
      threshold: results.threshold,
      hits: results.items.length,
      topScore: results.items[0]?.score?.toFixed(4) ?? '—',
      topDoc: results.items[0]?.title ?? '—',
      time: results.time,
    };
    onRecordTrial(trial);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
          <FlaskConical className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Simulation Lab — Dense Semantic Search</h1>
          <p className="text-xs text-slate-500">Knowledge Graphs &amp; Information Retrieval Systems</p>
        </div>
      </div>

      {/* Top Architecture Animation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-500" />
            Semantic Search Architecture &amp; Pipeline Animation
          </h2>
          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            20 Pre-Indexed Documents
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Visualizes text vectorization through all-MiniLM-L6-v2, 2D PCA projection across 20 corpus documents,
          and dynamic cosine similarity ranking.
        </p>
        <SemanticSearchAnimation />
      </div>

      <hr className="border-slate-200 my-6" />

      {/* 20-Document Corpus Table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-500" />
            Document Corpus (Pre-Indexed · {CORPUS_DOCS.length} Documents)
          </h2>
          <span className="text-xs text-teal-700 font-bold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
            384-D Embeddings Stored
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm max-h-80 overflow-y-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-teal-700 text-white">
                {['ID', 'Title', 'Category', 'Domain Cluster', 'Content Snippet'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {CORPUS_DOCS.map((doc, i) => (
                <tr key={doc.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70 hover:bg-teal-50/50'}>
                  <td className="px-3 py-2 font-mono font-bold text-teal-700">{doc.id}</td>
                  <td className="px-3 py-2 font-semibold text-slate-800">{doc.title}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${CATEGORY_BADGE_COLOR[doc.category] || 'bg-slate-100'}`}>
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium capitalize">
                      <span className="w-2 h-2 rounded-full" style={{ background: CLUSTER_COLORS[doc.cluster] }} />
                      {doc.cluster}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600 max-w-sm leading-relaxed">{doc.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          All 20 documents are indexed into dense 384-dimensional unit vector representations using all-MiniLM-L6-v2.
        </p>
      </div>

      {/* Query Console */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 mb-6">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-violet-500" />
          Query Console &amp; Embedding Controller
        </h2>

        {/* Preset Sample Queries */}
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-2 font-semibold">Select a benchmark query or type your own custom query:</p>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_QUERIES.map(q => (
              <button
                key={q}
                onClick={() => handleSelectSample(q)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  selectedQuery === q
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Input */}
        <textarea
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected('');
          }}
          placeholder="Type any natural language query… (e.g. 'How do neural networks learn from images?' or 'Cloud distributed databases')"
          className="w-full p-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 bg-slate-50 font-medium"
          rows={2}
        />

        {/* ── HIGHLY VISIBLE & STYLED SLIDERS ── */}
        <div className="grid sm:grid-cols-2 gap-5 mt-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
          {/* Top-K Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                Top-K (results to return):
              </label>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs border border-indigo-200 shadow-sm">
                {topK} results
              </span>
            </div>
            <div className="py-2 flex items-center">
              <input
                type="range"
                min={1}
                max={20}
                value={topK}
                onChange={e => setTopK(+e.target.value)}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 border border-slate-300"
                style={{
                  background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((topK - 1) / 19) * 100}%, #cbd5e1 ${((topK - 1) / 19) * 100}%, #cbd5e1 100%)`
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>1 result</span>
              <span>10 results</span>
              <span>20 results</span>
            </div>
          </div>

          {/* Min Threshold Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-600 inline-block" />
                Min Threshold (Cosine Similarity):
              </label>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-black text-xs border border-violet-200 shadow-sm">
                ≥ {threshold.toFixed(2)}
              </span>
            </div>
            <div className="py-2 flex items-center">
              <input
                type="range"
                min={0.0}
                max={0.80}
                step={0.05}
                value={threshold}
                onChange={e => setThreshold(+e.target.value)}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-400 border border-slate-300"
                style={{
                  background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${(threshold / 0.8) * 100}%, #cbd5e1 ${(threshold / 0.8) * 100}%, #cbd5e1 100%)`
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>0.00 (all)</span>
              <span>0.40</span>
              <span>0.80 (strict)</span>
            </div>
          </div>
        </div>

        {/* Run Search Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleSearch()}
          disabled={!query.trim() || isSearching}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSearching
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Computing 384-D Dense Embedding &amp; Cosine Similarities…</>
            : <><Search className="w-4 h-4" /> Run Semantic Search</>
          }
        </motion.button>
      </div>

      {/* Live Query Embedding Representation Animation */}
      <AnimatePresence>
        {results && (
          <InteractiveQueryEmbeddingVisualizer
            query={results.query}
            results={results}
            allScores={allScores}
            queryPca={queryPca}
            topK={topK}
            threshold={threshold}
          />
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            {/* Summary KPI stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Embedding Model', val: '384-D', color: 'indigo' },
                { label: 'Docs Evaluated', val: `${CORPUS_DOCS.length} items`, color: 'violet' },
                { label: 'Search Latency', val: `${results.time} ms`, color: 'teal' },
                { label: 'Retrieved Hits', val: `${results.items.length} docs`, color: 'emerald' },
              ].map(({ label, val, color }) => (
                <div key={label} className={`p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-sm`}>
                  <div className={`text-xl font-black text-indigo-700`}>{val}</div>
                  <div className="text-xs text-slate-500 mt-0.5 font-semibold">{label}</div>
                </div>
              ))}
            </div>

            {/* Trace Toggle */}
            <div className="flex items-center justify-between mb-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                {results.items.length > 0
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  : <XCircle className="w-4 h-4 text-slate-400" />
                }
                Query: <span className="font-normal text-slate-600 italic">"{results.query}"</span>
              </div>
              <button
                onClick={() => setShowTrace(p => !p)}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {showTrace ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showTrace ? 'Hide Pipeline Trace' : 'View Pipeline Trace'}
              </button>
            </div>

            {/* Pipeline Trace Details */}
            <AnimatePresence>
              {showTrace && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs space-y-1.5 overflow-hidden shadow-inner"
                >
                  <div className="text-slate-300 font-bold border-b border-slate-800 pb-1 mb-2">⚡ Pipeline Execution Trace</div>
                  <div>📥 Input Text: "{results.query}"</div>
                  <div>🔢 Encoder: all-MiniLM-L6-v2 (384-dimensional unit normalized vector)</div>
                  <div>📚 Index Matrix: {CORPUS_DOCS.length} documents × 384 dimensions</div>
                  <div>📐 Metric: Cosine Similarity = doc_vector · query_vector (O(20 × 384) dot product)</div>
                  <div>🎯 Configuration: Top-K = {results.topK} | Similarity Threshold = {results.threshold}</div>
                  <div>✅ Output: {results.items.length} document(s) satisfied threshold criteria</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ranked Document Cards */}
            {results.items.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center">
                <XCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Documents Above Threshold</h4>
                <p className="text-xs text-slate-500 mt-1">Lower the minimum similarity threshold slider or try different query keywords.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-5">
                {results.items.map(r => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl border border-slate-200 border-l-4 border-l-indigo-600 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                            #{r.rank}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-400">{r.id}</span>
                          <span className="font-bold text-slate-900 text-sm">{r.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${CATEGORY_BADGE_COLOR[r.category] || 'bg-slate-100'}`}>
                            {r.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{r.text}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xl font-black text-emerald-600">{r.score.toFixed(4)}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cosine Similarity</div>
                        <div className="w-24 h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden border border-slate-200">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(0, Math.min(100, r.score * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Record Trial Button */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRecord}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors shadow-sm"
              >
                <Hash className="w-3.5 h-3.5" /> Record Experiment Trial
              </motion.button>
              {trials.length > 0 && (
                <span className="text-xs font-semibold text-slate-500">{trials.length} trial{trials.length !== 1 ? 's' : ''} recorded in lab report</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recorded Trials Table */}
      {trials.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-teal-500" /> Recorded Trials ({trials.length})
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-teal-700 text-white">
                  {['#', 'Query', 'Top-K', 'Threshold', 'Hits', 'Top Score', 'Top Document Match', 'Time'].map(h => (
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
                    <td className="px-3 py-2 text-center text-slate-600">{t.threshold}</td>
                    <td className="px-3 py-2 text-center font-bold text-emerald-600">{t.hits}</td>
                    <td className="px-3 py-2 font-mono text-violet-700 font-bold">{t.topScore}</td>
                    <td className="px-3 py-2 text-slate-700 max-w-xs truncate">{t.topDoc}</td>
                    <td className="px-3 py-2 text-slate-500">{t.time} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proceed to Quiz Button */}
      <div className="mt-10 flex justify-center">
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

