import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 153;
const PLACE_ID = 'ostensjovannet_sor';
const STREAM_WAY_ID = 1456532473;
const MOUTH_NODE_ID = 1110773258;
const LAKE_RELATION_ID = 33561;
const VERIFIED_AT = '2026-07-23';

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet/ostensjovannet_sor.json');
const indexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet_index.json');
const manifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/ostensjovannet_sor.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-153-bolerbekken-mouth');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const decodeXml = (v = '') => v.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([:\w-]+)="([^"]*)"/g)].map((m) => [m[1], decodeXml(m[2])]));

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1' },
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`Kildeoppslag feilet ${response.status}: ${url}`);
  return response.text();
}

function parseWays(xml) {
  const ways = [];
  for (const match of xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)) {
    const meta = attrs(`<way ${match[1]}>`);
    const tags = {};
    const nodeRefs = [];
    for (const tagMatch of match[2].matchAll(/<tag\b[^>]*\/>/g)) {
      const a = attrs(tagMatch[0]);
      if (a.k) tags[a.k] = a.v ?? '';
    }
    for (const ndMatch of match[2].matchAll(/<nd\b[^>]*\/>/g)) {
      const a = attrs(ndMatch[0]);
      if (a.ref) nodeRefs.push(Number(a.ref));
    }
    ways.push({ id: Number(meta.id), tags, nodeRefs });
  }
  return ways;
}
function parseNodes(xml) {
  const nodes = new Map();
  for (const match of xml.matchAll(/<node\b[^>]*>/g)) {
    const a = attrs(match[0]);
    if (a.id && a.lat && a.lon) nodes.set(Number(a.id), { id: Number(a.id), lat: Number(a.lat), lon: Number(a.lon) });
  }
  return nodes;
}
function parseRelation(xml, relationId) {
  const match = [...xml.matchAll(/<relation\b([^>]*)>([\s\S]*?)<\/relation>/g)]
    .find((item) => Number(attrs(`<relation ${item[1]}>`).id) === relationId);
  if (!match) throw new Error(`Fant ikke relation ${relationId}`);
  const tags = {};
  const members = [];
  for (const tagMatch of match[2].matchAll(/<tag\b[^>]*\/>/g)) {
    const a = attrs(tagMatch[0]);
    if (a.k) tags[a.k] = a.v ?? '';
  }
  for (const memberMatch of match[2].matchAll(/<member\b[^>]*\/>/g)) {
    const a = attrs(memberMatch[0]);
    members.push({ type: a.type, ref: Number(a.ref), role: a.role || '' });
  }
  return { tags, members };
}

function updatePlace(place, anchor, lakeBoundaryWayId) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    name: 'Bølerbekkens utløp i Østensjøvannet',
    lat: anchor.lat,
    lon: anchor.lon,
    desc: 'Hydrologisk munningspunkt der Bølerbekken møter Østensjøvannet i den sørlige delen av våtmarksområdet.',
    tags: ['bekk', 'utlop', 'vatmark', 'fugleliv'],
    locatorType: 'route',
    sourceHint: 'Canonical punkt er den eksakte delte noden mellom navngitt Bølerbekken-geometri og en outer-memberway i Østensjøvannet-relationen.',
    coordType: 'hydrological_mouth_topology_node',
    coordStatus: 'verified_geometry',
    coordSource: `OpenStreetMap way ${STREAM_WAY_ID} (Bølerbekken) + Østensjøvannet relation ${LAKE_RELATION_ID}, shared node ${MOUTH_NODE_ID}`,
    coordVerifiedAt: VERIFIED_AT,
    sourceProvider: 'osm',
    sourceObjectId: `osm-node:${MOUTH_NODE_ID}`,
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordSourceId: `osm-node:${MOUTH_NODE_ID}`,
    coordSourceUrl: `https://www.openstreetmap.org/node/${MOUTH_NODE_ID}`,
    coordNote: `Batch 153 erstatter den repo-syntetiske «Østensjøvannet sør»-identiteten med det konkrete hydrologiske munningspunktet der Bølerbekken møter innsjøen. Fresh OSM validerer way ${STREAM_WAY_ID} som name=Bølerbekken/waterway=stream og relation ${LAKE_RELATION_ID} som Østensjøvannet natural=water/water=lake. Bekkewayen ender i node ${MOUTH_NODE_ID}, som samtidig ligger på outer-memberway ${lakeBoundaryWayId} i innsjø-relationen. Østensjøvannets Venner dokumenterer Bølerbekken som en viktig tilløpsbekk som renner ut i vannet og fremhever sørenden/Bølerbekkens utløp som fuglerikt observasjonsområde. Legacy-punktet og nearest/first-hit brukes ikke.`,
    popupDesc: 'Her møter Bølerbekken Østensjøvannet etter å ha kommet ned fra Bøler-området. Munningspunktet knytter bekkens rennende vann direkte til innsjøens våtmarkssystem og er et naturlig sted å lese hvordan tilløpsbekker tilfører vann, materiale og leveområder til en næringsrik byinnsjø. Sørenden er samtidig et godt område for å observere fuglelivet rundt åpent vann og våtmark.',
    nature_profile: {
      ...(place.nature_profile || {}),
      type: 'bekkeutløp / våtmark / innsjøkant',
      title: 'Bølerbekken møter Østensjøvannet',
      summary: 'Bølerbekkens utløp markerer et konkret hydrologisk møtepunkt i sørenden av Østensjøvannet. Her går rennende bekk over i innsjøens større vannflate og våtmarkssystem. Natur-rundingen viser hvordan en tilløpsbekk binder nedbørsfeltet sammen med innsjøen og skaper et lokalt overgangsmiljø som også er viktig for fugleobservasjon.',
      themes: ['tilløpsbekk og innsjø', 'hydrologisk munningspunkt', 'vanntransport fra nedbørsfeltet', 'våtmark i sørenden', 'fugleliv ved bekkeutløpet', 'sammenheng i vassdraget'],
    },
  };
}

