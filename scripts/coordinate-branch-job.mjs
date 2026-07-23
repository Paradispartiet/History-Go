import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const DATE = "2026-07-23";
const SOURCE_URL = "https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/attraksjoner/galleri/";
const SOURCE_PATH = new URL(SOURCE_URL).pathname;
const REPORT_DIR = `reports/visitoslo-galleries-audit-${DATE.replaceAll("-", "")}/api-source-discovery`;
mkdirSync(REPORT_DIR, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const uniq = (values) => [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))];

function writeJson(name, value) {
  writeFileSync(`${REPORT_DIR}/${name}`, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (firstError) {
    for (const executablePath of ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]) {
      if (!existsSync(executablePath)) continue;
      try {
        return await chromium.launch({ headless: true, executablePath });
      } catch {}
    }
    const install = spawnSync("npx", ["playwright", "install", "chromium"], { stdio: "inherit", encoding: "utf8" });
    if (install.status !== 0) throw new Error(`Playwright browser launch failed and chromium install failed: ${String(firstError)}`);
    return chromium.launch({ headless: true });
  }
}

async function dismissCookieBanner(page) {
  const attempts = [
    page.locator("#coi-banner-wrapper_accept"),
    page.getByRole("button", { name: /^(Godta alle|Tillat alle|Aksepter alle|Accept all|Allow all)$/i }),
    page.getByText(/^(Godta alle|Tillat alle|Aksepter alle|Accept all|Allow all)$/i)
  ];
  for (const locator of attempts) {
    const count = await locator.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index);
      if (!(await candidate.isVisible().catch(() => false))) continue;
      try {
        await candidate.click({ timeout: 5000 });
        await sleep(750);
        return { dismissed: true, method: "click", locatorIndex: index };
      } catch {}
    }
  }
  const overlayVisible = await page.locator("#cookie-information-template-wrapper").isVisible().catch(() => false);
  return { dismissed: !overlayVisible, method: overlayVisible ? "unresolved" : "not-present" };
}

async function browserFetchJson(page, url) {
  return page.evaluate(async (targetUrl) => {
    const response = await fetch(targetUrl, { credentials: "same-origin", headers: { Accept: "application/json" } });
    const text = await response.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { url: response.url, status: response.status, ok: response.ok, contentType: response.headers.get("content-type"), textPreview: text.slice(0, 1000), json };
  }, url);
}

