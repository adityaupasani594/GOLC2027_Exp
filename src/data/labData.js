// ─── IR Virtual Lab — Data Layer ───────────────────────────────────────────

// ── Experiment metadata ──────────────────────────────────────────────────────
export const EXPERIMENT = {
  title: 'Information Retrieval Metrics Virtual Lab',
  code: 'CS-IR-301',
  version: '2027.1',
  subtitle: 'Precision, Recall, F1-Score & MRR — Quantitative Comparison of Retrieval Systems',
};

// ── Retrieval system catalogue ───────────────────────────────────────────────
export const RETRIEVAL_SYSTEMS = [
  {
    id: 'keyword',
    label: 'Keyword (BM25)',
    color: 'amber',
    icon: '🔑',
    description: 'Term-frequency-based retrieval using BM25 scoring. Excels on exact token matches but suffers vocabulary mismatch.',
    latency: 8,
  },
  {
    id: 'semantic',
    label: 'Semantic (Dense)',
    color: 'blue',
    icon: '🧠',
    description: 'Bi-encoder embeddings retrieve semantically similar documents regardless of surface wording. High recall but slower.',
    latency: 32,
  },
  {
    id: 'hybrid',
    label: 'Hybrid (RRF)',
    color: 'indigo',
    icon: '⚡',
    description: 'Reciprocal Rank Fusion merges BM25 and dense rankings, gaining precision and recall simultaneously.',
    latency: 41,
  },
  {
    id: 'graph',
    label: 'Graph (GraphRAG)',
    color: 'purple',
    icon: '🕸️',
    description: 'Traverses a knowledge graph to surface multi-hop relational evidence. Best for complex queries; highest latency.',
    latency: 62,
  },
];

// ── Metric definitions ────────────────────────────────────────────────────────
export const METRICS = [
  {
    id: 'precision',
    label: 'Precision@k',
    symbol: 'P@k',
    formula: '$$P@k = \\frac{|\\{\\text{relevant}\\} \\cap \\{\\text{retrieved}_k\\}|}{k}$$',
    inline: '$P@k$',
    description: 'Fraction of the top-k retrieved documents that are actually relevant. Answers: "How much of what I got is useful?"',
    color: 'blue',
    tip: 'High precision → fewer false positives in the ranked list.',
  },
  {
    id: 'recall',
    label: 'Recall@k',
    symbol: 'R@k',
    formula: '$$R@k = \\frac{|\\{\\text{relevant}\\} \\cap \\{\\text{retrieved}_k\\}|}{|\\{\\text{relevant}\\}|}$$',
    inline: '$R@k$',
    description: 'Fraction of all relevant documents that appear in the top-k results. Answers: "How much of what exists did I find?"',
    color: 'emerald',
    tip: 'High recall → fewer relevant documents are missed.',
  },
  {
    id: 'f1',
    label: 'F1-Score',
    symbol: 'F₁',
    formula: '$$F_1 = 2 \\cdot \\frac{P \\cdot R}{P + R} = \\frac{2 \\cdot TP}{2 \\cdot TP + FP + FN}$$',
    inline: '$F_1$',
    description: 'Harmonic mean of Precision and Recall. Balances both — a single number summarising retrieval quality.',
    color: 'violet',
    tip: 'F1 = 1 only when both P and R are perfect.',
  },
  {
    id: 'mrr',
    label: 'MRR',
    symbol: 'MRR',
    formula: '$$\\text{MRR} = \\frac{1}{|Q|}\\sum_{i=1}^{|Q|} \\frac{1}{\\text{rank}_i}$$',
    inline: '$\\text{MRR}$',
    description: 'Mean Reciprocal Rank — averages the reciprocal of the rank at which the first relevant document appears across queries.',
    color: 'rose',
    tip: 'MRR penalises having the first relevant result at rank 3 vs rank 1 by ⅔.',
  },
];

