#!/usr/bin/env node
// tests/civication-social-conversations.test.js
//
// Validerer den datadrevne SOSIALE SAMTALEMOTOREN
// (CivicationSocialConversationEngine). Når en sosial henvendelse får responsen
// «Svar» (reply) skal positiv respons bli en faktisk, spillbar samtaletråd i
// Personlige meldinger – ikke bare relasjonspoeng.
//
// Bekrefter:
//   Opprettelse:
//     - reply oppretter samtaletråd; ignore/decline gjør ikke
//     - samtale får channel "private" / mail_class "private_message"
//     - samtale (og meldinger) får ALDRI job/work/career-felt
//     - conversationId og threadId er stabile og testbare
//     - samtaletråden registreres som privat melding i innkommende
//   Valg:
//     - friendly_reply/ask_question/share_something gir riktige deltas + continued
//     - suggest_same_place_again gir riktige deltas + paused (+ sosialt hint)
//     - end_politely gir closed
//     - ugyldig choiceId håndteres trygt
//     - manglende samtale håndteres trygt
//     - samme samtaletur kan ikke gi dobbel effekt uten kontroll
//   Relasjon:
//     - samtalevalg oppdaterer relationshipLevel/trust/familiarity (clampet)
//     - socialHistory appendes med samtale-entry
//     - lastInteractionPhase/locationId + lastConversationChoice/status settes
//   View-model:
//     - riktige norske labels, stabile choiceId-er, riktig statuslabel
//   Integrasjon:
//     - handleSocialEncounterResponse(reply) åpner en samtaletråd
//
// Kjør:  node tests/civication-social-conversations.test.js

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
loadScript("js/Civication/systems/civicationRelationshipEngine.js");
loadScript("js/Civication/systems/civicationFriendMessages.js");
loadScript("js/Civication/systems/CivicationSocialConversationEngine.js");

const channels = sandboxWindow.CivicationEventChannels;
const eng = sandboxWindow.CivicationFriendsEngine;
const bridge = sandboxWindow.CivicationFriendMessages;
const convo = sandboxWindow.CivicationSocialConversationEngine;

assert.ok(channels, "CivicationEventChannels skal være lastet");
assert.ok(eng, "CivicationFriendsEngine skal være lastet");
assert.ok(bridge, "CivicationFriendMessages skal være lastet");
assert.ok(convo, "CivicationSocialConversationEngine skal være lastet");

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

// Bygger et reply-responseResult uten å gå via hele svarsløyfen.
function freshReplyResult(id) {
  const ev = freshApproachEvent(id || "approach_conv");
  return bridge.buildSocialEncounterResponseResult(ev, "reply", { messageId: id || "approach_conv" });
}

let failures = 0;
function check(name, fn) {
  sentMails.length = 0;
  bridge.clearSocialRelationshipsForTesting();
  bridge.clearSocialResponsesForTesting();
  convo.clearConversationsForTesting();
  try {
    fn();
    console.log("  ok  -", name);
  } catch (e) {
    failures += 1;
    console.error("FAIL  -", name);
    console.error("       ", e && e.message);
  }
}

const JOB_FORBIDDEN = ["career_id", "role_key", "role_id", "brand_id", "brand_name", "task_domain", "career_outcome_meta", "role_scope", "mail_plan_meta"];
function assertNoJobFields(o) {
  JOB_FORBIDDEN.forEach((k) => assert.strictEqual(o[k], undefined, "uventet jobbfelt: " + k));
  assert.notStrictEqual(String(o.channel || "").toLowerCase(), "job", "channel skal aldri være job");
  assert.notStrictEqual(String(o.mail_class || "").toLowerCase(), "job_message", "mail_class skal aldri være job_message");
}

console.log("Labels og statuser (norsk)");

