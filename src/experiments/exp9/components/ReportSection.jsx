import React from 'react';
import { UnifiedReportSection } from '../../../components/common';
import { EXPERIMENT_CONFIG } from '../relationshipExtractionEngine';
export { GRADE } from './CertificateSection';

const PIPELINE_STAGES = [
  { stage: 'Stage 1', name: 'Named Entity Recognition (NER)', desc: 'Detect entity spans across Persons, Organizations, Locations, and Roles.', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { stage: 'Stage 2', name: 'Dependency & Pattern Parsing', desc: 'Traverse grammatical dependencies connecting subject and object arguments.', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { stage: 'Stage 3', name: 'Voice Inversion & Canonicalization', desc: 'Normalize passive voice constructions and resolve prepositional attachments.', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { stage: 'Stage 4', name: 'Knowledge Graph Triple Synthesis', desc: 'Emit structured (Subject, Relation, Object) triples and construct graph edges.', color: 'bg-purple-50 border-purple-200 text-purple-700' },
];

const DEFAULT_OBSERVATIONS =
  '1. Entity Recognition & Span Identification: Gazetteer matching combined with syntactic boundary parsing correctly identified multi-word entity tokens without fragmenting compound proper nouns.\n\n' +
  '2. Syntactic Voice Inversion: The dependency parser reliably inverted passive voice constructions (e.g., "was acquired by" -> "acquired") to yield canonical, directional semantic relationships.\n\n' +
  '3. Negation & Appositive Filtering: Applying negation filters prevented incorrect assertion triples from entering the knowledge store when negated predicates were encountered.\n\n' +
  '4. Knowledge Graph Integration: Extracted relational triples mapped seamlessly into node-edge-node topologies, enabling immediate semantic traversal.';

export default function ReportSection({
  quizScore = 0,
  totalQuestions = 10,
  studentInfo = {},
  recordedTrials = [],
  trials = [],
  onInfoChange,
  onReportGenerated,
}) {
  const activeTrials = trials?.length > 0 ? trials : recordedTrials;
  const allRecordedTriples = activeTrials.flatMap((tr) => tr.triples || []);

  return (
    <UnifiedReportSection
      expNumber={9}
      expTitle={EXPERIMENT_CONFIG.title}
      expSubtitle={EXPERIMENT_CONFIG.course}
      expCode={EXPERIMENT_CONFIG.courseCode}
      expVersion="2027.1"
      aim="To extract named entities and semantic relationships from natural language text using syntactic dependency patterns, resolve active and passive voice constructions, and synthesize structured (Subject, Predicate, Object) knowledge graph triples."
      objectives={EXPERIMENT_CONFIG.objectives}
      pipelineStages={PIPELINE_STAGES}
      trials={activeTrials}
      renderTrials={(trialList) => (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Extracted Semantic Triples ({allRecordedTriples.length} Discovered across {trialList.length} Runs)
          </div>
          {allRecordedTriples.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center italic">
              No relational triples recorded yet. Switch to the Simulation Lab tab and run relation extraction on text samples.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Predicate / Relationship</th>
                    <th className="py-2.5 px-3">Object</th>
                    <th className="py-2.5 px-3 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {allRecordedTriples.map((tr, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-indigo-900">{tr.subject}</td>
                      <td className="py-2 px-3 text-purple-700 font-bold">{tr.predicate || tr.relation}</td>
                      <td className="py-2 px-3 font-semibold text-teal-900">{tr.object}</td>
                      <td className="py-2 px-3 text-right text-emerald-700 font-bold">{tr.confidence || '0.95'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      quizScore={quizScore}
      totalQuestions={totalQuestions}
      studentInfo={studentInfo}
      onInfoChange={onInfoChange}
      initialObservations={DEFAULT_OBSERVATIONS}
      onReportGenerated={onReportGenerated}
    />
  );
}
