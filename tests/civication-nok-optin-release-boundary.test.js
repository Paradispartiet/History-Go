'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('jsdom');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');
(async () => {
  assert.equal(config.status,'active');
  assert.equal(config.migration.activated,true);
  assert.equal(config.migration.releaseMode,'explicit_player_opt_in_only');
  const dom=new JSDOM('<div id="civiEconomyPanel"></div>', {url:'https://example.test/Civication.html',runScripts:'outside-only'});
  const w=dom.window;
  w.fetch=async url=>({ok:true,json:async()=>JSON.parse(JSON.stringify(config))});
  for(const name of ['core/civicationState.js','core/civicationCalendar.js','core/civicationNokBudget.js','core/civicationEconomyEngine.js','ui/CivicationEconomyUI.js']) {
    w.eval(fs.readFileSync('js/Civication/'+name,'utf8'));
  }
  const original={balance:246.35,history:[{id:'prior-purchase'}],completed_game_days_v1:[],old_preferences:{theme:'light'}};
  w.CivicationState.updateWallet(original);
  w.CivicationCalendar.setClock({startDateISO:'2026-01-01',dayIndex:8});
  const before=JSON.stringify(w.CivicationState.getWallet());
  await w.CivicationEconomyUI.loadActivationConfig();
  assert.equal(JSON.stringify(w.CivicationState.getWallet()),before,'config load must never migrate wallet');
  const button=w.document.querySelector('[data-nok-activate]');
  assert.ok(button,'approved candidate must provide opt-in control');
  assert.equal(w.CivicationState.getWallet().nok_v1,undefined);
  button.click();
  const next=w.CivicationState.getWallet();
  assert.equal(next.balance,246.35,'no balance multiplier');
  assert.equal(next.history[0].id,'prior-purchase');
  assert.equal(next.old_preferences.theme,'light');
  assert.equal(next.nok_v1.active,true);
  assert.equal(next.nok_v1.openingBalanceNok,246.35);
  assert.match(w.document.querySelector('#civiEconomyPanel').textContent,/Saldo: 246,35 kr/,
    'active NOK account uses kroner rather than the legacy PC label');
  assert.equal(next.nok_v1.recurringBills.length,0,'no automatic rent contract');
  assert.equal(next.nok_v1.invoices.length,0,'no automatic bills');
  assert.equal(next.nok_v1.payrollLedger.length,0,'no retroactive wages');
  const snapshot=JSON.stringify(next);
  button.click();
  assert.equal(JSON.stringify(w.CivicationState.getWallet()),snapshot,'opt-in only once');
  assert.equal(w.document.querySelector('[data-nok-activate]'),null);
  dom.window.close();
  console.log('PASS: approved release profile is opt-in only; balance, history and invoices preserved');
})().catch(e=>{console.error(e);process.exitCode=1;});