// ── Document pool (shared across all systems) ────────────────────────────────
export const DOCUMENT_POOL = [
  {
    id: 'D01',
    title: 'BM25: A Probabilistic Retrieval Framework',
    snippet: 'Introduces BM25 term-frequency normalisation with parameters k₁ and b for ad-hoc lexical document retrieval tasks.',
    topics: ['bm25', 'lexical', 'keyword', 'probabilistic', 'term frequency', 'k1', 'b', 'tf-idf', 'exact match', 'information retrieval', 'ranking'],
    graphLinks: ['D06', 'D04', 'D07'],
  },
  {
    id: 'D02',
    title: 'Dense Passage Retrieval with BERT',
    snippet: 'Bi-encoder neural network fine-tuned on MS-MARCO for open-domain question answering with dense vector embeddings.',
    topics: ['dense', 'passage', 'retrieval', 'bert', 'bi-encoder', 'embeddings', 'vectors', 'ms-marco', 'neural search', 'semantic search', 'ann'],
    graphLinks: ['D03', 'D04', 'D13', 'D07'],
  },
  {
    id: 'D03',
    title: 'Approximate Nearest Neighbour with FAISS',
    snippet: 'Facebook AI Similarity Search for billion-scale vector indexing; enables sub-millisecond approximate nearest-neighbour (ANN) queries.',
    topics: ['faiss', 'approximate nearest neighbour', 'ann', 'vector search', 'indexing', 'embeddings', 'similarity search', 'scale', 'dense'],
    graphLinks: ['D02', 'D04'],
  },
  {
    id: 'D04',
    title: 'Reciprocal Rank Fusion for Hybrid Retrieval',
    snippet: 'Combines multiple ranked lists (BM25 and dense embeddings) without hyperparameter tuning, consistently outperforming individual systems.',
    topics: ['reciprocal rank fusion', 'rrf', 'hybrid retrieval', 'ensemble', 'combining rankings', 'bm25', 'dense', 'fusion', 'rank aggregation'],
    graphLinks: ['D01', 'D02', 'D05', 'D06'],
  },
  {
    id: 'D05',
    title: 'GraphRAG: Knowledge-Graph-Augmented Generation',
    snippet: 'Traverses entity–relation knowledge graphs to answer complex multi-hop questions beyond the reach of flat vector similarity search.',
    topics: ['graphrag', 'knowledge graph', 'multi-hop', 'relational retrieval', 'entities', 'graph traversal', 'complex queries', 'subgraph', 'rag'],
    graphLinks: ['D04', 'D06', 'D02', 'D11'],
  },
  {
    id: 'D06',
    title: 'Evaluation Metrics for Information Retrieval',
    snippet: 'A comprehensive survey of Precision@k, Recall@k, F1-Score, NDCG, MAP, and MRR across standard TREC evaluation benchmarks.',
    topics: ['evaluation metrics', 'precision', 'recall', 'f1', 'mrr', 'mean reciprocal rank', 'ndcg', 'map', 'trec', 'benchmark', 'ground truth', 'relevance'],
    graphLinks: ['D01', 'D04', 'D05', 'D07'],
  },
  {
    id: 'D07',
    title: 'TREC 2024 Deep Learning Track Overview',
    snippet: 'Benchmarking state-of-the-art neural dense retrievers, learned sparse rankers, and multi-stage re-ranking pipelines on massive corpora.',
    topics: ['trec', 'deep learning track', 'neural retrieval', 'passage retrieval', 'benchmark', 'evaluation', 'learned sparse', 're-ranking'],
    graphLinks: ['D01', 'D02', 'D06'],
  },
  {
    id: 'D08',
    title: 'Convolutional Neural Networks for Image Classification',
    snippet: 'Deep residual networks (ResNet) for large-scale visual recognition and feature extraction on the ImageNet benchmark dataset.',
    topics: ['cnn', 'convolutional', 'image classification', 'computer vision', 'resnet', 'imagenet', 'visual recognition'],
    graphLinks: [],
  },
  {
    id: 'D09',
    title: 'Stock Market Prediction with LSTM Networks',
    snippet: 'Recurrent neural network models and long short-term memory (LSTM) for financial time-series price forecasting using historical market data.',
    topics: ['stock market', 'lstm', 'rnn', 'time series', 'finance', 'forecasting', 'recurrent neural network'],
    graphLinks: [],
  },
  {
    id: 'D10',
    title: 'Transformer Architecture for Machine Translation',
    snippet: 'Self-attention mechanisms replacing recurrence in sequence-to-sequence neural machine translation models (Attention Is All You Need).',
    topics: ['transformer', 'machine translation', 'self-attention', 'seq2seq', 'attention is all you need', 'nlp', 'encoder-decoder'],
    graphLinks: ['D13'],
  },
  {
    id: 'D11',
    title: 'The PageRank Algorithm and Web Graph Analysis',
    snippet: 'Link-structure analysis algorithm utilizing stationary probability distribution of random web surfers for search engine authority scoring.',
    topics: ['pagerank', 'web graph', 'link analysis', 'google search', 'random walk', 'authority scoring', 'graph centrality'],
    graphLinks: ['D05'],
  },
  {
    id: 'D12',
    title: 'Clustering Algorithms: K-Means and DBSCAN',
    snippet: 'Unsupervised geometric clustering techniques for partitioning multi-dimensional vector spaces into density-connected clusters.',
    topics: ['clustering', 'k-means', 'dbscan', 'unsupervised learning', 'density clustering', 'vector space'],
    graphLinks: ['D03'],
  },
  {
    id: 'D13',
    title: 'BERT Pre-training of Deep Bidirectional Transformers',
    snippet: 'Language representation model trained using masked language modeling (MLM) and next sentence prediction (NSP) for NLP downstream tasks.',
    topics: ['bert', 'pre-training', 'masked language model', 'bidirectional', 'transformers', 'nlp', 'language representations'],
    graphLinks: ['D02', 'D10'],
  },
  {
    id: 'D14',
    title: 'Matrix Factorisation for Collaborative Filtering',
    snippet: 'Latent factor decomposition models for recommendation systems, decomposing sparse user–item feedback interaction matrices.',
    topics: ['matrix factorisation', 'collaborative filtering', 'recommender systems', 'latent factors', 'user item matrix'],
    graphLinks: [],
  },
];

