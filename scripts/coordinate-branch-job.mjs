import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const implementationBlob = 'ac0f3ae636701fcf8bb77a1cfb9f479943060b9d';
const response = await fetch(`https://api.github.com/repos/Paradispartiet/History-Go/git/blobs/${implementationBlob}`, {
  headers: {
    accept: 'application/vnd.github+json',
    'user-agent': 'History-Go coordinate runner/1.0',
  },
});
if (!response.ok) throw new Error(`Unable to fetch stored coordinate implementation: HTTP ${response.status}`);
const payload = await response.json();
if (payload.encoding !== 'base64' || typeof payload.content !== 'string') {
  throw new Error('Stored coordinate implementation was not returned as base64.');
}
const implementationPath = path.join(process.cwd(), 'scripts', '.coordinate-branch-job-implementation.mjs');
await fs.writeFile(implementationPath, Buffer.from(payload.content.replace(/\s/g, ''), 'base64'));
try {
  await import(`${pathToFileURL(implementationPath).href}?run=${Date.now()}`);
} finally {
  await fs.rm(implementationPath, { force: true });
}
