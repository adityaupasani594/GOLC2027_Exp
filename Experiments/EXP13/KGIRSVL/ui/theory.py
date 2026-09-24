"""
UI Renderer for Section 1: Theory Framework & Background (BM25 & Semantic Hybrid Retrieval)
"""

import pandas as pd
import streamlit as st

THEORY_TEXT = """
### 1. Overview & Principles of Information Retrieval (IR)
Information Retrieval (IR) systems locate relevant documents from large unstructured text corpora to satisfy a user's information need expressed as a query. Modern web search engines and scientific literature search engines rely on two complementary paradigms:

1. **BM25 Lexical Retrieval (Okapi BM25)**: Probabilistic keyword matching based on term frequency, document length normalization, and inverse document frequency. It excels at specific entity names, jargon, model codes, and rare technical keywords.
2. **Dense Semantic Retrieval (Sentence Transformers / Vector Search)**: Captures conceptual meaning, context, and paraphrases using high-dimensional dense neural embeddings ($d=384$). It handles synonymy, vocabulary mismatch, and complex natural language queries.

---

### 2. BM25 Lexical Retrieval Formulation

Okapi BM25 evaluates the relevance of a document $d$ for a search query $q$ consisting of terms $t \in q$:

$$\\text{BM25}(q, d) = \\sum_{t \\in q} \\text{IDF}(t) \\times \\frac{f(t, d) \\cdot (k_1 + 1)}{f(t, d) + k_1 \\cdot \\left( 1 - b + b \\cdot \\frac{|d|}{\\text{avgdl}} \\right)}$$

where:
- $f(t, d)$ is the raw term frequency of term $t$ in document $d$.
- $|d|$ is the length of document $d$ (total token count).
- $\\text{avgdl}$ is the average document length across the entire corpus.
- $\\text{IDF}(t)$ is the Robertson-Spärck Jones Inverse Document Frequency:
  $$\\text{IDF}(t) = \\ln \\left( \\frac{N - \\text{DF}(t) + 0.5}{\\text{DF}(t) + 0.5} + 1 \\right)$$

#### Core Mechanisms of BM25:
- **Term Frequency Saturation ($k_1$)**: Governs how rapidly additional occurrences of a query term diminish in marginal value. Higher $k_1$ allows term frequency to increase score linearly for longer, while standard values ($k_1 \\in [1.2, 2.0]$, default $1.5$) cap score contribution as $f(t,d) \\to \\infty$.
- **Document Length Normalization ($b$)**: Penalizes long documents that contain query terms purely due to verbose length rather than dense relevance ($b \\in [0.0, 1.0]$, default $0.75$). When $b = 1$, document length is fully normalized; when $b = 0$, length normalization is disabled.

---

### 3. Score Normalization & Hybrid Fusion

#### A. Min-Max Score Normalization
Because raw BM25 scores (ranging from $0$ to $30+$) and dense semantic similarity scores (ranging from $-1$ to $+1$) belong to different score distributions, both score vectors are normalized to $[0, 1]$ before fusion:

$$S_{\\text{BM25, norm}} = \\frac{S_{\\text{BM25}} - \\min(S_{\\text{BM25}})}{\\max(S_{\\text{BM25}}) - \\min(S_{\\text{BM25}}) + \\epsilon}$$

$$S_{\\text{sem, norm}} = \\frac{S_{\\text{sem}} - \\min(S_{\\text{sem}})}{\\max(S_{\\text{sem}}) - \\min(S_{\\text{sem}}) + \\epsilon}$$

#### B. Weighted Score Fusion (Hybrid Score)
$$\\text{Hybrid Score} = \\alpha \\times S_{\\text{BM25, norm}} + (1 - \\alpha) \\times S_{\\text{sem, norm}}, \\quad \\text{where } \\alpha \\in [0.0, 1.0]$$

---

### 4. Evaluation Metrics

- **Precision@K**: Fraction of top-$K$ retrieved documents that are relevant.
  $$\\text{Precision}@K = \\frac{|\\text{Retrieved}_K \\cap \\text{Relevant}|}{K}$$

- **Recall@K**: Fraction of all relevant documents present in top-$K$.
  $$\\text{Recall}@K = \\frac{|\\text{Retrieved}_K \\cap \\text{Relevant}|}{|\\text{Relevant}|}$$

- **F1-Score@K**: Harmonic mean of Precision@K and Recall@K.
  $$\\text{F1}@K = 2 \\times \\frac{\\text{Precision}@K \\times \\text{Recall}@K}{\\text{Precision}@K + \\text{Recall}@K}$$

- **Mean Reciprocal Rank (MRR@K)**: Reciprocal rank of the first relevant document.
  $$\\text{MRR}@K = \\frac{1}{\\text{rank}_{\\text{first relevant}}}$$

- **Normalized Discounted Cumulative Gain (nDCG@K)**: Evaluates ranked positioning of relevant documents with logarithmic discounting.
  $$\\text{nDCG}@K = \\frac{\\text{DCG}@K}{\\text{IDCG}@K}, \\quad \\text{DCG}@K = \\sum_{i=1}^K \\frac{r_i}{\\log_2(i + 1)}$$
"""

