
"""
KGIRS Virtual Laboratory — Experiment 14
Integration of Information Retrieval with Knowledge Graphs

Streamlit implementation based on:
- Faculty-provided experiment allocation PDF:
  "Combine document retrieval results with graph-based entity and relationship exploration."
- Faculty-provided Streamlit template:
  Theory -> Simulation -> Quiz -> Report Generation

Note:
For graph experiments, the assignment explicitly says to use a frontend
with fewer nodes and does not require Neo4j. This implementation therefore
uses an in-memory graph rendered with Plotly.
"""

import base64
import os
import random
import tempfile
from datetime import datetime
from math import sqrt
from pathlib import Path

import pandas as pd
import plotly.graph_objects as go
import streamlit as st
from fpdf import FPDF


# =============================================================================
# 1. EXPERIMENT CONFIGURATION
# =============================================================================

EXPERIMENT_CONFIG = {
    "title": "Experiment 14: Integration of Information Retrieval with Knowledge Graphs",
    "short_title": "IR + Knowledge Graph Integration",
    "course": "Knowledge Graphs and Information Retrieval Systems",
    "experiment_no": "14",
    "roll_no": "66 to 70",
    "college": "",
    "objectives": [
        "Understand how Information Retrieval (IR) and Knowledge Graphs can complement each other.",
        "Retrieve relevant documents for a natural-language query using keyword matching.",
        "Identify entities and relationships connected to retrieved documents.",
        "Explore retrieved results through a small graph representation.",
        "Understand how graph context can enrich ordinary document retrieval."
    ],
}

REFERENCES = [
    "Virtual Labs, Ministry of Education, Government of India. https://www.vlab.co.in/",
    "Manning, C. D., Raghavan, P., and Schütze, H. Introduction to Information Retrieval. Cambridge University Press.",
    "Hogan, A. et al. Knowledge Graphs. ACM Computing Surveys, 2021.",
    "Plotly Python Graphing Library Documentation. https://plotly.com/python/",
]

THEORY_CONTENT = {
    "aim": (
        "To integrate document retrieval with knowledge-graph-based entity and "
        "relationship exploration so that retrieved documents can be examined "
        "together with their surrounding contextual information."
    ),
    "background": """
### 1. Information Retrieval

Information Retrieval (IR) is the process of finding useful information from a
collection of documents in response to a user's query. A basic retrieval system
matches query terms with document terms and ranks the documents according to
their relevance.

For this virtual experiment, a lightweight keyword-overlap retrieval model is
used so that the complete process remains transparent and executable in the
browser.

### 2. Knowledge Graph

A Knowledge Graph represents information as **entities (nodes)** and
**relationships (edges)**. For example:

`Python --USED_FOR--> Information Retrieval`

A graph makes relationships explicit and allows a learner to move from a
retrieved document to related concepts.

### 3. Why Integrate IR and Knowledge Graphs?

Traditional document retrieval answers:

> "Which documents are relevant to my query?"

A knowledge graph additionally helps answer:

> "Which entities are involved, and how are those entities connected?"

The integrated workflow used in this experiment is:

**User Query**
→ **Document Retrieval**
→ **Relevant Documents**
→ **Entity Identification**
→ **Graph Traversal**
→ **Contextual Exploration**

### 4. Graph-Enhanced Retrieval

The retrieved documents act as entry points into the graph. Their associated
entities and relationships provide additional context. This is useful when a
query contains concepts that are related indirectly rather than appearing as
exact keywords in every relevant document.

### 5. Representation Used in This Experiment

The demonstration uses a small in-memory graph instead of Neo4j. This follows
the assignment instruction for graph experiments: use a frontend with fewer
nodes and do not require a Neo4j implementation.

The graph contains a small set of documents, entities, and typed relationships.
The learner can change the query, inspect ranked documents, and explore the
connected graph.
""",
    "procedure": [
        "Read the Aim, Theory, Learning Objectives and Key Terminology.",
        "Open the Simulation section from the sidebar.",
        "Enter a query such as 'semantic search' or 'knowledge graph retrieval'.",
        "Run retrieval to obtain ranked documents.",
        "Inspect the retrieved document scores and matched terms.",
        "Select a retrieved document and explore its connected entities.",
        "Observe how graph relationships provide contextual information.",
        "Try at least three different queries and compare the retrieved context.",
        "Complete the conceptual quiz.",
        "Enter observations and generate the experiment report."
    ],
    "key_terms": {
        "Information Retrieval (IR)": "Finding and ranking relevant documents for a user information need.",
        "Document": "A retrievable unit of textual information in the corpus.",
        "Entity": "A meaningful concept, person, technology, organization or topic represented as a graph node.",
        "Relationship": "A typed connection between two graph entities.",
        "Knowledge Graph": "A graph representation of entities and semantic relationships.",
        "Graph Traversal": "Following relationships from one node to connected nodes.",
        "Graph Context": "Related entities and relationships discovered around a retrieved document.",
        "Graph-Enhanced Retrieval": "Retrieval that combines document relevance with structured graph context."
    }
}


# =============================================================================
# 2. SMALL DEMONSTRATION CORPUS + KNOWLEDGE GRAPH
# =============================================================================

DOCUMENTS = [
    {
        "id": "D1",
        "title": "Semantic Search with Dense Embeddings",
        "text": (
            "Dense embeddings represent documents and queries as vectors. "
            "Semantic search retrieves conceptually similar information even "
            "when exact keywords differ."
        ),
    },
    {
        "id": "D2",
        "title": "Knowledge Graphs for Information Retrieval",
        "text": (
            "Knowledge graphs organize entities and relationships and can enrich "
            "information retrieval with structured context and graph exploration."
        ),
    },
    {
        "id": "D3",
        "title": "Hybrid Retrieval Systems",
        "text": (
            "Hybrid retrieval combines lexical retrieval such as BM25 with "
            "semantic retrieval to improve coverage and relevance."
        ),
    },
    {
        "id": "D4",
        "title": "Entity and Relationship Extraction",
        "text": (
            "Entity extraction identifies concepts in text, while relationship "
            "extraction connects related entities into graph structures."
        ),
    },
    {
        "id": "D5",
        "title": "Graph-Based Contextual Exploration",
        "text": (
            "A retrieved document can be used as an entry point for exploring "
            "connected entities, relationships, and multi-hop contextual paths."
        ),
    },
]

# Graph nodes: document nodes + entity nodes.
GRAPH_NODES = [
    ("D1", "document", "Semantic Search with Dense Embeddings"),
    ("D2", "document", "Knowledge Graphs for Information Retrieval"),
    ("D3", "document", "Hybrid Retrieval Systems"),
    ("D4", "document", "Entity and Relationship Extraction"),
    ("D5", "document", "Graph-Based Contextual Exploration"),

    ("E1", "entity", "Dense Embeddings"),
    ("E2", "entity", "Semantic Search"),
    ("E3", "entity", "Knowledge Graph"),
    ("E4", "entity", "Information Retrieval"),
    ("E5", "entity", "Hybrid Retrieval"),
    ("E6", "entity", "Entity Extraction"),
    ("E7", "entity", "Relationship Extraction"),
    ("E8", "entity", "Graph Traversal"),
]

GRAPH_EDGES = [
    ("D1", "E1", "USES"),
    ("D1", "E2", "DESCRIBES"),
    ("D1", "E4", "SUPPORTS"),

    ("D2", "E3", "USES"),
    ("D2", "E4", "ENRICHES"),

    ("D3", "E5", "DESCRIBES"),
    ("D3", "E4", "COMBINES_WITH"),
    ("D3", "E2", "COMBINES_WITH"),

    ("D4", "E6", "PERFORMS"),
    ("D4", "E7", "PERFORMS"),
    ("D4", "E3", "BUILDS"),

    ("D5", "E8", "USES"),
    ("D5", "E3", "EXPLORES"),
    ("D5", "E4", "SUPPORTS"),

    ("E6", "E7", "RELATED_TO"),
    ("E3", "E8", "ENABLES"),
    ("E4", "E3", "COMPLEMENTED_BY"),
]


# =============================================================================
# 3. RETRIEVAL ENGINE
# =============================================================================

STOPWORDS = {
    "a", "an", "the", "is", "are", "of", "to", "in", "for", "and",
    "with", "on", "from", "how", "what", "which", "using", "into",
    "by", "can", "be", "as", "that", "this"
}


def tokenize(text):
    cleaned = "".join(ch.lower() if ch.isalnum() else " " for ch in text)
    return [w for w in cleaned.split() if w not in STOPWORDS]


def retrieval_score(query, document):
    q_terms = set(tokenize(query))
    d_terms = tokenize(document["text"] + " " + document["title"])
    d_set = set(d_terms)

    if not q_terms:
        return 0.0, []

    matched = sorted(q_terms.intersection(d_set))
    overlap = len(matched) / len(q_terms)

    # Small title bonus makes the demonstration more intuitive.
    title_terms = set(tokenize(document["title"]))
    title_hits = len(q_terms.intersection(title_terms))
    title_bonus = min(0.25, title_hits * 0.08)

    score = min(1.0, overlap + title_bonus)
    return round(score, 3), matched


def retrieve_documents(query, top_k=5):
    results = []

    for doc in DOCUMENTS:
        score, matched = retrieval_score(query, doc)
        results.append({
            "Document ID": doc["id"],
            "Document": doc["title"],
            "Score": score,
            "Matched Terms": ", ".join(matched) if matched else "—",
        })

    results.sort(key=lambda x: x["Score"], reverse=True)
    return results[:top_k]


def connected_context(start_node):
    """Return one-hop graph context for a selected node."""
    context = []

    for src, dst, relation in GRAPH_EDGES:
        if src == start_node:
            context.append((start_node, relation, dst))
        elif dst == start_node:
            context.append((src, relation, start_node))

    return context


# =============================================================================
# 4. GRAPH VISUALIZATION
# =============================================================================

NODE_POSITIONS = {
    "D1": (-2.4, 2.0),
    "D2": (0.0, 2.4),
    "D3": (2.4, 2.0),
    "D4": (-1.8, -1.4),
    "D5": (1.8, -1.4),

    "E1": (-3.8, 0.4),
    "E2": (-1.5, 0.2),
    "E3": (0.0, 0.3),
    "E4": (2.0, 0.4),
    "E5": (3.8, 0.4),
    "E6": (-3.2, -1.9),
    "E7": (-0.8, -2.2),
    "E8": (2.7, -2.2),
}


def graph_neighborhood(start_node, depth=1, relationship_filter="All relationships"):
    """Return the visible nodes and edges around a node for one or two hops."""
    if not start_node:
        return set(), []

    allowed_edges = [
        edge for edge in GRAPH_EDGES
        if relationship_filter == "All relationships" or edge[2] == relationship_filter
    ]
    visible_nodes = {start_node}
    frontier = {start_node}

    for _ in range(max(1, min(int(depth), 2))):
        next_frontier = set()
        for src, dst, _ in allowed_edges:
            if src in frontier or dst in frontier:
                visible_nodes.update([src, dst])
                next_frontier.update([src, dst])
        frontier = next_frontier - visible_nodes.intersection(frontier)

    visible_edges = [
        edge for edge in allowed_edges
        if edge[0] in visible_nodes and edge[1] in visible_nodes
    ]
    return visible_nodes, visible_edges


