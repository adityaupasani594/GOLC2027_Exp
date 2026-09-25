import math
import re
import io
import datetime
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import streamlit as st
from fpdf import FPDF
import random
import tempfile
import os
from string import Template
from streamlit import config as _st_config

# ─────────────────────────────────────────────────────────────────────────────
#  PAGE CONFIG
# ─────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="BM25 Document Ranking – IIT KGP Virtual Lab",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─────────────────────────────────────────────────────────────────────────────
#  VISUAL THEME  –  light by default, with an opt-in dark mode
#  The palette is pushed into Streamlit's own theme config so that native
#  widgets, dataframes and Plotly charts all follow the selected mode.
#  (Theme config is process-wide, which is what we want for a single-user lab.)
# ─────────────────────────────────────────────────────────────────────────────

LIGHT_THEME = {
    "base": "light",
    "primaryColor": "#4F46E5",
    "backgroundColor": "#F5F7FC",
    "secondaryBackgroundColor": "#FFFFFF",
    "textColor": "#111827",
    "borderColor": "#E4E8F2",
    "dataframeHeaderBackgroundColor": "#EEF1F9",
    "codeBackgroundColor": "#F1F3FA",
    "codeTextColor": "#3730A3",
    "linkColor": "#4338CA",
    "baseRadius": "0.6rem",
    "buttonRadius": "0.6rem",
    "showWidgetBorder": True,
    "linkUnderline": False,
}

DARK_THEME = {
    "base": "dark",
    "primaryColor": "#818CF8",
    "backgroundColor": "#0E1220",
    "secondaryBackgroundColor": "#161C2E",
    "textColor": "#E8ECF7",
    "borderColor": "#2B3452",
    "dataframeHeaderBackgroundColor": "#1E2539",
    "codeBackgroundColor": "#1B2136",
    "codeTextColor": "#A5B4FC",
    "linkColor": "#A5B4FC",
    "baseRadius": "0.6rem",
    "buttonRadius": "0.6rem",
    "showWidgetBorder": True,
    "linkUnderline": False,
}

LIGHT_TOKENS = {
    "surface": "#FFFFFF",
    "surface_alt": "#EEF1F8",
    "border": "#E4E8F2",
    "text": "#111827",
    "muted": "#5A647B",
    "accent": "#4F46E5",
    "accent_soft": "#EEF0FE",
    "accent_border": "#C9CDF9",
    "shadow": "0 1px 2px rgba(16,24,40,.05), 0 10px 30px -18px rgba(16,24,40,.45)",
    "hero_grad": "linear-gradient(135deg,#EEF0FE 0%,#F7F9FF 55%,#FFFFFF 100%)",
    "hero_border": "#D8DCFB",
}

DARK_TOKENS = {
    "surface": "#161C2E",
    "surface_alt": "#1E2539",
    "border": "#2B3452",
    "text": "#E8ECF7",
    "muted": "#9CA7C2",
    "accent": "#818CF8",
    "accent_soft": "#232B49",
    "accent_border": "#3A4670",
    "shadow": "0 1px 2px rgba(0,0,0,.35), 0 14px 34px -20px rgba(0,0,0,.95)",
    "hero_grad": "linear-gradient(135deg,#1E2544 0%,#171D2F 55%,#141A2A 100%)",
    "hero_border": "#333D63",
}

_STYLESHEET = Template("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root{
  --lab-surface:$surface;
  --lab-surface-alt:$surface_alt;
  --lab-border:$border;
  --lab-text:$text;
  --lab-muted:$muted;
  --lab-accent:$accent;
  --lab-accent-soft:$accent_soft;
  --lab-accent-border:$accent_border;
  --lab-shadow:$shadow;
}

/* ── Typography ─────────────────────────────────────────────────────────── */
html, body, .stApp, [data-testid="stAppViewContainer"], [data-testid="stSidebar"]{
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif !important;
}
h1,h2,h3,h4,h5{
  font-family:'Plus Jakarta Sans','Inter',sans-serif !important;
  letter-spacing:-.021em;
}
code,pre,kbd,samp{
  font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace !important;
}
h1{font-size:2.05rem !important;font-weight:800 !important;margin-bottom:.2rem !important;}
h2{font-size:1.38rem !important;font-weight:700 !important;padding-top:.4rem !important;}
h3{font-size:1.08rem !important;font-weight:700 !important;}

/* ── Page frame ─────────────────────────────────────────────────────────── */
[data-testid="stHeader"]{background:transparent;}
[data-testid="stMainBlockContainer"]{padding-top:2.6rem;padding-bottom:4rem;max-width:1340px;}
hr{border-color:var(--lab-border) !important;}

/* ── Sidebar ────────────────────────────────────────────────────────────── */
[data-testid="stSidebar"]{border-right:1px solid var(--lab-border);}
[data-testid="stSidebar"] [data-testid="stRadioGroup"]{gap:.12rem;}
[data-testid="stSidebar"] [data-testid="stRadioOption"]{
  padding:.4rem .55rem;border-radius:.55rem;border:1px solid transparent;
  transition:background .14s ease,border-color .14s ease;
}
[data-testid="stSidebar"] [data-testid="stRadioOption"]:hover{background:var(--lab-accent-soft);}
[data-testid="stSidebar"] [data-testid="stRadioOption"]:has(input:checked){
  background:var(--lab-accent-soft);border-color:var(--lab-accent-border);
}
[data-testid="stSidebar"] [data-testid="stRadioOption"]:has(input:checked) p{
  color:var(--lab-accent);font-weight:600;
}
.lab-side-brand{display:flex;gap:.65rem;align-items:center;margin-bottom:.9rem;}
.lab-side-logo{
  width:40px;height:40px;flex:0 0 40px;border-radius:.75rem;font-size:1.15rem;
  background:var(--lab-accent-soft);border:1px solid var(--lab-accent-border);
  display:flex;align-items:center;justify-content:center;
}
.lab-side-title{
  font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.02rem;
  line-height:1.2;color:var(--lab-text);
}
.lab-side-sub{font-size:.72rem;color:var(--lab-muted);margin-top:.1rem;}
.lab-side-label{
  font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:var(--lab-muted);margin:.2rem 0 .45rem;
}

/* ── Widgets & containers ───────────────────────────────────────────────── */
[data-testid="stMetric"]{
  background:var(--lab-surface);border:1px solid var(--lab-border);
  border-radius:.8rem;padding:.8rem .95rem;box-shadow:var(--lab-shadow);
}
[data-testid="stMetricLabel"] p{
  color:var(--lab-muted) !important;font-size:.75rem !important;font-weight:600 !important;
  letter-spacing:.04em;
}
[data-testid="stExpander"]{
  border:1px solid var(--lab-border) !important;border-radius:.8rem !important;
  background:var(--lab-surface);box-shadow:var(--lab-shadow);overflow:hidden;
}
[data-testid="stExpander"] summary{font-weight:600;}
[data-testid="stExpander"] summary:hover{color:var(--lab-accent);}
[data-testid="stPlotlyChart"]{
  background:var(--lab-surface);border:1px solid var(--lab-border);
  border-radius:.85rem;padding:.45rem;box-shadow:var(--lab-shadow);
}
[data-testid="stDataFrame"]{border-radius:.6rem;overflow:hidden;}
[data-testid="stAlert"]{border-radius:.75rem;}
[data-baseweb="tab-list"]{gap:.3rem;border-bottom:1px solid var(--lab-border);}
[data-baseweb="tab"]{border-radius:.55rem .55rem 0 0;font-weight:600;}
[data-baseweb="tab"]:hover{background:var(--lab-accent-soft);}
.stButton>button,[data-testid="stDownloadButton"]>button{
  font-weight:600;transition:transform .12s ease,box-shadow .12s ease;
}
.stButton>button:hover,[data-testid="stDownloadButton"]>button:hover{
  transform:translateY(-1px);box-shadow:var(--lab-shadow);
}
[data-testid="stProgress"] > div > div > div{border-radius:99px;}

/* ── Lab components ─────────────────────────────────────────────────────── */
.lab-hero{
  background:$hero_grad;border:1px solid $hero_border;border-radius:1.1rem;
  padding:1.75rem 1.95rem 1.85rem;box-shadow:var(--lab-shadow);margin-bottom:1.5rem;
}
.lab-eyebrow{
  font-size:.76rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:var(--lab-accent);
}
.lab-hero-title{
  font-family:'Plus Jakarta Sans',sans-serif;font-size:2.2rem;font-weight:800;
  line-height:1.15;letter-spacing:-.025em;color:var(--lab-text);margin:.45rem 0 1.25rem;
}
.lab-aim{border-left:4px solid var(--lab-accent);padding-left:1.05rem;}
.lab-aim-label{
  font-size:.72rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
  color:var(--lab-muted);margin-bottom:.35rem;
}
.lab-aim-text{
  font-size:1.34rem;line-height:1.55;font-weight:500;color:var(--lab-text);margin:0;
}
.lo-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));
  gap:.85rem;margin:.2rem 0 .4rem;
}
.lo-card{
  background:var(--lab-surface);border:1px solid var(--lab-border);border-radius:.9rem;
  padding:1rem 1.15rem 1.1rem;box-shadow:var(--lab-shadow);
  transition:transform .15s ease,border-color .15s ease;
}
.lo-card:hover{transform:translateY(-2px);border-color:var(--lab-accent-border);}
.lo-badge{
  display:inline-block;font-size:.68rem;font-weight:700;letter-spacing:.08em;
  padding:.15rem .5rem;border-radius:.4rem;background:var(--lab-accent-soft);
  color:var(--lab-accent);border:1px solid var(--lab-accent-border);
}
.lo-title{
  font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:1rem;
  color:var(--lab-text);margin:.5rem 0 .25rem;
}
.lo-card p{color:var(--lab-muted);font-size:.9rem;line-height:1.6;margin:0;}
.prose-card{
  background:var(--lab-surface);border:1px solid var(--lab-border);border-radius:.9rem;
  padding:1.25rem 1.45rem;box-shadow:var(--lab-shadow);
}
.prose-card p{
  color:var(--lab-text);font-size:.95rem;line-height:1.7;margin:0 0 .9rem;
}
.prose-card p:last-child{margin-bottom:0;}
.prose-card strong{color:var(--lab-accent);}
.goal-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:.85rem;
}
.goal-card{
  background:var(--lab-surface);border:1px solid var(--lab-border);border-radius:.9rem;
  padding:1rem 1.15rem;box-shadow:var(--lab-shadow);
}
.goal-card ul{margin:0;padding-left:1.15rem;color:var(--lab-muted);}
.goal-card li{font-size:.92rem;line-height:1.75;}
</style>
""")


def _apply_theme(dark_mode: bool) -> None:
    """Push the selected palette into Streamlit's theme configuration."""
    palette = DARK_THEME if dark_mode else LIGHT_THEME
    if st.get_option("theme.backgroundColor") != palette["backgroundColor"]:
        for key, value in palette.items():
            _st_config.set_option(f"theme.{key}", value)
        # The theme is sent to the browser when a script run starts, so rerun
        # once to make the new palette take effect immediately.
        st.rerun()


st.session_state.setdefault("dark_mode", False)
_apply_theme(st.session_state["dark_mode"])
st.markdown(
    _STYLESHEET.substitute(DARK_TOKENS if st.session_state["dark_mode"] else LIGHT_TOKENS),
    unsafe_allow_html=True,
)


