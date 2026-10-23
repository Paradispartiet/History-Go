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
      await page.evaluate(()=>window.__HG_SIX_REVIEW__.selectTab('quizcard'));
      for(let qi=0;qi<10;qi++){
        assert.equal(await page.locator('.question').count(),1,id+': quiz');
        assert.equal(await page.locator('[data-option]').count(),4,id+': four choices');
        await page.locator('[data-option="0"]').click();
        assert.equal(await page.locator('#answer').isVisible(),true);
        assert.equal(await page.locator('#answer .source a').count()>0,true,id+': source link');
        if(qi<9)await page.locator('#next-question').click();
      }
      assert.equal(await page.evaluate(()=>window.__HG_SIX_REVIEW__.state.questionIndex),9);
      await page.evaluate(()=>window.__HG_SIX_REVIEW__.selectTab('fullquiz'));
      assert.equal(await page.locator('.question').count(),1);
      assert.equal(await page.locator('[data-option]').count(),4);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
      assert.ok(overflow<=3,id+': horizontal overflow '+overflow+'px at '+width);
    }
    await page.evaluate(()=>window.__HG_SIX_REVIEW__.selectPlace('ekebergrestauranten'));
    await page.screenshot({path:resolve(ROOT,'reports/place-production/oslo-six-browser-review-'+width+'.png'),fullPage:true});
    assert.deepEqual(errors,[],'No browser exception at '+width);
    await page.close();
    console.log('Chromium '+width+'px: six source-bound stories, 5x3 real WebP images, 60 QuizCard questions sampled with answer/source and Fagverk panels PASSED');
  }
}finally{await browser.close();}
