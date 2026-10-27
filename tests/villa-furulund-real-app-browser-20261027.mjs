#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const ROOT=process.cwd();
const IDS=['villa_furulund'];
const placePaths={villa_furulund:'data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_05/villa_furulund.json'};
const targets=IDS;
const manifest=JSON.parse(fs.readFileSync('data/quiz/manifest.json','utf8'));
assert.equal(IDS.length,1);
assert.equal(new Set(IDS).size,1);

const quizById=new Map();
for(const id of targets){
 const files=[...new Set([...(manifest.sets||[]),...(manifest.targets||[])]
   .filter(entry=>entry.targetId===id && entry.file?.startsWith('data/quiz/'))
   .map(entry=>entry.file))];
 assert.ok(files.length>0,id+' is not registered in the quiz manifest');
 const questions=files.flatMap(file=>{
   const quiz=JSON.parse(fs.readFileSync(file,'utf8'));
   return (quiz.sets||[]).flatMap(set=>set.questions||[]).concat(quiz.questions||[]);
 });
 assert.ok(questions.length>=10,id+' missing a usable fullquiz');
 quizById.set(id,new Map(questions.map(q=>[q.question,q])));
 const relative=placePaths[id];
 assert.ok(relative,id+' missing canonical place JSON');
 const place=JSON.parse(fs.readFileSync(relative,'utf8'));
 const live=JSON.parse(fs.readFileSync('data/runtime/place-open/'+id+'.json','utf8')).place;
 assert.equal(place.id,id);
 assert.equal(live.id,id);
 assert.equal(live.image||live.cardImage,place.image||place.cardImage,id+' stale Place-open image');
 assert.ok(place.fagverk?.article?.length>=3,id+' missing Fagverk article');
}

const mime={
 '.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json',
 '.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg',
 '.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.gif':'image/gif'
};
const server=http.createServer((req,res)=>{
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}
 catch{res.writeHead(400);res.end();return;}
 const resolved=path.resolve(ROOT,'.'+(pathname==='/'?'/index.html':pathname));
 if(!resolved.startsWith(ROOT+path.sep)||!fs.existsSync(resolved)||!fs.statSync(resolved).isFile()){
   res.writeHead(404);res.end('not found');return;
 }
 res.writeHead(200,{'content-type':mime[path.extname(resolved).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(resolved).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const reportDir=path.join(ROOT,'artifacts','villa-furulund-browser');
fs.mkdirSync(reportDir,{recursive:true});
let browser;
const results=[];
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const id of targets)for(const [width,height,mobile] of [[390,844,true],[1440,960,false]]){
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
   await page.goto(base+'/index.html?hgTest=1#/place/'+id,{waitUntil:'domcontentloaded',timeout:80000});
   await page.waitForFunction(target=>window.__HG_APP_READY__===true
     && window.__HG_ROUTER_STARTED__===true
     && document.querySelector('#placeCard')?.dataset.currentPlaceId===target,
     id,{timeout:85000});
   await page.waitForFunction(()=>document.querySelector('#pcQuizCardContent .pc-rendered-quiz-card')
     && document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card'),
     null,{timeout:50000});
   assert.equal(await page.locator('#pcQuizCardContent li').count(),10,id+'/'+width+' QuizCard count');
   await page.waitForFunction(()=>{const img=document.querySelector('#pcFrontImage');return img?.complete && img.naturalWidth>0;},null,{timeout:20000});
   const title=await page.locator('#pcTitle').innerText();
   assert.ok(title.trim(),id+'/'+width+' missing PlaceCard title');
   if(mobile){
     const overflow=await page.locator('#pcTitle').evaluate(el=>el.scrollWidth>el.clientWidth+3);
     assert.ok(!overflow,id+' mobile title overflow');
   }
   await page.locator('#placeCard').screenshot({path:path.join(reportDir,id+'-'+width+'-placecard.png')});
   const flip=page.locator('#pcFrontCardFlip'),bb=await flip.boundingBox();
   assert.ok(bb,id+'/'+width+' flip control not visible');
   await flip.click({position:{x:20,y:Math.min(bb.height-20,80)},timeout:14000});
   await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:15000});
   // Wait for the actual 420 ms CSS flip to complete before the real pointer click.
   await page.waitForTimeout(530);
   await page.locator('#pcQuizExpandBtn').click({timeout:14000});
   await page.locator('#pcQuizExpanded').waitFor({state:'visible',timeout:15000});
   assert.equal(await page.locator('#pcQuizExpandedContent li').count(),10,id+' expanded quizcard missing answers');
   await page.locator('#pcQuizExpandedClose').click();
   await page.locator('#pcQuiz').click({timeout:16000});
   await page.waitForFunction(target=>location.hash.startsWith('#/quiz/'+target),id,{timeout:30000});
   await page.waitForFunction(()=>document.querySelector('#quizChoices button:not(:disabled)'),null,{timeout:30000});
   const question=(await page.locator('#quizQuestion').innerText()).trim();
   const sourceQ=quizById.get(id).get(question);
   assert.ok(sourceQ,id+' displayed quiz question absent from registered fullquiz: '+question);
   const choices=await page.locator('#quizChoices button').allTextContents();
   assert.ok(choices.some(text=>text.includes(sourceQ.answer)),id+' correct answer missing from app');
   assert.deepEqual(errors,[],id+'/'+width+' JavaScript errors in PlaceCard/quiz');
   await page.goto(base+'/fagverk-sted.html?place='+id,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.getElementById('fagverkPlaceContent')?.hidden===false,null,{timeout:45000});
   assert.ok(await page.locator('#fagverkPlaceUnfinished').isHidden(),id+' Fagverk fallback active');
   assert.ok(await page.locator('#fagverkPlaceArticleSection').isVisible(),id+' Fagverk article absent');
   assert.ok(await page.locator('#fagverkPlaceError').isHidden(),id+' Fagverk rendered error');
   assert.deepEqual(errors,[],id+'/'+width+' JavaScript errors in app');
   results.push({id,width,status:'passed',question});
   console.log('PASS',id,width,'PlaceCard/QuizCard/fullquiz/Fagverk');
  }catch(e){
   const message=String(e?.stack||e).slice(0,2000);
   results.push({id,width,status:'failed',message});
   console.error('FAIL',id,width,message);
   if(page)await page.screenshot({path:path.join(reportDir,id+'-'+width+'-failure.png'),fullPage:true,timeout:12000}).catch(()=>{});
  }finally{await page?.close().catch(()=>{});await context?.close().catch(()=>{});}
 }
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
 fs.writeFileSync(path.join(reportDir,'results.json'),JSON.stringify({targets:IDS,results},null,2)+'\n');
}
const failures=results.filter(x=>x.status==='failed');
console.log(JSON.stringify({targets:IDS,checks:results.length,passed:results.length-failures.length,failed:failures.length}));
assert.equal(results.length,2);
assert.equal(failures.length,0,failures.map(x=>x.id+'/'+x.width+': '+x.message).join('\n'));
