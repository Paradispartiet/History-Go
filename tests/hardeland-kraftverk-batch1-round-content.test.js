const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtimeSource.match(/naeringsliv:\s*\[([^\]]+)\]/);
assert(profileMatch, 'Runtime skal ha en dokumentert næringslivsprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds, 'Næringslivsprofilen skal velge de ni dokumenterte rundingene');

const placePath = 'data/places/naeringsliv/vestland/etne/hardeland_kraftverk.json';
const placeRows = readJson(placePath);
assert(Array.isArray(placeRows) && placeRows.length === 1, 'Hardeland skal ligge som én canonical place');
const place = placeRows[0];

const peoplePath = 'data/people/naeringsliv/vestland/etne/people_naeringsliv_etne_batch2.json';
const people = readJson(peoplePath);
const person = people.find((row) => row.id === 'arild_tesdal');
const storyPath = 'data/stories/stories_hardeland_kraftverk.json';
const story = readJson(storyPath).find((row) => row.place_id === place.id);
const articlePath = 'data/leksikon/places/vestland/etne/naeringsliv/leksikon_hardeland_kraftverk_rounds_batch1.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const storyManifest = readJson('data/stories/stories_manifest_naeringsliv_batch_01.json');
const leksikonManifest = readJson('data/leksikon/manifest.json');
const peopleManifest = readJson('data/people/manifest.json');

assert(peopleManifest.files.includes('people/naeringsliv/vestland/etne/people_naeringsliv_etne_batch2.json'), 'Eksisterende People-manifest skal laste batchen med Arild Tesdal');
assert(storyManifest.files.some((entry) => entry.category === 'naeringsliv' && entry.entity_id === place.id && entry.path === storyPath), 'Næringslivsmanifestet skal laste Hardeland-fortellingen');
assert(leksikonManifest.files.includes(articlePath), 'Leksikonmanifestet skal laste Hardeland-artikkelen');

assert.strictEqual(place.id, 'hardeland_kraftverk');
assert.strictEqual(place.category, 'naeringsliv');
assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.65761, 6.09643, 260, 1950], 'Kontrollert kartanker, radius og hovedår skal være uendret');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Hardeland skal ikke ha feltet ${forbidden}`);
}

assert(person, 'People-rundingen skal ha Arild Tesdal som dokumentert arbeidslivsanker');
assert.strictEqual(person.placeId, place.id);
assert(person.places.includes(place.id) && person.places.includes('litledalen_kraftverk'), 'People-kortet skal gjenspeile det dokumenterte felles driftsmiljøet');
assert(/vannmåling/i.test(person.popupDesc) && /maskin/i.test(person.popupDesc), 'People-kortet skal være knyttet til konkret drift og vedlikehold');
assert(story && story.person_id === person.id, 'Fortellingen skal bruke arbeidslivsankeret');
assert(article, 'Leksikon-rundingen skal ha en Hardeland-artikkel');
assert(article.links.entry_ids.includes(story.id), 'Leksikonartikkelen skal koble hovedfortellingen');

const roundContent = {
  people: [person],
  works: place.works,
  badges: place.underbadge_ids,
  før_nå: place.for_na,
  civication: place.civication_store,
  brands: place.brands,
  nature: place.nature_profile,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, 'Innholdet skal følge næringslivsprofilens rekkefølge');
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Hardeland mangler innhold i rundingen ${roundId}`);
}

assert(place.externalLinks.length >= 5 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Hardeland skal ha kildekontrollerte HTTPS-lenker');
assert(place.works.length >= 6, 'Verk-rundingen skal dekke H, K, 2025-fornyelsen, vannveier og driftssystem');
assert(place.civication_store.length >= 3 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(place.brands.length >= 6, 'Brands-rundingen skal dekke eier, produksjonslinjer, register og system');
assert(place.nature_profile.themes.length >= 6, 'Natur-rundingen skal forklare fall, vannveier og regulering');
assert(story.sources.length >= 5 && article.sources.length >= 5, 'Fortelling og leksikon skal ha fullt kildegrunnlag');
assert(article.wikiText.length >= 5 && article.facts.length >= 5 && article.chronology.length >= 5, 'Leksikonartikkelen skal være fylt');

const combined = JSON.stringify({ place, person, story, article });
assert(/1950/.test(combined) && /1958/.test(combined) && /2025/.test(combined), 'Alle tre tekniske hovedår skal være synlige');
assert(/Hardeland H/.test(combined) && /Hardeland K/.test(combined) && /Nye Hardeland/.test(combined), 'H, K og Nye Hardeland skal holdes tydelig fra hverandre');
assert(/ett fysisk|samme kraftverksmiljø|eitt industristed/i.test(combined), 'Innholdet skal forklare hvorfor dette er ett canonical sted');
assert(!/opprett.*to.*kartmarkør|to separate kartmarkører skal opprettes/i.test(combined), 'Innholdet skal ikke anbefale H/K-duplikater');
assert(!/arter ved stedet|flora ved stedet|fauna ved stedet/i.test(combined), 'Natur-rundingen skal ikke dikte inn arter');

console.log('Hardeland kraftverk batch 1 round content OK');
