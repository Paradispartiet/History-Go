#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 166;
const date = '2026-07-23';
const placeId = 'trosterud_friomrade';
const osmWayId = 220842445;
const aggregateFile = 'data/places/natur/oslo/places_oslo_alna.json';
const childFile = 'data/places/natur/oslo/places_oslo_alna/trosterud_friomrade.json';
const indexFile = 'data/places/natur/oslo/places_oslo_alna_index.json';
const manifestFile = 'data/places/natur/oslo/places_oslo_alna_manifest.json';
const evidenceFile = 'data/coordinate-evidence/oslo/natur/trosterud_friomrade.json';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = 'reports/oslo-coordinate-control-batch-166-lille-wembley';

const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');
const USER_AGENT = 'History-Go-coordinate-control/1.0 (https://github.com/Paradispartiet/History-Go)';

async function fetchText(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/xml,text/xml,*/*' },
        signal: AbortSignal.timeout(30000),
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

function parseAttrs(text) {
  return Object.fromEntries([...text.matchAll(/([:\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
}

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
  const body = wayMatch[2];
  const refs = [...body.matchAll(/<nd\b([^>]*)\/?\s*>/g)]
    .map((match) => parseAttrs(match[1]).ref)
    .filter(Boolean);
  const tags = Object.fromEntries(
    [...body.matchAll(/<tag\b([^>]*)\/?\s*>/g)]
      .map((match) => parseAttrs(match[1]))
      .filter((attrs) => attrs.k !== undefined)
      .map((attrs) => [attrs.k, attrs.v || ''])
  );
  const coordinates = refs.map((ref) => nodeMap.get(ref)).filter(Boolean);
  if (coordinates.length !== refs.length || coordinates.length < 4) {
    throw new Error(`Incomplete polygon geometry for way ${expectedWayId}: ${coordinates.length}/${refs.length} nodes resolved`);
  }
  if (refs[0] !== refs[refs.length - 1]) throw new Error(`Way ${expectedWayId} is no longer a closed polygon`);
  return { id: expectedWayId, refs, tags, coordinates };
}

function polygonCentroid(points) {
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const x1 = points[i].lon;
    const y1 = points[i].lat;
    const x2 = points[i + 1].lon;
    const y2 = points[i + 1].lat;
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  if (Math.abs(twiceArea) < 1e-12) throw new Error('Lille Wembley polygon has zero/degenerate area');
  return {
    lat: cy / (3 * twiceArea),
    lon: cx / (3 * twiceArea),
  };
}

const osmUrl = `https://api.openstreetmap.org/api/0.6/way/${osmWayId}/full`;
const osmXml = await fetchText(osmUrl);
const way = parseWayXml(osmXml, osmWayId);

if (way.tags.name !== 'Lille Wembley') {
  throw new Error(`Expected exact OSM name Lille Wembley, found ${JSON.stringify(way.tags.name || null)}`);
}
const recreationLike = way.tags.landuse === 'recreation_ground' || way.tags.leisure === 'park' || way.tags.leisure === 'dog_park';
if (!recreationLike) {
  throw new Error(`Way ${osmWayId} is no longer a recreation-area object: ${JSON.stringify(way.tags)}`);
}
if (way.tags.leisure !== 'dog_park') {
  throw new Error(`Way ${osmWayId} no longer carries the documented Lille Wembley dog-area function`);
}

const centroid = polygonCentroid(way.coordinates);
if (!(centroid.lat > 59.90 && centroid.lat < 59.94 && centroid.lon > 10.84 && centroid.lon < 10.89)) {
  throw new Error(`Lille Wembley centroid falls outside bounded Haugerud/Trosterud scope: ${centroid.lat}, ${centroid.lon}`);
}

const oldPlace = readJson(childFile);
if (oldPlace.id !== placeId) throw new Error(`Unexpected child place ID ${oldPlace.id}`);
if (oldPlace.coordStatus !== 'needs_source') throw new Error(`${placeId} is no longer needs_source on this production base`);

const canonicalName = 'Lille Wembley';
const place = structuredClone(oldPlace);
place.name = canonicalName;
place.lat = centroid.lat;
place.lon = centroid.lon;
place.r = 180;
place.year = 2020;
place.desc = 'Statlig sikret friluftsområde ved inngangen til Østmarka på Haugerud, tilrettelagt for lek, aktivitet, naturmiljø og nærrekreasjon.';
place.popupDesc = 'Lille Wembley ligger ved inngangen til Østmarka på Haugerud og er et offentlig frilufts- og aktivitetsområde for nærmiljøet. Området startet som en liten grusbane, men ble i 2020 tilrettelagt som møteplass for lek, aktivitet, grilling og sosialt samvær. Skogen rundt ble ryddet og det ble gjort tiltak for naturmiljø og insekter, samtidig som deler av området fungerer som kommunalt dressurområde for hund.\n\nStedet passer den opprinnelige History Go-intensjonen langt bedre enn det syntetiske navnet «Trosterud friområde»: et konkret, navngitt og offentlig tilgjengelig nærfriluftsområde mellom boligbyen og marka.';
place.tags = Array.from(new Set([...(place.tags || []), 'lille_wembley', 'haugerud', 'friluftsområde', 'østmarka']));
place.knagger = Array.from(new Set([...(place.knagger || []), 'nærmiljø', 'aktivitet']));
place.locatorType = 'natural_area';
place.sourceProvider = 'osm';
place.sourceObjectId = `osm-way:${osmWayId}`;
place.geocodeAccuracy = 'geometric_center';
place.coordRole = 'area_anchor';
place.coordType = 'recreation_area_anchor';
place.coordStatus = 'verified_geometry';
place.coordSource = `OpenStreetMap way ${osmWayId} – Lille Wembley, source-identified by Oslo kommune and Lovdata`;
place.coordSourceId = `osm-way:${osmWayId}`;
place.coordSourceUrl = `https://www.openstreetmap.org/way/${osmWayId}`;
place.coordVerifiedAt = date;
place.coordNote = `Batch 166 pensjonerer den repo-syntetiske identiteten «Trosterud friområde» og erstatter den med det konkrete navngitte friluftsområdet Lille Wembley, mens placeId beholdes for kompatibilitet. Oslo kommune dokumenterer Lille Wembley som et statlig sikret friluftsområde og møteplass ved inngangen til marka, tilrettelagt i 2020 for lek, aktivitet, naturmiljø og sosialt opphold. Lovdata dokumenterer Lille Wembley, Haugerud som kommunalt dressurområde for hund. Fresh OSM way ${osmWayId} er eksakt navngitt «Lille Wembley», er et lukket rekreasjonsområde og bærer leisure=dog_park. Canonical lat/lon er deterministisk polygoncentroid for denne eksakte arealgeometrien. Det gamle legacy-punktet, nearest/first-hit og de bredere Trosterud/Haugerud-planområdene brukes ikke som koordinatkilde.`;
place.identityScope = {
  method: 'official_identity_plus_exact_named_recreation_polygon',
  correctedLegacyName: 'Trosterud friområde',
  resolvedIdentity: canonicalName,
  stablePlaceIdRetained: true,
  osmWayId,
  officialContext: [
    'Oslo kommune – Planprogram for Trosterud og Haugerud: Lille Wembley',
    'Lovdata – forskrift om dressurområder for hund: Lille Wembley, Haugerud',
  ],
  excludedProxies: ['Trosterudparken', 'Haugerudparken', 'generic Trosterud/Haugerud plan area', 'legacy coordinate'],
};

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate) || aggregate.filter((entry) => entry?.id === placeId).length !== 1) {
  throw new Error(`${placeId} must exist exactly once in aggregate`);
}
writeJson(aggregateFile, aggregate.map((entry) => entry?.id === placeId ? place : entry));
writeJson(childFile, place);

const index = readJson(indexFile);
const indexRows = Array.isArray(index) ? index : index.places;
if (!Array.isArray(indexRows)) throw new Error('Unexpected Alna split-index shape');
const indexRow = indexRows.find((row) => row?.id === placeId);
if (!indexRow) throw new Error(`${placeId} missing from split index`);
for (const key of [
  'name', 'lat', 'lon', 'r', 'year', 'coordStatus', 'coordType', 'locatorType', 'sourceProvider',
  'sourceObjectId', 'geocodeAccuracy', 'coordRole', 'coordSource', 'coordSourceId', 'coordSourceUrl',
  'coordVerifiedAt', 'coordNote',
]) {
  if (place[key] !== undefined) indexRow[key] = place[key];
}
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRows = Array.isArray(manifest) ? manifest : manifest.places;
if (!Array.isArray(manifestRows)) throw new Error('Unexpected Alna split-manifest shape');
const manifestRow = manifestRows.find((row) => row?.id === placeId);
if (!manifestRow) throw new Error(`${placeId} missing from split manifest`);
if (!Array.isArray(manifest)) {
  manifest.source_sha256 = sha256File(aggregateFile);
  manifest.generated_at = new Date().toISOString();
}
manifestRow.name = place.name;
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

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
    currentName: canonicalName,
    resolvedIdentity: 'Lille Wembley – konkret statlig sikret frilufts- og aktivitetsområde på Haugerud',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'natural_area',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – Lille Wembley',
      sourceUrl: place.coordSourceUrl,
      sourceObjectId: place.sourceObjectId,
      sourceQuality: 'unique_exact_named_recreation_polygon',
      finding: `Fresh way ${osmWayId} is exactly named Lille Wembley, is a closed recreation-area polygon and carries leisure=dog_park. The deterministic polygon centroid is ${place.lat}, ${place.lon}.`,
      canVerifyCoordinate: true,
      reason: 'Exact named physical area geometry with the documented local identity and a compatible recreation-area object type.',
    },
    {
      sourceProvider: 'municipality',
      sourceName: 'Oslo kommune – Planprogram for Trosterud og Haugerud',
      sourceUrl: 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/planprogram-for-trosterud-og-haugerud',
      sourceObjectId: 'oslo-kommune:trosterud-haugerud:lille-wembley',
      sourceQuality: 'official_named_public_recreation_identity',
      finding: 'Kommunen dokumenterer Lille Wembley som møteplass ved inngangen til marka, tilrettelagt i 2020 for lek, aktivitet, grilling, naturmiljø og insekter, og som statlig sikret friluftsområde.',
      canVerifyCoordinate: false,
      reason: 'Fastsetter den korrekte fysiske identiteten og funksjonen; eksakt arealgeometri kommer fra OSM.',
    },
    {
      sourceProvider: 'lovdata',
      sourceName: 'Forskrift om dressurområder for hund, Oslo kommune',
      sourceUrl: 'https://lovdata.no/forskrift/2007-05-08-1002',
      sourceObjectId: 'lovdata:FOR-2007-05-08-1002:lille-wembley-haugerud',
      sourceQuality: 'official_legal_named_area_identity',
      finding: 'Forskriften navngir Lille Wembley, Haugerud som ett av kommunens avgrensede dressurområder for hund.',
      canVerifyCoordinate: false,
      reason: 'Uavhengig offentlig identitetskryssjekk for det navngitte området.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: place.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: 'municipality', sourceObjectId: 'oslo-kommune:trosterud-haugerud:lille-wembley', canApplyToPlace: false },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: place.sourceObjectId,
      lat: place.lat,
      lon: place.lon,
      coordRole: 'area_anchor',
      geometryType: 'Polygon',
      canApplyToPlace: true,
    },
  ],
  coordinateCandidates: [
    { lat: place.lat, lon: place.lon, coordRole: 'area_anchor', canApplyToPlace: true },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Lille Wembleys eksakte navngitte arealgeometri er anvendt på canonical place; den syntetiske Trosterud-friområde-identiteten er pensjonert.',
  },
  notes: [place.coordNote],
});

let protocol = fs.readFileSync(abs(protocolFile), 'utf8');
const countMatch = protocol.match(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./);
if (!countMatch) throw new Error('Could not locate Oslo verified count');
const oldCount = Number(countMatch[1]);
protocol = protocol.replace(countMatch[0], `Oslo-protokollen dekker nå ${oldCount + 1} aktive current \`verified*\` canonical Oslo-steder.`);
protocol = protocol
  .split('\n')
  .filter((line) => !(line.includes(`\`${placeId}\``) && line.includes('needs_review')))
  .join('\n');
protocol = protocol.replace(
  /Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte canonical Oslo-stedene\./,
  `Disse kontrollene er fullført, men teller ikke blant de ${oldCount + 1} verifiserte canonical Oslo-stedene.`
);
const reviewHeading = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const reviewPos = protocol.indexOf(reviewHeading);
if (reviewPos < 0) throw new Error('Could not locate Oslo review heading for batch insertion');
const batchBlock = `| 166 | \`${placeId}\` | ${canonicalName} | verified_geometry | \`osm-way:${osmWayId}\` |\n\nBatch 166 (${date}) løser den repo-syntetiske identiteten «Trosterud friområde» som det konkrete Lille Wembley på Haugerud. Oslo kommune dokumenterer området som statlig sikret friluftsområde og møteplass ved inngangen til marka, mens Lovdata navngir Lille Wembley som kommunalt dressurområde for hund. Fresh OSM way ${osmWayId} hard-gates som eksakt navngitt, lukket rekreasjonsgeometri; canonical punkt er polygoncentroid. Trosterudparken, Haugerudparken, det brede planområdet og legacy-punktet brukes ikke som proxy.\n\n`;
if (!protocol.includes(`| 166 | \`${placeId}\``)) {
  protocol = `${protocol.slice(0, reviewPos)}${batchBlock}${protocol.slice(reviewPos)}`;
}
fs.writeFileSync(abs(protocolFile), protocol);

fs.mkdirSync(abs(reportDir), { recursive: true });
fs.writeFileSync(abs(`${reportDir}/osm-way-${osmWayId}-full.xml`), osmXml);
fs.writeFileSync(abs(`${reportDir}/sources.md`), `# Batch 166 sources\n\n- Oslo kommune – Planprogram for Trosterud og Haugerud: https://www.oslo.kommune.no/slik-bygger-vi-oslo/planprogram-for-trosterud-og-haugerud\n- Oslo kommune – Haugerud friområde for hund: https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/haugerud-friomrade-for-hund\n- Lovdata – Forskrift om dressurområder for hund: https://lovdata.no/forskrift/2007-05-08-1002\n- Fresh OSM API XML for way ${osmWayId} is stored in this directory.\n`);
writeJson(`${reportDir}/batch-166-result.json`, {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  oldIdentity: oldPlace.name,
  newIdentity: canonicalName,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: place.lat, lon: place.lon },
  sourceProvider: place.sourceProvider,
  sourceObjectId: place.sourceObjectId,
  osmTags: way.tags,
  geometryNodeCount: way.coordinates.length,
  status: place.coordStatus,
  coordType: place.coordType,
});

console.log(JSON.stringify({
  batch,
  placeId,
  oldIdentity: oldPlace.name,
  newIdentity: canonicalName,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: place.lat, lon: place.lon },
  sourceObjectId: place.sourceObjectId,
  status: place.coordStatus,
}, null, 2));
