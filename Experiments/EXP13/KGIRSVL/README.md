# KGIRS Virtual Lab: Hybrid Keyword and Semantic Retrieval

A Virtual Laboratory project for **Knowledge Graph and Information Retrieval Systems (KGIRS)** demonstrating how Okapi BM25 lexical search and dense semantic search (`all-MiniLM-L6-v2`) complement each other using real benchmark data.

## Features & Highlights

- **Mandatory 4-Section Baseline Structure**: Built on the official professor template structure (**Theory**, **Simulation**, **Quiz**, **Report Generation**).
- **Real IR Benchmark**: Uses the official **BEIR SciFact** dataset (5,183 scientific papers, 1,109 queries, test qrels) cached locally.
- **Mathematical Retrieval Methods**:
  1. **BM25 Lexical Retrieval**: Okapi BM25 algorithm with term frequency saturation ($k_1$), document length normalization ($b$), and matched term analysis.
  2. **Dense Semantic Retrieval**: Sentence Transformers (`all-MiniLM-L6-v2`) vector embeddings with disk caching.
  3. **Convex Weighted Score Fusion**: Min-Max score normalization with interactive $\alpha$ weight slider:
     $$\text{Hybrid Score} = \alpha \times S_{\text{BM25}} + (1 - \alpha) \times S_{\text{sem}}$$
- **Retrieval X-Ray ("Why did this document rank here?")**: 100% auditable mathematical breakdown of raw BM25/semantic scores, normalized scores, BM25 contribution, and semantic contribution.
- **Rank Shift Analysis**: Interactive Plotly trajectories showing document rank movements (BM25 $\rightarrow$ Hybrid $\rightarrow$ Semantic).
- **Weight Sensitivity Analysis**: Plotly evaluation curve evaluating $\alpha \in [0.0, 1.0]$ against SciFact ground-truth qrels (Precision@K, Recall@K, F1@K, MRR@K, nDCG@K).
- **10-Question Assessment Quiz**: Instant self-grading covering BM25 $k_1$, $b$, term saturation, length penalty, and score fusion.
- **PDF Report Generator**: Compiles student metadata, session trial log table, custom observations, and quiz evaluation into an official downloadable PDF report via `fpdf2`.

## Running the Application

```bash
pip install -r requirements.txt
streamlit run app.py
```
