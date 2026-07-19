const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtimeSource.match(/naeringsliv:\s*\[([^\]]+)\]/);
assert(profileMatch, 'Runtime skal ha en dokumentert næringslivsprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds, 'Hermetikkfabrikken skal bruke næringslivsprofilen');

const place = readJson('data/places/naeringsliv/vestland/etne/skanevik_hermetikkfabrikk.json')[0];
const peoplePath = 'data/people/naeringsliv/vestland/etne/people_naeringsliv_etne_batch1.json';
const people = readJson(peoplePath);
const person = people.find((row) => row.id === 'christian_bjelland_industrimann');
const peopleManifest = readJson('data/people/manifest.json');
const relations = readJson('data/relations.json').filter((row) => row.place === place.id && row.person === person?.id);
const storyPath = 'data/stories/stories_etnesjoen_naeringsliv_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_skanevik_hermetikk_fra_bjelland_til_siste_boks');
const storyManifest = readJson('data/stories/stories_manifest.json');
const articlePath = 'data/leksikon/places/vestland/etne/naeringsliv/leksikon_etnesjoen_naeringsliv_rounds_batch1.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validUnderbadgeIds = new Set(readJson('data/badges/naeringsliv.json').sub);
const placeIndexRows = readJson('data/places/places_index.json');
const placeIndex = new Map(placeIndexRows.map((row) => [row.id, row]));
const activePlaceIds = new Set(placeIndexRows.map((row) => row.id));

assert.strictEqual(place.category, 'naeringsliv');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Hermetikkfabrikken skal ikke ha ${forbidden}`);
}

assert.strictEqual(people.length, 1, 'Den låste Etne-batchen skal fortsatt ha bare Christian Bjelland');
assert(person, 'People-rundingen skal bruke Christian Bjelland');
assert.strictEqual(person.placeId, place.id, 'Christian Bjelland skal ha fabrikken som primæranker');
assert.deepStrictEqual(person.places, [place.id], 'People-kortet skal beholde den presise place-lenken');
assert.strictEqual(person.year, 1908, 'People-kortet skal beholde fabrikketableringsåret');
assert.strictEqual(person.verifiedAt, '2026-07-18', 'People-kortets tidligere verifisering skal bevares');
assert(peopleManifest.files.includes(peoplePath.replace(/^data\//, '')), 'People-filen skal være manifestlastet');
assert.strictEqual(relations.length, 1, 'People-rundingen skal ha én eksplisitt Christian Bjelland-relasjon');
assert(/1908/.test(relations[0].type + relations[0].why), 'Relasjonen skal være knyttet til fabrikketableringen i 1908');
assert(story && story.place_id === place.id && story.person_id === person.id, 'Fortellingen skal være koblet til stedet og Christian Bjelland');
assert(storyManifest.files.some((entry) => entry.category === 'naeringsliv' && entry.path === storyPath), 'Felles storyfil skal være manifestlastet');
assert(article && article.place_id === place.id, 'Leksikonartikkelen skal være forankret i fabrikken');
assert(article.links.entry_ids.includes(story.id), 'Leksikonet skal lenke hovedfortellingen');
assert(leksikonManifest.files.includes(articlePath), 'Felles Etne-leksikonfil skal være manifestlastet');

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
  assert(filled, `Hermetikkfabrikken mangler ${roundId}`);
}

assert(place.externalLinks.length >= 6 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Stedet skal ha minst seks kontrollerte HTTPS-kilder');
assert(place.works.length >= 10, 'Verk-rundingen skal dekke forhistorie, fabrikk, arbeidsliv, utvidelse, modernisering, konsern og nedlegging');
assert(place.civication_store.length >= 3 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Alle næringslivs-underbadges skal være kanoniske');
assert(place.brands.length >= 6, 'Aktør-rundingen skal dekke forgjenger, Bjelland, produktmerke, Norway Foods, Rieber og lokal fabrikkidentitet');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal være komplett');
assert(Array.isArray(place.nature_profile.species) && place.nature_profile.species.length === 1, 'Natur-rundingen skal bare oppgi den dokumenterte produksjonsarten');
assert.strictEqual(place.nature_profile.species[0].id, 'brisling');
assert.strictEqual(place.nature_profile.species[0].latin_navn, 'Sprattus sprattus');
assert(/produksjonsart|råvare/i.test(place.nature_profile.species_scope), 'Natur-rundingen skal avgrense arten til produksjonsråvaren');
assert.deepStrictEqual(place.nature_profile.nearby_place_ids, ['skanevik_gjestgjevargarden', 'skanevik_sentrum', 'norsk_motormuseum_skanevik'], 'Naturkoblingene skal bruke kanoniske ID-er');
for (const nearbyId of place.nature_profile.nearby_place_ids) {
  assert(activePlaceIds.has(nearbyId), `Ugyldig nearby-place-ID: ${nearbyId}`);
}
assert(story.sources.length >= 6 && article.sources.length >= 6, 'Fortelling og leksikon skal ha bredt kildegrunnlag');
assert(article.wikiText.length >= 6 && article.facts.length >= 7 && article.chronology.length >= 9, 'Leksikonet skal være fullt utfylt');
assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.73128737155455, 5.92525891571817, 280, 1908], 'Representativt kartanker, radius og hovedår skal bevares');
assert.strictEqual(placeIndex.get(place.id)?.year, 1908, 'Runtime-indeksen skal beholde 1908');

const combined = JSON.stringify({ place, person, relations, story, article });
for (const year of [1891, 1908, 1930, 1947, 1960, 1981, 1994, 1996, 2001]) {
  assert(combined.includes(String(year)), `Mangler tidslinjeåret ${year}`);
}
assert(/50 000/.test(combined) && /sardinesker/.test(combined), 'Dokumentert 1994-kapasitet skal være synlig');
assert(/30\. mars 2001/.test(combined), 'Siste produksjonsdag skal være eksplisitt');
assert(/rundt 70|omkring 70/.test(combined) && /kvinn/.test(combined), 'Arbeidsplassomfang og kvinnearbeid skal være dokumentert');
assert(/representativt (?:område|eiendomsområde)|representativt områdeanker/i.test(combined), 'Kartankeret skal beskrives som representativt');
assert(/ikke et eksakt|ikkje eit påstått eksakt|hevder ikke et presist/i.test(combined), 'Innholdet skal avvise eksakt historisk fotavtrykk');
assert(/Gjestgjevargarden|Tippehuset/.test(combined), 'Det bevarte nabokulturminnet skal forklares');
assert(!/fabrikken og Gjestgjevargarden er samme canonical place|markøren viser det eksakte fabrikkfotavtrykket/i.test(combined), 'Fabrikk og Gjestgjevargard skal holdes fysisk og redaksjonelt skilt');
assert(!/arten finnes i dag ved markøren|artsinventeringen omfatter alle arter/i.test(combined), 'Brisling skal ikke gjøres til en udokumentert nåtidsobservasjon');

console.log('Skånevik hermetikkfabrikk batch 1 round content OK');
