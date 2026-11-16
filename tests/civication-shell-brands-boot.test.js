'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
async function check(unavailable) {
  const order = [];
  const window = { CIVI_CAREER_RULES: [],
    HGBrands: { ready: false, async init() { order.push('brands'); if (unavailable) throw Error('offline fixture'); this.ready = true; } },
    CivicationCareerRoleResolver: { resolveCareerRoleScope() {} },
    CivicationLifePositions: { getLifeContext() {}, installEconomyStatusGuard() {} },
    CivicationCareerRealityGuard: { install() {} },
    CivicationLivelihoods: { getSnapshot() {}, attachEconomyBridge() {} },
    CivicationLifePositionUI: { init() {} }, CivicationLivelihoodUI: { init() {} },
    CivicationEconomyEngine: { tickWeekly() { order.push('economy'); } },
    CivicationUI: { init() { order.push('ui'); assert.equal(window.HGBrands.ready, !unavailable); } },
    dispatchEvent(event) { order.push(event.type); }
  };
  const context = vm.createContext({ window, document: {}, Event: class { constructor(type) { this.type = type; } },
    console: { log() {}, warn() {}, error() {} }, fetch: async () => ({ ok: true, text: async () => '{"files":[],"careers":[]}' }) });
  vm.runInContext(fs.readFileSync('js/Civication/CivicationShellBoot.js', 'utf8'), context);
  await window.CivicationShellBoot.start();
  assert.deepEqual(order, ['brands', 'economy', 'ui', 'civi:dataReady', 'civi:booted']);
  assert.equal(window.__CIVI_BOOT_ERROR__, undefined, 'unavailable optional registry does not destroy the shell');
}
(async () => { await check(false); await check(true);
  console.log('PASS: standalone employer catalog initializes before job/UI boot; optional source failure preserves the shell');
})().catch(error => { console.error(error); process.exitCode = 1; });
