#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 129;
const date = '2026-07-21';
const placeId = 'skur13';
const addressQuery = 'Filipstadveien 3 Oslo';
const officialSourceName = 'Oslo kommune – Skur 13';
const officialSourceUrl = 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/skur-13/';

const aggregateFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur.json');
const childFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur/skur13.json');
const splitIndexFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur_index.json');
const splitManifestFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur_manifest.json');
const runtimeIndexFile = path.join(root, 'data/places/places_index.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const evidenceManifestFile = path.join(root, 'data/coordinate-evidence/manifest.json');
const evidenceRel = 'oslo/subkultur/skur13.json';
const evidenceFile = path.join(root, 'data/coordinate-evidence', evidenceRel);
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-129-skur13-address-first');
fs.mkdirSync(reportDir, { recursive: true });
fs.mkdirSync(path.dirname(evidenceFile), { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const rel = (file) => path.relative(root, file).replace(/\\/g, '/');
const norm = (value) => String(value ?? '').toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();

function findBestHit(query, hits) {
  if (!hits.length) return { reason: 'Geonorge returnerte ingen adressetreff.' };
  const q = norm(query);
  const exact = hits.filter((hit) => {
    const text = norm(hit?.adressetekst);
    const withPoststed = norm(`${hit?.adressetekst ?? ''} ${hit?.poststed ?? ''}`);
    const withKommune = norm(`${hit?.adressetekst ?? ''} ${hit?.kommunenavn ?? ''}`);
    return text === q || withPoststed === q || withKommune === q || q.includes(text);
  });
  if (hits.length === 1) return { hit: hits[0], reason: 'Geonorge returnerte ett tydelig adressetreff.' };
  if (exact.length === 1) return { hit: exact[0], reason: 'Geonorge returnerte flere treff, men ett eksakt adressetreff.' };
  return { reason: exact.length > 1 ? 'Flere eksakte Geonorge-treff.' : 'Flere Geonorge-treff uten entydig match.' };
}

const geonorgeUrl = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(addressQuery)}`;
const response = await fetch(geonorgeUrl, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Geonorge-kall feilet: HTTP ${response.status}`);
const payload = await response.json();
writeJson(path.join(reportDir, 'geonorge-filipstadveien-3.json'), payload);
const hits = Array.isArray(payload?.adresser) ? payload.adresser : [];
const { hit, reason } = findBestHit(addressQuery, hits);
if (!hit) throw new Error(`Skur 13 kan ikke oppgraderes: ${reason}`);

const lat = hit?.representasjonspunkt?.lat;
const lon = hit?.representasjonspunkt?.lon;
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Geonorge-treff mangler lat/lon representasjonspunkt');
const municipality = String(hit?.kommunenummer ?? '').trim();
const addressCode = String(hit?.adressekode ?? '').trim();
const number = String(hit?.nummer ?? '').trim();
const letter = String(hit?.bokstav ?? '').trim();
const street = String(hit?.adressenavn ?? '').trim();
const postcode = String(hit?.postnummer ?? '').trim();
const cityRaw = String(hit?.poststed || hit?.kommunenavn || '').trim();
const sourceObjectId = `geonorge-adresser-v1:${municipality}:${addressCode}:${number}${letter}`;
if (!municipality || !addressCode || !number || !street || municipality !== '0301') {
  throw new Error(`Ufullstendig eller feil kommune i Geonorge-treff: ${JSON.stringify({ municipality, addressCode, number, street })}`);
}
if (norm(hit?.adressetekst) !== norm('Filipstadveien 3')) throw new Error(`Uventet Geonorge-adresse: ${hit?.adressetekst}`);

const coordinateFields = {
  lat,
  lon,
  r: 60,
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId,
  address: {
    street,
    number: `${number}${letter}`,
    postcode,
    city: cityRaw === 'OSLO' ? 'Oslo' : cityRaw,
    country: 'NO',
  },
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: sourceObjectId,
  coordSourceUrl: geonorgeUrl,
  coordType: 'address_point',
  coordVerifiedAt: date,
  coordNote: `Batch 129 address-first: Oslo kommune oppgir besøksadresse Filipstadveien 3 for Skur 13. Geonorge Adresser API returnerte ett entydig offisielt adressetreff (${sourceObjectId}). Representasjonspunktet brukes som display-marker for aktivitetshallen; den tidligere manuelle legacy-koordinaten er erstattet og legacy_unknown er fjernet.`,
};

function applyToPlace(place) {
  if (place?.id !== placeId) return place;
  const updated = { ...place, ...coordinateFields };
  delete updated.coordPrecisionM;
  updated.externalLinks = Array.isArray(updated.externalLinks) ? [...updated.externalLinks] : [];
  if (!updated.externalLinks.some((link) => link?.url === officialSourceUrl)) {
    updated.externalLinks.push({ type: 'official', label: officialSourceName, url: officialSourceUrl, lang: 'nb', verifiedAt: date });
  }
  return updated;
}

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate)) throw new Error('places_subkultur.json må være array');
if (aggregate.filter((place) => place?.id === placeId).length !== 1) throw new Error('Skur 13 må finnes nøyaktig én gang i aggregate');
const updatedAggregate = aggregate.map(applyToPlace);
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const splitIndex = readJson(splitIndexFile);
const indexRow = splitIndex.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('Skur 13 mangler i split-index');
Object.assign(indexRow, {
  lat: updatedPlace.lat,
  lon: updatedPlace.lon,
  r: updatedPlace.r,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
});
writeJson(splitIndexFile, splitIndex);

