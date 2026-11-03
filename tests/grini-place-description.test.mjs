import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { validatePacket } from '../scripts/validate-place-description-production-v4_2.mjs';
import { checkPlaceTranslationFreshness } from '../scripts/check-place-i18n-freshness.mjs';

test('the actual Grini description packet matches its canonical text and verified claim references', () => {
  const packet = JSON.parse(fs.readFileSync(new URL('../data/places/production/grini_fangeleir.json', import.meta.url)));
  const place = JSON.parse(fs.readFileSync(new URL(`../${packet.placeFile}`, import.meta.url)));
  const result = validatePacket({ packet, place });
  assert.deepEqual(result.issues, [], JSON.stringify(result.issues, null, 2));
  for (const field of ['desc', 'popupDesc']) {
    assert.deepEqual(
      packet.sentenceCoverage[field].map(row => row.sentence),
      result.sentences[field].map((_, index) => index + 1),
      `${field}: every actual sentence must have exactly one coverage row`
    );
  }
});

test('existing Grini translations correspond to the current canonical description', () => {
  const result = checkPlaceTranslationFreshness('grini_fangeleir');
  assert.deepEqual(result.errors, []);
});
