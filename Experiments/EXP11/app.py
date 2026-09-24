import streamlit as st
import networkx as nx
import plotly.graph_objects as go
import pandas as pd
from fpdf import FPDF
from datetime import datetime
import random
import re


# ============================================================
# PAGE CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="Advanced Cypher Queries and Graph Pattern Matching",
    page_icon="🔗",
    layout="wide"
)


# ============================================================
# EXPERIMENT CONFIGURATION
# ============================================================

EXPERIMENT_TITLE = "Advanced Cypher Queries and Graph Pattern Matching"

AIM = """
To understand and simulate advanced Cypher queries involving
multi-hop traversal, filtering, aggregation, and complex graph
pattern matching for efficient retrieval of relationships and
hidden connections.
"""

OBJECTIVES = [
    "Understand Cypher graph pattern matching.",
    "Perform multi-hop graph traversal.",
    "Apply filtering conditions to graph patterns.",
    "Use aggregation to analyze graph relationships.",
    "Discover indirect and hidden connections between nodes.",
    "Relate Cypher queries to their corresponding graph operations."
]

INTRODUCTION = """
Graph databases represent information using nodes and relationships.
Cypher is a declarative query language used with Neo4j to describe
and retrieve graph patterns.

Simple queries can retrieve individual nodes or direct relationships.
Advanced Cypher queries can additionally perform multi-hop traversal,
filtering, aggregation, and complex pattern matching.

This experiment uses a small professional network as a simulation
environment. NetworkX is used as the local graph engine, while the
equivalent Cypher query is displayed for every operation.

Neo4j is not required as a backend for this simulation.
"""

THEORY = """
### Graph Pattern Matching

Cypher represents graph patterns using nodes and relationships.

Example:

MATCH (a:Person)-[:KNOWS]->(b:Person)
RETURN a.name, b.name

This retrieves people connected through a KNOWS relationship.

### Multi-Hop Traversal

Multi-hop traversal follows relationships through multiple levels
of a graph.

Example:

MATCH (a:Person)-[*1..3]->(b:Person)
RETURN b.name

The `*1..3` pattern allows traversal from one to three relationships.

### Filtering

The WHERE clause restricts results according to a condition.

Example:

MATCH (a:Person)-[:WORKS_WITH]->(b:Person)
WHERE b.department = 'AI'
RETURN a.name, b.name

### Aggregation

Cypher provides aggregation functions such as COUNT.

Example:

MATCH (p:Person)-[r]->(connected:Person)
RETURN p.name, COUNT(connected) AS connections

This can be used to determine the number of outgoing connections
for each person.

### Hidden Connections

Multi-hop pattern matching can reveal indirect relationships.

For example:

Alice → Bob → Eve

shows a path between Alice and Eve even though they do not have
a direct relationship.

### Query Processing

The simulation follows this conceptual flow:

Cypher Query
     ↓
Graph Pattern
     ↓
Python Graph Traversal
     ↓
Matching Nodes / Relationships
     ↓
Visualized Result
"""


# ============================================================
# GRAPH DATA
# ============================================================

PEOPLE = {
    "Alice": {
        "role": "Data Scientist",
        "department": "AI",
        "experience": 5
    },
    "Bob": {
        "role": "ML Engineer",
        "department": "AI",
        "experience": 4
    },
    "Carol": {
        "role": "Researcher",
        "department": "Research",
        "experience": 7
    },
    "David": {
        "role": "Software Engineer",
        "department": "Engineering",
        "experience": 6
    },
    "Eve": {
        "role": "Data Analyst",
        "department": "Analytics",
        "experience": 3
    },
    "Frank": {
        "role": "Product Manager",
        "department": "Product",
        "experience": 8
    }
}

RELATIONSHIPS = [
    ("Alice", "Bob", "WORKS_WITH"),
    ("Alice", "Carol", "KNOWS"),
    ("Bob", "Carol", "KNOWS"),
    ("Bob", "David", "KNOWS"),
    ("Bob", "Eve", "FOLLOWS"),
    ("Carol", "David", "WORKS_WITH"),
    ("David", "Eve", "KNOWS"),
    ("David", "Frank", "WORKS_WITH"),
    ("Eve", "Frank", "KNOWS")
]


# ============================================================
# GRAPH CREATION
# ============================================================

def create_graph():

    graph = nx.DiGraph()

    for person, attributes in PEOPLE.items():

        graph.add_node(
            person,
            role=attributes["role"],
            department=attributes["department"],
            experience=attributes["experience"]
        )

    for source, target, relationship in RELATIONSHIPS:

        graph.add_edge(
            source,
            target,
            relationship=relationship
        )

    return graph


G = create_graph()


# ============================================================
# SESSION STATE
# ============================================================

if "pretest_score" not in st.session_state:
    st.session_state.pretest_score = None

if "posttest_score" not in st.session_state:
    st.session_state.posttest_score = None

if "simulation_history" not in st.session_state:
    st.session_state.simulation_history = []

if "trials" not in st.session_state:
    st.session_state.trials = []

if "student_info" not in st.session_state:

    st.session_state.student_info = {
        "name": "",
        "id": "",
        "date": str(datetime.now().date())
    }

if "student_notes" not in st.session_state:
    st.session_state.student_notes = ""

# Randomized answer choices are generated only once per session.
if "pretest_options" not in st.session_state:

    st.session_state.pretest_options = []

    for question in [
        {
            "options": [
                "An entity",
                "A query",
                "An index",
                "A database password"
            ],
            "answer": "An entity"
        },
        {
            "options": [
                "MATCH",
                "SELECT",
                "INSERT",
                "GROUP"
            ],
            "answer": "MATCH"
        },
        {
            "options": [
                "Following multiple relationships",
                "Deleting multiple nodes",
                "Creating multiple databases",
                "Sorting nodes"
            ],
            "answer": "Following multiple relationships"
        },
        {
            "options": [
                "COUNT",
                "NUMBER",
                "TOTAL",
                "SIZEOF"
            ],
            "answer": "COUNT"
        }
    ]:

        options = question["options"].copy()
        random.shuffle(options)
        st.session_state.pretest_options.append(options)


if "posttest_options" not in st.session_state:

    st.session_state.posttest_options = []

    for question in [
        {
            "options": [
                "MATCH",
                "WHERE",
                "COUNT",
                "ORDER BY"
            ],
            "answer": "MATCH"
        },
        {
            "options": [
                "Indirectly connected nodes",
                "Only isolated nodes",
                "Only database tables",
                "Only node labels"
            ],
            "answer": "Indirectly connected nodes"
        },
        {
            "options": [
                "COUNT",
                "MATCH",
                "WHERE",
                "PATH"
            ],
            "answer": "COUNT"
        },
        {
            "options": [
                "WHERE",
                "MATCH",
                "RETURN",
                "CREATE"
            ],
            "answer": "WHERE"
        },
        {
            "options": [
                "Retrieving meaningful relationship patterns",
                "Deleting graph nodes",
                "Converting graphs to images",
                "Removing all relationships"
            ],
            "answer": "Retrieving meaningful relationship patterns"
        }
    ]:

        options = question["options"].copy()
        random.shuffle(options)
        st.session_state.posttest_options.append(options)


# ============================================================
# GRAPH VISUALIZATION
# ============================================================

