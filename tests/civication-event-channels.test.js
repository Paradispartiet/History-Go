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

assert.strictEqual(
  ch.getMessageChannel({ source_type: 'workday', task_domain: 'cash_desk' }),
  'job',
  'workday-event klassifiseres som jobbkanal'
);
assert.strictEqual(
  ch.getMessageChannel({ source_type: 'life', phase_tag: 'evening' }),
  'private',
  'life/evening klassifiseres som privat kanal'
);

const channelSplit = ch.splitInboxByMessageChannel([
  { id: 'workday-mail', event: { source_type: 'workday', task_id: 'task-1', task_domain: 'cash_desk' } },
  { id: 'private-mail', event: { source_type: 'life', phase_tag: 'evening' } },
  { id: 'system-mail', event: { source_type: 'debug', mail_type: 'status' } }
]);
assert.deepStrictEqual(channelSplit.job.map((item) => item.id), ['workday-mail']);
assert.deepStrictEqual(channelSplit.private.map((item) => item.id), ['private-mail']);
assert.deepStrictEqual(channelSplit.system.map((item) => item.id), ['system-mail']);

console.log('civication-event-channels.test.js passed');
