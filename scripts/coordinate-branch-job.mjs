import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const SOURCE_PRODUCTION = 'agent/oslo-coordinate-bjorvika-four-production';
const SOURCE_INTAKE = 'agent/oslo-coordinate-bjorvika-four-candidates-intake';
const DATE = '2026-07-21';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeText = (p, content) => {
  const dir = p.split('/').slice(0, -1).join('/');
  if (dir) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, content.endsWith('\n') ? content : `${content}\n`);
};
const writeJson = (p, value) => writeText(p, JSON.stringify(value, null, 2));
const addUnique = (arr, value) => { if (!arr.includes(value)) arr.push(value); };
const containsId = (value, id) => {
  if (Array.isArray(value)) return value.some((v) => containsId(v, id));
  if (!value || typeof value !== 'object') return false;
  if (value.id === id) return true;
  return Object.values(value).some((v) => containsId(v, id));
};
const gitShow = (ref, file) => execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8' });

console.log('[Bjørvika] Running on the current-main branch checkout without moving HEAD.');
execFileSync('git', ['fetch', 'origin', SOURCE_PRODUCTION, SOURCE_INTAKE], { stdio: 'inherit' });

const places = [
  {
    id: 'sukkerbiten_badstulandsby',
    category: 'by',
    placePath: 'data/places/by/oslo/places/sukkerbiten_badstulandsby.json',
    evidencePath: 'data/coordinate-evidence/oslo/by/sukkerbiten_badstulandsby.json',
    status: 'verified',
    sourceObjectId: 'geonorge-adresser-v1:0301:15256:28',
    representation: 'Én samlet og stabil badstulandsby ved Sukkerbiten. Enkeltbadstuer og Oslo Badstuforenings andre lokasjoner får ikke overlappende markører fra denne kilden.'
  },
  {
    id: 'losaeter',
    category: 'by',
    placePath: 'data/places/by/oslo/places/losaeter.json',
    evidencePath: 'data/coordinate-evidence/oslo/by/losaeter.json',
    status: 'verified_geometry',
    sourceObjectId: 'osm-way:172520783',
    representation: 'Eksakt navngitt Losæter-parkpolygon som eget sted for kunst, urbant jordbruk og fellesskap; ikke et generelt Sørenga- eller Bjørvika-proxyanker.'
  },
  {
    id: 'friluftshuset_sorenga',
    category: 'sport',
    placePath: 'data/places/sport/europa/norway/oslo_sport/friluftshuset_sorenga.json',
    evidencePath: 'data/coordinate-evidence/oslo/sport/friluftshuset_sorenga.json',
    status: 'verified',
    sourceObjectId: 'geonorge-adresser-v1:0301:21549:124',
    representation: 'DNTs konkrete institusjons- og aktivitetssenter på Sørengkaia 124, fysisk og funksjonelt separat fra Sørenga sjøbad og det brede Sørenga-områdeankeret.'
  },
  {
    id: 'operastranda',
    category: 'sport',
    placePath: 'data/places/sport/europa/norway/oslo_sport/operastranda.json',
    evidencePath: 'data/coordinate-evidence/oslo/sport/operastranda.json',
    status: 'verified_geometry',
    sourceObjectId: 'osm-way:936040800',
    representation: 'Eksakt navngitt kommunal badestrand som eget fysisk badested; ikke en erstatning for det brede Bjørvika-ankeret og ikke samme anlegg som Sørenga sjøbad.'
  }
];

const runtimeBefore = readJson('data/places/places_index.json');
for (const place of places) {
  if (containsId(runtimeBefore, place.id) || fs.existsSync(place.placePath)) {
    throw new Error(`${place.id} already exists on current main; aborting duplicate production.`);
  }
}

for (const place of places) {
  writeText(place.placePath, gitShow(`origin/${SOURCE_PRODUCTION}`, place.placePath));
  writeText(place.evidencePath, gitShow(`origin/${SOURCE_PRODUCTION}`, place.evidencePath));
}

