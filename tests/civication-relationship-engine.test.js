#!/usr/bin/env node
// tests/civication-relationship-engine.test.js
//
// Validerer den datadrevne RELASJONSMOTOREN (CivicationRelationshipEngine) og
// integrasjonen mot svarsløyfen (CivicationFriendMessages). Relasjonen mellom
// spilleren og en venn skal bli en levende sosial progresjon over flere møter:
// tydelige nivåer/stages, historikk, tekstlig status og konsekvenser for senere
// sosial tilgjengelighet.
//
// Bekrefter:
//   - relationshipStage beregnes riktig fra relationshipLevel (0..5)
//   - norske stage-labels/blurbs
//   - reply øker relationshipLevel, trust og familiarity (+ warmer)
//   - ignore endrer ikke relationshipLevel/trust/familiarity
//   - decline senker relationshipLevel og trust (+ cooler/distant)
//   - relationshipLevel/trust/familiarity clampes innenfor min/max
//   - socialHistory appendes (ikke overskrives), samme melding gir ikke dobbel effekt
//   - availabilityModifier beregnes fra relasjon og siste respons + norsk label
//   - buildRelationshipSummary gir riktig norsk label/blurb/status
//   - sosial henvendelse oppdaterer relasjonsmotoren (via bridgen)
//   - jobbmail avvises av relasjonsmotoren (svarsløyfen)
//   - resultatet får aldri job/work/career-felt
//
// Kjør:  node tests/civication-relationship-engine.test.js

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

// Headless oppsett med localStorage-stub + fanget mail-engine (followup).
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

const RE = sandboxWindow.CivicationRelationshipEngine;
const eng = sandboxWindow.CivicationFriendsEngine;
const bridge = sandboxWindow.CivicationFriendMessages;

assert.ok(RE, "CivicationRelationshipEngine skal være lastet");
assert.ok(eng, "CivicationFriendsEngine skal være lastet");
assert.ok(bridge, "CivicationFriendMessages skal være lastet");

const locations = readJSON("data/Civication/map/phaseLocations.json").phaseLocations;
const friends = readJSON("data/Civication/map/friends.json").friends;
const snapshots = readJSON("data/Civication/map/friendPhaseSnapshots.json").friendPhaseSnapshots;
const opts = { friends, snapshots, locations, dayIndex: 1 };

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

console.log("Relasjonstrapp (level -> stage) og norske labels");

check("getRelationshipStage beregnes riktig fra relationshipLevel", () => {
  assert.strictEqual(RE.getRelationshipStage(0), "stranger");
  assert.strictEqual(RE.getRelationshipStage(1), "recognized");
  assert.strictEqual(RE.getRelationshipStage(2), "acquaintance");
  assert.strictEqual(RE.getRelationshipStage(3), "friendly_contact");
  assert.strictEqual(RE.getRelationshipStage(4), "friend");
  assert.strictEqual(RE.getRelationshipStage(5), "close_friend");
  // Klemmes innenfor 0..5.
  assert.strictEqual(RE.getRelationshipStage(-3), "stranger");
  assert.strictEqual(RE.getRelationshipStage(99), "close_friend");
});

check("stage-labels er norske", () => {
  assert.strictEqual(RE.getRelationshipStageLabel("stranger"), "fremmed");
  assert.strictEqual(RE.getRelationshipStageLabel("recognized"), "gjenkjent");
  assert.strictEqual(RE.getRelationshipStageLabel("acquaintance"), "bekjent");
  assert.strictEqual(RE.getRelationshipStageLabel("friendly_contact"), "vennlig kontakt");
  assert.strictEqual(RE.getRelationshipStageLabel("friend"), "venn");
  assert.strictEqual(RE.getRelationshipStageLabel("close_friend"), "nær venn");
  assert.strictEqual(RE.getRelationshipStageLabel("tull"), "");
});

check("stage-blurb finnes for hvert stage", () => {
  RE.STAGE_BY_LEVEL.forEach((stage) => {
    assert.ok(RE.getRelationshipStageBlurb(stage), "blurb mangler for " + stage);
  });
  assert.ok(/bekjente/i.test(RE.getRelationshipStageBlurb("acquaintance")));
  assert.ok(/vennlig kontakt/i.test(RE.getRelationshipStageBlurb("friendly_contact")));
  assert.ok(/nær venn/i.test(RE.getRelationshipStageBlurb("close_friend")));
});

console.log("Clamps (min/max for nivå, tillit, familiaritet)");

