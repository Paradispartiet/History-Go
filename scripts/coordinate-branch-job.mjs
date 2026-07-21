#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 133;
const date = '2026-07-21';
const placeId = 'club_7_vika';
const street = 'Munkedamsveien';
const number = '15';
const municipality = '0301';
const scenewebUrl = 'https://fnma.sceneweb.no/nb/organisation/39671/Club_7';
const osloByleksikonUrl = 'https://oslobyleksikon.no/index.php?title=Club_7';
const roverstadenUrl = 'https://www.roverstaden.no/omroverstaden';

const aggregateFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur.json');
const childFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur/club_7_vika.json');
const splitIndexFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur_index.json');
const splitManifestFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur_manifest.json');
const runtimeIndexFile = path.join(root, 'data/places/places_index.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const evidenceManifestFile = path.join(root, 'data/coordinate-evidence/manifest.json');
const evidenceRel = 'oslo/subkultur/club_7_vika.json';
const evidenceFile = path.join(root, 'data/coordinate-evidence', evidenceRel);
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-133-club7-historical-address');
fs.mkdirSync(reportDir, { recursive: true });
fs.mkdirSync(path.dirname(evidenceFile), { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const norm = (value) => String(value ?? '').toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();

// The record explicitly represents Club 7's long final period at Munkedamsveien 15,
// not every Club 7 location from 1963–1985. Historical sources resolve that identity first;
// the official address object is then used only as the physical historical anchor.
const params = new URLSearchParams({
  adressenavn: street,
  nummer,
  kommunenummer: municipality,
  treffPerSide: '100',
});
const geonorgeUrl = `https://ws.geonorge.no/adresser/v1/sok?${params.toString()}`;
const response = await fetch(geonorgeUrl, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Geonorge-kall feilet: HTTP ${response.status}`);
const payload = await response.json();
writeJson(path.join(reportDir, 'geonorge-munkedamsveien-15.json'), payload);
const hits = Array.isArray(payload?.adresser) ? payload.adresser : [];
const exact = hits.filter((hit) =>
  norm(hit?.adressenavn) === norm(street) &&
  String(hit?.nummer ?? '').trim() === number &&
  String(hit?.bokstav ?? '').trim() === '' &&
  String(hit?.kommunenummer ?? '').trim() === municipality
);
if (exact.length !== 1) {
  const summary = hits.map((hit) => ({ adressetekst: hit?.adressetekst, nummer: hit?.nummer, bokstav: hit?.bokstav, kommunenummer: hit?.kommunenummer, adressekode: hit?.adressekode }));
  throw new Error(`Club 7 krever ett eksakt Munkedamsveien 15-adresseobjekt uten bokstav; fant ${exact.length} av ${hits.length}. Treff=${JSON.stringify(summary)}`);
}
const hit = exact[0];
const lat = hit?.representasjonspunkt?.lat;
const lon = hit?.representasjonspunkt?.lon;
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Munkedamsveien 15 mangler representasjonspunkt');
const addressCode = String(hit?.adressekode ?? '').trim();
if (!addressCode) throw new Error('Munkedamsveien 15 mangler adressekode');
const sourceObjectId = `geonorge-adresser-v1:${municipality}:${addressCode}:${number}`;
const postcode = String(hit?.postnummer ?? '').trim();
const poststed = String(hit?.poststed || hit?.kommunenavn || '').trim();

const coordinateFields = {
  lat,
  lon,
  r: 90,
  locatorType: 'historic_site',
  sourceProvider: 'official_address',
  sourceObjectId,
  address: {
    street,
    number,
    postcode,
    city: poststed === 'OSLO' ? 'Oslo' : poststed,
    country: 'NO',
  },
  geocodeAccuracy: 'rooftop',
  coordRole: 'historical_anchor',
  coordStatus: 'verified_historical_source',
  coordSource: 'Geonorge Adresser API v1 – Munkedamsveien 15; historical occupancy documented by Sceneweb and Oslo byleksikon',
  coordSourceId: sourceObjectId,
  coordSourceUrl: geonorgeUrl,
  coordType: 'historical_address_point',
  coordVerifiedAt: date,
  coordNote: `Batch 133 historical-source + address-first: Recorden representerer eksplisitt Club 7s siste og lengste periode, 1971–1985, ikke alle tidligere lokasjoner. Sceneweb dokumenterer at Club 7 flyttet til underetasjen i Konserthuset sommeren 1971 og ble der til 1985; Oslo byleksikon oppgir Munkedamsveien 15, og dagens Røverstaden beskriver Club 7 som tidligere virksomhet i de samme lokalene. Ett eksakt offisielt Geonorge-adresseobjekt for Munkedamsveien 15 (${sourceObjectId}) brukes derfor som historical-anchor. Punktet er ikke en påstand om én fast Club 7-lokasjon gjennom hele 1963–1985-perioden.`,
};

function applyToPlace(place) {
  if (place?.id !== placeId) return place;
  const updated = { ...place, ...coordinateFields };
  delete updated.coordPrecisionM;
  updated.externalLinks = Array.isArray(updated.externalLinks) ? [...updated.externalLinks] : [];
  for (const link of [
    { type: 'historical_source', label: 'Sceneweb – Club 7', url: scenewebUrl, lang: 'nb', verifiedAt: date },
    { type: 'historical_source', label: 'Oslo byleksikon – Club 7', url: osloByleksikonUrl, lang: 'nb', verifiedAt: date },
    { type: 'current_site_history', label: 'Røverstaden – historien til lokalene', url: roverstadenUrl, lang: 'nb', verifiedAt: date },
  ]) {
    if (!updated.externalLinks.some((item) => item?.url === link.url)) updated.externalLinks.push(link);
  }
  return updated;
}

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate)) throw new Error('places_subkultur.json må være array');
if (aggregate.filter((place) => place?.id === placeId).length !== 1) throw new Error('Club 7 må finnes nøyaktig én gang i aggregate');
const oldPlace = aggregate.find((place) => place?.id === placeId);
const updatedAggregate = aggregate.map(applyToPlace);
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const splitIndex = readJson(splitIndexFile);
const indexRow = splitIndex.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('Club 7 mangler i split-index');
Object.assign(indexRow, { lat, lon, r: updatedPlace.r, coordStatus: updatedPlace.coordStatus, coordType: updatedPlace.coordType });
writeJson(splitIndexFile, splitIndex);

const splitManifest = readJson(splitManifestFile);
const manifestRow = (splitManifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error('Club 7 mangler i split-manifest');
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
    resolvedIdentity: 'Club 7 – Munkedamsveien 15-perioden 1971–1985, med eksplisitt fler-lokasjonsforbehold for 1963–1971',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'historic_site',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: ['historisk kilde for representert periode', 'eksakt fysisk adresse for den perioden', 'nåværende lokal-kontinuitet som kryssjekk'],
  evidence: [
    {
      sourceProvider: 'manual_research',
      sourceName: 'Sceneweb – Club 7',
      sourceUrl: scenewebUrl,
      sourceObjectId: 'sceneweb-organisation:39671:club7-munkedamsveien-period',
      sourceQuality: 'national_performing_arts_historical_database',
      finding: 'Sceneweb dokumenterer Club 7s mange lokasjoner og at klubben flyttet til Konserthusets underetasje sommeren 1971 og ble der til 1985; Munkedamsveien 15 omtales i lokalhistorikken.',
      canVerifyCoordinate: true,
      reason: 'Fastsetter at denne recordens representerte periode faktisk hører til Konserthus-/Munkedamsveien-lokalene.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Club 7',
      sourceUrl: osloByleksikonUrl,
      sourceObjectId: 'oslobyleksikon:club7:munkedamsveien15:1971-1985',
      sourceQuality: 'city_historical_reference',
      finding: 'Oslo byleksikon oppgir eksplisitt Munkedamsveien 15 for Club 7 i perioden 1971–1985.',
      canVerifyCoordinate: true,
      reason: 'Binder den historiske perioden til den konkrete adressen.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Røverstaden – om lokalene',
      sourceUrl: roverstadenUrl,
      sourceObjectId: 'roverstaden:munkedamsveien15:club7-history',
      sourceQuality: 'current_site_historical_continuity',
      finding: 'Dagens virksomhet i Munkedamsveien 15 beskriver Club 7 som tidligere aktør i de samme lokalene.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker lokal-kontinuiteten, men er ikke alene historisk koordinatkilde.',
    },
    {
      sourceProvider: 'official_address',
      sourceName: 'Geonorge Adresser API v1',
      sourceUrl: geonorgeUrl,
      sourceObjectId,
      sourceQuality: 'official_exact_address',
      finding: `Ett eksakt offisielt adresseobjekt for Munkedamsveien 15 ved ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: 'Gir det stabile fysiske adressepunktet etter at historiske kilder har bundet Club 7-perioden til adressen.',
    },
  ],
  addressCandidates: [{ sourceProvider: 'official_address', sourceObjectId, address: coordinateFields.address, lat, lon, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ sourceProvider: 'official_address', sourceObjectId, lat, lon, coordRole: 'historical_anchor', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Club 7s Munkedamsveien 15-periode er oppgradert til verified_historical_source.' },
  notes: [coordinateFields.coordNote],
});

const evidenceManifest = readJson(evidenceManifestFile);
if (!Array.isArray(evidenceManifest.files)) throw new Error('Evidence manifest mangler files[]');
if (!evidenceManifest.files.includes(evidenceRel)) evidenceManifest.files.push(evidenceRel);
evidenceManifest.files.sort((a, b) => a.localeCompare(b, 'nb'));
writeJson(evidenceManifestFile, evidenceManifest);

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 133 (2026-07-21)')) {
  const row = `| 133 | \`club_7_vika\` | Club 7 | verified_historical_source | \`${sourceObjectId}\` |`;
  const paragraph = `Batch 133 (2026-07-21) reviderer \`club_7_vika\` som et historisk fler-lokasjonssted med eksplisitt representert periode. Recorden bruker Munkedamsveien 15-perioden 1971–1985 som kartanker. Sceneweb dokumenterer flyttingen til Konserthusets underetasje i 1971 og driften frem til 1985; Oslo byleksikon oppgir Munkedamsveien 15, og Røverstaden bekrefter kontinuiteten i lokalene. Etter denne historiske identitetsavklaringen brukes ett eksakt Geonorge-adresseobjekt for Munkedamsveien 15 som \`historical_anchor\`. Status er \`verified_historical_source\`, ikke en påstand om at Club 7 lå her gjennom hele 1963–1985.`;
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 133');
  protocol = protocol.replace(marker, `${row}\n\n${paragraph}\n\n${marker}`);
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder:/, (_m, n) => `Oslo-protokollen dekker nå ${Number(n) + 1} aktive current \`verified*\` canonical Oslo-steder:`);
  writeText(protocolFile, protocol);
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  representedPeriod: '1971-1985',
  historicalSources: ['sceneweb-organisation:39671', 'oslobyleksikon:club7:munkedamsveien15'],
  sourceObjectId,
  lat,
  lon,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 133 – Club 7 historical Munkedamsveien anchor', '',
  '- represented period: 1971–1985',
  '- historical identity: Club 7 in the Konserthus/Munkedamsveien 15 premises',
  `- official address object: \`${sourceObjectId}\``,
  `- coordinate: ${lat}, ${lon}`,
  '- status: verified_historical_source', '',
  'The point represents the long final Munkedamsveien period only. Earlier Club 7 locations remain explicit in the content and are not collapsed into this coordinate.',
].join('\n'));

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });

const runtimePlace = readJson(runtimeIndexFile).find((place) => place?.id === placeId);
if (!runtimePlace) throw new Error('Runtime mangler Club 7 etter build');
for (const field of ['lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordStatus','coordSource','coordType','coordNote']) {
  if (JSON.stringify(runtimePlace[field] ?? null) !== JSON.stringify(updatedPlace[field] ?? null)) throw new Error(`Runtime/source mismatch for ${field}`);
}

const changedFiles = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (changedFiles.length > 18) throw new Error(`Batch 133 diff-budsjett overskredet: ${changedFiles.length} filer`);
writeJson(path.join(reportDir, 'changed-files.json'), { count: changedFiles.length, files: changedFiles });

console.log(JSON.stringify({ batch, placeId, sourceObjectId, lat, lon, changedFileCount: changedFiles.length }, null, 2));
