#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const base = path.resolve(__dirname, '../data/Civication/mailFamilies/naeringsliv');
const files = [
  'job/ekspeditor_job.json',
  'people/ekspeditor_people.json',
  'conflict/ekspeditor_conflict.json',
  'story/ekspeditor_story.json',
  'event/ekspeditor_event.json'
].map(rel => path.join(base, rel));

const mails = [];
for (const file of files) {
  const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const family of catalog.families || []) {
    mails.push(...(family.mails || []));
  }
}

assert(mails.length >= 44, `Need >=44 ekspeditor mails, got ${mails.length}`);

const ids = new Set();
const domains = new Set();
const required = ['task_domain','competency','pressure','choice_axis','consequence_axis','narrative_arc'];
for (const m of mails) {
  assert(!ids.has(m.id), `duplicate ${m.id}`); ids.add(m.id);
  required.forEach((key) => assert(m[key] !== undefined && m[key] !== '', `missing ${key} in ${m.id}`));
  assert(Array.isArray(m.situation) && m.situation.length > 0, `empty situation in ${m.id}`);
  assert(Array.isArray(m.choices) && m.choices.length >= 2, `need 2 choices in ${m.id}`);
  m.choices.forEach(c => {
    assert(Array.isArray(c.tags) && c.tags.length > 0, `tags missing in ${m.id}/${c.id}`);
    assert(c.feedback && String(c.feedback).trim(), `feedback missing in ${m.id}/${c.id}`);
  });
  domains.add(m.task_domain);
}

assert(domains.size >= 5, `need >=5 domains, got ${domains.size}`);
console.log('ekspeditor mail families ok', mails.length);
