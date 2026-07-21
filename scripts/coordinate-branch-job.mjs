#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const date = '2026-07-21';
const batch = 122;
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-122-sport-address-first');
const aggregateFile = path.join(root, 'data/places/sport/europa/norway/oslo_sport.json');
const evidenceDir = path.join(root, 'data/coordinate-evidence/oslo/sport');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');

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

const targets = {
  daelenenga_idrettspark: {
    street: 'Seilduksgata',
    number: '30',
    officialSourceName: 'Oslo kommune – Dælenenga idrettsplass',
    officialSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/dalenenga-idrettsplass/',
    scope: 'Dælenenga idrettspark som samlet idrettsområde',
  },
  gressbanen: {
    street: 'Stasjonsveien',
    number: '24',
    officialSourceName: 'Ready – Gressbanen',
    officialSourceUrl: 'https://ready.no/sted/gressbanen/',
    scope: 'Gressbanen som Ready-anlegg og historisk fotball-/bandyground',
  },
  kfum_arena: {
    street: 'Ekebergveien',
    number: '109',
    officialSourceName: 'KFUM-kameratene Oslo – klubb- og arenaadresse',
    officialSourceUrl: 'https://www.kaaffa.no/om-kfum/fakta-om-klubben',
    scope: 'KFUM Arena som KFUM Oslos hjemmeground',
  },
  nordre_aasen_idrettspark: {
    street: 'Kjelsåsveien',
    number: '7',
    officialSourceName: 'Oslo kommune – Nordre Åsen idrettspark',
    officialSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/nordre-asen-idrettspark/',
    scope: 'Nordre Åsen idrettspark som samlet Skeid- og flerbanekompleks',
  },
};

const places = readJson(aggregateFile);
if (!Array.isArray(places)) throw new Error('oslo_sport.json må være en array');
const byId = new Map(places.filter((place) => place?.id).map((place) => [String(place.id), place]));

const results = [];
for (const [placeId, config] of Object.entries(targets)) {
  const place = byId.get(placeId);
  if (!place) throw new Error('Mangler place: ' + placeId);

  const query = `${config.street} ${config.number} Oslo`;
  const sourceUrl = 'https://ws.geonorge.no/adresser/v1/sok?sok=' + encodeURIComponent(query);
  const response = await fetch(sourceUrl, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`${placeId}: Geonorge HTTP ${response.status}`);
  const raw = await response.json();
  writeJson(path.join(reportDir, `${placeId}-geonorge.json`), raw);

  const parsedNumber = parseNumber(config.number);
  const hits = Array.isArray(raw?.adresser) ? raw.adresser : [];
  const exact = hits.filter((hit) =>
    String(hit?.kommunenummer ?? '').trim() === '0301'
    && norm(hit?.adressenavn) === norm(config.street)
    && String(hit?.nummer ?? '').trim() === parsedNumber.number
    && String(hit?.bokstav ?? '').trim().toUpperCase() === parsedNumber.letter
  );

  if (exact.length !== 1) {
    results.push({ placeId, query, status: 'needs_source', exactHits: exact.length, totalHits: hits.length });
    continue;
  }

  const hit = exact[0];
  const lat = hit?.representasjonspunkt?.lat;
  const lon = hit?.representasjonspunkt?.lon;
  if (typeof lat !== 'number' || typeof lon !== 'number') throw new Error(`${placeId}: treff mangler representasjonspunkt`);
  const sourceObjectId = geonorgeId(hit);
  const addressNumber = String(hit?.nummer ?? '').trim() + String(hit?.bokstav ?? '').trim();
  const note = `Batch 122 address-first: ${config.officialSourceName} dokumenterer besøksadressen ${config.street} ${config.number}. Ett eksakt Oslo-treff i Geonorge Adresser API v1 brukes som canonical display-marker for ${config.scope}. Adressepunktet er ikke en påstand om geometrisk sentrum for hele anlegget; eksisterende radius beholdes som gameplay-/besøksradius.`;

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
  place.coordSourceUrl = sourceUrl;
  place.coordType = 'address_point';
  place.coordVerifiedAt = date;
  place.coordNote = note;
  delete place.coordPrecision;
  delete place.coordPrecisionM;

  results.push({
    placeId,
    query,
    status: 'verified',
    sourceObjectId,
    lat,
    lon,
    r: place.r,
    officialSourceName: config.officialSourceName,
    officialSourceUrl: config.officialSourceUrl,
  });
}

writeJson(aggregateFile, places);
execFileSync('node', ['scripts/split-sport-oslo-places.mjs'], { cwd: root, stdio: 'inherit' });

