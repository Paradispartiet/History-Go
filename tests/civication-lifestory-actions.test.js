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
for (const type of ["velg_bosted", "aapne_butikk", "gaa_til_quiz"]) {
  assert.ok(brukteTyper.has(type), `handlingen "${type}" er ikke i bruk i noe valg`);
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
  g.CivicationHome = { getCurrentDistrict: () => ({ id: "sagene", name: "Sagene" }) };
  g.CivicationState = { getActivePosition: () => null };
  assert.deepStrictEqual(Bridge.refreshShellStateSnapshot(), { harBosted: true, harJobb: false });
  g.CivicationHome = { getCurrentDistrict: () => undefined };
  assert.deepStrictEqual(Bridge.refreshShellStateSnapshot(), { harBosted: false, harJobb: false });
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
    // gaa_til_quiz navigerer — i Node finnes ingen location => ærlig false.
    const res = Actions.perform({ type: "gaa_til_quiz" });
    assert.strictEqual(res.type, "gaa_til_quiz");
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
