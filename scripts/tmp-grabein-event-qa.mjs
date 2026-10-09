import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const id='museumsleiligheten_grabein';
const root=process.cwd();
const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://127.0.0.1');
  const relative=decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname);
  const file=path.resolve(root,'.'+relative);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
  const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [name,viewport,mobile] of [['desktop',{width:1440,height:1000},false],['mobile',{width:390,height:844},true]]){
  const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1')});
  await page.goto(base+'/index.html?hgTest=1#/place/'+id,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(key=>window.__HG_APP_READY__===true && document.getElementById('placeCard')?.dataset?.currentPlaceId===key,id,{timeout:90000});
  await page.waitForFunction(()=>document.getElementById('pcCategoryCollectionIcon')?.dataset.collectionId==='historical_events',{timeout:30000});
  await page.waitForFunction(()=>document.getElementById('pcCategoryCollectionIcon')?.dataset.collectionItemCount==='1',{timeout:30000});
  const state=await page.evaluate(()=>{
    const icon=document.getElementById('pcCategoryCollectionIcon');
    const img=icon.querySelector('img');
    return {id:icon.dataset.collectionId,count:icon.dataset.collectionItemCount,visible:icon.getBoundingClientRect().width>0,imageReady:img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
  });
  assert.equal(state.id,'historical_events');assert.equal(state.count,'1');assert.equal(state.visible,true);assert.equal(state.imageReady,true);assert.ok(state.overflow<=2);
  await page.locator('#pcCategoryCollectionIcon').click();
  const popup=page.locator('.hg-popup.placecard-round-popup.visible');
  await popup.waitFor({state:'visible',timeout:12000});
  const txt=await popup.innerText();
  assert.match(txt,/1888/);assert.match(txt,/Tøyengata/);
  assert.deepEqual(errors,[]);
  console.log('HG_GRABEIN_EVENT_PASS '+JSON.stringify({profile:name,...state,popupTextLength:txt.length}));
  await context.close();
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
