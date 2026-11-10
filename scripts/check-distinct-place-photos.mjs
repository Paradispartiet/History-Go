#!/usr/bin/env node
/**
 * Forbid reusing the same source photograph as both image and frontImage.
 * A differently cropped WebP is NOT a different original photograph.
 *
 * --changed --base SHA --head SHA: enforce new/edited image pairs only.
 * --place PATH --require-both: Fotogalleriet v1 publication gate.
 * --all: diagnose the existing catalogue without changing it.
 */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = name => args.indexOf(name) < 0 ? '' : args[args.indexOf(name) + 1] || '';
const opts = new Set(args);
const important = ['image', 'frontImage', 'imageMeta', 'frontImageMeta', 'imageSourceUrl', 'frontImageSourceUrl'];

export const normalizedOrigin = value => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    url.hash = '';
    url.search = '';
    return decodeURIComponent(url.href).toLowerCase().replace(/\/+$/u, '');
  } catch {
    return raw.toLowerCase().replace(/\/+$/u, '');
  }
};

const isOriginalEditorialIllustration = meta =>
  meta?.mediaType === 'editorial_illustration'
  && meta?.source === 'history_go_original_editorial_illustration'
  && meta?.rightsBasis === 'original_editorial_vector_art_no_third_party_photo';

function originalIllustrationHash(name, imagePath, problems) {
  // An original, in-repository illustration is the source itself. It must not
  // pretend to be an externally licensed photograph or a renamed photo crop.
  if (!/^bilder\/illustrasjoner\/.+\.svg$/iu.test(imagePath)) {
    problems.push(name + ' must use a clearly identified local original SVG illustration');
    return '';
  }
  const full = path.resolve(root, imagePath);
  if (!full.startsWith(root + path.sep) || !fs.existsSync(full)) {
    problems.push(name + ' original illustration is missing from the repository');
    return '';
  }
  const bytes = fs.readFileSync(full);
  if (!bytes.toString('utf8').includes('ILLUSTRASJON')) {
    problems.push(name + ' original illustration lacks a visible illustration disclosure');
  }
  return createHash('sha256').update(bytes).digest('hex');
}

export function validateDistinctPhotoPair(place, { requireBoth = false } = {}) {
  const problems = [];
  const hero = String(place.image ?? '').trim();
  const front = String(place.frontImage ?? '').trim();
  if (!hero || !front) {
    if (requireBoth) problems.push('image and frontImage must both be supplied');
    return problems;
  }
  if (hero === front) problems.push('image and frontImage use the same asset path');
  const hm = place.imageMeta && typeof place.imageMeta === 'object' ? place.imageMeta : {};
  const fm = place.frontImageMeta && typeof place.frontImageMeta === 'object' ? place.frontImageMeta : {};
  const heroArt = isOriginalEditorialIllustration(hm);
  const frontArt = isOriginalEditorialIllustration(fm);
  const hashes = {};
  for (const [name, meta, illustrated, imagePath] of [
    ['image', hm, heroArt, hero],
    ['frontImage', fm, frontArt, front]
  ]) {
    if (illustrated) {
      hashes[name] = originalIllustrationHash(name, imagePath, problems);
      continue;
    }
    if (!/^[a-f0-9]{64}$/iu.test(String(meta.sourceSha256 ?? ''))) {
      problems.push(name + ' needs a SHA256 of its original source photograph');
    }
    if (!normalizedOrigin(meta.sourcePage || meta.originalUrl || place[name + 'SourceUrl'])) {
      problems.push(name + ' needs a documented original source URL');
    }
  }
  if (heroArt && frontArt && hashes.image && hashes.frontImage && hashes.image === hashes.frontImage) {
    problems.push('image and frontImage share the same original illustration bytes');
  }
  // Only photographic pairs need distinct external photo origins; artwork
  // can cite the same historical fact sources while being visually original.
  if (!heroArt && !frontArt) {
    for (const field of ['sourceSha256', 'sourcePage', 'originalUrl', 'originalId', 'sourceObjectId']) {
      const a = field === 'sourceSha256' ? String(hm[field] ?? '').toLowerCase() : normalizedOrigin(hm[field]);
      const b = field === 'sourceSha256' ? String(fm[field] ?? '').toLowerCase() : normalizedOrigin(fm[field]);
      if (a && b && a === b) problems.push('image and frontImage share the same original ' + field);
    }
    const heroUrl = normalizedOrigin(place.imageSourceUrl || hm.sourcePage || hm.originalUrl);
    const frontUrl = normalizedOrigin(place.frontImageSourceUrl || fm.sourcePage || fm.originalUrl);
    if (heroUrl && frontUrl && heroUrl === frontUrl) problems.push('image and frontImage have the same credited source URL');
  }
  return [...new Set(problems)];
}

