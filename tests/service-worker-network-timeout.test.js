const fs = require('fs');
const path = require('path');

const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

if (!/const SW_VERSION = "hg-sw-2026-07-28-v1\.3\.145";/.test(sw)) {
  throw new Error('service worker version was not bumped');
}

if (!/function fetchWithTimeout\(req, timeoutMs = 4500\)/.test(sw)) {
  throw new Error('fetchWithTimeout helper is missing');
}

if (!/new AbortController\(\)/.test(sw) || !/controller\.abort\(\)/.test(sw)) {
  throw new Error('network timeout must abort the hanging fetch');
}

if (!/const res = await fetchWithTimeout\(req\);/.test(sw)) {
  throw new Error('networkFirst must use the bounded fetch helper');
}

if (!/const cached = await cache\.match\(req\);[\s\S]*if \(cached\) return cached;/.test(sw)) {
  throw new Error('networkFirst must retain cache fallback after timeout/failure');
}

console.log('service worker network timeout contract ok');
