import os
import re
from datetime import datetime
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st
from fpdf import FPDF
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer, WordNetLemmatizer
from nltk.corpus import wordnet

# --- NLTK Resource Download & Caching ---
@st.cache_resource
def load_nltk_resources():
    resources = [
        'punkt', 
        'stopwords', 
        'wordnet', 
        'omw-1.4', 
        'averaged_perceptron_tagger',
        'averaged_perceptron_tagger_eng'
    ]
    for r in resources:
        try:
            nltk.download(r, quiet=True)
        except Exception:
            pass

load_nltk_resources()

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()
english_stopwords = set(stopwords.words('english'))

def get_wordnet_pos(treebank_tag):
    if treebank_tag.startswith('J'):
        return wordnet.ADJ
    elif treebank_tag.startswith('V'):
        return wordnet.VERB
    elif treebank_tag.startswith('N'):
        return wordnet.NOUN
    elif treebank_tag.startswith('R'):
        return wordnet.ADV
    else:
        return wordnet.NOUN

# ======================================================================================
# 1. EXPERIMENT CONFIGURATION & EDUCATIONAL CONTENT
# ======================================================================================

EXPERIMENT_CONFIG = {
    "title": "Virtual Lab: Text Preprocessing & Token Normalization",
    "department": "Department of Computer Engineering | Natural Language Processing & Information Retrieval",
    "objectives": [
        "Understand the sequential pipeline of textual normalization.",
        "Analyze boundary detection algorithms in tokenization and noise stripping.",
        "Evaluate stop-word filtering based on term-frequency distributions (Zipf's Law / Pareto Distribution).",
        "Contrast rule-based suffix truncation (Stemming) with morphological lexicon lookup (Lemmatization)."
    ]
}

THEORY_CONTENT = {
    "purpose": """
### Purpose
To clean, tokenize, filter, stem, and lemmatize unstructured text using NLP techniques to transform raw data into a standardized format for indexing and vectorization.

#### Target Outcome
Produce a standardized, noise-free tokenized text corpus ready for indexing in search engines, Bag-of-Words (BoW) matrices, TF-IDF feature extraction, or neural embedding models.
""",
    "background": """
### Comprehensive Theoretical Framework
Text preprocessing is the foundational phase in Natural Language Processing (NLP) and Information Retrieval (IR). 
Raw textual data from real-world sources contains noise, structural inconsistencies, and redundant tokens. 
Preprocessing standardizes text to reduce vocabulary size and improve computational efficiency.

#### 1. Text Normalization & Noise Cleaning
* **Case Folding:** Converts all characters to lowercase. This merges *"Apple"* and *"apple"*, reducing overall vocabulary space.
* **Noise Removal:** Uses Regular Expressions (Regex) to strip HTML tags, punctuation marks, special characters, and numerical digits when numeric context is uninformative.

#### 2. Tokenization
Tokenization breaks a continuous stream of text into smaller discrete linguistic units called **tokens** (words, numbers, or symbols). Word tokenization handles word boundaries, contractions (*"don't"* -> *"do"*, *"n't"*), and hyphenated terms.

#### 3. Stop-Word Removal & Pareto Principle (80/20 Rule)
Stop-words are extremely high-frequency functional words (e.g., *"is", "the", "at", "which"*). A small percentage of unique words account for the majority of all written text, carrying minimal domain-specific semantic discrimination power. Removing them reduces inverted index sizes without losing key informational content.

#### 4. Stemming vs. Lemmatization
* **Stemming (Porter Stemmer):** Uses hardcoded heuristic rules to chop off suffixes (e.g., *"running"* -> *"run"*, *"studies"* -> *"studi"*). Fast, but can lead to non-dictionary words.
* **Lemmatization (WordNet):** Uses vocabulary lookup, morphological analysis, and Part-of-Speech (POS) tags to return canonical base forms (lemmas) (e.g., *"studies"* -> *"study"*).
""",
    "procedure": [
        "Step 1: Review the theoretical background, objectives, and comparison matrix.",
        "Step 2: Navigate to the Simulation section in the sidebar menu.",
        "Step 3: Select or input sample raw text and configure the pipeline controls.",
        "Step 4: Run the preprocessing pipeline to observe metric reductions and comparative stemming/lemmatization outputs.",
        "Step 5: Click 'Record Current Trial' to log data into your experimental log book.",
        "Step 6: Complete the assessment Quiz to evaluate your understanding of NLP preprocessing concepts.",
        "Step 7: Open Report Generation, fill in student info, and generate or issue your certificate and downloadable PDF report."
    ],
    "key_terms": {
        "Case Folding": "Lowercasing characters to merge word variants.",
        "Tokenization": "Splitting text into discrete word/symbol units.",
        "Stop-Words": "High-frequency words stripped due to low semantic power.",
        "Stemming": "Heuristic suffix stripping (Porter Stemmer).",
        "Lemmatization": "Morphological dictionary lookup via POS tagging (WordNet)."
    }
}

