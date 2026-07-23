import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 156;
const PLACE_ID = 'alna_utlop_bjorvika';
const VERIFIED_AT = '2026-07-23';
const HISTORICAL_MARKER_WAY_ID = 4258487;
const PARK_VIEWBOX = '10.748,59.910,10.775,59.899';
const TUNNEL_WAY_ID = 130106085;
const OPEN_OUTLET_WAY_ID = 131984275;
const CURRENT_MOUTH_NODE_ID = 8067892897;
const COASTLINE_WAY_ID = 865225826;

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_utlop_bjorvika.json');
const indexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_index.json');
const manifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/alna_utlop_bjorvika.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-156-alna-temporal-outlets');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const decodeXml = (v = '') => v.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([:\w-]+)="([^"]*)"/g)].map((m) => [m[1], decodeXml(m[2])]));
const normalize = (v = '') => String(v).trim().toLocaleLowerCase('nb-NO');

async function fetchText(url, accept = 'application/xml,text/xml;q=0.9,*/*;q=0.1') {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: accept },
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`Kildeoppslag feilet ${response.status}: ${url}`);
  return response.text();
}
const fetchJson = async (url) => JSON.parse(await fetchText(url, 'application/json'));

function parseWayFull(xml, wayId) {
  const nodes = new Map();
  for (const match of xml.matchAll(/<node\b[^>]*>/g)) {
    const a = attrs(match[0]);
    if (a.id && a.lat && a.lon) nodes.set(String(a.id), { id: String(a.id), lat: Number(a.lat), lon: Number(a.lon) });
  }
  const match = [...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)]
    .find((item) => Number(attrs(`<way ${item[1]}>`).id) === wayId);
  if (!match) throw new Error(`Fant ikke way ${wayId}`);
  const tags = {};
  const nodeRefs = [];
  for (const tagMatch of match[2].matchAll(/<tag\b[^>]*\/>/g)) {
    const a = attrs(tagMatch[0]);
    if (a.k) tags[a.k] = a.v ?? '';
  }
  for (const ndMatch of match[2].matchAll(/<nd\b[^>]*\/>/g)) {
    const a = attrs(ndMatch[0]);
    if (a.ref) nodeRefs.push(String(a.ref));
  }
  const points = nodeRefs.map((ref) => nodes.get(ref)).filter(Boolean);
  if (points.length !== nodeRefs.length || points.length < 2) throw new Error(`Kunne ikke rekonstruere way ${wayId}`);
  return { id: wayId, tags, nodeRefs, points };
}
function sharedRefs(a, b) {
  const bSet = new Set(b.nodeRefs);
  return a.nodeRefs.filter((ref) => bSet.has(ref));
}
function polygonCentroid(points) {
  const ring = points[0].id === points.at(-1).id ? points : [...points, points[0]];
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const a = ring[i];
    const b = ring[i + 1];
    const cross = a.lon * b.lat - b.lon * a.lat;
    twiceArea += cross;
    cx += (a.lon + b.lon) * cross;
    cy += (a.lat + b.lat) * cross;
  }
  if (Math.abs(twiceArea) < 1e-15) throw new Error('Degenerert historisk markørpolygon');
  return {
    lon: Number((cx / (3 * twiceArea)).toFixed(7)),
    lat: Number((cy / (3 * twiceArea)).toFixed(7)),
  };
}
function pointInRing(point, ring) {
  let inside = false;
  const x = point.lon;
  const y = point.lat;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
function pointInGeoJson(point, geojson) {
  const polygons = geojson?.type === 'Polygon' ? [geojson.coordinates] : geojson?.type === 'MultiPolygon' ? geojson.coordinates : [];
  return polygons.some((polygon) => polygon.length && pointInRing(point, polygon[0]) && !polygon.slice(1).some((hole) => pointInRing(point, hole)));
}

function updatedPopup(text) {
  return String(text || '').replace(
    'Koordinaten beholdes med status needs_detail_check fordi munningslandskapet dekker flere historiske og moderne vannpunkter.',
    'History Go bruker derfor Vannspeilet som verifisert historisk displayanker og et separat verifisert Kongshavn-anker for dagens faktiske utløp.'
  );
}
function updatedNatureProfile(profile = {}) {
  const summary = String(profile.summary || '').replace(
    'De tre eksisterende ankerpunktene i stedfila brukes som foreløpige rute- og observasjonspunkter, men koordinatstatusen needs_detail_check skal beholdes til en egen detaljrevisjon mot historiske strandlinjer, kulvertdata og dagens byrom er gjennomført.',
    'History Go skiller nå tidslagene eksplisitt: Vannspeilet brukes som fysisk markør for det historiske utløpet, mens et separat topologisk anker ved Kongshavn viser dagens faktiske vannføring. Det hevdes ikke et eget eksakt middelaldermunningspunkt.'
  );
  const themes = (profile.themes || []).map((theme) => theme === 'koordinatstatus needs_detail_check beholdes' ? 'historisk markør og dagens utløp holdes som separate verifiserte ankere' : theme);
  return { ...profile, summary, themes };
}
function updatePlace(place, historicalAnchor, currentAnchor, tunnelSharedNode) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    name: 'Alnas historiske utløp ved Vannspeilet',
    lat: historicalAnchor.lat,
    lon: historicalAnchor.lon,
    desc: 'Vannspeilet i Middelalderparken som fysisk markør for Alnas opprinnelige utløp, med separat anker for dagens tunnelutløp ved Kongshavn.',
    locatorType: 'natural_area',
    sourceHint: 'Canonical displayanker er arealsenteret for Vannspeilet/Tenerife i Middelalderparken. Et separat topologisk anker viser dagens faktiske Alna-utløp ved Kongshavn. Det historiske displayankeret er en markør for det opprinnelige utløpet, ikke et påstått eksakt middelaldermunningspunkt.',
    coordType: 'multi_anchor_temporal_outlet_display_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 4258487 – Tenerife/Vannspeilet, historisk utløpsmarkør for Alna',
    coordVerifiedAt: VERIFIED_AT,
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:4258487',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordSourceId: 'osm-way:4258487',
    coordSourceUrl: 'https://www.openstreetmap.org/way/4258487',
    coordNote: `Batch 156 løser den flerlagede utløpsrecorden med to separate, kildebelagte ankere. Canonical displayanker er OSM way 4258487, det eneste substansielle vannpolygonet innenfor den eksakte Middelalderparken-geometrien; OSM-navnet er Tenerife, og uavhengig offentlig kildebruk dokumenterer Tenerife som tilnavnet til Vannspeilet. Oslo kommune dokumenterer at Vannspeilet markerer Alnaelvas opprinnelige utløp, men dette brukes ikke som bevis for ett separat eksakt middelaldermunningspunkt. Dagens faktiske vannføring valideres separat: Alna-tunnelway 130106085 kobler via delt node ${tunnelSharedNode} til åpen way 131984275, som ender i node 8067892897; samme node ligger på coastline way 865225826 ved Kongshavn. Legacy-punktet og nearest/first-hit brukes ikke.`,
    anchors: [
      {
        id: 'alna_historisk_utlop_vannspeilet',
        name: 'Vannspeilet – markør for Alnas opprinnelige utløp',
        lat: historicalAnchor.lat,
        lon: historicalAnchor.lon,
        r: 120,
        type: 'area_anchor',
        role: 'historical_outlet_marker',
        coordStatus: 'verified_geometry',
        sourceProvider: 'osm',
        sourceObjectId: 'osm-way:4258487',
        sourceUrl: 'https://www.openstreetmap.org/way/4258487',
        note: 'Vannspeilet, med OSM-navnet Tenerife, er en fysisk markør for Alnaelvas opprinnelige utløp. Ankeret representerer ikke et påstått eksakt middelaldermunningspunkt.',
      },
      {
        id: 'alna_dagens_utlop_kongshavn',
        name: 'Alna – dagens utløp ved Kongshavn',
        lat: currentAnchor.lat,
        lon: currentAnchor.lon,
        r: 100,
        type: 'mouth_anchor',
        role: 'current_hydrological_outlet',
        coordStatus: 'verified_geometry',
        sourceProvider: 'osm',
        sourceObjectId: 'osm-node:8067892897',
        sourceUrl: 'https://www.openstreetmap.org/node/8067892897',
        note: 'Eksakt delt endenode mellom den åpne Alna-utløpswayen 131984275 og kystlinje-way 865225826 etter tunnelstrekningen fra Kværner.',
      },
    ],
    popupDesc: updatedPopup(place.popupDesc),
    nature_profile: updatedNatureProfile(place.nature_profile),
  };
}

