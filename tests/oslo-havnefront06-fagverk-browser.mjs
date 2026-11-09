#!/usr/bin/env node
// Actual browser QA for the three new Place-owned Fagverk pages, 390px/1440px.
// Images, articles, lenses, questions, source hrefs and click navigation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';
const root=process.cwd();
const ids=['astrup_fearnley','amerikalinjen','akerselva_utlop_bjorvika'];
const places=[
 'data/places/kunst/oslo/places_kunst/astrup_fearnley.json',
 'data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03/amerikalinjen.json',
 'data/places/natur/oslo/places_oslo_natur_akerselvarute/akerselva_utlop_bjorvika.json'
].map(p=>JSON.parse(fs.readFileSync(p,'utf8')));
const out='artifacts/oslo-havnefront06-fagverk';
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff':'font/woff','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://127.0.0.1');
  let relative=decodeURIComponent(u.pathname);
  if(relative==='/')relative='/index.html';
  const file=path.resolve(root,'.'+relative);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
let browser;const result=[];
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(let i=0;i<ids.length;i++)for(const profile of [{name:'mobile-390',w:390,h:844,mobile:true},{name:'desktop-1440',w:1440,h:900,mobile:false}]){
  const id=ids[i],p=places[i],context=await browser.newContext({viewport:{width:profile.w,height:profile.h},isMobile:profile.mobile,hasTouch:profile.mobile,locale:'nb-NO'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(base+'/fagverk-sted.html?place='+encodeURIComponent(id),{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(id=>document.body.dataset.placeId===id&&!document.getElementById('fagverkPlaceContent')?.hidden,id,{timeout:90000});
    const data=await page.evaluate(()=>{
      const text=id=>(document.getElementById(id)?.innerText||'').trim();
      const links=[...document.querySelectorAll('#fagverkPlaceLenses a,#fagverkPlaceChapters a,#fagverkPlaceEmner a,#fagverkPlaceSources a')].map(a=>({href:a.getAttribute('href'),text:a.textContent.trim()}));
      const img=document.getElementById('fagverkPlaceImage');
      return {title:text('fagverkPlaceTitle'),status:text('fagverkPlaceCoverageStatus'),articleText:text('fagverkPlaceArticle'),lensCount:document.querySelectorAll('#fagverkPlaceLenses a').length,questionCount:document.querySelectorAll('#fagverkPlaceQuestions li').length,traceCount:document.querySelectorAll('#fagverkPlaceTraces .fagverk-place-trace').length,sourceCount:document.querySelectorAll('#fagverkPlaceSources li a').length,links,imgReady:img?.complete&&img.naturalWidth>0,imgWidth:img?.naturalWidth,unfinishedHidden:document.getElementById('fagverkPlaceUnfinished')?.hidden,errBox:text('fagverkPlaceError')};
    });
    assert.equal(data.status.toLocaleLowerCase('nb-NO'),'kuratert stedsfagverk',id+'/'+profile.name+' '+data.errBox);
    assert.ok(data.title&&data.articleText.length>450,id+' insufficient article');
    assert.ok(data.lensCount>=3&&data.questionCount>=4&&data.traceCount>=1&&data.sourceCount>=2,id+' missing content '+JSON.stringify(data));
    assert.ok(data.imgReady,id+' image not loaded');
    assert.ok(data.unfinishedHidden,id+' unfinished section should be hidden');
    const internal=data.links.filter(l=>l.href?.startsWith('fagverk.html?'));
    assert.ok(internal.length>=3,id+' missing topic links');
    assert.ok(internal.every(l=>new URL(l.href,base).searchParams.get('place')===id),id+' links lost place context');
    assert.ok(data.links.filter(l=>l.href?.startsWith('https://')).length>=2,id+' lacks clickable sources');
    assert.equal(errors.length,0,id+' page errors '+errors.join(' / '));
    await page.screenshot({path:out+'/'+id+'-'+profile.name+'.png',fullPage:true});
    // Actually activate a canonical topic link to ensure routing starts rather than just trusting href.
    await page.locator('#fagverkPlaceLenses a').first().click({timeout:12000});
    await page.waitForURL(u=>u.pathname.endsWith('/fagverk.html')&&u.searchParams.get('place')===id,{timeout:25000});
    result.push({id,profile:profile.name,status:'PASS',articleChars:data.articleText.length,lenses:data.lensCount,questions:data.questionCount,traces:data.traceCount,sources:data.sourceCount,imageWidth:data.imgWidth,clickedTopic:true});
  }finally{await context.close()}
 }
 fs.writeFileSync(out+'/results.json',JSON.stringify(result,null,2)+'\n');
 console.log('OSLO06_FAGVERK_BROWSER_PASS',result.length,'screens and clicked topic links');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
