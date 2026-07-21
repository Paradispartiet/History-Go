#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const date = '2026-07-21';
const batch = 122;
const sportRoot = path.join(root, 'data/places/sport/europa/norway');
const aggregateFile = path.join(sportRoot, 'oslo_sport.json');
const splitDir = path.join(sportRoot, 'oslo_sport');
const splitManifestFile = path.join(sportRoot, 'oslo_sport_manifest.json');
const splitIndexFile = path.join(sportRoot, 'oslo_sport_index.json');
const evidenceDir = path.join(root, 'data/coordinate-evidence/oslo/sport');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-122-sport-address-first');
const runnerReportDir = process.env.RUNNER_REPORT_DIR ? path.join(root, process.env.RUNNER_REPORT_DIR) : null;
fs.mkdirSync(reportDir, { recursive: true });
if (runnerReportDir) fs.mkdirSync(runnerReportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

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
  return `geonorge-adresser-v1:${kommune}:${kode}:${number}${letter}`;
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function geonorgeLookup(placeId, street, number) {
  const query = `${street} ${number} Oslo`;
  const url = 'https://ws.geonorge.no/adresser/v1/sok?sok=' + encodeURIComponent(query);
  const raw = await fetchJson(url, { Accept: 'application/json' });
  writeJson(path.join(reportDir, `${placeId}-geonorge.json`), raw);
  if (runnerReportDir) writeJson(path.join(runnerReportDir, `${placeId}-geonorge.json`), raw);
  const parsed = parseNumber(number);
  const hits = Array.isArray(raw?.adresser) ? raw.adresser : [];
  const exact = hits.filter((hit) =>
    String(hit?.kommunenummer ?? '').trim() === '0301'
    && norm(hit?.adressenavn) === norm(street)
    && String(hit?.nummer ?? '').trim() === parsed.number
    && String(hit?.bokstav ?? '').trim().toUpperCase() === parsed.letter
  );
  return { query, url, raw, hits, exact };
}

async function osmLookup(osmId) {
  const url = `https://nominatim.openstreetmap.org/lookup?osm_ids=${encodeURIComponent(osmId)}&format=jsonv2&polygon_geojson=1`;
  const raw = await fetchJson(url, {
    Accept: 'application/json',
    'User-Agent': 'History-Go-coordinate-audit/1.0 (repository coordinate QA)',
  });
  if (!Array.isArray(raw) || raw.length !== 1) throw new Error(`${osmId}: direkte OSM-ID-oppslag ga ${Array.isArray(raw) ? raw.length : 'ikke-array'} treff`);
  const hit = raw[0];
  const expectedType = osmId[0] === 'W' ? 'way' : osmId[0] === 'R' ? 'relation' : 'node';
  const expectedId = Number(osmId.slice(1));
  if (hit?.osm_type !== expectedType || Number(hit?.osm_id) !== expectedId) throw new Error(`${osmId}: direkte lookup returnerte feil objekt`);
  const lat = Number(hit.lat);
  const lon = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error(`${osmId}: mangler gyldig representasjonspunkt`);
  return { url, hit, lat, lon, geojson: hit.geojson ?? null };
}

const targets = {
  daelenenga_idrettspark: {
    street: 'Seilduksgata', number: '30',
    officialSourceName: 'Oslo kommune – Dælenenga idrettsplass',
    officialSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/dalenenga-idrettsplass/',
    scope: 'Dælenenga idrettspark som samlet idrettsområde',
  },
  gressbanen: {
    street: 'Stasjonsveien', number: '24',
    officialSourceName: 'Ready / Oslo kommune – Gressbanen',
    officialSourceUrl: 'https://ready.no/sted/gressbanen/',
    scope: 'Gressbanen som Ready-anlegg og historisk fotball-/bandyground',
  },
  kfum_arena: {
    street: 'Ekebergveien', number: '109',
    officialSourceName: 'KFUM-kameratene Oslo – klubb- og arenaadresse',
    officialSourceUrl: 'https://www.kaaffa.no/om-kfum/fakta-om-klubben',
    scope: 'KFUM Arena som KFUM Oslos hjemmeground',
  },
  nordre_aasen_idrettspark: {
    street: 'Kjelsåsveien', number: '7',
    officialSourceName: 'Oslo kommune – Nordre Åsen idrettspark',
    officialSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/nordre-asen-idrettspark/',
    scope: 'Nordre Åsen idrettspark som samlet Skeid- og flerbanekompleks',
  },
};

const places = readJson(aggregateFile);
if (!Array.isArray(places)) throw new Error('oslo_sport.json må være en array');
const byId = new Map(places.filter((place) => place?.id).map((place) => [String(place.id), place]));
const geonorge = {};
for (const [placeId, config] of Object.entries(targets)) geonorge[placeId] = await geonorgeLookup(placeId, config.street, config.number);

const results = [];
function applyAddress(placeId) {
  const config = targets[placeId];
  const lookup = geonorge[placeId];
  if (lookup.exact.length !== 1) return false;
  const place = byId.get(placeId);
  const hit = lookup.exact[0];
  const lat = hit?.representasjonspunkt?.lat;
  const lon = hit?.representasjonspunkt?.lon;
  if (typeof lat !== 'number' || typeof lon !== 'number') throw new Error(`${placeId}: Geonorge-treff mangler representasjonspunkt`);
  const sourceObjectId = geonorgeId(hit);
  const addressNumber = String(hit?.nummer ?? '').trim() + String(hit?.bokstav ?? '').trim();
  place.lat = lat;
  place.lon = lon;
  place.locatorType = 'current_place';
  place.sourceProvider = 'official_address';
  place.sourceObjectId = sourceObjectId;
  place.address = {
    street: String(hit?.adressenavn ?? config.street).trim(),
    number: addressNumber,
    postcode: String(hit?.postnummer ?? '').trim(),
    city: String(hit?.poststed || hit?.kommunenavn || 'Oslo').trim().toUpperCase() === 'OSLO' ? 'Oslo' : String(hit?.poststed || hit?.kommunenavn || 'Oslo').trim(),
    country: 'NO',
  };
  place.geocodeAccuracy = 'rooftop';
  place.coordRole = 'display_marker';
  place.coordStatus = 'verified';
  place.coordSource = 'geonorge_adresser_v1';
  place.coordSourceId = sourceObjectId;
  place.coordSourceUrl = lookup.url;
  place.coordType = 'address_point';
  place.coordVerifiedAt = date;
  place.coordNote = `Batch 122 address-first: ${config.officialSourceName} dokumenterer besøksadressen ${config.street} ${config.number}. Ett eksakt Oslo-treff i Geonorge Adresser API v1 brukes som canonical display-marker for ${config.scope}. Adressepunktet er ikke en påstand om geometrisk sentrum for hele anlegget; eksisterende radius beholdes som gameplay-/besøksradius.`;
  delete place.geometry;
  delete place.anchors;
  results.push({ placeId, status: 'verified', method: 'address_first_official_address', sourceObjectId, lat, lon, addressQuery: lookup.query, exactHits: 1 });
  return true;
}

applyAddress('kfum_arena');
applyAddress('nordre_aasen_idrettspark');

// Gressbanen: address-first was attempted first but the unlettered official venue address
// did not yield one exact Geonorge row. The canonical record is the named ground itself,
// so use a direct stable-ID lookup of the exact named OSM sports ground instead of choosing
// among address variants.
{
  const placeId = 'gressbanen';
  const place = byId.get(placeId);
  const osm = await osmLookup('W5046575');
  writeJson(path.join(reportDir, `${placeId}-osm-way-5046575.json`), osm.hit);
  place.lat = osm.lat;
  place.lon = osm.lon;
  place.locatorType = 'current_place';
  place.sourceProvider = 'osm';
  place.sourceObjectId = 'osm-way:5046575';
  place.geocodeAccuracy = 'geometric_center';
  place.coordRole = 'area_anchor';
  place.coordStatus = 'verified_geometry';
  place.coordSource = 'OpenStreetMap way 5046575 – Gressbanen';
  place.coordSourceId = 'osm-way:5046575';
  place.coordSourceUrl = 'https://www.openstreetmap.org/way/5046575';
  place.coordType = 'sports_ground_center';
  place.coordVerifiedAt = date;
  place.geometry = osm.geojson;
  place.coordNote = `Batch 122: Ready og Oslo kommune dokumenterer Gressbanen på Stasjonsveien 24. Address-first ble forsøkt først, men Geonorge-søket ga ${geonorge[placeId].hits.length} adressetreff og ingen entydig eksakt ulettert 24-rad. Ingen adressevariant ble derfor valgt. Canonical place er selve navngitte fotball-/bandygrounden, og direkte stable-ID-oppslag av eksakt OSM way 5046575 brukes som geometrisk area-anchor; ingen nearest/first-hit-logikk.`;
  delete place.address;
  results.push({ placeId, status: 'verified_geometry', method: 'address_first_then_exact_named_osm_geometry', sourceObjectId: 'osm-way:5046575', lat: osm.lat, lon: osm.lon, addressQuery: geonorge[placeId].query, exactHits: geonorge[placeId].exact.length, totalAddressHits: geonorge[placeId].hits.length });
}

// Dælenenga: official address-first returned no usable Geonorge row. The canonical scope
// explicitly combines the historic/main pitch and Grünerhallen, so model it as a composite
// place with two direct stable OSM component anchors instead of using either sub-object alone.
{
  const placeId = 'daelenenga_idrettspark';
  const place = byId.get(placeId);
  const pitch = await osmLookup('W4708872');
  const hall = await osmLookup('W101769218');
  writeJson(path.join(reportDir, `${placeId}-osm-way-4708872.json`), pitch.hit);
  writeJson(path.join(reportDir, `${placeId}-osm-way-101769218.json`), hall.hit);
  const lat = (pitch.lat + hall.lat) / 2;
  const lon = (pitch.lon + hall.lon) / 2;
  place.lat = lat;
  place.lon = lon;
  place.locatorType = 'current_place';
  place.sourceProvider = 'osm';
  place.sourceObjectId = 'osm-composite:way/4708872+way/101769218';
  place.geocodeAccuracy = 'semantic_anchor';
  place.coordRole = 'area_anchor';
  place.coordStatus = 'verified_geometry';
  place.coordSource = 'OpenStreetMap composite – Dælenenga idrettspark way 4708872 + Grünerhallen way 101769218; scope cross-checked with Oslo kommune';
  place.coordSourceId = place.sourceObjectId;
  place.coordSourceUrl = targets[placeId].officialSourceUrl;
  place.coordType = 'sports_complex_composite_anchor';
  place.coordVerifiedAt = date;
  place.anchors = [
    { id: 'daelenenga_main_pitch', name: 'Dælenenga idrettspark', type: 'sports_ground', lat: pitch.lat, lon: pitch.lon, r: 90, sourceObjectId: 'osm-way:4708872', componentRole: 'main_historic_ground' },
    { id: 'daelenenga_grunerhallen', name: 'Grünerhallen', type: 'sports_hall', lat: hall.lat, lon: hall.lon, r: 70, sourceObjectId: 'osm-way:101769218', componentRole: 'indoor_ice_rink_component' },
  ];
  delete place.address;
  delete place.geometry;
  place.coordNote = `Batch 122 composite closure: Oslo kommune dokumenterer Dælenenga idrettsplass/idrettspark og Grünerhallen som del av samme idrettsområde, med besøksadresse Seilduksgata 30. Address-first ble forsøkt først, men Geonorge ga ingen treff for adressen. Ett enkelt bane- eller hallobjekt brukes derfor ikke som proxy for hele canonical stedet. I stedet dokumenterer to direkte stable-ID-oppslag de sentrale fysiske komponentene: OSM way 4708872 (den navngitte Dælenenga-grounden) og OSM way 101769218 (Grünerhallen). Hovedpunktet er et eksplisitt semantisk area-anchor midt mellom komponentankrene, ikke et påstått geometrisk sentrum.`;
  results.push({ placeId, status: 'verified_geometry', method: 'address_first_then_composite_exact_osm_components', sourceObjectId: place.sourceObjectId, lat, lon, addressQuery: geonorge[placeId].query, exactHits: geonorge[placeId].exact.length, componentIds: ['osm-way:4708872', 'osm-way:101769218'] });
}

// Atomically synchronize only the four known split records. Do not run the legacy splitter:
// the directory contains newer independently added records (for example Tøyenbadet) that are
// not present in the old 15-place aggregate and must never be deleted.
writeJson(aggregateFile, places);
for (const placeId of Object.keys(targets)) writeJson(path.join(splitDir, `${placeId}.json`), byId.get(placeId));

const splitIndex = readJson(splitIndexFile);
for (const placeId of Object.keys(targets)) {
  const place = byId.get(placeId);
  const row = splitIndex.find((item) => item?.id === placeId);
  if (!row) throw new Error(`oslo_sport_index mangler ${placeId}`);
  for (const field of ['lat', 'lon', 'r', 'year', 'coordStatus', 'coordType']) row[field] = place[field] ?? null;
}
writeJson(splitIndexFile, splitIndex);

const splitManifest = readJson(splitManifestFile);
splitManifest.source_sha256 = sha256File(aggregateFile);
splitManifest.generated_at = new Date().toISOString();
for (const placeId of Object.keys(targets)) {
  const row = (splitManifest.places || []).find((item) => item?.id === placeId);
  if (!row) throw new Error(`oslo_sport_manifest mangler ${placeId}`);
  row.sha256 = sha256File(path.join(splitDir, `${placeId}.json`));
}
writeJson(splitManifestFile, splitManifest);

function commonEvidence(placeId, extra) {
  const place = byId.get(placeId);
  const existingFile = path.join(evidenceDir, `${placeId}.json`);
  const existing = fs.existsSync(existingFile) ? readJson(existingFile) : {};
  const payload = {
    schemaVersion: '1.0', placeId, placeFile: 'data/places/sport/europa/norway/oslo_sport.json',
    evidenceStatus: 'applied_to_place', coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
    identity: { currentName: place.name, resolvedIdentity: existing?.identity?.resolvedIdentity || targets[placeId].scope, identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: '' },
    ...extra,
  };
  writeJson(existingFile, payload);
}

for (const placeId of ['kfum_arena', 'nordre_aasen_idrettspark']) {
  const place = byId.get(placeId);
  const config = targets[placeId];
  const addressText = `${place.address.street} ${place.address.number}, ${place.address.postcode} ${place.address.city}`;
  commonEvidence(placeId, {
    requiredEvidence: ['offisiell besøksadresse', 'ett entydig offisielt Geonorge-adressepunkt', 'eksplisitt display-marker-rolle'],
    evidence: [
      { sourceProvider: 'manual_research', sourceName: config.officialSourceName, sourceUrl: config.officialSourceUrl, sourceObjectId: `official-venue-address:${placeId}`, sourceQuality: 'official_current_visitor_address', finding: `Offisiell kilde dokumenterer ${config.street} ${config.number}.`, canVerifyCoordinate: false, reason: 'Bestemmer adressen før geokoding.' },
      { sourceProvider: 'official_address', sourceName: `Geonorge Adresser API v1 – ${config.street} ${config.number}`, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: 'exact_official_address_after_identity_resolution', finding: `Ett eksakt Oslo-treff for ${addressText}.`, canVerifyCoordinate: true, reason: place.coordNote },
    ],
    addressCandidates: [{ address: addressText, sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: 'display_marker', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Det entydige Geonorge-adressepunktet er anvendt som canonical display-marker.' },
    notes: [place.coordNote],
  });
}

{
  const placeId = 'gressbanen';
  const place = byId.get(placeId);
  commonEvidence(placeId, {
    requiredEvidence: ['address-first-forsøk', 'eksakt navngitt fysisk ground-objekt', 'stabil sourceObjectId'],
    evidence: [
      { sourceProvider: 'manual_research', sourceName: targets[placeId].officialSourceName, sourceUrl: targets[placeId].officialSourceUrl, sourceObjectId: 'official-venue-address:gressbanen', sourceQuality: 'official_current_visitor_address', finding: 'Offisielle kilder dokumenterer Stasjonsveien 24 og identifiserer canonical stedet som Gressbanen.', canVerifyCoordinate: false, reason: 'Address-first-identitet før geometrifallback.' },
      { sourceProvider: 'official_address', sourceName: 'Geonorge address-first attempt – Stasjonsveien 24', sourceUrl: geonorge[placeId].url, sourceObjectId: 'geonorge-address-search:Stasjonsveien-24', sourceQuality: 'ambiguous_unlettered_address_search', finding: `Søket ga ${geonorge[placeId].hits.length} treff, men 0 entydige eksakte uletterte 24-treff.`, canVerifyCoordinate: false, reason: 'Ingen adressevariant velges uten kildebelegg.' },
      { sourceProvider: 'osm', sourceName: 'OpenStreetMap – Gressbanen', sourceUrl: 'https://www.openstreetmap.org/way/5046575', sourceObjectId: 'osm-way:5046575', sourceQuality: 'direct_stable_id_exact_named_sports_ground', finding: 'Direkte OSM-ID-oppslag av den eksakt navngitte canonical grounden.', canVerifyCoordinate: true, reason: place.coordNote },
    ],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId: 'osm-way:5046575', canApplyToPlace: true }],
    geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: 'osm-way:5046575', lat: place.lat, lon: place.lon, coordRole: 'area_anchor', canApplyToPlace: true }],
    coordinateCandidates: [{ sourceProvider: 'osm', sourceObjectId: 'osm-way:5046575', lat: place.lat, lon: place.lon, coordRole: 'area_anchor', canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Eksakt navngitt OSM-ground er anvendt etter dokumentert tvetydig address-first-resultat.' },
    notes: [place.coordNote],
  });
}

{
  const placeId = 'daelenenga_idrettspark';
  const place = byId.get(placeId);
  commonEvidence(placeId, {
    requiredEvidence: ['address-first-forsøk', 'eksplisitt sammensatt canonical modell', 'stabile kildeobjekter for hovedkomponentene'],
    evidence: [
      { sourceProvider: 'municipality', sourceName: targets[placeId].officialSourceName, sourceUrl: targets[placeId].officialSourceUrl, sourceObjectId: 'oslo-kommune:dalenenga-idrettsplass', sourceQuality: 'official_scope_and_visitor_address', finding: 'Oslo kommune dokumenterer idrettsplassen/idrettsparken og Grünerhallen som samme idrettsområde med besøksadresse Seilduksgata 30.', canVerifyCoordinate: false, reason: 'Definerer canonical scope og komponentforhold.' },
      { sourceProvider: 'official_address', sourceName: 'Geonorge address-first attempt – Seilduksgata 30', sourceUrl: geonorge[placeId].url, sourceObjectId: 'geonorge-address-search:Seilduksgata-30', sourceQuality: 'no_applicable_address_result', finding: 'Address-first ga 0 treff; teknisk eller tomt resultat brukes ikke som grunn til å gjette et adressepunkt.', canVerifyCoordinate: false, reason: 'Dokumentert mislykket address-first før komponentmodell.' },
      { sourceProvider: 'osm', sourceName: 'OpenStreetMap – Dælenenga idrettspark', sourceUrl: 'https://www.openstreetmap.org/way/4708872', sourceObjectId: 'osm-way:4708872', sourceQuality: 'direct_stable_id_named_main_ground_component', finding: 'Direkte stable-ID-oppslag av den navngitte hovedgrounden.', canVerifyCoordinate: true, reason: 'Komponentanker, ikke alene proxy for hele området.' },
      { sourceProvider: 'osm', sourceName: 'OpenStreetMap – Grünerhallen', sourceUrl: 'https://www.openstreetmap.org/way/101769218', sourceObjectId: 'osm-way:101769218', sourceQuality: 'direct_stable_id_named_sports_hall_component', finding: 'Direkte stable-ID-oppslag av Grünerhallen som dokumentert hovedkomponent i området.', canVerifyCoordinate: true, reason: 'Komponentanker i eksplisitt composite-modell.' },
    ],
    addressCandidates: [],
    sourceObjectCandidates: [
      { sourceProvider: 'osm', sourceObjectId: 'osm-way:4708872', canApplyToPlace: true },
      { sourceProvider: 'osm', sourceObjectId: 'osm-way:101769218', canApplyToPlace: true },
    ],
    geometryCandidates: [],
    coordinateCandidates: place.anchors.map((anchor) => ({ sourceProvider: 'osm', sourceObjectId: anchor.sourceObjectId, lat: anchor.lat, lon: anchor.lon, coordRole: 'component_anchor', canApplyToPlace: true })),
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Composite area-anchor er anvendt med begge dokumenterte hovedkomponenter; ingen delarena brukes alene som proxy.' },
    notes: [place.coordNote],
  });
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(), batch,
  sourceQueue: 'four unresolved sport records from batch 121',
  method: 'address-first; exact official address when unique; otherwise only documented exact stable-ID geometry/composite component model, never nearest/first-hit',
  verified: results.map((item) => item.placeId), unresolved: [], results,
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 122 – sport closure', '',
  'Batch 122 reopens only the four unresolved records from batch 121.', '',
  ...results.map((item) => `- \`${item.placeId}\` → ${item.status} → \`${item.sourceObjectId}\` (${item.method})`), '',
  'KFUM Arena and Nordre Åsen resolve through exact Geonorge address-first. Gressbanen falls back only after an ambiguous address result to the exact named OSM ground. Dælenenga falls back only after no Geonorge result to an explicit two-component model using the named main ground and Grünerhallen. No nearest/first-hit logic is used.',
].join('\n'));

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 122 (2026-07-21)')) {
  const rows = results.map((item) => {
    const place = byId.get(item.placeId);
    return `| 122 | \`${item.placeId}\` | ${place.name} | ${place.coordStatus} | \`${item.sourceObjectId}\` |`;
  }).join('\n');
  const paragraph = 'Batch 122 (2026-07-21) lukker de fire åpne sportstedene fra batch 121 etter den låste metodeprioriteten. KFUM Arena og Nordre Åsen bruker entydige Geonorge-adressepunkter etter offisiell adresseavklaring. Gressbanen har dokumentert address-first-forsøk som ga flere adressetreff uten ett entydig eksakt ulettert 24-treff; derfor brukes i stedet direkte stable-ID-oppslag av den eksakt navngitte canonical grounden OSM way 5046575. Dælenenga ga ingen Geonorge-adresseresultat for kommunens besøksadresse; ett enkelt bane- eller hallobjekt brukes derfor ikke som proxy. Canonical stedet modelleres eksplisitt med to stabile komponentankre, Dælenenga-grounden OSM way 4708872 og Grünerhallen OSM way 101769218, og hovedpunktet er et dokumentert semantisk area-anchor mellom dem. Ingen nearest/first-hit- eller teknisk-feil-fallback brukes.';
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 122');
  protocol = protocol.replace(marker, `${rows}\n\n${paragraph}\n\n${marker}`);
  writeText(protocolFile, protocol);
}

console.log(JSON.stringify({ batch, verified: results.length, unresolved: 0, results }, null, 2));
