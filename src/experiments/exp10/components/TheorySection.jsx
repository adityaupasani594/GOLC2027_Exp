import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, ArrowRight,
  Database, Network, Cpu, Layers, ExternalLink, HelpCircle
} from 'lucide-react';

const OBJECTIVES = [
  'Understand the foundational principles of Graph Databases and the Labeled Property Graph (LPG) model.',
  'Differentiate Graph Databases from Relational Databases (RDBMS) via Index-Free Adjacency (IFA).',
  'Design, construct, and manipulate graph structures consisting of nodes, labels, properties, and directed relationships.',
  'Master the Cypher Query Language for declarative pattern matching, creation, updates, and deletions (MATCH, CREATE, SET, DETACH DELETE).'
];

const RDBMS_COMPARISON = [
  { dimension: 'Primary Data Model', rdbms: 'Tables, Rows (tuples), Columns', graph: 'Nodes (entities), Directed Relationships (edges)' },
  { dimension: 'Relationship Storage', rdbms: 'Foreign keys & associative join tables', graph: 'Direct physical memory pointers (Index-Free Adjacency)' },
  { dimension: 'Deep Join Performance', rdbms: 'Degrades exponentially (O(N^k)) with join depth', graph: 'Constant per-hop traversal time (O(1)), independent of total DB size' },
  { dimension: 'Schema Flexibility', rdbms: 'Rigid DDL schema; costly schema migrations', graph: 'Flexible schema / schema-optional; easily evolves' },
  { dimension: 'Query Language', rdbms: 'SQL (Structured Query Language)', graph: 'Declarative Graph Query Languages (Cypher, GQL)' },
  { dimension: 'Multi-Hop Traversal', rdbms: 'Recursive Common Table Expressions (CTEs)', graph: 'Intuitive ASCII-art pattern matching (a)-[:REL*1..3]->(b)' },
  { dimension: 'Best-Fit Workloads', rdbms: 'Tabular transactions, accounting, structured reporting', graph: 'Social networks, fraud detection, recommendation engines, knowledge graphs' }
];

const PROCEDURE_STEPS = [
  'Step 1: Review the theoretical background of the Labeled Property Graph (LPG) paradigm and Index-Free Adjacency.',
  'Step 2: Navigate to the Simulation Lab tab in the experiment navigation bar.',
  'Step 3: Select an educational domain preset (University Campus, Social Network, E-Commerce, Citation Graph) or start blank.',
  'Step 4: Execute declarative Cypher statements (CREATE, MATCH, WHERE, SET) to build entities and relationships.',
  'Step 5: Run single-hop and multi-hop traversal queries and observe real-time visual graph graph updates and execution latency.',
  'Step 6: Test safe deletion with DETACH DELETE and record graph metrics (density, node degree, diameter).',
  'Step 7: Record experimental trials, complete the concept assessment Quiz, and generate your verified certificate and lab report.'
];

const KEY_TERMS = [
  { term: 'Node (Vertex)', def: 'A fundamental graph entity representing a distinct object (e.g., Student, Faculty, Course).' },
  { term: 'Label', def: 'A semantic tag applied to nodes for categorization, schema definition, and indexing (e.g., :Student, :Faculty, :Course).' },
  { term: 'Relationship (Edge)', def: 'A directed connection between two nodes with a mandatory type and direction (e.g., [:ENROLLED_IN]).' },
  { term: 'Property', def: 'A key-value attribute associated with a node or relationship (e.g., gpa: 9.15, credits: 4).' },
  { term: 'Index-Free Adjacency (IFA)', def: 'Architecture where nodes hold direct physical memory pointers to adjacent relationships and nodes, ensuring O(1) traversal.' },
  { term: 'Cypher Query Language', def: 'The declarative, ASCII-art pattern matching query language standardized under openCypher and ISO GQL.' },
  { term: 'DETACH DELETE', def: 'A Cypher operation that safely deletes a node by first stripping all connected incoming and outgoing relationships.' },
  { term: 'Degree of a Node', def: 'The total number of relationships connected to a node (Degree = In-Degree + Out-Degree).' }
];

const REFERENCES = [
  {
    authors: 'Robinson, I., Webber, J., & Eifrem, E. (2015)',
    title: 'Graph Databases: New Opportunities for Connected Data (2nd ed.)',
    details: 'O\'Reilly Media. Chapters 1 & 2: Introduction to Graph Databases & Data Modeling.',
    url: 'https://neo4j.com/graph-databases-book/'
  },
  {
    authors: 'Angles, R., & Gutierrez, C. (2018)',
    title: 'An Introduction to Graph Data Management',
    details: 'Graph Data Management: Techniques and Applications, 1-32.',
    url: 'https://doi.org/10.1007/978-3-319-77525-8_1'
  },
  {
    authors: 'Neo4j Documentation (2024)',
    title: 'Cypher Query Language Reference',
    details: 'Official openCypher and ISO GQL declarative graph syntax guide.',
    url: 'https://neo4j.com/docs/cypher-manual/current/'
  }
];

