import crypto from 'node:crypto';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';

const parts = fs.readdirSync('scripts')
  .filter(name => name.startsWith('.nybrua-split-payload-'))
  .sort()
  .map(name => fs.readFileSync(`scripts/${name}`, 'utf8'));
if (!parts.length) throw new Error('Nybrua/Vaterlandsparken payload missing');

const target = '/tmp/nybrua-vaterlandsparken-split.mjs';
fs.writeFileSync(target, zlib.gunzipSync(Buffer.from(parts.join(''), 'base64')));
await import(`file://${target}`);

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const placeDir = 'data/places/natur/oslo/places_oslo_natur_akerselvarute';
const aggregatePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const routeManifestPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const nybrua = readJson(`${placeDir}/nybrua_vaterlandsparken.json`);
const vaterlandsparken = readJson(`${placeDir}/vaterlandsparken.json`);
Object.assign(vaterlandsparken, {
  locatorType: 'park',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-way:4334996',
  geocodeAccuracy: 'geometric_center',
  coordRole: 'area_anchor',
  coordStatus: 'verified_geometry',
  coordType: 'park_area',
  coordSource: 'OpenStreetMap way 4334996 – Vaterlandsparken',
  coordSourceId: 'osm-way:4334996',
  coordSourceUrl: 'https://www.openstreetmap.org/way/4334996',
  coordVerifiedAt: '2026-07-20',
  coordNote: 'Eksakt navngitt OSM-parkgeometri for Vaterlandsparken. Wayens representasjonspunkt brukes som area_anchor for parkarealet.',
});
const vaterlandsparkenPath = `${placeDir}/vaterlandsparken.json`;
writeJson(vaterlandsparkenPath, vaterlandsparken);

const routeManifest = readJson(routeManifestPath);
const parkManifestRow = routeManifest.places.find(row => row?.id === vaterlandsparken.id);
if (!parkManifestRow) throw new Error('Vaterlandsparken missing from Akerselva split manifest');
parkManifestRow.name = vaterlandsparken.name;
parkManifestRow.category = vaterlandsparken.category;
parkManifestRow.sha256 = crypto.createHash('sha256').update(fs.readFileSync(vaterlandsparkenPath)).digest('hex');
writeJson(routeManifestPath, routeManifest);

const aggregate = readJson(aggregatePath);
const legacyIndex = aggregate.findIndex(place => place?.id === nybrua.id);
if (legacyIndex < 0) throw new Error('Nybrua legacy row missing from Akerselva aggregate');
const cleanedAggregate = aggregate.filter(
  place => place?.id !== nybrua.id && place?.id !== vaterlandsparken.id,
);
cleanedAggregate.splice(legacyIndex, 0, nybrua, vaterlandsparken);
writeJson(aggregatePath, cleanedAggregate);

const coordinateSnapshot = place => ({
  lat: place.lat ?? null,
  lon: place.lon ?? null,
  r: place.r ?? null,
  coordStatus: place.coordStatus ?? '',
  coordSource: place.coordSource ?? '',
  coordType: place.coordType ?? '',
  coordNote: place.coordNote ?? '',
});
const normalizeEvidence = (file, place) => {
  const current = fs.existsSync(file) ? readJson(file) : {};
  writeJson(file, {
    ...current,
    schemaVersion: '1.0',
    placeId: place.id,
    placeFile: aggregatePath,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: coordinateSnapshot(place),
    identity: {
      ...(current.identity || {}),
      currentName: place.name,
      resolvedIdentity: place.name,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: place.locatorType,
      requiresSplit: false,
      splitReason: '',
    },
    decision: {
      ...(current.decision || {}),
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Applied to canonical split place.',
    },
  });
};
normalizeEvidence('data/coordinate-evidence/oslo/natur/nybrua_vaterlandsparken.json', nybrua);
normalizeEvidence('data/coordinate-evidence/oslo/natur/vaterlandsparken.json', vaterlandsparken);

const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });
run('npm', ['run', 'places:coords:evidence:audit']);
run('node', ['tests/nybrua-vaterlandsparken-split-rounds-batch1.test.js']);
run('npm', ['run', 'audit:people-of-places']);
run('npm', ['run', 'leksikon:ids:check']);
run('npm', ['run', 'typecheck:tools']);
run('npm', ['run', 'typecheck:web']);
run('git', ['diff', '--check']);
console.log('Nybrua/Vaterlandsparken split production job completed.');
