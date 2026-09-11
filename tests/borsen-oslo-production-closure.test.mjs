import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const place=read("data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/borsen_oslo.json");
const quiz=read("data/quiz/naeringsliv/borsen_oslo_sets.json");
const econ=read("data/places/naeringsliv-production/borsen_oslo.json");
const packet=read("data/places/production/borsen_oslo.json");
test("Oslo Børs full place closure",()=>{
  assert.equal(place.production_status,"complete");
  assert.deepEqual(place.place_card_profile.collection_ids,["people","objects","brands","historical_events"]);
  assert.equal(place.frontImageMeta.orientation,"portrait");
  assert.ok((place.chronology||[]).length>=10);
  assert.equal((quiz.sets||[]).length,4);
  assert.equal(quiz.sets.flatMap(s=>s.questions||[]).length,28);
  assert.equal(quiz.sets.slice(0,2).flatMap(s=>s.questions||[]).length,14);
  assert.equal((place.fagverk?.lenses||[]).length,4);
  assert.ok((place.fagverk?.guiding_questions||[]).length>=4);
  assert.ok((place.fagverk?.concepts||[]).length>=6);
  assert.equal(econ.status,"ready");
  assert.deepEqual(Object.values(econ.gates).map(g=>g.status),Array(8).fill("PASS"));
});
test("Oslo Børs identity and image boundaries",()=>{
  assert.match(place.popupDesc,/1819/);
  assert.match(place.popupDesc,/1826–1828/);
  assert.match(place.popupDesc,/2019/);
  assert.ok(fs.existsSync("bilder/kort/people/thor_olsen.webp"));
  assert.ok(fs.existsSync("bilder/kort/objects/borsen_oslo_merkur.webp"));
  assert.ok(fs.existsSync("bilder/kort/brands/oslo_bors_marketplace.webp"));
  assert.ok(fs.existsSync("bilder/QuizCards/Oslo Børs.webp"));
});
test("Oslo Børs place-description packet is valid v4.2",()=>{
  const result=validatePacket({packet,place,packetFile:"data/places/production/borsen_oslo.json",now:new Date("2026-09-11T12:00:00Z")});
  assert.deepEqual(result.issues,[]);
});
