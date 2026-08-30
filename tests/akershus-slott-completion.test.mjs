import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const placeFile="data/places/historie/oslo/places_historie/akershus_slott.json";
const place=read(placeFile);
const production=read("data/places/production/akershus_slott.json");
const history=read("data/places/historie-production/akershus_slott.json");
const quiz=read("data/quiz/historie/akershus_slott_sets.json");
const brief=read("data/quiz/production_briefs/historie/akershus_slott.json");
const audit=read("reports/place-production/akershus-slott-phase1-24-gate-audit-v1.json");
const stories=read("data/stories/stories_akershus_slott.json");
const brands=read("data/brands/brands_master.json");
const brandsByPlace=read("data/brands/brands_by_place.json");

test("Akershus slott has distinct building geometry and four ordinary collections",()=>{
  assert.equal(place.lat,59.906655);
  assert.equal(place.lon,10.7363502);
  assert.equal(place.r,70);
  assert.equal(place.coordStatus,"verified_geometry");
  assert.equal(place.coordSourceId,"osm-relation:13931023");
  assert.equal(place.production_profile,"rich");
  assert.deepEqual(place.place_card_profile.collection_ids,["people","objects","brands","productions"]);
  assert.deepEqual(audit.collections.required,["people","objects","brands","productions"]);
  assert.equal(place.objects.length,2);
  assert.equal(place.productions.length,3);
  assert.deepEqual(brandsByPlace.akershus_slott,["akershus_slotts_venner"]);
});

test("all place and collection previews are local and rights-labelled",async()=>{
  const brand=brands.find(item=>item.id==="akershus_slotts_venner");
  assert.ok(brand);
  const people=[...read("data/people/historie/oslo/people_historie_oslo.json"),...read("data/people/by/oslo/people_by_oslo.json")].filter(item=>place.related_people_ids.includes(item.id));
  assert.equal(people.length,3);
  const files=[place.image,place.cardImage,place.frontImage,place.for_na.beforeImage,brand.image,...people.map(item=>item.image),...place.objects.map(item=>item.image),...place.productions.map(item=>item.image)];
  for(const file of files)assert.equal(fs.existsSync(path.join(root,file)),true,file);
  const sharpPath=path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,"sharp/dist/index.mjs");
  const {default:sharp}=await import(sharpPath);
  const front=await sharp(path.join(root,place.frontImage)).metadata();
  assert.ok(front.height>front.width);
  assert.equal(place.imageMeta.license,"CC BY-SA 3.0");
  assert.match(place.for_na.comparisonNote,/ulike standpunkter/i);
  assert.ok(place.objects.every(item=>item.imageMeta.sourcePage.startsWith("https://commons.wikimedia.org/")));
  assert.equal(brand.imageMeta.source,"official_website");
  assert.equal(brand.imageMeta.rightsBasis,"referential_trademark_identification");
});

test("identity packets keep castle, fortress and legacy typo distinct",()=>{
  const result=validatePacket({packet:production,place,packetFile:"data/places/production/akershus_slott.json",now:new Date("2026-08-30T12:00:00Z")});
  assert.deepEqual(result.issues,[]);
  assert.match(place.popupDesc,/ikke hele Akershus festning/i);
  assert.ok(production.identity.excludes.some(value=>value.includes("legacy misspelling")));
  assert.equal(history.status,"ready");
  assert.ok(Object.values(history.gates).every(gate=>gate.status==="PASS"));
  assert.equal(fs.existsSync(path.join(root,"data/quiz/historie/akerhus_slott_sets.json")),true);
  assert.equal(brief.existing_quiz_audit.knowledge_migration.status,"not_applicable");
});

test("three directly connected people preserve their primary anchors",()=>{
  const historyPeople=read("data/people/historie/oslo/people_historie_oslo.json");
  const cityPeople=read("data/people/by/oslo/people_by_oslo.json");
  const haakon=historyPeople.find(item=>item.id==="haakon_v_magnusson");
  const christian=historyPeople.find(item=>item.id==="christian_iv");
  const arneberg=cityPeople.find(item=>item.id==="arnstein_arneberg");
  assert.equal(haakon.placeId,"akershus_festning");
  assert.equal(christian.placeId,"christiania_torv");
  assert.equal(arneberg.placeId,"oslo_radhus");
  assert.ok([haakon,christian,arneberg].every(item=>item.places.includes("akershus_slott")));
  assert.ok([haakon,christian,arneberg].every(item=>item.source_urls.includes("https://snl.no/Akershus_slott_og_festning")));
});

test("rich History quiz is 7x7, unique and fact-first",()=>{
  const questions=quiz.sets.flatMap(set=>set.questions);
  assert.equal(quiz.size_class,"rich_7x7");
  assert.equal(quiz.sets.length,7);
  assert.ok(quiz.sets.every(set=>set.questions.length===7));
  assert.equal(questions.length,49);
  assert.equal(new Set(questions.map(question=>question.id)).size,49);
  assert.ok(questions.slice(0,14).every(question=>question.question_type==="fact"||question.question_type==="context"));
  assert.ok(questions.slice(0,14).every(question=>!question.method_id));
  assert.ok(questions.every(question=>question.knowledge_link_status==="linked"));
  assert.equal(brief.profile_decision.set_count,7);
});

test("restoration Story and six-dimension gate close without blockers",()=>{
  assert.equal(stories.length,1);
  assert.equal(stories[0].quality_profile,"episode_v1");
  assert.ok(stories[0].score.total>=15);
  const dimensions=Object.values(audit.quality_score).filter(value=>value&&typeof value==="object"&&"score" in value);
  assert.equal(dimensions.length,6);
  assert.ok(dimensions.every(item=>item.score>=4));
  assert.equal(audit.manual_image_review.status,"PASS");
  assert.equal(audit.quality_score.total,30);
  assert.equal(audit.quality_score.critical_findings,0);
  assert.equal(audit.quality_score.unresolved_blockers,0);
});
