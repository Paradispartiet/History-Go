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

if (!/Neste nye Oslo-kontroll er batch 116\./.test(protocol)) {
  throw new Error('Forventet batch 116 som neste arbeid etter den parallelle Holmenkollen-batchen.');
}

protocol = protocol.replace(
  /Oslo-tabellen inneholder nå \d+ dokumenterte/,
  `Oslo-tabellen inneholder nå ${allControlledIds.size} dokumenterte`
);

const staleNextSource = '- `places_oslo_natur_salamanderdammer.json` er nå fullt kontrollert i manifestrekkefølge. De eksplisitt splittede Oslo-naturmanifestene er dermed gjennomgått; før batch 115 starter skal resterende unsplit naturkilder auditeres mot `reports/places-unsplit-manifest-audit.json` og allerede kontrollerte placeId-er hoppes over.';
const correctedNextSource = '- De åtte Oslo-naturfilene i `data/places/manifest.json` er nå fullt kontrollert. Neste aktive manifestkilde er `places/politikk/oslo/places_politikk.json`; tidligere kontrollerte placeId-er skal hoppes over.';
if (!protocol.includes(staleNextSource)) throw new Error('Fant ikke den stale neste-kilde-linjen.');
protocol = protocol.replace(staleNextSource, correctedNextSource);

fs.writeFileSync(protocolPath, protocol);
console.log(JSON.stringify({
  primaryVerifiedOrControlledPlaceIds: primaryIds.size,
  needsReviewPlaceIds: reviewIds.size,
  overlap: [...reviewIds].filter((id) => primaryIds.has(id)).length,
  uniqueVerifiedOrControlledPlaceIds: allControlledIds.size,
  nextBatch: 116,
  nextSource: 'data/places/politikk/oslo/places_politikk.json'
}, null, 2));