const intakeFiles = [
  'reports/visitoslo-bjorvika-audit-20260721/coordinate-intake/intake-summary.json',
  'reports/visitoslo-bjorvika-audit-20260721/coordinate-intake/duplicate-audit.json',
  'reports/visitoslo-bjorvika-audit-20260721/coordinate-intake/sukkerbiten-geonorge.txt',
  'reports/visitoslo-bjorvika-audit-20260721/coordinate-intake/friluftshuset-sorenga-geonorge.txt',
  'reports/visitoslo-bjorvika-audit-20260721/coordinate-intake/losaeter-nominatim.json',
  'reports/visitoslo-bjorvika-audit-20260721/coordinate-intake/operastranda-nominatim.json'
];
for (const file of intakeFiles) {
  writeText(file, gitShow(`origin/${SOURCE_INTAKE}`, file));
}

const placeManifest = readJson('data/places/manifest.json');
for (const place of places) addUnique(placeManifest.files, place.placePath.replace(/^data\//, ''));
writeJson('data/places/manifest.json', placeManifest);

const evidenceManifest = readJson('data/coordinate-evidence/manifest.json');
for (const place of places) addUnique(evidenceManifest.files, place.evidencePath.replace(/^data\/coordinate-evidence\//, ''));
writeJson('data/coordinate-evidence/manifest.json', evidenceManifest);

let protocol = fs.readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
const osloStart = protocol.indexOf('## Oslo');
const osloEnd = protocol.indexOf('## Vestland – Etne');
if (osloStart < 0 || osloEnd < 0) throw new Error('Could not locate Oslo coordinate protocol section.');
const osloSection = protocol.slice(osloStart, osloEnd);
const countMatch = osloSection.match(/Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error('Could not parse current Oslo controlled-place count.');
const oldCount = Number(countMatch[1]);
const batchNumbers = [...osloSection.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
if (!batchNumbers.length) throw new Error('Could not parse Oslo coordinate batch rows.');
const firstBatch = Math.max(...batchNumbers) + 1;
const batches = places.map((place, index) => ({ ...place, batch: firstBatch + index }));
const newCount = oldCount + places.length;

protocol = protocol.replace(
  /Oslo-tabellen inneholder nå \d+ dokumenterte verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  `Oslo-tabellen inneholder nå ${newCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${firstBatch}–${firstBatch + 3} produserer fire stabile fysiske steder fra den avgrensede VisitOSLO Bjørvika-auditen etter ferdig duplicate-, scope- og coordinate-intake.`
);
protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${DATE}`);

const insertionMarker = 'Relevante korrigerende merger for de første Oslo-batchene:';
const markerIndex = protocol.indexOf(insertionMarker, osloStart);
if (markerIndex < 0 || markerIndex > osloEnd) throw new Error('Could not locate Oslo protocol insertion marker.');
const rows = batches.map((p) => `| ${p.batch} | \`${p.id}\` | ${readJson(p.placePath).name} | ${p.status} | \`${p.sourceObjectId}\` |`).join('\n');
const notes = batches.map((p) => `Batch ${p.batch} (${DATE}) produserer \`${p.id}\`. ${p.representation}`).join('\n\n');
protocol = `${protocol.slice(0, markerIndex)}${rows}\n\n${notes}\n\n${protocol.slice(markerIndex)}`;
fs.writeFileSync('docs/coordinates/coordinate-control-protocol.md', protocol);

writeJson('reports/visitoslo-bjorvika-audit-20260721/production-final.json', {
  createdAt: DATE,
  sourceScope: 'VisitOSLO Bjørvika first 30 visible results',
  produced: batches.map((p) => ({
    placeId: p.id,
    category: p.category,
    batch: p.batch,
    coordinateStatus: p.status,
    sourceObjectId: p.sourceObjectId
  })),
  protocolCountBefore: oldCount,
  protocolCountAfter: newCount,
  representationLocks: Object.fromEntries(places.map((p) => [p.id, p.representation])),
  validationBasis: {
    sourceProductionBranch: SOURCE_PRODUCTION,
    sourceIntakeBranch: SOURCE_INTAKE,
    note: 'Place and evidence payloads are copied unchanged from the previously fully validated production branch; manifests, protocol batches and runtime state are rebuilt on current main.'
  }
});

console.log(JSON.stringify({
  ok: true,
  firstBatch,
  lastBatch: firstBatch + 3,
  countBefore: oldCount,
  countAfter: newCount,
  produced: batches.map((p) => ({ id: p.id, batch: p.batch, sourceObjectId: p.sourceObjectId }))
}, null, 2));
