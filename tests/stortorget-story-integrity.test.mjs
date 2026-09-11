import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const stories = JSON.parse(fs.readFileSync('data/stories/stories_stortorget.json', 'utf8'));
const story = stories.find((entry) => entry?.id === 'st_stortorget_hovedmarked_1737');
const epochIndex = JSON.parse(fs.readFileSync('data/epoker/epoke-place-index.json', 'utf8'));

test('Stortorget story score matches canonical integrity metrics', () => {
  assert.ok(story);
  assert.equal(story.score.historical, 2);
  assert.equal(story.score.originality, 3);
  assert.equal(story.score.total, 16);
  assert.equal(
    story.score.narrative + story.score.historical + story.score.source + story.score.play_value + story.score.originality,
    story.score.total
  );
});

test('Canonical Stortorget rebuild includes story integrity finalization', () => {
  const runner = fs.readFileSync('tools/build-stortorget-completion.mjs', 'utf8');
  assert.match(runner, /finalize-stortorget-story-contract\.mjs/u);
});

test('Stortorget story is materialized as dated Oslo epoch evidence', () => {
  const coverage = epochIndex.domains.historie.oslo_coverage.places.find((entry) => entry.place_id === 'stortorget');
  assert.equal(coverage?.status, 'dated_evidence');
  const milestones = Object.values(epochIndex.domains.historie.epochs)
    .flatMap((epoch) => epoch.places)
    .filter((entry) => entry.place_id === 'stortorget')
    .flatMap((entry) => entry.milestones);
  assert.ok(milestones.some((milestone) => milestone.evidence_type === 'canonical_story' && milestone.story_id === story.id));
});
