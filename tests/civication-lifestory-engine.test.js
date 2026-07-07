#!/usr/bin/env node
// Civication v2 Life Story-motor: dekker de nye motorfunksjonene fra
// oppfølgeren til #1704 — scene conditions, thread state, day progression
// og konsekvenstekst. Bygger på den ekte Arealplanlegger-pakken.
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const Content = require("../js/Civication/lifestory/lifestoryContent.js");
const State = require("../js/Civication/lifestory/lifestoryState.js");
const Runner = require("../js/Civication/lifestory/lifestoryRunner.js");

const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const manifest = readJson("data/Civication/lifestory/manifest.json");
const roleEntry = manifest.roles.arealplanlegger;
const raw = {
  role: readJson(roleEntry.role),
  phaseDefinitions: readJson(manifest.shared.phaseDefinitions),
  roleThreads: readJson(roleEntry.threads),
  roleScenes: readJson(roleEntry.scenes),
  lifeThreads: readJson(manifest.life.threads),
  lifeScenes: readJson(manifest.life.scenes)
};
const content = Content.buildContent(raw);

// ============================================================
// 1. CONDITIONS — validering (fail fast) + evaluering
// ============================================================
(function conditionsValidation() {
  const bad = (mutate, re, msg) => assert.throws(() => {
    const b = JSON.parse(JSON.stringify(raw));
    mutate(b);
    Content.buildContent(b);
  }, re, msg);

  bad((b) => { b.roleScenes.scenes[0].conditions = { ukjent: {} }; }, /ukjent nøkkel/, "ukjent condition-nøkkel");
  bad((b) => { b.roleScenes.scenes[0].conditions = { meters: { ukjent_maaler: { min: 1 } } }; }, /ukjent nøkkel/, "ukjent måler i conditions");
  bad((b) => { b.roleScenes.scenes[0].conditions = { relasjoner: { ukjent_person: { min: 1 } } }; }, /ukjent nøkkel/, "ukjent relasjon i conditions");
  bad((b) => { b.roleScenes.scenes[0].conditions = { threads: { finnes_ikke: "active" } }; }, /ukjent tråd/, "ukjent tråd i conditions");
  bad((b) => { b.roleScenes.scenes[0].conditions = { threads: { skolevei_parkeringskjeller: "tullestatus" } }; }, /ugyldig status/, "ugyldig trådstatus");
  bad((b) => { b.roleScenes.scenes[0].conditions = { meters: { energi: { min: 80, max: 20 } } }; }, /min > max/, "min > max");
  bad((b) => { b.roleScenes.scenes[0].conditions = { meters: { energi: {} } }; }, /mangler både min og max/, "tom range");
  bad((b) => { b.roleScenes.scenes[0].conditions = { flagg: { x: { rart: true } } }; }, /finnes/, "ugyldig flagg-condition");
})();

