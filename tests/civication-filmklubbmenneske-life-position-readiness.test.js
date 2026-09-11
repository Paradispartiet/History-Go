#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const streamPath = 'data/Civication/narratives/leisure/filmklubbmenneske.json';
const stream = readJson(streamPath);
const manifest = readJson('data/Civication/narratives/manifest.json');
const audit = readJson('data/Civication/lifePositionRoleWorldReadiness.json');
const catalog = readJson('data/Civication/lifePositionCatalog.json');
const livelihood = readJson('data/Civication/livelihoodOpportunityTemplates.json');
const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const policy = readJson('data/Civication/roleWorldPolicy.json');

assert.equal(stream.schema, 'civication_narrative_stream_v1');
assert.equal(stream.id, 'filmklubbmenneske_stream');
assert.equal(stream.type, 'leisure');
assert.deepEqual(stream.applies_when.any_tags, ['filmklubbmenneske', 'film_tv:filmklubbmenneske']);
assert.equal(stream.storylets.length, 14, 'Filmklubbmenneske source must carry one authored daily anchor per day');
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
  'Filmklubbmenneske stream must be registered');

const profile = catalog.badges.find((row) => row.badge_id === 'film_tv');
const position = profile.positions.find((row) => row.id === 'filmklubbmenneske');
assert.deepEqual(position, {
  id: 'filmklubbmenneske',
  label: 'Filmklubbmenneske',
  threshold: 25,
  kind: 'community_identity',
  description: 'Du liker kuraterte visninger, rare valg og diskusjonen etterpå.',
  hooks: ['filmklubb', 'fellesskap', 'programvalg']
});

const opportunity = livelihood.templates.find((row) => row.id === 'filmklubbmenneske_visningshjelp');
assert.ok(opportunity);
assert.equal(opportunity.badge_id, 'film_tv');
assert.equal(opportunity.life_position_label, 'Filmklubbmenneske');
assert.equal(opportunity.kind_id, 'gig_honorarium');
assert.deepEqual(opportunity.income, { model: 'variable', min: 2, max: 5 });
assert.deepEqual(opportunity.direct_costs, { fixed: 1 });

const ready = audit.positions.find((row) => row.key === 'film_tv/filmklubbmenneske');
assert.ok(ready);
assert.equal(ready.classification, 'ready');
assert.equal(ready.role_world_status, 'role_world_complete');
assert.equal(ready.role_world_path, 'data/Civication/roleWorlds/film_tv/film_tv_filmklubbmenneske.json');
assert.equal(ready.authored_depth.max_narrative_depth, 14);
assert.deepEqual(ready.evidence.exact_source_refs, [streamPath]);
assert.deepEqual(ready.evidence.livelihood_templates, ['filmklubbmenneske_visningshjelp']);
assert.equal(audit.summary.selectable_life_positions, 200);
assert.deepEqual(audit.summary.classifications, {
  ready: 7,
  needs_authored_depth: 153,
  not_a_standalone_world: 40
});
assert.equal(audit.summary.completed_life_position_role_worlds, 7);
assert.equal(audit.summary.pending_ready_positions, 0);
assert.equal(audit.summary.positions_with_exact_governed_sources, 7);
assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 7);
assert.equal(audit.first_ready, null);
assert.equal(taxonomy.role_world_rollout_boundary.next_source_backed_candidate, null);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.first_source_backed_candidate, null);

const genericKjenner = audit.positions.find((row) => row.key === 'film_tv/kjenner');
assert.ok(genericKjenner);
assert.equal(genericKjenner.classification, 'needs_authored_depth');
assert.equal(genericKjenner.authored_depth.exact_source_ref_count, 0);
assert.equal(genericKjenner.authored_depth.max_narrative_depth, 0);

const narrativeSource = fs.readFileSync(
  path.join(ROOT, 'js/Civication/systems/civicationNarrativeSceneSource.js'),
  'utf8'
);

let activeLifePositions = [{ badge_id: 'film_tv', id: 'filmklubbmenneske', label: 'Filmklubbmenneske' }];
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
  assert.ok(snapshot.matched_stream_ids.includes('filmklubbmenneske_stream'),
    'selected Filmklubbmenneske must activate its narrative without a formal job');

  const scenes = await api.getSourceScenes({
    state,
    active: null,
    phaseId: 'evening',
    candidate_stream_ids: ['filmklubbmenneske_stream'],
    used_storylet_keys: []
  });
  assert.ok(scenes.length >= 1);
  assert.equal(scenes[0].source_type, 'narrative_stream');
  assert.equal(scenes[0].narrative_stream_id, 'filmklubbmenneske_stream');
  assert.equal(scenes[0].channel, 'private');
  assert.equal(scenes[0].workday_related, false);
  assert.equal(scenes[0].role_scope, '',
    'life-position narrative must not fabricate a career role_scope');
  assert.equal(scenes[0].career_id, '');

  activeLifePositions = [{ badge_id: 'film_tv', id: 'kjenner', label: 'Kjenner' }];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('filmklubbmenneske_stream'),
    'Film/TV Kjenner must not inherit Filmklubbmenneske narrative');

  activeLifePositions = [{ badge_id: 'film_tv', id: 'kinogjenger', label: 'Kinogjenger' }];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('filmklubbmenneske_stream'),
    'another Film/TV life position must not inherit the stream by category');

  activeLifePositions = [];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('filmklubbmenneske_stream'),
    'Filmklubbmenneske narrative must fail closed without its selected life position');

  console.log('civication Filmklubbmenneske readiness ok: 14 anchors / exact life-position activation / livelihood kept separate / no career scope');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
