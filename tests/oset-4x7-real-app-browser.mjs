#!/usr/bin/env node
// Source-exact real-app QA for Oset slusebru: PlaceCard, QuizCard and fullquiz.
// Phone Chromium, iPad-size WebKit, desktop Chromium. Does not award progress.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, webkit } from 'playwright';

const root=process.cwd(),ID='frysjadammen';
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const original=read('data/places/natur/oslo/places_oslo_natur_akerselvarute/frysjadammen.json');
const payload=read('data/runtime/place-open/frysjadammen.json').place;
const quiz=read('data/quiz/historie/frysjadammen_sets.json');
const card=read('data/quizcards/historie/oset_slusebru_quizcard_v1.json');
const quizManifest=read('data/quiz/manifest.json');
const cardsManifest=read('data/quizcards/historie/manifest.json');
const legacy=read('data/knowledge/preserved_quiz_sources/frysjadammen_oset_legacy_20261117.json');
const qs=quiz.sets.flatMap(s=>s.questions);
assert.equal(payload.id,ID);
assert.equal(original.id,ID);
assert.match(original.name,/Oset slusebru/);
assert.equal(quiz.sets.length,4);
assert.equal(qs.length,28);
assert.equal(legacy.questions.length,32);
assert.equal(quizManifest.sets.filter(row=>row.targetId===ID).length,4);
assert.ok(cardsManifest.collections.includes('oset_slusebru_quizcard_v1.json'));
assert.equal(card.cards[0].targetId,ID);
assert.equal(card.cards[0].questions.length,10);
const sourceQuestions=new Map(qs.map(q=>[q.id,q]));
for(const item of card.cards[0].questions){
 const originalQuestion=sourceQuestions.get(item.sourceQuestionId);
 assert.ok(originalQuestion,item.sourceQuestionId);
 assert.equal(item.answer,originalQuestion.answer);
 assert.deepEqual(item.options,originalQuestion.options);
 assert.equal(item.primary_knowledge_unit_id,originalQuestion.primary_knowledge_unit_id);
}

const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript',
 '.json':'application/json','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml',
 '.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}
 catch{res.writeHead(400);res.end('Bad URL');return}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
  res.writeHead(404);res.end('Missing');return;
 }
 res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const out='artifacts/oset-4x7-real-app';fs.mkdirSync(out,{recursive:true});
const modes=[
 {name:'phone-chromium-390',engine:chromium,width:390,height:844,mobile:true},
 {name:'ipad-webkit-834',engine:webkit,width:834,height:1112,mobile:true},
 {name:'desktop-chromium-1440',engine:chromium,width:1440,height:1000,mobile:false}
];
try{
 for(const mode of modes){
  const browser=await mode.engine.launch({headless:true,
   ...(mode.engine===chromium?{args:['--no-sandbox','--disable-dev-shm-usage']}: {})});
  const context=await browser.newContext({viewport:{width:mode.width,height:mode.height},
   isMobile:mode.mobile,hasTouch:mode.mobile,locale:'nb-NO'});
  const errors=[];
  try{
   await context.addInitScript(()=>{
    localStorage.setItem('hg_onboarding_shown_v1','1');
    localStorage.setItem('HG_TEST_MODE','1');
    localStorage.setItem('hg_lang','nb');
   });
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push(String(e.message)));
   await page.goto(base+'/index.html?hgTest=1#/place/'+ID,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(id=>window.__HG_APP_READY__===true &&
    window.__HG_ROUTER_STARTED__===true &&
    document.querySelector('#placeCard')?.dataset.currentPlaceId===id,
    ID,{timeout:90000});
   await page.waitForFunction(()=> {
    const a=document.querySelector('#pcFrontImage'),b=document.querySelector('#pcHeaderImage');
    return a?.complete&&a.naturalWidth>0&&b?.complete&&b.naturalWidth>0;
   },null,{timeout:60000});
   const details=await page.evaluate(()=>{
    const media=id=>{const el=document.getElementById(id);return{
     src:el.currentSrc,fit:getComputedStyle(el).objectFit,
     naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,
     width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,
     frameWidth:el.parentElement.getBoundingClientRect().width,
     frameHeight:el.parentElement.getBoundingClientRect().height
    }};
    return {name:document.querySelector('#pcTitle')?.textContent,
     front:media('pcFrontImage'),hero:media('pcHeaderImage')};
   });
   assert.match(details.name||'',/Oset slusebru/);
   assert.match(details.front.src,/oset_slusebru_front_original\.svg/);
   assert.match(details.hero.src,/oset_slusebru_landscape\.webp/);
   assert.ok(details.front.naturalHeight>details.front.naturalWidth);
   assert.ok(details.hero.naturalWidth>details.hero.naturalHeight);
   for(const m of [details.front,details.hero]){
    assert.equal(m.fit,'cover');
    assert.ok(Math.abs(m.width-m.frameWidth)<=1);
    assert.ok(Math.abs(m.height-m.frameHeight)<=1);
   }
   await page.waitForFunction(()=>document.querySelector('#pcQuizCardContent')?.querySelector('.pc-rendered-quiz-card')&&
    document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card'),
    null,{timeout:50000});
   const front=page.locator('#pcFrontCardFlip');
   const bounds=await front.boundingBox();
   assert.ok(bounds&&bounds.width>0&&bounds.height>0);
   await front.click({position:{x:22,y:Math.max(24,bounds.height-25)},timeout:15000});
   await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:14000});
   await page.waitForTimeout(400);
   assert.equal(await page.locator('#pcQuizCardContent li').count(),10,'Ten QuizCard questions must render');
   const cardText=await page.locator('#pcQuizCardContent').innerText();
   for(const target of card.cards[0].questions.slice(0,3))assert.ok(cardText.includes(target.question),target.question);
   await page.screenshot({path:out+'/'+mode.name+'-quizcard.png',timeout:20000});
   await page.locator('#pcQuizExpandBtn').click({timeout:16000});
   await page.locator('#pcQuizExpanded').waitFor({state:'visible',timeout:16000});
   assert.equal(await page.locator('#pcQuizExpandedContent li').count(),10);
   await page.screenshot({path:out+'/'+mode.name+'-expanded.png',timeout:20000});
   await page.locator('#pcQuizExpandedClose').click();
   await page.waitForFunction(()=>document.querySelector('#pcQuizExpanded')?.hidden===true,null,{timeout:10000});
   await front.click({position:{x:22,y:Math.max(24,bounds.height-25)},timeout:12000});
   await page.locator('#pcQuiz').click({timeout:16000});
   await page.waitForFunction(id=>location.hash.startsWith('#/quiz/'+id),ID,{timeout:30000});
   await page.waitForFunction(()=>document.querySelector('#quizChoices button:not(:disabled)'),null,{timeout:40000});
   const visible=(await page.locator('#quizQuestion').innerText()).trim();
   assert.ok(qs.some(q=>q.question===visible),mode.name+': not from the canonical 4x7 quiz: '+visible);
   await page.screenshot({path:out+'/'+mode.name+'-fullquiz.png',timeout:20000});
   assert.deepEqual(errors,[],mode.name+': unexpected page errors');
   console.log('PASS '+mode.name+' real Oset PlaceCard / 10-item QuizCard / source-exact 4x7 fullquiz route');
  }finally{
   await context.close();await browser.close();
  }
 }
}finally{await new Promise(resolve=>server.close(resolve));}