(function conditionsEvaluation() {
  const scene = { conditions: {
    flagg: { tok_skolevei_alvorlig: true, aldri_satt: { finnes: false } },
    meters: { energi: { min: 40, max: 90 } },
    relasjoner: { plansjef: { min: 35 } },
    threads: { skolevei_parkeringskjeller: "active" }
  } };
  const base = State.createInitialState(content);
  base.tidligereValg.tok_skolevei_alvorlig = true;
  base.meters.energi = 71;
  assert.strictEqual(Runner.conditionsMet(base, scene), true, "alle betingelser oppfylt");

  // Flagg-verdi feil
  let s = State.createInitialState(content); s.tidligereValg.tok_skolevei_alvorlig = false; s.meters.energi = 71;
  assert.strictEqual(Runner.conditionsMet(s, scene), false, "feil flaggverdi");

  // finnes:false brutt
  s = State.createInitialState(content); s.tidligereValg.tok_skolevei_alvorlig = true; s.tidligereValg.aldri_satt = 1; s.meters.energi = 71;
  assert.strictEqual(Runner.conditionsMet(s, scene), false, "finnes:false brutt");

  // meter utenfor range
  s = State.createInitialState(content); s.tidligereValg.tok_skolevei_alvorlig = true; s.meters.energi = 95;
  assert.strictEqual(Runner.conditionsMet(s, scene), false, "energi over max");
  s.meters.energi = 30;
  assert.strictEqual(Runner.conditionsMet(s, scene), false, "energi under min");

  // relasjon under min
  s = State.createInitialState(content); s.tidligereValg.tok_skolevei_alvorlig = true; s.meters.energi = 71; s.relasjoner.plansjef = 10;
  assert.strictEqual(Runner.conditionsMet(s, scene), false, "plansjef under min");

  // thread status feil
  s = State.createInitialState(content); s.tidligereValg.tok_skolevei_alvorlig = true; s.meters.energi = 71;
  s.threadState.skolevei_parkeringskjeller.status = "dormant";
  assert.strictEqual(Runner.conditionsMet(s, scene), false, "tråd ikke active");

  // Ingen conditions => alltid sant
  assert.strictEqual(Runner.conditionsMet(base, {}), true, "scene uten conditions");
})();

// Betinget scenevalg i praksis: lav energi gir "sliten"-varianten av
// plansjefmøtet, høy energi gir normalvarianten.
(function conditionedSceneSelection() {
  // Plansjefmøtet ligger i formiddagsfasen.
  let s = State.createInitialState(content);
  s.fase = "formiddag";
  s.meters.energi = 50; // <=69
  let candidates = Runner.getCandidateScenes(s, content).map((x) => x.id);
  assert.ok(candidates.includes("plansjef_01_reaksjon_sliten"), "lav energi -> sliten-variant");
  assert.ok(!candidates.includes("plansjef_01_reaksjon"), "lav energi -> ikke normalvariant");

  s = State.createInitialState(content);
  s.fase = "formiddag";
  s.meters.energi = 80; // >=70
  candidates = Runner.getCandidateScenes(s, content).map((x) => x.id);
  assert.ok(candidates.includes("plansjef_01_reaksjon"), "høy energi -> normalvariant");
  assert.ok(!candidates.includes("plansjef_01_reaksjon_sliten"), "høy energi -> ikke sliten-variant");
})();

// ============================================================
// 2. THREAD STATE — status, step, choice-effekter
// ============================================================
(function threadState() {
  const s = State.createInitialState(content);
  const skolevei = s.threadState.skolevei_parkeringskjeller;
  assert.strictEqual(skolevei.status, "active");
  assert.strictEqual(skolevei.step, 0);
  assert.strictEqual(skolevei.lastSceneId, null);

  // stepDelta og lastSceneId oppdateres ved valg
  Runner.applyChoice(s, content, "privat_morgen_start", "rolig_start"); // fullfører daarlig_soevn
  assert.strictEqual(s.threadState.daarlig_soevn.status, "completed", "morgenvalg fullfører søvn-tråden");

  Runner.applyChoice(s, content, "skolevei_01_melding", "kartlegging");
  assert.strictEqual(s.threadState.skolevei_parkeringskjeller.step, 1, "stepDelta økte step");
  assert.strictEqual(s.threadState.skolevei_parkeringskjeller.lastSceneId, "skolevei_01_melding", "runneren fører lastSceneId");
  assert.strictEqual(s.threadState.skolevei_parkeringskjeller.status, "active", "fortsatt aktiv");
})();

// Escalated tråd er fortsatt spillbar; completed/dormant er det ikke.
(function threadPlayability() {
  const s = State.createInitialState(content);
  s.threadState.skolevei_parkeringskjeller.status = "escalated";
  assert.strictEqual(Runner.isThreadPlayable(s, "skolevei_parkeringskjeller"), true, "escalated er spillbar");
  s.threadState.skolevei_parkeringskjeller.status = "completed";
  assert.strictEqual(Runner.isThreadPlayable(s, "skolevei_parkeringskjeller"), false, "completed er ikke spillbar");
  s.threadState.skolevei_parkeringskjeller.status = "dormant";
  assert.strictEqual(Runner.isThreadPlayable(s, "skolevei_parkeringskjeller"), false, "dormant er ikke spillbar");
})();

