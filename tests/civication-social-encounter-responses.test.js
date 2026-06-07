#!/usr/bin/env node
// tests/civication-social-encounter-responses.test.js
//
// Validerer den datadrevne SVARSLØYFEN for sosiale henvendelser i Personlige
// meldinger (CivicationFriendMessages). Når en sosial henvendelse (actionId
// "approach", privat kanal, mail_class "private_message") ligger i innkommende,
// skal spilleren kunne velge Svar / Ignorer / Avvis. Valget lagres som en sosial
// respons og gir tydelig konsekvens.
//
// Bekrefter:
//   - reply gir status "replied", relationshipDelta +1, kan lage followup
//   - ignore gir status "ignored", relationshipDelta 0, ingen followup
//   - decline gir status "declined", relationshipDelta -1, ingen followup
//   - norske labels Svar/Ignorer/Avvis + resultatetiketter Besvart/Ignorert/Avvist
//   - private/social encounter-meldinger kan behandles
//   - jobbmail kan IKKE behandles av svarsløyfen
//   - ugyldig/manglende responseId håndteres trygt
//   - samme melding kan ikke behandles dobbelt uten eksplisitt force
//   - resultatet beholder channel "private" / mail_class "private_message"
//   - resultatet får ALDRI job/work/career-felt
//   - relasjonskonsekvens modelleres lokalt (relationshipLevel + socialHistory)
//   - followup blir en personlig melding (privat kanal), aldri jobbmail
//   - view-model gir valg før svar og resultat etter svar
//
// Kjør:  node tests/civication-social-encounter-responses.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

function loadScript(rel) {
  const code = fs.readFileSync(path.join(repoRoot, rel), "utf8");
  vm.runInThisContext(code, { filename: rel });
}

