const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtimeSource.match(/naeringsliv:\s*\[([^\]]+)\]/);
assert(profileMatch, 'Runtime skal ha en dokumentert næringslivsprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds, 'Litledalen skal bruke næringslivsprofilen');

const place = readJson('data/places/naeringsliv/vestland/etne/litledalen_kraftverk.json')[0];
const peoplePath = 'data/people/naeringsliv/vestland/etne/people_litledalen_kraftverk_batch1.json';
const person = readJson(peoplePath)[0];
const peopleManifest = readJson('data/people/manifest.json');
const storyPath = 'data/stories/stories_etnesjoen_naeringsliv_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_litledalen_fra_kommunalt_pioneranlegg_til_nye_litledalen');
const storyManifest = readJson('data/stories/stories_manifest.json');
const articlePath = 'data/leksikon/places/vestland/etne/naeringsliv/leksikon_litledalen_kraftverk_rounds_batch1.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validUnderbadgeIds = new Set(readJson('data/badges/naeringsliv.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.category, 'naeringsliv');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Litledalen skal ikke ha ${forbidden}`);
}

assert(person && person.id === 'halfdan_greve', 'People-rundingen skal bruke Halfdan Greve');
assert.strictEqual(person.placeId, place.id, 'Litledalen skal være Halfdan Greves primæranker');
assert.deepStrictEqual(person.places, [place.id], 'Halfdan Greve skal bare peke på det dokumenterte kraftverket');
assert(peopleManifest.files.includes(peoplePath.replace(/^data\//, '')), 'People-filen skal være manifestlastet');
assert(/byggeleiar Halfdan Greve/.test(person.popupDesc), 'People-kortet skal beholde den dokumenterte rollen');
assert(/påstår ikkje at han åleine/.test(person.popupDesc), 'People-kortet skal beholde rolleavgrensningen');
assert(story && story.place_id === place.id && story.person_id === person.id, 'Fortellingen skal være forankret i stedet og Halfdan Greve');
assert(storyManifest.files.some((entry) => entry.category === 'naeringsliv' && entry.path === storyPath), 'Story-filen skal være manifestlastet');
assert(article && article.place_id === place.id, 'Leksikonartikkelen skal være forankret i Litledalen');
assert(article.links.entry_ids.includes(story.id), 'Leksikonet skal lenke hovedfortellingen');
assert(leksikonManifest.files.includes(articlePath), 'Leksikonfilen skal være manifestlastet');

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
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds);
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Litledalen mangler ${roundId}`);
}

assert(place.externalLinks.length >= 5 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Litledalen skal ha kildekontrollerte HTTPS-lenker');
assert(place.works.length >= 6, 'Verk-rundingen skal dokumentere bygging, drift, oppgraderinger, vedtak og 2025-fasen');
assert(place.civication_store.length >= 3 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Alle næringslivs-underbadges skal være kanoniske');
assert(place.brands.length >= 6, 'Aktør-rundingen skal dokumentere opprinnelig utbygger, SKL, Nye Litledalen, drift, NVE og kraftsystem');
assert(place.nature_profile.themes.length >= 7, 'Natur-rundingen skal dokumentere magasin, fall, vannvei og energisystem');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal være komplett');
assert(story.sources.length >= 5, 'Fortellingen skal ha bredt kildegrunnlag');
assert(article.wikiText.length >= 5 && article.sources.length >= 5, 'Leksikonet skal ha full tekst og kilder');
assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.66306, 6.065, 220, 1920], 'Kartanker, radius og historisk stedår skal bevares');
assert.strictEqual(placeIndex.get(place.id)?.year, 1920, 'Runtime-indeksen skal beholde 1920');

const combined = JSON.stringify({ place, person, story, article });
assert(/1916/.test(combined) && /Halfdan Greve/.test(combined), 'Byggjestarten og byggelederen skal være dokumentert');
assert(/1920/.test(combined) && /drift|ferdig/.test(combined), 'Historisk driftsstart skal være dokumentert');
assert(/1963/.test(combined) && /1985/.test(combined), 'Begge eldre oppgraderinger skal være dokumentert');
assert(/2018/.test(combined) && /konsesjon|systemfornying/.test(combined), 'Moderniseringsvedtaket skal være dokumentert');
assert(/2025/.test(combined) && /prøvedrift/.test(combined), 'Ny prøvedriftsfase i 2025 skal være dokumentert');
assert(/127,4/.test(combined) && /8,6/.test(combined) && /27 GWh/.test(combined), 'NVE-data for Nye Litledalen skal være med');
assert(/1920 \/ 2025/.test(combined), 'Den doble NVE-dateringen skal forklares');
assert(!/blir slått saman med Hardeland|same fysiske stad som Hardeland/i.test(combined), 'Litledalen skal ikke blandes sammen med Hardeland');
assert(!/artar ved staden|flora ved staden|fauna ved staden/i.test(combined), 'Natur-rundingen skal ikke dikte inn arter');

console.log('Litledalen kraftverk batch 1 round content OK');
