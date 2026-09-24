import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronDown, ChevronUp, FlaskConical,
  Database, Network, Server, ArrowRight, CheckCircle2,
  Cpu, Layers, ShieldAlert, Sparkles, Terminal, HardDrive
} from 'lucide-react';

const OBJECTIVES = [
  'Understand the foundational principles of Graph Databases and the Labeled Property Graph (LPG) model.',
  'Differentiate Graph Databases from Relational Databases (RDBMS) via Index-Free Adjacency (IFA).',
  'Design, build, and manipulate graph structures consisting of nodes, labels, properties, and directed relationships.',
  'Master the Cypher Query Language for pattern matching, creation, updates, and deletions (MATCH, CREATE, SET, DELETE, DETACH DELETE).',
  'Execute single-hop and multi-hop relationship traversals, conditional filtering (WHERE), and aggregations (count, avg).',
  'Understand real-world graph database architecture, deployment procedures (Docker, Cloud, Local), and production use cases.'
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

const KEY_TERMS = [
  { term: 'Node (Vertex)', def: 'A fundamental graph entity representing a distinct object (e.g., Student, Faculty, Course).' },
  { term: 'Label', def: 'A semantic tag applied to nodes for categorization, schema definition, and indexing (e.g., :Student, :Faculty, :Course).' },
  { term: 'Relationship (Edge)', def: 'A directed connection between two nodes with a mandatory type and direction (e.g., [:ENROLLED_IN]).' },
  { term: 'Property', def: 'A key-value attribute associated with a node or relationship (e.g., gpa: 9.15, credits: 4).' },
  { term: 'Index-Free Adjacency (IFA)', def: 'Architecture where nodes hold direct physical memory pointers to adjacent relationships and nodes, ensuring O(1) traversal.' },
  { term: 'Cypher', def: 'The declarative, ASCII-art pattern matching query language standardized under openCypher and ISO GQL.' },
  { term: 'DETACH DELETE', def: 'A Cypher operation that safely deletes a node by first stripping all connected incoming and outgoing relationships.' },
  { term: 'Degree of a Node', def: 'The total number of relationships connected to a node (Degree = In-Degree + Out-Degree).' },
  { term: 'Graph Density', def: 'Ratio of existing relationships to maximum possible directed relationships: D = E / (V * (V - 1)).' },
  { term: 'Multi-Hop Traversal', def: 'A query path that navigates across two or more consecutive relationships (e.g., (a)-[]->(b)-[]->(c)).' },
  { term: 'Isolated Node', def: 'A node having a degree of zero (no incoming and no outgoing relationships).' },
  { term: 'Cartesian Product', def: 'Disconnected query pattern matching every node with every other node without relationships (O(V1 × V2)).' }
];

export default function TheorySection({ onGoToLab }) {
  const [expandedSection, setExpandedSection] = useState('rdbms');

  const toggleSection = (id) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-teal-800/40"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Experiment 10 · Knowledge Graphs &amp; Graph Databases
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Create and Manage a Graph Database
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Design, construct, and manage a Property Graph Database. Master the Labeled Property Graph (LPG) model, Index-Free Adjacency (IFA), and declarative Cypher CRUD operations.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Labeled Property Graph (LPG)', 'Index-Free Adjacency (IFA)', 'Cypher Query Language', 'MATCH & CREATE', 'DETACH DELETE', 'Multi-Hop Traversal'].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={onGoToLab}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              Launch Graph Sandbox
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-xs text-slate-400 text-center font-mono">
              CS-KG-10 · Virtual Labs
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
      </motion.div>

      {/* Labeled Property Graph (LPG) Anatomical Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Network className="w-5 h-5 text-teal-600" />
              Anatomy of the Labeled Property Graph (LPG) Model
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              In a Property Graph, relationships are first-class citizens stored with direct physical memory pointers.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold text-xs border border-teal-200 self-start sm:self-auto">
            Core Data Model
          </span>
        </div>

        {/* Visual Graph Anatomy Model */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                ( )
              </span>
              <span className="font-bold text-purple-950 text-sm">Nodes &amp; Labels</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discrete domain entities representing distinct objects. Labels serve as semantic roles and entry-point index pointers.
            </p>
            <div className="p-2.5 bg-white rounded-xl border border-purple-200 font-mono text-[11px] text-purple-900">
              (s:Student:Scholar &#123;name: 'Alice', gpa: 9.15&#125;)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                -[ ]-&gt;
              </span>
              <span className="font-bold text-teal-950 text-sm">Directed Relationships</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Typed, directed connections linking source to target. Every relationship must have a type and can hold its own properties.
            </p>
            <div className="p-2.5 bg-white rounded-xl border border-teal-200 font-mono text-[11px] text-teal-900">
              -[r:ENROLLED_IN &#123;grade: 'A', semester: '5th'&#125;]-&gt;
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                IFA
              </span>
              <span className="font-bold text-indigo-950 text-sm">Index-Free Adjacency</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nodes maintain physical memory/disk offsets directly to adjacent edges, eliminating B-tree index lookups on joins (O(1) hop cost).
            </p>
            <div className="p-2.5 bg-white rounded-xl border border-indigo-200 font-mono text-[11px] text-indigo-900">
              Pointer Dereference: O(1) hop traversal
            </div>
          </div>
        </div>
      </motion.div>

      {/* Accordion Theory Sections */}
      <div className="space-y-4">
        {/* Section 1: RDBMS vs Graph Database */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('rdbms')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  RDBMS vs. Graph Database &amp; Index-Free Adjacency (IFA)
                </h3>
                <p className="text-xs text-slate-500">
                  Architectural differences, join scalability, and memory pointer dereference
                </p>
              </div>
            </div>
            {expandedSection === 'rdbms' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          <AnimatePresence>
            {expandedSection === 'rdbms' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 leading-relaxed space-y-4"
              >
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Feature / Dimension</th>
                        <th className="px-4 py-3">Relational Database (RDBMS)</th>
                        <th className="px-4 py-3">Property Graph Database</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {RDBMS_COMPARISON.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="px-4 py-3 font-bold text-slate-900">{row.dimension}</td>
                          <td className="px-4 py-3 text-slate-600">{row.rdbms}</td>
                          <td className="px-4 py-3 font-medium text-teal-800">{row.graph}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
                  <div className="font-bold text-indigo-950 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    How Index-Free Adjacency (IFA) Eliminates Multi-Table Joins:
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    In a relational database, traversing relationships between tables requires looking up foreign keys in a B+Tree index (complexity O(log N)). For deep traversals (k hops), latency increases exponentially. In contrast, native graph databases store direct 64-bit memory addresses in doubly-linked relationship chains. Traversing an edge simply dereferences a pointer (complexity O(1)), making query response time dependent only on the subgraph traversed rather than total database size.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section 2: Cypher Query Language CRUD Reference */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('cypher')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cypher Query Language &amp; CRUD Operations Reference
                </h3>
                <p className="text-xs text-slate-500">
                  Declarative pattern matching, CREATE, WHERE, SET, DELETE, and DETACH DELETE
                </p>
              </div>
            </div>
            {expandedSection === 'cypher' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          <AnimatePresence>
            {expandedSection === 'cypher' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 leading-relaxed space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      1. CREATE (Create Nodes &amp; Relationships)
                    </span>
                    <pre className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
{`CREATE (s:Student {id: 's_kiran', name: 'Kiran Patel', gpa: 8.75})
RETURN s;`}
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      2. MATCH &amp; RETURN (Pattern Retrieval)
                    </span>
                    <pre className="p-2.5 rounded-lg bg-slate-900 text-cyan-300 font-mono text-[11px] overflow-x-auto">
{`MATCH (s:Student)-[r:ENROLLED_IN]->(c:Course)
RETURN s.name, c.name, r.grade;`}
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      3. WHERE (Conditional Filtering)
                    </span>
                    <pre className="p-2.5 rounded-lg bg-slate-900 text-amber-300 font-mono text-[11px] overflow-x-auto">
{`MATCH (s:Student)
WHERE s.gpa >= 8.5 AND s.dept = 'CSE'
RETURN s.name, s.gpa;`}
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      4. SET (Property Mutations)
                    </span>
                    <pre className="p-2.5 rounded-lg bg-slate-900 text-purple-300 font-mono text-[11px] overflow-x-auto">
{`MATCH (s:Student {id: 's_kiran'})
SET s.gpa = 9.40, s.status = 'Dean List'
RETURN s;`}
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      5. DETACH DELETE (Safe Graph Deletion)
                    </span>
                    <pre className="p-2.5 rounded-lg bg-slate-900 text-rose-300 font-mono text-[11px] overflow-x-auto">
{`MATCH (s:Student {id: 's_kiran'})
DETACH DELETE s;`}
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      6. Multi-Hop Traversal (Multi-Relationship Paths)
                    </span>
                    <pre className="p-2.5 rounded-lg bg-slate-900 text-teal-300 font-mono text-[11px] overflow-x-auto">
{`MATCH (f:Faculty)-[:TEACHES]->(c:Course)<-[:ENROLLED_IN]-(s:Student)
RETURN f.name, c.name, s.name;`}
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section 3: Learning Objectives */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('objectives')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Learning Objectives
                </h3>
                <p className="text-xs text-slate-500">
                  Core competencies and practical outcomes of Experiment 10
                </p>
              </div>
            </div>
            {expandedSection === 'objectives' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          <AnimatePresence>
            {expandedSection === 'objectives' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 leading-relaxed space-y-3"
              >
                <div className="space-y-2.5 pt-2">
                  {OBJECTIVES.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-slate-800">
                        <span className="font-bold text-slate-900">Goal {i + 1}:</span> {obj}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section 4: Key Terminology Table */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('terms')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Key Terminology &amp; Operational Concepts
                </h3>
                <p className="text-xs text-slate-500">
                  Glossary of graph database terminology, constraints, and metrics
                </p>
              </div>
            </div>
            {expandedSection === 'terms' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          <AnimatePresence>
            {expandedSection === 'terms' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 leading-relaxed"
              >
                <div className="overflow-x-auto rounded-xl border border-slate-200 mt-2">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Term / Concept</th>
                        <th className="px-4 py-3">Formal Definition &amp; Operational Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {KEY_TERMS.map((item, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="px-4 py-3 font-bold text-teal-900 whitespace-nowrap align-top">
                            {item.term}
                          </td>
                          <td className="px-4 py-3 text-slate-600 leading-relaxed">
                            {item.def}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CTA Bottom Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-50 via-indigo-50 to-purple-50 border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-base">
            Ready to Build &amp; Query Graph Databases?
          </h4>
          <p className="text-xs text-slate-600">
            Open the interactive simulation workbench, execute Cypher queries on pre-loaded datasets, and test pattern matching.
          </p>
        </div>
        <button
          onClick={onGoToLab}
          className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <FlaskConical className="w-4 h-4" />
          Proceed to Simulation Lab
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
