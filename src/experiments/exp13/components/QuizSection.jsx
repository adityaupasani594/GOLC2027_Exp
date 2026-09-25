import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the primary function of variable-length relationship patterns such as [:CITES*1..3] in Cypher?",
    options: [
      "To restrict the traversal strictly to relationships created between index positions 1 and 3.",
      "To match paths with relationship depth starting from a minimum of 1 hop up to a maximum of 3 hops.",
      "To multiply the edge weights of the first 3 traversed relationships.",
      "To perform 3 concurrent batch queries simultaneously across separate database shards."
    ],
    answer: 1,
    explanation: "The syntax [:REL_TYPE*min..max] allows Cypher to traverse recursive paths spanning from min hops up to max hops recursively across the graph topology."
  },
  {
    id: 2,
    question: "In graph theory and network analysis, what does a 'triadic closure' represent?",
    options: [
      "A database deadlock caused by 3 concurrent write transactions.",
      "The tendency of two entities that share a mutual connection to become directly connected over time.",
      "A 3-node cycle where relationship traversal is mathematically impossible.",
      "The compression of three adjacent nodes into a single hyper-node."
    ],
    answer: 1,
    explanation: "Triadic closure occurs when two nodes (A and C) connected to a common intermediate node B form a direct edge (A-C), closing the open triad."
  },
  {
    id: 3,
    question: "Why is the 'WITH' clause critical in complex multi-part Cypher queries?",
    options: [
      "It establishes an exclusive database lock on the entire graph.",
      "It acts as a query pipeline boundary that chains query parts, allowing intermediate aggregation, filtering, and variable projection.",
      "It forces the query planner to bypass all index lookups and perform full graph scans.",
      "It automatically converts undirected edges into directional pointers."
    ],
    answer: 1,
    explanation: "WITH pipes intermediate records from one query segment to the next, enabling aggregations (e.g. count, sum, collect) and filtering on aggregated values before continuing."
  },
  {
    id: 4,
    question: "What does the Cypher aggregation function `collect(p.title)` return?",
    options: [
      "A scalar sum of character lengths across all paper titles.",
      "A single aggregated Cypher List containing all matched paper titles for the current grouping key.",
      "A newly created relationship type named COLLECT.",
      "A serialized binary JSON blob stored permanently on disk."
    ],
    answer: 1,
    explanation: "`collect()` gathers individual values into an ordered Cypher list (array) grouped by non-aggregate variables present in the projection."
  },
  {
    id: 5,
    question: "How does the built-in Cypher function `shortestPath()` optimize path finding between two nodes?",
    options: [
      "It runs a full Cartesian product across all graph vertices and sorts by length.",
      "It uses bidirectional Breadth-First Search (BFS) starting simultaneously from source and target until frontiers meet.",
      "It converts the graph into an adjacency matrix and computes its determinant.",
      "It randomly samples 100 paths and returns the one with the smallest ID."
    ],
    answer: 1,
    explanation: "shortestPath() uses bidirectional Breadth-First Search (BFS) starting from both source and target nodes simultaneously until search frontiers intersect."
  },
  {
    id: 6,
    question: "Consider the query: MATCH (a:Author)-[:AUTHORED]->(p:Paper) WHERE p.year >= 2022 RETURN a.name, count(p). What is the grouping key for count(p)?",
    options: [
      "p.year",
      "a.name",
      "p (the paper entity)",
      "The entire graph database instance"
    ],
    answer: 1,
    explanation: "In Cypher, any non-aggregated column in the RETURN/WITH statement (here, `a.name`) implicitly serves as the grouping key for aggregate functions like `count()`."
  },
  {
    id: 7,
    question: "What is the key advantage of an Index-Free Adjacency (IFA) graph database over an RDBMS during a 4-hop traversal?",
    options: [
      "IFA traversals have O(1) step complexity per node pointer dereference regardless of overall graph size, avoiding costly multi-table JOINs.",
      "IFA requires no RAM and processes all queries directly on optical storage.",
      "Relational databases cannot store more than 2 foreign keys per table.",
      "Cypher queries are compiled to hardware microcode while SQL queries are interpreted."
    ],
    answer: 0,
    explanation: "In native graph stores with Index-Free Adjacency, each node directly stores physical memory pointers to its adjacent edges, making traversal cost dependent only on visited subgraph size rather than total dataset size."
  },
  {
    id: 8,
    question: "What is the purpose of the pattern `WHERE NOT (a1)-[:COLLABORATED_WITH]-(a3)` in hidden collaborator discovery queries?",
    options: [
      "To enforce that a1 and a3 must have identical research domains.",
      "To filter out already existing direct collaborations so only novel, unformed relationships (open triads) are reported.",
      "To delete all collaboration records between a1 and a3.",
      "To reverse the direction of citation arrows."
    ],
    answer: 1,
    explanation: "`WHERE NOT (a1)-[:REL]-(a3)` ensures that we only surface open triads where no direct edge exists yet, pinpointing genuine hidden/latent collaboration opportunities."
  },
  {
    id: 9,
    question: "In an enterprise organizational graph, how can you match employees who report to managers who themselves report to the Director (2-hop reporting hierarchy)?",
    options: [
      "MATCH (e:Person)-[:REPORTS_TO*2]->(d:Person {role: 'Director'})",
      "SELECT e FROM Employees WHERE depth = 2",
      "MATCH (e:Person) WHERE e.manager.manager = 'Director'",
      "SEARCH (e) -> (m) -> (d) USING DFS"
    ],
    answer: 0,
    explanation: "The fixed-length path expression `[:REPORTS_TO*2]` specifically matches exactly 2 sequential hops of REPORTS_TO edges."
  },
  {
    id: 10,
    question: "What operator in a Cypher EXPLAIN execution plan represents scanning an index to find the starting node of a traversal?",
    options: [
      "ProduceResults",
      "NodeIndexSeek or NodeByLabelScan",
      "VarLengthExpand(All)",
      "EagerAggregation"
    ],
    answer: 1,
    explanation: "`NodeIndexSeek` uses a schema index to pinpoint starting nodes by property, whereas `NodeByLabelScan` scans all nodes having a specific label."
  }
];

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={13}
      expTitle="Graph Query Optimization & Indexing"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
