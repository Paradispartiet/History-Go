#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const streamPath = 'data/Civication/narratives/leisure/gallerivanker.json';
const stream = readJson(streamPath);
const manifest = readJson('data/Civication/narratives/manifest.json');
const audit = readJson('data/Civication/lifePositionRoleWorldReadiness.json');
const catalog = readJson('data/Civication/lifePositionCatalog.json');
const livelihood = readJson('data/Civication/livelihoodOpportunityTemplates.json');
const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const policy = readJson('data/Civication/roleWorldPolicy.json');

assert.equal(stream.schema, 'civication_narrative_stream_v1');
assert.equal(stream.id, 'gallerivanker_stream');
assert.equal(stream.type, 'leisure');
assert.deepEqual(stream.applies_when.any_tags, ['gallerivanker', 'kunst:gallerivanker']);
assert.equal(stream.storylets.length, 14);
assert.equal(new Set(stream.storylets.map((row) => row.id)).size, 14);

for (const row of stream.storylets) {
  assert.ok(row.id);
  assert.ok(Array.isArray(row.situation) && row.situation.length >= 3, row.id + ': thin situation');
  assert.ok(Array.isArray(row.choices) && row.choices.length >= 2, row.id + ': missing decision depth');
  for (const choice of row.choices) {
    assert.ok(choice.id && choice.label);
    assert.ok(Number.isFinite(Number(choice.effect)));
    assert.ok(Array.isArray(choice.tags) && choice.tags.length >= 2);
    assert.ok(String(choice.feedback || '').length >= 20);
  }
}
assert.ok(manifest.streams.some((entry) => entry.id === stream.id && entry.path === streamPath));

const profile = catalog.badges.find((row) => row.badge_id === 'kunst');
const position = profile.positions.find((row) => row.id === 'gallerivanker');
assert.deepEqual(position, {
  id: 'gallerivanker',
  label: 'Gallerivanker',
  threshold: 5,
  kind: 'hobby_identity',
  description: 'Du stikker innom gallerier også når du ikke har planlagt det.',
  hooks: ['galleri', 'utstilling', 'oppdagelse']
});

const opportunity = livelihood.templates.find((row) => row.id === 'gallerivanker_apningshjelp');
assert.ok(opportunity);
assert.equal(opportunity.badge_id, 'kunst');
assert.equal(opportunity.life_position_label, 'Gallerivanker');
assert.equal(opportunity.kind_id, 'casual_shift');
assert.deepEqual(opportunity.income, { model: 'variable', min: 3, max: 6 });
assert.deepEqual(opportunity.direct_costs, { fixed: 1 });

const ready = audit.positions.find((row) => row.key === 'kunst/gallerivanker');
assert.ok(ready);
assert.equal(ready.classification, 'ready');
assert.equal(ready.role_world_status, 'role_world_complete');
assert.equal(ready.role_world_path, 'data/Civication/roleWorlds/kunst/kunst_gallerivanker.json');
assert.equal(ready.authored_depth.max_narrative_depth, 14);
assert.deepEqual(ready.evidence.exact_source_refs, [streamPath]);
assert.deepEqual(ready.evidence.livelihood_templates, ['gallerivanker_apningshjelp']);
assert.deepEqual(audit.summary.classifications, {
  ready: 12,
  needs_authored_depth: 147,
  not_a_standalone_world: 40
});
assert.equal(audit.summary.completed_life_position_role_worlds, 12);
assert.equal(audit.summary.pending_ready_positions, 0);
assert.equal(audit.summary.positions_with_exact_governed_sources, 12);
assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 12);
assert.equal(audit.first_ready, null);
assert.equal(taxonomy.role_world_rollout_boundary.next_source_backed_candidate, null);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.first_source_backed_candidate, null);

const narrativeSource = fs.readFileSync(
  path.join(ROOT, 'js/Civication/systems/civicationNarrativeSceneSource.js'),
  'utf8'
);

let activeLifePositions = [{ badge_id: 'kunst', id: 'gallerivanker', label: 'Gallerivanker' }];
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
    return { ok: !!data, status: data ? 200 : 404, async json() { return data; } };
  },
  window: {
    CivicationState: { getState: () => state, getActivePosition: () => null },
    CivicationLifePositions: { getLifeContext: () => ({ active_life_positions: activeLifePositions }) }
  }
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(narrativeSource, sandbox, { filename: 'civicationNarrativeSceneSource.js' });

(async () => {
  const api = sandbox.window.CivicationNarrativeSceneSource;
  let snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(snapshot.matched_stream_ids.includes('gallerivanker_stream'));

  const scenes = await api.getSourceScenes({
    state,
    active: null,
    phaseId: 'evening',
    candidate_stream_ids: ['gallerivanker_stream'],
    used_storylet_keys: []
  });
  assert.ok(scenes.length >= 1);
  assert.equal(scenes[0].narrative_stream_id, 'gallerivanker_stream');
  assert.equal(scenes[0].workday_related, false);
  assert.equal(scenes[0].role_scope, '');
  assert.equal(scenes[0].career_id, '');

  for (const position of [
    { badge_id: 'kunst', id: 'vernissagegjenger', label: 'Vernissagegjenger' },
    { badge_id: 'kunst', id: 'gatekunstjeger', label: 'Gatekunstjeger' },
    { badge_id: 'kunst', id: 'ateliermenneske', label: 'Ateliermenneske' }
  ]) {
    activeLifePositions = [position];
    snapshot = await api.getActivationSnapshot({ state, active: null });
    assert.ok(!snapshot.matched_stream_ids.includes('gallerivanker_stream'),
      position.id + ' must not inherit Gallerivanker narrative');
  }

  activeLifePositions = [];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('gallerivanker_stream'));

  console.log('civication Gallerivanker readiness ok: 14 anchors / exact life-position activation / bounded casual shift / no career scope');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
