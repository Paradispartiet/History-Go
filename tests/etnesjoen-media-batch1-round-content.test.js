const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const roundDocs = fs.readFileSync(path.join(repo, 'data/places/README_place_rounds.md'), 'utf8');
const storyIntegritySource = fs.readFileSync(path.join(repo, 'tools/check_stories_integrity.mts'), 'utf8');

const expectedRounds = ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const profileMatch = runtimeSource.match(/const CATEGORY_ROUND_PROFILES = Object\.freeze\((\{[\s\S]*?\})\);/);
assert(profileMatch, 'Runtime skal eksponere kategori-profilane statisk');
const profiles = Function(`return (${profileMatch[1]});`)();
assert.deepStrictEqual(profiles.media, expectedRounds, 'Grannar skal bruke den eksplisitte, dokumenterte medieprofilen');
assert(/media:\s*\npeople \| nature \| badges\nworks \| civication \| brands\nfør_nå \| fortellinger \| leksikon/.test(roundDocs), 'Medieprofilen skal stå i rundingsdokumentasjonen');
assert(/VALID_STORY_CATEGORIES[\s\S]*'media'/.test(storyIntegritySource), 'Story-integritetskontrollen skal godta den eksisterande media-kategorien');

const placePath = 'data/places/media/vestland/etne/grannar_redaksjon_etne.json';
const place = readJson(placePath)[0];
const peoplePath = 'data/people/media/vestland/etne/ann_margit_gronstad.json';
const person = readJson(peoplePath)[0];
const relations = readJson('data/relations.json');
const relation = relations.find((row) => row.id === 'rel_ann_margit_gronstad_grannar_redaksjon_etne');
const storyPath = 'data/stories/stories_etnesjoen_media_rounds_batch1.json';
const story = readJson(storyPath)[0];
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/media/leksikon_etnesjoen_media_rounds_batch1.json';
const article = readJson(leksikonPath)[0];
const leksikonManifest = readJson('data/leksikon/manifest.json');
const peopleManifest = readJson('data/people/manifest.json');
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));
const validEmneIds = new Set(readJson('data/fag/media/emner_media_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/media.json').sub);

assert.strictEqual(place.category, 'media', 'Grannar skal halde fram som mediestad');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks_profile', 'training_profile', 'play']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Grannar skal ikkje ha irrelevant eller manuell ${forbidden}`);
}

assert(person && person.id === 'ann_margit_gronstad', 'People-rundingen skal ha den dokumenterte ansvarlege redaktøren');
assert.strictEqual(person.placeId, place.id, 'Redaktøren skal ha redaksjonen som primæranker');
assert(person.places.includes(place.id), 'Redaktøren skal peike på redaksjonen i places');
assert(peopleManifest.files.includes('people/media/vestland/etne/ann_margit_gronstad.json'), 'Redaktøren skal vere manifestlasta');
assert(relation, 'People-rundingen skal ha ei eksplisitt person–stad-kopling');
assert.strictEqual(relation.person, person.id, 'Relasjonen skal peike på rett person');
assert.strictEqual(relation.place, place.id, 'Relasjonen skal peike på rett redaksjon');

assert(storyManifest.files.some((entry) => entry.category === 'media' && entry.path === storyPath), 'Medieforteljinga skal vere manifestlasta');
assert(leksikonManifest.files.includes(leksikonPath), 'Medieleksikonet skal vere manifestlasta');
assert.strictEqual(story.place_id, place.id, 'Forteljinga skal ha Grannar-redaksjonen som stadanker');
assert.strictEqual(story.person_id, null, 'Den institusjonshistoriske forteljinga skal ikkje dikte inn ein historisk hovudperson');
assert(story.related_people.includes(person.id), 'Forteljinga skal likevel kople den dokumenterte noverande redaktøren');
assert.strictEqual(article.place_id, place.id, 'Leksikonartikkelen skal ha Grannar-redaksjonen som stadanker');
assert.strictEqual(article.visual.designCode, 'article_media_history_miniature', 'Leksikonet skal bruke den presise mediehistoriske designkoden');
assert(article.links.entry_ids.includes(story.id), 'Leksikonet skal lenkje hovudforteljinga');

const roundContent = {
  people: [relation],
  nature: place.nature_profile,
  badges: place.underbadge_ids,
  works: place.works,
  civication: place.civication_store,
  brands: place.brands,
  før_nå: place.for_na,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, 'Grannar-innhaldet skal følgje medieprofilen i rett rekkjefølgje');
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Grannar manglar innhald i rundingen ${roundId}`);
}

assert(place.externalLinks.length >= 4 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Grannar skal ha kjeldekontrollerte HTTPS-lenkjer');
assert(place.emne_ids.every((id) => validEmneIds.has(id)), 'Grannar skal berre bruke kanoniske mediaemne');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Grannar skal berre bruke dokumenterte media-underbadges');
assert(place.works.length >= 4, 'Verk-rundingen skal ha fire stadsspesifikke publiserings- og produksjonsspor');
assert(place.civication_store.length >= 2, 'Civication-rundingen skal ha minst to samlingsobjekt');
assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objekta skal vere fysiske og stadsspesifikke');
assert(place.brands.length >= 4, 'Aktør-rundingen skal skilje avis, utgivar, historisk fusjonspartner og organisasjon');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal vere komplett');
assert(story.sources.length >= 3, 'Forteljinga skal ha minst tre kjelder');
assert(article.wikiText.length >= 3 && article.sources.length >= 4, 'Leksikonet skal ha full tekst og breitt kjeldegrunnlag');

assert.deepStrictEqual([place.lat, place.lon, place.year], [59.66414439895677, 5.940649457868514, 1973], 'Grannar skal behalde kontrollert kartanker og oppstartsår');
assert.strictEqual(placeIndex.get(place.id)?.year, 1973, 'Runtime-indeksen skal behalde Grannar sitt oppstartsår');

const combined = JSON.stringify({ place, story, article, relation });
assert(/1\. mars 1973/.test(combined) && /30\. september/.test(combined), 'Batchen skal skilje prøvenummeret frå ordinær drift');
assert(/1978/.test(combined) && /to utgåver|to papiraviser/.test(combined), 'Batchen skal dokumentere redaksjonsutvidinga');
assert(/1989/.test(combined) && /Vindafjordingen/.test(combined), 'Batchen skal dokumentere avisfusjonen');
assert(/nettavis/.test(combined) && /eAvis/.test(combined) && /app/.test(combined), 'Batchen skal dokumentere dagens hybride publisering');
assert(/Landslaget for lokalaviser/.test(combined), 'Batchen skal dokumentere Grannar-miljøet sitt lokalavisinitiativ');

console.log('Etnesjøen media batch 1 round content OK');
