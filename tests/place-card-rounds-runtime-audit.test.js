const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const placeCardJs = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const placeCardCss = fs.readFileSync(path.join(repo, 'css/placeCard.css'), 'utf8');

const POOL = ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon', 'play', 'training', 'tasks'];
const BY = ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const SPORT = ['people', 'training', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const LEKEPLASS = ['play', 'nature', 'badges', 'tasks', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const TASKS_ALLOWED_PROFILES = ['natur', 'lekeplass', 'trening'];
const TASKS_FORBIDDEN_PROFILES = ['historie', 'historisk', 'politikk', 'kunst', 'litteratur', 'musikk', 'vitenskap', 'media', 'subkultur', 'naeringsliv', 'transport'];
const GET_ROUNDS_NINE_SAMPLE_CATEGORIES = ['by', 'natur', 'lekeplass', 'trening', 'politikk', 'vitenskap', 'media', 'transport'];

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

const harness = createRoundsHarness();
function idsFor(place) { return Array.from(harness.sandbox.window.HGPlaceRounds.get(place), (def) => def.id); }

const registryIds = Array.from(harness.sandbox.window.HGPlaceRounds.registry, (def) => def.id);
assert.deepStrictEqual(registryIds, POOL, 'Canonical registry skal inneholde nøyaktig rundingspoolen');
assert.deepStrictEqual(Array.from(harness.sandbox.window.HGPlaceRounds.defaults), BY);

for (const oldId of ['wonderkammer', 'observations', 'football', 'music', 'stories', 'story', 'lexicon']) {
  assert(!registryIds.includes(oldId), `${oldId} skal ikke være canonical PlaceCard-round id`);
}

assert(!registryIds.includes('routes'), 'routes skal ikke være canonical PlaceCard-round id');
assert.strictEqual(harness.sandbox.window.HGPlaceRounds.byId?.routes?.id, 'før_nå', 'routes kan bare mappe som legacy alias til før_nå');

assert.deepStrictEqual(idsFor({ id: 'fallback_default' }), BY, 'ukjent/blank kategori skal bruke by-profil');
assert.deepStrictEqual(idsFor({ id: 'sport_profile', category: 'sport' }), SPORT, 'sport skal bruke fast sportprofil');
assert.deepStrictEqual(idsFor({ id: 'playground_profile', category: 'lekeplass' }), LEKEPLASS, 'lekeplass skal bruke fast lekeplassprofil');
for (const [category, profile] of Object.entries(harness.sandbox.window.HGPlaceRounds.profiles)) {
  assert.strictEqual(profile.length, 9, `${category} skal ha nøyaktig 9 profilslots`);
  assert.strictEqual(new Set(profile).size, 9, `${category} skal ikke ha duplikater`);
  for (const id of profile) {
    assert(registryIds.includes(id), `${category} bruker ukjent runding ${id}`);
  }
  assert.deepStrictEqual(idsFor({ id: `${category}_profile`, category }), Array.from(profile), `${category} skal returnere profilens 9 rundinger`);
}

for (const category of TASKS_ALLOWED_PROFILES) {
  assert(harness.sandbox.window.HGPlaceRounds.profiles[category].includes('tasks'), `${category} skal beholde tasks`);
}
for (const category of TASKS_FORBIDDEN_PROFILES) {
  assert(!harness.sandbox.window.HGPlaceRounds.profiles[category].includes('tasks'), `${category} skal ikke bruke tasks`);
}
const profilesWithTasks = Object.entries(harness.sandbox.window.HGPlaceRounds.profiles)
  .filter(([, profile]) => profile.includes('tasks'))
  .map(([category]) => category)
  .sort();
assert.deepStrictEqual(profilesWithTasks, TASKS_ALLOWED_PROFILES.slice().sort(), 'tasks skal bare finnes i konkrete handlingsprofiler');

for (const category of GET_ROUNDS_NINE_SAMPLE_CATEGORIES) {
  assert.strictEqual(idsFor({ id: `${category}_profile`, category }).length, 9, `${category} skal alltid gi 9 rundinger`);
}

const overridden = idsFor({ id: 'manual_override', category: 'by', rounds: ['training'] });
assert.strictEqual(overridden.length, 9, 'override-output skal fortsatt ha 9 rundinger');
assert.strictEqual(new Set(overridden).size, 9, 'override-output skal ikke ha duplikater');
assert(overridden.includes('training'), 'place.rounds kan erstatte en slot ved behov');

for (const [alias, expected] of Object.entries({
  lexicon: 'leksikon',
  stories: 'fortellinger',
  story: 'fortellinger',
  wonderkammer: 'leksikon',
  football: 'works',
  music: 'works'
})) {
  const def = harness.sandbox.window.HGPlaceRounds.byId?.[alias]
    || harness.sandbox.PLACE_ROUND_BY_ID?.[alias];
  assert(def, `${alias} skal finnes som legacy alias`);
  assert.strictEqual(def.id, expected, `${alias} skal mappe til ${expected}`);
}
assert(!harness.sandbox.window.HGPlaceRounds.byId?.observations, 'observations skal ikke mappe til canonical runding nå');

idsFor({ id: 'unknown_safe', rounds: ['ukjent_round'] });
assert(harness.sandbox.console.warnings.some((msg) => msg.includes('Ukjent runding ignorert')), 'Ukjent round id skal gi console.warn');

harness.sandbox.window.HGPlaceRounds.apply({ id: 'grid_order', category: 'sport' });
for (const [index, id] of SPORT.entries()) {
  const def = harness.sandbox.window.HGPlaceRounds.byId[id];
  const el = harness.elements.get(def.iconId);
  assert(el, `${def.iconId} skal finnes i apply-harness`);
  assert.strictEqual(el.hidden, false, `${def.id} skal vises`);
  assert.strictEqual(el.style.order, String(index), `${def.id} skal ha kategori-order ${index}`);
}
for (const legacyIconId of ['pcWonderkammerIcon', 'pcObservationsIcon', 'pcFootballIcon', 'pcMusicIcon', 'pcRoutesIcon']) {
  const el = harness.elements.get(legacyIconId);
  assert(el, `${legacyIconId} skal håndteres som legacy DOM hvis den finnes`);
  assert.strictEqual(el.hidden, true, `${legacyIconId} skal skjules som legacy/ikke-canonical DOM`);
}

for (const id of ['People', 'Nature', 'Works', 'Badges', 'Tasks', 'CivicationStore', 'Brands', 'ForNa', 'Fortellinger', 'Leksikon', 'Play', 'Training']) {
  assert(indexHtml.includes(`id="pc${id}Icon"`), `pc${id}Icon skal finnes i DOM-kontrakten`);
  assert(indexHtml.includes(`id="pc${id}List"`), `pc${id}List skal finnes i DOM-kontrakten`);
}
assert(!indexHtml.includes('pcRoutesIcon'), 'pcRoutesIcon skal ikke finnes som canonical DOM-runding');
assert(!indexHtml.includes('pcRoutesList'), 'pcRoutesList skal ikke finnes som canonical DOM-runding');
assert(indexHtml.includes('pcRoute'), 'Separat Rute-knapp/rutefunksjon kan fortsatt finnes utenfor runding-gridet');

for (const id of ['Wonderkammer', 'Observations', 'Football', 'Music']) {
  assert(!indexHtml.includes(`pc${id}Icon`), `pc${id}Icon skal ikke være canonical DOM-runding`);
  assert(!indexHtml.includes(`pc${id}List`), `pc${id}List skal ikke være canonical DOM-runding`);
}
assert(/\.pc-round\[hidden\]\s*\{[\s\S]*display:\s*none\s*!important/.test(placeCardCss), 'Skjulte rundinger skal ha display:none !important');
assert(placeCardJs.includes('window.HGLeksikon.openPlace(currentPlaceId)'), 'Klikk på Leksikon-runding skal åpne HGLeksikon.openPlace');
assert(/wonderkammer/i.test(placeCardJs), 'Wonderkammer-innhold skal fortsatt finnes i PlaceCard/Leksikon-flowen');
assert(placeCardJs.includes('bindRoundPopup(brandsIcon, brandsEl, "Brands", "brands")'), 'Klikk på Brands-runding skal være bundet til brands-popup');
assert(placeCardJs.includes('if (kind === "nature") html = renderPlaceCardNatureProfile(currentPlace || place);'), 'Natur-popup skal bruke nature_profile-rendereren');
assert(placeCardJs.includes('natureEl.innerHTML = `${profileHtml}${floraHtml}`;'), 'Natur-listen skal fylles i canonical pcNatureList');
assert(!placeCardJs.includes('wonderkammerEl.innerHTML = `${profileHtml}${floraHtml}`;'), 'Nature_profile skal ikke lenger rendres bare til legacy Wonderkammer-listen');
assert(placeCardJs.includes('window.HGStories?.getByPlace?.(storyPlaceId)'), 'Fortelling-rundingen skal lese stedets lastede stories');
assert(placeCardJs.includes('window.HGStories.init()'), 'Fortelling-rundingen skal fylle seg etter at stories er lastet');
assert(!placeCardJs.includes('fortellingerEl.innerHTML = `<div class="pc-empty">Ingen fortellinger ennå</div>`;'), 'Fortelling-rundingen skal ikke lenger være hardkodet tom');

console.log('PlaceCard-runding runtime audit OK');
