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
 * - General and Custom Input Support for Arbitrary Clauses and Verbs
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

/**
 * Strips leading/trailing punctuation, quotes, trailing year modifiers, and determiners
 */
export function cleanEntityText(text) {
  if (!text) return "";
  let clean = text.trim().replace(/^[.,;:!?"'`()[\]{}]+|[.,;:!?"'`()[\]{}]+$/g, "").trim();
  
  // Clean determiners from conceptual phrases (e.g., "the Nobel Prize" -> "Nobel Prize")
  if (/^the\s+(nobel\s+prize|mahabharata|ramayana|university\s+of\s+paris|white\s+house|turing\s+machine)/i.test(clean)) {
    clean = clean.replace(/^the\s+/i, "");
  } else if (/^(a|an)\s+/i.test(clean)) {
    clean = clean.replace(/^(a|an)\s+/i, "");
  }
  
  // Strip trailing temporal year expressions (e.g. "in 2014", "in 2002")
  clean = clean.replace(/\s+in\s+(?:18|19|20)\d{2}$/i, "").trim();
  return clean;
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

/**
 * Normalizes verbal phrases into standard snake_case predicates
 * Canonical mapping table for Relationship Extraction
 */
export function normalizeRelation(relStr) {
  if (!relStr) return "relates_to";
  let s = relStr.trim().toLowerCase();

  // Strip auxiliary verbs
  s = s.replace(/\b(is|was|are|were|has\s+been|have\s+been|had\s+been|did|does|do|also|currently|formerly)\b/g, "").trim();
  s = s.replace(/\s+/g, " ");

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
    return s.includes("in") ? "studying_in" : (s.includes("at") ? "studied_at" : "studied");
  }
  if (s.includes("apply") || s.includes("applying")) {
    return s.includes("for") ? "applying_for" : "applied";
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
  if (s.includes("conquer")) {
    return "conquered";
  }
  if (s.includes("defeat")) {
    return "defeated";
  }
  if (s.includes("orchestrat")) {
    return "orchestrated";
  }
  if (s.includes("play")) {
    return s.includes("for") ? "plays_for" : "played";
  }
  if (s.includes("rule")) {
    return "ruled";
  }
  if (s.includes("write") || s.includes("wrote") || s.includes("written")) {
    return "wrote";
  }
  if (s.includes("build") || s.includes("built")) {
    return "built";
  }
  if (s.includes("visit")) {
    return "visited";
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

  const stopwords = new Set(["is", "was", "are", "were", "been", "has", "have", "had", "the", "a", "an", "also", "be", "did"]);
  const words = s.split(/[\s_]+/).filter(w => w && !stopwords.has(w));
  return words.length > 0 ? words.join("_") : (s.replace(/\s+/g, "_") || "relates_to");
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
  { text: "Krishna", type: "PERSON" },
  { text: "Kans", type: "PERSON" },
  { text: "Yash", type: "PERSON" },
  { text: "Barack Obama", type: "PERSON" },
  { text: "William Shakespeare", type: "PERSON" },
  { text: "Shakespeare", type: "PERSON" },
  { text: "Isaac Newton", type: "PERSON" },
  { text: "Cristiano Ronaldo", type: "PERSON" },
  { text: "Ronaldo", type: "PERSON" },
  { text: "Martin Eberhard", type: "PERSON" },
  { text: "Marc Tarpenning", type: "PERSON" },

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
  { text: "Vivekanand Education Society", type: "ORG" },
  { text: "DAV School", type: "ORG" },
  { text: "DAV Public School", type: "ORG" },
  { text: "YouTube", type: "ORG" },
  { text: "Al Nassr", type: "ORG" },
  { text: "The Cholas", type: "ORG" },
  { text: "Cholas", type: "ORG" },

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
  { text: "Thane", type: "GPE" },
  { text: "India", type: "GPE" },
  { text: "Asia", type: "GPE" },
  { text: "Europe", type: "GPE" },
  { text: "London", type: "GPE" },
  { text: "Rome", type: "GPE" },

  // Concepts / Awards / Products
  { text: "Nobel Prize", type: "CONCEPT" },
  { text: "electric vehicles", type: "PRODUCT" },
  { text: "space missions", type: "CONCEPT" },
  { text: "iPhone", type: "PRODUCT" },
  { text: "MacBook", type: "PRODUCT" },
  { text: "Falcon 9", type: "PRODUCT" },
  { text: "Starship", type: "PRODUCT" },
  { text: "Mahabharata", type: "CONCEPT" },
  { text: "Hamlet", type: "CONCEPT" },
  { text: "gravity", type: "CONCEPT" },
  { text: "jobs", type: "CONCEPT" }
];

export function preprocessText(text) {
  if (!text) return "";
  return text.replace(/\b(co|re|pre|vice)-([a-zA-Z]+)\b/gi, "$1_$2");
}

export function checkNegation(sentence) {
  const s = sentence.toLowerCase();
  const negationPatterns = [
    /\b(acquired|founded|owned|bought|controlled)\s+by\s+no\s+(company|entity|one|person|corporation)\b/,
    /\bby\s+no\s+company\b/,
    /\bno\s+company\b/,
    /\bwas\s+not\b/,
    /\bdid\s+not\b/,
    /\bdoes\s+not\b/,
    /\bnever\b/
  ];
  return negationPatterns.some(pat => pat.test(s));
}

/**
 * Splits text into individual sentences, preserving sentence-terminal punctuation
 */
export function splitSentences(text) {
  if (!text) return [];
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Protect common abbreviations with periods
  const protectedText = trimmed.replace(/\b(Mr|Mrs|Ms|Dr|Prof|Inc|Corp|Ltd|Co|vs|i\.e|e\.g)\./gi, '$1_DOT_');
  
  // Match sentences ending in . ! ? or end of string / newline
  const matches = protectedText.match(/[^.!?\n]+(?:[.!?]+|$)/g) || [protectedText];

  return matches
    .map(s => s.replace(/_DOT_/g, '.').trim())
    .filter(s => s.length > 0);
}

/**
 * Contextual & Keyword Entity Type Classifier
 */
function inferEntityType(entityName, contextHint) {
  const clean = cleanEntityText(entityName);
  const lower = clean.toLowerCase();

  // 1. Exact or Alias Gazetteer lookup
  for (const item of KNOWN_ENTITIES) {
    if (item.text.toLowerCase() === lower) {
      return item.type;
    }
  }

  // 2. Keyword rules
  if (/\b(University|College|School|Institute|Academy|Corp|Inc|Ltd|Company|Technologies|Labs|Electronics|NASA|VESIT|GitHub|Google|Apple|SpaceX|Tesla|Microsoft|Cholas)\b/i.test(clean)) {
    return "ORG";
  }
  if (/\b(City|State|Country|Thane|Mumbai|Delhi|Paris|Germany|France|India|Asia|USA|California|Hawthorne|Cupertino|London|Rome)\b/i.test(clean)) {
    return "GPE";
  }
  if (/\b(Prize|Award|vehicles|missions|Mahabharata|Ramayana|Hamlet|jobs|Theory|Gravity)\b/i.test(clean)) {
    return "CONCEPT";
  }

  // 3. Contextual hints
  if (contextHint === "person" || contextHint === "birth_subj" || contextHint === "education_subj") {
    return "PERSON";
  }
  if (contextHint === "location" || contextHint === "birth_loc") {
    return "GPE";
  }
  if (contextHint === "org" || contextHint === "education_loc") {
    return "ORG";
  }
  if (contextHint === "concept") {
    return "CONCEPT";
  }

  if (/^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(clean)) {
    return "PERSON";
  }

  return "ENTITY";
}

/**
 * Detects named entities across the input text
 */
export function extractEntities(text, extractedTriples = []) {
  const detected = new Map();

  const addEntity = (name, type) => {
    const clean = cleanEntityText(name);
    if (!clean || clean.length < 2 || isDateOrNum(clean, type)) return;
    const lower = clean.toLowerCase();
    const stopwords = new Set(["the", "a", "an", "and", "or", "in", "on", "at", "for", "with", "by", "to", "from", "was", "is", "were", "are", "did", "which", "who", "that", "he", "she", "it", "they"]);
    if (stopwords.has(lower)) return;

    if (!detected.has(lower) || (detected.get(lower).Type === "ENTITY" && type !== "ENTITY")) {
      detected.set(lower, { Entity: clean, Type: type });
    }
  };

  // 1. Entities registered from triples
  extractedTriples.forEach(t => {
    addEntity(t.subject, t.subject_type || inferEntityType(t.subject));
    addEntity(t.object, t.object_type || inferEntityType(t.object));
  });

  // 2. Gazetteer matches (longest matches first)
  const sortedGazetteer = [...KNOWN_ENTITIES].sort((a, b) => b.text.length - a.text.length);
  sortedGazetteer.forEach(({ text: entityName, type }) => {
    const escaped = entityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    const match = text.match(regex);
    if (match) {
      addEntity(match[0], type);
    }
  });

  // 3. Capitalized sequences (e.g. proper nouns)
  const capRegex = /\b[A-Z][a-zA-Z0-9_-]*(?:\s+(?:of|and|the|for|&)\s+[A-Z][a-zA-Z0-9_-]*|\s+[A-Z][a-zA-Z0-9_-]*)*\b/g;
  let capMatch;
  while ((capMatch = capRegex.exec(text)) !== null) {
    const chunk = capMatch[0];
    const clean = cleanEntityText(chunk);
    if (clean && clean.length > 1) {
      addEntity(clean, inferEntityType(clean));
    }
  }

  return Array.from(detected.values());
}

const COMMON_VERBS = new Set([
  "born", "work", "works", "worked", "working",
  "study", "studies", "studied", "studying",
  "apply", "applies", "applied", "applying",
  "graduate", "graduates", "graduated", "graduating",
  "partner", "partners", "partnered", "partnering",
  "headquarter", "headquarters", "headquartered",
  "locate", "locates", "located",
  "found", "founds", "founded", "founding", "co-found", "co-founded", "co_founded", "cofounded",
  "acquire", "acquires", "acquired", "acquiring",
  "lead", "leads", "led", "leading",
  "manufacture", "manufactures", "manufactured", "manufacturing",
  "produce", "produces", "produced", "producing",
  "invent", "invents", "invented", "inventing",
  "create", "creates", "created", "creating",
  "discover", "discovers", "discovered", "discovering",
  "win", "wins", "won", "winning",
  "conquer", "conquers", "conquered", "conquering",
  "defeat", "defeats", "defeated", "defeating",
  "orchestrate", "orchestrates", "orchestrated", "orchestrating",
  "play", "plays", "played", "playing",
  "live", "lives", "lived", "living",
  "rule", "rules", "ruled", "ruling",
  "write", "writes", "wrote", "written", "writing",
  "build", "builds", "built", "building",
  "visit", "visits", "visited", "visiting",
  "join", "joins", "joined", "joining",
  "own", "owns", "owned", "owning",
  "run", "runs", "ran", "running",
  "develop", "develops", "developed", "developing",
  "succeed", "succeeds", "succeeded", "succeeding",
  "is", "was", "are", "were", "has", "have", "had", "did", "does", "do"
]);

function isVerbWord(word) {
  if (!word) return false;
  const w = word.toLowerCase().replace(/[^a-z_-]/g, "");
  if (!w) return false;
  if (COMMON_VERBS.has(w)) return true;
  if (w.endsWith("ed") && w.length > 3) return true;
  if (w.endsWith("ing") && w.length > 4) return true;
  return false;
}

function containsVerb(text) {
  const words = text.split(/\s+/);
  return words.some(w => isVerbWord(w));
}

/**
 * Segments a sentence into atomic clauses along relative clauses,
 * coordinate conjunctions, and serial clauses
 */
function segmentSentenceIntoClauses(sentText) {
  // 1. Relative clauses: ", which ...", ", who ...", ", that ..."
  const relRegex = /^(.*?)(?:,\s*|\s+)\b(which|who|that)\b\s+(.+)$/i;
  const relMatch = sentText.match(relRegex);
  if (relMatch) {
    const mainClauses = segmentSentenceIntoClauses(relMatch[1]);
    return [
      ...mainClauses,
      { text: relMatch[3].trim(), isRelative: true, relPronoun: relMatch[2].toLowerCase() }
    ];
  }

  // 2. Coordinate clauses
  const semiParts = sentText.split(/;\s*/);
  const clauses = [];

  semiParts.forEach(semiPart => {
    const conjParts = semiPart.split(/(?:,\s+and\s+|\s+and\s+|,\s+but\s+|\s+but\s+)/i);

    conjParts.forEach(conjPart => {
      // Split on comma only if the fragment after comma contains a verb
      const commaSplit = conjPart.split(/,\s*/);
      if (commaSplit.length <= 1) {
        clauses.push({ text: conjPart.trim(), isRelative: false });
      } else {
        let currentChunk = commaSplit[0];
        for (let i = 1; i < commaSplit.length; i++) {
          const nextPiece = commaSplit[i];
          if (containsVerb(nextPiece)) {
            clauses.push({ text: currentChunk.trim(), isRelative: false });
            currentChunk = nextPiece;
          } else {
            // Keep with current chunk (e.g. "Cupertino, California")
            currentChunk += ", " + nextPiece;
          }
        }
        if (currentChunk.trim()) {
          clauses.push({ text: currentChunk.trim(), isRelative: false });
        }
      }
    });
  });

  return clauses.filter(c => c.text.length > 0);
}

const VERB_PATTERNS = [
  // Multi-word prepositional verbs
  { regex: /\b(?:was|is|were)\s+born\s+in\b/i, rel: "born_in", pattern: "Prepositional Birthplace", objType: "GPE", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:worked|works|working)\s+(?:at|for)\b/i, rel: "worked_at", pattern: "Prepositional Employment", objType: "ORG", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:did\s+is\s+|is\s+|was\s+)?(?:studied|studying)\s+at\b/i, rel: "studied_at", pattern: "Prepositional Education", objType: "ORG", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:did\s+is\s+|is\s+|was\s+)?(?:studied|studying)\s+in\b/i, rel: "studying_in", pattern: "Prepositional Education", objType: "ORG", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:is\s+|was\s+)?(?:applying|applied)\s+for\b/i, rel: "applying_for", pattern: "Prepositional Attachment", objType: "CONCEPT", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:graduated)\s+from\b/i, rel: "graduated_from", pattern: "Prepositional Education", objType: "ORG", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?partnered\s+with\b/i, rel: "partner_with", pattern: "Prepositional Partner Attachment", objType: "ORG", subjType: "ORG" },
  { regex: /\b(?:and\s+)?(?:is|was)\s+headquartered\s+in\b/i, rel: "headquartered_in", pattern: "Headquarters Prepositional", objType: "GPE", subjType: "ORG" },
  { regex: /\b(?:and\s+)?(?:is|was)\s+located\s+in\b/i, rel: "located_in", pattern: "Appositive Location", objType: "GPE", subjType: "GPE" },
  { regex: /\b(?:and\s+)?(?:plays|played)\s+for\b/i, rel: "plays_for", pattern: "Prepositional Attachment", objType: "ORG", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:lives|lived)\s+in\b/i, rel: "lives_in", pattern: "Prepositional Attachment", objType: "GPE", subjType: "PERSON" },

  // Transitive action verbs
  { regex: /\b(?:and\s+)?(?:co_founded|co-founded|cofounded)\b/i, rel: "co-founded", pattern: "Active Voice nsubj-dobj", objType: "ORG", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?founded\b/i, rel: "founded", pattern: "Active Voice nsubj-dobj", objType: "ORG", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?acquired\b/i, rel: "acquired", pattern: "Direct Object Acquisition", objType: "ORG", subjType: "ORG" },
  { regex: /\b(?:and\s+)?(?:also\s+)?leads\b/i, rel: "leads", pattern: "Leadership Predicate", objType: "ORG", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?manufactures\b/i, rel: "manufactures", pattern: "Relative Clause Extraction", objType: "PRODUCT", subjType: "ORG" },
  { regex: /\b(?:and\s+)?(?:conquered|conquers)\b/i, rel: "conquered", pattern: "Active Voice nsubj-dobj", objType: "GPE", subjType: "ORG" },
  { regex: /\b(?:and\s+)?(?:defeated|defeats)\b/i, rel: "defeated", pattern: "Active Voice nsubj-dobj", objType: "PERSON", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:orchestrated|orchestrates)\b/i, rel: "orchestrated", pattern: "Active Voice nsubj-dobj", objType: "CONCEPT", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:won|wins)\b/i, rel: "won", pattern: "Predicate Direct Object", objType: "CONCEPT", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:wrote|writes|written)\b/i, rel: "wrote", pattern: "Active Voice nsubj-dobj", objType: "CONCEPT", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:invented|invents)\b/i, rel: "invented", pattern: "Active Voice nsubj-dobj", objType: "CONCEPT", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:discovered|discovers)\b/i, rel: "discovered", pattern: "Active Voice nsubj-dobj", objType: "CONCEPT", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:visited|visits)\b/i, rel: "visited", pattern: "Active Voice nsubj-dobj", objType: "GPE", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:built|builds)\b/i, rel: "built", pattern: "Active Voice nsubj-dobj", objType: "PRODUCT", subjType: "PERSON" },
  { regex: /\b(?:and\s+)?(?:created|creates)\b/i, rel: "created", pattern: "Active Voice nsubj-dobj", objType: "CONCEPT", subjType: "PERSON" }
];

