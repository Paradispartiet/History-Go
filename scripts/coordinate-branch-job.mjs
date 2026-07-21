#!/usr/bin/env node

import fs from "node:fs/promises";

const batch2TestUrl = new URL("../tests/etne-akrafjorden-marine-species-batch-2.test.js", import.meta.url);
const originalJobUrl = new URL("./akrafjorden-marine-batch-3-original.mjs", import.meta.url);

let test = await fs.readFile(batch2TestUrl, "utf8");
test = test.replace(
  'assert.equal(place.published_species_batch, 2);',
  'assert.ok(place.published_species_batch >= 2);'
);

if (!test.includes('assert.ok(place.published_species_batch >= 2);')) {
  throw new Error("Klarte ikke å gjøre batch 2-versjonskontrollen fremoverkompatibel");
}

await fs.writeFile(batch2TestUrl, test, "utf8");

let cleaned = false;
process.on("beforeExit", async () => {
  if (cleaned) return;
  cleaned = true;
  await fs.rm(originalJobUrl, { force: true });
});

await import("./akrafjorden-marine-batch-3-original.mjs");
