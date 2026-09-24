# Experiment 10: Create and Manage a Graph Database

## Overview
This module is the virtual laboratory implementation for **Experiment 10: Create and Manage a Graph Database** (Course Code: `CS-KG-10`, Track: `Knowledge Graphs`).

Converted from the legacy Streamlit experiment in `Experiments/EXP8`, this module provides a complete, modern, interactive, and cloud-integrated web workbench designed for computer engineering scholars studying Graph Databases, Labeled Property Graph (LPG) models, Index-Free Adjacency (IFA), and the Cypher query language.

---

## Architectural Breakdown

```
src/experiments/exp10/
├── graphDatabaseEngine.js       # In-memory Property Graph & openCypher Query Engine
├── index.jsx                    # Root coordinator component with tab management & Firebase sync
├── README.md                    # Module documentation
└── components/
    ├── TheorySection.jsx        # LPG model, RDBMS vs Graph comparison, IFA mechanics & cheat sheets
    ├── LabSection.jsx           # Interactive Cypher console, visual builder, SVG force graph & metrics
    ├── QuizSection.jsx          # 12 rigorous assessment questions with immediate feedback & scoring
    ├── CertificateSection.jsx   # Dynamic grade calculation (A+, A, B, C, F) & verified print layout
    └── ReportSection.jsx        # Comprehensive lab record, trial logs, observations & PDF export
```

---

## Key Features & Capabilities

### 1. In-Memory Graph Database & Cypher Engine (`graphDatabaseEngine.js`)
- **Index-Free Adjacency (IFA)**: Direct pointer-based adjacency structure tracking incoming and outgoing relationships per node for O(1) edge traversal.
- **Declarative Cypher Query Execution**:
  - `MATCH (n:Label {prop: val})-[:REL]->(m:Target) WHERE ... RETURN ...`
  - `CREATE (n:Label {id: '...', name: '...'})`
  - `CREATE (a)-[:TYPE {weight: 1.0}]->(b)`
  - `SET n.prop = 'new_val'`
  - `DELETE n` (with referential integrity validation — prevents deletion of connected nodes)
  - `DETACH DELETE n` (cascading edge deletion before node removal)
  - Aggregations: `count(n)`, `avg(n.prop)`
- **Three Preloaded Knowledge Graphs**:
  1. *University Academic Graph*: Students, Faculty, Courses, Departments, and enrollment/teaching connections.
  2. *Social Network & Community Graph*: Users, Interests, Friendships, and multi-hop circles.
  3. *Financial Fraud Ring*: Accounts, Merchants, Device fingerprints, and suspicious circular transfers.

### 2. Interactive Simulation Lab (`LabSection.jsx`)
- **Cypher Query Terminal**: Real-time syntax execution with timing metrics, returned record tables, and raw JSON views.
- **Visual Graph Builder**: GUI forms for adding nodes with dynamic properties, linking nodes with typed relationships, and performing deletions or detach-deletions.
- **Interactive SVG Knowledge Graph**:
  - Live force-directed layout with collision detection.
  - Interactive node dragging, canvas panning, and zoom controls.
  - Node hover badges, directional arrows, and click-to-inspect detail drawer.
- **Graph Topology Metrics**: Real-time computation of $|V|$, $|E|$, graph density, average degree, and label distributions.
- **Session Trial Logging**: Automatically logs every query execution and visual mutation for inclusion in the final lab report.

### 3. Rigorous 12-Question Assessment (`QuizSection.jsx`)
- 12 comprehensive multiple-choice questions ported and expanded from `Experiments/EXP8/app.py`.
- Immediate answer validation with in-depth pedagogical explanations.
- Tracks score, completion percentage, and pass/review status (70% threshold).

### 4. Verified Certificate (`CertificateSection.jsx`)
- Automatic grade calculation (`A+`, `A`, `B`, `C`, `F`).
- Verification hash (`CERT-KG10-...`) and printable certificate design.
- Direct synchronization with Google Cloud Firestore (`users/{uid}/certificates/exp_10`).

### 5. Official Lab Report (`ReportSection.jsx`)
- Auto-compiles lab metadata, objectives, experimental observations, trial history, and KPIs.
- Editable discussion notes and faculty signature block.
- Standard CSS print styling for one-click PDF generation.
