// Visual evidence for Civication Min dag + map. Headless mobile viewport does
// not replace a physical iPhone/Safari review, but stops smoke passing without
// screenshots of the actual views that this PR changes.
import assert from 'node:assert/strict';
import { join } from 'node:path';

export async function verifyChoiceRefreshFocus(page: any, outputDir?: string) {
  const result = await page.evaluate(() => {
    const app = globalThis as any;
    const doc = app.document;
    const before = doc.activeElement;
    if (!before?.matches?.('#civiLifestoryPanel [data-lifestory-choice]')) return null;
    const sceneId = before.getAttribute('data-lifestory-scene');
    const choiceId = before.getAttribute('data-lifestory-choice');
    const day = app.CivicationCalendar.getClock().dayIndex;
    const storyDay = app.CivicationLifestoryState.load().dag;
    const choices = JSON.stringify(app.CivicationLifestoryState.load().tidligereValg);
    const scrollY = app.scrollY;
    app.dispatchEvent(new Event('updateProfile'));
    const after = doc.activeElement;
    return {
      sceneId, choiceId, scrollBefore: scrollY,
      replaced: before !== after,
      sameChoice: !!after?.matches?.('#civiLifestoryPanel [data-lifestory-choice]')
        && after.getAttribute('data-lifestory-scene') === sceneId
        && after.getAttribute('data-lifestory-choice') === choiceId,
      scrollUnchanged: Math.abs(app.scrollY - scrollY) <= 1,
      dayUnchanged: app.CivicationCalendar.getClock().dayIndex === day,
      storyDayUnchanged: app.CivicationLifestoryState.load().dag === storyDay,
      choicesUnchanged: JSON.stringify(app.CivicationLifestoryState.load().tidligereValg) === choices
    };
  });
  assert.ok(result, 'background refresh starts with a focused real choice');
  for (const key of ['replaced', 'sameChoice', 'scrollUnchanged', 'dayUnchanged', 'storyDayUnchanged', 'choicesUnchanged']) {
    assert.equal(result[key], true, 'choice profile refresh browser acceptance: ' + key);
  }
  // The mini-section controller schedules its final profile refresh at 520ms.
  // Check the settled view as well as the synchronous event handler.
  await page.waitForTimeout(600);
  const settled = await page.evaluate((expected: any) => {
    const app = globalThis as any;
    const active = app.document.activeElement;
    return { settledFocus: !!active?.matches?.('#civiLifestoryPanel [data-lifestory-choice]')
      && active.getAttribute('data-lifestory-scene') === expected.sceneId
      && active.getAttribute('data-lifestory-choice') === expected.choiceId,
      settledScroll: Math.abs(app.scrollY - expected.scrollBefore) <= 1,
      activeTag: active?.tagName || '', activeId: active?.id || '',
      activeScene: active?.getAttribute?.('data-lifestory-scene'),
      activeChoice: active?.getAttribute?.('data-lifestory-choice'),
      scrollBefore: expected.scrollBefore, scrollAfter: app.scrollY };
  }, result);
  if ((!settled.settledFocus || !settled.settledScroll) && outputDir) {
    await page.screenshot({ path: join(outputDir, 'min-dag-profile-refresh-failure.png'),
      fullPage: false, animations: 'disabled' }).catch(() => {});
  }
  assert.ok(settled.settledFocus, 'scheduled profile refresh focus: ' + JSON.stringify({ ...result, ...settled }));
  assert.ok(settled.settledScroll, 'scheduled profile refresh scroll: ' + JSON.stringify({ ...result, ...settled }));
  Object.assign(result, settled);
  return result;
}