check("getConversationStatusLabel gir åpen/fortsetter/på pause/avsluttet", () => {
  assert.strictEqual(convo.getConversationStatusLabel("open"), "åpen");
  assert.strictEqual(convo.getConversationStatusLabel("continued"), "fortsetter");
  assert.strictEqual(convo.getConversationStatusLabel("paused"), "på pause");
  assert.strictEqual(convo.getConversationStatusLabel("closed"), "avsluttet");
  assert.strictEqual(convo.getConversationStatusLabel("tull"), "åpen"); // normaliseres trygt
});

check("getConversationChoiceLabel gir norske labels for alle valg", () => {
  assert.strictEqual(convo.getConversationChoiceLabel("friendly_reply"), "Svar vennlig");
  assert.strictEqual(convo.getConversationChoiceLabel("ask_question"), "Still et spørsmål");
  assert.strictEqual(convo.getConversationChoiceLabel("share_something"), "Del noe kort");
  assert.strictEqual(convo.getConversationChoiceLabel("suggest_same_place_again"), "Foreslå å møtes her igjen");
  assert.strictEqual(convo.getConversationChoiceLabel("end_politely"), "Avslutt høflig");
  assert.strictEqual(convo.getConversationChoiceLabel("tull"), "");
});

console.log("Opprettelse av samtaletråd");

check("reply oppretter samtaletråd knyttet til friend/phase/locationId", () => {
  const rr = freshReplyResult("approach_make_1");
  const conv = convo.createSocialConversationFromResponse(rr, {});
  assert.ok(conv, "reply skal opprette samtale");
  assert.strictEqual(conv.friendId, "friend_demo_01");
  assert.strictEqual(conv.phase, "leisure");
  assert.strictEqual(conv.locationId, "park");
  assert.strictEqual(conv.originActionId, "approach");
  assert.strictEqual(conv.source, "civication_social_conversation");
  assert.strictEqual(conv.status, "open");
  assert.strictEqual(conv.turnIndex, 0);
  assert.strictEqual(conv.threadId, "friend_friend_demo_01");
  assert.strictEqual(conv.messages.length, 1);
  assert.strictEqual(conv.messages[0].speaker, "friend");
});

check("ignore/decline oppretter IKKE samtaletråd", () => {
  const ig = bridge.buildSocialEncounterResponseResult(freshApproachEvent("a_ig"), "ignore", {});
  const de = bridge.buildSocialEncounterResponseResult(freshApproachEvent("a_de"), "decline", {});
  assert.strictEqual(convo.createSocialConversationFromResponse(ig, {}), null);
  assert.strictEqual(convo.createSocialConversationFromResponse(de, {}), null);
  assert.strictEqual(convo.getConversationsForFriend("friend_demo_01").length, 0);
});

check("samtale får channel private / mail_class private_message, ingen jobbfelt", () => {
  const conv = convo.createSocialConversationFromResponse(freshReplyResult("approach_sep"), {});
  assert.strictEqual(conv.channel, "private");
  assert.strictEqual(conv.mail_class, "private_message");
  assertNoJobFields(conv);
  conv.messages.forEach(assertNoJobFields);
});

check("conversationId og threadId er stabile og testbare", () => {
  const conv = convo.createSocialConversationFromResponse(freshReplyResult("approach_id"), {});
  assert.strictEqual(conv.conversationId, "conv_friend_demo_01_leisure_park_001");
  assert.strictEqual(conv.threadId, "friend_friend_demo_01");
  assert.strictEqual(convo.resolveConversationThreadId("friend_demo_01"), "friend_friend_demo_01");
});

check("samtaletråden registreres som privat melding i innkommende", () => {
  convo.createSocialConversationFromResponse(freshReplyResult("approach_reg"), {});
  assert.strictEqual(sentMails.length, 1, "samtale skal registreres i innkommende");
  const reg = sentMails[0];
  assert.strictEqual(reg.channel, "private");
  assert.strictEqual(reg.mail_class, "private_message");
  assert.strictEqual(reg.source, "civication_social_conversation");
  assert.strictEqual(reg.conversationId, "conv_friend_demo_01_leisure_park_001");
  assert.strictEqual(channels.isJobMail(reg), false);
  assert.strictEqual(channels.isPrivateMessage(reg), true);
  assertNoJobFields(reg);
});

