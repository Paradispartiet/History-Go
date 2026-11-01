import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const doc = JSON.parse(read("data/natur/flora/illustration-quality-engknoppurt-20261101.json"));
const item = doc.items[0];
const id = "emne_flora_engknoppurt";
assert.equal(doc.schema, "history-go-flora-single-species-review-v1");
assert.equal(doc.items.length, 1);
assert.equal(doc.baselineApproved, 23);
assert.equal(doc.approvedCountAfterRelease, 24);
assert.equal(item.catalogId, id);
assert.equal(item.scientificName, "Centaurea jacea");
assert.equal(item.reviewStatus, "needs_redraw");
assert.equal(item.approvedForPublication, false);
assert(item.requiredRedraw.length >= 3);
assert(item.sourceReferences.length >= 2);
assert(item.observations.length > 100);
assert(item.limitations.length > 150);

const catalog = JSON.parse(read("data/natur/flora/blomster.json"));
const runtime = JSON.parse(read("data/runtime/nature-all/flora-001.json"))
  .flatMap(x => x.kind === "emne_pack" ? x.items : [x]);
assert.equal(catalog.find(x => x.id === id)?.latin, item.scientificName);
assert.equal(runtime.find(x => x.id === id)?.latin, item.scientificName);

const photos = {window: {}};
vm.runInNewContext(read("js/ui/nature-flora-photographs.js"), photos);
assert.equal(photos.window.HG_NATURE_FLORA_PHOTOS.get(id)?.scientificName, item.scientificName);

const approvedCtx = {window: {}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"), approvedCtx);
const approved = approvedCtx.window.HG_NATURE_FLORA_APPROVED;
assert.equal(approved.count, 23, "Prior 23 approvals must be preserved");
assert.equal(approved.has(id), false, "Botanically rejected candidate cannot become public");

const file = new URL(item.candidate, root);
if (fs.existsSync(file)) {
  const data = fs.readFileSync(file);
  assert.equal(data.length, item.sizeBytes);
  assert.equal(crypto.createHash("sha256").update(data).digest("hex"), item.sha256);
  const blob = crypto.createHash("sha1")
    .update(Buffer.concat([Buffer.from("blob " + data.length + "\0"), data]))
    .digest("hex");
  assert.equal(blob, item.gitBlobSha);
  assert.equal(data.toString("ascii", 0, 4), "RIFF");
  assert.equal(data.toString("ascii", 8, 12), "WEBP");
  assert.equal(data.toString("ascii", 12, 16), "VP8X");
  assert((data[20] & 0x10) !== 0, "WebP alpha channel missing");
  assert.deepEqual([1 + data.readUIntLE(24, 3), 1 + data.readUIntLE(27, 3)], item.dimensions);
} else {
  assert(item.publicationBlockedBy.includes("binary_not_uploaded"));
}
console.log("Engknoppurt v1: catalog, photo fallback and review gates valid; approval remains at 23.");
