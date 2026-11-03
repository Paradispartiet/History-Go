import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const doc = JSON.parse(read("data/natur/flora/illustration-quality-skogstorkenebb-20261103.json"));
const a = doc.items[0], id = "emne_flora_skogstorkenebb";
assert.equal(doc.baselineApproved, 56);
assert.equal(doc.approvedCountAfterRelease, 57);
assert.equal(a.catalogId,id);
assert.equal(a.scientificName,"Geranium sylvaticum");
const catalog = JSON.parse(read("data/natur/flora/blomster.json")).find(x=>x.id===id);
const runtime = JSON.parse(read("data/runtime/nature-all/flora-001.json"))
  .flatMap(x=>x.kind==="emne_pack"?x.items:[x]).find(x=>x.id===id);
for(const x of [catalog,runtime]) {
  assert(x, "Missing canonical catalog/runtime entry");
  assert.equal(x.latin,"Geranium sylvaticum");
  assert.equal(x.title,"Skogstorkenebb");
}
assert.equal(a.approvedForPublication,true,"Illustration must be botanically approved before release");
const src = new URL(a.src,root);
assert(fs.existsSync(src),"Original skogstorkenebb WebP is not committed");
const b = fs.readFileSync(src);
assert.equal(b.length,a.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),a.sha256);
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),a.gitBlobSha);
assert.equal(b.toString("ascii",0,4),"RIFF");
assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");
assert((b[20]&0x10)!==0,"WebP alpha required");
assert.deepEqual([1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)],a.dimensions);
console.log("Skogstorkenebb #57: original byte hashes, dimensions, alpha and species linkage verified");
