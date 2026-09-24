/**
 * Relationship Extraction Engine (Client-Side NLP & Rule-Based Dependency Parsing)
 * Faithful JavaScript implementation of Experiment 9 (Relationship Extraction from Text):
 * - Named Entity Recognition (NER)
 * - Syntactic Dependency & Pattern Parsing
 * - Active Voice & Passive Voice Inversion
 * - Role & Attribute Affiliations ("as CEO of <Org>")
 * - Prepositional Attachments & Comitatives
 * - Appositive Locations ("Cupertino, California")
 * - Negation Filtering ("acquired by no company" -> skipped)
 * - Semantic Triple Generation (Subject, Relationship, Object)
 * - Canonical Relation Normalization
 */

export const EXPERIMENT_CONFIG = {
  expNo: 9,
  title: "Relationship Extraction from Text",
  course: "Knowledge Graph & Information Retrieval Systems (KGIRS)",
  courseCode: "CS-KGIRS-09",
  targetRolls: "Roll Numbers 41 – 45 (Division C)",
  objectives: [
    "Understand the principles of Named Entity Recognition (NER) and syntactic dependency parsing for relation discovery.",
    "Extract semantic relationships between entity spans from unstructured text into structured (Subject, Relationship, Object) triples.",
    "Handle syntactic variations including active voice, passive voice inversion, and prepositional attachments.",
    "Construct and visualize an interactive Knowledge Graph from extracted semantic triples.",
    "Validate extracted relationships and export structured triples in CSV and JSON formats."
  ]
};

export const THEORY_CONTENT = {
  background: `### 1. Introduction to Relationship Extraction
Relationship Extraction (RE) is a core Information Extraction (IE) task that identifies semantic connections between named entities mentioned in natural language text. In information retrieval and semantic web systems, turning unstructured text into structured facts powers question answering, search engines, and domain-specific knowledge bases.

### 2. The Extraction Pipeline
The transition from raw unstructured text to a structured graph follows a five-stage pipeline:
\`\`\`
Text  -->  Entities (NER)  -->  Relationships (Dependency Parsing)  -->  Triples (S, R, O)  -->  Knowledge Graph
\`\`\`

1. **Text Preprocessing**: Tokenization, sentence boundary detection, and normalization of compound terms (e.g., *co-founded* → *co_founded*).
2. **Named Entity Recognition (NER)**: Identifying entity spans and classifying them into semantic categories such as \`PERSON\`, \`ORG\` (Organization), \`GPE\` (Geopolitical Entity), \`LOC\` (Location), and \`PRODUCT\`.
3. **Syntactic Dependency Parsing**: Analyzing the grammatical dependency tree to trace connections between subject noun phrases, verbal predicates, and direct/prepositional objects.
4. **Triple Generation**: Structuring extracted relationships into formal **Subject–Relationship–Object** (SPO) triples:
   - $(e_1, r, e_2) \\in \\mathcal{E} \\times \\mathcal{R} \\times \\mathcal{E}$
5. **Knowledge Graph Construction**: Mapping subjects and objects to graph nodes (vertices) and relationships to directed, labeled edges.

### 3. Syntactic & Linguistic Handling
- **Active Voice**: Identifies nominal subjects (\`nsubj\`) and direct objects (\`dobj\`/\`obj\`) linked by a root verb (e.g., *"Steve Jobs founded Apple"* → \`Steve Jobs | founded | Apple\`).
- **Passive Voice Inversion**: Identifies passive nominal subjects (\`nsubjpass\`) and agent prepositional phrases (\`agent\` / \`prep\` *"by"*) to correctly assign the agent as the semantic subject (e.g., *"Apple was founded by Steve Jobs"* → \`Steve Jobs | founded | Apple\`).
- **Role & Attribute Structures**: Extracts role affiliations such as *"as CEO of <Org>"* into structured relations (e.g., *"Tim Cook succeeded Steve Jobs as CEO of Apple"* → \`Tim Cook | succeeded | Steve Jobs\` and \`Tim Cook | CEO_of | Apple\`).
- **Prepositional Attachments & Comitatives**: Correctly associates location/partnership attachments while distinguishing accompaniment (\`with\`) from direct targets.
- **Negation Filtering**: Filters out negated statements (e.g., *"Google was acquired by no company"*) to prevent false assertions from entering the knowledge base.`,
  procedure: [
    "Step 1: Review the theoretical background, pipeline stages, and linguistic concepts in this section.",
    "Step 2: Navigate to the Simulation tab in the top navigation bar.",
    "Step 3: Select a sample example, enter custom text, or upload a document (.txt, .pdf, .docx).",
    "Step 4: Click 'Extract Relationships' to trigger NER, dependency parsing, and triple generation.",
    "Step 5: Inspect the detected entity tags, extracted relationship triples table, and interactive Knowledge Graph.",
    "Step 6: Download the extracted triples as CSV or JSON for offline verification.",
    "Step 7: Proceed to the Quiz section to test your understanding of relationship extraction and knowledge graphs.",
    "Step 8: Open Report Generation, enter your student information and observations, and download your official Lab Report PDF."
  ],
  key_terms: {
    "Named Entity Recognition (NER)": "Subtask of IE that locates and classifies named entities in unstructured text into predefined categories (e.g., PERSON, ORG, GPE).",
    "Relationship Extraction (RE)": "The process of detecting and classifying semantic assertions linking two or more entities.",
    "Semantic Triple (S, R, O)": "A fundamental unit of knowledge representation consisting of Subject (entity), Predicate/Relationship, and Object (entity).",
    "Dependency Parsing": "Analyzing grammatical sentence structure to establish directed head-dependent relationships between words.",
    "Passive Voice Inversion": "Transforming passive syntactic structures ('X was founded by Y') into standard canonical active triples (Y, founded, X).",
    "Knowledge Graph (KG)": "A directed multi-graph where nodes represent entities and edges represent semantic relationships."
  }
};