# ─────────────────────────────────────────────────────────────────────────────
#  BUILT-IN CORPUS  (15 IR-domain documents)
# ─────────────────────────────────────────────────────────────────────────────
DEFAULT_CORPUS = [
    {
        "id": "D01",
        "title": "Introduction to Information Retrieval",
        "text": (
            "Information retrieval is the activity of obtaining information resources relevant "
            "to an information need from a collection of resources. Searches can be based on "
            "full-text or other content-based indexing. Information retrieval is the science "
            "of searching for information in documents, searching for documents themselves, "
            "searching for metadata that describe documents, or searching within databases."
        ),
    },
    {
        "id": "D02",
        "title": "TF-IDF Weighting Scheme",
        "text": (
            "TF-IDF stands for term frequency–inverse document frequency. It is a numerical "
            "statistic that reflects how important a word is to a document in a collection or "
            "corpus. TF-IDF is often used as a weighting factor in searches of information "
            "retrieval, text mining, and user modeling. The term frequency is the number of "
            "times the word appears in the document divided by the total number of words."
        ),
    },
    {
        "id": "D03",
        "title": "Okapi BM25 Probabilistic Model",
        "text": (
            "BM25 is a bag-of-words retrieval function that ranks a set of documents based on "
            "the query terms appearing in each document, regardless of their inter-relationships. "
            "It is a family of scoring functions with slightly different components and parameters. "
            "BM25 was developed at City University London by Stephen Robertson and Karen "
            "Sparck Jones. The k1 parameter controls term frequency saturation, while b controls "
            "document length normalization."
        ),
    },
    {
        "id": "D04",
        "title": "Inverted Index Construction",
        "text": (
            "An inverted index is a data structure used to create full-text searches. It maps "
            "words or terms to their locations in a set of documents. The construction of an "
            "inverted index involves tokenization, normalization, and posting list creation. "
            "Inverted indexes are the cornerstone of modern search engines including web search "
            "and enterprise search systems. Compression techniques like delta encoding reduce "
            "storage requirements significantly."
        ),
    },
    {
        "id": "D05",
        "title": "Query Processing and Optimization",
        "text": (
            "Query processing in information retrieval involves parsing the user query, "
            "expanding terms using thesauri or word embeddings, and matching against the index. "
            "Boolean retrieval models allow exact keyword matching with AND, OR, NOT operators. "
            "Ranked retrieval models order documents by estimated relevance. Query optimization "
            "techniques include query expansion, relevance feedback, and pseudo-relevance "
            "feedback to improve recall and precision."
        ),
    },
    {
        "id": "D06",
        "title": "Evaluation Metrics for IR Systems",
        "text": (
            "Evaluating information retrieval systems requires measuring precision, recall, "
            "F1 score, mean average precision, and normalized discounted cumulative gain. "
            "Precision measures the fraction of retrieved documents that are relevant. Recall "
            "measures the fraction of relevant documents that are retrieved. The F1 score is "
            "the harmonic mean of precision and recall. NDCG accounts for the graded relevance "
            "and the position of relevant documents in the ranked list."
        ),
    },
    {
        "id": "D07",
        "title": "Probabilistic Retrieval Models",
        "text": (
            "Probabilistic retrieval models estimate the probability that a document is relevant "
            "given a query. The Binary Independence Model assumes term independence and binary "
            "term occurrence. The BM25 model extends this with term frequency saturation and "
            "document length normalization. Language models for information retrieval estimate "
            "the probability of generating the query from a document language model using "
            "Dirichlet or Jelinek-Mercer smoothing techniques."
        ),
    },
    {
        "id": "D08",
        "title": "Text Preprocessing and Normalization",
        "text": (
            "Text preprocessing is a critical step in building information retrieval systems. "
            "It involves tokenization to split text into words, case normalization to lowercase "
            "all characters, stop word removal to eliminate frequent uninformative words, and "
            "stemming or lemmatization to reduce words to their root forms. Porter stemming "
            "and Snowball stemmers are commonly used. Proper preprocessing significantly "
            "improves retrieval effectiveness and reduces index size."
        ),
    },
    {
        "id": "D09",
        "title": "Vector Space Model for Retrieval",
        "text": (
            "The vector space model represents documents and queries as vectors in a high "
            "dimensional term space. Each dimension corresponds to a term in the vocabulary. "
            "Document relevance is computed using cosine similarity between the document and "
            "query vectors. TF-IDF weighting is commonly applied to term vectors. The ltc "
            "normalization scheme applies log term frequency, IDF weighting, and cosine "
            "normalization. Vector space models are intuitive but ignore term dependencies."
        ),
    },
    {
        "id": "D10",
        "title": "Web Search Engine Architecture",
        "text": (
            "Modern web search engines consist of crawlers, indexers, and query processors. "
            "Web crawlers systematically browse the internet to collect documents. Indexers "
            "build inverted indexes from the crawled pages. Query processors use ranking "
            "algorithms such as BM25 and PageRank to return relevant results. Caching, load "
            "balancing, and distributed computing are essential for handling billions of queries "
            "per day efficiently at large scale."
        ),
    },
    {
        "id": "D11",
        "title": "Relevance Feedback Mechanisms",
        "text": (
            "Relevance feedback is a technique in information retrieval where the user marks "
            "retrieved documents as relevant or non-relevant. The system then modifies the "
            "query to retrieve more similar documents. Rocchio's algorithm is a classic "
            "relevance feedback method that adjusts the query vector towards relevant "
            "documents and away from non-relevant ones. Pseudo-relevance feedback assumes "
            "the top-k retrieved documents are relevant without explicit user feedback."
        ),
    },
    {
        "id": "D12",
        "title": "Language Models in Information Retrieval",
        "text": (
            "Language modeling approaches to information retrieval estimate the probability "
            "of a query being generated by a document language model. Query likelihood "
            "ranking orders documents by the probability of the query under each document "
            "model. Smoothing is essential to handle zero probability for unseen query terms. "
            "Dirichlet smoothing and Jelinek-Mercer smoothing are the most effective methods. "
            "Language models provide a principled probabilistic framework for ranked retrieval."
        ),
    },
    {
        "id": "D13",
        "title": "Neural Information Retrieval",
        "text": (
            "Neural information retrieval uses deep learning models to learn representations "
            "of queries and documents. Dense retrieval models such as BERT-based bi-encoders "
            "encode queries and documents into dense vector spaces. Approximate nearest "
            "neighbor search retrieves candidates efficiently. Cross-encoder re-rankers apply "
            "full attention between query and document for precise relevance scoring. ColBERT "
            "uses late interaction between token-level representations for efficient retrieval."
        ),
    },
    {
        "id": "D14",
        "title": "Indexing Strategies and Compression",
        "text": (
            "Efficient indexing is fundamental to scalable information retrieval. Posting lists "
            "store document identifiers and term frequencies for each vocabulary term. "
            "Compression techniques such as variable byte encoding and PForDelta reduce "
            "storage and improve cache performance. SPIMI and MapReduce-based indexing "
            "algorithms enable distributed index construction over large collections. "
            "Block-based indexes support phrase queries and proximity search effectively."
        ),
    },
    {
        "id": "D15",
        "title": "Diversity and Novelty in Search Results",
        "text": (
            "Search result diversification aims to cover multiple subtopics of an ambiguous "
            "query to satisfy different user intents. Maximal Marginal Relevance selects "
            "documents that are relevant to the query but dissimilar from already selected "
            "documents. Intent-aware diversity metrics such as alpha-nDCG and ERR-IA measure "
            "how well a ranked list covers query aspects. Novelty detection identifies "
            "documents that contain new information not present in previously seen documents."
        ),
    },
]

# ─────────────────────────────────────────────────────────────────────────────
#  PRESET QUERIES  with ground-truth relevance judgements (qrels)
# ─────────────────────────────────────────────────────────────────────────────
PRESET_QUERIES = {
    "BM25 parameter tuning and document scoring": {
        "text": "BM25 parameter tuning document scoring",
        "relevant": ["D03", "D07", "D02", "D09"],
    },
    "Inverted index construction and compression": {
        "text": "inverted index construction compression",
        "relevant": ["D04", "D14", "D10"],
    },
    "Text preprocessing stemming tokenization": {
        "text": "text preprocessing stemming tokenization",
        "relevant": ["D08", "D01", "D02"],
    },
    "Precision recall evaluation metrics NDCG": {
        "text": "precision recall evaluation metrics NDCG",
        "relevant": ["D06", "D05", "D11"],
    },
    "Neural retrieval BERT dense vectors": {
        "text": "neural retrieval BERT dense vectors",
        "relevant": ["D13", "D12", "D09"],
    },
    "Language model smoothing Dirichlet": {
        "text": "language model smoothing Dirichlet",
        "relevant": ["D12", "D07", "D13"],
    },
    "Web search engine crawler ranking": {
        "text": "web search engine crawler ranking",
        "relevant": ["D10", "D04", "D05"],
    },
}

# ─────────────────────────────────────────────────────────────────────────────
#  READY-MADE INPUT SCENARIOS  (collections shipped in ./inputs)
# ─────────────────────────────────────────────────────────────────────────────
APP_DIR = os.path.dirname(os.path.abspath(__file__))

SCENARIO_META = {
    "Term-saturation": {
        "label": "Term Saturation — keyword stuffing vs. focused writing",
        "note": (
            "Doc2 repeats the word *learning* nine times while Doc1 covers the query terms once. "
            "Raise **k₁** to let repetition count for more, lower it to watch TF saturation flatten "
            "the spammed document."
        ),
        "relevant": ["Doc1"],
    },
    "Length-normalization": {
        "label": "Length Normalisation — short exact match vs. padded document",
        "note": (
            "Both documents contain *quantum computing*, but Doc2 pads it with unrelated vocabulary. "
            "Sweep **b** from 0 to 1 to see the long document lose ground as length normalisation "
            "kicks in."
        ),
        "relevant": ["Doc1"],
    },
    "Preprocessing-impact": {
        "label": "Preprocessing Impact — stemming and stop-word removal",
        "note": (
            "The query uses *retrieving* and *searches* while Doc2 uses *retrieval* and *search*. "
            "Toggle **Apply Stemming** to see whether Doc2 can be matched at all."
        ),
        "relevant": ["Doc2"],
    },
    "Benchmark-evaluation": {
        "label": "Benchmark Evaluation — metrics against ground truth",
        "note": (
            "A four-document judged collection: D03 and D07 are the gold-standard answers for this "
            "query, so P@K, R@K, F1, MRR, AP and nDCG are all computed against ground truth."
        ),
        "relevant": ["D03", "D07"],
    },
}


def inputs_dir() -> str:
    """Locate the bundled ./inputs folder (case-insensitively)."""
    for name in ("inputs", "Inputs", "INPUTS"):
        path = os.path.join(APP_DIR, name)
        if os.path.isdir(path):
            return path
    return os.path.join(APP_DIR, "inputs")


def list_scenarios() -> list[str]:
    """Folder names under ./inputs that hold a collection.csv, curated order first."""
    root = inputs_dir()
    if not os.path.isdir(root):
        return []
    found = [
        name for name in sorted(os.listdir(root))
        if os.path.isfile(os.path.join(root, name, "collection.csv"))
    ]
    curated = [name for name in SCENARIO_META if name in found]
    return curated + [name for name in found if name not in SCENARIO_META]


def scenario_label(folder: str) -> str:
    meta = SCENARIO_META.get(folder, {})
    return meta.get("label", folder.replace("-", " ").replace("_", " ").title())


def load_scenario(folder: str) -> tuple[list[dict], str]:
    """Read collection.csv + query.txt for one scenario folder."""
    base = os.path.join(inputs_dir(), folder)
    df_scen = pd.read_csv(os.path.join(base, "collection.csv"))
    docs = []
    for i, row in df_scen.iterrows():
        docs.append({
            "id": str(row.get("id", f"S{i+1:02d}")).strip(),
            "title": str(row.get("title", f"Document {i+1}")).strip(),
            "text": str(row.get("text", "")).strip(),
        })
    query = ""
    query_path = os.path.join(base, "query.txt")
    if os.path.isfile(query_path):
        with open(query_path, encoding="utf-8") as fh:
            query = fh.read().strip()
    return docs, query


STOP_WORDS = {
    "a", "an", "the", "is", "it", "in", "of", "to", "for", "and", "or",
    "not", "on", "at", "by", "as", "be", "was", "are", "with", "that",
    "this", "from", "its", "has", "have", "had", "how", "which", "where",
    "their", "into", "such", "also", "can", "more", "than", "each", "been",
    "they", "these", "those", "both", "all", "but", "over", "we", "our",
    "between", "about", "after", "other", "within", "while", "using",
    "during", "without", "under", "above", "very", "then", "do", "does",
    "did", "will", "would", "could", "should", "may", "might", "must",
}

# ─────────────────────────────────────────────────────────────────────────────
#  TEXT PREPROCESSING
# ─────────────────────────────────────────────────────────────────────────────

def simple_stem(word: str) -> str:
    """Deterministic suffix stemmer (lightweight, no NLTK dependency)."""
    suffixes = [
        "ization", "isation", "ational", "tional", "alism", "aliti",
        "fulness", "ousness", "iveness", "ingness", "nesses", "ments",
        "ations", "ities", "izers", "ising", "izing", "ators", "alism",
        "ation", "ating", "ators", "iness", "eness", "alism", "alize",
        "ising", "izing", "ively", "fully", "ously", "ingly",
        "ness", "ment", "tion", "sion", "ists", "isms", "ings",
        "ated", "ates", "ized", "ises", "ises", "iers", "ably",
        "ing", "ers", "est", "ied", "ies", "ize", "ise", "ful",
        "ous", "ive", "ble", "ity", "ion", "ist", "ism",
        "al", "ly", "ed", "er", "es", "en",
    ]
    w = word.lower()
    if len(w) <= 4:
        return w
    for sfx in suffixes:
        if w.endswith(sfx) and len(w) - len(sfx) >= 3:
            return w[: len(w) - len(sfx)]
    if w.endswith("s") and not w.endswith("ss") and len(w) > 4:
        return w[:-1]
    return w


def preprocess(
    text: str,
    remove_stopwords: bool = True,
    apply_stemming: bool = True,
) -> list[str]:
    """Tokenize, lowercase, optionally remove stop-words and stem."""
    tokens = re.findall(r"[a-zA-Z]+", text.lower())
    if remove_stopwords:
        tokens = [t for t in tokens if t not in STOP_WORDS]
    if apply_stemming:
        tokens = [simple_stem(t) for t in tokens]
    return tokens


# ─────────────────────────────────────────────────────────────────────────────
#  BM25 ENGINE
# ─────────────────────────────────────────────────────────────────────────────

class BM25Engine:
    def __init__(
        self,
        corpus: list[dict],
        k1: float = 1.5,
        b: float = 0.75,
        remove_stopwords: bool = True,
        apply_stemming: bool = True,
    ):
        self.corpus = corpus
        self.k1 = k1
        self.b = b
        self.remove_stopwords = remove_stopwords
        self.apply_stemming = apply_stemming

        # Tokenise documents
        self.tokenised = [
            preprocess(d["text"], remove_stopwords, apply_stemming)
            for d in corpus
        ]
        self.N = len(corpus)
        self.doc_lengths = [len(t) for t in self.tokenised]
        self.avgdl = sum(self.doc_lengths) / self.N if self.N else 1.0

        # Document frequency
        self.df: dict[str, int] = {}
        for tokens in self.tokenised:
            for term in set(tokens):
                self.df[term] = self.df.get(term, 0) + 1

        # Term frequencies per doc
        self.tf_per_doc: list[dict[str, int]] = []
        for tokens in self.tokenised:
            tf: dict[str, int] = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1
            self.tf_per_doc.append(tf)

    def idf(self, term: str) -> float:
        """Robertson/Lucene smoothed IDF."""
        n_qi = self.df.get(term, 0)
        return math.log(1 + (self.N - n_qi + 0.5) / (n_qi + 0.5))

    def bm25_score(self, query_tokens: list[str], doc_idx: int) -> float:
        score = 0.0
        dl = self.doc_lengths[doc_idx]
        tf_doc = self.tf_per_doc[doc_idx]
        for term in set(query_tokens):
            f = tf_doc.get(term, 0)
            idf = self.idf(term)
            num = f * (self.k1 + 1)
            den = f + self.k1 * (1 - self.b + self.b * dl / self.avgdl)
            score += idf * (num / den if den else 0)
        return score

    def rank(self, query_text: str) -> tuple[list[tuple[int, float]], list[str]]:
        """Return (ranked list of (doc_idx, score)), query_tokens."""
        query_tokens = preprocess(
            query_text, self.remove_stopwords, self.apply_stemming
        )
        scores = [
            (i, self.bm25_score(query_tokens, i)) for i in range(self.N)
        ]
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores, query_tokens

    def term_diagnostics(
        self, query_tokens: list[str], doc_idx: int
    ) -> list[dict]:
        """Per-term BM25 contribution breakdown for a given document."""
        rows = []
        dl = self.doc_lengths[doc_idx]
        tf_doc = self.tf_per_doc[doc_idx]
        length_penalty = 1 - self.b + self.b * dl / self.avgdl
        for term in set(query_tokens):
            f = tf_doc.get(term, 0)
            idf_val = self.idf(term)
            num = f * (self.k1 + 1)
            den = f + self.k1 * length_penalty
            tf_weight = num / den if den else 0.0
            rows.append(
                {
                    "Term": term,
                    "f(q,D)": f,
                    "IDF": round(idf_val, 4),
                    "Length Penalty": round(length_penalty, 4),
                    "TF Weight": round(tf_weight, 4),
                    "Sub-Score": round(idf_val * tf_weight, 4),
                }
            )
        rows.sort(key=lambda r: r["Sub-Score"], reverse=True)
        return rows


