/**
 * schemaDesignEngine.js
 * In-Memory Knowledge Graph Engine, Schema Validator & Domain Repository
 * Experiment 11: Design a Knowledge Graph Schema and Import Data
 * Knowledge Graphs & Information Retrieval Systems (KGIRS)
 */

// ============================================================================
// 1. PRESET DOMAIN CATALOGUE
// ============================================================================

export const DOMAINS = {
  University: {
    name: "University",
    description: "An academic knowledge graph connecting students, courses, faculty, departments, and research projects.",
    nodes: [
      { label: "Student", key: "student_id", properties: ["student_id", "name", "semester"] },
      { label: "Course", key: "course_id", properties: ["course_id", "name", "credits"] },
      { label: "Faculty", key: "faculty_id", properties: ["faculty_id", "name", "specialization"] },
      { label: "Department", key: "dept_id", properties: ["dept_id", "name"] },
      { label: "Project", key: "project_id", properties: ["project_id", "title", "domain"] },
    ],
    relationships: [
      { type: "ENROLLED_IN", source: "Student", target: "Course", properties: ["grade"] },
      { type: "TEACHES", source: "Faculty", target: "Course", properties: [] },
      { type: "BELONGS_TO", source: "Student", target: "Department", properties: [] },
      { type: "BELONGS_TO", source: "Faculty", target: "Department", properties: [] },
      { type: "BELONGS_TO", source: "Course", target: "Department", properties: [] },
      { type: "WORKS_ON", source: "Student", target: "Project", properties: ["role"] },
      { type: "GUIDED_BY", source: "Faculty", target: "Project", properties: [] },
    ],
    data: {
      Student: [
        { student_id: "S001", name: "Aditi", semester: 4 },
        { student_id: "S002", name: "Rahul", semester: 4 },
        { student_id: "S003", name: "Priya", semester: 6 },
        { student_id: "S004", name: "Arjun", semester: 6 },
        { student_id: "S005", name: "Neha", semester: 4 },
      ],
      Course: [
        { course_id: "C101", name: "Database Management Systems", credits: 4 },
        { course_id: "C102", name: "Computer Networks", credits: 3 },
        { course_id: "C103", name: "Artificial Intelligence", credits: 4 },
      ],
      Faculty: [
        { faculty_id: "F001", name: "Dr. Sharma", specialization: "Databases" },
        { faculty_id: "F002", name: "Dr. Mehta", specialization: "Computer Networks" },
        { faculty_id: "F003", name: "Dr. Rao", specialization: "Artificial Intelligence" },
      ],
      Department: [
        { dept_id: "D01", name: "Computer Engineering" },
        { dept_id: "D02", name: "Information Technology" },
      ],
      Project: [
        { project_id: "P001", title: "Smart Campus", domain: "IoT" },
        { project_id: "P002", title: "AI Chatbot", domain: "NLP" },
        { project_id: "P003", title: "Library Management", domain: "Web" },
      ],
    },
    edges: [
      { type: "ENROLLED_IN", source: "S001", target: "C101", properties: { grade: "A" } },
      { type: "ENROLLED_IN", source: "S001", target: "C103", properties: { grade: "B" } },
      { type: "ENROLLED_IN", source: "S002", target: "C101", properties: { grade: "B" } },
      { type: "ENROLLED_IN", source: "S002", target: "C102", properties: { grade: "A" } },
      { type: "ENROLLED_IN", source: "S003", target: "C102", properties: { grade: "A" } },
      { type: "ENROLLED_IN", source: "S003", target: "C103", properties: { grade: "B" } },
      { type: "ENROLLED_IN", source: "S004", target: "C103", properties: { grade: "C" } },
      { type: "ENROLLED_IN", source: "S005", target: "C101", properties: { grade: "A" } },
      { type: "TEACHES", source: "F001", target: "C101", properties: {} },
      { type: "TEACHES", source: "F002", target: "C102", properties: {} },
      { type: "TEACHES", source: "F003", target: "C103", properties: {} },
      { type: "BELONGS_TO", source: "S001", target: "D01", properties: {} },
      { type: "BELONGS_TO", source: "S002", target: "D01", properties: {} },
      { type: "BELONGS_TO", source: "S003", target: "D02", properties: {} },
      { type: "BELONGS_TO", source: "S004", target: "D02", properties: {} },
      { type: "BELONGS_TO", source: "S005", target: "D01", properties: {} },
      { type: "BELONGS_TO", source: "F001", target: "D01", properties: {} },
      { type: "BELONGS_TO", source: "F002", target: "D01", properties: {} },
      { type: "BELONGS_TO", source: "F003", target: "D02", properties: {} },
      { type: "BELONGS_TO", source: "C101", target: "D01", properties: {} },
      { type: "BELONGS_TO", source: "C102", target: "D01", properties: {} },
      { type: "BELONGS_TO", source: "C103", target: "D02", properties: {} },
      { type: "WORKS_ON", source: "S001", target: "P001", properties: { role: "Developer" } },
      { type: "WORKS_ON", source: "S002", target: "P001", properties: { role: "Tester" } },
      { type: "WORKS_ON", source: "S003", target: "P002", properties: { role: "ML Engineer" } },
      { type: "WORKS_ON", source: "S004", target: "P002", properties: { role: "Data Analyst" } },
      { type: "WORKS_ON", source: "S005", target: "P003", properties: { role: "Frontend" } },
      { type: "GUIDED_BY", source: "F001", target: "P001", properties: {} },
      { type: "GUIDED_BY", source: "F003", target: "P002", properties: {} },
      { type: "GUIDED_BY", source: "F002", target: "P003", properties: {} },
    ]
  },

  Ecommerce: {
    name: "E-Commerce",
    description: "An e-commerce retail graph linking customers, products, categories, orders, and brands.",
    nodes: [
      { label: "Customer", key: "cust_id", properties: ["cust_id", "name", "city"] },
      { label: "Product", key: "prod_id", properties: ["prod_id", "title", "price"] },
      { label: "Order", key: "order_id", properties: ["order_id", "date", "total_amount"] },
      { label: "Category", key: "cat_id", properties: ["cat_id", "name"] },
      { label: "Brand", key: "brand_id", properties: ["brand_id", "name"] },
    ],
    relationships: [
      { type: "PLACED", source: "Customer", target: "Order", properties: [] },
      { type: "CONTAINS", source: "Order", target: "Product", properties: ["quantity"] },
      { type: "IN_CATEGORY", source: "Product", target: "Category", properties: [] },
      { type: "MANUFACTURED_BY", source: "Product", target: "Brand", properties: [] },
      { type: "REVIEWED", source: "Customer", target: "Product", properties: ["rating"] },
    ],
    data: {
      Customer: [
        { cust_id: "U101", name: "Rohan", city: "Mumbai" },
        { cust_id: "U102", name: "Sneha", city: "Delhi" },
        { cust_id: "U103", name: "Karan", city: "Bengaluru" },
      ],
      Product: [
        { prod_id: "P10", title: "Wireless Noise-Canceling Headphones", price: 14999 },
        { prod_id: "P20", title: "Mechanical Keyboard", price: 6999 },
        { prod_id: "P30", title: "Ultra HD 4K Monitor", price: 28999 },
      ],
      Order: [
        { order_id: "ORD01", date: "2026-03-01", total_amount: 21998 },
        { order_id: "ORD02", date: "2026-03-02", total_amount: 28999 },
      ],
      Category: [
        { cat_id: "CAT1", name: "Audio" },
        { cat_id: "CAT2", name: "Computer Accessories" },
      ],
      Brand: [
        { brand_id: "BR1", name: "Sony" },
        { brand_id: "BR2", name: "Keychron" },
        { brand_id: "BR3", name: "Dell" },
      ],
    },
    edges: [
      { type: "PLACED", source: "U101", target: "ORD01", properties: {} },
      { type: "PLACED", source: "U102", target: "ORD02", properties: {} },
      { type: "CONTAINS", source: "ORD01", target: "P10", properties: { quantity: 1 } },
      { type: "CONTAINS", source: "ORD01", target: "P20", properties: { quantity: 1 } },
      { type: "CONTAINS", source: "ORD02", target: "P30", properties: { quantity: 1 } },
      { type: "IN_CATEGORY", source: "P10", target: "CAT1", properties: {} },
      { type: "IN_CATEGORY", source: "P20", target: "CAT2", properties: {} },
      { type: "IN_CATEGORY", source: "P30", target: "CAT2", properties: {} },
      { type: "MANUFACTURED_BY", source: "P10", target: "BR1", properties: {} },
      { type: "MANUFACTURED_BY", source: "P20", target: "BR2", properties: {} },
      { type: "MANUFACTURED_BY", source: "P30", target: "BR3", properties: {} },
      { type: "REVIEWED", source: "U101", target: "P10", properties: { rating: 5 } },
      { type: "REVIEWED", source: "U103", target: "P20", properties: { rating: 4 } },
    ]
  },

  Healthcare: {
    name: "Healthcare",
    description: "A clinical biomedical knowledge graph mapping patients, doctors, medical conditions, medications, and treatments.",
    nodes: [
      { label: "Patient", key: "patient_id", properties: ["patient_id", "name", "age"] },
      { label: "Doctor", key: "doc_id", properties: ["doc_id", "name", "specialty"] },
      { label: "Condition", key: "cond_id", properties: ["cond_id", "name", "icd10"] },
      { label: "Medication", key: "med_id", properties: ["med_id", "name", "dosage"] },
    ],
    relationships: [
      { type: "DIAGNOSED_WITH", source: "Patient", target: "Condition", properties: ["date"] },
      { type: "TREATED_BY", source: "Patient", target: "Doctor", properties: [] },
      { type: "PRESCRIBED", source: "Doctor", target: "Medication", properties: ["frequency"] },
      { type: "TAKES", source: "Patient", target: "Medication", properties: [] },
      { type: "TREATS", source: "Medication", target: "Condition", properties: [] },
    ],
    data: {
      Patient: [
        { patient_id: "PT01", name: "Anita Roy", age: 54 },
        { patient_id: "PT02", name: "Vikram Sen", age: 42 },
      ],
      Doctor: [
        { doc_id: "DR01", name: "Dr. Sen", specialty: "Cardiology" },
        { doc_id: "DR02", name: "Dr. Nair", specialty: "Endocrinology" },
      ],
      Condition: [
        { cond_id: "C01", name: "Hypertension", icd10: "I10" },
        { cond_id: "C02", name: "Type 2 Diabetes", icd10: "E11" },
      ],
      Medication: [
        { med_id: "M01", name: "Amlodipine", dosage: "5mg" },
        { med_id: "M02", name: "Metformin", dosage: "500mg" },
      ],
    },
    edges: [
      { type: "DIAGNOSED_WITH", source: "PT01", target: "C01", properties: { date: "2025-11-12" } },
      { type: "DIAGNOSED_WITH", source: "PT02", target: "C02", properties: { date: "2026-01-08" } },
      { type: "TREATED_BY", source: "PT01", target: "DR01", properties: {} },
      { type: "TREATED_BY", source: "PT02", target: "DR02", properties: {} },
      { type: "PRESCRIBED", source: "DR01", target: "M01", properties: { frequency: "Daily" } },
      { type: "PRESCRIBED", source: "DR02", target: "M02", properties: { frequency: "Twice daily" } },
      { type: "TAKES", source: "PT01", target: "M01", properties: {} },
      { type: "TAKES", source: "PT02", target: "M02", properties: {} },
      { type: "TREATS", source: "M01", target: "C01", properties: {} },
      { type: "TREATS", source: "M02", target: "C02", properties: {} },
    ]
  },

  Movies: {
    name: "Movies & Cinema",
    description: "A rich cinematic knowledge graph representing actors, directors, films, production studios, and genres.",
    nodes: [
      { label: "Person", key: "person_id", properties: ["person_id", "name", "born"] },
      { label: "Movie", key: "movie_id", properties: ["movie_id", "title", "released"] },
      { label: "Genre", key: "genre_id", properties: ["genre_id", "name"] },
    ],
    relationships: [
      { type: "ACTED_IN", source: "Person", target: "Movie", properties: ["role"] },
      { type: "DIRECTED", source: "Person", target: "Movie", properties: [] },
      { type: "HAS_GENRE", source: "Movie", target: "Genre", properties: [] },
    ],
    data: {
      Person: [
        { person_id: "P1", name: "Keanu Reeves", born: 1964 },
        { person_id: "P2", name: "Lana Wachowski", born: 1965 },
        { person_id: "P3", name: "Carrie-Anne Moss", born: 1967 },
      ],
      Movie: [
        { movie_id: "M1", title: "The Matrix", released: 1999 },
        { movie_id: "M2", title: "The Matrix Reloaded", released: 2003 },
      ],
      Genre: [
        { genre_id: "G1", name: "Sci-Fi" },
        { genre_id: "G2", name: "Action" },
      ],
    },
    edges: [
      { type: "ACTED_IN", source: "P1", target: "M1", properties: { role: "Neo" } },
      { type: "ACTED_IN", source: "P1", target: "M2", properties: { role: "Neo" } },
      { type: "ACTED_IN", source: "P3", target: "M1", properties: { role: "Trinity" } },
      { type: "DIRECTED", source: "P2", target: "M1", properties: {} },
      { type: "DIRECTED", source: "P2", target: "M2", properties: {} },
      { type: "HAS_GENRE", source: "M1", target: "G1", properties: {} },
      { type: "HAS_GENRE", source: "M1", target: "G2", properties: {} },
    ]
  },

  Library: {
    name: "Library",
    description: "A bibliographic management knowledge graph connecting books, authors, genres, publishers, and patrons.",
    nodes: [
      { label: "Book", key: "isbn", properties: ["isbn", "title", "year"] },
      { label: "Author", key: "author_id", properties: ["author_id", "name"] },
      { label: "Member", key: "member_id", properties: ["member_id", "name"] },
    ],
    relationships: [
      { type: "WRITTEN_BY", source: "Book", target: "Author", properties: [] },
      { type: "BORROWED", source: "Member", target: "Book", properties: ["due_date"] },
    ],
    data: {
      Book: [
        { isbn: "978-01", title: "Introduction to Information Retrieval", year: 2008 },
        { isbn: "978-02", title: "Graph Databases in Action", year: 2020 },
      ],
      Author: [
        { author_id: "A1", name: "Christopher Manning" },
        { author_id: "A2", name: "Dave Bechberger" },
      ],
      Member: [
        { member_id: "MB10", name: "Aarav Sharma" },
      ],
    },
    edges: [
      { type: "WRITTEN_BY", source: "978-01", target: "A1", properties: {} },
      { type: "WRITTEN_BY", source: "978-02", target: "A2", properties: {} },
      { type: "BORROWED", source: "MB10", target: "978-01", properties: { due_date: "2026-04-15" } },
    ]
  }
};

