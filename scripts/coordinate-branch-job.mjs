import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const DATE = '2026-07-21';
const BATCH = 119;
const BT = '`';
const AGGREGATE = 'data/places/popkultur/oslo/places_oslo_populaerkultur.json';
const CHILD_DIR = 'data/places/popkultur/oslo/places_oslo_populaerkultur';
const INDEX = 'data/places/popkultur/oslo/places_oslo_populaerkultur_index.json';
const MANIFEST = 'data/places/popkultur/oslo/places_oslo_populaerkultur_manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const EVIDENCE_DIR = 'data/coordinate-evidence/oslo/popkultur';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-119-popkultur';
const COORD_FIELDS = ['lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordType','coordStatus','coordSource','coordVerifiedAt','coordNote'];

const BUILDINGS = {
  cinemateket_oslo: {
    address: 'Dronningens gate 16 Oslo', variants: ['Dronningens gate 16'],
    identityUrl: 'https://www.cinemateket.no/kinoutleie/kontakt-og-booking',
    identityName: 'Cinemateket',
    addressBasis: 'Cinemateket oppgir Dronningens gate 16 som besøksadresse.'
  },
  colosseum_kino: {
    address: 'Fridtjof Nansens vei 6 Oslo', variants: ['Fridtjof Nansens vei 6'],
    identityUrl: 'https://www.nfkino.no/kino/colosseum',
    identityName: 'Nordisk Film Kino – Colosseum',
    addressBasis: 'Nordisk Film Kino oppgir Fridtjof Nansens vei 6 som Colosseum kinos adresse.'
  },
  house_of_nerds: {
    address: 'Vulkan 18 Oslo', variants: ['Vulkan 18'],
    identityUrl: 'https://houseofnerds.no/house-of-nerds-oslo-vulkan',
    identityName: 'House of Nerds Vulkan',
    addressBasis: 'House of Nerds oppgir Vulkan 18 som adressen til Oslo-lokasjonen på Vulkan.'
  },
  latter: {
    address: 'Holmens gate 1 Oslo', variants: ['Holmens gate 1'],
    identityUrl: 'https://latter.no/kontakt',
    identityName: 'Latter',
    addressBasis: 'Latter oppgir Holmens gate 1 som besøksadresse på Aker Brygge.'
  },
  grand_hotel: {
    address: 'Karl Johans gate 31 Oslo', variants: ['Karl Johans gate 31'],
    identityUrl: 'https://grand.no/om-grand',
    identityName: 'Grand Hotel Oslo',
    addressBasis: 'Grand Hotel oppgir Karl Johans gate 31 som hotellets adresse.'
  },
  chat_noir: {
    address: 'Klingenberggata 5 Oslo', variants: ['Klingenberggata 5'],
    identityUrl: 'https://www.chatnoir.no/kontakt',
    identityName: 'Chat Noir',
    addressBasis: 'Chat Noir oppgir Klingenberggata 5 som besøksadresse.'
  },
  edderkoppen_scene: {
    address: 'St. Olavs plass 1 Oslo', variants: ['St. Olavs plass 1', 'St. Olavsplass 1 Oslo', 'St. Olavsplass 1'],
    identityUrl: 'https://edderkoppenscene.no/kontakt-oss/',
    identityName: 'Edderkoppen Scene',
    addressBasis: 'Edderkoppen Scene oppgir St. Olavs plass 1 som besøksadresse og beskriver scenen som integrert i Scandic St. Olavs plass.'
  }
};

