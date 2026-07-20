import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const AGGREGATE = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json';
const CHILD = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening/korketrekkeren.json';
const SPLIT_INDEX = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening_index.json';
const SPLIT_MANIFEST = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening_manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-93';
const CONNECTIVITY = `${REPORT_DIR}/relation-connectivity-diagnostic.json`;
const MEMBERS = `${REPORT_DIR}/relation-member-diagnostic.json`;
const PLACE_ID = 'korketrekkeren';
const RELATION_ID = 1459739;
const OFFICIAL_URL = 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/korketrekkeren';
const RELATION_URL = `https://www.openstreetmap.org/relation/${RELATION_ID}`;
const DATE = '2026-07-21';
const FROG = { lat: 59.9791178, lon: 10.6766344 };
const MIDT = { lat: 59.9613099, lon: 10.6830798 };
const OFFICIAL_APPROX_LENGTH_METERS = 2700;

function full(file) { return path.join(ROOT, file); }
function readJson(file) { return JSON.parse(fs.readFileSync(full(file), 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
}
function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(full(file))).digest('hex');
}
function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const connectivity = readJson(CONNECTIVITY);
const memberAudit = readJson(MEMBERS);
if (connectivity.relationId !== RELATION_ID || memberAudit.relationId !== RELATION_ID) throw new Error('Batch 93 relation diagnostics do not match expected relation');
const tags = connectivity.tags || {};
if (tags.name !== 'Korketrekkeren' || tags.type !== 'route' || tags.route !== 'sled' || tags['piste:type'] !== 'sled') {
  throw new Error('Korketrekkeren relation identity tags no longer satisfy the route contract');
}
if (connectivity.componentCount !== 2 || connectivity.components?.length !== 2) {
  throw new Error(`Expected two ordered route components, found ${connectivity.componentCount}`);
}
if (memberAudit.members?.length !== 16 || connectivity.memberWayCount !== 16) throw new Error('Unexpected Korketrekkeren relation member count');

const component0 = connectivity.components.find((component) => component.index === 0);
const component1 = connectivity.components.find((component) => component.index === 1);
if (!component0 || !component1) throw new Error('Missing Korketrekkeren relation components');
if (component0.endpointIds?.length !== 2 || component1.endpointIds?.length !== 2) throw new Error('Each Korketrekkeren relation component must have exactly two endpoints');

const firstThree = memberAudit.members.slice(0, 3);
const remaining = memberAudit.members.slice(3);
if (firstThree.some((member) => member.component !== 0 || member.tags?.['piste:type'] !== 'sled')) {
  throw new Error('Upper Frognerseteren component is not the first ordered sled component in the relation');
}
if (remaining.some((member) => member.component !== 1)) throw new Error('Lower relation members are not contained in the second ordered component');
const namedSledMembers = remaining.filter((member) => member.tags?.name === 'Korketrekkeren' && member.tags?.['piste:type'] === 'sled');
if (namedSledMembers.length < 8) throw new Error(`Expected a substantial explicit Korketrekkeren sled geometry in component 1, found ${namedSledMembers.length} named ways`);

const gap = connectivity.nearestComponentGaps?.[0];
if (!gap || gap.a !== 0 || gap.b !== 1 || gap.meters > 50) throw new Error(`Relation component gap is not the documented <=50 m transition (${gap?.meters ?? 'missing'} m)`);
const totalMemberLength = connectivity.totalMemberGeometryLengthMeters;
const gapInclusiveLength = totalMemberLength + gap.meters;
const officialLengthDifferenceRatio = Math.abs(gapInclusiveLength - OFFICIAL_APPROX_LENGTH_METERS) / OFFICIAL_APPROX_LENGTH_METERS;
if (officialLengthDifferenceRatio > 0.15) {
  throw new Error(`Relation geometry plus documented gap differs too much from Oslo kommune's approximate 2700 m length (${gapInclusiveLength.toFixed(1)} m)`);
}

