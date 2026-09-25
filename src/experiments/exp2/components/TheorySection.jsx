import { ExperimentContributors } from '../../../components/common';
import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Sparkles, CheckCircle2, Sliders, ArrowRight,
  Split, Filter, Layers, FileText, ExternalLink, HelpCircle
} from 'lucide-react';

export default function TheorySection({ onGoToLab }) {
  const objectives = [
    'Understand the sequential pipeline of textual normalization from raw string to standardized tokens.',
    'Analyze boundary detection algorithms in tokenization and regular expression noise stripping.',
    'Evaluate stop-word filtering based on term-frequency distributions (Zipf\'s Law and the Pareto 80/20 Distribution).',
    'Contrast rule-based suffix truncation (Porter Stemmer) with morphological lexicon lookup (WordNet Lemmatizer).'
  ];

  const comparisonMatrix = [
    { feature: 'Algorithmic Approach', stemmer: 'Heuristic Suffix Truncation Rules', lemmatizer: 'Morphological & Lexical Analysis' },
    { feature: 'Output Quality', stemmer: 'May produce non-words (e.g., "studi")', lemmatizer: 'Always valid canonical dictionary words' },
    { feature: 'Execution Speed', stemmer: 'Extremely Fast (O(1) string slicing)', lemmatizer: 'Slower (Dictionary hash table lookup)' },
    { feature: 'Language Dictionary', stemmer: 'Not Required (self-contained rules)', lemmatizer: 'Required (WordNet Lexical Database)' },
    { feature: 'POS Tag Dependency', stemmer: 'Independent of context', lemmatizer: 'Highly Dependent on Part-of-Speech tags' },
    { feature: 'Example: "studies"', stemmer: 'studi', lemmatizer: 'study (Noun or Verb)' },
    { feature: 'Example: "better"', stemmer: 'better (no matching suffix rule)', lemmatizer: 'good (with POS=\'a\' Adjective)' },
    { feature: 'Example: "mice"', stemmer: 'mice (fails irregular plural rule)', lemmatizer: 'mouse (Noun irregular plural)' },
    { feature: 'Example: "meeting"', stemmer: 'meet (chops -ing)', lemmatizer: 'meeting (Noun) or meet (Verb with POS=\'v\')' }
  ];

  const procedureSteps = [
    'Step 1: Review the theoretical background, learning objectives, and comparison matrix.',
    'Step 2: Navigate to the Simulation Lab tab in the experiment navigation bar.',
    'Step 3: Select a benchmark sample dataset (General, Technical, Irregular Forms) or author custom raw text.',
    'Step 4: Configure pipeline transformation switches (Case Folding, Noise Stripping, Stop-words, POS Lemmatization).',
    'Step 5: Run the pipeline to observe dynamic step-by-step token flow, volume reduction metrics, and Stem vs Lemma duel.',
    'Step 6: Click "Record Current Trial" to capture experimental parameters and token statistics into your session log book.',
    'Step 7: Complete the 10-question concept assessment Quiz, review feedback, and generate your verified completion certificate and PDF lab report.'
  ];

  const keyTerms = [
    { term: 'Case Folding', def: 'Converting all alphabetical characters to uniform lowercase to merge lexical variants (e.g., "Apple" and "apple" become "apple").' },
    { term: 'Tokenization', def: 'Segmenting an unstructured stream of characters into discrete linguistic units (words, punctuation, or symbols) based on whitespace and regex boundaries.' },
    { term: 'Stop-Words', def: 'High-frequency grammatical function words (e.g., "is", "the", "at", "which") carrying minimal semantic discrimination power in search and classification.' },
    { term: 'Stemming', def: 'Heuristic, rule-based suffix truncation (such as the Porter Stemmer) that chops word endings to derive a common base stem.' },
    { term: 'Lemmatization', def: 'Morphological dictionary analysis using lexical databases (WordNet) and Part-of-Speech tags to return canonical base dictionary headwords (lemmas).' },
    { term: 'Over-Stemming', def: 'When distinct words with unrelated conceptual meanings are inappropriately truncated to the same stem (e.g., "universe" and "university" both stemming to "univers").' },
    { term: 'Under-Stemming', def: 'When words sharing a common conceptual root fail to be reduced to the same stem (e.g., "knavish" and "knave").' }
  ];

  const references = [
    { authors: 'Jurafsky, D., & Martin, J. H. (2023)', title: 'Speech and Language Processing (3rd ed. draft)', note: 'Chapter 2: Regular Expressions, Text Normalization, and Edit Distance. Pearson Education.' },
    { authors: 'Manning, C. D., Raghavan, P., & Schütze, H. (2008)', title: 'Introduction to Information Retrieval', note: 'Chapter 2: The term vocabulary and postings lists. Cambridge University Press.' },
    { authors: 'Porter, M. F. (1980)', title: 'An algorithm for suffix stripping', note: 'Program: electronic library and information systems, 14(3), 130–137.' },
    { authors: 'Miller, G. A. (1995)', title: 'WordNet: a lexical database for English', note: 'Communications of the ACM, 38(11), 39–41.' },
    { authors: 'Bird, S., Loper, E., & Klein, E. (2009)', title: 'Natural Language Processing with Python', note: 'Analyzing Text with the Natural Language Toolkit. O\'Reilly Media.' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* ── Hero Banner ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm relative overflow-hidden space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          Experiment 2 &bull; Foundations of Information Retrieval
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Text Preprocessing &amp; Token Normalization Pipeline
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          Clean, tokenize, filter, stem, and lemmatize unstructured textual documents using foundational NLP algorithms to transform noisy human language into standardized, discrete token streams ready for search indexing and vectorization.
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

      {/* ── Learning Objectives ── */}
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

      {/* ── Comprehensive Theoretical Framework ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-violet-600 rounded-full" />
          Comprehensive Theoretical Framework
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Text preprocessing is the indispensable first phase in Information Retrieval (IR) and Natural Language Processing (NLP). Real-world raw texts (web crawls, social posts, PDFs, chat transcripts) are rife with typography noise, capitalization discrepancies, contractions, and morphological inflections. Preprocessing eliminates redundancy and standardizes tokens, drastically shrinking vocabulary space and accelerating index queries.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Card 1: Case Folding & Cleaning */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-xs">1</span>
              Case Folding &amp; Noise Stripping
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Case Folding</strong> normalizes all uppercase characters into lowercase. This merges variants like <em>&quot;Apple&quot;</em>, <em>&quot;APPLE&quot;</em>, and <em>&quot;apple&quot;</em> into a single vocabulary entry.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Noise Removal</strong> uses Regular Expressions (Regex like <code className="font-mono bg-slate-100 px-1 rounded">[^a-zA-Z\s]</code>) to strip HTML tags, punctuation, emojis, and uninformative numeric digits.
            </p>
          </div>

          {/* Card 2: Tokenization */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center text-xs">2</span>
              Tokenization &amp; Boundary Detection
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tokenization splits continuous character sequences into atomic linguistic units called <strong>tokens</strong>.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sophisticated tokenizers handle tricky linguistic boundaries such as English contractions (<em>&quot;don&apos;t&quot;</em> &rarr; <em>&quot;do&quot;</em> + <em>&quot;n&apos;t&quot;</em>), hyphenated compound nouns, and punctuation embedded inside URLs or emails.
            </p>
          </div>

          {/* Card 3: Stop-Word Removal & Pareto */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-xs">3</span>
              Stop-Words &amp; The Pareto Distribution
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stop-words are extremely frequent grammatical function words (<em>&quot;the&quot;, &quot;is&quot;, &quot;at&quot;, &quot;which&quot;</em>).
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              According to the <strong>Pareto Principle (80/20 Rule)</strong> and <strong>Zipf&apos;s Law</strong>, a tiny minority of unique words account for the overwhelming majority of total word occurrences, yet carry virtually zero topical discrimination. Filtering them slashes inverted index size by 30–40% without sacrificing recall.
            </p>
          </div>

          {/* Card 4: Stemming vs Lemmatization */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-xs">4</span>
              Stemming vs. Lemmatization
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Stemming (Porter):</strong> Chops off morphological affixes using rigid heuristic rules (e.g., <em>&quot;studies&quot;</em> &rarr; <em>&quot;studi&quot;</em>). Blazing fast, but often creates non-dictionary strings.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Lemmatization (WordNet):</strong> Uses full lexical dictionary lookup and Part-of-Speech context to return canonical base lemmas (e.g., <em>&quot;studies&quot;</em> &rarr; <em>&quot;study&quot;</em>, <em>&quot;better&quot;</em> &rarr; <em>&quot;good&quot;</em>).
            </p>
          </div>
        </div>
      </div>

      {/* ── Stemming vs. Lemmatization Comparison Table ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-teal-600 rounded-full" />
          Comparison Matrix: Porter Stemmer vs. WordNet Lemmatizer
        </h2>
        <p className="text-xs text-slate-500">
          Side-by-side architectural and practical trade-off analysis between heuristic suffix truncation and lexical morphological lookup.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Feature Parameter</th>
                <th className="p-3.5 text-amber-700 font-mono">Porter Stemmer</th>
                <th className="p-3.5 text-emerald-700 font-mono">WordNet Lemmatizer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-bold text-slate-800">{row.feature}</td>
                  <td className="p-3.5 text-slate-600 font-mono">{row.stemmer}</td>
                  <td className="p-3.5 text-slate-800 font-mono font-semibold">{row.lemmatizer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Experimental Procedure ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-600 rounded-full" />
          7-Step Experimental Procedure
        </h2>
        <div className="space-y-2.5 pt-1">
          {procedureSteps.map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3 text-xs sm:text-sm text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Key Terminology Reference ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-purple-600 rounded-full" />
          Key Terminology &amp; Variable Reference
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {keyTerms.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <h4 className="text-xs font-bold text-indigo-700 font-mono">{item.term}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.def}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── References & Academic Literature ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-slate-600 rounded-full" />
          References &amp; Academic Literature
        </h2>
        <div className="space-y-3 pt-1">
          {references.map((ref, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-xs space-y-0.5">
              <p className="font-bold text-slate-800">{idx + 1}. {ref.authors}</p>
              <p className="font-semibold text-indigo-700 italic">&ldquo;{ref.title}&rdquo;</p>
              <p className="text-slate-500 font-sans">{ref.note}</p>
            </div>
          ))}
        </div>
      </div>
    
      {/* ── Experiment Contributors ── */}
      <ExperimentContributors expNumber={2} />
    </div>
  );
}
