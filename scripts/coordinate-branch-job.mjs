#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const date = '2026-07-23';
const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');
const gitShow = (ref, file) => execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8', maxBuffer: 80 * 1024 * 1024 });

// Batch 167: replay the already validated retirement of the false public Båntjern proxy.
const retirementUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/8a318548dd5df1fe963775103640d632771ed698/scripts/coordinate-branch-job.mjs';
const retirementResponse = await fetch(retirementUrl, {
  headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' },
  signal: AbortSignal.timeout(30000),
});
if (!retirementResponse.ok) throw new Error(`Could not fetch validated Båntjern retirement script: ${retirementResponse.status} ${retirementResponse.statusText}`);
let retirementSource = await retirementResponse.text();
retirementSource = retirementSource
  .replace('const batch = 166;', 'const batch = 167;')
  .replaceAll('batch-166-bantjern-private-proxy-retirement', 'batch-167-bantjern-private-proxy-retirement')
  .replaceAll('batch-166-result.json', 'batch-167-result.json');
if (!retirementSource.includes('const batch = 167;')) throw new Error('Could not renumber validated Båntjern retirement to batch 167');
const retirementTemp = path.join('/tmp', `history-go-batch-167-retirement-${Date.now()}.mjs`);
fs.writeFileSync(retirementTemp, retirementSource);
await import(`${pathToFileURL(retirementTemp).href}?v=${Date.now()}`);

// Batch 168: replace the generic campus near-anchor with the unique public pond geometry
// independently scoped between IFI / Ole-Johan Dahls hus and Forskningsparken.
const batch = 168;
const placeId = 'blindern_forskningsparken_salamanderdam';
const researchRef = 'origin/agent/oslo-coordinate-control-batch-167-blindern-forskningsparken-dam-research';
const researchFile = 'reports/oslo-coordinate-control-batch-167-blindern-forskningsparken-dam-research/candidate-summary.json';
const aggregateFile = 'data/places/natur/oslo/places_oslo_natur_salamanderdammer.json';
const childFile = 'data/places/natur/oslo/places_oslo_natur_salamanderdammer/blindern_forskningsparken_salamanderdam.json';
const indexFile = 'data/places/natur/oslo/places_oslo_natur_salamanderdammer_index.json';
const manifestFile = 'data/places/natur/oslo/places_oslo_natur_salamanderdammer_manifest.json';
const evidenceFile = 'data/coordinate-evidence/oslo/natur/blindern_forskningsparken_salamanderdam.json';
const mappingFile = 'data/Civication/map/historyGoPlaceMapping.natur_salamanderdammer.json';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = 'reports/oslo-coordinate-control-batch-168-blindern-forskningsparken-pond-production';
const pondWayId = 94984903;

const research = JSON.parse(gitShow(researchRef, researchFile));
if (research?.placeId !== placeId || research?.decision?.productionReady !== true) {
  throw new Error('Batch 168 research is not production-ready');
}
if (research?.counts?.strictPondCandidates !== 1 || research?.decision?.selectedCandidate?.osmId !== pondWayId) {
  throw new Error('Batch 168 research no longer identifies exactly one source-scoped pond candidate');
}
if (research.decision.selectedCandidate.distanceToIfiM >= 350 || research.decision.selectedCandidate.distanceToForskningsparkenM >= 350) {
  throw new Error('Selected pond no longer satisfies the independently source-defined campus corridor');
}

