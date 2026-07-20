#!/usr/bin/env node
// Verifiserer CivicationHistoryFigures («byens skikkelser»):
// deterministisk utvalg av samlede History Go-personer på kultur-/parksteder
// i fritids-/kveldsfasene, aldri i arbeidsfasene, og trygg tom liste uten
// samling/bro. Skikkelsene er kulturelt nærvær — ikke venner.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const figuresPath = path.join(root, "js/Civication/systems/civicationHistoryFigures.js");
const bridgePath = path.join(root, "js/Civication/systems/civicationHistoryPeopleBridge.js");

const LOCATIONS = [
  { id: "home", type: "home", label: "Hjem" },
  { id: "workplace", type: "job", label: "Arbeidsplass" },
  { id: "culture", type: "culture", label: "Kultursted" },
  { id: "park", type: "park", label: "Park" },
  { id: "cafe", type: "cafe", label: "Kafé" }
];

const COLLECTED = [
  { id: "leif_juster", name: "Leif Juster", category: "populaerkultur", desc: "Revysjef.", placeId: "edderkoppen_scene" },
  { id: "edvard_munch", name: "Edvard Munch", category: "kunst", desc: "Maler.", placeId: "ekely", year: 1892 },
  { id: "camilla_collett", name: "Camilla Collett", category: "litteratur", desc: "Forfatter.", placeId: "eidsvoll_plass" }
];

function freshEnv() {
  global.window = global;
  global.CivicationHistoryFigures = undefined;
  global.CivicationHistoryPeopleBridge = undefined;
  global.document = { readyState: "complete", addEventListener() {} };
  global.addEventListener = () => {};
  vm.runInThisContext(fs.readFileSync(figuresPath, "utf8"), { filename: figuresPath });
  return global.CivicationHistoryFigures;
}

async function run() {
  // 1) Deterministisk: samme (samling, fase, dag) gir samme skikkelser.
  {
    const figures = freshEnv();
    const a = figures.pickFiguresForPhase(COLLECTED, "evening", 3, LOCATIONS);
    const b = figures.pickFiguresForPhase(COLLECTED, "evening", 3, LOCATIONS);
    assert.deepStrictEqual(a, b);
    assert.ok(a.length >= 1 && a.length <= 2);
    a.forEach((row) => {
      assert.ok(["culture", "park", "cafe"].includes(
        LOCATIONS.find((l) => l.id === row.presence.locationId).type
      ), "skikkelser plasseres kun på kultur-/park-/kafésteder");
      assert.strictEqual(row.presence.visibleOnMap, true);
      assert.strictEqual(row.presence.state, "in_event");
    });
  }

  // 2) Ulike dager kan gi ulikt utvalg, men alltid deterministisk per dag.
  {
    const figures = freshEnv();
    const day1 = figures.pickFiguresForPhase(COLLECTED, "leisure", 1, LOCATIONS);
    const day1b = figures.pickFiguresForPhase(COLLECTED, "leisure", 1, LOCATIONS);
    assert.deepStrictEqual(day1, day1b);
  }

  // 3) Aldri i arbeids-/morgen-/refleksjonsfasene.
  {
    const figures = freshEnv();
    ["morning", "work", "reflection", ""].forEach((phase) => {
      assert.deepStrictEqual(figures.pickFiguresForPhase(COLLECTED, phase, 2, LOCATIONS), []);
    });
  }

  // 4) Tom samling eller ingen kvalifiserte steder -> ingen skikkelser.
  {
    const figures = freshEnv();
    assert.deepStrictEqual(figures.pickFiguresForPhase([], "evening", 2, LOCATIONS), []);
    const noSpots = LOCATIONS.filter((l) => l.type === "home" || l.type === "job");
    assert.deepStrictEqual(figures.pickFiguresForPhase(COLLECTED, "evening", 2, noSpots), []);
  }

  // 5) To skikkelser er aldri samme person.
  {
    const figures = freshEnv();
    const rows = figures.pickFiguresForPhase(COLLECTED, "evening", 7, LOCATIONS);
    const ids = rows.map((r) => r.figure.id);
    assert.strictEqual(new Set(ids).size, ids.length);
  }

  // 6) getFiguresForRender: trygg tom liste uten bro; med bro brukes samlingen.
  {
    const figures = freshEnv();
    const empty = await figures.getFiguresForRender({ snapshotPhase: "evening", dayIndex: 1, locations: LOCATIONS });
    assert.deepStrictEqual(empty, []);

    // Last den ekte broen med en fixture-indeks + samlet person.
    global.localStorage = {
      getItem: (k) => (k === "people_collected" ? JSON.stringify({ edvard_munch: true }) : null),
      setItem() {}, removeItem() {}
    };
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ categories: { kunst: [COLLECTED[1]] } })
    });
    vm.runInThisContext(fs.readFileSync(bridgePath, "utf8"), { filename: bridgePath });

    const rows = await figures.getFiguresForRender({ snapshotPhase: "evening", dayIndex: 1, locations: LOCATIONS });
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].figure.id, "edvard_munch");
    assert.strictEqual(rows[0].figure.name, "Edvard Munch");
  }

  console.log("civication-history-figures.test.js: alle tester OK");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
