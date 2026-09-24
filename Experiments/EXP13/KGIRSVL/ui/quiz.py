"""
UI Renderer for Section 3: Concept Assessment Quiz (KGIRS Domain Specific - BM25 & Hybrid IR)
"""

import streamlit as st

QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "What is Okapi BM25 in Information Retrieval?",
        "options": [
            "A) A probabilistic lexical retrieval model that evaluates term frequency saturation and document length normalization",
            "B) A dense neural network encoder generating 384-dimensional vector embeddings",
            "C) A database query language used exclusively for graph databases",
            "D) An image compression algorithm for scientific figures"
        ],
        "answer_index": 0,
        "explanation": "Okapi BM25 is a non-linear probabilistic lexical search function that scores documents based on matched query terms, term saturation (k1), and length penalty (b)."
    },
    {
        "id": 2,
        "question": "In the BM25 formula, what is the primary role of hyperparameter k1?",
        "options": [
            "A) It controls term frequency saturation, capping the marginal score gain as term repetitions increase",
            "B) It sets the exact dimension of the dense vector space",
            "C) It completely disables document length normalization",
            "D) It converts negative numbers into positive percentages"
        ],
        "answer_index": 0,
        "explanation": "k1 governs term frequency saturation. As f(t,d) increases, score contribution approaches a finite ceiling rather than growing linearly indefinitely."
    },
    {
        "id": 3,
        "question": "How does hyperparameter b influence document length normalization in BM25 scoring?",
        "options": [
            "A) b = 1.0 applies full length normalization penalty to verbose documents; b = 0.0 disables length normalization completely",
            "B) b = 0.0 penalizes short documents and rewards long documents",
            "C) b multiplies all BM25 scores by 100%",
            "D) b is only used when evaluating image search results"
        ],
        "answer_index": 0,
        "explanation": "b controls document length normalization penalty. When b > 0, longer documents are scaled down so that verbose texts do not rank highly merely by accumulating words."
    },
    {
        "id": 4,
        "question": "Why must raw BM25 scores and Dense Semantic scores be normalized (e.g. Min-Max scaling) prior to hybrid score fusion?",
        "options": [
            "A) Because raw BM25 scores (ranging from 0 to 30+) and dense cosine similarity scores (ranging from -1 to 1) belong to different distributions, which would cause BM25 to dominate unfairly",
            "B) Because dense vectors cannot be added to scalar numbers",
            "C) Score normalization is mathematically unnecessary for hybrid search",
            "D) To convert document IDs into alphabetical order"
        ],
        "answer_index": 0,
        "explanation": "Raw BM25 and dense similarity scores have unequal scale bounds. Min-Max normalization rescales both to [0, 1] so that parameter \u03b1 fairly weights their relative contributions."
    },
    {
        "id": 5,
        "question": "In the hybrid score equation Hybrid Score = \u03b1 \u00d7 S_BM25 + (1-\u03b1) \u00d7 S_sem, what occurs when \u03b1 = 0.0?",
        "options": [
            "A) The system performs 100% Dense Semantic vector retrieval using Sentence Transformers",
            "B) The system performs 100% Lexical BM25 retrieval",
            "C) All document scores evaluate to zero",
            "D) The system randomly shuffles document rankings"
        ],
        "answer_index": 0,
        "explanation": "When \u03b1 = 0.0, the BM25 contribution becomes zero, resulting in pure dense semantic vector retrieval."
    },
    {
        "id": 6,
        "question": "Which retrieval paradigm handles the 'Vocabulary Mismatch Problem' (synonyms/paraphrasing) most effectively?",
        "options": [
            "A) Dense Semantic retrieval using SentenceTransformers",
            "B) Exact string keyword matching",
            "C) BM25 lexical search",
            "D) Sorting documents by publication date"
        ],
        "answer_index": 0,
        "explanation": "Dense semantic encoders map queries and documents into a shared continuous vector space, capturing conceptual meaning even when exact terms differ."
    },
    {
        "id": 7,
        "question": "In what search scenario does Lexical BM25 typically outperform Dense Semantic retrieval?",
        "options": [
            "A) Searching for rare medical model codes, exact gene acronyms, or specific technical jargon",
            "B) Searching for broad abstract concepts like 'feeling tired'",
            "C) Processing foreign language translations",
            "D) Summarizing long textbook chapters"
        ],
        "answer_index": 0,
        "explanation": "Lexical BM25 excels at exact token matching for precise jargon, model codes, and rare proper nouns that neural encoders might smooth out."
    },
    {
        "id": 8,
        "question": "What does Precision@K measure in an Information Retrieval evaluation?",
        "options": [
            "A) The proportion of top-K retrieved documents that match ground-truth relevance annotations",
            "B) The proportion of all relevant corpus documents retrieved in top-K",
            "C) The total time in milliseconds taken to execute a query",
            "D) The average word count of top-K abstracts"
        ],
        "answer_index": 0,
        "explanation": "Precision@K is defined as (Relevant Documents in Top-K) / K."
    },
    {
        "id": 9,
        "question": "If a relevant ground-truth document appears at rank #4 in search results and no relevant documents appear at ranks #1, #2, or #3, what is the Reciprocal Rank (RR)?",
        "options": [
            "A) 0.25 (1/4)",
            "B) 4.0",
            "C) 0.75",
            "D) 0.0"
        ],
        "answer_index": 0,
        "explanation": "Reciprocal Rank is 1 / (rank of first relevant document). For rank #4, RR = 1/4 = 0.25."
    },
    {
        "id": 10,
        "question": "Why does Normalized Discounted Cumulative Gain (nDCG@K) apply logarithmic rank discounting log2(i+1)?",
        "options": [
            "A) To penalize relevant documents that appear further down in the rank list",
            "B) To increase the score of low-ranking documents",
            "C) To convert scores into decibels",
            "D) To simplify vector matrix multiplication"
        ],
        "answer_index": 0,
        "explanation": "Logarithmic discounting reflects user behavior: users value relevant documents much more highly when they appear near top positions (e.g. rank #1 vs rank #10)."
    }
]


