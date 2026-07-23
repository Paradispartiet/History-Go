import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 151;
const PLACE_ID = 'bogerudmyra';
const OSM_RELATION_ID = 4106652;
const VERIFIED_AT = '2026-07-23';
const VIEWBOX = '10.819,59.884,10.846,59.872';
const REFERENCE_POINT = { lat: 59.87842, lon: 10.83409 };

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet/bogerudmyra.json');
const indexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet_index.json');
const manifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/bogerudmyra.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-151-bogerudmyra');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const decodeXml = (v = '') => v.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([:\w-]+)="([^"]*)"/g)].map((m) => [m[1], decodeXml(m[2])]));
const normalize = (value = '') => String(value).trim().toLocaleLowerCase('nb-NO');

async function fetchText(url, accept = 'application/xml,text/xml;q=0.9,*/*;q=0.1') {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: accept },
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`Kildeoppslag feilet ${response.status}: ${url}`);
  return response.text();
}
const fetchJson = async (url) => JSON.parse(await fetchText(url, 'application/json'));

function parseRelationTags(xml) {
  const match = [...xml.matchAll(/<relation\b([^>]*)>([\s\S]*?)<\/relation>/g)]
    .find((item) => Number(attrs(`<relation ${item[1]}>`).id) === OSM_RELATION_ID);
  if (!match) throw new Error(`Fant ikke relation ${OSM_RELATION_ID}`);
  const tags = {};
  for (const tagMatch of match[2].matchAll(/<tag\b[^>]*\/>/g)) {
    const a = attrs(tagMatch[0]);
    if (a.k) tags[a.k] = a.v ?? '';
  }
  return tags;
}

function ringCentroid(ring) {
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  if (Math.abs(twiceArea) < 1e-15) return null;
  return { area: twiceArea / 2, lon: cx / (3 * twiceArea), lat: cy / (3 * twiceArea) };
}

function multipolygonCentroid(geojson, fallback) {
  const polygons = geojson?.type === 'MultiPolygon' ? geojson.coordinates : geojson?.type === 'Polygon' ? [geojson.coordinates] : [];
  if (!polygons.length) return fallback;
  let weightSum = 0;
  let lonSum = 0;
  let latSum = 0;
  for (const polygon of polygons) {
    polygon.forEach((ring, index) => {
      const centroid = ringCentroid(ring);
      if (!centroid) return;
      const weight = index === 0 ? Math.abs(centroid.area) : -Math.abs(centroid.area);
      weightSum += weight;
      lonSum += centroid.lon * weight;
      latSum += centroid.lat * weight;
    });
  }
  if (Math.abs(weightSum) < 1e-15) return fallback;
  return { lat: Number((latSum / weightSum).toFixed(7)), lon: Number((lonSum / weightSum).toFixed(7)) };
}