export const SAMPLE_TEXTS = {
  "Example 1: Tech Companies & Partnerships":
    "Steve Wozniak co-founded Apple. Elon Musk founded SpaceX. NASA partnered with SpaceX for space missions.",
  "Example 2: Apple Leadership & Acquisition":
    "Steve Jobs founded Apple. Steve Wozniak co-founded Apple. Apple acquired Beats Electronics in 2014. Tim Cook succeeded Steve Jobs as CEO of Apple. Apple is headquartered in Cupertino, California.",
  "Example 3: SpaceX & Tesla":
    "Elon Musk founded SpaceX in 2002. SpaceX is headquartered in Hawthorne, California. Elon Musk also leads Tesla, which manufactures electric vehicles.",
  "Example 4: Scientists & Universities":
    "Albert Einstein was born in Germany and worked at Princeton University. Marie Curie studied at University of Paris and won the Nobel Prize.",
  "Example 5: Microsoft & GitHub":
    "Microsoft acquired GitHub in 2018. Satya Nadella is the CEO of Microsoft.",
  "Example 6: Negative Case":
    "Google was acquired by no company."
};

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the primary objective of Relationship Extraction (RE) in Knowledge Graph construction?",
    options: [
      "A) To count the total number of words and characters in a paragraph",
      "B) To discover semantic connections between recognized entity spans and represent them as structured triples",
      "C) To compress text documents into binary encodings",
      "D) To translate natural language text into another human language"
    ],
    answer_index: 1,
    explanation:
      "Relationship Extraction identifies and classifies semantic relations between entities, structuring unstructured text into Subject-Relationship-Object triples for knowledge graph ingestion."
  },
  {
    id: 2,
    question: "In the semantic triple (Steve Jobs, founded, Apple), which component represents the predicate / relationship?",
    options: [
      "A) Steve Jobs",
      "B) founded",
      "C) Apple",
      "D) Both Steve Jobs and Apple"
    ],
    answer_index: 1,
    explanation:
      "In standard (Subject, Predicate, Object) knowledge triples, 'founded' is the predicate (directed relation) connecting the subject entity ('Steve Jobs') to the object entity ('Apple')."
  },
  {
    id: 3,
    question: "How should an extraction system handle the passive sentence: 'Apple was founded by Steve Jobs'?",
    options: [
      "A) Discard the sentence because passive verbs cannot express relationships",
      "B) Generate the triple: (Apple, was_founded, Steve Jobs)",
      "C) Invert the agent ('Steve Jobs') to the subject and passive subject ('Apple') to the object: (Steve Jobs, founded, Apple)",
      "D) Duplicate the relationship symmetrically in both directions"
    ],
    answer_index: 2,
    explanation:
      "Passive voice inversion identifies the prepositional agent ('by Steve Jobs') as the true semantic agent (Subject) and canonicalizes the relation to active form ('founded') with 'Apple' as the Object."
  },
  {
    id: 4,
    question: "In a Knowledge Graph derived from extracted relationship triples, what do the nodes and directed edges correspond to?",
    options: [
      "A) Nodes are verbs; Edges are nouns",
      "B) Nodes are sentences; Edges are paragraphs",
      "C) Nodes are entities (concepts/objects); Directed edges are semantic relationships",
      "D) Nodes are characters; Edges are punctuation marks"
    ],
    answer_index: 2,
    explanation:
      "In Knowledge Graph data models (such as RDF and Property Graphs), entities represent the graph nodes (vertices), while semantic relationships form directed, labeled edges."
  },
  {
    id: 5,
    question: "Why is Named Entity Recognition (NER) an essential precursor to Relationship Extraction?",
    options: [
      "A) Because relationship extraction operates by identifying semantic connections specifically between defined entity boundaries",
      "B) Because NER calculates font styling and page layout",
      "C) Because NER removes all verbs from the sentence",
      "D) NER is only used to count total syllables in words"
    ],
    answer_index: 0,
    explanation:
      "NER delineates and classifies the exact entity boundaries (PERSON, ORG, GPE, etc.) that serve as the subject and object arguments for candidate semantic relations."
  },
  {
    id: 6,
    question: "In dependency parsing for relationship extraction, what syntactic dependency tag typically identifies the subject of an active-voice clause?",
    options: [
      "A) dobj (direct object)",
      "B) nsubj (nominal subject)",
      "C) prep (prepositional modifier)",
      "D) punct (punctuation mark)"
    ],
    answer_index: 1,
    explanation:
      "The nsubj (nominal subject) dependency relation identifies the noun phrase that acts as the grammatical subject performing the action in an active sentence."
  },
  {
    id: 7,
    question: "What is the purpose of normalizing verbal predicates (e.g., mapping 'co-founded', 'cofounded', and 'co_founded' to a canonical form)?",
    options: [
      "A) To ensure uniform schema definitions and consistent relation queries in the knowledge graph",
      "B) To delete all verbal assertions from the database",
      "C) To convert numerical dates into Roman numerals",
      "D) To increase the character count of the stored graph"
    ],
    answer_index: 0,
    explanation:
      "Relation canonicalization/normalization aligns syntactic variants onto uniform schema relations, preventing duplicate or fragmented edges in the knowledge graph."
  },
  {
    id: 8,
    question: "In the Resource Description Framework (RDF) and property graphs, what is an entity–relationship–entity assertion formally called?",
    options: [
      "A) A binary byte",
      "B) A semantic triple (Subject, Predicate, Object)",
      "C) A parse token",
      "D) A stopword list"
    ],
    answer_index: 1,
    explanation:
      "Knowledge representation frameworks structure knowledge into atomic Subject-Predicate-Object (SPO) semantic triples."
  },
  {
    id: 9,
    question: "How does relationship extraction avoid inserting false facts from negated statements like 'Google was acquired by no company'?",
    options: [
      "A) By capitalizing all words in the sentence",
      "B) By inspecting syntactic negation modifiers (e.g., neg dependency or negative determiners 'no', 'never') and filtering them out",
      "C) By reversing the direction of the edge in the graph",
      "D) By converting the sentence into passive voice"
    ],
    answer_index: 1,
    explanation:
      "Negation detection checks syntactic negation dependencies and negative quantifiers to prevent false assertions from being populated into the graph."
  },
  {
    id: 10,
    question: "What role does coreference resolution play in advanced Relationship Extraction pipelines?",
    options: [
      "A) It resolves pronouns and aliases (e.g., 'he', 'she', 'it') back to their antecedent entity mentions across sentences",
      "B) It translates text into foreign languages",
      "C) It formats graphs into PDF files",
      "D) It counts the number of punctuation marks in a document"
    ],
    answer_index: 0,
    explanation:
      "Coreference resolution links pronouns and aliases back to their canonical entity mentions (e.g., linking 'He founded SpaceX' back to 'Elon Musk'), enabling accurate cross-sentence relationship extraction."
  }
];

