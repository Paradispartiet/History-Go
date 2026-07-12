#!/usr/bin/env node
// Civication Life Story: rolle nummer tre — Ekspeditør.
// Validerer fortellingspakken (de fire lovene via buildContent), spiller hele
// Dag 1 gjennom Day Runner, og verifiserer at Dag 2 forgrenes på Dag 1
// (full lukking => Lene har lagt merke til det; kuttet lukking => rotet
// venter). Verifiserer også jobb->rolle-bindingen i manifestet.
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
const roleEntry = manifest.roles.ekspeditor;
assert.ok(roleEntry, "manifestet må ha rollen ekspeditor");
assert.strictEqual(roleEntry.role_scope, "ekspeditor",
  "jobb-broen: ekspeditør-jobben i skallet må binde til denne rollen");

const raw = {
  role: readJson(roleEntry.role),
  phaseDefinitions: readJson(manifest.shared.phaseDefinitions),
  roleThreads: readJson(roleEntry.threads),
  roleScenes: readJson(roleEntry.scenes),
  lifeThreads: readJson(manifest.life.threads),
  lifeScenes: readJson(manifest.life.scenes)
};

// --- Pakken består de fire lovene (buildContent kaster ellers) ---
const content = Content.buildContent(raw);
assert.strictEqual(content.role.id, "ekspeditor");
assert.strictEqual(raw.roleThreads.threads.length, 5, "fem arbeidstråder for ekspeditør");
assert.ok(raw.roleThreads.threads.every((t) => t.type === "arbeidsliv"), "rolletrådene er arbeidsliv");

// Trådene speiler mail-familienes univers (kasse/pris, kunde, kollega, lager, lukking).
const threadIds = raw.roleThreads.threads.map((t) => t.id);
assert.deepStrictEqual(threadIds.sort(), [
  "kunden_som_tror_du_bestemmer", "lukkingen", "ny_kollega_og_tillit",
  "prisfeilen_i_koen", "varen_som_ikke_finnes"
].sort());

// Personene er mail-familienes faste cast og finnes i startState.
for (const person of ["butikksjef", "erfaren_kollega", "ny_kollega", "stamkunde"]) {
  assert.ok(typeof content.role.startState.relasjoner[person] === "number",
    `relasjonen ${person} mangler i startState`);
}

// Delte livsscener betinger fortsatt bare på delte tråder (regel fra renholder).
for (const scene of raw.lifeScenes.scenes) {
  for (const threadId of Object.keys(scene.conditions?.threads || {})) {
    assert.ok(raw.lifeThreads.threads.some((t) => t.id === threadId),
      `livsscene ${scene.id} betinger på ikke-delt tråd "${threadId}"`);
  }
}

// --- Dag 1: privat morgen først, deretter Lenes kasseøkt-brief ---
let state = State.createInitialState(content);
assert.strictEqual(state.rolle, "ekspeditor");
assert.strictEqual(state.meters.penger, 360);
assert.strictEqual(state.relasjoner.erfaren_kollega, 55);

let view = Runner.getView(state, content);
assert.strictEqual(view.scene.id, "privat_morgen_start", "dagen starter privat (delt livsscene)");
Runner.applyChoice(state, content, "privat_morgen_start", view.scene.valg[0].id);

view = Runner.getView(state, content);
assert.strictEqual(view.scene.id, "apning_01_forste_okt", "første jobbscene: første kasseøkt");

// Grundig åpning låser opp prisfeil-krisen i formiddagsfasen.
const result = Runner.applyChoice(state, content, "apning_01_forste_okt", "sjekk_plakatene");
assert.deepStrictEqual(result.laasteOpp, ["prisfeil_02_koen"]);
assert.strictEqual(state.tidligereValg.sjekket_priser_foer_aapning, true);

