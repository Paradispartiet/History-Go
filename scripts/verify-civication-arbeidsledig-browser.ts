// Actual Civication.html UI playthrough. Fresh contexts, canonical content,
// real choice/day buttons and reloads; no production function is replaced.
import assert from 'node:assert/strict';
import { join } from 'node:path';

export default async function verifyArbeidsledig(browser: any, origin: string, outputDir: string) {
  const cases: any[] = [
    { id: 'musikk_booket', route: 'musikk', choices: { d7_musikk_videre: 'rolleflaten' } },
    { id: 'musikk_avslaatt', route: 'musikk', choices: { d5_booker: 'avsta' } },
    { id: 'musikk_sen_prove', route: 'musikk', choices: { d3_mira_telefon: 'lytte_forst', d4_mira_lyttingen: 'prove_dag6' } },
    { id: 'miljo_avbrutt', route: 'miljo', choices: { d5_amir_oppmotet: 'ga_hjem', d7_miljo_videre: 'rolleflaten' } },
    { id: 'kunnskap_referanse_utsatt', route: 'kunnskap', choices: { soknad_01_hullet: 'referanse', d2_referansen_venter: 'vent', d3_soknad_uten_svar: 'send_na', meldekort_01_fristen: 'utsett', d2_frist_stress: 'utsett_igjen' } },
    { id: 'prosjekt_laaset', route: 'prosjekt', suggestion: 'Sideprosjektbygger', choices: { d7_prosjekt_videre: 'naeringsliv_sideprosjektbygger' } },
    { id: 'skape_sen', route: 'skape', suggestion: 'Skrivebordspoet', choices: { d3_skape_invitasjon: 'dag6', d7_skape_videre: 'litteratur_skrivebordspoet' } },
    { id: 'fellesskap_uten_vakt', route: 'fellesskap', suggestion: 'Klubbmenneske', choices: { d4_fellesskap_moetet: 'avgrens', d7_fellesskap_videre: 'sport_klubbmenneske' } },
    { id: 'byhistorie_avslaatt', route: 'byhistorie', suggestion: 'Lokalhistoriker', choices: { d3_byhistorie_invitasjon: 'egen_tid', d7_byhistorie_videre: 'historie_lokalhistoriker' } },
    { id: 'utforsking_null', route: 'utforsking', suggestion: 'Folkeforsker', choices: { d4_utforsking_moetet: 'avgrens', d7_utforsking_videre: 'vitenskap_folkeforsker' } },
    { id: 'kultur_sen', route: 'kultur', suggestion: 'Filmklubbmenneske', choices: { d3_kultur_invitasjon: 'dag6', d7_kultur_videre: 'film_tv_filmklubbmenneske' } },
    { id: 'prosjekt_valgt', route: 'prosjekt', suggestion: 'Sideprosjektbygger', activate: true, choices: { d7_prosjekt_videre: 'naeringsliv_sideprosjektbygger' } }
  ];
  const reports: any[] = [];
  for (const scenario of cases) {
    const context = await browser.newContext({ viewport: scenario.id === 'musikk_booket' ? { width: 1024, height: 768 } : { width: 390, height: 844 } });
    if (scenario.activate) await context.addInitScript(() => {
      // Fixture data before boot; all role choices still use real UI/API.
      if (!localStorage.getItem('arbeidsledig_browser_merits_seeded')) {
        localStorage.setItem('merits_by_category', JSON.stringify({ by: { points: 5 }, naeringsliv: { points: 10 } }));
        localStorage.setItem('arbeidsledig_browser_merits_seeded', '1');
      }
    });
    const page = await context.newPage();
    const errors: string[] = [];
    const trace: any[] = [];
    page.on('pageerror', (error: Error) => errors.push(error.message));
    try {
      await page.goto(`${origin}/Civication.html`, { waitUntil: 'load' });
      await page.waitForFunction(() => !!(globalThis as any).CivicationLifestoryUI?.getCurrentSceneInfo?.());
      await page.waitForFunction(() => {
        const app = globalThis as any;
        return app.document.body.classList.contains('civi-mini-mode') && app.HG_CiviEngine && app.CivicationLifePositions?.getLifeContext;
      });
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
        if (choiceId === 'rolleflaten' || (scenario.suggestion && sceneId === `d7_${scenario.route}_videre`)) {
          await page.locator('#civiSectionPopup [data-civi-life-position]').waitFor({ state: 'visible' });
          // A profile update may render the parent job card after the child
          // profile. The open profile must survive that actual event path.
          await page.evaluate(async () => {
            const app = globalThis as any;
            app.dispatchEvent(new app.Event('updateProfile'));
            await new Promise(resolve => app.requestAnimationFrame(() => app.requestAnimationFrame(resolve)));
          });
          await page.locator('#civiSectionPopup [data-civi-life-position]').waitFor({ state: 'visible' });
          assert.equal(await page.locator('#civiSectionPopup [data-civi-life-position]').count(), 1);
          assert.equal(await page.evaluate(() => (globalThis as any).CivicationState.getActivePosition()), null);
          assert.equal(await page.evaluate(() => (globalThis as any).CivicationLifePositions.getLifeContext().primary_life_position), null);
          if (scenario.suggestion) {
            const suggestion = page.locator('#civiSectionPopup [data-civi-life-suggestion]');
            assert.ok((await suggestion.innerText()).includes(scenario.suggestion));
            if (scenario.activate) {
              const select = page.locator('#civiLifePositionSelect');
              await select.selectOption('by|Byvandrer');
              const activate = page.locator('#civiSectionPopup [data-civi-life-suggestion-activate]');
              await activate.click();
              await page.waitForFunction(() => (globalThis as any).CivicationLifePositions.getLifeContext().primary_life_position?.label === 'Sideprosjektbygger');
              const life = await page.evaluate(() => (globalThis as any).CivicationLifePositions.getLifeContext());
              assert.equal(life.employment.formal_status, 'no_formal_job');
              assert.ok(life.active_life_positions.some((p: any) => p.label === 'Byvandrer'));
              assert.ok(life.active_life_positions.some((p: any) => p.label === 'Sideprosjektbygger'));
              const snapshot = await page.evaluate(() => (globalThis as any).CivicationNarrativeSceneSource.getActivationSnapshot({ active: null }));
              assert.ok(snapshot.matched_stream_ids.includes('naeringsliv_sideprosjektbygger_stream'));
            } else {
              assert.ok((await suggestion.innerText()).includes('Ikke tilgjengelig ennå'));
              assert.equal(await suggestion.locator('[data-civi-life-suggestion-activate]').count(), 0);
            }
          }
          await page.locator('#civiSectionPopup button[data-civi-popup-close]').click();
        }
        // A real action can leave Min dag (career on day 7). Return through
        // the user's footer so the next story choice stays reachable.
        await page.locator('.civi-footer button[data-category="minDag"]').click();
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
      if (scenario.id === 'byhistorie_avslaatt') assert.ok(!state.spilteScener.includes('d4_byhistorie_moetet') && !state.spilteScener.includes('d6_byhistorie_moetet') && !state.tidligereValg.byhistorie_mote_gjennomfort);
      if (scenario.id === 'skape_sen' || scenario.id === 'kultur_sen') assert.ok(!state.spilteScener.includes(`d4_${scenario.route}_moetet`) && state.spilteScener.includes(`d6_${scenario.route}_moetet`));
      await page.locator('[data-lifestory-symposium] summary').click();
      const storyText = await page.locator('[data-lifestory-symposium]').innerText();
      assert.ok(storyText.includes('Tidslinje') && storyText.includes('Møter og avtaler'));
      assert.ok(storyText.includes(state.arkiv[0].valgTekst));
      assert.ok(storyText.includes(state.arkiv.at(-1).valgTekst));
      if (scenario.suggestion) {
        assert.ok(storyText.includes(scenario.suggestion));
        await page.reload({ waitUntil: 'load' });
        await page.waitForFunction(() => !!(globalThis as any).CivicationLifestoryUI?.getRoleSuggestion?.());
        await page.locator('[data-lifestory-symposium] summary').click();
        await page.locator('[data-lifestory-life-profile]').click();
        await page.locator('#civiSectionPopup [data-civi-life-suggestion]').waitFor({ state: 'visible' });
        if (scenario.activate) assert.equal(await page.evaluate(() => (globalThis as any).CivicationLifePositions.getLifeContext().primary_life_position.label), 'Sideprosjektbygger');
        await page.locator('#civiSectionPopup button[data-civi-popup-close]').click();
        await page.locator('.civi-footer button[data-category="minDag"]').click();
      }
      assert.equal(errors.length, 0, `${scenario.id}: no page errors`);
      await page.screenshot({ path: join(outputDir, `arbeidsledig-${scenario.id}.png`), fullPage: true });
      reports.push({ id: scenario.id, days: state.dag, reloadedDays: Array.from(reloadedDays), trace, pageErrors: errors });
    } catch (error) {
      const snapshot = await page.evaluate(() => {
        const app = globalThis as any, doc = app.document;
        return { scene: app.CivicationLifestoryUI?.getCurrentSceneInfo?.(),
          hasProfileUi: !!app.CivicationLifePositionUI, profileCount: doc.querySelectorAll('[data-civi-life-position]').length,
          popup: doc.querySelector('#civiSectionPopup')?.getAttribute('aria-hidden'),
          popupText: doc.querySelector('#civiSectionPopupBody')?.innerText?.slice(0, 1800) };
      }).catch(() => null);
      console.error('Arbeidsledig browser failure', JSON.stringify({ scenario: scenario.id, trace, snapshot, pageErrors: errors }));
      await page.screenshot({ path: join(outputDir, `arbeidsledig-${scenario.id}-failure.png`), fullPage: true }).catch(() => {});
      throw error;
    } finally { await context.close(); }
  }
  return { cases: reports, fullShell: true, productionFunctionsReplaced: false };
}
