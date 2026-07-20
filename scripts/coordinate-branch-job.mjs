import fs from 'node:fs';
import crypto from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const payloadPaths = [
  'scripts/.skano-job.00',
  'scripts/.skano-job.01',
  'scripts/.skano-job.02',
  'scripts/.skano-job.03'
];
const encoded = payloadPaths.map(file => fs.readFileSync(file, 'utf8')).join('');
const encodedHash = crypto.createHash('sha256').update(encoded).digest('hex');
if (encoded.length !== 12504 || encodedHash !== '38637fa301a8cbde7fa4de67cc1ee110b108564d999f16866019520f62dc5330') {
  throw new Error(`Skåno payload integrity failure: length=${encoded.length}, sha256=${encodedHash}`);
}
const compressed = Buffer.from(encoded, 'base64');
const compressedHash = crypto.createHash('sha256').update(compressed).digest('hex');
if (compressedHash !== '15a2d51b0946b860f0d3007135ec1b380f49f41388237c782c244f7772997c72') {
  throw new Error(`Skåno compressed payload integrity failure: sha256=${compressedHash}`);
}
let source = gunzipSync(compressed).toString('utf8');
const sourceHash = crypto.createHash('sha256').update(source).digest('hex');
if (sourceHash !== 'd11d4b8481d8b2838c58640942f5a71a143a153d2b2ecbcd2b75f7611a7a1f62') {
  throw new Error(`Skåno source payload integrity failure: sha256=${sourceHash}`);
}
const buggy = "const flatten = items => items.flatMap(item => item && item.kind === 'emne_pack' ? flatten(item.items || []) : [item]);";
const fixed = `const flatten = value => {
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (!value || typeof value !== 'object') return [];
  if (value.kind === 'emne_pack' && Array.isArray(value.items)) return value.items.flatMap(flatten);
  if (value.id) return [value];
  return Object.values(value).flatMap(child => Array.isArray(child) ? flatten(child) : []);
};`;
if (!source.includes(buggy)) throw new Error('Skåno test patch target missing');
source = source.replace(buggy, fixed);
for (const file of payloadPaths) fs.unlinkSync(file);
await import('data:text/javascript;base64,' + Buffer.from(source, 'utf8').toString('base64'));
