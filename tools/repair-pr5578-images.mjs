#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const verifiedAt = '2026-08-31';
const placeFile = path.join(root, 'data/places/by/oslo/places/markveien.json');
const sourcePage = 'https://commons.wikimedia.org/wiki/File:Markveien,_Oslo_(2015).jpg';
const sourceDownload = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Markveien%2C%20Oslo%20%282015%29.jpg';
const licenseUrl = 'https://creativecommons.org/licenses/by-sa/4.0';
const imagePath = path.join(root, 'bilder/places/markveien.JPG');
const cardPath = path.join(root, 'bilder/kort/places/markveien.PNG');
const frontPath = path.join(root, 'bilder/places/markveien_front_portrait.webp');

const response = await fetch(sourceDownload, {
  redirect: 'follow',
  headers: { 'user-agent': 'History-Go/1.0 (canonical place asset production)' }
});
if (!response.ok) throw new Error(`Commons download failed: ${response.status} ${response.statusText}`);
const sourceBuffer = Buffer.from(await response.arrayBuffer());
const metadata = await sharp(sourceBuffer).metadata();
if (metadata.width !== 4128 || metadata.height !== 2322) {
  throw new Error(`Unexpected Commons source dimensions: ${metadata.width}x${metadata.height}`);
}

fs.mkdirSync(path.dirname(imagePath), { recursive: true });
fs.mkdirSync(path.dirname(cardPath), { recursive: true });

await sharp(sourceBuffer)
  .rotate()
  .resize(1400, 900, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(imagePath);

await sharp(sourceBuffer)
  .rotate()
  .resize(900, 620, { fit: 'cover', position: 'centre' })
  .png({ compressionLevel: 9 })
  .toFile(cardPath);

await sharp(sourceBuffer)
  .rotate()
  .resize(900, 1200, { fit: 'cover', position: 'attention' })
  .webp({ quality: 88 })
  .toFile(frontPath);

const place = JSON.parse(fs.readFileSync(placeFile, 'utf8'));
if (place.id !== 'markveien') throw new Error(`Expected markveien, found ${place.id}`);
if (place.image !== 'bilder/places/markveien.JPG') throw new Error(`Unexpected image path: ${place.image}`);
if (place.cardImage !== 'bilder/kort/places/markveien.PNG') throw new Error(`Unexpected cardImage path: ${place.cardImage}`);

place.frontImage = 'bilder/places/markveien_front_portrait.webp';
place.imageMeta = {
  source: 'wikimedia_commons',
  sourcePage,
  creator: 'Ssu',
  credit: 'Ssu / Wikimedia Commons',
  license: 'CC BY-SA 4.0',
  licenseUrl,
  assetType: 'documentary_image',
  date: '2015-05-26 18:16:28',
  sourceDimensions: '4128x2322',
  outputDimensions: '1400x900',
  orientation: 'landscape',
  aspectRatio: '14:9',
  transformation: 'Proporsjonal beskjæring, skalering og JPEG-normalisering fra originalfotografiet; ingen innholdsgenerering.',
  verifiedAt
};
place.frontImageMeta = {
  source: 'wikimedia_commons',
  sourcePage,
  creator: 'Ssu',
  credit: 'Ssu / Wikimedia Commons',
  license: 'CC BY-SA 4.0',
  licenseUrl,
  assetType: 'documentary_image',
  date: '2015-05-26 18:16:28',
  sourceDimensions: '4128x2322',
  outputDimensions: '900x1200',
  orientation: 'portrait',
  aspectRatio: '3:4',
  transformation: 'Stående utsnitt, skalering og WebP-normalisering fra originalfotografiet; ingen innholdsgenerering.',
  verifiedAt
};
place.externalLinks = Array.isArray(place.externalLinks) ? place.externalLinks : [];
if (!place.externalLinks.some((link) => link?.url === sourcePage)) {
  place.externalLinks.push({
    type: 'image_source',
    label: 'Wikimedia Commons – Markveien, Oslo (2015)',
    url: sourcePage,
    verifiedAt
  });
}
fs.writeFileSync(placeFile, `${JSON.stringify(place, null, 2)}\n`);
console.log('Produced canonical Markveien image, cardImage and portrait frontImage from verified Commons source.');
