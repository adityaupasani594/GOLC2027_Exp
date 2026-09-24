# Experiment 7: Relationship Extraction from Text

## Overview
This directory contains the production React–Firebase implementation of **Experiment 7: Relationship Extraction from Text**, converted directly from the Python Streamlit codebase (`Experiments/EXP7/app.py` & `requirements.txt`).

Part of the **Knowledge Graph & Information Retrieval Systems (KGIRS)** Virtual Laboratory (VESIT, Department of Computer Engineering).

---

## Architectural Conversion Details

| Feature in Streamlit (`app.py`) | React–Firebase Implementation (`src/experiments/exp7/`) |
| :--- | :--- |
| **NLP Pipeline (spaCy)** | Client-side rule-based NLP extraction engine (`relationshipExtractionEngine.js`) |
| **Named Entity Recognition (NER)** | Automatic categorization (PERSON, ORG, GPE, LOC, PRODUCT, CONCEPT) with color badges |
| **Dependency Parsing & Syntactic Rules** | Active voice, passive voice inversion, succession relations, role affiliations, prepositional attachments, and negation filtering |
| **NetworkX + PyVis Graph** | Dynamic force-directed SVG/Canvas Knowledge Graph with interactive node drag, physics, zoom, pan, and inspector drawer |
| **Self-Grading Quiz** | Interactive 10-question conceptual assessment with explanations, full/quick modes, instant scoring, and retake attempts |
| **Certificate Generation** | Achievement Certificate with auto-calculated grade badge (A+, A, B, C, F), digital watermark, signature blocks, and print support |
| **Report Generation & PDF Export** | Lab report generator compiling student info, quiz grade, trial runs, and extracted triples with instant browser PDF export |
| **Firebase Cloud Integration** | Direct synchronization with Cloud Firestore (`users/{uid}/progress`, `users/{uid}/certificates`, `users/{uid}/reports`) and LocalStorage fallback |

---

## File Structure

- `index.jsx`: Primary experiment orchestrator, tab coordinator, and Firebase progress state synchronizer.
- `relationshipExtractionEngine.js`: Core NLP engine, normalization dictionaries, benchmark datasets, and CSV/JSON exporters.
- `components/TheorySection.jsx`: Theoretical concepts, 5-stage interactive pipeline stepper, syntax handling breakdown, objectives, and terminology table.
- `components/LabSection.jsx`: Interactive extraction workbench, benchmark selector, custom textarea, document uploader, force-directed SVG Knowledge Graph, and trials recorder.
- `components/QuizSection.jsx`: Conceptual 10-question self-grading quiz with instant feedback, explanations, and threshold qualification.
- `components/CertificateSection.jsx`: Formal certificate of achievement with Firestore persistence and print-ready stylesheet.
- `components/ReportSection.jsx`: Official examination report generator with discussion notes, trial metrics, and PDF export.
