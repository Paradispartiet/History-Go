import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 142;
const PLACE_ID = 'ljanselva_skullerud';
const OSM_WAY_ID = 27271638;
const VERIFIED_AT = '2026-07-22';

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_skullerud.json');
const splitIndexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_index.json');
const splitManifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/ljanselva_skullerud.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const priorCandidatePath = path.join(ROOT, 'reports/oslo-coordinate-control-batch-112-ljanselva-route/nominatim-ljanselva_skullerud.json');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-142-ljanselva-skullerud-segment');

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

function haversineMeters(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function lineMidpoint(points) {
  if (!Array.isArray(points) || points.length < 2) {
    throw new Error('OSM-way mangler nok punkter til å beregne linjeanker');
  }
  const segments = [];
  let totalLengthM = 0;
  for (let i = 1; i < points.length; i += 1) {
    const lengthM = haversineMeters(points[i - 1], points[i]);
    segments.push({ a: points[i - 1], b: points[i], lengthM });
    totalLengthM += lengthM;
  }
  const target = totalLengthM / 2;
  let walked = 0;
  for (const segment of segments) {
    if (walked + segment.lengthM >= target) {
      const fraction = segment.lengthM === 0 ? 0 : (target - walked) / segment.lengthM;
      return {
        lat: Number((segment.a.lat + (segment.b.lat - segment.a.lat) * fraction).toFixed(7)),
        lon: Number((segment.a.lon + (segment.b.lon - segment.a.lon) * fraction).toFixed(7)),
        totalLengthM: Number(totalLengthM.toFixed(1)),
        fractionAlongLine: 0.5,
      };
    }
    walked += segment.lengthM;
  }
  const last = points.at(-1);
  return {
    lat: Number(last.lat.toFixed(7)),
    lon: Number(last.lon.toFixed(7)),
    totalLengthM: Number(totalLengthM.toFixed(1)),
    fractionAlongLine: 1,
  };
}

function bboxContains(bbox, lat, lon) {
  if (!Array.isArray(bbox) || bbox.length !== 4) return false;
  const [south, north, west, east] = bbox.map(Number);
  return lat >= south && lat <= north && lon >= west && lon <= east;
}

function updatePlaceRecord(place, anchor) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID} i forventet record`);
  return {
    ...place,
    lat: anchor.lat,
    lon: anchor.lon,
    sourceHint: 'Koordinaten er lengdemidtpunktet på eksakt OSM way 27271638, Ljanselva / Skullerudbekken, valgt innenfor den allerede avgrensede Skullerud-strekningen.',
    coordType: 'river_segment_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 27271638 – Ljanselva / Skullerudbekken',
    coordVerifiedAt: VERIFIED_AT,
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:27271638',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordSourceId: 'osm-way:27271638',
    coordSourceUrl: 'https://www.openstreetmap.org/way/27271638',
    coordNote: 'Batch 142 verifiserer den lokale Ljanselva-strekningen ved Skullerud med eksakt OSM way 27271638. Batch 112 fant fem eksakt navngitte Ljanselva-segmenter i den forhåndsdefinerte lokale scope-boksen; way 27271638 er det eneste kandidatsegmentet hvis geometri omslutter recordens eksisterende Skullerud-markør, og way-en har i tillegg alternativnavnet Skullerudbekken. Legacy-punktet brukes bare til å løse hvilken kildegeometri den allerede definerte place-identiteten viser til, ikke som koordinatbevis. Canonical lat/lon er beregnet som lengdemidtpunkt langs selve OSM-geometrien, uten nearest/first-hit-logikk.',
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
  if (!response.ok) throw new Error(`Kildeoppslag feilet ${response.status} for ${url}`);
  return response.text();
}

fs.mkdirSync(reportDir, { recursive: true });

const aggregateBefore = readJson(aggregatePath);
const aggregateOld = aggregateBefore.find((place) => place?.id === PLACE_ID);
if (!aggregateOld) throw new Error(`Mangler ${PLACE_ID} i aggregate-filen`);
const legacyCoordinate = { lat: aggregateOld.lat, lon: aggregateOld.lon };

const priorCandidates = readJson(priorCandidatePath);
const exactRiverCandidates = (priorCandidates.results || []).filter((candidate) =>
  candidate?.name === 'Ljanselva'
  && candidate?.category === 'waterway'
  && candidate?.type === 'river'
);
const candidateAnalysis = exactRiverCandidates.map((candidate) => ({
  osmType: candidate.osm_type,
  osmId: candidate.osm_id,
  name: candidate.name,
  altName: candidate.namedetails?.alt_name || null,
  displayName: candidate.display_name,
  boundingbox: candidate.boundingbox,
  containsLegacyScopePoint: bboxContains(candidate.boundingbox, legacyCoordinate.lat, legacyCoordinate.lon),
}));
const containing = candidateAnalysis.filter((candidate) => candidate.containsLegacyScopePoint);
if (containing.length !== 1 || Number(containing[0].osmId) !== OSM_WAY_ID) {
  throw new Error(`Skullerud-disambiguering endret: forventet kun OSM way ${OSM_WAY_ID} rundt eksisterende scopepunkt, fikk ${JSON.stringify(containing)}`);
}

const osmUrl = `https://api.openstreetmap.org/api/0.6/way/${OSM_WAY_ID}/full`;
const osmXml = await fetchText(osmUrl);
fs.writeFileSync(path.join(reportDir, `osm-way-${OSM_WAY_ID}-full.xml`), osmXml);

