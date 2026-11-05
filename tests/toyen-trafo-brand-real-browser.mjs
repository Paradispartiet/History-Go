#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright';

const root=process.cwd();
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const u=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(u==='/'?'/index.html':u));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
  res.writeHead(404);res.end('not found');return;
 }
 res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
fs.mkdirSync('artifacts/toyen-trafo-brands',{recursive:true});
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
   await page.waitForFunction(()=>['pcPeopleIcon','pcObjectsIcon','pcBrandsIcon'].every(id=>{
      const el=document.getElementById(id),img=el?.querySelector(':scope > img.pc-person-img');
      return !!el&&el.dataset.collectionId!==''&&img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0;
   }),null,{timeout:60000});
   const state=await page.evaluate(()=>['pcPeopleIcon','pcObjectsIcon','pcBrandsIcon'].map(id=>{
      const el=document.getElementById(id),img=el.querySelector(':scope > img.pc-person-img');
      return {id,collection:el.dataset.collectionId,count:Number(el.dataset.collectionItemCount),src:img.currentSrc||img.src,loaded:img.naturalWidth>0};
   }));
   assert.deepEqual(state.map(x=>x.collection),['people','objects','brands'],label+' approved collections');
   assert.deepEqual(state.map(x=>x.count),[2,2,2],label+' collection item counts');
   assert.ok(state.every(x=>x.loaded),label+' member media');
   assert.ok(state[2].src.includes('toyen_trafo_oslo_teatersenter_official_logo.webp'),label+' official OTS preview');
   const geometry=await page.evaluate(()=>{const el=document.getElementById('pcBrandsIcon');return {rect:(()=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})(),display:getComputedStyle(el).display,visibility:getComputedStyle(el).visibility,opacity:getComputedStyle(el).opacity,hidden:el.hidden,parent:el.parentElement?.className,ancestors:(()=>{let e=el;const out=[];while(e&&out.length<6){const st=getComputedStyle(e),rect=e.getBoundingClientRect();out.push({id:e.id,cls:e.className,hidden:e.hidden,display:st.display,visibility:st.visibility,width:rect.width,height:rect.height});e=e.parentElement}return out})()}});
   console.log(label+': brand geometry '+JSON.stringify(geometry));
   await page.screenshot({path:'artifacts/toyen-trafo-brands/'+label+'-before.png',fullPage:false});
   await page.locator('#pcBrandsIcon').click({timeout:12000});
   const popup=page.locator('.hg-popup.placecard-round-popup.visible');
   await popup.waitFor({state:'visible',timeout:20000});
   const content=await popup.innerText();
   assert.match(content,/Oslo teatersenter/i,label+' missing approved OTS');
   assert.match(content,/Unge Kunstneres Samfund/i,label+' missing source-backed UKS actor');
   assert.ok(errors.length===0,label+' runtime errors: '+errors.join(' / '));
   await page.screenshot({path:'artifacts/toyen-trafo-brands/'+label+'.png',fullPage:false});
   console.log(label+': three approved preview collections, authentic OTS logo, two Brand identities in popup');
  }finally{await context.close()}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
