#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const streamPath = 'data/Civication/narratives/leisure/medievaktbikkje.json';
const stream = readJson(streamPath);
const manifest = readJson('data/Civication/narratives/manifest.json');
const audit = readJson('data/Civication/lifePositionRoleWorldReadiness.json');
const catalog = readJson('data/Civication/lifePositionCatalog.json');
const livelihood = readJson('data/Civication/livelihoodOpportunityTemplates.json');
const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const policy = readJson('data/Civication/roleWorldPolicy.json');

assert.equal(stream.schema, 'civication_narrative_stream_v1');
assert.equal(stream.id, 'medievaktbikkje_stream');
assert.equal(stream.type, 'leisure');
assert.deepEqual(stream.applies_when.any_tags, ['medievaktbikkje', 'media:medievaktbikkje']);
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

const profile = catalog.badges.find((row) => row.badge_id === 'media');
const position = profile.positions.find((row) => row.id === 'medievaktbikkje');
assert.deepEqual(position, {
  id: 'medievaktbikkje',
  label: 'Medievaktbikkje',
  threshold: 40,
  kind: 'practice_identity',
  description: 'Du følger hvem som setter saker, hvem som mangler og hvordan framing endrer en historie.',
  hooks: ['mediekritikk', 'kilder', 'korrigering']
});

const opportunity = livelihood.templates.find((row) => row.id === 'medievaktbikkje_researchnotat');
assert.ok(opportunity);
assert.equal(opportunity.badge_id, 'media');
assert.equal(opportunity.life_position_label, 'Medievaktbikkje');
assert.equal(opportunity.kind_id, 'freelance_assignment');
assert.deepEqual(opportunity.income, { model: 'variable', min: 3, max: 7 });
assert.deepEqual(opportunity.direct_costs, { fixed: 0 });

const ready = audit.positions.find((row) => row.key === 'media/medievaktbikkje');
assert.ok(ready);
assert.equal(ready.classification, 'ready');
assert.equal(ready.role_world_status, 'role_world_complete');
assert.equal(ready.role_world_path, 'data/Civication/roleWorlds/media/media_medievaktbikkje.json');
assert.equal(ready.authored_depth.max_narrative_depth, 14);
assert.deepEqual(ready.evidence.exact_source_refs, [streamPath]);
assert.deepEqual(ready.evidence.livelihood_templates, ['medievaktbikkje_researchnotat']);
assert.deepEqual(audit.summary.classifications, {
  ready: 17,
  needs_authored_depth: 142,
  not_a_standalone_world: 40
});
assert.equal(audit.summary.completed_life_position_role_worlds, 17);
assert.equal(audit.summary.pending_ready_positions, 0);
assert.equal(audit.summary.positions_with_exact_governed_sources, 17);
assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 17);
assert.equal(audit.first_ready, null);
assert.equal(taxonomy.role_world_rollout_boundary.next_source_backed_candidate, null);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.first_source_backed_candidate, null);

const paidAnchor = stream.storylets.find((row) => row.id === 'researchnotatet_og_oppdragets_grense');
assert.ok(paidAnchor);
assert.match(
  paidAnchor.situation.join(' '),
  /ikke.*ansatt journalist|ikke.*redaktør|publiserings-|redaksjonell beslutningsmyndighet/i
);

const narrativeSource = fs.readFileSync(
  path.join(ROOT, 'js/Civication/systems/civicationNarrativeSceneSource.js'),
  'utf8'
);

let activeLifePositions = [{ badge_id: 'media', id: 'medievaktbikkje', label: 'Medievaktbikkje' }];
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
  assert.ok(snapshot.matched_stream_ids.includes('medievaktbikkje_stream'));

  const scenes = await api.getSourceScenes({
    state,
    active: null,
    phaseId: 'evening',
    candidate_stream_ids: ['medievaktbikkje_stream'],
    used_storylet_keys: []
  });
  assert.ok(scenes.length >= 1);
  assert.equal(scenes[0].narrative_stream_id, 'medievaktbikkje_stream');
  assert.equal(scenes[0].workday_related, false);
  assert.equal(scenes[0].role_scope, '');
  assert.equal(scenes[0].career_id, '');

  for (const other of [
    { badge_id: 'media', id: 'nyhetsjunkie', label: 'Nyhetsjunkie' },
    { badge_id: 'media', id: 'podkastsluker', label: 'Podkastsluker' },
    { badge_id: 'media', id: 'kommentarfeltveteran', label: 'Kommentarfeltveteran' },
    { badge_id: 'media', id: 'debattant', label: 'Debattant' }
  ]) {
    activeLifePositions = [other];
    snapshot = await api.getActivationSnapshot({ state, active: null });
    assert.ok(!snapshot.matched_stream_ids.includes('medievaktbikkje_stream'),
      other.id + ' must not inherit Medievaktbikkje narrative');
  }

  activeLifePositions = [];
  snapshot = await api.getActivationSnapshot({ state, active: null });
  assert.ok(!snapshot.matched_stream_ids.includes('medievaktbikkje_stream'));

  console.log('civication Medievaktbikkje readiness ok: 14 anchors / exact life-position activation / bounded research assignment / media career scope remains closed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
