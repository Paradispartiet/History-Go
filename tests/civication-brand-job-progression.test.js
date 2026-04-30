#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');

function loadScript(relPath) {
  const code = fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

function makeStorage() {
  const store = new Map();
  return {
    getItem(k) { return store.has(k) ? store.get(k) : null; },
    setItem(k, v) { store.set(String(k), String(v)); },
    removeItem(k) { store.delete(k); },
    clear() { store.clear(); }
  };
}

function ensureInboxArray() {
  const inbox = global.CivicationState?.getInbox?.();
  if (!Array.isArray(inbox)) {
    global.CivicationState?.setInbox?.([]);
    return [];
  }
  return inbox;
}

function bootstrap(activePosition) {
  global.window = global;
  global.localStorage = makeStorage();
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  const events = [];
  global.dispatchEvent = (ev) => { events.push(ev?.type); };
  global.addEventListener = () => {};
  global.location = { href: 'http://localhost/Civication.html' };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/civicationBrandJobState.js');
  loadScript('js/Civication/systems/civicationBrandJobProgression.js');

  global.CivicationState.setActivePosition(activePosition);
  global.CivicationState.setInbox([]);
  return { events };
}

function countMilestones() {
  return ensureInboxArray().filter((item) => item?.event?.source_type === 'brand_progression').length;
}

function firstMilestone() {
  return ensureInboxArray().find((item) => item?.event?.source_type === 'brand_progression')?.event || null;
}

function applyMail(id, tags, brand = 'norli') {
  return global.CivicationBrandJobState.applyChoiceConsequences({
    id,
    source_type: 'planned',
    role_scope: 'ekspeditor',
    brand_id: brand,
    brand_name: brand === 'norli' ? 'Norli' : 'Narvesen',
    mail_family: 'kundemote_og_service',
    mail_type: 'job',
    mail_tags: ['brand_mail']
  }, {
    id: 'A',
    tags,
    effect: 1
  });
}

(function testNorliFaglighetMilestone() {
  bootstrap({ brand_id: 'norli', brand_name: 'Norli', career_id: 'naeringsliv', role_id: 'naer_ekspeditor' });

  applyMail('norli_fag_1', ['fag']);
  applyMail('norli_fag_2', ['fag']);
  assert.strictEqual(countMilestones(), 0, 'threshold should not trigger before 3');

  const result = applyMail('norli_fag_3', ['fag']);
  assert.strictEqual(result.changed, true);

  const event = firstMilestone();
  assert(event, 'milestone should be enqueued');
  assert.strictEqual(event.source_type, 'brand_progression');
  assert.strictEqual(event.mail_class, 'job_milestone');
  assert.strictEqual(event.brand_id, 'norli');
  assert.strictEqual(event.role_scope, 'ekspeditor');
  assert.strictEqual(event.metric, 'faglighet');
  assert.strictEqual(event.threshold, 3);
  assert.strictEqual(event.id, 'brand_progress_norli_faglighet_3');

  const progression = global.CivicationBrandJobProgression.getState();
  assert(progression.triggered['norli:ekspeditor:norli_ekspeditor_faglighet_3']);

  applyMail('norli_fag_4', ['fag']);
  assert.strictEqual(countMilestones(), 1, 'same milestone should not repeat');
})();

(function testWrongBrandDoesNotTrigger() {
  bootstrap({ brand_id: 'norli', brand_name: 'Norli', career_id: 'naeringsliv', role_id: 'naer_ekspeditor' });

  const res = applyMail('wrong_brand_1', ['drift', 'tempo'], 'narvesen');
  assert.strictEqual(res.changed, false);
  const evalResult = global.CivicationBrandJobProgression.evaluate();
  assert.strictEqual(evalResult.triggered.length, 0);
  assert.strictEqual(countMilestones(), 0);
})();

(function testNarvesenRiskMilestone() {
  bootstrap({ brand_id: 'narvesen', brand_name: 'Narvesen', career_id: 'naeringsliv', role_id: 'naer_ekspeditor' });

  applyMail('narvesen_risk_1', ['snarvei'], 'narvesen');
  applyMail('narvesen_risk_2', ['snarvei'], 'narvesen');
  applyMail('narvesen_risk_3', ['snarvei'], 'narvesen');

  const event = firstMilestone();
  assert(event, 'Narvesen risk milestone should be enqueued');
  assert.strictEqual(event.brand_id, 'narvesen');
  assert.strictEqual(event.metric, 'risiko');
  assert.strictEqual(event.id, 'brand_progress_narvesen_risiko_3');
})();

(function testCanonicalEnvelopeAndPendingDedupe() {
  bootstrap({ brand_id: 'norli', brand_name: 'Norli', career_id: 'naeringsliv', role_id: 'naer_ekspeditor' });

  global.CivicationState.setInbox([{
    status: 'pending',
    createdAt: Date.now(),
    event: {
      id: 'brand_progress_norli_kundetillit_3',
      source_type: 'brand_progression',
      mail_class: 'job_milestone',
      brand_id: 'norli',
      role_scope: 'ekspeditor'
    }
  }]);

  applyMail('norli_kunde_1', ['kunde']);
  applyMail('norli_kunde_2', ['kunde']);
  applyMail('norli_kunde_3', ['kunde']);

  const inbox = ensureInboxArray();
  assert.strictEqual(inbox.filter((item) => item?.event?.id === 'brand_progress_norli_kundetillit_3').length, 1);
  assert(inbox[0].status === 'pending');
  assert(typeof inbox[0].createdAt === 'number');

  const progression = global.CivicationBrandJobProgression.getState();
  assert.strictEqual(progression.triggered['norli:ekspeditor:norli_ekspeditor_kundetillit_3'].source, 'already_pending');
})();

(function testLoadOrder() {
  const html = fs.readFileSync(path.join(repoRoot, 'Civication.html'), 'utf8');
  const stateIdx = html.indexOf('js/Civication/systems/civicationBrandJobState.js');
  const progressionIdx = html.indexOf('js/Civication/systems/civicationBrandJobProgression.js');
  const runtimeIdx = html.indexOf('js/Civication/systems/civicationMailRuntime.js');
  assert(stateIdx > -1, 'BrandJobState script missing');
  assert(progressionIdx > -1, 'BrandJobProgression script missing');
  assert(runtimeIdx > -1, 'MailRuntime script missing');
  assert(stateIdx < progressionIdx, 'BrandJobProgression must load after BrandJobState');
  assert(progressionIdx < runtimeIdx, 'BrandJobProgression must load before MailRuntime');
})();

console.log('PASS: Civication brand job progression milestones test completed.');
