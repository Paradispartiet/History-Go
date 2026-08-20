#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

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

assert.strictEqual(badges.size, 19, 'Badge Career Matrix skal dekke alle 19 canonical badges');
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
assert.strictEqual(tierCount, 274, 'Auditen skal være låst til dagens 274 canonical tiers');

const generatorOutput = execFileSync(
  process.execPath,
  [path.join(ROOT, 'scripts/civication-badge-career-matrix.mjs'), '--check'],
  { cwd: ROOT, encoding: 'utf8' }
);
assert.match(generatorOutput, /274 tiers across 19 badges/,
  'Badge Career Matrix-generatoren må kunne lese og validere dagens canonical kilder');

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

const expectedEntryLadder = [
  ['Miljøassistent', 5],
  ['Sosialassistent', 10],
  ['Aktivitetsleder (omsorgsarbeid)', 15],
  ['Miljøarbeider', 25]
];
for (let i = 0; i < expectedEntryLadder.length; i += 1) {
  const [title, threshold] = expectedEntryLadder[i];
  const tier = psychology.tiers[i];
  assert.strictEqual(tier.label, title, `psykologi tier ${i + 1} skal være ${title}`);
  assert.strictEqual(tier.threshold, threshold, `${title}: poenggrense skal bevares`);
  assert.strictEqual(tier.career_offer.policy, 'direct', `${title}: reell inngangsjobb skal kunne tilbys direkte`);
  const row = psychPolicy.get(title);
  assert.deepStrictEqual(row.slice(1), ['actual_job', 'direct', 'keep', []],
    `${title}: audit-policy skal være actual_job/direct/keep`);
}

for (const obsolete of ['Titter', 'Analytiker', 'Atferdsobservatør', 'Samtalepartner']) {
  assert.ok(!psychology.tiers.some((tier) => tier.label === obsolete),
    `foreldet Psykologi-tier skal være fjernet: ${obsolete}`);
  assert.ok(!psychPolicy.has(obsolete), `audit-policy skal ikke beholde foreldet tittel: ${obsolete}`);
}

assert.strictEqual(psychology.tiers.find((t) => t.label === 'Psykolog').career_offer.policy, 'authorization_required');
assert.deepStrictEqual(
  psychology.tiers.find((t) => t.label === 'Spesialistpsykolog').career_offer.qualification_ids,
  ['no_psychologist_authorization_or_license', 'no_psychologist_specialist_approval']
);

const careersRaw = readJson('data/Civication/hg_careers.json');
const careerList = Array.isArray(careersRaw) ? careersRaw : careersRaw.careers;
const psychologyCareer = careerList.find((career) => career.career_id === 'psykologi');
assert.ok(psychologyCareer, 'Psykologi-karriereregel mangler');
assert.strictEqual(psychologyCareer.cross_requirements, undefined,
  'vanlige Psykologi-inngangsjobber skal ikke blokkeres av gammelt Vitenskap-krysskrav');
const psychSalary = psychologyCareer.economy?.salary_by_tier || {};
assert.deepStrictEqual(Object.keys(psychSalary), Array.from({ length: 13 }, (_, i) => String(i + 1)),
  'Psykologi må ha eksakt lønnsregel for alle 13 tiers');
const salaryValues = Object.values(psychSalary).map(Number);
assert.ok(salaryValues.every(Number.isFinite), 'alle Psykologi-tierlønninger må være numeriske');
assert.ok(salaryValues.every((value, index) => index === 0 || value >= salaryValues[index - 1]),
  'Psykologi-lønn skal ikke falle ved opprykk');

const workGrammar = readJson('data/Civication/workGrammars/psykologi/psykologi_miljoarbeid.json');
assert.strictEqual(workGrammar.role_scope, 'psykologi_miljoarbeid');
assert.deepStrictEqual(workGrammar.badge_binding.badge_titles, expectedEntryLadder.map(([title]) => title));
assert.ok(workGrammar.authority_boundary.may_not.includes('stille diagnose'),
  'FWG må eksplisitt beskytte grensen mot diagnostikk');

const lifeManifest = readJson('data/Civication/lifestory/manifest.json');
const psychLife = lifeManifest.roles.psykologi_miljoarbeid;
assert.ok(psychLife, 'Psykologi-miljøarbeid må ha aktiv Life Story-binding');
assert.strictEqual(psychLife.role_scope, 'psykologi_miljoarbeid');
assert.strictEqual(psychLife.badge_id, 'psykologi');
assert.deepStrictEqual(psychLife.badge_titles, expectedEntryLadder.map(([title]) => title));
for (const rel of [psychLife.role, psychLife.threads, psychLife.scenes]) {
  assert.ok(fs.existsSync(path.join(ROOT, rel)), `Life Story-fil mangler: ${rel}`);
}
const lifeThreads = readJson(psychLife.threads);
const lifeScenes = readJson(psychLife.scenes);
assert.ok(lifeThreads.threads.length >= 5, 'Psykologi Life Story må ha minst fem distinkte fagtråder');
assert.ok(lifeScenes.scenes.length >= 5, 'Psykologi Life Story må ha minst fem spillbare scener');

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
let result = jobs.pushOffer({ career_id: 'psykologi', title: 'Miljøassistent', threshold: 5 });
assert.strictEqual(result.ok, true, 'Miljøassistent skal være et direkte jobbtilbud');
assert.strictEqual(originalPushes.length, 1);

result = jobs.pushOffer({ career_id: 'psykologi', title: 'Miljøarbeider', threshold: 25 });
assert.strictEqual(result.ok, true, 'Miljøarbeider skal være et direkte jobbtilbud');
assert.strictEqual(originalPushes.length, 2);

result = jobs.pushOffer({ career_id: 'psykologi', title: 'Psykolog', threshold: 115 });
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'career_qualification_required');
assert.strictEqual(originalPushes.length, 2, 'Psykolog uten autorisasjon må stoppes før original pushOffer');

result = jobs.pushOffer({ career_id: 'psykologi', title: 'Veileder', threshold: 40 });
assert.strictEqual(result.ok, true, 'direkte, reell jobb skal fortsatt kunne tilbys');
assert.strictEqual(originalPushes.length, 3);

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

console.log(`civication badge career matrix ok: ${tierCount} tiers / ${badges.size} badges / Psychology entry ladder complete`);
