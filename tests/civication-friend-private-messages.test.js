#!/usr/bin/env node
// tests/civication-friend-private-messages.test.js
//
// Validerer broen mellom Civication-vennehandlinger og PERSONLIGE meldinger
// (CivicationFriendMessages). Sosiale handlinger fra vennens profilkort på
// bykartet skal bli synlige som personlige meldinger i innkommende – aldri som
// jobbmail.
//
// Bekrefter:
//   - Send melding lager en personlig meldings-/action-modell (privat kanal).
//   - Inviter lager en personlig invitasjon (privat kanal), med locationId.
//   - friendId, phase og actionId følger med begge.
//   - Produserte mail-events klassifiseres som "private", aldri "job".
//   - Jobbmail og personlige meldinger forblir adskilte.
//   - Manglende venn/snapshot håndteres trygt (ingen kast).
//   - Action-routeren fra PR #1190 + broen spiller sammen.
//
// Kjør:  node tests/civication-friend-private-messages.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

function loadScript(rel, filename) {
  const code = fs.readFileSync(path.join(repoRoot, rel), "utf8");
  vm.runInThisContext(code, { filename: filename || rel });
}

// Headless oppsett. Vi stubber det minimale window/document, og fanger opp
// både sendMail-kall (mail-engine-adapter) og civi:openPrivateMessage-events.
const sentMails = [];
const openEvents = [];

const sandboxWindow = {
  addEventListener() {},
  CustomEvent: function (type, init) {
    this.type = type;
    this.detail = init && init.detail;
  },
  dispatchEvent(ev) {
    if (ev && ev.type === "civi:openPrivateMessage") openEvents.push(ev.detail);
    return true;
  },
  // Mock av eksisterende meldingssystem (mail-engine). Fanger konvolutten.
  CivicationMailEngine: {
    sendMail(input) {
      const event = (input && input.event) || input;
      sentMails.push(event);
      return { ok: true, mail: { id: event && event.id, event } };
    }
  }
};

global.window = sandboxWindow;
global.document = {
  readyState: "complete",
  getElementById: () => null,
  querySelector: () => null,
  addEventListener: () => {},
  createElement: () => ({ className: "", setAttribute() {}, appendChild() {}, querySelector: () => null })
};
global.requestAnimationFrame = () => 0;
global.fetch = () => Promise.reject(new Error("fetch not available in test"));

// Last channel-klassifiseringen, action-routeren og broen.
loadScript("js/Civication/systems/civicationEventChannels.js", "civicationEventChannels.js");
loadScript("js/Civication/systems/civicationFriendsEngine.js", "civicationFriendsEngine.js");
loadScript("js/Civication/systems/civicationFriendMessages.js", "civicationFriendMessages.js");

const channels = sandboxWindow.CivicationEventChannels;
const engine = sandboxWindow.CivicationFriendsEngine;
const bridge = sandboxWindow.CivicationFriendMessages;

assert.ok(channels, "CivicationEventChannels skal være lastet");
assert.ok(engine, "CivicationFriendsEngine skal være lastet");
assert.ok(bridge, "CivicationFriendMessages skal være lastet");

const locations = readJSON("data/Civication/map/phaseLocations.json").phaseLocations;
const friends = readJSON("data/Civication/map/friends.json").friends;
const snapshots = readJSON("data/Civication/map/friendPhaseSnapshots.json").friendPhaseSnapshots;
const opts = { friends, snapshots, locations, dayIndex: 1 };

let failures = 0;
function check(name, fn) {
  // Nullstill fangst pr. sjekk så assertions er uavhengige.
  sentMails.length = 0;
  openEvents.length = 0;
  try {
    fn();
    console.log("  ok  -", name);
  } catch (e) {
    failures += 1;
    console.error("FAIL  -", name);
    console.error("       ", e && e.message);
  }
}

console.log("Vennehandlinger -> personlige meldinger (broen)");

check("resolvePrivateThreadForFriend gir stabil tråd-id pr. venn", () => {
  assert.strictEqual(bridge.resolvePrivateThreadForFriend("friend_demo_01"), "friend_friend_demo_01");
  assert.strictEqual(bridge.resolvePrivateThreadForFriend(""), "");
});

