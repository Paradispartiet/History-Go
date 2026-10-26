#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const ROOT=process.cwd();
const OSLO_IDS=[
 'bislett','majorstuen_tbanestasjon','nationaltheatret_stasjon','voienvolden','akrobaten_gangbro',
 'barcode','carl_berner_plass','deichman_bjorvika','frogner','grorud',
 'holmlia','losaeter','okern','sagene','skoyen',
 'sorenga','sukkerbiten_badstulandsby','tjuvholmen','torshov','torshovparken'
];
const REGIONAL_GROUPS={
 akershus:['tertitten_urskog_holandsbanen','kjeller_flyplass','hvitsten_sjobodene','son_ladested','holen_ladested'],
 ostfold:['orje_sluser_haldenkanalen','kornsjo_grensestasjon','brekke_sluser_haldenkanalen','stromsfoss_sluser','homlungen_fyr'],
 buskerud:['drammen_tollbod_havn','gamle_nesbyen','kroderbanen_kroderen_stasjon','riddergarden_honefoss','vikersund_stasjon_randsfjordbanen'],
 innlandet:['eina_stasjon_totenbanen','fagernes_stasjon_valdresbanen','hamar_stasjon_jernbanebyen','lillehammer_stasjon','skibladner_gjovik']
};
const REGIONAL04_GROUPS={
 innlandet:['dombas_stasjon_jernbaneknutepunkt','otta_stasjon_gudbrandsdalen','kongsvinger_stasjon_grensebanen','elverum_stasjon_jernbanemiljo','tynset_stasjon_rorosbanen','moelv_stasjon_mjoslinjen','stange_stasjon_dovrebanen','gran_stasjon_gjovikbanen','lena_stasjon_totenbanen','reinsvoll_stasjon_totenbanen','dokka_stasjon_valdresbanen','skarnes_stasjon_kongsvingerbanen','skreia_stasjon_totenbanen','flisa_stasjon_solorbanen','os_stasjon_rorosbanen'],
 vestfold:['faerder_fyr','sandefjord_kurbad','tollerodden_larvik','horten_stasjon_vestfoldbanen','tonsberg_stasjon_vestfoldbanen']
};
const BATCH=process.env.HG_BY_BATCH??'oslo';
assert.ok(['oslo','regional03','regional04'].includes(BATCH),'HG_BY_BATCH must be oslo, regional03 or regional04');
const IDS=BATCH==='regional03'?Object.values(REGIONAL_GROUPS).flat():(BATCH==='regional04'?Object.values(REGIONAL04_GROUPS).flat():OSLO_IDS);
const REGION_BY_ID=new Map([...Object.entries(REGIONAL_GROUPS),...Object.entries(REGIONAL04_GROUPS)].flatMap(([region,ids])=>ids.map(id=>[id,region])));
const shard=Number(process.env.HG_BY_SHARD??'0');
assert.ok(Number.isInteger(shard)&&shard>=0&&shard<4,'HG_BY_SHARD must be 0, 1, 2 or 3');
const targets=IDS.slice(shard*5,shard*5+5);
const manifest=JSON.parse(fs.readFileSync('data/quiz/manifest.json','utf8'));
const imageAudit=JSON.parse(fs.readFileSync('data/places/place_image_backlog_summary.json','utf8'));
assert.equal(IDS.length,20);
assert.equal(new Set(IDS).size,20);
assert.equal(imageAudit.schema,'history_go_place_image_backlog_summary_v1');

const quizById=new Map();
for(const id of targets){
 const files=[...(manifest.sets||[]),...(manifest.targets||[])]
   .filter(entry=>entry.targetId===id && entry.file?.startsWith('data/quiz/by/'))
   .map(entry=>entry.file);
 assert.equal(new Set(files).size,1,id+' must own one canonical By quiz');
 const quiz=JSON.parse(fs.readFileSync(files[0],'utf8'));
 const rows=(quiz.sets||[]).flatMap(set=>set.questions||[]);
 assert.ok(rows.length>=10,id+' missing a usable fullquiz');
 quizById.set(id,new Map(rows.map(q=>[q.question,q])));
 const placeFile=BATCH.startsWith('regional')?'data/places/by/'+REGION_BY_ID.get(id)+'/'+id+'/'+id+'.json':'data/places/by/oslo/places/'+id+'.json';
 const place=JSON.parse(fs.readFileSync(placeFile,'utf8'));
 const live=JSON.parse(fs.readFileSync('data/runtime/place-open/'+id+'.json','utf8')).place;
 assert.equal(place.id,id);
 assert.equal(live.id,id);
 assert.equal(live.image,place.image,id+' stale Place-open image');
 assert.ok(place.fagverk?.article?.length>=3,id+' missing Fagverk article');
}

