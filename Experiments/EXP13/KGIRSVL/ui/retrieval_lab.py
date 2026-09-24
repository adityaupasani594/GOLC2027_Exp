"""
UI Renderer for Section 2: Interactive Retrieval Lab (Simulation) using BM25 & Semantic Hybrid Fusion
"""

from datetime import datetime
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import streamlit as st

from engine.evaluation import evaluate_query_retrieval, evaluate_weight_sensitivity


def render_retrieval_lab_section(corpus, queries, qrels, categorized_queries, kw_retriever, sem_retriever, hybrid_retriever):
    """Renders the complete interactive simulation tab."""
    st.header("Interactive Retrieval Lab & Simulation")
    st.caption("Benchmark: BEIR SciFact Real Scientific Corpus (5,183 Documents)")

    # ----------------------------------------------------------------------------------
    # 1. CONTROLS PANEL
    # ----------------------------------------------------------------------------------
    st.subheader("1. Experiment Setup & Query Selection")
    
    col_q1, col_q2 = st.columns([1.5, 2.5])
    
    with col_q1:
        query_mode = st.radio(
            "Query Input Mode",
            options=["SciFact Benchmark Query", "Custom Query Input"],
            horizontal=True
        )

    with col_q2:
        if query_mode == "SciFact Benchmark Query":
            category = st.selectbox("Query Category", options=list(categorized_queries.keys()))
            cat_queries = categorized_queries[category]
            q_options = [f"ID: {item['id']} | {item['text'][:80]}..." for item in cat_queries]
            selected_idx = st.selectbox("Select Evaluation Query", options=range(len(q_options)), format_func=lambda i: q_options[i])
            selected_item = cat_queries[selected_idx]
            query_id = selected_item["id"]
            query_text = selected_item["text"]
            current_qrels = selected_item["qrels"]
        else:
            query_id = "CUSTOM"
            query_text = st.text_input("Enter your custom search query", value="Vitamin D deficiency correlates with severe COVID-19 outcome.")
            current_qrels = {}

    st.info(f"**Active Query [{query_id}]**: _{query_text}_")

    st.divider()
    st.subheader("2. Hybrid & BM25 Retrieval Hyperparameters")
    
    col_c1, col_c2, col_c3, col_c4 = st.columns([2, 1, 1, 1])
    
    with col_c1:
        alpha = st.slider(
            "BM25 Weight (\u03b1) vs Semantic Weight (1 - \u03b1)",
            min_value=0.0,
            max_value=1.0,
            value=0.5,
            step=0.05,
            help="\u03b1 = 1.0 (Pure BM25 Lexical), \u03b1 = 0.0 (Pure SentenceTransformer Semantic), \u03b1 = 0.5 (Balanced Hybrid)"
        )
        st.write(f"**Weight Distribution**: BM25 (\u03b1) = `{alpha:.2f}` | Semantic (1-\u03b1) = `{1.0 - alpha:.2f}`")

    with col_c2:
        k1 = st.slider(
            "BM25 k1 (Term Saturation)",
            min_value=0.0,
            max_value=3.0,
            value=1.5,
            step=0.1,
            help="Controls term frequency saturation. Standard default: 1.5"
        )

    with col_c3:
        b_param = st.slider(
            "BM25 b (Length Normalization)",
            min_value=0.0,
            max_value=1.0,
            value=0.75,
            step=0.05,
            help="Controls document length penalty. Standard default: 0.75"
        )

    with col_c4:
        top_k = st.selectbox("Top-K Results", options=[5, 10, 20], index=1)
        norm_method = st.selectbox("Score Normalization", options=["minmax", "rank"], format_func=lambda x: "Min-Max Scaling [0,1]" if x=="minmax" else "Reciprocal Rank (1/R)")

    # ----------------------------------------------------------------------------------
    # 2. RUN RETRIEVAL SEARCH
    # ----------------------------------------------------------------------------------
    search_results = hybrid_retriever.search(
        query=query_text,
        alpha=alpha,
        top_k=top_k,
        candidate_k=100,
        norm_method=norm_method,
        k1=k1,
        b=b_param
    )

    df_kw = search_results["kw_results"]
    df_sem = search_results["sem_results"]
    df_hybrid = search_results["hybrid_results"]
    rank_shifts = search_results["rank_shifts"]
    xray_details = search_results["xray_details"]

    st.divider()
    st.subheader("3. Retrieval Strategy Comparison")

    # Display 3 side-by-side tabs
    tab_kw, tab_sem, tab_hybrid = st.tabs([
        "Lexical Retrieval (BM25)",
        "Semantic Retrieval (all-MiniLM-L6-v2)",
        "Hybrid Retrieval (\u03b1-Weighted Score Fusion)"
    ])

    def render_doc_card(row, score_col, rank_col, is_hybrid=False, is_bm25=False):
        did = str(row["doc_id"])
        title = row.get("title", "Untitled")
        text = row.get("text", "")
        score = row[score_col]
        rank = row[rank_col]
        is_rel = current_qrels.get(did, 0) > 0

        rel_badge = " \u2705 [Relevant Ground Truth]" if is_rel else ""
        
        with st.container():
            st.markdown(f"**#{rank} | Doc ID: `{did}`**{rel_badge}")
            st.markdown(f"**Title**: {title}")
            if is_hybrid:
                st.caption(f"Hybrid Score: `{score:.4f}` | BM25 Contrib: `{row['kw_contrib']:.4f}` | Sem Contrib: `{row['sem_contrib']:.4f}`")
            elif is_bm25:
                st.caption(f"BM25 Score: `{score:.4f}` (k1={k1:.1f}, b={b_param:.2f})")
            else:
                st.caption(f"Dense Similarity Score: `{score:.4f}`")
            
            with st.expander("Expand Abstract Preview"):
                st.write(text)
            st.divider()

    with tab_kw:
        st.markdown(f"### Lexical Search (BM25 Okapi | k1={k1:.1f}, b={b_param:.2f})")
        for _, row in df_kw.iterrows():
            render_doc_card(row, score_col="score", rank_col="keyword_rank", is_bm25=True)

    with tab_sem:
        st.markdown("### Dense Vector Retrieval (Sentence Transformers)")
        for _, row in df_sem.iterrows():
            render_doc_card(row, score_col="score", rank_col="semantic_rank")

    with tab_hybrid:
        st.markdown(f"### Hybrid Retrieval (\u03b1 = {alpha:.2f} BM25 + {1-alpha:.2f} Semantic)")
        for _, row in df_hybrid.iterrows():
            render_doc_card(row, score_col="hybrid_score", rank_col="hybrid_rank", is_hybrid=True)

    # ----------------------------------------------------------------------------------
    # 3. RETRIEVAL X-RAY (EXPLANATION PANEL)
    # ----------------------------------------------------------------------------------
    st.divider()
    st.subheader("Retrieval X-Ray: Score Decomposition & Ranking Explanation")
    st.write("Inspect how exact numerical BM25 and semantic scores lead to specific document rankings (100% mathematical auditability).")

    selected_xray_did = st.selectbox(
        "Select Document for X-Ray Breakdown",
        options=df_hybrid["doc_id"].tolist(),
        format_func=lambda did: f"Doc #{df_hybrid[df_hybrid['doc_id']==did]['hybrid_rank'].values[0]} | ID: {did} | Title: {corpus.get(did, {}).get('title', '')[:50]}..."
    )

    if selected_xray_did in xray_details:
        x_info = xray_details[selected_xray_did]
        row_d = x_info["row_data"]
        
        st.markdown(x_info["summary"])

        # Metric breakdown cards
        xm1, xm2, xm3, xm4 = st.columns(4)
        with xm1:
            st.metric("Raw BM25 Score", f"{row_d['raw_kw_score']:.4f}")
            st.caption(f"Norm: {row_d['norm_kw_score']:.4f}")
        with xm2:
            st.metric("Raw Semantic Score", f"{row_d['raw_sem_score']:.4f}")
            st.caption(f"Norm: {row_d['norm_sem_score']:.4f}")
        with xm3:
            st.metric("BM25 Contrib (\u03b1 \u00d7 Norm)", f"{row_d['kw_contrib']:.4f}")
        with xm4:
            st.metric("Semantic Contrib ((1-\u03b1) \u00d7 Norm)", f"{row_d['sem_contrib']:.4f}")

        # Contribution Stacked Bar Chart
        fig_contrib = go.Figure()
        fig_contrib.add_trace(go.Bar(
            y=["Hybrid Score"],
            x=[row_d["kw_contrib"]],
            name=f"BM25 Contrib (\u03b1={alpha:.2f})",
            orientation='h',
            marker=dict(color='#2563eb')
        ))
        fig_contrib.add_trace(go.Bar(
            y=["Hybrid Score"],
            x=[row_d["sem_contrib"]],
            name=f"Semantic Contrib (1-\u03b1={1-alpha:.2f})",
            orientation='h',
            marker=dict(color='#10b981')
        ))
        fig_contrib.update_layout(
            barmode='stack',
            height=180,
            title=f"Score Composition for Document {selected_xray_did} (Total Hybrid Score: {row_d['hybrid_score']:.4f})",
            xaxis_title="Score Contribution",
            margin=dict(l=20, r=20, t=40, b=20)
        )
        st.plotly_chart(fig_contrib, use_container_width=True)

    # ----------------------------------------------------------------------------------
    # 4. RANK SHIFT ANALYSIS
    # ----------------------------------------------------------------------------------
    st.divider()
    st.subheader("Rank Shift & Document Dynamics")
    st.write("Compare how top hybrid documents move between BM25 Rank, Hybrid Rank, and Semantic Rank.")

    st.dataframe(rank_shifts, use_container_width=True, hide_index=True)

    # Plotly Rank Movement Chart: BM25 Rank -> Hybrid Rank -> Semantic Rank
    fig_ranks = go.Figure()
    for _, r_row in df_hybrid.head(8).iterrows():
        did = str(r_row["doc_id"])
        fig_ranks.add_trace(go.Scatter(
            x=["BM25 Rank", "Hybrid Rank", "Semantic Rank"],
            y=[r_row["kw_rank"], r_row["hybrid_rank"], r_row["sem_rank"]],
            mode="lines+markers+text",
            name=f"Doc {did}",
            text=[f"#{r_row['kw_rank']}", f"#{r_row['hybrid_rank']}", f"#{r_row['sem_rank']}"],
            textposition="top center"
        ))
    fig_ranks.update_layout(
        title="Document Rank Trajectory Across Strategies (Lower Rank Number = Higher Position)",
        yaxis=dict(autorange="reversed", title="Rank Position"),
        height=380,
        margin=dict(l=20, r=20, t=40, b=20)
    )
    st.plotly_chart(fig_ranks, use_container_width=True)

    # ----------------------------------------------------------------------------------
    # 5. IR EVALUATION & WEIGHT SENSITIVITY ANALYSIS
    # ----------------------------------------------------------------------------------
    st.divider()
    st.subheader("SciFact Benchmark IR Evaluation & \u03b1 Weight Sensitivity")

    if current_qrels:
        # 1. Single-query evaluation table across 3 paradigms
        kw_retrieved_ids = df_kw["doc_id"].tolist()
        sem_retrieved_ids = df_sem["doc_id"].tolist()
        hybrid_retrieved_ids = df_hybrid["doc_id"].tolist()

        eval_kw = evaluate_query_retrieval(kw_retrieved_ids, current_qrels, k=top_k)
        eval_sem = evaluate_query_retrieval(sem_retrieved_ids, current_qrels, k=top_k)
        eval_hybrid = evaluate_query_retrieval(hybrid_retrieved_ids, current_qrels, k=top_k)

        df_eval_comp = pd.DataFrame([
            {"Strategy": f"BM25 Lexical (k1={k1:.1f}, b={b_param:.2f})", **eval_kw},
            {"Strategy": "Semantic (all-MiniLM-L6-v2)", **eval_sem},
            {"Strategy": f"Hybrid (\u03b1={alpha:.2f})", **eval_hybrid}
        ])

        st.markdown(f"#### Evaluation Metrics for Query ID `{query_id}` @ Top-{top_k}")
        st.dataframe(df_eval_comp, use_container_width=True, hide_index=True)

        # 2. Alpha Weight Sensitivity Grid Chart
        st.markdown("#### \u03b1 Weight Sensitivity Analysis (0.0 \u2192 1.0)")
        st.caption("Demonstrates why hybrid retrieval outperforms individual retrieval strategies across \u03b1 weight variations.")

        df_sens = evaluate_weight_sensitivity(hybrid_retriever, query_text, current_qrels, k=top_k, k1=k1, b=b_param)

        fig_sens = go.Figure()
        for metric_col in [f"Precision@{top_k}", f"Recall@{top_k}", f"F1@{top_k}", f"MRR@{top_k}", f"nDCG@{top_k}"]:
            fig_sens.add_trace(go.Scatter(
                x=df_sens["alpha"],
                y=df_sens[metric_col],
                mode="lines+markers",
                name=metric_col,
                line=dict(width=2.5)
            ))
        fig_sens.update_layout(
            title=f"Retrieval Performance vs BM25 Weight (\u03b1) [@ Top-{top_k}]",
            xaxis_title="BM25 Weight \u03b1 (0.0 = Pure Semantic, 1.0 = Pure BM25)",
            yaxis_title="Metric Value",
            hovermode="x unified",
            height=400,
            margin=dict(l=20, r=20, t=40, b=20)
        )
        st.plotly_chart(fig_sens, use_container_width=True)

    else:
        st.info("Ground-truth relevance judgments (qrels) are not available for custom queries. Select a SciFact Benchmark Query to view benchmark evaluation metrics.")

    # ----------------------------------------------------------------------------------
    # 6. EXPERIMENTAL TRIAL DATA LOGGER
    # ----------------------------------------------------------------------------------
    st.divider()
    st.subheader("Experimental Session Data Log Book")
    
    col_log1, col_log2 = st.columns([1.5, 3.5])

    with col_log1:
        st.caption("Log the current retrieval configuration and evaluation metrics into your session report table:")
        if st.button("Record Current Trial", type="primary", use_container_width=True):
            if current_qrels:
                eval_metrics = evaluate_query_retrieval(df_hybrid["doc_id"].tolist(), current_qrels, k=top_k)
                p_k = eval_metrics[f"Precision@{top_k}"]
                r_k = eval_metrics[f"Recall@{top_k}"]
                f1_k = eval_metrics[f"F1@{top_k}"]
                mrr_k = eval_metrics[f"MRR@{top_k}"]
                ndcg_k = eval_metrics[f"nDCG@{top_k}"]
            else:
                p_k = r_k = f1_k = mrr_k = ndcg_k = 0.0

            trial_record = {
                "Trial #": len(st.session_state["trials"]) + 1,
                "Query ID": query_id,
                "Query": query_text[:35] + "...",
                "\u03b1 (BM25 Wt)": alpha,
                "BM25 k1": k1,
                "BM25 b": b_param,
                "Top-K": top_k,
                "Top Doc ID": df_hybrid.iloc[0]["doc_id"] if not df_hybrid.empty else "N/A",
                "Top Score": round(df_hybrid.iloc[0]["hybrid_score"], 4) if not df_hybrid.empty else 0.0,
                f"P@{top_k}": round(p_k, 3),
                f"R@{top_k}": round(r_k, 3),
                f"F1@{top_k}": round(f1_k, 3),
                f"MRR@{top_k}": round(mrr_k, 3),
                f"nDCG@{top_k}": round(ndcg_k, 3),
                "Timestamp": datetime.now().strftime("%H:%M:%S")
            }
            st.session_state["trials"].append(trial_record)
            st.toast(f"Trial #{trial_record['Trial #']} successfully logged!")

        if st.button("Clear Logged Trials", use_container_width=True):
            st.session_state["trials"] = []
            st.toast("Trial log cleared.")

    with col_log2:
        if st.session_state["trials"]:
            df_trials = pd.DataFrame(st.session_state["trials"])
            st.dataframe(df_trials, use_container_width=True, hide_index=True)
            csv_data = df_trials.to_csv(index=False).encode('utf-8')
            st.download_button(
                "Download Recorded Trials (CSV)",
                data=csv_data,
                file_name="hybrid_bm25_retrieval_trials.csv",
                mime="text/csv",
                use_container_width=True
            )
        else:
            st.info("No experimental trials recorded yet. Click 'Record Current Trial' to build your session dataset for report export.")
