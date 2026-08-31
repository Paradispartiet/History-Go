import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const exists=file=>fs.existsSync(path.join(root,file));
const placeFile="data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/myntgatakvartalet.json";
const place=read(placeFile);
const packet=read("data/places/production/myntgatakvartalet.json");
const history=read("data/places/historie-production/myntgatakvartalet.json");
const quiz=read("data/quiz/historie/myntgatakvartalet_sets.json");
const stories=read("data/stories/stories_myntgatakvartalet.json");
const language=read("data/leksikon/sprak/places/europe/norway/oslo/myntgatakvartalet.json");
const leksikon=read("data/leksikon/places/oslo/historie/leksikon_myntgatakvartalet.json");
const brands=read("data/brands/brands_master.json");
const brandsByPlace=read("data/brands/brands_by_place.json");
const workcard=read("reports/place-production/myntgatakvartalet-workcard-current.json");

test("Myntgatakvartalet beholder kvartalet og det forsvunne myntverket som ulike historiske lag",()=>{
  assert.equal(place.id,"myntgatakvartalet");
  assert.equal(place.category,"historie");
  assert.equal(place.year,1628);
  assert.match(place.popupDesc,/bygningene som står her i dag er langt yngre/i);
  assert.ok(packet.identity.excludes.some(value=>/eksakt punkt.*myntverksted/i.test(value)));
  const result=validatePacket({packet,place,packetFile:"data/places/production/myntgatakvartalet.json",now:new Date("2026-08-31T20:00:00Z")});
  assert.deepEqual(result.issues,[]);
});

test("standardprofilen har nøyaktig People, Objects, Brands og Historiske hendelser",()=>{
  assert.equal(place.production_profile,"standard");
  assert.deepEqual(place.place_card_profile.collection_ids,["people","objects","brands","historical_events"]);
  assert.equal(place.place_card_profile.category_collection_label,"Historiske hendelser");
  assert.equal(place.place_card_profile.collection_ids.includes("productions"),false);
  assert.equal(place.place_card_profile.collection_ids.includes("related"),false);
  assert.deepEqual(place.related_people_ids,["christian_iv"]);
  assert.equal(place.objects.length,2);
  assert.ok(place.objects.every(item=>item.physicalObject&&item.placeSpecific&&item.collectable));
  assert.equal(place.historical_events.length,3);
  assert.equal(Object.hasOwn(place,"productions"),false);
  assert.deepEqual(brandsByPlace.myntgatakvartalet,["forsvarsbygg"]);
  assert.ok(brands.find(item=>item.id==="forsvarsbygg").place_ids.includes(place.id));
});

test("alle samlingspreviews finnes lokalt og frontbildet er fysisk stående",async()=>{
  const files=[place.image,place.cardImage,place.frontImage,...place.objects.map(item=>item.image),...place.historical_events.map(item=>item.image),"bilder/kort/people/christian_iv.webp","bilder/kort/brands/forsvarsbygg_akershus_wordmark.webp"];
  for(const file of files)assert.equal(exists(file),true,file);
  const {default:sharp}=await import("sharp");
  const meta=await sharp(path.join(root,place.frontImage)).metadata();
  assert.ok(meta.height>meta.width,"frontImage must be physically portrait");
});

test("Fagverk v2, kronologi, Story, språk og Lesespor er stedseide og kildebårne",()=>{
  assert.equal(place.fagverk.schema,"history_go_place_fagverk_v2");
  assert.equal(place.fagverk.level,"standard");
  assert.equal(place.fagverk.status,"curated");
  assert.ok(place.fagverk.chapter_ids.length>=1);
  assert.equal(leksikon.entry.chronology.length,9);
  assert.equal(stories.length,1);
  assert.equal(stories[0].quality_profile,"episode_v1");
  assert.equal(stories[0].place_id,place.id);
  assert.equal(language.entries.length,6);
  const reading=read("data/lesespor/oslo/lesespor_oslo_historie.json");
  assert.equal(reading.items.filter(item=>item.place_ids?.includes(place.id)).length,4);
  assert.equal(place.module_audit.for_na.status,"source_bounded_holdback");
});

test("Historie-quizen er normal 4x7 med ren åpning og sen metode og teori",()=>{
  const questions=quiz.sets.flatMap(set=>set.questions);
  assert.equal(quiz.categoryId,"historie");
  assert.equal(quiz.size_class,"normal_4x7");
  assert.equal(quiz.sets.length,4);
  assert.ok(quiz.sets.every(set=>set.questions.length===7));
  assert.equal(questions.length,28);
  assert.equal(new Set(questions.map(question=>question.id)).size,28);
  assert.ok(questions.slice(0,14).every(question=>["fact","context"].includes(question.question_type)&&!question.method_id&&!question.topic_hook_id));
  assert.ok(questions.slice(21).some(question=>question.method_id==="met_sporlesning"));
  const theory=questions.find(question=>question.topic_hook_id==="his_tidslag_samtidighet");
  assert.ok(theory);
  assert.equal(theory.thinker_id,"fernand_braudel");
  assert.equal(quiz.production_context.theory_start_phase,"final");
  assert.equal(quiz.production_context.method_start_phase,"final");
});

test("produksjonsrapport og regelpreflight er lukket uten Productions-tilbakefall",()=>{
  assert.equal(history.status,"ready");
  assert.ok(Object.values(history.gates).every(gate=>gate.status==="PASS"));
  assert.equal(history.chronologyStories.status,"PASS");
  assert.equal(workcard.status,"complete");
  assert.equal(workcard.rule_preflight.status,"PASS");
  assert.deepEqual(workcard.rule_preflight.contract_snapshot.candidate_collections,["people","objects","brands","historical_events"]);
  assert.equal(workcard.rule_preflight.contract_snapshot.category_expression,"historical_events");
});
