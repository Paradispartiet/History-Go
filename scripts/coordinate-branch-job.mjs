import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-20';
const PLACE_ID = 'grensen_kjopesenter';
const SOURCE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const EVIDENCE = 'data/coordinate-evidence/oslo/naeringsliv/grensen_kjopesenter.json';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-39';
const SEGMENTS = ['osm-way:67882889', 'osm-way:179095459', 'osm-way:696754516'];

const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, data) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
};
const sha256 = (rel) => crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex');
const rowsFrom = (data) => Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : Array.isArray(data?.items) ? data.items : data?.id ? [data] : [];
const snapshot = (p) => ({ lat: p.lat ?? null, lon: p.lon ?? null, r: p.r ?? null, coordStatus: p.coordStatus ?? '', coordSource: p.coordSource ?? '', coordType: p.coordType ?? '', coordNote: p.coordNote ?? '' });

const aggregate = readJson(SOURCE);
const rows = rowsFrom(aggregate);
const idx = rows.findIndex((p) => p?.id === PLACE_ID);
if (idx < 0) throw new Error(`${PLACE_ID} missing from ${SOURCE}`);
const before = structuredClone(rows[idx]);

const coordNote = 'Recorden representerer gaten Grensen, ikke et kjøpesenter eller ett knutepunkt. Oslo byleksikon avgrenser gaten fra Møllergata ved Stortorvet til Professor Aschehougs plass. History Go bruker et representativt linjeanker (line_anchor) mellom de to dokumenterte gateendene. Tre eksakte OSM-way-segmenter med navnet Grensen dokumenterer den fysiske gaten; fordi østlige deler er modellert som parallelle kjørebaner og ikke deler alle noder med vestsegmentet, behandles de som segmentgeometri og ikke som én kunstig sammenhengende polyline.';

const place = {
  ...before,
  name: 'Grensen – handelsgate',
  lat: 59.91337935,
  lon: 10.74439645,
  r: 170,
  locatorType: 'street',
  sourceProvider: 'manual_research',
  sourceObjectId: 'oslobyleksikon:grensen',
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'line_anchor',
  coordType: 'street_midpoint',
  coordStatus: 'verified_geometry',
  coordSource: 'Oslo byleksikon – Grensen; OpenStreetMap ways 67882889, 179095459 og 696754516',
  coordSourceId: 'oslobyleksikon:grensen',
  coordSourceUrl: 'https://oslobyleksikon.no/side/Grensen',
  coordVerifiedAt: VERIFIED_AT,
  coordNote,
  anchors: [
    {
      id: 'grensen_nordvest_professor_aschehougs_plass',
      name: 'Grensen nordvest – Professor Aschehougs plass',
      type: 'route_point',
      lat: 59.9140357,
      lon: 10.7426391,
      r: 55,
      sourceObjectId: 'osm-node:1180721060'
    },
    {
      id: 'grensen_sorost_stortorvet_mollergata',
      name: 'Grensen sørøst – Møllergata ved Stortorvet',
      type: 'route_point',
      lat: 59.912723,
      lon: 10.7461538,
      r: 55,
      sourceObjectId: 'osm-node:1894342703'
    }
  ]
};
if (place.quiz_profile) {
  place.quiz_profile = structuredClone(place.quiz_profile);
  place.quiz_profile.place_type = 'gate';
  place.quiz_profile.subtype = 'historisk_handelsgate';
  place.quiz_profile.signature_features = [
    'historisk handelsgate mellom Stortorvet og Professor Aschehougs plass',
    'tett sentrumshandel og vareflyt langs et kort lineært gateløp',
    'fysisk gatestruktur dokumentert med flere OSM-segmenter og to endeankre'
  ];
  place.quiz_profile.notes = 'Spør Grensen som historisk handelsgate og lineært byrom, ikke som kjøpesenter eller generisk knutepunkt.';
}
rows[idx] = place;
writeJson(SOURCE, aggregate);

const parsed = path.parse(SOURCE);
const manifestRel = path.join(parsed.dir, `${parsed.name}_manifest.json`).replace(/\\/g, '/');
const splitManifest = readJson(manifestRel);
const manifestRow = splitManifest.places.find((row) => row?.id === PLACE_ID);
if (!manifestRow?.file) throw new Error('Grensen split child missing');
const childRel = path.join(path.dirname(manifestRel), manifestRow.file).replace(/\\/g, '/');
writeJson(childRel, place);
manifestRow.sha256 = sha256(childRel);
if (splitManifest.source_sha256 !== undefined) splitManifest.source_sha256 = sha256(SOURCE);
if (splitManifest.generated_at !== undefined) splitManifest.generated_at = new Date().toISOString();
writeJson(manifestRel, splitManifest);

const indexRel = path.join(parsed.dir, `${parsed.name}_index.json`).replace(/\\/g, '/');
if (fs.existsSync(abs(indexRel))) {
  const indexData = readJson(indexRel);
  const indexRow = rowsFrom(indexData).find((row) => row?.id === PLACE_ID);
  if (indexRow) {
    for (const field of ['lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote','anchors']) {
      if (Object.prototype.hasOwnProperty.call(place, field)) indexRow[field] = place[field];
      else if (Object.prototype.hasOwnProperty.call(indexRow, field)) delete indexRow[field];
    }
    writeJson(indexRel, indexData);
  }
}

