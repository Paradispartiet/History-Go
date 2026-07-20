import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const sourceBranch = 'origin/agent/oslo-coordinate-grunerlokka-final-current-main';
const payloadFiles = [
  'data/places/historie/oslo/places_historie/paulus_kirke.json',
  'data/places/kunst/oslo/places_kunst/purenkel_galleri.json',
  'data/places/by/oslo/places/torshovparken.json',
  'data/places/kunst/oslo/places_kunst/hodet_nn_torshovdalen.json',
  'data/coordinate-evidence/oslo/historie/paulus_kirke.json',
  'data/coordinate-evidence/oslo/kunst/purenkel_galleri.json',
  'data/coordinate-evidence/oslo/by/torshovparken.json',
  'data/coordinate-evidence/oslo/kunst/hodet_nn_torshovdalen.json',
];
const payloads = new Map(payloadFiles.map((filePath) => [
  filePath,
  execFileSync('git', ['show', `${sourceBranch}:${filePath}`], { encoding: 'utf8' }),
]));
const jobBranch = process.env.JOB_BRANCH;
if (!jobBranch) throw new Error('JOB_BRANCH is required');

execFileSync('git', ['reset', '--hard', 'origin/main'], { stdio: 'inherit' });
execFileSync('git', ['push', '--force-with-lease', 'origin', `HEAD:${jobBranch}`], { stdio: 'inherit' });
for (const [filePath, content] of payloads) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
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

const placeManifest = read('data/places/manifest.json');
for (const entry of placeEntries) if (!placeManifest.files.includes(entry)) placeManifest.files.push(entry);
write('data/places/manifest.json', placeManifest);
const evidenceManifest = read('data/coordinate-evidence/manifest.json');
for (const entry of evidenceEntries) if (!evidenceManifest.files.includes(entry)) evidenceManifest.files.push(entry);
write('data/coordinate-evidence/manifest.json', evidenceManifest);
const overrides = read('data/places/category_overrides.json');
if (!overrides.some((row) => row.id === 'paulus_kirke')) {
  overrides.push({ id: 'paulus_kirke', category: 'religion', note: 'Aktiv kirke og primært trossted.' });
}
write('data/places/category_overrides.json', overrides);

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(protocolPath, 'utf8');
const ids = ['paulus_kirke', 'purenkel_galleri', 'torshovparken', 'hodet_nn_torshovdalen'];
if (ids.some((id) => protocol.includes(`\`${id}\``))) throw new Error('Grünerløkka ID already exists on main');
const osloStart = protocol.indexOf('## Oslo');
const nextHeading = protocol.indexOf('\n## ', osloStart + 7);
const osloBlock = nextHeading === -1 ? protocol.slice(osloStart) : protocol.slice(osloStart, nextHeading);
const batches = [...osloBlock.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
const firstBatch = Math.max(...batches) + 1;
const lastBatch = firstBatch + 3;
const summaryRe = /^Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\..*$/m;
const summaryMatch = protocol.match(summaryRe);
if (!summaryMatch) throw new Error('Oslo summary not found');
const oldCount = Number(summaryMatch[1]);
const newCount = oldCount + 4;
protocol = protocol.replace(summaryRe, `Oslo-tabellen inneholder nå ${newCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${firstBatch}–${lastBatch} legger til Paulus kirke, Purenkel galleri, Torshovparken og HODET N.N. med verifiserte adresse- eller objektankre. Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`);
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
write('reports/visitoslo-grunerlokka-audit-20260721/production-atomic-fast-forward.json', {
  baseMainSha: execFileSync('git', ['rev-parse', 'origin/main'], { encoding: 'utf8' }).trim(),
  placeIds: ids,
  firstBatch,
  lastBatch,
  oldOsloControlledCount: oldCount,
  newOsloControlledCount: newCount,
  runtimeCategoryOverride: { paulus_kirke: 'religion' },
});
console.log(JSON.stringify({ firstBatch, lastBatch, placeIds: ids }, null, 2));
