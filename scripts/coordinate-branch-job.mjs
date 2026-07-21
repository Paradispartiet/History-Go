import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const tempPath = path.resolve('scripts/.nature-main-sites-reservoir-fix-job.mjs');
const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/58b29b075059ccb3ec06bdb0bbda2ab49b07beb1/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Kunne ikke hente immutable nature-main-sites-runner: ${response.status} ${response.statusText}`);
let source = await response.text();
const before = `  maridalsvannet: {
    mode: 'osm', aliases: ['Maridalsvannet'], locatorType: 'natural_area', coordRole: 'area_anchor', coordType: 'lake_center',
    osmPreferences: [['natural', 'water']],`;
const after = `  maridalsvannet: {
    mode: 'osm', aliases: ['Maridalsvannet'], locatorType: 'natural_area', coordRole: 'area_anchor', coordType: 'lake_center',
    osmPreferences: [['water', 'reservoir'], ['natural', 'water']],`;
if (!source.includes(before)) throw new Error('Fant ikke Maridalsvannet-filteret i immutable runner.');
source = source.replace(before, after);
fs.writeFileSync(tempPath, source);
try {
  await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempPath, { force: true });
}
