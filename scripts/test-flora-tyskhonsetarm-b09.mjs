import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");
const doc = JSON.parse(read("data/natur/flora/illustration-quality-tyskhonsetarm-20261103.json"));
const item = doc.items[0];
const mainCatalog = JSON.parse(read("data/natur/flora/blomster.json"));
const runtime = JSON.parse(read("data/runtime/nature-all/flora-001.json")).flatMap(x => x.kind === "emne_pack" ? x.items : [x]);
assert.equal(doc.baselineApproved, 66);
assert.equal(doc.approvedCountAfterRelease, 67);
assert.equal(item.scientificName, "Stellaria pallida");
assert.equal(item.catalogId, "emne_flora_tyskhonsetarm");
const canonical = mainCatalog.find(x => x.id === item.catalogId);
assert(canonical, "Canonical species must exist");
assert.equal(canonical.latin, "Stellaria pallida");
assert(canonical.quiz_ids.includes("quiz_nature_flora_tyskhonsetarm"));
for (const id of [item.catalogId, "emne_flora_tysk_honsetarm"]) {
  const x = runtime.find(y => y.id === id);
  assert(x, "Keep existing catalog ID " + id);
  assert.equal(x.latin, "Stellaria pallida");
  assert(x.quiz_ids.length > 0);
}
const data = fs.readFileSync(new URL(item.src, root));
assert.equal(data.length, item.sizeBytes);
assert.equal(crypto.createHash("sha256").update(data).digest("hex"), item.sha256);
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob " + data.length), Buffer.from([0]), data])).digest("hex"), item.gitBlobSha);
assert.equal(data.toString("ascii", 0, 4), "RIFF");
assert.equal(data.toString("ascii", 8, 12), "WEBP");
assert.equal(data.toString("ascii", 12, 16), "VP8X");
assert((data[20] & 0x10) !== 0, "Transparent original required");
assert.deepEqual([1 + data.readUIntLE(24,3), 1 + data.readUIntLE(27,3)], [1024,1536]);
const env={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"), env);
const approved=env.window.HG_NATURE_FLORA_APPROVED;
assert.equal(approved.count, 67);
for (const id of [item.catalogId, "emne_flora_tysk_honsetarm"]) {
  assert.equal(approved.get(id)?.src, item.src);
  assert.equal(approved.get(id)?.gitBlobSha, item.gitBlobSha);
}
assert.equal(item.approvedForPublication, true);
console.log("Tysk honsetarm #67 exact WebP, canonical and legacy IDs, and approval verified.");
