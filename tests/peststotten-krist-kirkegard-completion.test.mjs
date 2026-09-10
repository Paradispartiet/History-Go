import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { validatePacket } from '../scripts/validate-place-description-production-v4_2.mjs';
import { validatePeopleClaimsDocument } from '../tools/audit-people-profile-canonical.mjs';

const root = process.cwd();
const id = 'peststotten_krist_kirkegard';
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const exists = (file) => fs.existsSync(path.join(root, file));
const placeFile = `data/places/historie/oslo/places_historie_added_batch_01/${id}.json`;
const place = read(placeFile);
const packet = read(`data/places/production/${id}.json`);
const history = read(`data/places/historie-production/${id}.json`);
const quiz = read(`data/quiz/historie/${id}_sets.json`);
const people = read(`data/people/historie/oslo/${id}/people_${id}.json`);
const runtime = read(`data/runtime/place-open/${id}.json`);

test('Peststøtten har presis identitet og gyldig v4.2-pakke', () => {
  assert.equal(place.lat, 59.917469); assert.equal(place.lon, 10.746586);
  assert.ok(place.popupDesc.trim().split(/\s+/u).length >= 300);
  assert.equal(Object.hasOwn(place, 'cardImage'), false);
  const result = validatePacket({ packet, place, packetFile: `data/places/production/${id}.json`, now: new Date('2026-09-10T08:00:00Z') });
  assert.deepEqual(result.issues, []);
});

test('focused-profilen har nøyaktig fire stedseide samlinger', () => {
  const expected = ['people', 'objects', 'brands', 'historical_events'];
  assert.equal(place.production_profile, 'focused'); assert.deepEqual(place.place_card_profile.collection_ids, expected); assert.deepEqual(place.rounds, expected);
  assert.deepEqual(packet.collections.people, ['andreas_samuel_krebs', 'niels_treschow']);
  assert.equal(place.objects.length, 2); assert.ok(place.objects.every((item) => item.physicalObject && item.placeSpecific && item.collectable));
  assert.equal(place.historical_events.length, 3); assert.deepEqual(packet.collections.brands, ['oslo_kommune_gravplassetaten']);
});

test('medier og canonical People-profiler er komplette', async () => {
  const files = [place.image, place.imageCard, place.frontImage, place.quizCardImage, ...place.objects.map((item) => item.image), ...place.historical_events.map((item) => item.image), ...people.map((person) => person.cardImage)];
  for (const file of files) assert.equal(exists(file), true, file);
  const sharpModule = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'sharp/dist/index.mjs') : 'sharp';
  const { default: sharp } = await import(sharpModule);
  assert.ok((await sharp(path.join(root, place.frontImage)).metadata()).height > (await sharp(path.join(root, place.frontImage)).metadata()).width);
  assert.ok((await sharp(path.join(root, place.quizCardImage)).metadata()).height > (await sharp(path.join(root, place.quizCardImage)).metadata()).width);
  for (const person of people) {
    const errors = validatePeopleClaimsDocument(read(person.claimsFile), person, { now: new Date('2026-09-10T08:00:00Z'), claimsPath: person.claimsFile });
    assert.deepEqual(errors, [], `${person.id}: ${errors.join('; ')}`);
  }
});

test('Fagverk, kronologi, Story, språk og Lesespor er runtime-lastet', () => {
  assert.equal(place.fagverk.schema, 'history_go_place_fagverk_v2'); assert.equal(place.fagverk.level, 'standard'); assert.equal(place.fagverk.lenses.length, 4);
  assert.equal(place.chronology.length, 8); assert.equal(runtime.stories.length, 1); assert.equal(runtime.stories[0].quality_profile, 'episode_v1');
  assert.equal(runtime.language.entries.length, 6); assert.equal(runtime.lesespor.length, 4); assert.equal(runtime.leksikon[0].chronology.length, 8);
  assert.equal(place.module_audit.for_na.status, 'source_bounded_holdback'); assert.equal(place.module_audit.news.status, 'not_applicable');
});

test('Historie-quizen er normal 4x7 med kanonisk progresjon', () => {
  const questions = quiz.sets.flatMap((set) => set.questions);
  assert.equal(quiz.size_class, 'normal_4x7'); assert.equal(quiz.sets.length, 4); assert.ok(quiz.sets.every((set) => set.questions.length === 7)); assert.equal(questions.length, 28);
  assert.ok(questions.slice(0, 14).every((question) => question.question_type === 'fact' && !question.method_id));
  assert.ok(questions.slice(21).every((question) => question.method_id === 'met_kildekritikk'));
  assert.ok(questions.slice(21).some((question) => question.topic_hook_id === 'his_minnested_ritual_offentlig_sorg'));
  assert.ok(questions.every((question) => question.options.includes(question.answer) && !question.options.some((option) => /Riktig svar|Feil svar/u.test(option))));
  assert.equal(quiz.production_context.theory_start_phase, 'final'); assert.equal(quiz.production_context.method_start_phase, 'final');
});

test('Historierapport, preflight og kvalitetsscore er klare', () => {
  const workcard = read('reports/place-production/peststotten-krist-kirkegard-workcard-current.json');
  const quality = read(`reports/place-production/${id}-phase1-24-gate-audit-v1.json`);
  assert.equal(history.status, 'ready'); assert.ok(Object.values(history.gates).every((gate) => gate.status === 'PASS')); assert.equal(workcard.rule_preflight.status, 'PASS');
  assert.equal(quality.status, 'PASS'); assert.equal(quality.quality_score.total, 30); assert.equal(quality.quality_score.critical_findings, 0); assert.equal(quality.quality_score.unresolved_blockers, 0);
});
