#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

// Browser contract: source Place images must never be cropped by the
// viewing component. This does not certify a pre-cropped source file.
const root=process.cwd();
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
fs.mkdirSync('artifacts/place-image-overview',{recursive:true});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  // Tjuvholmen has old remote media on main; include it to test layout even
  // when the remote image is unavailable. Other three must load locally.
  const places=[
    {id:'tinghuset',local:true},
    {id:'tronsmo_bokhandel',local:true},
    {id:'akerselva',local:false},
    {id:'tjuvholmen',local:false}
  ];
  for(const [label,width,height,mobile] of [['mobile',390,844,true],['desktop',1440,1000,false]]){
    const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:'nb-NO',reducedMotion:'reduce'});
    await context.addInitScript(()=>{localStorage.setItem('hg_onboarding_shown_v1','1');localStorage.setItem('HG_TEST_MODE','1');});
    try{
      for(const {id,local} of places){
        const page=await context.newPage(),errors=[];
        page.on('pageerror',e=>errors.push(String(e)));
        try{
          await page.goto(base+'/index.html?hgTest=1#/place/'+id,{waitUntil:'domcontentloaded',timeout:90000});
          await page.waitForFunction(id=>
            window.__HG_APP_READY__===true && window.__HG_ROUTER_STARTED__===true &&
            document.querySelector('#placeCard')?.dataset.currentPlaceId===id,
            id,{timeout:90000});
          await page.locator('#pcFrontImage').waitFor({state:'visible',timeout:45000});
          await page.locator('#pcHeaderImage').waitFor({state:'visible',timeout:45000});
          // This stylesheet must win over dynamically injected Place Sheet
          // and the legacy inline imageComposition.portraitFit='cover'.
          await page.waitForFunction(()=>
            [...document.querySelectorAll('#pcFrontImage,#pcHeaderImage')]
              .every(el=>getComputedStyle(el).objectFit==='contain'),null,{timeout:20000});
          if(local){
            await page.waitForFunction(()=>{
              const front=document.querySelector('#pcFrontImage');
              const hero=document.querySelector('#pcHeaderImage');
              return front?.complete && front.naturalWidth>0 && hero?.complete && hero.naturalWidth>0;
            },null,{timeout:35000});
          }
          const result=await page.evaluate(()=>{
            const metrics=id=>{
              const img=document.querySelector(id),style=getComputedStyle(img),rect=img.getBoundingClientRect();
              const w=img.naturalWidth,h=img.naturalHeight;
              const scale=w&&h?Math.min(rect.width/w,rect.height/h):0;
              return {src:img.getAttribute('src'),fit:style.objectFit,
                width:Math.round(rect.width),height:Math.round(rect.height),
                sourceWidth:w,sourceHeight:h,displayWidth:Math.round(w*scale),displayHeight:Math.round(h*scale),
                sourceVisible:!w||!h||w*scale<=rect.width+.1&&h*scale<=rect.height+.1};
            };
            return {front:metrics('#pcFrontImage'),header:metrics('#pcHeaderImage')};
          });
          assert.equal(result.front.fit,'contain',label+':'+id+' frontImage overzoom');
          assert.equal(result.header.fit,'contain',label+':'+id+' image overzoom');
          assert.ok(result.front.sourceVisible&&result.header.sourceVisible);
          assert.ok(result.front.width>0&&result.header.width>0);
          // Quiz backs intentionally keep their separate complete image fit.
          assert.deepEqual(errors,[],label+' '+id+' runtime JS errors');
          await page.screenshot({path:'artifacts/place-image-overview/'+label+'-'+id+'.png'});
          fs.writeFileSync('artifacts/place-image-overview/'+label+'-'+id+'.json',JSON.stringify(result,null,2)+'\n');
          console.log(label,id,'complete source in both surfaces PASS',JSON.stringify(result));
        }finally{await page.close();}
      }
    }finally{await context.close();}
  }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