# --- EXPANDED QUIZ QUESTIONS (10 QUESTIONS) ---
QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "Why are high-frequency stop-words removed during preprocessing?",
        "options": [
            "A) They occur at extremely low frequencies.",
            "B) They occupy top frequency ranks but carry low semantic discrimination power.",
            "C) They cannot be converted into numerical vectors.",
            "D) They break the regex tokenizer parser."
        ],
        "answer_index": 1,
        "explanation": "Stop-words carry minimal domain-specific semantic value despite appearing frequently."
    },
    {
        "id": 2,
        "question": "What is the phenomenon of 'Over-stemming'?",
        "options": [
            "A) When two words with different meanings are chopped to the same root.",
            "B) When a stemmer fails to reduce words of the same root.",
            "C) When text is converted to lowercase twice.",
            "D) When lemmatization uses POS tags improperly."
        ],
        "answer_index": 0,
        "explanation": "Over-stemming occurs when distinct words with different meanings are inappropriately truncated to identical stems (e.g., 'universe' and 'university' both stemming to 'univers')."
    },
    {
        "id": 3,
        "question": "How does Case Folding impact the unique vocabulary size of a corpus?",
        "options": [
            "A) Increases unique vocabulary size.",
            "B) Decreases unique vocabulary size by merging capitalized and lowercase variants.",
            "C) Keeps vocabulary size unchanged.",
            "D) Doubles the memory footprint."
        ],
        "answer_index": 1,
        "explanation": "Standardizing casing merges identical token representations (e.g., 'Apple' and 'apple' become 'apple')."
    },
    {
        "id": 4,
        "question": "What component is strictly required by a Lemmatizer for accurate root extraction?",
        "options": [
            "A) Regular Expression pattern matching.",
            "B) Lexicon dictionary and Part-of-Speech (POS) tags.",
            "C) High GPU memory.",
            "D) BPE token subword splitters."
        ],
        "answer_index": 1,
        "explanation": "Lemmatizers require lexical dictionaries and contextual POS tags to map words to valid lemmas."
    },
    {
        "id": 5,
        "question": "In which NLP task should Stop-Word Removal be avoided?",
        "options": [
            "A) Document Clustering",
            "B) Search Engine Indexing",
            "C) Sentiment Analysis (e.g., detecting 'not happy')",
            "D) Topic Modeling"
        ],
        "answer_index": 2,
        "explanation": "In sentiment analysis, stop-words like 'not' or 'no' drastically alter phrase semantics."
    },
    {
        "id": 6,
        "question": "What is the primary drawback of the Porter Stemmer compared to Lemmatization?",
        "options": [
            "A) It is too slow for large datasets.",
            "B) It relies heavily on external lexicon databases.",
            "C) It uses rule-based heuristics that often produce invalid non-dictionary words.",
            "D) It requires deep learning hardware acceleration."
        ],
        "answer_index": 2,
        "explanation": "Porter Stemmer relies on heuristic suffix truncation rules which can yield invalid English words like 'studi'."
    },
    {
        "id": 7,
        "question": "According to Zipf's Law, what is the mathematical relationship between word frequency and rank?",
        "options": [
            "A) Word frequency is directly proportional to its rank.",
            "B) Word frequency is inversely proportional to its rank.",
            "C) Word frequency increases exponentially with rank.",
            "D) Word frequency is completely independent of rank."
        ],
        "answer_index": 1,
        "explanation": "Zipf's Law states that the frequency of any word is inversely proportional to its rank in the frequency table ($f \\propto 1/r$)."
    },
    {
        "id": 8,
        "question": "What happens if you pass the verb 'meeting' into a Lemmatizer without specifying POS='v'?",
        "options": [
            "A) It will throw a Python SyntaxError.",
            "B) It defaults to Noun (POS='n') and keeps 'meeting' instead of reducing it to 'meet'.",
            "C) It converts 'meeting' into an empty string.",
            "D) It converts 'meeting' into 'met'."
        ],
        "answer_index": 1,
        "explanation": "WordNet Lemmatizer defaults to Noun (POS='n'). 'Meeting' as a noun remains 'meeting', whereas with POS='v' it lemmatizes to 'meet'."
    },
    {
        "id": 9,
        "question": "What is 'Under-stemming' in suffix truncation?",
        "options": [
            "A) When two words that share a common conceptual root are stemmed into different roots.",
            "B) When all stop-words are ignored.",
            "C) When numbers are converted to words.",
            "D) When words are converted to uppercase."
        ],
        "answer_index": 0,
        "explanation": "Under-stemming occurs when words that should be mapped to the same root are left as distinct stems (e.g., 'knavish' and 'knave')."
    },
    {
        "id": 10,
        "question": "Which Regular Expression pattern matches and strips all non-alphabetic characters and numbers from a string?",
        "options": [
            "A) r'[0-9]+'",
            "B) r'[^a-zA-Z\\s]'",
            "C) r'\\b\\w+\\b'",
            "D) r'[a-z]+'"
        ],
        "answer_index": 1,
        "explanation": "The regex `[^a-zA-Z\\s]` matches any character that is NOT an uppercase/lowercase letter or whitespace, allowing easy noise removal."
    }
]

