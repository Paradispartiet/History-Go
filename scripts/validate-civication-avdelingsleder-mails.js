#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const category = 'naeringsliv';
const roleScope = 'avdelingsleder';
const roleId = 'naer_avdelingsleder';
const requiredMailFields = [
  'id','mail_type','mail_family','role_scope','subject','summary','situation','task_domain','competency','pressure','choice_axis','consequence_axis','narrative_arc','choices'
];

function readJson(rel) {
  const full = path.join(root, rel);
  assert(fs.existsSync(full), `Missing file: ${rel}`);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

const roleModelPath = `data/Civication/roleModels/${category}/${roleScope}.json`;
const planPath = `data/Civication/mailPlans/${category}/${roleScope}_plan.json`;
const familyFiles = [
  `data/Civication/mailFamilies/${category}/job/${roleScope}_intro_v2.json`,
  `data/Civication/mailFamilies/${category}/job/${roleScope}_job.json`,
  `data/Civication/mailFamilies/${category}/conflict/${roleScope}_conflict.json`,
  `data/Civication/mailFamilies/${category}/event/${roleScope}_event.json`,
  `data/Civication/mailFamilies/${category}/story/${roleScope}_story.json`,
  `data/Civication/mailFamilies/${category}/people/${roleScope}_people.json`,
  `data/Civication/mailFamilies/${category}/micro/${roleScope}_micro.json`
];

const roleModel = readJson(roleModelPath);
assert.strictEqual(roleModel.role_scope, roleScope, 'roleModel role_scope mismatch');
assert.strictEqual(roleModel.role_id, roleId, 'roleModel role_id mismatch');

const plan = readJson(planPath);
assert.strictEqual(plan.id, 'avdelingsleder_naeringsliv_v1', 'plan id mismatch');
assert.strictEqual(plan.role_scope, roleScope, 'plan role_scope mismatch');

const families = new Map();
const mails = [];
for (const file of familyFiles) {
  const catalog = readJson(file);
  assert.strictEqual(catalog.category, category, `Wrong category in ${file}`);
  assert.strictEqual(catalog.role_scope, roleScope, `Wrong role_scope in ${file}`);
  assert(Array.isArray(catalog.families) && catalog.families.length > 0, `No families in ${file}`);
  for (const family of catalog.families) {
    assert(family.id, `Missing family.id in ${file}`);
    assert(!families.has(family.id), `Duplicate family.id: ${family.id}`);
    families.set(family.id, file);
    assert(Array.isArray(family.mails) && family.mails.length > 0, `No mails in family ${family.id}`);
    for (const mail of family.mails) mails.push(mail);
  }
}

const missingAllowed = [];
for (const step of plan.sequence || []) {
  for (const familyId of step.allowed_families || []) {
    if (!families.has(familyId)) missingAllowed.push(`${step.step}:${familyId}`);
  }
}
assert.strictEqual(missingAllowed.length, 0, `Missing allowed_families: ${missingAllowed.join(', ')}`);

const recommended = roleModel.mail_integration?.recommended_mail_families || [];
const missingRecommended = recommended.filter((id) => !families.has(id));
assert.strictEqual(missingRecommended.length, 0, `Missing recommended_mail_families: ${missingRecommended.join(', ')}`);

const mailIds = new Set();
for (const mail of mails) {
  for (const field of requiredMailFields) {
    assert(mail[field] !== undefined && mail[field] !== '', `Missing ${field} in ${mail.id || '<unknown>'}`);
  }
  assert(!mailIds.has(mail.id), `Duplicate mail id: ${mail.id}`);
  mailIds.add(mail.id);
  assert.strictEqual(mail.role_scope, roleScope, `Wrong role_scope in ${mail.id}`);
  assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `Need >=2 choices in ${mail.id}`);
  for (const choice of mail.choices) {
    assert(choice.id !== undefined && choice.id !== '', `choice.id missing in ${mail.id}`);
    assert(choice.label !== undefined && choice.label !== '', `choice.label missing in ${mail.id}`);
    assert(choice.effect !== undefined, `choice.effect missing in ${mail.id}`);
    assert(Array.isArray(choice.tags), `choice.tags must be array in ${mail.id}`);
    assert(String(choice.feedback || '').trim().length > 0, `choice.feedback missing in ${mail.id}`);
  }
}

console.log('Avdelingsleder Civication validation OK: roleModel, plan, families and mails are coherent.');
