import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));

const storyPath = 'data/stories/stories_oslo_tinghus.json';
const [story] = readJson(storyPath);
const storyManifest = readJson('data/stories/stories_manifest.json');
const episodeManifest = readJson('data/stories/stories_episode_v1_manifest.json');
const [leksikon] = readJson('data/leksikon/places/oslo/politikk/leksikon_oslo_tinghus.json');
const report = fs.readFileSync('reports/place-production/tinghuset-politikk-v1.md', 'utf8');

test('Oslo tinghus has one active episode-v1 Story with a physical place anchor', () => {
  assert.equal(readJson(storyPath).length, 1);
  assert.equal(story.id, 'st_oslo_tinghus_to_sakkyndigsvar');
  assert.equal(story.quality_profile, 'episode_v1');
  assert.equal(story.type, 'conflict');
  assert.equal(story.place_id, 'tinghuset');

  assert.ok(storyManifest.files.some((entry) => (
    entry.category === 'politikk'
    && entry.entity_id === 'tinghuset'
    && entry.path === storyPath
  )));
  assert.ok(episodeManifest.files.includes(storyPath));
});

test('Story has a narrative conflict, courtroom course, verdict and documented aftermath', () => {
  const paragraphs = story.story.split(/\n\n+/);
  assert.equal(paragraphs.length, 3);
  assert.ok(story.story.length >= 1400);

  for (const required of [
    'to nye sakkyndige',
    'motsatt svar',
    'spesialtilpassede rettssalen i Oslo tinghus',
    '24. august',
    '21 års forvaring',
    'offentlig utvalg',
    'rettspsykiatriens rolle',
  ]) {
    assert.ok(story.story.includes(required), `Story mangler narrativt ledd: ${required}`);
  }

  assert.match(story.episode.action, /motstridende sakkyndigerklæringer/);
  assert.match(story.episode.consequence, /offentlig gjennomgang/);
  assert.equal(story.related_places.length, 0);
});

test('Story adds value beyond chronology and uses four inspectable sources', () => {
  const chronologyTexts = leksikon.chronology.map((entry) => entry.desc);
  assert.ok(!chronologyTexts.includes(story.summary));
  assert.ok(!chronologyTexts.includes(story.story));
  assert.ok(story.story.length > Math.max(...chronologyTexts.map((text) => text.length)) * 4);

  assert.equal(story.sources.length, 4);
  const urls = story.sources.map((source) => source.url);
  assert.equal(urls.filter((url) => url.includes('22julisenteret.no/')).length, 2);
  assert.ok(urls.some((url) => url.includes('lovdata.no/')));
  assert.ok(urls.some((url) => url.includes('regjeringen.no/')));
});

test('Phase report marks only Fortellinger complete and keeps the place under remediation', () => {
  assert.match(report, /\| Fortellinger \| PASS – fase 3 \|/);
  assert.match(report, /\| Før\/etter \| Ikke startet \|/);
  assert.match(report, /Status for samlet sted: \*\*under sanering – ikke produksjonsklart\*\*/);
});
