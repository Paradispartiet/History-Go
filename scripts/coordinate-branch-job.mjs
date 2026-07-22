import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 147;
const PLACE_ID = 'ljanselva_bunnefjorden';
const RIVER_WAY_ID = 156700580;
const COASTLINE_WAY_ID = 4154785;
const MOUTH_NODE_ID = 1689201164;
const VERIFIED_AT = '2026-07-22';
const FISKEVOLLBukta_REFERENCE = { lat: 59.842206, lon: 10.773788 };
const MAX_REFERENCE_DISTANCE_M = 250;

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_bunnefjorden.json');
const splitIndexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_index.json');
const splitManifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/ljanselva_bunnefjorden.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-147-ljanselva-fiskevollbukta-mouth');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function decodeXml(value = '') {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function attrs(tag) {
  const out = {};
  for (const match of tag.matchAll(/([:\w-]+)="([^"]*)"/g)) {
    out[match[1]] = decodeXml(match[2]);
  }
  return out;
}

function parseWaysXml(xml) {
  const ways = [];
  for (const match of xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)) {
    const meta = attrs(`<way ${match[1]}>`);
    const body = match[2];
    const tags = {};
    const nodeRefs = [];
    for (const tagMatch of body.matchAll(/<tag\b[^>]*\/>/g)) {
      const a = attrs(tagMatch[0]);
      if (a.k) tags[a.k] = a.v ?? '';
    }
    for (const nodeMatch of body.matchAll(/<nd\b[^>]*\/>/g)) {
      const a = attrs(nodeMatch[0]);
      if (a.ref) nodeRefs.push(String(a.ref));
    }
    ways.push({ id: Number(meta.id), tags, nodeRefs });
  }
  return ways;
}

function haversineM(a, b) {
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)',
      Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1',
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Kildeoppslag feilet ${response.status}: ${url}`);
  return response.text();
}

function updatePlaceRecord(place, mouthNode) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    name: 'Ljanselva – utløp i Fiskevollbukta',
    lat: mouthNode.lat,
    lon: mouthNode.lon,
    desc: 'Eksplisitt munningspunkt der den kartfestede Ljanselva-linjen møter kystlinjen i Fiskevollbukta, en vik i Bunnefjorden.',
    tags: ['elv', 'utlop', 'fjord', 'munning'],
    sourceHint: 'Koordinaten er OSM node 1689201164, delt mellom den eksakt navngitte Ljanselva-wayen 156700580 og kystlinje-way 4154785 i Fiskevollbukta.',
    coordType: 'hydrological_mouth_topology_node',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 156700580 (Ljanselva) + coastline way 4154785, shared node 1689201164',
    coordVerifiedAt: VERIFIED_AT,
    popupDesc: 'Her ender den kartfestede Ljanselva-korridoren i Fiskevollbukta, som ligger i Bunnefjorden. Den nederste fysiske delen av elva er dokumentert lagt i kulvert, så munningspunktet skal forstås som selve overgangen der vassdraget kommer ut til fjorden – ikke som et tilfeldig punkt i fjorden eller et midtpunkt på en elvestrekning. Kartankeret er den delte topologiske noden mellom den navngitte Ljanselva-linjen og kystlinjen.',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:1689201164',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordSourceId: 'osm-node:1689201164',
    coordSourceUrl: 'https://www.openstreetmap.org/node/1689201164',
    coordNote: `Batch 147 verifiserer Ljanselvas konkrete munningsanker med eksplisitt OSM-topologi. Node ${mouthNode.id} er et endepunkt på den eksakt navngitte Ljanselva-wayen ${RIVER_WAY_ID} og deles samtidig med coastline way ${COASTLINE_WAY_ID}. Noden ligger ${mouthNode.referenceDistanceM.toFixed(1)} meter fra den uavhengige Fiskevollbukta-referansen. Oslo byleksikon dokumenterer at Ljanselva munner i Fiskevollbukta og at nederste del er kulvertert. Punktet representerer derfor munningen i Fiskevollbukta, ikke et generelt Bunnefjorden-punkt og ikke et påstått åpent elveløp gjennom hele nedre strekning. Legacy-punktet 59.8288, 10.8034 pensjoneres; ingen nearest/first-hit-logikk brukes.`,
    nature_profile: {
      ...place.nature_profile,
      type: 'elvemunning / kulvertutløp / fjordovergang',
      title: 'Ljanselva kommer ut i Fiskevollbukta',
      summary: 'I Fiskevollbukta avsluttes Ljanselvas vassdragskorridor ved møtet med Bunnefjorden. Den nederste delen av elva er dokumentert kulvertert, og munningsankeret markerer derfor overgangen fra et skjult, teknisk omformet elveløp til fjordens åpne vannrom. Natur-rundingen viser sluttpunktet for vassdraget uten å fremstille den nedre kulvertstrekningen som synlig elv.',
      themes: [
        'Ljanselvas dokumenterte munning i Fiskevollbukta',
        'overgang fra kulvertert elv til fjord',
        'Fiskevollbukta som del av Bunnefjorden',
        'delt topologisk node mellom elvelinje og kystlinje',
        'sluttpunkt for Ljanselva-vassdraget',
        'forbindelsen tilbake gjennom Liadalen og Østmarka',
      ],
    },
  };
}

fs.mkdirSync(reportDir, { recursive: true });

const nodeUrl = `https://api.openstreetmap.org/api/0.6/node/${MOUTH_NODE_ID}`;
const nodeXml = await fetchText(nodeUrl);
fs.writeFileSync(path.join(reportDir, `osm-node-${MOUTH_NODE_ID}.xml`), nodeXml);
const nodeMatch = nodeXml.match(new RegExp(`<node\\b[^>]*\\bid="${MOUTH_NODE_ID}"[^>]*>`));
if (!nodeMatch) throw new Error(`Fant ikke OSM node ${MOUTH_NODE_ID}`);
const nodeAttrs = attrs(nodeMatch[0]);
const mouthNode = {
  id: String(nodeAttrs.id),
  lat: Number(nodeAttrs.lat),
  lon: Number(nodeAttrs.lon),
};
if (!Number.isFinite(mouthNode.lat) || !Number.isFinite(mouthNode.lon)) {
  throw new Error(`Ugyldig koordinat på OSM node ${MOUTH_NODE_ID}`);
}

