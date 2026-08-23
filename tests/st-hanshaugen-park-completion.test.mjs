import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const id = 'st_hanshaugen_park';
const place = json('data/places/by/oslo/places/st_hanshaugen_park.json');
const production = json('data/places/production/st_hanshaugen_park.json');
const audit = json('reports/place-production/st-hanshaugen-park-final-audit-v1.json');
const stories = json('data/stories/stories_st_hanshaugen_park.json');
const language = json('data/leksikon/sprak/places/europe/norway/oslo/st_hanshaugen_park.json');
const leksikon = json('data/leksikon/places/oslo/historie/leksikon_oslo_historie.json').filter(row => row.place_id === id);
const readingRaw = json('data/lesespor/oslo/lesespor_oslo_historie.json');
const reading = readingRaw.items.filter(row => row.place_ids?.includes(id));
const manifest = json('data/people/manifest.json');
const people = manifest.files.flatMap(file => {
  const value = json(`data/${file}`);
  return Array.isArray(value) ? value : value.people || [value];
}).filter(person => [person.placeId, ...(person.places || [])].includes(id));
const route = json('data/routes_walks.json').find(row => row.id === 'akersryggen_stein_minne_park');

test('St. Hanshaugen is a complete source-backed park experience', () => {
  assert.deepEqual(place.rounds, ['people', 'nature', 'badges', 'civication', 'brands', 'leksikon', 'før_nå', 'routes']);
  assert.match(place.popupDesc, /Mærrahaugen/);
  assert.match(place.popupDesc, /varslet været/);
  assert.match(place.popupDesc, /Akerryggen/);
  assert.equal(place.externalLinks.length, 4);
  assert.equal(place.externalLinks.every(link => /^https:\/\//.test(link.url)), true);
  assert.equal(place.research_notes.length, 0);
  for (const seed of ['safe_facts', 'wonderkammer_seed', 'people_relations_seed']) assert.equal(Object.hasOwn(place, seed), false);
});

test('all requested content surfaces meet their reviewed counts', () => {
  assert.equal(stories.length, 3);
  assert.equal(stories.every(story => story.story.split(/\n\s*\n/).length === 3 && story.sources.length), true);
  assert.equal(leksikon.length, 1);
  assert.equal(leksikon[0].chronology.length, 12);
  assert.equal(language.entries.length, 4);
  assert.equal(reading.length, 3);
  assert.deepEqual(people.map(person => person.id).sort(), place.related_people_ids.toSorted());
  assert.equal(place.objects.length, 3);
  assert.equal(place.objects.every(object => object.physicalObject && object.placeSpecific && object.source_urls.length), true);
  assert.equal(place.related_place_ids.length, 4);
  assert.deepEqual(route.stops.map(stop => stop.placeId), ['damstredet_telthusbakken', 'gamle_aker_kirke', 'var_frelsers_gravlund', id]);
});

test('production package and final audit close every gate', () => {
  assert.equal(production.status, 'ready_v4_2');
  assert.equal(production.roundsReadiness.status, 'production_ready');
  assert.equal(production.completion.currentStatus, 'current');
  assert.equal(audit.status, 'PRODUCTION_READY');
  assert.deepEqual(audit.blockers, []);
  assert.equal(audit.checklist.every(row => row.status === 'PASS'), true);
  assert.equal(Object.values(audit.quality_score.dimensions).every(score => score >= 4), true);
  assert.equal(audit.quality_score.critical_findings, 0);
});
