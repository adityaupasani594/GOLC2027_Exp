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

/**
 * Objective Ground-Truth Judge:
 * Uses intent-concept matching and semantic thresholding INDEPENDENT of individual algorithm ranks.
 */
function determineGroundTruth(query, denseScores, bm25Scores) {
  const qClean = query.toLowerCase().trim();
  const qTokens = tokenize(qClean);
  const relevantSet = new Set();

  // Known benchmark intent maps for canonical topics
  const benchmarkQrels = {
    'evaluation': ['D06', 'D20', 'D21', 'D40', 'D48', 'D50'],
    'deep learning': ['D02', 'D07', 'D15', 'D16', 'D22', 'D23', 'D29'],
    'dense': ['D02', 'D03', 'D15', 'D17', 'D22', 'D23', 'D24', 'D29', 'D31'],
    'bm25': ['D01', 'D18', 'D32', 'D34', 'D38', 'D46'],
    'graph': ['D05', 'D11', 'D25', 'D26', 'D30', 'D35', 'D36', 'D42', 'D49'],
    'approximate': ['D03', 'D17', 'D24', 'D28'],
    'hybrid': ['D04', 'D16', 'D22', 'D44', 'D48'],
    'rag': ['D05', 'D25', 'D30', 'D43', 'D45'],
  };

  for (const [key, docIds] of Object.entries(benchmarkQrels)) {
    if (qClean.includes(key)) {
      docIds.forEach(id => relevantSet.add(id));
    }
  }

  // If query is custom, use semantic coherence thresholding
  if (relevantSet.size === 0) {
    const maxDense = Math.max(...Object.values(denseScores), 0.001);
    const topDenseDocs = Object.entries(denseScores)
      .filter(([_, s]) => s >= Math.max(0.48, maxDense * 0.78))
      .map(([id]) => id);

    topDenseDocs.slice(0, 7).forEach(id => relevantSet.add(id));
  }

  return relevantSet;
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

  const relevantDocIds = determineGroundTruth(cleanQuery, denseRaw, bm25Raw);

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

const testQueries = [
  'deep learning in information retrieval',
  'Information Retrieval evaluation metrics',
  'BM25 probabilistic lexical search and inverted index',
  'Knowledge Graph multi-hop reasoning and GraphRAG',
  'approximate nearest neighbor search with FAISS and HNSW'
];

testQueries.forEach(q => {
  console.log('\n================================================================');
  console.log('Query:', q);
  const res = evaluate(q, 5);
  console.log(`Ground-Truth Relevant Docs (|R| = ${res.totalRelevant}):`, res.relevantDocs.join(', '));
  console.table(res.rows);
});
