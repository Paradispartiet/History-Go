#!/usr/bin/env node
// Actual Grini PlaceCard, image, QuizCard and Fagverk acceptance on mobile and desktop.
// Must run after npm run places:index:build && npm run place-open:build.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
const root=process.cwd();
const sites=[['grini_fangeleir','historie',70]];
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=read('data/places/manifest.json'),quizManifest=read('data/quiz/manifest.json');
const fagverk=read('data/fagverk/fagverk_registry.json');
for(const [id,category,expected] of sites){
 assert.ok(manifest.files.includes('places/historie/akershus/grini_fangeleir.json'),id+' missing active Place');
 assert.ok(quizManifest.sets.some(q=>q.targetId===id),id+' missing active quiz');
 const place=read('data/runtime/place-open/'+id+'.json').place;
 assert.equal(place.id,id,'missing hydrated Place');
 assert.equal(place.fagverk.level,'full');
 assert.equal(fagverk.placeLinks[id].status,place.fagverk.status);
 assert.ok(fs.existsSync(place.image)&&fs.existsSync(place.frontImage),id+' missing images');
 assert.equal(read('data/quiz/'+category+'/'+id+'_sets.json').sets.flatMap(s=>s.questions).length,expected);
}
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json',
 '.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
fs.mkdirSync('artifacts/grini-place', {recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const {label,width,height,mobile} of [
  {label:'mobile',width:390,height:844,mobile:true},
  {label:'desktop',width:1440,height:1000,mobile:false}
 ]){
  for(const [id,category,total] of sites){
   const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO'});
   await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1')});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   try{
    await page.goto(base+'/index.html?hgTest=1#/place/'+id,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(id=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId===id,id,{timeout:90000});
    await page.waitForFunction(()=>document.querySelector('#pcFrontImage')?.complete&&document.querySelector('#pcFrontImage')?.naturalWidth>0,null,{timeout:45000});
    const portrait=await page.locator('#pcFrontImage').evaluate(el=>({width:el.naturalWidth,height:el.naturalHeight}));
    assert.ok(portrait.height>portrait.width,'Front image must be a real portrait');
    const placeText=await page.locator('#placeCard').innerText();
    assert.ok(placeText.length>120,id+' PlaceCard story missing');
    await page.waitForFunction(()=>document.querySelector('#pcQuizCardContent')?.querySelector('.pc-rendered-quiz-card')&&document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card'),null,{timeout:45000});
    const front=page.locator('#pcFrontCardFlip');
    await front.click({position:{x:22,y:Math.max(24,(await front.boundingBox()).height-25)},timeout:12000});
    await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:14000});
    await page.waitForTimeout(550);
    assert.equal(await page.locator('#pcQuizCardContent li').count(),10,id+' missing QuizCard questions');
    await page.screenshot({path:'artifacts/grini-place/'+id+'-'+label+'-card.png'});
    await page.locator('#pcQuizExpandBtn').click({timeout:12000});
    await page.locator('#pcQuizExpanded').waitFor({state:'visible',timeout:12000});
    assert.equal(await page.locator('#pcQuizExpandedContent li').count(),10,id+' expanded QuizCard missing');
    await page.locator('#pcQuizExpandedClose').click();
    await front.click({position:{x:22,y:Math.max(24,(await front.boundingBox()).height-25)},timeout:12000});
    await page.locator('#pcQuiz').click({timeout:18000});
    await page.waitForFunction(id=>location.hash.startsWith('#/quiz/'+id),id,{timeout:25000});
    await page.waitForFunction(()=>document.querySelector('#quizChoices button:not(:disabled)'),null,{timeout:30000});
    const visible=(await page.locator('#quizQuestion').innerText()).trim();
    const qs=read('data/quiz/'+category+'/'+id+'_sets.json').sets.flatMap(s=>s.questions);
    assert.ok(qs.some(q=>q.question===visible),id+' question not from canonical quiz');
    await page.goto(base+'/fagverk-sted.html?place='+id,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>document.querySelector('#fagverkPlaceContent')?.hidden===false,null,{timeout:45000});
    assert.ok((await page.locator('#fagverkPlaceTitle').innerText()).length>5,id+' missing title');
    assert.ok((await page.locator('#fagverkPlaceLenses a').count())>=4,id+' missing Fagverk lenses');
    await page.screenshot({path:'artifacts/grini-place/'+id+'-'+label+'-fagverk.png'});
    assert.deepEqual(errors,[],id+' '+label+' script errors');
    console.log('PASS',id,label,'Place/portrait/10 QuizCard/'+total+' fullquiz route/Fagverk');
   }finally{await context.close();}
  }
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
