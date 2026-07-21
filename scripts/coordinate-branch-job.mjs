import fs from 'node:fs';

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(protocolPath, 'utf8');

const osloStart = protocol.indexOf('## Oslo');
const correctionsMarker = protocol.indexOf('\nRelevante korrigerende merger for de første Oslo-batchene:', osloStart);
if (osloStart < 0 || correctionsMarker < 0) throw new Error('Fant ikke canonical Oslo-hovedtabell.');
const primarySection = protocol.slice(osloStart, correctionsMarker);
const primaryRows = [...primarySection.matchAll(/^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|/gm)];
const primaryIds = new Set(primaryRows.map((match) => match[2]));

const reviewStart = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const reviewEnd = protocol.indexOf('\n## ', reviewStart + 4);
if (reviewStart < 0 || reviewEnd < 0) throw new Error('Fant ikke canonical Oslo needs_review-tabell.');
const reviewSection = protocol.slice(reviewStart, reviewEnd);
const reviewRows = [...reviewSection.matchAll(/^\| `([^`]+)`/gm)];
const reviewIds = new Set(reviewRows.map((match) => match[1]));

const allControlledIds = new Set([...primaryIds, ...reviewIds]);
if (allControlledIds.size < primaryIds.size) throw new Error('Ugyldig union av Oslo-tabellene.');
if (!/Neste nye Oslo-kontroll er batch 115\./.test(protocol)) throw new Error('Forventet batch 115 som neste arbeid.');

protocol = protocol.replace(
  /Oslo-tabellen inneholder nå \d+ dokumenterte/,
  `Oslo-tabellen inneholder nå ${allControlledIds.size} dokumenterte`
);
fs.writeFileSync(protocolPath, protocol);

console.log(JSON.stringify({
  primaryVerifiedOrControlledPlaceIds: primaryIds.size,
  needsReviewPlaceIds: reviewIds.size,
  overlap: [...reviewIds].filter((id) => primaryIds.has(id)).length,
  uniqueVerifiedOrControlledPlaceIds: allControlledIds.size,
  primaryRowCount: primaryRows.length,
  reviewRowCount: reviewRows.length,
  nextBatch: 115
}, null, 2));
