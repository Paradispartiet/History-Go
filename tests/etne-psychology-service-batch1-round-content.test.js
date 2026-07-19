const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const byMatch = runtimeSource.match(/const BY = \[([^\]]+)\]/);
assert(byMatch, 'Runtime skal ha standardprofilen BY');
const defaultRounds = JSON.parse(`[${byMatch[1]}]`);
const explicitPsychMatch = runtimeSource.match(/psykologi:\s*\[([^\]]+)\]/);
const psychologyRounds = explicitPsychMatch ? JSON.parse(`[${explicitPsychMatch[1]}]`) : defaultRounds;
assert.deepStrictEqual(psychologyRounds, expectedRounds, 'Psykologi skal bruke den dokumenterte standardprofilen');

const placePaths = {
  psykisk_helse_rus_etne: 'data/places/psykologi/vestland/etne/psykisk_helse_rus_etne.json',
  psykisk_helse_rus_skanevik: 'data/places/psykologi/vestland/etne/psykisk_helse_rus_skanevik.json'
};
const places = Object.fromEntries(Object.entries(placePaths).map(([id, file]) => [id, readJson(file)[0]]));
const peoplePath = 'data/people/psykologi/vestland/etne/people_etne_psykisk_helse_rus_batch1.json';
const people = readJson(peoplePath);
const person = people.find((row) => row.id === 'fagmiljoet_psykisk_helse_og_rus_etne');
const peopleManifest = readJson('data/people/manifest.json');
const allRelations = readJson('data/relations.json');
const relations = allRelations.filter((row) => row.person === person?.id);
const storyPath = 'data/stories/stories_etne_psykologi_rounds_batch1.json';
const stories = readJson(storyPath);
const storyManifest = readJson('data/stories/stories_manifest.json');
const articlePath = 'data/leksikon/places/vestland/etne/psykologi/leksikon_etne_psykologi_rounds_batch1.json';
const articles = readJson(articlePath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validUnderbadgeIds = new Set(readJson('data/badges/psykologi.json').sub);
const placeIndexRows = readJson('data/places/places_index.json');
const placeIndex = new Map(placeIndexRows.map((row) => [row.id, row]));
const activePlaceIds = new Set(placeIndexRows.map((row) => row.id));

assert.strictEqual(people.length, 1, 'People-filen skal ha ett avgrenset kollektivt fagmiljøanker');
assert(person, 'Manglende kollektivt People-anker');
assert.strictEqual(person.kind, 'kollektivt_fagmiljoanker');
assert.strictEqual(person.placeId, 'psykisk_helse_rus_etne');
assert.deepStrictEqual(person.places, ['psykisk_helse_rus_etne', 'psykisk_helse_rus_skanevik']);
assert(/ikkje navngitte tilsette, brukarar eller pasienthistorier/.test(person.popupDesc), 'People-kortet skal ha eksplisitt personvernavgrensning');
assert(peopleManifest.files.includes(peoplePath.replace(/^data\//, '')), 'People-filen skal være manifestlastet');
assert.strictEqual(relations.length, 2, 'Det kollektive fagmiljøet skal ha én relasjon til hver besøksstad');
for (const placeId of Object.keys(places)) {
  assert(relations.some((row) => row.place === placeId), `Manglende People-relasjon for ${placeId}`);
}
assert(storyManifest.files.some((entry) => entry.category === 'psykologi' && entry.path === storyPath), 'Psykologi-storyfilen skal være manifestlastet');
assert(leksikonManifest.files.includes(articlePath), 'Psykologi-leksikonfilen skal være manifestlastet');

const expectations = {
  psykisk_helse_rus_etne: {
    coordinates: [59.665179, 5.935823, 180, 2026],
    storyId: 'st_etne_psykisk_helse_fra_direkte_kontakt_til_koordinert_oppfolging',
    articleTitle: /Psykisk helse og rus i Etne/,
    nearby: ['etne_senter', 'etneelva', 'etneelva_forskningsplattform']
  },
  psykisk_helse_rus_skanevik: {
    coordinates: [59.733255, 5.93776, 160, 2026],
    storyId: 'st_skanevik_psykisk_helse_eitt_fagmiljo_to_besoksstader',
    articleTitle: /Psykisk helse og rus i Skånevik/,
    nearby: ['skanevik_sentrum', 'skanevik_gjestgjevargarden', 'skanevik_kultur_og_idrettshall']
  }
};

for (const [placeId, expected] of Object.entries(expectations)) {
  const place = places[placeId];
  assert(place && place.id === placeId, `Manglende place ${placeId}`);
  assert.strictEqual(place.category, 'psykologi');
  for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
    assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `${placeId} skal ikke ha ${forbidden}`);
  }

  const placeRelations = relations.filter((row) => row.place === placeId);
  const story = stories.find((row) => row.id === expected.storyId);
  const article = articles.find((row) => row.place_id === placeId);
  assert.strictEqual(placeRelations.length, 1, `${placeId} skal ha ett kollektivt People-anker`);
  assert(story && story.place_id === placeId && story.person_id === person.id, `${placeId} mangler koblet fortelling`);
  assert(article && expected.articleTitle.test(article.title), `${placeId} mangler leksikonartikkel`);
  assert(article.links.entry_ids.includes(story.id), `${placeId} sitt leksikon skal lenke fortellingen`);

  const roundContent = {
    people: placeRelations,
    nature: place.nature_profile,
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
    assert(filled, `${placeId} mangler ${roundId}`);
  }

  assert(place.externalLinks.length >= 6 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), `${placeId} skal ha minst seks offisielle HTTPS-kilder`);
  assert(place.works.length >= 8, `${placeId} skal ha minst åtte dokumenterte serviceverk`);
  assert(place.civication_store.length >= 3 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), `${placeId} sine Civication-objekter skal være fysiske og stedsspesifikke`);
  assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), `${placeId} har ugyldig psykologi-underbadge`);
  assert(place.brands.length >= 6, `${placeId} skal ha minst seks institusjonelle aktører`);
  assert(place.for_na.before && place.for_na.now && place.for_na.change, `${placeId} mangler før/nå`);
  assert(Array.isArray(place.nature_profile.species) && place.nature_profile.species.length === 1, `${placeId} skal vise den ene eksplisitt dokumenterte dyrkingsarten først`);
  assert.strictEqual(place.nature_profile.species[0].id, 'tomat');
  assert.strictEqual(place.nature_profile.species[0].latin_navn, 'Solanum lycopersicum');
  assert(/ingen full feltinventering|Det finst ingen full feltinventering/.test(place.nature_profile.species_scope), `${placeId} skal avgrense artsgrunnlaget`);
  assert.deepStrictEqual(place.nature_profile.nearby_place_ids, expected.nearby, `${placeId} skal bruke kanoniske nearby-ID-er`);
  for (const nearbyId of expected.nearby) {
    assert(activePlaceIds.has(nearbyId), `Ugyldig nearby-ID for ${placeId}: ${nearbyId}`);
  }
  assert(story.sources.length >= 6 && article.sources.length >= 6, `${placeId} skal ha bredt offisielt kildegrunnlag`);
  assert(article.wikiText.length >= 6 && article.facts.length >= 6 && article.chronology.length >= 4, `${placeId} sitt leksikon skal være fylt`);
  assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], expected.coordinates, `${placeId} skal beholde kartanker, radius og dokumentasjonsår`);
  assert.strictEqual(placeIndex.get(placeId)?.year, 2026, `${placeId} skal beholde 2026 i runtime-indeksen`);
}

