const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtimeSource.match(/naeringsliv:\s*\[([^\]]+)\]/);
assert(profileMatch, 'Runtime skal ha en dokumentert næringslivsprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds, 'Hardeland skal bruke næringslivsprofilen');

const place = readJson('data/places/naeringsliv/vestland/etne/hardeland_kraftverk.json')[0];
const peoplePath = 'data/people/naeringsliv/vestland/etne/people_hardeland_kraftverk_batch1.json';
const person = readJson(peoplePath)[0];
const peopleManifest = readJson('data/people/manifest.json');
const relation = readJson('data/relations.json').find((row) => row.id === 'rel_skl_driftsmiljoet_hardeland');
const storyPath = 'data/stories/stories_etnesjoen_naeringsliv_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_hardeland_fra_to_linjer_til_nytt_anlegg');
const storyManifest = readJson('data/stories/stories_manifest.json');
const articlePath = 'data/leksikon/places/vestland/etne/naeringsliv/leksikon_etnesjoen_naeringsliv_rounds_batch1.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validUnderbadgeIds = new Set(readJson('data/badges/naeringsliv.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.category, 'naeringsliv');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Hardeland skal ikke ha ${forbidden}`);
}

assert(person && person.id === 'skl_driftsmiljoet_litledalen_hardeland', 'People-rundingen skal bruke det dokumenterte kollektive driftsmiljøet');
assert.strictEqual(person.placeId, place.id, 'Hardeland skal være primæranker for det nye kollektive kortet');
assert(person.places.includes('hardeland_kraftverk') && person.places.includes('litledalen_kraftverk'), 'Driftsmiljøet skal peke på begge dokumenterte kraftverk');
assert(peopleManifest.files.includes(peoplePath.replace(/^data\//, '')), 'People-filen skal være manifestlastet');
assert(relation && relation.person === person.id && relation.place === place.id, 'People-rundingen skal ha eksplisitt relasjon');
assert(story && story.place_id === place.id && story.person_id === person.id, 'Fortellingen skal være forankret i stedet og driftsmiljøet');
assert(storyManifest.files.some((entry) => entry.category === 'naeringsliv' && entry.path === storyPath), 'Story-filen skal være manifestlastet');
assert(article && article.place_id === place.id, 'Leksikonartikkelen skal være forankret i Hardeland');
assert(article.links.entry_ids.includes(story.id), 'Leksikonet skal lenke hovedfortellingen');
assert(leksikonManifest.files.includes(articlePath), 'Leksikonfilen skal være manifestlastet');

const roundContent = {
  people: [relation],
  works: place.works,
  badges: place.underbadge_ids,
  før_nå: place.for_na,
  civication: place.civication_store,
  brands: place.brands,
  nature: place.nature_profile,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds);
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Hardeland mangler ${roundId}`);
}

assert(place.externalLinks.length >= 4 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Hardeland skal ha offisielle HTTPS-kilder');
assert(place.works.length >= 5, 'Verk-rundingen skal dokumentere H, K, drift, vedtak og 2025-fasen');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Alle næringslivs-underbadges skal være kanoniske');
assert(place.brands.length >= 4, 'Aktør-rundingen skal dokumentere SKL, driftsavdeling, NVE og kraftsystem');
assert(place.nature_profile.themes.length >= 5, 'Natur-rundingen skal dokumentere vassdrag, fallhøyder og energisystem');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal være komplett');
assert(story.sources.length >= 4, 'Fortellingen skal ha bredt kildegrunnlag');
assert(article.wikiText.length >= 4 && article.sources.length >= 4, 'Leksikonet skal ha full tekst og kilder');
assert.deepStrictEqual([place.lat, place.lon, place.year], [59.65761, 6.09643, 1950], 'Kartanker og historisk stedår skal bevares');
assert.strictEqual(placeIndex.get(place.id)?.year, 1950, 'Runtime-indeksen skal beholde 1950');

const combined = JSON.stringify({ place, person, relation, story, article });
assert(/1950/.test(combined) && /Hardeland H/.test(combined), 'Hardeland H fra 1950 skal være dokumentert');
assert(/1958/.test(combined) && /Hardeland K|seinare Hardeland-linja/.test(combined), 'Hardeland K fra 1958 skal være dokumentert');
assert(/2018/.test(combined) && /konsesjon|modernisering/.test(combined), 'Moderniseringsvedtaket skal være dokumentert');
assert(/2025/.test(combined) && /prøvedrift/.test(combined), 'Ny prøvedriftsfase i 2025 skal være dokumentert');
assert(/418,6/.test(combined) && /325/.test(combined), 'Begge dokumenterte fallhøyder skal være med');
assert(!/hardeland_h_kraftverk.*place_id|hardeland_k_kraftverk.*place_id/i.test(combined), 'Batchen skal ikke opprette separate H/K-steder');
assert(!/direktør for Hardeland|byggjeleiar for Hardeland|prosjektleiar for Hardeland/.test(combined), 'Batchen skal ikke dikte opp enkeltpersonroller');
assert(!/artar ved staden|flora ved staden|fauna ved staden/i.test(combined), 'Natur-rundingen skal ikke dikte inn arter');

console.log('Hardeland batch 1 round content OK');
