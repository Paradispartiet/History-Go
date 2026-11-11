#!/usr/bin/env node
// Targeted Chromium acceptance for the original ekspeditør Life Story, not
// the normal jobmail runtime. Dev URL selects a role without granting a job.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const origin = 'http://127.0.0.1:4187';
const output = path.resolve('reports/civication-ekspeditor-lifestory-browser');
mkdirSync(output, { recursive: true });
const server = spawn('python3', ['-m', 'http.server', '4187', '--bind', '127.0.0.1'], { stdio: 'ignore' });
let serverError = null;
server.on('error', error => { serverError = error; });

async function waitForServer() {
  const limit = Date.now() + 20000;
  while (Date.now() < limit) {
    if (serverError) throw serverError;
    if (server.exitCode !== null) throw new Error('HTTP server stopped: ' + server.exitCode);
    try { if ((await fetch(origin + '/Civication.html')).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Civication static test server did not start');
}

async function play(browser, label, viewport, choices, expected) {
  const context = await browser.newContext({ viewport, isMobile: viewport.width < 600, hasTouch: true });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  const trace = [];
  try {
    await page.goto(origin + '/Civication.html?lifestoryRole=ekspeditor', { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => {
      const app = globalThis;
      return app.CivicationLifestoryState?.load?.()?.rolle === 'ekspeditor'
        && !!app.CivicationLifestoryUI?.getCurrentSceneInfo?.()?.sceneId;
    }, null, { timeout: 90000 });
    await page.locator('.civi-footer button[data-category="minDag"]').click({ timeout: 20000 });
    await page.locator('.civi-lifestory-scene').first().waitFor({ state: 'visible', timeout: 20000 });
    const started = await page.evaluate(() => globalThis.CivicationLifestoryState.load());
    assert.equal(started.arkiv.length, 0, 'fresh context begins without a seeded story');

    let arrivedAtPrice = false;
    let finalScene = null;
    for (let n = 0; n < 45; n++) {
      const info = await page.evaluate(() => globalThis.CivicationLifestoryUI.getCurrentSceneInfo());
      const sceneId = info?.sceneId;
      assert.ok(sceneId, label + ': a playable scene must be available');
      if (sceneId === 'prisfeil_02_koen') arrivedAtPrice = true;
      const buttons = page.locator('[data-lifestory-scene="' + sceneId + '"][data-lifestory-choice]:not([disabled])');
      const availableCount = await buttons.count();
      assert.ok(availableCount > 0, label + ': visible enabled choice in ' + sceneId);
      const wanted = choices[sceneId];
      const button = wanted
        ? page.locator('[data-lifestory-scene="' + sceneId + '"][data-lifestory-choice="' + wanted + '"]:not([disabled])')
        : buttons.first();
      assert.equal(await button.count(), 1, label + ': requested choice exists ' + sceneId + '/' + wanted);
      await button.scrollIntoViewIfNeeded();
      const rect = await button.boundingBox();
      assert.ok(rect && rect.width > 0 && rect.height > 0, label + ': button must have visible geometry');
      assert.ok(rect.x >= -2 && rect.x + rect.width <= viewport.width + 2,
        label + ': choice must not overflow horizontally in ' + sceneId);
      if (sceneId === 'prisfeil_02_koen' || sceneId === expected.finalScene) {
        await page.screenshot({ path: path.join(output, label + '-' + sceneId + '.png'), fullPage: true });
      }
      const before = await page.evaluate(() => globalThis.CivicationLifestoryState.load().arkiv.length);
      const selected = await button.getAttribute('data-lifestory-choice');
      await button.click({ timeout: 20000 });
      await page.waitForFunction(previous => globalThis.CivicationLifestoryState.load().arkiv.length === previous + 1,
        before, { timeout: 20000 });
      const after = await page.evaluate(() => globalThis.CivicationLifestoryState.load());
      assert.equal(after.arkiv.at(-1).sceneId, sceneId);
      assert.equal(after.arkiv.at(-1).valgId, selected);
      trace.push([sceneId, selected]);
      if (sceneId === expected.finalScene) { finalScene = sceneId; break; }
      const popup = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]').first();
      if (await popup.isVisible().catch(() => false)) await popup.click({ timeout: 12000 });
      await page.locator('.civi-footer button[data-category="minDag"]').click({ timeout: 20000 });
    }
    assert.ok(arrivedAtPrice, label + ': the original price encounter must be rendered');
    assert.equal(finalScene, expected.finalScene, label + ': price follow-up must terminate visibly');
    const completed = await page.evaluate(() => globalThis.CivicationLifestoryState.load());
    assert.equal(completed.tidligereValg.eksp_life_pris_etterkontroll_verifisert === true, expected.verified);
    assert.equal(completed.threadState.prisfeilen_i_koen.status, expected.status);
    assert.ok(completed.arkiv.some(x => x.sceneId === 'prisfeil_04_lene_bekrefter'),
      label + ': Lene acceptance is an actual archived player step');
    const snapshot = completed.arkiv.map(x => [x.sceneId, x.valgId]);
    await page.reload({ waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!globalThis.CivicationLifestoryUI?.getCurrentSceneInfo?.(), null,
      { timeout: 90000 });
    const reloaded = await page.evaluate(() => globalThis.CivicationLifestoryState.load());
    assert.deepEqual(reloaded.arkiv.map(x => [x.sceneId, x.valgId]), snapshot,
      label + ': reload preserves only actual played steps');
    assert.equal(reloaded.tidligereValg.eksp_life_pris_etterkontroll_verifisert === true, expected.verified);
    assert.deepEqual(pageErrors, [], label + ': browser has no uncaught JavaScript errors');
    await page.screenshot({ path: path.join(output, label + '-after-reload.png'), fullPage: true });
    return { label, viewport, finalScene, verified: expected.verified, status: expected.status, trace };
  } finally {
    await context.close();
  }
}

(async () => {
  let browser;
  const results = [];
  try {
    await waitForServer();
    browser = await chromium.launch({ headless: true });
    const good = {
      apning_01_forste_okt: 'sjekk_plakatene',
      prisfeil_02_koen: 'rett_synlig',
      prisfeil_03_meld_avvik: 'send_notat',
      prisfeil_04_lene_bekrefter: 'kontroller_selv',
      prisfeil_05_sjekk_selv: 'kontroller_39'
    };
    const open = {
      apning_01_forste_okt: 'aapne_raskt',
      prisfeil_02_koen: 'gjett_pris',
      prisfeil_03_undersok_etter_snarevei: 'sjekk_selv',
      prisfeil_03_meld_avvik: 'send_notat',
      prisfeil_04_lene_bekrefter: 'kontroller_selv',
      prisfeil_05_sjekk_selv: 'ikke_kontrollert'
    };
    results.push(await play(browser, 'mobile-portrait', { width: 390, height: 844 }, good,
      { finalScene: 'prisfeil_05_sjekk_selv', verified: true, status: 'completed' }));
    results.push(await play(browser, 'ipad-portrait', { width: 820, height: 1180 }, open,
      { finalScene: 'prisfeil_05_sjekk_selv', verified: false, status: 'escalated' }));
    results.push(await play(browser, 'ipad-landscape', { width: 1180, height: 820 }, good,
      { finalScene: 'prisfeil_05_sjekk_selv', verified: true, status: 'completed' }));
    console.log('PASS: ekspeditør original Life Story UI at mobile + two iPad viewports', JSON.stringify(results));
  } finally {
    writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
})().catch(error => { console.error(error?.stack || error); process.exitCode = 1; });
