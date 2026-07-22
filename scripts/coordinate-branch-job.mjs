import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 146;
const PLACE_ID = 'ljanselva_fiskevollen';
const OSM_WAY_ID = 156700580;
const UPSTREAM_WAY_ID = 98539575;
const VERIFIED_AT = '2026-07-22';
const FISKEVOLLBukta_REFERENCE = { lat: 59.842206, lon: 10.773788 };
const MAX_MOUTH_REFERENCE_DISTANCE_M = 250;

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_fiskevollen.json');
const splitIndexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_index.json');
const splitManifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/ljanselva_fiskevollen.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const candidateSummaryPath = path.join(ROOT, 'reports/oslo-coordinate-control-batch-145-ljanselva-ljan-topology/candidate-summary.json');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-146-ljanselva-fiskevollen-lower-corridor');

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

function lineLengthM(points) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += haversineM(points[index - 1], points[index]);
  }
  return total;
}

function lineMidpoint(points) {
  if (points.length < 2) throw new Error('Kildegeometrien har for få punkter');
  const totalLengthM = lineLengthM(points);
  const target = totalLengthM / 2;
  let walked = 0;
  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1];
    const b = points[index];
    const segmentLengthM = haversineM(a, b);
    if (walked + segmentLengthM >= target) {
      const fraction = segmentLengthM === 0 ? 0 : (target - walked) / segmentLengthM;
      return {
        lat: Number((a.lat + (b.lat - a.lat) * fraction).toFixed(7)),
        lon: Number((a.lon + (b.lon - a.lon) * fraction).toFixed(7)),
        totalLengthM: Number(totalLengthM.toFixed(1)),
      };
    }
    walked += segmentLengthM;
  }
  const last = points.at(-1);
  return {
    lat: Number(last.lat.toFixed(7)),
    lon: Number(last.lon.toFixed(7)),
    totalLengthM: Number(totalLengthM.toFixed(1)),
  };
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

function updatePlaceRecord(place, anchor, mouthNode, coastlineWayId) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    lat: anchor.lat,
    lon: anchor.lon,
    desc: 'Nedre Ljanselva-korridor mot Fiskevollbukta; den nederste fysiske delen av elva er dokumentert kulvertert.',
    sourceHint: 'Koordinaten er et line-anchor beregnet fra OSM way 156700580, en eksakt navngitt Ljanselva-geometri som kobler Liadalen-segmentet til en delt kystnode i Fiskevollbukta. Geometrien brukes som vassdragskorridor, ikke som bevis for at hele strekningen er synlig åpen elv.',
    coordType: 'culverted_lower_river_route_anchor',
    coordStatus: 'verified_geometry',
    coordSource: `OpenStreetMap way 156700580 – modellert nedre Ljanselva-korridor til coastline way ${coastlineWayId}, shared node ${mouthNode.id}`,
    coordVerifiedAt: VERIFIED_AT,
    popupDesc: 'Ved Fiskevollen er Ljanselva i sin nedre korridor mot Fiskevollbukta. Kildene dokumenterer at den nederste delen av elva er lagt i kulvert, så dette stoppet skal ikke leses som et punkt der hele vannløpet ligger synlig i dagen. Kartankeret følger den navngitte Ljanselva-geometrien som binder Liadalen til den dokumenterte munningen i Fiskevollbukta. Stedet viser dermed overgangen fra det åpne dalføret til et skjult, teknisk omformet vassdrag før fjorden.',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:156700580',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordSourceId: 'osm-way:156700580',
    coordSourceUrl: 'https://www.openstreetmap.org/way/156700580',
    coordNote: `Batch 146 avgrenser Fiskevollen-stoppet som en nedre Ljanselva-korridor, ikke som en påstått åpen elvestrekning. OSM way 156700580 er eksakt navngitt Ljanselva, kobler eksakt oppstrøms til Ljan/Liadalen-way 98539575 og ender i shared node ${mouthNode.id} med OSM-kystlinjen way ${coastlineWayId}. Den delte kystnoden ligger innenfor Fiskevollbukta-scope og ${mouthNode.referenceDistanceM.toFixed(1)} meter fra den uavhengige Fiskevollbukta-referansen. Oslo byleksikon og Ljan skole dokumenterer samtidig at den nederste fysiske delen av Ljanselva er kulvertert. Way-geometrien brukes derfor som semantic line_anchor for den nedre vassdragskorridoren, ikke som bevis for synlig overflatevann eller eksakt tunnelløp. Legacy-punktet 59.8319, 10.8048 brukes ikke; ingen nearest/first-hit-logikk brukes.`,
  };
}

