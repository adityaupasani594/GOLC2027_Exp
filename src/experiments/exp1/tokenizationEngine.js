// ─── Multimodal Tokenization Engine (Exp 1) ──────────────────────────────────
// Pure JavaScript implementation of text, image, audio, and video tokenization
// for Information Retrieval without any Python or external server dependencies.

// ─── 1. Text Preprocessing & Tokenization ────────────────────────────────────

// Built-in English stop words list (~318 words, mirroring scikit-learn ENGLISH_STOP_WORDS)
export const ENGLISH_STOP_WORDS = new Set([
  'a', 'about', 'above', 'across', 'after', 'afterwards', 'again', 'against', 'all',
  'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'am', 'among',
  'amongst', 'amoungst', 'amount', 'an', 'and', 'another', 'any', 'anyhow', 'anyone',
  'anything', 'anyway', 'anywhere', 'are', 'around', 'as', 'at', 'back', 'be', 'became',
  'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'behind',
  'being', 'below', 'beside', 'besides', 'between', 'beyond', 'bill', 'both', 'bottom',
  'but', 'by', 'call', 'can', 'cannot', 'cant', 'co', 'con', 'could', 'couldnt', 'cry',
  'de', 'describe', 'detail', 'do', 'done', 'down', 'due', 'during', 'each', 'eg',
  'eight', 'either', 'eleven', 'else', 'elsewhere', 'empty', 'enough', 'etc', 'even',
  'ever', 'every', 'everyone', 'everything', 'everywhere', 'except', 'few', 'fifteen',
  'fifty', 'fill', 'find', 'fire', 'first', 'five', 'for', 'former', 'formerly', 'forty',
  'found', 'four', 'from', 'front', 'full', 'further', 'get', 'give', 'go', 'had',
  'has', 'hasnt', 'have', 'he', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein',
  'hereupon', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'however', 'hundred',
  'i', 'ie', 'if', 'in', 'inc', 'indeed', 'interest', 'into', 'is', 'it', 'its', 'itself',
  'keep', 'last', 'latter', 'latterly', 'least', 'less', 'ltd', 'made', 'many', 'may',
  'me', 'meanwhile', 'might', 'mill', 'mine', 'more', 'moreover', 'most', 'mostly',
  'move', 'much', 'must', 'my', 'myself', 'name', 'namely', 'neither', 'never',
  'nevertheless', 'next', 'nine', 'no', 'nobody', 'none', 'noone', 'nor', 'not',
  'nothing', 'now', 'nowhere', 'of', 'off', 'often', 'on', 'once', 'one', 'only',
  'onto', 'or', 'other', 'others', 'otherwise', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'part', 'per', 'perhaps', 'please', 'put', 'rather', 're', 'same',
  'see', 'seem', 'seemed', 'seeming', 'seems', 'serious', 'several', 'she', 'should',
  'show', 'side', 'since', 'sincere', 'six', 'sixty', 'so', 'some', 'somehow',
  'someone', 'something', 'sometime', 'sometimes', 'somewhere', 'still', 'such',
  'system', 'take', 'ten', 'than', 'that', 'the', 'their', 'them', 'themselves',
  'then', 'thence', 'there', 'thereafter', 'thereby', 'therefore', 'therein',
  'thereupon', 'these', 'they', 'thick', 'thin', 'third', 'this', 'those', 'though',
  'three', 'through', 'throughout', 'thru', 'thus', 'to', 'together', 'too', 'top',
  'toward', 'towards', 'twelve', 'twenty', 'two', 'un', 'under', 'until', 'up',
  'upon', 'us', 'very', 'via', 'was', 'we', 'well', 'were', 'what', 'whatever',
  'when', 'whence', 'whenever', 'where', 'whereafter', 'whereas', 'whereby',
  'wherein', 'whereupon', 'wherever', 'whether', 'which', 'while', 'whither', 'who',
  'whoever', 'whole', 'whom', 'whose', 'why', 'will', 'with', 'within', 'without',
  'would', 'yet', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Tokenize raw text by matching non-whitespace character sequences
 */
export function tokenizeText(text) {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(/\S+/g);
  return matches || [];
}

/**
 * Clean text by stripping digits and/or punctuation
 */
export function cleanText(text, removePunct = true, removeNumbers = true) {
  if (!text) return '';
  let cleaned = text;
  if (removeNumbers) {
    cleaned = cleaned.replace(/\d+/g, ' ');
  }
  if (removePunct) {
    cleaned = cleaned.replace(/[^\w\s]|_/g, ' ');
  }
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Lowercase text for casing normalization
 */
export function normalizeText(text) {
  return (text || '').toLowerCase();
}

/**
 * Remove English stop words from a list of tokens
 */
export function removeStopwords(tokens) {
  if (!tokens || !Array.isArray(tokens)) return [];
  return tokens.filter(t => !ENGLISH_STOP_WORDS.has(t.toLowerCase()));
}

/**
 * Porter Stemmer algorithm implementation in pure JavaScript
 */
export function stemToken(word) {
  if (!word || word.length < 3) return word;
  let w = word.toLowerCase();

  const step1a = (str) => {
    if (str.endsWith('sses')) return str.slice(0, -2);
    if (str.endsWith('ies')) return str.slice(0, -2);
    if (str.endsWith('ss')) return str;
    if (str.endsWith('s')) return str.slice(0, -1);
    return str;
  };

  const hasVowel = (str) => /[aeiouy]/.test(str);

  const step1b = (str) => {
    if (str.endsWith('eed')) {
      const stem = str.slice(0, -3);
      if (hasVowel(stem)) return str.slice(0, -1);
      return str;
    }
    let matched = false;
    let stem = '';
    if (str.endsWith('ed')) {
      stem = str.slice(0, -2);
      matched = hasVowel(stem);
    } else if (str.endsWith('ing')) {
      stem = str.slice(0, -3);
      matched = hasVowel(stem);
    }
    if (matched) {
      if (stem.endsWith('at') || stem.endsWith('bl') || stem.endsWith('iz')) {
        return stem + 'e';
      }
      if (stem.length >= 2 && stem[stem.length - 1] === stem[stem.length - 2] && !/[lsz]/.test(stem[stem.length - 1])) {
        return stem.slice(0, -1);
      }
      return stem;
    }
    return str;
  };

  const step1c = (str) => {
    if (str.endsWith('y') && hasVowel(str.slice(0, -1))) {
      return str.slice(0, -1) + 'i';
    }
    return str;
  };

  const step2 = (str) => {
    const pairs = [
      ['ational', 'ate'], ['tional', 'tion'], ['enci', 'ence'], ['anci', 'ance'],
      ['izer', 'ize'], ['abli', 'able'], ['alli', 'al'], ['entli', 'ent'],
      ['eli', 'e'], ['ousli', 'ous'], ['ization', 'ize'], ['ation', 'ate'],
      ['ator', 'ate'], ['alism', 'al'], ['iveness', 'ive'], ['fulness', 'ful'],
      ['ousness', 'ous'], ['aliti', 'al'], ['iviti', 'ive'], ['biliti', 'ble']
    ];
    for (const [suf, rep] of pairs) {
      if (str.endsWith(suf)) {
        const stem = str.slice(0, -suf.length);
        if (hasVowel(stem)) return stem + rep;
      }
    }
    return str;
  };

  const step4 = (str) => {
    const suffixes = ['al', 'ance', 'ence', 'er', 'ic', 'able', 'ible', 'ant', 'ement', 'ment', 'ent', 'ou', 'ism', 'ate', 'iti', 'ous', 'ive', 'ize'];
    for (const suf of suffixes) {
      if (str.endsWith(suf)) {
        const stem = str.slice(0, -suf.length);
        if (hasVowel(stem) && stem.length > 2) return stem;
      }
    }
    return str;
  };

  w = step1a(w);
  w = step1b(w);
  w = step1c(w);
  w = step2(w);
  w = step4(w);
  return w;
}

export function stemTokens(tokens) {
  if (!tokens || !Array.isArray(tokens)) return [];
  return tokens.map(stemToken);
}

/**
 * Execute full text pipeline with toggles and retain intermediate evidence
 */
export function processDocument(rawText, options = {}) {
  const {
    doLowercase = true,
    doRemovePunct = true,
    doRemoveNumbers = true,
    doTokenize = true,
    doRemoveStopwords = true,
    doStem = true
  } = options;

  const cleaned = cleanText(rawText, doRemovePunct, doRemoveNumbers);
  const normalized = doLowercase ? normalizeText(cleaned) : cleaned;
  const tokens = doTokenize ? tokenizeText(normalized) : normalized.split(/\s+/).filter(Boolean);
  const tokensNoSw = (doRemoveStopwords && doTokenize) ? removeStopwords(tokens) : tokens;
  const stemmed = (doStem && doTokenize) ? stemTokens(tokensNoSw) : tokensNoSw;

  const rawWords = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const tokenCount = tokens.length;
  const afterStopwords = tokensNoSw.length;
  const uniqueBefore = new Set(tokensNoSw.map(t => t.toLowerCase())).size;
  const uniqueAfter = new Set(stemmed).size;
  const reduction = rawWords > 0 ? Number(((1 - afterStopwords / rawWords) * 100).toFixed(2)) : 0;

  return {
    raw: rawText,
    cleaned,
    normalized,
    tokens,
    tokensNoSw,
    stemmed,
    finalText: stemmed.join(' '),
    stats: {
      originalCharCount: rawText.length,
      originalWordCount: rawWords,
      tokenCount,
      tokensAfterStopwords: afterStopwords,
      finalTokenCount: stemmed.length,
      stopwordsRemoved: tokenCount - afterStopwords,
      tokensReducedVsOriginal: rawWords - afterStopwords,
      percentageReduction: reduction,
      uniqueTokensBeforeStemming: uniqueBefore,
      uniqueStemsAfterStemming: uniqueAfter,
      vocabularyReductionByStemming: uniqueBefore - uniqueAfter,
    }
  };
}

// ─── 2. Image Patch Tokenization (ViT Style) ─────────────────────────────────

/**
 * Generate synthetic 128x128 image as a Canvas for offline interactive theory/lab
 */
export function generateSyntheticImageCanvas(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Background sky & ground
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, size, size / 2);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, size / 2, size, size / 2);

  // Glowing Sun
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.28, size * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fde68a';
  ctx.stroke();

  // Mountain 1 (emerald)
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(size * 0.45, size * 0.35);
  ctx.lineTo(size * 0.9, size);
  ctx.closePath();
  ctx.fillStyle = '#059669';
  ctx.fill();
  ctx.strokeStyle = '#34d399';
  ctx.stroke();

  // Mountain 2 (teal)
  ctx.beginPath();
  ctx.moveTo(size * 0.3, size);
  ctx.lineTo(size * 0.75, size * 0.45);
  ctx.lineTo(size, size);
  ctx.closePath();
  ctx.fillStyle = '#0d9488';
  ctx.fill();

  // Foreground accents
  ctx.beginPath();
  ctx.arc(size * 0.2, size * 0.8, size * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = '#ec4899';
  ctx.fill();

  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(size * 0.7, size * 0.72, size * 0.2, size * 0.18);

  return canvas;
}

/**
 * Extract fixed-size PxP visual patch tokens from an image or canvas
 */
export function extractImagePatches(sourceCanvas, patchSize = 16) {
  const originalWidth = sourceCanvas.width;
  const originalHeight = sourceCanvas.height;

  const width = Math.floor(originalWidth / patchSize) * patchSize;
  const height = Math.floor(originalHeight / patchSize) * patchSize;
  const rows = height / patchSize;
  const cols = width / patchSize;
  const totalPatches = rows * cols;

  const srcCtx = sourceCanvas.getContext('2d');
  const patches = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * patchSize;
      const y = r * patchSize;
      const imgData = srcCtx.getImageData(x, y, patchSize, patchSize);

      // Compute average RGB channel values
      let sumR = 0, sumG = 0, sumB = 0;
      const totalPixels = patchSize * patchSize;
      for (let i = 0; i < imgData.data.length; i += 4) {
        sumR += imgData.data[i];
        sumG += imgData.data[i + 1];
        sumB += imgData.data[i + 2];
      }
      const meanR = Math.round(sumR / totalPixels);
      const meanG = Math.round(sumG / totalPixels);
      const meanB = Math.round(sumB / totalPixels);

      // Create patch thumbnail
      const pCanvas = document.createElement('canvas');
      pCanvas.width = patchSize;
      pCanvas.height = patchSize;
      const pCtx = pCanvas.getContext('2d');
      pCtx.putImageData(imgData, 0, 0);

      patches.push({
        id: r * cols + c + 1,
        row: r,
        col: c,
        x,
        y,
        size: patchSize,
        meanR,
        meanG,
        meanB,
        rgbHex: `#${((1 << 24) + (meanR << 16) + (meanG << 8) + meanB).toString(16).slice(1)}`,
        dataUrl: pCanvas.toDataURL('image/png'),
      });
    }
  }

  return {
    originalWidth,
    originalHeight,
    width,
    height,
    rows,
    cols,
    patchSize,
    totalPatches,
    patches,
  };
}

