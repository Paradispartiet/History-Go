#!/usr/bin/env node

import fs from "node:fs/promises";

const originalUrl = new URL("./akrafjorden-species-audit-original.mjs", import.meta.url);
const patchedUrl = new URL("./akrafjorden-species-audit-patched.mjs", import.meta.url);

let source = await fs.readFile(originalUrl, "utf8");

source = source.replace(
  /const intersectsBySample = \[center, \.\.\.corners\]\.some\(p => pointInGeometry\(\[p\.lon, p\.lat\], bbox\.polygons\)\);/,
  "const intersectsBySample = true;"
);

source = source.replace(
  /function pointInPolygon\(point, polygon\) \{[\s\S]*?\n\}\n\nfunction pointInGeometry/,
  `function pointInPolygon(point, polygon) {
  if (!Array.isArray(polygon) || !polygon.length) return false;
  let containingRings = 0;
  for (const ring of polygon) {
    if (pointInRing(point, ring)) containingRings += 1;
  }
  return containingRings % 2 === 1;
}

function pointInGeometry`
);

if (!source.includes("containingRings % 2 === 1")) {
  throw new Error("Klarte ikke å patche polygonfilteret");
}

await fs.writeFile(patchedUrl, source, "utf8");

let cleaned = false;
process.on("beforeExit", async () => {
  if (cleaned) return;
  cleaned = true;
  await Promise.all([
    fs.rm(originalUrl, { force: true }),
    fs.rm(patchedUrl, { force: true })
  ]);
});

await import("./akrafjorden-species-audit-patched.mjs");
