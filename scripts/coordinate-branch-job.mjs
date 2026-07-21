#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const auditDir = path.join(root, 'reports/oslo-coordinate-retro-compliance-20260721');
const subAuditDir = path.join(auditDir, 'subkultur-address-first');
fs.mkdirSync(subAuditDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const toPlaces = (payload) => Array.isArray(payload) ? payload : Array.isArray(payload?.places) ? payload.places : Array.isArray(payload?.items) ? payload.items : payload?.id ? [payload] : [];
const clone = (value) => JSON.parse(JSON.stringify(value));

function norm(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.'’`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNumber(value) {
  const match = String(value).trim().match(/^(\d+)\s*([A-Za-z]?)$/);
  if (!match) throw new Error('Ugyldig adressenummer: ' + value);
  return { number: match[1], letter: match[2].toUpperCase() };
}

function geonorgeId(hit) {
  const kommune = String(hit?.kommunenummer ?? '').trim();
  const kode = String(hit?.adressekode ?? '').trim();
  const number = String(hit?.nummer ?? '').trim();
  const letter = String(hit?.bokstav ?? '').trim();
  if (!kommune || !kode || !number) throw new Error('Ufullstendig Geonorge-identitet');
  return 'geonorge-adresser-v1:' + kommune + ':' + kode + ':' + number + letter;
}

function patchJsonPlace(file, placeId, mutate) {
  const payload = readJson(file);
  const place = toPlaces(payload).find((item) => item?.id === placeId);
  if (!place) throw new Error(file + ' mangler ' + placeId);
  const before = clone(place);
  mutate(place);
  writeJson(file, payload);
  return { before, after: clone(place) };
}

const subRoot = path.join(root, 'data/places/subkultur/oslo');
const subAggregate = path.join(subRoot, 'places_subkultur.json');
const subManifest = path.join(subRoot, 'places_subkultur_manifest.json');
const subIndex = path.join(subRoot, 'places_subkultur_index.json');
const subDir = path.join(subRoot, 'places_subkultur');

function patchSubkultur(placeId, mutate) {
  const child = path.join(subDir, placeId + '.json');
  const childChange = patchJsonPlace(child, placeId, mutate);
  const aggregateChange = patchJsonPlace(subAggregate, placeId, mutate);
  if (fs.existsSync(subIndex)) {
    const rows = readJson(subIndex);
    const row = rows.find((item) => item?.id === placeId);
    if (row) {
      row.lat = aggregateChange.after.lat;
      row.lon = aggregateChange.after.lon;
      row.r = aggregateChange.after.r;
      row.coordStatus = aggregateChange.after.coordStatus;
      row.coordType = aggregateChange.after.coordType;
      writeJson(subIndex, rows);
    }
  }
  return { child, childChange, aggregateChange };
}

function refreshSubManifest(changedIds) {
  const manifest = readJson(subManifest);
  manifest.source_sha256 = sha256(subAggregate);
  for (const placeId of changedIds) {
    const row = (manifest.places || []).find((item) => item?.id === placeId);
    if (!row) throw new Error('Subkultur-manifest mangler ' + placeId);
    row.sha256 = sha256(path.join(subDir, placeId + '.json'));
  }
  manifest.generated_at = new Date().toISOString();
  writeJson(subManifest, manifest);
}

function setOfficialAddress(place, hit, expected, sourceUrl) {
  const lat = hit?.representasjonspunkt?.lat;
  const lon = hit?.representasjonspunkt?.lon;
  if (typeof lat !== 'number' || typeof lon !== 'number') throw new Error('Geonorge-treff mangler representasjonspunkt');
  const sourceObjectId = geonorgeId(hit);
  const number = String(hit?.nummer ?? '').trim() + String(hit?.bokstav ?? '').trim();
  place.lat = lat;
  place.lon = lon;
  place.r = 60;
  place.locatorType = 'building';
  place.sourceProvider = 'official_address';
  place.sourceObjectId = sourceObjectId;
  place.address = {
    street: String(hit?.adressenavn ?? expected.street).trim(),
    number,
    postcode: String(hit?.postnummer ?? '').trim(),
    city: String(hit?.poststed || hit?.kommunenavn || '').trim().toUpperCase() === 'OSLO' ? 'Oslo' : String(hit?.poststed || hit?.kommunenavn || '').trim(),
    country: 'NO'
  };
  place.geocodeAccuracy = 'rooftop';
  place.coordRole = 'display_marker';
  place.coordStatus = 'verified';
  place.coordSource = 'geonorge_adresser_v1';
  place.coordSourceId = sourceObjectId;
  place.coordSourceUrl = sourceUrl;
  place.coordType = 'address_point';
  place.coordVerifiedAt = '2026-07-21';
  place.coordNote = 'Retrospektiv Coordinate Source Contract v1-korreksjon: den dokumenterte venue-/institusjonsadressen ' + expected.street + ' ' + expected.number + ' ble kjørt på nytt gjennom Geonorge address-first. Ett eksakt Oslo-treff ble valgt som canonical display-marker. Tidligere manuell kartplassering beholdes ikke som primær koordinatkilde.';
  delete place.coordPrecision;
  delete place.coordPrecisionM;
  return { sourceObjectId, lat, lon };
}

function downgradeLegacy(place, config) {
  place.coordStatus = 'needs_source';
  place.locatorType = config.locatorType;
  place.sourceProvider = 'legacy_unknown';
  delete place.sourceObjectId;
  delete place.address;
  place.geocodeAccuracy = config.geocodeAccuracy || 'unknown';
  place.coordRole = config.coordRole || 'display_marker';
  place.coordType = 'legacy_unverified';
  place.coordVerifiedAt = '2026-07-21';
  place.coordNote = String(place.coordNote || '').trim() + ' Retrospektiv compliance-audit 2026-07-21: tidligere verified-status kan ikke forsvares mot Coordinate Source Contract v1 med eksisterende evidens. Punktet beholdes kun som legacy-kartanker til en ny kildekontroll dokumenterer et stabilt primærkildeobjekt.';
}

const addressable = {
  blitzhuset: { street: 'Pilestredet', number: '30C' },
  gamlebyen_sport_og_fritid: { street: 'St. Halvards gate', number: '4' },
  hausmania: { street: 'Hausmanns gate', number: '34' },
  helvete_neseblod_records: { street: 'Schweigaards gate', number: '56' },
  jaeger_oslo: { street: 'Grensen', number: '9' },
  kafe_haerverk: { street: 'Hausmanns gate', number: '34' },
  last_train_oslo: { street: 'Karl Johans gate', number: '45' },
  mir_grunerlokka_lufthavn: { street: 'Toftes gate', number: '69' },
  oslo_skatehall: { street: 'Stavangergata', number: '28' },
  revolver_oslo: { street: 'Møllergata', number: '32' },
  rock_in_oslo: { street: 'Grønland', number: '14' },
  sub_scene: { street: "Rosenkrantz' gate", number: '17' },
  the_villa: { street: 'Møllergata', number: '23' },
  vaterland_bar_scene: { street: 'Brugata', number: '9' },
  xray_ungdomskulturhus: { street: 'Maridalsveien', number: '3' }
};

const changedSubIds = new Set();
const addressResults = [];
for (const [placeId, expected] of Object.entries(addressable)) {
  const query = expected.street + ' ' + expected.number + ' Oslo';
  const sourceUrl = 'https://ws.geonorge.no/adresser/v1/sok?sok=' + encodeURIComponent(query);
  const response = await fetch(sourceUrl, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(placeId + ': Geonorge HTTP ' + response.status);
  const raw = await response.json();
  const rawFile = path.join(subAuditDir, placeId + '.json');
  writeJson(rawFile, raw);
  const parsed = parseNumber(expected.number);
  const hits = Array.isArray(raw?.adresser) ? raw.adresser : [];
  const exact = hits.filter((hit) =>
    String(hit?.kommunenummer ?? '').trim() === '0301'
    && norm(hit?.adressenavn) === norm(expected.street)
    && String(hit?.nummer ?? '').trim() === parsed.number
    && String(hit?.bokstav ?? '').trim().toUpperCase() === parsed.letter
  );
  let decision;
  if (exact.length === 1) {
    let applied;
    patchSubkultur(placeId, (place) => { applied = setOfficialAddress(place, exact[0], expected, sourceUrl); });
    decision = { placeId, query, status: 'verified_address_first', exactHits: 1, ...applied };
  } else {
    patchSubkultur(placeId, (place) => downgradeLegacy(place, { locatorType: 'building' }));
    decision = { placeId, query, status: 'downgraded_needs_source', exactHits: exact.length, totalHits: hits.length };
  }
  changedSubIds.add(placeId);
  addressResults.push(decision);
}

// Historical/multi-location place: existing point is not enough for verified.
patchSubkultur('club_7_vika', (place) => downgradeLegacy(place, { locatorType: 'historic_site', geocodeAccuracy: 'historical_approximation', coordRole: 'historical_anchor' }));
changedSubIds.add('club_7_vika');

// These were explicitly unresolved in the earlier full-batch source report.
for (const [placeId, locatorType, role] of [
  ['sofienbergparken_subkultur', 'park', 'area_anchor'],
  ['skur13', 'current_place', 'display_marker'],
  ['stovnertarnet', 'poi', 'display_marker']
]) {
  patchSubkultur(placeId, (place) => downgradeLegacy(place, { locatorType, coordRole: role }));
  changedSubIds.add(placeId);
}
refreshSubManifest(changedSubIds);

// Abelonegården: normalize the already documented historical source contract.
patchJsonPlace(path.join(root, 'data/places/historie/oslo/places_historie/abelonegarden.json'), 'abelonegarden', (place) => {
  place.locatorType = 'historic_site';
  place.sourceProvider = 'manual_research';
  place.sourceObjectId = 'lokalhistoriewiki:abelonegarden';
  place.geocodeAccuracy = 'historical_approximation';
  place.coordRole = 'historical_anchor';
  place.coordStatus = 'verified_historical_source';
  place.coordType = 'historical_site';
  place.coordVerifiedAt = '2026-07-21';
  place.coordNote = String(place.coordNote || '').trim() + ' Contract v1-normalisering 2026-07-21: den forsvunne tomta behandles som historisk anker med Lokalhistoriewiki-oppføringen som stabil kildeidentitet; punktet er ikke et nåværende bygningspunkt.';
});

// Minneparken: exact named park geometry, normalize custom legacy enums only.
patchJsonPlace(path.join(root, 'data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_11.json'), 'minneparken_gamlebyen', (place) => {
  place.locatorType = 'park';
  place.geocodeAccuracy = 'semantic_anchor';
  place.coordRole = 'area_anchor';
  place.coordStatus = 'verified_geometry';
  place.coordVerifiedAt = '2026-07-21';
  place.coordNote = String(place.coordNote || '').trim() + ' Contract v1-normalisering 2026-07-21: den samme eksakt navngitte parkgeometrien beholdes; legacy-verdiene locatorType=area og geocodeAccuracy=geometry er erstattet med tillatte canonical verdier park og semantic_anchor.';
});

// Skulptursonen: documented street segment, normalize custom locator enum only.
patchJsonPlace(path.join(root, 'data/places/kunst/oslo/places_kunst_oslo_oppdag_kvadraturen_art_sites_batch_01.json'), 'skulptursonen_ovre_slottsgate', (place) => {
  place.locatorType = 'linear_area';
  place.coordVerifiedAt = '2026-07-21';
  place.coordNote = String(place.coordNote || '').trim() + ' Contract v1-normalisering 2026-07-21: kunstsonens samme dokumenterte gatekjede og linjeanker beholdes; custom locatorType=art_zone er erstattet med canonical linear_area.';
});

// Rebuild runtime before syncing any evidence snapshots.
execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });

// Sync currentCoordinate in any evidence files for changed IDs.
const changedIds = new Set([...changedSubIds, 'abelonegarden', 'minneparken_gamlebyen', 'skulptursonen_ovre_slottsgate']);
const runtime = toPlaces(readJson(path.join(root, 'data/places/places_index.json')));
const byId = new Map(runtime.filter((place) => place?.id).map((place) => [String(place.id), place]));
function walk(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(full);
  }
  return files;
}
for (const file of walk(path.join(root, 'data/coordinate-evidence'))) {
  let evidence;
  try { evidence = readJson(file); } catch { continue; }
  const placeId = String(evidence?.placeId || '');
  if (!changedIds.has(placeId)) continue;
  const place = byId.get(placeId);
  if (!place) continue;
  evidence.currentCoordinate = {
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    coordStatus: place.coordStatus ?? '',
    coordSource: place.coordSource ?? '',
    coordType: place.coordType ?? '',
    coordNote: place.coordNote ?? ''
  };
  writeJson(file, evidence);
}

execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
const validateCoordinateSource = (await import(pathToFileURL(path.join(root, 'dist/tools/coordinate-source-contract.mjs')).href)).validateCoordinateSource;
const finalRuntime = toPlaces(readJson(path.join(root, 'data/places/places_index.json')));
const finalById = new Map(finalRuntime.filter((place) => place?.id).map((place) => [String(place.id), place]));
const finalFindings = [];
for (const placeId of changedIds) {
  const place = finalById.get(placeId);
  if (!place) throw new Error('Mangler runtime ' + placeId);
  const result = validateCoordinateSource(place);
  if (String(place.coordStatus || '').startsWith('verified') && result.trust !== 'verified') {
    finalFindings.push({ placeId, status: place.coordStatus, trust: result.trust, problems: result.problems });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  addressFirstResults: addressResults,
  downgradedWithoutNewSource: ['club_7_vika','sofienbergparken_subkultur','skur13','stovnertarnet'],
  normalizedWithoutCoordinateChange: ['abelonegarden','minneparken_gamlebyen','skulptursonen_ovre_slottsgate'],
  changedIds: [...changedIds].sort(),
  remainingVerifiedContractFindingsAmongChanged: finalFindings
};
writeJson(path.join(auditDir, 'contract-failures-resolution.json'), report);

console.log(JSON.stringify({
  status: finalFindings.length === 0 ? 'contract_failure_batch_resolved' : 'contract_failure_batch_has_findings',
  addressFirstVerified: addressResults.filter((item) => item.status === 'verified_address_first').length,
  addressFirstDowngraded: addressResults.filter((item) => item.status === 'downgraded_needs_source').length,
  explicitDowngrades: 4,
  normalized: 3,
  remainingFindings: finalFindings.length,
  addressResults
}, null, 2));

if (finalFindings.length) throw new Error('Gjenstående verified contract-feil i korrigert batch: ' + finalFindings.length);