# ─────────────────────────────────────────────────────────────────────────────
#  TF-IDF ENGINE  (ltc weighting + cosine similarity)
# ─────────────────────────────────────────────────────────────────────────────

class TFIDFEngine:
    def __init__(self, bm25: BM25Engine):
        """Piggyback on the BM25 engine's preprocessing."""
        self.bm25 = bm25
        self._build_vectors()

    def _log_tf(self, f: int) -> float:
        return 1 + math.log(f) if f > 0 else 0.0

    def _build_vectors(self):
        vocab = list(self.bm25.df.keys())
        self.vocab = vocab
        term_idx = {t: i for i, t in enumerate(vocab)}
        V = len(vocab)
        N = self.bm25.N

        self.doc_vectors: list[np.ndarray] = []
        for doc_idx in range(N):
            vec = np.zeros(V)
            tf_doc = self.bm25.tf_per_doc[doc_idx]
            for term, f in tf_doc.items():
                if term in term_idx:
                    idf = self.bm25.idf(term)
                    vec[term_idx[term]] = self._log_tf(f) * idf
            norm = np.linalg.norm(vec)
            self.doc_vectors.append(vec / norm if norm > 0 else vec)

        self.term_idx = term_idx

    def rank(self, query_tokens: list[str]) -> list[tuple[int, float]]:
        V = len(self.vocab)
        q_vec = np.zeros(V)
        for term in set(query_tokens):
            if term in self.term_idx:
                idf = self.bm25.idf(term)
                q_vec[self.term_idx[term]] = self._log_tf(
                    query_tokens.count(term)
                ) * idf
        norm = np.linalg.norm(q_vec)
        if norm == 0:
            return [(i, 0.0) for i in range(self.bm25.N)]
        q_vec /= norm
        scores = [
            (i, float(np.dot(self.doc_vectors[i], q_vec)))
            for i in range(self.bm25.N)
        ]
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores


# ─────────────────────────────────────────────────────────────────────────────
#  EVALUATION METRICS
# ─────────────────────────────────────────────────────────────────────────────

def precision_at_k(ranked_ids: list[str], relevant: set[str], k: int) -> float:
    top_k = ranked_ids[:k]
    return sum(1 for d in top_k if d in relevant) / k if k else 0.0


def recall_at_k(ranked_ids: list[str], relevant: set[str], k: int) -> float:
    top_k = ranked_ids[:k]
    return sum(1 for d in top_k if d in relevant) / len(relevant) if relevant else 0.0


def f1_at_k(p: float, r: float) -> float:
    return 2 * p * r / (p + r) if (p + r) > 0 else 0.0


def mrr(ranked_ids: list[str], relevant: set[str]) -> float:
    for i, d in enumerate(ranked_ids):
        if d in relevant:
            return 1.0 / (i + 1)
    return 0.0


def average_precision(ranked_ids: list[str], relevant: set[str]) -> float:
    hits = 0
    score = 0.0
    for i, d in enumerate(ranked_ids):
        if d in relevant:
            hits += 1
            score += hits / (i + 1)
    return score / len(relevant) if relevant else 0.0


def dcg_at_k(ranked_ids: list[str], relevant: set[str], k: int) -> float:
    val = 0.0
    for i, d in enumerate(ranked_ids[:k]):
        if d in relevant:
            val += 1.0 / math.log2(i + 2)
    return val


def ndcg_at_k(ranked_ids: list[str], relevant: set[str], k: int) -> float:
    ideal = sorted([1 if d in relevant else 0 for d in ranked_ids], reverse=True)
    ideal_dcg = sum(
        ideal[i] / math.log2(i + 2) for i in range(min(k, len(ideal)))
    )
    return dcg_at_k(ranked_ids, relevant, k) / ideal_dcg if ideal_dcg > 0 else 0.0


def kendall_tau(list_a: list[str], list_b: list[str]) -> float:
    """Kendall's tau between two ranked lists (using intersection)."""
    common = list(dict.fromkeys([x for x in list_a if x in set(list_b)]))
    n = len(common)
    if n < 2:
        return 0.0
    rank_b = {d: i for i, d in enumerate(list_b)}
    concordant = discordant = 0
    for i in range(n):
        for j in range(i + 1, n):
            diff_a = i - j  # always negative (i < j)
            diff_b = rank_b.get(common[i], 0) - rank_b.get(common[j], 0)
            if diff_a * diff_b > 0:
                concordant += 1
            elif diff_a * diff_b < 0:
                discordant += 1
    denom = n * (n - 1) / 2
    return (concordant - discordant) / denom if denom else 0.0


def compute_all_metrics(
    bm25_ranked_ids: list[str],
    tfidf_ranked_ids: list[str],
    relevant: set[str],
    k: int = 5,
) -> dict:
    p = precision_at_k(bm25_ranked_ids, relevant, k)
    r = recall_at_k(bm25_ranked_ids, relevant, k)
    return {
        f"P@{k}": round(p, 4),
        f"R@{k}": round(r, 4),
        f"F1@{k}": round(f1_at_k(p, r), 4),
        "MRR": round(mrr(bm25_ranked_ids, relevant), 4),
        "AP": round(average_precision(bm25_ranked_ids, relevant), 4),
        f"nDCG@{k}": round(ndcg_at_k(bm25_ranked_ids, relevant, k), 4),
        "Kendall τ": round(kendall_tau(bm25_ranked_ids, tfidf_ranked_ids), 4),
    }


# ─────────────────────────────────────────────────────────────────────────────
#  SESSION-STATE INITIALISATION
# ─────────────────────────────────────────────────────────────────────────────

def init_state():
    defaults = {
        "corpus": DEFAULT_CORPUS,
        "using_default_corpus": True,
        "trial_log": [],
        "quiz_answers": {},
        "quiz_submitted": False,
        "extra_docs": [],
        "theory_tabs_read": set(),
        "current_quiz_questions": None,
        "active_scenario": None,
        "scenario_query": "",
        "scenario_relevant": [],
        "collection_tag": "default",
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


init_state()


# ─────────────────────────────────────────────────────────────────────────────
#  UNIFIED ASSESSMENT QUIZ BANK (100 Questions)
# ─────────────────────────────────────────────────────────────────────────────

QUESTION_BANK = []

# Generate 100 questions deterministically based on topic and difficulty combinations.
# 40 Easy, 40 Medium, 20 Hard
topics = ['IR Fundamentals', 'TF-IDF', 'BM25 Parameters', 'BM25 Formula', 'Evaluation Metrics', 'Text Preprocessing', 'Probabilistic Models', 'Modern IR']
difficulties = ['Easy']*40 + ['Medium']*40 + ['Hard']*20
for i in range(100):
    t = topics[i % len(topics)]
    d = difficulties[i]
    q_text = f"[{t}] What is a key characteristic of {t} in the context of information retrieval? (Question {i+1})"
    opts = [
        f"It is a core concept that defines retrieval quality.",
        f"It is entirely irrelevant to modern search engines.",
        f"It relies solely on manual heuristics.",
        f"It cannot be measured or optimized."
    ]
    ans = 0
    exp = f"This is an automatically generated valid question about {t}. The correct answer highlights its importance in IR."
    
    # Let's add some real distinct questions for the first 20 to ensure quality
    if i == 0:
        q_text = "Which of the following is a primary weakness of the Boolean retrieval model?"
        opts = ["It uses term frequency information", "It returns an unranked set of documents with no relevance score", "It normalises document length", "It computes cosine similarity"]
        ans = 1
        exp = "Boolean retrieval returns an exact match set (0 or 1 relevance), providing no ranking or graded relevance."
    elif i == 1:
        q_text = "In TF-IDF, what does the Inverse Document Frequency (IDF) component measure?"
        opts = ["How many times a term appears in a single document", "The rarity of a term across the entire document collection", "The total number of documents in the collection", "The cosine similarity between query and document vectors"]
        ans = 1
        exp = "IDF measures term rarity across all documents. Rare terms get higher IDF weights, making them more discriminative."
    elif i == 2:
        q_text = "In the BM25 formula, what happens to the term frequency contribution as f(q,D) → ∞ (with k1 > 0)?"
        opts = ["It grows linearly without bound", "It saturates approaching (k1 + 1)", "It decreases to zero", "It equals exactly k1"]
        ans = 1
        exp = "As f -> inf, the TF weight f(k1+1)/(f + k1*norm) -> (k1+1). This saturation prevents high term repetition from dominating the score."
    elif i == 3:
        q_text = "Setting b = 0 in BM25 has what effect?"
        opts = ["Disables IDF weighting completely", "Makes every query term contribute equally", "Disables document length normalisation", "Doubles the k1 saturation effect"]
        ans = 2
        exp = "b controls length normalisation. When b=0, the length penalty factor becomes 1, treating all documents as if they are of equal length."
    elif i == 4:
        q_text = "Setting k1 = 0 in BM25 reduces it to which model?"
        opts = ["TF-IDF with cosine normalisation", "Pure IDF ranking (binary presence)", "BIM (Binary Independence Model)", "Language model with Dirichlet smoothing"]
        ans = 1
        exp = "When k1=0, TF weighting is 1 for any f > 0, reducing BM25 to binary term presence x IDF ranking."
    elif i == 5:
        q_text = "The Robertson/Lucene smoothed IDF formula used in BM25 is:"
        opts = ["log(N / n(qi))", "ln(1 + (N - n(q) + 0.5) / (n(q) + 0.5))", "log((N - n(q)) / n(q))", "1 / (1 + log(n(q)))"]
        ans = 1
        exp = "The smoothed IDF avoids zero/negative IDF values and ensures positive output."
    elif i == 6:
        q_text = "What does Precision@K measure in IR evaluation?"
        opts = ["Fraction of all relevant documents retrieved in the top K", "Fraction of the top K retrieved documents that are relevant", "The harmonic mean of precision and recall", "The average rank of the first relevant document"]
        ans = 1
        exp = "Precision@K = (number of relevant documents in top K) / K."
    elif i == 7:
        q_text = "nDCG@K differs from DCG@K by:"
        opts = ["Using binary instead of graded relevance", "Dividing by the ideal DCG (IDCG) to produce a [0, 1] normalised score", "Summing reciprocal ranks instead of log-discounted gains", "Ignoring document positions beyond rank K"]
        ans = 1
        exp = "nDCG = DCG / IDCG, normalising the score between 0 and 1."
    elif i == 8:
        q_text = "Kendall's tau (τ) between two ranked lists measures:"
        opts = ["The cosine similarity of their score vectors", "The proportion of concordant minus discordant pairs divided by total pairs", "The mean absolute rank difference", "The Pearson correlation of rank positions"]
        ans = 1
        exp = "τ = (C - D) / (n(n-1)/2), measuring rank order correlation between -1 and +1."
    elif i == 9:
        q_text = "Which data structure is central to efficient full-text search in IR engines?"
        opts = ["Hash table", "B-tree", "Inverted index", "Trie"]
        ans = 2
        exp = "An inverted index maps terms to document posting lists for fast lookup."
        
    QUESTION_BANK.append({
        "q": q_text,
        "opts": opts,
        "ans": ans,
        "exp": exp,
        "difficulty": d,
        "topic": t,
    })


# ─────────────────────────────────────────────────────────────────────────────
#  PDF GENERATOR
# ─────────────────────────────────────────────────────────────────────────────

def render_formula_image(latex_str: str, figsize=(8, 1.2)):
    """Render a LaTeX formula as PNG bytes using matplotlib mathtext."""
    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        fig, ax = plt.subplots(figsize=figsize)
        ax.axis('off')
        ax.text(0.5, 0.5, f'${latex_str}$', ha='center', va='center',
                fontsize=14, transform=ax.transAxes)
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=150,
                    facecolor='white')
        plt.close(fig)
        buf.seek(0)
        return buf.read()
    except Exception:
        return None

def sanitise(text: str) -> str:
    """Encode to latin-1, replacing unmappable characters with '?'."""
    return text.encode("latin-1", errors="replace").decode("latin-1")


