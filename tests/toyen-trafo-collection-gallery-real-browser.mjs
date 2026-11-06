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
fs.mkdirSync('artifacts/toyen-trafo-collection-gallery',{recursive:true});

let browser;
try {
  browser=await chromium.launch({
    headless:true,executablePath:process.env.CHROME_BIN||undefined,
    args:['--no-sandbox','--disable-dev-shm-usage']
  });
  for(const [label,width,height,mobile] of [['mobile',390,844,true],['desktop',1440,1000,false]]){
    const context=await browser.newContext({
      viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO'
    });
    await context.addInitScript(()=>{
      localStorage.setItem('hg_onboarding_shown_v1','1');
      localStorage.setItem('HG_TEST_MODE','1');
    });
    try {
      const openPage=async()=>{
        const page=await context.newPage();
        await page.goto(base+'/index.html?hgTest=1#/place/toyen_trafo',{waitUntil:'domcontentloaded',timeout:90000});
        await page.waitForFunction(()=>
          window.__HG_APP_READY__===true &&
          window.__HG_ROUTER_STARTED__===true &&
          document.querySelector('#placeCard')?.dataset.currentPlaceId==='toyen_trafo',
          null,{timeout:90000});
        return page;
      };

      const servicePage=await openPage();
      const serviceErrors=[];
      servicePage.on('pageerror',e=>serviceErrors.push(String(e)));
      const service=servicePage.locator('[data-pc-round-gallery-item="pcCategoryCollectionIcon"]');
      await service.waitFor({state:'visible',timeout:65000});
      await servicePage.waitForFunction(()=>{
        const b=document.querySelector('[data-pc-round-gallery-item="pcCategoryCollectionIcon"]');
        const img=b?.querySelector('img');
        return b instanceof HTMLButtonElement&&img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0;
      },null,{timeout:30000});
      const serviceText=await service.locator('.pc-round-gallery-label').textContent();
      assert.equal(serviceText?.trim(),'Produksjon og tjenester',label+' must expose correct service category');
      await service.click({timeout:15000});
      const servicePopup=servicePage.locator('.hg-popup.placecard-round-popup.visible');
      await servicePopup.waitFor({state:'visible',timeout:20000});
      const body=await servicePopup.innerText();
      assert.match(body,/Produksjon og tjenester/i,label+' wrong popup title');
      assert.match(body,/prøvelokaler/i,label+' real service missing');
      assert.match(body,/Tårnrom/i,label+' verified room missing');
      await servicePage.screenshot({path:'artifacts/toyen-trafo-collection-gallery/'+label+'-service.png',fullPage:false});
      assert.equal(serviceErrors.length,0,label+' service errors '+serviceErrors.join('/'));
      await servicePage.close();

      const objectsPage=await openPage();
      const objectsErrors=[];
      objectsPage.on('pageerror',e=>objectsErrors.push(String(e)));
      const historyNav=objectsPage.locator('[data-hg-place-sheet-jump="history"]');
      await historyNav.waitFor({state:'visible',timeout:60000});
      await historyNav.click({timeout:20000});
      const objects=objectsPage.locator('[data-pc-round-gallery-item="pcObjectsIcon"]');
      await objects.waitFor({state:'visible',timeout:60000});
      await objectsPage.waitForFunction(()=>{
        const b=document.querySelector('[data-pc-round-gallery-item="pcObjectsIcon"]');
        const img=b?.querySelector('img');
        return b instanceof HTMLButtonElement&&img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0;
      },null,{timeout:20000});
      assert.match(await objects.locator('.pc-round-gallery-label').textContent(),/Gjenstander/i);
      await objects.click({timeout:15000});
      const objectsPopup=objectsPage.locator('.hg-popup.placecard-round-popup.visible');
      await objectsPopup.waitFor({state:'visible',timeout:20000});
      const objectsText=await objectsPopup.innerText();
      assert.match(objectsText,/Apparatpult/i,label+' archival control panel missing');
      assert.match(objectsText,/Transformatorkjerne/i,label+' archival transformer core missing');
      await objectsPage.screenshot({path:'artifacts/toyen-trafo-collection-gallery/'+label+'-objects.png',fullPage:false});
      assert.equal(objectsErrors.length,0,label+' objects errors '+objectsErrors.join('/'));
      await objectsPage.close();
      console.log(label+': clickable visible service and objects gallery buttons, correct canonical popup content');
    } finally { await context.close(); }
  }
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
