#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 138;
const date = '2026-07-21';
const placeId = 'bygdoy_bygdoynes';
const ssrId = 732865;
const sourceObjectId = `kartverket-ssr:${ssrId}`;
const ssrUrl = 'https://api.kartverket.no/stedsnavn/v1/sted?sok=Bygd%C3%B8ynes&knr=0301&treffPerSide=100&side=1';
const snlUrl = 'https://snl.no/Bygd%C3%B8ynes';

const aggregateFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_bygdoy.json');
const childFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_bygdoy/bygdoy_bygdoynes.json');
const indexFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_bygdoy_index.json');
const manifestFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_bygdoy_manifest.json');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/natur/bygdoy_bygdoynes.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-138-bygdoynes-ssr');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const response = await fetch(ssrUrl, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Kartverket SSR feilet: HTTP ${response.status}`);
const payload = await response.json();
writeJson(path.join(reportDir, 'kartverket-ssr-bygdoynes.json'), payload);
const hits = Array.isArray(payload?.navn) ? payload.navn : [];
const exact = hits.filter((hit) => {
  const exactName = (hit?.stedsnavn || []).some((name) =>
    String(name?.skrivemåte ?? '') === 'Bygdøynes' &&
    String(name?.skrivemåtestatus ?? '') === 'godkjent og prioritert'
  );
  const inOslo = (hit?.kommuner || []).some((municipality) => String(municipality?.kommunenummer ?? '') === '0301');
  return Number(hit?.stedsnummer) === ssrId &&
    String(hit?.stedstatus ?? '') === 'aktiv' &&
    String(hit?.navneobjekttype ?? '') === 'Nes i sjø' && exactName && inOslo;
});
if (hits.length !== 1 || exact.length !== 1) throw new Error(`Bygdøynes batch 138 krever ett eksakt aktivt SSR-objekt; total=${hits.length}, exact=${exact.length}`);
const hit = exact[0];
const lat = Number(hit?.representasjonspunkt?.nord);
const lon = Number(hit?.representasjonspunkt?.øst);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Bygdøynes SSR mangler representasjonspunkt');
if (Math.abs(lat - 59.90369) > 1e-7 || Math.abs(lon - 10.70131) > 1e-7) throw new Error(`Bygdøynes SSR-koordinat endret: ${lat}, ${lon}`);

const fields = {
  lat,
  lon,
  r: 120,
  locatorType: 'natural_area',
  sourceProvider: 'kartverket',
  sourceObjectId,
  geocodeAccuracy: 'geometric_center',
  coordRole: 'area_anchor',
  coordStatus: 'verified_geometry',
  coordSource: 'Kartverket Sentralt stedsnavnregister – Bygdøynes, objekttype Nes i sjø',
  coordSourceId: sourceObjectId,
  coordSourceUrl: ssrUrl,
  coordType: 'named_place_anchor',
  coordVerifiedAt: date,
  coordNote: 'Batch 138 official-map object-type-first: Kartverket SSR gir nøyaktig ett aktivt Bygdøynes-treff i Oslo, objekttype Nes i sjø, stedsnummer 732865, med offisielt representasjonspunkt 59.90369, 10.70131. Store norske leksikon kryssjekker identiteten som det ytterste sørøstre neset på Bygdøy ved innløpet til Frognerkilen. SSR-punktet brukes som stabilt navne-/områdeanker etter at tidligere streng OSM-kontroll ikke fant ett entydig navngitt objekt. Punktet er ikke valgt med nearest/first-hit og er ikke en påstand om et eksakt polygon-centroid.',
};

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate) || aggregate.filter((place) => place?.id === placeId).length !== 1) throw new Error('bygdoy_bygdoynes må finnes nøyaktig én gang i aggregate');
const oldPlace = aggregate.find((place) => place?.id === placeId);
const updatedAggregate = aggregate.map((place) => place?.id === placeId ? { ...place, ...fields } : place);
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('bygdoy_bygdoynes mangler i split-index');
Object.assign(indexRow, {
  lat, lon, r: updatedPlace.r,
  coordStatus: fields.coordStatus, coordType: fields.coordType, locatorType: fields.locatorType,
  sourceProvider: fields.sourceProvider, sourceObjectId: fields.sourceObjectId,
  geocodeAccuracy: fields.geocodeAccuracy, coordRole: fields.coordRole,
  coordSource: fields.coordSource, coordSourceId: fields.coordSourceId, coordSourceUrl: fields.coordSourceUrl,
  coordVerifiedAt: fields.coordVerifiedAt, coordNote: fields.coordNote,
});
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error('bygdoy_bygdoynes mangler i split-manifest');
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_bygdoy.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat, lon, r: updatedPlace.r, coordStatus: fields.coordStatus, coordSource: fields.coordSource, coordType: fields.coordType, coordNote: fields.coordNote },
  identity: { currentName: updatedPlace.name, resolvedIdentity: 'Bygdøynes, det sørøstre neset på Bygdøy ved innløpet til Frognerkilen', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'natural_area', requiresSplit: false, splitReason: '' },
  requiredEvidence: ['eksakt aktiv Kartverket SSR-identitet', 'uavhengig geografisk identitetskryssjekk'],
  evidence: [
    { sourceProvider: 'kartverket', sourceName: 'Kartverket Sentralt stedsnavnregister – Bygdøynes, objekttype Nes i sjø', sourceUrl: ssrUrl, sourceObjectId, sourceQuality: 'official_named_place_registry', finding: 'Ett aktivt Bygdøynes-objekt i Oslo, objekttype Nes i sjø, stedsnummer 732865, med offisielt representasjonspunkt 59.90369, 10.70131.', canVerifyCoordinate: true, reason: 'Offisielt stabilt navne-/områdeobjekt med entydig treff; ingen nearest/first-hit.' },
    { sourceProvider: 'manual_research', sourceName: 'Store norske leksikon – Bygdøynes', sourceUrl: snlUrl, sourceObjectId: 'snl:bygdoynes', sourceQuality: 'independent_geographic_identity_crosscheck', finding: 'SNL definerer Bygdøynes som det ytterste sørøstre neset på Bygdøy ved innløpet til Frognerkilen.', canVerifyCoordinate: false, reason: 'Kryssjekker fysisk identitet; canonical koordinat kommer fra Kartverket SSR.' },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [{ sourceProvider: 'kartverket', sourceObjectId, canApplyToPlace: true }, { sourceProvider: 'manual_research', sourceObjectId: 'snl:bygdoynes', canApplyToPlace: false }],
  geometryCandidates: [],
  coordinateCandidates: [{ lat, lon, coordRole: 'area_anchor', sourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kartverket SSR-identiteten og representasjonspunktet er anvendt på canonical place.' },
  notes: [fields.coordNote],
});

let protocol = fs.readFileSync(protocolFile, 'utf8');
const staleRow = '| `bygdoy_bygdoynes` – Bygdøy Bygdøynes | needs_review | Identiteten er dokumentert, men kontrollen ga ikke ett entydig eksakt navngitt objekt som passer fysisk objekttype innenfor Bygdøy-boksen. | ett entydig eksakt navngitt fysisk objekt eller offisiell områdegeometri |';
if (protocol.split(staleRow).length - 1 !== 1) throw new Error('Forventet én stale bygdoy_bygdoynes needs_review-rad');
protocol = protocol.replace(`${staleRow}\n`, '');
if (!protocol.includes('| 138 | `bygdoy_bygdoynes` |')) {
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  const insertion = `| 138 | \`bygdoy_bygdoynes\` | Bygdøy Bygdøynes | verified_geometry | \`${sourceObjectId}\` |\n\nBatch 138 (2026-07-21) løser \`bygdoy_bygdoynes\` med official-map object-type-first etter at tidligere OSM-kontroll ikke fant ett entydig navngitt objekt. Kartverket SSR gir nøyaktig ett aktivt Bygdøynes-treff i Oslo, objekttype \`Nes i sjø\`, stedsnummer 732865, med offisielt representasjonspunkt 59.90369, 10.70131. Store norske leksikon kryssjekker identiteten som det ytterste sørøstre neset på Bygdøy ved innløpet til Frognerkilen. SSR-punktet brukes som stabilt \`area_anchor\`; det gamle Mapcarta-/nearby-punktet pensjoneres, og ingen nearest/first-hit-logikk brukes.\n\n`;
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør');
  protocol = protocol.replace(marker, insertion + marker);
}
fs.writeFileSync(protocolFile, protocol);

writeJson(path.join(reportDir, 'batch-138-result.json'), { generatedAt: new Date().toISOString(), batch, placeId, sourceObjectId, objectType: hit.navneobjekttype, oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon }, newCoordinate: { lat, lon }, status: 'verified_geometry', method: 'official_map_object_type_first' });
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 138 source chain\n\n- Kartverket SSR: one exact active Bygdøynes object in Oslo, type Nes i sjø, stedsnummer 732865, representation point 59.90369 / 10.70131.\n- Store norske leksikon: independent geographic identity cross-check.\n- Previous OSM diagnostic found no exact named object and is not used as the coordinate source.\n`);
console.log(JSON.stringify({ batch, placeId, sourceObjectId, oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon }, newCoordinate: { lat, lon }, status: 'verified_geometry' }, null, 2));