// Headless oppsett. Fanger mail-engine-kall (for followup-registrering) og
// gir et enkelt localStorage-stub slik at relasjon/respons-lagrene er testbare.
const sentMails = [];
const _ls = {};
const sandboxWindow = {
  addEventListener() {},
  CustomEvent: function (type, init) { this.type = type; this.detail = init && init.detail; },
  dispatchEvent() { return true; },
  localStorage: {
    getItem(k) { return Object.prototype.hasOwnProperty.call(_ls, k) ? _ls[k] : null; },
    setItem(k, v) { _ls[k] = String(v); },
    removeItem(k) { delete _ls[k]; }
  },
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

loadScript("js/Civication/systems/civicationEventChannels.js");
loadScript("js/Civication/systems/civicationFriendsEngine.js");
loadScript("js/Civication/systems/civicationFriendMessages.js");

const channels = sandboxWindow.CivicationEventChannels;
const eng = sandboxWindow.CivicationFriendsEngine;
const bridge = sandboxWindow.CivicationFriendMessages;

assert.ok(channels, "CivicationEventChannels skal være lastet");
assert.ok(eng, "CivicationFriendsEngine skal være lastet");
assert.ok(bridge, "CivicationFriendMessages skal være lastet");

const locations = readJSON("data/Civication/map/phaseLocations.json").phaseLocations;
const friends = readJSON("data/Civication/map/friends.json").friends;
const snapshots = readJSON("data/Civication/map/friendPhaseSnapshots.json").friendPhaseSnapshots;
const opts = { friends, snapshots, locations, dayIndex: 1 };

// Bygger en frisk henvendelses-melding (mail-event) for Mariam på park i leisure.
function freshApproachEvent(id) {
  const enc = eng.getSocialEncountersForLocation("leisure", "park", opts)[0];
  const msg = bridge.createApproachMessageFromEncounter(enc);
  const ev = bridge.toMailEvent(msg);
  if (id) { ev.id = id; ev.mail_key = id; }
  return ev;
}

let failures = 0;
function check(name, fn) {
  sentMails.length = 0;
  // Nullstill lokale lager pr. sjekk så assertions er uavhengige.
  bridge.clearSocialRelationshipsForTesting();
  bridge.clearSocialResponsesForTesting();
  try {
    fn();
    console.log("  ok  -", name);
  } catch (e) {
    failures += 1;
    console.error("FAIL  -", name);
    console.error("       ", e && e.message);
  }
}

const JOB_FORBIDDEN = ["career_id", "role_key", "role_id", "brand_id", "brand_name", "task_domain", "career_outcome_meta"];
function assertNoJobFields(o) {
  JOB_FORBIDDEN.forEach((k) => assert.strictEqual(o[k], undefined, "uventet jobbfelt: " + k));
  assert.notStrictEqual(String(o.channel || "").toLowerCase(), "job", "channel skal aldri være job");
}

console.log("Labels og resultattekster (norsk)");

check("getSocialResponseLabel gir Svar/Ignorer/Avvis", () => {
  assert.strictEqual(bridge.getSocialResponseLabel("reply"), "Svar");
  assert.strictEqual(bridge.getSocialResponseLabel("ignore"), "Ignorer");
  assert.strictEqual(bridge.getSocialResponseLabel("decline"), "Avvis");
  assert.strictEqual(bridge.getSocialResponseLabel("tull"), "");
  assert.strictEqual(bridge.getSocialResponseLabel(""), "");
});

check("getSocialResponseStatusLabel gir Besvart/Ignorert/Avvist", () => {
  assert.strictEqual(bridge.getSocialResponseStatusLabel("replied"), "Besvart");
  assert.strictEqual(bridge.getSocialResponseStatusLabel("ignored"), "Ignorert");
  assert.strictEqual(bridge.getSocialResponseStatusLabel("declined"), "Avvist");
  assert.strictEqual(bridge.getSocialResponseStatusLabel("pending_response"), "Venter på svar");
});

check("getSocialResponseResultText gir riktig konsekvenstekst", () => {
  assert.strictEqual(bridge.getSocialResponseResultText({ responseId: "reply" }),
    "Du svarer på henvendelsen. Samtalen kan fortsette.");
  assert.strictEqual(bridge.getSocialResponseResultText({ responseId: "ignore" }),
    "Du ignorerer henvendelsen.");
  assert.strictEqual(bridge.getSocialResponseResultText({ responseId: "decline" }),
    "Du avviser henvendelsen.");
  // Kan også utledes fra status.
  assert.strictEqual(bridge.getSocialResponseResultText({ status: "replied" }),
    "Du svarer på henvendelsen. Samtalen kan fortsette.");
});

console.log("Konsekvensmodell pr. svarvalg (Mål)");

check("reply -> status replied, relationshipDelta +1, kan lage followup", () => {
  const ev = freshApproachEvent("approach_reply_1");
  const res = bridge.handleSocialEncounterResponse("approach_reply_1", "reply", { message: ev });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.status, "replied");
  assert.strictEqual(res.statusLabel, "Besvart");
  assert.strictEqual(res.relationshipDelta, 1);
  assert.strictEqual(res.canFollowup, true);
  assert.ok(res.followup, "reply skal lage followup");
  assert.strictEqual(res.resultText, "Du svarer på henvendelsen. Samtalen kan fortsette.");
});

check("ignore -> status ignored, relationshipDelta 0, ingen followup", () => {
  const ev = freshApproachEvent("approach_ignore_1");
  const res = bridge.handleSocialEncounterResponse("approach_ignore_1", "ignore", { message: ev });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.status, "ignored");
  assert.strictEqual(res.statusLabel, "Ignorert");
  assert.strictEqual(res.relationshipDelta, 0);
  assert.strictEqual(res.canFollowup, false);
  assert.strictEqual(res.followup, null);
  assert.strictEqual(res.resultText, "Du ignorerer henvendelsen.");
});

check("decline -> status declined, relationshipDelta -1, ingen followup", () => {
  const ev = freshApproachEvent("approach_decline_1");
  const res = bridge.handleSocialEncounterResponse("approach_decline_1", "decline", { message: ev });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.status, "declined");
  assert.strictEqual(res.statusLabel, "Avvist");
  assert.strictEqual(res.relationshipDelta, -1);
  assert.strictEqual(res.canFollowup, false);
  assert.strictEqual(res.followup, null);
  assert.strictEqual(res.resultText, "Du avviser henvendelsen.");
});

