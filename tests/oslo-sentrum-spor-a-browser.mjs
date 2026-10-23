#!/usr/bin/env node
// Real History GO browser review for this account's separate Oslo sentrum PR.
// This tests app rendering; it does NOT award v1 and it does NOT replace human image review.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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
// QuizCard must match the existing sourced fullquiz, not a second quiz store.
const cards=JSON.parse(fs.readFileSync(path.join(root,'data/quizcards/naeringsliv/topp10_naeringsliv_oslo_v1_batch01.json'),'utf8')).cards;
for(const id of ids){
 const card=cards.find(x=>x.targetId===id);
 assert.ok(card,'QuizCard missing for '+id);
 assert.equal(card.questionCount,10,'QuizCard must contain ten sourced choices');
 assert.equal(card.questions?.length,10);
 const fullPath=path.resolve(root,card.sourceFile);
 assert.ok(fullPath.startsWith(root+path.sep),'Quiz source must be inside the repository');
 const fullQuiz=JSON.parse(fs.readFileSync(fullPath,'utf8'));
 assert.equal(fullQuiz.targetId,id);
 const fullQuestions=fullQuiz.sets.flatMap(set=>set.questions);
 assert.ok(fullQuestions.length>=21,'Existing complete quiz must be preserved');
 for(const question of card.questions){
  const source=fullQuestions.find(q=>q.id===question.sourceQuestionId);
  assert.ok(source,id+' QuizCard source question missing: '+question.sourceQuestionId);
  assert.equal(question.sourceQuizId,source.quiz_id);
  assert.equal(question.question,source.question);
  assert.deepEqual(question.options,source.options);
  assert.equal(question.answer,source.answer);
  assert.equal(question.answerIndex,source.answerIndex);
  assert.equal(question.options[question.answerIndex],question.answer);
  assert.ok(question.source_urls?.some(url=>url.startsWith('https://')),'QuizCard question lacks inspectable source');
 }
}
const photo=canonical.telegrafbygningen;
assert.equal(photo.frontImageMeta?.license,'CC BY-SA 4.0');
assert.equal(photo.frontImageMeta?.creator,'Helge Høifødt');
assert.equal(photo.frontImageMeta?.delivery,'local_webp_licensed','Portrait must now be local');
assert.equal(photo.frontImage,'bilder/places/telegrafbygningen_front_portrait.webp');
assert.ok(fs.statSync(path.resolve(root,photo.frontImage)).size>20000);
assert.match(photo.frontImageMeta?.outputSha256||'',/^[0-9a-f]{64}$/);
assert.ok(photo.externalLinks?.some(x=>x.url===photo.frontImageMeta?.sourcePage));
assert.equal(photo.image,'bilder/places/telegrafbygningen_hero.webp');
assert.equal(photo.cardImage,'bilder/kort/places/telegrafbygningen_card.webp');
assert.equal(new Set([photo.image,photo.frontImage,photo.cardImage]).size,3,'Three physical photo files required');
for (const [key,metaKey,dimensions] of [
 ['image','imageMeta','1400x900'],
 ['cardImage','cardImageMeta','900x600'],
 ['frontImage','frontImageMeta','900x1200']
]) {
 assert.equal(photo[metaKey]?.license,'CC BY-SA 4.0');
 assert.equal(photo[metaKey]?.sourcePage,photo.frontImageMeta.sourcePage);
 assert.equal(photo[metaKey]?.outputDimensions,dimensions);
 assert.match(photo[metaKey]?.outputSha256||'',/^[0-9a-f]{64}$/);
 assert.ok(fs.statSync(path.resolve(root,photo[key])).size>20000);
 const actualHash=createHash('sha256').update(fs.readFileSync(path.resolve(root,photo[key]))).digest('hex');
 assert.equal(actualHash,photo[metaKey].outputSha256,'Photographic metadata must match exact local WebP bytes');
}
// Verify the historical copy against the real audited 4.2 packet, not an
// untracked game-production blurb or a source-less Place fallback.
const telegrafV42=JSON.parse(fs.readFileSync(path.join(root,'data/places/production/telegrafbygningen.json'),'utf8'));
assert.equal(telegrafV42.status,'ready_v4_2');
assert.equal(telegrafV42.placeId,'telegrafbygningen');
for (const field of ['desc','popupDesc']){
 const exact=createHash('sha256').update(canonical.telegrafbygningen[field]||'','utf8').digest('hex');
 assert.equal(telegrafV42.textHashes[field],exact,field+' must match its reviewed text hash');
}
assert.ok(canonical.telegrafbygningen.popupDesc.split(/\s+/).length>=300);
assert.doesNotMatch(canonical.telegrafbygningen.popupDesc,/Quizens første|NOK-scenario|arbeider spilleren|History Go/i);
assert.equal(telegrafV42.quizReadiness.questions.length,8);
const telegrafBusinessProduction=JSON.parse(fs.readFileSync(path.join(root,'data/places/naeringsliv-production/telegrafbygningen.json'),'utf8'));
assert.equal(telegrafBusinessProduction.placeId,'telegrafbygningen');
assert.equal(telegrafBusinessProduction.status,'ready');
assert.ok(telegrafBusinessProduction.economicCases.length>=1);
for(const gate of ['A','B','C','D','E','F','G']) assert.equal(telegrafBusinessProduction.gates[gate]?.status,'PASS');
assert.equal(telegrafBusinessProduction.gates.H?.status,'N/A');

assert.deepEqual(telegrafV42.quizReadiness.questions.map(q=>q.claimIds[0]),[
 'claim_telegraf_v42_01','claim_telegraf_v42_05','claim_telegraf_v42_06','claim_telegraf_v42_05',
 'claim_telegraf_v42_21','claim_telegraf_v42_17','claim_telegraf_v42_08','claim_telegraf_v42_22'
]);
const server=http.createServer((req,res)=>{
 const uri=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(uri.pathname);
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'Content-Type':media[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const report={schema:'history_go_oslo_sentrum_a_real_browser_review_v1',places:ids,checks:[],errors:[],v1Approved:false,photoStatus:'verified_local_webp_editorial_review_pending'};
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
     heroSource:document.querySelector('#pcHeaderImage')?.currentSrc||'',
     quizReady:Boolean(document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card'))
    }));
    assert.match(details.title,id==='telegrafbygningen'?/Telegraf|Telegraph/i:/Post|Hovedpost/i,'Incorrect PlaceCard title after localization');
    assert.ok(details.open,'PlaceCard is not visible');
    assert.ok(details.hero>0&&details.front>0,'Front or hero photo not decoded');
    if(id==='telegrafbygningen'){
      const expected='telegrafbygningen_front_portrait.webp';
      assert.ok(details.source.includes(expected),'PlaceCard did not use the attributed portrait asset');
      assert.ok(details.heroSource.includes('telegrafbygningen_hero.webp'),'PlaceCard did not display sourced Telegraf hero image');
    }
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
report.status=report.errors.length?'BLOCKED':'BROWSER_PASS_EDITORIAL_IMAGE_REVIEW_PENDING';
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log('OSLO_SEN_SUMMARY',JSON.stringify({count:report.checks.length,errors:report.errors.length,status:report.status}));
if(report.errors.length)process.exitCode=1;
