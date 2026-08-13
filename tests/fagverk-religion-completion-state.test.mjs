import test from 'node:test';
import assert from 'node:assert/strict';
import completion from '../data/fag/religion/religion_university_completion_v1.json' with { type: 'json' };
import concepts from '../data/fag/religion/begreper_religion_canonical_v1.json' with { type: 'json' };
import statuses from '../data/fagverk/subject_status.json' with { type: 'json' };

test('Religion completion-state er låst', () => {
  const status = statuses.subjects.find((row) => row.id === 'religion');
  assert.equal(completion.complete_ready, true);
  assert.equal(completion.canonical_topic_count, 72);
  assert.equal(completion.standalone_article_count, 72);
  assert.equal(completion.required_method_count, 18);
  assert.equal(completion.registered_source_count, 235);
  assert.equal(completion.registered_claim_count, 432);
  assert.equal(completion.observed_quality_score, 29);
  assert.equal(concepts.status, 'complete');
  assert.equal(concepts.concept_count, 72);
  assert.equal(status.editorialStatus, 'complete');
  assert.equal(status.nextGate, completion.next_gate);
});
