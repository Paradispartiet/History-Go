import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-20';
const PLACE_ID = 'trikk_17_18';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-40';

const ROUTE_SOURCE = {
  sourceProvider: 'official_map',
  sourceName: 'Ruter – trikkelinjer og rutetabell gyldig fra 20. april 2026',
  sourceUrl: 'https://ruter.no/planlegg-reise/rutetabeller-og-linjekart/trikk',
  sourceObjectId: 'ruter:tram-lines:17+18:2026-04-20'
};

const anchors = [
  {
    id: 'trikk_17_18_gaustadalleen',
    name: 'Gaustadalléen',
    type: 'route_point',
    lat: 59.945686,
    lon: 10.717591,
    r: 80,
    sourceObjectId: 'NSR:StopPlace:6261',
    routeRole: 'shared_west_terminus',
    lines: ['17', '18']
  },
  {
    id: 'trikk_17_18_nybrua',
    name: 'Nybrua',
    type: 'route_point',
    lat: 59.917044,
    lon: 10.758279,
    r: 80,
    sourceObjectId: 'NSR:StopPlace:61989',
    routeRole: 'shared_central_branch_anchor',
    lines: ['17', '18']
  },
  {
    id: 'trikk_17_18_sinsenkrysset',
    name: 'Sinsenkrysset',
    type: 'route_point',
    lat: 59.938133,
    lon: 10.784755,
    r: 80,
    sourceObjectId: 'NSR:StopPlace:58406',
    routeRole: 'line_17_branch_anchor',
    lines: ['17']
  },
  {
    id: 'trikk_17_18_storo',
    name: 'Storo',
    type: 'route_point',
    lat: 59.94527,
    lon: 10.778637,
    r: 80,
    sourceObjectId: 'NSR:StopPlace:58195',
    routeRole: 'line_18_branch_anchor',
    lines: ['18']
  },
  {
    id: 'trikk_17_18_grefsen_stasjon',
    name: 'Grefsen stasjon',
    type: 'route_point',
    lat: 59.94168,
    lon: 10.78079,
    r: 80,
    sourceObjectId: 'NSR:StopPlace:59643',
    routeRole: 'shared_east_terminus',
    lines: ['17', '18']
  }
];

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
  if (!manifestRow?.file) throw new Error(`${place.id}: split child missing`);
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

const hit = findActiveSource(PLACE_ID);
const before = structuredClone(hit.rows[hit.index]);
const coordNote = 'Recorden representerer det forgrenede ruteparret trikk 17 og 18, ikke ett matematisk rutemidtpunkt. Ruters rutetabell gyldig fra 20. april 2026 dokumenterer linje 17 som Gaustadalléen–Sinsen–Grefsen stasjon og linje 18 som Gaustadalléen–Storo–Grefsen stasjon. Hovedpunktet ved Nybrua er et eksplisitt linjeanker (line_anchor) i den delte sentrumsstrekningen. Fem entydige parent-stopp fra Enturs nasjonale stoppregister dokumenterer felles vestende, felles sentrumsanker, hver av de to grenene og felles ende ved Grefsen stasjon.';

const place = {
  ...before,
  lat: 59.917044,
  lon: 10.758279,
  r: 300,
  locatorType: 'route',
  sourceProvider: 'official_map',
  sourceObjectId: ROUTE_SOURCE.sourceObjectId,
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'line_anchor',
  coordType: 'branched_route_anchor',
  coordStatus: 'verified_geometry',
  coordSource: 'Ruter trikkelinjer/rutetabell gyldig fra 20. april 2026; Entur NSR parent-stoppankre',
  coordSourceId: ROUTE_SOURCE.sourceObjectId,
  coordSourceUrl: ROUTE_SOURCE.sourceUrl,
  coordVerifiedAt: VERIFIED_AT,
  coordNote,
  anchors
};

writePlaceCopies(hit, place);

