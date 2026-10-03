// Browser regression through the real Civication.html boot, catalog, decorator,
// workday transport, inbox, selector and UI. Only saved game data is controlled;
// no production function is replaced. This is not a career-unlock/playthrough test.
const assert = require('node:assert/strict');
const path = require('node:path');

module.exports = async function verifyPeople(browser, origin, outputDir) {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  try {
    await page.goto(`${origin}/Civication.html`, { waitUntil: 'load' });
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
      return { mailId: event.id, people: event.role_model_meta?.history_people?.map(person => person.id),
        collection: localStorage.getItem('people_collected') };
    });
    assert.deepEqual(selected.people, ['munch']);
    await page.locator(`article[data-mail-id="${selected.mailId}"]`).waitFor();
    await page.getByRole('button', { name: 'Snakk med Edvard Munch', exact: true }).click();
    const conversation = page.locator('[data-civi-role-person-conversation="munch"]');
    await conversation.waitFor();
    const text = await conversation.innerText();
    assert(text.includes('Pola Gauguin') && text.includes('Spørsmål til saken:'));
    assert(text.includes('et samtykke til ny bruk'));
    assert.equal(await page.getByRole('link', { name: 'MUNCH: Vampire in disgrace', exact: true }).getAttribute('href'),
      'https://www.munch.no/en/our-collection/vampire-in-disgrace/');
    assert.equal(await page.getByRole('button', { name: 'Snakk med Gustav Vigeland', exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Hvor ligger dilemmaet?', exact: true }).click();
    assert((await conversation.innerText()).includes('Spørsmål til saken:'));
    assert.equal(await page.evaluate(() => localStorage.getItem('people_collected')), selected.collection);
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
        return { id: event.id, choiceCount: event.choices.length, collection: localStorage.getItem('people_collected') };
      }, { scenario, previousId: selected.mailId });
      selected.mailId = fixture.id;
      await page.locator(`article[data-mail-id="${fixture.id}"]`).waitFor();
      assert.equal(await page.locator('[data-civi-role-person]').count(), 0, scenario);
      assert(fixture.choiceCount > 0, `${scenario} must retain answer choices`);
      assert.equal(await page.locator('[data-civi-next-action-answer]').count(), fixture.choiceCount, scenario);
      assert.equal(await page.evaluate(() => localStorage.getItem('people_collected')), fixture.collection);
    }
    assert.deepEqual(pageErrors, []);
    return { fullAppBoot: true, relevantCollectedPerson: 'munch', caseQuestionSourceAndLimit: true,
      unrelatedPersonHidden: true, emptyBindingHidden: true, legacySavedMailHidden: true,
      resetCollectionHidden: true, collectionUnchangedByRuntime: true, answerChoicesRetained: true, pageErrors };
  } catch (error) {
    await page.screenshot({ path: path.join(outputDir, 'people-failure.png'), fullPage: true }).catch(() => {});
    console.error('People browser failure', { pageErrors });
    throw error;
  } finally {
    await context.close();
  }
};
