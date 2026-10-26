#!/usr/bin/env node
// Canonical day-end summary needs one real acknowledgement, never a fake
// answer choice or automatic phase skip. Other empty-choice mails stay blocked.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const dom = new JSDOM('<!doctype html><html><body></body></html>',
  { url: "http://localhost/Civication.html", runScripts: "outside-only" });
const { window } = dom;
const summary = { source: "day_phase", id: "day-8-summary", phase: "day_end",
  subject: "Dag 8 er over", slot: "day_summary", status: "delivered",
  isAnswerable: true, isQueued: false, choices: [], situation: ["Dagen er gjennomført"] };
const newDay = { source: "day_phase_advance", id: "start_new_day:day_end", subject: "Start ny dag",
  phase: "day_end", status: "ready", canAdvancePhase: true, canStartNewDay: true, choices: [] };
let current = summary;
const handled = [];
window.CivicationNextActionSelector = { getCurrent: () => current };
window.CivicationState = { getActivePosition: () => null, getInbox: () => [] };
window.CivicationDailyMailBuilder = {
  inspect: () => ({ runtime: null }),
  markHandled: async (id, choice) => {
    handled.push([id, choice]);
    if (id.startsWith("day-8-summary")) current = newDay;
    return { answered_ids: [id] };
  }
};
window.eval(fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationNextActionUI.js"), "utf8"));
assert.ok(window.CivicationNextActionUI?.render, "production NextActionUI loaded");
const modal = (() => {
  window.CivicationNextActionUI.render();
  return window.document.getElementById("civiNextActionModal");
})();
(async () => {
  for (const slot of ["day_summary", "score_summary", "role_progress_summary", "sleep_or_recovery", "carryover"]) {
    const id = "day-8-summary-" + slot;
    current = { ...summary, id, slot };
    window.CivicationNextActionUI.render();
    const ack = modal.querySelector('[data-civi-next-action-acknowledge]');
    assert.equal(ack?.textContent, "Lest oppsummeringen", slot);
    assert.equal(ack?.getAttribute("data-mail-id"), id);
    assert.equal(modal.querySelectorAll('[data-civi-next-action-answer]').length, 0);
    ack.click();
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.deepEqual(handled.at(-1), [id, "read"], slot + " uses canonical queue");
    assert.ok(modal.querySelector('[data-civi-next-action-advance]'),
      slot + " only unlocks new day after real acknowledgement");
  }
  current = { ...summary, id: "unanswered-work", phase: "workday", slot: "job", subject: "Jobb", choices: [] };
  window.CivicationNextActionUI.render();
  assert.equal(modal.querySelectorAll('[data-civi-next-action-acknowledge]').length, 0,
    "other empty-choice mails must never be acknowledged as a day summary");
  assert.equal(modal.querySelectorAll('[data-civi-next-action-answer]').length, 0);
  assert.equal(handled.length, 5);
  current = { ...summary, id: "day-end-required-task", slot: "sleep_or_recovery", isTaskGate: true };
  window.CivicationNextActionUI.render();
  assert.equal(modal.querySelectorAll('[data-civi-next-action-acknowledge]').length, 0,
    "task gates cannot be waived with read-only acknowledgement");
  console.log("civication-day-end-summary-acknowledgement: PASS");
  window.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
