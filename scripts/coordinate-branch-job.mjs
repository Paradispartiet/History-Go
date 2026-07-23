#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const sourceCommit = '6eac893c9dd0516f5ed77adcd2b8fd01d5b40db0';
const scriptPath = 'scripts/coordinate-branch-job.mjs';
let source = execFileSync('git', ['show', `${sourceCommit}:${scriptPath}`], {
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024,
});

const oldFunction = `function removeNearbyTarget(place, context) {
  const nearby = place?.nature_profile?.nearby_place_ids;
  if (!Array.isArray(nearby) || !nearby.includes(targetId)) {
    throw new Error(\`${'${context}'} no longer contains expected nearby reference ${'${targetId}'}\`);
  }
  place.nature_profile.nearby_place_ids = nearby.filter((id) => id !== targetId);
}`;

const newFunction = `function removeNearbyTarget(place, context, required = false) {
  const nearby = place?.nature_profile?.nearby_place_ids;
  if (!Array.isArray(nearby) || !nearby.includes(targetId)) {
    if (required) throw new Error(\`${'${context}'} no longer contains expected nearby reference ${'${targetId}'}\`);
    return false;
  }
  place.nature_profile.nearby_place_ids = nearby.filter((id) => id !== targetId);
  return true;
}`;

source = source.replace(oldFunction, newFunction);
source = source.replace('removeNearbyTarget(child, ref.child);', 'removeNearbyTarget(child, ref.child, true);');
if (!source.includes('required = false') || !source.includes('removeNearbyTarget(child, ref.child, true);')) {
  throw new Error('Could not patch batch 166 idempotent aggregate cleanup');
}

const tempScript = path.join('/tmp', `history-go-batch-166-targeted-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);
