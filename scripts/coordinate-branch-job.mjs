import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-20';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-39';
const PLACE_ID = 'grensen_kjopesenter';
const OSM_SEGMENTS = ['osm-way:67882889', 'osm-way:179095459', 'osm-way:696754516'];

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}
function sha256File(rel) { return crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex'); }
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data.id === 'string') return [data];
  return [];
}
function snapshot(place) {
  return {
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    coordStatus: place.coordStatus ?? '',
    coordSource: place.coordSource ?? '',
    coordType: place.coordType ?? '',
    coordNote: place.coordNote ?? ''
  };
}
function splitManifestRel(sourceRel) {
  const p = path.parse(sourceRel);
  return path.join(p.dir, `${p.name}_manifest${p.ext || '.json'}`).replace(/\\/g, '/');
}
function splitIndexRel(sourceRel) {
  const p = path.parse(sourceRel);
  return path.join(p.dir, `${p.name}_index${p.ext || '.json'}`).replace(/\\/g, '/');
}

function findActiveSource(placeId) {
  const hits = [];
  for (const entry of readJson(PLACE_MANIFEST).files || []) {
    const rel = `data/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    const data = readJson(rel);
    const rows = rowsFrom(data);
    const index = rows.findIndex((row) => row?.id === placeId);
    if (index >= 0) hits.push({ sourceRel: rel, data, rows, index });
  }
  if (hits.length !== 1) throw new Error(`${placeId}: expected one active source, found ${hits.length}`);
  return hits[0];
}

function writePlaceCopies(hit, place) {
  if (Array.isArray(hit.data)) hit.data[hit.index] = place;
  else if (Array.isArray(hit.data.places)) hit.data.places[hit.index] = place;
  else if (Array.isArray(hit.data.items)) hit.data.items[hit.index] = place;
  else Object.assign(hit.data, place);
  writeJson(hit.sourceRel, hit.data);

  const manifestRel = splitManifestRel(hit.sourceRel);
  if (!fs.existsSync(abs(manifestRel))) return;
  const splitManifest = readJson(manifestRel);
  const manifestRow = (splitManifest.places || []).find((row) => row?.id === place.id);
  if (!manifestRow?.file) throw new Error(`${place.id}: split child missing from ${manifestRel}`);
  const childRel = path.join(path.dirname(manifestRel), manifestRow.file).replace(/\\/g, '/');
  writeJson(childRel, place);
  manifestRow.sha256 = sha256File(childRel);
  if (splitManifest.source_sha256 !== undefined) splitManifest.source_sha256 = sha256File(hit.sourceRel);
  if (splitManifest.generated_at !== undefined) splitManifest.generated_at = new Date().toISOString();
  writeJson(manifestRel, splitManifest);

  const indexRel = splitIndexRel(hit.sourceRel);
  if (!fs.existsSync(abs(indexRel))) return;
  const indexData = readJson(indexRel);
  const indexRow = rowsFrom(indexData).find((row) => row?.id === place.id);
  if (!indexRow) return;
  const fields = [
    'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole',
    'coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordPrecisionM','coordVerifiedAt',
    'coordNote','geometry','anchors'
  ];
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(place, field)) indexRow[field] = place[field];
    else if (Object.prototype.hasOwnProperty.call(indexRow, field)) delete indexRow[field];
  }
  writeJson(indexRel, indexData);
}

function findEvidence(placeId) {
  const manifest = readJson(EVIDENCE_MANIFEST);
  const hits = [];
  for (const entry of manifest.files || []) {
    const rel = `data/coordinate-evidence/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    const data = readJson(rel);
    if (data?.placeId === placeId) hits.push({ rel, data });
  }
  if (hits.length !== 1) throw new Error(`${placeId}: expected one evidence file, found ${hits.length}`);
  return hits[0];
}

function updateEvidence(place, sourceRel) {
  const hit = findEvidence(PLACE_ID);
  const e = hit.data;
  e.placeFile = sourceRel;
  e.evidenceStatus = 'applied_to_place';
  e.coordinateDecision = 'do_not_change_coordinates_yet';
  e.currentCoordinate = snapshot(place);
  e.identity = {
    currentName: place.name,
    resolvedIdentity: 'gaten Grensen fra Møllergata ved Stortorvet til Professor Aschehougs plass',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'street',
    requiresSplit: false,
    splitReason: ''
  };
  e.requiredEvidence = [];
  e.evidence = [
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Grensen',
      sourceUrl: 'https://oslobyleksikon.no/side/Grensen',
      sourceObjectId: 'oslobyleksikon:grensen',
      sourceQuality: 'documented_linear_identity',
      finding: 'Kilden avgrenser Grensen som gate fra Møllergata ved Stortorvet til Professor Aschehougs plass og dokumenterer den som historisk handelsgate.',
      canVerifyCoordinate: true,
      reason: place.coordNote
    },
    ...OSM_SEGMENTS.map((sourceObjectId) => ({
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap ${sourceObjectId} – Grensen`,
      sourceUrl: `https://www.openstreetmap.org/way/${sourceObjectId.split(':')[1]}`,
      sourceObjectId,
      sourceQuality: 'exact_named_street_segment_geometry',
      finding: 'Segmentet er eksplisitt navngitt Grensen. Segmentene omfatter fysisk oppdelte/parallelle kjørebaner og brukes derfor som segmentdokumentasjon sammen med to lineære endeankre, ikke som én falskt sammenhengende polyline.',
      canVerifyCoordinate: true,
      reason: place.coordNote
    }))
  ];
  e.addressCandidates = [];
  e.sourceObjectCandidates = OSM_SEGMENTS.map((sourceObjectId) => ({ sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true }));
  e.geometryCandidates = OSM_SEGMENTS.map((sourceObjectId) => ({ sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true }));
  e.coordinateCandidates = [{ lat: place.lat, lon: place.lon, coordRole: 'line_anchor', canApplyToPlace: true }];
  e.decision = { canBecomeVerified: true, blockedReason: '', nextAction: 'Gateidentitet er normalisert og kildebelagte endepunkter/segmenter er anvendt.' };
  e.notes = [place.coordNote];
  writeJson(hit.rel, e);
}