def build_graph_figure(
    highlight_nodes=None,
    focus_node=None,
    context_depth=1,
    relationship_filter="All relationships",
    show_relationship_labels=True,
    layout_name="Academic",
    graph_height=440,
):
    """Build the interactive graph while preserving the original call signature."""
    highlight_nodes = set(highlight_nodes or [])

    if focus_node:
        visible_nodes, visible_edges = graph_neighborhood(
            focus_node, context_depth, relationship_filter
        )
    else:
        visible_nodes = {node_id for node_id, _, _ in GRAPH_NODES}
        visible_edges = [
            edge for edge in GRAPH_EDGES
            if relationship_filter == "All relationships"
            or edge[2] == relationship_filter
        ]

    if not visible_nodes:
        visible_nodes = {focus_node} if focus_node else {GRAPH_NODES[0][0]}

    positions = {node_id: NODE_POSITIONS[node_id] for node_id in visible_nodes}
    if layout_name == "Radial" and focus_node in visible_nodes:
        surrounding = sorted(visible_nodes - {focus_node})
        positions = {focus_node: (0.0, 0.0)}
        count = max(len(surrounding), 1)
        for index, node_id in enumerate(surrounding):
            angle = (2 * 3.141592653589793 * index / count) + 0.35
            positions[node_id] = (2.2 * __import__("math").cos(angle), 2.2 * __import__("math").sin(angle))

    visible_positions = list(positions.values())
    min_x = min(position[0] for position in visible_positions)
    max_x = max(position[0] for position in visible_positions)
    min_y = min(position[1] for position in visible_positions)
    max_y = max(position[1] for position in visible_positions)
    x_padding = max(0.65, (max_x - min_x) * 0.23)
    y_padding = max(0.65, (max_y - min_y) * 0.24)

    fig = go.Figure()
    for src, dst, relation in visible_edges:
        x0, y0 = positions[src]
        x1, y1 = positions[dst]
        emphasized = src in highlight_nodes or dst in highlight_nodes
        fig.add_trace(go.Scatter(
            x=[x0, x1], y=[y0, y1], mode="lines",
            line=dict(width=2.6 if emphasized else 1.7, color="#55718f"),
            hovertemplate=f"{src} — {relation} → {dst}<extra></extra>",
            showlegend=False,
        ))
        if show_relationship_labels:
            fig.add_annotation(
                x=(x0 + x1) / 2, y=(y0 + y1) / 2, text=relation.replace("_", " "),
                showarrow=False, font=dict(size=9, color="#263746"),
                bgcolor="rgba(255,255,255,0.97)", bordercolor="#cbd5df", borderpad=3,
            )

    node_lookup = {node_id: (node_type, label) for node_id, node_type, label in GRAPH_NODES}
    for node_id in sorted(visible_nodes):
        node_type, label = node_lookup[node_id]
        x, y = positions[node_id]
        is_focus = node_id == focus_node
        is_highlighted = node_id in highlight_nodes
        short_label = label if len(label) <= 23 else label[:21] + "…"
        fig.add_trace(go.Scatter(
            x=[x], y=[y], mode="markers+text",
            marker=dict(
                size=34 if is_focus else 27 if is_highlighted else 23,
                symbol="square" if node_type == "document" else "circle",
                color="#c93745" if is_focus else "#1f4e79" if node_type == "document" else "#d9a62e",
                line=dict(width=3 if is_focus else 1.5, color="#ffffff"),
            ),
            text=[f"{node_id}<br>{short_label}"], textposition="top center",
            textfont=dict(size=11, color="#17212b"),
            hovertemplate=(
                f"<b>{label}</b><br>ID: {node_id}<br>Type: {node_type.title()}"
                + ("<br><b>Selected retrieval document</b>" if is_focus else "")
                + "<extra></extra>"
            ),
            showlegend=False,
        ))

    fig.add_trace(go.Scatter(
        x=[None], y=[None], mode="markers", name="Document",
        marker=dict(size=13, symbol="square", color="#1f4e79"), hoverinfo="skip",
    ))
    fig.add_trace(go.Scatter(
        x=[None], y=[None], mode="markers", name="Entity",
        marker=dict(size=13, symbol="circle", color="#d9a62e"), hoverinfo="skip",
    ))
    fig.add_trace(go.Scatter(
        x=[None], y=[None], mode="markers", name="Selected document",
        marker=dict(size=15, symbol="square", color="#c93745"), hoverinfo="skip",
    ))

    fig.update_layout(
        height=graph_height,
        margin=dict(l=8, r=8, t=16, b=34),
        hovermode="closest",
        plot_bgcolor="#ffffff", paper_bgcolor="#ffffff",
        xaxis=dict(visible=False, fixedrange=True, range=[min_x - x_padding, max_x + x_padding]),
        yaxis=dict(visible=False, fixedrange=True, range=[min_y - y_padding, max_y + y_padding]),
        legend=dict(
            orientation="h", yanchor="top", y=-0.04, xanchor="center", x=0.5,
            font=dict(size=11, color="#263746"), bgcolor="rgba(255,255,255,0.94)",
        ),
    )
    return fig


# =============================================================================
# 5. QUIZ
# =============================================================================

QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "What is the primary purpose of Information Retrieval in this experiment?",
        "options": [
            "A) Find and rank relevant documents for a query",
            "B) Create database tables",
            "C) Encrypt every document",
            "D) Delete unrelated documents permanently"
        ],
        "answer_index": 0,
        "explanation": "IR retrieves and ranks documents according to their relevance to the user's information need."
    },
    {
        "id": 2,
        "question": "What does a node represent in the knowledge graph?",
        "options": [
            "A) Only a numerical score",
            "B) An entity or document",
            "C) A retrieval algorithm",
            "D) A quiz question"
        ],
        "answer_index": 1,
        "explanation": "The demonstration graph contains document and entity nodes."
    },
    {
        "id": 3,
        "question": "What does an edge represent?",
        "options": [
            "A) A relationship between two nodes",
            "B) A document's word count",
            "C) A quiz score",
            "D) A search query"
        ],
        "answer_index": 0,
        "explanation": "Edges encode typed relationships such as USES, SUPPORTS and EXPLORES."
    },
    {
        "id": 4,
        "question": "Why is graph context useful after retrieving a document?",
        "options": [
            "A) It removes the need for documents",
            "B) It reveals connected entities and relationships",
            "C) It always guarantees a correct answer",
            "D) It converts all text into images"
        ],
        "answer_index": 1,
        "explanation": "Graph exploration adds structured context around the retrieved document."
    },
    {
        "id": 5,
        "question": "What is the integrated workflow demonstrated here?",
        "options": [
            "A) Query → Retrieval → Graph exploration",
            "B) Query → Delete → Database shutdown",
            "C) Graph → Formatting → Printing only",
            "D) Quiz → Retrieval → Logout"
        ],
        "answer_index": 0,
        "explanation": "The experiment combines document retrieval with graph-based entity and relationship exploration."
    },
    {
        "id": 6,
        "question": "Why does this implementation use a small in-memory graph?",
        "options": [
            "A) Neo4j is required by the experiment",
            "B) The assignment specifies fewer graph nodes and says Neo4j is not expected",
            "C) Graphs cannot be stored in databases",
            "D) Streamlit cannot display graphs"
        ],
        "answer_index": 1,
        "explanation": "The faculty instruction explicitly permits frontend graph implementations and says Neo4j is not expected for graph experiments."
    },
    {
        "id": 7,
        "question": "What is graph traversal?",
        "options": [
            "A) Following relationships from a node to connected nodes",
            "B) Sorting quiz questions",
            "C) Removing stopwords",
            "D) Converting Python to HTML"
        ],
        "answer_index": 0,
        "explanation": "Traversal explores connected nodes through graph relationships."
    },
    {
        "id": 8,
        "question": "What is the role of the retrieved document in the graph?",
        "options": [
            "A) It can act as an entry point to related entities",
            "B) It must always be deleted",
            "C) It is never connected to any entity",
            "D) It is only used for report formatting"
        ],
        "answer_index": 0,
        "explanation": "Retrieved documents provide starting points for contextual graph exploration."
    },
    {
        "id": 9,
        "question": "Which statement best describes a Knowledge Graph?",
        "options": [
            "A) A collection of unrelated text files",
            "B) A graph of entities connected by typed relationships",
            "C) A spreadsheet containing only scores",
            "D) A programming language"
        ],
        "answer_index": 1,
        "explanation": "Knowledge graphs explicitly represent entities and their relationships."
    },
    {
        "id": 10,
        "question": "What is the main learning outcome of integrating IR and a Knowledge Graph?",
        "options": [
            "A) Contextual exploration of retrieved information",
            "B) Elimination of all retrieval algorithms",
            "C) Replacement of every document with a graph",
            "D) Removal of user queries"
        ],
        "answer_index": 0,
        "explanation": "The integrated system lets the learner retrieve relevant documents and then explore their structured context."
    }
]


def make_quiz_question(question_id, question, correct, distractors, explanation):
    options = [correct, *distractors]
    random.shuffle(options)
    return {
        "id": question_id,
        "question": question,
        "options": options,
        "answer_index": options.index(correct),
        "explanation": explanation,
    }


