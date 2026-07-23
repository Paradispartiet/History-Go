import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 149;
const PLACE_ID = 'ostensjovannet_nord';
const OSM_RELATION_ID = 6503853;
const VERIFIED_AT = '2026-07-23';
const VIEWBOX = '10.805,59.899,10.842,59.884';
const REFERENCE_POINT = { lat: 59.8974667, lon: 10.8307833 };

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet/ostensjovannet_nord.json');
const splitIndexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet_index.json');
const splitManifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ostensjovannet_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/ostensjovannet_nord.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const researchSummaryPath = path.join(ROOT, 'reports/oslo-coordinate-control-batch-149-vadedammen-research/candidate-summary.json');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-149-vadedammen');

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function decodeXml(value = '') {
  return value.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
}
function attrs(tag) {
  const out = {};
  for (const match of tag.matchAll(/([:\w-]+)="([^"]*)"/g)) out[match[1]] = decodeXml(match[2]);
  return out;
}
function parseRelationTags(xml, relationId) {
  const match = [...xml.matchAll(/<relation\b([^>]*)>([\s\S]*?)<\/relation>/g)]
    .find((item) => Number(attrs(`<relation ${item[1]}>`).id) === relationId);
  if (!match) throw new Error(`Fant ikke relation ${relationId} i OSM-respons`);
  const tags = {};
  for (const tagMatch of match[2].matchAll(/<tag\b[^>]*\/>/g)) {
    const a = attrs(tagMatch[0]);
    if (a.k) tags[a.k] = a.v ?? '';
  }
  return tags;
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
  return {
    area: twiceArea / 2,
    lon: cx / (3 * twiceArea),
    lat: cy / (3 * twiceArea),
  };
}
function polygonCentroid(geojson, fallback) {
  if (!geojson || geojson.type !== 'Polygon' || !Array.isArray(geojson.coordinates) || geojson.coordinates.length < 1) {
    return fallback;
  }
  let totalWeight = 0;
  let lonSum = 0;
  let latSum = 0;
  geojson.coordinates.forEach((ring, index) => {
    const centroid = ringCentroid(ring);
    if (!centroid) return;
    const weight = index === 0 ? Math.abs(centroid.area) : -Math.abs(centroid.area);
    totalWeight += weight;
    lonSum += centroid.lon * weight;
    latSum += centroid.lat * weight;
  });
  if (Math.abs(totalWeight) < 1e-15) return fallback;
  return {
    lat: Number((latSum / totalWeight).toFixed(7)),
    lon: Number((lonSum / totalWeight).toFixed(7)),
  };
}
async function fetchText(url, accept = 'application/xml,text/xml;q=0.9,*/*;q=0.1') {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: accept },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Kildeoppslag feilet ${response.status}: ${url}`);
  return response.text();
}
async function fetchJson(url) { return JSON.parse(await fetchText(url, 'application/json')); }

function updatePlaceRecord(place, anchor) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    name: 'Vadedammen',
    lat: anchor.lat,
    lon: anchor.lon,
    desc: 'Kunstig anlagt, grunn våtmarksdam nord for Østensjøvannet, etablert som habitat for vadefugl.',
    tags: ['vatmark', 'fugleliv', 'siv', 'dam'],
    sourceHint: 'Vadedammen er et konkret navngitt våtmarksobjekt nord for Østensjøvannet. Canonical kartanker er beregnet fra den eksakte OSM-polygonen for dammen.',
    coordType: 'pond_area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap relation 6503853 – Vadedammen',
    coordVerifiedAt: VERIFIED_AT,
    sourceProvider: 'osm',
    sourceObjectId: 'osm-relation:6503853',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordSourceId: 'osm-relation:6503853',
    coordSourceUrl: 'https://www.openstreetmap.org/relation/6503853',
    coordNote: 'Batch 149 erstatter den repo-syntetiske identiteten «Østensjøvannet nord» med det konkrete navngitte våtmarksobjektet Vadedammen, mens placeId beholdes for kompatibilitet. OSM relation 6503853 er den eneste eksakt navngitte Vadedammen-kandidaten i den korrigerte nordende-scope-boksen og er modellert som pond-polygon. Østensjøvannets Venner dokumenterer Vadedammen som en kunstig anlagt, grunn våtmarksdam nord for Østensjøvannet, etablert for vadefugl, og publiserer en GPS-referanse som faller innenfor samme polygon-scope. Canonical lat/lon beregnes deterministisk som arealvektet polygoncentroid. Hele naturreservatpolygonet, legacy-punktet og nearest/first-hit brukes ikke.',
    popupDesc: 'Vadedammen ligger rett nord for Østensjøvannet og ble anlagt som et eget våtmarksområde for å bedre forholdene for vadefugl. Den grunne dammen har åpne vannflater, takrør og andre fuktige kantsoner, og skjøttes for å motvirke gjengroing. Stedet viser hvordan et konstruert våtmarksområde kan gi egne leve-, raste- og næringsområder for fugl og amfibier i et tett bylandskap.',
    nature_profile: {
      ...(place.nature_profile || {}),
      type: 'kunstig våtmarksdam / grunt vann / takrør',
      title: 'Vadedammen – våtmark for vadefugl',
      summary: 'Vadedammen er en grunn, kunstig anlagt våtmarksdam rett nord for Østensjøvannet. Dammen ble etablert for å bedre forholdene for vadefugl og består av et skiftende samspill mellom åpent vann, takrør og fuktige kantsoner. Skjøtsel mot gjengroing holder deler av vannspeilet åpent og gjør Vadedammen til et tydelig eksempel på aktiv habitatforvaltning i Østensjøområdet.',
      themes: [
        'kunstig anlagt våtmarksdam',
        'grunt vann og åpent vannspeil',
        'takrør og fuktige kantsoner',
        'habitat for vadefugl',
        'skjøtsel mot gjengroing',
        'våtmark nord for Østensjøvannet',
      ],
    },
    underbadge_ids: ['vatmark', 'vannfugl', 'habitat'],
  };
}

fs.mkdirSync(reportDir, { recursive: true });
const research = readJson(researchSummaryPath);
if (research.plausibleExactNamedCount !== 1) throw new Error(`Batch 149 research er ikke entydig: ${research.plausibleExactNamedCount}`);
const researchCandidate = research.exactNamedCandidates?.[0];
if (researchCandidate?.osmType !== 'relation' || Number(researchCandidate?.osmId) !== OSM_RELATION_ID) {
  throw new Error(`Uventet research-kandidat: ${JSON.stringify(researchCandidate)}`);
}

const queryUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent('Vadedammen, Oslo, Norway')}&limit=20&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=${VIEWBOX}&bounded=1`;
const freshResults = await fetchJson(queryUrl);
writeJson(path.join(reportDir, 'nominatim-vadedammen-fresh.json'), { queryUrl, results: freshResults });
const exactFresh = freshResults.filter((r) => String(r.name || r.namedetails?.name || '').toLocaleLowerCase('nb-NO') === 'vadedammen');
if (exactFresh.length !== 1) throw new Error(`Fresh Vadedammen-søk ga ${exactFresh.length} eksakte kandidater`);
const selected = exactFresh[0];
if (selected.osm_type !== 'relation' || Number(selected.osm_id) !== OSM_RELATION_ID || selected.category !== 'water' || selected.type !== 'pond') {
  throw new Error(`Fresh kandidat avviker fra research: ${JSON.stringify({ osm_type: selected.osm_type, osm_id: selected.osm_id, category: selected.category, type: selected.type })}`);
}
if (selected.geojson?.type !== 'Polygon') throw new Error(`Vadedammen mangler forventet Polygon-geometri: ${selected.geojson?.type}`);

