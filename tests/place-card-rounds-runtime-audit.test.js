const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const placeCardJs = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const placeCardCss = fs.readFileSync(path.join(repo, 'css/placeCard.css'), 'utf8');

const CANONICAL = ['people', 'works', 'badges', 'tasks', 'civication', 'brands', 'routes', 'fortellinger', 'leksikon'];

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

function idsFor(place) { return Array.from(harness.sandbox.window.HGPlaceRounds.get(place), (def) => def.id); }

const harness = createRoundsHarness();
const registryIds = Array.from(harness.sandbox.window.HGPlaceRounds.registry, (def) => def.id);
assert.deepStrictEqual(registryIds, CANONICAL, 'Canonical registry skal inneholde nøyaktig de 9 faste id-ene i grid-rekkefølge');
assert.deepStrictEqual(Array.from(harness.sandbox.window.HGPlaceRounds.defaults), CANONICAL);

for (const oldId of ['wonderkammer', 'observations', 'nature', 'football', 'music', 'stories', 'story', 'lexicon']) {
  assert(!registryIds.includes(oldId), `${oldId} skal ikke være canonical PlaceCard-round id`);
}

const fixed = idsFor({ id: 'fallback_default' });
assert.deepStrictEqual(fixed, CANONICAL, 'getPlaceRounds skal alltid returnere fast 3x3-grid');
assert.deepStrictEqual(idsFor({ id: 'legacy_order', rounds: ['leksikon', 'brands', 'badges', 'routes'] }), CANONICAL, 'place.rounds skal ikke endre visuell output');
assert.deepStrictEqual(idsFor({ id: 'rundinger_legacy', rundinger: ['music', 'lexicon', 'stories'] }), CANONICAL, 'place.rundinger skal ikke endre visuell output');

for (const [alias, expected] of Object.entries({
  lexicon: 'leksikon',
  stories: 'fortellinger',
  story: 'fortellinger',
  wonderkammer: 'leksikon',
  nature: 'leksikon',
  football: 'works',
  music: 'works',
  observations: 'tasks'
})) {
  const def = harness.sandbox.window.HGPlaceRounds.byId?.[alias]
    || harness.sandbox.PLACE_ROUND_BY_ID?.[alias];
  assert(def, `${alias} skal finnes som legacy alias`);
  assert.strictEqual(def.id, expected, `${alias} skal mappe til ${expected}`);
}

idsFor({ id: 'unknown_safe', rounds: ['ukjent_round'] });
assert(harness.sandbox.console.warnings.some((msg) => msg.includes('Ukjent runding ignorert')), 'Ukjent round id skal gi console.warn');

harness.sandbox.window.HGPlaceRounds.apply({ id: 'grid_order', rounds: ['leksikon', 'brands', 'badges'] });
for (const [index, def] of harness.sandbox.window.HGPlaceRounds.registry.entries()) {
  const el = harness.elements.get(def.iconId);
  assert(el, `${def.iconId} skal finnes i apply-harness`);
  assert.strictEqual(el.hidden, false, `${def.id} skal vises`);
  assert.strictEqual(el.style.order, String(index), `${def.id} skal ha fast order ${index}`);
}
for (const legacyIconId of ['pcWonderkammerIcon', 'pcObservationsIcon', 'pcNatureIcon', 'pcFootballIcon', 'pcMusicIcon']) {
  const el = harness.elements.get(legacyIconId);
  assert(el, `${legacyIconId} skal håndteres som legacy DOM hvis den finnes`);
  assert.strictEqual(el.hidden, true, `${legacyIconId} skal skjules som legacy/ikke-canonical DOM`);
}

for (const id of ['People', 'Works', 'Badges', 'Tasks', 'CivicationStore', 'Brands', 'Routes', 'Fortellinger', 'Leksikon']) {
  assert(indexHtml.includes(`id="pc${id}Icon"`), `pc${id}Icon skal finnes i DOM-kontrakten`);
  assert(indexHtml.includes(`id="pc${id}List"`), `pc${id}List skal finnes i DOM-kontrakten`);
}
for (const id of ['Wonderkammer', 'Observations', 'Nature', 'Football', 'Music']) {
  assert(!indexHtml.includes(`pc${id}Icon`), `pc${id}Icon skal ikke være canonical DOM-runding`);
  assert(!indexHtml.includes(`pc${id}List`), `pc${id}List skal ikke være canonical DOM-runding`);
}
assert(/\.pc-round\[hidden\]\s*\{[\s\S]*display:\s*none\s*!important/.test(placeCardCss), 'Skjulte rundinger skal ha display:none !important');
assert(placeCardJs.includes('window.HGLeksikon.openPlace(currentPlaceId)'), 'Klikk på Leksikon-runding skal åpne HGLeksikon.openPlace');
assert(/wonderkammer/i.test(placeCardJs), 'Wonderkammer-innhold skal fortsatt finnes i PlaceCard/Leksikon-flowen');
assert(placeCardJs.includes('bindRoundPopup(brandsIcon, brandsEl, "Brands", "brands")'), 'Klikk på Brands-runding skal være bundet til brands-popup');

console.log('PlaceCard-runding runtime audit OK');
