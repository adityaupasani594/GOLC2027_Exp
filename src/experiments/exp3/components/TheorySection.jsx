import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Target, Sparkles, Layers, History, Globe,
  Cpu, Database, ArrowRight, ShieldCheck, CheckCircle2,
  ExternalLink, ListOrdered, Terminal, Zap, Hash
} from 'lucide-react';

export default function TheorySection({ onGoToLab }) {
  const OBJECTIVES = [
    'Understand index inversion: transforming raw document streams into a high-performance Vocabulary Lexicon and sorted Postings Lists.',
    'Implement linear-time O(L₁ + L₂) Two-Pointer Merge algorithms for conjunctive (AND) and disjunctive (OR) Boolean retrieval.',
    'Evaluate positional indexing for sub-second exact phrase matching and NEAR/k proximity queries without re-reading source text.',
    'Quantify linguistic preprocessing (Case Folding, Stopword Removal, Stemming) on vocabulary compression and postings sparsity.'
  ];

  const COMPARISON = [
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

  const PROCEDURE_STEPS = [
    'Step 1: Select an educational document corpus or author custom text in the Workbench.',
    'Step 2: Configure linguistic preprocessing flags (Case Folding, Stopword Filtering, Porter Stemming).',
    'Step 3: Construct the Inverted Index and inspect the 4 stages: Tokenization → Triples Stream → Lexicographic Sorting → Postings Inversion.',
    'Step 4: Inspect Dictionary statistics (Vocabulary Size, Document Frequency df, Collection Frequency cf).',
    'Step 5: Execute Boolean (AND, OR, NOT), exact phrase, and proximity queries with interactive Two-Pointer comparison traces.',
    'Step 6: Analyze Zipfian power-law distributions, record experimental trials, and proceed to the Assessment Quiz.'
  ];

  const REFERENCES = [
    {
      title: 'Introduction to Information Retrieval',
      authors: 'C. D. Manning, P. Raghavan, H. Schütze',
      publisher: 'Cambridge University Press',
      details: 'Chapters 1 & 2: Boolean Retrieval, The Inverted Index, Positional Postings, and Skip Pointers.',
      url: 'https://nlp.stanford.edu/IR-book/'
    },
    {
      title: 'Modern Information Retrieval',
      authors: 'R. Baeza-Yates, B. Ribeiro-Neto',
      publisher: 'Addison-Wesley',
      details: 'Comprehensive reference on index compression, inverted files, and query processing.',
      url: 'https://www.mir2ed.org/'
    },
    {
      title: 'Managing Gigabytes: Compressing and Indexing Documents',
      authors: 'I. H. Witten, A. Moffat, T. C. Bell',
      publisher: 'Morgan Kaufmann Publishers',
      details: 'Seminal work on inverted index construction, postings lists, and memory management.',
      url: 'https://dl.acm.org/doi/book/10.5555/551717'
    }
  ];

  return (
    <div className="space-y-8">

      {/* ── 1. Hero / Purpose Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Experiment 3 &bull; IR Foundations &bull; CS-KGIRS-03
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            The Inverted Index: Core Engine of Information Retrieval
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            The Inverted Index is the foundational algorithmic data structure powering modern web search engines (Google, Lucene, Elasticsearch),
            code repositories, and hybrid AI retrieval systems. By indexing terms to document IDs rather than scanning documents sequentially,
            search engines resolve multi-term queries across billions of pages in under 15 milliseconds.
          </p>
        </div>
      </motion.div>

      {/* ── 2. Pedagogical Rationale & Learning Objectives ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl sm:rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">The Index Inversion Paradigm</h2>
              <p className="text-xs text-slate-500">Overcoming the linear scan O(N · L) bottleneck</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Searching a 10 TB document collection with sequential search (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-700">grep</code>)
            requires scanning every byte on disk—taking hours per query.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            An <strong>Inverted Index</strong> inverts the mapping: instead of asking <em>"Which words appear in Document X?"</em>, we pre-index
            <em>"Which documents contain Term Y?"</em>. Queries are evaluated purely through pointer intersections over sorted integer arrays.
          </p>
        </div>

        <div className="glass rounded-2xl sm:rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 font-bold shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Learning Objectives</h2>
              <p className="text-xs text-slate-500">Competencies targeted in this virtual laboratory</p>
            </div>
          </div>
          <div className="space-y-2">
            {OBJECTIVES.map((obj, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="w-5 h-5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 font-bold shrink-0 flex items-center justify-center text-[10px] mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{obj}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Architecture & Data Structure ── */}
      <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Architecture: Dictionary &amp; Positional Postings Lists
            </h2>
            <p className="text-xs text-slate-500">Two-tier separation of vocabulary metadata and document occurrences</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 p-4 sm:p-5 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner border border-slate-800">
          <div className="text-indigo-400 font-bold mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> Lexicon (Vocabulary) ──► Sorted Positional Postings Lists
          </div>
          <pre className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
{`+------------------+----+----+---------------------------------------------------------------+
| Term (Lexicon)   | df | cf | Postings List Pointer (Sorted by DocID)                       |
+------------------+----+----+---------------------------------------------------------------+
| "information"    |  3 |  4 |  *──► [Doc 1 (tf:1 | pos:[0])] ──► [Doc 3 (tf:2)] ──► [Doc 5] |
| "retrieval"      |  4 |  5 |  *──► [Doc 1 (tf:2 | pos:[1, 6])] ──► [Doc 2] ──► [Doc 3]     |
| "graph"          |  2 |  3 |  *──► [Doc 2 (tf:2 | pos:[3, 7])] ──► [Doc 4 (tf:1)]          |
+------------------+----+----+---------------------------------------------------------------+`}
          </pre>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-1.5">
            <h4 className="font-bold text-indigo-950 text-xs">1. Dictionary (Lexicon / Vocabulary)</h4>
            <p className="text-xs text-indigo-900/80 leading-relaxed">
              Stores unique normalized terms alongside their <strong>Document Frequency (df)</strong>—the number of documents containing the term—and <strong>Collection Frequency (cf)</strong>. Stored in memory as a Hash Table or B-Tree for sub-microsecond O(1) lookup.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-violet-100 bg-violet-50/40 space-y-1.5">
            <h4 className="font-bold text-violet-950 text-xs">2. Sorted Positional Postings Lists</h4>
            <p className="text-xs text-violet-900/80 leading-relaxed">
              Ordered linked lists or contiguous variable-byte arrays storing DocIDs in strictly ascending order (<code className="font-mono text-xs">DocID₁ &lt; DocID₂</code>), term frequencies (tf), and token offset positions for exact phrase and proximity matches.
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. Query Processing: Two-Pointer Merge ── */}
      <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 font-bold shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Query Processing: Linear Two-Pointer Intersection
            </h2>
            <p className="text-xs text-slate-500">Evaluating Boolean AND operations in O(L₁ + L₂) time</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 items-center">
          <div className="p-4 rounded-xl bg-violet-50/70 border border-violet-200 text-xs text-violet-950 font-mono space-y-1.5">
            <p className="font-bold text-violet-900">Algorithm: Linear Intersect(P₁, P₂)</p>
            <p>1. p1 = 0, p2 = 0, result = []</p>
            <p>2. while p1 &lt; len(P₁) and p2 &lt; len(P₂):</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;if P₁[p1].docId == P₂[p2].docId:</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;result.append(P₁[p1].docId); p1++; p2++</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;else if P₁[p1].docId &lt; P₂[p2].docId: p1++</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;else: p2++</p>
            <p>3. return result &bull; <strong>Time: O(L₁ + L₂)</strong></p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
              <strong>Query Optimization via Document Frequency (df):</strong>
              <p className="leading-relaxed">
                When evaluating multi-term conjunctions like <code className="bg-white px-1 py-0.5 rounded font-mono">term₁ AND term₂ AND term₃</code>, the search engine sorts terms in <em>increasing order of df</em>. Intersecting the smallest postings lists first minimizes intermediate candidate sizes exponentially.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 space-y-1">
              <strong>Positional Proximity Verification:</strong>
              <p className="leading-relaxed">
                For phrase queries ("information retrieval"), the engine matches DocIDs first, then performs a secondary pointer merge on their positional arrays to confirm <code className="bg-white px-1 py-0.5 rounded font-mono">pos(term₂) - pos(term₁) == 1</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Complexity Comparison Matrix ── */}
      <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Retrieval Mechanism Complexity Comparison
            </h2>
            <p className="text-xs text-slate-500">Space, execution latency, and phrase expressiveness</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3">Mechanism</th>
                <th className="p-3">Space Complexity</th>
                <th className="p-3">Conjunctive (AND) Search Time</th>
                <th className="p-3">Phrase Queries</th>
                <th className="p-3">Operational Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COMPARISON.map(r => (
                <tr key={r.mechanism} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-900">{r.mechanism}</td>
                  <td className="p-3 font-mono text-slate-600">{r.space}</td>
                  <td className="p-3 font-mono text-indigo-700 font-semibold">{r.andTime}</td>
                  <td className="p-3 text-slate-600">{r.phrase}</td>
                  <td className="p-3 text-slate-700 font-medium">{r.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. Experimental Procedure ── */}
      <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold shrink-0">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Experimental Procedure
            </h2>
            <p className="text-xs text-slate-500">Methodical sequence for conducting virtual laboratory experiments</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {PROCEDURE_STEPS.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 shadow-2xs">
              <span className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px] shadow-xs">
                {idx + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. Academic References & Literature ── */}
      <div className="glass rounded-2xl sm:rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Standard Academic Literature &amp; References
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {REFERENCES.map((ref, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200/80 bg-white/70 space-y-1 text-xs">
              <a
                href={ref.url}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 leading-snug"
              >
                [{idx + 1}] {ref.title} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
              <p className="text-[11px] text-slate-600">{ref.authors} &bull; <em>{ref.publisher}</em></p>
              <p className="text-[11px] text-slate-500 leading-relaxed">{ref.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 8. Call-to-Action to Simulator ── */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onGoToLab}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:from-indigo-500 hover:to-violet-500 transition cursor-pointer"
        >
          Launch Inverted Index Simulator <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
