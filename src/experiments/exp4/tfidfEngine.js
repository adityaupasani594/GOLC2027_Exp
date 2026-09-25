/**
 * TF-IDF Retrieval Engine
 * Ported from and enhanced beyond app.py
 *
 * Implements:
 * 1. Tokenization with stop-word removal and punctuation stripping
 * 2. Vocabulary extraction from corpus
 * 3. Term Frequency (TF) schemes: Raw, Length-Normalized, Log-Normalized, Binary
 * 4. Document Frequency (DF) & Inverse Document Frequency (IDF) schemes: Standard, Smoothed, Scikit-Learn
 * 5. TF-IDF vector matrix construction for documents and queries
 * 6. Vector similarity scoring: Cosine Similarity (angle-based) & Dot Product (magnitude-sensitive)
 * 7. Information Retrieval Evaluation Metrics: Precision@k, Recall@k, F1@k, Average Precision (AP), nDCG@k, Reciprocal Rank (RR)
 * 8. 7 Real-World Application Datasets from app.py
 * 9. Comprehensive Quiz Question Bank & Educational Reference Data
 */

export const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
  "of", "in", "on", "at", "to", "for", "with", "by", "from", "as", "that", "this", "these",
  "those", "it", "its", "their", "they", "he", "she", "we", "you", "i", "your", "our",
  "his", "her", "them", "which", "who", "whom", "what", "when", "where", "why", "how",
  "can", "could", "will", "would", "shall", "should", "may", "might", "must", "do",
  "does", "did", "have", "has", "had", "not", "no", "if", "than", "then", "so", "such",
  "there", "here", "about", "into", "over", "under", "also", "using", "used", "use"
]);

export const TF_SCHEMES = [
  { id: 'raw', name: 'Raw Term Frequency', formula: 'tf(t, d) = count(t, d)', desc: 'Direct count of term occurrences in document' },
  { id: 'norm', name: 'Normalized Term Frequency', formula: 'tf(t, d) = count(t, d) / |d|', desc: 'Normalized by total document length to mitigate length bias' },
  { id: 'log', name: 'Log-Normalized Term Frequency', formula: 'tf(t, d) = 1 + log10(count(t, d))', desc: 'Sublinear scaling: diminishing returns for frequent repetitions' },
  { id: 'binary', name: 'Binary Term Frequency', formula: 'tf(t, d) = 1 if count > 0 else 0', desc: 'Presence or absence only' },
];

export const IDF_SCHEMES = [
  { id: 'standard', name: 'Standard IDF: log10(N / df)', formula: 'idf(t) = log10(N / df_t)', desc: 'Standard Sparck Jones formula; yields 0 for ubiquitous terms' },
  { id: 'smoothed', name: 'Smoothed IDF: log10(1 + N / df)', formula: 'idf(t) = log10(1 + N / df_t)', desc: 'Guarantees strictly positive weights even when df = N' },
  { id: 'sklearn', name: 'Scikit-Learn IDF: ln((1 + N)/(1 + df)) + 1', formula: 'idf(t) = ln((1 + N)/(1 + df_t)) + 1', desc: 'Smooths both numerator & denominator with unit offset' },
];

/**
 * Tokenize text into lower-cased alphanumeric words, filtering out single characters and stop-words.
 */
export function tokenize(text = '') {
  if (!text) return [];
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  return tokens.filter(t => !STOPWORDS.has(t) && t.length > 1);
}

/**
 * Build alphabetical vocabulary strictly from corpus document tokens (ignoring query tokens).
 */
export function buildVocabulary(docTokensList = []) {
  const vocabSet = new Set();
  for (const toks of docTokensList) {
    for (const t of toks) {
      vocabSet.add(t);
    }
  }
  return Array.from(vocabSet).sort();
}

/**
 * Compute Term Frequency (TF) for a token list over the vocabulary.
 */
export function computeTF(tokens = [], vocab = [], scheme = 'raw') {
  const counts = {};
  for (const t of tokens) {
    counts[t] = (counts[t] || 0) + 1;
  }
  const n = tokens.length;
  const tfVec = {};

  for (const term of vocab) {
    const c = counts[term] || 0;
    if (scheme === 'raw' || scheme === 'Raw Term Frequency') {
      tfVec[term] = c;
    } else if (scheme === 'norm' || scheme === 'Normalized Term Frequency') {
      tfVec[term] = n > 0 ? c / n : 0.0;
    } else if (scheme === 'log' || scheme === 'Log-Normalized Term Frequency') {
      tfVec[term] = c > 0 ? 1.0 + Math.log10(c) : 0.0;
    } else if (scheme === 'binary' || scheme === 'Binary Term Frequency') {
      tfVec[term] = c > 0 ? 1.0 : 0.0;
    } else {
      tfVec[term] = c;
    }
  }
  return tfVec;
}

/**
 * Compute Document Frequency (DF) for each term across all documents.
 */
export function computeDF(docTokensList = [], vocab = []) {
  const df = {};
  for (const term of vocab) {
    let count = 0;
    for (const toks of docTokensList) {
      if (toks.includes(term)) count++;
    }
    df[term] = count;
  }
  return df;
}

/**
 * Compute Inverse Document Frequency (IDF) for vocabulary.
 */
