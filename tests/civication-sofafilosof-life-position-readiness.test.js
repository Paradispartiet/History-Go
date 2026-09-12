#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const streamPath = 'data/Civication/narratives/leisure/sofafilosof.json';
const stream = readJson(streamPath);
const manifest = readJson('data/Civication/narratives/manifest.json');
const audit = readJson('data/Civication/lifePositionRoleWorldReadiness.json');
const catalog = readJson('data/Civication/lifePositionCatalog.json');
const livelihood = readJson('data/Civication/livelihoodOpportunityTemplates.json');
const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const policy = readJson('data/Civication/roleWorldPolicy.json');

assert.equal(stream.schema, 'civication_narrative_stream_v1');
assert.equal(stream.id, 'sofafilosof_stream');
assert.equal(stream.type, 'leisure');
assert.deepEqual(stream.applies_when.any_tags, ['sofafilosof', 'filosofi:sofafilosof']);
assert.equal(stream.storylets.length, 14, 'Sofafilosof source must carry one authored daily anchor per day');
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
assert.ok(manifest.streams.some((entry) => entry.id === stream.id && entry.path === streamPath),
  'Sofafilosof stream must be registered');

const profile = catalog.badges.find((row) => row.badge_id === 'filosofi');
const position = profile.positions.find((row) => row.id === 'sofafilosof');
assert.deepEqual(position, {
  id: 'sofafilosof',
  label: 'Sofafilosof',
  threshold: 10,
  kind: 'alternative_life_status',
  description: 'Du kan gjøre en vanlig kveld til en lang diskusjon om fri vilje, rettferdighet eller mening.',
  hooks: ['samtale', 'venner', 'nattlig_diskusjon']
});

const opportunity = livelihood.templates.find((row) => row.id === 'sofafilosof_samtalekveld');
assert.ok(opportunity);
assert.equal(opportunity.badge_id, 'filosofi');
assert.equal(opportunity.life_position_label, 'Sofafilosof');
assert.equal(opportunity.kind_id, 'gig_honorarium');
assert.deepEqual(opportunity.income, { model: 'variable', min: 2, max: 5 });
assert.deepEqual(opportunity.direct_costs, { fixed: 1 });

const ready = audit.positions.find((row) => row.key === 'filosofi/sofafilosof');
assert.ok(ready);
assert.equal(ready.classification, 'ready');
assert.equal(ready.role_world_status, 'role_world_complete');
assert.equal(ready.role_world_path, 'data/Civication/roleWorlds/filosofi/filosofi_sofafilosof.json');
assert.equal(ready.authored_depth.max_narrative_depth, 14);
assert.deepEqual(ready.evidence.exact_source_refs, [streamPath]);
assert.deepEqual(ready.evidence.livelihood_templates, ['sofafilosof_samtalekveld']);
assert.equal(audit.summary.selectable_life_positions, 199);
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

let activeLifePositions = [{ badge_id: 'filosofi', id: 'sofafilosof', label: 'Sofafilosof' }];
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
  assert.ok(snapshot.matched_stream_ids.includes('sofafilosof_stream'),
    'selected Sofafilosof must activate its narrative without a formal job');

  const scenes = await api.getSourceScenes({
    state,
    active: null,
    phaseId: 'evening',
    candidate_stream_ids: ['sofafilosof_stream'],
    used_storylet_keys: []
  });
  assert.ok(scenes.length >= 1);
  assert.equal(scenes[0].source_type, 'narrative_stream');
  assert.equal(scenes[0].narrative_stream_id, 'sofafilosof_stream');
  assert.equal(scenes[0].channel, 'private');
  assert.equal(scenes[0].workday_related, false);
  assert.equal(scenes[0].role_scope, '',
    'life-position narrative must not fabricate a career role_scope');
  assert.equal(scenes[0].career_id, '');

  activeLifePositions = [{ badge_id: 'filosofi', id: 'livsgrubler', label: 'Livsgrubler' }];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('sofafilosof_stream'),
    'Livsgrubler must not inherit Sofafilosof narrative');

  activeLifePositions = [{ badge_id: 'filosofi', id: 'lesesirkelmenneske', label: 'Lesesirkelmenneske' }];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('sofafilosof_stream'),
    'another Filosofi life position must not inherit the stream by category');

  activeLifePositions = [];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('sofafilosof_stream'),
    'Sofafilosof narrative must fail closed without its selected life position');

  console.log('civication Sofafilosof readiness ok: 14 anchors / exact life-position activation / livelihood kept separate / no career scope');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
