#!/usr/bin/env node
// Handlingskontrakten: valg i Min dag kan UTFØRE ekte spillhandlinger
// (velge bosted, åpne butikken, gå til quiz i History GO), og shell-gatede
// scener (f.eks. «Du må velge et sted å bo») leser SANN spilltilstand via
// det synkrone snapshotet — aldri gjetting:
//   - handling.type og conditions.shell valideres fail fast,
//   - bosted-scenen fyrer KUN når skallet sier harBosted=false,
//   - utføreren bytter fane via footeren / navigerer til History GO,
//   - UI-et viser handlingshint og utfører ETTER at state er lagret.
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const Content = require("../js/Civication/lifestory/lifestoryContent.js");
const State = require("../js/Civication/lifestory/lifestoryState.js");
const Runner = require("../js/Civication/lifestory/lifestoryRunner.js");
const Bridge = require("../js/Civication/lifestory/lifestoryShellBridge.js");
const Actions = require("../js/Civication/ui/CivicationLifestoryActions.js");

const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const manifest = readJson("data/Civication/lifestory/manifest.json");

const arbeidsledig = manifest.roles.arbeidsledig;
const raw = {
  role: readJson(arbeidsledig.role),
  phaseDefinitions: readJson(manifest.shared.phaseDefinitions),
  roleThreads: readJson(arbeidsledig.threads),
  roleScenes: readJson(arbeidsledig.scenes),
  lifeThreads: readJson(manifest.life.threads),
  lifeScenes: readJson(manifest.life.scenes)
};
const content = Content.buildContent(raw);

// --- 1. Validatoren: fail fast på ukjent handling og ukjent shell-nøkkel ---
assert.throws(() => {
  const broken = JSON.parse(JSON.stringify(raw));
  broken.roleScenes.scenes[0].valg[0].handling = { type: "teleporter" };
  Content.buildContent(broken);
}, /ukjent handlingstype/, "ukjent handlingstype skal kaste");
assert.throws(() => {
  const broken = JSON.parse(JSON.stringify(raw));
  broken.roleScenes.scenes[0].conditions = { shell: { harHelikopter: true } };
  Content.buildContent(broken);
}, /shell: ukjent nøkkel/, "ukjent shell-nøkkel skal kaste");

// --- 2. Alle handlinger i innholdet har kjent type ---
const brukteTyper = new Set();
for (const file of [manifest.life.scenes, ...Object.values(manifest.roles).map((r) => r.scenes)]) {
  for (const sc of readJson(file).scenes) {
    for (const v of sc.valg || []) {
      if (!v.handling) continue;
      assert.ok(Content.HANDLING_TYPES.includes(v.handling.type),
        `${file} ${sc.id}/${v.id}: ukjent handling "${v.handling && v.handling.type}"`);
      brukteTyper.add(v.handling.type);
    }
  }
}
for (const type of ["velg_bosted", "aapne_butikk", "gaa_til_quiz", "gaa_til_byen", "gaa_til_debatt"]) {
  assert.ok(brukteTyper.has(type), `handlingen "${type}" er ikke i bruk i noe valg`);
}

// --- 2b. Debatt-handlinger peker på EKTE debatter (id-sync mot data/debates) ---
{
  const debateIds = new Set();
  for (const f of fs.readdirSync(path.join(ROOT, "data/debates")).filter((x) => x.startsWith("debates_") && x.endsWith(".json"))) {
    const d = readJson("data/debates/" + f);
    for (const deb of d.debates || d) if (deb && deb.id) debateIds.add(deb.id);
  }
  for (const file of [manifest.life.scenes, ...Object.values(manifest.roles).map((r) => r.scenes)]) {
    for (const sc of readJson(file).scenes) {
      for (const v of sc.valg || []) {
        if (v.handling?.type !== "gaa_til_debatt") continue;
        assert.ok(debateIds.has(v.handling.id),
          `${file} ${sc.id}/${v.id}: debatten "${v.handling.id}" finnes ikke i data/debates`);
      }
    }
  }
}

// --- 2c. Validatoren krever id for gaa_til_debatt ---
assert.throws(() => {
  const broken = JSON.parse(JSON.stringify(raw));
  broken.roleScenes.scenes[0].valg[0].handling = { type: "gaa_til_debatt" };
  Content.buildContent(broken);
}, /krever en ikke-tom id/, "gaa_til_debatt uten id skal kaste");

// --- 3b. Husleiepress-scenen fyrer KUN ved faktisk press ---
{
  const state = State.createInitialState(content);
  state.dag = 3;
  state.fase = "morgen";
  globalThis.CivicationLifestoryShellState = { harBosted: true, harJobb: false, harHusleiepress: true };
  assert.ok(Runner.getCandidateScenes(state, content).some((s) => s.id === "husleie_01_presset"),
    "husleiepress i skallet => scenen tilbys");
  globalThis.CivicationLifestoryShellState = { harBosted: true, harJobb: false, harHusleiepress: false };
  assert.ok(!Runner.getCandidateScenes(state, content).some((s) => s.id === "husleie_01_presset"),
    "uten press skal scenen ikke mase");
  delete globalThis.CivicationLifestoryShellState;
}