export function computeIDF(df = {}, vocab = [], nDocs = 1, scheme = 'standard') {
  const idf = {};
  const N = Math.max(1, nDocs);

  for (const term of vocab) {
    const d = df[term] || 0;
    if (d <= 0) {
      idf[term] = 0.0;
      continue;
    }

    if (scheme === 'standard' || scheme.startsWith('Standard')) {
      idf[term] = Math.log10(N / d);
    } else if (scheme === 'smoothed' || scheme.startsWith('Smoothed')) {
      idf[term] = Math.log10(1.0 + (N / d));
    } else if (scheme === 'sklearn' || scheme.startsWith('Scikit')) {
      idf[term] = Math.log((1.0 + N) / (1.0 + d)) + 1.0;
    } else {
      idf[term] = Math.log10(N / d);
    }
  }
  return idf;
}

/**
 * Multiply TF by IDF element-wise to produce TF-IDF vector.
 */
export function tfidfVector(tfVec = {}, idfVec = {}, vocab = []) {
  const vec = {};
  for (const t of vocab) {
    vec[t] = (tfVec[t] || 0) * (idfVec[t] || 0);
  }
  return vec;
}

/**
 * Cosine similarity between two vector objects over vocabulary.
 */
export function cosineSimilarity(v1 = {}, v2 = {}, vocab = []) {
  let dot = 0.0;
  let n1 = 0.0;
  let n2 = 0.0;

  for (const t of vocab) {
    const a = v1[t] || 0.0;
    const b = v2[t] || 0.0;
    dot += a * b;
    n1 += a * a;
    n2 += b * b;
  }

  const denom = Math.sqrt(n1) * Math.sqrt(n2);
  if (denom === 0.0) return 0.0;
  return dot / denom;
}

/**
 * Dot product between two vector objects over vocabulary.
 */
export function dotProduct(v1 = {}, v2 = {}, vocab = []) {
  let dot = 0.0;
  for (const t of vocab) {
    dot += (v1[t] || 0.0) * (v2[t] || 0.0);
  }
  return dot;
}

/**
 * Information Retrieval Metrics Calculation (Precision@k, Recall@k, F1@k, AP, nDCG@k, Reciprocal Rank).
 */
export function computeEvaluationMetrics(rankedDocIndices = [], relevantDocIndices = [], k = 5) {
  const relSet = new Set(relevantDocIndices);
  const totalRel = relSet.size;

  if (totalRel === 0) {
    return {
      k,
      precisionAtK: 0,
      recallAtK: 0,
      f1AtK: 0,
      averagePrecision: 0,
      ndcgAtK: 0,
      reciprocalRank: 0,
      relevantRetrieved: 0,
      totalRelevant: 0
    };
  }

  const topK = rankedDocIndices.slice(0, k);
  let relevantInTopK = 0;
  topK.forEach(idx => {
    if (relSet.has(idx)) relevantInTopK++;
  });

  const precisionAtK = relevantInTopK / Math.max(1, k);
  const recallAtK = relevantInTopK / totalRel;
  const f1AtK = (precisionAtK + recallAtK > 0)
    ? (2 * precisionAtK * recallAtK) / (precisionAtK + recallAtK)
    : 0;

  // Average Precision (AP) across entire ranked list
  let cumRel = 0;
  let precSum = 0;
  let firstRelRank = -1;

  rankedDocIndices.forEach((docIdx, rankZero) => {
    const rank = rankZero + 1;
    if (relSet.has(docIdx)) {
      cumRel++;
      precSum += cumRel / rank;
      if (firstRelRank === -1) {
        firstRelRank = rank;
      }
    }
  });

  const averagePrecision = totalRel > 0 ? precSum / totalRel : 0;
  const reciprocalRank = firstRelRank > 0 ? 1 / firstRelRank : 0;

  // nDCG@k
  let dcg = 0;
  topK.forEach((docIdx, rankZero) => {
    const rank = rankZero + 1;
    const rel = relSet.has(docIdx) ? 1 : 0;
    dcg += rel / Math.log2(rank + 1);
  });

  // Ideal DCG@k
  let idcg = 0;
  const idealCount = Math.min(k, totalRel);
  for (let r = 1; r <= idealCount; r++) {
    idcg += 1 / Math.log2(r + 1);
  }
  const ndcgAtK = idcg > 0 ? dcg / idcg : 0;

  return {
    k,
    precisionAtK,
    recallAtK,
    f1AtK,
    averagePrecision,
    ndcgAtK,
    reciprocalRank,
    relevantRetrieved: relevantInTopK,
    totalRelevant: totalRel
  };
}

/**
 * Complete TF-IDF Retrieval Pipeline Execution
 */