fs.mkdirSync(reportDir, { recursive: true });

const research = readJson(candidateSummaryPath);
const exactCandidates = research.exactLjanselvaRivers || [];
const selectedResearch = exactCandidates.find((candidate) => Number(candidate.osmId) === OSM_WAY_ID);
const upstreamResearch = exactCandidates.find((candidate) => Number(candidate.osmId) === UPSTREAM_WAY_ID);
if (!selectedResearch || !upstreamResearch) {
  throw new Error('Mangler forventede segmenter fra batch 145-research');
}
if (haversineM(selectedResearch.firstPoint, upstreamResearch.lastPoint) > 1) {
  throw new Error('Research-topologien mellom Ljan og Fiskevollen er ikke lenger eksakt');
}

const osmUrl = `https://api.openstreetmap.org/api/0.6/way/${OSM_WAY_ID}/full`;
const osmXml = await fetchText(osmUrl);
fs.writeFileSync(path.join(reportDir, `osm-way-${OSM_WAY_ID}-full.xml`), osmXml);

const nodeMap = new Map();
for (const match of osmXml.matchAll(/<node\b[^>]*>/g)) {
  const a = attrs(match[0]);
  if (a.id && a.lat && a.lon) {
    nodeMap.set(String(a.id), {
      id: String(a.id),
      lat: Number(a.lat),
      lon: Number(a.lon),
    });
  }
}
const ways = parseWaysXml(osmXml);
const selectedWay = ways.find((way) => way.id === OSM_WAY_ID);
if (!selectedWay) throw new Error(`Fant ikke way ${OSM_WAY_ID} i full-respons`);
if (selectedWay.tags.name !== 'Ljanselva' || selectedWay.tags.waterway !== 'river') {
  throw new Error(`Uventede tags på way ${OSM_WAY_ID}: ${JSON.stringify(selectedWay.tags)}`);
}
const points = selectedWay.nodeRefs.map((ref) => nodeMap.get(ref)).filter(Boolean);
if (points.length !== selectedWay.nodeRefs.length || points.length < 2) {
  throw new Error('Kunne ikke rekonstruere full valgt geometri');
}

const upstreamReference = upstreamResearch.lastPoint;
const firstDistanceM = haversineM(points[0], upstreamReference);
const lastDistanceM = haversineM(points.at(-1), upstreamReference);
const upstreamNode = firstDistanceM <= lastDistanceM ? points[0] : points.at(-1);
const downstreamNode = firstDistanceM <= lastDistanceM ? points.at(-1) : points[0];
if (Math.min(firstDistanceM, lastDistanceM) > 1) {
  throw new Error(`Fresh way kobler ikke eksakt til upstream way: ${Math.min(firstDistanceM, lastDistanceM).toFixed(2)} m`);
}

const downstreamWaysUrl = `https://api.openstreetmap.org/api/0.6/node/${downstreamNode.id}/ways`;
const downstreamWaysXml = await fetchText(downstreamWaysUrl);
fs.writeFileSync(path.join(reportDir, `osm-node-${downstreamNode.id}-ways.xml`), downstreamWaysXml);
const connectedWays = parseWaysXml(downstreamWaysXml).filter((way) => way.id !== OSM_WAY_ID);
const coastlineWays = connectedWays.filter((way) => way.tags.natural === 'coastline');
if (coastlineWays.length < 1) {
  throw new Error(`Downstream-node ${downstreamNode.id} er ikke eksplisitt delt med OSM-kystlinjen. Connected: ${JSON.stringify(connectedWays)}`);
}
const coastlineWay = coastlineWays[0];
const mouthReferenceDistanceM = haversineM(downstreamNode, FISKEVOLLBukta_REFERENCE);
if (mouthReferenceDistanceM > MAX_MOUTH_REFERENCE_DISTANCE_M) {
  throw new Error(`Delt kystnode ligger ${mouthReferenceDistanceM.toFixed(1)} m fra Fiskevollbukta-referansen, over grensen ${MAX_MOUTH_REFERENCE_DISTANCE_M} m`);
}
const mouthNode = {
  ...downstreamNode,
  referenceDistanceM: mouthReferenceDistanceM,
};
const anchor = lineMidpoint(points);

