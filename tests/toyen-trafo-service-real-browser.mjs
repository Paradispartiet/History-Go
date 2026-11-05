#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const root=process.cwd(),mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const u=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(u==='/'?'/index.html':u));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
fs.mkdirSync('artifacts/toyen-trafo-service',{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [label,width,height,mobile] of [['mobile',390,844,true],['desktop',1440,1000,false]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO'});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1');});
  const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/index.html?hgTest=1#/place/toyen_trafo',{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId==='toyen_trafo',null,{timeout:90000});
   await page.waitForFunction(()=>{
    const ids=['pcPeopleIcon','pcObjectsIcon','pcBrandsIcon','pcCategoryCollectionIcon'];
    return ids.every(id=>{const el=document.getElementById(id),img=el?.querySelector(':scope > img.pc-person-img');return el&&img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0;});
   },null,{timeout:70000});
   const state=await page.evaluate(()=>{
     const place=window.PLACES.find(p=>p.id==='toyen_trafo');
     const ids=['pcPeopleIcon','pcObjectsIcon','pcBrandsIcon','pcCategoryCollectionIcon'];
     return {ids:ids.map(id=>{const el=document.getElementById(id),img=el.querySelector(':scope > img.pc-person-img');return {id,collection:el.dataset.collectionId,count:Number(el.dataset.collectionItemCount),src:img.currentSrc||img.src,loaded:img.naturalWidth>0};}),
       label:window.HGPlaceCardCollections?.getFourthLabel?.(place),
       productions:window.HGPlaceCardCollections?.getItems?.(place,'productions')?.map(p=>({id:p.id,image:p.image}))};
   });
   assert.deepEqual(state.ids.map(x=>x.collection),['people','objects','brands','productions'],label+' four source-backed collections');
   assert.deepEqual(state.ids.map(x=>x.count),[2,2,2,1],label+' real member counts');
   assert.ok(state.ids.every(x=>x.loaded),label+' all four image previews');
   assert.ok(state.ids[3].src.includes('toyen_trafo_oslo_teatersenter_provelokaler.webp'),label+' service image visible');
   assert.equal(state.label,'Produksjon og tjenester');
   assert.equal(state.productions?.length,1);assert.equal(state.productions[0].id,'toyen_trafo_oslo_teatersenter_provelokaler');
   assert.equal(errors.length,0,label+' page errors: '+errors.join(' / '));
   await page.screenshot({path:'artifacts/toyen-trafo-service/'+label+'.png',fullPage:false});
   console.log(label+': four verified collection previews and source-backed rehearsal-space rental service');
  }finally{await context.close();}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