export function runRetrieval(
  corpus = [],
  query = '',
  tfScheme = 'raw',
  idfScheme = 'standard',
  useCosine = true,
  relevantDocIndices = []
) {
  const docTokensList = corpus.map(d => tokenize(d));
  const vocab = buildVocabulary(docTokensList);

  const queryTokensAll = tokenize(query);
  const queryTokens = queryTokensAll.filter(t => vocab.includes(t));
  const oovTerms = Array.from(new Set(queryTokensAll.filter(t => !vocab.includes(t)))).sort();

  const nDocs = corpus.length;
  const df = computeDF(docTokensList, vocab);
  const idf = computeIDF(df, vocab, nDocs, idfScheme);

  const tfMatrix = docTokensList.map(toks => computeTF(toks, vocab, tfScheme));
  const tfidfMatrix = tfMatrix.map(tfVec => tfidfVector(tfVec, idf, vocab));

  const queryTf = computeTF(queryTokens, vocab, tfScheme);
  const queryTfidf = tfidfVector(queryTf, idf, vocab);

  const scores = [];
  const termMatches = [];

  for (let i = 0; i < nDocs; i++) {
    const docVec = tfidfMatrix[i];
    let score = 0;
    if (useCosine) {
      score = cosineSimilarity(queryTfidf, docVec, vocab);
    } else {
      score = dotProduct(queryTfidf, docVec, vocab);
    }
    scores.push(score);

    // Identify shared terms and contributions
    const matches = [];
    for (const qt of queryTokens) {
      const docTf = tfMatrix[i][qt] || 0;
      const docWeight = docVec[qt] || 0;
      const qWeight = queryTfidf[qt] || 0;
      if (docTf > 0) {
        matches.push({
          term: qt,
          docTf,
          idf: idf[qt] || 0,
          docWeight,
          qWeight,
          product: docWeight * qWeight
        });
      }
    }
    matches.sort((a, b) => b.product - a.product);
    termMatches.push(matches);
  }

  // Stable ranking sort descending by score
  const indices = Array.from({ length: nDocs }, (_, i) => i);
  indices.sort((a, b) => {
    if (Math.abs(scores[b] - scores[a]) > 1e-9) {
      return scores[b] - scores[a];
    }
    return a - b; // Maintain stable original order
  });

  const metrics = computeEvaluationMetrics(indices, relevantDocIndices, Math.min(5, nDocs));

  return {
    corpus,
    query,
    vocab,
    docTokensList,
    queryTokens,
    oovTerms,
    df,
    idf,
    tfMatrix,
    tfidfMatrix,
    queryTf,
    queryTfidf,
    scores,
    ranking: indices,
    termMatches,
    metrics,
    tfScheme,
    idfScheme,
    useCosine
  };
}

/**
 * 7 Real-World Application Datasets from app.py
 */
