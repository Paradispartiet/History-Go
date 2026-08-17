import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditFilmTvKinoerVisningsstederPublikumPhase4 } from '../scripts/audit-fagverk-film-tv-kinoer-visningssteder-publikum-phase4.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Kinoer, visningssteder og publikum er reauditert fra 20 legacyaliases til 18 canonicale emner', () => {
  const { report } = auditFilmTvKinoerVisningsstederPublikumPhase4();
  assert.equal(report.subject.id, 'film_tv');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.ok(report.subject.registeredChapterCount >= 1);
  assert.equal(report.canonicalCoverage.ownerDomainId, 'visning_publikum_resepsjon_deltakelse');
  assert.equal(report.canonicalCoverage.exactCoverage, '18/18 canonical emner fra 20/20 legacyaliases');
  assert.equal(report.canonicalCoverage.aliasResolvedEmneIds.length, 18);
  assert.equal(report.canonicalCoverage.remainingDomainCount, 10);
  assert.deepEqual(report.canonicalCoverage.requiredEmneIds, report.canonicalCoverage.coveredEmneIds);
  assert.equal(report.canonicalCoverage.legacySourceEmneIds.length, 20);
});

test('Film & TV-kapittelet har full pedagogisk og evidensbasert pakke', () => {
  const { report, chapter, claimsDoc, modules } = auditFilmTvKinoerVisningsstederPublikumPhase4();
  assert.deepEqual(report.summary, {
    moduleCount: 3, sectionCount: 9, paragraphCount: 27, conceptCount: 6,
    workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5,
    selfCheckCount: 7, methodCount: 20, sourceCount: 22, claimCount: 27, placeCaseCount: 4
  });
  assert.deepEqual(chapter.relatedPlaces.map((place) => place.id), ['colosseum_kino', 'cinemateket_oslo', 'vega_scene', 'gimle_kino']);
  assert.ok(chapter.relatedPlaces.every((place) => place.name && place.role));
  assert.ok(claimsDoc.sources.every((source) => source.label && source.url));
  assert.ok(modules[1].commonMisconceptions.every((item) => item.claim && item.correction));
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Film & TV-fagets tekniske baseline er bevart etter kapittel 1', () => {
  const { report } = auditFilmTvKinoerVisningsstederPublikumPhase4();
  const committed = JSON.parse(fs.readFileSync(path.join(root, 'reports/fagverk/film-tv-kinoer-visningssteder-publikum-phase4-audit.json'), 'utf8'));
  assert.ok(['remaining_domain_chapter_production', 'curriculum_completeness_refactor', 'canonical_inventory_migration', 'canonical_inventory_migrated_existing_chapter_reaudit', 'canonical_chapter_reaudit_complete_learning_order_plan', 'learning_order_plan_complete_first_chapter_source_brief'].includes(report.subject.nextGate)
    || /(?:source_brief_complete_full_chapter_production|full_chapter_complete_next_unit_source_brief|full_chapter_complete_completion_audit|maintenance_source_refresh_and_place_case_expansion)$/.test(report.subject.nextGate));
  assert.equal('nextGate' in committed.subject, false);
  assert.equal('registeredChapterCount' in committed.subject, false);
  assert.equal(report.subject.canonicalDomainCount, 10);
  assert.equal(report.subject.canonicalEmneCount, 192);
  assert.equal(report.gates.previousFilmTvStructurePreserved, true);
});

test('Kinoer, visningssteder og publikum hydrerer alle synlige rendererfelt', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const chapterMeta = registry.subjects.film_tv.chapters.find((chapter) => chapter.id === 'kinoer-visningssteder-og-publikum');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(chapterMeta, fetchFile);
  assert.equal(chapter.relatedPlaces.length, 4);
  assert.ok(chapter.relatedPlaces.every((place) => place.id && place.name && place.role));
  assert.equal(chapter.sources.length, 22);
  assert.ok(chapter.sources.every((source) => source.label && source.url));
  assert.equal(chapter.commonMisconceptions.length, 5);
  assert.ok(chapter.commonMisconceptions.every((item) => item.claim && item.correction));
});
