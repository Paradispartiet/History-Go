#!/usr/bin/env node
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const root=process.cwd();
const target=process.env.HG_PLACE_ID||'arbeidersamfunnets_plass';
const scopes={
 arbeidersamfunnets_plass:{category:'politikk',quiz:'data/quiz/politikk/arbeidersamfunnets_plass_sets.json'},
 politihuset_gronland:{category:'politikk',quiz:'data/quiz/politikk/politihuset_gronland_sets.json'},
 statsministerboligen:{category:'politikk',quiz:'data/quiz/politikk/statsministerboligen_sets.json'},
 nobels_fredssenter:{category:'historie',quiz:'data/quiz/historie/nobels_fredssenter_sets.json'},
 vikaterrassen:{category:'by',quiz:'data/quiz/by/vikaterrassen_sets.json'},
 eldorado_bokhandel:{category:'litteratur',quiz:'data/quiz/litteratur/eldorado_bokhandel_sets_merged.json'}
};
assert.ok(scopes[target],'Unexpected Oslo workstream target');
const source=JSON.parse(fs.readFileSync(scopes[target].quiz,'utf8'));
const questionMap=new Map(source.sets.flatMap(s=>s.questions.map(q=>[q.question,q])));
const reports='artifacts/oslo-sentrum-six-6586/'+target;
fs.mkdirSync(reports,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [width,height,mobile] of [[390,844,true],[1440,960,false]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO'});
  await context.addInitScript(()=>{
    localStorage.setItem('hg_onboarding_shown_v1','1');
    localStorage.setItem('HG_TEST_MODE','1');
  });
  const page=await context.newPage(), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(base+'/index.html?hgTest=1#/place/'+target,{waitUntil:'domcontentloaded',timeout:75000});
   await page.waitForFunction(id=>window.__HG_APP_READY__===true && window.__HG_ROUTER_STARTED__===true && document.querySelector('#placeCard')?.dataset.currentPlaceId===id,target,{timeout:80000});
   await page.locator('#placeCard').screenshot({path:reports+'/'+width+'-placecard.png'});
   if (mobile && (target === 'arbeidersamfunnets_plass' || target === 'statsministerboligen')) {
    const wordLayout = await page.locator('#pcTitle').evaluate(el => {
     const firstWord = el.textContent.trim().split(/\s+/)[0];
     const node = [...el.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.includes(firstWord));
     if (!node) return {firstWord, fragments:0};
     const start = node.textContent.indexOf(firstWord);
     const range = document.createRange();
     range.setStart(node,start);
     range.setEnd(node,start + firstWord.length);
     return {
      firstWord,
      fragments:range.getClientRects().length,
      computedFontSize:getComputedStyle(el).fontSize,
      computedLetterSpacing:getComputedStyle(el).letterSpacing,
      computedGridColumn:getComputedStyle(el).gridColumn,
      titleWidth:el.getBoundingClientRect().width,
      titleScrollWidth:el.scrollWidth,
      rowWidth:el.parentElement.getBoundingClientRect().width,
      matchedPlaceId:el.closest('#placeCard')?.dataset.currentPlaceId,
      rowClass:el.parentElement.className,
      heroClass:el.closest('.pc-heading-hero')?.className,
      declaredStylesheets:[...document.styleSheets].map(ss=>ss.href).filter(Boolean).filter(h=>h.includes('placeCard')),
      inlineStyle: el.getAttribute('style'),
      bodyClasses: document.body.className,
      viewportWidth: window.innerWidth,
      media520: window.matchMedia('(max-width: 520px)').matches,
      matchingFontRules: [...document.styleSheets].flatMap(ss => {
       const out = [];
       const walk = rules => { for(const rule of rules) {
        if(rule.cssRules) { walk(rule.cssRules); continue; }
        if(!rule.selectorText || !rule.style?.getPropertyValue('font-size')) continue;
        try { if(el.matches(rule.selectorText)) out.push({selector:rule.selectorText,font:rule.style.getPropertyValue('font-size'),priority:rule.style.getPropertyPriority('font-size')}); } catch {}
       }};
       try {walk(ss.cssRules);} catch {}
       return out;
      }).slice(-12)
     };
    });
    assert.equal(wordLayout.fragments,1,target+'/'+width+': PlaceCard splits first word mid-word: '+JSON.stringify(wordLayout));
   }
   const flip=page.locator('#pcFrontCardFlip');
   await page.waitForFunction(()=>document.querySelector('#pcQuizCardContent')?.querySelector('.pc-rendered-quiz-card') && document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card'),null,{timeout:45000});
   assert.equal(await page.locator('#pcQuizCardContent li').count(),10,target+'/'+width+': missing questions on reverse face');
   assert.ok(await page.locator('#pcFrontImage').evaluate(img=>img.complete&&img.naturalWidth>0),target+'/'+width+': source-backed real image not decoded');
   await flip.click({position:{x:20,y:Math.min((await flip.boundingBox()).height-20,80)},timeout:12000});
   await page.waitForFunction(()=>document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:15000});
   await page.waitForTimeout(530);
   await page.locator('#pcQuizExpandBtn').click({timeout:12000});
   await page.locator('#pcQuizExpanded').waitFor({state:'visible',timeout:12000});
   assert.equal(await page.locator('#pcQuizExpandedContent li').count(),10,target+'/'+width+': expanded card missing source-linked questions');
   await page.screenshot({path:reports+'/'+width+'-expanded-quizcard.png',fullPage:true});
   await page.locator('#pcQuizExpandedClose').click();
   await page.locator('#pcQuiz').click({timeout:15000});
   await page.waitForFunction(id=>location.hash.startsWith('#/quiz/'+id),target,{timeout:25000});
   await page.waitForFunction(()=>document.querySelector('#quizChoices button:not(:disabled)'),null,{timeout:25000});
   let question=(await page.locator('#quizQuestion').innerText()).trim();
   const record=questionMap.get(question);
   assert.ok(record,target+'/'+width+': displayed first quiz question is absent from fullquiz: '+question);
   const choices=page.locator('#quizChoices button');
   assert.ok(await choices.count()>=3,'Expected multiple choice');
   assert.ok(await choices.allTextContents().then(t=>t.some(x=>x.includes(record.answer))),'Correct answer omitted from visible choices');
   await page.screenshot({path:reports+'/'+width+'-fullquiz.png',fullPage:true});
   assert.deepEqual(errors,[],target+'/'+width+': JavaScript errors in actual app');
   await page.goto(base+'/fagverk-sted.html?place='+target,{waitUntil:'domcontentloaded',timeout:50000});
   await page.waitForFunction(()=>document.getElementById('fagverkPlaceContent')?.hidden===false,null,{timeout:35000});
   assert.equal(await page.locator('#fagverkPlaceUnfinished').isHidden(),true,target+'/'+width+': Fagverk fallback unexpectedly active');
   assert.equal(await page.locator('#fagverkPlaceArticleSection').isVisible(),true,target+'/'+width+': source article not rendered');
   assert.equal(await page.locator('#fagverkPlaceError').isHidden(),true,target+'/'+width+': Fagverk error');
   if (mobile) {
    const titleFit = await page.locator('#fagverkPlaceTitle').evaluate(el => {
      const hero = el.closest('.fagverk-place-hero-copy').getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(el);
      const glyphRows = [...range.getClientRects()];
      const overflowing = glyphRows.some(rect => rect.right > hero.right - 5 || rect.left < hero.left + 5);
      return { overflowing, textRows: glyphRows.length, titleWidth: el.clientWidth, scrollWidth: el.scrollWidth, heroWidth: hero.width };
    });
    assert.ok(!titleFit.overflowing && titleFit.scrollWidth <= titleFit.titleWidth + 1,
      target + '/' + width + ': Fagverk title is clipped: ' + JSON.stringify(titleFit));
   }
   await page.screenshot({path:reports+'/'+width+'-fagverk.png',fullPage:true});
   console.log(target+' '+width+'px: PlaceCard, true image, QuizCard flip, 10 answers, active quiz and Fagverk OK');
  }finally{await page.close();await context.close();}
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