const waysUrl = `https://api.openstreetmap.org/api/0.6/node/${MOUTH_NODE_ID}/ways`;
const waysXml = await fetchText(waysUrl);
fs.writeFileSync(path.join(reportDir, `osm-node-${MOUTH_NODE_ID}-ways.xml`), waysXml);
const connectedWays = parseWaysXml(waysXml);
const riverWay = connectedWays.find((way) => way.id === RIVER_WAY_ID);
const coastlineWay = connectedWays.find((way) => way.id === COASTLINE_WAY_ID);
if (!riverWay) throw new Error(`Node ${MOUTH_NODE_ID} er ikke lenger medlem av Ljanselva-way ${RIVER_WAY_ID}`);
if (riverWay.tags.name !== 'Ljanselva' || riverWay.tags.waterway !== 'river') {
  throw new Error(`Way ${RIVER_WAY_ID} har uventede tags: ${JSON.stringify(riverWay.tags)}`);
}
if (![riverWay.nodeRefs[0], riverWay.nodeRefs.at(-1)].includes(String(MOUTH_NODE_ID))) {
  throw new Error(`Node ${MOUTH_NODE_ID} er ikke endepunkt på Ljanselva-way ${RIVER_WAY_ID}`);
}
if (!coastlineWay || coastlineWay.tags.natural !== 'coastline') {
  throw new Error(`Node ${MOUTH_NODE_ID} deles ikke lenger med forventet coastline way ${COASTLINE_WAY_ID}`);
}
const referenceDistanceM = haversineM(mouthNode, FISKEVOLLBukta_REFERENCE);
if (referenceDistanceM > MAX_REFERENCE_DISTANCE_M) {
  throw new Error(`Munningsnoden ligger ${referenceDistanceM.toFixed(1)} m fra Fiskevollbukta-referansen, over grensen ${MAX_REFERENCE_DISTANCE_M} m`);
}
mouthNode.referenceDistanceM = referenceDistanceM;

