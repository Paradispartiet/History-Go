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

console.log("civication lifestory ekspeditor ok (" + state.arkiv.length + " scener over 2 dager, begge dag-2-grener verifisert)");
