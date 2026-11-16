import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright';
const root=process.cwd(),id='schiollgarden_prinsens_gate_26';
const member=JSON.parse(fs.readFileSync(`data/runtime/place-open/${id}.json`)).place.structures[0];
assert.equal(member.id,'stortingets_post_og_varemottak');
const output='artifacts/schiollgarden-structures-browser';fs.mkdirSync(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;const results=[];
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const width of [390,820,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},isMobile:width===390,hasTouch:width<1440,locale:'nb-NO'});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1');});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(`http://127.0.0.1:${server.address().port}/index.html?hgTest=1#/place/${id}`,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(id=>window.__HG_APP_READY__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId===id,id,{timeout:90000});
   await page.waitForFunction(()=>window.HGPlaceCardCollections?.getItems(window.PLACES.find(p=>p.id==='schiollgarden_prinsens_gate_26'),'structures').length===1);
   const icon=page.locator('#pcCategoryCollectionIcon');
   await icon.waitFor({state:'visible'});await icon.click();
   const popup=page.locator('.placecard-round-popup.visible');await popup.waitFor({state:'visible'});
   assert.match(await popup.innerText(),/mai 2016/);
   assert.match(await popup.innerText(),/Foto: Stortinget/);
   assert.doesNotMatch(await popup.innerText(),/Illustrasjon|CC BY/);
   const photo=popup.locator(`img[src="${member.image}"]`).first();
   await photo.waitFor({state:'attached'});await photo.scrollIntoViewIfNeeded();
   await photo.evaluate(img=>img.decode());
   assert.equal(await photo.evaluate(img=>img.complete&&img.naturalWidth===1024&&img.naturalHeight===684),true);
   const links=popup.locator('a.pc-structure-source-link');
   assert.equal(await links.first().getAttribute('href'),member.imageMeta.sourcePage);
   const bounds=await popup.boundingBox();assert.ok(bounds.x>=-1&&bounds.x+bounds.width<=width+1);
   await page.screenshot({path:`${output}/structures-${width}.png`,fullPage:true,animations:'disabled'});
   assert.deepEqual(errors,[]);results.push({width,id:member.id,loadedPhoto:true,datedConstruction:true,sourceCredit:true,errors});
   console.log('PASS Schiollgarden documentary construction photo and source credit '+width);
  }catch(e){await page.screenshot({path:`${output}/failure-${width}.png`,fullPage:true});throw e;}finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(r=>server.close(r));}
fs.writeFileSync(output+'/summary.json',JSON.stringify(results,null,2)+'\n');
