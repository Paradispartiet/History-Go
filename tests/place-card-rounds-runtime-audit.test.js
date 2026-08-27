const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const card = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const rounds = fs.readFileSync(path.join(repo, 'js/ui/place-rounds-visual-collections.js'), 'utf8');
const adaptive = fs.readFileSync(path.join(repo, 'js/ui/place-rounds-fill-layout.js'), 'utf8');
const layout = fs.readFileSync(path.join(repo, 'css/place-rounds-fill-layout.css'), 'utf8');
const contract = fs.readFileSync(path.join(repo, 'data/places/README_place_rounds.md'), 'utf8');
const workflow = fs.readFileSync(path.join(repo, 'docs/PLACE_PRODUCTION_CHECKLIST.md'), 'utf8');
const profiles = fs.readFileSync(path.join(repo, 'docs/PLACE_PRODUCTION_PROFILES.md'), 'utf8');

assert(!card.includes('const PLACE_ROUND_REGISTRY = ['));
assert(!card.includes('CATEGORY_ROUND_PROFILES'));
assert(!card.includes('applyPlaceRounds(place);'));

for (const id of ['civication', 'works', 'details', 'spots', 'før_nå', 'fortellinger', 'leksikon', 'play', 'training', 'tasks']) {
  assert(!new RegExp(`id:\\s*["']${id}["']`).test(rounds), id);
}

for (const id of ['productions', 'structures', 'competitions', 'related', 'destinations']) {
  assert(new RegExp(`${id}:\\s*\\{\\s*id:["']${id}["']`).test(rounds), id);
}
assert(!/images:\s*\{\s*id:["']images["']/.test(rounds));

assert(rounds.includes('GENERAL_BASE = Object.freeze(["people", "objects", "brands"])'));
assert(rounds.includes('NATURE_BASE = Object.freeze(["flora", "fauna", "map"])'));
assert(rounds.includes('CATEGORY_FOURTH'));
assert(rounds.includes('place_card_profile'));
assert(rounds.includes('round_profile_v1_adapter'));
assert(rounds.includes('id === "images"'));
assert(rounds.includes('PRODUCTION_LABELS'));
assert(rounds.includes('badge:BY_ID.get("badges")'));
assert(rounds.includes('ensureBadgePlacement'));
assert(rounds.includes('ensureQuizAction'));

assert(adaptive.includes('place_card_profile_v2_curated'));
assert(adaptive.includes('hasRealPreview'));
assert(adaptive.includes('ids.length < 1 || ids.length > 4'));
assert(adaptive.includes('collectionRequestedCount'));

for (const count of ['1', '2', '3', '4']) {
  assert(layout.includes(`data-collection-count="${count}"`));
}
assert(layout.includes('data-collection-position="2"'));

for (const document of [contract, workflow, profiles]) {
  assert.match(document, /1.?[–-].?4|1–4/);
  assert.match(document, /ingen tomme|Ingen tomme/i);
  assert.match(document, /filler/i);
  assert.doesNotMatch(document, /tomt kort.*sluttstatus/i);
}

assert(contract.includes('Bilder / `images`'));
assert(contract.includes('People/Flora/Fauna'));
assert(contract.includes('Generisk') || contract.includes('generisk'));
assert(contract.includes('Details') || contract.includes('details'));
assert(contract.includes('Spots') || contract.includes('spots'));

console.log('Adaptive canonical PlaceCard collections audit OK');
