#!/usr/bin/env node
// Focused acceptance: actual History Go app, Kunst subbadge on PlaceCard,
// Kunst MAIN badge on map pin; no authentication bypass in production.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const kunst = read('data/badges/kunst.json');
const place = read('data/places/kunst/oslo/places_kunst/oslo_prosjektrom.json');
assert.equal(kunst.id, 'kunst');
assert.equal(place.category, 'kunst');
assert.equal(place.id, 'oslo_prosjektrom');
assert.ok(place.underbadge_ids.includes('samtidskunst'));
assert.equal(kunst.image, 'bilder/merker/kunst-brodert.webp');
assert.equal(kunst.sub.length, 10);
assert.deepEqual(Object.keys(kunst.subBadgeImages).sort(), kunst.sub.slice().sort());
assert.ok(!Object.values(kunst.subBadgeImages).includes(kunst.image));
for (const [id, image] of Object.entries(kunst.subBadgeImages)) {
  assert.ok(fs.statSync(path.join(root, image)).size > 1000, id + ' missing badge image');
}
const expectedCardImage = kunst.subBadgeImages.samtidskunst;
const expectedMapImage = kunst.image;

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
const out = path.join(root, 'artifacts', 'kunst-badges-real-browser');
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
      await page.goto(base + '/index.html?hgTest=1#/place/oslo_prosjektrom',
        {waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(() => window.__HG_APP_READY__ === true &&
        window.__HG_ROUTER_STARTED__ === true &&
        document.getElementById('placeCard')?.dataset.currentPlaceId === 'oslo_prosjektrom',
        null,{timeout:90000});
      await page.waitForFunction(expected => {
        const badge = document.querySelector('#pcBadgesIcon img.pc-badge-round-img');
        return badge?.getAttribute('src') === expected &&
          badge.complete && badge.naturalWidth > 0;
      },expectedCardImage,{timeout:40000});

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
      await page.screenshot({path:path.join(out,viewport.tag+'-kunst-placecard.png')});

      // Exercise the REAL map module, not a fabricated map marker. Keep only
      // the canonical Kunst place in the in-browser map to avoid screen clutter.
      await page.waitForFunction(() => window.HGMap?.getMap?.() &&
        Array.isArray(window.BADGES) &&
        window.BADGES.some(b => b.id === 'kunst'),null,{timeout:45000});
      await page.evaluate(p => {
        const map = window.HGMap.getMap();
        window.HGMap.setMarkerMode('badges');
        map.jumpTo({center:[p.lon,p.lat],zoom:16.5});
        window.HGMap.setPlaces([p]);
        window.HGMap.refreshMarkers();
      },place);
      await page.waitForFunction(expected => {
        const img = document.querySelector(
          '.hg-place-detail-marker[data-place-id="oslo_prosjektrom"] img.hg-place-detail-badge');
        return img?.getAttribute('src') === expected && img.complete && img.naturalWidth > 0;
      },expectedMapImage,{timeout:40000});
      const mapBadge = await page.evaluate(() => {
        const img=document.querySelector(
          '.hg-place-detail-marker[data-place-id="oslo_prosjektrom"] img.hg-place-detail-badge');
        return {src:img?.getAttribute('src'),naturalWidth:img?.naturalWidth,
          parentId:img?.parentElement?.dataset.placeId};
      });
      assert.equal(mapBadge.src,expectedMapImage,viewport.tag + ': map pin must use Kunst MAIN badge');
      assert.notEqual(mapBadge.src,card.src,viewport.tag + ': map badge must not use subbadge');
      assert.equal(mapBadge.parentId,place.id);
      const marker = page.locator('.hg-place-detail-marker[data-place-id="oslo_prosjektrom"]');
      await marker.screenshot({path:path.join(out,viewport.tag+'-kunst-map-pin.png')});
      console.log(viewport.tag.toUpperCase() + '_KUNST_BADGE_BROWSER_PASS',JSON.stringify({card,mapBadge,pageErrors}));
    } catch (error) {
      const diag = await page.evaluate(() => ({
        appReady:window.__HG_APP_READY__,routerReady:window.__HG_ROUTER_STARTED__,
        placeId:document.getElementById('placeCard')?.dataset.currentPlaceId,
        badgesLoaded:window.BADGES?.length,
        mapAvailable:!!window.HGMap?.getMap?.(),
        badgeHtml:document.getElementById('pcBadgesIcon')?.innerHTML.slice(0,600),
        mapMarkers:document.querySelectorAll('.hg-place-detail-marker').length
      })).catch(() => ({}));
      console.error(viewport.tag + '_KUNST_BADGE_DIAGNOSTIC',JSON.stringify(diag));
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
