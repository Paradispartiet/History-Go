import crypto from 'node:crypto';

const realFetch = globalThis.fetch;
const cache = new Map();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function directCommonsUrl(input) {
  const url = new URL(String(input));
  if (url.hostname !== 'commons.wikimedia.org' || !url.pathname.includes('/wiki/Special:Redirect/file/')) return null;
  const filename = decodeURIComponent(url.pathname.split('/').pop());
  const digest = crypto.createHash('md5').update(filename, 'utf8').digest('hex');
  return `https://upload.wikimedia.org/wikipedia/commons/${digest[0]}/${digest.slice(0, 2)}/${encodeURIComponent(filename)}`;
}

globalThis.fetch = async (input, init) => {
  const direct = directCommonsUrl(input);
  if (!direct) return realFetch(input, init);
  if (cache.has(direct)) {
    const cached = cache.get(direct);
    return new Response(cached.body.slice(0), { status: cached.status, headers: cached.headers });
  }
  await sleep(350);
  const response = await realFetch(direct, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      'user-agent': 'History-Go-place-production/1.0 (source-first image materialization)'
    }
  });
  if (!response.ok) return response;
  const body = await response.arrayBuffer();
  const cached = { body, status: response.status, headers: [...response.headers.entries()] };
  cache.set(direct, cached);
  return new Response(body.slice(0), { status: cached.status, headers: cached.headers });
};