fs.mkdirSync(reportDir, { recursive: true });
const streamUrl = `https://api.openstreetmap.org/api/0.6/way/${STREAM_WAY_ID}/full`;
const lakeUrl = `https://api.openstreetmap.org/api/0.6/relation/${LAKE_RELATION_ID}/full`;
const [streamXml, lakeXml] = await Promise.all([fetchText(streamUrl), fetchText(lakeUrl)]);
fs.writeFileSync(path.join(reportDir, `osm-way-${STREAM_WAY_ID}-full.xml`), streamXml);
fs.writeFileSync(path.join(reportDir, `osm-relation-${LAKE_RELATION_ID}-full.xml`), lakeXml);

const streamWay = parseWays(streamXml).find((way) => way.id === STREAM_WAY_ID);
if (!streamWay || streamWay.tags.name !== 'Bølerbekken' || streamWay.tags.waterway !== 'stream') throw new Error(`Uventet stream-way: ${JSON.stringify(streamWay)}`);
if (streamWay.nodeRefs.at(-1) !== MOUTH_NODE_ID && streamWay.nodeRefs[0] !== MOUTH_NODE_ID) throw new Error('Fresh Bølerbekken-way ender ikke i forventet munningsnode');
const anchor = parseNodes(streamXml).get(MOUTH_NODE_ID);
if (!anchor) throw new Error('Fant ikke fresh munningsnode');

const lakeRelation = parseRelation(lakeXml, LAKE_RELATION_ID);
if (lakeRelation.tags.name !== 'Østensjøvannet' || lakeRelation.tags.natural !== 'water' || lakeRelation.tags.water !== 'lake') throw new Error(`Uventede lake-tags: ${JSON.stringify(lakeRelation.tags)}`);
const lakeMemberWayIds = new Set(lakeRelation.members.filter((member) => member.type === 'way' && member.role === 'outer').map((member) => member.ref));
const boundaryWays = parseWays(lakeXml).filter((way) => lakeMemberWayIds.has(way.id) && way.nodeRefs.includes(MOUTH_NODE_ID));
if (boundaryWays.length !== 1) throw new Error(`Munningsnode deles med ${boundaryWays.length} outer lake-memberways, forventet 1`);
const lakeBoundaryWayId = boundaryWays[0].id;

const aggregate = readJson(aggregatePath);
const oldPlace = aggregate.find((place) => place?.id === PLACE_ID);
if (!oldPlace) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
writeJson(aggregatePath, aggregate.map((place) => place?.id === PLACE_ID ? updatePlace(place, anchor, lakeBoundaryWayId) : place));
const childBefore = readJson(childPath);
const nearbyBefore = childBefore?.nature_profile?.nearby_place_ids || [];
const child = updatePlace(childBefore, anchor, lakeBoundaryWayId);
writeJson(childPath, child);
if (JSON.stringify(nearbyBefore) !== JSON.stringify(child?.nature_profile?.nearby_place_ids || [])) throw new Error('nearby_place_ids ble utilsiktet endret');

