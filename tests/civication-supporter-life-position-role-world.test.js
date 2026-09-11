#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const stream = readJson('data/Civication/narratives/leisure/football_supporter.json');
const world = readJson('data/Civication/roleWorlds/sport/sport_supporter.json');
const index = readJson('data/Civication/roleWorlds/index.json');
const schema = readJson('data/Civication/roleWorldV1.schema.json');
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');

assert.equal(stream.schema, 'civication_narrative_stream_v1');
assert.equal(stream.id, 'football_supporter_stream');
assert.equal(stream.type, 'leisure');
assert.ok(stream.applies_when.any_tags.includes('supporter'));
assert.equal(stream.storylets.length, 14, 'Supporter source stream must carry one authored daily anchor per day');
assert.equal(new Set(stream.storylets.map((row) => row.id)).size, 14);
for (const row of stream.storylets) {
  assert.ok(row.id);
  assert.ok(Array.isArray(row.choices) && row.choices.length >= 2, `${row.id}: authored decision depth missing`);
  assert.ok(Array.isArray(row.situation) && row.situation.length >= 3, `${row.id}: situation is too thin`);
}

assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.category, 'sport');
assert.equal(world.role_scope, 'sport_supporter');
assert.equal(world.subject_type, 'life_position');
assert.deepEqual(world.life_position_ref, { badge_id: 'sport', id: 'supporter', label: 'Supporter' });
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.coverage.length, 56);
assert.equal(new Set(world.season.coverage.map((beat) => `${beat.day}/${beat.phase}`)).size, 56);

const sourceIds = new Set(stream.storylets.map((row) =>
  `data/Civication/narratives/leisure/football_supporter.json#${row.id}`
));
assert.deepEqual(new Set(world.materialization.source_refs), sourceIds,
  'Role World provenance must cover all 14 canonical supporter storylets');
for (const beat of world.season.coverage) {
  assert.equal(beat.materialization_refs.length, 1);
  assert.ok(sourceIds.has(beat.materialization_refs[0]),
    `${beat.day}/${beat.phase}: unknown supporter provenance`);
}

const themeIds = new Set(themeBank.themes.map((entry) => entry.id));
for (const id of world.theme_ids) assert.ok(themeIds.has(id), `unknown Supporter theme ${id}`);
assert.deepEqual(themeBank.reference_profiles['sport/sport_supporter'], world.theme_ids);

assert.deepEqual(schema.properties.subject_type.enum, ['career_role', 'life_position']);
assert.ok(schema.properties.life_position_ref);
const supporterEntry = index.roles.find((entry) => entry.role_scope === 'sport_supporter');
assert.ok(supporterEntry, 'Supporter Role World must be indexed');
assert.equal(supporterEntry.subject_type, 'life_position');
assert.deepEqual(supporterEntry.life_position_ref, world.life_position_ref);
assert.equal(index.roles.filter((entry) => entry.subject_type !== 'life_position').length, 85);
assert.equal(index.roles.filter((entry) => entry.subject_type === 'life_position').length, 7);
assert.equal(index.summary.role_worlds_total, 92);
assert.equal(index.summary.career_role_worlds, 85);
assert.equal(index.summary.life_position_role_worlds, 7);

const manifest = readJson('data/Civication/narratives/manifest.json');
const narrativeSource = fs.readFileSync(
  path.join(ROOT, 'js/Civication/systems/civicationNarrativeSceneSource.js'),
  'utf8'
);

let activeLifePositions = [{ badge_id: 'sport', id: 'supporter', label: 'Supporter' }];
const filesByPath = new Map([
  ['data/Civication/narratives/manifest.json', manifest],
  ['data/Civication/narratives/leisure/football_supporter.json', stream]
]);
for (const row of manifest.streams || []) {
  if (!filesByPath.has(row.path)) filesByPath.set(row.path, readJson(row.path));
}

const state = {
  identity_tags: [],
  mail_branch_state: { flags: [] },
  narrative_state_v1: {
    active_streams: [],
    stream_progress: {},
    flags: [],
    choice_history: [],
    updated_at: null
  }
};

const sandbox = {
  console,
  Date,
  setTimeout,
  clearTimeout,
  fetch: async (rel) => {
    const data = filesByPath.get(String(rel));
    return {
      ok: !!data,
      status: data ? 200 : 404,
      async json() { return data; }
    };
  },
  window: {
    CivicationState: {
      getState: () => state,
      getActivePosition: () => null
    },
    CivicationLifePositions: {
      getLifeContext: () => ({ active_life_positions: activeLifePositions })
    }
  }
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(narrativeSource, sandbox, { filename: 'civicationNarrativeSceneSource.js' });

(async () => {
  const api = sandbox.window.CivicationNarrativeSceneSource;
  assert.ok(api?.getActivationSnapshot);

  let snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(snapshot.matched_stream_ids.includes('football_supporter_stream'),
    'selected Supporter life position must activate the supporter narrative without a formal job');

  const scenes = await api.getSourceScenes({
    state,
    active: null,
    phaseId: 'evening',
    candidate_stream_ids: ['football_supporter_stream'],
    used_storylet_keys: []
  });
  assert.ok(scenes.length >= 1);
  assert.equal(scenes[0].source_type, 'narrative_stream');
  assert.equal(scenes[0].narrative_stream_id, 'football_supporter_stream');
  assert.equal(scenes[0].channel, 'private');
  assert.equal(scenes[0].workday_related, false);
  assert.equal(scenes[0].role_scope, '',
    'life-position narrative must not fabricate a career role_scope');

  activeLifePositions = [{ badge_id: 'sport', id: 'klubbmenneske', label: 'Klubbmenneske' }];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('football_supporter_stream'),
    'another Sport life position must not inherit Supporter narrative by category alone');

  activeLifePositions = [];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('football_supporter_stream'),
    'Supporter narrative must fail closed without matching life-position or legacy tags');

  console.log('civication Supporter life-position Role World ok: 14 source anchors / 56 beats / runtime life-position activation / 85 career worlds preserved');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