function nearestEndpoint(component, reference) {
  return component.endpoints
    .map((point) => ({ point, meters: haversineMeters(point, reference) }))
    .sort((a, b) => a.meters - b.meters)[0];
}
const start = nearestEndpoint(component0, FROG);
const upperGapSide = component0.endpoints.find((point) => point.id !== start.point.id);
const finish = nearestEndpoint(component1, MIDT);
const lowerGapSide = component1.endpoints.find((point) => point.id !== finish.point.id);
if (!upperGapSide || !lowerGapSide) throw new Error('Could not resolve gap-side route endpoints');
if (start.meters > 100) throw new Error(`Upper route endpoint is ${start.meters.toFixed(1)} m from Frognerseteren station`);
if (finish.meters > 100) throw new Error(`Lower route endpoint is ${finish.meters.toFixed(1)} m from Midtstuen station`);
const endpointGapMeters = haversineMeters(upperGapSide, lowerGapSide);
if (Math.abs(endpointGapMeters - gap.meters) > 1) throw new Error('Diagnostic gap does not match component endpoint gap');

const aggregate = readJson(AGGREGATE);
const aggregatePlace = aggregate.find((row) => row?.id === PLACE_ID);
const childPlace = readJson(CHILD);
if (!aggregatePlace || childPlace?.id !== PLACE_ID) throw new Error('Korketrekkeren aggregate/child missing');
if (aggregatePlace.lat !== childPlace.lat || aggregatePlace.lon !== childPlace.lon || aggregatePlace.coordStatus !== childPlace.coordStatus) {
  throw new Error('Korketrekkeren aggregate/child not synchronized before final batch 93 decision');
}
const previous = {
  lat: childPlace.lat,
  lon: childPlace.lon,
  coordStatus: childPlace.coordStatus || '',
  coordType: childPlace.coordType || '',
  coordSource: childPlace.coordSource || '',
  coordSourceId: childPlace.coordSourceId || '',
  sourceProvider: childPlace.sourceProvider || '',
  sourceObjectId: childPlace.sourceObjectId || ''
};
const legacyToVerifiedStartMeters = haversineMeters({ lat: childPlace.lat, lon: childPlace.lon }, start.point);

function applyVerified(target) {
  target.lat = start.point.lat;
  target.lon = start.point.lon;
  target.locatorType = 'route_start';
  target.sourceProvider = 'osm';
  target.sourceObjectId = `osm-relation:${RELATION_ID}`;
  target.geocodeAccuracy = 'exact_route_endpoint';
  target.coordRole = 'route_start';
  target.coordType = 'route_start';
  target.coordStatus = 'verified_geometry';
  target.coordSource = `OpenStreetMap route relation ${RELATION_ID} + Oslo kommune route identity`;
  target.coordSourceId = `osm-relation:${RELATION_ID}`;
  target.coordSourceUrl = RELATION_URL;
  target.coordVerifiedAt = DATE;
  target.coordNote = `Eksakt øvre endepunkt i OSM-ruterelasjon ${RELATION_ID}, eksplisitt navngitt Korketrekkeren og tagget type=route, route=sled og piste:type=sled. Relasjonen har 16 ordnede medlems-way-er fordelt på to internt sammenhengende komponenter: en 409 m øvre sled-del ved Frognerseteren og en 2027 m hoveddel mot Midtstuen. Mellom komponentene er et dokumentert kartgap på ${endpointGapMeters.toFixed(1)} m; derfor brukes relasjonen som semantisk ruteobjekt og det eksakte øvre relasjonsendepunktet som route_start, uten å hevde at hele traseen er én ubrutt polyline. Medlemgeometri pluss gap er ${gapInclusiveLength.toFixed(0)} m, innenfor ca.-angivelsen 2700 m fra Oslo kommune. Startankeret ligger ${start.meters.toFixed(0)} m fra Frognerseteren stasjon og nedre relasjonsende ${finish.meters.toFixed(0)} m fra Midtstuen stasjon. Trailforks er fjernet som primær koordinatkilde.`;
  target.routeAnchors = [
    { role: 'route_start', lat: start.point.lat, lon: start.point.lon, sourceObjectId: `osm-node:${start.point.id}` },
    { role: 'component_gap_upper', lat: upperGapSide.lat, lon: upperGapSide.lon, sourceObjectId: `osm-node:${upperGapSide.id}` },
    { role: 'component_gap_lower', lat: lowerGapSide.lat, lon: lowerGapSide.lon, sourceObjectId: `osm-node:${lowerGapSide.id}` },
    { role: 'route_end', lat: finish.point.lat, lon: finish.point.lon, sourceObjectId: `osm-node:${finish.point.id}` }
  ];
  delete target.coordPrecisionM;
}
applyVerified(aggregatePlace);
applyVerified(childPlace);
writeJson(AGGREGATE, aggregate);
writeJson(CHILD, childPlace);

