#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const category = 'naeringsliv';
const roleScopes = ['controller', 'finansanalytiker', 'okonomi_og_finanssjef', 'finansdirektor'];
const requiredMailFields = [
  'id',
  'mail_type',
  'mail_family',
  'role_scope',
  'subject',
  'summary',
  'situation',
  'task_domain',
  'competency',
  'pressure',
  'choice_axis',
  'consequence_axis',
  'narrative_arc',
  'choices'
];

function readJson(relativePath) {
  const full = path.join(root, relativePath);
  assert(fs.existsSync(full), `Missing file: ${relativePath}`);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function collectFamilies(roleScope) {
  const base = `data/Civication/mailFamilies/${category}`;
  const files = [
    `${base}/job/${roleScope}_intro_v2.json`,
    `${base}/job/${roleScope}_job.json`,
    `${base}/conflict/${roleScope}_conflict.json`,
    `${base}/story/${roleScope}_story.json`,
    `${base}/event/${roleScope}_event.json`
  ];

  const catalogs = files.map(readJson);
  const families = new Map();
  const mails = [];

  for (const catalog of catalogs) {
    assert.strictEqual(catalog.category, category, `Wrong category in ${roleScope}`);
    assert.strictEqual(catalog.role_scope, roleScope, `Wrong role_scope in ${roleScope}`);
    assert(Array.isArray(catalog.families) && catalog.families.length > 0, `No families in ${roleScope}`);

    for (const family of catalog.families) {
      assert(family.id, `Family without id in ${roleScope}`);
      assert(!families.has(family.id), `Duplicate family ${family.id} in ${roleScope}`);
      families.set(family.id, family);
      assert(Array.isArray(family.mails) && family.mails.length > 0, `No mails in family ${family.id}`);
      for (const mail of family.mails) mails.push(mail);
    }
  }

  return { families, mails };
}

function validateMail(mail, roleScope, ids) {
  for (const key of requiredMailFields) {
    assert(mail[key] !== undefined && mail[key] !== '', `Missing ${key} in ${mail.id || 'unknown mail'}`);
  }

  assert(!ids.has(mail.id), `Duplicate mail id ${mail.id}`);
  ids.add(mail.id);

  assert.strictEqual(mail.role_scope, roleScope, `Wrong role_scope in ${mail.id}`);
  assert(Array.isArray(mail.situation) && mail.situation.length > 0, `situation must be non-empty array in ${mail.id}`);
  assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `Need >=2 choices in ${mail.id}`);

  for (const choice of mail.choices) {
    assert(choice.id !== undefined && choice.id !== '', `choice.id missing in ${mail.id}`);
    assert(choice.label !== undefined && choice.label !== '', `choice.label missing in ${mail.id}`);
    assert(choice.effect !== undefined, `choice.effect missing in ${mail.id}`);
    assert(Array.isArray(choice.tags), `choice.tags must be array in ${mail.id}`);
    assert(String(choice.feedback || '').trim().length > 0, `choice.feedback missing in ${mail.id}`);
  }
}

for (const roleScope of roleScopes) {
  const plan = readJson(`data/Civication/mailPlans/${category}/${roleScope}_plan.json`);
  assert.strictEqual(plan.schema, 'civication_mail_plan_v1', `Wrong plan schema for ${roleScope}`);
  assert.strictEqual(plan.category, category, `Wrong plan category for ${roleScope}`);
  assert.strictEqual(plan.role_scope, roleScope, `Wrong plan role_scope for ${roleScope}`);
  assert(Array.isArray(plan.sequence) && plan.sequence.length >= 8, `Expected at least 8 steps for ${roleScope}`);

  const { families, mails } = collectFamilies(roleScope);
  const ids = new Set();
  for (const mail of mails) validateMail(mail, roleScope, ids);

  const missingFamilies = [];
  for (const step of plan.sequence) {
    assert(Array.isArray(step.allowed_families), `allowed_families missing in ${roleScope} step ${step.step}`);
    for (const familyId of step.allowed_families) {
      if (!families.has(familyId)) missingFamilies.push(`${roleScope} step ${step.step}: ${familyId}`);
    }
  }

  assert.strictEqual(missingFamilies.length, 0, `Missing families:\n${missingFamilies.join('\n')}`);
  assert(mails.length >= 8, `Expected at least 8 mails for ${roleScope}, got ${mails.length}`);
}

console.log('Finance Civication mail validation OK: controller, finansanalytiker, okonomi_og_finanssjef and finansdirektor plans/families are coherent.');
