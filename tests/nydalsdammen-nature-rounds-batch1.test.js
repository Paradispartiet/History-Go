const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const expectedRounds = ['tasks', 'nature', 'badges', 'training', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];

const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtimeSource.match(/natur:\s*\[([^\]]+)\]/);
assert(profileMatch, 'Runtime skal ha naturprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds, 'Nydalsdammen skal bruke de ni natur-rundingene');

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/nydalsdammen.json';
const place = readJson(placePath);
const storiesPath = 'data/stories/stories_nydalsdammen.json';
const story = readJson(storiesPath).find((row) => row.id === 'st_nydalsdammen_vann_som_styres');
const articlePath = 'data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const validBadges = new Set(readJson('data/badges/natur.json').sub);
const placeIds = new Set(readJson('data/places/places_index.json').map((row) => row.id));
const storyManifest = readJson('data/stories/stories_manifest_natur_batch_01.json');
const leksikonManifest = readJson('data/leksikon/manifest.json');

assert.strictEqual(place.id, 'nydalsdammen');
assert.strictEqual(place.category, 'natur');
assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.9458, 10.766, 120, 1860]);
for (const forbidden of ['rounds', 'rundinger', 'routes', 'works', 'people', 'play_profile', 'flora', 'fauna']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Nydalsdammen skal ikke ha ${forbidden}`);
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
  assert(filled, `Nydalsdammen mangler ${roundId}`);
}

assert(place.externalLinks.length >= 6 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Kildelenker skal være komplette HTTPS-lenker');
assert(place.underbadge_ids.length >= 5 && place.underbadge_ids.every((id) => validBadges.has(id)), 'Natur-underbadges skal være kanoniske');
assert(place.tasks_profile.tasks.length >= 3, 'Oppgaver-rundingen skal ha minst tre stedsspesifikke oppgaver');
assert(place.training_profile.exercises.length >= 3 && /ingen svømming/i.test(place.training_profile.safety), 'Trening skal være tørr og sikker');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject && item.placeSpecific), 'Civication skal ha fysiske stedsspesifikke objekter');
assert(place.brands.length >= 5, 'Aktør-rundingen skal dekke historisk og moderne forvaltning');
assert(typeof place.for_na.before === 'string' && typeof place.for_na.now === 'string' && place.for_na.look_for.length >= 4, 'Før/nå skal være runtime-lesbar');
assert(place.nature_profile.summary.length >= 400 && place.nature_profile.themes.length >= 6, 'Natur-rundingen skal være fyldig');
assert.strictEqual(new Set(place.nature_profile.themes).size, place.nature_profile.themes.length, 'Naturtemaene skal være unike');
assert.deepStrictEqual(place.nature_profile.nearby_place_ids, ['frysjadammen', 'nydalen_industristed', 'stilla_nydalen']);
for (const id of place.nature_profile.nearby_place_ids) assert(placeIds.has(id), `Ukjent nærkobling ${id}`);

assert(story.sources.length >= 6 && story.related_places.includes('seilduksfabrikken_nydalen'), 'Fortellingen skal være kildebelagt og koblet til industrilandskapet');
assert(article.sources.length >= 6 && article.facts.length >= 4 && article.chronology.length >= 4, 'Leksikonartikkelen skal være komplett');
const combined = JSON.stringify({ place, story, article });
for (const year of ['1845', '1934', '1991', '1992']) assert(combined.includes(year), `Nydalsdammen skal dokumentere ${year}`);
assert(/øvre vanninntak/i.test(combined));
assert(/Nydalens Compagnie/.test(combined));
assert(/kraftig regn/i.test(combined));
assert(!/badevannskvaliteten er (god|tilstrekkelig|dårlig|utmerket)/i.test(combined), 'Dynamisk badevannsvurdering skal ikke hardkodes');

console.log('Nydalsdammen nature rounds batch 1 OK');
