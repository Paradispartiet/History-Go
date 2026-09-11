#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const streamPath = 'data/Civication/narratives/leisure/nabolagskjenner.json';
const stream = readJson(streamPath);
const manifest = readJson('data/Civication/narratives/manifest.json');
const audit = readJson('data/Civication/lifePositionRoleWorldReadiness.json');

assert.equal(stream.schema, 'civication_narrative_stream_v1');
assert.equal(stream.id, 'nabolagskjenner_stream');
assert.equal(stream.type, 'leisure');
assert.ok(stream.applies_when.any_tags.includes('nabolagskjenner'));
assert.equal(stream.storylets.length, 14);
assert.equal(new Set(stream.storylets.map((row) => row.id)).size, 14);
for (const row of stream.storylets) {
  assert.ok(Array.isArray(row.situation) && row.situation.length >= 3, row.id + ': thin situation');
  assert.ok(Array.isArray(row.choices) && row.choices.length >= 2, row.id + ': missing choice depth');
}
assert.ok(manifest.streams.some((entry) => entry.id === stream.id && entry.path === streamPath));

const ready = audit.positions.find((row) => row.key === 'by/nabolagskjenner');
assert.ok(ready);
assert.equal(ready.classification, 'ready');
assert.equal(ready.role_world_status, 'role_world_not_started');
assert.equal(ready.authored_depth.max_narrative_depth, 14);
assert.deepEqual(ready.evidence.exact_source_refs, [streamPath]);

const falsePositive = audit.positions.find((row) => row.key === 'film_tv/kjenner');
assert.ok(falsePositive);
assert.equal(falsePositive.classification, 'needs_authored_depth');
assert.equal(falsePositive.authored_depth.exact_source_ref_count, 0);
assert.equal(falsePositive.authored_depth.max_narrative_depth, 0);

const narrativeSource = fs.readFileSync(
  path.join(ROOT, 'js/Civication/systems/civicationNarrativeSceneSource.js'),
  'utf8'
);

let activeLifePositions = [{ badge_id: 'by', id: 'nabolagskjenner', label: 'Nabolagskjenner' }];
const filesByPath = new Map([
  ['data/Civication/narratives/manifest.json', manifest],
  [streamPath, stream]
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
  assert.ok(snapshot.matched_stream_ids.includes('nabolagskjenner_stream'),
    'selected Nabolagskjenner must activate its narrative without a formal job');

  const scenes = await api.getSourceScenes({
    state,
    active: null,
    phaseId: 'evening',
    candidate_stream_ids: ['nabolagskjenner_stream'],
    used_storylet_keys: []
  });
  assert.ok(scenes.length >= 1);
  assert.equal(scenes[0].source_type, 'narrative_stream');
  assert.equal(scenes[0].narrative_stream_id, 'nabolagskjenner_stream');
  assert.equal(scenes[0].channel, 'private');
  assert.equal(scenes[0].workday_related, false);
  assert.equal(scenes[0].role_scope, '',
    'life-position narrative must not fabricate a career role_scope');

  activeLifePositions = [{ badge_id: 'film_tv', id: 'kjenner', label: 'Kjenner' }];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('nabolagskjenner_stream'),
    'generic Kjenner must not inherit Nabolagskjenner narrative');

  activeLifePositions = [];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('nabolagskjenner_stream'),
    'Nabolagskjenner narrative must fail closed without its selected life position');

  console.log('civication Nabolagskjenner readiness ok: 14 anchors / exact life-position activation / no Kjenner substring leak');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
