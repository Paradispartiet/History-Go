import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const exists=file=>fs.existsSync(path.join(root,file));
const id="waisenhuset_kongens_gate";
const placeFile="data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/waisenhuset_kongens_gate.json";
const place=read(placeFile);
const packet=read(`data/places/production/${id}.json`);
const history=read(`data/places/historie-production/${id}.json`);
const quiz=read(`data/quiz/historie/${id}_sets.json`);
const stories=read(`data/stories/stories_${id}.json`);
const language=read(`data/leksikon/sprak/places/europe/norway/oslo/${id}.json`);
const leksikon=read(`data/leksikon/places/oslo/historie/leksikon_${id}.json`);
const brands=read("data/brands/brands_master.json");
const brandsByPlace=read("data/brands/brands_by_place.json");
const workcard=read("reports/place-production/waisenhuset-kongens-gate-workcard-current.json");

test("Waisenhuset beholder bygård, institusjon og kildekonflikt som avgrensede lag",()=>{
  assert.equal(place.id,id);
  assert.equal(place.category,"historie");
  assert.equal(place.year,1683);
  assert.match(place.popupDesc,/Oppdag Kvadraturen oppgir 1683, mens Riksantikvaren oppgir 1638/i);
  assert.match(place.popupDesc,/uten at hele dagens bygg gis én sikker datering/i);
  assert.ok(packet.identity.excludes.some(value=>/Ullevål Hageby/i.test(value)));
  assert.equal(packet.source_conflicts.length,2);
  const result=validatePacket({packet,place,packetFile:`data/places/production/${id}.json`,now:new Date("2026-08-31T20:00:00Z")});
  assert.deepEqual(result.issues,[]);
});

test("standardprofilen har nøyaktig People, Objects, Brands og Historiske hendelser",()=>{
  assert.equal(place.production_profile,"standard");
  assert.deepEqual(place.place_card_profile.collection_ids,["people","objects","brands","historical_events"]);
  assert.equal(place.place_card_profile.category_collection_label,"Historiske hendelser");
  assert.equal(place.place_card_profile.collection_ids.includes("productions"),false);
  assert.equal(place.place_card_profile.collection_ids.includes("related"),false);
  assert.deepEqual(place.related_people_ids,["christian_vii","christen_schmidt","christian_schibsted"]);
  assert.equal(place.objects.length,2);
  assert.ok(place.objects.every(item=>item.physicalObject&&item.placeSpecific&&item.collectable));
  assert.notEqual(place.objects[1].id,"christiania_intelligentssedler");
  assert.equal(place.historical_events.length,3);
  assert.equal(Object.hasOwn(place,"productions"),false);
  assert.deepEqual(brandsByPlace[id],["christiania_intelligentssedler"]);
  const brand=brands.find(item=>item.id==="christiania_intelligentssedler");
  assert.ok(brand.place_ids.includes(id));
  assert.match(brand.imageMeta.assetType,/masthead/);
});

test("alle samlingspreviews finnes lokalt og frontbildet er fysisk stående",async()=>{
  const files=[place.image,place.cardImage,place.frontImage,...place.objects.map(item=>item.image),...place.historical_events.map(item=>item.image),"bilder/kort/people/christian_vii.webp","bilder/kort/people/christen_schmidt.webp","bilder/kort/people/christian_schibsted.webp","bilder/kort/brands/christiania_intelligentssedler_1833_wordmark.webp"];
  for(const file of files) assert.equal(exists(file),true,file);
  const sharpModule=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,"sharp/dist/index.mjs"):"sharp";
  const {default:sharp}=await import(sharpModule);
  const meta=await sharp(path.join(root,place.frontImage)).metadata();
  assert.ok(meta.height>meta.width,"frontImage must be physically portrait");
  const historic=await sharp(path.join(root,place.historical_events[2].image)).metadata();
  assert.ok(historic.width>historic.height,"historical event preview must be auto-oriented landscape");
});

test("Fagverk v2, kronologi, Story, språk og Lesespor er stedseide og kildebårne",()=>{
  assert.equal(place.fagverk.schema,"history_go_place_fagverk_v2");
  assert.equal(place.fagverk.level,"standard");
  assert.equal(place.fagverk.status,"curated");
  assert.ok(place.fagverk.chapter_ids.includes("velferd_rett_hverdagsliv"));
  assert.ok(place.fagverk.emne_ids.includes("em_his_barndom_familie_livslop"));
  assert.equal(leksikon.entry.chronology.length,9);
  assert.equal(stories.length,1);
  assert.equal(stories[0].quality_profile,"episode_v1");
  assert.equal(stories[0].place_id,id);
  assert.equal(language.entries.length,6);
  const reading=read("data/lesespor/oslo/lesespor_oslo_historie.json");
  assert.equal(reading.items.filter(item=>item.place_ids?.includes(id)).length,4);
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
