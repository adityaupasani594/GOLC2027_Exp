/**
 * Graph Query Engine & Educational Dataset
 * Experiment 12: Query Knowledge Graphs with Pattern-Based Queries
 * Knowledge Graphs & Information Retrieval Systems (KGIRS)
 */

export const EXPERIMENT_CONFIG = {
  expNo: 12,
  title: "Query Knowledge Graphs with Pattern-Based Queries",
  course: "Knowledge Graphs & Information Retrieval Systems (KGIRS)",
  courseCode: "CS-KGIRS-12",
  targetRolls: "Roll Numbers 11 – 15 (Division C)",
  objectives: [
    "Understand graph database concepts: nodes, relationships, properties, and labels.",
    "Write and interpret pattern-based queries using MATCH, WHERE, RETURN, ORDER BY and LIMIT.",
    "Perform multi-hop traversals and filtered pattern matches over a knowledge graph.",
    "Retrieve and interpret meaningful information (lists, paths, counts) from a knowledge graph."
  ]
};

export const THEORY_CONTENT = {
  background: `### 1. Overview & Principles of Knowledge Graphs
A **Knowledge Graph** stores facts as a network of connected entities. Instead of rows isolated in relational tables requiring expensive multiple JOIN operations, information is modelled as **nodes** (the entities—people, movies, organizations, cities) joined by **relationships** (directed, typed semantic edges linking them—such as *ACTED_IN*, *DIRECTED*, *LOCATED_IN*).

This laboratory implements the industry-standard **Property Graph Model**:
- **Node**: An entity in the graph domain (e.g., \`Keanu Reeves\` or \`The Matrix\`), denoted in queries as \`(...)\`.
- **Label**: A type tag classifying nodes into categories (e.g., \`:Person\`, \`:Movie\`, \`:Organization\`, \`:City\`).
- **Relationship**: A directed, typed connection between a start node and an end node (e.g., \`-[:ACTED_IN]->\`).
- **Property**: Key-value metadata attached to nodes **or** relationships (e.g., \`born: 1964\` on a Person node, or \`role: "Neo"\` on an ACTED_IN edge).

---

### 2. Declarative Pattern-Based Query Language
Graph query languages use a **declarative, pattern-based approach**: you describe **what** pattern or subgraph shape you are looking for, and the graph engine automatically computes **how** to traverse and retrieve all matching subgraphs.

Patterns are expressed with intuitive ASCII-art syntax:
\`\`\`
(a:Person)-[:ACTED_IN]->(m:Movie)
\`\`\`
- \`(a:Person)\` matches a node with variable \`a\` and label \`:Person\`.
- \`-[:ACTED_IN]->\` matches a directed relationship of type \`ACTED_IN\`.
- \`<-[:DIRECTED]-\` traverses incoming relationships.
- \`-[:DISTRIBUTED]-\` ignores edge direction (undirected match).
- \`-[*1..3]-\` defines a **variable-length path** traversing between 1 and 3 hops.

---

### 3. Core Query Clauses
| Clause | Purpose | Example Pattern |
|---|---|---|
| \`MATCH\` | Declares the graph structural pattern to locate | \`MATCH (p:Person)-[:DIRECTED]->(m:Movie)\` |
| \`WHERE\` | Filters matched patterns using boolean conditions | \`WHERE p.born > 1970\` |
| \`RETURN\` | Projects entities, properties, or aggregates | \`RETURN p.name, m.name, m.released\` |
| \`ORDER BY\` | Sorts result rows ascending or descending | \`ORDER BY m.released DESC\` |
| \`LIMIT\` | Constrains the maximum number of returned rows | \`LIMIT 5\` |`,
  procedure: [
    "Step 1: Review graph database principles, property graph structures, and declarative pattern syntax.",
    "Step 2: Navigate to the Simulation Lab tab and explore the interactive Knowledge Graph canvas.",
    "Step 3: Select a Query Pattern Mode (Node Lookup, 1-Hop Traversal, or Multi-Hop Traversal).",
    "Step 4: Configure query parameters (Labels, Properties, Direction, or Hop Depth) and inspect the generated pattern query.",
    "Step 5: Click 'Execute Query' to trigger the graph traversal engine and observe animated path highlights on the graph canvas.",
    "Step 6: Inspect the tabular results, download structured records as CSV/JSON, and click 'Record Current Trial'.",
    "Step 7: Switch to the Raw Pattern Query Editor to test custom multi-hop and aggregation patterns.",
    "Step 8: Complete the 10-question self-grading conceptual Quiz, review achievement grade, and download the official Lab Report PDF."
  ],
  key_terms: {
    "Node": "An entity in the graph (e.g. a person, movie, or organization), depicted as a circle or vertex.",
    "Relationship": "A directed, typed connection linking a source node to a target node, depicted as an arrow.",
    "Property": "A key-value attribute stored on a node or edge (e.g. born: 1964, role: 'Neo').",
    "Label": "A semantic classification tag grouping nodes (e.g. :Person, :Movie, :City).",
    "Pattern-Based Query": "A declarative query describing the structural shape and property constraints of subgraphs to retrieve.",
    "Multi-Hop Traversal": "Navigating across a chain of two or more consecutive relationships (e.g. Actor -> Movie -> Studio -> City).",
    "Variable-Length Path": "A path pattern with a range of hops (e.g. -[*1..3]-) matching variable traversal distances.",
    "Aggregation": "Grouping matched patterns to compute summary metrics such as node degree counts (count(r))."
  }
};

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Which statement best describes a knowledge graph?",
    options: [
      "A) A spreadsheet in which every row is a document and every column is a keyword",
      "B) A network of entities (nodes) connected by typed relationships, with properties describing both",
      "C) A chart that plots numeric values against time",
      "D) A relational table with a single primary key and no foreign keys"
    ],
    answer_index: 1,
    explanation:
      "A knowledge graph models facts as entities joined by meaningful, typed relationships; in the property graph model both entities and edges can carry key-value properties."
  },
  {
    id: 2,
    question: "In the pattern (k:Person)-[:ACTED_IN]->(m:Movie), what is ACTED_IN?",
    options: [
      "A) A node label",
      "B) A property key",
      "C) A relationship type",
      "D) A variable name"
    ],
    answer_index: 2,
    explanation:
      "Inside square brackets, the identifier prefixed with a colon is the relationship type. Person and Movie are node labels; k and m are variable identifiers."
  },
  {
    id: 3,
    question: "In (k)-[:ACTED_IN {role: \"Neo\"}]->(m), where is the property 'role' stored?",
    options: [
      "A) On the node k",
      "B) On the node m",
      "C) As an extra label on both nodes",
      "D) On the ACTED_IN relationship itself"
    ],
    answer_index: 3,
    explanation:
      "The curly braces sit inside the relationship brackets, so 'role' is a relationship property describing the specific acting fact connecting actor and film."
  },
  {
    id: 4,
    question: "Which option correctly describes the semantic roles of MATCH, WHERE and RETURN?",
    options: [
      "A) MATCH declares the graph pattern, WHERE filters the matches, RETURN chooses what to output",
      "B) MATCH creates new nodes, WHERE deletes nodes, RETURN saves the graph",
      "C) MATCH sorts rows, WHERE limits rows, RETURN counts rows",
      "D) All three clauses are interchangeable and can be written in any order"
    ],
    answer_index: 0,
    explanation:
      "MATCH describes the structural shape to search for, WHERE applies boolean filters to variables, and RETURN specifies the nodes, attributes, or aggregates to output."
  },
  {
    id: 5,
    question: "Using the movie graph, what does MATCH (p:Person) WHERE p.born > 1970 RETURN p.name return?",
    options: [
      "A) The names of all eight people in the graph",
      "B) Leonardo DiCaprio, Tom Hardy and Emma Thomas",
      "C) Christopher Nolan, Leonardo DiCaprio, Tom Hardy and Emma Thomas",
      "D) A single number: the count of people born after 1970"
    ],
    answer_index: 1,
    explanation:
      "Only individuals with born strictly greater than 1970 match (DiCaprio: 1974, Hardy: 1977, Thomas: 1971). Christopher Nolan was born in 1970, failing the strict '>' condition."
  },
  {
    id: 6,
    question: "What does MATCH (a:Person)<-[:DIRECTED]-(b) WHERE a.name = \"Christopher Nolan\" RETURN b.name return?",
    options: [
      "A) Inception and The Dark Knight Rises",
      "B) Syncopy",
      "C) London",
      "D) No rows, because no DIRECTED relationship points into Christopher Nolan"
    ],
    answer_index: 3,
    explanation:
      "The arrow points into variable 'a', meaning the pattern seeks an entity that directed Nolan. Because his DIRECTED edges point outward towards movies, zero rows match. Direction matters."
  },
  {
    id: 7,
    question: "What does the pattern (a)-[r]-(b), written without arrowheads, match?",
    options: [
      "A) Only relationships that go strictly from a to b",
      "B) Only relationships that go strictly from b to a",
      "C) Relationships between a and b in either direction",
      "D) Pairs of nodes that are completely disconnected"
    ],
    answer_index: 2,
    explanation:
      "Omitting directional arrows makes the pattern direction-agnostic: stored relationships in either direction (a->b or b->a) satisfy the match."
  },
  {
    id: 8,
    question: "Which pattern matches paths of 1 to 3 relationships of any type between a and b?",
    options: [
      "A) (a)-[:3]->(b)",
      "B) (a)-[*1..3]-(b)",
      "C) (a)-[1-3]-(b)",
      "D) (a)-{1,3}-(b)"
    ],
    answer_index: 1,
    explanation:
      "Variable-length path patterns use an asterisk followed by a min..max hop range: [*min..max]. Omitting a relationship type allows any valid edge type along the path."
  },
  {
    id: 9,
    question: "Starting from Keanu Reeves and ignoring direction, which node is reached in exactly 2 hops but not in 1?",
    options: [
      "A) Warner Bros (Keanu Reeves -> The Matrix <- Warner Bros)",
      "B) The Matrix",
      "C) John Wick",
      "D) London"
    ],
    answer_index: 0,
    explanation:
      "The Matrix and John Wick are 1-hop direct neighbors. Warner Bros distributed The Matrix, placing it exactly 2 hops away. London is not reachable within 2 hops."
  },
  {
    id: 10,
    question: "What does MATCH (n)-[r]->() RETURN n.name, count(r) AS rels ORDER BY rels DESC LIMIT 3 return?",
    options: [
      "A) The three relationship types that occur most frequently in the graph",
      "B) Every node alphabetically sorted with its total property count",
      "C) The top three nodes with the highest outgoing relationship counts, ordered descending",
      "D) Three randomly sampled nodes from the graph"
    ],
    answer_index: 2,
    explanation:
      "count(r) groups rows by n.name and tallies outgoing edges. ORDER BY rels DESC orders the counts from highest to lowest, and LIMIT 3 truncates the result to the top 3 nodes."
  }
];

