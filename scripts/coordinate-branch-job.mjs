#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 167;
const date = '2026-07-23';
const placeId = 'furuset_haugerud_skogbelte';
const trackWayId = 643537729;
const churchWayId = 154762904;
const aggregateFile = 'data/places/natur/oslo/places_oslo_alna.json';
const childFile = 'data/places/natur/oslo/places_oslo_alna/furuset_haugerud_skogbelte.json';
const indexFile = 'data/places/natur/oslo/places_oslo_alna_index.json';
const manifestFile = 'data/places/natur/oslo/places_oslo_alna_manifest.json';
const evidenceFile = 'data/coordinate-evidence/oslo/natur/furuset_haugerud_skogbelte.json';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = 'reports/oslo-coordinate-control-batch-167-haugerudparken-production';
const bbox = '59.916,10.852,59.922,10.866';
const UA = 'History-Go-coordinate-control/1.0 (https://github.com/Paradispartiet/History-Go)';

const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');

async function fetchText(url, options = {}, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'User-Agent': UA, ...(options.headers || {}) },
        signal: AbortSignal.timeout(35000),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
  throw lastError;
}

function attrs(text) {
  return Object.fromEntries([...text.matchAll(/([:\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
}

function parseWay(xml, expectedId) {
  const nodes = new Map();
  for (const match of xml.matchAll(/<node\b([^>]*)\/?\s*>/g)) {
    const a = attrs(match[1]);
    if (a.id && a.lat !== undefined && a.lon !== undefined) {
      nodes.set(a.id, { id: a.id, lat: Number(a.lat), lon: Number(a.lon) });
    }
  }
  const wayMatch = [...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)]
    .find((m) => attrs(m[1]).id === String(expectedId));
  if (!wayMatch) throw new Error(`Missing way ${expectedId} in fresh OSM XML`);
  const refs = [...wayMatch[2].matchAll(/<nd\b([^>]*)\/?\s*>/g)].map((m) => attrs(m[1]).ref).filter(Boolean);
  const tags = Object.fromEntries(
    [...wayMatch[2].matchAll(/<tag\b([^>]*)\/?\s*>/g)]
      .map((m) => attrs(m[1]))
      .filter((a) => a.k !== undefined)
      .map((a) => [a.k, a.v || ''])
  );
  const points = refs.map((ref) => nodes.get(ref));
  if (refs.length < 2 || points.some((p) => !p)) throw new Error(`Incomplete geometry for way ${expectedId}`);
  return { id: expectedId, refs, tags, points };
}

function haversine(a, b) {
  const R = 6371000;
  const rad = (d) => d * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function lineMidpoint(points) {
  const lengths = [];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const length = haversine(points[i - 1], points[i]);
    lengths.push(length);
    total += length;
  }
  if (total <= 0) throw new Error('Track geometry has zero length');
  const target = total / 2;
  let travelled = 0;
  for (let i = 0; i < lengths.length; i += 1) {
    const next = travelled + lengths[i];
    if (next >= target) {
      const ratio = (target - travelled) / lengths[i];
      return {
        point: {
          lat: points[i].lat + (points[i + 1].lat - points[i].lat) * ratio,
          lon: points[i].lon + (points[i + 1].lon - points[i].lon) * ratio,
        },
        totalLengthM: total,
      };
    }
    travelled = next;
  }
  return { point: points[points.length - 1], totalLengthM: total };
}

function meanPoint(points) {
  return {
    lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
    lon: points.reduce((sum, point) => sum + point.lon, 0) / points.length,
  };
}

// Identity-first uniqueness gate: the official source describes a new, unlit gravel bicycle track in Haugerudparken.
const query = `[out:json][timeout:25];way["leisure"="track"]["cycling"="pump_track"](${bbox});out ids tags center;`;
const overpassText = await fetchText(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
const overpass = JSON.parse(overpassText);
const matchingTracks = (overpass.elements || []).filter((element) =>
  element.type === 'way'
  && element.tags?.leisure === 'track'
  && element.tags?.cycling === 'pump_track'
  && element.tags?.sport === 'bmx'
  && element.tags?.surface === 'fine_gravel'
  && element.tags?.lit !== 'yes'
);
if (matchingTracks.length !== 1) {
  throw new Error(`Expected one unique unlit fine-gravel Haugerudparken pump track in bounded scope, found ${matchingTracks.length}`);
}
if (matchingTracks[0].id !== trackWayId) throw new Error(`Unexpected pump track way ${matchingTracks[0].id}`);

const [trackXml, churchXml] = await Promise.all([
  fetchText(`https://api.openstreetmap.org/api/0.6/way/${trackWayId}/full`, { headers: { Accept: 'application/xml,text/xml,*/*' } }),
  fetchText(`https://api.openstreetmap.org/api/0.6/way/${churchWayId}/full`, { headers: { Accept: 'application/xml,text/xml,*/*' } }),
]);
const track = parseWay(trackXml, trackWayId);
const church = parseWay(churchXml, churchWayId);
if (track.tags.leisure !== 'track' || track.tags.cycling !== 'pump_track' || track.tags.sport !== 'bmx' || track.tags.surface !== 'fine_gravel' || track.tags.lit === 'yes') {
  throw new Error(`Fresh way ${trackWayId} no longer matches the official-source-defined gravel bicycle-track identity`);
}
if (church.tags.name !== 'Haugerud kirke' || church.tags.building !== 'church') {
  throw new Error(`Fresh way ${churchWayId} no longer identifies Haugerud kirke`);
}
const { point: anchor, totalLengthM } = lineMidpoint(track.points);
const churchCenter = meanPoint(church.points);
if (!(anchor.lat < churchCenter.lat)) throw new Error('Internal track anchor is no longer south of Haugerud kirke');
const churchDistanceM = haversine(anchor, churchCenter);
if (churchDistanceM > 500) throw new Error(`Internal track is outside bounded Haugerudparken/church topology: ${churchDistanceM.toFixed(1)} m`);

const oldPlace = readJson(childFile);
if (oldPlace.id !== placeId) throw new Error(`Unexpected child ID ${oldPlace.id}`);
if (oldPlace.coordStatus !== 'needs_source') throw new Error(`${placeId} is no longer needs_source on production base`);

const canonicalName = 'Haugerudparken';
const place = structuredClone(oldPlace);
place.name = canonicalName;
place.lat = anchor.lat;
place.lon = anchor.lon;
place.r = 220;
place.year = 2019;
place.desc = 'Kommunalt friområde på Haugerud med skog, stier, sitteplasser, griller og aktivitetsområder, sikret for allmenn friluftsbruk.';
place.popupDesc = 'Haugerudparken er et kommunalt friområde på Haugerud som kombinerer skog og nærnatur med stier, oppholdssteder og aktivitet. Parken ble utviklet trinnvis med vegetasjonsarbeid, hovedgangvei, tverrstier, sitteområder, griller og bålpanne, og området ble statlig sikret for friluftslivsformål. Senere kom nye aktivitetstiltak, blant annet en ubelyst sykkelbane bygget som grusbane.\n\nHistory Go-markøren bruker denne fysisk kartlagte sykkelbanen som et internt parkanker. Punktet representerer derfor et dokumentert sted inne i Haugerudparken, ikke en påstand om parkens geometriske sentrum eller fulle yttergrense.';
place.badge_refs = { primary: 'natur', subs: ['skog', 'park', 'friluftsliv'], also: [] };
place.tags = Array.from(new Set([...(place.tags || []).filter((tag) => !['randnatur'].includes(tag)), 'haugerudparken', 'park', 'friluftsliv', 'skog', 'sykkelbane']));
place.knagger = Array.from(new Set([...(place.knagger || []).filter((tag) => tag !== 'bygrense'), 'nærnatur', 'aktivitet']));
place.underbadge_ids = Array.from(new Set([...(place.underbadge_ids || []).filter((tag) => tag !== 'gronn_korridor'), 'skog', 'tursti', 'friluftsliv']));
if (place.meta && typeof place.meta === 'object') place.meta.updated = date;
place.locatorType = 'natural_area';
place.sourceProvider = 'osm';
place.sourceObjectId = `osm-way:${trackWayId}`;
place.geocodeAccuracy = 'semantic_anchor';
place.coordRole = 'line_anchor';
place.coordType = 'source_defined_internal_park_anchor';
place.coordStatus = 'verified_geometry';
place.coordSource = `OpenStreetMap way ${trackWayId} – source-identified internal gravel bicycle track in Haugerudparken`;
place.coordSourceId = `osm-way:${trackWayId}`;
place.coordSourceUrl = `https://www.openstreetmap.org/way/${trackWayId}`;
place.coordVerifiedAt = date;
place.coordNote = `Batch 167 pensjonerer den repo-syntetiske identiteten «Furuset–Haugerud skogbelte» og erstatter den med det dokumenterte friområdet Haugerudparken, mens placeId beholdes for kompatibilitet. Oslo kommune dokumenterer parken som kommunalt regulert friområde, statlig sikret for friluftsliv, med skog, stier og en ny sykkelbane som skal være gruslagt og uten belysning. Bounded research fant mange ordinære sykkelveier, men nøyaktig ett særskilt OSM-objekt som matcher denne kildebeskrivelsen: way ${trackWayId} med leisure=track, cycling=pump_track, sport=bmx og surface=fine_gravel. Fresh OSM-geometri hard-gates objektet, og canonical lat/lon er det deterministiske lengdemidtpunktet langs banen (${totalLengthM.toFixed(1)} m). Ankeret ligger ${churchDistanceM.toFixed(1)} m sør for fresh Haugerud kirke way ${churchWayId}. Sykkelbanen brukes eksplisitt som internt parkanker, ikke som parkgrense eller geometrisk sentrum. Legacy-punktet og nearest/first-hit brukes ikke.`;
place.identityScope = {
  method: 'official_park_identity_plus_unique_source_defined_internal_feature',
  correctedLegacyName: 'Furuset–Haugerud skogbelte',
  resolvedIdentity: canonicalName,
  stablePlaceIdRetained: true,
  internalAnchor: {
    sourceObjectId: `osm-way:${trackWayId}`,
    role: 'documented_internal_gravel_bicycle_track',
    lengthM: Number(totalLengthM.toFixed(1)),
    representsFullParkBoundary: false,
  },
  topologyCrosscheck: {
    sourceObjectId: `osm-way:${churchWayId}`,
    name: 'Haugerud kirke',
    relation: 'internal anchor south of church',
    distanceM: Number(churchDistanceM.toFixed(1)),
  },
  excludedProxies: ['legacy coordinate', 'unnamed nearby wood polygons', 'three rejected leisure=park polygons', 'nearest/first-hit candidate'],
};

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate) || aggregate.filter((entry) => entry?.id === placeId).length !== 1) throw new Error(`${placeId} must exist exactly once in aggregate`);
writeJson(aggregateFile, aggregate.map((entry) => entry?.id === placeId ? place : entry));
writeJson(childFile, place);

const index = readJson(indexFile);
const indexRows = Array.isArray(index) ? index : index.places;
if (!Array.isArray(indexRows)) throw new Error('Unexpected split-index shape');
const indexRow = indexRows.find((row) => row?.id === placeId);
if (!indexRow) throw new Error(`${placeId} missing from split index`);
for (const key of ['name','lat','lon','r','year','coordStatus','coordType','locatorType','sourceProvider','sourceObjectId','geocodeAccuracy','coordRole','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote']) {
  if (place[key] !== undefined) indexRow[key] = place[key];
}
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRows = Array.isArray(manifest) ? manifest : manifest.places;
if (!Array.isArray(manifestRows)) throw new Error('Unexpected split-manifest shape');
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
    resolvedIdentity: 'Haugerudparken – kommunalt friområde med skog, stier og aktivitetsanlegg',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'natural_area',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'municipality',
      sourceName: 'Oslo kommune – Haugerudparken',
      sourceUrl: 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/haugerudparken',
      sourceObjectId: 'oslo-kommune:haugerudparken',
      sourceQuality: 'official_named_park_identity_and_internal_feature_description',
      finding: 'Kommunen dokumenterer Haugerudparken som regulert kommunalt friområde og statlig sikret friluftsområde, samt en ny sykkelbane bygget som grusbane uten belysning.',
      canVerifyCoordinate: false,
      reason: 'Fastsetter parkidentiteten og den spesifikke interne feature-typen; kartgeometrien kommer fra fresh OSM.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – unique Haugerudparken internal gravel bicycle track',
      sourceUrl: place.coordSourceUrl,
      sourceObjectId: place.sourceObjectId,
      sourceQuality: 'unique_source_defined_internal_feature_geometry',
      finding: `Bounded live query finds exactly one pump-track object matching the official gravel/unlit bicycle-track description. Fresh way ${trackWayId} has leisure=track, cycling=pump_track, sport=bmx, surface=fine_gravel and no lit=yes.`,
      canVerifyCoordinate: true,
      reason: 'The exact OSM geometry is used honestly as an internal line anchor, not as a proxy for the park boundary.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – Haugerud kirke topology crosscheck',
      sourceUrl: `https://www.openstreetmap.org/way/${churchWayId}`,
      sourceObjectId: `osm-way:${churchWayId}`,
      sourceQuality: 'exact_named_topology_crosscheck',
      finding: `Fresh Haugerud kirke geometry places the internal anchor ${churchDistanceM.toFixed(1)} m south of the church, consistent with the documented park topology.`,
      canVerifyCoordinate: false,
      reason: 'Independent topology QA only; the church is not the park coordinate source.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: place.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: 'municipality', sourceObjectId: 'oslo-kommune:haugerudparken', canApplyToPlace: false },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: place.sourceObjectId,
      geometryRole: 'source_defined_internal_feature',
      coordRole: 'line_anchor',
      canApplyToPlace: true,
      representsFullParkBoundary: false,
      lengthM: Number(totalLengthM.toFixed(1)),
    },
  ],
  coordinateCandidates: [
    { lat: place.lat, lon: place.lon, geocodeAccuracy: 'semantic_anchor', coordRole: 'line_anchor', sourceObjectId: place.sourceObjectId, canApplyToPlace: true },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Applied to canonical place as a documented internal park anchor; no park-boundary claim is made.',
  },
  notes: [place.coordNote],
});

