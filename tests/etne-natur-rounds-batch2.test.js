const assert = require('assert');
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const readJson = p => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));
const runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtime.match(/natur:\s*\[([^\]]+)\]/);
assert(profileMatch, 'runtime mangler naturprofil');
const expected = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];
assert.deepStrictEqual(JSON.parse('[' + profileMatch[1] + ']'), expected);
const targets = {"folgefonnanasjonalpark_etne":"data/places/natur/vestland/etne/folgefonnanasjonalpark_etne.json","mosneselva_etne":"data/places/natur/vestland/etne/mosneselva_etne.json","rullestadvatnet":"data/places/natur/vestland/etne/rullestadvatnet.json"};
const stories = readJson('data/stories/stories_etne_natur_rounds_batch2.json');
const articles = readJson('data/leksikon/places/vestland/etne/natur/leksikon_etne_natur_rounds_batch2.json');
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonManifest = readJson('data/leksikon/manifest.json');
const allIds = new Set();
for (const [id, file] of Object.entries(targets)) {
  const place = readJson(file).find(x => x.id === id);
  assert(place, 'mangler ' + id);
  for (const forbidden of ['rounds','rundinger']) assert(!Object.prototype.hasOwnProperty.call(place, forbidden), id + ' har manuell ' + forbidden);
  const story = stories.find(x => x.place_id === id);
  const article = articles.find(x => x.place_id === id);
  const content = { tasks: place.tasks_profile, nature: place.nature_profile, badges: place.underbadge_ids, training: place.training_profile, civication: place.civication_store, brands: place.brands, før_nå: place.for_na, fortellinger: story ? [story] : [], leksikon: article ? [article] : [] };
  assert.deepStrictEqual(Object.keys(content), expected);
  for (const [roundId, value] of Object.entries(content)) {
    const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
    assert(filled, id + ' mangler ' + roundId);
  }
  assert.strictEqual(place.tasks_profile.tasks.length, 4, id + ' skal ha fire tasks');
  assert.strictEqual(place.training_profile.exercises.length, 3, id + ' skal ha tre treningsøvelser');
  assert(place.civication_store.length >= 4 && place.civication_store.every(x => x.physicalObject === true && x.placeSpecific === true), id + ' har ugyldig civication');
  assert(place.brands.length >= 4, id + ' mangler aktører');
  assert(place.nature_profile.summary.length >= 1200, id + ' nature summary er for kort');
  assert(place.nature_profile.source_boundaries.length >= 3, id + ' mangler source boundaries');
  assert(place.for_na.before && place.for_na.now && place.for_na.change && place.for_na.lookFor.length >= 5, id + ' mangler før/nå');
  assert(story && story.sources.length >= 3, id + ' mangler kildeledet fortelling');
  assert(article && article.version === 2 && article.facts.length >= 10 && article.sources.length >= 3, id + ' mangler komplett leksikon');
  assert(storyManifest.files.some(x => x.entity_id === id && x.path === 'data/stories/stories_etne_natur_rounds_batch2.json' && x.category === 'natur'), id + ' story ikke manifestlastet');
  for (const obj of [...place.tasks_profile.tasks, ...place.training_profile.exercises, ...place.civication_store]) {
    assert(!allIds.has(obj.id), 'duplikat rundings-id ' + obj.id);
    allIds.add(obj.id);
  }
}
assert(leksikonManifest.files.includes('data/leksikon/places/vestland/etne/natur/leksikon_etne_natur_rounds_batch2.json'), 'leksikonfil ikke manifestlastet');
const folge = readJson(targets.folgefonnanasjonalpark_etne)[0];
assert(/ikke gå på bre|ikke.*bre/i.test(folge.training_profile.safety));
const mosnes = readJson(targets.mosneselva_etne)[0];
assert(/89 kvadratkilometer|89 km²/.test(mosnes.nature_profile.summary));
assert(/1993/.test(JSON.stringify(mosnes)));
const rullestad = readJson(targets.rullestadvatnet)[0];
assert(/rullestol/i.test(JSON.stringify(rullestad)));
assert(/ikke.*fiskearter|ingen bestemte fiskearter/i.test(JSON.stringify(rullestad)));
console.log('Etne nature rounds batch 2 OK');
