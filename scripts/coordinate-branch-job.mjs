import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const reportDir = join(root, 'reports/oslo-coordinate-control-batch-195-frognerstranda-multi-anchor');
const runnerDir = process.env.RUNNER_REPORT_DIR ? join(root, process.env.RUNNER_REPORT_DIR) : reportDir;
const checks = [];

async function check(name, fn) {
  try {
    const detail = await fn();
    checks.push({ name, ok: true, detail: detail ?? null });
  } catch (error) {
    checks.push({
      name,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null
    });
  }
}

function extractWay(payload, id) {
  const way = payload.elements.find((element) => element.type === 'way' && element.id === id);
  if (!way) throw new Error(`Way ${id} missing.`);
  const nodes = new Map(payload.elements.filter((element) => element.type === 'node').map((node) => [node.id, node]));
  return {
    id,
    version: way.version,
    timestamp: way.timestamp,
    tags: way.tags ?? {},
    geometry: way.nodes.map((nodeId) => {
      const node = nodes.get(nodeId);
      if (!node) throw new Error(`Way ${id} node ${nodeId} missing.`);
      return { nodeId, lat: node.lat, lon: node.lon };
    })
  };
}

async function fetchText(url) {
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'History-Go coordinate control/1.0' } });
  const text = await response.text();
  if (!response.ok) throw new Error(`Fetch ${response.status}: ${url}`);
  return { response, text };
}

async function fetchJson(url) {
  const { response, text } = await fetchText(url);
  return { response, json: JSON.parse(text) };
}

await mkdir(reportDir, { recursive: true });
await mkdir(runnerDir, { recursive: true });

let protocol;
let research;
let aggregate;
let child;

await check('protocol_max_194', async () => {
  protocol = await readFile(join(root, 'docs/coordinates/coordinate-control-protocol.md'), 'utf8');
  const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
  const maxBatch = Math.max(...batches);
  if (maxBatch !== 194) throw new Error(`Expected 194, got ${maxBatch}.`);
  if (protocol.includes('| 195 |')) throw new Error('Batch 195 already exists.');
  return { maxBatch };
});

await check('merged_research_ready', async () => {
  research = JSON.parse(await readFile(join(root, 'reports/oslo-coordinate-frognerstranda-multi-anchor-chain-post-194/summary.json'), 'utf8'));
  const observed = {
    placeId: research.placeId,
    coordinateMaxBatch: research.coordinateMaxBatch,
    decision: research.decision,
    canBuildProductionModel: research.canBuildProductionModel,
    west: research.proposedAnchorChain?.west?.sourceObjectId,
    middle: research.proposedAnchorChain?.middle?.sourceObjectId,
    east: research.proposedAnchorChain?.east?.sourceObjectId,
    interpretation: research.canonicalIdentity?.interpretation
  };
  if (observed.placeId !== 'frognerstranda') throw new Error(`Unexpected placeId ${observed.placeId}.`);
  if (observed.coordinateMaxBatch !== 194) throw new Error(`Unexpected research batch ${observed.coordinateMaxBatch}.`);
  if (observed.decision !== 'ordered_multi_anchor_chain_ready_for_fresh_production_batch') throw new Error(`Unexpected decision ${observed.decision}.`);
  if (observed.canBuildProductionModel !== true) throw new Error('Research model not ready.');
  if (observed.west !== 'osm-way:118364891' || observed.middle !== 'osm-way:71423688' || observed.east !== 'osm-way:1205417997') throw new Error(`Unexpected anchor chain ${JSON.stringify(observed)}.`);
  return observed;
});

await check('aggregate_and_split_state', async () => {
  aggregate = JSON.parse(await readFile(join(root, 'data/places/popkultur/oslo/places_oslo_populaerkultur.json'), 'utf8'));
  child = JSON.parse(await readFile(join(root, 'data/places/popkultur/oslo/places_oslo_populaerkultur/frognerstranda.json'), 'utf8'));
  if (!Array.isArray(aggregate)) throw new Error(`Aggregate shape is ${typeof aggregate}, not array.`);
  const row = aggregate.find((place) => place.id === 'frognerstranda');
  if (!row) throw new Error('frognerstranda missing from aggregate.');
  const equal = JSON.stringify(row) === JSON.stringify(child);
  if (!equal) {
    const keys = [...new Set([...Object.keys(row), ...Object.keys(child)])];
    const differences = keys.filter((key) => JSON.stringify(row[key]) !== JSON.stringify(child[key])).map((key) => ({ key, aggregate: row[key], child: child[key] }));
    throw new Error(`Aggregate/split mismatch: ${JSON.stringify(differences)}.`);
  }
  if (child.lat !== 59.9129 || child.lon !== 10.7098 || child.r !== 180) throw new Error(`Unexpected legacy marker ${child.lat},${child.lon},r=${child.r}.`);
  if (child.coordStatus !== 'needs_source' || child.coordType !== 'legacy_unverified') throw new Error(`Unexpected coordinate state ${child.coordStatus}/${child.coordType}.`);
  return { equal, lat: child.lat, lon: child.lon, r: child.r, coordStatus: child.coordStatus, coordType: child.coordType };
});

