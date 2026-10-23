#!/usr/bin/env node
// Real app browser evidence for Oslo tinghus in the separate Oslo sentrum Place track.
// This does not promote the Place to v1 or change any other account's Oslo batch.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root=process.cwd(),id='tinghuset', out=path.resolve('artifacts/oslo-tinghuset-live-browser');
const canonical=JSON.parse(fs.readFileSync('data/places/politikk/oslo/places_politikk/tinghuset.json','utf8'));
const runtime=JSON.parse(fs.readFileSync('data/runtime/place-open/tinghuset.json','utf8'));
assert.equal(canonical.id,id);
assert.equal(runtime.place?.id,id);
assert.equal(runtime.place?.fagverk?.status,'curated');
assert.equal(runtime.place?.fagverk?.schema,'history_go_place_fagverk_v2');
assert.equal(canonical.imageMeta?.license,'Public domain');
assert.ok(fs.statSync(canonical.image).size>8000);
assert.ok(fs.statSync(canonical.cardImage).size>8000);
assert.equal(canonical.frontImage,'bilder/places/tinghuset_front_portrait.webp');
assert.equal(canonical.frontImageMeta?.license,'Public domain');
assert.equal(canonical.frontImageMeta?.creator,'Mahlum');
assert.equal(canonical.frontImageMeta?.sourcePage,'https://commons.wikimedia.org/wiki/File:Oslo_tinghus.jpg');
assert.match(canonical.frontImageMeta?.outputSha256||'',/^[a-f0-9]{64}$/);
assert.ok(fs.statSync(canonical.frontImage).size>20000);
assert.equal(runtime.place?.frontImage,canonical.frontImage);
fs.mkdirSync(out,{recursive:true});
const mime={'.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.html':'text/html','.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const target=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(target==='/'?'/index.html':target));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const result={schema:'history-go-tinghuset-real-browser-evidence-v1',v1Approved:false,checks:[],errors:[]};
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [label,width,height,mobile] of [['mobile',390,844,true],['desktop',1440,1000,false]]){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile});
  await ctx.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1')});
  const page=await ctx.newPage(); const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e.message||e)));
  const check={viewport:label,width,placeCard:false,photos:false,quizCard:false,fagverk:false,errors:[]};
  try{
   await page.goto(base+'/index.html?hgTest=1#/place/'+id,{waitUntil:'domcontentloaded',timeout:70000});
   await page.waitForFunction(()=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId==='tinghuset',null,{timeout:80000});
   await page.waitForFunction(()=>document.querySelector('#pcFrontImage')?.complete&&document.querySelector('#pcFrontImage')?.naturalWidth>0&&document.querySelector('#pcHeaderImage')?.naturalWidth>0,null,{timeout:35000});
   const actualTitle=await page.locator('#pcTitle').innerText();
   assert.match(actualTitle,/tinghus/i);
   const imgs=await page.evaluate(()=>({hero:document.querySelector('#pcHeaderImage')?.naturalWidth||0,front:document.querySelector('#pcFrontImage')?.naturalHeight||0,frontSrc:document.querySelector('#pcFrontImage')?.currentSrc||''}));
   assert.ok(imgs.frontSrc.includes('tinghuset_front_portrait.webp'),'PlaceCard must render separately sourced portrait');
   assert.ok(imgs.hero>0&&imgs.front>0);
   check.placeCard=true;check.photos=true;
   await page.screenshot({path:path.join(out,'tinghuset-'+label+'-front.png'),fullPage:false});
   await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card')&&Boolean(document.querySelector('#pcQuizCardContent .pc-rendered-quiz-card')),null,{timeout:35000});
   const card=page.locator('#pcFrontCardFlip'),rect=await card.boundingBox();
   assert.ok(rect?.height>75,'Flip card has no visible bounds');
   await card.click({position:{x:20,y:Math.max(24,rect.height-25)},timeout:10000});
   await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:12000});
   await page.waitForTimeout(700);
   const quiz=await page.locator('.pc-card-face-back').evaluate(el=>({visibility:getComputedStyle(el).visibility,chars:(el.textContent||'').trim().length}));
   assert.equal(quiz.visibility,'visible');
   assert.ok(quiz.chars>60);
   check.quizCard=true;
   await page.screenshot({path:path.join(out,'tinghuset-'+label+'-quizcard.png'),fullPage:false});
  }catch(e){check.errors.push('PlaceCard/QuizCard: '+String(e).slice(0,360));}
  try{
   await page.goto(base+'/fagverk-sted.html?place='+id,{waitUntil:'domcontentloaded',timeout:55000});
   await page.waitForFunction(()=>document.querySelector('#fagverkPlaceContent')?.hidden===false,null,{timeout:35000});
   assert.match(await page.locator('#fagverkPlaceTitle').innerText(),/tinghus/i);
   assert.ok(await page.locator('#fagverkPlaceLenses a').count()>=3);
   assert.equal(await page.locator('#fagverkPlaceError').isHidden(),true);
   check.fagverk=true;
   await page.screenshot({path:path.join(out,'tinghuset-'+label+'-fagverk.png'),fullPage:false});
  }catch(e){check.errors.push('Fagverk: '+String(e).slice(0,360));}
  if(pageErrors.length)check.errors.push('Page errors: '+pageErrors.slice(0,3).join('; '));
  result.checks.push(check);if(check.errors.length)result.errors.push({viewport:label,problems:check.errors});
  console.log('TINGHUSET_NATIVE_BROWSER',label,check.errors.length?'BLOCKED':'PASS',JSON.stringify(check));
  await ctx.close();
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
result.status=result.errors.length?'BLOCKED':'BROWSER_PASS_EDITORIAL_REVIEW_PENDING';
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2)+'\n');
if(result.errors.length)process.exitCode=1;