fs.mkdirSync(reportDir, { recursive: true });

const parkUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent('Middelalderparken, Oslo, Norway')}&limit=20&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=${PARK_VIEWBOX}&bounded=1`;
const parkResults = await fetchJson(parkUrl);
writeJson(path.join(reportDir, 'nominatim-middelalderparken-fresh.json'), { parkUrl, results: parkResults });
const exactParks = parkResults.filter((result) => normalize(result.name || result.namedetails?.name) === 'middelalderparken' && ['Polygon', 'MultiPolygon'].includes(result.geojson?.type));
if (exactParks.length !== 1) throw new Error(`Forventet én eksakt Middelalderparken-geometri, fant ${exactParks.length}`);
const park = exactParks[0];

const historicalXml = await fetchText(`https://api.openstreetmap.org/api/0.6/way/${HISTORICAL_MARKER_WAY_ID}/full`);
const tunnelXml = await fetchText(`https://api.openstreetmap.org/api/0.6/way/${TUNNEL_WAY_ID}/full`);
const openXml = await fetchText(`https://api.openstreetmap.org/api/0.6/way/${OPEN_OUTLET_WAY_ID}/full`);
const coastlineXml = await fetchText(`https://api.openstreetmap.org/api/0.6/way/${COASTLINE_WAY_ID}/full`);
fs.writeFileSync(path.join(reportDir, `osm-way-${HISTORICAL_MARKER_WAY_ID}-full.xml`), historicalXml);
fs.writeFileSync(path.join(reportDir, `osm-way-${TUNNEL_WAY_ID}-full.xml`), tunnelXml);
fs.writeFileSync(path.join(reportDir, `osm-way-${OPEN_OUTLET_WAY_ID}-full.xml`), openXml);
fs.writeFileSync(path.join(reportDir, `osm-way-${COASTLINE_WAY_ID}-full.xml`), coastlineXml);

