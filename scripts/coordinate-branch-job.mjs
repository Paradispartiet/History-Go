import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-20';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-36';

const corrections = [
  {
    id: 'inger_hagerups_plass',
    lat: 59.9221744,
    lon: 10.853756,
    locatorType: 'square',
    sourceProvider: 'manual_research',
    sourceObjectId: 'lokalhistoriewiki:inger-hagerups-plass',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'area_anchor',
    coordType: 'documented_place_coordinate',
    coordStatus: 'verified',
    coordSource: 'Lokalhistoriewiki – Inger Hagerups plass; identity cross-checked with Oslo byleksikon and Oslo bykart point 2357',
    coordSourceId: 'lokalhistoriewiki:inger-hagerups-plass',
    coordSourceUrl: 'https://lokalhistoriewiki.no/Inger_Hagerups_plass',
    coordNote: 'Oslo byleksikon identifiserer Inger Hagerups plass som snuplassen i enden av Hagapynten og lenker stedet til Oslo bykart point 2357. Lokalhistoriewiki oppgir en eksplisitt kildekoordinat for den samme navngitte plassen. Dette dokumenterte plasspunktet erstatter legacy-koordinaten som lå over to kilometer nord for den faktiske plassen; ingen naboadresse er brukt som proxy.',
    identityEvidence: [
      {
        sourceProvider: 'manual_research',
        sourceName: 'Oslo byleksikon – Inger Hagerups plass',
        sourceUrl: 'https://oslobyleksikon.no/side/Inger_Hagerups_plass',
        sourceObjectId: 'oslobykart:point:2357',
        finding: 'Oslo byleksikon identifiserer plassen som snuplassen i enden av Hagapynten og lenker direkte til Oslo bykart point 2357.'
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'Lokalhistoriewiki – Inger Hagerups plass',
        sourceUrl: 'https://lokalhistoriewiki.no/Inger_Hagerups_plass',
        sourceObjectId: 'lokalhistoriewiki:inger-hagerups-plass',
        finding: 'Lokalhistoriewiki oppgir eksplisitt koordinaten 59.9221744 N, 10.853756 E for den navngitte plassen.'
      }
    ]
  },
  {
    id: 'hartvig_nissens_skole_skam',
    lat: 59.918543,
    lon: 10.7167887,
    locatorType: 'poi',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:325636287',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'site_center',
    coordType: 'school_site_point',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 325636287 – Hartvig Nissens skole',
    coordSourceId: 'osm-node:325636287',
    coordSourceUrl: 'https://www.openstreetmap.org/node/325636287',
    coordNote: "President Harbitz' gate 11 ble tidligere kjørt adresse-first, men ga flere ikke-entydige Geonorge-treff. Oslo byleksikon dokumenterer den historiske skolen og lenker stedet til Oslo bykart point 7165. Det entydige navngitte OSM-skoleobjektet node 325636287 har Oslo kommune som operator og offisielle organisasjons-/skolereferanser, og brukes derfor som objektgeometri-fallback for skoleområdet der SKAM ble spilt inn.",
    identityEvidence: [
      {
        sourceProvider: 'manual_research',
        sourceName: 'Oslo byleksikon – Hartvig Nissens skole',
        sourceUrl: 'https://oslobyleksikon.no/side/Hartvig_Nissens_skole',
        sourceObjectId: 'oslobykart:point:7165',
        finding: "Oslo byleksikon dokumenterer skolen i President Harbitz' gate 11, SKAM-innspillingen og lenker stedet til Oslo bykart point 7165."
      },
      {
        sourceProvider: 'osm',
        sourceName: 'OpenStreetMap node 325636287 – Hartvig Nissens skole',
        sourceUrl: 'https://www.openstreetmap.org/node/325636287',
        sourceObjectId: 'osm-node:325636287',
        finding: 'Det eksakte navngitte amenity=school-objektet identifiserer Hartvig Nissens skole, har Oslo kommune som operator og offisielle organisasjons-/skolereferanser.'
      }
    ]
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
function currentCoordinate(place) {
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
  const manifest = readJson(PLACE_MANIFEST);
  const hits = [];
  for (const entry of manifest.files || []) {
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

function writeAggregateAndSplit(hit, updatedPlace) {
  const data = hit.data;
  if (Array.isArray(data)) data[hit.index] = updatedPlace;
  else if (Array.isArray(data.places)) data.places[hit.index] = updatedPlace;
  else if (Array.isArray(data.items)) data.items[hit.index] = updatedPlace;
  else Object.assign(data, updatedPlace);
  writeJson(hit.sourceRel, data);

  const manifestRel = splitManifestRel(hit.sourceRel);
  if (!fs.existsSync(abs(manifestRel))) return;
  const splitManifest = readJson(manifestRel);
  const manifestRow = (splitManifest.places || []).find((row) => row?.id === updatedPlace.id);
  if (!manifestRow?.file) throw new Error(`${updatedPlace.id}: split child missing from ${manifestRel}`);
  const childRel = path.join(path.dirname(manifestRel), manifestRow.file).replace(/\\/g, '/');
  writeJson(childRel, updatedPlace);
  manifestRow.sha256 = sha256File(childRel);
  if (splitManifest.source_sha256 !== undefined) splitManifest.source_sha256 = sha256File(hit.sourceRel);
  if (splitManifest.generated_at !== undefined) splitManifest.generated_at = new Date().toISOString();
  writeJson(manifestRel, splitManifest);

  const indexRel = splitIndexRel(hit.sourceRel);
  if (!fs.existsSync(abs(indexRel))) return;
  const indexData = readJson(indexRel);
  const indexRow = rowsFrom(indexData).find((row) => row?.id === updatedPlace.id);
  if (!indexRow) return;
  const fields = [
    'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole',
    'coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordPrecisionM','coordVerifiedAt',
    'coordNote','geometry','anchors'
  ];
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(updatedPlace, field)) indexRow[field] = updatedPlace[field];
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

function applyCorrection(config) {
  const hit = findActiveSource(config.id);
  const beforePlace = structuredClone(hit.rows[hit.index]);
  const updated = {
    ...beforePlace,
    lat: config.lat,
    lon: config.lon,
    locatorType: config.locatorType,
    sourceProvider: config.sourceProvider,
    sourceObjectId: config.sourceObjectId,
    geocodeAccuracy: config.geocodeAccuracy,
    coordRole: config.coordRole,
    coordType: config.coordType,
    coordStatus: config.coordStatus,
    coordSource: config.coordSource,
    coordSourceId: config.coordSourceId,
    coordSourceUrl: config.coordSourceUrl,
    coordVerifiedAt: VERIFIED_AT,
    coordNote: config.coordNote
  };
  writeAggregateAndSplit(hit, updated);

  const evidenceHit = findEvidence(config.id);
  const evidence = evidenceHit.data;
  evidence.placeFile = hit.sourceRel;
  evidence.evidenceStatus = 'applied_to_place';
  evidence.coordinateDecision = 'do_not_change_coordinates_yet';
  evidence.currentCoordinate = currentCoordinate(updated);
  evidence.evidence = config.identityEvidence.map((item) => ({
    ...item,
    sourceQuality: item.sourceProvider === 'osm' ? 'unique_exact_named_object_geometry' : 'documented_identity_or_source_coordinate',
    canVerifyCoordinate: true,
    reason: config.coordNote
  }));
  evidence.sourceObjectCandidates = config.identityEvidence.map((item) => ({
    sourceProvider: item.sourceProvider,
    sourceObjectId: item.sourceObjectId,
    canApplyToPlace: true
  }));
  evidence.geometryCandidates = config.sourceProvider === 'osm'
    ? [{ sourceProvider: 'osm', sourceObjectId: config.sourceObjectId, canApplyToPlace: true }]
    : [];
  evidence.coordinateCandidates = [{ lat: config.lat, lon: config.lon, coordRole: config.coordRole, canApplyToPlace: true }];
  evidence.decision = { canBecomeVerified: true, blockedReason: '', nextAction: 'Dokumentert koordinat-/objektkilde er anvendt på canonical place.' };
  evidence.notes = [config.coordNote];
  writeJson(evidenceHit.rel, evidence);

  return {
    id: config.id,
    result: 'applied',
    before: currentCoordinate(beforePlace),
    after: currentCoordinate(updated),
    sourceObjectId: config.sourceObjectId,
    sourceFile: hit.sourceRel
  };
}

function updateProtocol(applied) {
  const rel = 'docs/coordinates/coordinate-control-protocol.md';
  let text = fs.readFileSync(abs(rel), 'utf8');
  text = text.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${VERIFIED_AT}`);

  for (const item of applied) {
    const hit = findActiveSource(item.id);
    const place = hit.rows[hit.index];
    if (!text.includes(`| 36 | \`${place.id}\` |`)) {
      const row = `| 36 | \`${place.id}\` | ${place.name} | ${place.coordStatus} | \`${place.sourceObjectId}\` |`;
      const lines = text.split('\n');
      let insertAt = lines.findIndex((line) => line.startsWith('### Dokumenterte Oslo-kontroller uten godkjent koordinat'));
      for (let i = 0; i < insertAt; i += 1) {
        if (lines[i].startsWith('| 36 |')) insertAt = i + 1;
      }
      if (!lines.some((line) => line.startsWith('| 36 |'))) {
        const batch35 = lines.findIndex((line) => line.includes('`akerselva_utlop_bjorvika`'));
        insertAt = batch35 >= 0 ? batch35 + 1 : insertAt;
      }
      lines.splice(insertAt, 0, row);
      text = lines.join('\n');
    }
    text = text.split('\n').filter((line) => !line.includes(`| \`${item.id}\` –`)).join('\n');
  }

  const osloStart = text.indexOf('## Oslo');
  const unresolvedStart = text.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
  const etneStart = text.indexOf('## Etne');
  const verifiedCount = (text.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
  const unresolvedSection = text.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : text.length);
  const unresolvedCount = unresolvedSection.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
  const summary = `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 36 gjenåpner konkrete needs_review-saker med objekt-type-først-metoden og promoterer bare eksplisitt kildebelagte koordinater eller entydige fysiske objektankre. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`;
  text = text.replace(/^Oslo-tabellen inneholder nå .*$/m, summary);

  fs.writeFileSync(abs(rel), text);
}

function updateReports(applied) {
  const resultRel = `${REPORT_DIR}/batch-36-results.json`;
  const resultData = readJson(resultRel);
  const map = new Map((resultData.outcomes || []).map((item) => [item.id, item]));
  for (const item of applied) map.set(item.id, item);
  resultData.outcomes = ['sigrid_undset_statue','inger_hagerups_plass','hartvig_nissens_skole_skam','prinds_christian_augusts_minde']
    .map((id) => map.get(id)).filter(Boolean);
  resultData.method = 'object-type-first; address-first attempts preserved; documented source coordinates or exact named physical objects only; no nearest/first-result guessing';
  writeJson(resultRel, resultData);

  const lines = resultData.outcomes.map((item) => item.result === 'applied'
    ? `- \`${item.id}\` → **verified/appplied**; canonical place, split child, evidence and indexes are synchronized.`
    : `- \`${item.id}\` → **needs_review beholdt** (${item.reason}); ingen koordinat er gjettet.`);
  const readme = `# Oslo koordinatkontroll – batch 36\n\nDato: ${VERIFIED_AT}\n\nBatchen gjenåpner fire konkrete needs_review-saker med objekt-type-først-metoden. Konkrete adresser som tidligere ga tvetydige Geonorge-resultater får bare objektfallback når fysisk identitet er eksplisitt dokumentert.\n\n${lines.join('\n')}\n\nRå Nominatim-resultater fra første pass er lagret i \`nominatim-results/\`. Andre pass bruker kun eksplisitte, allerede dokumenterte kildeobjekter: Lokalhistoriewikis kildekoordinat kryssjekket mot Oslo byleksikon/Oslo bykart for Inger Hagerups plass, og det eksakte navngitte OSM-skoleobjektet med Oslo kommune som operator for Hartvig Nissens skole.\n`;
  fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), readme);
}

const applied = corrections.map(applyCorrection);
updateProtocol(applied);
updateReports(applied);
console.log(JSON.stringify({ ok: true, applied }, null, 2));
