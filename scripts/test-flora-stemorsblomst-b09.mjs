import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),"utf8");
const doc=JSON.parse(read("data/natur/flora/illustration-quality-stemorsblomst-20261103.json"));
const a=doc.items[0],id="emne_flora_stemorsblomst_forvillet";
assert.equal(doc.baselineApproved,61);
assert.equal(doc.approvedCountAfterRelease,62);
assert.equal(a.catalogId,id);
assert.equal(a.scientificName,"Viola tricolor m.fl.");
assert.equal(a.illustratedScientificName,"Viola tricolor");
assert.equal(a.approvedForPublication,true);
assert.equal(a.reviewStatus,"approved");
for(const x of [
  JSON.parse(read("data/natur/flora/blomster.json")).find(z=>z.id===id),
  JSON.parse(read("data/runtime/nature-all/flora-001.json")).flatMap(z=>z.kind==="emne_pack"?z.items:[z]).find(z=>z.id===id)
]){
  assert(x,"Missing canonical forvillet Stemorsblomst entry");
  assert.equal(x.title,"Stemorsblomst (forvillet)");
  assert.equal(x.latin,"Viola tricolor m.fl.");
  assert.equal(x.taxonomy.familie,"Violaceae");
}
assert.equal(a.taxonomicScope,"representative_of_violatricolor_and_related_feral_pansies");
const b=fs.readFileSync(new URL(a.src,root));
assert.equal(b.length,a.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),a.sha256);
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),a.gitBlobSha);
assert.equal(b.toString("ascii",0,4),"RIFF");
assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");
assert((b[20]&0x10)!==0,"Original alpha required");
assert.deepEqual([1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)],a.dimensions);
assert(a.visualChecks.blackBackgroundReviewed&&a.visualChecks.fullImageReviewed);
const env={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"),env,{timeout:2000});
const approved=env.window.HG_NATURE_FLORA_APPROVED;
assert(approved?.count>=62,"Stemorsblomst must be included among approved illustrations");
assert.equal(approved.get(id)?.src,a.src);
assert.equal(approved.get(id)?.gitBlobSha,a.gitBlobSha);
assert(read("finn-flora.html").includes("nature-flora-approved.js"));
console.log("Stemorsblomst #62: Viola tricolor representative, original WebP alpha and exact hashes, stable catalog and approved image.");
