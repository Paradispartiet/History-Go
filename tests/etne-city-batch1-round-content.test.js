const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const cityProfileMatch = runtimeSource.match(/by:\s*\[([^\]]+)\]/);
assert(cityProfileMatch, 'Runtime skal ha ein dokumentert byprofil');
const runtimeRounds = JSON.parse(`[${cityProfileMatch[1]}]`);
assert.deepStrictEqual(runtimeRounds, expectedRounds, 'Byprofilen skal velje dei dokumenterte ni rundingane');

const primaryPersonIds = {
  etnesjoen_tettstad: 'etnesjoen_sentrumsmiljoet',
  etnesjoen_torg_og_kai: 'etnesjoen_kai_og_torgmiljoet',
  kyrping_handelsstad: 'kyrping_ferdsels_og_handelsmiljoet',
  skanevik_ferjekai: 'skanevik_ferjemiljoet',
  skanevik_sentrum: 'morten_rosendahl_skanevik'
};
const collectivePersonIds = new Set([
  'etnesjoen_sentrumsmiljoet',
  'etnesjoen_kai_og_torgmiljoet',
  'kyrping_ferdsels_og_handelsmiljoet',
  'skanevik_ferjemiljoet'
]);
const expectedCoordinates = {
  etnesjoen_tettstad: [59.66480336942738, 5.93304783527308],
  etnesjoen_torg_og_kai: [59.66489494369154, 5.934465720587056],
  kyrping_handelsstad: [59.75, 6.11667],
  skanevik_ferjekai: [59.7334, 5.9327],
  skanevik_sentrum: [59.73304523331509, 5.934334449411551]
};
const placeIds = Object.keys(primaryPersonIds);
const places = new Map(placeIds.map((id) => {
  const rows = readJson(`data/places/by/vestland/etne/${id}.json`);
  assert(Array.isArray(rows) && rows.length === 1, `${id} skal liggje som éi oppføring i den splitta stadfila`);
  return [id, rows[0]];
}));

const relations = readJson('data/relations.json');
const peopleManifest = readJson('data/people/manifest.json');
const peoplePath = 'people/by/vestland/etne/people_by_etne_rounds_batch1.json';
const people = readJson(`data/${peoplePath}`);
const personById = new Map(people.map((person) => [person.id, person]));
const storyManifest = readJson('data/stories/stories_manifest.json');
const storyPath = 'data/stories/stories_etne_by_rounds_batch1.json';
const stories = readJson(storyPath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/by/leksikon_etne_by_rounds_batch1.json';
const articles = readJson(leksikonPath);

assert(peopleManifest.files.includes(peoplePath), 'People-manifestet skal laste Etne by-batch 1');
assert(storyManifest.files.some((entry) => entry.category === 'by' && entry.path === storyPath), 'Stories-manifestet skal laste Etne by-batch 1 med rett kategori');
assert(leksikonManifest.files.includes(leksikonPath), 'Leksikonmanifestet skal laste Etne by-batch 1');

const storyByPlace = new Map(stories.map((story) => [story.place_id, story]));
const articleByPlace = new Map(articles.map((article) => [article.place_id, article]));

for (const placeId of placeIds) {
  const place = places.get(placeId);
  const story = storyByPlace.get(placeId);
  const article = articleByPlace.get(placeId);
  const placeRelations = relations.filter((row) => row.place === placeId && row.person === primaryPersonIds[placeId]);
  const roundContent = {
    people: placeRelations,
    nature: place.nature_profile,
    badges: place.underbadge_ids,
    works: place.works,
    civication: place.civication_store,
    brands: place.brands,
    før_nå: place.for_na,
    fortellinger: story ? [story] : [],
    leksikon: article ? [article] : []
  };

  assert.strictEqual(place.category, 'by', `${placeId} skal bruke byprofilen`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'rounds'), `${placeId} skal ikkje overstyre den dokumenterte kategoriprofilen`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'rundinger'), `${placeId} skal ikkje ha ei alternativ rundingsoverstyring`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'routes'), `${placeId} skal bruke før_nå og ikkje routes`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'tasks'), `${placeId} skal ikkje få oppgåver i byprofilen`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'play'), `${placeId} skal ikkje få leikerunding`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'training'), `${placeId} skal ikkje få treningsrunding`);
  assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, `${placeId} sitt innhald skal følgje rekkjefølgja i byprofilen`);

  for (const [roundId, value] of Object.entries(roundContent)) {
    const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
    assert(filled, `${placeId} manglar innhald i rundingen ${roundId}`);
  }

  const personId = primaryPersonIds[placeId];
  const person = personById.get(personId);
  assert(person, `${placeId} manglar people-oppføringa ${personId}`);
  assert.deepStrictEqual(person.places, [placeId], `${personId} skal berre peike på kjeldestaden`);
  assert.strictEqual(person.category, 'by', `${personId} skal høyre til byprofilen`);
  if (collectivePersonIds.has(personId)) {
    assert(/kollektivt/i.test(person.popupDesc), `${personId} skal vere tydeleg merkt som kollektivt miljøanker`);
  } else {
    assert(/1785/.test(person.popupDesc), 'Morten Rosendahl skal vere kopla til den kjeldebelagde starten i 1785');
  }

  assert.deepStrictEqual(placeRelations.map((row) => row.person), [personId], `${placeId} skal ha den planlagde people-koplinga`);
  assert.strictEqual(story.person_id, personId, `${placeId} si forteljing skal bruke det planlagde menneskeankeret`);
  assert(story.sources.length >= 2, `${placeId} si forteljing skal ha minst to kjelder`);
  assert(article.wikiText.length >= 3, `${placeId} skal ha ein full leksikontekst`);
  assert(article.sources.length >= 2, `${placeId} sin leksikonartikkel skal ha minst to kjelder`);
  assert(article.links.entry_ids.includes(story.id), `${placeId} sin leksikonartikkel skal kople hovudforteljinga`);
  assert(place.externalLinks.length >= 2 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), `${placeId} skal ha kjeldekontrollerte HTTPS-lenkjer`);
  assert(place.works.length >= 3, `${placeId} skal ha minst tre stadsspesifikke verk eller spor`);
  assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), `${placeId} sine Civication-objekt skal vere fysiske og stadsspesifikke`);
  assert.deepStrictEqual([place.lat, place.lon], expectedCoordinates[placeId], `${placeId} skal behalde det kontrollerte kartankeret`);
}

