#!/usr/bin/env node
// Real PlaceCard verification for the two previously image-blocked
// Akerselva places. Source image provenance and framing are both mandatory.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, webkit } from 'playwright';

const root=process.cwd();
const ids=['frysjadammen','stilla_nydalen'];
const read=filename=>JSON.parse(fs.readFileSync(path.join(root,filename),'utf8'));
const places=ids.map(id=>{
  const src=read('data/places/natur/oslo/places_oslo_natur_akerselvarute/'+id+'.json');
  const runtime=read('data/runtime/place-open/'+id+'.json').place;
  assert.equal(src.id,id);
  assert.equal(runtime.id,id);
  assert.equal(runtime.image,src.image);
  assert.equal(runtime.frontImage,src.frontImage);
  assert.ok(src.image && src.frontImage && src.image!==src.frontImage);
  assert.equal(src.imageLicense,'CC BY-SA 4.0');
  assert.ok(src.imageMeta?.pageUrl);
  assert.ok(src.externalLinks.some(link=>link.url===src.imageMeta.pageUrl));
  assert.match(src.imageMeta.sourceSha256||'',/^[a-f0-9]{64}$/u);
  if(id!=='frysjadammen'){
    assert.ok(src.frontImageMeta?.sourcePage);
    assert.ok(src.externalLinks.some(link=>link.url===src.frontImageMeta.sourcePage));
    assert.match(src.frontImageMeta.sourceSha256||'',/^[a-f0-9]{64}$/u);
  }
  if(id==='frysjadammen'){
    assert.match(src.name,/Oset slusebru/);
    assert.match(src.image,/\.webp$/u);
    assert.ok(fs.statSync(path.join(root,src.image)).size>50000);
    assert.match(src.frontImage,/\.svg$/u);
    assert.ok(fs.statSync(path.join(root,src.frontImage)).size>3000);
    assert.ok(fs.readFileSync(path.join(root,src.frontImage),'utf8').includes('ILLUSTRASJON'));
    assert.equal(src.imageMeta.author,'Kjell Egil Sterten');
    assert.equal(src.frontImageMeta.mediaType,'editorial_illustration');
    assert.match(src.frontImageMeta.disclosure,/ikke fotografi/);
    assert.match(src.frontImageMeta.transformation,/Original nykomponert/);
  }else{
    assert.match(src.name,/nedenfor Nydalsdammen/);
    assert.ok(src.image.startsWith('https://commons.wikimedia.org/'));
    assert.ok(src.frontImage.startsWith('https://commons.wikimedia.org/'));
    assert.equal(src.imageMeta.author,'Ryan Hodnett');
    assert.equal(src.frontImageMeta.creator,'Ryan Hodnett');
    assert.match(src.frontImageMeta.scopeNote,/Consul Blikstads bro/);
  }
  return src;
});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript',
  '.json':'application/json','.css':'text/css','.jpg':'image/jpeg',
  '.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}
  catch{res.writeHead(400);res.end('bad URL');return;}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    res.writeHead(404);res.end('missing');return;
  }
  res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const out='artifacts/akerselva-outflow-photo';
fs.mkdirSync(out,{recursive:true});
const modes=[
  {name:'phone-390',engine:chromium,width:390,height:844,mobile:true},
  {name:'ipad-webkit-834',engine:webkit,width:834,height:1112,mobile:true},
  {name:'desktop-1440',engine:chromium,width:1440,height:1000,mobile:false}
];
try{
  for(const mode of modes){
    const browser=await mode.engine.launch({
      headless:true,
      ...(mode.engine===chromium?{args:['--no-sandbox','--disable-dev-shm-usage']}: {})
    });
    const context=await browser.newContext({
      viewport:{width:mode.width,height:mode.height},isMobile:mode.mobile,
      hasTouch:mode.mobile,locale:'nb-NO'
    });
    try{
      await context.addInitScript(()=>{
        localStorage.setItem('hg_onboarding_shown_v1','1');
        localStorage.setItem('HG_TEST_MODE','1');
      });
      const page=await context.newPage();
      for(const place of places){
        await page.goto(base+'/index.html?hgTest=1#/place/'+place.id,{
          waitUntil:'domcontentloaded',timeout:90000
        });
        await page.waitForFunction(id=>window.__HG_APP_READY__===true &&
          window.__HG_ROUTER_STARTED__===true &&
          document.querySelector('#placeCard')?.dataset.currentPlaceId===id,
          place.id,{timeout:90000});
        await page.waitForFunction(()=> {
          const hero=document.querySelector('#pcHeaderImage');
          const front=document.querySelector('#pcFrontImage');
          return hero?.complete&&hero.naturalWidth>0&&
                 front?.complete&&front.naturalWidth>0;
        },null,{timeout:90000});
        const actual=await page.evaluate(()=>{
          const read=id=>{
            const el=document.getElementById(id);
            const rect=el.getBoundingClientRect();
            const frame=el.parentElement.getBoundingClientRect();
            return {src:el.currentSrc,fit:getComputedStyle(el).objectFit,
              naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,
              width:rect.width,height:rect.height,
              frameWidth:frame.width,frameHeight:frame.height};
          };
          return{hero:read('pcHeaderImage'),front:read('pcFrontImage'),
            id:document.querySelector('#placeCard').dataset.currentPlaceId};
        });
        assert.equal(actual.id,place.id);
        assert.notEqual(actual.hero.src,actual.front.src,
          mode.name+'/'+place.id+': different source images needed');
        assert.ok(actual.hero.naturalWidth>actual.hero.naturalHeight,
          mode.name+'/'+place.id+': landscape must be wider than high');
        assert.ok(actual.front.naturalHeight>actual.front.naturalWidth,
          mode.name+'/'+place.id+': portrait must be taller than wide');
        for(const [name,img] of Object.entries({hero:actual.hero,front:actual.front})){
          assert.equal(img.fit,'cover',mode.name+'/'+place.id+'/'+name+': full-bleed fit');
          assert.ok(Math.abs(img.width-img.frameWidth)<=1,
            mode.name+'/'+place.id+'/'+name+': photo does not fill width '+JSON.stringify(img));
          assert.ok(Math.abs(img.height-img.frameHeight)<=1,
            mode.name+'/'+place.id+'/'+name+': photo does not fill height '+JSON.stringify(img));
        }
        await page.screenshot({path:out+'/'+mode.name+'-'+place.id+'.png',timeout:15000});
        console.log('PASS',mode.name,place.id,
          'distinct original media, decoded, full width/height, rights and attribution verified');
      }
    }finally{
      await context.close();await browser.close();
    }
  }
}finally{await new Promise(resolve=>server.close(resolve));}
