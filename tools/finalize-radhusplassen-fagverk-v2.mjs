import fs from 'node:fs';

const placePath = 'data/places/by/oslo/places/radhusplassen.json';
const place = JSON.parse(fs.readFileSync(placePath, 'utf8'));
const imageUrl = 'https://commons.wikimedia.org/wiki/Special:FilePath/R%C3%A5dhusplassen%20Oslo%202022-08-17%2001.jpg';
place.image = imageUrl;
place.cardImage = imageUrl;
place.imageMeta = {
  source: 'wikimedia_commons',
  sourcePage: 'https://commons.wikimedia.org/wiki/File%3AR%C3%A5dhusplassen_Oslo_2022-08-17_01.jpg',
  creator: 'Leonhard Lenz',
  credit: 'Own work',
  license: 'CC0 1.0',
  licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  assetType: 'documentary_image',
  date: '2022-08-17 14:08:58',
  transformation: 'Ingen lokal transformasjon; canonical ekstern Commons-fil brukes direkte.',
  verifiedAt: '2026-09-01',
  orientation: 'landscape',
  sourceDimensions: '8384x5612'
};
fs.writeFileSync(placePath, `${JSON.stringify(place, null, 2)}\n`);

const registryPath = 'data/fagverk/fagverk_registry.json';
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
registry.placeLinks ??= {};
registry.placeLinks.radhusplassen = {
  sourceFile: 'places/by/oslo/places/radhusplassen.json',
  field: 'fagverk',
  schema: 'history_go_place_fagverk_v2',
  level: 'full',
  status: 'curated'
};
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