export const ENTITY_COLORS = {
  PERSON: "#8b5cf6",
  ORG: "#3b82f6",
  GPE: "#10b981",
  LOC: "#059669",
  DATE: "#f59e0b",
  PRODUCT: "#ef4444",
  CONCEPT: "#0284c7",
  ENTITY: "#64748b"
};

export function getEntityColor(entType) {
  return ENTITY_COLORS[entType?.toUpperCase()] || "#64748b";
}

export function cleanEntityText(text) {
  if (!text) return "";
  return text.trim().replace(/^[.,;:!?"'`()[\]{}]+|[.,;:!?"'`()[\]{}]+$/g, "").trim();
}

/**
 * Normalizes verbal phrases into standard snake_case predicates
 * Canonical mapping table for Relationship Extraction
 */
export function normalizeRelation(relStr) {
  if (!relStr) return "relates_to";
  const s = relStr.trim().toLowerCase();

  if (s.includes("co-found") || s.includes("cofound") || s.includes("co_found") || s === "co-founded") {
    return "co-founded";
  }
  if (s.includes("co-author") || s.includes("coauthor") || s.includes("co_author")) {
    return "co-authored";
  }
  if (s.includes("co-creat") || s.includes("cocreat") || s.includes("co_creat")) {
    return "co-created";
  }
  if (s.includes("co-direct") || s.includes("codirect") || s.includes("co_direct")) {
    return "co-directed";
  }
  if (s.includes("co-own") || s.includes("coown") || s.includes("co_own")) {
    return "co-owns";
  }
  if (s.includes("partner")) {
    return s.includes("with") ? "partner_with" : "partnered";
  }
  if (s.includes("succeed")) {
    return "succeeded";
  }
  if (s.includes("born") || s.includes("bear")) {
    return s.includes("in") ? "born_in" : "born";
  }
  if (s.includes("died") || s.includes("die")) {
    return s.includes("in") ? "died_in" : "died";
  }
  if (s.includes("headquarter")) {
    return "headquartered_in";
  }
  if (s.includes("found")) {
    if (s.includes("by")) return "founded";
    if (s.includes("in")) return "founded_in";
    return "founded";
  }
  if (s.includes("acquir")) {
    return "acquired";
  }
  if (s.includes("work")) {
    return s.includes("for") ? "works_for" : (s.includes("at") ? "worked_at" : "works_at");
  }
  if (s.includes("stud")) {
    return s.includes("at") ? "studied_at" : "studied";
  }
  if (s.includes("graduat")) {
    return "graduated_from";
  }
  if (s.includes("locat")) {
    return "located_in";
  }
  if (s.includes("base")) {
    return "based_in";
  }
  if (s.includes("marri")) {
    return "married_to";
  }
  if (s.includes("lead")) {
    return "leads";
  }
  if (s.includes("manufactur")) {
    return "manufactures";
  }
  if (s.includes("produc")) {
    return "produces";
  }
  if (s.includes("invent")) {
    return "invented";
  }
  if (s.includes("creat")) {
    return "created";
  }
  if (s.includes("develop")) {
    return s.includes("by") ? "developed_by" : "developed";
  }
  if (s.includes("discover")) {
    return s.includes("in") ? "discovered_in" : "discovered";
  }
  if (s.includes("win") || s.includes("won")) {
    return "won";
  }
  if (s.includes("ceo")) {
    return "CEO_of";
  }
  if (s.includes("president")) {
    return "president_of";
  }
  if (s.includes("live")) {
    return "lives_in";
  }
  if (s.includes("part") && s.includes("of")) {
    return "part_of";
  }
  if (s.includes("member") && s.includes("of")) {
    return "member_of";
  }
  if (s.includes("capital") && s.includes("of")) {
    return "capital_of";
  }
  if (s.includes("own")) {
    return "owns";
  }
  if (s.includes("run")) {
    return "runs";
  }
  if (s.includes("join")) {
    return "joined";
  }

  const stopwords = new Set(["is", "was", "are", "were", "been", "has", "have", "had", "the", "a", "an", "also", "be"]);
  const words = s.split(/[\s_]+/).filter(w => w && !stopwords.has(w));
  return words.length > 0 ? words.join("_") : (s.replace(/\s+/g, "_") || "relates_to");
}

export function isDateOrNum(text, entType) {
  if (["DATE", "TIME", "PERCENT", "MONEY", "QUANTITY", "CARDINAL", "ORDINAL"].includes(entType)) {
    return true;
  }
  const clean = text?.trim() || "";
  if (/^\d+$/.test(clean) || /^(18|19|20)\d{2}$/.test(clean)) {
    return true;
  }
  return false;
}

// Named Entity Dictionary & Knowledge Gazetteer
const KNOWN_ENTITIES = [
  // People
  { text: "Steve Jobs", type: "PERSON" },
  { text: "Steve Wozniak", type: "PERSON" },
  { text: "Ronald Wayne", type: "PERSON" },
  { text: "Elon Musk", type: "PERSON" },
  { text: "Tim Cook", type: "PERSON" },
  { text: "Albert Einstein", type: "PERSON" },
  { text: "Marie Curie", type: "PERSON" },
  { text: "Satya Nadella", type: "PERSON" },
  { text: "Bill Gates", type: "PERSON" },
  { text: "Larry Page", type: "PERSON" },
  { text: "Sergey Brin", type: "PERSON" },
  { text: "Sundar Pichai", type: "PERSON" },
  { text: "Jeff Bezos", type: "PERSON" },
  { text: "Mark Zuckerberg", type: "PERSON" },
  { text: "Sam Altman", type: "PERSON" },
  { text: "Alan Turing", type: "PERSON" },
  { text: "Ada Lovelace", type: "PERSON" },

  // Organizations
  { text: "Apple", type: "ORG" },
  { text: "SpaceX", type: "ORG" },
  { text: "Tesla", type: "ORG" },
  { text: "NASA", type: "ORG" },
  { text: "Beats Electronics", type: "ORG" },
  { text: "Microsoft", type: "ORG" },
  { text: "GitHub", type: "ORG" },
  { text: "Google", type: "ORG" },
  { text: "OpenAI", type: "ORG" },
  { text: "Princeton University", type: "ORG" },
  { text: "University of Paris", type: "ORG" },
  { text: "Stanford University", type: "ORG" },
  { text: "MIT", type: "ORG" },
  { text: "Harvard University", type: "ORG" },
  { text: "VESIT", type: "ORG" },

  // Geopolitical Entities / Locations
  { text: "Cupertino", type: "GPE" },
  { text: "Hawthorne", type: "GPE" },
  { text: "California", type: "GPE" },
  { text: "Germany", type: "GPE" },
  { text: "France", type: "GPE" },
  { text: "Paris", type: "GPE" },
  { text: "USA", type: "GPE" },
  { text: "United States", type: "GPE" },
  { text: "Washington", type: "GPE" },
  { text: "New York", type: "GPE" },
  { text: "San Francisco", type: "GPE" },
  { text: "Mumbai", type: "GPE" },
  { text: "India", type: "GPE" },

  // Concepts / Awards / Products
  { text: "Nobel Prize", type: "CONCEPT" },
  { text: "electric vehicles", type: "PRODUCT" },
  { text: "space missions", type: "CONCEPT" },
  { text: "iPhone", type: "PRODUCT" },
  { text: "MacBook", type: "PRODUCT" },
  { text: "Falcon 9", type: "PRODUCT" },
  { text: "Starship", type: "PRODUCT" }
];

/**
 * Preprocesses text for hyphenated verbs like co-founded -> co_founded
 */
export function preprocessText(text) {
  if (!text) return "";
  return text.replace(/\b(co|re|pre|vice)-([a-zA-Z]+)\b/gi, "$1_$2");
}

/**
 * Detects named entities in the text
 */
export function extractEntities(text) {
  const detected = new Map();

  // 1. Gazetteer exact matches
  KNOWN_ENTITIES.forEach(({ text: entityName, type }) => {
    const escaped = entityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text)) {
      const match = text.match(regex);
      const clean = cleanEntityText(match ? match[0] : entityName);
      if (clean && !isDateOrNum(clean, type)) {
        detected.set(clean.toLowerCase(), { Entity: clean, Type: type });
      }
    }
  });

  // 2. Dates / Years
  const yearMatches = text.match(/\b(18|19|20)\d{2}\b/g) || [];
  yearMatches.forEach(y => {
    // Only keep if meaningful
  });

  // 3. Proper noun chunks (Capitalized sequences like "Satya Nadella", "Princeton University")
  const words = text.split(/\s+/);
  const capitalizedChunks = [];
  let currentChunk = [];

  words.forEach(rawWord => {
    const word = cleanEntityText(rawWord);
    if (!word) {
      if (currentChunk.length > 0) {
        capitalizedChunks.push(currentChunk.join(" "));
        currentChunk = [];
      }
      return;
    }
    const isCapital = /^[A-Z][a-zA-Z0-9_-]*$/.test(word);
    const isConnector = ["of", "and", "the", "for", "&"].includes(word.toLowerCase());

    if (isCapital) {
      currentChunk.push(word);
    } else if (isConnector && currentChunk.length > 0) {
      currentChunk.push(word);
    } else {
      if (currentChunk.length > 0) {
        capitalizedChunks.push(currentChunk.join(" "));
        currentChunk = [];
      }
    }
  });
  if (currentChunk.length > 0) capitalizedChunks.push(currentChunk.join(" "));

  const ignoreWords = new Set(["The", "A", "An", "In", "On", "At", "He", "She", "It", "They", "We", "Example", "Step", "Question", "Goal"]);

  capitalizedChunks.forEach(chunk => {
    const clean = cleanEntityText(chunk);
    if (clean.length > 1 && !ignoreWords.has(clean) && !detected.has(clean.toLowerCase())) {
      // Determine type heuristics
      let type = "ENTITY";
      if (clean.includes("University") || clean.includes("Inc") || clean.includes("Corp") || clean.includes("Technologies") || clean.includes("Labs")) {
        type = "ORG";
      } else if (clean.includes("City") || clean.includes("State") || clean.includes("Country")) {
        type = "GPE";
      } else if (clean.split(/\s+/).length >= 2 && !clean.includes("University")) {
        type = "PERSON";
      } else {
        type = "CONCEPT";
      }
      detected.set(clean.toLowerCase(), { Entity: clean, Type: type });
    }
  });

  return Array.from(detected.values());
}

