// Visual evidence for Civication Min dag + map. Headless mobile viewport does
// not replace a physical iPhone/Safari review, but stops smoke passing without
// screenshots of the actual views that this PR changes.
import assert from 'node:assert/strict';
import { join } from 'node:path';

export default async function verifyCivicationVisualQa(browser: any, origin: string, outputDir: string) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  const pageErrors: string[] = [];
  page.on('pageerror', (error: Error) => pageErrors.push(error.message));

  const capture = async (filename: string) =>
    page.screenshot({ path: join(outputDir, filename), fullPage: false, animations: 'disabled' });

  try {
    await page.goto(origin + '/Civication.html', { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => {
      const app = globalThis as any;
      return !!app.CivicationWorldMood?.getPeriod
        && !!app.CivicationLifestoryUI?.getCurrentSceneInfo
        && !!app.document.querySelector('.civi-day-miniature-phase')
        && !!app.document.querySelector('#civiLifestoryPanel .civi-lifestory-scene');
    }, null, { timeout: 90000 });

    await page.locator('#civiLifestorySection h2').scrollIntoViewIfNeeded();
    const minDag = await page.evaluate(() => {
      const doc = (globalThis as any).document;
      const header = doc.querySelector('.civi-day-miniature-header');
      const label = doc.querySelector('.civi-day-miniature-label');
      const art = doc.querySelector('.civi-day-miniature-art');
      const phase = doc.querySelector('.civi-day-miniature-phase');
      const scene = doc.querySelector('#civiLifestoryPanel .civi-lifestory-scene');
      const h = header?.getBoundingClientRect();
      const l = label?.getBoundingClientRect();
      const a = art?.getBoundingClientRect();
      return {
        period: doc.querySelector('.civi-day-miniature-period')?.textContent?.trim() || '',
        phase: phase?.textContent?.trim() || '',
        headerFits: !!h && !!l && !!a && a.right <= h.right + 2 && l.right <= a.left + 2,
        artSize: a ? { width: a.width, height: a.height } : null,
        sceneVisible: !!scene && (globalThis as any).getComputedStyle(scene).display !== 'none',
        choiceCount: doc.querySelectorAll('#civiLifestoryPanel [data-lifestory-choice]').length
      };
    });
    assert.match(minDag.phase, /^Fase: \S/, 'Min dag shows the real game phase');
    assert.ok(minDag.headerFits, 'Min dag header and miniature do not overlap at 390px');
    assert.ok(minDag.artSize?.width && minDag.artSize?.height, 'miniature illustration has dimensions');
    assert.ok(minDag.sceneVisible, 'Min dag has an active scene or shell story');
    await capture('min-dag-mobile-top.png');

    // In the initial mobile viewport the last decision may be below the fold.
    // Verify it is reachable through normal scrolling and that every button
    // remains a sufficiently large, readable touch target (do not auto-choose).
    const choiceSelector = '#civiLifestoryPanel .civi-lifestory-choice';
    const choiceButtons = page.locator(choiceSelector);
    const choiceCount = await choiceButtons.count();
    assert.ok(choiceCount > 0, 'Min dag exposes at least one decision');
    const choiceLayout = await page.evaluate(() => {
      const doc = (globalThis as any).document;
      const buttons = Array.from(doc.querySelectorAll('#civiLifestoryPanel .civi-lifestory-choice')) as any[];
      return buttons.map(button => {
        const rect = button.getBoundingClientRect();
        const style = (globalThis as any).getComputedStyle(button);
        return { width: rect.width, height: rect.height, left: rect.left, right: rect.right,
          enabled: !button.disabled, color: style.color, label: button.textContent?.trim() || '' };
      });
    });
    assert.equal(choiceLayout.length, choiceCount);
    assert.ok(choiceLayout.some((c: any) => c.enabled), 'at least one Min dag choice is available');
    assert.ok(choiceLayout.every((c: any) => c.width >= 100 && c.height >= 44
      && c.left >= -1 && c.right <= 391), 'all choices fit the phone width and meet touch size');
    const lastChoice = choiceButtons.last();
    await lastChoice.scrollIntoViewIfNeeded();
    assert.ok(await lastChoice.isVisible(), 'the final Min dag choice is reachable by scrolling');
    await capture('min-dag-mobile-choices.png');

    await page.locator('#btnCiviMap').click();
    await page.waitForFunction(() => (globalThis as any).document.body.classList.contains('civi-mapmode'), null, { timeout: 15000 });
    await page.waitForTimeout(600);

    const mapType = await page.evaluate(() => {
      const app = globalThis as any;
      if (app.CivicationThreeMap?.isActive?.()) return 'webgl';
      if (app.CivicationCanvasMap?.isActive?.()) return 'canvas';
      return 'svg';
    });

    // The previous capture showed both system cards hiding most of the
    // phone viewport. Compact default must be true in actual browser UI,
    // not just in the source-level Node test.
    const overlay = await page.evaluate(() =>
      (globalThis as any).CivicationSystemMap?.getPresentationState?.() || null);
    assert.ok(overlay?.hudMinimized && overlay?.panelMinimized,
      'mobile map must start with system HUD and zone panel minimized');
    const obstruction = await page.evaluate(() => {
      const doc = (globalThis as any).document;
      const map = doc.querySelector('#civiMapWorld').getBoundingClientRect();
      const hud = doc.querySelector('.civi-system-hud').getBoundingClientRect();
      const zone = doc.querySelector('.civi-system-panel').getBoundingClientRect();
      const visibleArea = (rect: any) => Math.max(0, rect.width) * Math.max(0, rect.height);
      const hudBtn = doc.querySelector('[data-civi-minimize-hud]');
      const zoneBtn = doc.querySelector('[data-civi-minimize-panel]');
      const hudRect = hudBtn?.getBoundingClientRect();
      const zoneRect = zoneBtn?.getBoundingClientRect();
      return {
        fraction: (visibleArea(hud) + visibleArea(zone)) / visibleArea(map),
        hudAria: hudBtn?.getAttribute('aria-label'),
        zoneAria: zoneBtn?.getAttribute('aria-label'),
        hudTouchWidth: hudRect?.width || 0,
        zoneTouchWidth: zoneRect?.width || 0,
        hidden: (globalThis as any).getComputedStyle(doc.querySelector('.civi-system-hud')).display === 'none'
      };
    });
    assert.ok(!obstruction.hidden && obstruction.fraction < 0.20,
      'compact map panels must occupy less than 20% of the map viewport');
    assert.equal(obstruction.hudAria, 'Vis kartstatus');
    assert.equal(obstruction.zoneAria, 'Vis sonepanel');
    assert.ok(obstruction.hudTouchWidth >= 40 && obstruction.zoneTouchWidth >= 40,
      'map panel controls must retain touch-friendly sizes');

    const captureMap = async (name: string) => {
      await page.waitForTimeout(300);
      await capture(name);
    };

    const map = await page.evaluate(() => {
      const host = (globalThis as any).document.querySelector('#civiMapWorld');
      const rect = host?.getBoundingClientRect();
      return { visible: !!rect && rect.width > 200 && rect.height > 200,
        width: rect?.width || 0, height: rect?.height || 0 };
    });
    assert.ok(map.visible, 'map has a visible viewport on mobile');

    const result: any = { viewport: { width: 390, height: 844 }, minDag, choiceLayout, mapType, map, overlay, obstruction, screenshots: [
      'min-dag-mobile-top.png', 'min-dag-mobile-choices.png',
      'map-mobile-city.png', 'map-mobile-overview.png', 'map-mobile-close.png'
    ] };

    if (mapType === 'webgl') {
      result.city = await page.evaluate(() => (globalThis as any).CivicationThreeMap.getSceneStats());
      assert.ok(result.city.microWorldObjects > 0, '3D miniature world was created');
    }
    await captureMap('map-mobile-city.png');
    if (mapType === 'webgl') {
      // Sample after the frame has been drawn; the earlier scene snapshot
      // establishes state, while rendererInfo is last-frame telemetry.
      result.cityRendererInfo = await page.evaluate(() =>
        (globalThis as any).CivicationThreeMap.getSceneStats().rendererInfo);
    }

    await page.evaluate(() => {
      const app = globalThis as any;
      const mapApi = app.CivicationThreeMap?.isActive?.() ? app.CivicationThreeMap
        : app.CivicationCanvasMap?.isActive?.() ? app.CivicationCanvasMap : null;
      mapApi?.overview?.();
    });
    await captureMap('map-mobile-overview.png');

    await page.evaluate(() => {
      const app = globalThis as any;
      const mapApi = app.CivicationThreeMap?.isActive?.() ? app.CivicationThreeMap
        : app.CivicationCanvasMap?.isActive?.() ? app.CivicationCanvasMap : null;
      mapApi?.reset?.();
      // Real near-detail tier begins at zoom 2.1 in Three.js.
      if (mapApi?.getZoom && mapApi?.zoomIn) {
        for (let i = 0; i < 7 && mapApi.getZoom() < 2.3; i++) mapApi.zoomIn();
      }
    });
    if (mapType === 'webgl') {
      result.close = await page.evaluate(() => (globalThis as any).CivicationThreeMap.getSceneStats());
      assert.ok(result.close.zoom >= 2.1, '3D map reached near-detail tier');
      assert.ok(result.close.nearBuildingEntrances > 0, 'close-up building entrances are in the scene');
      assert.ok(result.close.nearRoadCrossings >= 2, 'close-up street crossings are in the scene');
      assert.ok(result.close.microWorldVisibleObjects > result.city.microWorldVisibleObjects,
        'more miniature objects are visible when zoomed in');
    }
    await captureMap('map-mobile-close.png');
    if (mapType === 'webgl') {
      result.closeRendererInfo = await page.evaluate(() =>
        (globalThis as any).CivicationThreeMap.getSceneStats().rendererInfo);
      assert.ok(result.cityRendererInfo && result.closeRendererInfo,
        'WebGL draw-call and memory telemetry is available for visual QA');
    }
    // An isolated second page verifies the actual choice-to-consequence
    // transition. Keep the original page's city/zoom screenshots unchanged,
    // and never play a choice that navigates away from «Min dag».
    const decisionPage = await context.newPage();
    try {
      decisionPage.on('pageerror', (error: Error) => pageErrors.push(error.message));
      await decisionPage.goto(origin + '/Civication.html', { waitUntil: 'load', timeout: 90000 });
      const localChoice = decisionPage.locator(
        '#civiLifestoryPanel .civi-lifestory-choice:not(:disabled):not([data-lifestory-navigates])'
      ).first();
      await localChoice.waitFor({ state: 'visible', timeout: 90000 });
      await localChoice.focus();
      await localChoice.press('Enter');
      await decisionPage.waitForFunction(() => {
        const doc = (globalThis as any).document;
        return !!doc.querySelector('#civiLifestoryPanel .civi-lifestory-konsekvens');
      }, null, { timeout: 15000 });
      const afterChoice = await decisionPage.evaluate(() => {
        const doc = (globalThis as any).document;
        const outcome = doc.querySelector('#civiLifestoryPanel .civi-lifestory-konsekvens');
        const rect = outcome.getBoundingClientRect();
        return {
          text: outcome.textContent?.trim().slice(0, 180) || '',
          focusInsideResult: outcome.contains(doc.activeElement),
          resultTop: Math.round(rect.top),
          viewportHeight: (globalThis as any).innerHeight,
          selectedButtonGone: !doc.querySelector('#civiLifestoryPanel .civi-lifestory-choice:focus')
        };
      });
      assert.ok(afterChoice.focusInsideResult,
        'keyboard selection moves focus from replaced button to the consequence');
      assert.ok(afterChoice.resultTop >= 0 && afterChoice.resultTop < afterChoice.viewportHeight,
        'the decision consequence appears inside the phone viewport');
      assert.ok(afterChoice.selectedButtonGone, 'the removed decision button is no longer focused');
      await decisionPage.screenshot({ path: join(outputDir, 'min-dag-mobile-after-choice.png'),
        fullPage: false, animations: 'disabled' });
      result.afterChoice = afterChoice;
      result.screenshots.push('min-dag-mobile-after-choice.png');
    } finally {
      await decisionPage.close();
    }
    assert.deepEqual(pageErrors, [], 'no browser JavaScript errors during visual QA');
    // Headless WebGL may be unavailable in CI. Keep fallback evidence clearly
    // labeled rather than claiming a 3D/mobile approval on a Canvas screenshot.
    return result;
  } catch (error) {
    await capture('civication-mobile-visual-qa-failure.png').catch(() => {});
    throw error;
  } finally {
    await context.close();
  }
}
