import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, FlaskConical, HelpCircle, FileText,
  Sparkles, Database, Search, ChevronDown, ChevronUp,
  Play, CheckCircle, CheckCircle2, XCircle,
  Hash, BarChart2, Layers, Filter,
  GitMerge, Tag, Zap, Award
} from 'lucide-react';
import { ExperimentNavbar } from '../../components/common';
import {
  buildInvertedIndex, executeKeywordQuery, booleanAndWithTrace,
  booleanOrWithTrace, executePhraseQuery, executeProximityQuery,
  DEFAULT_STOPWORDS
} from './invertedIndexEngine';
import QuizSection, { QUIZ_QUESTIONS } from './components/QuizSection';
import CertificateSection from './components/CertificateSection';
import ReportSection from './components/ReportSection';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EXPERIMENT CONFIG (mirrors EXP3.py)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const EXP_CONFIG = {
  expNo: 3,
  title: 'Construction of an Inverted Index',
  subject: 'Knowledge Graphs & Information Retrieval Systems (KGIRS)',
  courseCode: 'CS-KGIRS-03',
  targetRolls: 'Roll Numbers 11 â€“ 15 (Division C)',
  aim: 'To construct and analyze an Inverted Index data structure for a collection of textual documents, explore linguistic preprocessing transformations (tokenization, stopword removal, stemming), and execute Boolean, phrase, and proximity queries with linear-time pointer-merge algorithms.',
  objectives: [
    'Construct an Inverted Index data structure mapping vocabulary terms to documents, term frequencies (tf), and token positions.',
    'Trace the 4 core pipeline stages: Document Tokenization, Pair Extraction, Lexicographic Sorting, and Postings Inversion.',
    'Implement and visualize linear-time Boolean retrieval (AND, OR, NOT) using sorted posting list pointer intersections.',
    'Execute positional phrase queries and proximity searches by matching token offsets within identical document postings.',
    'Quantify the empirical effect of linguistic preprocessing on vocabulary size and index compression.',
    'Analyze collection-wide term frequency distributions and validate Zipf\'s Law and Heaps\' Law.',
  ],
};

const BENCHMARK_CORPORA = {
  'IR & Search Engines': {
    1: 'Information retrieval systems index documents for fast keyword search and query processing.',
    2: 'Search engines construct an inverted index with dictionary terms and sorted postings lists.',
    3: 'Boolean retrieval evaluates AND, OR, and NOT queries using posting list intersection algorithms.',
    4: 'Positional postings store word positions within documents to enable exact phrase queries and proximity search.',
    5: 'Modern search engines combine inverted index lexical matching with dense embedding retrieval.',
  },
  'Knowledge Graphs (KGIRS)': {
    1: 'A knowledge graph organizes entities and relationships into an interconnected semantic network.',
    2: 'Graph databases like Neo4j store nodes and edges for efficient graph traversal and query execution.',
    3: 'Cypher queries retrieve multi-hop relationships and pattern matches across knowledge graphs.',
    4: 'Information extraction pipelines identify named entities and semantic relations from unstructured text.',
    5: 'Hybrid systems integrate knowledge graphs with information retrieval for contextual search and question answering.',
  },
  'NLP & Text Engineering': {
    1: 'Text preprocessing involves tokenization, case folding, stopword removal, and word stemming.',
    2: 'Stemming algorithms like the Porter stemmer reduce morphological variants of words to a common base.',
    3: 'Term frequency and document frequency determine keyword importance according to Zipf\'s law.',
    4: 'Linguistic normalization reduces vocabulary size and improves information retrieval recall.',
    5: 'Token position indices allow search engines to distinguish between adjacent phrases and scattered words.',
  },
};

