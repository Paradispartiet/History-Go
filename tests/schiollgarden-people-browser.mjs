import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {chromium} from 'playwright';
import {validatePeopleClaimsDocument} from '../tools/audit-people-profile-canonical.mjs';
const ROOT=process.cwd(),ID='schiollgarden_prinsens_gate_26';
const p=JSON.parse(fs.readFileSync(`data/people/by/oslo/${ID}/henrik_nissen.json`));
const claims=JSON.parse(fs.readFileSync(p.claimsFile));
assert.deepEqual(validatePeopleClaimsDocument(claims,p,{claimsPath:p.claimsFile}),[]);
const payload=JSON.parse(fs.readFileSync(`data/runtime/place-open/${ID}.json`));
assert.deepEqual(payload.people.find(x=>x.id===p.id),p);
const output='artifacts/schiollgarden-people-browser';fs.mkdirSync(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 let url;try{url=new URL(req.url,'http://127.0.0.1')}catch{res.writeHead(400);res.end();return;}
 const pathname=decodeURIComponent(url.pathname),file=path.resolve(ROOT,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port;

let browser;const results=[];
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const width of [390,820,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width<1440,isMobile:width===390});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1');});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(url+'/index.html?hgTest=1#/place/'+ID,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(id=>window.__HG_APP_READY__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId===id,ID,{timeout:90000});
   await page.waitForFunction(()=>document.getElementById('pcPeopleIcon')?.dataset.collectionItemCount==='1'&&(window.getPeopleForPlace?.('schiollgarden_prinsens_gate_26')||[]).some(p=>p.id==='henrik_nissen'),null,{timeout:60000});
   await page.locator('#pcPeopleIcon').click();
   await page.locator('.placecard-round-popup [data-person="henrik_nissen"]').click();
   const popup=page.locator('.person-popup-v2').last();
   await popup.waitFor({state:'visible'});
   const img=popup.locator('[data-person-hero-image]');
   await img.waitFor({state:'visible'});
   await page.waitForFunction(()=>{const img=document.querySelector('.person-popup-v2 [data-person-hero-image]');return img?.complete&&img.naturalWidth===369;});
   assert.match(await popup.innerText(),/Henrik Nissen/);
   const bio=(await popup.locator('.hg-person-longread').innerText()).replace(/\s+/g,' ').trim();
   assert.equal(bio,p.popupDesc.replace(/\s+/g,' ').trim());
   assert.ok((await popup.innerText()).includes('Bauakademie'));
   assert.ok((await popup.innerText()).includes('Schiøllgården'));
   assert.ok(await popup.locator('a[href="https://nbl.snl.no/Henrik_Nissen"]').count());
   assert.equal(await img.getAttribute('src'),p.image);
   await page.screenshot({path:`${output}/person-${width}.png`,fullPage:true});
   assert.deepEqual(errors,[]);
   results.push({width,person:p.id,portraitLoaded:true,fullBiography:true,errors});
   console.log('PASS Schiollgarden canonical person popup '+width);
  }catch(e){await page.screenshot({path:`${output}/failure-${width}.png`,fullPage:true});throw e;}finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(r=>server.close(r));}
fs.writeFileSync(output+'/summary.json',JSON.stringify(results,null,2)+'\n');