const evidence = readJson(EVIDENCE);
evidence.placeFile = SOURCE;
evidence.evidenceStatus = 'applied_to_place';
evidence.coordinateDecision = 'do_not_change_coordinates_yet';
evidence.currentCoordinate = snapshot(place);
evidence.identity = {
  currentName: place.name,
  resolvedIdentity: 'gaten Grensen fra Møllergata ved Stortorvet til Professor Aschehougs plass',
  identityStatus: 'resolved',
  identityProblem: '',
  locatorTypeCandidate: 'street',
  requiresSplit: false,
  splitReason: ''
};
evidence.requiredEvidence = [];
evidence.evidence = [
  {
    sourceProvider: 'manual_research',
    sourceName: 'Oslo byleksikon – Grensen',
    sourceUrl: 'https://oslobyleksikon.no/side/Grensen',
    sourceObjectId: 'oslobyleksikon:grensen',
    sourceQuality: 'documented_linear_identity',
    finding: 'Kilden avgrenser Grensen som gate fra Møllergata ved Stortorvet til Professor Aschehougs plass og dokumenterer den som historisk handelsgate.',
    canVerifyCoordinate: true,
    reason: coordNote
  },
  ...SEGMENTS.map((sourceObjectId) => ({
    sourceProvider: 'osm',
    sourceName: `OpenStreetMap ${sourceObjectId} – Grensen`,
    sourceUrl: `https://www.openstreetmap.org/way/${sourceObjectId.split(':')[1]}`,
    sourceObjectId,
    sourceQuality: 'exact_named_street_segment_geometry',
    finding: 'Eksakt navngitt Grensen-segment; parallelle kjørebaner behandles som segmentdokumentasjon sammen med lineære endeankre.',
    canVerifyCoordinate: true,
    reason: coordNote
  }))
];
evidence.addressCandidates = [];
evidence.sourceObjectCandidates = SEGMENTS.map((sourceObjectId) => ({ sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true }));
evidence.geometryCandidates = SEGMENTS.map((sourceObjectId) => ({ sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true }));
evidence.coordinateCandidates = [{ lat: place.lat, lon: place.lon, coordRole: 'line_anchor', canApplyToPlace: true }];
evidence.decision = { canBecomeVerified: true, blockedReason: '', nextAction: 'Gateidentitet er normalisert og kildebelagte endeankre/segmenter er anvendt.' };
evidence.notes = [coordNote];
writeJson(EVIDENCE, evidence);

const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(abs(protocolRel), 'utf8').replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${VERIFIED_AT}`);
if (!protocol.includes(`| 39 | \`${PLACE_ID}\` |`)) {
  const row = `| 39 | \`${PLACE_ID}\` | ${place.name} | ${place.coordStatus} | \`${place.sourceObjectId}\` |`;
  const anchor = '| 38 | `st_halvard_bryggeri` | St. Halvard bryggeri | verified_historical_source | `oslobyleksikon:st-halvards-bryggeri` |';
  protocol = protocol.includes(anchor) ? protocol.replace(anchor, `${anchor}\n${row}`) : protocol.replace('### Dokumenterte Oslo-kontroller uten godkjent koordinat', `${row}\n\n### Dokumenterte Oslo-kontroller uten godkjent koordinat`);
}
protocol = protocol.split('\n').filter((line) => !line.includes('| Grensen – historisk handelsgate | needs_review')).join('\n');
const protocolNote = 'Batch 39 (2026-07-20) normaliserer `grensen_kjopesenter` til den faktiske lineære gaten Grensen. Oslo byleksikon avgrenser gaten fra Møllergata ved Stortorvet til Professor Aschehougs plass; tre eksakte navngitte OSM-way-segmenter dokumenterer gateløpet, men parallelle kjørebaner modelleres ikke som én falskt sammenhengende polyline. To kildebelagte endeankre og et representativt linjeanker brukes. `ring_3` forblir needs_review fordi research ikke ga en entydig komplett ruteankerkjede.';
if (!protocol.includes(protocolNote)) protocol = protocol.replace('### Dokumenterte Oslo-kontroller uten godkjent koordinat', `${protocolNote}\n\n### Dokumenterte Oslo-kontroller uten godkjent koordinat`);
const osloStart = protocol.indexOf('## Oslo');
const unresolvedStart = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const etneStart = protocol.indexOf('## Etne');
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
const unresolvedSection = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length);
const unresolvedCount = unresolvedSection.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
protocol = protocol.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 39 normaliserer Grensen som lineær handelsgate med kildebelagte endeankre, mens Ring 3 holdes tilbake til en entydig ruteankermodell. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(abs(protocolRel), protocol);

writeJson(`${REPORT_DIR}/application-results.json`, {
  date: VERIFIED_AT,
  applied: [{ id: PLACE_ID, before: snapshot(before), after: snapshot(place), sourceObjectId: place.sourceObjectId, segmentObjectIds: SEGMENTS, anchors: place.anchors }],
  unchanged: [{ id: 'ring_3', result: 'unchanged_needs_review', reason: 'Research did not yield an unambiguous complete route-anchor chain.' }]
});
fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), `# Oslo koordinatkontroll – batch 39\n\nDato: ${VERIFIED_AT}\n\n- \`grensen_kjopesenter\` er normalisert til **Grensen – handelsgate** og får \`verified_geometry\` som lineært gateobjekt med to kildebelagte endeankre og et eksplisitt linjeanker. Tre eksakte OSM-way-segmenter dokumenterer gategeometrien uten at parallelle kjørefelt tvinges inn i én falsk polyline.\n- \`ring_3\` forblir **needs_review** fordi researchen ikke ga en entydig komplett ruteankerkjede.\n`);

console.log(JSON.stringify({ ok: true, applied: PLACE_ID, unchanged: 'ring_3' }, null, 2));
