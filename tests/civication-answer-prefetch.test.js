#!/usr/bin/env node
// tests/civication-answer-prefetch.test.js
//
// Pinner ytelseskontrakten for svar-flyten:
//   1. CivicationJsonStore deduper samtidige kall (N kall → 1 fetch) og
//      negativ-cacher 404 (feilstier hamrer ikke serveren).
//   2. Etter CivicationMailRuntime.prewarm() gjør makeCandidateMailsForActiveRole
//      NULL nye fetches — svaret venter aldri på nettverket.
//   3. Etter CivicationDailyMailBuilder.prewarm() er dagsprogram, rolleplan og
//      alle builder-familier varme.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

global.window = global;
global.window.addEventListener = () => {};
global.window.dispatchEvent = () => {};
global.Event = function (type) { this.type = type; };
global.document = { readyState: 'complete', addEventListener: () => {} };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

let fetchCount = 0;
const fetchLog = [];
global.fetch = async (url) => {
  fetchCount++;
  const rel = String(url).replace(/^\/+/, '');
  fetchLog.push(rel);
  const abs = path.join(repoRoot, rel);
  const exists = fs.existsSync(abs) && fs.statSync(abs).isFile();
  const body = exists ? fs.readFileSync(abs, 'utf8') : '';
  return { ok: exists, status: exists ? 200 : 404, async json() { return JSON.parse(body || '{}'); }, async text() { return body; } };
};

function loadScript(rel) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, rel), 'utf8'), { filename: rel });
}

loadScript('js/Civication/core/civicationJsonStore.js');

(async () => {
  const store = global.window.CivicationJsonStore;
  assert(store, 'CivicationJsonStore global mangler');

  // 1a) Samtidige kall → én fetch.
  fetchCount = 0;
  const p = 'data/Civication/mailDayProgram.json';
  const [a, b, c] = await Promise.all([store.fetchJson(p), store.fetchJson(p), store.fetchJson(p)]);
  assert.strictEqual(fetchCount, 1, `3 samtidige kall skal gi 1 fetch, fikk ${fetchCount}`);
  assert(a && a === b && b === c, 'alle kall skal få samme cachede objekt');

  // 1b) 404 negativ-caches.
  fetchCount = 0;
  assert.strictEqual(await store.fetchJson('data/finnes_ikke_xyz.json'), null);
  assert.strictEqual(await store.fetchJson('data/finnes_ikke_xyz.json'), null);
  assert.strictEqual(fetchCount, 1, `404 skal bare fetches én gang, fikk ${fetchCount}`);

  // 2) MailRuntime: prewarm → deretter null fetches i kandidatbygging.
  global.window.CivicationState = {
    getActivePosition: () => ({ career_id: 'by', title: 'Arealplanlegger', role_key: 'by_radgiver_plan', role_id: 'by_arealplanlegger' }),
    getState: () => ({}),
    setState: () => {},
    getInbox: () => [],
    setInbox: () => {}
  };
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  const runtime = global.window.CivicationMailRuntime;
  assert(typeof runtime?.prewarm === 'function', 'CivicationMailRuntime.prewarm mangler');

  await runtime.prewarm();
  fetchCount = 0;
  const candidates = await runtime.makeCandidateMailsForActiveRole(
    global.window.CivicationState.getActivePosition(),
    {}
  );
  assert(Array.isArray(candidates), 'kandidatliste skal være array');
  assert.strictEqual(fetchCount, 0, `kandidatbygging etter prewarm skal gjøre 0 fetches, gjorde ${fetchCount}: ${fetchLog.slice(-fetchCount).join(', ')}`);

  // 3) DailyMailBuilder: prewarm varmer program + plan + alle familiestier.
  global.window.CivicationCalendar = { DAY_PHASES: ['morning', 'day_end'], getPhase: () => 'morning', getClock: () => ({ dayIndex: 1 }) };
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');
  const builder = global.window.CivicationDailyMailBuilder;
  assert(typeof builder?.prewarm === 'function', 'CivicationDailyMailBuilder.prewarm mangler');

  await builder.prewarm();
  fetchCount = 0;
  const familyPaths = builder.getFamilyPaths(global.window.CivicationState.getActivePosition());
  assert(familyPaths.length > 0, 'builder skal ha familiestier for rollen');
  for (const fp of familyPaths) await builder.loadJson(fp);
  await builder.loadJson('data/Civication/mailDayProgram.json');
  assert.strictEqual(fetchCount, 0, `builder-lasting etter prewarm skal gjøre 0 fetches, gjorde ${fetchCount}`);

  console.log('civication-answer-prefetch.test.js passed');
})().catch((e) => { console.error(e); process.exit(1); });
