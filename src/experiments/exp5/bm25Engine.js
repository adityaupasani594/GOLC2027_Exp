/**
 * BM25 Based Document Ranking Engine
 * Implementation of Okapi BM25, TF-IDF Baseline, Text Preprocessing, and IR Evaluation Metrics.
 * Ported from Virtual Laboratory (IIT KGP / VESIT) app.py
 */

// ── Default 15-Document Information Retrieval Corpus ────────────────────────
export const DEFAULT_CORPUS = [
  {
    id: 'D01',
    title: 'Introduction to Information Retrieval',
    text: 'Information retrieval is the activity of obtaining information resources relevant to an information need from a collection of resources. Searches can be based on full-text or other content-based indexing. Information retrieval is the science of searching for information in documents, searching for documents themselves, searching for metadata that describe documents, or searching within databases.'
  },
  {
    id: 'D02',
    title: 'TF-IDF Weighting Scheme',
    text: 'TF-IDF stands for term frequency–inverse document frequency. It is a numerical statistic that reflects how important a word is to a document in a collection or corpus. TF-IDF is often used as a weighting factor in searches of information retrieval, text mining, and user modeling. The term frequency is the number of times the word appears in the document divided by the total number of words.'
  },
  {
    id: 'D03',
    title: 'Okapi BM25 Probabilistic Model',
    text: 'BM25 is a bag-of-words retrieval function that ranks a set of documents based on the query terms appearing in each document, regardless of their inter-relationships. It is a family of scoring functions with slightly different components and parameters. BM25 was developed at City University London by Stephen Robertson and Karen Sparck Jones. The k1 parameter controls term frequency saturation, while b controls document length normalization.'
  },
  {
    id: 'D04',
    title: 'Inverted Index Construction',
    text: 'An inverted index is a data structure used to create full-text searches. It maps words or terms to their locations in a set of documents. The construction of an inverted index involves tokenization, normalization, and posting list creation. Inverted indexes are the cornerstone of modern search engines including web search and enterprise search systems. Compression techniques like delta encoding reduce storage requirements significantly.'
  },
  {
    id: 'D05',
    title: 'Query Processing and Optimization',
    text: 'Query processing in information retrieval involves parsing the user query, expanding terms using thesauri or word embeddings, and matching against the index. Boolean retrieval models allow exact keyword matching with AND, OR, NOT operators. Ranked retrieval models order documents by estimated relevance. Query optimization techniques include query expansion, relevance feedback, and pseudo-relevance feedback to improve recall and precision.'
  },
  {
    id: 'D06',
    title: 'Evaluation Metrics for IR Systems',
    text: 'Evaluating information retrieval systems requires measuring precision, recall, F1 score, mean average precision, and normalized discounted cumulative gain. Precision measures the fraction of retrieved documents that are relevant. Recall measures the fraction of relevant documents that are retrieved. The F1 score is the harmonic mean of precision and recall. NDCG accounts for the graded relevance and the position of relevant documents in the ranked list.'
  },
  {
    id: 'D07',
    title: 'Probabilistic Retrieval Models',
    text: 'Probabilistic retrieval models estimate the probability that a document is relevant given a query. The Binary Independence Model assumes term independence and binary term occurrence. The BM25 model extends this with term frequency saturation and document length normalization. Language models for information retrieval estimate the probability of generating the query from a document language model using Dirichlet or Jelinek-Mercer smoothing techniques.'
  },
  {
    id: 'D08',
    title: 'Text Preprocessing and Normalization',
    text: 'Text preprocessing is a critical step in building information retrieval systems. It involves tokenization to split text into words, case normalization to lowercase all characters, stop word removal to eliminate frequent uninformative words, and stemming or lemmatization to reduce words to their root forms. Porter stemming and Snowball stemmers are commonly used. Proper preprocessing significantly improves retrieval effectiveness and reduces index size.'
  },
  {
    id: 'D09',
    title: 'Vector Space Model for Retrieval',
    text: 'The vector space model represents documents and queries as vectors in a high dimensional term space. Each dimension corresponds to a term in the vocabulary. Document relevance is computed using cosine similarity between the document and query vectors. TF-IDF weighting is commonly applied to term vectors. The ltc normalization scheme applies log term frequency, IDF weighting, and cosine normalization. Vector space models are intuitive but ignore term dependencies.'
  },
  {
    id: 'D10',
    title: 'Web Search Engine Architecture',
    text: 'Modern web search engines consist of crawlers, indexers, and query processors. Web crawlers systematically browse the internet to collect documents. Indexers build inverted indexes from the crawled pages. Query processors use ranking algorithms such as BM25 and PageRank to return relevant results. Caching, load balancing, and distributed computing are essential for handling billions of queries per day efficiently at large scale.'
  },
  {
    id: 'D11',
    title: 'Relevance Feedback Mechanisms',
    text: 'Relevance feedback is a technique in information retrieval where the user marks retrieved documents as relevant or non-relevant. The system then modifies the query to retrieve more similar documents. Rocchios algorithm is a classic relevance feedback method that adjusts the query vector towards relevant documents and away from non-relevant ones. Pseudo-relevance feedback assumes the top-k retrieved documents are relevant without explicit user feedback.'
  },
  {
    id: 'D12',
    title: 'Language Models in Information Retrieval',
    text: 'Language modeling approaches to information retrieval estimate the probability of a query being generated by a document language model. Query likelihood ranking orders documents by the probability of the query under each document model. Smoothing is essential to handle zero probability for unseen query terms. Dirichlet smoothing and Jelinek-Mercer smoothing are the most effective methods. Language models provide a principled probabilistic framework for ranked retrieval.'
  },
  {
    id: 'D13',
    title: 'Neural Information Retrieval',
    text: 'Neural information retrieval uses deep learning models to learn representations of queries and documents. Dense retrieval models such as BERT-based bi-encoders encode queries and documents into dense vector spaces. Approximate nearest neighbor search retrieves candidates efficiently. Cross-encoder re-rankers apply full attention between query and document for precise relevance scoring. ColBERT uses late interaction between token-level representations for efficient retrieval.'
  },
  {
    id: 'D14',
    title: 'Indexing Strategies and Compression',
    text: 'Efficient indexing is fundamental to scalable information retrieval. Posting lists store document identifiers and term frequencies for each vocabulary term. Compression techniques such as variable byte encoding and PForDelta reduce storage and improve cache performance. SPIMI and MapReduce-based indexing algorithms enable distributed index construction over large collections. Block-based indexes support phrase queries and proximity search effectively.'
  },
  {
    id: 'D15',
    title: 'Diversity and Novelty in Search Results',
    text: 'Search result diversification aims to cover multiple subtopics of an ambiguous query to satisfy different user intents. Maximal Marginal Relevance selects documents that are relevant to the query but dissimilar from already selected documents. Intent-aware diversity metrics such as alpha-nDCG and ERR-IA measure how well a ranked list covers query aspects. Novelty detection identifies documents that contain new information not present in previously seen documents.'
  }
];

