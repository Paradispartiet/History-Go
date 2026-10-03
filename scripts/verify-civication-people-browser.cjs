// Browser regression through the supported Civication.html lite-map boot, catalog, decorator,
// workday transport, inbox, selector and UI. Only saved game data is controlled;
// no production function is replaced. This is not a career-unlock/playthrough test.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

module.exports = async function verifyPeople(browser, origin, outputDir) {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const failedRequests = [];
  const seededCollection = JSON.stringify({ munch: true, gustav_vigeland: true });
  const reviewedQuestion = 'Hvordan merker teksten kunstnerutsagn og kuratorisk tolkning hver for seg?';
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  try {
    // Rich-map boot is diagnosed separately without this flag. Its resource
    // pressure must not be mistaken for a People-contract regression.
    await page.goto(`${origin}/Civication.html?civicationLite=1`, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.HG_CiviEngine
      && typeof window.CivicationRoleModelRuntime?.decorateMail === 'function'
      && typeof window.CivicationSceneCatalog?.getRoleMails === 'function'
      && typeof window.CivicationNextActionSelector?.getCurrent === 'function'
      && typeof window.CivicationNextActionUI?.open === 'function'
      && typeof window.CivicationCalendar?.setPhase === 'function');

    const selected = await page.evaluate(async () => {
      const active = { career_id: 'kunst', role_scope: 'kunst_kuratering_og_program',
        role_id: 'kunst_kuratering_og_program', brand_id: 'munch', title: 'Kuratering og program' };
      localStorage.setItem('people_collected', JSON.stringify({ munch: true, gustav_vigeland: true }));
      window.CivicationState.setActivePosition(active);
      window.CivicationWorkdayRuntime.startWorkday(active);
      window.CivicationCalendar.setPhase('workday');
      const mails = await window.CivicationSceneCatalog.getRoleMails(active);
      const source = mails.find(mail => mail.id === 'kunst_kuratering_og_program_job_kunstneruenighet_tekst_003');
      if (!source) throw new Error('Reviewed Munch mail missing from actual scene catalog');
      const event = window.CivicationWorkdayMailBuilder.toWorkdayMail(active, source, 'workday', 0);
      const result = window.CivicationMailEngine.sendMail(event);
      if (!result.ok) throw new Error(`Could not deliver fixture: ${result.reason}`);
      window.CivicationState.setState({ mail_day_runtime_v1: {
        version: 1, date: new Date().toISOString().slice(0, 10), role_scope: active.role_scope,
        career_id: active.career_id, delivered_ids: [event.id], answered_ids: [], current_index: 0,
        items: [{ status: 'delivered', phase: 'workday', event }]
      } });
      if (window.CivicationNextActionSelector.getCurrent()?.id !== event.id) {
        throw new Error('Real NextAction selector did not select the reviewed fixture');
      }
      window.CivicationNextActionUI.open();
      return { mailId: event.id, people: event.role_model_meta?.history_people?.map(person => person.id) };
    });
    assert.deepEqual(selected.people, ['munch']);
    assert.equal(await page.evaluate(() => localStorage.getItem('people_collected')), seededCollection);
    await page.locator(`article[data-mail-id="${selected.mailId}"]`).waitFor();
    await page.getByRole('button', { name: 'Snakk med Edvard Munch', exact: true }).click();
    const conversation = page.locator('[data-civi-role-person-conversation="munch"]');
    await conversation.waitFor();
    const text = await conversation.innerText();
    assert(text.includes('MUNCH gjengir Munchs brev til Pola Gauguin fra 1932 om bildeutvalg og hans skepsis til Vampyr.'));
    assert(text.includes(reviewedQuestion));
    assert(text.includes('Oppgaven krever synlig skille mellom kunstnerens posisjon og veggtekstens lesning.'));
    assert(text.includes('Kunstnerutsagnet er ikke en universell fasit eller et samtykke til ny bruk.'));
    assert.equal(await page.getByRole('link', { name: 'MUNCH: Vampire in disgrace', exact: true }).getAttribute('href'),
      'https://www.munch.no/en/our-collection/vampire-in-disgrace/');
    assert.equal(await page.getByRole('button', { name: 'Snakk med Gustav Vigeland', exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Hvor ligger dilemmaet?', exact: true }).click();
    const dilemmaText = await conversation.innerText();
    assert(dilemmaText.includes(reviewedQuestion));
    assert.notEqual(dilemmaText, text);
    assert.equal(await page.getByRole('button', { name: 'Hvor ligger dilemmaet?', exact: true }).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.evaluate(() => localStorage.getItem('people_collected')), seededCollection);
    await page.screenshot({ path: path.join(outputDir, 'people-linked.png'), fullPage: true });

    // Keep the persisted linked mail and reset only the independent collection.
    await page.evaluate(() => {
      localStorage.setItem('people_collected', '{}');
      window.CivicationNextActionUI.refresh();
    });
    assert.equal(await page.locator('[data-civi-role-person]').count(), 0);
    assert.equal(await page.evaluate(() => localStorage.getItem('people_collected')), '{}');

    // New catalog decoration with only an unrelated collected artist stays empty.
    const unrelated = await page.evaluate(async () => {
      localStorage.setItem('people_collected', JSON.stringify({ gustav_vigeland: true }));
      const mails = await window.CivicationSceneCatalog.getRoleMails(window.CivicationState.getActivePosition());
      const mail = mails.find(item => item.id === 'kunst_kuratering_og_program_job_kunstneruenighet_tekst_003');
      return mail.role_model_meta.history_people.map(person => person.id);
    });
    assert.deepEqual(unrelated, []);
    assert.equal(await page.evaluate(() => localStorage.getItem('people_collected')), JSON.stringify({ gustav_vigeland: true }));

    // Exercise explicit empty binding and an old category-only save through the
    // same real inbox/selector, and retain their answer choices.
    for (const scenario of ['empty_binding', 'legacy_saved_mail']) {
      const fixture = await page.evaluate(async ({ scenario, previousId }) => {
        localStorage.setItem('people_collected', JSON.stringify({ munch: true, gustav_vigeland: true }));
        window.CivicationMailEngine.archiveMail(previousId);
        const active = window.CivicationState.getActivePosition();
        const mails = await window.CivicationSceneCatalog.getRoleMails(active);
        const source = mails.find(mail => mail.id === (scenario === 'empty_binding'
          ? 'kunst_kuratering_og_program_people_seniorstatus_og_utnevnelse_001'
          : 'kunst_kuratering_og_program_job_kunstneruenighet_tekst_003'));
        if (!source) throw new Error(`${scenario} source missing`);
        const event = window.CivicationWorkdayMailBuilder.toWorkdayMail(active, source, 'workday', 1,
          { runtimeInstanceKey: `_${scenario}` });
        if (scenario === 'legacy_saved_mail') {
          delete event.role_model_meta.history_people_relevance;
          event.role_model_meta.history_people = [{ id: 'gustav_vigeland', name: 'Gustav Vigeland', category: 'kunst' }];
        }
        const result = window.CivicationMailEngine.sendMail(event);
        if (!result.ok) throw new Error(`${scenario} delivery failed: ${result.reason}`);
        window.CivicationState.setState({ mail_day_runtime_v1: { delivered_ids: [event.id],
          items: [{ status: 'delivered', phase: 'workday', event }] } });
        window.CivicationNextActionUI.refresh();
        return { id: event.id, choiceCount: event.choices.length };
      }, { scenario, previousId: selected.mailId });
      selected.mailId = fixture.id;
      await page.locator(`article[data-mail-id="${fixture.id}"]`).waitFor();
      assert.equal(await page.locator('[data-civi-role-person]').count(), 0, scenario);
      assert(fixture.choiceCount > 0, `${scenario} must retain answer choices`);
      assert.equal(await page.locator('[data-civi-next-action-answer]').count(), fixture.choiceCount, scenario);
      assert.equal(await page.evaluate(() => localStorage.getItem('people_collected')), seededCollection);
    }
    assert.deepEqual(pageErrors, []);
    return { appBootMode: 'civicationLite=1', relevantCollectedPerson: 'munch', caseQuestionSourceAndLimit: true,
      unrelatedPersonHidden: true, emptyBindingHidden: true, legacySavedMailHidden: true,
      resetCollectionHidden: true, collectionUnchangedByRuntime: true, answerChoicesRetained: true, pageErrors };
  } catch (error) {
    await page.screenshot({ path: path.join(outputDir, 'people-failure.png'), fullPage: true }).catch(() => {});
    const readiness = await page.evaluate(() => ({ engine: !!window.HG_CiviEngine,
      roleRuntime: !!window.CivicationRoleModelRuntime, catalog: !!window.CivicationSceneCatalog,
      selector: !!window.CivicationNextActionSelector, ui: !!window.CivicationNextActionUI,
      calendar: typeof window.CivicationCalendar?.setPhase,
      lastScripts: Array.from(document.scripts).map(script => script.src).slice(-8) })).catch(() => null);
    console.error('People browser failure', JSON.stringify({ pageErrors, consoleErrors, failedRequests, readiness }));
    throw error;
  } finally {
    fs.writeFileSync(path.join(outputDir, 'people-diagnostics.json'), JSON.stringify({ pageErrors, consoleErrors, failedRequests }, null, 2) + '\n');
    await context.close();
  }
};
