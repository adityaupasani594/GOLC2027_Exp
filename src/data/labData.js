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
// Each document is labelled as globally relevant (true) or irrelevant (false)
export const DOCUMENT_POOL = [
  { id: 'D01', title: 'BM25: A Probabilistic Retrieval Framework', snippet: 'Introduces BM25 term-frequency normalisation with parameters k₁ and b for ad-hoc document retrieval tasks.', relevant: true },
  { id: 'D02', title: 'Dense Passage Retrieval with BERT', snippet: 'Bi-encoder fine-tuned on MS-MARCO for open-domain QA with approximate nearest-neighbour search.', relevant: true },
  { id: 'D03', title: 'Approximate Nearest Neighbour with FAISS', snippet: 'Facebook AI Similarity Search for billion-scale vector indexing; enables sub-millisecond ANN queries.', relevant: true },
  { id: 'D04', title: 'Reciprocal Rank Fusion for Hybrid Retrieval', snippet: 'Combines multiple ranked lists without tuned weights, consistently outperforming individual systems.', relevant: true },
  { id: 'D05', title: 'GraphRAG: Knowledge-Graph-Augmented Generation', snippet: 'Traverses entity–relation graphs to answer complex multi-hop questions beyond the reach of flat search.', relevant: true },
  { id: 'D06', title: 'Evaluation Metrics for Information Retrieval', snippet: 'A comprehensive survey of Precision, Recall, NDCG, MAP and MRR in TREC-style evaluation frameworks.', relevant: true },
  { id: 'D07', title: 'TREC 2024 Deep Learning Track Overview', snippet: 'Results and analyses from the TREC deep learning passage retrieval track across multiple teams.', relevant: true },
  { id: 'D08', title: 'Convolutional Neural Networks for Image Classification', snippet: 'ResNet architectures for large-scale visual recognition on ImageNet benchmark dataset.', relevant: false },
  { id: 'D09', title: 'Stock Market Prediction with LSTM Networks', snippet: 'Recurrent neural network models for financial time-series forecasting using historical price data.', relevant: false },
  { id: 'D10', title: 'Transformer Architecture for Machine Translation', snippet: 'Attention-is-all-you-need paper introducing multi-head self-attention for seq-to-seq tasks.', relevant: false },
  { id: 'D11', title: 'The PageRank Algorithm and Web Graph Analysis', snippet: 'Link analysis algorithm that underpins Google Search web graph importance scoring.', relevant: false },
  { id: 'D12', title: 'Clustering Algorithms: K-Means and DBSCAN', snippet: 'Unsupervised learning methods for partitioning data into compact, well-separated clusters.', relevant: false },
  { id: 'D13', title: 'BERT Pre-training of Deep Bidirectional Transformers', snippet: 'Language model pre-training with masked language modelling and next-sentence prediction objectives.', relevant: false },
  { id: 'D14', title: 'Matrix Factorisation for Collaborative Filtering', snippet: 'Latent factor models for recommender systems, decomposing user–item interaction matrices.', relevant: false },
];

// ── Per-system ranked result configurations ──────────────────────────────────
// Each entry defines which doc IDs appear in the ranked list for that system
// (in rank order). Documents NOT in DOCUMENT_POOL or marked irrelevant are non-relevant hits.
export const SYSTEM_RANKED_LISTS = {
  keyword: ['D01', 'D08', 'D06', 'D09', 'D02', 'D11', 'D04', 'D10', 'D07', 'D12'],
  semantic: ['D02', 'D01', 'D04', 'D03', 'D06', 'D05', 'D07', 'D13', 'D09', 'D11'],
  hybrid:   ['D01', 'D02', 'D04', 'D06', 'D03', 'D05', 'D07', 'D08', 'D10', 'D13'],
  graph:    ['D05', 'D04', 'D06', 'D01', 'D02', 'D07', 'D03', 'D08', 'D12', 'D11'],
};

// Build a lookup map
const DOC_MAP = Object.fromEntries(DOCUMENT_POOL.map(d => [d.id, d]));

/**
 * Given a system id and cutoff K, compute all IR metrics.
 */
export function computeMetrics(systemId, k = 10) {
  const ranked = SYSTEM_RANKED_LISTS[systemId].slice(0, k);
  const totalRelevant = DOCUMENT_POOL.filter(d => d.relevant).length;

  let relevantRetrieved = 0;
  let firstRelevantRank = null;

  const results = ranked.map((docId, idx) => {
    const doc = DOC_MAP[docId];
    const isRel = doc?.relevant ?? false;
    if (isRel) {
      relevantRetrieved++;
      if (firstRelevantRank === null) firstRelevantRank = idx + 1;
    }
    return { ...doc, rank: idx + 1, isRelevant: isRel };
  });

  const precision = relevantRetrieved / k;
  const recall = relevantRetrieved / totalRelevant;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const rr = firstRelevantRank ? 1 / firstRelevantRank : 0;

  return {
    results,
    precision: +precision.toFixed(3),
    recall: +recall.toFixed(3),
    f1: +f1.toFixed(3),
    rr: +rr.toFixed(3),
    relevantRetrieved,
    totalRelevant,
    k,
    systemId,
  };
}

/**
 * Compute metric values across k = 1..10 for curve charts.
 */
export function computeCurve(systemId) {
  return Array.from({ length: 10 }, (_, i) => computeMetrics(systemId, i + 1));
}

// ── MRR across a set of simulated queries ────────────────────────────────────
// For each system, we have 4 query scenarios with the rank of the first relevant doc
const QUERY_FIRST_RANKS = {
  keyword:  [1, 3, 2, 5],
  semantic: [1, 1, 2, 3],
  hybrid:   [1, 1, 1, 2],
  graph:    [1, 1, 1, 1],
};

export function computeMRR(systemId) {
  const ranks = QUERY_FIRST_RANKS[systemId];
  const mrr = ranks.reduce((acc, r) => acc + 1 / r, 0) / ranks.length;
  return +mrr.toFixed(3);
}

// ── Aggregate comparison table (pre-computed at K=10) ───────────────────────
export function getComparisonTable() {
  return RETRIEVAL_SYSTEMS.map(sys => {
    const m = computeMetrics(sys.id, 10);
    return {
      ...sys,
      precision: m.precision,
      recall: m.recall,
      f1: m.f1,
      mrr: computeMRR(sys.id),
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
