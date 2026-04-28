#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function loadScript(relPath) {
  const fullPath = path.join(repoRoot, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

function setupBrowserMocks() {
  global.window = global;
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.Event = class Event { constructor(type) { this.type = type; } };

  let activePosition = null;
  global.CivicationState = {
    __careerRoleResolverStatePatched: false,
    getActivePosition() { return activePosition; },
    setActivePosition(next) { activePosition = next; return next; },
    getState() { return { consumed: {}, mail_runtime_v1: {} }; },
    setState() {}
  };

  global.CivicationJobs = {
    pushOffer(offer) { return { ok: true, offer }; },
    acceptOffer() { return { ok: true }; }
  };

  global.CivicationEventEngine = function CivicationEventEngine() {};
  global.CivicationEventEngine.prototype.buildMailPool = async function buildMailPool() {
    return { mails: [] };
  };
  global.CivicationEventEngine.prototype.answer = async function answer() {
    return { ok: true };
  };

  global.BADGES = [
    {
      id: 'naeringsliv',
      name: 'Næringsliv & industri',
      tiers: [
        { label: 'Arbeider', threshold: 1 },
        { label: 'Fagarbeider', threshold: 2 },
        { label: 'Mellomleder', threshold: 3 }
      ]
    }
  ];
}

async function main() {
  setupBrowserMocks();
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');

  const resolver = global.CivicationCareerRoleResolver;
  assert(resolver, 'CivicationCareerRoleResolver should exist');

  assert.strictEqual(resolver.resolveRoleScope('Arbeider', 'naeringsliv'), 'ekspeditor');
  assert.strictEqual(resolver.resolveRoleScope('Ekspeditør / butikkmedarbeider', 'naeringsliv'), 'ekspeditor');
  assert.strictEqual(resolver.resolveRoleScope('Erfaren butikkmedarbeider', 'naeringsliv'), 'erfaren_butikkmedarbeider');
  assert.strictEqual(resolver.resolveRoleScope('Vareansvarlig / områdeansvarlig', 'naeringsliv'), 'vareansvarlig');
  assert.strictEqual(resolver.resolveRoleScope('Skiftansvarlig', 'naeringsliv'), 'skiftansvarlig');
  assert.strictEqual(resolver.resolveRoleScope('Fagarbeider salg/service', 'naeringsliv'), 'fagarbeider_salg_service');
  assert.strictEqual(resolver.resolveRoleScope('Mellomleder', 'naeringsliv'), 'mellomleder');

  assert.strictEqual(resolver.resolveContentScope('Erfaren butikkmedarbeider', 'naeringsliv'), 'ekspeditor');
  assert.strictEqual(resolver.resolveContentScope('Vareansvarlig / områdeansvarlig', 'naeringsliv'), 'ekspeditor');
  assert.strictEqual(resolver.resolveContentScope('Skiftansvarlig', 'naeringsliv'), 'ekspeditor');
  assert.strictEqual(resolver.resolveContentScope('Fagarbeider salg/service', 'naeringsliv'), 'fagarbeider');

  const applied = resolver.applyBadgeOverrides();
  assert.strictEqual(applied, true, 'Badge override should apply');

  const naering = global.BADGES.find(b => b.id === 'naeringsliv');
  assert.strictEqual(naering.tiers[0].label, 'Ekspeditør / butikkmedarbeider');
  assert.strictEqual(naering.tiers[0].threshold, 1);
  assert.strictEqual(naering.tiers[1].label, 'Erfaren butikkmedarbeider');
  assert.strictEqual(naering.tiers[2].label, 'Vareansvarlig / områdeansvarlig');
  assert.strictEqual(naering.civication_role_ladder[0].role_scope, 'ekspeditor');
  assert.strictEqual(naering.civication_role_ladder[1].content_scope, 'ekspeditor');

  global.CivicationState.setActivePosition({
    career_id: 'naeringsliv',
    title: 'Ekspeditør / butikkmedarbeider'
  });

  const active = global.CivicationState.getActivePosition();
  assert.strictEqual(active.role_scope, 'ekspeditor');
  assert.strictEqual(active.content_scope, 'ekspeditor');
  assert.strictEqual(active.role_key, 'ekspeditor');
  assert.strictEqual(active.role_id, 'naer_ekspeditor');

  const offerResult = global.CivicationJobs.pushOffer({
    career_id: 'naeringsliv',
    career_name: 'Næringsliv & industri',
    title: 'Arbeider',
    threshold: 1,
    points_at_offer: 1
  });

  assert.strictEqual(offerResult.ok, true);
  assert.strictEqual(offerResult.offer.title, 'Ekspeditør / butikkmedarbeider');
  assert.strictEqual(offerResult.offer.role_scope, 'ekspeditor');

  console.log('PASS: Civication career role resolver test completed.');
  console.log(`first_tier=${naering.tiers[0].label}`);
  console.log(`first_role_scope=${naering.civication_role_ladder[0].role_scope}`);
}

main().catch(error => {
  console.error('FAIL: Civication career role resolver test failed.');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
