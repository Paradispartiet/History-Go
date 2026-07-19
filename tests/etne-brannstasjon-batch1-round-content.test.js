const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const roundDocs = fs.readFileSync(path.join(repo, 'data/places/README_place_rounds.md'), 'utf8');

const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];
const profileMatch = runtimeSource.match(/const CATEGORY_ROUND_PROFILES = Object\.freeze\((\{[\s\S]*?\})\);/);
assert(profileMatch, 'Runtime skal eksponere kategori-profilane statisk');
const profiles = Function(`return (${profileMatch[1]});`)();
assert.deepStrictEqual(profiles.politikk, expectedRounds, 'Etne brannstasjon skal bruke politikkprofilen');
assert(/politikk:\s*\npeople \| works \| badges\nfør_nå \| civication \| brands\nnature \| fortellinger \| leksikon/.test(roundDocs), 'Politikkprofilen skal stå i dokumentasjonen');

const placePath = 'data/places/politikk/vestland/etne/etne_brannstasjon.json';
const place = readJson(placePath);
const peoplePath = 'data/people/politikk/vestland/etne/inge_seim.json';
const person = readJson(peoplePath)[0];
const peopleManifest = readJson('data/people/manifest.json');
const relations = readJson('data/relations.json');
const relation = relations.find((row) => row.id === 'rel_inge_seim_etne_brannstasjon');
const storyPath = 'data/stories/stories_etnesjoen_politikk_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_etne_brannstasjon_fra_ny_etat_til_lokal_beredskapsbase');
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/politikk/leksikon_etnesjoen_politikk_rounds_batch1.json';
const article = readJson(leksikonPath).find((row) => row.place_id === place.id);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validUnderbadgeIds = new Set(readJson('data/badges/politikk.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.category, 'politikk', 'Etne brannstasjon skal halde fram som politikkstad');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks_profile', 'training_profile', 'play']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Brannstasjonen skal ikkje ha irrelevant eller manuell ${forbidden}`);
}

assert(person && person.id === 'inge_seim', 'People-rundingen skal bruke den dokumenterte brannsjefen');
assert.strictEqual(person.placeId, place.id, 'Brannsjefen skal ha Etne brannstasjon som primæranker');
assert(person.places.includes(place.id) && person.places.includes('skanevik_brannstasjon'), 'Brannsjefen skal peike på begge dokumenterte stasjonar');
assert(peopleManifest.files.includes('people/politikk/vestland/etne/inge_seim.json'), 'Brannsjefen skal vere manifestlasta');
assert(relation, 'People-rundingen skal ha eksplisitt person–stad-kopling');
assert.strictEqual(relation.person, person.id);
assert.strictEqual(relation.place, place.id);

assert(storyManifest.files.some((entry) => entry.category === 'politikk' && entry.path === storyPath), 'Politikkforteljinga skal vere manifestlasta');
assert(leksikonManifest.files.includes(leksikonPath), 'Politikkleksikonet skal vere manifestlasta');
assert(story && story.place_id === place.id, 'Forteljinga skal ha Etne brannstasjon som stadanker');
assert.strictEqual(story.person_id, person.id, 'Forteljinga skal bruke dokumentert brannsjef');
assert(article && article.place_id === place.id, 'Leksikonartikkelen skal ha Etne brannstasjon som stadanker');
assert(article.links.entry_ids.includes(story.id), 'Leksikonet skal lenkje hovudforteljinga');

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
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, 'Etne brannstasjon skal fylle politikkprofilen i rett rekkjefølgje');
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Etne brannstasjon manglar innhald i rundingen ${roundId}`);
}

assert(place.externalLinks.length >= 4 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Brannstasjonen skal ha offisielle HTTPS-kjelder');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Brannstasjonen skal berre bruke kanoniske politikk-underbadges');
assert(place.works.length >= 4, 'Verk-rundingen skal dokumentere køyretøy, støtteutstyr og førebygging');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objekta skal vere fysiske og stadsspesifikke');
assert(place.brands.length >= 4, 'Aktør-rundingen skal dokumentere teneste, kommune, førebygging og naudnummer');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal vere komplett');
assert(place.nature_profile.themes.length >= 5, 'Natur-rundingen skal vere konkret om tørke, terreng og vatn');
assert(article.wikiText.length >= 4 && article.sources.length >= 4, 'Leksikonet skal ha full tekst og breitt kjeldegrunnlag');
assert(story.sources.length >= 4, 'Forteljinga skal ha minst fire offisielle kjeldepunkt');

assert.deepStrictEqual([place.lat, place.lon, place.year], [59.668576636879024, 5.943861929172312, null], 'Brannstasjonen skal behalde kontrollert kartanker og ukjent byggeår');
assert.strictEqual(placeIndex.get(place.id)?.year, null, 'Runtime-indeksen skal behalde ukjent byggeår');

const combined = JSON.stringify({ place, person, relation, story, article });
assert(/1\. januar 2023/.test(combined), 'Batchen skal dokumentere etableringa av den nye etaten');
assert(/10 000/.test(combined) && /2 200/.test(combined), 'Batchen skal dokumentere begge vasstankane');
assert(/Ford Ranger/.test(combined) && /Ziegler/.test(combined) && /ATV/.test(combined), 'Batchen skal dokumentere støtteutstyret');
assert(/tilsyn/.test(combined) && /feiing/.test(combined) && /opplæring/.test(combined), 'Batchen skal dokumentere førebyggjande arbeid');
assert(!/slik sløkkjer|gå inn i|angrip brannen|bruk slangen slik/i.test(combined), 'Batchen skal ikkje gi operative brann- eller redningsinstruksjonar');

console.log('Etne brannstasjon batch 1 round content OK');
