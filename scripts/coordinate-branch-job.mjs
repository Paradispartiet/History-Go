import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const DATE = "2026-07-23";
const MAP_SHORT_URL = "https://goo.gl/maps/WUcYEBJxHtYutEHP7";
const CONTACT_URL = "https://rom.no/kontakt";
const METODE_CONTACT_URL = "https://metode.rom.no/contact";
const REPORT_DIR = "reports/visitoslo-galleries-audit-20260723/rom-anchor-research";
mkdirSync(REPORT_DIR, { recursive: true });

function writeJson(name, value) {
  writeFileSync(`${REPORT_DIR}/${name}`, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const rad = (value) => value * Math.PI / 180;
  const r = 6371000;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

function extractCoordinates(text) {
  const raw = String(text ?? "");
  let decoded = raw;
  try { decoded = decodeURIComponent(raw); } catch {}
  const patterns = [
    { kind: "url_at", regex: /@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/ },
    { kind: "google_data", regex: /!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/ },
    { kind: "query_ll", regex: /[?&](?:ll|center)=(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/ },
    { kind: "encoded_center", regex: /(?:center|query)=(-?\d{1,2}\.\d+)%2C(-?\d{1,3}\.\d+)/i }
  ];
  const found = [];
  for (const pattern of patterns) {
    const match = decoded.match(pattern.regex) ?? raw.match(pattern.regex);
    if (!match) continue;
    const lat = Number(match[1]);
    const lon = Number(match[2]);
    if (Number.isFinite(lat) && Number.isFinite(lon)) found.push({ kind: pattern.kind, lat, lon });
  }
  return [...new Map(found.map((row) => [`${row.lat},${row.lon}`, row])).values()];
}

const curl = spawnSync("curl", [
  "-A", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
  "-sSL",
  "--max-time", "45",
  "-o", `${REPORT_DIR}/google-map-final.html`,
  "-w", "%{url_effective}\n%{http_code}\n",
  MAP_SHORT_URL
], { encoding: "utf8" });
const curlLines = String(curl.stdout ?? "").trim().split("\n");
const curlFinalUrl = curlLines[0] ?? null;
const curlHttpCode = curlLines[1] ?? null;
const curlHtml = existsSync(`${REPORT_DIR}/google-map-final.html`) ? readFileSync(`${REPORT_DIR}/google-map-final.html`, "utf8") : "";

let browserResult = null;
let browserError = null;
try {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (firstError) {
    for (const executablePath of ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]) {
      if (!existsSync(executablePath)) continue;
      try { browser = await chromium.launch({ headless: true, executablePath }); break; } catch {}
    }
    if (!browser) {
      const install = spawnSync("npx", ["playwright", "install", "chromium"], { stdio: "inherit", encoding: "utf8" });
      if (install.status !== 0) throw firstError;
      browser = await chromium.launch({ headless: true });
    }
  }
  const context = await browser.newContext({ locale: "nb-NO" });
  const page = await context.newPage();
  const response = await page.goto(MAP_SHORT_URL, { waitUntil: "domcontentloaded", timeout: 90000 }).catch(() => null);
  await page.waitForTimeout(5000);
  const finalUrl = page.url();
  const title = await page.title().catch(() => "");
  const html = await page.content().catch(() => "");
  writeFileSync(`${REPORT_DIR}/google-map-browser.html`, html, "utf8");
  browserResult = { status: response?.status() ?? null, finalUrl, title, coordinates: extractCoordinates(`${finalUrl}\n${html}`) };
  await context.close();
  await browser.close();
} catch (error) {
  browserError = String(error);
}

const currentIndex = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
function findPlace(value, targetId, depth = 0) {
  if (depth > 6 || value == null) return null;
  if (Array.isArray(value)) {
    for (const item of value) { const found = findPlace(item, targetId, depth + 1); if (found) return found; }
    return null;
  }
  if (typeof value !== "object") return null;
  if (value.id === targetId) return value;
  for (const child of Object.values(value)) { const found = findPlace(child, targetId, depth + 1); if (found) return found; }
  return null;
}
const xray = findPlace(currentIndex, "xray_ungdomskulturhus");
const addressPoint = { lat: 59.92065765555904, lon: 10.751597362221323, sourceObjectId: "geonorge-adresser-v1:0301:14622:3" };

const candidates = [
  ...extractCoordinates(curlFinalUrl),
  ...extractCoordinates(curlHtml),
  ...(browserResult?.coordinates ?? [])
];
const uniqueCandidates = [...new Map(candidates.map((row) => [`${row.lat},${row.lon}`, row])).values()].map((row) => ({
  ...row,
  distanceToXrayMeters: xray ? Number(distanceMeters(row.lat, row.lon, xray.lat, xray.lon).toFixed(2)) : null,
  distanceToOrdinaryAddressMeters: Number(distanceMeters(row.lat, row.lon, addressPoint.lat, addressPoint.lon).toFixed(2))
}));

const distinctCandidates = uniqueCandidates.filter((row) => row.distanceToXrayMeters === null || row.distanceToXrayMeters > 3);
const summary = {
  version: DATE,
  purpose: "Resolve whether ROM's own official Find us at Google Maps link supplies a distinct source-defined display/entrance anchor for building O.",
  officialIdentityEvidence: {
    contactUrl: CONTACT_URL,
    finding: "ROM states that it is in Maridalsveien 3, building O, with an entrance from the Maridalsveien/Brenneriveien intersection and access through the property's Maridalsveien 3 driveway.",
    metodeContactUrl: METODE_CONTACT_URL,
    officialMapLink: MAP_SHORT_URL
  },
  curl: {
    exitStatus: curl.status,
    finalUrl: curlFinalUrl,
    httpCode: curlHttpCode,
    stderr: String(curl.stderr ?? "").slice(0, 4000),
    coordinates: extractCoordinates(`${curlFinalUrl}\n${curlHtml}`)
  },
  browser: browserResult,
  browserError,
  controls: {
    ordinaryAddressPoint: addressPoint,
    xrayCanonical: xray ? { id: xray.id, name: xray.name, lat: xray.lat, lon: xray.lon } : null,
    ordinaryAddressEqualsXrayWithinThreeMeters: xray ? distanceMeters(addressPoint.lat, addressPoint.lon, xray.lat, xray.lon) <= 3 : null
  },
  coordinateCandidates: uniqueCandidates,
  distinctCandidates,
  decision: distinctCandidates.length === 1
    ? "one_distinct_official_map_candidate_requires_manual_semantic_confirmation"
    : distinctCandidates.length > 1
      ? "multiple_official_map_candidates_requires_disambiguation"
      : "no_distinct_official_map_candidate_found"
};
writeJson("summary.json", summary);
writeFileSync(`${REPORT_DIR}/README.md`, `# ROM official-map anchor research\n\nDate: ${DATE}\n\nResearch-only pass. ROM's own contact information identifies building O and an entrance from the Maridalsveien/Brenneriveien intersection, while the ordinary Maridalsveien 3 address point is already the canonical X-Ray marker. This pass follows the ROM-owned Google Maps link published on the ROM/Metode contact page and checks whether it supplies a distinct source-defined coordinate.\n\n- curl final URL: ${curlFinalUrl ?? "n/a"}\n- browser final URL: ${browserResult?.finalUrl ?? "n/a"}\n- unique coordinate candidates: ${uniqueCandidates.length}\n- distinct candidates beyond 3 m from X-Ray: ${distinctCandidates.length}\n- decision: ${summary.decision}\n\nNo canonical place or coordinate data is changed by this pass.\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
