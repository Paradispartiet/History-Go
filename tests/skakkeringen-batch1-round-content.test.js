const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');

const profileMatch = runtimeSource.match(/const CATEGORY_ROUND_PROFILES = Object\.freeze\((\{[\s\S]*?\})\);/);
assert(profileMatch, 'Runtime skal eksponere kategori-profilane statisk');
const profiles = Function(`return (${profileMatch[1]});`)();
const expectedRounds = ['people', 'training', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
assert.deepStrictEqual(profiles.sport, expectedRounds, 'Skakkeringen skal bruke sportprofilen');

const place = readJson('data/places/sport/vestland/etne/skakkeringen_etne.json')[0];
const people = readJson('data/people/sport/vestland/etne/people_sport_etne_batch1.json');
const relations = readJson('data/relations.json').filter((row) => row.place === place.id);
const storiesPath = 'data/stories/stories_etnesjoen_sport_rounds_batch1.json';
const story = readJson(storiesPath).find((row) => row.id === 'st_skakkeringen_fra_asfaltflate_til_bygdehjarte');
const articlePath = 'data/leksikon/places/vestland/etne/sport/leksikon_etnesjoen_sport_rounds_batch1.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validEmneIds = new Set(readJson('data/fag/sport/emner_sport_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/sport.json').sub);

assert.strictEqual(place.id, 'skakkeringen_etne');
assert.strictEqual(place.category, 'sport');
assert.strictEqual(place.year, 2024);
assert.deepStrictEqual([place.lat, place.lon], [59.6672, 5.9409], 'Det representative uteområdeankeret skal bevarast');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks_profile', 'play', 'nature_profile']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Skakkeringen skal ikkje få irrelevant eller manuell ${forbidden}`);
}

const christine = people.find((row) => row.id === 'christine_gjermo');
const ellen = people.find((row) => row.id === 'ellen_reitan');
assert(christine && ellen, 'Begge dokumenterte landskapsarkitektar skal finnast');
assert(relations.some((row) => row.person === christine.id), 'Christine Gjermo skal ha eksplisitt person–stad-kopling');
assert(relations.some((row) => row.person === ellen.id), 'Ellen Reitan skal ha eksplisitt person–stad-kopling');

assert(storyManifest.files.some((entry) => entry.category === 'sport' && entry.path === storiesPath), 'Forteljingsfila skal vere manifestlasta');
assert(leksikonManifest.files.includes(articlePath), 'Leksikonfila skal vere manifestlasta');
assert(story && story.place_id === place.id, 'Skakkeringen skal ha eiga forteljing');
assert(article && article.place_id === place.id, 'Skakkeringen skal ha eigen leksikonartikkel');
assert.strictEqual(article.visual.designCode, 'article_sports_history_miniature');
assert(article.links.entry_ids.includes(story.id));

const roundContent = {
  people: relations,
  training: place.training_profile,
  badges: place.underbadge_ids,
  works: place.works,
  civication: place.civication_store,
  brands: place.brands,
  før_nå: place.for_na,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds);
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Skakkeringen manglar innhald i rundingen ${roundId}`);
}

assert(place.externalLinks.length >= 6 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)));
assert(place.emne_ids.every((id) => validEmneIds.has(id)), 'Berre kanoniske sportsemne er tillatne');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Berre dokumenterte sport-underbadges er tillatne');
assert.strictEqual(place.training_profile.exercises.length, 3);
assert(/ope|open|skuleaktivitet|arrangement/i.test(place.training_profile.safety));
assert(/tørt|is|grus|hindringar/i.test(place.training_profile.safety));
assert(/ikkje bruk klatreutstyr|trampoline|skatebowl/i.test(place.training_profile.safety));
assert(place.works.length >= 5);
assert(place.civication_store.length >= 2);
assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true));
assert(place.brands.length >= 5);
assert(place.for_na.before && place.for_na.now && place.for_na.change);
assert(story.sources.length >= 6);
assert(article.wikiText.length >= 3 && article.sources.length >= 7);

const combined = JSON.stringify({ place, people, relations, story, article });
for (const token of ['2022', '2024', '2025', '2026', 'raud', 'asfaltflate', 'medverknad']) {
  assert(combined.toLowerCase().includes(token.toLowerCase()), `Batchen manglar ${token}`);
}
assert(/Christine Gjermo/.test(combined) && /Ellen Reitan/.test(combined));
assert(/International Architecture Award 2025/.test(combined));
assert(/kongebesøk/.test(combined));
assert(/eige utandørs|utandørs stadobjekt|ikkje.*kultursenter/i.test(combined), 'Skakkeringen skal haldast skild frå Skakke kultursenter');

console.log('Skakkeringen batch 1 round content OK');
