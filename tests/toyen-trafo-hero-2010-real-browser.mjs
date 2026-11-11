#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=process.cwd(),mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const u=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(u==='/'?'/index.html':u));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
fs.mkdirSync('artifacts/toyen-trafo-hero',{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [label,width,height,mobile] of [['mobile',390,844,true],['desktop',1440,1000,false]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO'});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1');});
  const page=await context.newPage();
  try{
   await page.goto(base+'/index.html?hgTest=1#/place/toyen_trafo',{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId==='toyen_trafo',null,{timeout:90000});
   await page.waitForFunction(()=>{
     const img=document.querySelector('#pcHeaderImage');
     return img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0;
   },null,{timeout:70000});
   const state=await page.locator('#pcHeaderImage').evaluate(img=>({src:img.currentSrc||img.src,width:img.naturalWidth,height:img.naturalHeight,position:img.style.objectPosition}));
   assert.ok(state.src.includes('toyen_trafo_hero_2010.webp'),label+' did not use new building-focused hero');
   assert.equal(state.width,800);assert.equal(state.height,535);assert.equal(state.position,'52% 38%');
   const front=await page.locator('#pcFrontImage').getAttribute('src');
   assert.ok(front?.includes('toyen_trafo_front_portrait.webp'),label+' independent portrait lost');
   await page.screenshot({path:'artifacts/toyen-trafo-hero/'+label+'.png',fullPage:false});
   console.log(label+': Tøyen trafo true building 2010 hero + independently sourced portrait load correctly');
  }finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
