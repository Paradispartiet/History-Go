import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const raw=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const place=read("data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/tveten_gard.json");
const runtime=read("data/runtime/place-open/tveten_gard.json");

test("Tveten: two source-backed adaptive collections, not decorative filler",()=>{
 assert.equal(place.id,"tveten_gard");
 assert.equal(place.production_profile,"standard");
 assert.deepEqual(place.place_card_profile.collection_ids,["people","historical_events"]);
 assert.equal(place.place_card_profile.category_collection_label,"Historiske hendelser");
 assert.equal(runtime.place.place_card_profile.schema,"history_go_place_card_profile_v2");
 assert.deepEqual(runtime.place.historical_events,place.historical_events);
 assert.deepEqual(runtime.place.collection_audit,place.collection_audit);
 assert.deepEqual(place.related_people_ids,["even_bernhard_stenersen","mogens_lauritsson","hannibal_sehested"]);
 assert.equal(runtime.people.length,3);
 assert.deepEqual(Object.keys(place.collection_audit.candidates).sort(),["brands","historical_events","objects","people"].sort());
 assert.equal(place.collection_audit.candidates.people.status,"PASS");
 assert.equal(place.collection_audit.candidates.historical_events.status,"PASS");
 assert.equal(place.collection_audit.candidates.objects.status,"BEGRUNNET N/A");
 assert.equal(place.collection_audit.candidates.brands.status,"BEGRUNNET N/A");
 assert.match(place.collection_audit.candidates.people.reason,/usikker|kilde/i);
});

test("Tveten: event images and event-to-place historical boundaries",()=>{
 assert.deepEqual(place.historical_events.map(e=>e.id),["tveten_gard_klostergods_1408","tveten_gard_jordveien_1950"]);
 assert.deepEqual(place.historical_events.map(e=>e.year),[1408,1950]);
 const art=new Set();
 for(const e of place.historical_events){
  assert.equal(e.type,"historical_event");
  assert.equal(e.placeSpecific,true);
  assert.equal(e.physicalEventAtPlace,false);
  assert.ok(e.locationBoundary.length>80);
  assert.ok(e.source_urls.length>=2);
  assert.ok(e.image.startsWith("bilder/illustrasjoner/historical_events/"));
  assert.ok(existsSync(new URL("../"+e.image,import.meta.url)));
  assert.equal(e.imageMeta.rightsBasis,"original_vector_art_no_third_party_photo");
  assert.match(e.imageMeta.disclosure,/illustrasjon/i);
  const s=raw(e.image);
  assert.match(s,/width="1024" height="1024"/);
  assert.match(s,/REDAKSJONELL ILLUSTRASJON/);
  assert.match(s,/IKKE ET HISTORISK FOTOGRAFI/);
  assert.match(s,/#603e1e/i);
  assert.match(s,/#d6a127/i);
  art.add(s);
 }
 assert.equal(art.size,2);
});

test("Tveten: old quiz and new narrative modules remain intact",()=>{
 const quiz=read("data/quiz/historie/tveten_gard_sets.json");
 const qc=read("data/quizcards/historie/tveten_gard_quizcard_v1.json");
 assert.equal(quiz.sets.reduce((n,s)=>n+s.questions.length,0),21);
 assert.equal(qc.cards[0].questions.length,10);
 assert.equal(place.fagverk.status,"curated");
 assert.equal(runtime.stories.length,1);
 assert.equal(runtime.leksikon.length,2);
 assert.equal(runtime.lesespor.length,4);
 assert.equal(runtime.language.entries.length,5);
 assert.equal(runtime.place.frontImage,"bilder/illustrasjoner/places/tveten_gard_front_editorial.svg");
 assert.equal(runtime.place.imageLicense,"CC BY-SA 3.0");
});
