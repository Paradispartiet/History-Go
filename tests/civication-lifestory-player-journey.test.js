#!/usr/bin/env node
// Production content/resolver/UI: recover empty phases without losing choices,
// follow the actual job, and keep unmapped jobs out of a former job's story.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const ROOT = path.join(__dirname, "..");
const KEY = "civication_lifestory_v1";
const cleaner = { career_id: "naeringsliv", role_key: "renholder", title: "Renholder" };
const clerk = { career_id: "naeringsliv", role_key: "ekspeditor", title: "Ekspeditør" };
const warehouse = { career_id: "naeringsliv", role_key: "lager_og_driftsmedarbeider", title: "Lager- og driftsmedarbeider" };
const CHAIN = [
  "js/Civication/systems/civicationCareerRoleResolver.js",
  "js/Civication/lifestory/lifestoryContent.js",
  "js/Civication/lifestory/lifestoryState.js",
  "js/Civication/lifestory/lifestoryRunner.js",
  "js/Civication/lifestory/lifestoryEndings.js"
];
async function waitFor(check, label) {
  for (let i = 0; i < 200; i++) {
    if (check()) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error("Timed out: " + label);
}
async function boot({ position = cleaner, save = null, configure = () => {} } = {}) {
  const dom = new JSDOM('<!doctype html><body><header id="civiLifestoryHeaderStatus"></header><section id="civiLifestoryPanel"></section></body>', {
    url: "https://example.test/Civication.html", runScripts: "outside-only"
  });
  const w = dom.window;
  if (save) w.localStorage.setItem(KEY, JSON.stringify(save));
  w.fetch = async resource => {
    const file = path.join(ROOT, String(resource));
    return fs.existsSync(file) ? { ok: true, json: async () => JSON.parse(fs.readFileSync(file, "utf8")) } : { ok: false };
  };
  let active = position;
  let opened = 0;
  w.CivicationState = { getActivePosition: () => active };
  w.CivicationNextActionUI = { open: () => { opened++; } };
  for (const file of CHAIN) w.eval(fs.readFileSync(path.join(ROOT, file), "utf8"));
  await configure(w);
  w.eval(fs.readFileSync(path.join(ROOT, "js/Civication/ui/CivicationLifestoryUI.js"), "utf8"));
  const panel = w.document.getElementById("civiLifestoryPanel");
  const current = () => JSON.parse(w.localStorage.getItem(KEY));
  await waitFor(() => panel.children.length && !panel.querySelector('[data-lifestory-role-status="loading"]'), "initial job adoption");
  return {
    w, panel, current, close: () => dom.window.close(), opened: () => opened,
    setJob(next) { active = next; w.dispatchEvent(new w.Event("updateProfile")); }
  };
}
async function main() {
  // The shell may already be ready before this UI subscribes to boot events.
  const app = await boot();
  assert.equal(app.current().rolle, "renholder");
  assert.ok(app.panel.querySelector("[data-lifestory-choice]"));
  app.panel.querySelector("[data-lifestory-choice]").click();
  assert.equal(app.current().arkiv.length, 1);
  assert.ok(app.panel.querySelector(".civi-lifestory-konsekvens"), "choice has visible feedback");
  const beforeUnsupported = app.current();

  app.setJob(warehouse);
  await waitFor(() => app.panel.querySelector('[data-lifestory-role-status="unavailable"]'), "unmapped job explanation");
  assert.ok(!app.panel.querySelector("[data-lifestory-choice]"), "former job cannot keep playing");
  assert.equal(app.w.CivicationLifestoryUI.getPendingWaveAEvent(), null);
  assert.equal(app.w.CivicationLifestoryUI.getCurrentSceneInfo(), null);
  assert.equal(app.w.CivicationLifestoryUI.getDaySyncState(), null, "inactive former story cannot block the shell day");
  assert.deepEqual(app.current(), beforeUnsupported, "unsupported job does not replace or fabricate a story save");
  app.panel.querySelector("[data-lifestory-next-action]").click();
  assert.equal(app.opened(), 1, "player reaches the existing NextAction UI");

  const reload = await boot({ position: warehouse, save: app.current() });
  assert.ok(reload.panel.querySelector('[data-lifestory-role-status="unavailable"]'));
  assert.deepEqual(reload.current().arkiv, beforeUnsupported.arkiv);
  reload.close();
  app.setJob(cleaner);
  await waitFor(() => app.panel.querySelector("[data-lifestory-choice]"), "return to cleaner");
  assert.deepEqual(app.current().arkiv, beforeUnsupported.arkiv);

  // A position change while the manifest is being fetched is not discarded.
  const resolve = app.w.CivicationLifestoryContent.resolveRoleIdForActivePosition;
  let release, resolving = false;
  app.w.CivicationLifestoryContent.resolveRoleIdForActivePosition = async active => {
    if (active.role_key === "ekspeditor") {
      resolving = true;
      await new Promise(done => { release = done; });
    }
    return resolve(active);
  };
  app.setJob(clerk);
  await waitFor(() => resolving, "delayed mapping");
  app.setJob(cleaner);
  release();
  await waitFor(() => app.panel.querySelector("[data-lifestory-choice]"), "cancelled switch returns to the already adopted job");
  assert.deepEqual(app.current().arkiv, beforeUnsupported.arkiv);
  resolving = false;
  app.setJob(clerk);
  await waitFor(() => resolving, "second delayed mapping");
  app.setJob(warehouse);
  release();
  await waitFor(() => app.panel.querySelector('[data-lifestory-role-status="unavailable"]'), "latest job wins");
  assert.equal(app.current().rolle, "renholder", "stale clerk mapping was never committed");

  // A failed lookup can actually be retried; failure is not memoized.
  const warnings = [];
  const warn = app.w.console.warn;
  app.w.console.warn = (...args) => warnings.push(args);
  app.w.CivicationLifestoryContent.resolveRoleIdForActivePosition = async () => { throw new Error("temporary lookup failure"); };
  app.setJob(clerk);
  await waitFor(() => app.panel.querySelector("[data-lifestory-retry]"), "recoverable error");
  assert.equal(warnings.length, 1, "lookup failure is logged once");
  app.w.console.warn = warn;
  assert.equal(app.w.CivicationLifestoryUI.getDaySyncState().dagFerdig, false, "failed mapping cannot skip unfinished story");
  app.w.CivicationLifestoryContent.resolveRoleIdForActivePosition = resolve;
  app.panel.querySelector("[data-lifestory-retry]").click();
  await waitFor(() => app.current().rolle === "ekspeditor", "retry adopts correct role");
  app.setJob(null);
  await waitFor(() => app.current().rolle === "arbeidsledig", "job loss resumes unemployment story");
  assert.deepEqual(app.current().rolleTilstander.renholder.arkiv, beforeUnsupported.arkiv);
  app.close();

  // Real content with an empty opening phase: reach the first authored scene
  // without inventing a choice, an extra story day, or a calendar rollover.
  const opening = await boot({ configure(w) {
    const load = w.CivicationLifestoryContent.loadContent;
    w.CivicationLifestoryContent.loadContent = async id => {
      const content = await load(id);
      return { ...content, faser: [{ id: "tom_start", navn: "Tidlig morgen" }, ...content.faser] };
    };
  } });
  assert.ok(opening.panel.querySelector("[data-lifestory-choice]"));
  assert.notEqual(opening.current().fase, "tom_start");
  assert.equal(opening.current().dag, 1);
  assert.equal(opening.current().arkiv.length, 0);
  opening.close();

  const quiet = await boot({ configure(w) {
    const load = w.CivicationLifestoryContent.loadContent;
    w.CivicationLifestoryContent.loadContent = async id => {
      const content = await load(id);
      return { ...content, scenes: content.scenes.filter(scene => scene.dag !== 1) };
    };
  } });
  assert.equal(quiet.current().dagFerdig, true, "empty day has an actionable summary");
  assert.equal(quiet.current().arkiv.length, 0, "empty phases do not fabricate choices");
  quiet.panel.querySelector("[data-lifestory-next-day]").click();
  assert.equal(quiet.current().dag, 2);
  assert.ok(quiet.panel.querySelector("[data-lifestory-choice]"), "next authored day remains playable");
  quiet.close();

  // Pausing a real Wave scene must survive load-time empty-phase recovery.
  let pausedId;
  const paused = await boot({ configure: async w => {
    const content = await w.CivicationLifestoryContent.loadContent("renholder");
    const state = w.CivicationLifestoryState.createInitialState(content);
    const runner = w.CivicationLifestoryRunner;
    for (let i = 0; i < 200; i++) {
      const scene = runner.selectNextScene(state, content);
      if (scene?.id.startsWith("wave_a_c17_")) {
        pausedId = scene.id;
        state.threadState[scene.threadId].status = "dormant";
        state.tidligereValg["wa_paused_" + scene.threadId] = "active";
        w.CivicationLifestoryState.save(state);
        const load = w.CivicationLifestoryContent.loadContent;
        w.CivicationLifestoryContent.loadContent = async id => {
          const loaded = await load(id);
          return { ...loaded, scenes: loaded.scenes.filter(s =>
            s.dag !== state.dag || s.fase !== state.fase || s.id === pausedId) };
        };
        return;
      }
      if (scene) runner.applyChoice(state, content, scene.id, scene.valg[0].id);
      else if (state.dagFerdig) runner.startNextDay(state, content);
      else runner.advance(state, content);
    }
    throw new Error("Wave C17 entry not reached");
  } });
  assert.ok(paused.panel.querySelector("[data-lifestory-empty-phase]"));
  assert.equal(paused.current().dagFerdig, false);
  assert.ok(!paused.current().spilteScener.includes(pausedId));
  paused.panel.querySelector('[data-wave-a-command="resume"]').click();
  assert.equal(paused.panel.querySelector("[data-lifestory-choice]").getAttribute("data-lifestory-scene"), pausedId,
    "resume restores exactly the paused scene");
  paused.close();
  console.log("civication player journey ok (startup, choices, empty phases, pause/reload, unmapped job, race, retry, job loss)");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
