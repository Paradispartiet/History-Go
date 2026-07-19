const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];

const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtimeSource.match(/historie:\s*\[([^\]]+)\]/);
assert(profileMatch, 'Runtime skal ha historieprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds, 'Nedre Foss skal bruke de ni historierundingene');

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/nedre_foss.json';
const place = readJson(placePath);
const index = readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json').find((row) => row.id === place.id);
const splitManifest = readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json');
const manifest = splitManifest.places.find((row) => row.id === place.id);
const personPath = 'data/people/naeringsliv/oslo/akerselva/friedrich_gruner.json';
const friedrich = readJson(personPath)[0];
const peopleManifest = readJson('data/people/manifest.json');
const storyPath = 'data/stories/stories_nedre_foss.json';
const story = readJson(storyPath).find((row) => row.place_id === 'nedre_foss');
const storyManifest = readJson('data/stories/stories_manifest.json');
const article = readJson('data/leksikon/places/oslo/historie/leksikon_oslo_historie_nedre_foss.json');
const relations = readJson('data/relations.json');
const validBadges = new Set(readJson('data/badges/historie.json').sub);
const placeIds = new Set(readJson('data/places/places_index.json').map((row) => row.id));

assert.strictEqual(place.id, 'nedre_foss');
assert.strictEqual(place.name, 'Nedre Foss');
assert.strictEqual(place.category, 'historie');
assert.strictEqual(place.year, 1220, '1220 skal markere første dokumenterte omtale av kvernstedet');
assert.deepStrictEqual([place.lat, place.lon, place.r], [59.9256, 10.7435, 140], 'Koordinater og radius skal ikke endres i rundingsbatchen');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'training', 'play', 'flora', 'fauna']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Nedre Foss skal ikke ha ${forbidden}`);
}

assert(index && index.year === 1220 && index.file.endsWith('/nedre_foss.json'), 'Ruteindeksen skal være synkronisert');
assert(manifest && /^[0-9a-f]{64}$/.test(manifest.sha256), 'Split-manifestet skal ha ny hash');
const splitHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(repo, placePath))).digest('hex');
assert.strictEqual(manifest.sha256, splitHash, 'Split-manifest-hash skal matche Nedre Foss-filen');

assert(peopleManifest.files.includes(personPath.replace(/^data\//, '')), 'Friedrich Grüner-filen skal være manifestlastet');
assert.strictEqual(friedrich.id, 'friedrich_gruner');
assert.strictEqual(friedrich.placeId, 'nedre_foss');
assert(friedrich.places.includes('nedre_foss'));
assert(friedrich.source_urls.length >= 2, 'Friedrich Grüner skal ha dokumentert kildegrunnlag');
assert(friedrich.image === '' && friedrich.cardImage === '', 'Personen skal ikke få oppdiktede bilder');
assert(relations.some((row) => row.id === 'rel_friedrich_gruner_nedre_foss_eier_1672' && row.person === friedrich.id && row.place === 'nedre_foss'), 'Friedrich Grüner-relasjonen mangler');

assert(story, 'Nedre Foss-fortellingen mangler');
assert.strictEqual(story.person_id, 'friedrich_gruner');
assert(story.related_people.includes('friedrich_gruner'));
assert(story.sources.length >= 4, 'Fortellingen skal være eksternt kildebelagt');
assert(storyManifest.files.some((row) => row.entity_id === 'nedre_foss' && row.path === storyPath), 'Fortellingen skal være manifestlastet');

const roundContent = {
  people: [friedrich],
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
  assert(filled, `Nedre Foss mangler ${roundId}`);
}

assert(place.externalLinks.length >= 6 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Kildelenker skal være komplette');
assert(place.underbadge_ids.length >= 4 && place.underbadge_ids.every((id) => validBadges.has(id)), 'Historie-underbadges skal være kanoniske');
assert(place.works.length >= 6, 'Verk-rundingen skal dekke mølle, park og moderne elvetiltak');
assert(place.civication_store.length >= 4 && place.civication_store.every((item) => item.physicalObject && item.placeSpecific), 'Civication skal ha fysiske stedsspesifikke objekter');
assert(place.brands.length >= 5, 'Aktør-rundingen skal dekke hovedaktørene gjennom tidslagene');
assert(place.for_na.before && place.for_na.now && place.for_na.look_for.length >= 7, 'Før/nå skal være komplett');
assert(place.nature_profile.summary.length >= 600 && place.nature_profile.themes.length >= 8, 'Natur-rundingen skal være fyldig uten oppdiktede arter');
assert.deepStrictEqual(place.nature_profile.nearby_place_ids, ['kuba_parken', 'beierbrua', 'vulkan_industriomrade']);
for (const id of place.nature_profile.nearby_place_ids) assert(placeIds.has(id), `Ukjent nærkobling ${id}`);

assert.strictEqual(article.version, 2);
assert(article.sources.length >= 6, 'Leksikonet skal ha eksterne kilder');
assert(article.facts.length >= 10, 'Leksikonet skal ha stedsspesifikke fakta');
assert(article.chronology.length >= 7, 'Leksikonet skal ha en dokumentert kronologi');
assert(article.links.related_people.includes('friedrich_gruner'));

const combined = JSON.stringify({ place, friedrich, story, article });
for (const year of ['1220', '1537', '1672', '1723', '1985', '1986', '2017']) {
  assert(combined.includes(year), `Nedre Foss skal dokumentere ${year}`);
}
for (const fact of ['Kongens mølle', 'Hovedøya kloster', 'laksetrapp', 'regnbed', 'Lars Fiske']) {
  assert(combined.includes(fact), `Nedre Foss skal dokumentere ${fact}`);
}
assert(/første dokumenterte|dokumentert.*1220/i.test(combined), '1220 skal forklares som dokumentasjon, ikke fossens alder');
assert(/offentlig|turvei|lovlig/i.test(place.nature_profile.summary), 'Trygg offentlig observasjon skal være tydelig');

console.log('Nedre Foss history rounds batch 1 OK');