// ─── 3. Audio Temporal Frame Tokenization ────────────────────────────────────

/**
 * Synthesize harmonic audio waveform samples (1.0 second, 16 kHz)
 */
export function generateSyntheticAudioWaveform(duration = 1.0, sampleRate = 16000) {
  const totalSamples = Math.floor(duration * sampleRate);
  const times = new Float32Array(totalSamples);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    times[i] = t;
    // Harmonic audio wave with amplitude modulation (chirp + chord)
    const val = (
      0.45 * Math.sin(2 * Math.PI * 440 * t) +
      0.30 * Math.sin(2 * Math.PI * 880 * t * (1 + 0.5 * t)) +
      0.20 * Math.sin(2 * Math.PI * 1320 * t)
    ) * Math.exp(-1.2 * t);
    samples[i] = val;
  }

  return { duration, sampleRate, totalSamples, times, samples };
}

/**
 * Segment audio signal into discrete temporal frame tokens
 */
export function segmentAudioFrames(samples, sampleRate, frameDurationMs = 20) {
  const duration = samples.length / sampleRate;
  const frameDurationSec = frameDurationMs / 1000;
  const samplesPerFrame = Math.max(1, Math.round(sampleRate * frameDurationSec));
  const completeFrameCount = Math.floor(samples.length / samplesPerFrame);
  const coveredDuration = completeFrameCount * frameDurationSec;
  const remainingDurationMs = Math.max(0, (duration - coveredDuration) * 1000);

  const tokens = [];
  for (let i = 0; i < completeFrameCount; i++) {
    const startSample = i * samplesPerFrame;
    const endSample = startSample + samplesPerFrame;
    let sumSq = 0;
    let peak = 0;
    for (let s = startSample; s < endSample; s++) {
      const v = samples[s] || 0;
      sumSq += v * v;
      if (Math.abs(v) > peak) peak = Math.abs(v);
    }
    const rms = Math.sqrt(sumSq / samplesPerFrame);

    tokens.push({
      id: i + 1,
      startSec: Number((i * frameDurationSec).toFixed(3)),
      endSec: Number(((i + 1) * frameDurationSec).toFixed(3)),
      durationMs: frameDurationMs,
      rms: Number(rms.toFixed(4)),
      peakAmplitude: Number(peak.toFixed(4)),
    });
  }

  return {
    duration,
    sampleRate,
    frameDurationMs,
    samplesPerFrame,
    completeFrameCount,
    remainingDurationMs,
    tokens,
  };
}

