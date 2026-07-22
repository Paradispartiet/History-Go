import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 148;
const PLACE_ID = 'ljanselva';
const VERIFIED_AT = '2026-07-22';
const DISPLAY_ANCHOR_ID = 'ljanselva_hauketo';

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_hovedsteder.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_hovedsteder/ljanselva.json');
const splitIndexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_hovedsteder_index.json');
const splitManifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_hovedsteder_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/ljanselva.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-148-ljanselva-multi-anchor-route');

const anchorSpecs = [
  {
    id: 'noklevann_ljanselva_start',
    file: 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/noklevann_ljanselva_start.json',
    expectedSourceObjectId: 'osm-node:1636570783',
    type: 'hydrological_outflow_anchor',
    role: 'upper_context_anchor',
  },
  {
    id: 'skraperudtjern',
    file: 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/skraperudtjern.json',
    expectedSourceObjectId: 'osm-way:23761672',
    type: 'area_anchor',
    role: 'upper_context_anchor',
  },
  {
    id: 'ljanselva_skullerud',
    file: 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_skullerud.json',
    expectedSourceObjectId: 'osm-way:27271638',
    type: 'line_anchor',
    role: 'river_segment_anchor',
  },
  {
    id: 'ljanselva_hauketo',
    file: 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_hauketo.json',
    expectedSourceObjectId: 'osm-way:695993872',
    type: 'line_anchor',
    role: 'display_anchor',
  },
  {
    id: 'ljanselva_ljan',
    file: 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_ljan.json',
    expectedSourceObjectId: 'osm-way:98539575',
    type: 'line_anchor',
    role: 'river_segment_anchor',
  },
  {
    id: 'ljanselva_fiskevollen',
    file: 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_fiskevollen.json',
    expectedSourceObjectId: 'osm-way:156700580',
    type: 'line_anchor',
    role: 'lower_corridor_anchor',
  },
  {
    id: 'ljanselva_bunnefjorden',
    file: 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_bunnefjorden.json',
    expectedSourceObjectId: 'osm-node:1689201164',
    type: 'mouth_anchor',
    role: 'mouth_anchor',
  },
];

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

fs.mkdirSync(reportDir, { recursive: true });

const anchors = anchorSpecs.map((spec) => {
  const place = readJson(path.join(ROOT, spec.file));
  if (place.id !== spec.id) throw new Error(`Feil place-id i ${spec.file}: ${place.id}`);
  if (place.coordStatus !== 'verified_geometry') {
    throw new Error(`${spec.id} er ikke verified_geometry: ${place.coordStatus}`);
  }
  if (place.sourceObjectId !== spec.expectedSourceObjectId) {
    throw new Error(`${spec.id} har uventet sourceObjectId: ${place.sourceObjectId}`);
  }
  if (!Number.isFinite(place.lat) || !Number.isFinite(place.lon)) {
    throw new Error(`${spec.id} mangler gyldig lat/lon`);
  }
  return {
    id: place.id,
    name: place.name,
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    type: spec.type,
    role: spec.role,
    coordStatus: place.coordStatus,
    sourceProvider: place.sourceProvider,
    sourceObjectId: place.sourceObjectId,
    sourceUrl: place.coordSourceUrl || null,
    note: place.coordNote || place.sourceHint || '',
  };
});

const displayAnchor = anchors.find((anchor) => anchor.id === DISPLAY_ANCHOR_ID);
if (!displayAnchor) throw new Error(`Mangler display-anchor ${DISPLAY_ANCHOR_ID}`);
const sourceObjectChain = anchors.map((anchor) => anchor.sourceObjectId);

function updatePlaceRecord(place) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    lat: displayAnchor.lat,
    lon: displayAnchor.lon,
    sourceHint: 'Hovedstedet modelleres som en verifisert multi-anchor vassdragskjede fra Nøklevann/Skraperud-systemet gjennom de dokumenterte Ljanselva-strekningene til munningsnoden i Fiskevollbukta. Hauketo-wayen brukes kun som sentralt displayanker.',
    coordType: 'multi_anchor_route_display_anchor',
    coordStatus: 'verified_geometry',
    coordSource: `Verifisert Ljanselva multi-anchor chain; display-anchor OpenStreetMap way 695993872 – Ljanselva ved Hauketo; anchors: ${sourceObjectChain.join(', ')}`,
    coordVerifiedAt: VERIFIED_AT,
    sourceProvider: 'osm',
    sourceObjectId: displayAnchor.sourceObjectId,
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordSourceId: displayAnchor.sourceObjectId,
    coordSourceUrl: displayAnchor.sourceUrl,
    coordNote: 'Batch 148 løser hovedrecorden Ljanselva som et eksplisitt multi-anchor vassdrag i stedet for å late som ett punkt eller én OSM-way representerer hele elva. Scope dokumenteres av sju allerede verified_geometry-ankre: Nøklevanns utløp, Skraperudtjern, Skullerud-segmentet, Hauketo-segmentet, Liadalen/Ljan-segmentet, den nedre Fiskevollen-korridoren og munningsnoden i Fiskevollbukta. Canonical lat/lon er Hauketo-segmentets verifiserte line-anchor fordi det ligger sentralt i den modellerte kjeden; punktet er bare displayanker og ikke et påstått geometrisk sentrum for hele vassdraget. Ingen legacy-koordinat, nearest/first-hit eller syntetisk enkeltgeometri brukes.',
    anchors,
  };
}

