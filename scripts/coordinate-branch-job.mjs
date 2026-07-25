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

const needle = 'quiz-production';
const positions = [];
let offset = 0;
while ((offset = source.indexOf(needle, offset)) !== -1) {
  positions.push(offset);
  offset += needle.length;
}
console.log(`Found ${positions.length} quiz-production marker(s)`);
for (const position of positions) {
  console.log('--- marker context ---');
  console.log(source.slice(Math.max(0, position - 300), Math.min(source.length, position + 500)));
}
throw new Error('Diagnostic marker extraction complete');
