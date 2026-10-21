// Real 21-day Civication UI regression. No injected Life Story days,
// Skills, job offers, Badge points or precompleted chapters.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { nextDayViaUi } from './verify-civication-arbeidsledig-browser.js';

export default async function verifyThreeWeekLife(browser: any, origin: string, outputDir: string) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const pageErrors: string[] = [];
  const dayCounts: number[] = [];
  const trace: { day: number; scene: string; choice: string }[] = [];
  page.on('pageerror', (error: Error) => pageErrors.push(error.message));
  const readState = () => page.evaluate(() => (globalThis as any).CivicationLifestoryState.load());

  try {
    await page.goto(origin + '/Civication.html', { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => {
      const app = globalThis as any;
      return !!app.CivicationLifestoryUI?.getCurrentSceneInfo?.()
        && !!app.CivicationLifestoryState?.load
        && !!app.CivicationLifePositions?.getUnlockedPositions
        && !!app.CivicationCalendar?.getClock;
    }, null, { timeout: 90000 });
    const initial = await readState();
    assert.equal(initial.rolle, 'arbeidsledig', 'fresh player starts without formal work');
    assert.equal(initial.livsdag, 1, 'fresh player starts on life day 1');
    assert.equal(initial.arkiv.length, 0, 'no preseeded played story');
    assert.equal(await page.evaluate(() => (globalThis as any).CivicationState.getActivePosition()), null);
    assert.equal(await page.evaluate(() => (globalThis as any).CivicationLifePositions.getUnlockedPositions('liv_treuker').length), 0);

    const selectedChoices: Record<string, string> = {
      d2_en_retning: 'skape',
      wave_e_life21_d8_foerste_spor: 'skape',
      wave_e_life21_d15_tredje_uke: 'skape',
      wave_e_life21_d21_skape_veien: 'skaper'
    };
    let totalSteps = 0;
    for (let day = 1; day <= 21; day++) {
      let scenesPlayedToday = 0;
      while (true) {
        const before = await readState();
        assert.equal(before.livsdag, day, 'life day not skipped or duplicated');
        if (before.dagFerdig) break;
        const sceneId: string | null = await page.evaluate(
          () => (globalThis as any).CivicationLifestoryUI.getCurrentSceneInfo()?.sceneId || null
        );
        assert.ok(sceneId, 'day ' + day + ': a visible scene is available in Min dag');
        const locator = page.locator('[data-lifestory-scene="' + sceneId + '"][data-lifestory-choice]:not([disabled])');
        const ordinary = locator.filter({ hasNot: page.locator('.civi-lifestory-action-hint') });
        const candidates = await ordinary.count() ? ordinary : locator;
        assert.ok(await candidates.count(), 'day ' + day + ': playable, non-locked choice exists in ' + sceneId);
        const selected = selectedChoices[sceneId];
        const choice = selected
          ? page.locator('[data-lifestory-scene="' + sceneId + '"][data-lifestory-choice="' + selected + '"]:not([disabled])')
          : candidates.first();
        assert.equal(await choice.count(), 1, 'day ' + day + ': expected choice is available: ' + (selected || sceneId));
        const choiceId = await choice.getAttribute('data-lifestory-choice');
        assert.ok(choiceId);
        await choice.click({ timeout: 20000 });
        const after = await readState();
        assert.equal(after.arkiv.length, before.arkiv.length + 1, 'exactly one archived choice');
        assert.equal(after.arkiv.at(-1).sceneId, sceneId);
        assert.equal(after.arkiv.at(-1).valgId, choiceId);
        scenesPlayedToday++;
        trace.push({ day, scene: sceneId, choice: choiceId });

        const profileClose = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]');
        if (await profileClose.count()) await profileClose.click();
        await page.locator('.civi-footer button[data-category="minDag"]').click({ timeout: 20000 });
        if ([9, 15, 20].includes(day) && scenesPlayedToday === 1) {
          const snapshot = await readState();
          const archivedChoices = snapshot.arkiv.map((row: any) => [row.sceneId, row.valgId, row.livsdag]);
          await page.reload({ waitUntil: 'load', timeout: 90000 });
          await page.waitForFunction(() => !!(globalThis as any).CivicationLifestoryUI?.getCurrentSceneInfo?.(), null, { timeout: 90000 });
          const restored = await readState();
          // A boot may normalize the private-history mirror or recompute
          // transient pointers; those are not lost player progress.
          assert.equal(restored.livsdag, day, 'reloading retains the life day');
          assert.deepEqual(restored.arkiv.map((row: any) => [row.sceneId, row.valgId, row.livsdag]),
            archivedChoices, 'reloading retains every actual played choice on day ' + day);
          assert.equal(restored.tidligereValg.life21_initial_focus, snapshot.tidligereValg.life21_initial_focus,
            'reloading retains the week-one personal direction');
          assert.equal(restored.tidligereValg.life21_week3_focus, snapshot.tidligereValg.life21_week3_focus,
            'reloading retains the week-three personal direction');
          for (const meter of ['penger', 'psyke', 'energi']) {
            assert.equal(restored.meters[meter], snapshot.meters[meter],
              'reloading cannot reset ' + meter + ' on day ' + day);
          }
        }
        assert.ok(++totalSteps < 950, '21 days terminate without repeated scenes');
      }
      assert.ok(scenesPlayedToday > 0, 'no empty Life Story day ' + day);
      dayCounts.push(scenesPlayedToday);
      if (day < 21) {
        assert.equal(await page.evaluate(() => (globalThis as any).CivicationLifePositions.getUnlockedPositions('liv_treuker').length),
          0, 'identity is not unlocked before real day-21 choice');
        await nextDayViaUi(page, 'organic-21-day', day);
      }
    }
    const final = await readState();
    assert.equal(final.livsdag, 21);
    assert.equal(final.rolle, 'arbeidsledig', 'voluntary personal path does not invent employment');
    assert.deepEqual(final.rolleBytter, [], 'no fabricated job transfer');
    assert.ok(final.arkiv.some((row: any) => row.sceneId === 'wave_e_life21_d21_skape_veien'
      && row.valgId === 'skaper' && row.livsdag === 21), 'the final authored choice is played and archived');
    const unlocked = await page.evaluate(() => ({
      paths: (globalThis as any).CivicationLifePositions.getUnlockedPositions('liv_treuker'),
      primary: (globalThis as any).CivicationLifePositions.getLifeContext().primary_life_position,
      job: (globalThis as any).CivicationState.getActivePosition(),
      merits: localStorage.getItem('merits_by_category')
    }));
    assert.equal(unlocked.paths.length, 1, 'one optional documented 21-day life path available');
    assert.equal(unlocked.paths[0].label, 'Skaper');
    assert.equal(unlocked.primary, null, 'life path is offered, never activated automatically');
    assert.equal(unlocked.job, null, 'no job assigned for Life Story progress');
    assert.equal(unlocked.merits, null, 'ordinary private days do not award History Go merit points');
    assert.deepEqual(pageErrors, [], 'no browser JavaScript errors');
    await page.screenshot({ path: join(outputDir, 'civication-organic-21-day.png'), fullPage: true });
    console.log('PASS: 21 actual browser days, no empty days, saved/reloaded private actions, optional documented Skaper, no synthetic job or merits.');
    return { passed: true, completedDays: dayCounts.length, totalScenes: totalSteps, dayCounts, trace: trace.slice(-30) };
  } catch (error) {
    await page.screenshot({ path: join(outputDir, 'civication-organic-21-day-failure.png'), fullPage: true }).catch(() => {});
    console.error('Civication 21-day browser failure, recent trace:', JSON.stringify(trace.slice(-20)));
    throw error;
  } finally {
    await context.close();
  }
}
