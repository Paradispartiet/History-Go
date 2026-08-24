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

for (const id of ['civication', 'works', 'details', 'spots', 'før_nå', 'fortellinger', 'leksikon', 'play', 'training', 'tasks']) {
  assert(!new RegExp(`id:\\s*["']${id}["']`).test(rounds), id);
}

for (const id of ['productions', 'structures', 'competitions', 'related', 'destinations']) {
  assert(new RegExp(`${id}:\\s*\\{\\s*id:["']${id}["']`).test(rounds), id);
}
assert(!/images:\s*\{\s*id:["']images["']/.test(rounds));

assert(rounds.includes('GENERAL_BASE = Object.freeze(["people", "objects", "brands"])'));
assert(rounds.includes('NATURE_BASE = Object.freeze(["map", "flora", "fauna"])'));
assert(rounds.includes('CATEGORY_FOURTH'));
assert(rounds.includes('kunst:"productions"'));
assert(rounds.includes('sport:"competitions"'));
assert(rounds.includes('historie:"related"'));
assert(rounds.includes('by:"structures"'));
assert(rounds.includes('natur:"destinations"'));
assert(rounds.includes('place_card_profile'));
assert(rounds.includes('round_profile_v1_adapter'));
assert(rounds.includes('id === "images"'));
assert(rounds.includes('PRODUCTION_LABELS'));
assert(rounds.includes('badge:BY_ID.get("badges")'));
assert(rounds.includes('collectionCount = String(selected.length)'));
assert(rounds.includes('history_go_place_card_profile_v2'));
assert(rounds.includes('ensureBadgePlacement'));
assert(rounds.includes('ensureQuizAction'));

assert(contract.includes('Bilder er medieinnhold, ikke samling'));
assert(contract.includes('to, tre eller fire kvalifiserte samlinger'));
assert(contract.includes('People, Flora og Fauna'));
assert(contract.includes('generisk Verk'));
assert(contract.includes('Detaljer'));
assert(contract.includes('Punkter'));
console.log('Canonical PlaceCard collections v2 audit OK');
