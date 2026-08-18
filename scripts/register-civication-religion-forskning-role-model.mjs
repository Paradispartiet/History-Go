#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(ROOT, 'data/Civication/roleModels/manifest.json');
const roleModel = 'data/Civication/roleModels/religion/religion_forskning.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (!Array.isArray(manifest.files)) throw new Error('roleModels manifest files must be an array');
if (!fs.existsSync(path.join(ROOT, roleModel))) throw new Error(`Religion forskning role model missing: ${roleModel}`);
if (!manifest.files.includes(roleModel)) {
  manifest.files.push(roleModel);
  manifest.files.sort((a, b) => a.localeCompare(b));
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
const verified = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (!verified.files.includes(roleModel)) throw new Error('Religion forskning role model was not registered');
console.log('Religion forskning roleModels manifest registration: PASS');
