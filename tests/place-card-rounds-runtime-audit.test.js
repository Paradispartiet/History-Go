const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const card = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const rounds = fs.readFileSync(path.join(repo, 'js/ui/place-rounds-visual-collections.js'), 'utf8');
const contract = fs.readFileSync(path.join(repo, 'data/places/README_place_rounds.md'), 'utf8');

assert(!card.includes('const PLACE_ROUND_REGISTRY = ['));
assert(!card.includes('CATEGORY_ROUND_PROFILES'));
assert(!card.includes('applyPlaceRounds(place);'));

for (const id of ['civication', 'map', 'flora', 'fauna', 'før_nå', 'fortellinger', 'leksikon', 'play', 'training', 'tasks']) {
  assert(!new RegExp(`id:\\s*["']${id}["']`).test(rounds), id);
}

for (const id of ['people', 'works', 'objects', 'details', 'spots', 'nature', 'brands']) {
  assert(new RegExp(`id:\\s*["']${id}["']`).test(rounds), id);
}

assert(rounds.includes('CATEGORY_ROUND_PROFILES = Object.freeze'));
assert(rounds.includes('politikk:    ["people", "spots", "details", "objects"]'));
assert(rounds.includes('musikk:      ["people", "works", "objects", "spots"]'));
assert(rounds.includes('natur:       ["nature", "spots", "details", "people"]'));
assert(rounds.includes('badge:BY_ID.get("badges")'));
assert(rounds.includes('roundCount = "4"'));
assert(rounds.includes('ensureBadgePlacement'));
assert.match(contract, /Civication Store[\s\S]*ikke canonical runding|Civication er aldri selve rundingen/i);
assert.match(contract, /Kategori avgjør de fire innholdsrundingene/);
console.log('Canonical badge plus category-dependent four-round runtime audit OK');
