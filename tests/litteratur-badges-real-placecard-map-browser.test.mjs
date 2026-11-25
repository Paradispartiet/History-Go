#!/usr/bin/env node
// Focused acceptance: actual History Go app, Litteratur subbadge on PlaceCard,
// Litteratur MAIN badge on map pin; no authentication bypass in production.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const litteratur = read('data/badges/litteratur.json');
const candidates = read('data/badges/litteratur_eight_visual_candidates_20261124.json').candidates;
assert.equal(litteratur.id, 'litteratur');
assert.equal(litteratur.image, 'bilder/merker/litteratur-brodert-v4.webp');
assert.deepEqual(litteratur.subBadgeImages,Object.fromEntries(candidates.map(c=>[c.id,c.webp.path])));
assert.deepEqual(Object.keys(litteratur.subBadgeImages).sort(), litteratur.sub.slice().sort());
for (const image of Object.values(litteratur.subBadgeImages)) assert.ok(fs.statSync(path.join(root,image)).size>1000);
const places = [];
for (const entry of fs.readdirSync(path.join(root,'data/places/litteratur'),{recursive:true})) {
  if (!String(entry).endsWith('.json')) continue;
  let data; try { data=read(path.join('data/places/litteratur',entry)); } catch { continue; }
  for (const item of Array.isArray(data)?data:[data]) {
    if (item?.category==='litteratur' && item.id && Number.isFinite(item.lon) && Number.isFinite(item.lat) &&
        Array.isArray(item.underbadge_ids) && item.underbadge_ids.some(id=>litteratur.subBadgeImages[id])) places.push(item);
  }
}
places.sort((a,b)=>a.underbadge_ids.length-b.underbadge_ids.length||a.id.localeCompare(b.id));
assert.ok(places.length,'At least one real literature place with canonical underbadge required');
const place=places[0];
const expectedCardImage=litteratur.subBadgeImages[place.underbadge_ids.find(id=>litteratur.subBadgeImages[id])];
const expectedMapImage = litteratur.image;

const mime = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript',
  '.json':'application/json','.css':'text/css','.webp':'image/webp',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml',
  '.woff2':'font/woff2'};
