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
const halfdan = readJson('data/people/naeringsliv/vestland/etne/people_litledalen_kraftverk_batch1.json')[0];
const operations = readJson('data/people/naeringsliv/vestland/etne/people_hardeland_kraftverk_batch1.json')[0];
const relations = readJson('data/relations.json').filter((row) => row.place === place.id && [halfdan.id, operations.id].includes(row.person));
const storyPath = 'data/stories/stories_etnesjoen_naeringsliv_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_litledalen_fra_1916_til_nye_litledalen');
const articlePath = 'data/leksikon/places/vestland/etne/naeringsliv/leksikon_etnesjoen_naeringsliv_rounds_batch1.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const validUnderbadgeIds = new Set(readJson('data/badges/naeringsliv.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.category, 'naeringsliv');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Litledalen skal ikke ha ${forbidden}`);
}

assert.strictEqual(halfdan.id, 'halfdan_greve');
assert.strictEqual(halfdan.placeId, place.id, 'Halfdan Greve skal beholde Litledalen som primæranker');
assert.strictEqual(operations.id, 'skl_driftsmiljoet_litledalen_hardeland');
assert(operations.places.includes(place.id), 'Driftsmiljøet skal ha Litledalen som dokumentert sekundærkobling');
assert.strictEqual(relations.length, 2, 'People-rundingen skal ha byggeleder og driftsmiljø');
assert(relations.some((row) => row.person === halfdan.id && /byggjeleiar/.test(row.type)), 'Halfdan Greve skal være koblet som byggeleder');
assert(relations.some((row) => row.person === operations.id && /driftsmiljo/.test(row.type)), 'SKL-driftsmiljøet skal være koblet til dagens drift');
assert(story && story.place_id === place.id && story.person_id === halfdan.id, 'Fortellingen skal bruke stedet og den historiske byggelederen');
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
  assert(filled, `Litledalen mangler ${roundId}`);
}

assert(place.externalLinks.length >= 4 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Litledalen skal ha kontrollerte HTTPS-kilder');
assert(place.works.length >= 7, 'Verk-rundingen skal dekke bygge-, drifts-, oppgraderings- og arbeidslinjen');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Alle næringslivs-underbadges skal være kanoniske');
assert(place.brands.length >= 4, 'Aktør-rundingen skal dokumentere opprinnelig utbygger, eier, drift og register');
assert(place.nature_profile.themes.length >= 5, 'Natur-rundingen skal dokumentere vann, fallhøyde og røyrveier');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal være komplett');
assert(story.sources.length >= 4 && article.sources.length >= 4, 'Fortelling og leksikon skal ha bredt kildegrunnlag');
assert.deepStrictEqual([place.lat, place.lon, place.year], [59.66306, 6.065, 1920], 'Kartanker og historisk stedår skal bevares');
assert.strictEqual(placeIndex.get(place.id)?.year, 1920, 'Runtime-indeksen skal beholde 1920');

const combined = JSON.stringify({ place, halfdan, operations, relations, story, article });
assert(/1916/.test(combined) && /Halfdan Greve/.test(combined), 'Byggestarten og byggelederen skal være dokumentert');
assert(/1920/.test(combined) && /drift/.test(combined), 'Opprinnelig driftsstart skal være dokumentert');
assert(/1963/.test(combined) && /1985/.test(combined), 'Begge historiske oppgraderinger skal være dokumentert');
assert(/2012/.test(combined) && /nybygg/.test(combined), 'Investeringsvedtaket skal være dokumentert');
assert(/2025/.test(combined) && /prøvedrift/.test(combined), 'Det nye erstatningsanlegget skal være dokumentert');
assert(/8,6 MW/.test(combined) && /127,4/.test(combined), 'NVE-data for det nye anlegget skal være med');
assert(!/Halfdan Greve åleine|Halfdan Greve alene/.test(combined), 'Batchen skal ikke overdrive Halfdan Greves rolle');
assert(!/Litledalen er Hardeland|samme sted som Hardeland/i.test(combined), 'Litledalen skal holdes skilt fra Hardeland');
assert(!/artar ved staden|flora ved staden|fauna ved staden/i.test(combined), 'Natur-rundingen skal ikke dikte inn arter');

console.log('Litledalen batch 1 round content OK');