console.log("Samtalevalg og konsekvenser");

function makeConversation(id) {
  return convo.createSocialConversationFromResponse(freshReplyResult(id || "approach_c"), {});
}

check("friendly_reply -> deltas (+1/+1/+1) og continued", () => {
  const conv = makeConversation("approach_fr");
  const res = convo.handleSocialConversationChoice(conv.conversationId, "friendly_reply", {});
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.status, "continued");
  assert.strictEqual(res.statusLabel, "fortsetter");
  assert.strictEqual(res.choiceResult.relationshipDelta, 1);
  assert.strictEqual(res.choiceResult.trustDelta, 1);
  assert.strictEqual(res.choiceResult.familiarityDelta, 1);
  assert.strictEqual(res.resultText, "Du svarer vennlig. Samtalen fortsetter.");
});

check("ask_question -> deltas (0/+1/+1) og continued", () => {
  const conv = makeConversation("approach_aq");
  const res = convo.handleSocialConversationChoice(conv.conversationId, "ask_question", {});
  assert.strictEqual(res.status, "continued");
  assert.strictEqual(res.choiceResult.relationshipDelta, 0);
  assert.strictEqual(res.choiceResult.trustDelta, 1);
  assert.strictEqual(res.choiceResult.familiarityDelta, 1);
  assert.strictEqual(res.resultText, "Du stiller et spørsmål. Dere blir litt bedre kjent.");
});

check("share_something -> deltas (+1/0/+1) og continued", () => {
  const conv = makeConversation("approach_ss");
  const res = convo.handleSocialConversationChoice(conv.conversationId, "share_something", {});
  assert.strictEqual(res.status, "continued");
  assert.strictEqual(res.choiceResult.relationshipDelta, 1);
  assert.strictEqual(res.choiceResult.trustDelta, 0);
  assert.strictEqual(res.choiceResult.familiarityDelta, 1);
});

check("suggest_same_place_again -> deltas (+1/+1/0), paused og sosialt hint", () => {
  const conv = makeConversation("approach_sp");
  const res = convo.handleSocialConversationChoice(conv.conversationId, "suggest_same_place_again", {});
  assert.strictEqual(res.status, "paused");
  assert.strictEqual(res.statusLabel, "på pause");
  assert.strictEqual(res.choiceResult.relationshipDelta, 1);
  assert.strictEqual(res.choiceResult.trustDelta, 1);
  assert.strictEqual(res.choiceResult.familiarityDelta, 0);
  assert.ok(res.choiceResult.socialHint, "skal lage et sosialt hint");
  assert.strictEqual(res.choiceResult.socialHint.phase, "leisure");
  assert.strictEqual(res.choiceResult.socialHint.locationId, "park");
  assert.strictEqual(res.conversation.pendingHint.kind, "meet_same_place_again");
});

check("end_politely -> deltas (0/0/0) og closed", () => {
  const conv = makeConversation("approach_ep");
  const res = convo.handleSocialConversationChoice(conv.conversationId, "end_politely", {});
  assert.strictEqual(res.status, "closed");
  assert.strictEqual(res.statusLabel, "avsluttet");
  assert.strictEqual(res.choiceResult.relationshipDelta, 0);
  assert.strictEqual(res.choiceResult.trustDelta, 0);
  assert.strictEqual(res.choiceResult.familiarityDelta, 0);
  assert.deepStrictEqual(res.conversation.choices, []);
});

console.log("Trygghet og dobbel-effekt-vakt");