// applyEffects avviser ugyldig trådstatus (fail fast, ingen gjetting)
(function threadEffectValidation() {
  const s = State.createInitialState(content);
  assert.throws(() => State.applyEffects(s, { threads: { skolevei_parkeringskjeller: { status: "tull" } } }),
    /ugyldig trådstatus/, "ukjent status avvises");
})();

// Kveldsscenen "jobben ble med hjem" krever eskalert skolevei-tråd.
(function privateWorkIntegration() {
  // Sti som eskalerer: be utbygger kommentere -> krev dokumentasjon
  const s = State.createInitialState(content);
  s.meters.energi = 80;
  Runner.applyChoice(s, content, "privat_morgen_start", "rolig_start");
  Runner.applyChoice(s, content, "skolevei_01_melding", "utbygger_kommentar"); // låser skolevei_02_utbygger
  Runner.applyChoice(s, content, "skolevei_02_utbygger", "krev_dokumentasjon"); // status -> escalated
  assert.strictEqual(s.threadState.skolevei_parkeringskjeller.status, "escalated");
  // Spol frem til kveld og sjekk at kveldsscenen er kandidat
  let guard = 0;
  while (s.fase !== "kveld" && !s.dagFerdig) {
    const scene = Runner.selectNextScene(s, content);
    if (!scene) break;
    Runner.applyChoice(s, content, scene.id, scene.valg[0].id);
    assert.ok(++guard < 40);
  }
  const kveldCandidates = Runner.getCandidateScenes(s, content).map((x) => x.id);
  assert.ok(kveldCandidates.includes("kveld_jobben_ble_med_hjem"), "eskalert sak følger med hjem om kvelden");

  // Motsatt: en sti uten eskalering viser IKKE kveldsscenen
  const s2 = State.createInitialState(content);
  s2.meters.energi = 80;
  Runner.applyChoice(s2, content, "privat_morgen_start", "rolig_start");
  Runner.applyChoice(s2, content, "skolevei_01_melding", "kartlegging");
  guard = 0;
  while (s2.fase !== "kveld" && !s2.dagFerdig) {
    const scene = Runner.selectNextScene(s2, content);
    if (!scene) break;
    Runner.applyChoice(s2, content, scene.id, scene.valg[0].id);
    assert.ok(++guard < 40);
  }
  const kveld2 = Runner.getCandidateScenes(s2, content).map((x) => x.id);
  assert.ok(!kveld2.includes("kveld_jobben_ble_med_hjem"), "uten eskalering: jobben blir ikke med hjem");
})();

