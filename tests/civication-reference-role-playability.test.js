#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); }
function labels(mail) { return (mail.choices || []).map((c) => String(c.label || '').trim().toLowerCase()).filter(Boolean); }
function sig(mail) { return labels(mail).join(' | '); }
function collectMails(value, out = []) {
  if (Array.isArray(value)) value.forEach((item) => collectMails(item, out));
  else if (value && typeof value === 'object') {
    if (value.id && Array.isArray(value.choices) && value.role_scope && value.mail_type) out.push(value);
    Object.values(value).forEach((item) => collectMails(item, out));
  }
  return out;
}
function mails(rel) { return collectMails(readJson(rel)); }

const roles = {
  by_radgiver_plan: {
    grammar: readJson('data/Civication/workGrammars/by/by_radgiver_plan.json'),
    job: mails('data/Civication/mailFamilies/by/job/by_radgiver_plan_job.json'),
    people: mails('data/Civication/mailFamilies/by/people/by_radgiver_plan_people.json'),
    expectedWords: ['plan', 'utbygg', 'nabo', 'medvirkning', 'juridisk', 'utvalg']
  },
  renholder: {
    grammar: readJson('data/Civication/workGrammars/naeringsliv/renholder.json'),
    job: mails('data/Civication/mailFamilies/naeringsliv/job/renholder_job.json'),
    people: mails('data/Civication/mailFamilies/naeringsliv/people/renholder_people.json'),
    expectedWords: ['renhold', 'hygiene', 'smittevern', 'hms', 'rom', 'sone']
  }
};

for (const [role, data] of Object.entries(roles)) {
  assert.strictEqual(data.grammar.role_scope, role, `${role} grammar role_scope`);
  assert(data.job.length >= 2, `${role} has multiple job mails`);
  assert(data.people.length >= 1, `${role} has people mails`);
  for (const mail of data.job.slice(0, 2)) {
    assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${role}/${mail.id} has concrete choices`);
    assert(!mail.choices.some((c) => c.__fallback === true || c.fallback === true), `${role}/${mail.id} does not mark concrete choices as fallback`);
  }
  assert.notStrictEqual(sig(data.job[0]), sig(data.job[1]), `${role} first two concrete mails keep distinct choice labels`);
  const haystack = JSON.stringify([data.grammar, ...data.job, ...data.people]).toLowerCase();
  assert(data.expectedWords.some((word) => haystack.includes(word)), `${role} contains role-specific FWG/mail vocabulary`);
}

assert.notStrictEqual(sig(roles.by_radgiver_plan.job[0]), sig(roles.renholder.job[0]), 'Arealplanlegger and Renholder do not share the same generic first-mail choices');
assert(JSON.stringify(roles.by_radgiver_plan.grammar).toLowerCase().includes('politisk') || JSON.stringify(roles.by_radgiver_plan.grammar).toLowerCase().includes('administrativ'), 'Arealplanlegger grammar carries political/administrative framing');
assert(JSON.stringify(roles.renholder.grammar).toLowerCase().includes('hygiene') || JSON.stringify(roles.renholder.grammar).toLowerCase().includes('smittevern'), 'Renholder grammar carries hygiene/smittevern framing');

console.log('PASS: Civication reference roles keep distinct FWG/mail choices and playable role framing.');
