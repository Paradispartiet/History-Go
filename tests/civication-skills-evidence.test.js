#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
let state = { job_learning_progress: { role_a: { steps: 3 } }, social_standing: { by_audience: {} } };
global.window = global;
global.CivicationState = {
  getState: () => state,
  setState(patch) { state = { ...state, ...patch }; return state; }
};
vm.runInThisContext(fs.readFileSync(path.join(root, "js/Civication/systems/civicationSkills.js"), "utf8"));
const skills = global.CivicationSkills;
assert.strictEqual(skills.DEFINITIONS.length, 6, "six Skills are defined");
assert.strictEqual(skills.getViewModel(state).documented_count, 0, "unknown Skills are not fabricated");
assert(skills.getViewModel(state).skills.every(x => x.score === null && !x.measured));

const candidate = {
  source: "canonical_scene_choice",
  event_id: "scene_42",
  choice_id: "listen",
  activity_type: "listening_and_negotiating",
  skill_id: "social_awareness",
  delta: 2
};
assert.strictEqual(skills.practicePatch(state, { ...candidate, source: "history_go_quiz" }).applied, false);
assert.strictEqual(skills.practicePatch(state, { ...candidate, event_id: "" }).applied, false);
assert.strictEqual(skills.practicePatch(state, { ...candidate, choice_id: "" }).applied, false);
assert.strictEqual(skills.practicePatch(state, { ...candidate, skill_id: "money" }).applied, false);
assert.strictEqual(skills.practicePatch(state, { ...candidate, delta: 100 }).applied, false);
assert.strictEqual(skills.practicePatch(state, { ...candidate, activity_type: "" }).applied, false);

const bridgeHandlers = {};
global.CivicationChoiceDirector = {
  registerHandler(name, fn) { bridgeHandlers[name] = fn; return true; }
};
vm.runInThisContext(fs.readFileSync(path.join(root, "js/Civication/systems/civicationSkillsPracticeBridge.js"), "utf8"));
const bridge = bridgeHandlers.documented_skills_practice;
assert(bridge, "uses the canonical choice director");
const context = {
  eventId: "scene_42", choiceId: "listen", result: { ok: true },
  choice: { skills_practice: { skill_id: "social_awareness", delta: 2, activity_type: "listening_and_negotiating" } }
};
assert.strictEqual(bridge({ ...context, choice: {} }), null, "no implicit credits");
assert.strictEqual(bridge({ ...context, result: { ok: false } }), null, "failed choice gives no credit");
const first = bridge(context);
assert(first.applied);
assert.strictEqual(first.after, 2);
assert.strictEqual(skills.getViewModel(state).documented_count, 1);
assert.strictEqual(skills.getViewModel(state).skills.find(x => x.id === "social_awareness").score, 2);
assert.strictEqual(bridge(context).reason, "already_counted", "replaying the same choice is idempotent");
assert.strictEqual(bridge({ ...context, choiceId: "different" }).reason, "already_counted", "same event cannot earn again");
assert.strictEqual(state.job_learning_progress.role_a.steps, 3, "existing job learning untouched");
assert.deepStrictEqual(state.social_standing, { by_audience: {} }, "separate social standing remains unchanged");

// Persisted JSON is sufficient to retain skills and dedup on a new page load.
const restored = JSON.parse(JSON.stringify(state));
assert.strictEqual(skills.practicePatch(restored, candidate).reason, "already_counted");
const nearCap = { skills_v1: { scores: { agency: 99 }, applied_event_ids: {} } };
const final = skills.practicePatch(nearCap, { ...candidate, skill_id: "agency", event_id: "new_scene", delta: 3 });
assert.strictEqual(final.after, 100, "score is clamped to 0–100");
assert.strictEqual(skills.render(), false, "no browser DOM required to compute Skills");
console.log("civication Skills evidence and replay checks ok");


