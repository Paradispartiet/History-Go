import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const doc = JSON.parse(read("data/natur/flora/illustration-quality-skogfiol-20261103.json"));
const a = doc.items[0];
const id = "emne_flora_skogfiol";

assert.equal(doc.baselineApproved, 55);
assert.equal(doc.approvedCountAfterRelease, 56);
assert.equal(doc.items.length, 1);
assert.equal(a.catalogId, id);
assert.equal(a.scientificName, "Viola riviniana");
assert.equal(a.dimensions.join("x"), "1024x1536");
assert.equal(a.approvedForPublication, true, "Skogfiol is not approved for publication");

const catalog = JSON.parse(read("data/natur/flora/blomster.json")).find(x => x.id === id);
const runtime = JSON.parse(read("data/runtime/nature-all/flora-001.json"))
  .flatMap(x => x.kind === "emne_pack" ? x.items : [x]).find(x => x.id === id);
for (const x of [catalog, runtime]) {
  assert(x, "Missing canonical catalog/runtime entry for Skogfiol");
  assert.equal(x.latin, "Viola riviniana");
  assert.equal(x.title, "Skogfiol");
}

const src = new URL(a.src, root);
assert(fs.existsSync(src), "Skogfiol original WebP has NOT been committed to this PR");
const b = fs.readFileSync(src);
assert.equal(b.length, a.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"), a.sha256);
assert.equal(
  crypto.createHash("sha1").update(
    Buffer.concat([Buffer.from("blob " + b.length), Buffer.from([0]), b])
  ).digest("hex"),
  a.gitBlobSha
);
assert.equal(b.toString("ascii", 0, 4), "RIFF");
assert.equal(b.toString("ascii", 8, 12), "WEBP");
assert.equal(b.toString("ascii", 12, 16), "VP8X");
assert((b[20] & 0x10) !== 0, "WebP must have alpha transparency");
assert.deepEqual([1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)], a.dimensions);
assert(a.visualChecks.blackBackgroundReviewed, "Black-background QA missing");
assert(a.visualChecks.fullImageReviewed, "Full-image QA missing");

const env = { window: {} };
vm.runInNewContext(read("js/ui/nature-flora-approved.js"), env);
const approved = env.window.HG_NATURE_FLORA_APPROVED;
assert(approved, "Approved registry missing");
assert.equal(approved.get(id)?.src, a.src, "Skogfiol image is not linked to approved registry");
assert.equal(approved.get(id)?.gitBlobSha, a.gitBlobSha);
assert(approved.count >= 56, "Skogfiol must remain in the approved species registry");
const html = read("finn-flora.html");
assert(html.includes("nature-flora-approved.js"), "Flora page has not linked approved registry");
console.log("Skogfiol #56 exact WebP, true alpha, SHA256, Git SHA, species records, registry and black display verified.");
