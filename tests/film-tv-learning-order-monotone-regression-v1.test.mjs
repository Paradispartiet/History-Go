import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const UNIT8_ID = 'skjermoffentlighet-fellesskap-og-samfunn';
// Etter registrert enhet 8 kan Film & TV stå i kildebrief- eller fullkapittelport for enhver senere enhet.
const FILM_TV_PRODUCTION_GATE = /(?:source_brief_complete_full_chapter_production|full_chapter_complete_next_unit_source_brief)$/;

test('Film & TV-læringsrekkefølgen bevares når produksjonen har avansert til enhet 8 eller senere', () => {
  const plan = read('data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json');
  const emners = read('data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json');
  const registry = read('data/fagverk/fagverk_registry.json');
  const status = read('data/fagverk/subject_status.json');
  const units = plan.planned_units;
  const plannedIds = units.flatMap((unit) => unit.emne_ids);
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  const unit8 = units.find((unit) => unit.id === UNIT8_ID);
  const registeredUnit8 = registry.subjects.film_tv.chapters.find((row) => row.id === UNIT8_ID);

  assert.equal(plan.schema, 'history_go_film_tv_learning_order_plan_v1');
  assert.equal(plan.subject_id, 'film_tv');
  assert.equal(emners.length, 192);
  assert.equal(plan.baseline.canonical_emne_count, 192);
  assert.equal(plan.baseline.existing_covered_emne_count, 38);
  assert.equal(plan.baseline.uncovered_emne_count, 154);
  assert.equal(units.length, 15);
  assert.equal(plan.phases.length, 6);
  assert.equal(plannedIds.length, 154);
  assert.equal(new Set(plannedIds).size, 154);
  assert.ok(new Set(units.map((unit) => unit.emne_count)).size > 1);
  assert.ok(units.every((unit, index) => unit.prerequisite_planned_unit_ids.every((id) => units.findIndex((candidate) => candidate.id === id) < index)));
  assert.equal(plan.policy.chapter_count_is_derived_not_target, true);
  assert.equal(plan.policy.emne_count_is_integrity_check_not_quota, true);
  assert.equal(plan.policy.later_evidence_may_add_merge_move_or_split_units, true);
  assert.equal('target_chapter_count' in plan, false);
  assert.equal('target_emne_count' in plan, false);

  assert.ok(unit8);
  assert.equal(unit8.sequence, 8);
  assert.equal(unit8.emne_ids.length, 9);
  assert.deepEqual(unit8.prerequisite_planned_unit_ids, ['representasjon-posisjon-og-motbilder', 'fjernsyn-plattformer-og-deltakerhistorier']);

  assert.ok(registeredUnit8);
  assert.deepEqual(registeredUnit8.emne_ids, unit8.emne_ids);
  assert.equal(filmStatus.editorialStatus, 'chapters_in_progress');
  assert.match(filmStatus.nextGate, FILM_TV_PRODUCTION_GATE);
});