# ======================================================================================
# 2. LAB REPORT & CERTIFICATE PDF EXPORTERS (COMPATIBLE WITH ALL FPDF VERSIONS)
# ======================================================================================

class LabReportPDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}} | Virtual Laboratory Report", align="C")

def generate_pdf_report(student_name: str, student_id: str, date_str: str,
                        trials_df: pd.DataFrame, quiz_score: int, quiz_total: int,
                        student_notes: str) -> bytes:
    pdf = LabReportPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    # Document Title
    pdf.set_text_color(15, 23, 42)
    pdf.set_font("Helvetica", "B", 15)
    pdf.cell(0, 8, EXPERIMENT_CONFIG["title"], align="L", ln=1)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 5, EXPERIMENT_CONFIG["department"], align="L", ln=1)
    pdf.ln(4)

    # Student Info Box
    pdf.set_fill_color(241, 245, 249)
    pdf.set_draw_color(203, 213, 225)
    pdf.rect(10, 26, 190, 22, "FD")

    pdf.set_xy(14, 28)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(38, 5, "Student Name:", 0)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(57, 5, student_name or "N/A", 0)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(35, 5, "Student ID / Roll:", 0)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(50, 5, student_id or "N/A", 1)

    pdf.set_xy(14, 36)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(38, 5, "Experiment Date:", 0)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(57, 5, date_str or datetime.now().strftime("%Y-%m-%d"), 0)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(35, 5, "Quiz Evaluation:", 0)
    pdf.set_font("Helvetica", "B", 9)
    if quiz_score >= max(1, quiz_total // 2):
        pdf.set_text_color(16, 185, 129)
    else:
        pdf.set_text_color(239, 68, 68)
    pdf.cell(50, 5, f"{quiz_score} / {quiz_total} ({int((quiz_score/quiz_total)*100 if quiz_total else 0)}%)", 1)

    pdf.ln(12)

    # 1. Objectives
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(0, 7, "1. Learning Objectives", ln=1)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(51, 65, 85)
    for obj in EXPERIMENT_CONFIG["objectives"]:
        clean_obj = str(obj).replace("$", "").replace("\\", "")
        pdf.cell(5, 5, "-", 0)
        pdf.cell(0, 5, f" {clean_obj}", ln=1)
    pdf.ln(4)

    # 2. Recorded Trials Table
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(0, 7, "2. Recorded Experimental Trials & Pipeline Data", ln=1)

    if trials_df.empty:
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 6, "No simulation trials recorded during this session.", ln=1)
    else:
        pdf.set_fill_color(37, 99, 235)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 8)

        cols = list(trials_df.columns)
        num_cols = len(cols)
        col_w = max(18, int(190 / max(1, num_cols)))

        for c in cols:
            pdf.cell(col_w, 6, str(c)[:14], 1, 0, "C", True)
        pdf.ln()

        pdf.set_fill_color(248, 250, 252)
        pdf.set_text_color(30, 41, 59)
        pdf.set_font("Helvetica", "", 8)
        fill = False

        for _, row in trials_df.iterrows():
            for c in cols:
                val = row[c]
                val_str = f"{val:.2f}" if isinstance(val, float) else str(val)
                pdf.cell(col_w, 5, val_str[:14], 1, 0, "C", fill)
            pdf.ln()
            fill = not fill
    pdf.ln(5)

    # 3. Discussion & Notes
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(0, 7, "3. Observations & Analysis", ln=1)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(51, 65, 85)
    notes_text = student_notes.strip() if student_notes.strip() else (
        "The pipeline successfully normalized unstructured textual inputs, demonstrating how POS-guided "
        "Lemmatization preserves semantic context compared to heuristic Stemming."
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

def generate_certificate_pdf(student_name: str, student_id: str, date_str: str) -> bytes:
    """Generates an official completion certificate as a PDF document."""
    pdf = FPDF(orientation="L", unit="mm", format="A4")
    pdf.add_page()

    # Outer & Inner Decorative Borders
    pdf.set_draw_color(30, 58, 138)  # Deep Blue
    pdf.set_line_width(1.5)          # <--- FIX: changed from set_linewidth
    pdf.rect(8, 8, 281, 194)

    pdf.set_draw_color(191, 219, 254)  # Light Blue Inner Accent
    pdf.set_line_width(0.6)          # <--- FIX: changed from set_linewidth
    pdf.rect(12, 12, 273, 186)

    # Certificate Header
    pdf.set_xy(20, 25)
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(257, 6, "VIRTUAL LABORATORY EXPERIMENTATION", align="C", ln=1)

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(257, 5, EXPERIMENT_CONFIG["department"].upper(), align="C", ln=1)

    pdf.ln(10)

    # Certificate Title
    pdf.set_font("Helvetica", "B", 26)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(257, 12, "CERTIFICATE OF COMPLETION", align="C", ln=1)

    pdf.set_font("Helvetica", "I", 11)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(257, 8, "This is to officially certify that", align="C", ln=1)

    pdf.ln(4)

    # Student Name Block
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(37, 99, 235)  # Royal Blue
    pdf.cell(257, 10, student_name or "Data Analytics Student", align="C", ln=1)

    # Student ID / Roll Line
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(257, 6, f"(Student ID / Roll No: {student_id or 'N/A'})", align="C", ln=1)

    pdf.ln(6)

    # Description Statement
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(51, 65, 85)
    cert_text = (
        f"has successfully performed and recorded experimental trials for the practical simulation on\n"
        f"\"{EXPERIMENT_CONFIG['title']}\"\n"
        f"demonstrating competency in tokenization, stop-word reduction, and morphological normalization."
    )
    pdf.multi_cell(257, 6, cert_text, align="C")

    pdf.ln(15)

    # Footer Metadata & Signatures
    pdf.set_xy(30, 160)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(60, 5, f"Date Issued: {date_str}", align="C", ln=0)

    pdf.set_xy(207, 160)
    pdf.cell(60, 5, "Verified Online", align="C", ln=1)

    # Signature Lines
    pdf.set_draw_color(148, 163, 184)
    pdf.line(30, 175, 90, 175)
    pdf.line(207, 175, 267, 175)

    pdf.set_xy(30, 177)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(60, 4, "Lab Instructor Signature", align="C")

    pdf.set_xy(207, 177)
    pdf.cell(60, 4, "Department Coordinator", align="C")

    return bytes(pdf.output())

# ======================================================================================
# 3. SECTION RENDERERS
# ======================================================================================

def render_theory_section():
    """Renders Section 1: Theory, Purpose, Objectives, Procedure, and References."""
    st.header("Theoretical Framework & Background")
    
    st.markdown(THEORY_CONTENT["purpose"])
    st.markdown(THEORY_CONTENT["background"])

    st.subheader("Learning Objectives")
    for i, obj in enumerate(EXPERIMENT_CONFIG["objectives"]):
        st.write(f"- **Goal {i+1}**: {obj}")

    st.divider()
    st.subheader("Comparison Matrix: Stemming vs. Lemmatization")
    comp_matrix = pd.DataFrame({
        "Feature Parameter": ["Approach", "Output Quality", "Execution Speed", "Language Dictionary", "POS Tag Dependency", "Example ('studies')", "Example ('better')"],
        "Porter Stemmer": ["Heuristic Suffix Rules", "May produce non-words ('studi')", "Extremely Fast", "Not Required", "Independent", "studi", "better"],
        "WordNet Lemmatizer": ["Morphological & Lexical Analysis", "Always valid dictionary words", "Slower (Lookup based)", "Required (WordNet)", "Highly Dependent", "study", "good (with POS='a')"]
    })
    st.table(comp_matrix)

    st.divider()
    st.subheader("Experimental Procedure")
    for step in THEORY_CONTENT["procedure"]:
        st.write(f"- {step}")

    st.divider()
    with st.expander("Key Terminology & Variable Reference"):
        var_df = pd.DataFrame(
            list(THEORY_CONTENT["key_terms"].items()),
            columns=["Term / Concept", "Definition & Operational Role"]
        )
        st.table(var_df)

    with st.expander("References & Academic Literature"):
        st.markdown("""
        1. **Jurafsky, D., & Martin, J. H. (2023).** *Speech and Language Processing (3rd ed. draft)*. Chapter 2: Text Normalization. Pearson Education.
        2. **Manning, C. D., Raghavan, P., & Schütze, H. (2008).** *Introduction to Information Retrieval*. Cambridge University Press.
        3. **Porter, M. F. (1980).** An algorithm for suffix stripping. *Program*, 14(3), 130-137.
        4. **Bird, S., Loper, E., & Klein, E. (2009).** *Natural Language Processing with Python*. O'Reilly Media.
        5. **Miller, G. A. (1995).** WordNet: a lexical database for English. *Communications of the ACM*, 38(11), 39-41.
        """)

def render_simulation_section():
    """Renders Section 2: Interactive Execution Sandbox and Plots."""
    st.header("Interactive Pipeline Simulation Workbench")
    st.info("Configure input raw text and toggle transformation flags to run the preprocessing engine.")

    col_in1, col_in2 = st.columns([1, 1])

    with col_in1:
        st.subheader("1. Input Corpus")
        sample_choice = st.selectbox(
            "Choose a sample dataset or custom:",
            ["Sample 1 (General)", "Sample 2 (Technical)", "Sample 3 (Irregular Forms)", "Custom Entry"]
        )

        preset_texts = {
            "Sample 1 (General)": "The quick brown foxes were jumping over 100 lazy dogs while studying NLP algorithms!",
            "Sample 2 (Technical)": "Text preprocessing cleans, standardizes, and normalizes raw textual datasets efficiently prior to vectorization.",
            "Sample 3 (Irregular Forms)": "The mice were running better than the cats, having studied various computational experiments."
        }

        if sample_choice == "Custom Entry":
            input_text = st.text_area("Input Raw Text:", "Preprocessing raw text data is essential for building accurate machine learning models.", height=110)
        else:
            input_text = st.text_area("Input Raw Text:", preset_texts[sample_choice], height=110)

    with col_in2:
        st.subheader("2. Pipeline Controls")
        col_c1, col_c2 = st.columns(2)
        with col_c1:
            opt_lower = st.checkbox("Lowercase Text", value=True)
            opt_punct = st.checkbox("Remove Noise & Numbers", value=True)
        with col_c2:
            opt_stop = st.checkbox("Remove Stop-words", value=True)
            opt_pos = st.checkbox("POS-Guided Lemmatization", value=True)

    st.divider()

    # Engine Execution
    text_processed = input_text
    if opt_lower:
        text_processed = text_processed.lower()
    if opt_punct:
        text_processed = re.sub(r'[^a-zA-Z\s]', '', text_processed)

    raw_tokens = text_processed.split()

    if opt_stop:
        final_tokens = [w for w in raw_tokens if w not in english_stopwords]
    else:
        final_tokens = raw_tokens

    stemmed_tokens = [stemmer.stem(w) for w in final_tokens]

    if opt_pos:
        pos_tags = nltk.pos_tag(final_tokens) if final_tokens else []
        lemmatized_tokens = [lemmatizer.lemmatize(w, get_wordnet_pos(tag)) for w, tag in pos_tags]
    else:
        lemmatized_tokens = [lemmatizer.lemmatize(w) for w in final_tokens]

    orig_char_count = len(input_text)
    orig_token_count = len(input_text.split())
    filtered_token_count = len(final_tokens)
    tokens_removed = orig_token_count - filtered_token_count

    # Metrics
    st.subheader("Processing Metrics")
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Original Characters", orig_char_count)
    m2.metric("Raw Token Count", orig_token_count)
    m3.metric("Filtered Tokens", filtered_token_count)
    m4.metric("Tokens Removed", tokens_removed)

    st.divider()

    # Graphical Reduction Plot
    st.subheader("Token Reduction & Transformation Breakdown")
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=["Raw Tokens", "Filtered Tokens", "Tokens Removed"],
        y=[orig_token_count, filtered_token_count, max(0, tokens_removed)],
        marker_color=["#1e3c72", "#2a5298", "#ef4444"]
    ))
    fig.update_layout(
        title="Corpus Volume Reduction",
        yaxis_title="Token Count",
        height=320,
        margin=dict(l=20, r=20, t=40, b=20)
    )
    st.plotly_chart(fig, use_container_width=True)

    # Output Visualizers
    col_res1, col_res2 = st.columns(2)
    with col_res1:
        st.subheader("Sequential Transformations")
        st.caption("1. Original Text:")
        st.info(input_text)
        st.caption("2. Cleaned / Noise-Stripped Text:")
        st.info(text_processed)
        st.caption("3. Filtered Token List:")
        st.write(final_tokens)

    with col_res2:
        st.subheader("Stemming vs. Lemmatization Output")
        df_comp = pd.DataFrame({
            "Cleaned Token": final_tokens,
            "Porter Stemmer": stemmed_tokens,
            "WordNet Lemmatizer": lemmatized_tokens
        })
        st.dataframe(df_comp, use_container_width=True, height=250)

    st.subheader("Final Processed Corpus (Lemmatized Output)")
    st.code(" ".join(lemmatized_tokens) if lemmatized_tokens else "[Empty Token Stream]", language="text")

    # Data Logger
    st.divider()
    st.subheader("Experimental Data Log Book")
    col_log1, col_log2 = st.columns([1.5, 3.5])

    with col_log1:
        st.caption("Capture current parameters and metrics into your session trial table:")
        if st.button("Record Current Trial", type="primary", use_container_width=True):
            trial_record = {
                "Trial #": len(st.session_state["trials"]) + 1,
                "Sample Input": input_text[:20] + "..." if len(input_text) > 20 else input_text,
                "Raw Tokens": orig_token_count,
                "Filtered Tokens": filtered_token_count,
                "Removed Tokens": tokens_removed,
                "Stopwords Removed": "Yes" if opt_stop else "No",
                "POS Lemmatized": "Yes" if opt_pos else "No",
                "Timestamp": datetime.now().strftime("%H:%M:%S")
            }
            st.session_state["trials"].append(trial_record)
            st.session_state["last_sim_data"] = {
                "input_text": input_text,
                "final_tokens": final_tokens,
                "lemmatized_tokens": lemmatized_tokens,
                "tokens_removed": tokens_removed
            }
            st.toast(f"Trial #{trial_record['Trial #']} successfully saved!")

        if st.button("Clear Logged Trials", use_container_width=True):
            st.session_state["trials"] = []
            st.toast("Trial log cleared.")

    with col_log2:
        if st.session_state["trials"]:
            df_trials = pd.DataFrame(st.session_state["trials"])
            st.dataframe(df_trials, use_container_width=True, hide_index=True)
            csv_data = df_trials.to_csv(index=False).encode('utf-8')
            st.download_button(
                "Download Trials as CSV",
                data=csv_data,
                file_name="nlp_preprocessing_trials.csv",
                mime="text/csv",
                use_container_width=True
            )
        else:
            st.info("No trials recorded yet. Click 'Record Current Trial' to log experimental data.")

