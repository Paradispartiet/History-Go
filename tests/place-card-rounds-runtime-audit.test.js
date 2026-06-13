const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const placeCardJs = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const placeCardCss = fs.readFileSync(path.join(repo, 'css/placeCard.css'), 'utf8');

const CANONICAL = ['people', 'fortellinger', 'leksikon', 'wonderkammer', 'routes', 'badges', 'tasks', 'observations', 'brands', 'civication', 'works'];

function extractRoundsRuntime(src) {
  const start = src.indexOf('const PLACE_ROUND_REGISTRY = [');
  const end = src.indexOf('const PLACE_CARD_QUIZ_CARD_BY_ID', start);
  assert(start >= 0 && end > start, 'Fant ikke PlaceCard-runding-runtime i js/ui/place-card.js');
  return src.slice(start, end);
}

function createRoundsHarness() {
  const elements = new Map();
  const sandbox = {
    window: {},
    document: {
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, { id, hidden: true, style: {} });
        return elements.get(id);
      }
    },
    console: { warnings: [], warn(...args) { this.warnings.push(args.join(' ')); } }
  };
  vm.createContext(sandbox);
  vm.runInContext(extractRoundsRuntime(placeCardJs), sandbox);
  return { sandbox, elements };
}

function walkJsonFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkJsonFiles(full, out);
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}
function rowsFromJson(value) { return Array.isArray(value) ? value : (Array.isArray(value?.places) ? value.places : []); }
function findPlace(id) {
  for (const file of walkJsonFiles(path.join(repo, 'data/places'))) {
    if (path.basename(file) === 'places_index.json') continue;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const found = rowsFromJson(data).find((row) => row && row.id === id);
    if (found) return { place: found, file: path.relative(repo, file) };
  }
  return null;
}
function idsFor(place) { return Array.from(harness.sandbox.window.HGPlaceRounds.get(place), (def) => def.id); }
function assertNineUnique(ids, label) {
  assert.strictEqual(ids.length, 9, `${label} skal alltid returnere 9 rundinger`);
  assert.strictEqual(new Set(ids).size, ids.length, `${label} skal ikke ha duplikater`);
}
function canonicalize(raw) {
  return ({ lexicon: 'leksikon', stories: 'fortellinger', story: 'fortellinger', nature: 'wonderkammer', football: 'works', music: 'works' }[raw] || raw);
}

const harness = createRoundsHarness();
const registryIds = Array.from(harness.sandbox.window.HGPlaceRounds.registry, (def) => def.id);
assert.deepStrictEqual(registryIds, CANONICAL, 'Canonical registry skal inneholde nøyaktig de 11 nye id-ene');
for (const oldId of ['nature', 'football', 'music', 'stories', 'story', 'lexicon']) {
  assert(!registryIds.includes(oldId), `${oldId} skal ikke være canonical PlaceCard-round id`);
}
assert.deepStrictEqual(Array.from(harness.sandbox.window.HGPlaceRounds.defaults), CANONICAL);

for (const [alias, expected] of Object.entries({ lexicon: 'leksikon', stories: 'fortellinger', story: 'fortellinger', nature: 'wonderkammer', football: 'works', music: 'works' })) {
  const ids = idsFor({ id: `alias_${alias}`, rounds: [alias] });
  assert.strictEqual(ids[0], expected, `${alias} skal mappe til ${expected}`);
  assertNineUnique(ids, `alias_${alias}`);
}

let ids = idsFor({ id: 'declared_first', rounds: ['music', 'lexicon', 'stories', 'people'] });
assert.deepStrictEqual(ids.slice(0, 4), ['works', 'leksikon', 'fortellinger', 'people'], 'Deklarerte rounds skal komme først etter alias-normalisering');
assertNineUnique(ids, 'declared_first');

ids = idsFor({ id: 'unknown_safe', rounds: ['brands', 'ukjent_round', 'leksikon'] });
assert.deepStrictEqual(ids.slice(0, 2), ['brands', 'leksikon'], 'Ukjente round ids skal ignoreres uten å ødelegge rekkefølge');
assertNineUnique(ids, 'unknown_safe');
assert(harness.sandbox.console.warnings.some((msg) => msg.includes('Ukjent runding ignorert')), 'Ukjent round id skal gi console.warn');