def draw_graph(
    graph,
    highlighted_nodes=None,
    highlighted_edges=None,
    title="Graph Visualization"
):

    highlighted_nodes = highlighted_nodes or []
    highlighted_edges = highlighted_edges or []

    positions = nx.spring_layout(
        graph,
        seed=42,
        k=2.2
    )

    edge_x = []
    edge_y = []

    for source, target in graph.edges():

        x0, y0 = positions[source]
        x1, y1 = positions[target]

        edge_x.extend(
            [x0, x1, None]
        )

        edge_y.extend(
            [y0, y1, None]
        )

    edge_trace = go.Scatter(
        x=edge_x,
        y=edge_y,
        line=dict(width=1.5),
        hoverinfo="none",
        mode="lines"
    )

    node_x = []
    node_y = []
    node_text = []

    for node in graph.nodes:

        x, y = positions[node]

        node_x.append(x)
        node_y.append(y)

        node_text.append(
            f"<b>{node}</b><br>"
            f"Role: {graph.nodes[node]['role']}<br>"
            f"Department: {graph.nodes[node]['department']}<br>"
            f"Experience: {graph.nodes[node]['experience']} years"
        )

    node_trace = go.Scatter(
        x=node_x,
        y=node_y,
        mode="markers+text",
        text=list(graph.nodes),
        textposition="top center",
        hovertext=node_text,
        hoverinfo="text",
        marker=dict(
            size=30,
            line=dict(width=2)
        )
    )

    fig = go.Figure(
        data=[
            edge_trace,
            node_trace
        ]
    )

    for source, target, data in graph.edges(data=True):

        x0, y0 = positions[source]
        x1, y1 = positions[target]

        relationship = data.get(
            "relationship",
            ""
        )

        fig.add_annotation(
            x=(x0 + x1) / 2,
            y=(y0 + y1) / 2,
            text=relationship,
            showarrow=False,
            font=dict(size=9)
        )

    for node in highlighted_nodes:

        if node in positions:

            x, y = positions[node]

            fig.add_trace(
                go.Scatter(
                    x=[x],
                    y=[y],
                    mode="markers",
                    marker=dict(
                        size=42,
                        symbol="circle-open",
                        line=dict(width=4)
                    ),
                    hoverinfo="skip",
                    showlegend=False
                )
            )

    for source, target in highlighted_edges:

        if source in positions and target in positions:

            x0, y0 = positions[source]
            x1, y1 = positions[target]

            fig.add_trace(
                go.Scatter(
                    x=[x0, x1],
                    y=[y0, y1],
                    mode="lines",
                    line=dict(width=5),
                    hoverinfo="skip",
                    showlegend=False
                )
            )

    fig.update_layout(
        title=title,
        showlegend=False,
        height=600,
        margin=dict(
            l=20,
            r=20,
            t=60,
            b=20
        ),
        xaxis=dict(
            showgrid=False,
            zeroline=False,
            showticklabels=False
        ),
        yaxis=dict(
            showgrid=False,
            zeroline=False,
            showticklabels=False
        )
    )

    st.plotly_chart(
        fig,
        use_container_width=True
    )


# ============================================================
# CYPHER DISPLAY
# ============================================================

def show_cypher(query):

    st.markdown(
        "### Generated / Entered Cypher Query"
    )

    st.code(
        query.strip(),
        language="cypher"
    )


# ============================================================
# SIMULATION HISTORY
# ============================================================

def record_history(
    operation,
    details
):

    st.session_state.simulation_history.append(
        {
            "Operation": operation,
            "Details": details,
            "Time": datetime.now().strftime("%H:%M:%S")
        }
    )


# ============================================================
# SECTION 1 — AIM
# ============================================================

def render_aim():

    st.title(
        "🔗 Advanced Cypher Queries and Graph Pattern Matching"
    )

    st.header("1. Aim")

    st.write(AIM)

    st.subheader("Learning Objectives")

    for index, objective in enumerate(
        OBJECTIVES,
        1
    ):

        st.write(
            f"**{index}.** {objective}"
        )

    st.subheader("Expected Outcome")

    st.info(
        """
        Efficient retrieval of complex relationships and hidden
        connections using graph pattern matching, traversal,
        filtering, and aggregation.
        """
    )


# ============================================================
# SECTION 2 — INTRODUCTION
# ============================================================

def render_introduction():

    st.header("2. Introduction")

    st.write(INTRODUCTION)

    st.subheader("Graph Structure")

    people_df = pd.DataFrame(
        [
            {
                "Name": name,
                "Role": details["role"],
                "Department": details["department"],
                "Experience": details["experience"]
            }
            for name, details in PEOPLE.items()
        ]
    )

    st.dataframe(
        people_df,
        use_container_width=True,
        hide_index=True
    )

    st.subheader("Relationships")

    relationship_df = pd.DataFrame(
        RELATIONSHIPS,
        columns=[
            "Source",
            "Target",
            "Relationship"
        ]
    )

    st.dataframe(
        relationship_df,
        use_container_width=True,
        hide_index=True
    )


# ============================================================
# SECTION 3 — THEORY
# ============================================================

def render_theory():

    st.header("3. Theory")

    st.markdown(THEORY)

    with st.expander("Key Terminology"):

        terms = {
            "Node": "Represents an entity in the graph.",
            "Relationship": "Represents a connection between nodes.",
            "MATCH": "Identifies graph patterns.",
            "WHERE": "Filters matched results.",
            "Multi-hop": "Traversal across multiple relationships.",
            "COUNT": "Aggregates the number of matched elements.",
            "Pattern Matching": "Retrieves graph structures satisfying a specified pattern."
        }

        terminology_df = pd.DataFrame(
            list(terms.items()),
            columns=[
                "Term",
                "Definition"
            ]
        )

        st.table(
            terminology_df
        )


# ============================================================
# PRETEST QUESTIONS
# ============================================================

PRETEST_QUESTIONS = [
    {
        "question": "What does a node represent in a graph database?",
        "answer": "An entity"
    },
    {
        "question": "Which Cypher clause is used for graph pattern matching?",
        "answer": "MATCH"
    },
    {
        "question": "What is multi-hop traversal?",
        "answer": "Following multiple relationships"
    },
    {
        "question": "Which function is commonly used to count graph elements?",
        "answer": "COUNT"
    }
]


# ============================================================
# SECTION 4 — PRETEST
# ============================================================

def render_pretest():

    st.header("4. Pretest")

    st.write(
        "Answer the questions before performing the simulation."
    )

    answers = {}

    for index, question in enumerate(
        PRETEST_QUESTIONS
    ):

        answers[index] = st.radio(
            f"Q{index + 1}. {question['question']}",
            st.session_state.pretest_options[index],
            index=None,
            key=f"pretest_{index}"
        )

    if st.button(
        "Submit Pretest",
        type="primary"
    ):

        if any(
            answer is None
            for answer in answers.values()
        ):

            st.warning(
                "Please answer all questions before submitting."
            )

            return

        score = 0

        for index, question in enumerate(
            PRETEST_QUESTIONS
        ):

            if answers[index] == question["answer"]:
                score += 1

        st.session_state.pretest_score = score

        st.success(
            f"Pretest Score: {score}/{len(PRETEST_QUESTIONS)}"
        )