def render_quiz_section():
    """Renders Section 3: Assessment Quiz with Self-Grading and Feedback."""
    st.header("Concept Assessment Quiz")
    st.write("Answer the 10 conceptual questions below to evaluate your understanding of text normalization.")

    with st.form("lab_quiz_form"):
        user_responses = {}
        for q in QUIZ_QUESTIONS:
            st.subheader(f"Question {q['id']}")
            st.write(q["question"])
            selected = st.radio(
                label=f"Options for Question {q['id']}:",
                options=q["options"],
                index=st.session_state["quiz_answers"].get(q["id"], 0),
                key=f"quiz_radio_{q['id']}",
                label_visibility="collapsed"
            )
            user_responses[q["id"]] = q["options"].index(selected)

        submitted = st.form_submit_button("Submit Quiz for Grading", type="primary")

    if submitted:
        score = 0
        st.session_state["quiz_answers"] = user_responses
        st.session_state["quiz_submitted"] = True

        st.divider()
        st.subheader("Evaluation Results and Feedback")
        for q in QUIZ_QUESTIONS:
            user_ans = user_responses.get(q["id"])
            correct_ans = q["answer_index"]
            if user_ans == correct_ans:
                score += 1
                st.success(f"**Question {q['id']}: Correct!**\n\n_{q['explanation']}_")
            else:
                st.error(f"**Question {q['id']}: Incorrect.** (Your answer: {q['options'][user_ans]})\n\n"
                         f"**Correct Answer:** {q['options'][correct_ans]}\n\n"
                         f"**Reasoning:** _{q['explanation']}_")

        st.session_state["quiz_score"] = score
        perc = (score / len(QUIZ_QUESTIONS)) * 100
        st.info(f"Final Score: **{score} / {len(QUIZ_QUESTIONS)}** ({perc:.0f}%)")

    elif st.session_state.get("quiz_submitted", False):
        st.success(f"Quiz already submitted. Current score: **{st.session_state.get('quiz_score', 0)} / {len(QUIZ_QUESTIONS)}**")

