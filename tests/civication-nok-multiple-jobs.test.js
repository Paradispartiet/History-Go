'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const config = read('data/Civication/economy/nok-budget-prototype-2026.json');
const profiles = [config.job, ...config.jobs];
const grossReferences = { retail_assistant_tariff_1: [31694, 15847],
  cleaner_day_virke_2026: [40184.63, 20092.32], warehouse_virke_2026: [45617, 22808.5] };
async function boot(points = 10, visited = true, seed = null) {
  const dom = new JSDOM('<body><div id="activeJobCard"></div><div id="civiSalaryLine"></div></body>',
    { url: 'https://example.test', runScripts: 'outside-only' });
  const w = dom.window;
  await new Promise(resolve => setTimeout(resolve, 0));
  if (seed) for (const [key, value] of Object.entries(seed)) w.localStorage.setItem(key, value);
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
  if (!seed) {
  w.localStorage.setItem('merits_by_category', JSON.stringify({ naeringsliv: { points } }));
  w.localStorage.setItem('quiz_progress', '{"naeringsliv":{"completed":["explicit-knowledge-boundary"]}}');
  if (visited) w.localStorage.setItem('visited_places', '{"tronsmo_bokhandel":true}');
  w.CivicationState.updateWallet({ balance: 125.25, old: { preserved: true }, nok_v1: {
    active: true, version: 1, config, startedDayIndex: 1, lastRecordedDayIndex: 0,
    earnedDays: [], payrollLedger: [], recurringBills: [], invoices: [] } });
  }
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
  // Job loss is an explicit state boundary here; reentry/knowledge gates remain real.
  app = await boot();
  let w = app.w;
  const retail = w.CivicationJobs.getOffers().find(o => o.nok_job_id === config.job.id && o.nok_employment_percent === 100);
  assert.equal(w.CivicationJobs.acceptOffer(retail.offer_key).ok, true);
  for (let day = 1; day <= 7; day++) {
    w.CivicationCalendar.setClock({ dayIndex: day + 1 });
    w.CivicationEconomyEngine.recordCompletedDay(day);
  }
  w.CivicationState.setActivePosition(null);
  w.CivicationState.setState({ career: { activeJob: null } });
  for (let day = 8; day <= 14; day++) {
    w.CivicationCalendar.setClock({ dayIndex: day + 1 });
    w.CivicationEconomyEngine.recordCompletedDay(day);
  }
  assert.equal(w.CivicationJobs.getOffers().length, 6, 'no automatic reapplication');
  const historical = JSON.stringify(w.CivicationJobs.getOffers());
  const warehouse = config.jobs.find(j => j.id === 'warehouse_virke_2026');
  w.localStorage.setItem('merits_by_category', '{"naeringsliv":{"points":9}}');
  assert.equal(w.CivicationJobs.applyForNokJob(warehouse.id, 50, 'blocked-merits').reason, 'NOK_MERITS_REQUIRED');
  w.localStorage.setItem('merits_by_category', '{"naeringsliv":{"points":10}}');
  w.CivicationState.setState({ career_reentry_locks: { naeringsliv: { status: 'locked' } } });
  assert.equal(w.CivicationJobs.applyForNokJob(warehouse.id, 50, 'blocked-lock').reason, 'JOB_GATE_BLOCKED');
  w.CivicationState.setState({ career_reentry_locks: { naeringsliv: null } });
  await w.CivicationUI.render();
  async function requestThroughUi(win) {
    const select = win.document.getElementById('civiNokSearch');
    const choice = Array.from(select.options).find(o => o.textContent.includes(warehouse.roleTitle + ' · 50 %'));
    select.value = choice.value;
    win.document.getElementById('civiNokApply').click();
    await new Promise(resolve => setTimeout(resolve, 0));
    return win.CivicationJobs.getOffers()[0];
  }
  const first = await requestThroughUi(w);
  assert.ok(first.nok_application_id);
  assert.equal(w.CivicationJobs.getOffers().length, 7);
  assert.equal(JSON.stringify(w.CivicationJobs.getOffers().slice(1)), historical);
  assert.equal(w.CivicationState.getWallet().balance, 125.25);
  assert.equal(w.CivicationJobs.applyForNokJob(warehouse.id, 50, first.nok_application_id).skipped, true);
  assert.equal(w.CivicationJobs.applyForNokJob(warehouse.id, 100, first.nok_application_id).reason, 'NOK_APPLICATION_CONFLICT');
  assert.equal(w.CivicationJobs.applyForNokJob(warehouse.id, 50, 'another-pending').reason, 'NOK_APPLICATION_PENDING');
  assert.equal(w.CivicationJobs.declineOffer(first.offer_key).ok, true);
  assert.equal(w.CivicationJobs.applyForNokJob(warehouse.id, 50, first.nok_application_id).offer.status, 'declined');
  await w.CivicationUI.render();
  const second = await requestThroughUi(w);
  assert.notEqual(second.nok_application_id, first.nok_application_id);
  const seed = Object.fromEntries(Array.from({ length: w.localStorage.length }, (_, i) => {
    const key = w.localStorage.key(i); return [key, w.localStorage.getItem(key)];
  }));
  app.dom.window.close();
  app = await boot(10, true, seed); w = app.w;
  assert.equal(w.CivicationJobs.applyForNokJob(warehouse.id, 50, second.nok_application_id).skipped, true);
  await w.CivicationUI.render();
  w.document.getElementById('civiOfferAccept').click();
  assert.equal(w.CivicationState.getActivePosition().nok_salary_contract.jobId, warehouse.id);
  assert.equal(w.CivicationState.getWallet().balance, 125.25, 'new acceptance has no signing bonus');
  assert.equal(w.CivicationJobs.getOffers().length, 8);
  assert.equal(w.CivicationJobs.applyForNokJob(warehouse.id, 50, 'while-employed').reason, 'active_job');
  for (let day = 15; day <= 31; day++) {
    w.CivicationCalendar.setClock({ dayIndex: day + 1 });
    w.CivicationEconomyEngine.recordCompletedDay(day);
    w.CivicationEconomyEngine.tickWeekly();
  }
  const mixedGross = Math.floor(3169400 * 7 / 31) + 2280850 - Math.floor(2280850 * 14 / 31);
  const mixedTax = Math.floor(586440 * 7 / 31) + 296435 - Math.floor(296435 * 14 / 31);
  const wallet = w.CivicationState.getWallet();
  assert.equal(wallet.nok_v1.payrollLedger[0].grossCents, mixedGross);
  assert.equal(wallet.nok_v1.payrollLedger[0].taxCents, mixedTax);
  assert.equal(Math.round(wallet.balance * 100), 12525 + mixedGross - mixedTax, 'unemployed days earn nothing');
  const savedWallet = JSON.stringify(wallet);
  w.CivicationEconomyEngine.tickWeekly(); await w.CivicationUI.render();
  assert.equal(JSON.stringify(w.CivicationState.getWallet()), savedWallet);
  app.dom.window.close();
  console.log('PASS: all 3 sourced jobs × 2 fractions through canonical gates, real selector/acceptance, 31-day pay, exact cents and no duplicate money');
})().catch(error => { console.error(error); process.exitCode = 1; });
