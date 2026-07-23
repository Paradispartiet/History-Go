import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const DATE = "2026-07-23";
const sourceUrl = "https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/attraksjoner/galleri/";
const parentUrl = "https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/attraksjoner/";
const reportDir = `reports/visitoslo-galleries-audit-${DATE.replaceAll("-", "")}/browser-source-discovery`;
mkdirSync(reportDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const uniq = (values) => [...new Set(values.filter(Boolean))];
const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

function writeJson(name, value) {
  writeFileSync(`${reportDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (firstError) {
    const candidates = ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"];
    for (const executablePath of candidates) {
      if (!existsSync(executablePath)) continue;
      try {
        return await chromium.launch({ headless: true, executablePath });
      } catch {
        // Try the next installed browser.
      }
    }

    const install = spawnSync("npx", ["playwright", "install", "chromium"], {
      stdio: "inherit",
      encoding: "utf8"
    });
    if (install.status !== 0) {
      throw new Error(`Playwright browser launch failed and chromium install failed: ${String(firstError)}`);
    }
    return chromium.launch({ headless: true });
  }
}

function interestingNetworkUrl(url) {
  return /tellus|granicus|api|search|listing|listings|product|products|filter|query|graphql/i.test(url);
}

function summarizeJson(value, depth = 0) {
  if (depth > 4) return "[depth-limit]";
  if (Array.isArray(value)) {
    return {
      type: "array",
      length: value.length,
      sample: value.slice(0, 5).map((item) => summarizeJson(item, depth + 1))
    };
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    return {
      type: "object",
      keys: keys.slice(0, 80),
      sample: Object.fromEntries(keys.slice(0, 20).map((key) => [key, summarizeJson(value[key], depth + 1)]))
    };
  }
  if (typeof value === "string") return value.slice(0, 500);
  return value;
}

async function auditPage(browser, url, label) {
  const context = await browser.newContext({
    locale: "nb-NO",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();
  const network = [];

  page.on("response", async (response) => {
    const responseUrl = response.url();
    const contentType = response.headers()["content-type"] ?? "";
    if (!interestingNetworkUrl(responseUrl) && !/application\/json/i.test(contentType)) return;

    const row = {
      url: responseUrl,
      status: response.status(),
      contentType,
      requestMethod: response.request().method(),
      requestPostData: response.request().postData()?.slice(0, 5000) ?? null
    };

    try {
      const text = await response.text();
      row.bytes = Buffer.byteLength(text);
      if (/json/i.test(contentType) || /^[\s\r\n]*[\[{]/.test(text)) {
        try {
          row.jsonSummary = summarizeJson(JSON.parse(text));
        } catch {
          row.preview = text.slice(0, 8000);
        }
      } else {
        row.preview = text.slice(0, 8000);
      }
    } catch (error) {
      row.readError = String(error);
    }
    network.push(row);
  });

  let navigation = null;
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    navigation = {
      status: response?.status() ?? null,
      finalUrl: page.url(),
      title: await page.title()
    };
  } catch (error) {
    navigation = { error: String(error), finalUrl: page.url() };
  }

  await sleep(8000);
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});

  const clickLog = [];
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const button = page.getByText(/^(Vis flere|Se flere|Load more)$/i).last();
    const visible = await button.isVisible().catch(() => false);
    if (!visible) break;
    try {
      const before = await page.locator('a[href*="tlp="], a[href*="/produkt/"]').count();
      await button.click({ timeout: 5000 });
      await sleep(1800);
      const after = await page.locator('a[href*="tlp="], a[href*="/produkt/"]').count();
      clickLog.push({ attempt: attempt + 1, before, after });
      if (after <= before) break;
    } catch (error) {
      clickLog.push({ attempt: attempt + 1, error: String(error) });
      break;
    }
  }

  const rendered = await page.evaluate(() => {
    const anchors = [...document.querySelectorAll("a[href]")].map((anchor) => ({
      href: anchor.href,
      text: (anchor.textContent ?? "").replace(/\s+/g, " ").trim(),
      ariaLabel: anchor.getAttribute("aria-label"),
      title: anchor.getAttribute("title")
    }));

    const productAnchors = anchors.filter((row) => row.href.includes("tlp=") || row.href.includes("/produkt/"));
    const productRows = productAnchors.map((row) => {
      const anchor = [...document.querySelectorAll("a[href]")].find((node) => node.href === row.href && (node.textContent ?? "").replace(/\s+/g, " ").trim() === row.text);
      let node = anchor;
      let bestText = row.text;
      for (let depth = 0; node && depth < 7; depth += 1, node = node.parentElement) {
        const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
        if (text.length >= bestText.length && text.length <= 1800) bestText = text;
      }
      return { ...row, contextText: bestText };
    });

    return {
      title: document.title,
      bodyText: (document.body?.innerText ?? "").slice(0, 250000),
      html: document.documentElement.outerHTML,
      productRows,
      performanceUrls: performance.getEntriesByType("resource").map((entry) => entry.name)
    };
  });

  const productRows = [];
  const seen = new Set();
  for (const row of rendered.productRows) {
    const key = `${row.href}\n${row.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    productRows.push({
      href: row.href,
      text: clean(row.text),
      ariaLabel: clean(row.ariaLabel),
      title: clean(row.title),
      contextText: clean(row.contextText)
    });
  }

  writeFileSync(`${reportDir}/${label}-rendered.html`, rendered.html, "utf8");
  writeFileSync(`${reportDir}/${label}-visible-text.txt`, `${rendered.bodyText}\n`, "utf8");
  writeJson(`${label}-product-links.json`, { url, navigation, clickLog, productRows });
  writeJson(`${label}-network.json`, { url, navigation, network });
  writeJson(`${label}-resource-urls.json`, {
    url,
    navigation,
    urls: uniq(rendered.performanceUrls).filter((entry) => interestingNetworkUrl(entry))
  });

  await context.close();
  return {
    label,
    url,
    navigation,
    clickLog,
    productCount: productRows.length,
    networkCount: network.length,
    interestingResourceCount: uniq(rendered.performanceUrls).filter((entry) => interestingNetworkUrl(entry)).length,
    productRows
  };
}

const browser = await launchBrowser();
let gallery;
let parent;
try {
  gallery = await auditPage(browser, sourceUrl, "gallery");
  parent = await auditPage(browser, parentUrl, "attractions-parent");
} finally {
  await browser.close();
}

const galleryTlpIds = uniq(gallery.productRows.map((row) => new URL(row.href).searchParams.get("tlp")));
const summary = {
  version: DATE,
  sourceUrl,
  parentUrl,
  method: "Playwright rendered-page and network discovery",
  gallery: {
    navigation: gallery.navigation,
    productCount: gallery.productCount,
    tlpIds: galleryTlpIds,
    networkCount: gallery.networkCount,
    interestingResourceCount: gallery.interestingResourceCount
  },
  parent: {
    navigation: parent.navigation,
    productCount: parent.productCount,
    networkCount: parent.networkCount,
    interestingResourceCount: parent.interestingResourceCount
  }
};
writeJson("summary.json", summary);

writeFileSync(`${reportDir}/README.md`, `# VisitOSLO Galleries — browser source discovery\n\nDate: ${DATE}\n\nThis is a research-only attempt to resolve the full client-rendered VisitOSLO Galleries source after raw Node fetches were blocked with HTTP 403. It creates no canonical place decisions.\n\nMethod:\n- load the official Galleries page in headless Chromium through Playwright\n- allow the page's own client-side JavaScript to run\n- capture rendered product/TellUs links\n- capture network responses and request payloads whose URLs or content types indicate search/listing/product/API data\n- click visible \`Vis flere\` / \`Se flere\` / \`Load more\` controls repeatedly while result counts increase\n- run the same capture on the parent attractions page as a control\n\nResult summary:\n- gallery navigation status: ${gallery.navigation?.status ?? "n/a"}\n- rendered gallery product links: ${gallery.productCount}\n- unique gallery TLP ids: ${galleryTlpIds.length}\n- captured gallery API/search-like responses: ${gallery.networkCount}\n- parent-page product links: ${parent.productCount}\n\nThe durable next step is to inspect \`gallery-network.json\` and \`gallery-product-links.json\`. A full category scope may only be claimed if the rendered result set or an exact official TellUs response is complete and reproducible.\n`, "utf8");

console.log(JSON.stringify(summary, null, 2));
