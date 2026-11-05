#!/usr/bin/env node
// Real-app PlaceCard QuizCard browser verification. Always invoke in disposable
// worktree with a TEMPORARY QuizCard manifest row. Never approves a front photo.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const ROOT=process.cwd(), ID='minneparken_gamlebyen';
const quizCardFile='minneparken_gamlebyen_quizcard_v1.json';
const active=JSON.parse(fs.readFileSync('data/quizcards/historie/manifest.json','utf8'));
assert.ok(active.collections.includes(quizCardFile), 'Test must inject QuizCard into DISPOSABLE manifest only');
const collection=JSON.parse(fs.readFileSync('data/quizcards/historie/'+quizCardFile,'utf8'));
const card=collection.cards.find(row=>row.targetId===ID);
assert.ok(card,'Minneparken QuizCard missing');
assert.equal(card.questions.length,10);
assert.equal(card.answerKey.length,10);
const quiz=JSON.parse(fs.readFileSync('data/quiz/historie/minneparken_gamlebyen_sets.json','utf8'));
const fromQuiz=new Map(quiz.sets.flatMap(s=>s.questions).map(q=>[q.id,q]));
for(const q of card.questions) {
 const original=fromQuiz.get(q.sourceQuestionId);
 assert.ok(original,q.sourceQuestionId);
 for(const key of ['question','answer','answerIndex','options','primary_knowledge_unit_id','knowledge_unit_ids'])
   assert.deepEqual(q[key],original[key],q.sourceQuestionId+' / '+key);
}
const output=path.join(ROOT,'artifacts','minneparken-quizcard-real-browser');
fs.mkdirSync(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 let url;try{url=new URL(req.url,'http://127.0.0.1')}catch{res.writeHead(400);res.end();return;}
 const pathname=decodeURIComponent(url.pathname),file=path.resolve(ROOT,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port;
let browser;
const results=[];
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const profiles=[{name:'desktop',viewport:{width:1440,height:960}},{name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}];
 for(const profile of profiles){
  const context=await browser.newContext({viewport:profile.viewport,isMobile:!!profile.isMobile,hasTouch:!!profile.hasTouch});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1');});
  const page=await context.newPage(),pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(String(error.message||error)));
  try{
   await page.goto(url+'/index.html?hgTest=1#/place/'+ID,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(id=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId===id,ID,{timeout:90000});
   await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card')&&
     Boolean(document.querySelector('#pcQuizCardContent .pc-rendered-quiz-card')),null,{timeout:60000});
   const flip=page.locator('#pcFrontCardFlip');
   assert.equal(await flip.count(),1);
   assert.equal(await page.locator('#pcQuizCardContent .pc-rendered-quiz-list li').count(),10);
   const cardText=await page.locator('#pcQuizCardContent').textContent(); // Back-face is not visually exposed until flipped
   assert.match(cardText,/Minneparken/);
   assert.match(cardText,/Historiequiz/);
   for(const question of card.questions){assert.ok(cardText.includes(question.question),'Missing rendered QuizCard question: '+question.number);}
   for(const answer of card.answerKey){assert.ok(cardText.includes(answer.answer),'Missing answer: '+answer.number);}
   const placeRecord=JSON.parse(fs.readFileSync('data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_11/minneparken_gamlebyen.json','utf8'));
   let historicalCaption=null;
   if(placeRecord.imageMeta?.historicalOnly===true){
     await page.waitForFunction(()=>{
       const img=document.querySelector('#pcFrontImage');
       return Boolean(img?.getAttribute('src')&&img.complete&&img.naturalWidth>0);
     },null,{timeout:15000});
     historicalCaption=await page.locator('.pc-photo-caption').first().innerText();
     assert.match(historicalCaption,/2007/,'Historic photo must show capture year to players');
     assert.match(historicalCaption,/2024/,'Historic photo must explain why it is not the 2024/2026 state');
     const captionBox=await page.locator('.pc-photo-caption').first().boundingBox();
     const heroQuizBox=await page.locator('#pcStatusBar > .pc-progress-status-line').first().boundingBox();
     assert.ok(captionBox&&heroQuizBox,'Both dated caption and quiz action must have on-screen geometry');
     assert.ok(captionBox.y+captionBox.height+5 <= heroQuizBox.y,
       'Historical photo caption must not overlap the hero quiz action: '+JSON.stringify({captionBox,heroQuizBox}));
   }
   const imageState=await page.locator('#pcFrontImage').evaluate(img=>({
     src:img.getAttribute('src'),complete:img.complete,naturalWidth:img.naturalWidth,
     hasFrontImage:Boolean(img.currentSrc&&img.naturalWidth>0)
   }));
   await page.screenshot({path:path.join(output,profile.name+'-front-historical-photo.png'),fullPage:true});
   assert.equal(await flip.evaluate(el=>el.classList.contains('is-flipped')),false);
   await flip.click({timeout:15000});
   await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:15000});
   const visibleAfterFlip=await page.locator('#pcQuizCardContent').innerText();
   assert.match(visibleAfterFlip,/Minneparken/,'QuizCard text must be visibly rendered after a real flip');
   for(const question of card.questions){assert.ok(visibleAfterFlip.includes(question.question),'Not visible after flipping: '+question.number);}
   await page.screenshot({path:path.join(output,profile.name+'-quizcard-flipped.png'),fullPage:true});
   await page.locator('#pcQuizExpandBtn').click({timeout:15000});
   await page.waitForFunction(()=>document.querySelector('#pcQuizExpanded')?.hidden===false,null,{timeout:15000});
   assert.equal(await page.locator('#pcQuizExpandedContent').getAttribute('data-mode'),'rendered');
   assert.equal(await page.locator('#pcQuizExpandedContent .pc-rendered-quiz-list li').count(),10);
   await page.screenshot({path:path.join(output,profile.name+'-quizcard-expanded.png'),fullPage:true});
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#pcQuizExpanded').evaluate(el=>el.hidden),true,'Escape should close expanded view');
   await flip.focus();
   await page.keyboard.press('Enter');
   assert.equal(await flip.evaluate(el=>el.classList.contains('is-flipped')),false,'Enter should flip to front');
   await page.keyboard.press('Space');
   assert.equal(await flip.evaluate(el=>el.classList.contains('is-flipped')),true,'Space should flip to quiz back');
   assert.deepEqual(pageErrors,[],'Uncaught browser errors');
   results.push({profile:profile.name,placeId:ID,questions:10,correctAnswers:card.answerKey.length,flipped:true,expanded:true,escapeClosed:true,keyboardFlip:true,frontImage:imageState,historicalCaption,pageErrors});
   console.log('PASS Minneparken real PlaceCard QuizCard '+profile.name+': 10/10 rendered, flip, expand, Escape, keyboard');
  }catch(error){
   await page.screenshot({path:path.join(output,profile.name+'-quizcard-failed.png'),fullPage:true}).catch(()=>{});
   fs.writeFileSync(path.join(output,profile.name+'-quizcard-errors.json'),JSON.stringify({error:String(error),pageErrors},null,2));
   throw error;
  }finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify({status:'passed',scope:'isolated-real-app-quizcard-no-production-activation',results},null,2)+'\n');
