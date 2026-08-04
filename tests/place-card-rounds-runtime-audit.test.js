const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const card = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const rounds = fs.readFileSync(path.join(repo, 'js/ui/place-rounds-visual-collections.js'), 'utf8');

assert(!card.includes('const PLACE_ROUND_REGISTRY = ['));
assert(!card.includes('CATEGORY_ROUND_PROFILES'));
assert(!card.includes('applyPlaceRounds(place);'));

for (const id of ['civication', 'før_nå', 'fortellinger', 'leksikon', 'play', 'training', 'tasks']) {
  assert(!new RegExp(`id:\\s*["']${id}["']`).test(rounds), id);
}

for (const id of ['works', 'details', 'spots']) {
  assert(new RegExp(`id:\\s*["']${id}["']`).test(rounds), id);
}

assert(rounds.includes('GENERAL_BASE = Object.freeze(["people", "objects", "brands"])'));
assert(rounds.includes('NATURE_BASE = Object.freeze(["map", "flora", "fauna"])'));
assert(rounds.includes('CATEGORY_FOURTH_PRIORITIES'));
assert(rounds.includes('historie:    ["spots", "details", "works"]'));
assert(rounds.includes('musikk:      ["works", "spots", "details"]'));
assert(rounds.includes('subkultur:   ["works", "details", "spots"]'));
assert(rounds.includes('badge:BY_ID.get("badges")'));
assert(rounds.includes('roundCount = "4"'));
assert(rounds.includes('ensureBadgePlacement'));
console.log('Canonical badge plus category-dependent fourth round audit OK');
