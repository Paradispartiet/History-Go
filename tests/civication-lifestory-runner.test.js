#!/usr/bin/env node
// Civication Life Story System: validerer fortellingspakken for
// arealplanlegger (de fire lovene) og spiller en hel Dag 1 gjennom
// Day Runner — morgen til kveld, med valg, konsekvenser og opplåsing.
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
const roleEntry = manifest.roles.arealplanlegger;
assert.ok(roleEntry, "manifestet må ha rollen arealplanlegger");

const raw = {
  role: readJson(roleEntry.role),
  phaseDefinitions: readJson(manifest.shared.phaseDefinitions),
  roleThreads: readJson(roleEntry.threads),
  roleScenes: readJson(roleEntry.scenes),
  lifeThreads: readJson(manifest.life.threads),
  lifeScenes: readJson(manifest.life.scenes)
};

// --- Innholdspakken består de fire lovene (buildContent kaster ellers) ---
const content = Content.buildContent(raw);
assert.strictEqual(content.role.id, "arealplanlegger");
assert.strictEqual(content.faser.length, 4, "fire faser i en dag");
assert.ok(content.threads.length >= 9, "5 arbeidstråder + 4 privattråder");
assert.ok(content.threads.every((t) => String(t.konflikt).trim().length > 0), "ingen tråd uten konflikt");
assert.ok(content.scenes.every((s) => content.threads.some((t) => t.id === s.threadId)), "ingen scene uten tråd");
for (const scene of content.scenes) {
  for (const valg of scene.valg) {
    assert.ok(valg.effekter && typeof valg.effekter === "object", `${scene.id}/${valg.id}: valg uten konsekvens`);
  }
}

// --- Validatoren feiler fast på lovbrudd ---
assert.throws(() => {
  const broken = JSON.parse(JSON.stringify(raw));
  broken.roleThreads.threads[0].konflikt = "";
  Content.buildContent(broken);
}, /konflikt/, "tråd uten konflikt skal kaste");
assert.throws(() => {
  const broken = JSON.parse(JSON.stringify(raw));
  // scenes[1] = skolevei_02_kartlegging; valget har ingen laaserOpp,
  // så tomme effekter er et rent lov 2-brudd.
  broken.roleScenes.scenes[1].valg[0].effekter = {};
  Content.buildContent(broken);
}, /lov 2/, "valg uten state-endring skal kaste");
assert.throws(() => {
  const broken = JSON.parse(JSON.stringify(raw));
  broken.roleScenes.scenes[0].threadId = "finnes_ikke";
  Content.buildContent(broken);
}, /lov 3/, "scene med ukjent tråd skal kaste");
assert.throws(() => {
  const broken = JSON.parse(JSON.stringify(raw));
  broken.roleScenes.scenes[0].valg[0].effekter.meters = { ukjent_maaler: 5 };
  Content.buildContent(broken);
}, /ukjent måler/, "ukjent måler skal kaste — ingen gjetting");

// --- Player State fra rollepakken ---
let state = State.createInitialState(content);
assert.strictEqual(state.dag, 1);
assert.strictEqual(state.fase, "morgen");
assert.strictEqual(state.meters.penger, 420);
assert.strictEqual(state.relasjoner.skolekontakt, 60);
const dag1Traader = content.threads.filter((t) => (typeof t.startDag === "number" ? t.startDag : 1) <= 1);
assert.strictEqual(Object.keys(state.threadState).length, dag1Traader.length, "alle dag-1-tråder har threadState");
assert.ok(Object.values(state.threadState).every((ts) => ts.status === "active"), "alle starter aktive");

// --- Morgen: privat start har høyest prioritet, så skoleveimeldingen ---
let view = Runner.getView(state, content);
assert.strictEqual(view.scene.id, "privat_morgen_start", "dagen starter privat");
assert.ok(view.aktiveTraader.length >= 9);
assert.ok(view.dagsplan.length === 3, "dagsplanen for dag 1 vises");
assert.ok(view.senereIDag.some((s) => s.fase === "ettermiddag"), "senere i dag viser kommende scener");

