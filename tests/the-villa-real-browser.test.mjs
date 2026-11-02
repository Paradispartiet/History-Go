#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root,file), 'utf8'));
const place = read('data/places/subkultur/oslo/places_subkultur/the_villa.json');
const cards = read('data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json');
const card = cards.cards.find(item => item.targetId === 'the_villa');
assert.equal(place.id, 'the_villa');
assert.equal(card?.questions?.length, 10);
const mime = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript',
  '.json':'application/json','.css':'text/css','.webp':'image/webp',
  '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server = http.createServer((req,res) => {
  let pathname;
  try {pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}
  catch {res.writeHead(400).end('bad path');return;}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if (!file.startsWith(root+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()){
    res.writeHead(404).end('not found');return;
  }
  res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const output=path.join(root,'artifacts/the-villa-real-browser');
fs.mkdirSync(output,{recursive:true});
const results=[];
let browser;
try {
  browser=await chromium.launch({headless:true,
    executablePath:process.env.CHROME_BIN||undefined,
    args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const v of [{width:390,height:844,mobile:true},{width:1440,height:960,mobile:false}]){
    const tag=v.mobile?'mobile':'desktop';
    const context=await browser.newContext({viewport:{width:v.width,height:v.height},
      isMobile:v.mobile,hasTouch:v.mobile,locale:'nb-NO'});
    let page;
    try {
      await context.addInitScript(()=>{
        localStorage.setItem('hg_onboarding_shown_v1','1');
        localStorage.setItem('HG_TEST_MODE','1');
        localStorage.setItem('hg_lang','nb');
      });
      page=await context.newPage();
      await page.goto(base+'/index.html?hgTest=1#/place/the_villa',
        {waitUntil:'domcontentloaded',timeout:80000});
      await page.waitForFunction(()=>
        window.__HG_APP_READY__===true&&
        window.__HG_ROUTER_STARTED__===true&&
        document.querySelector('#placeCard')?.dataset.currentPlaceId==='the_villa',
        null,{timeout:85000});
      await page.waitForFunction(expected=>
        document.getElementById('pcDesc')?.textContent===expected,
        place.desc,{timeout:20000});
      await page.waitForFunction(()=>{
        const hero=document.getElementById('pcHeaderImage');
        const portrait=document.getElementById('pcFrontImage');
        return hero?.complete&&hero.naturalWidth>0&&portrait?.complete&&portrait.naturalWidth>0;
      },null,{timeout:60000});
      const media=await page.evaluate(()=>{
        const hero=document.getElementById('pcHeaderImage');
        const portrait=document.getElementById('pcFrontImage');
        return {
          hero:{src:hero.currentSrc,width:hero.naturalWidth,height:hero.naturalHeight},
          portrait:{src:portrait.currentSrc,width:portrait.naturalWidth,height:portrait.naturalHeight}
        };
      });
      assert.ok(media.hero.src.includes('the_villa_hero.webp'),tag+' hero path');
      assert.ok(media.portrait.src.includes('the_villa_portrait.webp'),tag+' portrait path');
      assert.ok(media.hero.width>media.hero.height,tag+' landscape hero');
      assert.ok(media.portrait.height>media.portrait.width,tag+' portrait frontImage');
      const flip=page.locator('#pcFrontCardFlip');
      await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card'),
        null,{timeout:30000});
      await flip.click();
      await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),
        null,{timeout:10000});
      const quizText=await page.locator('#pcQuizCardContent').innerText();
      assert.match(quizText,/The Villa/i,tag+' visible quiz');
      await page.locator('#placeCard').screenshot({path:path.join(output,tag+'-placecard.png')});
      await page.goto(base+'/fagverk-sted.html?place=the_villa',
        {waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>document.getElementById('fagverkPlaceContent')?.hidden===false,
        null,{timeout:45000});
      assert.match(await page.locator('#fagverkPlaceTitle').innerText(),/The Villa/);
      assert.equal(await page.locator('#fagverkPlaceArticle p').count(),place.fagverk.article.length);
      assert.equal(await page.locator('#fagverkPlaceLenses a').count(),place.fagverk.lenses.length);
      assert.equal(await page.locator('#fagverkPlaceUnfinished').isHidden(),true);
      assert.equal(await page.locator('#fagverkPlaceError').isHidden(),true);
      await page.screenshot({path:path.join(output,tag+'-fagverk.png'),fullPage:true});
      results.push({viewport:tag,status:'passed',media});
      console.log('PASS The Villa real-app PlaceCard, media, QuizCard flip, Fagverk:',tag);
    } catch(error) {
      results.push({viewport:tag,status:'failed',error:String(error.stack||error)});
      if(page) await page.screenshot({path:path.join(output,tag+'-failure.png'),
        fullPage:true,timeout:10000}).catch(()=>{});
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2)+'\n');
}
assert.equal(results.filter(x=>x.status!=='passed').length,0,
  results.filter(x=>x.status!=='passed').map(x=>x.error).join('\n'));