// --- 3. Bosted-scenen fyrer KUN når skallet sier at bosted mangler ---
const g = globalThis;
function bostedKandidater(state) {
  return Runner.getCandidateScenes(state, content).map((s) => s.id);
}
{
  const state = State.createInitialState(content);
  state.fase = "ettermiddag"; // bosted-scenen bor i ettermiddagen

  delete g.CivicationLifestoryShellState;
  assert.ok(!bostedKandidater(state).includes("bosted_01_hvor_vil_du_bo"),
    "uten snapshot (ren Min dag-flate) skal bosted-scenen ALDRI fyre");

  g.CivicationLifestoryShellState = { harBosted: false, harJobb: false };
  assert.ok(bostedKandidater(state).includes("bosted_01_hvor_vil_du_bo"),
    "uten bosted i skallet skal spilleren få beskjed om å velge et sted å bo");

  g.CivicationLifestoryShellState = { harBosted: true, harJobb: false };
  assert.ok(!bostedKandidater(state).includes("bosted_01_hvor_vil_du_bo"),
    "med bosted valgt skal scenen ikke mase");
  delete g.CivicationLifestoryShellState;
}

// --- 4. Broen speiler skallet inn i snapshotet ---
try {
  g.CivicationHome = {
    getCurrentDistrict: () => ({ id: "sagene", name: "Sagene" }),
    getRentPressure: () => ({ score: 62 })
  };
  g.CivicationState = { getActivePosition: () => null };
  assert.deepStrictEqual(Bridge.refreshShellStateSnapshot(),
    { harBosted: true, harJobb: false, harHusleiepress: true },
    "score >= 50 er husleiepress (skallets egen terskel for Høyt/Kritisk)");
  g.CivicationHome = { getCurrentDistrict: () => undefined, getRentPressure: () => ({ score: 20 }) };
  assert.deepStrictEqual(Bridge.refreshShellStateSnapshot(),
    { harBosted: false, harJobb: false, harHusleiepress: false });
  delete g.CivicationHome;
  assert.strictEqual(Bridge.refreshShellStateSnapshot(), null, "uten skall: ingen snapshot");
} finally {
  delete g.CivicationHome;
  delete g.CivicationState;
  delete g.CivicationLifestoryShellState;
}

// --- 5. Utføreren: fanebytte via footeren, History GO via navigasjon ---
{
  const klikk = [];
  g.document = {
    querySelector: (sel) => {
      const m = /data-category="([a-z]+)"/i.exec(sel);
      if (!m) return null;
      return { click: () => klikk.push(m[1]) };
    }
  };
  try {
    assert.deepStrictEqual(Actions.perform({ type: "velg_bosted" }), { utfoert: true, type: "velg_bosted" });
    assert.deepStrictEqual(Actions.perform({ type: "aapne_butikk" }), { utfoert: true, type: "aapne_butikk" });
    assert.deepStrictEqual(klikk, ["personlig", "kommers"],
      "bosted åpner Personlig (nabolagsvalget), lunsj åpner Kommers (butikken)");
    // Navigasjonene: mocket location fanger målet.
    const hrefs = [];
    g.location = { set href(v) { hrefs.push(v); } };
    try {
      assert.deepStrictEqual(Actions.perform({ type: "gaa_til_quiz" }), { utfoert: true, type: "gaa_til_quiz" });
      assert.deepStrictEqual(Actions.perform({ type: "gaa_til_byen" }), { utfoert: true, type: "gaa_til_byen" });
      assert.deepStrictEqual(Actions.perform({ type: "gaa_til_debatt", id: "radhusplassen_bilfri" }),
        { utfoert: true, type: "gaa_til_debatt" });
      assert.deepStrictEqual(hrefs,
        ["index.html#/map", "index.html#/map", "index.html#/debate/radhusplassen_bilfri"],
        "quiz/byen går til kartet, debatten til debattruten");
    } finally {
      delete g.location;
    }
  } finally {
    delete g.document;
  }
  // Uten DOM i det hele tatt: stille no-op, ingen kræsj.
  assert.deepStrictEqual(Actions.perform({ type: "aapne_butikk" }), { utfoert: false, type: "aapne_butikk" });
  assert.deepStrictEqual(Actions.perform(null), { utfoert: false, type: null });
}

// --- 6. UI-et er koblet: hint på knappen, utførelse etter lagring ---
const uiSource = fs.readFileSync(path.join(ROOT, "js/Civication/ui/CivicationLifestoryUI.js"), "utf8");
assert.ok(uiSource.includes("civi-lifestory-action-hint"), "valgknappen viser handlingshint");
assert.ok(uiSource.includes("CivicationLifestoryActions?.perform"), "onChoose utfører handlingen");
assert.ok(uiSource.indexOf("State.save(state)") < uiSource.indexOf("CivicationLifestoryActions?.perform"),
  "handlingen utføres ETTER at Player State er lagret — navigasjon mister aldri progresjon");

console.log("civication lifestory handlinger ok (" + brukteTyper.size + " handlingstyper i bruk)");