# ============================================================
# SECTION 5 — CASE STUDY
# ============================================================

def render_case_study():

    st.header("5. Case Study")

    st.write(
        """
        A technology organization maintains a professional network
        containing employees, researchers, engineers, analysts, and
        product managers.

        The organization wants to analyze the network to identify:

        • People reachable through multiple relationship hops.
        • People working with members of a particular department.
        • The number of connections maintained by each person.
        • Indirect connections between two people.

        These tasks demonstrate practical applications of advanced
        Cypher pattern matching.
        """
    )

    st.subheader("Professional Network")

    draw_graph(
        G,
        title="Case Study Graph"
    )

    st.subheader("Example Problem")

    st.info(
        """
        Find whether Alice can reach Frank through indirect
        relationships within three hops.
        """
    )

    st.write(
        """
        The simulation can answer this question by searching for
        simple paths between the two selected nodes.
        """
    )


# ============================================================
# SECTION 6 — PROCEDURE
# ============================================================

def render_procedure():

    st.header("6. Procedure")

    steps = [
        "Review the theoretical background and graph structure.",
        "Complete the Pretest.",
        "Open the Simulation section.",
        "Select a graph operation.",
        "Configure the required nodes, relationships, or filters.",
        "For Custom Query, write a read-only Cypher query using the provided graph.",
        "Observe the generated or entered Cypher query.",
        "Execute the simulation.",
        "Study the retrieved graph elements and highlighted paths.",
        "Record multiple trials using different configurations.",
        "Complete the Posttest.",
        "Review the conclusion and assessment results.",
        "Generate the final PDF report."
    ]

    for index, step in enumerate(
        steps,
        1
    ):

        st.write(
            f"**Step {index}:** {step}"
        )


# ============================================================
# MULTI-HOP TRAVERSAL
# ============================================================

def multi_hop_traversal():

    st.subheader("🔀 Multi-Hop Traversal")

    st.caption(
        "Retrieve nodes reachable from a selected person within a given hop range."
    )

    col1, col2 = st.columns(2)

    with col1:

        start_node = st.selectbox(
            "Starting Person",
            list(PEOPLE.keys()),
            key="multi_start"
        )

    with col2:

        max_hops = st.slider(
            "Maximum Hops",
            min_value=1,
            max_value=3,
            value=2,
            key="multi_hops"
        )

    query = (
        f"MATCH (a:Person {{name: '{start_node}'}})"
        f"-[*1..{max_hops}]->(b:Person)\n"
        "RETURN b.name"
    )

    show_cypher(query)

    if st.button(
        "Execute Query",
        key="run_multi",
        type="primary"
    ):

        reachable = nx.single_source_shortest_path_length(
            G,
            start_node,
            cutoff=max_hops
        )

        result_nodes = [
            node
            for node, distance in reachable.items()
            if node != start_node
        ]

        highlighted_edges = []

        for target in result_nodes:

            try:

                path = nx.shortest_path(
                    G,
                    start_node,
                    target
                )

                for i in range(
                    len(path) - 1
                ):

                    edge = (
                        path[i],
                        path[i + 1]
                    )

                    if edge not in highlighted_edges:
                        highlighted_edges.append(edge)

            except nx.NetworkXNoPath:
                pass

        record_history(
            "Multi-Hop Traversal",
            f"{start_node}, maximum {max_hops} hops"
        )

        st.success(
            f"{len(result_nodes)} reachable node(s) found."
        )

        if result_nodes:

            result_df = pd.DataFrame(
                [
                    {
                        "Person": node,
                        "Department": PEOPLE[node]["department"],
                        "Role": PEOPLE[node]["role"],
                        "Hops": reachable[node]
                    }
                    for node in result_nodes
                ]
            ).sort_values(
                "Hops"
            )

            st.dataframe(
                result_df,
                use_container_width=True,
                hide_index=True
            )

        draw_graph(
            G,
            highlighted_nodes=[
                start_node
            ] + result_nodes,
            highlighted_edges=highlighted_edges,
            title="Multi-Hop Traversal Result"
        )

        record_trial_button(
            "Multi-Hop Traversal",
            f"Start={start_node}, Hops={max_hops}",
            query,
            f"{len(result_nodes)} nodes retrieved"
        )


# ============================================================
# FILTERED PATTERN MATCHING
# ============================================================

def filtered_pattern_matching():

    st.subheader("🔎 Filtered Pattern Matching")

    st.caption(
        "Find WORKS_WITH relationships where the target belongs to a selected department."
    )

    departments = sorted(
        set(
            person["department"]
            for person in PEOPLE.values()
        )
    )

    department = st.selectbox(
        "Target Department",
        departments,
        key="filter_department"
    )

    query = (
        "MATCH (a:Person)-[:WORKS_WITH]->(b:Person)\n"
        f"WHERE b.department = '{department}'\n"
        "RETURN a.name, b.name"
    )

    show_cypher(query)

    if st.button(
        "Execute Query",
        key="run_filter",
        type="primary"
    ):

        matches = []

        highlighted_nodes = []
        highlighted_edges = []

        for source, target, relationship in RELATIONSHIPS:

            if (
                relationship == "WORKS_WITH"
                and PEOPLE[target]["department"] == department
            ):

                matches.append(
                    {
                        "Source": source,
                        "Target": target,
                        "Relationship": relationship
                    }
                )

                highlighted_nodes.extend(
                    [
                        source,
                        target
                    ]
                )

                highlighted_edges.append(
                    (
                        source,
                        target
                    )
                )

        record_history(
            "Filtered Pattern Matching",
            f"Department={department}"
        )

        if matches:

            st.success(
                f"{len(matches)} matching relationship(s) found."
            )

            st.dataframe(
                pd.DataFrame(matches),
                use_container_width=True,
                hide_index=True
            )

        else:

            st.warning(
                "No matching relationships found."
            )

        draw_graph(
            G,
            highlighted_nodes=list(
                set(highlighted_nodes)
            ),
            highlighted_edges=highlighted_edges,
            title="Filtered Pattern Matching Result"
        )

        record_trial_button(
            "Filtered Pattern Matching",
            f"Department={department}",
            query,
            f"{len(matches)} relationship(s) retrieved"
        )


# ============================================================
# RELATIONSHIP FILTERING
# ============================================================

def relationship_filtering():

    st.subheader("🔗 Relationship Filtering")

    relationship_types = sorted(
        set(
            relationship
            for _, _, relationship in RELATIONSHIPS
        )
    )

    selected_relationship = st.selectbox(
        "Relationship Type",
        relationship_types,
        key="relationship_filter"
    )

    query = (
        "MATCH (a:Person)-[r:"
        f"{selected_relationship}"
        "]->(b:Person)\n"
        "RETURN a.name, b.name"
    )

    show_cypher(query)

    if st.button(
        "Execute Query",
        key="run_relationship",
        type="primary"
    ):

        matches = []

        highlighted_nodes = []
        highlighted_edges = []

        for source, target, relationship in RELATIONSHIPS:

            if relationship == selected_relationship:

                matches.append(
                    {
                        "Source": source,
                        "Target": target,
                        "Relationship": relationship
                    }
                )

                highlighted_nodes.extend(
                    [
                        source,
                        target
                    ]
                )

                highlighted_edges.append(
                    (
                        source,
                        target
                    )
                )

        record_history(
            "Relationship Filtering",
            selected_relationship
        )

        st.success(
            f"{len(matches)} relationship(s) found."
        )

        st.dataframe(
            pd.DataFrame(matches),
            use_container_width=True,
            hide_index=True
        )

        draw_graph(
            G,
            highlighted_nodes=list(
                set(highlighted_nodes)
            ),
            highlighted_edges=highlighted_edges,
            title=f"{selected_relationship} Relationships"
        )

        record_trial_button(
            "Relationship Filtering",
            selected_relationship,
            query,
            f"{len(matches)} relationship(s) retrieved"
        )


