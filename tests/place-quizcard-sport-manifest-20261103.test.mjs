import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// Prevent a valid Sport QuizCard from disappearing when the frontImage flips.
// There are two active loaders (typed controller and legacy PlaceCard runtime).
test('Sport QuizCard manifest is discoverable in each active loader', () => {
  const typed=fs.readFileSync('js/ui/placeQuizCards.ts','utf8');
  const bundled=fs.readFileSync('js/ui/place-card-quizcards-patch.js','utf8');
  const legacy=fs.readFileSync('js/ui/place-card.js','utf8');
  assert.match(typed,/"sport\/manifest\.json"/);
  assert.match(bundled,/"sport\/manifest\.json"/);
  assert.match(legacy,/"data\/quizcards\/sport\/manifest\.json"/);
});
test('Tøyenbadet Sport card exists and keeps its ten canonical questions', () => {
  const manifest=JSON.parse(fs.readFileSync('data/quizcards/sport/manifest.json','utf8'));
  assert.equal(manifest.categoryId,'sport');
  assert.ok(manifest.collections.includes('toyenbadet_quizcard_v1.json'));
  const card=JSON.parse(fs.readFileSync('data/quizcards/sport/toyenbadet_quizcard_v1.json','utf8')).cards.find(x=>x.targetId==='toyenbadet');
  assert.ok(card);
  assert.equal(card.questions.length,10);
});