export const APPLICATIONS = [
  {
    id: 'web_search',
    name: 'Web and Site Search',
    icon: 'Globe',
    badge: 'Standard Search',
    docType: 'Web or Help-Center Page',
    queryIs: 'What the user types into search box',
    targetMetric: 'nDCG@k',
    why: 'Every page mentions "account", so its IDF drops to zero. Only one document contains "reset" and "password" - and that rarity drives top ranking.',
    explanation: 'Each page is a document and the visitor\'s search is the query. TF counts how often query terms appear on each page, while IDF gives more weight to specific terms such as "reset" than to common terms such as "account". Cosine similarity ranks the pages most likely to answer the search first.',
    query: 'reset my account password',
    relevantIndices: [0, 3],
    corpus: [
      'Reset your password from the account settings page by choosing Forgot password and confirming the link we email to you.',
      'Update the billing address and the payment card stored on your account from the same settings page.',
      'Our password policy asks for twelve characters, one number and one symbol on every new account.',
      'Contact the support desk if you still cannot sign in to your account after a password reset.',
      'The company was founded in 2011 and now employs four hundred people across six offices.',
    ]
  },
  {
    id: 'spam_filtering',
    name: 'Spam and Phishing Filtering',
    icon: 'ShieldAlert',
    badge: 'Cybersecurity',
    docType: 'Incoming Email or SMS',
    queryIs: 'Signature profile of known spam terms',
    targetMetric: 'Precision@k',
    why: 'Shared conversational vocabulary cancels out. What survives - "urgent", "suspended", "verify" - carries high IDF signal and flags attacks.',
    explanation: 'Each message is a document and a message is compared with a profile of known spam terms. Words shared by many messages contribute less, while distinctive terms such as "urgent", "suspended" and "verify" receive more weight. The highest-scoring messages can then be sent to a quarantine queue.',
    query: 'urgent verify your suspended account click this link',
    relevantIndices: [0, 1, 4],
    corpus: [
      'URGENT your account has been suspended, click this link now to verify your identity before it is closed permanently.',
      'Verify your bank account immediately or the pending transfer will be cancelled, use the secure link below.',
      'Team lunch moves to Friday at one o\'clock in the fourth floor kitchen, no need to reply.',
      'Your monthly invoice is attached as a PDF, no action is needed from your side.',
      'Congratulations you have won a prize, claim it urgently by clicking the link and paying the small handling fee.',
    ]
  },
  {
    id: 'recommendation',
    name: 'More-Like-This Recommendation',
    icon: 'Sparkles',
    badge: 'Recommender System',
    docType: 'Article in Knowledge Base Catalog',
    queryIs: 'The content of the article currently being read',
    targetMetric: 'Precision@k',
    why: 'Cosine normalization divides vector length out, so a concise, closely-related article still beats an unfocused long one.',
    explanation: 'The article being read becomes the query and every catalogue article is a document. TF-IDF represents each article by its important terms, reducing the influence of broad words such as "search". Cosine similarity finds articles with a similar topic even when their lengths differ.',
    query: 'knowledge graph entity linking for search',
    relevantIndices: [0, 1, 3],
    corpus: [
      'Entity linking maps a mention in text to the matching node in a knowledge graph before the search runs.',
      'A knowledge graph stores entities as nodes and the relationships between them as labelled edges.',
      'Convolutional networks classify images by learning filters over neighbourhoods of pixels.',
      'Query understanding rewrites a search query using the entities recognised inside the text.',
      'The quarterly revenue report shows growth in three of the five regional markets.',
    ]
  },
  {
    id: 'plagiarism',
    name: 'Plagiarism & Duplicate Detection',
    icon: 'Copy',
    badge: 'Integrity Check',
    docType: 'An earlier academic submission or paper',
    queryIs: 'The candidate passage being audited',
    targetMetric: 'Recall@k',
    why: 'Two texts in the same field inevitably share generic jargon. Sharing rare, specialized terms is what constitutes empirical evidence of copying.',
    explanation: 'The submitted passage is the query and earlier submissions are the documents. TF-IDF highlights unusual phrases shared by both texts, while common academic words receive less weight. A high cosine score flags passages that deserve a closer human comparison.',
    query: 'documents and queries are represented as vectors over a shared vocabulary',
    relevantIndices: [0, 4],
    corpus: [
      'In the vector space model documents and queries are represented as vectors over a shared vocabulary of terms.',
      'Cosine similarity normalises for length so that long documents are not unfairly favoured.',
      'Boolean retrieval returns the set of documents matching a logical expression, without ranking them.',
      'A good sourdough loaf needs a mature starter and a long cold proof in the refrigerator.',
      'The vector representation of a document is sparse, because most vocabulary terms never occur in it.',
    ]
  },
  {
    id: 'resume_matching',
    name: 'Resume & Job Matching',
    icon: 'Briefcase',
    badge: 'HR & Talent',
    docType: 'Candidate Resume or Portfolio',
    queryIs: 'The employer job specification',
    targetMetric: 'Recall@k',
    why: 'Generic buzzwords ("team", "experience", "motivated") occur on every resume and receive near-zero IDF. Distinct skill terms ("python", "deployment", "pipelines") decide candidate rank.',
    explanation: 'The job description is the query and each resume is a document. Common words such as "experience" contribute little when they occur in many resumes, while skills such as "Python" and "deployment" distinguish candidates. The ranked list helps a recruiter review the closest matches first.',
    query: 'python machine learning pipelines and model deployment experience',
    relevantIndices: [0, 1, 4],
    corpus: [
      'Built and shipped machine learning pipelines in Python, owning model deployment behind a REST API.',
      'Five years of Python backend work on billing services, with occasional exposure to model deployment.',
      'Graphic designer specialising in brand identity, packaging and print production.',
      'Data analyst using SQL and spreadsheets to report on weekly marketing performance.',
      'Machine learning researcher publishing on graph neural networks, working mostly in Python.',
    ]
  },
  {
    id: 'ticket_routing',
    name: 'Support Ticket Routing',
    icon: 'Headphones',
    badge: 'Customer Ops',
    docType: 'Departmental Support Queue Profile',
    queryIs: 'Customer complaint ticket',
    targetMetric: 'Reciprocal Rank',
    why: 'Each document represents a departmental queue. Specific diagnostic vocabulary ("tax", "invoice", "refund") steers the ticket straight to Billing.',
    explanation: 'Each support queue is represented by a document containing the issues it handles, and an incoming ticket is the query. TF-IDF gives a strong signal to terms that identify one queue, such as "invoice" and "tax" for billing. The highest-scoring queue becomes the suggested destination.',
    query: 'wrong tax rate on my invoice',
    relevantIndices: [0],
    corpus: [
      'Billing queue: invoice and tax rate problems, refunds, failed payments and subscription changes.',
      'Authentication queue: sign-in problems, password resets, two-factor codes and locked accounts.',
      'Performance queue: slow page loads, request timeouts and report generation failures.',
      'Onboarding queue: account setup, data import and user provisioning for new customers.',
      'Hardware queue: shipping, returns and physical replacement of faulty devices.',
    ]
  },
  {
    id: 'ecommerce_search',
    name: 'E-Commerce Product Search',
    icon: 'ShoppingCart',
    badge: 'Retail IR',
    docType: 'Catalog Product Description',
    queryIs: 'Shopper search bar input',
    targetMetric: 'nDCG@k',
    why: 'Broad terms like "wireless" permeate the catalog. Specific attributes like "noise-cancelling" and "travel" elevate the ideal product to the top.',
    explanation: 'Each product description is a document and the shopper\'s words form the query. TF measures how strongly a product mentions a search term; IDF prevents generic terms such as "wireless" from dominating when they appear everywhere. Cosine similarity ranks the products that best match the full request.',
    query: 'wireless noise cancelling headphones for travel',
    relevantIndices: [0, 4],
    corpus: [
      'Over-ear wireless noise cancelling headphones with a foldable design, long battery life and a travel case.',
      'Compact wired studio headphones with balanced audio, a detachable cable and a padded headband.',
      'Wireless earbuds with a charging case, sweat resistance and a secure fit for running and workouts.',
      'Lightweight travel backpack with a laptop sleeve, water-resistant fabric and multiple organiser pockets.',
      'Premium noise cancelling headphones with an adjustable headband, microphone and touch controls.',
    ]
  }
];

export const DEFAULT_CORPUS = APPLICATIONS[0].corpus;
export const DEFAULT_QUERY = APPLICATIONS[0].query;

/**
 * 6 Pedagogical Theory Topics from app.py
 */
