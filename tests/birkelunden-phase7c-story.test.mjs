import assert from 'node:assert/strict';
import fs from 'node:fs';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

const stories = readJson('data/stories/stories_birkelunden.json');
const storiesManifest = readJson('data/stories/stories_manifest.json');
const episodeManifest = readJson('data/stories/stories_episode_v1_manifest.json');
const storyTypes = readJson('data/stories/story_types.json');
const evidence = readJson('reports/place-production/birkelunden-phase7c-story-source-addendum-v1.json');

assert.equal(stories.length, 1, 'Birkelunden 7C skal ha én samlet episode-v1-fortelling');
const story = stories[0];
assert.equal(story.id, 'st_birkelunden_bench_to_association');
assert.equal(story.place_id, 'birkelunden');
assert.equal(story.person_id, null);
assert.equal(story.quality_profile, 'episode_v1');
assert.equal(story.type, 'turning_point');
assert.ok(storyTypes.types.some(row => row.id === story.type), 'story-type må være canonical');
assert.equal(story.year, 1937);
assert.equal(story.episode?.date, '1937');
assert.ok(Array.isArray(story.episode?.actors) && story.episode.actors.length >= 2);
assert.match(story.episode.action, /benk/);
assert.match(story.episode.action, /hvilebrakke/);
assert.match(story.episode.action, /18 personer/);
assert.match(story.episode.consequence, /1984/);

assert.ok(Array.isArray(story.sources) && story.sources.length === 3);
assert.ok(story.sources.every(source => source.title && String(source.url || '').startsWith('https://')));
assert.ok(story.sources.some(source => source.url === 'https://www.pensjonistforbundet.no/om-oss/var-historie'));
assert.ok(story.sources.some(source => source.url.includes('Tobias_2_3_2006.pdf')));
assert.ok(story.sources.some(source => source.url === 'https://oslobyleksikon.no/side/Birkelunden'));

assert.match(story.story, /10–12 pensjonister/);
assert.match(story.story, /Venner i Bjerkelunden/);
assert.match(story.story, /Venner i Birkelund/);
assert.match(story.story, /formann i 23 år/);
assert.match(story.story, /Reist av pensjonister 1984/);
assert.doesNotMatch(`${story.title} ${story.summary} ${story.story}`, /Norges eldste|landets eldste/i, 'held-back superlativ skal ikke promoteres');

assert.deepEqual(story.related_people, [], 'Jack Johnsen har ingen canonical People-ID i 7C og skal ikke få oppfunnet referanse');
assert.deepEqual(story.related_places, [], '7C har ingen dokumentert canonical related Place som er nødvendig for episoden');
assert.deepEqual(story.next_scenes, [], 'tematisk eller geografisk naboskap skal ikke bli kunstig next_scene');

assert.deepEqual(story.score, {
  narrative: 3,
  historical: 2,
  source: 5,
  play_value: 3,
  originality: 3,
  total: 16
});

assert.ok(episodeManifest.files.includes('data/stories/stories_birkelunden.json'), 'Birkelunden Story må være under streng episode-v1-validering');
assert.ok(storiesManifest.files.some(row => row.entity_id === 'birkelunden' && row.path === 'data/stories/stories_birkelunden.json'), 'canonical Stories-manifest må registrere Birkelunden Story');

const nameClaim = evidence.claims.find(row => row.claim_id === 'cf02_birkelunden_story_name_004');
assert.equal(nameClaim?.review_status, 'verified_with_source_wording_disagreement');
assert.match(nameClaim?.inference_limit || '', /ikke normalisere/);
assert.equal(evidence.story_scope_decisions.canonical_jack_johnsen_people_id_found, false);
assert.equal(evidence.story_scope_decisions.related_people_materialized, false);
assert.equal(evidence.story_scope_decisions.next_scene_materialized, false);
assert.equal(evidence.story_scope_decisions.oldest_superlative_promoted, false);

console.log('Birkelunden phase 7C story regression: PASS');
