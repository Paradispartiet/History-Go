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
  const readEconomy = () => page.evaluate(() => {
    const app = globalThis as any;
    const wallet = app.CivicationState.getWallet();
    const clock = app.CivicationCalendar.getClock();
    const snapshot = app.CivicationEconomyEngine.getEconomySnapshot();
    return {
      day: Number(clock.dayIndex),
      balance: Number(wallet.balance ?? 0),
      lastSettledDay: Number(wallet.last_tick_day_index),
      completedDays: (wallet.completed_game_days_v1 || []).map((r: any) => ({
        day: Number(r.dayIndex), career: String(r.careerId || ''), net: Number(r.weeklyNet)
      })),
      gameWeek: snapshot.tickStatus.currentWeekKey,
      nextSettlement: !!snapshot.tickStatus.canTickNow
    };
  });
  const weeklyBalances: { day: number; balance: number; lastSettledDay: number }[] = [];

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
        // A real inbox popup can remain open after calendar rollover and
        // intercept an otherwise visible Life Story choice on day two.
        // Close it through the same control the player uses, never force-click
        // behind an overlay or skip the authored scene.
        const obstructingPopup = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]').first();
        if (await obstructingPopup.isVisible().catch(() => false)) {
          await obstructingPopup.click({ timeout: 12000 });
        }
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
          const moneyBeforeReload = await readEconomy();
          const archivedChoices = snapshot.arkiv.map((row: any) => [row.sceneId, row.valgId, row.livsdag]);
          await page.reload({ waitUntil: 'load', timeout: 90000 });
          await page.waitForFunction(() => !!(globalThis as any).CivicationLifestoryUI?.getCurrentSceneInfo?.(), null, { timeout: 90000 });
          const restored = await readState();
          const moneyAfterReload = await readEconomy();
          assert.deepEqual(moneyAfterReload, moneyBeforeReload,
            'reload never creates another payment or loses daily earnings on day ' + day);
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
      // Follow the canonical wallet and calendar, not narrative meters.
      // A seven-day salary/NAV settlement occurs on day 8 and 15; the
      // third week has been *played* at day 21 but can only be paid after
      // the next real game-clock rollover to day 22.
      const economy = await readEconomy();
      assert.equal(economy.day, day, 'calendar matches personal life day ' + day);
      if ([8, 15, 21].includes(day)) {
        const expectedCheckpoint = day === 21 ? 15 : day;
        assert.equal(economy.lastSettledDay, expectedCheckpoint,
          'only fully elapsed game weeks are settled on day ' + day);
        assert.ok(Number.isFinite(economy.balance), 'canonical wallet stays numeric');
        weeklyBalances.push({ day, balance: economy.balance,
          lastSettledDay: economy.lastSettledDay });
        assert.equal(new Set(economy.completedDays.map(r => r.day)).size, economy.completedDays.length,
          'one economic record per played day, including after reload');
        assert.ok(economy.completedDays.every(r => !r.career && r.net === 0),
          'no fabricated salary while unemployed');
        assert.ok(economy.completedDays.every(r => r.day >= expectedCheckpoint),
          'settled days cannot remain payable for a second time');
        assert.equal(economy.nextSettlement, false, 'no duplicate week settlement available');
      }
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
    assert.equal(weeklyBalances.length, 3, 'three game-week checkpoints audited');
    assert.equal(weeklyBalances[0].lastSettledDay, 8);
    assert.equal(weeklyBalances[1].lastSettledDay, 15);
    assert.equal(weeklyBalances[2].lastSettledDay, 15,
      'do not settle a third week early at the end of day 21');
    assert.deepEqual(pageErrors, [], 'no browser JavaScript errors');
    await page.screenshot({ path: join(outputDir, 'civication-organic-21-day.png'), fullPage: true });
    console.log('PASS: 21 actual browser days, no empty days, saved/reloaded private actions, optional documented Skaper, no synthetic job or merits.');
    return { passed: true, completedDays: dayCounts.length, totalScenes: totalSteps,
      weeklyBalances, dayCounts, trace: trace.slice(-30) };
  } catch (error) {
    await page.screenshot({ path: join(outputDir, 'civication-organic-21-day-failure.png'), fullPage: true }).catch(() => {});
    console.error('Civication 21-day browser failure, recent trace:', JSON.stringify(trace.slice(-20)));
    throw error;
  } finally {
    await context.close();
  }
}
