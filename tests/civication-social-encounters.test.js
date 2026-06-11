#!/usr/bin/env node
// tests/civication-social-encounters.test.js
//
// Validerer stedsbaserte sosiale møter i Civication: spillere kan møte
// hverandre asynkront ved at de etterlater sitt SISTE FASEVALG på samme sted i
// samme fase. Dette er IKKE live multiplayer, IKKE GPS, IKKE fysisk posisjon –
// kun deterministisk, asynkron sosial tilstedeværelse.
//
// Bekrefter:
//   - social availability normaliseres + får norske labels (Mål 1/7)
//   - getSocialEncountersForLocation finner venner med samme phase + locationId
//   - venner med annen phase / annet locationId vises ikke
//   - busy/private/hidden vises ikke som møtepersoner
//   - manglende snapshot (kun presence-fallback) vises aldri som møte
//   - buildSocialEncounterModel/canApproachFriendAtLocation er deterministiske
//   - "Henvend deg" (approach) lager en PERSONLIG melding (privat kanal)
//   - henvendelsen får actionId "approach", aldri job/work-channel
//   - responseOptions inneholder reply/ignore/decline (Mål 5)
//   - spillerens valg av sosialt sted lagrer player-snapshot med riktig
//     locationId + socialAvailability (Mål 6)
//   - stedskortets møte-seksjon (buildPlaceEncountersHtml) rendres stabilt (Mål 3)
//
// Kjør:  node tests/civication-social-encounters.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

// Headless oppsett. Vi fanger mail-engine-kall slik at vi kan bekrefte at en
// henvendelse havner under PERSONLIGE meldinger (privat kanal), aldri jobbmail.
const sentMails = [];