const historical = parseWayFull(historicalXml, HISTORICAL_MARKER_WAY_ID);
const tunnel = parseWayFull(tunnelXml, TUNNEL_WAY_ID);
const openWay = parseWayFull(openXml, OPEN_OUTLET_WAY_ID);
const coastline = parseWayFull(coastlineXml, COASTLINE_WAY_ID);
if (historical.tags.name !== 'Tenerife' || historical.tags.natural !== 'water' || historical.tags.water !== 'lake') throw new Error(`Uventede Tenerife/Vannspeilet-tags: ${JSON.stringify(historical.tags)}`);
if (tunnel.tags.name !== 'Alna' || tunnel.tags.waterway !== 'river' || tunnel.tags.tunnel !== 'yes') throw new Error(`Uventede tunnel-tags: ${JSON.stringify(tunnel.tags)}`);
if (openWay.tags.name !== 'Alna' || openWay.tags.waterway !== 'river' || openWay.tags.tunnel) throw new Error(`Uventede åpne utløpstags: ${JSON.stringify(openWay.tags)}`);
if (coastline.tags.natural !== 'coastline') throw new Error(`Uventede coastline-tags: ${JSON.stringify(coastline.tags)}`);

const historicalAnchor = polygonCentroid(historical.points);
if (!pointInGeoJson(historicalAnchor, park.geojson)) throw new Error('Historisk markørpolygon ligger ikke lenger innenfor fresh Middelalderparken-geometri');
const tunnelOpenShared = sharedRefs(tunnel, openWay);
if (tunnelOpenShared.length !== 1) throw new Error(`Forventet én delt node mellom tunnel og åpen utløpsway, fant ${tunnelOpenShared.length}`);
const tunnelSharedNode = tunnelOpenShared[0];
const openEndpoints = [openWay.nodeRefs[0], openWay.nodeRefs.at(-1)];
const currentMouthNodeId = openEndpoints.find((nodeId) => nodeId !== tunnelSharedNode);
if (currentMouthNodeId !== String(CURRENT_MOUTH_NODE_ID)) throw new Error(`Uventet faktisk utløpsnode: ${currentMouthNodeId}`);
if (!coastline.nodeRefs.includes(String(CURRENT_MOUTH_NODE_ID))) throw new Error(`Kystlinje-way ${COASTLINE_WAY_ID} inneholder ikke dagens utløpsnode`);
const currentAnchor = openWay.points.find((point) => point.id === String(CURRENT_MOUTH_NODE_ID));
if (!currentAnchor) throw new Error('Fant ikke dagens utløpspunkt i fresh åpen Alna-geometri');

