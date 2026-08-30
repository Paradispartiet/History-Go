// Temporary production resolver; removed after successful Tullin materialization.
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const nativeFetch = globalThis.fetch;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let lastWikimediaFetchAt = 0;
let statsbyggLogoTarget = null;

const statsbyggPressUrl = "https://www.statsbygg.no/om-oss/for-pressen/";
const statsbyggSyntheticLogoUrl = "https://www.statsbygg.no/__historygo_statsbygg_official_logo.png";

function rawUrl(input) {
  return typeof input === "string" ? input : input?.url || String(input);
}

function isWikimediaUpload(input) {
  try {
    const url = new URL(rawUrl(input));
    return url.hostname === "upload.wikimedia.org";
  } catch {
    return false;
  }
}

function htmlText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&oslash;/gi, "ø")
    .replace(/&aring;/gi, "å")
    .replace(/&aelig;/gi, "æ")
    .replace(/&amp;/gi, "&")
    .replace(/&#248;/gi, "ø")
    .replace(/&#229;/gi, "å")
    .replace(/&#230;/gi, "æ")
    .replace(/\s+/g, " ")
    .trim();
}

function findOfficialStatsbyggLogo(html) {
  const source = String(html || "");
  const anchors = [...source.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  for (const match of anchors) {
    const attrs = match[1] || "";
    const label = htmlText(match[2]);
    if (!/frittstående logo, svart skrift/i.test(label)) continue;
    const href = attrs.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    return new URL(href, statsbyggPressUrl).href;
  }

  const candidates = [...source.matchAll(/(?:href|src)=["']([^"']+\.png(?:\?[^"']*)?)["']/gi)]
    .map(match => new URL(match[1], statsbyggPressUrl).href)
    .filter(url => {
      try {
        return new URL(url).hostname.endsWith("statsbygg.no");
      } catch {
        return false;
      }
    });
  return candidates.find(url => /statsbygg.*logo.*(?:svart|black)|(?:svart|black).*statsbygg.*logo|statsbygglogofrittst/i.test(url)) || null;
}

async function renderStatsbyggPressPage() {
  const commands = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"];
  let lastError = null;
  for (const command of commands) {
    try {
      const { stdout } = await execFileAsync(command, [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--virtual-time-budget=12000",
        "--dump-dom",
        statsbyggPressUrl
      ], { maxBuffer: 20 * 1024 * 1024, timeout: 45000 });
      if (stdout && /Statsbygg/i.test(stdout)) return stdout;
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Unable to render Statsbygg press page in headless browser: ${lastError?.message || "no browser command succeeded"}`);
}

async function paceWikimedia() {
  const elapsed = Date.now() - lastWikimediaFetchAt;
  if (elapsed < 1500) await sleep(1500 - elapsed);
  lastWikimediaFetchAt = Date.now();
}

async function retryingFetch(input, init) {
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
}

globalThis.fetch = async function rateLimitTolerantFetch(input, init) {
  const url = rawUrl(input);

  if (url === statsbyggSyntheticLogoUrl) {
    if (!statsbyggLogoTarget) {
      throw new Error("Statsbygg official black logo target was not resolved from the official press page");
    }
    return retryingFetch(statsbyggLogoTarget, init);
  }

  const response = await retryingFetch(input, init);
  if (url !== statsbyggPressUrl || !response.ok) return response;

  const rawHtml = await response.text();
  let sourceHtml = rawHtml;
  statsbyggLogoTarget = findOfficialStatsbyggLogo(rawHtml);

  if (!statsbyggLogoTarget) {
    sourceHtml = await renderStatsbyggPressPage();
    statsbyggLogoTarget = findOfficialStatsbyggLogo(sourceHtml);
  }

  if (!statsbyggLogoTarget) {
    throw new Error("Statsbygg official black logo download link not found in raw or rendered official press page");
  }

  const injected = `${sourceHtml}\n<img src="${statsbyggSyntheticLogoUrl}" alt="Statsbygg official logo resolver">\n`;
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};
