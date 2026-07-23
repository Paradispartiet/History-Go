import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 157;
const PLACE_ID = 'alnaelva';
const VERIFIED_AT = '2026-07-23';
const DISPLAY_ID = 'alna_smalvoll';

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_alna.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_alna/alnaelva.json');
const indexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_alna_index.json');
const manifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_alna_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/alnaelva.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-157-alna-multi-anchor-route');
const routeDir = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute');

const componentSpecs = [
  { id: 'alnsjoen_alna_kilde', file: 'alnsjoen_alna_kilde.json', type: 'hydrological_outflow_anchor', role: 'source_anchor' },
  { id: 'groruddammen', file: 'groruddammen.json', type: 'area_anchor', role: 'upper_water_anchor' },
  { id: 'alnaparken', file: 'alnaparken.json', type: 'area_anchor', role: 'upper_corridor_anchor' },
  { id: 'alna_smalvoll', file: 'alna_smalvoll.json', type: 'line_anchor', role: 'display_anchor' },
  { id: 'alna_bryn', file: 'alna_bryn.json', type: 'line_anchor', role: 'river_segment_anchor' },
  { id: 'svartdalen', file: 'svartdalen.json', type: 'line_anchor', role: 'valley_anchor' },
  { id: 'kvaernerbyen_alna', file: 'kvaernerbyen_alna.json', type: 'line_anchor', role: 'lower_corridor_anchor' },
  { id: 'alna_utlop_bjorvika', file: 'alna_utlop_bjorvika.json', type: 'area_anchor', role: 'historical_outlet_marker' },
];

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function anchorFromPlace(place, spec) {
  return {
    id: place.id,
    name: place.name,
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    type: spec.type,
    role: spec.role,
    coordStatus: place.coordStatus,
    ...(place.sourceProvider ? { sourceProvider: place.sourceProvider } : {}),
    ...(place.sourceObjectId ? { sourceObjectId: place.sourceObjectId } : {}),
    ...(place.coordSourceUrl ? { sourceUrl: place.coordSourceUrl } : {}),
    note: place.coordNote || place.sourceHint || `Verifisert Alna-komponent ${place.id}.`,
  };
}

fs.mkdirSync(reportDir, { recursive: true });
const components = componentSpecs.map((spec) => {
  const filePath = path.join(routeDir, spec.file);
  const place = readJson(filePath);
  if (place.id !== spec.id) throw new Error(`Komponent-id mismatch i ${spec.file}: ${place.id}`);
  if (place.coordStatus !== 'verified_geometry') throw new Error(`${place.id} er ikke verified_geometry`);
  if (!Number.isFinite(place.lat) || !Number.isFinite(place.lon)) throw new Error(`${place.id} mangler gyldig lat/lon`);
  return { spec, place };
});

const display = components.find(({ place }) => place.id === DISPLAY_ID)?.place;
if (!display) throw new Error(`Mangler displaykomponent ${DISPLAY_ID}`);
if (display.sourceObjectId !== 'osm-way:22698275') throw new Error(`Uventet Smalvoll-kilde: ${display.sourceObjectId}`);
if (display.locatorType !== 'route' || display.geocodeAccuracy !== 'semantic_anchor' || display.coordRole !== 'line_anchor') {
  throw new Error('Smalvoll-displayankeret har uventet coordinate-source-contract metadata');
}

const outlet = components.find(({ place }) => place.id === 'alna_utlop_bjorvika')?.place;
const currentMouth = outlet?.anchors?.find((anchor) => anchor.id === 'alna_dagens_utlop_kongshavn');
if (!currentMouth) throw new Error('Mangler separat current_hydrological_outlet-anker i alna_utlop_bjorvika');
if (currentMouth.sourceObjectId !== 'osm-node:8067892897' || currentMouth.role !== 'current_hydrological_outlet') {
  throw new Error(`Uventet Kongshavn-anker: ${JSON.stringify(currentMouth)}`);
}