// ── Preset Queries with Ground-Truth Relevance Judgements (qrels) ───────────
export const PRESET_QUERIES = {
  'BM25 parameter tuning and document scoring': {
    text: 'BM25 parameter tuning document scoring',
    relevant: ['D03', 'D07', 'D02', 'D09']
  },
  'Inverted index construction and compression': {
    text: 'inverted index construction compression',
    relevant: ['D04', 'D14', 'D10']
  },
  'Text preprocessing stemming tokenization': {
    text: 'text preprocessing stemming tokenization',
    relevant: ['D08', 'D01', 'D02']
  },
  'Precision recall evaluation metrics NDCG': {
    text: 'precision recall evaluation metrics NDCG',
    relevant: ['D06', 'D05', 'D11']
  },
  'Neural retrieval BERT dense vectors': {
    text: 'neural retrieval BERT dense vectors',
    relevant: ['D13', 'D12', 'D09']
  },
  'Language model smoothing Dirichlet': {
    text: 'language model smoothing Dirichlet',
    relevant: ['D12', 'D07', 'D13']
  },
  'Web search engine crawler ranking': {
    text: 'web search engine crawler ranking',
    relevant: ['D10', 'D04', 'D05']
  }
};

// ── Purpose-Built Benchmark Scenarios ───────────────────────────────────────
export const READY_MADE_SCENARIOS = {
  'Term-saturation': {
    label: 'Term Saturation — Keyword Stuffing vs. Focused Writing',
    note: 'Doc2 repeats the word "learning" 9 times while Doc1 covers all query terms once. Raise k1 to let repetition count for more, lower it to watch TF saturation flatten the spammed document.',
    query: 'machine learning artificial intelligence',
    relevant: ['Doc1'],
    docs: [
      {
        id: 'Doc1',
        title: 'Machine Learning & AI Overview',
        text: 'Machine learning and artificial intelligence drive modern computer science innovations. Algorithms analyze datasets to discover patterns and build predictive intelligence systems.'
      },
      {
        id: 'Doc2',
        title: 'Keyword-Stuffed Learning Article',
        text: 'Learning learning learning learning learning learning learning learning learning. Our platform optimizes learning techniques for student learning.'
      },
      {
        id: 'Doc3',
        title: 'General Computing Article',
        text: 'Hardware architectures like GPUs and CPUs execute computational operations. High performance clusters process mathematical simulations for astrophysics.'
      }
    ]
  },
  'Length-normalization': {
    label: 'Length Normalization — Short Exact Match vs. Padded Document',
    note: 'Both documents contain "quantum computing", but Doc2 pads it with unrelated vocabulary. Sweep b from 0 to 1 to see the long document lose ground as length normalisation kicks in.',
    query: 'quantum computing algorithms',
    relevant: ['Doc1'],
    docs: [
      {
        id: 'Doc1',
        title: 'Concise Quantum Computing Guide',
        text: 'Quantum computing algorithms leverage qubits and superposition to solve combinatorial optimization problems exponentially faster than classical computers.'
      },
      {
        id: 'Doc2',
        title: 'Padded Multidisciplinary Survey',
        text: 'Quantum computing algorithms are interesting. However, classical software engineering requires agile development, microservices architectures, container orchestration with Kubernetes, continuous integration pipelines, automated unit testing, database indexing, CSS layouts, user interface typography, and cloud security compliance.'
      },
      {
        id: 'Doc3',
        title: 'Standard Linear Algebra',
        text: 'Matrix multiplications, eigenvectors, and eigenvalues form the computational backbone for computer graphics and physics simulations.'
      }
    ]
  },
  'Preprocessing-impact': {
    label: 'Preprocessing Impact — Stemming & Stop-word Removal',
    note: 'The query uses "retrieving searches" while Doc2 uses "retrieval search". Toggle Apply Stemming to see whether Doc2 can be matched at all.',
    query: 'retrieving searches',
    relevant: ['Doc2'],
    docs: [
      {
        id: 'Doc1',
        title: 'Database Storage Systems',
        text: 'Relational databases store tabular records on solid state drives. ACID transactions maintain consistency across distributed write replicas.'
      },
      {
        id: 'Doc2',
        title: 'Search Engines & Information Retrieval',
        text: 'Information retrieval systems execute fast search operations over large text inverted indices. The search process ranks documents by relevance.'
      }
    ]
  },
  'Benchmark-evaluation': {
    label: 'Benchmark Evaluation — Gold Standard Judged Collection',
    note: 'A four-document judged collection: D03 and D07 are the gold-standard answers for this query. P@K, R@K, F1, MRR, AP and nDCG are all computed against ground truth.',
    query: 'probabilistic models BM25 ranking',
    relevant: ['D03', 'D07'],
    docs: [
      {
        id: 'D03',
        title: 'Okapi BM25 Probabilistic Model',
        text: 'BM25 is a bag-of-words retrieval function that ranks a set of documents based on the query terms appearing in each document. The k1 parameter controls term frequency saturation, while b controls document length normalization.'
      },
      {
        id: 'D07',
        title: 'Probabilistic Retrieval Models',
        text: 'Probabilistic retrieval models estimate the probability that a document is relevant given a query. The Binary Independence Model assumes term independence. The BM25 model extends this with term frequency saturation and document length normalization.'
      },
      {
        id: 'D02',
        title: 'TF-IDF Weighting Scheme',
        text: 'TF-IDF stands for term frequency–inverse document frequency. It is a numerical statistic that reflects how important a word is to a document in a collection or corpus.'
      },
      {
        id: 'D04',
        title: 'Inverted Index Construction',
        text: 'An inverted index is a data structure used to create full-text searches. It maps words or terms to their locations in a set of documents.'
      }
    ]
  }
};

