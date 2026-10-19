/**
 * Analytical Questions Repository for Experiments 1 through 15
 * 
 * Each experiment features 1 comprehensive analytical question (6 marks)
 * evaluated automatically by the Gemini AI Judge.
 * 
 * Total Experiment Quiz Marks: 9 MCQs (9 marks) + 1 Analytical Question (6 marks) = 15 Marks.
 */

export const ANALYTICAL_QUESTIONS = {
  1: {
    id: 'exp1-analytical',
    expNumber: 1,
    title: 'Multimodal Tokenization for Information Retrieval',
    question: 'What challenges arise when tokenizing text, images, and other modalities together?',
    context: 'Focus on representation discrepancies (discrete 1D sequential tokens vs continuous 2D spatial patches / 3D audio-video frames), vocabulary size and cross-modal codebook alignment (e.g. VQ-VAE, ViT patch projection), computational scaling / sequence length explosion in joint self-attention, and semantic alignment across modalities in unified retrieval embeddings.',
    rubric: 'Score out of 6 points:\n- (2 pts) Explanation of representation discrepancy: discrete linguistic vocabulary vs continuous high-dimensional visual/audio patches.\n- (2 pts) Computational complexity and sequence length scaling (quadratic cost in cross-attention transformers, token count explosion).\n- (2 pts) Cross-modal semantic alignment, unified codebook mapping, and indexing challenges in multimodal vector spaces.'
  },
  2: {
    id: 'exp2-analytical',
    expNumber: 2,
    title: 'Text Preprocessing and Normalization',
    question: 'What is the final output after text preprocessing, stop-word removal, and lemmatization for the following sentence? "A quick brown fox jumps over the lazy dog"',
    context: 'Walk through each stage systematically: case folding (lowercasing), punctuation stripping/tokenization, stop-word filtering (identifying and removing non-informative function words like "a", "over", "the"), and morphological lemmatization (canonical dictionary headwords, specifically analyzing "jumps" -> "jump", nouns/adjectives "quick", "brown", "fox", "lazy", "dog").',
    rubric: 'Score out of 6 points:\n- (2 pts) Accurate identification and removal of standard stop-words ("a", "over", "the").\n- (2 pts) Proper morphological lemmatization of inflected forms (specifically "jumps" -> "jump") while keeping base forms.\n- (2 pts) Exact final output list [\'quick\', \'brown\', \'fox\', \'jump\', \'lazy\', \'dog\'] (or equivalent canonical token sequence) with clear step-by-step reasoning.'
  },
  3: {
    id: 'exp3-analytical',
    expNumber: 3,
    title: 'Construction of an Inverted Index',
    question: 'What is the effect of enabling linguistic normalization options such as stopword removal and Porter stemming on the document collection?',
    context: 'Analyze vocabulary reduction (dictionary size in memory), postings list storage and compression, impact on recall (broadening matching of morphological variants like connect, connection, connecting) versus precision (risk of over-stemming collisions), and query processing latency.',
    rubric: 'Score out of 6 points:\n- (2 pts) Analysis of vocabulary and index size reduction (fewer distinct terms, smaller lexicon, shorter postings for dropped stop-words).\n- (2 pts) Positive impact on retrieval recall by conflating inflectional and derivational variants into common stems.\n- (2 pts) Trade-offs regarding precision, risk of false-positive matches (over-stemming), loss of exact phrase fidelity, and postings traversal speed.'
  },
  4: {
    id: 'exp4-analytical',
    expNumber: 4,
    title: 'TF-IDF Based Document Retrieval',
    question: 'How does TF-IDF distinguish important terms from common words when ranking documents?',
    context: 'Deconstruct the interaction between Term Frequency (TF: how often a term occurs locally in a document) and Inverse Document Frequency (IDF = log(N / DF): how rare a term is across the global collection). Contrast how frequent generic words receive near-zero IDF while specific discriminative terms achieve high composite TF-IDF weights.',
    rubric: 'Score out of 6 points:\n- (2 pts) Mathematical breakdown and intuition of Term Frequency (TF) rewarding local topical relevance.\n- (2 pts) Mathematical breakdown and intuition of Inverse Document Frequency (IDF) penalizing ubiquitous corpus-wide words.\n- (2 pts) Explanation of how the composite product balances term specificity, topicality, and discriminative power in ranking documents.'
  },
  5: {
    id: 'exp5-analytical',
    expNumber: 5,
    title: 'BM25 Based Document Ranking',
    question: 'How do term frequency saturation and document length normalization influence BM25 scores?',
    context: 'Deconstruct parameters k1 and b in Okapi BM25: TF saturation ensures that repeated occurrences of a query term yield diminishing marginal score increases (preventing keyword stuffing / term dominance, controlled by k1), while document length normalization (controlled by b) scales term frequencies relative to average document length (avgdl), ensuring long verbose documents are not unfairly favored over concise, focused ones.',
    rubric: 'Score out of 6 points:\n- (2 pts) Explanation of TF saturation curve (k1) and why sublinear asymptotic leveling prevents keyword stuffing.\n- (2 pts) Explanation of document length normalization factor (b, dl / avgdl) and its role in neutralizing verbosity bias.\n- (2 pts) Analysis of edge cases (e.g., b=0 vs b=1, k1 -> 0 vs k1 -> inf) and comparative advantage over standard raw TF-IDF.'
  },
  6: {
    id: 'exp6-analytical',
    expNumber: 6,
    title: 'Dense Embedding-Based Semantic Search',
    question: 'How does the choice of embedding model affect semantic search accuracy?',
    context: 'Consider model architecture (e.g. bi-encoder vs cross-encoder, pre-training corpus, domain specialization like legal/biomedical), embedding dimensionality (e.g. 384 vs 768 vs 1536), context window size, multilingual support, handling of out-of-vocabulary/rare tokens, and the alignment between training objective (contrastive learning / triplet loss) and target retrieval task.',
    rubric: 'Score out of 6 points:\n- (2 pts) Impact of training architecture and loss functions (contrastive pre-training, bi-encoders vs cross-encoders).\n- (2 pts) Domain adaptation and vocabulary alignment (general domain vs domain-specific corpora like BioBERT/SciBERT).\n- (2 pts) Trade-offs between embedding dimensionality, representational capacity, cosine similarity fidelity, and indexing/retrieval latency.'
  },
  7: {
    id: 'exp7-analytical',
    expNumber: 7,
    title: 'Hybrid Keyword and Semantic Retrieval',
    question: 'If the BM25 weight is increased toward 1.0, what happens to the hybrid retrieval configuration?',
    context: 'Examine hybrid interpolation (Score = alpha * BM25 + (1 - alpha) * Dense or weighted RRF). As alpha -> 1.0, the pipeline degenerates into pure sparse lexical matching. Discuss the exact-match precision gains on IDs, acronyms, and rare tokens versus the loss of semantic generalization, synonym matching, and vulnerability to the vocabulary mismatch problem.',
    rubric: 'Score out of 6 points:\n- (2 pts) Clear identification that the system converges toward pure lexical/exact-match BM25 search.\n- (2 pts) Positive impacts: high precision on rare tokens, verbatim strings, numerical identifiers, and domain-specific acronyms.\n- (2 pts) Negative trade-offs: loss of semantic generalization, failure on paraphrasing/synonyms, and vulnerability to the vocabulary mismatch problem.'
  },
  8: {
    id: 'exp8-analytical',
    expNumber: 8,
    title: 'Identify Graph Entities',
    question: 'Identify the entities from the sentence “Sundar Pichai is the CEO of Google and studied at Stanford University in California”?',
    context: 'Perform complete Named Entity Recognition (NER) identification and entity typing: identify "Sundar Pichai" (Person / PER), "CEO" (Role / Title / JobTitle), "Google" (Organization / ORG / Company), "Stanford University" (Educational Institution / Organization / ORG), and "California" (Geopolitical Entity / Location / GPE / LOC). Discuss entity spans and their roles as graph nodes.',
    rubric: 'Score out of 6 points:\n- (2 pts) Correct identification of key Named Entities: Sundar Pichai, Google, Stanford University, and California.\n- (2 pts) Accurate entity categorization / label typing for each detected entity (Person, Organization, Location, Role/Title).\n- (2 pts) Discussion of boundaries, token span extraction, and role of entities as initial nodes for knowledge graph population.'
  },
  9: {
    id: 'exp9-analytical',
    expNumber: 9,
    title: 'Relationship Extraction from Text',
    question: 'How do entity recognition errors affect the accuracy of relationship extraction?',
    context: 'Analyze cascading error propagation in information extraction pipelines: if Named Entity Recognition (NER) fails by misclassifying entity types (type mismatch), missing entities (false negatives), or predicting incorrect token boundaries (boundary errors), downstream relation extraction either fails to trigger candidate pairs, assigns invalid relation predicates (e.g. predicting BORN_IN between two organizations), or extracts completely hallucinated/spurious triples.',
    rubric: 'Score out of 6 points:\n- (2 pts) Explanation of error cascading from NER to relation extraction in pipelined architectures.\n- (2 pts) Specific error modes: missed entities leading to missing edges (false negatives), boundary errors corrupting arguments, and type errors leading to semantically invalid predicates.\n- (2 pts) Strategies to mitigate this impact (joint entity-relation extraction, ontology-constrained decoding, graph validation rules).'
  },
  10: {
    id: 'exp10-analytical',
    expNumber: 10,
    title: 'Create and Manage a Graph Database',
    question: 'Why can graph databases be more efficient for highly connected data and multi-hop queries?',
    context: 'Deconstruct Index-Free Adjacency (IFA): in native graph databases, nodes store direct physical pointers/memory references to their adjacent nodes and relationships. Navigating a relationship is an O(1) pointer dereference (or O(k) for k hops), whose execution time depends strictly on the size of the subgraph traversed, independent of the overall database size. In contrast, relational databases (RDBMS) require multiple costly O(N log M) foreign-key indexed table JOINs that explode exponentially in computational cost and I/O as the hop count increases.',
    rubric: 'Score out of 6 points:\n- (2 pts) Explanation of Index-Free Adjacency (IFA) and pointer-chasing mechanics vs RDBMS foreign key lookups.\n- (2 pts) Multi-hop query algorithmic complexity comparison (O(k) localized traversal vs exponential JOIN table Cartesian explosion).\n- (2 pts) Real-world performance impact on query execution latency, cache locality, and scalability with deeply interconnected data.'
  },
  11: {
    id: 'exp11-analytical',
    expNumber: 11,
    title: 'Design a Knowledge Graph Schema and Import Data',
    question: 'What factors determine whether an entity should be represented as a node or a property?',
    context: 'Evaluate Labeled Property Graph (LPG) modeling criteria: represent as a Node if it possesses independent identity, connects to multiple other entities, has its own attributes/metadata, participates in relationships, or needs to be traversed/indexed independently. Represent as a Property if it is an atomic/scalar attribute (timestamp, weight, status), has no independent lifecycle outside its parent entity, and does not require incoming/outgoing relationships.',
    rubric: 'Score out of 6 points:\n- (2 pts) Clear criteria for nodes: independent identity, many-to-many relationships, traversal paths, and possessing sub-attributes.\n- (2 pts) Clear criteria for properties: atomic/scalar values, 1-to-1 dependent attributes, and non-traversable leaf metadata.\n- (2 pts) Evaluation of schema trade-offs (graph size, query expressiveness, index overhead, and normalization vs performance).'
  },
  12: {
    id: 'exp12-analytical',
    expNumber: 12,
    title: 'Query Knowledge Graphs with Pattern-Based Queries',
    question: 'How can pattern-based queries uncover hidden connections and meaningful insights within a knowledge graph?',
    context: 'Examine declarative pattern matching (e.g. Cypher MATCH clauses): structural motif detection, multi-hop indirect relationship discovery (paths of length k), cyclic relationships, common neighbor discovery, transitive inferences, and filtering across node/relationship properties simultaneously to uncover latent paths (e.g., co-authorship networks, fraud rings, supply chain vulnerabilities) that are invisible in isolated tabular data.',
    rubric: 'Score out of 6 points:\n- (2 pts) Explanation of declarative pattern matching syntax and graph motif discovery (paths, triangles, cycles).\n- (2 pts) Uncovering multi-hop indirect connections, transitive relations, and shared neighborhood patterns.\n- (2 pts) Concrete examples of insights unlocked (e.g., recommendation paths, fraud detection rings, citation/collaboration networks).'
  },
  13: {
    id: 'exp13-analytical',
    expNumber: 13,
    title: 'Advanced Cypher Queries and Graph Pattern Matching',
    question: 'How can variable-length paths be used to discover indirect relationships between entities?',
    context: 'Detail Cypher variable-length relationship syntax [:REL_TYPE*minHops..maxHops]: path expansion mechanisms (BFS/DFS traversal), transitive closure, identifying degrees of separation, discovering indirect influence or dependencies, and enforcing path constraints. Crucial considerations include cycle prevention (Cypher relationship uniqueness guarantee) and preventing combinatorial path explosion through upper-bound limits.',
    rubric: 'Score out of 6 points:\n- (2 pts) Detailed explanation of Cypher variable-length path syntax (e.g. *1..3, *..5) and path traversal semantics.\n- (2 pts) Application to indirect relationships: finding degrees of separation, transitive hierarchies, and alternate routing paths.\n- (2 pts) Discussion of computational safeguards: setting upper bounds, relationship uniqueness, avoiding Cartesian path explosion, and query optimization.'
  },
  14: {
    id: 'exp14-analytical',
    expNumber: 14,
    title: 'Integrating Information Retrieval with Knowledge Graphs',
    question: 'How does integrating information retrieval with knowledge graphs improve search accuracy and relevance?',
    context: 'Examine GraphRAG and entity-augmented retrieval architectures: combining unstructured document retrieval (lexical/semantic) with structured knowledge graphs. KGs provide entity disambiguation, multi-hop reasoning over connected context, explicit factual verification, domain-specific relationship awareness, and structured context expansion for query rewriting and LLM prompt grounding, overcoming hallucination and vocabulary mismatch.',
    rubric: 'Score out of 6 points:\n- (2 pts) Synergy between unstructured text retrieval (lexical/semantic) and structured symbolic knowledge.\n- (2 pts) Key mechanisms: entity linking, disambiguation, multi-hop graph context expansion, and query enrichment.\n- (2 pts) Concrete improvements in search accuracy, factual grounding, reduction of hallucinations, and explainability of search results.'
  },
  15: {
    id: 'exp15-analytical',
    expNumber: 15,
    title: 'Evaluation of Retrieval Systems',
    question: 'How do query complexity, dataset size, and relevance-label quality affect retrieval evaluation?',
    context: 'Deconstruct three critical evaluation axes: Query complexity (navigational/factoid queries vs compositional, multi-intent, or abstract queries require different metrics like MRR vs NDCG/MAP and stress systems differently); Dataset size (affects collection document distribution, hard negative density, index scalability, and statistical significance of metric deltas); Relevance-label quality (binary vs graded judgments, annotator agreement, pooling bias, and unjudged document penalties).',
    rubric: 'Score out of 6 points:\n- (2 pts) Impact of query complexity on retrieval evaluation and metric selection (e.g. MRR for factoid vs NDCG/MAP for multifaceted queries).\n- (2 pts) Role of corpus size and scale (hard negatives density, statistical power, and evaluation efficiency).\n- (2 pts) Impact of ground-truth label quality (binary vs graded judgments, annotator agreement, pooling bias, and unjudged document penalties).'
  }
};

/**
 * Helper to fetch analytical question for a given experiment number
 */
export function getAnalyticalQuestionForExp(expNumber) {
  const num = Number(expNumber);
  if (ANALYTICAL_QUESTIONS[num]) {
    return ANALYTICAL_QUESTIONS[num];
  }
  return {
    id: `exp${num}-analytical`,
    expNumber: num,
    title: `Experiment ${num} Analytical Evaluation`,
    question: `Provide an in-depth analytical synthesis of the key computational principles, mathematical algorithms, and empirical trade-offs demonstrated in Experiment ${num}.`,
    context: 'Focus on formal algorithmic complexity, domain constraints, and evaluation metrics.',
    rubric: 'Score out of 6 points based on conceptual accuracy, critical reasoning, and technical rigor.'
  };
}
