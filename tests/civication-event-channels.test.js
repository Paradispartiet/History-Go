#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

global.window = global;
const file = path.join(__dirname, '..', 'js/Civication/systems/civicationEventChannels.js');
vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });

const ch = global.CivicationEventChannels;

assert.strictEqual(ch.classifyEvent({ source_type: 'blocked_job', mail_class: 'opportunity_blocked' }), 'message');
assert.strictEqual(ch.classifyEvent({ source_type: 'life' }), 'message');
assert.strictEqual(ch.classifyEvent({ source_type: 'brand_progression', mail_class: 'job_milestone' }), 'milestone');
assert.strictEqual(
  ch.classifyEvent({ source_type: 'planned', mail_family: 'kasse_og_pris', task_domain: 'cash_desk', pressure: 'hoy_ko' }),
  'workday'
);
assert.strictEqual(ch.classifyEvent({ source_type: 'planned', mail_type: 'people' }), 'message');

const mixed = [
  { id: 'a', source_type: 'life' },
  { id: 'b', source_type: 'planned', task_domain: 'cash_desk' },
  { id: 'c', source_type: 'brand_progression', mail_class: 'job_milestone' },
  { id: 'd', source_type: 'planned', mail_type: 'story' },
  { id: 'e', source_type: 'other' }
];
const originalRefs = mixed.slice();
const split = ch.splitInbox(mixed);
const total = split.messages.length + split.workday.length + split.milestones.length + split.system.length + split.unknown.length;
assert.strictEqual(total, mixed.length);
assert.deepStrictEqual(mixed, originalRefs);
assert.strictEqual(mixed[0], originalRefs[0]);

console.log('civication-event-channels.test.js passed');
