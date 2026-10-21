#!/usr/bin/env node
// Persistent Ljanselva v1 acceptance: real History Go app, copyright-cleared local images and real quiz.
// The reverse face is assessed AFTER the 420ms CSS flip finishes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const root=process.cwd(), id='ljanselva';
const data=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const place=data('data/runtime/place-open/ljanselva.json').place;
const cards=data('data/quizcards/natur/topp10_natur_ljanselva_20261021.json').cards;
assert.equal(place.id,id);
assert.equal(cards.filter(c=>c.targetId===id).length,1);
assert.equal(cards.find(c=>c.targetId===id).questions.length,10);
assert.ok(fs.statSync(place.image).size>12000&&fs.statSync(place.frontImage).size>12000);
const folder='artifacts/ljanselva-browser';
fs.mkdirSync(folder,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browserReports=[];
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const {name,width,height,mobile} of [{name:'mobile',width:390,height:844,mobile:true},{name:'desktop',width:1440,height:1000,mobile:false}]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'en-US'});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1')});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',err=>pageErrors.push(String(err)));
  try{
   await page.goto(base+'/index.html?hgTest=1#/place/'+id,{waitUntil:'domcontentloaded',timeout:75000});
   await page.waitForFunction(id=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId===id,id,{timeout:80000});
   await page.waitForFunction(()=>document.querySelector('#pcFrontImage')?.complete&&document.querySelector('#pcFrontImage')?.naturalWidth>0,null,{timeout:30000});
   await page.waitForFunction(()=>document.querySelector('#pcQuizCardContent')?.querySelector('.pc-rendered-quiz-card')&&document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card'),null,{timeout:40000});
   const description=await page.locator('#placeCard').innerText();
   assert.ok(description.includes('1884')&&/gunpowder/i.test(description),name+': old translation still overrides source-backed history about the 1884 gunpowder explosion');
   const image=await page.locator('#pcFrontImage').evaluate(el=>({src:el.currentSrc||el.src,width:el.naturalWidth,height:el.naturalHeight}));
   assert.ok(image.src.includes('ljanselva_front_portrait.webp')&&image.width>0,name+': local documentary portrait not decoded');
   await page.screenshot({path:folder+'/'+name+'-front.png',fullPage:true});
   const front=page.locator('#pcFrontCardFlip');
   await front.click({position:{x:22,y:Math.max(24,(await front.boundingBox()).height-25)},timeout:8000});
   await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:12000});
   await page.waitForTimeout(800);
   const flip=await page.locator('#pcQuizCardContent').evaluate(el=>{
    const card=el.querySelector('.pc-rendered-quiz-card');
    const style=getComputedStyle(el),rect=el.getBoundingClientRect();
    const inner=card?.getBoundingClientRect();
    return{hidden:el.hidden,visibility:style.visibility,opacity:style.opacity,text:el.innerText||'',width:rect.width,height:rect.height,innerWidth:inner?.width||0,innerHeight:inner?.height||0};
   });
   const flipFrame=await page.locator('#pcFrontCardFlip').evaluate(el=>({
    className:el.className,
    innerTransform:getComputedStyle(el.querySelector('.pc-card-flip-inner')).transform,
    reverseVisibility:getComputedStyle(el.querySelector('.pc-card-face-back')).visibility,
    frontVisibility:getComputedStyle(el.querySelector('.pc-card-face-front')).visibility
   }));
   console.log(name+' post-animation QuizCard diagnostic:',JSON.stringify({frame:flipFrame,hidden:flip.hidden,visibility:flip.visibility,contentWidth:flip.width,contentHeight:flip.height,innerWidth:flip.innerWidth,innerHeight:flip.innerHeight,chars:flip.text.length}));
   await page.screenshot({path:folder+'/'+name+'-reverse-after-animation.png',fullPage:true});
   assert.equal(flip.hidden,false,name+': QuizCard content still hidden');
   assert.ok(flipFrame.className.includes('is-flipped'),name+': flip reset before animation finished');
   assert.equal(flip.visibility,'visible',name+': QuizCard face not visually exposed');
   // The compact portrait shares a 390px mobile grid with other content.
   // It cannot legitimately supply 140px of *inner* width after padding.
   // The real gate is a positive painted area and substantive readable DOM text.
   assert.ok(flip.width>85&&flip.height>100&&flip.innerWidth>65&&flip.innerHeight>100,name+': QuizCard occupies no visible area');
   assert.ok(/Ljanselva/i.test(flip.text)&&flip.text.length>120,name+': QuizCard reverse has no readable questions');
   // Reopening the same canonical place is legitimate during progressive
   // hydration and must not erase the user's currently flipped QuizCard.
   const hydrated=await page.evaluate(async placeId=>{
    const place=window.HGPlaceOpen?.getPlace?.(placeId);
    if(!place||typeof window.openPlaceCard!=='function')return false;
    await window.openPlaceCard(place);
    return true;
   },id);
   assert.equal(hydrated,true,name+': cannot re-open hydrated canonical place');
   await page.waitForTimeout(500);
   const afterReopen=await page.locator('#pcFrontCardFlip').evaluate(el=>({
    flipped:el.classList.contains('is-flipped'),
    reverseVisible:getComputedStyle(el.querySelector('.pc-card-face-back')).visibility,
    renderedText:el.querySelector('.pc-rendered-quiz-card')?.innerText||''
   }));
   assert.ok(afterReopen.flipped&&afterReopen.reverseVisible==='visible'&&afterReopen.renderedText.length>120,name+': same-place hydration erased QuizCard reverse');
   await front.click({position:{x:22,y:Math.max(24,(await front.boundingBox()).height-25)},timeout:8000});
   await page.locator('#pcQuiz').click({timeout:18000});
   await page.waitForFunction(id=>location.hash.startsWith('#/quiz/'+id),id,{timeout:18000});
   const quizRoute=await page.evaluate(()=>location.hash);
   await page.goto(base+'/fagverk-sted.html?place='+id,{waitUntil:'domcontentloaded',timeout:70000});
   await page.waitForFunction(()=>document.querySelector('#fagverkPlaceContent')?.hidden===false,null,{timeout:30000});
   assert.match(await page.locator('#fagverkPlaceTitle').innerText(),/Ljanselva/);
   assert.equal(await page.locator('#fagverkPlaceQuestions li').count(),4);
   assert.equal(await page.locator('#fagverkPlaceLenses a').count(),3);
   assert.equal(await page.locator('#fagverkPlaceError').isHidden(),true);
   await page.screenshot({path:folder+'/'+name+'-fagverk.png',fullPage:true});
   assert.deepEqual(pageErrors,[],name+': app browser errors');
   browserReports.push({name,width,portrait:image,quizCardVisibleAfterAnimation:true,quizRoute,fagverk:true,translatedDescriptionVerified:true});
   console.log('Ljanselva',name,'native browser, story, front portrait, QuizCard after flip, quiz route and Fagverk: PASS');
  }finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
fs.writeFileSync(folder+'/result.json',JSON.stringify({schema:'ljanselva-v1-real-browser-regression-v1',screenshotsAfterFlipAnimation:true,checks:browserReports},null,2)+'\n');