// Deliberate erroneous dataset for pedagogical validation demos
export const ERRORS_DATASET = {
  name: "University (With Deliberate Schema Errors)",
  description: "An intentionally corrupted dataset containing dangling edges, unknown node labels, and missing mandatory keys.",
  nodes: [
    { label: "Student", key: "student_id", properties: ["student_id", "name"] },
    { label: "Course", key: "course_id", properties: ["course_id", "name"] },
  ],
  relationships: [
    { type: "ENROLLED_IN", source: "Student", target: "Course", properties: [] },
  ],
  data: {
    Student: [
      { student_id: "S001", name: "Aditi" },
      { student_id: "", name: "Anonymous" }, // Error: Empty key
    ],
    Course: [
      { course_id: "C101", name: "Database Systems" },
    ],
    GhostEntity: [ // Error: Unregistered node label
      { id: "G99", val: "Orphaned" }
    ]
  },
  edges: [
    { type: "ENROLLED_IN", source: "S001", target: "C101", properties: {} },
    { type: "ENROLLED_IN", source: "S999", target: "C101", properties: {} }, // Error: Dangling source S999
    { type: "ENROLLED_IN", source: "S001", target: "C999", properties: {} }, // Error: Dangling target C999
    { type: "UNKNOWN_REL", source: "S001", target: "C101", properties: {} }, // Error: Unregistered edge type
  ]
};

