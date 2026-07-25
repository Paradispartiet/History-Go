import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const parts = [
  'scripts/.medieval-builder.gz.b64.02',
  'scripts/.medieval-builder.gz.b64.03'
];
const cleanupFiles = [
  'scripts/.medieval-builder.gz.b64.00',
  'scripts/.medieval-builder.gz.b64.01',
  ...parts
];
const encoded = parts.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('');
const source = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
const target = path.join('/tmp', 'history-medieval-v5-5-builder.mjs');
fs.writeFileSync(target, source);
for (const file of cleanupFiles) fs.rmSync(path.join(root, file), { force: true });
await import(`file://${target}?v=${Date.now()}`);
