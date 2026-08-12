#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const Content = require("../js/Civication/lifestory/lifestoryContent.js");
const State = require("../js/Civication/lifestory/lifestoryState.js");
const Runner = require("../js/Civication/lifestory/lifestoryRunner.js");

const ROOT = path.join(__dirname, "..");
function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const manifest = readJson("data/Civication/lifestory/manifest.json");
const roleEntry = manifest.roles.barnehageassistent;
assert.ok(roleEntry, "manifestet må ha rollen barnehageassistent");
assert.strictEqual(roleEntry.role_scope, "barnehageassistent");
assert.strictEqual(roleEntry.content_only, true, "rollen skal bevares som content-only uten Badge-binding");
assert.strictEqual(roleEntry.legacy_namespace, "sosial_laering");
assert.ok(!roleEntry.badge_id && !roleEntry.badge_titles, "content-only-rollen skal ikke late som den har Badge-binding");

const raw = {
  role: readJson(roleEntry.role),
  phaseDefinitions: readJson(manifest.shared.phaseDefinitions),
  roleThreads: readJson(roleEntry.threads),
  roleScenes: readJson(roleEntry.scenes),
  lifeThreads: readJson(manifest.life.threads),
  lifeScenes: readJson(manifest.life.scenes)
};

const content = Content.buildContent(raw);
assert.strictEqual(content.role.id, "barnehageassistent");
assert.strictEqual(raw.roleThreads.threads.length, 5, "rollen skal ha fem arbeidstråder");
assert.ok(content.threads.length >= 9, "arbeidstråder + delte privattråder");
assert.ok(raw.roleThreads.threads.every((t) => t.type === "arbeidsliv"), "rolletrådene er arbeidsliv");
assert.deepStrictEqual(raw.roleThreads.threads.map((t) => t.id).sort(), [
  "barnet_slipper_ikke_handen",
  "bemanningen_er_stram",
  "den_frie_leken",
  "garderoben_koker",
  "observasjon_ikke_magefolelse"
].sort());

for (const person of ["pedagogisk_leder", "erfaren_assistent", "ny_vikar", "noah", "ema", "forelder_linn", "forelder_samir", "styrer"]) {
  assert.ok(typeof content.role.startState.relasjoner[person] === "number", `relasjonen ${person} mangler`);
}

// Delte privatlivsscener må være rolleagnostiske.
for (const scene of raw.lifeScenes.scenes) {
  for (const threadId of Object.keys(scene.conditions?.threads || {})) {
    assert.ok(raw.lifeThreads.threads.some((t) => t.id === threadId),
      `livsscene ${scene.id} betinger på ikke-delt tråd ${threadId}`);
  }
}

let state = State.createInitialState(content);
assert.strictEqual(state.rolle, "barnehageassistent");
assert.strictEqual(state.meters.integritet, 54);
assert.strictEqual(state.meters.energi, 70);
assert.strictEqual(state.relasjoner.noah, 48);

let view = Runner.getView(state, content);
assert.strictEqual(view.scene.id, "privat_morgen_start", "dagen starter med delt privatliv");
Runner.applyChoice(state, content, "privat_morgen_start", view.scene.valg[0].id);
view = Runner.getView(state, content);
assert.strictEqual(view.scene.id, "overgang_01", "første jobbscene skal være morgenleveringen");

Runner.applyChoice(state, content, "overgang_01", "rolig");
assert.strictEqual(state.tidligereValg.skapte_rolig_overgang, true);
assert.strictEqual(state.relasjoner.noah, 56);

let guard = 0;
while (!state.dagFerdig) {
  const scene = Runner.selectNextScene(state, content);
  assert.ok(scene, "dag 1 skal ha neste scene til dagen er ferdig");
  Runner.applyChoice(state, content, scene.id, scene.valg[0].id);
  assert.ok(++guard < 60, "dag 1 må terminere");
}

const dag1Ids = state.arkiv.map((entry) => entry.sceneId);
for (const id of ["overgang_01", "lek_01", "garderobe_01", "observasjon_01", "bemanning_01"]) {
  assert.ok(dag1Ids.includes(id), `dag 1 mangler kjernescenen ${id}`);
}
assert.strictEqual(state.tidligereValg.aapnet_leken_for_ema, true);
assert.strictEqual(state.tidligereValg.skrev_konkret_observasjon, true);

state = Runner.startNextDay(state, content);
assert.strictEqual(state.dag, 2);
let candidates = Runner.getCandidateScenes(state, content).map((scene) => scene.id);
assert.ok(candidates.includes("d2_overgang_trygg"), "rolig overgang skal gi trygg oppfølging dag 2");
assert.ok(!candidates.includes("d2_overgang_presset"), "presset gren skal ikke fyre etter rolig overgang");
assert.ok(!candidates.includes("d2_overgang_overlatt"), "overlatt gren skal ikke fyre etter rolig overgang");

// Hele dag 2 skal kunne spilles uten dead end.
guard = 0;
while (!state.dagFerdig) {
  const scene = Runner.selectNextScene(state, content);
  if (!scene) break;
  Runner.applyChoice(state, content, scene.id, scene.valg[0].id);
  assert.ok(++guard < 60, "dag 2 må terminere");
}
assert.ok(state.arkiv.some((entry) => entry.sceneId === "d2_ema_forelder"), "foreldresamtalen skal inngå dag 2");
assert.ok(state.arkiv.some((entry) => entry.sceneId === "d2_bemanning"), "bemanningsoppfølgingen skal inngå dag 2");

// Alternativ gren: rask avskjed skal gi reparasjonssamtalen dag 2.
let state2 = State.createInitialState(content);
view = Runner.getView(state2, content);
Runner.applyChoice(state2, content, "privat_morgen_start", view.scene.valg[0].id);
view = Runner.getView(state2, content);
assert.strictEqual(view.scene.id, "overgang_01");
Runner.applyChoice(state2, content, "overgang_01", "rask");
assert.strictEqual(state2.tidligereValg.presset_overgangen, true);

guard = 0;
while (!state2.dagFerdig) {
  const scene = Runner.selectNextScene(state2, content);
  assert.ok(scene, "alternativ dag 1 skal ha scener");
  Runner.applyChoice(state2, content, scene.id, scene.valg[0].id);
  assert.ok(++guard < 60, "alternativ dag 1 må terminere");
}
state2 = Runner.startNextDay(state2, content);
candidates = Runner.getCandidateScenes(state2, content).map((scene) => scene.id);
assert.ok(candidates.includes("d2_overgang_presset"), "rask avskjed skal gi reparasjonsgrenen dag 2");
assert.ok(!candidates.includes("d2_overgang_trygg"), "trygg gren skal ikke fyre etter rask avskjed");
assert.ok(!candidates.includes("d2_overgang_overlatt"), "overlatt gren skal ikke fyre etter rask avskjed");

console.log("civication lifestory barnehageassistent ok");
