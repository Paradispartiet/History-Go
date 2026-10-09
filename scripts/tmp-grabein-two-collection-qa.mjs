import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';
const root=process.cwd(),placeId='museumsleiligheten_grabein';
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.woff':'font/woff','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const raw=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 const file=path.resolve(root,'.'+(raw==='/'?'/index.html':raw));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('missing');return;}
 res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [profile,viewport,mobile] of [['desktop',{width:1440,height:1000},false],['mobile',{width:390,height:844},true]]){
  const ctx=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile}),page=await ctx.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1')});
  await page.goto(base+'/index.html?hgTest=1#/place/'+placeId,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(id=>window.__HG_APP_READY__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId===id,placeId,{timeout:90000});
  await page.waitForFunction(()=>{
    const card=document.querySelector('.pc-icons-quad');return card&&card.dataset.collectionCount==='2'
      &&document.querySelector('#pcBrandsIcon')?.dataset.previewStatus==='member-image'
      &&document.querySelector('#pcCategoryCollectionIcon')?.dataset.previewStatus==='member-image';
  },{timeout:30000});
  const state=await page.evaluate(()=>{
   const css=sel=>document.querySelector(sel),read=sel=>{
     const el=css(sel),img=el?.querySelector('img'),r=el?.getBoundingClientRect();
     return {source:el?.dataset.collectionId,preview:el?.dataset.previewStatus,loaded:!!img&&img.complete&&img.naturalWidth>0,
       path:img?.getAttribute('src'),width:r?.width,height:r?.height,hidden:el?.hidden};
   };
   return {brand:read('#pcBrandsIcon'),event:read('#pcCategoryCollectionIcon'),
     count:css('.pc-icons-quad')?.dataset.collectionCount,
     overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
  });
  assert.equal(state.count,'2');assert.equal(state.brand.source,'brands');assert.equal(state.brand.loaded,true);
  assert.match(state.brand.path,/oslo_museum\.svg/);assert.equal(state.event.source,'historical_events');assert.equal(state.event.loaded,true);
  assert.equal(state.brand.hidden,false);assert.equal(state.event.hidden,false);assert.ok(state.overflow<=2);
  await page.evaluate(()=>window.expandPlaceCard());
  await page.waitForFunction(()=>{
    const pc=document.getElementById('placeCard');return !!pc&&pc.classList.contains('is-open')&&!pc.classList.contains('is-hidden')&&
      pc.getBoundingClientRect().width>100&&pc.getBoundingClientRect().height>120&&getComputedStyle(pc).display!=='none';
  },{timeout:25000});
  const pos=await page.evaluate(()=>{
    const pc=document.getElementById('placeCard'),r=pc.getBoundingClientRect(),front=document.getElementById('pcFrontImage');
    const p=front?.getBoundingClientRect();
    return {cardClasses:pc.className,cardRect:{top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height},
      frontImage:{loaded:!!front&&front.complete&&front.naturalWidth>0,top:p?.top,width:p?.width,height:p?.height},
      viewport:{width:innerWidth,height:innerHeight}};
  });
  console.log('HG_GRABEIN_OPEN_CARD '+JSON.stringify({profile,pos}));
  assert.ok(pos.cardRect.top>=0&&pos.cardRect.bottom<=viewport.height+2,profile+' card fits viewport');
  assert.ok(pos.frontImage.loaded,profile+' front image loads');
  await page.screenshot({path:'grabein-two-collections-'+profile+'-before-popup.png',fullPage:true});
  await page.locator('#pcBrandsIcon').click();
  const popup=page.locator('.hg-popup.placecard-round-popup.visible');
  await popup.waitFor({state:'visible',timeout:12000});
  assert.match(await popup.innerText(),/Oslo Museum/);
  await page.screenshot({path:'grabein-two-collections-'+profile+'.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('HG_GRABEIN_TWO_ROUNDS_PASS '+JSON.stringify({profile,...state}));
  await ctx.close();
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
