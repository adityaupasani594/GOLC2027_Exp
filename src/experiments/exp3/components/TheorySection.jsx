import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, ArrowRight,
  Database, Terminal, Zap, Layers, ExternalLink, HelpCircle
} from 'lucide-react';

export default function TheorySection({ onGoToLab }) {
  const objectives = [
    'Understand index inversion: transforming raw document streams into a high-performance Vocabulary Lexicon and sorted Postings Lists.',
    'Implement linear-time O(L₁ + L₂) Two-Pointer Merge algorithms for conjunctive (AND) and disjunctive (OR) Boolean retrieval.',
    'Evaluate positional indexing for sub-second exact phrase matching and NEAR/k proximity queries without re-reading source text.',
    'Quantify linguistic preprocessing (Case Folding, Stopword Removal, Stemming) on vocabulary compression and postings sparsity.'
  ];

  const comparison = [
    {
      mechanism: 'Linear Scan (grep)',
      space: 'O(N · L) (No Index)',
      andTime: 'O(N · L) (Full scan)',
      phrase: 'Supported (Regex/scan)',
      verdict: 'Too slow for large corpora'
    },
    {
      mechanism: 'Term-Doc Incidence Matrix',
      space: 'O(|V| · N) (Extremely Sparse)',
      andTime: 'O(N) (Bitwise AND)',
      phrase: 'Unsupported (No word order)',
      verdict: 'Wastes >99% RAM on zeros'
    },
    {
      mechanism: 'Standard Inverted Index',
      space: 'O(N · L_unique)',
      andTime: 'O(L₁ + L₂) (Two-pointer)',
      phrase: 'Unsupported (Doc-level only)',
      verdict: 'Fast keyword search'
    },
    {
      mechanism: 'Positional Inverted Index',
      space: 'O(Total Tokens N_tokens)',
      andTime: 'O(L₁ + L₂) (Sorted merge)',
      phrase: 'Supported (Positional offsets)',
      verdict: 'Standard in modern search'
    }
  ];

  const procedureSteps = [
    'Step 1: Review the theoretical background, postings list architectures, and two-pointer intersection algorithms.',
    'Step 2: Navigate to the Simulation Lab tab in the experiment navigation bar.',
    'Step 3: Select an educational document corpus (General, Technical, Literature) or author custom documents in the Workbench.',
    'Step 4: Configure linguistic preprocessing flags (Case Folding, Stopword Filtering, Porter Stemming).',
    'Step 5: Construct the Inverted Index and inspect Dictionary statistics (Vocabulary Size, Document Frequency df, Collection Frequency cf).',
    'Step 6: Execute Boolean (AND, OR, NOT), exact phrase, and proximity queries with interactive Two-Pointer comparison traces.',
    'Step 7: Record experimental trials in the session log book, complete the concept assessment Quiz, and generate your verified certificate and lab report.'
  ];

  const keyTerms = [
    { term: 'Inverted Index', def: 'The foundational IR data structure mapping each unique vocabulary term to an ordered list of document IDs (postings) where it occurs.' },
    { term: 'Postings List', def: 'A sorted array or linked list recording document identifiers (and optional term positions or frequencies) for a specific vocabulary term.' },
    { term: 'Dictionary (Lexicon)', def: 'The in-memory vocabulary of unique normalized terms, typically indexed via B-Tree or Hash Table for O(1) term lookup.' },
    { term: 'Two-Pointer Merge', def: 'A linear-time O(L₁ + L₂) algorithm that intersects two sorted postings lists simultaneously by advancing pointer indices.' },
    { term: 'Document Frequency (df)', def: 'The count of unique documents in the collection that contain a specific term at least once.' },
    { term: 'Positional Index', def: 'An extended inverted index recording exact token offset positions within each document to support exact phrase and proximity queries.' },
    { term: 'Skip Pointers', def: 'Forward shortcuts embedded in postings lists at intervals of √L to allow merge algorithms to skip over non-matching document blocks.' }
  ];

  const references = [
    {
      authors: 'C. D. Manning, P. Raghavan, & H. Schütze (2008)',
      title: 'Introduction to Information Retrieval',
      publisher: 'Cambridge University Press',
      details: 'Chapters 1 & 2: Boolean Retrieval, The Inverted Index, Positional Postings, and Skip Pointers.',
      url: 'https://nlp.stanford.edu/IR-book/'
    },
    {
      authors: 'R. Baeza-Yates & B. Ribeiro-Neto (2011)',
      title: 'Modern Information Retrieval (2nd ed.)',
      publisher: 'Addison-Wesley',
      details: 'Comprehensive reference on index compression, inverted files, and query processing.',
      url: 'https://www.mir2ed.org/'
    },
    {
      authors: 'I. H. Witten, A. Moffat, & T. C. Bell (1999)',
      title: 'Managing Gigabytes: Compressing and Indexing Documents',
      publisher: 'Morgan Kaufmann Publishers',
      details: 'Seminal work on inverted index construction, postings lists, and memory management.',
      url: 'https://dl.acm.org/doi/book/10.5555/551717'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-800">
      {/* ── 1. Hero Banner ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm relative overflow-hidden space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          Experiment 3 &bull; Foundations of Information Retrieval
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          The Inverted Index: Core Engine of Information Retrieval
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          The Inverted Index is the foundational algorithmic data structure powering modern web search engines (Google, Lucene, Elasticsearch), code repositories, and hybrid AI retrieval systems. By indexing terms to document IDs rather than scanning documents sequentially, search engines resolve multi-term queries across billions of pages in under 15 milliseconds.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToLab}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 cursor-pointer transition active:scale-95"
          >
            Launch Simulation Lab <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. Learning Objectives ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Learning Objectives
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {objectives.map((obj, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
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
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Foundational Theoretical Framework
        </h2>

        {/* Index Architecture Graphic */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 font-mono text-xs border border-slate-800 shadow-inner">
          <div className="text-indigo-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-sans">
            <Terminal className="w-3.5 h-3.5" /> Lexicon Dictionary ──► Sorted Positional Postings Lists
          </div>
          <pre className="text-slate-300 leading-relaxed text-[11px] sm:text-xs overflow-x-auto">
{`+------------------+----+----+---------------------------------------------------------------+
| Term (Lexicon)   | df | cf | Postings List Pointer (Sorted by DocID)                       |
+------------------+----+----+---------------------------------------------------------------+
| "information"    |  3 |  4 |  *──► [Doc 1 (tf:1 | pos:[0])] ──► [Doc 3 (tf:2)] ──► [Doc 5] |
| "retrieval"      |  4 |  5 |  *──► [Doc 1 (tf:2 | pos:[1, 6])] ──► [Doc 2] ──► [Doc 3]     |
| "graph"          |  2 |  3 |  *──► [Doc 2 (tf:2 | pos:[3, 7])] ──► [Doc 4 (tf:1)]          |
+------------------+----+----+---------------------------------------------------------------+`}
          </pre>
        </div>

        {/* Structural Decomposition Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-1.5">
            <h3 className="font-bold text-indigo-950 text-xs sm:text-sm">1. Dictionary (Lexicon / Vocabulary)</h3>
            <p className="text-xs text-indigo-900/80 leading-relaxed">
              Stores unique normalized terms alongside their <strong>Document Frequency (df)</strong>—the number of documents containing the term—and <strong>Collection Frequency (cf)</strong>. Stored in memory as a Hash Table or B-Tree for sub-microsecond O(1) lookup.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-violet-100 bg-violet-50/40 space-y-1.5">
            <h3 className="font-bold text-violet-950 text-xs sm:text-sm">2. Sorted Positional Postings Lists</h3>
            <p className="text-xs text-violet-900/80 leading-relaxed">
              Ordered linked lists or contiguous variable-byte arrays storing DocIDs in strictly ascending order (<code className="font-mono text-xs">DocID₁ &lt; DocID₂</code>), term frequencies (tf), and token offset positions for exact phrase and proximity matches.
            </p>
          </div>
        </div>

        {/* Two-Pointer Merge Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <Zap className="w-4 h-4" />
            Query Processing: Linear Two-Pointer Intersection (O(L₁ + L₂))
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            When intersecting two sorted postings lists P₁ and P₂, comparing current pointers allows instant convergence. If DocIDs match, the document satisfies the conjunction and both pointers advance. If one DocID is smaller, only that pointer advances:
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 space-y-1">
            <p className="text-indigo-700 font-semibold">Algorithm: Intersect(P₁, P₂)</p>
            <p>while p1 &lt; len(P₁) and p2 &lt; len(P₂):</p>
            <p>&nbsp;&nbsp;if P₁[p1].docId == P₂[p2].docId: add(P₁[p1].docId); p1++; p2++</p>
            <p>&nbsp;&nbsp;else if P₁[p1].docId &lt; P₂[p2].docId: p1++</p>
            <p>&nbsp;&nbsp;else: p2++</p>
          </div>
        </div>
      </div>

      {/* ── 4. Technical Comparison Matrix ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Technical Comparison Matrix
        </h2>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Mechanism</th>
                <th className="p-2.5">Space Complexity</th>
                <th className="p-2.5">Conjunctive (AND) Search Time</th>
                <th className="p-2.5">Phrase Queries</th>
                <th className="p-2.5">Operational Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {comparison.map(r => (
                <tr key={r.mechanism} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-900">{r.mechanism}</td>
                  <td className="p-2.5 font-mono text-slate-600">{r.space}</td>
                  <td className="p-2.5 font-mono text-indigo-700 font-semibold">{r.andTime}</td>
                  <td className="p-2.5 text-slate-600">{r.phrase}</td>
                  <td className="p-2.5 text-slate-700 font-medium">{r.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Laboratory Procedure ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Laboratory Procedure
        </h2>
        <div className="space-y-2.5 pt-1">
          {procedureSteps.map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
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
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          Key Terminology &amp; Definitions
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
          {keyTerms.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-indigo-900">{item.term}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.def}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. References & Further Reading ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          References &amp; Further Reading
        </h2>
        <div className="space-y-3 pt-1">
          {references.map((ref, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <div className="text-xs sm:text-sm font-semibold text-slate-800">
                {ref.authors} &mdash; <span className="font-bold text-indigo-700">{ref.title}</span> ({ref.publisher})
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
