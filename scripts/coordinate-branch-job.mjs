import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'docs/coordinates/coordinate-control-protocol.md');
let text = fs.readFileSync(file, 'utf8');

const broken = /Relevante korrigerende merger for d\n(\| 55 \| `holmlia_bad` \| Holmlia bad \| verified \| `geonorge-adresser-v1:0301:13084:34` \|)e første Oslo-batchene:/;
const match = text.match(broken);
if (!match) throw new Error('Expected malformed Holmlia table boundary was not found');

text = text.replace(
  broken,
  `${match[1]}\n\nRelevante korrigerende merger for de første Oslo-batchene:`
);

if (!text.includes('| 55 | `holmlia_bad` | Holmlia bad | verified | `geonorge-adresser-v1:0301:13084:34` |\n\nRelevante korrigerende merger for de første Oslo-batchene:')) {
  throw new Error('Holmlia row repair did not produce the expected table boundary');
}

fs.writeFileSync(file, text);
console.log('Repaired the Holmlia batch 55 row/table boundary in the Oslo coordinate protocol.');
