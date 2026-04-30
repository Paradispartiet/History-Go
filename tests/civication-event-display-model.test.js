#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

global.window = global;
global.window.addEventListener = () => {};
global.window.dispatchEvent = () => {};
global.window.setTimeout = (fn) => { if (typeof fn === 'function') fn(); };
global.document = { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} };

const channelsFile = path.join(__dirname, '..', 'js/Civication/systems/civicationEventChannels.js');
vm.runInThisContext(fs.readFileSync(channelsFile, 'utf8'), { filename: channelsFile });
const uiFile = path.join(__dirname, '..', 'js/Civication/ui/CivicationUI.js');
vm.runInThisContext(fs.readFileSync(uiFile, 'utf8'), { filename: uiFile });

const fn = global.CivicationUI.buildCiviEventViewModel;

const workday = fn({ source_type: 'planned', task_domain: 'cash_desk', subject: 'Kø ved kassen', situation: ['Køen bygger seg opp.'] }, { activePosition: { title: 'Ekspeditør', brand_name: 'Norli' } });
assert.strictEqual(workday.kind, 'workday');
assert.strictEqual(workday.kicker, 'Dagens situasjon');

const milestone = fn({ source_type: 'brand_progression', subject: 'Kunder spør etter deg' });
assert.strictEqual(milestone.kind, 'milestone');
assert.strictEqual(milestone.kicker, 'Ny milepæl');

const fallback = fn({ source_type: 'other_unknown_type', title: 'Oppdatering' });
assert.strictEqual(fallback.kind, 'fallback');
assert.ok(!String(fallback.kicker).toLowerCase().includes('unknown'));

console.log('civication-event-display-model.test.js passed');
