import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const tempPath = path.resolve('scripts/.history-added-coordinate-fixed-index-job.mjs');
const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/d62d4d56cd7d7a479f6dd364fb900a40cb338937/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Kunne ikke hente immutable batch-runner: ${response.status} ${response.statusText}`);
}

let source = await response.text();
const oldProjection = `  splitIndex.push({
    id: place.id,
    name: place.name ?? null,
    category: place.category ?? null,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    year: place.year ?? null,
    coordStatus: place.coordStatus ?? null,
    coordType: place.coordType ?? null,
    file: row.file
  });`;
const fullProjection = `  splitIndex.push({
    id: place.id,
    name: place.name ?? null,
    category: place.category ?? null,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    year: place.year ?? null,
    coordStatus: place.coordStatus ?? null,
    coordType: place.coordType ?? null,
    locatorType: place.locatorType ?? null,
    sourceProvider: place.sourceProvider ?? null,
    sourceObjectId: place.sourceObjectId ?? null,
    geocodeAccuracy: place.geocodeAccuracy ?? null,
    coordRole: place.coordRole ?? null,
    coordSource: place.coordSource ?? null,
    coordSourceId: place.coordSourceId ?? null,
    coordSourceUrl: place.coordSourceUrl ?? null,
    coordVerifiedAt: place.coordVerifiedAt ?? null,
    coordNote: place.coordNote ?? null,
    file: row.file
  });`;

if (!source.includes(oldProjection)) {
  throw new Error('Fant ikke den reduserte familieindeks-projeksjonen i immutable batch-runner.');
}
source = source.replace(oldProjection, fullProjection);

fs.writeFileSync(tempPath, source);
try {
  await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempPath, { force: true });
}