const splitIndex = readJson(SPLIT_INDEX);
const indexRow = splitIndex.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error('Korketrekkeren missing from split index');
indexRow.lat = childPlace.lat;
indexRow.lon = childPlace.lon;
indexRow.r = childPlace.r;
indexRow.coordStatus = childPlace.coordStatus;
indexRow.coordType = childPlace.coordType;
writeJson(SPLIT_INDEX, splitIndex);

const manifest = readJson(SPLIT_MANIFEST);
const manifestRow = manifest.places?.find((row) => row?.id === PLACE_ID);
if (!manifestRow) throw new Error('Korketrekkeren missing from split manifest');
manifestRow.sha256 = sha256(CHILD);
manifest.source_sha256 = sha256(AGGREGATE);
manifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, manifest);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
let lines = protocol.split('\n');
const verifiedHeader = '| batch | placeId | navn | godkjent status | kildeobjekt |';
const verifiedHeaderIndex = lines.indexOf(verifiedHeader);
if (verifiedHeaderIndex < 0) throw new Error('Oslo verified protocol table missing');
let verifiedEnd = verifiedHeaderIndex + 2;
while (verifiedEnd < lines.length && lines[verifiedEnd].startsWith('| ')) verifiedEnd += 1;
if (!lines.slice(verifiedHeaderIndex + 2, verifiedEnd).some((line) => line.includes('`korketrekkeren`'))) {
  lines.splice(verifiedEnd, 0, `| 93 | \`korketrekkeren\` | Korketrekkeren | verified_geometry | \`osm-relation:${RELATION_ID}\` |`);
}
lines = lines.filter((line) => !(line.startsWith('| `korketrekkeren`') && line.includes('needs_source')));
lines = lines.filter((line) => !line.startsWith('Batch 93 (2026-07-21) reviderer `korketrekkeren`'));
protocol = lines.join('\n').replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${DATE}`);
const protocolLines = protocol.split('\n');
const h = protocolLines.indexOf(verifiedHeader);
let e = h + 2;
while (e < protocolLines.length && protocolLines[e].startsWith('| ')) e += 1;
const verifiedCount = e - (h + 2);
protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${verifiedCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 93 erstatter Trailforks som primær koordinatkilde for \`korketrekkeren\` med den eksplisitte OSM-ruterelasjonen \`osm-relation:${RELATION_ID}\` og et eksakt Frognerseteren-side endepunkt, kontrollert mot Oslo kommunes dokumentasjon av traseen Frognerseteren–Midtstuen. Relasjonens 31,8 m kartgap er eksplisitt dokumentert og skjules ikke som en falskt ubrutt polyline. Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`
);
const note = `Batch 93 (${DATE}) reviderer \`korketrekkeren\` som lineær akebakke/rute, ikke som adressepunkt. Oslo kommune dokumenterer Korketrekkeren fra Frognerseteren til Midtstuen og oppgir ca. 2700 meter. OSM-ruterelasjon ${RELATION_ID} er eksplisitt navngitt Korketrekkeren og tagget \`type=route\`, \`route=sled\` og \`piste:type=sled\`. De 16 ordnede medlems-way-ene danner to internt sammenhengende rutedeler med samlet geometri ${totalMemberLength.toFixed(0)} meter og et ${endpointGapMeters.toFixed(1)} meter kartgap mellom delene; gap inkludert blir den dokumenterte ruterekken ${gapInclusiveLength.toFixed(0)} meter. Startankeret er det eksakte øvre relasjonsendepunktet ${start.meters.toFixed(0)} meter fra Frognerseteren stasjon, mens nedre ende er ${finish.meters.toFixed(0)} meter fra Midtstuen stasjon. Relasjonen brukes som semantisk ruteobjekt og startpunktet som \`route_start\`; batchen påstår ikke at traseen er én topologisk ubrutt polyline. Trailforks er fjernet som primær koordinatkilde.`;
const anchor = '\nRelevante korrigerende merger';
const noteIndex = protocol.indexOf(anchor);
if (noteIndex < 0) throw new Error('Protocol notes anchor missing');
protocol = `${protocol.slice(0, noteIndex)}\n\n${note}${protocol.slice(noteIndex)}`;
fs.writeFileSync(full(PROTOCOL), protocol);