def render_quiz_section():
    """Renders Section 3: Assessment Quiz."""
    st.header("Concept Assessment Quiz")
    st.write("Answer the conceptual questions below to test your understanding of BM25 Lexical & Dense Semantic Hybrid IR.")

    with st.form("kgirs_quiz_form"):
        user_responses = {}
        for q in QUIZ_QUESTIONS:
            st.subheader(f"Question {q['id']}")
            st.write(f"**{q['question']}**")
            selected = st.radio(
                label=f"Options for Question {q['id']}:",
                options=q["options"],
                index=st.session_state["quiz_answers"].get(q["id"], 0),
                key=f"quiz_radio_{q['id']}",
                label_visibility="collapsed"
            )
            user_responses[q["id"]] = q["options"].index(selected)
            st.divider()

        submitted = st.form_submit_button("Submit Quiz for Grading", type="primary")

    if submitted:
        score = 0
        st.session_state["quiz_answers"] = user_responses
        st.session_state["quiz_submitted"] = True

        st.subheader("Evaluation Results and Detailed Pedagogical Feedback")
        for q in QUIZ_QUESTIONS:
            user_ans = user_responses.get(q["id"])
            correct_ans = q["answer_index"]
            if user_ans == correct_ans:
                score += 1
                st.success(f"**Question {q['id']}: Correct!**\n\n_{q['explanation']}_")
            else:
                st.error(
                    f"**Question {q['id']}: Incorrect.** (Your choice: {q['options'][user_ans]})\n\n"
                    f"**Correct Answer:** {q['options'][correct_ans]}\n\n"
                    f"**Explanation:** _{q['explanation']}_"
                )

        st.session_state["quiz_score"] = score
        perc = (score / len(QUIZ_QUESTIONS)) * 100
        st.info(f"Final Score: **{score} / {len(QUIZ_QUESTIONS)}** ({perc:.0f}%)")

    elif st.session_state.get("quiz_submitted", False):
        st.success(f"Quiz already submitted. Current score: **{st.session_state.get('quiz_score', 0)} / {len(QUIZ_QUESTIONS)}**")
