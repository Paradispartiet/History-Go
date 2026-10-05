const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const C = require("../js/Civication/lifestory/lifestoryContent");
const S = require("../js/Civication/lifestory/lifestoryState");
const R = require("../js/Civication/lifestory/lifestoryRunner");
const E = require("../js/Civication/lifestory/lifestoryEndings");
const root = path.join(__dirname, "..");
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const clone = value => JSON.parse(JSON.stringify(value));
const manifest = read(C.MANIFEST_PATH), entry = manifest.roles.arbeidsledig;
const raw = { role: read(entry.role), roleThreads: read(entry.threads), roleScenes: read(entry.scenes),
  phaseDefinitions: read(manifest.shared.phaseDefinitions), lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes) };
const base = C.buildContent(raw);
const pack = read("data/Civication/lifestory/continuations/musikk_med_mira.json");
const next = base.role.symposium.fortsettelser[0];
const baseText = JSON.stringify(base);
const content = C.appendContinuation(base, pack);
assert.equal(JSON.stringify(base), baseText, "append leaves original first week untouched");
const musician = { badge_id: "musikk", label: "Frilansmusiker" };
let primary = musician;
globalThis.CivicationLifePositions = { getLifeContext: () => ({ primary_life_position: primary, active_life_positions: [musician] }) };

function week(overrides = {}) {
  let state = S.createInitialState(base);
  while (true) {
    while (!state.dagFerdig) {
      const scene = R.selectNextScene(state, base);
      const choice = scene.valg.find(c => c.id === overrides[scene.id]) || scene.valg[0];
      R.applyChoice(state, base, scene.id, choice.id);
      state = clone(state);
    }
    if (state.dag === 7) return state;
    R.startNextDay(state, base);
  }
}

