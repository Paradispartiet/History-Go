#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));

function makeStorage() {
  const store = new Map();
  return {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(String(key), String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

function makeFetch(rootDir) {
  return async (url) => {
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

function loadScript(rel) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, rel), 'utf8'), { filename: rel });
}

async function run() {
  const category = 'film_tv';
  const roleScope = 'produksjonsassistent';
  const roleId = 'film_tv_produksjonsassistent';
  const roleModel = read(`data/Civication/roleModels/${category}/${roleScope}.json`);
  const grammar = read(`data/Civication/workGrammars/${category}/${roleScope}.json`);
  const plan = read(`data/Civication/mailPlans/${category}/${roleScope}_plan.json`);
  const matrix = read('data/Civication/careerGameplayMatrix.json');
  const requiredTypes = grammar.mail_generation_contract.required_mail_types;

  assert.deepStrictEqual(requiredTypes, ['job', 'people', 'conflict', 'event', 'followup', 'knowledge', 'consequence']);
  assert.deepStrictEqual(plan.sequence.map((step) => step.type), ['job', 'people', 'conflict', 'event', 'job', 'people', 'knowledge', 'conflict', 'followup', 'event', 'consequence']);
  assert.strictEqual(roleModel.related_people.length, 4, 'the work world must have named colleagues and responsibility owners');
  assert.strictEqual(roleModel.related_places.length, 4, 'the work world must use concrete physical and digital work surfaces');
  assert(roleModel.required_knowledge.concepts.length >= 4, 'knowledge must be declared as functional production knowledge');
  assert(roleModel.career_path.possible_promotions.length >= 2, 'performance must lead to real next roles');
  assert(roleModel.career_path.possible_exits.length >= 4, 'the role must support voluntary and involuntary exits');

  const mailIds = new Set();
  for (const type of requiredTypes) {
    const catalog = read(`data/Civication/mailFamilies/${category}/${type}/${roleScope}_${type}.json`);
    assert.strictEqual(catalog.mail_type, type);
    const mails = catalog.families.flatMap((family) => family.mails || []);
    assert(mails.length >= 1, `${type} must contain playable content`);
    for (const mail of mails) {
      assert(!mailIds.has(mail.id), `${mail.id} must be globally unique inside the role package`);
      mailIds.add(mail.id);
      assert(mail.place_id, `${mail.id} must happen at a concrete work surface`);
      assert(mail.choice_axis && mail.consequence_axis && mail.narrative_arc, `${mail.id} must bind choices to consequences`);
      assert(Array.isArray(mail.situation) && mail.situation.length >= 3, `${mail.id} must be a situation, not a text label`);
      assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} must present a meaningful choice`);
      for (const choice of mail.choices) {
        assert(choice.feedback, `${mail.id}/${choice.id} must explain the immediate result`);
        assert(choice.effects?.stats, `${mail.id}/${choice.id} must affect gameplay state`);
      }
    }
  }

  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);
  global.CivicationCalendar = { getPhase: () => 'morning', setPhase() {}, advanceByMinutes() {} };
  global.HG_CapitalMaintenance = { maintain: () => null };
  global.HG_Lifestyle = { addTags: () => null };
  global.CivicationPsyche = {
    getAutonomy: () => 50,
    updateIntegrity() {}, updateVisibility() {}, updateEconomicRoom() {}, updateTrust() {}, checkBurnout() {}, processCollapse() {}
  };

  for (const script of [
    'js/Civication/core/civicationState.js',
    'js/Civication/core/civicationEventEngine.js',
    'js/Civication/systems/civicationEventChannels.js',
    'js/Civication/systems/civicationCareerRoleResolver.js',
    'js/Civication/systems/day/dayChoiceDirector.js',
    'js/Civication/systems/day/dayConsequences.js',
    'js/Civication/systems/civicationMailRuntime.js',
    'js/Civication/systems/civicationWorkdayMailBuilder.js',
    'js/Civication/systems/civicationDailyMailBuilder.js',
    'js/Civication/systems/civicationCareerOutcomeRuntime.js'
  ]) loadScript(script);

  const active = { career_id: category, role_id: roleId, title: 'Produksjonsassistent' };
  assert.strictEqual(global.CivicationCareerRoleResolver.resolveCareerRoleScope(active), roleScope, 'Film/TV title must resolve to its canonical work world');
  assert.strictEqual(global.CivicationCareerRoleResolver.resolveCareerRoleId(active), roleId, 'Film/TV work world must resolve its canonical runtime role id');
  assert.strictEqual(global.CivicationMailRuntime.getPlanPath(active), `data/Civication/mailPlans/${category}/${roleScope}_plan.json`);

  const firstCandidates = await global.CivicationMailRuntime.makeCandidateMailsForActiveRole(active, {});
  assert.strictEqual(firstCandidates[0]?.id, 'film_tv_pa_job_to_call_sheet', 'the generic mail runtime must open the role at plan step one');

  const runtime = await global.CivicationDailyMailBuilder.buildQueue(active, { date: '2026-08-14' });
  const workItems = runtime.items.filter((row) => ['forenoon', 'workday'].includes(row.phase));
  const roleItems = workItems.filter((row) => row.event?.role_scope === roleScope && row.event?.source_type !== 'daily_generated');
  const roleTypes = roleItems.map((row) => row.event.mail_type);
  assert.strictEqual(roleTypes.length, 6, 'day one must contain six concrete role situations');
  assert.deepStrictEqual(roleTypes.slice(0, 3), ['job', 'knowledge', 'people'], 'the day must open with task, functional knowledge and a colleague');
  assert(['conflict', 'event'].includes(roleTypes[3]), 'the main work block must contain a conflict or production event');
  assert.deepStrictEqual(roleTypes.slice(4), ['followup', 'consequence'], 'the work block must close with follow-up and delayed consequence');
  assert.strictEqual(roleItems.filter((row) => row.event.source_type === 'planned').length, 1, 'only the main job situation may advance the role plan');
  for (const row of roleItems.filter((item) => item.event.source_type !== 'planned')) {
    assert.strictEqual(row.event.daily_mail_meta.advances_role_plan, false, `${row.event.id} must stay inside the day loop`);
  }

  const finishedRuntime = {
    role_plan_id: plan.id,
    step_index: plan.sequence.length,
    history: plan.sequence.map((step) => ({ id: `step_${step.step}`, source_type: 'planned', choice_id: 'A' }))
  };
  const decide = (performance) => global.CivicationCareerOutcomeRuntime.decideOutcome(active, plan, finishedRuntime, performance).status;
  assert.strictEqual(decide({ score: 3, strikes: 0, warning_used: false, stability: 'STABLE' }), 'PROMOTED');
  assert.strictEqual(decide({ score: 1, strikes: 0, warning_used: false, stability: 'STABLE' }), 'STAGNATED');
  assert.strictEqual(decide({ score: -3, strikes: 3, warning_used: false, stability: 'STABLE' }), 'FIRED');

  const world = matrix.worlds.find((item) => item.key === `${category}/${roleScope}`);
  assert(world, 'the canonical work world must exist in the permanent matrix');
  assert.strictEqual(world.status, 'playable');
  assert.strictEqual(world.audit.runtime_gate, true);
  assert.deepStrictEqual(world.audit.missing_components, []);
  for (const component of ['day_one', 'workday_loop', 'people', 'places', 'mail', 'knowledge', 'consequences', 'performance', 'progression', 'exit']) {
    assert.strictEqual(world.audit.components[component].level, 'complete', `${component} must be complete`);
  }

  console.log('PASS: Film/TV Produksjonsassistent completes a six-situation generic workday with knowledge, delayed consequences and career outcomes.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
