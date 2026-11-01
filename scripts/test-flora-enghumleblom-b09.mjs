import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), "utf8");
const doc = JSON.parse(read("data/natur/flora/illustration-quality-enghumleblom-20261101.json"));
const species = doc.items[0];
const id = "emne_flora_enghumleblom";

assert.equal(doc.schema, "history-go-flora-single-species-review-v1");
assert.equal(doc.items.length, 1);
assert.equal(doc.baselineApproved, 22);
assert.equal(doc.approvedCountAfterRelease, 23);
assert.equal(species.catalogId, id);
assert.equal(species.scientificName, "Geum rivale");
assert(species.sourceReferences.length >= 2);
assert(species.observations.length > 150);
assert(species.limitations.length > 100);

const catalog = JSON.parse(read("data/natur/flora/blomster.json"));
const runtime = JSON.parse(read("data/runtime/nature-all/flora-001.json"))
  .flatMap(x => x.kind === "emne_pack" ? x.items : [x]);
assert.equal(catalog.find(x => x.id === id)?.latin, species.scientificName);
assert.equal(runtime.find(x => x.id === id)?.latin, species.scientificName);

const photos = {window: {}};
vm.runInNewContext(read("js/ui/nature-flora-photographs.js"), photos);
assert.equal(photos.window.HG_NATURE_FLORA_PHOTOS.get(id)?.scientificName, species.scientificName);

const ctx = {window: {}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"), ctx);
const approved = ctx.window.HG_NATURE_FLORA_APPROVED;
assert.equal(approved.count, species.approvedForPublication ? 23 : 22);

const file = new URL(species.src, root);
if (!fs.existsSync(file)) {
  assert.equal(species.approvedForPublication, false,
    "Cannot approve missing WebP. Transfer the exact file before activation.");
  assert.equal(approved.has(id), false,
    "Missing candidate must not be activated in the public registry.");
  assert(species.publicationBlockedBy.includes("binary_not_uploaded"));
  console.log("Enghumleblom: candidate metadata valid; WebP absent; 22 approvals retained.");
} else {
  const b = fs.readFileSync(file);
  assert.equal(b.length, species.sizeBytes);
  assert.equal(crypto.createHash("sha256").update(b).digest("hex"), species.sha256);
  const gitBlob = crypto.createHash("sha1").update(
    Buffer.concat([Buffer.from(`blob ${b.length}\0`), b])
  ).digest("hex");
  assert.equal(gitBlob, species.gitBlobSha);
  assert.equal(b.toString("ascii", 0, 4), "RIFF");
  assert.equal(b.toString("ascii", 8, 12), "WEBP");
  assert.equal(b.toString("ascii", 12, 16), "VP8X");
  assert((b[20] & 0x10) !== 0, "WebP alpha channel missing");
  assert.deepEqual([1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)], species.dimensions);
  if (species.approvedForPublication) {
    assert.equal(species.reviewStatus, "approved");
    assert.deepEqual(species.publicationBlockedBy ?? [], []);
    assert.equal(approved.get(id)?.src, species.src);
    assert.equal(approved.get(id)?.gitBlobSha, species.gitBlobSha);
  } else {
    assert.equal(approved.has(id), false, "Unapproved image must remain unpublished");
  }
  console.log("Enghumleblom: exact WebP byte/hash/alpha/dimensions verified.");
}
