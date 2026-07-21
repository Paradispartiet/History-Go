#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const original = execFileSync('git', ['show', 'a541217cf4c67b3bf6cf855e6ca04b8685386dce:scripts/coordinate-branch-job.mjs'], {
  cwd: root,
  encoding: 'utf8'
});
const tempScript = path.join(root, 'tmp', 'oslo-contract-failure-resolution.mjs');
fs.mkdirSync(path.dirname(tempScript), { recursive: true });
fs.writeFileSync(tempScript, original);
await import(pathToFileURL(tempScript).href + '?run=' + Date.now());

const placeFile = path.join(root, 'data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_11.json');
const payload = JSON.parse(fs.readFileSync(placeFile, 'utf8'));
const place = payload.find((item) => item?.id === 'minneparken_gamlebyen');
if (!place) throw new Error('Mangler minneparken_gamlebyen');
if (!String(place.coordNote || '').includes('områdeanker')) {
  place.coordNote = String(place.coordNote || '').trim() + ' Punktet er et områdeanker og semantisk midtpunkt for den samlede, eksakt navngitte parkgeometrien.';
}
fs.writeFileSync(placeFile, JSON.stringify(payload, null, 2) + '\n');

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });

const runtime = JSON.parse(fs.readFileSync(path.join(root, 'data/places/places_index.json'), 'utf8'));
const current = runtime.find((item) => item?.id === 'minneparken_gamlebyen');
if (!current) throw new Error('Mangler Minneparken i runtime');

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}
for (const file of walk(path.join(root, 'data/coordinate-evidence'))) {
  let evidence;
  try { evidence = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
  if (evidence?.placeId !== 'minneparken_gamlebyen') continue;
  evidence.currentCoordinate = {
    lat: current.lat ?? null,
    lon: current.lon ?? null,
    r: current.r ?? null,
    coordStatus: current.coordStatus ?? '',
    coordSource: current.coordSource ?? '',
    coordType: current.coordType ?? '',
    coordNote: current.coordNote ?? ''
  };
  fs.writeFileSync(file, JSON.stringify(evidence, null, 2) + '\n');
}

fs.rmSync(tempScript, { force: true });
