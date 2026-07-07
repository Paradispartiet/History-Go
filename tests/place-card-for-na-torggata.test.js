const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const placeCardJs = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const torggata = JSON.parse(fs.readFileSync(path.join(repo, 'data/places/by/oslo/places/torggata.json'), 'utf8'));

assert(torggata.rounds.includes('før_nå'), 'Torggata skal beholde før_nå-rundingen');
assert(torggata.for_na, 'Torggata skal ha for_na-innhold');
assert.strictEqual(torggata.for_na.title, 'Torggata før og nå');
for (const field of ['before', 'now', 'change']) {
  assert(String(torggata.for_na[field] || '').length > 80, `for_na.${field} skal være konkret`);
}
assert(Array.isArray(torggata.for_na.lookFor), 'for_na.lookFor skal være liste');
assert(torggata.for_na.lookFor.length >= 3, 'for_na.lookFor skal ha observasjoner');
assert(Array.isArray(torggata.for_na.sources), 'for_na.sources skal være liste');
assert(torggata.for_na.sources.length >= 2, 'for_na.sources skal vise kildegrunnlag');

assert(placeCardJs.includes('function renderPlaceCardForNa'), 'PlaceCard skal rendre for_na');
assert(placeCardJs.includes('renderPlaceCardForNa(currentPlace || place)'), 'Før/nå-popup skal bruke for_na-renderer');
assert(placeCardJs.includes('setRoundLabel(forNaIcon, "🕰️", forNaData ? 1 : "")'), 'Før/nå-runding skal markere innhold');
