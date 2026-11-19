import test from 'node:test';
import assert from 'node:assert/strict';
import { artworkOnlyBadgeRegistryChange, needsCivicationRegression, classifyCivicationChanges } from '../scripts/ci-civication-scope.mjs';

const original = {
  id: 'vitenskap',
  name: 'Vitenskap & teknologi',
  sub: ['teknologi_og_ingeniorfag', 'data_programvare_og_algoritmer'],
  image: 'bilder/merker/vitenskap/hovedmerke.webp',
  subBadgeImages: {
    teknologi_og_ingeniorfag: 'bilder/merker/vitenskap/brodert/teknologi_og_ingeniorfag.webp',
    data_programvare_og_algoritmer: 'bilder/merker/vitenskap/brodert/data_programvare_og_algoritmer.webp'
  }
};
const v7 = structuredClone(original);
v7.subBadgeImages.teknologi_og_ingeniorfag = 'bilder/merker/vitenskap/brodert/teknologi_og_ingeniorfag_v7.webp';

const readVersions = (before, after) => (_, version) => version === 'base' ? before : after;
const badgePath = 'data/badges/vitenskap.json';

test('three design variants can change image paths without Civication suite', () => {
  assert.equal(artworkOnlyBadgeRegistryChange(original, v7), true);
  assert.equal(needsCivicationRegression([
    badgePath, 'bilder/merker/vitenskap/brodert/teknologi_og_ingeniorfag_v7.webp',
    'tests/vitenskap-v7-activation-proposal.test.mjs'
  ], readVersions(original, v7)), false);
});

test('a changed subcategory identity or main badge requires full regression', () => {
  const modifiedSub = structuredClone(v7);
  modifiedSub.sub.push('elektronikk_robotikk_og_automatisering');
  assert.equal(artworkOnlyBadgeRegistryChange(original, modifiedSub), false);
  assert.equal(needsCivicationRegression([badgePath], readVersions(original, modifiedSub)), true);
  const modifiedImage = structuredClone(v7);
  modifiedImage.image = 'bilder/merker/vitenskap/nytt_hovedmerke.webp';
  assert.equal(needsCivicationRegression([badgePath], readVersions(original, modifiedImage)), true);
});

test('adding/removing subbadges is semantic, not only artwork', () => {
  const added = structuredClone(v7);
  added.subBadgeImages.new_topic = 'bilder/merker/vitenskap/brodert/new_topic.webp';
  assert.equal(needsCivicationRegression([badgePath], readVersions(original, added)), true);
  const removed = structuredClone(v7);
  delete removed.subBadgeImages.data_programvare_og_algoritmer;
  assert.equal(needsCivicationRegression([badgePath], readVersions(original, removed)), true);
});

test('non-WebP references, missing files and malformed badge manifests fail closed', () => {
  const invalid = structuredClone(v7);
  invalid.subBadgeImages.teknologi_og_ingeniorfag = 'external.svg';
  assert.equal(needsCivicationRegression([badgePath], readVersions(original, invalid)), true);
  assert.equal(needsCivicationRegression([badgePath], () => { throw Error('missing original'); }), true);
  assert.equal(needsCivicationRegression(['data/badges/new_manifest.json'], readVersions(null, v7)), true);
  assert.equal(needsCivicationRegression(['data/badges/metadata.txt'], readVersions(original, v7)), true);
});

test('changed Civication code or test still requires the complete suite, even with v7', () => {
  for (const changed of [
    'js/Civication/ui/MainScreen.js',
    'data/Civication/players.json',
    'tests/civication-life.test.js',
    'tests/acceptance-civication-core.test.js',
    'scripts/audit-civication-progression.mjs',
    'package.json',
    '.github/workflows/civication.yml',
    'scripts/ci-civication-scope.mjs',
    'tests/ci-civication-scope.test.mjs',
    'tests/ci-civication-draft-gates.test.mjs'
  ]) {
    assert.equal(needsCivicationRegression([badgePath, changed], readVersions(original, v7)), true, changed);
  }
});

