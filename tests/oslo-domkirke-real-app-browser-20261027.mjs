#!/usr/bin/env node
// Real History GO browser verification: Oslo domkirke PlaceCard, images, QuizCard, quiz and Fagverk.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const ROOT=process.cwd();
const id='oslo_domkirke';
const place=JSON.parse(fs.readFileSync('data/places/by/oslo/oslo_domkirke/oslo_domkirke.json','utf8'));
const live=JSON.parse(fs.readFileSync('data/runtime/place-open/oslo_domkirke.json','utf8')).place;
const quiz=JSON.parse(fs.readFileSync('data/quiz/historie/oslo_domkirke_sets.json','utf8'));
const cards=JSON.parse(fs.readFileSync('data/quizcards/historie/oslo_domkirke_quizkort_v1.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('data/quiz/manifest.json','utf8'));
const byQuestion=new Map(quiz.sets.flatMap(set=>set.questions).map(q=>[q.question,q]));
assert.equal(place.id,id);
assert.equal(live.id,id);
assert.equal(live.frontImage,place.frontImage,'Stale Place-open front image');
assert.equal(live.cardImage,place.cardImage,'Stale Place-open QuizCard image');
assert.equal(place.fagverk.article.length,3);
assert.equal(cards.cards[0].questions.length,10);
assert.equal(manifest.sets.filter(entry=>entry.targetId===id).length,1);
assert.equal(byQuestion.size,21);
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript',
 '.json':'application/json','.css':'text/css','.png':'image/png',
 '.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp',
 '.svg':'image/svg+xml','.woff2':'font/woff2','.gif':'image/gif'};
const server=http.createServer((req,res)=>{
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}
 catch{res.writeHead(400);res.end();return;}
 const full=path.resolve(ROOT,'.'+(pathname==='/'?'/index.html':pathname));
 if(!full.startsWith(ROOT+path.sep)||!fs.existsSync(full)||!fs.statSync(full).isFile()){
  res.writeHead(404);res.end('not found');return;
 }
 res.writeHead(200,{'content-type':mime[path.extname(full).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(full).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const folder=path.join(ROOT,'artifacts','oslo-domkirke-browser');
fs.mkdirSync(folder,{recursive:true});
let browser;
const results=[];
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [width,height,mobile] of [[390,844,true],[1440,960,false]]){
  let context,page;
  const errors=[];
  try{
   context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO'});
   await context.addInitScript(()=>{
    localStorage.setItem('hg_onboarding_shown_v1','1');
    localStorage.setItem('HG_TEST_MODE','1');
   });
   page=await context.newPage();
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+'/index.html?hgTest=1#/place/oslo_domkirke',{waitUntil:'domcontentloaded',timeout:80000});
   await page.waitForFunction(target=>window.__HG_APP_READY__===true
     && window.__HG_ROUTER_STARTED__===true
     && document.querySelector('#placeCard')?.dataset.currentPlaceId===target,
     id,{timeout:85000});
   await page.waitForFunction(()=>document.querySelector('#pcQuizCardContent .pc-rendered-quiz-card')
     && document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card'),
     null,{timeout:50000});
   assert.equal(await page.locator('#pcQuizCardContent li').count(),10,'QuizCard item count');
   await page.waitForFunction(()=>{const img=document.querySelector('#pcFrontImage');return img?.complete && img.naturalWidth>0;},null,{timeout:25000});
   assert.match((await page.locator('#pcTitle').innerText()).trim(),/Oslo domkirke/i);
   if(mobile){
    const overflow=await page.locator('#pcTitle').evaluate(el=>el.scrollWidth>el.clientWidth+3);
    assert.equal(overflow,false,'Mobile title clipping');
   }
   await page.locator('#placeCard').screenshot({path:path.join(folder,'oslo-domkirke-'+width+'-placecard.png')});
   const flip=page.locator('#pcFrontCardFlip'),rect=await flip.boundingBox();
   assert.ok(rect,'Missing QuizCard flip surface');
   await flip.click({position:{x:20,y:Math.min(rect.height-20,80)},timeout:14000});
   await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:15000});
   await page.waitForTimeout(530);
   await page.locator('#pcQuizExpandBtn').click({timeout:14000});
   await page.locator('#pcQuizExpanded').waitFor({state:'visible',timeout:15000});
   assert.equal(await page.locator('#pcQuizExpandedContent li').count(),10,'Expanded QuizCard count');
   await page.locator('#pcQuizExpandedClose').click();
   await page.locator('#pcQuiz').click({timeout:16000});
   await page.waitForFunction(target=>location.hash.startsWith('#/quiz/'+target),id,{timeout:30000});
   await page.waitForFunction(()=>document.querySelector('#quizChoices button:not(:disabled)'),null,{timeout:30000});
   const question=(await page.locator('#quizQuestion').innerText()).trim();
   const source=byQuestion.get(question);
   assert.ok(source,'Unregistered quiz question: '+question);
   const choices=await page.locator('#quizChoices button').allTextContents();
   assert.ok(choices.some(answer=>answer.includes(source.answer)),'Missing expected answer in rendered quiz');
   assert.deepEqual(errors,[],'PlaceCard or quiz runtime errors');
   await page.goto(base+'/fagverk-sted.html?place='+id,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.getElementById('fagverkPlaceContent')?.hidden===false,null,{timeout:45000});
   assert.ok(await page.locator('#fagverkPlaceUnfinished').isHidden(),'Fagverk incomplete fallback');
   assert.ok(await page.locator('#fagverkPlaceArticleSection').isVisible(),'Fagverk article absent');
   assert.ok(await page.locator('#fagverkPlaceError').isHidden(),'Fagverk error rendered');
   assert.deepEqual(errors,[],'Fagverk runtime errors');
   results.push({id,width,status:'passed',question});
   console.log('PASS Oslo domkirke '+width+' PlaceCard/QuizCard/fullquiz/Fagverk');
  }catch(e){
   const message=String(e?.stack||e).slice(0,2200);
   results.push({id,width,status:'failed',message});
   console.error('FAIL Oslo domkirke '+width+' '+message);
   if(page)await page.screenshot({path:path.join(folder,'oslo-domkirke-'+width+'-failure.png'),fullPage:true,timeout:15000}).catch(()=>{});
  }finally{await page?.close().catch(()=>{});await context?.close().catch(()=>{});}
 }
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
 fs.writeFileSync(path.join(folder,'results.json'),JSON.stringify({id,results},null,2)+'\n');
}
const failures=results.filter(x=>x.status==='failed');
console.log(JSON.stringify({checks:results.length,passed:results.length-failures.length,failed:failures.length}));
assert.equal(results.length,2);
assert.equal(failures.length,0,failures.map(x=>x.width+': '+x.message).join('\n'));
