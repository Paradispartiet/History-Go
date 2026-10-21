#!/usr/bin/env node
// The real seven-day unemployed story reaches a visible chapter gate, with
// a route to History Go that never creates merits, a job or a life position.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const ROOT = path.resolve(__dirname, "..");
const C = require("../js/Civication/lifestory/lifestoryContent");
const S = require("../js/Civication/lifestory/lifestoryState");
const R = require("../js/Civication/lifestory/lifestoryRunner");
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

const manifest = read(C.MANIFEST_PATH);
const entry = manifest.roles.arbeidsledig;
const content = C.buildContent({
  role: read(entry.role), roleThreads: read(entry.threads), roleScenes: read(entry.scenes),
  phaseDefinitions: read(manifest.shared.phaseDefinitions),
  lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
});
function finishDay(state) {
  for (let i = 0; i < 200 && !state.dagFerdig; i++) {
    const scene = R.selectNextScene(state, content);
    if (!scene) { R.advance(state, content); continue; }
    const route = { d2_en_retning: "prosjekt", d7_prosjekt_videre: "naeringsliv_sideprosjektbygger" };
    const selected = scene.valg.find(choice => choice.id === route[scene.id]) || scene.valg[0];
    R.applyChoice(state, content, scene.id, selected.id);
  }
  assert.equal(state.dagFerdig, true, "authored day terminates");
}
async function main() {
  const save = S.createInitialState(content);
  for (let day = 1; day <= 7; day++) {
    finishDay(save);
    if (day < 7) R.startNextDay(save, content);
  }
  assert.equal(save.dag, 7);
  assert.equal(save.tidligereValg.arbeidsledig_rolleforslag, "naeringsliv_sideprosjektbygger");
  assert.equal(save.rolleBytter.length, 0, "no fabricated job changes");
  const dom = new JSDOM('<!doctype html><body><header id="civiLifestoryHeaderStatus"></header><section id="civiLifestoryPanel"></section></body>', {
    url: "https://example.test/Civication.html", runScripts: "outside-only"
  });
  const w = dom.window;
  w.localStorage.setItem(S.STORAGE_KEY, JSON.stringify(save));
  w.fetch = async url => {
    const file = path.join(ROOT, String(url));
    return fs.existsSync(file) ? { ok: true, json: async () => read(String(url)) } : { ok: false };
  };
  w.CivicationState = { getActivePosition: () => null };
  const actions = [], guides = [];
  for (const script of [
    "js/Civication/systems/civicationCareerRoleResolver.js",
    "js/Civication/lifestory/lifestoryContent.js",
    "js/Civication/lifestory/lifestoryState.js",
    "js/Civication/lifestory/lifestoryRunner.js",
    "js/Civication/lifestory/lifestoryEndings.js"
  ]) w.eval(fs.readFileSync(path.join(ROOT, script), "utf8"));
  w.CivicationLifestoryActions = { perform: action => { actions.push(action); return { utfoert: true }; } };
  w.CivicationHistoryGoDeepLink = { startLifePositionGuidance: bridge => { guides.push(bridge); return {}; } };
  w.eval(fs.readFileSync(path.join(ROOT, "js/Civication/ui/CivicationLifestoryUI.js"), "utf8"));
  const panel = w.document.getElementById("civiLifestoryPanel");
  for (let i = 0; i < 200 && !panel.querySelector("[data-lifestory-study]"); i++) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.match(panel.textContent, /Veien videre/);
  assert.match(panel.textContent, /Sideprosjektbygger/);
  assert.match(panel.textContent, /0 av 10 poeng/);
  assert.equal(panel.querySelector("[data-lifestory-continue]"), null,
    "locked story never exposes an unauthorized continuation");
  const before = w.localStorage.getItem(S.STORAGE_KEY);
  panel.querySelector("[data-lifestory-study]").click();
  assert.equal(guides.length, 1, "the existing cross-app mission is started");
  assert.equal(guides[0].badge_id, "naeringsliv");
  assert.equal(guides[0].threshold, 10);
  assert.deepEqual(actions[0], { type: "gaa_til_byen" });
  assert.equal(w.localStorage.getItem("merits_by_category"), null,
    "no badge points are minted by the chapter gate");
  assert.equal(w.localStorage.getItem(S.STORAGE_KEY), before,
    "learning navigation never alters story progress");
  panel.querySelector("[data-lifestory-life-profile]").click();
  assert.deepEqual(actions[1], { type: "aapne_livsposisjoner" });
  dom.window.close();
  console.log("Civication day-seven chapter gate shows a genuine cross-app learning path");
}
main().catch(e => { console.error(e); process.exitCode = 1; });
