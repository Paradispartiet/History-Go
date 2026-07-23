#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 164;
const date = '2026-07-23';
const placeId = 'frysjadammen';
const researchRef = 'origin/agent/oslo-coordinate-control-batch-164-oset-slusebru-topology-research';
const researchFile = 'reports/oslo-coordinate-control-batch-164-oset-slusebru-topology-research/topology-summary.json';
const aggregateFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const childFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/frysjadammen.json';
const indexFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const manifestFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const evidenceFile = 'data/coordinate-evidence/oslo/natur/frysjadammen.json';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = 'reports/oslo-coordinate-control-batch-164-oset-slusebru-production';

const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');
const gitShow = (ref, file) => execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });

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

function parseWayXml(xml, expectedWayId) {
  const nodeMap = new Map();
  for (const match of xml.matchAll(/<node\s+[^>]*id="(\d+)"[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*\/?\s*>/g)) {
    nodeMap.set(match[1], { id: match[1], lat: Number(match[2]), lon: Number(match[3]) });
  }
  const wayMatch = xml.match(new RegExp(`<way\\s+[^>]*id="${expectedWayId}"[^>]*>([\\s\\S]*?)<\\/way>`));
  if (!wayMatch) throw new Error(`Could not find way ${expectedWayId} in fresh OSM XML`);
  const body = wayMatch[1];
  const refs = [...body.matchAll(/<nd\s+ref="(\d+)"\s*\/>/g)].map((match) => match[1]);
  const tags = Object.fromEntries([...body.matchAll(/<tag\s+k="([^"]+)"\s+v="([^"]*)"\s*\/>/g)].map((match) => [match[1], match[2]]));
  const coordinates = refs.map((ref) => nodeMap.get(ref)).filter(Boolean);
  if (coordinates.length !== refs.length || coordinates.length < 2) throw new Error(`Incomplete geometry for way ${expectedWayId}`);
  const center = {
    lat: coordinates.reduce((sum, point) => sum + point.lat, 0) / coordinates.length,
    lon: coordinates.reduce((sum, point) => sum + point.lon, 0) / coordinates.length,
  };
  return { id: expectedWayId, refs, tags, coordinates, center };
}

function haversine(a, b) {
  const R = 6371000;
  const rad = (degree) => degree * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// The research pass must identify exactly one source-defined "immediately below" bridge pair.
const research = JSON.parse(gitShow(researchRef, researchFile));
const immediatePairs = (research.strictPairs || []).filter((pair) =>
  pair.distanceM < 25 &&
  pair.pedestrianTags?.bridge === 'yes' &&
  pair.pedestrianTags?.highway === 'footway' &&
  pair.pedestrianTags?.surface === 'wood' &&
  pair.vehicleTags?.bridge === 'yes' &&
  pair.vehicleTags?.highway === 'service' &&
  pair.vehicleTags?.access === 'no'
);
if (immediatePairs.length !== 1) {
  throw new Error(`Expected one immediate Oset pedestrian/service bridge pair, found ${immediatePairs.length}`);
}
const selectedPair = immediatePairs[0];
if (selectedPair.slusebruCandidateWayId !== 79506476 || selectedPair.anleggsbruCandidateWayId !== 66159193) {
  throw new Error(`Unexpected Oset pair ${selectedPair.slusebruCandidateWayId}/${selectedPair.anleggsbruCandidateWayId}`);
}

const sluseWayId = selectedPair.slusebruCandidateWayId;
const anleggsWayId = selectedPair.anleggsbruCandidateWayId;
const sluseUrl = `https://api.openstreetmap.org/api/0.6/way/${sluseWayId}/full`;
const anleggsUrl = `https://api.openstreetmap.org/api/0.6/way/${anleggsWayId}/full`;
const [sluseXml, anleggsXml] = await Promise.all([fetchText(sluseUrl), fetchText(anleggsUrl)]);
const sluse = parseWayXml(sluseXml, sluseWayId);
const anleggs = parseWayXml(anleggsXml, anleggsWayId);

if (sluse.tags.bridge !== 'yes' || sluse.tags.highway !== 'footway' || sluse.tags.surface !== 'wood') {
  throw new Error('Fresh way 79506476 no longer matches the documented wooden pedestrian bridge geometry');
}
if (anleggs.tags.bridge !== 'yes' || anleggs.tags.highway !== 'service' || anleggs.tags.access !== 'no') {
  throw new Error('Fresh way 66159193 no longer matches the restricted service bridge geometry');
}
const pairDistanceM = haversine(sluse.center, anleggs.center);
if (pairDistanceM >= 25) throw new Error(`Oset bridge pair is no longer immediate: ${pairDistanceM.toFixed(1)} m`);

const canonicalName = 'Oset slusebru – damanlegget ved Maridalsoset';
const oldPlace = readJson(childFile);
if (oldPlace.id !== placeId) throw new Error(`Unexpected child place ID ${oldPlace.id}`);
if (oldPlace.coordStatus !== 'needs_source') throw new Error(`${placeId} is no longer needs_source on this production base`);

const place = structuredClone(oldPlace);
place.name = canonicalName;
place.lat = sluse.center.lat;
place.lon = sluse.center.lon;
place.year = 1859;
place.desc = 'Historisk trebru og reguleringspunkt ved Maridalsoset, der Maridalsvannet går over i Akerselva.';
place.popupDesc = 'Oset slusebru ligger ved Maridalsoset og er en bevart del av reguleringsanlegget der Maridalsvannet går over i Akerselva. Trebrua ble oppført i 1859, og reguleringsluken for vannføringen lå i selve broanlegget. Den nyere Oset anleggsbru ligger umiddelbart oppstrøms og gjør den historiske slusebrua fysisk identifiserbar i dagens landskap.\n\nI History Go er stedet viktig fordi det gjør sammenhengen mellom naturgrunnlag, tekniske inngrep og byutvikling konkret: hvordan vann må styres før det når de tettere bydelene lenger sør.';
if (Array.isArray(place.quiz_profile?.signature_features)) {
  place.quiz_profile.signature_features = place.quiz_profile.signature_features.map((value) =>
    value === 'Frysjadammen'
      ? canonicalName
      : value === 'Reguleringsdam som markerer starten på Akerselva. Viktig hydrologisk og historisk punkt.'
        ? 'Oset slusebru og damanlegget ved Maridalsoset markerer den regulerte overgangen fra Maridalsvannet til Akerselva.'
        : value
  );
}
for (const item of place.civication_store || []) {
  if (typeof item.placeSpecificReason === 'string') {
    item.placeSpecificReason = item.placeSpecificReason.replace(/Frysjadammens funksjon/g, 'damanleggets funksjon ved Maridalsoset');
  }
}
place.locatorType = 'linear_area';
place.sourceProvider = 'osm';
place.sourceObjectId = `osm-way:${sluseWayId}`;
place.geocodeAccuracy = 'geometric_center';
place.coordRole = 'line_anchor';
place.coordType = 'bridge_center';
place.coordStatus = 'verified_geometry';
place.coordSource = `OpenStreetMap way ${sluseWayId} – Oset slusebru identified by source-defined topology immediately below Oset anleggsbru way ${anleggsWayId}`;
place.coordSourceId = `osm-way:${sluseWayId}`;
place.coordSourceUrl = `https://www.openstreetmap.org/way/${sluseWayId}`;
place.coordVerifiedAt = date;
place.coordNote = `Batch 164 retter legacy-identiteten Frysjadammen til damanlegget ved Maridalsoset, som resten av recordens kilder og innhold faktisk beskriver. Oslo byleksikon identifiserer Oset slusebru som gangbrua umiddelbart nedenfor Oset anleggsbru. Bounded OSM-research fant tre mulige fotbru/kjørebru-par i den brede korridoren, men bare way ${sluseWayId} (trelagt footway) og way ${anleggsWayId} (access=no servicebru) oppfyller den kildefestede umiddelbare naborelasjonen: ${pairDistanceM.toFixed(1)} meter mellom geometrisentrene. Canonical lat/lon er geometrisk sentrum av fresh way ${sluseWayId}. Brekkedammen/Kjelsåsdammen ved Frysja er et annet sted og brukes ikke som proxy; den gamle koordinaten og nearest/first-hit brukes ikke.`;
place.identityScope = {
  method: 'source_identity_plus_immediate_bridge_topology',
  correctedLegacyName: 'Frysjadammen',
  resolvedIdentity: canonicalName,
  stablePlaceIdRetained: true,
  slusebruWayId: sluseWayId,
  anleggsbruWayId: anleggsWayId,
  bridgeCenterDistanceM: Number(pairDistanceM.toFixed(1)),
  sourceIdentityRule: 'Oset slusebru is the wooden pedestrian bridge immediately below Oset anleggsbru at Maridalsoset.',
  excludedIdentity: 'Brekkedammen / Kjelsåsdammen at Frysja',
};

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
]) {
  if (place[key] !== undefined) indexRow[key] = place[key];
}
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error(`${placeId} missing from split manifest`);
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.name = place.name;
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

