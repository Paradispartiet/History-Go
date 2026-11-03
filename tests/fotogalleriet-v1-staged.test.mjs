import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = p => JSON.parse(fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const quiz = read('reports/place-production/fotogalleriet/quiz-sets-staged.json');
const cards = read('reports/place-production/fotogalleriet/quizcard-staged.json');
const packet = read('data/places/production/fotogalleriet.json');
const place = read('data/places/kunst/oslo/places_kunst/fotogalleriet.json');
const knownClaims = new Map(packet.claims.map(c => [c.id,c]));
const all = quiz.sets.flatMap(s => s.questions);

test('Fotogalleriet is one existing Kunst place and draft has three sets of seven', () => {
  assert.equal(place.id, 'fotogalleriet');
  assert.equal(place.category, 'kunst');
  assert.equal(quiz.production_context.status, 'staged_not_registered_in_quiz_manifest');
  assert.equal(quiz.sets.length, 3);
  assert.deepEqual(quiz.sets.map(s => s.questions.length), [7,7,7]);
  assert.equal(new Set(all.map(q => q.quiz_id)).size, 21);
  assert.equal(new Set(all.map(q => q.id)).size, 21);
});

test('every answer, source and Knowledge identifier is explicit and source-backed', () => {
  for (const q of all) {
    assert.equal(q.targetId, place.id);
    assert.equal(q.placeId, place.id);
    assert.equal(q.categoryId, place.category);
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.equal(q.options[q.answerIndex], q.answer);
    assert.ok(q.knowledge.length > 20);
    const claim = knownClaims.get(q.claim_id);
    assert.equal(claim?.status, 'verified', q.id);
    assert.equal(q.claim_basis, claim.claim);
    assert.ok(q.source_urls.includes(claim.sourceUrl));
    assert.ok(q.primary_knowledge_unit_id.startsWith('ku_kunst_'));
    assert.ok(q.knowledge_unit_ids.includes(q.primary_knowledge_unit_id));
    assert.equal(q.knowledge_link_status, 'staged_pending_canonical_registry');
  }
});

test('staged Knowledge IDs match the canonical generator deterministically', () => {
  const normalize = value => String(value ?? '').trim().toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
  const kuId = (subject, claim) => {
    const normalized = normalize(claim);
    const prefix = normalized.replace(/\s+/g, '_').slice(0, 24) || 'item';
    const digest = createHash('sha256')
      .update(subject + '\0' + normalized, 'utf8').digest('hex').slice(0, 10);
    return `ku_${subject}_${prefix}_${digest}`;
  };
  const idToClaim = new Map();
  for (const q of all) {
    const expectedId = kuId(q.categoryId, q.knowledge);
    assert.equal(q.primary_knowledge_unit_id, expectedId, q.id + ': noncanonical KU ID');
    assert.deepEqual(q.knowledge_unit_ids, [expectedId], q.id + ': unexpected KU binding');
    assert.equal(q.knowledge, q.claim_basis, q.id + ': Knowledge differs from verified claim');
    assert.equal(q.knowledge_link_status, 'staged_pending_canonical_registry');
    const previous = idToClaim.get(expectedId);
    if (previous) assert.equal(previous, q.knowledge, 'KU collision with different claim');
    idToClaim.set(expectedId, q.knowledge);
  }
  assert.ok(idToClaim.size > 10, '21 quiz questions should span multiple distinct claims');
});

test('staged Knowledge handoff covers all 21 quizzes and ten QuizCards', () => {
  const handoff = read('reports/place-production/fotogalleriet/knowledge-handoff-20261102.json');
  assert.equal(handoff.status, 'staged_reviewed_not_registered_or_published');
  assert.equal(handoff.placeId, place.id);
  assert.equal(handoff.counts.fullquiz, 21);
  assert.equal(handoff.counts.quizcard, 10);
  assert.equal(handoff.counts.uniqueKnowledgeUnits, handoff.units.length);
  const byId = new Map(handoff.units.map(u => [u.knowledge_unit_id, u]));
  assert.equal(byId.size, handoff.units.length);
  for (const q of all) {
    const unit = byId.get(q.primary_knowledge_unit_id);
    assert.ok(unit, q.id);
    assert.equal(unit.canonical_claim, q.knowledge, q.id);
    assert.ok(unit.question_ids.includes(q.id), q.id);
    assert.ok(unit.quiz_ids.includes(q.quiz_id), q.quiz_id);
    assert.ok(unit.sources.includes(q.source_urls[0]), q.id + ': source missing');
  }
  for (const card of cards.cards.flatMap(c => c.questions)) {
    const unit = byId.get(card.primary_knowledge_unit_id);
    assert.ok(unit, card.id);
    assert.ok(unit.card_question_ids.includes(card.id), card.id);
    assert.ok(unit.quiz_ids.includes(card.sourceQuizId), card.sourceQuizId);
  }
});

test('ten QuizCard questions are exact references to the fullquiz', () => {
  assert.equal(cards.production_status, 'staged_not_registered_in_quizcard_manifest');
  assert.equal(cards.cards.length, 1);
  const card = cards.cards[0];
  assert.equal(card.questionCount, 10);
  assert.equal(card.questions.length, 10);
  assert.equal(new Set(card.questions.map(q => q.sourceQuizId)).size, 10);
  const byQuiz = new Map(all.map(q => [q.quiz_id,q]));
  for (const q of card.questions) {
    const source = byQuiz.get(q.sourceQuizId);
    assert.ok(source, q.sourceQuizId);
    for (const key of ['question','answer','answerIndex','quiz_id','primary_knowledge_unit_id']) {
      assert.deepEqual(q[key], source[key], q.id + ' ' + key);
    }
    assert.deepEqual(q.options, source.options);
  }
});

test('no same-photo image and frontImage shortcuts in Fotogalleriet draft', () => {
  if (place.image && place.frontImage) {
    assert.notEqual(place.image, place.frontImage);
    assert.notEqual(place.imageMeta?.sourceSha256, place.frontImageMeta?.sourceSha256);
    assert.notEqual(place.imageMeta?.sourcePage, place.frontImageMeta?.sourcePage);
  }
});

test('Foto-gate: rejected Commons artwork photographs stay out of live PlaceCard', () => {
  const review = read('reports/place-production/fotogalleriet-v1-quiz-and-photo-candidates-20261102.json');
  assert.equal(review.images.status, 'candidates_rejected_for_v1_card_photography');
  assert.equal(review.images.candidatePhotos.length, 2);
  const sources = review.images.candidatePhotos.map(p => p.sourcePage);
  const originals = review.images.candidatePhotos.map(p => p.originalId);
  assert.equal(new Set(sources).size, 2);
  assert.equal(new Set(originals).size, 2);
  for (const photo of review.images.candidatePhotos) {
    assert.match(photo.sourcePage, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.match(photo.usageDecision, /^rejected_for_image_or_frontImage:/);
  }
  assert.ok(!place.image && !place.frontImage, 'no rejected image is made active');
});

test('Fotogalleriet quiz covers history and institution without date-question overload', () => {
  const dateOnly = all.filter(q => /^(?:i hvilket (?:år|tiår)|når)\b/i.test(q.question));
  assert.ok(dateOnly.length <= 2, 'too many bare date questions');
  assert.ok(all.every(q => q.knowledge_link_status === 'staged_pending_canonical_registry'),
    'unverified canonical Knowledge must not be labelled linked');
});

test('Fotogalleriet concepts are semantically bound to the curated Fagverk', () => {
  const allowed = new Set(place.fagverk.concepts);
  for (const q of all) {
    assert.ok(Array.isArray(q.concepts) && q.concepts.length > 0, q.id);
    assert.ok(q.concepts.every(c => allowed.has(c)), q.id + ': out-of-scope concept');
    assert.deepEqual(q.concept_ids, [], 'no unverified concept ID must be published');
  }
  const byQuiz = new Map(all.map(q => [q.quiz_id, q]));
  for (const cq of cards.cards[0].questions) {
    assert.deepEqual(cq.concepts, byQuiz.get(cq.sourceQuizId).concepts);
  }
});

test('Fotogalleriet People links include two sourced founders without unlicensed portraits', () => {
  const people = read('data/people/kunst/oslo/people_kunst_oslo.json');
  const runtime = read('data/runtime/place-open/fotogalleriet.json');
  const founders = people.filter(p => ['tom_sandberg_fotograf','dag_alveng_fotograf'].includes(p.id));
  assert.equal(founders.length, 2);
  assert.equal(runtime.people.length, 2);
  for (const person of founders) {
    assert.equal(person.placeId, 'fotogalleriet');
    assert.deepEqual(person.places, ['fotogalleriet']);
    assert.equal(person.category, 'kunst');
    assert.ok(person.popupDesc.length > 300);
    assert.ok(person.externalLinks.some(source => source.url.startsWith('https://snl.no/')));
    assert.equal(person.image, '');
    assert.equal(person.cardImage, '');
    assert.deepEqual(runtime.people.find(x => x.id === person.id), person);
  }
});
test('staging remains absent from active quiz manifest until photo and production gates pass', () => {
  const manifest = read('data/quiz/manifest.json');
  const serialized = JSON.stringify(manifest);
  assert.ok(!serialized.includes('fotogalleriet'), 'Fotogalleriet must not be registered in the active quiz manifest while staged');
  const stagedFile = 'reports/place-production/fotogalleriet/quiz-sets-staged.json';
  assert.ok(!serialized.includes(stagedFile), 'draft quiz file must not be exposed as an active source');
  assert.ok(place.image && place.frontImage, 'two original illustrations must now be in place');
  assert.notEqual(place.image, place.frontImage);
  assert.equal(place.imageMeta.assetType, 'ai_generated_illustration');
  assert.equal(place.frontImageMeta.assetType, 'ai_generated_illustration');
  assert.match(place.imageCaption, /Illustrasjon.*AI-generert/u);
  assert.match(place.frontImageCaption, /Illustrasjon.*AI-generert/u);
});

test('documentary source photos remain blocked while independent original illustrations are accepted', () => {
  const review = read('reports/place-production/fotogalleriet/photo-clearance-review-20261102.json');
  assert.equal(review.placeId, place.id);
  assert.equal(review.canMergeAsCompleteV1, false);
  assert.equal(review.livePlacePhotosChanged, false);
  assert.equal(review.livePlaceIllustrationsChanged, true);
  assert.equal(review.requiredPhotoSlots.length, 2);
  assert.deepEqual(review.requiredPhotoSlots.map(slot => slot.role), ['image', 'frontImage']);
  assert.ok(review.requiredPhotoSlots.every(slot => slot.status === 'fulfilled_with_original_ai_generated_illustration'));
  const blockedSources = review.sourceReview.filter(item =>
    /^(?:do_not_|rejected_|histor(?:ic|ical)_|candidate_)/.test(item.decision)
    || item.decision.includes('not_approved'));
  assert.equal(blockedSources.length, review.sourceReview.length,
    'photo source was silently approved without completing v1 release gate');
  assert.ok(review.researchLeads.every(lead => lead.rightsStatus === 'no_license_granted'));
  assert.ok(review.researchLeads.every(lead => /not_sent/.test(lead.outreachStatus)),
    'requests must not be reported as sent without external confirmation');
});

test('Knowledge handoff has exact reverse coverage without orphan or duplicate claims', () => {
  const handoff = read('reports/place-production/fotogalleriet/knowledge-handoff-20261102.json');
  const byQuestionId = new Map(all.map(q => [q.id, q]));
  const byQuizId = new Map(all.map(q => [q.quiz_id, q]));
  const cardsById = new Map(cards.cards.flatMap(card => card.questions).map(q => [q.id, q]));
  assert.equal(handoff.units.length, 17);
  const seenQ = new Set(), seenCard = new Set(), seenQuiz = new Set();
  for (const unit of handoff.units) {
    assert.equal(unit.status, 'reviewed_staged_not_canonical');
    assert.equal(unit.subject_id, 'kunst');
    assert.equal(unit.claim_ids.length, 1);
    assert.ok(unit.sources.length > 0);
    assert.ok(unit.question_ids.length > 0);
    for (const id of unit.question_ids) {
      assert.ok(!seenQ.has(id), 'quiz question appears in multiple knowledge units: ' + id);
      seenQ.add(id);
      const quizQuestion = byQuestionId.get(id);
      assert.ok(quizQuestion, 'orphan knowledge question ID: ' + id);
      assert.equal(quizQuestion.primary_knowledge_unit_id, unit.knowledge_unit_id);
      assert.equal(quizQuestion.claim_id, unit.claim_ids[0]);
    }
    for (const quizId of unit.quiz_ids) {
      assert.ok(!seenQuiz.has(quizId), 'quiz ID appears in multiple knowledge units: ' + quizId);
      seenQuiz.add(quizId);
      assert.equal(byQuizId.get(quizId)?.primary_knowledge_unit_id, unit.knowledge_unit_id);
    }
    for (const cardQuestionId of unit.card_question_ids) {
      assert.ok(!seenCard.has(cardQuestionId), 'QuizCard ID appears in multiple knowledge units: ' + cardQuestionId);
      seenCard.add(cardQuestionId);
      assert.equal(cardsById.get(cardQuestionId)?.primary_knowledge_unit_id, unit.knowledge_unit_id);
    }
  }
  assert.deepEqual([...seenQ].sort(), [...byQuestionId.keys()].sort());
  assert.deepEqual([...seenQuiz].sort(), [...byQuizId.keys()].sort());
  assert.deepEqual([...seenCard].sort(), [...cardsById.keys()].sort());
});
test('two on-repo AI WebPs are independent originals with correct hashes and visible labels', () => {
  const metadata = read('bilder/places/fotogalleriet/illustration_metadata.json');
  assert.equal(metadata.placeId, place.id);
  assert.equal(metadata.assets.length, 2);
  const seenOriginals = new Set();
  for (const asset of metadata.assets) {
    const location = place[asset.role];
    assert.equal(location, asset.path);
    const raw = fs.readFileSync(new URL('../' + location, import.meta.url));
    assert.equal(raw.subarray(0, 4).toString(), 'RIFF');
    assert.equal(raw.subarray(8, 12).toString(), 'WEBP');
    assert.equal(raw.length, asset.bytes);
    const hash = createHash('sha256').update(raw).digest('hex');
    assert.equal(hash, asset.sha256);
    assert.equal(place[asset.role + 'Meta'].sourceSha256, hash);
    assert.equal(place[asset.role + 'Meta'].assetType, 'ai_generated_illustration');
    assert.match(place[asset.role + 'Caption'], /Illustrasjon.*AI-generert/u);
    assert.ok(!seenOriginals.has(hash), 'two slots reuse one generated original');
    seenOriginals.add(hash);
  }
  assert.equal(seenOriginals.size, 2);
});
