#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=process.cwd();
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  const u=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(u==='/'?'/index.html':u));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
  res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
fs.mkdirSync('artifacts/toyen-trafo-vferdig',{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [label,width,height,mobile] of [['mobile',390,844,true],['desktop',1440,1000,false]]){
   const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO'});
   await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1');});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   try{
     await page.goto(base+'/index.html?hgTest=1#/place/toyen_trafo',{waitUntil:'domcontentloaded',timeout:90000});
     await page.waitForFunction(()=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId==='toyen_trafo',null,{timeout:90000});
     await page.waitForFunction(()=>{
       const img=document.querySelector('#pcFrontImage');
       return img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0&&img.naturalHeight>img.naturalWidth;
     },null,{timeout:70000});
     const front=await page.locator('#pcFrontImage').evaluate(img=>({
       src:img.currentSrc||img.src,width:img.naturalWidth,height:img.naturalHeight,alt:img.alt
     }));
     assert.ok(front.src.includes('toyen_trafo_front_portrait.webp'),label+' missing 2014 independent front image');
     assert.equal(front.width,900);assert.equal(front.height,1350);
     await page.waitForFunction(()=>{
       const card=document.querySelector('#pcFrontCardFlip'),content=document.querySelector('#pcQuizCardContent');
       return !!card?.classList.contains('has-quiz-card')&&!!content?.querySelector('.pc-rendered-quiz-card')&&content?.dataset?.placeId==='toyen_trafo';
     },null,{timeout:80000});
     const quizContent=await page.locator('#pcQuizCardContent').textContent();
     assert.match(quizContent,/Tøyen/i,label+' wrong QuizCard');
     const card=page.locator('#pcFrontCardFlip');
     assert.equal(await card.evaluate(e=>e.classList.contains('is-flipped')),false);
     await card.scrollIntoViewIfNeeded();
     await card.click({timeout:15000});
     assert.equal(await card.evaluate(e=>e.classList.contains('is-flipped')),true,label+' tap/mouse flip to QuizCard');
     const expand=page.locator('#pcQuizExpandBtn');
     await expand.click({timeout:15000});
     assert.equal(await page.locator('#pcQuizExpanded').evaluate(e=>e.hidden),false,label+' QuizCard expand');
     await page.keyboard.press('Escape');
     assert.equal(await page.locator('#pcQuizExpanded').evaluate(e=>e.hidden),true,label+' QuizCard close on Escape');
     await card.click({timeout:15000});
     assert.equal(await card.evaluate(e=>e.classList.contains('is-flipped')),false,label+' flip back to front');
     if(!mobile){
       await card.focus();await page.keyboard.press('Enter');
       assert.equal(await card.evaluate(e=>e.classList.contains('is-flipped')),true,'keyboard Enter');
       await page.keyboard.press('Space');
       assert.equal(await card.evaluate(e=>e.classList.contains('is-flipped')),false,'keyboard Space');
     }
     const state=await page.evaluate(()=>{
       const place=window.PLACES.find(p=>p.id==='toyen_trafo');
       const ids=['pcPeopleIcon','pcObjectsIcon','pcBrandsIcon','pcCategoryCollectionIcon'];
       return {
         title:document.getElementById('pcTitle')?.textContent,
         category:place.category,underbadges:place.underbadge_ids,
         isSameFrontAsMain:place.frontImage===place.image,
         collections:place.place_card_profile.collection_ids,
         loaded:ids.map(id=>{const el=document.getElementById(id),img=el?.querySelector(':scope > img.pc-person-img');return {id:el?.dataset.collectionId,count:Number(el?.dataset.collectionItemCount||0),imageLoaded:!!img?.complete&&img.naturalWidth>0};}),
         serviceCount:place.productions?.length||0
       };
     });
     assert.equal(state.category,'naeringsliv');
     assert.ok(state.underbadges?.includes('industri'));
     assert.equal(state.isSameFrontAsMain,false);
     assert.deepEqual(state.collections,['people','objects','brands','productions']);
     assert.deepEqual(state.loaded.map(z=>z.id),state.collections);
     assert.deepEqual(state.loaded.map(z=>z.count),[2,2,2,1]);
     assert.ok(state.loaded.every(z=>z.imageLoaded),label+' missing a member preview');
     assert.equal(state.serviceCount,1);
     assert.equal(errors.length,0,label+' runtime page errors: '+errors.join(' / '));
     await page.screenshot({path:'artifacts/toyen-trafo-vferdig/'+label+'.png',fullPage:false});
     console.log(label+': upright documentary front 900x1350, QuizCard click/touch/expand/Escape/return, four populated collections and no JS errors PASS');
   }finally{await context.close();}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
