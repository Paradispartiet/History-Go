import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const exists=file=>fs.existsSync(path.join(root,file));
const placeFile="data/places/politikk/oslo/places_politikk/22_juli_senteret.json";
const place=read(placeFile);
const packet=read("data/places/production/22_juli_senteret.json");
const report=read("data/places/politikk-production/22_juli_senteret.json");
const quiz=read("data/quiz/politikk/22_juli_senteret_sets.json");
const brief=read("data/quiz/production_briefs/politikk/22_juli_senteret.json");
const context=read("data/quiz/production_context/politikk/22_juli_senteret.json");
const brands=read("data/brands/brands_master.json");
const byPlace=read("data/brands/brands_by_place.json");
const relations=read("data/relations.json");
const stories=read("data/stories/stories_22_juli_senteret.json");
const leksikon=read("data/leksikon/places/oslo/politikk/leksikon_22_juli_senteret.json");
const language=read("data/leksikon/sprak/places/europe/norway/oslo/22_juli_senteret.json");
const registry=read("data/fagverk/fagverk_registry.json");
const audit=read("reports/place-production/22-juli-senteret-phase1-24-gate-audit-v1.json");

function findPerson(personId){
  for(const manifestFile of read("data/people/manifest.json").files){
    const file=`data/people/${String(manifestFile).replace(/^people\//,"")}`;
    if(!exists(file))continue;
    let data;try{data=read(file);}catch{continue;}
    const stack=Array.isArray(data)?[...data]:[data];
    while(stack.length){
      const value=stack.pop();
      if(!value||typeof value!=="object")continue;
      if(value.id===personId)return value;
      for(const child of Object.values(value))if(child&&typeof child==="object")stack.push(child);
    }
  }
  return null;
}

test("22. juli-senteret har avgrenset institusjonsidentitet og gyldig beskrivelsespakke",()=>{
  assert.equal(place.id,"22_juli_senteret");
  assert.equal(place.category,"politikk");
  assert.equal(place.year,2015);
  assert.equal(place.coordStatus,"verified");
  assert.deepEqual(place.related_place_ids,["regjeringskvartalet","hoyblokka"]);
  assert.match(place.popupDesc,/ikke et synonym for hele Regjeringskvartalet/i);
  assert.match(report.primaryFunction.placeObjectDistinction,/ikke Regjeringskvartalet.*Utøya/i);
  const result=validatePacket({packet,place,packetFile:"data/places/production/22_juli_senteret.json",now:new Date("2026-08-31T20:00:00Z")});
  assert.deepEqual(result.issues,[]);
});

test("major-profilen har nøyaktig People, Objects, Brands og Hendelser og vedtak",()=>{
  assert.equal(place.production_profile,"major");
  assert.deepEqual(place.place_card_profile.collection_ids,["people","objects","brands","productions"]);
  assert.equal(place.place_card_profile.category_collection_label,"Hendelser og vedtak");
  assert.deepEqual(place.related_people_ids,["lena_fahre","alexandra_europa_perez_seoane"]);
  assert.equal(place.objects.length,3);
  assert.ok(place.objects.every(item=>item.physicalObject&&item.placeSpecific&&item.collectable));
  assert.equal(place.productions.length,4);
  assert.equal(Object.hasOwn(place,"structures"),false);
  assert.equal(place.place_card_profile.collection_ids.includes("related"),false);
});

test("synlige bilder har dokumentert proveniens og canonical People/Brand-medier",()=>{
  const visible=[place.image,place.cardImage,place.frontImage,...place.objects.map(item=>item.image),...place.productions.map(item=>item.image)];
  assert.ok(visible.every(value=>/^https:\/\/mnd-assets\.mynewsdesk\.com\/image\/upload\//.test(value)));
  assert.equal(place.frontImageMeta.orientation,"portrait");
  assert.equal(place.frontImageMeta.originalDimensions,"6336x8448");
  assert.equal(place.frontImageMeta.rightsBasis,"official_pressroom_media_use");
  assert.ok(place.objects.every(item=>item.imageMeta?.sourcePage?.startsWith("https://presse.22julisenteret.no/images/")));
  for(const id of place.related_people_ids){const person=findPerson(id);assert.ok(person,id);const image=person.cardImage||person.image;assert.ok(image,id);assert.equal(exists(image),true,`${id}: ${image}`);}
  const brand=brands.find(item=>item.id==="statsbygg");assert.ok(brand);assert.equal(brand.image,"bilder/kort/brands/statsbygg.webp");assert.equal(exists(brand.image),true);assert.deepEqual(byPlace[place.id],["statsbygg"]);
});

test("People- og Statsbygg-koblingene er direkte og gjenbruker canonicale identiteter",()=>{
  for(const id of place.related_people_ids)assert.ok(relations.some(rel=>rel.type==="person_place"&&rel.personId===id&&rel.placeId===place.id),id);
  const brand=brands.find(item=>item.id==="statsbygg");
  assert.ok(brand.place_ids.includes("regjeringskvartalet"));
  assert.ok(brand.place_ids.includes(place.id));
  assert.equal(brand.imageMeta.assetKind,"logo");
  assert.equal(brand.imageMeta.noEndorsement,true);
});

test("Politikk-quizen er major 8x7 med normal åpning og sen metodebruk",()=>{
  const questions=quiz.sets.flatMap(set=>set.questions);
  assert.equal(quiz.categoryId,"politikk");
  assert.equal(quiz.size_class,"major_8x7");
  assert.equal(quiz.sets.length,8);
  assert.ok(quiz.sets.every(set=>set.questions.length===7));
  assert.deepEqual(quiz.sets.map(set=>set.phase),["opening","middle","middle","middle","middle","bridge","bridge","final"]);
  assert.equal(questions.length,56);
  assert.equal(new Set(questions.map(question=>question.id)).size,56);
  assert.ok(questions.slice(0,14).every(question=>["fact","context"].includes(question.question_type)&&!question.method_id));
  assert.ok(questions.slice(49).every(question=>question.method_id));
  assert.ok(questions.every(question=>question.categoryId==="politikk"&&question.epoke_domain==="politikk"));
  assert.equal(brief.profile_decision.set_count,8);
  assert.equal(context.categoryId,"politikk");
  assert.equal(report.quizOpening.status,"PASS");
});

test("Story, Lesespor, Språkleksikon og fullt Fagverk er ferdigstilt",()=>{
  assert.equal(leksikon.length,1);
  assert.ok(leksikon[0].chronology.length>=4);
  assert.equal(stories.length,2);
  assert.ok(stories.every(story=>story.quality_profile==="episode_v1"&&story.place_id===place.id));
  assert.ok(language.entries.length>=5);
  const reading=read("data/lesespor/oslo/lesespor_oslo_politikk.json");
  assert.ok(reading.items.filter(item=>item.place_ids?.includes(place.id)).length>=3);
  assert.equal(place.fagverk.level,"full");
  assert.equal(place.fagverk.status,"curated");
  assert.ok(place.fagverk.article.join(" ").split(/\s+/).length>=220);
  assert.deepEqual(registry.placeLinks[place.id],{sourceFile:"places/politikk/oslo/places_politikk/22_juli_senteret.json",field:"fagverk",schema:"history_go_place_fagverk_v2",level:"full",status:"curated"});
  assert.equal(audit.status,"PASS");
  assert.equal(audit.quality_score.total,30);
  assert.equal(audit.quality_score.unresolved_blockers,0);
});
