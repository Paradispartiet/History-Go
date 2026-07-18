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
assert.deepStrictEqual(profiles.sport, expectedRounds, 'Pumptracken skal bruke den dokumenterte sportprofilen');

const placePath = 'data/places/sport/vestland/etne/etne_pumptrack.json';
const place = readJson(placePath)[0];
const peopleManifest = readJson('data/people/manifest.json');
const mayorPath = 'people/politikk/vestland/etne/mette_heidi_ekrheim_bergsvaag.json';
const builderPath = 'people/sport/vestland/etne/people_etne_pumptrack_batch1.json';
const mayor = readJson(`data/${mayorPath}`)[0];
const builder = readJson(`data/${builderPath}`).find((person) => person.id === 'dzintrs_vitols');
const relations = readJson('data/relations.json');
const mayorRelation = relations.find((row) => row.id === 'rel_mette_heidi_ekrheim_bergsvaag_etne_pumptrack');
const builderRelation = relations.find((row) => row.id === 'rel_dzintrs_vitols_etne_pumptrack');
const storyPath = 'data/stories/stories_etnesjoen_sport_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_etne_pumptrack_opning_med_sykkelkjetting');
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/sport/leksikon_etnesjoen_sport_rounds_batch1.json';
const article = readJson(leksikonPath).find((row) => row.place_id === place.id);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validEmneIds = new Set(readJson('data/fag/sport/emner_sport_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/sport.json').sub);

assert.strictEqual(place.id, 'etne_pumptrack');
assert.strictEqual(place.category, 'sport');
assert.strictEqual(place.year, 2024);
assert.deepStrictEqual([place.lat, place.lon], [59.6682165, 5.9418366]);
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks_profile', 'play', 'nature_profile']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Pumptracken skal ikkje få irrelevant eller manuell ${forbidden}`);
}

assert(peopleManifest.files.includes(mayorPath), 'Ordføraren skal vere manifestlasta');
assert(peopleManifest.files.includes(builderPath), 'Det eksisterande Dzintrs Vitols-kortet skal vere manifestlasta');
for (const person of [mayor, builder]) {
  assert(person, 'Begge people-ankera skal finnast');
  assert.strictEqual(person.placeId, place.id);
  assert(person.places.includes(place.id));
  assert(Array.isArray(person.source_urls) && person.source_urls.length >= 1);
}
assert(mayorRelation && mayorRelation.place === place.id && mayorRelation.person === mayor.id);
assert(builderRelation && builderRelation.place === place.id && builderRelation.person === builder.id);

assert(storyManifest.files.some((entry) => entry.category === 'sport' && entry.path === storyPath), 'Pumptrackforteljinga skal vere manifestlasta');
assert(leksikonManifest.files.includes(leksikonPath), 'Sportsleksikonet skal vere manifestlasta');
assert(story && story.place_id === place.id);
assert.deepStrictEqual(story.person_ids, [mayor.id, builder.id]);
assert(article && article.place_id === place.id);
assert.strictEqual(article.visual.designCode, 'article_sports_history_miniature');
assert(article.links.entry_ids.includes(story.id));

const roundContent = {
  people: [mayorRelation, builderRelation],
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
  assert(filled, `Etne pumptrack manglar innhald i rundingen ${roundId}`);
}

assert(place.externalLinks.length >= 3 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)));
assert(place.emne_ids.every((id) => validEmneIds.has(id)), 'Berre kanoniske sportsemne er tillatne');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Berre dokumenterte sport-underbadges er tillatne');
assert.strictEqual(place.training_profile.exercises.length, 3);
assert(/hjelm|beskyttelse/i.test(place.training_profile.safety));
assert(/tørr|fri|avstand|ikkje stopp/i.test(place.training_profile.safety));
assert(place.works.length >= 4);
assert(place.civication_store.length >= 2);
assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true));
assert(place.brands.length >= 3);
assert(place.for_na.before && place.for_na.now && place.for_na.change);
assert(story.sources.length >= 3);
assert(article.wikiText.length >= 3 && article.sources.length >= 3);

const combined = JSON.stringify({ place, mayor, builder, mayorRelation, builderRelation, story, article });
assert(/15\. juni 2024|2024-06-15/.test(combined), 'Den dokumenterte opningsdatoen skal vere med');
assert(/1 200|1200/.test(combined), 'Den dokumenterte storleiken skal vere med');
assert(/wallride/i.test(combined) && /to table tops|table tops/i.test(combined), 'Dei dokumenterte formelementa skal vere med');
assert(/sykkelkjetting/i.test(combined), 'Den stadsspesifikke opningssnora skal vere med');
assert(/Dzintrs Vitols/.test(combined) && /med på å byggje|medbyggjar|medbyggjaren/i.test(combined));
assert(/BMX- og skateparken|BMX-\/skateparken/i.test(combined), 'Pumptracken skal avgrensast mot skateparken');
assert(/2024.*pumptrack|pumptrack.*2024/i.test(combined), 'Året 2024 skal bindast til pumptracken');
assert(/ikkje.*BMX|skal ikkje.*BMX|utan å.*BMX/i.test(combined), 'Året og anleggsfakta skal ikkje flyttast til BMX-/skateparken');
assert(!/backflip|salto|avansert trikstrening|hoppinstruksjon/i.test(combined), 'Rundinga skal ikkje gi risikofylt trikkinstruksjon');

console.log('Etne pumptrack batch 1 round content OK');