const etnesjoenStory = storyByPlace.get('etnesjoen_tettstad').story;
assert(/Etnepollen/.test(etnesjoenStory) && /E134/.test(etnesjoenStory), 'Etnesjøen skal forklare både fjord- og vegaksen');
assert(/representativt sentrumsanker/i.test(etnesjoenStory), 'Etnesjøen skal skilje kartankeret frå ei offisiell tettstadsgrense');

const waterfrontStory = storyByPlace.get('etnesjoen_torg_og_kai').story;
assert(/båtar.*folk.*varer/is.test(waterfrontStory) && /torghandel/i.test(waterfrontStory), 'Torg- og kaiforteljinga skal halde den historiske sjøfrontaktiviteten synleg');
assert(/planteikning er ikkje det same som eit ferdig byrom/i.test(waterfrontStory), 'Torg- og kaiforteljinga skal skilje vedteken plan frå ferdig stad');

const kyrpingStory = storyByPlace.get('kyrping_handelsstad').story;
assert(/1842/.test(kyrpingStory), 'Kyrping skal tidfeste opninga for formell handel');
assert(/Ferdselsknutepunktet er altså eldre enn handelsverksemda/i.test(kyrpingStory), 'Kyrping skal skilje den eldre ferdsla frå den seinare handelen');
assert(/ikkje gjere eitt hus til heile handelsstaden/i.test(kyrpingStory), 'Kyrping skal ikkje gjerast om til eitt udokumentert handelsbygg');

const ferryStory = storyByPlace.get('skanevik_ferjekai').story;
assert(/Skånevik–Matre–Utåker/.test(ferryStory), 'Ferjekaia skal nemne det kjeldekontrollerte sambandet');
assert(/MF Matre/.test(ferryStory) && /plug-in hybrid elektrisk/.test(ferryStory) && /batteripakkar/.test(ferryStory), 'Ferjekaia skal halde fartøy og batteriteknologi samla');
assert(/er ikkje den same staden/i.test(ferryStory), 'Ferjeterminalen skal skiljast frå sentrum og nabomarkørane');

const skanevikStory = storyByPlace.get('skanevik_sentrum').story;
assert(/Frå 1785.*Morten Rosendahl/s.test(skanevikStory), 'Skånevik sentrum skal halde Rosendahl og 1785 samla');
assert(/Berre to bygningar står att/i.test(skanevikStory), 'Skånevik sentrum skal dokumentere tapet av handelsbygningar');
assert(/1979/.test(skanevikStory), 'Skånevik sentrum skal ta med starten på det dokumenterte vernearbeidet');
assert(/enkeltbygningane og ferjeterminalen får framleis eigne/i.test(skanevikStory), 'Sentrumskortet skal halde presise nabomarkørar skilde');

console.log('Etne city batch 1 round content OK');