function haversineM(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function updatePlace(place, anchor) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    name: 'Bogerudmyra',
    lat: anchor.lat,
    lon: anchor.lon,
    desc: 'Våtmarks- og myrområde sør for Østensjøvannet, vernet som del av Østensjøvannet naturreservat.',
    tags: ['myr', 'vatmark', 'fuktmark', 'naturreservat'],
    sourceHint: 'Canonical area-anchor er beregnet fra den eksakte navngitte OSM-våtmarksgeometrien for Bogerudmyra.',
    coordType: 'wetland_area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap relation 4106652 – Bogerudmyra',
    coordVerifiedAt: VERIFIED_AT,
    sourceProvider: 'osm',
    sourceObjectId: 'osm-relation:4106652',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordSourceId: 'osm-relation:4106652',
    coordSourceUrl: 'https://www.openstreetmap.org/relation/4106652',
    coordNote: 'Batch 151 løser Bogerudmyra som et konkret navngitt våtmarksobjekt sør for Østensjøvannet. Eksakt-name-auditen fant flere objekter med navnet Bogerudmyra, men objekttypefilteret skiller entydig ut OSM relation 4106652 som eneste fysiske våtmark; de øvrige treffene er bussholdeplasser og kollektiv stop_area. Relation 4106652 er tagget natural=wetland, wetland=marsh og type=multipolygon. Lovdata og Østensjøvannets Venner dokumenterer Bogerudmyra som del av Østensjøvannet naturreservat. Canonical lat/lon er beregnet deterministisk som arealvektet centroid av MultiPolygon-geometrien. Legacy-punktet og nearest/first-hit brukes ikke.',
    popupDesc: 'Bogerudmyra ligger sør for Østensjøvannet og er en del av det vernede våtmarksområdet. Myra står i direkte landskapelig sammenheng med innsjøen, men har egne vann- og vegetasjonsforhold. Fuktig mark, kanaler og myrvegetasjon gjør området viktig for våtmarksøkologi, samtidig som erosjonsterskelen mellom myra og vannet viser hvordan hydrologien i området også er aktivt forvaltet.',
    nature_profile: {
      ...(place.nature_profile || {}),
      type: 'myr / våtmark / naturreservat',
      title: 'Bogerudmyra – våtmark sør for Østensjøvannet',
      summary: 'Bogerudmyra er et langstrakt våtmarks- og myrområde sør for Østensjøvannet og inngår i det samme naturreservatet. Området har egne fuktige vegetasjonssoner og vannforhold, og forbindelsen til innsjøen reguleres blant annet av en erosjonsterskel. Natur-rundingen viser hvordan myr, grunt vann og hydrologisk forvaltning virker sammen i et sammenhengende bynært våtmarkssystem.',
      themes: ['myr og våtmark', 'fuktig vegetasjon', 'forbindelsen til Østensjøvannet', 'erosjonsterskel og vannstand', 'naturreservat', 'bynær våtmarksøkologi'],
    },
  };
}

fs.mkdirSync(reportDir, { recursive: true });
const queryUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent('Bogerudmyra, Oslo, Norway')}&limit=20&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=${VIEWBOX}&bounded=1`;
const results = await fetchJson(queryUrl);
writeJson(path.join(reportDir, 'nominatim-bogerudmyra-fresh.json'), { queryUrl, results });
const exactPhysical = results.filter((result) =>
  normalize(result.name || result.namedetails?.name) === 'bogerudmyra' &&
  result.osm_type === 'relation' && Number(result.osm_id) === OSM_RELATION_ID &&
  result.category === 'natural' && result.type === 'wetland'
);
if (exactPhysical.length !== 1) throw new Error(`Fresh object-type audit ga ${exactPhysical.length} forventede Bogerudmyra-våtmarksobjekter`);
const selected = exactPhysical[0];
if (!['MultiPolygon', 'Polygon'].includes(selected.geojson?.type)) throw new Error(`Uventet geometri: ${selected.geojson?.type}`);

const relationUrl = `https://api.openstreetmap.org/api/0.6/relation/${OSM_RELATION_ID}/full`;
const relationXml = await fetchText(relationUrl);
fs.writeFileSync(path.join(reportDir, `osm-relation-${OSM_RELATION_ID}-full.xml`), relationXml);
const relationTags = parseRelationTags(relationXml);
if (relationTags.name !== 'Bogerudmyra' || relationTags.natural !== 'wetland' || relationTags.wetland !== 'marsh' || relationTags.type !== 'multipolygon') {
  throw new Error(`Uventede relation-tags: ${JSON.stringify(relationTags)}`);
}

const bbox = selected.boundingbox.map(Number);
const referenceInsideBbox = REFERENCE_POINT.lat >= bbox[0] && REFERENCE_POINT.lat <= bbox[1] && REFERENCE_POINT.lon >= bbox[2] && REFERENCE_POINT.lon <= bbox[3];
if (!referenceInsideBbox) throw new Error(`Uavhengig Bogerudmyra-referanse ligger utenfor polygon-bbox: ${JSON.stringify({ bbox, REFERENCE_POINT })}`);
const anchor = multipolygonCentroid(selected.geojson, { lat: Number(selected.lat), lon: Number(selected.lon) });
const referenceDistanceM = Number(haversineM(anchor, REFERENCE_POINT).toFixed(1));