const anchors = components.map(({ spec, place }) => anchorFromPlace(place, spec));
anchors.push({
  id: currentMouth.id,
  name: currentMouth.name,
  lat: currentMouth.lat,
  lon: currentMouth.lon,
  r: currentMouth.r,
  type: 'mouth_anchor',
  role: 'current_mouth_anchor',
  coordStatus: currentMouth.coordStatus,
  sourceProvider: currentMouth.sourceProvider,
  sourceObjectId: currentMouth.sourceObjectId,
  sourceUrl: currentMouth.sourceUrl,
  note: currentMouth.note,
});

const anchorIds = anchors.map((anchor) => anchor.id);
const expectedAnchorIds = [
  'alnsjoen_alna_kilde',
  'groruddammen',
  'alnaparken',
  'alna_smalvoll',
  'alna_bryn',
  'svartdalen',
  'kvaernerbyen_alna',
  'alna_utlop_bjorvika',
  'alna_dagens_utlop_kongshavn',
];
if (JSON.stringify(anchorIds) !== JSON.stringify(expectedAnchorIds)) throw new Error(`Uventet anchorrekkefølge: ${anchorIds.join(', ')}`);

function updateQuizProfile(profile = {}) {
  return {
    ...profile,
    signature_features: (profile.signature_features || []).map((feature) =>
      feature === 'Oslos lengste elv fra Alnsjøen til Bjørvika'
        ? 'Oslos lengste elv fra Alungsjøen gjennom Groruddalen til dagens utløp ved Kongshavn, med historisk utløpsspor ved Vannspeilet'
        : feature
    ),
  };
}

function updatePlace(place) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    lat: display.lat,
    lon: display.lon,
    desc: 'Byelv fra Alungsjøen gjennom Groruddalen og de østlige bydelene til dagens utløp ved Kongshavn, preget av industri, kulvertering og senere miljørestaurering.',
    sourceHint: 'Hovedstedet modelleres som en verifisert multi-anchor vassdragskjede fra Alungsjøens utløp gjennom Groruddammen, Alnaparken, Smalvoll, Bryn, Svartdalen og Kværnerbyen til dagens hydrologiske utløp ved Kongshavn. Vannspeilet beholdes som separat historisk utløpsmarkør. Smalvoll-wayen brukes kun som sentralt displayanker.',
    coordType: 'multi_anchor_route_display_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Verifisert Alna multi-anchor chain; display-anchor OpenStreetMap way 22698275 – Alna ved Smalvoll; separat current mouth osm-node:8067892897; historical outlet marker osm-way:4258487',
    coordVerifiedAt: VERIFIED_AT,
    coordNote: 'Batch 157 løser hovedrecorden Alnaelva som et eksplisitt multi-anchor vassdrag i stedet for å late som ett punkt eller én OSM-way representerer hele elva. Den modellerte kjeden består av verifiserte delankre fra Alungsjøens utløpsnode via Groruddammen, Alnaparken, Smalvoll, Bryn, Svartdalen og Kværnerbyen til dagens eksplisitte elv–kyst-node ved Kongshavn. Vannspeilet/Tenerife beholdes i samme hovedmodell som separat historisk utløpsmarkør, uten at dette påstås å være et eksakt middelaldermunningspunkt. Canonical lat/lon er Smalvoll-segmentets verifiserte line-anchor fordi det fungerer som sentralt displayanker i kjeden; punktet er ikke et påstått geometrisk sentrum for hele vassdraget. Ingen legacy-koordinat, nearest/first-hit eller syntetisk enkeltgeometri brukes.',
    anchors,
    locatorType: 'route',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:22698275',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordSourceId: 'osm-way:22698275',
    coordSourceUrl: 'https://www.openstreetmap.org/way/22698275',
    popupDesc: 'Alnaelva er Oslos lengste elv og går fra Alungsjøen gjennom områder med tung industrihistorie, tett bebyggelse og nyere restaurering av blågrønne korridorer. Langs elva finner man både tekniske inngrep, tunnellagte partier og strekninger der vannet og naturkorridoren er åpnet opp igjen. Dagens vannføring ender ved Kongshavn, mens Vannspeilet i Middelalderparken markerer det historiske utløpslandskapet mot Sørenga og Bjørvika.\n\nI History Go er Alnaelva viktig som eksempel på hvordan byutvikling, miljøforvaltning og lokalhistorie møtes i ett vassdrag. Spørsmål bør koble elvas rolle som naturkorridor på østkanten med historien om inngrep, lukking og gjenåpning.\n\nElva har også vært omtalt som Loelva; dette er et historisk/alternativt navn på Alna og ikke et eget separat vassdrag.',
    quiz_profile: updateQuizProfile(place.quiz_profile),
  };
}

