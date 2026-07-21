#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 131;
const date = '2026-07-21';
const placeId = 'revolver_oslo';
const addressStreet = 'Møllergata';
const addressNumber = '32';
const addressLetter = 'B';
const municipalityNumber = '0301';
const officialVenueUrl = 'https://www.revolveroslo.no/';
const officialRegistryUrl = 'https://virksomhet.brreg.no/nb/oppslag/underenheter/992100311';

const aggregateFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur.json');
const childFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur/revolver_oslo.json');
const splitIndexFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur_index.json');
const splitManifestFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur_manifest.json');
const runtimeIndexFile = path.join(root, 'data/places/places_index.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const evidenceManifestFile = path.join(root, 'data/coordinate-evidence/manifest.json');
const evidenceRel = 'oslo/subkultur/revolver_oslo.json';
const evidenceFile = path.join(root, 'data/coordinate-evidence', evidenceRel);
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-131-revolver-address-first');
fs.mkdirSync(reportDir, { recursive: true });
fs.mkdirSync(path.dirname(evidenceFile), { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const norm = (value) => String(value ?? '').toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();

// Address-first with explicit current public-location disambiguation:
// Revolver's own site says Møllergata 32, while the current Brønnøysund unit record
// and Revolver's current TicketCo organizer profile specify 32B. We therefore query
// the official address register by street/number/municipality and require exactly one B hit.
const geonorgeParams = new URLSearchParams({
  adressenavn: addressStreet,
  nummer: addressNumber,
  kommunenummer: municipalityNumber,
  treffPerSide: '100',
});
const geonorgeUrl = `https://ws.geonorge.no/adresser/v1/sok?${geonorgeParams.toString()}`;
const response = await fetch(geonorgeUrl, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Geonorge-kall feilet: HTTP ${response.status}`);
const payload = await response.json();
writeJson(path.join(reportDir, 'geonorge-mollergata-32.json'), payload);
const hits = Array.isArray(payload?.adresser) ? payload.adresser : [];
const exactHits = hits.filter((candidate) =>
  norm(candidate?.adressenavn) === norm(addressStreet) &&
  String(candidate?.nummer ?? '').trim() === addressNumber &&
  String(candidate?.bokstav ?? '').trim().toUpperCase() === addressLetter &&
  String(candidate?.kommunenummer ?? '').trim() === municipalityNumber
);
if (exactHits.length !== 1) {
  const summary = hits.map((hit) => ({ adressetekst: hit?.adressetekst, adressenavn: hit?.adressenavn, nummer: hit?.nummer, bokstav: hit?.bokstav, kommunenummer: hit?.kommunenummer, adressekode: hit?.adressekode }));
  throw new Error(`Revolver kan ikke oppgraderes: forventet ett eksakt Møllergata 32B-treff, fant ${exactHits.length} av ${hits.length}. Treff=${JSON.stringify(summary)}`);
}
const hit = exactHits[0];
const lat = hit?.representasjonspunkt?.lat;
const lon = hit?.representasjonspunkt?.lon;
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Geonorge-treff mangler gyldig representasjonspunkt');
const addressCode = String(hit?.adressekode ?? '').trim();
if (!addressCode) throw new Error('Geonorge-treff mangler adressekode');
const sourceObjectId = `geonorge-adresser-v1:${municipalityNumber}:${addressCode}:${addressNumber}${addressLetter}`;
const postcode = String(hit?.postnummer ?? '').trim();
const cityRaw = String(hit?.poststed || hit?.kommunenavn || '').trim();

const coordinateFields = {
  lat,
  lon,
  r: 60,
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId,
  address: {
    street: addressStreet,
    number: `${addressNumber}${addressLetter}`,
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
  coordNote: `Batch 131 address-first: Revolvers egen nettside oppgir Møllergata 32, mens Brønnøysundregistrenes nåværende beliggenhetsadresse for REVOLVER og Revolvers nåværende TicketCo-profil presiserer Møllergata 32B. Geonorge ble derfor søkt strukturert på Møllergata 32 i kommune 0301, og batchen krevde nøyaktig ett offisielt treff med bokstav B. Treffet ${sourceObjectId} brukes som display-marker for det nåværende venue-lokalet; den gamle manuelt plasserte legacy-koordinaten er erstattet.`,
};

function applyToPlace(place) {
  if (place?.id !== placeId) return place;
  const updated = { ...place, ...coordinateFields };
  delete updated.coordPrecisionM;
  updated.externalLinks = Array.isArray(updated.externalLinks) ? [...updated.externalLinks] : [];
  for (const link of [
    { type: 'official', label: 'Revolver Oslo', url: officialVenueUrl, lang: 'nb', verifiedAt: date },
    { type: 'official_registry', label: 'Brønnøysundregistrene – REVOLVER', url: officialRegistryUrl, lang: 'nb', verifiedAt: date },
  ]) {
    if (!updated.externalLinks.some((item) => item?.url === link.url)) updated.externalLinks.push(link);
  }
  return updated;
}

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate)) throw new Error('places_subkultur.json må være array');
if (aggregate.filter((place) => place?.id === placeId).length !== 1) throw new Error('Revolver må finnes nøyaktig én gang i aggregate');
const oldPlace = aggregate.find((place) => place?.id === placeId);
const updatedAggregate = aggregate.map(applyToPlace);
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const splitIndex = readJson(splitIndexFile);
const indexRow = splitIndex.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('Revolver mangler i split-index');
Object.assign(indexRow, { lat, lon, r: updatedPlace.r, coordStatus: updatedPlace.coordStatus, coordType: updatedPlace.coordType });
writeJson(splitIndexFile, splitIndex);

const splitManifest = readJson(splitManifestFile);
const manifestRow = (splitManifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error('Revolver mangler i split-manifest');
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
  currentCoordinate: { lat, lon, r: updatedPlace.r, coordStatus: updatedPlace.coordStatus, coordSource: updatedPlace.coordSource, coordType: updatedPlace.coordType, coordNote: updatedPlace.coordNote },
  identity: {
    currentName: updatedPlace.name,
    resolvedIdentity: 'Revolver – nåværende rock-/indie-/klubbscene i Møllergata 32B',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: ['nåværende venue-identitet', 'offentlig beliggenhetsadresse', 'ett eksakt Geonorge-adresseobjekt'],
  evidence: [
    {
      sourceProvider: 'manual_research',
      sourceName: 'Revolver Oslo – kontakt/info',
      sourceUrl: officialVenueUrl,
      sourceObjectId: 'revolver-official:mollergata-32',
      sourceQuality: 'official_venue_identity',
      finding: 'Revolvers egen nettside oppgir Møllergata 32, 0179 Oslo og bekrefter den nåværende venue-identiteten.',
      canVerifyCoordinate: false,
      reason: 'Bekrefter venue og hovedadresse, men utelater bokstavleddet som offentlig virksomhetsregister presiserer.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – REVOLVER underenhet',
      sourceUrl: officialRegistryUrl,
      sourceObjectId: 'brreg-underenhet:992100311',
      sourceQuality: 'official_government_location_registry',
      finding: 'Brønnøysundregistrene oppgir beliggenhetsadresse Møllergata 32B, 0179 Oslo, kommune 0301.',
      canVerifyCoordinate: false,
      reason: 'Presiserer bokstavleddet B som brukes til å velge riktig offisielt matrikkeladresseobjekt.',
    },
    {
      sourceProvider: 'official_address',
      sourceName: 'Geonorge Adresser API v1',
      sourceUrl: geonorgeUrl,
      sourceObjectId,
      sourceQuality: 'official_structured_exact_address',
      finding: `Strukturert søk ga nøyaktig ett Møllergata 32B-treff i Oslo: ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: coordinateFields.coordNote,
    },
  ],
  addressCandidates: [{ sourceProvider: 'official_address', sourceObjectId, address: coordinateFields.address, lat, lon, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ sourceProvider: 'official_address', sourceObjectId, lat, lon, coordRole: 'display_marker', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Revolver er oppgradert til verified med Møllergata 32B address-first.' },
  notes: [coordinateFields.coordNote],
});

const evidenceManifest = readJson(evidenceManifestFile);
if (!Array.isArray(evidenceManifest.files)) throw new Error('Evidence manifest mangler files[]');
if (!evidenceManifest.files.includes(evidenceRel)) evidenceManifest.files.push(evidenceRel);
evidenceManifest.files.sort((a, b) => a.localeCompare(b, 'nb'));
writeJson(evidenceManifestFile, evidenceManifest);

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 131 (2026-07-21)')) {
  const row = `| 131 | \`revolver_oslo\` | Revolver | verified | \`${sourceObjectId}\` |`;
  const paragraph = `Batch 131 (2026-07-21) reviderer \`revolver_oslo\` etter address-first-policy. Revolvers egen nettside oppgir Møllergata 32, mens Brønnøysundregistrenes beliggenhetsadresse og nåværende TicketCo-oppføring presiserer Møllergata 32B. Batchen godtar derfor bare et strukturert Geonorge-resultat med nøyaktig adressenavn Møllergata, nummer 32, bokstav B og kommunenummer 0301. Den gamle \`official_site_manual\`/\`legacy_unknown\`-forankringen fjernes og erstattes av offisielt matrikkeladressepunkt.`;
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 131');
  protocol = protocol.replace(marker, `${row}\n\n${paragraph}\n\n${marker}`);
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder:/, (_m, n) => `Oslo-protokollen dekker nå ${Number(n) + 1} aktive current \`verified*\` canonical Oslo-steder:`);
  writeText(protocolFile, protocol);
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  queryMode: 'structured_exact_fields_plus_official_letter_disambiguation',
  totalHits: hits.length,
  exactHits: exactHits.length,
  sourceObjectId,
  lat,
  lon,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 131 – Revolver address-first', '',
  '- venue identity: Revolver Oslo',
  '- venue site address: Møllergata 32',
  '- Brønnøysund current location: Møllergata 32B',
  '- selected address rule: exact Møllergata 32B, municipality 0301',
  `- Geonorge source: \`${sourceObjectId}\``,
  `- coordinate: ${lat}, ${lon}`, '',
  'The address letter is not guessed from proximity: it is required by the current government business-location record and must match exactly one Geonorge address object.',
].join('\n'));

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });

const runtimePlace = readJson(runtimeIndexFile).find((place) => place?.id === placeId);
if (!runtimePlace) throw new Error('Runtime mangler Revolver etter build');
for (const field of ['lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordStatus','coordSource','coordType','coordNote']) {
  if (JSON.stringify(runtimePlace[field] ?? null) !== JSON.stringify(updatedPlace[field] ?? null)) throw new Error(`Runtime/source mismatch for ${field}`);
}

const changedFiles = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (changedFiles.length > 18) throw new Error(`Batch 131 diff-budsjett overskredet: ${changedFiles.length} filer`);
writeJson(path.join(reportDir, 'changed-files.json'), { count: changedFiles.length, files: changedFiles });

console.log(JSON.stringify({ batch, placeId, sourceObjectId, lat, lon, changedFileCount: changedFiles.length }, null, 2));