const aggregateBefore = readJson(aggregatePath);
const aggregateOld = aggregateBefore.find((place) => place?.id === PLACE_ID);
if (!aggregateOld) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
const aggregateAfter = aggregateBefore.map((place) =>
  place?.id === PLACE_ID ? updatePlaceRecord(place, mouthNode) : place);
writeJson(aggregatePath, aggregateAfter);

const childBefore = readJson(childPath);
const nearbyBefore = childBefore?.nature_profile?.nearby_place_ids || [];
const childAfter = updatePlaceRecord(childBefore, mouthNode);
writeJson(childPath, childAfter);

const splitIndex = readJson(splitIndexPath);
const indexRow = splitIndex.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error(`Mangler ${PLACE_ID} i split-index`);
Object.assign(indexRow, {
  name: childAfter.name,
  lat: childAfter.lat,
  lon: childAfter.lon,
  r: childAfter.r,
  coordStatus: childAfter.coordStatus,
  coordType: childAfter.coordType,
  locatorType: childAfter.locatorType,
  sourceProvider: childAfter.sourceProvider,
  sourceObjectId: childAfter.sourceObjectId,
  geocodeAccuracy: childAfter.geocodeAccuracy,
  coordRole: childAfter.coordRole,
  coordSource: childAfter.coordSource,
  coordSourceId: childAfter.coordSourceId,
  coordSourceUrl: childAfter.coordSourceUrl,
  coordVerifiedAt: childAfter.coordVerifiedAt,
  coordNote: childAfter.coordNote,
});
writeJson(splitIndexPath, splitIndex);

const splitManifest = readJson(splitManifestPath);
splitManifest.source_sha256 = sha256(aggregatePath);
splitManifest.generated_at = new Date().toISOString();
const manifestRow = splitManifest.places?.find((row) => row?.id === PLACE_ID);
if (!manifestRow) throw new Error(`Mangler ${PLACE_ID} i split-manifest`);
manifestRow.name = childAfter.name;
manifestRow.sha256 = sha256(childPath);
writeJson(splitManifestPath, splitManifest);