// Real browser DOM/focus acceptance with a controlled, read-only inbox hint.
// This verifies presentation, not delivery/answering of an actual queued mail.
export async function verifySummaryInboxFocus(page: any) {
  for (let step = 0; step < 30; step++) {
    if (await page.locator('#civiLifestoryPanel .civi-lifestory-summary').count()) break;
    const choice = page.locator('#civiLifestoryPanel .civi-lifestory-choice:not(:disabled):not([data-lifestory-navigates])').first();
    assert.ok(await choice.count(), 'the first day remains playable through local decisions');
    await choice.focus();
    await choice.press('Enter');
  }
  await page.locator('#civiLifestoryPanel .civi-lifestory-summary').waitFor({ state: 'visible', timeout: 15000 });
  const result = await page.evaluate(() => {
    const app = globalThis as any;
    const doc = app.document;
    const selector = app.CivicationNextActionSelector;
    const inbox = app.CivicationNextActionUI;
    const day = app.CivicationCalendar.getClock().dayIndex;
    const storyDay = app.CivicationLifestoryState.load().dag;
    const refresh = () => app.dispatchEvent(new Event('civi:inboxChanged'));
    const summary = () => doc.querySelector('#civiLifestoryPanel .civi-lifestory-summary');
    const recap = () => summary().querySelector('details[data-lifestory-disclosure="day-recap"]');
    const heading = () => summary().querySelector('h3');
    let pending = false;
    try {
      app.CivicationNextActionSelector = { getCurrent: () => pending ? { id: 'qa-pending-mail', canStartNewDay: false } : null };
      app.CivicationNextActionUI = { open: () => true };
      app.CivicationLifestoryUI.render();
      recap().open = true;
      recap().querySelector('summary').focus({ preventScroll: true });
      const original = summary();
      const originalFocus = doc.activeElement;
      const scrollY = app.scrollY;
      refresh();
      const unchangedNode = summary() === original && doc.activeElement === originalFocus;
      pending = true;
      refresh();
      const changedNode = summary() !== original;
      const recapPreserved = recap().open && doc.activeElement === recap().querySelector('summary');
      const nextDayBlocked = summary().querySelector('[data-lifestory-next-day]')?.disabled === true;
      summary().querySelector('[data-lifestory-next-action]').focus({ preventScroll: true });
      delete app.CivicationNextActionUI;
      refresh();
      const fallbackFocus = doc.activeElement === heading();
      app.CivicationNextActionUI = { open: () => true };
      refresh();
      const headingPreserved = doc.activeElement === heading();
      return {
        fixture: 'controlled inbox selector; real first-day choices and browser DOM',
        unchangedNode, changedNode, recapPreserved, nextDayBlocked, fallbackFocus, headingPreserved,
        inboxButtons: summary().querySelectorAll('[data-lifestory-next-action]').length,
        scrollUnchanged: Math.abs(app.scrollY - scrollY) <= 1,
        dayUnchanged: app.CivicationCalendar.getClock().dayIndex === day,
        storyDayUnchanged: app.CivicationLifestoryState.load().dag === storyDay
      };
    } finally {
      app.CivicationNextActionSelector = selector;
      app.CivicationNextActionUI = inbox;
      app.CivicationLifestoryUI.render();
    }
  });
  for (const key of ['unchangedNode', 'changedNode', 'recapPreserved', 'nextDayBlocked',
    'fallbackFocus', 'headingPreserved', 'scrollUnchanged', 'dayUnchanged', 'storyDayUnchanged']) {
    assert.equal(result[key], true, 'summary inbox browser acceptance: ' + key);
  }
  assert.equal(result.inboxButtons, 1, 'summary exposes exactly one inbox shortcut');
  // A controlled section exercises the real shared dialog used by the inbox,
  // without delivering/answering mail or relying on changing inbox contents.
  try {
    await page.evaluate(() => {
      const app = globalThis as any;
      const doc = app.document;
      const trigger = doc.createElement('button');
      trigger.id = 'civiQaPopupReturn';
      trigger.textContent = 'QA returpunkt';
      doc.querySelector('#civiLifestoryPanel').appendChild(trigger);
      const section = doc.createElement('section');
      section.id = 'civiQaPopupSection';
      section.innerHTML = '<div class="civi-section-body"><button>Første kontroll</button>'
        + '<button disabled>Sperret kontroll</button><button id="civiQaPopupLast">Siste kontroll</button></div>';
      doc.body.appendChild(section);
      trigger.focus({ preventScroll: true });
      app.CivicationMiniSectionsUI.openPopup(section, { label: 'Dialogfokus QA', category: 'personlig' });
    });
    const isFocused = (selector: string) => page.locator(selector).evaluate((element: any) =>
      element === element.ownerDocument.activeElement);
    assert.ok(await isFocused('#civiSectionPopupTitle'), 'opening dialog focuses its heading');
    await page.keyboard.press('Shift+Tab');
    assert.ok(await isFocused('#civiQaPopupLast'), 'Shift+Tab from heading reaches the last enabled control');
    await page.keyboard.press('Tab');
    assert.ok(await isFocused('#civiSectionPopup button[data-civi-popup-close]'), 'Tab wraps inside dialog');
    await page.keyboard.press('Shift+Tab');
    assert.ok(await isFocused('#civiQaPopupLast'), 'Shift+Tab wraps inside dialog');
    await page.keyboard.press('Escape');
    assert.ok(await isFocused('#civiQaPopupReturn'), 'Escape returns focus to the Min dag trigger');
    await page.evaluate(() => {
      const app = globalThis as any;
      app.CivicationMiniSectionsUI.openPopup(app.document.getElementById('civiQaPopupSection'),
        { label: 'Dialogfokus QA', category: 'personlig' });
    });
    await page.locator('#civiSectionPopup > .civi-section-popup-backdrop').click({ position: { x: 5, y: 5 } });
    assert.ok(await isFocused('#civiQaPopupReturn'), 'backdrop close returns focus to the Min dag trigger');
    await page.evaluate(() => {
      const app = globalThis as any;
      app.CivicationMiniSectionsUI.openPopup(app.document.getElementById('civiQaPopupSection'),
        { label: 'Dialogfokus QA', category: 'personlig' });
      app.document.getElementById('civiQaPopupReturn').remove();
    });
    await page.keyboard.press('Escape');
    assert.ok(await isFocused('#civiLifestorySection h2'), 'a removed trigger falls back to the current Min dag heading');
    result.popupFocus = { fixture: 'controlled content in real shared dialog', entry: true,
      forwardWrap: true, backwardWrap: true, escapeReturn: true, backdropReturn: true, removedTriggerFallback: true };
  } finally {
    await page.evaluate(() => {
      const app = globalThis as any;
      app.CivicationMiniSectionsUI?.closePopup?.();
      app.document.getElementById('civiQaPopupReturn')?.remove();
      app.document.getElementById('civiQaPopupSection')?.remove();
    });
  }
  return result;
}

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
    const phasePosition = await page.evaluate(() => {
      const app = globalThis as any;
      const phase = app.CivicationCalendar?.getPhase?.();
      const phases = app.CivicationCalendar?.DAY_PHASES;
      return { phase, index: Array.isArray(phases) ? phases.indexOf(phase) + 1 : 0,
        total: Array.isArray(phases) ? phases.length : 0 };
    });
    assert.ok(phasePosition.index > 0 && phasePosition.total === 8,
      'canonical Civication calendar exposes eight ordered daily phases');
    assert.ok(minDag.phase.endsWith(' · ' + phasePosition.index + ' av ' + phasePosition.total),
      'Min dag shows the exact canonical phase position, not a guessed progress value');
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
      // These values must come from rendered WebGL frames. Reject empty
      // counters before treating them as useful performance evidence.
      // This is only a sanity check, NOT a measured physical iPhone FPS.
      for (const [view, info] of [
        ['city', result.cityRendererInfo],
        ['close', result.closeRendererInfo]
      ] as const) {
        assert.ok(info && Number.isFinite(info.calls) && info.calls > 0
          && Number.isFinite(info.triangles) && info.triangles > 0,
          `${view} WebGL frame reports nonzero draw calls and triangles`);
        assert.ok(Number.isFinite(info.geometries) && info.geometries > 0
          && Number.isFinite(info.textures) && info.textures >= 0
          && Number.isFinite(info.pixelRatio) && info.pixelRatio > 0,
          `${view} WebGL frame reports valid resources and pixel ratio`);
      }
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
      const choiceRefreshFocus = await verifyChoiceRefreshFocus(decisionPage, outputDir);
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
      result.choiceRefreshFocus = choiceRefreshFocus;
      result.screenshots.push('min-dag-mobile-after-choice.png');
      result.summaryInboxFocus = await verifySummaryInboxFocus(decisionPage);
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



