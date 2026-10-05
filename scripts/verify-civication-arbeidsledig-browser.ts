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
    { id: 'prosjekt_valgt', route: 'prosjekt', suggestion: 'Sideprosjektbygger', activate: true, choices: { d7_prosjekt_videre: 'naeringsliv_sideprosjektbygger' } },
    { id: 'mira_videre_spilt', route: 'musikk', suggestion: 'Frilansmusiker', activate: true, continue: true, choices: { d7_musikk_videre: 'rolleflaten' } },
    { id: 'lea_sideprosjekt_videre', route: 'prosjekt', suggestion: 'Sideprosjektbygger', activate: true, continue: true, continuation: 'sideprosjekt_med_lea', nextContinuation: 'frilans_neste_steg', nextRole: 'Frilanser', expectedOpening: 'd8_sideprosjekt_uten_mote', choices: { d3_prosjekt_invitasjon: 'egen_tid', d7_prosjekt_videre: 'naeringsliv_sideprosjektbygger', d8_sideprosjekt_uten_mote: 'egen_tid' } },
    { id: 'lea_frilans_videre', route: 'prosjekt', suggestion: 'Frilanser', activate: true, continue: true, continuation: 'frilans_med_lea', nextContinuation: 'grunder_neste_steg', nextRole: 'Gründerdrømmer', expectedOpening: 'd8_frilans_etter_samtalen', choices: { d3_prosjekt_invitasjon: 'dag6', d6_prosjekt_moetet: 'avgrens', d7_prosjekt_videre: 'naeringsliv_frilanser', d9_frilans_forberedelse: 'avlys', d11_grunder_nytt_sporsmal: 'avsta' } },
    { id: 'lea_grunder_videre', route: 'prosjekt', suggestion: 'Gründerdrømmer', activate: true, continue: true, continuation: 'grunder_med_lea', nextContinuation: 'sideprosjekt_neste_steg', nextRole: 'Sideprosjektbygger', expectedOpening: 'd8_grunder_etter_modellen', choices: { d7_prosjekt_videre: 'naeringsliv_grunderdrommer' } },
    { id: 'mira_videre_avlyst', route: 'musikk', suggestion: 'Frilansmusiker', activate: true, continue: true, choices: { d5_booker: 'avsta', d7_musikk_videre: 'rolleflaten', d9_mira_forberedelse: 'avlys' } },
    { id: 'arvid_videre_gjennomfort', route: 'miljo', suggestion: 'Gangster', activate: true, continue: true, continuation: 'miljo_med_arvid', nextContinuation: 'miljo_navnet_ditt', expectedOpening: 'd8_arvid_etter_oppdraget', choices: { d7_miljo_videre: 'rolleflaten', d9_arvid_praten: 'lov', d10_arvid_loftet: 'rett', d11_arvid_med_kontakt: 'navn', d12_arvid_navnet: 'la_staa', d13_arvid_forventningen: 'rett' } },
    { id: 'arvid_videre_avbrutt', route: 'miljo', suggestion: 'Gangster', activate: true, continue: true, continuation: 'miljo_med_arvid', nextContinuation: 'miljo_navnet_ditt', expectedOpening: 'd8_arvid_etter_avbruddet', choices: { d5_amir_oppmotet: 'ga_hjem', d7_miljo_videre: 'rolleflaten', d9_arvid_praten: 'ga', d10_arvid_etter_praten: 'avstand', d11_arvid_med_avstand: 'kontakt', d12_arvid_avklaringen: 'nei' } },
    { id: 'arvid_videre_avstand', route: 'miljo', suggestion: 'Gangster', activate: true, continue: true, continuation: 'miljo_med_arvid', nextContinuation: 'miljo_navnet_ditt', expectedOpening: 'd8_arvid_etter_avstanden', choices: { d4_amir_rammen: 'trekk_deg', d5_amir_uten_oppmote: 'avstand', d7_miljo_videre: 'rolleflaten', d8_arvid_etter_avstanden: 'avstand', d10_arvid_uten_prat: 'avstand', d11_arvid_med_avstand: 'avstand' } }
  ];
  const representatives: Record<string, any> = {
    lea_sideprosjekt_videre: { type: 'lea', id: 'jens_jacob_jensen_myrens', name: 'Jens Jacob Jensen' },
    lea_frilans_videre: { type: 'lea', id: 'peter_emil_steen', name: 'Peter Emil Steen' },
    mira_videre_spilt: { type: 'mira', id: 'bugge_wesseltoft', name: 'Bugge Wesseltoft' },
    mira_videre_avlyst: { type: 'mira', id: 'mari_boine', name: 'Mari Boine' },
    arvid_videre_gjennomfort: { type: 'amir', id: 'attila_horvath', name: 'Attila Horvath' },
    arvid_videre_avbrutt: { type: 'amir', id: 'sossen_krohg', name: 'Sossen Krohg' }
  };
  const reports: any[] = [];
  for (const scenario of cases) {
    const representative = representatives[scenario.id];
    const context = await browser.newContext({ viewport: scenario.id === 'musikk_booket' ? { width: 1024, height: 768 } : { width: 390, height: 844 } });
    if (representative) await context.addInitScript((person: any) => {
      if (!localStorage.getItem('arbeidsledig_browser_people_seeded')) {
        localStorage.setItem('people_collected', JSON.stringify({ [person.id]: true }));
        localStorage.setItem('arbeidsledig_browser_people_seeded', '1');
      }
    }, representative);
    if (scenario.activate) await context.addInitScript(() => {
      // Fixture data before boot; all role choices still use real UI/API.
      if (!localStorage.getItem('arbeidsledig_browser_merits_seeded')) {
        localStorage.setItem('merits_by_category', JSON.stringify({ by: { points: 5 }, naeringsliv: { points: 85 }, musikk: { points: 85 }, subkultur: { points: 60 } }));
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
      if (representative) {
        await page.waitForFunction((person: any) => (globalThis as any).CivicationLifestoryState.load().personRepresentanter?.[person.type]?.personId === person.id, representative);
        state = await readState();
        assert.equal(state.personRepresentanter[representative.type].navn, representative.name);
      }
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
              await page.waitForFunction((label: string) => (globalThis as any).CivicationLifePositions.getLifeContext().primary_life_position?.label === label, scenario.suggestion);
              const life = await page.evaluate(() => (globalThis as any).CivicationLifePositions.getLifeContext());
              assert.equal(life.employment.formal_status, 'no_formal_job');
              assert.ok(life.active_life_positions.some((p: any) => p.label === 'Byvandrer'));
              assert.ok(life.active_life_positions.some((p: any) => p.label === scenario.suggestion));
              const snapshot = await page.evaluate(() => (globalThis as any).CivicationNarrativeSceneSource.getActivationSnapshot({ active: null }));
              assert.ok(snapshot.matched_stream_ids.includes(scenario.route === 'musikk' ? 'musikk_frilansmusiker_stream' : scenario.route === 'miljo' ? 'subkultur_gangster_stream' : scenario.suggestion === 'Frilanser' ? 'naeringsliv_frilanser_stream' : scenario.suggestion === 'Gründerdrømmer' ? 'naeringsliv_grunderdrommer_stream' : 'naeringsliv_sideprosjektbygger_stream'));
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
      if (scenario.continue) {
        const weekArchive = JSON.stringify(state.arkiv);
        const archiveLength = state.arkiv.length;
        const chapterId = scenario.continuation || 'musikk_med_mira';
        const badge = scenario.route === 'prosjekt' ? 'naeringsliv' : scenario.route === 'miljo' ? 'subkultur' : 'musikk';
        const roleLabel = scenario.suggestion;
        await page.locator(`[data-lifestory-continue="${chapterId}"]`).click();
        await page.waitForFunction(() => (globalThis as any).CivicationLifestoryState.load().dag === 8);
        state = await readState();
        const frozenEnding = JSON.stringify(state.kapittelArkiv[0]);
        const pending = await page.evaluate(() => (globalThis as any).CivicationLifestoryUI.getCurrentSceneInfo().sceneId);
        assert.equal(pending, scenario.expectedOpening || (scenario.id === 'mira_videre_spilt' ? 'd8_mira_etter_settet' : 'd8_mira_uten_sett'));
        assert.equal(JSON.stringify(state.arkiv), weekArchive);
        // Change the primary life position through the real profile, reload
        // while paused, then restore it through the same player control.
        await page.locator('[data-lifestory-symposium] summary').click();
        await page.locator('[data-lifestory-life-profile]').click();
        await page.locator('#civiLifePositionSelect').selectOption('by|Byvandrer');
        await page.locator('#civiSectionPopup button[data-civi-popup-close]').click();
        await page.locator('.civi-footer button[data-category="minDag"]').click();
        await page.locator('[data-lifestory-paused]').waitFor();
        assert.equal(await page.locator('[data-lifestory-choice]').count(), 0);
        const paused = JSON.stringify(await readState());
        await page.reload({ waitUntil: 'load' });
        await page.locator('[data-lifestory-paused]').waitFor();
        await page.waitForFunction(() => !!(globalThis as any).CivicationLifePositions?.getLifeContext);
        assert.equal(JSON.stringify(await readState()), paused);
        await page.locator('[data-lifestory-paused] [data-lifestory-life-profile]').click();
        await page.locator('#civiLifePositionSelect').selectOption(`${encodeURIComponent(badge)}|${encodeURIComponent(roleLabel)}`);
        await page.locator('#civiSectionPopup button[data-civi-popup-close]').click();
        await page.locator('.civi-footer button[data-category="minDag"]').click();
        assert.equal(await page.evaluate(() => (globalThis as any).CivicationLifestoryUI.getCurrentSceneInfo().sceneId), pending);
        let nativeGuard = 0;
        const nativeReloadDays = new Set<number>();
        while (true) {
          state = await readState();
          if (state.dagFerdig) {
            if (state.dag === 10) break;
            await page.locator('[data-lifestory-next-day]').click();
            continue;
          }
          const sceneId = await page.evaluate(() => (globalThis as any).CivicationLifestoryUI.getCurrentSceneInfo().sceneId);
          const choices = page.locator(`[data-lifestory-scene="${sceneId}"]`);
          const choiceId = scenario.choices[sceneId] || await choices.first().getAttribute('data-lifestory-choice');
          await page.locator(`[data-lifestory-scene="${sceneId}"][data-lifestory-choice="${choiceId}"]`).click();
          const after = await readState();
          assert.equal(after.arkiv.length, state.arkiv.length + 1);
          assert.equal(JSON.stringify(after.arkiv.slice(0, archiveLength)), weekArchive);
          assert.equal(JSON.stringify(after.kapittelArkiv[0]), frozenEnding);
          trace.push({ day: state.dag, phase: state.fase, sceneId, choiceId });
          const beforeReload = JSON.stringify(after);
          if (scenario.route === 'musikk' || !nativeReloadDays.has(after.dag)) {
          nativeReloadDays.add(after.dag);
          await page.reload({ waitUntil: 'load' });
          await page.waitForFunction((expectedRole: string) => {
            const app = globalThis as any;
            return app.CivicationLifestoryUI?.getCurrentSceneInfo?.() && app.CivicationLifePositions?.getLifeContext?.().primary_life_position?.label === expectedRole
              && !app.document.querySelector('[data-lifestory-paused]');
          }, roleLabel);
          assert.equal(JSON.stringify(await readState()), beforeReload);
          }
          assert.ok(++nativeGuard < 20);
        }
        if (scenario.route === 'musikk') {
          assert.ok(state.tidligereValg.musikk_kapittel_avsluttet);
          assert.equal(!!state.tidligereValg.mira_ny_prove_gjennomfort, scenario.id === 'mira_videre_spilt');
          assert.equal(!!state.tidligereValg.mira_ny_prove_avbrutt, scenario.id === 'mira_videre_avlyst');
        } else if (scenario.route === 'miljo') {
          assert.ok(state.tidligereValg.arvid_kapittel10_avsluttet);
          if (scenario.id === 'arvid_videre_avbrutt') assert.ok(state.tidligereValg.amir_oppdrag_avbrutt && state.tidligereValg.arvid_prat9_avbrutt && !state.tidligereValg.arvid_prat9_gjennomfort);
          if (scenario.id === 'arvid_videre_avstand') assert.ok(state.tidligereValg.amir_trakk_seg && !state.tidligereValg.arvid_prat9_avtalt && !state.spilteScener.includes('d9_arvid_praten'));
        } else {
          const prefix = chapterId.replace('_med_lea', '');
          assert.ok(state.tidligereValg[prefix + '_kapittel_avsluttet']);
          if (scenario.id === 'lea_frilans_videre') assert.ok(state.tidligereValg.frilans_mote_avbrutt && !state.tidligereValg.frilans_mote_gjennomfort);
          if (scenario.id === 'lea_sideprosjekt_videre') assert.ok(!state.tidligereValg.sideprosjekt_mote_gjennomfort && !state.tidligereValg.prosjekt_mote_gjennomfort);
          if (scenario.id === 'lea_grunder_videre') assert.ok(state.tidligereValg.grunder_mote_gjennomfort);
        }
        const firstChapterArchive = JSON.stringify(state.arkiv);
        const firstChapterLength = state.arkiv.length;
        const previousChapters = JSON.stringify(state.kapittelArkiv);
        const secondRole = scenario.nextRole || roleLabel;
        if (secondRole !== roleLabel) {
          await page.locator('[data-lifestory-symposium] summary').click();
          await page.locator('[data-lifestory-life-profile]').click();
          await page.locator('#civiLifePositionSelect').selectOption(`${encodeURIComponent(badge)}|${encodeURIComponent(secondRole)}`);
          await page.locator('#civiSectionPopup button[data-civi-popup-close]').click();
          await page.locator('.civi-footer button[data-category="minDag"]').click();
          assert.equal(await page.locator('[data-lifestory-paused]').count(), 0);
        }
        const secondId = scenario.nextContinuation || 'musikk_foresporselen';
        await page.locator(`[data-lifestory-continue="${secondId}"]`).click();
        await page.waitForFunction(() => (globalThis as any).CivicationLifestoryState.load().dag === 11);
        state = await readState();
        assert.deepEqual(state.fortsettelser, [chapterId, secondId]);
        assert.equal(state.kapittelArkiv.length, 2);
        assert.equal(JSON.stringify(state.kapittelArkiv.slice(0, 1)), previousChapters);
        const chapters = JSON.stringify(state.kapittelArkiv);
        const secondReloadDays = new Set<number>();
        while (true) {
          state = await readState();
          if (state.dagFerdig) {
            if (state.dag === 13) break;
            await page.locator('[data-lifestory-next-day]').click();
            continue;
          }
          const sceneId = await page.evaluate(() => (globalThis as any).CivicationLifestoryUI.getCurrentSceneInfo().sceneId);
          const choices = page.locator(`[data-lifestory-scene="${sceneId}"]`);
          const choiceId = scenario.choices[sceneId] || (scenario.id === 'mira_videre_avlyst' && sceneId === 'd12_musikk_omfang' ? 'avsta' : await choices.first().getAttribute('data-lifestory-choice'));
          await page.locator(`[data-lifestory-scene="${sceneId}"][data-lifestory-choice="${choiceId}"]`).click();
          const after = await readState();
          assert.equal(JSON.stringify(after.arkiv.slice(0, firstChapterLength)), firstChapterArchive);
          assert.equal(JSON.stringify(after.kapittelArkiv), chapters);
          trace.push({ day: state.dag, phase: state.fase, sceneId, choiceId });
          if (!secondReloadDays.has(after.dag)) {
            secondReloadDays.add(after.dag);
            const before = JSON.stringify(after);
            await page.reload({ waitUntil: 'load' });
            await page.waitForFunction((label: string) => {
              const app = globalThis as any;
              return app.CivicationLifestoryUI?.getCurrentSceneInfo?.() && app.CivicationLifePositions?.getLifeContext?.().primary_life_position?.label === label && !app.document.querySelector('[data-lifestory-paused]');
            }, secondRole);
            assert.equal(JSON.stringify(await readState()), before);
          }
          assert.ok(++nativeGuard < 40);
        }
        assert.equal(secondReloadDays.size, 3);
        assert.equal(await page.locator('[data-lifestory-continue]').count(), 0);
        assert.equal(await page.locator('[data-lifestory-next-day]').count(), 0);
        assert.ok(state.threadState[scenario.route === 'musikk' ? 'musikk_omfang_og_tid' : scenario.route === 'miljo' ? 'arvid_navnet_pa_invitasjonen' : secondId.replace('_neste_steg', '_etter_forste_kapittel')].status === 'completed');
        if (scenario.route === 'miljo') {
          assert.ok(state.tidligereValg.arvid_kapittel13_avsluttet);
          if (scenario.id === 'arvid_videre_gjennomfort') assert.ok(state.tidligereValg.arvid_rettet_loftet && state.tidligereValg.arvid_retning13 === 'kontakt');
          if (scenario.id === 'arvid_videre_avstand') assert.ok(state.tidligereValg.arvid_retning13 === 'avstand' && !state.spilteScener.includes('d12_arvid_avklaringen'));
        }
        assert.equal(state.threadState.nav_og_meldekortet.status, 'completed');
      }
      await page.locator('[data-lifestory-symposium] summary').click();
      const storyText = await page.locator('[data-lifestory-symposium]').innerText();
      if (representative) {
        assert.ok(storyText.includes(representative.name));
        assert.ok(!/\b(?:Lea|Mira|Arvid)\b/.test(storyText));
        assert.ok(state.arkiv.some((e: any) => e.personRepresentanter?.[representative.type]?.personId === representative.id));
        const cast = JSON.stringify(state.personRepresentanter[representative.type]);
        // Collection changes after the meeting cannot change this story's cast.
        await page.evaluate(() => localStorage.setItem('people_collected', '{}'));
        await page.reload({ waitUntil: 'load' });
        await page.waitForFunction(() => !!(globalThis as any).CivicationLifestoryUI?.getCurrentSceneInfo?.());
        assert.equal(JSON.stringify((await readState()).personRepresentanter[representative.type]), cast);
        await page.locator('[data-lifestory-symposium] summary').click();
      }
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
        if (scenario.activate) assert.equal(await page.evaluate(() => (globalThis as any).CivicationLifePositions.getLifeContext().primary_life_position.label), scenario.nextRole || scenario.suggestion);
        await page.locator('#civiSectionPopup button[data-civi-popup-close]').click();
        await page.locator('.civi-footer button[data-category="minDag"]').click();
      }
      assert.equal(errors.length, 0, `${scenario.id}: no page errors`);
      await page.screenshot({ path: join(outputDir, `arbeidsledig-${scenario.id}.png`), fullPage: true });
      reports.push({ id: scenario.id, days: state.dag, representative: representative || null, reloadedDays: Array.from(reloadedDays), trace, pageErrors: errors });
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