// ─── 4. Video Keyframe Tokenization ──────────────────────────────────────────

/**
 * Generate 12 synthetic video frames showing dynamic orb animation
 */
export function generateSyntheticVideoFrames(numFrames = 12) {
  const width = 96;
  const height = 96;
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#a855f7'];
  const frames = [];

  for (let i = 0; i < numFrames; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Dark grid background
    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#192434';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Moving orb along trajectory
    const progress = i / Math.max(1, numFrames - 1);
    const cx = 16 + progress * (width - 32);
    const cy = 48 + 24 * Math.sin(progress * 2 * Math.PI);
    const r = 10 + 4 * Math.sin(progress * Math.PI);

    const col = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Frame watermark badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(4, 4, 38, 16);
    ctx.fillStyle = '#2dd4bf';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`F#${String(i + 1).padStart(2, '0')}`, 8, 16);

    frames.push({
      frameIndex: i + 1,
      timestampSec: Number((i / 10).toFixed(2)),
      dataUrl: canvas.toDataURL('image/png'),
      color: col,
    });
  }

  return frames;
}

/**
 * Sample video keyframe tokens given a frame sequence and sampling interval
 */
export function sampleVideoKeyframes(frames, interval = 3) {
  const sampled = [];
  frames.forEach((frame, idx) => {
    const frameNum = idx + 1;
    if (frameNum % interval === 0) {
      sampled.push({
        tokenId: sampled.length + 1,
        sourceFrameIndex: frameNum,
        timestampSec: frame.timestampSec,
        dataUrl: frame.dataUrl,
        interval,
      });
    }
  });

  return {
    totalFrames: frames.length,
    interval,
    sampledTokensCount: sampled.length,
    reductionRatio: Number(((1 - sampled.length / frames.length) * 100).toFixed(1)),
    sampledTokens: sampled,
  };
}

