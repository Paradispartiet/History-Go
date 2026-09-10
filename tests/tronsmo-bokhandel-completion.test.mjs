import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const exists=p=>fs.existsSync(p);

test('Tronsmo Bokhandel full production contract',()=>{
  const p=j('data/places/litteratur/oslo/places_litteratur/tronsmo_bokhandel.json');
  assert.equal(p.production_status,'complete');
  assert.equal(p.production_profile,'standard');
  assert.equal(p.cardImage,undefined);
  assert.equal(p.lat,59.916504851005804);
  assert.equal(p.lon,10.738621210337177);
  assert.deepEqual(p.address,{street:'Universitetsgata',number:'12',postcode:'0164',city:'Oslo',country:'NO'});
  assert.deepEqual(p.place_card_profile.collection_ids,['people','objects','brands','productions']);
  assert.deepEqual(p.related_people_ids,['per_petterson']);
  assert.equal(p.objects.length,1);
  assert.equal(p.productions.length,1);
  assert.equal(p.fagverk.schema,'history_go_place_fagverk_v2');
  const lensEmneIds=new Set(p.fagverk.lenses.map(lens=>lens.emne_id));
  assert.ok(p.fagverk.emne_ids.every(emneId=>lensEmneIds.has(emneId)),'every canonical fagverk emne must be covered by a lens');
  assert.ok(p.fagverk.guiding_questions.length>=4);
  assert.ok(p.fagverk.observable_traces.length>=3);
  for(const file of [p.image,p.frontImage,p.objects[0].image,p.productions[0].image,'bilder/kort/brands/tronsmo_bokhandel.webp','bilder/QuizCards/Tronsmo_Bokhandel.webp']) assert.ok(exists(file),file);

  const q=j('data/quiz/litteratur/tronsmo_bokhandel.json');
  assert.equal(q.sets.length,4);
  assert.deepEqual(q.sets.map(s=>s.questions.length),[7,7,7,7]);
  const questions=q.sets.flatMap(s=>s.questions);
  assert.equal(questions.length,28);
  assert.ok(questions.every(item=>item.options[item.answerIndex]===item.answer));
  assert.deepEqual([0,1,2].map(position=>questions.filter(item=>item.answerIndex===position).length),[10,9,9]);
  assert.ok(!exists('data/quiz/litteratur/tronsmo_bokhandel_sets.json'));
  assert.ok(!exists('data/quiz/litteratur/tronsmo_bokhandel_sets_merged.json'));
  const qm=j('data/quiz/manifest.json');
  assert.deepEqual(qm.sets.filter(x=>x.targetId==='tronsmo_bokhandel'),[{targetId:'tronsmo_bokhandel',file:'data/quiz/litteratur/tronsmo_bokhandel.json'}]);

  const rel=j('data/relations.json').filter(x=>x.place==='tronsmo_bokhandel');
  assert.deepEqual(rel.map(x=>x.person),['per_petterson']);
  assert.match(rel[0].source,/snl\.no\/Per_Petterson/);
  const people=j('data/people/litteratur/oslo/people_litteratur_oslo.json');
  for(const person of people){
    const refs=[person.placeId,person.place_id,...(person.places||[]),...(person.placeIds||[]),...(person.place_ids||[])];
    if(person.id!=='per_petterson' && refs.includes('tronsmo_bokhandel')) assert.ok(person.roundHoldbacks?.includes('tronsmo_bokhandel'),person.id);
  }

  const lang=j('data/leksikon/sprak/places/europe/norway/oslo/tronsmo_bokhandel.json');
  assert.equal(lang.entries.length,6);
  const langManifest=j('data/leksikon/sprak/manifest.json');
  assert.equal(langManifest.place_files.tronsmo_bokhandel,'data/leksikon/sprak/places/europe/norway/oslo/tronsmo_bokhandel.json');
  const leks=j('data/leksikon/places/oslo/litteratur/leksikon_tronsmo_bokhandel.json');
  assert.equal(leks[0].chronology.length,4);
  const lm=j('data/leksikon/manifest.json');
  assert.ok(lm.files.includes('data/leksikon/places/oslo/litteratur/leksikon_tronsmo_bokhandel.json'));
  const lesDoc=j('data/lesespor/oslo/lesespor_oslo_litteratur.json');
  const lesItems=Array.isArray(lesDoc)?lesDoc:lesDoc.items;
  assert.equal(lesItems.filter(x=>x.place_ids?.includes('tronsmo_bokhandel')).length,4);
  const report=j('reports/place-production/tronsmo-bokhandel-completion-v1.json');
  assert.equal(report.quality_score.total,30);
});

test('Tronsmo runtime resolves the visible People collection through roundHoldbacks',()=>{
  const r=j('data/runtime/place-open/tronsmo_bokhandel.json');
  const visiblePeople=r.people.filter(person=>!(person.roundHoldbacks||[]).includes('tronsmo_bokhandel'));
  assert.deepEqual(visiblePeople.map(person=>person.id),['per_petterson']);
  for(const person of r.people.filter(person=>person.id!=='per_petterson')) {
    assert.ok(person.roundHoldbacks?.includes('tronsmo_bokhandel'),person.id);
  }
  assert.ok(r.brands.some(x=>x.id==='tronsmo_bokhandel'));
  assert.ok(r.language);
  assert.ok(r.leksikon.length>=1);
  assert.equal(r.lesespor.length,4);
});
