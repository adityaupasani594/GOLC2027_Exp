"""
Hybrid Retrieval Engine implementing BM25 & Semantic score normalization,
weighted score fusion, rank movement tracking, and Retrieval X-Ray explanations.
"""

import numpy as np
import pandas as pd


def normalize_scores(scores: np.ndarray, method: str = "minmax") -> np.ndarray:
    """
    Normalizes a 1D array of scores into [0, 1].
    """
    if len(scores) == 0:
        return scores
    
    if method == "minmax":
        min_val = np.min(scores)
        max_val = np.max(scores)
        if max_val == min_val:
            return np.ones_like(scores)
        return (scores - min_val) / (max_val - min_val)
    elif method == "rank":
        ranks = pd.Series(scores).rank(ascending=False, method="min").values
        return 1.0 / ranks
    else:
        return scores


class HybridRetriever:
    def __init__(self, keyword_retriever, semantic_retriever, corpus: dict):
        self.bm25_retriever = keyword_retriever
        self.sem_retriever = semantic_retriever
        self.corpus = corpus

    def search(self, query: str, alpha: float = 0.5, top_k: int = 20, candidate_k: int = 100, 
               norm_method: str = "minmax", k1: float = 1.5, b: float = 0.75) -> dict:
        """
        Executes hybrid retrieval by combining BM25 lexical and SentenceTransformer semantic scores.
        
        Parameters:
            query (str): The search query
            alpha (float): BM25 weight in [0.0, 1.0]. Semantic weight is (1 - alpha).
            top_k (int): Number of final top results to return
            candidate_k (int): Depth of candidate lists to pool for score fusion
            norm_method (str): Normalization strategy ("minmax" or "rank")
            k1 (float): BM25 term frequency saturation parameter
            b (float): BM25 document length normalization parameter
            
        Returns:
            dict containing:
                "kw_results": DataFrame of BM25 top results
                "sem_results": DataFrame of semantic top results
                "hybrid_results": DataFrame of hybrid top results with contribution metrics
                "xray_details": Dict with mathematical breakdown for X-Ray explanations
        """
        # 1. Fetch BM25 and semantic candidates
        df_kw = self.bm25_retriever.search(query, top_k=candidate_k, k1=k1, b=b)
        df_sem = self.sem_retriever.search(query, top_k=candidate_k)
        
        # 2. Pool candidate doc_ids
        kw_dict = dict(zip(df_kw["doc_id"], df_kw["score"]))
        kw_rank_dict = dict(zip(df_kw["doc_id"], df_kw["keyword_rank"]))
        
        sem_dict = dict(zip(df_sem["doc_id"], df_sem["score"]))
        sem_rank_dict = dict(zip(df_sem["doc_id"], df_sem["semantic_rank"]))
        
        candidate_ids = list(set(kw_dict.keys()).union(set(sem_dict.keys())))
        
        # 3. Extract raw score arrays for candidate pool
        raw_kw_scores = np.array([kw_dict.get(did, 0.0) for did in candidate_ids])
        raw_sem_scores = np.array([sem_dict.get(did, 0.0) for did in candidate_ids])
        
        # 4. Normalize scores
        norm_kw_scores = normalize_scores(raw_kw_scores, method=norm_method)
        norm_sem_scores = normalize_scores(raw_sem_scores, method=norm_method)
        
        # 5. Compute Hybrid Weighted Scores: Hybrid = alpha * BM25_norm + (1 - alpha) * Semantic_norm
        kw_contribs = alpha * norm_kw_scores
        sem_contribs = (1.0 - alpha) * norm_sem_scores
        hybrid_scores = kw_contribs + sem_contribs
        
        # 6. Rank documents by hybrid score
        hybrid_records = []
        for i, did in enumerate(candidate_ids):
            hybrid_records.append({
                "doc_id": did,
                "title": self.corpus.get(did, {}).get("title", "N/A"),
                "text": self.corpus.get(did, {}).get("text", "N/A"),
                "raw_kw_score": raw_kw_scores[i],
                "raw_sem_score": raw_sem_scores[i],
                "norm_kw_score": norm_kw_scores[i],
                "norm_sem_score": norm_sem_scores[i],
                "kw_contrib": kw_contribs[i],
                "sem_contrib": sem_contribs[i],
                "hybrid_score": hybrid_scores[i],
                "kw_rank": kw_rank_dict.get(did, candidate_k + 1),
                "sem_rank": sem_rank_dict.get(did, candidate_k + 1)
            })
            
        df_hybrid = pd.DataFrame(hybrid_records)
        df_hybrid.sort_values(by="hybrid_score", ascending=False, inplace=True)
        df_hybrid.reset_index(drop=True, inplace=True)
        df_hybrid["hybrid_rank"] = df_hybrid.index + 1
        
        # Top-K sliced DataFrames
        df_kw_top = df_kw.head(top_k).copy()
        df_kw_top["title"] = [self.corpus.get(did, {}).get("title", "N/A") for did in df_kw_top["doc_id"]]
        df_kw_top["text"] = [self.corpus.get(did, {}).get("text", "N/A") for did in df_kw_top["doc_id"]]
        
        df_sem_top = df_sem.head(top_k).copy()
        df_sem_top["title"] = [self.corpus.get(did, {}).get("title", "N/A") for did in df_sem_top["doc_id"]]
        df_sem_top["text"] = [self.corpus.get(did, {}).get("text", "N/A") for did in df_sem_top["doc_id"]]
        
        df_hybrid_top = df_hybrid.head(top_k).copy()
        
        # Calculate rank shifts for comparison
        rank_shifts = []
        for _, row in df_hybrid_top.iterrows():
            k_rk = row["kw_rank"]
            s_rk = row["sem_rank"]
            h_rk = row["hybrid_rank"]
            
            k_str = f"#{k_rk}" if k_rk <= candidate_k else f">{candidate_k}"
            s_str = f"#{s_rk}" if s_rk <= candidate_k else f">{candidate_k}"
            
            rank_shifts.append({
                "doc_id": row["doc_id"],
                "title": row["title"],
                "kw_rank_str": k_str,
                "sem_rank_str": s_str,
                "hybrid_rank": h_rk,
                "hybrid_score": row["hybrid_score"],
                "kw_contrib": row["kw_contrib"],
                "sem_contrib": row["sem_contrib"]
            })
            
        # Detailed X-Ray explanation builder for top hybrid documents (BM25 Terminology)
        xray_explanations = {}
        for _, row in df_hybrid_top.head(10).iterrows():
            did = row["doc_id"]
            kw_terms = self.bm25_retriever.get_matched_terms(query, did, k1=k1, b=b, top_n=5)
            
            explanation_text = (
                f"Document **{did}** achieved Hybrid Rank **#{row['hybrid_rank']}** with a final score of **{row['hybrid_score']:.4f}**.\n\n"
                f"- **BM25 Lexical Contribution** ($\alpha = {alpha:.2f}$): {row['kw_contrib']:.4f} "
                f"(Raw BM25 score: {row['raw_kw_score']:.4f}, Normalized: {row['norm_kw_score']:.4f}, BM25 Rank: #{row['kw_rank']}).\n"
                f"- **Semantic Contribution** ($1 - \alpha = {1-alpha:.2f}$): {row['sem_contrib']:.4f} "
                f"(Raw Dense score: {row['raw_sem_score']:.4f}, Normalized: {row['norm_sem_score']:.4f}, Semantic Rank: #{row['sem_rank']}).\n"
            )
            
            if kw_terms:
                terms_str = ", ".join([f"`{item['term']}` ({item['weight']:.3f})" for item in kw_terms])
                explanation_text += f"- **Matched BM25 Query Keywords**: {terms_str}\n"
            else:
                explanation_text += "- **Matched BM25 Query Keywords**: None directly matched in vocabulary (ranked primarily via dense semantic similarity).\n"
                
            xray_explanations[did] = {
                "summary": explanation_text,
                "matched_terms": kw_terms,
                "row_data": row.to_dict()
            }

        return {
            "kw_results": df_kw_top,
            "sem_results": df_sem_top,
            "hybrid_results": df_hybrid_top,
            "rank_shifts": pd.DataFrame(rank_shifts),
            "xray_details": xray_explanations
        }
