import React from 'react';
import { UnifiedQuizSection } from '../../../components/common';

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What core architectural feature enables graph databases to achieve constant-time O(1) traversal per hop, unlike RDBMS multi-table joins?",
    options: [
      "A) Distributed B-Tree indexes on foreign keys",
      "B) Index-Free Adjacency (IFA) using direct physical memory pointers",
      "C) Precomputed materialized relational views",
      "D) Columnar compressed storage files"
    ],
    answer_index: 1,
    explanation: "Index-Free Adjacency (IFA) means every node stores direct physical memory pointers to its adjacent relationships, allowing traversal in O(1) time without index searches."
  },
  {
    id: 2,
    question: "In the Labeled Property Graph (LPG) model, which of the following statements regarding relationships is FALSE?",
    options: [
      "A) Every relationship must have a start node and an end node",
      "B) Every relationship must have a specific type (e.g., [:ENROLLED_IN])",
      "C) Relationships can hold key-value properties just like nodes",
      "D) Relationships can exist as dangling pointers without a target node"
    ],
    answer_index: 3,
    explanation: "Relationships in a Property Graph are strictly first-class directed connections. They can never exist as dangling pointers without both a valid source and target node."
  },
  {
    id: 3,
    question: "Which Cypher pattern correctly matches a Student named 'Alice' who is enrolled in any Course?",
    options: [
      "A) SELECT Student WHERE name='Alice' JOIN Course",
      "B) MATCH (s:Student {name: 'Alice'})-[:ENROLLED_IN]->(c:Course) RETURN s, c",
      "C) FIND (s:Student)-[ENROLLED_IN]->(c:Course) FILTER s.name = 'Alice'",
      "D) MATCH {s:Student} --> {c:Course} WHERE name = 'Alice'"
    ],
    answer_index: 1,
    explanation: "Cypher uses ASCII-art syntax: nodes are enclosed in parentheses '(s:Student)' and directed relationships in bracketed arrows '-[:ENROLLED_IN]->'."
  },
  {
    id: 4,
    question: "What happens if you execute 'MATCH (n:Student {id: 'S01'}) DELETE n' when node 'S01' currently has 3 active relationships?",
    options: [
      "A) The node and its 3 relationships are automatically deleted without error",
      "B) The 3 relationships are preserved as dangling pointers with null sources",
      "C) The graph DBMS engine prevents deletion to preserve referential integrity",
      "D) The node is deleted and the target nodes are also recursively deleted"
    ],
    answer_index: 2,
    explanation: "To preserve graph referential integrity, plain DELETE fails if relationships are attached. 'DETACH DELETE' must be explicitly used to remove attached relationships first."
  },
  {
    id: 5,
    question: "What is the primary operational role of 'Labels' attached to nodes in a Property Graph?",
    options: [
      "A) To store arbitrary floating-point numeric measurements",
      "B) To categorize nodes into domain groups and act as entry-point indexes for fast query lookup",
      "C) To define foreign key cascade rules between tables",
      "D) Labels are purely cosmetic and have no execution impact"
    ],
    answer_index: 1,
    explanation: "Labels group nodes into semantic roles (e.g., :Student, :Faculty) and allow graph engines to index and rapidly locate starting nodes for graph traversals."
  },
  {
    id: 6,
    question: "Which Cypher statement correctly updates the GPA of student 'Alice' to 9.50 and adds an 'honors' property?",
    options: [
      "A) UPDATE (s:Student {name: 'Alice'}) SET gpa = 9.50, honors = true",
      "B) MATCH (s:Student {name: 'Alice'}) SET s.gpa = 9.50, s.honors = true RETURN s",
      "C) MODIFY Student Alice (gpa: 9.50, honors: true)",
      "D) ALTER NODE (s:Student) WHERE name='Alice' ADD gpa=9.50"
    ],
    answer_index: 1,
    explanation: "In Cypher, property updates are performed using the 'SET' clause following a 'MATCH' pattern: 'MATCH (s) SET s.prop = val'."
  },
  {
    id: 7,
    question: "In Cypher, what is the behavior of the aggregation function 'count(s)' in 'MATCH (c:Course)<-[:ENROLLED_IN]-(s:Student) RETURN c.name, count(s)'?",
    options: [
      "A) It throws a syntax error because Cypher requires an explicit 'GROUP BY' clause",
      "B) It automatically groups by non-aggregated fields (c.name) and counts students per course",
      "C) It counts all students in the database regardless of course",
      "D) It only counts courses, ignoring students completely"
    ],
    answer_index: 1,
    explanation: "Unlike SQL, Cypher has implicit grouping: any non-aggregated expressions in the RETURN clause (such as c.name) automatically serve as grouping keys."
  },
  {
    id: 8,
    question: "What does the variable-length Cypher relationship pattern '-[:PREREQUISITE_OF*1..3]->' express?",
    options: [
      "A) A relationship whose weight is between 1.0 and 3.0",
      "B) A path of between 1 and 3 sequential PREREQUISITE_OF hops between entities",
      "C) A relationship that must be traversed exactly 3 times in a loop",
      "D) An array of 3 distinct relationship property keys"
    ],
    answer_index: 1,
    explanation: "Syntax '*minHops..maxHops' specifies variable-length path traversal. '*1..3' searches for paths having from 1 up to 3 consecutive relationship hops."
  },
  {
    id: 9,
    question: "In which scenario would a Relational Database (RDBMS) typically outperform a Graph Database?",
    options: [
      "A) Finding mutual friends across 6 degrees of separation in a social network",
      "B) Detecting circular money laundering rings across transaction accounts",
      "C) Sequential bulk aggregations across millions of independent, flat accounting records",
      "D) Finding shortest paths through an international airline flight network"
    ],
    answer_index: 2,
    explanation: "Relational databases and columnar engines excel at bulk, linear scans and aggregations across flat tables with minimal inter-record joins, whereas graph databases excel at complex, multi-hop relationship traversals."
  },
  {
    id: 10,
    question: "Why is the query 'MATCH (s:Student), (c:Course) RETURN s, c' generally discouraged unless explicitly intended?",
    options: [
      "A) Because it causes a syntax error in Cypher",
      "B) Because it produces an unconstrained Cartesian product matching every student with every course",
      "C) Because it automatically deletes all students and courses",
      "D) Because it forces the database to convert into an RDBMS table"
    ],
    answer_index: 1,
    explanation: "Matching disconnected entities without relationship patterns calculates a full Cartesian product (O(|V1| * |V2|)), which can consume massive memory on large graphs."
  },
  {
    id: 11,
    question: "Which of the following describes the default network port used for Bolt binary protocol driver communication in standard graph DBMS servers?",
    options: [
      "A) Port 7474 (HTTP Browser interface)",
      "B) Port 7687 (Bolt binary protocol)",
      "C) Port 3306 (MySQL default port)",
      "D) Port 5432 (PostgreSQL default port)"
    ],
    answer_index: 1,
    explanation: "Graph DBMS servers typically use port 7474 for HTTP web console access, and port 7687 for high-performance Bolt binary protocol connections utilized by official drivers."
  },
  {
    id: 12,
    question: "According to Cypher naming conventions and syntax standards, how should relationship types and node labels be cased?",
    options: [
      "A) Labels in UPPER_CASE and Relationships in lower_case",
      "B) Labels in UpperCamelCase (e.g., :Student) and Relationships in UPPER_SNAKE_CASE (e.g., [:ENROLLED_IN])",
      "C) Both labels and relationships must always be lowercase",
      "D) Cypher forbids the use of underscores in relationship types"
    ],
    answer_index: 1,
    explanation: "Cypher naming conventions dictate UpperCamelCase for Node Labels (e.g. :Student, :Course) and UPPER_SNAKE_CASE for Relationship Types (e.g. [:ENROLLED_IN], [:TEACHES])."
  }
];

export default function QuizSection(props) {
  return (
    <UnifiedQuizSection
      expNumber={10}
      expTitle="Graph Databases & Cypher Query Modeling"
      rawQuestions={QUIZ_QUESTIONS}
      {...props}
    />
  );
}