const splitManifest = readJson(splitManifestFile);
const manifestRow = (splitManifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error('Skur 13 mangler i split-manifest');
splitManifest.source_sha256 = sha256File(aggregateFile);
splitManifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(splitManifestFile, splitManifest);

writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: 'data/places/subkultur/oslo/places_subkultur.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: updatedPlace.lat,
    lon: updatedPlace.lon,
    r: updatedPlace.r,
    coordStatus: updatedPlace.coordStatus,
    coordSource: updatedPlace.coordSource,
    coordType: updatedPlace.coordType,
    coordNote: updatedPlace.coordNote,
  },
  identity: {
    currentName: updatedPlace.name,
    resolvedIdentity: 'Skur 13 – aktivitetshall/skatehall i havneskuret på Filipstadveien 3',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: ['offisiell besøksadresse', 'entydig Geonorge-adresseobjekt', 'kryssjekk mot kommunal stedsidentitet'],
  evidence: [
    {
      sourceProvider: 'municipality',
      sourceName: officialSourceName,
      sourceUrl: officialSourceUrl,
      sourceObjectId: 'oslo-kommune:idrettsanlegg:skur-13',
      sourceQuality: 'official_identity_and_visit_address',
      finding: 'Oslo kommune identifiserer Skur 13 som skate-/aktivitetshall og oppgir besøksadresse Filipstadveien 3, 0250 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Fastsetter fysisk identitet og address-first-query.',
    },
    {
      sourceProvider: 'official_address',
      sourceName: 'Geonorge Adresser API v1',
      sourceUrl: geonorgeUrl,
      sourceObjectId,
      sourceQuality: 'official_exact_address',
      finding: `Ett entydig offisielt adressetreff for Filipstadveien 3 med representasjonspunkt ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: coordinateFields.coordNote,
    },
  ],
  addressCandidates: [{ sourceProvider: 'official_address', sourceObjectId, address: coordinateFields.address, lat, lon, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ sourceProvider: 'official_address', sourceObjectId, lat, lon, coordRole: 'display_marker', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Skur 13 er oppgradert til verified med official-address-first.' },
  notes: [coordinateFields.coordNote],
});

const evidenceManifest = readJson(evidenceManifestFile);
if (!Array.isArray(evidenceManifest.files)) throw new Error('Evidence manifest mangler files[]');
if (!evidenceManifest.files.includes(evidenceRel)) evidenceManifest.files.push(evidenceRel);
evidenceManifest.files.sort((a, b) => a.localeCompare(b, 'nb'));
writeJson(evidenceManifestFile, evidenceManifest);

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 129 (2026-07-21)')) {
  const row = `| 129 | \`skur13\` | Skur 13 | verified | \`${sourceObjectId}\` |`;
  const paragraph = `Batch 129 (2026-07-21) reviderer \`skur13\` etter dagens address-first-policy. Oslo kommune oppgir Skur 13 som skate-/aktivitetshall med besøksadresse Filipstadveien 3. Geonorge må returnere ett entydig offisielt adressetreff for nøyaktig Filipstadveien 3 i Oslo før status kan oppgraderes. Den tidligere \`official_site_manual\`/\`legacy_unknown\`-forankringen fjernes; Geonorges representasjonspunkt brukes som display-marker for bygningen.`;
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 129');
  protocol = protocol.replace(marker, `${row}\n\n${paragraph}\n\n${marker}`);
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder:/, (_m, n) => `Oslo-protokollen dekker nå ${Number(n) + 1} aktive current \`verified*\` canonical Oslo-steder:`);
  writeText(protocolFile, protocol);
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  query: addressQuery,
  geonorgeReason: reason,
  sourceObjectId,
  lat,
  lon,
  oldCoordinate: { lat: aggregate.find((place) => place?.id === placeId)?.lat, lon: aggregate.find((place) => place?.id === placeId)?.lon },
  newCoordinate: { lat, lon },
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 129 – Skur 13 address-first', '',
  `- place: \`${placeId}\``,
  `- official visit address: Filipstadveien 3`,
  `- Geonorge source: \`${sourceObjectId}\``,
  `- coordinate: ${lat}, ${lon}`, '',
  'The place is upgraded only because the official municipal visit address and one unambiguous Geonorge address object agree. The former manual legacy anchor is retired.',
].join('\n'));

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });

const runtimePlace = readJson(runtimeIndexFile).find((place) => place?.id === placeId);
if (!runtimePlace) throw new Error('Runtime mangler Skur 13 etter build');
for (const field of ['lat','lon','r','locatorType','sourceProvider','sourceObjectId','geocodeAccuracy','coordRole','coordStatus','coordSource','coordType','coordNote']) {
  if (JSON.stringify(runtimePlace[field] ?? null) !== JSON.stringify(updatedPlace[field] ?? null)) throw new Error(`Runtime/source mismatch for ${field}`);
}

const changedFiles = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (changedFiles.length > 18) throw new Error(`Batch 129 diff-budsjett overskredet: ${changedFiles.length} filer`);
writeJson(path.join(reportDir, 'changed-files.json'), { count: changedFiles.length, files: changedFiles });

console.log(JSON.stringify({ batch, placeId, sourceObjectId, lat, lon, changedFileCount: changedFiles.length }, null, 2));