const read = filename => JSON.parse(fs.readFileSync(path.resolve(root, filename), 'utf8'));
const changedSince = (base, head) => execFileSync('git', ['diff', '--name-only', base, head], {
  cwd: root, encoding: 'utf8'
}).split(/\r?\n/gu).map(s => s.trim()).filter(Boolean);
const readOld = (base, filename) => {
  try { return JSON.parse(execFileSync('git', ['show', base + ':' + filename], {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']})); }
  catch { return {}; }
};
export const photoFieldsChanged = (before = {}, after = {}) => important.some(key => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
export const placeRows = data => Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : [data];
const isCanonicalPlaceFile = p => /^data\/places\/(?!production\/|regler\/|workflow\/|places_index\.json|manifest\.json)/u.test(p) && p.endsWith('.json');

export function checkPaths(paths, { base = '', requireBoth = false, changedOnly = false } = {}) {
  const failures = [];
  let pairs = 0;
  let skipped = 0;
  for (const filename of new Set(paths.filter(isCanonicalPlaceFile))) {
    const abs = path.resolve(root, filename);
    if (!abs.startsWith(root + path.sep) || !fs.existsSync(abs)) continue;
    const records = placeRows(read(filename));
    const previous = base ? placeRows(readOld(base, filename)) : [];
    const priorById = new Map(previous.filter(p => p && typeof p === 'object' && p.id).map(p => [p.id, p]));
    for (const place of records) {
      if (!place || typeof place !== 'object') continue;
      const before = priorById.get(place.id) || {};
      // Compare each Place, not only top-level file keys: canonical files may contain arrays.
      if (changedOnly && !photoFieldsChanged(before, place)) { skipped++; continue; }
      if (place.image && place.frontImage) pairs++;
      const problems = validateDistinctPhotoPair(place, {requireBoth});
      failures.push(...problems.map(message => ({placeId:place.id || path.basename(filename, '.json'),file:filename,message})));
    }
  }
  return {failures,pairs,skipped};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const base = option('--base');
  const head = option('--head') || 'HEAD';
  const place = option('--place');
  let result;
  if (place) result = checkPaths([place], {requireBoth:opts.has('--require-both')});
  else if (opts.has('--changed')) {
    if (!base) throw new Error('--changed requires --base SHA');
    result = checkPaths(changedSince(base, head), {base,changedOnly:true});
  } else if (opts.has('--all')) {
    const manifest = read('data/places/places_index.json');
    result = checkPaths(manifest.map(row => row.sourceFile && 'data/' + row.sourceFile).filter(Boolean));
  } else throw new Error('Use --changed, --all, or --place PATH');
  for (const failure of result.failures) console.error(failure.placeId + ': ' + failure.message + ' (' + failure.file + ')');
  console.log('Photo-original distinctness: checked pairs=' + result.pairs + ', unchanged skipped=' + result.skipped + ', failures=' + result.failures.length);
  if (result.failures.length) process.exitCode = 1;
}