export const DEFAULT_QUERY = 'Information Retrieval evaluation metrics, dense passage search, and hybrid ranking';

export const EXAMPLE_QUERIES = [
  {
    query: 'Dense Passage Retrieval with BERT and FAISS vector indexing',
    label: 'Dense Vector Search',
    badge: 'Neural Search',
    icon: '🧠',
    hint: 'Bi-encoders and ANN indexes excel on vector embedding concepts.',
  },
  {
    query: 'BM25 probabilistic term frequency formula parameters k1 and b',
    label: 'BM25 Keyword Matching',
    badge: 'Lexical Match',
    icon: '🔑',
    hint: 'Exact token matching shines; tests lexical scoring vs vocabulary gap.',
  },
  {
    query: 'Knowledge graph entity relations and multi-hop question answering GraphRAG',
    label: 'GraphRAG Multi-Hop',
    badge: 'Graph Reasoning',
    icon: '🕸️',
    hint: 'Relational knowledge graph traversal surfaces interconnected facts.',
  },
  {
    query: 'Reciprocal rank fusion hybrid retrieval combining BM25 and dense vectors',
    label: 'Hybrid RRF Fusion',
    badge: 'Ensemble',
    icon: '⚡',
    hint: 'Ensemble merging both lexical and semantic ranks for peak F1.',
  },
  {
    query: 'Evaluation metrics for information retrieval Precision Recall F1 and MRR',
    label: 'IR Evaluation Metrics',
    badge: 'Benchmark',
    icon: '📊',
    hint: 'Surfaces benchmark evaluation surveys and TREC tracks.',
  },
  {
    query: 'Convolutional neural networks ResNet for image classification',
    label: 'Computer Vision (Out-of-IR Domain)',
    badge: 'Domain Shift',
    icon: '🖼️',
    hint: 'Demonstrates retrieval behavior when searching non-IR computer science topics.',
  },
];

