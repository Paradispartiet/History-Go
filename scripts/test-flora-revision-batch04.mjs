import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";

const read = path=>fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");
const data = JSON.parse(read("data/natur/flora/illustration-revision-batch04.json"));
assert.equal(data.schema,"history-go-flora-revision-batch-v1");
assert.equal(data.batch,"04");
assert.equal(data.items.length,3);
assert.equal(data.releaseGate.allowedToPublish,false);
const approvedSandbox={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"),approvedSandbox,{timeout:1500});
const published=approvedSandbox.window.HG_NATURE_FLORA_APPROVED;
const catalog=JSON.parse(read("data/runtime/nature-all/flora-001.json")).flatMap(x=>x.kind==="emne_pack"?x.items:[x]);
const photos={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-photographs.js"),photos,{timeout:1500});
const allPhotos=photos.window.HG_NATURE_FLORA_PHOTOS;
const seen = new Set();
for (const p of data.items){
 assert(!seen.has(p.id)); seen.add(p.id);
 assert(!p.productionApproval,"unreviewed redraw must not auto-publish");
 assert.equal(p.keyTests.length,4);
 assert(p.sourceReferences.every(s=>s.startsWith("https://")));
 assert.equal(catalog.find(x=>x.id===p.id)?.latin,p.scientificName);
 assert(allPhotos.get(p.id),"documented photo fallback missing: "+p.id);
 assert.equal(published.has(p.id),false,"unapproved revision leaked into Finn Flora: "+p.id);
 const bytes=fs.readFileSync(new URL("../"+p.currentCandidate,import.meta.url));
 const sha=crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+bytes.length+"\0"),bytes])).digest("hex");
 assert.equal(sha,p.currentGitBlobSha,"baseline art mutated: "+p.id);
 assert.match(p.newFileName,/^[a-z]+_v3\.webp$/);
}
assert.equal(published.count,3,"previously released flora changed during pending redesign");
console.log("Flora revision batch04: 3 redraw proposals verified, species IDs and photo fallback intact, no accidental publications.");
