const fs = require('fs');
const path = require('path');

const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

if (!/const SW_VERSION = "hg-sw-2026-08-26-v1\.3\.148";/.test(sw)) {
  throw new Error('service worker version was not bumped');
}

if (!/path\.includes\("\/data\/runtime\/place-open\/"\)[\s\S]*networkFirst\(req, CACHE_RUNTIME\)/.test(sw)) {
  throw new Error('place-open payloads must use bounded network-first freshness with cache fallback');
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