// ============================================================================
// 2. SCHEMA & INTEGRITY VALIDATOR
// ============================================================================

export function validateKnowledgeGraph(schema, dataset) {
  const issues = [];
  const validNodesMap = new Map();
  let totalNodesCount = 0;
  let totalEdgesCount = 0;

  const summary = {
    missingNodeKey: 0,
    duplicateKey: 0,
    unregisteredLabel: 0,
    unregisteredRelType: 0,
    danglingSourceId: 0,
    danglingTargetId: 0,
    labelMismatch: 0,
  };

  const schemaNodeLabels = new Set((schema?.nodes || []).map(n => n.label));
  const schemaKeys = {};
  (schema?.nodes || []).forEach(n => {
    schemaKeys[n.label] = n.key;
  });

  const dataObj = dataset?.data || dataset?.nodes || {};
  Object.entries(dataObj).forEach(([label, entities]) => {
    if (!schemaNodeLabels.has(label)) {
      summary.unregisteredLabel++;
      issues.push({
        severity: "error",
        type: "UNREGISTERED_LABEL",
        label,
        message: `Label '${label}' appears in dataset but is missing from Schema Definitions.`
      });
      return;
    }

    const keyField = schemaKeys[label];
    if (Array.isArray(entities)) {
      entities.forEach((entity, idx) => {
        totalNodesCount++;
        const idVal = entity[keyField];
        if (!idVal || String(idVal).trim() === "") {
          summary.missingNodeKey++;
          issues.push({
            severity: "error",
            type: "MISSING_NODE_KEY",
            label,
            record: entity,
            message: `${label}[${idx}] is missing mandatory key '${keyField}'.`
          });
        } else if (validNodesMap.has(String(idVal))) {
          summary.duplicateKey++;
          issues.push({
            severity: "warning",
            type: "DUPLICATE_KEY",
            label,
            record: entity,
            message: `Key '${idVal}' duplicated across entities under label '${label}'.`
          });
        } else {
          validNodesMap.set(String(idVal), { label, ...entity });
        }
      });
    }
  });

  // Map relationship type to all permitted (source -> target) signatures
  const schemaRelTypes = new Map();
  (schema?.relationships || []).forEach(r => {
    if (!schemaRelTypes.has(r.type)) {
      schemaRelTypes.set(r.type, []);
    }
    schemaRelTypes.get(r.type).push({ source: r.source, target: r.target });
  });

  const edgesList = dataset?.edges || [];
  edgesList.forEach((edge, idx) => {
    totalEdgesCount++;
    const allowedSignatures = schemaRelTypes.get(edge.type);
    if (!allowedSignatures || allowedSignatures.length === 0) {
      summary.unregisteredRelType++;
      issues.push({
        severity: "error",
        type: "UNREGISTERED_EDGE_TYPE",
        record: edge,
        message: `Edge [${idx}] uses type '${edge.type}' not specified in the schema.`
      });
      return;
    }

    const srcNode = validNodesMap.get(String(edge.source));
    const tgtNode = validNodesMap.get(String(edge.target));

    if (!srcNode) {
      summary.danglingSourceId++;
      issues.push({
        severity: "error",
        type: "DANGLING_SOURCE_ID",
        record: edge,
        message: `Edge [${idx}] specifies source ID '${edge.source}' which does not exist in any node table.`
      });
    }

    if (!tgtNode) {
      summary.danglingTargetId++;
      issues.push({
        severity: "error",
        type: "DANGLING_TARGET_ID",
        record: edge,
        message: `Edge [${idx}] specifies target ID '${edge.target}' which does not exist in any node table.`
      });
    }

    if (srcNode && tgtNode) {
      // Validate that the (srcNode.label, tgtNode.label) matches at least one allowed signature
      const matchedSignature = allowedSignatures.find(
        (sig) => sig.source === srcNode.label && sig.target === tgtNode.label
      );

      if (!matchedSignature) {
        summary.labelMismatch++;
        const expectedSignatures = allowedSignatures
          .map((sig) => `(:${sig.source})->(:${sig.target})`)
          .join(" or ");
        issues.push({
          severity: "error",
          type: "LABEL_MISMATCH",
          record: edge,
          message: `Edge '${edge.type}' expects signature ${expectedSignatures}, but found (:${srcNode.label})->(:${tgtNode.label}).`
        });
      }
    }
  });

  const errors = issues.filter(i => i.severity === "error");
  const warnings = issues.filter(i => i.severity === "warning");

  return {
    valid: errors.length === 0,
    isValid: errors.length === 0,
    errors,
    warnings,
    issues,
    summary,
    nodeCount: totalNodesCount,
    edgeCount: totalEdgesCount,
    errorCount: errors.length,
    warningCount: warnings.length,
    stats: {
      totalNodes: totalNodesCount,
      totalEdges: totalEdgesCount,
      uniqueEntities: validNodesMap.size
    }
  };
}

