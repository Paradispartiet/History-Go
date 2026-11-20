'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const prototype = require('../data/Civication/economy/nok-budget-prototype-2026.json');
async function create(config, wallet) {
  const dom = new JSDOM('<body><div id="civiEconomyPanel"></div></body>',
    { url: 'https://example.test/Civication.html', runScripts: 'outside-only' });
  const w = dom.window;
  let fetches = 0;
  w.fetch = async path => { assert.equal(path, 'data/Civication/economy/nok-budget-prototype-2026.json');
    fetches++; return { ok: true, json: async () => config }; };
  for (const path of ['core/civicationState.js', 'core/civicationCalendar.js', 'core/civicationNokBudget.js',
    'core/civicationEconomyEngine.js']) w.eval(fs.readFileSync('js/Civication/' + path, 'utf8'));
  w.CivicationState.updateWallet(wallet);
  w.localStorage.setItem('civi_purchases_v1', '[{"id":"old-purchase"}]');
  const before = JSON.stringify(w.CivicationState.getWallet());
  w.eval(fs.readFileSync('js/Civication/ui/CivicationEconomyUI.js', 'utf8'));
  await w.CivicationEconomyUI.loadActivationConfig();
  assert.equal(JSON.stringify(w.CivicationState.getWallet()), before, 'loading never activates or writes');
  assert.equal(fetches, 1, 'one config request, including DOMContentLoaded');
  return dom;
}
(async () => {
  const unapproved = JSON.parse(JSON.stringify(prototype));
  unapproved.status = 'prototype_not_activated';
  unapproved.migration.activated = false;
  const inactive = await create(unapproved, { balance: 123.45 });
  assert.equal(inactive.window.document.querySelector('[data-nok-activate]'), null, 'unapproved configuration cannot expose activation');
  inactive.window.close();
  const approved = JSON.parse(JSON.stringify(prototype));
  assert.equal(approved.status, 'active');
  assert.equal(approved.migration.activated, true);
  assert.equal(approved.migration.releaseMode, 'explicit_player_opt_in_only');
  const dom = await create(approved, { balance: 123.45, last_tick_day_index: 8,
    completed_game_days_v1: [{ dayIndex: 8, weeklyNet: 2 }], history: [{ id: 'kept' }] });
  const w = dom.window;
  const host = w.document.getElementById('civiEconomyPanel');
  const state = w.CivicationState;
  const blocked = JSON.stringify(state.getWallet());
  host.querySelector('[data-nok-activate]').click();
  assert.equal(JSON.stringify(state.getWallet()), blocked);
  assert.ok(host.textContent.includes('Tidligere opptjent lønn må gjøres opp'));
  state.updateWallet({ ...state.getWallet(), completed_game_days_v1: [] });
  state.setActivePosition({ career_id: 'unmapped', title: 'Old role' });
  host.querySelector('[data-nok-activate]').click();
  assert.ok(host.textContent.includes('aktive jobben mangler lønnsvilkår'));
  assert.equal(state.getWallet().nok_v1, undefined);
  state.setActivePosition(null);
  const button = host.querySelector('[data-nok-activate]');
  button.focus(); button.click();
  assert.equal(state.getWallet().nok_v1.active, true);
  assert.equal(state.getWallet().balance, 123.45);
  assert.equal(state.getWallet().history[0].id, 'kept');
  assert.equal(w.localStorage.getItem('civi_purchases_v1'), '[{"id":"old-purchase"}]');
  assert.equal(host.querySelector('[data-nok-activate]'), null);
  assert.equal(w.document.activeElement.tagName, 'H3');
  assert.ok(host.textContent.includes('Kroneøkonomien er aktiv'));
  const after = JSON.stringify(state.getWallet());
  button.click();
  assert.equal(JSON.stringify(state.getWallet()), after, 'double click cannot reinitialize account');
  console.log('PASS: reviewed config required, activation is explicit, old wages/jobs block, balance/history/purchases survive and focus remains');
  dom.window.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