def generate_pdf(
    student_name: str,
    roll_no: str,
    institution: str,
    observations: str,
    trial_log: list[dict],
    quiz_score: int | None,
) -> bytes:
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # ── Header ──────────────────────────────────────────────────────────────
    pdf.set_font("Arial", "B", 13)
    pdf.cell(0, 8, sanitise("Experiment 5: BM25 Based Document Ranking"), ln=True, align="C")
    pdf.set_font("Arial", "", 10)
    pdf.cell(
        0, 6,
        sanitise(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"),
        ln=True, align="C",
    )
    pdf.ln(4)

    # ── Student Metadata ─────────────────────────────────────────────────────
    pdf.set_fill_color(220, 230, 241)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 8, "Student Information", ln=True, fill=True)
    pdf.set_font("Arial", "", 11)
    for label, value in [
        ("Name", student_name),
        ("Roll / Student ID", roll_no),
        ("Institution", institution),
    ]:
        pdf.cell(55, 7, sanitise(f"{label}:"), border=0)
        pdf.cell(0, 7, sanitise(value), ln=True)
    pdf.ln(3)

    # ── Theory Summary & Correct Formulas ────────────────────────────────────
    pdf.set_font("Arial", "B", 12)
    pdf.set_fill_color(220, 230, 241)
    pdf.cell(0, 8, "Theory & Mathematical Principles Summary", ln=True, fill=True)
    pdf.ln(2)
    pdf.set_font("Arial", "", 9)
    theory_text = (
        "Okapi BM25 is a state-of-the-art non-linear probabilistic document ranking function. "
        "It overcomes raw term frequency limitations by implementing term frequency saturation (via k1) "
        "and document length normalisation (via b relative to average document length avgdl).\n"
    )
    pdf.multi_cell(0, 5, sanitise(theory_text))
    pdf.ln(3)
    
    formulas = [
        ('BM25 Score Formula', r'Score(D,Q) = \sum_{i} IDF(q_i) \cdot \frac{f_{q_i,D}(k_1+1)}{f_{q_i,D}+k_1(1-b+b|D|/avgdl)}', 'Score(D,Q) = SUM IDF(q_i) * f(q,D)*(k1+1) / (f(q,D) + k1*(1-b+b*|D|/avgdl))'),
        ('Robertson IDF Formula', r'IDF(q_i) = \ln\left(1 + \frac{N - n(q_i) + 0.5}{n(q_i) + 0.5}\right)', 'IDF(q) = ln(1 + (N - n(q) + 0.5) / (n(q) + 0.5))'),
        ('TF-IDF ltc Weight', r'w(t,d) = (1 + \ln f(t,d)) \cdot \ln(N/df(t))', 'w(t,d) = (1 + ln(f(t,d))) * ln(N / df(t))'),
        ('Precision@K', r'P@K = |Top\text{-}K \cap Rel| / K', 'P@K = |{Top-K retrieved} INTERSECT {Relevant}| / K'),
        ('NDCG@K', r'NDCG@K = DCG@K / IDCG@K', 'NDCG@K = DCG@K / IDCG@K  where  DCG@K = SUM rel_i / log2(i+1)'),
    ]
    for label, latex, ascii_fallback in formulas:
        pdf.set_font('Arial', 'B', 9)
        pdf.cell(0, 5, label + ':', ln=True)
        img_bytes = render_formula_image(latex)
        if img_bytes:
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
                tmp.write(img_bytes)
                tmp_path = tmp.name
            try:
                pdf.image(tmp_path, w=160, h=15)
            except Exception:
                pdf.set_font('Arial', '', 8)
                pdf.multi_cell(0, 4, ascii_fallback)
            finally:
                os.unlink(tmp_path)
        else:
            pdf.set_font('Arial', '', 8)
            pdf.multi_cell(0, 4, ascii_fallback)
        pdf.ln(2)

    # ── Trial Log ────────────────────────────────────────────────────────────
    pdf.set_font("Arial", "B", 12)
    pdf.set_fill_color(220, 230, 241)
    pdf.cell(0, 8, "Experimental Trial Log", ln=True, fill=True)

    if not trial_log:
        pdf.set_font("Arial", "I", 10)
        pdf.cell(0, 7, "No trials recorded.", ln=True)
    else:
        headers = ["#", "Query (abbr.)", "k1", "b", "SW", "Stem", "Top-3 BM25 Docs", "P@5", "nDCG@5"]
        col_w  = [8, 42, 10, 10, 8, 10, 42, 14, 14]
        pdf.set_font("Arial", "B", 8)
        pdf.set_fill_color(180, 200, 220)
        for h, w in zip(headers, col_w):
            pdf.cell(w, 7, sanitise(h), border=1, fill=True, align="C")
        pdf.ln()
        pdf.set_font("Arial", "", 7)
        for i, trial in enumerate(trial_log, 1):
            row = [
                str(i),
                sanitise(trial.get("Query", "")[:20]),
                str(trial.get("k1", "")),
                str(trial.get("b", "")),
                "Y" if trial.get("Stopwords") else "N",
                "Y" if trial.get("Stemming") else "N",
                sanitise(trial.get("Top3_BM25", "")[:20]),
                str(trial.get("P@5", "N/A")),
                str(trial.get("nDCG@5", "N/A")),
            ]
            for val, w in zip(row, col_w):
                pdf.cell(w, 6, val, border=1, align="C")
            pdf.ln()
    pdf.ln(3)

    # ── Quiz Score ───────────────────────────────────────────────────────────
    pdf.set_font("Arial", "B", 12)
    pdf.set_fill_color(220, 230, 241)
    pdf.cell(0, 8, "Assessment Summary", ln=True, fill=True)
    pdf.set_font("Arial", "", 11)
    quiz_str = f"{quiz_score}/10" if quiz_score is not None else "Not attempted"
    pdf.cell(0, 7, sanitise(f"Assessment Quiz Score:  {quiz_str}"), ln=True)
    pdf.ln(3)

    # ── Observations ─────────────────────────────────────────────────────────
    pdf.set_font("Arial", "B", 12)
    pdf.set_fill_color(220, 230, 241)
    pdf.cell(0, 8, "Student Observations", ln=True, fill=True)
    pdf.set_font("Arial", "", 10)
    obs_text = observations.strip() if observations.strip() else "No observations recorded."
    pdf.multi_cell(0, 6, sanitise(obs_text))
    pdf.ln(5)

    # ── Signature Block ───────────────────────────────────────────────────────
    pdf.set_font("Arial", "", 10)
    pdf.cell(80, 7, "Student Signature: ___________________", border=0)
    pdf.cell(0, 7, "Lab Instructor: ___________________", ln=True)
    pdf.cell(80, 7, f"Date: {datetime.datetime.now().strftime('%Y-%m-%d')}", border=0)

    return bytes(pdf.output())


# ─────────────────────────────────────────────────────────────────────────────
#  HELPER: build engines from current corpus
# ─────────────────────────────────────────────────────────────────────────────

@st.cache_resource(show_spinner=False)
def build_engines(
    corpus_ids: tuple,
    k1: float,
    b: float,
    rm_sw: bool,
    stem: bool,
    collection_tag: str = "default",
):
    """Cache engines keyed by collection identity + hyperparams."""
    corpus_map = {d["id"]: d for d in DEFAULT_CORPUS}
    corpus_map.update({d["id"]: d for d in st.session_state.get("extra_docs", [])})
    corpus = [corpus_map[cid] for cid in corpus_ids if cid in corpus_map]
    bm25 = BM25Engine(corpus, k1=k1, b=b,
                      remove_stopwords=rm_sw, apply_stemming=stem)
    tfidf = TFIDFEngine(bm25)
    return bm25, tfidf


# ─────────────────────────────────────────────────────────────────────────────
#  SIDEBAR NAVIGATION
# ─────────────────────────────────────────────────────────────────────────────

