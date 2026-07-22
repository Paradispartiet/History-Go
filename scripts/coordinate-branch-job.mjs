#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 141;
const date = '2026-07-22';
const placeId = 'noklevann_ljanselva_start';
const newName = 'Nøklevann – utløp mot Skraperudbekken';

const lakeRelationId = 16661;
const lakeBoundaryWayId = 89296578;
const damWayId = 150774536;
const streamWayId = 127882479;
const topologyNodeId = 1636570783;
const sourceObjectId = `osm-node:${topologyNodeId}`;
const sourceUrl = `https://www.openstreetmap.org/node/${topologyNodeId}`;

const aggregateFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json');
const childFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/noklevann_ljanselva_start.json');
const indexFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_index.json');
const manifestFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_manifest.json');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/natur/noklevann_ljanselva_start.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-141-noklevann-outflow-topology');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const endpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function runOverpass(query, label, reportName) {
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const url = `${endpoint}?data=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'History-Go-coordinate-audit/1.0',
        },
      });
      if (!response.ok) {
        lastError = new Error(`${label}: ${endpoint} svarte HTTP ${response.status}`);
        continue;
      }
      const payload = await response.json();
      writeJson(path.join(reportDir, reportName), { endpoint, payload });
      return { endpoint, payload };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(`${label}: alle Overpass-endepunkter feilet`);
}

const relationQuery = `[out:json][timeout:25];relation(${lakeRelationId});out body;`;
const waysQuery = `[out:json][timeout:25];way(${lakeBoundaryWayId});way(${damWayId});way(${streamWayId});out body geom;`;
const nodeQuery = `[out:json][timeout:25];node(${topologyNodeId});out body;`;

const relationResult = await runOverpass(relationQuery, 'Nøklevann-relasjon', 'osm-relation-16661.json');
const waysResult = await runOverpass(waysQuery, 'Nøklevann-utløpsobjekter', 'osm-outlet-ways.json');
const nodeResult = await runOverpass(nodeQuery, 'Nøklevann-utløpsnode', 'osm-node-1636570783.json');

const relations = Array.isArray(relationResult.payload?.elements) ? relationResult.payload.elements : [];
const ways = Array.isArray(waysResult.payload?.elements) ? waysResult.payload.elements.filter((element) => element?.type === 'way') : [];
const nodes = Array.isArray(nodeResult.payload?.elements) ? nodeResult.payload.elements.filter((element) => element?.type === 'node') : [];

const lakeRelation = relations.find((element) => element?.type === 'relation' && Number(element.id) === lakeRelationId);
if (!lakeRelation) throw new Error(`Mangler OSM relation ${lakeRelationId}`);
if (lakeRelation?.tags?.name !== 'Nøklevann' || lakeRelation?.tags?.natural !== 'water') {
  throw new Error(`OSM relation ${lakeRelationId} matcher ikke Nøklevann natural=water`);
}
if (!(lakeRelation.members || []).some((member) => member?.type === 'way' && Number(member?.ref) === lakeBoundaryWayId)) {
  throw new Error(`OSM relation ${lakeRelationId} inneholder ikke forventet utløpskant-way ${lakeBoundaryWayId}`);
}

const byId = new Map(ways.map((way) => [Number(way.id), way]));
const lakeWay = byId.get(lakeBoundaryWayId);
const damWay = byId.get(damWayId);
const streamWay = byId.get(streamWayId);
if (!lakeWay || !damWay || !streamWay) throw new Error('Mangler ett eller flere låste OSM-way-objekter');
if (damWay?.tags?.waterway !== 'dam') throw new Error(`OSM way ${damWayId} er ikke waterway=dam`);
if (streamWay?.tags?.waterway !== 'stream' || streamWay?.tags?.name !== 'Skraperudbekken') {
  throw new Error(`OSM way ${streamWayId} er ikke navngitt Skraperudbekken stream`);
}

for (const [label, way] of [['Nøklevann-kant', lakeWay], ['dam', damWay], ['Skraperudbekken', streamWay]]) {
  if (!(way?.nodes || []).includes(topologyNodeId)) throw new Error(`${label} mangler delt node ${topologyNodeId}`);
}

const coordForNode = (way, nodeId) => {
  const index = (way?.nodes || []).indexOf(nodeId);
  if (index < 0) return null;
  const coordinate = way?.geometry?.[index];
  if (!coordinate || !Number.isFinite(Number(coordinate.lat)) || !Number.isFinite(Number(coordinate.lon))) return null;
  return { lat: Number(coordinate.lat), lon: Number(coordinate.lon) };
};

const lakeCoord = coordForNode(lakeWay, topologyNodeId);
const damCoord = coordForNode(damWay, topologyNodeId);
const streamCoord = coordForNode(streamWay, topologyNodeId);
const node = nodes.find((element) => Number(element.id) === topologyNodeId);
if (!lakeCoord || !damCoord || !streamCoord || !node) throw new Error('Mangler koordinat for delt topologinode');
const nodeCoord = { lat: Number(node.lat), lon: Number(node.lon) };
if (!Number.isFinite(nodeCoord.lat) || !Number.isFinite(nodeCoord.lon)) throw new Error('OSM-node mangler gyldig koordinat');

const sameCoordinate = (a, b) => Math.abs(a.lat - b.lat) < 1e-7 && Math.abs(a.lon - b.lon) < 1e-7;
if (!sameCoordinate(lakeCoord, damCoord) || !sameCoordinate(lakeCoord, streamCoord) || !sameCoordinate(lakeCoord, nodeCoord)) {
  throw new Error(`Delt node ${topologyNodeId} har inkonsistent geometri mellom kildeobjektene`);
}
if (Math.abs(nodeCoord.lat - 59.8736207) > 0.002 || Math.abs(nodeCoord.lon - 10.8582866) > 0.002) {
  throw new Error(`Delt node ${topologyNodeId} har flyttet seg uventet langt fra diagnostisert utløpssone`);
}

const lat = nodeCoord.lat;
const lon = nodeCoord.lon;
const coordNote = `Batch 141 verifiserer Nøklevanns sørvestlige utløp med eksplisitt delt OSM-topologi: Nøklevann relation ${lakeRelationId} inneholder kant-way ${lakeBoundaryWayId}; denne kanten, dam-way ${damWayId} og Skraperudbekken way ${streamWayId} møtes i samme node ${topologyNodeId}. Canonical lat/lon er koordinaten til denne delte hydrologiske knutepunktsnoden. Punktet er derfor ikke et innsjømidtpunkt, nearest-segment eller et påstått direkte startpunkt for hele Ljanselva.`;

const fields = {
  lat,
  lon,
  r: 80,
  locatorType: 'route',
  sourceProvider: 'osm',
  sourceObjectId,
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'line_anchor',
  coordStatus: 'verified_geometry',
  coordSource: `OpenStreetMap relation ${lakeRelationId} (Nøklevann), way ${lakeBoundaryWayId} (lake boundary), way ${damWayId} (dam), way ${streamWayId} (Skraperudbekken), shared node ${topologyNodeId}`,
  coordSourceId: sourceObjectId,
  coordSourceUrl: sourceUrl,
  coordType: 'hydrological_outflow_topology_node',
  coordVerifiedAt: date,
  coordNote,
};

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate) || aggregate.filter((place) => place?.id === placeId).length !== 1) {
  throw new Error(`${placeId} må finnes nøyaktig én gang i aggregate`);
}
const oldPlace = aggregate.find((place) => place?.id === placeId);
const updatedAggregate = aggregate.map((place) => {
  if (place?.id !== placeId) return place;
  const natureProfile = place?.nature_profile && typeof place.nature_profile === 'object' ? { ...place.nature_profile } : {};
  natureProfile.type = 'skogssjø / utløpssone / vassdragskobling';
  natureProfile.title = 'Fra Nøklevann til Skraperudbekken';
  natureProfile.summary = 'Stoppet ligger ved Nøklevanns sørvestlige utløp, der vannet går gjennom den kartfestede dam- og utløpssonen og videre som Skraperudbekken mot Skraperudtjern. Punktet gjør overgangen fra innsjø til bekk lesbar uten å påstå at hele Ljanselva begynner direkte i Nøklevann.';
  natureProfile.themes = [
    'skogssjø i Østmarka',
    'eksplisitt utløpssone ved Nøklevann',
    'overgangen fra innsjø til Skraperudbekken',
    'damstruktur og hydrologisk knutepunkt',
    'vannets vei mot Skraperudtjern',
    'sammenhengen videre i Ljanselvvassdraget',
  ];
  return {
    ...place,
    name: newName,
    desc: 'Utløpspunkt fra Nøklevann der vannet går videre som Skraperudbekken mot Skraperudtjern og videre inn i Ljanselvvassdraget.',
    sourceHint: 'Koordinaten er den eksplisitte delte OSM-noden mellom Nøklevanns vanngeometri, damstrukturen og Skraperudbekken.',
    popupDesc: 'Ved sørvestenden av Nøklevann ligger det konkrete utløpspunktet der innsjøens kartgeometri, damstrukturen og Skraperudbekken møtes i samme topologiske node. Herfra går vannet videre mot Skraperudtjern og inn i resten av Ljanselvvassdraget. History Go modellerer derfor dette stoppet som Nøklevanns dokumenterte utløp mot Skraperudbekken, ikke som et vilkårlig punkt på vannflaten eller som et påstått direkte startpunkt for hele Ljanselva.',
    nature_profile: natureProfile,
    ...fields,
  };
});
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error(`${placeId} mangler i split-index`);
Object.assign(indexRow, {
  name: newName,
  lat,
  lon,
  r: fields.r,
  coordStatus: fields.coordStatus,
  coordType: fields.coordType,
  locatorType: fields.locatorType,
  sourceProvider: fields.sourceProvider,
  sourceObjectId: fields.sourceObjectId,
  geocodeAccuracy: fields.geocodeAccuracy,
  coordRole: fields.coordRole,
  coordSource: fields.coordSource,
  coordSourceId: fields.coordSourceId,
  coordSourceUrl: fields.coordSourceUrl,
  coordVerifiedAt: fields.coordVerifiedAt,
  coordNote: fields.coordNote,
});
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error(`${placeId} mangler i split-manifest`);
manifestRow.name = newName;
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat,
    lon,
    r: fields.r,
    coordStatus: fields.coordStatus,
    coordSource: fields.coordSource,
    coordType: fields.coordType,
    coordNote,
  },
  identity: {
    currentName: newName,
    resolvedIdentity: 'Nøklevanns sørvestlige utløpspunkt mot Skraperudbekken',
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
      sourceName: `OpenStreetMap relation ${lakeRelationId} – Nøklevann`,
      sourceUrl: `https://www.openstreetmap.org/relation/${lakeRelationId}`,
      sourceObjectId: `osm-relation:${lakeRelationId}`,
      sourceQuality: 'exact_named_lake_identity',
      finding: `Nøklevann er eksakt natural=water relation ${lakeRelationId}, og utløpskanten inkluderer way ${lakeBoundaryWayId}.`,
      canVerifyCoordinate: false,
      reason: 'Innsjøidentiteten avgrenser parent-geometrien, men utløpspunktet verifiseres av den delte topologinoden.',
    },
    {
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap way ${damWayId} – utløpsdam`,
      sourceUrl: `https://www.openstreetmap.org/way/${damWayId}`,
      sourceObjectId: `osm-way:${damWayId}`,
      sourceQuality: 'exact_outlet_structure',
      finding: `Dam-way ${damWayId} deler node ${topologyNodeId} med både Nøklevanns kantgeometri og Skraperudbekken.`,
      canVerifyCoordinate: true,
      reason: 'Dokumenterer fysisk utløpsstruktur i samme topologiske knutepunkt.',
    },
    {
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap way ${streamWayId} – Skraperudbekken`,
      sourceUrl: `https://www.openstreetmap.org/way/${streamWayId}`,
      sourceObjectId: `osm-way:${streamWayId}`,
      sourceQuality: 'exact_named_downstream_waterway',
      finding: `Skraperudbekken way ${streamWayId} begynner i den delte node ${topologyNodeId}.`,
      canVerifyCoordinate: true,
      reason: 'Knytter innsjøens utløpspunkt direkte til det navngitte nedstrøms bekkeløpet.',
    },
    {
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap node ${topologyNodeId} – delt hydrologisk topologinode`,
      sourceUrl,
      sourceObjectId,
      sourceQuality: 'explicit_shared_topology_node',
      finding: `Node ${topologyNodeId} på ${lat}, ${lon} deles av Nøklevanns utløpskant, dammen og Skraperudbekken.`,
      canVerifyCoordinate: true,
      reason: 'Gir ett eksplisitt fysisk og maskinsporbar utløpsanker uten nearest-/proxy-logikk.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: `osm-relation:${lakeRelationId}`, canApplyToPlace: false },
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${damWayId}`, canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${streamWayId}`, canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true },
  ],
  geometryCandidates: [
    {
      type: 'shared_hydrological_topology_node',
      sourceObjectIds: [`osm-relation:${lakeRelationId}`, `osm-way:${damWayId}`, `osm-way:${streamWayId}`, sourceObjectId],
      lat,
      lon,
      canApplyToPlace: true,
    },
  ],
  coordinateCandidates: [
    { lat, lon, coordRole: 'line_anchor', sourceObjectId, canApplyToPlace: true },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Applied to canonical place as explicit Nøklevann outlet topology anchor.',
  },
  notes: [coordNote],
});

let protocol = fs.readFileSync(protocolFile, 'utf8');
const unresolvedLines = protocol.split('\n').filter((line) => line.includes('`noklevann_ljanselva_start`') && line.includes('| needs_review |'));
if (unresolvedLines.length !== 1) throw new Error(`Forventet én stale unresolved-rad for ${placeId}, fant ${unresolvedLines.length}`);
protocol = protocol.split('\n').filter((line) => line !== unresolvedLines[0]).join('\n');

const currentCountLine = 'Oslo-protokollen dekker nå 377 aktive current `verified*` canonical Oslo-steder: 297 i den historiske batchtabellen og 75 i den retrospektive current-sett-tabellen. Batch 121 fullfører `places/sport/europa/norway/oslo_sport.json`: elleve steder får eksakt navngitt sportsgeometri, mens fire brede eller uavklarte arenaidentiteter avsluttes som needs_review uten proxy-gjetting.';
if (!protocol.includes(currentCountLine)) throw new Error('Fant ikke forventet Oslo-statuslinje for count-synk');
protocol = protocol.replace(currentCountLine, 'Oslo-protokollen dekker nå 378 aktive current `verified*` canonical Oslo-steder.');
protocol = protocol.replace('Sist oppdatert: 2026-07-21', `Sist oppdatert: ${date}`);

if (!protocol.includes(`| ${batch} | \`${placeId}\` |`)) {
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batchinnsetting');
  const insertion = `| ${batch} | \`${placeId}\` | ${newName} | verified_geometry | \`${sourceObjectId}\` |\n\nBatch ${batch} (${date}) løser \`${placeId}\` som et eksplisitt hydrologisk utløpsanker i stedet for et vilkårlig innsjøpunkt. OSM relation ${lakeRelationId} identifiserer Nøklevann; utløpskant-way ${lakeBoundaryWayId}, dam-way ${damWayId} og Skraperudbekken-way ${streamWayId} deler node ${topologyNodeId} på \`${lat}, ${lon}\`. Visningsnavnet korrigeres fra «Nøklevann (Ljanselva start)» til «${newName}» fordi canonical punkt nå representerer den dokumenterte overgangen fra Nøklevann til Skraperudbekken, ikke et påstått direkte startpunkt for hele Ljanselva.\n\n`;
  protocol = protocol.replace(marker, insertion + marker);
}
fs.writeFileSync(protocolFile, protocol);

writeJson(path.join(reportDir, 'batch-141-result.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  name: newName,
  sourceObjectId,
  lakeRelationId,
  lakeBoundaryWayId,
  damWayId,
  streamWayId,
  topologyNodeId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
  status: fields.coordStatus,
  method: 'explicit_shared_hydrological_topology_node',
});

fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 141 source chain\n\n- OSM relation ${lakeRelationId}: exact Nøklevann water identity.\n- OSM way ${lakeBoundaryWayId}: Nøklevann boundary member at the outlet.\n- OSM way ${damWayId}: outlet dam structure.\n- OSM way ${streamWayId}: named Skraperudbekken segment.\n- OSM node ${topologyNodeId}: exact node shared by lake boundary, dam and Skraperudbekken at ${lat}, ${lon}.\n- Canonical point is the explicit shared topology node; no lake-center, nearest-segment or generic route-start proxy is used.\n`);

console.log(JSON.stringify({
  batch,
  placeId,
  name: newName,
  sourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
  status: fields.coordStatus,
  method: 'explicit_shared_hydrological_topology_node',
}, null, 2));
