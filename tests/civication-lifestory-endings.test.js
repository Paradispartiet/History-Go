#!/usr/bin/env node
// Endings-kontrakten: uka kåres en slutt fra sluttilstanden — akkurat som
// progresjon ellers tolkes fra evidens, aldri skrives direkte. Testen sikrer:
//   - hver rolle har endings med gyldige kriterier og nøyaktig én standard,
//   - to motsatte spillemønstre (forsiktig/ærlig vs hensynsløst) kårer to
//     ulike, tone-riktige slutter,
//   - isFinalDay er sant på siste dag med innhold, usant før,
//   - fallback til standard når ingenting scorer,
//   - validatoren feiler hardt på kriterier som peker på ukjente signaler.
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const Content = require("../js/Civication/lifestory/lifestoryContent.js");
const State = require("../js/Civication/lifestory/lifestoryState.js");
const Runner = require("../js/Civication/lifestory/lifestoryRunner.js");
const Endings = require("../js/Civication/lifestory/lifestoryEndings.js");

const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const manifest = readJson("data/Civication/lifestory/manifest.json");

function build(roleId) {
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
function playFullWeek(content, pick) {
  let state = State.createInitialState(content);
  let guard = 0;
  for (let dag = 1; ; dag++) {
    while (!state.dagFerdig) {
      const scene = Runner.selectNextScene(state, content);
      Runner.applyChoice(state, content, scene.id, pick(scene));
      assert.ok(++guard < 300, "uka må terminere");
    }
    if (Endings.isFinalDay(state, content)) break;
    state = Runner.startNextDay(state, content);
  }
  return state;
}
const foerste = (s) => s.valg[0].id;
const siste = (s) => s.valg[s.valg.length - 1].id;

// Forventede slutter for de to deterministiske mønstrene (kalibrert mot målt
// sluttilstand): forsiktig/ærlig => en «god» slutt, hensynsløst => en «hard».
const FORVENTET = {
  arbeidsledig: { foerste: "bygget_kompetanse", siste: "kom_i_jobb" },
  renholder: { foerste: "fagstolt", siste: "usynlig_forbigaatt" },
  ekspeditor: { foerste: "trygg_paa_gulvet", siste: "mistet_tilliten" },
  arealplanlegger: { foerste: "faglig_sterk", siste: "politisk_lydig" }
};

for (const roleId of Object.keys(manifest.roles)) {
  const content = build(roleId);
  const endings = content.role.endings;
  assert.ok(Array.isArray(endings) && endings.length >= 2, roleId + ": har endings");
  assert.strictEqual(endings.filter((e) => e.standard).length, 1, roleId + ": nøyaktig én standard");

  // isFinalDay: usant på dag 1 (det finnes senere dager), sant til slutt.
  const day1 = State.createInitialState(content);
  assert.ok(!Endings.isFinalDay(day1, content), roleId + ": dag 1 er ikke siste dag");

  const forsiktig = playFullWeek(content, foerste);
  assert.ok(Endings.isFinalDay(forsiktig, content), roleId + ": uka endte på siste dag");
  const endF = Endings.resolveEnding(forsiktig, content);
  assert.strictEqual(endF.id, FORVENTET[roleId].foerste,
    `${roleId}: forsiktig/ærlig spill => ${FORVENTET[roleId].foerste}, fikk ${endF.id} (score ${endF.score})`);
  assert.ok(endF.tekst && endF.tekst.length > 40, roleId + ": endingen har fortellende tekst");

  const hensynsloest = playFullWeek(content, siste);
  const endH = Endings.resolveEnding(hensynsloest, content);
  assert.strictEqual(endH.id, FORVENTET[roleId].siste,
    `${roleId}: hensynsløst spill => ${FORVENTET[roleId].siste}, fikk ${endH.id} (score ${endH.score})`);
  assert.notStrictEqual(endF.id, endH.id, roleId + ": to mønstre gir to ulike slutter");
}

// --- Fallback: tom sluttilstand scorer ingenting => standard-endingen ---
{
  const content = build("renholder");
  const tomState = State.createInitialState(content); // ingen valg tatt
  const end = Endings.resolveEnding(tomState, content);
  const std = content.role.endings.find((e) => e.standard);
  assert.strictEqual(end.id, std.id, "uten signaler faller vi tilbake på standard-endingen");
  assert.strictEqual(end.standard, true, "fallback er merket standard");
}

// --- Validatoren feiler hardt på kriterier mot ukjente signaler ---
const arb = manifest.roles.arbeidsledig;
const raw = {
  role: readJson(arb.role),
  phaseDefinitions: readJson(manifest.shared.phaseDefinitions),
  roleThreads: readJson(arb.threads),
  roleScenes: readJson(arb.scenes),
  lifeThreads: readJson(manifest.life.threads),
  lifeScenes: readJson(manifest.life.scenes)
};
Content.buildContent(raw); // gyldig utgangspunkt
assert.throws(() => {
  const broken = JSON.parse(JSON.stringify(raw));
  broken.role.endings[0].kriterier = { meters: { lykke: { min: 5 } } };
  Content.buildContent(broken);
}, /kriterier\.meters ukjent nøkkel/, "kriterium mot ukjent måler skal kaste");
assert.throws(() => {
  const broken = JSON.parse(JSON.stringify(raw));
  broken.role.endings.forEach((e) => { delete e.standard; });
  Content.buildContent(broken);
}, /forventet nøyaktig én standard-ending/, "null standard-endinger skal kaste");

// --- UI-kontrakten: siste dag viser slutten, ikke «Start neste dag» ---
const uiSource = fs.readFileSync(path.join(ROOT, "js/Civication/ui/CivicationLifestoryUI.js"), "utf8");
assert.ok(uiSource.includes("CivicationLifestoryEndings") && uiSource.includes("isFinalDay"),
  "UI-et kårer en slutt på siste dag");
assert.ok(uiSource.includes("civi-lifestory-ending"), "UI-et rendrer ending-seksjonen");

console.log("civication lifestory endings ok (4 roller, forsiktig vs hensynsløst kårer ulike slutter)");
