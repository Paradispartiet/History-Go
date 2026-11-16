'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');
const data = new Map();
const events = new Map();
const window = { dispatchEvent(e) { for (const fn of events.get(e.type) || []) fn(); },
  addEventListener(name, fn) { events.set(name, [...(events.get(name) || []), fn]); } };
const context = vm.createContext({ window, localStorage: { getItem: k => data.get(k) ?? null,
  setItem: (k, v) => data.set(k, String(v)) }, Date, console,
  document: { readyState: 'loading', addEventListener() {} },
  Event: class { constructor(type) { this.type = type; } } });
for (const file of ['civicationState.js', 'civicationNokBudget.js', 'civicationJobs.js'])
  vm.runInContext(fs.readFileSync('js/Civication/core/' + file, 'utf8'), context);
const state = window.CivicationState;
const jobs = window.CivicationJobs;
state.updateWallet({ balance: 123, nok_v1: { active: true, version: 1, config } });
assert.equal(jobs.ensureNokStarterOffer().reason, 'NOK_MERITS_REQUIRED');
data.set('merits_by_category', JSON.stringify({ naeringsliv: { points: 5 } }));
assert.equal(jobs.ensureNokStarterOffer().reason, 'JOB_GATE_NOT_READY');
vm.runInContext(fs.readFileSync('js/Civication/systems/civicationJobEligibilityRuntime.js', 'utf8'), context);
window.CivicationJobEligibilityRuntime.patchJobsPushOffer();
state.setState({ career_reentry_locks: { naeringsliv: { status: 'locked' } } });
assert.equal(jobs.ensureNokStarterOffer().reason, 'JOB_GATE_BLOCKED');
state.setState({ career_reentry_locks: { naeringsliv: null } });
assert.equal(jobs.ensureNokStarterOffer().ok, true);
const offer = jobs.getLatestPendingOffer();
assert.equal(offer.title, 'Butikkmedarbeider');
assert.equal(jobs.getOffers().length, 1, 'profile dispatch does not recursively duplicate offers');
assert.equal(state.getActivePosition(), null);
assert.equal(state.getWallet().balance, 123);
const terms = jobs.getNokOfferTerms(offer);
assert.equal(terms.monthlyGross, 31694);
assert.equal(terms.employmentPercent, 100);
assert.ok(terms.monthlyNet > 0 && terms.monthlyNet < terms.monthlyGross);
data.set('merits_by_category', JSON.stringify({ naeringsliv: { points: 4 } }));
assert.equal(jobs.acceptOffer(offer.offer_key).reason, 'NOK_MERITS_REQUIRED');
data.set('merits_by_category', JSON.stringify({ naeringsliv: { points: 5 } }));
state.setState({ career_reentry_locks: { naeringsliv: { status: 'locked' } } });
assert.equal(jobs.acceptOffer(offer.offer_key).reason, 'JOB_GATE_BLOCKED');
assert.equal(jobs.getLatestPendingOffer().status, 'pending');
state.setState({ career_reentry_locks: { naeringsliv: null } });
assert.equal(jobs.acceptOffer(offer.offer_key).ok, true);
assert.equal(state.getActivePosition().nok_salary_contract.jobId, config.job.id);
assert.equal(state.getWallet().balance, 123);
assert.equal(jobs.ensureNokStarterOffer().reason, 'active_job');
console.log('PASS: starter offer requires real stored merits, available open gate, rechecks acceptance, and never pays on acceptance');