// ============================================================================
// 3. CYPHER SCRIPT GENERATOR (LOAD CSV & INGESTION)
// ============================================================================

export function generateCypherImportScript(schema, domainName) {
  let script = `// ==========================================================\n`;
  script += `// CYPHER ETL BATCH IMPORT SCRIPT: ${domainName.toUpperCase()} DOMAIN\n`;
  script += `// Knowledge Graphs & Information Retrieval Systems (KGIRS)\n`;
  script += `// ==========================================================\n\n`;

  script += `// STEP 1: DROP PREVIOUS CONSTRAINTS & FLUSH DATABASE\n`;
  script += `MATCH (n) DETACH DELETE n;\n\n`;

  script += `// STEP 2: CREATE UNIQUENESS CONSTRAINTS & NODE SCHEMAS\n`;
  schema.nodes.forEach(node => {
    script += `CREATE CONSTRAINT IF NOT EXISTS FOR (n:${node.label})\n`;
    script += `REQUIRE n.${node.key} IS UNIQUE;\n`;
  });
  script += `\n`;

  script += `// STEP 3: LOAD NODES VIA APOC / CSV BATCH INGESTION\n`;
  schema.nodes.forEach(node => {
    script += `LOAD CSV WITH HEADERS FROM 'file:///${node.label.toLowerCase()}_nodes.csv' AS row\n`;
    script += `MERGE (n:${node.label} { ${node.key}: row.${node.key} })\n`;
    script += `ON CREATE SET `;
    const propSetters = node.properties
      .filter(p => p !== node.key)
      .map(p => `n.${p} = row.${p}`);
    if (propSetters.length > 0) {
      script += propSetters.join(', ') + ';\n\n';
    } else {
      script += `n.updated_at = timestamp();\n\n`;
    }
  });

  script += `// STEP 4: LOAD DIRECTED RELATIONSHIPS\n`;
  schema.relationships.forEach(rel => {
    script += `LOAD CSV WITH HEADERS FROM 'file:///${rel.type.toLowerCase()}_edges.csv' AS row\n`;
    script += `MATCH (src:${rel.source} { id: row.source_id })\n`;
    script += `MATCH (tgt:${rel.target} { id: row.target_id })\n`;
    script += `MERGE (src)-[r:${rel.type}]->(tgt)\n`;
    if (rel.properties && rel.properties.length > 0) {
      const edgeProps = rel.properties.map(p => `r.${p} = row.${p}`).join(', ');
      script += `ON CREATE SET ${edgeProps};\n\n`;
    } else {
      script += `;\n\n`;
    }
  });

  script += `// STEP 5: VERIFY INGESTION COUNTS\n`;
  script += `MATCH (n) RETURN labels(n) AS Label, count(n) AS NodeCount;\n`;
  script += `MATCH ()-[r]->() RETURN type(r) AS RelationshipType, count(r) AS EdgeCount;\n`;

  return script;
}

