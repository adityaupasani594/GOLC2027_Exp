import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, ArrowRight,
  Share2, Database, ShieldAlert, Cpu, ExternalLink, HelpCircle
} from 'lucide-react';

export default function TheorySection({ onGoToLab }) {
  const objectives = [
    'Model domain entities and relationships using the Labeled Property Graph (LPG) paradigm.',
    'Formulate node label sets, distinct identity keys, and typed directed relationships.',
    'Implement multi-pass data ingestion with automated referential integrity and dangling key validation.',
    'Generate standard Cypher DDL (uniqueness constraints, LOAD CSV, MERGE) for enterprise graph platforms like Neo4j.'
  ];

  const comparisonMatrix = [
    { feature: 'Core Primitive', rdbms: 'Tables (Rows & Columns) with Primary/Foreign Keys', graph: 'Nodes, Labels, Directed Typed Relationships, Properties' },
    { feature: 'Relationship Execution', rdbms: 'Computed dynamically via costly JOIN tables (Cartesian cost)', graph: 'First-class index-free adjacency (O(1) pointer traversals)' },
    { feature: 'Schema Evolution', rdbms: 'Rigid DDL; ALTER TABLE requires schema locks & migrations', graph: 'Flexible / Semi-structured; nodes can acquire dynamic properties' },
    { feature: 'Multi-Hop Query Cost', rdbms: 'Exponential growth with depth (O(N^k) table joins)', graph: 'Linear with local degree regardless of total database size (O(k * d))' },
    { feature: 'Many-to-Many Mappings', rdbms: 'Requires associative junction / bridge tables', graph: 'Direct directed relationships with arbitrary properties' },
    { feature: 'Integrity Enforcement', rdbms: 'FOREIGN KEY constraints prevent orphan records', graph: 'Ingestion validation passes ensure source & target nodes pre-exist' },
    { feature: 'Query Language', rdbms: 'SQL (Structured Query Language)', graph: 'Cypher, openCypher, or GQL (Declarative Pattern Matching)' }
  ];

  const procedureSteps = [
    'Step 1: Explore Domain Schemas: Select from 5 benchmark domains (University, E-Commerce, Healthcare, Movies, Library) and inspect entity labels, primary keys, and relationship signatures.',
    'Step 2: Inspect Ingestion Datasets: Examine simulated tabular source records (Nodes and Directed Edges) and test schema conformance.',
    'Step 3: Test Referential Integrity Validation: Intentionally inject or select corrupted records (dangling source/target keys, unregistered labels) to observe how automated integrity checkers catch orphan edges before database corruption.',
    'Step 4: Interactive Graph Visualization: Render the ingested Knowledge Graph using force-directed layout. Filter by label, highlight node degree centrality, and examine rich edge properties.',
    'Step 5: Execute Cypher Queries: Run declarative graph pattern queries (e.g., finding multi-hop paths, departmental affiliations, and high-degree hubs) and inspect Cypher DDL scripts.',
    'Step 6: Log Experimental Trials: Record your schema configurations and validation outputs into the session log book.',
    'Step 7: Complete Concept Assessment: Test your knowledge across 15 graded questions covering basic to advanced graph schema concepts, and generate your academic certificate and report.'
  ];

  const keyTerms = [
    { term: 'Labeled Property Graph (LPG)', def: 'A graph model where entities are vertices with labels and key-value properties, connected by directed, typed edges that can also carry their own properties.' },
    { term: 'Index-Free Adjacency', def: 'A property of native graph engines where each node directly maintains physical memory pointers to its adjacent neighbor relationships, enabling constant-time traversal hops.' },
    { term: 'Node Label', def: 'A category or classifier assigned to a node (e.g., :Student, :Course) allowing queries to constrain traversals to specific entity types.' },
    { term: 'Identity Key (Unique Constraint)', def: 'An immutable property (such as student_id or isbn) guaranteed unique across all nodes bearing a given label, used by MERGE clauses to avoid duplicate node creation.' },
    { term: 'Referential Integrity', def: 'The foundational constraint ensuring that a relationship edge cannot exist unless both its source and target nodes exist in the graph (preventing dangling edges).' },
    { term: 'Two-Pass Ingestion', def: 'The standard graph ETL procedure where all node entities are inserted/merged in Pass 1, followed by relationship edge creation in Pass 2.' },
    { term: 'Cypher Query Language', def: 'A declarative graph query language using visual ASCII-art pattern matching (e.g., (s:Student)-[:ENROLLED_IN]->(c:Course)) to express graph traversals.' }
  ];

  const references = [
    { authors: 'Robinson, I., Webber, J., & Eifrem, E. (2015)', title: 'Graph Databases: New Opportunities for Connected Data (2nd ed.)', note: 'O\'Reilly Media. Chapters 2 & 3: Data Modeling with Graphs.' },
    { authors: 'Angles, R., & Gutierrez, C. (2018)', title: 'An Introduction to Graph Data Management', note: 'Graph Data Management: Techniques and Applications, 1-32.' },
    { authors: 'Hogan, A., Blomqvist, E., Cochez, M., et al. (2021)', title: 'Knowledge Graphs', note: 'ACM Computing Surveys (CSUR), 54(4), 1-37.' },
    { authors: 'Neo4j Documentation (2024)', title: 'Cypher Manual: Clauses, Patterns, and Constraints', note: 'Official Neo4j Reference for MERGE, CREATE CONSTRAINT, and LOAD CSV.' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* ── Hero Banner ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm relative overflow-hidden space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          Experiment 11 &bull; Knowledge Graph Engineering
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Design a Knowledge Graph Schema and Import Data
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          Architect expressive domain schemas using the Labeled Property Graph (LPG) paradigm. Formulate node labels, unique identity keys, and directed typed relationships, and execute multi-pass data ingestion with automated referential integrity checking and Cypher DDL script generation.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToLab}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 cursor-pointer transition active:scale-95"
          >
            Launch Schema Modeler Lab <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Learning Objectives ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-emerald-600 rounded-full" />
          Learning Objectives
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {objectives.map((obj, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{obj}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Core Concepts & Theory ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-emerald-600 rounded-full" />
          Foundational Theoretical Framework
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-600" />
              1. The Labeled Property Graph (LPG) Paradigm
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Unlike the Resource Description Framework (RDF) which models data purely as subject-predicate-object triples, the <strong>Labeled Property Graph (LPG)</strong> model endows both nodes and edges with rich, internal key-value attributes:
            </p>
            <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong>Nodes (Vertices):</strong> Represent domain entities (e.g., Student, Course, Faculty) and can hold multiple labels.</li>
              <li><strong>Labels:</strong> Named categories that segment the graph and serve as entry points for fast index lookups.</li>
              <li><strong>Relationships (Edges):</strong> Explicit, directed, named connections (e.g., <code>[:ENROLLED_IN]</code>) connecting exactly two nodes.</li>
              <li><strong>Edge Properties:</strong> Metadata residing directly on the relationship itself (e.g., <code>grade: 'A'</code> or <code>since: 2021</code>), avoiding intermediate join entities.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              2. Data Ingestion &amp; Referential Integrity
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A critical failure mode in graph databases is the <strong>dangling relationship</strong>—an edge whose source or target node ID does not exist in the graph. Production graph ETL pipelines enforce a strict two-pass protocol:
            </p>
            <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong>Pass 1 (Node Ingestion):</strong> Declare uniqueness constraints on primary keys (e.g., <code>student_id</code>) and perform idempotent <code>MERGE</code> operations.</li>
              <li><strong>Pass 2 (Relationship Stitching):</strong> Match existing nodes by their unique keys before drawing edges, preventing orphaned records.</li>
              <li><strong>Pre-Ingestion Validation:</strong> Automated linting checks for missing keys, mismatched label signatures, and unregistered relationship types prior to batch loading.</li>
            </ul>
          </div>
        </div>

        {/* ── Comparison Table ── */}
        <div className="pt-2 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            Architectural Comparison: Relational (RDBMS) vs. Graph Database (LPG)
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 sm:p-4">Architectural Dimension</th>
                  <th className="p-3 sm:p-4">Relational Databases (SQL / RDBMS)</th>
                  <th className="p-3 sm:p-4 bg-emerald-50/40 text-emerald-900">Labeled Property Graph (LPG / Neo4j)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {comparisonMatrix.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 sm:p-4 font-semibold text-slate-800">{row.feature}</td>
                    <td className="p-3 sm:p-4">{row.rdbms}</td>
                    <td className="p-3 sm:p-4 bg-emerald-50/20 font-medium text-emerald-950">{row.graph}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 6-Step Laboratory Procedure ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-emerald-600 rounded-full" />
          Standard Laboratory Procedure
        </h2>
        <div className="space-y-3 pt-1">
          {procedureSteps.map((step, i) => (
            <div key={i} className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Core Glossary / Key Terms ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-emerald-600 rounded-full" />
          Core Terminologies &amp; Architectural Concepts
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {keyTerms.map((term, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {term.term}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{term.def}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Academic References ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-emerald-600 rounded-full" />
          References &amp; Standards
        </h2>
        <div className="space-y-3 pt-1">
          {references.map((ref, i) => (
            <div key={i} className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs sm:text-sm space-y-1">
              <p className="font-semibold text-slate-800">{ref.authors} &bull; <span className="italic">{ref.title}</span></p>
              <p className="text-slate-500 text-xs">{ref.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
