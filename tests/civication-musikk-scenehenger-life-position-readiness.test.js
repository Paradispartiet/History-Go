#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const streamPath = 'data/Civication/narratives/leisure/musikk_scenehenger.json';
const stageStreamPath = 'data/Civication/narratives/leisure/scenekunst_scenehenger.json';
const stream = readJson(streamPath);
const manifest = readJson('data/Civication/narratives/manifest.json');
const audit = readJson('data/Civication/lifePositionRoleWorldReadiness.json');
const catalog = readJson('data/Civication/lifePositionCatalog.json');
const livelihood = readJson('data/Civication/livelihoodOpportunityTemplates.json');
const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const policy = readJson('data/Civication/roleWorldPolicy.json');

assert.equal(stream.schema, 'civication_narrative_stream_v1');
assert.equal(stream.id, 'musikk_scenehenger_stream');
assert.equal(stream.type, 'leisure');
assert.deepEqual(stream.applies_when.any_tags, ['musikk:scenehenger']);
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

const music = catalog.badges.find((row) => row.badge_id === 'musikk')
  .positions.find((row) => row.id === 'scenehenger');
assert.deepEqual(music, {
  id: 'scenehenger',
  label: 'Scenehenger',
  threshold: 60,
  kind: 'social_identity',
  description: 'Du kjenner konsertstedene og folkene rundt dem og blir ofte lenger enn planlagt.',
  hooks: ['scene', 'nettverk', 'nytt_band']
});

const stage = catalog.badges.find((row) => row.badge_id === 'scenekunst')
  .positions.find((row) => row.id === 'scenehenger');
assert.ok(stage);
assert.equal(stage.label, 'Scenehenger');

const opportunity = livelihood.templates.find((row) => row.id === 'scenehenger_konsertcrew');
assert.ok(opportunity);
assert.equal(opportunity.badge_id, 'musikk');
assert.equal(opportunity.life_position_label, 'Scenehenger');
assert.equal(opportunity.kind_id, 'gig_honorarium');
assert.deepEqual(opportunity.income, { model: 'variable', min: 3, max: 7 });
assert.deepEqual(opportunity.direct_costs, { fixed: 1 });

const ready = audit.positions.find((row) => row.key === 'musikk/scenehenger');
assert.ok(ready);
assert.equal(ready.classification, 'ready');
assert.equal(ready.role_world_status, 'role_world_complete');
assert.equal(ready.role_world_path, 'data/Civication/roleWorlds/musikk/musikk_scenehenger.json');
assert.equal(ready.authored_depth.max_narrative_depth, 14);
assert.deepEqual(ready.evidence.exact_source_refs, [streamPath]);
assert.deepEqual(ready.evidence.livelihood_templates, ['scenehenger_konsertcrew']);

const stageAudit = audit.positions.find((row) => row.key === 'scenekunst/scenehenger');
assert.ok(stageAudit);
assert.equal(stageAudit.classification, 'ready');
assert.equal(stageAudit.role_world_status, 'role_world_complete');
assert.equal(stageAudit.role_world_path, 'data/Civication/roleWorlds/scenekunst/scenekunst_scenehenger.json');
assert.equal(stageAudit.authored_depth.max_narrative_depth, 14);
assert.equal(stageAudit.authored_depth.exact_source_ref_count, 1);
assert.deepEqual(stageAudit.evidence.exact_source_refs, [stageStreamPath]);
assert.ok(!stageAudit.evidence.exact_source_refs.includes(streamPath));

assert.deepEqual(audit.summary.classifications, {
  ready: 15,
  needs_authored_depth: 144,
  not_a_standalone_world: 40
});
assert.equal(audit.summary.completed_life_position_role_worlds, 15);
assert.equal(audit.summary.pending_ready_positions, 0);
assert.equal(audit.summary.positions_with_exact_governed_sources, 15);
assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 15);
assert.equal(audit.first_ready, null);
assert.equal(taxonomy.role_world_rollout_boundary.next_source_backed_candidate, null);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.first_source_backed_candidate, null);
assert.equal(
  audit.semantics.duplicate_life_position_ids_or_labels_require_badge_scoped_governed_binding,
  true
);

const paidAnchor = stream.storylets.find((row) => row.id === 'konsertcrew_honoraret');
assert.ok(paidAnchor);
assert.match(
  paidAnchor.situation.join(' '),
  /ikke.*lyd-|ikke.*lyst|sikkerhetsansvarlig|booker|artistmanager|kontrakter|artistbetaling/i
);

const narrativeSource = fs.readFileSync(
  path.join(ROOT, 'js/Civication/systems/civicationNarrativeSceneSource.js'),
  'utf8'
);

let activeLifePositions = [{ badge_id: 'musikk', id: 'scenehenger', label: 'Scenehenger' }];
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
  assert.ok(snapshot.matched_stream_ids.includes('musikk_scenehenger_stream'));

  const scenes = await api.getSourceScenes({
    state,
    active: null,
    phaseId: 'evening',
    candidate_stream_ids: ['musikk_scenehenger_stream'],
    used_storylet_keys: []
  });
  assert.ok(scenes.length >= 1);
  assert.equal(scenes[0].narrative_stream_id, 'musikk_scenehenger_stream');
  assert.equal(scenes[0].workday_related, false);
  assert.equal(scenes[0].role_scope, '');
  assert.equal(scenes[0].career_id, '');

  activeLifePositions = [{ badge_id: 'scenekunst', id: 'scenehenger', label: 'Scenehenger' }];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('musikk_scenehenger_stream'),
    'scenekunst/scenehenger must not inherit the Musikk Scenehenger stream');

  for (const other of [
    { badge_id: 'musikk', id: 'konsertgjenger', label: 'Konsertgjenger' },
    { badge_id: 'musikk', id: 'musikknerd', label: 'Musikknerd' },
    { badge_id: 'musikk', id: 'plategraver', label: 'Plategraver' },
    { badge_id: 'musikk', id: 'festivalveteran', label: 'Festivalveteran' }
  ]) {
    activeLifePositions = [other];
    snapshot = await api.getActivationSnapshot({ state, active: null });
    assert.ok(!snapshot.matched_stream_ids.includes('musikk_scenehenger_stream'),
      other.id + ' must not inherit Musikk Scenehenger narrative');
  }

  activeLifePositions = [];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('musikk_scenehenger_stream'));

  console.log('civication Musikk Scenehenger readiness ok: 14 anchors / badge-exact activation / Scenekunst remains isolated / bounded concert crew role');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
