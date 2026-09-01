import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const exists=file=>fs.existsSync(path.join(root,file));
const id="mollergata_19";
const placeFile="data/places/historie/oslo/places_historie/mollergata_19.json";
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
const peopleHistory=read("data/people/historie/oslo/people_historie_oslo.json");
const peoplePolitics=read("data/people/politikk/oslo/people_politikk_oslo.json");
const workcard=read("reports/place-production/mollergata-19-workcard-current.json");
const quality=read(`reports/place-production/${id}-phase1-24-gate-audit-v1.json`);

test("Møllergata 19 avgrenser den stående forbygningen fra det revne fengselet",()=>{
  assert.equal(place.id,id);
  assert.equal(place.category,"historie");
  assert.equal(place.year,1866);
  assert.match(place.popupDesc,/fengselet stengte i 1975 og ble revet i 1976/i);
  assert.match(place.popupDesc,/må ikke gjøre det ordinære rettssystemet og okkupasjonsmaktens politiske fangenskap historisk like/i);
  assert.ok(packet.identity.excludes.some(value=>/komplett stående fengselsanlegg/i.test(value)));
  assert.equal(packet.source_conflicts.length,3);
  const result=validatePacket({packet,place,packetFile:`data/places/production/${id}.json`,now:new Date("2026-09-01T20:00:00Z")});
  assert.deepEqual(result.issues,[]);
});

test("standardprofilen har nøyaktig People, Objects, Brands og Historiske hendelser",()=>{
  assert.equal(place.production_profile,"standard");
  assert.deepEqual(place.place_card_profile.collection_ids,["people","objects","brands","historical_events"]);
  assert.deepEqual(place.rounds,["people","objects","brands","historical_events"]);
  assert.equal(place.place_card_profile.collection_ids.includes("productions"),false);
  assert.equal(place.place_card_profile.collection_ids.includes("related"),false);
  assert.equal(Object.hasOwn(place,"productions"),false);
  assert.deepEqual(place.related_people_ids,["jacob_wilhelm_nordan","petter_moen","viggo_hansteen"]);
  assert.equal(place.objects.length,2);
  assert.ok(place.objects.every(item=>item.physicalObject&&item.placeSpecific&&item.collectable));
  assert.deepEqual(place.objects.map(item=>item.id),[`${id}_blaaskilt`,`${id}_fasadeklokke`]);
  assert.equal(place.historical_events.length,3);
  assert.deepEqual(brandsByPlace[id],["selskabet_for_oslo_byes_vel"]);
  assert.equal(Object.hasOwn(actorsByPlace,id),false);
  const brand=brands.find(item=>item.id==="selskabet_for_oslo_byes_vel");
  assert.ok(brand.place_ids.includes(id));
  assert.match(brand.popupdesc,/blå historieskilt/i);
});

test("People-utvalget er bildeklart og eksplisitte holdbacks hindrer skjev eller brutt preview",()=>{
  const nordan=peoplePolitics.find(item=>item.id==="jacob_wilhelm_nordan");
  const moen=peopleHistory.find(item=>item.id==="petter_moen");
  const hansteen=peopleHistory.find(item=>item.id==="viggo_hansteen");
  for(const person of [nordan,moen,hansteen]) assert.equal(exists(person.cardImage),true,person.id);
  for(const heldId of ["vidkun_quisling","rolf_wickstrom"]) assert.ok(peopleHistory.find(item=>item.id===heldId).roundHoldbacks.includes(id));
});

test("alle samlingspreviews finnes og stående frontbilde er fysisk portrett",async()=>{
  const nordan=peoplePolitics.find(item=>item.id==="jacob_wilhelm_nordan");
  const moen=peopleHistory.find(item=>item.id==="petter_moen");
  const hansteen=peopleHistory.find(item=>item.id==="viggo_hansteen");
  const brand=brands.find(item=>item.id==="selskabet_for_oslo_byes_vel");
  const files=[place.image,place.cardImage,place.frontImage,...place.objects.map(item=>item.image),...place.historical_events.map(item=>item.image),nordan.cardImage,moen.cardImage,hansteen.cardImage,brand.cardImage];
  for(const file of files) assert.equal(exists(file),true,file);
  const sharpModule=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,"sharp/dist/index.mjs"):"sharp";
  const {default:sharp}=await import(sharpModule);
  const front=await sharp(path.join(root,place.frontImage)).metadata();
  assert.ok(front.height>front.width,"frontImage must be physically portrait");
  for(const file of [...place.objects.map(item=>item.image),...place.historical_events.map(item=>item.image)]) {
    const meta=await sharp(path.join(root,file)).metadata();
    assert.ok(meta.width>meta.height,`${file} must be landscape`);
  }
});

test("Fagverk v2, kronologi, Story, språk og Lesespor er stedseide",()=>{
  assert.equal(place.fagverk.schema,"history_go_place_fagverk_v2");
  assert.equal(place.fagverk.level,"standard");
  assert.equal(place.fagverk.status,"curated");
  assert.ok(place.fagverk.chapter_ids.includes("makt_stat_institusjoner"));
  assert.ok(place.fagverk.emne_ids.includes("em_his_okkupasjon_motstand"));
  const main=leksikon.find(item=>item.id===`${id}_hovedartikkel`);
  assert.equal(main.chronology.length,12);
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
  assert.ok(questions.slice(0,14).every(question=>question.question_type==="fact"&&!question.method_id&&!question.topic_hook_id));
  assert.ok(questions.slice(21).some(question=>question.method_id==="met_kildekritikk"));
  const theory=questions.find(question=>question.topic_hook_id==="his_tidslag_samtidighet");
  assert.ok(theory);
  assert.equal(theory.thinker_id,"fernand_braudel");
  assert.equal(quiz.production_context.theory_start_phase,"final");
  assert.equal(quiz.production_context.method_start_phase,"final");
});

test("Historie-rapport, regelpreflight og 29/30-port er lukket uten Productions-tilbakefall",()=>{
  assert.equal(history.status,"ready");
  assert.ok(Object.values(history.gates).every(gate=>gate.status==="PASS"));
  assert.equal(history.chronologyStories.status,"PASS");
  assert.equal(workcard.status,"complete");
  assert.equal(workcard.rule_preflight.status,"PASS");
  assert.deepEqual(workcard.rule_preflight.contract_snapshot.candidate_collections,["people","objects","brands","historical_events"]);
  assert.equal(workcard.rule_preflight.contract_snapshot.category_expression,"historical_events");
  assert.equal(quality.quality_score.total,29);
  const dimensions=Object.entries(quality.quality_score).filter(([,value])=>value&&typeof value==="object"&&"score" in value);
  assert.equal(dimensions.length,6);
  assert.ok(dimensions.every(([,value])=>value.score>=4));
  assert.equal(quality.quality_score.unresolved_blockers,0);
});