def render_report_section():
    """Renders Section 4: Lab Report Generator and Completion Certificate."""
    st.header("Report Generation & Certificate")
    st.write("Compile your details, recorded trials, and quiz evaluation into an official PDF report or completion certificate.")

    col1, col2, col3 = st.columns(3)
    with col1:
        student_name = st.text_input("Student Name", value=st.session_state["student_info"].get("name", "Data Analytics Student"))
    with col2:
        student_id = st.text_input("Student Roll / ID", value=st.session_state["student_info"].get("id", "NLP-LAB-01"))
    with col3:
        lab_date = st.date_input("Experiment Date", value=datetime.now())

    st.session_state["student_info"]["name"] = student_name
    st.session_state["student_info"]["id"] = student_id
    st.session_state["student_info"]["date"] = str(lab_date)

    st.subheader("Discussion & Observations")
    student_notes = st.text_area(
        "Enter your interpretation of results, observations, and conclusions:",
        value=st.session_state.get("student_notes", (
            "The preprocessing pipeline successfully extracted tokens and normalized morphological variants. "
            "POS-guided Lemmatization preserved semantic context compared to Porter Stemming, while stop-word "
            "removal significantly reduced total token volume."
        )),
        height=100
    )
    st.session_state["student_notes"] = student_notes

    trials_df = pd.DataFrame(st.session_state["trials"]) if st.session_state["trials"] else pd.DataFrame()

    st.divider()
    st.subheader("Report Summary Preview")
    st.write(f"**Experiment:** {EXPERIMENT_CONFIG['title']}")
    st.write(f"**Student:** {student_name} | **ID:** {student_id} | **Date:** {lab_date}")
    st.write(f"**Quiz Score:** {st.session_state.get('quiz_score', 0)} / {len(QUIZ_QUESTIONS)}")

    if not trials_df.empty:
        st.dataframe(trials_df, hide_index=True, use_container_width=True)
    else:
        st.info("Note: You have not recorded any trials in the Simulation tab yet. Your report will show 0 recorded trials.")

    # Generate Report PDF bytes
    report_pdf_bytes = generate_pdf_report(
        student_name=student_name,
        student_id=student_id,
        date_str=str(lab_date),
        trials_df=trials_df,
        quiz_score=st.session_state.get("quiz_score", 0),
        quiz_total=len(QUIZ_QUESTIONS),
        student_notes=student_notes
    )

    # Generate Certificate PDF bytes
    cert_pdf_bytes = generate_certificate_pdf(
        student_name=student_name,
        student_id=student_id,
        date_str=str(lab_date)
    )

    os.makedirs("static", exist_ok=True)
    with open("static/lab_report.pdf", "wb") as f:
        f.write(report_pdf_bytes)
    with open("static/lab_certificate.pdf", "wb") as f:
        f.write(cert_pdf_bytes)

    st.divider()
    st.subheader("1. Download Official Lab Report (.pdf)")

    col_btn1, col_btn2 = st.columns(2)
    with col_btn1:
        st.link_button(
            "Open / Download Report PDF",
            url="/app/static/lab_report.pdf",
            type="primary",
            use_container_width=True
        )

    with col_btn2:
        st.download_button(
            label="Download lab_report.pdf",
            data=report_pdf_bytes,
            file_name="NLP_Text_Normalization_Report.pdf",
            mime="application/pdf",
            key="stream_pdf_btn",
            use_container_width=True
        )

    st.divider()
    st.subheader("2. Virtual Lab Completion Certificate (.pdf)")
    
    if st.session_state["trials"]:
        st.success("CERTIFICATE READY FOR DOWNLOAD")
        st.markdown(f"""
        **Department of Computer Engineering - Virtual Laboratory**  
        *This certifies that **{student_name}** ({student_id}) has successfully completed the practical simulation for **Text Preprocessing & Token Normalization Pipeline** on {lab_date}.*
        """)

        col_c1, col_c2 = st.columns(2)
        with col_c1:
            st.download_button(
                label="Download Certificate (.pdf)",
                data=cert_pdf_bytes,
                file_name=f"Certificate_{student_name.replace(' ', '_')}.pdf",
                mime="application/pdf",
                key="download_cert_btn",
                type="primary",
                use_container_width=True
            )
        with col_c2:
            st.link_button(
                "Open Certificate in Browser",
                url="/app/static/lab_certificate.pdf",
                use_container_width=True
            )
    else:
        st.warning("Please run and record at least one simulation trial in the 'Simulation' tab prior to downloading your completion certificate.")