// ── Stop Words ──────────────────────────────────────────────────────────────
export const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'it', 'in', 'of', 'to', 'for', 'and', 'or',
  'not', 'on', 'at', 'by', 'as', 'be', 'was', 'are', 'with', 'that',
  'this', 'from', 'its', 'has', 'have', 'had', 'how', 'which', 'where',
  'their', 'into', 'such', 'also', 'can', 'more', 'than', 'each', 'been',
  'they', 'these', 'those', 'both', 'all', 'but', 'over', 'we', 'our',
  'between', 'about', 'after', 'other', 'within', 'while', 'using',
  'during', 'without', 'under', 'above', 'very', 'then', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must'
]);

// ── Suffix Stemmer (Deterministic, matches app.py) ───────────────────────────
const SUFFIXES = [
  'ization', 'isation', 'ational', 'tional', 'alism', 'aliti',
  'fulness', 'ousness', 'iveness', 'ingness', 'nesses', 'ments',
  'ations', 'ities', 'izers', 'ising', 'izing', 'ators',
  'ation', 'ating', 'iness', 'eness', 'alize',
  'ively', 'fully', 'ously', 'ingly',
  'ness', 'ment', 'tion', 'sion', 'ists', 'isms', 'ings',
  'ated', 'ates', 'ized', 'ises', 'iers', 'ably',
  'ing', 'ers', 'est', 'ied', 'ies', 'ize', 'ise', 'ful',
  'ous', 'ive', 'ble', 'ity', 'ion', 'ist', 'ism',
  'al', 'ly', 'ed', 'er', 'es', 'en'
];

export function simpleStem(word) {
  const w = word.toLowerCase();
  if (w.length <= 4) return w;
  for (const sfx of SUFFIXES) {
    if (w.endsWith(sfx) && w.length - sfx.length >= 3) {
      return w.slice(0, w.length - sfx.length);
    }
  }
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 4) {
    return w.slice(0, -1);
  }
  return w;
}

