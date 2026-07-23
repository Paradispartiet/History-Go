import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 159;
const PLACE_ID = 'alnaelvstien';
const VERIFIED_AT = '2026-07-23';
const ORDERED_WAY_IDS = [
  31989054,
  1527826111,
  1527826112,
  113281394,
  113281380,
  945870545,
  112543906,
  1085893555,
  385329987,
  385329986,
  674182052,
];
const EXPECTED_DISPLAY_WAY_ID = 113281394;

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_alna.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_alna/alnaelvstien.json');
const indexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_alna_index.json');
const manifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_alna_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/alnaelvstien.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-159-alnaelvstien-route-production');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const decodeXml = (value = '') => value.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([:\w-]+)="([^"]*)"/g)].map((match) => [match[1], decodeXml(match[2])]));

function haversineM(a, b) {
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function lineLengthM(points) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) total += haversineM(points[index - 1], points[index]);
  return total;
}
function routeMidpoint(points, pointSegments) {
  const total = lineLengthM(points);
  const target = total / 2;
  let walked = 0;
  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1];
    const b = points[index];
    const segmentLength = haversineM(a, b);
    if (walked + segmentLength >= target) {
      const fraction = segmentLength === 0 ? 0 : (target - walked) / segmentLength;
      return {
        lat: Number((a.lat + (b.lat - a.lat) * fraction).toFixed(7)),
        lon: Number((a.lon + (b.lon - a.lon) * fraction).toFixed(7)),
        totalLengthM: Number(total.toFixed(1)),
        displayWayId: pointSegments[index],
      };
    }
    walked += segmentLength;
  }
  const last = points.at(-1);
  return {
    lat: last.lat,
    lon: last.lon,
    totalLengthM: Number(total.toFixed(1)),
    displayWayId: pointSegments.at(-1),
  };
}
async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)',
      Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1',
    },
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`Kildeoppslag feilet ${response.status}: ${url}`);
  return response.text();
}
function parseWayFull(xml, wayId) {
  const nodeMap = new Map();
  for (const match of xml.matchAll(/<node\b[^>]*>/g)) {
    const a = attrs(match[0]);
    if (a.id && a.lat && a.lon) nodeMap.set(String(a.id), { id: String(a.id), lat: Number(a.lat), lon: Number(a.lon) });
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
  const points = nodeRefs.map((ref) => nodeMap.get(ref)).filter(Boolean);
  if (points.length !== nodeRefs.length || points.length < 2) throw new Error(`Kunne ikke rekonstruere way ${wayId}`);
  return { id: wayId, tags, nodeRefs, points };
}
function sharedEndpoint(a, b) {
  const aEndpoints = [a.nodeRefs[0], a.nodeRefs.at(-1)];
  const bEndpoints = new Set([b.nodeRefs[0], b.nodeRefs.at(-1)]);
  return aEndpoints.filter((nodeId) => bEndpoints.has(nodeId));
}

function buildRouteSegments(orientedWays) {
  return orientedWays.map((row, index) => ({
    id: `alnastien_segment_${String(index + 1).padStart(2, '0')}`,
    order: index + 1,
    osmWayId: row.way.id,
    sourceProvider: 'osm',
    sourceObjectId: `osm-way:${row.way.id}`,
    sourceUrl: `https://www.openstreetmap.org/way/${row.way.id}`,
    highway: row.way.tags.highway || null,
    bridge: row.way.tags.bridge || null,
    surface: row.way.tags.surface || null,
    lengthM: Number(lineLengthM(row.points).toFixed(1)),
    startNodeId: row.nodeRefs[0],
    endNodeId: row.nodeRefs.at(-1),
  }));
}

function updatePlace(place, midpoint, routeSegments, routeStart, routeEnd) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    name: 'Alnastien – Svartdalen og Bryn',
    lat: midpoint.lat,
    lon: midpoint.lon,
    r: 250,
    desc: 'Sammenhengende Alnastien-strekning gjennom Svartdalen og Bryn, eksplisitt modellert som elleve navngitte OSM-segmenter.',
    popupDesc: 'Denne konkrete delen av Alnastien følger Alna gjennom Svartdalen og videre mot Bryn. Traséen består av grus- og asfaltpartier, gang- og sykkelvei, bordgang og flere broer, blant annet hengebrua i Svartdalsparken. Strekningen viser hvordan turveien må tilpasse seg både ravinedal, elveløp, jernbane og tett bystruktur.\n\nHistory Go modellerer her den faktisk kartlagte, sammenhengende Alnastien-komponenten på rundt 1,64 kilometer. Posten skal ikke tolkes som en komplett geometrisk modell av alle turveier langs hele Alnaelva.',
    tags: ['turvei', 'rekreasjon', 'alnastien', 'svartdalen', 'bryn'],
    locatorType: 'route',
    sourceHint: 'Canonical route er bygget av elleve ferskt validerte OSM-ways med eksakt navn Alnastien. Segmentene danner én uforgrenet endepunktkoblet kjede fra Svartdalen/Kværner-siden til Bryn/Etterstad-siden.',
    coordType: 'multi_segment_route_display_anchor',
    coordStatus: 'verified_geometry',
    coordSource: `OpenStreetMap Alnastien routeSegments (${routeSegments.map((segment) => segment.osmWayId).join(', ')}); display midpoint on way ${midpoint.displayWayId}`,
    coordVerifiedAt: VERIFIED_AT,
    sourceProvider: 'osm',
    sourceObjectId: `osm-way:${midpoint.displayWayId}`,
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordSourceId: `osm-way:${midpoint.displayWayId}`,
    coordSourceUrl: `https://www.openstreetmap.org/way/${midpoint.displayWayId}`,
    coordNote: `Batch 159 retter den tidligere brede og uverifiserte «Alnaelvstien»-representasjonen til den konkrete kartlagte Alnastien-komponenten gjennom Svartdalen og Bryn. Fresh OSM validerer elleve ways med eksakt name=Alnastien. De danner én uforgrenet endepunktkoblet kjede uten isolerte segmenter eller forgreningsnoder. Samlet lengde er ${midpoint.totalLengthM} meter. Canonical lat/lon er deterministisk lengdemidtpunkt for den sammensatte kjeden og ligger på OSM way ${midpoint.displayWayId}; denne wayen brukes derfor som coordinate-source-contract displaykilde. Alle elleve ways lagres eksplisitt som routeSegments. Oslo kommune dokumenterer turveien langs Alnaelva gjennom Svartdalsparken og omtaler Alnastien i Etterstad/Bryn-kontekst. Modellen hevder ikke at disse 1,64 kilometerne er hele turveisystemet langs Alna. Legacy-punktet og nearest/first-hit brukes ikke.`,
    routeSegments,
    routeExtent: {
      totalLengthM: midpoint.totalLengthM,
      start: routeStart,
      end: routeEnd,
      segmentCount: routeSegments.length,
      modelScope: 'explicit_exact_named_alnastien_component_svartdalen_bryn',
    },
  };
}

