// ======================================================================================
// EXPERIMENT 8: Identify Graph Entities & Probabilistic Retrieval Performance
// Knowledge Graph & Information Retrieval System (KGIRS)
// ======================================================================================

export const EXPERIMENT_CONFIG = {
  exp_number: 8,
  title: "Identify Graph Entities & Probabilistic Retrieval Performance",
  learning_unit: "KGIRS MODULE 1 & MODULE 2: STRUCTURED KNOWLEDGE EXTRACTION & PROBABILISTIC IR RANKING",
  discipline: "Computer Science and Engineering",
  subject: "Knowledge Graph and Information Retrieval System (KGIRS)",
  institute: "Virtual Laboratory • GOLC 2027",
  objectives: [
    "Extract domain-specific entities (Persons, Organizations, Locations, Concepts) from unstructured text to build structured knowledge.",
    "Construct an interactive Knowledge Graph topology using relational triples with focused nodes for semantic clarity.",
    "Formulate and evaluate probabilistic retrieval principles using the Probabilistic Relevance Framework and Okapi BM25 Model.",
    "Benchmark comparative retrieval performance (Precision@K, Recall@K, MAP, NDCG) between baseline keyword search and entity-aware probabilistic ranking."
  ]
};

export const SAMPLE_PRESETS = {
  "Tech Leaders (Sundar Pichai / Google)": {
    text: "Sundar Pichai is the CEO of Google and studied at Stanford University in California.",
    category: "Corporate Tech"
  },
  "Computing History (Alan Turing / Bletchley Park)": {
    text: "Alan Turing worked at Bletchley Park in the United Kingdom to break the Enigma machine for Allied forces.",
    category: "History & Cryptography"
  },
  "Modern AI (Satya Nadella / Microsoft / OpenAI)": {
    text: "Satya Nadella led Microsoft to partner with OpenAI based in San Francisco to advance Artificial Intelligence.",
    category: "Artificial Intelligence"
  },
  "Scientific Discoveries (Marie Curie / Paris)": {
    text: "Marie Curie conducted pioneering research on radioactivity at the University of Paris and won Nobel Prizes in Stockholm, Sweden.",
    category: "Science & Academics"
  }
};

export const KNOWN_GAZETTEER = {
  "Sundar Pichai": "PERSON",
  "Alan Turing": "PERSON",
  "Satya Nadella": "PERSON",
  "Marie Curie": "PERSON",
  "Elena Voss": "PERSON",
  "Marcus Lindqvist": "PERSON",
  "Kavi Rajan": "PERSON",
  "Google": "ORGANIZATION",
  "Stanford University": "ORGANIZATION",
  "Microsoft": "ORGANIZATION",
  "OpenAI": "ORGANIZATION",
  "University of Paris": "ORGANIZATION",
  "Bletchley Park": "ORGANIZATION",
  "Lakeside University": "ORGANIZATION",
  "Nimbus AI Labs": "ORGANIZATION",
  "Hudson University": "ORGANIZATION",
  "Horizon AI": "ORGANIZATION",
  "Cortex Labs": "ORGANIZATION",
  "Nimbus Corp": "ORGANIZATION",
  "California": "LOCATION",
  "United Kingdom": "LOCATION",
  "San Francisco": "LOCATION",
  "Stockholm": "LOCATION",
  "Sweden": "LOCATION",
  "Paris": "LOCATION",
  "Toronto": "LOCATION",
  "New York": "LOCATION",
  "London": "LOCATION",
  "CEO": "ROLE_TITLE",
  "Artificial Intelligence": "CONCEPT",
  "World Wide Web": "CONCEPT",
  "Enigma machine": "CONCEPT",
  "Nobel Prizes": "AWARD",
  "radioactivity": "CONCEPT",
  "Deep Learning": "CONCEPT",
  "Convolutional Networks": "CONCEPT",
  "Reinforcement Learning": "CONCEPT"
};

export const ENTITY_COLORS = {
  PERSON: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', dot: '#10b981', label: 'Person (PER)' },
  ORGANIZATION: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', dot: '#3b82f6', label: 'Organization (ORG)' },
  LOCATION: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', dot: '#f59e0b', label: 'Location (LOC)' },
  CONCEPT: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', dot: '#8b5cf6', label: 'Concept (MISC)' },
  ROLE_TITLE: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300', dot: '#0284c7', label: 'Role / Title' },
  AWARD: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300', dot: '#f43f5e', label: 'Award / Honor' }
};

