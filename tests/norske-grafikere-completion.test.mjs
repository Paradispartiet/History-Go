import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const place=read("data/places/kunst/oslo/places_kunst/norske_grafikere.json");
const quiz=read("data/quiz/kunst/norske_grafikere_sets.json");
const production=read("data/places/production/norske_grafikere.json");

test("Norske Grafikere keeps the canonical identity and coordinates",()=>{
  assert.equal(place.id,"norske_grafikere");
  assert.equal(place.lat,59.91091311290161);
  assert.equal(place.lon,10.741742892068546);
  assert.match(place.popupDesc,/ikke Norske Grafikeres Verksted/i);
});

test("Norske Grafikere exposes exactly four curated collection families",()=>{
  assert.deepEqual(place.place_card_profile.collection_ids,["people","objects","brands","productions"]);
  assert.deepEqual(production.collections,{people:["johan_nordhagen"],objects:["norske_grafikere_stiftelsesprotokoll_1919"],brands:["norske_grafikeres_fond"],productions:["norske_grafikere_lito_vito_1985_2025","norske_grafikere_mascot","norske_grafikere_spitsbergen_postphoto_1"]});
});

test("the signature object exception and three programme works are explicit",()=>{
  assert.equal(place.objects.length,1);
  assert.equal(place.objects[0].year,1919);
  assert.deepEqual(place.productions.map(item=>item.type),["litografi","karbontrykk på papir","pigmenttrykk på bomull"]);
});

test("People and Brand manifests bind the correct external actors",()=>{
  const people=read("data/people/manifest.json");
  const brands=read("data/brands/brands_by_place.json");
  assert.deepEqual(people.priorityFilesByPlace.norske_grafikere,["people/kunst/oslo/norske_grafikere/johan_nordhagen.json"]);
  assert.deepEqual(brands.norske_grafikere,["norske_grafikeres_fond"]);
});

test("language, Story, reading tracks and Fagverk are complete",()=>{
  assert.equal(read("data/leksikon/sprak/places/europe/norway/oslo/norske_grafikere.json").entries.length,6);
  assert.equal(read("data/stories/stories_norske_grafikere.json").length,1);
  assert.equal(place.reading_track_ids.length,4);
  assert.equal(place.fagverk.schema,"history_go_place_fagverk_v2");
  assert.equal(place.fagverk.article.length,3);
});

test("quiz is normal 4x7 with fourteen direct opening facts",()=>{
  assert.equal(quiz.sets.length,4);
  assert.ok(quiz.sets.every(set=>set.questions.length===7));
  const questions=quiz.sets.flatMap(set=>set.questions);
  assert.ok(questions.slice(0,14).every(question=>question.question_type==="fact"));
  assert.ok(questions.every(question=>question.knowledge_link_status==="linked"));
});

test("final theory question is bound to the Kunst contract",()=>{
  const final=quiz.sets.at(-1).questions.at(-1);
  assert.equal(final.topic_hook_id,"institusjonell_legitimering");
  assert.equal(final.method_id,"met_kunst_institusjonsanalyse");
  assert.equal(final.thinker_id,"boris_groys");
  assert.equal(final.theory_ref.work,"Art Power");
});
