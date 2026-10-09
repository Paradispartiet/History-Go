#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const root = process.cwd();
const [placeId, ...flags] = process.argv.slice(2);
const partialQA = flags.length === 1 && flags[0] === '--partial-placecard-qa';
if (flags.length && !partialQA) {
  console.error('Unknown closeout QA options:', flags.join(', '));
  process.exit(2);
}

if (!placeId) {
  console.error('Usage: node scripts/verify-place-closeout-browser.mjs <place_id> [--partial-placecard-qa]');
  process.exit(2);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

const workflow = partialQA ? null : readJson(`data/places/workflow/${placeId}.json`);
if (!partialQA && workflow.manual_reviews?.final_ui?.status !== 'PASS') {
  console.log(`Place closeout browser QA skipped for ${placeId}: manual_reviews.final_ui is not PASS.`);
  process.exit(0);
}

const runtime = readJson(`data/runtime/place-open/${placeId}.json`);
const place = runtime.place;
assert.equal(place?.id, placeId, `runtime place-open payload does not resolve ${placeId}`);
assert.equal(place?.place_card_profile?.schema, 'history_go_place_card_profile_v2', 'closeout requires place_card_profile_v2');

const expectedCollections = partialQA
  ? place.place_card_profile.collection_ids
  : Object.entries(workflow.collections || {})
      .filter(([, value]) => value?.status === 'PASS')
      .map(([id]) => id);
assert.ok(expectedCollections.length >= 1 && expectedCollections.length <= 4, 'closeout expects 1-4 PASS collections');
assert.deepEqual(
  place.place_card_profile.collection_ids,
  expectedCollections,
  'PlaceCard collection_ids must match PASS collections in workflow order',
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
const outDir = path.join(root, 'artifacts', 'place-closeout', placeId);
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
    await page.waitForFunction(
      ({ count, collections }) => {
        const card = document.getElementById('placeCard');
        if (card?.dataset?.collectionMode !== 'place-card-collections-v2') return false;
        if (Number(card?.dataset?.collectionCount || 0) !== count) return false;
        return collections.every(({ iconId, id }) => {
          const el = document.getElementById(iconId);
          if (!(el instanceof HTMLElement)) return false;
          const rect = el.getBoundingClientRect();
          return el.hidden !== true
            && el.getAttribute('aria-hidden') !== 'true'
            && rect.width > 0
            && rect.height > 0
            && el.dataset.collectionId === id;
        });
      },
      { count: expectedUiCollections.length, collections: expectedUiCollections },
      { timeout: 60_000 },
    );
    await page.waitForFunction(
      () => {
        const flip = document.getElementById('pcFrontCardFlip');
        const content = document.getElementById('pcQuizCardContent');
        return flip?.classList.contains('has-quiz-card')
          && content instanceof HTMLElement
          && content.hidden === false
          && (content.innerText || '').trim().length > 20;
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
        itemCount: Number(el?.dataset?.collectionItemCount || 0),
        previewLoaded: image instanceof HTMLImageElement ? image.complete && image.naturalWidth > 0 : false,
      };
    }), expectedUiCollections);

    const popupChecks = [];
    for (const expected of expectedUiCollections) {
      const before = await page.evaluate(() => window.__HG_PLACE_CLOSEOUT_POPUPS__?.length || 0);
      await page.locator(`#${expected.iconId}`).click();
      await page.waitForFunction(
        (count) => (window.__HG_PLACE_CLOSEOUT_POPUPS__?.length || 0) > count,
        before,
        { timeout: 10_000 },
      );
      const popup = await page.evaluate(() => window.__HG_PLACE_CLOSEOUT_POPUPS__.at(-1));
      popupChecks.push({
        expectedId: expected.id,
        kind: popup?.kind || '',
        title: popup?.title || '',
        hasContent: String(popup?.html || '').trim().length > 20,
      });

      const popupRoot = page.locator('.hg-popup.placecard-round-popup.visible');
      await popupRoot.locator('[data-close-popup]').click();
      await popupRoot.waitFor({ state: 'detached', timeout: 10_000 });
    }

    const beforeFlipText = await page.locator('#pcQuizCardContent').innerText();
    await page.evaluate(() => {
      const card = document.getElementById('pcFrontCardFlip');
      window.__HG_GRABEIN_FLIP_EVENTS__ = [];
      card?.addEventListener('click', (event) => {
        window.__HG_GRABEIN_FLIP_EVENTS__.push({
          target: event.target?.id || event.target?.className || event.target?.tagName,
          flipped: card.classList.contains('is-flipped'),
          time: performance.now(),
        });
      }, {capture: true});
    });
    await page.locator('#pcFrontCardFlip').click();
    await page.waitForFunction(
      () => document.getElementById('pcFrontCardFlip')?.classList.contains('is-flipped') === true,
      null,
      { timeout: 10_000 },
    );
    const firstFlipState = await page.evaluate(() => {
      const card = document.getElementById('pcFrontCardFlip');
      const rect = card.getBoundingClientRect();
      const middle = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return {
        flipped: card.classList.contains('is-flipped'),
        hasQuiz: card.classList.contains('has-quiz-card'),
        pointTarget: middle?.id || middle?.className || middle?.tagName,
        events: window.__HG_GRABEIN_FLIP_EVENTS__,
      };
    });
    await page.locator('#pcFrontCardFlip').click();
    const secondFlipState = await page.evaluate(() => {
      const card = document.getElementById('pcFrontCardFlip');
      const rect = card.getBoundingClientRect();
      const middle = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return {
        flipped: card.classList.contains('is-flipped'),
        hasQuiz: card.classList.contains('has-quiz-card'),
        pointTarget: middle?.id || middle?.className || middle?.tagName,
        events: window.__HG_GRABEIN_FLIP_EVENTS__,
      };
    });
    console.log('HG_GRABEIN_FLIP_DEBUG ' + JSON.stringify({profile:profile.name, firstFlipState, secondFlipState}));
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
        item.actualId === expectedUiCollections[index].id && item.position === index
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
      qaMode: partialQA ? 'partial-placecard-qa' : 'full-production-closeout',
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
