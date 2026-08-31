#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.cwd();
const parts = [0,1,2,3]
  .map((i) => fs.readFileSync(path.join(ROOT, `.github/tmp/sprak-field9-10-payload-${i}.b64`), 'utf8').trim())
  .join('');
const materialized = JSON.parse(zlib.gunzipSync(Buffer.from(parts, 'base64')).toString('utf8'));
for (const [relativePath, content] of Object.entries(materialized)) {
  const target = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}
console.log(`Materialized ${Object.keys(materialized).length} files.`);