export function preprocess(text, removeStopwords = true, applyStemming = true) {
  if (!text) return [];
  const matches = text.toLowerCase().match(/[a-zA-Z]+/g) || [];
  let tokens = matches;
  if (removeStopwords) {
    tokens = tokens.filter(t => !STOP_WORDS.has(t));
  }
  if (applyStemming) {
    tokens = tokens.map(t => simpleStem(t));
  }
  return tokens;
}

// ── BM25 Engine ─────────────────────────────────────────────────────────────
export class BM25Engine {
  constructor(corpus, k1 = 1.5, b = 0.75, removeStopwords = true, applyStemming = true) {
    this.corpus = corpus;
    this.k1 = k1;
    this.b = b;
    this.removeStopwords = removeStopwords;
    this.applyStemming = applyStemming;

    this.tokenised = corpus.map(d => preprocess(d.text, removeStopwords, applyStemming));
    this.N = corpus.length;
    this.docLengths = this.tokenised.map(t => t.length);
    const totalTokens = this.docLengths.reduce((a, c) => a + c, 0);
    this.avgdl = this.N > 0 ? totalTokens / this.N : 1.0;

    // Document Frequency
    this.df = {};
    for (const tokens of this.tokenised) {
      const unique = new Set(tokens);
      for (const term of unique) {
        this.df[term] = (this.df[term] || 0) + 1;
      }
    }

    // Term Frequencies per document
    this.tfPerDoc = [];
    for (const tokens of this.tokenised) {
      const tf = {};
      for (const t of tokens) {
        tf[t] = (tf[t] || 0) + 1;
      }
      this.tfPerDoc.push(tf);
    }
  }

  // Robertson / Lucene Smoothed IDF
  idf(term) {
    const nQi = this.df[term] || 0;
    return Math.log(1 + (this.N - nQi + 0.5) / (nQi + 0.5));
  }

  bm25Score(queryTokens, docIdx) {
    let score = 0.0;
    const dl = this.docLengths[docIdx];
    const tfDoc = this.tfPerDoc[docIdx];
    const uniqueQuery = new Set(queryTokens);

    for (const term of uniqueQuery) {
      const f = tfDoc[term] || 0;
      const idfVal = this.idf(term);
      const num = f * (this.k1 + 1);
      const lengthPenalty = 1 - this.b + (this.b * dl) / (this.avgdl || 1.0);
      const den = f + this.k1 * lengthPenalty;
      score += idfVal * (den > 0 ? num / den : 0);
    }
    return score;
  }

  rank(queryText) {
    const queryTokens = preprocess(queryText, this.removeStopwords, this.applyStemming);
    const scores = this.corpus.map((_, i) => ({
      docIdx: i,
      score: this.bm25Score(queryTokens, i)
    }));
    scores.sort((a, b) => b.score - a.score);
    return { ranked: scores, queryTokens };
  }

  termDiagnostics(queryTokens, docIdx) {
    const dl = this.docLengths[docIdx];
    const tfDoc = this.tfPerDoc[docIdx];
    const lengthPenalty = 1 - this.b + (this.b * dl) / (this.avgdl || 1.0);
    const uniqueQuery = new Set(queryTokens);
    const rows = [];

    for (const term of uniqueQuery) {
      const f = tfDoc[term] || 0;
      const idfVal = this.idf(term);
      const num = f * (this.k1 + 1);
      const den = f + this.k1 * lengthPenalty;
      const tfWeight = den > 0 ? num / den : 0.0;
      const subScore = idfVal * tfWeight;
      rows.push({
        term,
        f,
        idf: idfVal,
        lengthPenalty,
        tfWeight,
        subScore
      });
    }
    rows.sort((a, b) => b.subScore - a.subScore);
    return rows;
  }
}

// ── TF-IDF Engine (ltc weighting + Cosine similarity) ───────────────────────
export class TFIDFEngine {
  constructor(bm25) {
    this.bm25 = bm25;
    this.vocab = Object.keys(bm25.df);
    this.termIdx = {};
    this.vocab.forEach((t, i) => {
      this.termIdx[t] = i;
    });

    const V = this.vocab.length;
    const N = bm25.N;

    this.docVectors = [];
    for (let docIdx = 0; docIdx < N; docIdx++) {
      const vec = new Float64Array(V);
      const tfDoc = bm25.tfPerDoc[docIdx];
      for (const [term, f] of Object.entries(tfDoc)) {
        if (this.termIdx[term] !== undefined) {
          const idf = bm25.idf(term);
          vec[this.termIdx[term]] = (1 + Math.log(f)) * idf;
        }
      }
      let norm = 0;
      for (let i = 0; i < V; i++) norm += vec[i] * vec[i];
      norm = Math.sqrt(norm);
      if (norm > 0) {
        for (let i = 0; i < V; i++) vec[i] /= norm;
      }
      this.docVectors.push(vec);
    }
  }

