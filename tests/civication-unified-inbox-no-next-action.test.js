#!/usr/bin/env node
// Civication's active phase mail and the ordinary inbox must have one visible
// answer surface. The historical NextAction modal is not part of Civication.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const dom = new JSDOM('<!doctype html><html><body class="civi-app"><div id="civiInboxSection"><div class="civi-section-body"><div id="civiInbox"></div></div></div><div id="civiTopActionCard"></div></body></html>', {
  url: "https://example.test/Civication.html", runScripts: "outside-only"
});
const w = dom.window;
const doc = w.document;
const event = {
  id: "life-nav-001", subject: "NAV trenger dokumentasjon", mail_type: "life",
  source_type: "life", mail_class: "life", phase_tag: "morning",
  situation: ["Svar på henvendelsen fra NAV."],
  choices: [{ id: "send", label: "Send dokumentasjon" }, { id: "later", label: "Vent" }]
};
let active = true, answered = 0, popupCalls = 0;
const inbox = [{ status: "pending", event }];
w.CivicationState = { getInbox: () => inbox, getActivePosition: () => null, getState: () => ({ consumed: {} }) };
w.CivicationCalendar = { getPhase: () => "morning" };
w.CivicationDayProgression = {
  inspect: () => ({ phase: active ? "morning" : "day_end",
    reason: active ? "open_inbox_items" : "at_last_phase", canAdvance: false }),
  isPreviouslyAnsweredInboxItem: item => !active && item?.event?.id === event.id
};
w.CivicationDailyMailBuilder = { inspect: () => ({ runtime: { items: [] } }) };
w.CivicationNextActionSelector = {
  getCurrent: () => active ? {
    id: event.id, source: "inbox", subject: event.subject,
    phase: "morning", phaseLabel: "Morgen", mail_type: "life", status: "pending",
    situation: event.situation, choices: event.choices, isAnswerable: true
  } : null
};
w.CivicationMailEngine = {
  getInbox: () => inbox,
  getMail: () => ({ event }),
  async answerMail(id, choiceId) {
    assert.equal(id, event.id);
    assert.equal(choiceId, "send");
    answered++;
    active = false;
    inbox[0].status = "resolved";
    inbox[0].resolved = true;
    return { ok: true, feedback: "NAV har mottatt dokumentasjonen." };
  }
};
w.CivicationMiniSectionsUI = { openPopup(section) {
  assert.equal(section.id, "civiInboxSection");
  popupCalls++;
} };
w.CivicationEventChannels = { splitInboxByMessageChannel: () => ({
  job: [], private: inbox, system: [], unknown: []
}) };
w.eval(read("js/Civication/ui/CivicationNextActionUI.js"));
w.eval(read("js/Civication/ui/CivicationInboxTopActionUI.js"));

async function run() {
  w.CivicationInboxTopActionUI.renderSections();
  const inline = doc.getElementById("civiNextActionModal");
  assert.ok(inline, "phase mail is mounted inside the inbox");
  assert.equal(inline.closest("#civiInboxSection")?.id, "civiInboxSection");
  assert.equal(doc.querySelector(".civi-modal"), null, "there is no separate NextAction dialog");
  assert.match(inline.textContent, /NAV trenger dokumentasjon/);
  assert.equal(inline.querySelectorAll("[data-civi-next-action-answer]").length, 2);
  assert.equal(doc.querySelectorAll("#civiInbox [data-civi-inbox-answer]").length, 0,
    "the message history does not duplicate answer buttons");
  assert.equal(doc.querySelector("#civiInbox .civi-inbox-card.is-pending"), null,
    "the active message is not repeated in the history list");
  const privateSection = Array.from(doc.querySelectorAll(".civi-inbox-channel-section"))
    .find(section => section.querySelector("h3")?.textContent === "Personlige meldinger");
  assert.equal(privateSection?.querySelector("strong")?.textContent, "1 åpne",
    "the active message counts as open even when it has no duplicate archive card");
  assert.match(privateSection.textContent, /aktive meldingen vises øverst/i,
    "the channel explains where the counted current action is shown");
  assert.doesNotMatch(privateSection.textContent, /Ingen personlige meldinger akkurat nå/,
    "a channel with a current active message must not claim there is no mail");

  // A role/day change can arrive without the user clicking the inbox button.
  // The embedded answer area must refresh even though it is not a modal.
  active = false;
  w.dispatchEvent(new w.Event("civi:dayPhaseChanged"));
  assert.equal(inline.hidden, true, "external phase updates hide obsolete actions");
  active = true;
  w.dispatchEvent(new w.Event("updateProfile"));
  assert.equal(inline.hidden, false, "returning to a playable role restores its current action");
  assert.ok(w.CivicationNextActionUI.open());
  assert.equal(popupCalls, 1, "the existing inbox popup is opened");
  inline.querySelector('[data-choice-id="send"]').click();
  for (let i = 0; i < 12 && answered === 0; i++) await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(answered, 1);
  await new Promise(resolve => setTimeout(resolve, 10));
  w.CivicationInboxTopActionUI.renderSections();
  assert.equal(inline.hidden, true, "answered messages do not reappear as active");
  assert.equal(doc.querySelectorAll("#civiInbox [data-civi-inbox-answer]").length, 0);
  dom.window.close();
  console.log("Civication unified inbox regression passed");
}
run().catch(error => { console.error(error); process.exitCode = 1; });
