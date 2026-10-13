// End-to-end player acceptance: real History Go quiz completions -> earned
// merit points -> Civication offer -> accepted role, without seeded progression.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export default async function verifyOrganicPlayer(browser: any, origin: string) {
  const quiz = JSON.parse(readFileSync(join(process.cwd(), 'data/quiz/naeringsliv/ringnes_bryggeri_sets_merged.json'), 'utf8'));
  assert.equal(quiz.targetId, 'ringnes_bryggeri');
  assert.equal(quiz.categoryId, 'naeringsliv');
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
  try {
    await page.goto(`${origin}/index.html?hgTest=1#/place/ringnes_bryggeri`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(() => {
      const app = globalThis as any;
      return app.__HG_APP_READY__ === true && app.__HG_ROUTER_STARTED__ === true &&
        app.document.querySelector('#placeCard')?.dataset.currentPlaceId === 'ringnes_bryggeri' &&
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
    await page.waitForFunction(() => (globalThis as any).location.hash.startsWith('#/quiz/ringnes_bryggeri'), null, { timeout: 20000 });
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
        merit: Number(JSON.parse(localStorage.getItem('merits_by_category') || '{}').naeringsliv?.points || 0),
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
      const badge = app.BADGES?.find((b: any) => b.id === 'naeringsliv');
      return {
        merit: JSON.parse(localStorage.getItem('merits_by_category') || '{}').naeringsliv?.points,
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
      return offer?.career_id === 'naeringsliv' && Number(offer?.threshold) === 5;
    }, null, { timeout: 12000 });
    const pending = await page.evaluate(() => (globalThis as any).CivicationJobs.getLatestPendingOffer());
    assert.match(String(pending.title), /Ekspeditør|butikkmedarbeider/i);
    assert.equal((await page.evaluate(() => JSON.parse(localStorage.getItem('merits_by_category') || '{}').naeringsliv?.points)), 5);

    await page.locator('.civi-footer button[data-category="karriere"]').click();
    await page.locator('#civiOfferAccept').waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('#civiOfferAccept').click();
    await page.waitForFunction(() => {
      const app = globalThis as any;
      return app.CivicationState?.getActivePosition?.()?.career_id === 'naeringsliv';
    }, null, { timeout: 30000 });
    const accepted = await page.evaluate(() => ({
      active: (globalThis as any).CivicationState.getActivePosition(),
      merit: JSON.parse(localStorage.getItem('merits_by_category') || '{}').naeringsliv?.points,
      people: localStorage.getItem('people_collected')
    }));
    assert.match(String(accepted.active.title), /Ekspeditør|butikkmedarbeider/i);
    assert.equal(accepted.merit, 5);
    assert.equal(accepted.people, null);

    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => (globalThis as any).CivicationState?.getActivePosition?.()?.career_id === 'naeringsliv', null, { timeout: 90000 });
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('merits_by_category') || '{}').naeringsliv?.points), 5);
    assert.deepEqual(errors, [], 'No browser runtime errors during organic player journey');
    console.log('PASS: organic History Go -> Civication: 5 quiz sets -> 5 earned business merits -> real job-offer acceptance -> reload; no seeded merits or People.');
    return { passed: true, quizSets: 5, earnedMerits: 5, career: accepted.active.title, browserErrors: errors.length };
  } finally {
    await context.close();
  }
}
