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
assert.strictEqual(raw.roleThreads.threads.length, 6, "fem opprinnelige arbeidstråder og én oppfølgingstråd");
assert.ok(raw.roleThreads.threads.every((t) => t.type === "arbeidsliv"), "rolletrådene er arbeidsliv");

// De fem opprinnelige mail-familiene og en ekstra forfattet tråd om belastning og støtte.
const threadIds = raw.roleThreads.threads.map((t) => t.id);
assert.deepStrictEqual(threadIds.sort(), [
  "kunden_som_tror_du_bestemmer", "lukkingen", "ny_kollega_og_tillit",
  "prisfeilen_i_koen", "varen_som_ikke_finnes", "arbeidsrytme_og_overskudd"
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

// Opening checks do not magically fix the later coffee discrepancy.
const opening = raw.roleScenes.scenes.find(s => s.id === 'apning_01_forste_okt');
const coffeeEncounter = raw.roleScenes.scenes.find(s => s.id === 'prisfeil_02_koen');
assert.ok(opening && coffeeEncounter, 'reuse the existing Life Story scene IDs');
assert.deepStrictEqual(opening.valg.map(c => c.id), ['sjekk_plakatene', 'aapne_raskt', 'spor_amir'],
  'the original opening branches remain playable');
const checked = opening.valg.find(c => c.id === 'sjekk_plakatene');
assert.match(checked.tekst, /brød og juice/);
assert.match(checked.konsekvensTekst, /Kampanjekaffen inngår ikke/,
  'the preliminary spot check must not pretend to cover coffee');
assert.match(coffeeEncounter.tekst, /Kaffen inngikk ikke i stikkprøven av brød og juice/,
  'the later encounter must be consistent across all opening choices');
assert.ok(!Object.hasOwn(opening.valg.find(c => c.id === 'aapne_raskt').effekter.meters, 'integritet'),
  'opening on time cannot automatically count as an integrity violation');

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

// Real actors must remain distinct: Amir's verification cannot appear as Lene's message.
assert.strictEqual(raw.roleScenes.scenes.find(s => s.id === 'prisfeil_05_amir_sjekker').avsender,
  'erfaren_kollega', 'Amir must be the sender of his own verification result');
for (const sceneId of ['prisfeil_03_undersok_etter_snarevei', 'prisfeil_03_meld_avvik']) {
  const prompt = raw.roleScenes.scenes.find(s => s.id === sceneId);
  assert.strictEqual(prompt.avsender, null, sceneId + ' is narrator guidance, not a fabricated message from Lene');
  assert.strictEqual(prompt.visningstype, 'intern vurdering');
}

// --- Samme eldre Life Story-tråd: kontroll -> handel -> melding -> mottak -> etterkontroll. ---
// Use the actual Day Runner, not a fabricated archive or a parallel mail family.
function toPriceEncounter(openingChoice) {
  const current = State.createInitialState(content);
  let steps = 0;
  while (!current.dagFerdig) {
    const scene = Runner.selectNextScene(current, content);
    assert.ok(scene, 'every step toward the first price encounter must be playable');
    if (scene.id === 'prisfeil_02_koen') return current;
    const selected = scene.id === 'apning_01_forste_okt' ? openingChoice : scene.valg[0].id;
    Runner.applyChoice(current, content, scene.id, selected);
    assert.ok(++steps < 20, 'price encounter remains reachable on day one');
  }
  assert.fail('price encounter cannot silently disappear');
}
function take(current, id, choiceId) {
  const actual = Runner.selectNextScene(current, content);
  assert.strictEqual(actual?.id, id, 'follow-up must be the actual next available scene');
  const before = current.arkiv.length;
  Runner.applyChoice(current, content, id, choiceId);
  assert.strictEqual(current.arkiv.length, before + 1, 'one played choice yields one archive event');
}
function flag(current, key) { return current.tidligereValg[key] === true; }
let priceState = toPriceEncounter('sjekk_plakatene');
take(priceState, 'prisfeil_02_koen', 'rett_synlig');
assert.ok(flag(priceState, 'eksp_life_pris_handel_rettet'));
assert.ok(!flag(priceState, 'eksp_life_pris_meldt'), 'customer sale never reports a system defect');
take(priceState, 'prisfeil_03_meld_avvik', 'send_notat');
assert.ok(flag(priceState, 'eksp_life_pris_meldt'));
assert.ok(!flag(priceState, 'eksp_life_pris_overtatt'), 'sent message is not receipt');
take(priceState, 'prisfeil_04_lene_bekrefter', 'kontroller_selv');
assert.ok(flag(priceState, 'eksp_life_pris_overtatt'));
assert.ok(!flag(priceState, 'eksp_life_pris_etterkontroll_verifisert'), 'delegating or agreeing to check is not verifying');
take(priceState, 'prisfeil_05_sjekk_selv', 'kontroller_39');
assert.ok(flag(priceState, 'eksp_life_pris_etterkontroll_egen'));
assert.ok(flag(priceState, 'eksp_life_pris_etterkontroll_verifisert'));
assert.strictEqual(priceState.threadState.prisfeilen_i_koen.status, 'completed');

priceState = toPriceEncounter('aapne_raskt');
take(priceState, 'prisfeil_02_koen', 'gjett_pris');
assert.ok(!flag(priceState, 'eksp_life_pris_vare_sjekket'), 'shortcut is unverified');
take(priceState, 'prisfeil_03_undersok_etter_snarevei', 'sjekk_selv');
assert.ok(flag(priceState, 'eksp_life_pris_vare_sjekket'), 'shortcut can be repaired after sale');
take(priceState, 'prisfeil_03_meld_avvik', 'send_notat');
take(priceState, 'prisfeil_04_lene_bekrefter', 'kontroller_selv');
take(priceState, 'prisfeil_05_sjekk_selv', 'ikke_kontrollert');
assert.ok(flag(priceState, 'eksp_life_pris_grunnlag_rettet'));
assert.ok(flag(priceState, 'eksp_life_pris_etterkontroll_venter'));
assert.ok(!flag(priceState, 'eksp_life_pris_etterkontroll_verifisert'));
assert.strictEqual(priceState.threadState.prisfeilen_i_koen.status, 'escalated', 'unfinished own check stays open');

priceState = toPriceEncounter('spor_amir');
take(priceState, 'prisfeil_02_koen', 'rop_paa_amir');
assert.ok(flag(priceState, 'eksp_life_pris_sjekket_av_amir'));
take(priceState, 'prisfeil_03_meld_avvik', 'send_notat');
take(priceState, 'prisfeil_04_lene_bekrefter', 'amir_kontrollerer');
assert.ok(flag(priceState, 'eksp_life_pris_etterkontroll_delegert'));
assert.ok(!flag(priceState, 'eksp_life_pris_etterkontroll_verifisert'), 'delegation is not execution');
take(priceState, 'prisfeil_05_amir_sjekker', 'registrer_amir');
assert.ok(flag(priceState, 'eksp_life_pris_etterkontroll_amir'));
assert.ok(!flag(priceState, 'eksp_life_pris_etterkontroll_egen'));
assert.ok(flag(priceState, 'eksp_life_pris_etterkontroll_verifisert'));
assert.strictEqual(priceState.threadState.prisfeilen_i_koen.status, 'completed');

// Skill-locked D remains locked by production Skills; this stub permits only the
// already-practised opening check so that the real Runner continuation is tested.
priceState = toPriceEncounter('sjekk_plakatene');
const originalSkills = global.CivicationSkills;
global.CivicationSkills = {
  checkRequirement(req) {
    const practised = flag(priceState, 'sjekket_priser_foer_aapning');
    return {available: practised && req.skill_id === 'practical_mastery' && req.min_score <= 2,
      required: req.min_score, score: practised ? 2 : 0, measured: true, label: req.skill_id};
  }
};
try {
  take(priceState, 'prisfeil_02_koen', 'rett_og_logg_avvik');
} finally {
  if (originalSkills === undefined) delete global.CivicationSkills;
  else global.CivicationSkills = originalSkills;
}
assert.ok(flag(priceState, 'eksp_life_pris_meldt'), 'original report choice already sends report');
assert.ok(!flag(priceState, 'eksp_life_pris_overtatt'), 'Lene has not yet accepted at sale time');
take(priceState, 'prisfeil_04_lene_bekrefter', 'amir_kontrollerer');
take(priceState, 'prisfeil_05_amir_sjekker', 'ekstra_egenkontroll');
assert.ok(flag(priceState, 'eksp_life_pris_etterkontroll_amir'));
assert.ok(!flag(priceState, 'eksp_life_pris_etterkontroll_verifisert'), 'extra personal check not yet performed');
take(priceState, 'prisfeil_05_sjekk_selv', 'kontroller_39');
assert.ok(flag(priceState, 'eksp_life_pris_etterkontroll_egen'));
assert.ok(flag(priceState, 'eksp_life_pris_etterkontroll_verifisert'));
assert.strictEqual(priceState.threadState.prisfeilen_i_koen.status, 'completed');
assert.strictEqual(priceState.arkiv.filter(row => row.sceneId === 'prisfeil_03_meld_avvik').length, 0,
  'reported path cannot require sending the same report twice');

priceState = toPriceEncounter('aapne_raskt');
take(priceState, 'prisfeil_02_koen', 'gjett_pris');
take(priceState, 'prisfeil_03_undersok_etter_snarevei', 'la_sta_apent');
assert.ok(flag(priceState, 'eksp_life_pris_undersokelse_venter'));
assert.ok(!flag(priceState, 'eksp_life_pris_meldt'));
assert.strictEqual(priceState.threadState.prisfeilen_i_koen.status, 'escalated');

priceState = toPriceEncounter('sjekk_plakatene');
take(priceState, 'prisfeil_02_koen', 'rett_synlig');
take(priceState, 'prisfeil_03_meld_avvik', 'utsett_melding');
assert.ok(flag(priceState, 'eksp_life_pris_melding_venter'));
assert.ok(!flag(priceState, 'eksp_life_pris_overtatt'));
assert.strictEqual(priceState.threadState.prisfeilen_i_koen.status, 'escalated');

// --- Existing stock thread: physical count, customer resolution, handover and actual checks. ---
const stockScenes = [
  'varen_01_som_ikke_finnes', 'varen_02_rett_ubegrunnet_lovnad',
  'varen_02_kontroller_beholdning', 'varen_02_amir_teller',
  'varen_03_avklar_kunden', 'varen_04_meld_telleavvik',
  'varen_05_lene_bekrefter', 'varen_06_etterkontroll', 'varen_07_amir_etterkontroll'
];
for (const id of stockScenes) {
  assert.ok(raw.roleScenes.scenes.some(s => s.id === id), 'retain canonical stock scene ' + id);
}
for (const id of ['varen_02_rett_ubegrunnet_lovnad', 'varen_02_kontroller_beholdning', 'varen_04_meld_telleavvik']) {
  const s = raw.roleScenes.scenes.find(s => s.id === id);
  assert.strictEqual(s.avsender, null, id + ' is work guidance, not a fabricated message');
}
for (const id of ['varen_02_amir_teller', 'varen_07_amir_etterkontroll']) {
  assert.strictEqual(raw.roleScenes.scenes.find(s => s.id === id).avsender, 'erfaren_kollega',
    'Amir must be named as actual counter');
}
assert.strictEqual(raw.roleScenes.scenes.find(s => s.id === 'varen_05_lene_bekrefter').avsender,
  'butikksjef', 'Lene confirms the handover herself');

function toStockEncounter() {
  const current = State.createInitialState(content);
  let steps = 0;
  while (!current.dagFerdig) {
    const scene = Runner.selectNextScene(current, content);
    assert.ok(scene, 'the normal story reaches the stock task');
    if (scene.id === 'varen_01_som_ikke_finnes') return current;
    Runner.applyChoice(current, content, scene.id, scene.valg[0].id);
    assert.ok(++steps < 40, 'stock task is playable on day one');
  }
  assert.fail('stock encounter cannot silently disappear');
}
let stock = toStockEncounter();
take(stock, 'varen_01_som_ikke_finnes', 'aerlig_om_lageret');
assert.ok(flag(stock, 'lager_usikkert_forklart'));
assert.ok(!flag(stock, 'lager_ett_funnet'), 'conversation alone does not count stock');
take(stock, 'varen_02_kontroller_beholdning', 'tell_selv');
assert.ok(flag(stock, 'lager_telling_egen'));
assert.ok(!flag(stock, 'lager_kunde_fikk_vare'), 'finding one item is not a completed sale');
take(stock, 'varen_03_avklar_kunden', 'gjennomfor_salget');
assert.ok(flag(stock, 'lager_kunde_fikk_vare'));
assert.ok(!flag(stock, 'lager_avvik_meldt'), 'sale does not report missing stock');
take(stock, 'varen_04_meld_telleavvik', 'send_tellenotat');
assert.ok(flag(stock, 'lager_avvik_meldt'));
assert.ok(!flag(stock, 'lager_ansvar_overtatt'), 'sent note is not receipt');
take(stock, 'varen_05_lene_bekrefter', 'avtal_egen_sjekk');
assert.ok(flag(stock, 'lager_ansvar_overtatt'));
assert.ok(!flag(stock, 'lager_etterkontroll_verifisert'), 'a promise to check does not count as verification');
take(stock, 'varen_06_etterkontroll', 'sjekk_null_selv');
assert.ok(flag(stock, 'lager_system_oppdatert'));
assert.ok(flag(stock, 'lager_etterkontroll_egen'));
assert.ok(flag(stock, 'lager_etterkontroll_verifisert'));
assert.strictEqual(stock.threadState.varen_som_ikke_finnes.status, 'completed');

stock = toStockEncounter();
take(stock, 'varen_01_som_ikke_finnes', 'aerlig_om_lageret');
take(stock, 'varen_02_kontroller_beholdning', 'amir_teller');
assert.ok(flag(stock, 'lager_telling_delegert'));
assert.ok(!flag(stock, 'lager_ett_funnet'), 'delegating is not an actual stock result');
take(stock, 'varen_02_amir_teller', 'registrer_amirs_telling');
assert.ok(flag(stock, 'lager_telling_amir'));
assert.ok(!flag(stock, 'lager_telling_egen'));
take(stock, 'varen_03_avklar_kunden', 'la_lene_gjennomfore');
assert.ok(flag(stock, 'lager_vare_solgt_av_lene'));
assert.ok(!flag(stock, 'lager_kunde_fikk_vare'), 'the player did not execute Lene\'s sale');
take(stock, 'varen_04_meld_telleavvik', 'send_tellenotat');
take(stock, 'varen_05_lene_bekrefter', 'be_amir_folge_opp');
assert.ok(!flag(stock, 'lager_etterkontroll_verifisert'));
take(stock, 'varen_06_etterkontroll', 'be_amir_etterkontroll');
assert.ok(!flag(stock, 'lager_etterkontroll_amir'), 'Amir has not responded yet');
take(stock, 'varen_07_amir_etterkontroll', 'registrer_amir');
assert.ok(flag(stock, 'lager_etterkontroll_amir'));
assert.ok(!flag(stock, 'lager_etterkontroll_egen'));
assert.ok(flag(stock, 'lager_etterkontroll_verifisert'));
assert.strictEqual(stock.threadState.varen_som_ikke_finnes.status, 'completed');

stock = toStockEncounter();
take(stock, 'varen_01_som_ikke_finnes', 'lov_i_morgen');
assert.ok(flag(stock, 'lovte_for_mye'));
take(stock, 'varen_02_rett_ubegrunnet_lovnad', 'rett_beskjeden');
assert.ok(flag(stock, 'lager_lovnad_rettet'));
take(stock, 'varen_02_kontroller_beholdning', 'tell_selv');
take(stock, 'varen_03_avklar_kunden', 'gjennomfor_salget');
take(stock, 'varen_04_meld_telleavvik', 'utsett_avviket');
assert.ok(flag(stock, 'lager_avviksmelding_venter'));
assert.ok(!flag(stock, 'lager_avvik_meldt'));
assert.ok(!flag(stock, 'lager_ansvar_overtatt'));
assert.strictEqual(stock.threadState.varen_som_ikke_finnes.status, 'escalated');

stock = toStockEncounter();
take(stock, 'varen_01_som_ikke_finnes', 'lov_i_morgen');
take(stock, 'varen_02_rett_ubegrunnet_lovnad', 'la_lovnaden_staa');
assert.ok(flag(stock, 'lager_ubekreftet_lovnad_staar'));
assert.ok(!flag(stock, 'lager_ett_funnet'));
assert.strictEqual(stock.threadState.varen_som_ikke_finnes.status, 'escalated');

stock = toStockEncounter();
take(stock, 'varen_01_som_ikke_finnes', 'sjekk_selv');
assert.ok(flag(stock, 'lager_ett_funnet'));
take(stock, 'varen_03_avklar_kunden', 'la_kunden_vente');
assert.ok(!flag(stock, 'lager_kunde_fikk_vare'));
assert.ok(!flag(stock, 'lager_avvik_meldt'));
assert.strictEqual(stock.threadState.varen_som_ikke_finnes.status, 'escalated');

stock = toStockEncounter();
take(stock, 'varen_01_som_ikke_finnes', 'sjekk_selv');
take(stock, 'varen_03_avklar_kunden', 'gjennomfor_salget');
take(stock, 'varen_04_meld_telleavvik', 'send_tellenotat');
take(stock, 'varen_05_lene_bekrefter', 'avtal_egen_sjekk');
take(stock, 'varen_06_etterkontroll', 'ikke_sjekket');
assert.ok(flag(stock, 'lager_system_oppdatert'));
assert.ok(flag(stock, 'lager_etterkontroll_venter'));
assert.ok(!flag(stock, 'lager_etterkontroll_verifisert'));
assert.strictEqual(stock.threadState.varen_som_ikke_finnes.status, 'escalated');

stock = toStockEncounter();
take(stock, 'varen_01_som_ikke_finnes', 'aerlig_om_lageret');
take(stock, 'varen_02_kontroller_beholdning', 'amir_teller');
take(stock, 'varen_02_amir_teller', 'avklar_variant');
assert.ok(flag(stock, 'lager_variant_venter'));
assert.ok(!flag(stock, 'lager_ett_funnet'), 'unverified variant cannot count as the customer item');
assert.strictEqual(stock.threadState.varen_som_ikke_finnes.status, 'escalated');

// Returns are not automatically refunds: complaint vs voluntary change-of-mind.
const returnScene = raw.roleScenes.scenes.find(s => s.id === 'retur_01_uten_kvittering');
assert.deepStrictEqual(returnScene.valg.map(c => c.id), ['hold_regelen', 'boy_regelen', 'hent_lene'],
  'preserve return scene and its original choice IDs');
assert.match(returnScene.tekst, /uklart om varen er feilfri/);
assert.match(returnScene.valg.find(c => c.id === 'hold_regelen').konsekvensTekst,
  /reklamasjon/, 'a complaint cannot be treated as a voluntary store return');
assert.ok(!returnScene.valg.find(c => c.id === 'hold_regelen').konsekvensTekst.includes('tilgodelapp'),
  'the store must not invent a voucher before checking the reason');
for (const [id, actor] of [
  ['retur_02_hva_er_grunnen', null],
  ['retur_03_lene_tar_saken', 'butikksjef'],
  ['retur_04_lene_undersokte_varen', 'butikksjef'],
  ['retur_05_lene_undersoker_bilag', 'butikksjef'],
  ['retur_06_avstemming_bekreftet', 'butikksjef']
]) {
  const scene = raw.roleScenes.scenes.find(s => s.id === id);
  assert.ok(scene && scene.avsender === actor, id + ' is a real, attributed scene');
}
function toReturnEncounter() {
  const st = State.createInitialState(content);
  let steps = 0;
  while (!st.dagFerdig) {
    const scene = Runner.selectNextScene(st, content);
    assert.ok(scene, 'real Life Story runner reaches the return encounter');
    if (scene.id === 'retur_01_uten_kvittering') return st;
    Runner.applyChoice(st, content, scene.id, scene.valg[0].id);
    assert.ok(++steps < 90, 'existing day-one tasks reach the return');
  }
  assert.fail('existing return scene must remain reachable');
}
let ret = toReturnEncounter();
take(ret, 'retur_01_uten_kvittering', 'hold_regelen');
assert.ok(flag(ret, 'retur_avklart_sporsmal'));
assert.ok(!flag(ret, 'retur_kjop_dokumentert'), 'asking a question does not prove a purchase');
take(ret, 'retur_02_hva_er_grunnen', 'be_om_ordrebekreftelse');
assert.ok(flag(ret, 'retur_kjop_dokumentert'));
assert.ok(flag(ret, 'retur_mulig_reklamasjon'));
assert.ok(!flag(ret, 'retur_mangel_bekreftet'), 'allegation and proof of purchase are not proof of a defect');
take(ret, 'retur_03_lene_tar_saken', 'overlever_varen');
assert.ok(flag(ret, 'retur_sak_registrert'));
assert.ok(flag(ret, 'retur_lene_overtatt'));
assert.ok(!flag(ret, 'retur_omlevering_utfort'), "overlevering to Lene cannot complete the customer's remedy");
take(ret, 'retur_04_lene_undersokte_varen', 'utlever_ny_vare');
assert.ok(flag(ret, 'retur_mangel_bekreftet'));
assert.ok(flag(ret, 'retur_omlevering_utfort'));
assert.ok(flag(ret, 'retur_kundens_sak_avklart'));
assert.notStrictEqual(ret.threadState.kunden_som_tror_du_bestemmer.status, 'completed',
  'customer remedy does not erase the broader job/authority learning thread');

ret = toReturnEncounter();
take(ret, 'retur_01_uten_kvittering', 'hent_lene');
assert.ok(flag(ret, 'retur_ba_lene_om_hjelp'));
assert.ok(!flag(ret, 'retur_lene_overtatt'), 'requesting manager is not confirmed handover');
take(ret, 'retur_02_hva_er_grunnen', 'be_om_tid_til_bevis');
assert.ok(flag(ret, 'retur_kjopsbevis_venter'));
assert.ok(!flag(ret, 'retur_kjop_dokumentert'));
assert.strictEqual(ret.threadState.kunden_som_tror_du_bestemmer.status, 'escalated');

ret = toReturnEncounter();
take(ret, 'retur_01_uten_kvittering', 'hold_regelen');
take(ret, 'retur_02_hva_er_grunnen', 'avvis_originalkvittering');
assert.ok(flag(ret, 'retur_feilaktig_avvist'));
assert.ok(!flag(ret, 'retur_sak_registrert'));
assert.strictEqual(ret.threadState.kunden_som_tror_du_bestemmer.status, 'escalated');

ret = toReturnEncounter();
take(ret, 'retur_01_uten_kvittering', 'hold_regelen');
take(ret, 'retur_02_hva_er_grunnen', 'be_om_ordrebekreftelse');
take(ret, 'retur_03_lene_tar_saken', 'avvent_overlevering');
assert.ok(flag(ret, 'retur_overlevering_venter'));
assert.ok(!flag(ret, 'retur_lene_overtatt'));
assert.strictEqual(ret.threadState.kunden_som_tror_du_bestemmer.status, 'escalated');

ret = toReturnEncounter();
take(ret, 'retur_01_uten_kvittering', 'hold_regelen');
take(ret, 'retur_02_hva_er_grunnen', 'be_om_ordrebekreftelse');
take(ret, 'retur_03_lene_tar_saken', 'overlever_varen');
take(ret, 'retur_04_lene_undersokte_varen', 'avvent_utlevering');
assert.ok(flag(ret, 'retur_mangel_bekreftet'));
assert.ok(!flag(ret, 'retur_omlevering_utfort'));
assert.strictEqual(ret.threadState.kunden_som_tror_du_bestemmer.status, 'escalated');

// The wrong refund is actually performed on day 1, but a confession on
// day 2 is never allowed to claim the cash balance is already corrected.
ret = toReturnEncounter();
take(ret, 'retur_01_uten_kvittering', 'boy_regelen');
assert.ok(flag(ret, 'retur_uten_fullmakt'));
assert.ok(flag(ret, 'retur_utbetaling_uten_bilag'));
assert.ok(!flag(ret, 'retur_avvik_meldt'));
let stepsToDay2 = 0;
while (!ret.dagFerdig) {
  const scene = Runner.selectNextScene(ret, content);
  assert.ok(scene, 'day one must still complete after the unauthorized refund');
  Runner.applyChoice(ret, content, scene.id, scene.valg[0].id);
  assert.ok(++stepsToDay2 < 60);
}
Runner.startNextDay(ret, content);
let reachedEvening = false;
for (let i = 0; i < 80 && !ret.dagFerdig; i++) {
  const scene = Runner.selectNextScene(ret, content);
  assert.ok(scene);
  if (scene.id === 'd2_kveld_kassadifferansen') { reachedEvening = true; break; }
  Runner.applyChoice(ret, content, scene.id, scene.valg[0].id);
}
assert.ok(reachedEvening, 'actual unsupported refund leads to cashier discrepancy on day two');
take(ret, 'd2_kveld_kassadifferansen', 'fortell_alt');
assert.ok(flag(ret, 'retur_avvik_meldt'));
assert.ok(!flag(ret, 'retur_avstemming_bekreftet'),
  'reporting a mistake does not reconcile the till');
take(ret, 'retur_05_lene_undersoker_bilag', 'registrer_undersokelsen');
assert.ok(flag(ret, 'retur_bilag_undersokt'));
assert.ok(!flag(ret, 'retur_avstemming_bekreftet'),
  "manager's investigation is not verified correction");
take(ret, 'retur_06_avstemming_bekreftet', 'dokumenter_sluttresultat');
assert.ok(flag(ret, 'retur_kasse_rettet_av_lene'));
assert.ok(flag(ret, 'retur_avstemming_bekreftet'));
assert.strictEqual(ret.threadState.kunden_som_tror_du_bestemmer.status, 'completed');
assert.ok(!flag(ret, 'retur_kundens_sak_avklart'),
  'accounting correction alone is not a customer-complaint ruling');

// Pantelapp-veiledning: a promise or delegation is not completed learning.
const pantOpening = raw.roleScenes.scenes.find(s => s.id === 'ny_kollega_01_midt_i_koen');
assert.deepStrictEqual(pantOpening.valg.map(v => v.id), ['hjelp_kort', 'be_vente', 'send_til_amir'],
  'the original three vikar choices are retained');
for (const id of [
  'ny_kollega_02_avtal_hjelp', 'ny_kollega_02_vis_pantekort',
  'ny_kollega_02_amir_bekrefter', 'ny_kollega_03_vikar_forklarer',
  'd2_formiddag_vikaren_etter_amir'
]) assert.ok(raw.roleScenes.scenes.some(s => s.id === id), 'canonical vikar scene exists: ' + id);
assert.equal(raw.roleScenes.scenes.find(s => s.id === 'ny_kollega_02_amir_bekrefter').avsender,
  'erfaren_kollega', 'Amir is the sender of his own actual verification');
assert.match(raw.roleScenes.scenes.find(s => s.id === 'ny_kollega_03_vikar_forklarer').tekst,
  /ikke skannes om igjen/, 'the previously redeemed slip must not be scanned a second time');

function toVikarEncounter() {
  const st = State.createInitialState(content);
  let count = 0;
  while (!st.dagFerdig) {
    const scene = Runner.selectNextScene(st, content);
    assert.ok(scene, 'the canonical day-one story reaches the vikar');
    if (scene.id === 'ny_kollega_01_midt_i_koen') return st;
    Runner.applyChoice(st, content, scene.id, scene.valg[0].id);
    assert.ok(++count < 45, 'vikar is still reachable in the established story');
  }
  assert.fail('vikar scene must not disappear');
}
let pant = toVikarEncounter();
const initialVikarTrust = pant.relasjoner.ny_kollega;
take(pant, 'ny_kollega_01_midt_i_koen', 'hjelp_kort');
assert.ok(pant.relasjoner.ny_kollega - initialVikarTrust <= 1,
  'promised instruction cannot get the full teaching reward in advance');
assert.ok(flag(pant, 'pant_veiledning_startet'));
assert.ok(!flag(pant, 'hjalp_ny_kollega'), 'an intention to demonstrate is not actual teaching');
take(pant, 'ny_kollega_02_vis_pantekort', 'vis_en_gang');
assert.ok(flag(pant, 'pant_kvittering_registrert_en_gang'));
assert.ok(!flag(pant, 'hjalp_ny_kollega'), 'demonstration alone does not prove the learner understands');
take(pant, 'ny_kollega_03_vikar_forklarer', 'sjekk_forklaringen');
assert.ok(flag(pant, 'hjalp_ny_kollega'));
assert.ok(flag(pant, 'pant_vikar_forstod'));
assert.ok(flag(pant, 'pant_veiledning_fullfort'));

pant = toVikarEncounter();
take(pant, 'ny_kollega_01_midt_i_koen', 'hjelp_kort');
take(pant, 'ny_kollega_02_vis_pantekort', 'vis_en_gang');
take(pant, 'ny_kollega_03_vikar_forklarer', 'ikke_sjekk');
assert.ok(flag(pant, 'pant_demo_uten_etterkontroll'));
assert.ok(!flag(pant, 'hjalp_ny_kollega'));
assert.equal(pant.threadState.ny_kollega_og_tillit.status, 'escalated');

pant = toVikarEncounter();
const priorIntegrity = pant.meters.integritet;
const priorVikarRelation = pant.relasjoner.ny_kollega;
take(pant, 'ny_kollega_01_midt_i_koen', 'be_vente');
assert.equal(pant.relasjoner.ny_kollega, priorVikarRelation,
  'agreeing to help after the queue must not count as rejecting the trainee');
assert.equal(pant.meters.integritet, priorIntegrity,
  'serving the queue first with an agreed handoff is not an integrity fault');
assert.ok(flag(pant, 'pant_hjelp_utsatt'));
assert.ok(!flag(pant, 'hjalp_ny_kollega'), 'waiting does not mean instruction occurred');
take(pant, 'ny_kollega_02_avtal_hjelp', 'vis_etter_ko');
assert.ok(flag(pant, 'pant_avlosning_avtalt'));
assert.ok(!flag(pant, 'hjalp_ny_kollega'), 'relief agreement still needs actual instruction');
take(pant, 'ny_kollega_02_vis_pantekort', 'vis_en_gang');
take(pant, 'ny_kollega_03_vikar_forklarer', 'sjekk_forklaringen');
assert.ok(flag(pant, 'hjalp_ny_kollega'));

pant = toVikarEncounter();
take(pant, 'ny_kollega_01_midt_i_koen', 'be_vente');
take(pant, 'ny_kollega_02_avtal_hjelp', 'lat_det_ligge');
assert.ok(flag(pant, 'pant_hjelp_ikke_fulgt_opp'));
assert.ok(!flag(pant, 'hjalp_ny_kollega'));
assert.equal(pant.threadState.ny_kollega_og_tillit.status, 'escalated');

pant = toVikarEncounter();
take(pant, 'ny_kollega_01_midt_i_koen', 'send_til_amir');
assert.ok(flag(pant, 'pant_henvist_amir'));
assert.ok(!flag(pant, 'pant_amir_hjalp'), 'referral is not an Amir result');
assert.ok(!flag(pant, 'hjalp_ny_kollega'), 'referral is not a personally verified lesson');
take(pant, 'ny_kollega_02_amir_bekrefter', 'registrer_amirs_hjelp');
assert.ok(flag(pant, 'pant_amir_hjalp'));
assert.ok(flag(pant, 'pant_veiledning_av_amir_loggfort'));
assert.ok(!flag(pant, 'hjalp_ny_kollega'), 'a colleague must keep the credit for his work');
let vikarDayOne = 0;
while (!pant.dagFerdig) {
  const scene = Runner.selectNextScene(pant, content);
  assert.ok(scene, 'day one continues after delegated pant');
  Runner.applyChoice(pant, content, scene.id, scene.valg[0].id);
  assert.ok(++vikarDayOne < 100);
}
Runner.startNextDay(pant, content);
const day2Choices = [];
for (let i = 0; i < 75 && !pant.dagFerdig; i++) {
  const scene = Runner.selectNextScene(pant, content);
  assert.ok(scene);
  day2Choices.push(scene.id);
  assert.notEqual(scene.id, 'd2_formiddag_amir_om_gulvet',
    'Amir cannot claim the trainee was abandoned after he taught her');
  assert.notEqual(scene.id, 'd2_formiddag_vikaren_kommer_til_deg',
    'player cannot claim credit for Amir\'s demonstration');
  if (scene.id === 'd2_formiddag_vikaren_etter_amir') {
    take(pant, scene.id, 'sporr_vikaren');
    break;
  }
  Runner.applyChoice(pant, content, scene.id, scene.valg[0].id);
}
assert.ok(day2Choices.includes('d2_formiddag_vikaren_etter_amir'),
  'delegated and confirmed training has its own true day-two follow-up');
assert.ok(flag(pant, 'pant_egen_oppfolging_d2'));
assert.ok(!flag(pant, 'hjalp_ny_kollega'),
  'follow-up does not fabricate a personal day-one demonstration');
assert.equal(pant.threadState.ny_kollega_og_tillit.status, 'completed');

// --- Day-two vikar: a plan is not instruction, and a verified return is not an automatic refund. ---
const day2VikarIntro = raw.roleScenes.scenes.find(s => s.id === 'd2_formiddag_vikaren_kommer_til_deg');
assert.deepStrictEqual(day2VikarIntro.valg.map(v => v.id), ['laer_bort_metoden', 'vis_raskt'],
  'keep both original day-two vikar choice identifiers');
for (const id of ['d2_vikar_retur_02_kort_svar','d2_vikar_retur_02_kontroll',
  'd2_vikar_retur_03_lene_godkjenner', 'd2_vikar_retur_03_vikar_utforer']) {
  assert.ok(raw.roleScenes.scenes.some(s => s.id === id),
    'canonical day-two vikar return continuation: ' + id);
}
const promiseToTeach = day2VikarIntro.valg.find(v => v.id === 'laer_bort_metoden');
assert.strictEqual(promiseToTeach.skills_practice, undefined,
  'agreeing to explain a return must not credit completed learning');
assert.ok(!promiseToTeach.effekter.flagg?.laerte_bort_metoden);
const finishedTeaching = raw.roleScenes.scenes.find(s => s.id === 'd2_vikar_retur_03_vikar_utforer')
  .valg.find(v => v.id === 'veiled_og_kontroller_byttet');
assert.equal(finishedTeaching.skills_practice?.skill_id, 'communication');
assert.equal(finishedTeaching.skills_practice?.evidence_flag, 'laerte_bort_metoden');
assert.equal(finishedTeaching.effekter.flagg.laerte_bort_metoden, true);

function reachDay2Vikar() {
  const st = toVikarEncounter();
  take(st, 'ny_kollega_01_midt_i_koen', 'hjelp_kort');
  take(st, 'ny_kollega_02_vis_pantekort', 'vis_en_gang');
  take(st, 'ny_kollega_03_vikar_forklarer', 'sjekk_forklaringen');
  let untilEnd = 0;
  while (!st.dagFerdig) {
    const scn = Runner.selectNextScene(st, content);
    assert.ok(scn, 'must finish day one before return training');
    Runner.applyChoice(st, content, scn.id, scn.valg[0].id);
    assert.ok(++untilEnd < 100, 'day one ends after the actual pant lesson');
  }
  Runner.startNextDay(st, content);
  let untilVikar = 0;
  while (!st.dagFerdig) {
    const scn = Runner.selectNextScene(st, content);
    assert.ok(scn, 'day two must have an accessible trainee request');
    if (scn.id === 'd2_formiddag_vikaren_kommer_til_deg') return st;
    Runner.applyChoice(st, content, scn.id, scn.valg[0].id);
    assert.ok(++untilVikar < 90, 'day-two trainee request remains reachable');
  }
  assert.fail('the established vikar scene cannot disappear');
}
let day2Vikar = reachDay2Vikar();
take(day2Vikar, 'd2_formiddag_vikaren_kommer_til_deg', 'laer_bort_metoden');
assert.ok(flag(day2Vikar, 'retur_d2_opplaring_avtalt'));
assert.ok(!flag(day2Vikar, 'laerte_bort_metoden'), 'offer to teach is not an earned communication skill');
assert.ok(!flag(day2Vikar, 'retur_d2_bytte_gjennomfort'));
take(day2Vikar, 'd2_vikar_retur_02_kontroll', 'sammenlign_kvittering_og_vare');
assert.ok(flag(day2Vikar, 'retur_d2_vilkar_kontrollert'));
assert.ok(!flag(day2Vikar, 'retur_d2_bytte_gjennomfort'), 'checking a receipt is not performing the swap');
assert.ok(!flag(day2Vikar, 'laerte_bort_metoden'));
assert.ok(!flag(day2Vikar, 'retur_d2_lene_godkjent'), 'checking policy is not managerial approval');
take(day2Vikar, 'd2_vikar_retur_03_lene_godkjenner', 'noter_lenes_beslutning');
assert.ok(flag(day2Vikar, 'retur_d2_lene_godkjent'));
assert.ok(!flag(day2Vikar, 'retur_d2_bytte_gjennomfort'), 'manager approval does not execute a sale');
assert.ok(!flag(day2Vikar, 'laerte_bort_metoden'), 'approval is not the teaching evidence');
take(day2Vikar, 'd2_vikar_retur_03_vikar_utforer', 'veiled_og_kontroller_byttet');
assert.ok(flag(day2Vikar, 'retur_d2_vikar_forstod'));
assert.ok(flag(day2Vikar, 'retur_d2_bytte_gjennomfort'));
assert.ok(flag(day2Vikar, 'laerte_bort_metoden'));
assert.equal(day2Vikar.threadState.ny_kollega_og_tillit.status, 'completed');
assert.ok(day2Vikar.arkiv.some(row => row.sceneId === 'd2_vikar_retur_03_vikar_utforer'
  && row.valgId === 'veiled_og_kontroller_byttet'));

day2Vikar = reachDay2Vikar();
take(day2Vikar, 'd2_formiddag_vikaren_kommer_til_deg', 'vis_raskt');
assert.ok(flag(day2Vikar, 'retur_d2_ufullstendig_veiledning'));
assert.ok(!flag(day2Vikar, 'laerte_bort_metoden'), 'brief advice is not finished tutoring');
take(day2Vikar, 'd2_vikar_retur_02_kort_svar', 'ta_gjennomgangen');
take(day2Vikar, 'd2_vikar_retur_02_kontroll', 'sammenlign_kvittering_og_vare');
take(day2Vikar, 'd2_vikar_retur_03_lene_godkjenner', 'noter_lenes_beslutning');
take(day2Vikar, 'd2_vikar_retur_03_vikar_utforer', 'gjør_det_selv');
assert.ok(flag(day2Vikar, 'retur_d2_bytte_utfort_av_spiller'));
assert.ok(flag(day2Vikar, 'retur_d2_vikar_kontroll_venter'));
assert.ok(!flag(day2Vikar, 'laerte_bort_metoden'), 'doing a transaction yourself is not teaching it');
assert.ok(!flag(day2Vikar, 'retur_d2_vikar_forstod'));
assert.equal(day2Vikar.threadState.ny_kollega_og_tillit.status, 'escalated');

day2Vikar = reachDay2Vikar();
take(day2Vikar, 'd2_formiddag_vikaren_kommer_til_deg', 'laer_bort_metoden');
take(day2Vikar, 'd2_vikar_retur_02_kontroll', 'gi_refusjon_uten_sjekk');
assert.ok(flag(day2Vikar, 'retur_d2_ubegrunnet_refusjon_stanset'));
assert.ok(!flag(day2Vikar, 'retur_d2_bytte_gjennomfort'));
assert.ok(!flag(day2Vikar, 'laerte_bort_metoden'));
assert.equal(day2Vikar.threadState.ny_kollega_og_tillit.status, 'escalated');

day2Vikar = reachDay2Vikar();
take(day2Vikar, 'd2_formiddag_vikaren_kommer_til_deg', 'vis_raskt');
take(day2Vikar, 'd2_vikar_retur_02_kort_svar', 'ga_tilbake');
assert.ok(flag(day2Vikar, 'retur_d2_ikke_fulgt_opp'));
assert.ok(!flag(day2Vikar, 'retur_d2_vilkar_kontrollert'));
assert.ok(!flag(day2Vikar, 'laerte_bort_metoden'));
assert.equal(day2Vikar.threadState.ny_kollega_og_tillit.status, 'escalated');

day2Vikar = reachDay2Vikar();
take(day2Vikar, 'd2_formiddag_vikaren_kommer_til_deg', 'laer_bort_metoden');
take(day2Vikar, 'd2_vikar_retur_02_kontroll', 'sammenlign_kvittering_og_vare');
take(day2Vikar, 'd2_vikar_retur_03_lene_godkjenner', 'vent_pa_dokumentasjon');
assert.ok(flag(day2Vikar, 'retur_d2_lene_godkjenning_venter'));
assert.ok(!flag(day2Vikar, 'retur_d2_lene_godkjent'));
assert.ok(!flag(day2Vikar, 'retur_d2_bytte_gjennomfort'));
assert.ok(!flag(day2Vikar, 'laerte_bort_metoden'));
assert.equal(day2Vikar.threadState.ny_kollega_og_tillit.status, 'escalated');

// A physical counter key and a personal return mandate are separate from closing authority.
function reachCounterMandate() {
  const st = reachDay2Vikar();
  for (let n = 0; n < 90 && !st.dagFerdig; n++) {
    const scn = Runner.selectNextScene(st, content);
    assert.ok(scn, 'actual day-two scenes lead to the counter mandate');
    if (scn.id === 'd2_ettermiddag_nokkelen') return st;
    Runner.applyChoice(st, content, scn.id, scn.valg[0].id);
  }
  assert.fail('counter mandate must remain reachable');
}
for (const choice of ['ta_ansvaret', 'en_uke_til', 'del_med_vikaren']) {
  const st = reachCounterMandate();
  const beforeVisibility = st.meters.synlighet;
  const beforeHistory = st.arkiv.length;
  const taughtBefore = flag(st, 'laerte_bort_metoden');
  assert.ok(!flag(st, 'ekspeditor_returfullmakt_aktiv'));
  assert.ok(!flag(st, 'ekspeditor_disknokkel_utlevert'));
  take(st, 'd2_ettermiddag_nokkelen', choice);
  const accepted = choice === 'ta_ansvaret';
  assert.equal(flag(st, 'ekspeditor_returfullmakt_aktiv'), accepted,
    'only an expressly accepted personal mandate grants return authority');
  assert.equal(flag(st, 'ekspeditor_disknokkel_utlevert'), accepted,
    'the physical counter key is handed over only on acceptance');
  assert.equal(flag(st, 'tok_nokkelansvar'), accepted);
  assert.equal(flag(st, 'ekspeditor_returfullmakt_utsatt'), choice === 'en_uke_til');
  assert.equal(flag(st, 'ekspeditor_dokumentkontroll_delt'), choice === 'del_med_vikaren');
  if (choice === 'en_uke_til') assert.ok(st.meters.synlighet >= beforeVisibility,
    'requesting agreed training does not incur an unexplained visibility penalty');
  assert.equal(flag(st, 'laerte_bort_metoden'), taughtBefore,
    'accepting responsibility is not evidence of teaching');
  const restored = JSON.parse(JSON.stringify(st));
  assert.deepStrictEqual(restored.tidligereValg, st.tidligereValg);
  assert.equal(restored.arkiv.length, beforeHistory + 1);
  assert.equal(restored.arkiv.at(-1).valgId, choice);
}

console.log("civication lifestory ekspeditor ok (" + state.arkiv.length + " scener over 2 dager, begge dag-2-grener verifisert)");
