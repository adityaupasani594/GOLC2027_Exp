"""
Lexical Retrieval Engine using BM25 (Okapi BM25).
Implements probabilistic term frequency saturation (k1) and document length normalization (b).
"""

import re
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
import streamlit as st


class BM25Retriever:
    def __init__(self, corpus: dict):
        """
        Initializes BM25 index over the corpus.
        
        corpus: dict mapping doc_id -> {"title": str, "text": str}
        """
        self.doc_ids = list(corpus.keys())
        self.documents = [
            f"{corpus[doc_id]['title']} {corpus[doc_id]['text']}"
            for doc_id in self.doc_ids
        ]
        self.doc_id_to_idx = {doc_id: idx for idx, doc_id in enumerate(self.doc_ids)}
        self.num_docs = len(self.documents)

        # Tokenize and build Term-Document Frequency Matrix
        self.vectorizer = CountVectorizer(
            stop_words='english',
            token_pattern=r'(?u)\b[a-zA-Z0-9_\-]{2,}\b',
            ngram_range=(1, 1),
            max_features=50000
        )
        # tf_matrix: shape (num_docs, vocab_size)
        self.tf_matrix = self.vectorizer.fit_transform(self.documents).tocsr()
        self.feature_names = np.array(self.vectorizer.get_feature_names_out())
        self.vocab = self.vectorizer.vocabulary_

        # Document lengths |d| and average document length avgdl
        self.doc_lens = np.array(self.tf_matrix.sum(axis=1)).flatten()
        self.avgdl = float(np.mean(self.doc_lens)) if self.num_docs > 0 else 1.0

        # Calculate Document Frequency DF(t) and Lucene/Okapi Robertson IDF(t)
        # IDF(t) = ln( (N - DF(t) + 0.5) / (DF(t) + 0.5) + 1 )
        df = np.bincount(self.tf_matrix.indices, minlength=len(self.vocab))
        self.idf = np.log((self.num_docs - df + 0.5) / (df + 0.5) + 1.0)
        self.idf = np.maximum(self.idf, 1e-6)  # Ensure strictly positive IDF values

    def search(self, query: str, top_k: int = 50, k1: float = 1.5, b: float = 0.75) -> pd.DataFrame:
        """
        Executes BM25 search for a given query string.
        Returns a DataFrame with doc_id, BM25 score, and lexical_rank.
        """
        query_terms = re.findall(r'(?u)\b[a-zA-Z0-9_\-]{2,}\b', query.lower())
        matched_indices = [self.vocab[term] for term in set(query_terms) if term in self.vocab]

        if not matched_indices:
            # If no terms match vocabulary, return top_k zero-score documents
            results = []
            for rank in range(1, min(top_k, self.num_docs) + 1):
                results.append({
                    "doc_id": self.doc_ids[rank - 1],
                    "score": 0.0,
                    "keyword_rank": rank
                })
            return pd.DataFrame(results)

        # Extract relevant submatrix for matched query terms: shape (num_docs, num_query_terms)
        sub_tf = self.tf_matrix[:, matched_indices].tocsc()
        query_idfs = self.idf[matched_indices]

        # Calculate length normalization component per document: (1 - b + b * (|d| / avgdl))
        len_norm = (1.0 - b) + b * (self.doc_lens / self.avgdl)  # shape (num_docs,)

        # Compute BM25 scores:
        # Score(d) = sum_{t} IDF(t) * [ f(t,d) * (k1 + 1) ] / [ f(t,d) + k1 * len_norm(d) ]
        bm25_scores = np.zeros(self.num_docs, dtype=np.float64)

        for col_idx in range(len(matched_indices)):
            tf_col = sub_tf[:, col_idx].toarray().flatten()
            idf_val = query_idfs[col_idx]
            
            numerator = tf_col * (k1 + 1.0)
            denominator = tf_col + k1 * len_norm
            
            # Avoid divide-by-zero
            term_scores = np.where(denominator > 0, idf_val * (numerator / denominator), 0.0)
            bm25_scores += term_scores

        top_indices = np.argsort(bm25_scores)[::-1][:top_k]

        results = []
        for rank, idx in enumerate(top_indices, 1):
            results.append({
                "doc_id": self.doc_ids[idx],
                "score": float(bm25_scores[idx]),
                "keyword_rank": rank
            })

        return pd.DataFrame(results)

    def get_matched_terms(self, query: str, doc_id: str, k1: float = 1.5, b: float = 0.75, top_n: int = 5) -> list:
        """
        Identifies matched query terms and their individual BM25 score contribution for a specific document.
        """
        if doc_id not in self.doc_id_to_idx:
            return []

        doc_idx = self.doc_id_to_idx[doc_id]
        query_terms = re.findall(r'(?u)\b[a-zA-Z0-9_\-]{2,}\b', query.lower())

        doc_len = self.doc_lens[doc_idx]
        len_norm = (1.0 - b) + b * (doc_len / self.avgdl)

        matched_terms = []
        for term in set(query_terms):
            if term in self.vocab:
                term_idx = self.vocab[term]
                f_td = float(self.tf_matrix[doc_idx, term_idx])
                if f_td > 0:
                    idf_val = float(self.idf[term_idx])
                    bm25_term_score = idf_val * (f_td * (k1 + 1.0)) / (f_td + k1 * len_norm)
                    matched_terms.append({"term": term, "weight": float(bm25_term_score)})

        matched_terms.sort(key=lambda x: x["weight"], reverse=True)
        return matched_terms[:top_n]


# Alias for backward compatibility
KeywordRetriever = BM25Retriever


@st.cache_resource(show_spinner="Building BM25 lexical index...")
def get_keyword_retriever(corpus: dict) -> BM25Retriever:
    """Cached factory function for BM25Retriever."""
    return BM25Retriever(corpus)
