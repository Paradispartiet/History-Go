#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (file) => path.join(ROOT, file);
const parts = fs.readdirSync(abs('scripts'))
  .filter((name) => /^tmp-unit12-source-payload-\d{2}\.txt$/.test(name))
  .sort();
if (!parts.length) throw new Error('Mangler payload-deler');
const encoded = parts.map((name) => fs.readFileSync(abs(`scripts/${name}`), 'utf8').trim()).join('');
const payload = JSON.parse(zlib.inflateSync(Buffer.from(encoded, 'base64')).toString('utf8'));

for (const [file, value] of Object.entries(payload.docs)) {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
}
for (const [file, content] of Object.entries(payload.textFiles)) {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), content);
}
for (const patch of payload.patches) {
  const current = fs.readFileSync(abs(patch.file), 'utf8');
  if (!current.includes(patch.before)) {
    if (current.includes(patch.after)) continue;
    throw new Error(`Patchanker mangler i ${patch.file}`);
  }
  const matches = current.split(patch.before).length - 1;
  if (matches !== 1) throw new Error(`Patchanker er ikke entydig i ${patch.file}: ${matches}`);
  fs.writeFileSync(abs(patch.file), current.replace(patch.before, patch.after));
}
console.log(`Materialiserte ${Object.keys(payload.docs).length} statiske enhet-12-filer, ${Object.keys(payload.textFiles).length} produksjonsfiler og ${payload.patches.length} monotone regresjonspatcher.`);
