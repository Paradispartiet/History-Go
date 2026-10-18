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
    getState: () => ({}), getActivePosition: () => null,
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
    const { window } = h;
    const State = window.CivicationLifestoryState;
    const roleContent = await window.CivicationLifestoryContent.loadContent('arealplanlegger');
    const before = State.selectRole(State.load(), roleContent);
    const activeArchive = clone(before.arkiv);
    const inactiveArchive = clone(before.rolleTilstander.arbeidsledig.arkiv);
    State.save(before);
    const ui = window.CivicationLifestoryUI;
    const original = ui.getPendingWaveAEvent;
    // UI role adoption is asynchronous; simulate the moment it has adopted
    // the new active role, so the old role is only represented by its save.
    ui.getPendingWaveAEvent = () => null;
    try {
      await window.CivicationWaveAPrivateRoleBridge.refresh();
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
      assert.equal(window.CivicationMailEngine.getMail(privateEvent.id).resolved, true);
      assert.equal((await window.CivicationMailEngine.answerMail(
        privateEvent.id, privateEvent.choices[0].id)).ok, false, 'cannot answer inactive scene twice');
    } finally { ui.getPendingWaveAEvent = original; }
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