export const DATA_CORPORA = {
  "AI & Deep Learning Pioneers (Domain 1)": {
    description: "Corpus on pioneering Artificial Intelligence researchers, research institutions, breakthrough algorithms, and global research hubs.",
    documents: [
      {
        doc_id: "DOC-101",
        title: "Deep Learning Breakthroughs at Lakeside University",
        text: "Elena Voss and her research group at Lakeside University pioneered Deep Learning and artificial neural network backpropagation. Voss later joined Nimbus AI Labs to scale distributed neural representations in Toronto.",
        entities: [
          { name: "Elena Voss", type: "PERSON" },
          { name: "Lakeside University", type: "ORGANIZATION" },
          { name: "Deep Learning", type: "CONCEPT" },
          { name: "Nimbus AI Labs", type: "ORGANIZATION" },
          { name: "Toronto", type: "LOCATION" }
        ],
        triples: [
          ["Elena Voss", "affiliated_with", "Lakeside University"],
          ["Elena Voss", "pioneered", "Deep Learning"],
          ["Elena Voss", "joined", "Nimbus AI Labs"],
          ["Lakeside University", "located_in", "Toronto"]
        ],
        relevant_to: ["deep learning", "elena voss", "toronto neural network", "nimbus ai labs pioneer"]
      },
      {
        doc_id: "DOC-102",
        title: "Convolutional Neural Networks and Horizon AI Research",
        text: "Marcus Lindqvist developed Convolutional Neural Networks for computer vision at Hudson University. Lindqvist subsequently became Chief AI Scientist at Horizon AI in New York, collaborating on self-supervised machine learning.",
        entities: [
          { name: "Marcus Lindqvist", type: "PERSON" },
          { name: "Convolutional Networks", type: "CONCEPT" },
          { name: "Hudson University", type: "ORGANIZATION" },
          { name: "Horizon AI", type: "ORGANIZATION" },
          { name: "New York", type: "LOCATION" }
        ],
        triples: [
          ["Marcus Lindqvist", "affiliated_with", "Hudson University"],
          ["Marcus Lindqvist", "developed", "Convolutional Networks"],
          ["Marcus Lindqvist", "leads", "Horizon AI"],
          ["Horizon AI", "located_in", "New York"]
        ],
        relevant_to: ["marcus lindqvist", "convolutional networks", "horizon ai research", "computer vision new york"]
      },
      {
        doc_id: "DOC-103",
        title: "Cortex Labs and Reinforcement Learning in London",
        text: "Kavi Rajan co-founded Cortex Labs in London, revolutionizing Deep Reinforcement Learning with StrategoNet and ProteoMind. Cortex Labs was acquired by Nimbus Corp, strengthening the London artificial intelligence ecosystem.",
        entities: [
          { name: "Kavi Rajan", type: "PERSON" },
          { name: "Cortex Labs", type: "ORGANIZATION" },
          { name: "Reinforcement Learning", type: "CONCEPT" },
          { name: "Nimbus Corp", type: "ORGANIZATION" },
          { name: "London", type: "LOCATION" }
        ],
        triples: [
          ["Kavi Rajan", "co-founded", "Cortex Labs"],
          ["Cortex Labs", "developed", "Reinforcement Learning"],
          ["Cortex Labs", "located_in", "London"],
          ["Nimbus Corp", "acquired", "Cortex Labs"]
        ],
        relevant_to: ["kavi rajan", "cortex labs london", "reinforcement learning", "nimbus corp acquisition"]
      },
      {
        doc_id: "DOC-104",
        title: "Silicon Valley Scaled AI Systems at Stanford University",
        text: "Sundar Pichai visited Stanford University in California to discuss large language models and global cloud infrastructure with computer science faculty and researchers.",
        entities: [
          { name: "Sundar Pichai", type: "PERSON" },
          { name: "Stanford University", type: "ORGANIZATION" },
          { name: "California", type: "LOCATION" },
          { name: "Artificial Intelligence", type: "CONCEPT" }
        ],
        triples: [
          ["Sundar Pichai", "visited", "Stanford University"],
          ["Stanford University", "located_in", "California"],
          ["Stanford University", "researches", "Artificial Intelligence"]
        ],
        relevant_to: ["sundar pichai", "stanford university california", "cloud infrastructure", "language models"]
      },
      {
        doc_id: "DOC-105",
        title: "San Francisco Generative Models at OpenAI",
        text: "Satya Nadella announced Microsoft investments in OpenAI based in San Francisco, accelerating transformer models and neural reasoning systems across enterprise applications.",
        entities: [
          { name: "Satya Nadella", type: "PERSON" },
          { name: "Microsoft", type: "ORGANIZATION" },
          { name: "OpenAI", type: "ORGANIZATION" },
          { name: "San Francisco", type: "LOCATION" },
          { name: "Artificial Intelligence", type: "CONCEPT" }
        ],
        triples: [
          ["Satya Nadella", "leads", "Microsoft"],
          ["Microsoft", "invested_in", "OpenAI"],
          ["OpenAI", "located_in", "San Francisco"],
          ["OpenAI", "develops", "Artificial Intelligence"]
        ],
        relevant_to: ["satya nadella", "microsoft openai", "san francisco generative models", "transformer neural"]
      }
    ]
  },
  "Enterprise Cloud & Systems (Domain 2)": {
    description: "Enterprise knowledge corpus highlighting distributed systems, cloud computing, and databases.",
    documents: [
      {
        doc_id: "DOC-201",
        title: "Distributed Graph Databases at Apex Corp",
        text: "Apex Corp engineered distributed graph storage in Seattle to handle multi-hop Cypher queries across billions of connected financial entities.",
        entities: [
          { name: "Apex Corp", type: "ORGANIZATION" },
          { name: "Seattle", type: "LOCATION" },
          { name: "Graph Databases", type: "CONCEPT" }
        ],
        triples: [
          ["Apex Corp", "located_in", "Seattle"],
          ["Apex Corp", "engineered", "Graph Databases"]
        ],
        relevant_to: ["apex corp seattle", "distributed graph storage", "cypher queries"]
      },
      {
        doc_id: "DOC-202",
        title: "Inverted Index Compression at Vector Systems",
        text: "Vector Systems in Austin deployed Elias-Gamma and Variable Byte compression for high-throughput inverted index traversal in enterprise web search.",
        entities: [
          { name: "Vector Systems", type: "ORGANIZATION" },
          { name: "Austin", type: "LOCATION" },
          { name: "Inverted Index", type: "CONCEPT" }
        ],
        triples: [
          ["Vector Systems", "located_in", "Austin"],
          ["Vector Systems", "deployed", "Inverted Index"]
        ],
        relevant_to: ["vector systems austin", "inverted index compression", "web search"]
      }
    ]
  }
};

