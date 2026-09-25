import { DOCUMENT_POOL, DEFAULT_QUERY, RETRIEVAL_SYSTEMS } from '../src/experiments/exp15/data/labData.js';
import { DOCUMENT_EMBEDDINGS, encodeQueryVector, dotProduct } from '../src/experiments/exp15/data/offlineEmbeddings.js';

function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

function scoreBM25(doc, queryTokens) {
  if (queryTokens.length === 0) return 0;
  const titleTokens = tokenize(doc.title);
  const snippetTokens = tokenize(doc.snippet);
  const docTokens = [...titleTokens, ...snippetTokens];
  const docLen = docTokens.length;
  const avgLen = 24;
  const k1 = 1.2;
  const b = 0.75;

  let score = 0;
  queryTokens.forEach(q => {
    const titleCount = titleTokens.filter(t => t === q || t.includes(q) || q.includes(t)).length;
    const bodyCount = snippetTokens.filter(t => t === q || t.includes(q) || q.includes(t)).length;
    const tf = (titleCount * 3.5) + bodyCount;
    if (tf > 0) {
      const idf = 1.6;
      const num = tf * (k1 + 1);
      const denom = tf + k1 * (1 - b + b * (docLen / avgLen));
      score += idf * (num / denom);
    }
  });
  return score;
}

function scoreDense(doc, cleanQuery) {
  const queryVec = encodeQueryVector(cleanQuery);
  const docVec = DOCUMENT_EMBEDDINGS[doc.id];
  if (queryVec && docVec) {
    return Math.max(0, dotProduct(queryVec, docVec));
  }
  return 0;
}

function scoreGraphRAG(doc, denseScores, bm25Scores) {
  const selfScore = (denseScores[doc.id] * 0.65) + (Math.min(bm25Scores[doc.id] / 6.0, 1.0) * 0.35);
  let neighborScore = 0;
  if (doc.graphLinks && doc.graphLinks.length > 0) {
    doc.graphLinks.forEach(nbrId => {
      const nbrDense = denseScores[nbrId] || 0;
      const nbrBM25 = Math.min((bm25Scores[nbrId] || 0) / 6.0, 1.0);
      neighborScore += (nbrDense * 0.65 + nbrBM25 * 0.35);
    });
    neighborScore /= doc.graphLinks.length;
  }
  return selfScore * 0.65 + neighborScore * 0.35;
}

function evaluate(queryString = '', k = 5) {
  const cleanQuery = (queryString || DEFAULT_QUERY).trim();
  const qTokens = tokenize(cleanQuery);

  const bm25Raw = {};
  const denseRaw = {};

  DOCUMENT_POOL.forEach(doc => {
    bm25Raw[doc.id] = scoreBM25(doc, qTokens);
    denseRaw[doc.id] = scoreDense(doc, cleanQuery);
  });

  const graphRaw = {};
  DOCUMENT_POOL.forEach(doc => {
    graphRaw[doc.id] = scoreGraphRAG(doc, denseRaw, bm25Raw);
  });

  const maxDense = Math.max(...Object.values(denseRaw), 0.001);
  const maxBM25 = Math.max(...Object.values(bm25Raw), 0.001);

  // Calibrated ground truth relevance threshold
  const thresholdDense = Math.max(0.48, maxDense * 0.68);
  const thresholdBM25 = Math.max(3.0, maxBM25 * 0.65);
  const relevantDocIds = new Set();

  DOCUMENT_POOL.forEach(doc => {
    const isDenseMatch = denseRaw[doc.id] >= thresholdDense;
    const isBM25Match = bm25Raw[doc.id] >= thresholdBM25;
    const isCombinedMatch = ((denseRaw[doc.id] / maxDense) * 0.6 + (bm25Raw[doc.id] / maxBM25) * 0.4) >= 0.68;

    if (isDenseMatch || isBM25Match || isCombinedMatch) {
      relevantDocIds.add(doc.id);
    }
  });

  const rankedKeyword = [...DOCUMENT_POOL]
    .sort((a, b) => (bm25Raw[b.id] - bm25Raw[a.id]) || (denseRaw[b.id] - denseRaw[a.id]))
    .map(d => d.id);

  const rankedSemantic = [...DOCUMENT_POOL]
    .sort((a, b) => (denseRaw[b.id] - denseRaw[a.id]) || (bm25Raw[b.id] - bm25Raw[a.id]))
    .map(d => d.id);

  const kwRankMap = Object.fromEntries(rankedKeyword.map((id, idx) => [id, idx + 1]));
  const semRankMap = Object.fromEntries(rankedSemantic.map((id, idx) => [id, idx + 1]));
  const rrfScores = {};
  DOCUMENT_POOL.forEach(doc => {
    const rk = kwRankMap[doc.id] || 50;
    const rs = semRankMap[doc.id] || 50;
    rrfScores[doc.id] = (1 / (60 + rk)) + (1 / (60 + rs));
  });

  const rankedHybrid = [...DOCUMENT_POOL]
    .sort((a, b) => rrfScores[b.id] - rrfScores[a.id])
    .map(d => d.id);

  const rankedGraph = [...DOCUMENT_POOL]
    .sort((a, b) => (graphRaw[b.id] - graphRaw[a.id]) || (rrfScores[b.id] - rrfScores[a.id]))
    .map(d => d.id);

  const systems = [
    { id: 'keyword', label: 'Keyword (BM25)', ranked: rankedKeyword, latency: 8 },
    { id: 'semantic', label: 'Semantic (Dense)', ranked: rankedSemantic, latency: 32 },
    { id: 'hybrid', label: 'Hybrid (RRF)', ranked: rankedHybrid, latency: 41 },
    { id: 'graph', label: 'Graph (GraphRAG)', ranked: rankedGraph, latency: 62 },
  ];

  const totalRelevant = Math.max(relevantDocIds.size, 1);

  return {
    totalRelevant: relevantDocIds.size,
    relevantDocs: Array.from(relevantDocIds),
    rows: systems.map(sys => {
      const topK = sys.ranked.slice(0, k);
      const relRetrieved = topK.filter(id => relevantDocIds.has(id)).length;
      const firstRelIdx = sys.ranked.findIndex(id => relevantDocIds.has(id));
      const mrr = firstRelIdx >= 0 ? 1 / (firstRelIdx + 1) : 0;
      const precision = relRetrieved / k;
      const recall = relRetrieved / totalRelevant;
      const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
      return {
        System: sys.label,
        [`P@${k}`]: +precision.toFixed(3),
        [`R@${k}`]: +recall.toFixed(3),
        F1: +f1.toFixed(3),
        MRR: +mrr.toFixed(3),
        Latency: `${sys.latency}ms`,
        'Top-5 Hits': topK.map(id => relevantDocIds.has(id) ? `✓${id}` : `✗${id}`).join(' ')
      };
    })
  };
}

const queries = [
  'Information Retrieval evaluation metrics (Precision, Recall, F1, MRR, MAP, NDCG)',
  'BM25 probabilistic lexical search and inverted index',
  'Dense passage retrieval with BERT embeddings and FAISS vector index',
  'Knowledge Graph multi-hop reasoning and GraphRAG'
];

queries.forEach(q => {
  console.log('\n================================================================');
  console.log('Query:', q);
  const res = evaluate(q, 5);
  console.log(`Ground-Truth Relevant Docs (|R| = ${res.totalRelevant}):`, res.relevantDocs.join(', '));
  console.table(res.rows);
});
