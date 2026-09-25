// ─── IR Virtual Lab — Data Layer ───────────────────────────────────────────
import { DOCUMENT_EMBEDDINGS, encodeQueryVector, dotProduct } from './offlineEmbeddings.js';

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

// ── Document pool (50 comprehensive documents across Computer Science & IR) ──
export const DOCUMENT_POOL = [
  {
    id: 'D01',
    title: 'BM25: A Probabilistic Retrieval Framework',
    snippet: 'Introduces BM25 term-frequency normalisation with parameters k₁ and b for ad-hoc lexical document retrieval tasks.',
    topics: ['bm25', 'lexical', 'keyword', 'probabilistic', 'term frequency', 'k1', 'b', 'tf-idf', 'exact match', 'information retrieval', 'ranking'],
    graphLinks: ['D06', 'D04', 'D07', 'D32'],
  },
  {
    id: 'D02',
    title: 'Dense Passage Retrieval with BERT',
    snippet: 'Bi-encoder neural network fine-tuned on MS-MARCO for open-domain question answering with dense vector embeddings.',
    topics: ['dense', 'passage', 'retrieval', 'bert', 'bi-encoder', 'embeddings', 'vectors', 'ms-marco', 'neural search', 'semantic search', 'ann'],
    graphLinks: ['D03', 'D04', 'D13', 'D07', 'D15', 'D23'],
  },
  {
    id: 'D03',
    title: 'Approximate Nearest Neighbour with FAISS',
    snippet: 'Facebook AI Similarity Search for billion-scale vector indexing; enables sub-millisecond approximate nearest-neighbour (ANN) queries.',
    topics: ['faiss', 'approximate nearest neighbour', 'ann', 'vector search', 'indexing', 'embeddings', 'similarity search', 'scale', 'dense'],
    graphLinks: ['D02', 'D04', 'D17', 'D28'],
  },
  {
    id: 'D04',
    title: 'Reciprocal Rank Fusion for Hybrid Retrieval',
    snippet: 'Combines multiple ranked lists (BM25 and dense embeddings) without hyperparameter tuning, consistently outperforming individual systems.',
    topics: ['reciprocal rank fusion', 'rrf', 'hybrid retrieval', 'ensemble', 'combining rankings', 'bm25', 'dense', 'fusion', 'rank aggregation'],
    graphLinks: ['D01', 'D02', 'D05', 'D06', 'D44'],
  },
  {
    id: 'D05',
    title: 'GraphRAG: Knowledge-Graph-Augmented Generation',
    snippet: 'Traverses entity–relation knowledge graphs to answer complex multi-hop questions beyond the reach of flat vector similarity search.',
    topics: ['graphrag', 'knowledge graph', 'multi-hop', 'relational retrieval', 'entities', 'graph traversal', 'complex queries', 'subgraph', 'rag'],
    graphLinks: ['D04', 'D06', 'D02', 'D11', 'D25', 'D30'],
  },
  {
    id: 'D06',
    title: 'Evaluation Metrics for Information Retrieval',
    snippet: 'A comprehensive survey of Precision@k, Recall@k, F1-Score, NDCG, MAP, and MRR across standard TREC evaluation benchmarks.',
    topics: ['evaluation metrics', 'precision', 'recall', 'f1', 'mrr', 'mean reciprocal rank', 'ndcg', 'map', 'trec', 'benchmark', 'ground truth', 'relevance'],
    graphLinks: ['D01', 'D04', 'D05', 'D07', 'D20', 'D21', 'D40'],
  },
  {
    id: 'D07',
    title: 'TREC 2024 Deep Learning Track Overview',
    snippet: 'Benchmarking state-of-the-art neural dense retrievers, learned sparse rankers, and multi-stage re-ranking pipelines on massive corpora.',
    topics: ['trec', 'deep learning track', 'neural retrieval', 'passage retrieval', 'benchmark', 'evaluation', 'learned sparse', 're-ranking'],
    graphLinks: ['D01', 'D02', 'D06', 'D48'],
  },
  {
    id: 'D08',
    title: 'Convolutional Neural Networks for Image Classification',
    snippet: 'Deep residual networks (ResNet) for large-scale visual recognition and feature extraction on the ImageNet benchmark dataset.',
    topics: ['cnn', 'convolutional', 'image classification', 'computer vision', 'resnet', 'imagenet', 'visual recognition'],
    graphLinks: ['D47'],
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
    graphLinks: ['D13', 'D23'],
  },
  {
    id: 'D11',
    title: 'The PageRank Algorithm and Web Graph Analysis',
    snippet: 'Link-structure analysis algorithm utilizing stationary probability distribution of random web surfers for search engine authority scoring.',
    topics: ['pagerank', 'web graph', 'link analysis', 'google search', 'random walk', 'authority scoring', 'graph centrality'],
    graphLinks: ['D05', 'D37', 'D42'],
  },
  {
    id: 'D12',
    title: 'Clustering Algorithms: K-Means and DBSCAN',
    snippet: 'Unsupervised geometric clustering techniques for partitioning multi-dimensional vector spaces into density-connected clusters.',
    topics: ['clustering', 'k-means', 'dbscan', 'unsupervised learning', 'density clustering', 'vector space'],
    graphLinks: ['D03', 'D28'],
  },
  {
    id: 'D13',
    title: 'BERT Pre-training of Deep Bidirectional Transformers',
    snippet: 'Language representation model trained using masked language modeling (MLM) and next sentence prediction (NSP) for NLP downstream tasks.',
    topics: ['bert', 'pre-training', 'masked language model', 'bidirectional', 'transformers', 'nlp', 'language representations'],
    graphLinks: ['D02', 'D10', 'D15', 'D22'],
  },
  {
    id: 'D14',
    title: 'Matrix Factorisation for Collaborative Filtering',
    snippet: 'Latent factor decomposition models for recommendation systems, decomposing sparse user–item feedback interaction matrices.',
    topics: ['matrix factorisation', 'collaborative filtering', 'recommender systems', 'latent factors', 'user item matrix'],
    graphLinks: ['D41'],
  },
  {
    id: 'D15',
    title: 'ColBERT: Efficient Contextualized Late Interaction',
    snippet: 'Late interaction token-level maxsim operator preserving fine-grained token representations with sub-millisecond retrieval latency.',
    topics: ['colbert', 'late interaction', 'maxsim', 'dense retrieval', 'token embeddings', 'neural ranking', 'efficiency'],
    graphLinks: ['D02', 'D13', 'D16'],
  },
  {
    id: 'D16',
    title: 'SPLADE: Sparse Lexical and Expansion Model',
    snippet: 'Learned sparse representations that predict term expansions via BERT masked language modeling, combining sparse inverted indexing with semantic expansion.',
    topics: ['splade', 'learned sparse', 'sparse retrieval', 'term expansion', 'inverted index', 'bert', 'neural ir'],
    graphLinks: ['D01', 'D15', 'D18', 'D27'],
  },
  {
    id: 'D17',
    title: 'HNSW: Hierarchical Navigable Small World Graphs',
    snippet: 'Graph-based approximate nearest neighbor search structure delivering logarithmic search complexity with high vector recall.',
    topics: ['hnsw', 'vector index', 'graph ann', 'similarity search', 'approximate nearest neighbor', 'dense embeddings', 'high recall'],
    graphLinks: ['D03', 'D24', 'D28'],
  },
  {
    id: 'D18',
    title: 'Inverted Index Construction and Compression',
    snippet: 'Posting list compression (Elias-Fano, PForDelta) and block-max WAND optimization for low-latency lexical search engines.',
    topics: ['inverted index', 'postings', 'compression', 'elias fano', 'block max wand', 'lexical search', 'lucene'],
    graphLinks: ['D01', 'D16', 'D38'],
  },
  {
    id: 'D19',
    title: 'Learning to Rank with LambdaMART Decision Trees',
    snippet: 'Gradient boosted decision tree approach optimizing non-smooth listwise IR ranking metrics like NDCG and MAP directly.',
    topics: ['learning to rank', 'ltr', 'lambdamart', 'gradient boosting', 'ndcg', 'ranking', 'feature engineering'],
    graphLinks: ['D06', 'D21', 'D22'],
  },
  {
    id: 'D20',
    title: 'MRR and Mean Average Precision in Web Search',
    snippet: 'Evaluating first-relevant reciprocal ranks and rank-weighted precision curves across diverse informational search queries.',
    topics: ['mrr', 'map', 'mean average precision', 'mean reciprocal rank', 'evaluation metrics', 'first relevant', 'ranking'],
    graphLinks: ['D06', 'D21', 'D40'],
  },
  {
    id: 'D21',
    title: 'NDCG: Normalized Discounted Cumulative Gain',
    snippet: 'Graded relevance evaluation metric penalizing relevant documents ranked lower with logarithmic rank decay discount functions.',
    topics: ['ndcg', 'discounted cumulative gain', 'graded relevance', 'evaluation', 'dcg', 'ranking quality', 'trec'],
    graphLinks: ['D06', 'D19', 'D20'],
  },
  {
    id: 'D22',
    title: 'Cross-Encoders vs Bi-Encoders in Neural IR',
    snippet: 'Comprehensive analysis of computational cost, cross-attention scoring, and two-stage retrieve-and-rerank system architectures.',
    topics: ['cross-encoder', 'bi-encoder', 're-ranking', 'neural retrieval', 'cross attention', 'late stage rerank', 'latency trade-offs'],
    graphLinks: ['D02', 'D13', 'D19'],
  },
  {
    id: 'D23',
    title: 'Sentence-BERT: Sentence Embeddings using Siamese Networks',
    snippet: 'Siamese and triplet network structures for producing semantically meaningful sentence embeddings optimized for cosine similarity search.',
    topics: ['sentence-bert', 'sbert', 'siamese network', 'triplet loss', 'sentence embeddings', 'cosine similarity', 'semantic search'],
    graphLinks: ['D02', 'D10', 'D31'],
  },
  {
    id: 'D24',
    title: 'Vector Databases in Production: Milvus and Pinecone',
    snippet: 'Distributed vector databases managing billion-scale embeddings with dynamic metadata filtering, sharding, and real-time indexing.',
    topics: ['vector database', 'milvus', 'pinecone', 'ann', 'metadata filtering', 'embeddings storage', 'distributed search'],
    graphLinks: ['D03', 'D17', 'D28'],
  },
  {
    id: 'D25',
    title: 'RAG Architecture with Knowledge Graph Triples',
    snippet: 'Enriching Retrieval-Augmented Generation prompts by injecting multi-hop factual subgraphs to prevent large language model hallucinations.',
    topics: ['rag', 'retrieval-augmented generation', 'knowledge graph', 'hallucination reduction', 'llm context', 'graph triples'],
    graphLinks: ['D05', 'D30', 'D45'],
  },
  {
    id: 'D26',
    title: 'Entity Linking and Disambiguation in Search',
    snippet: 'Mapping ambiguous textual surface mentions to canonical knowledge base entities using contextual coherence and semantic graphs.',
    topics: ['entity linking', 'named entity disambiguation', 'knowledge base', 'wikidata', 'semantic coherence', 'entities'],
    graphLinks: ['D05', 'D25', 'D35'],
  },
  {
    id: 'D27',
    title: 'Query Expansion using Pseudo-Relevance Feedback',
    snippet: 'Rocchio algorithm and Word2Vec term expansion expanding short input queries with top feedback passage vocabulary to resolve vocabulary mismatch.',
    topics: ['query expansion', 'pseudo-relevance feedback', 'prf', 'rocchio', 'vocabulary mismatch', 'synonyms', 'term expansion'],
    graphLinks: ['D01', 'D16', 'D46'],
  },
  {
    id: 'D28',
    title: 'Product Quantization for Memory-Efficient ANN',
    snippet: 'Decomposing vector spaces into Cartesian sub-spaces and compressing 768-dim embeddings into compact byte codes for billion-scale RAM search.',
    topics: ['product quantization', 'pq', 'vector compression', 'faiss', 'ann search', 'memory efficiency', 'clustering'],
    graphLinks: ['D03', 'D12', 'D17', 'D24'],
  },
  {
    id: 'D29',
    title: 'InfoNCE and Contrastive Loss for Bi-Encoder Retrievers',
    snippet: 'Hard negative mining and contrastive self-supervised objective functions for training robust dense bi-encoder text representations.',
    topics: ['infonce', 'contrastive learning', 'hard negatives', 'bi-encoder', 'dense training', 'embedding space'],
    graphLinks: ['D02', 'D23'],
  },
  {
    id: 'D30',
    title: 'Multi-Hop Reasoning over Heterogeneous Graphs',
    snippet: 'Neural path traversal across relational entities to synthesize multi-hop chain-of-thought evidence for complex question answering.',
    topics: ['multi-hop reasoning', 'heterogeneous graphs', 'chain of thought', 'graph traversal', 'question answering', 'kg'],
    graphLinks: ['D05', 'D25', 'D36', 'D42'],
  },
  {
    id: 'D31',
    title: 'Semantic Search with all-MiniLM-L6-v2 Embeddings',
    snippet: 'Compact 384-dimensional dense transformer model achieving high semantic retrieval accuracy with low memory footprint and fast inference.',
    topics: ['all-minilm-l6-v2', 'dense embeddings', 'cosine similarity', 'semantic search', 'sentence transformers', 'fast inference'],
    graphLinks: ['D02', 'D23', 'D24'],
  },
  {
    id: 'D32',
    title: 'BM25F: Multi-Field Extension for Web Documents',
    snippet: 'Adapting BM25 to score multiple distinct document fields (Title, Body, Anchor Text, URL) with field-specific weights and saturation.',
    topics: ['bm25f', 'multi-field ranking', 'anchor text', 'web search', 'bm25 extension', 'field weights'],
    graphLinks: ['D01', 'D18', 'D37'],
  },
  {
    id: 'D33',
    title: 'Latent Semantic Analysis and SVD Decomposition',
    snippet: 'Dimensionality reduction on term-document co-occurrence matrices using Singular Value Decomposition to capture latent semantic concepts.',
    topics: ['latent semantic analysis', 'lsa', 'svd', 'singular value decomposition', 'term document matrix', 'latent topics'],
    graphLinks: ['D14', 'D34'],
  },
  {
    id: 'D34',
    title: 'TF-IDF Weighting Scheme and Vector Space Model',
    snippet: 'Foundational Salton Vector Space Model representing text as sparse term vectors with Term Frequency–Inverse Document Frequency weighting.',
    topics: ['tf-idf', 'vector space model', 'salton smart ir', 'cosine similarity', 'term frequency', 'inverse document frequency', 'sparse representation'],
    graphLinks: ['D01', 'D18', 'D33'],
  },
  {
    id: 'D35',
    title: 'Knowledge Graph Embeddings: TransE and RotatE',
    snippet: 'Translational and complex-space geometric models for embedding entity-relation-entity triples to predict missing links in knowledge graphs.',
    topics: ['transe', 'rotate', 'knowledge graph embeddings', 'link prediction', 'knowledge graph completion', 'triples'],
    graphLinks: ['D05', 'D26', 'D36'],
  },
  {
    id: 'D36',
    title: 'Graph Neural Networks for Relational Representation',
    snippet: 'Graph Convolutional Networks (GCN) and Graph Attention Networks (GAT) aggregating neighbor node messages across multi-relational graphs.',
    topics: ['gnn', 'graph convolutional network', 'gat', 'graph attention', 'node embeddings', 'relational representation'],
    graphLinks: ['D05', 'D30', 'D35'],
  },
  {
    id: 'D37',
    title: 'Web Crawling Architecture and Deduplication',
    snippet: 'Distributed web crawlers managing URL priority queues, robots.txt politeness policies, and MinHash/SimHash near-duplicate document removal.',
    topics: ['web crawling', 'crawler architecture', 'deduplication', 'simhash', 'minhash', 'robots.txt', 'url frontier'],
    graphLinks: ['D11', 'D18', 'D32'],
  },
  {
    id: 'D38',
    title: 'Distributed Index Sharding in Lucene and Elasticsearch',
    snippet: 'Horizontal document partitioning, inverted index shard allocation, and two-phase distributed scatter-gather query execution.',
    topics: ['elasticsearch', 'lucene', 'distributed search', 'sharding', 'scatter-gather', 'inverted index', 'index partitioning'],
    graphLinks: ['D01', 'D18', 'D24'],
  },
  {
    id: 'D39',
    title: 'Conversational Search and Multi-Turn Query Modeling',
    snippet: 'Contextual query reformulation and conversational session history tracking to resolve anaphora and ellipses in multi-turn search dialogues.',
    topics: ['conversational search', 'multi-turn', 'dialogue search', 'query rewriting', 'session context', 'anaphora resolution'],
    graphLinks: ['D13', 'D25', 'D43'],
  },
  {
    id: 'D40',
    title: 'Precision@K and Recall@K Cutoff Dynamics',
    snippet: 'Empirical analysis of trade-offs between precision decay and recall saturation across varying truncation thresholds k = 1 to 50.',
    topics: ['precision@k', 'recall@k', 'cutoff depth', 'trade-offs', 'evaluation dynamics', 'top-k ranking', 'relevance curve'],
    graphLinks: ['D06', 'D20', 'D21'],
  },
  {
    id: 'D41',
    title: 'Deep Reinforcement Learning for Search Ranking',
    snippet: 'Markov Decision Process formulation of search session ranking where the agent optimizes long-term user satisfaction and engagement rewards.',
    topics: ['reinforcement learning', 'rl ranking', 'mdp', 'user engagement', 'session optimization', 'recommenders'],
    graphLinks: ['D14', 'D19'],
  },
  {
    id: 'D42',
    title: 'Graph Traversal Optimization on RDF Triples',
    snippet: 'Index-free adjacency and bidirectional breadth-first search heuristics minimizing graph exploration hops across semantic triple stores.',
    topics: ['graph traversal', 'rdf triples', 'sparql', 'bfs', 'bidirectional search', 'index-free adjacency', 'graph search'],
    graphLinks: ['D05', 'D11', 'D30'],
  },
  {
    id: 'D43',
    title: 'Zero-Shot Retrieval with Generative HyDE Models',
    snippet: 'Hypothetical Document Embeddings (HyDE) prompting generative LLMs to write synthetic target documents, embedding the hallucinated answer to search.',
    topics: ['hyde', 'zero-shot retrieval', 'generative retrieval', 'doc2query', 'synthetic passages', 'dense search', 'llm'],
    graphLinks: ['D02', 'D25', 'D39'],
  },
  {
    id: 'D44',
    title: 'RRF vs Linear Score Interpolation in Hybrid Search',
    snippet: 'Empirical comparison demonstrating why Reciprocal Rank Fusion outperforms min-max score normalization when fusing heterogeneous rankers.',
    topics: ['rrf', 'reciprocal rank fusion', 'linear interpolation', 'score normalization', 'hybrid retrieval', 'ensemble ranking'],
    graphLinks: ['D01', 'D02', 'D04'],
  },
  {
    id: 'D45',
    title: 'Passage Chunking and Context Overlap in RAG',
    snippet: 'Investigating sliding window text segmentation, chunk size boundaries (256 vs 512 tokens), and semantic chunking for RAG retrieval fidelity.',
    topics: ['chunking', 'passage chunking', 'rag', 'sliding window', 'context overlap', 'semantic boundary', 'retrieval accuracy'],
    graphLinks: ['D02', 'D25'],
  },
  {
    id: 'D46',
    title: 'Lexical Vocabulary Mismatch and Polysemy Solutions',
    snippet: 'Evaluating how semantic dense representations resolve synonymy (same concept, different words) and polysemy (same word, different concepts).',
    topics: ['vocabulary mismatch', 'synonymy', 'polysemy', 'lexical gap', 'dense representations', 'semantic search', 'ir challenges'],
    graphLinks: ['D01', 'D02', 'D27'],
  },
  {
    id: 'D47',
    title: 'Multimodal Retrieval with CLIP Vision-Language Models',
    snippet: 'Joint contrastive pre-training of dual image-text transformer encoders mapping cross-modal queries and documents into a shared metric space.',
    topics: ['clip', 'multimodal retrieval', 'cross-modal', 'vision-language', 'contrastive learning', 'joint embedding'],
    graphLinks: ['D08', 'D29'],
  },
  {
    id: 'D48',
    title: 'BEIR & MS-MARCO Benchmark Evaluation Standards',
    snippet: 'Zero-shot out-of-domain evaluation benchmark suite spanning 18 diverse IR datasets assessing model generalization and robustness.',
    topics: ['beir', 'ms-marco', 'trec-covid', 'benchmark', 'zero-shot evaluation', 'ir evaluation', 'dataset suite'],
    graphLinks: ['D06', 'D07', 'D20'],
  },
  {
    id: 'D49',
    title: 'Triadic Closure & Latent Relation Mining in Graphs',
    snippet: 'Mining open triads and transitive connectivity in entity networks to discover unobserved semantic associations and collaborator links.',
    topics: ['triadic closure', 'latent relations', 'graph mining', 'link inference', 'open triads', 'network analysis'],
    graphLinks: ['D05', 'D35', 'D42'],
  },
  {
    id: 'D50',
    title: 'End-to-End Evaluation of Modern AI Search Architectures',
    snippet: 'Unified framework benchmarking multi-stage pipelines: lexical retrieval, dense passage matching, hybrid fusion, graph traversal, and generative RAG.',
    topics: ['ai search', 'end-to-end evaluation', 'hybrid search', 'graphrag', 'bm25', 'dense vectors', 'metrics comparison', 'modern ir'],
    graphLinks: ['D01', 'D02', 'D04', 'D05', 'D06', 'D22', 'D25'],
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
    label: 'Computer Vision (Domain Shift)',
    badge: 'Vision ML',
    icon: '🖼️',
    hint: 'Demonstrates retrieval behavior when searching non-IR computer science topics.',
  },
];

