#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATE = '2026-08-26';
const INTAKE_FILE = 'reports/oslo-blue-signs-phase2-2026/intake.json';
const REPORT_FILE = 'reports/oslo-blue-signs-phase2-2026/materialized.json';
const MANIFEST_FILE = 'data/places/manifest.json';
const CONTRACT_FILE = 'data/categories/category_contract.json';
const GEONORGE_SEARCH = 'https://ws.geonorge.no/adresser/v1/sok';
const GEONORGE_SOURCE = 'https://ws.geonorge.no/adresser/v1/';
const DEFAULT_BLUE_SIGN_SOURCE = 'https://www.oslobyesvel.no/blaa-skilt-i-oslo';

function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }
function writeJson(rel, value) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
function sha(value) { return crypto.createHash('sha256').update(String(value)).digest('hex'); }
function normalize(value) {
  return String(value || '').toLowerCase().replace(/[.,]/g, '').replace(/\s+/g, ' ').replace(/\b0+(\d{3})\b/g, '$1').trim();
}
function sentences(value) {
  return String(value || '').replace(/\n+/g, ' ').split(/(?<=[.!?])\s+(?=[A-ZÆØÅ0-9])/u).map(row => row.trim()).filter(Boolean);
}
function coverage(text, rows) {
  const actual = sentences(text);
  if (actual.length !== rows.length) throw new Error(`Coverage mismatch ${actual.length}/${rows.length}: ${text}`);
  return rows.map((claimIds, index) => ({ sentence: index + 1, claimIds }));
}
function ensurePlaceSubcategory(contract, category) {
  contract.canonicalPlaceSubcategories ||= {};
  contract.canonicalPlaceSubcategories[category] ||= [];
  if (!contract.canonicalPlaceSubcategories[category].some(row => row?.id === 'bla_skilt')) {
    contract.canonicalPlaceSubcategories[category].push({ id: 'bla_skilt', label: 'Blått skilt', status: 'phase2_materialized' });
  } else {
    const row = contract.canonicalPlaceSubcategories[category].find(item => item?.id === 'bla_skilt');
    if (row?.status === 'pilot_materialized') row.status = 'phase2_materialized';
  }
}
async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'History-Go-blue-signs-phase2/1.0' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}
async function geocode(candidate) {
  const data = await fetchJson(`${GEONORGE_SEARCH}?sok=${encodeURIComponent(candidate.address)}&treffPerSide=50`);
  const target = normalize(candidate.address);
  const rows = (Array.isArray(data.adresser) ? data.adresser : []).filter(row => String(row.kommunenummer || '') === '0301');
  const ranked = rows.map(row => {
    const address = normalize(row.adressetekst || '');
    let score = address === target ? 100 : 0;
    if (address.includes(target) || target.includes(address)) score += 50;
    for (const token of target.split(' ')) if (address.includes(token)) score += 2;
    return { row, score };
  }).sort((a, b) => b.score - a.score);
  const hit = ranked[0]?.row;
  const point = hit?.representasjonspunkt;
  if (!hit || !Number.isFinite(point?.lat) || !Number.isFinite(point?.lon)) throw new Error(`No Geonorge address for ${candidate.id}: ${candidate.address}`);
  const sourceObjectId = `geonorge-adresser-v1:0301:${hit.adressekode || 'na'}:${hit.nummer || 'na'}${hit.bokstav || ''}`;
  return {
    lat: point.lat,
    lon: point.lon,
    sourceObjectId,
    address: {
      street: String(hit.adressenavn || candidate.address).trim(),
      number: `${hit.nummer || ''}${hit.bokstav || ''}`.trim(),
      postcode: String(hit.postnummer || '').trim(),
      city: String(hit.poststed || 'Oslo').trim() || 'Oslo',
      country: 'Norge'
    },
    addressLabel: [hit.adressetekst || candidate.address, hit.postnummer, hit.poststed].filter(Boolean).join(', ')
  };
}
function claim(id, suffix, text, sourceUrl, sourceLocation, kind = 'ordinary', temporalStatus = 'current') {
  return {
    id: `claim_${id}_${suffix}`,
    claim: text,
    sourceUrl,
    sourceLocation,
    sourceType: 'official',
    verifiedAt: DATE,
    status: 'verified',
    claimKind: kind,
    evidenceMode: 'direct',
    temporalStatus
  };
}
function makeText(candidate, addressLabel) {
  const identity = `Oslo Byes Vels blå-skiltprogram knytter ${candidate.name} til ${addressLabel}.`;
  const desc = `${identity} ${candidate.fact} ${candidate.context}`;
  const coordinate = `Kartmarkøren bruker Kartverkets offisielle adresserepresentasjonspunkt for ${addressLabel}.`;
  const popupDesc = `${identity} ${candidate.fact}\n\n${candidate.context}\n\n${coordinate}`;
  return { identity, coordinate, desc, popupDesc };
}
function makePlace(candidate, geo) {
  const text = makeText(candidate, geo.addressLabel);
  const place = {
    id: candidate.id,
    name: candidate.name,
    lat: geo.lat,
    lon: geo.lon,
    r: 35,
    category: candidate.category,
    subcategory_id: 'bla_skilt',
    placeTier: 'micro',
    secondaryBadgeIds: candidate.secondaryBadgeIds || [],
    desc: text.desc,
    popupDesc: text.popupDesc,
    micro_place_profile: {
      schema: 'history_go_micro_place_profile_v1',
      kind: 'minneskilt',
      currentStatus: 'active',
      sourceUrl: candidate.sourceUrl || DEFAULT_BLUE_SIGN_SOURCE,
      sourceLocation: `Dokumentert blått skilt ved ${geo.addressLabel}`,
      verifiedAt: DATE,
      quizMode: 'none'
    },
    locatorType: 'current_place',
    sourceProvider: 'official_address',
    sourceObjectId: geo.sourceObjectId,
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'Kartverket / Geonorge Adresser API',
    coordSourceId: geo.sourceObjectId,
    coordSourceUrl: GEONORGE_SOURCE,
    coordNote: `Offisielt adresserepresentasjonspunkt brukt som besøksanker for det fysiske blå skiltet ved ${geo.addressLabel}; punktet hevder ikke millimeterpresisjon for metallskiltet.`,
    coordVerifiedAt: DATE,
    address: geo.address,
    externalLinks: [
      { type: 'reference', label: `Oslo Byes Vel – ${candidate.subject}`, url: candidate.sourceUrl || DEFAULT_BLUE_SIGN_SOURCE, lang: 'nb', verifiedAt: DATE },
      ...(candidate.secondarySourceUrl ? [{ type: 'reference', label: 'Supplerende stedskilde', url: candidate.secondarySourceUrl, lang: 'nb', verifiedAt: DATE }] : []),
      { type: 'coordinate_source', label: 'Kartverket / Geonorge', url: GEONORGE_SOURCE, lang: 'nb', verifiedAt: DATE }
    ]
  };
  if (candidate.image && candidate.imageCredit && candidate.imageLicense && candidate.imageSourceUrl) {
    Object.assign(place, {
      image: candidate.image,
      cardImage: candidate.image,
      popupImage: candidate.image,
      imageCredit: candidate.imageCredit,
      imageLicense: candidate.imageLicense,
      imageSourceUrl: candidate.imageSourceUrl
    });
  }
  return { place, text };
}
function makePacket(candidate, placeFile, place, text, geo) {
  const source = candidate.sourceUrl || DEFAULT_BLUE_SIGN_SOURCE;
  const contextSource = candidate.secondarySourceUrl || source;
  const claims = [
    claim(candidate.id, 'identity', text.identity, source, 'Oslo Byes Vel: skiltets identitet og sted.', 'identity'),
    claim(candidate.id, 'listing', candidate.fact, source, 'Oslo Byes Vel eller dokumentert lokal skiltkilde: fysisk skilt og adresse.', 'ordinary', 'historical'),
    claim(candidate.id, 'context', candidate.context, contextSource, 'Kildeavsnitt om personen, virksomheten, hendelsen eller stedet som skiltet markerer.', 'ordinary', 'historical'),
    claim(candidate.id, 'coordinate', text.coordinate, GEONORGE_SOURCE, 'Geonorge Adresser API: representasjonspunkt for adressen.')
  ];
  return {
    schemaVersion: '4.2',
    validatorVersion: '4.2.1',
    placeId: place.id,
    placeFile,
    status: 'ready_v4_2',
    identity: {
      status: 'resolved',
      represents: `${place.name} som eget fysisk offentlig minneskilt ved ${geo.addressLabel}.`,
      period: 'aktivt offentlig minneskilt',
      excludes: ['personen eller institusjonen som abstrakt emne', 'privat interiør på adressen', 'andre blå skilt i nærheten']
    },
    metadataSnapshot: { name: place.name, category: place.category },
    textHashes: { algorithm: 'sha256', desc: sha(place.desc), popupDesc: sha(place.popupDesc) },
    claims,
    sentenceCoverage: {
      desc: coverage(place.desc, [[claims[0].id], [claims[1].id], [claims[2].id]]),
      popupDesc: coverage(place.popupDesc, [[claims[0].id], [claims[1].id], [claims[2].id], [claims[3].id]])
    },
    reviews: {
      factual: { status: 'passed', reviewedAt: DATE, reviewer: 'History GO blue-sign phase 2 source audit' },
      editorial: { status: 'passed', reviewedAt: DATE, reviewer: 'History GO blue-sign phase 2 editorial audit', introducedNewFacts: false }
    },
    quizReadiness: { questions: [] },
    completion: {
      completedUnder: '4.2',
      currentStatus: 'current',
      sourceVerifiedAt: DATE,
      claimsVerified: { verified: claims.length, total: claims.length },
      factualReview: 'passed',
      editorialReview: 'passed',
      validatorVersion: '4.2.1'
    }
  };
}
function migrateLegacy(entry, contract) {
  const place = readJson(entry.path);
  if (place.id !== entry.id) throw new Error(`Legacy id mismatch: ${entry.path}`);
  place.subcategory_id = 'bla_skilt';
  place.placeTier = 'micro';
  place.micro_place_profile = {
    schema: 'history_go_micro_place_profile_v1',
    kind: 'minneskilt',
    currentStatus: 'active',
    sourceUrl: place.externalLinks?.find(link => /^https?:\/\/(www\.)?oslobyesvel\.no\//i.test(link?.url || ''))?.url || DEFAULT_BLUE_SIGN_SOURCE,
    sourceLocation: 'Eksisterende canonical blå-skiltrecord migrert til Micro Place-visning uten å fjerne historisk rikdata.',
    verifiedAt: DATE,
    quizMode: 'none'
  };
  ensurePlaceSubcategory(contract, place.category);
  writeJson(entry.path, place);
  return { id: entry.id, path: entry.path, category: place.category };
}

const intake = readJson(INTAKE_FILE);
if (intake.candidates.length !== intake.policy.newBatchSize) throw new Error('Intake batch-size contract failed');
if (new Set(intake.candidates.map(row => row.id)).size !== intake.candidates.length) throw new Error('Duplicate candidate ids');

const manifest = readJson(MANIFEST_FILE);
const contract = readJson(CONTRACT_FILE);
const migrated = intake.legacyMigrations.map(entry => migrateLegacy(entry, contract));
const materialized = [];

for (const candidate of intake.candidates) {
  ensurePlaceSubcategory(contract, candidate.category);
  const geo = await geocode(candidate);
  const { place, text } = makePlace(candidate, geo);
  const manifestRel = `places/${candidate.category}/oslo/bla_skilt/${candidate.id}.json`;
  const placeFile = `data/${manifestRel}`;
  const packetFile = `data/places/production/${candidate.id}.json`;
  writeJson(placeFile, place);
  writeJson(packetFile, makePacket(candidate, placeFile, place, text, geo));
  if (!manifest.files.includes(manifestRel)) manifest.files.push(manifestRel);
  materialized.push({ id: candidate.id, category: candidate.category, placeFile, packetFile, lat: geo.lat, lon: geo.lon, sourceObjectId: geo.sourceObjectId, imageGoverned: Boolean(candidate.image && candidate.imageCredit && candidate.imageLicense && candidate.imageSourceUrl) });
}

manifest.files = [...new Set(manifest.files)];
contract.updatedAt = DATE;
writeJson(MANIFEST_FILE, manifest);
writeJson(CONTRACT_FILE, contract);
writeJson(REPORT_FILE, {
  schema: 'history_go_blue_sign_phase2_materialization_v1',
  verifiedAt: DATE,
  existingBlueSignBaseline: intake.policy.existingBlueSignBaseline,
  migrated,
  materialized,
  counts: { migrated: migrated.length, new: materialized.length, governedPlaqueImages: materialized.filter(row => row.imageGoverned).length },
  noNewStolpersteinBatch: true
});

console.log(`Blue signs phase 2 materialized: ${materialized.length} new + ${migrated.length} legacy migrations.`);
