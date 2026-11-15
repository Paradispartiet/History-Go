#!/usr/bin/env node
// Staged episode_v1 evidence/score test, not a release/manifest authorization.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (file) => JSON.parse(fs.readFileSync(path.join(process.cwd(), file), 'utf8'));
const ID = 'minneparken_gamlebyen';
const storyPath = `data/stories/stories_${ID}.json`;
const [story] = read(storyPath);
const types = new Set(read('data/stories/story_types.json').types.map((x) => x.id));
const manifest = read('data/stories/stories_manifest.json');
const episodeManifest = read('data/stories/stories_episode_v1_manifest.json');
const brief = read(`data/quiz/production_briefs/historie/${ID}.json`);
const history = read(`data/places/historie-production/${ID}.json`);
const asText = (value) => typeof value === 'string' ? value.trim() : '';
const narrativeText = `${asText(story.summary)} ${asText(story.story)}`.trim().toLowerCase();
const matches = (pattern) => narrativeText.match(pattern)?.length ?? 0;

function canonicalScore() {
  const narrative = Math.min(3 + matches(/\bkonflikt|strid|debatt|drama\b/g), 5);
  const historical = Math.min(2 + matches(/\bkrig|valg|regjering|okkupasjon\b/g) +
    matches(/\bbyutvikling|industri|arbeider\b/g), 5);
  const n = story.sources.length;
  const source = n >= 3 ? 5 : n === 2 ? 4 : n === 1 ? 3 : 1;
  const play_value = Math.min(3 + matches(/\bmorsom|absurd|merkelig|underlig\b/g) +
    matches(/\bkonflikt|skandale|drama|vendepunkt\b/g), 5);
  const originality = Math.min(3 + matches(/\buvanlig|unik|første gang|sjelden\b/g) +
    matches(/\bmerkelig|underlig|absurd\b/g), 5);
  return { narrative, historical, source, play_value, originality,
    total: narrative + historical + source + play_value + originality };
}

test('Minneparken Story candidate has canonical episode-v1 fields and reviewed evidence', () => {
  assert.equal(story.place_id, ID);
  assert.equal(story.quality_profile, 'episode_v1');
  assert.ok(types.has(story.type));
  assert.equal(story.year, 2024);
  assert.ok(asText(story.id));
  assert.ok(asText(story.title));
  assert.ok(asText(story.summary));
  assert.ok(asText(story.story));
  assert.ok(Array.isArray(story.related_people));
  assert.ok(Array.isArray(story.related_places));
  assert.ok(Array.isArray(story.next_scenes));
  assert.ok(Array.isArray(story.episode.actors) && story.episode.actors.length);
  for (const field of ['date', 'action', 'consequence']) assert.ok(asText(story.episode[field]), field);
  assert.ok(story.sources.length >= 2);
  const approvedUrls = new Set(Object.values(brief.sources).filter(s => s.review_status === 'reviewed').map(s => s.url));
  for (const source of story.sources) {
    assert.ok(asText(source.title));
    assert.ok(source.url.startsWith('https://'));
    assert.ok(approvedUrls.has(source.url), `Story source not in reviewed packet: ${source.url}`);
  }
  assert.match(story.story, /november.*2025/i);
  assert.match(story.story, /2026/);
});

test('Minneparken Story score matches canonical deterministic scoring engine', () => {
  assert.deepEqual(story.score, canonicalScore());
});

test('Story does not become playable without both manifests and Historie closeout', () => {
  const active = manifest.files.some((entry) => entry?.path === storyPath);
  const strict = episodeManifest.files.includes(storyPath);
  if (!active) {
    assert.equal(strict, false, 'Do not register an inactive Story as an active episode-v1 production file');
    assert.notEqual(history.gates.H.status, 'PASS', 'Gate H must not pass for an inactive Story');
  } else {
    assert.equal(strict, true, 'Every active new episode_v1 Story must be registered in the strict manifest');
  }
  if (history.status === 'ready') assert.equal(history.gates.H.status, 'PASS');
});
