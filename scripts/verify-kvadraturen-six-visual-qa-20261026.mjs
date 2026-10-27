#!/usr/bin/env node
// Scoped six-Place visual integration smoke test. Captures the actual app in desktop/mobile;
// does not declare human-reviewed v1 approval.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const ROOT=process.cwd(), ids=[
 'den_gamle_krigsskolen','garmanngarden','stattholdergarden',
 'hotel_du_nord','cafe_engebret','treschowgarden'
];
const sourcePaths={
 den_gamle_krigsskolen:'data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01/den_gamle_krigsskolen.json',
 garmanngarden:'data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/garmanngarden.json',
 stattholdergarden:'data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/stattholdergarden.json',
 hotel_du_nord:'data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02/hotel_du_nord.json',
 cafe_engebret:'data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02/cafe_engebret.json',
 treschowgarden:'data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/treschowgarden.json'
};
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const fp=path.resolve(ROOT,'.'+(pathname==='/'?'/index.html':pathname));
  if(!fp.startsWith(ROOT+path.sep)||!fs.existsSync(fp)||!fs.statSync(fp).isFile()){res.writeHead(404);res.end('Not found');return}
  res.writeHead(200,{'Content-Type':mime[path.extname(fp).toLowerCase()]||'application/octet-stream'});
  res.end(fs.readFileSync(fp));
 }catch(e){res.writeHead(500);res.end(String(e))}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base='http://127.0.0.1:'+server.address().port;
const output=path.join(ROOT,'artifacts','kvadraturen-six-visuals-20261026');
fs.mkdirSync(output,{recursive:true});
let browser;
const report={schema:'kvadraturen_six_visual_browser_review_v1',testedAt:'2026-10-26',humanReview:'pending',v1Approved:0,results:[]};
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const profile of [{name:'desktop',viewport:{width:1440,height:960}},{name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}]){
  const context=await browser.newContext({viewport:profile.viewport,isMobile:!!profile.isMobile,hasTouch:!!profile.hasTouch});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1')});
  for(const id of ids){
   const place=JSON.parse(fs.readFileSync(sourcePaths[id],'utf8'));
   const errors=[],page=await context.newPage();
   page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(base+'/index.html?hgTest=1#/place/'+id,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(pid=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId===pid,id,{timeout:90000});
   await page.locator('#placeCard').waitFor({state:'visible',timeout:20000});
   await page.waitForTimeout(700);
   const result=await page.evaluate(async({id,media,viewport})=>{
     const card=document.getElementById('placeCard');
     const box=card.getBoundingClientRect();
     const props=window.getComputedStyle(card);
     const imgs=[...card.querySelectorAll('img')].map(img=>({src:img.getAttribute('src'),naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,visible:img.getBoundingClientRect().width>1}));
     const mediaStatus=await Promise.all(media.map(async file=>{
       const res=await fetch('/'+file,{cache:'no-store'});
       const bin=res.ok?await res.arrayBuffer():null;
       return {path:file,ok:res.ok,bytes:bin?.byteLength||0,type:res.headers.get('content-type')};
     }));
     return {id:card.dataset.currentPlaceId,card:{x:box.x,y:box.y,w:box.width,h:box.height,hidden:props.display==='none',textLength:(card.innerText||'').length},
             images:imgs,mediaStatus,viewport};
   },{id,media:[place.heroImage,place.frontImage,place.cardImage],viewport:profile.viewport});
   assert.equal(result.id,id,'Wrong PlaceCard opened');
   assert.ok(!result.card.hidden&&result.card.w>250&&result.card.h>150,'PlaceCard not visible '+id);
   assert.ok(result.card.x>=-4&&result.card.x+result.card.w<=profile.viewport.width+5,'PlaceCard exceeds viewport width '+id);
   assert.ok(result.mediaStatus.every(x=>x.ok&&x.bytes>12000&&x.type?.includes('image/')),'Broken local media: '+id);
   assert.ok(result.card.textLength>=20,'Missing PlaceCard content '+id);
   assert.equal(errors.length,0,'Browser errors for '+id+': '+errors.join('; ').slice(0,250));
   const shot=path.join(output,profile.name+'-'+id+'.png');
   await page.screenshot({path:shot,fullPage:false,animations:'disabled'});
   report.results.push({id,profile:profile.name,...result,errors,screenshot:shot.replace(ROOT+path.sep,'')});
   console.log('PASS_VISUAL_DOM',profile.name,id,'card',Math.round(result.card.w)+'x'+Math.round(result.card.h),'bytes',result.mediaStatus.map(x=>x.bytes).join(','));
   await page.close();
  }
  await context.close();
 }
 assert.equal(report.results.length,12);
 fs.writeFileSync(path.join(output,'visual-report.json'),JSON.stringify(report,null,2)+'\n');
 console.log('SIX_PLACE_VISUAL_QA_DOM_PASS_12 screenshots='+report.results.length+' humanReview=pending');
} finally{
 await browser?.close();
 await new Promise(done=>server.close(done));
}
