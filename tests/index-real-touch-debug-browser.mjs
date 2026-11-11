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
 // Native touch with scrolling, stability and hit-target checks; never force input.
 await page.locator(selector).tap();
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
  const selected=markers.find(m=>document.elementFromPoint(m.x,m.y)?.closest?.('[data-place-id]')?.dataset.placeId===m.id)||markers.find(m=>m.hits[0]===m.id);
  const stack=selected?document.elementsFromPoint(selected.x,selected.y).slice(0,8).map(n=>({id:n.id,cls:String(n.className),z:getComputedStyle(n).zIndex,pe:getComputedStyle(n).pointerEvents,display:getComputedStyle(n).display,visibility:getComputedStyle(n).visibility})):[];
  return {selected,markers:markers.slice(0,12),stack};
 },previousId);
 console.log('MARKER '+JSON.stringify(probe));assert.ok(probe.selected,'A visible, unobstructed place marker is required');
 const hit=probe.selected;
 await page.touchscreen.tap(hit.x,hit.y);await cardVisible(page,hit.id);
 console.log('PLACE OPENED '+hit.id+' '+page.url());return hit.id;
}
async function backToMap(page){
 await tap(page,'[data-hg-nav-back]');
 await page.waitForURL(/#\/map$/,{timeout:30000});await ready(page);
 await page.waitForFunction(()=>{
  const c=document.getElementById('placeCard');if(!c)return true;const s=getComputedStyle(c);return !c.dataset.currentPlaceId&&c.getAttribute('aria-hidden')==='true'&&(s.display==='none'||(s.pointerEvents==='none'&&Number(s.opacity)===0));
 },null,{timeout:15000});
 console.log('BACK TO MAP '+page.url());
}
async function exerciseFavoriteMapPicker(page, favoriteId) {
 await page.waitForFunction(() => !!document.querySelector('.map-controls .hg-map-favorite-filter #hgMapFavoriteTrigger'),null,{timeout:15000});
 const button=page.locator('#hgMapFavoriteTrigger');
 assert.equal(await button.evaluate(el=>el.closest('.map-controls')!==null),true);
 await tap(page,'#hgMapFavoriteTrigger');
 await page.locator('#hgHomeFavoriteMapPicker').waitFor({state:'visible'});
 await tap(page,'[data-favorite-view="favorites"]');
 await page.waitForFunction(() => window.HGMap?.getFavoriteViewOnly?.()===true);
 assert.equal(await page.evaluate(id=>window.HGFavoritePlaces.has(id)),true,'Favorite comes from PlaceCard star');
 await tap(page,'[data-favorite-style="star"]');
 await page.waitForFunction(()=>window.HGMap?.getFavoriteMarkerStyle?.()==='star');
 await tap(page,'[data-favorite-view="all"]');
 await page.waitForFunction(()=>window.HGMap?.getFavoriteViewOnly?.()===false);
 await tap(page,'[data-favorite-close]');
 await page.locator('#hgHomeFavoriteMapPicker').waitFor({state:'hidden'});
 await tap(page,'#headerMenuButton');
 await page.waitForFunction(()=>document.getElementById('headerMenuButton')?.getAttribute('aria-expanded')==='true');
 await tap(page,'#headerMenuButton');
 await page.waitForFunction(()=>document.getElementById('headerMenuButton')?.getAttribute('aria-expanded')==='false');
 console.log('FAVORITE MAP PICKER PASSED '+favoriteId);
}
async function exerciseCard(page,id){
 await cardVisible(page,id);
 await tap(page,'#headerMenuButton');
 await page.waitForFunction(()=>document.getElementById('headerMenuButton')?.getAttribute('aria-expanded')==='true');
 await tap(page,'#headerMenuButton');
 await page.waitForFunction(()=>document.getElementById('headerMenuButton')?.getAttribute('aria-expanded')==='false');
 await tap(page,'#pcRoute');
 try {
  await page.locator('#pcRouteMenu').waitFor({state:'visible'});
 } catch (error) {
  const detail=await page.evaluate(()=>{
   const card=document.getElementById('placeCard');
   const route=document.getElementById('pcRoute');
   const drawer=document.getElementById('nearbyListContainer');
   const rect=route?.getBoundingClientRect();
   const x=rect?(rect.left+rect.right)/2:0,y=rect?(rect.top+rect.bottom)/2:0;
   return {url:location.href,placeId:card?.dataset.currentPlaceId,cardHidden:card?.getAttribute('aria-hidden'),footerBound:window.__HG_FOOTER_ACTIONS_BOUND__,routeMenuExists:!!document.getElementById('pcRouteMenu'),routeHit:document.elementFromPoint(x,y)?.outerHTML.slice(0,400),drawerClass:drawer?.className,trace:window.HGDeviceTapTrace?.snapshot?.()||null};
  });
  console.error('ROUTE MENU AFTER TAP '+JSON.stringify(detail));
  throw error;
 }
 await tap(page,'#pcRoute');
 await page.locator('#pcRouteMenu').waitFor({state:'detached'});
 const favoriteBefore=await page.locator('#pcFavorite').textContent();
 await tap(page,'#pcFavorite');
 await page.waitForFunction(before=>document.getElementById('pcFavorite')?.textContent!==before,favoriteBefore);
 await tap(page,'#pcFavorite');
 await page.waitForFunction(before=>document.getElementById('pcFavorite')?.textContent===before,favoriteBefore);
 await tap(page,'#pcCollapseBtn');
 try {
  await page.waitForFunction(()=>document.getElementById('placeCard')?.getAttribute('aria-hidden')==='true');
 } catch (error) {
  const diagnostic = await page.evaluate(() => {
   const pc=document.getElementById('placeCard');
   const mini=document.getElementById('pcMini');
   const button=document.getElementById('pcCollapseBtn');
   const describe=el=>el?{className:el.className,ariaHidden:el.getAttribute('aria-hidden'),display:getComputedStyle(el).display,pointerEvents:getComputedStyle(el).pointerEvents}:null;
   return {url:location.href,placeCard:describe(pc),mini:describe(mini),collapseButton:describe(button),bodyClass:document.body.className,trace:window.HGDeviceTapTrace?.snapshot?.()||null};
  });
  console.error('COLLAPSE STATE AFTER TAP '+JSON.stringify(diagnostic));
  throw error;
 }
 // The footer thumbnail must still respond after a place was opened from the map.
 await tap(page,'#pcMini');await cardVisible(page,id);
}
try{
 for(const [name,engine,width,height] of [['webkit-ipad',webkit,820,1180],['chromium-phone',chromium,390,844]]){
  for(const tracing of [false,true]){
   let browser;
   const result={name,tracing,flows:[],errors:[]};
   try{
    browser=await engine.launch({headless:true});
    const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,locale:'nb-NO'});
    ctx.setDefaultTimeout(15000);
    // Keep native observers and input handling: never repair the app from the test.
    const page=await ctx.newPage();
    page.on('pageerror',e=>result.errors.push(e.message));
    const entry=base+'/index.html'+(tracing?'?hgTapTrace=1':'');
    await page.goto(entry+'#/map',{waitUntil:'domcontentloaded',timeout:60000});await ready(page);
    await page.locator('#hgOnboardingModal').waitFor({state:'visible',timeout:15000});
    await tap(page,'.hg-onb-close');
    await page.locator('#hgOnboardingModal').waitFor({state:'hidden'});
    if(tracing){
     await page.waitForFunction(()=>!!window.HGDeviceTapTrace);
     assert.equal(await page.locator('#hgDeviceTapTrace').evaluate(e=>getComputedStyle(e).pointerEvents),'none');
    }else{
     assert.equal(await page.evaluate(()=>typeof window.HGDeviceTapTrace),'undefined');
    }
    await page.waitForFunction(()=>!!window.HGMap?.getMap());
    let previousId;
    for(let i=0;i<2;i++){
     const id=await mapHit(page,previousId);
     await exerciseCard(page,id);
     if(tracing){
      const trace=await page.evaluate(()=>window.HGDeviceTapTrace.snapshot());
      assert.ok(trace.opens.some(e=>e.place===id));
      assert.ok(trace.events.some(e=>e.type==='click'));
      console.log('DEVICE TRACE '+JSON.stringify(trace));
     }
     // Save one favorite through the real PlaceCard action, then exercise
     // the homepage picker and confirm other UI stays tappable afterwards.
     if(i===0) {
      await tap(page,'#pcFavorite');
      await page.waitForFunction(id=>window.HGFavoritePlaces?.has?.(id)===true,id);
     }
     await backToMap(page);
     if(i===0) await exerciseFavoriteMapPicker(page,id);
     result.flows.push({place:id,mapTap:true,header:true,favorite:true,footer:true,back:true});
     previousId=id;
     // The shared back link intentionally navigates to the ordinary map URL.
     // Re-enter the explicit diagnostic URL before the next traced flow.
     if(tracing){
      await page.goto(entry+'#/map',{waitUntil:'domcontentloaded',timeout:60000});await ready(page);
      await page.waitForFunction(()=>!!window.HGDeviceTapTrace&&!!window.HGMap?.getMap());
     }
    }
    // Retain direct-link and returning-session coverage as a separate path.
    await page.goto(entry+'#/place/stortinget',{waitUntil:'domcontentloaded',timeout:60000});await ready(page);
    await exerciseCard(page,'stortinget');
    await page.reload({waitUntil:'domcontentloaded'});await ready(page);
    await exerciseCard(page,'stortinget');
    result.flows.push({place:'stortinget',directLink:true,reloaded:true});
    // WebKit can report cancelled fetches from a prior document when the test
    // navigates/reloads. Keep those separate from real application exceptions.
    const cancelledNavigationRequests=result.errors.filter(message=>
      message.endsWith(' due to access control checks.') &&
      (message.startsWith('/127.0.0.1:') || message.startsWith('/tiles.basemaps.cartocdn.com/'))
    );
    const applicationErrors=result.errors.filter(message=>!cancelledNavigationRequests.includes(message));
    result.cancelledNavigationRequests=cancelledNavigationRequests.length;
    if(cancelledNavigationRequests.length) console.log('CANCELLED NAVIGATION FETCHES '+cancelledNavigationRequests.length);
    assert.deepEqual(applicationErrors,[],'No uncaught application JavaScript errors');
    result.passed=true;await ctx.close();
   }catch(e){result.passed=false;result.failure=String(e.stack||e);console.error(result.failure);}
   finally{await browser?.close();results.push(result);console.log('NAVIGATION RESULT '+JSON.stringify(result));}
  }
 }
}finally{await new Promise(r=>server.close(r));}
assert.ok(results.length===4&&results.every(r=>r.passed),'Native touch navigation must pass with and without tracing on both engines');
