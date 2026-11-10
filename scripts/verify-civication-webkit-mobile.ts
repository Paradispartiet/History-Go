// Safari-engine approximation for Min dag and the mobile map.
// Headless Linux WebKit is NOT a physical iPhone/Safari FPS certification.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { verifyChoiceRefreshFocus, verifySummaryInboxFocus } from './verify-civication-visual-qa-browser.js';

export default async function verifyCivicationWebkitMobile(browser: any, origin: string, outputDir: string) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error: Error) => errors.push(error.message));
  const capture = (name: string) => page.screenshot({
    path: join(outputDir, name), fullPage: false, animations: 'disabled'
  });
  try {
    await page.goto(origin + '/Civication.html', { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => {
      const doc = (globalThis as any).document;
      return !!(globalThis as any).CivicationWorldMood?.getPeriod
        && !!doc.querySelector('#civiLifestoryPanel .civi-lifestory-scene')
        && !!doc.querySelector('#civiLifestoryPanel .civi-lifestory-choice:not(:disabled):not([data-lifestory-navigates])');
    }, null, { timeout: 90000 });

    await page.locator('#civiLifestorySection h2').scrollIntoViewIfNeeded();
    const initial = await page.evaluate(() => {
      const doc = (globalThis as any).document;
      const header = doc.querySelector('.civi-day-miniature-header')?.getBoundingClientRect();
      const art = doc.querySelector('.civi-day-miniature-art')?.getBoundingClientRect();
      const label = doc.querySelector('.civi-day-miniature-label')?.getBoundingClientRect();
      const section = doc.querySelector('#civiLifestorySection')?.getBoundingClientRect();
      const choices = Array.from(doc.querySelectorAll('#civiLifestoryPanel .civi-lifestory-choice')) as any[];
      return {
        phase: doc.querySelector('.civi-day-miniature-phase')?.textContent?.trim() || '',
        headerFits: !!header && !!art && !!label && art.right <= header.right + 2 && label.right <= art.left + 2,
        artWidth: art?.width || 0,
        sectionFits: !!section && section.left >= -1 && section.right <= 391,
        choiceCount: choices.length,
        choiceSizes: choices.map(button => {
          const r = button.getBoundingClientRect();
          return { width: r.width, height: r.height, left: r.left, right: r.right };
        })
      };
    });
    assert.match(initial.phase, /^Fase: \S/, 'WebKit uses the canonical phase label');
    const phasePosition = await page.evaluate(() => {
      const app = globalThis as any;
      const phase = app.CivicationCalendar?.getPhase?.();
      const phases = app.CivicationCalendar?.DAY_PHASES;
      return { index: Array.isArray(phases) ? phases.indexOf(phase) + 1 : 0,
        total: Array.isArray(phases) ? phases.length : 0 };
    });
    assert.ok(phasePosition.index > 0 && phasePosition.total === 8
      && initial.phase.endsWith(' · ' + phasePosition.index + ' av ' + phasePosition.total),
      'WebKit Min dag phase index matches the canonical eight-phase calendar');
    assert.ok(initial.headerFits && initial.artWidth >= 80, 'Min dag illustration fits in WebKit');
    assert.ok(initial.sectionFits, 'Min dag fits the 390px WebKit mobile width');
    assert.ok(initial.choiceCount > 0 && initial.choiceSizes.every((c: any) =>
      c.width > 100 && c.height >= 44 && c.left >= -1 && c.right <= 391),
      'story decisions have reachable touch-sized controls in WebKit');
    await capture('min-dag-webkit-mobile-top.png');

    // The decision button is replaced on render; verify the keyboard focus
    // lands on the actual consequence instead of being dropped on the body.
    const localChoice = page.locator(
      '#civiLifestoryPanel .civi-lifestory-choice:not(:disabled):not([data-lifestory-navigates])'
    ).first();
    await localChoice.focus();
    const choiceRefreshFocus = await verifyChoiceRefreshFocus(page);
    await localChoice.press('Enter');
    await page.waitForFunction(() =>
      !!(globalThis as any).document.querySelector('#civiLifestoryPanel .civi-lifestory-konsekvens'),
      null, { timeout: 15000 });
    const afterChoice = await page.evaluate(() => {
      const doc = (globalThis as any).document;
      const outcome = doc.querySelector('#civiLifestoryPanel .civi-lifestory-konsekvens');
      const rect = outcome.getBoundingClientRect();
      return {
        focusInsideResult: outcome.contains(doc.activeElement),
        resultTop: Math.round(rect.top),
        visibleInViewport: rect.bottom > 0 && rect.top < (globalThis as any).innerHeight,
        heading: outcome.textContent?.trim().slice(0, 120) || ''
      };
    });
    assert.ok(afterChoice.focusInsideResult && afterChoice.visibleInViewport,
      'WebKit reveals and focuses the saved consequence after keyboard choice');
    await capture('min-dag-webkit-mobile-after-choice.png');
    const summaryInboxFocus = await verifySummaryInboxFocus(page);

    await page.locator('#btnCiviMap').click();
    await page.waitForFunction(() =>
      (globalThis as any).document.body.classList.contains('civi-mapmode'),
      null, { timeout: 15000 });
    await page.waitForTimeout(600);
    const map = await page.evaluate(() => {
      const app = globalThis as any;
      const rect = app.document.querySelector('#civiMapWorld')?.getBoundingClientRect();
      const state = app.CivicationSystemMap?.getPresentationState?.();
      return {
        type: app.CivicationThreeMap?.isActive?.() ? 'webgl'
          : app.CivicationCanvasMap?.isActive?.() ? 'canvas' : 'svg',
        width: rect?.width || 0,
        height: rect?.height || 0,
        hudMinimized: state?.hudMinimized,
        panelMinimized: state?.panelMinimized
      };
    });
    assert.ok(map.width > 200 && map.height > 200, 'WebKit shows a real map viewport');
    assert.ok(map.hudMinimized && map.panelMinimized, 'WebKit has compact mobile map panels');
    await capture('map-webkit-mobile.png');
    assert.deepEqual(errors, [], 'no uncaught WebKit page errors');
    return {
      engine: 'Playwright WebKit on Linux (not physical iPhone Safari)',
      viewport: { width: 390, height: 844 },
      initial, choiceRefreshFocus, afterChoice, summaryInboxFocus, map,
      screenshots: [
        'min-dag-webkit-mobile-top.png',
        'min-dag-webkit-mobile-after-choice.png',
        'map-webkit-mobile.png'
      ]
    };
  } catch (error) {
    await capture('min-dag-webkit-mobile-failure.png').catch(() => {});
    throw error;
  } finally {
    await context.close();
  }
}


