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
let implementation = Buffer.from(payload.content.replace(/\s/g, ''), 'base64').toString('utf8');
const originalFetchJson = "const fetchJson = async (url) => JSON.parse(await fetchText(url, 'application/json'));";
const resilientFetchJson = `const fetchJson = async (url) => {
  const urls = url.includes('overpass-api.de/api/interpreter')
    ? [
      url,
      url.replace('https://overpass-api.de', 'https://overpass.kumi.systems'),
    ]
    : [url];
  let lastError = null;
  for (const candidateUrl of urls) {
    const attempts = urls.length > 1 ? 3 : 1;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return JSON.parse(await fetchText(candidateUrl, 'application/json'));
      } catch (error) {
        lastError = error;
        if (attempt + 1 < attempts) {
          await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
        }
      }
    }
  }
  throw lastError;
};`;
if (!implementation.includes(originalFetchJson)) {
  throw new Error('Unable to patch stored implementation with resilient JSON fetching.');
}
implementation = implementation
  .replace(originalFetchJson, resilientFetchJson)
  .replace('[out:json][timeout:30]', '[out:json][timeout:60]');
const implementationPath = path.join(process.cwd(), 'scripts', '.coordinate-branch-job-implementation.mjs');
await fs.writeFile(implementationPath, implementation, 'utf8');
try {
  await import(`${pathToFileURL(implementationPath).href}?run=${Date.now()}`);
} finally {
  await fs.rm(implementationPath, { force: true });
}
