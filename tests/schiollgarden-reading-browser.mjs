import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright';
const root=process.cwd(),id='schiollgarden_prinsens_gate_26';
const source=JSON.parse(fs.readFileSync('data/lesespor/schiollgarden/lesespor_schiollgarden_by.json'));
const news=JSON.parse(fs.readFileSync('data/leksikon/places/oslo/by/leksikon_schiollgarden_nyhet_byggeprosjekt_2019.json'))[0];
assert.equal(source.items.length,2);
assert.deepEqual(JSON.parse(fs.readFileSync(`data/runtime/place-open/${id}.json`)).leksikon,[news]);
assert.deepEqual(JSON.parse(fs.readFileSync(`data/runtime/place-open/${id}.json`)).lesespor,source.items.map(x=>x));
const output='artifacts/schiollgarden-reading-browser';fs.mkdirSync(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;const results=[];
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const width of [390,820,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},isMobile:width===390,hasTouch:width<1440,locale:'nb-NO'});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1');});
  // Sources were read independently. Intercept only outbound article responses
  // so this app navigation test does not depend on external server uptime.
  for(const item of source.items)await context.route(item.url,route=>route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>External navigation probe</title>'}));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(`http://127.0.0.1:${server.address().port}/index.html?hgTest=1#/place/${id}`,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(id=>window.__HG_APP_READY__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId===id,id,{timeout:90000});
   await page.locator('#placeCard [data-hg-place-sheet-jump="reading"]').click();
   const panel=page.locator('#placeCard [data-hg-place-sheet-owner="reading"]');await panel.waitFor({state:'visible'});
   assert.equal(await panel.locator('.hg-place-reading-card').count(),2);
   const text=await panel.innerText();
   for(const item of source.items){
    assert.ok(text.includes(item.title));assert.ok(text.includes(item.publication));assert.ok(text.includes(String(item.year)));assert.ok(text.includes(item.relevance));
    if(item.author)assert.ok(text.includes(item.author));
    const link=panel.locator(`a[href="${item.url}"]`);assert.equal(await link.getAttribute('target'),'_blank');
    assert.match(await link.getAttribute('rel'),/noopener/);assert.match(await link.getAttribute('rel'),/noreferrer/);
    const [tab]=await Promise.all([context.waitForEvent('page'),link.click()]);await tab.waitForLoadState('domcontentloaded');assert.equal(tab.url(),item.url);await tab.close();
   }
   await panel.scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/reading-${width}.png`,fullPage:true,animations:'disabled'});
   await page.locator('#placeCard [data-hg-place-sheet-jump="news"]').click();
   const newsPanel=page.locator('#placeCard [data-hg-place-sheet-owner="news"]');await newsPanel.waitFor({state:'visible'});
   assert.equal(await newsPanel.locator('.pc-sheet-news-card').count(),1);
   const newsText=await newsPanel.innerText();assert.ok(newsText.includes('Gamle nyheter'));assert.ok(newsText.includes(news.title));assert.ok(newsText.includes(news.date));assert.ok(newsText.includes(news.summary.one_liner));
   const sourceLink=newsPanel.locator(`a[href="${news.sources[0].url}"]`);await sourceLink.click({trial:true});
   await newsPanel.scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/news-${width}.png`,fullPage:true,animations:'disabled'});
   assert.deepEqual(errors,[]);results.push({width,items:source.items.map(x=>x.id),visibleMetadata:true,historicalNews:news.id,externalDestinations:true,externalResponse:'deterministic navigation probe; availability is not certified by this test',errors});
   console.log('PASS Schiollgarden curated reading and exact external navigation '+width);
  }catch(e){await page.screenshot({path:`${output}/failure-${width}.png`,fullPage:true});throw e;}finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(r=>server.close(r));}
fs.writeFileSync(output+'/summary.json',JSON.stringify(results,null,2)+'\n');
