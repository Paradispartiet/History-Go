'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const config = JSON.parse(JSON.stringify(
  require('../data/Civication/economy/nok-budget-prototype-2026.json')
));

(async () => {
  const dom = new JSDOM('<!doctype html><body></body>', {
    runScripts:'outside-only', url:'https://example.test'
  });
  const w = dom.window;
  for (const file of [
    'core/civicationState.js', 'core/civicationCalendar.js',
    'core/civicationNokBudget.js', 'core/civicationEconomyEngine.js',
    'ui/CivicationHome.js'
  ]) w.eval(fs.readFileSync('js/Civication/' + file, 'utf8'));
  const home = w.CivicationHome;
  const engine = w.CivicationEconomyEngine;
  const districtIds = home.getAvailableDistricts().map(x => x.id).sort();
  const mappedIds = config.housingOffers.map(x => x.districtId).sort();
  assert.equal(config.migration.activated, false, 'production currency remains disabled');
  assert.deepEqual(mappedIds, districtIds, 'one sourced game rental offer per existing Civication district');
  assert.equal(new Set(config.housingOffers.map(x => x.id)).size, mappedIds.length);
  for (const offer of config.housingOffers) {
    const refs = config.costOfLiving.rentSources.filter(x => x.id === offer.referenceAreaId);
    assert.equal(refs.length, 1, 'unique SSB zone for ' + offer.districtId);
    const ref = refs[0];
    assert.equal(offer.monthlyRentNok, ref.pricesByRoomsNok[String(offer.roomCount)]);
    assert.equal(offer.referenceYear, ref.year);
    assert.equal(offer.referencePriceKind, ref.priceKind);
    assert.equal(offer.sourceId, ref.source);
    assert.equal(offer.placementKind, 'fictional_game_location');
    assert.ok(offer.roomCount === 1 || offer.roomCount === 2);
  }
  assert.equal(config.housingOffers.find(x => x.districtId === 'sagene').id,
    'oslo-1room-ssb2025-sagene-start', 'preserve existing Sagene offer ID');
  assert.equal(config.housingOffers.find(x => x.districtId === 'sagene').monthlyRentNok,
    10090, 'preserve original starter rent to avoid unreviewed rent change');
  const costs = Object.fromEntries(config.housingOffers.map(x =>
    [x.districtId, x.monthlyRentNok]));
  assert.equal(costs.frogner, 16700);
  assert.equal(costs.ullern, 16700);
  assert.equal(costs.sentrum, 16700);
  assert.equal(costs.majorstuen, 16700);
  assert.equal(costs.sondre_nordstrand, 14500);
  assert.equal(costs.grunerlokka, 15260);
  assert.equal(costs.toyen, 15260);

  const activatedConfig = JSON.parse(JSON.stringify(config));
  activatedConfig.status = 'active';
  activatedConfig.migration.activated = true;
  w.CivicationState.updateWallet({ balance:50000, last_tick_day_index:1 });
  w.localStorage.setItem('hg_capital_v1', '{"economic":50}');
  assert.equal(engine.migrateNokEconomy(activatedConfig).ok, true);
  assert.equal(home.selectDistrict('sondre_nordstrand'), true,
    'mapped eastern starter district can now be rented through existing housing flow');
  let wallet = w.CivicationState.getWallet();
  assert.equal(wallet.nok_v1.housing.districtId, 'sondre_nordstrand');
  assert.equal(wallet.nok_v1.housing.roomCount, 2);
  assert.equal(wallet.nok_v1.housing.referenceAreaId, 'oslo_outer');
  assert.equal(wallet.nok_v1.recurringBills.length, 1);
  assert.equal(wallet.nok_v1.recurringBills[0].amountNok, 14500);
  assert.ok(home.getDistrictViewModels().find(d => d.id === 'sondre_nordstrand').rentLabel.includes('kr / måned'),
    'UI labels show contracted rent as monthly NOK');
  w.document.body.insertAdjacentHTML('beforeend', '<div id="civiEconomyPanel"></div>');
  w.eval(fs.readFileSync('js/Civication/ui/CivicationEconomyUI.js', 'utf8'));
  w.CivicationEconomyUI.render();
  const financePanel = w.document.getElementById('civiEconomyPanel');
  assert.match(financePanel.textContent, /Din spillbolig: Søndre Nordstrand/);
  assert.match(financePanel.textContent, /14.500,00|14\\s?500,00/,
    'actual contract price is visible in finance panel, not merely a comparative rent');
  assert.match(financePanel.textContent, /statistisk spilltilbud/i,
    'fictive rental is never presented as a verified live listing');
  const sameWallet = JSON.stringify(wallet);
  assert.equal(home.selectDistrict('sondre_nordstrand'), true);
  assert.equal(JSON.stringify(w.CivicationState.getWallet()), sameWallet,
    'same offer does not duplicate the recurring lease');
  engine.tickWeekly();
  wallet = w.CivicationState.getWallet();
  assert.equal(wallet.nok_v1.invoices.length, 1);
  assert.equal(wallet.nok_v1.invoices[0].amountNok, 14500);
  const settled = engine.payNokInvoice(wallet.nok_v1.invoices[0].id);
  assert.equal(settled.ok, true);
  assert.equal(w.CivicationState.getWallet().balance, 35500);
  assert.equal(home.selectDistrict('sagene'), true);
  wallet = w.CivicationState.getWallet();
  assert.equal(wallet.nok_v1.recurringBills.length, 2);
  assert.equal(wallet.nok_v1.recurringBills[0].endsOnISO,
    '2026-01-01', 'old lease ends at move, rather than continuing to charge');
  assert.equal(wallet.nok_v1.recurringBills[1].amountNok, 10090);
  assert.equal(wallet.balance, 35500, 'changing housing does not debit wallet');
  assert.equal(wallet.nok_v1.invoices[0].status, 'paid',
    'old invoice remains paid after moving');

  // The source-contract guard rejects an offer that does not match SSB.
  const forged = JSON.parse(JSON.stringify(wallet));
  forged.nok_v1.config.housingOffers = forged.nok_v1.config.housingOffers.map(offer =>
    offer.districtId === 'frogner' ? { ...offer, monthlyRentNok: 5000 } : offer);
  w.CivicationState.updateWallet(forged);
  const before = JSON.stringify(w.CivicationState.getWallet());
  assert.equal(engine.acceptNokHousing('frogner').reason, 'INVALID_HOUSING_REFERENCE');
  assert.equal(JSON.stringify(w.CivicationState.getWallet()), before,
    'mismatched source does not create a lease or a charge');

  dom.window.close();
  console.log('PASS: all game districts have sourced rents; correct size/zone, one contract, payment and no fabricated prices');
})().catch(error => { console.error(error); process.exitCode = 1; });