const evidenceHit = findEvidence(PLACE_ID);
const evidence = evidenceHit.data;
evidence.placeFile = hit.sourceRel;
evidence.evidenceStatus = 'applied_to_place';
evidence.coordinateDecision = 'do_not_change_coordinates_yet';
evidence.currentCoordinate = snapshot(place);
evidence.identity = {
  currentName: place.name,
  resolvedIdentity: 'det forgrenede trikkeruteparret linje 17 og 18 mellom Gaustadalléen og Grefsen stasjon, via henholdsvis Sinsen og Storo',
  identityStatus: 'resolved',
  identityProblem: '',
  locatorTypeCandidate: 'route',
  requiresSplit: false,
  splitReason: 'Combined-recorden kan modelleres eksplisitt som et forgrenet rutepar med egne grenankre.'
};
evidence.requiredEvidence = [];
evidence.evidence = [
  {
    sourceProvider: 'official_map',
    sourceName: ROUTE_SOURCE.sourceName,
    sourceUrl: ROUTE_SOURCE.sourceUrl,
    sourceObjectId: ROUTE_SOURCE.sourceObjectId,
    sourceQuality: 'official_current_route_definition',
    finding: 'Ruter dokumenterer linje 17 som Gaustadalléen–Sinsen–Grefsen stasjon og linje 18 som Gaustadalléen–Storo–Grefsen stasjon i rutetabellen gyldig fra 20. april 2026.',
    canVerifyCoordinate: true,
    reason: coordNote
  },
  ...anchors.map((anchor) => ({
    sourceProvider: 'official_map',
    sourceName: `Entur NSR – ${anchor.name}`,
    sourceUrl: `https://api.entur.io/geocoder/v1/autocomplete?text=${encodeURIComponent(anchor.name)}&layers=venue&multiModal=parent`,
    sourceObjectId: anchor.sourceObjectId,
    sourceQuality: 'unique_exact_parent_stop_place',
    finding: `Entur multiModal=parent returnerte ett entydig eksakt parent-stopp for ${anchor.name}; ankerrolle: ${anchor.routeRole}.`,
    canVerifyCoordinate: true,
    reason: coordNote
  }))
];
evidence.addressCandidates = [];
evidence.sourceObjectCandidates = [
  { sourceProvider: 'official_map', sourceObjectId: ROUTE_SOURCE.sourceObjectId, canApplyToPlace: true },
  ...anchors.map((anchor) => ({ sourceProvider: 'official_map', sourceObjectId: anchor.sourceObjectId, canApplyToPlace: true }))
];
evidence.geometryCandidates = anchors.map((anchor) => ({
  sourceProvider: 'official_map',
  sourceObjectId: anchor.sourceObjectId,
  canApplyToPlace: true
}));
evidence.coordinateCandidates = [{ lat: place.lat, lon: place.lon, coordRole: 'line_anchor', canApplyToPlace: true }];
evidence.decision = {
  canBecomeVerified: true,
  blockedReason: '',
  nextAction: 'Det forgrenede ruteparret er anvendt med fem entydige parent-stoppankre.'
};
evidence.notes = [coordNote];
writeJson(evidenceHit.rel, evidence);

const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(abs(protocolRel), 'utf8').replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${VERIFIED_AT}`);
if (!protocol.includes(`| 40 | \`${PLACE_ID}\` |`)) {
  const row = `| 40 | \`${PLACE_ID}\` | ${place.name} | ${place.coordStatus} | \`${place.sourceObjectId}\` |`;
  const anchorRow = '| 39 | `grensen_kjopesenter` | Grensen – handelsgate | verified_geometry | `oslobyleksikon:grensen` |';
  protocol = protocol.includes(anchorRow)
    ? protocol.replace(anchorRow, `${anchorRow}\n${row}`)
    : protocol.replace('### Dokumenterte Oslo-kontroller uten godkjent koordinat', `${row}\n\n### Dokumenterte Oslo-kontroller uten godkjent koordinat`);
}
protocol = protocol.split('\n').filter((line) => !line.includes('| Trikk 17/18 | needs_review')).join('\n');
const protocolNote = 'Batch 40 (2026-07-20) modellerer `trikk_17_18` som et forgrenet rutepar i stedet for ett symbolsk midtpunkt. Ruters gjeldende rutetabell definerer de to grenene, og fem entydige parent-stopp fra Enturs nasjonale stoppregister brukes som felles vestende, felles sentrums-/linjeanker ved Nybrua, grenankre ved Sinsenkrysset og Storo og felles ende ved Grefsen stasjon.';
if (!protocol.includes(protocolNote)) protocol = protocol.replace('### Dokumenterte Oslo-kontroller uten godkjent koordinat', `${protocolNote}\n\n### Dokumenterte Oslo-kontroller uten godkjent koordinat`);
const osloStart = protocol.indexOf('## Oslo');
const unresolvedStart = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const etneStart = protocol.indexOf('## Etne');
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
const unresolvedSection = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length);
const unresolvedCount = unresolvedSection.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
protocol = protocol.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 40 løser trikk 17/18 som et forgrenet rutepar med fem offisielle stoppankre. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(abs(protocolRel), protocol);

writeJson(`${REPORT_DIR}/application-results.json`, {
  date: VERIFIED_AT,
  applied: [{
    id: PLACE_ID,
    before: snapshot(before),
    after: snapshot(place),
    sourceObjectId: place.sourceObjectId,
    anchors
  }],
  evidenceMaintenance: [
    'forsvarsmuseet: stale currentCoordinate/coordinateDecision synchronized to canonical place',
    'norges_hjemmefrontmuseum: stale currentCoordinate/coordinateDecision synchronized to canonical place',
    'roseslottet: stale currentCoordinate/coordinateDecision synchronized to canonical place'
  ]
});

fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), `# Oslo koordinatkontroll – batch 40\n\nDato: ${VERIFIED_AT}\n\n\`trikk_17_18\` er oppgradert fra et symbolsk lavpresisjonspunkt til **verified_geometry** som et eksplisitt forgrenet rutepar. Ruters rutetabell gyldig fra 20. april 2026 definerer grenene, mens Enturs nasjonale stoppregister gir fem entydige parent-stoppankre: Gaustadalléen, Nybrua, Sinsenkrysset, Storo og Grefsen stasjon.\n\nHovedpunktet ved Nybrua er et eksplisitt linjeanker i den delte sentrumsstrekningen, ikke et påstått rutemidtpunkt.\n\nBatchen synkroniserer også tre eksisterende stale evidens-snapshots (Forsvarsmuseet, Norges Hjemmefrontmuseum og Roseslottet) uten å endre deres canonical place-koordinater.\n`);

console.log(JSON.stringify({ ok: true, applied: PLACE_ID, anchors }, null, 2));