const sandboxWindow = {
  addEventListener() {},
  CustomEvent: function (type, init) {
    this.type = type;
    this.detail = init && init.detail;
  },
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
loadScript("js/Civication/ui/CivicationCityLayer.js");

const channels = sandboxWindow.CivicationEventChannels;
const eng = sandboxWindow.CivicationFriendsEngine;
const bridge = sandboxWindow.CivicationFriendMessages;
const layer = sandboxWindow.CivicationCityLayer;

assert.ok(channels, "CivicationEventChannels skal være lastet");
assert.ok(eng, "CivicationFriendsEngine skal være lastet");
assert.ok(bridge, "CivicationFriendMessages skal være lastet");
assert.ok(layer, "CivicationCityLayer skal være lastet");

const locations = readJSON("data/Civication/map/phaseLocations.json").phaseLocations;
const friends = readJSON("data/Civication/map/friends.json").friends;
const snapshots = readJSON("data/Civication/map/friendPhaseSnapshots.json").friendPhaseSnapshots;
const opts = { friends, snapshots, locations, dayIndex: 1 };

let failures = 0;
function check(name, fn) {
  sentMails.length = 0;
  try {
    fn();
    console.log("  ok  -", name);
  } catch (e) {
    failures += 1;
    console.error("FAIL  -", name);
    console.error("       ", e && e.message);
  }
}

console.log("Sosial tilgjengelighet – normalisering og labels (Mål 1/7)");

check("social availability normaliseres til de fire gyldige verdiene", () => {
  assert.deepStrictEqual(eng.SOCIAL_AVAILABILITY_VALUES, ["open_to_contact", "busy", "private", "hidden"]);
  assert.strictEqual(eng.normalizeSocialAvailability("open_to_contact"), "open_to_contact");
  assert.strictEqual(eng.normalizeSocialAvailability("BUSY"), "busy");
  assert.strictEqual(eng.normalizeSocialAvailability("tull", "private"), "private");
  assert.strictEqual(eng.normalizeSocialAvailability(""), "open_to_contact");
});

check("getSocialAvailabilityLabel gir norske labels", () => {
  assert.strictEqual(eng.getSocialAvailabilityLabel("open_to_contact"), "åpen for kontakt");
  assert.strictEqual(eng.getSocialAvailabilityLabel("busy"), "opptatt");
  assert.strictEqual(eng.getSocialAvailabilityLabel("private"), "privat");
  assert.strictEqual(eng.getSocialAvailabilityLabel("hidden"), "skjult");
});

check("getResponseOptionLabel gir norske svartekster + Henvend deg", () => {
  assert.strictEqual(eng.getResponseOptionLabel("approach"), "Henvend deg");
  assert.strictEqual(eng.getResponseOptionLabel("reply"), "Svar");
  assert.strictEqual(eng.getResponseOptionLabel("ignore"), "Ignorer");
  assert.strictEqual(eng.getResponseOptionLabel("decline"), "Avvis");
  assert.strictEqual(eng.getResponseOptionLabel("nope"), "");
});

check("isOpenToContact leser presence/verdi trygt", () => {
  assert.strictEqual(eng.isOpenToContact({ socialAvailability: "open_to_contact" }), true);
  assert.strictEqual(eng.isOpenToContact({ socialAvailability: "busy" }), false);
  assert.strictEqual(eng.isOpenToContact("open_to_contact"), true);
  assert.strictEqual(eng.isOpenToContact(null), false);
});

console.log("Finn folk på samme sted i samme fase (Mål 2)");

check("getSocialEncountersForLocation finner venn med samme phase + locationId", () => {
  // Mariam (Barista) har leisure-snapshot på park, open_to_contact.
  const enc = eng.getSocialEncountersForLocation("leisure", "park", opts);
  assert.strictEqual(enc.length, 1);
  assert.strictEqual(enc[0].friendId, "friend_demo_01");
  assert.strictEqual(enc[0].friendName, "Mariam Holt");
  assert.strictEqual(enc[0].locationId, "park");
  assert.strictEqual(enc[0].phase, "leisure");
  assert.strictEqual(enc[0].socialAvailability, "open_to_contact");
  assert.strictEqual(enc[0].action, "approach");
  assert.strictEqual(enc[0].actionLabel, "Henvend deg");
  assert.deepStrictEqual(enc[0].responseOptions, ["reply", "ignore", "decline"]);
});

check("venner med ANNEN phase vises ikke på stedet", () => {
  // I morgenfasen er ingen venn på park.
  assert.strictEqual(eng.getSocialEncountersForLocation("morning", "park", opts).length, 0);
});

check("venner med ANNET locationId vises ikke", () => {
  // I fritidsfasen er Sara på football, ikke park; cafe er tomt i leisure.
  const park = eng.getSocialEncountersForLocation("leisure", "park", opts).map((e) => e.friendId);
  assert.ok(!park.includes("friend_demo_03"), "Sara (football) skal ikke vises på park");
  assert.strictEqual(eng.getSocialEncountersForLocation("leisure", "cafe", opts).length, 0);
});

check("busy/private/hidden vises ikke som møtepersoner", () => {
  // Jonas er busy på workplace i work-fasen.
  assert.strictEqual(eng.getSocialEncountersForLocation("work", "workplace", opts).length, 0);
  // Oda er private på friend_home_demo_01 i leisure.
  const home = eng.getSocialEncountersForLocation("leisure", "friend_home_demo_01", opts);
  assert.ok(!home.some((e) => e.friendId === "friend_demo_04"), "private skal ikke vises");
  // Sara er private i Psykologirommet (reflection).
  assert.strictEqual(eng.getSocialEncountersForLocation("reflection", "psychology_room", opts).length, 0);
});

check("eksplisitt blanding på samme sted: kun open_to_contact vises", () => {
  // To venner med ekte leisure-snapshot på cafe, men ulik tilgjengelighet.
  const localFriends = [
    { id: "f_open", name: "Åpen Person", role: "Barista" },
    { id: "f_busy", name: "Opptatt Person", role: "Servitør" }
  ];
  const localSnaps = [
    { friendId: "f_open", snapshots: { leisure: {
      phase: "leisure", state: "at_cafe", locationId: "cafe", activity: "drar på kafé",
      mood: "rolig", visibleOnMap: true, socialAvailability: "open_to_contact" } } },
    { friendId: "f_busy", snapshots: { leisure: {
      phase: "leisure", state: "at_cafe", locationId: "cafe", activity: "har lukketid",
      mood: "stresset", visibleOnMap: true, socialAvailability: "busy" } } }
  ];
  const enc = eng.getSocialEncountersForLocation("leisure", "cafe", {
    friends: localFriends, snapshots: localSnaps, locations, dayIndex: 1
  });
  assert.strictEqual(enc.length, 1);
  assert.strictEqual(enc[0].friendId, "f_open");
  assert.strictEqual(enc[0].locationLabel, "Kafé");
});

check("manglende snapshot: kun presence-fallback vises ALDRI som møte", () => {
  // Jonas har ingen leisure-snapshot -> faller tilbake til afternoon-presence
  // (workplace). Den skal ikke telle som sosialt møte på workplace.
  const enc = eng.getSocialEncountersForLocation("leisure", "workplace", opts);
  assert.ok(!enc.some((e) => e.friendId === "friend_demo_02"), "fallback skal ikke vises som møte");
});

check("venn helt uten snapshot/presence håndteres trygt (ingen kast, ikke vist)", () => {
  const ghost = {
    id: "ghost_99", name: "Nora Vik", role: "Nabo", relationshipLevel: 0,
    avatar: { homeId: "friend_home_demo_03" }, presenceByPhase: {}
  };
  const enc = eng.getSocialEncountersForLocation("leisure", "friend_home_demo_03", {
    friends: [ghost], snapshots, locations, dayIndex: 1
  });
  assert.strictEqual(enc.length, 0);
});

check("canApproachFriendAtLocation er presist pr. venn/sted/fase", () => {
  assert.strictEqual(eng.canApproachFriendAtLocation("friend_demo_01", "leisure", "park", opts), true);
  assert.strictEqual(eng.canApproachFriendAtLocation("friend_demo_01", "morning", "park", opts), false);
  assert.strictEqual(eng.canApproachFriendAtLocation("friend_demo_02", "work", "workplace", opts), false);
  assert.strictEqual(eng.canApproachFriendAtLocation("", "leisure", "park", opts), false);
});

check("buildSocialEncounterModel + getSocialEncountersForLocation er deterministisk", () => {
  const a = eng.getSocialEncountersForLocation("leisure", "football", opts);
  const b = eng.getSocialEncountersForLocation("leisure", "football", opts);
  assert.deepStrictEqual(a, b);
  assert.strictEqual(a[0].friendId, "friend_demo_03");
  assert.ok(/Sara/.test(a[0].encounterText), "møte-tekst skal nevne personen");
});

console.log("Henvend deg lager personlig melding (Mål 4/5)");

check("approach lager personlig melding med actionId approach (privat, ikke jobb)", () => {
  const enc = eng.getSocialEncountersForLocation("leisure", "park", opts)[0];
  const bridged = bridge.handleCivicationFriendMessageAction({ ok: true, action: "approach", model: enc });
  assert.strictEqual(bridged.ok, true);
  assert.strictEqual(bridged.channel, "private");
  const m = bridged.message;
  assert.strictEqual(m.type, "private");
  assert.strictEqual(m.channel, "private");
  assert.strictEqual(m.source, "civication_social_encounter");
  assert.strictEqual(m.actionId, "approach");
  assert.strictEqual(m.friendId, "friend_demo_01");
  assert.strictEqual(m.phase, "leisure");
  assert.strictEqual(m.locationId, "park");
  assert.strictEqual(m.threadId, "friend_friend_demo_01");
  assert.strictEqual(m.status, "pending_response");
  assert.ok(/Henvendelse til Mariam/.test(m.title), "tittel skal være en henvendelse");
  assert.ok(/henvender deg til Mariam/.test(m.body), "tekst skal nevne henvendelsen");
  assert.ok(/fritidsfasen/.test(m.body), "tekst skal nevne aktiv fase");
  // Aldri jobb-/karrierefelt på en henvendelse.
  assert.strictEqual(m.career_id, undefined);
  assert.strictEqual(m.role_key, undefined);
  assert.strictEqual(m.brand_id, undefined);
});

check("henvendelsen havner under PERSONLIGE meldinger, aldri jobbmail", () => {
  const enc = eng.getSocialEncountersForLocation("leisure", "park", opts)[0];
  bridge.handleCivicationFriendMessageAction({ ok: true, action: "approach", model: enc });
  assert.strictEqual(sentMails.length, 1, "skal registreres i innkommende");
  const ev = sentMails[0];
  assert.strictEqual(ev.channel, "private");
  assert.strictEqual(ev.mail_class, "private_message");
  assert.strictEqual(ev.source, "civication_social_encounter");
  assert.strictEqual(channels.getMessageChannel(ev), "private");
  assert.strictEqual(channels.isJobMail(ev), false);
  assert.strictEqual(channels.isPrivateMessage(ev), true);
});

check("responseOptions inneholder reply/ignore/decline + responseModel labels", () => {
  const enc = eng.getSocialEncountersForLocation("leisure", "park", opts)[0];
  const bridged = bridge.handleCivicationFriendMessageAction({ ok: true, action: "approach", model: enc });
  assert.deepStrictEqual(bridged.message.responseOptions, ["reply", "ignore", "decline"]);
  assert.deepStrictEqual(sentMails[0].responseOptions, ["reply", "ignore", "decline"]);
  const rm = bridged.responseModel;
  assert.strictEqual(rm.status, "pending_response");
  assert.deepStrictEqual(rm.options, [
    { id: "reply", label: "Svar" },
    { id: "ignore", label: "Ignorer" },
    { id: "decline", label: "Avvis" }
  ]);
});

check("feedback-tekst for henvendelse matcher UI-kravet", () => {
  const enc = eng.getSocialEncountersForLocation("leisure", "park", opts)[0];
  const bridged = bridge.handleCivicationFriendMessageAction({ ok: true, action: "approach", model: enc });
  assert.strictEqual(bridged.feedbackText, "Du henvender deg til Mariam på Park i fritidsfasen. Henvendelsen er lagt i Personlige meldinger.");
});

check("createApproachMessageFromEncounter kan ta en rå møte-modell direkte", () => {
  const enc = eng.getSocialEncountersForLocation("leisure", "football", opts)[0];
  const msg = bridge.createApproachMessageFromEncounter(enc);
  assert.strictEqual(msg.actionId, "approach");
  assert.strictEqual(msg.friendId, "friend_demo_03");
  assert.strictEqual(msg.status, "pending_response");
  assert.deepStrictEqual(msg.responseOptions, ["reply", "ignore", "decline"]);
});

const concreteSocialPlaces = [
  { id: "brand_place:plassen_a:fuglen", locationId: "brand_place:plassen_a:fuglen", sourcePlaceId: "plassen_a", brandId: "fuglen", socialPlaceType: "coffee", label: "Fuglen", placeLabel: "Universitetsplassen", type: "cafe", channel: "social", phaseAffinity: ["leisure", "evening"], activePhases: ["lunch", "afternoon", "evening"] },
  { id: "brand_place:plassen_b:java", locationId: "brand_place:plassen_b:java", sourcePlaceId: "plassen_b", brandId: "java", socialPlaceType: "coffee", label: "Java Kaffebar", placeLabel: "St. Hanshaugen park", type: "cafe", channel: "social", phaseAffinity: ["leisure", "evening"], activePhases: ["lunch", "afternoon", "evening"] }
];
const concreteLocations = eng.mergeSocialPlacesIntoLocations(locations, concreteSocialPlaces);

check("player på konkret sted ser venner med samme resolved concrete locationId", () => {
  const friend = { id: "friend_concrete", name: "Konkret Kari", role: "Barista" };
  const localSnaps = [{ friendId: "friend_concrete", snapshots: { leisure: {
    phase: "leisure", state: "at_cafe", locationId: "cafe", activity: "tar kaffe",
    mood: "åpen", visibleOnMap: true, socialAvailability: "open_to_contact" } } }];
  const enc = eng.getSocialEncountersForLocation("leisure", "brand_place:plassen_a:fuglen", {
    friends: [friend], snapshots: localSnaps, locations: concreteLocations, socialPlaces: concreteSocialPlaces, dayIndex: 1
  });
  assert.strictEqual(enc.length, 1);
  assert.strictEqual(enc[0].locationId, "brand_place:plassen_a:fuglen");
  assert.strictEqual(enc[0].sourcePlaceId, "plassen_a");
  assert.strictEqual(enc[0].brandId, "fuglen");
  assert.strictEqual(enc[0].socialPlaceType, "coffee");
});

check("same phase + same socialPlaceType men ulik concrete locationId gir ikke møte", () => {
  const friend = { id: "friend_java", name: "Java Jens", role: "Student" };
  const localSnaps = [{ friendId: "friend_java", snapshots: { leisure: {
    phase: "leisure", state: "at_cafe", locationId: "brand_place:plassen_b:java", activity: "tar kaffe",
    mood: "åpen", visibleOnMap: true, socialAvailability: "open_to_contact" } } }];
  const fuglen = eng.getSocialEncountersForLocation("leisure", "brand_place:plassen_a:fuglen", {
    friends: [friend], snapshots: localSnaps, locations: concreteLocations, socialPlaces: concreteSocialPlaces, dayIndex: 1
  });
  assert.strictEqual(fuglen.length, 0, "coffee på Java skal ikke møtes på Fuglen");
});

check("Henvend deg og private messages bruker concrete locationId og stedskontekst", () => {
  const friend = { id: "friend_concrete", name: "Konkret Kari", role: "Barista" };
  const localSnaps = [{ friendId: "friend_concrete", snapshots: { leisure: {
    phase: "leisure", state: "at_cafe", locationId: "brand_place:plassen_a:fuglen", activity: "tar kaffe",
    mood: "åpen", visibleOnMap: true, socialAvailability: "open_to_contact" } } }];
  const enc = eng.getSocialEncountersForLocation("leisure", "brand_place:plassen_a:fuglen", {
    friends: [friend], snapshots: localSnaps, locations: concreteLocations, socialPlaces: concreteSocialPlaces, dayIndex: 1
  })[0];
  const bridged = bridge.handleCivicationFriendMessageAction({ ok: true, action: "approach", model: enc });
  assert.strictEqual(bridged.message.channel, "private");
  assert.strictEqual(bridged.message.locationId, "brand_place:plassen_a:fuglen");
  assert.strictEqual(bridged.message.sourcePlaceId, "plassen_a");
  assert.strictEqual(bridged.message.brandId, "fuglen");
  assert.strictEqual(bridged.message.socialPlaceType, "coffee");
  assert.strictEqual(bridged.message.career_id, undefined);
  assert.strictEqual(bridged.message.role_key, undefined);
});

console.log("Spillerens valg av sosialt sted lagrer snapshot (Mål 6)");

check("kafé i fritidsfasen lagrer riktig locationId + socialAvailability", () => {
  eng.clearPlayerPhaseSnapshotsForTesting();
  const cafe = locations.find((l) => l.id === "cafe");
  const snap = eng.capturePlayerPhaseSnapshotAtLocation(cafe, "leisure");
  assert.strictEqual(snap.phase, "leisure");
  assert.strictEqual(snap.locationId, "cafe");
  assert.strictEqual(snap.state, "at_cafe");
  assert.strictEqual(snap.activity, "drar på kafé");
  assert.strictEqual(snap.socialAvailability, "open_to_contact");
  assert.strictEqual(snap.visibleOnMap, true);
  // Lagret pr. fase.
  assert.strictEqual(eng.getPlayerSnapshotForPhase("leisure").locationId, "cafe");
});

check("buildPlayerSnapshotForLocation utleder profil pr. sted (deterministisk)", () => {
  const park = eng.buildPlayerSnapshotForLocation("leisure", locations.find((l) => l.id === "park"));
  assert.strictEqual(park.activity, "setter seg i parken");
  assert.strictEqual(park.socialAvailability, "open_to_contact");
  const football = eng.buildPlayerSnapshotForLocation("leisure", locations.find((l) => l.id === "football"));
  assert.strictEqual(football.activity, "drar på kamp");
  assert.strictEqual(football.socialAvailability, "open_to_contact");
  // Jobb/psykologi er ikke sosiale møtesteder.
  const work = eng.buildPlayerSnapshotForLocation("work", locations.find((l) => l.id === "workplace"));
  assert.strictEqual(work.socialAvailability, "busy");
  const psyk = eng.buildPlayerSnapshotForLocation("reflection", locations.find((l) => l.id === "psychology_room"));
  assert.strictEqual(psyk.socialAvailability, "private");
  // Samme input -> samme output.
  assert.deepStrictEqual(
    eng.buildPlayerSnapshotForLocation("leisure", locations.find((l) => l.id === "park")),
    park
  );
});

check("player-snapshot beholder friend-snapshot-formatet + ingen GPS-felt", () => {
  const snap = eng.buildPlayerSnapshotForLocation("leisure", locations.find((l) => l.id === "cafe"));
  ["phase", "state", "locationId", "activity", "mood", "updatedAtLabel", "visibleOnMap"].forEach((k) => {
    assert.ok(Object.prototype.hasOwnProperty.call(snap, k), "mangler felt " + k);
  });
  const forbidden = new Set(["lat", "lng", "latitude", "longitude", "gps", "geo", "coords", "islive", "realtime"]);
  Object.keys(snap).forEach((k) => assert.ok(!forbidden.has(k.toLowerCase()), "forbudt felt: " + k));
});

console.log("Stedskortets møte-seksjon rendres stabilt (Mål 3)");

check("buildPlaceEncountersHtml viser møtepersoner + Henvend deg-knapp", () => {
  const park = locations.find((l) => l.id === "park");
  const enc = eng.getSocialEncountersForLocation("leisure", "park", opts);
  const html = layer.buildPlaceEncountersHtml(park, "leisure", enc);
  assert.ok(/Folk som også valgte Park i siste fritidsfase/.test(html), "overskrift mangler");
  assert.ok(html.includes("Mariam Holt"), "møteperson mangler");
  assert.ok(html.includes('data-civi-social-action="approach"'), "approach-action mangler");
  assert.ok(html.includes('data-friend-id="friend_demo_01"'), "friend-id mangler");
  assert.ok(html.includes('data-location-id="park"'), "location-id mangler");
  assert.ok(html.includes('data-friend-phase="leisure"'), "phase mangler");
  assert.ok(html.includes(">Henvend deg<"), "Henvend deg-knapp mangler");
});

check("buildPlaceEncountersHtml viser trygg tom-tilstand uten åpne personer", () => {
  const workplace = locations.find((l) => l.id === "workplace");
  const html = layer.buildPlaceEncountersHtml(workplace, "work", []);
  assert.ok(/Folk som også valgte Arbeidsplass i siste arbeidsfase/.test(html), "tom-overskrift mangler");
  assert.ok(/Ingen åpne for kontakt her i siste arbeidsfase/.test(html), "tom-tilstand mangler");
  assert.ok(!html.includes("data-civi-social-action"), "ingen approach-knapp uten personer");
});

check("buildPlaceEncountersHtml er deterministisk", () => {
  const park = locations.find((l) => l.id === "park");
  const enc = eng.getSocialEncountersForLocation("leisure", "park", opts);
  assert.strictEqual(
    layer.buildPlaceEncountersHtml(park, "leisure", enc),
    layer.buildPlaceEncountersHtml(park, "leisure", enc)
  );
});

console.log("Grupperte fasevalg + valgt sted i stedskortet (Del A/B/D/F)");

// Konkrete socialPlaces (samme form som CivicationSocialPlaceResolver gir) for
// å teste gruppering, valgt-status, fallback-kategoriinngang og møtetekster.
const choiceSocialPlaces = [
  { id: "brand_place:universitetsplassen:fuglen", locationId: "brand_place:universitetsplassen:fuglen", sourcePlaceId: "universitetsplassen", brandId: "fuglen", socialPlaceType: "coffee", label: "Fuglen", placeLabel: "Universitetsplassen", type: "cafe", channel: "social", phaseAffinity: ["morning", "leisure", "evening"], activePhases: ["lunch", "afternoon", "evening"] },
  { id: "brand_place:st_hanshaugen:java", locationId: "brand_place:st_hanshaugen:java", sourcePlaceId: "st_hanshaugen", brandId: "java", socialPlaceType: "coffee", label: "Java Kaffebar", placeLabel: "St. Hanshaugen park", type: "cafe", channel: "social", phaseAffinity: ["morning", "leisure", "evening"], activePhases: ["lunch", "afternoon", "evening"] }
];
const choiceLocations = eng.mergeSocialPlacesIntoLocations(locations, choiceSocialPlaces);
const choiceContext = { locations: choiceLocations, socialPlaces: choiceSocialPlaces };

check("buildPlayerPhaseChoicesHtml grupperer konkrete steder og systemvalg", () => {
  eng.clearPlayerPhaseSnapshotsForTesting();
  const html = layer.buildPlayerPhaseChoicesHtml("leisure", 12, choiceContext);
  assert.ok(html.includes("Hvor vil du gå i denne fasen?"), "hovedoverskrift mangler");
  assert.ok(html.includes(">Konkrete steder<"), "gruppe for konkrete steder mangler");
  assert.ok(html.includes(">Systemvalg<"), "gruppe for systemvalg mangler");
  assert.ok(html.includes(">Fuglen<"), "konkret sted-label mangler");
  assert.ok(html.includes("Kaffe · Universitetsplassen"), "konkret subtitle mangler");
  assert.ok(html.includes("is-kind-social-place"), "konkret sted skal ha stedsklasse");
  assert.ok(html.includes("is-kind-system-node"), "systemvalg skal ha systemklasse");
  assert.ok(html.includes("fase-minne, ikke live-posisjon"), "fase-minne-disclosure mangler");
});

check("valgt sted får Valgt-status i valglisten (DOM-markering)", () => {
  eng.clearPlayerPhaseSnapshotsForTesting();
  const result = eng.applyPlayerPhaseChoice("go:brand_place:universitetsplassen:fuglen", { ...choiceContext, phase: "leisure" });
  assert.ok(result && result.snapshot, "valget skal lagre snapshot");
  const html = layer.buildPlayerPhaseChoicesHtml("leisure", 12, choiceContext);
  assert.ok(html.includes("is-selected-choice"), "valgt rad mangler markering");
  assert.ok(html.includes(">Valgt<"), "valgt knappetekst mangler");
  assert.ok(html.includes('aria-pressed="true"'), "aria-pressed mangler på valgt knapp");
  assert.ok(html.includes(">Gå hit<"), "andre valg skal fortsatt vise Gå hit");
  eng.clearPlayerPhaseSnapshotsForTesting();
});

check("buildChosenPlaceStatusHtml markerer valgt sted i stedskortet", () => {
  const loc = { id: "brand_place:universitetsplassen:fuglen", label: "Fuglen" };
  const html = layer.buildChosenPlaceStatusHtml(loc, "leisure", "brand_place:universitetsplassen:fuglen");
  assert.ok(html.includes("is-player-choice"), "valgt-chip mangler klasse");
  assert.ok(html.includes("Ditt valg i siste fritidsfase"), "valgt-chip mangler fasetekst");
  assert.strictEqual(layer.buildChosenPlaceStatusHtml(loc, "leisure", "park"), "", "annet valgt sted skal gi tom streng");
  assert.strictEqual(layer.buildChosenPlaceStatusHtml(loc, "leisure", ""), "", "uten valg skal gi tom streng");
});

check("kartmarkøren for spillerens fasevalg får is-player-choice", () => {
  const fuglenLoc = choiceLocations.find((l) => l.id === "brand_place:universitetsplassen:fuglen");
  const classes = layer.buildPlaceClassList(fuglenLoc, false, "brand_place:universitetsplassen:fuglen");
  assert.ok(classes.includes("is-player-choice"), "valgt markør mangler is-player-choice");
  const other = layer.buildPlaceClassList(locations.find((l) => l.id === "park"), false, "brand_place:universitetsplassen:fuglen");
  assert.ok(!other.includes("is-player-choice"), "andre markører skal ikke få is-player-choice");
});

check("fallback-noden Kafé viser konkrete steder som kategoriinngang", () => {
  const cafe = locations.find((l) => l.id === "cafe");
  const html = layer.buildFallbackSocialPlaceChoicesHtml(cafe, "leisure", choiceContext);
  assert.ok(html.includes("Velg et konkret kafésted"), "kategorioverskrift mangler");
  assert.ok(html.includes("Kategoriinngang"), "kategorihint mangler");
  assert.ok(html.includes(">Fuglen<"), "konkret sted mangler i kategoriinngangen");
  assert.ok(html.includes("Kaffe · Universitetsplassen"), "konkret subtitle mangler i kategoriinngangen");
  assert.ok(html.includes('data-civi-fallback-place="brand_place:universitetsplassen:fuglen"'), "fallback-valg-hook mangler");
});

check("fallback uten konkrete steder beholder generisk flyt (tom valg-HTML)", () => {
  const cafe = locations.find((l) => l.id === "cafe");
  assert.strictEqual(layer.buildFallbackSocialPlaceChoicesHtml(cafe, "leisure", { locations: locations }), "");
});

check("fallback-valg lagrer ikke generisk locationId når konkrete steder finnes", () => {
  eng.clearPlayerPhaseSnapshotsForTesting();
  const result = eng.applyPlayerPhaseChoice("go:cafe", { ...choiceContext, phase: "leisure" });
  assert.strictEqual(result, null, "generisk kafévalg skal ikke finnes når konkrete kaffesteder finnes");
  assert.strictEqual(eng.getPlayerSnapshotForPhase("leisure"), null, "ingen generisk snapshot skal lagres");
});

check("Henvend deg-tekst bruker konkret stednavn med riktig skrivemåte", () => {
  const text = eng.getApproachActionResultText({ name: "Mariam Holt" }, {}, "leisure", { label: "Fuglen" });
  assert.strictEqual(text, "Du henvender deg til Mariam på Fuglen i fritidsfasen.");
});

check("møteheading og tom-tekst bruker konkret stednavn også for socialPlaces", () => {
  const fuglenLoc = choiceLocations.find((l) => l.id === "brand_place:universitetsplassen:fuglen");
  const html = layer.buildPlaceEncountersHtml(fuglenLoc, "leisure", []);
  assert.ok(/Folk som også valgte Fuglen i siste fritidsfase/.test(html), "konkret møteheading mangler");
  assert.ok(/Ingen åpne for kontakt her i siste fritidsfase/.test(html), "konkret tom-tekst mangler");
});

console.log("Eksisterende action-id-er er fortsatt stabile");

check("action-id approach finnes og rendres stabilt", () => {
  assert.strictEqual(eng.SOCIAL_ENCOUNTER_ACTION, "approach");
  const enc = eng.getSocialEncountersForLocation("leisure", "park", opts)[0];
  assert.strictEqual(enc.action, "approach");
  const html = layer.buildPlaceEncountersHtml(locations.find((l) => l.id === "park"), "leisure", [enc]);
  assert.ok(html.includes('data-civi-social-action="approach"'));
});

check("vennehandlingene message/visit/invite/profile er uendret", () => {
  assert.deepStrictEqual(eng.FRIEND_ACTIONS, ["message", "visit", "invite", "profile"]);
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
