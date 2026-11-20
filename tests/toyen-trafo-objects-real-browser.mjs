#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';
const root=process.cwd();
const expectedObjects=JSON.parse(fs.readFileSync('data/runtime/place-open/toyen_trafo.json','utf8')).place.objects;
assert.deepEqual(expectedObjects.map(x=>x.id),['toyen_trafo_apparatpult_1916','toyen_trafo_transformatorkjerne_1918']);
for(const o of expectedObjects){
 assert.equal(o.imageKind,'illustration');
 assert.ok(o.image.endsWith('_illustrasjon.webp'));
 assert.equal(o.imageMeta.sourcePhotoNotReproduced,true);
}
const contentType={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+(decodeURIComponent(new URL(req.url,'http://localhost').pathname)==='/'?'/index.html':decodeURIComponent(new URL(req.url,'http://localhost').pathname)));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return}
 res.writeHead(200,{'content-type':contentType[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
fs.mkdirSync('artifacts/toyen-trafo-objects',{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN || undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [label,width,height,mobile] of [['mobile',390,844,true],['desktop',1440,1000,false]]){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO'});
  await ctx.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1')});
  const page=await ctx.newPage();
  const errors=[];page.on('pageerror',err=>errors.push(String(err)));
  try{
   await page.goto(base+'/index.html?hgTest=1#/place/toyen_trafo',{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId==='toyen_trafo',null,{timeout:90000});
   // The direct Place Sheet hides legacy collection buttons once it renders
   // accessible gallery tiles. Require their decoded preview data, then assert
   // visibility and clickability on the actual gallery button below.
   await page.waitForFunction(()=>['pcPeopleIcon','pcObjectsIcon'].every(id=>{
    const el=document.getElementById(id); const img=el?.querySelector('img.pc-person-img');
    return el?.dataset.collectionItemCount==='2' && img instanceof HTMLImageElement && img.complete && img.naturalWidth>0;
   }),null,{timeout:60000});
   const state=await page.evaluate(()=>['pcPeopleIcon','pcObjectsIcon'].map(id=>{
     const el=document.getElementById(id);const img=el.querySelector('img.pc-person-img');
     return {id,collection:el.dataset.collectionId,count:Number(el.dataset.collectionItemCount),src:img.currentSrc||img.src,loaded:img.naturalWidth>0};
   }));
   assert.deepEqual(state.map(x=>x.collection),['people','objects'],label+' collection type');
   assert.deepEqual(state.map(x=>x.count),[2,2],label+' collection count');
   assert.ok(state.every(x=>x.loaded),label+' preview images');
   assert.ok(state[0].src.includes('toyen_trafo_'),label+' people image is local');
   assert.ok(state[1].src.includes('toyen_trafo_'),label+' objects image is local');
   // The unified Place Sheet promotes the canonical Object preview to a
   // real, visible gallery button. Clicking the hidden legacy icon is not QA.
   const gallery=page.locator('button[data-pc-round-gallery-item="pcObjectsIcon"]');
   await gallery.waitFor({state:'visible',timeout:25000});
   const galleryImage=gallery.locator('img').first();
   await page.waitForFunction(expected=>{
     const img=document.querySelector('button[data-pc-round-gallery-item="pcObjectsIcon"] img');
     return img?.getAttribute('src')===expected && img.complete && img.naturalWidth===900 && img.naturalHeight===520;
   },expectedObjects[0].image,{timeout:30000});
   assert.match(await galleryImage.getAttribute('alt')||'',/Illustrasjon/);
   await gallery.screenshot({path:'artifacts/toyen-trafo-objects/'+label+'-preview.png'});
   await gallery.click({timeout:20000});
   const popup=page.locator('.hg-popup.placecard-round-popup.visible');
   await popup.waitFor({state:'visible',timeout:20000});
   await page.waitForFunction(()=>{
     const rows=[...document.querySelectorAll('#pcObjectsList .pc-object-member')];
     return rows.length===2 && rows.every(row=>{
       const img=row.querySelector('img.pc-object-member-image');
       return img?.complete && img.naturalWidth===900 && img.naturalHeight===520;
     });
   },null,{timeout:30000});
   // The canonical list is retained as hidden backing DOM. The popup
   // renders separate, user-visible Object rows. DNT C50 follows the same
   // contract: assert backing parity, then inspect ONLY the visible rows.
   const canonicalRows=page.locator('#pcObjectsList .pc-object-member');
   assert.equal(await canonicalRows.count(),2,label+' backing Objects count');
   const rows=page.locator('.pc-object-member:visible');
   await rows.first().waitFor({state:'visible',timeout:20000});
   assert.equal(await rows.count(),2,label+' must display exactly two visible Tøyen Objects');
   for(let i=0;i<2;i++){
     const row=rows.nth(i),expected=expectedObjects[i];
     await row.scrollIntoViewIfNeeded({timeout:12000});
     assert.equal(await row.getAttribute('data-visual-round-item'),expected.id);
     assert.equal(await row.getAttribute('data-image-kind'),'illustration');
     assert.equal(await row.locator('.pc-object-disclosure').innerText(),'Illustrasjon');
     assert.match(await row.locator('.pc-object-credit').innerText(),/Bilde: History Go – original illustrasjon/);
     assert.doesNotMatch(await row.locator('.pc-object-context').innerText(),/ikke fotografi/);
     assert.ok((await row.locator('.pc-object-context').innerText()).length>20);
     const img=row.locator('img.pc-object-member-image');
     assert.equal(await img.getAttribute('src'),expected.image);
     assert.equal(await img.getAttribute('alt'),expected.imageAlt);
     const dims=await img.evaluate(el=>[el.naturalWidth,el.naturalHeight]);
     assert.deepEqual(dims,[900,520],label+' image dimensions '+expected.id);
     const fit=await img.evaluate(el=>getComputedStyle(el).objectFit);
     assert.equal(fit,'contain',label+' must preserve full illustration');
     const rect=await img.boundingBox();
     assert.ok(rect && rect.width>65 && rect.height>65,label+' image too small '+expected.id);
     const link=row.locator('a.pc-object-source');
     assert.equal(await link.count(),1,label+' historic catalog link missing');
     assert.equal(await link.getAttribute('href'),expected.imageMeta.sourceUrl);
     assert.match(await link.innerText(),/Historisk kilde for gjenstanden/);
     await row.screenshot({path:'artifacts/toyen-trafo-objects/'+label+'-'+expected.id+'.png'});
   }
   const text=await popup.innerText();
   assert.match(text,/Apparatpult/i,label+' missing Apparatpult');
   assert.match(text,/Transformatorkjerne/i,label+' missing transformatorkjerne');
   assert.deepEqual(errors,[],label+': unexpected page errors');
   await page.screenshot({path:'artifacts/toyen-trafo-objects/'+label+'-popup.png',fullPage:false});
   console.log(label+': both Tøyen illustrations decoded, credited, source-linked, uncropped and visible');
  }catch(err){
   const diagnostic=await page.evaluate(()=>{
     const ids=['pcPeopleIcon','pcObjectsIcon'];
     const legacy=Object.fromEntries(ids.map(id=>{
       const el=document.getElementById(id),img=el?.querySelector('img.pc-person-img');
       return [id,{count:el?.dataset.collectionItemCount,
         hidden:el?.hidden,display:el?getComputedStyle(el).display:null,
         preview:img?.getAttribute('src'),decoded:img?.naturalWidth||0}];
     }));
     const gallery=document.querySelector('button[data-pc-round-gallery-item="pcObjectsIcon"]');
     return {placeId:document.querySelector('#placeCard')?.dataset.currentPlaceId,
       legacy,galleryFound:!!gallery,
       galleryDisplay:gallery?getComputedStyle(gallery).display:null,
       galleryImage:gallery?.querySelector('img')?.getAttribute('src'),
       popupObjectRows:document.querySelectorAll('#pcObjectsList .pc-object-member').length};
   }).catch(()=>({status:'diagnostic unavailable'}));
   console.error(label+': Tøyen browser QA failed',JSON.stringify(diagnostic),String(err));
   await page.screenshot({path:'artifacts/toyen-trafo-objects/'+label+'-failure.png',fullPage:false}).catch(()=>{});
   throw err;
  }finally{await ctx.close()}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