check("ugyldig choiceId håndteres trygt", () => {
  const conv = makeConversation("approach_bad");
  const res = convo.handleSocialConversationChoice(conv.conversationId, "tull", {});
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.reason, "invalid_choice");
  // Relasjon og samtale uendret.
  assert.strictEqual(bridge.getSocialRelationship("friend_demo_01"), null);
  assert.strictEqual(convo.getConversationById(conv.conversationId).turnIndex, 0);
});

check("manglende samtale håndteres trygt", () => {
  const res = convo.handleSocialConversationChoice("conv_finnes_ikke", "friendly_reply", {});
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.reason, "missing_conversation");
  const none = convo.handleSocialConversationChoice();
  assert.strictEqual(none.ok, false);
});

check("samme samtaletur kan ikke gi dobbel effekt uten kontroll", () => {
  const conv = makeConversation("approach_dup");
  const r1 = convo.handleSocialConversationChoice(conv.conversationId, "friendly_reply", {});
  assert.strictEqual(r1.ok, true);
  const relAfter1 = bridge.getSocialRelationship("friend_demo_01");
  // Forsøk å behandle SAMME tur (0) på nytt.
  const r2 = convo.handleSocialConversationChoice(conv.conversationId, "friendly_reply", { atTurnIndex: 0 });
  assert.strictEqual(r2.ok, false);
  assert.strictEqual(r2.reason, "turn_already_handled");
  const relAfter2 = bridge.getSocialRelationship("friend_demo_01");
  assert.deepStrictEqual(relAfter2, relAfter1, "relasjon skal ikke endres av avvist dobbel-tur");
});

check("lukket samtale avviser videre valg", () => {
  const conv = makeConversation("approach_closed");
  convo.handleSocialConversationChoice(conv.conversationId, "end_politely", {});
  const res = convo.handleSocialConversationChoice(conv.conversationId, "friendly_reply", {});
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.reason, "conversation_closed");
});

check("samtalen kan fortsette over flere turer (turnIndex øker)", () => {
  const conv = makeConversation("approach_multi");
  const r1 = convo.handleSocialConversationChoice(conv.conversationId, "friendly_reply", {});
  assert.strictEqual(r1.turnIndex, 1);
  const r2 = convo.handleSocialConversationChoice(conv.conversationId, "ask_question", {});
  assert.strictEqual(r2.turnIndex, 2);
  assert.strictEqual(r2.status, "continued");
  const stored = convo.getConversationById(conv.conversationId);
  assert.strictEqual(stored.choiceLog.length, 2);
});

console.log("Relasjonskonsekvens (clamps + socialHistory)");

check("samtalevalg oppdaterer relationshipLevel/trust/familiarity", () => {
  const rr = bridge.buildSocialEncounterResponseResult(freshApproachEvent("approach_rel"), "reply", { relationshipLevel: 1 });
  // Seed relasjon via svarsløyfens applikator (gir level 2, trust/fam 1).
  bridge.applySocialRelationshipDelta("friend_demo_01", rr);
  const conv = convo.createSocialConversationFromResponse(rr, {});
  const res = convo.handleSocialConversationChoice(conv.conversationId, "friendly_reply", {});
  const rel = res.relationship;
  assert.strictEqual(rel.relationshipLevel, 3, "2 + friendly_reply(+1) = 3");
  assert.strictEqual(rel.trust, 2, "1 + 1 = 2");
  assert.strictEqual(rel.familiarity, 2, "1 + 1 = 2");
  assert.strictEqual(rel.lastConversationChoice, "friendly_reply");
  assert.strictEqual(rel.lastConversationStatus, "continued");
  assert.strictEqual(rel.lastInteractionPhase, "leisure");
  assert.strictEqual(rel.lastInteractionLocationId, "park");
});

check("socialHistory appendes med samtale-entry", () => {
  const conv = makeConversation("approach_hist");
  convo.handleSocialConversationChoice(conv.conversationId, "ask_question", {});
  const rel = bridge.getSocialRelationship("friend_demo_01");
  const last = rel.socialHistory[rel.socialHistory.length - 1];
  assert.strictEqual(last.source, "civication_social_conversation");
  assert.strictEqual(last.choiceId, "ask_question");
  assert.strictEqual(last.conversationId, conv.conversationId);
  assert.strictEqual(last.phase, "leisure");
  assert.strictEqual(last.locationId, "park");
});