writeJson(`${REPORT_DIR}/summary.json`, {
  date: DATE,
  batch: 93,
  placeId: PLACE_ID,
  outcome: 'verified_geometry',
  method: 'object-type-first + exact OSM route relation endpoint + municipality route identity',
  officialIdentitySource: OFFICIAL_URL,
  primarySourceObjectId: `osm-relation:${RELATION_ID}`,
  relationAudit: {
    tags,
    memberWayCount: connectivity.memberWayCount,
    componentCount: connectivity.componentCount,
    totalMemberGeometryLengthMeters: totalMemberLength,
    componentGapMeters: Number(endpointGapMeters.toFixed(2)),
    gapInclusiveLengthMeters: Number(gapInclusiveLength.toFixed(1)),
    officialApproxLengthMeters: OFFICIAL_APPROX_LENGTH_METERS,
    officialLengthDifferenceRatio: Number(officialLengthDifferenceRatio.toFixed(4)),
    explicitNamedSledMemberCountInMainComponent: namedSledMembers.length
  },
  anchors: {
    routeStart: { ...start.point, sourceObjectId: `osm-node:${start.point.id}`, distanceToFrognerseterenMeters: Number(start.meters.toFixed(1)) },
    componentGapUpper: upperGapSide,
    componentGapLower: lowerGapSide,
    routeEnd: { ...finish.point, sourceObjectId: `osm-node:${finish.point.id}`, distanceToMidtstuenMeters: Number(finish.meters.toFixed(1)) }
  },
  previous,
  current: {
    lat: childPlace.lat,
    lon: childPlace.lon,
    coordStatus: childPlace.coordStatus,
    coordType: childPlace.coordType,
    coordSource: childPlace.coordSource,
    coordSourceId: childPlace.coordSourceId,
    sourceProvider: childPlace.sourceProvider,
    sourceObjectId: childPlace.sourceObjectId,
    geocodeAccuracy: childPlace.geocodeAccuracy,
    coordRole: childPlace.coordRole,
    routeAnchors: childPlace.routeAnchors
  },
  legacyPointToVerifiedStartMeters: Number(legacyToVerifiedStartMeters.toFixed(1)),
  protocolVerifiedCountAfterBatch: verifiedCount
});
fs.writeFileSync(
  full(`${REPORT_DIR}/README.md`),
  `# Oslo coordinate control batch 93\n\n` +
  `- Object type: linear sledding route; no address shortcut.\n` +
  `- Official identity: Oslo kommune, Korketrekkeren from Frognerseteren to Midtstuen, approximately 2700 m.\n` +
  `- Primary semantic geometry object: OSM route relation ${RELATION_ID}.\n` +
  `- Relation structure: ${connectivity.memberWayCount} ordered member ways, two internally connected components, ${totalMemberLength.toFixed(0)} m mapped member geometry and a documented ${endpointGapMeters.toFixed(1)} m gap.\n` +
  `- Verified point role: exact upper route endpoint, ${start.meters.toFixed(0)} m from Frognerseteren station.\n` +
  `- Lower relation endpoint: ${finish.meters.toFixed(0)} m from Midtstuen station.\n` +
  `- The relation is not misrepresented as one uninterrupted polyline; the component gap is retained in the evidence and route anchors.\n` +
  `- Trailforks removed as primary coordinate source.\n`
);

console.log(JSON.stringify({
  ok: true,
  batch: 93,
  outcome: 'verified_geometry',
  sourceObjectId: `osm-relation:${RELATION_ID}`,
  routeStart: start,
  routeEnd: finish,
  componentGapMeters: Number(endpointGapMeters.toFixed(2)),
  totalMemberGeometryLengthMeters: totalMemberLength,
  gapInclusiveLengthMeters: Number(gapInclusiveLength.toFixed(1)),
  verifiedCount
}, null, 2));