const pasts = [
  { name: "spilt", choices: {} },
  { name: "avslaatt", choices: { d5_booker: "avsta" } },
  { name: "sen_prove", choices: { d3_mira_telefon: "lytte_forst", d4_mira_lyttingen: "prove_dag6" } }
];
const seen = new Set();
let runs = 0;
for (const past of pasts) {
  const queue = [{}], covered = new Set();
  while (queue.length) {
    const overrides = queue.shift(), actual = {};
    let state = week(past.choices);
    const archive = clone(state.arkiv), meters = clone(state.meters), relations = clone(state.relasjoner), flags = clone(state.tidligereValg);
    const firstEnding = E.resolveEnding(state, base);
    assert.ok(R.canStartContinuation(state, base, next));
    R.startContinuation(state, base, content, pack.id, firstEnding);
    assert.equal(state.dag, 8);
    assert.deepEqual(state.arkiv, archive);
    assert.deepEqual(state.meters, meters);
    assert.deepEqual(state.relasjoner, relations);
    assert.deepEqual(state.tidligereValg, flags);
    assert.equal(state.threadState.nav_og_meldekortet.status, "completed");
    assert.ok(!R.canStartContinuation(state, content, next));
    assert.equal(R.selectNextScene(state, content).id, past.name === "spilt" ? "d8_mira_etter_settet" : "d8_mira_uten_sett");
    while (true) {
      while (!state.dagFerdig) {
        const scene = R.selectNextScene(state, content);
        assert.ok(scene && scene.dag === state.dag);
        const choice = scene.valg.find(c => c.id === overrides[scene.id]) || scene.valg[0];
        const key = scene.id + "/" + choice.id;
        if (!covered.has(key)) {
          covered.add(key); seen.add(key);
          for (const other of scene.valg) if (other.id !== choice.id && !covered.has(scene.id + "/" + other.id)) queue.push({ ...actual, [scene.id]: other.id });
        }
        actual[scene.id] = choice.id;
        R.applyChoice(state, content, scene.id, choice.id);
        state = clone(state);
        const restored = C.appendContinuation(C.buildContent(clone(raw)), pack);
        S.reconcileContent(state, restored);
        assert.deepEqual(state.arkiv.slice(0, archive.length), archive);
        assert.deepEqual(state.kapittelArkiv[0].ending, firstEnding);
        if (state.tidligereValg.mira_ny_prove_avbrutt) {
          assert.ok(!state.tidligereValg.mira_ny_prove_gjennomfort);
          assert.ok(!state.spilteScener.includes("d10_mira_proven"));
        }
        assert.ok(state.arkiv.filter(e => e.dag > 7).every(e => pack.scenes.some(s => s.id === e.sceneId)));
      }
      if (state.dag === 10) break;
      R.startNextDay(state, content);
    }
    assert.ok(state.tidligereValg.musikk_kapittel_avsluttet);
    assert.equal(E.isFinalDay(state, content), true);
    assert.equal(state.threadState.musikken_videre_med_mira.status, "completed");
    const meeting = R.getSymposium(state, content).moter.find(m => m.id === "mira_ny_prove10");
    if (state.tidligereValg.mira_ny_prove_avbrutt) {
      assert.equal(meeting.status, "avbrutt");
      assert.equal(E.resolveEnding(state, content).id, "musikk_avklarte_avlysningen");
    } else if (state.tidligereValg.mira_ny_prove_gjennomfort) {
      assert.equal(meeting.status, "gjennomfort");
      assert.equal(E.resolveEnding(state, content).id, "musikk_motte_mira");
    } else {
      assert.equal(meeting, undefined);
      assert.equal(E.resolveEnding(state, content).id, "musikk_egen_tid");
    }
    assert.equal(state.meters.penger, meters.penger, "no story choice grants income");
    assert.ok(++runs < 100);
  }
}
assert.equal(seen.size, pack.scenes.reduce((n, s) => n + s.valg.length, 0), "every new scene and choice has been played");
const locked = week(), lockedText = JSON.stringify(locked);
for (const wrong of [null, { badge_id: "by", label: "Byvandrer" }, { badge_id: "musikk", label: "Konsertgjenger" }, { badge_id: "by", label: "Frilansmusiker" }]) {
  primary = wrong;
  assert.equal(R.canStartContinuation(locked, base, next), false);
  assert.throws(() => R.startContinuation(locked, base, content, pack.id, E.resolveEnding(locked, base)), /ikke tilgjengelig/);
  assert.equal(JSON.stringify(locked), lockedText);
}
primary = musician;
assert.equal(R.canStartContinuation(week({ d2_en_retning: "prosjekt" }), base, next), false);
const paused = clone(locked);
R.startContinuation(paused, base, content, pack.id, E.resolveEnding(paused, base));
const pending = R.selectNextScene(paused, content), pausedText = JSON.stringify(paused);
primary = null;
assert.equal(R.isContinuationPaused(paused, content), true);
assert.equal(R.getView(paused, content).scene, null);
assert.throws(() => R.applyChoice(paused, content, pending.id, pending.valg[0].id), /ikke tilgjengelig/);
assert.throws(() => R.startNextDay(paused, content), /pause/);
R.advance(paused, content);
assert.equal(JSON.stringify(paused), pausedText);
delete globalThis.CivicationLifePositions;
assert.equal(R.isContinuationPaused(paused, content), true);
globalThis.CivicationLifePositions = { getLifeContext: () => ({ primary_life_position: musician }) };
assert.equal(R.selectNextScene(paused, content).id, pending.id);
for (const mutate of [
  p => { p.id = "unknown"; }, p => { p.schema = "other"; }, p => { p.role_scope = "by_byvandrer"; },
  p => { p.scenes[0].dag = 7; }, p => { p.scenes[0].stedId = "unknown"; },
  p => { p.threads[0].id = "unknown"; }, p => { p.scenes[0].valg[0].effekter = {}; },
  p => { p.moter[0].gjennomfort = "invented"; }, p => { p.endings = []; }
]) {
  const bad = clone(pack); mutate(bad);
  assert.throws(() => C.appendContinuation(base, bad));
  assert.equal(JSON.stringify(base), baseText);
}
assert.throws(() => C.appendContinuation(content, pack), /ugyldig/);
delete globalThis.CivicationLifePositions;

