'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const config = JSON.parse(JSON.stringify(
  require('../data/Civication/economy/nok-budget-prototype-2026.json')));

// This scenario validates the player's explicit home size choice. The model
// stays inactive in real saves: only the test fixture uses a NOK wallet.
const dom = new JSDOM('<!doctype html><body><div id="homeStatusContent"></div><div id="districtList"></div></body>', {
  url:'https://example.test', runScripts:'outside-only'
});
const w=dom.window;
for(const file of ['core/civicationState.js','core/civicationCalendar.js',
  'core/civicationNokBudget.js','core/civicationEconomyEngine.js',
  'ui/CivicationHome.js'])
  w.eval(fs.readFileSync('js/Civication/'+file,'utf8'));
w.CivicationState.updateWallet({balance:50000,nok_v1:{
  active:true,version:1,config,startedDayIndex:1,lastRecordedDayIndex:0,
  activatedDateISO:'2026-01-01',earnedDays:[],payrollLedger:[],
  recurringBills:[],invoices:[]
}});
w.localStorage.setItem('hg_capital_v1','{"economic":50}');
w.CivicationHome.boot();
const sageneSelect=()=>w.document.querySelector(
  '#homeStatusContent select[data-civi-housing-offer="sagene"]');
assert.ok(sageneSelect(),'start housing card must allow choosing room size');
assert.equal(sageneSelect().options.length,4);
assert.match(sageneSelect().closest('.civi-district-card').textContent,/617 kr per hel måned/);
const before=JSON.stringify(w.CivicationState.getWallet());
const fourRoom=config.housingOffers.find(o=>o.districtId==='sagene' && o.roomCount===4);
sageneSelect().value=fourRoom.id;
sageneSelect().dispatchEvent(new w.Event('change',{bubbles:true}));
assert.equal(JSON.stringify(w.CivicationState.getWallet()),before,
  'selecting and previewing a size cannot write wallet or a lease');
assert.equal(sageneSelect().value,fourRoom.id);
const card=sageneSelect().closest('.civi-district-card');
assert.match(card.textContent,/23\\s?200 kr\\/mnd/);
assert.match(card.textContent,/1234 kr per hel måned/);
assert.match(card.textContent,/1000 kWh antatt forbruk/);
card.querySelector('[data-civi-district-select="sagene"]').click();
let wallet=w.CivicationState.getWallet();
assert.equal(wallet.nok_v1.housing.offerId,fourRoom.id);
assert.equal(wallet.nok_v1.housing.roomCount,4);
assert.equal(wallet.nok_v1.recurringBills.length,1);
assert.equal(wallet.nok_v1.recurringBills[0].amountNok,23200);
assert.equal(wallet.balance,50000,'contract signing does not automatically pay the rent');
assert.match(w.document.querySelector('#homeStatusContent').textContent,
  /23\\s?200 kr \\/ måned/);
const saved=JSON.stringify(wallet);
w.CivicationHome.selectDistrict('sagene',fourRoom.id);
assert.equal(JSON.stringify(w.CivicationState.getWallet()),saved,
  'reconfirming the same room does not create a new contract');

w.CivicationCalendar.setClock({dayIndex:2});
w.CivicationEconomyEngine.recordCompletedDay(1);
wallet=w.CivicationState.getWallet();
assert.equal(wallet.nok_v1.earnedDays.length,1);
assert.equal(wallet.nok_v1.earnedDays[0].electricitySourceId,config.budget.electricity.source);
assert.equal(wallet.nok_v1.earnedDays[0].electricityCents,3980,
  'one played day accrues only its proportional 1000 kWh monthly cost');
assert.equal(wallet.balance,50000,'consumption accrual is not an immediate debit');
dom.window.close();
console.log('PASS: 1-4 room UI preview is read-only; explicit 4-room lease, idempotency, and sized electricity accrual');
