import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const placePath = 'data/places/historie/oslo/places_historie/var_frelsers_gravlund.json';
const languagePath = 'data/leksikon/sprak/places/europe/norway/oslo/var_frelsers_gravlund.json';
const place = readJson(placePath);
const articles = readJson('data/leksikon/places/oslo/historie/leksikon_oslo_historie.json');
const mainArticle = articles.find(item => item.place_id === place.id && item.type !== 'news_note');
const news = articles.filter(item => item.place_id === place.id && item.type === 'news_note');
const stories = readJson('data/stories/stories_var_frelsers_gravlund.json');
const episodeManifest = readJson('data/stories/stories_episode_v1_manifest.json');
const readingTrails = readJson('data/lesespor/oslo/lesespor_oslo_historie.json').items.filter(item => item.place_ids.includes(place.id));
const language = readJson(languagePath);
const languageManifest = readJson('data/leksikon/sprak/manifest.json');
const report = readJson('data/places/historie-production/var_frelsers_gravlund.json');
const workcard = fs.readFileSync('reports/place-production/var-frelsers-gravlund-workcard-current.md', 'utf8');
const staticArticle = fs.readFileSync('data/leksikon/places/oslo/historie/var_frelsers_gravlund.html', 'utf8');

const sha256 = path => createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const isHttps = value => URL.canParse(value) && new URL(value).protocol === 'https:';

test('historiepopupen har en tydelig, kildebelagt tidsakse og to daterte nyheter', () => {
  assert.equal(mainArticle.version, 3);
  assert.equal(mainArticle.chronology.length, 13);
  assert.equal(new Set(mainArticle.chronology.map(item => item.id)).size, 13);
  assert.equal(mainArticle.chronology[0].year, 1805);
  assert.equal(mainArticle.chronology.at(-1).year, 2026);
  assert.equal(mainArticle.sources.length, 7);
  assert.ok(mainArticle.sources.every(isHttps));

  assert.deepEqual(news.map(item => item.id), [
    'var_frelsers_nyhet_regelvern_2026',
    'var_frelsers_nyhet_krigsvandring_2026'
  ]);
  assert.deepEqual(news.map(item => item.date), ['2026-01-01', '2026-08-10']);
  assert.ok(news.every(item => item.sources.length >= 2 && item.sources.every(source => isHttps(source.url))));
});

test('legacy-fortellingen er erstattet av en verifisert episode om 17. mai 2026', () => {
  assert.ok(episodeManifest.files.includes('data/stories/stories_var_frelsers_gravlund.json'));
  assert.equal(stories.length, 1);
  const story = stories[0];
  assert.equal(story.id, 'st_var_frelsers_gravlund_for_barnetoget');
  assert.equal(story.quality_profile, 'episode_v1');
  assert.equal(story.episode.date, '2026-05-17');
  assert.equal(story.sources.length, 2);
  assert.deepEqual(story.score, {
    narrative: 5,
    historical: 2,
    source: 4,
    play_value: 4,
    originality: 3,
    total: 18
  });
  assert.deepEqual(story.related_people, [
    'henrik_wergeland',
    'bjornstjerne_bjornson',
    'henrik_ibsen',
    'viggo_hansteen',
    'rolf_wickstrom',
    'anna_rogstad'
  ]);
});

test('før/nå bruker to lokale og rettighetsklare bilder uten falsk motivlikhet', () => {
  const data = place.for_na;
  assert.equal(data.title, 'Grønt minnelandskap, to kamerastandpunkt');
  assert.equal(data.lookFor.length, 3);
  assert.match(data.change, /ulike steder/);
  assert.match(data.change, /ikke brukes som en presis før\/etter-måling/);
  assert.match(data.change, /2008-bildet viser ikke endringer etter denne datoen/);
  assert.ok(data.sources.every(isHttps));

  assert.ok(fs.existsSync(data.beforeImage));
  assert.ok(fs.existsSync(data.nowImage));
  assert.equal(sha256(data.beforeImage), '7f04b2eb789f2bd0a8b383defab20c75df0cd979198e559f0304a96b11f38930');
  assert.equal(sha256(data.nowImage), 'ccc3f087f358f4a9e4bc4db71029edcd047b0ea4169c09e4a884378ccbefa3cd');
  assert.equal(data.beforeImageMeta.license, 'CC0 1.0');
  assert.equal(data.nowImageMeta.license, 'Public domain');
  assert.equal(data.beforeImageMeta.verified, true);
  assert.equal(data.nowImageMeta.verified, true);
  assert.match(data.beforeImageMeta.modifications, /uten oppskalering eller ny beskjæring/);
  assert.match(data.nowImageMeta.modifications, /uten oppskalering eller ny motivbeskjæring/);
});

test('stedet har tre lesespor og fire språkspor uten oppdiktet dialektlag', () => {
  assert.equal(readingTrails.length, 3);
  assert.deepEqual(readingTrails.map(item => item.source_quality), ['canonical', 'recognized', 'recognized']);
  assert.ok(readingTrails.every(item => item.access === 'open' && item.rights === 'link_only'));
  assert.ok(readingTrails.every(item => item.curation_status === 'approved' && item.relevance.length >= 120));
  assert.ok(readingTrails.every(item => isHttps(item.url)));

  assert.equal(languageManifest.place_files[place.id], languagePath);
  assert.equal(language.place_id, place.id);
  assert.equal(language.entries.length, 4);
  assert.ok(language.entries.every(entry => entry.layer === 'language'));
  assert.ok(language.entries.every(entry => entry.sources.length >= 1 && entry.sources.every(source => isHttps(source.url))));
  assert.ok(language.entries.some(entry => entry.term === 'Vor Frelsers Gravlund'));
  assert.ok(language.entries.some(entry => entry.term === 'Den gamle Kirkegaard'));
});

test('statisk artikkel og produksjonsrapport har korrekte grenser for fase 2', () => {
  assert.match(staticArticle, /anlagt i 1807 og tatt i bruk sommeren 1808/);
  assert.match(staticArticle, /Æreslunden er ett avgrenset felt/);
  assert.match(staticArticle, /Uten en egen artskartlegging/);
  assert.doesNotMatch(staticArticle, /Napoleonskrig/);
  assert.doesNotMatch(staticArticle, /stengt for nye graver i 1952/);
  assert.doesNotMatch(staticArticle, /Existing History Go/);
  assert.match(staticArticle, /href="https:\/\//);

  assert.equal(report.chronologyStories.status, 'PASS');
  assert.equal(report.gates.H.status, 'PASS');
  assert.equal(report.quizOpening.status, 'N/A');
  assert.match(workcard, /Status: \*\*FASE 2 PASS/);
  assert.match(workcard, /2\. \*\*PASS\*\* – popup/);
  assert.match(workcard, /bildene har ulike kamerastandpunkt/);
});