// Real DOM, loader, runner and storage: fetch failure stays atomic, reload
// before shell boot pauses honestly, then identity resumes the same scene.
async function uiTest() {
  async function boot(saved, initialPrimary = null) {
    const dom = new JSDOM('<!doctype html><body class="civi-app"><div id="civiLifestoryPanel"></div></body>', { url: "http://localhost/Civication.html", runScripts: "outside-only" });
    const w = dom.window;
    let role = initialPrimary, fail = false;
    const errors = [];
    w.console.error = (...args) => errors.push(args);
    if (saved) w.localStorage.setItem("civication_lifestory_v1", JSON.stringify(saved));
    w.fetch = async p => ({ ok: !(fail && String(p).includes("/continuations/")), json: async () => read(String(p)) });
    w.CivicationLifePositions = { getLifeContext: () => ({ primary_life_position: role }) };
    for (const name of ["lifestoryContent", "lifestoryState", "lifestoryRunner", "lifestoryEndings"]) w.eval(fs.readFileSync(path.join(root, "js/Civication/lifestory/" + name + ".js"), "utf8"));
    w.eval(fs.readFileSync(path.join(root, "js/Civication/ui/CivicationLifestoryUI.js"), "utf8"));
    for (let i = 0; i < 40 && !w.CivicationLifestoryUI.getCurrentSceneInfo(); i++) await new Promise(r => setTimeout(r, 5));
    const panel = w.document.getElementById("civiLifestoryPanel");
    return { dom, w, panel, errors, setRole(value) { role = value; w.dispatchEvent(new w.Event("updateProfile")); }, fail(value) { fail = value; } };
  }
  const first = await boot(locked);
  assert.equal(first.panel.querySelector("[data-lifestory-continue]"), null);
  first.setRole(musician);
  assert.ok(first.panel.querySelector("[data-lifestory-continue]"));
  first.fail(true);
  first.panel.querySelector("[data-lifestory-continue]").click();
  await new Promise(r => setTimeout(r, 20));
  assert.ok(first.panel.querySelector('[role="alert"]'));
  assert.equal(JSON.stringify(first.w.CivicationLifestoryState.load()), lockedText);
  first.fail(false);
  first.panel.querySelector("[data-lifestory-continue]").click();
  await new Promise(r => setTimeout(r, 20));
  const day8 = first.w.CivicationLifestoryState.load();
  assert.equal(day8.dag, 8);
  assert.equal(first.errors.length, 1, "only the injected fetch failure");
  first.dom.window.close();
  const reload = await boot(day8);
  assert.ok(reload.panel.querySelector("[data-lifestory-paused]"));
  assert.equal(reload.panel.querySelector("[data-lifestory-choice]"), null);
  assert.equal(JSON.stringify(reload.w.CivicationLifestoryState.load()), JSON.stringify(day8));
  reload.setRole(musician);
  assert.equal(reload.w.CivicationLifestoryUI.getCurrentSceneInfo().sceneId, "d8_mira_etter_settet");
  const chapters = reload.panel.querySelector("[data-lifestory-symposium]").textContent;
  assert.ok(chapters.includes("Avsluttede kapitler") && chapters.includes(day8.kapittelArkiv[0].ending.navn));
  reload.panel.querySelector('[data-lifestory-choice="hjemme"]').click();
  assert.equal(reload.w.CivicationLifestoryState.load().arkiv.length, day8.arkiv.length + 1);
  reload.setRole(null);
  assert.equal(reload.panel.querySelector("[data-lifestory-next-day]"), null);
  reload.setRole(musician);
  reload.panel.querySelector("[data-lifestory-restart]").click();
  const reset = reload.w.CivicationLifestoryState.load();
  assert.equal(reset.dag, 1); assert.equal(reset.fortsettelseId, undefined); assert.equal(reset.arkiv.length, 0);
  assert.equal(reload.w.CivicationLifestoryUI.getCurrentSceneInfo().sceneId, "privat_morgen_start");
  assert.equal(reload.errors.length, 0);
  reload.dom.window.close();
  console.log(`Mira continuation: ${runs} full ten-day paths, ${seen.size} new choices; DOM, reload, pause, cancellation and atomic load failure pass`);
}
uiTest().catch(error => { console.error(error); process.exitCode = 1; });
