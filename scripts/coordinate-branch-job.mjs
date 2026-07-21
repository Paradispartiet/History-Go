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
  /function pointOnSegment\(point, a, b, epsilon = 1e-10\) \{[\s\S]*?\n\}\n\nfunction pointInRing/,
  `function pointOnSegment(point, a, b, epsilon = 1e-10) {
  const [x, y] = point;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared <= epsilon * epsilon) {
    return Math.abs(x - x1) <= epsilon && Math.abs(y - y1) <= epsilon;
  }

  const cross = (x - x1) * dy - (y - y1) * dx;
  if (Math.abs(cross) > epsilon) return false;
  const dot = (x - x1) * dx + (y - y1) * dy;
  if (dot < -epsilon) return false;
  return dot <= lengthSquared + epsilon;
}

function pointInRing`
);

if (!source.includes("lengthSquared <= epsilon * epsilon")) {
  throw new Error("Klarte ikke å patche nullsegmenttesten");
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
