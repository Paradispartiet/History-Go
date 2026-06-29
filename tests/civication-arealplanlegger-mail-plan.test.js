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

  const requiredMailFields = [
    'id',
    'mail_type',
    'mail_family',
    'role_scope',
    'phase',
    'priority',
    'place_id',
    'subject',
    'summary',
    'purpose',
    'stakes',
    'situation',
    'task_domain',
    'task_kind',
    'competency',
    'pressure',
    'choice_axis',
    'consequence_axis',
    'narrative_arc',
    'learning_focus',
    'choices'
  ];

  for (const type of ['micro', 'followup', 'knowledge', 'consequence']) {
    const catalog = catalogs.find(row => row.mail_type === type);
    assert(catalog, `Arealplanlegger should have a ${type} family catalog`);
    const mails = (catalog.families || []).flatMap(family => family.mails || []);
    const minimums = { micro: 16, followup: 8, knowledge: 8, consequence: 8 };
    assert(mails.length >= minimums[type], `Arealplanlegger should include at least ${minimums[type]} ${type} mails`);
    for (const mail of mails) {
      for (const field of requiredMailFields) {
        assert(mail[field] !== undefined && mail[field] !== null, `${mail.id} should declare ${field}`);
      }
      assert.strictEqual(mail.role_scope, 'by_radgiver_plan', `${mail.id} should stay in by_radgiver_plan runtime scope`);
      assert.strictEqual(mail.mail_type, type, `${mail.id} should have matching mail_type`);
      assert(mail.from || mail.sender || mail.person_id, `${mail.id} should have a concrete sender`);
      assert(mail.task_domain && mail.competency, `${mail.id} should have a concrete work task and competency`);
      assert(mail.pressure && mail.choice_axis, `${mail.id} should have a fagproblem and choice under pressure`);
      assert(mail.consequence_axis, `${mail.id} should declare consequence_axis`);
      assert(Array.isArray(mail.situation) && mail.situation.length > 0, `${mail.id} should declare situation`);
      assert(Array.isArray(mail.learning_focus) && mail.learning_focus.length > 0, `${mail.id} should declare learning_focus`);
      assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} should include at least two choices`);
      assert(mail.next_bias || mail.triggers_on_choice, `${mail.id} should declare next_bias or triggers_on_choice`);
      if (['followup', 'consequence'].includes(type)) {
        assert(mail.next_bias, `${mail.id} should declare next_bias for branch steering`);
        assert(mail.triggers_on_choice, `${mail.id} should declare triggers_on_choice for branch follow-up`);
        assert(mail.branch_flags && (Array.isArray(mail.branch_flags) ? mail.branch_flags.length > 0 : Object.keys(mail.branch_flags).length > 0), `${mail.id} should declare branch_flags`);
        assert(Array.isArray(mail.tags) && mail.tags.length > 0, `${mail.id} should declare tags`);
      }
    }
  }

  const knowledgeCatalog = catalogs.find(row => row.mail_type === 'knowledge');
  const knowledgeText = JSON.stringify(knowledgeCatalog).toLowerCase();
  for (const term of ['reguleringsplan', 'arealformål', 'hensynssone', 'rekkefølgekrav', 'planbestemmelser', 'ros-analyse', 'medvirkning', 'støy', 'sol/skygge', 'overvann', 'grønnstruktur', 'parkering', 'kollektivdekning', 'skolevei']) {
    assert(knowledgeText.includes(term), `knowledge mails should connect to ${term}`);
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
  const runtimeTypes = new Set(runtime.items.map(row => row.event?.mail_type).filter(Boolean));
  assert(runtimeTypes.size > 2, 'runtime should include several mail family types');
  assert(runtimeTypes.has('job') && [...runtimeTypes].some(type => type !== 'job'), 'runtime should include multiple mail_type values');
  assert(runtimeTypes.has('job'), 'Day 1 should include at least one job-mail');
  assert(runtimeTypes.has('people'), 'Day 1 should include at least one people-mail');
  assert(
    ['micro', 'followup', 'knowledge', 'consequence'].some(type => runtimeTypes.has(type)),
    'Day 1 should include at least one micro/followup/knowledge/consequence mail'
  );
  assert(
    ['conflict', 'story', 'event'].some(type => runtimeTypes.has(type)),
    'Day 1 should include at least one conflict-, story- or event-relevant mail'
  );
  const dayOnePhases = [...new Set(runtime.items.map(row => row.phase))];
  for (const phase of ['morning', 'forenoon', 'workday', 'lunch', 'afternoon', 'dinner', 'evening', 'day_end']) {
    assert(dayOnePhases.includes(phase), `Day 1 should cover phase ${phase}`);
  }
  const dayOneText = JSON.stringify(runtime.items.map(row => ({
    id: row.event?.id,
    subject: row.event?.subject,
    summary: row.event?.summary,
    situation: row.event?.situation,
    narrative_arc: row.event?.narrative_arc,
    learning_focus: row.event?.learning_focus
  }))).toLowerCase();
  assert(
    ['plankart', 'målbildet', 'skolevei', 'grøntdrag', 'støy', 'medvirkning', 'rekkefølgekrav'].some(term => dayOneText.includes(term)),
    'Day 1 should include at least one core Arealplanlegger topic'
  );
  assert(
    runtime.items.some(row => row.phase === 'evening' && ['knowledge', 'consequence'].includes(row.event?.mail_type)),
    'Day 1 evening should land in a knowledge or consequence mail'
  );
  assert(
    runtime.items.some(row => row.slot === 'carryover' && row.phase === 'day_end'),
    'Day 1 should include a day_end carryover slot'
  );

  const dayOneAudit = runtime.items.map((row, index) => ({
    index,
    phase: row.phase,
    slot: row.slot,
    type: row.event?.mail_type,
    id: row.event?.source_mail_id || row.event?.id,
    subject: row.event?.subject
  }));
  console.log('Arealplanlegger Day 1 audit map:');
  console.table(dayOneAudit);

  const expectedPhaseOrder = ['morning', 'forenoon', 'workday', 'lunch', 'afternoon', 'dinner', 'evening', 'day_end'];
  assert.deepStrictEqual(
    [...new Set(dayOneAudit.map(row => row.phase))],
    expectedPhaseOrder,
    'Day 1 should be auditable as one coherent day in the expected phase order'
  );

  const auditBySlot = new Map(dayOneAudit.map(row => [`${row.phase}:${row.slot}`, row]));
  const expectedDayOneAnchors = {
    'morning:morning_brief': 'by_areal_story_linje_001',
    'forenoon:primary_work_mail': 'by_areal_job_plankart_001',
    'workday:conflict_or_event': 'by_areal_event_utvalg_001',
    'workday:analysis_followup': 'by_areal_followup_008',
    'lunch:informal_people_mail': 'by_areal_people_skolevei_005',
    'afternoon:family_or_practical': 'by_areal_people_utbygger_001',
    'evening:consequence_mail': 'by_areal_consequence_008'
  };
  for (const [slotKey, expectedId] of Object.entries(expectedDayOneAnchors)) {
    assert.strictEqual(
      auditBySlot.get(slotKey)?.id,
      expectedId,
      `Day 1 anchor ${slotKey} should stay deterministic and dramaturgically placed`
    );
  }

  const phaseText = phase => JSON.stringify(runtime.items
    .filter(row => row.phase === phase)
    .map(row => row.event || {})).toLowerCase();
  const hasAny = (text, terms) => terms.some(term => text.includes(term));
  assert(hasAny(phaseText('morning'), ['lillebekk', 'plankart', 'linje']), 'morning should open Lillebekk/plankart context');
  assert(hasAny(phaseText('forenoon'), ['plankart', 'stedsanalyse', 'analyse', 'nabolag', 'høydeillustrasjon']), 'forenoon should establish plankart/stedsanalyse work');
  assert(hasAny(phaseText('workday'), ['konflikt', 'utvalg', 'frist', 'målkonflikt', 'politisk', 'grøntdrag', 'skolevei', 'støy']), 'workday should introduce area-planning conflict');
  assert(hasAny(phaseText('lunch'), ['nabo', 'skolekontakt', 'lokal', 'snarveien', 'medvirkning']), 'lunch should add people/local knowledge');
  assert(hasAny(phaseText('afternoon'), ['utbygger', 'grønnstruktur', 'sol/skygge', 'konflikt', 'press']), 'afternoon should follow up conflict or pressure');
  assert(hasAny(phaseText('evening'), ['knowledge', 'consequence', 'hensynssone', 'planbestemmelser', 'læring', 'risiko']), 'evening should land in knowledge/consequence');
  assert(hasAny(phaseText('day_end'), ['følger med', 'carryover', 'i morgen', 'læringspunkt', 'dagslutt']), 'day_end should carry the day forward');

  const sourceBackedItems = runtime.items.filter(row => row.event?.source_type !== 'daily_generated');
  for (const row of sourceBackedItems) {
    const mail = row.event || {};
    for (const field of ['learning_focus', 'narrative_arc', 'choice_axis', 'consequence_axis']) {
      assert(mail[field] !== undefined && mail[field] !== null, `${mail.id} should declare ${field} in Day 1 runtime`);
    }
    assert(mail.from || mail.sender || mail.person_id || mail.source, `${mail.id} should have a concrete sender in Day 1 runtime`);
    assert(mail.task_domain || mail.pressure, `${mail.id} should have a concrete work task or pressure in Day 1 runtime`);
    assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} should keep a clear choice in Day 1 runtime`);
  }

  const sourceIds = sourceBackedItems.map(row => String(row.event?.source_mail_id || row.event?.id || '').toLowerCase());
  assert(!sourceIds.some(id => /week2|second_week|mastery|advanced/.test(id)), 'Day 1 should not pull week2/mastery/advanced source mails');
  const firstFollowupIndex = runtime.items.findIndex(row => row.event?.mail_type === 'followup');
  const firstConflictIndex = runtime.items.findIndex(row => ['conflict', 'event'].includes(row.event?.mail_type));
  assert(firstFollowupIndex === -1 || (firstConflictIndex !== -1 && firstConflictIndex < firstFollowupIndex), 'followup mails should have a logical conflict/event source earlier in Day 1');
  const firstConsequenceIndex = runtime.items.findIndex(row => row.event?.mail_type === 'consequence');
  assert(firstConsequenceIndex === -1 || runtime.items.slice(0, firstConsequenceIndex).some(row => Array.isArray(row.event?.choices) && row.event.choices.length >= 2), 'consequence mail should not arrive before relevant player choices exist');

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