# ============================================================
# AGGREGATION
# ============================================================

def aggregation_query():

    st.subheader("📊 Aggregation")

    st.caption(
        "Calculate the number of outgoing relationships for each person."
    )

    query = """
MATCH (p:Person)-[r]->(connected:Person)
RETURN p.name, COUNT(connected) AS connections
ORDER BY connections DESC
"""

    show_cypher(query)

    if st.button(
        "Execute Query",
        key="run_aggregation",
        type="primary"
    ):

        connection_counts = []

        for person in PEOPLE:

            connection_counts.append(
                {
                    "Person": person,
                    "Connections": G.out_degree(person)
                }
            )

        result_df = pd.DataFrame(
            connection_counts
        ).sort_values(
            by="Connections",
            ascending=False
        )

        record_history(
            "Aggregation",
            "Count of outgoing connections"
        )

        st.success(
            "Connection counts calculated successfully."
        )

        st.dataframe(
            result_df,
            use_container_width=True,
            hide_index=True
        )

        st.bar_chart(
            result_df.set_index("Person")
        )

        record_trial_button(
            "Aggregation",
            "Connection count",
            query,
            "Connection counts calculated"
        )


# ============================================================
# HIDDEN CONNECTION DISCOVERY
# ============================================================

def hidden_connections():

    st.subheader("🕵️ Hidden Connection Discovery")

    st.caption(
        "Find indirect paths between two selected people."
    )

    col1, col2 = st.columns(2)

    with col1:

        source = st.selectbox(
            "Source Person",
            list(PEOPLE.keys()),
            key="hidden_source"
        )

    with col2:

        target_options = [
            person
            for person in PEOPLE
            if person != source
        ]

        target = st.selectbox(
            "Target Person",
            target_options,
            key="hidden_target"
        )

    max_hops = st.slider(
        "Maximum Path Length",
        min_value=2,
        max_value=3,
        value=3,
        key="hidden_hops"
    )

    query = (
        f"MATCH p = (a:Person {{name: '{source}'}})"
        f"-[*1..{max_hops}]->"
        f"(b:Person {{name: '{target}'}})\n"
        "RETURN p"
    )

    show_cypher(query)

    if st.button(
        "Find Connection",
        key="run_hidden",
        type="primary"
    ):

        paths = list(
            nx.all_simple_paths(
                G,
                source=source,
                target=target,
                cutoff=max_hops
            )
        )

        record_history(
            "Hidden Connection Discovery",
            f"{source} → {target}, maximum {max_hops} hops"
        )

        if paths:

            st.success(
                f"{len(paths)} path(s) found."
            )

            for index, path in enumerate(
                paths,
                1
            ):

                st.write(
                    f"**Path {index}:** "
                    + " → ".join(path)
                )

            shortest_path = min(
                paths,
                key=len
            )

            highlighted_edges = []

            for i in range(
                len(shortest_path) - 1
            ):

                highlighted_edges.append(
                    (
                        shortest_path[i],
                        shortest_path[i + 1]
                    )
                )

            draw_graph(
                G,
                highlighted_nodes=shortest_path,
                highlighted_edges=highlighted_edges,
                title="Hidden Connection Result"
            )

            record_trial_button(
                "Hidden Connection Discovery",
                f"{source} → {target}",
                query,
                f"{len(paths)} path(s) found"
            )

        else:

            st.warning(
                f"No path found between {source} and {target} "
                f"within {max_hops} hops."
            )


# ============================================================
# CUSTOM CYPHER QUERY ENGINE
# ============================================================

