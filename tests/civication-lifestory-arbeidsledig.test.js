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

// --- 6. Delte livsscener er livssituasjon-nøytrale ---
// De spilles av ALLE roller — også arbeidsledig. Ingen delt scene/tråd kan
// anta jobb, pendling, lønning eller en bestemt rolle (bugen som ble funnet:
// «frokost, dusj, gå til jobben» + «Kontoen viser 420 kroner» for en
// arbeidsledig spiller med 240 PC).
{
  const lifeScenes = readJson(manifest.life.scenes);
  const lifeThreads = readJson(manifest.life.threads);
  const FORBUDT = [
    "til jobben", "jobben din", "etter jobb", "på jobb", "kontoret",
    "lønning", "planlegger", "plansjef", "skolevei", "utbygger",
    "toget", "kroner til over helgen"
  ];
  const tekster = [];
  for (const t of lifeThreads.threads) tekster.push(t.tittel, t.konflikt, ...(t.muligeRetninger || []));
  for (const sc of lifeScenes.scenes) {
    tekster.push(sc.tittel, sc.tekst);
    for (const v of sc.valg || []) tekster.push(v.tekst, v.konsekvensTekst || "");
  }
  const alt = tekster.join(" || ").toLowerCase();
  for (const ord of FORBUDT) {
    assert.ok(!alt.includes(ord.toLowerCase()),
      `delt livsscene/tråd antar jobb eller rolle: fant «${ord}»`);
  }

  // Kvalitetskrav: hvert valg i delte livsscener har konsekvenstekst.
  for (const sc of lifeScenes.scenes) {
    for (const v of sc.valg || []) {
      assert.ok(typeof v.konsekvensTekst === "string" && v.konsekvensTekst.trim(),
        `livsscene ${sc.id}/${v.id} mangler konsekvensTekst`);
    }
  }

  // Jobben først: private scener i arbeidsfasene (formiddag/ettermiddag) skal
  // ha lav prioritet (<= 5) så rollescenene alltid spilles først i fasen.
  for (const sc of lifeScenes.scenes) {
    if (sc.fase === "formiddag" || sc.fase === "ettermiddag") {
      assert.ok((sc.prioritet || 0) <= 5,
        `livsscene ${sc.id} (${sc.fase}) har prioritet ${sc.prioritet} — private scener skal ligge etter jobben`);
    }
  }
}

// --- 6b. Søvn-arcen: kvelden avgjør natten, natten avgjør morgenen ---
// Dag 1-nattscenen setter ALLTID enten la_deg_i_tide eller sen_kveld, og
// dag 2-morgenen har én scene per gren. Ro-regelen gjelder også lav energi:
// den energigatede kveldsscenen skal aldri gi mer press (ingen negative
// energi/psyke-deltaer).
{
  const lifeScenes = readJson(manifest.life.scenes);
  const byId = (id) => lifeScenes.scenes.find((s) => s.id === id);

  const natt = byId("natt_01_paa_tide_aa_sove");
  assert.ok(natt && natt.dag === 1 && natt.fase === "kveld", "dag 1 har en nattscene i kveldsfasen");
  for (const v of natt.valg) {
    const flagg = v.effekter?.flagg || {};
    assert.ok(flagg.la_deg_i_tide === true || flagg.sen_kveld === true,
      `nattvalget ${v.id} må sette la_deg_i_tide eller sen_kveld — dag 2-morgenen leser natten`);
  }
  const uthvilt = byId("d2_morgen_uthvilt");
  const tung = byId("d2_morgen_tung_start");
  assert.strictEqual(uthvilt?.conditions?.flagg?.la_deg_i_tide, true, "uthvilt-morgenen krever la_deg_i_tide");
  assert.strictEqual(tung?.conditions?.flagg?.sen_kveld, true, "tung-morgenen krever sen_kveld");

  const roScene = byId("d2_kveld_kroppen_sier_fra");
  assert.ok(roScene?.conditions?.meters?.energi?.max <= 45, "kropps-scenen er gated på lav energi");
  for (const v of roScene.valg) {
    for (const [meter, delta] of Object.entries(v.effekter?.meters || {})) {
      if (meter === "energi" || meter === "psyke") {
        assert.ok(delta > 0, `lav energi gir ro, aldri mer press: ${v.id} har ${meter} ${delta}`);
      }
    }
  }
}

