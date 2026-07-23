#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const DATE = '2026-07-23';
const BATCH = 176;
const placeId = 'hellerud_gard';
const aggregateFile = 'data/places/natur/oslo/places_oslo_alna.json';
const childFile = 'data/places/natur/oslo/places_oslo_alna/hellerud_gard.json';
const indexFile = 'data/places/natur/oslo/places_oslo_alna_index.json';
const manifestFile = 'data/places/natur/oslo/places_oslo_alna_manifest.json';
const evidenceFile = 'data/coordinate-evidence/oslo/natur/hellerud_gard.json';
const mappingFile = 'data/Civication/map/historyGoPlaceMapping.natur_alna.json';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = `reports/oslo-coordinate-control-batch-${BATCH}-nedre-hellerud-production`;
const researchUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/bc778b5dc7e2cd9fd03927246e052a6b711c16be/reports/oslo-coordinate-control-batch-168-nedre-hellerud-cadastral-research/cadastral-summary.json';
const geonorgeUrl = 'https://ws.geonorge.no/adresser/v1/sok?sok=Hellerud%20g%C3%A5rdsvei%207%20Oslo';
const historyUrl = 'https://oslobyleksikon.no/side/Hellerud%2C_Nordre';
const sourceObjectId = 'geonorge-adresser-v1:0301:20892:7';

const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');
const norm = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'a').replace(/[^a-z0-9]+/g, ' ').trim();

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(45000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> ${response.status} ${response.statusText}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

const protocolBefore = fs.readFileSync(abs(protocolFile), 'utf8');
const batchNumbers = [...protocolBefore.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1])).filter(Number.isFinite);
const maxBatch = Math.max(...batchNumbers);
if (maxBatch !== 175) throw new Error(`Expected current Oslo coordinate max batch 175, got ${maxBatch}. Rebase before batch 176.`);

const oldPlace = readJson(childFile);
if (oldPlace.id !== placeId || oldPlace.coordStatus !== 'needs_source') {
  throw new Error(`${placeId} is no longer the unresolved Hellerud record expected for batch 176`);
}
if (![norm('Hellerud gård'), norm('Nedre Hellerud – historisk gårdssted')].includes(norm(oldPlace.name))) {
  throw new Error(`Unexpected Hellerud identity on current main: ${oldPlace.name}`);
}

const [research, geonorge] = await Promise.all([fetchJson(researchUrl), fetchJson(geonorgeUrl)]);
if (research?.placeId !== placeId || research?.productionReady !== true) throw new Error('Pinned Nedre Hellerud research is not production-ready');
if (research?.historicalIdentityBasis?.sourceIdentity !== 'Nedre Hellerud' || research?.historicalIdentityBasis?.cadastralIdentity !== 'gnr. 143 / bnr. 3') {
  throw new Error('Pinned Nedre Hellerud research identity no longer matches the production lock');
}

