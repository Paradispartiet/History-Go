#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');

function read(rel) {
  const full = path.join(root, rel);
  assert(fs.existsSync(full), `Missing file: ${rel}`);
  return fs.readFileSync(full, 'utf8');
}

const gatesRel = 'js/Civication/systems/civicationDailyTaskGates.js';
const builderRel = 'js/Civication/systems/civicationDailyMailBuilder.js';
const htmlRel = 'Civication.html';

const gates = read(gatesRel);
const builder = read(builderRel);
const html = read(htmlRel);

assert(builder.includes('blocked_by_open_task'), 'DailyMailBuilder must include blocked_by_open_task reason/state.');
assert(
  builder.includes('CivicationTaskEngine?.getTaskByMailId') || builder.includes('CivicationTaskEngine?.listOpenTasks'),
  'DailyMailBuilder must check task state via CivicationTaskEngine getTaskByMailId/listOpenTasks.'
);
assert(builder.includes('open_tasks_count'), 'DailyMailBuilder.inspect must expose open_tasks_count.');
assert(builder.includes('blocked_task_id') && builder.includes('blocked_mail_id'), 'DailyMailBuilder must expose blocked task/mail ids.');

assert(gates.includes('task_gate_count'), 'CivicationDailyTaskGates.inspect must expose task_gate_count.');
assert(gates.includes('blocked_by_open_task'), 'CivicationDailyTaskGates.inspect must expose blocked_by_open_task.');

const idxBuilder = html.indexOf('js/Civication/systems/civicationDailyMailBuilder.js');
const idxGates = html.indexOf('js/Civication/systems/civicationDailyTaskGates.js');
assert(idxBuilder >= 0, 'Civication.html must load civicationDailyMailBuilder.js.');
assert(idxGates >= 0, 'Civication.html must load civicationDailyTaskGates.js.');
assert(idxGates > idxBuilder, 'Civication.html must load civicationDailyTaskGates.js after civicationDailyMailBuilder.js.');

console.log('Civication daily task-gates validation OK.');