// ─── 5. Cross-Modality Comparison Matrix Data ────────────────────────────────

export const CROSS_MODALITY_COMPARISON = [
  {
    modality: 'Text',
    icon: '📝',
    color: 'blue',
    rawSignal: 'Discrete 1D Characters / Words',
    tokenUnit: 'Lexical Word / Subword Token',
    dimensions: '1D Linear Sequence',
    controlParam: 'Whitespace / Subword Vocabulary',
    indexRepresentation: 'Inverted Index (Term → Postings)',
    granularityExample: 'Tokenize by word boundary vs subword BPE',
  },
  {
    modality: 'Image',
    icon: '🖼️',
    color: 'purple',
    rawSignal: '2D Continuous Pixel Array (H × W × 3)',
    tokenUnit: 'Visual Patch (P × P px)',
    dimensions: '2D Spatial Grid (Row × Col)',
    controlParam: 'Patch Granularity (8px, 16px, 32px)',
    indexRepresentation: 'Visual Bag-of-Words / Patch Embeddings',
    granularityExample: '16×16 px grid = 64 tokens for 128×128 image',
  },
  {
    modality: 'Audio',
    icon: '🎵',
    color: 'teal',
    rawSignal: '1D Continuous Pressure Waveform',
    tokenUnit: 'Temporal Frame Window',
    dimensions: '1D Time Continuum',
    controlParam: 'Frame Duration (10ms, 20ms, 40ms)',
    indexRepresentation: 'Acoustic Frame / Spectrogram Tokens',
    granularityExample: '20ms frame = 50 tokens per second of audio',
  },
  {
    modality: 'Video',
    icon: '🎬',
    color: 'amber',
    rawSignal: '3D Spatiotemporal Stream (T × H × W × 3)',
    tokenUnit: 'Sampled Keyframe / 3D Tubelet',
    dimensions: '3D Time + Space Grid',
    controlParam: 'Sampling Interval (Every N-th Frame)',
    indexRepresentation: 'Temporal Keyframe Sequence Index',
    granularityExample: 'Sample every 4th frame = 75% temporal reduction',
  },
];
