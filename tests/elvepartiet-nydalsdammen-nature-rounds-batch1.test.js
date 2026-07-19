const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const expectedRounds = ['tasks', 'nature', 'badges', 'training', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];

const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtimeSource.match(/natur:\s*\[([^\]]+)\]/);
assert(profileMatch, 'Runtime skal ha naturprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds, 'Stedet skal bruke de ni natur-rundingene');

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/stilla_nydalen.json';
const storiesPath = 'data/stories/stories_stilla_nydalen.json';
const articlePath = 'data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json';
const quizPath = 'data/quiz/natur/stilla_nydalen_sets.json';
const place = readJson(placePath);
const story = readJson(storiesPath).find((row) => row.id === 'st_stilla_nydalen_elva_som_senker_farten');
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const quiz = readJson(quizPath);
const validBadges = new Set(readJson('data/badges/natur.json').sub);
const placeIds = new Set(readJson('data/places/places_index.json').map((row) => row.id));
const natureMap = readJson('data/natur/nature_oslo_expansion_place_map.json').places[place.id];
const storyManifest = readJson('data/stories/stories_manifest_natur_batch_01.json');
const leksikonManifest = readJson('data/leksikon/manifest.json');
const routeIndex = readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json').find((row) => row.id === place.id);
const routeManifest = readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json').places.find((row) => row.id === place.id);

assert.strictEqual(place.id, 'stilla_nydalen');
assert.strictEqual(place.name, 'Elvepartiet nedenfor Nydalsdammen');
assert.strictEqual(place.category, 'natur');
assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.9449, 10.7654, 120, 1900]);
assert.strictEqual(routeIndex.name, place.name);
assert.strictEqual(routeManifest.name, place.name);
for (const forbidden of ['rounds', 'rundinger', 'routes', 'works', 'people', 'play_profile', 'flora', 'fauna']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Stedet skal ikke ha ${forbidden}`);
}

assert(storyManifest.files.some((entry) => entry.path === storiesPath), 'Story-filen skal være manifestlastet');
assert(leksikonManifest.files.includes(articlePath), 'Leksikonfilen skal være manifestlastet');
assert(story && story.place_id === place.id && story.person_id === null, 'Fortellingen skal være stedskoblet uten oppdiktet person');
assert(article && article.place_id === place.id, 'Leksikon-rundingen skal ha egen artikkel');

const roundContent = {
  tasks: place.tasks_profile,
  nature: place.nature_profile,
  badges: place.underbadge_ids,
  training: place.training_profile,
  civication: place.civication_store,
  brands: place.brands,
  før_nå: place.for_na,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds);
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Stedet mangler ${roundId}`);
}

assert(place.externalLinks.length >= 7 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Kildelenker skal være komplette HTTPS-lenker');
assert(place.underbadge_ids.length >= 5 && place.underbadge_ids.every((id) => validBadges.has(id)), 'Natur-underbadges skal være kanoniske');
assert(place.tasks_profile.tasks.length >= 3, 'Oppgaver-rundingen skal ha minst tre stedsspesifikke oppgaver');
assert(place.training_profile.exercises.length >= 3 && /ingen svømming/i.test(place.training_profile.safety), 'Trening skal være tørr og sikker');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject && item.placeSpecific), 'Civication skal ha fysiske stedsspesifikke objekter');
assert(place.brands.length >= 5, 'Aktør-rundingen skal være fylt');
assert(typeof place.for_na.before === 'string' && typeof place.for_na.now === 'string' && place.for_na.look_for.length >= 5, 'Før/nå skal være runtime-lesbar');
assert(place.nature_profile.summary.length >= 450 && place.nature_profile.themes.length >= 7, 'Natur-rundingen skal være fyldig');
assert.strictEqual(new Set(place.nature_profile.themes).size, place.nature_profile.themes.length, 'Naturtemaene skal være unike');
assert.deepStrictEqual(place.nature_profile.nearby_place_ids, ['nydalsdammen', 'seilduksfabrikken_nydalen', 'bjoelsenparken_elvenaer']);
for (const id of place.nature_profile.nearby_place_ids) assert(placeIds.has(id), `Ukjent nærkobling ${id}`);

assert(natureMap && natureMap.flora.length >= 10 && natureMap.fauna.length >= 3, 'Dokumenterte artskartkoblinger skal beholdes');
assert(story.sources.length >= 6 && story.related_places.includes('nydalsdammen'), 'Fortellingen skal være kildebelagt og stedskoblet');
assert(article.sources.length >= 8 && article.facts.length >= 5 && article.chronology.length >= 4, 'Leksikonartikkelen skal være komplett');

const combined = JSON.stringify({ place, story, article, quiz });
assert(/historiske Stilla/.test(combined), 'Rettelsen skal forklare hvor historiske Stilla ligger');
assert(/Svensenga/.test(combined));
assert(/Brekkefossen/.test(combined));
assert(/Nydalsdammen/.test(combined));
assert(!/Stilla ved Nydalen/.test(combined), 'Feil visningsnavn skal være fjernet');
assert(!/Stilla i Nydalen/.test(combined), 'Feil quiznavn skal være fjernet');
assert(!/populært badested ved dette punktet/i.test(combined), 'Badehistorien skal ikke flyttes til feil punkt');

console.log('Elvepartiet below Nydalsdammen nature rounds batch 1 OK');