QUIZ_QUESTIONS.extend([
    make_quiz_question(11, "What is a corpus in Information Retrieval?", "A collection of documents", ["A graph edge", "A quiz score", "A user password"], "A corpus is the collection searched by an IR system."),
    make_quiz_question(12, "What does tokenization do?", "Splits text into smaller terms", ["Draws graph nodes", "Encrypts documents", "Ranks students"], "Tokenization prepares text by splitting it into terms."),
    make_quiz_question(13, "Why are stopwords often removed?", "They usually add little retrieval meaning", ["They are graph entities", "They increase image quality", "They store quiz answers"], "Common words such as 'the' often contribute little to matching."),
    make_quiz_question(14, "What does a retrieval score indicate?", "How well a document matches a query", ["The graph size", "The PDF page count", "The student's roll number"], "The score summarizes document-query relevance."),
    make_quiz_question(15, "What is lexical retrieval based on?", "Matching words or terms", ["Drawing circles", "Student identity", "PDF margins"], "Lexical retrieval compares query terms with document terms."),
    make_quiz_question(16, "What is semantic retrieval intended to capture?", "Conceptual similarity", ["Only document length", "Only graph colors", "Only spelling errors"], "Semantic retrieval can identify related meaning beyond exact words."),
    make_quiz_question(17, "What is a query?", "A user's information need expressed as input", ["A graph node type", "A PDF footer", "A fixed answer key"], "The query describes what information the user wants to find."),
    make_quiz_question(18, "What is ranking in IR?", "Ordering documents by relevance", ["Deleting graph edges", "Renaming students", "Formatting a PDF"], "Ranking places more relevant results before less relevant ones."),
    make_quiz_question(19, "What is a title bonus used for in this demo?", "To give title matches a small relevance boost", ["To hide graph nodes", "To grade the quiz", "To change the roll number"], "The demonstration gives matching title terms a small bonus."),
    make_quiz_question(20, "What does an entity label provide?", "A human-readable name for a node", ["A retrieval password", "A quiz timer", "A PDF page break"], "Labels make graph nodes understandable to learners."),
    make_quiz_question(21, "What is an edge type such as USES?", "A name describing a relationship", ["A document score", "A stopword list", "A student field"], "Typed edges explain how two nodes are connected."),
    make_quiz_question(22, "What is a one-hop context?", "Nodes directly connected to a selected node", ["All documents in the world", "Only quiz questions", "A PDF heading"], "One-hop exploration follows one relationship from the focus node."),
    make_quiz_question(23, "What is multi-hop exploration?", "Following relationships through multiple steps", ["Reading one word", "Changing a title", "Submitting one answer"], "Multi-hop traversal explores paths beyond immediate neighbors."),
    make_quiz_question(24, "Why connect documents to entities?", "To add structured meaning around retrieved text", ["To remove all text", "To disable ranking", "To hide the query"], "Document-entity links connect unstructured text with graph context."),
    make_quiz_question(25, "What is graph context in this experiment?", "Entities and relationships around a retrieved document", ["The PDF file name", "The quiz button", "The page background"], "Graph context is the neighborhood discovered from a document."),
    make_quiz_question(26, "Which item is a document node here?", "D1", ["E1", "USES", "Score"], "Nodes beginning with D represent documents in this graph."),
    make_quiz_question(27, "Which item is an entity node here?", "E3", ["D3", "SUPPORTS", "Query"], "Nodes beginning with E represent entities in this graph."),
    make_quiz_question(28, "What does the square node symbol represent?", "A document", ["A relationship", "A quiz answer", "A score"], "The visualization uses squares for document nodes."),
    make_quiz_question(29, "What does the circular node symbol represent?", "An entity", ["A document", "A trial number", "A PDF page"], "The visualization uses circles for entity nodes."),
    make_quiz_question(30, "What is the purpose of the graph visualization?", "To explore connections around a result", ["To replace the quiz", "To encrypt the corpus", "To store passwords"], "The graph provides a visual view of retrieved-document context."),
    make_quiz_question(31, "What happens when no query terms match?", "The document receives a zero score", ["Every document is deleted", "The graph becomes a database", "The quiz is submitted"], "No overlap produces a zero retrieval score."),
    make_quiz_question(32, "Why is the query converted to lowercase?", "To make matching case-insensitive", ["To create a PDF", "To add graph edges", "To change a student's name"], "Lowercasing lets 'Graph' and 'graph' match consistently."),
    make_quiz_question(33, "Why is punctuation normalized during tokenization?", "To compare meaningful terms consistently", ["To draw arrows", "To calculate attendance", "To generate roll numbers"], "Removing punctuation simplifies term comparison."),
    make_quiz_question(34, "What is a matched term?", "A query term also found in a document", ["A graph coordinate", "A quiz explanation", "A report footer"], "Matched terms show the overlap supporting a result score."),
    make_quiz_question(35, "What does top-k retrieval control?", "How many ranked documents are returned", ["How many graph colors exist", "How many students log in", "How many PDF fonts load"], "Top-k limits the number of results shown."),
    make_quiz_question(36, "Why can a graph improve discovery?", "It exposes related concepts not obvious from one document", ["It removes all relationships", "It prevents searching", "It hides matched terms"], "Relationships can reveal useful neighboring concepts."),
    make_quiz_question(37, "What is entity extraction?", "Finding meaningful entities in text", ["Sorting PDF pages", "Selecting quiz options", "Changing chart height"], "Entity extraction identifies concepts that can become graph nodes."),
    make_quiz_question(38, "What is relationship extraction?", "Finding how entities are connected", ["Removing stopwords", "Counting students", "Downloading CSV files"], "Relationship extraction identifies links between entities."),
    make_quiz_question(39, "What is hybrid retrieval?", "A combination of lexical and semantic retrieval", ["A graph with no nodes", "A quiz with no answers", "A PDF with no text"], "Hybrid systems combine complementary retrieval methods."),
    make_quiz_question(40, "What is BM25 commonly used for?", "Lexical document ranking", ["Graph drawing", "PDF image editing", "Student registration"], "BM25 is a well-known lexical retrieval ranking method."),
    make_quiz_question(41, "What is an information need?", "The information a user wants to obtain", ["A graph coordinate", "A report footer", "A node color"], "An information need motivates the user's query."),
    make_quiz_question(42, "Why inspect matched terms?", "To understand why a document was retrieved", ["To change the answer key", "To delete entities", "To hide the score"], "Matched terms make the lightweight ranking process transparent."),
    make_quiz_question(43, "What does the trial log record?", "Queries, selected documents, scores, and graph connections", ["Only passwords", "Only quiz explanations", "Only graph colors"], "The log captures the learner's experimental observations."),
    make_quiz_question(44, "Why record multiple trials?", "To compare retrieval and graph context across queries", ["To remove the corpus", "To avoid using the graph", "To change PDF fonts"], "Multiple trials support comparison and analysis."),
    make_quiz_question(45, "What is the selected document used for?", "It becomes the graph exploration entry point", ["It becomes a stopword", "It becomes a quiz option", "It becomes a page footer"], "The selected result determines the displayed graph neighborhood."),
    make_quiz_question(46, "What does a graph neighborhood contain?", "A focus node and its connected nodes", ["Only unrelated documents", "Only quiz scores", "Only report notes"], "A neighborhood is the local context around a focus node."),
    make_quiz_question(47, "Why is an in-memory graph suitable here?", "It keeps the demonstration small and self-contained", ["It requires a production database", "It prevents visualization", "It removes all entities"], "The assignment permits a small frontend graph without Neo4j."),
    make_quiz_question(48, "What is the main difference between a document and an entity node?", "A document stores retrievable text while an entity represents a concept", ["They are always identical", "Only entities can have labels", "Documents cannot have relationships"], "The two node types play different roles in the integrated model."),
    make_quiz_question(49, "What should a good observation mention?", "Evidence from retrieval results and graph exploration", ["Only the student's name", "Only the PDF file name", "Only the quiz title"], "Observations should interpret the experiment's recorded evidence."),
    make_quiz_question(50, "What is the final goal of this virtual experiment?", "Understand how retrieval and graph context complement each other", ["Replace every query with a PDF", "Remove all document ranking", "Use graph nodes without meaning"], "The experiment demonstrates the complementary value of IR and knowledge graphs."),
])


# =============================================================================
# 6. PDF REPORT
# =============================================================================

class LabReportPDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(24, 59, 99)
        self.cell(
            0, 10,
            f"Page {self.page_no()}/{{nb}} | KGIRS Virtual Laboratory",
            align="C"
        )


