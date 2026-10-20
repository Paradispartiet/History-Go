#!/usr/bin/env node
// The same pending daily event has one decision, even when both runtimes
// expose it simultaneously. Unrelated private mail must remain visible.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../js/Civication/systems/day/dayProgressionController.js"), "utf8");
function inspect(rows, mails) {
  const window = {
    CivicationCalendar: {
      DAY_PHASES: ["morning", "workday", "day_end"],
      getPhase: () => "morning",
      getPhaseLabel: () => "Morgen",
      getClock: () => ({ dayIndex: 1 })
    },
    CivicationDailyMailBuilder: { inspect: () => ({ runtime: { items: rows } }) },
    CivicationMailEngine: { getInbox: () => mails },
    CivicationState: { getState: () => ({ consumed: {} }) },
    CivicationEventChannels: { getMessageChannel: ev => ev.mail_class === "daily_workday" ? "job" : "private" }
  };
  vm.runInNewContext(source, { window, console });
  return window.CivicationDayProgression.inspect();
}
const ev = { id: "morning-task", subject: "Dagens melding",
  mail_class: "daily_private", phase_tag: "morning",
  choices: [{ id: "send", label: "Svar" }] };
const row = { id: ev.id, status: "delivered", phase: "morning", event: ev };
const copy = { status: "pending", event: ev };
const single = inspect([row], [copy]);
assert.equal(single.openItemsInPhase, 1, "one decision is one open action");
assert.equal(single.openInboxItems, 0, "the mail projection is not a second action");
assert.equal(single.openItemSubjects.length, 1, "the day's subject is not duplicated");
assert.equal(single.canAdvance, false, "the actual pending runtime row still blocks progression");
const other = { status: "pending", event: {
  id: "second-case", subject: "En egen privat sak",
  mail_class: "daily_private", choices: [{ id: "reply" }]
} };
const withOther = inspect([row], [copy, other]);
assert.equal(withOther.openItemsInPhase, 2);
assert.equal(withOther.openInboxItems, 1);
assert.equal(withOther.openItemSubjects.length, 2);
const answered = inspect([{ ...row, status: "answered", answered_at: "2026-10-20" }], [copy]);
assert.equal(answered.openItemsInPhase, 0, "a stale inbox copy does not resurrect an answer");
assert.equal(answered.canAdvance, true);
console.log("Civication day/inbox action count regression passed");