const mime={
 '.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json',
 '.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg',
 '.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.gif':'image/gif'
};
const server=http.createServer((req,res)=>{
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}
 catch{res.writeHead(400);res.end();return;}
 const resolved=path.resolve(ROOT,'.'+(pathname==='/'?'/index.html':pathname));
 if(!resolved.startsWith(ROOT+path.sep)||!fs.existsSync(resolved)||!fs.statSync(resolved).isFile()){
   res.writeHead(404);res.end('not found');return;
 }
 res.writeHead(200,{'content-type':mime[path.extname(resolved).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(resolved).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const reportDir=path.join(ROOT,'artifacts',BATCH==='regional04'?'by04-regional-browser':(BATCH==='regional03'?'by03-regional-browser':'by-v1-20-browser'),'shard-'+shard);
fs.mkdirSync(reportDir,{recursive:true});
let browser;
const results=[];
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const id of targets)for(const [width,height,mobile] of [[390,844,true],[1440,960,false]]){
  let context,page;
  const errors=[];
  try{
   context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO'});
   await context.addInitScript(()=>{
     localStorage.setItem('hg_onboarding_shown_v1','1');
     localStorage.setItem('HG_TEST_MODE','1');
   });
   page=await context.newPage();
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+'/index.html?hgTest=1#/place/'+id,{waitUntil:'domcontentloaded',timeout:80000});
   await page.waitForFunction(target=>window.__HG_APP_READY__===true
     && window.__HG_ROUTER_STARTED__===true
     && document.querySelector('#placeCard')?.dataset.currentPlaceId===target,
     id,{timeout:85000});
   await page.waitForFunction(()=>document.querySelector('#pcQuizCardContent .pc-rendered-quiz-card')
     && document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card'),
     null,{timeout:50000});
   assert.equal(await page.locator('#pcQuizCardContent li').count(),10,id+'/'+width+' QuizCard count');
   await page.waitForFunction(()=>{const img=document.querySelector('#pcFrontImage');
     return img?.complete && img.naturalWidth>0;},null,{timeout:55000});
   const title=await page.locator('#pcTitle').innerText();
   assert.ok(title.trim(),id+'/'+width+' missing PlaceCard title');
   if(mobile){
     const overflow=await page.locator('#pcTitle').evaluate(el=>el.scrollWidth>el.clientWidth+3);
     assert.ok(!overflow,id+' mobile title overflow');
   }
   await page.locator('#placeCard').screenshot({path:path.join(reportDir,id+'-'+width+'-placecard.png')});
   const flip=page.locator('#pcFrontCardFlip'),bb=await flip.boundingBox();
   assert.ok(bb,id+'/'+width+' flip control not visible');
   await flip.click({position:{x:20,y:Math.min(bb.height-20,80)},timeout:14000});
   await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:15000});
   // Wait for the actual 420 ms CSS flip to complete before the real pointer click.
   await page.waitForTimeout(530);
   await page.locator('#pcQuizExpandBtn').click({timeout:14000});
   await page.locator('#pcQuizExpanded').waitFor({state:'visible',timeout:15000});
   assert.equal(await page.locator('#pcQuizExpandedContent li').count(),10,id+' expanded quizcard missing answers');
   await page.locator('#pcQuizExpandedClose').click();
   await page.locator('#pcQuiz').click({timeout:16000});
   await page.waitForFunction(target=>location.hash.startsWith('#/quiz/'+target),id,{timeout:30000});
   await page.waitForFunction(()=>document.querySelector('#quizChoices button:not(:disabled)'),null,{timeout:30000});
   const question=(await page.locator('#quizQuestion').innerText()).trim();
   const sourceQ=quizById.get(id).get(question);
   assert.ok(sourceQ,id+' displayed quiz question absent from canonical By quiz: '+question);
   const choices=await page.locator('#quizChoices button').allTextContents();
   assert.ok(choices.some(text=>text.includes(sourceQ.answer)),id+' correct answer missing from app');
   assert.deepEqual(errors,[],id+'/'+width+' JavaScript errors in PlaceCard/quiz');
   await page.goto(base+'/fagverk-sted.html?place='+id,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.getElementById('fagverkPlaceContent')?.hidden===false,null,{timeout:45000});
   assert.ok(await page.locator('#fagverkPlaceUnfinished').isHidden(),id+' Fagverk fallback active');
   assert.ok(await page.locator('#fagverkPlaceArticleSection').isVisible(),id+' Fagverk article absent');
   assert.ok(await page.locator('#fagverkPlaceError').isHidden(),id+' Fagverk rendered error');
   assert.deepEqual(errors,[],id+'/'+width+' JavaScript errors in app');
   results.push({id,width,status:'passed',question});
   console.log('PASS',id,width,'PlaceCard/photo/QuizCard/fullquiz/Fagverk');
  }catch(e){
   const message=String(e?.stack||e).slice(0,2000);
   results.push({id,width,status:'failed',message});
   console.error('FAIL',id,width,message);
   if(page)await page.screenshot({path:path.join(reportDir,id+'-'+width+'-failure.png'),fullPage:true,timeout:12000}).catch(()=>{});
  }finally{await page?.close().catch(()=>{});await context?.close().catch(()=>{});}
 }
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
 fs.writeFileSync(path.join(reportDir,'results.json'),JSON.stringify({shard,results},null,2)+'\n');
}
const failures=results.filter(x=>x.status==='failed');
console.log(JSON.stringify({shard,checks:results.length,passed:results.length-failures.length,failed:failures.length}));
assert.equal(results.length,10);
assert.equal(failures.length,0,failures.map(x=>x.id+'/'+x.width+': '+x.message).join('\n'));