const nodeMap = new Map();
for (const match of osmXml.matchAll(/<node\b[^>]*>/g)) {
  const a = attrs(match[0]);
  if (a.id && a.lat && a.lon) {
    nodeMap.set(String(a.id), { lat: Number(a.lat), lon: Number(a.lon) });
  }
}
const wayMatch = osmXml.match(new RegExp(`<way\\b[^>]*\\bid="${OSM_WAY_ID}"[^>]*>([\\s\\S]*?)<\\/way>`));
if (!wayMatch) throw new Error(`Fant ikke OSM way ${OSM_WAY_ID} i råkilden`);
const wayBody = wayMatch[1];
const tags = {};
for (const match of wayBody.matchAll(/<tag\b[^>]*\/>/g)) {
  const a = attrs(match[0]);
  if (a.k) tags[a.k] = a.v ?? '';
}
const nodeRefs = [...wayBody.matchAll(/<nd\b[^>]*\/>/g)].map((match) => attrs(match[0]).ref).filter(Boolean);
const linePoints = nodeRefs.map((ref) => nodeMap.get(String(ref))).filter(Boolean);

if (tags.name !== 'Ljanselva') throw new Error(`OSM way ${OSM_WAY_ID} har uventet navn: ${tags.name}`);
if (tags.waterway !== 'river') throw new Error(`OSM way ${OSM_WAY_ID} har uventet waterway-type: ${tags.waterway}`);
if (!String(tags.alt_name || '').split(';').map((v) => v.trim()).includes('Skullerudbekken')) {
  throw new Error(`OSM way ${OSM_WAY_ID} mangler forventet alternativnavn Skullerudbekken`);
}
if (linePoints.length !== nodeRefs.length || linePoints.length < 2) {
  throw new Error(`Kunne ikke rekonstruere full geometri for OSM way ${OSM_WAY_ID}`);
}

const anchor = lineMidpoint(linePoints);
const newFields = updatePlaceRecord(aggregateOld, anchor);

const aggregateAfter = aggregateBefore.map((place) => place?.id === PLACE_ID ? newFields : place);
writeJson(aggregatePath, aggregateAfter);

const childBefore = readJson(childPath);
const nearbyBefore = childBefore?.nature_profile?.nearby_place_ids || [];
const childAfter = updatePlaceRecord(childBefore, anchor);
writeJson(childPath, childAfter);