export const CORPUS_SCOPE = {
  domain: 'Academic Computer Science & Information Retrieval (50 Indexed Documents)',
  categories: [
    'Information Retrieval & BM25 / BM25F',
    'Dense Passage Retrieval & Embeddings (BERT, SBERT, ColBERT)',
    'Approximate Nearest Neighbor (FAISS, HNSW, Product Quantization)',
    'Reciprocal Rank Fusion (Hybrid Search & Ensembles)',
    'GraphRAG, Multi-Hop Reasoning & Knowledge Graphs',
    'IR Evaluation (Precision, Recall, F1, MRR, MAP, NDCG, BEIR)',
    'Inverted Index, Lucene Compression & Distributed Sharding',
    'Transformers, SPLADE & Neural Re-ranking (Cross-Encoders)',
    'RAG Architectures, Query Expansion & Zero-Shot HyDE',
    'Multimodal Search, Web Crawling & Machine Learning Foundations',
  ],
};

const DOC_MAP = Object.fromEntries(DOCUMENT_POOL.map(d => [d.id, d]));

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
  const avgLen = 24;
  const k1 = 1.2;
  const b = 0.75;

  let score = 0;
  queryTokens.forEach(q => {
    const titleCount = titleTokens.filter(t => t === q || t.includes(q) || q.includes(t)).length;
    const bodyCount = snippetTokens.filter(t => t === q || t.includes(q) || q.includes(t)).length;
    const tf = (titleCount * 3.5) + bodyCount;
    if (tf > 0) {
      const idf = 1.6; // Approximated IDF over corpus
      const num = tf * (k1 + 1);
      const denom = tf + k1 * (1 - b + b * (docLen / avgLen));
      score += idf * (num / denom);
    }
  });
  return score;
}

