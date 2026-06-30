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

function boot(overrides = {}) {
  global.window = global;
  global.localStorage = installStorage({ visited_places: JSON.stringify({ p1: true }) });
  global.document = {
    getElementById: (id) => id === 'map' || id === 'spotmeeting-inbox' ? ({}) : null,
    querySelector: (selector) => String(selector).includes('socialmeet') ? ({ textContent: 'Social Meet' }) : null,
    addEventListener: () => {}
  };
  global.console = { log() {}, warn() {}, error() {}, table() {} };
  global.PLACES = [{ id: 'p1' }];
  global.PEOPLE = [{ id: 'person1' }];
  global.TAGS_REGISTRY = { history: {} };
  global.MAP = { id: 'map' };
  global.HGLearningLog = {
    getQuizHistory: () => [{ id: 'q1' }],
    getVisitHistory: () => [{ id: 'p1' }]
  };
  global.BADGES = [{ id: 'history' }];
  global.HG_CAREERS = [{ career_id: 'handel' }];
  delete global.HG_CiviDebug;
  delete global.HG_SocialDebug;
  delete global.HG_RuntimeHealth;
  global.renderSpotmeetingInbox = () => {};
  Object.assign(global, overrides);
  vm.runInThisContext(fs.readFileSync('js/social/HGPublicProfileReadModel.js', 'utf8'), { filename: 'HGPublicProfileReadModel.js' });
  vm.runInThisContext(fs.readFileSync('js/social/HGSpotmeeting.js', 'utf8'), { filename: 'HGSpotmeeting.js' });
  vm.runInThisContext(fs.readFileSync('js/social/HGSpotmeetingPlaceCardDemo.js', 'utf8'), { filename: 'HGSpotmeetingPlaceCardDemo.js' });
  vm.runInThisContext(fs.readFileSync('js/debug/HGRuntimeHealth.js', 'utf8'), { filename: 'HGRuntimeHealth.js' });
  return global.HG_RuntimeHealth;
}

(async () => {
  let runtime = boot({ PLACES: [] });
  let report = await runtime.health();
  assert.strictEqual(report.ok, false, 'empty PLACES creates a blocker');
  assert(report.blockers.some((b) => b.key === 'places_missing'), 'places blocker is listed');

  runtime = boot({ HG_CiviDebug: { health: async () => ({ ok: true, score: 95, warnings: [{ key: 'civi_warn', message: 'civi warning' }], blockers: [], summary: 'civi ok' }) } });
  report = await runtime.health();
  assert.strictEqual(report.checks.civication.details.summary, 'civi ok', 'Civication sub-health is included');
  assert(report.warnings.some((w) => w.subsystem === 'civication' && w.key === 'civi_warn'), 'Civication warnings propagate');

  runtime = boot({ HG_SocialDebug: { health: async () => ({ ok: true, warnings: [{ key: 'social_warn', message: 'social warning' }], blockers: [], summary: 'social ok' }) } });
  report = await runtime.health();
  assert.strictEqual(report.checks.social.details.summary, 'social ok', 'Social sub-health is included');
  assert(report.warnings.some((w) => w.subsystem === 'social' && w.key === 'social_warn'), 'Social warnings propagate');

  runtime = boot({ HG_SocialDebug: { health: async () => ({ ok: false, warnings: [], privacyViolations: [{ key: 'privacy_leak', message: 'privacy leak' }], blockers: [], summary: 'privacy problem' }) } });
  report = await runtime.health();
  assert.strictEqual(report.ok, false, 'Social privacy violation makes top-level health not ok');
  assert(report.blockers.some((b) => b.subsystem === 'social' && b.key === 'privacy_leak'), 'Social privacy blockers propagate');
  assert.match(report.summary, /personvern/, 'privacy blocker uses Norwegian privacy summary');

  const healthyScore = (await boot().health()).score;
  report = await boot({ HG_CiviDebug: { health: async () => ({ blockers: [{ key: 'wallet', message: 'missing wallet' }], warnings: [{ key: 'job', message: 'idle job' }] }) } }).health();
  assert(report.score < healthyScore, 'score decreases with blockers and warnings');

  report = await boot({ PEOPLE: [], TAGS_REGISTRY: null }).health();
  assert.strictEqual(report.ok, true, 'optional PEOPLE/TAGS warnings do not block');
  assert(report.warnings.some((w) => w.key === 'people_missing'), 'empty PEOPLE creates warning');
  assert(report.warnings.some((w) => w.key === 'tags_missing'), 'missing TAGS creates warning');

  runtime = boot();
  report = await runtime.health();
  const printed = await runtime.printHealth();
  assert.deepStrictEqual(printed.checks, report.checks, 'printHealth returns health object');

  runtime = boot();
  const before = global.localStorage.dump();
  await runtime.snapshot();
  await runtime.health();
  await runtime.printHealth();
  assert.deepStrictEqual(global.localStorage.dump(), before, 'runtime health does not mutate localStorage');

  console.log('HG runtime health tests passed');
})().catch((error) => {
  process.stderr.write(String(error && error.stack || error));
  process.exit(1);
});
