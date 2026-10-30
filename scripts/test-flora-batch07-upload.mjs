// Finn Flora batch 07: validate staged WebP assets without activating them.
// Default mode passes while the binaries are still outside GitHub.
// --require-assets must pass before enabling illustrations.
// --require-published must pass after registering the two approved species.
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const base = new URL("../", import.meta.url);
const read = path => fs.readFileSync(new URL(path, base), "utf8");
const review = JSON.parse(read("data/natur/flora/illustration-quality-batch07-20261028.json"));
const candidates = review.localCandidateAssets?.candidates || [];
assert.equal(candidates.length, 2, "Expected precisely two batch-07 transfer candidates");

const source = JSON.parse(read("data/natur/flora/blomster.json"));
const runtime = JSON.parse(read("data/runtime/nature-all/flora-001.json"))
  .flatMap(a => a.kind === "emne_pack" ? a.items : [a]);

const approvalContext = {window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"), approvalContext);
const approved = approvalContext.window.HG_NATURE_FLORA_APPROVED;
const photoContext = {window:{}};
vm.runInNewContext(read("js/ui/nature-flora-photographs.js"), photoContext);
const photos = photoContext.window.HG_NATURE_FLORA_PHOTOS;

const requireAssets = process.argv.includes("--require-assets") || process.argv.includes("--require-published");
const requirePublished = process.argv.includes("--require-published");
let present = 0;
let publishedCount = 0;
for (const candidate of candidates) {
  const {catalogId,scientificName,suggestedPath,dimensions,sizeBytes,sha256,gitBlobSha} = candidate;
  assert(/^emne_flora_[a-z]+$/.test(catalogId), "Unexpected catalog ID");
  assert(suggestedPath.startsWith("bilder/natur/flora/illustrasjonskandidater/b07/"));
  const sourceSpecies = source.find(x => x.id === catalogId);
  const runtimeSpecies = runtime.find(x => x.id === catalogId);
  assert.equal(sourceSpecies?.latin, scientificName, "Canonical flora mismatch: " + catalogId);
  assert.equal(runtimeSpecies?.latin, scientificName, "Runtime mismatch: " + catalogId);
  assert.equal(photos.get(catalogId)?.scientificName, scientificName,
    "No licensed, attributed photograph fallback for " + catalogId);
  assert(candidate.sourceReferences?.length >= 2, "Too few botanical references: " + catalogId);
  const reviewItem = review.items.find(x => x.catalogId === catalogId);
  assert(reviewItem, "No botanical review: " + catalogId);
  assert.equal(reviewItem.scientificName, scientificName);

  const registered = approved.get(catalogId);
  const published = Boolean(registered || reviewItem.approvedForPublication);
  assert.equal(Boolean(registered), Boolean(reviewItem.approvedForPublication),
    catalogId + " registry/review disagreement");
  if (requirePublished) assert(published, "Not yet published: " + catalogId);
  if (published) {
    publishedCount++;
    assert.equal(registered?.src, suggestedPath, catalogId + " approved path mismatch");
    assert.equal(registered?.gitBlobSha, gitBlobSha, catalogId + " approved hash mismatch");
    assert.equal(registered?.scientificName, scientificName);
  }

  const url = new URL(suggestedPath, base);
  if (!fs.existsSync(url)) {
    assert(!(requireAssets || published), "Missing staged WebP: " + suggestedPath);
    console.log(catalogId + ": awaiting image transfer (safe, not published)");
    continue;
  }
  const binary = fs.readFileSync(url);
  assert.equal(binary.length, sizeBytes, "Size mismatch: " + catalogId);
  assert.equal(crypto.createHash("sha256").update(binary).digest("hex"), sha256,
    "SHA-256 mismatch: " + catalogId);
  const gitContent = Buffer.concat([
    Buffer.from("blob " + binary.length + "\0"),binary
  ]);
  assert.equal(crypto.createHash("sha1").update(gitContent).digest("hex"), gitBlobSha,
    "Git blob SHA mismatch: " + catalogId);
  assert.equal(binary.toString("ascii", 0, 4), "RIFF");
  assert.equal(binary.toString("ascii", 8, 12), "WEBP");
  assert.equal(binary.toString("ascii", 12, 16), "VP8X");
  assert((binary[20] & 0x10) !== 0, "Missing transparency: " + catalogId);
  const size = [1+binary.readUIntLE(24,3),1+binary.readUIntLE(27,3)];
  assert.deepEqual(size, dimensions, "Dimensions mismatch: " + catalogId);
  present++;
  console.log(catalogId + ": verified image bytes, WebP alpha, dimensions, catalog and credited photo");
}
const redraw=review.localCandidateAssets?.redrawCandidate;
assert(redraw && redraw.catalogId==="emne_flora_tiriltunge","Missing newly approved tiriltunge v2");
const oldRejected="bilder/natur/flora/illustrasjonskandidater/b06/04_tiriltunge.webp";
const newApproved=approved.get(redraw.catalogId);
const redrawReview=review.items.find(x=>x.catalogId===redraw.catalogId);
assert(newApproved && newApproved.src===redraw.suggestedPath && newApproved.gitBlobSha===redraw.gitBlobSha);
assert(redrawReview?.reviewStatus==="approved" && redrawReview.approvedForPublication===true);
assert.notEqual(newApproved.src,oldRejected,"Do not activate historical rejected image");
assert.equal(source.find(x=>x.id===redraw.catalogId)?.latin,redraw.scientificName);
assert.equal(runtime.find(x=>x.id===redraw.catalogId)?.latin,redraw.scientificName);
assert.equal(photos.get(redraw.catalogId)?.scientificName,redraw.scientificName);
const v2=fs.readFileSync(new URL(redraw.suggestedPath,base));
assert.equal(v2.length,redraw.sizeBytes);
assert.equal(crypto.createHash("sha256").update(v2).digest("hex"),redraw.sha256);
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+v2.length+"\\0"),v2])).digest("hex"),redraw.gitBlobSha);
assert.equal(v2.toString("ascii",0,4),"RIFF");
assert.equal(v2.toString("ascii",8,12),"WEBP");
assert.equal(v2.toString("ascii",12,16),"VP8X");
assert((v2[20]&0x10)!==0,"Missing transparency for tiriltunge v2");
assert.deepEqual([1+v2.readUIntLE(24,3),1+v2.readUIntLE(27,3)],redraw.dimensions);
console.log("Tiriltunge v2: new validated WebP active, old b06 image still rejected");
console.log("Batch 07 transfer: " + present + "/2 exact WebP binaries; " + publishedCount + "/2 activated");
