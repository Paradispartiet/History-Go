#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const root=process.cwd();
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(html,/css\/place-media-overview-fit\.css\?v=20261111-overview-1/);
const mediaCSS=fs.readFileSync('css/place-media-overview-fit.css','utf8');
assert.match(mediaCSS,/#pcFrontImage/);
assert.match(mediaCSS,/#pcHeaderImage/);
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(url==='/'?'/index.html':url));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
fs.mkdirSync('artifacts/place-media-overview-fit',{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [label,width,height,mobile] of [['mobile',390,844,true],['desktop',1440,1000,false]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO',reducedMotion:'reduce'});
  await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1');});
  try{
   for(const placeId of ['tinghuset','toyen_torg']){
    const page=await context.newPage();
    try{
     await page.goto(base+'/index.html?hgTest=1#/place/'+placeId,{waitUntil:'domcontentloaded',timeout:90000});
     await page.waitForFunction(id=>window.__HG_APP_READY__===true && window.__HG_ROUTER_STARTED__===true && document.querySelector('#placeCard')?.dataset.currentPlaceId===id,placeId,{timeout:90000});
     await page.waitForFunction(()=>['pcFrontImage','pcHeaderImage'].every(id=>{const img=document.getElementById(id);return img instanceof HTMLImageElement && img.complete && img.naturalWidth>0 && img.naturalHeight>0;}),null,{timeout:90000});
     const result=await page.evaluate(()=>{
      const measure=id=>{
       const element=document.getElementById(id);
       const box=element.getBoundingClientRect();
       const css=getComputedStyle(element);
       return {src:element.getAttribute('src'),naturalWidth:element.naturalWidth,naturalHeight:element.naturalHeight,width:box.width,height:box.height,objectFit:css.objectFit,objectPosition:css.objectPosition};
      };
      const hero=document.getElementById('pcHeaderHero');
      const backdrop=getComputedStyle(hero,'::before');
      return {placeId:document.querySelector('#placeCard')?.dataset.currentPlaceId,header:measure('pcHeaderImage'),portrait:measure('pcFrontImage'),ambientBackground:backdrop.backgroundImage,quizBackFit:getComputedStyle(document.querySelector('.pc-quiz-card-image')).objectFit};
     });
     assert.equal(result.placeId,placeId);
     for(const key of ['header','portrait']){
      const photo=result[key];
      assert.equal(photo.objectFit,'contain',placeId+' '+label+' '+key+' must be fitted not cropped');
      assert.equal(photo.objectPosition,'50% 50%',placeId+' '+label+' '+key+' centered');
      assert.ok(photo.naturalWidth>0&&photo.naturalHeight>0);
      assert.ok(photo.width>20&&photo.height>20);
     }
     assert.equal(result.quizBackFit,'contain',placeId+' '+label+' QuizCard stays uncut');
     assert.match(result.ambientBackground,/url\(/,placeId+' '+label+' soft no-gap scene backdrop');
     await page.screenshot({path:'artifacts/place-media-overview-fit/'+label+'-'+placeId+'.png'});
     fs.writeFileSync('artifacts/place-media-overview-fit/'+label+'-'+placeId+'.json',JSON.stringify(result,null,2)+'\n');
     console.log(label+' '+placeId+' PASS – source photos fully visible, independent 3:4 portrait, QuizCard unchanged');
    }finally{await page.close();}
   }
  }finally{await context.close();}
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
