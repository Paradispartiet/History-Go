#!/usr/bin/env node
/**
 * Download authentic documented originals; render candidates only.
 * NEVER writes active brand identities, PlaceCard, or a publishable flag.
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const CANDIDATES = [
  {
    id: "cos",
    name: "COS",
    originalUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6e/COS_Logo.png",
    sourcePage: "https://commons.wikimedia.org/wiki/File:COS_Logo.png",
    expectedFormat: "png",
    expectedDimensions: [705, 249],
    expectedSha1: "dbe0fb23a547e177a2eb5045ac89da8221c1fd93",
    creator: "Wikimedia Commons contributor Ansonng17 (logo depicts COS)",
    rightsBasis: "CC BY-SA 4.0 per Commons file page; trademark identification rights reviewed separately",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    id: "rorbua",
    name: "Rorbua",
    originalUrl: "https://www.rorbua.as/resources/Rorbua-Logo.png",
    sourcePage: "https://www.rorbua.as/resources/",
    expectedFormat: "png",
    minSourceDimension: 350,
    creator: "Rorbua — official restaurant website",
    rightsBasis: "Authentic official restaurant brandmark; referential trademark identification only, pending visual and rights approval",
    licenseUrl: null
  },
  {
    id: "olivia",
    name: "Olivia",
    matteColor: "#242422",
    originalUrl: "https://oliviarestauranter.no/wp-content/uploads/2022/11/logo.svg",
    sourcePage: "https://oliviarestauranter.no/",
    expectedFormat: "svg",
    creator: "Olivia Restauranter",
    rightsBasis: "Original official Olivia logo; referential trademark identification, pending visual and legal review",
    licenseUrl: null
  },
  {
    id: "wiersholm",
    name: "Wiersholm",
    originalUrl: "https://wiersholm.no/content/uploads/2024/10/logo.svg",
    sourcePage: "https://wiersholm.no/",
    expectedFormat: "svg",
    creator: "Advokatfirmaet Wiersholm",
    rightsBasis: "Original official Wiersholm logo; referential trademark identification, pending visual and legal review",
    licenseUrl: null
  },
  {
    id: "wikborg_rein",
    name: "Wikborg Rein",
    originalUrl: "https://upload.wikimedia.org/wikipedia/commons/8/88/Wikborg_Rein_logo.svg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Wikborg_Rein_logo.svg",
    officialOriginal: "https://www.wr.no/frontend/public/v-637644564560000000/images/logo/dark.svg",
    expectedFormat: "svg",
    expectedDimensions: [261, 28],
    creator: "Wikborg Rein",
    rightsBasis: "Wikimedia Commons PD-textlogo assertion; trademark identification rights reviewed separately",
    licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-textlogo"
  }
];
const sourceDir = "bilder/kort/brands/source/aker_brygge";
const outputDir = "bilder/kort/brands/candidates/aker_brygge";
const reportPath = "reports/place-production/aker-brygge-brand-logo-binary-candidates.json";
const sha = (algorithm, bytes) => crypto.createHash(algorithm).update(bytes).digest("hex");
function assert(condition, message) { if (!condition) throw new Error(message); }
async function fetchOriginal(url) {
  const origin = new URL(url);
  assert(origin.protocol === "https:" && ["upload.wikimedia.org", "www.rorbua.as", "oliviarestauranter.no", "wiersholm.no"].includes(origin.hostname), "Unapproved origin: " + url);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(35000),
    headers: {
      "User-Agent": "HistoryGo-BrandAudit/1.0 (https://github.com/Paradispartiet/History-Go)",
      Accept: "image/png,image/svg+xml"
    }
  });
  assert(response.ok, "Source GET returned HTTP " + response.status + " for " + url);
  assert(["upload.wikimedia.org", "www.rorbua.as", "oliviarestauranter.no", "wiersholm.no"].includes(new URL(response.url).hostname), "Unexpected redirect origin");
  const sizeHeader = Number(response.headers.get("content-length") || 0);
  assert(!sizeHeader || sizeHeader <= 2500000, "Oversized source");
  const bytes = Buffer.from(await response.arrayBuffer());
  assert(bytes.length > 300 && bytes.length <= 2500000, "Unexpected source file size");
  return bytes;
}
async function run() {
  assert(process.argv.includes("--write"), "Run with --write; no implicit download or upload");
  const registered = JSON.parse(await fs.readFile("data/brands/brands_by_place.json", "utf8")).aker_brygge;
  assert(Array.isArray(registered) && registered.length === 9, "Unexpected Aker Brygge canonical brands");
  for (const entry of CANDIDATES) assert(registered.includes(entry.id), "Unregistered brand: " + entry.id);
  await fs.mkdir(sourceDir, {recursive: true});
  await fs.mkdir(outputDir, {recursive: true});
  const results = [];
  for (const entry of CANDIDATES) {
    const source = await fetchOriginal(entry.originalUrl);
    if (entry.expectedFormat === "png") {
      assert(source.subarray(0,8).equals(Buffer.from("89504e470d0a1a0a", "hex")), "Not an authentic PNG");
    } else {
      const svg = source.toString("utf8");
      assert(/<svg[\s>]/i.test(svg), "Not an SVG");
      assert(!/<script[\s>]|<foreignObject[\s>]|onload\s*=|href\s*=\s*["']https?:/i.test(svg), "SVG contains disallowed active/external content");
    }
    if (entry.expectedSha1) assert(sha("sha1", source) === entry.expectedSha1, "Original SHA1 changed: " + entry.id);
    const meta = await sharp(source, {limitInputPixels: 32000000}).metadata();
    assert(meta.format === entry.expectedFormat, "Wrong original format for " + entry.id);
    if (entry.expectedDimensions) assert(meta.width === entry.expectedDimensions[0] && meta.height === entry.expectedDimensions[1], "Original dimensions changed for " + entry.id);
    if (entry.minSourceDimension) assert(meta.width >= entry.minSourceDimension && meta.height >= entry.minSourceDimension, "Source resolution too low for " + entry.id);
    const sourcePath = path.join(sourceDir, entry.id + "_original." + entry.expectedFormat);
    const assetPath = path.join(outputDir, entry.id + ".webp");
    const matteColor = entry.matteColor ?? "#ffffff";
    const webp = await sharp(source, {limitInputPixels: 32000000})
      .resize(860, 480, {fit: "contain", background: matteColor, kernel: "lanczos3"})
      .flatten({background: matteColor})
      .extend({top: 20, bottom: 20, left: 20, right: 20, background: matteColor})
      .webp({quality: 93, effort: 5})
      .toBuffer();
    const outMeta = await sharp(webp).metadata();
    assert(outMeta.width === 900 && outMeta.height === 520 && outMeta.format === "webp", "Export dimensions mismatch");
    await fs.writeFile(sourcePath, source);
    await fs.writeFile(assetPath, webp);
    results.push({
      brandId: entry.id, name: entry.name,
      sourcePage: entry.sourcePage, sourceAsset: entry.originalUrl,
      officialOriginal: entry.officialOriginal ?? null,
      creator: entry.creator, rightsBasis: entry.rightsBasis,
      licenseUrl: entry.licenseUrl, originalPath: sourcePath,
      originalSha1: sha("sha1", source), originalSha256: sha("sha256", source),
      sourceDimensions: [meta.width, meta.height], originalBytes: source.length,
      candidatePath: assetPath, candidateSha256: sha("sha256", webp),
      outputDimensions: [outMeta.width, outMeta.height], outputBytes: webp.length,
      transformation: "Render exact original to 900x520 WebP on source-appropriate solid matte (" + matteColor + "), fit contain, no crop or redraw",
      matteColor,
      assetKind: "logo", sourceVerified: true, visualApproval: false,
      publishable: false, reviewStatus: "ORIGINAL_BINARY_CAPTURED_PENDING_REVIEW",
      usageContext: "referential_identification", noEndorsement: true
    });
    console.log("Candidate: " + entry.id + ", original SHA-256 " + sha("sha256", source) + ", WebP SHA-256 " + sha("sha256", webp));
  }
  const report = {
    schema: "history_go_aker_brygge_brand_logo_candidates_v1",
    placeId: "aker_brygge",
    phase: "binary_candidates_only",
    allBrandsRequired: 9, sourceFilesCaptured: results.length,
    productionAssetsActivated: 0, placecardBrandsEnabled: false,
    candidates: results,
    note: "No logo activated and no vFerdig claimed. Source provenance must be reviewed and all nine authentic logos approved before publication."
  };
  await fs.mkdir(path.dirname(reportPath), {recursive: true});
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
}
run().catch(e => { console.error(e); process.exitCode = 1; });
