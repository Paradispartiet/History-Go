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
assert.deepStrictEqual(profiles.politikk, expectedRounds, 'Skånevik brannstasjon skal bruke politikkprofilen');
assert(/politikk:\s*\npeople \| works \| badges\nfør_nå \| civication \| brands\nnature \| fortellinger \| leksikon/.test(roundDocs), 'Politikkprofilen skal stå i dokumentasjonen');

const placePath = 'data/places/politikk/vestland/etne/skanevik_brannstasjon.json';
const place = readJson(placePath);
const peoplePath = 'data/people/politikk/vestland/etne/inge_seim.json';
const person = readJson(peoplePath)[0];
const relations = readJson('data/relations.json');
const relation = relations.find((row) => row.id === 'rel_inge_seim_skanevik_brannstasjon');
const storyPath = 'data/stories/stories_etnesjoen_politikk_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_skanevik_brannstasjon_fra_2009_bil_til_ny_scania');
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/politikk/leksikon_etnesjoen_politikk_rounds_batch1.json';
const article = readJson(leksikonPath).find((row) => row.place_id === place.id);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validUnderbadgeIds = new Set(readJson('data/badges/politikk.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.category, 'politikk', 'Skånevik brannstasjon skal halde fram som politikkstad');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks_profile', 'training_profile', 'play']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Brannstasjonen skal ikkje ha irrelevant eller manuell ${forbidden}`);
}

assert(person && person.id === 'inge_seim', 'People-rundingen skal bruke den dokumenterte brannsjefen');
assert.strictEqual(person.placeId, 'etne_brannstasjon', 'Brannsjefen skal behalde Etne hovudstasjon som primæranker');
assert(person.places.includes('etne_brannstasjon') && person.places.includes(place.id), 'Brannsjefen skal peike på begge dokumenterte stasjonar');
assert(relation, 'People-rundingen skal ha eksplisitt person–stad-kopling');
assert.strictEqual(relation.person, person.id);
assert.strictEqual(relation.place, place.id);

assert(storyManifest.files.some((entry) => entry.category === 'politikk' && entry.path === storyPath), 'Politikkforteljinga skal vere manifestlasta');
assert(leksikonManifest.files.includes(leksikonPath), 'Politikkleksikonet skal vere manifestlasta');
assert(story && story.place_id === place.id, 'Forteljinga skal ha Skånevik brannstasjon som stadanker');
assert.strictEqual(story.person_id, person.id, 'Forteljinga skal bruke dokumentert brannsjef');
assert(article && article.place_id === place.id, 'Leksikonartikkelen skal ha Skånevik brannstasjon som stadanker');
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
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, 'Skånevik brannstasjon skal fylle politikkprofilen i rett rekkjefølgje');
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Skånevik brannstasjon manglar innhald i rundingen ${roundId}`);
}

assert(place.externalLinks.length >= 4 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Brannstasjonen skal ha offisielle HTTPS-kjelder');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Brannstasjonen skal berre bruke kanoniske politikk-underbadges');
assert(place.works.length >= 5, 'Verk-rundingen skal dokumentere bilfornying, støtteutstyr og førebygging');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objekta skal vere fysiske og stadsspesifikke');
assert(place.brands.length >= 4, 'Aktør-rundingen skal dokumentere teneste, kommune, lokalt mannskap og naudnummer');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal vere komplett');
assert(place.nature_profile.themes.length >= 5, 'Natur-rundingen skal vere konkret om tørke, trehus, avstandar og vatn');
assert(article.wikiText.length >= 4 && article.sources.length >= 4, 'Leksikonet skal ha full tekst og breitt kjeldegrunnlag');
assert(story.sources.length >= 4, 'Forteljinga skal ha minst fire offisielle kjeldepunkt');

assert.deepStrictEqual([place.lat, place.lon, place.year], [59.72875, 5.93592, null], 'Brannstasjonen skal behalde kontrollert kartanker og ukjent byggeår');
assert.strictEqual(placeIndex.get(place.id)?.year, null, 'Runtime-indeksen skal behalde ukjent byggeår');

const combined = JSON.stringify({ place, person, relation, story, article });
assert(/2009/.test(combined) && /2 500/.test(combined), 'Batchen skal dokumentere den erstatta bilen');
assert(/2025/.test(combined) && /Scania/.test(combined) && /5 000/.test(combined), 'Batchen skal dokumentere den nye brannbilen');
assert(/2024/.test(combined) && /framskoten/.test(combined), 'Batchen skal dokumentere den nye framskotne eininga');
assert(/barnehage/.test(combined) && /førebygg/.test(combined), 'Batchen skal dokumentere førebyggjande arbeid');
assert(/fleire mannskap|rekruttering/.test(combined), 'Batchen skal dokumentere behovet for lokale mannskap');
assert(!/slik sløkkjer|gå inn i|angrip brannen|bruk slangen slik|køyr fram til/i.test(combined), 'Batchen skal ikkje gi operative brann- eller redningsinstruksjonar');

console.log('Skånevik brannstasjon batch 1 round content OK');
