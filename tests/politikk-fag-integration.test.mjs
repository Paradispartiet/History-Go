import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const json = (path) => JSON.parse(read(path));
const manifest = json('data/fag/politikk/politikk_runtime_manifest.json');
const badge = json(manifest.sourceOfTruth.badge);
const pensum = json(manifest.sourceOfTruth.pensum);
const emners = json(manifest.sourceOfTruth.emner);
const curriculum = json(manifest.sourceOfTruth.curriculum);
const concepts = json(manifest.sourceOfTruth.concepts);
const registry = json(manifest.sourceOfTruth.fagverkRegistry);
const compatibility = read('data/fag/politikk/merke_politikk.html');
const archive = read('data/fag/politikk/archive/merke_politikk_rich_runtime_legacy_20260830.html');
const politicsModel = read('js/politikk-fag-model.js');
const fagverkHtml = read('fagverk.html');
const genericCore = read('js/fagverk-subject-core.js');
const genericModel = read('js/fagverk-subject-model.js');
const fagverkPage = read('js/fagverk.js');
const ia = read('js/fagverk-ia-v3.js');
const badgeUi = read('js/fagverk-ia-v3-badge-progress.js');
const place = read('js/fagverk-place-canonical-integration.js');
const popup = read('js/ui/place-learning-canonical.js');
const loader = read('js/emnerLoader.ts');
const build = read('dist/web/emnerLoader.js');
const domainIds = new Set(pensum.domains.map((domain) => domain.domain_id));
const emneIds = new Set(emners.map((emne) => emne.emne_id));

test('ett runtime-manifest peker til canonical politikkdata og integrert progresjon', () => {
  assert.equal(manifest.schema, 'history_go_politikk_runtime_manifest_v1');
  assert.equal(manifest.sourceOfTruth.pensum, 'data/fag/politikk/politikkpensum_canonical_v4_5.json');
  assert.equal(manifest.sourceOfTruth.emner, 'data/fag/politikk/emner_politikk_canonical_v4_5.json');
  assert.equal(manifest.sourceOfTruth.curriculum, 'data/fag/politikk/curriculum_architecture_politikk_v1.json');
  assert.equal(manifest.sourceOfTruth.concepts, 'data/fag/politikk/concepts_politikk_canonical_v1.json');
  assert.equal(manifest.routes.badgeProgress, 'fagverk.html?subject=politikk#fagverkIaProgresjon');
  assert.equal(curriculum.editorial_status, 'expanded_and_audited');
  assert.equal(concepts.status, 'definition_complete');
  assert.equal(concepts.summary.concept_count, 962);
});

test('alle elleve undermerker peker til gyldige fagområder', () => {
  assert.equal(badge.sub.length, 11);
  assert.deepEqual(new Set(Object.keys(manifest.underbadgeDomains)), new Set(badge.sub));
  assert.deepEqual(new Set(Object.keys(manifest.underbadgeLabels)), new Set(badge.sub));
  for (const id of badge.sub) for (const domainId of manifest.underbadgeDomains[id]) assert.ok(domainIds.has(domainId), `${id}: ${domainId}`);
});

test('runtime leser alle 13 fagområder og 123 emner', () => {
  assert.equal(pensum.domains.length, 13);
  assert.equal(emners.length, 123);
  assert.equal(emneIds.size, 123);
  for (const domain of pensum.domains) for (const id of domain.emne_ids) assert.ok(emneIds.has(id), `${domain.domain_id}: ${id}`);
});

test('fagverkregisteret kopierer ikke emnetitler og begreper', () => {
  assert.equal(registry.subjects.politikk.canonicalModel.sourceOfTruth, true);
  assert.equal(Object.hasOwn(registry, 'emner'), false);
  assert.equal(Object.hasOwn(registry.placeLinks.regjeringskvartalet, 'concepts'), false);
  assert.equal(Object.hasOwn(registry.placeLinks.regjeringskvartalet, 'chapters'), false);
  for (const chapter of registry.subjects.politikk.chapters) {
    assert.ok(domainIds.has(chapter.primary_domain_id), `${chapter.id}: primary_domain_id`);
    for (const emneId of chapter.emne_ids) assert.ok(emneIds.has(emneId), `${chapter.id}: ${emneId}`);
  }
});