check("clampRelationshipLevel/Trust/Familiarity holder innenfor grenser", () => {
  assert.strictEqual(RE.clampRelationshipLevel(-5), 0);
  assert.strictEqual(RE.clampRelationshipLevel(12), 5);
  assert.strictEqual(RE.clampRelationshipLevel(3), 3);
  assert.strictEqual(RE.clampTrust(-2), 0);
  assert.strictEqual(RE.clampTrust(99), RE.MAX_TRUST);
  assert.strictEqual(RE.clampFamiliarity(-1), 0);
  assert.strictEqual(RE.clampFamiliarity(1000), RE.MAX_FAMILIARITY);
  // Ugyldige/manglende verdier klemmes trygt til min.
  assert.strictEqual(RE.clampRelationshipLevel(undefined), 0);
  assert.strictEqual(RE.clampTrust("abc"), 0);
});

console.log("Konsekvensmodell pr. svarvalg");

check("buildRelationshipDeltaFromSocialResponse gir riktige dimensjoner", () => {
  assert.deepStrictEqual(RE.buildRelationshipDeltaFromSocialResponse("reply"), {
    responseId: "reply", relationshipDelta: 1, trustDelta: 1, familiarityDelta: 1, availabilityModifier: "warmer"
  });
  assert.deepStrictEqual(RE.buildRelationshipDeltaFromSocialResponse({ responseId: "ignore" }), {
    responseId: "ignore", relationshipDelta: 0, trustDelta: 0, familiarityDelta: 0, availabilityModifier: "unchanged"
  });
  assert.deepStrictEqual(RE.buildRelationshipDeltaFromSocialResponse({ status: "declined" }), {
    responseId: "decline", relationshipDelta: -1, trustDelta: -1, familiarityDelta: 0, availabilityModifier: "cooler"
  });
  // Ukjent svar -> nøytral delta.
  const neutral = RE.buildRelationshipDeltaFromSocialResponse("tull");
  assert.strictEqual(neutral.relationshipDelta, 0);
  assert.strictEqual(neutral.responseId, "");
});

check("applyRelationshipDelta clamper og oppdaterer stage", () => {
  const base = { friendId: "f1", relationshipLevel: 4, trust: 4, familiarity: 7 };
  const up = RE.applyRelationshipDelta(base, { relationshipDelta: 1, trustDelta: 1, familiarityDelta: 1, availabilityModifier: "warmer" });
  assert.strictEqual(up.relationshipLevel, 5);
  assert.strictEqual(up.relationshipStage, "close_friend");
  assert.strictEqual(up.trust, 5);
  assert.strictEqual(up.familiarity, 8);
  assert.strictEqual(up.availabilityModifier, "warmer");
  // Går aldri over maks selv ved nytt +1.
  const over = RE.applyRelationshipDelta(up, { relationshipDelta: 1, trustDelta: 1, familiarityDelta: 1 });
  assert.strictEqual(over.relationshipLevel, 5);
  assert.strictEqual(over.trust, 5);
  assert.strictEqual(over.familiarity, 8);
});

console.log("Full oppdatering fra sosialt svar (ren motor)");

check("updateRelationshipFromSocialResponse appender historikk + setter siste kontekst", () => {
  const message = { id: "m1", friendId: "f2", phase: "leisure", locationId: "park", actionId: "approach" };
  const rr = { responseId: "reply", messageId: "m1", friendId: "f2", phase: "leisure", locationId: "park", actionId: "approach" };
  const rel = RE.updateRelationshipFromSocialResponse(message, rr, { friendId: "f2", relationshipLevel: 1 });
  assert.strictEqual(rel.relationshipLevel, 2);
  assert.strictEqual(rel.relationshipStage, "acquaintance");
  assert.strictEqual(rel.trust, 1);
  assert.strictEqual(rel.familiarity, 1);
  assert.strictEqual(rel.lastSocialResponse, "reply");
  assert.strictEqual(rel.lastInteractionPhase, "leisure");
  assert.strictEqual(rel.lastInteractionLocationId, "park");
  assert.strictEqual(rel.availabilityModifier, "warmer");
  assert.strictEqual(rel.socialHistory.length, 1);
  const h = rel.socialHistory[0];
  assert.strictEqual(h.trustDelta, 1);
  assert.strictEqual(h.familiarityDelta, 1);
});

