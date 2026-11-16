'use strict';
// Real published quiz answers earn merits; actual Jobs/Home/Economy/UI handle the
// account. Boundaries: visited geography, release approval, existing opening saldo,
// manual completed-day clock and an in-memory account backend. No browser QA claimed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const source = path => fs.readFileSync(path, 'utf8');
const config = read('data/Civication/economy/nok-budget-prototype-2026.json');
const approved = JSON.parse(JSON.stringify(config));
approved.status = 'active'; approved.migration.activated = true; // Approval fixture only.
const quizPath = 'data/quiz/naeringsliv/akerselva_industri_sets_merged.json';
const quiz = read(quizPath);
const entries = read('data/quiz/manifest.json').sets.filter(e => e.targetId === quiz.targetId && e.file === quizPath);
assert.equal(entries.length, 5);
const db = { record: null, writes: 0 };
const windows = [];
async function boot(seed = {}) {
  const dom = new JSDOM('<body><div id="civiEconomyPanel"></div><div id="civiStorePanel"></div><div id="activeJobCard"></div><div id="civiSalaryLine"></div><div id="homeStatusContent"></div><div id="districtList"></div></body>',
    { url: 'https://example.test/Civication.html', runScripts: 'outside-only' });
  windows.push(dom);
  const w = dom.window;
  for (const [key, value] of Object.entries(seed)) w.localStorage.setItem(key, value);
  w.setInterval = () => 0; // Flush explicitly; never wait for background polling.
  w.HistoryGoAHAAuth = { getSession: async () => ({ user: { id: 'nok-journey-player' } }),
    getClient: async () => ({ from(table) {
      assert.equal(table, 'aha_imports');
      return { select() { return this; }, eq() { return this; },
        async maybeSingle() { return { data: db.record, error: null }; },
        async upsert(row) { db.record = row; db.writes++; return { error: null }; } };
    } }) };
  w.eval(source('js/Civication/core/CivicationCloudSave.js'));
  await w.CivicationCloudSave.ready; // Restore before boot can initialize local projections.
  w.fetch = async url => {
    const path = new URL(url, w.location.href).pathname.slice(1);
    // Bounded real corpus: published entries and questions, not fabricated scores/progress.
    const data = path === 'data/quiz/manifest.json' ? { files: [], sets: entries }
      : path === 'data/Civication/economy/nok-budget-prototype-2026.json' ? approved : read(path);
    return { ok: true, json: async () => data };
  };
  for (const path of ['core/civicationState.js', 'core/civicationCalendar.js', 'core/civicationNokBudget.js',
    'core/civicationEconomyEngine.js', 'core/civicationJobs.js', 'civicationCommercial.js', 'systems/civicationJobEligibilityRuntime.js',
    'systems/civicationCareerRoleResolver.js', 'ui/CivicationHome.js', 'ui/CivicationUI.js', 'ui/CivicationEconomyUI.js', 'ui/CivicationStoreUI.js'])
    w.eval(source('js/Civication/' + path));
  w.CivicationJobEligibilityRuntime.registerKnowledgeRequirements(read('data/Civication/jobKnowledgeRequirements.json'));
  w.CivicationJobEligibilityRuntime.patchJobsPushOffer();
  await w.CivicationEconomyUI.loadActivationConfig();
  return w;
}
async function earnFiveSets(w) {
  assert.equal(w.localStorage.getItem('merits_by_category'), null);
  w.eval(source('js/quiz/answer-shuffle.js'));
  w.eval(source('js/quizzes.js'));
  w.QuizEngine.init({ quizFeedbackMs: 0, getPlaceById: id => id === quiz.targetId ? { id, name: 'Akerselva' } : null,
    getVisited: () => ({ [quiz.targetId]: true }), showToast() {} }); // Explicit visit boundary.
  let answered = 0;
  for (const [index, set] of quiz.sets.slice(0, 5).entries()) {
    await w.QuizEngine.start(quiz.targetId);
    for (const question of set.questions) {
      assert.equal(w.document.getElementById('quizQuestion').textContent, question.question);
      const button = [...w.document.querySelectorAll('#quizChoices button')].find(b => b.textContent === question.answer);
      assert.ok(button, 'published answer is present');
      button.click(); answered++;
      await new Promise(resolve => setTimeout(resolve, 2));
    }
    const merits = JSON.parse(w.localStorage.getItem('merits_by_category'));
    assert.equal(merits.naeringsliv.points, index + 1, 'only real answer completion awards the merit');
    assert.equal(w.CivicationState.getActivePosition(), null);
    if (index < 4) assert.equal(w.CivicationJobs.getLatestPendingOffer(), null);
  }
  assert.equal(answered, 30);
  return answered;
}
async function checkpoint(w) {
  await w.CivicationCloudSave.flush();
  const keys = ['hg_civi_wallet_v1', 'hg_active_position_v1', 'hg_civi_calendar_v1',
    'hg_job_offers_v1', 'hg_pc_inventory_v1', 'merits_by_category', 'hg_quiz_sets_v1', 'quiz_progress', 'hg_learning_log_v1'];
  for (const key of keys) {
    const raw = w.localStorage.getItem(key);
    assert.equal(db.record.payload.state[key] ?? null, raw === 'null' ? null : raw, key + ' is backed up');
  }
  const restored = await boot();
  for (const key of keys) assert.deepEqual(JSON.parse(restored.localStorage.getItem(key)), JSON.parse(w.localStorage.getItem(key)), key + ' is restored');
  const before = JSON.stringify(restored.CivicationState.getWallet());
  restored.CivicationEconomyEngine.tickWeekly();
  assert.equal(JSON.stringify(restored.CivicationState.getWallet()), before, 'restore cannot pay salary or rent again');
  const consumed = restored.CivicationState.getWallet().nok_v1.shopping?.consumptions?.[0];
  if (consumed) {
    assert.equal(restored.HG_CiviShop.consumeNokProduct(consumed.productId, consumed.requestId).skipped, true);
    assert.equal(JSON.stringify(restored.CivicationState.getWallet()), before, 'restore cannot consume the same portion twice');
  }
  const writes = db.writes;
  await restored.CivicationCloudSave.flush();
  assert.equal(db.writes, writes, 'unchanged restored account does not rewrite backup');
  return restored;
}
(async () => {
  let w = await boot({ hg_civi_wallet_v1: JSON.stringify({ balance: 125.25, last_tick_day_index: 1,
    history: [{ id: 'old-purchase' }] }), hg_pc_inventory_v1: '{"packs":{"streetwear_basic":true},"ownedItems":["streetwear_basic"],"style_counts":{"street":1}}' });
  w.document.querySelector('[data-nok-activate]').click();
  assert.equal(w.CivicationState.getWallet().nok_v1.active, true);
  assert.equal(w.CivicationState.getWallet().balance, 125.25);
  assert.equal(w.CivicationHome.selectDistrict('sagene'), true);
  w.CivicationEconomyEngine.tickWeekly();
  assert.equal(w.CivicationState.getWallet().nok_v1.invoices[0].amountNok, 10090);
  assert.equal(w.CivicationEconomyEngine.payNokInvoice(w.CivicationState.getWallet().nok_v1.invoices[0].id).reason, 'NOT_ENOUGH_PC');
  const checkpoints = [];
  for (let day = 1; day <= 90; day++) {
    if (day === 8) {
      await earnFiveSets(w);
      const offer = w.CivicationJobs.getLatestPendingOffer();
      assert.equal(offer.nok_job_id, config.job.id);
      assert.equal(offer.eligibility.knowledge_gate, 'passed');
      await w.CivicationUI.render();
      assert.ok(w.document.querySelector('[data-civi-nok-offer-terms]').textContent.includes('Brutto:'));
      w.document.getElementById('civiOfferAccept').click();
      assert.equal(w.CivicationState.getActivePosition().title, config.job.roleTitle);
      assert.equal(w.CivicationCareerRoleResolver.resolveCareerRoleScope(w.CivicationState.getActivePosition()), 'ekspeditor');
      assert.equal(w.CivicationState.getWallet().balance, 125.25, 'no acceptance bonus');
      await w.HG_CiviShop.buyPack('tine-milk-1l', 'journey-milk-1');
      await w.HG_CiviShop.buyPack('tine-milk-1l', 'journey-milk-2');
    }
    if ([9, 10, 33, 34].includes(day)) {
      const productId = day < 30 ? 'tine-milk-1l' : 'axa-oats-1100g';
      assert.equal(w.HG_CiviShop.consumeNokProduct(productId, 'journey-use-' + day).ok, true);
    }
    if (day === 60) { // March is entirely unemployed, after February salary was settled.
      w.CivicationState.setActivePosition(null);
      w.CivicationState.setState({ career: { activeJob: null } });
    }
    if (day === 32 || day === 62) {
      w.CivicationEconomyUI.render();
      w.document.querySelector('[data-nok-transport]').click();
      assert.ok(w.CivicationEconomyEngine.getNokTransportStatus().current);
      if (day === 32) await w.HG_CiviShop.buyPack('axa-oats-1100g', 'journey-oats');
    }
    w.CivicationCalendar.advanceByMinutes(1440);
    w.CivicationEconomyEngine.recordCompletedDay(day);
    w.CivicationEconomyEngine.tickWeekly();
    const saved = JSON.stringify(w.CivicationState.getWallet());
    w.CivicationEconomyEngine.recordCompletedDay(day);
    w.CivicationEconomyEngine.tickWeekly();
    assert.equal(JSON.stringify(w.CivicationState.getWallet()), saved, 'no double earning or settlement');
    if ([31, 59, 90].includes(day)) {
      w.CivicationEconomyUI.render();
      for (const button of [...w.document.querySelectorAll('[data-nok-invoice]:not([disabled])')]) {
        const invoice = w.CivicationState.getWallet().nok_v1.invoices.find(i => i.id === button.getAttribute('data-nok-invoice'));
        if (invoice.dueDateISO <= '2026-03-31' || (invoice.estimatedConsumptionKwh && invoice.monthId <= '2026-03')) button.click();
      }
      checkpoints.push(w.CivicationState.getWallet().balance);
      w = await checkpoint(w);
    }
  }
  const wallet = w.CivicationState.getWallet();
  assert.deepEqual(checkpoints, [9376.56, 13723.26, 12451.26]);
  assert.equal(wallet.nok_v1.payrollLedger.length, 3);
  assert.equal(wallet.nok_v1.payrollLedger[2].grossCents, 0, 'job loss creates no automatic NAV or wages');
  assert.equal(wallet.nok_v1.transportPasses.length, 2);
  assert.equal(wallet.nok_v1.shopping.quantities['tine-milk-1l'], 1);
  assert.equal(wallet.nok_v1.shopping.quantities['axa-oats-1100g'], 0);
  assert.equal(wallet.nok_v1.shopping.purchases.length, 3);
  assert.equal(wallet.nok_v1.shopping.openedUnits['tine-milk-1l'], 500);
  assert.equal(wallet.nok_v1.shopping.openedUnits['axa-oats-1100g'], 900);
  assert.equal(wallet.nok_v1.shopping.consumptions.length, 4);
  assert.equal(JSON.parse(w.localStorage.getItem('hg_pc_inventory_v1')).packs.streetwear_basic, true);
  assert.equal(wallet.nok_v1.invoices.filter(i => i.status === 'paid' && i.estimatedConsumptionKwh === 500).length, 3);
  assert.equal(wallet.nok_v1.invoices.filter(i => i.status === 'paid' && !i.estimatedConsumptionKwh).length, 3);
  assert.equal(wallet.history[0].id, 'old-purchase');
  assert.equal(wallet.last_tick_day_index, 1);
  assert.equal(wallet.balance, (12525 + wallet.nok_v1.payrollLedger.reduce((n, p) => n + p.grossCents - p.taxCents, 0) - 3 * 1009000 - 2 * 65500 - 3 * 61700 - 6970) / 100);
  assert.equal(w.CivicationState.getActivePosition(), null);
  assert.equal(w.CivicationJobs.getOffers().length, 1);
  assert.equal(w.CivicationJobs.getOffers()[0].status, 'accepted', 'restored accepted offers never respawn after job loss');
  for (const key of ['hg_job_offers_v1', 'quiz_progress', 'hg_learning_log_v1', 'hg_pc_inventory_v1']) {
    const remote = db.record.payload.state[key];
    const local = JSON.stringify({ conflict: key });
    const writes = db.writes;
    const other = await boot({ [key]: local });
    assert.ok(other.CivicationCloudSave.getStatus().message.includes('ulike'));
    await other.CivicationCloudSave.flush();
    assert.equal(db.writes, writes, key + ' conflicts block upload');
    assert.equal(other.localStorage.getItem(key), local);
    assert.equal(db.record.payload.state[key], remote);
  }
  console.log('PASS: 30 published quiz answers -> sourced offer/acceptance -> 90 played days, 3 rents, 3 electricity bills, 2 tickets, 3 grocery purchases, 4 consumption actions, job loss, 3 fresh-device restores; balances ' + checkpoints.join(', '));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => windows.forEach(dom => dom.window.close()));
