#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const modelPath = path.resolve(__dirname, '../data/Civication/workModels/naeringsliv_work_model.json');
const data = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
const required = ['id','mail_type','mail_family','role_scope','subject','summary','situation','task_domain','competency','pressure','choice_axis','consequence_axis','narrative_arc','choices'];
const ids = new Set();
let domains = new Set();
for (const mail of data.mails) {
  for (const key of required) assert(mail[key] !== undefined && mail[key] !== '', `Missing ${key} in ${mail.id}`);
  assert(!ids.has(mail.id), `Duplicate id ${mail.id}`); ids.add(mail.id);
  assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `Need >=2 choices in ${mail.id}`);
  assert(String(mail.situation).trim().length > 0, `Empty situation in ${mail.id}`);
  domains.add(mail.task_domain);
  for (const c of mail.choices) {
    assert(Array.isArray(c.tags) && c.tags.length > 0, `Missing tags in ${mail.id}/${c.id}`);
    assert(String(c.feedback||'').trim(), `Missing feedback in ${mail.id}/${c.id}`);
  }
}
assert(data.mails.filter(m=>m.role_scope==='ekspeditor').length>=40,'Need >=40 ekspeditor mails');
assert(domains.size>=5, 'Need >=5 task domains');
console.log(`Validation OK: ${data.mails.length} mails, ${domains.size} task domains.`);
