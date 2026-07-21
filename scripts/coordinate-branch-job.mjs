#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 140;
const date = '2026-07-21';
const placeId = 'alnsjoen_alna_kilde';
const lakeRelationId = 11365358;
const damWayId = 70869529;
const riverWayId = 70869513;
const topologyNodeId = 844892785;
const sourceObjectId = `osm-node:${topologyNodeId}`;
const kartverketSourceObjectId = 'kartverket-ssr:733527';
const kartverketUrl = 'https://stadnamn.kartverket.no/fakta/733527';
const osloByleksikonUrl = 'https://oslobyleksikon.no/side/Alnaelva';
const osloKommuneUrl = 'https://www.oslo.kommune.no/english/welcome-to-oslo/life-in-oslo/enjoy-the-outdoors/lakes-and-rivers/';
const osmNodeUrl = `https://www.openstreetmap.org/node/${topologyNodeId}`;

const aggregateFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json');
const childFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alnsjoen_alna_kilde.json');
const indexFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_index.json');
const manifestFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_manifest.json');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/natur/alnsjoen_alna_kilde.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-140-alungsjoen-alna-source-topology');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

// Validate the exact pre-researched topology live before changing any canonical data.
const query = `[out:json][timeout:40];(
  relation(${lakeRelationId});
  way(${damWayId});
  way(${riverWayId});
);out body geom;`;
const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
const response = await fetch(overpassUrl, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
if (!response.ok) throw new Error(`Overpass feilet: HTTP ${response.status}`);
const payload = await response.json();
writeJson(path.join(reportDir, 'osm-topology-source.json'), payload);
const elements = Array.isArray(payload?.elements) ? payload.elements : [];
const lake = elements.find((element) => element?.type === 'relation' && Number(element?.id) === lakeRelationId);
const dam = elements.find((element) => element?.type === 'way' && Number(element?.id) === damWayId);
const river = elements.find((element) => element?.type === 'way' && Number(element?.id) === riverWayId);
if (!lake || lake?.tags?.natural !== 'water' || lake?.tags?.name !== 'Alungsjøen') {
  throw new Error('Batch 140: forventet OSM relation 11365358 = natural=water, name=Alungsjøen');
}
if (!dam || dam?.tags?.waterway !== 'dam' || dam?.tags?.name !== 'Alunsjødammen') {
  throw new Error('Batch 140: forventet OSM way 70869529 = Alunsjødammen/waterway=dam');
}
if (!river || river?.tags?.waterway !== 'river' || river?.tags?.name !== 'Alna') {
  throw new Error('Batch 140: forventet OSM way 70869513 = Alna/waterway=river');
}
const damNodes = new Set(dam?.nodes || []);
const sharedNodes = (river?.nodes || []).filter((nodeId) => damNodes.has(nodeId));
if (sharedNodes.length !== 1 || Number(sharedNodes[0]) !== topologyNodeId) {
  throw new Error(`Batch 140: forventet nøyaktig delt dam/Alna-node ${topologyNodeId}, fant ${JSON.stringify(sharedNodes)}`);
}
const riverNodeIndex = (river?.nodes || []).findIndex((nodeId) => Number(nodeId) === topologyNodeId);
const nodeCoordinate = river?.geometry?.[riverNodeIndex];
const lat = Number(nodeCoordinate?.lat);
const lon = Number(nodeCoordinate?.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Batch 140: delt topologinode mangler koordinat');
if (Math.abs(lat - 59.9665991) > 1e-7 || Math.abs(lon - 10.8589871) > 1e-7) {
  throw new Error(`Batch 140: topologinode har endret koordinat: ${lat}, ${lon}`);
}

const anchor = {
  id: 'alungsjoen_alna_outflow',
  name: 'Alnas utløp fra Alungsjøen ved Alunsjødammen',
  lat,
  lon,
  r: 60,
  type: 'hydrological_outflow',
  sourceProvider: 'osm',
  sourceObjectId,
  note: `Eksakt delt OSM-topologinode mellom Alunsjødammen (way ${damWayId}) og første lokale Alna-segment (way ${riverWayId}).`,
};
const coordNote = `Batch 140 hydrological topology: Kartverket SSR stedsnummer 733527 fastsetter Alungsjøen som offisiell skrivemåte; den tidligere skrivemåten Alnsjøen er avslått. Oslo kommune og Oslo byleksikon dokumenterer at Alna renner fra innsjøen. OSM modellerer den konkrete utløpskoblingen topologisk: Alunsjødammen (way ${damWayId}) og det første lokale Alna-segmentet (way ${riverWayId}, name=Alna, loc_name=Alunsjøbekken) deler nøyaktig node ${topologyNodeId} ved ${lat}, ${lon}. Denne delte noden brukes som kildebelagt hydrologisk area-anchor. Punktet er ikke valgt etter avstand, er ikke sjøens sentrum og er ikke et generelt punkt på Gamle Gruvevei.`;

function replaceOfficialLakeName(value) {
  if (typeof value === 'string') return value.replaceAll('Alnsjøen', 'Alungsjøen');
  if (Array.isArray(value)) return value.map(replaceOfficialLakeName);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceOfficialLakeName(item)]));
  }
  return value;
}

