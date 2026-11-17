'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const config = read('data/Civication/economy/nok-budget-prototype-2026.json');
const profiles = [config.job, ...config.jobs];
const grossReferences = { retail_assistant_tariff_1: [31694, 15847],
  cleaner_day_virke_2026: [40184.63, 20092.32], warehouse_virke_2026: [45617, 22808.5] };
async function boot(points = 10, visited = true) {
  const dom = new JSDOM('<body><div id="activeJobCard"></div><div id="civiSalaryLine"></div></body>',
    { url: 'https://example.test', runScripts: 'outside-only' });
  const w = dom.window;
  await new Promise(resolve => setTimeout(resolve, 0));
  w.fetch = async path => ({ ok: true, json: async () => read(path) });
  for (const path of ['core/civicationState.js', 'core/civicationCalendar.js', 'core/civicationNokBudget.js',
    'core/civicationJobs.js', 'systems/civicationJobEligibilityRuntime.js', 'merits-and-jobs.js'])
    w.eval(fs.readFileSync('js/Civication/' + path, 'utf8'));
  w.BADGES = [read('data/badges/naeringsliv.json')];
  w.applyBadgeCareerContractOverlay(w.BADGES, read('data/Civication/badgeCareerContracts/naeringsliv.json'));
  w.CivicationJobEligibilityRuntime.registerKnowledgeRequirements(read('data/Civication/jobKnowledgeRequirements.json'));
  w.HGBrands = { all: read('data/brands/brands_master.json') };
  w.BRANDS_BY_PLACE = read('data/brands/brands_by_place.json');
  for (const path of ['systems/civicationCareerRealityGuard.js', 'systems/civicationBrandAccess.js',
    'systems/civicationBrandEmployerBridge.js', 'core/civicationEconomyEngine.js', 'ui/CivicationUI.js'])
    w.eval(fs.readFileSync('js/Civication/' + path, 'utf8'));
  w.localStorage.setItem('merits_by_category', JSON.stringify({ naeringsliv: { points } }));
  w.localStorage.setItem('quiz_progress', '{"naeringsliv":{"completed":["explicit-knowledge-boundary"]}}');
  if (visited) w.localStorage.setItem('visited_places', '{"tronsmo_bokhandel":true}');
  w.CivicationState.updateWallet({ balance: 125.25, old: { preserved: true }, nok_v1: {
    active: true, version: 1, config, startedDayIndex: 1, lastRecordedDayIndex: 0,
    earnedDays: [], payrollLedger: [], recurringBills: [], invoices: [] } });
  return { dom, w };
}
(async () => {
  let app = await boot(5, false);
  assert.equal(app.w.CivicationJobs.getOffers().length, 0, 'no invented retail employer or unearned higher job');
  app.dom.window.close();
  app = await boot(8, false);
  assert.equal(app.w.CivicationJobs.getOffers().length, 2, 'only the two earned cleaner offers; existing retail employer gate stays closed');
  assert.ok(app.w.CivicationJobs.getOffers().every(o => o.title === 'Renholder' && !o.brand_id));
  const cleaner = app.w.CivicationJobs.getOffers()[0];
  app.w.localStorage.setItem('merits_by_category', '{"naeringsliv":{"points":7}}');
  assert.equal(app.w.CivicationJobs.acceptOffer(cleaner.offer_key).reason, 'NOK_MERITS_REQUIRED');
  app.w.localStorage.setItem('merits_by_category', '{"naeringsliv":{"points":8}}');
  app.w.CivicationState.setState({ career_reentry_locks: { naeringsliv: { status: 'locked' } } });
  assert.equal(app.w.CivicationJobs.acceptOffer(cleaner.offer_key).reason, 'JOB_GATE_BLOCKED');
  app.dom.window.close();
  for (const profile of profiles) for (const percent of [100, 50]) {
    const { dom, w } = await boot();
    const state = w.CivicationState;
    const jobs = w.CivicationJobs;
    assert.equal(jobs.getOffers().length, 6);
    assert.equal(new Set(jobs.getOffers().map(o => o.offer_key)).size, 6);
    assert.equal(jobs.getLatestPendingOffer().nok_employment_percent, 100, 'default full-time offer remains stable');
    jobs.ensureNokStarterOffer(); jobs.ensureNokStarterOffer();
    assert.equal(jobs.getOffers().length, 6, 'profile updates never duplicate variants');
    const target = jobs.getOffers().find(o => o.nok_job_id === profile.id && o.nok_employment_percent === percent);
    assert.equal(target.title, profile.roleTitle, 'actual canonical materializer keeps the salary identity');
    await w.CivicationUI.render();
    const select = w.document.getElementById('civiNokOfferSelect');
    assert.equal(select.options.length, 6);
    select.value = target.offer_key;
    select.dispatchEvent(new w.Event('change'));
    await new Promise(resolve => setTimeout(resolve, 0));
    const terms = w.document.querySelector('[data-civi-nok-offer-terms]');
    assert.ok(terms.textContent.includes(percent + ' % stilling'));
    assert.equal(terms.querySelector('a').href, profile.source);
    if (profile !== config.job) assert.ok(terms.textContent.includes('fiktiv'));
    assert.equal(w.document.activeElement.id, 'civiNokOfferSelect', 'choice keeps keyboard focus');
    const expected = w.CivicationNokBudget.preview(config, { employed: true, employmentPercent: percent, jobId: profile.id });
    assert.equal(expected.monthlyGross, grossReferences[profile.id][percent === 100 ? 0 : 1], 'source reference and half-cent rounding');
    assert.equal(Math.round((expected.monthlyGross - expected.monthlyTax) * 100), Math.round(expected.monthlyNet * 100), 'displayed cents reconcile');
    w.document.getElementById('civiOfferAccept').click();
    const contract = state.getActivePosition().nok_salary_contract;
    assert.equal(contract.jobId, profile.id);
    assert.equal(contract.employmentPercent, percent);
    assert.equal(contract.sourceId, profile.source);
    assert.equal(state.getWallet().balance, 125.25);
    w.CivicationUI.renderCivicationSummary();
    assert.ok(w.document.getElementById('civiSalaryLine').textContent.includes(percent + ' % stilling'));
    for (let day = 1; day <= 31; day++) {
      w.CivicationCalendar.setClock({ dayIndex: day + 1 });
      w.CivicationEconomyEngine.recordCompletedDay(day);
      const saved = JSON.stringify(state.getWallet());
      w.CivicationEconomyEngine.recordCompletedDay(day);
      assert.equal(JSON.stringify(state.getWallet()), saved);
      w.CivicationEconomyEngine.tickWeekly();
    }
    const wallet = state.getWallet();
    assert.equal(wallet.nok_v1.payrollLedger[0].grossCents, Math.round(expected.monthlyGross * 100));
    assert.equal(wallet.nok_v1.payrollLedger[0].taxCents, Math.round(expected.monthlyTax * 100));
    assert.equal(Math.round(wallet.balance * 100), 12525 + Math.round(expected.monthlyNet * 100));
    const settled = JSON.stringify(wallet);
    w.CivicationEconomyEngine.tickWeekly(); await w.CivicationUI.render();
    assert.equal(JSON.stringify(state.getWallet()), settled, 'repeat tick/render never pays again');
    const bad = JSON.parse(JSON.stringify(config)); bad.jobs.push({ ...bad.jobs[0] });
    assert.equal(w.CivicationNokBudget.resolveSalaryJob(bad, { jobId: profile.id }), null, 'duplicate catalog IDs fail closed');
    assert.throws(() => w.CivicationNokBudget.preview(config, { employed: true, jobId: 'unmapped' }));
    assert.equal(state.getWallet().old.preserved, true);
    dom.window.close();
  }
  console.log('PASS: all 3 sourced jobs × 2 fractions through canonical gates, real selector/acceptance, 31-day pay, exact cents and no duplicate money');
})().catch(error => { console.error(error); process.exitCode = 1; });