/**
 * Computes Semantic Dense cosine-similarity score using offline all-MiniLM-L6-v2 384-D embeddings.
 */
function scoreDense(doc, cleanQuery, queryTokens) {
  const queryVec = encodeQueryVector(cleanQuery);
  const docVec = DOCUMENT_EMBEDDINGS[doc.id];

  if (queryVec && docVec) {
    const cosSim = dotProduct(queryVec, docVec);
    return Math.max(0, cosSim);
  }

  // Term overlap fallback if out of vocabulary
  if (queryTokens.length === 0) return 0;
  const docText = `${doc.title} ${doc.snippet}`.toLowerCase();
  let fallbackScore = 0;
  queryTokens.forEach(q => {
    if (docText.includes(q)) fallbackScore += 0.25;
  });
  return fallbackScore;
}

/**
 * Computes GraphRAG relational score incorporating 1-hop knowledge graph connectivity.
 */
function scoreGraphRAG(doc, denseScores, bm25Scores) {
  const selfScore = (denseScores[doc.id] * 0.6) + (Math.min(bm25Scores[doc.id] / 5.0, 1.0) * 0.4);
  let neighborScore = 0;

  if (doc.graphLinks && doc.graphLinks.length > 0) {
    doc.graphLinks.forEach(nbrId => {
      const nbrDense = denseScores[nbrId] || 0;
      const nbrBM25 = Math.min((bm25Scores[nbrId] || 0) / 5.0, 1.0);
      neighborScore += (nbrDense * 0.6 + nbrBM25 * 0.4);
    });
    neighborScore /= doc.graphLinks.length;
  }

  return selfScore * 0.65 + neighborScore * 0.35;
}

