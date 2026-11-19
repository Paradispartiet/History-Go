'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
async function run() {
  const dom = new JSDOM('<div id="civiStorePanel"></div>', { runScripts: 'outside-only' });
  const w = dom.window;
  w.HG_CiviShop = { getVisibleStores: async () => [],
    getVisiblePacks: async () => [{ id: 'fixture', price_pc: 1 }], getInv: () => ({ packs: {} }) };
  w.CivicationState = { getWallet: () => ({ balance: 2410.25 }) };
  w.getPCWallet = () => 99;
  w.eval(fs.readFileSync('js/Civication/ui/CivicationStoreUI.js', 'utf8'));
  await w.CivicationStoreUI.render();
  const host = w.document.getElementById('civiStorePanel');
  assert.ok(host.textContent.includes((2410.25).toLocaleString('no-NO')), 'canonical wallet wins over compatibility balance');
  w.CivicationState = null;
  await w.CivicationStoreUI.render();
  assert.ok(host.textContent.includes('99'), 'numeric compatibility wallet is displayed as an amount');
  dom.window.close();
  console.log('PASS: shop displays canonical and numeric compatibility balances');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