function full(file) { return path.join(ROOT, file); }
function readJson(file) { return JSON.parse(fs.readFileSync(full(file), 'utf8')); }
function writeJson(file, value) { fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`); }
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(full(file))).digest('hex'); }
function findRow(rows, id) { const row = rows.find((item) => item?.id === id); if (!row) throw new Error(`Missing ${id}`); return row; }
function currentCoordinate(place) { return { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote }; }

function runFinder(query) {
  const proc = spawnSync(process.execPath, ['dist/tools/address-first-coordinate-finder.mjs', '--address', query], { cwd: ROOT, encoding: 'utf8' });
  const stdout = String(proc.stdout || '').trim();
  const stderr = String(proc.stderr || '').trim();
  if (!stdout) return { ok: false, status: 'error', reason: `Ingen output${stderr ? `: ${stderr}` : ''}`, query };
  try { return JSON.parse(stdout); }
  catch { return { ok: false, status: 'error', reason: `Ugyldig JSON: ${stdout}${stderr ? ` / ${stderr}` : ''}`, query }; }
}

function runAddressLookup(id, config) {
  const queries = [...new Set([config.address, ...(config.variants || [])])];
  const attempts = [];
  let firstNonError = null;
  for (const query of queries) {
    const result = runFinder(query);
    attempts.push(result);
    if (result.ok && result.status === 'verified_candidate' && result.coordinate) {
      writeJson(`${REPORT_DIR}/geonorge-${id}.json`, result);
      writeJson(`${REPORT_DIR}/geonorge-${id}-attempts.json`, attempts);
      return result;
    }
    if (result.status !== 'error' && !firstNonError) firstNonError = result;
  }
  writeJson(`${REPORT_DIR}/geonorge-${id}-attempts.json`, attempts);
  if (firstNonError) { writeJson(`${REPORT_DIR}/geonorge-${id}.json`, firstNonError); return firstNonError; }
  throw new Error(`Geonorge remained technically unavailable for ${id}; refusing OSM fallback. ${attempts.map((x) => `${x.query}: ${x.reason}`).join(' | ')}`);
}

function applyOfficialAddress(place, result) {
  Object.assign(place, result.coordinate);
  place.coordSourceId = result.sourceObjectId;
  place.coordSourceUrl = result.sourceUrl;
  place.coordVerifiedAt = DATE;
}

function officialEvidence(existing, place, result, config) {
  const secondary = (existing.evidence || []).filter((e) => e?.sourceProvider === 'osm').map((e) => ({ ...e, sourceQuality: 'secondary_geometry_qa', canVerifyCoordinate: false, reason: 'Sekundær identitets-/geometri-QA; Geonorge er primær koordinatkilde for det konkrete adressebare stedet.' }));
  return {
    ...existing,
    schemaVersion: existing.schemaVersion || '1.0',
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: currentCoordinate(place),
    requiredEvidence: ['entydig offisielt adressepunkt', 'dokumentert at adressen representerer det konkrete canonical stedet'],
    evidence: [
      { sourceProvider: 'official_address', sourceName: 'geonorge_adresser_v1', sourceUrl: result.sourceUrl, sourceObjectId: result.sourceObjectId, sourceQuality: 'official_address_plus_documented_identity', finding: `${result.reason} ${config.addressBasis}`, canVerifyCoordinate: true, reason: result.coordinate.coordNote },
      { sourceProvider: 'official_site', sourceName: config.identityName, sourceUrl: config.identityUrl, sourceObjectId: `official-site:${place.id}:address`, sourceQuality: 'official_venue_address_identity', finding: config.addressBasis, canVerifyCoordinate: false, reason: 'Primærkilden dokumenterer venue-identiteten og adressen; Geonorge dokumenterer koordinatpunktet.' },
      ...secondary
    ],
    addressCandidates: [{ address: config.address, sourceProvider: 'official_address', sourceObjectId: result.sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: result.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: 'display_marker', sourceObjectId: result.sourceObjectId, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt, venue-identitet og representasjonsanker er anvendt på canonical place.' },
    notes: [result.coordinate.coordNote, config.addressBasis, 'Batch 119 address-first-korreksjon: OSM beholdes bare som sekundær geometri-QA når Geonorge gir et entydig relevant adressepunkt.']
  };
}

function fallbackEvidence(existing, place, result, config) {
  const reason = `Geonorge address-first ble forsøkt for ${config.address}, men ga ${result.status}: ${result.reason}`;
  place.coordNote = `${reason}. Den allerede kontrollerte eksakte navngitte OSM-geometrien beholdes som dokumentert fallback; ingen nearest/first-hit-logikk brukes.`;
  return {
    ...existing,
    evidenceStatus: 'applied_to_place', coordinateDecision: 'do_not_change_coordinates_yet', currentCoordinate: currentCoordinate(place),
    requiredEvidence: ['Geonorge forsøkt først for konkret dokumentert adresse', 'ett eksakt navngitt fysisk OSM-objekt som fallback'],
    evidence: [
      { sourceProvider: 'official_address', sourceName: 'geonorge_adresser_v1', sourceUrl: result.sourceUrl || '', sourceObjectId: result.sourceObjectId || `geonorge-address-attempt:${place.id}`, sourceQuality: 'address_first_attempt_not_applicable', finding: `${reason}. ${config.addressBasis}`, canVerifyCoordinate: false, reason: result.reason },
      { sourceProvider: 'official_site', sourceName: config.identityName, sourceUrl: config.identityUrl, sourceObjectId: `official-site:${place.id}:address`, sourceQuality: 'official_venue_address_identity', finding: config.addressBasis, canVerifyCoordinate: false, reason: 'Dokumenterer identitet og adresse.' },
      ...(existing.evidence || []).filter((e) => e?.sourceProvider === 'osm')
    ],
    addressCandidates: [{ address: config.address, sourceProvider: 'official_address', sourceObjectId: result.sourceObjectId || `geonorge-address-attempt:${place.id}`, canApplyToPlace: false, reason: result.reason }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Geonorge-first er dokumentert; eksakt OSM-objekt beholdes som fallback.' },
    notes: [reason, config.addressBasis, place.coordNote]
  };
}

execFileSync('npm', ['run', 'build:tools'], { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(full(REPORT_DIR), { recursive: true });
const aggregate = readJson(AGGREGATE);
const index = readJson(INDEX);
const manifest = readJson(MANIFEST);
const results = {};

for (const [id, config] of Object.entries(BUILDINGS)) {
  const place = findRow(aggregate, id);
  const before = { lat: place.lat, lon: place.lon, coordStatus: place.coordStatus, coordSource: place.coordSource, sourceObjectId: place.sourceObjectId || place.coordSourceId || null };
  const result = runAddressLookup(id, config);
  const evidencePath = `${EVIDENCE_DIR}/${id}.json`;
  const evidence = readJson(evidencePath);
  if (result.ok && result.status === 'verified_candidate' && result.coordinate) {
    applyOfficialAddress(place, result);
    writeJson(evidencePath, officialEvidence(evidence, place, result, config));
    results[id] = { method: 'official_address', address: config.address, sourceObjectId: place.sourceObjectId, before, after: currentCoordinate(place) };
  } else {
    writeJson(evidencePath, fallbackEvidence(evidence, place, result, config));
    results[id] = { method: 'osm_fallback_after_address_first', address: config.address, lookupStatus: result.status, lookupReason: result.reason, sourceObjectId: place.sourceObjectId || place.coordSourceId || null, before, after: currentCoordinate(place) };
  }
  writeJson(`${CHILD_DIR}/${id}.json`, place);
  const indexRow = findRow(index, id);
  for (const field of COORD_FIELDS) indexRow[field] = place[field] ?? null;
}

writeJson(AGGREGATE, aggregate);
writeJson(INDEX, index);
manifest.source_sha256 = sha256(AGGREGATE);
manifest.generated_at = new Date().toISOString();
for (const row of manifest.places || []) if (BUILDINGS[row.id]) row.sha256 = sha256(`data/places/popkultur/oslo/${row.file}`);
writeJson(MANIFEST, manifest);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
const lines = protocol.split('\n');
for (const id of Object.keys(BUILDINGS)) {
  const place = findRow(aggregate, id);
  const prefix = `| 119 | ${BT}${id}${BT} |`;
  const i = lines.findIndex((line) => line.startsWith(prefix));
  if (i < 0) throw new Error(`Missing batch 119 row ${id}`);
  lines[i] = `| 119 | ${BT}${id}${BT} | ${place.name} | ${place.coordStatus} | ${BT}${place.sourceObjectId || place.coordSourceId}${BT} |`;
}
protocol = lines.join('\n');
const officialIds = Object.entries(results).filter(([,v]) => v.method === 'official_address').map(([id]) => id);
const fallbackIds = Object.entries(results).filter(([,v]) => v.method !== 'official_address').map(([id]) => id);
const quoted = (ids) => ids.map((id) => `${BT}${id}${BT}`).join(', ');
const note = [
  'Batch 119 (2026-07-21) er korrigert til objekt-type-først/address-first-metoden.',
  officialIds.length ? `De konkrete adressebare stedene ${quoted(officialIds)} bruker entydige Geonorge-adressepunkter med venue-adressen dokumentert av stedet selv.` : '',
  fallbackIds.length ? `${quoted(fallbackIds)} beholdes på eksakt OSM-geometri først etter dokumentert ikke-feilende Geonorge-forsøk uten anvendbart entydig treff.` : '',
  `${BT}slottsplassen${BT} forblir et eksakt navngitt offentlig plassanker basert på geometri.`,
  `${BT}frognerstranda${BT} forblir needs_source fordi en vei eller tilfeldig kystlinje ikke kan brukes som proxy for en bred strandsone.`,
  'Tekniske Geonorge-feil kan ikke legitimere OSM-fallback, og ingen nearest/first-hit-logikk brukes.'
].filter(Boolean).join(' ');
if (!/^Batch 119 \(2026-07-21\).*$/m.test(protocol)) throw new Error('Missing batch 119 note');
protocol = protocol.replace(/^Batch 119 \(2026-07-21\).*$/m, note);
fs.writeFileSync(full(PROTOCOL), protocol);

const resultsPath = `${REPORT_DIR}/results.json`;
const report = readJson(resultsPath);
report.addressFirstCorrectionAt = new Date().toISOString();
report.method = 'object-type first; concrete addressable venues use Geonorge first; exact OSM geometry is only a documented fallback after a successful non-error address lookup; Slottsplassen remains geometry-based; no nearest/first-hit';
report.addressFirstResults = results;
report.after = report.after || {};
for (const id of Object.keys(BUILDINGS)) {
  const place = findRow(aggregate, id);
  report.after[id] = { lat: place.lat, lon: place.lon, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, sourceObjectId: place.sourceObjectId || place.coordSourceId || null };
}
writeJson(resultsPath, report);

const readmePath = `${REPORT_DIR}/README.md`;
let readme = fs.readFileSync(full(readmePath), 'utf8').trimEnd();
const header = '## Address-first correction';
if (readme.includes(header)) readme = readme.slice(0, readme.indexOf(header)).trimEnd();
readme += `\n\n${header}\n\nDen opprinnelige batch-kjøringen brukte direkte OSM-verifikasjon for flere konkrete adressebare venue-/hotellsteder. Dette er korrigert: Geonorge Adresser API kjøres først for Cinemateket, Colosseum kino, House of Nerds, Latter, Grand Hotel, Chat Noir og Edderkoppen Scene. Tekniske Geonorge-feil blokkerer og kan ikke legitimere fallback. Slottsplassen forblir et geometrianker, mens Frognerstranda forblir needs_source.\n\n- Geonorge primary: ${officialIds.join(', ') || 'ingen'}\n- OSM fallback etter dokumentert ikke-feilende adresseforsøk: ${fallbackIds.join(', ') || 'ingen'}`;
fs.writeFileSync(full(readmePath), `${readme.trimEnd()}\n`);

console.log(JSON.stringify({ ok: true, batch: BATCH, officialIds, fallbackIds, results }, null, 2));
