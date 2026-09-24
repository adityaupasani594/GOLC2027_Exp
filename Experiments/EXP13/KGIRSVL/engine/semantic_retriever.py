"""
Semantic Retrieval Engine using SentenceTransformers (all-MiniLM-L6-v2) and Cosine Similarity.
Caches document embeddings to disk for instant response times.
"""

import os
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import streamlit as st

CACHE_DIR = os.path.join(".", "data", "cache")
EMBEDDINGS_FILE = os.path.join(CACHE_DIR, "scifact_embeddings.npy")


class SemanticRetriever:
    def __init__(self, corpus: dict, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initializes SentenceTransformer model and computes/loads document embeddings.
        """
        self.doc_ids = list(corpus.keys())
        self.doc_id_to_idx = {doc_id: idx for idx, doc_id in enumerate(self.doc_ids)}
        
        self.model = SentenceTransformer(model_name)
        
        # Check disk cache for pre-computed corpus embeddings
        if os.path.exists(EMBEDDINGS_FILE):
            print("Loading document embeddings from disk cache...")
            self.corpus_embeddings = np.load(EMBEDDINGS_FILE)
        else:
            print("Generating corpus embeddings with SentenceTransformer...")
            os.makedirs(CACHE_DIR, exist_ok=True)
            doc_texts = [
                f"Title: {corpus[doc_id]['title']}. Abstract: {corpus[doc_id]['text']}"
                for doc_id in self.doc_ids
            ]
            self.corpus_embeddings = self.model.encode(
                doc_texts,
                show_progress_bar=True,
                batch_size=64,
                normalize_embeddings=True
            )
            np.save(EMBEDDINGS_FILE, self.corpus_embeddings)
            print("Embeddings saved to disk cache.")

    def search(self, query: str, top_k: int = 50) -> pd.DataFrame:
        """
        Executes dense semantic search for a query string.
        Returns a DataFrame with doc_id, score, and rank.
        """
        query_embedding = self.model.encode([query], normalize_embeddings=True)
        sim_scores = cosine_similarity(query_embedding, self.corpus_embeddings).flatten()
        
        top_indices = np.argsort(sim_scores)[::-1][:top_k]
        
        results = []
        for rank, idx in enumerate(top_indices, 1):
            results.append({
                "doc_id": self.doc_ids[idx],
                "score": float(sim_scores[idx]),
                "semantic_rank": rank
            })
            
        return pd.DataFrame(results)


@st.cache_resource(show_spinner="Loading SentenceTransformer & document embeddings...")
def get_semantic_retriever(corpus: dict) -> SemanticRetriever:
    """Cached factory function for SemanticRetriever."""
    return SemanticRetriever(corpus)
