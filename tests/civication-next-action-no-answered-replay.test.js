#!/usr/bin/env node
// Regression: a stale pending inbox copy cannot resurrect an answered mail
// after the day has ended, even when the daily runtime and inbox disagree.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const progressionSource = fs.readFileSync(path.join(root, "js/Civication/systems/day/dayProgressionController.js"), "utf8");
const selectorSource = fs.readFileSync(path.join(root, "js/Civication/systems/civicationNextActionSelector.js"), "utf8");

function scenario({
  consumed = false,
  lifeConsumed = false,
  dailyAnswered = false,
  pendingDailyRow = false,
  lifeStoryDone = true,
  repeatable = false,
  cyclePolicy = "once",
  addUnanswered = false
} = {}) {
  const navId = "arbeidsledig_nav_dokumentasjon";
  const oldNav = {
    status: "pending",
    event: {
      id: navId, subject: "Vi mangler fortsatt dokumentasjon",
      source_type: "life", mail_class: "life", cycle_policy: cyclePolicy, repeatable,
      phase_tag: "morning", choices: [{ id: "send", label: "Last opp alt nå" }]
    }
  };
  const fresh = {
    status: "pending",
    event: { id: "fresh_mail", subject: "Ny sak", source_type: "life",
      choices: [{ id: "answer", label: "Svar" }] }
  };
  const inbox = [oldNav, ...(addUnanswered ? [fresh] : [])];
  const rows = [
    ...(dailyAnswered ? [{ status: "answered", phase: "morning", event: { id: navId } }] : []),
    ...(pendingDailyRow ? [{
      status: "pending", phase: "day_end", answered_at: "2026-10-19",
      event: { id: navId, subject: oldNav.event.subject, choices: oldNav.event.choices }
    }] : [])
  ];
  const state = {
    consumed: consumed ? { [navId]: true } : {},
    life_mail_runtime_v1: { consumed_ids: lifeConsumed ? [navId] : [] }
  };
  const win = {
    CivicationState: { getState: () => state, getInbox: () => inbox },
    CivicationMailEngine: { getInbox: () => inbox },
    CivicationDailyMailBuilder: { inspect: () => ({ runtime: { items: rows } }) },
    CivicationCalendar: { getPhase: () => "day_end", getPhaseLabel: (p) => p,
      getClock: () => ({ dayIndex: 1 }) },
    CivicationLifestoryUI: { getDaySyncState: () => ({ dagFerdig: lifeStoryDone }) }
  };
  const sandbox = { window: win, localStorage: { getItem: () => null }, console };
  vm.runInNewContext(progressionSource, sandbox);
  vm.runInNewContext(selectorSource, sandbox);
  return { inspected: win.CivicationDayProgression.inspect(),
    action: win.CivicationNextActionSelector.getCurrent() };
}

const consumedNav = scenario({ consumed: true });
assert.equal(consumedNav.inspected.openInboxItems, 0);
assert.equal(consumedNav.action?.id, "start_new_day:day_end",
  "answered NAV mail must not return as a next action");

const lifeNav = scenario({ lifeConsumed: true });
assert.equal(lifeNav.inspected.openInboxItems, 0);
assert.equal(lifeNav.action?.id, "start_new_day:day_end",
  "life-mail answer history must suppress stale pending inbox copies");

const dailyNav = scenario({ dailyAnswered: true });
assert.equal(dailyNav.inspected.openInboxItems, 0);
assert.equal(dailyNav.action?.id, "start_new_day:day_end",
  "daily runtime answer history must suppress stale inbox copies");

const incompleteStory = scenario({ consumed: true, lifeStoryDone: false });
assert.equal(incompleteStory.action, null,
  "unfinished Min dag must not be bypassed by a stale NAV mail");

const staleRow = scenario({ consumed: true, pendingDailyRow: true });
assert.equal(staleRow.inspected.deliveredItemsInPhase, 0);
assert.equal(staleRow.action?.id, "start_new_day:day_end",
  "a row with answered_at must not remain a pending action");

const mixed = scenario({ lifeConsumed: true, addUnanswered: true });
assert.equal(mixed.inspected.openInboxItems, 1);
assert.equal(mixed.action?.id, "fresh_mail",
  "an actually unanswered newer mail remains playable");

const fresh = scenario();
assert.equal(fresh.inspected.openInboxItems, 1);
assert.equal(fresh.action?.id, "arbeidsledig_nav_dokumentasjon",
  "an unanswered NAV mail must remain playable");

const repeating = scenario({ consumed: true, repeatable: true, cyclePolicy: "repeat" });
assert.equal(repeating.inspected.openInboxItems, 1);
assert.equal(repeating.action?.id, "arbeidsledig_nav_dokumentasjon",
  "explicit repeatable content remains playable in a new cycle");

console.log("Civication next-action answered-mail replay regression passed");
