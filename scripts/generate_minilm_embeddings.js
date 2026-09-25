import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateEmbeddings() {
  console.log('Loading all-MiniLM-L6-v2 pipeline...');
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const labDataPath = path.resolve(__dirname, '../src/experiments/exp15/data/labData.js');
  const labDataContent = fs.readFileSync(labDataPath, 'utf8');

  // Extract DOCUMENT_POOL
  // Let's import or parse the documents
  const { DOCUMENT_POOL } = await import('../src/experiments/exp15/data/labData.js');

  console.log(`Generating 384-D embeddings for ${DOCUMENT_POOL.length} documents...`);
  const embeddingsMap = {};

  for (let i = 0; i < DOCUMENT_POOL.length; i++) {
    const doc = DOCUMENT_POOL[i];
    const textToEncode = `${doc.title}. ${doc.snippet}`;
    const output = await extractor(textToEncode, { pooling: 'mean', normalize: true });
    embeddingsMap[doc.id] = Array.from(output.data);
    console.log(`[${i + 1}/${DOCUMENT_POOL.length}] Generated embedding for ${doc.id}: ${doc.title.slice(0, 35)}...`);
  }

  const outputPath = path.resolve(__dirname, '../src/experiments/exp15/data/documentEmbeddings.json');
  fs.writeFileSync(outputPath, JSON.stringify(embeddingsMap, null, 2), 'utf8');
  console.log(`Saved offline embeddings to ${outputPath}`);
}

generateEmbeddings().catch(err => {
  console.error('Error generating embeddings:', err);
  process.exit(1);
});
