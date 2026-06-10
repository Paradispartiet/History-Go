#!/usr/bin/env node
// tests/civication-city-map-node-roles.test.js
//
// Validerer den semantiske klassifiseringen av Civication-kartnodene (Del A/B)
// og at "Henvend deg" (approach) er den sosiale kontakthandlingen fra vennens
// profilkort (Del D):
//   - getLocationRole gir riktig rolle for system-/spillnoder, venners hjem,
//     ekte sosiale steder og generiske sosiale fallback-noder.
//   - isSystemLocation / isFriendHomeLocation / isRealSocialPlace /
//     isGenericSocialFallback er presise.
//   - shouldRenderLocationOnCityMap skjuler generiske fallback-noder når ekte
//     steder av samme socialPlaceType finnes, og beholder dem ellers.
//   - systemnoder, venners hjem og ekte sosiale steder skjules aldri.
//   - approach-handlingen fra profilkortet lager en personlig henvendelse
//     (privat kanal, aldri jobb) via CivicationFriendMessages.
//
// Kjør:  node tests/civication-city-map-node-roles.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

const sentMails = [];
const sandboxWindow = {
  addEventListener() {},
  CustomEvent: function (type, init) { this.type = type; this.detail = init && init.detail; },
  dispatchEvent() { return true; },
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

function loadScript(rel) {
  const code = fs.readFileSync(path.join(repoRoot, rel), "utf8");
  vm.runInThisContext(code, { filename: rel });
}

loadScript("js/Civication/systems/civicationEventChannels.js");
loadScript("js/Civication/systems/civicationFriendsEngine.js");
loadScript("js/Civication/systems/civicationFriendMessages.js");

const channels = sandboxWindow.CivicationEventChannels;
const eng = sandboxWindow.CivicationFriendsEngine;
const bridge = sandboxWindow.CivicationFriendMessages;

assert.ok(eng, "CivicationFriendsEngine skal være lastet");
assert.ok(bridge, "CivicationFriendMessages skal være lastet");
assert.ok(channels, "CivicationEventChannels skal være lastet");

const locations = readJSON("data/Civication/map/phaseLocations.json").phaseLocations;
const friends = readJSON("data/Civication/map/friends.json").friends;
const snapshots = readJSON("data/Civication/map/friendPhaseSnapshots.json").friendPhaseSnapshots;
const opts = { friends, snapshots, locations, dayIndex: 1 };

function loc(id) { return locations.find((l) => l.id === id); }

// Ekte sosiale steder (slik CivicationSocialPlaceResolver bygger dem).
const realCoffee = {
  id: "brand_place:oslo_s:fuglen", sourcePlaceId: "oslo_s", brandId: "fuglen",
  socialPlaceType: "coffee", type: "cafe", label: "Fuglen", placeLabel: "Oslo S"
};
const realPark = {
  id: "place:sofienbergparken", sourcePlaceId: "sofienbergparken", brandId: null,
  socialPlaceType: "park_public_space", type: "park", label: "Sofienbergparken", placeLabel: "Sofienbergparken"
};

let failures = 0;
function check(name, fn) {
  sentMails.length = 0;
  try { fn(); console.log("  ok  -", name); }
  catch (e) { failures += 1; console.error("FAIL  -", name); console.error("       ", e && e.message); }
}

console.log("Kartnode-klassifisering (Del A)");

check("system-/spillnoder får riktig rolle", () => {
  assert.strictEqual(eng.getLocationRole(loc("home")), "player_home");
  assert.strictEqual(eng.getLocationRole(loc("workplace")), "work_node");
  assert.strictEqual(eng.getLocationRole(loc("nav_office")), "system_node");
  assert.strictEqual(eng.getLocationRole(loc("psychology_room")), "insight_node");
});

check("venners hjem klassifiseres som friend_home", () => {
  ["friend_home_demo_01", "friend_home_demo_02", "friend_home_demo_03"].forEach((id) => {
    assert.strictEqual(eng.getLocationRole(loc(id)), "friend_home");
    assert.strictEqual(eng.isFriendHomeLocation(loc(id)), true);
  });
});

check("ekte sosiale steder (brand_place:* / place:*) klassifiseres som social_place", () => {
  assert.strictEqual(eng.getLocationRole(realCoffee), "social_place");
  assert.strictEqual(eng.getLocationRole(realPark), "social_place");
  assert.strictEqual(eng.isRealSocialPlace(realCoffee), true);
  assert.strictEqual(eng.isRealSocialPlace(realPark), true);
  assert.strictEqual(eng.isRealSocialPlace(loc("cafe")), false);
});

check("generiske sosiale phaseLocations klassifiseres som social_fallback", () => {
  ["cafe", "park", "football", "culture", "gym", "store"].forEach((id) => {
    assert.strictEqual(eng.getLocationRole(loc(id)), "social_fallback", "feil rolle for " + id);
    assert.strictEqual(eng.isGenericSocialFallback(loc(id)), true);
  });
});

check("isSystemLocation er sann for hjem/jobb/NAV/psykologi, usann for sosiale", () => {
  ["home", "workplace", "nav_office", "psychology_room"].forEach((id) => {
    assert.strictEqual(eng.isSystemLocation(loc(id)), true, id + " skal være systemnode");
  });
  assert.strictEqual(eng.isSystemLocation(loc("cafe")), false);
  assert.strictEqual(eng.isSystemLocation(realCoffee), false);
  assert.strictEqual(eng.isSystemLocation(loc("friend_home_demo_01")), false);
});

check("getGenericSocialPlaceType mapper generiske noder til ekte socialPlaceType", () => {
  assert.strictEqual(eng.getGenericSocialPlaceType(loc("cafe")), "coffee");
  assert.strictEqual(eng.getGenericSocialPlaceType(loc("park")), "park_public_space");
  assert.strictEqual(eng.getGenericSocialPlaceType(loc("football")), "sport_football");
  assert.strictEqual(eng.getGenericSocialPlaceType(loc("home")), null);
});

console.log("Render-regler (Del B)");

check("systemnoder, venners hjem og ekte sosiale steder rendres alltid", () => {
  const ctx = { locations: locations.concat([realCoffee, realPark]) };
  ["home", "workplace", "nav_office", "psychology_room", "friend_home_demo_01"].forEach((id) => {
    assert.strictEqual(eng.shouldRenderLocationOnCityMap(loc(id), ctx), true, id + " skal rendres");
  });
  assert.strictEqual(eng.shouldRenderLocationOnCityMap(realCoffee, ctx), true);
  assert.strictEqual(eng.shouldRenderLocationOnCityMap(realPark, ctx), true);
});

check("generisk fallback skjules når ekte steder av samme type finnes", () => {
  const ctx = { locations: locations.concat([realCoffee, realPark]) };
  // coffee/park har ekte steder -> generisk Kafé/Park skjules.
  assert.strictEqual(eng.shouldRenderLocationOnCityMap(loc("cafe"), ctx), false);
  assert.strictEqual(eng.shouldRenderLocationOnCityMap(loc("park"), ctx), false);
  // football/culture/store har ingen ekte steder -> beholdes som fallback.
  assert.strictEqual(eng.shouldRenderLocationOnCityMap(loc("football"), ctx), true);
  assert.strictEqual(eng.shouldRenderLocationOnCityMap(loc("culture"), ctx), true);
});

check("generisk fallback beholdes når ingen ekte steder finnes", () => {
  const ctx = { locations: locations.slice() }; // ingen ekte sosiale steder
  ["cafe", "park", "football", "culture"].forEach((id) => {
    assert.strictEqual(eng.shouldRenderLocationOnCityMap(loc(id), ctx), true, id + " skal beholdes");
  });
});

check("realSocialPlaceTypes kan gis eksplisitt (Set/Array)", () => {
  assert.strictEqual(
    eng.shouldRenderLocationOnCityMap(loc("cafe"), { realSocialPlaceTypes: ["coffee"] }), false);
  assert.strictEqual(
    eng.shouldRenderLocationOnCityMap(loc("cafe"), { realSocialPlaceTypes: new Set(["culture"]) }), true);
});

check("mergeSocialPlacesIntoLocations slår sammen uten duplikater", () => {
  const merged = eng.mergeSocialPlacesIntoLocations(locations, [realCoffee, realPark, realCoffee]);
  assert.strictEqual(merged.length, locations.length + 2);
  assert.ok(merged.some((l) => l.id === realCoffee.id));
  assert.ok(merged.some((l) => l.id === realPark.id));
});

console.log("Henvend deg fra vennens profilkort (Del D)");

check("approach er en routbar handling og bygger en henvendelsesmodell", () => {
  assert.strictEqual(eng.isRoutableFriendAction("approach"), true);
  // Mariams fritids-snapshot peker til park (konkret locationId).
  const res = eng.handleFriendAction("approach", "friend_demo_01", { phase: "leisure", ...opts });
  assert.strictEqual(res.ok, true);
  const m = res.model;
  assert.strictEqual(m.action, "approach");
  assert.strictEqual(m.intent, "approach");
  assert.strictEqual(m.friendId, "friend_demo_01");
  assert.strictEqual(m.phase, "leisure");
  assert.strictEqual(m.locationId, "park");
  assert.strictEqual(m.label, "Henvend deg");
  assert.deepStrictEqual(m.responseOptions, ["reply", "ignore", "decline"]);
});

check("approach lager personlig henvendelse via broen (privat, aldri jobb)", () => {
  const res = eng.handleFriendAction("approach", "friend_demo_01", { phase: "leisure", ...opts });
  const bridged = bridge.handleCivicationFriendMessageAction(res);
  assert.strictEqual(bridged.ok, true);
  assert.strictEqual(bridged.channel, "private");
  assert.strictEqual(bridged.actionId, "approach");
  const ev = sentMails[0];
  assert.strictEqual(ev.channel, "private");
  assert.strictEqual(ev.mail_class, "private_message");
  assert.strictEqual(ev.source, "civication_social_encounter");
  assert.strictEqual(channels.isJobMail(ev), false);
  assert.strictEqual(channels.isPrivateMessage(ev), true);
});

check("approach uten konkret sted blir en generell personlig henvendelse", () => {
  // Venn uten snapshot/presence og uten hjem -> ingen locationId.
  const ghost = { id: "ghost_77", name: "Nora Vik", role: "Nabo", relationshipLevel: 0, avatar: {}, presenceByPhase: {} };
  const res = eng.handleFriendAction("approach", "ghost_77", {
    phase: "leisure", friends: [ghost], snapshots, locations, dayIndex: 1
  });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.model.locationId, null);
  const bridged = bridge.handleCivicationFriendMessageAction(res);
  assert.strictEqual(bridged.ok, true);
  assert.strictEqual(bridged.channel, "private");
});

check("approach-modellen får aldri job/work/career-felter", () => {
  const res = eng.handleFriendAction("approach", "friend_demo_01", { phase: "leisure", ...opts });
  const banned = ["career_id", "role_key", "role_id", "brand_name", "task_domain"];
  banned.forEach((k) => assert.strictEqual(res.model[k], undefined, "forbudt felt: " + k));
  assert.strictEqual(channels.isJobMail(bridge.toMailEvent(res.model)), false);
});

check("FRIEND_ACTIONS er uendret (visit beholdt internt for bakoverkompat)", () => {
  assert.deepStrictEqual(eng.FRIEND_ACTIONS, ["message", "visit", "invite", "profile"]);
  assert.ok(eng.ROUTABLE_FRIEND_ACTIONS.includes("approach"), "approach skal være routbar");
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
