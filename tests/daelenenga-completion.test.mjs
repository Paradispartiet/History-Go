import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root=process.cwd();const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const place=read("data/places/sport/europa/norway/oslo_sport/daelenenga_idrettspark.json");
const production=read("data/places/production/daelenenga_idrettspark.json");
const runtime=read("data/runtime/place-open/daelenenga_idrettspark.json");
const quiz=read("data/quiz/sport/daelenenga_idrettspark_sets.json");
const audit=read("reports/place-production/daelenenga-phase8-24-gate-audit-v1.json");

test("Dælenenga is image-ready and keeps exact composite geometry",()=>{
  assert.equal(place.coordSourceId,"osm-composite:way/4708872+way/101769218");
  assert.equal(place.anchors.length,2);
  for(const asset of [place.image,place.cardImage,place.objects[0].image]) assert.equal(fs.existsSync(path.join(root,asset)),true,asset);
  assert.deepEqual(place.place_card_profile.collection_ids,["objects","brands","related"]);
  assert.deepEqual(place.objects.map(x=>x.id),["daelenenga_grunerhallen"]);
});

test("old quiz branch is explicitly reused, not replaced",()=>{
  const questions=quiz.sets.flatMap(set=>set.questions);
  assert.equal(quiz.reuse_audit.source_commit,"d09f44a04fce7852f3a0bbcfb3c011238138cc4a");
  assert.equal(quiz.reuse_audit.main_reuse_commit,"28a8bf3e3");
  assert.equal(questions.length,10);
  assert.ok(questions.every(q=>q.claim_id&&q.claim_basis&&q.source.length&&q.knowledge_link_status==="linked"));
});

test("description and hydrated phase surfaces are production-ready",()=>{
  const result=validatePacket({packet:production,place,packetFile:"data/places/production/daelenenga_idrettspark.json",now:new Date("2026-08-26T12:00:00Z")});
  assert.deepEqual(result.issues,[]);
  assert.deepEqual(runtime.brands.map(x=>x.id),["gruner_il"]);
  assert.deepEqual(runtime.place.objects.map(x=>x.id),["daelenenga_grunerhallen"]);
  assert.equal(runtime.leksikon.length,1);
  assert.equal(runtime.language.entries.length,3);
  assert.equal(runtime.lesespor.length,3);
  assert.equal(runtime.stories[0].quality_profile,"episode_v1");
});

test("six-part gate is high quality with no blocker",()=>{
  const dimensions=Object.values(audit.quality_score).filter(x=>x&&typeof x==="object"&&"score" in x);
  assert.equal(dimensions.length,6);assert.ok(dimensions.every(x=>x.score>=4));assert.ok(audit.quality_score.total>=27);
  assert.equal(audit.quality_score.unresolved_blockers,0);
});
