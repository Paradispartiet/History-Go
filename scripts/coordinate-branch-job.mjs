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
    if (install.status !== 0) {
      throw new Error(`Playwright browser launch failed and chromium install failed: ${String(firstError)}`);
    }
    return chromium.launch({ headless: true });
  }
}

async function dismissCookieBanner(page) {
  const attempts = [
    page.locator("#coi-banner-wrapper_accept"),
    page.locator("button.coi-banner__accept"),
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
        await sleep(500);
        return { dismissed: true, method: "click", locatorIndex: index };
      } catch {}
    }
  }
  const visible = await page.locator("#cookie-information-template-wrapper").isVisible().catch(() => false);
  return { dismissed: !visible, method: visible ? "unresolved" : "not-present" };
}

function productUsesGalleryPath(product) {
  if (!product?.url) return false;
  try {
    return new URL(product.url, SOURCE_URL).pathname === SOURCE_PATH;
  } catch {
    return false;
  }
}

function idsFromProducts(products) {
  return uniq(products.map((product) => product?.id)).map(String).sort();
}

function isSubset(subset, superset) {
  const allowed = new Set(superset);
  return subset.every((value) => allowed.has(value));
}

function apiMeta(row) {
  const url = new URL(row.url);
  return {
    url: row.url,
    status: row.status,
    pageId: url.searchParams.get("pageId"),
    offset: url.searchParams.get("offset"),
    language: url.searchParams.get("language"),
    view: url.searchParams.get("view"),
    totalResults: row.json?.totalResults ?? null,
    productCount: Array.isArray(row.json?.products) ? row.json.products.length : null,
    readError: row.readError ?? null
  };
}

const browser = await launchBrowser();
const context = await browser.newContext({
  locale: "nb-NO",
  userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
});
const page = await context.newPage();
const apiResponses = [];
const captureTasks = [];

page.on("response", (response) => {
  if (!response.url().includes("/api/productlist/products")) return;
  const task = (async () => {
    const row = { url: response.url(), status: response.status(), json: null, readError: null };
    try {
      row.json = await response.json();
    } catch (error) {
      row.readError = String(error);
    }
    apiResponses.push(row);
  })();
  captureTasks.push(task);
});

async function settleCaptures() {
  let observed = -1;
  while (observed !== captureTasks.length) {
    observed = captureTasks.length;
    await Promise.allSettled([...captureTasks]);
    await sleep(200);
  }
}

let navigation;
try {
  const response = await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  navigation = { status: response?.status() ?? null, finalUrl: page.url(), title: await page.title() };
} catch (error) {
  navigation = { error: String(error), finalUrl: page.url() };
}

await sleep(6000);
await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
await settleCaptures();
const cookie = await dismissCookieBanner(page);
await sleep(800);
await settleCaptures();

const exactRows = apiResponses.filter((row) => row.status === 200 && Array.isArray(row.json?.products));
const mapCandidates = exactRows.filter((row) => apiMeta(row).view === "map");
const mapRow = mapCandidates.find((row) => {
  const meta = apiMeta(row);
  return meta.pageId && row.json.products.length > 0 && row.json.products.every(productUsesGalleryPath);
}) ?? null;

if (!mapRow) {
  writeJson("api-candidates.json", { navigation, cookie, responses: apiResponses.map(apiMeta) });
  throw new Error("Could not identify the exact VisitOSLO Galleries map response from live browser traffic.");
}

const mapMeta = apiMeta(mapRow);
const pageId = mapMeta.pageId;
const totalResults = Number(mapRow.json.totalResults);
const mapProducts = mapRow.json.products;
const mapIds = idsFromProducts(mapProducts);
if (!pageId || !Number.isInteger(totalResults) || totalResults <= 0) {
  throw new Error(`Unexpected Galleries map metadata: pageId=${pageId}, totalResults=${totalResults}`);
}

const listRows = exactRows
  .filter((row) => {
    const meta = apiMeta(row);
    return meta.pageId === pageId && !meta.view;
  })
  .sort((left, right) => Number(apiMeta(left).offset ?? 0) - Number(apiMeta(right).offset ?? 0));
const initialListRow = listRows.find((row) => Number(apiMeta(row).offset ?? row.json?.offset ?? 0) === 0) ?? listRows[0] ?? null;
const initialListProducts = initialListRow?.json?.products ?? [];
const initialListIds = idsFromProducts(initialListProducts);

