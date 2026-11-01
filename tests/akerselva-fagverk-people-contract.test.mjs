import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validatePeopleClaimsDocument } from '../tools/audit-people-profile-canonical.mjs';

const load = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));

test('Akerselva Fagverk keeps canonical registry, chapters and place-specific evidence', () => {
  const place = load('data/places/by/oslo/places/akerselva.json');
  const registry = load('data/fagverk/fagverk_registry.json');
  const link = registry.placeLinks.akerselva;
  assert.equal(place.id, 'akerselva');
  assert.equal(link.sourceFile, 'places/by/oslo/places/akerselva.json');
  assert.equal(link.status, 'curated');
  assert.equal(place.fagverk.status, 'curated');
  assert.equal(place.fagverk.schema, link.schema);
  assert.equal(place.fagverk.level, link.level);
  assert.ok(place.fagverk.article.length >= 3);
  assert.ok(place.fagverk.chapter_ids.length >= 2);
  assert.ok(place.fagverk.source_urls.length >= 2);
  assert.ok(place.fagverk.source_urls.every(url => url.startsWith('https://')));
  for (const lens of place.fagverk.lenses) {
    assert.ok(lens.title && lens.prompt && lens.evidence);
    assert.ok(place.fagverk.emne_ids.includes(lens.emne_id));
  }
  assert.equal(place.anchors.length, 3);
  assert.ok(place.anchors.every(anchor => anchor.type === 'route_point'));
});

test('Akerselva People keep their evidence-based primary sites, not the whole river', () => {
  const grunerRows = load('data/people/historie/oslo/akerselva/friedrich_gruner.json');
  const hausmannRows = load('data/people/historie/oslo/akerselva/fredrik_ferdinand_hausmann.json');
  assert.equal(grunerRows.length, 1);
  assert.equal(hausmannRows.length, 1);
  const [gruner] = grunerRows;
  const [hausmann] = hausmannRows;
  assert.equal(gruner.placeId, 'nedre_foss');
  assert.ok(gruner.places.includes('nedre_foss'));
  assert.equal(hausmann.placeId, 'prinds_christian_augusts_minde');
  assert.ok(hausmann.places.includes('hausmannsbrua'));
  assert.ok(!gruner.places.includes('akerselva'));
  assert.ok(!hausmann.places.includes('akerselva'));
});

test('Akerselva excludes undocumented industrial People from canonical and generated data', () => {
  const people = load('data/people/naeringsliv/oslo/people_naeringsliv_oslo.json');
  const runtime = load('data/runtime/place-open/akerselva.json');
  const ids = ['sam_eyde_industriutbygger', 'kristian_birkeland_teknologi_og_industri'];
  for (const id of ids) {
    const person = people.find(row => row.id === id);
    assert.ok(person, 'Person profile must be preserved: ' + id);
    assert.notEqual(person.placeId, 'akerselva');
    assert.ok(!person.places?.includes('akerselva'));
    assert.ok(!runtime.people?.some(row => row.id === id));
  }
});

test('Akerselva publishes only two evidenced, deduplicated People profiles', () => {
  const schou = load('data/people/naeringsliv/oslo/ovre_foss/halvor_schou.json')[0];
  const graah = load('data/people/natur/oslo/people_natur_oslo.json')
    .find(person => person.id === 'knud_graah_voyenfallene');
  const people = load('data/runtime/place-open/akerselva.json').people;
  assert.deepEqual(people.map(person => person.id), [graah.id, schou.id]);
  assert.equal(new Set(people.map(person => person.id)).size, 2);
  for (const person of [graah, schou]) {
    assert.ok(person.places.includes('akerselva'));
    assert.equal(person.profileStatus, 'ready_people_v1');
    assert.deepEqual(people.find(item => item.id === person.id), person);
    const claims = load(person.claimsFile);
    assert.equal(claims.person_id, person.id);
    assert.equal(claims.identity.identity_status, 'verified');
    assert.equal(claims.completion.current_status, 'ready_people_v1');
    assert.ok(claims.field_claim_map['places[akerselva]'].length);
    assert.ok(claims.claims.every(claim => claim.status === 'verified'));
    assert.deepEqual(validatePeopleClaimsDocument(claims, person, {claimsPath:person.claimsFile,now:new Date('2026-10-31T12:00:00Z')}), []);
  }
  const shard3 = load('data/runtime/people-all/part-003.json');
  const shard7 = load('data/runtime/people-all/part-007.json');
  for (const person of [graah, schou]) {
    const entries = [...shard3, ...shard7].filter(item => item.id === person.id);
    assert.equal(entries.length, 1, 'People global payload must not duplicate ' + person.id);
    assert.deepEqual(entries[0], person);
  }
  assert.ok(load('data/runtime/place-open/voienfossen.json').people.some(p => p.id === graah.id));
  for (const placeId of ['glads_molle','ovre_foss','schous_bryggeri','voienfossen']) {
    assert.ok(load('data/runtime/place-open/' + placeId + '.json')
      .people.some(p => p.id === schou.id), 'Halvor missing from ' + placeId);
  }
});