/**
 * Checks for negation in a sentence or clause
 */
export function checkNegation(sentence) {
  const s = sentence.toLowerCase();
  const negationPatterns = [
    /\b(acquired|founded|owned|bought|controlled)\s+by\s+no\s+(company|entity|one|person|corporation)\b/,
    /\bby\s+no\s+company\b/,
    /\b(not|never|neither|nor|none|nobody|nothing|nowhere)\b/,
    /\bno\s+company\b/,
    /\bwas\s+not\b/,
    /\bdid\s+not\b/,
    /\bdoes\s+not\b/
  ];
  return negationPatterns.some(pat => pat.test(s));
}

/**
 * Splits text into individual sentences
 */
export function splitSentences(text) {
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Resolves entity span from token text
 */
function resolveEntity(name, entityMap) {
  const clean = cleanEntityText(name);
  if (!clean) return null;
  const match = entityMap.get(clean.toLowerCase());
  if (match) return match;

  // Check partial
  for (const [key, val] of entityMap.entries()) {
    if (key.includes(clean.toLowerCase()) || clean.toLowerCase().includes(key)) {
      return val;
    }
  }

  // Fallback
  return { Entity: clean, Type: "ENTITY" };
}

/**
 * Core Rule-Based Relationship Extraction from a single sentence
 * Replicating spaCy dependency pattern matching from app.py
 */
export function extractRelationshipsFromSentence(sentText, entityList) {
  const triples = [];
  const entityMap = new Map(entityList.map(e => [e.Entity.toLowerCase(), e]));

  // Check 1: Negation Filter (app.py: is_negated check)
  if (checkNegation(sentText)) {
    return []; // Negative case: No false assertions allowed
  }

  const prepText = preprocessText(sentText);

  // Pattern A: Passive Voice Inversion:
  // "[Patient] was/is/were [verb] by [Agent]" -> (Agent, verb, Patient)
  const passiveRegex = /([A-Z][a-zA-Z0-9_\s&'-]+?)\s+(?:was|is|were|has\s+been)\s+([a-zA-Z_]+(?:\s+by)?)\s+by\s+([A-Z][a-zA-Z0-9_\s&'-]+)/i;
  const passiveMatch = prepText.match(passiveRegex);
  if (passiveMatch) {
    const rawPatient = cleanEntityText(passiveMatch[1]);
    const rawVerb = passiveMatch[2];
    const rawAgent = cleanEntityText(passiveMatch[3]);

    if (!rawAgent.toLowerCase().includes("no company") && !rawAgent.toLowerCase().includes("nobody")) {
      const agentEnt = resolveEntity(rawAgent, entityMap) || { Entity: rawAgent, Type: "PERSON" };
      const patientEnt = resolveEntity(rawPatient, entityMap) || { Entity: rawPatient, Type: "ORG" };

      if (agentEnt.Entity.toLowerCase() !== patientEnt.Entity.toLowerCase()) {
        triples.push({
          subject: agentEnt.Entity,
          subject_type: agentEnt.Type,
          relation: normalizeRelation(rawVerb),
          object: patientEnt.Entity,
          object_type: patientEnt.Type,
          sentence: sentText,
          syntaxPattern: "Passive Voice Inversion"
        });
      }
    }
  }

  // Pattern B: Role / Successor Structure:
  // "Tim Cook succeeded Steve Jobs as CEO of Apple"
  const roleRegex = /([A-Z][a-zA-Z0-9_\s&'-]+?)\s+succeeded\s+([A-Z][a-zA-Z0-9_\s&'-]+?)\s+as\s+([A-Za-z]+)\s+of\s+([A-Z][a-zA-Z0-9_\s&'-]+)/i;
  const roleMatch = prepText.match(roleRegex);
  if (roleMatch) {
    const subjName = cleanEntityText(roleMatch[1]);
    const predName = cleanEntityText(roleMatch[2]);
    const roleName = cleanEntityText(roleMatch[3]);
    const orgName = cleanEntityText(roleMatch[4]);

    const subjEnt = resolveEntity(subjName, entityMap) || { Entity: subjName, Type: "PERSON" };
    const predEnt = resolveEntity(predName, entityMap) || { Entity: predName, Type: "PERSON" };
    const orgEnt = resolveEntity(orgName, entityMap) || { Entity: orgName, Type: "ORG" };

    // Triple 1: (Tim Cook, succeeded, Steve Jobs)
    triples.push({
      subject: subjEnt.Entity,
      subject_type: subjEnt.Type,
      relation: "succeeded",
      object: predEnt.Entity,
      object_type: predEnt.Type,
      sentence: sentText,
      syntaxPattern: "Succession Relation"
    });

    // Triple 2: (Tim Cook, CEO_of, Apple)
    triples.push({
      subject: subjEnt.Entity,
      subject_type: subjEnt.Type,
      relation: normalizeRelation(`${roleName}_of`),
      object: orgEnt.Entity,
      object_type: orgEnt.Type,
      sentence: sentText,
      syntaxPattern: "Role Affiliation"
    });
  }

  // Pattern C: Direct Role Copula:
  // "Satya Nadella is the CEO of Microsoft" / "Tim Cook is CEO of Apple"
  const copulaRoleRegex = /([A-Z][a-zA-Z0-9_\s&'-]+?)\s+(?:is|was|serves\s+as)\s+(?:the\s+)?([A-Za-z]+)\s+of\s+([A-Z][a-zA-Z0-9_\s&'-]+)/i;
  const copulaRoleMatch = prepText.match(copulaRoleRegex);
  if (copulaRoleMatch && !roleMatch) {
    const subjName = cleanEntityText(copulaRoleMatch[1]);
    const roleName = cleanEntityText(copulaRoleMatch[2]);
    const orgName = cleanEntityText(copulaRoleMatch[3]);

    const subjEnt = resolveEntity(subjName, entityMap) || { Entity: subjName, Type: "PERSON" };
    const orgEnt = resolveEntity(orgName, entityMap) || { Entity: orgName, Type: "ORG" };

    triples.push({
      subject: subjEnt.Entity,
      subject_type: subjEnt.Type,
      relation: normalizeRelation(`${roleName}_of`),
      object: orgEnt.Entity,
      object_type: orgEnt.Type,
      sentence: sentText,
      syntaxPattern: "Copular Role Affiliation"
    });
  }

  // Pattern D: Headquartered in / Located in:
  // "SpaceX is headquartered in Hawthorne, California"
  const hqRegex = /([A-Z][a-zA-Z0-9_\s&'-]+?)\s+(?:is|was)\s+headquartered\s+in\s+([A-Z][a-zA-Z0-9_\s&'-]+?)(?:,\s*([A-Z][a-zA-Z0-9_\s&'-]+))?(?:\.|$)/i;
  const hqMatch = prepText.match(hqRegex);
  if (hqMatch) {
    const orgName = cleanEntityText(hqMatch[1]);
    const cityName = cleanEntityText(hqMatch[2]);
    const stateName = cleanEntityText(hqMatch[3]);

    const orgEnt = resolveEntity(orgName, entityMap) || { Entity: orgName, Type: "ORG" };
    const cityEnt = resolveEntity(cityName, entityMap) || { Entity: cityName, Type: "GPE" };

    triples.push({
      subject: orgEnt.Entity,
      subject_type: orgEnt.Type,
      relation: "headquartered_in",
      object: cityEnt.Entity,
      object_type: cityEnt.Type,
      sentence: sentText,
      syntaxPattern: "Headquarters Prepositional"
    });

    if (stateName) {
      const stateEnt = resolveEntity(stateName, entityMap) || { Entity: stateName, Type: "GPE" };
      triples.push({
        subject: cityEnt.Entity,
        subject_type: cityEnt.Type,
        relation: "located_in",
        object: stateEnt.Entity,
        object_type: stateEnt.Type,
        sentence: sentText,
        syntaxPattern: "Appositive Location"
      });
    }
  }

  // Pattern E: Born in / Worked at / Studied at / Won:
  // "Albert Einstein was born in Germany and worked at Princeton University"
  // "Marie Curie studied at University of Paris and won the Nobel Prize"
  const bornRegex = /([A-Z][a-zA-Z0-9_\s&'-]+?)\s+was\s+born\s+in\s+([A-Z][a-zA-Z0-9_\s&'-]+)/i;
  const bornMatch = prepText.match(bornRegex);
  if (bornMatch) {
    const personName = cleanEntityText(bornMatch[1]);
    const locName = cleanEntityText(bornMatch[2]);
    const pEnt = resolveEntity(personName, entityMap) || { Entity: personName, Type: "PERSON" };
    const lEnt = resolveEntity(locName, entityMap) || { Entity: locName, Type: "GPE" };
    triples.push({
      subject: pEnt.Entity,
      subject_type: pEnt.Type,
      relation: "born_in",
      object: lEnt.Entity,
      object_type: lEnt.Type,
      sentence: sentText,
      syntaxPattern: "Prepositional Birthplace"
    });
  }

  const workedRegex = /([A-Z][a-zA-Z0-9_\s&'-]+?)\s+(?:and\s+)?worked\s+at\s+([A-Z][a-zA-Z0-9_\s&'-]+)/i;
  const workedMatch = prepText.match(workedRegex);
  if (workedMatch) {
    const pName = cleanEntityText(workedMatch[1]);
    const orgName = cleanEntityText(workedMatch[2]);
    // If pName is short or conjunction, resolve to subject of sentence
    const subjName = pName.length > 2 ? pName : (bornMatch ? cleanEntityText(bornMatch[1]) : pName);
    const pEnt = resolveEntity(subjName, entityMap) || { Entity: subjName, Type: "PERSON" };
    const oEnt = resolveEntity(orgName, entityMap) || { Entity: orgName, Type: "ORG" };
    triples.push({
      subject: pEnt.Entity,
      subject_type: pEnt.Type,
      relation: "worked_at",
      object: oEnt.Entity,
      object_type: oEnt.Type,
      sentence: sentText,
      syntaxPattern: "Prepositional Employment"
    });
  }

  const studiedRegex = /([A-Z][a-zA-Z0-9_\s&'-]+?)\s+studied\s+at\s+([A-Z][a-zA-Z0-9_\s&'-]+)/i;
  const studiedMatch = prepText.match(studiedRegex);
  if (studiedMatch) {
    const pName = cleanEntityText(studiedMatch[1]);
    const orgName = cleanEntityText(studiedMatch[2]);
    const pEnt = resolveEntity(pName, entityMap) || { Entity: pName, Type: "PERSON" };
    const oEnt = resolveEntity(orgName, entityMap) || { Entity: orgName, Type: "ORG" };
    triples.push({
      subject: pEnt.Entity,
      subject_type: pEnt.Type,
      relation: "studied_at",
      object: oEnt.Entity,
      object_type: oEnt.Type,
      sentence: sentText,
      syntaxPattern: "Prepositional Education"
    });
  }

  const wonRegex = /([A-Z][a-zA-Z0-9_\s&'-]+?)\s+(?:and\s+)?won\s+(?:the\s+)?([A-Za-z0-9_\s&'-]+?)(?:\.|$)/i;
  const wonMatch = prepText.match(wonRegex);
  if (wonMatch) {
    let pName = cleanEntityText(wonMatch[1]);
    if (studiedMatch) pName = cleanEntityText(studiedMatch[1]);
    const awardName = cleanEntityText(wonMatch[2]);
    const pEnt = resolveEntity(pName, entityMap) || { Entity: pName, Type: "PERSON" };
    const aEnt = resolveEntity(awardName, entityMap) || { Entity: awardName, Type: "CONCEPT" };
    triples.push({
      subject: pEnt.Entity,
      subject_type: pEnt.Type,
      relation: "won",
      object: aEnt.Entity,
      object_type: aEnt.Type,
      sentence: sentText,
      syntaxPattern: "Predicate Direct Object"
    });
  }

  // Pattern F: Active Voice Foundation / Co-Founding:
  // "Steve Wozniak co_founded Apple." / "Elon Musk founded SpaceX in 2002."
  const foundRegex = /([A-Z][a-zA-Z0-9_\s&'-]+?)\s+(co_founded|co-founded|cofounded|founded)\s+([A-Z][a-zA-Z0-9_\s&'-]+?)(?:\s+in\s+\d{4})?(?:\.|$)/i;
  const foundMatch = prepText.match(foundRegex);
  if (foundMatch && !passiveMatch) {
    const subjName = cleanEntityText(foundMatch[1]);
    const relWord = foundMatch[2];
    const objName = cleanEntityText(foundMatch[3]);

    const sEnt = resolveEntity(subjName, entityMap) || { Entity: subjName, Type: "PERSON" };
    const oEnt = resolveEntity(objName, entityMap) || { Entity: objName, Type: "ORG" };

    if (sEnt.Entity.toLowerCase() !== oEnt.Entity.toLowerCase()) {
      triples.push({
        subject: sEnt.Entity,
        subject_type: sEnt.Type,
        relation: normalizeRelation(relWord),
        object: oEnt.Entity,
        object_type: oEnt.Type,
        sentence: sentText,
        syntaxPattern: "Active Voice nsubj-dobj"
      });
    }
  }

  // Pattern G: Acquisition:
  // "Apple acquired Beats Electronics in 2014." / "Microsoft acquired GitHub in 2018."
  const acquireRegex = /([A-Z][a-zA-Z0-9_\s&'-]+?)\s+acquired\s+([A-Z][a-zA-Z0-9_\s&'-]+?)(?:\s+in\s+\d{4})?(?:\.|$)/i;
  const acquireMatch = prepText.match(acquireRegex);
  if (acquireMatch && !passiveMatch) {
    const subjName = cleanEntityText(acquireMatch[1]);
    const objName = cleanEntityText(acquireMatch[2]);

    const sEnt = resolveEntity(subjName, entityMap) || { Entity: subjName, Type: "ORG" };
    const oEnt = resolveEntity(objName, entityMap) || { Entity: objName, Type: "ORG" };

    triples.push({
      subject: sEnt.Entity,
      subject_type: sEnt.Type,
      relation: "acquired",
      object: oEnt.Entity,
      object_type: oEnt.Type,
      sentence: sentText,
      syntaxPattern: "Direct Object Acquisition"
    });
  }

  // Pattern H: Partnership:
  // "NASA partnered with SpaceX for space missions."
  const partnerRegex = /([A-Z][a-zA-Z0-9_\s&'-]+?)\s+partnered\s+with\s+([A-Z][a-zA-Z0-9_\s&'-]+)/i;
  const partnerMatch = prepText.match(partnerRegex);
  if (partnerMatch) {
    const sName = cleanEntityText(partnerMatch[1]);
    const oName = cleanEntityText(partnerMatch[2]);
    const sEnt = resolveEntity(sName, entityMap) || { Entity: sName, Type: "ORG" };
    const oEnt = resolveEntity(oName, entityMap) || { Entity: oName, Type: "ORG" };
    triples.push({
      subject: sEnt.Entity,
      subject_type: sEnt.Type,
      relation: "partner_with",
      object: oEnt.Entity,
      object_type: oEnt.Type,
      sentence: sentText,
      syntaxPattern: "Prepositional Partner Attachment"
    });
  }

  // Pattern I: Leadership / Leads:
  // "Elon Musk also leads Tesla, which manufactures electric vehicles."
  const leadsRegex = /([A-Z][a-zA-Z0-9_\s&'-]+?)\s+(?:also\s+)?leads\s+([A-Z][a-zA-Z0-9_\s&'-]+)/i;
  const leadsMatch = prepText.match(leadsRegex);
  if (leadsMatch) {
    const sName = cleanEntityText(leadsMatch[1]);
    const oName = cleanEntityText(leadsMatch[2]);
    const sEnt = resolveEntity(sName, entityMap) || { Entity: sName, Type: "PERSON" };
    const oEnt = resolveEntity(oName, entityMap) || { Entity: oName, Type: "ORG" };
    triples.push({
      subject: sEnt.Entity,
      subject_type: sEnt.Type,
      relation: "leads",
      object: oEnt.Entity,
      object_type: oEnt.Type,
      sentence: sentText,
      syntaxPattern: "Leadership Predicate"
    });
  }

  // Pattern J: Relative Clause / Manufactures:
  // "which manufactures electric vehicles" / "Tesla manufactures electric vehicles"
  const manufRegex = /(?:([A-Z][a-zA-Z0-9_\s&'-]+?)(?:,\s*which|\s+)|\bwhich\s+)manufactures\s+([a-zA-Z0-9_\s&'-]+?)(?:\.|$)/i;
  const manufMatch = prepText.match(manufRegex);
  if (manufMatch) {
    let sName = cleanEntityText(manufMatch[1]);
    if (!sName && leadsMatch) {
      sName = cleanEntityText(leadsMatch[2]); // Antecedent resolution: "leads Tesla, which manufactures..." -> Tesla
    }
    const oName = cleanEntityText(manufMatch[2]);
    if (sName && oName) {
      const sEnt = resolveEntity(sName, entityMap) || { Entity: sName, Type: "ORG" };
      const oEnt = resolveEntity(oName, entityMap) || { Entity: oName, Type: "PRODUCT" };
      triples.push({
        subject: sEnt.Entity,
        subject_type: sEnt.Type,
        relation: "manufactures",
        object: oEnt.Entity,
        object_type: oEnt.Type,
        sentence: sentText,
        syntaxPattern: "Relative Clause Extraction"
      });
    }
  }

  // Pattern K: Appositive Location:
  // "Cupertino, California" (only if not already captured)
  const apposRegex = /([A-Z][a-zA-Z0-9_]+),\s+([A-Z][a-zA-Z0-9_]+)/g;
  let apposMatch;
  while ((apposMatch = apposRegex.exec(prepText)) !== null) {
    const headText = cleanEntityText(apposMatch[1]);
    const apposText = cleanEntityText(apposMatch[2]);
    if (headText && apposText && headText.toLowerCase() !== apposText.toLowerCase()) {
      const hEnt = resolveEntity(headText, entityMap) || { Entity: headText, Type: "GPE" };
      const aEnt = resolveEntity(apposText, entityMap) || { Entity: apposText, Type: "GPE" };
      if (!triples.some(t => t.subject === hEnt.Entity && t.object === aEnt.Entity && t.relation === "located_in")) {
        triples.push({
          subject: hEnt.Entity,
          subject_type: hEnt.Type,
          relation: "located_in",
          object: aEnt.Entity,
          object_type: aEnt.Type,
          sentence: sentText,
          syntaxPattern: "Appositive Location"
        });
      }
    }
  }

  // Deduplicate triples and clean
  const seen = new Set();
  const unique = [];
  triples.forEach(t => {
    const s = cleanEntityText(t.subject);
    const o = cleanEntityText(t.object);
    const r = t.relation;
    if (s && o && s.toLowerCase() !== o.toLowerCase()) {
      const key = `${s.toLowerCase()}:::${r.toLowerCase()}:::${o.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push({
          subject: s,
          subject_type: t.subject_type || "ENTITY",
          relation: r,
          object: o,
          object_type: t.object_type || "ENTITY",
          sentence: t.sentence || sentText,
          syntaxPattern: t.syntaxPattern || "Syntactic Dependency"
        });
      }
    }
  });

  return unique;
}

/**
 * Runs full Relationship Extraction pipeline on arbitrary input text
 */
export function runExtractionPipeline(rawText) {
  const cleanText = rawText?.trim() || "";
  if (!cleanText) {
    return {
      text: "",
      entities: [],
      triples: [],
      sentences: []
    };
  }

  const sentences = splitSentences(cleanText);
  const entities = extractEntities(cleanText);

  const allTriples = [];
  sentences.forEach(sent => {
    const sentTriples = extractRelationshipsFromSentence(sent, entities);
    allTriples.push(...sentTriples);
  });

  // Global deduplication
  const seen = new Set();
  const uniqueTriples = [];
  allTriples.forEach(t => {
    const key = `${t.subject.toLowerCase()}:::${t.relation.toLowerCase()}:::${t.object.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueTriples.push(t);
    }
  });

  return {
    text: cleanText,
    entities,
    triples: uniqueTriples,
    sentences
  };
}

/**
 * Generates CSV string from extracted triples
 */
export function triplesToCSV(triples) {
  if (!triples || triples.length === 0) return "Subject,Relationship,Object\n";
  const rows = [
    ["Subject", "Relationship", "Object"],
    ...triples.map(t => [
      `"${(t.subject || "").replace(/"/g, '""')}"`,
      `"${(t.relation || "").replace(/"/g, '""')}"`,
      `"${(t.object || "").replace(/"/g, '""')}"`
    ])
  ];
  return rows.map(r => r.join(",")).join("\n");
}

/**
 * Generates JSON string from extracted triples
 */
export function triplesToJSON(triples) {
  if (!triples) return "[]";
  const formatted = triples.map(t => ({
    Subject: t.subject,
    Relationship: t.relation,
    Object: t.object
  }));
  return JSON.stringify(formatted, null, 2);
}