const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404).end('Not found'); return;
  }
  response.writeHead(200, {'content-type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(response);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const out = path.join(root, 'artifacts', 'litteratur-badges-real-browser');
fs.mkdirSync(out, {recursive:true});
let browser;

try {
  browser = await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  for (const viewport of [{tag:'mobile',width:390,height:844,isMobile:true},
                          {tag:'desktop',width:1440,height:960,isMobile:false}]) {
    const context = await browser.newContext({
      viewport:{width:viewport.width,height:viewport.height},
      isMobile:viewport.isMobile,hasTouch:viewport.isMobile,locale:'nb-NO'
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await context.addInitScript(() => {
      localStorage.setItem('hg_onboarding_shown_v1','1');
      localStorage.setItem('HG_TEST_MODE','1');
      localStorage.setItem('hg_lang','nb');
      localStorage.setItem('hg_map_marker_mode','badges');
    });
    try {
      await page.goto(base + '/index.html?hgTest=1#/place/'+encodeURIComponent(place.id),
        {waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(placeId => window.__HG_APP_READY__ === true &&
        window.__HG_ROUTER_STARTED__ === true &&
        document.getElementById('placeCard')?.dataset.currentPlaceId === placeId,
        place.id,{timeout:90000});
      await page.waitForFunction(expected => {
        const badge = document.querySelector('#pcBadgesIcon img.pc-badge-round-img');
        return badge?.getAttribute('src') === expected &&
          badge.complete && badge.naturalWidth > 0;
      },expectedCardImage,{timeout:40000});

      const runtime = await page.evaluate(async () => {
        const badge=window.BADGES.find(b=>b.id==='litteratur');
        const loaded=await Promise.all(Object.entries(badge.subBadgeImages).map(async ([id,src])=>{
          const img=new Image(); img.src=src; await img.decode(); return {id,src,width:img.naturalWidth,height:img.naturalHeight};
        }));
        return {mappings:badge.subBadgeImages,loaded};
      });
      assert.deepEqual(runtime.mappings,litteratur.subBadgeImages);
      assert.equal(runtime.loaded.length,8);
      for(const img of runtime.loaded) {assert.equal(img.width,1024);assert.equal(img.height,1024);}
      const card = await page.evaluate(() => {
        const badge = document.querySelector('#pcBadgesIcon img.pc-badge-round-img');
        return {src:badge?.getAttribute('src'),alt:badge?.alt,
          naturalWidth:badge?.naturalWidth,naturalHeight:badge?.naturalHeight,
          objectFit:badge ? getComputedStyle(badge).objectFit : null,
          title:document.getElementById('pcTitle')?.textContent?.trim()};
      });
      assert.equal(card.src, expectedCardImage,viewport.tag + ': PlaceCard underbadge');
      assert.equal(card.objectFit,'contain',viewport.tag + ': full uncropped embroidery');
      assert.ok(card.naturalWidth > 0 && card.naturalHeight > 0,viewport.tag + ': loaded PlaceCard badge');
      await page.screenshot({path:path.join(out,viewport.tag+'-litteratur-placecard.png')});

      // Exercise the REAL map module, not a fabricated map marker. Keep only
      // the canonical Litteratur place in the in-browser map to avoid screen clutter.
      await page.waitForFunction(() => window.HGMap?.getMap?.() &&
        Array.isArray(window.BADGES) &&
        window.BADGES.some(b => b.id === 'litteratur'),null,{timeout:45000});
      await page.evaluate(p => {
        const map = window.HGMap.getMap();
        window.HGMap.setMarkerMode('badges');
        map.jumpTo({center:[p.lon,p.lat],zoom:16.5});
        window.HGMap.setPlaces([p]);
        window.HGMap.refreshMarkers();
      },place);
      await page.waitForFunction(({expected,placeId}) => {
        const img = document.querySelector(
          '.hg-place-detail-marker[data-place-id="'+CSS.escape(placeId)+'"] img.hg-place-detail-badge');
        return img?.getAttribute('src') === expected && img.complete && img.naturalWidth > 0;
      },{expected:expectedMapImage,placeId:place.id},{timeout:40000});
      const mapBadge = await page.evaluate(placeId => {
        const img=document.querySelector(
          '.hg-place-detail-marker[data-place-id="'+CSS.escape(placeId)+'"] img.hg-place-detail-badge');
        return {src:img?.getAttribute('src'),naturalWidth:img?.naturalWidth,
          parentId:img?.parentElement?.dataset.placeId};
      },place.id);
      assert.equal(mapBadge.src,expectedMapImage,viewport.tag + ': map pin must use Litteratur MAIN badge');
      assert.notEqual(mapBadge.src,card.src,viewport.tag + ': map badge must not use subbadge');
      assert.equal(mapBadge.parentId,place.id);
      // The card overlays the map on both form factors. Hide only the card
      // inside this test before capturing pixels, so the screenshot depicts
      // the actual MapLibre marker and not the overlapping PlaceCard text.
      await page.evaluate(() => {
        const card = document.getElementById('placeCard');
        if (card) card.style.setProperty('display','none','important');
      });
      const marker = page.locator('.hg-place-detail-marker').filter({has:page.locator('img.hg-place-detail-badge')}).and(page.locator('[data-place-id='+JSON.stringify(place.id)+']'));
      const markerImage = marker.locator('img.hg-place-detail-badge');
      await markerImage.screenshot({path:path.join(out,viewport.tag+'-litteratur-map-pin.png')});
      await page.screenshot({path:path.join(out,viewport.tag+'-litteratur-map-view.png')});
      console.log(viewport.tag.toUpperCase() + '_LITTERATUR_BADGE_BROWSER_PASS',JSON.stringify({place:place.id,card,mapBadge,runtime,pageErrors}));
    } catch (error) {
      const diag = await page.evaluate(() => ({
        appReady:window.__HG_APP_READY__,routerReady:window.__HG_ROUTER_STARTED__,
        placeId:document.getElementById('placeCard')?.dataset.currentPlaceId,
        badgesLoaded:window.BADGES?.length,
        mapAvailable:!!window.HGMap?.getMap?.(),
        badgeHtml:document.getElementById('pcBadgesIcon')?.innerHTML.slice(0,600),
        mapMarkers:document.querySelectorAll('.hg-place-detail-marker').length
      })).catch(() => ({}));
      console.error(viewport.tag + '_LITTERATUR_BADGE_DIAGNOSTIC',JSON.stringify(diag));
      await page.screenshot({path:path.join(out,viewport.tag+'-failed.png')}).catch(() => {});
      throw error;
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
