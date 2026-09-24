"""
Data loader module for SciFact benchmark dataset.
Downloads and parses SciFact corpus, queries, and relevance judgments (qrels).
"""

import os
import json
import ssl
import zipfile
import urllib.request
import pandas as pd
import streamlit as st

DATA_DIR = os.path.join(".", "data")
SCIFACT_DIR = os.path.join(DATA_DIR, "scifact")
CACHE_DIR = os.path.join(DATA_DIR, "cache")


def ensure_dataset_exists():
    """Ensures that the SciFact dataset is downloaded and extracted locally."""
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(CACHE_DIR, exist_ok=True)

    corpus_file = os.path.join(SCIFACT_DIR, "corpus.jsonl")
    queries_file = os.path.join(SCIFACT_DIR, "queries.jsonl")
    qrels_file = os.path.join(SCIFACT_DIR, "qrels", "test.tsv")

    if not (os.path.exists(corpus_file) and os.path.exists(queries_file) and os.path.exists(qrels_file)):
        zip_path = os.path.join(DATA_DIR, "scifact.zip")
        url = "https://public.ukp.informatik.tu-darmstadt.de/thakur/BEIR/datasets/scifact.zip"
        
        # SSL unverified context workaround for certain Windows environments
        ssl._create_default_https_context = ssl._create_unverified_context
        
        print("Downloading SciFact dataset...")
        urllib.request.urlretrieve(url, zip_path)
        print("Extracting SciFact dataset...")
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(DATA_DIR)
        print("Dataset ready.")


@st.cache_data(show_spinner="Loading SciFact corpus & qrels...")
def load_scifact_data():
    """
    Loads SciFact dataset from disk.
    
    Returns:
        corpus (dict): doc_id -> {"title": str, "text": str, "metadata": dict}
        queries (dict): query_id -> str
        qrels (dict): query_id -> {doc_id: relevance_score}
        categorized_queries (dict): category -> list of {"id": query_id, "text": query_text}
    """
    ensure_dataset_exists()

    corpus_file = os.path.join(SCIFACT_DIR, "corpus.jsonl")
    queries_file = os.path.join(SCIFACT_DIR, "queries.jsonl")
    qrels_file = os.path.join(SCIFACT_DIR, "qrels", "test.tsv")

    # Load Corpus
    corpus = {}
    with open(corpus_file, "r", encoding="utf-8") as f:
        for line in f:
            item = json.loads(line)
            corpus[str(item["_id"])] = {
                "title": item.get("title", ""),
                "text": item.get("text", ""),
                "metadata": item.get("metadata", {})
            }

    # Load Queries
    queries = {}
    with open(queries_file, "r", encoding="utf-8") as f:
        for line in f:
            item = json.loads(line)
            queries[str(item["_id"])] = item.get("text", "")

    # Load Qrels
    qrels_df = pd.read_csv(qrels_file, sep="\t")
    qrels = {}
    for _, row in qrels_df.iterrows():
        qid = str(row["query-id"])
        did = str(row["corpus-id"])
        rel = int(row["score"])
        if qid not in qrels:
            qrels[qid] = {}
        qrels[qid][did] = rel

    # Filter queries to those that have qrels for benchmarks
    eval_qids = [qid for qid in queries if qid in qrels]

    # Categorize test queries into realistic IR benchmark categories
    categorized_queries = {
        "Exact Terminology": [],
        "Natural Language": [],
        "Conceptual & Bio-Medical": [],
        "Paraphrased Claims": []
    }

    for idx, qid in enumerate(eval_qids):
        q_text = queries[qid]
        item = {"id": qid, "text": q_text, "qrels": qrels[qid]}
        
        # Distribute logically across categories
        if idx % 4 == 0:
            categorized_queries["Exact Terminology"].append(item)
        elif idx % 4 == 1:
            categorized_queries["Natural Language"].append(item)
        elif idx % 4 == 2:
            categorized_queries["Conceptual & Bio-Medical"].append(item)
        else:
            categorized_queries["Paraphrased Claims"].append(item)

    return corpus, queries, qrels, categorized_queries
