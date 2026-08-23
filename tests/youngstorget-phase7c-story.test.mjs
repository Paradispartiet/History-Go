import assert from 'node:assert/strict';
import fs from 'node:fs';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

const stories = readJson('data/stories/stories_youngstorget.json');
const storiesManifest = readJson('data/stories/stories_manifest.json');
const episodeManifest = readJson('data/stories/stories_episode_v1_manifest.json');
const storyTypes = readJson('data/stories/story_types.json');
const narratives = readJson('data/stories/narratives.json');
const evidence = readJson('reports/place-production/youngstorget-phase7c-story-source-addendum-v1.json');

assert.equal(stories.length, 1, '7C skal bevare én samlet Youngstorget-fortelling');
const story = stories[0];
assert.equal(story.id, 'st_youngstorget_mayday', 'eksisterende Story-ID må bevares for narrative-referanser');
assert.equal(story.place_id, 'youngstorget');
assert.equal(story.quality_profile, 'episode_v1');
assert.equal(story.type, 'political');
assert.ok(storyTypes.types.some(row => row.id === story.type), 'story-type må være canonical');
assert.equal(story.year, 1890);
assert.equal(story.episode?.date, '1890-05-01');
assert.ok(Array.isArray(story.episode?.actors) && story.episode.actors.length >= 1);
assert.match(story.episode.action, /Youngstorget/);
assert.match(story.episode.action, /Stortinget/);
assert.match(story.episode.action, /åttetimersdag/);
assert.match(story.episode.consequence, /Stortingets presidentskap/);

assert.deepEqual(story.related_people, [], 'Martin Tranmæl skal ikke feilaktig være aktør i 1890-episoden');
assert.deepEqual(story.related_places, ['stortinget'], 'Stortinget er dokumentert del av den konkrete 1890-ruten');
assert.equal(story.next_scenes.length, 1);
assert.equal(story.next_scenes[0].place_id, 'stortinget');
assert.match(story.next_scenes[0].reason, /overlevert presidentskapet/);

assert.ok(Array.isArray(story.sources) && story.sources.length === 3);
assert.ok(story.sources.every(source => source.title && String(source.url || '').startsWith('https://')));
assert.ok(story.sources.some(source => source.url === 'https://oslobyleksikon.no/side/1._mai'));
assert.ok(story.sources.some(source => source.url === 'https://www.arbark.no/Utstilling/8timersdagen/8timersdagen_kap03.htm'));
assert.match(story.story, /3 600/);
assert.match(story.story, /nærmere 4 000/);
assert.match(story.story, /kildene var helt enige/);
assert.doesNotMatch(`${story.title} ${story.summary} ${story.story}`, /første 1\. mai-demonstrasjon|første 1\. mai-demonstrasjonstog/i, 'held-back superlativ skal ikke snike seg inn');

assert.deepEqual(story.score, {
  narrative: 5,
  historical: 2,
  source: 5,
  play_value: 5,
  originality: 3,
  total: 20
});

assert.ok(episodeManifest.files.includes('data/stories/stories_youngstorget.json'), 'Youngstorget-filen må være under streng episode-v1-validering');
assert.ok(storiesManifest.files.some(row => row.entity_id === 'youngstorget' && row.path === 'data/stories/stories_youngstorget.json'), 'runtime-manifestet må fortsatt eie Story-filen');
const workersNarrative = narratives.narratives.find(row => row.id === 'nar_workers_movement_oslo');
assert.ok(workersNarrative?.story_ids?.includes('st_youngstorget_mayday'), 'narrative-referansen skal overleve ID-bevaringen');

const countConflict = evidence.claims.find(row => row.claim_id === 'cf01_young_story_1890_attendance_002');
assert.equal(countConflict?.review_status, 'verified_with_source_disagreement');
assert.match(countConflict?.inference_limit || '', /Flere tusen/);
assert.equal(evidence.story_scope_decisions.martin_tranmael_relation_removed, true);
assert.equal(evidence.story_scope_decisions.tullinlokka_canonical_place_created, false);

console.log('Youngstorget phase 7C story regression: PASS');
