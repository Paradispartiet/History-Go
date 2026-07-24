import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-abelhaugen-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/vitenskap/oslo/places_vitenskap/abelhaugen.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'History-Go coordinate research/1.0 (github.com/Paradispartiet/History-Go)',
      accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
};
const fetchJson = async (url) => JSON.parse(await fetchText(url));
const distanceMeters = (a, b) => {
  const toRad = (value) => value * Math.PI / 180;
  const earth = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(h));
};

await fs.mkdir(reportDir, { recursive: true });

const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; this post-195 research must not create it.');

const place = await readJson(placeRel);
assert(place.id === 'abelhaugen', 'Unexpected place identity.');
assert(Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)), 'Current place coordinate is missing.');

const osmUrl = 'https://api.openstreetmap.org/api/0.6/node/1664967162.json';
const wikidataUrl = 'https://www.wikidata.org/wiki/Special:EntityData/Q23868718.json';
const vigelandUrl = 'https://vigeland.museum.no/gustav-vigeland/vigeland-andre-steder';
const byleksikonUrl = 'https://oslobyleksikon.no/side/Abelmonumentet';

const [osm, wikidata, vigelandHtml, byleksikonHtml] = await Promise.all([
  fetchJson(osmUrl),
  fetchJson(wikidataUrl),
  fetchText(vigelandUrl),
  fetchText(byleksikonUrl),
]);

const node = osm.elements?.find((entry) => entry.type === 'node' && entry.id === 1664967162);
assert(node, 'OSM node 1664967162 was not returned.');
assert(Number.isFinite(node.lat) && Number.isFinite(node.lon), 'OSM monument point lacks coordinates.');
const tags = node.tags ?? {};
assert(tags.historic === 'monument' || tags.tourism === 'artwork', 'OSM object is no longer tagged as a monument/artwork.');
assert(tags.wikidata === 'Q23868718' || /abel/i.test(`${tags.name ?? ''} ${tags['name:no'] ?? ''}`), 'OSM object no longer resolves to the Abel monument.');

const entity = wikidata.entities?.Q23868718;
assert(entity, 'Wikidata Q23868718 was not returned.');
const osmClaim = entity.claims?.P11693?.some((claim) => String(claim.mainsnak?.datavalue?.value) === '1664967162');
assert(osmClaim, 'Wikidata no longer links Abelmonumentet to OSM node 1664967162.');
const locationClaim = entity.claims?.P276?.some((claim) => claim.mainsnak?.datavalue?.value?.id === 'Q31583065');
const creatorClaim = entity.claims?.P170?.some((claim) => claim.mainsnak?.datavalue?.value?.id === 'Q554034');

const vigelandIdentity = /Abelmonumentet/i.test(vigelandHtml) && /Slottet|Slottsparken/i.test(vigelandHtml);
const byleksikonIdentity = /Abelmonumentet/i.test(byleksikonHtml) && /1908/.test(byleksikonHtml) && /Slottspark/i.test(byleksikonHtml);
assert(vigelandIdentity, 'Vigeland Museum identity page no longer supports Abelmonumentet near the Palace.');
assert(byleksikonIdentity, 'Oslo Byleksikon identity page no longer supports Abelmonumentet at Abelhaugen.');

const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };
const exactCoordinate = { lat: Number(node.lat), lon: Number(node.lon) };
const displacementMeters = distanceMeters(currentCoordinate, exactCoordinate);
assert(displacementMeters > 100, `Current coordinate is only ${displacementMeters.toFixed(1)} m from the exact monument point; manual review required.`);

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  placeId: place.id,
  placeName: place.name,
  identityDecision: 'resolved_exact_abel_monument',
  coordinateDecision: 'promote_exact_named_monument_point',
  currentCoordinate: {
    ...currentCoordinate,
    coordStatus: place.coordStatus ?? null,
    coordSource: place.coordSource ?? null,
  },
  candidate: {
    lat: exactCoordinate.lat,
    lon: exactCoordinate.lon,
    sourceProvider: 'OpenStreetMap',
    sourceObjectId: 'osm-node:1664967162',
    sourceUrl: 'https://www.openstreetmap.org/node/1664967162',
    objectType: tags.historic === 'monument' ? 'historic_monument' : 'artwork',
    name: tags.name ?? tags['name:no'] ?? null,
    wikidata: tags.wikidata ?? null,
    creator: tags.artist_name ?? tags.artist ?? null,
  },
  displacementMeters: Number(displacementMeters.toFixed(1)),
  sourceChecks: {
    osmExactNamedObject: true,
    wikidataLinksOsmNode: true,
    wikidataLocatedAtAbelhaugen: Boolean(locationClaim),
    wikidataCreatorGustavVigeland: Boolean(creatorClaim),
    vigelandMuseumIdentity: vigelandIdentity,
    osloByleksikonIdentity: byleksikonIdentity,
  },
  recommendation: {
    canBecomeVerified: true,
    nextAction: 'Apply OSM node 1664967162 as the canonical exact monument point, add coordinate evidence, synchronize aggregate/index copies, and keep protocol max batch at 195.',
    coordStatus: 'verified_geometry',
    coordType: 'monument_point',
    locatorType: 'monument',
  },
};

await fs.writeFile(path.join(reportDir, 'osm-node-1664967162.json'), `${JSON.stringify(osm, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'wikidata-Q23868718.json'), `${JSON.stringify(wikidata, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Abelhaugen coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${protocolMaxBatch}**\n- Identity: **resolved exact Abel monument**\n- Current marker: **${currentCoordinate.lat}, ${currentCoordinate.lon}**\n- Exact named monument point: **${exactCoordinate.lat}, ${exactCoordinate.lon}**\n- Displacement: **${summary.displacementMeters} m**\n- OSM object: **node 1664967162**\n- Wikidata object: **Q23868718**\n- Recommendation: **promote the exact named monument point in a separate production PR**\n\nThe exact point is supported by a uniquely named OSM monument object cross-linked to the dedicated Wikidata item. Vigeland Museum and Oslo Byleksikon independently resolve the identity as Gustav Vigeland's Abel monument at Abelhaugen/Slottsparken. No batch 196 is created.\n`);

console.log(JSON.stringify({
  status: 'abelhaugen_research_complete',
  reportDir: reportRel,
  displacementMeters: summary.displacementMeters,
  recommendation: summary.coordinateDecision,
}, null, 2));