export const THEORY_TOPICS = [
  {
    id: 1,
    title: 'The Problem: A Set Is Not an Answer',
    icon: 'Layers',
    subtitle: 'From Boolean matching to graded continuous relevance',
    content: `Every information retrieval system starts from an awkward reality: the document collection is vastly larger than anyone is willing to read.

A traditional **Boolean search** (e.g., documents containing *tax* AND *invoice*) evaluates a binary yes/no condition. On any sizable repository, it returns an unordered set of hundreds of hits. A set of 400 documents is scarcely more actionable than the raw bookshelf.

**Ranked retrieval** replaces the binary condition with a continuous score: quantify how well each document satisfies the information need, then sort the collection in descending order. Because documents are unlabelled in advance, the score must be inferred directly from statistical term distributions. TF-IDF remains the seminal foundation and primary baseline of modern search.`
  },
  {
    id: 2,
    title: 'Why Term Weighting Is Essential',
    icon: 'Scale',
    subtitle: 'Distinguishing incidental mentions from central themes',
    content: `A simple inverted index records that a term occurs in a document, providing document IDs for fast lookup. That allows *finding*, but is fundamentally insufficient for *ranking*.

To an unweighted index, two documents containing the word *retrieval* appear identical—even when one is a 40-page survey paper on retrieval algorithms and the other merely cites the word once in a bibliographic footnote.

**Term weighting** introduces quantitative discrimination. It assigns every (term, document) pair a scalar reflecting how strongly that term characterizes that document relative to the rest of the corpus. TF-IDF harmonizes two opposing statistical forces: local concentration within this document versus global distribution across the entire collection.`
  },
  {
    id: 3,
    title: 'From Text to Terms: Tokenization & TF',
    icon: 'Binary',
    subtitle: 'Extracting tokens and sublinear term frequency scaling',
    content: `Before term weights can be calculated, raw unstructured text must be tokenized: lower-cased, stripped of non-alphanumeric punctuation, and pruned of high-frequency **stop words** (e.g., *the*, *of*, *and*) that occur everywhere and provide zero discriminative power.

The resulting set of unique corpus tokens forms the **Vocabulary** $V$. The vocabulary is derived exclusively from documents, never from the query.

**Term Frequency (TF)** formalizes the first intuition: terms repeated frequently within a document signify core subject matter. However, raw frequency count $f_{t,d}$ suffers from two pitfalls:
1. Long documents accumulate inflated raw counts simply due to verbosity. **Length Normalization** ($f_{t,d} / |d|$) corrects this.
2. Relevance exhibits diminishing returns: a document repeating *search* 20 times is not 20 times more relevant than one repeating it twice. **Log-Scaling** ($1 + \\log_{10}(f_{t,d})$) dampens excessive repetition.`
  },
  {
    id: 4,
    title: 'Inverse Document Frequency: Rarity Is Information',
    icon: 'Filter',
    subtitle: 'Sparck Jones formulation and logarithmic dampening',
    content: `Term frequency alone is easily corrupted by frequent non-discriminative words. In a corpus of cardiology clinical notes, the word *heart* appears in every single patient record; counting it provides zero diagnostic distinction.

In 1972, **Karen Sparck Jones** formulated the mathematical resolution: a term's discriminative utility decreases as its document frequency $df_t$ increases across the collection of $N$ documents.

$$idf_t = \\log_{10}\\left(\\frac{N}{df_t}\\right)$$

Consider $N = 100$:
- A term appearing in **1 document**: $\\log_{10}(100/1) = 2.0$ (maximum specificity).
- A term appearing in **10 documents**: $\\log_{10}(100/10) = 1.0$.
- A term appearing in **50 documents**: $\\log_{10}(100/50) \\approx 0.30$.
- A term appearing in **all 100 documents**: $\\log_{10}(100/100) = 0.0$ (contributes zero weight).

The logarithm is crucial: without it, a singleton term would outweigh common terms by a factor of 100. Smoothed IDF $\\log_{10}(1 + N/df)$ maintains strictly positive values.`
  },
  {
    id: 5,
    title: 'TF-IDF & The Vector Space Model (VSM)',
    icon: 'Compass',
    subtitle: 'Salton geometric representation and cosine normalization',
    content: `Multiplying both components yields the composite weight:
$$w_{t,d} = tf_{t,d} \\times idf_t$$

The weight is large if and only if **both** conditions hold: the term occurs frequently in document $d$ (high TF) and is rare across the collection (high IDF).

Gerard Salton's **Vector Space Model** maps every document and the user query into a shared $|V|$-dimensional Euclidean vector space. Similarity between query vector $\\vec{q}$ and document vector $\\vec{d}$ is measured by the **Cosine Similarity**:

$$\\cos(\\vec{q}, \\vec{d}) = \\frac{\\vec{q} \\cdot \\vec{d}}{\\lVert\\vec{q}\\rVert_2 \\,\\lVert\\vec{d}\\rVert_2} = \\frac{\\sum_{t \\in V} w_{t,q} w_{t,d}}{\\sqrt{\\sum w_{t,q}^2} \\sqrt{\\sum w_{t,d}^2}}$$

Unlike the raw dot product (which severely biases towards bloated documents), cosine similarity normalizes by vector magnitude, measuring exclusively the angle $\\theta$ between vectors.`
  },
  {
    id: 6,
    title: 'Retrieval Evaluation & Benchmarking',
    icon: 'Target',
    subtitle: 'Precision, Recall, MAP, and Rank-Sensitive nDCG',
    content: `A retrieval engine cannot be verified in isolation; its ranked output is evaluated against human ground-truth **Relevance Judgments** at cut-off rank $k$:

- **Precision@k**: $\\frac{|\\text{Relevant Documents in Top } k|}{k}$ — Penalizes returning irrelevant noise.
- **Recall@k**: $\\frac{|\\text{Relevant Documents in Top } k|}{|\\text{All Relevant Documents}|}$ — Penalizes missing relevant records.
- **F1@k**: Harmonic mean $\\frac{2 \\cdot P@k \\cdot R@k}{P@k + R@k}$.
- **Average Precision (AP)**: Averages precision measured at the exact rank of every relevant document. Its cross-query mean is **MAP**.
- **nDCG@k**: Normalized Discounted Cumulative Gain, discounting relevance logarithmically by rank: $DCG@k = \\sum_{i=1}^k \\frac{rel_i}{\\log_2(i+1)}$, normalized by Ideal DCG ($IDCG@k$).
- **Reciprocal Rank (RR)**: $\\frac{1}{\\text{rank of first relevant document}}$, ideal for single-answer question answering.`
  }
];