check("Send melding lager personlig meldings-modell (privat, ikke jobb)", () => {
  const res = engine.handleFriendAction("message", "friend_demo_01", { phase: "morning", ...opts });
  const bridged = bridge.handleCivicationFriendMessageAction(res);
  assert.strictEqual(bridged.ok, true);
  assert.strictEqual(bridged.channel, "private");
  const m = bridged.message;
  assert.strictEqual(m.type, "private");
  assert.strictEqual(m.channel, "private");
  assert.strictEqual(m.source, "civication_friend_action");
  assert.strictEqual(m.actionId, "message");
  assert.strictEqual(m.friendId, "friend_demo_01");
  assert.strictEqual(m.phase, "morning");
  assert.strictEqual(m.threadId, "friend_friend_demo_01");
  assert.strictEqual(m.status, "draft");
  assert.ok(/Mariam/.test(m.title), "tittel skal nevne vennen");
  assert.ok(/Mariam/.test(m.body), "tekst skal nevne vennen");
  // Ingen jobb-/karrierefelt på en personlig melding.
  assert.strictEqual(m.career_id, undefined);
  assert.strictEqual(m.role_key, undefined);
  assert.strictEqual(m.brand_id, undefined);
});

check("Send melding registreres i innkommende som privat melding", () => {
  const res = engine.handleFriendAction("message", "friend_demo_01", { phase: "morning", ...opts });
  bridge.handleCivicationFriendMessageAction(res);
  assert.strictEqual(sentMails.length, 1, "skal sende én melding til mail-engine");
  const ev = sentMails[0];
  assert.strictEqual(ev.channel, "private");
  assert.strictEqual(ev.mail_class, "private_message");
  assert.strictEqual(channels.getMessageChannel(ev), "private");
  assert.strictEqual(channels.isJobMail(ev), false);
  assert.strictEqual(channels.isPrivateMessage(ev), true);
  assert.strictEqual(channels.classifyEvent(ev), "message");
});

check("Send melding åpner/forbereder tråden (civi:openPrivateMessage)", () => {
  const res = engine.handleFriendAction("message", "friend_demo_01", { phase: "morning", ...opts });
  bridge.handleCivicationFriendMessageAction(res);
  assert.strictEqual(openEvents.length, 1, "skal dispatche civi:openPrivateMessage");
  const detail = openEvents[0];
  assert.strictEqual(detail.friendId, "friend_demo_01");
  assert.strictEqual(detail.threadId, "friend_friend_demo_01");
  assert.strictEqual(detail.channel, "private");
});

check("Inviter lager personlig invitasjon med locationId (privat, ikke jobb)", () => {
  const res = engine.handleFriendAction("invite", "friend_demo_01", { phase: "leisure", ...opts });
  const bridged = bridge.handleCivicationFriendMessageAction(res);
  assert.strictEqual(bridged.ok, true);
  const m = bridged.message;
  assert.strictEqual(m.type, "private");
  assert.strictEqual(m.channel, "private");
  assert.strictEqual(m.actionId, "invite");
  assert.strictEqual(m.friendId, "friend_demo_01");
  assert.strictEqual(m.phase, "leisure");
  assert.strictEqual(m.locationId, "park", "locationId skal følge med for invite");
  assert.strictEqual(m.threadId, "friend_friend_demo_01");
  assert.strictEqual(m.status, "draft");
  assert.ok(/Invitasjon til Mariam/.test(m.title), "tittel skal være en invitasjon");
  assert.ok(/fritidsfasen/.test(m.body), "tekst skal nevne aktiv fase");
});

check("Inviter dispatcher IKKE openPrivateMessage (kun lagt i innkommende)", () => {
  const res = engine.handleFriendAction("invite", "friend_demo_01", { phase: "leisure", ...opts });
  const bridged = bridge.handleCivicationFriendMessageAction(res);
  assert.strictEqual(openEvents.length, 0, "Inviter åpner ikke tråd automatisk");
  assert.strictEqual(sentMails.length, 1, "Inviter legges i innkommende");
  assert.strictEqual(channels.getMessageChannel(sentMails[0]), "private");
});