def pdf_safe(text):
    """Convert text to characters supported by FPDF core Helvetica font."""
    text = str(text)
    replacements = {
        "•": "-",
        "–": "-",
        "—": "-",
        "“": '"',
        "”": '"',
        "‘": "'",
        "’": "'",
        "…": "...",
        "→": "->",
        "←": "<-",
        "↔": "<->",
        "≥": ">=",
        "≤": "<=",
        "×": "x",
        "°": " degrees",
        "₹": "Rs.",
        "\u00a0": " ",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    # FPDF core fonts use Latin-1. Replace any remaining unsupported chars.
    return text.encode("latin-1", errors="replace").decode("latin-1")


def graph_figure_png(selected_doc):
    """Export the same focused graph shown in the simulation as a PNG."""
    if not selected_doc:
        return None

    figure = build_graph_figure([selected_doc], focus_node=selected_doc)
    return figure.to_image(format="png", width=1200, height=700, scale=1)


def generate_pdf_report(
    student_name,
    student_id,
    college_name,
    date_str,
    trials_df,
    quiz_score,
    quiz_total,
    student_notes,
    selected_doc=None,
    graph_context=None
):
    pdf = LabReportPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.set_text_color(15, 23, 42)
    pdf.set_font("Helvetica", "B", 15)
    pdf.multi_cell(0, 8, pdf_safe(EXPERIMENT_CONFIG["title"]))
    pdf.ln(2)

    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(24, 59, 99)
    pdf.multi_cell(
        0, 5,
        pdf_safe(f"Course: {EXPERIMENT_CONFIG['course']}\n"
        f"Student Name: {student_name or 'Not entered'}\n"
        f"Student Roll Number: {student_id or 'Not entered'}\n"
        f"College: {college_name or 'Not entered'}\n"
        f"Experiment Date: {date_str}")
    )
    pdf.ln(4)

    def heading(text):
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(30, 58, 138)
        pdf.cell(0, 7, pdf_safe(text), new_x="LMARGIN", new_y="NEXT")

    def body(text):
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(24, 59, 99)
        pdf.multi_cell(0, 5, pdf_safe(text))
        pdf.ln(2)

    heading("1. Aim")
    body(THEORY_CONTENT["aim"])

    heading("2. Learning Objectives")
    for obj in EXPERIMENT_CONFIG["objectives"]:
        body("- " + obj)

    heading("3. Procedure")
    for i, step in enumerate(THEORY_CONTENT["procedure"], start=1):
        body(f"{i}. {step}")

    heading("4. Recorded Experimental Trials")
    if trials_df.empty:
        body("No trials were recorded.")
    else:
        cols = list(trials_df.columns)
        col_w = max(24, 190 / len(cols))

        pdf.set_font("Helvetica", "B", 7)
        pdf.set_text_color(255, 255, 255)
        pdf.set_fill_color(37, 99, 235)

        for col in cols:
            pdf.cell(col_w, 6, pdf_safe(str(col)[:15]), 1, 0, "C", True)
        pdf.ln()

        pdf.set_font("Helvetica", "", 7)
        pdf.set_text_color(30, 41, 59)

        for _, row in trials_df.iterrows():
            for col in cols:
                value = str(row[col])
                pdf.cell(col_w, 5, pdf_safe(value[:15]), 1, 0, "C")
            pdf.ln()

    heading("5. Graph Context Captured")
    if selected_doc and graph_context:
        body(f"Selected retrieval document: {selected_doc}")
        for src, relation, dst in graph_context:
            body(f"{src} --{relation}--> {dst}")
    else:
        body("No graph context was captured from the simulation.")

    if selected_doc:
        try:
            graph_image = graph_figure_png(selected_doc)
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as image_file:
                image_file.write(graph_image)
                graph_image_path = image_file.name
            try:
                pdf.set_font("Helvetica", "B", 9)
                pdf.set_text_color(51, 65, 85)
                pdf.cell(0, 6, "Simulation Diagram", new_x="LMARGIN", new_y="NEXT")
                pdf.image(graph_image_path, w=180)
                pdf.ln(3)
            finally:
                os.unlink(graph_image_path)
        except (ImportError, ValueError, RuntimeError) as error:
            body(
                "The simulation diagram could not be embedded. Install the "
                f"dependencies from requirements.txt. Details: {error}"
            )

    pdf.ln(5)
    heading("6. Quiz Evaluation")
    percentage = int((quiz_score / quiz_total) * 100) if quiz_total else 0
    body(f"Score: {quiz_score} / {quiz_total} ({percentage}%)")

    heading("7. Observations and Analysis")
    notes = student_notes.strip() or "No observations were provided."
    body(notes)

    heading("8. Result")
    body(
        "The integrated IR and Knowledge Graph workflow was demonstrated using "
        "a small frontend graph. Relevant documents were retrieved for user "
        "queries and their connected entities and relationships were explored."
    )

    return bytes(pdf.output())


def generate_certificate(student_name, student_id, college_name, quiz_score, quiz_total, date_str):
    pdf = LabReportPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page(orientation="L")
    page_width = 297
    page_height = 210

    # Single minimal border matching the supplied certificate layout.
    pdf.set_draw_color(35, 35, 35)
    pdf.set_line_width(0.6)
    pdf.rect(12, 12, page_width - 24, page_height - 24)

    pdf.set_text_color(35, 35, 35)
    pdf.set_font("Helvetica", "B", 27)
    pdf.set_y(30)
    pdf.cell(0, 14, "CERTIFICATE", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "B", 15)
    pdf.cell(0, 9, "OF COMPLETION", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 12)
    pdf.ln(10)
    pdf.cell(0, 8, "This is to certify that", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "I", 22)
    pdf.cell(0, 14, pdf_safe(student_name or "Student Name"), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(80, 80, 80)
    pdf.line(70, 92, 227, 92)

    pdf.set_font("Helvetica", "", 12)
    pdf.set_y(101)
    pdf.cell(0, 8, "has successfully completed the Virtual Lab", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 9, pdf_safe(EXPERIMENT_CONFIG["short_title"]), align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 12)
    pdf.set_y(132)
    pdf.cell(0, 8, pdf_safe(f"Roll No.     :   {student_id or 'Not entered'}"), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, pdf_safe(f"College      :   {college_name or 'Not entered'}"), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, pdf_safe(f"Quiz Score   :   {quiz_score}/{quiz_total}"), align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_y(177)
    pdf.cell(90, 8, pdf_safe(f"Date:   {date_str}"), align="L")
    pdf.set_x(190)
    pdf.cell(75, 8, "Authorised by", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(190)
    pdf.line(190, 176, 265, 176)
    return bytes(pdf.output())


def build_certificate_preview(student_name, student_id, college_name, quiz_score, quiz_total, date_str):
    figure = go.Figure()
    figure.add_shape(
        type="rect",
        x0=0.03, y0=0.04, x1=0.97, y1=0.96,
        line=dict(color="#232323", width=2),
        fillcolor="white"
    )
    annotations = [
        dict(x=0.5, y=0.84, text="CERTIFICATE", font=dict(size=32, color="#232323", family="Georgia"), showarrow=False),
        dict(x=0.5, y=0.76, text="OF COMPLETION", font=dict(size=18, color="#232323", family="Georgia"), showarrow=False),
        dict(x=0.5, y=0.66, text="This is to certify that", font=dict(size=15, color="#183b63"), showarrow=False),
        dict(x=0.5, y=0.56, text=student_name or "Student Name", font=dict(size=27, color="#232323", family="Georgia"), showarrow=False),
        dict(x=0.5, y=0.47, text="has successfully completed the Virtual Lab", font=dict(size=14, color="#183b63"), showarrow=False),
        dict(x=0.5, y=0.41, text=EXPERIMENT_CONFIG["short_title"], font=dict(size=16, color="#183b63"), showarrow=False),
        dict(x=0.5, y=0.30, text=f"Roll No.     :   {student_id or 'Not entered'}", font=dict(size=14, color="#183b63"), showarrow=False),
        dict(x=0.5, y=0.24, text=f"College      :   {college_name or 'Not entered'}", font=dict(size=14, color="#183b63"), showarrow=False),
        dict(x=0.5, y=0.18, text=f"Quiz Score   :   {quiz_score}/{quiz_total}", font=dict(size=14, color="#183b63"), showarrow=False),
        dict(x=0.15, y=0.10, text=f"Date:   {date_str}", font=dict(size=13, color="#183b63"), showarrow=False),
        dict(x=0.83, y=0.10, text="Authorised by", font=dict(size=13, color="#183b63"), showarrow=False),
    ]
    figure.update_layout(
        annotations=annotations,
        shapes=[
            dict(type="line", x0=0.25, y0=0.525, x1=0.75, y1=0.525, line=dict(color="#505050", width=1)),
            dict(type="line", x0=0.72, y0=0.13, x1=0.93, y1=0.13, line=dict(color="#505050", width=1)),
        ],
        height=620,
        margin=dict(l=0, r=0, t=0, b=0),
        paper_bgcolor="white",
        plot_bgcolor="white",
        xaxis=dict(visible=False, range=[0, 1], fixedrange=True),
        yaxis=dict(visible=False, range=[0, 1], fixedrange=True),
    )
    return figure


# =============================================================================
# 7. STREAMLIT SECTIONS
# =============================================================================

def render_page_header(title, description=None):
    st.markdown(f"<h1 class='display-title'>{title}</h1>", unsafe_allow_html=True)
    if description:
        st.markdown(f"<p class='lead-copy'>{description}</p>", unsafe_allow_html=True)


def render_black_table(dataframe):
    styled_table = dataframe.style.set_table_styles([
        {
            "selector": "th",
            "props": [
                ("color", "#000000"),
                ("background-color", "#ffffff"),
                ("font-weight", "700"),
            ],
        },
        {
            "selector": "td",
            "props": [("color", "#000000")],
        },
    ])
    st.table(styled_table)


def render_purpose_section():
    use_cases = [
        ("Search Engines", "Retrieve documents, then use entity relationships to provide richer context.", ("search", "engine")),
        ("Academic Search", "Find papers and explore connected authors, topics, datasets, and research.", ("academic", "search")),
        ("Question Answering", "Combine relevant text with connected facts for more contextual answers.", ("q & a",)),
        ("Recommendation & Discovery", "Reveal related information beyond the initially retrieved document.", ("recom", "disc")),
    ]
    image_files = sorted(
        path for path in Path(__file__).resolve().parent.iterdir()
        if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}
    )
    available_images = image_files.copy()
    assigned_images = []
    for _, _, keywords in use_cases:
        matched = next(
            (path for path in available_images if all(keyword in path.stem.lower() for keyword in keywords)),
            None,
        )
        if matched is None:
            matched = next(
                (path for path in available_images if any(keyword in path.stem.lower() for keyword in keywords)),
                None,
            )
        if matched is None and available_images:
            matched = available_images[0]
        assigned_images.append(matched)
        if matched is not None:
            available_images.remove(matched)

    use_case_cards = []
    mime_types = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}
    for (title, description, _), image_path in zip(use_cases, assigned_images):
        image_html = ""
        if image_path is not None:
            encoded = base64.b64encode(image_path.read_bytes()).decode("ascii")
            image_html = (
                f'<div class="use-case-image"><img src="data:{mime_types[image_path.suffix.lower()]};base64,{encoded}" '
                f'alt="{title} educational illustration"></div>'
            )
        use_case_cards.append(
            f'<article><div class="use-case-copy"><h3>{title}</h3><p>{description}</p></div>{image_html}</article>'
        )

    st.markdown(
        f"""
        <section class="purpose-hero fade-up">
          <span class="page-kicker">EXPERIMENT 14 · VIRTUAL LABORATORY</span>
          <h1>Experiment 14: Integration of Information Retrieval with Knowledge Graphs</h1>
        </section>

        <h2 class="section-title compact-title">What are we combining?</h2>
        <div class="combine-grid">
          <article class="learning-card ir-card fade-up">
            <div class="learning-icon" aria-hidden="true"><span class="search-ring"></span><span class="search-lines">≡</span></div>
            <div><span class="eyebrow">SEARCH &amp; RANKING</span><h3>Information Retrieval</h3><p>Finds and ranks relevant documents for a user's query.</p></div>
          </article>
          <div class="combine-mark" aria-hidden="true">+</div>
          <article class="learning-card kg-card fade-up delay-1">
            <div class="learning-icon graph-symbol" aria-hidden="true">●—●<br><small>╲ ●</small></div>
            <div><span class="eyebrow">CONNECTED MEANING</span><h3>Knowledge Graph</h3><p>Represents entities and relationships so related context can be explored.</p></div>
          </article>
        </div>
        <div class="integration-flow" aria-label="Integrated retrieval workflow">
          <div><span>⌕</span><b>Query</b></div><i>→</i>
          <div><span>▤</span><b>Retrieve Relevant Documents</b></div><i>→</i>
          <div><span>●—●</span><b>Connect Entities</b></div><i>→</i>
          <div><span>↗</span><b>Explore Context</b></div>
        </div>

        <h2 class="section-title compact-title">Why is this useful?</h2>
        <div class="use-case-grid">
          {''.join(use_case_cards)}
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_theory_section():
    st.markdown("<h1 class='display-title'>Theory</h1>", unsafe_allow_html=True)

    st.markdown(
        """
        <div class="concept-grid">
          <article class="concept-card fade-up"><div class="concept-icon visual-search"><span></span></div><h3>Information Retrieval</h3><p>A query is compared with a document collection, producing a relevance-ranked result list.</p><div class="micro-diagram"><b>Query</b><i>→</i><em>D1</em><em>D2</em><em>D3</em></div></article>
          <article class="concept-card fade-up delay-1"><div class="concept-icon nodes-icon">●—●</div><h3>Knowledge Graph</h3><p>Documents and entities become nodes; labelled edges explain how those nodes relate.</p><div class="micro-graph"><b>●</b><i>USES</i><b>●</b><i>SUPPORTS</i><b>●</b></div></article>
          <article class="concept-card fade-up delay-2"><div class="concept-icon">↗</div><h3>Graph-Enhanced Retrieval</h3><p>A retrieved document becomes an entry point to connected concepts and additional context.</p><div class="micro-diagram"><em>▤ Result</em><i>→</i><b>Connected context</b></div></article>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("<h2 class='section-title'>Experiment workflow</h2>", unsafe_allow_html=True)
    workflow = [
        ('<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>', "User Query", "Describe the information need"),
        ('<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/></svg>', "Information Retrieval", "Match and score the corpus"),
        ('<svg viewBox="0 0 24 24"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>', "Ranked Documents", "Review the strongest results"),
        ('<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>', "Select Document", "Choose a graph entry point"),
        ('<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="m8 7 8 0M7 8l4 8M17 8l-4 8"/></svg>', "Knowledge Graph", "Traverse connected nodes"),
        ('<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="12" cy="19" r="2"/><path d="m6.5 10.5 4-4M13.5 6.5l4 4M17.5 13.5l-4 4M10.5 17.5l-4-4"/></svg>', "Entities + Relationships", "Read structured context"),
        ('<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5z"/></svg>', "Contextual Exploration", "Interpret the wider meaning"),
    ]
    workflow_html = '<div class="workflow-strip">'
    for index, (icon, title, subtitle) in enumerate(workflow):
        workflow_html += f'<div class="workflow-node" tabindex="0"><span class="workflow-icon" aria-hidden="true">{icon}</span><strong>{title}</strong><small>{subtitle}</small></div>'
        if index < len(workflow) - 1:
            workflow_html += '<div class="flow-arrow">→</div>'
    workflow_html += '</div>'
    st.markdown(workflow_html, unsafe_allow_html=True)

    left, right = st.columns([1, 1], gap="large")
    with left:
        st.markdown(
            """<div class="comparison-card traditional fade-up"><span class="eyebrow">TRADITIONAL IR</span><h3>Find the relevant text</h3><div class="mini-flow"><b>Query</b><i>→</i><b>Relevant documents</b></div><p>The workflow ends with a ranked list.</p></div>""",
            unsafe_allow_html=True,
        )
    with right:
        st.markdown(
            """<div class="comparison-card integrated fade-up delay-1"><span class="eyebrow">THIS EXPERIMENT</span><h3>Find the text and its context</h3><div class="mini-flow"><b>Query</b><i>→</i><b>Documents</b><i>→</i><b>Graph</b><i>→</i><b>Context</b></div><p>Graph traversal reveals related concepts and relationships.</p></div>""",
            unsafe_allow_html=True,
        )

    st.markdown("<h2 class='section-title'>A worked IR + Knowledge Graph example</h2>", unsafe_allow_html=True)
    st.markdown(
        """
        <section class="worked-example" aria-label="Query to contextual exploration demonstration">
          <div class="worked-stages">
            <article class="worked-stage retrieval-stage">
              <div class="stage-heading"><span>①</span><div><small>INFORMATION</small><strong>RETRIEVAL</strong></div></div>
              <p class="stage-question">What does retrieval do?</p>
              <div class="query-panel"><small>USER QUERY</small><q>knowledge graph retrieval</q></div>
              <div class="stage-down-arrow" aria-hidden="true">↓</div>
              <div class="ranked-result"><small>RANKED RESULT</small><strong>D2</strong><span>Top result</span></div>
            </article>
            <div class="worked-arrow" aria-hidden="true">→</div>
            <article class="worked-stage document-stage">
              <div class="stage-heading"><span>②</span><div><small>RETRIEVED</small><strong>DOCUMENT</strong></div></div>
              <p class="stage-question">What did retrieval find?</p>
              <div class="document-id">D2</div>
              <h3>Knowledge Graphs for Information Retrieval</h3>
              <p class="document-snippet">Knowledge graphs organize entities and relationships to provide structured context for retrieved information.</p>
              <div class="matched-terms"><small>MATCHED TERMS</small><span>knowledge</span><span>graph</span><span>retrieval</span></div>
            </article>
            <div class="worked-arrow" aria-hidden="true">→</div>
            <article class="worked-stage graph-stage">
              <div class="stage-heading"><span>③</span><div><small>KNOWLEDGE</small><strong>GRAPH</strong></div></div>
              <p class="stage-question">What additional context can the graph provide?</p>
              <div class="worked-graph" aria-label="D2 connects to Knowledge Graph using USES and Information Retrieval using ENRICHES">
                <div class="worked-node document-graph-node">D2</div>
                <div class="graph-branch branch-one"><span>USES</span></div>
                <div class="graph-branch branch-two"><span>ENRICHES</span></div>
                <div class="worked-node entity-one">Knowledge Graph</div>
                <div class="worked-node entity-two">Information Retrieval</div>
              </div>
              <p class="graph-note"><b>Knowledge Graph</b> <span>COMPLEMENTED_BY</span> <b>Information Retrieval</b></p>
            </article>
          </div>
          <div class="context-result"><span>↗</span><div><b>Contextual Exploration</b><p>Explore the entities and relationships connected to the retrieved document.</p></div></div>
        </section>
        """,
        unsafe_allow_html=True,
    )


def render_stage_indicator(results, selected_doc):
    active_stage = 3 if selected_doc else 2 if results else 1
    labels = [("1", "Query & Retrieval"), ("2", "Select Document"), ("3", "Explore Knowledge Graph")]
    html = '<div class="stage-indicator">'
    for index, (number, label) in enumerate(labels, 1):
        state = "active" if index == active_stage else "complete" if index < active_stage else "pending"
        html += f'<div class="stage {state}"><span>{number}</span><div><small>STEP {number}</small><strong>{label}</strong></div></div>'
        if index < 3:
            html += '<div class="stage-connector">→</div>'
    html += '</div>'
    st.markdown(html, unsafe_allow_html=True)


def reset_graph_playground(selected_doc):
    """Reset playground widgets before Streamlit recreates them on rerun."""
    st.session_state["playground_node"] = selected_doc
    st.session_state["playground_depth"] = 1
    st.session_state["playground_relationship"] = "All relationships"
    st.session_state["playground_layout"] = "Academic"
    st.session_state["playground_labels"] = True


def reset_graph_playground_from_selection():
    """Keep playground focus synchronized when the retrieved document changes."""
    reset_graph_playground(st.session_state.get("selected_doc"))


if hasattr(st, "dialog"):
    dialog_decorator = st.dialog
elif hasattr(st, "experimental_dialog"):
    dialog_decorator = st.experimental_dialog
else:
    def dialog_decorator(*args, **kwargs):
        def decorator(func):
            def wrapper(*a, **kw):
                return func(*a, **kw)
            return wrapper
        return decorator


@dialog_decorator("Knowledge Graph — Expanded View", width="large")
def render_expanded_graph(selected_doc, context_depth, relationship_filter, show_labels, layout_name):
    """Reuse the active graph and controls in a larger inspection view."""
    node_labels = {node_id: label for node_id, _, label in GRAPH_NODES}
    st.caption(f"Exploring {selected_doc} · {node_labels.get(selected_doc, selected_doc)}")
    expanded_figure = build_graph_figure(
        {selected_doc},
        focus_node=selected_doc,
        context_depth=context_depth,
        relationship_filter=relationship_filter,
        show_relationship_labels=show_labels,
        layout_name=layout_name,
        graph_height=680,
    )
    st.plotly_chart(
        expanded_figure,
        use_container_width=True,
        config={"displayModeBar": True, "responsive": True, "scrollZoom": True},
    )
    st.caption("Scroll to zoom, drag to pan, and hover over nodes or relationships to inspect details.")
    if st.button("Close Expanded View", use_container_width=True):
        st.rerun()


def render_simulation_section():
    st.markdown("<h1>IR + Knowledge Graph Simulation</h1></div><p>Retrieve → select → explore</p></div>", unsafe_allow_html=True)

    results = st.session_state.get("retrieval_results", [])
    current_selected = st.session_state.get("selected_doc")
    selectable_docs = [result["Document ID"] for result in results]
    if results and current_selected not in selectable_docs:
        current_selected = selectable_docs[0]
        st.session_state["selected_doc"] = current_selected
        reset_graph_playground(current_selected)
    render_stage_indicator(results, current_selected)

    left, center, right = st.columns([1, 1.35, 1.7], gap="small")

    with left:
        st.markdown("<div class='panel-heading'><span>STAGE 1</span><h3>Enter Query</h3></div>", unsafe_allow_html=True)
        query = st.text_input(
            "Search query",
            value=st.session_state.get("current_query", "knowledge graph retrieval"),
            placeholder="e.g. semantic search",
            key="simulation_query_input",
        )
        top_k = st.slider("Top-K documents", 1, 5, 5, key="simulation_top_k")
        if st.button("Run Retrieval", type="primary", use_container_width=True):
            st.session_state["current_query"] = query
            st.session_state["retrieval_results"] = retrieve_documents(query, top_k)
            st.session_state["selected_doc"] = None
            st.session_state["selected_graph_context"] = []
            st.rerun()
        st.markdown(
            "<div class='method-note'><b>Transparent scoring</b><br>Keyword overlap + a small title-match bonus.</div>",
            unsafe_allow_html=True,
        )

    results = st.session_state.get("retrieval_results", [])
    selected_doc = None
    with center:
        st.markdown("<div class='panel-heading'><span>STAGE 2</span><h3>Retrieved Documents</h3></div>", unsafe_allow_html=True)
        if not results:
            st.markdown("<div class='empty-panel'><b>No results yet</b><span>Run a query to rank the document corpus.</span></div>", unsafe_allow_html=True)
        else:
            selected_doc = st.radio(
                "Choose a document",
                options=selectable_docs,
                key="selected_doc",
                on_change=reset_graph_playground_from_selection,
                format_func=lambda doc_id: next(
                    f"{item['Document ID']} · {item['Document']}  —  {item['Score']:.3f}"
                    for item in results if item["Document ID"] == doc_id
                ),
                label_visibility="collapsed",
            )
            selected_result = next(item for item in results if item["Document ID"] == selected_doc)
            selected_info = next(doc for doc in DOCUMENTS if doc["id"] == selected_doc)
            st.markdown(
                f"""<div class="selected-document">
                <div><span>SELECTED · {selected_doc}</span><b>{selected_info['title']}</b></div>
                <strong>{selected_result['Score']:.3f}<small>SCORE</small></strong>
                <p>{selected_info['text']}</p>
                <em>Matched: {selected_result['Matched Terms']}</em>
                </div>""",
                unsafe_allow_html=True,
            )

    with right:
        st.markdown("<div class='panel-heading graph-panel-title'><span>STAGE 3</span><h3>Knowledge Graph</h3></div>", unsafe_allow_html=True)
        if not selected_doc:
            st.markdown("<div class='empty-panel graph-empty'><b>Graph awaiting a document</b><span>Your selected result will become the exploration entry point.</span></div>", unsafe_allow_html=True)
        else:
            context = connected_context(selected_doc)
            st.session_state["selected_graph_context"] = context
            relationship_types = sorted({relation for _, _, relation in GRAPH_EDGES})

            relationship_filter = st.selectbox(
                "Relationship",
                ["All relationships", *relationship_types],
                key="playground_relationship",
            )

            control_a, control_b = st.columns([1.2, 0.8], gap="small")
            with control_a:
                context_depth = st.selectbox(
                    "Context",
                    [1, 2],
                    format_func=lambda value: f"{value}-hop",
                    key="playground_depth",
                )
            with control_b:
                layout_name = st.selectbox("Layout", ["Academic", "Radial"], key="playground_layout")

            labels_col, reset_col = st.columns([1.25, 0.75])
            with labels_col:
                show_labels = st.checkbox("Show relationship labels", value=True, key="playground_labels")
            with reset_col:
                st.button(
                    "Reset View",
                    use_container_width=True,
                    on_click=reset_graph_playground,
                    args=(selected_doc,),
                )

            visible_nodes, visible_edges = graph_neighborhood(selected_doc, context_depth, relationship_filter)
            expand_spacer, expand_control = st.columns([1.55, 0.65])
            with expand_spacer:
                st.caption("Interactive graph · hover to inspect")
            with expand_control:
                if st.button("⛶ Expand Graph", use_container_width=True, key="expand_graph"):
                    render_expanded_graph(
                        selected_doc,
                        context_depth,
                        relationship_filter,
                        show_labels,
                        layout_name,
                    )
            fig = build_graph_figure(
                {selected_doc},
                focus_node=selected_doc,
                context_depth=context_depth,
                relationship_filter=relationship_filter,
                show_relationship_labels=show_labels,
                layout_name=layout_name,
                graph_height=315,
            )
            st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False, "responsive": True, "scrollZoom": False})
            st.caption(f"Showing {len(visible_nodes)} nodes and {len(visible_edges)} relationships · square = document · circle = entity")

    if selected_doc and results:
        context = connected_context(selected_doc)
        connected_entities = []
        node_labels = {node_id: label for node_id, _, label in GRAPH_NODES}
        for src, _, dst in context:
            candidate = dst if dst.startswith("E") else src if src.startswith("E") else None
            if candidate and candidate not in connected_entities:
                connected_entities.append(candidate)
        names = ", ".join(node_labels[node_id] for node_id in connected_entities)
        st.markdown(f"<div class='insight-bar'><b>Integrated result</b><span>{selected_doc} connects retrieval evidence to {names or 'no entity context'}.</span></div>", unsafe_allow_html=True)

        with st.expander("Experimental Data Log Book", expanded=False):
            action_col, download_col, clear_col = st.columns([1, 1, 0.8])
            with action_col:
                if st.button("Record Current Trial", type="secondary", use_container_width=True):
                    trial = {
                        "Trial #": len(st.session_state["trials"]) + 1,
                        "Query": st.session_state.get("current_query", query),
                        "Retrieved Doc": selected_doc,
                        "Top Score": results[0]["Score"],
                        "Graph Connections": len(context),
                        "Timestamp": datetime.now().strftime("%H:%M:%S"),
                    }
                    st.session_state["trials"].append(trial)
                    st.toast(f"Trial #{trial['Trial #']} recorded.")
            trial_df = pd.DataFrame(st.session_state["trials"])
            with download_col:
                st.download_button(
                    "Download Trial Data (CSV)",
                    data=trial_df.to_csv(index=False).encode("utf-8"),
                    file_name="experiment_14_trials.csv",
                    mime="text/csv",
                    use_container_width=True,
                    disabled=trial_df.empty,
                )
            with clear_col:
                if st.button("Clear Trial Log", use_container_width=True, disabled=trial_df.empty):
                    st.session_state["trials"] = []
                    st.rerun()
            if not trial_df.empty:
                render_black_table(trial_df)


def render_quiz_section():
    render_page_header(
        "Assessment Quiz",
        "Test your understanding of information retrieval and graph-enhanced context.",
    )
    st.write("Answer all questions and submit the quiz for immediate feedback.")

    identity_col1, identity_col2 = st.columns(2)
    with identity_col1:
        st.text_input("Student Name", key="student_name")
    with identity_col2:
        st.text_input("Student Roll Number", key="student_id")

    st.text_input("College Name", key="college_name")

    if st.button("Generate New 10-Question Quiz", type="secondary"):
        st.session_state["quiz_questions"] = random.sample(QUIZ_QUESTIONS, 10)
        st.session_state["quiz_submitted"] = False
        st.session_state["quiz_score"] = 0
        st.rerun()

    quiz_questions = st.session_state["quiz_questions"]

    with st.form("experiment_14_quiz"):
        responses = {}

        for display_number, q in enumerate(quiz_questions, start=1):
            st.subheader(f"Question {display_number}")
            selected = st.radio(
                q["question"],
                q["options"],
                index=None,
                key=f"q_{q['id']}"
            )
            responses[q["id"]] = (
                q["options"].index(selected) if selected is not None else None
            )

        submitted = st.form_submit_button(
            "Submit Quiz for Grading",
            # type="primary"
        )

    if submitted:
        score = 0

        st.divider()
        st.subheader("Evaluation Results")

        for display_number, q in enumerate(quiz_questions, start=1):
            user_answer = responses[q["id"]]

            if user_answer is None:
                st.warning(
                    f"Question {display_number}: Not answered. "
                    f"Correct answer: {q['options'][q['answer_index']]} "
                    f"- {q['explanation']}"
                )
            elif user_answer == q["answer_index"]:
                score += 1
                st.success(
                    f"Question {display_number}: Correct - {q['explanation']}"
                )
            else:
                st.error(
                    f"Question {display_number}: Incorrect. "
                    f"Correct answer: {q['options'][q['answer_index']]} "
                    f"- {q['explanation']}"
                )

        st.session_state["quiz_score"] = score
        st.session_state["quiz_submitted"] = True

        st.session_state["quiz_total"] = len(quiz_questions)
        percentage = score / len(quiz_questions) * 100
        st.info(
            f"Final Score: **{score}/{len(quiz_questions)} "
            f"({percentage:.0f}%)**"
        )


def render_report_section():
    render_page_header(
        "Report Generation",
        "Review your trials, observations, graph context, and quiz result before downloading the report.",
    )

    col1, col2 = st.columns(2)

    with col1:
        student_name = st.text_input(
            "Student Name",
            key="student_name"
        )

    with col2:
        student_id = st.text_input(
            "Student Roll Number",
            key="student_id"
        )

    college_name = st.text_input("College Name", key="college_name")

    lab_date = st.date_input(
        "Experiment Date",
        key="experiment_date"
    )

    st.session_state["student_info"] = {
        "name": student_name,
        "id": student_id,
        "college": college_name,
        "date": str(lab_date)
    }

    st.subheader("Observations and Analysis")
    student_notes = st.text_area(
        "Enter your observations, interpretation and conclusion:",
        key="report_observations",
        height=160,
        placeholder=(
            "Example: The retrieved documents provided entry points into the "
            "knowledge graph. Graph traversal exposed entities and relationships "
            "that added contextual information to the retrieval results."
        )
    )

    # Use the current widget return value so the same rerun reaches the PDF.
    student_notes = student_notes.strip()

    st.divider()
    st.subheader("Report Preview")

    st.write(f"**Experiment:** {EXPERIMENT_CONFIG['title']}")
    st.write(f"**Student:** {student_name or 'Not entered'}")
    st.write(f"**Roll Number:** {student_id}")
    st.write(f"**Date:** {lab_date}")
    st.write(f"**Observations:** {student_notes or 'No observations were provided.'}")

    score = st.session_state.get("quiz_score", 0)
    quiz_total = st.session_state.get("quiz_total", 10)
    st.write(
        f"**Quiz:** {score}/{quiz_total}"
    )

    trials_df = (
        pd.DataFrame(st.session_state["trials"])
        if st.session_state["trials"]
        else pd.DataFrame()
    )

    if not trials_df.empty:
        render_black_table(trials_df)
    else:
        st.info("No simulation trials have been recorded yet.")

    selected_doc = st.session_state.get("selected_doc")
    graph_context = st.session_state.get("selected_graph_context", [])
    if selected_doc:
        st.subheader("Graph Context From Simulation")
        st.caption(f"The report includes the graph neighborhood for {selected_doc}.")
        st.plotly_chart(
            build_graph_figure(graph_context and [selected_doc], focus_node=selected_doc),
            use_container_width=True,
            config={"displayModeBar": False, "responsive": True, "scrollZoom": False}
        )
        if graph_context:
            render_black_table(
                pd.DataFrame(graph_context, columns=["From", "Relationship", "To"])
            )
    else:
        st.info("Run and select a simulation document to include its graph diagram.")

    pdf_bytes = generate_pdf_report(
        student_name=student_name,
        student_id=student_id,
        college_name=college_name,
        date_str=str(lab_date),
        trials_df=trials_df,
        quiz_score=score,
        quiz_total=quiz_total,
        student_notes=student_notes,
        selected_doc=selected_doc,
        graph_context=graph_context
    )

    st.download_button(
        "Download Experiment 14 Report (PDF)",
        data=pdf_bytes,
        file_name="KGIRS_Experiment_14_Report.pdf",
        mime="application/pdf",
        type="primary",
        use_container_width=True
    )


def render_certificate_section():
    render_page_header(
        "Certificate",
        "Preview and download your virtual laboratory completion certificate.",
    )
    student_name = st.session_state.get("student_name", "")
    student_id = st.session_state.get("student_id", "")
    college_name = st.session_state.get("college_name", "")
    quiz_score = st.session_state.get("quiz_score", 0)
    quiz_total = st.session_state.get("quiz_total", 10)
    lab_date = st.session_state.get("experiment_date", datetime.now().date())

    certificate = generate_certificate(
        student_name,
        student_id,
        college_name,
        quiz_score,
        quiz_total,
        str(lab_date)
    )
    st.plotly_chart(
        build_certificate_preview(
            student_name,
            student_id,
            college_name,
            quiz_score,
            quiz_total,
            str(lab_date)
        ),
        use_container_width=True,
        config={"displayModeBar": False, "staticPlot": True}
    )
    st.download_button(
        "Download Certificate (PDF)",
        data=certificate,
        file_name="KGIRS_Experiment_14_Certificate.pdf",
        mime="application/pdf",
        type="primary",
        use_container_width=True
    )


def render_references_section():
    render_page_header(
        "References",
        "Sources used for the virtual laboratory content and presentation.",
    )
    st.caption("References used for the virtual laboratory content and presentation.")
    for index, reference in enumerate(REFERENCES, 1):
        st.write(f"**{index}.** {reference}")


# =============================================================================
# 8. SESSION STATE + MAIN
# =============================================================================

def init_session_state():
    defaults = {
        "trials": [],
        "quiz_score": 0,
        "quiz_submitted": False,
        "quiz_questions": random.sample(QUIZ_QUESTIONS, 10),
        "quiz_total": 10,
        "retrieval_results": [],
        "current_query": "knowledge graph retrieval",
        "selected_doc": None,
        "selected_graph_context": [],
        "student_name": "",
        "student_id": EXPERIMENT_CONFIG["roll_no"],
        "college_name": EXPERIMENT_CONFIG["college"],
        "experiment_date": datetime.now().date(),
        "student_info": {
            "name": "",
            "id": EXPERIMENT_CONFIG["roll_no"],
            "college": EXPERIMENT_CONFIG["college"],
            "date": str(datetime.now().date())
        },
        "report_observations": ""
    }

    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


def main():
    st.set_page_config(
        page_title="KGIRS Experiment 14",
        page_icon="",
        layout="wide"
    )

    init_session_state()

    st.markdown(
        """
        <style>
        :root {
          --vlab-navy:#173b5f; --vlab-blue:#246b9e; --vlab-red:#b42332;
          --vlab-gold:#a66f00; --vlab-ink:#17212b; --vlab-muted:#435466;
          --vlab-line:#d8e0e7; --vlab-surface:#ffffff; --vlab-soft:#f6f8fa;
          --vlab-hover:#eef4f7; --vlab-disabled:#e9edf1;
        }
        html { font-size:16px; }
        html,body,[data-testid="stAppViewContainer"],.stApp,[data-testid="stMain"],
        [data-testid="stMainBlockContainer"],section.main { background:#ffffff !important; }
        .stApp {
          color:var(--vlab-ink); font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
          font-size:15px;
        }
        [data-testid="stHeader"] { background:rgba(255,255,255,.96) !important; }
        [data-testid="stMainBlockContainer"] { max-width:1500px; padding:1.15rem 1.35rem 1.75rem; }
        [data-testid="stSidebar"] { background:#ffffff !important; border-right:1px solid var(--vlab-line); }
        [data-testid="stSidebarContent"],[data-testid="stSidebarUserContent"] { background:#ffffff !important; }
        [data-testid="stSidebar"] p,[data-testid="stSidebar"] label,
        [data-testid="stSidebar"] span,[data-testid="stSidebar"] div { color:var(--vlab-ink); }
        [data-testid="stSidebar"] [role="radiogroup"] label {
          background:#ffffff; border:1px solid transparent; border-radius:6px; padding:.46rem .55rem;
        }
        [data-testid="stSidebar"] [role="radiogroup"] label:hover { background:var(--vlab-hover); border-color:var(--vlab-line); }
        [data-testid="stSidebar"] [aria-checked="true"] { background:var(--vlab-hover) !important; }
        h1,h2,h3,h4,h5,h6 { color:var(--vlab-navy); font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; letter-spacing:0; }
        h1,[data-testid="stHeadingWithActionElements"] h1 { font-size:1.9rem; line-height:1.2; margin:.15rem 0 .55rem; }
        h2,[data-testid="stHeadingWithActionElements"] h2 { font-size:1.4rem; line-height:1.25; }
        h3,[data-testid="stHeadingWithActionElements"] h3 { font-size:1.08rem; line-height:1.3; }
        p,li,label,small,strong,em,[data-testid="stCaptionContainer"],
        [data-testid="stMarkdownContainer"],[data-testid="stText"] { color:var(--vlab-ink); }
        [data-testid="stMarkdownContainer"] p,[data-testid="stMarkdownContainer"] li { font-size:.95rem; line-height:1.55; }
        [data-testid="stCaptionContainer"] { color:var(--vlab-muted) !important; font-size:.82rem; }
        .display-title { font-size:1.95rem; line-height:1.15; margin:.08rem 0 .55rem; border:0; }
        .page-kicker,.eyebrow { color:var(--vlab-red); font-size:.78rem; font-weight:800; letter-spacing:.06em; }
        .lead-copy { max-width:800px; color:var(--vlab-muted) !important; font-size:1rem !important; line-height:1.6; margin:0 0 1rem; }
        .section-title { margin:1.35rem 0 .68rem; font-size:1.38rem; }
        [data-testid="stWidgetLabel"] p { color:var(--vlab-ink) !important; font-size:.88rem !important; font-weight:700; }

        .aim-panel,.concept-card,.vocab-card,.comparison-card,.purpose-path>div,
        .stage-indicator,.method-note,.empty-panel,.selected-document,.insight-bar {
          background:var(--vlab-surface); border:1px solid var(--vlab-line); border-radius:7px;
          box-shadow:0 2px 8px rgba(23,59,95,.055);
        }
        .aim-panel { display:flex; gap:1.1rem; align-items:center; border-left:4px solid var(--vlab-red); padding:1.1rem 1.25rem; }
        .aim-panel p { margin:.3rem 0 0; font-size:1rem !important; line-height:1.6; }
        .aim-icon { display:grid; place-items:center; width:52px; height:52px; flex:0 0 52px; border-radius:50%; background:var(--vlab-hover); color:var(--vlab-blue); font-size:1.7rem; }
        .purpose-path { display:grid; grid-template-columns:1fr auto 1fr auto 1fr; gap:.7rem; align-items:center; margin:.85rem 0; }
        .purpose-path>div { min-height:116px; padding:.9rem; }
        .purpose-path span { color:var(--vlab-red); font-weight:800; font-size:.78rem; }
        .purpose-path strong,.purpose-path small { display:block; }
        .purpose-path strong { margin:.3rem 0; font-size:1.05rem; }
        .purpose-path small { color:var(--vlab-muted); line-height:1.45; font-size:.86rem; }
        .purpose-path>b { color:var(--vlab-blue); font-size:1.3rem; }
        .concept-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:.8rem; }
        .concept-card,.vocab-card,.comparison-card,.learning-card,.use-case-grid article { transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease; }
        .concept-card:hover,.vocab-card:hover,.comparison-card:hover,.learning-card:hover,.use-case-grid article:hover { transform:translateY(-4px); box-shadow:0 8px 18px rgba(23,59,95,.11); border-color:#9fb4c4; }
        .learning-card:hover .learning-icon,.use-case-grid article:hover img { transform:scale(1.025); }
        .learning-icon,.use-case-grid article img { transition:transform .2s ease; }
        .concept-card { padding:1rem; min-height:160px; }
        .concept-card h3,.vocab-card h3,.comparison-card h3 { margin:.42rem 0; font-size:1.06rem; }
        .concept-card p,.vocab-card p,.comparison-card p { color:var(--vlab-muted) !important; font-size:.92rem !important; line-height:1.5; margin:0; }
        .concept-icon { display:grid; place-items:center; width:40px; height:40px; border-radius:6px; background:var(--vlab-hover); color:var(--vlab-blue); font-size:1.4rem; font-weight:800; }
        .nodes-icon { font-size:1rem; color:var(--vlab-red); }
        .workflow-strip { display:flex; align-items:stretch; overflow-x:auto; padding:.1rem 0 .55rem; scrollbar-width:thin; }
        .workflow-node { flex:1 0 126px; background:#ffffff; border:1px solid var(--vlab-line); border-top:3px solid var(--vlab-blue); padding:.72rem; min-height:96px; position:relative; overflow:hidden; transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease; }
        .workflow-node:first-child{border-radius:7px 0 0 7px}.workflow-node:last-child{border-radius:0 7px 7px 0}
        .workflow-node:hover,.workflow-node:focus-visible { transform:translateY(-3px); box-shadow:0 7px 16px rgba(23,59,95,.1); border-color:#9fb4c4; z-index:2; outline:none; }
        .workflow-icon { display:grid; place-items:center; width:30px; height:30px; border-radius:6px; background:var(--vlab-hover); color:var(--vlab-blue); }
        .workflow-icon svg { width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
        .workflow-node strong,.workflow-node small{display:block}.workflow-node strong{font-size:.88rem;margin:.38rem 0 0}
        .workflow-node small{font-size:.76rem;color:var(--vlab-muted);line-height:1.35;max-height:0;opacity:0;transform:translateY(5px);overflow:hidden;transition:max-height .2s ease,opacity .18s ease,transform .2s ease,margin .2s ease}
        .workflow-node:hover small,.workflow-node:focus-visible small{max-height:3em;opacity:1;transform:translateY(0);margin-top:.3rem}
        .flow-arrow{display:grid;place-items:center;color:var(--vlab-blue);background:#ffffff;font-weight:800;padding:.15rem}
        .comparison-card { padding:1rem 1.15rem; min-height:158px; }
        .comparison-card.integrated { border-top:3px solid var(--vlab-red); }.comparison-card.traditional { border-top:3px solid var(--vlab-blue); }
        .mini-flow { display:flex; align-items:center; flex-wrap:wrap; gap:.35rem; margin:.7rem 0; }
        .mini-flow b { background:var(--vlab-soft); border:1px solid var(--vlab-line); border-radius:5px; padding:.4rem .52rem; font-size:.82rem; }
        .mini-flow i { color:var(--vlab-red); font-style:normal; }
        .vocab-card { min-height:174px; padding:.95rem 1rem; }.vocab-visual { height:48px; display:flex; align-items:center; color:var(--vlab-blue); font-size:1.65rem; font-weight:800; }
        .mini-graph { display:flex; justify-content:center; align-items:center; gap:.75rem; padding:1rem; margin:.9rem 0; background:var(--vlab-soft); border:1px solid var(--vlab-line); border-radius:7px; }
        .graph-node { padding:.65rem .82rem; background:#ffffff; color:var(--vlab-ink); font-weight:700; box-shadow:0 2px 7px rgba(23,59,95,.07); }
        .document-node { border-radius:5px; border:2px solid var(--vlab-blue); }.entity-node { border-radius:999px; border:2px solid var(--vlab-gold); }
        .graph-line { width:84px; height:2px; background:var(--vlab-blue); position:relative; }.graph-line:after { content:'›'; position:absolute; right:-4px; top:-14px; color:var(--vlab-blue); font-size:1.4rem; }
        .graph-line span { position:absolute; left:50%; transform:translateX(-50%); top:-21px; font-size:.74rem; color:var(--vlab-muted); }

        .purpose-hero { border-left:4px solid var(--vlab-red); padding:.15rem 0 .2rem 1.1rem; margin-bottom:.7rem; max-width:1100px; }
        .purpose-hero h1 { font-size:2.05rem; margin:.25rem 0 .38rem; }
        .purpose-hero p { max-width:900px; color:var(--vlab-muted); font-size:.98rem; line-height:1.55; margin:0; }
        .compact-title { margin:1rem 0 .55rem; }
        .combine-grid { display:grid; grid-template-columns:1fr auto 1fr; gap:.65rem; align-items:stretch; }
        .learning-card { display:flex; align-items:center; gap:.9rem; border:1px solid var(--vlab-line); border-radius:7px; padding:.85rem 1rem; background:var(--vlab-surface); }
        .learning-card h3 { margin:.2rem 0; }.learning-card p { margin:0; color:var(--vlab-muted)!important; font-size:.88rem!important; }
        .learning-icon { width:48px; height:48px; flex:0 0 48px; display:grid; place-items:center; border-radius:6px; background:var(--vlab-hover); color:var(--vlab-blue); font-weight:800; }
        .graph-symbol { color:var(--vlab-red); line-height:1; }.graph-symbol small { color:var(--vlab-gold); }
        .combine-mark { display:grid; place-items:center; color:var(--vlab-red); font-size:1.45rem; font-weight:800; }
        .integration-flow { display:grid; grid-template-columns:auto auto auto auto auto auto auto; align-items:center; justify-content:center; gap:.55rem; margin:.65rem 0; padding:.65rem; background:var(--vlab-soft); border:1px solid var(--vlab-line); border-radius:7px; }
        .integration-flow div { display:flex; align-items:center; gap:.35rem; font-size:.82rem; }.integration-flow span { color:var(--vlab-blue); font-size:1.1rem; }.integration-flow i { color:var(--vlab-red); font-style:normal; }
        .use-case-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:1rem; margin-bottom:.35rem; }
        .use-case-grid article { display:flex; flex-direction:column; min-width:0; min-height:380px; overflow:hidden; border-top:3px solid var(--vlab-blue); background:var(--vlab-surface); border-left:1px solid var(--vlab-line); border-right:1px solid var(--vlab-line); border-bottom:1px solid var(--vlab-line); border-radius:7px; }
        .use-case-image { width:100%; height:240px; overflow:hidden; background:var(--vlab-soft); border-top:1px solid var(--vlab-line); }
        .use-case-image img { display:block; width:100%; height:100%; object-fit:contain; object-position:center; }
        .use-case-copy { min-height:138px; padding:1rem 1.05rem 1.1rem; }.use-case-grid h3 { font-size:1.05rem; margin:0 0 .38rem; }.use-case-grid p { color:var(--vlab-muted)!important; font-size:.9rem!important; line-height:1.5!important; margin:0; }
        .micro-diagram,.micro-graph { display:flex; align-items:center; gap:.28rem; margin-top:.65rem; font-size:.72rem; color:var(--vlab-muted); }
        .micro-diagram b,.micro-diagram em { border:1px solid var(--vlab-line); border-radius:4px; padding:.2rem .32rem; font-style:normal; }.micro-diagram i { color:var(--vlab-red); font-style:normal; }.micro-graph b { color:var(--vlab-gold); font-size:1rem; }.micro-graph i { color:var(--vlab-muted); font-size:.65rem; font-style:normal; }
        .visual-search span { width:17px; height:17px; border:3px solid currentColor; border-radius:50%; position:relative; }.visual-search span:after { content:''; width:9px; height:3px; background:currentColor; position:absolute; right:-7px; bottom:-4px; transform:rotate(45deg); }
        .worked-example { margin:.2rem auto 1rem; padding:.9rem; background:var(--vlab-soft); border:1px solid var(--vlab-line); border-radius:7px; }
        .worked-stages { display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr); gap:.65rem; align-items:stretch; }
        .worked-stage { min-width:0; min-height:330px; display:flex; flex-direction:column; padding:.9rem; background:var(--vlab-surface); border:1px solid var(--vlab-line); border-top:3px solid var(--vlab-blue); border-radius:7px; box-shadow:0 2px 8px rgba(23,59,95,.055); }
        .document-stage { border-top-color:var(--vlab-red); }.graph-stage { border-top-color:var(--vlab-gold); }
        .stage-heading { display:flex; align-items:center; gap:.5rem; min-width:0; }.stage-heading>span { flex:0 0 auto; color:var(--vlab-red); font-size:1.5rem; font-weight:800; }.stage-heading div { min-width:0; }.stage-heading small,.stage-heading strong { display:block; letter-spacing:.04em; }.stage-heading small { color:var(--vlab-muted); font-size:.68rem; }.stage-heading strong { color:var(--vlab-navy); font-size:.92rem; }
        .stage-question { min-height:2.7em; color:var(--vlab-muted)!important; font-size:.78rem!important; line-height:1.35!important; margin:.65rem 0!important; }
        .worked-arrow { display:grid; place-items:center; color:var(--vlab-red); font-size:1.2rem; font-weight:800; }
        .query-panel,.ranked-result { padding:.65rem; border:1px solid var(--vlab-line); border-radius:6px; background:var(--vlab-soft); }.query-panel small,.ranked-result small,.matched-terms small { display:block; color:var(--vlab-red); font-size:.65rem; font-weight:800; letter-spacing:.05em; }.query-panel q { display:block; margin-top:.32rem; color:var(--vlab-ink); font-size:.9rem; font-weight:700; }.stage-down-arrow { flex:1; display:grid; place-items:center; min-height:34px; color:var(--vlab-blue); font-weight:800; }.ranked-result { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:end; gap:.2rem .5rem; }.ranked-result small { grid-column:1/-1; }.ranked-result strong { color:var(--vlab-blue); font-size:1.35rem; }.ranked-result span { color:var(--vlab-muted); font-size:.75rem; }
        .document-id { width:42px; height:42px; display:grid; place-items:center; border-radius:5px; background:var(--vlab-blue); color:#ffffff; font-weight:800; }.document-stage h3 { margin:.65rem 0 .35rem; font-size:1rem; line-height:1.35; }.document-snippet { color:var(--vlab-muted)!important; font-size:.78rem!important; line-height:1.42!important; margin:0 0 auto!important; }.matched-terms { display:flex; flex-wrap:wrap; gap:.3rem; margin-top:.7rem; }.matched-terms small { flex-basis:100%; }.matched-terms span { padding:.2rem .38rem; border:1px solid var(--vlab-line); border-radius:4px; background:var(--vlab-soft); color:var(--vlab-blue); font-size:.7rem; font-weight:700; }
        .worked-graph { position:relative; min-height:166px; margin:auto 0 .4rem; }.worked-node { position:absolute; z-index:2; display:grid; place-items:center; text-align:center; padding:.36rem .45rem; background:var(--vlab-surface); font-size:.7rem; font-weight:700; line-height:1.2; }.document-graph-node { left:50%; top:2px; transform:translateX(-50%); width:44px; height:36px; border:2px solid var(--vlab-blue); border-radius:5px; color:var(--vlab-blue); }.entity-one,.entity-two { bottom:2px; width:43%; min-height:48px; border:2px solid var(--vlab-gold); border-radius:999px; }.entity-one { left:1%; }.entity-two { right:1%; }.graph-branch { position:absolute; z-index:1; top:36px; width:2px; height:68px; background:var(--vlab-blue); transform-origin:top; }.branch-one { left:48%; transform:rotate(37deg); }.branch-two { right:48%; transform:rotate(-37deg); }.graph-branch span { position:absolute; top:29px; padding:.08rem .22rem; background:var(--vlab-surface); color:var(--vlab-red); font-size:.58rem; font-weight:800; }.branch-one span { right:3px; transform:rotate(-37deg); }.branch-two span { left:3px; transform:rotate(37deg); }.graph-note { text-align:center; color:var(--vlab-muted)!important; font-size:.67rem!important; line-height:1.35!important; margin:.25rem 0 0!important; }.graph-note span { color:var(--vlab-red); font-size:.59rem; font-weight:800; }
        .context-result { max-width:720px; margin:.75rem auto 0; display:flex; align-items:center; text-align:left; gap:.6rem; padding:.6rem .75rem; background:var(--vlab-hover); border-left:4px solid var(--vlab-red); }.context-result>span { color:var(--vlab-blue); font-size:1.3rem; }.context-result p { color:var(--vlab-muted)!important; font-size:.8rem!important; margin:.1rem 0 0; }

        .simulation-heading { display:flex; justify-content:space-between; align-items:end; margin-bottom:.3rem; }
        .simulation-heading span { color:var(--vlab-red); font-size:.76rem; font-weight:800; letter-spacing:.06em; }
        .simulation-heading h1 { font-size:1.95rem; margin:.08rem 0 .55rem; }.simulation-heading p { color:var(--vlab-muted); font-size:.86rem; margin:0 0 .2rem; }
        .stage-indicator { display:grid; grid-template-columns:1fr auto 1fr auto 1fr; align-items:center; margin:.4rem 0 .65rem; padding:.4rem; }
        .stage { display:flex; align-items:center; gap:.5rem; padding:.36rem .55rem; border-radius:5px; }
        .stage>span { display:grid; place-items:center; width:29px; height:29px; border-radius:50%; background:#e5eaee; color:#435466; font-weight:800; }
        .stage small,.stage strong { display:block; }.stage small { font-size:.74rem; color:var(--vlab-muted); }.stage strong { font-size:.84rem; }
        .stage.active { background:var(--vlab-hover); }.stage.active>span { background:var(--vlab-red); color:#ffffff; }.stage.complete>span { background:var(--vlab-blue); color:#ffffff; }
        .stage-connector { color:#71869a; font-weight:800; }
        .panel-heading { border-bottom:1px solid var(--vlab-line); margin-bottom:.38rem; padding:.08rem 0 .32rem; }
        .panel-heading span { color:var(--vlab-red); font-size:.74rem; font-weight:800; letter-spacing:.06em; }.panel-heading h3 { font-size:1rem; margin:0; }
        .method-note { margin-top:.5rem; padding:.62rem; color:var(--vlab-muted); font-size:.82rem; line-height:1.42; }
        .empty-panel { min-height:238px; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:1rem; color:var(--vlab-muted); }
        .empty-panel span { color:var(--vlab-muted); font-size:.86rem; }.empty-panel b { color:var(--vlab-navy); margin-bottom:.3rem; }.graph-empty { min-height:365px; }
        [data-testid="stMain"] [data-testid="stRadio"] label { padding:.34rem .44rem; border:1px solid #7f8a94; border-radius:5px; margin-bottom:.18rem; background:#ffffff; line-height:1.25; }
        [data-testid="stMain"] [data-testid="stRadio"] label:hover { border-color:var(--vlab-blue); background:var(--vlab-hover); }
        [data-testid="stMain"] [data-testid="stRadio"] p { color:var(--vlab-ink) !important; font-size:.82rem !important; }
        [data-testid="stForm"] [data-testid="stRadio"] label { border:0; background:transparent; }
        [data-testid="stForm"] [data-testid="stRadio"] label:hover { border-color:transparent; background:transparent; }
        .selected-document { margin-top:.42rem; padding:.62rem .7rem; display:grid; grid-template-columns:1fr auto; gap:.25rem .5rem; }
        .selected-document span,.selected-document b,.selected-document small { display:block; }.selected-document span { color:var(--vlab-red); font-size:.74rem; font-weight:800; }
        .selected-document b { color:var(--vlab-ink); font-size:.86rem; }.selected-document>strong { color:var(--vlab-blue); font-size:1.12rem; text-align:right; }
        .selected-document small { color:var(--vlab-muted); font-size:.72rem; }.selected-document p { grid-column:1/-1; font-size:.81rem !important; line-height:1.4; color:var(--vlab-muted) !important; margin:.18rem 0; }
        .selected-document em { grid-column:1/-1; font-size:.78rem; color:var(--vlab-blue); font-style:normal; }
        .insight-bar { margin-top:.5rem; padding:.58rem .8rem; display:flex; gap:.75rem; align-items:center; font-size:.84rem; }
        .insight-bar b { color:var(--vlab-red); white-space:nowrap; }.insight-bar span { color:var(--vlab-muted); }

        /* Native Streamlit controls: explicit light surfaces and readable text. */
        [data-baseweb="input"],[data-baseweb="textarea"],[data-baseweb="select"]>div,
        [data-testid="stNumberInput"] input,[data-testid="stTextInput"] input,
        [data-testid="stTextArea"] textarea,[data-testid="stDateInput"] input {
          background:#ffffff !important; color:var(--vlab-ink) !important; border-color:#7f8a94 !important;
        }
        input,textarea,[contenteditable="true"],[data-baseweb="select"] span { color:var(--vlab-ink) !important; caret-color:var(--vlab-ink); }
        input::placeholder,textarea::placeholder { color:#647586 !important; opacity:1; }
        [data-baseweb="popover"],[data-baseweb="menu"],[role="listbox"],
        [data-baseweb="popover"] ul,[data-baseweb="menu"] ul { background:#ffffff !important; color:var(--vlab-ink) !important; }
        [role="option"],[role="option"] * { color:var(--vlab-ink) !important; background:#ffffff; }
        [role="option"]:hover,[role="option"][aria-selected="true"] { background:var(--vlab-hover) !important; }
        [data-testid="stCheckbox"] label,[data-testid="stSlider"] label,[data-testid="stRadio"] label { color:var(--vlab-ink) !important; }
        [data-testid="stSlider"] [role="slider"] { background:var(--vlab-blue) !important; }
        [data-testid="stExpander"] { background:#ffffff; border:1px solid var(--vlab-line); border-radius:7px; box-shadow:none; }
        [data-testid="stExpander"] summary,[data-testid="stExpander"] summary * { color:var(--vlab-ink) !important; font-size:.9rem; font-weight:700; }
        [data-testid="stTabs"] [role="tablist"] { border-bottom-color:var(--vlab-line); }
        [data-testid="stTabs"] [role="tab"],[data-testid="stTabs"] [role="tab"] * { color:var(--vlab-muted) !important; }
        [data-testid="stTabs"] [role="tab"][aria-selected="true"],[data-testid="stTabs"] [role="tab"][aria-selected="true"] * { color:var(--vlab-navy) !important; }
        [data-testid="stMetric"] { background:#ffffff; border:1px solid var(--vlab-line); border-radius:7px; padding:.75rem; }
        [data-testid="stMetricLabel"],[data-testid="stMetricLabel"] *,[data-testid="stMetricValue"],[data-testid="stMetricValue"] * { color:var(--vlab-ink) !important; }
        [data-testid="stAlert"] { background:var(--vlab-soft); border:1px solid var(--vlab-line); color:var(--vlab-ink); }
        [data-testid="stAlert"] * { color:var(--vlab-ink) !important; }

        .stButton>button,.stDownloadButton>button,[data-testid="stFormSubmitButton"]>button {
          min-height:2.45rem; border-radius:6px !important; font-size:.88rem !important; font-weight:700 !important;
          background:#ffffff !important; color:var(--vlab-navy) !important; border:1px solid #9dacb9 !important;
          transition:background .16s ease,border-color .16s ease,box-shadow .16s ease !important;
        }
        .stButton>button:hover,.stDownloadButton>button:hover,[data-testid="stFormSubmitButton"]>button:hover {
          background:var(--vlab-hover) !important; border-color:var(--vlab-blue) !important; box-shadow:0 2px 7px rgba(23,59,95,.11);
        }
        button[kind="primary"],.stDownloadButton button[kind="primary"] { background:var(--vlab-red) !important; color:#ffffff !important; border-color:var(--vlab-red) !important; }
        button[kind="primary"] *,button[kind="primary"] p,.stDownloadButton button[kind="primary"] * { color:#ffffff !important; }
        button[kind="primary"]:hover { background:#8f1c28 !important; border-color:#8f1c28 !important; }
        button:disabled,button:disabled * { background:var(--vlab-disabled) !important; color:#657481 !important; border-color:#cbd3da !important; opacity:1 !important; }

        [data-testid="stTable"] { border:1px solid var(--vlab-line); border-radius:7px; overflow:auto; }
        [data-testid="stTable"] table { background:#ffffff !important; color:var(--vlab-ink) !important; font-size:.84rem; }
        [data-testid="stTable"] th { background:var(--vlab-soft) !important; color:var(--vlab-ink) !important; font-weight:700; padding:.55rem .65rem !important; border-color:var(--vlab-line) !important; }
        [data-testid="stTable"] td { background:#ffffff !important; color:var(--vlab-ink) !important; padding:.5rem .65rem !important; border-color:var(--vlab-line) !important; line-height:1.35; }
        [data-testid="stDataFrame"] { background:#ffffff !important; border:1px solid var(--vlab-line); border-radius:7px; overflow:hidden; }
        [data-testid="stDataFrame"] [role="columnheader"],[data-testid="stDataFrame"] [role="columnheader"] *,
        [data-testid="stDataFrame"] [role="gridcell"],[data-testid="stDataFrame"] [role="gridcell"] * { color:var(--vlab-ink) !important; }
        [data-testid="stPlotlyChart"] { background:#ffffff !important; border:1px solid var(--vlab-line); border-radius:7px; overflow:hidden; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation:fadeUp .35s ease both; }.delay-1 { animation-delay:.06s; }.delay-2 { animation-delay:.12s; }
        @media (prefers-reduced-motion:reduce) { * { animation:none !important; transition:none !important; } }
        @media (max-width:900px) {
          [data-testid="stMainBlockContainer"]{padding:.6rem .8rem 1.25rem}.concept-grid{grid-template-columns:1fr}
          .purpose-path{grid-template-columns:1fr}.purpose-path>b{transform:rotate(90deg);text-align:center}.mini-graph{flex-direction:column}
          .combine-grid,.use-case-grid{grid-template-columns:1fr}.combine-mark{padding:.05rem}.integration-flow{grid-template-columns:1fr;text-align:center}.integration-flow div{justify-content:center}.integration-flow i{transform:rotate(90deg)}
          .worked-stages{grid-template-columns:1fr}.worked-arrow{transform:rotate(90deg);min-height:22px}.worked-stage{min-height:300px}
          .use-case-image{height:210px}.purpose-hero h1{font-size:1.65rem}
          .graph-line{width:2px;height:48px}.graph-line:after{right:-7px;top:30px;transform:rotate(90deg)}
          .stage-indicator{grid-template-columns:1fr}.stage-connector{display:none}.simulation-heading{align-items:start;flex-direction:column}
          .workflow-strip{display:grid;grid-template-columns:1fr;gap:.5rem;padding-bottom:.7rem}.workflow-node{border-radius:7px!important;min-height:86px}.flow-arrow{display:none}.workflow-node small{max-height:3em;opacity:1;transform:none;margin-top:.3rem}
        }
        </style>
        """,
        unsafe_allow_html=True
    )

    section = st.sidebar.radio(
        "Virtual Lab Navigator",
        [
            "Purpose",
            "Theory",
            "Simulation",
            "Quiz",
            "Report Generation",
            "Certificate",
            "References"
        ]
    )

    if section == "Purpose":
        render_purpose_section()
    elif section == "Theory":
        render_theory_section()
    elif section == "Simulation":
        render_simulation_section()
    elif section == "Quiz":
        render_quiz_section()
    elif section == "Report Generation":
        render_report_section()
    elif section == "Certificate":
        render_certificate_section()
    elif section == "References":
        render_references_section()


if __name__ == "__main__":
    main()
