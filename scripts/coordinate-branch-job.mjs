import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'docs/coordinates/coordinate-control-protocol.md');
let text = fs.readFileSync(file, 'utf8');

const summaryNeedle = 'Oslo-tabellen inneholder nå 350 dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 120 legger til Skimuseet i Holmenkollen';
if (!text.includes(summaryNeedle)) {
  throw new Error('Current main no longer has the expected Skimuseet batch 120 summary; re-audit before changing the next-work pointer');
}

const oldLine = '- Neste nye Oslo-kontroll er batch 120.';
const newLine = '- Neste nye Oslo-kontroll er batch 121.';
const count = text.split(oldLine).length - 1;
if (count !== 1) {
  throw new Error(`Expected exactly one stale batch-120 next-work pointer, found ${count}`);
}
if (/^\| 121 \|/m.test(text)) {
  throw new Error('Batch 121 is already present in the protocol; do not advance the pointer blindly');
}

text = text.replace(oldLine, newLine);
fs.writeFileSync(file, text);
console.log('Advanced the stale Oslo next-work pointer from batch 120 to batch 121 after canonical Skimuseet production.');