  rank(queryTokens) {
    const V = this.vocab.length;
    const qVec = new Float64Array(V);
    const counts = {};
    for (const t of queryTokens) {
      counts[t] = (counts[t] || 0) + 1;
    }

    for (const [term, count] of Object.entries(counts)) {
      if (this.termIdx[term] !== undefined) {
        const idf = this.bm25.idf(term);
        qVec[this.termIdx[term]] = (1 + Math.log(count)) * idf;
      }
    }

    let norm = 0;
    for (let i = 0; i < V; i++) norm += qVec[i] * qVec[i];
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < V; i++) qVec[i] /= norm;
    }

    const scores = this.docVectors.map((docVec, i) => {
      let dot = 0;
      for (let v = 0; v < V; v++) dot += docVec[v] * qVec[v];
      return { docIdx: i, score: norm > 0 ? dot : 0.0 };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores;
  }
}

// ── Evaluation Metrics ──────────────────────────────────────────────────────
export function precisionAtK(rankedIds, relevantSet, k) {
  if (!k || k <= 0) return 0;
  const topK = rankedIds.slice(0, k);
  const count = topK.filter(id => relevantSet.has(id)).length;
  return count / k;
}

export function recallAtK(rankedIds, relevantSet, k) {
  if (!relevantSet || relevantSet.size === 0) return 0;
  const topK = rankedIds.slice(0, k);
  const count = topK.filter(id => relevantSet.has(id)).length;
  return count / relevantSet.size;
}

export function f1AtK(p, r) {
  return p + r > 0 ? (2 * p * r) / (p + r) : 0;
}

export function mrr(rankedIds, relevantSet) {
  for (let i = 0; i < rankedIds.length; i++) {
    if (relevantSet.has(rankedIds[i])) {
      return 1.0 / (i + 1);
    }
  }
  return 0.0;
}

export function averagePrecision(rankedIds, relevantSet) {
  if (!relevantSet || relevantSet.size === 0) return 0;
  let hits = 0;
  let sumP = 0;
  for (let i = 0; i < rankedIds.length; i++) {
    if (relevantSet.has(rankedIds[i])) {
      hits++;
      sumP += hits / (i + 1);
    }
  }
  return sumP / relevantSet.size;
}

export function dcgAtK(rankedIds, relevantSet, k) {
  let val = 0.0;
  const topK = rankedIds.slice(0, k);
  for (let i = 0; i < topK.length; i++) {
    if (relevantSet.has(topK[i])) {
      val += 1.0 / Math.log2(i + 2);
    }
  }
  return val;
}

export function ndcgAtK(rankedIds, relevantSet, k) {
  if (!relevantSet || relevantSet.size === 0) return 0;
  const ideal = rankedIds.map(d => (relevantSet.has(d) ? 1 : 0)).sort((a, b) => b - a);
  let idealDcg = 0.0;
  const limit = Math.min(k, ideal.length);
  for (let i = 0; i < limit; i++) {
    idealDcg += ideal[i] / Math.log2(i + 2);
  }
  return idealDcg > 0 ? dcgAtK(rankedIds, relevantSet, k) / idealDcg : 0.0;
}

export function kendallTau(listA, listB) {
  const setB = new Set(listB);
  const common = Array.from(new Set(listA.filter(x => setB.has(x))));
  const n = common.length;
  if (n < 2) return 0.0;

  const rankB = {};
  listB.forEach((d, i) => { rankB[d] = i; });

  let concordant = 0;
  let discordant = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const diffA = i - j;
      const diffB = (rankB[common[i]] || 0) - (rankB[common[j]] || 0);
      if (diffA * diffB > 0) concordant++;
      else if (diffA * diffB < 0) discordant++;
    }
  }
  const denom = (n * (n - 1)) / 2;
  return denom > 0 ? (concordant - discordant) / denom : 0.0;
}

export function computeAllMetrics(bm25RankedIds, tfidfRankedIds, relevantSet, k = 5) {
  const p = precisionAtK(bm25RankedIds, relevantSet, k);
  const r = recallAtK(bm25RankedIds, relevantSet, k);
  return {
    [`P@${k}`]: Number(p.toFixed(4)),
    [`R@${k}`]: Number(r.toFixed(4)),
    [`F1@${k}`]: Number(f1AtK(p, r).toFixed(4)),
    MRR: Number(mrr(bm25RankedIds, relevantSet).toFixed(4)),
    AP: Number(averagePrecision(bm25RankedIds, relevantSet).toFixed(4)),
    [`nDCG@${k}`]: Number(ndcgAtK(bm25RankedIds, relevantSet, k).toFixed(4)),
    'Kendall τ': Number(kendallTau(bm25RankedIds, tfidfRankedIds).toFixed(4))
  };
}

