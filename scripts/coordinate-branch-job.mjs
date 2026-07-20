import fs from 'node:fs';

const file = 'docs/coordinates/coordinate-control-protocol.md';
let text = fs.readFileSync(file, 'utf8');

text = text.split('\n').filter((line) => !line.includes('| `trikk_17_18` – Trikkelinje 17/18 | needs_review')).join('\n');

const osloStart = text.indexOf('## Oslo');
const unresolvedStart = text.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const etneStart = text.indexOf('## Etne');
const verifiedCount = (text.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
const unresolvedSection = text.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : text.length);
const unresolvedCount = unresolvedSection.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;

text = text.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 40 løser trikk 17/18 som et forgrenet rutepar med fem offisielle stoppankre. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
text = text.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);

fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, verifiedCount, unresolvedCount }, null, 2));
