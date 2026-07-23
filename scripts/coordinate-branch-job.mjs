import { mkdirSync, writeFileSync } from "node:fs";

const DATE = "2026-07-23";
const sourceUrl = "https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/attraksjoner/galleri/";
const reportDir = "reports/visitoslo-galleries-audit-20260723/source-discovery";
mkdirSync(reportDir, { recursive: true });

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value) {
  return decodeHtml(String(value ?? "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function snippets(text, regex, radius = 240, limit = 80) {
  const out = [];
  let match;
  const global = regex.global ? regex : new RegExp(regex.source, `${regex.flags}g`);
  while ((match = global.exec(text)) && out.length < limit) {
    const start = Math.max(0, match.index - radius);
    const end = Math.min(text.length, match.index + match[0].length + radius);
    out.push(text.slice(start, end).replace(/\s+/g, " "));
    if (match[0].length === 0) global.lastIndex += 1;
  }
  return uniq(out);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/json,text/javascript,*/*;q=0.8",
      "user-agent": "History-Go-VisitOSLO-source-audit/1.0"
    },
    redirect: "follow"
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, url: response.url, contentType: response.headers.get("content-type"), text };
}

const page = await fetchText(sourceUrl);
if (!page.ok) throw new Error(`VisitOSLO gallery page fetch failed: ${page.status}`);

writeFileSync(`${reportDir}/source-page.html`, page.text, "utf8");

const title = decodeHtml(page.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/\s+/g, " ").trim();
const scriptSrcs = uniq([...page.text.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi)].map((m) => new URL(decodeHtml(m[1]), page.url).href));
const anchorRows = [...page.text.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((m) => ({
  href: new URL(decodeHtml(m[1]), page.url).href,
  text: stripTags(m[2])
}));
const interestingAnchors = anchorRows.filter((row) => /product|attraksjon|galleri|kunst|museum|tlp=/i.test(`${row.href} ${row.text}`));

const absoluteUrls = uniq([...page.text.matchAll(/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+/g)].map((m) => m[0].replace(/\\\//g, "/")));
const quotedPaths = uniq([...page.text.matchAll(/["'](\/(?:[^"']{1,300}))["']/g)].map((m) => m[1]));
const interestingUrls = uniq([...absoluteUrls, ...quotedPaths.map((p) => new URL(p, page.url).href)]).filter((url) => /api|graphql|listing|listings|product|search|widget|filter|plugin|simpleview|data|query|tlp=/i.test(url));

const inlineScripts = [...page.text.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)].map((m, index) => ({
  index,
  attrs: m[1],
  length: m[2].length,
  text: m[2]
}));
const jsonScripts = inlineScripts.filter((script) => /application\/ld\+json|application\/json|__next_data__|json/i.test(script.attrs) || /^[\s\r\n]*[\[{]/.test(script.text));
const jsonScriptSummaries = jsonScripts.map((script) => ({
  index: script.index,
  attrs: script.attrs,
  length: script.length,
  preview: script.text.slice(0, 2000)
}));

const rawDiscovery = {
  version: DATE,
  sourceUrl,
  fetchedUrl: page.url,
  httpStatus: page.status,
  contentType: page.contentType,
  htmlBytes: Buffer.byteLength(page.text),
  title,
  scriptCount: scriptSrcs.length,
  scriptSrcs,
  anchorCount: anchorRows.length,
  interestingAnchors,
  interestingUrls,
  tlpContexts: snippets(page.text, /tlp/gi, 500, 120),
  productContexts: snippets(page.text, /product|listing|galleri|gallery/gi, 300, 160),
  jsonScriptSummaries
};
writeFileSync(`${reportDir}/page-discovery.json`, `${JSON.stringify(rawDiscovery, null, 2)}\n`, "utf8");

const bundleFindings = [];
for (const src of scriptSrcs.slice(0, 30)) {
  try {
    const response = await fetchText(src);
    if (!response.ok) {
      bundleFindings.push({ src, status: response.status, error: "fetch_failed" });
      continue;
    }
    const text = response.text;
    const matchedUrls = uniq([
      ...[...text.matchAll(/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+/g)].map((m) => m[0].replace(/\\\//g, "/")),
      ...[...text.matchAll(/["'`](\/(?:[^"'`]{1,260}))["'`]/g)].map((m) => new URL(m[1], src).href)
    ]).filter((url) => /api|graphql|listing|listings|product|search|widget|filter|plugin|simpleview|data|query/i.test(url));
    const keywordSnippets = snippets(text, /simpleview|listing|listings|product|graphql|api\/|search|filter|widget/gi, 300, 80);
    if (matchedUrls.length || keywordSnippets.length) {
      bundleFindings.push({
        src,
        status: response.status,
        bytes: Buffer.byteLength(text),
        matchedUrls: matchedUrls.slice(0, 150),
        keywordSnippets: keywordSnippets.slice(0, 80)
      });
    }
  } catch (error) {
    bundleFindings.push({ src, error: String(error) });
  }
}
writeFileSync(`${reportDir}/bundle-discovery.json`, `${JSON.stringify({ version: DATE, bundleFindings }, null, 2)}\n`, "utf8");

const candidateNames = uniq([
  ...anchorRows.map((row) => row.text),
  ...[...page.text.matchAll(/"(?:name|title|productName|listingName|headline)"\s*:\s*"([^"]{2,160})"/g)].map((m) => decodeHtml(m[1]))
]).filter((value) => value.length >= 2 && value.length <= 160 && !/^(les mer|nettsted|tripadvisor|kart|ruter|liste|filtrer|lukk|tilbake|resultater|gallerier|attraksjoner)$/i.test(value));
writeFileSync(`${reportDir}/candidate-name-inventory.json`, `${JSON.stringify({ version: DATE, candidateNames }, null, 2)}\n`, "utf8");

writeFileSync(`${reportDir}/README.md`, `# VisitOSLO Galleries — dynamic source discovery\n\nDate: ${DATE}\n\nSource: ${sourceUrl}\n\nThe normal parsed page does not expose the client-rendered result cards. This runner therefore stores the fetched HTML and inventories scripts, links, embedded JSON, product/listing contexts and likely dynamic-data endpoints without approving any gallery as a place.\n\n- HTML bytes: ${Buffer.byteLength(page.text)}\n- Script sources: ${scriptSrcs.length}\n- Anchors: ${anchorRows.length}\n- Interesting anchors: ${interestingAnchors.length}\n- Interesting endpoint-like URLs: ${interestingUrls.length}\n- Candidate text names extracted: ${candidateNames.length}\n- Script bundles with API/listing/product findings: ${bundleFindings.filter((row) => row.matchedUrls?.length || row.keywordSnippets?.length).length}\n\nNext step: inspect the saved discovery artifacts, identify the exact result-data endpoint or embedded payload, then capture one bounded current source snapshot before canonical coverage classification.\n`, "utf8");

console.log(`VisitOSLO gallery source discovery complete: html=${Buffer.byteLength(page.text)} bytes, scripts=${scriptSrcs.length}, interestingUrls=${interestingUrls.length}, candidateNames=${candidateNames.length}.`);
