import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const manifest=JSON.parse(fs.readFileSync("data/quizcards/media/manifest.json","utf8"));
const card=JSON.parse(fs.readFileSync("data/quizcards/media/vg_huset_quizkort_v1.json","utf8"));
const bundle=fs.readFileSync("js/ui/place-card-quizcards-patch.js","utf8");

test("VG-huset has a directly address-bound, historically accurate media QuizCard",()=>{
 assert.ok(manifest.collections.includes("vg_huset_quizkort_v1.json"));
 assert.equal(card.targetId,"vg_huset");
 assert.equal(card.cards.length,1);
 const [c]=card.cards;
 assert.equal(c.targetId,"vg_huset");
 assert.equal(c.questionCount,10);
 assert.equal(c.questions.length,10);
 assert.deepEqual(c.questions.map(q=>q.answerIndex),[1,0,2,1,0,2,1,2,0,1]);
 assert.ok(c.questions.every(q=>q.answer===q.options[q.answerIndex]));
 assert.ok(c.questions.every(q=>q.source_urls.length>0&&q.source_urls.every(url=>url.startsWith("https://"))));
 assert.ok(c.questions.every(q=>!q.question.includes("ifølge story-data")));
 assert.ok(c.questions.every(q=>!q.question.includes("Hva bør quizzen")));
 assert.ok(!JSON.stringify(c).includes("Akersgata 55 var VGs første redaksjon"));
});

test("runtime loader resolves VG-huset card through media manifest and binds the back of PlaceCard",async()=>{
 const dom=new JSDOM('<!doctype html><body><button id="pcFrontCardFlip" aria-label="Quizkort mangler"></button><div id="pcQuizCardContent" hidden></div><img id="pcQuizCardImage" alt=""></body>',{url:"https://history-go.test/",runScripts:"outside-only"});
 const w=dom.window;
 const requested=[];
 w.TEST_MODE=true; w.visited={};w.HG_I18N={t:(_key,f)=>f};
 w.openPlaceCard=async()=>true;
 w.DataHub={loadQuizCardsCollection:async path=>{
   requested.push(path);
   if(path==="media/manifest.json")return manifest;
   if(path==="media/vg_huset_quizkort_v1.json")return card;
   return null;
 }};
 w.eval(bundle);
 await w.openPlaceCard({id:"vg_huset",name:"VG-huset",category:"media"});
 assert.ok(requested.includes("media/manifest.json"));
 assert.ok(requested.includes("media/vg_huset_quizkort_v1.json"));
 assert.equal(w.document.querySelector("#pcFrontCardFlip")?.classList.contains("has-quiz-card"),true);
 assert.equal(w.document.querySelector("#pcFrontCardFlip")?.getAttribute("aria-label"),"Vis quizkort");
 const c=w.document.querySelector("#pcQuizCardContent");
 assert.equal(c.hidden,false);
 assert.match(c.textContent,/VG-huset/);
 assert.match(c.textContent,/Lund/);
 assert.match(c.textContent,/Houens/);
 assert.equal(c.querySelectorAll("li").length,10);
 dom.window.close();
});
