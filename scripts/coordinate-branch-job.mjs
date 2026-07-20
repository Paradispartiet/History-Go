import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const sourceBranch = 'origin/agent/oslo-coordinate-grunerlokka-current-main';
const filesToCopy = [
  'data/places/historie/oslo/places_historie/paulus_kirke.json',
  'data/places/kunst/oslo/places_kunst/purenkel_galleri.json',
  'data/places/by/oslo/places/torshovparken.json',
  'data/places/kunst/oslo/places_kunst/hodet_nn_torshovdalen.json',
  'data/coordinate-evidence/oslo/historie/paulus_kirke.json',
  'data/coordinate-evidence/oslo/kunst/purenkel_galleri.json',
  'data/coordinate-evidence/oslo/by/torshovparken.json',
  'data/coordinate-evidence/oslo/kunst/hodet_nn_torshovdalen.json',
];

execFileSync('git', ['merge', '--no-edit', 'origin/main'], { stdio: 'inherit' });
for (const filePath of filesToCopy) {
  const content = execFileSync('git', ['show', `${sourceBranch}:${filePath}`], { encoding: 'utf8' });
  fs.mkdirSync(filePath.slice(0, filePath.lastIndexOf('/')), { recursive: true });
  fs.writeFileSync(filePath, content.endsWith('\n') ? content : `${content}\n`);
}

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, v) => fs.writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`);

const placeEntries = [
  'places/historie/oslo/places_historie/paulus_kirke.json',
  'places/kunst/oslo/places_kunst/purenkel_galleri.json',
  'places/by/oslo/places/torshovparken.json',
  'places/kunst/oslo/places_kunst/hodet_nn_torshovdalen.json',
];
const evidenceEntries = [
  'oslo/historie/paulus_kirke.json',
  'oslo/kunst/purenkel_galleri.json',
  'oslo/by/torshovparken.json',
  'oslo/kunst/hodet_nn_torshovdalen.json',
];

const placeManifestPath = 'data/places/manifest.json';
const placeManifest = read(placeManifestPath);
for (const entry of placeEntries) if (!placeManifest.files.includes(entry)) placeManifest.files.push(entry);
write(placeManifestPath, placeManifest);

const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const evidenceManifest = read(evidenceManifestPath);
for (const entry of evidenceEntries) if (!evidenceManifest.files.includes(entry)) evidenceManifest.files.push(entry);
write(evidenceManifestPath, evidenceManifest);

const overridesPath = 'data/places/category_overrides.json';
const overrides = read(overridesPath);
if (!overrides.some((row) => row.id === 'paulus_kirke')) {
  overrides.push({ id: 'paulus_kirke', category: 'religion', note: 'Aktiv kirke og primært trossted.' });
}
write(overridesPath, overrides);

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(protocolPath, 'utf8');
const ids = ['paulus_kirke', 'purenkel_galleri', 'torshovparken', 'hodet_nn_torshovdalen'];
if (ids.some((id) => protocol.includes(`\`${id}\``))) throw new Error('Grünerløkka ID already registered');

const osloStart = protocol.indexOf('## Oslo');
const nextHeading = protocol.indexOf('\n## ', osloStart + 7);
const osloBlock = nextHeading === -1 ? protocol.slice(osloStart) : protocol.slice(osloStart, nextHeading);
const batches = [...osloBlock.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
const firstBatch = Math.max(...batches) + 1;
const lastBatch = firstBatch + 3;

const summaryRe = /^Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\..*$/m;
const match = protocol.match(summaryRe);
if (!match) throw new Error('Oslo summary not found');
const oldCount = Number(match[1]);
const newCount = oldCount + 4;
protocol = protocol.replace(
  summaryRe,
  `Oslo-tabellen inneholder nå ${newCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${firstBatch}–${lastBatch} legger til Paulus kirke, Purenkel galleri, Torshovparken og HODET N.N. med verifiserte adresse- eller objektankre. Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`,
);

const rows = [
  `| ${firstBatch} | \`paulus_kirke\` | Paulus kirke | verified | \`geonorge-adresser-v1:0301:17489:31\` |`,
  `| ${firstBatch + 1} | \`purenkel_galleri\` | Purenkel galleri | verified | \`geonorge-adresser-v1:0301:12432:3\` |`,
  `| ${firstBatch + 2} | \`torshovparken\` | Torshovparken | verified_geometry | \`osm-way:252260743\` |`,
  `| ${firstBatch + 3} | \`hodet_nn_torshovdalen\` | HODET N.N. | verified_geometry | \`osm-node:2965223021\` |`,
].join('\n');
const marker = '\nRelevante korrigerende merger for de første Oslo-batchene:';
if (!protocol.includes(marker)) throw new Error('Oslo table marker not found');
protocol = protocol.replace(marker, `\n${rows}${marker}`);
fs.writeFileSync(protocolPath, protocol);

fs.mkdirSync('reports/visitoslo-grunerlokka-audit-20260721', { recursive: true });
write('reports/visitoslo-grunerlokka-audit-20260721/production-final-current-main.json', {
  sourceBranch,
  placeIds: ids,
  firstBatch,
  lastBatch,
  oldOsloControlledCount: oldCount,
  newOsloControlledCount: newCount,
  runtimeCategoryOverride: { paulus_kirke: 'religion' },
});

console.log(JSON.stringify({ firstBatch, lastBatch, placeIds: ids }, null, 2));