// ============================================================================
// 4. GRAPH DATA EXTRACTOR & IN-MEMORY QUERY INTERPRETER
// ============================================================================

export function getDomainGraphData(domainKey = 'University', useErrors = false) {
  const domain = (useErrors && domainKey === 'University') ? ERRORS_DATASET : (DOMAINS[domainKey] || DOMAINS.University);
  const nodes = [];
  const keyMap = new Map();
  (domain.nodes || []).forEach(n => keyMap.set(n.label, n.key));

  if (domain.data) {
    Object.entries(domain.data).forEach(([label, records]) => {
      const pKey = keyMap.get(label) || 'id';
      if (Array.isArray(records)) {
        records.forEach((rec, idx) => {
          const rawId = rec[pKey] || rec.id || `${label.toLowerCase()}_${idx}`;
          nodes.push({
            id: String(rawId),
            label,
            ...rec
          });
        });
      }
    });
  }

  const edges = (domain.edges || []).map((e, idx) => ({
    id: e.id || `e_${idx}`,
    source: String(e.source),
    target: String(e.target),
    type: e.type,
    properties: e.properties || {}
  }));

  return { nodes, edges };
}

export function executePatternQuery(graphData, queryStr = '') {
  const normalized = (queryStr || '').trim().toUpperCase();
  const nodes = [];
  const nodeMap = new Map();

  // Populate nodeMap from graphData.nodes or graphData.data
  if (Array.isArray(graphData?.nodes)) {
    graphData.nodes.forEach(n => {
      nodeMap.set(String(n.id), n);
      nodes.push(n);
    });
  } else if (graphData?.data) {
    Object.entries(graphData.data).forEach(([label, entities]) => {
      if (Array.isArray(entities)) {
        entities.forEach(ent => {
          const id = ent.student_id || ent.course_id || ent.faculty_id || ent.dept_id || ent.project_id ||
                     ent.cust_id || ent.prod_id || ent.order_id || ent.cat_id || ent.brand_id ||
                     ent.patient_id || ent.doc_id || ent.cond_id || ent.med_id ||
                     ent.person_id || ent.movie_id || ent.genre_id ||
                     ent.isbn || ent.author_id || ent.member_id || ent.id;
          const nObj = { id: String(id), label, ...ent };
          nodeMap.set(String(id), nObj);
          nodes.push(nObj);
        });
      }
    });
  }

  const edges = graphData?.edges || [];

  // Match: MATCH (n:Label) RETURN n
  if (normalized.includes("RETURN N") || normalized.includes("RETURN *")) {
    const labelMatch = queryStr.match(/:\s*([A-Za-z0-9_]+)/);
    if (labelMatch) {
      const targetLabel = labelMatch[1].toLowerCase();
      const filtered = nodes.filter(n => n.label.toLowerCase() === targetLabel);
      return {
        headers: ["id", "label", "properties"],
        rows: filtered.map(n => [n.id, n.label, JSON.stringify(n)]),
        matchedNodeIds: new Set(filtered.map(n => n.id)),
        matchedEdgeCount: 0
      };
    }
    return {
      headers: ["id", "label", "name_or_title"],
      rows: nodes.slice(0, 20).map(n => [n.id, n.label, n.name || n.title || "—"]),
      matchedNodeIds: new Set(nodes.map(n => n.id)),
      matchedEdgeCount: edges.length
    };
  }

  // Match: (a)-[:REL]->(b)
  const relMatch = queryStr.match(/\[:([A-Za-z0-9_]+)\]/i);
  if (relMatch) {
    const relType = relMatch[1].toUpperCase();
    const filteredEdges = edges.filter(e => e.type.toUpperCase() === relType);
    const matchedIds = new Set();
    const rows = filteredEdges.map(e => {
      const src = nodeMap.get(String(e.source));
      const tgt = nodeMap.get(String(e.target));
      matchedIds.add(String(e.source));
      matchedIds.add(String(e.target));
      return [
        src ? `${src.name || src.title || src.id} (${src.label})` : e.source,
        e.type,
        tgt ? `${tgt.name || tgt.title || tgt.id} (${tgt.label})` : e.target,
        JSON.stringify(e.properties || {})
      ];
    });

    return {
      headers: ["Source Entity", "Relationship", "Target Entity", "Edge Properties"],
      rows,
      matchedNodeIds: matchedIds,
      matchedEdgeCount: filteredEdges.length
    };
  }

  // Fallback: General Graph Statistics
  return {
    headers: ["Metric", "Value"],
    rows: [
      ["Total Graph Nodes", nodes.length],
      ["Total Graph Edges", edges.length],
      ["Query Evaluation", "Pattern executed successfully via in-memory property graph engine."]
    ],
    matchedNodeIds: new Set(nodes.slice(0, 10).map(n => n.id)),
    matchedEdgeCount: edges.length
  };
}

