import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright';
const root=process.cwd(),placeId='schiollgarden_prinsens_gate_26';
const sourceFile=`data/leksikon/sprak/places/europe/norway/oslo/${placeId}.json`;
const article=JSON.parse(fs.readFileSync(sourceFile));
assert.equal(article.entries.length,4);
assert.ok(article.entries.every(e=>e.layer==='language'&&!e.dialect_area));
assert.deepEqual(JSON.parse(fs.readFileSync(`data/runtime/place-open/${placeId}.json`)).language,article);
const mime = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2'};
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  const absolute = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!absolute.startsWith(root + path.sep) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    res.writeHead(404); res.end('Not found'); return;
  }
  res.writeHead(200, {'Content-Type':mime[path.extname(absolute).toLowerCase()] || 'application/octet-stream'});
  res.end(fs.readFileSync(absolute));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const output = path.join(root, 'artifacts/schiollgarden-language-browser');
fs.mkdirSync(output, { recursive: true });
let browser;const results=[];
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const width of [390,820,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width<1440,isMobile:width===390});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1');});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const collected=()=>page.evaluate(id=>window.HGLanguageLayer.getCollected().filter(e=>e.source?.place_id===id),placeId);
  async function openLanguage(){
   await page.goto(base+'/index.html?hgTest=1#/place/'+placeId,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(id=>window.__HG_APP_READY__===true&&document.querySelector('#placeCard')?.dataset.currentPlaceId===id,placeId,{timeout:60000});
   const shell=page.locator('#placeCard [data-hg-place-sheet-shell="1"]');
   await shell.locator('[data-hg-place-sheet-jump="language"]').click();
   const panel=shell.locator('[data-hg-place-sheet-section="language"]');
   await panel.locator('[data-language-entry]').first().waitFor({state:'visible',timeout:15000});
   assert.equal(await panel.locator('[data-language-entry]').count(),4);
   return panel;
  }
  try{
   let panel=await openLanguage();assert.equal((await collected()).length,0,'Opening is not collection');
   for(const e of article.entries){assert.ok((await panel.innerText()).includes(e.term));assert.ok((await panel.innerText()).includes(e.meaning));}
   assert.equal(await panel.locator('[data-language-layer="dialect"]').count(),0);
   await panel.locator('[data-language-filter="place_name"]').click();
   assert.equal(await panel.locator('[data-language-entry]:visible').count(),1);
   await panel.locator('[data-language-filter="all"]').click();
   await page.screenshot({path:path.join(output,`language-${width}.png`),fullPage:true,animations:'disabled'});
   for(const e of article.entries){
    const button=panel.locator(`[data-language-collect="${e.id}"]`);
    if(width<1440) await button.tap();else await button.click();
    await page.waitForFunction(id=>document.querySelector(`[data-language-collect="${id}"]`)?.disabled,e.id);
   }
   const entries=await collected();assert.equal(entries.length,4);
   for(const e of entries){assert.equal(e.subject_id,'by');assert.equal(e.collection_kind,'language');assert.equal(e.source.type,'language_lexicon');assert.equal(e.source.source_file,sourceFile);assert.ok(e.knowledge_unit_id);}
   panel=await openLanguage();assert.equal((await collected()).length,4,'Reload preserves without duplication');
   for(const e of article.entries)assert.equal(await panel.locator(`[data-language-collect="${e.id}"]`).isDisabled(),true);
   assert.deepEqual(errors,[]);
   results.push({width,entries:4,autoCollected:0,collected:entries.map(e=>({id:e.id,subject:e.subject_id,source:e.source})),reloadPreserved:true,errors});
   console.log('PASS Schiollgarden language '+width+': four entries, filters, explicit Knowledge V2 capture and persistence');
  }finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify(results,null,2)+'\n');
