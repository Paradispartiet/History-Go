#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function makeStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    }
  };
}

function makeFetch(rootDir) {
  return async function fetchMock(url) {
    const clean = String(url || '').split('?')[0].replace(/^\/+/, '');
    const fullPath = path.resolve(rootDir, clean);

    if (!fullPath.startsWith(rootDir)) {
      return { ok: false, status: 400, async json() { return null; }, async text() { return ''; } };
    }

    try {
      const body = await fs.promises.readFile(fullPath, 'utf8');
      return {
        ok: true,
        status: 200,
        async json() { return JSON.parse(body); },
        async text() { return body; }
      };
    } catch {
      return {
        ok: false,
        status: 404,
        async json() { return null; },
        async text() { return ''; }
      };
    }
  };
}

function loadScript(relPath) {
  const fullPath = path.join(repoRoot, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

function getPendingEvent() {
  const inbox = global.window.CivicationState.getInbox();
  const pending = Array.isArray(inbox)
    ? inbox.find(item => item && item.status === 'pending')
    : null;
  return pending ? pending.event : null;
}

async function run() {
  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = {
    readyState: 'complete',
    addEventListener() {}
  };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);

  global.CivicationCalendar = {
    getPhase() {
      return 'morning';
    }
  };
  global.getNextDayCarryover = () => ({
    visibilityBias: 0,
    processBias: 0
  });
  global.applyMorningCarryoverEffects = () => {};
  global.getMorningModeFromCarryover = () => 'balanced';
  global.applyMorningModeToEvent = (_event, _mode) => _event;
  global.setNextDayCarryover = () => {};
  global.appendDayChoiceLog = () => {};
  global.applyPhaseChoiceEffects = () => {};
  global.maybeCreateContactFromChoice = () => {};
  global.HG_CapitalMaintenance = { maintain: () => null };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  loadScript('js/Civication/systems/day/dayPatches.js');
  loadScript('js/Civication/mailPlanBridge.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  loadScript('js/Civication/systems/civicationLifeMailRuntime.js');

  const engine = new global.CivicationEventEngine();
  global.HG_CiviEngine = engine;

  const seededPosition = {
    career_id: 'naeringsliv',
    title: 'Fagarbeider',
    role_key: 'fagarbeider',
    role_id: 'naer_fagarbeider'
  };

  global.CivicationState.setActivePosition(seededPosition);

  assert.strictEqual(
    global.CivicationMailRuntime.inspect().patched,
    true,
    'CivicationMailRuntime should patch EventEngine prototype'
  );

  const beforePlannedState = global.CivicationState.getState();
  const beforeLifeRuntime = beforePlannedState.life_mail_runtime_v1 || null;

  const firstOpen = await engine.onAppOpen({ force: true });
  assert.strictEqual(firstOpen.enqueued, true, 'First onAppOpen should enqueue pending planned mail');

  const pendingBeforeAnswer = getPendingEvent();
  assert(pendingBeforeAnswer, 'Expected pending event after first onAppOpen');
  assert.strictEqual(pendingBeforeAnswer.source_type, 'planned', 'Expected planned pending event');
  assert.strictEqual(
    pendingBeforeAnswer.role_content_meta?.role_id,
    seededPosition.role_id,
    'Planned mail should match active role'
  );

  const firstChoice = pendingBeforeAnswer.choices && pendingBeforeAnswer.choices[0];
  assert(firstChoice && firstChoice.id, 'Expected at least one choice on pending planned mail');

  const answeredMailId = pendingBeforeAnswer.id;

  const answerResult = await global.HG_CiviEngine.answer(answeredMailId, firstChoice.id);
  assert.notStrictEqual(answerResult?.ok, false, 'Answering pending mail should succeed');

  const afterAnswerState = global.CivicationState.getState();
  const runtimeAfterAnswer = afterAnswerState.mail_runtime_v1 || {};

  assert.strictEqual(afterAnswerState.consumed[answeredMailId], true, 'Answered id should be marked consumed');
  assert(runtimeAfterAnswer.step_index >= 1, 'mail_runtime_v1.step_index should increase for planned mails');
  assert(
    Array.isArray(runtimeAfterAnswer.consumed_ids) && runtimeAfterAnswer.consumed_ids.includes(answeredMailId),
    'Answered id should be in mail_runtime_v1.consumed_ids'
  );

  const pendingAfterAnswer = getPendingEvent();
  assert(
    !pendingAfterAnswer ||
      pendingAfterAnswer.id !== answeredMailId ||
      pendingAfterAnswer.source_type === 'thread',
    'Pending mail should be cleared/changed/replaced by valid followup thread'
  );

  await global.HG_CiviEngine.onAppOpen({ force: true });
  const pendingAfterSecondOpen = getPendingEvent();
  assert(
    !pendingAfterSecondOpen || pendingAfterSecondOpen.id !== answeredMailId,
    'onAppOpen must not reintroduce the same answered planned mail'
  );

  const plannedEndState = global.CivicationState.getState();
  assert.deepStrictEqual(
    plannedEndState.life_mail_runtime_v1 || null,
    beforeLifeRuntime,
    'life_mail_runtime_v1 must not change from planned/thread mails'
  );

  const mailRuntimeBeforeLife = JSON.parse(JSON.stringify(plannedEndState.mail_runtime_v1 || null));

  global.CivicationState.setInbox([]);
  global.CivicationState.setActivePosition(null);
  global.CivicationState.setState({
    life_tags: ['alkohol_risk']
  });

  const lifeOpen = await global.HG_CiviEngine.onAppOpen({ force: true });
  assert.strictEqual(lifeOpen.enqueued, true, 'Expected life mail to enqueue after enabling life tags without active job');

  const pendingLife = getPendingEvent();
  assert(pendingLife && pendingLife.source_type === 'life', 'Expected pending life mail');
  const lifeChoice = pendingLife.choices && pendingLife.choices[0];
  assert(lifeChoice && lifeChoice.id, 'Expected answer choice on life mail');

  const lifeAnswer = await global.HG_CiviEngine.answer(pendingLife.id, lifeChoice.id);
  assert.notStrictEqual(lifeAnswer?.ok, false, 'Answering life mail should succeed');

  const afterLifeState = global.CivicationState.getState();
  assert.deepStrictEqual(
    afterLifeState.mail_runtime_v1 || null,
    mailRuntimeBeforeLife,
    'mail_runtime_v1 must not change from life mails'
  );

  const civicationHtml = fs.readFileSync(path.join(repoRoot, 'Civication.html'), 'utf8');
  const swJs = fs.readFileSync(path.join(repoRoot, 'sw.js'), 'utf8');

  assert(
    civicationHtml.includes('js/Civication/systems/civicationMailRuntime.js') &&
      civicationHtml.includes('js/Civication/systems/civicationLifeMailRuntime.js') &&
      civicationHtml.includes('js/Civication/systems/day/dayPatches.js'),
    'Civication.html should reference current runtime scripts'
  );

  assert(
    swJs.includes('js/Civication/systems/civicationMailRuntime.js') &&
      swJs.includes('js/Civication/systems/civicationLifeMailRuntime.js') &&
      swJs.includes('js/Civication/systems/day/dayPatches.js'),
    'sw.js precache should include current runtime scripts'
  );

  global.getVisitedPlacesCount = () => 2;
  global.getVisitedPlaceIds = () => [];
  global.loadPlaceContexts = async () => [];
  global.getMatchedHistoryGoContexts = () => [];
  global.pickHistoryGoContext = () => null;
  global.getContextFlavorForCareer = () => null;
  global.getCiviContacts = () => [];
  global.buildCarryoverFromChoiceLog = () => ({
    fatigue: 0,
    visibilityBias: 0,
    processBias: 0
  });

  global.CivicationPlaceAccessBridge = {
    getBucket(_type) {
      return ['coffee', 'food'];
    }
  };

  loadScript('js/Civication/systems/day/dayEvents.js');

  const phaseRole = {
    career_id: 'naeringsliv',
    brand_name: 'Paradispartiet'
  };

  const eveningEvents = [];
  for (let i = 0; i < 6; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const event = await global.makeEveningEvent(phaseRole);
    eveningEvents.push(event);
  }

  assert.strictEqual(eveningEvents.length, 6, 'Expected 6 generated evening phase events');
  eveningEvents.forEach((event) => {
    assert.strictEqual(event.source_type, 'phase', 'Evening phase event must have source_type=phase');
    assert.strictEqual(event.phase_family, 'evening_store', 'Evening phase event must have phase_family=evening_store');
    assert(event.phase_context && typeof event.phase_context === 'object', 'Evening phase event must include phase_context');
  });

  const eveningSubjects = new Set(eveningEvents.map(event => event.subject));
  assert(eveningSubjects.size > 1, 'Evening subjects should not all be identical');

  const eveningSemanticSubjectPairs = new Set();
  eveningEvents.forEach((event) => {
    const key = `${event.semantic_event_key}|${event.subject}|${event.phase_context?.variant_id || ''}`;
    assert(
      !eveningSemanticSubjectPairs.has(key),
      'Evening semantic_event_key repeats must vary by subject and/or variant'
    );
    eveningSemanticSubjectPairs.add(key);
  });

  const lunchEvents = [];
  for (let i = 0; i < 6; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const event = await global.makeLunchEvent(phaseRole);
    lunchEvents.push(event);
  }

  assert.strictEqual(lunchEvents.length, 6, 'Expected 6 generated lunch phase events');
  lunchEvents.forEach((event) => {
    assert.strictEqual(event.source_type, 'phase', 'Lunch phase event must have source_type=phase');
    assert.strictEqual(event.phase_family, 'lunch_store', 'Lunch phase event must have phase_family=lunch_store');
    assert(event.phase_context && typeof event.phase_context === 'object', 'Lunch phase event must include phase_context');
  });

  const lunchSubjects = new Set(lunchEvents.map(event => event.subject));
  assert(lunchSubjects.size > 1, 'Lunch subjects should not all be identical');

  const lunchSemanticSubjectPairs = new Set();
  lunchEvents.forEach((event) => {
    const key = `${event.semantic_event_key}|${event.subject}|${event.phase_context?.variant_id || ''}`;
    assert(
      !lunchSemanticSubjectPairs.has(key),
      'Lunch semantic_event_key repeats must vary by subject and/or variant'
    );
    lunchSemanticSubjectPairs.add(key);
  });

  const dayEndEvent = global.makeDayEndEvent();
  assert.strictEqual(dayEndEvent.source_type, 'phase', 'Day-end phase event must have source_type=phase');
  assert.strictEqual(dayEndEvent.phase_family, 'day_end', 'Day-end phase event must have phase_family=day_end');
  assert(dayEndEvent.phase_context && typeof dayEndEvent.phase_context === 'object', 'Day-end phase event must include phase_context');

  console.log('PASS: Civication mail runtime loop test completed.');
  console.log(`answered_planned_mail=${answeredMailId}`);
  console.log(`runtime_step_index=${runtimeAfterAnswer.step_index}`);
  console.log(`pending_after_answer=${pendingAfterAnswer ? pendingAfterAnswer.id : 'none'}`);
  console.log(`pending_after_second_open=${pendingAfterSecondOpen ? pendingAfterSecondOpen.id : 'none'}`);
  console.log(`life_mail_answered=${pendingLife.id}`);
}

run().catch(err => {
  console.error('FAIL: Civication mail runtime loop test failed.');
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
