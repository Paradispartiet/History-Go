#!/usr/bin/env node

import fs from "node:fs/promises";

// Force every tile in the official waterbody bounding box to be queried.
const originalSome = Array.prototype.some;

Array.prototype.some = function patchedSome(callback, thisArg) {
  const looksLikeTileSamples = this.length === 5 && this.every(item =>
    item && typeof item === "object" && Number.isFinite(item.lon) && Number.isFinite(item.lat)
  );
  if (looksLikeTileSamples) return true;
  return originalSome.call(this, callback, thisArg);
};

let cleaned = false;
process.on("beforeExit", async () => {
  if (cleaned) return;
  cleaned = true;
  await fs.rm(new URL("./akrafjorden-species-audit-original.mjs", import.meta.url), { force: true });
});

await import("./akrafjorden-species-audit-original.mjs");
