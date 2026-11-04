import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const stage = read('data/people/staging/toyen_trafo_people_20261104.json');
const audit = read('reports/place-production/toyen-trafo-people-claims-20261104.json');
const manifest = read('data/people/manifest.json');
const runtime = read('data/runtime/place-open/toyen_trafo.json');
test('Tøyen trafo: two uniquely identified source-backed People drafts', () => {
  assert.equal(stage.placeId, 'toyen_trafo');
  assert.deepEqual(stage.profiles.map(p => p.id), ['thorvald_astrup','kari_rolfsen']);
  assert.deepEqual(audit.profiles.map(p => p.person_id), stage.profiles.map(p => p.id));
  for (const p of stage.profiles) {
    assert.equal(p.placeId, 'toyen_trafo');
    assert.deepEqual(p.places, ['toyen_trafo']);
    assert.equal(p.image, null);
    assert.equal(p.cardImage, null);
    assert.ok(p.source_urls.every(u => u.startsWith('https://')));
    assert.match(p.publicationStatus,/not_manifest_loaded/);
  }
});
test('Tøyen trafo: every staged sentence and place link is mapped to checked claims', () => {
  for (const p of stage.profiles) {
    const auditPerson = audit.profiles.find(x => x.person_id === p.id);
    assert.equal(auditPerson.identity.identity_status, 'verified');
    const claims = new Map(auditPerson.claims.map(c => [c.id,c]));
    for (const c of claims.values()) {
      assert.equal(c.status, 'verified');
      assert.ok(c.source_url.startsWith('https://'));
      assert.ok(c.source_location.length > 5);
      assert.equal(c.verified_at, '2026-11-04');
    }
    for (const f of ['name','year','placeId','places[toyen_trafo]']) {
      const ids = auditPerson.field_claim_map[f];
      assert.ok(ids?.length && ids.every(id => claims.has(id)), p.id + ' field ' + f);
    }
    for (const field of ['desc','popupDesc']) {
      const sentences = p[field].split(/(?<=[.!?])\\s+(?=[A-ZÆØÅ])/).filter(Boolean);
      const mapping = auditPerson.sentence_claim_map[field];
      assert.equal(sentences.length, mapping.length, p.id + ':' + field);
      for (const m of mapping) assert.ok(m.claim_ids.length && m.claim_ids.every(id => claims.has(id)));
    }
    assert.equal(auditPerson.imageReview.can_publish, false);
  }
});
test('Tøyen trafo: research does not activate unpublished People, Objects or Brands', () => {
  assert.equal(audit.publicationDecision, 'hold_for_portraits_and_canonical_pipeline__do_not_activate_people');
  for (const p of stage.profiles) {
    assert.ok(!manifest.files.some(f => f.endsWith('/'+p.id+'.json')));
  }
  assert.equal(runtime.people.length, 0);
  assert.equal(runtime.brands.length, 0);
  assert.ok(!runtime.objects || runtime.objects.length === 0);
  assert.equal(runtime.lesespor.length, 4);
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.language.entries.length, 6);
});