export const CORPUS_SCOPE = {
  domain: 'Academic Computer Science & Information Retrieval (14 Indexed Documents)',
  categories: [
    'Information Retrieval & BM25',
    'Dense Passage Retrieval & Embeddings',
    'Approximate Nearest Neighbor (FAISS)',
    'Reciprocal Rank Fusion (Hybrid)',
    'GraphRAG & Knowledge Graphs',
    'IR Evaluation (Precision, Recall, MRR, TREC)',
    'Transformers & BERT NLP',
    'General ML (Vision, Time-Series, Clustering, Recommenders)',
  ],
};

const DOC_MAP = Object.fromEntries(DOCUMENT_POOL.map(d => [d.id, d]));

// Semantic keyword synonym mapping for dense simulation
const SEMANTIC_CLUSTERS = {
  dense: ['dense', 'passage', 'bi-encoder', 'bert', 'embedding', 'embeddings', 'vector', 'vectors', 'neural', 'ann', 'faiss', 'semantic', 'similarity', 'cosine'],
  keyword: ['bm25', 'lexical', 'term', 'frequency', 'tf', 'idf', 'tf-idf', 'token', 'tokens', 'probabilistic', 'k1', 'b', 'exact', 'word'],
  hybrid: ['hybrid', 'rrf', 'reciprocal', 'rank', 'fusion', 'ensemble', 'combine', 'combining', 'merging', 'ranker', 'multi-stage'],
  graph: ['graph', 'graphrag', 'knowledge', 'multi-hop', 'relational', 'entities', 'entity', 'relations', 'edges', 'nodes', 'subgraph', 'pagerank'],
  eval: ['evaluation', 'eval', 'metric', 'metrics', 'precision', 'recall', 'f1', 'mrr', 'map', 'ndcg', 'trec', 'benchmark', 'ground truth', 'relevance'],
  nlp: ['transformer', 'nlp', 'language', 'bert', 'masked', 'attention', 'translation', 'seq2seq'],
  vision: ['cnn', 'convolutional', 'image', 'vision', 'resnet', 'imagenet', 'visual'],
  finance: ['stock', 'market', 'lstm', 'rnn', 'financial', 'time-series', 'forecast', 'forecasting'],
  recsys: ['matrix', 'factorisation', 'factorization', 'collaborative', 'filtering', 'recommender', 'user-item'],
  cluster: ['clustering', 'cluster', 'k-means', 'dbscan', 'unsupervised'],
};

function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

/**
 * Computes BM25 lexical score for a document given query tokens.
 */
function scoreBM25(doc, queryTokens) {
  if (queryTokens.length === 0) return 0;
  const titleTokens = tokenize(doc.title);
  const snippetTokens = tokenize(doc.snippet);
  const docTokens = [...titleTokens, ...snippetTokens];
  const docLen = docTokens.length;
  const avgLen = 22;
  const k1 = 1.2;
  const b = 0.75;

  let score = 0;
  queryTokens.forEach(q => {
    // Title matches receive higher weight
    const titleCount = titleTokens.filter(t => t === q || t.includes(q) || q.includes(t)).length;
    const bodyCount = snippetTokens.filter(t => t === q || t.includes(q) || q.includes(t)).length;
    const tf = (titleCount * 3.0) + bodyCount;
    if (tf > 0) {
      const idf = 1.5; // approximated IDF over small collection
      const num = tf * (k1 + 1);
      const denom = tf + k1 * (1 - b + b * (docLen / avgLen));
      score += idf * (num / denom);
    }
  });
  return score;
}

/**
 * Computes Semantic Dense cosine-similarity score given query tokens and topic clusters.
 */
function scoreDense(doc, queryTokens) {
  if (queryTokens.length === 0) return 0;
  const docText = `${doc.title} ${doc.snippet} ${doc.topics.join(' ')}`.toLowerCase();
  let score = 0;

  // Direct term match bonus
  queryTokens.forEach(q => {
    if (docText.includes(q)) score += 1.8;
  });

  // Semantic concept overlap
  Object.values(SEMANTIC_CLUSTERS).forEach(cluster => {
    const qMatches = queryTokens.filter(q => cluster.includes(q)).length;
    if (qMatches > 0) {
      const docMatches = doc.topics.filter(t => cluster.some(c => t.includes(c))).length;
      score += qMatches * docMatches * 1.2;
    }
  });

  return score;
}

