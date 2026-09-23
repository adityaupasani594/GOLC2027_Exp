
# =============================================================================
# Dense Embedding-Based Semantic Search — Virtual Laboratory
# Embedding Model : all-MiniLM-L6-v2  | Dimension : 384
# Run : streamlit run dense_embedding_lab.py
# =============================================================================

# pyrefly: ignore [missing-import]
import streamlit as st
# pyrefly: ignore [missing-import]
import numpy as np
import pandas as pd
# pyrefly: ignore [missing-import]
import plotly.express as px
import plotly.graph_objects as go
import streamlit.components.v1 as components
import time, io, json, textwrap, random
from pathlib import Path
from datetime import datetime
from sklearn.decomposition import PCA
from sklearn.preprocessing import normalize
from sklearn.metrics.pairwise import cosine_similarity
# pyrefly: ignore [missing-import]
from sentence_transformers import SentenceTransformer
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors as rl_colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                Table, TableStyle, HRFlowable)
from reportlab.lib.units import cm

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Dense Embedding Lab",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Global CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* ─── CSS Custom Properties (High-Contrast Black Text) ───────────────────── */
:root {
  --bg:              #ffffff;
  --surface:         #ffffff;
  --surface-alt:     #f8fafc;
  --text:            #000000;
  --text-secondary:  #000000;
  --text-muted:      #111111;
  --border:          #cbd5e1;
  --accent:          #2563eb;
  --accent2:         #6d28d9;
  --green:           #059669;
  --orange:          #d97706;
  --metric-value:    #1d4ed8;
  --code-bg:         #f1f5f9;
  --code-text:       #000000;
  --table-even:      #f8fafc;
  --table-border:    #cbd5e1;
  --badge-blue-bg:   #dbeafe;
  --badge-blue-text: #1e40af;
  --badge-green-bg:  #d1fae5;
  --badge-green-text:#065f46;
  --badge-red-bg:    #fee2e2;
  --badge-red-text:  #991b1b;
  --pipe-arrow:      #6d28d9;
}

/* ─── Base Typography: Black & Larger ────────────────────────────────────── */
html, body, [class*="css"], .stApp {
  font-family: 'Inter', sans-serif !important;
  color: #000000 !important;
  font-size: 17px !important;
}
.block-container { padding: 2rem 2.5rem; }

/* Enforce black text across all streamlit elements */
p, span, div, li, td, th, label, h1, h2, h3, h4, h5, h6, .stMarkdown, .stMarkdown p {
  color: #000000 !important;
}

p, li, .stMarkdown p {
  font-size: 1.18rem !important;
  line-height: 1.8 !important;
}

