#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 137;
const date = '2026-07-21';
const placeId = 'bygdoy_kongeskogen';
const ssrId = 241789;
const sourceObjectId = `kartverket-ssr:${ssrId}`;
const ssrUrl = 'https://api.kartverket.no/stedsnavn/v1/sted?sok=Kongeskogen&knr=0301&treffPerSide=100&side=1';
const governmentUrl = 'https://www.regjeringen.no/no/dokumenter/oslo-kommune---reguleringsplan-for-bygdo/id673093/';
const operatorUrl = 'https://bygdokongsgard.no/kunnskapsformidling';

const aggregateFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_bygdoy.json');
const childFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_bygdoy/bygdoy_kongeskogen.json');
const splitIndexFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_bygdoy_index.json');
const splitManifestFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_bygdoy_manifest.json');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/natur/bygdoy_kongeskogen.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-137-kongeskogen-ssr');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const response = await fetch(ssrUrl, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Kartverket SSR feilet: HTTP ${response.status}`);
const payload = await response.json();
writeJson(path.join(reportDir, 'kartverket-ssr-kongeskogen.json'), payload);

const hits = Array.isArray(payload?.navn) ? payload.navn : [];
const exact = hits.filter((hit) => {
  const spellings = Array.isArray(hit?.stedsnavn) ? hit.stedsnavn : [];
  const hasExactApprovedName = spellings.some((name) =>
    String(name?.skrivemåte ?? '').trim() === 'Kongeskogen' &&
    String(name?.skrivemåtestatus ?? '').trim() === 'godkjent og prioritert'
  );
  const inOslo = Array.isArray(hit?.kommuner) && hit.kommuner.some((municipality) => String(municipality?.kommunenummer ?? '') === '0301');
  return Number(hit?.stedsnummer) === ssrId &&
    String(hit?.stedstatus ?? '') === 'aktiv' &&
    String(hit?.navneobjekttype ?? '') === 'Skog' &&
    hasExactApprovedName &&
    inOslo;
});
if (hits.length !== 1 || exact.length !== 1) {
  throw new Error(`Kongeskogen batch 137 krever nøyaktig ett eksakt aktivt SSR-objekt 241789/Skog i Oslo; total=${hits.length}, exact=${exact.length}`);
}

const hit = exact[0];
const lat = Number(hit?.representasjonspunkt?.nord);
const lon = Number(hit?.representasjonspunkt?.øst);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Kongeskogen SSR mangler gyldig representasjonspunkt');
if (Math.abs(lat - 59.90511) > 1e-7 || Math.abs(lon - 10.66718) > 1e-7) {
  throw new Error(`Kongeskogen SSR-koordinat endret fra diagnostisert resultat: ${lat}, ${lon}`);
}

const coordinateFields = {
  lat,
  lon,
  r: 180,
  locatorType: 'natural_area',
  sourceProvider: 'kartverket',
  sourceObjectId,
  geocodeAccuracy: 'geometric_center',
  coordRole: 'area_anchor',
  coordStatus: 'verified_geometry',
  coordSource: 'Kartverket Sentralt stedsnavnregister – Kongeskogen, objekttype Skog',
  coordSourceId: sourceObjectId,
  coordSourceUrl: ssrUrl,
  coordType: 'named_place_anchor',
  coordVerifiedAt: date,
  coordNote: 'Batch 137 official-map object-type-first: Kartverket SSR gir nøyaktig ett aktivt Kongeskogen-treff i Oslo, objekttype Skog, stedsnummer 241789, med offisielt representasjonspunkt 59.90511, 10.66718. Regjeringens reguleringsvedtak avgrenser S-F1 Kongeskogen som kombinert kulturmiljø-, naturvern- og friluftsområde, og Bygdø Kongsgård bekrefter den lokale stedsidentiteten. SSR-punktet brukes som stabilt navne-/områdeanker fordi den tidligere strenge OSM-kontrollen ikke fant ett entydig navngitt polygon. Punktet er ikke valgt med nearest/first-hit og er ikke en påstand om polygonets geometriske centroid.',
};

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate)) throw new Error('places_oslo_natur_bygdoy.json må være array');
if (aggregate.filter((place) => place?.id === placeId).length !== 1) throw new Error('bygdoy_kongeskogen må finnes nøyaktig én gang i aggregate');
const oldPlace = aggregate.find((place) => place?.id === placeId);
const updatedAggregate = aggregate.map((place) => place?.id === placeId ? { ...place, ...coordinateFields } : place);
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const splitIndex = readJson(splitIndexFile);
const indexRow = splitIndex.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('bygdoy_kongeskogen mangler i split-index');
Object.assign(indexRow, {
  lat,
  lon,
  r: updatedPlace.r,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
  locatorType: updatedPlace.locatorType,
  sourceProvider: updatedPlace.sourceProvider,
  sourceObjectId: updatedPlace.sourceObjectId,
  geocodeAccuracy: updatedPlace.geocodeAccuracy,
  coordRole: updatedPlace.coordRole,
  coordSource: updatedPlace.coordSource,
  coordSourceId: updatedPlace.coordSourceId,
  coordSourceUrl: updatedPlace.coordSourceUrl,
  coordVerifiedAt: updatedPlace.coordVerifiedAt,
  coordNote: updatedPlace.coordNote,
});
writeJson(splitIndexFile, splitIndex);

const splitManifest = readJson(splitManifestFile);
const manifestRow = (splitManifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error('bygdoy_kongeskogen mangler i split-manifest');
splitManifest.source_sha256 = sha256File(aggregateFile);
splitManifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(splitManifestFile, splitManifest);

writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_bygdoy.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat,
    lon,
    r: updatedPlace.r,
    coordStatus: updatedPlace.coordStatus,
    coordSource: updatedPlace.coordSource,
    coordType: updatedPlace.coordType,
    coordNote: updatedPlace.coordNote,
  },
  identity: {
    currentName: updatedPlace.name,
    resolvedIdentity: 'Kongeskogen på Bygdøy som egen navngitt skog- og friluftsområdeidentitet',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'natural_area',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'eksakt aktiv Kartverket SSR-identitet',
    'offisiell område-/scope-kryssjekk',
    'uavhengig lokal identitetskryssjekk',
  ],
  evidence: [
    {
      sourceProvider: 'kartverket',
      sourceName: 'Kartverket Sentralt stedsnavnregister – Kongeskogen, objekttype Skog',
      sourceUrl: ssrUrl,
      sourceObjectId,
      sourceQuality: 'official_named_place_registry',
      finding: 'Ett aktivt Kongeskogen-objekt i Oslo, objekttype Skog, stedsnummer 241789, med offisielt representasjonspunkt 59.90511, 10.66718.',
      canVerifyCoordinate: true,
      reason: 'Offisielt stabilt navne-/områdeobjekt med entydig treff; ingen nearest/first-hit.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Regjeringen – reguleringsplan for Bygdø kongsgård og folkepark',
      sourceUrl: governmentUrl,
      sourceObjectId: 'regjeringen:201100061:kongeskogen-s-f1',
      sourceQuality: 'official_area_identity_crosscheck',
      finding: 'Reguleringsvedtaket avgrenser S-F1 Kongeskogen som kombinert kulturmiljø-, naturvern- og friluftsområde.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker fysisk scope; canonical koordinat kommer fra Kartverket SSR.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Bygdø Kongsgård – Kongeskogen',
      sourceUrl: operatorUrl,
      sourceObjectId: 'bygdokongsgard:kongeskogen',
      sourceQuality: 'official_local_identity_crosscheck',
      finding: 'Bygdø Kongsgård beskriver Kongeskogen som et eget rekreasjonsområde med variert vegetasjon og geologiske verdier.',
      canVerifyCoordinate: false,
      reason: 'Bekrefter lokal identitet og bruk; primærkoordinaten kommer fra det offisielle SSR-objektet.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'kartverket', sourceObjectId, canApplyToPlace: true },
    { sourceProvider: 'manual_research', sourceObjectId: 'regjeringen:201100061:kongeskogen-s-f1', canApplyToPlace: false },
    { sourceProvider: 'manual_research', sourceObjectId: 'bygdokongsgard:kongeskogen', canApplyToPlace: false },
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    { lat, lon, coordRole: 'area_anchor', sourceObjectId, canApplyToPlace: true },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Kartverket SSR-identiteten og representasjonspunktet er anvendt på canonical place.',
  },
  notes: [coordinateFields.coordNote],
});

let protocol = fs.readFileSync(protocolFile, 'utf8');
const staleRow = '| `bygdoy_kongeskogen` – Bygdøy Kongeskogen | needs_review | Identiteten er dokumentert, men kontrollen ga ikke ett entydig eksakt navngitt objekt som passer fysisk objekttype innenfor Bygdøy-boksen. | ett entydig eksakt navngitt fysisk objekt eller offisiell områdegeometri |';
const staleOccurrences = protocol.split(staleRow).length - 1;
if (staleOccurrences !== 1) throw new Error(`Forventet én stale bygdoy_kongeskogen needs_review-rad, fant ${staleOccurrences}`);
protocol = protocol.replace(`${staleRow}\n`, '');

if (!protocol.includes('| 137 | `bygdoy_kongeskogen` |')) {
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch-innsetting');
  const insertion = `| 137 | \`bygdoy_kongeskogen\` | Bygdøy Kongeskogen | verified_geometry | \`${sourceObjectId}\` |\n\nBatch 137 (2026-07-21) løser \`bygdoy_kongeskogen\` med official-map object-type-first etter at tidligere OSM-kontroll ikke fant ett entydig navngitt polygon. Kartverkets Sentralt stedsnavnregister gir nøyaktig ett aktivt Kongeskogen-treff i Oslo, objekttype \`Skog\`, stedsnummer 241789, med offisielt representasjonspunkt 59.90511, 10.66718. Regjeringens reguleringsvedtak kryssjekker S-F1 Kongeskogen som eget kombinert kulturmiljø-, naturvern- og friluftsområde, og Bygdø Kongsgård bekrefter den lokale stedsidentiteten. SSR-punktet brukes som stabilt \`area_anchor\`; det gamle Mapcarta-/nearby-punktet pensjoneres, og ingen nearest/first-hit-logikk brukes.\n\n`;
  protocol = protocol.replace(marker, insertion + marker);
}
fs.writeFileSync(protocolFile, protocol);

writeJson(path.join(reportDir, 'batch-137-result.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  sourceObjectId,
  objectType: hit.navneobjekttype,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
  status: 'verified_geometry',
  method: 'official_map_object_type_first',
});

fs.writeFileSync(
  path.join(reportDir, 'sources.md'),
  `# Batch 137 source chain\n\n- Kartverket SSR: one exact active Kongeskogen object in Oslo, type Skog, stedsnummer 241789, representation point 59.90511 / 10.66718.\n- Regjeringen: S-F1 Kongeskogen is an explicitly regulated combined culture/nature/recreation area.\n- Bygdø Kongsgård: independent local identity and recreation-area cross-check.\n- Previous OSM diagnostic found no exact named polygon and is not used as the coordinate source.\n`,
);

console.log(JSON.stringify({
  batch,
  placeId,
  sourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
  status: 'verified_geometry',
}, null, 2));
