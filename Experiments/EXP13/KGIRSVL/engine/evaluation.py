"""
Information Retrieval Evaluation Engine.
Computes Precision@K, Recall@K, F1@K, MRR@K, and nDCG@K against SciFact qrels.
"""

import numpy as np
import pandas as pd


def compute_precision_at_k(retrieved_ids: list, qrels_dict: dict, k: int) -> float:
    """Calculates Precision@K."""
    if k <= 0:
        return 0.0
    top_k_ids = retrieved_ids[:k]
    relevant_retrieved = sum(1 for did in top_k_ids if qrels_dict.get(did, 0) > 0)
    return relevant_retrieved / float(k)


def compute_recall_at_k(retrieved_ids: list, qrels_dict: dict, k: int) -> float:
    """Calculates Recall@K."""
    relevant_ids = [did for did, rel in qrels_dict.items() if rel > 0]
    if not relevant_ids:
        return 0.0
    top_k_ids = retrieved_ids[:k]
    relevant_retrieved = sum(1 for did in top_k_ids if qrels_dict.get(did, 0) > 0)
    return relevant_retrieved / float(len(relevant_ids))


def compute_f1_at_k(precision: float, recall: float) -> float:
    """Calculates F1@K."""
    if precision + recall == 0:
        return 0.0
    return 2.0 * (precision * recall) / (precision + recall)


def compute_mrr_at_k(retrieved_ids: list, qrels_dict: dict, k: int) -> float:
    """Calculates Reciprocal Rank @ K."""
    top_k_ids = retrieved_ids[:k]
    for rank, did in enumerate(top_k_ids, 1):
        if qrels_dict.get(did, 0) > 0:
            return 1.0 / float(rank)
    return 0.0


def compute_ndcg_at_k(retrieved_ids: list, qrels_dict: dict, k: int) -> float:
    """Calculates nDCG@K."""
    top_k_ids = retrieved_ids[:k]
    
    # Calculate DCG
    dcg = 0.0
    for i, did in enumerate(top_k_ids):
        rel = qrels_dict.get(did, 0)
        if rel > 0:
            dcg += float(rel) / np.log2(i + 2)
            
    # Calculate IDCG (Ideal DCG)
    ideal_relevances = sorted([rel for rel in qrels_dict.values() if rel > 0], reverse=True)[:k]
    if not ideal_relevances:
        return 0.0
        
    idcg = 0.0
    for i, rel in enumerate(ideal_relevances):
        idcg += float(rel) / np.log2(i + 2)
        
    if idcg == 0:
        return 0.0
    return dcg / idcg


def evaluate_query_retrieval(retrieved_ids: list, qrels_dict: dict, k: int = 10) -> dict:
    """
    Evaluates a single query retrieval result list against ground-truth qrels.
    """
    prec = compute_precision_at_k(retrieved_ids, qrels_dict, k)
    rec = compute_recall_at_k(retrieved_ids, qrels_dict, k)
    f1 = compute_f1_at_k(prec, rec)
    mrr = compute_mrr_at_k(retrieved_ids, qrels_dict, k)
    ndcg = compute_ndcg_at_k(retrieved_ids, qrels_dict, k)

    return {
        f"Precision@{k}": prec,
        f"Recall@{k}": rec,
        f"F1@{k}": f1,
        f"MRR@{k}": mrr,
        f"nDCG@{k}": ndcg
    }


def evaluate_weight_sensitivity(hybrid_retriever, query: str, qrels_dict: dict, k: int = 10, 
                                 alphas: list = None, k1: float = 1.5, b: float = 0.75) -> pd.DataFrame:
    """
    Evaluates retrieval performance metrics across a spectrum of alpha BM25 weight values (0.0 to 1.0).
    """
    if alphas is None:
        alphas = [round(a, 2) for a in np.linspace(0.0, 1.0, 11)]

    records = []
    for alpha in alphas:
        res = hybrid_retriever.search(query, alpha=alpha, top_k=k, candidate_k=100, k1=k1, b=b)
        retrieved_ids = res["hybrid_results"]["doc_id"].tolist()
        metrics = evaluate_query_retrieval(retrieved_ids, qrels_dict, k=k)
        
        row = {"alpha": alpha, "bm25_weight": alpha, "semantic_weight": round(1.0 - alpha, 2)}
        row.update(metrics)
        records.append(row)

    return pd.DataFrame(records)
