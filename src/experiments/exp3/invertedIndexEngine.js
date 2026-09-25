/**
 * Inverted Index Engine — JavaScript port of EXP3.py algorithms
 * Implements: tokenization, Porter stemming, boolean queries, phrase/proximity search
 */

// ────────────────────────────────────────────────────────────────────
// Default Stopwords
// ────────────────────────────────────────────────────────────────────
export const DEFAULT_STOPWORDS = new Set([
  'a','about','above','after','again','against','all','am','an','and',
  'any','are','as','at','be','because','been','before','being','below',
  'between','both','but','by','could','did','do','does','doing','down',
  'during','each','few','for','from','further','had','has','have','having',
  'he','her','here','hers','herself','him','himself','his','how','i',
  'if','in','into','is','it','its','itself','just','me','more','most',
  'my','myself','no','nor','not','now','of','off','on','once','only',
  'or','other','our','ours','ourselves','out','over','own','s','same',
  'she','should','so','some','such','t','than','that','the','their',
  'theirs','them','themselves','then','there','these','they','this','those',
  'through','to','too','under','until','up','very','was','we','were',
  'what','when','where','which','while','who','whom','why','with','would',
  'you','your','yours','yourself','yourselves'
]);

// ────────────────────────────────────────────────────────────────────
// Porter-Style Stemmer (rule-based, matches EXP3.py pure_porter_stem)
// ────────────────────────────────────────────────────────────────────
export function porterStem(word) {
  word = word.toLowerCase();
  if (word.length <= 2) return word;

  // Step 1a: plurals / past participles
  if (word.endsWith('sses')) word = word.slice(0, -2);
  else if (word.endsWith('ies')) word = word.slice(0, -2);
  else if (word.endsWith('ss')) { /* no-op */ }
  else if (word.endsWith('s')) word = word.slice(0, -1);

  // Step 1b: -ed, -ing
  if (word.endsWith('eed')) {
    if (word.length > 4) word = word.slice(0, -1);
  } else if (word.endsWith('ed') && word.length > 4) {
    word = word.slice(0, -2);
  } else if (word.endsWith('ing') && word.length > 5) {
    word = word.slice(0, -3);
  }

  // Step 2: suffix replacements
  const suffixes = [
    ['ational','ate'],['tional','tion'],['ization','ize'],
    ['ation','ate'],['izer','ize'],['ness',''],['ment',''],
    ['able',''],['ible',''],['ful',''],['ity','']
  ];
  for (const [suf, rep] of suffixes) {
    if (word.endsWith(suf) && (word.length - suf.length) >= 3) {
      word = word.slice(0, -suf.length) + rep;
      break;
    }
  }
  return word;
}

export const purePorterStem = porterStem;

// ────────────────────────────────────────────────────────────────────
// Preprocess a single document
// Returns: [{term, pos, rawTok}]
// ────────────────────────────────────────────────────────────────────
export function preprocessDocument(text, opts = {}) {
  const {
    lowercase = true,
    removePunct = true,
    removeStopwords = true,
    useStemming = true,
    stopwords = DEFAULT_STOPWORDS
  } = opts;

  const rawTokens = (text.match(/\b[a-zA-Z0-9_-]+\b/g) || []);
  const processed = [];

  rawTokens.forEach((rawTok, pos) => {
    let tok = lowercase ? rawTok.toLowerCase() : rawTok;
    if (removePunct) tok = tok.replace(/[^\w]/g, '');
    if (!tok) return;
    if (removeStopwords && stopwords.has(tok.toLowerCase())) return;
    const term = useStemming ? porterStem(tok) : tok;
    if (term) processed.push({ term, pos, rawTok });
  });

  return processed;
}

// ────────────────────────────────────────────────────────────────────
// Build Inverted Index — 4-stage pipeline
// ────────────────────────────────────────────────────────────────────
export function buildInvertedIndex(corpus, opts = {}) {
  const t0 = performance.now();

  const stage1Tokens = {};
  const stage2Triples = [];
  let totalTokensCount = 0;

  const sortedDocIds = Object.keys(corpus).map(Number).sort((a, b) => a - b);

  for (const docId of sortedDocIds) {
    const text = corpus[docId];
    const docTokens = preprocessDocument(text, opts);
    stage1Tokens[docId] = docTokens;
    totalTokensCount += docTokens.length;
    docTokens.forEach(({ term, pos, rawTok }) => {
      stage2Triples.push({ term, docId, pos, raw: rawTok });
    });
  }

  // Stage 3: lexicographic sort
  const stage3Sorted = [...stage2Triples].sort((a, b) => {
    if (a.term < b.term) return -1;
    if (a.term > b.term) return 1;
    if (a.docId < b.docId) return -1;
    if (a.docId > b.docId) return 1;
    return a.pos - b.pos;
  });

  // Stage 4: postings aggregation
  const indexDict = {};
  for (const item of stage3Sorted) {
    const { term, docId, pos } = item;
    if (!indexDict[term]) indexDict[term] = { df: 0, cf: 0, postings: {} };
    const entry = indexDict[term];
    entry.cf += 1;
    if (!entry.postings[docId]) {
      entry.postings[docId] = { tf: 0, positions: [] };
      entry.df += 1;
    }
    entry.postings[docId].tf += 1;
    entry.postings[docId].positions.push(pos);
  }

  const t1 = performance.now();
  const vocabSize = Object.keys(indexDict).length;
  const totalPostings = Object.values(indexDict).reduce((s, v) => s + Object.keys(v.postings).length, 0);
  const numDocs = sortedDocIds.length;
  const sparsityPct = Math.round((1.0 - totalPostings / Math.max(1, vocabSize * numDocs)) * 10000) / 100;

  return {
    stage1Tokens,
    stage2Triples,
    stage3Sorted,
    index: indexDict,
    vocabSize,
    totalTokens: totalTokensCount,
    totalPostings,
    sparsityPct,
    numDocs,
    indexingTimeMs: Math.round((t1 - t0) * 100) / 100
  };
}