await check('coordinate_evidence_state', async () => {
  const evidence = JSON.parse(await readFile(join(root, 'data/coordinate-evidence/oslo/popkultur/frognerstranda.json'), 'utf8'));
  if (evidence.placeId !== 'frognerstranda') throw new Error(`Unexpected evidence place ${evidence.placeId}.`);
  if (evidence.evidenceStatus !== 'needs_research' || evidence.coordinateDecision !== 'needs_geometry') throw new Error(`Unexpected evidence state ${evidence.evidenceStatus}/${evidence.coordinateDecision}.`);
  return { evidenceStatus: evidence.evidenceStatus, coordinateDecision: evidence.coordinateDecision };
});

await check('official_scope_live', async () => {
  const { response, text } = await fetchText('https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/frognerstranda/');
  const required = [
    'Den strekker seg fra den innerste delen av Frognerkilen og Bygdøy i vest, til Hjortnes/Framnes i øst.',
    'Frognerstranda er en strandlinje',
    'havnepromenaden',
    'hovedsykkelveien'
  ];
  const missing = required.filter((needle) => !text.includes(needle));
  if (missing.length) throw new Error(`Missing official phrases: ${JSON.stringify(missing)}.`);
  return { status: response.status, finalUrl: response.url, bytes: Buffer.byteLength(text) };
});

await check('byleksikon_scope_live', async () => {
  const { response, text } = await fetchText('https://oslobyleksikon.no/side/Frognerstranda');
  const required = ['fra Filipstad til Sjølystveien', 'Ytre del av veien er anlagt som strandpromenade', 'Framnesbrygga'];
  const missing = required.filter((needle) => !text.includes(needle));
  if (missing.length) throw new Error(`Missing byleksikon phrases: ${JSON.stringify(missing)}.`);
  return { status: response.status, finalUrl: response.url, bytes: Buffer.byteLength(text) };
});

for (const [label, id, expectedName, expectedTag, expectedValue, researchKey] of [
  ['west_osm', 118364891, 'Tour de Finance', 'highway', 'cycleway', 'tourDeFinanceCycleway'],
  ['middle_osm', 71423688, 'Frognerstranda', 'highway', 'footway', 'frognerstrandaFootway']
]) {
  await check(label, async () => {
    if (!research) throw new Error('Research object unavailable due earlier failed check.');
    const { response, json } = await fetchJson(`https://api.openstreetmap.org/api/0.6/way/${id}/full.json`);
    const way = extractWay(json, id);
    const expected = research.exactPhysicalWays?.[researchKey];
    if (way.tags.name !== expectedName || way.tags[expectedTag] !== expectedValue) throw new Error(`Identity mismatch: ${JSON.stringify(way.tags)}.`);
    if (way.version !== expected.version || way.timestamp !== expected.timestamp) throw new Error(`Version drift: live ${way.version}/${way.timestamp}, research ${expected.version}/${expected.timestamp}.`);
    if (JSON.stringify(way.geometry) !== JSON.stringify(expected.geometry)) throw new Error(`Geometry drift: live nodes=${way.geometry.length}, research nodes=${expected.geometry.length}.`);
    return { status: response.status, version: way.version, timestamp: way.timestamp, nodeCount: way.geometry.length };
  });
}

await check('east_osm', async () => {
  if (!research) throw new Error('Research object unavailable due earlier failed check.');
  const { response, json } = await fetchJson('https://api.openstreetmap.org/api/0.6/way/1205417997/full.json');
  const way = extractWay(json, 1205417997);
  const expected = research.eastCandidates?.find((candidate) => candidate.sourceObjectId === 'osm-way:1205417997');
  if (!expected) throw new Error('Research east candidate missing.');
  if (way.tags.name !== 'Hjortneskaia' || way.tags.landuse !== 'commercial') throw new Error(`Identity mismatch: ${JSON.stringify(way.tags)}.`);
  const geometry = way.geometry.map(({ lat, lon }) => ({ lat, lon }));
  if (JSON.stringify(geometry) !== JSON.stringify(expected.geometry)) throw new Error(`Geometry drift: live nodes=${geometry.length}, research nodes=${expected.geometry.length}.`);
  if (way.geometry[0].nodeId !== way.geometry.at(-1).nodeId) throw new Error(`Polygon not closed: ${way.geometry[0].nodeId} != ${way.geometry.at(-1).nodeId}.`);
  return { status: response.status, version: way.version, timestamp: way.timestamp, nodeCount: geometry.length, tags: way.tags };
});

await check('civication_legacy_state', async () => {
  const civication = JSON.parse(await readFile(join(root, 'data/Civication/map/historyGoPlaceMapping.popkultur.json'), 'utf8'));
  const mapping = civication.mappings?.map_frognerstranda;
  if (!mapping) throw new Error('map_frognerstranda missing.');
  if (mapping.lat !== 59.9129 || mapping.lon !== 10.7098) throw new Error(`Unexpected mapping coordinate ${mapping.lat},${mapping.lon}.`);
  return { lat: mapping.lat, lon: mapping.lon };
});

const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'frognerstranda',
  mode: 'diagnostic_only_no_canonical_changes',
  passed: checks.filter((row) => row.ok).length,
  failed: checks.filter((row) => !row.ok).length,
  checks
};
await writeFile(join(reportDir, 'production-hard-gate-diagnostic.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
await writeFile(join(runnerDir, 'production-hard-gate-diagnostic.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(result, null, 2));
