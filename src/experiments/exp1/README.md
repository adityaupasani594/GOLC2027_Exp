# Experiment 1: Multimodal Tokenization for Information Retrieval

## Overview
This folder contains the complete, pure React/JSX modular implementation of **Experiment 1: Multimodal Tokenization for Information Retrieval** for the Knowledge Graphs & Information Retrieval Systems (KGIRS) Virtual Laboratory (VESIT, Department of Computer Engineering).

All computation (text tokenization, Porter stemmer, stop-word removal, image patch partitioning, audio waveform temporal framing, and video keyframe extraction) runs natively in the browser via pure JavaScript, Canvas API, and Web Audio API without requiring Python or external backend servers.

## File Structure
- `index.jsx`: Master container coordinating the 5 laboratory sections and state management.
- `tokenizationEngine.js`: Algorithmic engine for:
  - Text normalization, regex tokenization, stop-word filtering (~318 words), and Porter stemmer.
  - 2D Image patch extraction (Vision Transformer paradigm: P×P px grid, average RGB values, 1D visual token sequence).
  - 1D Audio temporal framing (uniform Δt ms segmentation, RMS amplitude, frame boundary calculation).
  - 3D Video spatiotemporal keyframe sampling (temporal redundancy reduction, timestamp metadata).
  - Cross-modality comparison matrix data.
- `components/`:
  - `TheorySection.jsx`: Educational background, comparison matrix, 4 architectural pillars, interactive live synthetic playgrounds for each modality, pipeline architecture, and terminology glossary.
  - `LabSection.jsx`: Interactive workbench with sub-tabs for Text, Image, Audio, and Video, parameter controls, live previews, and session trial logging.
  - `QuizSection.jsx`: 10-question self-grading conceptual assessment with instant verification and explanations.
  - `CertificateSection.jsx`: Official verified completion certificate with candidate credentials, grade calculation, and direct print functionality.
  - `ReportSection.jsx`: Certified laboratory report compiling student metadata, trial records table, observations, and PDF/CSV export.
