#!/usr/bin/env node
// Oslo sentrum bolk 05: source-locked CC BY-SA photographs.
// This is a scoped producer, not an automatic CI side effect.
// Run from repository root after "npm ci"; images require network access.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = process.cwd();
const manifestPath = 'reports/place-production/oslo-sentrum-bolk05-image-sources-20261101.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const ids = new Set([
  'folketeateret', 'kunstnernes_hus', 'historisk_museum',
  'ibsen_museum_teater', 'blitzhuset', 'kulturkirken_jakob_litteratur'
]);
if (manifest.images.length !== 6 || manifest.images.some(entry => !ids.delete(entry.placeId)) || ids.size) {
  throw new Error('OSLO05_SCOPE_INVALID: Manifest must contain exactly the six authorized canonical Places.');
}
const planOnly = process.argv.includes('--plan');
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
const base = 'bilder/places/oslo-bolk05-20261101';
const provenancePath = 'reports/place-production/oslo-sentrum-bolk05-media-provenance-20261101.json';
const results = [];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function retrieve(url) {
  for (let retry = 0; retry < 4; retry++) {
    if (retry) await sleep([0, 12000, 25000, 45000][retry]);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);
    try {
      const response = await fetch(url, {
        signal: controller.signal, redirect: 'follow',
        headers: {
          'User-Agent': 'HistoryGoOsloEditorial/1.0 (Paradispartiet/History-Go; Wikimedia Commons photo attribution)',
          Accept: 'image/jpeg,image/png,image/webp'
        }
      });
      if ((response.status === 429 || response.status >= 500) && retry < 3) continue;
      if (!response.ok) throw new Error('SOURCE_HTTP_' + response.status + ': ' + url);
      const mime = String(response.headers.get('content-type') || '');
      if (!mime.startsWith('image/')) throw new Error('SOURCE_NOT_IMAGE: ' + mime);
      const data = Buffer.from(await response.arrayBuffer());
      if (data.length < 20000 || data.length > 50 * 1024 * 1024) {
        throw new Error('SOURCE_SIZE_UNSAFE: ' + data.length);
      }
      return data;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error('SOURCE_RETRIES_EXHAUSTED: ' + url);
}

async function saveVariant(original, target, width, height, focus) {
  const data = await sharp(original).rotate().resize(width, height, {
    fit: 'cover', position: focus, withoutEnlargement: true
  }).webp({ quality: 86, effort: 5 }).toBuffer();
  const dest = path.join(root, target);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, data);
  const m = await sharp(data).metadata();
  return { path: target, sha256: digest(data), dimensions: [m.width, m.height], bytes: data.length, crop: focus };
}

for (const item of manifest.images) {
  const placeFile = path.join(root, item.placeFile);
  const place = JSON.parse(fs.readFileSync(placeFile, 'utf8'));
  if (place.id !== item.placeId) throw new Error('IDENTITY_MISMATCH: ' + item.placeId);
  if (!item.sourcePage.startsWith('https://commons.wikimedia.org/wiki/File:') ||
      !item.sourceUrl.startsWith('https://upload.wikimedia.org/wikipedia/commons/') ||
      !item.creator ||
      !/^CC BY-SA (3\.0|4\.0)$/.test(item.license) ||
      !item.licenseUrl.startsWith('https://creativecommons.org/licenses/by-sa/')) {
    throw new Error('SOURCE_OR_LICENSE_INVALID: ' + item.placeId);
  }
  const preserveHero = item.preserveExistingHero === true;
  if (preserveHero && !place.image) throw new Error('EXISTING_HERO_MISSING: ' + item.placeId);
  if (!preserveHero && place.image) throw new Error('EXISTING_HERO_NEEDS_EDITORIAL_REVIEW: ' + item.placeId);
  if (place.frontImage || place.cardImage) throw new Error('PREEXISTING_CARD_MEDIA_NEEDS_REVIEW: ' + item.placeId);
  if (planOnly) {
    console.log('OSLO05_MEDIA_PLAN', item.placeId, preserveHero ? 'preserve hero' : 'new hero',
      item.sourcePage, item.license);
    continue;
  }

  const raw = await retrieve(item.sourceUrl);
  const sourceMeta = await sharp(raw).metadata();
  if (!['jpeg', 'png', 'webp'].includes(sourceMeta.format) ||
      sourceMeta.width < 700 || sourceMeta.height < 500) {
    throw new Error('LOW_QUALITY_OR_UNSUPPORTED_ORIGINAL: ' + item.placeId);
  }

  const prefix = base + '/' + item.placeId;
  // These are conservative candidate crops. QA must inspect the facade,
  // street context and legibility in mobile and desktop before release.
  const outputs = {};
  if (!preserveHero) {
    outputs.image = await saveVariant(raw, prefix + '_hero.webp', 1400, 900, 'attention');
  }
  outputs.frontImage = await saveVariant(raw, prefix + '_portrait.webp', 800, 1050, 'attention');
  outputs.cardImage = await saveVariant(raw, 'bilder/kort/places/' + item.placeId + '.webp', 700, 980, 'attention');

  const credit = item.creator + ' / Wikimedia Commons';
  const original = {
    source: 'wikimedia_commons', sourcePage: item.sourcePage,
    originalUrl: item.sourceUrl, creator: item.creator, credit,
    license: item.license, licenseUrl: item.licenseUrl,
    photoDate: item.date, verifiedAt: manifest.verifiedAt,
    sourceSha256: digest(raw), sourceBytes: raw.length,
    sourceDimensions: [sourceMeta.width, sourceMeta.height],
    assetType: item.assetType, delivery: 'licensed_local_webp',
    transformation: 'Beskåret og konvertert til WebP',
    caption: item.caption
  };
  for (const [field, output] of Object.entries(outputs)) {
    place[field] = output.path;
    place[field + 'Meta'] = { ...original, outputSha256: output.sha256,
      outputDimensions: output.dimensions, outputBytes: output.bytes, crop: output.crop };
  }
  if (!preserveHero) {
    place.imageCaption = item.caption;
    place.imageCredit = credit;
    place.imageLicense = item.license;
    place.imageSourceUrl = item.sourcePage;
  }
  place.frontImageCaption = item.caption;
  place.frontImageCredit = credit;
  place.frontImageLicense = item.license;
  place.frontImageSourceUrl = item.sourcePage;
  place.cardImageCaption = item.caption;
  place.cardImageCredit = credit;
  place.cardImageLicense = item.license;
  place.cardImageSourceUrl = item.sourcePage;

  fs.writeFileSync(placeFile, JSON.stringify(place, null, 2) + '\n');
  results.push({ placeId: item.placeId, sourcePage: item.sourcePage,
    creator: item.creator, license: item.license, sourceSha256: digest(raw),
    sourceBytes: raw.length, outputs, preservedExistingHero: preserveHero });
  console.log('OSLO05_MEDIA_CREATED', item.placeId, Object.keys(outputs).join(','));
  await sleep(12000);
}
if (!planOnly) {
  fs.writeFileSync(provenancePath, JSON.stringify({
    schema: 'history_go_oslo_bolk05_media_provenance_v1',
    verifiedAt: manifest.verifiedAt, generatedAt: new Date().toISOString(),
    items: results
  }, null, 2) + '\n');
  console.log('OSLO05_PRODUCED', results.length, 'photos,',
    results.reduce((n, r) => n + Object.keys(r.outputs).length, 0), 'WebP assets');
}