// Authored Life Story + DOM integration checks share this established Skills test
// so the governed career-gameplay evidence matrix remains unchanged.
(async function authoredSkillsScenarioTest() {
// Authored Skills are proven by a real Life Story click, not by page visits,
// quiz reads, or undocumented metadata. Runs under the Civication suite glob.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const ROOT = path.resolve(__dirname, "..");
const Content = require("../js/Civication/lifestory/lifestoryContent");
const SkillsPath = "js/Civication/systems/civicationSkills.js";
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const js = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const manifest = read(Content.MANIFEST_PATH);

const authored = [
  ["arbeidsledig", "meldekort_01_fristen", "ring_veilederen", "agency"],
  ["arbeidsledig", "rytme_01_dagen_flyter", "eget_prosjekt", "creativity"],
  ["arbeidsledig", "d3_soknad_svar", "les_hva_de_saa_etter", "wisdom_judgement"],
  ["life", "privat_kveld_svar", "svar_aerlig", "social_awareness"],
  ["ekspeditor", "apning_01_forste_okt", "sjekk_plakatene", "practical_mastery"],
  ["ekspeditor", "d2_formiddag_vikaren_kommer_til_deg", "laer_bort_metoden", "communication"]
];

function build(roleId) {
  const role = manifest.roles[roleId];
  return Content.buildContent({
    role: read(role.role), roleThreads: read(role.threads), roleScenes: read(role.scenes),
    phaseDefinitions: read(manifest.shared.phaseDefinitions),
    lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
  });
}

const unemployedContent = build("arbeidsledig");
const expeditorContent = build("ekspeditor");
const ids = new Set();
for (const [role, sceneId, choiceId, skillId] of authored) {
  const pack = role === "ekspeditor" ? expeditorContent : unemployedContent;
  const scene = pack.scenes.find(x => x.id === sceneId);
  const choice = scene?.valg.find(x => x.id === choiceId);
  assert(choice, "authored scene/choice exists: " + sceneId + "/" + choiceId);
  assert.equal(choice.skills_practice?.skill_id, skillId);
  assert.equal(choice.effekter?.flagg?.[choice.skills_practice.evidence_flag], true,
    "practice is backed by a real changed story flag");
  ids.add(skillId);
}
assert.equal(ids.size, 6, "all six Skills are reachable in authored story content");

// Metadata cannot award for missing evidence or arbitrary point grants.
const raw = manifest.roles.arbeidsledig;
const packageForValidation = {
  role: read(raw.role), roleThreads: read(raw.threads), roleScenes: read(raw.scenes),
  phaseDefinitions: read(manifest.shared.phaseDefinitions),
  lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
};
for (const bad of [
  { skill_id: "agency", activity_type: "fake_action", evidence_flag: "never_occurred", delta: 2 },
  { skill_id: "agency", activity_type: "fake_action", evidence_flag: "ryddet_dokumentasjon", delta: 99 },
  { skill_id: "unknown_skill", activity_type: "fake_action", evidence_flag: "ryddet_dokumentasjon", delta: 2 }
]) {
  const broken = JSON.parse(JSON.stringify(packageForValidation));
  broken.roleScenes.scenes.find(x => x.id === "meldekort_01_fristen")
    .valg.find(x => x.id === "ring_veilederen").skills_practice = bad;
  assert.throws(() => Content.buildContent(broken), /skills_practice/);
}

async function main() {
  const dom = new JSDOM(
    '<!doctype html><body><header id="civiLifestoryHeaderStatus"></header><section id="civiLifestoryPanel"></section></body>',
    { url: "https://example.test/Civication.html", runScripts: "outside-only" }
  );
  const w = dom.window;
  let civiState = { social_standing: { by_audience: {} }, job_learning_progress: { stable: { steps: 3 } } };
  w.CivicationState = {
    getActivePosition: () => null,
    isTestMode: () => false,
    getState: () => civiState,
    setState(patch) { civiState = { ...civiState, ...patch }; return civiState; }
  };
  w.fetch = async url => {
    const name = String(url);
    return fs.existsSync(path.join(ROOT, name))
      ? { ok: true, json: async () => read(name) } : { ok: false };
  };
  for (const script of [
    "js/Civication/lifestory/lifestoryContent.js",
    "js/Civication/lifestory/lifestoryState.js",
    "js/Civication/lifestory/lifestoryRunner.js",
    "js/Civication/lifestory/lifestoryEndings.js",
    SkillsPath,
    "js/Civication/ui/CivicationLifestoryUI.js"
  ]) w.eval(js(script));

  const buttonSelector = '[data-lifestory-scene="meldekort_01_fristen"][data-lifestory-choice="ring_veilederen"]';
  let button = null;
  for (let i = 0; i < 150; i++) {
    button = w.document.querySelector(buttonSelector);
    if (button) break;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert(button, "actual UI presents the authored NAV choice");
  button.click();
  const story = w.CivicationLifestoryState.load();
  assert(story.spilteScener.includes("meldekort_01_fristen"), "choice actually played");
  const snapshot = w.CivicationSkills.getViewModel(civiState);
  assert.equal(snapshot.skills.find(s => s.id === "agency").score, 2);
  assert.equal(snapshot.documented_count, 1);
  assert.equal(civiState.skills_v1.applied_event_ids["lifestory:meldekort_01_fristen"].evidence_flag, "ryddet_dokumentasjon");
  assert.equal(civiState.job_learning_progress.stable.steps, 3, "job learning preserved");
  assert.equal(w.localStorage.getItem("merits_by_category"), null, "no History Go points minted");
  assert.equal(w.CivicationSkills.applyPractice({
    source: "life_story_choice", event_id: "lifestory:meldekort_01_fristen",
    choice_id: "ring_veilederen", skill_id: "agency",
    activity_type: "complete_public_documents", evidence_flag: "ryddet_dokumentasjon", delta: 2
  }).reason, "already_counted", "replay cannot double award");

  const roundTrip = JSON.parse(JSON.stringify(civiState));
  assert.equal(w.CivicationSkills.getViewModel(roundTrip).skills.find(s => s.id === "agency").score, 2,
    "Skills survive serialization for canonical storage");
  dom.window.close();
  console.log("Civication authored Life Story Skills: six practices, UI click, replay guard OK");
}

await main();

})().catch(e => { console.error(e); process.exitCode = 1; });