const index = readJson(indexPath);
const indexRow = index.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error(`Mangler ${PLACE_ID} i split-index`);
Object.assign(indexRow, {
  name: child.name, lat: child.lat, lon: child.lon, r: child.r,
  coordStatus: child.coordStatus, coordType: child.coordType, locatorType: child.locatorType,
  sourceProvider: child.sourceProvider, sourceObjectId: child.sourceObjectId,
  geocodeAccuracy: child.geocodeAccuracy, coordRole: child.coordRole, coordSource: child.coordSource,
  coordSourceId: child.coordSourceId, coordSourceUrl: child.coordSourceUrl,
  coordVerifiedAt: child.coordVerifiedAt, coordNote: child.coordNote,
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
  schemaVersion: '1.0', placeId: PLACE_ID,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_ostensjovannet.json',
  evidenceStatus: 'applied_to_place', coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: child.lat, lon: child.lon, r: child.r, coordStatus: child.coordStatus, coordSource: child.coordSource, coordType: child.coordType, coordNote: child.coordNote },
  identity: { currentName: child.name, resolvedIdentity: 'Det konkrete hydrologiske munningspunktet der Bølerbekken møter Østensjøvannet', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'route', requiresSplit: false, splitReason: '' },
  requiredEvidence: [],
  evidence: [
    { sourceProvider: 'osm', sourceName: 'OpenStreetMap – Bølerbekken og Østensjøvannet', sourceUrl: `https://www.openstreetmap.org/node/${MOUTH_NODE_ID}`, sourceObjectId: `osm-node:${MOUTH_NODE_ID}`, sourceQuality: 'explicit_shared_stream_lake_boundary_topology_node', finding: `Bølerbekken-way ${STREAM_WAY_ID} ender i node ${MOUTH_NODE_ID} på ${anchor.lat}, ${anchor.lon}; samme node ligger på outer-memberway ${lakeBoundaryWayId} i Østensjøvannet-relation ${LAKE_RELATION_ID}.`, canVerifyCoordinate: true, reason: 'Eksakt delt hydrologisk topologinode mellom navngitt tilløpsbekk og innsjøgrense.' },
    { sourceProvider: 'manual_research', sourceName: 'Østensjøvannets Venner – Vassdrag', sourceUrl: 'https://www.ostensjovannet.no/kopi-av-naturtyper', sourceObjectId: 'ostensjovannets-venner:vassdrag:bolerbekken', sourceQuality: 'documented_named_tributary_context', finding: 'Kilden dokumenterer Bølerbekken som en av Østensjøvannets viktigste tilløpsbekker og beskriver at den renner ut i vannet etter passering under broen i Valborgs vei.', canVerifyCoordinate: false, reason: 'Fastsetter hydrologisk identitet og sekvens; eksakt topologinode kommer fra OSM.' },
    { sourceProvider: 'manual_research', sourceName: 'Østensjøvannets Venner – Turforslag og adkomst', sourceUrl: 'https://www.ostensjovannet.no/turforslag', sourceObjectId: 'ostensjovannets-venner:bolerbekken-outlet-observation-context', sourceQuality: 'documented_local_south_end_context', finding: 'Kilden anbefaler sørenden og Bølerbekkens utløp som observasjonsområde med mye fugl og dokumenterer sørenden som et tydelig besøksområde.', canVerifyCoordinate: false, reason: 'Kryssjekker lokal funksjon og sørende-scope, men brukes ikke som koordinatbevis.' },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: `osm-node:${MOUTH_NODE_ID}`, canApplyToPlace: true },
    { sourceProvider: 'manual_research', sourceObjectId: 'ostensjovannets-venner:vassdrag:bolerbekken', canApplyToPlace: false },
  ],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: `osm-node:${MOUTH_NODE_ID}`, lat: anchor.lat, lon: anchor.lon, coordRole: 'line_anchor', geometryType: 'Point', canApplyToPlace: true }],
  coordinateCandidates: [{ lat: anchor.lat, lon: anchor.lon, coordRole: 'line_anchor', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Den eksplisitte delte munningsnoden er anvendt på canonical place; den syntetiske sørsonen er pensjonert som identitet.' },
  notes: [child.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
if (!protocol.includes('| 153 | `ostensjovannet_sor` |')) {
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./, (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
  const entry = `| 153 | \`ostensjovannet_sor\` | Bølerbekkens utløp i Østensjøvannet | verified_geometry | \`osm-node:${MOUTH_NODE_ID}\` |\n\nBatch 153 (2026-07-23) erstatter den repo-syntetiske «Østensjøvannet sør»-identiteten med det konkrete hydrologiske munningspunktet der Bølerbekken møter innsjøen. Fresh OSM validerer way ${STREAM_WAY_ID} som Bølerbekken/waterway=stream og relation ${LAKE_RELATION_ID} som Østensjøvannet/water=lake. Bekkewayen ender i node ${MOUTH_NODE_ID}, som samtidig ligger på outer-memberway ${lakeBoundaryWayId} i innsjø-relationen. Østensjøvannets Venner dokumenterer Bølerbekken som en viktig tilløpsbekk og fremhever sørenden/Bølerbekkens utløp som fuglerikt observasjonsområde. Canonical punkt er den eksakte delte topologinoden; legacy-punktet og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex === -1) protocol = `${protocol.trimEnd()}\n\n${entry}`;
  else {
    const lineStart = protocol.lastIndexOf('\n', markerIndex) + 1;
    protocol = `${protocol.slice(0, lineStart)}${entry}${protocol.slice(lineStart)}`;
  }
  fs.writeFileSync(protocolPath, protocol);
}

writeJson(path.join(reportDir, 'batch-153-result.json'), {
  generatedAt: new Date().toISOString(), batch: BATCH, placeId: PLACE_ID, status: 'verified_geometry',
  sourceProvider: 'osm', sourceObjectId: `osm-node:${MOUTH_NODE_ID}`, sourceUrl: `https://www.openstreetmap.org/node/${MOUTH_NODE_ID}`,
  topology: { streamWay: `osm-way:${STREAM_WAY_ID}`, lakeRelation: `osm-relation:${LAKE_RELATION_ID}`, lakeBoundaryWay: `osm-way:${lakeBoundaryWayId}`, sharedNode: `osm-node:${MOUTH_NODE_ID}` },
  before: { name: oldPlace.name, lat: oldPlace.lat, lon: oldPlace.lon, r: oldPlace.r, coordStatus: oldPlace.coordStatus, coordSource: oldPlace.coordSource, coordType: oldPlace.coordType },
  after: { name: child.name, lat: child.lat, lon: child.lon, r: child.r, coordStatus: child.coordStatus, coordSource: child.coordSource, coordType: child.coordType, locatorType: child.locatorType, sourceObjectId: child.sourceObjectId, geocodeAccuracy: child.geocodeAccuracy, coordRole: child.coordRole },
  method: 'explicit shared endpoint topology between exact named Bølerbekken stream way and an outer member way of the Østensjøvannet lake relation; independent local hydrological context; no legacy point, nearest or first-hit',
});
writeJson(path.join(reportDir, 'nearby-links-preservation.json'), { placeId: PLACE_ID, before: nearbyBefore, after: child?.nature_profile?.nearby_place_ids || [], preserved: JSON.stringify(nearbyBefore) === JSON.stringify(child?.nature_profile?.nearby_place_ids || []) });
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 153 sources – Bølerbekkens utløp i Østensjøvannet\n\n- OpenStreetMap way ${STREAM_WAY_ID}: exact named Bølerbekken stream geometry.\n- OpenStreetMap relation ${LAKE_RELATION_ID}: Østensjøvannet lake multipolygon.\n- Shared node ${MOUTH_NODE_ID}: exact stream/lake-boundary topology anchor.\n- Østensjøvannets Venner, Vassdrag: documents Bølerbekken as a major tributary flowing into Østensjøvannet.\n- Østensjøvannets Venner, Turforslag/Adkomst: documents the south end and Bølerbekken outlet as a bird-observation area.\n\nThe legacy south-zone coordinate and nearest/first-hit selection are not used.\n`);
console.log(JSON.stringify({ status: 'applied', batch: BATCH, placeId: PLACE_ID, name: child.name, sourceObjectId: child.sourceObjectId, anchor, lakeBoundaryWayId }, null, 2));
