/**
 * Text Preprocessing & Token Normalization Engine
 * Client-side implementation of NLP normalization pipeline from app.py:
 * - Case Folding
 * - Regex Noise & Number Stripping
 * - NLTK English Stopwords Filtering
 * - Porter Stemming (rule-based)
 * - WordNet-Style Lemmatization with POS Tagging
 */

// ── 1. Standard NLTK English Stopwords (179 words) ───────────────────────────
export const NLTK_ENGLISH_STOPWORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're",
  "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he',
  'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's",
  'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
  'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do',
  'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because',
  'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against',
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
  'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
  'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't',
  'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll',
  'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't",
  'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't",
  'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn',
  "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't",
  'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"
]);

// ── 2. Porter Stemmer (Rule-Based Algorithm) ─────────────────────────────────
export function porterStem(word) {
  if (!word || typeof word !== 'string') return '';
  word = word.toLowerCase();
  if (word.length <= 2) return word;

  // Step 1a: plurals and past participles
  if (word.endsWith('sses')) word = word.slice(0, -2);
  else if (word.endsWith('ies')) word = word.slice(0, -2);
  else if (word.endsWith('ss')) { /* keep ss */ }
  else if (word.endsWith('s') && !word.endsWith('us') && !word.endsWith('is')) {
    word = word.slice(0, -1);
  }

  // Step 1b: -eed, -ed, -ing
  if (word.endsWith('eed')) {
    if (word.length > 4) word = word.slice(0, -1);
  } else if (word.endsWith('ed') && word.length > 4) {
    word = word.slice(0, -2);
    if (word.endsWith('at') || word.endsWith('bl') || word.endsWith('iz')) word += 'e';
    else if (word.length > 2 && word[word.length - 1] === word[word.length - 2] && !['l', 's', 'z'].includes(word[word.length - 1])) {
      word = word.slice(0, -1);
    }
  } else if (word.endsWith('ing') && word.length > 5) {
    word = word.slice(0, -3);
    if (word.endsWith('at') || word.endsWith('bl') || word.endsWith('iz')) word += 'e';
    else if (word.length > 2 && word[word.length - 1] === word[word.length - 2] && !['l', 's', 'z'].includes(word[word.length - 1])) {
      word = word.slice(0, -1);
    }
  }

  // Step 1c: y -> i
  if (word.endsWith('y') && word.length > 2 && !/[aeiou]/.test(word[word.length - 2])) {
    word = word.slice(0, -1) + 'i';
  }

  // Step 2: suffix stripping
  const step2Suffixes = [
    ['ational', 'ate'], ['tional', 'tion'], ['enci', 'ence'], ['anci', 'ance'],
    ['izer', 'ize'], ['abli', 'able'], ['alli', 'al'], ['entli', 'ent'],
    ['eli', 'e'], ['ousli', 'ous'], ['ization', 'ize'], ['ation', 'ate'],
    ['ator', 'ate'], ['alism', 'al'], ['iveness', 'ive'], ['fulness', 'ful'],
    ['ousness', 'ous'], ['aliti', 'al'], ['iviti', 'ive'], ['biliti', 'ble']
  ];
  for (const [suf, rep] of step2Suffixes) {
    if (word.endsWith(suf) && (word.length - suf.length) >= 3) {
      word = word.slice(0, -suf.length) + rep;
      break;
    }
  }

  // Step 3
  const step3Suffixes = [
    ['icate', 'ic'], ['ative', ''], ['alize', 'al'], ['iciti', 'ic'],
    ['ical', 'ic'], ['ful', ''], ['ness', '']
  ];
  for (const [suf, rep] of step3Suffixes) {
    if (word.endsWith(suf) && (word.length - suf.length) >= 3) {
      word = word.slice(0, -suf.length) + rep;
      break;
    }
  }

  // Step 4
  const step4Suffixes = [
    'al', 'ance', 'ence', 'er', 'ic', 'able', 'ible', 'ant', 'ement',
    'ment', 'ent', 'ou', 'ism', 'ate', 'iti', 'ous', 'ive', 'ize'
  ];
  for (const suf of step4Suffixes) {
    if (word.endsWith(suf) && (word.length - suf.length) >= 4) {
      word = word.slice(0, -suf.length);
      break;
    }
  }

  return word;
}