const relationUrl = `https://api.openstreetmap.org/api/0.6/relation/${OSM_RELATION_ID}/full`;
const relationXml = await fetchText(relationUrl);
fs.writeFileSync(path.join(reportDir, `osm-relation-${OSM_RELATION_ID}-full.xml`), relationXml);
const relationTags = parseRelationTags(relationXml, OSM_RELATION_ID);
if (relationTags.name !== 'Vadedammen' || relationTags.type !== 'multipolygon') {
  throw new Error(`Uventede relation-tags: ${JSON.stringify(relationTags)}`);
}
const waterTagOk = relationTags.natural === 'water' || relationTags.water === 'pond' || relationTags.landuse === 'reservoir';
if (!waterTagOk) throw new Error(`Relation ${OSM_RELATION_ID} mangler forventet vann-/damtagging: ${JSON.stringify(relationTags)}`);

const bbox = selected.boundingbox.map(Number);
const referenceInsideBbox = REFERENCE_POINT.lat >= bbox[0] && REFERENCE_POINT.lat <= bbox[1] && REFERENCE_POINT.lon >= bbox[2] && REFERENCE_POINT.lon <= bbox[3];
if (!referenceInsideBbox) throw new Error(`Publisert Vadedammen-GPS-referanse faller utenfor fresh polygon-bbox: ${JSON.stringify({ bbox, REFERENCE_POINT })}`);
const anchor = polygonCentroid(selected.geojson, { lat: Number(selected.lat), lon: Number(selected.lon) });
const referenceDistanceM = Number(haversineM(anchor, REFERENCE_POINT).toFixed(1));

