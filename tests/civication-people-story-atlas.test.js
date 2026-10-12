const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const ledger = read('data/Civication/lifestory/editorial/storyProductionLedgerV1.json');
const plan = read('data/Civication/lifestory/editorial/peopleStoryPlanningV1.json');
const crosswalk = read('data/Civication/lifestory/editorial/narrativeCrosswalkV1.json');
const base = read('data/Civication/lifestory/roles/arbeidsledig/role.json');
const manifest = read('data/Civication/lifestory/manifest.json');
const allPeople = Object.values(read('data/Civication/historyPeople_index.json').categories).flat();
const peopleById = new Map(allPeople.map(person => [person.id, person]));
const crosswalkGroups = Object.keys(crosswalk).filter(k => k.endsWith('Production'));
const crosswalkPacks = crosswalkGroups.flatMap(group => crosswalk[group].map(entry => ({ ...entry, group })));
const byId = new Map(ledger.chapters.map(ch => [ch.id, ch]));

test('People story editorial inventory is complete and has unique ids', () => {
  assert.equal(ledger.status, 'editorial_inventory_not_runtime');
  assert.equal(plan.status, 'editorial_only_not_runtime');
  assert.equal(plan.factuality_policy, 'pending_explicit_governance');
  assert.equal(ledger.chapters.length, 45);
  assert.equal(byId.size, 45);
  assert.equal(base.symposium.fortsettelser.length, 45);
  assert.deepEqual(
    [...byId.keys()].sort(),
    base.symposium.fortsettelser.map(d => d.id).sort()
  );
  assert.deepEqual(
    [...byId.values()].map(ch => path.basename(ch.path)).sort(),
    plan.legacy_continuation_file_names.slice().sort()
  );
});

test('Each of nine three-day stages retains exactly five original chapters', () => {
  assert.equal(ledger.stages.length, 9);
  for (let index = 0; index < 9; index++) {
    const after = 7 + (index * 3);
    const stage = ledger.stages[index];
    assert.equal(stage.index, index + 1);
    assert.equal(stage.after_day, after);
    assert.equal(stage.number, 5);
    assert.equal(stage.chapter_ids.length, 5);
    assert.deepEqual(stage.days, [after + 1, after + 3]);
    for (const id of stage.chapter_ids) {
      assert.equal(byId.get(id).after_day, after);
    }
  }
});

test('Every registered continuation points at a real authored package with matching scope and day range', () => {
  const descriptors = new Map(base.symposium.fortsettelser.map(d => [d.id, d]));
  for (const ch of ledger.chapters) {
    const desc = descriptors.get(ch.id);
    assert.ok(desc, ch.id);
    assert.equal(ch.path, desc.path);
    assert.equal(ch.role_scope, desc.role_scope);
    assert.equal(ch.after_day, desc.etterDag);
    assert.equal(ch.people_specific_migration, 'not_started');
    assert.equal(ch.runtime_playability, 'not_revalidated_for_new_model');
    const pack = read(ch.path);
    assert.equal(pack.id, ch.id);
    assert.equal(pack.role_scope, ch.role_scope);
    assert.ok(Array.isArray(pack.scenes) && pack.scenes.length > 0, ch.id);
    assert.ok(Array.isArray(pack.endings) && pack.endings.length > 0, ch.id);
    for (const scene of pack.scenes) {
      assert.ok(scene.dag >= ch.after_day + 1 && scene.dag <= ch.after_day + 3,
        ch.id + ' / ' + scene.id + ' outside expected chapter');
    }
  }
});

test('Ten foundation and 35 crosswalk chapters are disjoint and complete', () => {
  assert.equal(crosswalkPacks.length, 35);
  const crossIds = new Set(crosswalkPacks.map(x => x.id));
  assert.equal(crossIds.size, 35);
  assert.equal(ledger.chapters.filter(c => c.editorial_group === 'foundationProduction').length, 10);
  for (const entry of crosswalkPacks) {
    assert.equal(byId.get(entry.id).editorial_group, entry.group, entry.id);
  }
  for (const ch of ledger.chapters) {
    assert.equal(ch.editorial_group === 'foundationProduction', !crossIds.has(ch.id), ch.id);
  }
});

