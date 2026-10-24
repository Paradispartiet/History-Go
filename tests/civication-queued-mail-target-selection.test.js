#!/usr/bin/env node
// A queued "Åpne saken" button must deliver that specific phase mail, not
// re-enqueue an older delivered row and trap the real player in forenoon.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../js/Civication/systems/civicationDailyMailBuilder.js"), "utf8");
const today = new Date().toISOString().slice(0, 10);
const active = { career_id: "kunst", role_key: "museum", role_id: "museum", title: "Museumsvert" };
const rows = [
  { status: "delivered", phase: "forenoon", event: { id: "already-delivered", mail_type: "job", thread_key: "museum.mail.old", choices: [{ id: "A" }] } },
  { status: "queued", phase: "forenoon", event: { id: "clicked-by-player", mail_type: "micro", thread_key: "museum.mail.now", choices: [{ id: "A" }] } },
  { status: "queued", phase: "workday", event: { id: "later-phase", mail_type: "job", thread_key: "museum.mail.later", choices: [{ id: "A" }] } }
];
const originalRuntime = {
  date: today, calendar_day: 8, role_scope: "museum", current_index: 0,
  delivered_ids: ["already-delivered"], answered_ids: [], items: rows
};
let state = { mail_day_runtime_v1: originalRuntime };
const sent = [];
const browser = {
  CivicationState: {
    getState: () => state,
    setState: (patch) => { state = { ...state, ...patch }; return state; },
    getActivePosition: () => active
  },
  CivicationCareerRoleResolver: { resolveCareerRoleScope: () => "museum" },
  CivicationCalendar: {
    getPhase: () => "forenoon",
    getClock: () => ({ dayIndex: 8 }),
    setPhase: (phase) => assert.equal(phase, "forenoon")
  },
  CivicationMailEngine: {
    getInbox: () => [],
    sendMail: (mail) => { sent.push(mail.event.id); return { ok: true }; }
  },
  addEventListener: () => {},
  dispatchEvent: () => {}
};
const context = vm.createContext({
  window: browser,
  document: { readyState: "loading", addEventListener: () => {} },
  Event: class Event { constructor(type) { this.type = type; } },
  console, Date, Set, Map, Promise, Math
});
vm.runInContext(source, context);
const builder = browser.CivicationDailyMailBuilder;
assert.ok(builder?.enqueueNext, "the production queue handler is exposed");

(async () => {
  const opened = await builder.enqueueNext(null, {
    ignorePending: true, queuedEventId: "clicked-by-player"
  });
  assert.equal(opened.enqueued, true);
  assert.equal(opened.event.id, "clicked-by-player");
  assert.deepEqual(sent, ["clicked-by-player"], "only the player's selected case reaches the mail engine");
  const updated = state.mail_day_runtime_v1;
  assert.equal(updated.items[0].status, "delivered", "earlier delivered case is not re-delivered");
  assert.equal(updated.items[1].status, "delivered", "selected case becomes answerable");
  assert.equal(updated.items[2].status, "queued", "next phase remains queued");

  // A stale or forged pointer is a safe no-op, never permission to deliver
  // a different item, including a mail belonging to another phase.
  for (const id of ["missing", "later-phase", "already-delivered"]) {
    const result = await builder.enqueueNext(null, { ignorePending: true, queuedEventId: id });
    assert.equal(result.enqueued, false, id + " must not enqueue anything else");
    assert.equal(result.reason, "queued_target_not_available");
  }
  assert.deepEqual(sent, ["clicked-by-player"]);
  console.log("civication-queued-mail-target-selection: PASS");
})().catch(error => { console.error(error); process.exitCode = 1; });
