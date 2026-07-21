import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const sourceBranch = 'origin/agent/oslo-coordinate-bjorvika-four-production';
const payloadFiles = [
  'data/places/by/oslo/places/sukkerbiten_badstulandsby.json',
  'data/places/by/oslo/places/losaeter.json',
  'data/places/sport/europa/norway/oslo_sport/friluftshuset_sorenga.json',
  'data/places/sport/europa/norway/oslo_sport/operastranda.json',
  'data/coordinate-evidence/oslo/by/sukkerbiten_badstulandsby.json',
  'data/coordinate-evidence/oslo/by/losaeter.json',
  'data/coordinate-evidence/oslo/sport/friluftshuset_sorenga.json',
  'data/coordinate-evidence/oslo/sport/operastranda.json',
];
for (const filePath of payloadFiles) {
  const content = execFileSync('git', ['show', `${sourceBranch}:${filePath}`], { encoding: 'utf8' });
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.endsWith('\n') ? content : `${content}\n`);
}

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, v) => fs.writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`);

const placeEntries = [
  'places/by/oslo/places/sukkerbiten_badstulandsby.json',
  'places/by/oslo/places/losaeter.json',
  'places/sport/europa/norway/oslo_sport/friluftshuset_sorenga.json',
  'places/sport/europa/norway/oslo_sport/operastranda.json',
];
const evidenceEntries = [
  'oslo/by/sukkerbiten_badstulandsby.json',
  'oslo/by/losaeter.json',
  'oslo/sport/friluftshuset_sorenga.json',
  'oslo/sport/operastranda.json',
];

const placeManifest = read('data/places/manifest.json');
for (const entry of placeEntries) if (!placeManifest.files.includes(entry)) placeManifest.files.push(entry);
write('data/places/manifest.json', placeManifest);
const evidenceManifest = read('data/coordinate-evidence/manifest.json');
for (const entry of evidenceEntries) if (!evidenceManifest.files.includes(entry)) evidenceManifest.files.push(entry);
write('data/coordinate-evidence/manifest.json', evidenceManifest);

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(protocolPath, 'utf8');
const ids = ['sukkerbiten_badstulandsby', 'losaeter', 'friluftshuset_sorenga', 'operastranda'];
if (ids.some((id) => protocol.includes(`\`${id}\``))) throw new Error('One or more Bjørvika IDs already registered on current main.');
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
protocol = protocol.replace(summaryRe, `Oslo-tabellen inneholder nå ${newCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${firstBatch}–${lastBatch} legger til Sukkerbiten badstulandsby og Friluftshuset på Sørenga med entydige offisielle adressepunkter, samt Losæter og Operastranda med eksakte navngitte områdegeometrier. Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`);
const rows = [
  `| ${firstBatch} | \`sukkerbiten_badstulandsby\` | Sukkerbiten badstulandsby | verified | \`geonorge-adresser-v1:0301:15256:28\` |`,
  `| ${firstBatch + 1} | \`losaeter\` | Losæter | verified_geometry | \`osm-way:172520783\` |`,
  `| ${firstBatch + 2} | \`friluftshuset_sorenga\` | Friluftshuset på Sørenga | verified | \`geonorge-adresser-v1:0301:21549:124\` |`,
  `| ${firstBatch + 3} | \`operastranda\` | Operastranda | verified_geometry | \`osm-way:936040800\` |`,
].join('\n');
const marker = '\nRelevante korrigerende merger for de første Oslo-batchene:';
if (!protocol.includes(marker)) throw new Error('Oslo table marker not found');
protocol = protocol.replace(marker, `\n${rows}${marker}`);
fs.writeFileSync(protocolPath, protocol);

fs.mkdirSync('reports/visitoslo-bjorvika-audit-20260721', { recursive: true });
write('reports/visitoslo-bjorvika-audit-20260721/production-final.json', {
  sourceBranch,
  placeIds: ids,
  firstBatch,
  lastBatch,
  oldOsloControlledCount: oldCount,
  newOsloControlledCount: newCount,
  scope: 'first_30_visible_results',
});
console.log(JSON.stringify({ firstBatch, lastBatch, placeIds: ids }, null, 2));