const aggregate = readJson(aggregatePath);
const oldPlace = aggregate.find((place) => place?.id === PLACE_ID);
if (!oldPlace) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
const newPlace = updatePlace(oldPlace);
writeJson(aggregatePath, aggregate.map((place) => place?.id === PLACE_ID ? newPlace : place));
const child = updatePlace(readJson(childPath));
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
    resolvedIdentity: 'Alnaelva som verifisert multi-anchor vassdragskjede fra Alungsjøen til dagens utløp ved Kongshavn, med Vannspeilet som separat historisk utløpsmarkør',
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
      sourceName: 'OpenStreetMap – Alna ved Smalvoll, displayanker for multi-anchor-kjeden',
      sourceUrl: 'https://www.openstreetmap.org/way/22698275',
      sourceObjectId: 'osm-way:22698275',
      sourceQuality: 'verified_component_display_anchor_inside_verified_multi_anchor_route_model',
      finding: `Canonical displayanker er den allerede verifiserte Smalvoll-wayen på ${display.lat}, ${display.lon}. Hovedrecordens ${anchors.length} ankere er bygget direkte fra canonical verified_geometry-komponenter og det eksplisitte current-mouth-ankeret i batch 156.`,
      canVerifyCoordinate: true,
      reason: 'Displaykoordinaten kommer direkte fra en verifisert fysisk Alna-geometri; hele vassdraget representeres eksplisitt av flere verifiserte ankere.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – dagens Alna-utløp ved Kongshavn',
      sourceUrl: 'https://www.openstreetmap.org/node/8067892897',
      sourceObjectId: 'osm-node:8067892897',
      sourceQuality: 'explicit_current_hydrological_mouth_topology_anchor',
      finding: 'Dagens vannføring ender i en eksplisitt delt node mellom den åpne Alna-utløpswayen og kystlinjen ved Kongshavn.',
      canVerifyCoordinate: false,
      reason: 'Verifiserer kjedens nåværende endepunkt, men er ikke hovedrecordens displaykoordinat.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – Vannspeilet/Tenerife',
      sourceUrl: 'https://www.openstreetmap.org/way/4258487',
      sourceObjectId: 'osm-way:4258487',
      sourceQuality: 'verified_historical_outlet_marker_anchor',
      finding: 'Vannspeilet/Tenerife inngår som separat historisk utløpsmarkør og holdes eksplisitt adskilt fra dagens hydrologiske utløp.',
      canVerifyCoordinate: false,
      reason: 'Historisk markør i multi-anchor-modellen, ikke parentens displaykoordinat.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:22698275', canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: 'osm-node:8067892897', canApplyToPlace: false },
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:4258487', canApplyToPlace: false },
  ],
  geometryCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:22698275', lat: display.lat, lon: display.lon, coordRole: 'line_anchor', geometryType: 'LineString', canApplyToPlace: true },
  ],
  coordinateCandidates: [
    { lat: display.lat, lon: display.lon, coordRole: 'line_anchor', canApplyToPlace: true },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Alnaelva er anvendt som verified multi-anchor route med Smalvoll som deklarert displayanker, dagens Kongshavn-utløp som mouth-anchor og Vannspeilet som historisk markør.',
  },
  notes: [child.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
if (!protocol.includes('| 157 | `alnaelva` |')) {
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./, (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
  const entry = `| 157 | \`alnaelva\` | Alnaelva | verified_geometry | \`osm-way:22698275\` |\n\nBatch 157 (2026-07-23) løser hovedrecorden Alnaelva som et eksplisitt multi-anchor vassdrag fra Alungsjøens utløp gjennom Groruddammen, Alnaparken, Smalvoll, Bryn, Svartdalen og Kværnerbyen til dagens hydrologiske utløp ved Kongshavn. Vannspeilet/Tenerife beholdes som separat historisk utløpsmarkør og brukes ikke som dagens mouth-anchor. Canonical lat/lon er den allerede verifiserte Smalvoll-wayens line-anchor og deklareres bare som displayanker, ikke som geometrisk sentrum for hele elva. Alle delankre leses fra canonical verified_geometry-komponenter; legacy-punktet, nearest/first-hit og syntetisk enkeltgeometri brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex === -1) protocol = `${protocol.trimEnd()}\n\n${entry}`;
  else {
    const lineStart = protocol.lastIndexOf('\n', markerIndex) + 1;
    protocol = `${protocol.slice(0, lineStart)}${entry}${protocol.slice(lineStart)}`;
  }
  fs.writeFileSync(protocolPath, protocol);
}

writeJson(path.join(reportDir, 'batch-157-result.json'), {
  generatedAt: new Date().toISOString(),
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'verified_geometry',
  sourceProvider: 'osm',
  sourceObjectId: child.sourceObjectId,
  displayAnchor: {
    componentId: DISPLAY_ID,
    lat: child.lat,
    lon: child.lon,
    sourceObjectId: child.sourceObjectId,
  },
  anchorCount: anchors.length,
  anchors,
  currentMouth: {
    id: currentMouth.id,
    lat: currentMouth.lat,
    lon: currentMouth.lon,
    sourceObjectId: currentMouth.sourceObjectId,
  },
  historicalOutletMarker: {
    id: outlet.id,
    lat: outlet.lat,
    lon: outlet.lon,
    sourceObjectId: outlet.sourceObjectId,
  },
  before: {
    lat: oldPlace.lat,
    lon: oldPlace.lon,
    r: oldPlace.r,
    coordStatus: oldPlace.coordStatus,
    coordSource: oldPlace.coordSource,
    coordType: oldPlace.coordType,
  },
  after: {
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
  },
  method: 'multi-anchor parent route assembled directly from canonical verified_geometry Alna component records plus the explicit current-mouth anchor nested in batch 156; Smalvoll is display anchor only; no legacy point, nearest/first-hit or synthetic whole-river geometry',
});
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 157 sources – Alnaelva parent route\n\nThe parent route is assembled directly from canonical verified component files:\n\n${anchors.map((anchor) => `- ${anchor.id}: ${anchor.name}${anchor.sourceObjectId ? ` – ${anchor.sourceObjectId}` : ''}`).join('\n')}\n\nSmalvoll is used only as the declared display anchor. The current hydrological mouth at Kongshavn and the historical Vannspeilet marker remain separate roles. No legacy parent coordinate, nearest/first-hit selection or synthetic whole-river geometry is used.\n`);

console.log(JSON.stringify({
  status: 'applied',
  batch: BATCH,
  placeId: PLACE_ID,
  displayAnchor: { id: DISPLAY_ID, lat: child.lat, lon: child.lon },
  anchorCount: anchors.length,
  currentMouthId: currentMouth.id,
  historicalMarkerId: outlet.id,
}, null, 2));
