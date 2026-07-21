#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 134;
const date = '2026-07-21';
const placeId = 'norges_varemesse';
const street = 'Drammensveien';
const number = '154';
const municipality = '0301';
const osloByleksikonUrl = 'https://oslobyleksikon.no/side/Norges_Varemesse';
const snlUrl = 'https://snl.no/Norges_Varemesse';
const novaHistoryUrl = 'https://novaspektrum.no/rapport/2023/stiftelsen-nova-spektrum-i-mer-enn-100-ar/';

const aggregateFile = path.join(root, 'data/places/naeringsliv/oslo/places_naeringsliv.json');
const childFile = path.join(root, 'data/places/naeringsliv/oslo/places_naeringsliv/norges_varemesse.json');
const splitIndexFile = path.join(root, 'data/places/naeringsliv/oslo/places_naeringsliv_index.json');
const splitManifestFile = path.join(root, 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json');
const runtimeIndexFile = path.join(root, 'data/places/places_index.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/naeringsliv/norges_varemesse.json');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-134-norges-varemesse-sjolyst');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const norm = (value) => String(value ?? '').toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();

// Historical identity first: this Oslo record is redefined from the institution as a whole
// to its concrete Sjølystsenteret/Messehallen period, 1962–2002. Only after that scope is
// fixed do we use the official current address object as a historical physical anchor.
const params = new URLSearchParams({
  adressenavn: street,
  nummer: number,
  kommunenummer: municipality,
  treffPerSide: '100',
});
const geonorgeUrl = `https://ws.geonorge.no/adresser/v1/sok?${params.toString()}`;
const response = await fetch(geonorgeUrl, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Geonorge-kall feilet: HTTP ${response.status}`);
const payload = await response.json();
writeJson(path.join(reportDir, 'geonorge-drammensveien-154.json'), payload);
const hits = Array.isArray(payload?.adresser) ? payload.adresser : [];
const exact = hits.filter((hit) =>
  norm(hit?.adressenavn) === norm(street) &&
  String(hit?.nummer ?? '').trim() === number &&
  String(hit?.bokstav ?? '').trim() === '' &&
  String(hit?.kommunenummer ?? '').trim() === municipality
);
if (exact.length !== 1) {
  const summary = hits.map((hit) => ({ adressetekst: hit?.adressetekst, nummer: hit?.nummer, bokstav: hit?.bokstav, kommunenummer: hit?.kommunenummer, adressekode: hit?.adressekode }));
  throw new Error(`Sjølystsenteret krever ett eksakt Drammensveien 154-adresseobjekt uten bokstav; fant ${exact.length} av ${hits.length}. Treff=${JSON.stringify(summary)}`);
}
const hit = exact[0];
const lat = hit?.representasjonspunkt?.lat;
const lon = hit?.representasjonspunkt?.lon;
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Drammensveien 154 mangler representasjonspunkt');
const addressCode = String(hit?.adressekode ?? '').trim();
if (!addressCode) throw new Error('Drammensveien 154 mangler adressekode');
const addressSourceObjectId = `geonorge-adresser-v1:${municipality}:${addressCode}:${number}`;
const historicalSourceObjectId = 'oslobyleksikon:norges-varemesse-sjolyst:1962-2002';
const postcode = String(hit?.postnummer ?? '').trim();
const poststed = String(hit?.poststed || hit?.kommunenavn || '').trim();

const coordinateFields = {
  lat,
  lon,
  r: 160,
  locatorType: 'historic_site',
  sourceProvider: 'manual_research',
  sourceObjectId: historicalSourceObjectId,
  address: {
    street,
    number,
    postcode,
    city: poststed === 'OSLO' ? 'Oslo' : poststed,
    country: 'NO',
  },
  geocodeAccuracy: 'historical_approximation',
  coordRole: 'historical_anchor',
  coordStatus: 'verified_historical_source',
  coordSource: 'Oslo byleksikon – Norges Varemesse at Drammensveien 154, 1962–2002; physical address anchor from Geonorge Adresser API v1',
  coordSourceId: historicalSourceObjectId,
  coordSourceUrl: osloByleksikonUrl,
  coordType: 'demolished_historical_venue_address_anchor',
  coordVerifiedAt: date,
  coordNote: `Batch 134 historical identity normalization: Recorden representerer nå eksplisitt Norges Varemesses Sjølystsenter/Messehall i Drammensveien 154 fra åpningen i 1962 til flyttingen til Lillestrøm i 2002. Oslo byleksikon dokumenterer adressen, perioden og at Messehallen senere ble revet; SNL og NOVA Spektrums historikk dokumenterer flyttingen. Det eksakte Geonorge-adresseobjektet ${addressSourceObjectId} brukes bare som dagens fysiske adresseanker for det historiske stedet. Fordi den opprinnelige messebygningen er revet, er punktet klassifisert som historical_approximation/historical_anchor og ikke som et nåværende bygningspunkt.`,
};

function applyToPlace(place) {
  if (place?.id !== placeId) return place;
  const updated = {
    ...place,
    name: 'Norges Varemesse – Sjølystsenteret',
    year: 1962,
    desc: 'Historisk messe- og utstillingsanlegg på Sjølyst, der Norges Varemesse holdt til fra 1962 til flyttingen til Lillestrøm i 2002.',
    popupDesc: 'Norges Varemesse åpnet Sjølystsenteret, også kalt Messehallen, i Drammensveien 154 i 1962. I fire tiår var anlegget et av landets viktigste møtesteder for industri, handel, produktlanseringer, publikumsmesser, konferanser og store kulturarrangementer.\n\nHistory Go-recorden representerer dette konkrete Oslo-stedet og perioden 1962–2002, ikke stiftelsen Norges Varemesse gjennom hele historien fra 1920 og ikke dagens NOVA Spektrum i Lillestrøm. Etter flyttingen i 2002 ble Messehallen revet, og området ble transformert til boliger og næringsbygg. Det gjør stedet til et tydelig eksempel på hvordan næringslivets arenaer flytter og hvordan tidligere messe- og industriområder bygges om.',
    ...coordinateFields,
  };
  updated.externalLinks = Array.isArray(updated.externalLinks) ? [...updated.externalLinks] : [];
  for (const link of [
    { type: 'historical_source', label: 'Oslo byleksikon – Norges Varemesse', url: osloByleksikonUrl, lang: 'nb', verifiedAt: date },
    { type: 'reference', label: 'Store norske leksikon – Norges Varemesse', url: snlUrl, lang: 'nb', verifiedAt: date },
    { type: 'institution_history', label: 'NOVA Spektrum – mer enn 100 års historie', url: novaHistoryUrl, lang: 'nb', verifiedAt: date },
  ]) {
    if (!updated.externalLinks.some((item) => item?.url === link.url)) updated.externalLinks.push(link);
  }
  return updated;
}

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate)) throw new Error('places_naeringsliv.json må være array');
if (aggregate.filter((place) => place?.id === placeId).length !== 1) throw new Error('Norges Varemesse må finnes nøyaktig én gang i aggregate');
const oldPlace = aggregate.find((place) => place?.id === placeId);
const updatedAggregate = aggregate.map(applyToPlace);
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const splitIndex = readJson(splitIndexFile);
const indexRow = splitIndex.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('Norges Varemesse mangler i split-index');
Object.assign(indexRow, {
  name: updatedPlace.name,
  lat,
  lon,
  r: updatedPlace.r,
  year: updatedPlace.year,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
});
writeJson(splitIndexFile, splitIndex);

const splitManifest = readJson(splitManifestFile);
const manifestRow = (splitManifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error('Norges Varemesse mangler i split-manifest');
manifestRow.name = updatedPlace.name;
splitManifest.source_sha256 = sha256File(aggregateFile);
splitManifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(splitManifestFile, splitManifest);

writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: 'data/places/naeringsliv/oslo/places_naeringsliv.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat, lon, r: updatedPlace.r, coordStatus: updatedPlace.coordStatus, coordSource: updatedPlace.coordSource, coordType: updatedPlace.coordType, coordNote: updatedPlace.coordNote },
  identity: {
    currentName: updatedPlace.name,
    resolvedIdentity: 'Norges Varemesse – Sjølystsenteret/Messehallen, Drammensveien 154, 1962–2002',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'historic_site',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: ['beslutning om fysisk Oslo-scope', 'historisk kilde for adresse og periode', 'stabilt fysisk adresseanker med rivningsforbehold'],
  evidence: [
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Norges Varemesse',
      sourceUrl: osloByleksikonUrl,
      sourceObjectId: historicalSourceObjectId,
      sourceQuality: 'city_historical_reference_with_exact_address_and_period',
      finding: 'Oslo byleksikon dokumenterer den tidligere Messehallen/Sjølystsenteret i Drammensveien 154, åpnet 1962, fraflyttet 2002 og senere revet.',
      canVerifyCoordinate: true,
      reason: 'Løser recorden som ett konkret historisk Oslo-sted og binder perioden til adressen.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Store norske leksikon – Norges Varemesse',
      sourceUrl: snlUrl,
      sourceObjectId: 'snl:norges-varemesse:sjolyst-40-ar',
      sourceQuality: 'national_reference_history',
      finding: 'SNL dokumenterer omtrent 40 års virksomhet i egne messelokaler på Sjølyst og flytting til Lillestrøm i august 2002.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker periode og flytting, men hovedadresseidentiteten kommer fra Oslo byleksikon.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'NOVA Spektrum – institusjonshistorie',
      sourceUrl: novaHistoryUrl,
      sourceObjectId: 'nova-spektrum:history:1962-sjolyst',
      sourceQuality: 'first_party_institution_history',
      finding: 'Institusjonens egen historikk dokumenterer flyttingen til Sjølyst i 1962 og den senere institusjonelle kontinuiteten.',
      canVerifyCoordinate: false,
      reason: 'Bekrefter at Oslo-recorden må avgrenses fra dagens Lillestrøm-anlegg.',
    },
    {
      sourceProvider: 'official_address',
      sourceName: 'Geonorge Adresser API v1',
      sourceUrl: geonorgeUrl,
      sourceObjectId: addressSourceObjectId,
      sourceQuality: 'official_exact_current_address_anchor_for_demolished_site',
      finding: `Ett eksakt offisielt adresseobjekt for Drammensveien 154 ved ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: 'Gir fysisk adresseanker etter at historiske kilder har bundet den revne Messehallen til adressen; punktet behandles som historisk approksimasjon, ikke nåværende bygningsfotavtrykk.',
    },
  ],
  addressCandidates: [{ sourceProvider: 'official_address', sourceObjectId: addressSourceObjectId, address: coordinateFields.address, lat, lon, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: 'manual_research', sourceObjectId: historicalSourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ sourceProvider: 'official_address', sourceObjectId: addressSourceObjectId, lat, lon, coordRole: 'historical_anchor', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Identity-splitten er løst ved å avgrense place-recorden til Sjølystsenteret/Messehallen 1962–2002.' },
  notes: [coordinateFields.coordNote],
});

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 134 (2026-07-21)')) {
  const row = `| 134 | \`norges_varemesse\` | Norges Varemesse – Sjølystsenteret | verified_historical_source | \`${historicalSourceObjectId}\` |`;
  const paragraph = `Batch 134 (2026-07-21) løser identity-splitten i \`norges_varemesse\` ved å avgrense Oslo-place-recorden til Sjølystsenteret/Messehallen i Drammensveien 154, 1962–2002. Recorden representerer ikke lenger institusjonen Norges Varemesse fra 1920 til i dag eller dagens NOVA Spektrum i Lillestrøm. Oslo byleksikon er primær historisk kildeidentitet og dokumenterer adresse, periode, flytting og rivning. Ett eksakt Geonorge-adresseobjekt brukes som fysisk \`historical_anchor\`; fordi Messehallen er revet, klassifiseres punktet som \`historical_approximation\`, ikke som et nåværende bygningspunkt.`;
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 134');
  protocol = protocol.replace(marker, `${row}\n\n${paragraph}\n\n${marker}`);
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder:/, (_m, n) => `Oslo-protokollen dekker nå ${Number(n) + 1} aktive current \`verified*\` canonical Oslo-steder:`);
  writeText(protocolFile, protocol);
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  normalizedIdentity: 'Norges Varemesse – Sjølystsenteret, 1962-2002',
  historicalSourceObjectId,
  addressSourceObjectId,
  lat,
  lon,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 134 – Norges Varemesse at Sjølyst', '',
  '- normalized physical identity: Sjølystsenteret / Messehallen',
  '- represented period: 1962–2002',
  '- historical address: Drammensveien 154',
  `- historical source identity: \`${historicalSourceObjectId}\``,
  `- physical address object: \`${addressSourceObjectId}\``,
  `- coordinate: ${lat}, ${lon}`,
  '- status: verified_historical_source', '',
  'The record no longer represents the institution across all locations. The demolished Oslo venue is the canonical place scope; the current address point is used only as an explicitly approximate historical anchor.',
].join('\n'));

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });

const runtimePlace = readJson(runtimeIndexFile).find((place) => place?.id === placeId);
if (!runtimePlace) throw new Error('Runtime mangler Norges Varemesse etter build');
for (const field of ['name','year','lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordStatus','coordSource','coordType','coordNote']) {
  if (JSON.stringify(runtimePlace[field] ?? null) !== JSON.stringify(updatedPlace[field] ?? null)) throw new Error(`Runtime/source mismatch for ${field}`);
}

const changedFiles = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (changedFiles.length > 18) throw new Error(`Batch 134 diff-budsjett overskredet: ${changedFiles.length} filer`);
writeJson(path.join(reportDir, 'changed-files.json'), { count: changedFiles.length, files: changedFiles });

console.log(JSON.stringify({ batch, placeId, historicalSourceObjectId, addressSourceObjectId, lat, lon, changedFileCount: changedFiles.length }, null, 2));