const evidenceNote = place.coordNote;
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
    coordNote: evidenceNote,
  },
  identity: {
    currentName: canonicalName,
    resolvedIdentity: canonicalName,
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'linear_area',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – fresh Oset bridge geometry',
      sourceUrl: place.coordSourceUrl,
      sourceObjectId: place.sourceObjectId,
      sourceQuality: 'source_identified_exact_bridge_geometry',
      finding: `Fresh OSM way ${sluseWayId} is a wooden footway bridge. Together with restricted service bridge ${anleggsWayId}, ${pairDistanceM.toFixed(1)} m immediately upstream, it reproduces the source-defined Oset slusebru/Oset anleggsbru topology.`,
      canVerifyCoordinate: true,
      reason: 'The physical bridge geometry is exact, and the bridge identity is independently resolved by the documented immediate downstream relationship to Oset anleggsbru.',
    },
    {
      sourceProvider: 'oslo_byleksikon',
      sourceName: 'Oslo byleksikon – Oset slusebru and Oset anleggsbru',
      sourceUrl: 'https://oslobyleksikon.no/side/Oset_slusebru',
      sourceObjectId: 'oslobyleksikon:oset-slusebru',
      sourceQuality: 'independent_identity_and_topology_source',
      finding: 'The source identifies Oset slusebru as the historical pedestrian/sluis bridge immediately below Oset anleggsbru at the Maridalsvannet outlet.',
      canVerifyCoordinate: true,
      reason: 'The source-defined relative topology uniquely selects the exact physical OSM bridge when combined with the bounded candidate audit.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${sluseWayId}`, canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${anleggsWayId}`, canApplyToPlace: false, role: 'topology_crosscheck' },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: `osm-way:${sluseWayId}`,
      geometryRole: 'source_identified_bridge_center',
      canApplyToPlace: true,
      identityScope: place.identityScope,
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
  notes: [evidenceNote],
});

