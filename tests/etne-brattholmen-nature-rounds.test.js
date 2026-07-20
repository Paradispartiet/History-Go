const assert = require('assert');
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const place = readJson('data/places/natur/vestland/brattholmen_naturreservat_etne.json')[0];
assert.strictEqual(place.id, 'brattholmen_naturreservat_etne');
assert.strictEqual(place.coordStatus, 'verified_geometry');
assert.strictEqual(place.sourceProvider, 'official_map');
assert(place.sourceObjectId.startsWith('miljodirektoratet-naturvern:'));
assert(place.popupDesc.includes('15. april'));
assert(place.nature_profile.summary.length >= 180);

const map = readJson('data/natur/nature_etne_place_map.json');
const audit = readJson('reports/etne-natur-batch-4-brattholmen-artskart.json');
const selectedFlora = audit.matched.filter(item => item.kind === 'flora').map(item => item.id).sort();
const selectedFauna = audit.matched.filter(item => item.kind === 'fauna').map(item => item.id).sort();
assert.deepStrictEqual([...map.places.brattholmen_naturreservat_etne.flora].sort(), selectedFlora);
assert.deepStrictEqual([...map.places.brattholmen_naturreservat_etne.fauna].sort(), selectedFauna);
assert.strictEqual(map.places.brattholmen_naturreservat_etne.species_audit, 'reports/etne-natur-batch-4-brattholmen-artskart.json');
assert(map.places.brattholmen_naturreservat_etne.fauna.includes('emne_fauna_svartbak'));
assert(map.places.brattholmen_naturreservat_etne.fauna.includes('emne_fauna_makrellterne'));
assert.strictEqual(audit.unmatched.length, 1);
assert.strictEqual(audit.unmatched[0].displayName, 'Charadriiformes');

const evidence = readJson('data/coordinate-evidence/vestland/natur/brattholmen_naturreservat_etne.json');
assert.strictEqual(evidence.placeId, 'brattholmen_naturreservat_etne');
assert.strictEqual(evidence.evidenceStatus, 'applied_to_place');
assert.strictEqual(evidence.decision.canBecomeVerified, true);

console.log('Etne Brattholmen exact-polygon nature round mapping OK');
