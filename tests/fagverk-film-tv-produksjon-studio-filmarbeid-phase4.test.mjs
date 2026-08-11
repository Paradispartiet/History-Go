import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditFilmTvProduksjonStudioFilmarbeidPhase4 } from '../scripts/audit-fagverk-film-tv-produksjon-studio-filmarbeid-phase4.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Produksjon, studio og filmarbeid er reauditert fra 20 legacyaliases til 20 canonicale emner', () => {
  const { report } = auditFilmTvProduksjonStudioFilmarbeidPhase4();
  assert.equal(report.subject.id, 'film_tv');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.ok(report.subject.registeredChapterCount >= 2);
  assert.equal(report.canonicalCoverage.ownerDomainId, 'produksjon_arbeid_teknologi_praksis');
  assert.equal(report.canonicalCoverage.exactCoverage, '20/20 canonical emner fra 20/20 legacyaliases');
  assert.equal(report.canonicalCoverage.aliasResolvedEmneIds.length, 20);
  assert.equal(report.canonicalCoverage.remainingDomainCount, 10);
  assert.deepEqual(report.canonicalCoverage.requiredEmneIds, report.canonicalCoverage.coveredEmneIds);
  assert.equal(report.canonicalCoverage.legacySourceEmneIds.length, 20);
});

test('Film & TV-kapittelet har full pedagogisk og evidensbasert pakke', () => {
  const { report, chapter, claimsDoc, modules } = auditFilmTvProduksjonStudioFilmarbeidPhase4();
  assert.deepEqual(report.summary, {
    moduleCount: 3, sectionCount: 9, paragraphCount: 27, conceptCount: 6,
    workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5,
    selfCheckCount: 7, methodCount: 20, sourceCount: 22, claimCount: 27, placeCaseCount: 4
  });
  assert.deepEqual(chapter.relatedPlaces.map((place) => place.id), ['nrk_huset_marienlyst', 'hartvig_nissens_skole_skam', 'oslo_met_pilestredet', 'lisbon_tobis_portuguesa']);
  assert.ok(chapter.relatedPlaces.every((place) => place.name && place.role));
  assert.ok(claimsDoc.sources.every((source) => source.label && source.url));
  assert.ok(modules[1].commonMisconceptions.every((item) => item.claim && item.correction));
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Film & TV-fagets tekniske baseline er bevart etter kapittel 2', () => {
  const { report } = auditFilmTvProduksjonStudioFilmarbeidPhase4();
  assert.ok(['remaining_domain_chapter_production', 'curriculum_completeness_refactor', 'canonical_inventory_migration', 'canonical_inventory_migrated_existing_chapter_reaudit', 'canonical_chapter_reaudit_complete_learning_order_plan', 'learning_order_plan_complete_first_chapter_source_brief', 'audiovisual_form_source_brief_complete_full_chapter_production', 'audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief'].includes(report.subject.nextGate));
  assert.equal(report.subject.canonicalDomainCount, 10);
  assert.equal(report.subject.canonicalEmneCount, 192);
  assert.equal(report.gates.previousFilmTvStructurePreserved, true);
});

test('Produksjon, studio og filmarbeid hydrerer alle synlige rendererfelt', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const chapterMeta = registry.subjects.film_tv.chapters.find((chapter) => chapter.id === 'produksjon-studio-og-filmarbeid');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(chapterMeta, fetchFile);
  assert.equal(chapter.relatedPlaces.length, 4);
  assert.ok(chapter.relatedPlaces.every((place) => place.id && place.name && place.role));
  assert.equal(chapter.sources.length, 22);
  assert.ok(chapter.sources.every((source) => source.label && source.url));
  assert.equal(chapter.commonMisconceptions.length, 5);
  assert.ok(chapter.commonMisconceptions.every((item) => item.claim && item.correction));
});
