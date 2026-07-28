const assert = require('assert');
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(repo, rel), 'utf8'));
const place = readJson('data/places/scenekunst/oslo/places_scenekunst/nationaltheatret.json');
const expectedIds = ['henrik_bull', 'bjorn_bjornson', 'johanne_dybwad'];
assert(!Object.prototype.hasOwnProperty.call(place, 'people_ids'), 'Nationaltheatret must not use people_ids to filter the People popup');
assert(!Object.prototype.hasOwnProperty.call(place, 'rounds'), 'Nationaltheatret must use the canonical fixed round profile, not a local legacy rounds list');

const manifest = readJson('data/people/manifest.json');
const allPeople = [];
for (const rel of manifest.files || []) {
  const json = readJson(path.posix.join('data/people', rel.replace(/^people\//, '')));
  if (Array.isArray(json)) allPeople.push(...json);
  else if (json && Array.isArray(json.people)) allPeople.push(...json.people);
  else if (json && typeof json === 'object') allPeople.push(json);
}

for (const id of expectedIds) {
  const matches = allPeople.filter(person => String(person?.id || '') === id);
  assert.strictEqual(matches.length, 1, `${id} must exist exactly once in manifest-loaded people data`);
  const person = matches[0];
  const placeIds = [person.placeId, ...(Array.isArray(person.places) ? person.places : [])].filter(Boolean);
  assert(placeIds.includes('nationaltheatret'), `${id} must retain a direct Nationaltheatret anchor`);
  assert(/^bilder\/kort\/people\//.test(String(person.image || '')), `${id} must use a local People image`);
  assert.strictEqual(person.cardImage, person.image, `${id} image/cardImage must match`);
  assert(fs.existsSync(path.join(repo, person.image)), `${id} local image file must exist`);
  assert(person.imageMeta && person.imageMeta.source === 'wikimedia_commons', `${id} must have canonical Commons image metadata`);
  assert(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(person.imageMeta.sourcePage || ''), `${id} must retain the Commons source page`);
  assert.strictEqual(person.imageMeta.reviewStatus, 'manually_approved', `${id} image must be manually approved`);
}
console.log('Nationaltheatret People images and unfiltered round contract OK');
