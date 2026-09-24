"""
UI Renderer for Section 4: Report Generation with Guaranteed PDF Export via fpdf2 (BM25 Framework)
"""

import os
from datetime import datetime
import pandas as pd
import streamlit as st
from fpdf import FPDF


class LabReportPDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}} | KGIRS Virtual Laboratory Report", align="C")


def generate_pdf_report(student_name: str, student_id: str, student_class: str,
                        date_str: str, trials_df: pd.DataFrame, quiz_score: int,
                        quiz_total: int, student_notes: str) -> bytes:
    """Compiles experiment benchmark records into an official PDF report document."""
    pdf = LabReportPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    # Title
    pdf.set_text_color(15, 23, 42)
    pdf.set_font("Helvetica", "B", 15)
    pdf.cell(0, 8, "KGIRS Virtual Lab: Hybrid Keyword and Semantic Retrieval", align="L", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    # Student & Session Info Box
    pdf.set_fill_color(241, 245, 249)
    pdf.set_draw_color(203, 213, 225)
    pdf.rect(10, 20, 190, 26, "FD")

    pdf.set_xy(14, 22)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(30, 5, "Student Name:", 0)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(60, 5, student_name or "N/A", 0)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(35, 5, "Student ID / Roll:", 0)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(50, 5, student_id or "N/A", 1)

    pdf.set_xy(14, 29)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(30, 5, "Class / Division:", 0)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(60, 5, student_class or "N/A", 0)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(35, 5, "Experiment Date:", 0)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(50, 5, date_str or datetime.now().strftime("%Y-%m-%d"), 1)

    pdf.set_xy(14, 36)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(30, 5, "Quiz Evaluation:", 0)
    pdf.set_font("Helvetica", "B", 9)
    if quiz_score >= max(1, quiz_total // 2):
        pdf.set_text_color(16, 185, 129)
    else:
        pdf.set_text_color(239, 68, 68)
    pdf.cell(60, 5, f"{quiz_score} / {quiz_total} ({int((quiz_score/quiz_total)*100 if quiz_total else 0)}%)", 0)

    pdf.ln(14)

    # 1. Objectives
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(0, 7, "1. Experiment Objectives & Scope", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(51, 65, 85)
    objs = [
        "Evaluate BM25 lexical search (Okapi BM25) vs dense semantic search (Sentence Transformers all-MiniLM-L6-v2).",
        "Implement Min-Max score normalization and convex score fusion: Hybrid = alpha * BM25 + (1-alpha) * Semantic.",
        "Perform IR benchmark evaluation (Precision@K, Recall@K, F1@K, MRR@K, nDCG@K) using BEIR SciFact dataset."
    ]
    for obj in objs:
        pdf.cell(5, 5, "-", 0)
        pdf.cell(0, 5, f" {obj}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    # 2. Recorded Trials Table
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(0, 7, "2. Recorded Experimental Session Data", new_x="LMARGIN", new_y="NEXT")

    if trials_df.empty:
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 6, "No simulation trials recorded during this experimental session.", new_x="LMARGIN", new_y="NEXT")
    else:
        pdf.set_fill_color(37, 99, 235)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 7)

        # Select key columns for PDF space
        display_cols = [c for c in ["Trial #", "Query ID", "alpha (BM25 Wt)", "BM25 k1", "Top-K", "Top Score", "P@10", "R@10", "F1@10", "MRR@10", "nDCG@10"] if c in trials_df.columns]
        if not display_cols:
            display_cols = list(trials_df.columns)[:8]

        num_cols = len(display_cols)
        col_w = max(16, int(190 / max(1, num_cols)))

        for c in display_cols:
            pdf.cell(col_w, 6, str(c)[:12], 1, 0, "C", True)
        pdf.ln()

        pdf.set_fill_color(248, 250, 252)
        pdf.set_text_color(30, 41, 59)
        pdf.set_font("Helvetica", "", 7)
        fill = False

        for _, row in trials_df.iterrows():
            for c in display_cols:
                val = row[c]
                val_str = f"{val:.3f}" if isinstance(val, float) else str(val)
                pdf.cell(col_w, 5, val_str[:12], 1, 0, "C", fill)
            pdf.ln()
            fill = not fill
    pdf.ln(5)

    # 3. Observations & Notes
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(0, 7, "3. Observations, Analysis & Discussion", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(51, 65, 85)
    notes_text = student_notes.strip() if student_notes.strip() else (
        "The experimental trials demonstrated that hybrid score fusion (combining BM25 lexical matching and "
        "SentenceTransformer dense vector similarity) consistently yielded superior IR benchmark performance "
        "(higher Precision@K, Recall@K, and nDCG@K) compared to either BM25 or semantic retrieval alone."
    )
    pdf.multi_cell(0, 5, notes_text)
    pdf.ln(8)

    # Sign-off line
    pdf.set_draw_color(180, 180, 180)
    pdf.line(130, pdf.get_y() + 15, 190, pdf.get_y() + 15)
    pdf.set_xy(130, pdf.get_y() + 17)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(60, 4, "Instructor / Student Signature", align="C")

    return bytes(pdf.output())


def render_report_section():
    """Renders Section 4: Report Generation."""
    st.header("Lab Report Generation")
    st.write("Compile your student details, recorded experimental trials, and quiz evaluation into an official downloadable PDF report.")

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        student_name = st.text_input("Student Name", value=st.session_state["student_info"].get("name", "Student Name"))
    with col2:
        student_id = st.text_input("Roll No / ID", value=st.session_state["student_info"].get("id", "KGIRS-001"))
    with col3:
        student_class = st.text_input("Class / Division", value=st.session_state["student_info"].get("class", "BE Comp A"))
    with col4:
        lab_date = st.date_input("Experiment Date", value=datetime.now())

    st.session_state["student_info"]["name"] = student_name
    st.session_state["student_info"]["id"] = student_id
    st.session_state["student_info"]["class"] = student_class
    st.session_state["student_info"]["date"] = str(lab_date)

    st.subheader("Observations, Interpretation & Discussion")
    student_notes = st.text_area(
        "Enter your interpretation of retrieval results, alpha weight sensitivity observations, and conclusions:",
        value=st.session_state.get("student_notes", (
            "The experimental trials demonstrated that hybrid score fusion (combining BM25 lexical matching and "
            "SentenceTransformer dense vector similarity) consistently yielded superior IR benchmark performance "
            "(higher Precision@K, Recall@K, and nDCG@K) compared to either BM25 or semantic retrieval alone."
        )),
        height=120
    )
    st.session_state["student_notes"] = student_notes

    trials_df = pd.DataFrame(st.session_state["trials"]) if st.session_state["trials"] else pd.DataFrame()

    st.divider()
    st.subheader("Report Summary Preview")
    st.write(f"**Experiment:** Hybrid Keyword and Semantic Retrieval using BM25 and embedding-based semantic search.")
    st.write(f"**Student:** {student_name} | **ID:** {student_id} | **Class:** {student_class} | **Date:** {lab_date}")
    st.write(f"**Quiz Evaluation Score:** {st.session_state.get('quiz_score', 0)} / 10")

    if not trials_df.empty:
        st.dataframe(trials_df, hide_index=True, use_container_width=True)
    else:
        st.info("Note: You have not recorded any trials in the Simulation tab yet. Your report will indicate 0 recorded trials.")

    # Generate PDF bytes
    pdf_bytes = generate_pdf_report(
        student_name=student_name,
        student_id=student_id,
        student_class=student_class,
        date_str=str(lab_date),
        trials_df=trials_df,
        quiz_score=st.session_state.get("quiz_score", 0),
        quiz_total=10,
        student_notes=student_notes
    )

    # Save to static directory for direct download link
    os.makedirs("static", exist_ok=True)
    with open("static/lab_report.pdf", "wb") as f:
        f.write(pdf_bytes)
    with open("lab_report.pdf", "wb") as f:
        f.write(pdf_bytes)

    st.divider()
    st.subheader("Download Official PDF Report")

    col_btn1, col_btn2 = st.columns(2)
    with col_btn1:
        st.link_button(
            "Open / View PDF Document",
            url="/app/static/lab_report.pdf",
            type="primary",
            use_container_width=True
        )

    with col_btn2:
        st.download_button(
            label="Download lab_report.pdf",
            data=pdf_bytes,
            file_name=f"hybrid_retrieval_report_{student_id}.pdf",
            mime="application/pdf",
            key="pdf_download_btn",
            use_container_width=True
        )
