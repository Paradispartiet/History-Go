#!/usr/bin/env node
// STARTKONTRAKTEN for Civication (dashboardet: «Ta quiz og åpne jobbtilbud
// for å starte et livsløp», SYSTEM_MAP: «Poeng, merker og jobbtilbud»):
//   Du starter ARBEIDSLEDIG. Jobb kommer via quiz/merker -> jobbtilbud i
//   skallet -> Min dag adopterer jobbens rolle automatisk.
// Denne testen eier kontrakten: default-rollen er arbeidsledig, pakken er
// spillbar (dag 1 + dag 2-forgrening), ingen jobb mapper til den, og den
// peker spilleren mot den faktiske mekanikken (kunnskap/merker).
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const Content = require("../js/Civication/lifestory/lifestoryContent.js");
const State = require("../js/Civication/lifestory/lifestoryState.js");
const Runner = require("../js/Civication/lifestory/lifestoryRunner.js");
const Marker = require("../js/Civication/ui/CivicationLifestoryPlaceMarker.js");

const ROOT = path.join(__dirname, "..");
function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const manifest = readJson("data/Civication/lifestory/manifest.json");
const roleEntry = manifest.roles.arbeidsledig;
assert.ok(roleEntry, "manifestet må ha rollen arbeidsledig");

// --- 1. Ingen jobb mapper til arbeidsledighet (ingen role_scope-binding) ---
assert.strictEqual(roleEntry.role_scope, undefined,
  "arbeidsledig skal IKKE ha role_scope — ingen jobb mapper til den");
for (const [roleId, entry] of Object.entries(manifest.roles)) {
  if (roleId === "arbeidsledig") continue;
  assert.ok(entry.role_scope, `jobbrollen ${roleId} skal fortsatt ha binding`);
}

// --- 2. UI-kontrakten: default er arbeidsledig, adopsjon bytter ved jobb ---
const uiSource = fs.readFileSync(path.join(ROOT, "js/Civication/ui/CivicationLifestoryUI.js"), "utf8");
assert.ok(uiSource.includes('DEFAULT_ROLE_ID = "arbeidsledig"'),
  "standard uten valg/jobb er arbeidsledig");
assert.ok(uiSource.includes("maybeAdoptShellRole"),
  "jobb via quiz/merker -> jobbtilbud -> Min dag adopterer rollen");

// --- 3. Pakken består de fire lovene, og alle tråder er privatliv ---
const raw = {
  role: readJson(roleEntry.role),
  phaseDefinitions: readJson(manifest.shared.phaseDefinitions),
  roleThreads: readJson(roleEntry.threads),
  roleScenes: readJson(roleEntry.scenes),
  lifeThreads: readJson(manifest.life.threads),
  lifeScenes: readJson(manifest.life.scenes)
};
const content = Content.buildContent(raw);
assert.strictEqual(content.role.id, "arbeidsledig");
assert.ok(raw.roleThreads.threads.every((t) => t.type === "privatliv"),
  "arbeidsledig har ingen jobb — alle tråder er privatliv");

// Kartmarkøren skal derfor aldri påstå en arbeidsplass.
const markerLoc = Marker.resolveSceneMapLoc(
  { threadType: "privatliv", dagFerdig: false, fase: "morgen", rolleNavn: "Arbeidsledig" }, {});
assert.strictEqual(markerLoc.kind, "hjem", "arbeidsledig-scener hører hjemme, ikke «på jobb»");

// --- 4. Dag 1 er spillbar: meldekort, søknaden, dagen uten ramme ---
let state = State.createInitialState(content);
assert.strictEqual(state.rolle, "arbeidsledig");
assert.strictEqual(state.meters.penger, 240, "stram økonomi fra start");
assert.strictEqual(state.meters.synlighet, 20, "lav synlighet uten jobb");

let guard = 0;
while (!state.dagFerdig) {
  const scene = Runner.selectNextScene(state, content);
  assert.ok(scene, "det skal alltid finnes en scene til dagen er ferdig");
  // Gren: utsett meldekortet, la resten gå på første valg.
  const valgId = scene.id === "meldekort_01_fristen" ? "utsett" : scene.valg[0].id;
  Runner.applyChoice(state, content, scene.id, valgId);
  assert.ok(++guard < 50, "dagen må terminere");
}
const spilte = state.arkiv.map((e) => e.sceneId);
for (const kjerne of ["meldekort_01_fristen", "soknad_01_hullet", "rytme_01_dagen_flyter"]) {
  assert.ok(spilte.includes(kjerne), `kjernescenen ${kjerne} ble spilt på dag 1`);
}

// --- 5. Dag 2 leser dag 1: utsatt meldekort => frist-stress, ellers ok ---
state = Runner.startNextDay(state, content);
let kandidater = Runner.getCandidateScenes(state, content).map((s) => s.id);
assert.ok(kandidater.includes("d2_frist_stress"), "utsatt meldekort => fristen er i dag");
assert.ok(!kandidater.includes("d2_meldekort_ok"), "ok-scenen skal ikke være kandidat etter utsettelse");

// Motsatt gren: sendt med en gang => «alt er i orden hos oss».
let state2 = State.createInitialState(content);
guard = 0;
while (!state2.dagFerdig) {
  const scene = Runner.selectNextScene(state2, content);
  assert.ok(scene, "dag 1 (gren 2) skal ha scener");
  Runner.applyChoice(state2, content, scene.id, scene.valg[0].id);
  assert.ok(++guard < 50, "dag 1 (gren 2) må terminere");
}
state2 = Runner.startNextDay(state2, content);
kandidater = Runner.getCandidateScenes(state2, content).map((s) => s.id);
assert.ok(kandidater.includes("d2_meldekort_ok"), "sendt meldekort => alt i orden-scenen");
assert.ok(!kandidater.includes("d2_frist_stress"), "frist-stress skal ikke være kandidat når kortet ble sendt");

// --- 6. Pakken peker mot den faktiske mekanikken: kunnskap/merker -> jobb ---
const scenesText = JSON.stringify(raw.roleScenes);
assert.ok(/[Kk]unnskap/.test(scenesText) && /merke/i.test(scenesText),
  "arbeidsledig-dagene peker spilleren mot kunnskap/merker — veien til jobbtilbud");

console.log("civication lifestory arbeidsledig ok (startkontrakt: arbeidsledig -> quiz/merker -> jobb)");
