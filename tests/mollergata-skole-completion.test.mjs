import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const exists=file=>fs.existsSync(path.join(root,file));
const id="mollergata_skole";
const placeFile=`data/places/historie/oslo/places_historie/${id}.json`;
const place=read(placeFile);
const packet=read(`data/places/production/${id}.json`);
const history=read(`data/places/historie-production/${id}.json`);
const quiz=read(`data/quiz/historie/${id}_sets.json`);
const stories=read(`data/stories/stories_${id}.json`);
const language=read(`data/leksikon/sprak/places/europe/norway/oslo/${id}.json`);
const leksikon=read(`data/leksikon/places/oslo/historie/leksikon_${id}.json`);
const brands=read("data/brands/brands_master.json");
const brandsByPlace=read("data/brands/brands_by_place.json");
const actorsByPlace=read("data/brands/actors_by_place.json");
const people=read("data/people/politikk/oslo/people_politikk_oslo.json");
const workcard=read("reports/place-production/mollergata-skole-workcard-current.json");
const quality=read(`reports/place-production/${id}-phase1-24-gate-audit-v1.json`);

test("Møllergata skole har presis identitet og own-place-grense",()=>{
  assert.equal(place.id,id);
  assert.equal(place.category,"historie");
  assert.equal(place.address.number,"49");
  assert.match(place.popupDesc,/Oslo Skolemuseum er et institusjonslag/i);
  assert.match(place.popupDesc,/Møllergata 19 lenger sør er et eget sted/i);
  assert.doesNotMatch(place.desc,/Norges første moderne folkeskole/i);
  assert.ok(packet.identity.excludes.some(value=>/Møllergata 19/i.test(value)));
  const result=validatePacket({packet,place,packetFile:`data/places/production/${id}.json`,now:new Date("2026-09-08T20:00:00Z")});
  assert.deepEqual(result.issues,[]);
});

test("standardprofilen har nøyaktig fire bildeklare samlinger",()=>{
  assert.equal(place.production_profile,"standard");
  assert.deepEqual(place.place_card_profile.collection_ids,["people","objects","brands","historical_events"]);
  assert.deepEqual(place.rounds,["people","objects","brands","historical_events"]);
  assert.equal(Object.hasOwn(place,"cardImage"),false);
  assert.deepEqual(place.related_people_ids,["jacob_wilhelm_nordan"]);
  assert.equal(place.objects.length,2);
  assert.ok(place.objects.every(item=>item.physicalObject&&item.placeSpecific&&item.collectable));
  assert.equal(place.historical_events.length,3);
  assert.deepEqual(brandsByPlace[id],["oslo_skolemuseum","selskabet_for_oslo_byes_vel"]);
  assert.equal(Object.hasOwn(actorsByPlace,id),false);
  assert.ok(brandsByPlace[id].every(brandId=>exists(brands.find(item=>item.id===brandId).cardImage)));
});

test("Nordan-relasjonen, medier og dedikert quizkort er komplette",async()=>{
  const nordan=people.find(item=>item.id==="jacob_wilhelm_nordan");
  assert.ok(nordan.places.includes(id));
  assert.ok(exists(nordan.cardImage));
  const files=[place.image,place.imageCard,place.frontImage,place.quizCardImage,...place.objects.map(item=>item.image),...place.historical_events.map(item=>item.image),...brandsByPlace[id].map(brandId=>brands.find(item=>item.id===brandId).cardImage)];
  for(const file of files) assert.equal(exists(file),true,file);
  const sharpModule=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,"sharp/dist/index.mjs"):"sharp";
  const {default:sharp}=await import(sharpModule);
  const front=await sharp(path.join(root,place.frontImage)).metadata();
  const quizCard=await sharp(path.join(root,place.quizCardImage)).metadata();
  assert.ok(front.height>front.width,"frontImage must be physically portrait");
  assert.ok(quizCard.height>quizCard.width,"quizCardImage must be physically portrait");
  assert.notEqual(place.frontImage,place.image);
  assert.notEqual(place.quizCardImage,place.frontImage);
});

test("Fagverk, kronologi, Story, språk og Lesespor er stedseide",()=>{
  assert.equal(place.fagverk.schema,"history_go_place_fagverk_v2");
  assert.equal(place.fagverk.level,"standard");
  assert.equal(place.fagverk.status,"curated");
  assert.equal(place.fagverk.article.length,10);
  assert.equal(place.fagverk.lenses.length,4);
  assert.equal(place.fagverk.guiding_questions.length,5);
  assert.equal(leksikon[0].chronology.length,12);
  assert.equal(stories.length,1);
  assert.equal(stories[0].quality_profile,"episode_v1");
  assert.equal(stories[0].score.total,Object.entries(stories[0].score).filter(([key])=>key!=="total").reduce((sum,[,value])=>sum+value,0));
  assert.equal(language.entries.length,6);
  assert.match(language.entries.find(item=>item.term==="Mølla").meaning,/videregående/i);
  const reading=read("data/lesespor/oslo/lesespor_oslo_historie.json");
  assert.equal(reading.items.filter(item=>item.place_ids?.includes(id)).length,4);
  assert.equal(place.module_audit.for_na.status,"source_bounded_holdback");
});

test("Historie-quizen er normal 4x7 med fjorten direkte åpningsspørsmål",()=>{
  const questions=quiz.sets.flatMap(set=>set.questions);
  assert.equal(quiz.categoryId,"historie");
  assert.equal(quiz.size_class,"normal_4x7");
  assert.equal(quiz.sets.length,4);
  assert.ok(quiz.sets.every(set=>set.questions.length===7));
  assert.equal(questions.length,28);
  assert.equal(new Set(questions.map(question=>question.id)).size,28);
  assert.ok(questions.slice(0,14).every(question=>question.question_type==="fact"&&!question.method_id&&!question.topic_hook_id));
  assert.ok(questions.slice(21).some(question=>question.method_id==="met_kildekritikk"));
  assert.ok(questions.slice(21).some(question=>question.method_id==="met_institusjonshistorisk_analyse"));
  assert.equal(quiz.production_context.theory_start_phase,"final");
  assert.equal(quiz.production_context.method_start_phase,"final");
});

test("Historierapport, regelpreflight og kvalitetsscore er klare",()=>{
  assert.equal(history.status,"ready");
  assert.ok(Object.values(history.gates).every(gate=>gate.status==="PASS"));
  assert.equal(workcard.rule_preflight.status,"PASS");
  assert.deepEqual(workcard.rule_preflight.contract_snapshot.candidate_collections,["people","objects","brands","historical_events"]);
  assert.equal(quality.quality_score.total,28);
  assert.equal(quality.status,"PASS");
  assert.equal(quality.manual_image_review.status,"PASS");
  assert.equal(quality.quality_score.unresolved_blockers,0);
});