def custom_query_engine(query):

    query_clean = query.strip()

    if not query_clean:
        return {
            "success": False,
            "message": "Please enter a Cypher query."
        }

    # --------------------------------------------------------
    # Safety: read-only queries only
    # --------------------------------------------------------

    forbidden_keywords = [
        "CREATE",
        "DELETE",
        "DETACH",
        "SET",
        "REMOVE",
        "MERGE",
        "DROP",
        "LOAD CSV",
        "CALL",
        "FOREACH"
    ]

    query_upper = query_clean.upper()

    for keyword in forbidden_keywords:

        if keyword in query_upper:

            return {
                "success": False,
                "message": (
                    f"'{keyword}' operations are not supported. "
                    "The Custom Query simulator accepts read-only "
                    "MATCH queries only."
                )
            }

    if not query_upper.startswith("MATCH"):

        return {
            "success": False,
            "message": (
                "The Custom Query simulator currently supports "
                "Cypher queries beginning with MATCH."
            )
        }

    # --------------------------------------------------------
    # Extract MATCH pattern
    # --------------------------------------------------------

    match_match = re.search(
        r"MATCH\s+(?:p\s*=\s*)?"
        r"\((\w+):Person"
        r"(?:\s*\{\s*name\s*:\s*['\"]([^'\"]+)['\"]\s*\})?"
        r"\)"
        r"\s*-\s*"
        r"\["
        r"(?:\w+\s*)?"
        r"(?::([A-Za-z_][A-Za-z0-9_]*))?"
        r"(?:\*(\d+)?\.\.(\d+))?"
        r"\]"
        r"\s*->\s*"
        r"\((\w+):Person"
        r"(?:\s*\{\s*name\s*:\s*['\"]([^'\"]+)['\"]\s*\})?"
        r"\)",
        query_clean,
        re.IGNORECASE
    )

    if not match_match:

        return {
            "success": False,
            "message": (
                "Unsupported MATCH pattern. Use a pattern such as:\n\n"
                "MATCH (a:Person)-[:KNOWS]->(b:Person)\n"
                "RETURN a.name, b.name"
            )
        }

    (
        source_var,
        source_name,
        relationship_type,
        min_hops,
        max_hops,
        target_var,
        target_name
    ) = match_match.groups()

    # --------------------------------------------------------
    # Relationship / hop configuration
    # --------------------------------------------------------

    if max_hops:

        min_hops = int(
            min_hops
            if min_hops
            else 1
        )

        max_hops = int(max_hops)

    else:

        min_hops = 1
        max_hops = 1

    if max_hops > 3:

        return {
            "success": False,
            "message": (
                "For this educational simulator, the maximum "
                "supported traversal depth is 3 hops."
            )
        }

    if source_name and source_name not in PEOPLE:

        return {
            "success": False,
            "message": f"Unknown source person: {source_name}"
        }

    if target_name and target_name not in PEOPLE:

        return {
            "success": False,
            "message": f"Unknown target person: {target_name}"
        }

    if relationship_type:

        valid_relationships = {
            relationship
            for _, _, relationship in RELATIONSHIPS
        }

        if relationship_type not in valid_relationships:

            return {
                "success": False,
                "message": (
                    f"Unknown relationship type: "
                    f"{relationship_type}"
                )
            }

    # --------------------------------------------------------
    # WHERE conditions
    # --------------------------------------------------------

    where_match = re.search(
        r"WHERE\s+(.+?)(?=\s+RETURN\b)",
        query_clean,
        re.IGNORECASE | re.DOTALL
    )

    where_condition = (
        where_match.group(1).strip()
        if where_match
        else None
    )

    # --------------------------------------------------------
    # RETURN clause
    # --------------------------------------------------------

    return_match = re.search(
        r"RETURN\s+(.+?)(?:\s+ORDER\s+BY\s+.+)?$",
        query_clean,
        re.IGNORECASE | re.DOTALL
    )

    if not return_match:

        return {
            "success": False,
            "message": "A RETURN clause is required."
        }

    return_clause = return_match.group(1).strip()

    # --------------------------------------------------------
    # Determine paths
    # --------------------------------------------------------

    candidate_sources = (
        [source_name]
        if source_name
        else list(PEOPLE.keys())
    )

    paths = []

    for source in candidate_sources:

        if source not in G:
            continue

        for target in G.nodes:

            if target == source:
                continue

            try:

                all_paths = nx.all_simple_paths(
                    G,
                    source=source,
                    target=target,
                    cutoff=max_hops
                )

                for path in all_paths:

                    path_length = len(path) - 1

                    if path_length < min_hops:
                        continue

                    # Check relationship types along path
                    valid_path = True

                    if relationship_type:

                        for i in range(
                            len(path) - 1
                        ):

                            edge_data = G.get_edge_data(
                                path[i],
                                path[i + 1]
                            )

                            if (
                                edge_data is None
                                or
                                edge_data.get("relationship")
                                != relationship_type
                            ):

                                valid_path = False
                                break

                    if not valid_path:
                        continue

                    if target_name and target != target_name:
                        continue

                    paths.append(path)

            except nx.NetworkXNoPath:
                pass

    # --------------------------------------------------------
    # Apply WHERE filters
    # --------------------------------------------------------

    filtered_paths = []

    for path in paths:

        source = path[0]
        target = path[-1]

        include = True

        if where_condition:

            conditions = re.split(
                r"\s+AND\s+",
                where_condition,
                flags=re.IGNORECASE
            )

            for condition in conditions:

                condition = condition.strip()

                condition_match = re.match(
                    r"(\w+)\.(\w+)\s*"
                    r"(=|<>|>=|<=|>|<)\s*"
                    r"['\"]?([^'\"]+)['\"]?",
                    condition
                )

                if not condition_match:

                    return {
                        "success": False,
                        "message": (
                            "Unsupported WHERE condition. "
                            "Try conditions such as "
                            "b.department = 'AI' or "
                            "a.experience >= 5."
                        )
                    }

                variable, attribute, operator, value = (
                    condition_match.groups()
                )

                person = (
                    source
                    if variable == source_var
                    else target
                )

                if person not in PEOPLE:

                    include = False
                    break

                if attribute not in PEOPLE[person]:

                    return {
                        "success": False,
                        "message": (
                            f"Unknown Person property: "
                            f"{attribute}"
                        )
                    }

                actual = PEOPLE[person][attribute]

                if isinstance(actual, int):

                    try:
                        expected = int(value)
                    except ValueError:

                        return {
                            "success": False,
                            "message": (
                                f"'{value}' is not a valid "
                                f"numeric value."
                            )
                        }

                else:

                    expected = value

                if operator == "=":
                    condition_result = actual == expected

                elif operator == "<>":
                    condition_result = actual != expected

                elif operator == ">":
                    condition_result = actual > expected

                elif operator == "<":
                    condition_result = actual < expected

                elif operator == ">=":
                    condition_result = actual >= expected

                elif operator == "<=":
                    condition_result = actual <= expected

                else:
                    condition_result = False

                if not condition_result:

                    include = False
                    break

        if include:

            filtered_paths.append(path)

    # --------------------------------------------------------
    # Aggregation support
    # --------------------------------------------------------

    count_match = re.search(
        r"COUNT\s*\(\s*(\w+)\s*\)",
        return_clause,
        re.IGNORECASE
    )

    if count_match:

        count_variable = count_match.group(1)

        counts = {}

        for path in filtered_paths:

            person = (
                path[0]
                if count_variable == source_var
                else path[-1]
            )

            counts[person] = (
                counts.get(person, 0) + 1
            )

        rows = [
            {
                "Person": person,
                "Count": count
            }
            for person, count in counts.items()
        ]

        result_df = pd.DataFrame(rows)

        return {
            "success": True,
            "paths": filtered_paths,
            "result": result_df,
            "mode": "aggregation"
        }

    # --------------------------------------------------------
    # Normal RETURN
    # --------------------------------------------------------

    rows = []

    for path in filtered_paths:

        source = path[0]
        target = path[-1]

        row = {}

        return_items = [
            item.strip()
            for item in return_clause.split(",")
        ]

        for item in return_items:

            alias_match = re.match(
                r"(.+?)\s+AS\s+(\w+)$",
                item,
                re.IGNORECASE
            )

            if alias_match:

                expression = alias_match.group(1).strip()
                alias = alias_match.group(2)

            else:

                expression = item
                alias = item

            expression = expression.strip()

            if expression.endswith(".name"):

                variable = expression.split(".")[0]

                value = (
                    source
                    if variable == source_var
                    else target
                )

            elif expression.endswith(".department"):

                variable = expression.split(".")[0]

                person = (
                    source
                    if variable == source_var
                    else target
                )

                value = PEOPLE[person]["department"]

            elif expression.endswith(".role"):

                variable = expression.split(".")[0]

                person = (
                    source
                    if variable == source_var
                    else target
                )

                value = PEOPLE[person]["role"]

            elif expression.endswith(".experience"):

                variable = expression.split(".")[0]

                person = (
                    source
                    if variable == source_var
                    else target
                )

                value = PEOPLE[person]["experience"]

            elif expression.lower() == "p":

                value = " → ".join(path)

            else:

                return {
                    "success": False,
                    "message": (
                        f"Unsupported RETURN expression: "
                        f"{expression}"
                    )
                }

            row[alias] = value

        rows.append(row)

    result_df = pd.DataFrame(rows)

    return {
        "success": True,
        "paths": filtered_paths,
        "result": result_df,
        "mode": "normal"
    }


# ============================================================
# CUSTOM QUERY VISUALIZATION
# ============================================================

