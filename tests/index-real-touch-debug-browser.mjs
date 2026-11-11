import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, webkit } from 'playwright';
const root=process.cwd();
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const results=[];
async function ready(page){await page.waitForFunction(()=>window.__HG_APP_READY__===true,null,{timeout:90000});}
async function tap(page,selector){
 const hit=await page.locator(selector).evaluate(el=>{
  const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  return {x,y,w:r.width,h:r.height,stack:document.elementsFromPoint(x,y).slice(0,7).map(n=>({id:n.id,cls:String(n.className),display:getComputedStyle(n).display,visibility:getComputedStyle(n).visibility,pe:getComputedStyle(n).pointerEvents,z:getComputedStyle(n).zIndex}))};
 });
 console.log('TAP '+selector+' '+JSON.stringify(hit));
 assert.ok(hit.w>0&&hit.h>0,'Tap target must be visible: '+selector);
 await page.touchscreen.tap(hit.x,hit.y);
}
async function cardVisible(page,id){
 await page.waitForFunction(id=>{
  const c=document.getElementById('placeCard'),r=c?.getBoundingClientRect();
  return location.hash==='#/place/'+encodeURIComponent(id)&&c?.dataset.currentPlaceId===id&&r?.height>100&&getComputedStyle(c).display!=='none'&&getComputedStyle(c).visibility!=='hidden'&&getComputedStyle(c).pointerEvents!=='none'&&!document.body.classList.contains('map-only')&&!document.body.classList.contains('mode-map');
 },id,{timeout:30000});
}
async function mapHit(page,previousId){
 await page.evaluate(()=>window.HGMap.getMap().jumpTo({center:[10.759,59.922],zoom:16}));
 await page.waitForTimeout(1200);
 const probe=await page.evaluate(previousId=>{
  const map=window.HGMap.getMap(),layers=['hg-places-hit','hg-place-areas-hit'].filter(id=>map.getLayer(id));
  const markers=[...document.querySelectorAll('.hg-place-detail-marker,.hg-place-area-marker')].map(el=>{
   const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
   const hits=layers.length?map.queryRenderedFeatures([x,y],{layers}).map(f=>f.properties?.id):[];
   return {id:el.dataset.placeId,x,y,w:r.width,h:r.height,hits};
  }).filter(m=>m.id!==previousId&&m.w>0&&m.x>35&&m.x<innerWidth-130&&m.y>100&&m.y<innerHeight-160);
  const selected=markers.find(m=>m.hits[0]===m.id)||markers.find(m=>m.hits.includes(m.id));
  const stack=selected?document.elementsFromPoint(selected.x,selected.y).slice(0,8).map(n=>({id:n.id,cls:String(n.className),z:getComputedStyle(n).zIndex,pe:getComputedStyle(n).pointerEvents,display:getComputedStyle(n).display,visibility:getComputedStyle(n).visibility})):[];
  return {selected,markers:markers.slice(0,12),stack};
 },previousId);
 console.log('MARKER '+JSON.stringify(probe));assert.ok(probe.selected,'A rendered map hit feature is required');
 const hit=probe.selected;
 await page.touchscreen.tap(hit.x,hit.y);await cardVisible(page,hit.id);
 console.log('PLACE OPENED '+hit.id+' '+page.url());return hit.id;
}
async function backToMap(page){
 await tap(page,'[data-hg-nav-back]');
 await page.waitForURL(/#\/map$/,{timeout:30000});await ready(page);
 await page.waitForFunction(()=>{
  const c=document.getElementById('placeCard');return !c||getComputedStyle(c).display==='none'||c.getBoundingClientRect().height===0;
 },null,{timeout:15000});
 console.log('BACK TO MAP '+page.url());
}
try{
 for(const [name,engine,width,height] of [['webkit-ipad',webkit,820,1180],['chromium-phone',chromium,390,844]]){
  let browser;
  const result={name,flows:[],errors:[]};
  try{
   browser=await engine.launch({headless:true});
   const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,locale:'nb-NO'});
   let page=await ctx.newPage();
   page.on('pageerror',e=>result.errors.push(e.message));
   await page.goto(base+'/index.html#/map',{waitUntil:'domcontentloaded',timeout:60000});await ready(page);
   await page.locator('#hgOnboardingModal').waitFor({state:'visible',timeout:15000});
   await tap(page,'.hg-onb-close');
   await page.locator('#hgOnboardingModal').waitFor({state:'hidden'});
   result.welcomeDismissed=true;
   // A genuine first session, then reuse its stored state and HTTP cache after reopening.
   for(const state of ['first-visit','returning-tab']){
    if(state==='returning-tab'){
     await page.close();page=await ctx.newPage();page.on('pageerror',e=>result.errors.push(e.message));
     await page.goto(base+'/index.html#/map',{waitUntil:'domcontentloaded',timeout:60000});await ready(page);
     assert.equal(await page.evaluate(()=>localStorage.getItem('hg_onboarding_shown_v1')),'1');
     assert.equal(await page.locator('#hgOnboardingModal').isVisible(),false);
    }
    const progress=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>/visited|merit|collect|quiz.*(done|progress|score)/i.test(k))));
    await tap(page,'#nearbyExploreToggle');
    await page.waitForFunction(()=>document.getElementById('nearbyExploreToggle')?.getAttribute('aria-expanded')==='true');
    await tap(page,'#nearbyExploreToggle');
    await page.waitForFunction(()=>document.getElementById('nearbyExploreToggle')?.getAttribute('aria-expanded')==='false');
    await tap(page,'#btnSeeMap');
    await page.waitForFunction(()=>document.body.classList.contains('map-only')||document.body.classList.contains('mode-map'));
    const first=await mapHit(page,null);await backToMap(page);
    const second=await mapHit(page,first);assert.notEqual(second,first);
    // Reload an open PlaceCard to verify the stored tab/route restores without a shielding panel.
    await page.reload({waitUntil:'domcontentloaded'});await ready(page);await cardVisible(page,second);
    await backToMap(page);
    await tap(page,'.hg-map-category-trigger');
    await page.waitForFunction(()=>document.querySelector('.hg-map-category-trigger')?.getAttribute('aria-expanded')==='true');
    await tap(page,'.hg-map-category-trigger');
    await page.waitForFunction(()=>document.querySelector('.hg-map-category-trigger')?.getAttribute('aria-expanded')==='false');
    const after=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>/visited|merit|collect|quiz.*(done|progress|score)/i.test(k))));
    assert.deepEqual(after,progress,'Navigation must preserve local progress');
    result.flows.push({state,first,second,backButton:true,reloadPlace:true,badgePicker:true,progressPreserved:true});
   }
   result.passed=true;await ctx.close();
  }catch(e){result.passed=false;result.failure=String(e.stack||e);console.error(result.failure);}
  finally{await browser?.close();results.push(result);console.log('NAVIGATION RESULT '+JSON.stringify(result));}
 }
}finally{await new Promise(r=>server.close(r));}
assert.ok(results.every(r=>r.passed),'Full touch navigation must pass on both engines');
