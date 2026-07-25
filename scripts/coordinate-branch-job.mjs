import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const parts = [
  'scripts/.phase8-builder.gz.b64.00',
  'scripts/.phase8-builder.gz.b64.01'
];
const encoded = parts.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('');
const source = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
const target = path.join('/tmp', 'history-phase8-builder.mjs');
fs.writeFileSync(target, source);
for (const file of parts) fs.rmSync(path.join(root, file));
await import(`file://${target}?v=${Date.now()}`);