const splitIndex = readJson(splitIndexPath);
let indexUpdated = false;
for (const row of splitIndex) {
  if (row?.id !== PLACE_ID) continue;
  Object.assign(row, {
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
  indexUpdated = true;
}
if (!indexUpdated) throw new Error(`Mangler ${PLACE_ID} i split-index`);
writeJson(splitIndexPath, splitIndex);

const splitManifest = readJson(splitManifestPath);
splitManifest.source_sha256 = sha256(aggregatePath);
splitManifest.generated_at = new Date().toISOString();
const manifestRow = splitManifest.places?.find((row) => row?.id === PLACE_ID);
if (!manifestRow) throw new Error(`Mangler ${PLACE_ID} i split-manifest`);
manifestRow.sha256 = sha256(childPath);
writeJson(splitManifestPath, splitManifest);

const evidence = {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: anchor.lat,
    lon: anchor.lon,
    r: childAfter.r,
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 27271638 – Ljanselva / Skullerudbekken',
    coordType: 'river_segment_anchor',
    coordNote: childAfter.coordNote,
  },
  identity: {
    currentName: childAfter.name,
    resolvedIdentity: 'Den konkrete lokale Ljanselva-/Skullerudbekken-strekningen som OSM way 27271638 representerer ved Skullerud',
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
      sourceName: 'OpenStreetMap – Ljanselva / Skullerudbekken ved Skullerud',
      sourceUrl: 'https://www.openstreetmap.org/way/27271638',
      sourceObjectId: 'osm-way:27271638',
      sourceQuality: 'exact_named_waterway_segment_with_scope_disambiguation',
      finding: `Way 27271638 er navngitt Ljanselva, har alternativnavnet Skullerudbekken og er det eneste av de fem eksakte batch-112-kandidatsegmentene hvis geometri omslutter recordens eksisterende Skullerud-scopepunkt. Det nye kartankeret er beregnet fra way-geometrien selv (${anchor.totalLengthM} m linjelengde).`,
      canVerifyCoordinate: true,
      reason: 'Eksakt navngitt fysisk vannveisgeometri med stabil OSM-id; legacy-punktet brukes bare til å velge riktig forhåndsdefinerte lokale place-scope, mens canonical lat/lon beregnes fra kildegeometrien.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Store norske leksikon – Ljanselva',
      sourceUrl: 'https://snl.no/Ljanselva',
      sourceObjectId: 'snl:ljanselva',
      sourceQuality: 'documented_river_identity',
      finding: 'Kilden kryssjekker Ljanselva som vassdragsidentitet; koordinaten verifiseres av OSM-geometrien, ikke av artikkelen.',
      canVerifyCoordinate: false,
      reason: 'Brukes til identitetskryssjekk, ikke punkt- eller linjegeometri.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:27271638',
      canApplyToPlace: true,
    },
    {
      sourceProvider: 'manual_research',
      sourceObjectId: 'snl:ljanselva',
      canApplyToPlace: false,
    },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:27271638',
      lat: anchor.lat,
      lon: anchor.lon,
      coordRole: 'line_anchor',
      geometryType: 'LineString',
      lineLengthM: anchor.totalLengthM,
      canApplyToPlace: true,
    },
  ],
  coordinateCandidates: [
    {
      lat: anchor.lat,
      lon: anchor.lon,
      coordRole: 'line_anchor',
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Kildekontrakt og line_anchor er anvendt på canonical place.',
  },
  notes: [
    childAfter.coordNote,
  ],
};
writeJson(evidencePath, evidence);

let protocol = fs.readFileSync(protocolPath, 'utf8');
const needsReviewPattern = /^\| `ljanselva_skullerud` – Ljanselva ved Skullerud \| needs_review \|.*\n/m;
if (!needsReviewPattern.test(protocol)) {
  throw new Error('Fant ikke eksisterende needs_review-rad for ljanselva_skullerud i protokollen');
}
protocol = protocol.replace(needsReviewPattern, '');
const batch141Paragraph = 'Batch 141 (2026-07-22) løser `noklevann_ljanselva_start` som et eksplisitt hydrologisk utløpsanker i stedet for et vilkårlig innsjøpunkt. OSM relation 16661 identifiserer Nøklevann; utløpskant-way 89296578, dam-way 150774536 og Skraperudbekken-way 127882479 deler node 1636570783 på `59.8736207, 10.8582866`. Visningsnavnet korrigeres fra «Nøklevann (Ljanselva start)» til «Nøklevann – utløp mot Skraperudbekken» fordi canonical punkt representerer den dokumenterte overgangen fra Nøklevann til Skraperudbekken, ikke et påstått direkte startpunkt for hele Ljanselva.';
if (!protocol.includes(batch141Paragraph)) {
  throw new Error('Fant ikke batch 141-ankeret i coordinate-control-protocol.md');
}
const batch142Block = `\n\n| 142 | \`${PLACE_ID}\` | Ljanselva ved Skullerud | verified_geometry | \`osm-way:${OSM_WAY_ID}\` |\n\nBatch 142 (${VERIFIED_AT}) løser \`${PLACE_ID}\` som et eksplisitt line_anchor på OSM way ${OSM_WAY_ID}. Batch 112 fant fem eksakt navngitte Ljanselva-segmenter i den forhåndsdefinerte lokale Skullerud-scope-boksen. Way ${OSM_WAY_ID} er det eneste av disse kandidatsegmentene hvis geometri omslutter recordens eksisterende lokale Skullerud-markør, og way-en har i tillegg alternativnavnet \`Skullerudbekken\`. Legacy-punktet brukes bare til identitets- og scope-disambiguering, ikke som koordinatbevis. Canonical lat/lon beregnes som lengdemidtpunkt langs selve OSM-geometrien og lagres som \`semantic_anchor\` / \`line_anchor\`; ingen nearest/first-hit-logikk brukes.`;
protocol = protocol.replace(batch141Paragraph, `${batch141Paragraph}${batch142Block}`);
fs.writeFileSync(protocolPath, protocol);