// ── 3. WordNet Irregular Morphological Lemma Dictionary ───────────────────────
const WORDNET_IRREGULARS = {
  // Nouns (Plural -> Singular)
  'mice': { lemma: 'mouse', pos: 'n' },
  'foxes': { lemma: 'fox', pos: 'n' },
  'dogs': { lemma: 'dog', pos: 'n' },
  'cats': { lemma: 'cat', pos: 'n' },
  'algorithms': { lemma: 'algorithm', pos: 'n' },
  'datasets': { lemma: 'dataset', pos: 'n' },
  'experiments': { lemma: 'experiment', pos: 'n' },
  'models': { lemma: 'model', pos: 'n' },
  'entities': { lemma: 'entity', pos: 'n' },
  'relations': { lemma: 'relation', pos: 'n' },
  'children': { lemma: 'child', pos: 'n' },
  'feet': { lemma: 'foot', pos: 'n' },
  'teeth': { lemma: 'tooth', pos: 'n' },
  'geese': { lemma: 'goose', pos: 'n' },
  'men': { lemma: 'man', pos: 'n' },
  'women': { lemma: 'woman', pos: 'n' },
  'people': { lemma: 'person', pos: 'n' },
  'data': { lemma: 'datum', pos: 'n' },
  'indices': { lemma: 'index', pos: 'n' },
  'matrices': { lemma: 'matrix', pos: 'n' },
  'vertices': { lemma: 'vertex', pos: 'n' },
  'analyses': { lemma: 'analysis', pos: 'n' },
  'hypotheses': { lemma: 'hypothesis', pos: 'n' },

  // Verbs (Past / Participle -> Infinitive)
  'were': { lemma: 'be', pos: 'v' },
  'was': { lemma: 'be', pos: 'v' },
  'is': { lemma: 'be', pos: 'v' },
  'am': { lemma: 'be', pos: 'v' },
  'are': { lemma: 'be', pos: 'v' },
  'been': { lemma: 'be', pos: 'v' },
  'having': { lemma: 'have', pos: 'v' },
  'had': { lemma: 'have', pos: 'v' },
  'has': { lemma: 'have', pos: 'v' },
  'jumping': { lemma: 'jump', pos: 'v' },
  'jumped': { lemma: 'jump', pos: 'v' },
  'jumps': { lemma: 'jump', pos: 'v' },
  'studying': { lemma: 'study', pos: 'v' },
  'studied': { lemma: 'study', pos: 'v' },
  'studies': { lemma: 'study', pos: 'v' },
  'running': { lemma: 'run', pos: 'v' },
  'ran': { lemma: 'run', pos: 'v' },
  'runs': { lemma: 'run', pos: 'v' },
  'cleans': { lemma: 'clean', pos: 'v' },
  'cleaned': { lemma: 'clean', pos: 'v' },
  'cleaning': { lemma: 'clean', pos: 'v' },
  'standardizes': { lemma: 'standardize', pos: 'v' },
  'standardized': { lemma: 'standardize', pos: 'v' },
  'standardizing': { lemma: 'standardize', pos: 'v' },
  'normalizes': { lemma: 'normalize', pos: 'v' },
  'normalized': { lemma: 'normalize', pos: 'v' },
  'normalizing': { lemma: 'normalize', pos: 'v' },
  'building': { lemma: 'build', pos: 'v' },
  'built': { lemma: 'build', pos: 'v' },
  'builds': { lemma: 'build', pos: 'v' },
  'preprocessing': { lemma: 'preprocess', pos: 'v' },
  'preprocessed': { lemma: 'preprocess', pos: 'v' },
  'went': { lemma: 'go', pos: 'v' },
  'gone': { lemma: 'go', pos: 'v' },
  'going': { lemma: 'go', pos: 'v' },
  'goes': { lemma: 'go', pos: 'v' },
  'came': { lemma: 'come', pos: 'v' },
  'coming': { lemma: 'come', pos: 'v' },
  'did': { lemma: 'do', pos: 'v' },
  'done': { lemma: 'do', pos: 'v' },
  'doing': { lemma: 'do', pos: 'v' },
  'made': { lemma: 'make', pos: 'v' },
  'making': { lemma: 'make', pos: 'v' },
  'took': { lemma: 'take', pos: 'v' },
  'taken': { lemma: 'take', pos: 'v' },
  'taking': { lemma: 'take', pos: 'v' },
  'saw': { lemma: 'see', pos: 'v' },
  'seen': { lemma: 'see', pos: 'v' },
  'seeing': { lemma: 'see', pos: 'v' },
  'written': { lemma: 'write', pos: 'v' },
  'wrote': { lemma: 'write', pos: 'v' },
  'writing': { lemma: 'write', pos: 'v' },

  // Adjectives / Adverbs
  'better': { lemma: 'good', pos: 'a' },
  'best': { lemma: 'good', pos: 'a' },
  'worse': { lemma: 'bad', pos: 'a' },
  'worst': { lemma: 'bad', pos: 'a' },
  'faster': { lemma: 'fast', pos: 'a' },
  'fastest': { lemma: 'fast', pos: 'a' },
  'lazier': { lemma: 'lazy', pos: 'a' },
  'laziest': { lemma: 'lazy', pos: 'a' },
  'larger': { lemma: 'large', pos: 'a' },
  'largest': { lemma: 'large', pos: 'a' },
  'earlier': { lemma: 'early', pos: 'r' },
  'earliest': { lemma: 'early', pos: 'r' }
};

