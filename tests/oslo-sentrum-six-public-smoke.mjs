#!/usr/bin/env node
// Public deployment acceptance test; unlike the PR preview test this never serves local files.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium, webkit} from 'playwright';

const placeIds=[
  'arbeidersamfunnets_plass',
  'eldorado_bokhandel',
  'nobels_fredssenter',
  'vikaterrassen',
  'statsministerboligen',
  'politihuset_gronland'
];
const place=process.env.HG_PLACE_ID;
assert.ok(placeIds.includes(place),'Set HG_PLACE_ID to one of the six Oslo place IDs');
const base='https://paradispartiet.github.io/History-Go/';
const screenshotDir=path.join('artifacts','oslo-six-public',place);
fs.mkdirSync(screenshotDir,{recursive:true});

for (const device of [
  {label:'mobile-webkit',browser:webkit,width:390,height:844,mobile:true},
  {label:'desktop-chromium',browser:chromium,width:1440,height:960,mobile:false}
]) {
  const browser=await device.browser.launch({headless:true});
  const context=await browser.newContext({
    viewport:{width:device.width,height:device.height},
    isMobile:device.mobile,hasTouch:device.mobile,
    locale:'nb-NO'
  });
  await context.addInitScript(()=>{
    localStorage.setItem('hg_onboarding_shown_v1','1');
    localStorage.setItem('HG_TEST_MODE','1');
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const prefix=path.join(screenshotDir,device.label);
  try {
    const url=base+'index.html?hgTest=1#/place/'+place;
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
    assert.equal(response?.status(),200,'Public index route returned non-200: '+url);
    await page.waitForFunction(id=>
      window.__HG_APP_READY__===true &&
      window.__HG_ROUTER_STARTED__===true &&
      document.querySelector('#placeCard')?.dataset.currentPlaceId===id,
      place,{timeout:90000}
    );
    assert.ok(await page.locator('#placeCard').isVisible(),'PlaceCard not visible');
    assert.ok((await page.locator('#pcTitle').innerText()).trim(),'Place title missing');
    const img=page.locator('#pcFrontImage');
    await page.waitForFunction(()=>{
      const el=document.querySelector('#pcFrontImage');
      return el?.complete && el.naturalWidth>0;
    },null,{timeout:45000});
    assert.ok(await img.isVisible(),'Place front image not visible');
    await page.locator('#placeCard').screenshot({path:prefix+'-placecard.png'});
    await page.waitForFunction(()=>{
      const flip=document.querySelector('#pcFrontCardFlip');
      return flip?.classList.contains('has-quiz-card') &&
        document.querySelector('#pcQuizCardContent')?.querySelector('.pc-rendered-quiz-card');
    },null,{timeout:45000});
    assert.equal(await page.locator('#pcQuizCardContent li').count(),10,
      'The deployed reverse QuizCard must contain 10 questions');
    const flip=page.locator('#pcFrontCardFlip');
    const box=await flip.boundingBox();
    assert.ok(box,'QuizCard not visible');
    await flip.click({position:{x:20,y:Math.min(box.height-20,80)},timeout:15000});
    await page.waitForFunction(()=>
      document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),
      null,{timeout:15000}
    );
    await page.waitForTimeout(550);
    await page.locator('#pcQuizExpandBtn').click({timeout:15000});
    await page.locator('#pcQuizExpanded').waitFor({state:'visible',timeout:15000});
    assert.equal(await page.locator('#pcQuizExpandedContent li').count(),10,
      'Expanded live QuizCard must contain 10 questions');
    await page.screenshot({path:prefix+'-quizcard.png',fullPage:true});
    await page.locator('#pcQuizExpandedClose').click();
    await page.locator('#pcQuiz').click({timeout:15000});
    await page.waitForFunction(id=>location.hash.startsWith('#/quiz/'+id),
      place,{timeout:30000});
    await page.locator('#quizChoices button:not(:disabled)').first().waitFor({timeout:30000});
    assert.ok(await page.locator('#quizChoices button').count()>=3,
      'No multiple-choice options in live fullquiz');
    await page.screenshot({path:prefix+'-fullquiz.png',fullPage:true});
    const fagverkUrl=base+'fagverk-sted.html?place='+place;
    const fagverkResponse=await page.goto(fagverkUrl,{waitUntil:'domcontentloaded',timeout:90000});
    assert.equal(fagverkResponse?.status(),200,'Public Fagverk returned non-200');
    await page.waitForFunction(()=>
      document.getElementById('fagverkPlaceContent')?.hidden===false,
      null,{timeout:60000});
    assert.ok(await page.locator('#fagverkPlaceUnfinished').isHidden(),
      'Deployed Fagverk shows unfinished fallback');
    assert.ok(await page.locator('#fagverkPlaceArticleSection').isVisible(),
      'Deployed Fagverk article is missing');
    assert.ok(await page.locator('#fagverkPlaceError').isHidden(),
      'Deployed Fagverk shows an error');
    await page.screenshot({path:prefix+'-fagverk.png',fullPage:true});
    assert.deepEqual(errors,[],'JavaScript runtime errors on deployed app: '+errors.join('; '));
    console.log(place+' '+device.label+': public PlaceCard, image, QuizCard, quiz and Fagverk PASS');
  } catch(e) {
    await page.screenshot({path:prefix+'-failure.png',fullPage:true}).catch(()=>{});
    throw e;
  } finally {
    await context.close();
    await browser.close();
  }
}
