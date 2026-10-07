#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const DEFAULT_REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function placeSourceHash(place) {
  const payload = {
    name: normalizeText(place?.name),
    desc: normalizeText(place?.desc),
    popupDesc: normalizeText(place?.popupDesc || place?.popupdesc),
  };
  return crypto.createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex')
    .slice(0, 16);
}

function rows(document) {
  if (Array.isArray(document)) return document;
  if (Array.isArray(document?.places)) return document.places;
  if (document && typeof document === 'object' && String(document.id || '').trim()) return [document];
  return [];
}

export function findCanonicalPlace(placeId, repoRoot = DEFAULT_REPO_ROOT) {
  const manifestPath = path.join(repoRoot, 'data', 'places', 'manifest.json');
  const manifest = readJson(manifestPath);
  if (!Array.isArray(manifest?.files)) {
    throw new Error('data/places/manifest.json must contain files[]');
  }

  const matches = [];
  for (const manifestEntry of manifest.files) {
    const relative = String(manifestEntry || '').trim();
    if (!relative) continue;
    const file = path.join(repoRoot, 'data', relative);
    if (!fs.existsSync(file)) throw new Error(`Place manifest points to missing file: data/${relative}`);
    const document = readJson(file);
    for (const place of rows(document)) {
      if (String(place?.id || '').trim() === placeId && place.hidden !== true && place.stub !== true) {
        matches.push({ place, sourceFile: `data/${relative}` });
      }
    }
  }

  if (matches.length !== 1) {
    throw new Error(`Expected exactly one canonical Place for ${placeId}; found ${matches.length}`);
  }
  return matches[0];
}

export function checkPlaceTranslationFreshness(placeId, repoRoot = DEFAULT_REPO_ROOT) {
  const { place, sourceFile } = findCanonicalPlace(placeId, repoRoot);
  const expectedHash = placeSourceHash(place);
  const dir = path.join(repoRoot, 'data', 'i18n', 'content', 'places');
  if (!fs.existsSync(dir)) return { placeId, sourceFile, expectedHash, checked: [], errors: [] };

  const checked = [];
  const errors = [];
  for (const name of fs.readdirSync(dir).filter((value) => value.endsWith('.json')).sort()) {
    const file = path.join(dir, name);
    const translations = readJson(file);
    const entry = translations?.[placeId];
    if (!entry || typeof entry !== 'object') continue;

    const lang = name.slice(0, -5);
    const actualHash = String(entry._sourceHash || '').trim();
    checked.push(lang);
    if (!actualHash) {
      errors.push(`${lang}: ${placeId} is missing _sourceHash`);
    } else if (actualHash !== expectedHash) {
      errors.push(`${lang}: ${placeId} is stale (translation ${actualHash}, source ${expectedHash})`);
    }
  }

  return { placeId, sourceFile, expectedHash, checked, errors };
}

function main() {
  const [placeId] = process.argv.slice(2);
  if (!placeId) {
    console.error('Usage: node scripts/check-place-i18n-freshness.mjs <place_id>');
    process.exit(2);
  }

  const result = checkPlaceTranslationFreshness(placeId);
  if (result.errors.length) {
    console.error(`Place i18n freshness failed for ${placeId} (${result.sourceFile})`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }

  const langs = result.checked.length ? result.checked.join(', ') : 'none';
  console.log(`Place i18n freshness OK: ${placeId}; existing translations checked: ${langs}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
