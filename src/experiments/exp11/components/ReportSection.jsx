import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, Target, BarChart2, BookOpen, FlaskConical, CheckCircle2 } from 'lucide-react';
import { GRADE } from './CertificateSection';

const EXP_INFO = {
  title: 'Design a Knowledge Graph Schema and Import Data',
  subtitle: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  code: 'CS-KG-11',
  version: '2027.1',
  aim: 'To design a domain schema using the Labeled Property Graph (LPG) paradigm, formulate node labels, unique identity keys, and directed typed relationships, and execute multi-pass data ingestion with automated referential integrity checking and Cypher DDL script generation.',
};

const OBJECTIVES = [
  'Model domain entities and relationships using the Labeled Property Graph (LPG) paradigm.',
  'Formulate node label sets, distinct identity keys, and typed directed relationships.',
  'Implement multi-pass data ingestion with automated referential integrity and dangling key validation.',
  'Generate standard Cypher DDL (uniqueness constraints, LOAD CSV, MERGE) for enterprise graph databases like Neo4j.',
];

const INGESTION_STAGES = [
  {
    stage: 'Stage 1',
    name: 'Domain Ontology & Schema Modeling',
    desc: 'Formulate entity types, assign node labels, define unique identity keys, and establish directed relationship signatures with optional edge properties.',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  {
    stage: 'Stage 2',
    name: 'Schema Constraint Definition (DDL)',
    desc: 'Issue Cypher uniqueness constraints (CREATE CONSTRAINT ... REQUIRE n.key IS UNIQUE) to prevent duplicate entities and build fast lookup indices.',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
  },
  {
    stage: 'Stage 3',
    name: 'Node Ingestion (Pass 1)',
    desc: 'Execute idempotent batch MERGE operations on entity nodes to ensure each vertex exists in the graph store before any edges are connected.',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  {
    stage: 'Stage 4',
    name: 'Relationship Stitching & Integrity Check (Pass 2)',
    desc: 'Match pre-existing source and target vertices on identity keys and instantiate directed edges, rejecting dangling foreign keys.',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
];

export default function ReportSection({
  studentInfo = {},
  onInfoChange,
  trials = [],
  quizScore = 15,
  totalQuestions = 15,
  onReportGenerated,
}) {
  const [observations, setObservations] = useState(
    '1. LPG vs. Relational Modeling: Modeling entities directly as nodes and relations as typed edges eliminated the need for relational junction/bridge tables, replacing multi-way SQL table joins with index-free pointer traversals.\n\n' +
    '2. Referential Integrity & Ingestion Protocol: The automated integrity checker verified that relationship edges require pre-existing source and target vertices. In the corrupted test dataset, dangling student_id ("S999") and unregistered relationship types were successfully flagged before ingestion, preventing silent database corruption.\n\n' +
    '3. Identity Constraints & MERGE Semantics: Establishing uniqueness constraints on node keys (e.g., student_id, course_id) ensured that running the ingestion pipeline multiple times remains idempotent without creating duplicate entities.\n\n' +
    '4. Query Expressiveness: Declarative Cypher pattern matching (e.g., MATCH (s:Student)-[:ENROLLED_IN]->(c:Course)) allowed multi-hop traversals across departmental boundaries with concise, readable syntax compared to nested SQL queries.'
  );

  const score = quizScore ?? 0;
  const pct   = Math.round((score / totalQuestions) * 100);
  const grade = GRADE(pct);
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (onReportGenerated) {
      onReportGenerated();
    }
  }, [onReportGenerated]);

  const handlePrintReport = () => {
    if (onReportGenerated) onReportGenerated();
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header — hidden on print */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 no-print">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />
          Section 5 — Academic Laboratory Report
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Laboratory Experiment Report</h2>
        <p className="text-slate-500 text-sm">Review your experiment results, observations, and assessment record before printing or archiving.</p>
      </motion.div>

      {/* Printable Report Document */}
      <div id="report-print-area" className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-lg space-y-8 print:border-none print:shadow-none print:p-0">

        {/* Institution & Report Header */}
        <div className="border-b-2 border-slate-800 pb-6 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                {studentInfo.institution || 'Department of Computer Engineering'}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {EXP_INFO.title}
              </h1>
              <p className="text-xs text-slate-500">{EXP_INFO.subtitle} &bull; Course Code: {EXP_INFO.code}</p>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-700">
                EXP-11 &bull; v{EXP_INFO.version}
              </span>
              <p className="text-xs text-slate-400 mt-1">{today}</p>
            </div>
          </div>
        </div>

        {/* Student Metadata Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <p className="font-bold text-slate-400 uppercase text-[10px]">Student Name</p>
            <p className="font-semibold text-slate-800 mt-0.5">{studentInfo.name || 'Student Scholar'}</p>
          </div>
          <div>
            <p className="font-bold text-slate-400 uppercase text-[10px]">Student / Roll ID</p>
            <p className="font-semibold text-slate-800 font-mono mt-0.5">{studentInfo.studentId || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold text-slate-400 uppercase text-[10px]">Instructor</p>
            <p className="font-semibold text-slate-800 mt-0.5">{studentInfo.instructor || 'Faculty In-Charge'}</p>
          </div>
          <div>
            <p className="font-bold text-slate-400 uppercase text-[10px]">Assessment Grade</p>
            <p className={`font-bold font-mono mt-0.5 ${grade.color}`}>{grade.label} ({pct}%)</p>
          </div>
        </div>

        {/* Aim & Objectives */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-emerald-600" /> Aim &amp; Learning Objectives
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            {EXP_INFO.aim}
          </p>
          <ul className="grid sm:grid-cols-2 gap-2 pt-1">
            {OBJECTIVES.map((obj, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4 Ingestion Stages */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5 text-emerald-600" /> Knowledge Graph Ingestion Lifecycle
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {INGESTION_STAGES.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.stage}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.color}`}>{s.name}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Experimental Session Trials Log */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-3.5 h-3.5 text-emerald-600" /> Experimental Session Trial Records
          </h3>
          {trials.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-slate-100">
              No simulation trials recorded during this session.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Trial #</th>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Domain</th>
                    <th className="p-2.5">Mode</th>
                    <th className="p-2.5">Nodes</th>
                    <th className="p-2.5">Edges</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {trials.map((tr, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold">{idx + 1}</td>
                      <td className="p-2.5">{tr.timestamp}</td>
                      <td className="p-2.5 font-semibold">{tr.domain}</td>
                      <td className="p-2.5">{tr.isCorruptedTest ? 'Corrupted Injected' : 'Standard'}</td>
                      <td className="p-2.5">{tr.nodeCount}</td>
                      <td className="p-2.5">{tr.edgeCount}</td>
                      <td className="p-2.5 font-bold text-emerald-600">{tr.valid ? 'PASSED' : 'FAILED'}</td>
                      <td className="p-2.5 font-bold text-red-600">{tr.errorCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Observations & Findings (Editable) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Student Analysis &amp; Experimental Observations
            </h3>
            <span className="text-[10px] text-slate-400 no-print">(Editable)</span>
          </div>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={7}
            className="w-full p-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-sans leading-relaxed text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 transition"
          />
        </div>

        {/* Verification & Signatures */}
        <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-1">
            <div className="w-40 h-0.5 bg-slate-300 mx-auto" />
            <p className="font-semibold text-slate-800">{studentInfo.name || 'Student Candidate'}</p>
            <p className="text-slate-400 text-[10px]">Student Signature</p>
          </div>
          <div className="space-y-1">
            <div className="w-40 h-0.5 bg-slate-300 mx-auto" />
            <p className="font-semibold text-slate-800">{studentInfo.instructor || 'Faculty In-Charge'}</p>
            <p className="text-slate-400 text-[10px]">Evaluator Signature &amp; Date</p>
          </div>
        </div>
      </div>

      {/* Action Footer — hidden on print */}
      <div className="flex justify-end gap-3 no-print">
        <button
          onClick={handlePrintReport}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs sm:text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 transition shadow-md shadow-emerald-200 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF Lab Report
        </button>
      </div>
    </div>
  );
}
