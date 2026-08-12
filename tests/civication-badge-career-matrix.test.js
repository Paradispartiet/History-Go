#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const index = readJson('data/badges/index.json');
const policy = readJson('data/Civication/badgeCareerAuditPolicy.json');
const badges = new Map();
for (const rel of index.files || []) {
  const payload = readJson(rel);
  const list = Array.isArray(payload?.badges) ? payload.badges : [payload];
  for (const badge of list) if (badge?.id) badges.set(String(badge.id), badge);
}

assert.strictEqual(badges.size, 17, 'Badge Career Matrix skal dekke alle 17 canonical badges');
let tierCount = 0;
for (const [badgeId, badge] of badges) {
  const policyRows = policy.badges?.[badgeId];
  assert.ok(Array.isArray(policyRows), `${badgeId}: mangler Badge Career Audit-policy`);
  const policyByTitle = new Map(policyRows.map((row) => [String(row[0]), row]));
  assert.strictEqual(policyByTitle.size, (badge.tiers || []).length,
    `${badgeId}: policy må ha nøyaktig én rad per canonical tier`);

  for (const tier of badge.tiers || []) {
    tierCount += 1;
    const row = policyByTitle.get(String(tier.label));
    assert.ok(row, `${badgeId}/${tier.label}: mangler eksplisitt klassifisering`);
    const [, kind, offerPolicy, action, qualificationIds] = row;
    assert.ok(kind, `${badgeId}/${tier.label}: mangler kind`);
    assert.ok(['direct','not_job','review_required','qualification_required','authorization_required','appointment_required'].includes(offerPolicy),
      `${badgeId}/${tier.label}: ukjent offer_policy ${offerPolicy}`);
    assert.ok(['keep','keep_with_gate','replace','review'].includes(action),
      `${badgeId}/${tier.label}: ukjent action ${action}`);
    assert.ok(Array.isArray(qualificationIds), `${badgeId}/${tier.label}: qualification_ids må være array`);
  }

  for (const row of policyRows) {
    assert.ok((badge.tiers || []).some((tier) => tier.label === row[0]),
      `${badgeId}: policy har foreldet/ukjent tittel ${row[0]}`);
  }
}
assert.strictEqual(tierCount, 266, 'Auditen skal være låst til dagens 266 canonical tiers');

const psychology = badges.get('psykologi');
assert.ok(psychology, 'Psykologi-badge mangler');
const psychPolicy = new Map((policy.badges.psykologi || []).map((row) => [row[0], row]));
for (const tier of psychology.tiers || []) {
  const auditRow = psychPolicy.get(tier.label);
  assert.ok(tier.career_offer, `psykologi/${tier.label}: runtime career_offer mangler`);
  assert.strictEqual(tier.career_offer.policy, auditRow[2],
    `psykologi/${tier.label}: runtime policy må samsvare med audit policy`);
  assert.deepStrictEqual(tier.career_offer.qualification_ids || [], auditRow[4] || [],
    `psykologi/${tier.label}: qualification_ids må samsvare med audit policy`);
}

assert.strictEqual(psychology.tiers.find((t) => t.label === 'Titter').career_offer.policy, 'not_job');
assert.strictEqual(psychology.tiers.find((t) => t.label === 'Analytiker').career_offer.policy, 'review_required');
assert.strictEqual(psychology.tiers.find((t) => t.label === 'Psykolog').career_offer.policy, 'authorization_required');
assert.deepStrictEqual(
  psychology.tiers.find((t) => t.label === 'Spesialistpsykolog').career_offer.qualification_ids,
  ['no_psychologist_authorization_or_license', 'no_psychologist_specialist_approval']
);

const originalPushes = [];
const sandbox = {
  console,
  setTimeout: () => 0,
  clearTimeout: () => {},
  fetch: async () => ({ json: async () => ({}) }),
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  document: {
    addEventListener: () => {}
  },
  CustomEvent: function CustomEvent(type, init) { this.type = type; this.detail = init?.detail; },
  Event: function Event(type) { this.type = type; },
  showToast: () => {},
  pulseBadge: () => {},
  catIdFromDisplay: (value) => value,
  deriveTierFromPoints: () => ({ tierIndex: 0 }),
  window: {
    BADGES: [psychology],
    CivicationJobs: {
      pushOffer: (offer) => {
        originalPushes.push(offer);
        return { ok: true, reason: 'pushed' };
      },
      canReceiveNewOffers: () => true,
      getOffers: () => []
    },
    dispatchEvent: () => {}
  }
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/Civication/merits-and-jobs.js'), 'utf8'), sandbox,
  { filename: 'merits-and-jobs.js' });

const jobs = sandbox.window.CivicationJobs;
let result = jobs.pushOffer({ career_id: 'psykologi', title: 'Titter', threshold: 5 });
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_not_job');
assert.strictEqual(originalPushes.length, 0, 'ikke-jobb må stoppes før den når original pushOffer');

result = jobs.pushOffer({ career_id: 'psykologi', title: 'Analytiker', threshold: 10 });
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_review_required');

result = jobs.pushOffer({ career_id: 'psykologi', title: 'Psykolog', threshold: 115 });
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');

result = jobs.pushOffer({ career_id: 'psykologi', title: 'Veileder', threshold: 40 });
assert.strictEqual(result.ok, true, 'direkte, reell jobb skal fortsatt kunne tilbys');
assert.strictEqual(originalPushes.length, 1);

sandbox.window.CivicationQualifications = {
  hasAll(ids) {
    return ids.length === 1 && ids[0] === 'no_psychologist_authorization_or_license';
  }
};
result = jobs.pushOffer({ career_id: 'psykologi', title: 'Psykolog', threshold: 115 });
assert.strictEqual(result.ok, true, 'Psykolog kan passere når eksplisitt autorisasjonsbevis finnes');

result = jobs.pushOffer({ career_id: 'psykologi', title: 'Spesialistpsykolog', threshold: 150 });
assert.strictEqual(result.ok, false, 'Spesialistpsykolog skal kreve både psykologautorisasjon og spesialistgodkjenning');

sandbox.window.CivicationQualifications = {
  hasAll(ids) {
    return ids.includes('no_psychologist_authorization_or_license') &&
      ids.includes('no_psychologist_specialist_approval');
  }
};
result = jobs.pushOffer({ career_id: 'psykologi', title: 'Spesialistpsykolog', threshold: 150 });
assert.strictEqual(result.ok, true);

console.log(`civication badge career matrix ok: ${tierCount} tiers / ${badges.size} badges`);
