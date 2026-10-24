#!/usr/bin/env node
/**
 * Real Chromium QA of the *review-only* six-place surface.
 * This does not certify canonical app Places, GPS arrival, live QuizCard or Fagverk.
 */
import assert from 'node:assert/strict';
import { mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=resolve(ROOT,'reports/place-production/oslo-six-browser-review.html');
if(!existsSync(html))throw Error('Run node scripts/build-oslo-six-browser-review.mjs --write first');
const ids=['linderud_gard','ekebergrestauranten','frognerseteren',
  'sarabraten','saeterhytten_bygdoy','kristiania_teglverk_bryn'];
const browser=await chromium.launch({headless:true});
try{
  for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(html).href,{waitUntil:'load'});
    assert.equal(await page.locator('#place-nav button').count(),6);
    for(const id of ids){
      await page.evaluate(x=>window.__HG_SIX_REVIEW__.selectPlace(x),id);
      assert.equal(await page.evaluate(()=>window.__HG_SIX_REVIEW__.state.placeId),id);
      assert.equal(await page.locator('h1#place-title').isVisible(),true);
      assert.equal((await page.locator('#place-intro').innerText()).length>100,true);
      if(id==='kristiania_teglverk_bryn'){
        assert.equal(await page.locator('#missing-image').count(),1);
        assert.equal(await page.locator('#place-image').count(),0);
      }else{
        assert.equal(await page.locator('#place-image').count(),1);
        for(const role of ['lead','card','popup']){
          await page.locator('[data-media-role="'+role+'"]').click();
          const image=page.locator('#place-image');
          await image.evaluate(el=>el.decode());
          const size=await image.evaluate(el=>[el.naturalWidth,el.naturalHeight]);
          assert.ok(size[0]>0&&size[1]>0,id+': image '+role+' broken');
          const credit=await page.locator('.credit').innerText();
          assert.match(credit,/Foto:/);
          assert.equal(await page.locator('.credit a').count(),2);
        }
      }
      await page.evaluate(()=>window.__HG_SIX_REVIEW__.selectTab('fagverk'));
      assert.equal(await page.locator('.learning-lens').count()>0,true,id);
      const reviewData=await page.evaluate(()=>JSON.parse(document.getElementById('review-data').textContent));
      const placeDraft=reviewData.places.find(place=>place.id===id);
      assert.ok(placeDraft,id+': source data missing');
      await page.evaluate(()=>window.__HG_SIX_REVIEW__.selectTab('quizcard'));
      for(let qi=0;qi<10;qi++){
        const q=placeDraft.quizcard[qi];
        assert.equal(await page.locator('.question').count(),1,id+': quizcard');
        assert.equal(await page.locator('.question').getAttribute('data-question-id'),q.id);
        assert.equal(await page.locator('[data-option]').count(),4,id+': four choices');
        const correctlyAnswered=qi%2===0;
        const choice=correctlyAnswered?q.answerIndex:(q.answerIndex+1)%4;
        await page.locator('[data-option="'+choice+'"]').click();
        const answer=await page.locator('#answer').innerText();
        assert.ok(answer.startsWith(correctlyAnswered?'Riktig. ':'Ikke riktig. '),id+': QuizCard answer verdict '+qi);
        assert.ok(answer.includes('Fasit: '+q.options[q.answerIndex]+'. '),id+': QuizCard answer key '+qi);
        assert.equal(await page.locator('#answer').getAttribute('aria-live'),'polite');
        assert.equal(await page.locator('#answer .source a').count()>0,true,id+': source link');
        assert.equal(await page.locator('[data-option]:disabled').count(),4,id+': answer locked');
        if(qi<9)await page.locator('#next-question').click();
      }
      assert.equal(await page.evaluate(()=>window.__HG_SIX_REVIEW__.state.questionIndex),9);
      await page.evaluate(()=>window.__HG_SIX_REVIEW__.selectTab('fullquiz'));
      const fullCount=id==='linderud_gard'?28:21;
      for(let qi=0;qi<fullCount;qi++){
        const q=placeDraft.fullquiz[qi];
        assert.equal(await page.locator('.question').count(),1,id+': fullquiz');
        assert.equal(await page.locator('.question').getAttribute('data-question-id'),q.id);
        assert.equal(await page.locator('[data-option]').count(),4,id+': fullquiz choices');
        const correctlyAnswered=qi%2===1;
        const choice=correctlyAnswered?q.answerIndex:(q.answerIndex+1)%4;
        await page.locator('[data-option="'+choice+'"]').click();
        const answer=await page.locator('#answer').innerText();
        assert.ok(answer.startsWith(correctlyAnswered?'Riktig. ':'Ikke riktig. '),id+': Fullquiz answer verdict '+qi);
        assert.ok(answer.includes('Fasit: '+q.options[q.answerIndex]+'. '),id+': Fullquiz answer key '+qi);
        assert.ok(await page.locator('#answer .source a').count()>0,id+': fullquiz source');
        assert.equal(await page.locator('[data-option]:disabled').count(),4,id+': answer locked');
        if(qi<fullCount-1)await page.locator('#next-question').click();
      }
      assert.equal(await page.evaluate(()=>window.__HG_SIX_REVIEW__.state.questionIndex),fullCount-1);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
      assert.ok(overflow<=3,id+': horizontal overflow '+overflow+'px at '+width);
    }
    await page.evaluate(()=>window.__HG_SIX_REVIEW__.selectPlace('ekebergrestauranten'));
    await page.screenshot({path:resolve(ROOT,'reports/place-production/oslo-six-browser-review-'+width+'.png'),fullPage:true});
    assert.deepEqual(errors,[],'No browser exception at '+width);
    await page.close();
    console.log('Chromium '+width+'px: six source-bound stories, 5x3 real WebP images, 60 QuizCard and 133 fullquiz candidates checked for correct and incorrect answers with source links, Fagverk and images PASSED');
  }
}finally{await browser.close();}
