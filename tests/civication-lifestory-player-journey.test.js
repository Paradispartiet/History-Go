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

  const missingResolver = await boot({ configure(w) {
    delete w.CivicationCareerRoleResolver;
  } });
  assert.ok(missingResolver.panel.querySelector('[data-lifestory-role-status="error"]'),
    "missing resolver has a recoverable explanation instead of a permanent spinner");
  assert.ok(missingResolver.panel.querySelector("[data-lifestory-next-action]"));
  missingResolver.w.eval(fs.readFileSync(path.join(ROOT, CHAIN[0]), "utf8"));
  missingResolver.panel.querySelector("[data-lifestory-retry]").click();
  await waitFor(() => missingResolver.current().rolle === "renholder" &&
    missingResolver.panel.querySelector("[data-lifestory-choice]"), "retry after resolver arrives");
  missingResolver.close();

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
  await dayEventJourney();
  console.log("civication player journey ok (startup, choices, empty phases, pause/reload, unmapped job, race, retry, job loss)");
}

// Exercise the real selector, modal and mail writer. The day-program/engine
// fixtures are explicit boundaries: this verifies UI routing, not the authored
// coverage or economic balancing of every career package.
async function dayEventJourney() {
  const scripts = [
    "js/Civication/systems/civicationMailEngine.js",
    "js/Civication/systems/civicationNextActionSelector.js",
    "js/Civication/ui/CivicationNextActionUI.js"
  ];
  let row, runtime, phase = "forenoon", deliveries = 0, answers = 0, advances = 0;
  let lifeLabel = "Aleneforelder";
  const app = await boot({ position: warehouse, configure(w) {
    const scope = w.CivicationCareerRoleResolver.resolveCareerRoleScope(warehouse);
    row = { id: "journey_delivery", subject: "En skadet pall", situation: ["Du oppdager en skade før varen sendes."],
      mail_class: "daily_workday", role_scope: scope, status: "queued", phase,
      choices: [{ id: "report", label: "Meld fra før utsending" }] };
    runtime = { role_scope: scope, items: [row] };
    w.CivicationCalendar = { getPhase: () => phase };
    w.CivicationLifePositions = { getLifeContext: () => ({ primary_life_position: { label: lifeLabel } }) };
    w.CivicationDayProgression = {
      inspect: () => ({ phase, phaseLabel: phase === "day_end" ? "Dagslutt" : "Formiddag",
        reason: phase === "day_end" ? "at_last_phase" : "pending", canAdvance: false,
        openItemsInPhase: row ? 1 : 0,
        pendingItem: row?.status === "delivered" ? row : null,
        nextQueuedItem: row?.status === "queued" ? row : null,
        phaseBundle: { items: row ? [row] : [] } }),
      advancePhaseIfReady: () => { advances++; return { advanced: false }; }
    };
    w.CivicationDailyMailBuilder = {
      inspect: () => ({ runtime }),
      startToday: () => { throw new Error("valid preview must not rebuild the day"); },
      enqueueNext: () => {
        deliveries++;
        row.status = "delivered";
        w.CivicationMailEngine.sendMail(row);
        return { enqueued: true };
      }
    };
    w.HG_CiviEngine = { answer: async (id, choice) => {
      assert.equal(id, "journey_delivery");
      assert.equal(choice, "report");
      answers++;
      row.status = "answered";
      row = null;
      w.CivicationMailEngine.sendMail({ id: "journey_followup", subject: "Kollegaen følger opp",
        situation: ["Skaden er meldt fra om."], mail_class: "daily_workday", role_scope: scope,
        choices: [{ id: "read", label: "Les tilbakemeldingen" }] });
      return { ok: true };
    } };
    for (const file of scripts) w.eval(fs.readFileSync(path.join(ROOT, file), "utf8"));
  } });
  const { w, panel } = app;
  const savedStory = w.localStorage.getItem(KEY);
  assert.equal(panel.querySelector("h3").textContent, "En skadet pall");
  assert.match(panel.textContent, /Lager- og driftsmedarbeider/);
  assert.match(panel.textContent, /Aleneforelder/);
  assert.match(panel.textContent, /Du oppdager en skade/);
  assert.equal(panel.querySelector("[data-lifestory-next-action]").textContent, "Åpne hendelsen");
  assert.equal(w.CivicationMailEngine.getMail(row.id), null, "preview never delivers queued mail");
  assert.equal(deliveries + answers + advances, 0, "reading Min dag has no gameplay side effects");
  assert.equal(panel.querySelectorAll("[data-civi-next-action-answer], [data-lifestory-choice]").length, 0);
  panel.querySelector("[data-lifestory-next-action]").click();
  await waitFor(() => w.document.querySelector("[data-civi-next-action-open-queued]"), "canonical queued surface");
  assert.equal(w.document.querySelectorAll("[data-civi-next-action-answer]").length, 0);
  w.document.querySelector("[data-civi-next-action-open-queued]").click();
  await waitFor(() => w.document.querySelector("[data-civi-next-action-answer]"), "delivered choice");
  assert.equal(deliveries, 1);
  assert.equal(panel.querySelector("[data-lifestory-next-action]").textContent, "Les og ta valg");
  const answer = w.document.querySelector("[data-civi-next-action-answer]");
  answer.click(); answer.click();
  await waitFor(() => !w.CivicationNextActionUI.isAnswerInFlight() && panel.querySelector("h3")?.textContent === "Kollegaen følger opp", "answer refreshes Min dag");
  assert.equal(answers, 1, "double click routes one consequence through the real mail writer");
  assert.equal(w.CivicationMailEngine.getMail("journey_delivery").resolved, true);
  assert.equal(w.CivicationMailEngine.getMail("journey_followup").resolved, false);
  assert.equal(w.localStorage.getItem(KEY), savedStory, "daily events do not fabricate Life Story progress");

  lifeLabel = "Student";
  w.dispatchEvent(new w.Event("civi:lifePositionChanged"));
  assert.match(panel.textContent, /Livsrolle: Student/);
  // An inbox event from a former job is hidden even if a legacy selector can
  // still see it during the handover. The recovery button remains available.
  app.setJob({ career_id: "naeringsliv", role_key: "sjafor", title: "Sjåfør" });
  await waitFor(() => panel.textContent.includes("Sjåfør"), "new unsupported job");
  assert.equal(panel.querySelector("[data-lifestory-day-event]"), null);
  app.setJob(warehouse);
  await waitFor(() => panel.querySelector("[data-lifestory-day-event]"), "return to daily event");
  w.CivicationMailEngine.archiveMail("journey_followup");
  phase = "day_end";
  w.dispatchEvent(new w.Event("civi:dayPhaseChanged"));
  assert.equal(panel.querySelector("[data-lifestory-next-action]").textContent, "Se dagslutt");
  assert.equal(advances, 0, "preview never rolls the calendar");
  app.close();

  const recovery = await boot({ position: warehouse, configure(w) {
    for (const file of scripts) w.eval(fs.readFileSync(path.join(ROOT, file), "utf8"));
  } });
  recovery.panel.querySelector("[data-lifestory-next-action]").click();
  const doc = recovery.w.document;
  await waitFor(() => doc.querySelector("[data-civi-next-action-retry]"), "recoverable missing daily builder");
  assert.match(doc.getElementById("civiNextActionModalBody").textContent, /Dagens hendelser kunne ikke hentes/);
  assert.doesNotMatch(doc.getElementById("civiNextActionModalBody").textContent, /role_scope|missing_daily_mail_builder/);
  recovery.w.DEBUG = true;
  recovery.w.CivicationNextActionUI.render();
  assert.match(doc.querySelector(".civi-next-action-debug-error").textContent, /missing_daily_mail_builder/);
  recovery.w.DEBUG = false;
  let starts = 0;
  recovery.w.CivicationDailyMailBuilder = {
    startToday: () => {
      starts++;
      recovery.w.CivicationMailEngine.sendMail({ id: "recovered", subject: "Hendelsen er tilbake", situation: ["Du kan fortsette dagen."],
        mail_class: "daily_private", choices: [{ id: "continue", label: "Fortsett" }] });
      return { ok: true };
    }
  };
  doc.querySelector("[data-civi-next-action-retry]").click();
  await waitFor(() => doc.querySelector("[data-civi-next-action-answer]") && recovery.panel.querySelector("[data-lifestory-day-event]"), "retry recovers real event");
  assert.equal(starts, 1);
  assert.equal(doc.querySelector("[data-civi-next-action-retry]"), null);
  assert.equal(recovery.panel.querySelector("h3").textContent, "Hendelsen er tilbake");
  recovery.close();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