writeJson(evidencePath, {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: mouthNode.lat,
    lon: mouthNode.lon,
    r: childAfter.r,
    coordStatus: childAfter.coordStatus,
    coordSource: childAfter.coordSource,
    coordType: childAfter.coordType,
    coordNote: childAfter.coordNote,
  },
  identity: {
    currentName: childAfter.name,
    resolvedIdentity: 'Ljanselvas konkrete munningspunkt i Fiskevollbukta, en vik i Bunnefjorden',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'route',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – delt Ljanselva/kystlinje-node i Fiskevollbukta',
      sourceUrl: `https://www.openstreetmap.org/node/${MOUTH_NODE_ID}`,
      sourceObjectId: `osm-node:${MOUTH_NODE_ID}`,
      sourceQuality: 'explicit_river_mouth_topology_node',
      finding: `Node ${MOUTH_NODE_ID} er endepunkt på eksakt navngitt Ljanselva-way ${RIVER_WAY_ID} og deles med coastline way ${COASTLINE_WAY_ID}. Noden ligger ${referenceDistanceM.toFixed(1)} m fra den uavhengige Fiskevollbukta-referansen.`,
      canVerifyCoordinate: true,
      reason: 'Eksplisitt topologisk overgang mellom den navngitte elvelinjen og kystlinjen innenfor dokumentert munningsscope.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Ljanselva',
      sourceUrl: 'https://oslobyleksikon.no/side/Ljanselva',
      sourceObjectId: 'oslobyleksikon:ljanselva',
      sourceQuality: 'documented_mouth_and_lower_culvert',
      finding: 'Kilden dokumenterer at Ljanselva munner i Fiskevollbukta i Bunnefjorden og at nederste del av elva er lagt i kulvert.',
      canVerifyCoordinate: false,
      reason: 'Fastsetter fysisk munningsidentitet og kulvertforbehold; den konkrete noden kommer fra OSM-topologien.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Lokalhistoriewiki – Fiskevollbukta',
      sourceUrl: 'https://lokalhistoriewiki.no/wiki/Fiskevollbukta',
      sourceObjectId: 'lokalhistoriewiki:fiskevollbukta',
      sourceQuality: 'documented_bay_scope_and_reference_point',
      finding: `Kilden dokumenterer Fiskevollbukta som vik ved Bunnefjorden og oppgir referansepunkt ${FISKEVOLLBukta_REFERENCE.lat}, ${FISKEVOLLBukta_REFERENCE.lon}; munningsnoden ligger ${referenceDistanceM.toFixed(1)} m unna.`,
      canVerifyCoordinate: false,
      reason: 'Kryssjekker at den delte elv/kyst-node ligger i riktig Fiskevollbukta-scope.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Ljan skole – Ljanselva i nærmiljøet',
      sourceUrl: 'https://ljan.osloskolen.no/om-skolen/om-oss/skolen-og-naromradet/',
      sourceObjectId: 'osloskolen:ljan-ljanselva-naermiljo',
      sourceQuality: 'official_local_outlet_context',
      finding: 'Kilden beskriver tunnelen som fører Ljanselva ut til havet ved Fiskevollbukta.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker at munningspunktet er slutten på den kulverterte nedre korridoren.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: `osm-node:${MOUTH_NODE_ID}`, canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${RIVER_WAY_ID}`, canApplyToPlace: false },
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${COASTLINE_WAY_ID}`, canApplyToPlace: false },
    { sourceProvider: 'manual_research', sourceObjectId: 'oslobyleksikon:ljanselva', canApplyToPlace: false },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: `osm-node:${MOUTH_NODE_ID}`,
      lat: mouthNode.lat,
      lon: mouthNode.lon,
      coordRole: 'line_anchor',
      geometryType: 'Point',
      canApplyToPlace: true,
    },
  ],
  coordinateCandidates: [
    { lat: mouthNode.lat, lon: mouthNode.lon, coordRole: 'line_anchor', canApplyToPlace: true },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Eksplisitt munningsnode er anvendt på canonical place.',
  },
  notes: [childAfter.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
const needsReviewPattern = /^\| `ljanselva_bunnefjorden` – Ljanselva ut i Bunnefjorden \| needs_review \|.*\n/m;
if (!needsReviewPattern.test(protocol)) {
  throw new Error('Fant ikke needs_review-raden for ljanselva_bunnefjorden');
}
protocol = protocol.replace(needsReviewPattern, '');
const batch146Pattern = /Batch 146 \(2026-07-22\) avgrenser `ljanselva_fiskevollen`[^\n]*/;
const batch146Match = protocol.match(batch146Pattern);
if (!batch146Match) throw new Error('Fant ikke batch 146-ankeret');
const batch147Block = `\n\n| 147 | \`${PLACE_ID}\` | Ljanselva – utløp i Fiskevollbukta | verified_geometry | \`osm-node:${MOUTH_NODE_ID}\` |\n\nBatch 147 (${VERIFIED_AT}) løser \`${PLACE_ID}\` som et eksplisitt hydrologisk munningsanker og presiserer visningsnavnet til «Ljanselva – utløp i Fiskevollbukta». OSM node ${MOUTH_NODE_ID} er et endepunkt på den eksakt navngitte Ljanselva-wayen ${RIVER_WAY_ID} og deles med coastline way ${COASTLINE_WAY_ID}. Noden ligger ${referenceDistanceM.toFixed(1)} meter fra den uavhengige Fiskevollbukta-referansen. Oslo byleksikon dokumenterer munningen i Fiskevollbukta og at nederste elvedel er kulvertert. Punktet representerer derfor den konkrete elv–fjord-overgangen, ikke et generelt Bunnefjorden-punkt eller et midtpunkt på en nærliggende elvegeometri. Legacy-punktet pensjoneres; ingen nearest/first-hit-logikk brukes.`;
protocol = protocol.replace(batch146Match[0], `${batch146Match[0]}${batch147Block}`);
protocol = protocol.replace(
  /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./,
  (_match, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`,
);
fs.writeFileSync(protocolPath, protocol);

writeJson(path.join(reportDir, 'mouth-topology.json'), {
  generatedAt: new Date().toISOString(),
  batch: BATCH,
  placeId: PLACE_ID,
  mouthNode,
  riverWay: {
    id: riverWay.id,
    tags: riverWay.tags,
    isEndpoint: true,
  },
  coastlineWay: {
    id: coastlineWay.id,
    tags: coastlineWay.tags,
  },
  fiskevollbuktaReference: FISKEVOLLBukta_REFERENCE,
  referenceDistanceM: Number(referenceDistanceM.toFixed(1)),
  selectionRule: 'Use the explicit shared endpoint between the exact named Ljanselva way and the coastline, constrained to documented Fiskevollbukta mouth scope.',
});

writeJson(path.join(reportDir, 'nearby-links-preservation.json'), {
  placeId: PLACE_ID,
  before: nearbyBefore,
  after: childAfter?.nature_profile?.nearby_place_ids || [],
  unchanged: JSON.stringify(nearbyBefore) === JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || []),
});

writeJson(path.join(reportDir, 'batch-147-result.json'), {
  generatedAt: new Date().toISOString(),
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'verified_geometry',
  sourceProvider: 'osm',
  sourceObjectId: `osm-node:${MOUTH_NODE_ID}`,
  before: {
    name: aggregateOld.name,
    lat: aggregateOld.lat,
    lon: aggregateOld.lon,
    r: aggregateOld.r,
    coordStatus: aggregateOld.coordStatus,
    coordSource: aggregateOld.coordSource,
    coordType: aggregateOld.coordType,
  },
  after: {
    name: childAfter.name,
    lat: mouthNode.lat,
    lon: mouthNode.lon,
    r: childAfter.r,
    coordStatus: childAfter.coordStatus,
    coordSource: childAfter.coordSource,
    coordType: childAfter.coordType,
    sourceObjectId: childAfter.sourceObjectId,
    geocodeAccuracy: childAfter.geocodeAccuracy,
    coordRole: childAfter.coordRole,
  },
  topology: {
    riverWay: `osm-way:${RIVER_WAY_ID}`,
    coastlineWay: `osm-way:${COASTLINE_WAY_ID}`,
    sharedNode: `osm-node:${MOUTH_NODE_ID}`,
    referenceDistanceM: Number(referenceDistanceM.toFixed(1)),
  },
  method: 'explicit endpoint topology between exact named river way and coastline inside independently documented Fiskevollbukta mouth scope; no midpoint proxy, no generic fjord point, no nearest/first-hit',
});

fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Oslo coordinate control batch 147 – Ljanselva utløp i Fiskevollbukta\n\n- Munningsnode: https://www.openstreetmap.org/node/${MOUTH_NODE_ID}\n- Ljanselva-way: https://www.openstreetmap.org/way/${RIVER_WAY_ID}\n- Kystlinje-way: https://www.openstreetmap.org/way/${COASTLINE_WAY_ID}\n- Oslo byleksikon: https://oslobyleksikon.no/side/Ljanselva\n- Fiskevollbukta scope: https://lokalhistoriewiki.no/wiki/Fiskevollbukta\n- Ljan skole: https://ljan.osloskolen.no/om-skolen/om-oss/skolen-og-naromradet/\n\nBatchen bruker den delte endepunktsnoden mellom den navngitte Ljanselva-wayen og OSM-kystlinjen. Kildene dokumenterer at nederste fysiske del er kulvertert og at munningen ligger i Fiskevollbukta.\n`);

console.log(JSON.stringify({
  batch: BATCH,
  placeId: PLACE_ID,
  newName: childAfter.name,
  sourceObjectId: `osm-node:${MOUTH_NODE_ID}`,
  mouthNode,
  riverWayId: RIVER_WAY_ID,
  coastlineWayId: COASTLINE_WAY_ID,
  nearbyLinksPreserved: JSON.stringify(nearbyBefore) === JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || []),
}, null, 2));
