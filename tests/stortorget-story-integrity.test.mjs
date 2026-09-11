import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const stories = JSON.parse(fs.readFileSync('data/stories/stories_stortorget.json', 'utf8'));
const story = stories.find((entry) => entry?.id === 'st_stortorget_hovedmarked_1737');

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
