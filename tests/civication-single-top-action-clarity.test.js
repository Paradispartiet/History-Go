#!/usr/bin/env node
// One owner for the home action card; the active day message must be the
// same message in Min dag and the inbox, never a stale answered copy.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const root = path.resolve(__dirname, "..");
const dom = new JSDOM(`<!doctype html><html><body class="civi-app">
  <main class="civi-panels">
    <section id="civiLifeHomeControls"><div id="civiTopActionCard">
      <h3 class="civi-top-action-title"></h3>
      <p class="civi-top-action-summary"></p>
      <span class="civi-top-action-chip"></span>
      <button type="button" data-civi-top-action></button></div></section>
    <section id="civiLifestorySection"><div id="civiLifestoryPanel"></div></section>
    <section id="civiInboxSection"><div id="civiInbox"></div></section>
  </main>
  <div class="civi-footer"><button data-category="minDag">Min dag</button></div>
</body></html>`, { url: "https://example.test/Civication.html", runScripts: "outside-only" });
const w = dom.window;
const d = w.document;
w.CivicationHome = { getState: () => ({ home: { status: "settled" } }) };
let action = { id: "morning-nav", subject: "NAV trenger svar", phaseLabel: "Morgen",
  isAnswerable: true, isQueued: false, canStartNewDay: false };
w.CivicationNextActionSelector = { getCurrent: () => action };
const copy = { status: "pending", event: { id: "old-replied-nav", subject: "Gamle NAV-papirer",
  source_type: "life", choices: [{ id: "send" }] } };
w.CivicationMailEngine = { getInbox: () => [copy] };
w.CivicationDayProgression = { inspect: () => ({ phaseBundle: { items: [] } }),
  isPreviouslyAnsweredInboxItem: item => item?.event?.id === "old-replied-nav" };
w.CivicationEventChannels = { splitInbox: items => ({
  messages: items, unknown: [], workday: [], milestones: [], system: []
}) };
function load(name) { w.eval(fs.readFileSync(path.join(root, name), "utf8")); }
load("js/Civication/ui/CivicationMiniSectionsUI.js");
w.CivicationMiniSectionsUI.boot();
const card = d.getElementById("civiTopActionCard");
const title = () => card.querySelector(".civi-top-action-title").textContent;
const button = card.querySelector("[data-civi-top-action]");
assert.equal(w.CivicationMiniSectionsUI.ownsTopAction, true);
assert.equal(title(), "Melding som krever svar");
assert.match(card.textContent, /NAV trenger svar/);
assert.equal(button.textContent, "Åpne innboksen");
assert.equal(button.disabled, false);
assert.equal(card.querySelector(".civi-top-action-chip").textContent, "Krever svar");

load("js/Civication/ui/CivicationInboxTopActionUI.js");
w.CivicationInboxTopActionUI.refresh();
assert.equal(title(), "Melding som krever svar",
  "the inbox renderer must not overwrite the home/section owner's top card");
action = { id: "queued-nav", subject: "Les kveldsmeldingen", phaseLabel: "Kveld",
  isAnswerable: false, isQueued: true };
w.dispatchEvent(new w.Event("civi:dayPhaseChanged"));
assert.equal(title(), "Ny hendelse", "phase change must refresh the single top card without manual polling");
assert.equal(card.querySelector(".civi-top-action-chip").textContent, "Ny sak");
action = { id: "start_new_day:day_end", subject: "Start ny dag",
  canStartNewDay: true, isAnswerable: false };
w.CivicationMiniSectionsUI.refresh();
assert.equal(title(), "Dagen er ferdig");
assert.equal(button.textContent, "Se dagslutt");
action = null;
w.dispatchEvent(new w.Event("civi:inboxChanged"));
assert.equal(title(), "Ingen handling krever svar nå",
  "a stale answered inbox copy must not become an urgent task");
assert.equal(button.disabled, true, "there must not be an enabled button without an action");
dom.window.close();
console.log("Civication top action clarity regression passed");
