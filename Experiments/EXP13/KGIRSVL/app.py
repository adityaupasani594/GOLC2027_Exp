"""
Knowledge Graph and Information Retrieval Systems (KGIRS)
Virtual Laboratory Experiment: Hybrid Keyword and Semantic Retrieval

Mandatory 4-Section Baseline Structure:
  1. Theory: Concepts, equations, learning objectives, procedure, and terminology.
  2. Simulation: Interactive setup, BM25 Lexical, SentenceTransformers, Hybrid fusion, X-Ray, Rank shifts, Alpha sensitivity curve, and Trial logger.
  3. Quiz: Self-grading KGIRS conceptual assessment with instant feedback.
  4. Report Generation: Student info, recorded trial log, observations, and downloadable PDF report via fpdf2.
"""

from datetime import datetime
import streamlit as st

from engine.data_loader import load_scifact_data
from engine.keyword_retriever import get_keyword_retriever
from engine.semantic_retriever import get_semantic_retriever
from engine.hybrid_retriever import HybridRetriever

from ui.theory import render_theory_section
from ui.retrieval_lab import render_retrieval_lab_section
from ui.quiz import render_quiz_section
from ui.report import render_report_section


EXPERIMENT_CONFIG = {
    "title": "Experiment: Hybrid Keyword and Semantic Retrieval",
    "subject": "Knowledge Graph and Information Retrieval Systems (KGIRS)",
    "outcome": "Improved retrieval performance through complementary retrieval strategies."
}


def init_session_state():
    """Initializes Streamlit session state variables."""
    if "trials" not in st.session_state:
        st.session_state["trials"] = []
    if "quiz_answers" not in st.session_state:
        st.session_state["quiz_answers"] = {}
    if "quiz_submitted" not in st.session_state:
        st.session_state["quiz_submitted"] = False
    if "quiz_score" not in st.session_state:
        st.session_state["quiz_score"] = 0
    if "student_info" not in st.session_state:
        st.session_state["student_info"] = {
            "name": "Student Name",
            "id": "KGIRS-001",
            "class": "BE Comp A",
            "date": str(datetime.now().date())
        }
    if "student_notes" not in st.session_state:
        st.session_state["student_notes"] = ""


def main():
    st.set_page_config(
        page_title="KGIRS Virtual Lab: Hybrid Retrieval",
        page_icon="🔍",
        layout="wide"
    )

    init_session_state()

    # Native Streamlit Header
    st.title(EXPERIMENT_CONFIG["title"])
    st.caption(f"Course: **{EXPERIMENT_CONFIG['subject']}** | Outcome: _{EXPERIMENT_CONFIG['outcome']}_")
    st.divider()

    # Navigation Sidebar (Mandatory Professor's 4 Sections)
    section = st.sidebar.radio(
        "Lab Navigator",
        options=["Theory", "Simulation", "Quiz", "Report Generation"]
    )

    st.sidebar.divider()
    st.sidebar.subheader("Session Progress")
    recorded_trials_count = len(st.session_state.get("trials", []))
    st.sidebar.write(f"- **Recorded Trials:** `{recorded_trials_count}`")
    quiz_status = "Completed" if st.session_state.get("quiz_submitted", False) else "Pending"
    st.sidebar.write(f"- **Quiz Status:** `{quiz_status}`")
    if st.session_state.get("quiz_submitted", False):
        st.sidebar.write(f"- **Quiz Score:** `{st.session_state.get('quiz_score', 0)} / 10`")

    # Load Data & Search Engines
    corpus, queries, qrels, categorized_queries = load_scifact_data()
    kw_retriever = get_keyword_retriever(corpus)
    sem_retriever = get_semantic_retriever(corpus)
    hybrid_retriever = HybridRetriever(kw_retriever, sem_retriever, corpus)

    # Section Dispatcher
    if section == "Theory":
        render_theory_section()
    elif section == "Simulation":
        render_retrieval_lab_section(
            corpus, queries, qrels, categorized_queries,
            kw_retriever, sem_retriever, hybrid_retriever
        )
    elif section == "Quiz":
        render_quiz_section()
    elif section == "Report Generation":
        render_report_section()


if __name__ == "__main__":
    main()
