import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../src/experiments/exp15/data/documentEmbeddings.json');
const rawData = fs.readFileSync(jsonPath, 'utf8');
const embeddings = JSON.parse(rawData);

// Convert to a JS export for seamless Vite bundle compatibility
const jsContent = `// Precomputed 384-dimensional dense vectors generated offline using all-MiniLM-L6-v2
export const DOCUMENT_EMBEDDINGS = ${JSON.stringify(embeddings, null, 2)};
`;

const jsPath = path.resolve(__dirname, '../src/experiments/exp15/data/documentEmbeddings.js');
fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log(`Exported documentEmbeddings.js successfully with ${Object.keys(embeddings).length} 384-D vectors.`);