/**
 * Computes GraphRAG relational score incorporating 1-hop knowledge graph connectivity.
 */
function scoreGraphRAG(doc, denseScores, bm25Scores) {
  const selfScore = (denseScores[doc.id] * 0.6) + (bm25Scores[doc.id] * 0.4);
  let neighborScore = 0;

  if (doc.graphLinks && doc.graphLinks.length > 0) {
    doc.graphLinks.forEach(nbrId => {
      const nbrDense = denseScores[nbrId] || 0;
      const nbrBM25 = bm25Scores[nbrId] || 0;
      neighborScore += (nbrDense * 0.35 + nbrBM25 * 0.25);
    });
    neighborScore /= doc.graphLinks.length;
  }

  return selfScore * 0.65 + neighborScore * 0.35;
}

/**
 * Dynamic query evaluator: returns sorted ranked document IDs for all 4 systems,
 * plus the ground-truth relevant document set for the given query.
 */
export function evaluateQueryAcrossSystems(queryString = '') {
  const cleanQuery = (queryString || DEFAULT_QUERY).trim();
  const qTokens = tokenize(cleanQuery);

  const bm25Raw = {};
  const denseRaw = {};

  DOCUMENT_POOL.forEach(doc => {
    bm25Raw[doc.id] = scoreBM25(doc, qTokens);
    denseRaw[doc.id] = scoreDense(doc, qTokens);
  });

  const graphRaw = {};
  DOCUMENT_POOL.forEach(doc => {
    graphRaw[doc.id] = scoreGraphRAG(doc, denseRaw, bm25Raw);
  });

  // Determine ground-truth relevance for this query:
  // A document is relevant if it has substantial BM25 or Semantic Dense score
  const maxScore = Math.max(...Object.values(denseRaw), ...Object.values(bm25Raw), 0.001);
  const relevantDocIds = new Set();

  DOCUMENT_POOL.forEach(doc => {
    const combinedRelevance = (denseRaw[doc.id] * 0.6) + (bm25Raw[doc.id] * 0.4);
    // Dynamic threshold: >= 20% of max score and at least basic match
    if (combinedRelevance >= Math.max(1.5, maxScore * 0.22)) {
      relevantDocIds.add(doc.id);
    }
  });

  // If query is default baseline and no custom query was typed, fallback to the 7 canonical IR docs
  if (relevantDocIds.size === 0 && (!queryString || queryString === DEFAULT_QUERY)) {
    ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07'].forEach(id => relevantDocIds.add(id));
  }

  // Rank BM25
  const rankedKeyword = [...DOCUMENT_POOL]
    .sort((a, b) => (bm25Raw[b.id] - bm25Raw[a.id]) || (denseRaw[b.id] - denseRaw[a.id]))
    .map(d => d.id);

  // Rank Semantic Dense
  const rankedSemantic = [...DOCUMENT_POOL]
    .sort((a, b) => (denseRaw[b.id] - denseRaw[a.id]) || (bm25Raw[b.id] - bm25Raw[a.id]))
    .map(d => d.id);

  // Rank Hybrid (RRF)
  const kwRankMap = Object.fromEntries(rankedKeyword.map((id, idx) => [id, idx + 1]));
  const semRankMap = Object.fromEntries(rankedSemantic.map((id, idx) => [id, idx + 1]));
  const rrfScores = {};
  DOCUMENT_POOL.forEach(doc => {
    const rk = kwRankMap[doc.id] || 15;
    const rs = semRankMap[doc.id] || 15;
    rrfScores[doc.id] = (1 / (60 + rk)) + (1 / (60 + rs));
  });

  const rankedHybrid = [...DOCUMENT_POOL]
    .sort((a, b) => rrfScores[b.id] - rrfScores[a.id])
    .map(d => d.id);

  // Rank GraphRAG
  const rankedGraph = [...DOCUMENT_POOL]
    .sort((a, b) => (graphRaw[b.id] - graphRaw[a.id]) || (rrfScores[b.id] - rrfScores[a.id]))
    .map(d => d.id);

  return {
    query: cleanQuery,
    tokens: qTokens,
    relevantDocIds,
    rankedLists: {
      keyword: rankedKeyword,
      semantic: rankedSemantic,
      hybrid: rankedHybrid,
      graph: rankedGraph,
    },
    scores: {
      bm25: bm25Raw,
      dense: denseRaw,
      graph: graphRaw,
      rrf: rrfScores,
    },
  };
}

