const assert = require('assert');
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const place = readJson('data/places/natur/vestland/saevareidberget_landskapsvernomrade.json')[0];
assert.strictEqual(place.id, 'saevareidberget_landskapsvernomrade');
assert.strictEqual(place.coordStatus, 'verified_geometry');
assert.strictEqual(place.sourceProvider, 'official_map');
assert(place.sourceObjectId.startsWith('miljodirektoratet-naturvern:'));
assert(place.nature_profile.summary.length >= 180);
assert(place.nature_profile.themes.length >= 5);

const map = readJson('data/natur/nature_etne_place_map.json');
assert.deepStrictEqual(map.places.saevareidberget_landskapsvernomrade.flora, ['emne_ved_ask', 'emne_ved_alm', 'emne_ved_lind']);
assert.deepStrictEqual(map.places.saevareidberget_landskapsvernomrade.fauna, []);
assert(map.places.saevareidberget_landskapsvernomrade.documentation.includes('mange hundre'));

const trees = readJson('data/natur/flora/traer.json');
const flatten = items => items.flatMap(item => item && item.kind === 'emne_pack' ? flatten(item.items || []) : [item]);
const ids = new Set(flatten(trees).filter(Boolean).map(item => item.id));
for (const id of map.places.saevareidberget_landskapsvernomrade.flora) assert(ids.has(id), 'Mangler artskort: ' + id);

const evidence = readJson('data/coordinate-evidence/vestland/natur/saevareidberget_landskapsvernomrade.json');
assert.strictEqual(evidence.placeId, 'saevareidberget_landskapsvernomrade');
assert.strictEqual(evidence.evidenceStatus, 'applied_to_place');
assert.strictEqual(evidence.decision.canBecomeVerified, true);

console.log('Etne Sævareidberget nature round mapping OK');
