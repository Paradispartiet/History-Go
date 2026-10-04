#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const Content = require("../js/Civication/lifestory/lifestoryContent.js");
const State = require("../js/Civication/lifestory/lifestoryState.js");
const Runner = require("../js/Civication/lifestory/lifestoryRunner.js");
const Endings = require("../js/Civication/lifestory/lifestoryEndings.js");
const root = path.join(__dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const manifest = read("data/Civication/lifestory/manifest.json");
const entry = manifest.roles.arbeidsledig;
const raw = { role: read(entry.role), phaseDefinitions: read(manifest.shared.phaseDefinitions), roleThreads: read(entry.threads), roleScenes: read(entry.scenes), lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes) };
const content = Content.buildContent(raw);
const roleIds = new Set(raw.roleScenes.scenes.map((s) => s.id));
const seen = new Set();
const paths = [{}, { d2_en_retning: "miljo" }, { d2_en_retning: "kunnskap" }];
let runs = 0;
function play(overrides) {
  let state = State.createInitialState(content);
  const actual = {};
  for (let day = 1; day <= 7; day++) {
    assert.equal(state.dag, day);
    assert.equal(state.dagFerdig, false, `dag ${day} har innhold`);
    let guard = 0;
    while (!state.dagFerdig) {
      const scene = Runner.selectNextScene(state, content);
      assert.ok(scene);
      const choice = scene.valg.find((v) => v.id === overrides[scene.id]) || scene.valg[0];
      if (roleIds.has(scene.id)) {
        const key = scene.id + ":" + choice.id;
        if (!seen.has(key)) {
          seen.add(key);
          for (const alt of scene.valg) {
            if (alt.id !== choice.id && !seen.has(scene.id + ":" + alt.id)) paths.push({ ...actual, [scene.id]: alt.id });
          }
        }
        actual[scene.id] = choice.id;
      }
      Runner.applyChoice(state, content, scene.id, choice.id);
      // Persisterbar state gjenlastes etter HVERT valg. Ingen hukommelse
      // kan gjemme seg i en modul/global eller lukkes over av en callback.
      state = JSON.parse(JSON.stringify(state));
      State.reconcileContent(state, content);
      const memory = Runner.getSymposium(state, content);
      assert.deepEqual(memory.tidslinje.map((e) => e.sceneId), state.arkiv.map((e) => e.sceneId));
      if (scene.id === "d3_soknad_uten_svar") assert.ok(!Runner.getCandidateScenes(state, content).some((s) => s.id === "d3_soknad_svar"), "et svar sendt nå gir ikke avslag i samme fase");
      if (state.tidligereValg.booking_avslaatt || state.tidligereValg.musikk_hjemme) assert.ok(!state.spilteScener.includes("d6_spillejobben"));
      if (state.tidligereValg.amir_trakk_seg) assert.ok(!state.spilteScener.includes("d5_amir_oppmotet"));
      if (state.tidligereValg.utsatte_meldekortet) assert.ok(!state.spilteScener.includes("d2_meldekort_ok"), "sendt dag 2 må ikke bli en dag 1-kvittering");
      assert.ok(++guard < 90);
    }
    if (day < 7) {
      assert.equal(Endings.isFinalDay(state, content), false);
      Runner.startNextDay(state, content);
    }
  }
  assert.equal(Endings.isFinalDay(state, content), true);
  assert.ok(state.tidligereValg.arbeidsledig_uke_avsluttet);
  return state;
}
// Finner en kjørbar prefix for hvert valg vi møter, heller enn å gjøre
// antatte fremtidshendelser tilgjengelige ved å seede flagg.
while (paths.length) { play(paths.shift()); assert.ok(++runs < 350); }
for (const scene of raw.roleScenes.scenes.filter((s) => s.id !== "d4_eldre_historie_videre")) {
  for (const choice of scene.valg) assert.ok(seen.has(scene.id + ":" + choice.id), `uavspilt gren: ${scene.id}/${choice.id}`);
}
// Rollebroene må faktisk treffe de eksisterende canonicale pakkene.
for (const bridge of raw.role.symposium.rollebroer) {
  assert.equal(read(bridge.role_world).role_scope, bridge.role_scope);
  assert.ok(read(bridge.narrative).storylets.length);
}
// Fremtidig konsert, gammel knapp og feil gren får ikke skrive historien.
const start = State.createInitialState(content);
const before = JSON.stringify(start);
assert.throws(() => Runner.applyChoice(start, content, "d6_spillejobben", "folges_opp"), /ikke tilgjengelig nå/);
assert.equal(JSON.stringify(start), before);
// Nye kontakter fylles inn uten å endre en legacy-save eller vekke en
// fullført tråd. Dag 4 har en eksplisitt videreføring uten fiktive fortidsmøter.
const legacy = play({ d2_en_retning: "kunnskap" });
legacy.dag = 3; legacy.dagFerdig = true;
legacy.arkiv = legacy.arkiv.filter((e) => e.dag <= 3);
legacy.spilteScener = legacy.arkiv.map((e) => e.sceneId);
delete legacy.tidligereValg.arbeidsledig_hovedtraad;
delete legacy.relasjoner.mira; delete legacy.relasjoner.amir; delete legacy.relasjoner.booker;
delete legacy.threadState.ugens_retning;
const archive = JSON.stringify(legacy.arkiv);
State.reconcileContent(legacy, content);
assert.equal(JSON.stringify(legacy.arkiv), archive);
assert.equal(legacy.threadState.nav_og_meldekortet.status, "completed");
Runner.startNextDay(legacy, content);
while (!legacy.dagFerdig) { const sc = Runner.selectNextScene(legacy, content); Runner.applyChoice(legacy, content, sc.id, sc.valg[0].id); }
assert.ok(legacy.spilteScener.includes("d4_eldre_historie_videre"));
assert.equal(legacy.tidligereValg.arbeidsledig_hovedtraad, "kunnskapen_og_soknadene");
// Virkelig storage-API: save -> load -> samme historiebok etter module-reload.
const storage = new Map();
function storageModule() {
  const sandbox = { module: { exports: {} }, localStorage: { getItem: (k) => storage.get(k) || null, setItem: (k, v) => storage.set(k, v), removeItem: (k) => storage.delete(k) } };
  vm.runInNewContext(fs.readFileSync(path.join(root, "js/Civication/lifestory/lifestoryState.js"), "utf8"), sandbox);
  return sandbox.module.exports;
}
storageModule().save(legacy);
assert.equal(JSON.stringify(Runner.getSymposium(storageModule().load(), content)), JSON.stringify(Runner.getSymposium(legacy, content)));
for (const [field, value] of [["standardTraad", "ukjent"]]) {
  const bad = JSON.parse(JSON.stringify(raw)); bad.role.symposium[field] = value;
  assert.throws(() => Content.buildContent(bad), /symposium/);
}
const bad = JSON.parse(JSON.stringify(raw)); bad.roleScenes.scenes[0].stedId = "ukjent";
assert.throws(() => Content.buildContent(bad), /ukjent sted/);
console.log(`arbeidsledig symposium ok: ${runs} hele uker, ${seen.size} rollevalg, legacy-save og storage-reload`);
