const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const expectedRounds = ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const byProfileMatch = runtimeSource.match(/by:\s*\[([^\]]+)\]/);
assert(byProfileMatch, 'Runtime skal ha en dokumentert byprofil');
assert.deepStrictEqual(JSON.parse(`[${byProfileMatch[1]}]`), expectedRounds, 'Canonical Nydalen skal bruke byprofilens ni rundinger');

const place = readJson('data/places/by/oslo/places/nydalen.json');
const people = readJson('data/people/natur/oslo/people_natur_oslo.json');
const adam = people.find((row) => row.id === 'adam_severin_hiorth_nydalen');
const oluf = people.find((row) => row.id === 'oluf_onsum_christiania_spigerverk');
const stories = readJson('data/stories/stories_nydalsdammen.json');
const story = stories.find((row) => row.id === 'st_nydalen_industristed_fra_fossedal_til_bydel');
const articles = readJson('data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json');
const article = articles.find((row) => row.place_id === 'nydalen');
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));
const validUnderbadgeIds = new Set(readJson('data/badges/historie.json').sub);

assert.strictEqual(place.id, 'nydalen');
assert.strictEqual(place.category, 'by');
assert.strictEqual(place.coordStatus, 'verified_geometry');
assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.9497, 10.7675, 260, 2000]);
assert.strictEqual(placeIndex.get('nydalen')?.year, 2000);
assert(!placeIndex.has('nydalen_industristed'));
for (const person of [adam, oluf]) {
  assert(person, 'Begge dokumenterte industripersonene skal beholdes');
  assert.strictEqual(person.placeId, 'nydalen');
  assert(person.places.includes('nydalen'));
}
assert(story && story.place_id === 'nydalen');
assert(article && article.place_id === 'nydalen');
assert(Array.isArray(place.works) && place.works.length >= 7);
assert(place.for_na?.before && place.for_na?.now && place.for_na?.change);
assert(Array.isArray(place.civication_store) && place.civication_store.length >= 2);
assert(place.civication_store.every((item) => item.collection === 'nydalen'));
assert(Array.isArray(place.brands) && place.brands.length >= 5);
assert(Array.isArray(place.externalLinks) && place.externalLinks.length >= 5);
assert(Array.isArray(place.underbadge_ids) && place.underbadge_ids.length >= 4);
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)));
assert(place.nature_profile?.summary?.length >= 300);
for (const nearby of ['nydalsdammen', 'stilla_nydalen', 'seilduksfabrikken_nydalen']) assert(place.nature_profile.nearby_place_ids.includes(nearby));
const combined = JSON.stringify({ place, adam, oluf, story, article });
for (const year of ['1845', '1847', '1853', '1864', '1989', '1990']) assert(combined.includes(year));
assert(/Nydalens Compagnie/.test(combined));
assert(/Christiania Spigerverk/.test(combined));
assert(/Akerselva/.test(combined));
assert(!combined.includes('\"nydalen_industristed\"'));
console.log('Canonical Nydalen preserves migrated industrial round content');
