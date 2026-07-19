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
assert.deepStrictEqual(profiles.sport, expectedRounds, 'Steinsvollen skal bruke den dokumenterte sportprofilen');

const placePath = 'data/places/sport/vestland/etne/steinsvollen_fotballanlegg.json';
const place = readJson(placePath)[0];
const peoplePath = 'people/sport/vestland/etne/pal_askvig.json';
const person = readJson(`data/${peoplePath}`)[0];
const peopleManifest = readJson('data/people/manifest.json');
const relations = readJson('data/relations.json');
const relation = relations.find((row) => row.id === 'rel_pal_askvig_steinsvollen_fotballanlegg');
const storyPath = 'data/stories/stories_etnesjoen_sport_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_steinsvollen_fem_baner_i_turneringsnettet');
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/sport/leksikon_etnesjoen_sport_rounds_batch1.json';
const article = readJson(leksikonPath).find((row) => row.place_id === place.id);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validEmneIds = new Set(readJson('data/fag/sport/emner_sport_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/sport.json').sub);

assert.strictEqual(place.id, 'steinsvollen_fotballanlegg');
assert.strictEqual(place.category, 'sport');
assert.strictEqual(place.year, null, 'Ukjent opningsår skal halde fram som null');
assert.deepStrictEqual([place.lat, place.lon], [59.66067892802325, 5.9787905867572855], 'Det kontrollerte representative kartankeret skal bevarast');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks_profile', 'play', 'nature_profile']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Steinsvollen skal ikkje få irrelevant eller manuell ${forbidden}`);
}

assert.strictEqual(peopleManifest.files.filter((file) => file === peoplePath).length, 1, 'Pål Askvig skal vere manifestlasta nøyaktig éin gong');
assert.strictEqual(person.id, 'pal_askvig');
assert.strictEqual(person.placeId, place.id);
assert.deepStrictEqual(person.places, [place.id]);
assert(Array.isArray(person.source_urls) && person.source_urls.length >= 6, 'People-kortet skal ha breitt offisielt kjeldegrunnlag');
assert(relation, 'People-rundingen skal ha ei eksplisitt person–stad-kopling');
assert.strictEqual(relation.person, person.id);
assert.strictEqual(relation.place, place.id);

assert(storyManifest.files.some((entry) => entry.category === 'sport' && entry.path === storyPath), 'Sportsforteljinga skal vere manifestlasta');
assert(leksikonManifest.files.includes(leksikonPath), 'Sportsleksikonet skal vere manifestlasta');
assert(story && story.place_id === place.id, 'Steinsvollen skal ha eiga forteljing');
assert.strictEqual(story.person_id, person.id, 'Forteljinga skal lenkje turneringsorganisatoren');
assert(article && article.place_id === place.id, 'Steinsvollen skal ha eigen leksikonartikkel');
assert.strictEqual(article.visual.designCode, 'article_sports_history_miniature');
assert(article.links.entry_ids.includes(story.id));

const roundContent = {
  people: [relation],
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
  assert(filled, `Steinsvollen manglar innhald i rundingen ${roundId}`);
}

assert(place.externalLinks.length >= 9 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Steinsvollen skal ha kontrollerte HTTPS-kjelder');
assert(place.emne_ids.every((id) => validEmneIds.has(id)), 'Berre kanoniske sportsemne er tillatne');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Berre dokumenterte sport-underbadges er tillatne');
assert.strictEqual(place.training_profile.exercises.length, 3);
assert(/open|ope|ledig|booking/i.test(place.training_profile.safety), 'Treninga skal krevje open og ledig flate');
assert(/våt|stengd|kamp|vedlikehald/i.test(place.training_profile.safety), 'Treninga skal verne graset og organisert aktivitet');
assert(/ikkje harde skot|ikkje.*lange pasningar/i.test(place.training_profile.safety), 'Treninga skal unngå risikofylt ballbruk');
assert(place.works.length >= 4);
assert(place.civication_store.length >= 2);
assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true));
assert(place.brands.length >= 3);
assert(place.for_na.before && place.for_na.now && place.for_na.change);
assert(story.sources.length >= 9, 'Forteljinga skal bruke Etnecup og heile NFF-kjelderekka');
assert(article.wikiText.length >= 3 && article.sources.length >= 9, 'Leksikonet skal vere fullstendig og breitt kjeldebelagt');

const combined = JSON.stringify({ place, person, relation, story, article });
assert(/51.{0,3}55/.test(combined), 'Dei fem nummererte kampflatene 51–55 skal dokumenterast');
assert(/7er/.test(combined) && /9er/.test(combined), 'Både 7er- og 9er-format skal dokumenterast');
assert(/fem minutt|5min|5 minutt/i.test(combined), 'Avstanden frå hovudområdet skal vere med');
assert(/klasse 9 og 10/.test(combined) && /utanom finalen/.test(combined), 'Steinsvollen si turneringsrolle skal vere presis');
for (const year of ['2021', '2023', '2024', '2025', '2026']) {
  assert(combined.includes(year), `Kjelderekka manglar ${year}`);
}
assert(/påmelding/.test(combined) && /kampoppsett/.test(combined) && /kampavvikling/.test(combined) && /dommar/.test(combined), 'People-koplinga skal byggje på dokumentert turneringsansvar');
assert(/ikkje.*opningsår|ikkje eit opningsår|ikkje.*anleggsår/i.test(combined), '2021 skal ikkje framstillast som opningsår');
assert(!/(?:blei|vart|var)\s+(?:opna|bygd)\s+i\s+2021/i.test(combined), 'Batchen skal ikkje dikte bygge- eller opningshistorie i 2021');
assert(/eitt stadobjekt|eitt samla fysisk anlegg|ikkje.*fem separate/i.test(combined), 'Dei fem kampflatene skal haldast samla i eitt stadobjekt');

console.log('Steinsvollen batch 1 round content OK');