check("samme messageId gir ikke dobbel relasjonseffekt (ren motor)", () => {
  const message = { id: "dup", friendId: "f3", phase: "leisure", locationId: "park" };
  const rr = { responseId: "reply", messageId: "dup", friendId: "f3", phase: "leisure", locationId: "park" };
  const once = RE.updateRelationshipFromSocialResponse(message, rr, { friendId: "f3", relationshipLevel: 1 });
  const twice = RE.updateRelationshipFromSocialResponse(message, rr, once);
  assert.strictEqual(twice.relationshipLevel, 2, "ikke +1 igjen for samme melding");
  assert.strictEqual(twice.socialHistory.length, 1, "historikk ikke duplisert");
});

console.log("Sosial tilgjengelighet (availability modifier)");

check("getAvailabilityModifierFromRelationship + norsk label", () => {
  assert.strictEqual(RE.getAvailabilityModifierFromRelationship({ lastSocialResponse: "reply", relationshipLevel: 3 }), "warmer");
  assert.strictEqual(RE.getAvailabilityModifierFromRelationship({ lastSocialResponse: "decline", relationshipLevel: 3 }), "cooler");
  assert.strictEqual(RE.getAvailabilityModifierFromRelationship({ lastSocialResponse: "decline", relationshipLevel: 0 }), "distant");
  assert.strictEqual(RE.getAvailabilityModifierFromRelationship({ lastSocialResponse: "ignore", relationshipLevel: 2 }), "normal");
  assert.strictEqual(RE.getAvailabilityModifierLabel("warmer"), "mer åpen");
  assert.strictEqual(RE.getAvailabilityModifierLabel("normal"), "normal");
  assert.strictEqual(RE.getAvailabilityModifierLabel("cooler"), "mer reservert");
  assert.strictEqual(RE.getAvailabilityModifierLabel("distant"), "distansert");
});

check("gjentatte avvisninger gjør relasjonen distansert", () => {
  let rel = { friendId: "f9", relationshipLevel: 2 };
  rel = RE.updateRelationshipFromSocialResponse({ id: "d1", friendId: "f9" }, { responseId: "decline", messageId: "d1", friendId: "f9" }, rel);
  assert.strictEqual(rel.availabilityModifier, "cooler");
  rel = RE.updateRelationshipFromSocialResponse({ id: "d2", friendId: "f9" }, { responseId: "decline", messageId: "d2", friendId: "f9" }, rel);
  assert.strictEqual(rel.availabilityModifier, "distant", "andre avvisning eskalerer til distansert");
});

check("shouldShowFriendAsSocialEncounter skjuler distansert relasjon", () => {
  assert.strictEqual(RE.shouldShowFriendAsSocialEncounter("f1", "leisure", "park", null), true);
  const warm = { friendId: "f1", lastSocialResponse: "reply", relationshipLevel: 3 };
  assert.strictEqual(RE.shouldShowFriendAsSocialEncounter("f1", "leisure", "park", warm), true);
  const distant = { friendId: "f1", availabilityModifier: "distant" };
  assert.strictEqual(RE.shouldShowFriendAsSocialEncounter("f1", "leisure", "park", distant), false);
  // Relasjon for en annen venn blokkerer ikke.
  assert.strictEqual(RE.shouldShowFriendAsSocialEncounter("f2", "leisure", "park", distant), true);
});

console.log("Relasjonssammendrag (norsk status)");

check("buildRelationshipSummary gir norsk label/blurb/status", () => {
  const sum = RE.buildRelationshipSummary({
    friendId: "f1", relationshipLevel: 3, trust: 2, familiarity: 4,
    lastSocialResponse: "reply", lastInteractionPhase: "leisure", lastInteractionLocationId: "cafe",
    socialHistory: [{ messageId: "x" }]
  });
  assert.strictEqual(sum.relationshipStage, "friendly_contact");
  assert.strictEqual(sum.stageLabel, "vennlig kontakt");
  assert.ok(/vennlig kontakt/i.test(sum.stageBlurb));
  assert.strictEqual(sum.availabilityModifier, "warmer");
  assert.strictEqual(sum.availabilityModifierLabel, "mer åpen");
  assert.strictEqual(sum.lastSocialResponseLabel, "Svar");
  assert.strictEqual(sum.lastInteractionLocationId, "cafe");
  assert.strictEqual(sum.historyCount, 1);
  assert.ok(/varmere/i.test(sum.statusText), "warmer-status skal nevnes");
});

console.log("Integrasjon: svarsløyfen oppdaterer relasjonsmotoren (bridge)");