test('excluded/generated Civication paths and unrelated science tests do not trigger regression', () => {
  assert.equal(needsCivicationRegression([
    'data/Civication/historyPeople_index.json',
    'data/Civication/scenarioPeople_index.json',
    'tests/civication-psychology-room-theory.test.js',
    'tests/vitenskap-active-typography-audit.test.mjs'
  ], readVersions(original, v7)), false);
});

test('unchanged or unknown badge semantics are not misclassified as artwork replacements', () => {
  assert.equal(artworkOnlyBadgeRegistryChange(original, original), false);
  assert.equal(needsCivicationRegression([badgePath], readVersions(original, original)), true);
});


const noBadgeRead = () => { throw Error('unexpected badge read'); };
test('role-only edits for approved roles use focused validation on draft and ready PRs', () => {
  const renholder = classifyCivicationChanges([
    'data/Civication/lifestory/roles/renholder/scenes.json',
    'data/Civication/lifestory/roles/renholder/threads.json',
    'tests/civication-lifestory-renholder-uke3.test.js',
    'docs/civication-symposium/renholder.md'
  ], noBadgeRead);
  assert.deepEqual(renholder, { regression: false, focused: true, roles: ['renholder'] });
  assert.equal(needsCivicationRegression([
    'data/Civication/lifestory/roles/renholder/scenes.json'
  ], noBadgeRead), false);
  assert.deepEqual(classifyCivicationChanges([
    'data/Civication/lifestory/roles/ekspeditor/role.json',
    'data/Civication/lifestory/roles/ekspeditor/scenes.json',
    'tests/civication-lifestory-ekspeditor.test.js'
  ], noBadgeRead), { regression: false, focused: true, roles: ['ekspeditor'] });
  assert.deepEqual(classifyCivicationChanges([
    'data/Civication/lifestory/roles/ekspeditor/scenes.json',
    'data/Civication/lifestory/roles/renholder/scenes.json'
  ], noBadgeRead), { regression: false, focused: true, roles: ['ekspeditor','renholder'] });
});

test('unknown roles, shared state, changes to CI itself and generated registries fail closed to full suite', () => {
  const paths=[
    'data/Civication/lifestory/roles/new_role/scenes.json',
    'data/Civication/lifestory/roles/ekspeditor/other.json',
    'data/Civication/lifestory/manifest.json',
    'data/Civication/careerGameplayMatrix.json',
    'data/Civication/roleWorldRolloutReadiness.json',
    'js/Civication/lifestory/lifestoryRunner.js',
    'tests/civication-lifestory-endings.test.js',
    'scripts/ci-civication-scope.mjs',
    '.github/workflows/civication.yml',
    'tests/ci-civication-draft-gates.test.mjs'
  ];
  for(const path of paths) {
    assert.deepEqual(classifyCivicationChanges([
      'data/Civication/lifestory/roles/ekspeditor/scenes.json',path
    ], noBadgeRead), { regression: true, focused: false, roles: [] },path);
  }
});

test('badge art and supported role changes use focused tests; badge semantic changes use full suite', () => {
  assert.deepEqual(classifyCivicationChanges([
    badgePath, 'data/Civication/lifestory/roles/renholder/role.json'
  ], readVersions(original,v7)), { regression:false, focused:true, roles:['renholder'] });
  assert.deepEqual(classifyCivicationChanges([
    badgePath, 'data/Civication/lifestory/roles/renholder/role.json'
  ], readVersions(original,original)), { regression:true, focused:false, roles:[] });
  assert.deepEqual(classifyCivicationChanges([
    'data/Civication/historyPeople_index.json','tests/vitenskap-v7-activation-proposal.test.mjs'
  ],noBadgeRead), { regression:false, focused:false, roles:[] });
});

