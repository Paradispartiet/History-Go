const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtimeSource.match(/naeringsliv:\s*\[([^\]]+)\]/);
assert(profileMatch, 'Runtime skal ha en dokumentert næringslivsprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds, 'SMV skal bruke næringslivsprofilen');

const place = readJson('data/places/naeringsliv/vestland/etne/sunnhordland_mek_verkstad_leknestangen.json')[0];
const museumPeoplePath = 'data/people/naeringsliv/vestland/etne/people_naeringsliv_etne_batch2.json';
const andersPeoplePath = 'data/people/naeringsliv/vestland/etne/people_smv_leknestangen_batch1.json';
const people = [...readJson(museumPeoplePath), ...readJson(andersPeoplePath)];
const peopleIds = ['anders_hovda', 'paul_hovda', 'gudvin_hovda'];
const peopleById = new Map(people.map((person) => [person.id, person]));
const relations = readJson('data/relations.json').filter((row) => row.place === place.id && peopleIds.includes(row.person));
const storyPath = 'data/stories/stories_etnesjoen_naeringsliv_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_smv_fra_seimsfoss_til_leknestangen');
const articlePath = 'data/leksikon/places/vestland/etne/naeringsliv/leksikon_etnesjoen_naeringsliv_rounds_batch1.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const peopleManifest = readJson('data/people/manifest.json');
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validUnderbadgeIds = new Set(readJson('data/badges/naeringsliv.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.category, 'naeringsliv');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `SMV skal ikke ha ${forbidden}`);
}
assert(peopleManifest.files.includes(museumPeoplePath.replace(/^data\//, '')), 'Museumspersonene skal være manifestlastet');
assert(peopleManifest.files.includes(andersPeoplePath.replace(/^data\//, '')), 'Anders Hovda-filen skal være manifestlastet');
assert(storyManifest.files.some((entry) => entry.category === 'naeringsliv' && entry.path === storyPath), 'Felles Etne-storyfil skal være manifestlastet');
assert(leksikonManifest.files.includes(articlePath), 'Felles Etne-leksikonfil skal være manifestlastet');

for (const personId of peopleIds) {
  const person = peopleById.get(personId);
  assert(person, `Manglende SMV-person: ${personId}`);
  assert(person.places.includes(place.id), `${personId} skal peke på Leknestangen-anlegget`);
}
assert.strictEqual(peopleById.get('anders_hovda').placeId, place.id, 'Anders Hovda skal ha SMV som primæranker');
assert.strictEqual(peopleById.get('gudvin_hovda').placeId, 'norsk_motormuseum_skanevik', 'Gudvin skal beholde museet som primæranker');
assert.strictEqual(peopleById.get('gudvin_hovda').year, 1986, 'Gudvin skal beholde museumsstiftelsesåret');
assert.strictEqual(peopleById.get('gudvin_hovda').verifiedAt, '2026-07-18', 'Gudvin skal beholde museumskortets verifiseringsdato');
assert(peopleById.get('gudvin_hovda').places.includes('norsk_motormuseum_skanevik'), 'Gudvin Hovdas dokumenterte museumskobling skal bevares');
assert(peopleById.get('paul_hovda').places.includes('norsk_motormuseum_skanevik'), 'Paul Hovdas dokumenterte museumskobling skal bevares');
assert.strictEqual(relations.length, 3, 'People-rundingen skal ha tre dokumenterte SMV-relasjoner');
assert(relations.some((row) => row.person === 'anders_hovda' && /grunnla/.test(row.type)), 'Anders Hovda skal være grunnleggerankeret');
assert(relations.some((row) => row.person === 'paul_hovda' && /oppfinnar/.test(row.type)), 'Paul Hovda skal ha dokumentert oppfinnerkobling');
assert(relations.some((row) => row.person === 'gudvin_hovda' && /medeigar/.test(row.type)), 'Gudvin Hovda skal ha dokumentert medeierkobling');
assert(story && story.place_id === place.id && story.person_id === 'anders_hovda', 'Fortellingen skal være forankret i stedet og grunnleggeren');
assert(article && article.place_id === place.id && article.links.entry_ids.includes(story.id), 'Leksikonet skal være koblet til fortellingen');

const roundContent = {
  people: relations,
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
  assert(filled, `SMV mangler ${roundId}`);
}

assert(place.externalLinks.length >= 5 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'SMV skal ha kontrollerte HTTPS-kilder');
assert(place.works.length >= 7, 'Verk-rundingen skal dekke grunnlegging, flytting, generasjonsskifte, patent, produksjon og marked');
assert(place.civication_store.length >= 3 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Alle næringslivs-underbadges skal være kanoniske');
assert(place.brands.length >= 6, 'Aktør-rundingen skal dekke bedrift, historisk navn, eierskap, produkter, produksjon og fagmiljø');
assert(place.nature_profile.themes.length >= 7, 'Natur-rundingen skal dokumentere fjord, vær, korrosjon og logistikk');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal være komplett');
assert(story.sources.length >= 5 && article.sources.length >= 5, 'Fortelling og leksikon skal ha bredt kildegrunnlag');
assert(article.wikiText.length >= 6 && article.facts.length >= 6 && article.chronology.length >= 6, 'Leksikonet skal være fullt utfylt');
assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.73913838637583, 5.909833602021161, 240, 1958], 'Kartanker, radius og hovedår skal bevares');
assert.strictEqual(placeIndex.get(place.id)?.year, 1958, 'Runtime-indeksen skal beholde 1958');

const combined = JSON.stringify({ place, people: peopleIds.map((id) => peopleById.get(id)), relations, story, article });
assert(/Anders Hovda/.test(combined) && /1958/.test(combined), 'Grunnlegger og grunnleggingsår skal være dokumentert');
assert(/1968/.test(combined) && /flytt/.test(combined), 'Flytting og navneskifte skal være dokumentert');
assert(/1976/.test(combined) && /medeier|medeigar/.test(combined), 'Medeierskapet skal være dokumentert');
assert(/1980/.test(combined) && /eier|eigar/.test(combined), 'Eierskiftet skal være dokumentert');
assert(/tredje generasjon/.test(combined), 'Dagens generasjonskontinuitet skal være synlig');
assert(/Leknestangen 95/.test(combined), 'Dagens offisielle adresse skal være synlig');
assert(/spesialmaskin/.test(combined) && /hydraulikk/.test(combined) && /elektro/.test(combined), 'Dagens flerfaglige produksjon skal være dokumentert');
assert(!/dagens (?:produksjons)?anlegg på Leknestangen (?:ble|blei|vart) (?:bygd|reist) i 1958|Leknestangen var den opprinnelige verkstedplassen i 1958/i.test(combined), '1958 skal ikke gjøres til byggeår for dagens anlegg');
assert(!/museet og dagens SMV er samme fysiske sted|museumshallen ligger på Leknestangen/i.test(combined), 'Museum og produksjonsanlegg skal holdes fysisk skilt');
assert(!/artar ved staden|flora ved staden|fauna ved staden/i.test(combined), 'Natur-rundingen skal ikke dikte inn arter');

console.log('SMV Leknestangen batch 1 round content OK');