// ────────────────────────────────────────────────────────────────────
// Keyword Query
// ────────────────────────────────────────────────────────────────────
export function executeKeywordQuery(term, index, useStemming = true) {
  const t0 = performance.now();
  const cleanTerm = useStemming ? porterStem(term.trim().toLowerCase()) : term.trim().toLowerCase();
  if (index[cleanTerm]) {
    const entry = index[cleanTerm];
    const docIds = Object.keys(entry.postings).map(Number).sort((a, b) => a - b);
    return {
      term: cleanTerm,
      found: true,
      df: entry.df,
      cf: entry.cf,
      docs: docIds,
      postings: entry.postings,
      latencyUs: Math.round((performance.now() - t0) * 1000),
      trace: [`Direct dictionary lookup for term '${cleanTerm}' → Matched ${docIds.length} documents: [${docIds.join(', ')}]`]
    };
  }
  return {
    term: cleanTerm, found: false, df: 0, cf: 0, docs: [], postings: {},
    latencyUs: Math.round((performance.now() - t0) * 1000),
    trace: [`Term '${cleanTerm}' not present in vocabulary.`]
  };
}

// ────────────────────────────────────────────────────────────────────
// Boolean AND (two-pointer intersection with trace)
// ────────────────────────────────────────────────────────────────────
export function booleanAndWithTrace(list1, list2, term1, term2) {
  let p1 = 0, p2 = 0;
  const res = [], trace = [];
  let comparisons = 0;
  trace.push(`Starting Conjunctive (AND) Intersection: '${term1}' (L1=${list1.length}) AND '${term2}' (L2=${list2.length})`);

  while (p1 < list1.length && p2 < list2.length) {
    comparisons++;
    const d1 = list1[p1], d2 = list2[p2];
    if (d1 === d2) {
      res.push(d1);
      trace.push(`Step ${comparisons}: p1=${p1} (Doc ${d1}) == p2=${p2} (Doc ${d2}) → MATCH! Added Doc ${d1}. Both pointers advanced.`);
      p1++; p2++;
    } else if (d1 < d2) {
      trace.push(`Step ${comparisons}: p1=${p1} (Doc ${d1}) < p2=${p2} (Doc ${d2}) → Advance p1.`);
      p1++;
    } else {
      trace.push(`Step ${comparisons}: p1=${p1} (Doc ${d1}) > p2=${p2} (Doc ${d2}) → Advance p2.`);
      p2++;
    }
  }
  trace.push(`Intersection complete in ${comparisons} comparisons. Resulting DocIDs: [${res.join(', ')}]`);
  return { result: res, trace, comparisons };
}

// ────────────────────────────────────────────────────────────────────
// Boolean OR (two-pointer union with trace)
// ────────────────────────────────────────────────────────────────────
export function booleanOrWithTrace(list1, list2, term1, term2) {
  let p1 = 0, p2 = 0;
  const res = [], trace = [];
  let comparisons = 0;
  trace.push(`Starting Disjunctive (OR) Union: '${term1}' (L1=${list1.length}) OR '${term2}' (L2=${list2.length})`);

  while (p1 < list1.length && p2 < list2.length) {
    comparisons++;
    const d1 = list1[p1], d2 = list2[p2];
    if (d1 === d2) {
      res.push(d1);
      trace.push(`Step ${comparisons}: Doc ${d1} in both lists → Added. Both pointers advanced.`);
      p1++; p2++;
    } else if (d1 < d2) {
      res.push(d1);
      trace.push(`Step ${comparisons}: Doc ${d1} < Doc ${d2} → Added Doc ${d1}. Advance p1.`);
      p1++;
    } else {
      res.push(d2);
      trace.push(`Step ${comparisons}: Doc ${d2} < Doc ${d1} → Added Doc ${d2}. Advance p2.`);
      p2++;
    }
  }
  while (p1 < list1.length) { res.push(list1[p1]); p1++; }
  while (p2 < list2.length) { res.push(list2[p2]); p2++; }
  trace.push(`Union complete in ${comparisons} comparisons. Resulting DocIDs: [${res.join(', ')}]`);
  return { result: res, trace, comparisons };
}

