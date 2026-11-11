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
fs.mkdirSync('artifacts/tronsmo-people-editorial',{recursive:true});
const ids=['ivar_tronsmo','per_petterson','lars_fiske','bendik_kaltenborn'];
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [label,width,height,mobile] of [['mobile',390,844,true],['desktop',1440,1000,false]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO'});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1');});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/index.html?hgTest=1#/place/tronsmo_bokhandel',{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId==='tronsmo_bokhandel',null,{timeout:90000});
   await page.waitForFunction(()=>{const img=document.querySelector('#pcFrontImage');return img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0&&img.naturalHeight>img.naturalWidth;},null,{timeout:70000});
   await page.waitForFunction(()=>{const card=document.querySelector('#pcFrontCardFlip'),content=document.querySelector('#pcQuizCardContent');return !!card?.classList.contains('has-quiz-card')&&!!content?.querySelector('.pc-rendered-quiz-card');},null,{timeout:80000});
   await page.screenshot({path:'artifacts/tronsmo-people-editorial/'+label+'-front.png'});
   const card=page.locator('#pcFrontCardFlip');
   await card.scrollIntoViewIfNeeded();await card.click();
   assert.equal(await card.evaluate(e=>e.classList.contains('is-flipped')),true,label+' QuizCard flip');
   await card.click();assert.equal(await card.evaluate(e=>e.classList.contains('is-flipped')),false);
   const people=page.locator('#pcPeopleIcon');
   await people.waitFor({state:'visible',timeout:30000});
   await people.click({force:true,timeout:15000});
   const popup=page.locator('.hg-popup.placecard-round-popup.visible');
   await popup.waitFor({state:'visible',timeout:20000});
   const text=await popup.innerText();
   for(const name of ['Ivar Tronsmo','Per Petterson','Lars Fiske','Bendik Kaltenborn'])assert.ok(text.includes(name),label+' missing '+name);
   await page.waitForFunction((ids)=>{
    const popup=document.querySelector('.hg-popup.placecard-round-popup.visible');
    if(!popup)return false;
    const imgs=[...popup.querySelectorAll('img')];
    return ids.every(id=>imgs.some(img=>img.src.includes('/'+id+'_historygo_editorial.svg')&&img.complete&&img.naturalWidth===1024&&img.naturalHeight===1024));
   },ids,{timeout:35000});
   await page.screenshot({path:'artifacts/tronsmo-people-editorial/'+label+'-people.png'});
   await page.keyboard.press('Escape');
   assert.deepEqual(errors,[],label+' unexpected JavaScript errors');
   console.log(label+': portrait PlaceCard, QuizCard flip, four disclosed People illustrations loaded, popup and no JS errors PASS');
  }finally{await context.close();}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
