#!/usr/bin/env node
/**
 * Diagnostic only. Prints the smallest changed paths in the deterministic
 * Fagverk release; it never regenerates, overwrites, or relaxes release checks.
 */
import fs from 'node:fs';
import process from 'node:process';
import { buildReleaseManifest } from './build-fagverk-release-manifest.mjs';

const current = JSON.parse(fs.readFileSync('data/fagverk/fagverk_release.json', 'utf8'));
const rebuilt = buildReleaseManifest({ root: process.cwd() });
const changes = [];
function diff(left, right, path = 'release') {
  if (changes.length >= 35) return;
  if (Object.is(left, right)) return;
  if (left && right && typeof left === 'object' && typeof right === 'object') {
    if (Array.isArray(left) !== Array.isArray(right)) {
      changes.push({ path, currentType: Array.isArray(left) ? 'array' : 'object', rebuiltType: Array.isArray(right) ? 'array' : 'object' });
      return;
    }
    for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) diff(left[key], right[key], path + '.' + key);
    return;
  }
  const summarize = (value) => JSON.stringify(value)?.slice(0, 180) ?? 'undefined';
  changes.push({ path, current: summarize(left), rebuilt: summarize(right) });
}
diff(current, rebuilt);
console.error('FAGVERK_RELEASE_DRIFT_DIAGNOSTIC', JSON.stringify({
  current_sha256: current.release_sha256,
  expected_sha256: rebuilt.release_sha256,
  changed_count_shown: changes.length,
  changes
}, null, 2));
