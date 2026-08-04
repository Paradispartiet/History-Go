const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const card = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const rounds = fs.readFileSync(path.join(repo, 'js/ui/place-rounds-visual-collections.js'), 'utf8');

assert(!card.includes('const PLACE_ROUND_REGISTRY = ['));
assert(!card.includes('CATEGORY_ROUND_PROFILES'));
assert(!card.includes('applyPlaceRounds(place);'));

for (const id of ['nature', 'works', 'details', 'spots', 'før_nå', 'fortellinger', 'leksikon', 'play', 'training', 'tasks']) {
  assert(!new RegExp(`id:\\s*["']${id}["']`).test(rounds), id);
}

assert(rounds.includes('GENERAL_ROUNDS = Object.freeze(["people", "objects", "brands", "civication"])'));
assert(rounds.includes('NATURE_ROUNDS = Object.freeze(["map", "flora", "fauna", "civication"])'));
assert(rounds.includes('badge:BY_ID.get("badges")'));
assert(rounds.includes('roundCount="4"'));
assert(rounds.includes('ensureBadgePlacement'));
console.log('Canonical badge plus four-round runtime audit OK');
