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

async function fetchOsmXml(pathname, label, reportName) {
  const urls = [
    `https://api.openstreetmap.org/api/0.6/${pathname}`,
    `https://www.openstreetmap.org/api/0.6/${pathname}`,
  ];
  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1',
          'User-Agent': 'History-Go-coordinate-audit/1.0',
        },
      });
      if (!response.ok) {
        lastError = new Error(`${label}: ${url} svarte HTTP ${response.status}`);
        continue;
      }
      const xml = await response.text();
      fs.writeFileSync(path.join(reportDir, reportName), xml);
      return { url, xml };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(`${label}: alle OSM API-endepunkter feilet`);
}

const decodeXml = (value) => String(value ?? '')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&');

const parseAttrs = (text) => {
  const attrs = {};
  for (const match of String(text).matchAll(/([A-Za-z_:][\w:.-]*)="([^"]*)"/g)) {
    attrs[match[1]] = decodeXml(match[2]);
  }
  return attrs;
};

const extractBlock = (xml, tag, id) => {
  const regex = new RegExp(`<${tag}\\b([^>]*)\\bid="${id}"([^>]*)>([\\s\\S]*?)<\\/${tag}>`);
  const match = String(xml).match(regex);
  if (!match) return null;
  return { attrs: parseAttrs(`${match[1]} id="${id}" ${match[2]}`), body: match[3] };
};

const parseTags = (body) => {
  const tags = {};
  for (const match of String(body).matchAll(/<tag\b([^>]*)\/?\s*>/g)) {
    const attrs = parseAttrs(match[1]);
    if (attrs.k) tags[attrs.k] = attrs.v ?? '';
  }
  return tags;
};

const parseMembers = (body) => [...String(body).matchAll(/<member\b([^>]*)\/?\s*>/g)].map((match) => parseAttrs(match[1]));
const parseNdRefs = (body) => [...String(body).matchAll(/<nd\b([^>]*)\/?\s*>/g)].map((match) => Number(parseAttrs(match[1]).ref)).filter(Number.isFinite);

const parseNode = (xml, id) => {
  const regex = new RegExp(`<node\\b([^>]*)\\bid="${id}"([^>]*)[\\s\\S]*?(?:<\\/node>|\\/>)`);
  const match = String(xml).match(regex);
  if (!match) return null;
  const attrs = parseAttrs(`${match[1]} id="${id}" ${match[2]}`);
  return { id: Number(id), lat: Number(attrs.lat), lon: Number(attrs.lon) };
};

const relationResult = await fetchOsmXml(`relation/${lakeRelationId}`, 'Nøklevann-relasjon', 'osm-relation-16661.xml');
const lakeWayResult = await fetchOsmXml(`way/${lakeBoundaryWayId}/full`, 'Nøklevann-utløpskant', 'osm-way-89296578-full.xml');
const damWayResult = await fetchOsmXml(`way/${damWayId}/full`, 'Nøklevann-utløpsdam', 'osm-way-150774536-full.xml');
const streamWayResult = await fetchOsmXml(`way/${streamWayId}/full`, 'Skraperudbekken', 'osm-way-127882479-full.xml');
const nodeResult = await fetchOsmXml(`node/${topologyNodeId}`, 'Nøklevann-utløpsnode', 'osm-node-1636570783.xml');

const relation = extractBlock(relationResult.xml, 'relation', lakeRelationId);
const lakeWay = extractBlock(lakeWayResult.xml, 'way', lakeBoundaryWayId);
const damWay = extractBlock(damWayResult.xml, 'way', damWayId);
const streamWay = extractBlock(streamWayResult.xml, 'way', streamWayId);
const node = parseNode(nodeResult.xml, topologyNodeId);
if (!relation || !lakeWay || !damWay || !streamWay || !node) throw new Error('Mangler ett eller flere låste OSM-objekter');

const relationTags = parseTags(relation.body);
if (relationTags.name !== 'Nøklevann' || relationTags.natural !== 'water') {
  throw new Error(`OSM relation ${lakeRelationId} matcher ikke Nøklevann natural=water`);
}
const relationMembers = parseMembers(relation.body);
if (!relationMembers.some((member) => member.type === 'way' && Number(member.ref) === lakeBoundaryWayId)) {
  throw new Error(`OSM relation ${lakeRelationId} inneholder ikke utløpskant-way ${lakeBoundaryWayId}`);
}

const lakeNodes = parseNdRefs(lakeWay.body);
const damNodes = parseNdRefs(damWay.body);
const streamNodes = parseNdRefs(streamWay.body);
const damTags = parseTags(damWay.body);
const streamTags = parseTags(streamWay.body);
if (damTags.waterway !== 'dam') throw new Error(`OSM way ${damWayId} er ikke waterway=dam`);
if (streamTags.waterway !== 'stream' || streamTags.name !== 'Skraperudbekken') {
  throw new Error(`OSM way ${streamWayId} er ikke navngitt Skraperudbekken stream`);
}
for (const [label, nodeIds] of [['Nøklevann-kant', lakeNodes], ['dam', damNodes], ['Skraperudbekken', streamNodes]]) {
  if (!nodeIds.includes(topologyNodeId)) throw new Error(`${label} mangler delt node ${topologyNodeId}`);
}
if (!Number.isFinite(node.lat) || !Number.isFinite(node.lon)) throw new Error('OSM-node mangler gyldig koordinat');
if (Math.abs(node.lat - 59.8736207) > 0.002 || Math.abs(node.lon - 10.8582866) > 0.002) {
  throw new Error(`Delt node ${topologyNodeId} har flyttet seg uventet langt fra diagnostisert utløpssone`);
}

