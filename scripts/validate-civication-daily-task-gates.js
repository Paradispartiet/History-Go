#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');

function readFile(rel) {
  const full = path.join(root, rel);
  assert(fs.existsSync(full), `Missing file: ${rel}`);
  return fs.readFileSync(full, 'utf8');
}

const dailyBuilderPath = 'js/Civication/systems/civicationDailyMailBuilder.js';
const taskGatesPath = 'js/Civication/systems/civicationDailyTaskGates.js';
const htmlPath = 'Civication.html';

const dailyBuilder = readFile(dailyBuilderPath);
const taskGates = readFile(taskGatesPath);
const html = readFile(htmlPath);

const idxBuilder = html.indexOf('js/Civication/systems/civicationDailyMailBuilder.js');
const idxTaskGates = html.indexOf('js/Civication/systems/civicationDailyTaskGates.js');

assert(idxBuilder >= 0, 'Civication.html must load civicationDailyMailBuilder.js');
assert(idxTaskGates >= 0, 'Civication.html must load civicationDailyTaskGates.js');
assert(idxTaskGates > idxBuilder, 'civicationDailyTaskGates.js must be loaded after civicationDailyMailBuilder.js');

assert(dailyBuilder.includes('blocked_by_open_task'), 'DailyMailBuilder must expose/use reason: blocked_by_open_task');
assert(
  dailyBuilder.includes('CivicationTaskEngine?.getTaskByMailId?.') || dailyBuilder.includes('CivicationTaskEngine?.listOpenTasks?.'),
  'DailyMailBuilder must use CivicationTaskEngine.getTaskByMailId() or listOpenTasks()'
);

assert(
  taskGates.includes('blocked_by_open_task') || dailyBuilder.includes('blocked_by_open_task'),
  'Task gates / builder must expose blocked status in inspect()'
);

assert(
  taskGates.includes('open_tasks_count') || dailyBuilder.includes('open_tasks_count'),
  'Inspect should expose open_tasks_count'
);

console.log('Civication daily task gate validation OK: script load order and blocking runtime signals are present.');