ids = idsFor({ id: 'duplicates', rounds: ['lexicon', 'leksikon', 'story', 'stories', 'music', 'football'] });
assert.deepStrictEqual(ids.slice(0, 3), ['leksikon', 'fortellinger', 'works']);
assertNineUnique(ids, 'duplicates');
assertNineUnique(idsFor({ id: 'fallback_default' }), 'fallback_default');

for (const [id, expectedPrefix] of Object.entries({
  torggata: ['leksikon', 'brands', 'badges', 'routes'],
  stortinget: [],
  bislett_stadion: ['works', 'people', 'badges', 'brands', 'leksikon', 'routes'],
  intility_arena: ['works', 'people', 'badges', 'brands', 'leksikon', 'routes'],
  treningssted_sognsvann: ['wonderkammer', 'badges', 'leksikon', 'routes'],
  nasjonalbiblioteket: [],
  hausmania: ['people', 'badges', 'civication', 'brands', 'leksikon', 'routes', 'works'],
  botanisk_hage: []
})) {
  const found = findPlace(id);
  assert(found, `Fant ikke teststed ${id}`);
  const got = idsFor(found.place);
  assertNineUnique(got, `${id} (${found.file})`);
  const declared = Array.isArray(found.place.rounds) ? found.place.rounds : (Array.isArray(found.place.rundinger) ? found.place.rundinger : []);
  const prefix = expectedPrefix.length ? expectedPrefix : declared.map(canonicalize).filter((v, i, a) => CANONICAL.includes(v) && a.indexOf(v) === i);
  assert.deepStrictEqual(got.slice(0, prefix.length), prefix, `${id} skal ha prioriterte ids først (${found.file})`);
}

harness.sandbox.window.HGPlaceRounds.apply({ id: 'grid_order', rounds: ['leksikon', 'brands', 'badges'] });
assert.strictEqual(harness.elements.get('pcLeksikonIcon').hidden, false);
assert.strictEqual(harness.elements.get('pcLeksikonIcon').style.order, '0');
assert.strictEqual(harness.elements.get('pcBrandsIcon').hidden, false);
assert.strictEqual(harness.elements.get('pcBrandsIcon').style.order, '1');
assert.strictEqual(harness.elements.get('pcBadgesIcon').hidden, false);
assert.strictEqual(harness.elements.get('pcBadgesIcon').style.order, '2');
assert.strictEqual(harness.elements.get('pcWorksIcon').hidden, true, 'Rundinger utenfor de 9 valgte skal hidden');

for (const id of ['People', 'Fortellinger', 'Leksikon', 'Wonderkammer', 'Routes', 'Badges', 'Tasks', 'Observations', 'Brands', 'CivicationStore', 'Works']) {
  assert(indexHtml.includes(`id="pc${id}Icon"`), `pc${id}Icon skal finnes i DOM-kontrakten`);
  assert(indexHtml.includes(`id="pc${id}List"`), `pc${id}List skal finnes i DOM-kontrakten`);
}
for (const id of ['Football', 'Music', 'Nature']) {
  assert(!indexHtml.includes(`pc${id}Icon`), `pc${id}Icon skal ikke være canonical DOM-runding`);
  assert(!indexHtml.includes(`pc${id}List`), `pc${id}List skal ikke være canonical DOM-runding`);
}
assert(/\.pc-round\[hidden\]\s*\{[\s\S]*display:\s*none\s*!important/.test(placeCardCss), 'Skjulte rundinger skal ha display:none !important');
assert(placeCardJs.includes('window.HGLeksikon.openPlace(currentPlaceId)'), 'Klikk på Leksikon-runding skal åpne HGLeksikon.openPlace');
assert(placeCardJs.includes('bindRoundPopup(brandsIcon, brandsEl, "Brands", "brands")'), 'Klikk på Brands-runding skal være bundet til brands-popup');

console.log('PlaceCard-runding runtime audit OK');