writeJson(path.join(reportDir, 'candidate-analysis.json'), {
  generatedAt: new Date().toISOString(),
  batch: BATCH,
  placeId: PLACE_ID,
  legacyScopePoint: legacyCoordinate,
  priorCandidateSource: 'reports/oslo-coordinate-control-batch-112-ljanselva-route/nominatim-ljanselva_skullerud.json',
  exactRiverCandidateCount: candidateAnalysis.length,
  candidates: candidateAnalysis,
  selectionRule: 'Velg den eksakt navngitte Ljanselva-geometrien som samsvarer med den allerede definerte lokale Skullerud-place-scope. Legacy-punktet brukes bare som scope-disambiguering; ny koordinat beregnes fra valgt kildegeometri.',
  selectedSourceObjectId: `osm-way:${OSM_WAY_ID}`,
});

writeJson(path.join(reportDir, 'nearby-links-preservation.json'), {
  placeId: PLACE_ID,
  before: nearbyBefore,
  after: childAfter?.nature_profile?.nearby_place_ids || [],
  unchanged: JSON.stringify(nearbyBefore) === JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || []),
});

writeJson(path.join(reportDir, 'batch-142-result.json'), {
  generatedAt: new Date().toISOString(),
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'verified_geometry',
  sourceProvider: 'osm',
  sourceObjectId: `osm-way:${OSM_WAY_ID}`,
  sourceUrl: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`,
  sourceTags: {
    name: tags.name,
    alt_name: tags.alt_name || null,
    waterway: tags.waterway,
  },
  geometry: {
    type: 'LineString',
    nodeCount: linePoints.length,
    lengthM: anchor.totalLengthM,
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
  method: 'prebounded local scope disambiguation against exact named OSM waterway candidates, then deterministic length-midpoint from selected source geometry; no nearest/first-hit',
});

fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Oslo coordinate control batch 142 – Ljanselva ved Skullerud\n\n- Canonical place: \`${PLACE_ID}\`\n- Valgt kildeobjekt: OSM way ${OSM_WAY_ID} – Ljanselva, alternativnavn Skullerudbekken\n- Råkilde: ${osmUrl}\n- Tidligere kandidatsett: \`reports/oslo-coordinate-control-batch-112-ljanselva-route/nominatim-ljanselva_skullerud.json\`\n- Identitetskryssjekk: https://snl.no/Ljanselva\n\n## Metode\n\nBatch 112 fant fem eksakt navngitte Ljanselva-segmenter i den forhåndsdefinerte lokale scope-boksen og lot derfor stedet stå \`needs_source\`. Batch 142 bruker det eksisterende legacy-punktet bare til å disambiguere hvilken av de fem eksakte kildegeometriene den allerede definerte Skullerud-recorden viser til. Way ${OSM_WAY_ID} er den eneste kandidatens bounding box som omslutter dette scopepunktet, og way-en er i tillegg eksplisitt tagget med alternativnavnet \`Skullerudbekken\`.\n\nDet nye canonical kartankeret er ikke legacy-punktet og ikke et nearest/first-hit-resultat. Det beregnes deterministisk som lengdemidtpunkt langs den fullstendige OSM way-geometrien og lagres som \`verified_geometry\`, \`semantic_anchor\` og \`line_anchor\`.\n`);

console.log(JSON.stringify({
  batch: BATCH,
  placeId: PLACE_ID,
  sourceObjectId: `osm-way:${OSM_WAY_ID}`,
  anchor,
  exactCandidateCount: candidateAnalysis.length,
  nearbyLinksPreserved: JSON.stringify(nearbyBefore) === JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || []),
}, null, 2));