const aggregateBefore = readJson(aggregatePath);
const aggregateOld = aggregateBefore.find((place) => place?.id === PLACE_ID);
if (!aggregateOld) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
writeJson(aggregatePath, aggregateBefore.map((place) =>
  place?.id === PLACE_ID ? updatePlaceRecord(place, anchor, mouthNode, coastlineWay.id) : place));

const childBefore = readJson(childPath);
const nearbyBefore = childBefore?.nature_profile?.nearby_place_ids || [];
const childAfter = updatePlaceRecord(childBefore, anchor, mouthNode, coastlineWay.id);
writeJson(childPath, childAfter);

const splitIndex = readJson(splitIndexPath);
const indexRow = splitIndex.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error(`Mangler ${PLACE_ID} i split-index`);
Object.assign(indexRow, {
  lat: anchor.lat,
  lon: anchor.lon,
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
manifestRow.sha256 = sha256(childPath);
writeJson(splitManifestPath, splitManifest);

writeJson(evidencePath, {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: anchor.lat,
    lon: anchor.lon,
    r: childAfter.r,
    coordStatus: childAfter.coordStatus,
    coordSource: childAfter.coordSource,
    coordType: childAfter.coordType,
    coordNote: childAfter.coordNote,
  },
  identity: {
    currentName: childAfter.name,
    resolvedIdentity: 'Den nedre Ljanselva-korridoren mellom Liadalen og Fiskevollbukta, med dokumentert kulvertert nederste fysisk del',
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
      sourceName: 'OpenStreetMap – modellert nedre Ljanselva-korridor',
      sourceUrl: 'https://www.openstreetmap.org/way/156700580',
      sourceObjectId: 'osm-way:156700580',
      sourceQuality: 'exact_named_lower_waterway_route_with_upstream_and_coastline_topology',
      finding: `Way 156700580 er eksakt navngitt Ljanselva, ${anchor.totalLengthM} m lang, kobler eksakt til upstream way 98539575 og ender i shared node ${mouthNode.id} med coastline way ${coastlineWay.id}. Kystnoden ligger ${mouthReferenceDistanceM.toFixed(1)} m fra Fiskevollbukta-referansen.`,
      canVerifyCoordinate: true,
      reason: 'Eksakt navngitt vassdragsgeometri med eksplisitt topologisk plass mellom den separat verifiserte Liadalen-wayen og kysten i dokumentert Fiskevollbukta-scope. Brukes som semantic route geometry, ikke som bevis for synlig åpen elv.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Ljanselva',
      sourceUrl: 'https://oslobyleksikon.no/side/Ljanselva',
      sourceObjectId: 'oslobyleksikon:ljanselva',
      sourceQuality: 'documented_lower_culvert_and_mouth',
      finding: 'Kilden dokumenterer at nederste del av Ljanselva er lagt i kulvert og at elva munner i Fiskevollbukta.',
      canVerifyCoordinate: false,
      reason: 'Fastsetter fysisk tolkning og munning; OSM-wayen må ikke omtales som bevis for åpent overflatevann.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Ljan skole – Ljanselva i nærmiljøet',
      sourceUrl: 'https://ljan.osloskolen.no/om-skolen/om-oss/skolen-og-naromradet/',
      sourceObjectId: 'osloskolen:ljan-ljanselva-naermiljo',
      sourceQuality: 'official_local_route_context',
      finding: 'Kilden beskriver Ljanselva gjennom Liadalen og videre ned til tunnel som fører elva ut ved Fiskevollbukta.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker korridorsekvensen og kulvertforholdet.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Lokalhistoriewiki – Fiskevollbukta',
      sourceUrl: 'https://lokalhistoriewiki.no/wiki/Fiskevollbukta',
      sourceObjectId: 'lokalhistoriewiki:fiskevollbukta',
      sourceQuality: 'documented_destination_scope_and_reference_point',
      finding: `Kilden dokumenterer Fiskevollbukta som vik ved Bunnefjorden og oppgir referansepunkt ${FISKEVOLLBukta_REFERENCE.lat}, ${FISKEVOLLBukta_REFERENCE.lon}; OSM-kystnoden ligger ${mouthReferenceDistanceM.toFixed(1)} m unna.`,
      canVerifyCoordinate: false,
      reason: 'Brukes kun til å kontrollere at den delte kystnoden faktisk ligger innenfor riktig Fiskevollbukta-scope.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:156700580', canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: `osm-node:${mouthNode.id}`, canApplyToPlace: false },
    { sourceProvider: 'manual_research', sourceObjectId: 'oslobyleksikon:ljanselva', canApplyToPlace: false },
    { sourceProvider: 'manual_research', sourceObjectId: 'lokalhistoriewiki:fiskevollbukta', canApplyToPlace: false },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:156700580',
      lat: anchor.lat,
      lon: anchor.lon,
      coordRole: 'line_anchor',
      geometryType: 'LineString',
      lineLengthM: anchor.totalLengthM,
      canApplyToPlace: true,
    },
  ],
  coordinateCandidates: [
    { lat: anchor.lat, lon: anchor.lon, coordRole: 'line_anchor', canApplyToPlace: true },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Kildekontrakt og semantic line_anchor er anvendt på canonical place; synlighets-/kulvertforbehold er eksplisitt dokumentert.',
  },
  notes: [childAfter.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
const needsReviewPattern = /^\| `ljanselva_fiskevollen` – Ljanselva ved Fiskevollen \| needs_review \|.*\n/m;
if (!needsReviewPattern.test(protocol)) {
  throw new Error('Fant ikke needs_review-raden for ljanselva_fiskevollen');
}
protocol = protocol.replace(needsReviewPattern, '');
const batch145Pattern = /Batch 145 \(2026-07-22\) korrigerer den opprinnelige batch-112-scope-boksen[^\n]*/;
const batch145Match = protocol.match(batch145Pattern);
if (!batch145Match) throw new Error('Fant ikke batch 145-ankeret');
const batch146Block = `\n\n| 146 | \`${PLACE_ID}\` | Ljanselva ved Fiskevollen | verified_geometry | \`osm-way:${OSM_WAY_ID}\` |\n\nBatch 146 (${VERIFIED_AT}) avgrenser \`${PLACE_ID}\` som den nedre Ljanselva-korridoren mellom Liadalen og Fiskevollbukta. OSM way ${OSM_WAY_ID} er eksakt navngitt Ljanselva, kobler eksakt oppstrøms til Ljan/Liadalen-way ${UPSTREAM_WAY_ID} og ender i shared node ${mouthNode.id} med coastline way ${coastlineWay.id}; denne kystnoden ligger ${mouthReferenceDistanceM.toFixed(1)} meter fra den uavhengige Fiskevollbukta-referansen. Oslo byleksikon og Ljan skole dokumenterer samtidig at den nederste fysiske delen av elva er kulvertert. Wayen brukes derfor som \`semantic_anchor\` / \`line_anchor\` for vassdragskorridoren, ikke som påstand om at hele linjen er synlig åpen elv eller som dokumentasjon av eksakt tunnelløp. Legacy-punktet brukes ikke; ingen nearest/first-hit-logikk brukes.`;
protocol = protocol.replace(batch145Match[0], `${batch145Match[0]}${batch146Block}`);
protocol = protocol.replace(
  /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./,
  (_match, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`,
);
fs.writeFileSync(protocolPath, protocol);

writeJson(path.join(reportDir, 'downstream-coastline-topology.json'), {
  generatedAt: new Date().toISOString(),
  placeId: PLACE_ID,
  selectedSourceObjectId: `osm-way:${OSM_WAY_ID}`,
  upstreamSourceObjectId: `osm-way:${UPSTREAM_WAY_ID}`,
  upstreamNode,
  mouthNode,
  connectedWays,
  coastlineWays,
  selectedCoastlineWay: coastlineWay,
  fiskevollbuktaReference: FISKEVOLLBukta_REFERENCE,
  mouthReferenceDistanceM: Number(mouthReferenceDistanceM.toFixed(1)),
  interpretation: 'OSM modellerer den navngitte Ljanselva-wayen helt fram til kystlinjen. Uavhengige kilder dokumenterer at den nederste fysiske delen er kulvertert. Wayen brukes derfor som semantic river-corridor geometry, ikke som visible-open-water geometry.',
});

writeJson(path.join(reportDir, 'nearby-links-preservation.json'), {
  placeId: PLACE_ID,
  before: nearbyBefore,
  after: childAfter?.nature_profile?.nearby_place_ids || [],
  unchanged: JSON.stringify(nearbyBefore) === JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || []),
});

writeJson(path.join(reportDir, 'batch-146-result.json'), {
  generatedAt: new Date().toISOString(),
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'verified_geometry',
  sourceProvider: 'osm',
  sourceObjectId: `osm-way:${OSM_WAY_ID}`,
  geometry: {
    type: 'LineString',
    nodeCount: points.length,
    lengthM: anchor.totalLengthM,
    upstreamConnection: `osm-way:${UPSTREAM_WAY_ID}`,
    downstreamCoastlineNode: `osm-node:${mouthNode.id}`,
    coastlineWay: `osm-way:${coastlineWay.id}`,
    mouthReferenceDistanceM: Number(mouthReferenceDistanceM.toFixed(1)),
  },
  before: {
    lat: aggregateOld.lat,
    lon: aggregateOld.lon,
    r: aggregateOld.r,
    coordStatus: aggregateOld.coordStatus,
    coordSource: aggregateOld.coordSource,
    coordType: aggregateOld.coordType,
  },
  after: {
    lat: anchor.lat,
    lon: anchor.lon,
    r: childAfter.r,
    coordStatus: childAfter.coordStatus,
    coordSource: childAfter.coordSource,
    coordType: childAfter.coordType,
    sourceObjectId: childAfter.sourceObjectId,
    geocodeAccuracy: childAfter.geocodeAccuracy,
    coordRole: childAfter.coordRole,
  },
  method: 'exact named lower river corridor bracketed by exact upstream Ljanselva topology and shared coastline node inside independently documented Fiskevollbukta scope; explicit culvert caveat; deterministic line midpoint; no legacy point and no nearest/first-hit',
});

fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Oslo coordinate control batch 146 – Ljanselva ved Fiskevollen\n\n- Modellert nedre Ljanselva-korridor: https://www.openstreetmap.org/way/${OSM_WAY_ID}\n- Oppstrøms Ljan/Liadalen-geometri: https://www.openstreetmap.org/way/${UPSTREAM_WAY_ID}\n- Delt kystnode: https://www.openstreetmap.org/node/${mouthNode.id}\n- Kystlinje-way: https://www.openstreetmap.org/way/${coastlineWay.id}\n- Oslo byleksikon: https://oslobyleksikon.no/side/Ljanselva\n- Ljan skole: https://ljan.osloskolen.no/om-skolen/om-oss/skolen-og-naromradet/\n- Fiskevollbukta scope: https://lokalhistoriewiki.no/wiki/Fiskevollbukta\n\nOSM modellerer way ${OSM_WAY_ID} helt fram til kystlinjen, mens uavhengige kilder dokumenterer at den nederste fysiske delen av Ljanselva er kulvertert. Batchen bruker derfor wayen som semantic vassdragskorridor og påstår ikke at hele linjen er synlig åpen elv eller at OSM-wayen er en eksakt tunneltrasé.\n`);

console.log(JSON.stringify({
  batch: BATCH,
  placeId: PLACE_ID,
  sourceObjectId: `osm-way:${OSM_WAY_ID}`,
  anchor,
  upstreamNode,
  mouthNode,
  coastlineWay: { id: coastlineWay.id, tags: coastlineWay.tags },
  mouthReferenceDistanceM: Number(mouthReferenceDistanceM.toFixed(1)),
  nearbyLinksPreserved: JSON.stringify(nearbyBefore) === JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || []),
}, null, 2));
