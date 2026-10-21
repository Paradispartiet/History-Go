#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const root=process.cwd(),pid='maridalsvannet',out='reports/place-production';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const toText=v=>String(v||'');
const runtime=read('data/runtime/place-open/'+pid+'.json');
assert.equal(runtime.place?.id,pid,'Canonical runtime place-id must be Maridalsvannet');
const quiz=read('data/quiz/natur/maridalsvannet_sets.json');
const card=read('data/quizcards/natur/topp10_natur_maridalsvannet_20261021.json');
assert.equal(quiz.sets.reduce((n,s)=>n+s.questions.length,0),21,'full quiz must have 21 questions');
assert.equal(card.cards.find(c=>c.targetId===pid)?.questions.length,10,'QuizCard must have 10 questions');
const mime={'.css':'text/css','.js':'text/javascript','.json':'application/json','.mjs':'text/javascript','.html':'text/html','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff':'font/woff','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});res.end(fs.readFileSync(file));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const profiles=[{name:'mobile',w:390,h:844,isMobile:true,touch:true},{name:'desktop',w:1440,h:1000,isMobile:false,touch:false}];
const reports=[];let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const profile of profiles){
  const ctx=await browser.newContext({viewport:{width:profile.w,height:profile.h},isMobile:profile.isMobile,hasTouch:profile.touch});
  const page=await ctx.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1')});
  await page.goto(origin+'/index.html?hgTest=1#/place/'+pid,{waitUntil:'domcontentloaded',timeout:75000});
  await page.waitForFunction(id=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId===id,pid,{timeout:80000});
  await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card')&&document.querySelector('#pcQuizCardContent')?.textContent?.trim().length>20,null,{timeout:60000});
  await page.waitForFunction(()=>[...document.querySelectorAll('#placeCard img')].some(i=>(i.currentSrc||i.src||'').includes('maridalsvannet_front_portrait.webp')&&i.complete&&i.naturalWidth>0),null,{timeout:30000});
  const before=await page.evaluate(()=>({
   placeId:document.querySelector('#placeCard')?.dataset.currentPlaceId,
   cardTitle:document.querySelector('#pcTitle')?.textContent.trim(),
   overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),
   portraitImages:[...document.querySelectorAll('#placeCard img')].filter(i=>(i.currentSrc||i.src||'').includes('maridalsvannet_front_portrait.webp')).map(i=>({width:i.naturalWidth,height:i.naturalHeight,loaded:i.complete})),
  }));
  assert.equal(before.placeId,pid);
  assert.ok(before.portraitImages.some(i=>i.width>0),'Front portrait must load');
  assert.ok(before.overflow<=2,'No mobile/desktop horizontal overflow');
  await page.screenshot({path:out+'/maridalsvannet-'+profile.name+'-placecard.png',fullPage:true});
  await page.locator('#pcFrontCardFlip').click();
  await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:12000});
  const flipped=await page.locator('.pc-card-face-back').evaluate(el=>({visibility:getComputedStyle(el).visibility,text:el.textContent.trim()}));
  assert.equal(flipped.visibility,'visible','QuizCard must actually flip');
  assert.ok(flipped.text.length>30,'QuizCard must be populated');
  await page.screenshot({path:out+'/maridalsvannet-'+profile.name+'-quizcard.png',fullPage:true});
  await page.locator('#pcFrontCardFlip').click();
  await page.locator('#pcQuiz').click();
  await page.waitForFunction(id=>location.hash.startsWith('#/quiz/'+id),pid,{timeout:15000});
  const quizRoute=await page.evaluate(()=>location.hash);
  await page.goto(origin+'/fagverk-sted.html?place='+pid,{waitUntil:'domcontentloaded',timeout:75000});
  await page.waitForFunction(()=>document.body?.innerText?.includes('Maridalsvannet')&&document.body?.innerText?.includes('drikkevann'),null,{timeout:60000});
  const fagverk=await page.evaluate(()=>({length:document.body.innerText.length,containsSource:document.body.innerText.includes('Maridalsvannet')}));
  await page.screenshot({path:out+'/maridalsvannet-'+profile.name+'-fagverk.png',fullPage:true});
  assert.ok(fagverk.length>500,'Fagverk must contain a substantive page');
  assert.equal(errors.length,0,'Page errors should be absent');
  reports.push({profile:profile.name,viewport:profile.w,placeCard:before,quizCardFlipped:flipped.text.length>30,quizRoute,fagverk,pageErrors:errors});
  await ctx.close();
 }
}finally{await browser?.close();await new Promise(r=>server.close(r));}
fs.writeFileSync(out+'/maridalsvannet-v1-browser-qa-20261021.json',JSON.stringify({schema:'maridalsvannet-v1-browser-qa',status:'passed',reports},null,2)+'\n');
console.log('Maridalsvannet real app QA passed, mobile and desktop, local photo, QuizCard, quiz route and Fagverk.');