check("relasjonsverdier clampes gjennom relasjonsmotoren (maks)", () => {
  // Seed nær maks og gjør flere positive valg.
  bridge.saveSocialRelationship({
    friendId: "friend_demo_01", relationshipLevel: 5, trust: 5, familiarity: 8, socialHistory: []
  });
  const conv = makeConversation("approach_clamp");
  const res = convo.handleSocialConversationChoice(conv.conversationId, "friendly_reply", {});
  assert.strictEqual(res.relationship.relationshipLevel, 5, "klemmes til MAX_LEVEL");
  assert.strictEqual(res.relationship.trust, 5, "klemmes til MAX_TRUST");
  assert.strictEqual(res.relationship.familiarity, 8, "klemmes til MAX_FAMILIARITY");
});

console.log("View-model for Personlige meldinger");

check("view-model gir riktige norske labels og stabile choiceId-er", () => {
  const conv = makeConversation("approach_view");
  const view = convo.buildSocialConversationView(conv);
  assert.strictEqual(view.conversationId, conv.conversationId);
  assert.strictEqual(view.threadId, "friend_friend_demo_01");
  assert.strictEqual(view.title, "Samtale med Mariam");
  assert.strictEqual(view.subtitle, "Fritidsfase · Park");
  assert.strictEqual(view.status, "open");
  assert.strictEqual(view.statusLabel, "åpen");
  assert.strictEqual(view.channel, "private");
  assert.strictEqual(view.mail_class, "private_message");
  assert.deepStrictEqual(view.choices, [
    { choiceId: "friendly_reply", label: "Svar vennlig" },
    { choiceId: "ask_question", label: "Still et spørsmål" },
    { choiceId: "share_something", label: "Del noe kort" },
    { choiceId: "suggest_same_place_again", label: "Foreslå å møtes her igjen" },
    { choiceId: "end_politely", label: "Avslutt høflig" }
  ]);
});

check("statuslabel blir riktig på norsk etter valg", () => {
  const conv = makeConversation("approach_view2");
  const res = convo.handleSocialConversationChoice(conv.conversationId, "suggest_same_place_again", {});
  const view = res.view;
  assert.strictEqual(view.status, "paused");
  assert.strictEqual(view.statusLabel, "på pause");
});

console.log("Integrasjon med svarsløyfen");

check("handleSocialEncounterResponse(reply) åpner en samtaletråd", () => {
  const ev = freshApproachEvent("approach_int_1");
  const res = bridge.handleSocialEncounterResponse("approach_int_1", "reply", { message: ev });
  assert.strictEqual(res.ok, true);
  assert.ok(res.conversation, "reply skal åpne samtaletråd");
  assert.strictEqual(res.conversationId, res.conversation.conversationId);
  assert.strictEqual(res.conversation.friendId, "friend_demo_01");
  assert.strictEqual(res.conversation.status, "open");
  // Followup-meldingen er bevart og koblet til samtalens id.
  assert.ok(res.followup, "followup skal fortsatt finnes");
  assert.strictEqual(res.followupEvent.conversationId, res.conversationId);
  // Den åpne samtalen finnes i lageret for vennen.
  const list = convo.getConversationsForFriend("friend_demo_01");
  assert.strictEqual(list.length, 1);
});

check("handleSocialEncounterResponse(ignore) åpner ingen samtaletråd", () => {
  const ev = freshApproachEvent("approach_int_2");
  const res = bridge.handleSocialEncounterResponse("approach_int_2", "ignore", { message: ev });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.conversation, undefined);
  assert.strictEqual(convo.getConversationsForFriend("friend_demo_01").length, 0);
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
