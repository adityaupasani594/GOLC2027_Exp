import { getComparisonTable } from '../src/experiments/exp15/data/labData.js';

const queries = [
  'deep learning in information retrieval',
  'Information Retrieval evaluation metrics (Precision, Recall, F1, MRR, MAP, NDCG)',
  'BM25 probabilistic lexical search and inverted index',
  'Dense passage retrieval with BERT embeddings and FAISS vector index',
  'Knowledge Graph multi-hop reasoning and GraphRAG'
];

queries.forEach(q => {
  console.log('\n======================================================');
  console.log('Query:', q);
  const table = getComparisonTable(q, 5);
  console.table(table.map(r => ({
    System: r.label,
    'P@5': r.precision,
    'R@5': r.recall,
    'F1': r.f1,
    'MRR': r.mrr,
    Latency: `${r.latency}ms`
  })));
});
