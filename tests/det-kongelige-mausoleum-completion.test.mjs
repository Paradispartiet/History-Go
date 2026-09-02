import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const placeFile="data/places/religion/oslo/det_kongelige_mausoleum/det_kongelige_mausoleum.json";
const place=read(placeFile);
const packet=read("data/places/production/det_kongelige_mausoleum.json");
const quiz=read("data/quiz/religion/det_kongelige_mausoleum_sets.json");
const brief=read("data/quiz/production_briefs/religion/det_kongelige_mausoleum.json");
const context=read("data/quiz/production_context/religion/det_kongelige_mausoleum.json");
const brands=read("data/brands/brands_master.json");
const byPlace=read("data/brands/brands_by_place.json");
const relations=read("data/relations.json");
const stories=read("data/stories/stories_det_kongelige_mausoleum.json");
const churchStories=read("data/stories/stories_akershus_slottskirke.json");
const leksikon=read("data/leksikon/places/oslo/religion/leksikon_det_kongelige_mausoleum.json");
const language=read("data/leksikon/sprak/places/europe/norway/oslo/det_kongelige_mausoleum.json");
const festning=read("data/places/historie/oslo/places_historie/akershus_festning.json");
const audit=read("reports/place-production/det-kongelige-mausoleum-phase1-24-gate-audit-v1.json");
const workcard=read("reports/place-production/det-kongelige-mausoleum-workcard-current.json");
const fagverkRegistry=read("data/fagverk/fagverk_registry.json");
const exists=file=>fs.existsSync(path.join(root,file));