fs.mkdirSync(reportDir, { recursive: true });
const ways = new Map();
for (const wayId of ORDERED_WAY_IDS) {
  const url = `https://api.openstreetmap.org/api/0.6/way/${wayId}/full`;
  const xml = await fetchText(url);
  fs.writeFileSync(path.join(reportDir, `osm-way-${wayId}-full.xml`), xml);
  const way = parseWayFull(xml, wayId);
  if (way.tags.name !== 'Alnastien') throw new Error(`Way ${wayId} har ikke lenger eksakt name=Alnastien: ${way.tags.name || '(mangler)'}`);
  ways.set(wayId, way);
}

for (let index = 0; index < ORDERED_WAY_IDS.length - 1; index += 1) {
  const current = ways.get(ORDERED_WAY_IDS[index]);
  const next = ways.get(ORDERED_WAY_IDS[index + 1]);
  const shared = sharedEndpoint(current, next);
  if (shared.length !== 1) throw new Error(`Forventet én delt endenode mellom way ${current.id} og ${next.id}, fant ${shared.length}`);
}

const orientedWays = [];
let previousSharedNode = null;
for (let index = 0; index < ORDERED_WAY_IDS.length; index += 1) {
  const way = ways.get(ORDERED_WAY_IDS[index]);
  let nodeRefs = [...way.nodeRefs];
  let points = [...way.points];
  if (index === 0) {
    const next = ways.get(ORDERED_WAY_IDS[index + 1]);
    const shared = sharedEndpoint(way, next)[0];
    if (nodeRefs[0] === shared) {
      nodeRefs.reverse();
      points.reverse();
    }
    previousSharedNode = shared;
  } else {
    if (nodeRefs[0] !== previousSharedNode && nodeRefs.at(-1) !== previousSharedNode) {
      throw new Error(`Way ${way.id} kobler ikke på forventet node ${previousSharedNode}`);
    }
    if (nodeRefs.at(-1) === previousSharedNode) {
      nodeRefs.reverse();
      points.reverse();
    }
    if (index < ORDERED_WAY_IDS.length - 1) {
      const next = ways.get(ORDERED_WAY_IDS[index + 1]);
      const nextEndpoints = new Set([next.nodeRefs[0], next.nodeRefs.at(-1)]);
      const nextShared = [nodeRefs[0], nodeRefs.at(-1)].find((nodeId) => nodeId !== previousSharedNode && nextEndpoints.has(nodeId));
      if (!nextShared) throw new Error(`Finner ikke neste delte node etter way ${way.id}`);
      previousSharedNode = nextShared;
    }
  }
  orientedWays.push({ way, nodeRefs, points });
}

