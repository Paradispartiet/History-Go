#!/usr/bin/env node
// Real app QA for Oslo Prosjektrom, including full QuizCard flip on two viewports.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root=process.cwd();
const placeId='oslo_prosjektrom';
const place=JSON.parse(fs.readFileSync('data/places/kunst/oslo/places_kunst/oslo_prosjektrom.json','utf8'));
const runtime=JSON.parse(fs.readFileSync('data/runtime/place-open/oslo_prosjektrom.json','utf8'));
const cards=JSON.parse(fs.readFileSync('data/quizcards/kunst/oslo_prosjektrom_quizcard_v1.json','utf8'));
assert.equal(cards.production_status,'knowledge_linked');
assert.equal(cards.cards[0].questions.length,10);
assert.equal(runtime.place.id,placeId);
assert.equal(place.imageLicense,'CC BY-SA 4.0');
assert.equal(place.imageMeta?.license,'CC BY-SA 4.0');
assert.equal(place.frontImageMeta?.license,'CC BY-SA 4.0');
assert.ok(place.image!==place.frontImage,'Venue must use distinct documentary photo sources');
assert.ok(fs.statSync(place.image).size>50000&&fs.statSync(place.frontImage).size>50000,'Local photos must be fully materialized');
assert.equal(runtime.place.image,place.image);
assert.equal(runtime.place.frontImage,place.frontImage);
assert.match(place.image||'',/oslo.prosjektrom|platous/i);
assert.match(place.frontImage||'',/oslo.prosjektrom|platous/i);
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff':'font/woff','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
  res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const out=path.join(root,'artifacts/oslo-prosjektrom-v1');
fs.mkdirSync(out,{recursive:true});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const profile of [
    {name:'desktop',viewport:{width:1440,height:1000},isMobile:false},
    {name:'mobile',viewport:{width:390,height:844},isMobile:true}
  ]){
    const context=await browser.newContext({viewport:profile.viewport,isMobile:profile.isMobile,hasTouch:profile.isMobile});
    await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1')});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    try{
      await page.goto(base+'/index.html?hgTest=1#/place/'+placeId,{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(id=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId===id,placeId,{timeout:90000});
      await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card')&&document.querySelector('#pcQuizCardContent')?.textContent?.length>30,null,{timeout:60000});
      await page.waitForFunction(()=>[...document.querySelectorAll('#placeCard img')].some(i=>i.complete&&i.naturalWidth>0),null,{timeout:30000});
      const before=await page.evaluate(()=>({
        title:document.querySelector('#pcTitle')?.textContent?.trim(),
        imageCount:[...document.querySelectorAll('#placeCard img')].filter(i=>i.getBoundingClientRect().width>0&&i.complete&&i.naturalWidth>0).length,
        quizCardText:document.querySelector('#pcQuizCardContent')?.textContent?.trim()||'',
        imageSources:[...document.querySelectorAll('#placeCard img')].map(i=>({src:i.currentSrc||i.src,loaded:i.complete&&i.naturalWidth>0})),
        overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth)
      }));
      assert.match(before.title||'',/Oslo Prosjektrom/i);
      assert.ok(before.imageCount>=1,'At least one real loaded PlaceCard photo');
      assert.ok(before.quizCardText.length>100,'Full QuizCard must render');
      assert.ok(before.overflow<=4,'No horizontal overflow');
      await page.screenshot({path:path.join(out,profile.name+'-front.png'),fullPage:true});
      await page.locator('#pcFrontCardFlip').click();
      await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:10000});
      const back=await page.locator('.pc-card-face-back').evaluate(el=>({visibility:getComputedStyle(el).visibility,text:el.textContent||''}));
      assert.equal(back.visibility,'visible');
      assert.ok(back.text.length>100,'QuizCard backside must display actual questions');
      await page.screenshot({path:path.join(out,profile.name+'-quizcard.png'),fullPage:true});
      await page.locator('#pcFrontCardFlip').click();
      await page.locator('#pcQuiz').click();
      await page.waitForFunction(id=>location.hash.startsWith('#/quiz/'+id),placeId,{timeout:15000});
      assert.equal(errors.length,0,'App must not throw page errors');
      fs.writeFileSync(path.join(out,profile.name+'.json'),JSON.stringify({before,backLength:back.text.length,quizOpened:true,errors},null,2));
      console.log('PASS: Oslo Prosjektrom PlaceCard + 10-question QuizCard + quiz entry: '+profile.name);
    }catch(e){
      await page.screenshot({path:path.join(out,profile.name+'-failed.png'),fullPage:true}).catch(()=>{});
      console.error(profile.name,e);
      throw e;
    }finally{await context.close()}
  }
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
