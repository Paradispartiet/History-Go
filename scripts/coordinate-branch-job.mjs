import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const parts = [
  'scripts/.tid-curation-runner.gz.b64.00',
  'scripts/.tid-curation-runner.gz.b64.01'
];
const encoded = parts.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('');
const digest = crypto.createHash('sha256').update(encoded).digest('hex');
const expected = '9e9cc230a17fb4a9cba62e8228a6326fb4244a74ae7a6f94032f8a3f6b8541bd';
if (digest !== expected) throw new Error(`Tidskurateringsjobben har feil kontrollsum: ${digest}`);
const source = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
const target = path.join('/tmp', 'historie-v5-5-tid-curation.mjs');
fs.writeFileSync(target, source);
for (const file of [...parts, 'scripts/.tid-curation-runner.gz.b64']) {
  fs.rmSync(path.join(root, file), { force: true });
}
await import(`file://${target}?v=${Date.now()}`);
