#!/usr/bin/env node
// tests/civication-friend-detail-card.test.js
//
// Validerer vennens profilkort på Civication-kartet (CivicationCityLayer):
//   - kortet bygges som ren HTML-streng via buildFriendDetailHtml(row, model),
//     uten DOM/fetch, slik at det er deterministisk og testbart headless.
//   - kortet bruker vennens fase-minne (snapshot) for den aktive fasen,
//     faller trygt tilbake til presence, og viser en trygg tom-tilstand når
//     det ikke finnes fasehistorikk.
//   - handlingene rendres med stabile data-attributter/event hooks.
//   - disclosure-teksten sier tydelig at dette IKKE er live-posisjon.
//
// Kjør:  node tests/civication-friend-detail-card.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

// Last motoren + kartlaget headless. Laget bruker window/document/rAF ved
// innlasting; vi stubber det minimale slik at ingen render kjøres (host = null).
function loadModules() {
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

  const layerCode = fs.readFileSync(
    path.join(repoRoot, "js/Civication/ui/CivicationCityLayer.js"),
    "utf8"
  );
  vm.runInThisContext(layerCode, { filename: "CivicationCityLayer.js" });

  assert.ok(sandboxWindow.CivicationFriendsEngine, "CivicationFriendsEngine skal eksporteres");
  assert.ok(sandboxWindow.CivicationCityLayer, "CivicationCityLayer skal eksporteres");
  assert.ok(
    typeof sandboxWindow.CivicationCityLayer.buildFriendDetailHtml === "function",
    "buildFriendDetailHtml skal være eksportert"
  );
  return { eng: sandboxWindow.CivicationFriendsEngine, layer: sandboxWindow.CivicationCityLayer };
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

const { eng, layer } = loadModules();

function buildCard(friend, phase) {
  const presence = eng.resolveFriendMapPresence(friend, phase, snapshots, 1);
  const model = {
    locations,
    snapshotPhase: eng.normalizeSnapshotPhase(phase),
    snapshotPhaseLabel: eng.getPhaseLabel(phase)
  };
  return layer.buildFriendDetailHtml({ friend, presence }, model);
}

const mariam = friends.find((f) => f.id === "friend_demo_01");
const jonas = friends.find((f) => f.id === "friend_demo_02");

console.log("Vennens profilkort – struktur og innhold");

check("kortet har de fem seksjonene (header/livstegn/figur/relasjon/handlinger)", () => {
  const html = buildCard(mariam, "morning");
  assert.ok(html.includes("Mariam Holt"), "navn mangler");
  assert.ok(html.includes("Barista"), "rolle mangler");
  assert.ok(html.includes("Livstegn"), "Livstegn-seksjon mangler");
  assert.ok(html.includes("Figur"), "Figur-seksjon mangler");
  assert.ok(html.includes("Relasjon"), "Relasjon-seksjon mangler");
  assert.ok(html.includes("civi-city-detail-actions"), "handlinger mangler");
});

check("kortet bruker snapshot for den aktive fasen", () => {
  // Mariams fritids-snapshot: park + 'tar en gåtur i parken etter vakt' + avslappet.
  const html = buildCard(mariam, "leisure");
  assert.ok(html.includes("Park"), "skal vise snapshot-stedet (Park)");
  assert.ok(html.includes("tar en gåtur i parken etter vakt"), "skal vise snapshot-aktiviteten");
  assert.ok(html.includes("avslappet"), "skal vise snapshot-stemningen");
  assert.ok(html.includes("Siste fritidsfase"), "skal vise siste-fase-status");
});

check("figur-seksjonen viser klær/stil, transport og hjem", () => {
  const html = buildCard(mariam, "morning");
  assert.ok(html.includes("arbeidsforkle"), "klær mangler");
  assert.ok(html.includes("Sykkel"), "transport mangler");
  assert.ok(html.includes("Mariams hjem"), "hjem mangler");
});

check("relasjon viser nivå + label + sosial blurb", () => {
  const html = buildCard(mariam, "morning"); // relationshipLevel 2
  assert.ok(html.includes("Nivå 2 · venn"), "relasjonsnivå/label mangler");
  assert.ok(html.includes("Dere har begynt å bygge en relasjon."), "sosial blurb mangler");
});

check("disclosure sier tydelig at dette IKKE er live-posisjon", () => {
  const html = buildCard(mariam, "morning");
  assert.ok(/ikke live-posisjon/i.test(html), "disclosure må avkrefte live-posisjon");
  assert.ok(/simulert fasehistorikk/i.test(html), "disclosure må kalle det simulert fasehistorikk");
});

check("fallback til presence vises trygt når snapshot mangler", () => {
  // Jonas har ingen leisure-snapshot -> faller tilbake til afternoon-presence.
  const html = buildCard(jonas, "leisure");
  assert.ok(html.includes("Arbeidsplass"), "fallback-sted (Arbeidsplass) mangler");
  assert.ok(html.includes("rydder etter dagens leveranser"), "fallback-aktivitet mangler");
  assert.ok(/ikke live-posisjon/i.test(html), "disclosure skal også vises ved fallback");
});

check("tom-tilstand vises trygt når det ikke finnes fasehistorikk", () => {
  const ghost = { id: "ghost_01", name: "Nora Vik", role: "Nabo", relationshipLevel: 0, avatar: { homeId: "home" }, presenceByPhase: {} };
  const html = buildCard(ghost, "leisure");
  assert.ok(html.includes("Ingen fasehistorikk ennå for denne fasen."), "header-tom-tilstand mangler");
  assert.ok(html.includes("har ikke lagret denne fasen ennå"), "livstegn-tom-tilstand mangler");
  // Handlinger skal fortsatt rendres.
  assert.ok(html.includes('data-civi-friend-action="message"'), "handlinger skal rendres selv uten historikk");
});

console.log("Vennens profilkort – handlinger (event hooks)");

check("alle fire handlinger rendres med stabile data-attributter", () => {
  const html = buildCard(mariam, "morning");
  ["message", "visit", "invite", "profile"].forEach((action) => {
    assert.ok(
      html.includes('data-civi-friend-action="' + action + '"'),
      "handling mangler: " + action
    );
  });
  // Hver handling bærer venn-id, navn og fase som hook-kontekst.
  assert.ok(html.includes('data-friend-id="friend_demo_01"'), "data-friend-id mangler");
  assert.ok(html.includes('data-friend-name="Mariam Holt"'), "data-friend-name mangler");
  assert.ok(html.includes('data-friend-phase="morning"'), "data-friend-phase mangler");
  // 'Se profil' navigerer til folk-seksjonen.
  assert.ok(
    html.includes('data-civi-goto-section="civiPeopleSection"'),
    "Se profil skal navigere til civiPeopleSection"
  );
});

check("buildFriendDetailHtml er deterministisk (samme input -> samme output)", () => {
  assert.strictEqual(buildCard(mariam, "evening"), buildCard(mariam, "evening"));
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