const routePoints = [];
const pointSegments = [];
for (const row of orientedWays) {
  if (!routePoints.length) {
    routePoints.push(...row.points);
    pointSegments.push(...row.points.map(() => row.way.id));
  } else {
    const gap = haversineM(routePoints.at(-1), row.points[0]);
    if (gap > 0.5) throw new Error(`Geometrigap mellom routeSegments: ${gap.toFixed(2)} m før way ${row.way.id}`);
    routePoints.push(...row.points.slice(1));
    pointSegments.push(...row.points.slice(1).map(() => row.way.id));
  }
}
const midpoint = routeMidpoint(routePoints, pointSegments);
if (midpoint.displayWayId !== EXPECTED_DISPLAY_WAY_ID) {
  throw new Error(`Rutemidtpunktet flyttet til uventet way ${midpoint.displayWayId}; forventet ${EXPECTED_DISPLAY_WAY_ID}`);
}
if (Math.abs(midpoint.totalLengthM - 1642) > 10) throw new Error(`Alnastien-kjedens lengde endret uventet: ${midpoint.totalLengthM} m`);
const routeSegments = buildRouteSegments(orientedWays);
const routeStart = { lat: routePoints[0].lat, lon: routePoints[0].lon, nodeId: orientedWays[0].nodeRefs[0] };
const routeEnd = { lat: routePoints.at(-1).lat, lon: routePoints.at(-1).lon, nodeId: orientedWays.at(-1).nodeRefs.at(-1) };

