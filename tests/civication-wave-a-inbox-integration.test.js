#!/usr/bin/env node
// Integration boundary: actual authored Life Story scenes -> real Min dag DOM
// -> canonical Civication mail store -> the *same* Life Story runner and save.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const source = p => fs.readFileSync(path.join(root, p), 'utf8');
const clone = o => JSON.parse(JSON.stringify(o));
const manifest = read(C.MANIFEST_PATH);

function makeContent(role) {
  const entry = manifest.roles[role];
  return C.buildContent({
    role: read(entry.role),
    roleThreads: read(entry.threads),
    roleScenes: read(entry.scenes),
    phaseDefinitions: read(manifest.shared.phaseDefinitions),
    lifeThreads: read(manifest.life.threads),
    lifeScenes: read(manifest.life.scenes)
  });
}

function atWaveScene(role, type) {
  const content = makeContent(role);
  const state = S.createInitialState(content);
  let guard = 0;
  while (state.dag <= 8) {
    while (!state.dagFerdig) {
      const scene = R.selectNextScene(state, content);
      if (scene && scene.id.startsWith('wave_a_' + type + '_')) return state;
      if (scene) R.applyChoice(state, content, scene.id, scene.valg[0].id);
      else R.advance(state, content);
      assert.ok(++guard < 700, 'finite chapter progression');
    }
    R.startNextDay(state, content);
  }
  throw new Error('Could not reach authored scene ' + role + '/' + type);
}

const scripts = [
  'js/Civication/systems/civicationCareerRoleResolver.js',
  'js/Civication/lifestory/lifestoryContent.js',
  'js/Civication/lifestory/lifestoryState.js',
  'js/Civication/lifestory/lifestoryRunner.js',
  'js/Civication/lifestory/lifestoryEndings.js',
  'js/Civication/systems/civicationMailEngine.js',
  'js/Civication/ui/CivicationLifestoryUI.js',
  'js/Civication/lifestory/civicationWaveAInboxBridge.js',
  'js/Civication/lifestory/civicationWaveAPrivateRoleBridge.js'
];
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
async function waitFor(predicate, label) {
  for (let i = 0; i < 120; i++) {
    if (predicate()) return;
    await tick();
  }
  throw new Error('UI not ready: ' + label);
}