check("feedback-tekstene matcher UI-kravet", () => {
  const msg = engine.handleFriendAction("message", "friend_demo_01", { phase: "morning", ...opts });
  const inv = engine.handleFriendAction("invite", "friend_demo_01", { phase: "leisure", ...opts });
  assert.strictEqual(
    bridge.handleCivicationFriendMessageAction(msg).feedbackText,
    "Personlig melding til Mariam er klar i Innkommende."
  );
  assert.strictEqual(
    bridge.handleCivicationFriendMessageAction(inv).feedbackText,
    "Invitasjon til Mariam er lagt i Personlige meldinger."
  );
});

check("Besøk og Se profil lager ingen personlig melding via broen", () => {
  ["visit", "profile"].forEach((action) => {
    const res = engine.handleFriendAction(action, "friend_demo_01", { phase: "leisure", ...opts });
    const bridged = bridge.handleCivicationFriendMessageAction(res);
    assert.strictEqual(bridged.ok, false, action + " er ikke en meldingshandling");
    assert.strictEqual(bridged.reason, "not_a_message_action");
  });
  assert.strictEqual(sentMails.length, 0, "ingen meldinger registrert for visit/profile");
});

console.log("Separasjon mot jobbmail");

check("personlige vennemeldinger blandes aldri med jobbmail", () => {
  const msg = engine.handleFriendAction("message", "friend_demo_02", { phase: "evening", ...opts });
  bridge.handleCivicationFriendMessageAction(msg);
  const inv = engine.handleFriendAction("invite", "friend_demo_02", { phase: "leisure", ...opts });
  bridge.handleCivicationFriendMessageAction(inv);

  // En typisk jobbmail til sammenligning.
  const jobMail = {
    id: "job_001",
    source_type: "workday",
    mail_type: "job_micro",
    task_domain: "cash_desk",
    career_id: "naeringsliv"
  };

  const inbox = sentMails.map((ev) => ({ status: "pending", event: ev }))
    .concat([{ status: "pending", event: jobMail }]);
  const split = channels.splitInboxByMessageChannel(inbox);

  assert.strictEqual(split.private.length, 2, "begge vennemeldinger skal være private");
  assert.strictEqual(split.job.length, 1, "kun jobbmail i job-kanalen");
  split.private.forEach((item) => {
    assert.strictEqual(channels.getMessageChannel(item.event), "private");
    assert.notStrictEqual(channels.getMessageChannel(item.event), "job");
  });
});

console.log("Trygghet ved manglende data");

check("ukjent venn håndteres trygt (action-router gir feil, broen kaster ikke)", () => {
  const res = engine.handleFriendAction("message", "ingen_slik_venn", { phase: "morning", ...opts });
  assert.strictEqual(res.ok, false);
  // Broen tåler et tomt/uoppløst resultat uten å kaste.
  const bridged = bridge.handleCivicationFriendMessageAction(res);
  assert.strictEqual(bridged.ok, false);
  assert.strictEqual(bridged.reason, "friend_not_found");
  assert.strictEqual(sentMails.length, 0);
});

check("manglende snapshot: invite faller tilbake til hjem, melding er fortsatt privat", () => {
  const ghost = {
    id: "ghost_99", name: "Nora Vik", role: "Nabo", relationshipLevel: 0,
    avatar: { homeId: "friend_home_demo_03" }, presenceByPhase: {}
  };
  const res = engine.handleFriendAction("invite", "ghost_99", {
    phase: "leisure", friends: [ghost], snapshots, locations, dayIndex: 1
  });
  const bridged = bridge.handleCivicationFriendMessageAction(res);
  assert.strictEqual(bridged.ok, true);
  assert.strictEqual(bridged.message.locationId, "friend_home_demo_03");
  assert.strictEqual(bridged.message.channel, "private");
  assert.strictEqual(channels.getMessageChannel(sentMails[0]), "private");
});

check("broen tåler en rå action-modell (ikke bare hele resultatet)", () => {
  const model = engine.buildFriendMessageAction(
    { id: "friend_demo_01", name: "Mariam Holt" }, null, "morning", locations
  );
  const bridged = bridge.handleCivicationFriendMessageAction(model);
  assert.strictEqual(bridged.ok, true);
  assert.strictEqual(bridged.message.friendId, "friend_demo_01");
  assert.strictEqual(bridged.message.actionId, "message");
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
