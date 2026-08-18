#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'data/Civication/roleModels/manifest.json');
const MODEL = 'data/Civication/roleModels/religion/religion_forskning.json';

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
if (!Array.isArray(manifest.files)) throw new Error('roleModels manifest has no files array');
if (!manifest.files.includes(MODEL)) manifest.files.push(MODEL);
manifest.files = [...new Set(manifest.files)].sort((a, b) => a.localeCompare(b, 'en'));
fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Registered ${MODEL} in roleModels manifest.`);
