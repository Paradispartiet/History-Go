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
        await sleep(750);
        return { dismissed: true, method: "click", locatorIndex: index };
      } catch {}
    }
  }
  const overlayVisible = await page.locator("#cookie-information-template-wrapper").isVisible().catch(() => false);
  return { dismissed: !overlayVisible, method: overlayVisible ? "unresolved" : "not-present" };
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

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
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
const apiCaptureTasks = [];

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
  apiCaptureTasks.push(task);
});

async function settleApiCaptures() {
  let observed = -1;
  while (observed !== apiCaptureTasks.length) {
    observed = apiCaptureTasks.length;
    await Promise.allSettled([...apiCaptureTasks]);
    await sleep(200);
  }
}

async function readDomIds() {
  return page.evaluate((sourcePath) => [...new Set([...document.querySelectorAll("a[href]")].map((anchor) => {
    try {
      const url = new URL(anchor.href, location.href);
      return url.pathname === sourcePath && url.searchParams.has("tlp") ? url.searchParams.get("tlp") : null;
    } catch {
      return null;
    }
  }).filter(Boolean))], SOURCE_PATH);
}

async function clickGalleryLoadMore() {
  return page.evaluate((sourcePath) => {
    const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    const candidates = [...document.querySelectorAll("button")]
      .map((button, index) => {
        const text = normalize(button.textContent);
        if (!/^(Vis flere|Se flere|Load more)$/i.test(text)) return null;
        const style = getComputedStyle(button);
        const rect = button.getBoundingClientRect();
        if (style.display === "none" || style.visibility === "hidden" || rect.width <= 0 || rect.height <= 0) return null;
        let node = button.parentElement;
        let score = 0;
        for (let depth = 0; node && depth < 6; depth += 1, node = node.parentElement) {
          const ids = [...node.querySelectorAll("a[href]")].map((anchor) => {
            try {
              const url = new URL(anchor.href, location.href);
              return url.pathname === sourcePath ? url.searchParams.get("tlp") : null;
            } catch {
              return null;
            }
          }).filter(Boolean);
          score = Math.max(score, new Set(ids).size);
        }
        return { button, index, text, score };
      })
      .filter(Boolean)
      .sort((left, right) => right.score - left.score || right.index - left.index);

    const chosen = candidates[0];
    if (!chosen) return { found: false };
    chosen.button.click();
    return {
      found: true,
      text: chosen.text,
      score: chosen.score,
      candidateCount: candidates.length,
      disabled: chosen.button.disabled,
      ariaDisabled: chosen.button.getAttribute("aria-disabled")
    };
  }, SOURCE_PATH);
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
await settleApiCaptures();
const cookie = await dismissCookieBanner(page);
await sleep(800);
await settleApiCaptures();

const initialMapRows = apiResponses.filter((row) => {
  const meta = apiMeta(row);
  return meta.status === 200 && meta.view === "map" && Array.isArray(row.json?.products) && row.json.products.length > 0;
});
const galleryMapRow = initialMapRows.find((row) => row.json.products.every(productUsesGalleryPath)) ?? null;
if (!galleryMapRow) {
  writeJson("api-candidates.json", { navigation, cookie, responses: apiResponses.map(apiMeta) });
  throw new Error("Could not identify an exact Galleries map API response from live browser traffic.");
}

const galleryMapMeta = apiMeta(galleryMapRow);
const pageId = galleryMapMeta.pageId;
const totalResults = Number(galleryMapRow.json.totalResults);
if (!pageId || !Number.isInteger(totalResults) || totalResults <= 0) {
  throw new Error(`Unexpected Galleries map metadata: pageId=${pageId}, totalResults=${totalResults}`);
}

const clickLog = [];
for (let attempt = 0; attempt < 10; attempt += 1) {
  const beforeIds = await readDomIds();
  if (beforeIds.length >= totalResults) break;
  const clickResult = await clickGalleryLoadMore();
  if (!clickResult.found) {
    clickLog.push({ attempt: attempt + 1, before: beforeIds.length, ...clickResult });
    break;
  }

  let afterIds = beforeIds;
  for (let poll = 0; poll < 12; poll += 1) {
    await sleep(500);
    await settleApiCaptures();
    afterIds = await readDomIds();
    if (afterIds.length > beforeIds.length) break;
  }

  clickLog.push({ attempt: attempt + 1, before: beforeIds.length, after: afterIds.length, ...clickResult });
  if (afterIds.length <= beforeIds.length) break;
}

await settleApiCaptures();

const exactRows = apiResponses.filter((row) => {
  const meta = apiMeta(row);
  return meta.status === 200 && meta.pageId === pageId && Array.isArray(row.json?.products);
});
const dedupedExactRows = [...new Map(exactRows.map((row) => [row.url, row])).values()];
const mapRows = dedupedExactRows.filter((row) => apiMeta(row).view === "map");
const listRows = dedupedExactRows
  .filter((row) => !apiMeta(row).view)
  .sort((left, right) => Number(apiMeta(left).offset ?? left.json?.offset ?? 0) - Number(apiMeta(right).offset ?? right.json?.offset ?? 0));

const mapRow = mapRows.find((row) => row.json.products.every(productUsesGalleryPath)) ?? galleryMapRow;
const mapProducts = mapRow.json.products;
const mapIds = idsFromProducts(mapProducts);
const pagedProducts = listRows.flatMap((row) => row.json.products);
const uniquePagedProducts = [...new Map(pagedProducts.map((product) => [String(product.id), product])).values()];
const pagedIds = idsFromProducts(uniquePagedProducts);

writeJson("gallery-api-map.json", mapRow.json);
for (const row of listRows) {
  const offset = Number(apiMeta(row).offset ?? row.json?.offset ?? 0);
  writeJson(`gallery-api-offset-${String(offset).padStart(3, "0")}.json`, row.json);
}
writeJson("api-candidates.json", { navigation, cookie, pageId, responses: apiResponses.map(apiMeta) });
writeJson("gallery-api-products.json", uniquePagedProducts);

const dom = await page.evaluate((sourcePath) => {
  const anchors = [...document.querySelectorAll("a[href]")].map((anchor) => {
    try {
      const url = new URL(anchor.href, location.href);
      if (url.pathname !== sourcePath || !url.searchParams.has("tlp")) return null;
      return { tlp: url.searchParams.get("tlp"), href: url.href, text: (anchor.textContent ?? "").replace(/\s+/g, " ").trim() };
    } catch {
      return null;
    }
  }).filter(Boolean);
  const uniqueAnchors = [...new Map(anchors.map((row) => [row.tlp, row])).values()];
  const elementRows = [...document.querySelectorAll("main, section, div, ul")].map((element) => {
    const ids = [...element.querySelectorAll("a[href]")].map((anchor) => {
      try {
        const url = new URL(anchor.href, location.href);
        return url.pathname === sourcePath ? url.searchParams.get("tlp") : null;
      } catch {
        return null;
      }
    }).filter(Boolean);
    return {
      tag: element.tagName.toLowerCase(),
      id: element.id || null,
      className: typeof element.className === "string" ? element.className : null,
      count: new Set(ids).size,
      textLength: (element.textContent ?? "").length
    };
  });
  const maxCount = Math.max(0, ...elementRows.map((row) => row.count));
  const containerCandidates = elementRows
    .filter((row) => row.count === maxCount && row.count > 0)
    .sort((a, b) => a.textLength - b.textLength)
    .slice(0, 10);
  return {
    uniqueAnchors,
    containerCandidates,
    bodyText: (document.body?.innerText ?? "").slice(0, 250000),
    html: document.documentElement.outerHTML
  };
}, SOURCE_PATH);

writeFileSync(`${REPORT_DIR}/gallery-rendered.html`, dom.html, "utf8");
writeFileSync(`${REPORT_DIR}/gallery-visible-text.txt`, `${dom.bodyText}\n`, "utf8");
writeJson("gallery-dom-products.json", { products: dom.uniqueAnchors, clickLog, containerCandidates: dom.containerCandidates });

const domIds = uniq(dom.uniqueAnchors.map((row) => row.tlp)).map(String).sort();
const listOffsets = listRows.map((row) => Number(apiMeta(row).offset ?? row.json?.offset ?? 0));
const checks = {
  navigationOk: navigation?.status === 200,
  cookieBannerHandled: cookie.dismissed === true,
  discoveredPageId: pageId,
  apiTotalResults: totalResults,
  capturedListOffsets: listOffsets,
  paginatedUniqueCount: pagedIds.length,
  mapUniqueCount: mapIds.length,
  domUniqueCount: domIds.length,
  paginatedMatchesTotal: pagedIds.length === totalResults,
  mapMatchesTotal: mapIds.length === totalResults,
  paginatedMatchesMap: arraysEqual(pagedIds, mapIds),
  domMatchesApi: arraysEqual(domIds, mapIds),
  everyApiProductUsesGalleryPath: mapProducts.every(productUsesGalleryPath) && uniquePagedProducts.every(productUsesGalleryPath)
};
checks.completeAndReproducible = Boolean(
  checks.navigationOk &&
  checks.cookieBannerHandled &&
  checks.paginatedMatchesTotal &&
  checks.mapMatchesTotal &&
  checks.paginatedMatchesMap &&
  checks.domMatchesApi &&
  checks.everyApiProductUsesGalleryPath
);

const summary = {
  version: DATE,
  sourceUrl: SOURCE_URL,
  method: "Capture VisitOSLO's own live product-list responses, expand the gallery DOM, and cross-check exact id sets",
  navigation,
  cookie,
  pageId,
  clickLog,
  apiPages: listRows.map(apiMeta),
  mapApi: apiMeta(mapRow),
  checks,
  productIds: mapIds,
  products: mapProducts.map((product) => ({ id: product.id, name: product.name, url: product.url }))
};
writeJson("summary.json", summary);
writeFileSync(
  `${REPORT_DIR}/README.md`,
  `# VisitOSLO Galleries — exact API source discovery\n\nDate: ${DATE}\n\nResearch-only pass. It captures the exact product-list responses requested by the official Galleries page, explicitly handles the cookie banner, expands the page through \`Vis flere\`, isolates only Galleries-path TLP links, and compares the paginated list responses, the complete map response and the final DOM.\n\n- pageId: ${pageId}\n- API total: ${totalResults}\n- captured list offsets: ${listOffsets.join(", ")}\n- paginated unique products: ${pagedIds.length}\n- map unique products: ${mapIds.length}\n- expanded DOM unique products: ${domIds.length}\n- complete and reproducible: ${checks.completeAndReproducible}\n`,
  "utf8"
);

console.log(JSON.stringify(summary, null, 2));
await context.close();
await browser.close();
if (!checks.completeAndReproducible) throw new Error(`VisitOSLO Galleries completeness proof failed: ${JSON.stringify(checks)}`);
