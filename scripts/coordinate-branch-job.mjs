import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const encodedPath = path.join(root, 'scripts/.kilder-curation-builder.gz.b64');
const encoded = fs.readFileSync(encodedPath, 'utf8');
const source = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
const target = path.join('/tmp', 'kilder-curation-builder.mjs');
fs.writeFileSync(target, source);
fs.rmSync(encodedPath, { force: true });
await import(`file://${target}?v=${Date.now()}`);
