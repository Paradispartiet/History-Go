import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const json = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const stage=json('data/people/staging/toyenbadet_people_20261103.json');
const audit=json('reports/place-production/toyenbadet-people-field-claims-20261103.json');
const canonical=json('data/places/sport/europa/norway/oslo_sport/toyenbadet.json');
const manifest=json('data/people/manifest.json');

test('Four source-backed Tøyenbadet People profiles use labeled AI illustrations, not unlicensed photographs',()=>{
  assert.equal(stage.placeId, 'toyenbadet');
  assert.equal(stage.profiles.length, 4);
  assert.deepEqual(stage.profiles.map(p=>p.id).sort(),audit.profiles.map(p=>p.person_id).sort());
  assert.ok(stage.profiles.every(p=>p.status==='published_with_ai_illustration'));
  assert.ok(stage.profiles.every(p=>p.image_kind==='ai_generated_illustration'));
  assert.ok(stage.profiles.every(p=>p.portrait_gate.illustrationOverride==='approved_as_non_documentary_AI_illustration_not_real_photo'));
  assert.ok(stage.profiles.every(p=>p.placeId==='toyenbadet' && p.places.length===1 && p.places[0]==='toyenbadet'));
  assert.ok(stage.profiles.every(p=>p.portrait_gate.status==='blocked_rights_identification'));
  assert.ok(stage.profiles.every(p=>p.image && p.cardImage && fs.existsSync(p.image) && fs.existsSync(p.cardImage)));
  assert.ok(stage.profiles.every(p=>manifest.files.includes(`people/${p.category}/oslo/toyenbadet/${p.id}.json`)));
  assert.equal(canonical.place_card_profile.collection_ids.includes('people'),true,
    'Anne Lindboe is approved and People must stay active after PR #7005');
  assert.deepEqual(canonical.place_card_profile.collection_ids,['people','objects','brands','competitions']);
  assert.ok(manifest.files.every(p=>!p.includes('toyenbadet_people_20261103')));
});
test('Already-approved Anne Lindboe remains in canonical People and is not confused with staged drafts',()=>{
  const approved=json('data/people/politikk/oslo/toyenbadet/anne_lindboe.json');
  assert.equal(approved.length,1);
  assert.equal(approved[0].id,'anne_lindboe');
  assert.equal(approved[0].placeId,'toyenbadet');
  assert.ok(approved[0].image && approved[0].cardImage);
  assert.ok(fs.existsSync(approved[0].image) && fs.existsSync(approved[0].cardImage));
  assert.ok(manifest.files.includes('people/politikk/oslo/toyenbadet/anne_lindboe.json'));
  const runtime=json('data/runtime/place-open/toyenbadet.json');
  assert.deepEqual(new Set(runtime.people.map(x=>x.id)), new Set(['anne_lindboe', ...stage.profiles.map(p=>p.id)]));
  assert.equal(runtime.people.length,5,'Five published, distinct historical People must reach Place-open');
  assert.ok(stage.profiles.every(p=>runtime.people.some(x=>x.id===p.id && x.image?.includes('_illustration.webp'))));
});

test('Every sentence and factual place link has a documented direct claim',()=>{
  assert.equal(audit.publicationDecision,'publish_four_as_labeled_original_ai_illustrations_no_photographic_identity_claim');
  const byId=new Map(audit.profiles.map(p=>[p.person_id,p]));
  for(const person of stage.profiles){
    const mapped=byId.get(person.id);
    assert.ok(mapped,'missing claims for '+person.id);
    const claims=new Map(mapped.claims.map(c=>[c.id,c]));
    assert.ok(claims.size>=4,'insufficient focused source claims: '+person.id);
    for(const c of claims.values()){
      assert.equal(c.status,'verified');
      assert.ok(c.source_url.startsWith('https://'));
      assert.ok(c.source_location.length>=7);
      assert.ok(['institutional','recognized_reference','editorial'].includes(c.source_type));
      assert.equal(c.verified_at,'2026-11-03');
    }
    for(const key of ['name','placeId','year','places[toyenbadet]']) {
      assert.ok(mapped.field_claim_map[key]?.length,'missing field source map '+person.id+' '+key);
      assert.ok(mapped.field_claim_map[key].every(id=>claims.has(id)),'unknown field claim');
    }
    for(const [kind,words] of [['desc',person.desc],['popupDesc',person.popupDesc]]){
      const sentences=words.split(/(?<=[.!?])\s+(?=[A-ZÆØÅ])/).filter(Boolean);
      const maps=mapped.sentence_claim_map[kind];
      assert.equal(maps.length,sentences.length,'sentence mapping count mismatch '+person.id+' '+kind);
      for(const s of maps){
        assert.ok(s.claim_ids?.length);
        assert.ok(s.claim_ids.every(id=>claims.has(id)));
      }
    }
    assert.equal(mapped.imageReview.can_publish,true);
    assert.equal(mapped.imageReview.nonDocumentary,true);
    assert.equal(mapped.imageReview.status,'approved_original_ai_illustration');
  }
});
test('Henrik Christiansen image source homonym may not become an identity match',()=>{
  const henrik=stage.profiles.find(p=>p.id==='henrik_christiansen_svommer');
  assert.ok(henrik);
  assert.equal(henrik.portrait_gate.false_match,'https://commons.wikimedia.org/wiki/Category:Henrik_Christiansen');
  assert.match(henrik.portrait_gate.reason,/skøyteløper/);
  assert.match(audit.profiles.find(p=>p.person_id===henrik.id).identity.canonical_identity,/1996/);
  assert.match(audit.profiles.find(p=>p.person_id===henrik.id).identity.not[0],/1983/);
});

test('Authentic-photo research stays blocked; clearly marked AI artwork is authorized instead',()=>{
  for (const p of stage.profiles) {
    const gate=p.portrait_gate;
    assert.equal(gate.status,'blocked_rights_identification');
    assert.equal(gate.assetPublicationDecision,'publish_original_ai_illustration_only');
    assert.ok(gate.photoSourcesReviewed?.length>0,'Missing explicit photo review for '+p.id);
    assert.ok(gate.photoSourcesReviewed.every(x=>x.url.startsWith('https://') && x.decision==='reject_as_canonical_portrait' && x.reason.length>15));
    assert.equal(p.status,'published_with_ai_illustration');
    assert.equal(p.image,p.cardImage);
    assert.match(p.image,/_illustration\.webp$/);
    assert.ok(fs.existsSync(p.image));
  }
  const henrik=stage.profiles.find(p=>p.id==='henrik_christiansen_svommer');
  assert.ok(henrik.portrait_gate.photoSourcesReviewed.some(x=>x.url.includes('Category:Henrik_Christiansen')&&x.reason.includes('1983')));
  const hedda=stage.profiles.find(p=>p.id==='hedda_oritsland');
  assert.ok(hedda.portrait_gate.photoSourcesReviewed.some(x=>x.reason.includes('NTB')));
  const halvard=stage.profiles.find(p=>p.id==='halvard_heskestad_waage');
  assert.ok(halvard.portrait_gate.photoSourcesReviewed.some(x=>x.url.includes('kommunikasjon.ntb.no')));
  const gert=stage.profiles.find(p=>p.id==='gert_walter_thuesen');
  assert.ok(gert.portrait_gate.photoSourcesReviewed.some(x=>x.url.includes('OB.RD0091a')&&x.reason.includes('ikke et identifisert portrett')));
});