// --- Gren 1: spill dag 1 med FULL lukking (første valg overalt,
//     som gir full_lukking i lukking_01 => ryddet_for_neste_skift) ---
let guard = 0;
while (!state.dagFerdig) {
  const scene = Runner.selectNextScene(state, content);
  assert.ok(scene, "det skal alltid finnes en scene til dagen er ferdig");
  Runner.applyChoice(state, content, scene.id, scene.valg[0].id);
  assert.ok(++guard < 50, "dagen må terminere");
}
const spilteFaser = new Set(state.arkiv.map((entry) => entry.fase));
assert.deepStrictEqual([...spilteFaser].sort(), ["ettermiddag", "formiddag", "kveld", "morgen"],
  "alle fire faser ble spilt");
const spilteScener = state.arkiv.map((e) => e.sceneId);
for (const kjerne of ["apning_01_forste_okt", "prisfeil_02_koen", "ny_kollega_01_midt_i_koen", "varen_01_som_ikke_finnes", "retur_01_uten_kvittering", "lukking_01_fem_minutter"]) {
  assert.ok(spilteScener.includes(kjerne), `kjernescenen ${kjerne} ble spilt på dag 1`);
}
assert.strictEqual(state.tidligereValg.ryddet_for_neste_skift, true, "første valg i lukkingen var full lukking");

state = Runner.startNextDay(state, content);
assert.strictEqual(state.dag, 2);
const dag2Kandidater = Runner.getCandidateScenes(state, content).map((s) => s.id);
assert.ok(dag2Kandidater.includes("d2_morgen_lukkingen_synes"),
  "full lukking => Lene har lagt merke til det");
assert.ok(!dag2Kandidater.includes("d2_morgen_rotet_etter_deg"),
  "rotet-scenen skal ikke være kandidat etter full lukking");

// Spill dag 2 til ende — nøkkel-scenen inngår.
guard = 0;
while (!state.dagFerdig) {
  const scene = Runner.selectNextScene(state, content);
  if (!scene) break;
  Runner.applyChoice(state, content, scene.id, scene.valg[0].id);
  assert.ok(++guard < 50, "dag 2 må terminere");
}
assert.ok(state.arkiv.some((e) => e.sceneId === "d2_ettermiddag_nokkelen"), "nøkkelen til disken ble spilt på dag 2");

// --- Gren 2: kuttet lukking OG bøyd regel => rot-morgen og kassadifferanse ---
let state2 = State.createInitialState(content);
guard = 0;
while (!state2.dagFerdig) {
  const scene = Runner.selectNextScene(state2, content);
  assert.ok(scene, "dag 1 (gren 2) skal ha scener");
  let valgId = scene.valg[0].id;
  if (scene.id === "lukking_01_fem_minutter") valgId = "kutt_hjornene";
  if (scene.id === "retur_01_uten_kvittering") valgId = "boy_regelen";
  Runner.applyChoice(state2, content, scene.id, valgId);
  assert.ok(++guard < 50, "dag 1 (gren 2) må terminere");
}
assert.ok(!("ryddet_for_neste_skift" in state2.tidligereValg), "lukkingen ble kuttet i gren 2");
assert.strictEqual(state2.threadState.kunden_som_tror_du_bestemmer.status, "escalated");

state2 = Runner.startNextDay(state2, content);
const gren2Kandidater = Runner.getCandidateScenes(state2, content).map((s) => s.id);
assert.ok(gren2Kandidater.includes("d2_morgen_rotet_etter_deg"),
  "kuttet lukking => Lene spør om åpningen som ble tung");
assert.ok(!gren2Kandidater.includes("d2_morgen_lukkingen_synes"),
  "ros-scenen skal ikke være kandidat etter kuttet lukking");

// Kvelden: den eskalerte returen gir kassadifferanse-refleksjonen.
guard = 0;
while (!state2.dagFerdig) {
  const scene = Runner.selectNextScene(state2, content);
  if (!scene) break;
  Runner.applyChoice(state2, content, scene.id, scene.valg[0].id);
  assert.ok(++guard < 50, "dag 2 (gren 2) må terminere");
}
assert.ok(state2.arkiv.some((e) => e.sceneId === "d2_kveld_kassadifferansen"),
  "bøyd regel => kassadifferansen følger deg hjem på dag 2");

console.log("civication lifestory ekspeditor ok (" + state.arkiv.length + " scener over 2 dager, begge dag-2-grener verifisert)");