async function harness(role, type) {
  const initial = atWaveScene(role, type);
  initial.kalenderDag = initial.dag;
  const dom = new JSDOM('<!doctype html><body><div id="civiLifestoryHeaderStatus"></div>'
    + '<section id="civiLifestoryPanel"></section></body>', {
    url: 'https://example.test/Civication.html', runScripts: 'outside-only'
  });
  const { window } = dom;
  window.localStorage.setItem('civication_lifestory_v1', JSON.stringify(initial));
  const dayIndex = initial.dag;
  window.CivicationCalendar = { getClock: () => ({ dayIndex }) };
  window.CivicationState = {
    getState: () => ({}), getActivePosition: () => role === 'arealplanlegger'
      ? { career_id: 'by', role_key: 'by_radgiver_plan', title: 'Arealplanlegger' } : null,
    getInbox: () => window.CivicationMailEngine?.getInbox?.() || []
  };
  window.fetch = async resource => {
    const filename = path.join(root, String(resource).split('?')[0].replace(/^\.\//, ''));
    if (!filename.startsWith(root + path.sep) || !fs.existsSync(filename)) return { ok: false, status: 404 };
    return { ok: true, status: 200, json: async () => read(path.relative(root, filename)) };
  };
  for (const file of scripts) window.eval(source(file));
  await waitFor(() => window.CivicationLifestoryUI?.getPendingWaveAEvent?.(), role + ' scene');
  window.dispatchEvent(new window.Event('civi:booted'));
  await waitFor(() => window.CivicationMailEngine.getInbox().some(item =>
    item.event?.source_type === 'lifestory_wave_a'), role + ' inbox');
  return { window, dom, initial, panel: window.document.getElementById('civiLifestoryPanel') };
}

test('C01: single source of truth for Min dag, inbox answer, rejection and duplicate', async () => {
  const h = await harness('arbeidsledig', 'c01');
  try {
    const { window, panel } = h;
    const mail = window.CivicationMailEngine;
    const event = window.CivicationLifestoryUI.getPendingWaveAEvent();
    assert.match(event.id, /^wa_lifestory__arbeidsledig__wave_a_c01_/);
    assert.equal(event.channel, 'private');
    assert.ok(panel.querySelector('[data-wave-a-overview]'));
    const before = window.localStorage.getItem('civication_lifestory_v1');
    assert.equal((await mail.answerMail(event.id, 'not-a-choice')).ok, false);
    assert.equal(window.localStorage.getItem('civication_lifestory_v1'), before);
    assert.equal(mail.getMail(event.id).resolved, false);

    const answer = await mail.answerMail(event.id, event.choices[0].id);
    assert.equal(answer.ok, true);
    const state = window.CivicationLifestoryState.load();
    assert.equal(state.arkiv.filter(e => e.sceneId === event.lifestory_scene_id).length, 1);
    assert.equal(mail.getMail(event.id).resolved, true);
    const snapshot = clone(state);
    assert.equal((await mail.answerMail(event.id, event.choices[0].id)).ok, false);
    assert.deepEqual(clone(window.CivicationLifestoryState.load()), snapshot);
  } finally { h.dom.window.close(); }
});

test('C06: an actual role-specific story is projected as a job mail', async () => {
  const h = await harness('arealplanlegger', 'c06');
  try {
    const { window } = h;
    const event = window.CivicationLifestoryUI.getPendingWaveAEvent();
    assert.equal(event.channel, 'job');
    assert.equal(event.mail_class, 'daily_workday');
    assert.equal(event.workday_related, true);
    assert.equal(window.CivicationMailEngine.getMail(event.id).resolved, false);
  } finally { h.dom.window.close(); }
});

test('pause and return preserve a private wave-A agreement and pending envelope', async () => {
  const h = await harness('arbeidsledig', 'c01');
  try {
    const { window, panel } = h;
    const ui = window.CivicationLifestoryUI;
    const mail = window.CivicationMailEngine;
    const pending = ui.getPendingWaveAEvent();
    const archiveBefore = clone(window.CivicationLifestoryState.load().arkiv);
    const pause = panel.querySelector('[data-wave-a-thread="wave_a_c01"][data-wave-a-command="pause"]');
    assert.ok(pause, 'real pause control');
    pause.click();
    assert.equal(mail.getMail(pending.id).archived, true);
    assert.deepEqual(clone(window.CivicationLifestoryState.load().arkiv), archiveBefore);
    const resume = panel.querySelector('[data-wave-a-thread="wave_a_c01"][data-wave-a-command="resume"]');
    assert.ok(resume, 'real resume control');
    resume.click();
    assert.equal(mail.getMail(pending.id).archived, false);
    assert.equal(ui.getPendingWaveAEvent().id, pending.id);

    const original = ui.getPendingWaveAEvent;
    ui.getPendingWaveAEvent = () => null; // Simulate loss of active-role eligibility.
    window.CivicationWaveAInboxBridge.sync();
    assert.equal(mail.getMail(pending.id).archived, true);
    assert.equal(mail.getMail(pending.id).resolved, false);
    ui.getPendingWaveAEvent = original; // Return to the previous active role.
    window.CivicationWaveAInboxBridge.sync();
    assert.equal(mail.getMail(pending.id).archived, false);
    assert.deepEqual(clone(window.CivicationLifestoryState.load().arkiv), archiveBefore);
  } finally { h.dom.window.close(); }
});

test('an eligible private scene survives role change and answers into the inactive snapshot only', async () => {
  const h = await harness('arbeidsledig', 'c01');
  try {
    const { window, panel } = h;
    const State = window.CivicationLifestoryState;
    const roleContent = await window.CivicationLifestoryContent.loadContent('arealplanlegger');
    const before = State.selectRole(State.load(), roleContent);
    before.livsdag += 4; // Time has passed since the inactive job was held.
    State.save(before);
    const ui = window.CivicationLifestoryUI;
    // Adopt the new job in the actual mounted UI, not only in storage.
    window.CivicationState.getActivePosition = () => ({
      career_id: 'by', role_key: 'by_radgiver_plan', title: 'Arealplanlegger'
    });
    window.dispatchEvent(new window.Event('updateProfile'));
    await waitFor(() => ui.getDaySyncState()?.rolle === 'arealplanlegger'
      && ui.getCurrentSceneInfo()?.sceneId, 'mounted new-job scene');
    const activeArchive = clone(State.load().arkiv);
    const inactiveArchive = clone(State.load().rolleTilstander.arbeidsledig.arkiv);
    await window.CivicationWaveAPrivateRoleBridge.refresh();
    try {
      await waitFor(() => window.CivicationWaveAPrivateRoleBridge.getPendingEvent(), 'inactive private story');
      const privateEvent = window.CivicationWaveAPrivateRoleBridge.getPendingEvent();
      assert.ok(privateEvent, 'qualifying personal scene from inactive role is still playable');
      assert.equal(privateEvent.lifestory_role, 'arbeidsledig');
      assert.equal(privateEvent.channel, 'private');
      const beforeInvalid = clone(State.load());
      assert.equal((await window.CivicationMailEngine.answerMail(privateEvent.id, 'bad-id')).ok, false);
      assert.deepEqual(clone(State.load()), beforeInvalid);
      assert.equal((await window.CivicationMailEngine.answerMail(
        privateEvent.id, privateEvent.choices[0].id)).ok, true);
      const after = State.load();
      assert.equal(after.rolle, 'arealplanlegger', 'active job role is unchanged');
      assert.deepEqual(clone(after.arkiv), activeArchive, 'job-role archive is unchanged');
      assert.equal(after.rolleTilstander.arbeidsledig.arkiv.length, inactiveArchive.length + 1);
      assert.equal(after.rolleTilstander.arbeidsledig.arkiv.at(-1).sceneId, privateEvent.lifestory_scene_id);
      assert.equal(after.rolleTilstander.arbeidsledig.arkiv.at(-1).livsdag, before.livsdag,
        'a private event in an inactive role uses the current shared life day');
      const inactiveContent = await window.CivicationLifestoryContent.loadContent('arbeidsledig');
      const authored = inactiveContent.scenes.find(scene => scene.id === privateEvent.lifestory_scene_id)
        .valg.find(choice => choice.id === privateEvent.choices[0].id);
      const sharedFlags = Object.entries(authored.effekter?.flagg || {})
        .filter(([key]) => /^wa_(?:[bcde]_)?c0[15]_/.test(key));
      assert.ok(sharedFlags.length, 'the real C01 choice contains a private consequence');
      for (const [key, value] of sharedFlags) {
        assert.equal(after.tidligereValg[key], value, 'the active role knows about the actual private choice');
        assert.equal(after.privatHistorie.flagg[key], value, 'shared private memory retains the choice');
        assert.equal(after.privatHistorie.flaggDager[key], before.livsdag, 'private time anchor follows the player');
      }
      assert.ok(after.privatHistorie.arkiv.some(entry => entry.sceneId === privateEvent.lifestory_scene_id),
        'the private event enters shared history without copying into the new job archive');
      assert.equal(window.CivicationMailEngine.getMail(privateEvent.id).resolved, true);
      assert.equal((await window.CivicationMailEngine.answerMail(
        privateEvent.id, privateEvent.choices[0].id)).ok, false, 'cannot answer inactive scene twice');

      // Continue the ordinary job story without remounting the UI. Previously
      // this next save overwrote the private answer with cached top-level data.
      const jobChoice = panel.querySelector('[data-lifestory-scene][data-lifestory-choice]');
      assert.ok(jobChoice, 'the current job scene is playable in Min dag');
      const jobSceneId = jobChoice.getAttribute('data-lifestory-scene');
      assert.notEqual(jobSceneId, privateEvent.lifestory_scene_id, 'a job scene is not a former-role private scene');
      jobChoice.click();
      const continued = State.load();
      assert.ok(continued.spilteScener.includes(jobSceneId), 'ordinary job-day choice was saved');
      assert.notEqual(ui.getCurrentSceneInfo()?.sceneId, jobSceneId, 'the next story event can be reached');
      assert.equal(continued.rolle, 'arealplanlegger');
      for (const [key, value] of sharedFlags) {
        assert.equal(continued.tidligereValg[key], value, 'the private flag survives normal work');
        assert.equal(continued.privatHistorie.flagg[key], value, 'shared memory survives normal work');
        assert.equal(continued.privatHistorie.flaggDager[key], before.livsdag, 'private choice keeps its life-day anchor');
      }
      assert.ok(continued.privatHistorie.arkiv.some(entry => entry.sceneId === privateEvent.lifestory_scene_id),
        'the private event remains available to later stories');
      assert.equal(continued.rolleTilstander.arbeidsledig.arkiv.at(-1).sceneId,
        privateEvent.lifestory_scene_id, 'the inactive-role archive remains intact');

      // Follow the player through two further *mounted* job transitions. The
      // first return must not replay the private answer, and the second must
      // retain both the new job's own progress and the shared private memory.
      const playedWorkId = jobSceneId;
      window.CivicationState.getActivePosition = () => null;
      window.dispatchEvent(new window.Event('updateProfile'));
      await waitFor(() => ui.getDaySyncState()?.rolle === 'arbeidsledig'
        && State.load()?.rolle === 'arbeidsledig', 'return to former job');
      const returned = State.load();
      assert.equal(returned.livsdag, before.livsdag, 'changing jobs does not create a life day');
      assert.equal(returned.arkiv.filter(entry =>
        entry.sceneId === privateEvent.lifestory_scene_id).length, 1,
        'returning to the original role does not replay or duplicate a private scene');
      assert.ok(returned.rolleTilstander.arealplanlegger.spilteScener.includes(playedWorkId),
        'the planning job retains its actual completed work');
      for (const [key, value] of sharedFlags) {
        assert.equal(returned.tidligereValg[key], value, 'private choice survives return to former job');
        assert.equal(returned.privatHistorie.flaggDager[key], before.livsdag,
          'the life-day anchor survives a second role adoption');
      }

      window.CivicationState.getActivePosition = () => ({
        career_id: 'by', role_key: 'by_radgiver_plan', title: 'Arealplanlegger'
      });
      window.dispatchEvent(new window.Event('updateProfile'));
      await waitFor(() => ui.getDaySyncState()?.rolle === 'arealplanlegger'
        && State.load()?.rolle === 'arealplanlegger', 'return to planning job');
      const resumed = State.load();
      assert.ok(resumed.spilteScener.includes(playedWorkId),
        'the original job choice remains completed after the round trip');
      assert.equal(resumed.livsdag, before.livsdag);
      for (const [key, value] of sharedFlags) {
        assert.equal(resumed.tidligereValg[key], value, 'private choice survives a third active job');
        assert.equal(resumed.privatHistorie.flaggDager[key], before.livsdag);
      }
    } finally { /* No test-only UI override to restore. */ }
  } finally { h.dom.window.close(); }
});

test('all eight wave-A stories retain their canonical scene and source bindings', () => {
  const first = read('data/Civication/lifestory/editorial/inspiration/waveAChapterBindingsV1.json');
  const second = read('data/Civication/lifestory/editorial/inspiration/waveASecondInstallmentsV1.json');
  assert.equal(first.stories.length, 8);
  assert.equal(second.stories.length, 8);
  const ids = new Set(first.stories.map(entry => entry.story_type_id));
  assert.deepEqual(Array.from(ids).sort(), ['C01', 'C02', 'C03', 'C05', 'C06', 'C07', 'C17', 'C23']);
  let scenes = 0, choices = 0;
  for (const entry of [...first.stories, ...second.stories]) {
    const available = read(entry.runtime_path).scenes;
    for (const id of entry.scene_ids) {
      const scene = available.find(row => row.id === id);
      assert.ok(scene, 'actual scene ' + id);
      assert.ok(scene.threadId.startsWith('wave_'));
      scenes++;
      choices += scene.valg.length;
    }
  }
  assert.equal(scenes, 74);
  assert.equal(choices, 148);
});


test('a witnessed Wave D private choice reaches its exact Wave E follow-up after a job change', () => {
  // Play the published unemployment story, including actual Wave A-D choices,
  // instead of seeding fictional flags or a fabricated earlier encounter.
  const oldContent = makeContent('arbeidsledig');
  const nextContent = makeContent('arealplanlegger');
  let state = S.createInitialState(oldContent);
  let steps = 0;
  while (state.dag <= 7) {
    while (!state.dagFerdig) {
      const scene = R.selectNextScene(state, oldContent);
      if (scene) R.applyChoice(state, oldContent, scene.id, scene.valg[0].id);
      else R.advance(state, oldContent);
      assert.ok(++steps < 900, 'the authored seven-day player journey terminates');
    }
    if (state.dag === 7) break;
    R.startNextDay(state, oldContent);
  }

  const witnessed = state.arkiv.find(entry => /^wave_d_c01_/.test(entry.sceneId));
  assert.ok(witnessed, 'the Wave D relationship choice actually happened');
  const status = state.tidligereValg.wa_d_c01_status;
  assert.ok(status, 'the witnessed event recorded a concrete relationship outcome');
  const anchor = state.privatHistorie?.flaggDager?.wa_d_c01_status;
  assert.equal(anchor, 7, 'the Wave D follow-up starts from the witnessed life day');

  const planning = S.selectRole(clone(state), nextContent);
  assert.equal(planning.rolle, 'arealplanlegger');
  assert.equal(planning.tidligereValg.wa_d_c01_status, status);
  const eligibleBranches = nextContent.scenes.filter(scene =>
    /^wave_e_c01_dag9_/.test(scene.id) && R.conditionsMet(planning, scene));
  assert.equal(eligibleBranches.length, 1,
    'earlier relationship outcome selects exactly one authored follow-up');
  const followup = eligibleBranches[0];
  assert.equal(followup.livsdagFra, 9);
  planning.fase = followup.fase;

  // A job has its own local chapter day; the shared life clock must still
  // release this scene only after two *elapsed* days from the prior choice.
  planning.livsdag = 8;
  assert.ok(!R.getCandidateScenes(planning, nextContent).some(s => s.id === followup.id),
    'the private continuation cannot appear a day too early');
  planning.livsdag = 9;
  assert.ok(R.getCandidateScenes(planning, nextContent).some(s => s.id === followup.id),
    'the later private event appears while working at a different job');

  R.applyChoice(planning, nextContent, followup.id, followup.valg[0].id);
  assert.equal(planning.arkiv.filter(e => e.sceneId === followup.id).length, 1);
  assert.equal(planning.arkiv.find(e => e.sceneId === followup.id)?.livsdag, 9);
  assert.equal(planning.privatHistorie.arkiv.filter(e => e.sceneId === followup.id).length, 1,
    'the witnessed later consequence belongs to the shared private archive');

  const returned = S.selectRole(clone(planning), oldContent);
  assert.equal(returned.tidligereValg.wa_d_c01_status, status);
  assert.equal(returned.privatHistorie.flaggDager.wa_d_c01_status, anchor);
  assert.equal(returned.arkiv.filter(e => e.sceneId === followup.id).length, 1,
    'the follow-up is preserved exactly once on returning to the old job');
  const resumed = S.selectRole(returned, nextContent);
  assert.ok(resumed.spilteScener.includes(followup.id));
  assert.equal(resumed.privatHistorie.arkiv.filter(e => e.sceneId === followup.id).length, 1,
    'later choices survive a full round trip without duplicate history');
});