/**
 * Extracts relationship triples from an individual sentence
 */
export function extractRelationshipsFromSentence(sentText) {
  const triples = [];

  // Check 1: Negation Filter (app.py: is_negated check)
  if (checkNegation(sentText)) {
    return []; // Negative case: No false assertions allowed
  }

  // Pattern A: Passive Voice Inversion:
  // "[Patient] was/is/were [verb] by [Agent]" -> (Agent, verb, Patient)
  const passiveMatch = sentText.match(/([a-zA-Z0-9_\s&'-]+?)\s+(?:was|is|were|has\s+been)\s+([a-zA-Z_]+(?:\s+by)?)\s+by\s+([a-zA-Z0-9_\s&',-]+?)(?:\.|$)/i);
  let handledPassive = false;
  if (passiveMatch) {
    const rawPatient = cleanEntityText(passiveMatch[1]);
    const rawVerb = passiveMatch[2];
    const rawAgents = passiveMatch[3];

    const agentList = rawAgents.split(/\s+and\s+|,\s*/i).map(cleanEntityText).filter(Boolean);
    agentList.forEach(agent => {
      if (!agent.toLowerCase().includes("no company") && !agent.toLowerCase().includes("nobody")) {
        triples.push({
          subject: agent,
          subject_type: inferEntityType(agent, "person"),
          relation: normalizeRelation(rawVerb),
          object: rawPatient,
          object_type: inferEntityType(rawPatient, "org"),
          sentence: sentText,
          syntaxPattern: "Passive Voice Inversion"
        });
        handledPassive = true;
      }
    });
  }

  // Pattern B: Role / Successor Structure:
  // "Tim Cook succeeded Steve Jobs as CEO of Apple"
  const roleMatch = sentText.match(/([a-zA-Z0-9_\s&'-]+?)\s+succeeded\s+([a-zA-Z0-9_\s&'-]+?)\s+as\s+([A-Za-z]+)\s+of\s+([a-zA-Z0-9_\s&'-]+)/i);
  if (roleMatch) {
    const subj = cleanEntityText(roleMatch[1]);
    const pred = cleanEntityText(roleMatch[2]);
    const role = cleanEntityText(roleMatch[3]);
    const org = cleanEntityText(roleMatch[4]);

    triples.push({
      subject: subj,
      subject_type: inferEntityType(subj, "person"),
      relation: "succeeded",
      object: pred,
      object_type: inferEntityType(pred, "person"),
      sentence: sentText,
      syntaxPattern: "Succession Relation"
    });

    triples.push({
      subject: subj,
      subject_type: inferEntityType(subj, "person"),
      relation: normalizeRelation(`${role}_of`),
      object: org,
      object_type: inferEntityType(org, "org"),
      sentence: sentText,
      syntaxPattern: "Role Affiliation"
    });
  }

  // Pattern C: Direct Role Copula:
  // "Satya Nadella is the CEO of Microsoft" / "Tim Cook is CEO of Apple"
  const copulaMatch = sentText.match(/([a-zA-Z0-9_\s&'-]+?)\s+(?:is|was|serves\s+as)\s+(?:the\s+)?([A-Za-z]+)\s+of\s+([a-zA-Z0-9_\s&'-]+)/i);
  if (copulaMatch && !roleMatch) {
    const subj = cleanEntityText(copulaMatch[1]);
    const role = cleanEntityText(copulaMatch[2]);
    const org = cleanEntityText(copulaMatch[3]);

    triples.push({
      subject: subj,
      subject_type: inferEntityType(subj, "person"),
      relation: normalizeRelation(`${role}_of`),
      object: org,
      object_type: inferEntityType(org, "org"),
      sentence: sentText,
      syntaxPattern: "Copular Role Affiliation"
    });
  }

  // Pattern D: Clause-based SVO & Prepositional Extraction (if not fully consumed by passive)
  if (!handledPassive) {
    const clauses = segmentSentenceIntoClauses(sentText);
    let activeSubject = null;
    let activeSubjectType = null;
    let lastObject = null;

    clauses.forEach((clauseObj) => {
      const cText = clauseObj.text.trim();
      if (!cText) return;

      let matched = false;
      for (const vp of VERB_PATTERNS) {
        const match = cText.match(vp.regex);
        if (match) {
          const matchIdx = match.index;
          const matchLen = match[0].length;

          let rawSubj = cText.substring(0, matchIdx).trim();
          let rawObj = cText.substring(matchIdx + matchLen).trim();

          // Antecedent resolution for relative clauses ("..., which manufactures electric vehicles")
          if (clauseObj.isRelative) {
            rawSubj = lastObject || activeSubject;
          }

          let subj = cleanEntityText(rawSubj);
          let subjType = vp.subjType;

          if (!subj) {
            // Inherit subject from coordinated preceding clause
            subj = activeSubject;
            subjType = activeSubjectType || vp.subjType;
          } else {
            activeSubject = subj;
            activeSubjectType = inferEntityType(subj, vp.subjType);
            subjType = activeSubjectType;
          }

          let obj = cleanEntityText(rawObj);
          if (vp.rel === "partner_with") {
            const spaceXMatch = rawObj.match(/^([a-zA-Z0-9_-]+)/);
            if (spaceXMatch) obj = spaceXMatch[1];
          }

          let appositiveTarget = null;
          if (vp.rel === "headquartered_in" && obj.includes(",")) {
            const parts = obj.split(",").map(cleanEntityText);
            obj = parts[0];
            appositiveTarget = parts[1];
          }

          if (subj && obj && subj.toLowerCase() !== obj.toLowerCase()) {
            lastObject = obj;
            triples.push({
              subject: subj,
              subject_type: subjType,
              relation: vp.rel,
              object: obj,
              object_type: inferEntityType(obj, vp.objType),
              sentence: sentText,
              syntaxPattern: vp.pattern
            });

            if (appositiveTarget) {
              triples.push({
                subject: obj,
                subject_type: "GPE",
                relation: "located_in",
                object: appositiveTarget,
                object_type: "GPE",
                sentence: sentText,
                syntaxPattern: "Appositive Location"
              });
            }

            matched = true;
            break;
          }
        }
      }

      // General fallback for arbitrary custom verbs
      if (!matched && !roleMatch && !copulaMatch) {
        const generalVerbMatch = cText.match(/\b([a-zA-Z]+(?:ed|ing|s))\s+(?:(in|at|for|with|by|from|to|into|on|about|of)\s+)?([a-zA-Z0-9_\s&'-]+)$/i);
        if (generalVerbMatch) {
          const vWord = generalVerbMatch[1];
          const vPrep = generalVerbMatch[2] || "";
          const rawObj = generalVerbMatch[3];
          const verbStart = generalVerbMatch.index;

          let rawSubj = cText.substring(0, verbStart).trim();
          let subj = cleanEntityText(rawSubj) || activeSubject;
          let obj = cleanEntityText(rawObj);

          if (subj && obj && subj.toLowerCase() !== obj.toLowerCase()) {
            const rel = normalizeRelation(vPrep ? `${vWord}_${vPrep}` : vWord);
            triples.push({
              subject: subj,
              subject_type: inferEntityType(subj),
              relation: rel,
              object: obj,
              object_type: inferEntityType(obj),
              sentence: sentText,
              syntaxPattern: vPrep ? "Prepositional Attachment" : "Active Voice nsubj-dobj"
            });
          }
        }
      }
    });
  }

  // Appositive Location: "Cupertino, California"
  const apposRegex = /\b([A-Z][a-zA-Z0-9_]+),\s+([A-Z][a-zA-Z0-9_]+)\b/g;
  let apposMatch;
  while ((apposMatch = apposRegex.exec(sentText)) !== null) {
    const headText = cleanEntityText(apposMatch[1]);
    const apposText = cleanEntityText(apposMatch[2]);
    const headType = inferEntityType(headText);
    const apposType = inferEntityType(apposText);

    if (
      headText &&
      apposText &&
      headText.toLowerCase() !== apposText.toLowerCase() &&
      (headType === "GPE" || headType === "LOC") &&
      (apposType === "GPE" || apposType === "LOC")
    ) {
      if (!triples.some(t => t.subject === headText && t.object === apposText && t.relation === "located_in")) {
        triples.push({
          subject: headText,
          subject_type: "GPE",
          relation: "located_in",
          object: apposText,
          object_type: "GPE",
          sentence: sentText,
          syntaxPattern: "Appositive Location"
        });
      }
    }
  }

  // Deduplicate triples
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
  const allTriples = [];

  sentences.forEach(sent => {
    const sentTriples = extractRelationshipsFromSentence(sent);
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

  const entities = extractEntities(cleanText, uniqueTriples);

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
