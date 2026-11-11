// Exercise actual UI choices in a fresh dev-role fixture; never inject progress.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
const output = 'reports/ekspeditor-browser';
await mkdir(output, { recursive: true });
const origin = 'http://127.0.0.1:8765';
const server = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { stdio: 'ignore' });
let browser;
const results = [];
try {
  for (let n = 0; ; n++) {
    try { if ((await fetch(origin)).ok) break; } catch {}
    if (n > 80) throw new Error('HTTP server did not start');
    await new Promise(r => setTimeout(r, 100));
  }
  browser = await chromium.launch();
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }]) {
    for (const delegated of [false, true]) {
      const name = `${viewport.width}x${viewport.height}-${delegated ? 'amir' : 'egen'}`;
      const context = await browser.newContext({ viewport, hasTouch: true, isMobile: viewport.width === 390 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(origin + '/Civication.html?lifestoryRole=ekspeditor', { waitUntil: 'load' });
      const ready = () => page.waitForFunction(() => !!window.CivicationLifestoryUI?.getCurrentSceneInfo?.(), null, { timeout: 90000 });
      await ready();
      const state = () => page.evaluate(() => window.CivicationLifestoryState.load());
      const initial = await state();
      assert.equal(initial.rolle, 'ekspeditor');
      assert.equal(initial.arkiv.length, 0);
      const wanted = {
        apning_01_forste_okt: 'aapne_raskt',
        prisfeil_02_koen: delegated ? 'rop_paa_amir' : 'rett_synlig',
        prisavvik_d1_meld: 'kontroller_og_meld',
        prisavvik_d1_mottak: delegated ? 'amir_kontrollerer' : 'egen_kontroll',
        prisavvik_d1_kontroll: 'kontroller_retting',
        prisavvik_d1_amir: 'registrer_resultat'
      };
      const trace = [];
      for (let n = 0; n < 40; n++) {
        const id = await page.evaluate(() => window.CivicationLifestoryUI.getCurrentSceneInfo()?.sceneId);
        assert.ok(id, 'visible scene');
        const popup = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]').first();
        if (await popup.isVisible()) await popup.click();
        let choice = page.locator(`[data-lifestory-scene="${id}"][data-lifestory-choice]:not([disabled])`);
        if (wanted[id]) choice = page.locator(`[data-lifestory-scene="${id}"][data-lifestory-choice="${wanted[id]}"]:not([disabled])`);
        else {
          const ordinary = choice.filter({ hasNot: page.locator('.civi-lifestory-action-hint') });
          choice = (await ordinary.count() ? ordinary : choice).first();
        }
        const choiceId = await choice.getAttribute('data-lifestory-choice');
        const before = await state();
        if (id.startsWith('pris')) await page.screenshot({ path: `${output}/${name}-${id}.png`, fullPage: true });
        await choice.click({ timeout: 20000 });
        const after = await state();
        assert.equal(after.arkiv.length, before.arkiv.length + 1);
        assert.equal(after.arkiv.at(-1).sceneId, id);
        assert.equal(after.arkiv.at(-1).valgId, choiceId);
        trace.push([id, choiceId]);
        const close = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]').first();
        if (await close.isVisible()) await close.click();
        await page.locator('.civi-footer button[data-category="minDag"]').click();
        if (id === 'prisavvik_d1_meld') assert(!after.tidligereValg.prisavvik_overtatt, 'report is not receipt');
        if (id === 'prisavvik_d1_mottak') {
          assert(after.tidligereValg.prisavvik_overtatt);
          assert(!after.tidligereValg.prisavvik_etterkontrollert);
          await page.reload({ waitUntil: 'load' });
          await ready();
          const restored = await state();
          assert.deepEqual(restored.arkiv, after.arkiv, 'reload retains actual history');
          assert.equal(restored.tidligereValg.prisavvik_overtatt, true);
          assert(!restored.tidligereValg.prisavvik_etterkontrollert);
        }
        if (after.tidligereValg.prisavvik_etterkontrollert) break;
      }
      const final = await state();
      assert(final.tidligereValg.prisavvik_etterkontrollert, 'real choices reach verified correction');
      assert.equal(!!final.tidligereValg.prisavvik_etterkontroll_av_amir, delegated);
      for (const disclosure of ['history', 'full-history']) {
        const details = page.locator(`[data-lifestory-disclosure="${disclosure}"]`).first();
        assert.equal(await details.count(), 1, 'rendered history exists');
        if (!(await details.evaluate(el => el.open))) await details.locator(':scope > summary').click();
      }
      const history = page.locator('[data-lifestory-symposium]').first();
      const text = await history.innerText();
      for (const row of final.arkiv.filter(r => r.sceneId.startsWith('pris'))) {
        assert(text.includes(row.valgTekst), 'Symposium shows actual choice: ' + row.sceneId);
        assert(text.includes(row.konsekvensTekst), 'Symposium shows actual consequence: ' + row.sceneId);
      }
      await history.scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/${name}-symposium.png`, fullPage: true });
      assert.deepEqual(errors, [], 'no browser runtime errors');
      results.push({ name, trace, archived: final.arkiv.length, reloadVerified: true, visibleHistoryVerified: true });
      await context.close();
    }
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  if (browser) await browser.close();
  server.kill();
}
