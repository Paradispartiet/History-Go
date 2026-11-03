#!/usr/bin/env node
'use strict';
// Real Chromium viewport acceptance for the existing Symposium reader.
// Historic choices are produced by the real canonical Life Story runner,
// not fabricated future appointments or a parallel game state.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const Content = require(path.join(root, 'js/Civication/lifestory/lifestoryContent.js'));
const State = require(path.join(root, 'js/Civication/lifestory/lifestoryState.js'));
const Runner = require(path.join(root, 'js/Civication/lifestory/lifestoryRunner.js'));
const manifest = read('data/Civication/lifestory/manifest.json');
function roleContent(id) {
  const role = manifest.roles[id];
  assert.ok(role, id);
  return Content.buildContent({
    role: read(role.role),
    phaseDefinitions: read(manifest.shared.phaseDefinitions),
    roleThreads: read(role.threads),
    roleScenes: read(role.scenes),
    lifeThreads: read(manifest.life.threads),
    lifeScenes: read(manifest.life.scenes)
  });
}
const cleaner = roleContent('renholder');
const planner = roleContent('arealplanlegger');
const original = State.createInitialState(cleaner);
for (let i = 0; i < 2; i += 1) {
  const next = Runner.selectNextScene(original, cleaner);
  assert.ok(next?.valg?.length, 'må spille en ekte scene');
  Runner.applyChoice(original, cleaner, next.id, next.valg[0].id);
}
const firstRecordedChoice = original.arkiv[0];
const switched = State.selectRole(JSON.parse(JSON.stringify(original)), planner);
assert.equal(switched.rolle, 'arealplanlegger');
assert.equal(Runner.getSymposium(switched, planner).tidligereRoller.length, 1);
const save = JSON.stringify(switched);
const reportDir = path.join(root, 'reports/civication-symposium-browser');
fs.mkdirSync(reportDir, { recursive: true });
const origin = 'http://127.0.0.1:4177';

async function main() {
  const server = spawn('python3', ['-m', 'http.server', '4177', '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
  let browser;
  try {
    const until = Date.now() + 15000;
    while (true) {
      if (server.exitCode != null) throw Error('HTTP server ended');
      try { if ((await fetch(origin + '/Civication.html')).ok) break; } catch {}
      if (Date.now() > until) throw Error('Local HTTP server did not start');
      await new Promise(resolve => setTimeout(resolve, 125));
    }
    browser = await chromium.launch({ headless: true });
    const viewports = [
      ['mobile', 390, 844], ['ipad-portrait', 820, 1180],
      ['ipad-landscape', 1180, 820], ['desktop', 1440, 900]
    ];
    const results = [];
    for (const [name, width, height] of viewports) {
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
      await context.addInitScript(data => localStorage.setItem('civication_lifestory_v1', data), save);
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      try {
        await page.goto(origin + '/Civication.html?lifestoryRole=arealplanlegger', { waitUntil: 'load' });
        await page.waitForFunction(() => {
          const w = globalThis;
          return w.CivicationLifestoryState?.load?.()?.rolle === 'arealplanlegger'
            && w.CivicationLifestoryUI?.getCurrentSceneInfo?.();
        }, null, { timeout: 20000 });
        // Min dag is the initial page; touching its footer button reopens a
        // popup and hides this already-visible panel. Wait for boot to settle
        // instead of toggling the tab just to make the test pass.
        await page.waitForFunction(() => document.body.classList.contains('civi-mini-mode'),
          null, { timeout: 20000 });
        const history = page.locator('[data-lifestory-symposium] summary').first();
        await history.waitFor({ state: 'attached', timeout: 20000 });
        // The book follows the playable scene below the fold in the real
        // scrollable Min dag panel; scroll there like a player would.
        await history.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await history.waitFor({ state: 'visible', timeout: 20000 });
        await history.click();
        const book = page.locator('[data-lifestory-symposium]').first();
        await book.locator('h4').first().waitFor({ state: 'visible' });
        const storyText = await book.innerText();
        assert.match(storyText, /Tidligere roller/);
        assert.match(storyText, /Rollebytter/);
        assert.ok(storyText.includes(firstRecordedChoice.valgTekst),
          name + ': previously played choice is visible in history');
        assert.match(storyText, /Ingen møter avtalt ennå/);
        const geometry = await book.evaluate(el => {
          const bounds = el.getBoundingClientRect();
          const h = el.querySelector('h4');
          const textStyles = h ? getComputedStyle(h) : null;
          return { width: bounds.width, left: bounds.left, right: bounds.right,
            scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
            headingFontPx: textStyles ? parseFloat(textStyles.fontSize) : 0 };
        });
        assert.ok(geometry.left >= -3 && geometry.right <= width + 3,
          name + ': Symposium outside viewport ' + JSON.stringify(geometry));
        assert.ok(geometry.scrollWidth <= geometry.clientWidth + 4,
          name + ': horizontal overflow in Symposium ' + JSON.stringify(geometry));
        assert.ok(geometry.headingFontPx >= 13, name + ': history heading too small');
        const loaded = await page.evaluate(() => globalThis.CivicationLifestoryState.load());
        assert.deepEqual(loaded.arkiv.map(x => x.sceneId), switched.arkiv.map(x => x.sceneId),
          name + ': opening history is read-only');
        await book.screenshot({ path: path.join(reportDir, name + '.png') });
        await page.reload({ waitUntil: 'load' });
        await page.waitForFunction(() => !!globalThis.CivicationLifestoryState?.load?.());
        const afterReload = await page.evaluate(() => globalThis.CivicationLifestoryState.load());
        assert.equal(afterReload.rolleBytter.length, switched.rolleBytter.length,
          name + ': role changes survive real browser reload');
        assert.ok(afterReload.rolleTilstander.renholder?.arkiv.length >= 2);
        results.push({ viewport: name, width, height, geometry, pageErrors });
      } finally {
        await context.close();
      }
    }
    fs.writeFileSync(path.join(reportDir, 'report.json'), JSON.stringify({
      rolesCovered: Object.keys(manifest.roles).length,
      previouslyPlayedScene: firstRecordedChoice.sceneId, results
    }, null, 2));
    console.log('Civication Symposium Chromium viewports OK:', JSON.stringify(results));
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