def custom_query():

    st.subheader("🧑‍💻 Custom Query")

    st.write(
        """
        Write your own read-only Cypher query and experiment with
        the professional network.

        The simulator interprets the query using the local NetworkX
        graph and displays the corresponding result. Neo4j is not
        required.
        """
    )

    st.info(
        """
        Supported concepts include MATCH, relationship types,
        1–3 hop traversal, WHERE filters, RETURN, COUNT,
        and basic Person properties such as name, department,
        role, and experience.
        """
    )

    st.markdown("### Example Queries")

    example_queries = [
        "MATCH (a:Person)-[:KNOWS]->(b:Person)\nRETURN a.name, b.name",

        "MATCH (a:Person)-[*1..2]->(b:Person)\nRETURN a.name, b.name",

        "MATCH (a:Person)-[:WORKS_WITH]->(b:Person)\nWHERE b.department = 'AI'\nRETURN a.name, b.name",

        "MATCH (a:Person)-[:KNOWS]->(b:Person)\nWHERE a.experience >= 5\nRETURN a.name, b.name",

        "MATCH (a:Person)-[*1..3]->(b:Person)\nWHERE b.department = 'Product'\nRETURN a.name, b.name"
    ]

    selected_example = st.selectbox(
        "Load an Example Query",
        ["-- Select an example --"] + example_queries,
        key="custom_example"
    )

    default_query = ""

    if selected_example != "-- Select an example --":
        default_query = selected_example

    query = st.text_area(
        "Enter your Cypher query:",
        value=default_query,
        height=180,
        placeholder=(
            "MATCH (a:Person)-[:KNOWS]->(b:Person)\n"
            "RETURN a.name, b.name"
        ),
        key="custom_query_input"
    )

    if st.button(
        "Execute Custom Query",
        type="primary",
        key="execute_custom_query"
    ):

        result = custom_query_engine(
            query
        )

        if not result["success"]:

            st.error(
                result["message"]
            )

            return

        paths = result["paths"]
        result_df = result["result"]

        record_history(
            "Custom Query",
            query.replace("\n", " ")
        )

        st.success(
            f"Query executed successfully. "
            f"{len(paths)} matching path(s) found."
        )

        st.markdown("### Query")

        show_cypher(query)

        st.markdown("### Query Result")

        if result_df.empty:

            st.warning(
                "The query executed successfully but returned no records."
            )

        else:

            st.dataframe(
                result_df,
                use_container_width=True,
                hide_index=True
            )

        # ----------------------------------------------------
        # Highlight all matching paths
        # ----------------------------------------------------

        highlighted_nodes = set()
        highlighted_edges = []

        for path in paths:

            for node in path:

                highlighted_nodes.add(node)

            for i in range(
                len(path) - 1
            ):

                edge = (
                    path[i],
                    path[i + 1]
                )

                if edge not in highlighted_edges:

                    highlighted_edges.append(
                        edge
                    )

        if paths:

            draw_graph(
                G,
                highlighted_nodes=list(
                    highlighted_nodes
                ),
                highlighted_edges=highlighted_edges,
                title="Custom Query Result"
            )

        record_trial_button(
            "Custom Query",
            "User-defined Cypher query",
            query,
            f"{len(paths)} matching path(s)"
        )

    with st.expander(
        "Supported Query Syntax"
    ):

        st.markdown(
            """
            **Direct relationship**

            ```cypher
            MATCH (a:Person)-[:KNOWS]->(b:Person)
            RETURN a.name, b.name
            ```

            **Multi-hop traversal**

            ```cypher
            MATCH (a:Person)-[*1..3]->(b:Person)
            RETURN a.name, b.name
            ```

            **Filtering**

            ```cypher
            MATCH (a:Person)-[:WORKS_WITH]->(b:Person)
            WHERE b.department = 'AI'
            RETURN a.name, b.name
            ```

            **Numeric filtering**

            ```cypher
            MATCH (a:Person)-[:KNOWS]->(b:Person)
            WHERE a.experience >= 5
            RETURN a.name, b.name
            ```

            **Path retrieval**

            ```cypher
            MATCH p = (a:Person)-[*1..3]->(b:Person)
            RETURN p
            ```

            **Aggregation**

            ```cypher
            MATCH (a:Person)-[:KNOWS]->(b:Person)
            RETURN a.name, COUNT(b)
            ```
            """
        )


# ============================================================
# SECTION 7 — SIMULATION
# ============================================================

def render_simulation():

    st.header("7. Interactive Simulation")

    st.info(
        """
        Select an operation, configure its parameters, and execute
        the corresponding graph query.

        Use **Custom Query** when you want to write and experiment
        with your own Cypher query.
        """
    )

    operation = st.selectbox(
        "Select Graph Operation",
        [
            "Multi-Hop Traversal",
            "Filtered Pattern Matching",
            "Relationship Filtering",
            "Aggregation",
            "Hidden Connection Discovery",
            "Custom Query"
        ]
    )

    st.divider()

    if operation == "Multi-Hop Traversal":

        multi_hop_traversal()

    elif operation == "Filtered Pattern Matching":

        filtered_pattern_matching()

    elif operation == "Relationship Filtering":

        relationship_filtering()

    elif operation == "Aggregation":

        aggregation_query()

    elif operation == "Hidden Connection Discovery":

        hidden_connections()

    elif operation == "Custom Query":

        custom_query()

    st.divider()

    st.subheader("Recorded Trials")

    if st.session_state.trials:

        trials_df = pd.DataFrame(
            st.session_state.trials
        )

        st.dataframe(
            trials_df,
            use_container_width=True,
            hide_index=True
        )

        if st.button(
            "Clear Recorded Trials",
            key="clear_trials"
        ):

            st.session_state.trials = []

            st.rerun()

    else:

        st.info(
            "No trials have been recorded yet."
        )

    st.subheader("Simulation History")

    if st.session_state.simulation_history:

        history_df = pd.DataFrame(
            st.session_state.simulation_history
        )

        st.dataframe(
            history_df,
            use_container_width=True,
            hide_index=True
        )

    else:

        st.info(
            "No simulation operations have been executed yet."
        )


# ============================================================
# RECORD TRIAL
# ============================================================

def record_trial_button(
    operation,
    configuration,
    query,
    result
):

    st.markdown("### Record Trial")

    if st.button(
        "Record Current Trial",
        key=f"record_{len(st.session_state.trials)}_{operation}"
    ):

        trial = {
            "Trial": len(st.session_state.trials) + 1,
            "Operation": operation,
            "Configuration": configuration,
            "Result": result,
            "Cypher Query": query.strip(),
            "Time": datetime.now().strftime("%H:%M:%S")
        }

        st.session_state.trials.append(
            trial
        )

        st.success(
            "Current trial recorded successfully."
        )


# ============================================================
# POSTTEST QUESTIONS
# ============================================================

POSTTEST_QUESTIONS = [
    {
        "question": "Which Cypher clause is primarily used for graph pattern matching?",
        "answer": "MATCH"
    },
    {
        "question": "What does multi-hop traversal retrieve?",
        "answer": "Indirectly connected nodes"
    },
    {
        "question": "Which function is used for counting matched elements?",
        "answer": "COUNT"
    },
    {
        "question": "Which Cypher clause filters matched results?",
        "answer": "WHERE"
    },
    {
        "question": "What is the main benefit of graph pattern matching?",
        "answer": "Retrieving meaningful relationship patterns"
    }
]


# ============================================================
# SECTION 8 — POSTTEST
# ============================================================