console.log("Separasjon: alltid privat, aldri jobb");

check("resultatet beholder channel private / mail_class private_message, ingen jobbfelt", () => {
  ["reply", "ignore", "decline"].forEach((rid, i) => {
    const id = "approach_sep_" + i;
    const ev = freshApproachEvent(id);
    const res = bridge.handleSocialEncounterResponse(id, rid, { message: ev });
    assert.strictEqual(res.channel, "private");
    assert.strictEqual(res.mail_class, "private_message");
    assert.strictEqual(res.source, "civication_social_response");
    assertNoJobFields(res);
  });
});

check("jobbmail kan IKKE behandles av svarsløyfen", () => {
  const jobMail = {
    id: "job_001",
    source_type: "workday",
    mail_type: "job_micro",
    mail_class: "job_message",
    task_domain: "cash_desk",
    career_id: "naeringsliv",
    actionId: "approach",
    channel: "job"
  };
  const res = bridge.handleSocialEncounterResponse("job_001", "reply", { message: jobMail });
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.reason, "job_mail_not_allowed");
  assert.strictEqual(sentMails.length, 0, "ingen followup registrert for jobbmail");
  // Relasjon skal ikke endres.
  assert.strictEqual(bridge.getSocialRelationship("friend_demo_01"), null);
});

check("jobb-aktig kanal/forsøk avvises selv om actionId er approach", () => {
  // En melding som later som den er sosial, men har karrierefelt.
  const fake = { actionId: "approach", channel: "private", mail_class: "private_message", career_id: "x", friendId: "friend_demo_01" };
  const res = bridge.handleSocialEncounterResponse("fake_1", "reply", { message: fake });
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.reason, "job_mail_not_allowed");
});

console.log("Trygghet ved ugyldige/manglende verdier");

check("ugyldig responseId håndteres trygt", () => {
  const ev = freshApproachEvent("approach_bad_1");
  const res = bridge.handleSocialEncounterResponse("approach_bad_1", "maybe", { message: ev });
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.reason, "invalid_response");
  assert.strictEqual(res.channel, "private");
  // Ingen relasjon eller followup ble opprettet.
  assert.strictEqual(bridge.getSocialRelationship("friend_demo_01"), null);
  assert.strictEqual(sentMails.length, 0);
});

check("manglende responseId / melding håndteres trygt", () => {
  assert.strictEqual(bridge.handleSocialEncounterResponse("x", null, { message: freshApproachEvent("x") }).reason, "invalid_response");
  assert.strictEqual(bridge.handleSocialEncounterResponse("x", "reply", {}).reason, "missing_message");
  assert.strictEqual(bridge.handleSocialEncounterResponse("x", "reply", { message: {} }).reason, "missing_message");
  // Ingen kast på helt tom input.
  const res = bridge.handleSocialEncounterResponse();
  assert.strictEqual(res.ok, false);
});

console.log("Dobbel-respons-vakt");

check("samme melding kan ikke behandles to ganger uten force", () => {
  const ev = freshApproachEvent("approach_dup_1");
  const first = bridge.handleSocialEncounterResponse("approach_dup_1", "reply", { message: ev });
  assert.strictEqual(first.ok, true);
  const second = bridge.handleSocialEncounterResponse("approach_dup_1", "decline", { message: ev });
  assert.strictEqual(second.ok, false);
  assert.strictEqual(second.reason, "already_responded");
  assert.strictEqual(second.status, "replied", "beholder første svar");
  // Relasjon ble bare oppdatert én gang (+1), ikke +1 så -1.
  assert.strictEqual(bridge.getSocialRelationship("friend_demo_01").relationshipLevel, 1);
});

