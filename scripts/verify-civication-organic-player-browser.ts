// End-to-end player acceptance: real History Go quiz completions -> earned
// merit points -> Civication offer -> accepted role, without seeded progression.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { nextDayViaUi, queuedPointerFallbacks } from './verify-civication-arbeidsledig-browser.js';

export default async function verifyOrganicPlayer(browser: any, origin: string) {
  const quiz = JSON.parse(readFileSync(join(process.cwd(), 'data/quiz/kunst/munch_museet_sets.json'), 'utf8'));
  assert.equal(quiz.targetId, 'munch_museet');
  assert.equal(quiz.categoryId, 'kunst');
  const sets = quiz.sets.slice(0, 5);
  assert.equal(sets.length, 5);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  // Only test geography and onboarding are configured. No merits, People, job,
  // quiz, Life Story or Civication state is inserted or mocked.
  await context.addInitScript(() => {
    localStorage.setItem('hg_onboarding_shown_v1', '1');
    localStorage.setItem('HG_TEST_MODE', '1');
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error: Error) => errors.push(error.message));
  // This is one continuous, unseeded browser session. Week one is played
  // unemployed through the UI, the museum job is genuinely earned on day 8,
  // then private choices and real day rollovers continue through day 21.
  const readStory = () => page.evaluate(() => (globalThis as any).CivicationLifestoryState.load());
  const readEconomy = () => page.evaluate(() => {
    const app = globalThis as any;
    const wallet = app.CivicationState.getWallet();
    return {
      day: Number(app.CivicationCalendar.getClock().dayIndex),
      balance: Number(wallet.balance || 0),
      lastSettledDay: Number(wallet.last_tick_day_index),
      completed: (wallet.completed_game_days_v1 || []).map((r: any) => ({
        day: Number(r.dayIndex), career: String(r.careerId || ''), net: Number(r.weeklyNet)
      }))
    };
  });
  const played: { day: number; scene: string; choice: string }[] = [];
  const selectedChoices: Record<string, string> = {
    d2_en_retning: 'skape',
    wave_e_life21_d8_foerste_spor: 'skape',
    wave_e_life21_d15_tredje_uke: 'skape',
    wave_e_life21_d21_skape_veien: 'skaper'
  };
  async function playStoryDay(day: number) {
    let actions = 0;
    // A genuine day rollover can leave the inbox popup open in front of
    // Min dag. Close it using the real visible UI before choosing in the
    // underlying story; never force-click through an overlay.
    const openingPopupClose = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]').first();
    if (await openingPopupClose.isVisible().catch(() => false)) {
      await openingPopupClose.click({ timeout: 12000 });
    }
    await page.locator('.civi-footer button[data-category="minDag"]').click({ timeout: 20000 });
    while (true) {
      const before = await readStory();
      assert.equal(before.livsdag, day, 'private Life Story day must stay synchronized');
      if (before.dagFerdig) break;
      const sceneId: string | null = await page.evaluate(() =>
        (globalThis as any).CivicationLifestoryUI?.getCurrentSceneInfo?.()?.sceneId || null);
      assert.ok(sceneId, 'day ' + day + ': playable canonical scene exists');
      const choices = page.locator('[data-lifestory-scene="' + sceneId + '"][data-lifestory-choice]:not([disabled])');
      const standard = choices.filter({ hasNot: page.locator('.civi-lifestory-action-hint') });
      const available = await standard.count() ? standard : choices;
      const wanted = selectedChoices[sceneId];
      const choice = wanted
        ? page.locator('[data-lifestory-scene="' + sceneId + '"][data-lifestory-choice="' + wanted + '"]:not([disabled])')
        : available.first();
      await choice.waitFor({ state: 'visible', timeout: 20000 });
      const choiceId = await choice.getAttribute('data-lifestory-choice');
      assert.ok(choiceId);
      await choice.click({ timeout: 20000 });
      const after = await readStory();
      assert.equal(after.arkiv.length, before.arkiv.length + 1, 'exactly one actual choice is archived');
      assert.equal(after.arkiv.at(-1).sceneId, sceneId);
      assert.equal(after.arkiv.at(-1).valgId, choiceId);
      played.push({ day, scene: sceneId, choice: choiceId });
      assert.ok(++actions < 220, 'day ' + day + ' terminates without repeated scenes');
      const popup = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]');
      if (await popup.isVisible().catch(() => false)) await popup.click();
      await page.locator('.civi-footer button[data-category="minDag"]').click({ timeout: 20000 });
    }
    assert.ok(actions > 0 || day === 8, 'every ordinary day has at least one real choice');
  }
  const weekSettlements: { completedDay: number; balance: number; lastSettledDay: number }[] = [];
  async function advanceAndAudit(day: number) {
    const before = await readEconomy();
    assert.equal(before.day, day);
    await nextDayViaUi(page, 'earned-museum-21-day', day);
    const after = await readEconomy();
    assert.equal(after.day, day + 1, 'day-end uses the canonical calendar');
    if (day % 7 === 0) {
      assert.equal(after.lastSettledDay, day + 1,
        'settlement occurs after exactly seven played days');
      assert.equal(new Set(after.completed.map(r => r.day)).size, after.completed.length,
        'settled day snapshots cannot be duplicated');
      assert.ok(after.completed.every(r => r.day >= day + 1),
        'settled salary records cannot be paid twice');
      weekSettlements.push({ completedDay: day, balance: after.balance, lastSettledDay: after.lastSettledDay });
      const stable = await readStory();
      await page.reload({ waitUntil: 'load', timeout: 90000 });
      await page.waitForFunction(() => !!(globalThis as any).CivicationLifestoryUI?.getCurrentSceneInfo,
        null, { timeout: 90000 });
      const reloaded = await readEconomy();
      assert.equal(reloaded.balance, after.balance, 'reload cannot pay the same week twice');
      assert.equal(reloaded.lastSettledDay, after.lastSettledDay, 'reload preserves settlement checkpoint');
      const restored = await readStory();
      assert.equal(restored.livsdag, stable.livsdag, 'reload retains the personal day');
      assert.deepEqual(restored.arkiv.map((row: any) => [row.sceneId, row.valgId, row.livsdag]),
        stable.arkiv.map((row: any) => [row.sceneId, row.valgId, row.livsdag]),
        'reload preserves all earlier personal choices');
    } else {
      assert.equal(after.balance, before.balance,
        'no salary or NAV settlement between completed game weeks');
    }
  }
  try {
    await page.goto(`${origin}/Civication.html`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => {
      const app = globalThis as any;
      return !!app.CivicationLifestoryUI?.getCurrentSceneInfo?.()
        && !!app.CivicationCalendar?.getClock && !!app.CivicationEconomyEngine?.getEconomySnapshot;
    }, null, { timeout: 90000 });
    const starting = await readStory();
    assert.equal(starting.livsdag, 1, 'an organic player starts on day one');
    assert.equal(starting.rolle, 'arbeidsledig', 'week one starts without a job');
    assert.equal(starting.arkiv.length, 0, 'no private choices are preloaded');
    assert.equal(await page.evaluate(() => (globalThis as any).CivicationState.getActivePosition()), null,
      'no job is seeded');
    for (let day = 1; day <= 7; day++) {
      await playStoryDay(day);
      assert.equal(await page.evaluate(() => (globalThis as any).CivicationState.getActivePosition()), null,
        'player stays unemployed throughout week one');
      await advanceAndAudit(day);
    }
    assert.equal(weekSettlements.length, 1);
    const joblessWeek = await readEconomy();
    assert.equal(joblessWeek.day, 8);
    assert.equal(joblessWeek.lastSettledDay, 8);
    assert.ok(played.some(entry => entry.day === 7),
      'seven actual days of private decisions precede the earned job');
    await page.goto(`${origin}/index.html?hgTest=1#/place/munch_museet`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(() => {
      const app = globalThis as any;
      return app.__HG_APP_READY__ === true && app.__HG_ROUTER_STARTED__ === true &&
        app.document.querySelector('#placeCard')?.dataset.currentPlaceId === 'munch_museet' &&
        typeof app.QuizEngine?.getTargetSummary === 'function';
    }, null, { timeout: 90000 });
    const empty = await page.evaluate(() => ({
      merits: localStorage.getItem('merits_by_category'),
      people: localStorage.getItem('people_collected'),
      jobs: localStorage.getItem('hg_civi_jobs_v1')
    }));
    assert.equal(empty.merits, null, 'No merit points may be preinserted');
    assert.equal(empty.people, null, 'No People collection may be preinserted');
    assert.equal(empty.jobs, null, 'No job state may be preinserted');

    await page.evaluate(() => {
      const app = globalThis as any;
      app.TEST_MODE = false;
      app.QuizEngine.init({ quizFeedbackMs: 120 });
    });
    await page.locator('#pcQuiz').click({ timeout: 20000 });
    await page.waitForFunction(() => (globalThis as any).location.hash.startsWith('#/quiz/munch_museet'), null, { timeout: 20000 });
    for (const [si, set] of sets.entries()) {
      for (const question of set.questions) {
        await page.waitForFunction((expected: string) =>
          (globalThis as any).document.querySelector('#quizQuestion')?.textContent?.trim() === expected,
        question.question, { timeout: 25000 });
        await page.locator('#quizChoices').getByRole('button', { name: question.answer, exact: true }).click({ timeout: 20000 });
      }
      await page.waitForFunction((setId: string) =>
        JSON.parse(localStorage.getItem('hg_quiz_sets_v1') || '{}')[setId]?.completed === true,
      set.set_id, { timeout: 25000 });
      const progress = await page.evaluate(() => ({
        merit: Number(JSON.parse(localStorage.getItem('merits_by_category') || '{}').kunst?.points || 0),
        people: localStorage.getItem('people_collected')
      }));
      assert.equal(progress.merit, si + 1, 'Each real quiz-set completion awards exactly one point');
      assert.equal(progress.people, null, 'The quiz journey never injects a collected person');
      if (si < sets.length - 1) {
        await page.locator('#quizSummaryPrimary').waitFor({ state: 'visible', timeout: 20000 });
        await page.locator('#quizSummaryPrimary').click();
      }
    }

    // Navigation uses the same real browser context and persisted progress.
    await page.goto(`${origin}/Civication.html`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => {
      const app = globalThis as any;
      return !!app.HG_CiviEngine && !!app.CivicationJobs?.getLatestPendingOffer &&
        !!app.CivicationState?.getActivePosition;
    }, null, { timeout: 90000 });
    // Diagnostics retain the unmodified state before any recovery attempt.
    await page.waitForTimeout(2500);
    const offerDiagnostics = await page.evaluate(() => {
      const app = globalThis as any;
      const badge = app.BADGES?.find((b: any) => b.id === 'kunst');
      return {
        merit: JSON.parse(localStorage.getItem('merits_by_category') || '{}').kunst?.points,
        active: app.CivicationState?.getActivePosition?.(),
        pending: app.CivicationJobs?.getLatestPendingOffer?.(),
        offers: app.CivicationJobs?.getOffers?.(),
        canReceive: app.CivicationJobs?.canReceiveNewOffers?.(),
        badgeCount: app.BADGES?.length,
        firstTier: badge?.tiers?.[0],
        hasRebuild: typeof app.rebuildJobOffersFromCurrentMerits === 'function'
      };
    });
    console.log('Civication organic job-offer diagnostics BEFORE recovery', JSON.stringify(offerDiagnostics));
    if (!offerDiagnostics.pending) {
      const recoveryProbe = await page.evaluate(async () => {
        const app = globalThis as any;
        return await app.rebuildJobOffersFromCurrentMerits?.();
      });
      console.log('Civication organic explicit offer rebuild diagnostic', JSON.stringify(recoveryProbe));
      if (recoveryProbe?.ok) throw new Error('Organic job offer was missing until explicit rebuild; automatic initialization failed');
    }
    await page.waitForFunction(() => {
      const app = globalThis as any;
      const offer = app.CivicationJobs?.getLatestPendingOffer?.();
      return offer?.career_id === 'kunst' && Number(offer?.threshold) === 5;
    }, null, { timeout: 12000 });
    const pending = await page.evaluate(() => (globalThis as any).CivicationJobs.getLatestPendingOffer());
    assert.match(String(pending.title), /Vertskap|museum|galleri/i);
    assert.equal((await page.evaluate(() => JSON.parse(localStorage.getItem('merits_by_category') || '{}').kunst?.points)), 5);

    // A real Min dag choice must survive an earned job offer: private history
    // belongs to the person, even when the new job has no Life Story package.
    await page.waitForFunction(() =>
      !!(globalThis as any).CivicationLifestoryUI?.getCurrentSceneInfo?.()?.sceneId,
    null, { timeout: 30000 });
    const privateSceneId: string = await page.evaluate(() =>
      (globalThis as any).CivicationLifestoryUI.getCurrentSceneInfo().sceneId);
    const privateBefore = await page.evaluate(() => {
      const state = (globalThis as any).CivicationLifestoryState.load();
      return { day: state.livsdag, entries: state.arkiv.length, role: state.rolle };
    });
    assert.equal(privateBefore.role, 'arbeidsledig', 'earned merits alone do not create employment');
    const openPopup = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]');
    if (await openPopup.count()) await openPopup.click();
    await page.locator('.civi-footer button[data-category="minDag"]').click({ timeout: 20000 });
    const privateChoices = page.locator('[data-lifestory-scene="' + privateSceneId + '"][data-lifestory-choice]:not([disabled])');
    await privateChoices.first().waitFor({ state: 'visible', timeout: 30000 });
    const privateChoiceId = await privateChoices.first().getAttribute('data-lifestory-choice');
    assert.ok(privateChoiceId);
    await privateChoices.first().click({ timeout: 20000 });
    const playedPrivate = await page.evaluate(() => {
      const state = (globalThis as any).CivicationLifestoryState.load();
      return { day: state.livsdag, role: state.rolle, archive: state.arkiv };
    });
    assert.equal(playedPrivate.day, privateBefore.day, 'private choice cannot skip a life day');
    assert.equal(playedPrivate.archive.length, privateBefore.entries + 1, 'exactly one ordinary private choice is archived');
    assert.equal(playedPrivate.archive.at(-1).sceneId, privateSceneId);
    assert.equal(playedPrivate.archive.at(-1).valgId, privateChoiceId);
    const hasPlayedPrivateChoice = () => page.evaluate(({ sceneId, choiceId }) => {
      const state = (globalThis as any).CivicationLifestoryState.load();
      const sources = [state, ...Object.values(state?.rolleTilstander || {})] as any[];
      return sources.some(source => source?.arkiv?.some((entry: any) =>
        entry.sceneId === sceneId && entry.valgId === choiceId));
    }, { sceneId: privateSceneId, choiceId: privateChoiceId });

    await page.locator('.civi-footer button[data-category="karriere"]').click();
    // Civication uses mini cards; offer actions live in the role popup, not
    // directly in the career category grid.
    await page.locator('#activeJobSection .civi-mini-card [data-civi-mini-open]').waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('#activeJobSection .civi-mini-card [data-civi-mini-open]').click();
    await page.locator('#civiSectionPopup.is-open #civiOfferAccept').waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('#civiSectionPopup.is-open #civiOfferAccept').click();
    await page.waitForFunction(() => {
      const app = globalThis as any;
      return app.CivicationState?.getActivePosition?.()?.career_id === 'kunst';
    }, null, { timeout: 30000 });
    const accepted = await page.evaluate(() => ({
      active: (globalThis as any).CivicationState.getActivePosition(),
      merit: JSON.parse(localStorage.getItem('merits_by_category') || '{}').kunst?.points,
      people: localStorage.getItem('people_collected')
    }));
    assert.match(String(accepted.active.title), /Vertskap|museum|galleri/i);
    assert.equal(accepted.merit, 5);
    assert.equal(accepted.people, null);
    // Formal work is real, but no work pack exists for the museum position.
    // The private-day panel must remain accessible without replaying NAV.
    const afterOfferPopup = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]');
    if (await afterOfferPopup.count()) await afterOfferPopup.click();
    await page.locator('.civi-footer button[data-category="minDag"]').click({ timeout: 20000 });
    await page.locator('[data-lifestory-personal-only]').waitFor({ state: 'visible', timeout: 30000 });
    assert.equal(await page.locator('[data-lifestory-role-status="unavailable"]').count(), 0,
      'unmapped paid work must not hide the whole private story');
    const playable = await page.evaluate(() => (globalThis as any).CivicationLifestoryUI.getCurrentSceneInfo());
    assert.ok(playable, 'private day remains navigable after earning and accepting the museum job');
    const privateAction = page.locator('[data-lifestory-choice]:not([disabled]), [data-lifestory-advance], [data-lifestory-next-day]');
    assert.ok(await privateAction.count(), 'at least one private story/advance action remains visible');
    assert.equal(await page.evaluate(() => (globalThis as any).CivicationState.getActivePosition()?.career_id),
      'kunst', 'private narrative mode does not change the earned formal position');
    assert.equal(await hasPlayedPrivateChoice(), true,
      'accepting earned art job cannot erase a previously played personal scene');
    assert.equal(await page.evaluate(() => (globalThis as any).CivicationLifestoryState.load().livsdag),
      privateBefore.day, 'taking a formal job cannot advance or reset the private life clock');

    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => (globalThis as any).CivicationState?.getActivePosition?.()?.career_id === 'kunst', null, { timeout: 90000 });
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('merits_by_category') || '{}').kunst?.points), 5);
    assert.equal(await hasPlayedPrivateChoice(), true,
      'full reload after a job offer retains the previously played private life scene');
    // Continue the SAME real UI save after job acceptance. Do not inject
    // dates, a job role, merit scores or precompleted authored stories.
    await page.locator('.civi-footer button[data-category="minDag"]').click({ timeout: 20000 });
    for (let day = 8; day <= 21; day++) {
      await playStoryDay(day);
      const activeJob = await page.evaluate(() => (globalThis as any).CivicationState.getActivePosition());
      assert.equal(activeJob?.career_id, 'kunst', 'earned museum job persists on day ' + day);
      if (day === 14 || day === 21) {
        const pendingPayroll = await readEconomy();
        assert.ok(pendingPayroll.completed.every(r => r.career === 'kunst'),
          'actual completed employment days, not a fictitious week-long backfill');
        assert.ok(pendingPayroll.completed.every(r => r.day >= (day === 14 ? 8 : 15)),
          'earned salary begins in its correct played week');
      }
      await advanceAndAudit(day);
    }
    assert.equal(weekSettlements.length, 3, 'three real calendar-week settlements completed');
    assert.deepEqual(weekSettlements.map(r => [r.completedDay, r.lastSettledDay]),
      [[7, 8], [14, 15], [21, 22]]);
    const ending = await readStory();
    assert.equal(ending.livsdag, 21, 'the final authored Life Story day stays completed, without a fabricated chapter');
    assert.equal(ending.kalenderDag, 22, '21 completed shell days roll the economic clock to day 22');
    assert.ok(ending.arkiv.some((row: any) => row.sceneId === 'wave_e_life21_d21_skape_veien'
      && row.valgId === 'skaper' && row.livsdag === 21),
      'the day-21 direction is earned from an authored choice');
    assert.equal(await hasPlayedPrivateChoice(), true, 'the earlier private archive survives all 21 days');
    const finalCareer = await page.evaluate(() => (globalThis as any).CivicationState.getActivePosition());
    assert.equal(finalCareer?.career_id, 'kunst');
    const finalWallet = await readEconomy();
    assert.ok(finalWallet.balance > weekSettlements[0].balance,
      'the earned job produces income only in later played weeks');

    // Account-cloud integration uses the REAL completed browser state and
    // the actual cloud adapter. Only authentication/database transport is
    // simulated; production account login and remote Supabase are not tested.
    const cloud = await page.evaluate(async () => {
      const app = globalThis as any;
      const save = app.CivicationCloudSave;
      assertCloud(!!save?.bootstrap && !!save?.flush && !!save?.snapshot,
        'the production Civication cloud adapter must be present');
      const before = save.snapshot();
      // A first-ever active job has no ended employment to archive.
      // CivicationState only creates hg_job_history_v1 on a real job exit;
      // requiring it here would fabricate history in this organic journey.
      const required = ['civication_lifestory_v1', 'hg_civi_wallet_v1',
        'hg_civi_calendar_v1', 'hg_active_position_v1'];
      for (const key of required) assertCloud(!!before[key], 'missing canonical backup key ' + key);
      assertCloud(localStorage.getItem('hg_job_history_v1') === null
        && before.hg_job_history_v1 === undefined,
        'the first earned job must not manufacture an ended-job history');
      const remote: { record: any } = { record: null };
      const client = {
        from(name: string) {
          assertCloud(name === 'aha_imports', 'use canonical account table');
          return {
            select() { return this; },
            eq() { return this; },
            async maybeSingle() { return { data: remote.record, error: null }; },
            async upsert(value: any) {
              remote.record = { payload: value.payload, created_at: value.created_at };
              return { error: null };
            }
          };
        }
      };
      app.HistoryGoAHAAuth = {
        getSession: async () => ({ user: { id: 'organic-browser-21-day-fixture' } }),
        getClient: async () => client
      };
      await save.bootstrap();
      await save.flush();
      assertCloud(!!remote.record, 'actual day-21 progress uploaded to fake account transport');
      const keys = Object.keys(remote.record.payload.state);
      for (const key of required) {
        assertCloud(remote.record.payload.state[key] === before[key],
          'account transport must preserve ' + key);
      }
      assertCloud(!Object.hasOwn(remote.record.payload.state, 'hg_job_history_v1'),
        'cloud backup must not invent a job-exit record');
      localStorage.clear();
      const restored = await save.bootstrap();
      assertCloud(restored?.ok === true, 'account bootstrap restores an empty browser storage');
      for (const key of required) {
        assertCloud(localStorage.getItem(key) === before[key],
          'account restore must recover exactly ' + key);
      }
      assertCloud(localStorage.getItem('hg_job_history_v1') === null,
        'cloud restore must not invent an ended job');
      return { keys: keys.length, recovered: required.length };
      function assertCloud(condition: boolean, message: string) {
        if (!condition) throw new Error(message);
      }
    });
    assert.deepEqual(queuedPointerFallbacks.filter(item => item.scenario === 'earned-museum-21-day'), [],
      'queued-job controls must remain physically clickable without DOM-event fallback');
    assert.deepEqual(errors, [], 'No browser runtime errors during the 21-day organic player journey');
    console.log('PASS: 21 real Civication days, five earned History Go sets, museum job accepted on day 8, three weekly settlements, private choices and simulated-account restoration.');
    return { passed: true, completedDays: 21, totalChoices: played.length,
      weeklySettlements: weekSettlements, cloud, quizSets: 5, earnedMerits: 5,
      career: accepted.active.title, browserErrors: errors.length };
  } finally {
    await context.close();
  }
}
