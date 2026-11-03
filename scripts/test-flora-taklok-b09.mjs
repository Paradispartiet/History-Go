import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),"utf8");
const doc=JSON.parse(read("data/natur/flora/illustration-quality-taklok-20261103.json"));
const a=doc.items[0],id="emne_flora_taklok";
assert.equal(doc.baselineApproved,63);
assert.equal(doc.approvedCountAfterRelease,64);
assert.equal(a.catalogId,id);
assert.equal(a.scientificName,"Sempervivum spp.");
assert.equal(a.illustratedScientificName,"Sempervivum tectorum");
assert.equal(a.taxonomicScope,"representative_of_Sempervivum_tectorum_within_Sempervivum_spp");
for(const x of [
  JSON.parse(read("data/natur/flora/blomster.json")).find(z=>z.id===id),
  JSON.parse(read("data/runtime/nature-all/flora-001.json")).flatMap(z=>z.kind==="emne_pack"?z.items:[z]).find(z=>z.id===id)
]){
  assert(x,"Missing canonical takløk entry");
  assert.equal(x.title,"Takløk");
  assert.equal(x.latin,"Sempervivum spp.");
  assert.equal(x.taxonomy.familie,"Crassulaceae");
  assert(x.quiz_ids?.includes("quiz_nature_flora_taklok"));
}
assert.equal(a.approvedForPublication,true);
assert.equal(a.reviewStatus,"approved");
const b=fs.readFileSync(new URL(a.src,root));
assert.equal(b.length,a.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),a.sha256);
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),a.gitBlobSha);
assert.equal(b.toString("ascii",0,4),"RIFF");
assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");
assert((b[20]&0x10)!==0,"Original alpha required");
assert.deepEqual([1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)],[1024,1536]);
assert(a.visualChecks.blackBackgroundReviewed&&a.visualChecks.fullImageReviewed);
const env={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"),env,{timeout:2000});
const approved=env.window.HG_NATURE_FLORA_APPROVED;
assert.equal(approved.count,64);
assert.equal(approved.get(id)?.scientificName,a.scientificName);
assert.equal(approved.get(id)?.src,a.src);
assert.equal(approved.get(id)?.gitBlobSha,a.gitBlobSha);
console.log("Takløk #64: botanical representative, exact WebP SHA and alpha, stable canonical catalog.");