let protocol = fs.readFileSync(abs(protocolFile), 'utf8');
if (protocol.includes(`| ${batch} | \`${placeId}\``)) throw new Error(`Batch ${batch} row for ${placeId} already exists on production base`);
const countMatch = protocol.match(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./);
if (!countMatch) throw new Error('Could not locate Oslo verified count');
const oldCount = Number(countMatch[1]);
protocol = protocol.replace(countMatch[0], `Oslo-protokollen dekker nå ${oldCount + 1} aktive current \`verified*\` canonical Oslo-steder.`);
protocol = protocol.split('\n').filter((line) => !(line.includes(`\`${placeId}\``) && line.includes('needs_review'))).join('\n');
protocol = protocol.replace(/Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte canonical Oslo-stedene\./, `Disse kontrollene er fullført, men teller ikke blant de ${oldCount + 1} verifiserte canonical Oslo-stedene.`);
const reviewHeading = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const reviewPos = protocol.indexOf(reviewHeading);
if (reviewPos < 0) throw new Error('Could not locate Oslo review heading');
const batchBlock = `| ${batch} | \`${placeId}\` | ${canonicalName} | verified_geometry | \`osm-way:${trackWayId}\` |\n\nBatch ${batch} (${date}) pensjonerer den repo-syntetiske identiteten «Furuset–Haugerud skogbelte» og modellerer recorden som det dokumenterte friområdet Haugerudparken. OSM har ingen samlet eksakt navngitt parkpolygon som kan brukes som falsk yttergrense. I stedet identifiseres ett kildebeskrevet internt anker: Oslo kommune dokumenterer en ubelyst sykkelbane bygget som grusbane, og bounded live OSM-research finner nøyaktig én særskilt match, way ${trackWayId} (leisure=track, cycling=pump_track, sport=bmx, surface=fine_gravel). Canonical lat/lon er lengdemidtpunktet langs denne fresh geometrien. Ankeret representerer et dokumentert sted inne i parken, ikke parkens fulle areal eller geometriske sentrum; legacy-punkt og nearest/first-hit brukes ikke.\n\n`;
protocol = `${protocol.slice(0, reviewPos)}${batchBlock}${protocol.slice(reviewPos)}`;
fs.writeFileSync(abs(protocolFile), protocol);

