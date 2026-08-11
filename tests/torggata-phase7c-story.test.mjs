import assert from 'node:assert/strict';
import fs from 'node:fs';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

const stories = readJson('data/stories/stories_torggata.json');
const episodeManifest = readJson('data/stories/stories_episode_v1_manifest.json');
const storyTypes = readJson('data/stories/story_types.json');

assert.equal(stories.length, 1, '7C skal bevare én samlet Torggata-fortelling');
const story = stories[0];
assert.equal(story.id, 'st_torggata_ga_og_sykkelgate_2010');
assert.equal(story.place_id, 'torggata');
assert.equal(story.quality_profile, 'episode_v1');
assert.equal(story.type, 'conflict');
assert.ok(storyTypes.types.some(row => row.id === story.type), 'story-type må være canonical');
assert.equal(story.year, 2010);
assert.deepEqual(story.related_people, []);
assert.deepEqual(story.related_places, []);
assert.deepEqual(story.next_scenes, [], 'tematisk Markveien-next_scene skal ikke overleve 7C');
assert.ok(story.episode?.actors?.length >= 2);
assert.ok(story.episode?.date);
assert.ok(story.episode?.action);
assert.ok(story.episode?.consequence);
assert.ok(Array.isArray(story.sources) && story.sources.length >= 3);
assert.ok(story.sources.every(source => source.title && String(source.url || '').startsWith('https://')));
assert.deepEqual(story.score, {
  narrative: 5,
  historical: 2,
  source: 5,
  play_value: 5,
  originality: 3,
  total: 20
});
assert.ok(episodeManifest.files.includes('data/stories/stories_torggata.json'));

console.log('Torggata phase 7C story regression: PASS');
