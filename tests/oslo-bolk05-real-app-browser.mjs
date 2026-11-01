#!/usr/bin/env node
// Oslo bolk 05: real-app card + first fullquiz question on 390 / 1440 px.
// Generates screenshots for human visual sign-off; it does NOT replace that sign-off.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const placeId=process.argv[2];
const cats={
  folketeateret:'scenekunst',kunstnernes_hus:'kunst',historisk_museum:'historie',
  ibsen_museum_teater:'litteratur',blitzhuset:'subkultur',kulturkirken_jakob_litteratur:'musikk'
};
assert.ok(Object.hasOwn(cats,placeId),'Unknown or out-of-scope place');
const cat=cats[placeId];
const root=process.cwd();
const quiz=JSON.parse(fs.readFileSync('data/quiz/'+cat+'/'+placeId+'_sets.json','utf8'));
const expected=new Map(quiz.sets.flatMap(s=>s.questions.map(q=>[q.question,q])));
const canonicalCard=JSON.parse(fs.readFileSync('data/quizcards/'+cat+'/'+placeId+'_quizkort_v1.json','utf8')).cards[0];
const expectedCardQuestion=canonicalCard.questions[0]?.question;
assert.ok(expectedCardQuestion,'Canonical card lacks first question');
const cardMatches=[];
for(const item of fs.readdirSync('data/quizcards',{withFileTypes:true})){
  if(!item.isDirectory())continue;
  const folder='data/quizcards/'+item.name;
  const manifestFile=folder+'/manifest.json';
  if(!fs.existsSync(manifestFile))continue;
  const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
  for(const filename of manifest.collections||[]){
    const file=path.join(folder,filename);
    if(!fs.existsSync(file))continue;
    const collection=JSON.parse(fs.readFileSync(file,'utf8'));
    for(const card of collection.cards||[]){
      if(card.targetId===placeId)cardMatches.push({category:item.name,file});
    }
  }
}
assert.deepEqual(cardMatches.map(x=>x.category),[cat],placeId+': conflicting category QuizCard bindings '+JSON.stringify(cardMatches));
const out=path.join(root,'artifacts','oslo-bolk05-browser',placeId);
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json',
  '.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml',
  '.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  const filename=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
  if(!filename.startsWith(root+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile()){
    res.writeHead(404);res.end('not found');return;
  }
  res.writeHead(200,{'Content-Type':mime[path.extname(filename).toLowerCase()]||'application/octet-stream'});
  fs.createReadStream(filename).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
let browser;
const report={placeId,views:[]};
try{
  browser=await chromium.launch({headless:true,
    executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const profile of [{name:'mobile-390',width:390,height:844,mobile:true},
                        {name:'landscape-1440',width:1440,height:900,mobile:false}]){
    const context=await browser.newContext({
      viewport:{width:profile.width,height:profile.height},
      isMobile:profile.mobile,hasTouch:profile.mobile,locale:'nb-NO'
    });
    await context.addInitScript(()=>{
      localStorage.setItem('hg_onboarding_shown_v1','1');
      localStorage.setItem('HG_TEST_MODE','1');
    });
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    try{
      await page.goto(base+'/index.html?hgTest=1#/place/'+placeId,{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(id=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&
        document.querySelector('#placeCard')?.dataset.currentPlaceId===id,placeId,{timeout:90000});
      await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card')&&
        document.querySelector('#pcQuizCardContent .pc-rendered-quiz-card'),null,{timeout:40000});
      const image=await page.locator('#pcFrontImage').evaluate(el=>({loaded:el.complete&&el.naturalWidth>0,width:el.naturalWidth}));
      assert.ok(image.loaded,placeId+'/'+profile.name+': portrait not decoded');
      await page.locator('#placeCard').screenshot({path:out+'/'+profile.name+'-placecard.png'});
      assert.equal(await page.locator('#pcQuizCardContent li').count(),10,'QuizCard reverse must show 10 questions');
      const flip=page.locator('#pcFrontCardFlip');
      await flip.click({position:{x:25,y:55},timeout:15000});
      await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),
        null,{timeout:15000});
      await page.waitForTimeout(350);
      await page.screenshot({path:out+'/'+profile.name+'-flipped.png',fullPage:true});
      await page.locator('#pcQuizExpandBtn').click({timeout:15000});
      await page.locator('#pcQuizExpanded').waitFor({state:'visible',timeout:15000});
      assert.equal(await page.locator('#pcQuizExpandedContent li').count(),10,'Expanded QuizCard must show 10 questions');
      const firstCardText=(await page.locator('#pcQuizExpandedContent li').first().innerText()).replace(/\s+/g,' ').trim();
      assert.ok(firstCardText.includes(expectedCardQuestion.replace(/\s+/g,' ').trim()),
        placeId+'/'+profile.name+': app displayed a stale QuizCard instead of the canonical '+cat+' card');
      await page.screenshot({path:out+'/'+profile.name+'-expanded.png',fullPage:true});
      await page.locator('#pcQuizExpandedClose').click({timeout:15000});
      await page.locator('#pcQuiz').click({timeout:15000});
      await page.waitForFunction(id=>location.hash.startsWith('#/quiz/'+id),placeId,{timeout:25000});
      await page.locator('#quizChoices button').first().waitFor({state:'visible',timeout:20000});
      const shown=(await page.locator('#quizQuestion').innerText()).trim();
      const source=expected.get(shown);
      assert.ok(source,placeId+'/'+profile.name+': active question absent from 21-question fullquiz');
      const answers=await page.locator('#quizChoices button').allTextContents();
      assert.equal(answers.filter(s=>s.trim()===source.answer).length,1,'Correct answer must render exactly once');
      await page.screenshot({path:out+'/'+profile.name+'-fullquiz.png',fullPage:true});
      assert.deepEqual(errors,[],placeId+'/'+profile.name+': JavaScript page errors');
      report.views.push({profile:profile.name,placeCard:true,imageLoaded:true,flipped:true,
        cardQuestions:10,expandedQuestions:10,questionMatched:true,pageErrors:0});
    }finally{await context.close();}
  }
  fs.writeFileSync(out+'/result.json',JSON.stringify(report,null,2)+'\n');
  console.log('OSLO_BOLK05_APP_BROWSER_OK',placeId,report.views.map(x=>x.profile).join(','));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