check("force tillater eksplisitt ny behandling", () => {
  const ev = freshApproachEvent("approach_dup_2");
  bridge.handleSocialEncounterResponse("approach_dup_2", "ignore", { message: ev });
  const forced = bridge.handleSocialEncounterResponse("approach_dup_2", "reply", { message: ev, force: true });
  assert.strictEqual(forced.ok, true);
  assert.strictEqual(forced.status, "replied");
});

console.log("Relasjonsmodell (lokal, testbar)");

check("relationshipDelta akkumuleres i socialHistory og relationshipLevel", () => {
  const ev = freshApproachEvent("approach_rel_1");
  const res = bridge.handleSocialEncounterResponse("approach_rel_1", "reply", {
    message: ev, relationshipLevel: 2
  });
  const rel = res.relationship;
  assert.strictEqual(rel.friendId, "friend_demo_01");
  assert.strictEqual(rel.relationshipLevel, 3, "seed 2 + reply(+1) = 3");
  assert.strictEqual(rel.lastSocialResponse, "reply");
  assert.strictEqual(rel.socialHistory.length, 1);
  const h = rel.socialHistory[0];
  assert.strictEqual(h.messageId, "approach_rel_1");
  assert.strictEqual(h.actionId, "approach");
  assert.strictEqual(h.responseId, "reply");
  assert.strictEqual(h.phase, "leisure");
  assert.strictEqual(h.locationId, "park");
  assert.strictEqual(h.relationshipDelta, 1);
});

check("relationshipLevel går aldri under 0 ved gjentatte avvisninger", () => {
  const a = freshApproachEvent("approach_neg_1");
  const b = freshApproachEvent("approach_neg_2");
  bridge.handleSocialEncounterResponse("approach_neg_1", "decline", { message: a });
  bridge.handleSocialEncounterResponse("approach_neg_2", "decline", { message: b });
  const rel = bridge.getSocialRelationship("friend_demo_01");
  assert.strictEqual(rel.relationshipLevel, 0, "klemmes til 0");
  assert.strictEqual(rel.socialHistory.length, 2);
});

check("applySocialRelationshipDelta kan kalles direkte (ren relasjonsoppdatering)", () => {
  const rel = bridge.applySocialRelationshipDelta("friend_demo_03", {
    friendId: "friend_demo_03", responseId: "reply", relationshipDelta: 1,
    messageId: "m1", actionId: "approach", phase: "leisure", locationId: "football",
    baseRelationshipLevel: 1
  });
  assert.strictEqual(rel.relationshipLevel, 2);
  assert.strictEqual(rel.lastSocialResponse, "reply");
});

console.log("Followup ved Svar");

check("reply lager followup-melding på riktig form (privat, samtalestart)", () => {
  const ev = freshApproachEvent("approach_fu_1");
  const res = bridge.handleSocialEncounterResponse("approach_fu_1", "reply", { message: ev });
  const fu = res.followup;
  assert.strictEqual(fu.type, "private");
  assert.strictEqual(fu.channel, "private");
  assert.strictEqual(fu.source, "civication_social_response");
  assert.strictEqual(fu.actionId, "reply");
  assert.strictEqual(fu.friendId, "friend_demo_01");
  assert.strictEqual(fu.phase, "leisure");
  assert.strictEqual(fu.locationId, "park");
  assert.strictEqual(fu.threadId, "friend_friend_demo_01");
  assert.strictEqual(fu.title, "Samtale med Mariam");
  assert.strictEqual(fu.body, "Du svarer Mariam. Samtalen er i gang.");
  assert.strictEqual(fu.status, "open");
  assertNoJobFields(fu);
});

check("followup registreres som personlig melding i innkommende (aldri jobbmail)", () => {
  const ev = freshApproachEvent("approach_fu_2");
  const res = bridge.handleSocialEncounterResponse("approach_fu_2", "reply", { message: ev });
  assert.strictEqual(res.followupRegistered, true);
  assert.strictEqual(sentMails.length, 1, "followup skal sendes til mail-engine");
  const reg = sentMails[0];
  assert.strictEqual(reg.channel, "private");
  assert.strictEqual(reg.mail_class, "private_message");
  assert.strictEqual(reg.source, "civication_social_response");
  assert.strictEqual(channels.getMessageChannel(reg), "private");
  assert.strictEqual(channels.isJobMail(reg), false);
  assert.strictEqual(channels.isPrivateMessage(reg), true);
});