const aggregate = readJson(aggregatePath);
const oldPlace = aggregate.find((place) => place?.id === PLACE_ID);
if (!oldPlace) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
const newPlace = updatePlace(oldPlace, midpoint, routeSegments, routeStart, routeEnd);
writeJson(aggregatePath, aggregate.map((place) => place?.id === PLACE_ID ? newPlace : place));
const child = updatePlace(readJson(childPath), midpoint, routeSegments, routeStart, routeEnd);
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
  placeFile: 'data/places/natur/oslo/places_oslo_alna.json',
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
    resolvedIdentity: 'Den konkrete sammenhengende Alnastien-komponenten gjennom Svartdalen og Bryn, modellert som elleve eksakt navngitte OSM-routeSegments',
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
      sourceName: 'OpenStreetMap – sammenhengende Alnastien routeSegments',
      sourceUrl: `https://www.openstreetmap.org/way/${midpoint.displayWayId}`,
      sourceObjectId: `osm-way:${midpoint.displayWayId}`,
      sourceQuality: 'exact_named_unbranched_multi_segment_route_chain',
      finding: `Elleve ferskt validerte ways med eksakt name=Alnastien danner én uforgrenet endepunktkoblet kjede på ${midpoint.totalLengthM} m. Deterministisk rutemidtpunkt er ${midpoint.lat}, ${midpoint.lon} og ligger på way ${midpoint.displayWayId}.`,
      canVerifyCoordinate: true,
      reason: 'Canonical displaykoordinat beregnes direkte fra den eksplisitte sammensatte rutekjeden, og alle delgeometrier lagres som routeSegments.',
    },
    {
      sourceProvider: 'municipality',
      sourceName: 'Oslo kommune – rehabilitering av hengebrua i Svartdalsparken',
      sourceUrl: 'https://aktuelt.oslo.kommune.no/rehabilitering-av-hengebrua-i-svartdalsparken',
      sourceObjectId: 'oslo-kommune:svartdalsparken:turvei-langs-alnaelva',
      sourceQuality: 'official_local_trail_context',
      finding: 'Oslo kommune dokumenterer hengebrua og bordgangen i Svartdalsparken som del av turveien langs Alnaelva.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker den lokale turvei-identiteten; eksakt rutekjede kommer fra OSM.',
    },
    {
      sourceProvider: 'municipality',
      sourceName: 'Oslo kommune – Etterstadsletta vest',
      sourceUrl: 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/etterstadsletta-vest-bedre-tilrettelegging-for-syklende-og-gaende',
      sourceObjectId: 'oslo-kommune:etterstadsletta-vest:alnastien',
      sourceQuality: 'official_named_alnastien_scope_context',
      finding: 'Oslo kommune omtaler en snarvei fra Alnastien til Etterstadkroken og kryssjekker Alnastien-navnet i Bryn/Etterstad-scope.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker geografisk scope og navn; canonical geometri kommer fra OSM-routeSegments.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: routeSegments.map((segment) => ({
    sourceProvider: 'osm',
    sourceObjectId: segment.sourceObjectId,
    canApplyToPlace: segment.osmWayId === midpoint.displayWayId,
  })),
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: `osm-way:${midpoint.displayWayId}`,
      lat: midpoint.lat,
      lon: midpoint.lon,
      coordRole: 'line_anchor',
      geometryType: 'MultiSegmentLineString',
      canApplyToPlace: true,
    },
  ],
  coordinateCandidates: [
    { lat: midpoint.lat, lon: midpoint.lon, coordRole: 'line_anchor', canApplyToPlace: true },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Den konkrete Alnastien-komponenten gjennom Svartdalen og Bryn er anvendt som verified multi-segment route med alle elleve ways lagret eksplisitt.',
  },
  notes: [child.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
if (!protocol.includes('| 159 | `alnaelvstien` |')) {
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./, (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
  const entry = `| 159 | \`alnaelvstien\` | Alnastien – Svartdalen og Bryn | verified_geometry | \`osm-way:${midpoint.displayWayId}\` |\n\nBatch 159 (2026-07-23) retter den brede legacy-identiteten «Alnaelvstien» til den konkrete kartlagte Alnastien-komponenten gjennom Svartdalen og Bryn. Elleve fresh OSM-ways med eksakt name=Alnastien danner én uforgrenet endepunktkoblet kjede på ${midpoint.totalLengthM} meter. Alle ways lagres eksplisitt som routeSegments. Canonical lat/lon beregnes deterministisk som lengdemidtpunkt for hele kjeden og ligger på way ${midpoint.displayWayId}, som brukes som displaykilde i coordinate-source-contract. Oslo kommune kryssjekker turveien gjennom Svartdalsparken og Alnastien-navnet i Bryn/Etterstad-scope. Modellen hevder ikke at denne komponenten er hele turveisystemet langs Alnaelva. Legacy-punktet og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex === -1) protocol = `${protocol.trimEnd()}\n\n${entry}`;
  else {
    const lineStart = protocol.lastIndexOf('\n', markerIndex) + 1;
    protocol = `${protocol.slice(0, lineStart)}${entry}${protocol.slice(lineStart)}`;
  }
  fs.writeFileSync(protocolPath, protocol);
}

writeJson(path.join(reportDir, 'batch-159-result.json'), {
  generatedAt: new Date().toISOString(),
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'verified_geometry',
  sourceProvider: 'osm',
  sourceObjectId: child.sourceObjectId,
  routeSegmentCount: routeSegments.length,
  routeSegments,
  routeExtent: child.routeExtent,
  displayAnchor: {
    lat: child.lat,
    lon: child.lon,
    sourceObjectId: child.sourceObjectId,
  },
  before: {
    name: oldPlace.name,
    lat: oldPlace.lat,
    lon: oldPlace.lon,
    coordStatus: oldPlace.coordStatus,
    coordSource: oldPlace.coordSource,
    coordType: oldPlace.coordType,
  },
  after: {
    name: child.name,
    lat: child.lat,
    lon: child.lon,
    coordStatus: child.coordStatus,
    coordSource: child.coordSource,
    coordType: child.coordType,
    sourceObjectId: child.sourceObjectId,
    geocodeAccuracy: child.geocodeAccuracy,
    coordRole: child.coordRole,
  },
  method: 'fresh exact-name OSM routeSegments + explicit endpoint topology + deterministic composite-route midpoint + official local scope crosschecks; no legacy point, nearest/first-hit or claim that the component covers the entire Alna trail system',
});
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 159 sources – Alnastien through Svartdalen and Bryn\n\n- OpenStreetMap ways: ${ORDERED_WAY_IDS.join(', ')} – eleven exact name=Alnastien routeSegments forming one unbranched chain.\n- Oslo kommune, Svartdalsparken hengebru: official context for the turvei along Alnaelva through Svartdalsparken.\n- Oslo kommune, Etterstadsletta vest: official named Alnastien context near Etterstad/Bryn.\n\nThe canonical record represents this concrete 1.64 km mapped component, not every possible trail section along the full Alna river. The legacy point and nearest/first-hit selection are not used.\n`);

console.log(JSON.stringify({
  status: 'applied',
  batch: BATCH,
  placeId: PLACE_ID,
  name: child.name,
  routeSegmentCount: routeSegments.length,
  midpoint,
  sourceObjectId: child.sourceObjectId,
}, null, 2));