fs.mkdirSync(abs(reportDir), { recursive: true });
fs.writeFileSync(abs(`${reportDir}/osm-way-${trackWayId}-full.xml`), trackXml);
fs.writeFileSync(abs(`${reportDir}/osm-way-${churchWayId}-full.xml`), churchXml);
fs.writeFileSync(abs(`${reportDir}/overpass-unique-track.json`), `${JSON.stringify(overpass, null, 2)}\n`);
fs.writeFileSync(abs(`${reportDir}/sources.md`), `# Batch 167 sources\n\n- Oslo kommune – Haugerudparken: https://www.oslo.kommune.no/slik-bygger-vi-oslo/haugerudparken\n- Oslo byleksikon – Haugerudparken: https://oslobyleksikon.no/side/Haugerudparken\n- Fresh bounded Overpass uniqueness result and direct OSM API XML for ways ${trackWayId} and ${churchWayId} are stored in this directory.\n`);
writeJson(`${reportDir}/batch-167-result.json`, {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  oldIdentity: oldPlace.name,
  newIdentity: canonicalName,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: place.lat, lon: place.lon },
  sourceProvider: place.sourceProvider,
  sourceObjectId: place.sourceObjectId,
  trackTags: track.tags,
  trackLengthM: Number(totalLengthM.toFixed(1)),
  topologyCrosscheck: `osm-way:${churchWayId}`,
  churchDistanceM: Number(churchDistanceM.toFixed(1)),
  representsFullParkBoundary: false,
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
  trackLengthM: Number(totalLengthM.toFixed(1)),
  churchDistanceM: Number(churchDistanceM.toFixed(1)),
  status: place.coordStatus,
}, null, 2));
