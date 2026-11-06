import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const root=process.cwd();
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const u=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(u==='/'?'/index.html':u));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
fs.mkdirSync('artifacts/toyen-trafo-ots-news',{recursive:true});
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
   const news=page.locator('[data-hg-place-sheet-section="news"]');
   await page.waitForFunction(()=>{
      const slot=document.querySelector('#placeCard [data-hg-place-sheet-section="news"]');
      const article=slot?.querySelector('.pc-sheet-news-card');
      return slot && !slot.hidden && slot.dataset.placeId==='toyen_trafo'
        && article?.textContent?.includes('Oslo Fri verkstedival');
   },null,{timeout:75000});
   const nav=page.locator('[data-hg-place-sheet-jump="news"]');
   await nav.waitFor({state:'visible',timeout:20000});
   await nav.click({timeout:16000});
   const content=await news.locator('.pc-sheet-news-card').innerText();
   assert.match(content,/4\. desember 2026/i);
   assert.match(content,/3\. november 2026/i);
   const link=await news.locator('a.hg-place-news-source').getAttribute('href');
   assert.equal(link,'https://osloteatersenter.no/2026/11/03/oslo-fri-verkstedival-4-desember/');
   assert.equal(errors.length,0,label+' runtime errors: '+errors.join(' / '));
   await page.screenshot({path:'artifacts/toyen-trafo-ots-news/'+label+'.png',fullPage:false});
   console.log(label+': native Place Sheet news tab renders dated, official 2026 OTS announcement with working source link');
  }finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