// ── 4. Lightweight Rule-Based POS Tagger for English Tokens ──────────────────
export function inferWordNetPos(word) {
  const w = word.toLowerCase();
  if (WORDNET_IRREGULARS[w]) {
    return WORDNET_IRREGULARS[w].pos;
  }
  // Verb indicators
  if (w.endsWith('ing') || w.endsWith('ed') || w.endsWith('ize') || w.endsWith('ise') || w.endsWith('ate')) {
    return 'v';
  }
  // Adjective indicators
  if (w.endsWith('ous') || w.endsWith('ful') || w.endsWith('able') || w.endsWith('ible') || w.endsWith('al') || w.endsWith('ive')) {
    return 'a';
  }
  // Adverb indicators
  if (w.endsWith('ly')) {
    return 'r';
  }
  // Default to Noun
  return 'n';
}

// ── 5. WordNet Lemmatizer Function ───────────────────────────────────────────
export function wordNetLemmatize(word, pos = null) {
  if (!word || typeof word !== 'string') return '';
  const lower = word.toLowerCase();

  // 1. Direct dictionary irregular lookup
  if (WORDNET_IRREGULARS[lower]) {
    const entry = WORDNET_IRREGULARS[lower];
    if (!pos || pos === entry.pos) {
      return entry.lemma;
    }
  }

  const targetPos = pos || inferWordNetPos(lower);

  // 2. Verb Lemmatization
  if (targetPos === 'v') {
    if (lower.endsWith('ies') && lower.length > 4) return lower.slice(0, -3) + 'y'; // studies -> study
    if (lower.endsWith('ying') && lower.length > 5) return lower.slice(0, -4) + 'ie'; // lying -> lie
    if (lower.endsWith('ing') && lower.length > 5) {
      const stem = lower.slice(0, -3);
      // doubling rule: running -> run, swimming -> swim
      if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2] && !['l', 's', 'z'].includes(stem[stem.length - 1])) {
        return stem.slice(0, -1);
      }
      if (stem.endsWith('at') || stem.endsWith('iz')) return stem + 'e';
      return stem;
    }
    if (lower.endsWith('ed') && lower.length > 4) {
      const stem = lower.slice(0, -2);
      if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2] && !['l', 's', 'z'].includes(stem[stem.length - 1])) {
        return stem.slice(0, -1);
      }
      return stem;
    }
    if (lower.endsWith('es') && lower.length > 4) return lower.slice(0, -2);
    if (lower.endsWith('s') && lower.length > 3 && !lower.endsWith('ss')) return lower.slice(0, -1);
  }

  // 3. Noun Lemmatization
  if (targetPos === 'n') {
    if (lower.endsWith('ies') && lower.length > 4) return lower.slice(0, -3) + 'y'; // entities -> entity
    if (lower.endsWith('es') && (lower.endsWith('shes') || lower.endsWith('ches') || lower.endsWith('xes') || lower.endsWith('sses'))) {
      return lower.slice(0, -2); // foxes -> fox
    }
    if (lower.endsWith('s') && lower.length > 3 && !lower.endsWith('ss') && !lower.endsWith('us') && !lower.endsWith('is')) {
      return lower.slice(0, -1); // dogs -> dog
    }
  }

  // 4. Adjective Lemmatization
  if (targetPos === 'a') {
    if (lower.endsWith('ier') && lower.length > 4) return lower.slice(0, -3) + 'y'; // lazier -> lazy
    if (lower.endsWith('iest') && lower.length > 5) return lower.slice(0, -4) + 'y'; // laziest -> lazy
    if (lower.endsWith('er') && lower.length > 4) return lower.slice(0, -2);
    if (lower.endsWith('est') && lower.length > 5) return lower.slice(0, -3);
  }

  return lower;
}

