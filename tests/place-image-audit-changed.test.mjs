import assert from 'node:assert/strict';
import test from 'node:test';
import { isImageOptionalMicroPlace, isPlaceImageNeutralJsonChange, isPlaceScopeOnlyJsonChange } from '../scripts/lib/place-image-change-classifier.mjs';

test('ren top-level placeScope-metadata klassifiseres som scope-only', () => {
  assert.equal(isPlaceScopeOnlyJsonChange(
    { id: 'sagene', title: 'Sagene', coordRole: 'area_anchor' },
    { id: 'sagene', title: 'Sagene', coordRole: 'area_anchor', placeScope: 'area' },
  ), true);
  assert.equal(isPlaceScopeOnlyJsonChange(
    { places: [{ id: 'a', title: 'A', placeScope: 'area' }, { id: 'b', title: 'B' }] },
    { places: [{ id: 'a', title: 'A' }, { id: 'b', title: 'B', placeScope: 'area' }] },
  ), true);
  assert.equal(isPlaceScopeOnlyJsonChange(
    [{ id: 'a', title: 'A' }],
    [{ id: 'a', title: 'A', placeScope: 'area' }],
  ), true);
});

test('andre Place-endringer blir fortsatt bildeauditerte', () => {
  assert.equal(isPlaceScopeOnlyJsonChange(
    { id: 'sagene', title: 'Sagene' },
    { id: 'sagene', title: 'Sagene bydel', placeScope: 'area' },
  ), false);
  assert.equal(isPlaceScopeOnlyJsonChange(
    { id: 'sagene', coordRole: 'area_anchor' },
    { id: 'sagene', coordRole: 'point', placeScope: 'area' },
  ), false);
  assert.equal(isPlaceScopeOnlyJsonChange(
    { id: 'sagene', image: 'images/old.jpg' },
    { id: 'sagene', image: 'images/new.jpg', placeScope: 'area' },
  ), false);
  assert.equal(isPlaceScopeOnlyJsonChange(
    { id: 'sagene', meta: { placeScope: 'legacy' } },
    { id: 'sagene', meta: { placeScope: 'area' } },
  ), false);
});

test('vedlikehold av quiz-kontrastmål er bilde-nøytral metadata', () => {
  const before = {
    id: 'kunstnerforbundet',
    title: 'Kunstnerforbundet',
    quiz_profile: {
      place_type: 'kunstgalleri',
      contrast_targets: ['vi_vii_gallery', 'fotografiens_hus']
    }
  };
  const after = structuredClone(before);
  after.quiz_profile.contrast_targets = ['oslo_prosjektrom', 'fotografiens_hus'];
  assert.equal(isPlaceImageNeutralJsonChange(before, after), true);

  const changedDescription = structuredClone(after);
  changedDescription.desc = 'Ny beskrivelse.';
  assert.equal(isPlaceImageNeutralJsonChange(before, changedDescription), false);

  const changedQuizIdentity = structuredClone(after);
  changedQuizIdentity.quiz_profile.place_type = 'museum';
  assert.equal(isPlaceImageNeutralJsonChange(before, changedQuizIdentity), false);
});

test('uendret data og ikke-Place objekter unntas ikke', () => {
  const unchanged = { id: 'sagene', placeScope: 'area' };
  assert.equal(isPlaceScopeOnlyJsonChange(unchanged, structuredClone(unchanged)), false);
  assert.equal(isPlaceScopeOnlyJsonChange(
    { metadata: { version: 1 } },
    { metadata: { version: 1 }, placeScope: 'area' },
  ), false);
});

test('bare canonical Micro Places kan mangle bilde i changed-porten', () => {
  assert.equal(isImageOptionalMicroPlace({
    placeTier: 'micro',
    micro_place_profile: { schema: 'history_go_micro_place_profile_v1' },
  }), true);
  assert.equal(isImageOptionalMicroPlace({ placeTier: 'micro' }), false);
  assert.equal(isImageOptionalMicroPlace({
    placeTier: 'standard',
    micro_place_profile: { schema: 'history_go_micro_place_profile_v1' },
  }), false);
});
