#!/usr/bin/env node
// tests/civication-friend-action-router.test.js
//
// Validerer den datadrevne action-routeren for vennedetaljens handlinger
// (CivicationFriendsEngine). Routeren kobler de fire handlingene fra vennens
// profilkort på Civication-kartet til faktisk sosial spillflyt:
//   - message  -> trygg melding-action + event-hook (civi:openPrivateMessage)
//   - visit    -> peker mot vennens siste simulerte sted (fase-minne)
//   - invite   -> fasebasert lokal invitasjon (drafted)
//   - profile  -> samlet profilmodell + siste snapshot for aktiv fase
//
// Alt er rent og deterministisk (ingen DOM/fetch/live-posisjon). Bekrefter
// også at resultattekstene IKKE antyder ekte sanntidsposisjon.
//
// Kjør:  node tests/civication-friend-action-router.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

// Last motoren headless. Den bruker window/document ved innlasting; vi stubber
// det minimale slik at ingen render/fetch kjøres.
function loadEngine() {
  const sandboxWindow = { addEventListener() {} };
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

  const engineCode = fs.readFileSync(
    path.join(repoRoot, "js/Civication/systems/civicationFriendsEngine.js"),
    "utf8"
  );
  vm.runInThisContext(engineCode, { filename: "civicationFriendsEngine.js" });
  assert.ok(sandboxWindow.CivicationFriendsEngine, "CivicationFriendsEngine skal eksporteres");
  return sandboxWindow.CivicationFriendsEngine;
}

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log("  ok  -", name);
  } catch (e) {
    failures += 1;
    console.error("FAIL  -", name);
    console.error("       ", e && e.message);
  }
}

const locations = readJSON("data/Civication/map/phaseLocations.json").phaseLocations;
const friends = readJSON("data/Civication/map/friends.json").friends;
const snapshots = readJSON("data/Civication/map/friendPhaseSnapshots.json").friendPhaseSnapshots;

const eng = loadEngine();

const opts = { friends, snapshots, locations, dayIndex: 1 };

console.log("Vennehandlinger – stabile action-id-er og labels");

check("alle fire handlinger har stabile action-id-er", () => {
  assert.deepStrictEqual(eng.FRIEND_ACTIONS, ["message", "visit", "invite", "profile"]);
  ["message", "visit", "invite", "profile"].forEach((a) => {
    assert.ok(eng.isFriendAction(a), "skal kjenne igjen action: " + a);
  });
  assert.strictEqual(eng.isFriendAction("bogus"), false);
});

check("getFriendActionLabel gir norske knappetekster", () => {
  assert.strictEqual(eng.getFriendActionLabel("message"), "Send melding");
  assert.strictEqual(eng.getFriendActionLabel("visit"), "Besøk");
  assert.strictEqual(eng.getFriendActionLabel("invite"), "Inviter");
  assert.strictEqual(eng.getFriendActionLabel("profile"), "Se profil");
  assert.strictEqual(eng.getFriendActionLabel("nope"), "");
});

check("getInviteLabelForPhase er fasebasert og forfines av stedstype", () => {
  assert.strictEqual(eng.getInviteLabelForPhase("morning"), "Inviter til kaffe");
  assert.strictEqual(eng.getInviteLabelForPhase("work"), "Inviter til pause etter jobb");
  assert.strictEqual(eng.getInviteLabelForPhase("leisure", "park"), "Inviter til park");
  assert.strictEqual(eng.getInviteLabelForPhase("leisure", "cafe"), "Inviter til kafé");
  assert.strictEqual(eng.getInviteLabelForPhase("leisure", "training"), "Inviter til trening");
  assert.strictEqual(eng.getInviteLabelForPhase("reflection", "insight"), "Inviter til Psykologirommet");
  assert.strictEqual(eng.getInviteLabelForPhase("evening"), "Inviter hjem til kvelden");
});

console.log("Vennehandlinger – routeren");

check("routeren finner riktig venn", () => {
  const res = eng.handleFriendAction("profile", "friend_demo_01", { phase: "morning", ...opts });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.friendId, "friend_demo_01");
  assert.strictEqual(res.model.name, "Mariam Holt");
});

check("ukjent venn gir trygt feilresultat (ingen kast)", () => {
  const res = eng.handleFriendAction("visit", "ingen_slik_venn", { phase: "morning", ...opts });
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.reason, "friend_not_found");
});

check("ukjent action gir trygt feilresultat", () => {
  const res = eng.handleFriendAction("teleport", "friend_demo_01", { phase: "morning", ...opts });
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.reason, "unknown_action");
});

check("routeren bruker snapshot for aktiv fase", () => {
  // Mariams fritids-snapshot peker til park.
  const res = eng.handleFriendAction("visit", "friend_demo_01", { phase: "leisure", ...opts });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.phase, "leisure");
  assert.strictEqual(res.model.locationId, "park");
  assert.strictEqual(res.model.locationLabel, "Park");
});

check("Besøk returnerer riktig locationId fra snapshot", () => {
  // Morgen-snapshot for Mariam: friend_home_demo_01.
  const res = eng.handleFriendAction("visit", "friend_demo_01", { phase: "morning", ...opts });
  assert.strictEqual(res.model.locationId, "friend_home_demo_01");
  assert.strictEqual(res.model.locationLabel, "Mariams hjem");
  assert.strictEqual(res.model.isSimulated, true);
  assert.ok(res.model.lastActivity, "skal ta med siste aktivitet fra snapshot");
});