// ────────────────────────────────────────────────────────────────────
// Phrase Query (positional posting intersection)
// ────────────────────────────────────────────────────────────────────
export function executePhraseQuery(phrase, index, useStemming = true) {
  const t0 = performance.now();
  const tokens = (phrase.toLowerCase().match(/\b[a-zA-Z0-9_-]+\b/g) || []);
  if (!tokens.length) return { phrase, docs: [], trace: ['Empty phrase.'], latencyUs: 0 };

  const procTerms = tokens.map(t => useStemming ? porterStem(t) : t);
  const trace = [`Evaluating phrase query: '${tokens.join(' ')}' → Processed terms: [${procTerms.join(', ')}]`];

  for (const term of procTerms) {
    if (!index[term]) {
      trace.push(`Term '${term}' not in index. Phrase cannot match.`);
      return { phrase, terms: procTerms, docs: [], matchesByDoc: {}, trace, latencyUs: Math.round((performance.now() - t0) * 1000) };
    }
  }

  let candidateDocs = new Set(Object.keys(index[procTerms[0]].postings).map(Number));
  for (const term of procTerms.slice(1)) {
    const termDocs = new Set(Object.keys(index[term].postings).map(Number));
    candidateDocs = new Set([...candidateDocs].filter(d => termDocs.has(d)));
  }

  const sortedCandidates = [...candidateDocs].sort((a, b) => a - b);
  trace.push(`Candidate documents containing all phrase terms: [${sortedCandidates.join(', ')}]`);

  const matchingDocs = [], matchesByDoc = {};
  for (const docId of sortedCandidates) {
    const posLists = procTerms.map(t => index[t].postings[docId].positions);
    const matchedOffsets = [];
    for (const startPos of posLists[0]) {
      let matched = true;
      for (let offset = 1; offset < posLists.length; offset++) {
        if (!posLists[offset].includes(startPos + offset)) { matched = false; break; }
      }
      if (matched) matchedOffsets.push(procTerms.map((_, i) => startPos + i));
    }
    if (matchedOffsets.length) {
      matchingDocs.push(docId);
      matchesByDoc[docId] = matchedOffsets;
      trace.push(`Doc ${docId}: Exact phrase match at token positions ${JSON.stringify(matchedOffsets)}`);
    } else {
      trace.push(`Doc ${docId}: All terms present, but adjacency condition failed.`);
    }
  }
  return { phrase, terms: procTerms, docs: matchingDocs, matchesByDoc, trace, latencyUs: Math.round((performance.now() - t0) * 1000) };
}

// ────────────────────────────────────────────────────────────────────
// Proximity Query (term1 NEAR/k term2)
// ────────────────────────────────────────────────────────────────────
export function executeProximityQuery(term1, term2, maxDist, index, useStemming = true) {
  const t0 = performance.now();
  const t1 = useStemming ? porterStem(term1.toLowerCase()) : term1.toLowerCase();
  const t2 = useStemming ? porterStem(term2.toLowerCase()) : term2.toLowerCase();
  const trace = [`Proximity Search: '${term1}' NEAR/${maxDist} '${term2}' → processed: '${t1}' NEAR/${maxDist} '${t2}'`];

  if (!index[t1] || !index[t2]) {
    const missing = [t1, t2].filter(t => !index[t]);
    trace.push(`Terms [${missing.join(', ')}] not in index.`);
    return { docs: [], matchesByDoc: {}, trace, latencyUs: Math.round((performance.now() - t0) * 1000) };
  }

  const docs1 = new Set(Object.keys(index[t1].postings).map(Number));
  const docs2 = new Set(Object.keys(index[t2].postings).map(Number));
  const commonDocs = [...docs1].filter(d => docs2.has(d)).sort((a, b) => a - b);

  const matchingDocs = [], matchesByDoc = {};
  for (const docId of commonDocs) {
    const p1List = index[t1].postings[docId].positions;
    const p2List = index[t2].postings[docId].positions;
    const pairs = [];
    for (const pos1 of p1List) {
      for (const pos2 of p2List) {
        const dist = Math.abs(pos1 - pos2);
        if (dist > 0 && dist <= maxDist) pairs.push([pos1, pos2, dist]);
      }
    }
    if (pairs.length) {
      matchingDocs.push(docId);
      matchesByDoc[docId] = pairs;
      trace.push(`Doc ${docId}: Proximity match at positions ${JSON.stringify(pairs)}`);
    }
  }
  return { docs: matchingDocs, matchesByDoc, trace, latencyUs: Math.round((performance.now() - t0) * 1000) };
}
