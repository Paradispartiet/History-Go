import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const doc = JSON.parse(read("data/natur/flora/illustration-quality-engknoppurt-20261101.json"));
const item = doc.items[0], id = "emne_flora_engknoppurt";
assert.equal(doc.schema, "history-go-flora-single-species-review-v1");
assert.equal(doc.items.length, 1);
assert.equal(doc.baselineApproved, 23);
assert.equal(doc.approvedCountAfterRelease, 24);
assert.equal(item.catalogId, id);
assert.equal(item.scientificName, "Centaurea jacea");
assert.equal(item.reviewStatus, "approved");
assert.equal(item.botanicalVisualDecision, "visually_recognizable_field_guide_level");
assert.equal(item.approvedForPublication, true);
assert.equal(doc.rejectedPreviousCandidate.reviewStatus, "needs_redraw");
assert.equal(doc.rejectedPreviousCandidate.gitBlobSha, "14bfcd5847ea5bacd451069985837468f24a7c6b");
assert.equal(doc.rejectedPreviousCandidate.src.endsWith("02_engknoppurt_v1.webp"), true);
assert.equal(item.src.endsWith("02_engknoppurt_v2.webp"), true);
assert.equal(item.gitBlobSha, "c26069fcd15e182ccebca3ed52e9e88458005fc7");
assert.equal(item.sha256, "825820729b143d23fa38af05947177c1d77a77406f659afc420f9639a25bc35e");
assert(item.sourceReferences.length >= 2);
assert(item.observations.length > 150);
assert(item.limitations.length > 150);
assert(item.visualChecks.transparent && item.visualChecks.originalAlphaVerified);
assert(item.visualChecks.blackBackgroundReviewed && item.visualChecks.whiteBackgroundReviewed);
assert.deepEqual(item.publicationBlockedBy, []);

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
assert(approved.count >= 24, "Engknoppurt and its 23 predecessors must remain approved");
assert.equal(approved.get(id)?.src, item.src);
assert.equal(approved.get(id)?.gitBlobSha, item.gitBlobSha);

const data = fs.readFileSync(new URL(item.src, root));
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
console.log("Engknoppurt v2: exact WebP, alpha, catalog, photo fallback and 24 approvals verified.");