let protocol = fs.readFileSync(abs(protocolFile), 'utf8');
protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${date}`);
if (!protocol.includes(`| ${batch} | \`${placeId}\``)) {
  protocol = protocol.replace(
    /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./,
    (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`,
  );
  const insertion = `| ${batch} | \`${placeId}\` | ${canonicalName} | verified_geometry | \`osm-way:${sluseWayId}\` |\n\nBatch ${batch} (${date}) løser den dokumenterte identitetskonflikten i legacy-recorden \`frysjadammen\`. Recordens innhold, historiske verk, naturprofil og kilder beskriver damanlegget ved Maridalsoset, ikke Brekkedammen/Kjelsåsdammen ved Frysja. Oslo byleksikon identifiserer Oset slusebru som gangbrua umiddelbart nedenfor Oset anleggsbru. Bounded OSM-research fant tre mulige fotbru/kjørebru-par i den brede korridoren, men bare den trelagte footway-brua way ${sluseWayId} og den stengte servicebrua way ${anleggsWayId} oppfyller den kildefestede umiddelbare naborelasjonen, med ca. ${pairDistanceM.toFixed(1)} meter mellom geometrisentrene. Canonical lat/lon er geometrisk sentrum av fresh OSM way ${sluseWayId}. Det stabile placeId-et beholdes for kompatibilitet, mens visningsidentiteten rettes til ${canonicalName}. Legacy-punktet, Brekkedammen som proxy og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex < 0) throw new Error('Could not find protocol insertion marker');
  protocol = `${protocol.slice(0, markerIndex)}${insertion}${protocol.slice(markerIndex)}`;
}
protocol = protocol
  .split('\n')
  .filter((line) => !(line.includes(`\`${placeId}\``) && line.includes('needs_review')))
  .join('\n');
fs.writeFileSync(abs(protocolFile), protocol);

fs.mkdirSync(abs(reportDir), { recursive: true });
fs.writeFileSync(abs(`${reportDir}/osm-way-${sluseWayId}-full.xml`), sluseXml);
fs.writeFileSync(abs(`${reportDir}/osm-way-${anleggsWayId}-full.xml`), anleggsXml);
fs.writeFileSync(abs(`${reportDir}/topology-research-summary.json`), `${JSON.stringify(research, null, 2)}\n`);
fs.writeFileSync(abs(`${reportDir}/sources.md`), `# Batch 164 sources\n\n- Oslo byleksikon – Oset slusebru: https://oslobyleksikon.no/side/Oset_slusebru\n- Oslo byleksikon – Oset anleggsbru: https://oslobyleksikon.no/side/Oset_anleggsbru\n- Oslo byleksikon – Akerselva: https://oslobyleksikon.no/side/Akerselva\n- Oslo kommune – Brekkedammen ved Frysja: https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/brekkedammen-ved-frysja\n- Fresh OSM API XML for ways ${sluseWayId} and ${anleggsWayId} is stored in this directory.\n`);
writeJson(`${reportDir}/batch-164-result.json`, {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  oldIdentity: oldPlace.name,
  newIdentity: canonicalName,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: place.lat, lon: place.lon },
  sourceProvider: place.sourceProvider,
  sourceObjectId: place.sourceObjectId,
  slusebruWayId,
  anleggsbruWayId,
  bridgeCenterDistanceM: Number(pairDistanceM.toFixed(1)),
  researchStrictPairCount: research.strictPairs?.length || 0,
  immediateSourceMatchingPairCount: immediatePairs.length,
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
  topologyCrosscheck: `osm-way:${anleggsWayId}`,
  bridgeCenterDistanceM: Number(pairDistanceM.toFixed(1)),
  status: place.coordStatus,
}, null, 2));
