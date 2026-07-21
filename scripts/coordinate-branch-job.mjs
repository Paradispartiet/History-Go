import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'docs/coordinates/coordinate-control-protocol.md');
let text = fs.readFileSync(file, 'utf8');

if (!text.includes('Batch 120 legger til Skimuseet i Holmenkollen')) {
  throw new Error('Skimuseet batch 120 is no longer the current protocol baseline');
}
const oldLine = '- Neste nye Oslo-kontroll er batch 120.';
const count = text.split(oldLine).length - 1;
if (count !== 1) throw new Error(`Expected exactly one stale batch-120 pointer, found ${count}`);
if (/^\| 121 \|/m.test(text)) throw new Error('Batch 121 already exists; do not advance blindly');

text = text.replace(oldLine, '- Neste nye Oslo-kontroll er batch 121.');
fs.writeFileSync(file, text);
console.log('Advanced stale Oslo next-work pointer to batch 121 on current main.');