const _UNUSED_QUIZ_QUESTIONS_PLACEHOLDER = [
  {
    id: 1,
    question: 'Why is an Inverted Index preferred over a Term-Document Incidence Matrix for large document collections?',
    options: [
      'A) Incidence matrices cannot store numbers or punctuation.',
      'B) Incidence matrices are extremely sparse (>99% zeroes), wasting immense memory, whereas inverted indexes store only non-zero occurrences.',
      'C) Inverted indexes eliminate the need for computing term frequencies.',
      'D) Incidence matrices cannot be stored in binary format.',
    ],
    answerIndex: 1,
    explanation: 'Natural language text exhibits extreme sparsity. A full incidence matrix of |V|Ã—N allocates space for billions of zeroes, whereas an inverted index only allocates space for documents where terms actually occur.',
  },
  {
    id: 2,
    question: 'What is the worst-case time complexity of merging two sorted postings lists of lengths x and y using the two-pointer intersection algorithm?',
    options: ['A) O(x * y)', 'B) O(x + y)', 'C) O(log(x + y))', 'D) O(xÂ² + yÂ²)'],
    answerIndex: 1,
    explanation: 'Because postings lists are maintained in sorted order of Document ID, a linear two-pointer scan evaluates each element at most once, yielding optimal O(x + y) running time.',
  },
  {
    id: 3,
    question: 'In processing a conjunctive Boolean query (A AND B AND C) where df(A)=1500, df(B)=30, df(C)=400, which sequence minimizes intermediate processing?',
    options: [
      'A) Evaluate (A AND B) first, then intersect with C.',
      'B) Evaluate (A AND C) first, then intersect with B.',
      'C) Evaluate (B AND C) first, then intersect with A (increasing order of df).',
      'D) The evaluation order has no measurable effect.',
    ],
    answerIndex: 2,
    explanation: 'Standard query optimization sorts terms in increasing order of document frequency. Intersecting B (df=30) and C (df=400) creates at most 30 candidates, making the final intersection with A rapid.',
  },
  {
    id: 4,
    question: 'What primary capability does a Positional Inverted Index provide over a standard inverted index?',
    options: [
      'A) It allows searching documents by creation timestamp.',
      'B) It enables exact phrase queries and proximity searches (word A within k words of word B).',
      'C) It automatically translates queries into foreign languages.',
      'D) It reduces the physical disk space required.',
    ],
    answerIndex: 1,
    explanation: 'By storing exact token offsets within each document posting, the query engine can verify whether adjacent terms appear sequentially (pos2 = pos1 + 1) or within a window k.',
  },
  {
    id: 5,
    question: 'What is the theoretically optimal skip pointer interval for a postings list of length L?',
    options: [
      'A) Every 2 postings.',
      'B) Approximately âˆšL evenly spaced postings.',
      'C) Exactly L/2 postings.',
      'D) Skip pointers must only be placed at powers of two.',
    ],
    answerIndex: 1,
    explanation: 'Placing skip pointers at intervals of âˆšL balances the number of skips with the maximum steps between skip pointers, reducing traversal comparisons to O(âˆšL).',
  },
  {
    id: 6,
    question: 'How does aggressive stopword removal and Porter stemming affect vocabulary size |V|?',
    options: [
      'A) It significantly decreases |V| and compresses postings lists by merging morphological variants.',
      'B) It increases vocabulary size exponentially by creating new root words.',
      'C) It leaves vocabulary size unchanged.',
      'D) It corrupts the index and prevents keyword search.',
    ],
    answerIndex: 0,
    explanation: 'Stopword removal eliminates high-frequency terms while stemming collapses multiple inflectional forms into a single vocabulary entry, substantially compressing |V|.',
  },
  {
    id: 7,
    question: "Zipf's Law states f * r â‰ˆ C. What does this imply about natural language corpora?",
    options: [
      'A) Every word appears with identical frequency.',
      'B) A small set of frequent words accounts for a huge portion of all tokens, while most words appear rarely (long tail).',
      'C) Longer words always appear more frequently.',
      'D) Term frequencies increase exponentially as rank increases.',
    ],
    answerIndex: 1,
    explanation: "Zipf's law describes a heavy-tailed power-law distribution: the top 50â€“100 words (stopwords) make up ~50% of any collection, while thousands of rare terms occur only once or twice.",
  },
  {
    id: 8,
    question: 'What is the precise conceptual difference between Term Frequency (tf) and Document Frequency (df)?',
    options: [
      'A) tf is the document length; df is the vocabulary length.',
      'B) tf is the number of times a term appears in a specific document; df is the total documents containing the term.',
      'C) tf and df are identical metrics.',
      'D) df counts characters, while tf counts words.',
    ],
    answerIndex: 1,
    explanation: 'Term frequency tf_{t,d} measures local term occurrence within a single document d, while document frequency df_t measures global dispersion across the entire collection.',
  },
  {
    id: 9,
    question: "When evaluating a phrase query 'term1 term2', what condition must be met?",
    options: [
      'A) term1 and term2 must have identical document frequencies.',
      'B) There must exist a document d containing term1 at position p and term2 at position p+1.',
      'C) Both terms must appear anywhere in the document regardless of order.',
      'D) term1 must appear in Doc 1 and term2 in Doc 2.',
    ],
    answerIndex: 1,
    explanation: 'Phrase queries require adjacency: within the same document d, the token position of the second term must be exactly one greater than the first (pos2 = pos1 + 1).',
  },
  {
    id: 10,
    question: 'What is the primary advantage of SPIMI over BSBI indexing?',
    options: [
      'A) SPIMI eliminates the need for sorting postings lists.',
      'B) SPIMI builds dynamic postings lists directly in memory without sorting intermediate (term, docID) pairs on disk.',
      'C) SPIMI does not require any RAM.',
      'D) SPIMI is only applicable to binary data.',
    ],
    answerIndex: 1,
    explanation: 'BSBI writes unsorted (termID, docID) pairs to disk causing I/O bottlenecks. SPIMI allocates dynamic postings arrays in memory as documents are parsed, writing pre-sorted block indexes.',
  },
];

const REFERENCES = [
  {
    title: 'Introduction to Information Retrieval',
    authors: 'Christopher D. Manning, Prabhakar Raghavan, and Hinrich SchÃ¼tze',
    publisher: 'Cambridge University Press, 2008',
    details: 'Chapters 1 & 2: Boolean Retrieval, The Inverted Index, Positional Postings, and Skip Pointers.',
    url: 'https://nlp.stanford.edu/IR-book/',
  },
  {
    title: 'Modern Information Retrieval: The Concepts and Technology behind Search',
    authors: 'Ricardo Baeza-Yates and Berthier Ribeiro-Neto',
    publisher: 'Addison-Wesley, 2nd Edition, 2011',
    details: 'Comprehensive coverage of index compression, inverted file structures, and query processing.',
    url: 'https://www.mir2ed.org/',
  },
  {
    title: 'Managing Gigabytes: Compressing and Indexing Documents and Images',
    authors: 'Ian H. Witten, Alistair Moffat, and Timothy C. Bell',
    publisher: 'Morgan Kaufmann Publishers, 1999',
    details: 'Seminal reference on inverted file construction, memory management, and fast text compression.',
    url: 'https://dl.acm.org/doi/book/10.5555/551717',
  },
  {
    title: 'Virtual Labs Portal',
    authors: 'Ministry of Education, Govt. of India',
    publisher: 'Virtual Labs Project (vlabs.ac.in)',
    details: 'Pedagogical lab guidelines and simulation paradigms for CS & Engineering education.',
    url: 'https://vlabs.ac.in/',
  },
];

