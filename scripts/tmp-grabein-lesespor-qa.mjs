import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root=process.cwd(),id='museumsleiligheten_grabein';
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const reqPath=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 const file=path.resolve(root,'.'+(reqPath==='/'?'/index.html':reqPath));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('missing');return;}
 res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [profile,viewport,mobile] of [['desktop',{width:1440,height:1000},false],['mobile',{width:390,height:844},true]]){
  const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  await page.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1')});
  await page.goto(base+'/index.html?hgTest=1#/place/'+id,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(id=>window.__HG_APP_READY__===true&&document.getElementById('placeCard')?.dataset.currentPlaceId===id,id,{timeout:90000});
  await page.waitForFunction(()=>typeof window.showPlacePopup==='function'&&typeof window.HGPlacePopupTabs?.resolveLesespor==='function',{timeout:30000});
  await page.evaluate(async key=>{await window.showPlacePopup(key)},id);
  await page.waitForFunction(()=>document.querySelector('#hg-place-panel-reading .hg-place-reading-card')!==null,{timeout:45000});
  const state=await page.evaluate(()=>{
   const tab=document.querySelector('[data-place-tab="reading"]'),panel=document.getElementById('hg-place-panel-reading');
   tab?.click();
   const cards=[...panel.querySelectorAll('.hg-place-reading-card')].map(c=>({title:c.querySelector('strong')?.textContent,url:c.querySelector('a')?.href,text:c.textContent}));
   return {count:cards.length,cards,selected:tab?.getAttribute('aria-selected'),hidden:panel.hidden,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth};
  });
  assert.equal(state.count,2);assert.equal(state.selected,'true');assert.equal(state.hidden,false);
  assert.ok(state.cards.some(x=>x.url==='https://www.bokselskap.no/boker/ulvehiet/ulvehiet-kaldes-de'));
  assert.ok(state.cards.some(x=>x.url==='https://lokalhistoriewiki.no/wiki/Museumsleilighet_i_T%C3%B8yengata'));
  assert.ok(state.cards.some(x=>x.text.includes('ikke som dokumentasjon')));
  assert.ok(state.scrollWidth-state.clientWidth<=2,'no horizontal overflow');
  assert.deepEqual(errors,[]);
  console.log('HG_GRABEIN_READING_PASS '+JSON.stringify({profile,count:state.count,selected:state.selected,hidden:state.hidden,overflow:state.scrollWidth-state.clientWidth,links:state.cards.map(c=>c.url)}));
  await context.close();
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
