import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

function readMetrics() {
  const output = execFileSync(
    process.execPath,
    ['dist/tools/report_stories_governance.mjs', '--json'],
    { encoding: 'utf8' },
  );
  return JSON.parse(output);
}

test('Stories governance report exposes a coherent canonical metric set', () => {
  const metrics = readMetrics();

  const integerFields = [
    'totalPlaceRecords',
    'activeStoryFiles',
    'totalStories',
    'legacyStories',
    'episodeFiles',
    'episodeStories',
    'storyCoveredPlaces',
    'episodeReadyPlaces',
  ];
  for (const field of integerFields) {
    assert.equal(Number.isInteger(metrics[field]), true, `${field} must be an integer`);
    assert.ok(metrics[field] >= 0, `${field} must be non-negative`);
  }

  const percentFields = [
    'episodeStorySharePercent',
    'storyPlaceCoveragePercent',
    'episodeReadyPlaceCoveragePercent',
  ];
  for (const field of percentFields) {
    assert.equal(typeof metrics[field], 'number', `${field} must be numeric`);
    assert.ok(metrics[field] >= 0 && metrics[field] <= 100, `${field} must be within 0–100`);
  }

  assert.equal(metrics.totalStories, metrics.legacyStories + metrics.episodeStories);
  assert.ok(metrics.episodeFiles <= metrics.activeStoryFiles);
  assert.ok(metrics.storyCoveredPlaces <= metrics.totalPlaceRecords);
  assert.ok(metrics.episodeReadyPlaces <= metrics.storyCoveredPlaces);
  assert.ok(metrics.episodeReadyPlaces <= metrics.totalPlaceRecords);
});

test('Stories governance report keeps percentage calculations deterministic', () => {
  const metrics = readMetrics();
  const percent = (part, total) => total === 0 ? 0 : Number(((part / total) * 100).toFixed(1));

  assert.equal(
    metrics.episodeStorySharePercent,
    percent(metrics.episodeStories, metrics.totalStories),
  );
  assert.equal(
    metrics.storyPlaceCoveragePercent,
    percent(metrics.storyCoveredPlaces, metrics.totalPlaceRecords),
  );
  assert.equal(
    metrics.episodeReadyPlaceCoveragePercent,
    percent(metrics.episodeReadyPlaces, metrics.totalPlaceRecords),
  );
});
