import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 150;
const PLACE_ID = 'ostensjovannet_fugletarn';
const OSM_WAY_ID = 533351097;
const VERIFIED_AT = '2026-07-23';
const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet/ostensjovannet_fugletarn.json');
const indexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet_index.json');
const manifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/ostensjovannet_fugletarn.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const researchPath = path.join(ROOT, 'reports/oslo-coordinate-control-batch-150-ostensjovannet-bird-hide-research/candidate-summary.json');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-150-ostensjovannet-bird-hide');

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
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Kildeoppslag feilet ${response.status}: ${url}`);
  return response.text();
}

function parseWay(xml) {
  const nodes = new Map();
  for (const match of xml.matchAll(/<node\b[^>]*>/g)) {
    const a = attrs(match[0]);
    if (a.id && a.lat && a.lon) nodes.set(String(a.id), { id: String(a.id), lat: Number(a.lat), lon: Number(a.lon) });
  }
  const match = [...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)]
    .find((m) => Number(attrs(`<way ${m[1]}>`).id) === OSM_WAY_ID);
  if (!match) throw new Error(`Fant ikke way ${OSM_WAY_ID}`);
  const tags = {};
  const refs = [];
  for (const tag of match[2].matchAll(/<tag\b[^>]*\/>/g)) {
    const a = attrs(tag[0]);
    if (a.k) tags[a.k] = a.v ?? '';
  }
  for (const nd of match[2].matchAll(/<nd\b[^>]*\/>/g)) {
    const a = attrs(nd[0]);
    if (a.ref) refs.push(String(a.ref));
  }
  const points = refs.map((ref) => nodes.get(ref)).filter(Boolean);
  if (points.length !== refs.length || points.length < 3) throw new Error('Kunne ikke rekonstruere fugleskjul-polygonet');
  return { tags, points };
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
  if (Math.abs(twiceArea) < 1e-15) throw new Error('Degenerert fugleskjul-polygon');
  return { lon: Number((cx / (3 * twiceArea)).toFixed(7)), lat: Number((cy / (3 * twiceArea)).toFixed(7)) };
}

function updatePlace(place, anchor) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    name: 'Fugleskjulet ved Østensjøvannet',
    lat: anchor.lat,
    lon: anchor.lon,
    desc: 'Fugleskjul på vestsiden av Østensjøvannet med utsyn over sentrale deler av vannet og våtmarken.',
    tags: ['fugleskjul', 'fugleliv', 'vatmark', 'naturreservat'],
    locatorType: 'building',
    sourceHint: 'Koordinaten er bygningssenteret for den eneste fysiske OSM-geometrien med leisure=bird_hide rundt Østensjøvannet; objektet ligger på vestsiden slik en uavhengig oppdatert fugleguide beskriver.',
    coordType: 'bird_hide_building_center',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 533351097 – fugleskjul ved Østensjøvannet',
    coordVerifiedAt: VERIFIED_AT,
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:533351097',
    geocodeAccuracy: 'building',
    coordRole: 'building_center',
    coordSourceId: 'osm-way:533351097',
    coordSourceUrl: 'https://www.openstreetmap.org/way/533351097',
    coordNote: 'Batch 150 retter den tidligere «Østensjøvannet fugletårn»-identiteten til det faktiske fugleskjulet på vestsiden av vannet, mens placeId beholdes for kompatibilitet. En objekt-type-first Overpass-audit fant nøyaktig ett leisure=bird_hide rundt Østensjøvannet: OSM way 533351097, tagget building=hut og leisure=bird_hide. En uavhengig oppdatert fugleguide beskriver tilsvarende ett bird hide på vestsiden med utsyn over de sentrale delene av vannet. Canonical lat/lon er deterministisk polygoncentroid for selve bygningsgeometrien og klassifiseres som building/building_center i coordinate-source-contract v1. Legacy-punktet på østsiden og nearest/first-hit brukes ikke.',
    popupDesc: 'På vestsiden av Østensjøvannet står et lite fugleskjul som gir utsyn mot de sentrale vannflatene og våtmarkssonene. Skjulet gjør det mulig å observere fuglelivet mer avskjermet enn fra den åpne turveien rundt vannet. Stedet viser hvordan enkel tilrettelegging kan gjøre artsobservasjon tilgjengelig samtidig som ferdselen konsentreres til et fast punkt.',
    underbadge_ids: ['fugler', 'vannfugl', 'fugletitting', 'vatmark'],
    nature_profile: {
      ...(place.nature_profile || {}),
      type: 'fugleskjul / observasjonspunkt / våtmark',
      title: 'Fugleskjul med utsyn over Østensjøvannet',
      summary: 'Fugleskjulet på vestsiden av Østensjøvannet gir et avskjermet observasjonspunkt mot sentrale deler av vannet og våtmarken. Her kan fuglelivet følges uten at besøkende trenger å gå ut i sårbare kantsoner.',
      themes: ['observasjon av vannfugl', 'avskjermet fugleskjul', 'utsyn over sentrale vannflater', 'våtmark og naturreservat', 'tilrettelegging for naturstudier', 'ferdsel med mindre forstyrrelse'],
    },
  };
}

fs.mkdirSync(reportDir, { recursive: true });
const research = readJson(researchPath);
if (research.birdHideCount !== 1 || research.westSideBirdHideCount !== 1) throw new Error('Batch 150 research er ikke entydig');
const candidate = research.birdHides?.[0];
if (candidate?.osmType !== 'way' || Number(candidate?.osmId) !== OSM_WAY_ID) throw new Error(`Uventet research-kandidat: ${JSON.stringify(candidate)}`);

const osmUrl = `https://api.openstreetmap.org/api/0.6/way/${OSM_WAY_ID}/full`;
const osmXml = await fetchText(osmUrl);
fs.writeFileSync(path.join(reportDir, `osm-way-${OSM_WAY_ID}-full.xml`), osmXml);
const way = parseWay(osmXml);
if (way.tags.leisure !== 'bird_hide' || way.tags.building !== 'hut') throw new Error(`Fresh way har uventede tags: ${JSON.stringify(way.tags)}`);
const anchor = polygonCentroid(way.points);
if (anchor.lon >= 10.8275) throw new Error(`Fugleskjulet ligger ikke på forventet vestside: ${anchor.lon}`);

