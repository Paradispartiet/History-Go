import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {chromium} from 'playwright';
import {validatePeopleClaimsDocument} from '../tools/audit-people-profile-canonical.mjs';
const ROOT=process.cwd(),ID='schiollgarden_prinsens_gate_26';
const profiles=[
 JSON.parse(fs.readFileSync(`data/people/by/oslo/${ID}/henrik_nissen.json`)),
 JSON.parse(fs.readFileSync(`data/people/naeringsliv/oslo/${ID}/hans_halvorsen_konditor.json`))
];
const payload=JSON.parse(fs.readFileSync(`data/runtime/place-open/${ID}.json`));
for(const p of profiles){
 assert.deepEqual(validatePeopleClaimsDocument(JSON.parse(fs.readFileSync(p.claimsFile)),p,{claimsPath:p.claimsFile}),[]);
 assert.deepEqual(payload.people.find(x=>x.id===p.id),p);
}
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
   await page.waitForFunction(ids=>document.getElementById('pcPeopleIcon')?.dataset.collectionItemCount===String(ids.length)&&ids.every(id=>(window.getPeopleForPlace?.('schiollgarden_prinsens_gate_26')||[]).some(p=>p.id===id)),profiles.map(p=>p.id),{timeout:60000});
   for(const p of profiles){
    await page.locator('#pcPeopleIcon').click();
    await page.locator(`.placecard-round-popup [data-person="${p.id}"]`).click();
    const popup=page.locator('.person-popup-v2').last();
    await popup.waitFor({state:'visible'});
    const img=popup.locator('[data-person-hero-image]');
    if(p.image){
     await img.waitFor({state:'visible'});
     await page.waitForFunction(()=>{const img=document.querySelector('.person-popup-v2 [data-person-hero-image]');return img?.complete&&img.naturalWidth===369;});
     assert.equal(await img.getAttribute('src'),p.image);
    }else{
     assert.equal(await img.isHidden(),true);
     assert.equal(await popup.locator('.hg-person-hero-placeholder strong').innerText(),p.initials);
    }
    assert.ok((await popup.innerText()).includes(p.name));
    const bio=(await popup.locator('.hg-person-longread').innerText()).replace(/\s+/g,' ').trim();
    assert.equal(bio,p.popupDesc.replace(/\s+/g,' ').trim());
    for(const source of p.source_urls)assert.ok(await popup.locator(`a[href="${source}"]`).count(),'Source missing: '+source);
    assert.equal(await popup.evaluate(el=>el.parentElement===document.body),true,'Viewport-framed People must not be moved into the scaled app shell');
    const onTop=await popup.locator('.hg-person-popup-header').evaluate(el=>{const r=el.getBoundingClientRect();return !!document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.person-popup-v2');});
    assert.equal(onTop,true,'Person profile must be above the active PlaceCard');
    await popup.locator('.hg-popup-close').click({trial:true});
    await page.screenshot({path:`${output}/person-${p.id}-${width}.png`,fullPage:true,animations:'disabled'});
    await popup.locator('.hg-person-longread').scrollIntoViewIfNeeded();
    await page.screenshot({path:`${output}/biography-${p.id}-${width}.png`,fullPage:true,animations:'disabled'});
    await popup.locator('.hg-popup-close').click();
    assert.equal(await page.locator('.person-popup-v2').count(),0);
    assert.equal(await page.locator('#placeCard').isVisible(),true);
    results.push({width,person:p.id,portraitLoaded:Boolean(p.image),initialsFallback:!p.image,fullBiography:true});
    console.log('PASS Schiollgarden canonical person popup '+p.id+' '+width);
   }
   assert.deepEqual(errors,[]);
   console.log('PASS Schiollgarden canonical person popup '+width);
  }catch(e){await page.screenshot({path:`${output}/failure-${width}.png`,fullPage:true});throw e;}finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(r=>server.close(r));}
fs.writeFileSync(output+'/summary.json',JSON.stringify(results,null,2)+'\n');