/**
 * Given a system id, cutoff K, and active query string, compute all IR metrics.
 */
export function computeMetrics(systemId, k = 5, queryString = '') {
  const evalResult = evaluateQueryAcrossSystems(queryString);
  const rankedList = evalResult.rankedLists[systemId] || evalResult.rankedLists.keyword;
  const ranked = rankedList.slice(0, k);
  const relevantSet = evalResult.relevantDocIds;
  const totalRelevant = Math.max(relevantSet.size, 1); // Avoid div by zero

  let relevantRetrieved = 0;
  let firstRelevantRank = null;

  const results = ranked.map((docId, idx) => {
    const doc = DOC_MAP[docId] || { id: docId, title: 'Unknown Document', snippet: '', topics: [] };
    const isRel = relevantSet.has(docId);
    if (isRel) {
      relevantRetrieved++;
      if (firstRelevantRank === null) firstRelevantRank = idx + 1;
    }
    return { ...doc, rank: idx + 1, isRelevant: isRel };
  });

  // Calculate Precision, Recall, F1, Reciprocal Rank
  const precision = relevantSet.size === 0 ? 0 : relevantRetrieved / k;
  const recall = relevantSet.size === 0 ? 0 : relevantRetrieved / totalRelevant;
  const f1 = (precision + recall > 0) ? (2 * precision * recall) / (precision + recall) : 0;
  const rr = firstRelevantRank ? 1 / firstRelevantRank : 0;

  return {
    results,
    precision: +precision.toFixed(3),
    recall: +recall.toFixed(3),
    f1: +f1.toFixed(3),
    rr: +rr.toFixed(3),
    relevantRetrieved,
    totalRelevant: relevantSet.size,
    k,
    systemId,
    query: evalResult.query,
    isOutOfDomain: relevantSet.size === 0,
  };
}

/**
 * Compute metric values across k = 1..10 for curve charts for a given query.
 */
export function computeCurve(systemId, queryString = '') {
  return Array.from({ length: 10 }, (_, i) => computeMetrics(systemId, i + 1, queryString));
}

// ── MRR across simulated query scenarios ─────────────────────────────────────
const QUERY_FIRST_RANKS = {
  keyword: [1, 3, 2, 5],
  semantic: [1, 1, 2, 3],
  hybrid: [1, 1, 1, 2],
  graph: [1, 1, 1, 1],
};

export function computeMRR(systemId, queryString = '') {
  if (queryString && queryString !== DEFAULT_QUERY) {
    // Return RR of the active custom query
    const m = computeMetrics(systemId, 10, queryString);
    return m.rr;
  }
  const ranks = QUERY_FIRST_RANKS[systemId] || [1, 2, 2, 3];
  const mrr = ranks.reduce((acc, r) => acc + 1 / r, 0) / ranks.length;
  return +mrr.toFixed(3);
}

// ── Aggregate comparison table (computed at cutoff k for query, defaults to k=10) ──
export function getComparisonTable(queryString = '', k = 10) {
  return RETRIEVAL_SYSTEMS.map(sys => {
    const m = computeMetrics(sys.id, k, queryString);
    return {
      ...sys,
      k,
      precision: m.precision,
      recall: m.recall,
      f1: m.f1,
      mrr: computeMRR(sys.id, queryString),
      latency: sys.latency,
    };
  });
}

