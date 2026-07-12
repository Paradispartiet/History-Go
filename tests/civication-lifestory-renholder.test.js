#!/usr/bin/env node
// Civication Life Story: rolle nummer to — Renholder.
// Validerer fortellingspakken (de fire lovene via buildContent), spiller hele
// Dag 1 gjennom Day Runner, og verifiserer at Dag 2 forgrenes på Dag 1
// (avviksmelding => vernerunde-oppfølging, ikke glatt gulv-etterspillet).
// Verifiserer også at Min dag-UI-en kan velge rolle eksplisitt
// (?lifestoryRole= / localStorage) med arealplanlegger som uendret standard.
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
const roleEntry = manifest.roles.renholder;
assert.ok(roleEntry, "manifestet må ha rollen renholder");
assert.ok(manifest.roles.arealplanlegger, "pilotrollen skal fortsatt ligge i manifestet");

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
assert.strictEqual(content.role.id, "renholder");
assert.strictEqual(raw.roleThreads.threads.length, 5, "fem arbeidstråder for renholder");
assert.ok(content.threads.length >= 9, "arbeidstråder + delte privattråder");
assert.ok(raw.roleThreads.threads.every((t) => t.type === "arbeidsliv"), "rolletrådene er arbeidsliv");

// Rollens kjernekonflikter fra FWG-en er representert som tråder.
const threadIds = raw.roleThreads.threads.map((t) => t.id);
assert.deepStrictEqual(threadIds.sort(), [
  "rommet_som_saa_rent_ut", "ryggen_sier_fra", "soelet_i_fellesarealet",
  "tidsvinduet_krymper", "usynlig_arbeid"
].sort());

// Personene kommer fra rollens actor-grammatikk og finnes i startState.
for (const person of ["driftsleder", "erfaren_kollega", "kontorbruker", "verneombud"]) {
  assert.ok(typeof content.role.startState.relasjoner[person] === "number",
    `relasjonen ${person} mangler i startState`);
}

// Privatlivsscenene er rolle-agnostiske: ingen delt livsscene refererer
// rollespesifikke tråder i conditions (det ville brukket andre roller).
for (const scene of raw.lifeScenes.scenes) {
  for (const threadId of Object.keys(scene.conditions?.threads || {})) {
    assert.ok(raw.lifeThreads.threads.some((t) => t.id === threadId),
      `livsscene ${scene.id} betinger på ikke-delt tråd "${threadId}"`);
  }
}

// --- Dag 1: privat morgen først, deretter renholder-scenene ---
let state = State.createInitialState(content);
assert.strictEqual(state.rolle, "renholder");
assert.strictEqual(state.meters.penger, 340);
assert.strictEqual(state.meters.synlighet, 28, "usynlig arbeid: lav synlighet fra start");
assert.strictEqual(state.relasjoner.erfaren_kollega, 55);

let view = Runner.getView(state, content);
assert.strictEqual(view.scene.id, "privat_morgen_start", "dagen starter privat (delt livsscene)");

Runner.applyChoice(state, content, "privat_morgen_start", view.scene.valg[0].id);
view = Runner.getView(state, content);
assert.strictEqual(view.scene.id, "rommet_01_melding", "første jobbscene: rommet som så rent ut");

// Hygienisk rent-valget låser opp oppfølgingen med Kari i formiddagsfasen.
const integritetFoer = state.meters.integritet;
const result = Runner.applyChoice(state, content, "rommet_01_melding", "beroeringspunkter");
assert.deepStrictEqual(result.laasteOpp, ["rommet_02_standard"]);
assert.strictEqual(state.meters.integritet, integritetFoer + 5);
assert.strictEqual(state.tidligereValg.tok_hygienisk_rent, true);

// --- Spill resten av dag 1 deterministisk (alltid første valg) ---
// Første valg i soel_01_krise er meld_avvik => flagget meldte_avvik settes,
// og sølet-tråden eskalerer. Det er forgreningsgrunnlaget for dag 2.
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
for (const kjerne of ["rommet_01_melding", "rommet_02_standard", "tidsvindu_01_telefon", "soel_01_krise", "rygg_01_vurdering", "usynlig_01_melding"]) {
  assert.ok(spilteScener.includes(kjerne), `kjernescenen ${kjerne} ble spilt på dag 1`);
}
assert.strictEqual(state.tidligereValg.meldte_avvik, true, "første valg i sølet var å melde avvik");
assert.strictEqual(state.threadState.soelet_i_fellesarealet.status, "escalated");

// --- Dag 2 leser dag 1: avviket ble meldt => vernerunden, ikke etterspillet ---
State: {
  state = Runner.startNextDay(state, content);
}
assert.strictEqual(state.dag, 2);
const dag2Kandidater = Runner.getCandidateScenes(state, content).map((s) => s.id);
assert.ok(dag2Kandidater.includes("d2_avvik_fulgt_opp"),
  "meldt avvik => Ole følger opp med vernerunden");
assert.ok(!dag2Kandidater.includes("d2_glatt_gulv_etterspill"),
  "etterspill-scenen skal ikke være kandidat når avviket ble meldt");

// Spill dag 2 til ende — ingen krasj, og runde-med-Amina-scenen inngår.
guard = 0;
while (!state.dagFerdig) {
  const scene = Runner.selectNextScene(state, content);
  if (!scene) break; // tom fase avsluttes trygt av runneren via getView/advance
  Runner.applyChoice(state, content, scene.id, scene.valg[0].id);
  assert.ok(++guard < 50, "dag 2 må terminere");
}
assert.ok(state.arkiv.some((e) => e.sceneId === "d2_runde_med_amina"), "Amina-runden ble spilt på dag 2");

// --- Motsatt gren: ikke meldt avvik => etterspillet, ikke vernerunden ---
let state2 = State.createInitialState(content);
guard = 0;
while (!state2.dagFerdig) {
  const scene = Runner.selectNextScene(state2, content);
  assert.ok(scene, "dag 1 (gren 2) skal ha scener");
  // Velg tørk-og-gå i sølet, ellers første valg.
  const valgId = scene.id === "soel_01_krise" ? "toerk_og_gaa" : scene.valg[0].id;
  Runner.applyChoice(state2, content, scene.id, valgId);
  assert.ok(++guard < 50, "dag 1 (gren 2) må terminere");
}
assert.ok(!("meldte_avvik" in state2.tidligereValg), "avviket ble ikke meldt i gren 2");
state2 = Runner.startNextDay(state2, content);
const gren2Kandidater = Runner.getCandidateScenes(state2, content).map((s) => s.id);
assert.ok(gren2Kandidater.includes("d2_glatt_gulv_etterspill"),
  "ikke meldt avvik => Kari spør om det glatte gulvet");
assert.ok(!gren2Kandidater.includes("d2_avvik_fulgt_opp"),
  "vernerunde-scenen skal ikke være kandidat uten meldt avvik");

// --- Min dag-UI: rollevalg er eksplisitt, standard er uendret ---
const uiSource = fs.readFileSync(path.join(ROOT, "js/Civication/ui/CivicationLifestoryUI.js"), "utf8");
assert.ok(uiSource.includes('DEFAULT_ROLE_ID = "arealplanlegger"'),
  "standardrollen er fortsatt arealplanlegger");
assert.ok(uiSource.includes("lifestoryRole"), "rolle kan velges via ?lifestoryRole=");
assert.ok(uiSource.includes("civication_lifestory_role_v1"), "rollevalget persisteres i localStorage");

console.log("civication lifestory renholder ok (" + state.arkiv.length + " scener over 2 dager, begge dag-2-grener verifisert)");
