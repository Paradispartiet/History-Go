import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright';
const root=process.cwd(),id='schiollgarden_prinsens_gate_26';
const actor=JSON.parse(fs.readFileSync('data/brands/actors_by_place.json'))[id][0];
assert.equal(actor.id,'stortinget_nasjonalforsamling');
assert.deepEqual(JSON.parse(fs.readFileSync(`data/runtime/place-open/${id}.json`)).brands,[actor]);
const output='artifacts/schiollgarden-brands-browser';fs.mkdirSync(output,{recursive:true});
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
   await page.waitForFunction(id=>window.HGBrands?.ready&&window.HGBrands.getByPlace(id).length===1,id,{timeout:60000});
   const rows=await page.evaluate(id=>window.HGBrands.getByPlace(id),id);
   assert.equal(rows[0].desc,actor.desc,'place-specific description, not another place');
   assert.equal(rows[0].actor_role,actor.actor_role);
   assert.deepEqual(rows[0].source_urls,actor.source_urls);
   const button=page.locator('.pc-round-gallery-brand-button');
   await button.waitFor({state:'visible',timeout:60000});
   await page.waitForFunction(()=>{const img=document.querySelector('.pc-round-gallery-brand-button img');return img?.complete&&img.naturalWidth===800;});
   assert.ok((await button.locator('img').getAttribute('src')).includes(actor.image));
   await button.click();
   const popup=page.locator('.placecard-round-popup.visible');await popup.waitFor({state:'visible'});
   assert.match(await popup.innerText(),/Stortinget/);
   const logo=popup.locator(`img[src="${actor.image}"]`).first();
   await logo.waitFor({state:'attached'});await logo.scrollIntoViewIfNeeded();
   assert.equal(await logo.evaluate(img=>img.complete&&img.naturalWidth===800),true);
   await page.screenshot({path:`${output}/brands-${width}.png`,fullPage:true,animations:'disabled'});
   assert.deepEqual(errors,[]);results.push({width,id:actor.id,loadedLogo:true,placeContext:true,errors});
   console.log('PASS Schiollgarden institutional actor, verified existing symbol and source context '+width);
  }catch(e){await page.screenshot({path:`${output}/failure-${width}.png`,fullPage:true});throw e;}finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(r=>server.close(r));}
fs.writeFileSync(output+'/summary.json',JSON.stringify(results,null,2)+'\n');
