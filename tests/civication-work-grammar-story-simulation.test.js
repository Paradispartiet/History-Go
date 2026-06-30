#!/usr/bin/env node
// Civication FWG Story Simulation Standard v1
//
// Verifiserer at complete_reference_v2-rollene beskriver stillingen som en liten
// arbeidssimulering: et story_world-lag og spillbare practice_stories som binder
// fagbegreper til konkrete scener. Dette er en datakontrakt-test; den endrer ikke
// runtime eller UI.

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
function readJson(relPath) { return JSON.parse(fs.readFileSync(path.join(repoRoot, relPath), 'utf8')); }
function norm(value) { return String(value || '').trim().toLowerCase(); }

// De tre referanserollene som skal følge story-simulation-modellen.
const ROLES = [
  { category: 'sosial_laering', role_scope: 'barnehageassistent', min_stories: 16 },
  { category: 'by', role_scope: 'by_radgiver_plan', min_stories: 8 },
  { category: 'naeringsliv', role_scope: 'renholder', min_stories: 8 },
];

const STORY_TYPES = new Set(['everyday', 'conflict', 'relationship', 'knowledge', 'failure', 'consequence', 'identity']);
const REQUIRED_STORY_FIELDS = ['id', 'title', 'premise', 'work_knowledge', 'conflict_axes', 'mail_types', 'learning_point'];

function conceptPool(fwg) {
  const fag = fwg.fag_bindings || {};
  const tokens = [];
  for (const c of fag.required_concepts || []) tokens.push(c);
  for (const m of fag.methods || []) tokens.push(m);
  for (const dep of fwg.knowledge_dependencies || []) {
    if (dep.id) tokens.push(dep.id);
    for (const r of dep.requires || []) tokens.push(r);
  }
  return new Set(tokens.map(norm));
}

function run() {
  for (const role of ROLES) {
    const rel = `data/Civication/workGrammars/${role.category}/${role.role_scope}.json`;
    const fwg = readJson(rel);
    const label = `${role.category}/${role.role_scope}`;

    // story_world-laget
    const world = fwg.story_world;
    assert(world && typeof world === 'object', `${label}: story_world finnes`);
    assert(typeof world.simulation_promise === 'string' && world.simulation_promise.trim().length > 0, `${label}: story_world.simulation_promise finnes`);
    assert(Array.isArray(world.recurring_situations) && world.recurring_situations.length > 0, `${label}: story_world.recurring_situations har innhold`);

    const hasSeeds = Array.isArray(world.small_story_seeds) && world.small_story_seeds.length > 0;
    const stories = Array.isArray(fwg.practice_stories) ? fwg.practice_stories : [];
    assert(hasSeeds || stories.length > 0, `${label}: small_story_seeds eller practice_stories finnes`);

    // practice_stories-laget
    assert(stories.length >= role.min_stories, `${label}: minst ${role.min_stories} practice_stories (har ${stories.length})`);

    const pool = conceptPool(fwg);
    assert(pool.size > 0, `${label}: fag_bindings/knowledge_dependencies gir et begrepsgrunnlag`);
    const ids = new Set();

    for (const story of stories) {
      const sid = story.id || '(uten id)';
      for (const field of REQUIRED_STORY_FIELDS) {
        const value = story[field];
        const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
        assert(!empty, `${label}/${sid}: practice_story mangler ${field}`);
      }
      // people/place: minst én av dem skal forankre scenen i casten eller et sted.
      const hasPeople = Array.isArray(story.people) && story.people.length > 0;
      const hasPlace = typeof story.place_id === 'string' && story.place_id.trim().length > 0;
      assert(hasPeople || hasPlace, `${label}/${sid}: practice_story må ha people eller place_id`);

      assert(!ids.has(story.id), `${label}: practice_story-id er unik (${story.id})`);
      ids.add(story.id);

      assert(STORY_TYPES.has(story.story_type), `${label}/${sid}: gyldig story_type (${story.story_type})`);
      assert(Array.isArray(story.work_knowledge) && story.work_knowledge.length > 0, `${label}/${sid}: work_knowledge har innhold`);
      for (const concept of story.work_knowledge) {
        assert(pool.has(norm(concept)), `${label}/${sid}: work_knowledge '${concept}' må finnes i fag_bindings/knowledge_dependencies`);
      }
    }

    // Minst noen scener skal kunne bli mailtråder.
    assert(stories.some(s => s.thread_potential === true), `${label}: minst én practice_story har thread_potential: true`);
  }

  // Barnehageassistent er førsterollen og skal bære mange spilldager.
  const barnehage = readJson('data/Civication/workGrammars/sosial_laering/barnehageassistent.json');
  assert(barnehage.practice_stories.length >= 16, 'Barnehageassistent har minst 16 practice_stories');

  // Ingen broken_mapping reintroduseres, og referansestatusen beholdes.
  const index = fs.readFileSync(path.join(repoRoot, 'docs/CIVICATION_ROLE_PACK_INDEX.md'), 'utf8');
  assert(!/^\- broken_mapping: [1-9]/m.test(index), 'ingen broken_mapping gjenoppstår i Role Pack Index');
  for (const needle of [
    '| by | by_radgiver_plan | by_arealplanlegger | Arealplanlegger |',
    '| naeringsliv | renholder | naer_renholder | Renholder |',
    '| sosial_laering | barnehageassistent | sosial_laering_barnehageassistent | Barnehageassistent / pedagogisk medarbeider |',
  ]) {
    const line = index.split('\n').find(l => l.includes(needle));
    assert(line && line.includes('complete_reference_v2'), `Role Pack Index beholder complete_reference_v2 for ${needle}`);
  }

  console.log('Civication FWG story simulation: story_world + practice_stories OK for', ROLES.map(r => r.role_scope).join(', '));
}

run();
