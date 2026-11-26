#!/usr/bin/env node
// Source-exact real-app QA for Kuba-parken: PlaceCard, QuizCard, and fullquiz.
// Phone Chromium, iPad-size WebKit, desktop Chromium. Does not award progress.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, webkit } from 'playwright';

const root=process.cwd(),ID='kuba_parken';
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const original=read('data/places/natur/oslo/places_oslo_natur_akerselvarute/kuba_parken.json');
const payload=read('data/runtime/place-open/kuba_parken.json').place;
const quiz=read('data/quiz/natur/kuba_parken_sets.json');
const card=read('data/quizcards/natur/kuba_parken_quizcard_v1.json');
const quizManifest=read('data/quiz/manifest.json');
const cardsManifest=read('data/quizcards/natur/manifest.json');
const legacy=read('data/knowledge/preserved_quiz_sources/kuba_parken_legacy_20261126.json');
const qs=quiz.sets.flatMap(s=>s.questions);
assert.equal(payload.id,ID);
assert.equal(original.id,ID);
assert.match(original.name,/Kuba-parken/);
assert.equal(quiz.sets.length,3);
assert.equal(qs.length,21);
assert.equal(legacy.questions.length,42);
assert.equal(quizManifest.sets.filter(row=>row.targetId===ID).length,3);
assert.ok(cardsManifest.collections.includes('kuba_parken_quizcard_v1.json'));
assert.equal(card.cards[0].targetId,ID);
assert.equal(card.cards[0].questions.length,10);
const registry = new Set(read('data/knowledge/knowledge_units.generated.json').units.map(unit => unit.knowledge_unit_id));
for (const question of [...qs, ...legacy.questions]) {
 assert.ok(question.knowledge_unit_ids.every(id => registry.has(id)), question.id);
}
assert.equal(new Set([...qs, ...legacy.questions].map(question => question.id)).size, 63);
assert.deepEqual(quiz.sets.map(set => set.questions.length), [7, 7, 7]);
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
const out='artifacts/kuba_parken-3x7-real-app';fs.mkdirSync(out,{recursive:true});
const modes=[
 {name:'phone-chromium-390',engine:chromium,width:390,height:844,mobile:true},
 {name:'ipad-webkit-834',engine:webkit,width:834,height:1112,mobile:true},
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
   page.on('pageerror', error => {
    const message = String(error.message);
    // The external map label glyphs are outside this PlaceCard and Fagverk test.
    const cartoGlyphCorsError = mode.engine === webkit &&
     /tiles\.basemaps\.cartocdn\.com\/[^\s]*\/fonts\/[^\s]+\.pbf due to access control checks\./.test(message);
    if (cartoGlyphCorsError) {
     console.warn('External CARTO glyph request blocked in WebKit:', message);
     return;
    }
    errors.push(message);
   });
   await page.goto(base+'/index.html?hgTest=1#/place/'+ID,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(id=>window.__HG_APP_READY__===true &&
    window.__HG_ROUTER_STARTED__===true &&
    document.querySelector('#placeCard')?.dataset.currentPlaceId===id,
    ID,{timeout:90000});
   assert.match(await page.locator('#pcTitle').innerText(), /Kuba-parken/);
   await page.waitForFunction(() => [
    ['pcFrontImage', 'kuba_parken_front.webp'],
    ['pcHeaderImage', 'kuba_parken_landscape.webp']
   ].every(([id, file]) => {
    const image = document.getElementById(id);
    return image?.complete && image.naturalWidth > 0 && image.currentSrc.endsWith(file);
   }));
   await page.screenshot({path:out+'/'+mode.name+'-placecard.png',timeout:20000});
   await page.waitForFunction(()=>document.querySelector('#pcQuizCardContent')?.querySelector('.pc-rendered-quiz-card')&&
    document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card'),
    null,{timeout:50000});
   const front=page.locator('#pcFrontCardFlip');
   const bounds=await front.boundingBox();
   assert.ok(bounds&&bounds.width>0&&bounds.height>0);
   if(mode.engine===webkit) await front.tap({position:{x:bounds.width/2,y:bounds.height/2},timeout:15000});
   else await front.click({position:{x:22,y:Math.max(24,bounds.height-25)},timeout:15000});
   await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:14000});
   assert.equal(await page.locator('#pcQuizCardContent li').count(),10,'Ten QuizCard questions must render');
   const cardText=await page.locator('#pcQuizCardContent').innerText();
   for(const target of card.cards[0].questions)assert.ok(cardText.includes(target.question),target.question);
   await page.screenshot({path:out+'/'+mode.name+'-quizcard.png',timeout:20000});
   await page.locator('#pcQuizExpandBtn').click({timeout:16000});
   await page.locator('#pcQuizExpanded').waitFor({state:'visible',timeout:16000});
   assert.equal(await page.locator('#pcQuizExpandedContent li').count(),10);
   await page.screenshot({path:out+'/'+mode.name+'-expanded.png',timeout:20000});
   await page.locator('#pcQuizExpandedClose').click();
   await page.waitForFunction(()=>document.querySelector('#pcQuizExpanded')?.hidden===true,null,{timeout:10000});
   if(mode.engine===webkit) await front.tap({position:{x:bounds.width/2,y:bounds.height/2},timeout:12000});
   else await front.click({position:{x:22,y:Math.max(24,bounds.height-25)},timeout:12000});
   await page.locator('#pcQuiz').click({timeout:16000});
   await page.waitForFunction(id=>location.hash.startsWith('#/quiz/'+id),ID,{timeout:30000});
   await page.waitForFunction(()=>document.querySelector('#quizChoices button:not(:disabled)'),null,{timeout:40000});
   const visible=(await page.locator('#quizQuestion').innerText()).trim();
   assert.ok(qs.some(q=>q.question===visible),mode.name+': not from the canonical 3x7 quiz: '+visible);
   await page.screenshot({path:out+'/'+mode.name+'-fullquiz.png',timeout:20000});
   const completed = new Set();
   for (let index = 0; index < 7; index++) {
    const questionText = (await page.locator('#quizQuestion').innerText()).trim();
    const source = qs.find(question => question.question === questionText);
    assert.ok(source, questionText);
    assert.ok(!completed.has(source.id), questionText);
    completed.add(source.id);
    const answer = page.locator('#quizChoices button:not(:disabled)').getByText(source.options[source.answerIndex], {exact:true});
    await answer.click();
    await page.locator('#quizChoices button.correct').waitFor({state:'visible'});
    if (index < 6) {
     await page.waitForFunction(previous => document.querySelector('#quizQuestion')?.textContent.trim() !== previous &&
      document.querySelector('#quizChoices button:not(:disabled)'), questionText);
    }
   }
   await page.goto(base + '/fagverk-sted.html?place=' + ID, {waitUntil:'domcontentloaded'});
   const article = page.locator('#fagverkPlaceArticle > p');
   await article.first().waitFor({state:'visible'});
   assert.equal(await article.count(), 4);
   assert.match(await page.locator('#fagverkPlaceArticle').innerText(), /gassklokke/);
   assert.equal(await page.locator('#fagverkPlaceLenses a').count(), 3);
   await page.screenshot({path:out+'/'+mode.name+'-fagverk.png',timeout:20000});
   assert.deepEqual(errors,[],mode.name+': unexpected page errors');
   console.log('PASS '+mode.name+' real Kuba-parken PlaceCard / two photographs / Fagverk / 10-item QuizCard / source-exact 3x7 fullquiz and one seven-question set played');
  }finally{
   await context.close();await browser.close();
  }
 }
}finally{await new Promise(resolve=>server.close(resolve));}
