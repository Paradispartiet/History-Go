import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditChapters, buildChaptersReport } from '../scripts/audit-subkultur-chapters-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));

test('åtte kapitler materialiserer 24 moduler, 72 seksjoner og 216 avsnitt', () => {
  const report = auditChapters();
  assert.equal(report.totals.chapters, 8);
  assert.equal(report.totals.modules, 24);
  assert.equal(report.totals.sections, 72);
  assert.equal(report.totals.paragraphs, 216);
  assert.ok(report.chapters.every((chapter) => chapter.sections === 9 && chapter.paragraphs === 27));
});

test('alle avsnitt er claim-sporet og dekker 160 canonicale claims', () => {
  const report = buildChaptersReport();
  assert.equal(report.totals.claim_references, 320);
  assert.equal(report.totals.unique_claim_bindings, 160);
  assert.ok(report.chapters.every((chapter) => chapter.claim_references >= 36 && chapter.unique_claims === 20));
});

test('kapitlene har inspectable kildehenvisninger og komplett pedagogisk minimum', () => {
  const report = buildChaptersReport();
  assert.ok(report.totals.source_references >= 160);
  assert.equal(report.totals.worked_examples, 16);
  assert.equal(report.totals.misconceptions, 40);
  assert.equal(report.totals.application_tasks, 24);
  assert.equal(report.totals.self_checks, 64);
  assert.ok(report.chapters.every((chapter) => chapter.source_references >= 20));
});

test('216 fagavsnitt er selvstendige og uten generatorfyll', () => {
  const manifest = readJson('data/fagverk/subkultur/manifest.json');
  const paragraphs = manifest.chapters.flatMap((chapterRow) => {
    const chapter = readJson(chapterRow.file);
    return chapter.moduleFiles.flatMap((moduleFile) =>
      readJson(moduleFile).sections.flatMap((section) => section.paragraphs)
    );
  });
  assert.equal(new Set(paragraphs).size, 216);
  assert.ok(paragraphs.every((paragraph) => paragraph.length >= 80));
  assert.ok(paragraphs.every((paragraph) => !/undefined|null|TODO|TBD|placeholder/i.test(paragraph)));
});

test('48 stedskoblinger løser til canonicale places og materialiserer bare validerte casebevis', () => {
  const report = buildChaptersReport();
  assert.equal(report.totals.place_references, 48);
  assert.ok(report.chapters.every((chapter) => chapter.unique_places === 6));
  assert.ok(report.totals.validated_place_references >= 10);
  assert.equal(report.totals.rejected_place_references, 1);
  assert.equal(report.status, 'CHAPTERS_READY_CASE_EVIDENCE_PARTIAL');
});

test('tre geografiske profiler holder åpne kandidater og validerte cases strengt adskilt', () => {
  const report = buildChaptersReport();
  assert.equal(report.profiles.length, 3);
  assert.equal(report.totals.profile_candidates, 50);
  assert.equal(report.totals.validated_profile_cases, 27);
  assert.equal(report.totals.rejected_profile_cases, 2);
  assert.equal(report.totals.pending_profile_cases, 21);
  assert.deepEqual(report.integrity.duplicate_profile_case_ids, []);
});

test('kapittelproduksjon forskutterer ikke materialisert redaksjonell status', () => {
  const report = buildChaptersReport();
  assert.deepEqual(report.status_guard, {
    navigation_status: 'planned',
    assessment_status: 'pending',
    editorial_status: 'not_started',
    next_gate: 'remaining_case_source_validation'
  });
  assert.equal(report.next_gate, 'remaining_case_source_validation');
});
