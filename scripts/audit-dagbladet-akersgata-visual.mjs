#!/usr/bin/env node
// Evidence-only audit. Does not modify canonical place workflow or assert manual QA.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const root = process.cwd();
const out = path.join(root, 'artifacts', 'dagbladet-akersgata-visual-20261010');
fs.mkdirSync(out, { recursive: true });
const mime = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.webp':'image/webp',
  '.woff':'font/woff', '.woff2':'font/woff2'
};
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad URL'); return; }
  const rel = pathname === '/' ? '/index.html' : pathname;
  const abs = path.resolve(root, '.' + rel);
  if (!abs.startsWith(root + path.sep) || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    res.writeHead(404).end('not found'); return;
  }
  res.writeHead(200, { 'content-type': mime[path.extname(abs).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(abs).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

const profiles = [
  { name:'mobile', width:390, height:844, isMobile:true },
  { name:'ipad', width:768, height:1024, isMobile:true },
  { name:'desktop', width:1440, height:1000, isMobile:false }
];
const icons = [
  ['people','pcPeopleIcon'],
  ['brands','pcBrandsIcon']
];
const results = [];
let browser;
const capture = (page, filename) => page.screenshot({
  path: path.join(out, filename + '.jpg'), type:'jpeg', quality:78,
  animations:'disabled', fullPage:false
});
try {
  browser = await chromium.launch({
    headless:true, executablePath: process.env.CHROME_BIN || undefined,
    args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']
  });
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport:{ width:profile.width, height:profile.height },
      isMobile:profile.isMobile, hasTouch:profile.isMobile, deviceScaleFactor:1, locale:'nb-NO'
    });
    const page = await context.newPage();
    const run = {profile:profile.name, viewport:profile, captures:[], popups:[], issues:[], pageErrors:[]};
    results.push(run);
    page.on('pageerror', error => run.pageErrors.push(String(error.message || error)));
    await page.addInitScript(() => {
      try {
        localStorage.setItem('hg_onboarding_shown_v1','1');
        localStorage.setItem('HG_TEST_MODE','1');
      } catch {}
    });
    try {
      await page.goto('http://127.0.0.1:' + port + '/index.html?hgTest=1#/place/dagbladet_akersgata',
        {waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(() => window.__HG_APP_READY__ && window.__HG_ROUTER_STARTED__, null, {timeout:90000});
      await page.waitForFunction(() => document.getElementById('placeCard')?.dataset?.currentPlaceId === 'dagbladet_akersgata', null, {timeout:60000});
      await page.waitForFunction(() => document.getElementById('pcFrontCardFlip')?.classList.contains('has-quiz-card'), null, {timeout:60000});
      await page.waitForTimeout(850);
      run.initial = await page.evaluate(() => {
        const pick = selector => {
          const el = document.querySelector(selector);
          if (!el) return null;
          const r = el.getBoundingClientRect(), style = getComputedStyle(el);
          return {left:r.left, top:r.top, right:r.right, bottom:r.bottom,
            width:r.width, height:r.height, fontSize:style.fontSize,
            lineHeight:style.lineHeight, overflowX:style.overflowX, overflowY:style.overflowY,
            text:(el.textContent || '').trim().slice(0,180)};
        };
        const c = document.getElementById('placeCard');
        const images = [...c.querySelectorAll('img')].filter(el => {
          const r=el.getBoundingClientRect(); return r.width>0 && r.height>0;
        }).map(el => ({src:el.currentSrc || el.src, complete:el.complete,
          naturalWidth:el.naturalWidth, naturalHeight:el.naturalHeight}));
        return {title:pick('#pcTitle'), placeCard:pick('#placeCard'),
          frontImage:pick('#pcFrontCardFlip'), collectionGrid:pick('.pc-icons-quad'),
          people:pick('#pcPeopleIcon'), objects:pick('#pcObjectsIcon'),
          brands:pick('#pcBrandsIcon'), productions:pick('#pcCategoryCollectionIcon'),
          viewportOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          images, collectionMode:c.dataset.collectionMode, collectionCount:c.dataset.collectionCount};
      });
      await capture(page, profile.name + '-placecard-top');
      run.captures.push(profile.name + '-placecard-top.jpg');
      // The PlaceCard may scroll via an internal sheet rather than the document.
      await page.evaluate(() => {
        const els=[document.querySelector('#placeCard .pc-body'),document.getElementById('placeCard')];
        for(const el of els) if(el) el.scrollTop=el.scrollHeight;
      });
      await page.waitForTimeout(300);
      await capture(page, profile.name + '-placecard-lower');
      run.captures.push(profile.name + '-placecard-lower.jpg');
      await page.evaluate(() => {
        const c=document.getElementById('placeCard');
        if(c) c.scrollTop=0;
        const sc=document.querySelector('#placeCard .pc-body');
        if(sc) sc.scrollTop=0;
      });
      // Each collection must open its real popup; screenshot at iPad width.
      for (const [label,id] of icons) {
        const el=page.locator('#'+id);
        if (await el.count() !== 1 || !(await el.isVisible())) {
          run.issues.push(label + ': control missing or invisible'); continue;
        }
        await el.click({timeout:10000});
        const popup=page.locator('.hg-popup.placecard-round-popup.visible');
        try {
          await popup.waitFor({state:'visible',timeout:8000});
          const text=await popup.innerText();
          const box=await popup.boundingBox();
          run.popups.push({label, textLength:text.trim().length, box});
          if(profile.name==='ipad') {
            await capture(page,'ipad-popup-'+label);
            run.captures.push('ipad-popup-'+label+'.jpg');
          }
          if(text.trim().length<15) run.issues.push(label + ': popup has insufficient text');
          await popup.locator('[data-close-popup]').click({timeout:10000});
          await popup.waitFor({state:'detached',timeout:10000});
        } catch(e) { run.issues.push(label + ': '+String(e.message).slice(0,180)); }
      }
      const flip=page.locator('#pcFrontCardFlip');
      await flip.click({timeout:10000});
      await page.waitForFunction(() => document.getElementById('pcFrontCardFlip')?.classList.contains('is-flipped'),null,{timeout:10000});
      run.quizBack=await page.locator('.pc-card-face-back').evaluate(el => ({
        visibility:getComputedStyle(el).visibility,textLength:(el.textContent||'').trim().length
      }));
      if(profile.name==='ipad') {
        await capture(page,'ipad-quiz-flipped');
        run.captures.push('ipad-quiz-flipped.jpg');
      }
      const expand=page.locator('#pcQuizExpandBtn');
      if(await expand.isVisible()) {
        await expand.click({timeout:10000});
        await page.locator('#pcQuizExpanded:not([hidden])').waitFor({state:'visible',timeout:10000});
        run.quizExpanded=await page.locator('#pcQuizExpanded').evaluate(el => ({
          textLength:(el.textContent||'').trim().length,
          rect:el.getBoundingClientRect().toJSON()
        }));
        if(profile.name==='ipad') {
          await capture(page,'ipad-quiz-expanded');
          run.captures.push('ipad-quiz-expanded.jpg');
        }
        await page.locator('#pcQuizExpandedClose').click();
      } else { run.issues.push('QuizCard expand control missing'); }
      await flip.click({timeout:10000});
      // Capture Fagverk from live integrated UI if a navigational link is exposed.
      const fag=page.locator('[data-hg-place-sheet-jump="learning"]').first();
      if(await fag.count() && await fag.isVisible()) {
        await fag.click({timeout:10000});
        await page.waitForTimeout(1600);
        run.fagverk=await page.evaluate(() => {
          const info=(name)=>{
            const el=document.querySelector('[data-hg-place-sheet-section="'+name+'"]');
            if(!el) return null;
            const r=el.getBoundingClientRect();
            return {hidden:el.hidden, top:r.top, bottom:r.bottom, height:r.height,
              heading:(el.querySelector('h1,h2,h3')?.textContent||'').trim().slice(0,160),
              text:(el.textContent||'').trim().slice(0,250)};
          };
          return {route:location.hash, language:info('language'), learning:info('learning'),
            bodyScrollTop:document.querySelector('#placeCard .pc-body')?.scrollTop || 0,
            viewportHeight:innerHeight};
        });
        if(profile.name==='ipad') {
          await capture(page,'ipad-fagverk');
          run.captures.push('ipad-fagverk.jpg');
        }
        // Follow the actual Fagverk link; a navigation teaser is not the article.
        const fagPageLink=page.locator('[data-hg-place-sheet-section="learning"] a.hg-place-learning-all').first();
        if(await fagPageLink.count()) {
          run.fagverkPage={href:await fagPageLink.getAttribute('href')};
          try {
            await fagPageLink.click({timeout:10000});
            await page.waitForLoadState('domcontentloaded',{timeout:20000});
            await page.waitForTimeout(1300);
            run.fagverkPage.url=page.url();
            run.fagverkPage.title=await page.title();
            run.fagverkPage.bodyLength=await page.locator('body').innerText().then(v=>v.trim().length);
            run.fagverkPage.headings=await page.locator('h1,h2').allTextContents();
            run.fagverkPage.unfinished=await page.locator('#fagverkPlaceUnfinished').evaluate(el => ({
              hidden: el.hidden,
              computedDisplay: getComputedStyle(el).display,
              visibleRect: (()=>{const r=el.getBoundingClientRect(); return {width:r.width,height:r.height};})()
            }));
            run.fagverkPage.coverageLabel=await page.locator('#fagverkPlaceCoverageStatus').innerText();
            if (!run.fagverkPage.unfinished.hidden || run.fagverkPage.unfinished.computedDisplay !== 'none') {
              run.issues.push('Fagverk unfinished message is visibly shown for curated Dagbladet');
            }
            if(profile.name==='ipad') {
              await capture(page,'ipad-fagverk-page');
              run.captures.push('ipad-fagverk-page.jpg');
            }
          } catch(e) {run.fagverkPage.error=String(e.message||e).slice(0,500);run.issues.push('Fagverk page navigation: '+run.fagverkPage.error);}
        } else {run.issues.push('Fagverk page link is missing');}
      } else { run.fagverk={status:'no learning jump found'}; run.issues.push('Fagverk navigation not verified in this run'); }
    } catch(e) {
      run.issues.push('run error: '+String(e.stack||e).slice(0,800));
      try {await capture(page,profile.name+'-failure');} catch {}
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
  fs.writeFileSync(path.join(out,'visual-audit.json'), JSON.stringify({
    schema:'history_go_dagbladet_akersgata_visual_evidence_v1',
    branch_sha:process.env.GITHUB_SHA || null,
    site:'dagbladet_akersgata', engine:'Chromium headless; NOT native Safari or human signoff',
    profiles:results
  },null,2)+'\n');
}
console.log(JSON.stringify(results.map(r=>({
  profile:r.profile, captures:r.captures.length, popups:r.popups.length,
  issues:r.issues, pageErrors:r.pageErrors
})),null,2));
if(results.some(r=>r.issues.some(x=>x.startsWith('run error')))) process.exitCode=1;