function updateProtocol(place) {
  const rel = 'docs/coordinates/coordinate-control-protocol.md';
  let text = fs.readFileSync(abs(rel), 'utf8');
  text = text.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${VERIFIED_AT}`);

  if (!text.includes(`| 39 | \`${PLACE_ID}\` |`)) {
    const row = `| 39 | \`${PLACE_ID}\` | ${place.name} | ${place.coordStatus} | \`${place.sourceObjectId}\` |`;
    const anchor = '| 38 | `st_halvard_bryggeri` | St. Halvard bryggeri | verified_historical_source | `oslobyleksikon:st-halvards-bryggeri` |';
    text = text.includes(anchor)
      ? text.replace(anchor, `${anchor}\n${row}`)
      : text.replace('### Dokumenterte Oslo-kontroller uten godkjent koordinat', `${row}\n\n### Dokumenterte Oslo-kontroller uten godkjent koordinat`);
  }

  text = text.split('\n').filter((line) => !line.includes('| Grensen – historisk handelsgate | needs_review')).join('\n');
  const note = 'Batch 39 (2026-07-20) normaliserer `grensen_kjopesenter` til den faktiske lineære gaten Grensen. Oslo byleksikon avgrenser gaten fra Møllergata ved Stortorvet til Professor Aschehougs plass; tre eksakte navngitte OSM-way-segmenter dokumenterer gateløpet, men parallelle kjørebaner modelleres ikke som én falskt sammenhengende polyline. To kildebelagte endeankre og et representativt line_anchor brukes. `ring_3` forblir needs_review: research fant flere likeverdige komponentobjekter ved flere kryss og manglet et entydig Ullevål-anker, så ingen vilkårlig ankerkjede er godkjent.';
  if (!text.includes(note)) text = text.replace('### Dokumenterte Oslo-kontroller uten godkjent koordinat', `${note}\n\n### Dokumenterte Oslo-kontroller uten godkjent koordinat`);

  const osloStart = text.indexOf('## Oslo');
  const unresolvedStart = text.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
  const etneStart = text.indexOf('## Etne');
  const verifiedCount = (text.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
  const unresolvedSection = text.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : text.length);
  const unresolvedCount = unresolvedSection.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
  text = text.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 39 normaliserer Grensen som lineær handelsgate med kildebelagte endeankre, mens Ring 3 holdes tilbake til en entydig ruteankermodell. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
  text = text.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
  fs.writeFileSync(abs(rel), text);
}

const hit = findActiveSource(PLACE_ID);
const before = structuredClone(hit.rows[hit.index]);
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
  coordNote: 'Recorden representerer gaten Grensen, ikke et kjøpesenter eller ett knutepunkt. Oslo byleksikon avgrenser gaten fra Møllergata ved Stortorvet til Professor Aschehougs plass. History Go bruker et representativt line_anchor mellom de to dokumenterte gateendene. Tre eksakte OSM-way-segmenter med navnet Grensen dokumenterer den fysiske gaten; fordi østlige deler er modellert som parallelle kjørebaner og ikke deler alle noder med vestsegmentet, behandles de som segmentgeometri og ikke som én kunstig sammenhengende polyline.',
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

writePlaceCopies(hit, place);
updateEvidence(place, hit.sourceRel);
updateProtocol(place);
writeJson(`${REPORT_DIR}/application-results.json`, {
  date: VERIFIED_AT,
  applied: [{ id: PLACE_ID, before: snapshot(before), after: snapshot(place), sourceObjectId: place.sourceObjectId, segmentObjectIds: OSM_SEGMENTS, anchors: place.anchors }],
  unchanged: [{ id: 'ring_3', result: 'unchanged_needs_review', reason: 'Anchor research returned multiple equivalent road components at several named junctions, no Ullevål result, and no unambiguous complete route-anchor chain.' }]
});
fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), `# Oslo koordinatkontroll – batch 39\n\nDato: ${VERIFIED_AT}\n\n- \`grensen_kjopesenter\` er normalisert til **Grensen – handelsgate** og får \`verified_geometry\` som lineært gateobjekt. Oslo byleksikon avgrenser gateløpet; tre eksakte OSM-way-segmenter dokumenterer fysisk gategeometri, mens to endeankre brukes fordi parallelle kjørebaner ikke skal tvinges inn i én falsk polyline.\n- \`ring_3\` forblir **needs_review**. Researchen fant flere likeverdige trafikkobjekter ved Smestad, Storo og Sinsen, to Granfosstunnel-way-er og intet entydig Ullevål-treff. Ingen vilkårlig ruteankerkjede godkjennes.\n\nAlle canonical kopier, split-manifest, runtime index, evidens og protokoll synkroniseres i samme runner-pass.\n`);
console.log(JSON.stringify({ ok: true, applied: PLACE_ID, unchanged: 'ring_3' }, null, 2));
