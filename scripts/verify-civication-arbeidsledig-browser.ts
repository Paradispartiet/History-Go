// Actual Civication.html UI playthrough. Fresh contexts, canonical content,
// real choice/day buttons and reloads; no production function is replaced.
import assert from 'node:assert/strict';
import { join } from 'node:path';

export default async function verifyArbeidsledig(browser: any, origin: string, outputDir: string) {
  const cases = [
    { id: 'musikk_booket', route: 'musikk', choices: {} },
    { id: 'musikk_avslaatt', route: 'musikk', choices: { d5_booker: 'avsta' } },
    { id: 'musikk_sen_prove', route: 'musikk', choices: { d3_mira_telefon: 'lytte_forst', d4_mira_lyttingen: 'prove_dag6' } },
    { id: 'miljo_avbrutt', route: 'miljo', choices: { d5_amir_oppmotet: 'ga_hjem' } },
    { id: 'kunnskap_referanse_utsatt', route: 'kunnskap', choices: { soknad_01_hullet: 'referanse', d2_referansen_venter: 'vent', d3_soknad_uten_svar: 'send_na', meldekort_01_fristen: 'utsett', d2_frist_stress: 'utsett_igjen' } }
  ];
  const reports: any[] = [];
  for (const scenario of cases) {
    const context = await browser.newContext({ viewport: scenario.id === 'musikk_booket' ? { width: 1024, height: 768 } : { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors: string[] = [];
    const trace: any[] = [];
    page.on('pageerror', (error: Error) => errors.push(error.message));
    try {
      await page.goto(`${origin}/Civication.html`, { waitUntil: 'load' });
      await page.waitForFunction(() => !!(globalThis as any).CivicationLifestoryUI?.getCurrentSceneInfo?.());
      const readState = () => page.evaluate(() => (globalThis as any).CivicationLifestoryState.load());
      let state: any = await readState();
      assert.equal(state.rolle, 'arbeidsledig');
      assert.equal(state.dag, 1);
      let guard = 0;
      const reloadedDays = new Set<number>();
      while (true) {
        state = await readState();
        if (state.dagFerdig) {
          if (state.dag === 7) break;
          await page.locator('[data-lifestory-next-day]').click();
          continue;
        }
        const sceneId = await page.evaluate(() => (globalThis as any).CivicationLifestoryUI.getCurrentSceneInfo().sceneId);
        const choices = page.locator(`[data-lifestory-scene="${sceneId}"]`);
        let choiceId = scenario.choices[sceneId] || (sceneId === 'd2_en_retning' ? scenario.route : null);
        if (!choiceId) {
          // Keep this playthrough in Min dag; navigation actions have their
          // independent action contract test. All story choices are genuine.
          const eligible = choices.filter({ hasNot: page.locator('.civi-lifestory-action-hint') });
          choiceId = await (await eligible.count() ? eligible.first() : choices.first()).getAttribute('data-lifestory-choice');
        }
        assert.ok(choiceId);
        await page.locator(`[data-lifestory-scene="${sceneId}"][data-lifestory-choice="${choiceId}"]`).click();
        const after: any = await readState();
        assert.equal(after.arkiv.length, state.arkiv.length + 1, `${scenario.id}/${sceneId}: one choice, one archive event`);
        assert.equal(after.arkiv.at(-1).sceneId, sceneId);
        assert.equal(after.arkiv.at(-1).valgId, choiceId);
        trace.push({ day: state.dag, phase: state.fase, sceneId, choiceId });
        if ([2, 5, 6].includes(after.dag) && !reloadedDays.has(after.dag)) {
          reloadedDays.add(after.dag);
          const before = JSON.stringify(after);
          await page.reload({ waitUntil: 'load' });
          await page.waitForFunction(() => !!(globalThis as any).CivicationLifestoryUI?.getCurrentSceneInfo?.());
          assert.equal(JSON.stringify(await readState()), before, `${scenario.id}: reload on day ${after.dag} preserves story`);
        }
        assert.ok(++guard < 250, `${scenario.id}: week terminates`);
      }
      assert.equal(reloadedDays.size, 3);
      assert.ok(state.tidligereValg.arbeidsledig_uke_avsluttet);
      assert.equal(new Set(state.spilteScener).size, state.spilteScener.length);
      if (scenario.id === 'musikk_booket') assert.ok(state.spilteScener.includes('d6_spillejobben'));
      if (scenario.id === 'musikk_avslaatt') assert.ok(!state.spilteScener.includes('d6_spillejobben'));
      if (scenario.id === 'musikk_sen_prove') assert.ok(state.spilteScener.includes('d6_sen_prove') && !state.spilteScener.includes('d4_mira_proven'));
      if (scenario.id === 'miljo_avbrutt') assert.ok(state.tidligereValg.amir_oppdrag_avbrutt && !state.tidligereValg.amir_oppdrag_gjennomfort);
      if (scenario.id === 'kunnskap_referanse_utsatt') assert.ok(state.spilteScener.includes('d3_soknad_uten_svar') && !state.spilteScener.includes('d3_soknad_svar') && state.spilteScener.includes('d3_nav_etter_fristen'));
      await page.locator('[data-lifestory-symposium] summary').click();
      const storyText = await page.locator('[data-lifestory-symposium]').innerText();
      assert.ok(storyText.includes('Tidslinje') && storyText.includes('Møter og avtaler'));
      assert.ok(storyText.includes(state.arkiv[0].valgTekst));
      assert.ok(storyText.includes(state.arkiv.at(-1).valgTekst));
      assert.equal(errors.length, 0, `${scenario.id}: no page errors`);
      await page.screenshot({ path: join(outputDir, `arbeidsledig-${scenario.id}.png`), fullPage: true });
      reports.push({ id: scenario.id, days: state.dag, reloadedDays: Array.from(reloadedDays), trace, pageErrors: errors });
    } finally { await context.close(); }
  }
  return { cases: reports, fullShell: true, productionFunctionsReplaced: false };
}
