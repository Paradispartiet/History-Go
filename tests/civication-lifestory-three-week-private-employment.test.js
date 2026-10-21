#!/usr/bin/env node
'use strict';
// One serialized, authored 21-day Life Story journey across unemployed,
// private-only (real job without an authored work pack), mapped paid role,
// and private-only again. This is a state/content integration gate, NOT the
// separate real-quiz/job-offer/browser/account/economy acceptance.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Content = require('../js/Civication/lifestory/lifestoryContent.js');
const State = require('../js/Civication/lifestory/lifestoryState.js');
const Runner = require('../js/Civication/lifestory/lifestoryRunner.js');

const ROOT = path.join(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));
const manifest = read(Content.MANIFEST_PATH);
const published = roleId => {
  const role = manifest.roles[roleId];
  assert.ok(role, 'use an authored role, never a fabricated role: ' + roleId);
  return Content.buildContent({
    role: read(role.role),
    roleThreads: read(role.threads),
    roleScenes: read(role.scenes),
    lifeThreads: read(manifest.life.threads),
    lifeScenes: read(manifest.life.scenes),
    phaseDefinitions: read(manifest.shared.phaseDefinitions)
  });
};

async function run() {
  const priorStore = global.CivicationJsonStore;
  // Read the repository's actual authored files through the same JSON-store
  // interface used by the browser; only the transport is substituted.
  global.CivicationJsonStore = { fetchJson: async rel => read(rel) };
  try {
    const unemployed = published('arbeidsledig');
    const cleaner = published('renholder');
    const sharedSceneIds = new Set(read(manifest.life.scenes).scenes.map(scene => scene.id));
    let content = unemployed;
    let state = State.createInitialState(content);
    const milestones = [];
    const diary = [];
    let actions = 0;
    let privateDays = 0;

    for (let lifeDay = 1; lifeDay <= 21; lifeDay++) {
      if (lifeDay === 8) {
        // The browser's organic History Go test supplies the REAL earned
        // museum job. Here we exercise its content projection using exactly
        // the published story and the already-played state.
        const before = clone(state);
        content = await Content.makePersonalOnlyContent(content);
        assert.equal(content.personalOnly, true);
        assert.equal(state.rolle, 'arbeidsledig',
          'projection does not silently fabricate a new Life Story role');
        assert.deepEqual(state, before, 'projection itself never writes to the save');
        milestones.push('private-view-after-earned-employment');
      }
      if (lifeDay === 15) {
        const previousPrivateArchive = clone(state.arkiv.filter(event =>
          sharedSceneIds.has(event.sceneId) || /^wave_[abcd]_c0[15]_/.test(event.sceneId)));
        const family = state.relasjoner.familie;
        const friend = state.relasjoner.venn;
        const lifeClock = state.livsdag;
        state = State.selectRole(state, cleaner);
        content = cleaner;
        assert.equal(state.rolle, 'renholder', 'known job reopens authored work package');
        assert.equal(state.livsdag, lifeClock, 'job change never resets player life day');
        assert.equal(state.relasjoner.familie, family, 'family follows player');
        assert.equal(state.relasjoner.venn, friend, 'friends follow player');
        assert.ok(previousPrivateArchive.length > 0,
          'real personal events were played before employment changed');
        assert.ok(previousPrivateArchive.every(event =>
          state.arkiv.some(row => row.sceneId === event.sceneId && row.valgId === event.valgId)),
          'only personal archive transfers to the new active role; work history stays in role snapshots');
        milestones.push('mapped-role-switch');
      }
      if (lifeDay === 18) {
        const before = clone(state);
        content = await Content.makePersonalOnlyContent(content);
        assert.equal(content.personalOnly, true);
        assert.equal(state.rolle, 'renholder', 'work story snapshot is not rewritten');
        assert.deepEqual(state, before, 'subsequent private-only transition is read-only');
        milestones.push('second-private-view');
      }
      assert.equal(state.livsdag, lifeDay, 'one canonical life day per game day');
      if (content.personalOnly) {
        privateDays++;
        assert.ok(content.scenes.every(scene =>
          sharedSceneIds.has(scene.id) || /^wave_[abcd]_c0[15]_/.test(scene.id)),
          'personal-only mode never plays NAV/employer-only scenes');
      }
      let dayActions = 0;
      while (!state.dagFerdig) {
        const scene = Runner.selectNextScene(state, content);
        if (scene) {
          if (content.personalOnly) {
            assert.ok(sharedSceneIds.has(scene.id) || /^wave_[abcd]_c0[15]_/.test(scene.id),
              'actual played private choice is canonical');
          }
          const options = scene.valg.filter(choice => !choice.skills_requirement);
          assert.ok(options.length, 'an ordinary choice remains without injected Skills');
          Runner.applyChoice(state, content, scene.id, options[0].id);
          dayActions++;
          actions++;
        } else Runner.advance(state, content);
        assert.ok(dayActions < 220, 'day terminates without duplicating scenes');
        assert.ok(actions < 1700, 'full three-week journey terminates');
      }
      assert.ok(dayActions > 0, 'day ' + lifeDay + ' contains a real authored decision');
      assert.equal(state.livsdag, lifeDay, 'choices do not skip calendar time');
      const saved = JSON.stringify(state);
      state = clone(state); // Real serialized archive, not a reset/seed.
      assert.equal(JSON.stringify(state), saved, 'save/load round-trip is stable');
      diary.push({ day: lifeDay, actions: dayActions, role: state.rolle,
        archiveSize: state.arkiv.length, privateMode: !!content.personalOnly });
      if (lifeDay < 21) Runner.startNextDay(state, content);
    }

    assert.equal(diary.length, 21);
    assert.ok(privateDays >= 10, 'shared private narrative continues throughout later weeks');
    assert.deepEqual(milestones, ['private-view-after-earned-employment','mapped-role-switch','second-private-view']);
    assert.ok(state.arkiv.some(row => /^wave_e_life21_d8_/.test(row.sceneId)));
    assert.ok(state.arkiv.some(row => /^wave_e_life21_d15_/.test(row.sceneId)));
    assert.ok(state.arkiv.some(row => /^wave_e_life21_d21_/.test(row.sceneId) && row.livsdag === 21),
      'a day-21 identity must follow actually played three-week decisions');
    assert.ok(['skaper', 'narmiljobygger', 'relasjonsbygger', 'hverdagsbygger', 'utforsker']
      .includes(state.tidligereValg.life21_direction), 'earned direction is a published one');
    assert.equal(state.livsdag, 21);
    assert.equal(state.rolle, 'renholder');
    assert.equal(new Set(state.arkiv.map(row => row.sceneId)).size, state.arkiv.length,
      'no duplicate archive records across projection changes and role switch');
    console.log('Civication integrated three-week private story: 21 days, ' + actions +
      ' real choices, ' + privateDays + ' private days, preserved role history.');
  } finally {
    if (priorStore === undefined) delete global.CivicationJsonStore;
    else global.CivicationJsonStore = priorStore;
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
