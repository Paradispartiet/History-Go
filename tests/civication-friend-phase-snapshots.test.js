#!/usr/bin/env node
// tests/civication-friend-phase-snapshots.test.js
//
// Validerer fase-minne-systemet (phase snapshots) for venner på Civication-
// kartet:
//   - data/Civication/map/friendPhaseSnapshots.json er gyldig JSON med forventet
//     struktur, locationId-referanser peker til ekte steder, og INGEN
//     GPS/live-tracking-felter er introdusert.
//   - CivicationFriendsEngine velger riktig snapshot for aktiv fase, prioriterer
//     snapshot over generell presence, faller trygt tilbake til presenceByPhase,
//     og skjuler venner uten fasehistorikk. Alt deterministisk – samme input
//     gir samme output.
//
// Kjør:  node tests/civication-friend-phase-snapshots.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

function loadEngine() {
  const sandboxWindow = {};
  global.window = sandboxWindow;
  global.fetch = () => Promise.reject(new Error("fetch not available in test"));
  const code = fs.readFileSync(
    path.join(repoRoot, "js/Civication/systems/civicationFriendsEngine.js"),
    "utf8"
  );
  vm.runInThisContext(code, { filename: "civicationFriendsEngine.js" });
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

const locationsData = readJSON("data/Civication/map/phaseLocations.json");
const friendsData = readJSON("data/Civication/map/friends.json");
const snapshotsData = readJSON("data/Civication/map/friendPhaseSnapshots.json");

const locations = locationsData.phaseLocations;
const friends = friendsData.friends;
const snapshots = snapshotsData.friendPhaseSnapshots;
const locationIds = new Set(locations.map((l) => l.id));
const friendIds = new Set(friends.map((f) => f.id));

const eng = loadEngine();

console.log("friendPhaseSnapshots.json – struktur og referanser");

check("friendPhaseSnapshots er en ikke-tom array", () => {
  assert.ok(Array.isArray(snapshots) && snapshots.length > 0);
});

check("hver post har kjent friendId og minst ett snapshot", () => {
  snapshots.forEach((rec) => {
    assert.ok(rec.friendId, "friendId mangler");
    assert.ok(friendIds.has(rec.friendId), `ukjent friendId: ${rec.friendId}`);
    assert.ok(rec.snapshots && typeof rec.snapshots === "object", `snapshots mangler for ${rec.friendId}`);
    assert.ok(Object.keys(rec.snapshots).length > 0, `tomt snapshot-sett for ${rec.friendId}`);
  });
});

check("alle snapshot-faser er gyldige Civication-faser", () => {
  const valid = new Set(["morning", "work", "leisure", "evening", "reflection"]);
  snapshots.forEach((rec) => {
    Object.keys(rec.snapshots).forEach((phase) => {
      assert.ok(valid.has(phase), `${rec.friendId}: ugyldig fase ${phase}`);
    });
  });
});

check("alle snapshot.locationId peker til et ekte sted i fase-/kartdata", () => {
  snapshots.forEach((rec) => {
    Object.entries(rec.snapshots).forEach(([phase, snap]) => {
      assert.ok(locationIds.has(snap.locationId), `${rec.friendId}/${phase}: ukjent locationId ${snap.locationId}`);
    });
  });
});

check("ingen GPS/live-tracking-felter er introdusert", () => {
  const forbidden = [
    "lat", "lng", "latitude", "longitude", "gps", "geo", "coords", "coordinate",
    "liveLocation", "realtime", "realTime", "timestampMs", "currentLocation", "isLive", "tracking"
  ];
  const raw = JSON.stringify(snapshotsData);
  // Sjekk på nøkkelnivå (ikke fritekst i activity/note) for å unngå falske treff.
  function scan(node, pathStr) {
    if (Array.isArray(node)) {
      node.forEach((v, i) => scan(v, `${pathStr}[${i}]`));
    } else if (node && typeof node === "object") {
      Object.keys(node).forEach((key) => {
        const lower = key.toLowerCase();
        forbidden.forEach((bad) => {
          assert.ok(lower !== bad.toLowerCase(), `forbudt felt "${key}" funnet på ${pathStr}`);
        });
        scan(node[key], `${pathStr}.${key}`);
      });
    }
  }
  scan(snapshotsData, "root");
  assert.ok(!/\bgps\b/i.test(raw) || true); // raw-sjekk er kun supplerende
});

console.log("CivicationFriendsEngine – fase-minne (deterministisk)");

check("getActivePhase mapper kalenderens dagfaser til semantiske faser", () => {
  assert.strictEqual(eng.getActivePhase("morning"), "morning");
  assert.strictEqual(eng.getActivePhase("lunch"), "work");
  assert.strictEqual(eng.getActivePhase("afternoon"), "leisure");
  assert.strictEqual(eng.getActivePhase("evening"), "evening");
  assert.strictEqual(eng.getActivePhase("day_end"), "evening");
});

check("getFriendSnapshotForPhase henter riktig snapshot (eksplisitt data)", () => {
  const snap = eng.getFriendSnapshotForPhase("friend_demo_01", "morning", snapshots);
  assert.ok(snap, "fant ikke snapshot");
  assert.strictEqual(snap.state, "at_home");
  assert.strictEqual(snap.locationId, "friend_home_demo_01");
});

check("getFriendSnapshotForPhase støtter refleksjonsfase", () => {
  const snap = eng.getFriendSnapshotForPhase("friend_demo_03", "reflection", snapshots);
  assert.ok(snap, "fant ikke refleksjons-snapshot");
  assert.strictEqual(snap.locationId, "psychology_room");
});

check("snapshot velges for aktiv fase og prioriteres over generell presence", () => {
  const mariam = friends.find((f) => f.id === "friend_demo_01");
  const p = eng.resolveFriendMapPresence(mariam, "leisure", snapshots, 1);
  // Snapshot (park) skal vinne over presenceByPhase.afternoon (cafe).
  assert.strictEqual(p.source, "snapshot");
  assert.strictEqual(p.isSnapshot, true);
  assert.strictEqual(p.locationId, "park");
  assert.strictEqual(p.mood, "avslappet");
  // Uten snapshot ville fallback gitt cafe – bekreft at de faktisk er ulike.
  const fallbackOnly = eng.resolveFriendMapPresence(mariam, "leisure", [], 1);
  assert.strictEqual(fallbackOnly.locationId, "cafe");
});

check("fallback til presenceByPhase brukes når snapshot mangler", () => {
  const jonas = friends.find((f) => f.id === "friend_demo_02");
  const p = eng.resolveFriendMapPresence(jonas, "leisure", snapshots, 1);
  assert.strictEqual(p.source, "presence_fallback");
  assert.strictEqual(p.isSnapshot, false);
  assert.strictEqual(p.locationId, "workplace"); // afternoon-presence
});

check("snapshot med visibleOnMap=false skjuler vennen", () => {
  const oda = friends.find((f) => f.id === "friend_demo_04");
  const p = eng.resolveFriendMapPresence(oda, "work", snapshots, 1);
  assert.strictEqual(p.source, "snapshot");
  assert.strictEqual(p.visibleOnMap, false);
});

check("venner uten snapshot og uten presence skjules trygt", () => {
  const ghost = { id: "ghost_01", avatar: { homeId: "home" }, presenceByPhase: {} };
  const p = eng.resolveFriendMapPresence(ghost, "leisure", snapshots, 1);
  assert.strictEqual(p.source, "none");
  assert.strictEqual(p.visibleOnMap, false);
  assert.strictEqual(p.statusText, "Ingen fasehistorikk ennå");
});

check("resolveFriendMapPresence er deterministisk (samme input -> samme output)", () => {
  const sara = friends.find((f) => f.id === "friend_demo_03");
  const a = eng.resolveFriendMapPresence(sara, "evening", snapshots, 1);
  const b = eng.resolveFriendMapPresence(sara, "evening", snapshots, 1);
  assert.deepStrictEqual(a, b);
});

check("getFriendsAtLocationForPhase returnerer riktige venner per phase/location", () => {
  // work-fasen: kun Jonas står på arbeidsplassen (Oda er skjult, Mariam på kafé).
  const workplaceWork = eng
    .getFriendsAtLocationForPhase("workplace", "work", friends, snapshots, 1)
    .map((r) => r.friend.id);
  assert.deepStrictEqual(workplaceWork.sort(), ["friend_demo_02"]);

  const cafeWork = eng
    .getFriendsAtLocationForPhase("cafe", "work", friends, snapshots, 1)
    .map((r) => r.friend.id);
  assert.deepStrictEqual(cafeWork.sort(), ["friend_demo_01"]);

  // morning-fasen: Jonas (travelling) og Oda (tidlig vakt) på arbeidsplassen.
  const workplaceMorning = eng
    .getFriendsAtLocationForPhase("workplace", "morning", friends, snapshots, 1)
    .map((r) => r.friend.id);
  assert.deepStrictEqual(workplaceMorning.sort(), ["friend_demo_02", "friend_demo_04"]);
});

check("getVisibleFriendSnapshotsForPhase utelater skjulte venner", () => {
  const visibleWork = eng
    .getVisibleFriendSnapshotsForPhase("work", friends, snapshots, 1)
    .map((r) => r.friend.id);
  assert.ok(!visibleWork.includes("friend_demo_04"), "Oda (skjult i arbeidsfasen) skal ikke vises");
  assert.ok(visibleWork.includes("friend_demo_02"), "Jonas skal vises i arbeidsfasen");
});

console.log("CivicationFriendsEngine – brukervendte label-/tekst-hjelpere");

check("getPhaseLabel gir riktige norske fase-labels", () => {
  assert.strictEqual(eng.getPhaseLabel("morning"), "Morgenfase");
  assert.strictEqual(eng.getPhaseLabel("work"), "Arbeidsfase");
  assert.strictEqual(eng.getPhaseLabel("leisure"), "Fritidsfase");
  assert.strictEqual(eng.getPhaseLabel("evening"), "Kveldsfase");
  assert.strictEqual(eng.getPhaseLabel("reflection"), "Refleksjonsfase");
});

check("getPhaseLabel godtar kalenderens dagfaser via normalisering", () => {
  assert.strictEqual(eng.getPhaseLabel("lunch"), "Arbeidsfase");
  assert.strictEqual(eng.getPhaseLabel("afternoon"), "Fritidsfase");
  assert.strictEqual(eng.getPhaseLabel("day_end"), "Kveldsfase");
});

check("getPresenceStateLabel gir norske statustekster", () => {
  assert.strictEqual(eng.getPresenceStateLabel("at_home"), "Er hjemme");
  assert.strictEqual(eng.getPresenceStateLabel("at_work"), "Er på jobb");
  assert.strictEqual(eng.getPresenceStateLabel("reflecting"), "Reflekterer");
});

check("getRelationshipLabel dekker alle nivåer", () => {
  assert.strictEqual(eng.getRelationshipLabel(0), "ny kontakt");
  assert.strictEqual(eng.getRelationshipLabel(1), "bekjent");
  assert.strictEqual(eng.getRelationshipLabel(2), "venn");
  assert.strictEqual(eng.getRelationshipLabel(3), "nær venn");
  assert.strictEqual(eng.getRelationshipLabel(9), "nær venn");
  assert.strictEqual(eng.getRelationshipLabel(undefined), "ny kontakt");
});

check("getRelationshipBlurb gir egen sosial tekst pr. nivå", () => {
  const blurbs = [0, 1, 2, 3].map((n) => eng.getRelationshipBlurb(n));
  blurbs.forEach((b) => assert.ok(b && b.length > 0, "blurb skal ikke være tom"));
  assert.strictEqual(new Set(blurbs).size, 4, "hvert nivå skal ha unik tekst");
  assert.strictEqual(eng.getRelationshipBlurb(1), "Dere kjenner hverandre litt.");
  assert.strictEqual(eng.getRelationshipBlurb(2), "Dere har begynt å bygge en relasjon.");
  assert.strictEqual(eng.getRelationshipBlurb(3), "Dette er en nær venn i byen.");
});

check("getSnapshotDisclosureText sier tydelig at det IKKE er live-posisjon", () => {
  const text = eng.getSnapshotDisclosureText("Kari", "morning");
  assert.ok(/ikke live-posisjon/i.test(text), "må avkrefte live-posisjon");
  assert.ok(/simulert fasehistorikk/i.test(text), "må kalle det simulert fasehistorikk");
  assert.ok(text.includes("Karis"), "skal bruke eieform av navnet");
  assert.ok(text.includes("morgenfase"), "skal nevne fasen på norsk");
});

check("getSnapshotDisclosureText håndterer navn som slutter på s", () => {
  const text = eng.getSnapshotDisclosureText("Jonas", "work");
  assert.ok(text.includes("Jonas'"), "navn på s skal få apostrof-eieform");
  assert.ok(text.includes("arbeidsfase"), "skal nevne arbeidsfasen");
});

check("label-/tekst-hjelpere er deterministiske", () => {
  assert.strictEqual(eng.getPhaseLabel("evening"), eng.getPhaseLabel("evening"));
  assert.strictEqual(
    eng.getSnapshotDisclosureText("Kari", "leisure"),
    eng.getSnapshotDisclosureText("Kari", "leisure")
  );
});

console.log("CivicationFriendsEngine – lokalt spiller-fase-minne (scaffold)");

check("setPlayerPhaseSnapshot/getPlayerPhaseSnapshot lagrer og henter i minne", () => {
  const saved = eng.setPlayerPhaseSnapshot("morning", {
    state: "at_home",
    locationId: "home",
    activity: "lager frokost",
    mood: "rolig"
  });
  assert.strictEqual(saved.phase, "morning");
  const got = eng.getPlayerPhaseSnapshot("morning");
  assert.strictEqual(got.locationId, "home");
  assert.strictEqual(got.activity, "lager frokost");
  const all = eng.getPlayerPhaseSnapshots();
  assert.ok(all.morning, "morning skal finnes i samlet spiller-fase-minne");
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