// ── Quiz questions ────────────────────────────────────────────────────────────
export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'A system retrieves 8 documents. 5 are relevant and there are 10 relevant documents in the corpus. What is Precision@8?',
    options: ['0.500', '0.625', '0.500 and 0.500', '0.800'],
    answer: 1,
    explanation: 'Precision@8 = relevant retrieved / k = 5/8 = 0.625. Recall@8 = 5/10 = 0.500.',
  },
  {
    id: 2,
    question: 'Which metric specifically measures how many of all relevant documents were found?',
    options: ['Precision@k', 'F1-Score', 'Recall@k', 'MRR'],
    answer: 2,
    explanation: 'Recall = (relevant retrieved) / (total relevant). It quantifies coverage of the relevant set.',
  },
  {
    id: 3,
    question: 'If Precision = 0.6 and Recall = 0.4, what is the F1-Score?',
    options: ['0.480', '0.500', '0.600', '0.400'],
    answer: 0,
    explanation: 'F1 = 2·P·R / (P+R) = 2·0.6·0.4 / (0.6+0.4) = 0.48/1.0 = 0.480.',
  },
  {
    id: 4,
    question: 'Across 3 queries, the first relevant document appears at ranks 1, 2, and 4 respectively. What is MRR?',
    options: ['0.583', '0.500', '0.417', '0.750'],
    answer: 0,
    explanation: 'MRR = (1/3)·(1/1 + 1/2 + 1/4) = (1/3)·1.75 ≈ 0.583.',
  },
  {
    id: 5,
    question: 'Which retrieval system uses Reciprocal Rank Fusion to combine multiple ranked lists?',
    options: ['Keyword (BM25)', 'Semantic (Dense)', 'Hybrid', 'Graph (GraphRAG)'],
    answer: 2,
    explanation: 'Hybrid retrieval applies RRF to merge BM25 and dense vector ranked lists into a single unified ranking.',
  },
  {
    id: 6,
    question: 'BM25 uses two key parameters k₁ and b. What does the parameter b control?',
    options: ['Term frequency saturation', 'Document length normalisation', 'Query expansion weight', 'IDF smoothing'],
    answer: 1,
    explanation: 'The parameter b (0 ≤ b ≤ 1) controls document-length normalisation. b=1 is full normalisation; b=0 disables it.',
  },
  {
    id: 7,
    question: 'A system has Perfect Precision (P=1.0) but very low Recall (R=0.1). Its F1-Score is approximately:',
    options: ['0.182', '0.550', '1.000', '0.100'],
    answer: 0,
    explanation: 'F1 = 2·1.0·0.1 / (1.0+0.1) = 0.2/1.1 ≈ 0.182. The harmonic mean heavily penalises extreme imbalance.',
  },
  {
    id: 8,
    question: 'For which type of query does GraphRAG typically outperform flat retrieval systems?',
    options: ['Simple keyword lookup', 'Multi-hop relational queries', 'Single-sentence factoid questions', 'Exact-phrase search'],
    answer: 1,
    explanation: 'GraphRAG traverses knowledge-graph edges to answer multi-hop questions requiring synthesis of related facts.',
  },
  {
    id: 9,
    question: 'If a system returns 0 relevant documents at any rank, what is MRR?',
    options: ['1.0', 'undefined (∞)', '0.0', '0.5'],
    answer: 2,
    explanation: 'If no relevant document is found, the reciprocal rank = 1/∞ → 0. So MRR = 0.0 for that query.',
  },
  {
    id: 10,
    question: 'Dense retrieval uses bi-encoders to compute similarity. Which measure is typically used?',
    options: ['Euclidean Distance', 'Cosine Similarity', 'Jaccard Coefficient', 'BM25 Score'],
    answer: 1,
    explanation: 'Cosine similarity ($\\cos(\\theta) = \\frac{\\mathbf{q} \\cdot \\mathbf{d}}{|\\mathbf{q}||\\mathbf{d}|}$) measures angle between query and document embedding vectors.',
  },
];
