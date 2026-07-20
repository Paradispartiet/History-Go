import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceRef = '56822e44870add1777ac461fa764b63c8366a7af';
const sourceUrl = `https://raw.githubusercontent.com/Paradispartiet/History-Go/${sourceRef}/scripts/coordinate-branch-job.mjs`;
const response = await fetch(sourceUrl, {
  headers: { 'User-Agent': 'HistoryGo-coordinate-runner/1.0' }
});
if (!response.ok) throw new Error(`Could not load original Vikaterrassen runner: ${response.status} ${response.statusText}`);
let source = await response.text();
const oldLocator = "locatorType: ['LineString', 'MultiLineString'].includes(osm.geojson.type) ? 'linear_area' : 'area',";
if (!source.includes(oldLocator)) throw new Error('Expected Vikaterrassen locatorType expression was not found in the original runner');
source = source.replace(oldLocator, "locatorType: 'linear_area',");

const tempFile = path.join(process.cwd(), '.tmp-vikaterrassen-coordinate-job.mjs');
fs.writeFileSync(tempFile, source);
try {
  await import(`${pathToFileURL(tempFile).href}?fixed=linear-area`);
} finally {
  fs.rmSync(tempFile, { force: true });
}
