import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const tempPath = path.resolve('scripts/.politikk-control-fixed-job.mjs');
const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/5cf6ad9fe76131a40db1f8682ec5b7cec132e4f4/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Kunne ikke hente immutable politikk-runner: ${response.status} ${response.statusText}`);
let source = await response.text();
source = source.replaceAll("coordRole: 'structure_anchor'", "coordRole: 'building_center'");
source = source.replace(
  "geocodeAccuracy: ['Polygon','MultiPolygon'].includes(candidate.geojson?.type) ? 'geometric_center' : 'semantic_anchor',",
  "geocodeAccuracy: ['Polygon','MultiPolygon'].includes(candidate.geojson?.type) ? 'geometric_center' : definition.locatorType === 'building' ? 'building' : 'semantic_anchor',"
);
if (!source.includes("coordRole: 'building_center'")) throw new Error('Byggrolle-rettingen ble ikke anvendt.');
if (!source.includes("definition.locatorType === 'building' ? 'building'")) throw new Error('Byggnøyaktighets-rettingen ble ikke anvendt.');
fs.writeFileSync(tempPath, source);
try {
  await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempPath, { force: true });
}