// ── Theory Key Terms & Mathematical Symbols ─────────────────────────────────
export const THEORY_KEY_TERMS = [
  {
    term: 'Okapi BM25',
    category: 'Model',
    definition: 'A state-of-the-art non-linear probabilistic bag-of-words ranking function. It extends the Binary Independence Model (BIM) with term frequency saturation and document length normalization.'
  },
  {
    term: 'Term Saturation (k₁)',
    category: 'Hyperparameter',
    definition: 'Controls the rate at which term frequency impact asymptotes. As f(q,D) → ∞, the term frequency factor approaches (k₁ + 1). Typical values range from 1.2 to 2.0.'
  },
  {
    term: 'Length Normalization (b)',
    category: 'Hyperparameter',
    definition: 'Penalizes documents that are longer than the collection average (avgdl). b=1 scales scores in inverse proportion to length; b=0 completely disables length penalization.'
  },
  {
    term: 'Robertson / Lucene Smoothed IDF',
    category: 'Weighting',
    definition: 'Calculates term rarity via ln(1 + (N - n(q) + 0.5) / (n(q) + 0.5)), preventing negative values for ubiquitous terms and smoothing extreme document frequency jumps.'
  },
  {
    term: 'Average Document Length (avgdl)',
    category: 'Corpus Statistic',
    definition: 'The mean number of preprocessed tokens across all documents in the corpus. Acts as the baseline pivot for length normalization.'
  },
  {
    term: 'Binary Independence Model (BIM)',
    category: 'Precursor',
    definition: 'Classical probabilistic retrieval model based on the 2×2 contingency table of relevance and binary term occurrence. BM25 is derived as an extension to BIM.'
  },
  {
    term: 'Kendall\'s Tau (τ)',
    category: 'Evaluation',
    definition: 'A non-parametric rank correlation coefficient that measures relative ordering concordance between two ranked document lists, bounded between -1 and +1.'
  },
  {
    term: 'nDCG@K',
    category: 'Evaluation',
    definition: 'Normalized Discounted Cumulative Gain at rank K. Measures retrieval ranking quality by discounting relevant documents that appear lower in the top-K list.'
  }
];