def render_posttest():

    st.header("8. Posttest")

    st.write(
        "Answer the following questions after completing the simulation."
    )

    answers = {}

    for index, question in enumerate(
        POSTTEST_QUESTIONS
    ):

        answers[index] = st.radio(
            f"Q{index + 1}. {question['question']}",
            st.session_state.posttest_options[index],
            index=None,
            key=f"posttest_{index}"
        )

    if st.button(
        "Submit Posttest",
        type="primary"
    ):

        if any(
            answer is None
            for answer in answers.values()
        ):

            st.warning(
                "Please answer all questions before submitting."
            )

            return

        score = 0

        for index, question in enumerate(
            POSTTEST_QUESTIONS
        ):

            if answers[index] == question["answer"]:
                score += 1

        st.session_state.posttest_score = score

        st.success(
            f"Posttest Score: {score}/{len(POSTTEST_QUESTIONS)}"
        )

        if st.session_state.pretest_score is not None:

            improvement = (
                score
                -
                st.session_state.pretest_score
            )

            if improvement > 0:

                st.info(
                    f"Learning improvement: +{improvement} marks"
                )

            elif improvement < 0:

                st.info(
                    f"Score change: {improvement} marks"
                )

            else:

                st.info(
                    "The pretest and posttest scores are the same."
                )


# ============================================================
# PDF REPORT CLASS
# ============================================================

class LabReportPDF(FPDF):

    def footer(self):

        self.set_y(-15)

        self.set_font(
            "Helvetica",
            "I",
            8
        )

        self.set_text_color(
            100,
            100,
            100
        )

        self.cell(
            0,
            10,
            f"Page {self.page_no()}/{{nb}} | Virtual Laboratory Report",
            align="C"
        )


# ============================================================
# PDF REPORT GENERATOR
# ============================================================

def generate_pdf_report(
    student_name,
    student_id,
    date_str,
    trials_df,
    pretest_score,
    posttest_score,
    student_notes
):

    pdf = LabReportPDF()

    pdf.alias_nb_pages()

    pdf.set_auto_page_break(
        auto=True,
        margin=18
    )

    pdf.add_page()

    pdf.set_font(
        "Helvetica",
        "B",
        16
    )

    pdf.cell(
        0,
        10,
        EXPERIMENT_TITLE,
        new_x="LMARGIN",
        new_y="NEXT"
    )

    pdf.ln(4)

    pdf.set_font(
        "Helvetica",
        "B",
        10
    )

    pdf.cell(
        40,
        7,
        "Student Name:"
    )

    pdf.set_font(
        "Helvetica",
        "",
        10
    )

    pdf.cell(
        60,
        7,
        student_name or "N/A"
    )

    pdf.set_font(
        "Helvetica",
        "B",
        10
    )

    pdf.cell(
        35,
        7,
        "Roll / ID:"
    )

    pdf.set_font(
        "Helvetica",
        "",
        10
    )

    pdf.cell(
        50,
        7,
        student_id or "N/A",
        new_x="LMARGIN",
        new_y="NEXT"
    )

    pdf.set_font(
        "Helvetica",
        "B",
        10
    )

    pdf.cell(
        40,
        7,
        "Experiment Date:"
    )

    pdf.set_font(
        "Helvetica",
        "",
        10
    )

    pdf.cell(
        60,
        7,
        date_str or "N/A",
        new_x="LMARGIN",
        new_y="NEXT"
    )

    pdf.ln(5)

    pdf.set_font(
        "Helvetica",
        "B",
        12
    )

    pdf.cell(
        0,
        8,
        "1. Aim",
        new_x="LMARGIN",
        new_y="NEXT"
    )

    pdf.set_font(
        "Helvetica",
        "",
        9
    )

    pdf.multi_cell(
        0,
        5,
        clean_pdf_text(AIM)
    )

    pdf.ln(3)

    pdf.set_font(
        "Helvetica",
        "B",
        12
    )

    pdf.cell(
        0,
        8,
        "2. Learning Objectives",
        new_x="LMARGIN",
        new_y="NEXT"
    )

    pdf.set_font(
        "Helvetica",
        "",
        9
    )

    for objective in OBJECTIVES:

        pdf.multi_cell(
            0,
            5,
            "- " + clean_pdf_text(objective)
        )

    pdf.ln(3)

    pdf.set_font(
        "Helvetica",
        "B",
        12
    )

    pdf.cell(
        0,
        8,
        "3. Assessment",
        new_x="LMARGIN",
        new_y="NEXT"
    )

    pdf.set_font(
        "Helvetica",
        "",
        9
    )

    pretest_text = (
        "Pretest Score: "
        + (
            f"{pretest_score}/{len(PRETEST_QUESTIONS)}"
            if pretest_score is not None
            else "Not attempted"
        )
    )

    posttest_text = (
        "Posttest Score: "
        + (
            f"{posttest_score}/{len(POSTTEST_QUESTIONS)}"
            if posttest_score is not None
            else "Not attempted"
        )
    )

    pdf.multi_cell(
        0,
        5,
        pretest_text
    )

    pdf.multi_cell(
        0,
        5,
        posttest_text
    )

    pdf.ln(3)

    pdf.set_font(
        "Helvetica",
        "B",
        12
    )

    pdf.cell(
        0,
        8,
        "4. Recorded Simulation Trials",
        new_x="LMARGIN",
        new_y="NEXT"
    )

    pdf.set_font(
        "Helvetica",
        "",
        8
    )

    if trials_df is not None and not trials_df.empty:

        for _, row in trials_df.iterrows():

            trial_number = str(
                row.get(
                    "Trial",
                    ""
                )
            )

            operation = clean_pdf_text(
                str(
                    row.get(
                        "Operation",
                        ""
                    )
                )
            )

            configuration = clean_pdf_text(
                str(
                    row.get(
                        "Configuration",
                        ""
                    )
                )
            )

            result = clean_pdf_text(
                str(
                    row.get(
                        "Result",
                        ""
                    )
                )
            )

            pdf.multi_cell(
                0,
                5,
                f"Trial {trial_number}: {operation} | "
                f"{configuration} | {result}"
            )

    else:

        pdf.multi_cell(
            0,
            5,
            "No simulation trials were recorded."
        )

    pdf.ln(3)

    pdf.set_font(
        "Helvetica",
        "B",
        12
    )

    pdf.cell(
        0,
        8,
        "5. Student Observations",
        new_x="LMARGIN",
        new_y="NEXT"
    )

    pdf.set_font(
        "Helvetica",
        "",
        9
    )

    pdf.multi_cell(
        0,
        5,
        clean_pdf_text(
            student_notes
            if student_notes
            else
            "No observations were entered."
        )
    )

    pdf.ln(3)

    pdf.set_font(
        "Helvetica",
        "B",
        12
    )

    pdf.cell(
        0,
        8,
        "6. Conclusion",
        new_x="LMARGIN",
        new_y="NEXT"
    )

    pdf.set_font(
        "Helvetica",
        "",
        9
    )

    conclusion = """
The experiment demonstrated advanced graph querying concepts
including multi-hop traversal, filtering, aggregation, and complex
graph pattern matching. The simulation showed how Cypher patterns
can be used to retrieve direct and indirect relationships from
connected data. The graph visualization further demonstrated how
hidden connections can be identified through traversal.
"""

    pdf.multi_cell(
        0,
        5,
        clean_pdf_text(conclusion)
    )

    return bytes(
        pdf.output()
    )


def clean_pdf_text(text):

    replacements = {
        "→": "->",
        "↓": "",
        "•": "-",
        "–": "-",
        "—": "-",
        "’": "'",
        "“": '"',
        "”": '"'
    }

    for old, new in replacements.items():

        text = text.replace(
            old,
            new
        )

    return text


# ============================================================
# SECTION 9 — CONCLUSION
# ============================================================

