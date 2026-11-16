'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');
(async () => {
const dom = new JSDOM('<body><div id="activeJobCard"></div><div id="civiSalaryLine"></div><div id="homeStatusContent"></div><div id="districtModal"><div id="districtList"></div></div></body>',
  { url: 'https://example.test', runScripts: 'outside-only' });
const w = dom.window;
for (const path of ['core/civicationState.js', 'core/civicationNokBudget.js', 'core/civicationJobs.js',
  'ui/CivicationHome.js', 'ui/CivicationUI.js'])
  w.eval(fs.readFileSync('js/Civication/' + path, 'utf8'));
const state = w.CivicationState;
state.updateWallet({ balance: 20000, nok_v1: { active: true, version: 1, config } });
w.CivicationEconomyEngine = { getEconomySnapshot: () => ({ weeklySalary: 7, homeRent: 2 }) };
w.CivicationUI.renderCivicationSummary();
assert.ok(w.document.getElementById('civiSalaryLine').textContent.includes('0 kr per måned'));
const offer = w.CivicationJobs.pushOffer({ career_id: config.job.careerId, title: config.job.roleTitle,
  threshold: 5, points_at_offer: 5, nok_employment_percent: 50 }).offer;
await w.CivicationUI.render();
const terms = w.document.querySelector('[data-civi-nok-offer-terms]');
assert.ok(terms.textContent.includes('50 % stilling'));
assert.ok(terms.textContent.includes('Estimert netto'));
const accept = w.document.getElementById('civiOfferAccept');
assert.ok(terms.compareDocumentPosition(accept) & w.Node.DOCUMENT_POSITION_FOLLOWING);
accept.click();
w.CivicationUI.renderCivicationSummary();
const salary = w.document.getElementById('civiSalaryLine').textContent;
assert.ok(salary.includes('brutto per måned'));
assert.ok(salary.includes('50 % stilling'));
assert.ok(!salary.includes('/ uke'), 'legacy snapshot cannot overwrite the monthly contract');
assert.equal(state.getWallet().balance, 20000);
w.renderHomeStatus();
assert.ok(w.document.getElementById('homeStatusContent').textContent.includes('Ikke en boligannonse'));
w.openDistrictSelector();
const list = w.document.getElementById('districtList');
assert.ok(list.textContent.includes('Statistisk startprofil'));
assert.equal(list.querySelector('[data-civi-district-select="grunerlokka"]').disabled, true);
assert.equal(list.querySelector('[data-civi-district-select="sagene"]').disabled, false);
state.updateWallet({ balance: 20000, nok_v1: { active: false } });
w.CivicationUI.renderCivicationSummary();
assert.ok(w.document.getElementById('civiSalaryLine').textContent.includes('7 PC / uke'), 'legacy path preserved');
assert.equal(offer.status, 'pending'); // Original snapshot remains immutable.
console.log('PASS: real Jobs/UI monthly pay and before-accept terms; canonical housing terms survive legacy entry points');
dom.window.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