const fields = {
  lat,
  lon,
  r: 120,
  locatorType: 'natural_area',
  sourceProvider: 'osm',
  sourceObjectId,
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'area_anchor',
  coordStatus: 'verified_geometry',
  coordSource: `OSM topology node ${topologyNodeId}: shared by Alunsjødammen way ${damWayId} and Alna way ${riverWayId}`,
  coordSourceId: sourceObjectId,
  coordSourceUrl: osmNodeUrl,
  coordType: 'hydrological_outflow_topology_anchor',
  coordPrecisionM: 10,
  coordVerifiedAt: date,
  anchors: [anchor],
  coordNote,
};

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate) || aggregate.filter((place) => place?.id === placeId).length !== 1) {
  throw new Error('alnsjoen_alna_kilde må finnes nøyaktig én gang i aggregate');
}
const oldPlace = aggregate.find((place) => place?.id === placeId);
const updatedAggregate = aggregate.map((place) => {
  if (place?.id !== placeId) return place;
  const renamed = replaceOfficialLakeName(place);
  const updated = {
    ...renamed,
    name: 'Alungsjøen (Alna-kilde)',
    sourceHint: 'Canonical kartanker er den dokumenterte topologiske utløpskoblingen der Alna møter Alunsjødammen; ikke innsjøsentrum eller et vilkårlig nærliggende punkt.',
    ...fields,
  };
  updated.externalLinks = Array.isArray(updated.externalLinks) ? [...updated.externalLinks] : [];
  for (const link of [
    { type: 'official_name', label: 'Kartverket SSR: Alungsjøen', url: kartverketUrl, lang: 'nb', verifiedAt: date },
    { type: 'official', label: 'Oslo kommune: Alna fra Alungsjøen til Oslofjorden', url: osloKommuneUrl, lang: 'en', verifiedAt: date },
  ]) {
    if (!updated.externalLinks.some((item) => item?.url === link.url)) updated.externalLinks.push(link);
  }
  return updated;
});
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('alnsjoen_alna_kilde mangler i split-index');
Object.assign(indexRow, {
  name: updatedPlace.name,
  lat,
  lon,
  r: updatedPlace.r,
  coordStatus: fields.coordStatus,
  coordType: fields.coordType,
});
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error('alnsjoen_alna_kilde mangler i split-manifest');
manifestRow.name = updatedPlace.name;
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat,
    lon,
    r: updatedPlace.r,
    coordStatus: fields.coordStatus,
    coordSource: fields.coordSource,
    coordType: fields.coordType,
    coordNote,
  },
  identity: {
    currentName: updatedPlace.name,
    resolvedIdentity: 'Alnas konkrete utløps-/kildesone ved Alungsjøen og Alunsjødammen',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'natural_area',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'offisiell identitet for Alungsjøen',
    'uavhengig dokumentasjon på Alna fra innsjøen',
    'eksplisitt topologisk kobling mellom dam og første Alna-segment',
  ],
  evidence: [
    {
      sourceProvider: 'kartverket',
      sourceName: 'Kartverket Sentralt stedsnavnregister – Alungsjøen',
      sourceUrl: kartverketUrl,
      sourceObjectId: kartverketSourceObjectId,
      sourceQuality: 'official_named_place_registry',
      finding: 'Kartverket SSR stedsnummer 733527 fastsetter Alungsjøen som vedtatt hovednavn; Alnsjøen er avslått skrivemåte.',
      canVerifyCoordinate: false,
      reason: 'Fastsetter offisiell innsjøidentitet og navn; utløpskoordinaten kommer fra eksplisitt hydrologisk OSM-topologi.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo kommune – Lakes and rivers',
      sourceUrl: osloKommuneUrl,
      sourceObjectId: 'oslo-kommune:alna-from-alungsjoen-to-oslofjord',
      sourceQuality: 'official_hydrological_identity_crosscheck',
      finding: 'Oslo kommune dokumenterer Alna som elva som går fra innsjøen til Oslofjorden.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker vassdragsidentiteten; selve utløpspunktet verifiseres topologisk.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Alnaelva',
      sourceUrl: osloByleksikonUrl,
      sourceObjectId: 'oslobyleksikon:alnaelva',
      sourceQuality: 'documented_source_identity',
      finding: 'Dokumenterer at den egentlige Alna renner ut fra innsjøen og først går østover.',
      canVerifyCoordinate: false,
      reason: 'Uavhengig historisk/geografisk kryssjekk av kilde-/utløpsidentiteten.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – shared Alunsjødammen/Alna topology node',
      sourceUrl: osmNodeUrl,
      sourceObjectId,
      sourceQuality: 'explicit_shared_network_topology_node',
      finding: `Alunsjødammen way ${damWayId} og Alna way ${riverWayId} deler nøyaktig OSM-node ${topologyNodeId} ved ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: 'Eksplisitt felles nettverksnode mellom navngitt dam og navngitt Alna-segment; ingen nearest/first-hit eller proxy.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${damWayId}`, canApplyToPlace: false },
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${riverWayId}`, canApplyToPlace: false },
    { sourceProvider: 'kartverket', sourceObjectId: kartverketSourceObjectId, canApplyToPlace: false },
  ],
  geometryCandidates: [
    {
      type: 'shared_hydrological_topology_node',
      anchors: [anchor],
      supportingObjects: [`osm-relation:${lakeRelationId}`, `osm-way:${damWayId}`, `osm-way:${riverWayId}`],
      canApplyToPlace: true,
    },
  ],
  coordinateCandidates: [
    { lat, lon, coordRole: 'area_anchor', sourceObjectId, canApplyToPlace: true },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Den eksplisitte delte topologinoden mellom Alunsjødammen og Alna er anvendt som canonical kildesoneanker.',
  },
  notes: [coordNote],
});

let protocol = fs.readFileSync(protocolFile, 'utf8');
const staleRow = '| `alnsjoen_alna_kilde` – Alnsjøen (Alna-kilde) | needs_review | Alna er dokumentert å renne ut fra Alnsjøen, men legacy-punktet ligger ved Gamle Gruvevei og kontrollen fant flere separate Alna-segmenter uten ett entydig sjø-/utløpsobjekt. | Finn eksakt Alnsjøen-vanngeometri eller et dokumentert Alna-utløpsobjekt før canonical koordinat godkjennes. |';
if (protocol.split(staleRow).length - 1 !== 1) throw new Error('Forventet én stale alnsjoen_alna_kilde needs_review-rad');
protocol = protocol.replace(`${staleRow}\n`, '');
if (!protocol.includes('| 140 | `alnsjoen_alna_kilde` |')) {
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør');
  const insertion = `| 140 | \`alnsjoen_alna_kilde\` | Alungsjøen (Alna-kilde) | verified_geometry | \`${sourceObjectId}\` |\n\nBatch 140 (2026-07-21) løser kildesonen med eksplisitt hydrologisk nettverkstopologi og oppdaterer synlig innsjønavn til Kartverkets vedtatte \`Alungsjøen\`; place-id-en beholdes for kompatibilitet. Kartverket SSR stedsnummer 733527 fastsetter innsjøidentiteten. Oslo kommune og Oslo byleksikon dokumenterer Alna fra innsjøen. I OSM deler Alunsjødammen (way ${damWayId}) og første lokale Alna-segment (way ${riverWayId}) nøyaktig node ${topologyNodeId} ved ${lat}, ${lon}. Den delte noden brukes som \`semantic_anchor\`/\`area_anchor\` med eksplisitt anchor-metadata; legacy-punktet ved Gamle Gruvevei pensjoneres. Ingen nearest-/first-hit-logikk eller sjøsentrum-proxy brukes.\n\n`;
  protocol = protocol.replace(marker, insertion + marker);
}
fs.writeFileSync(protocolFile, protocol);

writeJson(path.join(reportDir, 'batch-140-result.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  name: updatedPlace.name,
  sourceObjectId,
  lakeRelationId,
  damWayId,
  riverWayId,
  topologyNodeId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
  status: 'verified_geometry',
  method: 'explicit_shared_hydrological_topology_node',
});
fs.writeFileSync(
  path.join(reportDir, 'sources.md'),
  `# Batch 140 source chain\n\n- Kartverket SSR 733527: official lake name Alungsjøen.\n- Oslo kommune / Oslo byleksikon: Alna source identity from the lake.\n- OSM relation ${lakeRelationId}: Alungsjøen water geometry.\n- OSM way ${damWayId}: Alunsjødammen.\n- OSM way ${riverWayId}: first local Alna river segment.\n- OSM node ${topologyNodeId}: exact shared dam/river topology node at ${lat}, ${lon}.\n`,
);
console.log(JSON.stringify({ batch, placeId, name: updatedPlace.name, sourceObjectId, oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon }, newCoordinate: { lat, lon }, status: 'verified_geometry' }, null, 2));