OBJECTIVES = [
    "Understand the complementary mechanisms of BM25 probabilistic lexical search and dense semantic vector search.",
    "Master BM25 hyperparameter tuning: term frequency saturation (k1=1.5) and document length normalization (b=0.75).",
    "Implement score normalization (Min-Max Scaling) and convex score fusion: Hybrid = \u03b1 \u00d7 BM25 + (1-\u03b1) \u00d7 Semantic.",
    "Analyze document rank transitions across retrieval paradigms using interactive BM25 \u2192 Hybrid \u2192 Semantic rank shift charts.",
    "Perform Retrieval X-Ray analysis to inspect exact numerical score contributions of top BM25 and semantic results.",
    "Evaluate IR performance using SciFact ground-truth qrels with Precision@K, Recall@K, F1@K, MRR@K, and nDCG@K across varying \u03b1 values."
]

PROCEDURE_STEPS = [
    "Step 1: Review the theoretical background, BM25 formula, and evaluation metric definitions in this tab.",
    "Step 2: Navigate to the **Simulation** section in the sidebar menu.",
    "Step 3: Select an evaluation query from the BEIR SciFact benchmark or enter a custom query.",
    "Step 4: Adjust the BM25 weight slider (\u03b1) from 0.0 (pure semantic) to 1.0 (pure BM25) and experiment with k1 saturation.",
    "Step 5: Inspect the 3 retrieval result columns (BM25 Lexical, Semantic, Hybrid) and expand document abstract previews.",
    "Step 6: Explore the **Retrieval X-Ray** panel to examine the exact numerical BM25 and semantic score contributions.",
    "Step 7: Analyze the **\u03b1 Weight Sensitivity Analysis** Plotly curve to find optimal hybrid weightings.",
    "Step 8: Click **Record Current Trial** to save parameter settings and benchmark evaluation metrics.",
    "Step 9: Complete the **Quiz** to evaluate conceptual understanding.",
    "Step 10: Open **Report Generation**, enter student credentials, and download your official PDF report."
]

KEY_TERMS = {
    "Okapi BM25": "Probabilistic lexical search algorithm incorporating term frequency saturation (k1) and length normalization (b).",
    "Term Frequency Saturation (k1)": "Hyperparameter capping the score contribution of high term frequencies (default k1=1.5).",
    "Document Length Normalization (b)": "Hyperparameter penalizing verbose documents that match terms merely due to long length (default b=0.75).",
    "SentenceTransformer": "Dense neural encoder (all-MiniLM-L6-v2) embedding sentences into 384-dimensional dense semantic vectors.",
    "Min-Max Normalization": "Rescaling heterogeneous BM25 and dense similarity scores into [0, 1] prior to weighted fusion.",
    "Hybrid Score Fusion": "Combining normalized BM25 and dense semantic scores using weighting factor \u03b1.",
    "Retrieval X-Ray": "Mathematical breakdown displaying raw BM25/semantic scores, normalized scores, and individual weighted contributions.",
    "Precision@K / MRR@K / nDCG@K": "Standard IR evaluation metrics assessing accuracy, reciprocal rank, and discounted gain against ground-truth qrels."
}


def render_theory_section():
    """Renders Section 1: Theory Framework."""
    st.header("Theoretical Framework & Mathematical Foundations")
    st.markdown(THEORY_TEXT)

    st.divider()
    st.subheader("Learning Objectives")
    for i, obj in enumerate(OBJECTIVES, 1):
        st.write(f"- **Goal {i}**: {obj}")

    st.divider()
    st.subheader("Experimental Procedure")
    for step in PROCEDURE_STEPS:
        st.write(f"- {step}")

    st.divider()
    st.subheader("Key Terminology Reference")
    df_terms = pd.DataFrame(
        list(KEY_TERMS.items()),
        columns=["Term / Concept", "Definition & Significance"]
    )
    st.table(df_terms)
