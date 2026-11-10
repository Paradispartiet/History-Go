import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const read=(path)=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const raw=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const place=read("data/places/historie/oslo/places_historie/toyen_hovedgard.json");
const runtime=read("data/runtime/place-open/toyen_hovedgard.json");
const quiz=read("data/quiz/historie/toyen_hovedgard_sets.json");
const card=read("data/quizcards/historie/toyen_hovedgard_quizcard_v1.json");
const sourceEvents=[
  "toyen_hovedgard_saedegardsrett_1670",
  "toyen_hovedgard_universitet_1812"
];
test("Tøyen hovedgård: source-reviewed adaptive PlaceCard profile",()=>{
 assert.equal(place.id,"toyen_hovedgard");
 assert.equal(place.category,"historie");
 assert.equal(place.production_profile,"standard");
 assert.equal(place.place_card_profile.schema,"history_go_place_card_profile_v2");
 assert.deepEqual(place.place_card_profile.collection_ids,["people","historical_events"]);
 assert.equal(place.place_card_profile.category_collection_label,"Historiske hendelser");
 assert.deepEqual(place.related_people_ids,["jens_bjelke","henrik_bjelke"]);
 assert.deepEqual(runtime.place.place_card_profile,place.place_card_profile);
 assert.deepEqual(runtime.place.historical_events,place.historical_events);
 assert.deepEqual(runtime.place.related_people_ids,place.related_people_ids);
 assert.ok(runtime.people.some(x=>x.id==="jens_bjelke"&&/ikke et portrett/i.test(x.imageCaption||"")));
 assert.ok(runtime.people.some(x=>x.id==="henrik_bjelke"));
 assert.deepEqual(Object.keys(place.collection_audit.candidates).sort(),["brands","historical_events","objects","people"].sort());
 assert.equal(place.collection_audit.candidates.people.status,"PASS");
 assert.equal(place.collection_audit.candidates.historical_events.status,"PASS");
 assert.equal(place.collection_audit.candidates.objects.status,"BEGRUNNET N/A");
 assert.equal(place.collection_audit.candidates.brands.status,"BEGRUNNET N/A");
});
test("Tøyen hovedgård: distinct historical event IDs, truthful art and source boundaries",()=>{
 assert.deepEqual(place.historical_events.map(x=>x.id),sourceEvents);
 assert.deepEqual(place.historical_events.map(x=>x.year),[1670,1812]);
 const visuals=new Set();
 for(const event of place.historical_events){
  assert.equal(event.type,"historical_event");
  assert.equal(event.placeSpecific,true);
  assert.equal(event.physicalEventAtPlace,false);
  assert.ok(event.locationBoundary.length>40);
  assert.ok(event.source_urls.length>=2);
  assert.ok(event.image.startsWith("bilder/illustrasjoner/historical_events/"));
  assert.ok(existsSync(new URL("../"+event.image,import.meta.url)));
  assert.equal(event.imageMeta.rightsBasis,"original_vector_art_no_third_party_photo");
  assert.match(event.imageMeta.disclosure,/illustrasjon/i);
  const svg=raw(event.image);
  assert.match(svg,/width="1024" height="1024"/);
  assert.match(svg,/REDAKSJONELL ILLUSTRASJON/);
  assert.match(svg,/IKKE ET HISTORISK FOTOGRAFI/);
  assert.match(svg,/#603e1e/i);
  assert.match(svg,/#d6a127/i);
  visuals.add(svg);
 }
 assert.equal(visuals.size,2);
});
test("Tøyen hovedgård: previously merged core remains intact",()=>{
 assert.equal(quiz.sets.reduce((n,s)=>n+s.questions.length,0),21);
 assert.equal(card.cards[0].questions.length,10);
 assert.equal(place.fagverk.status,"curated");
 assert.equal(place.fagverk.article.length,3);
 assert.equal(runtime.stories.length,1);
 assert.equal(runtime.leksikon.length,2);
 assert.equal(runtime.lesespor.length,4);
 assert.equal(runtime.language.entries.length,5);
 assert.equal(runtime.place.frontImage,"bilder/illustrasjoner/places/toyen_hovedgard_front_editorial.svg");
 assert.equal(runtime.place.imageLicense,"CC BY-SA 3.0");
});
