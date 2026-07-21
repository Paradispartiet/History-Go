import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT = 'reports/visitoslo-holmenkollen-audit-20260721/production/holmenkollen_skimuseum.json';
const abs = (rel) => path.join(ROOT, rel);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
const lines = protocol.split('\n');
const osloIndex = lines.findIndex((line) => line === '## Oslo');
const vestlandIndex = lines.findIndex((line, index) => index > osloIndex && line.startsWith('## Vestland'));
const osloEnd = vestlandIndex > osloIndex ? vestlandIndex : lines.length;
const summaryIndex = lines.findIndex((line, index) => index > osloIndex && index < osloEnd && line.startsWith('Oslo-tabellen inneholder nå '));
const needsHeadingIndex = lines.findIndex((line, index) => index > osloIndex && index < osloEnd && line === '### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const needsHeaderIndex = lines.findIndex((line, index) => index > needsHeadingIndex && index < osloEnd && line.startsWith('| kandidat | status |'));
const notCountedIndex = lines.findIndex((line, index) => index > needsHeadingIndex && index < osloEnd && line.startsWith('Disse kontrollene er fullført, men teller ikke blant de '));

if (summaryIndex < 0 || needsHeadingIndex < 0 || needsHeaderIndex < 0 || notCountedIndex < 0) {
  throw new Error('Could not resolve Oslo controlled/needs_review protocol structure');
}

const totalMatch = lines[summaryIndex].match(/Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\./);
if (!totalMatch) throw new Error('Could not parse current controlled total');
const controlledTotal = Number(totalMatch[1]);

const needsIds = new Set();
for (let i = needsHeaderIndex + 2; i < osloEnd && lines[i].startsWith('| '); i += 1) {
  const match = lines[i].match(/`([^`]+)`/);
  if (match) needsIds.add(match[1]);
}
const verifiedTotal = controlledTotal - needsIds.size;
if (verifiedTotal <= 0 || verifiedTotal >= controlledTotal) {
  throw new Error(`Implausible verified total ${verifiedTotal} from controlled=${controlledTotal}, needs_review=${needsIds.size}`);
}

lines[notCountedIndex] = `Disse kontrollene er fullført, men teller ikke blant de ${verifiedTotal} verifiserte eller kildekontrollerte canonical Oslo-stedene.`;
protocol = lines.join('\n');
fs.writeFileSync(abs(PROTOCOL), protocol);

const report = JSON.parse(fs.readFileSync(abs(REPORT), 'utf8'));
report.verifiedTotalAfter = verifiedTotal;
report.needsReviewTotal = needsIds.size;
report.countNote = 'Verified total is derived from the canonical controlled total minus unique IDs in the complete Oslo needs_review table; the historical main-table markdown is not contiguous.';
fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({
  ok: true,
  controlledTotal,
  needsReviewTotal: needsIds.size,
  verifiedTotal
}, null, 2));