for (const result of results.filter((item) => item.status === 'verified')) {
  const config = targets[result.placeId];
  const place = byId.get(result.placeId);
  const evidenceFile = path.join(evidenceDir, `${result.placeId}.json`);
  const existing = fs.existsSync(evidenceFile) ? readJson(evidenceFile) : {};
  const addressText = `${place.address.street} ${place.address.number}, ${place.address.postcode} ${place.address.city}`;
  const evidence = {
    schemaVersion: '1.0',
    placeId: result.placeId,
    placeFile: 'data/places/sport/europa/norway/oslo_sport.json',
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
      resolvedIdentity: existing?.identity?.resolvedIdentity || config.scope,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'current_place',
      requiresSplit: false,
      splitReason: '',
    },
    requiredEvidence: [
      'offisiell besøksadresse for det canonical sportsstedet',
      'ett entydig offisielt Geonorge-adressepunkt i Oslo',
      'eksplisitt avgrensning mellom adresse-/displayanker og hele anleggets geometri',
    ],
    evidence: [
      {
        sourceProvider: 'manual_research',
        sourceName: config.officialSourceName,
        sourceUrl: config.officialSourceUrl,
        sourceObjectId: `official-venue-address:${result.placeId}`,
        sourceQuality: 'official_current_visitor_address',
        finding: `${config.officialSourceName} dokumenterer besøksadressen ${config.street} ${config.number}.`,
        canVerifyCoordinate: false,
        reason: 'Primær identitets- og adressekilde som bestemmer hvilket offisielt adressepunkt som skal slås opp.',
      },
      {
        sourceProvider: 'official_address',
        sourceName: `Geonorge Adresser API v1 – ${config.street} ${config.number}`,
        sourceUrl: place.coordSourceUrl,
        sourceObjectId: place.sourceObjectId,
        sourceQuality: 'exact_official_address_after_venue_address_resolution',
        finding: `Ett eksakt Oslo-adressetreff for ${addressText}.`,
        canVerifyCoordinate: true,
        reason: place.coordNote,
      },
    ],
    addressCandidates: [
      {
        address: addressText,
        sourceProvider: 'official_address',
        sourceObjectId: place.sourceObjectId,
        canApplyToPlace: true,
      },
    ],
    sourceObjectCandidates: [
      {
        sourceProvider: 'official_address',
        sourceObjectId: place.sourceObjectId,
        canApplyToPlace: true,
      },
    ],
    geometryCandidates: [],
    coordinateCandidates: [
      {
        lat: place.lat,
        lon: place.lon,
        coordRole: 'display_marker',
        sourceObjectId: place.sourceObjectId,
        canApplyToPlace: true,
      },
    ],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Det entydige Geonorge-adressepunktet er anvendt på canonical place som display-marker.',
    },
    notes: [place.coordNote],
  };
  writeJson(evidenceFile, evidence);
}

const verified = results.filter((item) => item.status === 'verified');
const unresolved = results.filter((item) => item.status !== 'verified');
writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  sourceQueue: 'data/places/sport/europa/norway/oslo_sport.json – four unresolved records from batch 121',
  method: 'official visitor address first; exact Geonorge Oslo hit required; no OSM/nearest fallback on ambiguous or missing address result',
  verified: verified.map((item) => item.placeId),
  unresolved: unresolved.map((item) => item.placeId),
  results,
});

const readme = [
  '# Oslo coordinate control batch 122 – sport address-first closure',
  '',
  'Batch 122 reopens only the four unresolved records from batch 121. Official venue/municipal addresses are resolved before any coordinate lookup. The canonical point is then accepted only when Geonorge returns exactly one matching Oslo address.',
  '',
  '## Verified',
  ...verified.map((item) => `- \`${item.placeId}\` → \`${item.sourceObjectId}\` (${item.query})`),
  '',
  '## Still unresolved',
  ...(unresolved.length ? unresolved.map((item) => `- \`${item.placeId}\` → exact Geonorge hits: ${item.exactHits}`) : ['- none']),
  '',
  'No nearest/first-hit logic or technical-error fallback is used. Broad sports complexes use the official address point as a documented display marker, not as a claim that the point is the geometric center of the complete facility.',
].join('\n');
writeText(path.join(reportDir, 'README.md'), readme);

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 122 (2026-07-21)')) {
  const rows = verified.map((item) => {
    const place = byId.get(item.placeId);
    return `| 122 | \`${item.placeId}\` | ${place.name} | verified | \`${item.sourceObjectId}\` |`;
  }).join('\n');
  const unresolvedText = unresolved.length
    ? ` ${unresolved.map((item) => `\`${item.placeId}\``).join(', ')} forblir needs_source fordi address-first-kontrollen ikke ga ett entydig eksakt Geonorge-treff.`
    : ' Alle fire tidligere åpne batch-121-recordene er dermed lukket.';
  const paragraph = `Batch 122 (2026-07-21) gjenåpner bare de fire uavklarte sportstedene fra batch 121 og bruker dagens låste address-first-policy. Offisielle besøksadresser fra Oslo kommune, Ready og KFUM/Skeid-relaterte primærkilder avgjør adressen før Geonorge-oppslaget. Ett eksakt Oslo-treff kreves; ingen nearest/first-hit- eller teknisk-feil-fallback brukes. For brede idrettsparker er adressepunktet eksplisitt et display-/besøksanker, ikke et påstått geometrisk sentrum.${unresolvedText}`;
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for innsetting av batch 122');
  protocol = protocol.replace(marker, `${rows}\n\n${paragraph}\n\n${marker}`);
  writeText(protocolFile, protocol);
}

console.log(JSON.stringify({ batch, verified: verified.length, unresolved: unresolved.length, results }, null, 2));
