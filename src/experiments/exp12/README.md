# Experiment 12: Query Knowledge Graphs with Pattern-Based Queries

## Overview
This folder contains the complete, production-grade implementation of **Experiment 12: Query Knowledge Graphs with Pattern-Based Queries** for the Information Retrieval & Knowledge Graphs Virtual Laboratory (VESIT, Department of Computer Engineering).

## Architectural Structure
- `index.jsx`: Primary orchestrator managing the 5 lab workflow tabs (`theory`, `lab`, `quiz`, `certificate`, `report`), student state, and Firebase/LocalStorage synchronization.
- `graphQueryEngine.js`: Graph database schema, mini movie knowledge graph (16 nodes, 25 typed edges), declarative query engine (`executeNodeLookup`, `executeOneHop`, `executeMultiHop`, `executeCustomQuery`), preset benchmarks, theory data, and 10 self-grading quiz questions.
- `components/TheorySection.jsx`: Interactive concept explorer with StreamPick industry case study, property graph model breakdown, procedural guide, and searchable terminology glossary.
- `components/LabSection.jsx`: Interactive SVG simulation canvas featuring pan/zoom/drag controls, flowing animated traversal dashes, pulsing halo rings, multi-speed playback controls, node inspector drawer, dynamic query builder, raw query editor, and results table with CSV/JSON exports.
- `components/QuizSection.jsx`: 10-question self-grading conceptual quiz with immediate rationale and score tracking.
- `components/CertificateSection.jsx`: Verified digital certificate with official seal, letter grade calculations, student credentials, and print/PDF support.
- `components/ReportSection.jsx`: Formal laboratory report compiler with trials summary table, student observations, and signature deck.
