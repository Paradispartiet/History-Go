import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const doc = JSON.parse(read("data/natur/flora/illustration-quality-smaengkall-20261103.json"));
const a = doc.items[0], id = "emne_flora_smaengkall";
assert.equal(doc.baselineApproved, 59);
assert.equal(doc.approvedCountAfterRelease, 60);
assert.equal(doc.items.length, 1);
assert.equal(a.catalogId, id);
assert.equal(a.scientificName, "Rhinanthus minor");
assert.equal(a.approvedForPublication, true);
assert.equal(a.reviewStatus, "approved");
const cat = JSON.parse(read("data/natur/flora/blomster.json")).find(x => x.id === id);
const runtime = JSON.parse(read("data/runtime/nature-all/flora-001.json"))
  .flatMap(x => x.kind === "emne_pack" ? x.items : [x]).find(x => x.id === id);
for (const x of [cat, runtime]) {
  assert(x, "Missing canonical Småengkall catalog/runtime entry");
  assert.equal(x.title, "Småengkall");
  assert.equal(x.latin, "Rhinanthus minor");
  assert.equal(x.taxonomy.latin_navn, "Rhinanthus minor");
  assert.equal(x.taxonomy.familie, "Orobanchaceae");
}
const b = fs.readFileSync(new URL(a.src, root));
assert.equal(b.length, a.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"), a.sha256);
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"), a.gitBlobSha);
assert.equal(b.toString("ascii",0,4), "RIFF");
assert.equal(b.toString("ascii",8,12), "WEBP");
assert.equal(b.toString("ascii",12,16), "VP8X");
assert((b[20] & 0x10) !== 0, "Original WebP transparency required");
assert.deepEqual([1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)], a.dimensions);
assert(a.visualChecks.blackBackgroundReviewed && a.visualChecks.fullImageReviewed);
const env={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"),env,{timeout:2000});
const approved = env.window.HG_NATURE_FLORA_APPROVED;
assert(approved?.count >= 60, "Småengkall must remain among the approved illustrations");
assert.equal(approved.get(id)?.src,a.src);
assert.equal(approved.get(id)?.gitBlobSha,a.gitBlobSha);
assert(read("finn-flora.html").includes("nature-flora-approved.js"));
console.log("Småengkall #60: canonical taxonomy, source WebP, alpha, SHA256/Git SHA, registry and 60 approved artworks verified.");
