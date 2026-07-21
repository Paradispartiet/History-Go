import fs from 'node:fs';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, v) => fs.writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`);

const placeManifest = read('data/places/manifest.json');
const placeEntry = 'places/historie/oslo/places_historie/bygdoy_kongsgard.json';
if (!placeManifest.files.includes(placeEntry)) placeManifest.files.push(placeEntry);
write('data/places/manifest.json', placeManifest);

const evidenceManifest = read('data/coordinate-evidence/manifest.json');
const evidenceEntry = 'oslo/historie/bygdoy_kongsgard.json';
if (!evidenceManifest.files.includes(evidenceEntry)) evidenceManifest.files.push(evidenceEntry);
write('data/coordinate-evidence/manifest.json', evidenceManifest);

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(protocolPath, 'utf8');
if (protocol.includes('`bygdoy_kongsgard`')) throw new Error('bygdoy_kongsgard already registered');

const osloStart = protocol.indexOf('## Oslo');
const nextHeading = protocol.indexOf('\n## ', osloStart + 7);
const osloBlock = nextHeading === -1 ? protocol.slice(osloStart) : protocol.slice(osloStart, nextHeading);
const batches = [...osloBlock.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
const batch = Math.max(...batches) + 1;

const summaryRe = /^Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\..*$/m;
const match = protocol.match(summaryRe);
if (!match) throw new Error('Oslo summary not found');
const oldCount = Number(match[1]);
protocol = protocol.replace(
  summaryRe,
  `Oslo-tabellen inneholder nå ${oldCount + 1} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${batch} legger til Bygdø Kongsgård med et eksakt navngitt besøksobjekt, kryssjekket mot Kongehusets offisielle identitet og eksplisitt skilt fra salamanderdammen og de brede park-/farmyard-geometriene. Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`,
);
const marker = '\nRelevante korrigerende merger for de første Oslo-batchene:';
if (!protocol.includes(marker)) throw new Error('Oslo table marker not found');
protocol = protocol.replace(
  marker,
  `\n| ${batch} | \`bygdoy_kongsgard\` | Bygdø Kongsgård | verified_geometry | \`osm-node:6593517797\` |${marker}`,
);
fs.writeFileSync(protocolPath, protocol);

fs.mkdirSync('reports/visitoslo-bygdoy-audit-20260721', { recursive: true });
write('reports/visitoslo-bygdoy-audit-20260721/bygdoy-kongsgard-production.json', {
  placeId: 'bygdoy_kongsgard',
  batch,
  oldOsloControlledCount: oldCount,
  newOsloControlledCount: oldCount + 1,
  representationLock: 'distinct_from_bygdoy_kongsgard_salamanderdam',
});

console.log(JSON.stringify({ placeId: 'bygdoy_kongsgard', batch }, null, 2));