check("reply øker relationshipLevel, trust og familiarity via bridgen", () => {
  const ev = freshApproachEvent("re_reply_1");
  const res = bridge.handleSocialEncounterResponse("re_reply_1", "reply", { message: ev, relationshipLevel: 2 });
  assert.strictEqual(res.ok, true);
  const rel = res.relationship;
  assert.strictEqual(rel.relationshipLevel, 3, "seed 2 + reply(+1)");
  assert.strictEqual(rel.relationshipStage, "friendly_contact");
  assert.strictEqual(rel.trust, 1);
  assert.strictEqual(rel.familiarity, 1);
  assert.strictEqual(rel.lastInteractionPhase, "leisure");
  assert.strictEqual(rel.lastInteractionLocationId, "park");
  assert.strictEqual(rel.availabilityModifier, "warmer");
  // Sammendrag følger med.
  assert.ok(res.relationshipSummary);
  assert.strictEqual(res.relationshipSummary.stageLabel, "vennlig kontakt");
  assertNoJobFields(res);
});

check("ignore endrer ikke relationshipLevel/trust/familiarity", () => {
  const ev = freshApproachEvent("re_ignore_1");
  const res = bridge.handleSocialEncounterResponse("re_ignore_1", "ignore", { message: ev, relationshipLevel: 2 });
  const rel = res.relationship;
  assert.strictEqual(rel.relationshipLevel, 2);
  assert.strictEqual(rel.trust, 0);
  assert.strictEqual(rel.familiarity, 0);
});

check("decline senker relationshipLevel og trust", () => {
  const ev = freshApproachEvent("re_decline_1");
  const res = bridge.handleSocialEncounterResponse("re_decline_1", "decline", { message: ev, relationshipLevel: 2 });
  const rel = res.relationship;
  assert.strictEqual(rel.relationshipLevel, 1, "seed 2 + decline(-1)");
  assert.strictEqual(rel.trust, 0, "trust klemmes til 0");
  assert.strictEqual(rel.availabilityModifier, "cooler");
});

check("socialHistory appendes over flere møter (ikke overskrives)", () => {
  const a = freshApproachEvent("re_h_1");
  const b = freshApproachEvent("re_h_2");
  bridge.handleSocialEncounterResponse("re_h_1", "reply", { message: a, relationshipLevel: 1 });
  const res2 = bridge.handleSocialEncounterResponse("re_h_2", "reply", { message: b });
  const rel = res2.relationship;
  assert.strictEqual(rel.socialHistory.length, 2);
  assert.strictEqual(rel.relationshipLevel, 3, "1 -> 2 -> 3");
});

check("samme melding gir ikke dobbel effekt via bridgen", () => {
  const ev = freshApproachEvent("re_dup_1");
  bridge.handleSocialEncounterResponse("re_dup_1", "reply", { message: ev, relationshipLevel: 1 });
  const second = bridge.handleSocialEncounterResponse("re_dup_1", "reply", { message: ev });
  assert.strictEqual(second.ok, false);
  assert.strictEqual(second.reason, "already_responded");
  const rel = bridge.getSocialRelationship("friend_demo_01");
  assert.strictEqual(rel.relationshipLevel, 2, "kun én +1");
  assert.strictEqual(rel.socialHistory.length, 1);
});

check("jobbmail avvises av relasjonsmotoren/svarsløyfen", () => {
  const jobMail = {
    id: "job_xx", mail_class: "job_message", career_id: "naeringsliv",
    task_domain: "cash_desk", actionId: "approach", channel: "job"
  };
  const res = bridge.handleSocialEncounterResponse("job_xx", "reply", { message: jobMail });
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.reason, "job_mail_not_allowed");
  assert.strictEqual(bridge.getSocialRelationship("friend_demo_01"), null);
});

check("getRelationshipSummaryForFriend henter sammendrag fra lokalt lager", () => {
  const ev = freshApproachEvent("re_sum_1");
  bridge.handleSocialEncounterResponse("re_sum_1", "reply", { message: ev, relationshipLevel: 3 });
  const sum = bridge.getRelationshipSummaryForFriend("friend_demo_01");
  assert.ok(sum, "sammendrag skal finnes etter svar");
  assert.strictEqual(sum.relationshipLevel, 4);
  assert.strictEqual(sum.stageLabel, "venn");
  assert.strictEqual(bridge.getRelationshipSummaryForFriend("ukjent_venn"), null);
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