const energiFoer = state.meters.energi;
Runner.applyChoice(state, content, "privat_morgen_start", "rolig_start");
assert.strictEqual(state.meters.energi, energiFoer + 4, "valget endret state");
assert.strictEqual(state.meters.penger, 380, "frokosten kostet penger");
assert.strictEqual(state.tidligereValg.tok_rolig_morgen, true, "valget ble husket");

view = Runner.getView(state, content);
assert.strictEqual(view.scene.id, "skolevei_01_melding");

// Valget låser opp oppfølgingsscenen i formiddagsfasen (steg 8 i runneren).
const skolekontaktFoer = state.relasjoner.skolekontakt;
const result = Runner.applyChoice(state, content, "skolevei_01_melding", "kartlegging");
assert.deepStrictEqual(result.laasteOpp, ["skolevei_02_kartlegging"]);
assert.strictEqual(state.relasjoner.skolekontakt, skolekontaktFoer + 10);
assert.strictEqual(state.tidligereValg.tok_skolevei_alvorlig, true);

// Morgenen er ikke tom ennå: kalender/rutine-scenen («Dine egne timer»)
// ligger sist i fasen. Først når den er spilt skifter fasen.
assert.strictEqual(result.faseSkifte, false, "kalenderscenen gjenstår i morgenfasen");
assert.strictEqual(state.fase, "morgen");
view = Runner.getView(state, content);
assert.strictEqual(view.scene.id, "morgen_01_din_egen_plan", "privat kalenderscene spilles sist i morgenen");
const planResult = Runner.applyChoice(state, content, "morgen_01_din_egen_plan", "sette_av_en_time");
assert.strictEqual(planResult.faseSkifte, true, "morgenen er tom -> formiddag");
assert.strictEqual(state.fase, "formiddag");

// De andre skolevei-oppfølgerne skal IKKE være tilgjengelige (ikke låst opp).
const kandidater = Runner.getCandidateScenes(state, content).map((s) => s.id);
assert.ok(kandidater.indexOf("skolevei_02_kartlegging") !== -1);
assert.ok(kandidater.indexOf("skolevei_02_plansjef") === -1, "ikke-opplåste scener holdes låst");

// --- Spill resten av dagen deterministisk (alltid første valg) ---
let guard = 0;
while (!state.dagFerdig) {
  const scene = Runner.selectNextScene(state, content);
  assert.ok(scene, "det skal alltid finnes en scene til dagen er ferdig");
  Runner.applyChoice(state, content, scene.id, scene.valg[0].id);
  assert.ok(++guard < 50, "dagen må terminere");
}

// --- Dagen er ferdig: alle faser besøkt, arkivet er komplett ---
assert.strictEqual(state.dagFerdig, true);
const spilteFaser = new Set(state.arkiv.map((entry) => entry.fase));
assert.deepStrictEqual([...spilteFaser].sort(), ["ettermiddag", "formiddag", "kveld", "morgen"], "alle fire faser ble spilt");
assert.ok(state.arkiv.length >= 8, "minst åtte scener i løpet av dagen, fikk " + state.arkiv.length);
assert.ok(state.arkiv.some((entry) => entry.sceneId === "dag_01_oppsummering"), "dagen slutter med refleksjon");

const oppsummering = Runner.getDaySummary(state);
assert.strictEqual(oppsummering.dag, 1);
assert.ok(Object.keys(oppsummering.meterEndringer).length > 0, "dagen flyttet målerne");
assert.strictEqual(oppsummering.valg.length, state.arkiv.length);

// Ferdig dag => ingen nå-scene, men oppsummering i view.
view = Runner.getView(state, content);
assert.strictEqual(view.scene, null);
assert.ok(view.oppsummering, "kveldsvisningen får dagens oppsummering");

// En spilt scene kan ikke spilles igjen.
assert.throws(() => Runner.applyChoice(state, content, "privat_morgen_start", "rolig_start"), /allerede spilt/);

console.log("civication lifestory runner ok (" + state.arkiv.length + " scener spilt)");