// ── 6. Full Sequential Preprocessing Pipeline ────────────────────────────────
export function processTextPipeline(rawText, options = {}) {
  const {
    lowercase = true,
    removePunctNoise = true,
    removeStopwords = true,
    posLemmatization = true,
    useStemming = true,
    stopwordsSet = NLTK_ENGLISH_STOPWORDS
  } = options;

  const origCharCount = rawText.length;
  const rawWords = (rawText.trim().split(/\s+/).filter(Boolean));
  const origTokenCount = rawWords.length;

  // Step 1: Case folding
  let cleanedText = rawText;
  if (lowercase) {
    cleanedText = cleanedText.toLowerCase();
  }

  // Step 2: Noise & Number removal regex [^a-zA-Z\s]
  if (removePunctNoise) {
    cleanedText = cleanedText.replace(/[^a-zA-Z\s]/g, ' ');
  }

  // Step 3: Raw Token Extraction
  const extractedTokens = cleanedText.trim().split(/\s+/).filter(Boolean);

  // Step 4: Stop-Word Removal
  const finalTokens = removeStopwords
    ? extractedTokens.filter(w => !stopwordsSet.has(w.toLowerCase()))
    : extractedTokens;

  // Step 5: Stemming (Porter Stemmer)
  const stemmedTokens = finalTokens.map(w => porterStem(w));

  // Step 6: Lemmatization (WordNet Lemmatizer with POS)
  const tokenComparisonTable = finalTokens.map((w, idx) => {
    const posTag = posLemmatization ? inferWordNetPos(w) : 'n';
    const lemma = wordNetLemmatize(w, posLemmatization ? posTag : 'n');
    const stem = stemmedTokens[idx];
    const isDifferent = stem !== lemma;

    return {
      id: idx + 1,
      token: w,
      stem,
      lemma,
      posTag,
      isDifferent
    };
  });

  const lemmatizedTokens = tokenComparisonTable.map(item => item.lemma);
  const filteredTokenCount = finalTokens.length;
  const tokensRemoved = Math.max(0, origTokenCount - filteredTokenCount);
  const reductionPct = origTokenCount > 0 ? Math.round((tokensRemoved / origTokenCount) * 100) : 0;

  return {
    rawText,
    cleanedText,
    extractedTokens,
    finalTokens,
    stemmedTokens,
    lemmatizedTokens,
    tokenComparisonTable,
    metrics: {
      origCharCount,
      origTokenCount,
      filteredTokenCount,
      tokensRemoved,
      reductionPct
    },
    finalCorpusString: lemmatizedTokens.join(' ')
  };
}