const aggregate = readJson(aggregatePath);
const oldPlace = aggregate.find((place) => place?.id === PLACE_ID);
if (!oldPlace) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
const updatedAggregate = aggregate.map((place) => place?.id === PLACE_ID ? updatePlace(place, historicalAnchor, currentAnchor, tunnelSharedNode) : place);
writeJson(aggregatePath, updatedAggregate);
const child = updatePlace(readJson(childPath), historicalAnchor, currentAnchor, tunnelSharedNode);
writeJson(childPath, child);

const index = readJson(indexPath);
const indexRow = index.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error(`Mangler ${PLACE_ID} i split-index`);
Object.assign(indexRow, {
  name: child.name,
  lat: child.lat,
  lon: child.lon,
  r: child.r,
  coordStatus: child.coordStatus,
  coordType: child.coordType,
  locatorType: child.locatorType,
  sourceProvider: child.sourceProvider,
  sourceObjectId: child.sourceObjectId,
  geocodeAccuracy: child.geocodeAccuracy,
  coordRole: child.coordRole,
  coordSource: child.coordSource,
  coordSourceId: child.coordSourceId,
  coordSourceUrl: child.coordSourceUrl,
  coordVerifiedAt: child.coordVerifiedAt,
  coordNote: child.coordNote,
});
writeJson(indexPath, index);

const manifest = readJson(manifestPath);
manifest.source_sha256 = sha256(aggregatePath);
manifest.generated_at = new Date().toISOString();
const manifestRow = manifest.places?.find((row) => row?.id === PLACE_ID);
if (!manifestRow) throw new Error(`Mangler ${PLACE_ID} i split-manifest`);
manifestRow.name = child.name;
manifestRow.sha256 = sha256(childPath);
writeJson(manifestPath, manifest);