// ── Quiz Question Bank (15 Curated Pedagogical Questions) ───────────────────
export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'In the Okapi BM25 formula, what happens to the term frequency contribution as f(q, D) → ∞ (assuming k₁ > 0)?',
    options: [
      'It grows linearly without bound',
      'It asymptotes and saturates approaching (k₁ + 1)',
      'It diminishes exponentially to zero',
      'It oscillates around the average document length'
    ],
    answerIndex: 1,
    explanation: 'Unlike raw TF which grows without limit, BM25\'s sub-linear term saturation factor [f · (k₁ + 1)] / [f + k₁ · norm] approaches an asymptote of (k₁ + 1). This ensures keyword stuffing cannot arbitrarily game the ranking score.'
  },
  {
    id: 2,
    question: 'What is the empirical effect of setting the length normalization parameter b = 0 in BM25?',
    options: [
      'Disables term frequency saturation completely',
      'Disables document length normalization, treating all documents as having equal length',
      'Forces IDF values to zero for all query terms',
      'Transforms BM25 into pure Boolean retrieval'
    ],
    answerIndex: 1,
    explanation: 'When b = 0, the length penalty denominator component [1 - b + b · (|D| / avgdl)] simplifies to [1 - 0 + 0] = 1.0 for every document. Hence, document length is completely ignored.'
  },
  {
    id: 3,
    question: 'Setting k₁ = 0 in BM25 reduces the scoring function to:',
    options: [
      'TF-IDF with cosine normalization',
      'Binary term presence weighted strictly by Robertson IDF',
      'Dense neural embedding dot product',
      'BM25F field-weighted retrieval'
    ],
    answerIndex: 1,
    explanation: 'When k₁ = 0, the term frequency factor simplifies to f / f = 1 for any term present (f > 0). Consequently, BM25 scores only binary presence times IDF, reducing to the Binary Independence Model (BIM).'
  },
  {
    id: 4,
    question: 'Which of the following is a primary weakness of standard TF-IDF that BM25 explicitly overcomes?',
    options: [
      'TF-IDF cannot handle English vocabulary',
      'TF-IDF allows spammed high-frequency terms to dominate scores linearly or logarithmically without upper-bound saturation',
      'TF-IDF cannot be implemented with an inverted index',
      'TF-IDF requires GPU neural network accelerators'
    ],
    answerIndex: 1,
    explanation: 'TF-IDF schemes (such as raw tf or log tf) lack an asymptotic bound. A spammed document with 50 repetitions will heavily outscore a focused document with 2 occurrences. BM25 clamps this with the k₁ saturation curve.'
  },
  {
    id: 5,
    question: 'The Robertson / Lucene smoothed IDF formula used in modern BM25 implementations is:',
    options: [
      'IDF(q) = log(N / n(q))',
      'IDF(q) = ln(1 + (N - n(q) + 0.5) / (n(q) + 0.5))',
      'IDF(q) = 1 / (1 + exp(-n(q)))',
      'IDF(q) = sqrt(N - n(q))'
    ],
    answerIndex: 1,
    explanation: 'The +1 inside the logarithm guarantees non-negative IDF values even when a term appears in more than half the corpus (n(q) > N / 2), preventing negative weights in Lucene and Elasticsearch.'
  },
  {
    id: 6,
    question: 'If a document has a length |D| exactly equal to the corpus average (avgdl), what does the length penalty factor become?',
    options: [
      '0.0',
      '1.0 regardless of the value of b',
      'Exactly equal to b',
      'k₁ / (k₁ + 1)'
    ],
    answerIndex: 1,
    explanation: 'The length factor is [1 - b + b · (|D| / avgdl)]. When |D| = avgdl, this becomes 1 - b + b(1) = 1.0, regardless of what b is configured to.'
  },
  {
    id: 7,
    question: 'What is the standard recommended default range for hyperparameter k₁ in web search and general benchmark IR?',
    options: [
      'k₁ ∈ [0.0, 0.1]',
      'k₁ ∈ [1.2, 2.0]',
      'k₁ ∈ [10.0, 25.0]',
      'k₁ ∈ [-1.0, 0.0]'
    ],
    answerIndex: 1,
    explanation: 'Extensive empirical tuning across TREC, MS MARCO, and BEIR benchmarks shows that k₁ ∈ [1.2, 2.0] provides optimal term frequency saturation behavior.'
  },
  {
    id: 8,
    question: 'What is the standard recommended default value for hyperparameter b in general text collections?',
    options: [
      'b = 0.0',
      'b = 0.75',
      'b = 1.50',
      'b = 10.0'
    ],
    answerIndex: 1,
    explanation: 'b = 0.75 is the industry standard default established by Robertson et al. and adopted by Elasticsearch, OpenSearch, and Lucene.'
  },
  {
    id: 9,
    question: 'In an evaluation experiment, if a retrieval system returns 5 documents where ranks 1, 3, and 5 are relevant, what is Precision@5?',
    options: [
      '0.20',
      '0.60',
      '0.50',
      '1.00'
    ],
    answerIndex: 1,
    explanation: 'Precision@K = (number of relevant documents in top K) / K = 3 / 5 = 0.60.'
  },
  {
    id: 10,
    question: 'For the same run (relevant documents at ranks 1, 3, 5), what is the Reciprocal Rank (RR) for this query?',
    options: [
      '1.00',
      '0.33',
      '0.20',
      '0.60'
    ],
    answerIndex: 0,
    explanation: 'Reciprocal Rank is 1 / (rank of first relevant document). Since rank 1 is relevant, RR = 1 / 1 = 1.00.'
  },
  {
    id: 11,
    question: 'How does Normalized Discounted Cumulative Gain (nDCG@K) penalize errors compared to Precision@K?',
    options: [
      'It discards all documents after rank 1',
      'It discounts relevant documents that appear at lower ranks logarithmically: 1 / log₂(rank + 1)',
      'It penalizes false positives exponentially',
      'It is only applicable to unranked Boolean sets'
    ],
    answerIndex: 1,
    explanation: 'nDCG accounts for position: finding a relevant document at rank 1 contributes far more to user satisfaction than finding the same document at rank 10.'
  },
  {
    id: 12,
    question: 'Kendall\'s Tau (τ) between two ranked document lists yields a value of +1.0. This indicates:',
    options: [
      'The two ranking algorithms produced identical document orderings',
      'The two ranking algorithms produced completely reversed rankings',
      'Zero correlation between rankings',
      'All retrieved documents were irrelevant'
    ],
    answerIndex: 0,
    explanation: 'Kendall\'s Tau τ = +1.0 indicates perfect rank concordance (concordant pairs = total pairs, discordant pairs = 0).'
  },
  {
    id: 13,
    question: 'Why does BM25 perform particularly well on multi-term and verbose queries compared to simple Boolean matching?',
    options: [
      'It does not require all query terms to be present; instead it accumulates graded evidence across matching terms with IDF weighting',
      'It uses deep transformer self-attention over sentence graphs',
      'It converts text into audio waveforms',
      'It assumes all words occur with identical probability'
    ],
    answerIndex: 0,
    explanation: 'BM25 performs soft matching where each matched term contributes an additive score proportional to its discriminative IDF and saturated TF.'
  },
  {
    id: 14,
    question: 'In inverted index querying, why is BM25 scoring computationally efficient for large-scale web search?',
    options: [
      'It requires full matrix inversion on every keystroke',
      'Scores can be computed by traversing only posting lists of the query terms using WAND or Block-Max WAND dynamic pruning',
      'It requires loading every document into GPU RAM',
      'It bypasses tokenization and hashing entirely'
    ],
    answerIndex: 1,
    explanation: 'BM25 only needs postings for query terms, and top-K can be retrieved in sub-linear time using dynamic pruning algorithms like WAND without evaluating all documents.'
  },
  {
    id: 15,
    question: 'What is the primary purpose of applying suffix stemming (e.g. Porter or Snowball) before BM25 indexing?',
    options: [
      'To compress file sizes into zip archives',
      'To conflate inflectional and derivational variants (e.g. "retrieval", "retrieving", "retrieves") to a common root token',
      'To translate German texts into English',
      'To encrypt private user queries'
    ],
    answerIndex: 1,
    explanation: 'Stemming maps morphologically related word forms to the same vocabulary stem, improving recall by ensuring that "retrieval" in a document matches "retrieving" in a query.'
  }
];