const lat = node.lat;
const lon = node.lon;
const coordNote = `Batch 141 verifiserer Nøklevanns sørvestlige utløp med eksplisitt delt OSM-topologi: Nøklevann relation ${lakeRelationId} inneholder kant-way ${lakeBoundaryWayId}; denne kanten, dam-way ${damWayId} og Skraperudbekken way ${streamWayId} deler node ${topologyNodeId}. Canonical lat/lon er koordinaten til denne hydrologiske knutepunktsnoden. Punktet er derfor ikke et innsjømidtpunkt, nearest-segment eller et påstått direkte startpunkt for hele Ljanselva.`;

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
if (!Array.isArray(aggregate) || aggregate.filter((place) => place?.id === placeId).length !== 1) throw new Error(`${placeId} må finnes nøyaktig én gang i aggregate`);
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
  currentCoordinate: { lat, lon, r: fields.r, coordStatus: fields.coordStatus, coordSource: fields.coordSource, coordType: fields.coordType, coordNote },
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
      finding: `Nøklevann er exact natural=water relation ${lakeRelationId} og inkluderer utløpskant-way ${lakeBoundaryWayId}.`,
      canVerifyCoordinate: false,
      reason: 'Parent-geometrien identifiserer innsjøen; utløpspunktet verifiseres av den delte topologinoden.',
    },
    {
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap way ${damWayId} – utløpsdam`,
      sourceUrl: `https://www.openstreetmap.org/way/${damWayId}`,
      sourceObjectId: `osm-way:${damWayId}`,
      sourceQuality: 'exact_outlet_structure',
      finding: `Dam-way ${damWayId} deler node ${topologyNodeId} med Nøklevanns kant og Skraperudbekken.`,
      canVerifyCoordinate: true,
      reason: 'Dokumenterer fysisk utløpsstruktur i samme topologiske knutepunkt.',
    },
    {
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap way ${streamWayId} – Skraperudbekken`,
      sourceUrl: `https://www.openstreetmap.org/way/${streamWayId}`,
      sourceObjectId: `osm-way:${streamWayId}`,
      sourceQuality: 'exact_named_downstream_waterway',
      finding: `Skraperudbekken way ${streamWayId} inneholder den delte node ${topologyNodeId}.`,
      canVerifyCoordinate: true,
      reason: 'Knytter Nøklevanns utløp direkte til det navngitte nedstrøms bekkeløpet.',
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
  sourceObjectCandidates: [],
  geometryCandidates: [],
  coordinateCandidates: [],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Applied to canonical place as explicit Nøklevann outlet topology anchor.' },
  notes: [coordNote],
});

let protocol = fs.readFileSync(protocolFile, 'utf8');
const unresolvedLines = protocol.split('\n').filter((line) => line.includes('`noklevann_ljanselva_start`') && line.includes('| needs_review |'));
if (unresolvedLines.length !== 1) throw new Error(`Forventet én stale unresolved-rad for ${placeId}, fant ${unresolvedLines.length}`);
protocol = protocol.split('\n').filter((line) => line !== unresolvedLines[0]).join('\n');

const countLine = protocol.split('\n').find((line) => line.startsWith('Oslo-protokollen dekker nå '));
if (!countLine || !countLine.includes('377 aktive current `verified*` canonical Oslo-steder')) throw new Error('Fant ikke forventet Oslo-statuslinje for count-synk');
protocol = protocol.replace(countLine, 'Oslo-protokollen dekker nå 378 aktive current `verified*` canonical Oslo-steder.');
protocol = protocol.replace('Sist oppdatert: 2026-07-21', `Sist oppdatert: ${date}`);

if (!protocol.includes(`| ${batch} | \`${placeId}\` |`)) {
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batchinnsetting');
  const insertion = `| ${batch} | \`${placeId}\` | ${newName} | verified_geometry | \`${sourceObjectId}\` |\n\nBatch ${batch} (${date}) løser \`${placeId}\` som et eksplisitt hydrologisk utløpsanker i stedet for et vilkårlig innsjøpunkt. OSM relation ${lakeRelationId} identifiserer Nøklevann; utløpskant-way ${lakeBoundaryWayId}, dam-way ${damWayId} og Skraperudbekken-way ${streamWayId} deler node ${topologyNodeId} på \`${lat}, ${lon}\`. Visningsnavnet korrigeres fra «Nøklevann (Ljanselva start)» til «${newName}» fordi canonical punkt representerer den dokumenterte overgangen fra Nøklevann til Skraperudbekken, ikke et påstått direkte startpunkt for hele Ljanselva.\n\n`;
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

console.log(JSON.stringify({ batch, placeId, name: newName, sourceObjectId, oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon }, newCoordinate: { lat, lon }, status: fields.coordStatus, method: 'explicit_shared_hydrological_topology_node' }, null, 2));