check("Inviter lager fasebasert invitasjon med riktig form", () => {
  const res = eng.handleFriendAction("invite", "friend_demo_01", { phase: "leisure", ...opts });
  const m = res.model;
  // Form som spesifisert i oppgaven (lokal spillhandling, drafted).
  assert.strictEqual(m.friendId, "friend_demo_01");
  assert.strictEqual(m.phase, "leisure");
  assert.strictEqual(m.locationId, "park");
  assert.strictEqual(m.intent, "invite");
  assert.strictEqual(m.label, "Inviter til park");
  assert.strictEqual(m.status, "drafted");
});

check("Send melding lager trygg message-action med event-hook", () => {
  const res = eng.handleFriendAction("message", "friend_demo_01", { phase: "morning", ...opts });
  const m = res.model;
  assert.strictEqual(m.intent, "message");
  assert.strictEqual(m.status, "drafted");
  assert.strictEqual(m.event, "civi:openPrivateMessage");
  assert.strictEqual(m.friendName, "Mariam Holt");
});

check("Se profil returnerer en samlet profilmodell", () => {
  const res = eng.handleFriendAction("profile", "friend_demo_01", { phase: "leisure", ...opts });
  const m = res.model;
  assert.strictEqual(m.name, "Mariam Holt");
  assert.strictEqual(m.role, "Barista");
  assert.strictEqual(m.relationshipLevel, 2);
  assert.strictEqual(m.relationshipLabel, "venn");
  assert.ok(m.clothes.includes("arbeidsforkle"), "klær/stil mangler");
  assert.strictEqual(m.vehicle, "Sykkel");
  assert.strictEqual(m.home, "Mariams hjem");
  assert.strictEqual(m.phaseLabel, "Fritidsfase");
  // Siste snapshot for aktiv fase.
  assert.strictEqual(m.lastSnapshot.locationLabel, "Park");
  assert.ok(m.lastSnapshot.activity.includes("gåtur"), "siste snapshot-aktivitet mangler");
  assert.strictEqual(m.hasHistory, true);
  assert.ok(/ikke live-posisjon/i.test(m.disclosure), "profil-disclosure må avkrefte live-posisjon");
});

console.log("Vennehandlinger – fallback og trygghet");

check("fallback til presenceByPhase fungerer når snapshot mangler", () => {
  // Jonas har ingen leisure-snapshot -> faller tilbake til afternoon-presence
  // (workplace), ikke null.
  const res = eng.handleFriendAction("visit", "friend_demo_02", { phase: "leisure", ...opts });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.model.locationId, "workplace");
  assert.strictEqual(res.model.locationLabel, "Arbeidsplass");
});

check("fallback til hjem når verken snapshot eller presence finnes", () => {
  const ghost = {
    id: "ghost_99", name: "Nora Vik", role: "Nabo", relationshipLevel: 0,
    avatar: { homeId: "friend_home_demo_03" }, presenceByPhase: {}
  };
  const res = eng.handleFriendAction("visit", "ghost_99", {
    phase: "leisure", friends: [ghost], snapshots, locations, dayIndex: 1
  });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.model.locationId, "friend_home_demo_03", "skal falle tilbake til hjem");
});

check("action-resultater antyder ikke ekte live-posisjon", () => {
  const phases = ["morning", "work", "leisure", "evening", "reflection"];
  const banned = /(er nå|akkurat nå|live|gps|sanntid|befinner seg|posisjon nå|fysisk)/i;
  friends.forEach((f) => {
    phases.forEach((ph) => {
      eng.FRIEND_ACTIONS.forEach((action) => {
        const res = eng.handleFriendAction(action, f.id, { phase: ph, ...opts });
        if (res.ok && res.model && res.model.resultText) {
          assert.ok(
            !banned.test(res.model.resultText),
            `resultattekst antyder live-posisjon: "${res.model.resultText}"`
          );
        }
      });
    });
  });
  // Besøkstekst skal eksplisitt være formulert som "siste ...sted".
  const visit = eng.handleFriendAction("visit", "friend_demo_01", { phase: "morning", ...opts });
  assert.ok(/siste morgensted/i.test(visit.model.resultText), "besøkstekst skal si 'siste morgensted'");
});

check("resultattekster matcher forventet sosial form", () => {
  const msg = eng.handleFriendAction("message", "friend_demo_01", { phase: "morning", ...opts });
  assert.strictEqual(msg.model.resultText, "Melding til Mariam er klar.");
  const inv = eng.handleFriendAction("invite", "friend_demo_01", { phase: "leisure", ...opts });
  assert.strictEqual(inv.model.resultText, "Invitasjon til Mariam er laget for fritidsfase.");
  const prof = eng.handleFriendAction("profile", "friend_demo_01", { phase: "morning", ...opts });
  assert.strictEqual(prof.model.resultText, "Viser profil for Mariam.");
});

check("routeren er deterministisk (samme input -> samme modell)", () => {
  const a = eng.handleFriendAction("visit", "friend_demo_01", { phase: "evening", ...opts });
  const b = eng.handleFriendAction("visit", "friend_demo_01", { phase: "evening", ...opts });
  assert.deepStrictEqual(a, b);
});

check("resolveFriendActionContext resolver venn, snapshot, fase og målsted", () => {
  const ctx = eng.resolveFriendActionContext("friend_demo_01", "leisure", opts);
  assert.strictEqual(ctx.found, true);
  assert.strictEqual(ctx.phase, "leisure");
  assert.strictEqual(ctx.friend.id, "friend_demo_01");
  assert.strictEqual(ctx.snapshot.locationId, "park");
  assert.strictEqual(ctx.target.locationId, "park");
  assert.strictEqual(ctx.target.type, "park");
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
