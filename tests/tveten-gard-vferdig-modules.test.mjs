import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const file=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const read=(path)=>JSON.parse(file(path));
const id="tveten_gard";
const place=read("data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/tveten_gard.json");
const runtime=read("data/runtime/place-open/tveten_gard.json");
const story=read("data/stories/stories_tveten_gard.json");
const lex=read("data/leksikon/places/oslo/historie/leksikon_tveten_gard.json");
const language=read("data/leksikon/sprak/places/europe/norway/oslo/tveten_gard.json");
const lesespor={items:read("data/lesespor/oslo/lesespor_oslo_historie.json").items.filter(x=>x.place_ids.includes("tveten_gard"))};
const people=[
 read("data/people/historie/oslo/tveten_gard/even_bernhard_stenersen.json")[0],
 read("data/people/historie/oslo/tveten_gard/mogens_lauritsson.json")[0]
];

test("Tveten: documentary hero and a distinct, disclosed upright editorial front",()=>{
 assert.equal(place.id,id);
 assert.equal(runtime.place.id,id);
 assert.equal(place.imageMeta.assetType,"documentary_place_photo");
 assert.equal(place.imageLicense,"CC BY-SA 3.0");
 assert.equal(place.frontImage,"bilder/illustrasjoner/places/tveten_gard_front_editorial.svg");
 assert.notEqual(place.frontImage,place.image);
 assert.equal(runtime.place.frontImage,place.frontImage);
 assert.equal(place.frontImageMeta.assetType,"editorial_illustration");
 assert.match(place.frontImageMeta.disclosure,/ikke fotografi/i);
 const svg=file(place.frontImage);
 assert.match(svg,/viewBox="0 0 900 1200"/);
 assert.match(svg,/REDAKSJONELL ILLUSTRASJON/);
 assert.match(svg,/<svg\b/);
});

test("Tveten: two source-linked people get symbolic artwork, never invented portraits",()=>{
 assert.equal(people.length,2);
 for(const person of people){
  assert.ok(place.related_people_ids.includes(person.id));
  assert.ok(runtime.people.some(p=>p.id===person.id));
  assert.ok(person.source_urls.length>=2);
  assert.equal(person.image,person.cardImage);
  assert.equal(person.imageMeta.assetType,"editorial_person_illustration");
  assert.match(person.imageMeta.disclosure,/ikke.*portrett/i);
  assert.match(file(person.image),/IKKE HISTORISK PORTRETT/);
 }
 assert.ok(runtime.people.some(p=>p.id==="hannibal_sehested"));
});

test("Tveten: Story, two articles, five language concepts and four open source tracks are registered",()=>{
 assert.equal(story.length,1);
 assert.equal(story[0].place_id,id);
 assert.equal(story[0].quality_profile,"episode_v1");
 assert.equal(story[0].year,1950);
 assert.ok(story[0].story.split("\n\n").length>=3);
 assert.ok(story[0].sources.length>=2);
 assert.deepEqual(runtime.stories.filter(s=>s.place_id===id),story);
 const storyMan=read("data/stories/stories_manifest.json");
 assert.ok(storyMan.files.some(x=>x.entity_id===id&&x.path==="data/stories/stories_tveten_gard.json"));
 assert.equal(lex.length,2);
 assert.ok(lex.every(x=>x.place_id===id&&x.sources.length>=2));
 assert.deepEqual(lex[0].chronology.map(x=>x.year),[1408,1677,1708,1810,1858,1950,2006]);
 assert.deepEqual(runtime.leksikon.filter(x=>x.place_id===id),lex);
 assert.ok(read("data/leksikon/manifest.json").files.includes("data/leksikon/places/oslo/historie/leksikon_tveten_gard.json"));
 assert.equal(language.place_id,id);
 assert.equal(language.entries.length,5);
 assert.ok(language.entries.every(x=>x.linked_to.id===id&&x.sources.length>0));
 assert.deepEqual(runtime.language,language);
 assert.equal(read("data/leksikon/sprak/manifest.json").place_files[id],"data/leksikon/sprak/places/europe/norway/oslo/tveten_gard.json");
 assert.equal(lesespor.items.length,4);
 assert.ok(lesespor.items.every(x=>x.place_ids.includes(id)&&x.access==="open"&&x.rights==="link_only"));
 assert.deepEqual(runtime.lesespor.filter(x=>x.place_ids.includes(id)),lesespor.items);
 assert.ok(read("data/lesespor/manifest.json").files.includes("oslo/lesespor_oslo_historie.json"));
});

test("Tveten: previously published 21-question fullquiz and 10-question QuizCard remain untouched",()=>{
 const quiz=read("data/quiz/historie/tveten_gard_sets.json");
 const quizcard=read("data/quizcards/historie/tveten_gard_quizcard_v1.json");
 assert.equal(quiz.sets.reduce((n,x)=>n+x.questions.length,0),21);
 assert.equal(quizcard.cards[0].questions.length,10);
 assert.equal(place.fagverk.status,"curated");
 assert.equal(runtime.place.fagverk.status,"curated");
});
