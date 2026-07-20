#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

function installStorage(seed = {}) {
  const store = { ...seed };
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    dump() { return { ...store }; }
  };
}

function bootRouter() {
  global.window = global;
  global.localStorage = installStorage();
  global.location = { hash: '', href: 'https://example.test/History-Go/index.html', assign() {} };

  const placeCard = { dataset: { currentPlaceId: '' } };
  let civicationClicks = 0;
  global.document = {
    baseURI: 'https://example.test/History-Go/index.html',
    getElementById(id) { return id === 'placeCard' ? placeCard : null; },
    querySelector(selector) {
      if (selector === '.civication-nav-link') return { click() { civicationClicks += 1; } };
      return null;
    },
    createElement() { return { style: {}, querySelector() { return null; }, remove() {}, set id(_) {}, set innerHTML(_) {} }; },
    body: { appendChild() {} }
  };

  const calls = { close: 0, quiz: [], place: [], route: [], observation: [], civi: () => civicationClicks };
  global.HG_TodayHubPanel = { remove() { calls.close += 1; } };
  global.HGMapView = {
    openQuiz(id) { calls.quiz.push(id); return true; },
    openPlace(id) { calls.place.push(id); return true; }
  };
  global.HGRoutes = {
    async load() { return [{ id: 'route-one' }]; },
    showThematic(id) { calls.route.push(id); }
  };
  global.HGHistoricalRoutes = {
    async load() { return []; },
    getAll() { return []; },
    open() { throw new Error('historical route should not open in this test'); }
  };
  global.HGObservations = {
    async start(request) { calls.observation.push(request); }
  };
  global.PLACES = [{ id: 'aker_brygge', category: 'by', name: 'Aker Brygge' }];
  global.addEventListener = () => {};
  global.showToast = () => {};

  delete global.HG_TodayActionRouter;
  vm.runInThisContext(fs.readFileSync('js/today/HGTodayActionRouter.js', 'utf8'), { filename: 'HGTodayActionRouter.js' });
  return { router: global.HG_TodayActionRouter, calls, placeCard };
}

function bootObjectives(seed = {}) {
  global.window = global;
  global.localStorage = installStorage(seed);
  global.document = { getElementById() { return null; } };
  global.PLACES = [
    { id: 'aker_brygge', category: 'by', name: 'Aker Brygge' },
    { id: 'other_place', category: 'historie', name: 'Annet sted' }
  ];
  global.ROUTES = [{ id: 'route-one', title: 'Rute én' }];
  global.HISTORICAL_ROUTES = [];
  delete global.HG_DailyObjectives;
  delete global.HG_SocialSignals;
  delete global.HG_PublicProfileReadModel;
  delete global.HG_SocialMatchGraph;
  delete global.HG_CiviDebug;
  delete global.HG_CiviWorkdaySnapshot;
  delete global.CivicationHome;
  vm.runInThisContext(fs.readFileSync('js/objectives/HGDailyObjectives.js', 'utf8'), { filename: 'HGDailyObjectives.js' });
  return global.HG_DailyObjectives;
}

(async () => {
  const env = bootRouter();
  assert.strictEqual(env.router.canRoute({ routeKey: 'open_quiz' }).ok, true, 'quiz is a supported safe action');

  env.router.route({ routeKey: 'open_quiz', payload: { targetId: 'aker_brygge' } });
  assert.deepStrictEqual(env.calls.quiz, ['aker_brygge'], 'quiz action opens the real quiz surface');

  env.router.route({ routeKey: 'open_place', payload: { targetId: 'aker_brygge' } });
  assert.deepStrictEqual(env.calls.place, ['aker_brygge'], 'place action opens the map place');

  env.router.route({ routeKey: 'open_observation_ui', payload: { placeId: 'aker_brygge', subjectId: 'by' } });
  await Promise.resolve();
  assert.strictEqual(env.calls.observation.length, 1, 'observation action opens the real observation tool');
  assert.strictEqual(env.calls.observation[0].target.targetId, 'aker_brygge');

  const routeResult = env.router.route({ routeKey: 'open_route_viewer', payload: { targetId: 'route-one' } });
  await routeResult.value;
  assert.deepStrictEqual(env.calls.route, ['route-one'], 'route action opens the requested thematic route');

  env.router.route({ routeKey: 'open_workday' });
  assert.strictEqual(env.calls.civi(), 1, 'workday action opens Civication');
  assert(env.calls.close >= 5, 'real actions close Min dag before opening the destination surface');

  let objectives = bootObjectives();
  const generated = objectives.generate({
    sources: {
      runtime: { blockers: [], warnings: [] },
      routes: [{ id: 'route-one', title: 'Rute én' }],
      signals: {},
      profile: { publicProfileEnabled: true, counts: { signalCount: 3 } },
      graph: { matches: [] }
    }
  });

  const quiz = generated.objectives.find((o) => o.type === 'learning_quiz');
  assert.strictEqual(quiz.routeKey, 'open_quiz', 'quiz objective is wired to open_quiz');
  assert.strictEqual(quiz.payload.targetId, 'aker_brygge', 'quiz objective has a working quiz target');

  const route = generated.objectives.find((o) => o.type === 'route');
  assert.strictEqual(route.routeKey, 'open_route_viewer', 'route objective is wired to the route viewer');

  const observation = generated.objectives.find((o) => o.type === 'observation');
  assert.strictEqual(observation.routeKey, 'open_observation_ui', 'observation objective is wired to the observation tool');
  assert.strictEqual(observation.payload.targetId, 'aker_brygge');

  const legacyAgenda = {
    version: 1,
    agendaId: 'legacy',
    generatedSeq: 1,
    updatedSeq: 1,
    objectives: [{ id: 'legacy-quiz', seq: 1, type: 'learning_quiz', title: 'Ta quiz', status: 'suggested', routeKey: 'read_only', actionKind: 'read_only', payload: {} }],
    pinnedObjectiveIds: [],
    dismissedObjectiveIds: [],
    completedObjectiveIds: []
  };
  objectives = bootObjectives({ hg_daily_objectives_v1: JSON.stringify(legacyAgenda) });
  const migratedQuiz = objectives.getAgenda().objectives.find((o) => o.id === 'legacy-quiz');
  assert.strictEqual(migratedQuiz.routeKey, 'open_quiz', 'saved read-only quiz objectives migrate to a real action');
  assert.strictEqual(migratedQuiz.payload.targetId, 'aker_brygge', 'migrated quiz objective receives a valid target');

  const withCivicationTargets = objectives.generate({
    sources: {
      runtime: { blockers: [], warnings: [] },
      workday: { activeJob: { id: 'job-one', title: 'Jobb' } },
      economy: { wallet: 20 },
      home: { warning: true },
      routes: [],
      signals: {},
      profile: { publicProfileEnabled: true, counts: { signalCount: 3 } },
      graph: { matches: [] }
    }
  });
  assert.strictEqual(withCivicationTargets.objectives.find((o) => o.type === 'workday').routeKey, 'open_workday');
  assert.strictEqual(withCivicationTargets.objectives.find((o) => o.type === 'economy').routeKey, 'open_civication_summary');
  assert.strictEqual(withCivicationTargets.objectives.find((o) => o.type === 'home').routeKey, 'open_home');

  console.log('HG Today real action tests passed');
})().catch((error) => {
  process.stderr.write(String(error && error.stack || error));
  process.exit(1);
});
