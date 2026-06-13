const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const placeCardJs = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const placeCardCss = fs.readFileSync(path.join(repo, 'css/placeCard.css'), 'utf8');
const leksikonLoader = fs.readFileSync(path.join(repo, 'js/leksikon/leksikon_loader.js'), 'utf8');

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
    console: {
      warnings: [],
      warn(...args) { this.warnings.push(args.join(' ')); }
    }
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

function rowsFromJson(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.places)) return value.places;
  return [];
}

function findPlace(id) {
  for (const file of walkJsonFiles(path.join(repo, 'data/places'))) {
    if (path.basename(file) === 'places_index.json') continue;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const found = rowsFromJson(data).find((row) => row && row.id === id);
    if (found) return { place: found, file: path.relative(repo, file) };
  }
  return null;
}

function idsFor(place) {
  return Array.from(harness.sandbox.window.HGPlaceRounds.get(place), (def) => def.id);
}

const harness = createRoundsHarness();
const defaults = Array.from(harness.sandbox.window.HGPlaceRounds.defaults);
assert.deepStrictEqual(defaults, ['people', 'nature', 'badges', 'civication', 'brands', 'leksikon', 'routes']);

const registryIds = Array.from(harness.sandbox.window.HGPlaceRounds.registry, (def) => def.id);
assert(!registryIds.includes('stories'), 'stories skal ikke være canonical PlaceCard-round id');
assert(!registryIds.includes('wonderkammer'), 'wonderkammer skal ikke være canonical PlaceCard-round id');
assert(registryIds.includes('brands'), 'brands må være canonical PlaceCard-round id');
assert(registryIds.includes('leksikon'), 'leksikon må være canonical PlaceCard-round id');
assert.deepStrictEqual(idsFor({ id: 'fallback_default' }), defaults, 'Steder uten rounds/rundinger skal få standardrundinger');
assert.deepStrictEqual(idsFor({ id: 'legacy_lexicon', rounds: ['lexicon', 'brands'] }), ['leksikon', 'brands'], 'legacy alias lexicon skal mappe til leksikon');
assert.deepStrictEqual(idsFor({ id: 'unknown_safe', rounds: ['brands', 'ukjent_round', 'leksikon'] }), ['brands', 'leksikon'], 'Ukjente round ids skal ignoreres trygt');
assert(harness.sandbox.console.warnings.some((msg) => msg.includes('Ukjent runding ignorert')), 'Ukjent round id skal gi console.warn');

for (const [id, expected] of Object.entries({
  torggata: ['leksikon', 'brands', 'badges', 'routes'],
  damstredet_telthusbakken: ['people', 'badges', 'leksikon', 'routes'],
  bygdoy_kongeskogen: ['nature', 'badges', 'leksikon', 'routes'],
  bislett_stadion: ['football', 'people', 'badges', 'brands', 'leksikon', 'routes'],
  intility_arena: ['football', 'people', 'badges', 'brands', 'leksikon', 'routes'],
  valle_hovin_stadion: ['football', 'people', 'badges', 'brands', 'leksikon', 'routes'],
  holmenkollen_nasjonalanlegg: ['people', 'nature', 'badges', 'brands', 'leksikon', 'routes'],
  treningssted_sognsvann: ['nature', 'badges', 'leksikon', 'routes'],
  jernbaneverkstedet_lodalen: ['people', 'badges', 'civication', 'brands', 'leksikon', 'routes'],
  sofienbergparken_subkultur: ['people', 'nature', 'badges', 'civication', 'brands', 'leksikon', 'routes', 'music']
})) {
  const found = findPlace(id);
  assert(found, `Fant ikke teststed ${id}`);
  assert.deepStrictEqual(idsFor(found.place), expected, `${id} skal vise bare egne rounds i deklarert rekkefølge (${found.file})`);
}

harness.sandbox.window.HGPlaceRounds.apply({ id: 'grid_order', rounds: ['leksikon', 'brands', 'badges'] });
assert.strictEqual(harness.elements.get('pcLeksikonIcon').hidden, false);
assert.strictEqual(harness.elements.get('pcLeksikonIcon').style.order, '0');
assert.strictEqual(harness.elements.get('pcBrandsIcon').hidden, false);
assert.strictEqual(harness.elements.get('pcBrandsIcon').style.order, '1');
assert.strictEqual(harness.elements.get('pcBadgesIcon').hidden, false);
assert.strictEqual(harness.elements.get('pcBadgesIcon').style.order, '2');
assert.strictEqual(harness.elements.get('pcPeopleIcon').hidden, true, 'Skjulte rundinger må settes hidden og ikke ta gridplass');

assert(!indexHtml.includes('pcStoriesIcon'), 'pcStoriesIcon skal ikke finnes i DOM-kontrakten');
assert(!indexHtml.includes('pcWonderkammerIcon'), 'pcWonderkammerIcon skal ikke finnes i DOM-kontrakten');
assert(indexHtml.includes('id="pcBrandsIcon"'), 'Brands-rundingen skal finnes i DOM-kontrakten');
assert(indexHtml.includes('id="pcLeksikonIcon"'), 'Leksikon-rundingen skal finnes i DOM-kontrakten');
assert(/\.pc-round\[hidden\]\s*\{[\s\S]*display:\s*none\s*!important/.test(placeCardCss), 'Skjulte rundinger skal ha display:none !important');
assert(leksikonLoader.includes('renderHubCard("Fortellinger"'), 'Fortellinger skal være tilgjengelig via Leksikon-huben');
assert(leksikonLoader.includes('renderHubCard("Wonderkammer"'), 'Wonderkammer skal være tilgjengelig via Leksikon-huben');
assert(leksikonLoader.includes('data-wonderkammer-entry'), 'Wonderkammer-entry skal kunne åpnes fra Leksikon-flowen');
assert(placeCardJs.includes('window.HGLeksikon.openPlace(currentPlaceId)'), 'Klikk på Leksikon-runding skal åpne HGLeksikon.openPlace');
assert(placeCardJs.includes('bindRoundPopup(brandsIcon, brandsEl, "Brands", "brands")'), 'Klikk på Brands-runding skal være bundet til brands-popup');

console.log('PlaceCard-runding runtime audit OK');