check("ignore/decline lager ingen followup og ingen mail", () => {
  ["ignore", "decline"].forEach((rid, i) => {
    sentMails.length = 0;
    const id = "approach_nofu_" + i;
    const ev = freshApproachEvent(id);
    const res = bridge.handleSocialEncounterResponse(id, rid, { message: ev });
    assert.strictEqual(res.followup, null);
    assert.strictEqual(sentMails.length, 0);
  });
});

check("createFollowupMessageFromSocialResponse returnerer null for ignore/decline", () => {
  assert.strictEqual(bridge.createFollowupMessageFromSocialResponse({ responseId: "ignore", friendId: "f" }), null);
  assert.strictEqual(bridge.createFollowupMessageFromSocialResponse({ responseId: "decline", friendId: "f" }), null);
  assert.ok(bridge.createFollowupMessageFromSocialResponse({ responseId: "reply", friendId: "f", friendName: "Kari Berg", phase: "leisure" }));
});

console.log("Ren byggefunksjon (uten sideeffekter)");

check("buildSocialEncounterResponseResult er ren og endrer ikke lager", () => {
  const ev = freshApproachEvent("approach_pure_1");
  const res = bridge.buildSocialEncounterResponseResult(ev, "decline", {});
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.status, "declined");
  // Ingen relasjon/respons ble lagret av den rene byggefunksjonen.
  assert.strictEqual(bridge.getSocialRelationship("friend_demo_01"), null);
  assert.strictEqual(bridge.getSocialResponseRecord("approach_pure_1"), null);
});

check("buildSocialEncounterResponseResult kan ta en rå approach-modell direkte", () => {
  const enc = eng.getSocialEncountersForLocation("leisure", "park", opts)[0];
  const model = bridge.createApproachMessageFromEncounter(enc);
  const res = bridge.buildSocialEncounterResponseResult(model, "reply", {});
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.friendId, "friend_demo_01");
  assert.strictEqual(res.threadId, "friend_friend_demo_01");
});

console.log("Adapter / view-model for Personlige meldinger");

check("view viser valg før svar (Svar/Ignorer/Avvis)", () => {
  const ev = freshApproachEvent("approach_view_1");
  const view = bridge.buildSocialEncounterResponseView(ev, { messageId: "approach_view_1" });
  assert.strictEqual(view.isSocialEncounter, true);
  assert.strictEqual(view.canRespond, true);
  assert.strictEqual(view.responded, false);
  assert.strictEqual(view.status, "pending_response");
  assert.strictEqual(view.channel, "private");
  assert.strictEqual(view.mail_class, "private_message");
  assert.deepStrictEqual(view.options, [
    { id: "reply", label: "Svar" },
    { id: "ignore", label: "Ignorer" },
    { id: "decline", label: "Avvis" }
  ]);
});

check("view viser resultat etter svar (Besvart) og ingen valg", () => {
  const ev = freshApproachEvent("approach_view_2");
  bridge.handleSocialEncounterResponse("approach_view_2", "reply", { message: ev });
  const view = bridge.buildSocialEncounterResponseView(ev, { messageId: "approach_view_2" });
  assert.strictEqual(view.responded, true);
  assert.strictEqual(view.status, "replied");
  assert.strictEqual(view.statusLabel, "Besvart");
  assert.strictEqual(view.responseId, "reply");
  assert.strictEqual(view.canRespond, false);
  assert.deepStrictEqual(view.options, []);
});

check("view for jobbmail er ikke en sosial henvendelse", () => {
  const view = bridge.buildSocialEncounterResponseView({
    id: "job_x", channel: "job", mail_class: "job_message", career_id: "y", actionId: "approach"
  }, {});
  assert.strictEqual(view.isSocialEncounter, false);
  assert.strictEqual(view.canRespond, false);
  assert.deepStrictEqual(view.options, []);
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