export const THEORY_KEY_TERMS = [
  { term: 'Term Frequency (TF)', definition: 'The local frequency of a term within an individual document; calculated as raw count, length-normalized fraction, or log-scaled.' },
  { term: 'Inverse Document Frequency (IDF)', definition: 'Global rarity metric penalizing terms appearing across numerous documents in the corpus.' },
  { term: 'TF-IDF Weight', definition: 'The scalar product of local TF and global IDF representing term specificity.' },
  { term: 'Vector Space Model (VSM)', definition: 'An algebraic model representing unstructured text documents and queries as vectors in high-dimensional term space.' },
  { term: 'Cosine Similarity', definition: 'The cosine of the angle between two multi-dimensional vectors, evaluating directional alignment while neutralizing magnitude bias.' },
  { term: 'Document Frequency (df)', definition: 'The count of documents in the collection that contain a specific term at least once.' },
  { term: 'Vocabulary (V)', definition: 'The complete set of unique terms extracted from corpus documents following tokenization and stop-word filtering.' },
  { term: 'Out-Of-Vocabulary (OOV)', definition: 'Query terms absent from the corpus vocabulary; having no document frequency, their IDF is zero.' },
  { term: 'Precision@k', definition: 'The proportion of top-k retrieved documents that are relevant to the query.' },
  { term: 'Recall@k', definition: 'The proportion of all existing relevant documents successfully retrieved within top-k.' },
  { term: 'nDCG@k', definition: 'Normalized Discounted Cumulative Gain; penalizes placing relevant documents lower in the ranking list.' }
];

export const REFERENCES = [
  {
    category: 'Where TF-IDF Came From',
    badge: 'Historical Origins',
    items: [
      {
        cite: 'H. P. Luhn, "A Statistical Approach to Mechanized Encoding and Searching of Literary Information", IBM Journal of Research and Development, 1(4), 309-317, 1957.',
        note: 'Term frequency: the foundational idea that how often a word occurs says something vital about the document.',
        doi: '10.1147/rd.14.0309'
      },
      {
        cite: 'K. Sparck Jones, "A statistical interpretation of term specificity and its application in retrieval", Journal of Documentation, 28(1), 11-21, 1972.',
        note: 'The seminal paper that introduced Inverse Document Frequency (IDF) based on statistical specificity.',
        doi: '10.1108/eb026526'
      },
      {
        cite: 'G. Salton, A. Wong and C. S. Yang, "A vector space model for automatic indexing", Communications of the ACM, 18(11), 613-620, 1975.',
        note: 'Documents and queries represented as multi-dimensional geometric vectors—the core model simulated in this lab.',
        doi: '10.1145/361219.361220'
      },
      {
        cite: 'G. Salton and C. Buckley, "Term-weighting approaches in automatic text retrieval", Information Processing & Management, 24(5), 513-523, 1988.',
        note: 'Compares the TF and IDF weighting variants (raw, sublinear, length-normalized) offered in the Simulation workbench.',
        doi: '10.1016/0306-4573(88)90021-0'
      },
      {
        cite: 'S. Robertson, "Understanding inverse document frequency: on theoretical arguments for IDF", Journal of Documentation, 60(5), 503-520, 2004.',
        note: 'Why IDF works mathematically, argued rigorously from first information-theoretic principles.',
        doi: '10.1108/00220410410560582'
      }
    ]
  },
  {
    category: 'How Retrieval Is Evaluated',
    badge: 'Benchmarking & Metrics',
    items: [
      {
        cite: 'K. Järvelin and J. Kekäläinen, "Cumulated gain-based evaluation of IR techniques", ACM Transactions on Information Systems, 20(4), 422-446, 2002.',
        note: 'The original source of Normalized Discounted Cumulative Gain (nDCG@k), reporting position-decayed ranking quality.',
        doi: '10.1145/582415.582418'
      },
      {
        cite: 'M. Sanderson, "Test Collection Based Evaluation of Information Retrieval Systems", Foundations and Trends in Information Retrieval, 4(4), 247-375, 2010.',
        note: 'Where ground-truth relevance judgments come from and how statistical significance is verified.',
        doi: '10.1561/1500000009'
      }
    ]
  },
  {
    category: 'Beyond TF-IDF',
    badge: 'Modern Successors',
    items: [
      {
        cite: 'S. Robertson and H. Zaragoza, "The Probabilistic Relevance Framework: BM25 and Beyond", Foundations and Trends in Information Retrieval, 4(1-2), 1-174, 2009.',
        note: 'BM25 and probabilistic ranking functions with non-linear saturation that superseded basic TF-IDF in modern web search.',
        doi: '10.1561/1500000019'
      }
    ]
  },
  {
    category: 'Standard Textbooks',
    badge: 'Authoritative Literature',
    items: [
      {
        cite: 'G. Salton and M. J. McGill, Introduction to Modern Information Retrieval, McGraw-Hill, 1983.',
        note: 'The classic foundational textbook on the vector space model and geometric information retrieval.'
      },
      {
        cite: 'C. D. Manning, P. Raghavan and H. Schütze, Introduction to Information Retrieval, Cambridge University Press, 2008.',
        note: 'Chapter 6 covers term weighting, vector space scoring, and cosine similarity. Open access.',
        url: 'https://nlp.stanford.edu/IR-book/'
      },
      {
        cite: 'W. B. Croft, D. Metzler and T. Strohman, Search Engines: Information Retrieval in Practice, Addison-Wesley, 2009.',
        note: 'The software engineering view: how vector space indexing and scoring are scaled to billion-document production search engines.',
        url: 'https://ciir.cs.umass.edu/downloads/SEIRiP.pdf'
      },
      {
        cite: 'R. Baeza-Yates and B. Ribeiro-Neto, Modern Information Retrieval: The Concepts and Technology behind Search (2nd ed.), Addison-Wesley, 2011.',
        note: 'Comprehensive encyclopedic reference covering retrieval models, evaluation frameworks, and web search architectures.'
      }
    ]
  },
  {
    category: 'Curriculum & Course Material',
    badge: 'Academic Virtual Lab',
    items: [
      {
        cite: 'IIT Kharagpur Virtual Labs — Information Retrieval Discipline, Ministry of Education (MoE), Government of India.',
        note: 'The national virtual laboratory curriculum and syllabus standard this experiment adheres to.',
        url: 'https://vlab.co.in/'
      }
    ]
  }
];