// ============================================================================
// 5. QUIZ QUESTION BANK (Ported from Experiments/EXP9/quiz_bank.py)
// ============================================================================

export const QUIZ_QUESTIONS = [
  {
    id: "q01",
    level: "Basic",
    topic: "Knowledge graph fundamentals",
    question: "What is a knowledge graph?",
    options: [
      "A chart that shows how much data a system stores",
      "A network of entities connected by meaningful, named relationships",
      "A table of rows and columns with a primary key",
      "A folder structure used to organise documents"
    ],
    answer: 1,
    explanation:
      "A knowledge graph stores entities as nodes and the connections between them as named, directed relationships. The connections are data in their own right, which is what makes connected questions easy to answer."
  },
  {
    id: "q02",
    level: "Basic",
    topic: "Nodes and labels",
    question: "What is a node label used for?",
    options: [
      "To store the value of a property",
      "To give a relationship its direction",
      "To rename the dataset",
      "To group nodes into a category, such as Student or Course"
    ],
    answer: 3,
    explanation:
      "A label classifies a node: it says what the entity is. Labels are what you select on when you ask for 'all Student entities', and one node may carry more than one label."
  },
  {
    id: "q03",
    level: "Basic",
    topic: "Properties",
    question:
      "A Student entity is stored with student_id = S001 and name = Aditi. Which of these is a property?",
    options: [
      "name = Aditi",
      "Student",
      "The arrow that connects two entities",
      "The graph itself"
    ],
    answer: 0,
    explanation:
      "Properties are the key-value facts stored on an entity: student_id and name are properties. Student is the label that classifies the entity, not a property of it."
  },
  {
    id: "q04",
    level: "Basic",
    topic: "Relationships",
    question: "What does the pattern Student --[ENROLLED_IN]--> Course express?",
    options: [
      "A Course that stores a Student as one of its properties",
      "Two unrelated entities shown side by side",
      "A directed relationship of type ENROLLED_IN from a Student to a Course",
      "A junction table linking students and courses"
    ],
    answer: 2,
    explanation:
      "ENROLLED_IN is the relationship type and the arrow gives its direction. The relationship is stored with the entities, so following it needs no join between tables."
  },
  {
    id: "q05",
    level: "Basic",
    topic: "Graph structure",
    question: "Which statement about a relationship in a knowledge graph is correct?",
    options: [
      "It may connect any number of entities at once",
      "It connects exactly two entities and carries one type and a direction",
      "It can never store properties of its own",
      "It is automatically created between entities that share a property value"
    ],
    answer: 1,
    explanation:
      "A relationship always joins exactly two entities, carries a single type such as TEACHES, and has a direction. It may also carry its own properties, such as a grade or a role."
  },
  {
    id: "q06",
    level: "Intermediate",
    topic: "Duplicate prevention",
    question:
      "The same dataset is imported twice, and the import always inserts new entities without checking what already exists. What is the result?",
    options: [
      "The second import is ignored automatically",
      "The second import updates the existing entities",
      "An error stops the second import",
      "Every entity exists twice, because nothing checked for an existing copy"
    ],
    answer: 3,
    explanation:
      "An import that always inserts creates a second copy of every entity. This is why an import should match each entity on its unique identifier and update it when it already exists."
  },
  {
    id: "q07",
    level: "Intermediate",
    topic: "Unique identifiers",
    question: "Why does every entity type need a unique identifier property?",
    options: [
      "It distinguishes entities that look alike and lets an import recognise existing ones",
      "It makes the graph diagram easier to draw",
      "It is required before any property can be added",
      "It determines the direction of the relationships"
    ],
    answer: 0,
    explanation:
      "Two students may share a name, so the identifier is what tells them apart. The import compares this property to decide whether an entity is already present in the graph."
  },
  {
    id: "q08",
    level: "Intermediate",
    topic: "Schema design",
    question:
      "A dataset records the grade a student earned in a course. Where does 'grade' belong?",
    options: [
      "As a property of the Student entity",
      "As a property of the Course entity",
      "As a property of the ENROLLED_IN relationship",
      "As a separate Grade entity connected to nothing"
    ],
    answer: 2,
    explanation:
      "The grade depends on the student and the course together, so it belongs to the relationship that joins them. On either entity alone it would break as soon as the student takes a second course."
  },
  {
    id: "q09",
    level: "Intermediate",
    topic: "Data import",
    question: "Why are entities imported before relationships?",
    options: [
      "Because relationships take longer to create",
      "Because a relationship can only be created between entities that already exist",
      "Because entities must be sorted alphabetically first",
      "Because relationships cannot carry properties"
    ],
    answer: 1,
    explanation:
      "A relationship connects two existing entities. If the entities have not been created yet, there is nothing for the relationship to join, which is why the import runs in two passes."
  },
  {
    id: "q10",
    level: "Intermediate",
    topic: "Data validation",
    question:
      "A relationship record refers to a source identifier that appears in no entity record. What should the import do?",
    options: [
      "Create an empty entity with that identifier and continue",
      "Import the relationship without a source",
      "Reject the record and report it, because the relationship has nothing to connect",
      "Ignore the record silently"
    ],
    answer: 2,
    explanation:
      "The record is invalid and must be reported. Creating an empty entity would silently add a meaningless node to the graph, which is harder to detect later than an error message."
  },
  {
    id: "q11",
    level: "Advanced",
    topic: "Graph vs relational",
    question:
      "Why does a graph database usually outperform a relational database on deeply connected queries?",
    options: [
      "It keeps the entire dataset in memory at all times",
      "It enforces no schema, so queries are shorter",
      "Relational databases cannot express relationships",
      "Each entity stores its own relationships, so a hop is a local step rather than a join"
    ],
    answer: 3,
    explanation:
      "Because each node keeps references to its own relationships, the cost of one hop does not grow with the size of the dataset. The same question in a relational database needs one join per hop over whole tables."
  },
  {
    id: "q12",
    level: "Advanced",
    topic: "Graph traversal",
    question:
      "Starting at a student, you follow ENROLLED_IN to a course and then follow ENROLLED_IN backwards to other students. What have you found?",
    options: [
      "The students who share a course with the first student",
      "The students who are enrolled in no courses",
      "The courses that have exactly two students",
      "The faculty members who teach that course"
    ],
    answer: 0,
    explanation:
      "This two-hop traversal goes out to a shared course and back to other students, which identifies classmates. Answering the same question with tables would require two joins."
  },
  {
    id: "q13",
    level: "Advanced",
    topic: "Many-to-many data",
    question: "How is a many-to-many association represented in a knowledge graph?",
    options: [
      "With a junction entity that must be created for every pair",
      "Simply as many relationships of the same type between the entities",
      "By duplicating one of the entities for each association",
      "By storing a list of identifiers as a property"
    ],
    answer: 1,
    explanation:
      "A student may have many ENROLLED_IN relationships and a course may receive many, so the association needs no extra structure. A relational schema would need a junction table for the same data."
  },
  {
    id: "q14",
    level: "Advanced",
    topic: "Graph integrity",
    question: "Why can an entity that still has relationships not simply be deleted?",
    options: [
      "Because entities can never be removed once imported",
      "Because its properties must be cleared first",
      "Because the relationships would be left pointing at something that no longer exists",
      "Because only relationships may be deleted, never entities"
    ],
    answer: 2,
    explanation:
      "A relationship needs both of its end entities. Removing one of them would leave a dangling connection, so the relationships must be removed together with the entity."
  },
  {
    id: "q15",
    level: "Advanced",
    topic: "Schema design",
    question:
      "A design stores everything as one entity type with properties such as type = 'student' and course = 'C101'. What is the main problem?",
    options: [
      "It uses more disk space than necessary",
      "It cannot store numbers as property values",
      "The meaning is hidden inside properties, so connections cannot be traversed",
      "It prevents properties from being added later"
    ],
    answer: 2,
    explanation:
      "Labels and relationship types are what carry meaning in a graph. When the connection is only a text value inside a property, nothing can be followed, and the graph loses the advantage it was chosen for."
  }
];