// --- 6c. «Dine egne timer»: hvert dag 1-valg har en dag 2-gren som lukker ---
// Kalender/rutine-arcen: dag 1-morgenscenen setter alltid nøyaktig ett av
// grenflaggene, og hver gren har sin egen dag 2-scene som leser flagget og
// lukker tråden. Ingen gren skal etterlate tråden åpen uten oppfølging.
{
  const lifeScenes = readJson(manifest.life.scenes);
  const byId = (id) => lifeScenes.scenes.find((s) => s.id === id);

  const plan = byId("morgen_01_din_egen_plan");
  assert.ok(plan && plan.dag === 1 && plan.fase === "morgen", "dag 1 har kalender/rutine-scenen om morgenen");
  const GREN_TIL_SCENE = {
    egen_time_satt: "d2_ettermiddag_timen_din",
    lot_dagen_bestemme: "d2_ettermiddag_rommet_som_forsvant",
    fylte_lista: "d2_ettermiddag_lista_moeter_veggen"
  };
  const setteFlagg = plan.valg.map((v) => {
    const flagg = Object.keys(v.effekter?.flagg || {}).filter((f) => GREN_TIL_SCENE[f]);
    assert.strictEqual(flagg.length, 1, `planvalget ${v.id} må sette nøyaktig ett grenflagg`);
    return flagg[0];
  });
  assert.strictEqual(new Set(setteFlagg).size, Object.keys(GREN_TIL_SCENE).length,
    "dag 1-valgene dekker alle tre grenene");
  for (const [flagg, sceneId] of Object.entries(GREN_TIL_SCENE)) {
    const gren = byId(sceneId);
    assert.ok(gren && gren.dag === 2, `grenscenen ${sceneId} finnes på dag 2`);
    assert.strictEqual(gren.conditions?.flagg?.[flagg], true, `${sceneId} leser flagget ${flagg}`);
    for (const v of gren.valg) {
      assert.strictEqual(v.effekter?.threads?.dine_egne_timer?.status, "completed",
        `${sceneId}/${v.id} skal lukke dine_egne_timer — hver gren får en slutt`);
    }
  }
}

// --- 7. Delt privat persongalleri: venn + familie i ALLE roller ---
// De delte livsscenene refererer avsenderne «venn» (Jonas) og «familie»
// (Søsteren din) og flytter relasjonene deres. Da må hver rolle — også
// arbeidsledig — ha begge i personer og en tallverdi i startState.relasjoner,
// ellers spilles scenene mot personer som ikke finnes.
for (const [roleId, entry] of Object.entries(manifest.roles)) {
  const role = readJson(entry.role);
  for (const [personId, navn] of [["venn", "Jonas"], ["familie", "Søsteren din"]]) {
    const person = (role.personer || []).find((p) => p.id === personId);
    assert.ok(person, `rollen ${roleId} mangler den delte personen «${personId}»`);
    assert.strictEqual(person.navn, navn,
      `rollen ${roleId}: «${personId}» skal hete «${navn}» i alle roller (delt cast)`);
    assert.strictEqual(typeof role.startState?.relasjoner?.[personId], "number",
      `rollen ${roleId} mangler startrelasjon for «${personId}»`);
  }
}

// --- 8. Pakken peker mot den faktiske mekanikken: kunnskap/merker -> jobb ---
const scenesText = JSON.stringify(raw.roleScenes);
assert.ok(/[Kk]unnskap/.test(scenesText) && /merke/i.test(scenesText),
  "arbeidsledig-dagene peker spilleren mot kunnskap/merker — veien til jobbtilbud");

console.log("civication lifestory arbeidsledig ok (startkontrakt: arbeidsledig -> quiz/merker -> jobb)");
