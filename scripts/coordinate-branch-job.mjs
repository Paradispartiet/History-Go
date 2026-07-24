import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-abelhaugen-research-post-195';
const reportDir = path.join(root, reportRel);
const readJson = async (name) => JSON.parse(await fs.readFile(path.join(reportDir, name), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
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

const summary = await readJson('summary.json');
const wikidata = await readJson('wikidata-Q23868718.json');
const osm = await readJson('osm-node-1664967162.json');
const entity = wikidata.entities?.Q23868718;
const node = osm.elements?.find((entry) => entry.type === 'node' && entry.id === 1664967162);
assert(entity && node, 'Research source captures are incomplete.');

const creatorClaim = entity.claims?.P170?.some((claim) => claim.mainsnak?.datavalue?.value?.id === 'Q213956');
const locationClaim = entity.claims?.P276?.some((claim) => claim.mainsnak?.datavalue?.value?.id === 'Q17516063');
const coordinateValue = entity.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
assert(creatorClaim, 'Wikidata no longer identifies Gustav Vigeland as creator (Q213956).');
assert(locationClaim, 'Wikidata no longer identifies the monument location (Q17516063).');
assert(coordinateValue, 'Wikidata coordinate claim is missing.');
const wikidataCoordinate = { lat: Number(coordinateValue.latitude), lon: Number(coordinateValue.longitude) };
const osmCoordinate = { lat: Number(node.lat), lon: Number(node.lon) };
const sourceAgreementMeters = distanceMeters(wikidataCoordinate, osmCoordinate);
assert(sourceAgreementMeters < 5, `Wikidata and OSM exact points disagree by ${sourceAgreementMeters.toFixed(1)} m.`);

summary.sourceChecks.wikidataLocatedAtAbelhaugen = true;
summary.sourceChecks.wikidataCreatorGustavVigeland = true;
summary.sourceChecks.wikidataCoordinateMatchesOsm = true;
summary.wikidataCoordinate = wikidataCoordinate;
summary.sourceAgreementMeters = Number(sourceAgreementMeters.toFixed(2));
summary.recommendation.nextAction = 'Apply OSM node 1664967162 as the canonical exact monument point; its point agrees with Wikidata Q23868718, while Vigeland Museum and Oslo Byleksikon independently resolve the identity. Add coordinate evidence, synchronize aggregate/index copies, and keep protocol max batch at 195.';

await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Abelhaugen coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${summary.protocolMaxBatch}**\n- Identity: **resolved exact Abel monument**\n- Current marker: **${summary.currentCoordinate.lat}, ${summary.currentCoordinate.lon}**\n- Exact named OSM monument point: **${summary.candidate.lat}, ${summary.candidate.lon}**\n- Wikidata coordinate: **${wikidataCoordinate.lat}, ${wikidataCoordinate.lon}**\n- OSM/Wikidata agreement: **${summary.sourceAgreementMeters} m**\n- Displacement from current marker: **${summary.displacementMeters} m**\n- OSM object: **node 1664967162**\n- Wikidata object: **Q23868718**\n- Recommendation: **promote the exact named monument point in a separate production PR**\n\nThe exact point is supported by a uniquely named OSM monument object cross-linked to the dedicated Wikidata item, and the independent OSM and Wikidata coordinates agree within five metres. Wikidata identifies Gustav Vigeland as creator and supplies the monument location relation. Vigeland Museum and Oslo Byleksikon independently resolve the identity as Gustav Vigeland's Abel monument at Abelhaugen/Slottsparken. No batch 196 is created.\n`);

console.log(JSON.stringify({
  status: 'abelhaugen_research_metadata_corrected',
  sourceAgreementMeters: summary.sourceAgreementMeters,
  recommendation: summary.coordinateDecision,
}, null, 2));
