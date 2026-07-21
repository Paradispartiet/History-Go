import fs from 'node:fs';

const read = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const write = (filePath, value) => fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);

const placeEntries = [
  'places/historie/oslo/places_historie/bygdoy_kongsgard.json',
  'places/historie/oslo/places_historie/oscarshall.json',
  'places/historie/oslo/places_historie/vikingtidsmuseet.json',
];
const evidenceEntries = [
  'oslo/historie/bygdoy_kongsgard.json',
  'oslo/historie/oscarshall.json',
  'oslo/historie/vikingtidsmuseet.json',
];

const placeManifestPath = 'data/places/manifest.json';
const placeManifest = read(placeManifestPath);
for (const entry of placeEntries) {
  if (!placeManifest.files.includes(entry)) placeManifest.files.push(entry);
}
write(placeManifestPath, placeManifest);

const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const evidenceManifest = read(evidenceManifestPath);
for (const entry of evidenceEntries) {
  if (!evidenceManifest.files.includes(entry)) evidenceManifest.files.push(entry);
}
write(evidenceManifestPath, evidenceManifest);

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(protocolPath, 'utf8');
const ids = ['bygdoy_kongsgard', 'oscarshall', 'vikingtidsmuseet'];
if (ids.some((id) => protocol.includes(`\`${id}\``))) {
  throw new Error('One or more VisitOSLO Bygdøy production IDs are already registered.');
}

const osloStart = protocol.indexOf('## Oslo');
const nextHeading = protocol.indexOf('\n## ', osloStart + 7);
const osloBlock = nextHeading === -1 ? protocol.slice(osloStart) : protocol.slice(osloStart, nextHeading);
const batches = [...osloBlock.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
if (!batches.length) throw new Error('Could not determine current Oslo batch maximum.');
const firstBatch = Math.max(...batches) + 1;
const lastBatch = firstBatch + 2;

const summaryRe = /^Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\..*$/m;
const summaryMatch = protocol.match(summaryRe);
if (!summaryMatch) throw new Error('Could not locate current Oslo summary.');
const oldCount = Number(summaryMatch[1]);
const newCount = oldCount + 3;
protocol = protocol.replace(
  summaryRe,
  `Oslo-tabellen inneholder nå ${newCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${firstBatch}–${lastBatch} legger til Bygdø Kongsgård med eksakt navngitt besøksobjekt, Oscarshall med eksakt bygningsgeometri og Vikingtidsmuseet med entydig offisielt adressepunkt for den sammenhengende museumssiten. Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`,
);

const rows = [
  `| ${firstBatch} | \`bygdoy_kongsgard\` | Bygdø Kongsgård | verified_geometry | \`osm-node:6593517797\` |`,
  `| ${firstBatch + 1} | \`oscarshall\` | Oscarshall | verified_geometry | \`osm-way:150542667\` |`,
  `| ${firstBatch + 2} | \`vikingtidsmuseet\` | Vikingtidsmuseet | verified | \`geonorge-adresser-v1:0301:13153:35\` |`,
].join('\n');
const marker = '\nRelevante korrigerende merger for de første Oslo-batchene:';
if (!protocol.includes(marker)) throw new Error('Could not locate Oslo table end marker.');
protocol = protocol.replace(marker, `\n${rows}${marker}`);
fs.writeFileSync(protocolPath, protocol);

fs.mkdirSync('reports/visitoslo-bygdoy-audit-20260721', { recursive: true });
write('reports/visitoslo-bygdoy-audit-20260721/production.json', {
  status: 'generated_on_runner_baseline',
  placeIds: ids,
  firstBatch,
  lastBatch,
  oldOsloControlledCount: oldCount,
  newOsloControlledCount: newCount,
  representationLocks: {
    bygdoy_kongsgard: 'distinct_from_bygdoy_kongsgard_salamanderdam',
    oscarshall: 'palace_primary_no_duplicate_park',
    vikingtidsmuseet: 'single_site_including_historic_vikingskipshuset',
  },
});

console.log(JSON.stringify({ firstBatch, lastBatch, placeIds: ids }, null, 2));
