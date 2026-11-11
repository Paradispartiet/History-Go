#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const root=process.cwd();
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const place=JSON.parse(fs.readFileSync('data/places/politikk/oslo/places_politikk/tinghuset.json','utf8'));
const runtime=JSON.parse(fs.readFileSync('data/runtime/place-open/tinghuset.json','utf8'));
const collectionIds=['people','objects','brands'];
assert.equal(place.id,'tinghuset');
assert.equal(place.production_profile,'standard');
assert.equal(place.profile_status,'confirmed');
assert.deepEqual(place.place_card_profile?.collection_ids,collectionIds);
assert.ok(runtime.people.length>=13,'Expected 13 canonical People from prior source-curated place production');
for(const {id} of runtime.people){
 const p=runtime.people.find(x=>x.id===id);
 assert.ok(p,'missing generated People '+id);
 assert.ok(p.image&&p.image.length>5,'missing canonical People picture '+id);
 if(!/^https?:/.test(p.image))assert.ok(fs.existsSync(p.image),'missing local People image: '+id);
}
const server=http.createServer((req,res)=>{
 const url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(url==='/'?'/index.html':url));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
fs.mkdirSync('artifacts/tinghuset-ts09',{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [label,width,height,mobile] of [['mobile',390,844,true],['desktop',1440,1000,false]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO',reducedMotion:'reduce'});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1');});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/index.html?hgTest=1#/place/tinghuset',{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId==='tinghuset',null,{timeout:90000});
   await page.waitForFunction(()=>{const img=document.querySelector('#pcFrontImage');return img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0&&img.naturalHeight>img.naturalWidth;},null,{timeout:70000});
   await page.waitForFunction(()=>{const card=document.querySelector('#pcFrontCardFlip'),content=document.querySelector('#pcQuizCardContent');return card?.classList.contains('has-quiz-card')&&content?.querySelector('.pc-rendered-quiz-card');},null,{timeout:80000});
   const mode=await page.locator('#placeCard').evaluate(el=>({mode:el.dataset.collectionMode,count:Number(el.dataset.collectionCount)}));
   assert.equal(mode.mode,'place-card-collections-v2');
   assert.equal(mode.count,3);
   await page.screenshot({path:'artifacts/tinghuset-ts09/'+label+'-front.png'});
   const flip=page.locator('#pcFrontCardFlip');
   await flip.scrollIntoViewIfNeeded();await flip.click();
   assert.equal(await flip.evaluate(e=>e.classList.contains('is-flipped')),true);
   await flip.click();
   assert.equal(await flip.evaluate(e=>e.classList.contains('is-flipped')),false);
   const checks=[];
   for(const [id,icon] of [['people','pcPeopleIcon'],['objects','pcObjectsIcon'],['brands','pcBrandsIcon']]){
    const source=page.locator('#'+icon);
    assert.equal(await source.getAttribute('data-collection-id'),id,'wrong collection '+id);
    assert.ok(Number(await source.getAttribute('data-collection-item-count'))>=1,'empty collection '+id);
    const editorial=id==='brands'
      ?page.locator('#placeCard .pc-sheet-canonical-about [data-pc-round-gallery-brand="1"] button')
      :page.locator('[data-pc-round-gallery-item="'+icon+'"]');
    const action=await editorial.isVisible().catch(()=>false)?editorial:source;
    // Playwright handles scrolling in click(). Explicit scroll can detach editorial gallery nodes during lazy rerender.
    await action.click({force:id==='people',timeout:20000});
    const popup=page.locator('.hg-popup.placecard-round-popup.visible');
    await popup.waitFor({state:'visible',timeout:20000});
    const body=(await popup.innerText()).trim();
    // Canonical Brands may be an image-first popup; verify actual loaded identity image below.
    if(id!=='brands')assert.ok(body.length>50,'empty popup '+id);
    if(id==='people'){
     assert.match(body,/tinghus|dommer|kunstner|arkitekt|advokat|forsvarer/i,'wrong People popup');
     await page.waitForFunction(()=>{
      const imgs=[...document.querySelectorAll('.hg-popup.placecard-round-popup.visible img')];
      return imgs.length>=13 && imgs.some(img=>img.complete&&img.naturalWidth>0);
     },null,{timeout:30000});
    }
    const imgs=await popup.locator('img').evaluateAll(elements=>elements.map(img=>({src:img.currentSrc||img.src,loaded:img.complete&&img.naturalWidth>0})));
    assert.ok(imgs.length>0,'no illustrated member in '+id);
    assert.ok(imgs.some(img=>img.loaded),'no loaded member image in '+id);
    checks.push({id,items:Number(await source.getAttribute('data-collection-item-count')),images:imgs.length,loaded:imgs.filter(img=>img.loaded).length});
    await page.screenshot({path:'artifacts/tinghuset-ts09/'+label+'-'+id+'.png'});
    await page.keyboard.press('Escape');
    await popup.waitFor({state:'hidden',timeout:10000});
   }
   assert.deepEqual(errors,[],'JavaScript errors on '+label);
   fs.writeFileSync('artifacts/tinghuset-ts09/'+label+'-result.json',JSON.stringify({place_id:place.id,viewport:{width,height},collections:checks,quizcard_flip:'PASS',errors},null,2));
   console.log(label+' PASS '+JSON.stringify(checks));
  }finally{await context.close();}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