test('Akerselva language lexicon has sourced river-name history and runtime parity', () => {
  const manifest = load('data/leksikon/sprak/manifest.json');
  const path = 'data/leksikon/sprak/places/europe/norway/oslo/akerselva.json';
  assert.equal(manifest.place_files.akerselva, path);
  const lexicon = load(path);
  const payload = load('data/runtime/place-open/akerselva.json');
  assert.equal(lexicon.place_id, 'akerselva');
  assert.deepEqual(payload.language, lexicon);
  assert.equal(lexicon.entries.length, 5);
  assert.deepEqual(new Set(lexicon.entries.map(entry => entry.term)),
    new Set(['Akerselva', 'Frysja', 'Aggershuses elv', 'O / å', 'Vaterlandselva']));
  for (const entry of lexicon.entries) {
    assert.equal(entry.linked_to.kind, 'place');
    assert.equal(entry.linked_to.id, 'akerselva');
    assert.equal(entry.layer, 'language');
    assert.ok(entry.meaning && entry.context);
    assert.ok(['current','historical'].includes(entry.status));
    assert.ok(entry.sources.length > 0);
    assert.ok(entry.sources.every(source => source.label && /^https:\/\//.test(source.url)));
  }
});


test('Knud Graah portrait is source-backed, unmistakably a painting, and synced to both Places', () => {
  const graah = load('data/people/natur/oslo/people_natur_oslo.json')
    .find(person => person.id === 'knud_graah_voyenfallene');
  assert.ok(graah?.image?.includes('Knud_Graah.jpg'));
  assert.equal(graah.image, graah.cardImage);
  assert.equal(graah.imageMeta.assetKind, 'historical_painted_portrait');
  assert.equal(graah.imageMeta.license, 'CC BY-SA 4.0');
  assert.match(graah.imageMeta.credit, /Cathrine Heyerdahl/);
  assert.match(graah.imageMeta.credit, /Oslo Museum/);
  assert.equal(graah.imageMeta.accessionNumber, 'OB.00242');
  const claims = load(graah.claimsFile);
  const portraitClaim = claims.claims.find(claim => claim.id === 'historical_portrait_1891');
  assert.ok(portraitClaim?.source_url?.endsWith('File:Knud_Graah.jpg'));
  assert.ok(claims.field_claim_map.image.includes(portraitClaim.id));
  assert.ok(claims.field_claim_map.cardImage.includes(portraitClaim.id));
  assert.equal(claims.completion.claims_verified, '7/7');
  for (const id of ['akerselva', 'voienfossen']) {
    const people = load('data/runtime/place-open/' + id + '.json').people;
    assert.deepEqual(people.find(person => person.id === graah.id), graah);
  }
  const rows = [...Array.from({length:7},(_,i) =>
    load('data/runtime/people-all/part-' + String(i+1).padStart(3,'0') + '.json'))]
    .flat().filter(person => person.id === graah.id);
  assert.deepEqual(rows, [graah]);
  const civication = load('data/Civication/historyPeople_index.json').categories[graah.category]
    .find(person => person.id === graah.id);
  assert.equal(civication.image, graah.image);
  assert.equal(civication.cardImage, graah.cardImage);
});