const combined = JSON.stringify({ places, person, relations, stories, articles });
assert(/utan tilvising frå lege|uten legehenvisning/.test(combined), 'Lågterskel direkte kontakt skal være dokumentert');
assert(/kognitiv terapi/.test(combined) && /pårørandesamtal/.test(combined), 'Dokumenterte oppfølgingsformer skal være synlige');
assert(/individuell plan/.test(combined) && /koordinator/.test(combined), 'Koordinering skal være dokumentert');
assert(/BrukarPlan/.test(combined) && /reservasjon/.test(combined) && /innsyn/.test(combined) && /retting/.test(combined) && /sletting/.test(combined), 'BrukarPlan-rettene skal være synlige');
assert(/Skånevikvegen 17/.test(combined) && /Holmavegen 24/.test(combined), 'Begge separate besøksadresser skal være synlige');
assert(/eitt kommunalt fagmiljø|same kommunale.*teneste/i.test(combined), 'Stedene skal bindes sammen som én tjeneste');
assert(/to separate|to ulike fysiske|separat besøksstad/i.test(combined), 'Byggene skal holdes fysisk adskilt');
assert(/annonsert plan|planlagt.*ikkje.*fullført|ikke.*fullført resultat/i.test(combined), 'Skånevik-plantearbeidet skal avgrenses som plan');
assert(!/pasientnavn|brukarnamn|fødselsnummer|personnummeret til/i.test(combined), 'Datasettet skal ikke inneholde direkte helseidentifikatorer');
assert(!/diagnosen til|pasienten har|brukaren har diagnosen/i.test(combined), 'Datasettet skal ikke konstruere pasienthistorier');
assert(!/2026 er byggeår|bygd i 2026|reist i 2026/i.test(combined), 'Dokumentasjonsåret skal ikke gjøres til byggeår');

console.log('Etne psychology service batch 1 round content OK');