// Label Colors and Shapes
export const LABEL_STYLES = {
  Person:       { color: "#3b82f6", bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-300", shape: "circle" },
  Movie:        { color: "#f97316", bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-300", shape: "square" },
  Organization: { color: "#10b981", bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-300", shape: "diamond" },
  City:         { color: "#8b5cf6", bg: "bg-purple-500", text: "text-purple-600", border: "border-purple-300", shape: "triangle" },
  Book:         { color: "#ec4899", bg: "bg-pink-500", text: "text-pink-600", border: "border-pink-300", shape: "circle" },
  Machine:      { color: "#06b6d4", bg: "bg-cyan-500", text: "text-cyan-600", border: "border-cyan-300", shape: "square" },
  Concept:      { color: "#eab308", bg: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-300", shape: "diamond" },
  Device:       { color: "#14b8a6", bg: "bg-teal-500", text: "text-teal-600", border: "border-teal-300", shape: "square" },
};

export function getLabelStyle(label) {
  if (LABEL_STYLES[label]) return LABEL_STYLES[label];
  const dynamicPalette = [
    { color: "#06b6d4", bg: "bg-cyan-500", text: "text-cyan-600", border: "border-cyan-300", shape: "circle" },
    { color: "#84cc16", bg: "bg-lime-500", text: "text-lime-600", border: "border-lime-300", shape: "square" },
    { color: "#f59e0b", bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-300", shape: "diamond" },
    { color: "#6366f1", bg: "bg-indigo-500", text: "text-indigo-600", border: "border-indigo-300", shape: "triangle" },
    { color: "#d946ef", bg: "bg-fuchsia-500", text: "text-fuchsia-600", border: "border-fuchsia-300", shape: "circle" }
  ];
  let hash = 0;
  const str = String(label || "Entity");
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
  }
  return dynamicPalette[Math.abs(hash) % dynamicPalette.length];
}

// 16 Nodes & 25 Relationships Mini Movie Knowledge Graph
export const DEFAULT_GRAPH_DATA = {
  nodes: [
    { id: "p1", label: "Person", name: "Keanu Reeves", born: 1964 },
    { id: "p2", label: "Person", name: "Carrie-Anne Moss", born: 1967 },
    { id: "p3", label: "Person", name: "Laurence Fishburne", born: 1961 },
    { id: "p4", label: "Person", name: "Lana Wachowski", born: 1965 },
    { id: "p5", label: "Person", name: "Christopher Nolan", born: 1970 },
    { id: "p6", label: "Person", name: "Leonardo DiCaprio", born: 1974 },
    { id: "p7", label: "Person", name: "Tom Hardy", born: 1977 },
    { id: "p8", label: "Person", name: "Emma Thomas", born: 1971 },
    { id: "m1", label: "Movie", name: "The Matrix", released: 1999 },
    { id: "m2", label: "Movie", name: "John Wick", released: 2014 },
    { id: "m3", label: "Movie", name: "Inception", released: 2010 },
    { id: "m4", label: "Movie", name: "The Dark Knight Rises", released: 2012 },
    { id: "o1", label: "Organization", name: "Warner Bros", founded: 1923 },
    { id: "o2", label: "Organization", name: "Syncopy", founded: 2001 },
    { id: "c1", label: "City", name: "Los Angeles", country: "USA" },
    { id: "c2", label: "City", name: "London", country: "UK" }
  ],
  relationships: [
    { id: "r1", source: "p1", target: "m1", type: "ACTED_IN", properties: { role: "Neo" } },
    { id: "r2", source: "p2", target: "m1", type: "ACTED_IN", properties: { role: "Trinity" } },
    { id: "r3", source: "p3", target: "m1", type: "ACTED_IN", properties: { role: "Morpheus" } },
    { id: "r4", source: "p1", target: "m2", type: "ACTED_IN", properties: { role: "John Wick" } },
    { id: "r5", source: "p6", target: "m3", type: "ACTED_IN", properties: { role: "Cobb" } },
    { id: "r6", source: "p7", target: "m3", type: "ACTED_IN", properties: { role: "Eames" } },
    { id: "r7", source: "p7", target: "m4", type: "ACTED_IN", properties: { role: "Bane" } },
    { id: "r8", source: "p4", target: "m1", type: "DIRECTED", properties: {} },
    { id: "r9", source: "p5", target: "m3", type: "DIRECTED", properties: {} },
    { id: "r10", source: "p5", target: "m4", type: "DIRECTED", properties: {} },
    { id: "r11", source: "p8", target: "m3", type: "PRODUCED", properties: {} },
    { id: "r12", source: "p8", target: "m4", type: "PRODUCED", properties: {} },
    { id: "r13", source: "o2", target: "m3", type: "PRODUCED", properties: {} },
    { id: "r14", source: "o2", target: "m4", type: "PRODUCED", properties: {} },
    { id: "r15", source: "o1", target: "m1", type: "DISTRIBUTED", properties: {} },
    { id: "r16", source: "o1", target: "m3", type: "DISTRIBUTED", properties: {} },
    { id: "r17", source: "o1", target: "m4", type: "DISTRIBUTED", properties: {} },
    { id: "r18", source: "p5", target: "o2", type: "FOUNDED", properties: { year: 2001 } },
    { id: "r19", source: "p8", target: "o2", type: "FOUNDED", properties: { year: 2001 } },
    { id: "r20", source: "o1", target: "c1", type: "LOCATED_IN", properties: {} },
    { id: "r21", source: "o2", target: "c2", type: "LOCATED_IN", properties: {} },
    { id: "r22", source: "p5", target: "c2", type: "BORN_IN", properties: {} },
    { id: "r23", source: "p7", target: "c2", type: "BORN_IN", properties: {} },
    { id: "r24", source: "p8", target: "c2", type: "BORN_IN", properties: {} },
    { id: "r25", source: "p6", target: "c1", type: "BORN_IN", properties: {} }
  ]
};

// Seed for Custom Graph mode
export const CUSTOM_GRAPH_SEED = {
  nodes: [
    { id: "c_p1", label: "Person", name: "Ada Lovelace", born: 1815 },
    { id: "c_b1", label: "Book", name: "Notes on Analytical Engine", year: 1843 },
    { id: "c_c1", label: "City", name: "London", country: "UK" }
  ],
  relationships: [
    { id: "c_r1", source: "c_p1", target: "c_b1", type: "WROTE", properties: {} },
    { id: "c_r2", source: "c_p1", target: "c_c1", type: "BORN_IN", properties: {} }
  ]
};

// Fixed clean 2D layout coordinates for the movie knowledge graph
export const DEFAULT_NODE_COORDINATES = {
  m2: { x: 90,  y: 90 },
  p1: { x: 190, y: 170 },
  m1: { x: 320, y: 260 },
  p2: { x: 100, y: 300 },
  p3: { x: 150, y: 410 },
  p4: { x: 330, y: 410 },
  o1: { x: 490, y: 260 },
  c1: { x: 490, y: 450 },
  p6: { x: 670, y: 450 },
  m3: { x: 670, y: 310 },
  m4: { x: 670, y: 160 },
  p7: { x: 570, y: 80 },
  p5: { x: 840, y: 390 },
  p8: { x: 840, y: 120 },
  o2: { x: 940, y: 250 },
  c2: { x: 1060, y: 250 }
};

export const PRESET_QUERIES = [
  {
    title: "1. Actors in The Matrix",
    mode: "Relationship Traversal",
    query: `MATCH (p:Person)-[r:ACTED_IN]->(m:Movie)
WHERE m.name = "The Matrix"
RETURN p.name AS Actor, r.role AS Character, m.name AS Movie`
  },
  {
    title: "2. Christopher Nolan Directorials",
    mode: "Relationship Traversal",
    query: `MATCH (p:Person)-[:DIRECTED]->(m:Movie)
WHERE p.name = "Christopher Nolan"
RETURN p.name AS Director, m.name AS Title, m.released AS Year
ORDER BY Year ASC`
  },
  {
    title: "3. People Born After 1970",
    mode: "Node Lookup",
    query: `MATCH (p:Person)
WHERE p.born > 1970
RETURN p.name AS Person, p.born AS BirthYear
ORDER BY BirthYear ASC`
  },
  {
    title: "4. Multi-hop: Keanu Reeves to Cities (1..3 Hops)",
    mode: "Multi-Hop Traversal",
    query: `MATCH path = (a:Person)-[*1..3]-(b:City)
WHERE a.name = "Keanu Reeves"
RETURN length(path) AS Hops, b.name AS DestinationCity, path`
  },
  {
    title: "5. Top 5 Most Connected Entities (Degree Count)",
    mode: "Custom Pattern",
    query: `MATCH (n)-[r]->()
RETURN n.name AS Entity, count(r) AS OutgoingDegree
ORDER BY OutgoingDegree DESC
LIMIT 5`
  },
  {
    title: "6. Film Studios Located in London",
    mode: "Custom Pattern",
    query: `MATCH (s:Organization)-[:LOCATED_IN]->(c:City)
WHERE c.name = "London"
RETURN s.name AS Studio, s.founded AS FoundedYear, c.name AS City`
  }
];

// Helper to format literals
function formatLiteral(val) {
  if (typeof val === "number") return String(val);
  return `"${String(val).replace(/"/g, '\\"')}"`;
}

// Comparison operator evaluator
function evalComparison(actual, op, expected) {
  if (actual === undefined || actual === null) return false;
  if (op === "=") return actual == expected;
  if (op === "<>") return actual != expected;
  if (op === ">") return actual > expected;
  if (op === ">=") return actual >= expected;
  if (op === "<") return actual < expected;
  if (op === "<=") return actual <= expected;
  if (op === "CONTAINS") return String(actual).toLowerCase().includes(String(expected).toLowerCase());
  if (op === "STARTS WITH") return String(actual).toLowerCase().startsWith(String(expected).toLowerCase());
  if (op === "ENDS WITH") return String(actual).toLowerCase().endsWith(String(expected).toLowerCase());
  return false;
}

/**
 * 1. Node Lookup Query Executor
 */
export function executeNodeLookup(graph, label, propKey, operator, value, limit = 50) {
  const isAnyLabel = !label || label === "(any)";
  const isNoFilter = !propKey || propKey === "(no filter)";

  let queryText = "";
  if (isNoFilter) {
    queryText = `MATCH (n${isAnyLabel ? "" : `:${label}`})\nRETURN n\nORDER BY n.name`;
  } else if (operator === "=") {
    queryText = `MATCH (n${isAnyLabel ? "" : `:${label}`} {${propKey}: ${formatLiteral(value)}})\nRETURN n\nORDER BY n.name`;
  } else {
    queryText = `MATCH (n${isAnyLabel ? "" : `:${label}`})\nWHERE n.${propKey} ${operator} ${formatLiteral(value)}\nRETURN n\nORDER BY n.name`;
  }
  if (limit) queryText += `\nLIMIT ${limit}`;

  const matchedNodes = [];
  graph.nodes.forEach(node => {
    if (!isAnyLabel && node.label !== label) return;
    if (isNoFilter) {
      matchedNodes.push(node);
      return;
    }
    const val = node[propKey];
    if (evalComparison(val, operator, value)) {
      matchedNodes.push(node);
    }
  });

  matchedNodes.sort((a, b) => a.name.localeCompare(b.name));
  const limited = limit ? matchedNodes.slice(0, limit) : matchedNodes;

  const rows = limited.map(n => {
    const otherProps = Object.entries(n)
      .filter(([k]) => !["id", "label", "name", "x", "y"].includes(k))
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return {
      "Node Name": n.name,
      "Label": n.label,
      "Properties": otherProps || "—"
    };
  });

  return {
    mode: "Node Lookup",
    query: queryText,
    columns: ["Node Name", "Label", "Properties"],
    rows,
    matchedNodeIds: limited.map(n => n.id),
    matchedEdgeIds: [],
    focusNodeId: null,
    summary: `Found ${limited.length} node(s) matching criteria.`
  };
}

/**
 * 2. 1-Hop Relationship Traversal Query Executor
 */
export function executeOneHop(graph, startNodeId, relType, direction = "out", limit = 50) {
  const startNode = graph.nodes.find(n => n.id === startNodeId) || graph.nodes[0];
  const isAnyRel = !relType || relType === "(any)";

  const dirArrow = direction === "out" ? "-[r]->" : direction === "in" ? "<-[r]-" : "-[r]-";
  const typedRel = isAnyRel ? dirArrow : dirArrow.replace("r", `r:${relType}`);

  let queryText = `MATCH (a:${startNode.label})${typedRel}(b)\nWHERE a.name = "${startNode.name}"\nRETURN a.name AS start, type(r) AS relationship, b.name AS neighbour, labels(b) AS label\nORDER BY neighbour ASC`;
  if (limit) queryText += `\nLIMIT ${limit}`;

  const hits = [];
  graph.relationships.forEach(rel => {
    if (!isAnyRel && rel.type !== relType) return;

    if (direction === "out" || direction === "both") {
      if (rel.source === startNode.id) {
        const targetNode = graph.nodes.find(n => n.id === rel.target);
        if (targetNode) {
          hits.push({
            edgeId: rel.id,
            start: startNode.name,
            relType: rel.type,
            direction: "outgoing",
            neighbour: targetNode.name,
            neighbourLabel: targetNode.label,
            neighbourId: targetNode.id,
            props: rel.properties
          });
        }
      }
    }
    if (direction === "in" || direction === "both") {
      if (rel.target === startNode.id) {
        const sourceNode = graph.nodes.find(n => n.id === rel.source);
        if (sourceNode) {
          hits.push({
            edgeId: rel.id,
            start: startNode.name,
            relType: rel.type,
            direction: "incoming",
            neighbour: sourceNode.name,
            neighbourLabel: sourceNode.label,
            neighbourId: sourceNode.id,
            props: rel.properties
          });
        }
      }
    }
  });

  hits.sort((a, b) => a.neighbour.localeCompare(b.neighbour));
  const limited = limit ? hits.slice(0, limit) : hits;

  const rows = limited.map(h => ({
    "Start Node": h.start,
    "Relationship": h.relType,
    "Direction": h.direction,
    "Connected Neighbour": h.neighbour,
    "Neighbour Label": h.neighbourLabel,
    "Edge Properties": Object.entries(h.props || {}).map(([k, v]) => `${k}: ${v}`).join(", ") || "—"
  }));

  const matchedNodeIds = Array.from(new Set([startNode.id, ...limited.map(h => h.neighbourId)]));
  const matchedEdgeIds = Array.from(new Set(limited.map(h => h.edgeId)));

  return {
    mode: "1-Hop Traversal",
    query: queryText,
    columns: ["Start Node", "Relationship", "Direction", "Connected Neighbour", "Neighbour Label", "Edge Properties"],
    rows,
    matchedNodeIds,
    matchedEdgeIds,
    focusNodeId: startNode.id,
    summary: `${startNode.name} has ${limited.length} connection(s) reaching ${matchedNodeIds.length - 1} distinct neighbour(s).`
  };
}

/**
 * 3. Multi-Hop Traversal Query Executor
 */
export function executeMultiHop(graph, startNodeId, maxHops = 2, targetLabel = "(any)", limit = 50) {
  const startNode = graph.nodes.find(n => n.id === startNodeId) || graph.nodes[0];
  const isAnyTarget = !targetLabel || targetLabel === "(any)";

  let queryText = `MATCH path = (a:${startNode.label})-[*1..${maxHops}]-(b${isAnyTarget ? "" : `:${targetLabel}`})\nWHERE a.name = "${startNode.name}" AND b <> a\nRETURN length(path) AS hops, b.name AS endNode, path\nORDER BY hops ASC, endNode ASC`;
  if (limit) queryText += `\nLIMIT ${limit}`;

  // Find all paths of 1..maxHops
  const paths = [];

  function walk(currentId, visitedEdges, nodeSequence, edgeSequence) {
    if (edgeSequence.length > 0) {
      paths.push({
        hops: edgeSequence.length,
        nodes: [...nodeSequence],
        edges: [...edgeSequence],
        endId: currentId
      });
    }

    if (edgeSequence.length === maxHops) return;

    graph.relationships.forEach(rel => {
      if (visitedEdges.has(rel.id)) return;

      if (rel.source === currentId) {
        const nextId = rel.target;
        visitedEdges.add(rel.id);
        nodeSequence.push(nextId);
        edgeSequence.push({ id: rel.id, type: rel.type, dir: "->" });
        walk(nextId, visitedEdges, nodeSequence, edgeSequence);
        edgeSequence.pop();
        nodeSequence.pop();
        visitedEdges.delete(rel.id);
      } else if (rel.target === currentId) {
        const nextId = rel.source;
        visitedEdges.add(rel.id);
        nodeSequence.push(nextId);
        edgeSequence.push({ id: rel.id, type: rel.type, dir: "<-" });
        walk(nextId, visitedEdges, nodeSequence, edgeSequence);
        edgeSequence.pop();
        nodeSequence.pop();
        visitedEdges.delete(rel.id);
      }
    });
  }

  walk(startNode.id, new Set(), [startNode.id], []);

  // Filter paths by target criteria
  const filtered = paths.filter(p => {
    if (p.endId === startNode.id) return false;
    const endNode = graph.nodes.find(n => n.id === p.endId);
    if (!endNode) return false;
    if (!isAnyTarget && endNode.label !== targetLabel) return false;
    return true;
  });

  filtered.sort((a, b) => a.hops - b.hops || a.endId.localeCompare(b.endId));
  const limited = limit ? filtered.slice(0, limit) : filtered;

  const rows = limited.map(p => {
    const endNode = graph.nodes.find(n => n.id === p.endId);
    const pathStr = p.nodes
      .map((nId, idx) => {
        const nObj = graph.nodes.find(n => n.id === nId);
        const name = nObj ? nObj.name : nId;
        if (idx === 0) return name;
        const edge = p.edges[idx - 1];
        return `${edge.dir === "->" ? " ──(" : " ◄──("}${edge.type}${edge.dir === "->" ? ")──► " : ")── "} ${name}`;
      })
      .join("");

    return {
      "Hops": p.hops,
      "End Node": endNode ? endNode.name : p.endId,
      "End Label": endNode ? endNode.label : "—",
      "Traversal Path": pathStr
    };
  });

  const matchedNodeIds = Array.from(new Set([startNode.id, ...limited.flatMap(p => p.nodes)]));
  const matchedEdgeIds = Array.from(new Set(limited.flatMap(p => p.edges.map(e => e.id))));

  return {
    mode: "Multi-Hop Traversal",
    query: queryText,
    columns: ["Hops", "End Node", "End Label", "Traversal Path"],
    rows,
    matchedNodeIds,
    matchedEdgeIds,
    focusNodeId: startNode.id,
    pathSteps: limited.map(p => ({
      nodes: p.nodes,
      edges: p.edges.map(e => e.id)
    })),
    summary: `Found ${limited.length} path(s) spanning 1 to ${maxHops} hop(s) connecting ${startNode.name} to ${Array.from(new Set(limited.map(p => p.endId))).length} target node(s).`
  };
}

/**
 * 4. Free-form Pattern Query Parser & Evaluator
 */
export function executeCustomQuery(graph, queryStr) {
  const q = queryStr.trim();
  if (!q.toUpperCase().startsWith("MATCH")) {
    throw new Error("Queries must begin with the MATCH clause.");
  }

  // Check 1: Aggregation pattern (MATCH (n)-[r]->() RETURN n.name, count(r) ...)
  if (q.includes("count(r)") || q.includes("count(")) {
    const outCounts = new Map();
    graph.nodes.forEach(n => outCounts.set(n.id, 0));
    graph.relationships.forEach(r => {
      outCounts.set(r.source, (outCounts.get(r.source) || 0) + 1);
    });

    const entries = Array.from(outCounts.entries()).map(([id, cnt]) => {
      const node = graph.nodes.find(n => n.id === id);
      return {
        id,
        "Entity Name": node ? node.name : id,
        "Label": node ? node.label : "—",
        "Outgoing Degree (count)": cnt
      };
    });

    entries.sort((a, b) => b["Outgoing Degree (count)"] - a["Outgoing Degree (count)"]);
    const limitMatch = q.match(/LIMIT\s+(\d+)/i);
    const limit = limitMatch ? parseInt(limitMatch[1], 10) : 5;
    const limited = entries.slice(0, limit);

    return {
      mode: "Custom Pattern Query",
      query: q,
      columns: ["Entity Name", "Label", "Outgoing Degree (count)"],
      rows: limited.map(e => ({
        "Entity Name": e["Entity Name"],
        "Label": e["Label"],
        "Outgoing Degree (count)": e["Outgoing Degree (count)"]
      })),
      matchedNodeIds: limited.map(e => e.id),
      matchedEdgeIds: graph.relationships.filter(r => limited.some(e => e.id === r.source)).map(r => r.id),
      focusNodeId: limited[0]?.id || null,
      summary: `Computed outgoing relationship counts for top ${limited.length} entities.`
    };
  }

  // Check 2: Multi-hop pattern: [*1..X]
  const hopMatch = q.match(/\[\s*\*\s*(\d+)?\s*\.\.\s*(\d+)\s*\]/);
  if (hopMatch) {
    const maxHops = parseInt(hopMatch[2], 10) || 3;
    const nameMatch = q.match(/name\s*=\s*["']([^"']+)["']/i);
    const targetLabelMatch = q.match(/\([a-zA-Z0-9_]*:([A-Za-z]+)\)$/m);

    let startId = graph.nodes[0]?.id;
    if (nameMatch) {
      const targetName = nameMatch[1];
      const found = graph.nodes.find(n => n.name.toLowerCase() === targetName.toLowerCase());
      if (found) startId = found.id;
    }
    const targetLabel = targetLabelMatch ? targetLabelMatch[1] : "(any)";
    return executeMultiHop(graph, startId, maxHops, targetLabel, 25);
  }

  // Check 3: Relationship pattern (a)-[r:TYPE]->(b)
  const relMatch = q.match(/\((?:[a-zA-Z0-9_]*)(?::([A-Za-z]+))?\)(<?)-?\[(?:[a-zA-Z0-9_]*)(?::([A-Za-z_]+))?\]-?(>?)\((?:[a-zA-Z0-9_]*)(?::([A-Za-z]+))?\)/i);
  if (relMatch) {
    const leftArrow = relMatch[2];
    const relType = relMatch[3] || "(any)";
    const rightArrow = relMatch[4];
    const dir = (leftArrow && !rightArrow) ? "in" : (rightArrow && !leftArrow) ? "out" : "both";

    const nameMatch = q.match(/name\s*=\s*["']([^"']+)["']/i);
    let startId = graph.nodes[0]?.id;
    if (nameMatch) {
      const targetName = nameMatch[1];
      const found = graph.nodes.find(n => n.name.toLowerCase() === targetName.toLowerCase());
      if (found) startId = found.id;
    }
    return executeOneHop(graph, startId, relType, dir, 25);
  }

  // Check 4: Node Lookup pattern
  const labelMatch = q.match(/MATCH\s*\([a-zA-Z0-9_]*:([A-Za-z]+)/i);
  const label = labelMatch ? labelMatch[1] : "(any)";
  const whereMatch = q.match(/WHERE\s+[a-zA-Z0-9_]*\.([a-zA-Z0-9_]+)\s*(=|<>|>|>=|<|<=|CONTAINS|STARTS WITH)\s*(?:["']([^"']+)["']|(\d+))/i);

  if (whereMatch) {
    const propKey = whereMatch[1];
    const op = whereMatch[2];
    const val = whereMatch[3] !== undefined ? whereMatch[3] : parseInt(whereMatch[4], 10);
    return executeNodeLookup(graph, label, propKey, op, val, 25);
  }

  // Fallback node list
  return executeNodeLookup(graph, label, "(no filter)", "=", "", 25);
}

/**
 * CSV Exporter
 */
export function resultsToCSV(rows, columns) {
  if (!rows || rows.length === 0) return "";
  const header = columns.join(",");
  const body = rows.map(r =>
    columns.map(c => `"${String(r[c] || "").replace(/"/g, '""')}"`).join(",")
  );
  return [header, ...body].join("\n");
}

/**
 * JSON Exporter
 */
export function resultsToJSON(rows) {
  return JSON.stringify(rows || [], null, 2);
}
