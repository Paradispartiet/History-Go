#!/usr/bin/env node
'use strict';
// Real shell/browser controls. Boundaries: release approval, opening savings and
// earned qualification fixtures. Test wallets are isolated; real accounts are never modified.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const playwright = require('playwright');
const outputDir = path.join(process.cwd(), 'reports/civication-browser');
const origin = 'http://127.0.0.1:4175';
const profile = JSON.parse(fs.readFileSync('data/Civication/economy/nok-budget-prototype-2026.json', 'utf8'));
const releaseCandidate = profile.status === 'active' && profile.migration?.activated === true;
if (releaseCandidate) {
  assert.equal(profile.migration.releaseMode, 'explicit_player_opt_in_only',
    'approved release must remain explicitly player-initiated');
} else {
  assert.equal(profile.status, 'prototype_not_activated', 'unapproved profile stays disabled');
  assert.equal(profile.migration?.activated, false, 'unapproved migration remains disabled');
}
const approved = JSON.parse(JSON.stringify(profile)); approved.status = 'active'; approved.migration.activated = true;
const quiz = JSON.parse(fs.readFileSync('data/quiz/naeringsliv/akerselva_industri_sets_merged.json', 'utf8'));
const completed = quiz.sets.slice(0, 5).map(s => quiz.targetId + '::' + s.set_id);
fs.mkdirSync(outputDir, { recursive: true });
const report = { status: 'started', views: [] };
async function scenario(engine, width, height) {
  const name = engine + '-' + width;
  const browser = await playwright[engine].launch({ headless: true });
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await context.addInitScript(({ completed }) => {
    localStorage.setItem('hg_onboarding_shown_v1', '1');
    if (!localStorage.getItem('nok_browser_fixture_initialized')) {
      localStorage.setItem('hg_civi_wallet_v1', JSON.stringify({ balance: 20000, last_tick_day_index: 1 }));
      localStorage.setItem('merits_by_category', JSON.stringify({ naeringsliv: { points: 10 } })); // Explicit offer-boundary fixture.
      localStorage.setItem('quiz_progress', JSON.stringify({ naeringsliv: { completed } }));
      localStorage.setItem('visited_places', JSON.stringify({ tronsmo_bokhandel: true }));
      localStorage.setItem('nok_browser_fixture_initialized', '1');
    }
  }, { completed });
  await context.route('**/data/Civication/economy/nok-budget-prototype-2026.json', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(approved) }));
  const page = await context.newPage();
  const errors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    pageErrors.push({ message: error.message, stack: error.stack, url: page.url(), at: Date.now() });
  });
  page.on('requestfailed', request => failedRequests.push({ url: request.url(),
    error: request.failure()?.errorText, at: Date.now() }));
  const navigations = [];
  page.on('framenavigated', frame => { if (frame === page.mainFrame()) navigations.push(frame.url()); });
  page.on('crash', () => errors.push('NOK browser renderer crashed'));
  const reloads = [];
  const wallet = () => page.evaluate(() => window.CivicationState.getWallet());
  async function capture(stage) {
    const filename = 'nok-' + name + '-' + stage + '.jpg';
    const data = await page.screenshot({ path: path.join(outputDir, filename), type: 'jpeg', quality: 55, animations: 'disabled', fullPage: false, timeout: 20000 });
    // Small, fixture-only review images can be retrieved from decoded CI logs.
    console.log('CIVI_NOK_IMAGE:' + filename + ':' + data.toString('base64'));
    return filename;
  }
  async function completeSourceLoading() {
    await page.waitForFunction(() => typeof window.CivicationSocialPlaceResolver?.loadPlaces === 'function');
    const count = await page.evaluate(async () => {
      let timer;
      try {
        const places = await Promise.race([window.CivicationSocialPlaceResolver.loadPlaces(),
          new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('NOK source loading timed out')), 90000); })]);
        return places.length;
      } finally { clearTimeout(timer); }
    });
    await page.evaluate(async () => {
      const active = window.CivicationState?.getActivePosition?.();
      if (active) await window.CivicationRoleModelRuntime?.loadRoleModel?.(active);
      const privateBuilder = window.CivicationPrivatePhaseMailBuilder;
      if (!privateBuilder?.loadPhaseFamily || !Array.isArray(privateBuilder.PRIVATE_PHASES))
        throw new Error('Private phase source loader is unavailable');
      const families = await Promise.all(privateBuilder.PRIVATE_PHASES.map(phase => privateBuilder.loadPhaseFamily(phase)));
      if (families.some(family => !family)) throw new Error('A required private phase source failed to load');
      await window.CivicationDailyMailBuilder?.prewarm?.(active);
    });
    await page.waitForLoadState('networkidle', { timeout: 90000 });
    assert.ok(count > 0, 'required place sources finish before navigation, avoiding cancelled WebKit fetches');
  }
  async function openSection(category, id) {
    const close = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]').first();
    if (await close.isVisible().catch(() => false)) await close.click();
    await page.locator('.civi-footer [data-category="' + category + '"]').click();
    await page.locator('#' + id + ' > .civi-mini-card [data-civi-mini-open]').click();
    await page.locator('#civiSectionPopup.is-open').waitFor({ state: 'visible' });
  }
  try {
    await page.goto(origin + '/Civication.html', { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!window.CivicationEconomyUI?.render && !!window.HG_CiviShop?.consumeNokProduct && window.HGBrands?.ready === true
      && document.querySelector('#civiStoreSection > .civi-mini-card'), null, { timeout: 90000 });
    await completeSourceLoading();
    await openSection('kommers', 'civiStoreSection');
    assert.equal((await wallet()).nok_v1, undefined,
      'loading approved NOK release never silently migrates the player wallet');
    assert.equal((await wallet()).balance, 20000, 'balance remains intact before explicit opt-in');
    await page.locator('[data-nok-activate]').click();
    await page.waitForFunction(() => window.CivicationState.getWallet().nok_v1?.active === true);
    assert.equal((await wallet()).balance, 20000);
    await openSection('karriere', 'activeJobSection');
    const jobVariants = [];
    const jobScreenshots = [];
    async function selectJob(job, percent) {
      const offerKey = await page.evaluate(({ jobId, percent }) => window.CivicationJobs.getOffers()
        .find(o => o.status === 'pending' && o.nok_job_id === jobId && o.nok_employment_percent === percent)?.offer_key,
        { jobId: job.id, percent });
      assert.ok(offerKey, 'canonical gated offer exists for ' + job.id + ' ' + percent);
      await page.locator('#civiNokOfferSelect').selectOption(offerKey);
      await page.waitForFunction(({ source, percent }) => {
        const terms = document.querySelector('[data-civi-nok-offer-terms]');
        return terms?.querySelector('a')?.getAttribute('href') === source && terms.textContent.includes(percent + ' % stilling');
      }, { source: job.source, percent });
      const checked = await page.evaluate(({ jobId, percent }) => {
        const terms = document.querySelector('[data-civi-nok-offer-terms]').textContent;
        const view = window.CivicationNokBudget.preview(window.CivicationState.getWallet().nok_v1.config,
          { employed: true, employmentPercent: percent, jobId });
        const money = value => value.toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return { correct: terms.includes('Brutto: ' + money(view.monthlyGross))
          && terms.includes('Estimert netto: ' + money(view.monthlyNet)), gross: view.monthlyGross };
      }, { jobId: job.id, percent });
      assert.equal(checked.correct, true);
      return checked;
    }
    for (const job of [profile.job, ...profile.jobs]) for (const percent of [100, 50]) {
      const checked = await selectJob(job, percent);
      jobVariants.push({ jobId: job.id, percent, monthlyGross: checked.gross });
      if (job.id !== profile.job.id && percent === 50) {
        await page.locator('[data-civi-nok-offer-terms]').scrollIntoViewIfNeeded();
        jobScreenshots.push(await capture(job.id + '-50-terms'));
      }
    }
    assert.equal((await wallet()).balance, 20000, 'reviewing six offers never pays or changes balance');
    const acceptedJob = engine === 'chromium' ? profile.job : profile.jobs[width === 390 ? 0 : 1];
    const acceptedPercent = engine === 'webkit' && width === 390 ? 50 : 100;
    await selectJob(acceptedJob, acceptedPercent);
    await page.locator('[data-civi-nok-offer-terms]').waitFor({ state: 'visible' });
    const terms = await page.locator('[data-civi-nok-offer-terms]').textContent();
    assert.ok(terms.includes('Brutto:') && terms.includes('Estimert netto:') && terms.includes(acceptedPercent + ' %'));
    await page.locator('[data-civi-nok-offer-terms]').scrollIntoViewIfNeeded();
    const screenshots = [...jobScreenshots, await capture('salary-terms')];
    await page.locator('#civiOfferAccept').click();
    await page.waitForFunction(title => window.CivicationState.getActivePosition()?.title === title, acceptedJob.roleTitle);
    const acceptedContract = await page.evaluate(() => window.CivicationState.getActivePosition().nok_salary_contract);
    assert.equal(acceptedContract.jobId, acceptedJob.id);
    assert.equal(acceptedContract.employmentPercent, acceptedPercent);
    assert.equal((await wallet()).balance, 20000, 'acceptance does not pay salary');
    await openSection('personlig', 'civiHomeStatus');
    const housingText = await page.locator('#homeStatusContent').textContent();
    assert.ok(housingText.includes('Statistisk startprofil') && housingText.includes('617 kr per hel måned'));
    await page.locator('[data-civi-district-select="sagene"]').filter({ visible: true }).first().click();
    await page.waitForFunction(() => window.CivicationState.getWallet().nok_v1?.housing?.districtId === 'sagene');
    // A normal reload must keep the accepted offer, home and opening balance.
    await completeSourceLoading();
    reloads.push({ before: page.url() });
    const reloadResponse = await page.reload({ waitUntil: 'load', timeout: 90000 });
    reloads[reloads.length - 1].after = page.url();
    reloads[reloads.length - 1].status = reloadResponse?.status();
    await page.waitForFunction(() => !!window.HG_CiviShop?.consumeNokProduct && document.querySelector('#civiStoreSection > .civi-mini-card'), null, { timeout: 90000 });
    await completeSourceLoading();
    await openSection('kommers', 'civiStoreSection');
    await page.locator('[data-nok-invoice]').first().click();
    await page.waitForFunction(() => window.CivicationState.getWallet().nok_v1.invoices.some(i => i.status === 'paid'));
    assert.equal((await wallet()).balance, 9910);
    await page.locator('[data-buy-pack="tine-milk-1l"]').click();
    await page.waitForFunction(() => window.CivicationState.getWallet().nok_v1.shopping?.quantities?.['tine-milk-1l'] === 1);
    const consume = page.locator('[data-consume-product="tine-milk-1l"]');
    await consume.click();
    await page.waitForFunction(() => window.HG_CiviShop.getNokProductStock('tine-milk-1l').available === 750);
    assert.equal((await wallet()).balance, 9890.6, 'consumption never charges again');
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-consume-product'));
    assert.equal(focused, 'tine-milk-1l');
    const addedStock = {};
    for (const [id, remaining] of [['carrots-second-sort-1kg', 900], ['bananas-1kg', 900], ['sevan-red-lentils-dry-900g', 800]]) {
      await page.locator('[data-buy-pack="' + id + '"]').click();
      await page.waitForFunction(productId => window.CivicationState.getWallet().nok_v1.shopping.quantities[productId] === 1, id);
      await page.locator('[data-consume-product="' + id + '"]').click();
      await page.waitForFunction(({ id, remaining }) => window.HG_CiviShop.getNokProductStock(id).available === remaining, { id, remaining });
      addedStock[id] = remaining;
    }
    assert.equal((await wallet()).balance, 9800.9, 'three added packs cost 89.70 with no extra consumption charge');
    const cashFlow = await page.evaluate(() => window.CivicationNokBudget.monthlyCashFlow(
      window.CivicationState.getWallet(), window.CivicationCalendar.getMonthPeriod().id,
      window.CivicationCalendar.getGameDate));
    assert.equal(cashFlow.ok, true);
    assert.equal(cashFlow.incomeCents, 0, 'accepted job and earned days are not paid salary');
    assert.equal(cashFlow.invoiceCents, 1009000);
    assert.equal(cashFlow.groceryCents, 10910);
    assert.equal(cashFlow.expenseCents, 1019910);
    const statement = page.locator('[data-nok-monthly-statement]');
    assert.ok((await statement.textContent()).includes('Varekjøp:'));
    await statement.locator('h4').scrollIntoViewIfNeeded();
    screenshots.push(await capture('monthly-statement'));
    await page.locator('[data-consume-product="tine-milk-1l"]').scrollIntoViewIfNeeded();
    screenshots.push(await capture('pantry'));
    const geometry = await page.evaluate(() => {
      const panel = document.querySelector('#civiSectionPopup .civi-section-popup-panel');
      const controls = Array.from(document.querySelectorAll('#civiStorePanel button, #civiEconomyPanel button'))
        .filter(b => b.getClientRects().length && !b.disabled).map(b => {
          const r = b.getBoundingClientRect(); return { width: r.width, height: r.height, left: r.left, right: r.right };
        });
      return { fits: panel.scrollWidth <= panel.clientWidth + 2, controls, viewport: innerWidth };
    });
    assert.ok(geometry.fits, 'economy popup has no horizontal overflow');
    assert.ok(geometry.controls.length > 0 && geometry.controls.every(r => r.height >= 44 && r.left >= -1 && r.right <= width + 1), 'NOK controls fit and have 44px touch targets');
    const saved = JSON.stringify(await wallet());
    await completeSourceLoading();
    reloads.push({ before: page.url() });
    const finalResponse = await page.reload({ waitUntil: 'load', timeout: 90000 });
    reloads[reloads.length - 1].after = page.url();
    reloads[reloads.length - 1].status = finalResponse?.status();
    await page.waitForFunction(() => !!window.HG_CiviShop?.getNokProductStock);
    await completeSourceLoading();
    assert.equal(JSON.stringify(await wallet()), saved, 'reload neither buys, consumes nor pays again');
    // Explicit job-loss boundary; application and acceptance use real controls.
    const priorOffers = await page.evaluate(() => window.CivicationJobs.getOffers());
    await page.evaluate(() => {
      window.CivicationState.setActivePosition(null);
      window.CivicationState.setState({ career: { activeJob: null } });
      window.dispatchEvent(new Event('updateProfile'));
    });
    await openSection('karriere', 'activeJobSection');
    await page.locator('#civiNokSearch').waitFor({ state: 'visible' });
    const reapplyJob = profile.jobs[1];
    const searchValue = await page.locator('#civiNokSearch option').evaluateAll((options, title) =>
      options.find(o => o.textContent.includes(title + ' · 50 %')).value, reapplyJob.roleTitle);
    await page.locator('#civiNokSearch').selectOption(searchValue);
    screenshots.push(await capture('new-application'));
    await page.locator('#civiNokApply').click();
    await page.locator('#civiOfferAccept').waitFor({ state: 'visible' });
    const newOffer = await page.evaluate(() => window.CivicationJobs.getOffers()[0]);
    assert.equal(newOffer.nok_job_id, reapplyJob.id);
    assert.equal(newOffer.nok_employment_percent, 50);
    assert.ok(newOffer.nok_application_id);
    const withApplication = await page.evaluate(() => window.CivicationJobs.getOffers());
    assert.equal(withApplication.length, priorOffers.length + 1);
    assert.deepEqual(withApplication.slice(1), priorOffers, 'all historical offers survive the explicit application');
    assert.equal(JSON.stringify(await wallet()), saved, 'application never pays or mutates wallet');
    screenshots.push(await capture('new-application-terms'));
    await page.locator('#civiOfferAccept').click();
    await page.waitForFunction(key => window.CivicationState.getActivePosition()?.nok_salary_contract?.offerKey === key, newOffer.offer_key);
    assert.equal(JSON.stringify(await wallet()), saved, 'reacceptance gives no money');
    await completeSourceLoading();
    await page.reload({ waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!window.CivicationJobs?.applyForNokJob);
    await completeSourceLoading();
    assert.equal(JSON.stringify(await wallet()), saved);
    const restored = await page.evaluate(() => ({ active: window.CivicationState.getActivePosition(), offers: window.CivicationJobs.getOffers() }));
    assert.equal(restored.active.nok_salary_contract.offerKey, newOffer.offer_key);
    assert.equal(restored.offers.length, priorOffers.length + 1);
    assert.equal(restored.offers.filter(o => o.status === 'accepted').length, 2, 'prior accepted offer remains historical');
    await openSection('kommers', 'civiStoreSection');
    await page.locator('[data-buy-pack="axa-oats-1100g"]').click();
    await page.waitForFunction(() => window.HG_CiviShop.getNokProductStock('axa-oats-1100g').available === 1100);
    assert.equal((await wallet()).balance, 9770);
    const mealButton = page.locator('[data-prepare-meal="oats-with-milk"]');
    await mealButton.scrollIntoViewIfNeeded();
    assert.equal(await mealButton.isEnabled(), true);
    screenshots.push(await capture('meal-ready'));
    const cashBeforeMeal = await page.evaluate(() => window.CivicationNokBudget.monthlyCashFlow(
      window.CivicationState.getWallet(), window.CivicationCalendar.getMonthPeriod().id,
      window.CivicationCalendar.getGameDate));
    await mealButton.click();
    await page.waitForFunction(() => window.HG_CiviShop.getNokProductStock('axa-oats-1100g').available === 1020
      && window.HG_CiviShop.getNokProductStock('tine-milk-1l').available === 500);
    assert.equal((await wallet()).balance, 9770, 'meal consumes ingredients with no second payment');
    const cashAfterMeal = await page.evaluate(() => window.CivicationNokBudget.monthlyCashFlow(
      window.CivicationState.getWallet(), window.CivicationCalendar.getMonthPeriod().id,
      window.CivicationCalendar.getGameDate));
    assert.deepEqual(cashAfterMeal, cashBeforeMeal, 'ingredient reference cost is never an expense');
    await page.locator('[data-prepare-meal="oats-with-milk"]').scrollIntoViewIfNeeded();
    screenshots.push(await capture('meal-consumed'));
    const mealSaved = JSON.stringify(await wallet());
    await completeSourceLoading();
    await page.reload({ waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!window.HG_CiviShop?.getNokMeals);
    await completeSourceLoading();
    assert.equal(JSON.stringify(await wallet()), mealSaved, 'meal inventory/history survives reload without repetition');
    await openSection('kommers', 'civiStoreSection');
    for (const id of ['r-rice-2kg', 'r-chopped-tomatoes-400g', 'yellow-onions-1kg', 'sopps-spaghetti-500g']) {
      await page.locator('[data-buy-pack="' + id + '"]').click();
      await page.waitForFunction(productId => window.CivicationState.getWallet().nok_v1.shopping.quantities[productId] === 1, id);
    }
    assert.equal((await wallet()).balance, 9688.2);
    const beforeNewMeals = await page.evaluate(() => window.CivicationNokBudget.monthlyCashFlow(
      window.CivicationState.getWallet(), window.CivicationCalendar.getMonthPeriod().id,
      window.CivicationCalendar.getGameDate));
    for (const [id, cents] of [['rice-lentils-tomato-onion', 957], ['pasta-tomato-onion', 761], ['oats-milk-banana', 959]]) {
      const prepare = page.locator('[data-prepare-meal="' + id + '"]');
      assert.equal(await prepare.isEnabled(), true);
      const rowText = await prepare.locator('..').textContent();
      const price = (cents / 100).toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      assert.ok(rowText.includes(price), 'visible reference cost for ' + id);
      await prepare.click();
      await page.waitForFunction(mealId => window.CivicationState.getWallet().nok_v1.shopping.consumptions.some(c => c.kind === 'meal' && c.mealId === mealId), id);
      assert.equal((await wallet()).balance, 9688.2);
    }
    const newMealStock = await page.evaluate(() => Object.fromEntries(['r-rice-2kg', 'r-chopped-tomatoes-400g', 'yellow-onions-1kg',
      'sopps-spaghetti-500g', 'sevan-red-lentils-dry-900g', 'axa-oats-1100g', 'tine-milk-1l', 'bananas-1kg']
      .map(id => [id, window.HG_CiviShop.getNokProductStock(id).available])));
    assert.deepEqual(newMealStock, { 'r-rice-2kg': 1900, 'r-chopped-tomatoes-400g': 100, 'yellow-onions-1kg': 900,
      'sopps-spaghetti-500g': 400, 'sevan-red-lentils-dry-900g': 725, 'axa-oats-1100g': 940, 'tine-milk-1l': 250, 'bananas-1kg': 800 });
    assert.equal(await page.locator('[data-prepare-meal="rice-lentils-tomato-onion"]').isEnabled(), false, 'not enough tomatoes for another rice meal');
    await page.locator('[data-prepare-meal="rice-lentils-tomato-onion"]').scrollIntoViewIfNeeded();
    screenshots.push(await capture('expanded-meals'));
    const cashAfterNewMeals = await page.evaluate(() => window.CivicationNokBudget.monthlyCashFlow(
      window.CivicationState.getWallet(), window.CivicationCalendar.getMonthPeriod().id,
      window.CivicationCalendar.getGameDate));
    assert.deepEqual(cashAfterNewMeals, beforeNewMeals, 'new meal reference costs never become extra payments');
    assert.equal(cashAfterNewMeals.expenseCents, 1031180);
    const allMealsSaved = JSON.stringify(await wallet());
    await completeSourceLoading();
    await page.reload({ waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!window.HG_CiviShop?.getNokMeals);
    await completeSourceLoading();
    assert.equal(JSON.stringify(await wallet()), allMealsSaved, 'all new meals and remaining units survive reload');
    await openSection('kommers', 'civiStoreSection');
    const planner = page.locator('[data-meal-planner]');
    await planner.locator('summary').click();
    const planBefore = JSON.stringify(await wallet());
    for (const [id, count] of [['rice-lentils-tomato-onion', '2'], ['pasta-tomato-onion', '1'], ['oats-with-milk', '3']])
      await planner.locator('[data-plan-meal="' + id + '"]').fill(count);
    assert.equal(JSON.stringify(await wallet()), planBefore, 'editing a meal plan does not write or reserve food');
    const forecast = await planner.locator('[data-meal-plan-preview]').textContent();
    assert.ok(forecast.includes('27,50') && forecast.includes('48,04'));
    await planner.locator('summary').scrollIntoViewIfNeeded();
    screenshots.push(await capture('meal-plan-counts'));
    await planner.locator('[data-save-meal-plan]').click();
    await page.waitForFunction(() => window.CivicationState.getWallet().nok_v1.shopping.mealPlan?.servings?.['rice-lentils-tomato-onion'] === 2);
    const afterPlan = await wallet();
    const withoutPlan = JSON.parse(JSON.stringify(afterPlan)); delete withoutPlan.nok_v1.shopping.mealPlan;
    assert.equal(JSON.stringify(withoutPlan), planBefore, 'saving changes only the plan');
    const actualPlan = await page.evaluate(() => window.HG_CiviShop.getNokMealPlan());
    assert.equal(actualPlan.shoppingCostCents, 2750);
    assert.equal(actualPlan.referenceCostCents, 4804);
    assert.equal(actualPlan.portions, 6);
    const planGeometry = await planner.evaluate(el => ({ fits: el.scrollWidth <= el.clientWidth + 2,
      inputs: Array.from(el.querySelectorAll('input')).map(input => ({ height: input.getBoundingClientRect().height,
        left: input.getBoundingClientRect().left, right: input.getBoundingClientRect().right })) }));
    assert.ok(planGeometry.fits && planGeometry.inputs.every(r => r.height >= 44 && r.left >= 0 && r.right <= width + 1));
    await planner.locator('[data-meal-plan-preview] > strong').scrollIntoViewIfNeeded();
    screenshots.push(await capture('meal-plan-shopping-list'));
    // A real preparation completes exactly one of the selected portions.
    await page.locator('[data-prepare-meal="oats-with-milk"]').click();
    await page.waitForFunction(() => window.CivicationState.getWallet().nok_v1.shopping.mealPlan.servings['oats-with-milk'] === 2);
    assert.equal((await wallet()).balance, 9688.2);
    const prepared = await page.evaluate(() => window.CivicationState.getWallet().nok_v1.shopping.consumptions.at(-1));
    const planFinished = JSON.stringify(await wallet());
    const repeatPlanMeal = await page.evaluate(entry => window.HG_CiviShop.consumeNokMeal(entry.mealId, entry.requestId), prepared);
    assert.equal(repeatPlanMeal.skipped, true);
    assert.equal(JSON.stringify(await wallet()), planFinished, 'repeated preparation never completes another planned portion');
    newMealStock['axa-oats-1100g'] = 860; newMealStock['tine-milk-1l'] = 0;
    assert.equal(await page.evaluate(() => window.HG_CiviShop.getNokProductStock('tine-milk-1l').available), 0);
    assert.equal(await page.evaluate(() => window.HG_CiviShop.getNokProductStock('axa-oats-1100g').available), 860);
    await completeSourceLoading();
    await page.reload({ waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!window.HG_CiviShop?.getNokMealPlan);
    await completeSourceLoading();
    assert.equal(JSON.stringify(await wallet()), planFinished, 'plan and its remaining servings survive reload');
    assert.equal(await page.evaluate(() => window.HG_CiviShop.getNokMealPlan().portions), 5);
    await openSection('kommers', 'civiStoreSection');
    await page.locator('[data-buy-pack="tine-milk-1l"]').click();
    await page.waitForFunction(() => window.HG_CiviShop.getNokProductStock('tine-milk-1l').available === 1000);
    assert.equal((await wallet()).balance, 9668.8);
    const beforeWeek = JSON.stringify(await wallet());
    const week = page.locator('[data-meal-week]'); await week.locator('summary').first().click();
    const dates = await page.evaluate(() => {
      const date = window.CivicationCalendar.getGameDate();
      return window.HG_CiviShop.previewNokMealWeek(date, []).dates;
    });
    await week.locator('[data-week-date="' + dates[0] + '"][data-week-slot="breakfast"]').selectOption('oats-with-milk');
    // Expand the next day to choose its lunch through the actual select.
    await week.locator('details').nth(1).locator('summary').click();
    await week.locator('[data-week-date="' + dates[1] + '"][data-week-slot="lunch"]').selectOption('pasta-tomato-onion');
    assert.equal(JSON.stringify(await wallet()), beforeWeek, 'weekly editing never purchases, consumes or changes the old portion plan');
    await week.locator('[data-meal-week-start]').scrollIntoViewIfNeeded();
    screenshots.push(await capture('meal-week-dates'));
    await week.locator('[data-save-meal-week]').click();
    await page.waitForFunction(() => window.HG_CiviShop.getNokMealWeek().portions === 2);
    const savedWeek = await wallet();
    const strippedWeek = JSON.parse(JSON.stringify(savedWeek)); delete strippedWeek.nok_v1.shopping.mealPlan;
    const strippedBefore = JSON.parse(beforeWeek); delete strippedBefore.nok_v1.shopping.mealPlan;
    assert.deepEqual(strippedWeek, strippedBefore, 'weekly save replaces only the existing plan');
    const weekView = await page.evaluate(() => window.HG_CiviShop.getNokMealWeek());
    assert.equal(weekView.referenceCostCents, 1471); assert.equal(weekView.shoppingCostCents, 810);
    const weekGeometry = await week.evaluate(el => ({ fits: el.scrollWidth <= el.clientWidth + 2,
      controls: Array.from(el.querySelectorAll('input, select, button')).filter(c => c.getClientRects().length).map(c => {
        const r = c.getBoundingClientRect(); return { height: r.height, left: r.left, right: r.right };
      }) }));
    assert.ok(weekGeometry.fits && weekGeometry.controls.every(r => r.height >= 44 && r.left >= 0 && r.right <= width + 1));
    await week.locator('[data-meal-week-preview] > strong').scrollIntoViewIfNeeded();
    screenshots.push(await capture('meal-week-shopping-list'));
    assert.equal(await page.locator('[data-prepare-week]').count(), 1, 'only today has a meal action');
    await page.locator('[data-prepare-week="' + dates[0] + ':breakfast"]').click();
    await page.waitForFunction(() => window.HG_CiviShop.getNokMealWeek().portions === 1);
    assert.equal((await wallet()).balance, 9668.8);
    const weeklyConsumption = await page.evaluate(() => window.CivicationState.getWallet().nok_v1.shopping.consumptions.at(-1));
    const finalWeekWallet = JSON.stringify(await wallet());
    assert.equal((await page.evaluate(c => window.HG_CiviShop.consumeNokMeal(c.mealId, c.requestId, c.planEntryKey), weeklyConsumption)).skipped, true);
    assert.equal(JSON.stringify(await wallet()), finalWeekWallet);
    const finalCash = await page.evaluate(() => window.CivicationNokBudget.monthlyCashFlow(
      window.CivicationState.getWallet(), window.CivicationCalendar.getMonthPeriod().id, window.CivicationCalendar.getGameDate));
    assert.equal(finalCash.expenseCents, 1033120, 'only the additional milk purchase is a payment');
    newMealStock['axa-oats-1100g'] = 780; newMealStock['tine-milk-1l'] = 750;
    await completeSourceLoading(); await page.reload({ waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!window.HG_CiviShop?.getNokMealWeek); await completeSourceLoading();
    assert.equal(JSON.stringify(await wallet()), finalWeekWallet, 'weekly dates, remaining lunch, inventory and history survive reload');
    assert.equal(await page.evaluate(() => window.HG_CiviShop.getNokMealWeek().portions), 1);
    // Synthetic Fysen quote in an isolated browser wallet: check the real UI button,
    // not a live restaurant offer or a payment to an external provider.
    await openSection('kommers', 'civiStoreSection');
    const beforeRestaurant = (await wallet()).balance;
    const baselineRestaurant = await page.evaluate(() => {
      const wallet = window.CivicationState.getWallet();
      return {
        purchases: wallet.nok_v1.restaurantPurchases?.length || 0,
        cash: window.CivicationNokBudget.monthlyCashFlow(wallet,
          window.CivicationCalendar.getMonthPeriod().id,
          window.CivicationCalendar.getGameDate).restaurantCents
      };
    });
    assert.deepEqual(baselineRestaurant, { purchases: 0, cash: 0 });
    await page.evaluate(() => {
      const day = (window.CivicationCalendar.getClock().dayIndex - 1) % 7;
      window.CivicationMealPlan.setRestaurantMeal(day, 'dinner', {
        restaurantId: 'fysen-browser-test-only',
        name: 'Syntetisk testrestaurant',
        dishName: 'Testmiddag',
        portions: 2,
        priceMinor: 11900,
        priceKind: 'exact'
      });
      window.CivicationMealPlanUI.render();
    });
    const restaurantPanel = page.locator('#civiWeeklyMealPlanPanel');
    const checkout = restaurantPanel.getByRole('button', { name: /Kjøp i spillet/ });
    await checkout.waitFor({ state: 'visible' });
    assert.equal(await checkout.count(), 1, 'one explicit restaurant checkout for today');
    assert.equal((await wallet()).balance, beforeRestaurant, 'restaurant planning never charges');
    assert.ok((await restaurantPanel.textContent()).includes('Testmiddag'));
    await checkout.click();
    await page.waitForFunction(() => window.CivicationState.getWallet().nok_v1.restaurantPurchases?.length === 1);
    const restaurantPaidWallet = await wallet();
    const restaurantReceipt = restaurantPaidWallet.nok_v1.restaurantPurchases[0];
    assert.equal(restaurantReceipt.amountMinor, 23800, 'two test portions at NOK 119 each');
    assert.equal(restaurantPaidWallet.balance, beforeRestaurant - 238);
    const restaurantCash = await page.evaluate(() => window.CivicationNokBudget.monthlyCashFlow(
      window.CivicationState.getWallet(), window.CivicationCalendar.getMonthPeriod().id,
      window.CivicationCalendar.getGameDate));
    assert.equal(restaurantCash.restaurantCents, 23800, 'one settled restaurant expense');
    assert.equal(restaurantCash.expenseCents, finalCash.expenseCents + 23800,
      'restaurant checkout is included exactly once in monthly cash flow');
    assert.equal(await checkout.count(), 0, 'paid slot cannot be purchased again');
    assert.ok((await restaurantPanel.textContent()).includes('betalt i spillet'));
    screenshots.push(await capture('restaurant-checkout'));
    await completeSourceLoading(); await page.reload({ waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!window.CivicationMealPlanUI?.render && !!window.HG_CiviShop?.getNokMealWeek);
    await completeSourceLoading();
    await openSection('kommers', 'civiStoreSection');
    assert.equal(JSON.stringify(await wallet()), JSON.stringify(restaurantPaidWallet),
      'restaurant payment and receipt persist after reload without a second debit');
    assert.equal(await page.locator('#civiWeeklyMealPlanPanel').getByRole('button',
      { name: /Kjøp i spillet/ }).count(), 0, 'reload cannot repurchase paid restaurant slot');
    assert.deepEqual(errors, [], 'no uncaught page errors');
    return { engine, width, height, geometry, screenshots, balance: (await wallet()).balance, remainingMilkMl: 750, addedStock, newMealStock,
      monthlyPaidCents: finalCash.expenseCents, jobVariants, acceptedJobId: acceptedJob.id, acceptedPercent };
  } catch (error) {
    console.error('CIVI_NOK_NAVIGATION:' + JSON.stringify({ navigations, reloads, errors, pageErrors, failedRequests }));
    console.error('CIVI_NOK_FAILURE_STATE:' + JSON.stringify(await page.evaluate(() => ({
      url: location.href, origin: location.origin, readyState: document.readyState, title: document.title,
      body: document.body?.textContent?.slice(0, 500),
      wallet: window.CivicationState?.getWallet?.(), active: window.CivicationState?.getActivePosition?.(),
      offers: window.CivicationJobs?.getOffers?.(), merits: localStorage.getItem('merits_by_category'),
      brandsReady: window.HGBrands?.ready, brandCount: window.HGBrands?.all?.length,
      brands: window.CivicationBrandAccess?.inspect?.({ career_id: 'naeringsliv', role_scope: 'ekspeditor' })
    })).catch(() => null)));
    await capture('failure').catch(() => {});
    throw new Error(name + ': ' + (error.stack || error));
  } finally { await context.close(); await browser.close(); }
}
(async () => {
  const server = spawn('python3', ['-m', 'http.server', '4175', '--bind', '127.0.0.1'], { stdio: 'ignore' });
  try {
    const deadline = Date.now() + 15000;
    while (true) {
      try { if ((await fetch(origin + '/Civication.html')).ok) break; } catch {}
      if (Date.now() >= deadline) throw new Error('NOK browser server did not start');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    for (const [engine, width, height] of [['chromium', 390, 844], ['webkit', 390, 844], ['webkit', 820, 1180]]) {
      const view = await scenario(engine, width, height); report.views.push(view);
      console.log('CIVI_NOK_VIEW:' + JSON.stringify(view));
    }
    report.status = 'passed';
  } catch (error) { report.status = 'failed'; report.error = String(error.stack || error); throw error; }
  finally { server.kill('SIGTERM'); fs.writeFileSync(path.join(outputDir, 'nok-browser-report.json'), JSON.stringify(report, null, 2)); }
})().catch(error => { console.error(error); process.exitCode = 1; });


