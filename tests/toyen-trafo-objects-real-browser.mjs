#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';
const root=process.cwd();
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
   await page.waitForFunction(()=>['pcPeopleIcon','pcObjectsIcon'].every(id=>{
    const el=document.getElementById(id); const img=el?.querySelector('img.pc-person-img');
    return el && getComputedStyle(el).display!=='none' && img instanceof HTMLImageElement && img.complete && img.naturalWidth>0;
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
   await page.locator('#pcObjectsIcon').click({timeout:12000});
   const popup=page.locator('.hg-popup.placecard-round-popup.visible');
   await popup.waitFor({state:'visible',timeout:20000});
   const text=await popup.innerText();
   assert.match(text,/Apparatpult/i,label+' missing Apparatpult');
   assert.match(text,/Transformatorkjerne/i,label+' missing transformatorkjerne');
   assert.ok(errors.length===0,label+': page errors: '+errors.join(' / '));
   await page.screenshot({path:'artifacts/toyen-trafo-objects/'+label+'.png',fullPage:false});
   console.log(label+': People and Objects previews loaded; two sourced Objects in popup');
  }finally{await ctx.close()}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
