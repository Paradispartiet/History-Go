const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/places/manifest.json'), 'utf8'));
const records = [];
for (const entry of manifest.files) {
  const file = path.join(root, 'data', entry);
  if (!fs.existsSync(file)) continue;
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  const values = Array.isArray(payload) ? payload : [payload];
  for (const value of values) {
    if (value.category === 'natur' && value.kommune === 'Etne') records.push({ entry, place: value });
  }
}
assert.strictEqual(records.length, 26, 'Etne natur skal ha 26 aktive canonical steder');
assert.strictEqual(new Set(records.map(({ place }) => place.id)).size, 26, 'Etne natur skal ha 26 unike place-id-er');
for (const { entry, place } of records) {
  assert.strictEqual((place.tasks_profile?.tasks || []).length, 4, entry);
  assert.strictEqual((place.training_profile?.exercises || []).length, 3, entry);
  assert.strictEqual((place.civication_store || []).length, 4, entry);
  for (const object of place.civication_store || []) {
    assert.strictEqual(object.physicalObject, true, entry);
    assert.strictEqual(object.placeSpecific, true, entry);
    assert.ok((object.source_urls || []).some((url) => /^https?:\/\//.test(url)), entry);
  }
}
const leksikonDir = path.join(root, 'data/leksikon/places/vestland/etne/natur');
for (const name of fs.readdirSync(leksikonDir)) {
  if (!name.endsWith('.json')) continue;
  const raw = fs.readFileSync(path.join(leksikonDir, name), 'utf8');
  assert.ok(!/komplett\s+rundingsprofil|rundingsproduksjon|History Go saml(?:er|ar)/i.test(raw), name);
}
console.log('Etne nature quality uplift OK: 26 active places and clean round contract.');
