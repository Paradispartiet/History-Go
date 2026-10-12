// Run from repository root. Optional CHROME_BIN, WEBKIT_BIN, WEBKIT_LIBS,
// and BROWSER_VENDOR_DIR select installed browsers and byte-identical CDN cache.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';

const root = process.cwd();
const out = path.join(root, 'reports/visual-qa/teater-manu/20261012');
const mime = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.json':'application/json', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml' };
const server = http.createServer((req,res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
  if (!file.startsWith(root + '/') || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, {'content-type':mime[path.extname(file)] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const widths=(process.env.QA_WIDTHS || '320,390,768,1440').split(',').map(Number);
const profiles = widths.map(width => ({width,height:width >= 768 ? 1024 : 844}));
const engines=(process.env.QA_ENGINES || 'chromium,webkit').split(',');
const old=process.env.QA_WIDTHS || process.env.QA_ENGINES ? JSON.parse(fs.readFileSync(path.join(out,'browser-results.json'),'utf8')).profiles : [];
const results = old.filter(r=>!engines.includes(r.engine)||!widths.includes(r.viewport.width));
try {
  for (const [engine, type] of [['chromium',chromium], ['webkit',webkit]]) {
    if(!engines.includes(engine))continue;
    const options = {headless:true};
    if (engine === 'chromium') { options.executablePath=process.env.CHROME_BIN; options.args=['--no-sandbox','--disable-dev-shm-usage']; }
    if (engine === 'webkit' && process.env.WEBKIT_BIN) {
      options.executablePath=process.env.WEBKIT_BIN;
      const w=path.dirname(path.dirname(process.env.WEBKIT_BIN)), libs=process.env.WEBKIT_LIBS;
      options.env={...process.env, LD_LIBRARY_PATH:[w+'/lib',w+'/sys/lib',libs+'/usr/lib/x86_64-linux-gnu',libs+'/lib/x86_64-linux-gnu'].join(':'), WEBKIT_EXEC_PATH:w+'/bin', WEBKIT_INJECTED_BUNDLE_PATH:w+'/lib', WEBKIT_INSPECTOR_RESOURCES_PATH:w+'/share'};
    }
    const browser=await type.launch(options);
    try { for (const viewport of profiles) {
      const context=await browser.newContext({viewport, serviceWorkers:'block',hasTouch:viewport.width < 1000});
      const page=await context.newPage();
      const errors=[], failures=[], missing=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('requestfailed',r=>failures.push({url:r.url().replace(url,''),error:r.failure()?.errorText}));
      page.on('response',r=>{if(r.status()===404)missing.push(r.url().replace(url,''))});
      if (process.env.BROWSER_VENDOR_DIR) {
        await page.route('https://unpkg.com/maplibre-gl@3.6.2/dist/*',r=>r.fulfill({path:path.join(process.env.BROWSER_VENDOR_DIR,r.request().url().split('/').at(-1)),contentType:r.request().url().endsWith('.css')?'text/css':'text/javascript'}));
        await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({path:path.join(process.env.BROWSER_VENDOR_DIR,'supabase.js'),contentType:'text/javascript'}));
      }
      await page.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1')});
      await page.goto(url+'/index.html?hgTest=1',{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.__HG_APP_READY__===true && window.__HG_ROUTER_STARTED__===true && window.HG_PLACES_READY===true,null,{timeout:60000});
      // Exercise the real router after startup; do not replace loaders or data.
      await page.evaluate(()=>location.hash='#/place/teater_manu');
      await page.waitForFunction(()=>document.getElementById('placeCard')?.dataset.collectionCount==='2' && document.querySelector('#pcPeopleIcon img')?.naturalWidth>0 && document.querySelector('#pcCategoryCollectionIcon img')?.naturalWidth>0,null,{timeout:30000});
      const name=engine+'-'+viewport.width;
      await page.locator('#pcPeopleIcon').click();
      const people=page.locator('.hg-popup.placecard-round-popup.visible');
      await people.waitFor();
      assert.match(await people.innerText(),/Mira Zuckermann/);
      assert.match(await people.innerText(),/Illustrasjon/);
      await people.locator('[data-person="mira_zuckermann"]').click();
      const person=page.locator('.hg-popup.person-popup-v2');
      await person.waitFor();
      await person.locator('[data-person-hero-image]').evaluate(img=>img.decode());
      await page.waitForFunction(()=>{const img=document.querySelector('.person-popup-v2 [data-person-hero-image]');return img?.naturalWidth>0&&!img.hidden&&Number(getComputedStyle(img).opacity)>.9});
      assert.equal(await person.locator('.hg-person-portrait-kind').innerText(),'Illustrasjon');
      if(viewport.width===390)await page.screenshot({path:path.join(out,name+'-person.jpg'),quality:80});
      await person.locator('[data-close-popup]').click();
      if(await people.count())await people.locator('[data-close-popup]').click();
      await page.locator('#pcCategoryCollectionIcon').click();
      const productions=page.locator('.hg-popup.placecard-round-popup.visible');
      await productions.waitFor();
      const text=await productions.innerText();
      assert.match(text,/Pinocchio \(2009\)/);assert.match(text,/Jack og bønnestengelen \(2012\)/);
      assert.match(text,/ikke produksjonsfoto/i);assert.match(text,/Illustrasjon/i);
      const loaded=await productions.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.map(img=>img.decode()));return imgs.map(img=>img.naturalWidth)});
      assert.equal(loaded.length,2);assert.ok(loaded.every(n=>n>0));
      if(viewport.width===390)await page.screenshot({path:path.join(out,name+'-productions.jpg'),quality:80});
      await productions.locator('[data-close-popup]').click();
      await page.waitForFunction(()=>document.getElementById('pcFrontCardFlip')?.classList.contains('has-quiz-card') && document.getElementById('pcQuizCardContent')?.hidden===false && document.getElementById('pcQuizCardContent').textContent.length>100,null,{timeout:30000});
      await page.locator('#pcFrontCardFlip').click();
      await page.waitForFunction(()=>document.getElementById('pcFrontCardFlip')?.classList.contains('is-flipped'));
      assert.equal(await page.locator('.pc-card-face-back').evaluate(el=>getComputedStyle(el).visibility),'visible');
      const quizText=await page.locator('#pcQuizCardContent').textContent();
      assert.ok(quizText.length>100);
      await page.locator('#pcQuizExpandBtn').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
      await page.waitForTimeout(500);
      await page.locator('#pcQuizExpandBtn').click();
      await page.locator('#pcQuizExpanded').waitFor({state:'visible'});
      assert.ok((await page.locator('#pcQuizExpandedContent').innerText()).length>100);
      if(viewport.width===390)await page.screenshot({path:path.join(out,name+'-quiz.jpg'),quality:80});
      await page.locator('#pcQuizExpandedClose').click();
      await page.locator('#pcFrontCardFlip').click();
      await page.waitForFunction(()=>!document.getElementById('pcFrontCardFlip').classList.contains('is-flipped'));await page.waitForTimeout(450);
      await page.locator('#pcFrontImage').evaluate(img=>img.decode());
      await page.locator('#placeCard').evaluate(el=>{el.scrollTop=0;el.querySelector('.pc-body').scrollTop=0});
      await page.waitForTimeout(500);await page.screenshot({path:path.join(out,name+'-place.jpg'),quality:80});
      const preview=await page.locator('#pcCategoryCollectionIcon').evaluate(el=>({label:getComputedStyle(el,'::after').content,fit:getComputedStyle(el.querySelector('img')).objectFit}));
      assert.match(preview.label,/Forestillinger/);assert.equal(preview.fit,'contain');
      if(viewport.width===390){await page.locator('#pcCategoryCollectionIcon').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await page.waitForTimeout(300);await page.screenshot({path:path.join(out,name+'-media.jpg'),quality:80})}
      const geometry=await page.locator('#placeCard').evaluate(el=>({viewport:innerWidth,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,scrollWidth:el.scrollWidth,width:el.clientWidth,scrollHeight:el.querySelector('.pc-body').scrollHeight,bodyHeight:el.querySelector('.pc-body').clientHeight}));
      assert.ok(geometry.left>=-1&&geometry.right<=viewport.width+1,JSON.stringify(geometry));
      assert.ok(geometry.scrollWidth<=geometry.width+1,'PlaceCard horizontal overflow');
      const scroll=await page.locator('#placeCard').evaluate(el=>{el.scrollTop=el.scrollHeight;const body=el.querySelector('.pc-body');body.scrollTop=body.scrollHeight;return {root:el.scrollTop,body:body.scrollTop}});
      await page.waitForFunction(()=>{const el=document.getElementById('placeCard');return el.scrollTop>0||el.querySelector('.pc-body').scrollTop>0},null,{timeout:5000});
      assert.deepEqual(errors,[],'uncaught JavaScript errors');
      const scopedMissing=missing.filter(u=>/mira_zuckermann|teater_manu/.test(u)&&!u.endsWith('teater_manu_manifest.json'));
      assert.deepEqual(scopedMissing,[],'Teater Manu resource failures');
      results.push({engine,viewport,status:'PASS',geometry,people:'Mira: image decoded; illustration disclosure; popup opened',productions:'both member images decoded; both descriptions disclosed',quiz:'flip and expanded real content',errors,missingResources:[...new Set(missing)],failedRequests:failures});
      console.log(name+' PASS');
      await context.close();
    }} finally {await browser.close()}
  }
} finally {
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({schema:'history_go_teater_manu_browser_review_v1',scope:'media_collections_and_quiz_ui',cdnCache:!!process.env.BROWSER_VENDOR_DIR,profiles:results},null,2)+'\n');
  await new Promise(resolve=>server.close(resolve));
}