/**
 * Dynamic query evaluator: returns sorted ranked document IDs for all 4 systems,
 * plus the ground-truth relevant document set and raw scores for the given query.
 */
export function evaluateQueryAcrossSystems(queryString = '') {
  const cleanQuery = (queryString || DEFAULT_QUERY).trim();
  const qTokens = tokenize(cleanQuery);

  const bm25Raw = {};
  const denseRaw = {};

  DOCUMENT_POOL.forEach(doc => {
    bm25Raw[doc.id] = scoreBM25(doc, qTokens);
    denseRaw[doc.id] = scoreDense(doc, cleanQuery, qTokens);
  });

  const graphRaw = {};
  DOCUMENT_POOL.forEach(doc => {
    graphRaw[doc.id] = scoreGraphRAG(doc, denseRaw, bm25Raw);
  });

  // Determine ground-truth relevance for this query:
  // In IR evaluation benchmarks (like TREC, BEIR, MS-MARCO), relevance is strictly
  // determined by whether a document fulfills the query's specific topical information need.
  const relevantDocIds = new Set();
  const qLower = cleanQuery.toLowerCase();

  const INTENT_MAPPINGS = [
    {
      terms: ['metric', 'evaluat', 'precision', 'recall', 'f1', 'mrr', 'map', 'ndcg', 'beir', 'benchmark'],
      docs: ['D06', 'D20', 'D21', 'D40', 'D48', 'D50']
    },
    {
      terms: ['bm25', 'lexical', 'tf-idf', 'inverted index', 'postings', 'lucene', 'compression'],
      docs: ['D01', 'D18', 'D32', 'D34', 'D38', 'D46']
    },
    {
      terms: ['deep learning', 'neural', 'bert', 'bi-encoder', 'cross-encoder', 'colbert', 'splade', 'sbert', 'dpr'],
      docs: ['D02', 'D07', 'D13', 'D15', 'D16', 'D22', 'D23', 'D29', 'D43']
    },
    {
      terms: ['vector', 'embedding', 'faiss', 'hnsw', 'approximate', 'ann', 'quantization', 'milvus'],
      docs: ['D02', 'D03', 'D17', 'D24', 'D28', 'D31']
    },
    {
      terms: ['graph', 'knowledge graph', 'graphrag', 'multi-hop', 'entity', 'pagerank', 'sparql', 'rdf', 'gnn'],
      docs: ['D05', 'D11', 'D25', 'D26', 'D30', 'D35', 'D36', 'D42', 'D49']
    },
    {
      terms: ['hybrid', 'rrf', 'fusion', 'reciprocal rank', 'ensemble', 'combine'],
      docs: ['D04', 'D16', 'D22', 'D44', 'D48']
    },
    {
      terms: ['rag', 'retrieval-augmented', 'generation', 'chunking', 'hyde', 'hallucination', 'conversational'],
      docs: ['D05', 'D25', 'D30', 'D39', 'D43', 'D45']
    }
  ];

  INTENT_MAPPINGS.forEach(({ terms, docs }) => {
    if (terms.some(t => qLower.includes(t))) {
      docs.forEach(id => relevantDocIds.add(id));
    }
  });

  // For custom unmapped queries, use top high-confidence semantic similarity matches
  if (relevantDocIds.size === 0) {
    const maxDense = Math.max(...Object.values(denseRaw), 0.001);
    const topDenseDocs = Object.entries(denseRaw)
      .filter(([_, s]) => s >= Math.max(0.48, maxDense * 0.78))
      .map(([id]) => id);

    topDenseDocs.slice(0, 6).forEach(id => relevantDocIds.add(id));
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
    const rk = kwRankMap[doc.id] || 50;
    const rs = semRankMap[doc.id] || 50;
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
  const totalRelevant = Math.max(relevantSet.size, 1);

  let relevantRetrieved = 0;
  let firstRelevantRank = null;

  const results = ranked.map((docId, idx) => {
    const doc = DOC_MAP[docId] || { id: docId, title: 'Unknown Document', snippet: '', topics: [] };
    const isRel = relevantSet.has(docId);
    if (isRel) {
      relevantRetrieved++;
      if (firstRelevantRank === null) firstRelevantRank = idx + 1;
    }

    let rawScore = 0;
    let scoreType = 'Relevance';
    if (systemId === 'keyword') {
      rawScore = evalResult.scores.bm25[docId] || 0;
      scoreType = 'BM25 Score';
    } else if (systemId === 'semantic') {
      rawScore = evalResult.scores.dense[docId] || 0;
      scoreType = 'Dense Cosine';
    } else if (systemId === 'hybrid') {
      rawScore = evalResult.scores.rrf[docId] || 0;
      scoreType = 'RRF Score';
    } else if (systemId === 'graph') {
      rawScore = evalResult.scores.graph[docId] || 0;
      scoreType = 'Graph Score';
    }

    return {
      ...doc,
      rank: idx + 1,
      isRelevant: isRel,
      score: rawScore,
      scoreFormatted: systemId === 'hybrid' ? rawScore.toFixed(4) : rawScore.toFixed(2),
      scoreType,
    };
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
    scores: evalResult.scores,
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
    explanation: 'Cosine similarity measures angle between query and document embedding vectors in continuous vector space.',
  },
];