// ── Academic References & Bibliography ──────────────────────────────────────
export const REFERENCES = [
  {
    type: 'Foundational Textbooks',
    items: [
      {
        citation: 'Manning, C. D., Raghavan, P., & Schütze, H. (2008). Introduction to Information Retrieval. Cambridge University Press.',
        url: 'https://nlp.stanford.edu/IR-book/',
        note: 'The definitive open-access reference covering the Vector Space Model, Boolean retrieval, and probabilistic ranking.'
      },
      {
        citation: 'Büttcher, S., Clarke, C. L. A., & Cormack, G. V. (2010). Information Retrieval: Implementing and Evaluating Search Engines. MIT Press.',
        url: 'https://mitpress.mit.edu/9780262026024/information-retrieval/',
        note: 'Comprehensive guide to indexing, BM25 scoring pipelines, and evaluation metrics.'
      },
      {
        citation: 'Baeza-Yates, R., & Ribeiro-Neto, B. (2011). Modern Information Retrieval (2nd ed.). Addison-Wesley.',
        url: 'https://www.mir2ed.org/',
        note: 'Covers classical IR theory, probabilistic relevance frameworks, and large-scale web search architectures.'
      }
    ]
  },
  {
    type: 'Seminal Research Papers',
    items: [
      {
        citation: 'Robertson, S. E., & Zaragoza, H. (2009). The probabilistic relevance framework: BM25 and beyond. Foundations and Trends in Information Retrieval, 3(4), 333–389.',
        doi: 'https://doi.org/10.1561/1500000019',
        note: 'The authoritative survey of the BM25 family and its derivation from the 2-Poisson indexing model.'
      },
      {
        citation: 'Robertson, S. E., Walker, S., Jones, S., Hancock-Beaulieu, M. M., & Gatford, M. (1995). Okapi at TREC-3. NIST Special Publication 500-225.',
        doi: 'https://trec.nist.gov/pubs/trec3/papers/city.ps.gz',
        note: 'Original paper introducing the Okapi BM25 scoring formulation during the TREC-3 competition.'
      },
      {
        citation: 'Sparck Jones, K., Walker, S., & Robertson, S. E. (2000). A probabilistic model of information retrieval: Development and comparative experiments. Information Processing & Management, 36(6), 779–808.',
        doi: 'https://doi.org/10.1016/S0306-4573(00)00015-7',
        note: 'Formal mathematical formulation of the probabilistic relevance framework and term saturation.'
      },
      {
        citation: 'Järvelin, K., & Kekäläinen, J. (2002). Cumulated gain-based evaluation of IR techniques. ACM Transactions on Information Systems (TOIS), 20(4), 422–446.',
        doi: 'https://doi.org/10.1145/582415.582418',
        note: 'Original paper proposing Discounted Cumulative Gain (DCG) and Normalized DCG (nDCG).'
      },
      {
        citation: 'Voorhees, E. M., & Harman, D. K. (Eds.). (2005). TREC: Experiment and Evaluation in Information Retrieval. MIT Press.',
        doi: 'https://mitpress.mit.edu/9780262220736/',
        note: 'Essential benchmark methodology for IR systems evaluation, qrels, and pooled assessment.'
      }
    ]
  },
  {
    type: 'Industry Systems & Online Benchmarks',
    items: [
      {
        citation: 'Elasticsearch BM25 Similarity Documentation',
        url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/similarity.html',
        note: 'Production reference for Lucene and Elasticsearch default BM25 scoring.'
      },
      {
        citation: 'BEIR: Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval',
        url: 'https://github.com/beir-cellar/beir',
        note: 'Standard evaluation suite comparing BM25 vs neural dense retrievers across 18 domains.'
      },
      {
        citation: 'Stanford CS276: Information Retrieval and Web Search',
        url: 'https://web.stanford.edu/class/cs276/',
        note: 'Lecture notes and syllabus on probabilistic retrieval, BM25, and vector space models.'
      }
    ]
  }
];
