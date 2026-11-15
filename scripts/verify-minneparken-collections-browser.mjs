#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const root = process.cwd();
const [placeId] = process.argv.slice(2);

if (!placeId) {
  console.error('Usage: node scripts/verify-place-closeout-browser.mjs <place_id>');
  process.exit(2);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

const runtime = readJson(`data/runtime/place-open/${placeId}.json`);
const place = runtime.place;
assert.equal(place?.id, placeId, `runtime place-open payload does not resolve ${placeId}`);
assert.equal(place?.place_card_profile?.schema, 'history_go_place_card_profile_v2', 'closeout requires place_card_profile_v2');

const expectedCollections = ['people','objects','historical_events'];
assert.ok(expectedCollections.length >= 1 && expectedCollections.length <= 4, 'closeout expects 1-4 PASS collections');
assert.deepEqual(
  place.place_card_profile.collection_ids,
  expectedCollections,
  'PlaceCard collection_ids must match PASS collections in reviewed collection order',
);

const fixedIcons = {
  people: 'pcPeopleIcon',
  objects: 'pcObjectsIcon',
  brands: 'pcBrandsIcon',
};
const categoryCollections = expectedCollections.filter((id) => !(id in fixedIcons));
assert.ok(categoryCollections.length <= 1, `closeout supports one category-expression collection, found: ${categoryCollections.join(', ')}`);
const expectedUiCollections = expectedCollections.map((id) => ({
  id,
  iconId: fixedIcons[id] || 'pcCategoryCollectionIcon',
}));

const mime = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const relative = pathname === '/' ? '/index.html' : pathname;
  const file = path.resolve(root, `.${relative}`);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404);
    response.end('not found');
    return;
  }
  response.writeHead(200, { 'content-type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  response.end(fs.readFileSync(file));
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;
const outDir = path.join(root, 'artifacts', 'minneparken-closeout', placeId);
fs.mkdirSync(outDir, { recursive: true });

const profiles = [
  { name: 'desktop', viewport: { width: 1440, height: 1000 } },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];

let browser;
const reports = [];
let failed = false;

try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_BIN || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: profile.viewport,
      locale: "nb-NO",
      reducedMotion: "reduce",
      isMobile: profile.isMobile || false,
      hasTouch: profile.hasTouch || false,
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error)));

    await page.addInitScript(() => {
      try {
        localStorage.setItem('hg_onboarding_shown_v1', '1');
        localStorage.setItem('HG_TEST_MODE', '1');
      } catch {}
    });

    try {
    await page.goto(`${baseUrl}/index.html?hgTest=1#/place/${placeId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await page.waitForFunction(
      () => window.__HG_APP_READY__ === true && window.__HG_ROUTER_STARTED__ === true,
      null,
      { timeout: 90_000 },
    );
    await page.waitForFunction(
      (id) => document.getElementById('placeCard')?.dataset?.currentPlaceId === id,
      placeId,
      { timeout: 60_000 },
    );
    try {
    await page.waitForFunction(
      ({ count, collections }) => {
        const card = document.getElementById('placeCard');
        if (card?.dataset?.collectionMode !== 'place-card-collections-v2') return false;
        if (Number(card?.dataset?.collectionCount || 0) !== count) return false;
        const editorial = card.classList.contains('is-unified-place')
          && card.classList.contains('is-place-sheet-direct');
        return collections.every(({ iconId, id }) => {
          const el = document.getElementById(iconId);
          if (!(el instanceof HTMLElement)) return false;
          const rect = el.getBoundingClientRect();
          if (el.hidden || el.getAttribute('aria-hidden') === 'true' || el.dataset.collectionId !== id) return false;
          if (editorial && (id === 'objects' || id === 'historical_events')) {
            // Place Sheet Direct deliberately hides original round icons.
            // Require their real editorial gallery buttons in the proper
            // section, then exercise those buttons below after scrolling.
            const section = id === 'objects' ? 'history' : 'about';
            const button = card.querySelector('[data-pc-round-gallery-section="'+section+'"] [data-pc-round-gallery-item="'+iconId+'"]');
            const image = button?.querySelector('img');
            return getComputedStyle(el).display === 'none'
              && el.dataset.pcRoundGallerySource === '1'
              && button instanceof HTMLButtonElement
              && image instanceof HTMLImageElement && Boolean(image.getAttribute('src'));
          }
          if (id === 'brands' && editorial) {
            // The canonical Brands action remains in the old grid, while the
            // visible, uncropped logo belongs at the end of the About section.
            const gallery = card.querySelector('.pc-sheet-canonical-about [data-pc-round-gallery-brand="1"]');
            const button = gallery?.querySelector('button');
            const image = button?.querySelector('img');
            const box = button?.getBoundingClientRect();
            // The About-section brand is below long prose and its image is
            // intentionally loading="lazy". Check that the real preview exists
            // here, then scroll it into view before requiring decoded pixels.
            return getComputedStyle(el).display === 'none'
              && box?.width > 0 && box?.height > 0
              && image instanceof HTMLImageElement && Boolean(image.getAttribute('src'));
          }
          return rect.width > 0 && rect.height > 0;
        });
      },
      { count: expectedUiCollections.length, collections: expectedUiCollections },
      { timeout: 60_000 },
    );
    } catch (error) {
      const diagnostic = await page.evaluate((collections) => {
        const card = document.getElementById('placeCard');
        const brand = card?.querySelector('.pc-sheet-canonical-about [data-pc-round-gallery-brand="1"]');
        const button = brand?.querySelector('button');
        const img = button?.querySelector('img');
        const box = button?.getBoundingClientRect();
        return {
          currentPlaceId: card?.dataset.currentPlaceId,
          collectionMode: card?.dataset.collectionMode,
          collectionCount: card?.dataset.collectionCount,
          classes: card?.className,
          editorials: card?.querySelectorAll('.pc-sheet-canonical-about').length ?? 0,
          brand: { exists: Boolean(brand), button: Boolean(button), width: box?.width ?? 0, height: box?.height ?? 0,
            image: img instanceof HTMLImageElement ? {src: img.getAttribute('src'), loading: img.loading, complete: img.complete, naturalWidth: img.naturalWidth} : null },
          icons: collections.map(({id,iconId}) => {
            const el=document.getElementById(iconId),rect=el?.getBoundingClientRect();
            return {id,iconId,exists:Boolean(el),actualId:el?.dataset.collectionId,hidden:el?.hidden,
              ariaHidden:el?.getAttribute('aria-hidden'),display:el?getComputedStyle(el).display:null,
              width:rect?.width??0,height:rect?.height??0,roundReady:el?.dataset.roundReady,
              imageSource:el?.querySelector('img')?.getAttribute('src')};
          })
        };
      }, expectedUiCollections);
      const full={message:String(error),diagnostic,pageErrors};
      fs.writeFileSync(path.join(outDir,profile.name+'-collection-preflight.json'),JSON.stringify(full,null,2)+'\n');
      console.error('Minneparken collections preflight diagnostics:',JSON.stringify(full));
      throw error;
    }
    // Do not scroll to the bottom-of-About Brands logo before clicking the
    // People round in the hero. Every editorial image is scrolled into view
    // and checked for actual loaded pixels at its own popup step below.
    await page.waitForFunction(
      () => {
        const flip = document.getElementById('pcFrontCardFlip');
        const content = document.getElementById('pcQuizCardContent');
        // The back face is visibility:hidden until flipped; use textContent here.
        return flip?.classList.contains('has-quiz-card')
          && content instanceof HTMLElement
          && content.hidden === false
          && (content.textContent || '').trim().length > 20;
      },
      null,
      { timeout: 60_000 },
    );
    await page.waitForFunction(
      () => typeof window.showPlaceCardRoundPopup === 'function',
      null,
      { timeout: 30_000 },
    );

    await page.evaluate(() => {
      const original = window.showPlaceCardRoundPopup;
      window.__HG_PLACE_CLOSEOUT_POPUPS__ = [];
      window.showPlaceCardRoundPopup = function(options = {}) {
        window.__HG_PLACE_CLOSEOUT_POPUPS__.push({
          kind: String(options?.kind || ''),
          title: String(options?.title || ''),
          html: String(options?.html || ''),
        });
        return original.apply(this, arguments);
      };
    });

    const collectionState = await page.evaluate((collections) => collections.map(({ iconId, id }) => {
      const el = document.getElementById(iconId);
      const image = el?.querySelector(':scope > img.pc-person-img');
      return {
        id,
        actualId: el?.dataset?.collectionId || '',
        position: Number(el?.dataset?.collectionPosition ?? -1),
        inTitleRow: Boolean(el?.closest('.pc-title-row')),
        inCollectionGrid: Boolean(el?.closest('.pc-icons-quad')),
        itemCount: Number(el?.dataset?.collectionItemCount || 0),
        previewLoaded: image instanceof HTMLImageElement ? image.complete && image.naturalWidth > 0 : false,
        brandInEditorialAbout: id === 'brands' && Boolean(
          document.querySelector('#placeCard .pc-sheet-canonical-about [data-pc-round-gallery-brand="1"] button')?.getBoundingClientRect().width > 0
        ),
        brandSourceHiddenByEditorialLayout: id === 'brands' && getComputedStyle(el).display === 'none',
      };
    }), expectedUiCollections);

    const popupChecks = [];
    for (const expected of expectedUiCollections) {
      const before = await page.evaluate(() => window.__HG_PLACE_CLOSEOUT_POPUPS__?.length || 0);
      // The canonical source rounds are CSS-hidden under Place Sheet Direct.
      // Select their real editorial section and click the visible gallery
      // button, which forwards to the original popup handler.
      const section = expected.id === 'objects' ? 'history'
        : expected.id === 'historical_events' || expected.id === 'brands' ? 'about' : null;
      if (section) {
        await page.locator('#placeCard > [data-hg-place-sheet-nav="1"] [data-hg-place-sheet-jump="'+section+'"]').press('Enter');
        await page.locator('#placeCard [data-hg-place-sheet-section="'+section+'"]').first().waitFor({state:'visible',timeout:15_000});
      }
      const gallerySelector = expected.id === 'brands'
        ? '#placeCard .pc-sheet-canonical-about [data-pc-round-gallery-brand="1"] button'
        : section
          ? '#placeCard [data-pc-round-gallery-section="'+section+'"] [data-pc-round-gallery-item="'+expected.iconId+'"]'
          : null;
      const action = page.locator(gallerySelector || `#${expected.iconId}`);
      if (gallerySelector) {
        await action.scrollIntoViewIfNeeded();
        await page.waitForFunction((selector) => {
          const button = document.querySelector(selector);
          const image = button?.querySelector('img');
          const rect = button?.getBoundingClientRect();
          return button instanceof HTMLButtonElement
            && rect?.width > 0 && rect?.height > 0
            && image instanceof HTMLImageElement
            && image.complete && image.naturalWidth > 0;
        }, gallerySelector, {timeout:30_000});
      }
      await action.click();
      await page.waitForFunction(
        (count) => (window.__HG_PLACE_CLOSEOUT_POPUPS__?.length || 0) > count,
        before,
        { timeout: 10_000 },
      );
      const popup = await page.evaluate(() => window.__HG_PLACE_CLOSEOUT_POPUPS__.at(-1));
      if(expected.id==='people') {
        assert.ok(popup.html.includes('gerhard_fischer')&&popup.html.includes('harry_fett'),'Both sourced park profiles must be present');
      }
      if(expected.id==='objects') {
        assert.ok(popup.html.includes('Gudrun'),'Identified Gudrun gravestone required');
        assert.ok(popup.html.includes('Magdalena'),'Identified Magdalena gravestone required');
      }
      if(expected.id==='brands') assert.ok(popup.html.includes('Baker Hansen'));
      popupChecks.push({
        expectedId: expected.id,
        kind: popup?.kind || '',
        title: popup?.title || '',
        hasContent: String(popup?.html || '').trim().length > 20,
      });

      const popupRoot = page.locator('.hg-popup.placecard-round-popup.visible');
      await page.waitForFunction(()=>[...document.querySelectorAll('.hg-popup.placecard-round-popup.visible img')].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:30000});
      await page.screenshot({path:path.join(outDir,profile.name+'-collection-'+expected.id+'.png')});
      await popupRoot.locator('[data-close-popup]').click();
      await popupRoot.waitFor({ state: 'detached', timeout: 10_000 });
    }

    await page.locator('#pcFavorite').click();
    assert.equal(await page.evaluate(id=>window.HGFavoritePlaces.has(id),placeId),true);
    await page.locator('#pcFavorite').click();
    assert.equal(await page.evaluate(id=>window.HGFavoritePlaces.has(id),placeId),false);
    assert.equal(await page.locator('#pcVisit').isVisible(),true);
    await page.evaluate(id=>window.showPlacePopup(window.PLACES.find(p=>p.id===id)),placeId);
    const sheet=page.locator('#placeCard [data-hg-place-sheet-shell]');
    await sheet.waitFor({state:'visible',timeout:30000});
    // The section navigation is a direct child of PlaceCard, outside its scroll body.
    const nav=page.locator('#placeCard > [data-hg-place-sheet-nav="1"]');
    await nav.waitFor({state:'visible',timeout:30000});
    const tabChecks=[];
    for(const id of ['about','history','stories','news','reading','sources','language','learning']) {
      const jump=nav.locator('[data-hg-place-sheet-jump="'+id+'"]');
      await jump.waitFor({state:'visible',timeout:30000});
      // Sticky navigation and scrollIntoView can make pointer auto-scrolling
      // oscillate on narrow viewports; exercise the actual keyboard action.
      await jump.press('Enter');
      const panel=sheet.locator('[data-hg-place-sheet-section="'+id+'"]').first();
      await panel.waitFor({state:'visible',timeout:15000});
      await page.waitForFunction(sectionId=>{
        const section=document.querySelector('#placeCard [data-hg-place-sheet-section="'+sectionId+'"]');
        const nav=document.querySelector('#placeCard > [data-hg-place-sheet-nav]');
        const body=document.querySelector('#placeCard .pc-body');
        if(!section||!nav||!body)return false;
        const a=section.getBoundingClientRect(), n=nav.getBoundingClientRect(), b=body.getBoundingClientRect();
        // Navigation is permanently at the BOTTOM of PlaceCard: verify the
        // selected section starts in the visible reading pane ABOVE the nav.
        return a.height>24 && n.height>0 && a.top>=b.top-2
          && a.top<n.top-2 && a.bottom>b.top+24;
      },id,{timeout:15000}).catch(async error=>{
        const geometry=await panel.evaluate(el=>{
          const r=x=>{const b=x?.getBoundingClientRect();return b?{top:b.top,bottom:b.bottom,height:b.height}:null};
          const body=document.querySelector('#placeCard .pc-body');
          return {section:r(el),nav:r(document.querySelector('#placeCard > [data-hg-place-sheet-nav]')),body:r(body),scrollTop:body?.scrollTop};
        });
        throw new Error('Selected section not visible above bottom navigation: '+id+' '+JSON.stringify(geometry),{cause:error});
      });
      if(id==='history') assert.match(await panel.innerText(),/1918|1932/);
      if(id==='stories') assert.match(await panel.innerText(),/betonglokket|betongdekket/i);
      if(id==='news') assert.match(await panel.innerText(),/juni 2026/i);
      if(id==='reading') assert.ok(await panel.locator('a[href*="middelalder.no"]').count()>=1);
      if(id==='sources') assert.ok(await panel.locator('a[href^="https:"]').count()>=5);
      if(id==='language') {
        await panel.locator('[data-language-collect]').first().click();
        assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('hg_knowledge_entries_v2')||'[]').some(x=>x.source?.type==='language_lexicon')));
      }
      tabChecks.push({id,textLength:(await panel.innerText()).length});
      await page.screenshot({path:path.join(outDir,profile.name+'-section-'+id+'.png')});
    }
    assert.equal(await nav.locator('[data-hg-place-sheet-jump="before-after"]').isHidden(),true,'No invented before/after pair may be shown');
    fs.writeFileSync(path.join(outDir,profile.name+'-tabs.json'),JSON.stringify(tabChecks,null,2));
    await nav.locator('[data-hg-place-sheet-jump="about"]').press('Enter');
    const beforeFlipText = await page.locator('#pcQuizCardContent').textContent();
    await page.locator('#pcFrontCardFlip').click();
    await page.waitForFunction(
      () => document.getElementById('pcFrontCardFlip')?.classList.contains('is-flipped') === true,
      null,
      { timeout: 10_000 },
    );
    const visibleBack = await page.locator('.pc-card-face-back').evaluate(el => ({
      visibility: getComputedStyle(el).visibility,
      content: (el.textContent || '').trim(),
    }));
    assert.equal(visibleBack.visibility, 'visible', 'QuizCard backside must become visible after the flip');
    assert.ok(visibleBack.content.length > 20, 'QuizCard backside must contain real quiz text after the flip');
    await page.locator('#pcFrontCardFlip').click();
    await page.waitForFunction(
      () => document.getElementById('pcFrontCardFlip')?.classList.contains('is-flipped') !== true,
      null,
      { timeout: 10_000 },
    );

    const base = await page.evaluate(() => {
      const card = document.getElementById('placeCard');
      const rect = card?.getBoundingClientRect?.();
      const images = Array.from(card?.querySelectorAll?.('img') || [])
        .map((img) => {
          const box = img.getBoundingClientRect();
          return {
            src: img.currentSrc || img.src || '',
            width: box.width,
            height: box.height,
            naturalWidth: img.naturalWidth,
            complete: img.complete,
          };
        })
        .filter((img) => img.width > 0 && img.height > 0 && img.src);
      return {
        title: (document.getElementById('pcTitle')?.textContent || '').trim(),
        placeId: card?.dataset?.currentPlaceId || '',
        visible: Boolean(rect && rect.width > 0 && rect.height > 0),
        collectionMode: card?.dataset?.collectionMode || '',
        collectionCount: Number(card?.dataset?.collectionCount || 0),
        horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        images,
      };
    });

    await page.screenshot({ path: path.join(outDir, `${profile.name}-placecard.png`), fullPage: true });

    // Exercise the existing visit controller with synthetic positions in this
    // isolated browser context. Near point is the lawful public museum anchor.
    await page.evaluate(async id => {
      window.TEST_MODE=false;
      window.getPos=()=>({lat:59.91,lon:10.75});
      await window.openPlaceCard(window.PLACES.find(p=>p.id===id));
    },placeId);
    await page.locator('#pcVisit').click();
    assert.equal(await page.evaluate(id=>window.HGPhysicalVisits.isVisited(id),placeId),false,'Far-away click must not record a visit');
    await page.evaluate(async id => {
      window.getPos=()=>({lat:59.90616,lon:10.76884});
      await window.openPlaceCard(window.PLACES.find(p=>p.id===id));
    },placeId);
    await page.locator('#pcVisit').click();
    await page.waitForFunction(id=>window.HGPhysicalVisits.isVisited(id),placeId,{timeout:15000});
    assert.match(await page.locator('#pcVisit').innerText(),/Besøkt/);

    await page.locator('#pcQuiz').click();
    await page.waitForFunction(
      (id) => location.hash.startsWith(`#/quiz/${id}`),
      placeId,
      { timeout: 15_000 },
    );
    const quizHash = await page.evaluate(() => location.hash);

    const required = {
      exactPlace: base.placeId === placeId,
      titlePresent: base.title.length > 0,
      visible: base.visible === true,
      canonicalCollectionMode: base.collectionMode === 'place-card-collections-v2',
      collectionCount: base.collectionCount === expectedUiCollections.length,
      collectionIdsAndOrder: collectionState.every((item, index) =>
        item.actualId === expectedUiCollections[index].id && (item.id === 'people'
          ? item.inTitleRow && !item.inCollectionGrid
          : item.inCollectionGrid && item.position === expectedUiCollections.filter(row => row.id !== 'people').findIndex(row => row.id === item.id))
      ),
      collectionItemsPresent: collectionState.every((item) => item.itemCount >= 1),
      collectionPreviewsLoaded: collectionState.every((item) => item.previewLoaded === true),
      collectionPopups: popupChecks.every((item) => item.hasContent && item.title.trim().length > 0),
      quizCardMaterialized: beforeFlipText.trim().length > 20,
      quizEntry: quizHash.startsWith(`#/quiz/${placeId}`),
      noHorizontalOverflow: base.horizontalOverflowPx <= 2,
      noPageErrors: pageErrors.length === 0,
      // A lazy/offscreen image with complete=false is still pending, not broken.
      // Broken requests have complete=true but naturalWidth=0.
      noBrokenVisibleImages: base.images.every((image) => !image.complete || Number(image.naturalWidth || 0) > 0),
    };

    const report = {
      placeId,
      profile: profile.name,
      expectedCollections,
      required,
      base,
      collectionState,
      popupChecks,
      quizHash,
      pageErrors,
    };
    reports.push(report);
    fs.writeFileSync(path.join(outDir, `${profile.name}.json`), JSON.stringify(report, null, 2) + '\n');

    if (Object.values(required).some((value) => value !== true)) failed = true;
    } catch(error) {await page.screenshot({path:path.join(outDir,profile.name+'-failure.png')}).catch(()=>{});throw error;}
    await context.close();
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}

fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(reports, null, 2) + '\n');
if (failed) {
  console.error(`Place closeout browser QA failed for ${placeId}`);
  process.exit(1);
}
console.log(`Place closeout browser QA OK: ${placeId}`);