const aggregate = readJson(aggregatePath);
const oldPlace = aggregate.find((place) => place?.id === PLACE_ID);
if (!oldPlace) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
writeJson(aggregatePath, aggregate.map((place) => place?.id === PLACE_ID ? updatePlace(place, anchor) : place));
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
  schemaVersion: '1.0', placeId: PLACE_ID,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_ostensjovannet.json',
  evidenceStatus: 'applied_to_place', coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: child.lat, lon: child.lon, r: child.r, coordStatus: child.coordStatus, coordSource: child.coordSource, coordType: child.coordType, coordNote: child.coordNote },
  identity: { currentName: child.name, resolvedIdentity: 'Bogerudmyra som konkret navngitt våtmarksområde sør for Østensjøvannet', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'natural_area', requiresSplit: false, splitReason: '' },
  requiredEvidence: [],
  evidence: [
    { sourceProvider: 'osm', sourceName: 'OpenStreetMap – Bogerudmyra', sourceUrl: 'https://www.openstreetmap.org/relation/4106652', sourceObjectId: 'osm-relation:4106652', sourceQuality: 'unique_object_type_exact_named_wetland_multipolygon', finding: `Relation 4106652 er det eneste fysiske wetland-objektet blant eksakte Bogerudmyra-navnetreff; relationen er natural=wetland, wetland=marsh og type=multipolygon. Area-anchor er ${anchor.lat}, ${anchor.lon}.`, canVerifyCoordinate: true, reason: 'Eksakt navngitt fysisk våtmarksgeometri med riktig objekttype.' },
    { sourceProvider: 'manual_research', sourceName: 'Lovdata – forskrift om Østensjøvannet naturreservat', sourceUrl: 'https://lovdata.no/dokument/LF/forskrift/1992-10-02-754/KAPITTEL_5', sourceObjectId: 'lovdata:FOR-1992-10-02-754:bogerudmyra', sourceQuality: 'official_protected_area_identity', finding: 'Verneforskriften fastsetter at våtmarksområdet ved Østensjøvannet og Bogerudmyra er vernet som Østensjøvannet naturreservat.', canVerifyCoordinate: false, reason: 'Fastsetter den offisielle Bogerudmyra-identiteten; eksakt lokal geometri kommer fra OSM.' },
    { sourceProvider: 'manual_research', sourceName: 'Østensjøvannets Venner – naturreservatet', sourceUrl: 'https://www.ostensjovannet.no/naturreservatet', sourceObjectId: 'ostensjovannets-venner:naturreservatet:bogerudmyra', sourceQuality: 'current_local_reserve_context', finding: 'Den aktuelle reservatbeskrivelsen sier uttrykkelig at reservatet består av Østensjøvannet med kantsone og Bogerudmyra.', canVerifyCoordinate: false, reason: 'Kryssjekker fysisk og vernemessig identitet.' },
    { sourceProvider: 'manual_research', sourceName: 'Lokalhistoriewiki – Bogerudmyra', sourceUrl: 'https://lokalhistoriewiki.no/wiki/Bogerudmyra', sourceObjectId: 'lokalhistoriewiki:bogerudmyra:scope-reference', sourceQuality: 'independent_local_scope_crosscheck', finding: `Publisert referanse 59.87842, 10.83409 ligger innenfor fresh OSM-boundingbox og ${referenceDistanceM} m fra det beregnede area-ankeret.`, canVerifyCoordinate: false, reason: 'Brukes bare som uavhengig scope-kryssjekk, ikke som canonical koordinatkilde.' },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-relation:4106652', canApplyToPlace: true },
    { sourceProvider: 'manual_research', sourceObjectId: 'lovdata:FOR-1992-10-02-754:bogerudmyra', canApplyToPlace: false },
  ],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: 'osm-relation:4106652', lat: anchor.lat, lon: anchor.lon, coordRole: 'area_anchor', geometryType: selected.geojson.type, canApplyToPlace: true }],
  coordinateCandidates: [{ lat: anchor.lat, lon: anchor.lon, coordRole: 'area_anchor', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Bogerudmyras eksakte våtmarksgeometri er anvendt på canonical place.' },
  notes: [child.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
if (!protocol.includes('| 151 | `bogerudmyra` |')) {
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./, (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
  const entry = `| 151 | \`bogerudmyra\` | Bogerudmyra | verified_geometry | \`osm-relation:4106652\` |\n\nBatch 151 (2026-07-23) løser Bogerudmyra som et konkret navngitt våtmarksobjekt sør for Østensjøvannet. Eksakt-name-auditen finner flere Bogerudmyra-navnetreff, men objekttypefilteret skiller entydig ut OSM relation 4106652 som eneste fysiske våtmark; de øvrige treffene er kollektivobjekter. Relation 4106652 er tagget natural=wetland, wetland=marsh og type=multipolygon. Lovdata og Østensjøvannets Venner dokumenterer Bogerudmyra som del av Østensjøvannet naturreservat. Canonical lat/lon beregnes deterministisk som arealvektet centroid av MultiPolygon-geometrien. Legacy-punktet og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex === -1) protocol = `${protocol.trimEnd()}\n\n${entry}`;
  else {
    const lineStart = protocol.lastIndexOf('\n', markerIndex) + 1;
    protocol = `${protocol.slice(0, lineStart)}${entry}${protocol.slice(lineStart)}`;
  }
  fs.writeFileSync(protocolPath, protocol);
}

writeJson(path.join(reportDir, 'batch-151-result.json'), {
  generatedAt: new Date().toISOString(), batch: BATCH, placeId: PLACE_ID, status: 'verified_geometry',
  sourceProvider: 'osm', sourceObjectId: 'osm-relation:4106652', sourceUrl: 'https://www.openstreetmap.org/relation/4106652', sourceTags: relationTags,
  geometry: { type: selected.geojson.type, boundingbox: bbox, referencePoint: REFERENCE_POINT, referenceDistanceM },
  before: { name: oldPlace.name, lat: oldPlace.lat, lon: oldPlace.lon, r: oldPlace.r, coordStatus: oldPlace.coordStatus, coordSource: oldPlace.coordSource, coordType: oldPlace.coordType },
  after: { name: child.name, lat: child.lat, lon: child.lon, r: child.r, coordStatus: child.coordStatus, coordSource: child.coordSource, coordType: child.coordType, sourceObjectId: child.sourceObjectId, geocodeAccuracy: child.geocodeAccuracy, coordRole: child.coordRole },
  method: 'exact-name candidate audit + object-type-first selection of the unique physical wetland multipolygon + official reserve identity + independent local scope crosscheck + deterministic multipolygon centroid; no legacy point, nearest or first-hit',
});
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 151 sources – Bogerudmyra\n\n- OpenStreetMap relation 4106652: exact named natural=wetland / wetland=marsh multipolygon used for geometry.\n- Lovdata protection regulation: Bogerudmyra is explicitly part of Østensjøvannet nature reserve.\n- Østensjøvannets Venner: current reserve description explicitly includes Bogerudmyra.\n- Lokalhistoriewiki coordinate is used only as an independent scope crosscheck.\n\nBus-stop and public-transport objects with the same name are rejected by object-type filtering. The legacy History Go coordinate and nearest/first-hit selection are not used.\n`);
console.log(JSON.stringify({ status: 'applied', batch: BATCH, placeId: PLACE_ID, name: child.name, sourceObjectId: child.sourceObjectId, anchor, referenceDistanceM }, null, 2));