function idsFromProducts(products) {
  return uniq(products.map((product) => product?.id)).map(String).sort();
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

const browser = await launchBrowser();
const context = await browser.newContext({
  locale: "nb-NO",
  userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
});
const page = await context.newPage();
const apiResponses = [];
page.on("response", (response) => {
  if (response.url().includes("/api/productlist/products")) apiResponses.push({ url: response.url(), status: response.status() });
});

let navigation;
try {
  const response = await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  navigation = { status: response?.status() ?? null, finalUrl: page.url(), title: await page.title() };
} catch (error) {
  navigation = { error: String(error), finalUrl: page.url() };
}
await sleep(6000);
await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
const cookie = await dismissCookieBanner(page);
await sleep(1000);

const candidates = apiResponses.map((row) => {
  const url = new URL(row.url);
  return { ...row, pageId: url.searchParams.get("pageId"), offset: url.searchParams.get("offset"), language: url.searchParams.get("language"), view: url.searchParams.get("view") };
});
const listCandidate = candidates.find((row) => row.pageId && row.language === "no" && !row.view) ?? candidates.find((row) => row.pageId && !row.view);
const mapCandidate = candidates.find((row) => row.pageId && row.view === "map");
const pageId = listCandidate?.pageId ?? mapCandidate?.pageId ?? null;
if (!pageId) {
  writeJson("api-candidates.json", { navigation, cookie, candidates });
  throw new Error("Could not discover a VisitOSLO product-list pageId from browser network traffic.");
}

const pageBase = new URL("/api/productlist/products", SOURCE_URL);
pageBase.searchParams.set("pageId", pageId);
pageBase.searchParams.set("language", "no");
const firstUrl = new URL(pageBase);
firstUrl.searchParams.set("offset", "0");
const first = await browserFetchJson(page, firstUrl.toString());
if (!first.ok || !first.json || !Array.isArray(first.json.products)) throw new Error(`First gallery API page failed: HTTP ${first.status}`);
const totalResults = Number(first.json.totalResults);
const pageSize = first.json.products.length;
if (!Number.isInteger(totalResults) || totalResults <= 0 || pageSize <= 0) throw new Error(`Unexpected pagination metadata: total=${totalResults}, pageSize=${pageSize}`);

const apiPages = [];
const pagedProducts = [];
for (let offset = 0; offset < totalResults; offset += pageSize) {
  const target = new URL(pageBase);
  target.searchParams.set("offset", String(offset));
  const result = offset === 0 ? first : await browserFetchJson(page, target.toString());
  if (!result.ok || !result.json || !Array.isArray(result.json.products)) throw new Error(`Gallery API page failed at offset ${offset}: HTTP ${result.status}`);
  apiPages.push({ url: target.toString(), status: result.status, totalResults: result.json.totalResults, offset: result.json.offset, productCount: result.json.products.length });
  pagedProducts.push(...result.json.products);
  writeJson(`gallery-api-offset-${String(offset).padStart(3, "0")}.json`, result.json);
}
const uniquePagedProducts = [...new Map(pagedProducts.map((product) => [String(product.id), product])).values()];
const pagedIds = idsFromProducts(uniquePagedProducts);

const mapUrl = new URL(pageBase);
mapUrl.searchParams.delete("offset");
mapUrl.searchParams.set("view", "map");
const mapResult = await browserFetchJson(page, mapUrl.toString());
if (!mapResult.ok || !mapResult.json || !Array.isArray(mapResult.json.products)) throw new Error(`Gallery map API failed: HTTP ${mapResult.status}`);
writeJson("gallery-api-map.json", mapResult.json);
const mapIds = idsFromProducts(mapResult.json.products);

async function readDomIds() {
  return page.evaluate((sourcePath) => [...new Set([...document.querySelectorAll("a[href]")].map((anchor) => {
    try {
      const url = new URL(anchor.href, location.href);
      return url.pathname === sourcePath && url.searchParams.has("tlp") ? url.searchParams.get("tlp") : null;
    } catch { return null; }
  }).filter(Boolean))], SOURCE_PATH);
}

const clickLog = [];
for (let attempt = 0; attempt < 10; attempt += 1) {
  const beforeIds = await readDomIds();
  const buttons = page.getByRole("button", { name: /^(Vis flere|Se flere|Load more)$/i });
  const count = await buttons.count().catch(() => 0);
  let button = null;
  for (let index = count - 1; index >= 0; index -= 1) {
    const candidate = buttons.nth(index);
    if (await candidate.isVisible().catch(() => false)) { button = candidate; break; }
  }
  if (!button) break;
  try {
    await button.click({ timeout: 8000 });
    await sleep(1800);
  } catch (error) {
    clickLog.push({ attempt: attempt + 1, before: beforeIds.length, error: String(error) });
    break;
  }
  const afterIds = await readDomIds();
  clickLog.push({ attempt: attempt + 1, before: beforeIds.length, after: afterIds.length });
  if (afterIds.length <= beforeIds.length || afterIds.length >= totalResults) break;
}

const dom = await page.evaluate((sourcePath) => {
  const anchors = [...document.querySelectorAll("a[href]")].map((anchor) => {
    try {
      const url = new URL(anchor.href, location.href);
      if (url.pathname !== sourcePath || !url.searchParams.has("tlp")) return null;
      return { tlp: url.searchParams.get("tlp"), href: url.href, text: (anchor.textContent ?? "").replace(/\s+/g, " ").trim() };
    } catch { return null; }
  }).filter(Boolean);
  const uniqueAnchors = [...new Map(anchors.map((row) => [row.tlp, row])).values()];
  const elementRows = [...document.querySelectorAll("main, section, div, ul")].map((element) => {
    const ids = [...element.querySelectorAll("a[href]")].map((anchor) => {
      try { const url = new URL(anchor.href, location.href); return url.pathname === sourcePath ? url.searchParams.get("tlp") : null; } catch { return null; }
    }).filter(Boolean);
    return { tag: element.tagName.toLowerCase(), id: element.id || null, className: typeof element.className === "string" ? element.className : null, count: new Set(ids).size, textLength: (element.textContent ?? "").length };
  });
  const maxCount = Math.max(0, ...elementRows.map((row) => row.count));
  const containerCandidates = elementRows.filter((row) => row.count === maxCount && row.count > 0).sort((a, b) => a.textLength - b.textLength).slice(0, 10);
  return { uniqueAnchors, containerCandidates, bodyText: (document.body?.innerText ?? "").slice(0, 250000), html: document.documentElement.outerHTML };
}, SOURCE_PATH);

writeFileSync(`${REPORT_DIR}/gallery-rendered.html`, dom.html, "utf8");
writeFileSync(`${REPORT_DIR}/gallery-visible-text.txt`, `${dom.bodyText}\n`, "utf8");
writeJson("gallery-dom-products.json", { products: dom.uniqueAnchors, clickLog, containerCandidates: dom.containerCandidates });
writeJson("api-candidates.json", { navigation, cookie, candidates, pageId });
writeJson("gallery-api-products.json", uniquePagedProducts);

const domIds = uniq(dom.uniqueAnchors.map((row) => row.tlp)).map(String).sort();
const checks = {
  navigationOk: navigation?.status === 200,
  cookieBannerHandled: cookie.dismissed === true,
  discoveredPageId: pageId,
  apiTotalResults: totalResults,
  paginatedUniqueCount: pagedIds.length,
  mapUniqueCount: mapIds.length,
  domUniqueCount: domIds.length,
  paginatedMatchesTotal: pagedIds.length === totalResults,
  mapMatchesTotal: mapIds.length === totalResults,
  paginatedMatchesMap: arraysEqual(pagedIds, mapIds),
  domMatchesApi: arraysEqual(domIds, pagedIds),
  everyApiProductUsesGalleryPath: uniquePagedProducts.every((product) => {
    if (!product?.url) return false;
    try { return new URL(product.url, SOURCE_URL).pathname === SOURCE_PATH; } catch { return false; }
  })
};
checks.completeAndReproducible = Boolean(checks.navigationOk && checks.paginatedMatchesTotal && checks.mapMatchesTotal && checks.paginatedMatchesMap && checks.domMatchesApi && checks.everyApiProductUsesGalleryPath);

const summary = {
  version: DATE,
  sourceUrl: SOURCE_URL,
  method: "VisitOSLO browser discovery plus exact product-list API pagination and cross-check",
  navigation,
  cookie,
  pageId,
  apiPages,
  clickLog,
  checks,
  productIds: pagedIds,
  products: uniquePagedProducts.map((product) => ({ id: product.id, name: product.name, url: product.url }))
};
writeJson("summary.json", summary);
writeFileSync(`${REPORT_DIR}/README.md`, `# VisitOSLO Galleries — exact API source discovery\n\nDate: ${DATE}\n\nResearch-only pass. It opens the official Galleries page, handles the cookie banner, discovers the live product-list pageId, fetches every paginated API page and the complete map view, expands the DOM through \`Vis flere\`, isolates only links on the Galleries pathname with a \`tlp\` id, and cross-checks all three result sets.\n\n- pageId: ${pageId}\n- API total: ${totalResults}\n- paginated unique products: ${pagedIds.length}\n- map unique products: ${mapIds.length}\n- expanded DOM unique products: ${domIds.length}\n- complete and reproducible: ${checks.completeAndReproducible}\n`, "utf8");

await context.close();
await browser.close();
if (!checks.completeAndReproducible) throw new Error(`VisitOSLO Galleries completeness proof failed: ${JSON.stringify(checks)}`);
console.log(JSON.stringify(summary, null, 2));