/**
 * Rule-Based + Gazetteer Named Entity Recognition
 */
export function extractEntities(text) {
  if (!text || typeof text !== 'string') return [];
  const results = [];
  const foundSpans = [];

  // 1. Gazetteer exact matching (multi-word first)
  const gazetteerEntries = Object.entries(KNOWN_GAZETTEER).sort((a, b) => b[0].length - a[0].length);

  for (const [entityName, entityType] of gazetteerEntries) {
    const escaped = entityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // Check overlap
      const overlaps = foundSpans.some(s => (start >= s.start && start < s.end) || (end > s.start && end <= s.end));
      if (!overlaps) {
        foundSpans.push({ start, end });
        results.push({
          name: match[0],
          canonical: entityName,
          type: entityType,
          start,
          end,
          method: 'Gazetteer'
        });
      }
    }
  }

  // 2. Pattern-based Title + Capitalized Name fallback (e.g. "Dr. John", "CEO")
  const titlePattern = /\b(CEO|CTO|Dr\.|Prof\.|President|Scientist)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
  let tMatch;
  while ((tMatch = titlePattern.exec(text)) !== null) {
    const personName = tMatch[2];
    const start = tMatch.index;
    const end = start + tMatch[0].length;
    const overlaps = foundSpans.some(s => (start >= s.start && start < s.end) || (end > s.start && end <= s.end));
    if (!overlaps && personName.length > 2) {
      foundSpans.push({ start, end });
      results.push({
        name: personName,
        canonical: personName,
        type: 'PERSON',
        start: tMatch.index + tMatch[1].length + 1,
        end,
        method: 'Syntactic Pattern'
      });
    }
  }

  // 3. Fallback Capitalized Phrase Extraction (2-3 words capitalized e.g. "Stanford University")
  const capPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
  let cMatch;
  while ((cMatch = capPattern.exec(text)) !== null) {
    const spanText = cMatch[1];
    const start = cMatch.index;
    const end = start + spanText.length;
    const overlaps = foundSpans.some(s => (start >= s.start && start < s.end) || (end > s.start && end <= s.end));
    if (!overlaps && spanText.length > 3) {
      foundSpans.push({ start, end });
      let inferredType = 'ORGANIZATION';
      if (/University|Institute|College|Labs|Corp|Inc|Company|Association/.test(spanText)) {
        inferredType = 'ORGANIZATION';
      } else if (/California|Kingdom|Francisco|Sweden|York|London|Paris|Toronto/.test(spanText)) {
        inferredType = 'LOCATION';
      }
      results.push({
        name: spanText,
        canonical: spanText,
        type: inferredType,
        start,
        end,
        method: 'Capitalized Heuristic'
      });
    }
  }

  return results.sort((a, b) => a.start - b.start);
}