const dom = await page.evaluate((sourcePath) => {
  const anchors = [...document.querySelectorAll("a[href]")].map((anchor) => {
    try {
      const url = new URL(anchor.href, location.href);
      if (url.pathname !== sourcePath || !url.searchParams.has("tlp")) return null;
      return {
        tlp: url.searchParams.get("tlp"),
        href: url.href,
        text: (anchor.textContent ?? "").replace(/\s+/g, " ").trim()
      };
    } catch {
      return null;
    }
  }).filter(Boolean);
  const uniqueAnchors = [...new Map(anchors.map((row) => [row.tlp, row])).values()];
  return {
    uniqueAnchors,
    bodyText: (document.body?.innerText ?? "").slice(0, 250000),
    html: document.documentElement.outerHTML
  };
}, SOURCE_PATH);
const domIds = uniq(dom.uniqueAnchors.map((row) => row.tlp)).map(String).sort();

writeJson("gallery-api-map.json", mapRow.json);
if (initialListRow) writeJson("gallery-api-list-initial.json", initialListRow.json);
writeJson("api-candidates.json", { navigation, cookie, pageId, responses: apiResponses.map(apiMeta) });
writeJson("gallery-dom-products.json", { products: dom.uniqueAnchors });
writeFileSync(`${REPORT_DIR}/gallery-rendered.html`, dom.html, "utf8");
writeFileSync(`${REPORT_DIR}/gallery-visible-text.txt`, `${dom.bodyText}\n`, "utf8");

const sourceSnapshot = {
  capturedAt: new Date().toISOString(),
  sourceUrl: SOURCE_URL,
  sourceApiUrl: mapRow.url,
  pageId,
  totalResults,
  products: mapProducts.map((product) => ({
    id: product.id,
    name: product.name,
    url: product.url,
    address: product.address ?? null,
    place: product.place ?? null,
    geoLocation: product.geoLocation ?? null,
    primaryCategory: product.primaryCategory ?? null,
    productType: product.productType ?? null
  }))
};
writeJson("gallery-source-snapshot.json", sourceSnapshot);

const checks = {
  navigationOk: navigation?.status === 200,
  cookieBannerHandled: cookie.dismissed === true,
  discoveredPageId: pageId,
  apiTotalResults: totalResults,
  mapProductCount: mapProducts.length,
  mapUniqueCount: mapIds.length,
  initialListCount: initialListIds.length,
  domUniqueCount: domIds.length,
  mapCountMatchesTotal: mapProducts.length === totalResults,
  mapUniqueMatchesTotal: mapIds.length === totalResults,
  everyMapProductUsesGalleryPath: mapProducts.every(productUsesGalleryPath),
  initialListPresent: initialListIds.length > 0,
  initialListSubsetOfMap: isSubset(initialListIds, mapIds),
  domPresent: domIds.length > 0,
  domSubsetOfMap: isSubset(domIds, mapIds)
};
checks.completeAndReproducible = Boolean(
  checks.navigationOk &&
  checks.cookieBannerHandled &&
  checks.mapCountMatchesTotal &&
  checks.mapUniqueMatchesTotal &&
  checks.everyMapProductUsesGalleryPath &&
  checks.initialListPresent &&
  checks.initialListSubsetOfMap &&
  checks.domPresent &&
  checks.domSubsetOfMap
);

const summary = {
  version: DATE,
  sourceUrl: SOURCE_URL,
  method: "Capture VisitOSLO's own complete map-view product-list response and validate list/DOM subsets against it",
  navigation,
  cookie,
  pageId,
  mapApi: mapMeta,
  initialListApi: initialListRow ? apiMeta(initialListRow) : null,
  checks,
  productIds: mapIds,
  products: sourceSnapshot.products.map((product) => ({ id: product.id, name: product.name, url: product.url }))
};
writeJson("summary.json", summary);
writeFileSync(
  `${REPORT_DIR}/README.md`,
  `# VisitOSLO Galleries — exact source discovery\n\nDate: ${DATE}\n\nResearch-only pass. The official Galleries page itself requests a complete \`view=map\` product-list response for the same live pageId used by its list view. That response is used as the authoritative full category set; the initial list response and rendered Galleries-path DOM links are validated as subsets of the same ID set.\n\n- pageId: ${pageId}\n- API total: ${totalResults}\n- map products: ${mapProducts.length}\n- map unique products: ${mapIds.length}\n- initial list products: ${initialListIds.length}\n- rendered DOM products: ${domIds.length}\n- complete and reproducible: ${checks.completeAndReproducible}\n`,
  "utf8"
);

await context.close();
await browser.close();
if (!checks.completeAndReproducible) {
  throw new Error(`VisitOSLO Galleries completeness proof failed: ${JSON.stringify(checks)}`);
}
console.log(JSON.stringify(summary, null, 2));
