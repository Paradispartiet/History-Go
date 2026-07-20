#!/usr/bin/env node
// Dag 3-kontrakten: tredje dagen finnes for ALLE roller og ALLE grener.
// Tråden «uka_videre» (startDag 3, ubetinget morgen- og kveldsscene) er
// garantien: uansett hvilke valg dag 1-2 tok, er dag 3 aldri en tom dag som
// avsluttes før den har begynt. I tillegg: hver rolle har et rolleanker på
// en levende rolletråd (jobben først), arbeidsledig får søknadssvar-payoff
// som peker mot merker/kunnskap, og økonomi-purringen fyrer KUN på den
// eskalerte grenen (den som skjøv regningen unna).
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const Content = require("../js/Civication/lifestory/lifestoryContent.js");
const State = require("../js/Civication/lifestory/lifestoryState.js");
const Runner = require("../js/Civication/lifestory/lifestoryRunner.js");

const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const manifest = readJson("data/Civication/lifestory/manifest.json");

function buildContent(roleId) {
  const e = manifest.roles[roleId];
  return Content.buildContent({
    role: readJson(e.role),
    phaseDefinitions: readJson(manifest.shared.phaseDefinitions),
    roleThreads: readJson(e.threads),
    roleScenes: readJson(e.scenes),
    lifeThreads: readJson(manifest.life.threads),
    lifeScenes: readJson(manifest.life.scenes)
  });
}

/**
 * Spill en hel dag med en valgstrategi. Returnerer scene-id-ene som ble spilt.
 * @param {any} state @param {any} content @param {(scene: any) => string} pick
 */
function playDay(state, content, pick) {
  const spilt = [];
  let guard = 0;
  while (!state.dagFerdig) {
    const scene = Runner.selectNextScene(state, content);
    assert.ok(scene, "det skal alltid finnes en scene til dagen er ferdig");
    spilt.push(scene.id);
    Runner.applyChoice(state, content, scene.id, pick(scene));
    assert.ok(++guard < 90, "dagen må terminere");
  }
  return spilt;
}

const foersteValg = (scene) => scene.valg[0].id;
const sisteValg = (scene) => scene.valg[scene.valg.length - 1].id;

// Rolleankeret på dag 3 (levende rolletråd på førstevalg-grenen).
const ANKER = {
  arbeidsledig: ["d3_soknad_svar", "d3_det_du_kan"],
  renholder: ["d3_rom_204_klagen"],
  ekspeditor: ["d3_stamkunden_prismatch"],
  arealplanlegger: ["d3_utbygger_purrer"]
};

for (const roleId of Object.keys(manifest.roles)) {
  const content = buildContent(roleId);

  // --- Gren A: første valg hele veien ---
  let st = State.createInitialState(content);
  playDay(st, content, foersteValg);
  st = Runner.startNextDay(st, content);
  playDay(st, content, foersteValg);
  st = Runner.startNextDay(st, content);
  assert.strictEqual(st.dag, 3, roleId + ": dag 3 starter");
  assert.strictEqual(st.dagFerdig, false, roleId + ": dag 3 skal IKKE være tom (gren A)");
  const spiltA = playDay(st, content, foersteValg);
  assert.ok(spiltA.includes("d3_morgen_tredje_dagen"), roleId + ": uka_videre-morgenen spilles");
  assert.ok(spiltA.includes("d3_kveld_uka_saa_langt"), roleId + ": uka_videre-kvelden lukker dagen");
  for (const anker of ANKER[roleId] || []) {
    assert.ok(spiltA.includes(anker), roleId + ": rolleankeret " + anker + " spilles på dag 3 (jobben først)");
  }
  // Første valg dag 2 var stram_inn => dormant => ingen purring.
  assert.ok(!spiltA.includes("d3_morgen_purringen"),
    roleId + ": purringen skal IKKE fyre når økonomien ble strammet inn");

  // --- Gren B: siste valg hele veien (den «dårlige» grenen) ---
  let st2 = State.createInitialState(content);
  playDay(st2, content, sisteValg);
  st2 = Runner.startNextDay(st2, content);
  playDay(st2, content, sisteValg);
  st2 = Runner.startNextDay(st2, content);
  assert.strictEqual(st2.dagFerdig, false, roleId + ": dag 3 skal IKKE være tom (gren B)");
  const spiltB = playDay(st2, content, foersteValg);
  assert.ok(spiltB.includes("d3_morgen_tredje_dagen"),
    roleId + ": uka_videre bærer dag 3 også på gren B");
}

// --- Purringen fyrer på den eskalerte økonomi-grenen ---
{
  const content = buildContent("arbeidsledig");
  let st = State.createInitialState(content);
  playDay(st, content, foersteValg);
  st = Runner.startNextDay(st, content);
  // Dag 2: la regningen skure (siste valg i dag2_oekonomi), ellers første valg.
  playDay(st, content, (scene) => scene.id === "dag2_oekonomi" ? "la_det_skure" : scene.valg[0].id);
  st = Runner.startNextDay(st, content);
  const kandidater = Runner.getCandidateScenes(st, content).map((s) => s.id);
  assert.ok(kandidater.includes("d3_morgen_purringen"),
    "skjøv du regningen unna, kommer purringen på dag 3");
}

console.log("civication lifestory dag 3 ok (alle roller, begge grener, purring på eskalert gren)");
