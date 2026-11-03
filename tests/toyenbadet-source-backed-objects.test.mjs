import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const place=json('data/places/sport/europa/norway/oslo_sport/toyenbadet.json');
const work=json('reports/place-production/toyenbadet-workcard-current.json');
const peopleReview=json('reports/place-production/toyenbadet-people-claims-20261103.json');

test('Tøyenbadet Objects: two identifiable physical items with different source-backed functions',()=>{
  assert.deepEqual(place.objects.map(o=>o.id),['toyenbadet_startpall_nummer_8','toyenbadet_mobil_bassengheis']);
  for(const o of place.objects){
    assert.equal(o.physicalObject,true);
    assert.ok(o.placeSpecificReason.length>=100);
    assert.ok(o.historicalFunction.length>=65);
    assert.ok(o.location.length>=18);
    assert.ok(o.source_urls.some(url=>url.startsWith('https://')));
    assert.equal(o.imageKind,'illustration');
    assert.match(o.imageAlt,/Illustrasjon – ikke fotografi/);
    assert.match(o.imageMeta.disclosure,/ikke fotografi/);
    assert.match(o.imageMeta.representationLimits,/(?:ikke|ingen)/i);
    assert.equal(o.imageMeta.license,'CC0 1.0');
    assert.ok(o.image.endsWith('.svg')&&o.image.startsWith('bilder/objects/'));
    const svg=fs.readFileSync(o.image,'utf8');
    assert.match(svg,/<svg\b/);assert.match(svg,/<\/svg>/);
    assert.match(svg,/ILLUSTRASJON – IKKE FOTOGRAFI/);
    assert.match(svg,/aria-label=/);
    assert.doesNotMatch(svg,/<image\s/i,'object illustration must not embed third-party photographs');
  }
  assert.match(place.objects[0].placeSpecificReason,/startpall 8/);
  assert.ok(place.objects[0].source_urls.some(x=>x.includes('bygg.no')));
  assert.ok(place.objects[1].source_urls.some(x=>x.includes('oslo.kommune.no')));
  assert.deepEqual(place.place_card_profile.collection_ids,['objects','brands','competitions']);
});

test('Tøyenbadet People: real site-linked candidates are audited but no unlicensed/mistaken portrait is published',()=>{
  assert.equal(peopleReview.placeId,'toyenbadet');
  assert.equal(peopleReview.candidates.length,4);
  assert.ok(peopleReview.candidates.every(x=>x.portrait?.status==='BLOCKED'));
  assert.ok(peopleReview.candidates.every(x=>x.claims.every(c=>c.status==='verified'&&c.source_url.startsWith('https://'))));
  assert.ok(peopleReview.candidates.some(x=>x.id==='henrik_christiansen_svommer'&&/skøyteløperen/.test(x.identity)));
  assert.ok(peopleReview.candidates.some(x=>x.id==='hedda_oritsland'));
  assert.ok(peopleReview.discarded.some(x=>/skøyteløper/.test(x.candidate)));
  assert.ok(!place.place_card_profile.collection_ids.includes('people'));
  assert.equal(work.status,'blocked_vferdig');
  assert.equal(work.content_plan.people.status,'CLAIMS_VERIFIED__PORTRAITS_BLOCKED');
});