const USER_AGENT = 'History-Go-coordinate-control/1.0 (https://github.com/Paradispartiet/History-Go)';
async function fetchText(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/xml,text/xml,*/*' },
        signal: AbortSignal.timeout(45000),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }
  throw lastError;
}
const parseAttrs = (text) => Object.fromEntries([...text.matchAll(/([:\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
function parseWayXml(xml, expectedWayId) {
  const nodeMap = new Map();
  for (const match of xml.matchAll(/<node\b([^>]*)\/?\s*>/g)) {
    const attrs = parseAttrs(match[1]);
    if (attrs.id && attrs.lat !== undefined && attrs.lon !== undefined) {
      nodeMap.set(attrs.id, { id: attrs.id, lat: Number(attrs.lat), lon: Number(attrs.lon) });
    }
  }
  const wayMatch = [...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)]
    .find((match) => parseAttrs(match[1]).id === String(expectedWayId));
  if (!wayMatch) throw new Error(`Could not find way ${expectedWayId} in fresh OSM XML`);
  const refs = [...wayMatch[2].matchAll(/<nd\b([^>]*)\/?\s*>/g)].map((entry) => parseAttrs(entry[1]).ref).filter(Boolean);
  const tags = Object.fromEntries([...wayMatch[2].matchAll(/<tag\b([^>]*)\/?\s*>/g)]
    .map((entry) => parseAttrs(entry[1])).filter((attrs) => attrs.k !== undefined).map((attrs) => [attrs.k, attrs.v || '']));
  const coordinates = refs.map((ref) => nodeMap.get(ref)).filter(Boolean);
  if (coordinates.length !== refs.length || coordinates.length < 4) throw new Error(`Incomplete polygon geometry for way ${expectedWayId}`);
  return { id: expectedWayId, refs, tags, coordinates };
}
function polygonCentroid(points) {
  const ring = points[0].lat === points.at(-1).lat && points[0].lon === points.at(-1).lon ? points : [...points, points[0]];
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const x0 = ring[i].lon;
    const y0 = ring[i].lat;
    const x1 = ring[i + 1].lon;
    const y1 = ring[i + 1].lat;
    const cross = x0 * y1 - x1 * y0;
    twiceArea += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  if (Math.abs(twiceArea) < 1e-12) throw new Error('Pond polygon has zero area');
  return { lon: cx / (3 * twiceArea), lat: cy / (3 * twiceArea), signedTwiceArea: twiceArea };
}
function pointInPolygon(point, points) {
  const ring = points[0].lat === points.at(-1).lat && points[0].lon === points.at(-1).lon ? points : [...points, points[0]];
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].lon;
    const yi = ring[i].lat;
    const xj = ring[j].lon;
    const yj = ring[j].lat;
    const intersects = ((yi > point.lat) !== (yj > point.lat)) &&
      (point.lon < (xj - xi) * (point.lat - yi) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

const pondUrl = `https://api.openstreetmap.org/api/0.6/way/${pondWayId}/full`;
const pondXml = await fetchText(pondUrl);
const pond = parseWayXml(pondXml, pondWayId);
if (pond.tags.natural !== 'water' || pond.tags.water !== 'pond') {
  throw new Error(`Fresh way ${pondWayId} is no longer natural=water, water=pond`);
}
if (pond.refs[0] !== pond.refs.at(-1)) throw new Error(`Fresh way ${pondWayId} is no longer a closed pond polygon`);
const centroid = polygonCentroid(pond.coordinates);
if (!pointInPolygon(centroid, pond.coordinates)) throw new Error('Computed pond centroid is outside the fresh pond polygon');

const oldPlace = readJson(childFile);
if (oldPlace.id !== placeId || oldPlace.coordStatus !== 'needs_source') throw new Error(`${placeId} is no longer unresolved on this production base`);
if (oldPlace.nature_profile?.nearby_place_ids?.includes('bantjern_salamanderlokalitet')) {
  throw new Error('Batch 167 retirement did not remove the Båntjern proxy from the Forskningsparken nearby list');
}
const place = structuredClone(oldPlace);
place.lat = centroid.lat;
place.lon = centroid.lon;
place.locatorType = 'area';
place.sourceProvider = 'osm';
place.sourceObjectId = `osm-way:${pondWayId}`;
place.geocodeAccuracy = 'polygon_centroid';
place.coordRole = 'area_anchor';
place.coordType = 'pond_area_centroid';
place.coordStatus = 'verified_geometry';
place.coordSource = `OpenStreetMap way ${pondWayId} – unique pond in the source-defined IFI–Forskningsparken corridor`;
place.coordSourceId = `osm-way:${pondWayId}`;
place.coordSourceUrl = `https://www.openstreetmap.org/way/${pondWayId}`;
place.coordVerifiedAt = date;
place.coordNote = `Batch 168 erstatter det generiske campus-nærankeret med selve den offentlige damgeometrien. Oslo kommune dokumenterer salamandere i dam ved Forskningsparken, og Forskningsparken avgrenser dammen mellom UiOs Institutt for informatikk/Ole-Johan Dahls hus og Forskningsparken. Bounded research fant fire vannobjekter i den brede campus-scope-boksen, men bare OSM way ${pondWayId} ligger i den kildefestede korridoren og innen 350 meter fra begge uavhengig identifiserte institusjonsankre. Fresh way ${pondWayId} hard-gates som lukket natural=water/water=pond-polygon; canonical lat/lon er polygonets arealsentrum og ligger inne i polygonet. Punktet representerer den offentlige dammen som habitatsted, ikke en presis posisjon for salamanderindivider. Legacy-punktet og nearest/first-hit brukes ikke.`;
place.pondScope = {
  method: 'source_defined_institution_corridor_unique_pond_polygon',
  osmWayId: pondWayId,
  sourceDefinedBetween: ['Ole-Johan Dahls hus / Institutt for informatikk', 'Forskningsparken'],
  ifiAnchor: research.institutions.ifi,
  forskningsparkenAnchor: research.institutions.forskningsparken,
  researchDistanceToIfiM: research.decision.selectedCandidate.distanceToIfiM,
  researchDistanceToForskningsparkenM: research.decision.selectedCandidate.distanceToForskningsparkenM,
  candidateCountInCorridor: research.counts.strictPondCandidates,
  displayAnchorMethod: 'polygon_area_centroid',
  publicHabitatGeometry: true,
  individualAnimalLocationClaimed: false,
};
if (place.links) place.links.map = place.coordSourceUrl;

const aggregate = readJson(aggregateFile);
if (aggregate.filter((entry) => entry?.id === placeId).length !== 1) throw new Error(`${placeId} must exist exactly once in aggregate`);
writeJson(aggregateFile, aggregate.map((entry) => entry?.id === placeId ? place : entry));
writeJson(childFile, place);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error(`${placeId} missing from split index`);
for (const key of [
  'name', 'lat', 'lon', 'r', 'year', 'coordStatus', 'coordType', 'locatorType', 'sourceProvider',
  'sourceObjectId', 'geocodeAccuracy', 'coordRole', 'coordSource', 'coordSourceId', 'coordSourceUrl',
  'coordVerifiedAt', 'coordNote',
]) if (place[key] !== undefined) indexRow[key] = place[key];
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
const mappingKey = 'map_blindern_forskningsparken_salamanderdam';
const mappingRow = mapping.mappings?.[mappingKey];
if (!mappingRow || mappingRow.historyGoPlaceId !== placeId) throw new Error(`Missing Civication mapping ${mappingKey}`);
mappingRow.lat = place.lat;
mappingRow.lon = place.lon;
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
    resolvedIdentity: 'Den offentlige dammen mellom IFI og Forskningsparken der salamandere er dokumentert',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'area',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'oslo_kommune',
      sourceName: 'Oslo kommune – Oslos ukjente amfibiedammer kartlegges',
      sourceUrl: 'https://aktuelt.oslo.kommune.no/oslos-ukjente-amfibiedammer-kartlegges',
      sourceObjectId: 'oslo-kommune:amfibiedammer-forskningsparken',
      sourceQuality: 'official_identity_source',
      finding: 'Oslo kommune documents salamanders in a pond at Forskningsparken on Blindern.',
      canVerifyCoordinate: true,
      reason: 'The official source establishes the habitat identity in the Forskningsparken area but is combined with the independent local corridor source and exact OSM geometry for the physical coordinate.',
    },
    {
      sourceProvider: 'forskningsparken',
      sourceName: 'Forskningsparken – biologisk mangfold og grøntområdet rundt Gaustadbekken',
      sourceUrl: 'https://www.forskningsparken.no/news/la-humla-suse-slik-bidrar-forskningsparken-til-biologisk-mangfold',
      sourceObjectId: 'forskningsparken:pond-between-ifi-and-forskningsparken',
      sourceQuality: 'independent_local_scope_source',
      finding: 'Forskningsparken places the pond between UiO Institute of Informatics and Forskningsparken.',
      canVerifyCoordinate: true,
      reason: 'The local source defines the physical corridor that uniquely disambiguates the pond polygon.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – fresh pond polygon',
      sourceUrl: place.coordSourceUrl,
      sourceObjectId: place.sourceObjectId,
      sourceQuality: 'exact_physical_area_geometry',
      finding: `Fresh closed way ${pondWayId} is tagged natural=water and water=pond and is the unique pond in the independently source-defined corridor.`,
      canVerifyCoordinate: true,
      reason: 'The exact polygon provides the physical geometry; the canonical marker is its in-polygon area centroid.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${pondWayId}`, canApplyToPlace: true },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: `osm-way:${pondWayId}`,
      geometryRole: 'source_scoped_public_pond_polygon',
      canApplyToPlace: true,
      pondScope: place.pondScope,
    },
  ],
  coordinateCandidates: [
    {
      lat: place.lat,
      lon: place.lon,
      geocodeAccuracy: place.geocodeAccuracy,
      coordRole: place.coordRole,
      sourceObjectId: place.sourceObjectId,
      canApplyToPlace: true,
    },
  ],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Applied to canonical place.' },
  notes: [place.coordNote],
});

let protocol = fs.readFileSync(abs(protocolFile), 'utf8');
protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${date}`);
if (!protocol.includes(`| ${batch} | \`${placeId}\``)) {
  protocol = protocol.replace(
    /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./,
    (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`,
  );
  const insertion = `| ${batch} | \`${placeId}\` | ${place.name} | verified_geometry | \`osm-way:${pondWayId}\` |\n\nBatch ${batch} (${date}) løser Blindern/Forskningsparken salamanderdam som et konkret offentlig damobjekt i stedet for et generisk campus-næranker. Oslo kommune dokumenterer salamandere i dam ved Forskningsparken, og Forskningsparken avgrenser dammen mellom IFI/Ole-Johan Dahls hus og Forskningsparken. Bounded research fant fire vannobjekter i den brede campus-scope-boksen, men bare OSM way ${pondWayId} ligger i den kildefestede korridoren og innen 350 meter fra begge institusjonsankrene. Fresh way ${pondWayId} valideres som lukket natural=water/water=pond-geometri; canonical lat/lon er polygonets arealsentrum, verifisert inne i polygonet. Punktet representerer den offentlige dammen, ikke individuelle salamanderposisjoner. Legacy-punktet og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex < 0) throw new Error('Could not find protocol insertion marker');
  protocol = `${protocol.slice(0, markerIndex)}${insertion}${protocol.slice(markerIndex)}`;
}
protocol = protocol.split('\n').filter((line) => !(line.includes(`\`${placeId}\``) && line.includes('needs_review'))).join('\n');
fs.writeFileSync(abs(protocolFile), protocol);

fs.mkdirSync(abs(reportDir), { recursive: true });
fs.writeFileSync(abs(`${reportDir}/osm-way-${pondWayId}-full.xml`), pondXml);
fs.writeFileSync(abs(`${reportDir}/candidate-research-summary.json`), `${JSON.stringify(research, null, 2)}\n`);
fs.writeFileSync(abs(`${reportDir}/sources.md`), `# Batch 168 sources\n\n- Oslo kommune: https://aktuelt.oslo.kommune.no/oslos-ukjente-amfibiedammer-kartlegges\n- Forskningsparken: https://www.forskningsparken.no/news/la-humla-suse-slik-bidrar-forskningsparken-til-biologisk-mangfold\n- Forskningsparken/Gaustadbekken context: https://www.forskningsparken.no/en/news/2019-mosekunst-og-grontomradet-rundt-gaustadbekken\n- Fresh OSM way ${pondWayId} XML and the completed corridor research snapshot are stored in this directory.\n`);
writeJson(`${reportDir}/batch-168-result.json`, {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  name: place.name,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: place.lat, lon: place.lon },
  sourceProvider: place.sourceProvider,
  sourceObjectId: place.sourceObjectId,
  coordStatus: place.coordStatus,
  coordType: place.coordType,
  researchCandidateCount: research.counts.strictPondCandidates,
  distanceToIfiM: research.decision.selectedCandidate.distanceToIfiM,
  distanceToForskningsparkenM: research.decision.selectedCandidate.distanceToForskningsparkenM,
  centroidInsidePolygon: true,
  publicHabitatGeometry: true,
  individualAnimalLocationClaimed: false,
});

console.log(JSON.stringify({
  batches: [167, 168],
  batch168: {
    placeId,
    coordinate: { lat: place.lat, lon: place.lon },
    sourceObjectId: place.sourceObjectId,
    coordStatus: place.coordStatus,
    centroidInsidePolygon: true,
  },
}, null, 2));