const rows = Array.isArray(geonorge?.adresser) ? geonorge.adresser : [];
const exactHits = rows.filter((row) => norm(row.adressetekst) === norm('Hellerud gårdsvei 7') && String(row.kommunenummer) === '0301');
const cadastralMatches = exactHits.filter((row) => Number(row.gardsnummer) === 143 && Number(row.bruksnummer) === 3);
if (exactHits.length !== 1 || cadastralMatches.length !== 1) {
  throw new Error(`Expected exactly one Hellerud gårdsvei 7 hit matching gnr 143 / bnr 3; exact=${exactHits.length}, cadastral=${cadastralMatches.length}`);
}
const selected = cadastralMatches[0];
const lat = Number(selected.representasjonspunkt?.lat);
const lon = Number(selected.representasjonspunkt?.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Selected Geonorge address has no finite representation point');
if (Number(selected.adressekode) !== 20892 || Number(selected.nummer) !== 7 || String(selected.bokstav ?? '') !== '') {
  throw new Error('Selected Geonorge address no longer matches stable sourceObjectId geonorge-adresser-v1:0301:20892:7');
}

const place = structuredClone(oldPlace);
place.name = 'Nedre Hellerud – historisk gårdssted';
place.lat = lat;
place.lon = lon;
place.r = 160;
place.category = 'historie';
place.desc = 'Historisk gårdssted for Nedre Hellerud, forankret i matrikkelen til gnr. 143 / bnr. 3 ved Hellerud gårdsvei 7.';
place.popupDesc = 'Nedre Hellerud er ett av de historiske gårdsbrukene som oppstod etter delingen av Nordre Hellerud. History Go bruker Hellerud gårdsvei 7 som et kildebelagt anker for det historiske matrikkelstedet gnr. 143 / bnr. 3. Punktet dokumenterer hvor det historiske gårdsstedet er forankret i dagens matrikkel og adresseverk, men er ikke i seg selv bevis for at bygningen som står der i dag er den opprinnelige gårdsbygningen fra 1700-tallet.';
place.tags = [...new Set([...(place.tags || []), 'Nedre Hellerud', 'historisk gårdssted', 'matrikkel'])];
place.locatorType = 'historic_site';
place.sourceProvider = 'official_address';
place.sourceObjectId = sourceObjectId;
place.geocodeAccuracy = 'rooftop';
place.coordRole = 'display_marker';
place.coordType = 'address_point';
place.coordStatus = 'verified';
place.coordSource = 'Geonorge Adresser API v1 – Hellerud gårdsvei 7; gnr. 143 / bnr. 3, historical identity cross-checked against Nedre Hellerud research';
place.coordSourceId = sourceObjectId;
place.coordSourceUrl = geonorgeUrl;
place.coordVerifiedAt = DATE;
place.coordNote = `Batch ${BATCH} address-first/cadastral identity resolution: exact Geonorge address Hellerud gårdsvei 7 resolves uniquely to gnr. 143 / bnr. 3, matching the pinned historical identity for Nedre Hellerud. The official address representation point is used as the canonical display marker for the historical cadastral farm site. This verifies the site anchor, not a claim that the present building is the original eighteenth-century farmhouse. Haugerudtunet 1 / Østre Haugerud gård, Tvetenveien 157 and the legacy coordinate are rejected as proxies.`;
place.address = {
  street: 'Hellerud gårdsvei',
  number: '7',
  postcode: String(selected.postnummer ?? '0671'),
  city: 'Oslo',
  country: 'NO',
};
if (!place.links || typeof place.links !== 'object') place.links = {};
place.links.map = geonorgeUrl;
place.links.website = historyUrl;

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate) || aggregate.filter((entry) => entry?.id === placeId).length !== 1) throw new Error(`${placeId} must exist exactly once in aggregate`);
writeJson(aggregateFile, aggregate.map((entry) => entry?.id === placeId ? place : entry));
writeJson(childFile, place);

const index = readJson(indexFile);
const indexRow = Array.isArray(index) ? index.find((row) => row?.id === placeId) : null;
if (!indexRow) throw new Error(`${placeId} missing from split index`);
for (const key of ['name', 'lat', 'lon', 'r', 'category', 'year', 'coordStatus', 'coordType', 'locatorType', 'sourceProvider', 'sourceObjectId', 'geocodeAccuracy', 'coordRole', 'coordSource', 'coordSourceId', 'coordSourceUrl', 'coordVerifiedAt', 'coordNote', 'address']) {
  if (place[key] !== undefined) indexRow[key] = place[key];
}
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error(`${placeId} missing from split manifest`);
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.name = place.name;
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

const mapping = readJson(mappingFile);
const mappingRow = mapping.mappings?.map_hellerud_gard;
if (!mappingRow || mappingRow.historyGoPlaceId !== placeId) throw new Error('Missing Civication map_hellerud_gard mapping');
mappingRow.name = place.name;
mappingRow.lat = place.lat;
mappingRow.lon = place.lon;
mappingRow.category = place.category;
writeJson(mappingFile, mapping);

writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: aggregateFile,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote: place.coordNote,
  },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Nedre Hellerud – historisk gårdssted, matrikkelforankret som gnr. 143 / bnr. 3',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'historic_site',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'entydig historisk gårdsidentitet',
    'offisielt adressepunkt med samsvarende matrikkelidentitet',
    'eksplisitt avgrensning mellom gårdsstedsanker og påstand om bevart originalbygning',
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'Geonorge Adresser API v1 – Hellerud gårdsvei 7',
      sourceUrl: geonorgeUrl,
      sourceObjectId,
      sourceQuality: 'unique_exact_address_with_cadastral_identity_match',
      finding: `Exactly one current official address hit at Hellerud gårdsvei 7; gnr. ${selected.gardsnummer} / bnr. ${selected.bruksnummer}; representation point ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: 'The official address and cadastral fields match the independently resolved historical Nedre Hellerud farm-site identity.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Pinned Nedre Hellerud cadastral research',
      sourceUrl: researchUrl,
      sourceObjectId: 'history-go-research:nedre-hellerud-cadastral:bc778b5d',
      sourceQuality: 'production_ready_historical_identity_resolution',
      finding: 'Resolves the intended place identity as Nedre Hellerud and locks the cadastral identity to gnr. 143 / bnr. 3, while explicitly rejecting any claim that the present building must be the original farmhouse.',
      canVerifyCoordinate: false,
      reason: 'Defines historical identity and the rule that allows the matching official address to act as a site anchor.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Hellerud, Nordre',
      sourceUrl: historyUrl,
      sourceObjectId: 'oslobyleksikon:hellerud-nordre',
      sourceQuality: 'historical_farm_identity_source',
      finding: 'Documents the Nordre Hellerud historical farm context and the distinction between Øvre and Nedre Hellerud.',
      canVerifyCoordinate: false,
      reason: 'Historical identity context; the exact coordinate comes from the official address/cadastral match.',
    },
  ],
  addressCandidates: [{
    sourceProvider: 'official_address',
    sourceObjectId,
    address: 'Hellerud gårdsvei 7, 0671 Oslo',
    gardsnummer: 143,
    bruksnummer: 3,
    lat,
    lon,
    canApplyToPlace: true,
  }],
  sourceObjectCandidates: [
    { sourceProvider: 'official_address', sourceObjectId, canApplyToPlace: true },
    { sourceProvider: 'manual_research', sourceObjectId: 'oslobyleksikon:hellerud-nordre', canApplyToPlace: false },
  ],
  geometryCandidates: [],
  coordinateCandidates: [{ sourceProvider: 'official_address', sourceObjectId, lat, lon, coordRole: 'display_marker', canApplyToPlace: true }],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Nedre Hellerud is resolved and the unique official address/cadastral anchor is applied to the canonical place.',
  },
  notes: [place.coordNote],
});

let protocol = protocolBefore;
if (!protocol.match(new RegExp(`^\\|[^\\n]*\\\`${placeId}\\\`[^\\n]*needs_review[^\\n]*$`, 'm'))) {
  throw new Error(`${placeId} unresolved protocol row not found before batch 176`);
}
protocol = protocol.replace(new RegExp(`^\\|[^\\n]*\\\`${placeId}\\\`[^\\n]*needs_review[^\\n]*\\n?`, 'm'), '');
const row = `| ${BATCH} | \`${placeId}\` | ${place.name} | verified | \`${sourceObjectId}\` |`;
let insertionIndex = protocol.search(/\n### Dokumenterte Oslo-kontroller uten godkjent koordinat/i);
if (insertionIndex < 0) insertionIndex = protocol.search(/\n##+ [^\n]*Dokumenterte Oslo-kontroller uten godkjent koordinat/i);
if (insertionIndex < 0) throw new Error('Could not locate unresolved Oslo protocol section');
protocol = `${protocol.slice(0, insertionIndex)}\n${row}${protocol.slice(insertionIndex)}`;
protocol = protocol.replace(/(Oslo-protokollen dekker nå )(\d+)( aktive current `verified\*` canonical Oslo-steder\.)/, (_, prefix, count, suffix) => `${prefix}${Number(count) + 1}${suffix}`);
fs.writeFileSync(abs(protocolFile), protocol);

fs.mkdirSync(abs(reportDir), { recursive: true });
writeJson(`${reportDir}/batch-${BATCH}-result.json`, {
  generatedAt: new Date().toISOString(),
  batch: BATCH,
  placeId,
  previousIdentity: oldPlace.name,
  resolvedIdentity: place.name,
  status: 'verified',
  coordinate: { lat, lon, r: place.r, coordRole: place.coordRole, coordType: place.coordType },
  sourceProvider: place.sourceProvider,
  sourceObjectId,
  exactAddressHitCount: exactHits.length,
  cadastralMatchCount: cadastralMatches.length,
  cadastralIdentity: { gardsnummer: selected.gardsnummer, bruksnummer: selected.bruksnummer },
  originalBuildingClaimed: false,
  rejectedProxies: research.rejectedProxies,
});
writeJson(`${reportDir}/geonorge-hellerud-gardsvei-7.json`, geonorge);
writeJson(`${reportDir}/pinned-cadastral-research.json`, research);
fs.writeFileSync(abs(`${reportDir}/sources.md`), `# Nedre Hellerud production sources\n\n- Geonorge Adresser API: ${geonorgeUrl}\n- Oslo byleksikon: ${historyUrl}\n- Pinned production-ready cadastral research: ${researchUrl}\n\nThe canonical marker anchors the historical cadastral farm site gnr. 143 / bnr. 3. It does not claim that the present building is the original eighteenth-century farmhouse.\n`);

console.log(JSON.stringify({ batch: BATCH, placeId, name: place.name, sourceObjectId, lat, lon, gnr: selected.gardsnummer, bnr: selected.bruksnummer, originalBuildingClaimed: false }, null, 2));