/**
 * Build Knowledge Graph structure from text and extracted entities
 */
export function buildGraphFromEntities(text, extractedEntities) {
  const nodes = [];
  const edges = [];
  const nodeMap = new Map();

  // Add entity nodes
  extractedEntities.forEach(ent => {
    if (!nodeMap.has(ent.canonical)) {
      const node = {
        id: ent.canonical,
        label: ent.canonical,
        type: ent.type,
        color: ENTITY_COLORS[ent.type]?.dot || '#64748b'
      };
      nodes.push(node);
      nodeMap.set(ent.canonical, node);
    }
  });

  // Extract relational edges between co-occurring entities in sentence
  const sentences = text.split(/(?<=[.?!])\s+/);
  sentences.forEach(sent => {
    const inSent = extractedEntities.filter(e => sent.includes(e.name));
    for (let i = 0; i < inSent.length; i++) {
      for (let j = i + 1; j < inSent.length; j++) {
        const u = inSent[i].canonical;
        const v = inSent[j].canonical;
        if (u !== v) {
          // Infer relation label
          let rel = 'relates_to';
          if (inSent[i].type === 'PERSON' && inSent[j].type === 'ORGANIZATION') rel = 'affiliated_with';
          else if (inSent[i].type === 'ORGANIZATION' && inSent[j].type === 'LOCATION') rel = 'located_in';
          else if (inSent[i].type === 'PERSON' && inSent[j].type === 'CONCEPT') rel = 'researches';
          else if (inSent[j].type === 'PERSON' && inSent[i].type === 'ORGANIZATION') rel = 'employs';

          const edgeId = `${u}-${rel}-${v}`;
          if (!edges.some(e => e.id === edgeId || e.id === `${v}-${rel}-${u}`)) {
            edges.push({
              id: edgeId,
              source: u,
              target: v,
              label: rel
            });
          }
        }
      }
    }
  });

  return { nodes, edges };
}

/**
 * Probabilistic BM25 & Entity-Aware Retrieval Scoring
 */