const aggregateBefore = readJson(aggregatePath);
if (!Array.isArray(aggregateBefore)) throw new Error('Hovedsteder-aggregate er ikke et array');
const aggregateOld = aggregateBefore.find((place) => place?.id === PLACE_ID);
if (!aggregateOld) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
writeJson(aggregatePath, aggregateBefore.map((place) =>
  place?.id === PLACE_ID ? updatePlaceRecord(place) : place));

const childBefore = readJson(childPath);
const childAfter = updatePlaceRecord(childBefore);
writeJson(childPath, childAfter);

const splitIndex = readJson(splitIndexPath);
const indexRow = splitIndex.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error(`Mangler ${PLACE_ID} i split-index`);
Object.assign(indexRow, {
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
manifestRow.sha256 = sha256(childPath);
writeJson(splitManifestPath, splitManifest);

writeJson(evidencePath, {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_hovedsteder.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: childAfter.lat,
    lon: childAfter.lon,
    r: childAfter.r,
    coordStatus: childAfter.coordStatus,
    coordSource: childAfter.coordSource,
    coordType: childAfter.coordType,
    coordNote: childAfter.coordNote,
  },
  identity: {
    currentName: childAfter.name,
    resolvedIdentity: 'Ljanselva som sammenhengende marka–fjord-vassdrag modellert med en verifisert multi-anchor-kjede',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'route',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Ljanselva',
      sourceUrl: 'https://oslobyleksikon.no/side/Ljanselva',
      sourceObjectId: 'oslobyleksikon:ljanselva',
      sourceQuality: 'documented_whole_river_identity',
      finding: 'Kilden dokumenterer Ljanselva som vassdrag fra Østmarka-systemet til munningen i Fiskevollbukta og forklarer den kulverterte nederste delen.',
      canVerifyCoordinate: false,
      reason: 'Fastsetter hovedidentiteten og hele vassdragsscope; de konkrete koordinatene kommer fra de verifiserte delankrene.',
    },
    ...anchors.map((anchor) => ({
      sourceProvider: anchor.sourceProvider || 'osm',
      sourceName: `Verifisert ruteanker – ${anchor.name}`,
      sourceUrl: anchor.sourceUrl || '',
      sourceObjectId: anchor.sourceObjectId,
      sourceQuality: `verified_component_${anchor.role}`,
      finding: `${anchor.id} er et allerede verifisert komponentanker i Ljanselva-kjeden med coordStatus verified_geometry.`,
      canVerifyCoordinate: anchor.id === DISPLAY_ANCHOR_ID,
      reason: anchor.id === DISPLAY_ANCHOR_ID
        ? 'Dette verifiserte line-ankeret brukes som canonical display-marker for hovedrecorden; resten av scope dokumenteres av hele anchor-kjeden.'
        : 'Komponentankeret dokumenterer fysisk scope for hovedvassdraget, men brukes ikke alene som canonical display-marker.',
    })),
  ],
  addressCandidates: [],
  sourceObjectCandidates: anchors.map((anchor) => ({
    sourceProvider: anchor.sourceProvider || 'osm',
    sourceObjectId: anchor.sourceObjectId,
    canApplyToPlace: true,
  })),
  geometryCandidates: anchors.map((anchor) => ({
    sourceProvider: anchor.sourceProvider || 'osm',
    sourceObjectId: anchor.sourceObjectId,
    lat: anchor.lat,
    lon: anchor.lon,
    coordRole: anchor.type === 'area_anchor' ? 'area_anchor' : 'line_anchor',
    componentRole: anchor.role,
    canApplyToPlace: true,
  })),
  coordinateCandidates: [
    {
      lat: displayAnchor.lat,
      lon: displayAnchor.lon,
      coordRole: 'line_anchor',
      sourceObjectId: displayAnchor.sourceObjectId,
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Multi-anchor-kjeden er anvendt på hovedrecorden; Hauketo-wayen brukes som eksplisitt displayanker.',
  },
  notes: [childAfter.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
const needsReviewPattern = /^\| `ljanselva` – Ljanselva \| needs_review \|.*\n/m;
if (!needsReviewPattern.test(protocol)) {
  throw new Error('Fant ikke needs_review-raden for ljanselva');
}
protocol = protocol.replace(needsReviewPattern, '');
const batch147Pattern = /Batch 147 \(2026-07-22\) løser `ljanselva_bunnefjorden`[^\n]*/;
const batch147Match = protocol.match(batch147Pattern);
if (!batch147Match) throw new Error('Fant ikke batch 147-ankeret');
const batch148Block = `\n\n| 148 | \`${PLACE_ID}\` | Ljanselva | verified_geometry | \`osm-way:695993872\` + 6 verifiserte komponentankre |\n\nBatch 148 (${VERIFIED_AT}) løser hovedrecorden \`${PLACE_ID}\` som en eksplisitt multi-anchor vassdragsmodell. Sju allerede \`verified_geometry\`-komponenter dokumenterer kjeden fra Nøklevanns utløp og Skraperudtjern via Skullerud, Hauketo, Liadalen/Ljan og den nedre Fiskevollen-korridoren til munningsnoden i Fiskevollbukta. Hauketo-way ${displayAnchor.sourceObjectId.replace('osm-way:', '')} brukes som sentralt canonical displayanker fordi det er et verifisert punkt på selve elveløpet; det påstås ikke å være geometrisk sentrum for hele vassdraget. Hovedrecordens fysiske scope ligger i den lagrede anchor-kjeden, ikke i ett syntetisk punkt eller én tilfeldig OSM-way. Ingen legacy-koordinat eller nearest/first-hit-logikk brukes.`;
protocol = protocol.replace(batch147Match[0], `${batch147Match[0]}${batch148Block}`);
protocol = protocol.replace(
  /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./,
  (_match, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`,
);
fs.writeFileSync(protocolPath, protocol);

writeJson(path.join(reportDir, 'anchor-chain.json'), {
  generatedAt: new Date().toISOString(),
  batch: BATCH,
  placeId: PLACE_ID,
  displayAnchorId: DISPLAY_ANCHOR_ID,
  displayAnchor,
  anchors,
  sourceObjectChain,
  rule: 'Whole-river scope is represented by the ordered verified component anchor chain. Canonical lat/lon is a declared display anchor on the Hauketo river segment, not a claimed centroid of the full river.',
});

writeJson(path.join(reportDir, 'batch-148-result.json'), {
  generatedAt: new Date().toISOString(),
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'verified_geometry',
  anchorCount: anchors.length,
  sourceObjectChain,
  before: {
    lat: aggregateOld.lat,
    lon: aggregateOld.lon,
    r: aggregateOld.r,
    coordStatus: aggregateOld.coordStatus,
    coordSource: aggregateOld.coordSource,
    coordType: aggregateOld.coordType,
  },
  after: {
    lat: childAfter.lat,
    lon: childAfter.lon,
    r: childAfter.r,
    coordStatus: childAfter.coordStatus,
    coordSource: childAfter.coordSource,
    coordType: childAfter.coordType,
    sourceObjectId: childAfter.sourceObjectId,
    geocodeAccuracy: childAfter.geocodeAccuracy,
    coordRole: childAfter.coordRole,
  },
  method: 'ordered multi-anchor river model assembled exclusively from already verified component places; Hauketo verified line anchor used as declared display marker; no synthetic centroid, legacy point, nearest or first-hit',
});

fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Oslo coordinate control batch 148 – Ljanselva multi-anchor route\n\nHovedrecorden bruker følgende allerede verifiserte komponentankre:\n\n${anchors.map((anchor) => `- \`${anchor.id}\`: \`${anchor.sourceObjectId}\` – ${anchor.name}`).join('\n')}\n\nIdentitetskryssjekk: https://oslobyleksikon.no/side/Ljanselva\n\nCanonical lat/lon er Hauketo-komponentens verifiserte line-anchor. Hele vassdragsscope dokumenteres av anchor-kjeden og reduseres ikke til dette ene punktet.\n`);

console.log(JSON.stringify({
  batch: BATCH,
  placeId: PLACE_ID,
  displayAnchorId: DISPLAY_ANCHOR_ID,
  displayCoordinate: { lat: displayAnchor.lat, lon: displayAnchor.lon },
  anchorCount: anchors.length,
  sourceObjectChain,
}, null, 2));