test('Politikk-rich-runtime er absorbert i Fagverkets fem flater', () => {
  assert.match(ia, /fagverkIaEmneSearch/);
  assert.match(ia, /fagverk-ia-quiz-history/);
  assert.match(ia, /progress\.visited\?\.has\?\.\(place\.id\)/);
  assert.match(ia, /profile\.html#merker/);
  assert.match(badgeUi, /runtimeManifest\.underbadgeLabels/);
  assert.match(badgeUi, /runtimeManifest\.underbadgeDomains/);
  assert.match(fagverkPage, /politikkConceptSearch/);
  assert.match(fagverkPage, /renderPolitikkCurriculumOverview/);
});

test('den pensjonerte portalen er bevart bytearkivert og aktiv URL er bare redirect', () => {
  for (const id of ['politikkBadgeProgress', 'politikkUnderbadges', 'politikkDomains', 'politikkFagverkChapters', 'politikkEmneProgress', 'politikkQuizHistory', 'politikkPlaces', 'politikkConcepts']) assert.match(archive, new RegExp(`id="${id}"`));
  assert.match(compatibility, /location\.replace\('\.\.\/\.\.\/\.\.\/fagverk\.html\?subject=politikk#fagverkIaProgresjon'\)/);
  assert.doesNotMatch(compatibility, /politikk-fagportal\.js|politikkEmneProgress|politikkQuizHistory|politikkConcepts/);
  assert.equal(fs.existsSync('js/politikk-fagportal.js'), false);
  assert.equal(fs.existsSync('css/politikk-fagportal.css'), false);
  assert.equal(fs.existsSync('css/politikk-merke-role.css'), false);
});

test('Politikkens øvrige flater beholder canonical modell og peker til integrert Fagverk', () => {
  assert.match(politicsModel, /merits_by_category/);
  assert.match(politicsModel, /HGLearningLog/);
  assert.match(politicsModel, /computeEmneDekningV2/);
  assert.match(politicsModel, /visited_places/);
  assert.match(politicsModel, /fagverk\.html\?subject=politikk#fagverkIaProgresjon/);
  assert.match(place, /HGPolitikkFagModel\.resolvePlace/);
  assert.match(place, /fagverk\.html\?subject=politikk#underbadge-/);
  assert.match(popup, /fagverk\.html\?subject=politikk#underbadge-/);
});

test('Politikkfagsiden går gjennom den generelle manifest-first motoren', () => {
  assert.match(fagverkHtml, /js\/fagverk-subject-core\.js/);
  assert.match(fagverkHtml, /js\/fagverk-subject-model\.js/);
  assert.doesNotMatch(fagverkHtml, /js\/politikk-fag-model\.js/);
  assert.doesNotMatch(fagverkHtml, /js\/fagverk-canonical-integration\.js/);
  assert.match(genericCore, /resolveCanonicalSubjectId/);
  assert.match(genericCore, /runtimeManifest: source\.runtimeManifest/);
  assert.match(genericModel, /manifestEntry\.runtimeManifest/);
  assert.match(fagverkPage, /HGFagverkSubjectModel/);
  assert.doesNotMatch(fagverkPage, /HGPolitikkFagModel/);
  assert.doesNotMatch(fagverkPage, /\|\|\s*['"]politikk['"]/);
});

test('felles emnelaster peker til canonical politikkfil', () => {
  const path = 'data/fag/politikk/emner_politikk_canonical_v4_5.json';
  assert.ok(loader.includes(path));
  assert.ok(build.includes(path));
  assert.doesNotMatch(loader, /politikk:\s+"data\/fag\/politikk\/emner_politikk\.json"/);
});
