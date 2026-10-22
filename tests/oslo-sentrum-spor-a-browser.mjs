#!/usr/bin/env node
// Real History GO browser review for this account's separate Oslo sentrum PR.
// This tests app rendering; it does NOT award v1 and it does NOT replace human image review.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root=process.cwd(), ids=['oslo_posthus','telegrafbygningen'];
const out=path.resolve(root,'artifacts/oslo-sentrum-spor-a-browser');
fs.mkdirSync(out,{recursive:true});
const media={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const canonical=Object.fromEntries(ids.map(id=>{
 const place=JSON.parse(fs.readFileSync(path.join(root,'data/runtime/place-open',id+'.json'),'utf8')).place;
 assert.equal(place.id,id);
 assert.equal(place.fagverk?.status,'curated');
 assert.equal(place.fagverk?.schema,'history_go_place_fagverk_v2');
 return [id,place];
}));
const photo=canonical.telegrafbygningen;
assert.equal(photo.frontImageMeta?.license,'CC BY-SA 4.0');
assert.equal(photo.frontImageMeta?.creator,'Helge Høifødt');
assert.match(photo.frontImage||'',/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//);
assert.equal(photo.frontImageMeta?.delivery,'remote_original_provisional');
assert.ok(photo.externalLinks?.some(x=>x.url===photo.frontImageMeta?.sourcePage));
const server=http.createServer((req,res)=>{
 const uri=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(uri.pathname);
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'Content-Type':media[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const report={schema:'history_go_oslo_sentrum_a_real_browser_review_v1',places:ids,checks:[],errors:[],v1Approved:false,photoStatus:'remote_portrait_pending_local_asset_and_editorial_review'};
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [label,width,height,isMobile] of [['mobile',390,844,true],['desktop',1440,1000,false]]){
  const context=await browser.newContext({viewport:{width,height},isMobile,hasTouch:isMobile});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1')});
  const page=await context.newPage();
  const errs=[];
  page.on('pageerror',e=>errs.push(String(e.message||e)));
  for(const id of ids){
   const result={id,viewport:label,width,placeCard:false,heroDecoded:false,frontDecoded:false,quizCardVisible:false,fagverk:false,problems:[]};
   try{
    await page.goto(base+'/index.html?hgTest=1#/place/'+id,{waitUntil:'domcontentloaded',timeout:65000});
    await page.waitForFunction(placeId=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId===placeId,id,{timeout:70000});
    await page.waitForFunction(()=>document.querySelector('#pcFrontImage')?.complete&&document.querySelector('#pcFrontImage')?.naturalWidth>0,null,{timeout:30000});
    await page.waitForFunction(()=>document.querySelector('#pcHeaderImage')?.complete&&document.querySelector('#pcHeaderImage')?.naturalWidth>0,null,{timeout:15000});
    const details=await page.evaluate(()=>({
     title:document.querySelector('#pcTitle')?.textContent||'',
     open:document.querySelector('#placeCard')?.classList.contains('is-open')||false,
     hero:document.querySelector('#pcHeaderImage')?.naturalWidth||0,
     front:document.querySelector('#pcFrontImage')?.naturalWidth||0,
     source:document.querySelector('#pcFrontImage')?.currentSrc||'',
     quizReady:Boolean(document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card'))
    }));
    assert.ok(details.title.includes(canonical[id].name),'Incorrect PlaceCard title');
    assert.ok(details.open,'PlaceCard is not visible');
    assert.ok(details.hero>0&&details.front>0,'Front or hero photo not decoded');
    if(id==='telegrafbygningen')assert.ok(details.source.includes('upload.wikimedia.org'),'Not using identified Commons portrait');
    result.placeCard=true;result.frontDecoded=true;result.heroDecoded=true;
    await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card')&&Boolean(document.querySelector('#pcQuizCardContent .pc-rendered-quiz-card')),null,{timeout:35000});
    result.quizCardVisible=true;
    await page.screenshot({path:path.join(out,id+'-'+label+'-placecard.png'),fullPage:false});
   }catch(e){result.problems.push('PlaceCard: '+String(e).slice(0,280));}
   try{
    await page.goto(base+'/fagverk-sted.html?place='+id,{waitUntil:'domcontentloaded',timeout:55000});
    await page.waitForFunction(()=>document.querySelector('#fagverkPlaceContent')?.hidden===false,null,{timeout:35000});
    const title=await page.locator('#fagverkPlaceTitle').innerText();
    const lenses=await page.locator('#fagverkPlaceLenses a').count();
    assert.match(title,new RegExp(id==='oslo_posthus'?'post|hovedpost':'telegraf','i'));
    assert.ok(lenses>=3,'Stedsspesifikke faglige linser mangler');
    assert.equal(await page.locator('#fagverkPlaceError').isHidden(),true);
    result.fagverk=true;
    await page.screenshot({path:path.join(out,id+'-'+label+'-fagverk.png'),fullPage:false});
   }catch(e){result.problems.push('Fagverk: '+String(e).slice(0,280));}
   if(errs.length)result.problems.push('Browser JavaScript errors: '+errs.slice(0,3).join('; '));
   report.checks.push(result);
   if(result.problems.length)report.errors.push({id,viewport:label,problems:result.problems});
   console.log('OSLO_SEN_TRY',id,label,result.problems.length?'BLOCKED':'PASS');
  }
  await context.close();
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
}
report.status=report.errors.length?'BLOCKED':'BROWSER_PASS_EDITORIAL_AND_LOCAL_PHOTO_STILL_PENDING';
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log('OSLO_SEN_SUMMARY',JSON.stringify({count:report.checks.length,errors:report.errors.length,status:report.status}));
if(report.errors.length)process.exitCode=1;