function findPersonImage(personId){
  for(const file of read("data/people/manifest.json").files){
    const relative=String(file).replace(/^people\//,"");
    const full=`data/people/${relative}`;
    if(!exists(full))continue;
    let data;try{data=read(full);}catch{continue;}
    const stack=Array.isArray(data)?[...data]:[data];
    while(stack.length){const value=stack.pop();if(!value||typeof value!=="object")continue;if(value.id===personId&&(value.cardImage||value.image))return value.cardImage||value.image;for(const child of Object.values(value))if(child&&typeof child==="object")stack.push(child);}
  }
  return null;
}

test("mausoleet er et eget Religion-Place med korrekt 1949-identitet og navngitt bygningsgeometri",()=>{
  assert.equal(place.id,"det_kongelige_mausoleum");
  assert.equal(place.category,"religion");
  assert.equal(place.year,1949);
  assert.equal(place.coordStatus,"verified_geometry");
  assert.equal(place.coordSourceId,"osm-way:904553015");
  assert.equal(place.coordRole,"building_center");
  assert.ok(packet.identity.excludes.some(value=>/slottskirke/i.test(value)));
  assert.equal(festning.structures.some(item=>item.id==="akershus_kongelige_mausoleum"),false);
  assert.ok(festning.related_place_ids.includes(place.id));
  const result=validatePacket({packet,place,packetFile:"data/places/production/det_kongelige_mausoleum.json",now:new Date("2026-08-31T20:00:00Z")});
  assert.deepEqual(result.issues,[]);
});

test("fullprofilen har nøyaktig People, Objects, Brands og Ritualer og tradisjoner",()=>{
  assert.equal(place.production_profile,"standard");
  assert.deepEqual(place.place_card_profile.collection_ids,["people","objects","brands","productions"]);
  assert.equal(place.place_card_profile.category_collection_label,"Ritualer og tradisjoner");
  assert.deepEqual(place.related_people_ids,["olav_v","arnstein_arneberg"]);
  assert.deepEqual(place.objects.map(item=>item.id),["det_kongelige_mausoleum_hvit_sarkofag","det_kongelige_mausoleum_gronn_sarkofag"]);
  assert.ok(place.objects.every(item=>item.physicalObject&&item.placeSpecific&&item.collectable));
  assert.equal(place.productions.length,3);
  assert.ok(place.productions.every(item=>item.type==="ritual_practice"));
  assert.equal(Object.hasOwn(place,"structures"),false);
  assert.equal(place.place_card_profile.collection_ids.includes("related"),false);
});

test("alle synlige samlingspreviews er lokale og stående frontbilde er fysisk stående",async()=>{
  for(const file of [place.image,place.cardImage,place.frontImage,...place.objects.map(x=>x.image),...place.productions.map(x=>x.image)])assert.equal(exists(file),true,file);
  const {default:sharp}=await import("sharp");
  const meta=await sharp(path.join(root,place.frontImage)).metadata();
  assert.ok(meta.height>meta.width,"frontImage must be physically portrait");
  for(const id of place.related_people_ids){const image=findPersonImage(id);assert.ok(image,`${id}: canonical People image`);assert.equal(exists(image),true,`${id}: ${image}`);}
  const brand=brands.find(item=>item.id==="forsvarsbygg");assert.ok(brand);assert.equal(exists(brand.logo),true,brand.logo);
  assert.deepEqual(byPlace.det_kongelige_mausoleum,["forsvarsbygg"]);
});

test("People- og Brand-koblingene er direkte dokumentert og gjenbruker canonicale identiteter",()=>{
  for(const id of place.related_people_ids)assert.ok(relations.some(rel=>rel.type==="person_place"&&rel.personId===id&&rel.placeId===place.id),id);
  const brand=brands.find(item=>item.id==="forsvarsbygg");
  assert.ok(brand.place_ids.includes("akershus_festning"));
  assert.ok(brand.place_ids.includes("akershus_slottskirke"));
  assert.ok(brand.place_ids.includes(place.id));
  assert.equal(brand.logo,"bilder/kort/brands/forsvarsbygg_akershus_wordmark.webp");
});

test("Religion-quizen er normal 4x7, har 2x7 normalåpning og sen metode/teori",()=>{
  const questions=quiz.sets.flatMap(set=>set.questions);
  assert.equal(quiz.categoryId,"religion");
  assert.equal(quiz.size_class,"normal_4x7");
  assert.equal(quiz.sets.length,4);
  assert.ok(quiz.sets.every(set=>set.questions.length===7));
  assert.equal(questions.length,28);
  assert.equal(new Set(questions.map(q=>q.id)).size,28);
  assert.ok(questions.slice(0,14).every(q=>["fact","context"].includes(q.question_type)&&!q.method_id&&!q.topic_hook_id));
  assert.ok(questions.slice(21).some(q=>q.method_id));
  const theory=questions.find(q=>q.topic_hook_id==="religion_ritual_fellesskap");assert.ok(theory);assert.equal(theory.thinker_id,"emile_durkheim");
  assert.ok(questions.every(q=>q.categoryId==="religion"&&q.epoke_domain==="religion"));
  assert.equal(brief.profile_decision.set_count,4);
  assert.equal(context.categoryId,"religion");
});

test("Story, Lesespor, Språkleksikon og Place-eid Fagverk er materialisert",()=>{
  assert.equal(leksikon.length,1);
  assert.equal(leksikon[0].chronology.length,5);
  assert.equal(stories.length,1);
  assert.equal(stories[0].quality_profile,"episode_v1");
  assert.equal(stories[0].place_id,place.id);
  assert.ok(stories[0].related_places.includes("gamle_aker_kirke"));
  const olavStory=churchStories.find(item=>item.id==="st_akershus_slottskirke_olav_v_1991");
  assert.equal(olavStory.next_scenes[0].place_id,place.id);
  assert.ok(language.entries.length>=5);
  const reading=read("data/lesespor/oslo/lesespor_oslo_religion.json");
  assert.ok(reading.items.filter(item=>item.place_ids?.includes(place.id)).length>=3);
  assert.equal(place.fagverk.schema,"history_go_place_fagverk_v2");
  assert.equal(place.fagverk.level,"standard");
  assert.equal(place.fagverk.status,"curated");
  assert.deepEqual(place.fagverk.subject_ids,["religion"]);
  assert.deepEqual(place.fagverk.emne_ids,["em_religion_hellige_rom","em_religion_ritualer_praksis","em_religion_religionshistorie_lokalt","em_religion_kristendom","em_religion_religion_og_samfunn"]);
  assert.deepEqual(place.fagverk.chapter_ids,[]);
  assert.equal(fagverkRegistry.places[place.id].schema,"history_go_place_fagverk_v2");
  assert.equal(fagverkRegistry.places[place.id].status,"curated");
  assert.equal(workcard.fagverk,"curated");
  assert.equal(audit.fagverk.status,"CURATED");
  assert.equal(audit.status,"PASS");
  assert.equal(audit.quality_score.total,30);
});
