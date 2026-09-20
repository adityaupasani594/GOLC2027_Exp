# Experiment 15: Evaluation of Retrieval Systems

## Overview
This folder contains the complete interactive virtual laboratory implementation for **Experiment 15: Evaluation of Retrieval Systems** (Precision, Recall, F1-Score, and Mean Reciprocal Rank).

## Directory Structure
- `index.jsx`: Primary Experiment 15 component, tab management (Theory, Visual Lab, Quiz, Certificate, Report), and navbar.
- `components/`:
  - `TheorySection.jsx`: Theoretical derivations, formulas, definitions, and worked examples.
  - `LabSection.jsx`: Visual interactive retrieval simulation comparing BM25, Dense Semantic, RRF Hybrid, and GraphRAG systems across standard queries with dynamic metric computation.
  - `QuizSection.jsx`: Interactive assessment module testing precision, recall, F1, and MRR understanding.
  - `CertificateSection.jsx`: Automated verified certificate generation upon quiz completion.
  - `ReportSection.jsx`: Standardized lab report with empirical comparison tables ready for PDF export / printing.
  - `useMathJax.jsx`: LaTeX math rendering hook and MathJax wrapper components.
- `data/`:
  - `labData.js`: Master benchmark queries, candidate documents, ground-truth relevance judgements, ranking data, and quiz question bank.
