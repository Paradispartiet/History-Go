#!/usr/bin/env node
// Kulturkirken Jakob: real app image, place identity and quizcard acceptance.
// Never simulate a successful photo load or fabricate a substitute image.
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const id = "kulturkirken_jakob_litteratur";
const place = read("data/places/musikk/oslo/places_musikk/"+id+".json");
const payload = read("data/runtime/place-open/"+id+".json").place;
const quiz = read("data/quiz/musikk/"+id+"_sets.json");
const quizCard = read("data/quizcards/musikk/"+id+"_quizkort_v1.json").cards[0];
assert.equal(place.category,"musikk");
assert.equal(payload.category,"musikk");
assert.deepEqual(place.secondaryBadgeIds,["kunst"]);
assert.equal(place.frontImage,payload.frontImage);
assert.equal(place.image,payload.image);
assert.ok(place.image && place.frontImage && place.image!==place.frontImage);
assert.ok(fs.statSync(place.frontImage).size>50_000);
const questions=quiz.sets.flatMap(s=>s.questions||[]);
assert.equal(quiz.sets.length,3);
assert.equal(questions.length,21);
assert.equal(quizCard.questions.length,10);
const ids = new Set(questions.map(q=>q.id));
assert.equal(ids.size,21);
for(const q of quizCard.questions) {
 assert.ok(ids.has(q.id),"QuizCard must reuse one canonical fullquiz question: "+q.id);
 assert.equal(q.answer,q.options[q.answerIndex],"QuizCard must retain the correct answer");
}

const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",
 ".json":"application/json",".css":"text/css",".jpg":"image/jpeg",".jpeg":"image/jpeg",
 ".webp":"image/webp",".png":"image/png",".svg":"image/svg+xml",".woff2":"font/woff2",".wasm":"application/wasm"};
const server=http.createServer((req,res)=>{
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname)}
 catch{res.writeHead(400);res.end();return}
 const file=path.resolve(root,"."+(pathname==="/" ? "/index.html" : pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
  res.writeHead(404);res.end("not found");return;
 }
 res.writeHead(200,{"content-type":mime[path.extname(file).toLowerCase()]||"application/octet-stream"});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port;
const screens=[
 {name:"mobile",width:390,height:844,mobile:true},
 {name:"ipad-portrait",width:820,height:1180,mobile:true},
 {name:"ipad-landscape",width:1180,height:820,mobile:true},
 {name:"desktop",width:1440,height:960,mobile:false}
];
const out=path.join(root,"artifacts","kulturkirken-jakob-real-browser");
fs.mkdirSync(out,{recursive:true});
const results=[];
let browser;
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,
  args:["--no-sandbox","--disable-dev-shm-usage"]});
 for(const screen of screens) {
  const context=await browser.newContext({viewport:{width:screen.width,height:screen.height},
   isMobile:screen.mobile,hasTouch:screen.mobile,locale:"nb-NO"});
  let page;
  try {
   await context.addInitScript(()=>{
    localStorage.setItem("hg_onboarding_shown_v1","1");
    localStorage.setItem("HG_TEST_MODE","1");
    localStorage.setItem("hg_lang","nb");
   });
   page=await context.newPage();
   await page.goto(base+"/index.html?hgTest=1#/place/"+id,{waitUntil:"domcontentloaded",timeout:80_000});
   await page.waitForFunction(expected =>
    window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&
    document.querySelector("#placeCard")?.dataset.currentPlaceId===expected,id,{timeout:85_000});
   await page.waitForFunction(()=> {
    const a=document.getElementById("pcHeaderImage"),b=document.getElementById("pcFrontImage");
    return a?.complete&&b?.complete&&a.naturalWidth>0&&a.naturalHeight>0&&
      b.naturalWidth>0&&b.naturalHeight>0;
   },null,{timeout:55_000});
   const images=await page.evaluate(()=>{
    const details=id=>{
     const el=document.getElementById(id);const rect=el.getBoundingClientRect();
     return {src:el.currentSrc||el.src,width:el.naturalWidth,height:el.naturalHeight,
       boxWidth:rect.width,boxHeight:rect.height};
    };
    return {hero:details("pcHeaderImage"),front:details("pcFrontImage")};
   });
   assert.ok(images.hero.src.endsWith(place.image),screen.name+": incorrect hero");
   assert.ok(images.front.src.endsWith(place.frontImage),screen.name+": incorrect front");
   assert.ok(images.hero.width>images.hero.height,screen.name+": hero is not landscape");
   assert.ok(images.front.height>images.front.width,screen.name+": front is not portrait");
   assert.ok(images.hero.boxWidth>0&&images.front.boxWidth>0,screen.name+": image layout missing");
   assert.notEqual(images.hero.src,images.front.src);
   const title=(await page.locator("#pcTitle").innerText()).trim();
   assert.equal(title,place.name);
   await page.waitForFunction(expected=>{
    const el=document.querySelector("#pcQuizCardContent");
    const text=el?.textContent||"";
    return !!el?.querySelector(".pc-rendered-quiz-card")&&text.includes(expected);
   },quizCard.title,{timeout:40_000});
   const renderedQuestions=await page.locator("#pcQuizCardContent .pc-rendered-quiz-list > li").count();
   assert.equal(renderedQuestions,10,screen.name+": QuizCard must render 10 questions");
   await page.locator("#placeCard").screenshot({path:path.join(out,screen.name+".png"),timeout:20_000});
   results.push({viewport:screen.name,status:"passed",images,quizcardQuestions:renderedQuestions});
   console.log("PASS",screen.name,"2 independent photos, title and 10-question QuizCard");
  } catch(err) {
   results.push({viewport:screen.name,status:"failed",error:String(err?.stack||err).slice(0,2500)});
   await page?.screenshot({path:path.join(out,screen.name+"-failed.png"),fullPage:true,timeout:15_000}).catch(()=>{});
  } finally {
   await page?.close().catch(()=>{});await context.close();
  }
 }
} finally {
 await browser?.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
 fs.writeFileSync(path.join(out,"results.json"),JSON.stringify({place_id:id,results},null,2)+"\n");
}
assert.equal(results.length,4);
assert.deepEqual(results.filter(x=>x.status!=="passed"),[]);