# ======================================================================================
# 4. MAIN ENTRYPOINT & NAVIGATION
# ======================================================================================

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
            "name": "Data Analytics Student",
            "id": "NLP-LAB-01",
            "date": str(datetime.now().date())
        }
    if "student_notes" not in st.session_state:
        st.session_state["student_notes"] = ""

def main():
    st.set_page_config(
        page_title="Virtual Lab | Text Normalization",
        page_icon="🔬",
        layout="wide"
    )

    init_session_state()

    # Native Title
    st.title(EXPERIMENT_CONFIG["title"])
    st.caption(EXPERIMENT_CONFIG["department"])

    # Navigation Sidebar
    section = st.sidebar.radio(
        "Lab Navigator",
        options=["Theory", "Simulation", "Quiz", "Report Generation"]
    )

    st.sidebar.divider()
    st.sidebar.subheader("Progress Tracker")
    quiz_status = "Done" if st.session_state.get("quiz_submitted", False) else "Pending"
    st.sidebar.write(f"- **Quiz Status:** {quiz_status}")
    if st.session_state.get("quiz_submitted", False):
        st.sidebar.write(f"- **Quiz Score:** `{st.session_state.get('quiz_score', 0)} / {len(QUIZ_QUESTIONS)}`")
    st.sidebar.write(f"- **Logged Trials:** `{len(st.session_state['trials'])}`")

    # Section Dispatcher
    if section == "Theory":
        render_theory_section()
    elif section == "Simulation":
        render_simulation_section()
    elif section == "Quiz":
        render_quiz_section()
    elif section == "Report Generation":
        render_report_section()

if __name__ == "__main__":
    main()