'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');
const rent = config.housingOffers[0];
assert.equal(rent.monthlyRentNok, 10090);
assert.equal(rent.sourceYear, 2025);
assert.equal(rent.priceKind, 'statistical_reference_not_listing');
assert.equal(rent.placementKind, 'fictional_game_location');
assert.equal(config.budget.transport.priceNok, 655);
assert.equal(config.budget.transport.periodDays, 30);
assert.ok(Math.abs(config.budget.transport.monthlyNok - 655 * 365 / 30 / 12) < .005);
assert.notEqual(config.budget.transport.monthlyNok, config.budget.transport.priceNok,
  '30-day ticket price must not be silently treated as a calendar-month bill');
assert.equal(config.migration.activated, false);
const dom = new JSDOM('<body><div id="homeStatusContent"></div><div id="districtList"></div></body>',
  { url: 'https://example.test', runScripts: 'outside-only' });
const w = dom.window;
w.CivicationState = { getWallet: () => ({ balance: 20000,
  nok_v1: { active: true, version: 1, config } }) }; // Explicit display fixture.
w.localStorage.setItem('hg_capital_v1', '{"economic":50}');
w.eval(fs.readFileSync('js/Civication/ui/CivicationHome.js', 'utf8'));
w.CivicationHome.render();
const host = w.document.getElementById('homeStatusContent');
assert.ok(host.textContent.includes('Statistisk startprofil'));
assert.ok(host.textContent.includes('Ikke en boligannonse'));
assert.ok(host.textContent.includes('Depositum er ikke modellert'));
assert.equal(host.querySelector('[data-civi-district-select="sagene"]').disabled, false);
assert.equal(host.querySelector('[data-civi-district-select="grunerlokka"]').disabled, false, 'Grünerløkka now has a sourced rental offer');
assert.equal(w.CivicationHome.getDistrictViewModels().find(d => d.id === 'grunerlokka').canSelect, true);
console.log('PASS: sourced start rents, 30-day transport conversion, disclosed lease terms and newly mapped districts enabled');
dom.window.close();
