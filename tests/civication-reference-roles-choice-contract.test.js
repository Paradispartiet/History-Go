#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}

function walkJson(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkJson(full);
    return entry.isFile() && entry.name.endsWith('.json') ? [full] : [];
  });
}

function collectRoleMails(category, roleScope) {
  const base = path.join(root, 'data', 'Civication', 'mailFamilies', category);
  return walkJson(base).flatMap((file) => {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    return (json.families || []).flatMap((family) => (family.mails || [])
      .filter((mail) => mail.role_scope === roleScope)
      .map((mail) => ({ ...mail, catalog_mail_type: json.mail_type, family_id: family.id })));
  });
}

function signature(mail) {
  return (mail.choices || []).map((choice) => String(choice.label || choice.text || '').trim().toLowerCase()).filter(Boolean).join(' || ');
}

function assertDistinctConcreteChoices(roleLabel, mails) {
  const concrete = mails.filter((mail) => Array.isArray(mail.choices) && mail.choices.length >= 2);
  assert(concrete.length >= 2, `${roleLabel} should have at least two concrete mails with choices`);
  const [a, b] = concrete;
  assert.notStrictEqual(signature(a), signature(b), `${roleLabel} concrete mail choices should stay distinct`);
  assert(!a.choices.some((choice) => choice.__civi_fallback_choice), `${roleLabel} concrete mail ${a.id} should not be fallback-marked`);
  assert(!b.choices.some((choice) => choice.__civi_fallback_choice), `${roleLabel} concrete mail ${b.id} should not be fallback-marked`);
}

const arealWg = readJson('data/Civication/workGrammars/by/by_radgiver_plan.json');
const renholderWg = readJson('data/Civication/workGrammars/naeringsliv/renholder.json');
const arealPlan = readJson('data/Civication/mailPlans/by/by_radgiver_plan_plan.json');
const renholderPlan = readJson('data/Civication/mailPlans/naeringsliv/renholder_plan.json');
const arealMails = collectRoleMails('by', 'by_radgiver_plan');
const renholderMails = collectRoleMails('naeringsliv', 'renholder');

assert(arealMails.length > 0, 'Arealplanlegger should load mailFamilies');
assert(renholderMails.length > 0, 'Renholder should load mailFamilies');
assertDistinctConcreteChoices('Arealplanlegger', arealMails);
assertDistinctConcreteChoices('Renholder', renholderMails);

const arealText = JSON.stringify({ arealWg, arealPlan, sample: arealMails.slice(0, 12) }).toLowerCase();
const renholderText = JSON.stringify({ renholderWg, renholderPlan, sample: renholderMails.slice(0, 12) }).toLowerCase();

['plan', 'utbygg', 'nabo', 'juridisk', 'medvirkning'].forEach((term) => {
  assert(arealText.includes(term), `Arealplanlegger should expose plan-specific term: ${term}`);
});
['renhold', 'hygiene', 'hms', 'smitte', 'rom'].forEach((term) => {
  assert(renholderText.includes(term), `Renholder should expose cleaning/HMS term: ${term}`);
});

assert.notStrictEqual(signature(arealMails.find((mail) => (mail.choices || []).length >= 2)), signature(renholderMails.find((mail) => (mail.choices || []).length >= 2)), 'reference roles should not share the same generic active choices');

console.log(`PASS: reference role choice contract checked (${arealMails.length} Arealplanlegger mails, ${renholderMails.length} Renholder mails).`);
