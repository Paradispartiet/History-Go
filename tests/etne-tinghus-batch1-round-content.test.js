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
assert.deepStrictEqual(profiles.politikk, expectedRounds, 'Tinghuset skal bruke den dokumenterte politikkprofilen');
assert(/politikk:\s*\npeople \| works \| badges\nfør_nå \| civication \| brands\nnature \| fortellinger \| leksikon/.test(roundDocs), 'Politikkprofilen skal stå i rundingsdokumentasjonen');

const placePath = 'data/places/politikk/vestland/etne/etne_tinghus.json';
const rawPlace = readJson(placePath);
const place = Array.isArray(rawPlace) ? rawPlace[0] : rawPlace;
const peoplePath = 'data/people/politikk/vestland/etne/people_etne_tinghus_batch1.json';
const person = readJson(peoplePath)[0];
const relations = readJson('data/relations.json');
const relation = relations.find((row) => row.id === 'rel_anna_molden_etne_tinghus');
const storyPath = 'data/stories/stories_etnesjoen_politikk_rounds_batch1.json';
const story = readJson(storyPath)[0];
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/politikk/leksikon_etnesjoen_politikk_rounds_batch1.json';
const article = readJson(leksikonPath)[0];
const leksikonManifest = readJson('data/leksikon/manifest.json');
const peopleManifest = readJson('data/people/manifest.json');
const validUnderbadgeIds = new Set(readJson('data/badges/politikk.json').sub);

assert.strictEqual(place.category, 'politikk', 'Etne Tinghus skal halde fram som politikkstad');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks_profile', 'training_profile', 'play']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Tinghuset skal ikkje ha irrelevant eller manuell ${forbidden}`);
}

assert(person && person.id === 'anna_molden', 'People-rundingen skal ha den dokumenterte arkitekten');
assert.strictEqual(person.placeId, place.id, 'Arkitekten skal ha Tinghuset som primæranker');
assert(person.places.includes(place.id), 'Arkitekten skal peike på Tinghuset i places');
assert(peopleManifest.files.includes('people/politikk/vestland/etne/people_etne_tinghus_batch1.json'), 'Arkitekten skal vere manifestlasta');
assert(relation, 'People-rundingen skal ha ei eksplisitt person–stad-kopling');
assert.strictEqual(relation.person, person.id, 'Relasjonen skal peike på rett person');
assert.strictEqual(relation.place, place.id, 'Relasjonen skal peike på rett stad');

assert(storyManifest.files.some((entry) => entry.category === 'politikk' && entry.entity_id === place.id && entry.path === storyPath), 'Tinghusforteljinga skal vere manifestlasta');
assert(leksikonManifest.files.includes(leksikonPath), 'Tinghusleksikonet skal vere manifestlasta');
assert.strictEqual(story.place_id, place.id, 'Forteljinga skal ha Tinghuset som stadanker');
assert(story.related_people.includes(person.id), 'Forteljinga skal kople den dokumenterte arkitekten');
assert.strictEqual(article.place_id, place.id, 'Leksikonartikkelen skal ha Tinghuset som stadanker');
assert.strictEqual(article.visual.designCode, 'article_civic_history_miniature', 'Leksikonet skal bruke presis samfunnshistorisk designkode');
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
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, 'Tinghusinnhaldet skal følgje politikkprofilen i rett rekkjefølgje');
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Etne Tinghus manglar innhald i rundingen ${roundId}`);
}

assert(place.externalLinks.length >= 5 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Tinghuset skal ha kjeldekontrollerte HTTPS-lenkjer');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Tinghuset skal berre bruke dokumenterte politikk-underbadges');
assert(place.works.length >= 4, 'Verk-rundingen skal ha minst fire stadsspesifikke spor');
assert(place.civication_store.length >= 2, 'Civication-rundingen skal ha minst to samlingsobjekt');
assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objekta skal vere fysiske og stadsspesifikke');
assert(place.brands.length >= 4, 'Aktør-rundingen skal skilje kommune, kommunestyre, administrasjon og entreprenør');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal vere komplett');
assert(place.nature_profile.themes.length >= 5 && /energibrønn/.test(JSON.stringify(place.nature_profile)), 'Natur-rundingen skal vere fysisk og presist avgrensa');
assert(story.sources.length >= 4, 'Forteljinga skal ha minst fire kjelder');
assert(article.wikiText.length >= 3 && article.sources.length >= 6, 'Leksikonet skal ha full tekst og breitt kjeldegrunnlag');

assert.deepStrictEqual([place.lat, place.lon, place.year], [59.66489494369154, 5.934465720587056, null], 'Tinghuset skal behalde kontrollert kartanker og ukjent byggeår i grunnrecorden');

const combined = JSON.stringify({ place, story, article, relation });
assert(/1968/.test(combined) && /Anna Molden/.test(combined), 'Batchen skal dokumentere arkitektverket frå 1968');
assert(/2025/.test(combined) && /skalet/.test(combined), 'Batchen skal dokumentere rivinga og det bevarte bygningsskalet');
assert(/energibrønn/.test(combined) && /vassboren/.test(combined), 'Batchen skal dokumentere energioppgraderinga');
assert(/estimert/.test(combined) && /4\. desember 2026/.test(combined), 'Ferdigdatoen skal omtalast som estimert');
assert(/mellombels/.test(combined) && /Sjoarvegen 20/.test(combined), 'Batchen skal skilje mellombels resepsjon frå permanent Tinghus');

console.log('Etne Tinghus batch 1 round content OK');