export const PIPELINE_STAGES = [
  { step: 1, name: 'Corpus Collection', desc: 'Raw document collection text parsed into individual records.' },
  { step: 2, name: 'Tokenization & Stopwords', desc: 'Lower-casing, regex stripping, dropping stop-words and single characters to form Vocabulary V.' },
  { step: 3, name: 'TF & IDF Computation', desc: 'Compute local term frequency tf(t, d) and global inverse document frequency idf(t).' },
  { step: 4, name: 'TF-IDF Vector Space', desc: 'Synthesize sparse vector weights w(t, d) = tf(t, d) * idf(t) for all documents and query.' },
  { step: 5, name: 'Cosine Similarity Scoring', desc: 'Evaluate angle cos(q, d) = (q . d) / (||q|| * ||d||) to rank without document length bias.' },
  { step: 6, name: 'Ranked Retrieval & Metrics', desc: 'Sort documents descending by score and compute Precision@k, Recall@k, MAP, and nDCG.' }
];

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What does the acronym TF-IDF stand for?",
    options: [
      "A) Term Frequency - Inverse Document Frequency",
      "B) Text Format - Index Data Field",
      "C) Total Frequency - Indexed Data File",
      "D) Term Filter - Inverted Document Format",
    ],
    answerIndex: 0,
    explanation: "TF-IDF combines Term Frequency (local importance within document) with Inverse Document Frequency (global rarity across corpus) into a single weight.",
  },
  {
    id: 2,
    question: "What is the primary purpose of the IDF component in TF-IDF weighting?",
    options: [
      "A) To count how many times a word occurs in a single sentence",
      "B) To down-weight terms that occur in many documents and up-weight rare, discriminative terms",
      "C) To remove punctuation and stop words from the text",
      "D) To artificially inflate the length of short documents",
    ],
    answerIndex: 1,
    explanation: "IDF mathematically penalizes terms like 'common' or 'system' that appear across nearly all documents, while heavily boosting distinctive topical keywords.",
  },
  {
    id: 3,
    question: "A term occurs in every document of the corpus (df = N). Under standard IDF formula log10(N / df), what is its weight?",
    options: [
      "A) 1.0, because it is ubiquitous",
      "B) N, because it scales with corpus size",
      "C) 0, so the term contributes nothing to any document score",
      "D) Undefined, because of division by zero",
    ],
    answerIndex: 2,
    explanation: "idf = log10(N / df) = log10(N / N) = log10(1) = 0. A term present in every document provides zero discriminative ability.",
  },
  {
    id: 4,
    question: "For non-negative TF-IDF term weights, what is the valid numerical range of Cosine Similarity?",
    options: [
      "A) -1.0 to +1.0",
      "B) 0.0 to 1.0",
      "C) -infinity to +infinity",
      "D) 0.0 to N (number of documents)",
    ],
    answerIndex: 1,
    explanation: "While general geometric cosine spans [-1, 1], term weights are strictly non-negative (>= 0). Vectors reside in the positive first orthant, bounding cosine similarity between 0.0 (orthogonal/disjoint) and 1.0 (collinear).",
  },
  {
    id: 5,
    question: "What major distortion does Cosine Normalization eliminate compared to the plain Dot Product?",
    options: [
      "A) Recency bias towards newer documents",
      "B) Bias towards documents containing rare vocabulary",
      "C) Length bias towards long, verbose documents that accumulate large vectors",
      "D) Alphabetical sorting order bias",
    ],
    answerIndex: 2,
    explanation: "Dividing by the L2 Euclidean norm ||q|| * ||d|| cancels out magnitude, evaluating exclusively the angle between vectors so long documents do not win merely due to word volume.",
  },
  {
    id: 6,
    question: "In standard Information Retrieval architecture, how is the vocabulary V constructed?",
    options: [
      "A) Exclusively from the document collection corpus",
      "B) Exclusively from the user query",
      "C) Combined from both corpus and incoming query terms",
      "D) Fixed to an immutable external English dictionary",
    ],
    answerIndex: 0,
    explanation: "The vocabulary is established strictly during indexing from the document corpus. An incoming query word absent from the corpus has undefined document frequency and is tagged Out-Of-Vocabulary (OOV).",
  },
  {
    id: 7,
    question: "What happens when a user query contains a term that never appears in any corpus document?",
    options: [
      "A) The entire retrieval system throws an unhandled division exception",
      "B) The term is ignored during scoring and identified as Out-of-Vocabulary (OOV)",
      "C) Every document score is automatically coerced to zero",
      "D) The term receives an artificial IDF of 1.0",
    ],
    answerIndex: 1,
    explanation: "Since df = 0, the term cannot be assigned an IDF weight. The query processor drops the OOV term and retrieves based on matching in-vocabulary tokens.",
  },
  {
    id: 8,
    question: "Why does the Log-Normalized Term Frequency scheme (1 + log10(tf)) often outperform Raw Count in ranking?",
    options: [
      "A) Relevance does not grow linearly with term repetition (diminishing marginal utility)",
      "B) Raw term counts cannot be converted into floating-point numbers",
      "C) Logarithms eliminate the need to calculate IDF entirely",
      "D) It converts negative term frequencies to positive values",
    ],
    answerIndex: 0,
    explanation: "Twenty occurrences of 'compiler' in an article does not signify twenty times higher relevance than two occurrences. Log-scaling dampens high frequencies to reflect diminishing cognitive returns.",
  },
  {
    id: 9,
    question: "In a collection of N = 100 documents, a rare keyword appears in exactly 1 document. What is its standard IDF?",
    options: [
      "A) log10(100 / 1) = 2.0",
      "B) log10(1 / 100) = -2.0",
      "C) 1.0",
      "D) 100.0",
    ],
    answerIndex: 0,
    explanation: "idf = log10(100 / 1) = log10(100) = 2.0. This represents the theoretical maximum IDF value achievable in a 100-document collection.",
  },
  {
    id: 10,
    question: "How does Precision@k fundamentally differ from Recall@k?",
    options: [
      "A) Precision is computed before tokenization, Recall is computed after ranking",
      "B) Precision measures fraction of retrieved top-k that is relevant; Recall measures fraction of all relevant documents captured in top-k",
      "C) Precision applies only to Boolean systems, Recall applies only to vector space systems",
      "D) Precision and Recall are mathematically identical when k = 10",
    ],
    answerIndex: 1,
    explanation: "Precision@k divides by k (evaluating result quality / lack of noise), whereas Recall@k divides by total existing ground-truth relevant documents (evaluating completeness).",
  },
  {
    id: 11,
    question: "Why is Normalized Discounted Cumulative Gain (nDCG@k) particularly valued for web search evaluation?",
    options: [
      "A) It is completely insensitive to document rank ordering",
      "B) It applies a logarithmic position discount, penalizing relevant documents ranked further down the result list",
      "C) It does not require any human relevance judgments",
      "D) It only evaluates queries that return zero results",
    ],
    answerIndex: 1,
    explanation: "Users rarely look beyond the top few results. DCG discounts relevance by log2(rank + 1), and dividing by ideal IDCG normalizes the metric to [0, 1].",
  },
  {
    id: 12,
    question: "Two documents have identical text, but Document B repeats the text twice. Under Cosine Similarity with raw TF, how do their scores compare for the same query?",
    options: [
      "A) Document B scores twice as high as Document A",
      "B) Document A and Document B receive identical scores",
      "C) Document A scores twice as high as Document B",
      "D) Document B receives a score of 0",
    ],
    answerIndex: 1,
    explanation: "Repeating identical content scales the document vector by 2x along the same trajectory without altering its angle theta. Because cosine normalizes by length ||d||, the scalar multiplier cancels out completely.",
  },
  {
    id: 13,
    question: "What is Reciprocal Rank (RR) and when is it the most appropriate metric?",
    options: [
      "A) 1 / (rank of first relevant document); best when the user seeks a single conclusive answer (e.g. ticket routing, factoid QA)",
      "B) Total relevant documents divided by k; best for broad exploratory search",
      "C) The square root of Precision@k",
      "D) The ratio of query length to document length",
    ],
    answerIndex: 0,
    explanation: "Reciprocal Rank evaluates how quickly the user encounters their first relevant result. If the top document is relevant, RR = 1.0; if at rank 2, RR = 0.5. Its mean over queries is Mean Reciprocal Rank (MRR).",
  },
  {
    id: 14,
    question: "Which probabilistic ranking algorithm was developed by Robertson and Zaragoza as the modern successor to TF-IDF?",
    options: [
      "A) PageRank",
      "B) Okapi BM25",
      "C) Latent Dirichlet Allocation (LDA)",
      "D) Word2Vec",
    ],
    answerIndex: 1,
    explanation: "BM25 builds upon the probabilistic relevance framework, incorporating document length normalization parameters (b) and term frequency saturation limits (k1).",
  },
  {
    id: 15,
    question: "Why are TF-IDF document vectors in practical search engines considered extremely sparse?",
    options: [
      "A) Most vocabulary words in the corpus never occur in any individual single document",
      "B) Stop words occupy 99% of vector dimensions",
      "C) IDF values are rounded to zero by floating-point hardware",
      "D) Most documents are rejected by the tokenizer",
    ],
    answerIndex: 0,
    explanation: "In a vocabulary of 50,000 words, an average document uses only 150 unique words. Hence, over 99.5% of vector components are zero, motivating inverted index postings representations.",
  }
];
