#!/usr/bin/env node
'use strict';
// Real shell/browser controls. Boundaries: release approval, opening savings and
// earned qualification fixtures. No production profile/account is activated.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const playwright = require('playwright');
const outputDir = path.join(process.cwd(), 'reports/civication-browser');
const origin = 'http://127.0.0.1:4175';
const profile = JSON.parse(fs.readFileSync('data/Civication/economy/nok-budget-prototype-2026.json', 'utf8'));
assert.equal(profile.migration.activated, false, 'production data remains inactive');
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
  const errors = []; page.on('pageerror', error => errors.push(error.message));
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
    await selectJob(profile.job, 100);
    await page.locator('[data-civi-nok-offer-terms]').waitFor({ state: 'visible' });
    const terms = await page.locator('[data-civi-nok-offer-terms]').textContent();
    assert.ok(terms.includes('Brutto:') && terms.includes('Estimert netto:') && terms.includes('100 %'));
    await page.locator('[data-civi-nok-offer-terms]').scrollIntoViewIfNeeded();
    const screenshots = [...jobScreenshots, await capture('salary-terms')];
    await page.locator('#civiOfferAccept').click();
    await page.waitForFunction(title => window.CivicationState.getActivePosition()?.title === title, profile.job.roleTitle);
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
    assert.deepEqual(errors, [], 'no uncaught page errors');
    return { engine, width, height, geometry, screenshots, balance: (await wallet()).balance, remainingMilkMl: 750, addedStock,
      monthlyPaidCents: cashFlow.expenseCents, jobVariants };
  } catch (error) {
    console.error('CIVI_NOK_NAVIGATION:' + JSON.stringify({ navigations, reloads, errors }));
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


