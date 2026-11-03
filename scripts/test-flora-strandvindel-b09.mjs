import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),"utf8");
const doc=JSON.parse(read("data/natur/flora/illustration-quality-strandvindel-20261103.json"));
const a=doc.items[0],id="emne_flora_strandvindel";
assert.equal(doc.baselineApproved,62);
assert.equal(doc.approvedCountAfterRelease,63);
assert.equal(a.catalogId,id);
assert.equal(a.scientificName,"Calystegia sepium");
for(const x of [
  JSON.parse(read("data/natur/flora/blomster.json")).find(z=>z.id===id),
  JSON.parse(read("data/runtime/nature-all/flora-001.json")).flatMap(z=>z.kind==="emne_pack"?z.items:[z]).find(z=>z.id===id)
]){
  assert(x,"Missing canonical strandvindel entry");
  assert.equal(x.title,"Strandvindel");
  assert.equal(x.latin,"Calystegia sepium");
  assert.equal(x.taxonomy.familie,"Convolvulaceae");
}
const b=fs.readFileSync(new URL(a.src,root));
assert.equal(b.length,a.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),a.sha256);
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),a.gitBlobSha);
assert.equal(b.toString("ascii",0,4),"RIFF");
assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");
assert((b[20]&0x10)!==0,"Original alpha required");
assert.deepEqual([1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)],[1024,1536]);
const env={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"),env,{timeout:2000});
const approved=env.window.HG_NATURE_FLORA_APPROVED;
assert.equal(a.approvedForPublication,true,"Requires explicit approval after original upload");
assert.equal(approved.count,63);
assert.equal(approved.get(id)?.src,a.src);
assert.equal(approved.get(id)?.gitBlobSha,a.gitBlobSha);
console.log("Strandvindel #63: complete botanic and binary approval verified.");
