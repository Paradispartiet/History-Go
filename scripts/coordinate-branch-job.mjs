import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const original = execSync('git show HEAD^:scripts/coordinate-branch-job.mjs', { encoding: 'utf8' });
const needle = "  locatorType: 'site',\n  sourceProvider: 'osm',";
const replacement = "  locatorType: 'poi',\n  sourceProvider: 'osm',\n  geocodeAccuracy: 'geometric_center',";
if (!original.includes(needle)) throw new Error('Could not locate Bygdø Kongsgård locatorType block in parent job.');
const patched = original.replace(needle, replacement);
const tempPath = '/tmp/history-go-bygdoy-kongsgard-job-fixed.mjs';
fs.writeFileSync(tempPath, patched);
await import(`${pathToFileURL(tempPath).href}?v=${Date.now()}`);
