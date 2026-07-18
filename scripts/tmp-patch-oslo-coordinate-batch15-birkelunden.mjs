import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const AGG = path.join(ROOT, 'data/places/by/oslo/places_by.json');
const SPLIT = path.join(ROOT, 'data/places/by/oslo/places/birkelunden.json');
const MANIFEST = path.join(ROOT, 'data/places/by/oslo/places_by_manifest.json');
const INDEX = path.join(ROOT, 'data/places/by/oslo/places_by_index.json');
const EVIDENCE = path.join(ROOT, 'data/coordinate-evidence/oslo/by/birkelunden.json');
const LAT = 59.92634;
const LON = 10.76013;
const SOURCE_ID = 'osm-way:3236549';
const SOURCE_URL = 'https://www.openstreetmap.org/way/3236549';
const NOTE = 'Geometriforankret områdeanker inne i Birkelunden. OSM-way 3236549 identifiserer selve parkpolygonet; Oslo kommune brukes som uavhengig identitets- og avgrensningskontroll. Punktet representerer parkgeometrien og skilles fra Birkelunden holdeplass, Paulus plass og Paulus kirke.';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

function patchPlace(row) {
  Object.assign(row, {
    lat: LAT,
    lon: LON,
    locatorType: 'park',
    sourceProvider: 'osm',
    sourceObjectId: SOURCE_ID,
    geocodeAccuracy: 'geometric_center',
    coordRole: 'area_anchor',
    coordType: 'park_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 3236549 – Birkelunden',
    coordSourceId: SOURCE_ID,
    coordSourceUrl: SOURCE_URL,
    coordVerifiedAt: '2026-07-19',
    coordNote: NOTE
  });
  delete row.coordPrecisionM;
}

const aggregate = read(AGG);
const aggRow = aggregate.find((p) => p?.id === 'birkelunden');
if (!aggRow) throw new Error('Mangler birkelunden i aggregate');
patchPlace(aggRow);
write(AGG, aggregate);

const split = read(SPLIT);
patchPlace(split);
write(SPLIT, split);

const manifest = read(MANIFEST);
manifest.source_sha256 = sha(AGG);
manifest.generated_at = new Date().toISOString();
const manifestRow = (manifest.places || []).find((p) => p?.id === 'birkelunden');
if (!manifestRow) throw new Error('Mangler birkelunden i split-manifest');
manifestRow.sha256 = sha(SPLIT);
write(MANIFEST, manifest);

const index = read(INDEX);
const indexRow = index.find((p) => p?.id === 'birkelunden');
if (!indexRow) throw new Error('Mangler birkelunden i by-index');
Object.assign(indexRow, { lat: LAT, lon: LON, coordType: 'park_anchor', coordStatus: 'verified_geometry' });
write(INDEX, index);

const evidence = read(EVIDENCE);
Object.assign(evidence.currentCoordinate, {
  lat: LAT,
  lon: LON,
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap way 3236549 – Birkelunden',
  coordType: 'park_anchor',
  coordNote: NOTE
});
evidence.identity.locatorTypeCandidate = 'park';
evidence.evidence = [{
  sourceProvider: 'osm',
  sourceName: 'OpenStreetMap way 3236549 – Birkelunden',
  sourceUrl: SOURCE_URL,
  sourceObjectId: SOURCE_ID,
  sourceQuality: 'park_geometry',
  finding: 'OSM way 3236549 identifiserer Birkelunden som eget leisure=park-polygon; Oslo kommune dokumenterer samme park og dens avgrensning.',
  canVerifyCoordinate: true,
  reason: NOTE
}];
evidence.sourceObjectCandidates = [{ sourceProvider: 'osm', sourceObjectId: SOURCE_ID, canApplyToPlace: true }];
evidence.coordinateCandidates = [{ lat: LAT, lon: LON, coordRole: 'area_anchor', canApplyToPlace: true }];
evidence.notes = [NOTE];
write(EVIDENCE, evidence);

console.log(`Birkelunden geometry anchor: ${LAT}, ${LON}`);
