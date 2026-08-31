import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const placeFile="data/places/religion/oslo/akershus_slottskirke/akershus_slottskirke.json";
const place=read(placeFile);
const packet=read("data/places/production/akershus_slottskirke.json");
const quiz=read("data/quiz/religion/akershus_slottskirke_sets.json");
const brief=read("data/quiz/production_briefs/religion/akershus_slottskirke.json");
const context=read("data/quiz/production_context/religion/akershus_slottskirke.json");
const brands=read("data/brands/brands_master.json");
const byPlace=read("data/brands/brands_by_place.json");
const relations=read("data/relations.json");
const stories=read("data/stories/stories_akershus_slottskirke.json");
const leksikon=read("data/leksikon/places/oslo/religion/leksikon_akershus_slottskirke.json");
const language=read("data/leksikon/sprak/places/europe/norway/oslo/akershus_slottskirke.json");
const audit=read("reports/place-production/akershus-slottskirke-phase1-24-gate-audit-v1.json");
const exists=file=>fs.existsSync(path.join(root,file));

function findPersonImage(personId){
  const dirs=["data/people/historie","data/people/politikk","data/people/by"];
  const walk=dir=>{
    if(!fs.existsSync(path.join(root,dir)))return null;
    for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
      const rel=path.posix.join(dir,entry.name);
      if(entry.isDirectory()){const found=walk(rel);if(found)return found;}
      else if(entry.name.endsWith(".json")){
        let data;try{data=read(rel);}catch{continue;}
        const stack=Array.isArray(data)?[...data]:[data];
        while(stack.length){const value=stack.pop();if(!value||typeof value!=="object")continue;if(value.id===personId&&(value.cardImage||value.image))return value.cardImage||value.image;for(const child of Object.values(value))if(child&&typeof child==="object")stack.push(child);}
      }
    }
    return null;
  };
  for(const dir of dirs){const found=walk(dir);if(found)return found;}
  return null;
}

test("Akershus slottskirke has a separate Religion identity and verified church anchor",()=>{
  assert.equal(place.id,"akershus_slottskirke");
  assert.equal(place.category,"religion");
  assert.equal(place.lat,59.90642);
  assert.equal(place.lon,10.73643);
  assert.equal(place.coordStatus,"verified_geometry");
  assert.equal(place.coordSourceId,"osm-node:8402143318");
  assert.ok(place.aliases.includes("Garnisonskirken"));
  assert.match(place.popupDesc,/mausoleum.*eget gravrom/is);
  assert.ok(packet.identity.excludes.some(value=>/Akershus slott/i.test(value)));
  assert.ok(packet.identity.excludes.some(value=>/mausoleum/i.test(value)));
  const result=validatePacket({packet,place,packetFile:"data/places/production/akershus_slottskirke.json",now:new Date("2026-08-30T20:00:00Z")});
  assert.deepEqual(result.issues,[]);
});

test("Religion full profile owns exactly People, Objects, Brands and Ritualer og tradisjoner",()=>{
  assert.equal(place.production_profile,"rich");
  assert.deepEqual(place.place_card_profile.collection_ids,["people","objects","brands","productions"]);
  assert.equal(place.place_card_profile.category_collection_label,"Ritualer og tradisjoner");
  assert.deepEqual(audit.collections.required,["people","objects","brands","productions"]);
  assert.equal(place.objects.length,2);
  assert.ok(place.objects.every(item=>item.physicalObject&&item.placeSpecific&&item.collectable));
  assert.ok(place.productions.length>=3);
  assert.ok(place.productions.every(item=>item.type==="ritual_practice"));
  assert.equal(Object.hasOwn(place,"structures"),false);
});

test("front image and all visible collection previews are real local media",async()=>{
  for(const file of [place.image,place.cardImage,place.frontImage,...place.objects.map(x=>x.image),...place.productions.map(x=>x.image)])assert.equal(exists(file),true,file);
  const {default:sharp}=await import("sharp");
  const meta=await sharp(path.join(root,place.frontImage)).metadata();
  assert.ok(meta.height>meta.width,"frontImage must be physically portrait");
  for(const id of place.related_people_ids){const image=findPersonImage(id);assert.ok(image,`${id}: canonical People image`);assert.equal(exists(image),true,`${id}: ${image}`);}
  const brand=brands.find(item=>item.id==="forsvarsbygg");assert.ok(brand);assert.equal(exists(brand.logo),true,brand.logo);assert.equal(brand.imageMeta.generated,false);assert.equal(brand.imageMeta.reconstructed,false);
});

test("People and Forsvarsbygg reuse are direct and preserve existing canonical identities",()=>{
  assert.deepEqual(place.related_people_ids,["christian_iv","olav_v","arnstein_arneberg"]);
  for(const id of place.related_people_ids)assert.ok(relations.some(rel=>rel.type==="person_place"&&rel.personId===id&&rel.placeId===place.id),id);
  assert.deepEqual(byPlace.akershus_slottskirke,["forsvarsbygg"]);
  const brand=brands.find(item=>item.id==="forsvarsbygg");
  assert.ok(brand.place_ids.includes("akershus_festning"));
  assert.ok(brand.place_ids.includes("akershus_slottskirke"));
  assert.equal(brand.logo,"bilder/kort/brands/forsvarsbygg_akershus_wordmark.webp");
  assert.match(brand.imageMeta.sourceForm,/authentic_site/);
});

test("Religion quiz is 5x7, fact-first, method-late and theory-bound without curriculum-language leakage",()=>{
  const questions=quiz.sets.flatMap(set=>set.questions);
  assert.equal(quiz.categoryId,"religion");
  assert.equal(quiz.size_class,"rich_5x7");
  assert.equal(quiz.sets.length,5);
  assert.ok(quiz.sets.every(set=>set.questions.length===7));
  assert.equal(questions.length,35);
  assert.equal(new Set(questions.map(q=>q.id)).size,35);
  assert.ok(questions.slice(0,14).every(q=>["fact","context"].includes(q.question_type)&&!q.method_id&&!q.topic_hook_id));
  assert.ok(questions.slice(28).some(q=>q.method_id));
  const theory=questions.find(q=>q.topic_hook_id==="religion_ritual_fellesskap");assert.ok(theory);assert.equal(theory.thinker_id,"emile_durkheim");assert.equal(theory.work,"The Elementary Forms of Religious Life");assert.equal(theory.emne_id,"em_religion_ritualer_praksis");
  assert.ok(questions.every(q=>q.categoryId==="religion"&&q.epoke_domain==="religion"));
  assert.ok(questions.every(q=>!/(fagplan|fagkart|topic hook|quizgenerator)/i.test(q.question)));
  assert.equal(brief.profile_decision.set_count,5);
  assert.equal(context.categoryId,"religion");
});

test("chronology, Story, Lesespor, Språkleksikon and quality gate are materialized",()=>{
  assert.equal(leksikon.length,1);
  assert.ok(leksikon[0].chronology.length>=10);
  assert.equal(stories.length,1);
  assert.equal(stories[0].quality_profile,"episode_v1");
  assert.equal(stories[0].place_id,place.id);
  assert.ok(stories[0].related_people.includes("olav_v"));
  assert.ok(language.entries.length>=6);
  const reading=read("data/lesespor/oslo/lesespor_oslo_religion.json");
  assert.ok(reading.items.filter(item=>item.place_ids?.includes(place.id)).length>=4);
  assert.equal(audit.status,"PASS");
  assert.equal(audit.quality_score.total,30);
  assert.equal(audit.quality_score.critical_findings,0);
  assert.equal(audit.quality_score.unresolved_blockers,0);
});