export default function TheorySection({ onGoToLab }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800">
      {/* ── 1. Hero Banner ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm relative overflow-hidden space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 text-xs font-bold tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
          Experiment 10 &bull; Knowledge Graphs &amp; Graph Databases
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create and Manage a Graph Database
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          Design, construct, and manage an expressive Property Graph Database. Master the Labeled Property Graph (LPG) paradigm, Index-Free Adjacency (IFA), and declarative Cypher CRUD operations (MATCH, CREATE, SET, DETACH DELETE) to execute lightning-fast multi-hop traversals without expensive relational SQL joins.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToLab}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-200 cursor-pointer transition active:scale-95"
          >
            Launch Graph Sandbox <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. Learning Objectives ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Learning Objectives
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {OBJECTIVES.map((obj, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{obj}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Foundational Theoretical Framework ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Foundational Theoretical Framework
        </h2>

        {/* LPG Anatomy Card */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 space-y-2">
            <span className="font-bold text-purple-950 text-xs sm:text-sm block">1. Nodes &amp; Labels</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discrete domain entities representing distinct objects. Labels serve as semantic roles and entry-point index pointers:
            </p>
            <div className="p-2 bg-white rounded-lg border border-purple-200 font-mono text-[11px] text-purple-900">
              (:Student &#123;name: 'Alice', gpa: 9.15&#125;)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80 space-y-2">
            <span className="font-bold text-teal-950 text-xs sm:text-sm block">2. Directed Relationships</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              First-class semantic connections with mandatory type, direction, and optional internal key-value properties:
            </p>
            <div className="p-2 bg-white rounded-lg border border-teal-200 font-mono text-[11px] text-teal-900">
              -[:ENROLLED_IN &#123;semester: 5&#125;]-&gt;
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-2">
            <span className="font-bold text-indigo-950 text-xs sm:text-sm block">3. Index-Free Adjacency (IFA)</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Each node directly stores physical memory pointers to its adjacent edges. Traversal complexity is O(1) per hop regardless of database size.
            </p>
            <div className="p-2 bg-white rounded-lg border border-indigo-200 font-mono text-[11px] text-indigo-900">
              Cost: O(degree) vs O(N^k SQL Joins)
            </div>
          </div>
        </div>

        {/* Declarative Cypher CRUD Reference */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Declarative Cypher CRUD Syntax Guide
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                title: 'CREATE (Insert Entity/Edge)',
                code: 'CREATE (s:Student {id: "s1", name: "Alice"})\nRETURN s;'
              },
              {
                title: 'MATCH & RETURN (Pattern Query)',
                code: 'MATCH (s:Student)-[r:ENROLLED_IN]->(c:Course)\nRETURN s.name, c.title;'
              },
              {
                title: 'WHERE (Conditional Filter)',
                code: 'MATCH (s:Student)\nWHERE s.gpa >= 8.5\nRETURN s.name, s.gpa;'
              },
              {
                title: 'SET (Mutate Properties)',
                code: 'MATCH (s:Student {id: "s1"})\nSET s.gpa = 9.40\nRETURN s;'
              },
              {
                title: 'DETACH DELETE (Safe Deletion)',
                code: 'MATCH (s:Student {id: "s1"})\nDETACH DELETE s;'
              },
              {
                title: 'Multi-Hop Path Traversal',
                code: 'MATCH (s:Student)-[:ENROLLED_IN]->(c)<-[:TEACHES]-(f)\nRETURN s.name, f.name;'
              }
            ].map((c, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <span className="font-bold text-xs text-slate-900 block">{c.title}</span>
                <pre className="p-2 rounded-lg bg-slate-900 text-teal-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {c.code}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Technical Comparison Matrix ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Technical Comparison Matrix: RDBMS vs. Graph Database
        </h2>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Dimension</th>
                <th className="p-2.5">Relational Database (RDBMS)</th>
                <th className="p-2.5">Graph Database (LPG)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {RDBMS_COMPARISON.map(r => (
                <tr key={r.dimension} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-900">{r.dimension}</td>
                  <td className="p-2.5">{r.rdbms}</td>
                  <td className="p-2.5 font-semibold text-teal-800 bg-teal-50/40">{r.graph}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Laboratory Procedure ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Laboratory Procedure
        </h2>
        <div className="space-y-2.5 pt-1">
          {PROCEDURE_STEPS.map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Key Terminology & Definitions ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Key Terminology &amp; Definitions
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {KEY_TERMS.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-teal-900">{item.term}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.def}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. References & Further Reading ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          References &amp; Further Reading
        </h2>
        <div className="space-y-3 pt-1">
          {REFERENCES.map((ref, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <div className="text-xs sm:text-sm font-semibold text-slate-800">
                {ref.authors} &mdash; <span className="font-bold text-teal-700">{ref.title}</span>
              </div>
              <div className="text-xs text-slate-500 italic">{ref.details}</div>
              {ref.url && (
                <div className="text-[11px] text-blue-600 font-mono pt-0.5">
                  <a href={ref.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                    {ref.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
