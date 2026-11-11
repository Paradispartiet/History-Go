#!/usr/bin/env node
// Native browser evidence for six Oslo Politikk places in PR #6579. Not v1 approval.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';
const root=process.cwd(),ids=['hoyesteretts_hus','folkets_hus_oslo','hoyres_hus','hoyblokka','victoria_terrasse','y_blokka'];
const out=path.resolve('artifacts/oslo-politikk-six-browser');fs.mkdirSync(out,{recursive:true});
const cards=JSON.parse(fs.readFileSync('data/quizcards/politikk/topp10_politikk_oslo_sentrum_six_pr6579.json','utf8')).cards;
async function positionQuizCard(page){
 const result=await page.locator('#pcFrontCardFlip').evaluate(async el=>{
  const body=el.closest('.pc-body');
  if(!body)throw new Error('QuizCard has no scroll body');
  const rect=e=>{const r=e?.getBoundingClientRect();return r?{top:r.top,bottom:r.bottom,left:r.left,width:r.width,height:r.height}:null;};
  const geometry=()=>({card:rect(el),hero:rect(document.querySelector('#placeCard .pc-sheet-hero')),body:rect(body),nav:rect(document.querySelector('#placeCard > [data-hg-place-sheet-nav="1"]')),scrollTop:body.scrollTop});
  const before=geometry();
  for(let i=0;i<15;i++){
   // The navigation is BELOW the reading pane, not an upper sticky header.
   // Position before the first real click as well as after the flip: native
   // auto-scroll can otherwise put the target behind the retained photo.
   const g=geometry(),top=Math.max(g.body.top,g.hero?.bottom||0)+12;
   body.scrollTop+=g.card.top-top;
   await new Promise(resolve=>setTimeout(resolve,50));
   const next=geometry(),upper=Math.max(next.body.top,next.hero?.bottom||0);
   const lower=Math.min(next.body.bottom,next.nav?.top??innerHeight,innerHeight);
   const x=next.card.left+20,y=next.card.top+Math.max(24,next.card.height-24);
   const hit=document.elementFromPoint(x,y);
   if(next.card.top>=upper&&next.card.bottom<=lower&&hit?.closest('#pcFrontCardFlip')===el)return {before,after:next};
  }
  throw new Error('QuizCard is not fully readable and pointer-reachable: '+JSON.stringify({before,after:geometry()}));
 });
 return result;
}
const places={};
for(const id of ids){
 const place=JSON.parse(fs.readFileSync('data/runtime/place-open/'+id+'.json','utf8')).place;places[id]=place;
 assert.equal(place.id,id);assert.equal(place.fagverk?.status,'curated');
 assert.equal(place.fagverk?.schema,'history_go_place_fagverk_v2');
 for(const key of ['image','frontImage']){
  assert.ok(place[key]?.endsWith('.webp')&&fs.statSync(place[key]).size>8000,id+' bad photo '+key);
  assert.ok(place[key+'Meta']?.credit&&place[key+'Meta']?.license&&place[key+'Meta']?.sourcePage?.startsWith('https://'),id+' photo rights missing');
 }
 assert.notEqual(place.image,place.frontImage);
 if(id==='y_blokka'||id==='hoyblokka'){
  assert.equal(place.frontImageMeta.historicalOnly,true);assert.match(place.frontImageMeta.historicalCaption,/2008/);
 }
 const card=cards.find(x=>x.targetId===id);
 assert.ok(card&&card.questionCount===10&&card.questions.length===10);
 const quiz=JSON.parse(fs.readFileSync('data/quiz/politikk/'+id+'_sets.json','utf8'));
 assert.equal(quiz.sets.length,3);assert.ok(quiz.sets.every(s=>s.questions.length===7));
 const qmap=new Map(quiz.sets.flatMap(s=>s.questions.map(q=>[q.quiz_id,q])));
 for(const q of card.questions){
  const source=qmap.get(q.sourceQuizId);
  assert.ok(source,id+' source quiz not found: '+q.sourceQuizId);
  assert.equal(q.question,source.question);assert.deepEqual(q.options,source.options);
  assert.equal(q.answer,source.answer);assert.equal(q.answerIndex,source.answerIndex);
 }
}
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(route==='/'?'/index.html':route));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port,report={scope:ids,app:'native',v1Approved:false,checks:[],errors:[]};
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [label,width,height,mobile] of [['mobile',390,844,true],['desktop',1440,1000,false]]){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile});
  await ctx.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1')});
  const page=await ctx.newPage();const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e.message||e)));
  for(const id of ids){
   pageErrors.length=0;
   const item={place:id,viewport:label,placeCard:false,photo:false,quizCard:false,fagverk:false,historicalYearVisible:null,problems:[]};
   try{
    await page.goto(base+'/index.html?hgTest=1#/place/'+id,{waitUntil:'domcontentloaded',timeout:65000});
    await page.waitForFunction(x=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId===x,id,{timeout:70000});
    await page.waitForFunction(()=>document.querySelector('#pcHeaderImage')?.naturalWidth>0&&document.querySelector('#pcFrontImage')?.naturalWidth>0,null,{timeout:35000});
    const view=await page.evaluate(()=>({title:document.querySelector('#pcTitle')?.textContent||'',open:document.querySelector('#placeCard')?.classList.contains('is-open'),hero:document.querySelector('#pcHeaderImage')?.currentSrc||'',front:document.querySelector('#pcFrontImage')?.currentSrc||'',text:document.querySelector('#placeCard')?.innerText||''}));
    assert.ok(view.open&&view.title.trim());assert.ok(view.hero.includes(places[id].image)&&view.front.includes(places[id].frontImage));
    item.placeCard=true;item.photo=true;
    if(places[id].frontImageMeta.historicalOnly)item.historicalYearVisible=view.text.includes('2008');
    await page.screenshot({path:path.join(out,id+'-'+label+'-front.png')});
    if(places[id].frontImageMeta.historicalOnly){
     item.phase='historical-caption-after-scroll';
     await page.locator('#placeCard .pc-body').evaluate(el=>{el.scrollTop=240;el.dispatchEvent(new Event('scroll'));});
     await page.waitForFunction(()=>document.querySelector('#placeCard')?.classList.contains('is-original-photo-pinned'),null,{timeout:12000});
     await page.waitForFunction(()=>{const c=document.querySelector('#placeCard .pc-photo-caption'),shell=document.querySelector('#placeCard .pc-sheet-hero'),quiz=document.querySelector('#pcStatusBar > .pc-progress-status-line');if(!c||!shell||!quiz)return false;const a=c.getBoundingClientRect(),b=shell.getBoundingClientRect(),q=quiz.getBoundingClientRect();return a.width>0&&a.height>0&&a.top>=b.top&&a.bottom<=b.bottom&&a.top>=0&&a.bottom<=innerHeight&&a.bottom+5<=q.top;},null,{timeout:12000});
     await page.screenshot({path:path.join(out,id+'-'+label+'-historical-sticky.png')});
     await page.locator('#placeCard .pc-body').evaluate(el=>{el.scrollTop=0;el.dispatchEvent(new Event('scroll'));});
    }
    await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card')&&document.querySelector('#pcQuizCardContent .pc-rendered-quiz-card'),null,{timeout:35000});
    const flip=page.locator('#pcFrontCardFlip');
    item.phase='quizcard-position-before-click';
    item.quizBeforeClick=await positionQuizCard(page);
    const rect=await flip.boundingBox();
    assert.ok(rect?.height>75,'QuizCard zero height');
    item.phase='quizcard-flip';
    await flip.click({position:{x:20,y:Math.max(24,rect.height-24)},timeout:12000});
    await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:12000});
    assert.ok((await page.locator('.pc-card-face-back').innerText()).length>50);
    await flip.locator('.pc-card-flip-inner').evaluate(async el=>{
     await Promise.all(el.getAnimations().map(a=>a.finished));
    });
    item.phase='quizcard-position-after-flip';
    item.quizPosition=await positionQuizCard(page);
    await page.waitForFunction(()=>{
     const flip=document.querySelector('#pcFrontCardFlip'),inner=flip?.querySelector('.pc-card-flip-inner'),head=flip?.querySelector('.pc-rendered-quiz-head');
     if(!flip||!inner||!head)return false;
     const matrix=new DOMMatrix(getComputedStyle(inner).transform),r=head.getBoundingClientRect(),card=flip.getBoundingClientRect();
     const x=Math.max(card.left,r.left)+Math.min(card.width,r.width)/2,y=Math.max(card.top,r.top)+5;
     const hit=document.elementFromPoint(x,y);
     return matrix.m11 < -0.999 && r.width>0 && r.top>=card.top && r.top<card.bottom && y>0 && y<innerHeight && !!hit?.closest('.pc-card-face-back');
    },null,{timeout:12000});
    // Capture the bounded 3:4 card, not its overflowing 10-question descendant.
    await flip.screenshot({path:path.join(out,id+'-'+label+'-quizcard.png')});
    await page.screenshot({path:path.join(out,id+'-'+label+'-quizcard-viewport.png')});
    item.quizCard=true;
    item.phase='verified';
    if(places[id].frontImageMeta.historicalOnly)assert.equal(item.historicalYearVisible,true,id+' historical photo year missing from PlaceCard');
   }catch(e){
    item.problems.push('PlaceCard/QuizCard '+String(e).slice(0,300));
    item.quizFailure=await page.evaluate(()=>{
     const el=document.querySelector('#pcFrontCardFlip'),head=el?.querySelector('.pc-rendered-quiz-head'),inner=el?.querySelector('.pc-card-flip-inner');
     const rect=e=>{const r=e?.getBoundingClientRect();return r?{top:r.top,bottom:r.bottom,left:r.left,width:r.width,height:r.height}:null;};
     const r=head?.getBoundingClientRect(),hit=r?document.elementFromPoint(r.left+r.width/2,r.top+5):null;
     return {classes:el?.className,card:rect(el),head:rect(head),hero:rect(document.querySelector('#placeCard .pc-sheet-hero')),caption:rect(document.querySelector('#placeCard .pc-photo-caption')),scrollTop:document.querySelector('#placeCard .pc-body')?.scrollTop,transform:inner?getComputedStyle(inner).transform:null,hit:hit?.outerHTML.slice(0,500)};
    });
    await page.screenshot({path:path.join(out,id+'-'+label+'-failure.png')});
   }
   try{
    await page.goto(base+'/fagverk-sted.html?place='+id,{waitUntil:'domcontentloaded',timeout:55000});
    await page.waitForFunction(()=>document.querySelector('#fagverkPlaceContent')?.hidden===false,null,{timeout:35000});
    assert.ok((await page.locator('#fagverkPlaceTitle').innerText()).length>4);
    assert.ok((await page.locator('#fagverkPlaceLenses a').count())>=3);
    assert.equal(await page.locator('#fagverkPlaceError').isHidden(),true);
    item.fagverk=true;await page.screenshot({path:path.join(out,id+'-'+label+'-fagverk.png')});
   }catch(e){item.problems.push('Fagverk '+String(e).slice(0,300));}
   if(pageErrors.length)item.problems.push('JavaScript '+pageErrors.slice(0,3).join('; '));
   report.checks.push(item);if(item.problems.length)report.errors.push(item);
   console.log('SIX_PLACE_REAL_BROWSER',id,label,item.problems.length?'BLOCKED':'PASS');
  }
  await ctx.close();
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
report.status=report.errors.length?'BLOCKED':'BROWSER_PASS_EDITORIAL_REVIEW_PENDING';
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log('SIX_PLACE_BROWSER_SUMMARY',JSON.stringify({checks:report.checks.length,blocked:report.errors.length}));
if(report.errors.length)process.exitCode=1;
