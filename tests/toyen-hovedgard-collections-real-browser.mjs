#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=process.cwd();
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(url==='/'?'/index.html':url));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
fs.mkdirSync('artifacts/toyen-hovedgard-collections',{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [label,width,height,mobile] of [['mobile',390,844,true],['desktop',1440,1000,false]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO'});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1');});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/index.html?hgTest=1#/place/toyen_hovedgard',{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId==='toyen_hovedgard',null,{timeout:90000});
   await page.waitForFunction(()=>{
    const img=document.querySelector('#pcFrontImage');
    return img instanceof HTMLImageElement && img.complete && img.naturalWidth===900 && img.naturalHeight===1200;
   },null,{timeout:70000});
   const front=await page.locator('#pcFrontImage').evaluate(img=>({src:img.currentSrc||img.src,alt:img.alt}));
   assert.match(front.src,/toyen_hovedgard_front_editorial\.svg/,label+' missing original portrait illustration');
   await page.waitForFunction(()=>{
    const card=document.querySelector('#pcFrontCardFlip'),content=document.querySelector('#pcQuizCardContent');
    return !!card?.classList.contains('has-quiz-card')&&!!content?.querySelector('.pc-rendered-quiz-card')&&content.dataset.placeId==='toyen_hovedgard';
   },null,{timeout:80000});
   await page.screenshot({path:'artifacts/toyen-hovedgard-collections/'+label+'-front.png'});
   const card=page.locator('#pcFrontCardFlip');
   await card.scrollIntoViewIfNeeded();
   await card.click();
   assert.equal(await card.evaluate(e=>e.classList.contains('is-flipped')),true,label+' QuizCard flip');
   await page.locator('#pcQuizExpandBtn').click();
   assert.equal(await page.locator('#pcQuizExpanded').evaluate(e=>e.hidden),false);
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#pcQuizExpanded').evaluate(e=>e.hidden),true);
   await card.click();
   assert.equal(await card.evaluate(e=>e.classList.contains('is-flipped')),false);
   const state=await page.evaluate(()=>{
    const place=window.PLACES.find(p=>p.id==='toyen_hovedgard');
    const ids=['pcPeopleIcon','pcCategoryCollectionIcon'];
    return {
     title:document.querySelector('#pcTitle')?.textContent,
     category:place.category,collections:place.place_card_profile?.collection_ids,
     entries:ids.map(id=>{const e=document.getElementById(id),img=e?.querySelector(':scope > img.pc-person-img');return {id:e?.dataset.collectionId,count:Number(e?.dataset.collectionItemCount||0),imageLoaded:!!img?.complete&&img.naturalWidth>0,imageSrc:img?.src||''};})
    };
   });
   assert.equal(state.category,'historie');
   assert.deepEqual(state.collections,['people','historical_events']);
   assert.deepEqual(state.entries.map(x=>x.id),['people','historical_events']);
   assert.deepEqual(state.entries.map(x=>x.count),[2,2]);
   assert.ok(state.entries[1].imageLoaded,label+' original historical event icon not loaded');
   // The first People thumbnail may be Wikimedia-hosted; verify UI and subject identity, not third-party availability.
   for(const [iconId,expected,labelSuffix] of [
      ['pcPeopleIcon',/Jens Bjelke|Henrik Bjelke/i,'people'],
      ['pcCategoryCollectionIcon',/sædegårdsrettigheter|universitetsgrunn/i,'historical-events']
   ]){
    const icon=page.locator(iconId==='pcPeopleIcon' ? '#pcPeopleIcon' : '[data-pc-round-gallery-item="'+iconId+'"]');
    await icon.waitFor({state:'visible',timeout:30000});
    // The title-row People round has a continuously animated transform; a normal Playwright click waits for stability forever.
    // A forced pointer click still exercises the actual event handler after the element is confirmed visible.
    await icon.click({force:iconId==='pcPeopleIcon',timeout:15000});
    const popup=page.locator('.hg-popup.placecard-round-popup.visible');
    await popup.waitFor({state:'visible',timeout:20000});
    const t=await popup.innerText();
    assert.match(t,expected,label+' missing expected '+labelSuffix+' in gallery');
    if(labelSuffix==='people'){
      await page.waitForFunction(()=>{
        const popup=document.querySelector('.hg-popup.placecard-round-popup.visible');
        const imgs=[...(popup?.querySelectorAll('.pc-person img.pc-person-img')||[])];
        return imgs.length===2&&imgs.every(img=>img.complete&&img.naturalWidth>0);
      },null,{timeout:30000});
    }
    if(labelSuffix==='historical-events'){
      assert.match(t,/sædegårdsrettigheter/i);assert.match(t,/universitetsgrunn/i);
    }
    await page.screenshot({path:'artifacts/toyen-hovedgard-collections/'+label+'-'+labelSuffix+'.png'});
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
   }
   assert.deepEqual(errors,[],label+' page errors');
   console.log(label+': portrait 900x1200, QuizCard flip, 2 People, 2 Historical Events, popup and no page errors PASS');
  }finally{await context.close();}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