const PROCEDURE_STEPS = [
  'Review the Aim, Learning Objectives, and Theoretical Foundation of Inverted Indexes.',
  'Attempt the Pre-Test questions in the Self-Evaluation tab to assess foundational knowledge.',
  'Navigate to the Simulation workbench and select an educational corpus or input custom documents.',
  'Configure the linguistic preprocessing switches (Case Folding, Stopword Removal, Porter Stemming).',
  "Click 'Construct Inverted Index' and trace the 4 pipeline stages: Tokenization, Triples, Sorting, and Postings Inversion.",
  'Inspect the Dictionary statistics (Vocabulary size, Document Frequency df, Collection Frequency cf).',
  'Execute Keyword, Boolean (AND, OR, NOT), Phrase, and Proximity search queries in the Query Console.',
  'Observe the step-by-step Pointer Comparison Trace to understand the linear-time merge algorithm.',
  "Click 'Record Current Trial' to capture metrics across at least 3 distinct preprocessing configurations.",
  'Complete the Self-Evaluation Quiz to verify conceptual mastery.',
  'Open Report Generation, enter your Student Roll Number and Name, and download the PDF report.',
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SUB-COMPONENTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ Theory Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TheoryTab({ onGoToLab }) {
  const [openSection, setOpenSection] = useState(null);
  const toggle = (id) => setOpenSection(prev => prev === id ? null : id);

  const sections = [
    {
      id: 'intro',
      title: '1. Introduction & Indexing Architecture',
      icon: Database,
      content: (
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>A naive approach to search â€” linear scanning â€” requires <span className="font-mono bg-indigo-50 px-1 rounded text-indigo-700">O(N·L)</span> time per query, infeasible for web-scale collections. To deliver sub-second retrieval latencies, IR systems build an offline <strong>Index</strong>.</p>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
            <div className="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Dictionary (Vocabulary)</span>
              <span className="text-[10px] text-slate-500 font-mono">â€” Inverted Index Architecture</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-4 py-2 text-left font-semibold text-slate-300">Term</th>
                    <th className="px-4 py-2 text-center font-semibold text-slate-300">df</th>
                    <th className="px-4 py-2 text-center font-semibold text-slate-300">cf</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-300">Postings Pointer</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { term: '"information"', df: 3, cf: 4, postings: ['Doc1 (tf:1)', 'Doc3 (tf:2)', 'Doc5'] },
                    { term: '"retrieval"',   df: 4, cf: 5, postings: ['Doc1 (tf:2)', 'Doc2', 'Doc3', 'Doc5'] },
                    { term: '"graph"',       df: 2, cf: 3, postings: ['Doc2 (tf:2)', 'Doc4 (tf:1)'] },
                  ].map((row, i) => (
                    <tr key={row.term} className={i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'}>
                      <td className="px-4 py-2.5 text-green-400 font-semibold">{row.term}</td>
                      <td className="px-4 py-2.5 text-center text-blue-300 font-bold">{row.df}</td>
                      <td className="px-4 py-2.5 text-center text-violet-300 font-bold">{row.cf}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-slate-500">←’</span>
                          {row.postings.map((p, pi) => (
                            <span key={pi} className="flex items-center gap-1">
                              <span className="px-2 py-0.5 rounded bg-slate-700 border border-slate-600 text-teal-300">{p}</span>
                              {pi < row.postings.length - 1 && <span className="text-slate-500 text-[10px]">←’</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p><strong>Two Components:</strong> (1) <em>Dictionary (Lexicon)</em> â€” stores unique terms with df and cf statistics; (2) <em>Postings Lists</em> â€” sorted sequences of DocIDs with tf and position arrays.</p>
        </div>
      ),
    },
    {
      id: 'pipeline',
      title: '2. 4-Stage Index Construction Pipeline',
      icon: Layers,
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          {[
            { stage: 'Stage 1', name: 'Token Stream Extraction', desc: 'Tokenize each document. Apply case folding, punctuation removal, stopword filtering, Porter stemming. Output: list of (term, pos, rawToken) triples per document.', color: 'bg-indigo-500' },
            { stage: 'Stage 2', name: '(Term, DocID, Position) Triples', desc: 'For each token in each document, emit a triple (term, docId, position). These are the raw building blocks of the index.', color: 'bg-violet-500' },
            { stage: 'Stage 3', name: 'Lexicographic Sort', desc: 'Sort all triples by (term, docId, position). After sorting, triples for the same term are contiguous, enabling efficient postings aggregation.', color: 'bg-blue-500' },
            { stage: 'Stage 4', name: 'Postings List Inversion', desc: 'Group consecutive triples by term. For each term, build: df (distinct docs), cf (total occurrences), and a postings dict {docId: {tf, positions:[]}}.', color: 'bg-teal-500' },
          ].map(s => (
            <div key={s.stage} className="flex gap-3">
              <div className={`w-2 rounded-full ${s.color} flex-shrink-0`} />
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.stage}</span>
                <p className="font-semibold text-slate-800">{s.name}</p>
                <p className="text-slate-500 text-xs">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'boolean',
      title: '3. Boolean Retrieval & Two-Pointer Algorithms',
      icon: GitMerge,
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="font-bold text-emerald-800 text-xs uppercase tracking-wide mb-2">AND (Intersection) â€” O(Lâ‚ + Lâ‚‚)</p>
              <ul className="text-xs space-y-1 text-emerald-700">
                <li>â€¢ If DocID(p1) == DocID(p2): match ←’ add, advance both</li>
                <li>â€¢ If DocID(p1) &lt; DocID(p2): advance p1</li>
                <li>â€¢ If DocID(p1) &gt; DocID(p2): advance p2</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="font-bold text-blue-800 text-xs uppercase tracking-wide mb-2">OR (Union) â€” O(Lâ‚ + Lâ‚‚)</p>
              <ul className="text-xs space-y-1 text-blue-700">
                <li>â€¢ Append the smaller DocID and advance that pointer</li>
                <li>â€¢ If identical, append once and advance both</li>
                <li>â€¢ Drain remaining elements from whichever list is longer</li>
              </ul>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <strong>Query Optimization:</strong> For multi-term AND queries, sort terms by increasing df. Intersecting shortest lists first minimizes intermediate candidate sets dramatically.
          </div>
        </div>
      ),
    },
    {
      id: 'positional',
      title: '4. Positional Indexing & Phrase Queries',
      icon: Tag,
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <p>A positional index stores exact token offsets: <span className="font-mono bg-slate-100 px-1 rounded text-slate-700">âŸ¨DocID, tf, [posâ‚, posâ‚‚, â€¦, pos_tf]âŸ©</span></p>
          <p>For phrase query <span className="font-mono text-indigo-600">"term1 term2"</span>: find docs where term1 appears at position p AND term2 appears at p+1.</p>
          <p>For proximity query <span className="font-mono text-violet-600">term1 NEAR/k term2</span>: find docs where |posâ‚ - posâ‚‚| â‰¤ k.</p>
        </div>
      ),
    },
    {
      id: 'laws',
      title: "5. Zipf's Law & Heaps' Law",
      icon: BarChart2,
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <p className="font-bold text-purple-800 mb-1">Zipf's Law</p>
              <p className="font-mono text-xs bg-white rounded p-2 text-purple-700 mb-2">f(r) âˆ 1/r^s âŸ¹ log(f) = log(C) âˆ’ s·log(r)</p>
              <p className="text-xs text-purple-600">A tiny percentage of terms (stopwords) account for a massive fraction of all tokens. The top 50â€“100 words make up ~50% of any corpus.</p>
            </div>
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
              <p className="font-bold text-teal-800 mb-1">Heaps' Law</p>
              <p className="font-mono text-xs bg-white rounded p-2 text-teal-700 mb-2">|V| = k · N^Î²  (30 â‰¤ k â‰¤ 100, Î² â‰ˆ 0.4â€“0.6)</p>
              <p className="text-xs text-teal-600">Vocabulary continues growing with corpus size. The growth rate slows (sub-linear) but never truly plateaus for large natural language corpora.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'complexity',
      title: '6. Complexity Comparison Table',
      icon: Zap,
      content: (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-indigo-600 text-white">
                {['Retrieval Mechanism','Space Complexity','AND Search Time','Phrase Query'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Linear Scan (grep)','O(N·L) â€” No Index','O(N·L) â€” Full scan','Supported (regex)'],
                ['Term-Doc Incidence Matrix','O(|V|·N) â€” Very Sparse','O(N) â€” Bitwise AND','Unsupported'],
                ['Inverted Index (Standard)','O(|Postings|)','O(Lâ‚+Lâ‚‚) â€” Merge','Unsupported'],
                ['Positional Inverted Index','O(Total Tokens)','O(Lâ‚+Lâ‚‚) â€” Merge','âœ“ Supported'],
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-slate-700 border-b border-slate-100">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
  ];

  return (
    <motion.div key="theory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
      {/* Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15">Experiment 03</span>
          <span>â€¢</span><span>IR Foundations</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{EXP_CONFIG.title}</h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-3xl">{EXP_CONFIG.aim}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Inverted Index','Postings Lists','Boolean Retrieval','Phrase Queries','Porter Stemming','Zipf\'s Law'].map(t => (
            <span key={t} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-indigo-100">{t}</span>
          ))}
        </div>
      </div>

      {/* Objectives + Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>
            <h3 className="text-sm font-bold text-slate-900">Learning Objectives</h3>
          </div>
          <ul className="space-y-2.5">
            {EXP_CONFIG.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">{i + 1}</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
            <h3 className="text-sm font-bold text-slate-900">Prerequisites</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {[
              'Data Structures: Hash Tables, Arrays, Linked Lists, Binary Search Trees.',
              'Discrete Mathematics: Set operations (Intersection âˆ©, Union âˆª, Difference \\).',
              'Text Processing: Tokenization, Regular Expressions, String Normalization.',
              'Algorithmic Complexity: Big-O notation, Two-Pointer Merge Algorithms O(n+m).',
            ].map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">âœ“</span><span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Procedure Summary</p>
            <ol className="space-y-1 text-xs text-slate-500">
              {PROCEDURE_STEPS.slice(0, 6).map((step, i) => (
                <li key={i} className="flex gap-2"><span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span><span>{step}</span></li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Accordion Theory Sections */}
      <div className="space-y-2">
        {sections.map(sec => {
          const Icon = sec.icon;
          const isOpen = openSection === sec.id;
          return (
            <div key={sec.id} className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
              <button onClick={() => toggle(sec.id)} className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">{sec.title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100">{sec.content}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* References */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">References & Further Reading</h4>
        <div className="space-y-2">
          {REFERENCES.map((ref, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded px-2 py-0.5 shrink-0">[{i + 1}]</span>
              <div className="text-xs">
                <a href={ref.url} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-700 hover:text-indigo-900 underline underline-offset-2">{ref.title}</a>
                <span className="text-slate-500"> â€” {ref.authors}. {ref.publisher}.</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-1">
        <button onClick={onGoToLab} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer">
          <FlaskConical className="w-4 h-4" /><span>Proceed to Interactive Simulation Workbench</span>
        </button>
      </div>
    </motion.div>
  );
}

// â”€â”€ Simulation Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SimulationTab({ onRecordTrial, trials }) {
  const [corpusName, setCorpusName] = useState(Object.keys(BENCHMARK_CORPORA)[0]);
  const [customDocs, setCustomDocs] = useState({ 1: '', 2: '', 3: '' });
  const [useCustom, setUseCustom] = useState(false);
  const [opts, setOpts] = useState({ lowercase: true, removePunct: true, removeStopwords: true, useStemming: true });
  const [indexResult, setIndexResult] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [query, setQuery] = useState('information retrieval');
  const [queryMode, setQueryMode] = useState('AND');
  const [proximityK, setProximityK] = useState(3);
  const [queryResult, setQueryResult] = useState(null);
  const [showTrace, setShowTrace] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const activeCorpus = useMemo(() => {
    if (useCustom) {
      const filtered = {};
      Object.entries(customDocs).forEach(([k, v]) => { if (v.trim()) filtered[Number(k)] = v; });
      return filtered;
    }
    return BENCHMARK_CORPORA[corpusName];
  }, [useCustom, customDocs, corpusName]);

  const handleBuildIndex = useCallback(() => {
    setIsBuilding(true);
    setQueryResult(null);
    setActiveStage(null);
    setTimeout(() => {
      const result = buildInvertedIndex(activeCorpus, opts);
      setIndexResult(result);
      setIsBuilding(false);
    }, 300);
  }, [activeCorpus, opts]);

  const handleQuery = useCallback(() => {
    if (!indexResult) return;
    const idx = indexResult.index;
    const useStemming = opts.useStemming;
    let result = null;
    const terms = (query.match(/\b[a-zA-Z0-9_-]+\b/g) || []).filter(t => !['and','or','not','near'].includes(t.toLowerCase()));
    const t0 = performance.now();

    if (queryMode === 'AND') {
      if (terms.length < 2) {
        result = executeKeywordQuery(terms[0] || query, idx, useStemming);
        result.mode = 'Keyword';
      } else {
        const q1 = executeKeywordQuery(terms[0], idx, useStemming);
        const q2 = executeKeywordQuery(terms[1], idx, useStemming);
        const merged = booleanAndWithTrace(q1.docs, q2.docs, terms[0], terms[1]);
        let finalDocs = merged.result;
        const allTrace = [...(q1.trace || []), ...(q2.trace || []), ...merged.trace];
        for (let i = 2; i < terms.length; i++) {
          const qi = executeKeywordQuery(terms[i], idx, useStemming);
          const next = booleanAndWithTrace(finalDocs, qi.docs, 'prev_result', terms[i]);
          finalDocs = next.result;
          allTrace.push(...next.trace);
        }
        result = { mode: 'Boolean AND', docs: finalDocs, trace: allTrace, latencyUs: Math.round((performance.now() - t0) * 1000) };
      }
    } else if (queryMode === 'OR') {
      if (terms.length < 2) {
        result = executeKeywordQuery(terms[0] || query, idx, useStemming);
        result.mode = 'Keyword';
      } else {
        const q1 = executeKeywordQuery(terms[0], idx, useStemming);
        const q2 = executeKeywordQuery(terms[1], idx, useStemming);
        const merged = booleanOrWithTrace(q1.docs, q2.docs, terms[0], terms[1]);
        result = { mode: 'Boolean OR', docs: merged.result, trace: [...(q1.trace||[]), ...(q2.trace||[]), ...merged.trace], latencyUs: Math.round((performance.now() - t0) * 1000) };
      }
    } else if (queryMode === 'NOT') {
      const allDocs = Object.keys(activeCorpus).map(Number);
      const q1 = executeKeywordQuery(terms[0] || query, idx, useStemming);
      const excludeSet = new Set(q1.docs);
      const resultDocs = allDocs.filter(d => !excludeSet.has(d));
      result = { mode: 'Boolean NOT', docs: resultDocs, trace: [`NOT '${terms[0] || query}' ←’ excluding docs [${q1.docs.join(', ')}] from all docs [${allDocs.join(', ')}]`, `Result: [${resultDocs.join(', ')}]`], latencyUs: Math.round((performance.now() - t0) * 1000) };
    } else if (queryMode === 'PHRASE') {
      result = executePhraseQuery(query, idx, useStemming);
      result.mode = 'Phrase Query';
    } else if (queryMode === 'PROXIMITY') {
      const t = terms;
      result = executeProximityQuery(t[0] || 'information', t[1] || 'retrieval', proximityK, idx, useStemming);
      result.mode = `Proximity NEAR/${proximityK}`;
    } else {
      result = executeKeywordQuery(terms[0] || query, idx, useStemming);
      result.mode = 'Keyword';
    }
    setQueryResult(result);
    setShowTrace(false);
  }, [indexResult, query, queryMode, proximityK, opts.useStemming, activeCorpus]);

  const handleRecordTrial = () => {
    if (!indexResult || !queryResult) return;
    onRecordTrial({
      corpus: useCustom ? 'Custom' : corpusName.split(' ')[0],
      stopwords: opts.removeStopwords ? 'Yes' : 'No',
      stemming: opts.useStemming ? 'Yes' : 'No',
      vocabSize: indexResult.vocabSize,
      query: query,
      hits: queryResult.docs?.length ?? 0,
      timeUs: queryResult.latencyUs ?? 0,
    });
  };

  const sortedTerms = indexResult
    ? Object.entries(indexResult.index).sort((a, b) => b[1].cf - a[1].cf)
    : [];

  return (
    <motion.div key="lab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
      {/* Control Panel */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Filter className="w-4 h-4 text-indigo-500" />Index Configuration & Corpus Selection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Corpus */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Corpus</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {Object.keys(BENCHMARK_CORPORA).map(name => (
                <button key={name} onClick={() => { setCorpusName(name); setUseCustom(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${!useCustom && corpusName === name ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                  {name.split(' ')[0]}
                </button>
              ))}
              <button onClick={() => setUseCustom(true)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${useCustom ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                Custom
              </button>
            </div>
            {useCustom && (
              <div className="space-y-1.5">
                {[1, 2, 3].map(i => (
                  <textarea key={i} rows={2} value={customDocs[i]} onChange={e => setCustomDocs(p => ({ ...p, [i]: e.target.value }))}
                    placeholder={`Document ${i}...`}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                ))}
              </div>
            )}
          </div>
          {/* Preprocessing */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Preprocessing Pipeline</label>
            <div className="space-y-2">
              {[
                { key: 'lowercase', label: 'Case Folding (Lowercase)', desc: 'Normalize all characters to lowercase' },
                { key: 'removePunct', label: 'Punctuation Removal', desc: 'Strip non-alphanumeric characters' },
                { key: 'removeStopwords', label: 'Stopword Removal', desc: `Eliminate ${DEFAULT_STOPWORDS.size} common high-frequency terms` },
                { key: 'useStemming', label: 'Porter Stemming', desc: 'Reduce words to algorithmic stem bases' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`relative w-9 h-5 rounded-full transition-colors ${opts[key] ? 'bg-indigo-500' : 'bg-slate-200'}`} onClick={() => setOpts(p => ({ ...p, [key]: !p[key] }))}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${opts[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{label}</p>
                    <p className="text-[10px] text-slate-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleBuildIndex} disabled={isBuilding}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-60">
          {isBuilding ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Building Indexâ€¦</> : <><Play className="w-4 h-4 fill-current" />Construct Inverted Index</>}
        </button>
      </div>

      {/* Pipeline Stage Visualization */}
      {indexResult && (
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Layers className="w-4 h-4 text-violet-500" />4-Stage Construction Pipeline</h3>
            <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
              {[
                { id: 1, label: 'Tokenization', color: 'bg-indigo-500' },
                { id: 2, label: 'Triples', color: 'bg-violet-500' },
                { id: 3, label: 'Sort', color: 'bg-blue-500' },
                { id: 4, label: 'Postings', color: 'bg-teal-500' },
              ].map(s => (
                <button key={s.id} onClick={() => setActiveStage(prev => prev === s.id ? null : s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full cursor-pointer transition-all ${activeStage === s.id ? `${s.color} text-white shadow-sm` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{s.id}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Bar */}
          <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-violet-50/30 border-b border-slate-100 flex flex-wrap gap-4">
            {[
              { label: 'Vocabulary |V|', val: indexResult.vocabSize, color: 'text-indigo-700' },
              { label: 'Total Tokens', val: indexResult.totalTokens, color: 'text-violet-700' },
              { label: 'Total Postings', val: indexResult.totalPostings, color: 'text-blue-700' },
              { label: 'Sparsity', val: `${indexResult.sparsityPct}%`, color: 'text-teal-700' },
              { label: 'Index Time', val: `${indexResult.indexingTimeMs}ms`, color: 'text-slate-600' },
            ].map(m => (
              <div key={m.label} className="text-center">
                <p className={`text-base font-black ${m.color}`}>{m.val}</p>
                <p className="text-[10px] text-slate-500 font-medium">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Stage 1: Token Stream */}
          {activeStage === 1 && (
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500 font-medium">Token stream per document after preprocessing:</p>
              {Object.entries(indexResult.stage1Tokens).map(([docId, tokens]) => (
                <div key={docId} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-700 mb-2">Doc {docId}: <span className="text-slate-500 font-normal italic">{(useCustom ? customDocs : BENCHMARK_CORPORA[corpusName])[Number(docId)]?.slice(0, 70)}â€¦</span></p>
                  <div className="flex flex-wrap gap-1.5">
                    {tokens.map(({ term, pos, rawTok }, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-xs">
                        <span className="text-indigo-400 text-[9px]">[{pos}]</span>{term}
                        {rawTok.toLowerCase() !== term && <span className="text-slate-400 text-[9px]">←{rawTok}</span>}
                      </span>
                    ))}
                    {tokens.length === 0 && <span className="text-slate-400 text-xs italic">No tokens after preprocessing</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stage 2: Triples */}
          {activeStage === 2 && (
            <div className="p-5">
              <p className="text-xs text-slate-500 font-medium mb-3">First 30 (term, docId, pos) triples (raw, before sorting):</p>
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse w-full">
                  <thead><tr className="bg-violet-600 text-white"><th className="px-3 py-2">Term</th><th className="px-3 py-2">DocID</th><th className="px-3 py-2">Position</th><th className="px-3 py-2">Raw Token</th></tr></thead>
                  <tbody>
                    {indexResult.stage2Triples.slice(0, 30).map((t, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-3 py-1.5 font-mono text-violet-700 font-semibold">{t.term}</td>
                        <td className="px-3 py-1.5 text-center text-slate-700">Doc {t.docId}</td>
                        <td className="px-3 py-1.5 text-center text-slate-500">{t.pos}</td>
                        <td className="px-3 py-1.5 text-slate-500">{t.raw}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {indexResult.stage2Triples.length > 30 && <p className="text-xs text-slate-400 text-center py-2">â€¦{indexResult.stage2Triples.length - 30} more triples</p>}
              </div>
            </div>
          )}

          {/* Stage 3: Sorted */}
          {activeStage === 3 && (
            <div className="p-5">
              <p className="text-xs text-slate-500 font-medium mb-3">First 30 triples after lexicographic sort by (term, docId, pos):</p>
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse w-full">
                  <thead><tr className="bg-blue-600 text-white"><th className="px-3 py-2">Rank</th><th className="px-3 py-2">Term ←‘</th><th className="px-3 py-2">DocID ←‘</th><th className="px-3 py-2">Pos ←‘</th></tr></thead>
                  <tbody>
                    {indexResult.stage3Sorted.slice(0, 30).map((t, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-3 py-1.5 text-slate-400 text-center">{i + 1}</td>
                        <td className="px-3 py-1.5 font-mono text-blue-700 font-semibold">{t.term}</td>
                        <td className="px-3 py-1.5 text-center text-slate-700">Doc {t.docId}</td>
                        <td className="px-3 py-1.5 text-center text-slate-500">{t.pos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stage 4: Postings */}
          {activeStage === 4 && (
            <div className="p-5 space-y-2 max-h-72 overflow-y-auto">
              <p className="text-xs text-slate-500 font-medium mb-1">Inverted index â€” sorted by collection frequency (cf) descending:</p>
              {sortedTerms.slice(0, 20).map(([term, entry]) => (
                <div key={term} className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-600 text-white font-mono text-xs font-semibold shrink-0">
                    {term}
                    <span className="bg-white/20 px-1.5 rounded text-[10px]">df:{entry.df} cf:{entry.cf}</span>
                  </span>
                  <span className="text-slate-300 text-xs">←’</span>
                  {Object.entries(entry.postings).map(([docId, p]) => (
                    <span key={docId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-700 text-xs font-mono">
                      Doc{docId} <span className="text-teal-400">tf:{p.tf}</span>
                      <span className="text-[9px] text-slate-400">[{p.positions.join(',')}]</span>
                    </span>
                  ))}
                </div>
              ))}
              {sortedTerms.length > 20 && <p className="text-xs text-slate-400">â€¦{sortedTerms.length - 20} more terms</p>}
            </div>
          )}

          {/* Zipf distribution */}
          {!activeStage && (
            <div className="p-5">
              <p className="text-xs text-slate-500 font-medium mb-3 flex items-center gap-2"><BarChart2 className="w-3.5 h-3.5" />Term Frequency Distribution â€” Top 20 Terms (Zipf's Law)</p>
              <div className="space-y-1.5">
                {sortedTerms.slice(0, 20).map(([term, entry], i) => {
                  const maxCf = sortedTerms[0]?.[1].cf || 1;
                  const pct = (entry.cf / maxCf) * 100;
                  return (
                    <div key={term} className="flex items-center gap-2.5">
                      <span className="text-[10px] text-slate-400 w-4 text-right">{i + 1}</span>
                      <span className="font-mono text-xs text-indigo-700 w-20 truncate">{term}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500 w-10 text-right">cf:{entry.cf}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Query Console */}
      {indexResult && (
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Search className="w-4 h-4 text-violet-500" />Query Console</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {['AND','OR','NOT','PHRASE','PROXIMITY','KEYWORD'].map(m => (
                <button key={m} onClick={() => setQueryMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${queryMode === m ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                  {m}
                </button>
              ))}
            </div>

            {/* Mode description */}
            <AnimatePresence mode="wait">
              {{
                AND:       { icon: 'âˆ©', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', badge: 'bg-indigo-100 text-indigo-600', label: 'Boolean AND (Conjunction)', desc: 'Returns only documents containing ALL specified terms. Uses a two-pointer merge on sorted postings lists in O(Lâ‚ + Lâ‚‚) time. Enter space-separated terms (e.g. information retrieval).' },
                OR:        { icon: 'âˆª', color: 'bg-blue-50 border-blue-200 text-blue-800',     badge: 'bg-blue-100 text-blue-600',   label: 'Boolean OR (Disjunction)',  desc: 'Returns documents containing ANY of the specified terms. Merges all postings lists with a union sweep. Results are sorted by DocID.' },
                NOT:       { icon: 'Â¬', color: 'bg-amber-50 border-amber-200 text-amber-800',  badge: 'bg-amber-100 text-amber-700', label: 'Boolean NOT (Negation)',     desc: 'Returns all documents that do NOT contain the specified term. Computes the complement of the term\'s postings list against the full document set.' },
                PHRASE:    { icon: '""', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', badge: 'bg-emerald-100 text-emerald-700', label: 'Exact Phrase Query',  desc: 'Retrieves documents where the terms appear consecutively in exactly the given order. Requires a positional index â€” checks that pos(termâ‚‚) = pos(termâ‚) + 1 for each candidate doc.' },
                PROXIMITY: { icon: '←”', color: 'bg-violet-50 border-violet-200 text-violet-800', badge: 'bg-violet-100 text-violet-700', label: `Proximity Query (NEAR/k)`, desc: `Finds documents where two terms appear within k tokens of each other, in any order. Enter two space-separated terms. Adjust k= in the input field (currently k=${proximityK}).` },
                KEYWORD:   { icon: 'ðŸ”‘', color: 'bg-slate-50 border-slate-200 text-slate-700',  badge: 'bg-slate-100 text-slate-600',  label: 'Single Keyword Lookup',     desc: 'Direct dictionary lookup for a single term. Returns its document frequency (df), collection frequency (cf), and the full postings list with token positions.' },
              }[queryMode] && (
                <motion.div
                  key={queryMode}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-xs ${
                    { AND: 'bg-indigo-50 border-indigo-200', OR: 'bg-blue-50 border-blue-200', NOT: 'bg-amber-50 border-amber-200', PHRASE: 'bg-emerald-50 border-emerald-200', PROXIMITY: 'bg-violet-50 border-violet-200', KEYWORD: 'bg-slate-50 border-slate-200' }[queryMode]
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                    { AND: 'bg-indigo-100 text-indigo-600', OR: 'bg-blue-100 text-blue-600', NOT: 'bg-amber-100 text-amber-700', PHRASE: 'bg-emerald-100 text-emerald-700', PROXIMITY: 'bg-violet-100 text-violet-700', KEYWORD: 'bg-slate-100 text-slate-600' }[queryMode]
                  }`}>
                    {{ AND: 'âˆ©', OR: 'âˆª', NOT: 'Â¬', PHRASE: '""', PROXIMITY: '←”', KEYWORD: 'ðŸ”‘' }[queryMode]}
                  </span>
                  <div>
                    <p className={`font-bold mb-0.5 ${{ AND: 'text-indigo-800', OR: 'text-blue-800', NOT: 'text-amber-800', PHRASE: 'text-emerald-800', PROXIMITY: 'text-violet-800', KEYWORD: 'text-slate-700' }[queryMode]}`}>
                      {{ AND: 'Boolean AND â€” Conjunction', OR: 'Boolean OR â€” Disjunction', NOT: 'Boolean NOT â€” Negation', PHRASE: 'Exact Phrase Query', PROXIMITY: `Proximity Query â€” NEAR/${proximityK}`, KEYWORD: 'Single Keyword Lookup' }[queryMode]}
                    </p>
                    <p className={`leading-relaxed ${{ AND: 'text-indigo-700', OR: 'text-blue-700', NOT: 'text-amber-700', PHRASE: 'text-emerald-700', PROXIMITY: 'text-violet-700', KEYWORD: 'text-slate-600' }[queryMode]}`}>
                      {{ AND: 'Returns only documents containing ALL specified terms. Uses a two-pointer merge on sorted postings lists in O(Lâ‚ + Lâ‚‚) time. Enter space-separated terms â€” e.g. information retrieval.', OR: 'Returns documents containing ANY of the specified terms. Merges postings lists with a union sweep in O(Lâ‚ + Lâ‚‚). All matched DocIDs are returned sorted.', NOT: "Returns all documents that do NOT contain the specified term. Computes the complement of the term's postings list against the full document set.", PHRASE: 'Retrieves documents where terms appear consecutively in exactly the given order. Requires a positional index â€” verifies pos(termâ‚‚) = pos(termâ‚) + 1 for each candidate document.', PROXIMITY: `Finds documents where two terms appear within ${proximityK} token(s) of each other in any order. Enter two space-separated terms. Adjust the k= value on the right.`, KEYWORD: 'Direct O(1) dictionary lookup for a single term. Returns document frequency (df), collection frequency (cf), and the full postings list with exact token positions.' }[queryMode]}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-2">
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuery()}
                placeholder={queryMode === 'PHRASE' ? 'Enter phrase (e.g. information retrieval)' : queryMode === 'AND' ? 'term1 term2 term3' : 'Enter query...'}
                className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-200 text-slate-700" />
              {queryMode === 'PROXIMITY' && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">k=</label>
                  <input type="number" min={1} max={10} value={proximityK} onChange={e => setProximityK(Number(e.target.value))} className="w-14 text-sm border border-slate-200 rounded-lg px-2 py-2 text-center" />
                </div>
              )}
              <button onClick={handleQuery} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all">
                <Search className="w-3.5 h-3.5" />Search
              </button>
            </div>

            {queryResult && (
              <div className="space-y-3">
                {/* Results banner */}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${queryResult.docs?.length > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    {queryResult.docs?.length > 0 ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                    <span className="text-sm font-bold text-slate-800">
                      {queryResult.docs?.length > 0 ? `${queryResult.docs.length} document(s) matched` : 'No documents matched'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Mode: {queryResult.mode}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{queryResult.latencyUs}Âµs</span>
                </div>

                {/* Matched doc cards */}
                {queryResult.docs?.length > 0 && (
                  <div className="space-y-2">
                    {queryResult.docs.map(docId => {
                      const corpus = useCustom ? customDocs : BENCHMARK_CORPORA[corpusName];
                      return (
                        <div key={docId} className="p-3 rounded-xl bg-white border-l-4 border-emerald-400 border border-slate-200 shadow-sm">
                          <p className="text-xs font-bold text-emerald-700 mb-1">Document {docId}</p>
                          <p className="text-xs text-slate-600 leading-relaxed">{corpus[docId]}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pointer trace */}
                {queryResult.trace && (
                  <div>
                    <button onClick={() => setShowTrace(p => !p)} className="flex items-center gap-2 text-xs font-semibold text-violet-600 hover:text-violet-800 cursor-pointer transition-colors">
                      {showTrace ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {showTrace ? 'Hide' : 'Show'} Algorithm Pointer Trace ({queryResult.trace.length} steps)
                    </button>
                    {showTrace && (
                      <div className="mt-2 rounded-xl bg-slate-950 text-slate-200 p-4 font-mono text-xs space-y-1 max-h-52 overflow-y-auto">
                        {queryResult.trace.map((line, i) => (
                          <p key={i} className={`leading-relaxed ${line.includes('MATCH') ? 'text-emerald-400' : line.includes('Advance') ? 'text-amber-300' : 'text-slate-300'}`}>
                            <span className="text-slate-500">{String(i).padStart(2, '0')}: </span>{line}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Record button */}
                <button onClick={handleRecordTrial} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer shadow-sm transition-all">
                  <Hash className="w-3.5 h-3.5" />Record Trial to Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!indexResult && (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-violet-50/40 border border-indigo-100 text-center">
          <Database className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Select a corpus and click <strong>Construct Inverted Index</strong> to begin.</p>
          <p className="text-xs text-slate-400 mt-1">The 4-stage pipeline will be visualized step by step.</p>
        </div>
      )}
    </motion.div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN EXPERIMENT 3 COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function Experiment3({ onBack }) {
  const [activeTab, setActiveTab]   = useState('theory');
  const [trials, setTrials]         = useState([]);
  const [quizScore, setQuizScore]   = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: '', studentId: '', institution: 'VESIT â€“ Dept. of Computer Engineering',
    instructor: 'Dr. Sharmila Sengupta / Mrs. Abha Tewari / Mrs. Sunita Suralkar',
  });

  const handleInfoChange = (key, value) =>
    setStudentInfo(prev => ({ ...prev, [key]: value }));

  const handleScoreUpdate = (score) => setQuizScore(score);

  const goTo = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabs = [
    { id: 'theory',      label: 'Theory',        short: 'Theory', icon: BookOpen,     color: 'indigo' },
    { id: 'lab',         label: 'Simulation Lab', short: 'Lab',    icon: FlaskConical, color: 'violet' },
    { id: 'quiz',        label: 'Quiz',           short: 'Quiz',   icon: HelpCircle,   color: 'rose'   },
    { id: 'certificate', label: 'Certificate',    short: 'Cert.',  icon: Award,        color: 'amber'  },
    { id: 'report',      label: 'Report',         short: 'Report', icon: FileText,     color: 'teal'   },
  ];

  const TAB_ACTIVE = {
    indigo: 'bg-indigo-600 text-white shadow-indigo-200',
    violet: 'bg-violet-600 text-white shadow-violet-200',
    rose:   'bg-rose-500 text-white shadow-rose-200',
    amber:  'bg-amber-500 text-white shadow-amber-200',
    teal:   'bg-teal-600 text-white shadow-teal-200',
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <ExperimentNavbar
        title="Exp 03: Construction of an Inverted Index"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={goTo}
        onBack={onBack}
        quizScore={quizScore}
        totalQuestions={QUIZ_QUESTIONS.length}
        tabActiveStyles={TAB_ACTIVE}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'theory' && (
            <motion.div key="theory" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration: 0.22 }}>
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <TheoryTab onGoToLab={() => goTo('lab')} />
              </div>
            </motion.div>
          )}
          {activeTab === 'lab' && (
            <motion.div key="lab" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration: 0.22 }}>
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <SimulationTab onRecordTrial={(t) => setTrials(prev => [...prev, t])} trials={trials} />
              </div>
            </motion.div>
          )}
          {activeTab === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration: 0.22 }}>
              <QuizSection onNext={() => goTo('certificate')} onScoreUpdate={handleScoreUpdate} />
            </motion.div>
          )}
          {activeTab === 'certificate' && (
            <motion.div key="certificate" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration: 0.22 }}>
              <CertificateSection
                quizScore={quizScore}
                totalQuestions={QUIZ_QUESTIONS.length}
                studentInfo={studentInfo}
                onInfoChange={handleInfoChange}
                onNext={() => goTo('report')}
              />
            </motion.div>
          )}
          {activeTab === 'report' && (
            <motion.div key="report" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration: 0.22 }}>
              <ReportSection
                quizScore={quizScore}
                totalQuestions={QUIZ_QUESTIONS.length}
                studentInfo={studentInfo}
                trials={trials}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="glass border-t border-white/60 py-4 text-center text-xs text-slate-400 no-print flex flex-col sm:flex-row items-center justify-center gap-2">
        <div>
          <span className="font-semibold text-slate-600">Construction of an Inverted Index</span>
          <span className="mx-2">·</span>
          <span className="font-mono">CS-KGIRS-03 · Lab Module 03</span>
        </div>
        <span className="hidden sm:inline">·</span>
        <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline underline-offset-2">
          ← Return to 15 Experiments Portal
        </button>
      </footer>
    </div>
  );
}
