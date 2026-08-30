const nativeFetch = globalThis.fetch;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let lastWikimediaFetchAt = 0;

function isWikimediaUpload(input) {
  const raw = typeof input === "string" ? input : input?.url || String(input);
  try {
    const url = new URL(raw);
    return url.hostname === "upload.wikimedia.org";
  } catch {
    return false;
  }
}

async function paceWikimedia() {
  const elapsed = Date.now() - lastWikimediaFetchAt;
  if (elapsed < 1500) await sleep(1500 - elapsed);
  lastWikimediaFetchAt = Date.now();
}

globalThis.fetch = async function rateLimitTolerantFetch(input, init) {
  const wikimedia = isWikimediaUpload(input);
  const maxAttempts = wikimedia ? 7 : 3;
  let response;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (wikimedia) await paceWikimedia();
    response = await nativeFetch(input, init);
    if (response.status !== 429 && response.status < 500) return response;
    if (attempt === maxAttempts) return response;

    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : Math.min(30000, 1500 * 2 ** (attempt - 1));
    await sleep(delay);
  }

  return response;
};
