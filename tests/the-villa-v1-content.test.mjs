import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = p => JSON.parse(fs.readFileSync(p,"utf8"));
const canonical = read("data/places/subkultur/oslo/places_subkultur/the_villa.json");
const runtime = read("data/runtime/place-open/the_villa.json");
const registry = read("data/fagverk/fagverk_registry.json");
const quiz = read("data/quiz/musikk/the_villa_sets_merged.json");
const cards = read("data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json");
const manifest = read("data/quiz/manifest.json");
const subculture = read("data/places/subkultur-production/the_villa.json");

test("The Villa retains its canonical location and Music/Subculture identity",()=>{
  assert.equal(canonical.id,"the_villa");
  assert.equal(canonical.category,"musikk");
  assert.equal(canonical.address.street,"Møllergata");
  assert.equal(canonical.address.number,"23");
  assert.equal(canonical.coordSourceId,"geonorge-adresser-v1:0301:14943:23");
  assert(canonical.secondaryBadgeIds.includes("subkultur"));
});

test("The Villa has distinct documented historical periods",()=>{
  assert.match(canonical.desc,/2007/);
  for (const phrase of ["2007","2008","2010","2011","2014","Nils Noa","Charlotte Thorstvedt"]) {
    assert(canonical.popupDesc.includes(phrase),phrase);
  }
  assert(!/I History Go|Spørsmål bør|generisk nattklubb/i.test(canonical.popupDesc));
  assert(canonical.externalLinks.some(x=>x.url.includes("theguardian.com")));
  assert(canonical.externalLinks.some(x=>x.url.includes("roomdivision.com")));
});

test("Fagverk is curated, indexed and synced into actual Place-open",()=>{
  const f=canonical.fagverk;
  assert.equal(f.schema,"history_go_place_fagverk_v2");
  assert.equal(f.status,"curated");
  assert.equal(f.article.length,3);
  assert.equal(f.lenses.length,3);
  assert(f.article.every(x=>x.length>300));
  assert(f.source_urls.length>=8);
  assert(f.chapter_ids.includes("historisk-musikkvitenskap-historiografi"));
  assert(f.chapter_ids.includes("institusjoner-okonomi-politikk-offentlighet"));
  const link=registry.placeLinks.the_villa;
  assert.equal(link.field,"fagverk");
  assert.equal(link.sourceFile,"places/subkultur/oslo/places_subkultur/the_villa.json");
  for(const key of ["desc","popupDesc","fagverk","externalLinks"]) assert.deepEqual(runtime.place[key],canonical[key]);
});

test("Subculture report identifies source perspectives without claiming extra gates",()=>{
  assert.equal(subculture.placeId,"the_villa");
  assert.equal(subculture.placeFile,"data/places/subkultur/oslo/places_subkultur/the_villa.json");
  assert.equal(subculture.sources.length,3);
  assert(subculture.sources.some(x=>x.perspective==="participant"));
  assert(subculture.sources.some(x=>x.perspective==="secondary"));
  for(const key of ["A","B","C","D","E","F"]) assert.equal(subculture.gates[key].status,"PASS");
  for(const key of ["G","H"]) assert.equal(subculture.gates[key].status,"N/A");
});

test("30 Music fullquiz questions registered with stable source and answers",()=>{
  assert.equal(quiz.targetId,"the_villa");
  assert.equal(quiz.sets.length,5);
  assert(quiz.sets.every(set=>set.questions.length===6));
  const qs=quiz.sets.flatMap(s=>s.questions);
  assert.equal(qs.length,30);
  assert.equal(new Set(qs.map(q=>q.id)).size,30);
  assert.equal(new Set(qs.map(q=>q.quiz_id)).size,30);
  assert(qs.every(q=>q.categoryId==="musikk" && q.placeId==="the_villa"));
  assert(qs.every(q=>q.options.length===3 && q.answer===q.options[q.answerIndex]));
  assert(qs.every(q=>q.knowledge.length>40 && q.source[0].startsWith("https://")));
  const entries=manifest.sets.filter(s=>s.targetId==="the_villa");
  assert.equal(entries.length,5);
  assert.deepEqual(entries.map(s=>s.set_id),quiz.sets.map(s=>s.set_id));
});

test("QuizCard ten questions match fullquiz and two images cannot share one source",()=>{
  const card=cards.cards.filter(c=>c.targetId==="the_villa");
  assert.equal(card.length,1);
  assert.equal(card[0].questionCount,10);
  assert.equal(card[0].questions.length,10);
  const qById=new Map(quiz.sets.flatMap(s=>s.questions).map(q=>[q.id,q]));
  for(const [i,q] of card[0].questions.entries()){
    const match=qById.get(q.sourceQuestionId);
    assert(match,q.sourceQuestionId);
    assert.equal(q.question,match.question);
    assert.deepEqual(q.options,match.options);
    assert.equal(q.answer,match.answer);
    assert.equal(q.sourceQuizId,match.quiz_id);
    assert.equal(card[0].answerKey[i].answer,q.answer);
  }
  if(canonical.image||canonical.frontImage){
    assert(canonical.image && canonical.frontImage,"Both photos must be delivered together");
    assert.notEqual(canonical.image,canonical.frontImage);
    assert.notEqual(canonical.imageMeta?.sourcePage,canonical.frontImageMeta?.sourcePage,
      "image and frontImage must have different original photographs, not just crops");
    assert.match(canonical.imageMeta?.originalSha256||" ",/^[a-f0-9]{64}$/);
    assert.match(canonical.frontImageMeta?.originalSha256||" ",/^[a-f0-9]{64}$/);
    assert.notEqual(canonical.imageMeta.originalSha256,canonical.frontImageMeta.originalSha256,
      "The two media derivatives must be built from different source photo bytes");
    for(const key of ["image","frontImage","cardImage"]) {
      assert(fs.existsSync(canonical[key]),"Missing local WebP: "+canonical[key]);
      assert(fs.statSync(canonical[key]).size>10000,"Empty local WebP: "+canonical[key]);
    }
    assert.equal(canonical.imageMeta.license,"CC BY-SA 4.0");
    assert.equal(canonical.frontImageMeta.license,"CC BY-SA 4.0");
  }
});