const aggregateBefore = readJson(aggregatePath);
const aggregateOld = aggregateBefore.find((p) => p?.id === PLACE_ID);
if (!aggregateOld) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
const aggregateAfter = aggregateBefore.map((p) => p?.id === PLACE_ID ? updatePlaceRecord(p, anchor) : p);
writeJson(aggregatePath, aggregateAfter);

const childBefore = readJson(childPath);
const nearbyBefore = childBefore?.nature_profile?.nearby_place_ids || [];
const childAfter = updatePlaceRecord(childBefore, anchor);
writeJson(childPath, childAfter);
if (JSON.stringify(nearbyBefore) !== JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || [])) {
  throw new Error('nearby_place_ids ble utilsiktet endret');
}

const splitIndex = readJson(splitIndexPath);
const indexRow = splitIndex.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error(`Mangler ${PLACE_ID} i split-index`);
Object.assign(indexRow, {
  name: childAfter.name,
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
manifestRow.name = childAfter.name;
manifestRow.sha256 = sha256(childPath);
writeJson(splitManifestPath, splitManifest);

const note = childAfter.coordNote;
writeJson(evidencePath, {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_ostensjovannet.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: anchor.lat,
    lon: anchor.lon,
    r: childAfter.r,
    coordStatus: childAfter.coordStatus,
    coordSource: childAfter.coordSource,
    coordType: childAfter.coordType,
    coordNote: note,
  },
  identity: {
    currentName: childAfter.name,
    resolvedIdentity: 'Vadedammen – den konkrete kunstig anlagte våtmarksdammen nord for Østensjøvannet',
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
      sourceName: 'OpenStreetMap – Vadedammen',
      sourceUrl: 'https://www.openstreetmap.org/relation/6503853',
      sourceObjectId: 'osm-relation:6503853',
      sourceQuality: 'unique_exact_named_pond_polygon',
      finding: `Relation 6503853 er den eneste eksakt navngitte Vadedammen-kandidaten i korrigert lokal scope og er modellert som en pond-polygon. Canonical area-anchor er polygoncentroid ${anchor.lat}, ${anchor.lon}.`,
      canVerifyCoordinate: true,
      reason: 'Eksakt navngitt fysisk damgeometri med riktig objekttype og entydig lokal identitet.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Østensjøvannets Venner – Vadedammen',
      sourceUrl: 'https://www.ostensjovannet.no/post/vadedammen-sl%C3%A5tt-av-takr%C3%B8r-for-begrensning-av-gjengroing',
      sourceObjectId: 'ostensjovannets-venner:vadedammen-wetland',
      sourceQuality: 'documented_named_local_wetland_identity',
      finding: 'Kilden dokumenterer Vadedammen som den kunstig anlagte dammen nord for Østensjøvannet, etablert som habitat for vadefugl og dominert av takrør i gjengroingsfasene.',
      canVerifyCoordinate: false,
      reason: 'Fastsetter lokal identitet, naturtype og habitatfunksjon; den eksakte polygongeometrien kommer fra OSM.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Østensjøvannets Venner – adkomst og GPS-referanser',
      sourceUrl: 'https://www.ostensjovannet.no/adkomst',
      sourceObjectId: 'ostensjovannets-venner:vadedammen-gps-reference',
      sourceQuality: 'published_local_gps_scope_crosscheck',
      finding: `Publisert GPS-referanse for Vadedammen er 59.8974667, 10.8307833. Referansen ligger innenfor den fresh OSM-polygonens bounding box og ${referenceDistanceM} m fra det beregnede area-ankeret.`,
      canVerifyCoordinate: false,
      reason: 'Kryssjekker at den valgte OSM-geometrien ligger i den dokumenterte lokale Vadedammen-scope; referansen brukes ikke som canonical punkt.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-relation:6503853', canApplyToPlace: true },
    { sourceProvider: 'manual_research', sourceObjectId: 'ostensjovannets-venner:vadedammen-wetland', canApplyToPlace: false },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-relation:6503853',
      lat: anchor.lat,
      lon: anchor.lon,
      coordRole: 'area_anchor',
      geometryType: 'Polygon',
      canApplyToPlace: true,
    },
  ],
  coordinateCandidates: [
    { lat: anchor.lat, lon: anchor.lon, coordRole: 'area_anchor', canApplyToPlace: true },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Vadedammens eksakte polygongeometri er anvendt på canonical place; den gamle syntetiske nordsonen er pensjonert som identitet.',
  },
  notes: [note],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
if (!protocol.includes('| 149 | `ostensjovannet_nord` |')) {
  protocol = protocol.replace(
    /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./,
    (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`,
  );
  const entry = `| 149 | \`ostensjovannet_nord\` | Vadedammen | verified_geometry | \`osm-relation:6503853\` |\n\nBatch 149 (2026-07-23) erstatter den repo-syntetiske «Østensjøvannet nord»-identiteten med det konkrete navngitte våtmarksobjektet Vadedammen; place-id beholdes for kompatibilitet. Korrigert lokal research finner én eneste eksakt navngitt kandidat: OSM relation 6503853, modellert som pond-polygon. Østensjøvannets Venner dokumenterer Vadedammen som en kunstig anlagt, grunn våtmarksdam nord for Østensjøvannet og publiserer en GPS-referanse som faller innenfor samme polygon-scope. Canonical lat/lon beregnes deterministisk fra polygongeometrien som area-anchor. Hele naturreservatpolygonet, legacy-punktet og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex === -1) protocol = `${protocol.trimEnd()}\n\n${entry}`;
  else {
    const lineStart = protocol.lastIndexOf('\n', markerIndex) + 1;
    protocol = `${protocol.slice(0, lineStart)}${entry}${protocol.slice(lineStart)}`;
  }
  fs.writeFileSync(protocolPath, protocol);
}

writeJson(path.join(reportDir, 'batch-149-result.json'), {
  generatedAt: new Date().toISOString(),
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'verified_geometry',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-relation:6503853',
  sourceUrl: 'https://www.openstreetmap.org/relation/6503853',
  sourceTags: relationTags,
  geometry: {
    type: selected.geojson.type,
    boundingbox: bbox,
    referencePoint: REFERENCE_POINT,
    referenceDistanceM,
  },
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
  method: 'unique exact named OSM pond polygon + independent documented Vadedammen identity and GPS scope crosscheck + deterministic polygon centroid; no parent-reserve proxy, legacy point, nearest or first-hit',
});
writeJson(path.join(reportDir, 'nearby-links-preservation.json'), {
  placeId: PLACE_ID,
  before: nearbyBefore,
  after: childAfter?.nature_profile?.nearby_place_ids || [],
  preserved: JSON.stringify(nearbyBefore) === JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || []),
});
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 149 sources – Vadedammen\n\n- OpenStreetMap relation 6503853: exact named pond polygon used for geometry and deterministic area-anchor.\n- Østensjøvannets Venner, Vadedammen article: documents the artificial wetland pond north of Østensjøvannet, wader habitat, reeds and anti-overgrowth management.\n- Østensjøvannets Venner, access/GPS page: independent published Vadedammen reference used only as a scope crosscheck.\n- Batch 149 research report: bounded exact-name candidate audit found exactly one plausible Vadedammen geometry.\n\nNo parent-reserve polygon, legacy point, nearest or first-hit selection is used.\n`);

console.log(JSON.stringify({
  status: 'applied',
  batch: BATCH,
  placeId: PLACE_ID,
  name: childAfter.name,
  sourceObjectId: childAfter.sourceObjectId,
  anchor,
  referenceDistanceM,
}, null, 2));