// ============================================================
// 3. DAY PROGRESSION — completeDay / startNextDay
// ============================================================
(function dayProgression() {
  const s = State.createInitialState(content);
  s.meters.energi = 80;
  // Spill hele dag 1 deterministisk
  let guard = 0;
  while (!s.dagFerdig) {
    const scene = Runner.selectNextScene(s, content);
    assert.ok(scene, "scene finnes til dagen er ferdig");
    Runner.applyChoice(s, content, scene.id, scene.valg[0].id);
    assert.ok(++guard < 50);
  }
  const summary = Runner.getDaySummary(s);
  assert.strictEqual(summary.dag, 1);
  assert.ok(Object.keys(summary.meterEndringer).length > 0, "oppsummering viser meter-endringer");
  assert.ok(summary.valg.length >= 8, "oppsummering viser dagens valg");
  assert.ok("fullfoert" in summary.traader && "eskalert" in summary.traader && "hvilende" in summary.traader,
    "oppsummering grupperer tråder");
  // Minst én tråd ble fullført i løpet av dagen (nabomail/utbygger/politisk)
  assert.ok(summary.traader.fullfoert.length > 0, "minst én tråd fullført dag 1");

  const arkivFoer = s.arkiv.length;
  const valgFoer = Object.keys(s.tidligereValg).length;
  const dag1Arkiv = s.arkiv.filter((e) => e.dag === 1).length;

  // Start neste dag
  Runner.startNextDay(s, content);
  assert.strictEqual(s.dag, 2, "dag økte til 2");
  assert.strictEqual(s.fase, "morgen", "tilbake til første fase");
  assert.strictEqual(s.dagFerdig, false, "ny dag er ikke ferdig");
  assert.strictEqual(s.arkiv.length, arkivFoer, "arkivet beholdes");
  assert.strictEqual(s.arkiv.filter((e) => e.dag === 1).length, dag1Arkiv, "dag 1-arkiv er intakt");
  assert.strictEqual(Object.keys(s.tidligereValg).length, valgFoer, "tidligere valg beholdes");
  assert.deepStrictEqual(s.dagStartMeters, s.meters, "dagStartMeters nullstilt til nåværende");

  // Dag 2 har en stub-scene -> spillbar, ikke krasj
  const view = Runner.getView(s, content);
  assert.ok(view.scene, "dag 2 har en scene (stub)");
  assert.strictEqual(view.scene.dag, 2);
  assert.strictEqual(view.scene.id, "dag_02_ny_morgen");

  // Fullførte/dvale-tråder fra dag 1 dominerer ikke dag 2
  const aktiveTraaderDag2 = view.aktiveTraader.map((t) => t.id);
  assert.ok(!aktiveTraaderDag2.includes("lang_nabomail") || s.threadState.lang_nabomail.status !== "completed",
    "completed tråd vises ikke som aktiv");

  // startNextDay på en ikke-ferdig dag skal kaste
  assert.throws(() => Runner.startNextDay(s, content), /ikke ferdig/, "kan ikke hoppe til neste dag midt i dagen");

  // Spill dag 2-stubben og bekreft at den kan fullføres uten krasj
  Runner.applyChoice(s, content, "dag_02_ny_morgen", "moet_dagen");
  assert.strictEqual(s.dagFerdig, true, "dag 2-stub kan fullføres");
  const summary2 = Runner.getDaySummary(s);
  assert.strictEqual(summary2.dag, 2);
})();

// ============================================================
// 4. KONSEKVENSTEKST
// ============================================================
(function konsekvensTekst() {
  const s = State.createInitialState(content);
  const res = Runner.applyChoice(s, content, "privat_morgen_start", "dropp_frokost");
  assert.ok(res.konsekvensTekst && res.konsekvensTekst.includes("rumler"), "applyChoice returnerer konsekvensTekst");
  const arkivEntry = s.arkiv[s.arkiv.length - 1];
  assert.ok(arkivEntry.konsekvensTekst, "konsekvensTekst havner i arkivet");

  // Valg uten konsekvensTekst returnerer null, men er fortsatt gyldig
  const s2 = State.createInitialState(content);
  const res2 = Runner.applyChoice(s2, content, "privat_morgen_start", "rolig_start");
  assert.strictEqual(res2.konsekvensTekst, null, "valg uten konsekvensTekst gir null");
  assert.ok(!s2.arkiv[s2.arkiv.length - 1].konsekvensTekst, "ingen konsekvensTekst i arkiv når feltet mangler");

  // Tom konsekvensTekst er en innholdsfeil
  assert.throws(() => {
    const b = JSON.parse(JSON.stringify(raw));
    b.roleScenes.scenes[0].valg[0].konsekvensTekst = "  ";
    Content.buildContent(b);
  }, /konsekvensTekst/, "tom konsekvensTekst avvises");
})();

console.log("civication lifestory engine ok (conditions + thread state + day progression + konsekvenstekst)");