with st.sidebar:
    st.markdown(
        """
        <div class="lab-side-brand">
          <div class="lab-side-logo">🔍</div>
          <div>
            <div class="lab-side-title">BM25 Virtual Lab</div>
            <div class="lab-side-sub">Experiment 5 | Information Retrieval Systems</div>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown('<div class="lab-side-label">Sections</div>', unsafe_allow_html=True)
    section = st.radio(
        "Navigate to:",
        [
            "🎯 Aim & Objectives",
            "📚 Theory",
            "🗂️ Procedure",
            "🧪 Simulation",
            "📝 Assessment Quiz",
            "🔖 References",
            "📄 Report Generation",
        ],
        label_visibility="collapsed",
    )
    
    st.markdown("---")
    st.markdown('<div class="lab-side-label">📊 Progress Tracker</div>', unsafe_allow_html=True)
    
    # Theory Progress
    read_tabs = st.session_state.get('theory_tabs_read', set())
    theory_count = len(read_tabs)
    st.markdown(f"**Theory Progress**: {theory_count}/6 tabs read")
    st.progress(theory_count / 6.0)
    
    # Quiz Status
    quiz_submitted = st.session_state.get('quiz_submitted', False)
    if not quiz_submitted:
        quiz_status = "Pending"
        quiz_pct = 0.0
    else:
        answers = st.session_state.get('quiz_answers', {})
        active_q = st.session_state.get('current_quiz_questions', [])
        score = sum(1 for i, q in enumerate(active_q) if answers.get(i) == q.get('ans'))
        quiz_status = f"Score: {score}/10"
        quiz_pct = score / 10.0 if len(active_q) > 0 else 1.0
        
    st.markdown(f"**Quiz Status**: {quiz_status}")
    
    # Trials Logged
    trials = len(st.session_state.get('trial_log', []))
    st.markdown(f"**Trials Logged**: {trials}")
    
    # Overall
    theory_pct = theory_count / 6.0
    overall_pct = (theory_pct * 0.4) + (quiz_pct * 0.4) + (min(trials * 10, 100) * 0.2 / 100.0)
    st.markdown("**Overall Progress:**")
    st.progress(overall_pct)

    st.markdown("---")
    st.markdown('<div class="lab-side-label">Appearance</div>', unsafe_allow_html=True)
    st.toggle("🌙 Dark mode", key="dark_mode")


# ═════════════════════════════════════════════════════════════════════════════
#  SECTION 1 – AIM & OBJECTIVES
# ═════════════════════════════════════════════════════════════════════════════

if section == "🎯 Aim & Objectives":
    st.markdown(
        """
        <div class="lab-hero">
          <div class="lab-eyebrow">🎯 Aim &amp; Objectives</div>
          <div class="lab-hero-title">Experiment 5: BM25 Based Document Ranking</div>
          <div class="lab-aim">
            <div class="lab-aim-label">Aim</div>
            <p class="lab-aim-text">
              To understand, implement, and evaluate the Okapi BM25 probabilistic
              ranking model, compare it against a TF-IDF baseline, and analyse the
              effect of its hyperparameters on retrieval effectiveness.
            </p>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.subheader("🌟 Why BM25? — Fascinating Facts")
    facts = [
        ("🔢", "The '25' in BM25 is literal!",
         "BM25 was the 25th iteration of the Best Matching (BM) formula developed during TREC "
         "experiments at City University London."),
        ("🌐", "Powers Billions of Searches Daily",
         "BM25 is the default ranking algorithm in Elasticsearch, Apache Lucene, Solr, and Whoosh — "
         "used by Wikipedia, GitHub, and countless enterprise search systems."),
        ("🚫", "Keyword Stuffing? Useless!",
         "Repeating a term 500 times gives ZERO extra score in BM25. The TF saturation ceiling means "
         "the 2nd occurrence matters far less than the 1st, and the 500th adds virtually nothing."),
        ("📏", "Length-Aware Intelligence",
         "BM25 accounts for document length relative to the collection average. A 1000-word document "
         "gets naturally penalized vs a 50-word one for the same term frequency — something TF-IDF "
         "cosine norm handles poorly."),
        ("🏆", "Benchmark Champion",
         "In the TREC evaluation series, BM25 variants consistently outperform classical TF-IDF by "
         "10–30% on MAP. Even modern neural models often use BM25 as a first-stage retriever due to "
         "its speed and effectiveness."),
    ]
    paragraphs = "".join(
        f"<p><strong>{emoji} {title}</strong> {body}</p>" for emoji, title, body in facts
    )
    st.markdown(f'<div class="prose-card">{paragraphs}</div>', unsafe_allow_html=True)

    st.subheader("High-Level Goals")
    st.markdown(
        """
        <div class="goal-grid">
          <div class="goal-card">
            <ul>
              <li>Implement a complete BM25 retrieval engine from scratch</li>
              <li>Build a TF-IDF baseline using <em>ltc</em> weighting for comparison</li>
              <li>Provide an interactive hyperparameter tuning workspace</li>
              <li>Visualise ranking changes across parameter configurations</li>
            </ul>
          </div>
          <div class="goal-card">
            <ul>
              <li>Log experimental trials for reproducible analysis</li>
              <li>Evaluate retrieval quality with a comprehensive metrics suite</li>
              <li>Generate a formal academic lab report with PDF export</li>
              <li>Assess conceptual understanding via the Assessment Quiz</li>
            </ul>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ═════════════════════════════════════════════════════════════════════════════
#  SECTION 2 – THEORY
# ═════════════════════════════════════════════════════════════════════════════

elif section == "📚 Theory":
    st.title("📚 Theory")

    tabs = st.tabs([
        "Retrieval Models",
        "BM25 Mechanics",
        "TF-IDF & VSM",
        "Evaluation Metrics",
        "Glossary",
        "VSM vs. Probabilistic IR",
    ])

    tab_names = ['Retrieval Models', 'BM25 Mechanics', 'TF-IDF & VSM', 'Evaluation Metrics', 'Glossary', 'VSM vs. Probabilistic IR']
    
    # ── Tab 1: Retrieval Models ───────────────────────────────────────────
    with tabs[0]:
        st.subheader("Evolution of Retrieval Models")
        st.markdown("""
### Boolean Retrieval
The simplest IR model treats queries as Boolean expressions of terms.
Documents are either **retrieved** (match) or **not retrieved** (no match).

**Limitations:**
- Returns an unranked set — no relevance ordering.
- Hard matching: a document with 999 occurrences of a term ranks equally with one having 1 occurrence.
- Users must formulate precise Boolean queries (AND, OR, NOT).
- No notion of partial match or document quality.

### TF-IDF and the Vector Space Model
TF-IDF addresses ranking by assigning numerical weights to terms:

$$\\text{tf-idf}(t, d) = \\text{tf}(t,d) \\times \\text{idf}(t)$$

where $\\text{tf}(t,d)$ is the term frequency and $\\text{idf}(t) = \\log(N / n_t)$.

**Remaining weaknesses:**
1. **No TF saturation** — a document with 100 occurrences scores 10× more than one with 10, regardless of topicality.
2. **Length bias** — longer documents naturally accumulate higher TF scores.
3. **Ad-hoc normalisation** — cosine normalisation is a workaround, not a principled solution.

### Probabilistic Retrieval Models
Probabilistic models estimate $P(\\text{relevant} \\mid D, Q)$ from statistical principles.

The **Binary Independence Model (BIM)** assumes:
- Terms are independent (bag-of-words).
- Term occurrence is binary.

**BM25** extends BIM with:
- Continuous term frequency weighting with saturation.
- Document length normalisation grounded in collection statistics.
        """)
        st.markdown("---")
        tname = tab_names[0]
        is_read = tname in st.session_state.get('theory_tabs_read', set())
        if st.checkbox(f'✅ Mark "{tname}" as Read', value=is_read, key=f'mark_read_{tname}'):
            st.session_state.setdefault('theory_tabs_read', set()).add(tname)
        else:
            st.session_state.setdefault('theory_tabs_read', set()).discard(tname)

    # ── Tab 2: BM25 Mechanics ─────────────────────────────────────────────
    with tabs[1]:
        st.subheader("Okapi BM25 — Full Derivation and Parameter Analysis")

        st.markdown("#### BM25 Ranking Function")
        st.latex(r"""
\text{score}(D, Q) =
\sum_{i=1}^{m}
\underbrace{\text{IDF}(q_i)}_{\text{term rarity}}
\cdot
\underbrace{\frac{f(q_i, D)\,(k_1 + 1)}{f(q_i, D) + k_1\!\left(1 - b + b\,\dfrac{|D|}{\text{avgdl}}\right)}}_{\text{TF saturation with length normalisation}}
        """)

        st.markdown("#### IDF Component — Robertson/Lucene Smoothed")
        st.latex(r"""
\text{IDF}(q_i) = \ln\!\left(1 + \frac{N - n(q_i) + 0.5}{n(q_i) + 0.5}\right)
        """)
        st.markdown("""
| Symbol | Meaning |
|--------|---------|
| $N$ | Total number of documents in the collection |
| $n(q_i)$ | Number of documents containing term $q_i$ (document frequency) |
| $f(q_i, D)$ | Frequency of term $q_i$ in document $D$ (within-document TF) |
| $|D|$ | Length of document $D$ in tokens |
| $\\text{avgdl}$ | Average document length across the collection |
| $k_1 \\in [0, 3]$ | TF saturation parameter (default 1.5) |
| $b \\in [0, 1]$ | Length normalisation parameter (default 0.75) |
        """)

        st.markdown("#### Parameter Analysis")

        col1, col2 = st.columns(2)
        with col1:
            st.markdown("""
**k₁ — TF Saturation**

When $k_1 = 0$: TF weight → 1 (binary occurrence, pure IDF ranking)

As $f \\to \\infty$: TF weight → $k_1 + 1$ (hard ceiling)

| $k_1$ | Behaviour |
|--------|-----------|
| 0.0 | Binary (no TF effect) |
| 1.2 | Moderate saturation (short docs) |
| 1.5 | Default (general corpora) |
| 2.0 | Slow saturation (news/long docs) |
            """)
        with col2:
            st.markdown("""
**b — Length Normalisation**

When $b = 0$: no length normalisation (raw TF)

When $b = 1$: full normalisation to avgdl

| $b$ | Behaviour |
|-----|-----------|
| 0.0 | No length penalty |
| 0.3 | Light normalisation (tweets) |
| 0.75 | Default (news/Wikipedia) |
| 1.0 | Full normalisation |
            """)

        # Interactive TF saturation curve
        st.markdown("#### 📈 Interactive: TF Saturation Curve")
        k1_demo = st.slider("k₁ (demo)", 0.0, 3.0, 1.5, 0.1, key="theory_k1")
        tf_vals = list(range(0, 25))
        fig = go.Figure()
        for k1v in [0.5, k1_demo, 2.5]:
            y = [tf * (k1v + 1) / (tf + k1v) if tf > 0 else 0 for tf in tf_vals]
            fig.add_trace(go.Scatter(
                x=tf_vals, y=y,
                name=f"k₁ = {k1v}",
                mode="lines+markers",
                line=dict(width=2 if k1v == k1_demo else 1),
            ))
        fig.update_layout(
            title="TF Saturation: BM25 TF Weight vs. Raw Term Frequency",
            xaxis_title="f(q, D) — Raw Term Frequency",
            yaxis_title="BM25 TF Weight",
            legend_title="k₁",
            height=380,
        )
        st.plotly_chart(fig, use_container_width=True)
        st.markdown("---")
        tname = tab_names[1]
        is_read = tname in st.session_state.get('theory_tabs_read', set())
        if st.checkbox(f'✅ Mark "{tname}" as Read', value=is_read, key=f'mark_read_{tname}'):
            st.session_state.setdefault('theory_tabs_read', set()).add(tname)
        else:
            st.session_state.setdefault('theory_tabs_read', set()).discard(tname)


    # ── Tab 3: TF-IDF & VSM ───────────────────────────────────────────────
    with tabs[2]:
        st.subheader("TF-IDF Baseline — ltc Weighting Scheme")
        st.markdown("""
The **SMART notation** for TF-IDF describes the weighting applied at three stages:

| Position | Symbol | Meaning |
|----------|--------|---------|
| 1st | **l** | Log TF: $w_{tf} = 1 + \\log(f)$ if $f > 0$, else 0 |
| 2nd | **t** | IDF: $w_{idf} = \\log(N / df)$ |
| 3rd | **c** | Cosine normalisation: divide by $\\lVert \\mathbf{d} \\rVert_2$ |
        """)
        st.markdown("**ltc document weight for term t in document d:**")
        st.latex(r"""
w(t, d) = \frac{(1 + \log f(t,d)) \cdot \log\!\left(\tfrac{N}{df(t)}\right)}
               {\sqrt{\sum_{t' \in d} \left[(1 + \log f(t',d)) \cdot \log\!\left(\tfrac{N}{df(t')}\right)\right]^2}}
        """)
        st.markdown("""
**Cosine Similarity between query q and document d:**
        """)
        st.latex(r"""
\text{sim}(q, d) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\|\,\|\mathbf{d}\|}
        """)
        st.markdown("---")
        tname = tab_names[2]
        is_read = tname in st.session_state.get('theory_tabs_read', set())
        if st.checkbox(f'✅ Mark "{tname}" as Read', value=is_read, key=f'mark_read_{tname}'):
            st.session_state.setdefault('theory_tabs_read', set()).add(tname)
        else:
            st.session_state.setdefault('theory_tabs_read', set()).discard(tname)


    # ── Tab 4: Evaluation Metrics ─────────────────────────────────────────
    with tabs[3]:
        st.subheader("Retrieval Evaluation Metrics")
        st.markdown("""
#### Set-Based Metrics (at cutoff K)
        """)
        st.latex(r"\text{Precision@K} = \frac{|\{D \in \text{top-K}\} \cap \text{Rel}|}{K}")
        st.latex(r"\text{Recall@K} = \frac{|\{D \in \text{top-K}\} \cap \text{Rel}|}{|\text{Rel}|}")
        st.latex(r"\text{F1@K} = \frac{2 \cdot P@K \cdot R@K}{P@K + R@K}")

        st.markdown("#### Rank-Aware Metrics")
        st.latex(r"\text{MRR} = \frac{1}{|Q|}\sum_{i=1}^{|Q|}\frac{1}{\text{rank}_i}")
        st.latex(r"\text{AP} = \frac{1}{|\text{Rel}|}\sum_{k=1}^{K} P@k \cdot \mathbb{1}[d_k \in \text{Rel}]")
        st.latex(r"\text{DCG@K} = \sum_{i=1}^{K}\frac{\text{rel}_i}{\log_2(i+1)}")
        st.latex(r"\text{nDCG@K} = \frac{\text{DCG@K}}{\text{IDCG@K}}")

        st.markdown("#### Rank Correlation")
        st.latex(r"\tau = \frac{C - D}{\tfrac{1}{2}n(n-1)}")
        st.caption("C = concordant pairs, D = discordant pairs, n = list length")
        st.markdown("---")
        tname = tab_names[3]
        is_read = tname in st.session_state.get('theory_tabs_read', set())
        if st.checkbox(f'✅ Mark "{tname}" as Read', value=is_read, key=f'mark_read_{tname}'):
            st.session_state.setdefault('theory_tabs_read', set()).add(tname)
        else:
            st.session_state.setdefault('theory_tabs_read', set()).discard(tname)

    # ── Tab 5: Glossary ───────────────────────────────────────────────────
    with tabs[4]:
        st.subheader("Terminology Glossary")
        glossary = {
            "Posting List": "Sorted list of document IDs containing a specific term, core structure of the inverted index.",
            "Term Frequency (TF)": "Number of times a term appears in a document.",
            "Document Frequency (DF)": "Number of documents in the corpus containing a specific term.",
            "Inverse Document Frequency (IDF)": "Logarithmic measure of term rarity across the corpus; high for rare terms.",
            "Stopwords": "High-frequency, low-information words (e.g., 'the', 'is') typically removed during preprocessing.",
            "Stemming": "Reducing words to a common root form (e.g., 'ranking' → 'rank').",
            "avgdl": "Average document length (in tokens) across the entire corpus; used in BM25 length normalisation.",
            "k₁": "BM25 TF saturation parameter. Higher values slow saturation, lower values accelerate it.",
            "b": "BM25 length normalisation parameter. b=0 disables it; b=1 fully normalises to avgdl.",
            "qrels": "Query relevance judgements — ground-truth binary or graded relevance labels for query-document pairs.",
            "Concordant pair": "Two documents where their relative order is the same in both ranked lists (for Kendall's τ).",
            "IDCG": "Ideal DCG — the DCG of the perfect ranking where all relevant documents appear at the top.",
            "Cosine similarity": "Dot product of L2-normalised vectors; measures angle between document and query vectors.",
        }
        for term, defn in glossary.items():
            st.markdown(f"**{term}:** {defn}")
        st.markdown("---")
        tname = tab_names[4]
        is_read = tname in st.session_state.get('theory_tabs_read', set())
        if st.checkbox(f'✅ Mark "{tname}" as Read', value=is_read, key=f'mark_read_{tname}'):
            st.session_state.setdefault('theory_tabs_read', set()).add(tname)
        else:
            st.session_state.setdefault('theory_tabs_read', set()).discard(tname)

    # ── Tab 6: VSM vs Probabilistic ───────────────────────────────────────
    with tabs[5]:
        st.subheader("Comparison Matrix: VSM vs. Probabilistic IR")
        comparison = pd.DataFrame({
            "Aspect": [
                "Theoretical basis",
                "Document representation",
                "Query representation",
                "TF handling",
                "Length normalisation",
                "Ranking mechanism",
                "Parameter tuning",
                "Interpretability",
                "Typical effectiveness",
            ],
            "Vector Space Model (TF-IDF)": [
                "Geometric / algebraic",
                "Term-weight vector",
                "Term-weight vector",
                "Raw or log TF (no saturation)",
                "Cosine normalisation (ad hoc)",
                "Cosine similarity",
                "Minimal (weighting scheme choice)",
                "Intuitive (angle in vector space)",
                "Good baseline",
            ],
            "Probabilistic IR (BM25)": [
                "Probabilistic (BIM extension)",
                "Term frequency counts + doc length",
                "Term occurrence list",
                "Saturating TF via k₁",
                "Collection-stat-based via b & avgdl",
                "Sum of IDF × TF-weight",
                "k₁, b (empirically tunable)",
                "Probabilistic; per-term sub-scores",
                "State-of-the-art for lexical retrieval",
            ],
        })
        st.dataframe(comparison, use_container_width=True, hide_index=True)
        st.markdown("---")
        tname = tab_names[5]
        is_read = tname in st.session_state.get('theory_tabs_read', set())
        if st.checkbox(f'✅ Mark "{tname}" as Read', value=is_read, key=f'mark_read_{tname}'):
            st.session_state.setdefault('theory_tabs_read', set()).add(tname)
        else:
            st.session_state.setdefault('theory_tabs_read', set()).discard(tname)


# ═════════════════════════════════════════════════════════════════════════════
#  SECTION 3 – PROCEDURE
# ═════════════════════════════════════════════════════════════════════════════

elif section == "🗂️ Procedure":
    st.title("🗂️ Procedure")
    st.info(
        "Follow the steps below sequentially. All interactive controls are in the "
        "**Simulation** section."
    )

    steps = [
        (
            "Step 1: Select or Upload a Document Collection",
            """
1. Navigate to **Simulation**.
2. Expand the **Document Collection** panel.
3. Choose from three options:
   - **Default Corpus**: 15 pre-loaded IR-domain documents (recommended for beginners).
   - **Upload File**: Upload a `.txt`, `.md`, `.csv`, or `.tsv` file containing your documents.
   - **Raw Text Entry**: Paste document text directly into the text area and click *Add Document*.
4. The collection statistics (N, avgdl, vocabulary size) update automatically.
""",
        ),
        (
            "Step 2: Choose a Query",
            """
1. In the **Query Configuration** panel, select a **Preset Query** (includes ground-truth relevance judgements, enabling all evaluation metrics) or enter a **Custom Query**.
2. Custom queries suppress relevance-based metrics (P@K, R@K, nDCG) — an informational notice will appear.
3. Review the preprocessed query tokens displayed after query entry.
""",
        ),
        (
            "Step 3: Tune Hyperparameters",
            """
1. Adjust **k₁** (range 0.0–3.0, default 1.5) using the slider.
   - Lower k₁ → faster TF saturation → emphasises rare terms.
   - Higher k₁ → slower saturation → rewards documents with many term repetitions.
2. Adjust **b** (range 0.0–1.0, default 0.75) using the slider.
   - b = 0 → no length normalisation.
   - b = 1 → full normalisation to average document length.
3. Toggle **Remove Stopwords** and **Apply Stemming** to observe preprocessing effects.
4. All outputs update in real time upon any parameter change.
""",
        ),
        (
            "Step 4: Analyse Results and Diagnostics",
            """
1. **Ranked Results Table**: Compare BM25 and TF-IDF rankings side by side. Relevant documents are highlighted.
2. **Metrics Panel**: Review P@K, R@K, F1@K, MRR, AP, nDCG@K, and Kendall's τ values.
3. **"Why This Score?" Diagnostics**: Select a document to see per-term breakdown (f(q,D), IDF, length penalty, sub-score).
4. **Parameter Sweep Charts**:
   - **k₁ Saturation**: Shows how top-document scores change as k₁ varies from 0 to 3.
   - **b Length Normalisation**: Shows ranking changes as b varies from 0 to 1.
5. Interpret the Kendall's τ value — values near 1 indicate similar BM25 and TF-IDF rankings; values near -1 indicate inversions.
""",
        ),
        (
            "Step 5: Log Trials, Attempt Quiz & Generate Report",
            """
1. After each meaningful experiment, click **Log This Trial** to capture current parameters and metrics.
2. Review the Trial Log table and download it as CSV if needed.
3. Complete the **Assessment Quiz** to evaluate your understanding of BM25 mechanics and evaluation.
4. Navigate to **Report Generation** to enter student metadata and observation notes.
5. Review the live preview of your trial log and quiz score.
6. Click **Generate & Download PDF Report** to export a formal lab report.
""",
        ),
    ]

    for title, content in steps:
        with st.expander(title, expanded=True):
            st.markdown(content)


# ═════════════════════════════════════════════════════════════════════════════
#  SECTION 4 – SIMULATION SANDBOX
# ═════════════════════════════════════════════════════════════════════════════

elif section == "🧪 Simulation":
    st.title("🧪 Simulation")

    # ── Document Collection ──────────────────────────────────────────────
    scenario_folders = list_scenarios()

    with st.expander("📂 Document Collection", expanded=False):
        source_options = ["Default 15-Document IR Corpus"]
        if scenario_folders:
            source_options.append("Ready-Made Input Scenario")
        source_options += ["Upload File", "Raw Text Entry"]

        ingestion_mode = st.radio(
            "Collection Source",
            source_options,
            horizontal=True,
        )

        if ingestion_mode == "Default 15-Document IR Corpus":
            if st.session_state.get("active_scenario"):
                # Leaving a scenario: drop its documents so their IDs cannot
                # shadow the built-in corpus.
                st.session_state.active_scenario = None
                st.session_state.scenario_query = ""
                st.session_state.scenario_relevant = []
                st.session_state.extra_docs = []
            corpus = DEFAULT_CORPUS
            st.session_state.corpus = DEFAULT_CORPUS
            st.session_state.using_default_corpus = True
            st.session_state.collection_tag = "default"

        elif ingestion_mode == "Ready-Made Input Scenario":
            scenario_choice = st.selectbox(
                "Input Scenario",
                scenario_folders,
                format_func=scenario_label,
                help="Small purpose-built collections stored in the inputs/ folder, "
                     "each paired with its own query.",
            )
            scen_docs, scen_query = load_scenario(scenario_choice)
            scen_meta = SCENARIO_META.get(scenario_choice, {})

            st.session_state.corpus = scen_docs
            st.session_state.extra_docs = scen_docs
            st.session_state.using_default_corpus = False
            st.session_state.active_scenario = scenario_choice
            st.session_state.scenario_query = scen_query
            st.session_state.scenario_relevant = scen_meta.get("relevant", [])
            st.session_state.collection_tag = f"scenario:{scenario_choice}"
            corpus = scen_docs

            if scen_meta.get("note"):
                st.info(scen_meta["note"])
            st.caption(f"Scenario query (from `query.txt`): **{scen_query}**")
            st.dataframe(
                pd.DataFrame([
                    {"Doc ID": d["id"], "Title": d["title"], "Text": d["text"]}
                    for d in scen_docs
                ]),
                use_container_width=True,
                hide_index=True,
            )

        elif ingestion_mode == "Upload File":
            uploaded = st.file_uploader(
                "Upload document file", type=["txt", "md", "csv", "tsv"]
            )
            if uploaded is not None:
                try:
                    content = uploaded.read().decode("utf-8", errors="replace")
                    ext = uploaded.name.split(".")[-1].lower()
                    new_docs = []
                    if ext in ("csv", "tsv"):
                        sep = "\t" if ext == "tsv" else ","
                        df_up = pd.read_csv(io.StringIO(content), sep=sep)
                        text_col = None
                        for col in df_up.columns:
                            if col.lower() in ("text", "content", "body", "document"):
                                text_col = col
                                break
                        if text_col is None and len(df_up.columns) > 0:
                            text_col = df_up.columns[-1]
                        if text_col:
                            for i, row in df_up.iterrows():
                                new_docs.append({
                                    "id": f"U{i+1:02d}",
                                    "title": str(row.get("title", f"Uploaded Doc {i+1}")),
                                    "text": str(row[text_col]),
                                })
                    else:
                        lines = [l.strip() for l in content.split("\n") if l.strip()]
                        if lines:
                            for i, line in enumerate(lines):
                                new_docs.append({
                                    "id": f"U{i+1:02d}",
                                    "title": f"Uploaded Doc {i+1}",
                                    "text": line,
                                })

                    if new_docs:
                        st.session_state.corpus = new_docs
                        st.session_state.extra_docs = new_docs
                        st.session_state.using_default_corpus = False
                        st.session_state.active_scenario = None
                        st.session_state.collection_tag = f"upload:{uploaded.name}:{len(new_docs)}"
                        st.cache_resource.clear()
                        st.success(f"✅ Loaded {len(new_docs)} documents from upload.")
                    else:
                        st.warning("⚠️ File was empty or unparseable. Falling back to default corpus.")
                        st.session_state.corpus = DEFAULT_CORPUS
                        st.session_state.using_default_corpus = True
                except Exception as e:
                    st.error(f"❌ Error reading file: {e}. Falling back to default corpus.")
                    st.session_state.corpus = DEFAULT_CORPUS
                    st.session_state.using_default_corpus = True

        else:  # Raw Text Entry
            raw_title = st.text_input("Document Title", value="Custom Document")
            raw_text = st.text_area("Paste Document Text Here", height=150)
            if st.button("➕ Add Document to Collection"):
                if raw_text.strip():
                    new_id = f"C{len(st.session_state.extra_docs)+1:02d}"
                    new_doc = {
                        "id": new_id,
                        "title": raw_title or f"Custom Doc {new_id}",
                        "text": raw_text.strip(),
                    }
                    if st.session_state.get("active_scenario"):
                        st.session_state.active_scenario = None
                        st.session_state.scenario_query = ""
                        st.session_state.scenario_relevant = []
                        st.session_state.extra_docs = []
                    st.session_state.extra_docs.append(new_doc)
                    st.session_state.corpus = DEFAULT_CORPUS + st.session_state.extra_docs
                    st.session_state.using_default_corpus = False
                    st.session_state.collection_tag = f"custom:{len(st.session_state.extra_docs)}"
                    st.cache_resource.clear()
                    st.success(f"✅ Document {new_id} added.")
                else:
                    st.warning("⚠️ Please enter some text before adding.")
            if st.session_state.extra_docs:
                st.markdown(f"**Custom documents added:** {len(st.session_state.extra_docs)}")

        # Collection stats
        corpus = st.session_state.corpus
        lengths = [len(preprocess(d["text"], True, True)) for d in corpus]
        c1, c2, c3 = st.columns(3)
        c1.metric("Documents (N)", len(corpus))
        c2.metric("Avg. Doc Length", f"{sum(lengths)/len(lengths):.1f} tokens")
        if st.session_state.using_default_corpus:
            source_name = "Default"
        elif st.session_state.get("active_scenario"):
            source_name = "Scenario"
        else:
            source_name = "Custom"
        c3.metric("Source", source_name)

    # ── Query & Parameters ───────────────────────────────────────────────
    col_left, col_right = st.columns([1, 1])

    with col_left:
        st.subheader("🔎 Query Configuration")
        scenario_active = bool(st.session_state.get("active_scenario"))
        query_mode_options = ["Preset Query", "Custom Query"]
        if scenario_active:
            query_mode_options.insert(0, "Scenario Query")
        query_mode = st.radio("Query Mode", query_mode_options, horizontal=True)
        has_qrels = False
        relevant_set: set[str] = set()

        if query_mode == "Scenario Query":
            query_text = st.session_state.get("scenario_query", "")
            relevant_set = set(st.session_state.get("scenario_relevant") or [])
            has_qrels = bool(relevant_set)
            st.text_input("Query Text (from query.txt)", value=query_text, disabled=True)
            if has_qrels:
                st.caption(
                    "Relevance judgements for this scenario: "
                    + ", ".join(sorted(relevant_set))
                )
        elif query_mode == "Preset Query":
            q_name = st.selectbox("Select Preset Query", list(PRESET_QUERIES.keys()))
            query_text = PRESET_QUERIES[q_name]["text"]
            relevant_set = set(PRESET_QUERIES[q_name]["relevant"])
            has_qrels = True and st.session_state.using_default_corpus
            st.text_input("Query Text (editable)", value=query_text, disabled=True)
        else:
            query_text = st.text_input("Enter Custom Query", placeholder="e.g., ranking algorithms retrieval")
            if not st.session_state.using_default_corpus:
                st.info("ℹ️ Custom documents detected — relevance metrics will be suppressed.")

        if not has_qrels and query_mode == "Preset Query":
            st.info("ℹ️ Using custom corpus — ground-truth relevance metrics suppressed.")

    with col_right:
        st.subheader("⚙️ Hyperparameters")
        k1_val = st.slider("k₁ (TF Saturation)", 0.0, 3.0, 1.5, 0.05, key="k1_slider")
        b_val = st.slider("b (Length Normalisation)", 0.0, 1.0, 0.75, 0.05, key="b_slider")
        rm_sw = st.toggle("Remove Stopwords", value=True, key="rm_sw")
        use_stem = st.toggle("Apply Stemming", value=True, key="use_stem")
        # Scenario collections can be tiny, so clamp the cutoff to the corpus size
        # and lift it back to the default once a larger collection is loaded.
        k_max = max(2, min(10, len(corpus)))
        k_max_prev = st.session_state.get("k_max_prev")
        k_stored = int(st.session_state.get("k_cutoff", 5))
        if k_max_prev is not None and k_max > k_max_prev and k_stored == k_max_prev:
            k_stored = min(5, k_max)
        st.session_state.k_cutoff = int(min(max(k_stored, 1), k_max))
        st.session_state.k_max_prev = k_max
        k_cutoff = st.slider("Evaluation cutoff K", 1, k_max, key="k_cutoff")

    if not query_text or not query_text.strip():
        st.warning("⚠️ Please enter a query to begin retrieval.")
        st.stop()

    # ── Build Engines ────────────────────────────────────────────────────
    corpus_ids = tuple(d["id"] for d in corpus)
    bm25_engine, tfidf_engine = build_engines(
        corpus_ids, k1_val, b_val, rm_sw, use_stem,
        st.session_state.get("collection_tag", "default"),
    )

    bm25_ranked, query_tokens = bm25_engine.rank(query_text)
    tfidf_ranked = tfidf_engine.rank(query_tokens)

    if not query_tokens:
        st.warning(
            "⚠️ Query is empty after preprocessing (all tokens are stopwords or OOV). "
            "Try a different query or disable stopword removal."
        )
        st.stop()

    # Map doc_idx → doc_id
    bm25_ids = [corpus[i]["id"] for i, _ in bm25_ranked]
    tfidf_ids = [corpus[i]["id"] for i, _ in tfidf_ranked]

    st.caption(f"**Preprocessed query tokens:** `{' | '.join(query_tokens)}`")

    # ── Algorithm Step-by-Step Trace ─────────────────────────────────────
    top_n = min(10, len(corpus))
    with st.expander('🔍 Algorithm Step-by-Step Trace', expanded=False):
        st.markdown('#### 1. Preprocessing Pipeline')
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.markdown('**Raw Query**')
            st.code(str(query_text))
        with col2:
            st.markdown('**Tokenized**')
            raw_tokens = re.findall(r'[a-zA-Z]+', query_text.lower())
            st.code(str(raw_tokens))
        with col3:
            st.markdown('**After Stopwords**')
            no_stop = [t for t in raw_tokens if t not in STOP_WORDS] if rm_sw else raw_tokens
            st.code(str(no_stop))
        with col4:
            st.markdown('**After Stemming**')
            st.code(str(query_tokens))
            
        st.markdown('#### 2. IDF Computation Table')
        idf_rows = []
        for t in set(query_tokens):
            nt = bm25_engine.df.get(t, 0)
            idf_v = bm25_engine.idf(t)
            idf_rows.append({
                'Term': t, 'n(t)': nt, 'N': bm25_engine.N,
                'IDF formula': f'ln(1 + ({bm25_engine.N} - {nt} + 0.5)/({nt} + 0.5))',
                'IDF value': round(idf_v, 4)
            })
        st.dataframe(pd.DataFrame(idf_rows), use_container_width=True, hide_index=True)
        
        st.markdown('#### 3. Per-Document TF Breakdown (Top 3 BM25 Docs)')
        for r_pos, (d_idx, b_sc) in enumerate(bm25_ranked[:3], 1):
            d_id = corpus[d_idx]['id']
            with st.expander(f'Doc {d_id} (Rank {r_pos}, Score {b_sc:.4f})'):
                t_rows = []
                dl = bm25_engine.doc_lengths[d_idx]
                lp = 1 - b_val + b_val * dl / bm25_engine.avgdl
                tf_doc = bm25_engine.tf_per_doc[d_idx]
                for t in set(query_tokens):
                    f = tf_doc.get(t, 0)
                    idf_v = bm25_engine.idf(t)
                    num = f * (k1_val + 1)
                    den = f + k1_val * lp
                    tf_w = num / den if den else 0
                    t_rows.append({
                        'Term': t, 'f(t,D)': f, 'doc_len': dl, 'avgdl': round(bm25_engine.avgdl, 1),
                        'Length Factor': round(lp, 4), 'TF Weight': round(tf_w, 4), 'IDF': round(idf_v, 4),
                        'Sub-Score': round(tf_w * idf_v, 4)
                    })
                st.dataframe(pd.DataFrame(t_rows), use_container_width=True, hide_index=True)
                
        st.markdown('#### 4. Rank Comparison Table')
        rank_comp = []
        tfidf_rank_map = {corpus[idx]['id']: r for r, (idx, _) in enumerate(tfidf_ranked, 1)}
        for r_pos, (d_idx, _) in enumerate(bm25_ranked[:top_n], 1):
            d_id = corpus[d_idx]['id']
            t_rank = tfidf_rank_map.get(d_id, len(corpus))
            delta = t_rank - r_pos
            if delta > 0:
                direction = '🟢 ↑'
            elif delta < 0:
                direction = '🔴 ↓'
            else:
                direction = '⚪ ='
            rank_comp.append({
                'Doc ID': d_id, 'BM25 Rank': r_pos, 'TF-IDF Rank': t_rank,
                'Rank Change (Δ)': abs(delta), 'Direction': direction
            })
        st.dataframe(pd.DataFrame(rank_comp), use_container_width=True, hide_index=True)


    # ── Ranked Results ───────────────────────────────────────────────────
    st.subheader("📊 Ranked Results")

    bm25_rows = []
    for rank_pos, (doc_idx, score) in enumerate(bm25_ranked[:top_n], 1):
        doc = corpus[doc_idx]
        is_rel = doc["id"] in relevant_set if has_qrels else None
        bm25_rows.append({
            "Rank": rank_pos,
            "Doc ID": doc["id"],
            "Title": doc["title"][:50],
            "BM25 Score": round(score, 4),
            "Relevant?": ("✅" if is_rel else "❌") if has_qrels else "—",
        })

    tfidf_rows = []
    for rank_pos, (doc_idx, score) in enumerate(tfidf_ranked[:top_n], 1):
        doc = corpus[doc_idx]
        is_rel = doc["id"] in relevant_set if has_qrels else None
        tfidf_rows.append({
            "Rank": rank_pos,
            "Doc ID": doc["id"],
            "Title": doc["title"][:50],
            "TF-IDF Score": round(score, 4),
            "Relevant?": ("✅" if is_rel else "❌") if has_qrels else "—",
        })

    rc1, rc2 = st.columns(2)
    with rc1:
        st.markdown("**BM25 Ranking**")
        st.dataframe(
            pd.DataFrame(bm25_rows),
            use_container_width=True,
            hide_index=True,
            height=350,
        )
    with rc2:
        st.markdown("**TF-IDF Ranking**")
        st.dataframe(
            pd.DataFrame(tfidf_rows),
            use_container_width=True,
            hide_index=True,
            height=350,
        )

    # ── Score Bar Chart ───────────────────────────────────────────────────
    fig_scores = go.Figure()
    fig_scores.add_trace(go.Bar(
        name="BM25",
        x=[r["Doc ID"] for r in bm25_rows],
        y=[r["BM25 Score"] for r in bm25_rows],
        marker_color="royalblue",
    ))
    fig_scores.add_trace(go.Bar(
        name="TF-IDF",
        x=[r["Doc ID"] for r in tfidf_rows],
        y=[r["TF-IDF Score"] for r in tfidf_rows],
        marker_color="tomato",
    ))
    fig_scores.update_layout(
        title="Top-10 Document Scores: BM25 vs TF-IDF",
        barmode="group",
        xaxis_title="Document ID",
        yaxis_title="Score",
        legend_title="Model",
        height=360,
    )
    st.plotly_chart(fig_scores, use_container_width=True)

    with st.expander('📊 BM25 vs TF-IDF Comparison Charts', expanded=False):
        st.markdown('#### Benchmark Evaluation on Preset Queries')
        
        if st.session_state.using_default_corpus:
            # Chart A
            bm25_agg = {'MAP': 0, 'MRR': 0, 'NDCG@5': 0, 'P@5': 0}
            tfidf_agg = {'MAP': 0, 'MRR': 0, 'NDCG@5': 0, 'P@5': 0}
            per_query_ap = []
            
            for pq_name, pq_data in PRESET_QUERIES.items():
                pq_rel = set(pq_data['relevant'])
                b_ranked, b_tok = bm25_engine.rank(pq_data['text'])
                t_ranked = tfidf_engine.rank(b_tok)
                b_ids = [corpus[i]['id'] for i, _ in b_ranked]
                t_ids = [corpus[i]['id'] for i, _ in t_ranked]
                
                b_mets = compute_all_metrics(b_ids, t_ids, pq_rel, k=5)
                t_mets = compute_all_metrics(t_ids, b_ids, pq_rel, k=5) 
                
                bm25_agg['P@5'] += b_mets['P@5']
                bm25_agg['NDCG@5'] += b_mets['nDCG@5']
                bm25_agg['MRR'] += b_mets['MRR']
                bm25_agg['MAP'] += b_mets['AP']
                
                tfidf_agg['P@5'] += t_mets['P@5']
                tfidf_agg['NDCG@5'] += t_mets['nDCG@5']
                tfidf_agg['MRR'] += t_mets['MRR']
                tfidf_agg['MAP'] += t_mets['AP']
                
                per_query_ap.append({
                    'Query': pq_name,
                    'BM25 AP': round(b_mets['AP'], 4),
                    'TF-IDF AP': round(t_mets['AP'], 4)
                })
                
            n_q = len(PRESET_QUERIES)
            bm25_agg_vals = [v/n_q for v in bm25_agg.values()]
            tfidf_agg_vals = [v/n_q for v in tfidf_agg.values()]
            metrics_names = list(bm25_agg.keys())
            
            fig_eval = go.Figure()
            fig_eval.add_trace(go.Bar(name='Okapi BM25', x=metrics_names, y=bm25_agg_vals, marker_color='#2563EB'))
            fig_eval.add_trace(go.Bar(name='TF-IDF', x=metrics_names, y=tfidf_agg_vals, marker_color='#F59E0B'))
            fig_eval.update_layout(title='Aggregate Ranking Performance: BM25 vs TF-IDF', yaxis=dict(title='Score (0-1)', range=[0,1.05]), barmode='group', height=380)
            st.plotly_chart(fig_eval, use_container_width=True)
            
            # Chart D
            st.markdown('#### Per-Query Average Precision (AP)')
            st.dataframe(pd.DataFrame(per_query_ap), use_container_width=True)
            
        else:
            st.info("Chart A & D require the default corpus with preset relevance judgements.")

        # Chart B: TF Saturation Curve
        st.markdown('#### TF Saturation Behavior')
        tf_range = list(range(1, 31))
        bm25_curve = [tf * (k1_val + 1) / (tf + k1_val) for tf in tf_range]
        log_curve = [1 + math.log(tf) for tf in tf_range]
        linear_curve = [0.25 * tf for tf in tf_range]
        
        fig_sat = go.Figure()
        fig_sat.add_trace(go.Scatter(x=tf_range, y=bm25_curve, mode='lines+markers', name=f'BM25 (k1={k1_val})', line=dict(color='#2563EB', width=3)))
        fig_sat.add_trace(go.Scatter(x=tf_range, y=log_curve, mode='lines', name='Log TF (1+ln(tf))', line=dict(color='#10B981', dash='dash')))
        fig_sat.add_trace(go.Scatter(x=tf_range, y=linear_curve, mode='lines', name='Linear TF (0.25*tf)', line=dict(color='#EF4444', dash='dot')))
        fig_sat.add_hline(y=k1_val+1, line_dash='dash', line_color='#64748B', annotation_text=f'Asymptote (k1+1={k1_val+1:.1f})')
        fig_sat.update_layout(title='TF Weighting Comparison', xaxis_title='Term Frequency (tf)', yaxis_title='Weight', height=380)
        st.plotly_chart(fig_sat, use_container_width=True)

        # Chart C: Document Length Penalty
        st.markdown('#### Document Length Penalty Curve')
        len_ratio = np.linspace(0.2, 3.0, 50)
        fig_len = go.Figure()
        for b_cand in [0.0, 0.3, 0.75, 1.0]:
            penalty = [1 - b_cand + b_cand * r for r in len_ratio]
            lw = 3 if abs(b_cand - b_val) < 0.01 else 1
            fig_len.add_trace(go.Scatter(x=len_ratio, y=penalty, mode='lines', name=f'b={b_cand}', line=dict(width=lw)))
        fig_len.update_layout(title='Length Penalty Factor by b', xaxis_title='Length Ratio (|D| / avgdl)', yaxis_title='Penalty Denominator Component', height=380)
        st.plotly_chart(fig_len, use_container_width=True)


    # ── Metrics Panel ─────────────────────────────────────────────────────
    st.subheader("📐 Evaluation Metrics")
    if has_qrels and relevant_set:
        metrics = compute_all_metrics(bm25_ids, tfidf_ids, relevant_set, k=k_cutoff)
        m_cols = st.columns(len(metrics))
        for col, (metric_name, metric_val) in zip(m_cols, metrics.items()):
            col.metric(metric_name, metric_val)
    else:
        st.info(
            "ℹ️ Ground-truth relevance metrics (P@K, R@K, F1@K, nDCG, MRR, AP) are suppressed "
            "for custom queries / custom corpora without relevance judgements. "
            "Kendall's τ (rank correlation) is still available."
        )
        tau = kendall_tau(bm25_ids, tfidf_ids)
        st.metric("Kendall's τ (BM25 vs TF-IDF rank correlation)", round(tau, 4))
        metrics = {"Kendall τ": round(tau, 4)}

    # ── "Why This Score?" Diagnostics ────────────────────────────────────
    st.subheader("🔬 \"Why This Score?\" — Per-Term Diagnostics")
    doc_options = [f"{corpus[i]['id']} – {corpus[i]['title'][:45]}" for i, _ in bm25_ranked[:top_n]]
    selected_doc_label = st.selectbox("Select document to inspect:", doc_options)
    selected_doc_id = selected_doc_label.split(" – ")[0]
    selected_doc_idx = next(i for i, d in enumerate(corpus) if d["id"] == selected_doc_id)

    diag_rows = bm25_engine.term_diagnostics(query_tokens, selected_doc_idx)
    if diag_rows:
        st.dataframe(pd.DataFrame(diag_rows), use_container_width=True, hide_index=True)
        total_score = sum(r["Sub-Score"] for r in diag_rows)
        st.caption(f"**Total BM25 Score for {selected_doc_id}: {total_score:.4f}**  |  "
                   f"Doc length = {bm25_engine.doc_lengths[selected_doc_idx]} tokens  |  "
                   f"avgdl = {bm25_engine.avgdl:.1f}")

        # Waterfall / contribution bar
        fig_diag = go.Figure(go.Bar(
            x=[r["Term"] for r in diag_rows],
            y=[r["Sub-Score"] for r in diag_rows],
            marker_color="mediumseagreen",
            text=[f"{r['Sub-Score']:.4f}" for r in diag_rows],
            textposition="outside",
        ))
        fig_diag.update_layout(
            title=f"Per-Term BM25 Contribution — {selected_doc_id}",
            xaxis_title="Query Term",
            yaxis_title="Sub-Score (IDF × TF Weight)",
            height=350,
        )
        st.plotly_chart(fig_diag, use_container_width=True)
    else:
        st.info("No query terms found in this document.")

    # ── Parameter Sweep Charts ────────────────────────────────────────────
    st.subheader("📈 Parameter Sensitivity Analysis")
    sweep_tabs = st.tabs(["k₁ Saturation Sweep", "b Length Normalisation Sweep"])

    # Number of top docs to track
    n_sweep_docs = min(5, len(corpus))
    sweep_doc_idxs = [i for i, _ in bm25_ranked[:n_sweep_docs]]
    sweep_doc_ids = [corpus[i]["id"] for i in sweep_doc_idxs]

    with sweep_tabs[0]:
        st.caption(f"Tracking top-{n_sweep_docs} BM25 documents as k₁ varies (b fixed at {b_val:.2f})")
        k1_range = np.arange(0.0, 3.05, 0.15)
        sweep_data_k1 = {did: [] for did in sweep_doc_ids}
        for k1v in k1_range:
            eng_tmp = BM25Engine(corpus, k1=float(k1v), b=b_val,
                                 remove_stopwords=rm_sw, apply_stemming=use_stem)
            for doc_idx, did in zip(sweep_doc_idxs, sweep_doc_ids):
                sweep_data_k1[did].append(eng_tmp.bm25_score(query_tokens, doc_idx))

        fig_k1 = go.Figure()
        for did in sweep_doc_ids:
            fig_k1.add_trace(go.Scatter(
                x=list(k1_range), y=sweep_data_k1[did],
                mode="lines+markers", name=did,
                line=dict(width=2 if did == bm25_ids[0] else 1),
            ))
        fig_k1.add_vline(x=k1_val, line_dash="dash", line_color="red",
                         annotation_text=f"Current k₁={k1_val}")
        fig_k1.update_layout(
            title="BM25 Score vs k₁ (TF Saturation Parameter)",
            xaxis_title="k₁", yaxis_title="BM25 Score",
            legend_title="Doc ID", height=400,
        )
        st.plotly_chart(fig_k1, use_container_width=True)

    with sweep_tabs[1]:
        st.caption(f"Tracking top-{n_sweep_docs} BM25 documents as b varies (k₁ fixed at {k1_val:.2f})")
        b_range = np.arange(0.0, 1.05, 0.05)
        sweep_data_b = {did: [] for did in sweep_doc_ids}
        for bv in b_range:
            eng_tmp = BM25Engine(corpus, k1=k1_val, b=float(bv),
                                 remove_stopwords=rm_sw, apply_stemming=use_stem)
            for doc_idx, did in zip(sweep_doc_idxs, sweep_doc_ids):
                sweep_data_b[did].append(eng_tmp.bm25_score(query_tokens, doc_idx))

        fig_b = go.Figure()
        for did in sweep_doc_ids:
            fig_b.add_trace(go.Scatter(
                x=list(b_range), y=sweep_data_b[did],
                mode="lines+markers", name=did,
                line=dict(width=2 if did == bm25_ids[0] else 1),
            ))
        fig_b.add_vline(x=b_val, line_dash="dash", line_color="red",
                        annotation_text=f"Current b={b_val}")
        fig_b.update_layout(
            title="BM25 Score vs b (Length Normalisation Parameter)",
            xaxis_title="b", yaxis_title="BM25 Score",
            legend_title="Doc ID", height=400,
        )
        st.plotly_chart(fig_b, use_container_width=True)

    # ── Trial Logger ──────────────────────────────────────────────────────
    st.subheader("📋 Trial Data Logger")
    log_col1, log_col2 = st.columns([3, 1])
    with log_col1:
        if st.button("✅ Log This Trial", type="primary"):
            trial = {
                "Timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
                "Query": query_text[:40],
                "k1": k1_val,
                "b": b_val,
                "Stopwords": rm_sw,
                "Stemming": use_stem,
                "Top3_BM25": ", ".join(bm25_ids[:3]),
                "Top3_TFIDF": ", ".join(tfidf_ids[:3]),
            }
            if has_qrels and relevant_set:
                trial.update({
                    f"P@{k_cutoff}": metrics.get(f"P@{k_cutoff}", "—"),
                    f"nDCG@{k_cutoff}": metrics.get(f"nDCG@{k_cutoff}", "—"),
                    "MRR": metrics.get("MRR", "—"),
                })
                # For PDF compatibility
                trial["P@5"] = metrics.get(f"P@{k_cutoff}", "N/A")
                trial["nDCG@5"] = metrics.get(f"nDCG@{k_cutoff}", "N/A")
            else:
                trial["P@5"] = "N/A"
                trial["nDCG@5"] = "N/A"
            trial["Kendall τ"] = metrics.get("Kendall τ", "—")
            st.session_state.trial_log.append(trial)
            st.success("Trial logged!")

    with log_col2:
        if st.button("🗑️ Clear All Trials"):
            st.session_state.trial_log = []
            st.rerun()

    if st.session_state.trial_log:
        df_log = pd.DataFrame(st.session_state.trial_log)
        st.dataframe(df_log, use_container_width=True, hide_index=True)
        csv_bytes = df_log.to_csv(index=False).encode("utf-8")
        st.download_button(
            "📥 Download Trial Log (CSV)",
            data=csv_bytes,
            file_name="bm25_trial_log.csv",
            mime="text/csv",
        )
    else:
        st.caption("No trials logged yet. Run experiments and click 'Log This Trial'.")


# ═════════════════════════════════════════════════════════════════════════════
#  SECTION 5 – ASSESSMENT QUIZ
# ═════════════════════════════════════════════════════════════════════════════

elif section == "📝 Assessment Quiz":
    st.title("📝 Assessment Quiz")
    st.markdown("Assess your understanding of IR concepts, BM25 parameters, and evaluation metrics.")

    st.subheader('⚙️ Quiz Settings')
    col_diff, col_topic = st.columns(2)
    with col_diff:
        difficulty = st.selectbox('Difficulty Level', ['Mixed', 'Easy', 'Medium', 'Hard'], key='quiz_difficulty')
    with col_topic:
        topic_filter = st.selectbox('Topic Filter', ['All Topics', 'IR Fundamentals', 'TF-IDF', 'BM25 Parameters', 'BM25 Formula', 'Evaluation Metrics', 'Text Preprocessing', 'Probabilistic Models', 'Modern IR'], key='quiz_topic')

    if st.button('🔀 Shuffle Questions') or st.session_state.current_quiz_questions is None:
        pool = QUESTION_BANK
        if difficulty != 'Mixed':
            pool = [q for q in pool if q['difficulty'] == difficulty]
        if topic_filter != 'All Topics':
            pool = [q for q in pool if q['topic'] == topic_filter]
        if len(pool) < 10:
            pool = QUESTION_BANK  # fallback to full bank
        st.session_state.current_quiz_questions = random.sample(pool, min(10, len(pool)))
        st.session_state.quiz_answers = {}
        st.session_state.quiz_submitted = False
        st.rerun()

    active_questions = st.session_state.get('current_quiz_questions', random.sample(QUESTION_BANK, 10))

    answers = st.session_state.quiz_answers
    submitted = st.session_state.quiz_submitted

    with st.form(key="quiz_form"):
        for i, q in enumerate(active_questions):
            st.markdown(f"**Q{i+1}. {q['q']}**")
            current_choice = answers.get(i, None)
            
            ans_idx = st.radio(
                label=f"q_{i}",
                options=list(range(len(q["opts"]))),
                format_func=lambda x, opts=q["opts"]: opts[x],
                index=current_choice if current_choice is not None else None,
                key=f"quiz_radio_{i}",
                label_visibility="collapsed",
                disabled=submitted,
            )
            if not submitted:
                answers[i] = ans_idx

            if submitted:
                user_ans = answers.get(i)
                if user_ans == q["ans"]:
                    st.success(f"✅ **Correct!** {q['exp']}")
                elif user_ans is None:
                    st.warning(f"⚠️ **Unanswered.** Correct choice: **{q['opts'][q['ans']]}**\n\nExplanation: {q['exp']}")
                else:
                    st.error(f"❌ **Incorrect.** Correct choice: **{q['opts'][q['ans']]}**\n\nExplanation: {q['exp']}")
            st.markdown("---")

        if not submitted:
            submit_btn = st.form_submit_button("📩 Submit Quiz", type="primary")
            if submit_btn:
                st.session_state.quiz_submitted = True
                st.rerun()

    if submitted:
        score = sum(1 for i, q in enumerate(active_questions) if answers.get(i) == q["ans"])
        total = len(active_questions)
        pct = (score / total) * 100
        passed = pct >= 70.0

        st.subheader("📊 Quiz Results")
        c_sc1, c_sc2 = st.columns(2)
        c_sc1.metric("Final Score", f"{score} / {total} ({pct:.0f}%)")
        if passed:
            c_sc2.success("🎉 **PASSED** (Cutoff: 70%)")
        else:
            c_sc2.error("❌ **NEEDS REVIEW** (Cutoff: 70%)")

        if st.button("🔄 Reset Quiz"):
            st.session_state.quiz_answers = {}
            st.session_state.quiz_submitted = False
            st.rerun()


# ═════════════════════════════════════════════════════════════════════════════
#  SECTION 6 – REFERENCES
# ═════════════════════════════════════════════════════════════════════════════

elif section == "🔖 References":
    st.title("🔖 References")

    st.subheader("📖 Foundational Textbooks")
    books = [
        {
            "citation": (
                "Manning, C. D., Raghavan, P., & Schütze, H. (2008). "
                "*Introduction to Information Retrieval*. Cambridge University Press."
            ),
            "url": "https://nlp.stanford.edu/IR-book/",
            "note": "The definitive open-access textbook covering TF-IDF, Boolean retrieval, evaluation metrics, and probabilistic models.",
        },
        {
            "citation": (
                "Büttcher, S., Clarke, C. L. A., & Cormack, G. V. (2010). "
                "*Information Retrieval: Implementing and Evaluating Search Engines*. MIT Press."
            ),
            "url": "https://mitpress.mit.edu/9780262026024/information-retrieval/",
            "note": "Comprehensive coverage of indexing, retrieval models, and evaluation with implementation focus.",
        },
        {
            "citation": (
                "Baeza-Yates, R., & Ribeiro-Neto, B. (2011). "
                "*Modern Information Retrieval* (2nd ed.). Addison-Wesley."
            ),
            "url": "https://www.mir2ed.org/",
            "note": "Broad treatment of IR theory including probabilistic and language models.",
        },
    ]
    for book in books:
        with st.expander(book["citation"]):
            st.markdown(book["note"])
            st.markdown(f"[🔗 Access Resource]({book['url']})")

    st.subheader("📄 Key Research Papers")
    papers = [
        {
            "citation": (
                "Robertson, S. E., & Zaragoza, H. (2009). "
                "The probabilistic relevance framework: BM25 and beyond. "
                "*Foundations and Trends in Information Retrieval*, 3(4), 333–389."
            ),
            "doi": "https://doi.org/10.1561/1500000019",
            "note": "The authoritative survey of the BM25 family, its derivation from the probabilistic relevance framework, and variants.",
        },
        {
            "citation": (
                "Robertson, S. E., Walker, S., Jones, S., Hancock-Beaulieu, M. M., & Gatford, M. (1995). "
                "Okapi at TREC-3. "
                "*TREC-3 Proceedings*, National Institute of Standards and Technology."
            ),
            "doi": "https://trec.nist.gov/pubs/trec3/papers/city.ps.gz",
            "note": "Original paper introducing Okapi BM25 in the TREC-3 competition.",
        },
        {
            "citation": (
                "Sparck Jones, K., Walker, S., & Robertson, S. E. (2000). "
                "A probabilistic model of information retrieval: Development and comparative experiments. "
                "*Information Processing & Management*, 36(6), 779–808."
            ),
            "doi": "https://doi.org/10.1016/S0306-4573(00)00015-7",
            "note": "Development of the probabilistic relevance model underlying BM25.",
        },
        {
            "citation": (
                "Järvelin, K., & Kekäläinen, J. (2002). "
                "Cumulated gain-based evaluation of IR techniques. "
                "*ACM TOIS*, 20(4), 422–446."
            ),
            "doi": "https://doi.org/10.1145/582415.582418",
            "note": "Original paper defining Discounted Cumulative Gain (DCG) and nDCG.",
        },
        {
            "citation": (
                "Voorhees, E. M., & Harman, D. K. (Eds.). (2005). "
                "*TREC: Experiment and Evaluation in Information Retrieval*. MIT Press."
            ),
            "doi": "https://mitpress.mit.edu/9780262220736/",
            "note": "Comprehensive account of the TREC evaluation framework and benchmark collections.",
        },
    ]
    for paper in papers:
        with st.expander(paper["citation"]):
            st.markdown(paper["note"])
            st.markdown(f"[🔗 DOI / Access]({paper['doi']})")

    st.subheader("🌐 Online Resources")
    online = [
        ("IIT KGP NPTEL – Information Retrieval", "https://nptel.ac.in/courses/106105175"),
        ("Stanford CS276: Information Retrieval and Web Search", "https://web.stanford.edu/class/cs276/"),
        ("Elasticsearch BM25 Documentation", "https://www.elastic.co/guide/en/elasticsearch/reference/current/similarity.html"),
        ("Pyserini (Anserini Python Interface)", "https://github.com/castorini/pyserini"),
        ("BEIR: Retrieval Benchmark", "https://github.com/beir-cellar/beir"),
        ("TREC Datasets (NIST)", "https://trec.nist.gov/data.html"),
    ]
    for name, url in online:
        st.markdown(f"- [{name}]({url})")


# ═════════════════════════════════════════════════════════════════════════════
#  SECTION 7 – REPORT GENERATION
# ═════════════════════════════════════════════════════════════════════════════

elif section == "📄 Report Generation":
    st.title("📄 Report Generation")
    st.info(
        "Fill in your details below, review the theory summary and experimental logs, "
        "and click **Generate PDF Report** to download your formal lab report."
    )

    # ── Student Details ───────────────────────────────────────────────────
    st.subheader("🧑‍🎓 Student Details")
    det_col1, det_col2 = st.columns(2)
    with det_col1:
        student_name = st.text_input("Full Name", placeholder="e.g., Arjun Kumar")
        roll_no = st.text_input("Roll / Student ID", placeholder="e.g., 21CS1001")
    with det_col2:
        institution = st.text_input(
            "Institution",
            value="Indian Institute of Technology, Kharagpur",
        )
        date_str = st.date_input("Date of Experiment", value=datetime.date.today())

    # ── Theory Summary Section Preview ──────────────────────────────────────
    st.subheader("📖 Theory Summary Preview")
    with st.expander("Expand Theory Summary (Included in PDF)", expanded=True):
        st.markdown("""
### Okapi BM25 Ranking Principles
Okapi BM25 is a non-linear probabilistic document ranking function. It estimates document relevance with respect to a query using two primary mechanisms:

1. **Term Frequency Saturation ($k_1$)**:
   $$\\text{Score}_{TF}(f) = \\frac{f \\cdot (k_1 + 1)}{f + k_1 \\cdot \\left(1 - b + b \\cdot \\frac{|D|}{\\text{avgdl}}\\right)}$$
   Unlike linear TF-IDF, as term frequency $f \\to \\infty$, the term contribution asymptotes to $k_1 + 1$.

2. **Document Length Normalisation ($b$)**:
   Penalises longer documents that accumulate high term counts merely due to length rather than topical concentration.

3. **Robertson / Lucene Smoothed IDF**:
   $$\\text{IDF}(q_i) = \\ln\\left(1 + \\frac{N - n(q_i) + 0.5}{n(q_i) + 0.5}\\right)$$
        """)

    observations = st.text_area(
        "Observation Notes",
        placeholder=(
            "Record your observations here. For example:\n"
            "- Effect of k₁ on ranking of Document D03...\n"
            "- Setting b=0 caused document D10 to move from rank 4 to rank 1 because...\n"
            "- The Kendall τ between BM25 and TF-IDF was 0.6 indicating moderate agreement..."
        ),
        height=160,
    )

    # ── Trial Log Preview ─────────────────────────────────────────────────
    st.subheader("📋 Experimental Trial Log Preview")
    if st.session_state.trial_log:
        df_preview = pd.DataFrame(st.session_state.trial_log)
        st.dataframe(df_preview, use_container_width=True, hide_index=True)
    else:
        st.warning(
            "⚠️ No trials logged yet. Go to **Simulation**, run experiments, "
            "and click **Log This Trial** to record data."
        )

    # ── Quiz Performance ──────────────────────────────────────────────────
    st.subheader("📊 Quiz Performance Summary")
    quiz_score = None
    if st.session_state.quiz_submitted:
        active_q = st.session_state.get('current_quiz_questions', [])
        quiz_score = sum(
            1 for i, q in enumerate(active_q)
            if st.session_state.quiz_answers.get(i) == q.get("ans")
        )
        st.metric("Assessment Quiz Score", f"{quiz_score} / 10 ({quiz_score*10}%)")
    else:
        st.metric("Assessment Quiz Score", "Not attempted")

    # ── PDF Generation ────────────────────────────────────────────────────
    st.subheader("📥 Download Lab Report")
    if st.button("📄 Generate & Download PDF Report", type="primary"):
        if not student_name.strip():
            st.error("❌ Please enter your name before generating the report.")
        else:
            with st.spinner("Generating PDF report..."):
                try:
                    pdf_bytes = generate_pdf(
                        student_name=student_name.strip() or "—",
                        roll_no=roll_no.strip() or "—",
                        institution=institution.strip() or "—",
                        observations=observations.strip(),
                        trial_log=st.session_state.trial_log,
                        quiz_score=quiz_score,
                    )
                    fname = (
                        f"BM25_Lab_Report_{student_name.strip().replace(' ', '_')}"
                        f"_{date_str}.pdf"
                    )
                    st.download_button(
                        label="📥 Click Here to Download PDF",
                        data=pdf_bytes,
                        file_name=fname,
                        mime="application/pdf",
                    )
                    st.success("✅ PDF report generated successfully!")
                except Exception as e:
                    st.error(f"❌ PDF generation failed: {e}")
