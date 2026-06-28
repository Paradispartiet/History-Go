#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function makeStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); }
  };
}

function makeFetch(rootDir) {
  return async function fetchMock(url) {
    const clean = String(url || '').split('?')[0].replace(/^\/+/, '');
    const fullPath = path.resolve(rootDir, clean);
    if (!fullPath.startsWith(rootDir)) return { ok: false, status: 400, async json() { return null; } };
    try {
      const body = await fs.promises.readFile(fullPath, 'utf8');
      return { ok: true, status: 200, async json() { return JSON.parse(body); } };
    } catch {
      return { ok: false, status: 404, async json() { return null; } };
    }
  };
}

function loadScript(relPath) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath });
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'));
}

async function run() {
  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);
  global.CivicationCalendar = { getPhase: () => 'morning', setPhase: () => {}, advanceByMinutes: () => {} };
  global.HG_CapitalMaintenance = { maintain: () => null };
  global.HG_Lifestyle = { addTags: () => null };
  global.CivicationPsyche = { getAutonomy: () => 50, updateIntegrity: () => null, updateVisibility: () => null, updateEconomicRoom: () => null, updateTrust: () => null, checkBurnout: () => null, processCollapse: () => null };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/day/dayChoiceDirector.js');
  loadScript('js/Civication/systems/day/dayConsequences.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');
  loadScript('js/Civication/systems/civicationMailPlanDebug.js');

  const plan = readJson('data/Civication/mailPlans/by/by_radgiver_plan_plan.json');
  const expectedTypes = ['job', 'people', 'story', 'conflict', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
  const familyPaths = expectedTypes.map(type => `data/Civication/mailFamilies/by/${type}/by_radgiver_plan_${type}.json`);
  const catalogs = familyPaths.map(readJson);
  const familiesById = new Map();
  const typesWithMail = new Set();
  for (const catalog of catalogs) {
    for (const family of catalog.families || []) {
      familiesById.set(family.id, { type: catalog.mail_type, family });
      if ((family.mails || []).length + (family.threads || []).length > 0) typesWithMail.add(catalog.mail_type);
    }
  }

  for (const type of expectedTypes) {
    assert(typesWithMail.has(type), `Arealplanlegger should have ${type} mail content`);
  }

  const allowed = [...new Set((plan.sequence || []).flatMap(step => step.allowed_families || []))];
  for (const familyId of allowed) {
    assert(familiesById.has(familyId), `mailPlan allowed_families should exist: ${familyId}`);
  }

  for (const type of ['micro', 'followup', 'knowledge', 'consequence']) {
    const catalog = catalogs.find(row => row.mail_type === type);
    const mails = (catalog.families || []).flatMap(family => family.mails || []);
    assert(mails.length > 0, `Arealplanlegger should include ${type} mails`);
    for (const mail of mails) {
      assert(mail.from || mail.sender || mail.person_id, `${mail.id} should have a concrete sender`);
      assert(mail.task_domain && mail.competency, `${mail.id} should have a concrete work task and competency`);
      assert(mail.pressure && mail.choice_axis, `${mail.id} should have a fagproblem and choice under pressure`);
      assert(mail.consequence_axis, `${mail.id} should declare consequence_axis`);
      assert(Array.isArray(mail.learning_focus) && mail.learning_focus.length > 0, `${mail.id} should declare learning_focus`);
      assert(mail.next_bias || mail.triggers_on_choice, `${mail.id} should declare next_bias or triggers_on_choice`);
    }
  }

  const peopleCatalog = catalogs.find(catalog => catalog.mail_type === 'people');
  const peopleMails = (peopleCatalog.families || []).flatMap(family => family.mails || []);
  assert(peopleMails.length >= 8, 'Arealplanlegger should include a broad people cast');
  for (const actor of ['ivar_utbygger', 'hanne_beboer', 'nora_planjuss', 'maja_utvalgssekretaer', 'petter_plankonsulent']) {
    assert(peopleMails.some(mail => mail.person_id === actor || mail.sender === actor), `people mail should include ${actor}`);
  }

  const active = { career_id: 'by', title: 'Arealplanlegger', role_key: 'by_radgiver_plan', role_id: 'by_radgiver_plan' };
  global.CivicationState.setActivePosition(active);
  const runtime = await global.CivicationDailyMailBuilder.buildQueue(active, { date: '2026-06-22' });
  assert(runtime && runtime.role_scope === 'by_radgiver_plan', 'DailyMailBuilder should build a by_radgiver_plan runtime');
  assert(runtime.items.length > 0, 'DailyMailBuilder should queue mail items');
  assert.deepStrictEqual([...new Set(runtime.items.map(row => row.phase))], ['morning', 'forenoon', 'workday', 'lunch', 'afternoon', 'dinner', 'evening', 'day_end'], 'runtime should cover the full day');
  assert(new Set(runtime.items.map(row => row.event?.mail_type)).size > 2, 'runtime should include several mail family types');

  const map = await global.CivicationDebug.buildDebugMap('by_radgiver_plan');
  assert.strictEqual(map.roleModel.exists, true, 'debug roleModel should exist');
  assert.strictEqual(map.mailPlan.exists, true, 'debug mailPlan should exist');
  assert(map.people.length > 0, 'debug should discover people');
  for (const type of expectedTypes) {
    assert(map.mailFamilies[type]?.length > 0, `debug should list ${type} families`);
  }
  for (const gap of ['rollen mangler people-mails', 'rollen mangler story/conflict/event', 'rollen mangler lunsj-/kveldsegnet innhold']) {
    assert(!map.gaps.includes(gap), `debug gap should be closed: ${gap}`);
  }
  const newContentGaps = map.gaps.filter(gap => /micro|followup|knowledge|consequence|allowed_families|family/.test(gap));
  assert.deepStrictEqual(newContentGaps, [], `debug should not report new mail-pack gaps: ${newContentGaps.join(', ')}`);

  console.log('civication-arealplanlegger-mail-plan.test.js passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