h1, .stHeadingContainer h1 { font-size: 2.3rem !important; font-weight: 800 !important; color: #000000 !important; }
h2, .stHeadingContainer h2 { font-size: 1.85rem !important; font-weight: 700 !important; color: #000000 !important; }
h3, .stHeadingContainer h3 { font-size: 1.5rem !important; font-weight: 700 !important; color: #000000 !important; }
h4, .stHeadingContainer h4 { font-size: 1.3rem !important; font-weight: 600 !important; color: #000000 !important; }

/* Streamlit Widget Labels & Inputs */
.stWidgetLabel label, .stWidgetLabel p, label, .stSelectbox label, .stRadio label, .stSlider label, .stTextInput label, .stTextArea label {
  font-size: 1.18rem !important;
  font-weight: 700 !important;
  color: #000000 !important;
}

div[role="radiogroup"] label span p, .stCheckbox label span p {
  font-size: 1.15rem !important;
  color: #000000 !important;
  font-weight: 500 !important;
}

/* Streamlit Inputs & Buttons text */
input, textarea, select, .stButton button, .stDownloadButton button {
  font-size: 1.12rem !important;
  color: #000000 !important;
}

.stButton button, .stDownloadButton button {
  font-weight: 600 !important;
  border-radius: 8px !important;
  padding: 0.55rem 1.2rem !important;
}

/* ─── Cards ──────────────────────────────────────────────────────────────── */
.card {
  background:    var(--surface);
  color:         #000000 !important;
  font-size:     1.18rem !important;
  line-height:   1.75;
  border-radius: 12px;
  padding:       1.5rem 1.8rem;
  box-shadow:    0 2px 12px rgba(0,0,0,0.08);
  margin-bottom: 1.2rem;
  border:        1.5px solid var(--border);
}
.card b, .card strong { color: #000000 !important; font-weight: 700; }
.card i, .card em    { color: #000000 !important; }
.card p { font-size: 1.15rem !important; color: #000000 !important; line-height: 1.75 !important; }

.card-blue   { border-left: 5px solid var(--accent);  }
.card-purple { border-left: 5px solid var(--accent2); }
.card-green  { border-left: 5px solid var(--green);   }
.card-orange { border-left: 5px solid var(--orange);  }

/* ─── Metric mini-cards ──────────────────────────────────────────────────── */
.metric-row  { display:flex; gap:1rem; flex-wrap:wrap; margin:1rem 0; }
.metric-card {
  flex:1; min-width:140px;
  background:    var(--surface);
  color:         #000000 !important;
  border-radius: 10px;
  padding:       1.1rem 1.3rem;
  box-shadow:    0 2px 8px rgba(0,0,0,0.08);
  border:        1.5px solid var(--border);
  text-align:    center;
  margin-bottom: 0.8rem;
}
.metric-value {
  font-size:   2.2rem;
  font-weight: 800;
  color:       var(--metric-value);
}
.metric-label { font-size: 0.95rem; font-weight: 700; color: #000000 !important; margin-top: 4px; }

/* ─── Pipeline ───────────────────────────────────────────────────────────── */
.pipeline { display:flex; align-items:center; flex-wrap:wrap; gap:0; margin:1rem 0; }
.pipe-box {
  background:    linear-gradient(135deg, var(--accent), var(--accent2));
  color:         #ffffff !important;
  border-radius: 8px;
  padding:       0.6rem 1.1rem;
  font-size:     0.95rem;
  font-weight:   700;
  text-align:    center;
  min-width:     100px;
}
.pipe-arrow { font-size:1.5rem; color:var(--pipe-arrow); padding:0 6px; font-weight:800; }

/* ─── Section headings ───────────────────────────────────────────────────── */
.section-title {
  font-size:     1.65rem;
  font-weight:   800;
  color:         #000000 !important;
  border-bottom: 2.5px solid var(--accent);
  padding-bottom:8px;
  margin:        1.8rem 0 1.2rem 0;
}
.subsection-title {
  font-size:   1.3rem;
  font-weight: 700;
  color:       var(--accent);
  margin:      1.2rem 0 0.6rem 0;
}

/* ─── Sidebar info card ──────────────────────────────────────────────────── */
.info-card {
  background:    linear-gradient(135deg, #1e3a8a 0%, #4338ca 100%);
  border-radius: 10px;
  padding:       1.1rem 1.3rem;
  color:         #ffffff !important;
  margin-bottom: 1rem;
}
.info-card h4 { margin:0 0 8px 0; font-size:1.05rem; font-weight:700; color:#ffffff !important; }
.info-card p  { margin:4px 0; font-size:0.9rem !important; color:#ffffff !important; opacity:0.95; }

/* ─── Comparison / result table ──────────────────────────────────────────── */
.comp-table { width:100%; border-collapse:collapse; color:#000000 !important; font-size: 1.05rem; }
.comp-table th {
  background: var(--accent);
  color:      #ffffff !important;
  padding:    10px 14px;
  font-size:  1.08rem;
  font-weight:700;
  text-align: left;
}
.comp-table td { padding:10px 14px; border-bottom:1px solid var(--table-border); color:#000000 !important; }
.comp-table tr:nth-child(even) td { background:var(--table-even); }
.comp-table code { color:#000000 !important; background:var(--code-bg); padding:2px 6px; border-radius:4px; font-size:0.98rem; }

/* ─── Badges ─────────────────────────────────────────────────────────────── */
.badge {
  display:       inline-block;
  padding:       3px 12px;
  border-radius: 20px;
  font-size:     0.88rem;
  font-weight:   700;
}
.badge-blue  { background:var(--badge-blue-bg);  color:var(--badge-blue-text) !important;  }
.badge-green { background:var(--badge-green-bg); color:var(--badge-green-text) !important; }
.badge-red   { background:var(--badge-red-bg);   color:var(--badge-red-text) !important;   }

/* ─── Code / vector display ──────────────────────────────────────────────── */
code {
  background:    var(--code-bg) !important;
  color:         #000000 !important;
  border-radius: 4px;
  padding:       2px 6px;
  font-size:     1.02rem;
  font-weight:   600;
}

/* ─── Prominent Red Top-K Slider ─────────────────────────────────────────── */
.stSlider div[data-baseweb="slider"] {
  padding: 12px 0 !important;
}
.stSlider div[data-baseweb="slider"] > div > div:first-child {
  background: #ef4444 !important;
  height: 10px !important;
  border-radius: 5px !important;
}
.stSlider div[role="slider"] {
  background: #dc2626 !important;
  border: 3px solid #ffffff !important;
  width: 24px !important;
  height: 24px !important;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.8) !important;
}

/* ─── Horizontal Flowchart ───────────────────────────────────────────────── */
.flowchart-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.8rem;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 1.4rem;
  margin: 1.2rem 0;
}
.flow-node {
  flex: 1;
  min-width: 145px;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1rem 1.2rem;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
.flow-node.flow-highlight {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(109, 40, 217, 0.15));
  border: 1.5px solid var(--accent);
}
.flow-node.flow-highlight2 {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.15), rgba(37, 99, 235, 0.15));
  border: 1.5px solid var(--green);
}
.flow-title {
  font-weight: 800;
  font-size: 1.15rem;
  color: #000000 !important;
  letter-spacing: 0.3px;
}
.flow-sub {
  font-size: 0.95rem;
  color: #000000 !important;
  margin-top: 4px;
}
.flow-arrow {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--accent);
  padding: 0 4px;
}

.stDataFrame, iframe {
  color: #000000 !important;
  font-size: 1.05rem !important;
}

.stCaption, .stCaption p {
  color: #000000 !important;
  font-size: 0.98rem !important;
  font-weight: 500 !important;
}

.streamlit-expanderHeader {
  font-size: 1.15rem !important;
  font-weight: 700 !important;
  color: #000000 !important;
}

</style>
""", unsafe_allow_html=True)

# ── Session state init ────────────────────────────────────────────────────────
def _init_state():
    defaults = {
        "trials": [],
        "quiz_done": False,
        "quiz_score": 0,
        "quiz_answers": {},
        "quiz_questions": [],
        "student_name": "",
        "roll_no": "",
        "class_div": "",
        "date_str": datetime.now().strftime("%d %B %Y"),
        "documents": None,
        "doc_embeddings": None,
        "last_query": "",
        "last_results": None,
        "last_query_time": 0.0,
        "last_embedding_dimension": 384,
        "last_documents_compared": 0,
        "last_threshold": 0.25,
        "last_score_distribution": None,
        "index_built": False,
        "document_embeddings": None,
        "indexed_documents": None,
        "index_signature": "",
        "index_build_time": 0.0,
        "uploaded_documents": None,
        "upload_message": "",
        "compare_results": {},
        "challenge_done": False,
        "activity_logs": [
            {"time": datetime.now().strftime("%H:%M:%S"), "msg": "Virtual Laboratory initialized"}
        ],
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v

_init_state()

def log_activity(msg: str):
    if "activity_logs" not in st.session_state:
        st.session_state["activity_logs"] = []
    # Avoid recording duplicate consecutive messages
    if not st.session_state["activity_logs"] or st.session_state["activity_logs"][-1]["msg"] != msg:
        t = datetime.now().strftime("%H:%M:%S")
        st.session_state["activity_logs"].append({"time": t, "msg": msg})
        if len(st.session_state["activity_logs"]) > 25:
            st.session_state["activity_logs"] = st.session_state["activity_logs"][-25:]

# ── Embedding model (cached) ──────────────────────────────────────────────────
@st.cache_resource(show_spinner="Loading all-MiniLM-L6-v2 …")
def load_model():
    return SentenceTransformer("all-MiniLM-L6-v2")

model = load_model()
EMBED_DIM = 384

# ── Built-in documents ────────────────────────────────────────────────────────
BUILTIN_DOCS = [
    {"id": "D1", "title": "Machine Learning Basics",
     "text": "Machine learning allows computers to learn patterns from data without being explicitly programmed."},
    {"id": "D2", "title": "Deep Learning & Neural Networks",
     "text": "Deep learning uses multi-layer neural networks to solve complex recognition and prediction problems."},
    {"id": "D3", "title": "Natural Language Processing",
     "text": "NLP enables machines to understand, interpret, and generate human language using statistical models."},
    {"id": "D4", "title": "Database Systems",
     "text": "Database systems store, organise, and manage large volumes of structured information efficiently."},
    {"id": "D5", "title": "Computer Vision",
     "text": "Computer vision teaches machines to interpret and understand visual information from images and videos."},
    {"id": "D6", "title": "Domestic Animals",
     "text": "Dogs and cats are among the most common animals kept as domestic pets around the world."},
    {"id": "D7", "title": "Reinforcement Learning",
     "text": "Reinforcement learning trains agents to make decisions by rewarding desired behaviours."},
    {"id": "D8", "title": "Cloud Computing",
     "text": "Cloud computing provides on-demand access to computing resources, storage, and services over the Internet."},
]

# Ground-truth relevance labels for built-in evaluation queries
EVAL_QUERIES = [
    {"query": "How do computers learn from data?",
     "relevant": {"D1", "D2", "D7"}},
    {"query": "How are neural networks used?",
     "relevant": {"D2", "D1", "D3"}},
    {"query": "How is information stored?",
     "relevant": {"D4", "D8"}},
    {"query": "What animals are kept as pets?",
     "relevant": {"D6"}},
]

# ── Helper functions ──────────────────────────────────────────────────────────
def embed_texts(texts: list[str]) -> np.ndarray:
    embs = model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    return normalize(embs)

@st.cache_data(show_spinner=False)
def get_cached_doc_embeddings(texts: tuple[str, ...]) -> np.ndarray:
    embs = model.encode(list(texts), convert_to_numpy=True, show_progress_bar=False)
    return normalize(embs)

def cosine_sim(query_vec: np.ndarray, doc_vecs: np.ndarray) -> np.ndarray:
    # Both are already L2-normalised, so dot product == cosine similarity
    return doc_vecs @ query_vec

def run_search(query: str, docs: list[dict], doc_embs: np.ndarray,
               top_k: int) -> tuple:
    t0 = time.time()
    q_emb = embed_texts([query])[0]
    sims = cosine_sim(q_emb, doc_embs)
    ranked_idx = np.argsort(sims)[::-1]
    results = []
    for rank, idx in enumerate(ranked_idx[:top_k], 1):
        d = docs[idx].copy()
        d["rank"] = rank
        d["score"] = float(sims[idx])
        results.append(d)
    elapsed = time.time() - t0
    return results, elapsed, q_emb, sims, ranked_idx

def compute_metrics(results, relevant_ids, total_relevant, top_k, sims, ranked_idx, docs):
    retrieved_ids = [r["id"] for r in results]
    rel_retrieved = sum(1 for rid in retrieved_ids if rid in relevant_ids)

    precision = rel_retrieved / top_k if top_k > 0 else 0.0
    recall = rel_retrieved / total_relevant if total_relevant > 0 else 0.0
    f1 = (2 * precision * recall / (precision + recall)
          if (precision + recall) > 0 else 0.0)

    # MRR
    mrr = 0.0
    for rank, idx in enumerate(ranked_idx, 1):
        if docs[idx]["id"] in relevant_ids:
            mrr = 1.0 / rank
            break

    return {"precision": precision, "recall": recall, "f1": f1, "mrr": mrr,
            "rel_retrieved": rel_retrieved}

def precision_recall_at_k_curve(docs, doc_embs, query, relevant_ids, ks=(1,2,3,4,5)):
    q_emb = embed_texts([query])[0]
    sims = cosine_sim(q_emb, doc_embs)
    ranked_idx = np.argsort(sims)[::-1]
    total_rel = len(relevant_ids)
    rows = []
    for k in ks:
        top_ids = [docs[i]["id"] for i in ranked_idx[:k]]
        rr = sum(1 for x in top_ids if x in relevant_ids)
        p = rr / k if k else 0
        r = rr / total_rel if total_rel else 0
        f = 2*p*r/(p+r) if (p+r) else 0
        rows.append({"K": k, "Precision": p, "Recall": r, "F1": f})
    return pd.DataFrame(rows)

# ── Theme detection & Plotly helper ──────────────────────────────────────────
def _is_dark() -> bool:
    """Return True when Streamlit is running in dark mode."""
    try:
        base = str(st.get_option("theme.base") or "").lower()
        if base == "dark":
            return True
        bg = str(st.get_option("theme.backgroundColor") or "").lower()
        if any(dark_bg in bg for dark_bg in ["0e1117", "0f172a", "111827", "1e293b", "000000", "black"]):
            return True
        txt = str(st.get_option("theme.textColor") or "").lower()
        if any(light_txt in txt for light_txt in ["fff", "f1f5f9", "f8fafc", "e2e8f0", "white"]):
            return True
    except Exception:
        pass
    # Default to True so text is white and high-contrast on dark UI
    return True

def plotly_theme() -> dict:
    """Return layout theme parameters for Plotly charts."""
    dark = _is_dark()
    bg       = "rgba(0,0,0,0)"   # transparent background
    txt_col  = "#ffffff" if dark else "#111827"
    grid_col = "#475569" if dark else "#e5e7eb"
    return {
        "plot_bgcolor": bg,
        "paper_bgcolor": bg,
        "font": dict(color=txt_col, family="Inter, sans-serif"),
        "gridcolor": grid_col,
    }


def render_header():
    # Persistent student/experiment metadata header removed across all pages per virtual lab guidelines
    pass

# ══════════════════════════════════════════════════════════════════════════════
# PAGE 1 — PURPOSE
# ══════════════════════════════════════════════════════════════════════════════
def page_purpose():
    render_header()
    st.markdown("## Purpose")
    
    st.markdown("""
    <div class='card card-blue'>
      <p style='font-size:1.15rem; line-height:1.8; margin:0;'>
        This virtual laboratory experiment demonstrates how <b>dense vector embeddings</b> convert unstructured 
        natural language into high-dimensional numerical vectors, allowing a search system to retrieve documents 
        based on <b>underlying semantic meaning and intent</b> rather than superficial exact-keyword matching.
      </p>
    </div>
    """, unsafe_allow_html=True)

    # ── Realistic Real-World Example ──────────────────────────────────────────
    st.markdown("<div class='section-title'>Real-World Example — E-Commerce Semantic Search</div>", unsafe_allow_html=True)
    st.markdown("Consider a customer searching an online shopping store for sports gear:")
    
    c_ex1, c_ex2 = st.columns(2)
    with c_ex1:
        st.markdown("""
        <div class='card card-orange' style='height:100%;'>
          <div style='font-weight:700; color:var(--orange); font-size:1.2rem; margin-bottom:8px;'>
            🛒 Traditional Keyword Search
          </div>
          <p><b>User Query:</b> <code>"comfortable shoes for running"</code></p>
          <p><b>Search Logic:</b> Looks for literal word occurrences such as <em>"running"</em> and <em>"shoes"</em>.</p>
          <div style='background:var(--code-bg); padding:10px 14px; border-radius:8px; margin:10px 0; border:1px solid var(--border);'>
            ❌ <b>Misses:</b> <em>"lightweight athletic footwear designed for jogging"</em>
          </div>
          <span class='badge badge-red'>Vocabulary Mismatch</span>
          <p style='font-size:0.95rem; margin-top:10px; color:var(--text-secondary);'>
            The document is totally relevant to the customer, but keyword search discards it because 
            synonyms like <b>"footwear"</b> and <b>"jogging"</b> do not match the exact query strings.
          </p>
        </div>
        """, unsafe_allow_html=True)
    with c_ex2:
        st.markdown("""
        <div class='card card-blue' style='height:100%;'>
          <div style='font-weight:700; color:var(--accent); font-size:1.2rem; margin-bottom:8px;'>
            ⚡ Dense Semantic Search
          </div>
          <p><b>User Query:</b> <code>"comfortable shoes for running"</code></p>
          <p><b>Search Logic:</b> Encodes text into 384-D dense vectors and measures cosine proximity.</p>
          <div style='background:var(--code-bg); padding:10px 14px; border-radius:8px; margin:10px 0; border:1px solid var(--border);'>
            ✅ <b>Successfully Retrieves:</b> <em>"lightweight athletic footwear designed for jogging"</em>
          </div>
          <span class='badge badge-green'>Conceptual Semantic Alignment</span>
          <p style='font-size:0.95rem; margin-top:10px; color:var(--text-secondary);'>
            Even though the vocabulary is completely different, the neural embedding model recognizes that 
            both texts express identical intent, placing them closely together in vector space.
          </p>
        </div>
        """, unsafe_allow_html=True)

    # ── Educational Visuals ───────────────────────────────────────────────────
    st.markdown("<div class='section-title'>Educational Visuals: Principles of Dense Retrieval</div>", unsafe_allow_html=True)
    st.caption("Visualizing the transformation of text into dense feature vectors and cosine similarity geometry.")
    
    col_img1, col_img2 = st.columns(2)
    with col_img1:
        st.image("assets/semantic_search_concept.jpg", 
                 caption="Figure 1: Traditional Keyword Matching vs. Dense Semantic Search in E-Commerce Intent Retrieval",
                 use_column_width=True)
    with col_img2:
        st.image("assets/text_embedding_vector.jpg", 
                 caption="Figure 2: Text-to-Dense Embedding Process using Pretrained Transformer Models",
                 use_column_width=True)

    st.image("assets/cosine_vector_similarity.jpg", 
             caption="Figure 3: Geometric Interpretation of Cosine Similarity in High-Dimensional Vector Space",
             use_column_width=True)

    st.markdown("<div class='section-title'>Core Semantic Search Workflow</div>", unsafe_allow_html=True)
    st.markdown("""
    <div class='flowchart-container'>
      <div class='flow-node'>
        <div class='flow-title'>1. TEXT</div>
        <div class='flow-sub'>Documents &amp; Queries</div>
      </div>
      <div class='flow-arrow'>→</div>
      <div class='flow-node flow-highlight'>
        <div class='flow-title'>2. DENSE EMBEDDING</div>
        <div class='flow-sub'>Neural Transformer</div>
      </div>
      <div class='flow-arrow'>→</div>
      <div class='flow-node flow-highlight2'>
        <div class='flow-title'>3. VECTOR SPACE</div>
        <div class='flow-sub'>384-D Unit Vectors</div>
      </div>
      <div class='flow-arrow'>→</div>
      <div class='flow-node'>
        <div class='flow-title'>4. COSINE SIMILARITY</div>
        <div class='flow-sub'>Dot-Product Comparison</div>
      </div>
      <div class='flow-arrow'>→</div>
      <div class='flow-node flow-highlight'>
        <div class='flow-title'>5. TOP-K RESULTS</div>
        <div class='flow-sub'>Ranked by Score</div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<div class='section-title'>Experiment Configuration</div>", unsafe_allow_html=True)
    c1, c2, c3 = st.columns(3)
    for col, val, lbl in zip([c1, c2, c3],
        ["all-MiniLM-L6-v2", "384 Dimensions", "Cosine Similarity"],
        ["Pretrained Embedding Model", "Vector Representation Size", "Mathematical Similarity Metric"]):
        col.markdown(f"""
        <div class='metric-card'>
          <div class='metric-value' style='font-size:1.15rem;'>{val}</div>
          <div class='metric-label' style='font-size:0.85rem;'>{lbl}</div>
        </div>
        """, unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# PAGE 2 — THEORY
# ══════════════════════════════════════════════════════════════════════════════
def page_theory():
    render_header()
    st.markdown("## Theory")

    st.markdown("<div class='section-title'>Keyword Search vs. Semantic Search</div>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    with c1:
        st.markdown("""
        <div class='card card-orange'>
          <b style='font-size:1.15rem;'>KEYWORD SEARCH (LEXICAL)</b><br><br>
          Query: <i>"How do computers learn?"</i><br><br>
          Matches on exact words:<br>
          &nbsp;• "computer"<br>
          &nbsp;• "learn"<br><br>
          <span class='badge badge-red'>Misses synonyms &amp; related concepts</span>
          <p style='font-size:0.95rem; margin-top:8px; color:var(--text-secondary);'>
            Fails when users express questions in natural conversational language using terms 
            not explicitly present in the index.
          </p>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown("""
        <div class='card card-blue'>
          <b style='font-size:1.15rem;'>SEMANTIC SEARCH (DENSE VECTOR)</b><br><br>
          Query: <i>"How do computers learn?"</i><br><br>
          Understands related conceptual contexts:<br>
          &nbsp;• machine learning<br>
          &nbsp;• artificial intelligence<br>
          &nbsp;• neural networks<br>
          &nbsp;• learning patterns from data<br><br>
          <span class='badge badge-green'>Retrieves meaning, not just words</span>
          <p style='font-size:0.95rem; margin-top:8px; color:var(--text-secondary);'>
            Maps conceptually similar concepts into proximate regions of a continuous high-dimensional vector space.
          </p>
        </div>
        """, unsafe_allow_html=True)

    # ── Flowchart ─────────────────────────────────────────────────────────────
    st.markdown("<div class='section-title'>What Is an Embedding?</div>", unsafe_allow_html=True)
    st.markdown("""
    An **embedding** converts human text into a fixed-length numerical vector so that mathematical 
    algorithms can compute and compare the *meaning* of different pieces of text. 
    Sentences with similar meanings produce vectors that point in similar directions in vector space.
    """)

    st.markdown("""
    <div class='flowchart-container'>
      <div class='flow-node'>
        <div class='flow-title'>TEXT</div>
        <div class='flow-sub'>Raw query or document</div>
      </div>
      <div class='flow-arrow'>→</div>
      <div class='flow-node flow-highlight'>
        <div class='flow-title'>EMBEDDING MODEL</div>
        <div class='flow-sub'>all-MiniLM-L6-v2</div>
      </div>
      <div class='flow-arrow'>→</div>
      <div class='flow-node'>
        <div class='flow-title'>NUMERICAL VECTOR</div>
        <div class='flow-sub'>Continuous real numbers</div>
      </div>
      <div class='flow-arrow'>→</div>
      <div class='flow-node flow-highlight2'>
        <div class='flow-title'>384-D VECTOR</div>
        <div class='flow-sub'><code>[0.021, -0.143, ...]</code></div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    > **Why use an embedding model?**  
    > It converts text into numerical representations that capture semantic meaning, allowing mathematically measurable comparison between texts.
    """)

    # ── Model Theory ──────────────────────────────────────────────────────────
    st.markdown("<div class='section-title'>The all-MiniLM-L6-v2 Model</div>", unsafe_allow_html=True)
    st.markdown("""
    This experiment employs **all-MiniLM-L6-v2** from the Sentence Transformers library:

    | Property | Value | Description |
    |---|---|---|
    | **Architecture** | MiniLM (Distilled BERT) | 6 Transformer layers with multi-head attention |
    | **Output Dimension** | **384** | Each text becomes a vector of 384 floating-point values |
    | **Training Data** | 1B+ sentence pairs | Pretrained to maximize cosine similarity between related pairs |
    | **Similarity Metric** | Cosine Similarity | Normalized dot product $\\cos(\\theta)$ |
    | **Library** | `sentence-transformers` | Open-source state-of-the-art sentence embeddings |
    """)

    st.markdown("""
    > **Why all-MiniLM-L6-v2?**  
    > It provides compact 384-dimensional sentence embeddings that are fast enough for interactive semantic-search experiments while retaining useful semantic information.
    """)

    # ── Dense Embeddings ──────────────────────────────────────────────────────
    st.markdown("<div class='section-title'>Dense Embeddings</div>", unsafe_allow_html=True)
    st.markdown("""
    A **dense embedding** has most or all numerical values non-zero, unlike sparse representations such as
    TF-IDF or bag-of-words where most entries are zero. Dense embeddings are generated by neural networks
    trained on massive text corpora, capturing rich contextual and conceptual relationships.

    > **Key Concept:** Individual dimensions do not have isolated human-interpretable labels. 
    > Rather, semantic meaning emerges from the **collective pattern across all 384 dimensions**.
    """)

    # ── Document & Query Embeddings ───────────────────────────────────────────
    st.markdown("<div class='section-title'>Document &amp; Query Embeddings</div>", unsafe_allow_html=True)
    st.markdown("""
    Both documents and queries are converted into vectors using the **exact same model** so they exist 
    in a unified coordinate system where their similarity can be evaluated directly.
    """)

    c_doc, c_qry = st.columns(2)
    with c_doc:
        st.markdown("""
        <div class='card card-blue'>
          <b style='font-size:1.1rem;'>📄 Document Embeddings</b><br><br>
          Each document in the database is encoded into a 384-D vector before retrieval begins.
          These embeddings form the searchable vector index.
        </div>
        """, unsafe_allow_html=True)
    with c_qry:
        st.markdown("""
        <div class='card card-green'>
          <b style='font-size:1.1rem;'>🔍 Query Embedding</b><br><br>
          When a user inputs a query, the <em>same</em> model converts it into a 384-D vector in real time.
          Direct dot-product computes cosine similarity against all document vectors simultaneously.
        </div>
        """, unsafe_allow_html=True)

    # ── Graph 1 & Graph 2 Visualizations ─────────────────────────────────────
    st.markdown("<div class='subsection-title'>Visualizing the Embedding Space (2D PCA)</div>", unsafe_allow_html=True)

    tab_g1, tab_g2 = st.tabs(["📈 Graph 1 — Document Embeddings", "🎯 Graph 2 — Query vs Document Embeddings"])

    # Pre-calculate PCA for built-in documents
    b_texts = tuple(d["text"] for d in BUILTIN_DOCS)
    b_embs = get_cached_doc_embeddings(b_texts)
    pca_base = PCA(n_components=2, random_state=42)
    pca_docs_2d = pca_base.fit_transform(b_embs)

    with tab_g1:
        st.markdown("#### Graph 1 — Document Embeddings in 2D Space")
        df_g1 = pd.DataFrame({
            "PCA Dim 1": pca_docs_2d[:, 0],
            "PCA Dim 2": pca_docs_2d[:, 1],
            "Document": [f"{d['id']}: {d['title']}" for d in BUILTIN_DOCS],
            "Snippet": [d["text"][:70] + "..." for d in BUILTIN_DOCS]
        })
        fig_g1 = px.scatter(
            df_g1,
            x="PCA Dim 1",
            y="PCA Dim 2",
            text="Document",
            hover_data={"Snippet": True, "PCA Dim 1": False, "PCA Dim 2": False},
            title="2D PCA Projection of Built-In Document Collection",
        )
        fig_g1.update_traces(
            textposition="top center",
            marker=dict(size=13, color="#4361ee", line=dict(width=2, color="#ffffff"))
        )
        fig_g1.update_layout(
            margin=dict(l=20, r=20, t=40, b=20),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            height=430,
        )
        st.plotly_chart(fig_g1, use_container_width=True)
        st.caption("ℹ️ **Note:** The original embeddings contain 384 dimensions; PCA projects them into 2D only for visualization.")

    with tab_g2:
        st.markdown("#### Graph 2 — Query vs Document Embeddings")
        st.caption("Select a sample query to see how the query vector aligns with related documents:")
        demo_query = st.selectbox(
            "Sample Query for Theory Visualization:",
            [
                "How do computers learn from data?",
                "How are neural networks used?",
                "How is information stored?",
                "What animals are kept as domestic pets?"
            ],
            key="theory_demo_query"
        )
        q_vec = embed_texts([demo_query])[0]
        all_vecs_demo = np.vstack([q_vec.reshape(1, -1), b_embs])
        pca_demo = PCA(n_components=2, random_state=42)
        demo_2d = pca_demo.fit_transform(all_vecs_demo)

        sims_demo = cosine_sim(q_vec, b_embs)
        df_g2 = pd.DataFrame({
            "PCA Dim 1": demo_2d[:, 0],
            "PCA Dim 2": demo_2d[:, 1],
            "Entity": [f"⭐ QUERY: '{demo_query[:25]}…'"] + [f"{d['id']}: {d['title']}" for d in BUILTIN_DOCS],
            "Type": ["User Query"] + ["Document" for _ in BUILTIN_DOCS],
            "Similarity Score": [1.0] + [float(s) for s in sims_demo]
        })
        fig_g2 = px.scatter(
            df_g2,
            x="PCA Dim 1",
            y="PCA Dim 2",
            text="Entity",
            color="Type",
            hover_data={"Similarity Score": ":.4f", "PCA Dim 1": False, "PCA Dim 2": False},
            color_discrete_map={"User Query": "#f72585", "Document": "#4361ee"},
            title=f"Query Vector Alignment in 2D Embedding Space: '{demo_query}'"
        )
        fig_g2.update_traces(
            textposition="top center",
            marker=dict(size=14, line=dict(width=1.5, color="#ffffff"))
        )
        fig_g2.update_layout(
            margin=dict(l=20, r=20, t=40, b=20),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            height=440,
        )
        st.plotly_chart(fig_g2, use_container_width=True)
        st.caption("ℹ️ **Note:** Do not claim that PCA itself performs the semantic search. It is only a visualization of the original embedding space. Documents with higher semantic similarity naturally position closer to the query vector.")

    # ── Cosine Similarity ─────────────────────────────────────────────────────
    st.markdown("<div class='section-title'>Cosine Similarity</div>", unsafe_allow_html=True)
    st.markdown("""
    Cosine similarity calculates the cosine of the angle $\\theta$ between the query vector $A$ and document vector $B$:
    """)
    st.latex(r"\text{Cosine Similarity}(A, B) = \frac{A \cdot B}{\|A\| \cdot \|B\|} = \cos(\theta)")
    st.markdown("""
    Because our embeddings are pre-normalized to unit length ($\\|A\\| = \\|B\\| = 1$), cosine similarity simplifies 
    to the **dot product**: $\\text{Similarity}(A, B) = A \\cdot B$.
    """)

    c1, c2, c3 = st.columns(3)
    c1.markdown("<div class='metric-card'><div class='metric-value' style='font-size:1.3rem; color:#06d6a0;'>+1.0</div><div class='metric-label'>Identical direction (High Similarity)</div></div>", unsafe_allow_html=True)
    c2.markdown("<div class='metric-card'><div class='metric-value' style='font-size:1.3rem; color:#f4a261;'>≈ 0.0</div><div class='metric-label'>Orthogonal (No Semantic Correlation)</div></div>", unsafe_allow_html=True)
    c3.markdown("<div class='metric-card'><div class='metric-value' style='font-size:1.3rem; color:#ef4444;'>-1.0</div><div class='metric-label'>Opposite direction (Negative Correlation)</div></div>", unsafe_allow_html=True)

    # ── Top-K Retrieval ───────────────────────────────────────────────────────
    st.markdown("<div class='section-title'>Similarity Ranking &amp; Top-K Retrieval</div>", unsafe_allow_html=True)
    st.markdown("""
    After computing cosine similarities across all candidate documents:
    1. Documents are **sorted in descending order** by similarity score.
    2. **Top-K retrieval** selects the top $K$ highest-ranked documents to return to the user.

    > ⚠️ **Important Distinction:** **Top-K** represents the **number of returned search results** (e.g. K = 5), 
    > while **384** is the **number of embedding dimensions**. They are entirely independent parameters.
    """)

    # ── Illustrative Table ────────────────────────────────────────────────────
    st.markdown("<div class='section-title'>Illustrative Example of Semantic Matching</div>", unsafe_allow_html=True)
    st.markdown("**Query:** *'How do computers learn from data?'*")
    ex_df = pd.DataFrame({
        "Rank": [1, 2, 3, 4],
        "Document": [
            "Machine learning allows computers to learn patterns from data.",
            "Deep learning uses neural networks to solve complex problems.",
            "Database systems store and manage large volumes of information.",
            "Dogs and cats are commonly kept as domestic pets.",
        ],
        "Similarity": ["High (0.68) ↑", "Moderate-High (0.53) ↑", "Low (0.19)", "Very Low (0.02) ↓"],
        "Reason": [
            "Directly about computer learning patterns from data",
            "Strong conceptual connection to AI neural models",
            "Mentions computers but off-topic",
            "Completely unrelated topic",
        ],
    })
    st.dataframe(ex_df, use_container_width=True, hide_index=True)
    st.caption("_These similarity labels are illustrative. The Retrieval Lab shows real "
               "calculated cosine similarity values._")

    st.markdown("""
    > The query does not need to contain exactly the same words as the document.
    > The embedding model maps semantically related text into nearby regions of
    > vector space.
    """)

    # Why does this work?
    st.markdown("<div class='section-title'>Why Does This Work?</div>",
                unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    with c1:
        st.markdown("""
        <div class='card card-orange'>
          <b>Traditional Search</b><br>
          Text → keyword matching → results<br><br>
          Fails when synonyms or paraphrases are used.
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown("""
        <div class='card card-green'>
          <b>Semantic Search</b><br>
          Text → embeddings → similarity → ranking → results<br><br>
          Works because the neural model learned from large text corpora that
          <em>similar concepts appear in similar contexts</em>.
        </div>
        """, unsafe_allow_html=True)
    st.markdown("""
    "Words are converted into vectors by a pretrained sentence-transformer
    model. Text with related meaning can be represented by vectors that are
    closer in the learned embedding space. Retrieval then becomes a vector
    similarity problem."
    """)

    # Mini challenge
    st.markdown("<div class='section-title'>Try It Yourself — Mini Challenge</div>",
                unsafe_allow_html=True)
    st.markdown("""
    The following documents are in the collection:

    | ID | Title |
    |----|-------|
    | D1 | Machine Learning Basics |
    | D2 | Deep Learning & Neural Networks |
    | D6 | Domestic Animals |
    | D8 | Cloud Computing |

    **Which query should retrieve the machine-learning documents?**
    """)
    challenge_q = st.text_input(
        "Enter your query:", placeholder="e.g. How do machines learn?",
        key="challenge_input"
    )
    if st.button("Run Challenge Search"):
        if not challenge_q.strip():
            st.warning("Please enter a query.")
        else:
            docs_ch = [d for d in BUILTIN_DOCS if d["id"] in {"D1","D2","D6","D8"}]
            embs_ch = embed_texts([d["text"] for d in docs_ch])
            res_ch, _, _, _, _ = run_search(challenge_q, docs_ch, embs_ch, top_k=4)
            st.success(f"Your query retrieved (in order):")
            for r in res_ch:
                badge = "badge-green" if r["id"] in {"D1","D2"} else "badge-red"
                st.markdown(
                    f"- **{r['rank']}. {r['title']}** — score: `{r['score']:.4f}` "
                    f"<span class='badge {badge}'>{'ML-relevant' if r['id'] in {'D1','D2'} else 'other'}</span>",
                    unsafe_allow_html=True
                )

# ══════════════════════════════════════════════════════════════════════════════
# PAGE 3 — SIMULATION (Dense Embedding-Based Semantic Search Simulation)
# ══════════════════════════════════════════════════════════════════════════════

DATA_FILE = Path("data/documents.csv")
MODEL_NAME = "all-MiniLM-L6-v2"
BASE_DIR = Path(__file__).resolve().parent

# ── HTML rendering helpers ───────────────────────────────────────────────────
def render_html(markup):
    cleaned = " ".join(
        line.strip()
        for line in markup.strip().splitlines()
        if line.strip()
    )
    st.markdown(cleaned, unsafe_allow_html=True)


def to_html_paragraphs(text):
    blocks = [
        block.strip().replace("\n", " ")
        for block in text.strip().split("\n\n")
        if block.strip()
    ]
    return "".join(f"<p>{block}</p>" for block in blocks)


def escape_html(value):
    return (
        str(value)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )

# ── Custom CSS for Simulation ────────────────────────────────────────────────
SIMULATION_CSS = """
<style>
.simulation-header {
    padding: 18px 0px 16px 0px;
    border-bottom: 2.5px solid var(--border);
    margin-bottom: 24px;
}

.simulation-title {
    color: #000000 !important;
    font-size: 32px !important;
    font-weight: 800 !important;
    letter-spacing: -0.5px;
}

.simulation-subtitle {
    color: #000000 !important;
    font-size: 17px !important;
    font-weight: 500 !important;
    margin-top: 6px;
}

.content-heading {
    color: #000000 !important;
    font-size: 28px !important;
    font-weight: 800 !important;
    border-bottom: 2.5px solid var(--accent);
    padding-bottom: 10px;
    margin-top: 24px;
    margin-bottom: 18px;
}

.content-subheading {
    color: #000000 !important;
    font-size: 22px !important;
    font-weight: 700 !important;
    margin-top: 24px;
    margin-bottom: 14px;
}

.info-box {
    border-left: 5px solid var(--accent);
    background: var(--surface-alt);
    padding: 16px 20px;
    margin: 16px 0px;
    font-size: 1.18rem !important;
    line-height: 1.75;
    color: #000000 !important;
    border-radius: 0px 8px 8px 0px;
    border-top: 1px solid var(--border);
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
}

/* ---------------- PIPELINE DIAGRAM ---------------- */

.pipeline {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin: 14px 0px 20px 0px;
}

.pipeline-stage {
    background: var(--surface-alt);
    border: 1.5px solid var(--border);
    color: #000000 !important;
    border-radius: 6px;
    padding: 10px 16px;
    font-size: 16px !important;
    font-weight: 700;
}

.pipeline-stage.stage-done {
    background: #d1fae5;
    border-color: #059669;
    color: #065f46 !important;
}

.pipeline-stage.stage-active {
    background: #ffedd5;
    border-color: #ea580c;
    color: #9a3412 !important;
    box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.25);
}

.pipeline-stage.stage-todo {
    background: var(--surface-alt);
    border-color: var(--border);
    color: #333333 !important;
}

.pipeline-arrow {
    color: #ea580c;
    font-size: 22px;
    font-weight: 800;
}

.stage-label {
    display: inline-block;
    background: #ea580c;
    color: white !important;
    font-size: 14px !important;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 4px 12px;
    border-radius: 4px;
    margin-bottom: 8px;
}

/* ---------------- RESULT CARDS ---------------- */

.result-card {
    border: 1.5px solid var(--border);
    border-left: 6px solid var(--accent);
    border-radius: 8px;
    padding: 20px;
    margin: 16px 0px;
    background: var(--surface);
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

.result-rank {
    color: #d97706;
    font-size: 16px !important;
    font-weight: 800;
}

.result-title {
    color: #000000 !important;
    font-size: 22px !important;
    font-weight: 700 !important;
    margin-top: 5px;
}

.result-category {
    color: #000000 !important;
    font-size: 15px !important;
    font-weight: 600;
    margin: 4px 0px 12px 0px;
}

.result-content {
    color: #000000 !important;
    font-size: 17px !important;
    line-height: 1.75 !important;
}

.result-score {
    color: #059669 !important;
    font-weight: 800;
    margin-top: 12px;
    font-size: 17px !important;
}

.result-meta {
    color: #000000 !important;
    font-size: 14.5px !important;
    font-weight: 500;
    margin-top: 8px;
}
</style>
"""

# ── Interactive Vector Space Animation HTML ──────────────────────────────────
CONCEPT_ANIMATION_HTML = r"""
<div id="root">
  <div class="toolbar">
    <button id="playBtn">&#9654; Play Animation</button>
    <button id="replayBtn">&#8635; Replay</button>
    <label class="speedLabel">Speed:
      <select id="speedSelect">
        <option value="0.5">0.5x (Slow)</option>
        <option value="1" selected>1x (Normal)</option>
        <option value="1.5">1.5x</option>
        <option value="2">2x (Fast)</option>
        <option value="3">3x (Very Fast)</option>
      </select>
    </label>
    <div id="caption">Click Play to see how semantic search works, step by step.</div>
  </div>

  <div class="legend">
    <span class="chip"><i style="background:#4f8ff0"></i> AI &amp; ML topics</span>
    <span class="chip"><i style="background:#37b06a"></i> Systems topics</span>
    <span class="chip"><i style="background:#b06fe0"></i> Data topics</span>
    <span class="chip"><i style="background:#f47721;border-radius:50%"></i> Your query</span>
  </div>

  <div id="stepFlow" class="stepFlow"></div>

  <svg id="stage" viewBox="0 0 960 460" width="100%" height="430" preserveAspectRatio="xMidYMid meet">
    <text x="95" y="26" class="panelLabel">Documents</text>
    <rect x="15" y="36" width="165" height="380" rx="10" class="panel"/>
    <g id="docStack"></g>

    <polygon points="188,225 214,215 214,235" class="flowArrow" id="arrow1"/>
    <text x="201" y="255" class="arrowLabel">reads</text>

    <text x="425" y="26" class="panelLabel">Encoder Model</text>
    <rect id="encoderBox" x="345" y="185" width="150" height="90" rx="12" class="encoder"/>
    <text x="420" y="224" class="encoderText">Sentence</text>
    <text x="420" y="242" class="encoderText">Transformer</text>

    <polygon points="503,225 529,215 529,235" class="flowArrow" id="arrow2"/>
    <text x="516" y="255" class="arrowLabel">embeds</text>

    <text x="775" y="26" class="panelLabel">Embedding Space</text>
    <rect x="590" y="36" width="355" height="380" rx="10" class="panel"/>
    <g id="dotsLayer"></g>
    <g id="linesLayer"></g>
    <g id="travelLayer"></g>
    <g id="queryLayer"></g>
    <g id="rankLayer"></g>
  </svg>

  <div id="resultList" class="resultList"></div>
</div>

<style>
#root {
    font-family: 'Inter', -apple-system, "Segoe UI", Arial, sans-serif;
    background: #ffffff;
    color: #000000;
}

.toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.toolbar button {
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 10px 20px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
}

.toolbar button:hover { background: #1d4ed8; }

.speedLabel {
    font-size: 15px;
    color: #000000;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.speedLabel select {
    font-size: 15px;
    padding: 6px 10px;
    border: 1.5px solid #cbd5e1;
    border-radius: 6px;
    background: white;
    color: #000000;
    font-weight: 600;
}

#caption {
    color: #000000;
    font-size: 17px;
    font-weight: 700;
    min-height: 24px;
}

.legend {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 10px;
}

.stepFlow {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 6px 0px 16px 0px;
}

.stepPill {
    background: #f8fafc;
    border: 1.5px solid #cbd5e1;
    color: #000000;
    border-radius: 16px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    transition: background 300ms ease, border-color 300ms ease, color 300ms ease;
}

.stepPill.stepDone {
    background: #d1fae5;
    border-color: #059669;
    color: #065f46;
}

.stepPill.stepActive {
    background: #ea580c;
    border-color: #ea580c;
    color: #ffffff;
    box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.25);
}

.stepArrow {
    color: #94a3b8;
    font-size: 16px;
    font-weight: 800;
}

.flowArrow {
    fill: #cbd5e1;
    transition: fill 300ms ease;
}

.flowArrow.flowing {
    fill: #ea580c;
}

.arrowLabel {
    font-size: 12px;
    fill: #000000;
    font-weight: 600;
    text-anchor: middle;
}

.travelDot {
    filter: drop-shadow(0 0 2px rgba(0,0,0,0.25));
}

.chip {
    font-size: 15px;
    color: #000000;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.chip i {
    width: 12px;
    height: 12px;
    display: inline-block;
    border-radius: 3px;
}

.panel {
    fill: #f8fafc;
    stroke: #cbd5e1;
    stroke-width: 1.5;
}

.panelLabel {
    font-size: 17px;
    fill: #000000;
    font-weight: 800;
    text-anchor: middle;
}

.encoder {
    fill: #eff6ff;
    stroke: #2563eb;
    stroke-width: 2;
    transform-box: fill-box;
    transform-origin: center;
}

.encoder.pulse {
    animation: pulseKey 480ms ease;
}

@keyframes pulseKey {
    0%   { transform: scale(1); }
    45%  { transform: scale(1.1); filter: drop-shadow(0 0 6px #2563ebaa); }
    100% { transform: scale(1); }
}

.encoderText {
    font-size: 14px;
    fill: #000000;
    text-anchor: middle;
    font-weight: 700;
}

.docCard {
    transition: opacity 250ms ease;
}

.docCard rect {
    stroke-width: 1.5;
    fill: #ffffff;
}

.docCard.active rect {
    stroke: #ea580c;
    stroke-width: 2.5;
}

.docCard.done {
    opacity: 0.45;
}

.docLabel {
    font-size: 10px;
    fill: #000000;
    font-weight: 600;
}

.dot {
    transform-box: fill-box;
    transform-origin: center;
    transform: scale(0);
    opacity: 0;
    transition: transform 480ms cubic-bezier(.34,1.56,.64,1), opacity 300ms ease;
}

.dot.shown {
    transform: scale(1);
    opacity: 1;
}

.queryChip {
    opacity: 0;
    transition: opacity 350ms ease;
}

.queryChip.shown { opacity: 1; }

.queryDot {
    transform-box: fill-box;
    transform-origin: center;
    transform: scale(0);
    opacity: 0;
    transition: transform 500ms cubic-bezier(.34,1.56,.64,1), opacity 300ms ease;
}

.queryDot.shown {
    transform: scale(1);
    opacity: 1;
}

.simLine {
    stroke: #94a3b8;
    stroke-width: 1.5;
    opacity: 0;
    transition: opacity 500ms ease, stroke 400ms ease, stroke-width 400ms ease;
}

.simLine.shown { opacity: 0.55; }
.simLine.hot { stroke: #ea580c; stroke-width: 3; opacity: 0.95; }
.simLine.cold { opacity: 0.12; }

.rankBadge {
    transform-box: fill-box;
    transform-origin: center;
    transform: scale(0);
    opacity: 0;
    transition: transform 420ms cubic-bezier(.34,1.56,.64,1), opacity 300ms ease;
}

.rankBadge.shown { transform: scale(1); opacity: 1; }

.rankBadge circle { fill: #ea580c; }
.rankBadge text { fill: white; font-size: 13px; font-weight: 800; text-anchor: middle; }

.resultList {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.resultRow {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-left: 5px solid #ea580c;
    border-radius: 6px;
    padding: 10px 14px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 400ms ease, transform 400ms ease;
}

.resultRow.shown { opacity: 1; transform: translateY(0); }

.resultRank {
    font-weight: 800;
    color: #ea580c;
    font-size: 16px;
    width: 26px;
}

.resultTitle {
    flex: 1;
    font-size: 16px;
    color: #000000;
    font-weight: 700;
}

.resultBarTrack {
    width: 140px;
    height: 10px;
    background: #e2e8f0;
    border-radius: 5px;
    overflow: hidden;
}

.resultBarFill {
    height: 100%;
    width: 0%;
    background: #059669;
    transition: width 700ms ease;
}

.resultScore {
    width: 52px;
    text-align: right;
    font-size: 15px;
    color: #059669;
    font-weight: 700;
}
</style>

<script>
(function () {
    const svgNS = "http://www.w3.org/2000/svg";
    const root = document.getElementById("root");
    const docStack = root.querySelector("#docStack");
    const dotsLayer = root.querySelector("#dotsLayer");
    const linesLayer = root.querySelector("#linesLayer");
    const travelLayer = root.querySelector("#travelLayer");
    const queryLayer = root.querySelector("#queryLayer");
    const rankLayer = root.querySelector("#rankLayer");
    const encoderBox = root.querySelector("#encoderBox");
    const caption = root.querySelector("#caption");
    const resultList = root.querySelector("#resultList");
    const stepFlowEl = root.querySelector("#stepFlow");
    const arrow1 = root.querySelector("#arrow1");
    const arrow2 = root.querySelector("#arrow2");

    const STEPS = [
        "1. Read Documents",
        "2. Encode",
        "3. Build Index",
        "4. Read Query",
        "5. Compare & Rank",
        "6. Show Results",
    ];

    const COLORS = { ai: "#4f8ff0", sys: "#37b06a", data: "#b06fe0" };

    const DOCS = [
        { title: "Intro to Machine Learning", cluster: "ai", tx: 660, ty: 110 },
        { title: "Neural Networks Basics",     cluster: "ai", tx: 700, ty: 90  },
        { title: "Supervised Learning",        cluster: "ai", tx: 675, ty: 150 },
        { title: "Deep Learning Overview",     cluster: "ai", tx: 720, ty: 130 },
        { title: "NLP Fundamentals",           cluster: "ai", tx: 650, ty: 160 },
        { title: "Operating Systems",          cluster: "sys", tx: 860, ty: 240 },
        { title: "Computer Networks",          cluster: "sys", tx: 900, ty: 260 },
        { title: "Process Scheduling",         cluster: "sys", tx: 870, ty: 290 },
        { title: "Memory Management",          cluster: "sys", tx: 910, ty: 220 },
        { title: "Database Systems",           cluster: "data", tx: 720, ty: 360 },
        { title: "Data Warehousing",           cluster: "data", tx: 760, ty: 390 },
        { title: "Vector Databases",           cluster: "data", tx: 690, ty: 380 },
    ];

    const QUERY_TEXT = "How do machines learn from data?";
    const QUERY_TARGET = { tx: 690, ty: 130 };
    const TOP_K = [0, 3, 4];
    const MOCK_SCORES = { 0: 0.91, 3: 0.85, 4: 0.79 };

    function speedFactor() {
        const sel = document.getElementById("speedSelect");
        return sel ? parseFloat(sel.value) : 1;
    }

    function scaledMs(base) { return Math.max(60, base / speedFactor()); }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms / speedFactor())); }

    function setCaption(text) { caption.textContent = text; }

    function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

    const DOC_START_Y = 55;
    const DOC_GAP = 30;

    function buildStepFlow() {
        clear(stepFlowEl);
        STEPS.forEach((label, i) => {
            if (i > 0) {
                const arrow = document.createElement("span");
                arrow.className = "stepArrow";
                arrow.innerHTML = "&rarr;";
                stepFlowEl.appendChild(arrow);
            }
            const pill = document.createElement("span");
            pill.className = "stepPill";
            pill.id = "step-" + i;
            pill.textContent = label;
            stepFlowEl.appendChild(pill);
        });
    }

    function setStep(activeIndex) {
        STEPS.forEach((label, i) => {
            const pill = document.getElementById("step-" + i);
            pill.classList.remove("stepDone", "stepActive");
            if (i < activeIndex) pill.classList.add("stepDone");
            else if (i === activeIndex) pill.classList.add("stepActive");
        });
    }

    function tween(el, fromVals, toVals, duration) {
        return new Promise(resolve => {
            const t0 = performance.now();

            function frame(now) {
                const t = Math.min(1, (now - t0) / duration);
                const eased = 1 - Math.pow(1 - t, 3);

                for (const key in toVals) {
                    const v = fromVals[key] + (toVals[key] - fromVals[key]) * eased;
                    el.setAttribute(key, v);
                }

                if (t < 1) {
                    requestAnimationFrame(frame);
                } else {
                    resolve();
                }
            }

            requestAnimationFrame(frame);
        });
    }

    function buildDocStack() {
        clear(docStack);

        DOCS.forEach((doc, i) => {
            const g = document.createElementNS(svgNS, "g");
            g.setAttribute("class", "docCard");
            g.setAttribute("id", "doc-" + i);

            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", 30);
            rect.setAttribute("y", DOC_START_Y + i * DOC_GAP);
            rect.setAttribute("width", 130);
            rect.setAttribute("height", 20);
            rect.setAttribute("rx", 4);
            rect.setAttribute("stroke", COLORS[doc.cluster]);
            g.appendChild(rect);

            const label = document.createElementNS(svgNS, "text");
            label.setAttribute("x", 36);
            label.setAttribute("y", DOC_START_Y + i * DOC_GAP + 14);
            label.setAttribute("class", "docLabel");
            label.textContent = doc.title.length > 22 ? doc.title.slice(0, 20) + "..." : doc.title;
            g.appendChild(label);

            docStack.appendChild(g);
        });
    }

    function makeDot(x, y, color, extraClass) {
        const c = document.createElementNS(svgNS, "circle");
        c.setAttribute("cx", x);
        c.setAttribute("cy", y);
        c.setAttribute("r", 7);
        c.setAttribute("fill", color);
        c.setAttribute("class", "dot" + (extraClass ? " " + extraClass : ""));
        c.style.transition =
            "transform " + scaledMs(480) + "ms cubic-bezier(.34,1.56,.64,1), " +
            "opacity " + scaledMs(300) + "ms ease";
        return c;
    }

    function makeTravelDot(x, y, color) {
        const c = document.createElementNS(svgNS, "circle");
        c.setAttribute("cx", x);
        c.setAttribute("cy", y);
        c.setAttribute("r", 6);
        c.setAttribute("fill", color);
        c.setAttribute("class", "travelDot");
        return c;
    }

    async function flowDocumentToEmbedding(doc, index) {
        const rowY = DOC_START_Y + index * DOC_GAP + 10;
        const color = COLORS[doc.cluster];

        arrow1.classList.add("flowing");

        const travelDot = makeTravelDot(170, rowY, color);
        travelLayer.appendChild(travelDot);

        await tween(
            travelDot,
            { cx: 170, cy: rowY },
            { cx: 420, cy: 230 },
            scaledMs(360)
        );

        arrow1.classList.remove("flowing");
        await pulseEncoder();
        arrow2.classList.add("flowing");

        await tween(
            travelDot,
            { cx: 420, cy: 230 },
            { cx: doc.tx, cy: doc.ty },
            scaledMs(360)
        );

        arrow2.classList.remove("flowing");
        travelDot.remove();

        const dot = makeDot(doc.tx, doc.ty, color);
        dotsLayer.appendChild(dot);
        requestAnimationFrame(() => dot.classList.add("shown"));
    }

    function reset() {
        buildDocStack();
        buildStepFlow();
        clear(dotsLayer);
        clear(linesLayer);
        clear(travelLayer);
        clear(queryLayer);
        clear(rankLayer);
        clear(resultList);
        arrow1.classList.remove("flowing");
        arrow2.classList.remove("flowing");
        setCaption("Click Play to see how semantic search works, step by step.");
    }

    async function pulseEncoder() {
        encoderBox.style.animationDuration = scaledMs(480) + "ms";
        encoderBox.classList.add("pulse");
        await sleep(480);
        encoderBox.classList.remove("pulse");
    }

    async function playAnimation() {
        reset();
        await sleep(300);

        setStep(0);
        setCaption("Step 1 of 6 — Every document is read by the model, one at a time.");
        await sleep(400);

        for (let i = 0; i < DOCS.length; i++) {
            const doc = DOCS[i];
            const card = document.getElementById("doc-" + i);
            card.classList.add("active");

            if (i === Math.floor(DOCS.length / 2)) {
                setStep(1);
                setCaption("Step 2 of 6 — The encoder converts each document into a vector.");
            }

            await flowDocumentToEmbedding(doc, i);

            card.classList.remove("active");
            card.classList.add("done");

            await sleep(120);
        }

        setStep(2);
        setCaption("Step 3 of 6 — All documents are now points in the embedding index. Similar topics land close together.");
        await sleep(1300);

        setStep(3);
        setCaption("Step 4 of 6 — A new query from the user is typed in.");

        const chip = document.createElementNS(svgNS, "g");
        chip.setAttribute("class", "queryChip");
        chip.style.transition = "opacity " + scaledMs(350) + "ms ease";
        const chipRect = document.createElementNS(svgNS, "rect");
        chipRect.setAttribute("x", 30);
        chipRect.setAttribute("y", 400);
        chipRect.setAttribute("width", 145);
        chipRect.setAttribute("height", 24);
        chipRect.setAttribute("rx", 12);
        chipRect.setAttribute("fill", "#fff1e4");
        chipRect.setAttribute("stroke", "#f47721");
        chip.appendChild(chipRect);
        const chipText = document.createElementNS(svgNS, "text");
        chipText.setAttribute("x", 40);
        chipText.setAttribute("y", 416);
        chipText.setAttribute("style", "font-size:9px;fill:#b4530c;");
        chipText.textContent = "\"" + QUERY_TEXT.slice(0, 26) + "...\"";
        chip.appendChild(chipText);
        queryLayer.appendChild(chip);
        requestAnimationFrame(() => chip.classList.add("shown"));

        await sleep(700);
        setCaption("The query is passed through the same encoder model as the documents.");

        arrow1.classList.add("flowing");
        const queryTravelDot = makeTravelDot(170, 412, "#f47721");
        travelLayer.appendChild(queryTravelDot);

        await tween(
            queryTravelDot,
            { cx: 170, cy: 412 },
            { cx: 420, cy: 230 },
            scaledMs(400)
        );

        arrow1.classList.remove("flowing");
        chip.classList.remove("shown");
        await pulseEncoder();
        arrow2.classList.add("flowing");

        await tween(
            queryTravelDot,
            { cx: 420, cy: 230 },
            { cx: QUERY_TARGET.tx, cy: QUERY_TARGET.ty },
            scaledMs(400)
        );

        arrow2.classList.remove("flowing");
        queryTravelDot.remove();

        const queryDot = document.createElementNS(svgNS, "circle");
        queryDot.setAttribute("cx", QUERY_TARGET.tx);
        queryDot.setAttribute("cy", QUERY_TARGET.ty);
        queryDot.setAttribute("r", 9);
        queryDot.setAttribute("fill", "#f47721");
        queryDot.setAttribute("class", "queryDot");
        queryDot.style.transition =
            "transform " + scaledMs(500) + "ms cubic-bezier(.34,1.56,.64,1), " +
            "opacity " + scaledMs(300) + "ms ease";
        queryLayer.appendChild(queryDot);
        requestAnimationFrame(() => queryDot.classList.add("shown"));

        await sleep(500);

        setStep(4);
        setCaption("Step 5 of 6 — The query's position is compared with every document using cosine similarity.");

        DOCS.forEach((doc, i) => {
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", QUERY_TARGET.tx);
            line.setAttribute("y1", QUERY_TARGET.ty);
            line.setAttribute("x2", doc.tx);
            line.setAttribute("y2", doc.ty);
            line.setAttribute("class", "simLine");
            line.setAttribute("id", "line-" + i);
            line.style.transition =
                "opacity " + scaledMs(500) + "ms ease, " +
                "stroke " + scaledMs(400) + "ms ease, " +
                "stroke-width " + scaledMs(400) + "ms ease";
            linesLayer.appendChild(line);
            requestAnimationFrame(() => line.classList.add("shown"));
        });

        await sleep(1100);

        setCaption("Ranking by similarity — the closest points are the most relevant documents.");

        DOCS.forEach((doc, i) => {
            const line = document.getElementById("line-" + i);
            if (TOP_K.includes(i)) {
                line.classList.add("hot");
            } else {
                line.classList.add("cold");
            }
        });

        await sleep(500);

        TOP_K.forEach((docIndex, rank) => {
            const doc = DOCS[docIndex];
            const badge = document.createElementNS(svgNS, "g");
            badge.setAttribute("class", "rankBadge");
            badge.style.transition =
                "transform " + scaledMs(420) + "ms cubic-bezier(.34,1.56,.64,1), " +
                "opacity " + scaledMs(300) + "ms ease";
            const circle = document.createElementNS(svgNS, "circle");
            circle.setAttribute("cx", doc.tx + 14);
            circle.setAttribute("cy", doc.ty - 14);
            circle.setAttribute("r", 10);
            badge.appendChild(circle);
            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", doc.tx + 14);
            text.setAttribute("y", doc.ty - 10);
            text.textContent = String(rank + 1);
            badge.appendChild(text);
            rankLayer.appendChild(badge);
            requestAnimationFrame(() => badge.classList.add("shown"));
        });

        await sleep(700);
        setCaption("Ranked results are returned to the user, best match first.");
        setStep(5);

        TOP_K.forEach((docIndex, rank) => {
            const doc = DOCS[docIndex];
            const score = MOCK_SCORES[docIndex];

            const row = document.createElement("div");
            row.className = "resultRow";
            row.style.transition =
                "opacity " + scaledMs(400) + "ms ease, transform " + scaledMs(400) + "ms ease";

            const rankEl = document.createElement("div");
            rankEl.className = "resultRank";
            rankEl.textContent = "#" + (rank + 1);

            const titleEl = document.createElement("div");
            titleEl.className = "resultTitle";
            titleEl.textContent = doc.title;

            const trackEl = document.createElement("div");
            trackEl.className = "resultBarTrack";
            const fillEl = document.createElement("div");
            fillEl.className = "resultBarFill";
            fillEl.style.transition = "width " + scaledMs(700) + "ms ease";
            trackEl.appendChild(fillEl);

            const scoreEl = document.createElement("div");
            scoreEl.className = "resultScore";
            scoreEl.textContent = score.toFixed(2);

            row.appendChild(rankEl);
            row.appendChild(titleEl);
            row.appendChild(trackEl);
            row.appendChild(scoreEl);
            resultList.appendChild(row);

            requestAnimationFrame(() => {
                row.classList.add("shown");
                setTimeout(() => { fillEl.style.width = (score * 100) + "%"; }, 120);
            });
        });
    }

    document.getElementById("playBtn").addEventListener("click", () => { playAnimation(); });
    document.getElementById("replayBtn").addEventListener("click", () => { reset(); });

    reset();
})();
</script>
"""

def render_concept_animation():
    render_html('<div class="content-subheading">How Semantic Search Works — Animated Overview</div>')
    st.caption(
        "This walkthrough uses made-up documents and positions purely to illustrate the "
        "idea. The real dataset and your own queries are used further down, in "
        "\"Try It on the Real Dataset\"."
    )
    components.html(CONCEPT_ANIMATION_HTML, height=690, scrolling=False)


# ── Built-in Comprehensive Corpus ─────────────────────────────────────────────
CORPUS = {
    "Artificial Intelligence": [
        ("Introduction to Artificial Intelligence", "Artificial intelligence studies how machines can perform tasks that normally require human intelligence, including reasoning, perception, planning and decision making under uncertainty."),
        ("Search Algorithms in AI", "Uninformed and informed search strategies such as breadth-first search, depth-first search and A star explore a state space to find a path from an initial state to a goal state."),
        ("Knowledge Representation", "Knowledge representation encodes facts about the world in a form a machine can reason over, using logic, semantic networks, frames and ontologies."),
        ("Expert Systems", "An expert system captures human expertise as a rule base and uses an inference engine to draw conclusions, offering explanations for the advice it produces."),
        ("Propositional and Predicate Logic", "Logical inference lets an agent derive new statements from known ones using rules such as modus ponens, resolution and unification over quantified expressions."),
        ("Intelligent Agents", "An intelligent agent perceives its environment through sensors and acts through actuators, selecting actions that maximise a performance measure over time."),
        ("Planning and Scheduling", "Automated planning constructs a sequence of actions that transforms an initial world state into a goal state while respecting preconditions and resource constraints."),
        ("Constraint Satisfaction Problems", "Constraint satisfaction formulates a problem as variables, domains and constraints, solved by backtracking search combined with constraint propagation and heuristics."),
        ("Game Playing and Adversarial Search", "Minimax search with alpha-beta pruning evaluates game trees for two player games, trading search depth against the accuracy of the evaluation function."),
        ("Ethics and Explainability in AI", "Responsible artificial intelligence addresses fairness, accountability, transparency and the ability to explain why an automated system produced a particular decision."),
    ],
    "Machine Learning": [
        ("Introduction to Machine Learning", "Machine learning is a branch of artificial intelligence that allows computers to learn patterns from data and make predictions without being explicitly programmed for each task."),
        ("Supervised Learning Algorithms", "Supervised learning uses labelled training data to learn a mapping from inputs to outputs, covering algorithms such as regression, decision trees and support vector machines."),
        ("Unsupervised Learning and Clustering", "Unsupervised learning discovers structure in unlabelled data, grouping similar observations using techniques such as k-means, hierarchical clustering and density based methods."),
        ("Linear and Logistic Regression", "Linear regression fits a continuous target as a weighted sum of features, while logistic regression models class probability using the sigmoid function and cross entropy loss."),
        ("Decision Trees and Random Forests", "Decision trees split data on feature thresholds to form interpretable rules, and random forests average many randomised trees to reduce variance and improve generalisation."),
        ("Support Vector Machines", "Support vector machines find the hyperplane with the maximum margin between classes and use kernel functions to separate data that is not linearly separable."),
        ("Overfitting and Regularization", "A model that memorises training noise generalises poorly, so regularisation, early stopping and cross validation are used to control model complexity."),
        ("Feature Engineering and Selection", "Feature engineering transforms raw attributes into informative inputs through scaling, encoding and aggregation, while selection removes redundant or irrelevant variables."),
        ("Model Evaluation Metrics", "Accuracy, precision, recall, F1 score and the area under the ROC curve measure different aspects of classifier quality, especially on imbalanced datasets."),
        ("Ensemble Learning Methods", "Ensemble methods such as bagging, boosting and stacking combine several weak learners into a stronger predictor with lower bias or lower variance."),
    ],
    "Deep Learning": [
        ("Introduction to Deep Learning", "Deep learning uses artificial neural networks with multiple layers to learn hierarchical representations and complex patterns directly from large datasets."),
        ("Artificial Neural Networks", "A feedforward neural network passes inputs through weighted connections and nonlinear activation functions to compute an output used for classification or regression."),
        ("Backpropagation and Gradient Descent", "Backpropagation computes the gradient of the loss with respect to every weight using the chain rule, and gradient descent updates the weights to reduce the loss."),
        ("Convolutional Neural Networks", "Convolutional networks apply learned filters across an image to detect local patterns such as edges and textures, using pooling layers to build translation tolerant features."),
        ("Recurrent Neural Networks and LSTM", "Recurrent networks maintain a hidden state across time steps for sequential data, while LSTM and GRU cells use gates to preserve information over long sequences."),
        ("Transformer Architecture", "The transformer replaces recurrence with self attention, letting every token attend to every other token in parallel and scaling efficiently to very large corpora."),
        ("Attention Mechanisms", "Attention computes a weighted combination of value vectors using the similarity between queries and keys, allowing a model to focus on the most relevant parts of its input."),
        ("Transfer Learning and Fine Tuning", "Transfer learning reuses a model pretrained on a large corpus and adapts it to a smaller downstream task by fine tuning some or all of its parameters."),
        ("Regularization in Neural Networks", "Dropout, batch normalisation, weight decay and data augmentation reduce overfitting in deep networks and stabilise the optimisation process."),
        ("Generative Models and Autoencoders", "Autoencoders compress input into a latent code and reconstruct it, while generative adversarial networks and diffusion models learn to synthesise realistic new samples."),
    ],
    "Natural Language Processing": [
        ("Introduction to Natural Language Processing", "Natural language processing enables computers to understand, process and generate human language using computational linguistics and machine learning methods."),
        ("Tokenization and Text Preprocessing", "Preprocessing converts raw text into tokens through sentence splitting, lowercasing, stopword removal, stemming and lemmatisation before any model is applied."),
        ("Part of Speech Tagging", "Part of speech tagging assigns a grammatical category such as noun, verb or adjective to each token, usually with sequence models or neural taggers."),
        ("Named Entity Recognition", "Named entity recognition locates and classifies spans of text that refer to people, organisations, locations, dates and other predefined entity types."),
        ("Word Embeddings", "Word embeddings such as Word2Vec, GloVe and FastText map words to dense vectors so that words used in similar contexts lie close together in the vector space."),
        ("Sentence Embeddings and Sentence-BERT", "Sentence-BERT fine tunes a transformer with a siamese structure so that whole sentences map to vectors whose cosine similarity reflects semantic similarity."),
        ("Language Models", "A language model assigns probabilities to sequences of tokens, evolving from n-gram counts to neural and transformer based models trained on very large corpora."),
        ("Machine Translation", "Neural machine translation encodes a source sentence into a continuous representation and decodes it into a target language, largely replacing phrase based statistical systems."),
        ("Text Classification and Sentiment Analysis", "Text classification assigns documents to categories, and sentiment analysis determines whether the opinion expressed in a text is positive, negative or neutral."),
        ("Question Answering Systems", "Question answering systems retrieve or generate an answer to a natural language question, either by extracting a span from a passage or by generating free text."),
    ],
    "Information Retrieval": [
        ("Introduction to Information Retrieval", "Information retrieval is the process of finding relevant information from a large collection of documents in response to a user's stated information need."),
        ("Inverted Index Construction", "An inverted index maps every term to a posting list of documents that contain it, enabling fast lookup and intersection during query processing."),
        ("Boolean Retrieval Model", "The boolean model treats a query as a logical expression over terms and returns the set of documents that exactly satisfy the expression, without ranking."),
        ("Vector Space Model and TF-IDF", "The vector space model represents documents as weighted term vectors, where TF-IDF raises the weight of terms that are frequent locally but rare across the collection."),
        ("BM25 Ranking Function", "BM25 is a probabilistic ranking function that scores documents using term frequency saturation and document length normalisation, and remains a strong lexical baseline."),
        ("Dense Retrieval and Semantic Search", "Dense retrieval encodes queries and documents as embeddings and ranks by vector similarity, retrieving relevant results even when no query term appears in the document."),
        ("Cosine Similarity in Retrieval", "Cosine similarity measures the angle between two vectors, giving a score near one for texts with similar meaning and near zero for unrelated texts."),
        ("Evaluation of Retrieval Systems", "Retrieval quality is measured with precision, recall, mean average precision and normalised discounted cumulative gain computed against human relevance judgements."),
        ("Query Expansion and Relevance Feedback", "Query expansion adds related terms from a thesaurus, an embedding space or the top ranked results in order to reduce vocabulary mismatch."),
        ("Hybrid and Re-ranking Pipelines", "Hybrid search merges lexical and dense candidate lists, then applies a cross encoder re-ranker to the shortlist to improve the quality of the final ordering."),
    ],
    "Computer Networks": [
        ("Introduction to Computer Networks", "Computer networks allow multiple devices to communicate and share resources using agreed communication protocols such as the TCP/IP protocol suite."),
        ("OSI Reference Model", "The OSI model organises communication into seven layers, from physical transmission up to the application layer, each offering services to the layer above."),
        ("TCP and UDP Transport Protocols", "TCP provides reliable, ordered, connection oriented delivery with flow and congestion control, while UDP offers lightweight connectionless datagram service."),
        ("IP Addressing and Subnetting", "IP addressing identifies hosts on a network, and subnetting divides an address block into smaller networks using a mask to separate network and host portions."),
        ("Routing Algorithms", "Routing protocols use distance vector or link state algorithms to compute forwarding paths, with OSPF operating inside an autonomous system and BGP between them."),
        ("Network Security Protocols", "TLS, IPSec and SSH protect data in transit using encryption, message authentication codes and certificate based authentication of the communicating endpoints."),
        ("Wireless and Mobile Networks", "Wireless networks transmit over a shared radio medium and must handle interference, attenuation, mobility and handover between access points or base stations."),
        ("Domain Name System", "The domain name system resolves human readable names into IP addresses through a hierarchy of authoritative and caching resolvers distributed worldwide."),
        ("Congestion Control and Quality of Service", "Congestion control adjusts sending rate in response to loss or delay signals, while quality of service mechanisms prioritise traffic that is sensitive to latency."),
        ("Software Defined Networking", "Software defined networking separates the control plane from the data plane, allowing a central controller to program forwarding behaviour through open interfaces."),
    ],
    "Operating Systems": [
        ("Introduction to Operating Systems", "An operating system manages computer hardware and software resources and provides common services and abstractions to application programs."),
        ("Process Management and Scheduling", "The scheduler decides which ready process runs next using policies such as round robin, shortest job first and multilevel feedback queues."),
        ("Threads and Concurrency", "Threads share an address space within a process, enabling parallelism but requiring synchronisation to avoid race conditions on shared data."),
        ("Deadlock Detection and Prevention", "Deadlock occurs when processes hold resources and wait circularly, and is handled by prevention, avoidance with the banker's algorithm, or detection and recovery."),
        ("Memory Management and Paging", "Paging divides memory into fixed size frames and maps virtual pages onto them, using a page table and translation lookaside buffer for fast address translation."),
        ("Virtual Memory and Page Replacement", "Virtual memory lets a process use more address space than physical memory, with replacement policies such as LRU and clock deciding which page to evict on a fault."),
        ("File Systems and Directory Structures", "A file system organises data into files and directories and tracks allocation with inodes, extents or allocation tables while enforcing access permissions."),
        ("Input Output and Device Management", "The operating system mediates access to devices through drivers, interrupts and buffering, hiding hardware differences behind a uniform interface."),
        ("Synchronization Primitives", "Semaphores, mutexes, condition variables and monitors coordinate concurrent threads and protect critical sections from simultaneous access."),
        ("Virtualization and Containers", "Hypervisors run multiple virtual machines on one host, while containers share the host kernel and isolate processes using namespaces and control groups."),
    ],
    "Database Management": [
        ("Introduction to Database Management Systems", "A database management system is software used to store, organise, retrieve and manage structured data efficiently while enforcing integrity and access control."),
        ("Relational Data Model", "The relational model represents data as tables of tuples, with keys expressing identity and relationships and relational algebra defining the query operations."),
        ("Structured Query Language", "SQL is a declarative language for defining, querying and modifying relational data, combining selection, projection, joins, grouping and aggregation."),
        ("Normalization and Database Design", "Normalisation decomposes relations to remove redundancy and update anomalies, progressing through first, second, third and Boyce-Codd normal forms."),
        ("Indexing and Query Optimization", "Indexes such as B-trees and hash indexes speed up lookups, and the query optimiser chooses an execution plan using cost estimates and table statistics."),
        ("Transactions and ACID Properties", "A transaction is an atomic unit of work that preserves consistency, runs in isolation from concurrent transactions and durably records its effects."),
        ("Concurrency Control", "Locking protocols, timestamp ordering and multiversion concurrency control allow transactions to run in parallel while preserving serialisable behaviour."),
        ("NoSQL Databases", "NoSQL systems store key-value pairs, documents, wide columns or graphs, trading strict schemas and joins for horizontal scalability and flexible data models."),
        ("Vector Databases", "Vector databases store numerical embeddings and support approximate nearest neighbour search for recommendation systems, semantic search and retrieval augmented generation."),
        ("Data Warehousing and OLAP", "A data warehouse integrates historical data into star or snowflake schemas so that analytical queries can aggregate across many dimensions efficiently."),
    ],
    "Cloud Computing": [
        ("Introduction to Cloud Computing", "Cloud computing provides on-demand access to computing resources such as servers, storage, databases and networking over the internet with pay per use billing."),
        ("Service Models IaaS PaaS SaaS", "Infrastructure, platform and software as a service differ in how much of the stack the provider manages and how much control remains with the customer."),
        ("Deployment Models", "Public, private, hybrid and community clouds differ in ownership and tenancy, balancing cost and elasticity against control and regulatory requirements."),
        ("Virtual Machines and Hypervisors", "Cloud providers allocate virtual machines through hypervisors that partition physical servers and isolate tenants from one another."),
        ("Containers and Orchestration", "Container orchestration platforms such as Kubernetes schedule containers across a cluster and handle scaling, service discovery and rolling updates."),
        ("Serverless Computing", "Serverless platforms run functions in response to events and bill only for execution time, removing the need to provision or manage servers explicitly."),
        ("Cloud Storage Systems", "Object, block and file storage services offer durable, replicated storage with different consistency guarantees and access patterns."),
        ("Load Balancing and Auto Scaling", "Load balancers distribute requests across healthy instances, while auto scaling adds or removes capacity according to demand or scheduled policies."),
        ("Cloud Security and Identity Management", "Cloud security relies on the shared responsibility model, identity and access management policies, encryption at rest and in transit, and continuous auditing."),
        ("Edge and Fog Computing", "Edge computing moves processing close to where data is produced to reduce latency and bandwidth use, complementing centralised cloud data centres."),
    ],
    "Cybersecurity": [
        ("Introduction to Cyber Security", "Cyber security protects computer systems, networks and data from unauthorised access, attacks and threats to confidentiality, integrity and availability."),
        ("Symmetric and Asymmetric Cryptography", "Symmetric ciphers use one shared key for encryption and decryption, while public key cryptography uses a key pair to enable secure exchange and digital signatures."),
        ("Hash Functions and Digital Signatures", "Cryptographic hash functions produce a fixed length digest that is hard to invert, and digital signatures bind a message to the identity of its signer."),
        ("Authentication and Access Control", "Authentication verifies identity through passwords, tokens or biometrics, while access control models decide which subjects may act on which objects."),
        ("Network Attacks and Defences", "Firewalls, intrusion detection systems and segmentation defend against scanning, spoofing, denial of service and lateral movement inside a network."),
        ("Malware Analysis", "Malware analysis studies viruses, worms, trojans and ransomware through static inspection and dynamic execution in a sandbox to derive detection signatures."),
        ("Web Application Security", "Injection, cross site scripting, broken authentication and insecure deserialisation are common web vulnerabilities mitigated by validation and secure defaults."),
        ("Public Key Infrastructure", "A public key infrastructure issues, distributes and revokes certificates through certificate authorities so that parties can trust one another's public keys."),
        ("Security Auditing and Penetration Testing", "Penetration testing simulates an attacker to find exploitable weaknesses, while auditing verifies that controls match policy and regulatory requirements."),
        ("Privacy and Data Protection", "Data protection combines anonymisation, minimisation, encryption and consent management to limit exposure of personal information."),
    ],
    "Data Science": [
        ("Introduction to Data Science", "Data science combines statistics, programming and machine learning to extract useful insights from structured and unstructured data."),
        ("Exploratory Data Analysis", "Exploratory analysis summarises distributions, correlations and outliers using descriptive statistics and visualisation before any model is fitted."),
        ("Data Cleaning and Preprocessing", "Cleaning handles missing values, duplicates, inconsistent units and encoding errors so that downstream analysis is not distorted by data quality problems."),
        ("Statistical Inference and Hypothesis Testing", "Hypothesis testing quantifies whether an observed effect is likely to arise by chance, reporting p-values, confidence intervals and effect sizes."),
        ("Data Visualization", "Effective visualisation chooses encodings that match the data type and the question, revealing trends, comparisons and distributions without distorting scale."),
        ("Dimensionality Reduction", "Principal component analysis, t-SNE and UMAP project high dimensional data into fewer dimensions for visualisation, denoising or faster computation."),
        ("Time Series Analysis", "Time series methods model trend, seasonality and autocorrelation with techniques such as ARIMA, exponential smoothing and sequence neural networks."),
        ("Big Data Processing Frameworks", "Distributed frameworks such as Hadoop and Spark partition data across a cluster and execute parallel transformations over the partitions."),
        ("Recommendation Systems", "Recommenders combine collaborative filtering, content based similarity and embeddings to suggest items a user is likely to find relevant."),
        ("Experimentation and A/B Testing", "A/B testing randomly assigns users to variants and compares a target metric, requiring sufficient sample size and careful handling of multiple comparisons."),
    ],
    "Blockchain": [
        ("Introduction to Blockchain Technology", "A blockchain is an append only ledger replicated across many nodes, where blocks of transactions are linked by cryptographic hashes to make tampering detectable."),
        ("Distributed Ledger and Consensus", "Consensus protocols such as proof of work, proof of stake and practical byzantine fault tolerance let mutually distrusting nodes agree on a single ledger state."),
        ("Smart Contracts", "Smart contracts are programs stored on a blockchain that execute automatically when conditions are met, with their results recorded on the shared ledger."),
        ("Cryptographic Hashing in Blockchain", "Each block stores the hash of its predecessor and a Merkle root of its transactions, so any modification invalidates every subsequent block."),
        ("Public and Private Blockchains", "Public chains allow anyone to join and validate, while permissioned chains restrict participation to known members and favour throughput over open access."),
        ("Cryptocurrency and Digital Wallets", "A wallet stores private keys that authorise transfers, and the network verifies signatures before including a transaction in a block."),
        ("Blockchain Scalability Solutions", "Sharding, payment channels and rollups increase throughput by moving work off the main chain while still anchoring final state to it."),
        ("Blockchain in Supply Chain", "Recording custody events on a shared ledger gives supply chain participants a tamper evident audit trail of provenance and handling."),
        ("Security Issues in Blockchain", "Majority attacks, smart contract bugs, key theft and front running are the main practical risks in blockchain deployments."),
        ("Decentralized Applications", "Decentralised applications combine smart contracts on chain with off chain interfaces and storage to deliver services without a central operator."),
    ],
    "Distributed Systems": [
        ("Introduction to Distributed Systems", "A distributed system is a collection of independent computers that appears to its users as a single coherent system despite partial failures and network delays."),
        ("Distributed Consensus Algorithms", "Paxos and Raft allow a replicated set of servers to agree on a log of operations even when some members crash or messages are delayed."),
        ("CAP Theorem and Consistency Models", "The CAP theorem states that a partitioned system must choose between consistency and availability, motivating eventual and causal consistency models."),
        ("Replication and Fault Tolerance", "Replication stores copies of data on several nodes so that service continues after failures, at the cost of keeping replicas synchronised."),
        ("Remote Procedure Calls and Messaging", "Remote procedure calls make a network request look like a local call, while message queues decouple producers from consumers and absorb load spikes."),
        ("Distributed File Systems", "Distributed file systems split files into chunks replicated across servers, with a metadata service tracking placement and handling recovery."),
        ("Clock Synchronization and Logical Time", "Physical clocks drift, so distributed systems use logical clocks and vector timestamps to order events consistently across nodes."),
        ("MapReduce Programming Model", "MapReduce expresses a computation as map and reduce functions that the framework runs in parallel over partitioned data with automatic fault recovery."),
        ("Microservices Architecture", "Microservices split an application into independently deployable services that communicate over the network, improving autonomy but adding operational complexity."),
        ("Load Balancing in Distributed Systems", "Load balancers spread requests across replicas using round robin, least connections or consistent hashing to avoid hotspots and keep latency stable."),
    ],
    "Computer Architecture": [
        ("Introduction to Computer Architecture", "Computer architecture describes the organisation of processors, memory and interconnects, and the instruction set interface exposed to software."),
        ("Instruction Set Architecture", "An instruction set defines the operations, registers and addressing modes a processor supports, with RISC and CISC representing different design philosophies."),
        ("Pipelining and Hazards", "Pipelining overlaps instruction stages to raise throughput, while data, control and structural hazards are resolved with forwarding, stalls and branch prediction."),
        ("Cache Memory and Hierarchy", "Caches exploit temporal and spatial locality, and the memory hierarchy trades capacity against latency from registers through caches to main memory and storage."),
        ("Memory Organization", "Main memory is organised into banks and channels, and interleaving together with burst transfers improves the effective bandwidth seen by the processor."),
        ("Parallel Processing and Multicore", "Multicore processors run several threads simultaneously, requiring cache coherence protocols and careful synchronisation to scale performance."),
        ("GPU Architecture", "Graphics processors devote most of their area to many simple cores executing the same instruction over different data, which suits dense linear algebra workloads."),
        ("Instruction Level Parallelism", "Superscalar issue, out of order execution and speculation extract parallelism from a single instruction stream without changing the programming model."),
        ("Input Output Organization", "Processors communicate with peripherals through memory mapped registers, interrupts and direct memory access to avoid busy waiting."),
        ("Performance Measurement and Benchmarking", "Performance is evaluated with clock rate, cycles per instruction and benchmark suites, while Amdahl's law bounds the speedup achievable from partial optimisation."),
    ],
    "Software Engineering": [
        ("Introduction to Software Engineering", "Software engineering applies systematic and measurable approaches to the development, operation and maintenance of software systems."),
        ("Software Development Life Cycle", "The development life cycle moves through requirements, design, implementation, testing, deployment and maintenance, in a waterfall or iterative arrangement."),
        ("Agile Methodologies", "Agile methods such as Scrum and Kanban deliver working software in short iterations, adapting scope through continuous feedback from stakeholders."),
        ("Requirements Engineering", "Requirements engineering elicits, analyses, specifies and validates what a system must do, distinguishing functional from quality requirements."),
        ("Software Design Patterns", "Design patterns describe reusable solutions to recurring design problems, including creational, structural and behavioural families such as factory, adapter and observer."),
        ("Software Testing Techniques", "Unit, integration, system and acceptance testing use black box and white box techniques to expose defects before software reaches production."),
        ("Version Control and Collaboration", "Distributed version control tracks changes as commits on branches, letting teams work in parallel and merge their work with a reviewable history."),
        ("Continuous Integration and Deployment", "Continuous integration builds and tests every change automatically, and continuous deployment pipelines release validated builds with minimal manual effort."),
        ("Software Quality Assurance", "Quality assurance combines reviews, static analysis, coverage measurement and defect tracking to keep quality visible throughout development."),
        ("Software Maintenance and Refactoring", "Maintenance covers corrective, adaptive and perfective changes, while refactoring restructures code without altering behaviour to reduce technical debt."),
    ],
}

SOURCE_TYPES = [
    "Lecture Notes",
    "Reference Textbook",
    "Survey Paper",
    "Technical Manual",
    "Course Handout",
]

REQUIRED_COLUMNS = ["id", "title", "category", "content"]


def build_default_documents():
    """Expand CORPUS into a full DataFrame with ids, source and word count."""
    rows = []
    counter = 1

    for category, entries in CORPUS.items():
        for position, (title, content) in enumerate(entries):
            rows.append(
                {
                    "id": f"DOC{counter:03d}",
                    "title": title,
                    "category": category,
                    "content": content,
                    "source": SOURCE_TYPES[position % len(SOURCE_TYPES)],
                    "word_count": len(content.split()),
                }
            )
            counter += 1

    return pd.DataFrame(rows)


def normalize_documents(df, id_prefix="DOC"):
    """Make any incoming frame conform to the expected schema."""
    df = df.copy()
    df.columns = [str(c).strip().lower() for c in df.columns]

    rename_map = {
        "document id": "id",
        "doc_id": "id",
        "docid": "id",
        "text": "content",
        "body": "content",
        "document": "content",
        "topic": "category",
        "label": "category",
        "name": "title",
    }

    df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})

    if "content" not in df.columns:
        raise ValueError("The dataset must contain a 'content' column.")

    if "title" not in df.columns:
        df["title"] = df["content"].astype(str).str.slice(0, 60) + "..."

    if "category" not in df.columns:
        df["category"] = "Uncategorized"

    if "source" not in df.columns:
        df["source"] = "User Upload"

    df["content"] = df["content"].astype(str).str.strip()
    df = df[df["content"].str.len() > 0]

    if "id" not in df.columns:
        df["id"] = [f"{id_prefix}{i:03d}" for i in range(1, len(df) + 1)]

    df["word_count"] = df["content"].astype(str).str.split().str.len()

    return df[
        ["id", "title", "category", "content", "source", "word_count"]
    ].reset_index(drop=True)


@st.cache_data
def load_base_documents():
    """Prefer data/documents.csv; fall back to the built-in corpus."""
    if DATA_FILE.exists():
        try:
            return normalize_documents(pd.read_csv(DATA_FILE)), "data/documents.csv"
        except Exception:
            pass

    return build_default_documents(), "Built-in corpus"


def parse_uploaded_file(uploaded_file):
    """Turn an uploaded csv / json / txt file into a normalised frame."""
    name = uploaded_file.name.lower()
    raw = uploaded_file.getvalue()

    if name.endswith(".csv"):
        frame = pd.read_csv(io.BytesIO(raw))

    elif name.endswith(".json"):
        payload = json.loads(raw.decode("utf-8", "replace"))
        if isinstance(payload, dict):
            for key in ("documents", "data", "records"):
                if key in payload:
                    payload = payload[key]
                    break
        frame = pd.DataFrame(payload)

    elif name.endswith(".txt"):
        text = raw.decode("utf-8", "replace")
        blocks = [b.strip() for b in text.split("\n\n") if b.strip()]
        if not blocks:
            blocks = [line.strip() for line in text.splitlines() if line.strip()]

        frame = pd.DataFrame(
            {
                "title": [b.split("\n")[0][:70] for b in blocks],
                "category": ["Uploaded Text"] * len(blocks),
                "content": [" ".join(b.split()) for b in blocks],
            }
        )

    else:
        raise ValueError("Only CSV, JSON and TXT files are supported.")

    return normalize_documents(frame, id_prefix="UPL")


def get_active_documents():
    """Default collection plus anything the user has uploaded."""
    base_df, _ = load_base_documents()
    uploaded = st.session_state.get("uploaded_documents")
    if uploaded is not None and len(uploaded) > 0:
        return pd.concat([base_df, uploaded], ignore_index=True)
    return base_df


def dataset_signature(df):
    """Cheap fingerprint used to detect that the index is out of date."""
    return f"{len(df)}:{hash(tuple(df['id'].tolist()))}"


@st.cache_resource
def load_embedding_model():
    return SentenceTransformer(MODEL_NAME)


def pca_projection(embeddings, components=2):
    """Small numpy PCA used only to visualise the embedding space."""
    centered = embeddings - embeddings.mean(axis=0, keepdims=True)
    _, _, vt = np.linalg.svd(centered, full_matrices=False)
    return centered @ vt[:components].T


def store_index(embeddings, documents_df, elapsed):
    st.session_state.document_embeddings = embeddings
    st.session_state.indexed_documents = documents_df.reset_index(drop=True)
    st.session_state.index_signature = dataset_signature(documents_df)
    st.session_state.index_build_time = elapsed
    st.session_state.index_built = True
    # Synchronize for report compatibility
    st.session_state["last_docs"] = documents_df.to_dict("records")
    st.session_state["last_doc_embs"] = embeddings
    st.session_state["last_is_builtin"] = (st.session_state.get("uploaded_documents") is None)


def index_is_current(documents_df):
    return (
        st.session_state.get("index_built", False)
        and st.session_state.get("document_embeddings") is not None
        and st.session_state.get("index_signature") == dataset_signature(documents_df)
    )


def compute_similarities(query, documents_df, embeddings):
    model = load_embedding_model()
    query_embedding = model.encode(
        [query], convert_to_numpy=True, normalize_embeddings=True
    )
    scores = cosine_similarity(query_embedding, embeddings)[0]
    return query_embedding[0], scores


def assemble_results(scores, documents_df, top_k, threshold):
    order = np.argsort(scores)[::-1]
    results = []

    for index in order:
        score = float(scores[index])
        if score < threshold:
            continue

        row = documents_df.iloc[index]
        results.append(
            {
                "Rank": len(results) + 1,
                "rank": len(results) + 1,
                "Document ID": row["id"],
                "id": row["id"],
                "Title": row["title"],
                "title": row["title"],
                "Category": row["category"],
                "Source": row.get("source", "-"),
                "Word Count": int(row.get("word_count", 0)),
                "Content": row["content"],
                "text": row["content"],
                "Similarity": score,
                "score": score,
            }
        )

        if len(results) >= top_k:
            break

    return results


def record_trial():
    results = st.session_state.get("last_results", [])
    if not results:
        return

    best = results[0]
    trial_entry = {
        "Trial": len(st.session_state.trials) + 1,
        "Timestamp": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
        "Query": st.session_state.get("last_query", ""),
        "Top-K": len(results),
        "Threshold": st.session_state.get("last_threshold", 0.25),
        "Documents Compared": st.session_state.get("last_documents_compared", 0),
        "Best Document": best.get("Title", best.get("title", "")),
        "Best Similarity": round(best.get("Similarity", best.get("score", 0.0)), 4),
        "Query Time (sec)": round(st.session_state.get("last_query_time", 0.0), 4),
    }
    st.session_state.trials.append(trial_entry)
    log_activity(f"Recorded trial #{trial_entry['Trial']}: '{trial_entry['Query'][:30]}' (Best score: {trial_entry['Best Similarity']})")


def pipeline_markup(stages, active=None):
    """Pipeline where stages before 'active' are done and the rest are pending."""
    parts = []
    for position, stage in enumerate(stages):
        if active is None:
            state = ""
        elif position < active:
            state = " stage-done"
        elif position == active:
            state = " stage-active"
        else:
            state = " stage-todo"

        if position:
            parts.append('<span class="pipeline-arrow">&rarr;</span>')

        parts.append(
            f'<span class="pipeline-stage{state}">{escape_html(stage)}</span>'
        )

    return '<div class="pipeline">' + "".join(parts) + "</div>"


def render_pipeline(stages, active=None):
    render_html(pipeline_markup(stages, active))


def log_markup(lines):
    body = "<br>".join(lines)
    return f'<div class="live-log">{body}</div>'


INDEX_STAGES = [
    "Documents",
    "Preprocessing",
    "SentenceTransformer",
    "Dense Embeddings",
    "Embedding Index",
]

QUERY_STAGES = [
    "User Query",
    "Preprocessing",
    "Query Embedding",
    "Cosine Similarity",
    "Ranking",
    "Top-K Results",
]


# ── Simulation UI Panels ──────────────────────────────────────────────────────

def render_dataset_panel(documents_df, source_label):
    render_html('<div class="content-subheading">1. Document Collection</div>')

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Documents", len(documents_df))
    col2.metric("Categories", documents_df["category"].nunique())
    col3.metric("Average Words", int(documents_df["word_count"].mean()))
    col4.metric("Sources", documents_df["source"].nunique())

    st.caption(f"Dataset loaded from: {source_label}")

    with st.expander("Browse the document collection", expanded=False):
        categories = ["All categories"] + sorted(documents_df["category"].unique().tolist())
        selected = st.selectbox("Filter by category", categories, key="dataset_category_filter")
        keyword = st.text_input("Filter by keyword in title or content", key="dataset_keyword_filter")

        view = documents_df
        if selected != "All categories":
            view = view[view["category"] == selected]

        if keyword.strip():
            mask = view["title"].str.contains(keyword, case=False, na=False) | view[
                "content"
            ].str.contains(keyword, case=False, na=False)
            view = view[mask]

        st.caption(f"Showing {len(view)} of {len(documents_df)} documents.")
        st.dataframe(view, use_container_width=True, hide_index=True, height=340)

        st.download_button(
            "Download Document Collection (CSV)",
            data=documents_df.to_csv(index=False),
            file_name="document_collection.csv",
            mime="text/csv",
        )

    with st.expander("Add your own documents", expanded=False):
        st.write(
            "Upload a CSV (columns: id, title, category, content), a JSON array of "
            "objects, or a TXT file where each blank-line-separated block is one "
            "document. Uploaded documents are appended to the default collection."
        )

        uploaded_file = st.file_uploader(
            "Upload a document dataset",
            type=["csv", "txt", "json"],
            key="dataset_uploader",
        )

        upload_col, clear_col = st.columns(2)

        with upload_col:
            if st.button("Add Uploaded Documents", use_container_width=True):
                if uploaded_file is None:
                    st.warning("Please choose a file first.")
                else:
                    try:
                        parsed = parse_uploaded_file(uploaded_file)
                        st.session_state.uploaded_documents = parsed
                        st.session_state.index_built = False
                        st.session_state.upload_message = (
                            f"Added {len(parsed)} documents from {uploaded_file.name}. "
                            "Rebuild the embedding index to search them."
                        )
                        log_activity(f"Uploaded custom dataset: {uploaded_file.name} ({len(parsed)} documents)")
                    except Exception as error:
                        st.session_state.upload_message = ""
                        st.error(f"Could not read the file: {error}")

        with clear_col:
            if st.button("Remove Uploaded Documents", use_container_width=True):
                st.session_state.uploaded_documents = None
                st.session_state.index_built = False
                st.session_state.upload_message = "Uploaded documents removed."
                log_activity("Removed uploaded documents; restored base corpus.")

        if st.session_state.upload_message:
            st.info(st.session_state.upload_message)


def run_live_indexing(documents_df, show_progress, pace=0.25, batch_size=16):
    pipeline_placeholder = st.empty()
    caption_placeholder = st.empty()
    progress_placeholder = st.empty()

    def stage(active):
        if show_progress:
            pipeline_placeholder.markdown(
                pipeline_markup(INDEX_STAGES, active), unsafe_allow_html=True
            )

    start = time.perf_counter()

    stage(0)
    if show_progress:
        caption_placeholder.caption(f"Reading {len(documents_df)} documents ...")
        time.sleep(pace)

    stage(1)
    texts = documents_df["content"].astype(str).tolist()
    if show_progress:
        caption_placeholder.caption("Preprocessing text (tokenizing, cleaning) ...")
        time.sleep(pace)

    stage(2)
    if show_progress:
        caption_placeholder.caption(f"Loading the {MODEL_NAME} model ...")

    model = load_embedding_model()

    stage(3)
    progress = progress_placeholder.progress(0.0) if show_progress else None

    chunks = []
    encoded = 0

    for start_index in range(0, len(texts), batch_size):
        batch = texts[start_index:start_index + batch_size]
        vectors = model.encode(
            batch,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        chunks.append(vectors)
        encoded += len(batch)

        if show_progress:
            progress.progress(encoded / len(texts))
            caption_placeholder.caption(
                f"Encoding documents into vectors ... {encoded}/{len(texts)}"
            )

    embeddings = np.vstack(chunks)

    stage(4)
    elapsed = time.perf_counter() - start

    if show_progress:
        caption_placeholder.caption(
            f"Embedding index built: {embeddings.shape[0]} vectors x "
            f"{embeddings.shape[1]} dimensions in {elapsed:.2f} s."
        )
        progress_placeholder.empty()

    store_index(embeddings, documents_df, elapsed)
    log_activity(f"Built embedding index: {embeddings.shape[0]} documents ({embeddings.shape[1]}-D) in {elapsed:.2f}s")

    return embeddings


def render_embedding_map_animated(embeddings, documents_df):
    points = pca_projection(embeddings)

    frame_df = pd.DataFrame(
        {
            "x": points[:, 0],
            "y": points[:, 1],
            "Title": documents_df["title"],
            "Category": documents_df["category"],
        }
    )

    categories = list(dict.fromkeys(frame_df["Category"].tolist()))
    palette = px.colors.qualitative.Set2
    color_map = {cat: palette[i % len(palette)] for i, cat in enumerate(categories)}

    x_pad = (frame_df["x"].max() - frame_df["x"].min()) * 0.1 + 0.01
    y_pad = (frame_df["y"].max() - frame_df["y"].min()) * 0.1 + 0.01
    x_range = [frame_df["x"].min() - x_pad, frame_df["x"].max() + x_pad]
    y_range = [frame_df["y"].min() - y_pad, frame_df["y"].max() + y_pad]

    frames = []
    shown_categories = []

    for category in categories:
        shown_categories.append(category)
        visible = frame_df[frame_df["Category"].isin(shown_categories)]

        frame_traces = [
            go.Scatter(
                x=visible.loc[visible["Category"] == cat, "x"],
                y=visible.loc[visible["Category"] == cat, "y"],
                mode="markers",
                name=cat,
                marker={"size": 10, "color": color_map[cat], "opacity": 0.85},
                text=visible.loc[visible["Category"] == cat, "Title"],
                hoverinfo="text",
            )
            for cat in categories
        ]

        frames.append(go.Frame(data=frame_traces, name=category))

    initial_traces = [
        go.Scatter(x=[], y=[], mode="markers", name=cat, marker={"color": color_map[cat]})
        for cat in categories
    ]

    figure = go.Figure(
        data=initial_traces,
        frames=frames,
        layout=go.Layout(
            title="Embedding space (documents appear category by category)",
            xaxis={"title": "Component 1", "range": x_range},
            yaxis={"title": "Component 2", "range": y_range},
            height=470,
            updatemenus=[
                {
                    "type": "buttons",
                    "x": 0,
                    "y": 1.12,
                    "buttons": [
                        {
                            "label": "&#9654; Play",
                            "method": "animate",
                            "args": [
                                None,
                                {
                                    "frame": {"duration": 650, "redraw": True},
                                    "transition": {"duration": 200},
                                    "fromcurrent": False,
                                },
                            ],
                        }
                    ],
                }
            ],
        ),
    )

    st.plotly_chart(figure, use_container_width=True)
    st.caption(
        "Press Play to watch each category's documents land in the space. "
        "Documents about similar topics cluster together -- that closeness is "
        "exactly what cosine similarity measures at query time."
    )


def render_indexing_panel(documents_df, show_progress, pace=0.25):
    render_html('<div class="stage-label">STAGE A</div>')
    render_html('<div class="content-subheading">2. Build the Embedding Index</div>')

    if not index_is_current(documents_df):
        render_html(
            """
            <div class="info-box">
                The embedding index is not up to date with the current document
                collection. Build the index before running a search.
            </div>
            """
        )
        render_pipeline(INDEX_STAGES, 0)

    if st.button("Build Embedding Index", use_container_width=True):
        run_live_indexing(documents_df, show_progress, pace=pace)
        st.session_state.last_results = []
        st.success("Embedding index created successfully.")

    if index_is_current(documents_df):
        embeddings = st.session_state.document_embeddings

        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Documents Indexed", embeddings.shape[0])
        col2.metric("Embedding Dimension", embeddings.shape[1])
        col3.metric("Index Build Time", f"{st.session_state.index_build_time:.2f} sec")
        col4.metric("Index Status", "Ready")

        with st.expander("View Embedding Details"):
            st.write(f"**Model:** {MODEL_NAME}")
            st.write(f"**Number of documents:** {embeddings.shape[0]}")
            st.write(f"**Embedding dimension:** {embeddings.shape[1]}")
            st.write("**Embedding type:** Dense floating-point vector (L2 normalised)")
            st.write(f"**Index memory:** {embeddings.nbytes / 1024:.1f} KB")

            st.caption(
                f"First 5 documents, first 16 of {embeddings.shape[1]} dimensions."
            )

            st.dataframe(
                pd.DataFrame(
                    embeddings[:5, :16].round(4),
                    index=st.session_state.indexed_documents["id"].head(5),
                    columns=[f"d{i}" for i in range(16)],
                ),
                use_container_width=True,
            )

        with st.expander("Watch the embedding space form (animated)", expanded=False):
            render_embedding_map_animated(embeddings, st.session_state.indexed_documents)


def run_live_search(query, documents_df, embeddings, top_k, threshold, show_progress, pace=0.3):
    pipeline_placeholder = st.empty()
    caption_placeholder = st.empty()

    def stage(active, caption=""):
        if show_progress:
            pipeline_placeholder.markdown(
                pipeline_markup(QUERY_STAGES, active), unsafe_allow_html=True
            )
            if caption:
                caption_placeholder.caption(caption)
            time.sleep(pace)

    start = time.perf_counter()

    stage(0, f'Query received: "{query}"')
    stage(1, "Preprocessing the query text ...")
    stage(2, "Encoding the query with the same model used for the documents ...")

    query_vector, scores = compute_similarities(query, documents_df, embeddings)

    stage(3, f"Computing cosine similarity against {len(documents_df)} documents ...")

    above = int((scores >= threshold).sum())
    stage(4, f"Ranking by score. {above} of {len(scores)} documents pass the threshold.")

    results = assemble_results(scores, documents_df, top_k, threshold)
    elapsed = time.perf_counter() - start

    stage(len(QUERY_STAGES) - 1, f"Returning the top {len(results)} documents.")

    if show_progress:
        pipeline_placeholder.markdown(
            pipeline_markup(QUERY_STAGES, len(QUERY_STAGES)), unsafe_allow_html=True
        )

    return results, elapsed, int(query_vector.shape[0]), scores, query_vector


def render_similarity_radar(results):
    if not results:
        return

    count = len(results)
    angles = np.linspace(0, 2 * np.pi, count, endpoint=False)

    start_x = np.cos(angles)
    start_y = np.sin(angles)

    end_radius = np.array([max(0.05, 1 - r["Similarity"]) for r in results])
    end_x = end_radius * np.cos(angles)
    end_y = end_radius * np.sin(angles)

    titles = [r["Title"] for r in results]
    sims = [r["Similarity"] for r in results]
    hover = [f"{t}<br>similarity {s:.3f}" for t, s in zip(titles, sims)]

    ring_theta = np.linspace(0, 2 * np.pi, 100)

    start_frame = go.Frame(
        data=[
            go.Scatter(
                x=np.cos(ring_theta), y=np.sin(ring_theta),
                mode="lines", line={"color": "#dddddd", "dash": "dot"}, showlegend=False,
            ),
            go.Scatter(x=[0], y=[0], mode="markers+text", text=["Your query"],
                       textposition="bottom center", marker={"size": 18, "color": "#f47721"},
                       showlegend=False),
            go.Scatter(x=start_x, y=start_y, mode="markers+text",
                       text=[f"#{i + 1}" for i in range(count)], textposition="top center",
                       marker={"size": 13, "color": "#2696d2"},
                       hovertext=hover, hoverinfo="text", showlegend=False),
        ],
        name="start",
    )

    end_frame = go.Frame(
        data=[
            go.Scatter(
                x=np.cos(ring_theta), y=np.sin(ring_theta),
                mode="lines", line={"color": "#dddddd", "dash": "dot"}, showlegend=False,
            ),
            go.Scatter(x=[0], y=[0], mode="markers+text", text=["Your query"],
                       textposition="bottom center", marker={"size": 18, "color": "#f47721"},
                       showlegend=False),
            go.Scatter(x=end_x, y=end_y, mode="markers+text",
                       text=[f"#{i + 1}" for i in range(count)], textposition="top center",
                       marker={"size": 13, "color": "#198754"},
                       hovertext=hover, hoverinfo="text", showlegend=False),
        ],
        name="end",
    )

    figure = go.Figure(
        data=start_frame.data,
        frames=[start_frame, end_frame],
        layout=go.Layout(
            title="How close each result is to your query (press Play)",
            xaxis={"visible": False, "range": [-1.2, 1.2]},
            yaxis={"visible": False, "range": [-1.2, 1.2], "scaleanchor": "x"},
            height=430,
            showlegend=False,
            updatemenus=[
                {
                    "type": "buttons",
                    "x": 0,
                    "y": 1.12,
                    "buttons": [
                        {
                            "label": "&#9654; Play",
                            "method": "animate",
                            "args": [
                                ["end"],
                                {
                                    "frame": {"duration": 1200, "redraw": True},
                                    "transition": {"duration": 1200, "easing": "cubic-in-out"},
                                    "fromcurrent": False,
                                },
                            ],
                        },
                        {
                            "label": "&#8635; Reset",
                            "method": "animate",
                            "args": [
                                ["start"],
                                {
                                    "frame": {"duration": 0, "redraw": True},
                                    "transition": {"duration": 0},
                                    "fromcurrent": False,
                                },
                            ],
                        },
                    ],
                }
            ],
        ),
    )

    st.plotly_chart(figure, use_container_width=True)
    st.caption(
        "Every result starts on the outer ring. Pressing Play pulls each one "
        "toward your query by exactly its similarity score -- the closer it "
        "ends up, the more relevant it is."
    )


def render_search_panel(documents_df, show_progress, pace=0.3):
    render_html('<div class="stage-label">STAGE B</div>')
    render_html('<div class="content-subheading">3. Run a Query</div>')

    query = st.text_area(
        "Enter your search query",
        value=st.session_state.get("last_query", ""),
        placeholder="Example: How do machines learn from data?",
        height=100,
    )

    col1, col2 = st.columns(2)
    with col1:
        top_k = st.slider("Number of results to retrieve (Top-K)", 1, 20, st.session_state.get("last_topk", 5) if isinstance(st.session_state.get("last_topk"), int) else 5)

    with col2:
        threshold = st.slider("Minimum similarity threshold", 0.0, 1.0, float(st.session_state.get("last_threshold", 0.25)), 0.05)

    if st.button("Run Semantic Search", use_container_width=True):
        if not index_is_current(documents_df):
            st.warning("Build the embedding index first (Stage A).")
        elif not query.strip():
            st.warning("Please enter a query.")
        else:
            results, elapsed, dimension, scores, q_vec = run_live_search(
                query,
                st.session_state.indexed_documents,
                st.session_state.document_embeddings,
                top_k,
                threshold,
                show_progress,
                pace=pace,
            )

            st.session_state.last_query = query
            st.session_state.last_results = results
            st.session_state.last_query_time = elapsed
            st.session_state.last_embedding_dimension = dimension
            st.session_state.last_documents_compared = len(scores)
            st.session_state.last_threshold = threshold
            st.session_state.last_score_distribution = scores
            st.session_state["last_sims"] = scores
            st.session_state["last_ranked_idx"] = np.argsort(scores)[::-1]
            st.session_state["last_topk"] = top_k
            st.session_state["last_is_builtin"] = (st.session_state.get("uploaded_documents") is None)
            st.session_state["last_docs"] = st.session_state.indexed_documents.to_dict("records")

            log_activity(f"Ran semantic search: '{query[:35]}' (Top-K={top_k}) -> {len(results)} matches in {elapsed*1000:.1f}ms")

            if not results:
                st.warning(
                    "No document reached the similarity threshold. "
                    "Lower the threshold or rephrase the query."
                )


def render_results_panel():
    results = st.session_state.get("last_results", [])
    if not results:
        return

    render_html('<div class="content-subheading">4. Query Processing Summary</div>')

    st.info(f"Query received: {st.session_state.last_query}")

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Query Embedding Dimension", st.session_state.last_embedding_dimension)
    col2.metric("Documents Compared", st.session_state.last_documents_compared)
    col3.metric("Search Time", f"{st.session_state.last_query_time * 1000:.2f} ms")
    col4.metric("Documents Returned", len(results))

    render_html('<div class="content-subheading">5. Ranked Results</div>')

    results_df = pd.DataFrame(results)
    table_df = results_df[
        ["Rank", "Document ID", "Title", "Category", "Source", "Word Count", "Similarity"]
    ].copy()
    table_df["Similarity"] = table_df["Similarity"].round(4)

    with st.expander("View results as a table"):
        st.dataframe(table_df, use_container_width=True, hide_index=True)

    chart_df = results_df.copy()
    chart_df["Document"] = chart_df["Rank"].astype(str) + ". " + chart_df["Title"]
    chart_df = chart_df.sort_values("Similarity").reset_index(drop=True)
    chart_df["Score"] = chart_df["Similarity"].round(4)

    figure = px.bar(
        chart_df,
        x="Similarity",
        y="Document",
        orientation="h",
        title="Cosine Similarity of Retrieved Documents",
        text="Score",
        labels={"Similarity": "Cosine Similarity", "Document": "Document"},
    )
    figure.update_layout(height=430, xaxis_range=[0, 1])
    st.plotly_chart(figure, use_container_width=True)

    with st.expander("Watch the results converge toward your query (animated)", expanded=False):
        render_similarity_radar(results)

    for result in results:
        snippet = result["Content"]
        if len(snippet) > 350:
            snippet = snippet[:350] + "..."

        render_html(
            f"""
            <div class="result-card">
                <div class="result-rank">#{result["Rank"]}</div>
                <div class="result-title">{escape_html(result["Title"])}</div>
                <div class="result-category">{escape_html(result["Category"])}</div>
                <div class="result-content">{escape_html(snippet)}</div>
                <div class="result-score">Cosine Similarity: {result["Similarity"]:.4f}</div>
                <div class="result-meta">
                    Document ID: {escape_html(result["Document ID"])}
                    &nbsp;|&nbsp; Source: {escape_html(result["Source"])}
                    &nbsp;|&nbsp; Words: {result["Word Count"]}
                </div>
            </div>
            """
        )

    if st.button("Record Current Trial", use_container_width=True):
        record_trial()
        st.success("Trial recorded successfully.")


def render_simulation():
    render_html(SIMULATION_CSS)
    render_html('<div class="content-heading">Simulation</div>')

    render_concept_animation()

    render_html('<hr style="border:none;border-top:1px solid var(--border);margin:28px 0;">')

    render_html('<div class="content-subheading">Try It on the Real Dataset</div>')

    render_html(
        """
        <div class="info-box">
            This part runs the same process on the actual document collection and
            your own queries. Stage A builds the embedding index; Stage B searches it.
        </div>
        """
    )

    col_toggle, col_speed = st.columns([2, 1])

    with col_toggle:
        show_progress = st.checkbox(
            "Show the pipeline animation while indexing and searching",
            value=True,
        )

    with col_speed:
        speed_label = st.select_slider(
            "Animation speed",
            options=["0.5x (Slow)", "1x (Normal)", "1.5x", "2x (Fast)", "3x (Very Fast)"],
            value="1x (Normal)",
            disabled=not show_progress,
        )

    speed_multiplier = float(speed_label.split("x")[0])
    pace = 0.3 / speed_multiplier

    documents_df = get_active_documents()
    _, source_label = load_base_documents()

    if st.session_state.get("uploaded_documents") is not None:
        source_label = f"{source_label} + uploaded file"

    render_dataset_panel(documents_df, source_label)
    render_indexing_panel(documents_df, show_progress, pace=pace)
    render_search_panel(documents_df, show_progress, pace=pace)
    render_results_panel()
    render_disadvantages_section()


def render_disadvantages_section():
    render_html(
        """
        <div style='margin-top: 36px;'>
            <div class="content-subheading" style='color:#b91c1c !important; font-size: 24px !important; font-weight: 800 !important; border-bottom: 2.5px solid #dc2626; padding-bottom: 8px; margin-bottom: 18px;'>
                ⚠️ Disadvantages &amp; Limitations of Dense Semantic Search
            </div>
            <div style='background: #fef2f2; border: 1.5px solid #fecaca; border-left: 6px solid #dc2626; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(220,38,38,0.06); margin-top: 14px;'>
                <div style='color: #991b1b !important; font-size: 1.3rem !important; font-weight: 800 !important; margin-bottom: 20px;'>
                    Critical Practical Constraints in Real-World Dense Retrieval
                </div>
                <div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;'>
                    <div style='background: #ffffff; border: 1.5px solid #fee2e2; border-radius: 8px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);'>
                        <div style='color: #dc2626 !important; font-weight: 800 !important; font-size: 1.15rem !important; margin-bottom: 8px;'>1. Computational Cost</div>
                        <div style='color: #000000 !important; font-size: 1.05rem !important; line-height: 1.65; font-weight: 500;'>Generating dense embeddings for large document collections requires high compute and GPU acceleration compared to lightweight inverted indexes (like BM25).</div>
                    </div>
                    <div style='background: #ffffff; border: 1.5px solid #fee2e2; border-radius: 8px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);'>
                        <div style='color: #dc2626 !important; font-weight: 800 !important; font-size: 1.15rem !important; margin-bottom: 8px;'>2. Model Dependence</div>
                        <div style='color: #000000 !important; font-size: 1.05rem !important; line-height: 1.65; font-weight: 500;'>Retrieval quality depends strongly on the quality, training data, and domain suitability of the underlying sentence-transformer embedding model.</div>
                    </div>
                    <div style='background: #ffffff; border: 1.5px solid #fee2e2; border-radius: 8px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);'>
                        <div style='color: #dc2626 !important; font-weight: 800 !important; font-size: 1.15rem !important; margin-bottom: 8px;'>3. Semantic Ambiguity</div>
                        <div style='color: #000000 !important; font-size: 1.05rem !important; line-height: 1.65; font-weight: 500;'>Similar-looking embeddings do not always guarantee that two documents are truly relevant. Polysemous words or negated phrases can produce spurious semantic similarity.</div>
                    </div>
                    <div style='background: #ffffff; border: 1.5px solid #fee2e2; border-radius: 8px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);'>
                        <div style='color: #dc2626 !important; font-weight: 800 !important; font-size: 1.15rem !important; margin-bottom: 8px;'>4. Domain Limitations</div>
                        <div style='color: #000000 !important; font-size: 1.05rem !important; line-height: 1.65; font-weight: 500;'>A general-purpose model may perform poorly on highly specialized technical, medical, legal, or domain-specific text without targeted fine-tuning.</div>
                    </div>
                    <div style='background: #ffffff; border: 1.5px solid #fee2e2; border-radius: 8px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);'>
                        <div style='color: #dc2626 !important; font-weight: 800 !important; font-size: 1.15rem !important; margin-bottom: 8px;'>5. No Exact-Match Guarantee</div>
                        <div style='color: #000000 !important; font-size: 1.05rem !important; line-height: 1.65; font-weight: 500;'>Semantic search can sometimes miss exact keywords, rare codes, part numbers, or specific acronyms that traditional keyword search effortlessly retrieves.</div>
                    </div>
                </div>
            </div>
        </div>
        """
    )


def page_simulation():
    render_header()
    render_simulation()


# ══════════════════════════════════════════════════════════════════════════════
# PAGE 4 — QUIZ (10 DYNAMIC QUESTIONS ON DENSE EMBEDDING SEMANTIC SEARCH)
# ══════════════════════════════════════════════════════════════════════════════
QUESTION_BANK = [
    {
        "q": "What is a dense embedding in semantic search?",
        "options": [
            "A compressed ZIP file of document texts",
            "A fixed-length numerical vector with real continuous values representing text meaning",
            "A sparse bag-of-words index containing exact word counts",
            "A binary bit string encoding text ASCII characters",
        ],
        "ans": 1,
        "explain": "A dense embedding is a fixed-length vector of real continuous numbers generated by a neural network that encodes semantic meaning.",
    },
    {
        "q": "Which pretrained transformer embedding model is used in this experiment?",
        "options": ["text-embedding-ada-002", "BERT-base-uncased", "all-MiniLM-L6-v2", "Word2Vec-300"],
        "ans": 2,
        "explain": "The experiment uses all-MiniLM-L6-v2 from the Sentence Transformers framework.",
    },
    {
        "q": "What is the output vector dimension generated by all-MiniLM-L6-v2?",
        "options": ["128", "768", "512", "384"],
        "ans": 3,
        "explain": "all-MiniLM-L6-v2 produces dense sentence embeddings of fixed dimension 384.",
    },
    {
        "q": "Why must the exact same embedding model be used for both documents and queries?",
        "options": [
            "To save memory during execution",
            "So that documents and queries are mapped into the identical vector space for comparison",
            "Because different models produce identical vector representations",
            "To speed up document tokenization",
        ],
        "ans": 1,
        "explain": "Vectors from different embedding models occupy different coordinate spaces. Using the same model guarantees direct comparability.",
    },
    {
        "q": "What does Cosine Similarity compute between a query vector and a document vector?",
        "options": [
            "The straight-line Euclidean distance between vector endpoints",
            "The total number of identical character strings",
            "The cosine of the angle (directional alignment) between vectors",
            "The sum of vector lengths",
        ],
        "ans": 2,
        "explain": "Cosine similarity measures directional alignment (angle) between non-zero vectors in high-dimensional space.",
    },
    {
        "q": "What does Top-K retrieval specify in a semantic search engine?",
        "options": [
            "Return documents with similarity score greater than K",
            "Return the K highest-ranked documents ordered by similarity score",
            "Return every K-th document in the indexed collection",
            "Return documents containing at least K words",
        ],
        "ans": 1,
        "explain": "Top-K retrieval selects and ranks the top K documents with the highest similarity scores relative to the query.",
    },
    {
        "q": "How does dense semantic search overcome the vocabulary mismatch problem?",
        "options": [
            "By replacing all words in the dataset with synonyms",
            "By mapping semantically related concepts and paraphrases into nearby points in vector space",
            "By using exact string matching algorithms",
            "By converting text into alphabetical order",
        ],
        "ans": 1,
        "explain": "Dense embeddings capture conceptual meaning, allowing the system to match queries with documents that use different keywords.",
    },
    {
        "q": "What is the primary advantage of L2-normalizing embedding vectors before computing similarity?",
        "options": [
            "The dot product of L2-normalized vectors directly equals Cosine Similarity",
            "It reduces vector dimension from 384 to 2",
            "It removes negative values from vectors",
            "It speeds up document text loading",
        ],
        "ans": 0,
        "explain": "When vectors are normalized to unit length (|v|=1), their vector dot product u · v is mathematically equal to cosine similarity.",
    },
    {
        "q": "What is the typical range of Cosine Similarity values for unit-normalized vectors?",
        "options": ["[-1.0, +1.0]", "[0.0, 100.0]", "[0.0, +infinity)", "[-384, +384]"],
        "ans": 0,
        "explain": "Cosine similarity ranges from -1.0 (opposite orientation) to +1.0 (identical orientation).",
    },
    {
        "q": "Is the Top-K retrieval parameter dependent on the 384 vector dimensions?",
        "options": [
            "No, Top-K is the count of retrieved search results, while 384 is the embedding vector size",
            "Yes, Top-K must always equal 384",
            "Yes, Top-K represents sub-dimensions of 384",
            "No, Top-K is the vocabulary size",
        ],
        "ans": 0,
        "explain": "Top-K determines how many search results are returned (e.g. K=5). It is completely independent of the 384 vector dimensions.",
    },
    {
        "q": "When are document dense embeddings typically computed in a search system?",
        "options": [
            "Pre-computed upfront and stored for fast query matching during retrieval",
            "Computed only after search results are sorted",
            "Generated randomly every time a user types a character",
            "Never computed for documents",
        ],
        "ans": 0,
        "explain": "Document collection embeddings are computed upfront during indexing so user queries can be quickly matched against them.",
    },
    {
        "q": "What component determines the final ranking of retrieved documents?",
        "options": [
            "Sorting documents in descending order of their cosine similarity scores",
            "Sorting documents alphabetically by document title",
            "Sorting documents by file creation date",
            "Random shuffle order",
        ],
        "ans": 0,
        "explain": "Documents with higher cosine similarity scores to the query vector are ranked higher in the search results.",
    },
    {
        "q": "Why are continuous neural representations called 'dense' vectors?",
        "options": [
            "Because almost all 384 dimensions contain non-zero continuous floating-point values",
            "Because they contain mostly zero values across vocabulary dimensions",
            "Because they are stored as compressed binary files",
            "Because they can only represent heavy documents",
        ],
        "ans": 0,
        "explain": "Dense vectors feature non-zero floating-point numbers in every dimension, unlike sparse vectors which consist mostly of zeros.",
    },
    {
        "q": "What happens in vector space when two sentences have nearly identical semantic meanings?",
        "options": [
            "Their embedding vectors point in nearly the same direction with a high cosine similarity",
            "Their embedding vectors become perpendicular with zero cosine similarity",
            "Their embedding dimensions are reduced to zero",
            "Their vector values are inverted into negative integers",
        ],
        "ans": 0,
        "explain": "Semantically equivalent sentences map to nearby coordinates with small angles between their embedding vectors.",
    },
    {
        "q": "What role does the transformer architecture play in sentence-transformers?",
        "options": [
            "It applies self-attention mechanisms to encode contextual relationships between words into a unified vector",
            "It translates text from English to French before indexing",
            "It compresses text files using GZIP compression",
            "It counts character frequencies across documents",
        ],
        "ans": 0,
        "explain": "Transformer self-attention layers capture contextual meaning across entire sentences to construct high-quality embeddings.",
    },
    {
        "q": "If a query vector and a document vector point in the exact same direction, what is their Cosine Similarity?",
        "options": ["1.0", "0.0", "-1.0", "384.0"],
        "ans": 0,
        "explain": "Identical vector directions yield cos(0°) = 1.0.",
    },
    {
        "q": "What happens if a document in the collection is updated or edited?",
        "options": [
            "Its dense embedding vector must be recomputed using the embedding model",
            "The query model must be retrained from scratch",
            "The vector dimension changes from 384 to 768",
            "No change is required in the vector index",
        ],
        "ans": 0,
        "explain": "Modifying document text requires passing the new content through the embedding model to produce an updated vector.",
    },
    {
        "q": "Why is semantic search effective for short queries or natural language questions?",
        "options": [
            "It maps natural language queries to relevant document concepts in the shared vector space",
            "It forces users to enter exact boolean operators like AND/OR",
            "It ignores query words and returns random documents",
            "It only searches for exact matching punctuation",
        ],
        "ans": 0,
        "explain": "Dense embeddings represent the underlying conceptual meaning of queries, facilitating effective matching with relevant content.",
    },
    {
        "q": "What is sentence-transformers in Python?",
        "options": [
            "A Python library for computing state-of-the-art sentence and text embeddings",
            "A web server framework for hosting HTML pages",
            "A database management system for SQL tables",
            "A plotting library for drawing bar charts",
        ],
        "ans": 0,
        "explain": "The sentence-transformers package provides pre-trained models for computing dense vector representations of sentences.",
    },
    {
        "q": "How does dense retrieval handle queries containing synonyms?",
        "options": [
            "Synonyms map to close vector positions, allowing successful retrieval without exact keyword overlap",
            "Synonyms cause vector calculation errors",
            "Synonyms are automatically deleted from the query string",
            "Synonyms force the system to perform a web search",
        ],
        "ans": 0,
        "explain": "Embedding models are trained on large text corpora to represent synonymous terms close together in vector space.",
    },
]

def generate_quiz_questions(num_q=10):
    selected = random.sample(QUESTION_BANK, min(num_q, len(QUESTION_BANK)))
    processed = []
    for item in selected:
        opts = list(item["options"])
        correct_text = opts[item["ans"]]
        random.shuffle(opts)
        new_ans = opts.index(correct_text)
        processed.append({
            "q": item["q"],
            "options": opts,
            "ans": new_ans,
            "explain": item["explain"]
        })
    return processed

def page_quiz():
    render_header()
    st.markdown("## Quiz — Dense Embedding-Based Semantic Search")
    st.caption("Test your knowledge. Questions and option order are dynamically sampled for every new attempt.")

    if not st.session_state.get("quiz_questions"):
        st.session_state["quiz_questions"] = generate_quiz_questions()

    quiz_qs = st.session_state["quiz_questions"]

    c_top1, c_top2 = st.columns([3, 1])
    with c_top2:
        if st.button("🔄 Generate New Quiz", use_container_width=True):
            st.session_state["quiz_questions"] = generate_quiz_questions()
            st.session_state["quiz_done"] = False
            st.session_state["quiz_score"] = 0
            st.session_state["quiz_answers"] = {}
            st.rerun()

    if st.session_state.get("quiz_done", False):
        score = st.session_state["quiz_score"]
        total = len(quiz_qs)
        st.markdown(f"### Your Score: **{score} / {total}**")
        pct = (score / total) * 100 if total > 0 else 0
        score_bg = "#06d6a0" if pct >= 75 else "#f4a261" if pct >= 50 else "#e63946"
        st.markdown(
            f"<div style='background:{score_bg};border-radius:10px;padding:1.2rem;"
            f"color:#ffffff;text-align:center;font-size:2rem;font-weight:700;"
            f"letter-spacing:2px'>"
            f"{pct:.0f}% &nbsp;({score}/{total})</div>",
            unsafe_allow_html=True
        )

        with st.expander("Review answers", expanded=True):
            for i, q in enumerate(quiz_qs):
                ua = st.session_state["quiz_answers"].get(i, -1)
                correct = ua == q["ans"]
                icon = "✅" if correct else "❌"
                st.markdown(f"**Q{i+1}. {q['q']}**")
                st.markdown(f"{icon} Your answer: _{q['options'][ua] if 0 <= ua < len(q['options']) else 'Not answered'}_")
                if not correct:
                    st.markdown(f"Correct answer: _{q['options'][q['ans']]}_")
                st.caption(f"💡 Explanation: {q['explain']}")
                st.markdown("---")

        if st.button("Retake Current Quiz", type="secondary"):
            st.session_state["quiz_done"] = False
            st.session_state["quiz_score"] = 0
            st.session_state["quiz_answers"] = {}
            st.rerun()
        return

    with st.form("quiz_form"):
        answers = {}
        for i, q in enumerate(quiz_qs):
            st.markdown(f"**Q{i+1}.** {q['q']}")
            answers[i] = st.radio(
                f"q{i}", q["options"], key=f"quiz_q_{i}", index=None,
                label_visibility="collapsed"
            )
            st.markdown("---")
        submitted = st.form_submit_button("Submit Quiz", type="primary")

    if submitted:
        score = 0
        stored = {}
        for i, q in enumerate(quiz_qs):
            chosen = answers.get(i)
            idx = q["options"].index(chosen) if chosen in q["options"] else -1
            stored[i] = idx
            if idx == q["ans"]:
                score += 1
        st.session_state["quiz_done"] = True
        st.session_state["quiz_score"] = score
        st.session_state["quiz_answers"] = stored
        st.rerun()

# ══════════════════════════════════════════════════════════════════════════════
# PAGE 5 — REPORT GENERATION
# ══════════════════════════════════════════════════════════════════════════════
# ══════════════════════════════════════════════════════════════════════════════
# PAGE 5 — REPORT GENERATION
# ══════════════════════════════════════════════════════════════════════════════
def page_report():
    render_header()
    st.markdown("## Report Generation")

    st.markdown("<div class='section-title'>Submission &amp; Student Details</div>", unsafe_allow_html=True)
    st.caption("Please fill in your details below. These values will automatically populate your Report and Certificate.")
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        s_name = st.text_input("Student Name:", value=st.session_state.get("student_name", ""), key="rep_name", placeholder="Enter your full name")
    with c2:
        r_no = st.text_input("Roll No.:", value=st.session_state.get("roll_no", ""), key="rep_roll", placeholder="e.g. 60")
    with c3:
        c_div = st.text_input("Class / Division:", value=st.session_state.get("class_div", ""), key="rep_class", placeholder="e.g. D17C")
    with c4:
        d_str = st.text_input("Date:", value=st.session_state.get("date_str", datetime.now().strftime("%d %B %Y")), key="rep_date")

    st.session_state["student_name"] = s_name.strip()
    st.session_state["roll_no"] = r_no.strip()
    st.session_state["class_div"] = c_div.strip()
    st.session_state["date_str"] = d_str.strip()

    last_q   = st.session_state.get("last_query", "—")
    last_res = st.session_state.get("last_results", [])
    last_topk = st.session_state.get("last_topk", "—")
    last_is_builtin = st.session_state.get("last_is_builtin", True)
    last_docs_ss = st.session_state.get("last_docs", BUILTIN_DOCS)
    doc_count = len(last_docs_ss) if last_docs_ss else len(BUILTIN_DOCS)
    ds_source = "Built-in sample documents" if last_is_builtin else "Custom uploaded dataset"
    quiz_score = st.session_state.get("quiz_score", 0)
    quiz_qs = st.session_state.get("quiz_questions", [])
    quiz_total = len(quiz_qs) if quiz_qs else 10
    quiz_done  = st.session_state.get("quiz_done", False)

    # Compute last P/R/F1 if available
    prf_row = ""
    p_val, r_val, f1_val = None, None, None
    if last_res and last_is_builtin:
        last_sims    = st.session_state.get("last_sims", None)
        last_ridx    = st.session_state.get("last_ranked_idx", None)
        eq_m = next((e for e in EVAL_QUERIES if e["query"] == last_q), None)
        if eq_m and last_sims is not None and last_ridx is not None:
            m = compute_metrics(last_res, eq_m["relevant"], len(eq_m["relevant"]),
                                last_topk if isinstance(last_topk, int) else 5,
                                last_sims, last_ridx, list(last_docs_ss))
            p_val, r_val, f1_val = m['precision'], m['recall'], m['f1']
            prf_row = f"| Precision@K / Recall@K / F1@K | **{m['precision']:.3f}** / **{m['recall']:.3f}** / **{m['f1']:.3f}** |"
        else:
            prf_row = "| Evaluation Metrics | No labeled query run yet |"
    else:
        prf_row = "| Evaluation Metrics | Custom dataset — ground-truth labels unavailable |"

    st.markdown("<div class='section-title'>Report Preview</div>", unsafe_allow_html=True)
    st.markdown(f"""
| Field | Value |
|-------|-------|
| Laboratory Module | **Dense Embedding-Based Semantic Search** |
| Student Name | {s_name if s_name else '*(Pending Student Input)*'} |
| Roll No. | {r_no if r_no else '*(Pending Student Input)*'} |
| Class / Division | {c_div if c_div else '*(Pending Student Input)*'} |
| Embedding Model | all-MiniLM-L6-v2 |
| Embedding Dimension | 384 |
| Similarity Metric | Cosine Similarity |
| Dataset / Document Source | {ds_source} |
| Number of Documents | {doc_count} |
| Last Query | {last_q} |
| Top-K | {last_topk} |
{prf_row}
| Quiz Score | {quiz_score}/{quiz_total} ({"completed" if quiz_done else "not attempted"}) |
| Observation | The semantic search system converted text into 384-dimensional dense vectors using all-MiniLM-L6-v2 and ranked documents by cosine similarity. |
| Conclusion | Dense embeddings enable semantic retrieval beyond exact keyword matches by mapping related concepts into close vector spaces. |
    """)

    if st.button("Download PDF Report", type="primary"):
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4,
                                rightMargin=2*cm, leftMargin=2*cm,
                                topMargin=2*cm, bottomMargin=2*cm)
        styles = getSampleStyleSheet()
        H1 = ParagraphStyle("H1", parent=styles["Heading1"],
                             fontSize=15, textColor=rl_colors.HexColor("#4361ee"), spaceAfter=8)
        H2 = ParagraphStyle("H2", parent=styles["Heading2"],
                             fontSize=11, textColor=rl_colors.HexColor("#7209b7"), spaceAfter=6)
        BL = ParagraphStyle("BL", parent=styles["Normal"], fontSize=9, leading=13)

        cell_style = ParagraphStyle("TCell", parent=styles["Normal"], fontSize=8, leading=11, textColor=rl_colors.HexColor("#111827"))
        cell_bold  = ParagraphStyle("TCellB", parent=styles["Normal"], fontSize=8, leading=11, fontName="Helvetica-Bold", textColor=rl_colors.HexColor("#4361ee"))
        cell_hdr   = ParagraphStyle("THdr", parent=styles["Normal"], fontSize=8, leading=11, fontName="Helvetica-Bold", textColor=rl_colors.white)

        def p_cell(txt, is_bold=False, is_hdr=False):
            st_style = cell_hdr if is_hdr else (cell_bold if is_bold else cell_style)
            return Paragraph(str(txt), st_style)

        story = []
        story.append(Paragraph("Dense Embedding-Based Semantic Search", H1))
        story.append(Paragraph(f"Virtual Laboratory Report — Class: {c_div or '—'}", BL))
        story.append(HRFlowable(width="100%", thickness=1.5, color=rl_colors.HexColor("#4361ee")))
        story.append(Spacer(1, 0.3*cm))

        info_data = [
            [p_cell("Laboratory Module", True), p_cell("Dense Embedding-Based Semantic Search"), p_cell("Class / Division", True), p_cell(c_div or "—")],
            [p_cell("Student Name", True), p_cell(s_name or "—"), p_cell("Roll No.", True), p_cell(r_no or "—")],
            [p_cell("Embedding Model", True), p_cell("all-MiniLM-L6-v2 (384-D)"), p_cell("Date", True), p_cell(d_str or datetime.now().strftime("%d %B %Y"))],
            [p_cell("Similarity Metric", True), p_cell("Cosine Similarity"), p_cell("Total Documents", True), p_cell(str(doc_count))],
            [p_cell("Dataset Source", True), p_cell(ds_source), p_cell("Last Query", True), p_cell(str(last_q))],
            [p_cell("Top-K", True), p_cell(str(last_topk)), p_cell("Quiz Score", True), p_cell(f"{quiz_score}/{quiz_total}")],
            [p_cell("Status", True), p_cell("Completed" if quiz_done else "In Progress"), p_cell("", True), p_cell("")],
        ]
        t = Table(info_data, colWidths=[3.2*cm, 5.8*cm, 3.2*cm, 4.8*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0,0),(-1,-1), rl_colors.HexColor("#f3f4fb")),
            ("GRID", (0,0),(-1,-1), 0.5, rl_colors.HexColor("#cbd5e1")),
            ("VALIGN", (0,0),(-1,-1), "TOP"),
            ("PADDING", (0,0),(-1,-1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 0.4*cm))

        if last_res:
            story.append(Paragraph(f"Retrieval Results — Query: '{last_q}'", H2))
            res_data = [[p_cell("Rank", is_hdr=True), p_cell("ID", is_hdr=True), p_cell("Title", is_hdr=True), p_cell("Cosine Score", is_hdr=True)]]
            for r in last_res:
                res_data.append([p_cell(str(r["rank"])), p_cell(r["id"]), p_cell(r["title"]), p_cell(f"{r['score']:.4f}")])
            tr = Table(res_data, colWidths=[1.5*cm, 2*cm, 9*cm, 2.5*cm])
            tr.setStyle(TableStyle([
                ("BACKGROUND", (0,0),(-1,0), rl_colors.HexColor("#4361ee")),
                ("GRID", (0,0),(-1,-1), 0.5, rl_colors.HexColor("#cbd5e1")),
                ("VALIGN", (0,0),(-1,-1), "TOP"),
                ("ROWBACKGROUNDS", (0,1),(-1,-1), [rl_colors.white, rl_colors.HexColor("#f3f4fb")]),
                ("PADDING", (0,0),(-1,-1), 4),
            ]))
            story.append(tr)
            story.append(Spacer(1, 0.3*cm))

        if p_val is not None:
            story.append(Paragraph("Retrieval Evaluation Metrics", H2))
            eval_data = [
                [p_cell("Metric", is_hdr=True), p_cell("Precision@K", is_hdr=True), p_cell("Recall@K", is_hdr=True), p_cell("F1@K", is_hdr=True)],
                [p_cell("Value"), p_cell(f"{p_val:.3f}"), p_cell(f"{r_val:.3f}"), p_cell(f"{f1_val:.3f}")]
            ]
            te = Table(eval_data, colWidths=[3*cm, 4*cm, 4*cm, 4*cm])
            te.setStyle(TableStyle([
                ("BACKGROUND", (0,0),(-1,0), rl_colors.HexColor("#7209b7")),
                ("GRID", (0,0),(-1,-1), 0.5, rl_colors.HexColor("#cbd5e1")),
                ("VALIGN", (0,0),(-1,-1), "TOP"),
                ("PADDING", (0,0),(-1,-1), 4),
            ]))
            story.append(te)
            story.append(Spacer(1, 0.3*cm))

        story.append(Paragraph("Observation", H2))
        story.append(Paragraph(
            "The semantic retrieval system ranked documents according to their cosine similarity with the query vector. "
            "Documents with greater semantic alignment received higher similarity scores.", BL))
        story.append(Spacer(1, 0.3*cm))
        story.append(Paragraph("Conclusion", H2))
        story.append(Paragraph(
            "Dense embedding-based semantic retrieval using all-MiniLM-L6-v2 and cosine similarity successfully retrieves "
            "conceptually related documents even when exact keywords do not match. The workflow verifies that dense vectors "
            "capture semantic nuances and enable robust, intelligent text search.", BL))

        doc.build(story)
        buf.seek(0)
        st.download_button(
            label="Save PDF Report",
            data=buf,
            file_name=f"Dense_Semantic_Search_Report_{r_no or 'Exp12'}.pdf",
            mime="application/pdf",
        )

# ══════════════════════════════════════════════════════════════════════════════
# PAGE 6 — CERTIFICATE
# ══════════════════════════════════════════════════════════════════════════════
def page_certificate():
    render_header()
    st.markdown("## Certificate of Completion")

    s_name = st.session_state.get("student_name", "").strip()
    r_no   = st.session_state.get("roll_no", "").strip()
    c_div  = st.session_state.get("class_div", "").strip()
    d_str  = st.session_state.get("date_str", datetime.now().strftime("%d %B %Y")).strip()
    quiz_score = st.session_state.get("quiz_score", 0)
    quiz_qs = st.session_state.get("quiz_questions", [])
    quiz_total = len(quiz_qs) if quiz_qs else 10
    quiz_done  = st.session_state.get("quiz_done", False)

    if not s_name or not r_no:
        st.info("⚠️ **Please enter your student details in Report Generation first.**")
        st.markdown("""
        To generate your personalized certificate, please navigate to **5 Report Generation**
        and fill in your **Student Name**, **Roll No.**, and **Class / Division**.
        """)
        return

    cert_id = f"VLAB-SEMANTIC-{c_div if c_div else 'MAIN'}-{r_no}"

    # Visual Certificate Preview (Landscape Container)
    st.markdown(f"""
    <div style='
        border: 10px double #4361ee;
        border-radius: 16px;
        padding: 2.5rem 3.5rem;
        text-align: center;
        background: linear-gradient(135deg, #ffffff 0%, #f3f4fb 100%);
        color: #111827;
        margin: 1.5rem 0;
        box-shadow: 0 10px 30px rgba(67, 97, 238, 0.15);
        position: relative;
    '>
      <div style='display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #4361ee; padding-bottom: 12px; margin-bottom: 1.5rem;'>
        <div style='text-align:left;'>
          <div style='font-size:0.8rem; font-weight:700; color:#4361ee; letter-spacing:2px;'>VIRTUAL LABORATORY</div>
          <div style='font-size:0.75rem; color:#4b5563;'>DEPARTMENT OF INFORMATION TECHNOLOGY</div>
        </div>
        <div style='text-align:right;'>
          <div style='font-size:0.75rem; font-weight:600; color:#7209b7;'>CERTIFICATE ID</div>
          <div style='font-size:0.8rem; font-weight:700; color:#111827;'>{cert_id}</div>
        </div>
      </div>

      <div style='font-size:0.9rem; letter-spacing:4px; color:#7209b7; font-weight:700; text-transform:uppercase;'>CERTIFICATE</div>
      <h1 style='font-size:2.2rem; color:#4361ee; margin:0.3rem 0 1.2rem 0; font-weight:800; letter-spacing:1px;'>OF COMPLETION</h1>

      <div style='font-size:1rem; color:#4b5563; margin-bottom:0.8rem;'>This is to certify that</div>

      <div style='font-size:2rem; font-weight:800; color:#111827; text-decoration: underline #4361ee 3px; margin-bottom:1rem;'>
        {s_name}
      </div>

      <div style='font-size:0.95rem; color:#4b5563; margin-bottom:1.2rem;'>
        (Roll No: <b>{r_no}</b> &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Class: <b>{c_div or '—'}</b>)
      </div>

      <div style='font-size:1rem; color:#4b5563; margin-bottom:0.5rem;'>
        has successfully completed the Virtual Lab experiment
      </div>

      <div style='font-size:1.35rem; font-weight:700; color:#4361ee; margin-bottom:0.3rem;'>
        Dense Embedding-Based Semantic Search
      </div>

      <div style='font-size:0.85rem; color:#6b7280; margin-bottom:1.5rem;'>
        Embedding Model: <b>all-MiniLM-L6-v2 (384-D)</b> &nbsp;|&nbsp; Metric: <b>Cosine Similarity</b>
      </div>

      <div style='display:flex; justify-content:space-between; align-items:flex-end; border-top: 1px solid #d1d5db; padding-top: 1.5rem; margin-top: 1.5rem;'>
        <div style='text-align:left; font-size:0.82rem; color:#4b5563;'>
          <div><b>Date of Issue:</b> {d_str}</div>
          <div><b>Quiz Evaluation:</b> {quiz_score} / {quiz_total} ({"Passed ✅" if quiz_done else "Completed"})</div>
        </div>
        <div style='text-align:center;'>
          <div style='font-family:cursive; font-size:1.2rem; color:#4361ee; font-weight:bold;'>Virtual Lab Coordinator</div>
          <div style='border-top: 1px solid #111827; width: 180px; margin: 4px auto;'></div>
          <div style='font-size:0.75rem; color:#6b7280; font-weight:600;'>Authorized Signatory</div>
        </div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    if st.button("Download Certificate PDF", type="primary"):
        buf = io.BytesIO()
        # Landscape A4 PDF Template matching visual card design
        doc = SimpleDocTemplate(
            buf,
            pagesize=landscape(A4),
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=3.2*cm,
            bottomMargin=3.2*cm
        )

        def draw_cert_bg(canvas, doc_obj):
            canvas.saveState()
            w, h = doc_obj.pagesize  # A4 landscape: width=841.89, height=595.28

            # Soft background fill
            canvas.setFillColor(rl_colors.HexColor("#f8fafc"))
            canvas.rect(0, 0, w, h, fill=1, stroke=0)

            # Outer blue double border framing the document
            canvas.setStrokeColor(rl_colors.HexColor("#4361ee"))
            canvas.setLineWidth(3)
            canvas.roundRect(16, 16, w - 32, h - 32, 12, fill=0, stroke=1)
            canvas.setLineWidth(1)
            canvas.roundRect(22, 22, w - 44, h - 44, 8, fill=0, stroke=1)

            # Header Top Left
            canvas.setFillColor(rl_colors.HexColor("#4361ee"))
            canvas.setFont("Helvetica-Bold", 10)
            canvas.drawString(45, h - 48, "VIRTUAL LABORATORY")
            canvas.setFillColor(rl_colors.HexColor("#4b5563"))
            canvas.setFont("Helvetica", 8)
            canvas.drawString(45, h - 60, "DEPARTMENT OF INFORMATION TECHNOLOGY")

            # Header Top Right
            canvas.setFillColor(rl_colors.HexColor("#7209b7"))
            canvas.setFont("Helvetica-Bold", 8)
            canvas.drawRightString(w - 45, h - 48, "CERTIFICATE ID")
            canvas.setFillColor(rl_colors.HexColor("#111827"))
            canvas.setFont("Helvetica-Bold", 9.5)
            canvas.drawRightString(w - 45, h - 60, cert_id)

            # Header Separator Line
            canvas.setStrokeColor(rl_colors.HexColor("#4361ee"))
            canvas.setLineWidth(1.5)
            canvas.line(45, h - 72, w - 45, h - 72)

            # Footer Separator Line
            canvas.setStrokeColor(rl_colors.HexColor("#d1d5db"))
            canvas.setLineWidth(1)
            canvas.line(45, 82, w - 45, 82)

            # Footer Bottom Left
            canvas.setFillColor(rl_colors.HexColor("#4b5563"))
            canvas.setFont("Helvetica-Bold", 9)
            canvas.drawString(45, 62, f"Date of Issue: {d_str}")
            status_str = "Completed" if quiz_done else "Completed"
            canvas.setFont("Helvetica", 9)
            canvas.drawString(45, 46, f"Quiz Evaluation: {quiz_score} / {quiz_total} ({status_str})")

            # Footer Bottom Right (Signature Block)
            canvas.setFillColor(rl_colors.HexColor("#4361ee"))
            canvas.setFont("Helvetica-Bold", 13)
            canvas.drawRightString(w - 55, 60, "Virtual Lab Coordinator")
            canvas.setStrokeColor(rl_colors.HexColor("#111827"))
            canvas.setLineWidth(1)
            canvas.line(w - 205, 52, w - 45, 52)
            canvas.setFillColor(rl_colors.HexColor("#6b7280"))
            canvas.setFont("Helvetica", 8)
            canvas.drawRightString(w - 85, 40, "Authorized Signatory")

            canvas.restoreState()

        styles = getSampleStyleSheet()
        TAG_STYLE = ParagraphStyle("TAG_STYLE", parent=styles["Normal"], alignment=1, fontSize=12, leading=16, textColor=rl_colors.HexColor("#7209b7"), fontName="Helvetica-Bold", spaceAfter=4)
        TITLE_STYLE = ParagraphStyle("TITLE_STYLE", parent=styles["Title"], alignment=1, fontSize=28, leading=34, textColor=rl_colors.HexColor("#4361ee"), fontName="Helvetica-Bold", spaceAfter=14)
        SUB_STYLE = ParagraphStyle("SUB_STYLE", parent=styles["Normal"], alignment=1, fontSize=12, leading=16, textColor=rl_colors.HexColor("#4b5563"), spaceAfter=8)
        NAME_STYLE = ParagraphStyle("NAME_STYLE", parent=styles["Normal"], alignment=1, fontSize=24, leading=32, textColor=rl_colors.HexColor("#111827"), fontName="Helvetica-Bold", spaceAfter=12)
        DETAILS_STYLE = ParagraphStyle("DETAILS_STYLE", parent=styles["Normal"], alignment=1, fontSize=11, leading=15, textColor=rl_colors.HexColor("#4b5563"), spaceAfter=16)
        EXP_STYLE = ParagraphStyle("EXP_STYLE", parent=styles["Normal"], alignment=1, fontSize=16, leading=22, textColor=rl_colors.HexColor("#4361ee"), fontName="Helvetica-Bold", spaceAfter=8)
        MODEL_STYLE = ParagraphStyle("MODEL_STYLE", parent=styles["Normal"], alignment=1, fontSize=10, leading=14, textColor=rl_colors.HexColor("#6b7280"), spaceAfter=0)

        story = [
            Spacer(1, 0.4*cm),
            Paragraph("C E R T I F I C A T E", TAG_STYLE),
            Paragraph("OF COMPLETION", TITLE_STYLE),
            Spacer(1, 0.4*cm),
            Paragraph("This is to certify that", SUB_STYLE),
            Spacer(1, 0.2*cm),
            Paragraph(f"<u>{s_name}</u>", NAME_STYLE),
            Spacer(1, 0.3*cm),
            Paragraph(f"(Roll No: <b>{r_no}</b> &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp; Class: <b>{c_div or '—'}</b>)", DETAILS_STYLE),
            Spacer(1, 0.5*cm),
            Paragraph("has successfully completed the Virtual Lab experiment", SUB_STYLE),
            Spacer(1, 0.3*cm),
            Paragraph("Dense Embedding-Based Semantic Search", EXP_STYLE),
            Spacer(1, 0.2*cm),
            Paragraph("Embedding Model: <b>all-MiniLM-L6-v2 (384-D)</b> &nbsp;|&nbsp; Metric: <b>Cosine Similarity</b>", MODEL_STYLE),
        ]

        doc.build(story, onFirstPage=draw_cert_bg)
        buf.seek(0)
        st.download_button(
            label="Save Certificate PDF",
            data=buf,
            file_name=f"Dense_Semantic_Search_Certificate_{r_no}.pdf",
            mime="application/pdf",
        )

# ══════════════════════════════════════════════════════════════════════════════
# PAGE 7 — REFERENCES
# ══════════════════════════════════════════════════════════════════════════════
def page_references():
    render_header()
    st.markdown("## References")
    st.markdown("The following academic and technical references support the theory and methodology of this experiment.")

    refs = [
        {
            "num": 1,
            "title": "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks",
            "authors": "Nils Reimers and Iryna Gurevych",
            "venue": "EMNLP-IJCNLP 2019",
            "url": "https://aclanthology.org/D19-1410/",
            "tag": "Sentence Embeddings",
        },
        {
            "num": 2,
            "title": "Dense Passage Retrieval for Open-Domain Question Answering",
            "authors": "Vladimir Karpukhin et al.",
            "venue": "EMNLP 2020",
            "url": "https://aclanthology.org/2020.emnlp-main.550/",
            "tag": "Dense Retrieval",
        },
        {
            "num": 3,
            "title": "Neural embedding-based indices for semantic search",
            "authors": "Information Processing & Management, Elsevier",
            "venue": "ScienceDirect",
            "url": "https://www.sciencedirect.com/science/article/pii/S0306457318302413",
            "tag": "Semantic Search",
        },
        {
            "num": 4,
            "title": "A review of ranking approaches for semantic search on Web",
            "authors": "Information Processing & Management, Elsevier",
            "venue": "ScienceDirect",
            "url": "https://www.sciencedirect.com/science/article/pii/S0306457313001106",
            "tag": "Information Retrieval",
        },
        {
            "num": 5,
            "title": "MiniLM: Deep Self-Attention Distillation for Task-Agnostic Compression of Pre-Trained Transformers",
            "authors": "Wenhui Wang et al.",
            "venue": "arXiv 2020",
            "url": "https://arxiv.org/abs/2002.10957",
            "tag": "MiniLM",
        },
        {
            "num": 6,
            "title": "RocketQA: An Optimized Training Approach to Dense Passage Retrieval for Open-Domain Question Answering",
            "authors": "Yingqi Qu et al.",
            "venue": "NAACL 2021",
            "url": "https://aclanthology.org/2021.naacl-main.466/",
            "tag": "Dense Retrieval",
        },
        {
            "num": 7,
            "title": "Efficient Passage Retrieval with Hashing for Open-domain Question Answering",
            "authors": "Ikuya Yamada, Akari Asai, Yashar Hajishirzi",
            "venue": "ACL 2021",
            "url": "https://aclanthology.org/2021.acl-short.123/",
            "tag": "Retrieval",
        },
        {
            "num": 8,
            "title": "all-MiniLM-L6-v2 Model Documentation",
            "authors": "Sentence Transformers / Hugging Face",
            "venue": "Hugging Face Hub",
            "url": "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2",
            "tag": "Model Docs",
        },
    ]

    for r in refs:
        st.markdown(f"""
        <div class='card' style='margin-bottom:0.8rem; padding:1rem 1.4rem;'>
          <div style='display:flex; align-items:flex-start; gap:1rem;'>
            <div style='font-size:1.3rem; font-weight:800; color:var(--accent); min-width:2rem;'>[{r['num']}]</div>
            <div style='flex:1;'>
              <div style='font-weight:600; color:var(--text); font-size:0.95rem;'>
                <a href='{r['url']}' target='_blank' style='color:var(--accent); text-decoration:none;'>{r['title']}</a>
              </div>
              <div style='font-size:0.83rem; color:var(--text-secondary); margin-top:2px;'>
                {r['authors']} &nbsp;|&nbsp; <i>{r['venue']}</i>
              </div>
              <div style='margin-top:4px;'>
                <span class='badge badge-blue'>{r['tag']}</span>
                &nbsp;<a href='{r['url']}' target='_blank' style='font-size:0.78rem; color:var(--accent);'>{r['url'][:60]}…</a>
              </div>
            </div>
          </div>
        </div>
        """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════════════════
# SIDEBAR NAVIGATION & ACTIVITY LOGS
# ══════════════════════════════════════════════════════════════════════════════
with st.sidebar:

    st.markdown("<div style='font-weight:700; font-size:0.82rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.4rem;'>Navigation</div>", unsafe_allow_html=True)

    page = st.radio(
        "Navigation",
        [
            "1. Purpose",
            "2. Theory",
            "3. Simulation",
            "4. Quiz",
            "5. Report Generation",
            "6. Certificate",
            "7. References",
        ],
        index=0,
        label_visibility="collapsed",
    )

    st.markdown("""
    <div style='margin-top:1.8rem; padding-top:1rem; border-top:1px solid var(--border);'>
      <div style='display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;'>
        <span style='font-weight:700; font-size:0.82rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em;'>Activity Logs</span>
        <span style='font-size:0.75rem; color:var(--accent); font-weight:600;'>Session</span>
      </div>
    </div>
    """, unsafe_allow_html=True)

    logs = st.session_state.get("activity_logs", [])
    if logs:
        log_items_html = "".join([
            f"<div style='margin-bottom:6px; line-height:1.35;'><span style='color:var(--text-muted); font-size:0.75rem; font-family:monospace;'>[{item['time']}]</span> <span style='color:var(--text); font-size:0.8rem;'>{item['msg']}</span></div>"
            for item in reversed(logs[-12:])
        ])
        st.markdown(f"""
        <div style='max-height:190px; overflow-y:auto; background:var(--surface-alt); border:1px solid var(--border); border-radius:8px; padding:0.6rem 0.8rem;'>
          {log_items_html}
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown("""
        <div style='font-size:0.8rem; color:var(--text-muted); font-style:italic; padding:0.4rem 0;'>
          No activity recorded yet.
        </div>
        """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════════════════
# MAIN ROUTER
# ══════════════════════════════════════════════════════════════════════════════
if page.startswith("1"):
    page_purpose()
elif page.startswith("2"):
    page_theory()
elif page.startswith("3"):
    page_simulation()
elif page.startswith("4"):
    page_quiz()
elif page.startswith("5"):
    page_report()
elif page.startswith("6"):
    page_certificate()
elif page.startswith("7"):
    page_references()

