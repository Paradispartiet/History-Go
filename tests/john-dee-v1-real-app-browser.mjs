#!/usr/bin/env node
// John Dee v1: real native app, no mocked DataHub, PlaceCard, images, or Fagverk.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const id = 'john_dee';
const data = JSON.parse(fs.readFileSync('data/runtime/place-open/john_dee.json','utf8'));
const collection = JSON.parse(fs.readFileSync('data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json','utf8'));
const card = collection.cards.find(c => c.targetId === id);
assert.ok(card && card.questions.length === 10);
assert.equal(data.people.length,1);
assert.equal(data.place.fagverk?.status,'curated');
const out = 'artifacts/john_dee-v1-app-qa';
fs.mkdirSync(out,{recursive:true});

const mime = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff':'font/woff','.woff2':'font/woff2'};
const server = http.createServer((req,res) => {
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file = path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return}
  res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const reports=[];
let browser;
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for (const width of [390,1440]) {
  const viewport={width,height:width===390?844:1000};
  const context=await browser.newContext({viewport,isMobile:width===390,hasTouch:width===390});
  await context.addInitScript(()=>{
   localStorage.setItem('hg_onboarding_shown_v1','1');
   localStorage.setItem('HG_TEST_MODE','1');
  });
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(e.message));
  const entry={place_id:id,width,checks:[]};
  try {
   await page.goto(base+'/index.html?hgTest=1#/place/'+id,{waitUntil:'domcontentloaded',timeout:75000});
   await page.waitForFunction(id=>window.__HG_APP_READY__===true && window.__HG_ROUTER_STARTED__===true && document.getElementById('placeCard')?.dataset?.currentPlaceId===id,id,{timeout:75000});
   // Open again using the actual shipped PlaceCard API to ensure stable hydration.
   await page.evaluate(place=>window.openPlaceCard(place),data.place);
   await page.waitForFunction(()=>document.getElementById('pcFrontImage')?.complete && document.getElementById('pcFrontImage')?.naturalWidth>0,null,{timeout:25000});
   const photo=await page.locator('#pcFrontImage').evaluate(img=>({src:img.currentSrc||img.src,width:img.naturalWidth,height:img.naturalHeight}));
   assert.ok(photo.src.includes('john_dee_front_portrait.webp'),'Wrong John Dee portrait');
   entry.checks.push('Portrait WebP decoded in real PlaceCard');

   await page.waitForFunction(title=>{const el=document.getElementById('pcQuizCardContent');return !el?.hidden && el?.querySelector('h3')?.textContent===title && el.querySelectorAll('.pc-rendered-quiz-list > li').length===10},card.title,{timeout:20000});
   const flip=page.locator('#pcFrontCardFlip');
   await page.evaluate(()=>document.querySelector('#hgOnboardingModal .hg-onb-close')?.click());
   await flip.scrollIntoViewIfNeeded();
   // The card may extend beyond a mobile viewport; click the first unobstructed point.
   const point=await flip.evaluate(el=>{
     const r=el.getBoundingClientRect(),minY=Math.max(r.top,0),maxY=Math.min(r.bottom,innerHeight);
     for(const fraction of [0.5,0.75,0.25,0.9,0.1]){
       const y=minY+(maxY-minY)*fraction;
       for(const x of [r.left+20,r.left+r.width/2]){
         if(el.contains(document.elementFromPoint(x,y)))return {x:x-r.left,y:y-r.top};
       }
     }
     return null;
   });
   assert.ok(point,'PlaceCard flip not clickable');
   await flip.click({position:point,timeout:20000});
   assert.equal(await flip.evaluate(el=>el.classList.contains('is-flipped')),true);
   await page.locator('#pcQuizExpandBtn').click({timeout:20000});
   const expanded=page.locator('#pcQuizExpanded');
   assert.equal(await expanded.evaluate(el=>el.hidden),false);
   const list=await page.locator('#pcQuizExpandedContent .pc-rendered-quiz-list > li').allTextContents();
   assert.equal(list.length,10);
   for(const [i,q] of card.questions.entries())assert.ok(list[i].includes(q.question),q.sourceQuestionId);
   const keys=await page.locator('#pcQuizExpandedContent .pc-rendered-quiz-answer-key').textContent();
   for(const q of card.questions)assert.ok(keys.includes(q.answer),q.sourceQuestionId+' answer');
   await expanded.screenshot({path:path.join(out,'john_dee-quizcard-'+width+'.png')});
   entry.checks.push('Real card flip and ten QuizCard questions');

   await page.keyboard.press('Escape');
   assert.equal(await expanded.evaluate(el=>el.hidden),true);
   const people=page.locator('#pcPeopleIcon');
   await people.waitFor({state:'visible',timeout:15000});
   assert.equal(await people.getAttribute('aria-hidden'),'false');
   await people.click({timeout:15000});
   const popup=page.locator('.hg-popup.placecard-round-popup.visible');
   await popup.waitFor({state:'visible',timeout:15000});
   const pplText=await popup.textContent();
   for(const name of ['Bo Terje Hustoft'])assert.ok(pplText.includes(name),name+' not present in People popup');
   entry.checks.push('People preview opens the documented John Dee booking professional');
   await page.screenshot({path:path.join(out,'john_dee-placecard-'+width+'.png'),fullPage:true});
   await popup.locator('[data-close-popup]').click({timeout:10000});
   assert.equal(pageErrors.length,0,'JS errors on PlaceCard: '+pageErrors.join(' | '));

   const fag=await context.newPage();
   const fagErrors=[];
   fag.on('pageerror',e=>fagErrors.push(e.message));
   try {
    await fag.goto(base+'/fagverk-sted.html?place='+id,{waitUntil:'domcontentloaded',timeout:75000});
    await fag.waitForFunction(()=>document.getElementById('fagverkPlaceContent')?.hidden===false,null,{timeout:45000});
    assert.ok((await fag.locator('#fagverkPlaceTitle').innerText()).includes('John Dee'));
    assert.equal(await fag.locator('#fagverkPlaceArticle > *').count(),3);
    assert.ok((await fag.locator('#fagverkPlaceQuestions li').count())>=4);
    assert.ok((await fag.locator('#fagverkPlaceLenses a').count())>=3);
    assert.ok((await fag.locator('#fagverkPlaceChapters a').count())>=2);
    assert.ok(await fag.locator('#fagverkPlaceUnfinished').isHidden());
    assert.ok(await fag.locator('#fagverkPlaceError').isHidden());
    assert.equal(fagErrors.length,0,'Fagverk JavaScript errors: '+fagErrors.join(' | '));
    await fag.screenshot({path:path.join(out,'john_dee-fagverk-'+width+'.png'),fullPage:true});
    entry.checks.push('Native Fagverk page, article, lenses and live chapters');
   } finally { await fag.close(); }
   entry.status='PASS';
   console.log('PASS John Dee '+width+'px: '+entry.checks.join(', '));
  } catch(err) {
   entry.status='FAIL';
   entry.error=String(err?.stack||err);
   await page.screenshot({path:path.join(out,'john_dee-failed-'+width+'.png'),fullPage:true}).catch(()=>{});
   console.error('FAIL John Dee '+width+'px: '+entry.error);
  } finally {
   reports.push(entry);
   await context.close();
  }
 }
} finally {
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({scope:'Real app on 390 and 1440; no mocks; fullquiz separately',reports},null,2)+'\n');
}
assert.deepEqual(reports.map(r=>r.status),['PASS','PASS'],'Both viewports must pass John Dee PlaceCard/Fagverk QA');
