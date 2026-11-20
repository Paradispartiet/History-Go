'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');
const data = new Map();
const store = { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)) };
const window = { dispatchEvent() {} };
const context = vm.createContext({ window, localStorage: store, Date, console,
  Event: class { constructor(type) { this.type = type; } } });
for (const file of ['civicationState.js', 'civicationJobs.js']) {
  vm.runInContext(fs.readFileSync('js/Civication/core/' + file, 'utf8'), context);
}
// Real offer acceptance with explicit eligibility-boundary fixtures; no quiz earning claimed.
window.CivicationState.updateWallet({ balance: 123, nok_v1: { active: true, version: 1, config } });
const jobs = window.CivicationJobs;
assert.equal(jobs.pushOffer({ career_id: config.job.careerId, career_name: 'Næringsliv',
  title: config.job.roleTitle, threshold: 1, points_at_offer: 1, nok_employment_percent: 50 }).ok, true);
assert.equal(jobs.acceptOffer('naeringsliv:1').ok, true);
const active = window.CivicationState.getActivePosition();
assert.equal(active.nok_salary_contract.jobId, config.job.id);
assert.equal(active.nok_salary_contract.sourceId, config.job.source);
assert.equal(active.nok_salary_contract.employmentPercent, 50);
assert.equal(active.nok_salary_contract.offerKey, 'naeringsliv:1');
assert.equal(window.CivicationState.getWallet().balance, 123, 'acceptance never pays salary');
assert.equal(jobs.acceptOffer('naeringsliv:1').reason, 'active_job');
window.CivicationState.setActivePosition(null);
window.CivicationState.setState({ career: { activeJob: null } });
assert.equal(jobs.pushOffer({ career_id: config.job.careerId, career_name: 'Næringsliv',
  title: 'Annen jobb', threshold: 2, points_at_offer: 2, nok_employment_percent: 100 }).ok, true);
const before = JSON.stringify([...data]);
assert.equal(jobs.acceptOffer('naeringsliv:2').reason, 'NOK_SALARY_NOT_MAPPED');
assert.equal(JSON.stringify([...data]), before, 'unmapped offers change neither job nor offer status');
assert.equal(window.CivicationState.getActivePosition(), null);
assert.equal(jobs.getOffers().find(o => o.offer_key === 'naeringsliv:2').status, 'pending');
for (const [index, percent] of [undefined, 0, 101, '50'].entries()) {
  const threshold = index + 3;
  jobs.pushOffer({ career_id: config.job.careerId, career_name: 'Næringsliv', title: config.job.roleTitle,
    threshold, points_at_offer: threshold, nok_employment_percent: percent });
  assert.equal(jobs.acceptOffer('naeringsliv:' + threshold).reason, 'NOK_SALARY_NOT_MAPPED',
    'missing, zero, excessive or textual employment fractions cannot become salary');
}
console.log('PASS: canonical offer acceptance creates sourced part-time contract, never pay or an unmapped job');