writeJson(evidencePath, {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: child.lat,
    lon: child.lon,
    r: child.r,
    coordStatus: child.coordStatus,
    coordSource: child.coordSource,
    coordType: child.coordType,
    coordNote: child.coordNote,
  },
  identity: {
    currentName: child.name,
    resolvedIdentity: 'Vannspeilet som fysisk markør for Alnas historiske utløp, eksplisitt adskilt fra dagens faktiske utløp ved Kongshavn',
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
      sourceName: 'OpenStreetMap – Tenerife/Vannspeilet',
      sourceUrl: 'https://www.openstreetmap.org/way/4258487',
      sourceObjectId: 'osm-way:4258487',
      sourceQuality: 'unique_physical_water_marker_inside_exact_middelalderparken_scope',
      finding: `Way 4258487 er water=lake/natural=water med OSM-navnet Tenerife og ligger som fysisk vannpolygon innenfor den eksakte Middelalderparken-geometrien. Area-anchor er ${historicalAnchor.lat}, ${historicalAnchor.lon}.`,
      canVerifyCoordinate: true,
      reason: 'Eksakt fysisk geometri for den historiske utløpsmarkøren; ingen påstand om et separat eksakt middelaldermunningspunkt.',
    },
    {
      sourceProvider: 'municipality',
      sourceName: 'Oslo kommune – Middelalderparken',
      sourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/middelalderparken/',
      sourceObjectId: 'oslo-kommune:kultureiendom:middelalderparken',
      sourceQuality: 'official_historical_outlet_marker_definition',
      finding: 'Oslo kommune dokumenterer at vannspeilet i vest markerer Alnaelvas opprinnelige utløp.',
      canVerifyCoordinate: false,
      reason: 'Fastsetter den historiske funksjonen til vannspeilet; eksakt fysisk markørgeometri kommer fra OSM.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Ruter – Middelalderparken',
      sourceUrl: 'https://ruter.no/om-oss/kollektivhistorien/i-ord-og-bilder-middelalderparken',
      sourceObjectId: 'ruter:middelalderparken:vannspeilet-tenerife',
      sourceQuality: 'independent_name_crosscheck',
      finding: 'Ruter dokumenterer at vannspeilet på vestsiden av Middelalderparken har tilnavnet Tenerife, som kryssjekker OSM-navnet på way 4258487.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker identiteten mellom OSM-navnet Tenerife og Vannspeilet.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – dagens Alna-utløp ved Kongshavn',
      sourceUrl: 'https://www.openstreetmap.org/node/8067892897',
      sourceObjectId: 'osm-node:8067892897',
      sourceQuality: 'explicit_shared_open_river_coastline_topology_node',
      finding: `Alna-tunnelway 130106085 deler node ${tunnelSharedNode} med åpen Alna-way 131984275. Den åpne wayen ender i node 8067892897 på ${currentAnchor.lat}, ${currentAnchor.lon}, og samme node ligger på coastline way 865225826.`,
      canVerifyCoordinate: true,
      reason: 'Eksakt delt endenode mellom dagens åpne Alna-utløpsgeometri og kystlinjen.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Alnaelva',
      sourceUrl: 'https://oslobyleksikon.no/side/Alnaelva',
      sourceObjectId: 'oslobyleksikon:alnaelva',
      sourceQuality: 'documented_historical_and_current_outlet_layers',
      finding: 'Kilden dokumenterer opprinnelig utløp ved Sørenga og tunnelutløp ved Kongshavn siden 1922.',
      canVerifyCoordinate: false,
      reason: 'Fastsetter tidslagene; de eksakte fysiske ankrene kommer fra OSM.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:4258487', canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: 'osm-node:8067892897', canApplyToPlace: false },
    { sourceProvider: 'municipality', sourceObjectId: 'oslo-kommune:kultureiendom:middelalderparken', canApplyToPlace: false },
  ],
  geometryCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:4258487', lat: historicalAnchor.lat, lon: historicalAnchor.lon, coordRole: 'area_anchor', geometryType: 'Polygon', canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: 'osm-node:8067892897', lat: currentAnchor.lat, lon: currentAnchor.lon, coordRole: 'line_anchor', geometryType: 'Point', canApplyToPlace: false },
  ],
  coordinateCandidates: [
    { lat: historicalAnchor.lat, lon: historicalAnchor.lon, coordRole: 'area_anchor', canApplyToPlace: true },
    { lat: currentAnchor.lat, lon: currentAnchor.lon, coordRole: 'line_anchor', canApplyToPlace: false },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Den tidsdelte to-ankersmodellen er anvendt: Vannspeilet som historisk displayanker og Kongshavn-noden som separat dagens utløp.',
  },
  notes: [child.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
if (!protocol.includes('| 156 | `alna_utlop_bjorvika` |')) {
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./, (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
  const entry = `| 156 | \`alna_utlop_bjorvika\` | Alnas historiske utløp ved Vannspeilet | verified_geometry | \`osm-way:4258487\` |\n\nBatch 156 (2026-07-23) løser utløpsrecordens tidslag med to separate ankere. Canonical displayanker er Vannspeilet i Middelalderparken, fysisk kartlagt som OSM way 4258487 med navnet Tenerife; Oslo kommune dokumenterer at vannspeilet markerer Alnaelvas opprinnelige utløp, og uavhengig kildebruk kryssjekker Tenerife som tilnavn på vannspeilet. Modellen hevder ikke et eget eksakt middelaldermunningspunkt. Dagens faktiske utløp lagres separat på node 8067892897, som er endepunkt på den åpne Alna-wayen 131984275 og samtidig node på coastline way 865225826 etter tunnelstrekningen fra Kværner. Legacy-punktet og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex === -1) protocol = `${protocol.trimEnd()}\n\n${entry}`;
  else {
    const lineStart = protocol.lastIndexOf('\n', markerIndex) + 1;
    protocol = `${protocol.slice(0, lineStart)}${entry}${protocol.slice(lineStart)}`;
  }
  fs.writeFileSync(protocolPath, protocol);
}

writeJson(path.join(reportDir, 'batch-156-result.json'), {
  generatedAt: new Date().toISOString(),
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'verified_geometry',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-way:4258487',
  historicalMarker: {
    sourceObjectId: 'osm-way:4258487',
    osmName: historical.tags.name,
    tags: historical.tags,
    anchor: historicalAnchor,
    interpretation: 'Physical Vannspeilet/Tenerife marker for Alnaelvas original outlet; not asserted as an exact separate medieval mouth point.',
  },
  currentOutlet: {
    sourceObjectId: 'osm-node:8067892897',
    anchor: { lat: currentAnchor.lat, lon: currentAnchor.lon },
    tunnelWay: `osm-way:${TUNNEL_WAY_ID}`,
    tunnelOpenSharedNode: `osm-node:${tunnelSharedNode}`,
    openOutletWay: `osm-way:${OPEN_OUTLET_WAY_ID}`,
    coastlineWay: `osm-way:${COASTLINE_WAY_ID}`,
  },
  before: {
    name: oldPlace.name,
    lat: oldPlace.lat,
    lon: oldPlace.lon,
    r: oldPlace.r,
    coordStatus: oldPlace.coordStatus,
    coordSource: oldPlace.coordSource,
    coordType: oldPlace.coordType,
  },
  after: {
    name: child.name,
    lat: child.lat,
    lon: child.lon,
    r: child.r,
    coordStatus: child.coordStatus,
    coordSource: child.coordSource,
    coordType: child.coordType,
    locatorType: child.locatorType,
    sourceObjectId: child.sourceObjectId,
    geocodeAccuracy: child.geocodeAccuracy,
    coordRole: child.coordRole,
    anchorCount: child.anchors.length,
  },
  method: 'two-anchor temporal outlet model: exact physical historical marker polygon inside Middelalderparken + explicit current open-river/coastline topology node; no invented exact medieval mouth point, legacy point, nearest or first-hit',
});
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 156 sources – Alnas historiske og nåværende utløp\n\n- OpenStreetMap way 4258487: Tenerife/Vannspeilet physical water polygon used as historical display marker.\n- Oslo kommune, Middelalderparken: Vannspeilet marks Alnaelvas original outlet.\n- Ruter, Middelalderparken: identifies Tenerife as the nickname of the water mirror.\n- OpenStreetMap way 130106085: tunneled Alna.\n- OpenStreetMap way 131984275: final open Alna outlet segment.\n- OpenStreetMap node 8067892897 + coastline way 865225826: explicit current river/coastline mouth topology at Kongshavn.\n- Oslo byleksikon, Alnaelva: historical Sørenga outlet and current Kongshavn tunnel outlet since 1922.\n\nThe historical water mirror is a documented marker, not an invented exact medieval mouth coordinate. The legacy History Go point and nearest/first-hit selection are not used.\n`);

console.log(JSON.stringify({
  status: 'applied',
  batch: BATCH,
  placeId: PLACE_ID,
  name: child.name,
  historicalAnchor,
  currentOutletAnchor: { lat: currentAnchor.lat, lon: currentAnchor.lon },
  anchorCount: child.anchors.length,
  sourceObjectId: child.sourceObjectId,
}, null, 2));
