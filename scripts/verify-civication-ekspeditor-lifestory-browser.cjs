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
      if (sceneId === 'prisfeil_05_amir_sjekker') {
        const sender = await page.locator('.civi-lifestory-scene .civi-lifestory-kicker').textContent();
        assert.match(sender, /Fra Amir/, label + ': Amir must be named as sender');
        assert.doesNotMatch(sender, /Fra Lene/, label + ': Lene did not perform this check');
      }
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
    if (expected.finalScene === 'prisfeil_05_amir_sjekker') {
      assert.equal(completed.tidligereValg.eksp_life_pris_etterkontroll_amir, true,
        label + ': Amir must be named as the person who actually checked');
      assert.notEqual(completed.tidligereValg.eksp_life_pris_etterkontroll_egen, true,
        label + ': do not fabricate a personal check after Amir');
    }
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
    const popup = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]').first();
    if (await popup.isVisible().catch(() => false)) await popup.click();
    await page.locator('.civi-footer button[data-category="minDag"]').click();
    for (const name of ['history', 'full-history']) {
      const details = page.locator('[data-lifestory-disclosure="' + name + '"]').first();
      assert.equal(await details.count(), 1, label + ': actual history disclosure exists');
      if (!(await details.evaluate(el => el.open))) await details.locator(':scope > summary').click();
    }
    const symposium = page.locator('[data-lifestory-symposium]').first();
    const normalize = text => String(text).replace(/\s+/g, ' ').trim();
    const shown = normalize(await symposium.innerText());
    for (const record of reloaded.arkiv.filter(row => row.threadId === 'prisfeilen_i_koen')) {
      assert.ok(shown.includes(normalize(record.valgTekst)), label + ': visible Symposium contains actual choice ' + record.sceneId);
      assert.ok(shown.includes(normalize(record.konsekvensTekst)), label + ': visible Symposium contains actual consequence ' + record.sceneId);
    }
    if (expected.finalScene === 'prisfeil_05_amir_sjekker') {
      assert.ok(shown.includes('Amir utførte kontrollen'), label + ': visible history attributes the check to Amir');
    }
    await symposium.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, label + '-symposium.png'), fullPage: true });
    const lastPrice = reloaded.arkiv.filter(row => row.threadId === 'prisfeilen_i_koen').at(-1);
    const lastEntry = symposium.locator('ol > li').filter({ hasText: lastPrice.valgTekst }).last();
    await lastEntry.scrollIntoViewIfNeeded();
    await lastEntry.screenshot({ path: path.join(output, label + '-symposium-price-result.png') });
    return { label, viewport, finalScene, verified: expected.verified, status: expected.status, trace,
      visibleSymposiumChecked: true };
  } finally {
    await context.close();
  }
}