def render_conclusion():

    st.header("9. Conclusion")

    st.write(
        """
        The experiment demonstrated advanced graph querying concepts
        using a simulated professional network.

        Multi-hop traversal was used to retrieve indirectly connected
        nodes. Filtering was used to restrict graph patterns according
        to specific conditions. Aggregation was demonstrated using
        connection counts, while hidden connection discovery showed
        how indirect paths can reveal relationships between entities.

        The Custom Query feature additionally allowed users to write
        their own read-only Cypher queries and interactively explore
        the graph.

        Overall, the simulation provided an interactive understanding
        of Cypher pattern matching and demonstrated how advanced graph
        queries can be used to efficiently retrieve complex
        relationships and hidden connections.
        """
    )

    if (
        st.session_state.pretest_score is not None
        and
        st.session_state.posttest_score is not None
    ):

        st.subheader("Assessment Summary")

        col1, col2, col3 = st.columns(3)

        with col1:

            st.metric(
                "Pretest",
                f"{st.session_state.pretest_score}/"
                f"{len(PRETEST_QUESTIONS)}"
            )

        with col2:

            st.metric(
                "Posttest",
                f"{st.session_state.posttest_score}/"
                f"{len(POSTTEST_QUESTIONS)}"
            )

        with col3:

            improvement = (
                st.session_state.posttest_score
                -
                st.session_state.pretest_score
            )

            st.metric(
                "Score Change",
                improvement
            )

    st.subheader("Simulation Summary")

    st.metric(
        "Recorded Trials",
        len(st.session_state.trials)
    )


# ============================================================
# SECTION 10 — REFERENCES
# ============================================================

def render_references():

    st.header("10. References")

    references = [
        "Neo4j Documentation - Cypher Query Language",
        "Neo4j Cypher Manual - MATCH and WHERE",
        "Neo4j Cypher Manual - Aggregating Functions",
        "Streamlit Documentation",
        "NetworkX Documentation",
        "Plotly Python Documentation",
        "Pandas Documentation"
    ]

    for index, reference in enumerate(
        references,
        1
    ):

        st.write(
            f"{index}. {reference}"
        )

    st.subheader("Implementation Note")

    st.info(
        """
        This application is an educational simulation. Neo4j is not
        used as the backend because the experiment specification
        permits graph experiments to be implemented using a frontend
        simulation with fewer nodes.

        NetworkX performs the local graph operations, while equivalent
        Cypher queries are displayed and interpreted to demonstrate
        how the same operations can conceptually be expressed in Neo4j.
        """
    )


# ============================================================
# REPORT GENERATION
# ============================================================

def render_report():

    st.header("📄 Report Generation")

    st.write(
        """
        Enter your details and download a PDF report containing
        the experiment information, assessment scores, recorded
        trials, observations, and conclusion.
        """
    )

    col1, col2, col3 = st.columns(3)

    with col1:

        student_name = st.text_input(
            "Student Name",
            value=st.session_state.student_info["name"]
        )

    with col2:

        student_id = st.text_input(
            "Student Roll / ID",
            value=st.session_state.student_info["id"]
        )

    with col3:

        experiment_date = st.date_input(
            "Experiment Date",
            value=datetime.now().date()
        )

    st.session_state.student_info["name"] = student_name
    st.session_state.student_info["id"] = student_id
    st.session_state.student_info["date"] = str(
        experiment_date
    )

    st.subheader("Student Observations")

    notes = st.text_area(
        "Enter your observations, interpretation, and remarks:",
        value=st.session_state.student_notes,
        height=150
    )

    st.session_state.student_notes = notes

    st.subheader("Report Preview")

    st.write(
        f"**Experiment:** {EXPERIMENT_TITLE}"
    )

    st.write(
        f"**Student:** {student_name or 'Not entered'}"
    )

    st.write(
        f"**Roll / ID:** {student_id or 'Not entered'}"
    )

    st.write(
        f"**Date:** {experiment_date}"
    )

    if st.session_state.pretest_score is not None:

        st.write(
            f"**Pretest:** "
            f"{st.session_state.pretest_score}/"
            f"{len(PRETEST_QUESTIONS)}"
        )

    else:

        st.write(
            "**Pretest:** Not attempted"
        )

    if st.session_state.posttest_score is not None:

        st.write(
            f"**Posttest:** "
            f"{st.session_state.posttest_score}/"
            f"{len(POSTTEST_QUESTIONS)}"
        )

    else:

        st.write(
            "**Posttest:** Not attempted"
        )

    st.write(
        f"**Recorded Trials:** {len(st.session_state.trials)}"
    )

    if st.session_state.trials:

        st.dataframe(
            pd.DataFrame(
                st.session_state.trials
            ),
            use_container_width=True,
            hide_index=True
        )

    st.divider()

    if st.button(
        "Generate PDF Report",
        type="primary"
    ):

        trials_df = pd.DataFrame(
            st.session_state.trials
        )

        pdf_bytes = generate_pdf_report(
            student_name,
            student_id,
            str(experiment_date),
            trials_df,
            st.session_state.pretest_score,
            st.session_state.posttest_score,
            notes
        )

        st.download_button(
            label="Download Experiment Report",
            data=pdf_bytes,
            file_name="cypher_graph_pattern_matching_report.pdf",
            mime="application/pdf"
        )

        st.success(
            "PDF report generated successfully."
        )


# ============================================================
# SIDEBAR NAVIGATION
# ============================================================

st.sidebar.title("🧪 Virtual Laboratory")

st.sidebar.markdown(
    "**Advanced Cypher Queries and Graph Pattern Matching**"
)

st.sidebar.divider()

section = st.sidebar.radio(
    "Experiment Sections",
    [
        "1. Aim",
        "2. Introduction",
        "3. Theory",
        "4. Pretest",
        "5. Case Study",
        "6. Procedure",
        "7. Simulation",
        "8. Posttest",
        "9. Conclusion",
        "10. References",
        "📄 Report Generation"
    ]
)

st.sidebar.divider()

st.sidebar.subheader("Experiment Status")

if st.session_state.pretest_score is not None:

    st.sidebar.success(
        f"Pretest: {st.session_state.pretest_score}/"
        f"{len(PRETEST_QUESTIONS)}"
    )

else:

    st.sidebar.warning(
        "Pretest: Not completed"
    )

if st.session_state.posttest_score is not None:

    st.sidebar.success(
        f"Posttest: {st.session_state.posttest_score}/"
        f"{len(POSTTEST_QUESTIONS)}"
    )

else:

    st.sidebar.warning(
        "Posttest: Not completed"
    )

st.sidebar.info(
    f"Trials Recorded: {len(st.session_state.trials)}"
)


# ============================================================
# MAIN SECTION ROUTER
# ============================================================

if section == "1. Aim":

    render_aim()

elif section == "2. Introduction":

    render_introduction()

elif section == "3. Theory":

    render_theory()

elif section == "4. Pretest":

    render_pretest()

elif section == "5. Case Study":

    render_case_study()

elif section == "6. Procedure":

    render_procedure()

elif section == "7. Simulation":

    render_simulation()

elif section == "8. Posttest":

    render_posttest()

elif section == "9. Conclusion":

    render_conclusion()

elif section == "10. References":

    render_references()

elif section == "📄 Report Generation":

    render_report()