test('All 24 proposed contemporary synopses cite real roles and unchanged literary identifiers', () => {
  const cTypes = new Map(crosswalk.contemporaryTypes.map(x => [x.id, x]));
  const validL = new Set(crosswalk.literaryTracks.map(x => x.id));
  const validP = new Set(crosswalk.sevenPlotModels.map(x => x.id));
  assert.equal(cTypes.size, 24);
  assert.equal(validL.size, 24);
  assert.equal(validP.size, 7);
  assert.equal(plan.stories.length, 24);
  assert.equal(new Set(plan.stories.map(s => s.id)).size, 24);
  for (const story of plan.stories) {
    const source = cTypes.get(story.id);
    assert.ok(source, story.id);
    assert.equal(story.title, source.name);
    assert.equal(story.status, 'redaksjonell_synopsis_ikke_spillbar');
    assert.ok(story.choice_fork.length >= 2, story.id);
    assert.ok(story.delayed_return.trim() && story.symposium_evidence.trim(), story.id);
    for (const key of story.role_keys) assert.ok(manifest.roles[key], story.id + ' ' + key);
    for (const id of story.literary_tracks) assert.ok(validL.has(id), story.id + ' ' + id);
    for (const id of story.possible_plot_lenses) assert.ok(validP.has(id), story.id + ' ' + id);
  }
});

test('Six example People IDs and place links exist but are not approved scene personas', () => {
  assert.equal(plan.verified_people_examples.length, 6);
  assert.equal(new Set(plan.verified_people_examples.map(x => x.id)).size, 6);
  for (const p of plan.verified_people_examples) {
    const canonical = peopleById.get(p.id);
    assert.ok(canonical, p.id);
    assert.equal(canonical.placeId, p.placeId, p.id);
    assert.equal(canonical.name, p.name, p.id);
  }
});

test('Six differentiated People story routes preserve canonical identity and policy boundary', () => {
  const casting = read('data/Civication/lifestory/editorial/peopleScenarioCandidatesV1.json');
  const roleScopes = new Set(base.symposium.rollebroer.map(x => x.role_scope));
  const validTypes = new Set(crosswalk.contemporaryTypes.map(x => x.id));
  assert.equal(casting.status, 'editorial_only_policy_pending');
  assert.equal(casting.candidates.length, 6);
  assert.equal(new Set(casting.candidates.map(x => x.canonical_person_id)).size, 6);
  assert.equal(new Set(casting.candidates.map(x => x.id)).size, 6);
  assert.equal(new Set(casting.candidates.map(x => x.synopsis_title)).size, 6);
  for (const candidate of casting.candidates) {
    const canonical = peopleById.get(candidate.canonical_person_id);
    assert.ok(canonical, candidate.id);
    assert.equal(candidate.canonical_person_name, canonical.name);
    assert.equal(candidate.canonical_place_id, canonical.placeId);
    assert.equal(candidate.verified_people_description, canonical.desc);
    assert.ok(roleScopes.has(candidate.role_scope), candidate.id);
    assert.equal(candidate.status, 'authoring_candidate_not_runtime');
    assert.equal(candidate.real_person_actor_mode, 'historical_knowledge_reference_only_until_policy_approved');
    assert.ok(candidate.choice_candidates.length >= 2 && candidate.beat_proposals.length >= 3);
    assert.ok(candidate.delayed_effect_design && candidate.symposium_evidence_design);
    for (const storyId of candidate.contemporary_story_ids) assert.ok(validTypes.has(storyId), candidate.id);
  }
  const bugge = casting.candidates.find(x => x.canonical_person_id === 'bugge_wesseltoft');
  const mari = casting.candidates.find(x => x.canonical_person_id === 'mari_boine');
  assert.equal(bugge.role_scope, mari.role_scope);
  assert.notEqual(bugge.player_centered_conflict, mari.player_centered_conflict);
  assert.notDeepEqual(bugge.choice_candidates, mari.choice_candidates);
});