async function playStock(browser, label, viewport, choices, expected) {
  const context = await browser.newContext({ viewport, isMobile: viewport.width < 600, hasTouch: true });
  const page = await context.newPage();
  const pageErrors = [];
  const trace = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  try {
    await page.goto(origin + '/Civication.html?lifestoryRole=ekspeditor', { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => globalThis.CivicationLifestoryState?.load?.()?.rolle === 'ekspeditor'
      && !!globalThis.CivicationLifestoryUI?.getCurrentSceneInfo?.()?.sceneId, null, { timeout: 90000 });
    await page.locator('.civi-footer button[data-category="minDag"]').click({ timeout: 20000 });
    assert.equal((await page.evaluate(() => globalThis.CivicationLifestoryState.load())).arkiv.length, 0,
      label + ': start without injected progress');
    let stockSeen = false;
    let last = null;
    for (let n = 0; n < 65; n++) {
      const info = await page.evaluate(() => globalThis.CivicationLifestoryUI.getCurrentSceneInfo());
      const sceneId = info?.sceneId;
      assert.ok(sceneId, label + ': a visible scene exists');
      if (sceneId === 'varen_01_som_ikke_finnes') stockSeen = true;
      if (['varen_02_amir_teller', 'varen_07_amir_etterkontroll'].includes(sceneId)) {
        const kicker = await page.locator('.civi-lifestory-scene .civi-lifestory-kicker').textContent();
        assert.match(kicker, /Fra Amir/, label + ': stock check is attributed to Amir');
      }
      if (sceneId === 'varen_05_lene_bekrefter') {
        const kicker = await page.locator('.civi-lifestory-scene .civi-lifestory-kicker').textContent();
        assert.match(kicker, /Fra Lene/, label + ': receipt belongs to Lene');
      }
      const enabled = page.locator('[data-lifestory-scene="' + sceneId + '"][data-lifestory-choice]:not([disabled])');
      const wanted = choices[sceneId];
      const button = wanted
        ? page.locator('[data-lifestory-scene="' + sceneId + '"][data-lifestory-choice="' + wanted + '"]:not([disabled])')
        : enabled.first();
      assert.equal(await button.count(), 1, label + ': actual selectable choice ' + sceneId + '/' + wanted);
      await button.scrollIntoViewIfNeeded();
      const rect = await button.boundingBox();
      assert.ok(rect && rect.width > 0 && rect.height > 0, label + ': visible choice geometry');
      assert.ok(rect.x >= -2 && rect.x + rect.width <= viewport.width + 2,
        label + ': choice never overflows horizontally in ' + sceneId);
      if (sceneId === 'varen_01_som_ikke_finnes' || sceneId === expected.finalScene) {
        await page.screenshot({ path: path.join(output, label + '-' + sceneId + '.png'), fullPage: true });
      }
      const before = await page.evaluate(() => globalThis.CivicationLifestoryState.load().arkiv.length);
      const selected = await button.getAttribute('data-lifestory-choice');
      await button.click({ timeout: 20000 });
      await page.waitForFunction(n => globalThis.CivicationLifestoryState.load().arkiv.length === n + 1,
        before, { timeout: 20000 });
      const saved = await page.evaluate(() => globalThis.CivicationLifestoryState.load());
      assert.equal(saved.arkiv.at(-1).sceneId, sceneId);
      assert.equal(saved.arkiv.at(-1).valgId, selected);
      trace.push([sceneId, selected]);
      if (sceneId === expected.finalScene) { last = sceneId; break; }
      const popup = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]').first();
      if (await popup.isVisible().catch(() => false)) await popup.click({ timeout: 12000 });
      await page.locator('.civi-footer button[data-category="minDag"]').click({ timeout: 20000 });
    }
    assert.ok(stockSeen, label + ': actual stock encounter played via browser controls');
    assert.equal(last, expected.finalScene, label + ': intended stock branch finished');
    const final = await page.evaluate(() => globalThis.CivicationLifestoryState.load());
    assert.equal(final.threadState.varen_som_ikke_finnes.status, expected.status);
    assert.equal(final.tidligereValg.lager_etterkontroll_verifisert === true, expected.verified);
    assert.equal(final.tidligereValg.lager_etterkontroll_amir === true, expected.amir === true,
      label + ': only an actually recorded Amir check counts');
    if (expected.verified) {
      assert.equal(final.tidligereValg.lager_avvik_meldt, true);
      assert.equal(final.tidligereValg.lager_ansvar_overtatt, true);
    }
    const beforeReload = final.arkiv.map(row => [row.sceneId, row.valgId]);
    await page.reload({ waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!globalThis.CivicationLifestoryUI?.getCurrentSceneInfo?.(), null,
      { timeout: 90000 });
    const afterReload = await page.evaluate(() => globalThis.CivicationLifestoryState.load());
    assert.deepEqual(afterReload.arkiv.map(row => [row.sceneId, row.valgId]), beforeReload,
      label + ': reload cannot invent or lose a stock task');
    assert.equal(afterReload.tidligereValg.lager_etterkontroll_verifisert === true, expected.verified);
    assert.deepEqual(pageErrors, [], label + ': no browser runtime error');
    await page.screenshot({ path: path.join(output, label + '-stock-after-reload.png'), fullPage: true });
    return { label, viewport, last, status: expected.status, verified: expected.verified, trace };
  } finally {
    await context.close();
  }
}

async function playReturn(browser, label, viewport, choices, expected) {
  const context = await browser.newContext({ viewport, isMobile: viewport.width < 600, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  const trace = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(origin + '/Civication.html?lifestoryRole=ekspeditor', { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => globalThis.CivicationLifestoryState?.load?.()?.rolle === 'ekspeditor'
      && !!globalThis.CivicationLifestoryUI?.getCurrentSceneInfo?.()?.sceneId,
      null, { timeout: 90000 });
    await page.locator('.civi-footer button[data-category="minDag"]').click({ timeout: 20000 });
    const initial = await page.evaluate(() => globalThis.CivicationLifestoryState.load());
    assert.equal(initial.arkiv.length, 0, label + ': no preloaded history');
    let reachedReturn = false;
    let last = null;
    for (let n = 0; n < 90; n++) {
      const info = await page.evaluate(() => globalThis.CivicationLifestoryUI.getCurrentSceneInfo());
      const sceneId = info?.sceneId;
      assert.ok(sceneId, label + ': current scene must be playable');
      if (sceneId === 'retur_01_uten_kvittering') reachedReturn = true;
      if (['retur_03_lene_tar_saken', 'retur_04_lene_undersokte_varen'].includes(sceneId)) {
        const title = await page.locator('.civi-lifestory-scene .civi-lifestory-kicker').textContent();
        assert.match(title, /Fra Lene/, label + ': real manager owns her decisions');
      }
      const available = page.locator('[data-lifestory-scene="' + sceneId + '"][data-lifestory-choice]:not([disabled])');
      const selected = choices[sceneId];
      const button = selected
        ? page.locator('[data-lifestory-scene="' + sceneId + '"][data-lifestory-choice="' + selected + '"]:not([disabled])')
        : available.first();
      assert.equal(await button.count(), 1, label + ': a real enabled choice exists: ' + sceneId + '/' + selected);
      await button.scrollIntoViewIfNeeded();
      const rect = await button.boundingBox();
      assert.ok(rect && rect.width > 0 && rect.height > 0, label + ': choice has visible dimensions');
      assert.ok(rect.x >= -2 && rect.x + rect.width <= viewport.width + 2,
        label + ': no horizontal overflow at ' + sceneId);
      if (sceneId === 'retur_01_uten_kvittering' || sceneId === expected.finalScene) {
        await page.screenshot({ path: path.join(output, label + '-' + sceneId + '.png'), fullPage: true });
      }
      const before = await page.evaluate(() => globalThis.CivicationLifestoryState.load().arkiv.length);
      const choiceId = await button.getAttribute('data-lifestory-choice');
      await button.click({ timeout: 20000 });
      await page.waitForFunction(beforeCount => globalThis.CivicationLifestoryState.load().arkiv.length === beforeCount + 1,
        before, { timeout: 20000 });
      const current = await page.evaluate(() => globalThis.CivicationLifestoryState.load());
      assert.equal(current.arkiv.at(-1).sceneId, sceneId);
      assert.equal(current.arkiv.at(-1).valgId, choiceId);
      trace.push([sceneId, choiceId]);
      if (sceneId === expected.finalScene) { last = sceneId; break; }
      const popup = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]').first();
      if (await popup.isVisible().catch(() => false)) await popup.click({ timeout: 12000 });
      await page.locator('.civi-footer button[data-category="minDag"]').click({ timeout: 20000 });
    }
    assert.ok(reachedReturn, label + ': original return scene actually played');
    assert.equal(last, expected.finalScene);
    const finished = await page.evaluate(() => globalThis.CivicationLifestoryState.load());
    const flags = finished.tidligereValg;
    for (const [name, yes] of Object.entries(expected.flags)) {
      assert.equal(flags[name] === true, yes, label + ': fact ' + name + ' is recorded only when executed');
    }
    if (expected.status) assert.equal(finished.threadState.kunden_som_tror_du_bestemmer.status, expected.status);
    const snapshot = finished.arkiv.map(row => [row.sceneId, row.valgId]);
    await page.reload({ waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!globalThis.CivicationLifestoryUI?.getCurrentSceneInfo?.(),
      null, { timeout: 90000 });
    const reloaded = await page.evaluate(() => globalThis.CivicationLifestoryState.load());
    assert.deepEqual(reloaded.arkiv.map(row => [row.sceneId, row.valgId]), snapshot,
      label + ': reload cannot invent a return decision');
    for (const [name, yes] of Object.entries(expected.flags)) {
      assert.equal(reloaded.tidligereValg[name] === true, yes, label + ': durable ' + name);
    }
    assert.deepEqual(errors, [], label + ': browser runtime must stay error-free');
    await page.screenshot({ path: path.join(output, label + '-return-after-reload.png'), fullPage: true });
    return { label, viewport, last, flags: expected.flags, trace };
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
    const delegated = {
      apning_01_forste_okt: 'spor_amir',
      prisfeil_02_koen: 'rop_paa_amir',
      prisfeil_03_meld_avvik: 'send_notat',
      prisfeil_04_lene_bekrefter: 'amir_kontrollerer',
      prisfeil_05_amir_sjekker: 'registrer_amir'
    };
    results.push(await play(browser, 'ipad-landscape', { width: 1180, height: 820 }, delegated,
      { finalScene: 'prisfeil_05_amir_sjekker', verified: true, status: 'completed' }));
    const stockSelf = {
      varen_01_som_ikke_finnes: 'aerlig_om_lageret',
      varen_02_kontroller_beholdning: 'tell_selv',
      varen_03_avklar_kunden: 'gjennomfor_salget',
      varen_04_meld_telleavvik: 'send_tellenotat',
      varen_05_lene_bekrefter: 'avtal_egen_sjekk',
      varen_06_etterkontroll: 'sjekk_null_selv'
    };
    const stockAmir = {
      varen_01_som_ikke_finnes: 'aerlig_om_lageret',
      varen_02_kontroller_beholdning: 'amir_teller',
      varen_02_amir_teller: 'registrer_amirs_telling',
      varen_03_avklar_kunden: 'la_lene_gjennomfore',
      varen_04_meld_telleavvik: 'send_tellenotat',
      varen_05_lene_bekrefter: 'be_amir_folge_opp',
      varen_06_etterkontroll: 'be_amir_etterkontroll',
      varen_07_amir_etterkontroll: 'registrer_amir'
    };
    const stockUnfinished = {
      varen_01_som_ikke_finnes: 'lov_i_morgen',
      varen_02_rett_ubegrunnet_lovnad: 'rett_beskjeden',
      varen_02_kontroller_beholdning: 'tell_selv',
      varen_03_avklar_kunden: 'gjennomfor_salget',
      varen_04_meld_telleavvik: 'send_tellenotat',
      varen_05_lene_bekrefter: 'avtal_egen_sjekk',
      varen_06_etterkontroll: 'ikke_sjekket'
    };
    results.push(await playStock(browser, 'stock-mobile-portrait', { width: 390, height: 844 }, stockSelf,
      { finalScene: 'varen_06_etterkontroll', verified: true, status: 'completed' }));
    results.push(await playStock(browser, 'stock-ipad-portrait', { width: 820, height: 1180 }, stockAmir,
      { finalScene: 'varen_07_amir_etterkontroll', verified: true, status: 'completed', amir: true }));
    results.push(await playStock(browser, 'stock-ipad-landscape', { width: 1180, height: 820 }, stockUnfinished,
      { finalScene: 'varen_06_etterkontroll', verified: false, status: 'escalated' }));
    const legalComplaint = {
      retur_01_uten_kvittering: 'hold_regelen',
      retur_02_hva_er_grunnen: 'be_om_ordrebekreftelse',
      retur_03_lene_tar_saken: 'overlever_varen',
      retur_04_lene_undersokte_varen: 'utlever_ny_vare'
    };
    const awaitingProof = {
      retur_01_uten_kvittering: 'hent_lene',
      retur_02_hva_er_grunnen: 'be_om_tid_til_bevis'
    };
    const unauthorizedRefund = {
      retur_01_uten_kvittering: 'boy_regelen'
    };
    results.push(await playReturn(browser, 'return-mobile-portrait', { width: 390, height: 844 }, legalComplaint,
      { finalScene: 'retur_04_lene_undersokte_varen', status: 'active',
        flags: { retur_kjop_dokumentert: true, retur_lene_overtatt: true,
          retur_mangel_bekreftet: true, retur_omlevering_utfort: true } }));
    results.push(await playReturn(browser, 'return-ipad-portrait', { width: 820, height: 1180 }, awaitingProof,
      { finalScene: 'retur_02_hva_er_grunnen', status: 'escalated',
        flags: { retur_kjopsbevis_venter: true, retur_kjop_dokumentert: false,
          retur_lene_overtatt: false, retur_omlevering_utfort: false } }));
    results.push(await playReturn(browser, 'return-ipad-landscape', { width: 1180, height: 820 }, unauthorizedRefund,
      { finalScene: 'retur_01_uten_kvittering', status: 'escalated',
        flags: { retur_utbetaling_uten_bilag: true, retur_avvik_meldt: false,
          retur_avstemming_bekreftet: false } }));
    console.log('PASS: ekspeditør price, stock and return/complaint Life Story on mobile and iPad', JSON.stringify(results));
  } finally {
    writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
})().catch(error => { console.error(error?.stack || error); process.exitCode = 1; });