const aggregate = readJson(aggregatePath);
const oldPlace = aggregate.find((place) => place?.id === PLACE_ID);
if (!oldPlace) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
const updatedAggregate = aggregate.map((place) => place?.id === PLACE_ID ? updatePlace(place, anchor) : place);
writeJson(aggregatePath, updatedAggregate);
const child = updatePlace(readJson(childPath), anchor);
writeJson(childPath, child);

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
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_ostensjovannet.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: child.lat, lon: child.lon, r: child.r,
    coordStatus: child.coordStatus, coordSource: child.coordSource, coordType: child.coordType, coordNote: child.coordNote,
  },
  identity: {
    currentName: child.name,
    resolvedIdentity: 'Det konkrete fugleskjulet på vestsiden av Østensjøvannet',
    identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'building', requiresSplit: false, splitReason: '',
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'osm', sourceName: 'OpenStreetMap – fugleskjul ved Østensjøvannet',
      sourceUrl: 'https://www.openstreetmap.org/way/533351097', sourceObjectId: 'osm-way:533351097',
      sourceQuality: 'unique_object_type_exact_bird_hide_building_geometry',
      finding: `Way 533351097 er den eneste leisure=bird_hide-geometrien i objekt-type-auditen rundt Østensjøvannet, tagget building=hut. Bygningssenteret er ${anchor.lat}, ${anchor.lon}.`,
      canVerifyCoordinate: true, reason: 'Entydig fysisk fugleskjul-geometri med riktig objekttype i dokumentert lokal scope.',
    },
    {
      sourceProvider: 'manual_research', sourceName: 'Birdingplaces – Østensjøvannet',
      sourceUrl: 'https://www.birdingplaces.eu/en/birdingplaces/norway/ostensjovannet', sourceObjectId: 'birdingplaces:ostensjovannet:west-side-bird-hide',
      sourceQuality: 'current_independent_birding_context',
      finding: 'En oppdatert fugleguide beskriver ett bird hide på vestsiden av Østensjøvannet med utsyn over de sentrale delene av vannet.',
      canVerifyCoordinate: false, reason: 'Kryssjekker funksjon og vestside-scope; eksakt bygningsgeometri kommer fra OSM.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:533351097', canApplyToPlace: true },
    { sourceProvider: 'manual_research', sourceObjectId: 'birdingplaces:ostensjovannet:west-side-bird-hide', canApplyToPlace: false },
  ],
  geometryCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:533351097', lat: anchor.lat, lon: anchor.lon, coordRole: 'building_center', geometryType: 'Polygon', canApplyToPlace: true },
  ],
  coordinateCandidates: [{ lat: anchor.lat, lon: anchor.lon, coordRole: 'building_center', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Fugleskjulets eksakte bygningsgeometri er anvendt på canonical place; den feilaktige fugletårn-betegnelsen er korrigert.' },
  notes: [child.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
if (!protocol.includes('| 150 | `ostensjovannet_fugletarn` |')) {
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./, (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
  const entry = `| 150 | \`ostensjovannet_fugletarn\` | Fugleskjulet ved Østensjøvannet | verified_geometry | \`osm-way:533351097\` |\n\nBatch 150 (2026-07-23) retter den tidligere «Østensjøvannet fugletårn»-identiteten til det konkrete fugleskjulet på vestsiden av vannet; place-id beholdes for kompatibilitet. En objekt-type-first Overpass-audit finner nøyaktig ett leisure=bird_hide rundt Østensjøvannet: OSM way 533351097, tagget building=hut og leisure=bird_hide. En uavhengig oppdatert fugleguide beskriver tilsvarende ett bird hide på vestsiden med utsyn over de sentrale delene av vannet. Canonical lat/lon beregnes deterministisk som bygningssenter for selve OSM-polygonet og klassifiseres som building/building_center. Legacy-punktet på østsiden og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex === -1) protocol = `${protocol.trimEnd()}\n\n${entry}`;
  else {
    const lineStart = protocol.lastIndexOf('\n', markerIndex) + 1;
    protocol = `${protocol.slice(0, lineStart)}${entry}${protocol.slice(lineStart)}`;
  }
  fs.writeFileSync(protocolPath, protocol);
}

writeJson(path.join(reportDir, 'batch-150-result.json'), {
  generatedAt: new Date().toISOString(), batch: BATCH, placeId: PLACE_ID, status: 'verified_geometry',
  sourceProvider: 'osm', sourceObjectId: 'osm-way:533351097', sourceUrl: 'https://www.openstreetmap.org/way/533351097',
  sourceTags: way.tags, geometry: { type: 'Polygon', nodeCount: way.points.length },
  before: { name: oldPlace.name, lat: oldPlace.lat, lon: oldPlace.lon, r: oldPlace.r, coordStatus: oldPlace.coordStatus, coordSource: oldPlace.coordSource, coordType: oldPlace.coordType, locatorType: oldPlace.locatorType },
  after: { name: child.name, lat: child.lat, lon: child.lon, r: child.r, coordStatus: child.coordStatus, coordSource: child.coordSource, coordType: child.coordType, locatorType: child.locatorType, sourceObjectId: child.sourceObjectId, geocodeAccuracy: child.geocodeAccuracy, coordRole: child.coordRole },
  method: 'object-type-first unique leisure=bird_hide building geometry + independent west-side birding context + deterministic building polygon centroid; no legacy point, nearest or first-hit',
});
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 150 sources – Fugleskjulet ved Østensjøvannet\n\n- OpenStreetMap way 533351097: unique leisure=bird_hide / building=hut geometry in the bounded object-type audit.\n- Birdingplaces Østensjøvannet, updated March 2026: independent context documenting a bird hide on the west side with views over the central lake.\n- Batch 150 research report: all bird-hide/viewpoint/shelter/tower candidates; only one leisure=bird_hide.\n\nThe legacy east-side coordinate and nearest/first-hit selection are not used.\n`);

console.log(JSON.stringify({ status: 'applied', batch: BATCH, placeId: PLACE_ID, name: child.name, sourceObjectId: child.sourceObjectId, anchor, locatorType: child.locatorType, geocodeAccuracy: child.geocodeAccuracy, coordRole: child.coordRole }, null, 2));