export function tokenizeText(str) {
  if (!str) return [];
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

export function rankDocuments(corpusDocs, queryStr, { k1 = 1.5, b = 0.75, entityBoostWeight = 1.8 } = {}) {
  const queryTokens = tokenizeText(queryStr);
  const queryEntities = extractEntities(queryStr).map(e => e.canonical.toLowerCase());

  if (corpusDocs.length === 0 || queryTokens.length === 0) return [];

  // Compute corpus document lengths
  const N = corpusDocs.length;
  const docTokens = corpusDocs.map(d => tokenizeText(`${d.title} ${d.text}`));
  const docLens = docTokens.map(dt => dt.length);
  const avgDocLen = docLens.reduce((a, c) => a + c, 0) / (N || 1);

  // Document Frequency per token
  const dfMap = {};
  queryTokens.forEach(t => {
    let count = 0;
    docTokens.forEach(dt => {
      if (dt.includes(t)) count++;
    });
    dfMap[t] = count;
  });

  // Calculate scores
  const results = corpusDocs.map((doc, idx) => {
    const tokens = docTokens[idx];
    const docLen = docLens[idx];
    let bm25Score = 0;

    queryTokens.forEach(term => {
      const tf = tokens.filter(t => t === term).length;
      if (tf > 0) {
        const df = dfMap[term] || 0;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        const numerator = tf * (k1 + 1);
        const denominator = tf + k1 * (1 - b + b * (docLen / (avgDocLen || 1)));
        bm25Score += idf * (numerator / denominator);
      }
    });

    // Entity Match Boost
    const docEntities = (doc.entities || []).map(e => e.name.toLowerCase());
    let matchedEntitiesCount = 0;
    queryEntities.forEach(qe => {
      if (docEntities.some(de => de.includes(qe) || qe.includes(de))) {
        matchedEntitiesCount++;
      }
    });

    const entityBoost = matchedEntitiesCount * entityBoostWeight;
    const finalScore = bm25Score + entityBoost;

    // Determine relevance
    const isGroundTruthRelevant = (doc.relevant_to || []).some(rel =>
      queryTokens.some(qt => rel.toLowerCase().includes(qt)) ||
      rel.toLowerCase().includes(queryStr.toLowerCase().trim())
    );

    return {
      doc_id: doc.doc_id,
      title: doc.title,
      text: doc.text,
      docLen,
      entities: doc.entities || [],
      triples: doc.triples || [],
      bm25Score: Number(bm25Score.toFixed(4)),
      entityBoost: Number(entityBoost.toFixed(4)),
      finalScore: Number(finalScore.toFixed(4)),
      matchedEntitiesCount,
      isGroundTruthRelevant
    };
  });

  // Sort descending by finalScore
  return results.sort((a, b) => b.finalScore - a.finalScore);
}

/**
 * Compute Comparative IR Evaluation Metrics
 */
export function computeMetrics(rankedDocs, K = 3) {
  const topK = rankedDocs.slice(0, K);
  const relevantInTopK = topK.filter(d => d.isGroundTruthRelevant).length;
  const totalRelevant = rankedDocs.filter(d => d.isGroundTruthRelevant).length || 1;

  const precisionAtK = relevantInTopK / (K || 1);
  const recallAtK = relevantInTopK / totalRelevant;

  // Average Precision
  let cumulativeRelevant = 0;
  let sumPrecisions = 0;
  rankedDocs.forEach((d, i) => {
    if (d.isGroundTruthRelevant) {
      cumulativeRelevant++;
      sumPrecisions += cumulativeRelevant / (i + 1);
    }
  });
  const avgPrecision = totalRelevant > 0 ? sumPrecisions / totalRelevant : 0;

  // NDCG@K
  let dcg = 0;
  topK.forEach((d, i) => {
    const rel = d.isGroundTruthRelevant ? 1 : 0;
    dcg += rel / Math.log2(i + 2);
  });
  let idcg = 0;
  for (let i = 0; i < Math.min(K, totalRelevant); i++) {
    idcg += 1 / Math.log2(i + 2);
  }
  const ndcgAtK = idcg > 0 ? dcg / idcg : 0;

  return {
    precisionAtK: Number((precisionAtK * 100).toFixed(1)),
    recallAtK: Number((recallAtK * 100).toFixed(1)),
    map: Number((avgPrecision * 100).toFixed(1)),
    ndcgAtK: Number((ndcgAtK * 100).toFixed(1))
  };
}

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Which of the following entity categories correctly classifies 'Cortex Labs' and 'Arclight AI'?",
    options: [
      "LOCATION (LOC)",
      "ORGANIZATION (ORG)",
      "PERSON (PER)",
      "TEMPORAL (DATE)"
    ],
    answer_index: 1,
    explanation: "'Cortex Labs' and 'Arclight AI' are research labs and corporate entities, classified under the ORGANIZATION (ORG) category."
  },
  {
    id: 2,
    question: "What is the primary role of the parameter k1 in the Okapi BM25 scoring formula?",
    options: [
      "It controls term frequency saturation non-linearity (how fast the score plateaus with repeated term occurrences)",
      "It sets the absolute document length in bytes",
      "It determines the network port used for graph database connections",
      "It eliminates all stop words from the query vector"
    ],
    answer_index: 0,
    explanation: "Parameter k1 (typically between 1.2 and 2.0) calibrates term frequency saturation; higher values allow repeated terms to contribute more before leveling off."
  },
  {
    id: 3,
    question: "In BM25, setting the document length normalization parameter b = 0 causes the model to:",
    options: [
      "Completely disable term frequency weighting",
      "Completely eliminate document length normalization (short and long documents treated equally)",
      "Invert the ranking order from worst to best",
      "Restrict retrieval to only single-word documents"
    ],
    answer_index: 1,
    explanation: "Parameter b controls length normalization; when b = 0, no length penalty is applied, whereas b = 1 applies full scaling by document length relative to average document length."
  },
  {
    id: 4,
    question: "How does incorporating Knowledge Graph entities improve probabilistic document ranking over pure BM25?",
    options: [
      "By converting all natural language text into binary machine code",
      "By recognizing multi-word semantic concepts and rewarding documents that match recognized entity instances",
      "By deleting documents that have more than 50 words",
      "By forcing every query to return exactly one document"
    ],
    answer_index: 1,
    explanation: "Entity-aware retrieval matches cohesive concepts (e.g., 'Stanford University' or 'Elena Voss') as semantic graph units rather than isolated individual tokens."
  },
  {
    id: 5,
    question: "In a Knowledge Graph topology, an edge represented as ('Elena Voss', 'affiliated_with', 'Lakeside University') is formally termed a:",
    options: [
      "Relational Triple (Subject, Predicate, Object)",
      "Boolean Logic Gate",
      "Postings Array Index",
      "Term-Frequency Matrix"
    ],
    answer_index: 0,
    explanation: "Knowledge graphs represent assertions as relational triples consisting of a Subject entity node, a Predicate edge label, and an Object entity node."
  },
  {
    id: 6,
    question: "In the BIO Named Entity Tagging format, what does the tag 'I-ORG' represent?",
    options: [
      "Initial token of an Organization entity",
      "Inside (continuation) of an multi-token Organization entity mention",
      "Invalid Organization name",
      "Inverse Organization score"
    ],
    answer_index: 1,
    explanation: "B-tag marks the Beginning of an entity mention, I-tag marks continuation Inside a multi-token entity, and O marks tokens Outside any entity."
  },
  {
    id: 7,
    question: "What is the primary difference between Named Entity Recognition (NER) and Entity Linking?",
    options: [
      "NER detects entity spans and types in text, whereas Entity Linking resolves mentions to canonical IDs in a Knowledge Base",
      "NER is for numbers only, while Entity Linking is for words only",
      "NER runs in web browsers, while Entity Linking requires GPUs",
      "There is no difference; they are exact synonyms"
    ],
    answer_index: 0,
    explanation: "NER identifies surface spans and general categories; Entity Linking disambiguates surface text to unique canonical entities in an ontology or graph."
  },
  {
    id: 8,
    question: "What does the Mean Average Precision (MAP) metric quantify across multiple search queries?",
    options: [
      "The average execution time of the BM25 algorithm in milliseconds",
      "The mean of the Average Precision scores across all evaluated queries, rewarding systems that rank relevant documents higher",
      "The total number of documents in the index",
      "The percentage of memory consumed by the inverted index"
    ],
    answer_index: 1,
    explanation: "MAP computes the arithmetic mean of Average Precision across multiple test queries, penalizing systems when relevant documents appear late in the ranked list."
  },
  {
    id: 9,
    question: "What does the Discounted Cumulative Gain (DCG) metric account for that Precision@K ignores?",
    options: [
      "The exact positions (ranks) of relevant documents via logarithmic discounting",
      "The alphabetical order of document titles",
      "The disk storage format of the documents",
      "The number of servers in the search engine cluster"
    ],
    answer_index: 0,
    explanation: "DCG divides relevance scores by log2(rank + 1), heavily rewarding highly relevant documents returned in top positions over lower ranks."
  },
  {
    id: 10,
    question: "Why does pure keyword matching struggle with queries like 'Satya Nadella Microsoft Cloud' compared to entity-aware ranking?",
    options: [
      "Keywords ignore the relational semantic bindings connecting the person, organization, and domain",
      "Keywords can only process uppercase characters",
      "Probabilistic search engines do not support spaces",
      "Knowledge graphs cannot store proper nouns"
    ],
    answer_index: 0,
    explanation: "Pure keyword search treats terms independently, while entity-aware models exploit relational Knowledge Graph triples and structured entity constraints."
  }
];
